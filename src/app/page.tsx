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
  
  // 🚨 [추가 완료] 잃어버렸던 검색어 상태 관리 부활!
  const [searchTerm, setSearchTerm] = useState('');

  // 1. 데이터 불러오기 및 최신순 정렬
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const data = querySnapshot.docs.map(doc => ({
          ...doc.data()
        }));
        
        // 🚨 [핵심 해결] updatedAt 기준으로 최신순(내림차순) 정렬! (없으면 0 처리)
        data.sort((a: any, b: any) => (b.updatedAt || 0) - (a.updatedAt || 0));
        
        setProducts(data);
        setIsLoading(false);
      } catch (err) {
        console.error("데이터 로딩 실패:", err);
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

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen font-bold text-orange-500 bg-slate-900">상품을 불러오는 중입니다... 🚀</div>;
  }

  if (products.length === 0) {
    return <div className="text-center mt-20 font-bold text-slate-300 bg-slate-900 h-screen pt-10">등록된 상품이 없습니다!</div>;
  }

  // 🚨 [추가 완료] 검색어 기반 필터링 로직 부활!
  const filteredProducts = products.filter((p) => {
    const safeName = p.name || "";
    return safeName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // 검색어가 있으면 검색 결과를, 없으면 메인 상품을 제외한 전체를 보여줌
  const recommendedProducts = searchTerm 
    ? filteredProducts 
    : products.filter((p) => p.id !== heroProduct?.id);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-900 pb-20 font-sans text-slate-100 shadow-2xl">
      
      <header className="bg-black text-white text-center py-4 font-bold text-lg tracking-wide border-b border-slate-800 shadow-md">
        ⚡ TODAY HOT DEAL ⚡
      </header>

      {/* 🚨 검색 중이 아닐 때만 메인 히어로 상품 노출 */}
      {!searchTerm && heroProduct && (
        <section className="bg-slate-800 p-5 mb-4 shadow-xl border-b border-slate-700">
          <div className="bg-orange-500/20 text-orange-400 text-xs font-bold px-2 py-1 inline-block rounded mb-3 border border-orange-500/30">
            🔥포스팅은 쿠팡파트너스 활동으로 일정 수수료를 받습니다.

          </div>
          
          {/* 🚨 [아이폰 보안 해결] target="_blank"와 짝꿍인 rel="noopener noreferrer" 필수 추가 */}
          <a 
            href={heroProduct.affiliateLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={() => sendGAEvent({ event: 'hero_image_click', value: heroProduct.name })}
            className="block group"
          >
            <img 
              src={heroProduct.imageUrl} 
              alt={heroProduct.name} 
              className="w-full h-64 object-cover rounded-xl mb-4 shadow-lg border border-slate-700 group-hover:opacity-80 transition-opacity" 
            />
          </a>

          <h1 className="text-xl font-bold text-white mb-2 leading-tight">{heroProduct.name}</h1>
          <div className="flex items-end gap-2 mb-5">
            <span className="text-3xl font-extrabold text-orange-500">{heroProduct.price}</span>
            <span className="text-sm text-slate-400 line-through mb-1">{heroProduct.originalPrice}</span>
          </div>
          
          <a 
            href={heroProduct.affiliateLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={() => sendGAEvent({ event: 'buy_button_click', value: heroProduct.name })}
            className="block w-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-[0_0_15px_rgba(249,115,22,0.4)]"
          >
            인기 꿀템 확인하러 가기 🚀
          </a>
        </section>
      )}

      {/* 추천 상품 및 검색 결과 영역 */}
      <section className="p-5">
        
        {/* 🚨 [추가 완료] 실시간 검색창 UI 부활! */}
        <div className="mb-6">
          <input 
            type="text" 
            placeholder="🔍 상품명으로 바로 찾으세요!"
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
            <a 
              key={index} 
              href={product.affiliateLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={() => sendGAEvent({ event: 'recommend_click', value: product.name })}
              className="bg-slate-800 rounded-xl p-3 shadow-md border border-slate-700 hover:border-orange-500 transition-colors block group"
            >
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-32 object-cover rounded-lg mb-3 opacity-90 group-hover:opacity-100 transition-opacity bg-slate-900" 
              />
              <h3 className="text-sm font-semibold text-slate-200 truncate">{product.name}</h3>
              <p className="text-orange-400 font-bold mt-1">{product.price}</p>
            </a>
          ))}
        </div>
        
        {/* 검색 결과가 없을 때 안내 문구 */}
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
    <Suspense fallback={<div className="text-center mt-20 text-slate-300">로딩중...</div>}>
      <ProductContent />
    </Suspense>
  );
}