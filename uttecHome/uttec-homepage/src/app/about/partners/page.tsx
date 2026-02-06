import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Handshake, Building2, GraduationCap, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: '파트너사 | UTTEC',
  description: 'UTTEC과 함께하는 파트너사를 소개합니다. 기술 제휴, 구축 고객사, 교육 협력 기관.',
};

const partnerCategories = [
  {
    icon: Building2,
    title: '스마트팩토리 구축 고객사',
    color: 'factory',
    description: 'AI 예지보전 시스템을 도입한 제조 기업',
    partners: [
      { name: '한국분체시스템', industry: '분체/분쇄' },
      { name: '한국기계엔지니어링', industry: '분체/분쇄' },
      { name: '대흥크러셔', industry: '분체/분쇄' },
      { name: '동원분체산업', industry: '분체/분쇄' },
      { name: '한국분체기계', industry: '분체/분쇄' },
      { name: '광산기공', industry: '분체/분쇄' },
      { name: '건일이엔지', industry: '전기/배전' },
      { name: '동광계전', industry: '전기/배전' },
      { name: '한국전기산업', industry: '전기/배전' },
      { name: '두산로보틱스', industry: '로봇/자동화' },
      { name: '로봇시스템', industry: '로봇/자동화' },
      { name: '베셀', industry: '로봇/자동화' },
      { name: '선진파워텍', industry: '반도체/정밀' },
      { name: '수광산업', industry: '반도체/정밀' },
      { name: 'LAT플라즈마', industry: '반도체/정밀' },
      { name: '신호산기', industry: '도장/표면' },
      { name: '에코솔루션', industry: '환경' },
      { name: '대모엔지니어링', industry: '건설중장비' },
      { name: '대명기업', industry: '열처리' },
      { name: '삼원기계', industry: '포장기계' },
      { name: '광명산업', industry: '기계일반' },
      { name: '서원텍', industry: '기계일반' },
      { name: '폴라리스세원', industry: '기계일반' },
      { name: '화성기계', industry: '기계일반' },
      { name: '화성산업', industry: '기계일반' },
    ],
  },
  {
    icon: Shield,
    title: '기술 제휴사',
    color: 'primary',
    description: '핵심 기술 분야 협력 파트너',
    partners: [
      { name: '삼성전자', industry: '반도체/디지털' },
      { name: 'LG전자', industry: '전자/디스플레이' },
      { name: 'QuickLogic Corp', industry: 'FPGA/반도체 (미국)' },
      { name: 'Authortec Corp', industry: '멀티미디어 S/W (미국)' },
    ],
  },
  {
    icon: GraduationCap,
    title: '교육/정부 협력',
    color: 'education',
    description: 'AI 교육 및 정부 지원사업 파트너',
    partners: [
      { name: '중소벤처기업부', industry: '스마트공장 지원사업' },
      { name: '농림축산식품부', industry: '스마트팜 지원사업' },
      { name: '한국경제신문 (AICE)', industry: 'AI 자격시험 연계' },
    ],
  },
];

const industries = [
  '분체/분쇄', '전기/배전', '로봇/자동화', '반도체/정밀',
  '도장/표면', '환경', '건설중장비', '열처리', '포장기계', '기계일반',
];

export default function PartnersPage() {
  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-dark to-primary py-20">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">파트너사</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            함께 성장하는 신뢰의 파트너십
            <br />
            다양한 산업 분야의 기업과 함께합니다
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '25+', label: '스마트팩토리 고객사' },
              { value: '10+', label: '산업 분야' },
              { value: '4개국', label: '글로벌 협력' },
              { value: '40년+', label: '파트너십 역사' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Coverage */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-primary font-semibold">Industry Coverage</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">적용 산업 분야</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {industries.map((industry) => (
              <span
                key={industry}
                className="px-4 py-2 bg-white rounded-full text-gray-700 font-medium shadow-sm border border-gray-100"
              >
                {industry}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Categories */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          {partnerCategories.map((category) => (
            <div key={category.title} className="mb-16 last:mb-0">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 bg-${category.color}/10 rounded-lg flex items-center justify-center`}>
                  <category.icon className={`text-${category.color}`} size={22} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{category.title}</h3>
              </div>
              <p className="text-gray-600 mb-6 ml-13">{category.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {category.partners.map((partner) => (
                  <div
                    key={partner.name}
                    className="bg-gray-50 rounded-xl p-4 hover:bg-primary/5 transition-colors"
                  >
                    <div className="font-semibold text-gray-900 text-sm">{partner.name}</div>
                    <div className="text-gray-500 text-xs mt-1">{partner.industry}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Partnership CTA */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <Handshake className="mx-auto text-white/80 mb-4" size={48} />
          <h2 className="text-3xl font-bold text-white mb-4">
            파트너십을 시작하세요
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            UTTEC과 함께 스마트 솔루션으로 산업 현장의 디지털 전환을 이끌어 보세요.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-gray-100 transition-colors"
          >
            파트너십 문의
          </Link>
        </div>
      </section>

      {/* Back Navigation */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            <ArrowLeft size={20} />
            회사소개로 돌아가기
          </Link>
        </div>
      </section>
    </div>
  );
}
