'use client';

import Link from 'next/link';
import { ArrowRight, Factory, Leaf, GraduationCap, Award, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { businessAreas } from '@/lib/data/business-areas';

const iconMap: Record<string, React.ElementType> = {
  Factory,
  Leaf,
  GraduationCap,
  Award,
  Compass,
};

const iconBgMap: Record<string, string> = {
  factory: 'bg-factory/10 text-factory',
  farm: 'bg-farm/10 text-farm',
  education: 'bg-education/10 text-education',
  certification: 'bg-certification/10 text-certification',
};

export default function BusinessAreasSection() {
  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Our Business
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            사업 영역
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            40년 산업현장 노하우와 최신 AI 기술을 바탕으로
            제조업, 농업, 교육 분야의 디지털 혁신을 이끕니다
          </p>
        </motion.div>

        {/* Business Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businessAreas.map((area, index) => {
            const IconComponent = iconMap[area.icon] || Factory;
            return (
              <motion.div
                key={area.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={area.link}>
                  <div className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
                    {/* Icon */}
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                        iconBgMap[area.color] || 'bg-primary/10 text-primary'
                      }`}
                    >
                      <IconComponent size={28} />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                      {area.name}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {area.shortDescription}
                    </p>

                    {/* Features Preview */}
                    <ul className="space-y-2 mb-4">
                      {area.features.slice(0, 3).map((feature) => (
                        <li
                          key={feature}
                          className="text-sm text-gray-500 flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* Stats */}
                    <div className="flex gap-4 pt-4 border-t border-gray-100">
                      {area.stats.slice(0, 2).map((stat) => (
                        <div key={stat.label}>
                          <div className="text-lg font-bold text-gray-900">
                            {stat.value}
                          </div>
                          <div className="text-xs text-gray-500">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center gap-1 text-primary font-medium mt-4 group-hover:gap-2 transition-all">
                      자세히 보기
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
