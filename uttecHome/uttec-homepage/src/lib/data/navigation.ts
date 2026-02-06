// 네비게이션 메뉴 데이터
export interface NavItem {
  id: string;
  label: string;
  href: string;
  children?: NavItem[];
  description?: string;
  isExternal?: boolean;
}

export const mainNavigation: NavItem[] = [
  {
    id: 'about',
    label: '회사소개',
    href: '/about',
    children: [
      { id: 'about-company', label: '회사개요', href: '/about', description: 'UTTEC의 비전과 미션' },
      { id: 'about-history', label: '연혁', href: '/about/history', description: '40년 기술 혁신의 역사' },
      { id: 'about-team', label: '조직/인력', href: '/about/team', description: '전문가 팀 소개' },
      { id: 'about-partners', label: '파트너사', href: '/about/partners', description: '함께하는 파트너' },
    ],
  },
  {
    id: 'solutions',
    label: '솔루션',
    href: '/solutions',
    children: [
      { id: 'smart-factory', label: '스마트팩토리', href: '/solutions/smart-factory', description: 'AI 예지보전 시스템' },
      { id: 'smart-farm', label: '스마트팜', href: '/solutions/smart-farm', description: 'IoT 기반 정밀농업' },
    ],
  },
  {
    id: 'platforms',
    label: '플랫폼',
    href: '/platforms',
    children: [
      { id: 'education', label: 'AI 교육', href: '/platforms/education', description: 'HW+AI 융합 교육' },
      { id: 'career', label: '진로지도', href: 'https://uttec-snu.duckdns.org/', description: '학생 진로 탐색', isExternal: true },
      { id: 'certification', label: '자격시험', href: '/platforms/certification', description: '자격증 학습 가이드' },
    ],
  },
  {
    id: 'portfolio',
    label: '포트폴리오',
    href: '/portfolio',
    children: [
      { id: 'portfolio-all', label: '전체 사례', href: '/portfolio', description: '구축 사례 모음' },
      { id: 'portfolio-demo', label: '데모 사이트', href: '/portfolio/demos', description: '25개 데모 체험' },
    ],
  },
  {
    id: 'contact',
    label: '문의',
    href: '/contact',
  },
];

export const footerNavigation = {
  solutions: [
    { label: '스마트팩토리', href: '/solutions/smart-factory' },
    { label: '스마트팜', href: '/solutions/smart-farm' },
    { label: '데모 사이트', href: '/portfolio/demos' },
  ],
  platforms: [
    { label: 'AI 교육', href: '/platforms/education' },
    { label: '진로지도', href: 'https://uttec-snu.duckdns.org/' },
    { label: '자격시험', href: '/platforms/certification' },
  ],
  company: [
    { label: '회사소개', href: '/about' },
    { label: '포트폴리오', href: '/portfolio' },
    { label: '문의하기', href: '/contact' },
  ],
  legal: [
    { label: '개인정보처리방침', href: '/privacy' },
    { label: '이용약관', href: '/terms' },
  ],
};

export const companyInfo = {
  name: '(주)유티텍',
  nameEn: 'UTTEC Co., Ltd.',
  address: '대전광역시 유성구 테크노2로 314, 2층 (관평동)',
  phone: '010-3922-1809',
  fax: '042-716-8883',
  email: 'uttec@uttec.co.kr',
  ceo: '홍광선',
  businessNumber: '123-45-67890',
};
