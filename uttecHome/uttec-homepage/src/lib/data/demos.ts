// 스마트 팩토리 데모 사이트 데이터
export interface DemoSite {
  id: string;
  name: string;
  category: string;
  description: string;
  equipment: string[];
  sensors: number;
  roi: string;
  themeColor: string;
  demoUrl: string;
}

export const demoCategories = [
  { id: 'all', name: '전체', count: 25 },
  { id: 'powder', name: '분체/분쇄', count: 6 },
  { id: 'electric', name: '전기/배전', count: 3 },
  { id: 'robot', name: '로봇/자동화', count: 3 },
  { id: 'semiconductor', name: '반도체/정밀', count: 3 },
  { id: 'surface', name: '도장/표면', count: 1 },
  { id: 'environment', name: '환경', count: 1 },
  { id: 'construction', name: '건설중장비', count: 1 },
  { id: 'heat', name: '열처리', count: 1 },
  { id: 'packaging', name: '포장기계', count: 1 },
  { id: 'general', name: '기계일반', count: 5 },
];

export const demoSites: DemoSite[] = [
  {
    id: 'hankook',
    name: '한국분체시스템',
    category: 'powder',
    description: '분체/분쇄 설비 전문 제조업체',
    equipment: ['볼밀', '제트밀', '분급기', '건조기', '혼합기'],
    sensors: 76,
    roi: '15개월',
    themeColor: '#1a237e',
    demoUrl: '/demo/hankook/',
  },
  {
    id: 'hankookmech',
    name: '한국기계엔지니어링',
    category: 'powder',
    description: '파쇄기/분쇄기 전문 제조업체',
    equipment: ['이축 파쇄기', '해머 분쇄기', '핀밀'],
    sensors: 62,
    roi: '14개월',
    themeColor: '#1565c0',
    demoUrl: '/demo/hankookmech/',
  },
  {
    id: 'kunileng',
    name: '건일이엔지',
    category: 'electric',
    description: '수배전반/외함 전문 제조업체',
    equipment: ['NCT 펀칭', '레이저 절단', 'CNC 절곡', '용접'],
    sensors: 48,
    roi: '12개월',
    themeColor: '#0d47a1',
    demoUrl: '/demo/kunileng/',
  },
  {
    id: 'doosanrobo',
    name: '두산로보틱스',
    category: 'robot',
    description: '협동로봇(Cobot) 전문 제조업체',
    equipment: ['P/H/M/A/E 시리즈 6축 협동로봇'],
    sensors: 24,
    roi: '12개월',
    themeColor: '#1a5f7a',
    demoUrl: '/demo/doosanrobo/',
  },
  {
    id: 'sunjin',
    name: '선진파워텍',
    category: 'semiconductor',
    description: '반도체 기능성 소재 부품 정밀가공',
    equipment: ['CNC 선반', 'MCT', '사출/프레스', 'CMM'],
    sensors: 183,
    roi: '15.7개월',
    themeColor: '#1565c0',
    demoUrl: '/demo/sunjin/',
  },
  {
    id: 'polarissewon',
    name: '폴라리스세원',
    category: 'general',
    description: '자동차 공조부품 전문 제조',
    equipment: ['프레스 설비', '브레이징로', '조립라인', '검사설비'],
    sensors: 156,
    roi: '16.2개월',
    themeColor: '#1a237e',
    demoUrl: '/demo/polarissewon/',
  },
  {
    id: 'daemo',
    name: '대모엔지니어링',
    category: 'construction',
    description: '건설중장비 Attachment 제조',
    equipment: ['CNC 대형가공기', '로봇용접 시스템', '열처리로', '유압시험기'],
    sensors: 291,
    roi: '15개월',
    themeColor: '#d32f2f',
    demoUrl: '/demo/daemo/',
  },
  {
    id: 'vessel',
    name: '베셀',
    category: 'robot',
    description: 'FPD(Flat Panel Display) 제조장비 전문기업',
    equipment: ['Furnace Oven', 'Bake Oven', 'Dispenser', 'In-Line System'],
    sensors: 92,
    roi: '1.8년',
    themeColor: '#6a1b9a',
    demoUrl: '/demo/vessel/',
  },
];

// 홈페이지에 표시할 주요 데모 (4개)
export const featuredDemos = demoSites.slice(0, 4);
