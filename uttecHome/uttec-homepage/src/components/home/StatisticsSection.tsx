'use client';

import { motion } from 'framer-motion';
import { companyStats } from '@/lib/data/statistics';

export default function StatisticsSection() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-r from-primary-dark to-primary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {companyStats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {stat.value}
                <span className="text-2xl md:text-3xl text-white/80">
                  {stat.suffix}
                </span>
              </div>
              <div className="text-white/70 font-medium">{stat.label}</div>
              {stat.description && (
                <div className="text-sm text-white/50 mt-1">{stat.description}</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
