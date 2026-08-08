"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from './firebase'; 
import { sendGAEvent } from '@next/third-parties/google'; 

function ProductContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const data = querySnapshot.docs.map(doc => ({ ...doc.data() }));
        // 핵심 로직 유지: 최신순 정렬
        data.sort((a: any, b: any) => (b.updatedAt || 0) - (a.updatedAt || 0));
        setProducts(data);
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const heroProduct = products.find((p) => p.id === id) || products[0];

  useEffect(() => {
    if (heroProduct && heroProduct.name) {
      document.title = heroProduct.name;
    }
  }, [heroProduct]);

  if (isLoading) return <div className="flex justify-center items-center h-screen bg-slate-900 text-orange-500 font-bold">상품을 불러오는 중입니다... 🚀</div>;
  if (products.length === 0) return <div className="text-center h-screen pt-10 bg-slate-900 text-slate-300 font-bold">등록된 상품이 없습니다!</div>;

  // 핵심 로직 유지: 검색어 필터링 방어 로직
  const filteredProducts = products.filter((p) => {
    const safeName = p.name || "";
    return safeName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const recommendedProducts = searchTerm 
    ? filteredProducts 
    : products.filter((p) => p.id !== heroProduct?.id);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-900 pb-20 text-slate-100 font-sans shadow-2xl">
      <header className="bg-black text-center py-4 font-extrabold tracking-wide border-b border-slate-800 shadow-sm text-white">
        ⚡ TODAY HOT DEAL ⚡
      </header>
      
      {!searchTerm && heroProduct && (
        <section className="bg-slate-800 p-5 mb-4 shadow-sm border-b border-slate-700">
          <div className="bg-orange-500/20 text-orange-400 text-xs font-bold px-2 py-1 inline-block rounded mb-3 border border-orange-500/30">🔥이 포스팅은 쿠팡파트너스 활동으로 일정 수수료를 받습니다.

</div>
          <a href={heroProduct.affiliateLink} target="_blank" onClick={() => sendGAEvent({ event: 'hero_image_click', value: heroProduct.name })} className="block group">
            <img src={heroProduct.imageUrl} alt={heroProduct.name} className="w-full h-64 object-cover rounded-xl mb-4 shadow-sm border border-slate-700 group-hover:opacity-90 transition-opacity" />
          </a>
          <h1 className="text-xl font-bold mb-2 text-white">{heroProduct.name}</h1>
          <div className="flex items-end gap-2 mb-5">
            <span className="text-3xl font-extrabold text-orange-500">{heroProduct.price}</span>
          </div>
          <a href={heroProduct.affiliateLink} target="_blank" onClick={() => sendGAEvent({ event: 'buy_button_click', value: heroProduct.name })} className="block w-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-md">
            인기 꿀템 확인하러 가기 🚀
          </a>
        </section>
      )}

      <section className="p-5">
        <div className="mb-6">
          <input 
            type="text" 
            placeholder="🔍 상품명 또는 번호로 바로 찾으세요!"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-orange-500 focus:outline-none placeholder-slate-400 shadow-sm transition-all"
          />
        </div>

        <h2 className="text-lg font-bold text-slate-200 mb-4">
          {searchTerm ? `🔍 '${searchTerm}' 검색 결과` : "👀 지금 뜨고 있는 다른 꿀템"}
        </h2>
        
        <div className="grid grid-cols-2 gap-3">
          {recommendedProducts.map((product, index) => (
            <a key={index} href={product.affiliateLink} target="_blank" onClick={() => sendGAEvent({ event: 'recommend_click', value: product.name })} className="bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-700 hover:border-orange-500 transition-all block group">
              <img src={product.imageUrl} alt={product.name} className="w-full h-32 object-cover rounded-lg mb-3 opacity-90 group-hover:opacity-100 transition-opacity bg-slate-900" />
              <h3 className="text-sm font-semibold text-slate-200 truncate">{product.name}</h3>
              <p className="text-orange-400 font-bold mt-1">{product.price}</p>
            </a>
          ))}
        </div>
        
        {searchTerm && recommendedProducts.length === 0 && (
          <div className="text-center py-10 text-slate-400 font-bold bg-slate-800 rounded-xl border border-slate-700">
            검색하신 상품이 없습니다. 🥲
          </div>
        )}
      </section>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center mt-20 text-slate-400">로딩중...</div>}>
      <ProductContent />
    </Suspense>
  );
}