import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Factory, Leaf } from 'lucide-react';
import { solutions } from '@/lib/data/business-areas';

export const metadata: Metadata = {
  title: '솔루션 | UTTEC',
  description: 'UTTEC의 스마트팩토리, 스마트팜 솔루션을 소개합니다. AI 예지보전과 IoT 기반 정밀농업으로 산업 현장의 디지털 혁신을 이끕니다.',
};

const iconMap: Record<string, React.ElementType> = {
  Factory,
  Leaf,
};

export default function SolutionsPage() {
  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-dark to-primary py-20">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">솔루션</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            40년 산업현장 경험과 AI 기술을 바탕으로
            <br />
            제조업과 농업의 디지털 혁신을 이끕니다
          </p>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {solutions.map((solution) => {
              const IconComponent = iconMap[solution.icon] || Factory;
              return (
                <Link key={solution.id} href={solution.link}>
                  <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full">
                    {/* Header with gradient */}
                    <div className={`bg-gradient-to-r ${solution.bgGradient} p-8 text-white`}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                          <IconComponent size={32} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold">{solution.name}</h2>
                          <p className="text-white/80">{solution.nameEn}</p>
                        </div>
                      </div>
                      <p className="text-white/90 text-lg">{solution.shortDescription}</p>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {solution.description}
                      </p>

                      {/* Features */}
                      <div className="space-y-2 mb-6">
                        {solution.features.map((feature) => (
                          <div key={feature} className="flex items-center gap-2 text-gray-700">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                            {feature}
                          </div>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="flex gap-6 pt-6 border-t border-gray-100">
                        {solution.stats.map((stat) => (
                          <div key={stat.label}>
                            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                            <div className="text-sm text-gray-500">{stat.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <div className="flex items-center gap-2 text-primary font-medium mt-6 group-hover:gap-3 transition-all">
                        자세히 보기
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
