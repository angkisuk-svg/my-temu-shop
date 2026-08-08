"use client";

import { useState, useEffect } from 'react';
import { doc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore"; 
import { db, auth } from '../firebase'; 
import { signInWithEmailAndPassword, updatePassword } from "firebase/auth"; 

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  originalPrice: string;
  imageUrl: string;
  affiliateLink: string;
  updatedAt?: number;
  clickCount?: number; 
}

interface Visit {
  date: string;
  count: number;
}

export default function AdminPage() {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]); 
  
  const [fetchTrigger, setFetchTrigger] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState<Product>({
    id: '', name: '', category: '', price: '', originalPrice: '', imageUrl: '', affiliateLink: ''
  });

  const SITE_URL = "https://ddoksooki.vercel.app";

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchData = async () => {
      try {
        const prodSnapshot = await getDocs(collection(db, "products"));
        const prodData = prodSnapshot.docs.map(doc => ({ ...doc.data() } as Product));
        setProducts(prodData);

        const visitSnapshot = await getDocs(collection(db, "visits"));
        const visitData = visitSnapshot.docs.map(doc => doc.data() as Visit);
        visitData.sort((a, b) => b.date.localeCompare(a.date));
        setVisits(visitData.slice(0, 7)); 
        
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      }
    };
    fetchData();
  }, [isAuthenticated, fetchTrigger]); 

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsAuthenticated(true);
    } catch (error) {
      alert('이메일이나 비밀번호가 틀렸습니다!');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (newPassword.length < 6) {
      alert("비밀번호는 최소 6자리 이상이어야 합니다.");
      return;
    }
    try {
      await updatePassword(auth.currentUser, newPassword);
      alert("🎉 비밀번호가 성공적으로 변경되었습니다!");
      setNewPassword('');
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        alert("보안을 위해 로그아웃 후 다시 로그인한 직후에만 변경할 수 있습니다.");
      } else {
        alert("비밀번호 변경에 실패했습니다.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const safeId = formData.id.trim();
      const dataToSave = { 
        ...formData, 
        id: safeId,
        updatedAt: Date.now() 
      };
      
      await setDoc(doc(db, "products", safeId), dataToSave, { merge: true });
      alert(`🎉 [${dataToSave.name}] 상품 정보가 저장/수정되었습니다!`);
      
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

  const handleEdit = (product: Product) => {
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
    const fullUrl = `${SITE_URL}/?id=${id}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      alert(`🔗 복사 완료: ${fullUrl}\n틱톡/숏폼에 바로 붙여넣으세요!`);
    });
  };

  const sortedProducts = [...products].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  const topClickedProducts = [...products]
    .sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
    .slice(0, 10);

  const sortedById = [...products].sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true }));
  const lastUsedId = sortedById.length > 0 ? sortedById[0].id : '없음';
  let nextSuggestedId = '0001';
  if (lastUsedId !== '없음') {
    const numOnly = lastUsedId.replace(/[^0-9]/g, '');
    if (numOnly) {
      nextSuggestedId = String(parseInt(numOnly, 10) + 1).padStart(numOnly.length, '0');
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100 px-4">
        <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-sm">
          <div className="flex justify-center mb-4"><span className="text-4xl">🔐</span></div>
          <h2 className="text-xl font-bold mb-6 text-center text-white">관리자 시스템</h2>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일 입력" required className="w-full bg-slate-900 border border-slate-600 p-3 mb-3 rounded-lg text-white focus:outline-none focus:border-orange-500" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호 입력" required className="w-full bg-slate-900 border border-slate-600 p-3 mb-6 rounded-lg text-white focus:outline-none focus:border-orange-500" />
          <button type="submit" className="w-full bg-orange-500 text-white p-3 rounded-lg font-bold hover:bg-orange-600 transition-colors">접속하기</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-slate-900 p-6 font-sans text-slate-100">
      
      <div className="border-b border-slate-700 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>⚙️</span> 상품 등록 및 수정
        </h1>
      </div>

      <div className="mb-4 p-4 bg-slate-800 border border-slate-600 rounded-lg flex items-center gap-3 shadow-md">
        <span className="text-2xl">💡</span>
        <div className="text-sm text-slate-300">
          <p>마지막으로 등록된 고유 ID: <span className="text-white font-bold">{lastUsedId}</span></p>
          <p className="mt-1 text-orange-400 font-bold">새 상품 등록 시 추천 ID 👉 {nextSuggestedId}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 mb-12 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
        <div>
          <label className="text-xs font-bold text-slate-400 mb-1 block">
            고유 ID <span className="font-normal text-slate-500">(미리보기: {SITE_URL}/?id=<span className="text-orange-400 font-bold">{formData.id || '...'}</span>)</span>
          </label>
          <input required type="text" name="id" value={formData.id} onChange={handleChange} readOnly={isEditing}
            className={`w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none ${isEditing ? 'opacity-50 cursor-not-allowed' : 'focus:border-orange-500'}`}
            placeholder={`예: ${nextSuggestedId}`}/>
          {isEditing && <p className="text-xs text-orange-400 mt-1 font-bold">※ 수정 중에는 고유 ID를 변경할 수 없습니다.</p>}
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 mb-1 block">상품명</label>
          <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:outline-none" placeholder="예: [품절대란] 1초 완성 야채 다지기"/>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 mb-1 block">카테고리</label>
          <input required type="text" name="category" value={formData.category} onChange={handleChange} className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:outline-none" placeholder="예: 주방용품"/>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-400 mb-1 block">할인가</label>
            <input required type="text" name="price" value={formData.price} onChange={handleChange} className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:outline-none" placeholder="예: 3,500원"/>
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-400 mb-1 block">원가</label>
            <input required type="text" name="originalPrice" value={formData.originalPrice} onChange={handleChange} className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:outline-none" placeholder="예: 15,000원"/>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 mb-1 block">이미지 주소 (URL)</label>
          <input required type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:outline-none" placeholder="이미지 URL을 붙여넣으세요"/>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 mb-1 block">나만의 수익 링크 (어필리에이트)</label>
          <input required type="url" name="affiliateLink" value={formData.affiliateLink} onChange={handleChange} className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:outline-none" placeholder="테무/쿠팡 단축 링크를 붙여넣으세요"/>
        </div>

        <button type="submit" className="w-full mt-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 rounded-lg shadow-lg hover:from-orange-600 hover:to-red-600 transition-all">확인 / 저장 🚀</button>
      </form>

      <div className="border-b border-slate-700 pb-4 mb-6 mt-10">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><span>📦</span> 등록된 상품 관리</h2>
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
                <span className="text-xs text-slate-500 mt-1">👀 클릭: {product.clickCount || 0}회</span>
              </div>
            </div>

            <div className="flex gap-2 min-w-max ml-2">
              <button type="button" onClick={() => handleCopyLink(product.id)} className="text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-lg transition" title="접속 주소 복사"><span>🔗</span> 복사</button>
              <button type="button" onClick={() => handleEdit(product)} className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg transition">수정</button>
              <button type="button" onClick={() => handleDelete(product.id, product.name)} className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-3 py-2 rounded-lg transition">삭제</button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="text-center text-slate-500 py-10 bg-slate-800 rounded-xl border border-slate-700">등록된 상품이 없습니다.</div>
        )}
      </div>

      {/* 🚨 [이동 완료] 자체 통계 대시보드 영역을 아래로 내렸습니다 */}
      <div className="border-b border-slate-700 pb-4 mb-6 mt-16">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>📊</span> 실시간 스토어 통계
        </h2>
        <p className="text-slate-400 text-sm mt-1">구글 콘솔 없이 앱 내에서 직관적으로 데이터를 확인하세요.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* 방문자 수 박스 */}
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg">
          <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2"><span>👥</span> 최근 7일 방문자</h3>
          <div className="flex flex-col gap-2">
            {visits.length > 0 ? visits.map((visit, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-900 p-2 px-4 rounded-lg border border-slate-700">
                <span className="text-sm text-slate-300">{visit.date}</span>
                <span className="font-bold text-white bg-blue-500/20 px-2 py-1 rounded text-sm">{visit.count} 명</span>
              </div>
            )) : <p className="text-sm text-slate-500 text-center py-4">아직 방문 데이터가 없습니다.</p>}
          </div>
        </div>

        {/* 클릭수 TOP 10 박스 */}
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg">
          <h3 className="text-lg font-bold text-orange-400 mb-4 flex items-center gap-2"><span>🔥</span> 클릭수 TOP 10</h3>
          <div className="flex flex-col gap-2">
            {topClickedProducts.length > 0 ? topClickedProducts.map((p, idx) => (
              <div key={p.id} className="flex justify-between items-center bg-slate-900 p-2 px-3 rounded-lg border border-slate-700">
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className={`font-bold w-5 text-center ${idx < 3 ? 'text-orange-500' : 'text-slate-500'}`}>{idx + 1}</span>
                  <span className="text-sm text-white truncate max-w-[120px] sm:max-w-[150px]">{p.name}</span>
                </div>
                <span className="font-bold text-orange-400 text-sm whitespace-nowrap">{p.clickCount || 0} 회</span>
              </div>
            )) : <p className="text-sm text-slate-500 text-center py-4">아직 클릭 데이터가 없습니다.</p>}
          </div>
        </div>
      </div>

      {/* 관리자 계정 비밀번호 변경 UI */}
      <div className="bg-slate-950 p-6 rounded-xl border border-red-500/30 shadow-lg mb-6">
        <h3 className="text-lg font-bold text-red-400 flex items-center gap-2 mb-4"><span>🔒</span> 관리자 계정 비밀번호 변경</h3>
        <p className="text-xs text-slate-400 mb-4">보안을 위해 앱을 처음 인계받으셨거나, 정기적으로 비밀번호를 변경해 주세요.</p>
        <form onSubmit={handleChangePassword} className="flex gap-3">
          <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="새로운 비밀번호 (6자리 이상)" className="flex-1 bg-slate-900 border border-slate-700 p-3 rounded-lg text-white focus:border-red-500 focus:outline-none text-sm"/>
          <button type="submit" className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold transition text-sm whitespace-nowrap">변경하기</button>
        </form>
      </div>

    </div>
  );
}