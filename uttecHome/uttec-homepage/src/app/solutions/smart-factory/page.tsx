import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Monitor, Cpu, Bell, BarChart3, Building2, Wrench } from 'lucide-react';

export const metadata: Metadata = {
  title: '스마트팩토리 | UTTEC',
  description: 'AI 기반 예지보전 시스템으로 제조업의 디지털 전환을 이끕니다. 설비 고장을 사전에 예측하고 예방합니다.',
};

export default function SmartFactoryPage() {
  const features = [
    {
      icon: Monitor,
      title: '실시간 모니터링',
      desc: '전 설비의 상태를 실시간으로 모니터링하고 대시보드로 시각화합니다.',
    },
    {
      icon: Cpu,
      title: 'AI 예지보전',
      desc: 'AI가 설비 데이터를 분석하여 고장을 사전에 예측하고 알려줍니다.',
    },
    {
      icon: Bell,
      title: '이상 감지 알림',
      desc: '비정상 패턴 감지 시 즉시 알림을 발송하여 신속한 대응이 가능합니다.',
    },
    {
      icon: BarChart3,
      title: '성능 분석',
      desc: 'OEE, 가동률, 품질률 등 핵심 KPI를 분석하고 개선점을 제안합니다.',
    },
    {
      icon: Building2,
      title: '다중 공장 관리',
      desc: '여러 공장을 하나의 시스템에서 통합 관리할 수 있습니다.',
    },
    {
      icon: Wrench,
      title: '정비 이력 관리',
      desc: '설비별 정비 이력을 체계적으로 관리하고 분석합니다.',
    },
  ];

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-br from-factory to-primary-dark py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-6 text-white">
              Smart Factory Solution
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              AI 예지보전으로
              <br />
              설비 다운타임 Zero
            </h1>
            <p className="text-xl text-white/80 mb-8">
              40년 산업현장 경험과 AI 기술을 결합한 스마트팩토리 솔루션으로
              설비 고장을 사전에 예측하고 예방합니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/portfolio/demos"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-factory font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                데모 체험하기
                <ArrowRight size={20} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/20"
              >
                도입 문의
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '25+', label: '구축 사례' },
              { value: '1,500+', label: '모니터링 센서' },
              { value: '35%', label: '다운타임 감소' },
              { value: '15개월', label: '평균 ROI' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-factory">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-factory font-semibold">Features</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">주요 기능</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              제조 현장에 최적화된 AI 예지보전 시스템의 핵심 기능을 소개합니다.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-factory/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="text-factory" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-factory">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            25개 이상의 구축 사례를 직접 확인하세요
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            다양한 업종의 스마트팩토리 구축 사례를 실시간 데모로 체험할 수 있습니다.
          </p>
          <Link
            href="/portfolio/demos"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-factory font-semibold rounded-xl hover:bg-gray-100 transition-colors"
          >
            데모 사이트 바로가기
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
