// 사업 영역 데이터

export interface BusinessArea {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  shortDescription: string;
  icon: string;
  color: string;
  bgGradient: string;
  features: string[];
  stats: { label: string; value: string }[];
  link: string;
  externalLink?: string;
}

export const businessAreas: BusinessArea[] = [
  {
    id: 'smart-factory',
    name: '스마트팩토리',
    nameEn: 'Smart Factory',
    description: 'AI 기반 예지보전 시스템으로 제조업의 디지털 전환을 이끕니다. 40년 이상의 산업현장 경험과 최신 AI 기술을 결합하여 설비 고장을 사전에 예측하고 예방합니다.',
    shortDescription: 'AI 예지보전으로 설비 다운타임 Zero 실현',
    icon: 'Factory',
    color: 'factory',
    bgGradient: 'from-factory to-primary-dark',
    features: [
      '실시간 설비 모니터링',
      'AI 예지보전 (Predictive Maintenance)',
      '이상 감지 및 자동 알림',
      '설비 성능 분석 대시보드',
      '다중 공장 통합 관리',
    ],
    stats: [
      { label: '구축 사례', value: '25+' },
      { label: '모니터링 센서', value: '1,500+' },
      { label: '평균 다운타임 감소', value: '35%' },
    ],
    link: '/solutions/smart-factory',
    externalLink: 'https://uttec-sensor.duckdns.org/admin',
  },
  {
    id: 'smart-farm',
    name: '스마트팜',
    nameEn: 'Smart Farm',
    description: 'IoT 센서와 AI 분석을 통해 농업의 과학화를 실현합니다. 환경 데이터 기반의 정밀 농업으로 생산성을 극대화합니다.',
    shortDescription: 'IoT와 AI로 농업의 과학화 실현',
    icon: 'Leaf',
    color: 'farm',
    bgGradient: 'from-farm to-green-700',
    features: [
      '환경 센서 모니터링',
      '자동 관개/환기 제어',
      '작물 생육 데이터 분석',
      '병충해 조기 감지',
      '수확량 예측 시스템',
    ],
    stats: [
      { label: '센서 노드', value: '200+' },
      { label: '생산성 향상', value: '25%' },
      { label: '물/에너지 절감', value: '30%' },
    ],
    link: '/solutions/smart-farm',
  },
  {
    id: 'ai-education',
    name: 'AI 교육',
    nameEn: 'AI Education',
    description: '하드웨어 제어와 AI를 결합한 실습 중심 교육 플랫폼입니다. 초등학생부터 성인까지 단계별 커리큘럼을 제공합니다.',
    shortDescription: '하드웨어 + AI 융합 교육 플랫폼',
    icon: 'GraduationCap',
    color: 'education',
    bgGradient: 'from-education to-purple-800',
    features: [
      '웹 기반 C언어 실습 환경',
      '아두이노/라즈베리파이 연동',
      '단계별 AI 교육 과정',
      '실시간 코드 실행 및 피드백',
      '프로젝트 기반 학습',
    ],
    stats: [
      { label: '교육 과정', value: '15+' },
      { label: '실습 프로젝트', value: '50+' },
      { label: '수강생', value: '500+' },
    ],
    link: '/platforms/education',
    externalLink: 'https://uttec-edu.duckdns.org/',
  },
  {
    id: 'career-guidance',
    name: '진로지도',
    nameEn: 'Career Guidance',
    description: '학생 맞춤형 진로 탐색 및 상담 플랫폼입니다. 적성 검사, 관심 분야 분석, 전문가 상담을 통해 진로 설계를 지원합니다.',
    shortDescription: '학생 맞춤형 진로 탐색 플랫폼',
    icon: 'Compass',
    color: 'education',
    bgGradient: 'from-indigo-600 to-education',
    features: [
      '적성 및 흥미 검사',
      '직업 정보 데이터베이스',
      '학과/대학 추천',
      '전문가 1:1 상담',
      '진로 로드맵 설계',
    ],
    stats: [
      { label: '검사 유형', value: '10+' },
      { label: '직업 정보', value: '300+' },
      { label: '상담 건수', value: '1,000+' },
    ],
    link: '/platforms/career',
    externalLink: 'https://uttec-snu.duckdns.org/',
  },
  {
    id: 'certification',
    name: '자격시험',
    nameEn: 'Certification',
    description: '국가공인 자격증 학습 가이드 플랫폼입니다. 체계적인 학습 자료와 모의고사로 합격을 지원합니다.',
    shortDescription: '국가공인 자격시험 학습 가이드',
    icon: 'Award',
    color: 'certification',
    bgGradient: 'from-certification to-orange-700',
    features: [
      '자격증별 학습 가이드',
      '과목별 핵심 정리',
      '기출문제 풀이',
      '모의고사 시스템',
      '학습 진도 관리',
    ],
    stats: [
      { label: '자격증 종류', value: '50+' },
      { label: '문제은행', value: '10,000+' },
      { label: '합격자', value: '2,000+' },
    ],
    link: '/platforms/certification',
    externalLink: 'https://uttec-cert.duckdns.org/',
  },
];

// 솔루션 영역 (스마트팩토리, 스마트팜)
export const solutions = businessAreas.filter(area =>
  ['smart-factory', 'smart-farm'].includes(area.id)
);

// 플랫폼 영역 (교육, 진로지도, 자격시험)
export const platforms = businessAreas.filter(area =>
  ['ai-education', 'career-guidance', 'certification'].includes(area.id)
);
