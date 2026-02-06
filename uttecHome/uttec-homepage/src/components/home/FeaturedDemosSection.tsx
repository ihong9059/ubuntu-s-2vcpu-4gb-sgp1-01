'use client';

import Link from 'next/link';
import { ArrowRight, Monitor, Cpu, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';
import { featuredDemos } from '@/lib/data/demos';

export default function FeaturedDemosSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
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
            Live Demo
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            실시간 데모 체험
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            25개 이상의 스마트팩토리 구축 사례를 실시간 데모로 확인하세요.
            <br className="hidden md:block" />
            AI 예지보전 시스템이 어떻게 설비를 모니터링하는지 직접 체험해 보실 수 있습니다.
          </p>
        </motion.div>

        {/* Demo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredDemos.map((demo, index) => (
            <motion.div
              key={demo.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
                {/* Demo Preview Header */}
                <div
                  className="h-32 relative flex items-center justify-center"
                  style={{ backgroundColor: demo.themeColor }}
                >
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative flex items-center gap-3">
                    <Monitor className="text-white/80" size={24} />
                    <Cpu className="text-white/80" size={20} />
                    <Wifi className="text-white/80" size={20} />
                  </div>
                  {/* Live Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-white text-xs font-medium">LIVE</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                    {demo.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">{demo.description}</p>

                  {/* Equipment Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {demo.equipment.slice(0, 3).map((eq) => (
                      <span
                        key={eq}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md"
                      >
                        {eq}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 pt-3 border-t border-gray-100">
                    <span>센서 {demo.sensors}개</span>
                    <span>ROI {demo.roi}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <Link
            href="/portfolio/demos"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-xl group"
          >
            전체 데모 사이트 보기
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
          <p className="text-gray-500 text-sm mt-3">
            25개 이상의 실제 구축 사례를 확인하세요
          </p>
        </motion.div>
      </div>
    </section>
  );
}
