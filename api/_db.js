export const db = {
  applications: [],
  bookings: [],
  payments: [],
  comments: [
    {
      id: 'init_1',
      author: '김민지',
      region: '부산 해운대구',
      content: '처음 맡겨봤는데 시터님이 너무 친절하게 아이 사진도 많이 보내주시고 밥도 잘 챙겨주셔서 안심했어요!',
      rating: 5,
      createdAt: '2025-02-10',
      sitterName: '이지은 시터님',
      serviceType: '방문돌봄 60분',
      profileImg: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Minji',
      relativeTime: '2일 전',
      isApproved: true
    },
    {
      id: 'init_2',
      author: '박준형',
      region: '대구 수성구',
      content: '갑작스러운 출장으로 예약했는데, 당일 예약임에도 불구하고 너무 친절하게 대응해주셨어요.',
      rating: 5,
      createdAt: '2025-02-08',
      sitterName: '김민석 시터님',
      serviceType: '방문돌봄 30분',
      profileImg: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jun',
      relativeTime: '4일 전',
      isApproved: true
    }
  ]
};
