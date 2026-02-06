import { Metadata } from 'next';
import { ArrowRight, BookOpen, CheckCircle, BarChart, Award, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: '자격시험 가이드 | UTTEC',
  description: '국가공인 자격증 학습 가이드 플랫폼. 체계적인 학습 자료와 모의고사로 합격을 지원합니다.',
};

export default function CertificationPage() {
  const categories = [
    { name: '무역/물류', count: 12, color: 'bg-blue-500' },
    { name: '정보처리', count: 8, color: 'bg-green-500' },
    { name: '경영/회계', count: 10, color: 'bg-purple-500' },
    { name: '안전/환경', count: 6, color: 'bg-orange-500' },
    { name: '전기/전자', count: 8, color: 'bg-red-500' },
    { name: '기계/설비', count: 6, color: 'bg-teal-500' },
  ];

  const features = [
    { icon: BookOpen, title: '과목별 학습', desc: '핵심 이론을 과목별로 정리' },
    { icon: CheckCircle, title: '기출문제', desc: '최신 기출문제 풀이 및 해설' },
    { icon: BarChart, title: '모의고사', desc: '실전과 동일한 환경의 모의시험' },
    { icon: Award, title: '합격 전략', desc: '시험 유형별 맞춤 합격 전략' },
  ];

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-br from-certification to-orange-700 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-6 text-white">
              Certification Guide
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              국가공인 자격시험
              <br />
              학습 가이드
            </h1>
            <p className="text-xl text-white/80 mb-8">
              50개 이상의 자격증에 대한 체계적인 학습 가이드와
              10,000문제 이상의 기출문제를 제공합니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://uttec-cert.duckdns.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-certification font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                학습 시작하기
                <ExternalLink size={20} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '50+', label: '자격증 종류' },
              { value: '10,000+', label: '문제은행' },
              { value: '2,000+', label: '합격자' },
              { value: '85%', label: '평균 합격률' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-certification">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="w-14 h-14 bg-certification/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="text-certification" size={28} />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-certification font-semibold">Categories</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">자격증 분야</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              다양한 분야의 국가공인 자격증 학습을 지원합니다.
            </p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <div
                key={category.name}
                className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className={`w-12 h-12 ${category.color} rounded-xl mx-auto mb-3 opacity-20`} />
                <h3 className="font-bold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count}개 자격증</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-certification">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            목표 자격증, 이번에 꼭 합격하세요
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            체계적인 학습 가이드와 실전 모의고사로 합격을 도와드립니다.
          </p>
          <a
            href="https://uttec-cert.duckdns.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-certification font-semibold rounded-xl hover:bg-gray-100 transition-colors"
          >
            무료로 시작하기
            <ArrowRight size={20} />
          </a>
        </div>
      </section>
    </div>
  );
}
