// 테스트 데이터 생성 스크립트
const fs = require('fs');
const path = require('path');

// 간단한 SVG 이미지 생성 함수 (텍스트 없이)
function generateSimpleSVG(type) {
  const svgs = {
    math: `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#e3f2fd"/>
      <circle cx="200" cy="150" r="80" fill="#1976d2" opacity="0.7"/>
      <circle cx="150" cy="120" r="40" fill="#42a5f5" opacity="0.6"/>
      <circle cx="250" cy="180" r="50" fill="#64b5f6" opacity="0.6"/>
    </svg>`,

    english: `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#f3e5f5"/>
      <rect x="80" y="80" width="240" height="140" rx="20" fill="#7b1fa2" opacity="0.7"/>
      <rect x="100" y="100" width="200" height="100" rx="15" fill="#9c27b0" opacity="0.6"/>
      <rect x="120" y="120" width="160" height="60" rx="10" fill="#ba68c8" opacity="0.5"/>
    </svg>`,

    ai: `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#e8f5e9"/>
      <polygon points="200,50 300,150 200,250 100,150" fill="#388e3c" opacity="0.7"/>
      <polygon points="200,80 270,150 200,220 130,150" fill="#66bb6a" opacity="0.6"/>
      <circle cx="200" cy="150" r="30" fill="#81c784" opacity="0.8"/>
    </svg>`,

    general: `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#fff3e0"/>
      <rect x="50" y="50" width="100" height="100" fill="#f57c00" opacity="0.7"/>
      <rect x="180" y="80" width="120" height="80" fill="#fb8c00" opacity="0.6"/>
      <rect x="120" y="160" width="160" height="90" fill="#ffa726" opacity="0.5"/>
    </svg>`,

    event: `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#fce4ec"/>
      <polygon points="200,80 240,160 200,240 160,160" fill="#c2185b" opacity="0.7"/>
      <polygon points="200,100 230,150 200,200 170,150" fill="#e91e63" opacity="0.6"/>
      <circle cx="200" cy="150" r="25" fill="#f06292" opacity="0.8"/>
    </svg>`,
  };

  return `data:image/svg+xml;base64,${Buffer.from(svgs[type] || svgs.general).toString('base64')}`;
}

// 날짜 생성 함수
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// 테스트 데이터 생성
const notices = [];
const startDate = new Date('2025-03-01T09:00:00');
const endDate = new Date('2025-10-31T18:00:00');

const templates = [
  // 긴급 공지
  {
    category: 'urgent',
    title: 'AIDT 시스템 긴급 점검 안내',
    content: `<h2>긴급 시스템 점검 안내</h2><p>보다 안정적인 서비스 제공을 위해 긴급 시스템 점검을 실시합니다.</p><p><img src="${generateSimpleSVG('general')}" width="400" /></p><p><strong>점검 일시:</strong> 2025년 5월 15일 02:00 ~ 04:00</p><p><strong>영향 범위:</strong> 전체 서비스 일시 중단</p><p>점검 시간 동안 서비스 이용이 불가하오니 양해 부탁드립니다.</p>`,
    isPinned: true,
    showInBanner: true,
    showAsModal: true,
    priority: 1,
  },
  {
    category: 'urgent',
    title: '수학 AI 튜터 서비스 장애 복구 완료',
    content: `<h2>서비스 복구 안내</h2><p>일시적으로 발생한 수학 AI 튜터 서비스 장애가 복구되었습니다.</p><p><img src="${generateSimpleSVG('math')}" width="350" /></p><p>이용에 불편을 드려 죄송합니다.</p>`,
    showInBanner: true,
    priority: 1,
  },

  // 업데이트
  {
    category: 'update',
    title: '영어 발음 평가 AI 업데이트',
    content: `<h2>영어 발음 평가 AI 개선</h2><p>더욱 정확한 발음 평가를 위해 AI 모델을 업데이트했습니다.</p><p><img src="${generateSimpleSVG('english')}" width="400" /></p><h3>주요 개선 사항</h3><ul><li>발음 정확도 인식률 20% 향상</li><li>억양 분석 기능 추가</li><li>실시간 피드백 속도 개선</li></ul><p>업데이트된 기능을 지금 바로 체험해보세요!</p>`,
    showInBanner: true,
    priority: 2,
  },
  {
    category: 'update',
    title: '수학 문제 풀이 AI 신규 기능 추가',
    content: `<h2>단계별 풀이 과정 설명 기능</h2><p><img src="${generateSimpleSVG('math')}" width="380" /></p><p>이제 수학 문제 풀이 시 단계별로 상세한 설명을 제공합니다.</p><ul><li>각 단계마다 상세 설명</li><li>관련 개념 링크 제공</li><li>유사 문제 추천</li></ul>`,
    priority: 2,
  },

  // 이벤트
  {
    category: 'event',
    title: 'AI 영어 말하기 챌린지 이벤트',
    content: `<h2>AI와 함께하는 영어 말하기 도전!</h2><p><img src="${generateSimpleSVG('event')}" width="400" /></p><p><strong>이벤트 기간:</strong> 2025년 6월 1일 ~ 6월 30일</p><h3>참여 방법</h3><ol><li>매일 AI 튜터와 영어 대화 5분 이상</li><li>발음 점수 80점 이상 획득</li><li>한 달간 20일 이상 참여</li></ol><h3>보상</h3><p>우수 참여자 30명에게 추가 학습 크레딧 지급!</p>`,
    showAsModal: true,
    priority: 2,
  },
  {
    category: 'event',
    title: '수학 올림피아드 준비반 모집',
    content: `<h2>AI 기반 수학 올림피아드 준비반</h2><p><img src="${generateSimpleSVG('math')}" width="380" /></p><p>수학 올림피아드를 준비하는 학생들을 위한 특별반을 운영합니다.</p><h3>대상</h3><p>중학교 1~3학년 학생</p><h3>내용</h3><ul><li>AI 맞춤형 문제 풀이</li><li>실시간 질의응답</li><li>주간 모의고사</li></ul><p><strong>신청 기간:</strong> ~ 2025년 4월 30일</p>`,
    isPinned: true,
    showInBanner: true,
    priority: 2,
  },

  // 안내
  {
    category: 'announcement',
    title: 'AIDT 플랫폼 사용 가이드',
    content: `<h2>선생님을 위한 AIDT 활용 가이드</h2><p><img src="${generateSimpleSVG('ai')}" width="400" /></p><h3>주요 기능</h3><ul><li><strong>학습 진도 추적:</strong> 실시간으로 학생들의 학습 현황 확인</li><li><strong>AI 과제 생성:</strong> 학생 수준에 맞는 맞춤형 과제 자동 생성</li><li><strong>성적 분석:</strong> AI 기반 성적 분석 및 개선 방안 제시</li></ul><p>자세한 사용 방법은 도움말 센터를 참고해주세요.</p>`,
    priority: 3,
  },
  {
    category: 'announcement',
    title: '학생 계정 관리 안내',
    content: `<h2>학생 계정 설정 및 관리</h2><p><img src="${generateSimpleSVG('general')}" width="350" /></p><p>학생들의 안전한 학습 환경을 위해 계정 관리가 중요합니다.</p><h3>권장 사항</h3><ul><li>비밀번호 정기적 변경</li><li>개인정보 보호 설정 확인</li><li>학습 시간 제한 설정</li></ul>`,
    priority: 3,
  },

  // 수학 관련
  {
    category: 'announcement',
    title: '수학 AI 튜터 - 중학 도형 특강',
    content: `<h2>중학교 도형 완벽 정복</h2><p><img src="${generateSimpleSVG('math')}" width="400" /></p><p>AI 튜터와 함께 도형 문제를 정복해보세요.</p><h3>학습 내용</h3><ul><li>삼각형의 성질</li><li>사각형의 성질</li><li>원의 성질</li><li>입체도형</li></ul><p>각 단원별 개념 설명과 문제 풀이를 제공합니다.</p>`,
    priority: 3,
  },
  {
    category: 'update',
    title: '수학 계산기 기능 업데이트',
    content: `<h2>그래프 계산기 기능 추가</h2><p><img src="${generateSimpleSVG('math')}" width="380" /></p><p>수학 학습을 돕는 그래프 계산기 기능이 추가되었습니다.</p><ul><li>함수 그래프 시각화</li><li>교점 자동 계산</li><li>그래프 확대/축소</li></ul>`,
    priority: 2,
  },

  // 영어 관련
  {
    category: 'announcement',
    title: '영어 독해 AI - 고등 과정 오픈',
    content: `<h2>고등학교 영어 독해 과정</h2><p><img src="${generateSimpleSVG('english')}" width="400" /></p><p>고등학생을 위한 심화 영어 독해 과정이 오픈되었습니다.</p><h3>특징</h3><ul><li>수능 유형 독해 문제</li><li>문단별 상세 해설</li><li>어휘 자동 정리</li><li>AI 기반 오답 분석</li></ul>`,
    priority: 3,
  },
  {
    category: 'event',
    title: '영어 단어 암기 마라톤',
    content: `<h2>30일 영어 단어 완성 챌린지</h2><p><img src="${generateSimpleSVG('event')}" width="380" /></p><p><strong>기간:</strong> 2025년 7월 1일 ~ 7월 31일</p><h3>목표</h3><p>30일 동안 매일 20개씩 총 600개 단어 학습</p><h3>참여 혜택</h3><ul><li>학습 진도에 따른 배지 획득</li><li>완주 시 수료증 발급</li><li>우수 참가자 시상</li></ul>`,
    showAsModal: true,
    priority: 2,
  },
];

// 50개 데이터 생성
for (let i = 0; i < 50; i++) {
  const template = templates[i % templates.length];
  const createdAt = randomDate(startDate, endDate);
  const id = createdAt.getTime().toString() + i;

  // 상태 랜덤 선택
  let status = 'published';
  let publishAt = undefined;
  let expireAt = undefined;

  if (i % 10 === 0) status = 'draft';
  else if (i % 10 === 1) {
    status = 'scheduled';
    publishAt = formatDateTime(new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000));
  } else if (i % 10 === 2) {
    status = 'expired';
    expireAt = formatDateTime(new Date(createdAt.getTime() - 1 * 24 * 60 * 60 * 1000));
  }

  // 일단 모두 false로 설정 (정렬 후 수정)
  const showInBanner = false;
  const showAsModal = false;
  const isPinned = false;

  const bannerStartDate = undefined;
  const bannerEndDate = undefined;

  const modalStartDate = undefined;
  const modalEndDate = undefined;

  // 히스토리 생성
  const history = [
    {
      action: 'created',
      timestamp: createdAt.toISOString(),
      status: status === 'draft' ? 'draft' : (status === 'scheduled' ? 'scheduled' : 'draft'),
      note: status === 'draft' ? '임시저장됨' : undefined,
    }
  ];

  if (status === 'published' || status === 'expired') {
    history.push({
      action: 'published',
      timestamp: new Date(createdAt.getTime() + 1000).toISOString(),
      status: 'published',
    });
  }

  if (status === 'expired') {
    history.push({
      action: 'expired',
      timestamp: new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'expired',
      note: '관리자가 수동으로 숨김 처리함',
    });
  }

  // 제목에 번호 추가
  const title = `${template.title} ${i > 11 ? '- ' + (i - 11) + '차' : ''}`.trim();

  const notice = {
    id,
    category: template.category,
    title,
    content: template.content,
    createdAt: createdAt.toISOString(),
    updatedAt: createdAt.toISOString(),
    viewCount: Math.floor(Math.random() * 500),
    isPinned,
    showInBanner,
    bannerContent: undefined,
    bannerStartDate,
    bannerEndDate,
    bannerDismissDuration: undefined,
    showAsModal,
    modalContent: undefined,
    modalBody: undefined,
    modalStartDate,
    modalEndDate,
    modalDismissDuration: undefined,
    priority: template.priority || 3,
    expireAt,
    publishAt,
    author: {
      id: 'admin',
      name: '관리자',
    },
    status,
    history,
  };

  notices.push(notice);
}

// 날짜 기준 내림차순 정렬 (최신순)
notices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

// 정렬 후 상위 3개에 배너/모달/고정 설정
const dismissDurations = ['1hour', '3hours', '6hours', '12hours', '1day', '3days', '1week', 'permanent'];
const currentDate = new Date(); // 현재 날짜 사용

for (let i = 0; i < Math.min(3, notices.length); i++) {
  const notice = notices[i];

  // 배너 설정 - 현재 날짜 기준
  notice.showInBanner = true;
  notice.bannerStartDate = formatDateTime(new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000)); // 1일 전부터
  notice.bannerEndDate = formatDateTime(new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000)); // 30일 후까지
  notice.bannerDismissDuration = dismissDurations[i % dismissDurations.length];
  if (i === 0) {
    notice.bannerContent = `[중요] ${notice.title}`;
  }

  // 모달 설정 - 현재 날짜 기준
  notice.showAsModal = true;
  notice.modalStartDate = formatDateTime(new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000)); // 1일 전부터
  notice.modalEndDate = formatDateTime(new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000)); // 14일 후까지
  notice.modalDismissDuration = dismissDurations[(i + 3) % dismissDurations.length];
  if (i === 0) {
    notice.modalContent = `알림: ${notice.title}`;
  }
  if (i === 1) {
    notice.modalBody = `<p><strong>중요한 공지사항입니다.</strong></p>${notice.content}`;
  }

  // 상단 고정 설정
  notice.isPinned = true;
}

// HTML 파일 생성 (브라우저에서 실행할 스크립트)
const htmlContent = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>테스트 데이터 생성</title>
</head>
<body>
  <h1>AIDT 공지사항 테스트 데이터 생성</h1>
  <p>브라우저 콘솔을 확인하세요.</p>
  <button onclick="generateData()">데이터 생성</button>
  <button onclick="clearData()">데이터 삭제</button>

  <script>
    const notices = ${JSON.stringify(notices, null, 2)};

    function generateData() {
      localStorage.setItem('aidt_notices', JSON.stringify(notices));
      console.log('✅ 테스트 데이터 생성 완료:', notices.length + '개');
      alert('테스트 데이터 ' + notices.length + '개가 생성되었습니다!\\n페이지를 새로고침하세요.');
    }

    function clearData() {
      localStorage.removeItem('aidt_notices');
      console.log('✅ 데이터 삭제 완료');
      alert('모든 데이터가 삭제되었습니다!\\n페이지를 새로고침하세요.');
    }

    console.log('📊 생성될 데이터 미리보기:', notices.slice(0, 5));
    console.log('총 개수:', notices.length);
  </script>
</body>
</html>
`;

// HTML 파일 저장
fs.writeFileSync(path.join(__dirname, 'test-data.html'), htmlContent);

// JSON 파일 저장 (mock-notices.json 업데이트)
const jsonData = {
  notices: notices
};
fs.writeFileSync(
  path.join(__dirname, 'src', 'data', 'mock-notices.json'),
  JSON.stringify(jsonData, null, 2)
);

console.log('✅ test-data.html 파일이 생성되었습니다.');
console.log('✅ src/data/mock-notices.json 파일이 업데이트되었습니다.');
console.log(`📊 총 ${notices.length}개의 테스트 데이터가 생성되었습니다.`);
