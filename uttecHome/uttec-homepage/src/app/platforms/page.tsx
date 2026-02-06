import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, GraduationCap, Award, Compass } from 'lucide-react';
import { platforms } from '@/lib/data/business-areas';

export const metadata: Metadata = {
  title: '플랫폼 | UTTEC',
  description: 'UTTEC의 AI 교육, 진로지도, 자격시험 학습 플랫폼을 소개합니다.',
};

const iconMap: Record<string, React.ElementType> = {
  GraduationCap,
  Award,
  Compass,
};

export default function PlatformsPage() {
  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-br from-education to-purple-900 py-20">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">플랫폼</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            AI 교육, 진로지도, 자격시험 학습 플랫폼으로
            <br />
            개인의 성장을 지원합니다
          </p>
        </div>
      </section>

      {/* Platforms Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {platforms.map((platform) => {
              const IconComponent = iconMap[platform.icon] || GraduationCap;
              return (
                <Link key={platform.id} href={platform.link}>
                  <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full">
                    {/* Header with gradient */}
                    <div className={`bg-gradient-to-r ${platform.bgGradient} p-6 text-white`}>
                      <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                        <IconComponent size={28} />
                      </div>
                      <h2 className="text-xl font-bold">{platform.name}</h2>
                      <p className="text-white/80 text-sm">{platform.nameEn}</p>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                        {platform.shortDescription}
                      </p>

                      {/* Features */}
                      <div className="space-y-2 mb-4">
                        {platform.features.slice(0, 3).map((feature) => (
                          <div key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                            {feature}
                          </div>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="flex gap-4 pt-4 border-t border-gray-100">
                        {platform.stats.slice(0, 2).map((stat) => (
                          <div key={stat.label}>
                            <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                            <div className="text-xs text-gray-500">{stat.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <div className="flex items-center gap-2 text-primary font-medium mt-4 group-hover:gap-3 transition-all text-sm">
                        자세히 보기
                        <ArrowRight size={16} />
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
