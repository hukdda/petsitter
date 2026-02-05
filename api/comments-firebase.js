/**
 * 후기 API (Firebase Firestore 버전)
 * GET: 후기 목록 조회
 * POST: 새 후기 등록
 */

import { getFirestore, sendTelegram } from './_firebase.js';

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = getFirestore();
    const commentsRef = db.collection('comments');

    // GET: 후기 목록 조회
    if (req.method === 'GET') {
      const snapshot = await commentsRef
        .where('isApproved', '==', true)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      const comments = [];
      snapshot.forEach((doc) => {
        comments.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return res.status(200).json(comments);
    }

    // POST: 새 후기 등록
    if (req.method === 'POST') {
      const { author, region, content, rating = 5 } = req.body;

      if (!author || !region || !content) {
        return res.status(400).json({ 
          success: false, 
          message: '필수 정보를 입력해주세요.' 
        });
      }

      // 새 후기 데이터
      const newComment = {
        author,
        region,
        content,
        rating,
        createdAt: new Date().toISOString(),
        sitterName: '전문 시터님',
        serviceType: '방문돌봄',
        profileImg: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(author)}`,
        relativeTime: '방금 전',
        isApproved: true,
      };

      // Firestore에 저장
      const docRef = await commentsRef.add(newComment);

      // Telegram 알림
      await sendTelegram(`💬 <b>새로운 후기 등록</b>
👤 작성자: ${author}
📍 지역: ${region}
⭐ 평점: ${rating}/5
📝 내용: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`);

      return res.status(200).json({
        success: true,
        data: {
          id: docRef.id,
          ...newComment,
        },
      });
    }

    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  } catch (error) {
    console.error('후기 API 오류:', error);
    return res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    });
  }
}
