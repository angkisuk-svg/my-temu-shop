"use client";

import { useState, useEffect } from 'react';
import { doc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore"; 
import { db } from '../firebase'; 

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [fetchTrigger, setFetchTrigger] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '', name: '', category: '', price: '', originalPrice: '', imageUrl: '', affiliateLink: ''
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const data = querySnapshot.docs.map(doc => ({ ...doc.data() }));
        setProducts(data);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      }
    };
    fetchProducts();
  }, [isAuthenticated, fetchTrigger]); 

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === (process.env.NEXT_PUBLIC_ADMIN_PASS || 'ss2658817@')) { 
      setIsAuthenticated(true);
    } else {
      alert('비밀번호가 틀렸습니다!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const safeId = formData.id.trim();
      const dataToSave = { ...formData, id: safeId };
      await setDoc(doc(db, "products", safeId), dataToSave);
      alert(`🎉 [${dataToSave.name}] 상품 정보가 저장되었습니다!`);
      setFormData({ id: '', name: '', category: '', price: '', originalPrice: '', imageUrl: '', affiliateLink: '' });
      setIsEditing(false); 
      setFetchTrigger(!fetchTrigger); 
    } catch (error) {
      alert('상품 저장에 실패했습니다.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const userInput = prompt(`[보안 확인] 삭제하려면 "${name}"을 정확히 입력하세요.`);
    if (userInput !== name) {
      alert("입력값이 일치하지 않습니다. 삭제를 취소합니다.");
      return;
    }
    try {
      await deleteDoc(doc(db, "products", id));
      alert('삭제가 완료되었습니다.');
      setFetchTrigger(!fetchTrigger); 
    } catch (error) {
      alert('삭제에 실패했습니다.');
    }
  };

  const handleEdit = (product: any) => {
    setFormData(product);
    setIsEditing(true); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (e.target.name === 'id') value = value.replace(/\s/g, ''); 
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleCopyLink = (id: string) => {
    // 🚨 브랜드 도메인(sns10) 적용 완료!
    const fullUrl = `https://sns10.vercel.app/?id=${id}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      alert(`🔗 복사 완료: ${fullUrl}`);
    });
  };

   const lastUsedId = products.length > 0 
    ? products.map(p => p.id).sort((a, b) => b.localeCompare(a))[0] 
    : '없음';

   // 🚨 추가된 로직: 화면에 보여줄 상품 목록을 최신순(내림차순)으로 정렬하기
  const sortedProducts = [...products].sort((a, b) => 
    String(b.id).localeCompare(String(a.id), undefined, { numeric: true })
  );

  // 1. 로그인 화면 (접속 전)
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100 px-4">
        <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-sm">
          <div className="flex justify-center mb-4"><span className="text-4xl">🔐</span></div>
          <h2 className="text-xl font-bold mb-6 text-center text-white">관리자 시스템</h2>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 입력" className="w-full bg-slate-900 border border-slate-600 p-3 mb-6 rounded-lg text-white focus:outline-none focus:border-orange-500" />
          <button type="submit" className="w-full bg-orange-500 text-white p-3 rounded-lg font-bold hover:bg-orange-600 transition-colors">접속하기</button>
        </form>
      </div>
    );
  }

  // 2. 관리자 메인 화면 (접속 후 통합 UI)
  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-slate-900 p-6 font-sans text-slate-100">
      
      {/* --- 타이틀 --- */}
      <div className="border-b border-slate-700 pb-4 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>⚙️</span> 상품 등록 및 수정
          </h1>
        </div>
      </div>

       {/* 🚨 추가된 UI: 최근 등록된 상품 번호 안내 패널 */}
      <div className="mb-4 p-4 bg-slate-800 border border-slate-600 rounded-lg flex items-center gap-3 shadow-md">
        <span className="text-2xl">💡</span>
        <p className="text-sm text-slate-300">
          가장 최근에 등록된 고유 ID는 <span className="text-orange-400 font-bold text-lg">{lastUsedId}</span> 입니다. 
          <span className="text-slate-400 ml-1">이어서 다음 번호를 입력해 주세요.</span>
        </p>
      </div>

      {/* --- 상품 입력 폼 --- */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 mb-12 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
        <div>
          <label className="text-xs font-bold text-slate-400 mb-1 block">
            고유 ID <span className="font-normal text-slate-500">(미리보기: https://sns10.vercel.app/?id=<span className="text-orange-400 font-bold">{formData.id || '...'}</span>)</span>
          </label>
          <input required type="text" name="id" value={formData.id} onChange={handleChange} readOnly={isEditing}
            className={`w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none ${isEditing ? 'opacity-50 cursor-not-allowed' : 'focus:border-orange-500'}`}
            placeholder="예: 0001"/>
          {isEditing && (
            <p className="text-xs text-orange-400 mt-1 font-bold">※ 수정 중에는 고유 ID를 변경할 수 없습니다.</p>
          )}
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 mb-1 block">상품명</label>
          <input required type="text" name="name" value={formData.name} onChange={handleChange}
            className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
            placeholder="예: [품절대란] 1초 완성 야채 다지기"/>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 mb-1 block">카테고리</label>
          <input required type="text" name="category" value={formData.category} onChange={handleChange}
            className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
            placeholder="예: 주방용품"/>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-400 mb-1 block">할인가</label>
            <input required type="text" name="price" value={formData.price} onChange={handleChange}
              className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
              placeholder="예: 3,500원"/>
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-400 mb-1 block">원가</label>
            <input required type="text" name="originalPrice" value={formData.originalPrice} onChange={handleChange}
              className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
              placeholder="예: 15,000원"/>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 mb-1 block">이미지 주소 (URL)</label>
          <input required type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange}
            className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
            placeholder="이미지 URL을 붙여넣으세요"/>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 mb-1 block">나만의 수익 링크 (어필리에이트)</label>
          <input required type="url" name="affiliateLink" value={formData.affiliateLink} onChange={handleChange}
            className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
            placeholder="테무/쿠팡 단축 링크를 붙여넣으세요"/>
        </div>

        <button type="submit" className="w-full mt-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 rounded-lg shadow-lg hover:from-orange-600 hover:to-red-600 transition-all">
          확인 / 저장 🚀
        </button>
      </form>

      {/* --- 등록된 상품 리스트 --- */}
      <div className="border-b border-slate-700 pb-4 mb-6 mt-10">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>📦</span> 등록된 상품 관리
        </h2>
        <p className="text-slate-400 text-sm mt-1">총 {products.length}개의 상품이 등록되어 있습니다.</p>
      </div>

      <div className="flex flex-col gap-3 mb-12">
        {sortedProducts.map((product) => (
          <div key={product.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center hover:border-slate-500 transition-colors">
            <div className="flex items-center gap-4 overflow-hidden">
              <img src={product.imageUrl} alt={product.name} className="w-14 h-14 rounded-lg object-cover bg-slate-900 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-orange-400 font-bold mb-1">{product.id}</span>
                <span className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-[300px]">{product.name}</span>
              </div>
            </div>

            <div className="flex gap-2 min-w-max ml-2">
              <button type="button" onClick={() => handleCopyLink(product.id)} className="text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-lg transition" title="접속 주소 복사">
                <span>🔗</span> 복사
              </button>
              <button type="button" onClick={() => handleEdit(product)} className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg transition">
                수정
              </button>
              <button type="button" onClick={() => handleDelete(product.id, product.name)} className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-3 py-2 rounded-lg transition">
                삭제
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="text-center text-slate-500 py-10 bg-slate-800 rounded-xl border border-slate-700">
            등록된 상품이 없습니다.
          </div>
        )}
      </div>

      {/* --- 통계 대시보드 (구글 애널리틱스 iframe) --- */}
      <div className="border-b border-slate-700 pb-4 mb-6 mt-10">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>📈</span> 실시간 페이지 조회수
        </h2>
        <p className="text-slate-400 text-sm mt-1">어떤 숏폼 제품이 가장 인기 있는지 확인하세요.</p>
      </div>

      <div className="w-full h-[600px] bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex justify-center items-center">
        <iframe
          width="100%"
          height="100%"
          src="https://datastudio.google.com/embed/reporting/85991516-c833-497c-8a56-14f0b5fffd6e/page/VGe2F"
          frameBorder={0}
          style={{ border: 0 }}
          allowFullScreen
          sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        />
      </div>

    </div>
  );
}