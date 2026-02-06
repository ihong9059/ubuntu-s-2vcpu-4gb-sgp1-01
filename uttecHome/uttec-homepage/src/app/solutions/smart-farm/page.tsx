import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Thermometer, Droplets, Sun, Sprout, BarChart3, Smartphone } from 'lucide-react';

export const metadata: Metadata = {
  title: '스마트팜 | UTTEC',
  description: 'IoT 센서와 AI 분석을 통해 농업의 과학화를 실현합니다. 정밀 농업으로 생산성을 극대화합니다.',
};

export default function SmartFarmPage() {
  const features = [
    {
      icon: Thermometer,
      title: '환경 모니터링',
      desc: '온도, 습도, CO2, 조도 등 재배 환경을 실시간으로 모니터링합니다.',
    },
    {
      icon: Droplets,
      title: '자동 관개',
      desc: '토양 수분과 작물 상태에 따라 관개를 자동으로 제어합니다.',
    },
    {
      icon: Sun,
      title: '환기 제어',
      desc: '온실 내 환경 조건에 따라 환기 시스템을 자동으로 조절합니다.',
    },
    {
      icon: Sprout,
      title: '생육 분석',
      desc: '작물의 생육 데이터를 분석하여 최적의 재배 조건을 제안합니다.',
    },
    {
      icon: BarChart3,
      title: '수확량 예측',
      desc: 'AI가 과거 데이터와 현재 상태를 분석하여 수확량을 예측합니다.',
    },
    {
      icon: Smartphone,
      title: '모바일 관리',
      desc: '스마트폰으로 언제 어디서나 농장을 모니터링하고 제어할 수 있습니다.',
    },
  ];

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-br from-farm to-green-800 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-6 text-white">
              Smart Farm Solution
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              IoT와 AI로
              <br />
              농업의 과학화 실현
            </h1>
            <p className="text-xl text-white/80 mb-8">
              환경 데이터 기반의 정밀 농업으로 생산성을 극대화하고
              물과 에너지 사용을 최적화합니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-farm font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                도입 문의
                <ArrowRight size={20} />
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
              { value: '200+', label: '센서 노드' },
              { value: '25%', label: '생산성 향상' },
              { value: '30%', label: '물 사용 절감' },
              { value: '24/7', label: '자동 모니터링' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-farm">{stat.value}</div>
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
            <span className="text-farm font-semibold">Features</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">주요 기능</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              농업 현장에 최적화된 IoT 기반 스마트팜 시스템의 핵심 기능을 소개합니다.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-farm/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="text-farm" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-farm">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            스마트팜 도입을 고민 중이신가요?
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            전문가가 농장 환경에 맞는 최적의 솔루션을 제안해 드립니다.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-farm font-semibold rounded-xl hover:bg-gray-100 transition-colors"
          >
            무료 상담 신청
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
