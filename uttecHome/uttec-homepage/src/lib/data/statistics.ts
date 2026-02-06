// 회사 통계 데이터
export interface Statistic {
  id: string;
  label: string;
  value: string;
  suffix?: string;
  description?: string;
}

export const companyStats: Statistic[] = [
  {
    id: 'experience',
    label: '업력',
    value: '40',
    suffix: '년+',
    description: '산업현장 경험',
  },
  {
    id: 'projects',
    label: '구축 프로젝트',
    value: '100',
    suffix: '+',
    description: '성공적인 구축 사례',
  },
  {
    id: 'sensors',
    label: '모니터링 센서',
    value: '1,500',
    suffix: '+',
    description: '실시간 운영 중',
  },
  {
    id: 'clients',
    label: '고객사',
    value: '50',
    suffix: '+',
    description: '신뢰하는 파트너',
  },
];

export const technologyStats: Statistic[] = [
  {
    id: 'patents',
    label: '특허/인증',
    value: '15',
    suffix: '건',
  },
  {
    id: 'developers',
    label: '전문 인력',
    value: '10',
    suffix: '명+',
  },
  {
    id: 'uptime',
    label: '시스템 가동률',
    value: '99.9',
    suffix: '%',
  },
  {
    id: 'response',
    label: '기술지원 응답',
    value: '2',
    suffix: '시간 이내',
  },
];

// 업종별 구축 현황
export const industryStats = [
  { industry: '분체/분쇄', count: 6, percentage: 24 },
  { industry: '전기/배전', count: 3, percentage: 12 },
  { industry: '로봇/자동화', count: 3, percentage: 12 },
  { industry: '반도체/정밀', count: 3, percentage: 12 },
  { industry: '기계일반', count: 5, percentage: 20 },
  { industry: '기타', count: 5, percentage: 20 },
];
