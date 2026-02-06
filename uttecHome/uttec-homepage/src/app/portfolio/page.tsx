import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Monitor, Building2, Cpu } from 'lucide-react';
import { demoSites, demoCategories } from '@/lib/data/demos';

export const metadata: Metadata = {
  title: '포트폴리오 | UTTEC',
  description: 'UTTEC의 스마트팩토리 구축 사례와 데모 사이트를 확인하세요. 25개 이상의 실제 구축 사례를 보유하고 있습니다.',
};

export default function PortfolioPage() {
  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-dark to-factory py-20">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">포트폴리오</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            25개 이상의 스마트팩토리 구축 사례로
            <br />
            검증된 기술력을 확인하세요
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Building2, value: '25+', label: '구축 사례' },
              { icon: Cpu, value: '1,500+', label: '모니터링 센서' },
              { icon: Monitor, value: '11', label: '산업 분야' },
              { value: '35%', label: '평균 다운타임 감소' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">산업 분야별 구축 현황</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {demoCategories.filter(c => c.id !== 'all').map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-2xl font-bold text-primary">{category.count}</div>
                <div className="text-sm text-gray-600">{category.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cases */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">주요 구축 사례</h2>
              <p className="text-gray-600 mt-2">다양한 산업 분야의 스마트팩토리 구축 사례</p>
            </div>
            <Link
              href="/portfolio/demos"
              className="hidden md:inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
            >
              전체 보기
              <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {demoSites.slice(0, 8).map((demo) => (
              <div
                key={demo.id}
                className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div
                  className="h-24 flex items-center justify-center"
                  style={{ backgroundColor: demo.themeColor }}
                >
                  <span className="text-white/80 font-medium">{demo.name}</span>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-3">{demo.description}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">센서 {demo.sensors}개</span>
                    <span className="text-primary font-medium">ROI {demo.roi}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/portfolio/demos"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
            >
              전체 데모 사이트 보기
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
