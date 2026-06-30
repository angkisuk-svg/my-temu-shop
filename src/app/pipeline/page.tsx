"use client";

import { useState } from 'react';

export default function PipelinePage() {
  const [itemData, setItemData] = useState({
    name: '',
    feature: '',
    target: ''
  });

  const [customPrompt, setCustomPrompt] = useState('');
  const [scriptMemo, setScriptMemo] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setItemData({ ...itemData, [e.target.name]: e.target.value });
  };

  const generatePromptBase = () => {
    if (!itemData.name) {
      alert("상품명을 먼저 입력해 주세요!");
      return;
    }

    const base = `너는 100만 조회수를 밥 먹듯이 찍는 실리콘밸리 천재 마케터이자 틱톡커야. 
아래 [제품 정보]를 바탕으로, 시청자가 무조건 3초 안에 스크롤을 멈출 수밖에 없는 숏폼 영상(릴스/쇼츠) 대본 3가지를 작성해 줘.

[제품 정보]
- 상품명: ${itemData.name}
- 핵심 소구점: ${itemData.feature || '기획자가 본문에 입력한 장점 참고'}
- 타겟 고객: ${itemData.target || '이 제품이 가장 필요한 대중'}

[작성 조건]
1. 분량: 15초~30초 (대본 기준 100자 내외)
2. 후킹(Hook): 첫 3초에 강력한 어그로를 끌어 공감대나 호기심을 유발할 것
3. 전개: 호들갑스럽고 친근한 '내돈내산 후기' 말투를 사용할 것
4. CTA: 영상 마지막에 반드시 "프로필 링크에서 확인하세요"라는 멘트를 넣을 것`;

    setCustomPrompt(base);
  };

  const copyPrompt = () => {
    if (!customPrompt) {
      alert("먼저 프롬프트를 생성해 주세요!");
      return;
    }
    navigator.clipboard.writeText(customPrompt);
    alert("✨ 프롬프트가 복사되었습니다! ChatGPT에 붙여넣으세요.");
  };

  const copyScript = () => {
    if (!scriptMemo) {
      alert("복사할 대본 내용이 없습니다!");
      return;
    }
    navigator.clipboard.writeText(scriptMemo);
    alert("📝 수정된 대본이 복사되었습니다! 브루(Vrew)나 캡컷에 붙여넣으세요.");
  };

  return (
    <div className="max-w-6xl mx-auto min-h-screen bg-slate-900 p-8 font-sans text-slate-100">
      <header className="mb-10 border-b border-slate-700 pb-5 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <span>🏭</span> 글로벌 AI 숏폼 팩토리
          </h1>
          <p className="text-slate-400 mt-2">트렌드 분석, 대본 커스텀부터 글로벌 배포 인프라까지.</p>
        </div>
      </header>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4">📡 1단계: 트렌드 분석 & 다국어 배포 툴</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <a href="https://datalab.naver.com/shoppingInsight/sCategory.naver" target="_blank" rel="noreferrer" className="bg-green-600/10 border border-green-500/30 p-4 rounded-xl hover:bg-green-600/20 text-center">
            <div className="text-green-400 font-bold mb-1">네이버 데이터랩</div>
          </a>
          <a href="https://itemscout.io/trend" target="_blank" rel="noreferrer" className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-xl hover:bg-blue-600/20 text-center">
            <div className="text-blue-400 font-bold mb-1">아이템스카우트</div>
          </a>
          <a href="https://trends.google.com/trends/" target="_blank" rel="noreferrer" className="bg-orange-600/10 border border-orange-500/30 p-4 rounded-xl hover:bg-orange-600/20 text-center">
            <div className="text-orange-400 font-bold mb-1">구글 트렌드</div>
          </a>
          <a href="https://vrew.voyagerx.com/" target="_blank" rel="noreferrer" className="bg-purple-600/20 border border-purple-500/50 p-4 rounded-xl hover:bg-purple-600/30 text-center">
            <div className="text-purple-400 font-bold mb-1">브루 (Vrew) 🎙️</div>
          </a>
          <a href="https://www.capcut.com/" target="_blank" rel="noreferrer" className="bg-indigo-600/20 border border-indigo-500/50 p-4 rounded-xl hover:bg-indigo-600/30 text-center">
            <div className="text-indigo-400 font-bold mb-1">캡컷 (CapCut) ✂️</div>
          </a>
          <a href="https://elevenlabs.io/dubbing" target="_blank" rel="noreferrer" className="bg-red-600/20 border border-red-500/50 p-4 rounded-xl hover:bg-red-600/30 text-center">
            <div className="text-red-400 font-bold mb-1">일레븐랩스 🌍</div>
          </a>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-4">📝 2단계: 제품 정보 입력</h2>
            <div className="flex flex-col gap-4">
              <input type="text" name="name" value={itemData.name} onChange={handleChange} placeholder="상품명" className="p-3 bg-slate-900 border border-slate-600 rounded-lg text-white" />
              <input type="text" name="feature" value={itemData.feature} onChange={handleChange} placeholder="핵심 기능" className="p-3 bg-slate-900 border border-slate-600 rounded-lg text-white" />
              <input type="text" name="target" value={itemData.target} onChange={handleChange} placeholder="타겟 고객" className="p-3 bg-slate-900 border border-slate-600 rounded-lg text-white" />
            </div>
          </div>
          <button onClick={generatePromptBase} className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 rounded-lg mt-6">
            프롬프트 조립하기 ⚡
          </button>
        </section>

        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl relative">
          <h2 className="text-xl font-bold text-white mb-4">🪄 3단계: 프롬프트 커스텀</h2>
          <textarea 
            value={customPrompt} 
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="w-full h-[250px] p-4 bg-slate-900 border border-slate-600 rounded-lg text-sm text-slate-300 resize-none"
          />
          <button onClick={copyPrompt} className="w-full bg-slate-700 text-white font-bold py-3 rounded-lg mt-4">
            프롬프트 복사하기
          </button>
        </section>

        <section className="bg-slate-800 p-6 rounded-xl border border-purple-500/30 shadow-xl relative">
          <h2 className="text-xl font-bold text-purple-400 mb-4">🎬 4단계: 대본·자막 편집기</h2>
          <textarea 
            value={scriptMemo} 
            onChange={(e) => setScriptMemo(e.target.value)}
            className="w-full h-[250px] p-4 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white resize-none"
          />
          <button onClick={copyScript} className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg mt-4">
            수정 완료 대본 복사하기
          </button>
        </section>
      </div>
    </div>
  );
}