
/**
 * 🚀 [V11-VERCEL] 펫시터의 정석 서버
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());

// [LOGGING]
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// [API] 가격 계산
app.post('/api/calculate-price', (req, res) => {
  const { basePrice, petCount } = req.body;
  const surcharge = (petCount && petCount > 1) ? (petCount - 1) * 10000 : 0;
  res.json({ totalCost: (basePrice || 18000) + surcharge });
});

// [API] 후기
app.get('/api/comments', (req, res) => {
  res.json([
    { 
      sitterName: '김지은 시터', 
      region: '서울 강남구', 
      serviceType: '방문 돌봄 60분', 
      content: '아이들이 너무 예뻐요.', 
      author: '박*준', 
      profileImg: 'https://i.pravatar.cc/150?u=1', 
      relativeTime: '2시간 전' 
    }
  ]);
});

// Vercel 환경이 아닐 때만 listen 실행 (로컬 테스트용)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Local server running on http://localhost:${PORT}`);
  });
}

// Vercel을 위해 app 내보내기
module.exports = app;
