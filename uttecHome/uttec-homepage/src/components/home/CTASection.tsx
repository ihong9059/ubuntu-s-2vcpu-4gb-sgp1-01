'use client';

import Link from 'next/link';
import { ArrowRight, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { companyInfo } from '@/lib/data/navigation';

export default function CTASection() {
  return (
    <section className="py-20 md:py-28 bg-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              스마트 솔루션 도입을 고민 중이신가요?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              40년 산업현장 경험의 전문가가 귀사의 환경에 맞는
              최적의 솔루션을 제안해 드립니다.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Link
              href="/contact"
              className="group flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-light transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              무료 상담 신청
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <a
              href={`tel:${companyInfo.phone.replace(/-/g, '')}`}
              className="flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/20"
            >
              <Phone size={20} />
              {companyInfo.phone}
            </a>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 text-gray-400"
          >
            <a
              href={`mailto:${companyInfo.email}`}
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Mail size={18} />
              {companyInfo.email}
            </a>
            <span className="hidden sm:inline">|</span>
            <span>{companyInfo.address}</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
