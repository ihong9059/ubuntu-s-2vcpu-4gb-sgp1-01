'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Monitor, Cpu, Wifi, ExternalLink } from 'lucide-react';
import { demoSites, demoCategories } from '@/lib/data/demos';

export default function DemosPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDemos = demoSites.filter((demo) => {
    const matchesCategory = selectedCategory === 'all' || demo.category === selectedCategory;
    const matchesSearch = demo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      demo.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-dark to-factory py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">데모 사이트</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            25개 이상의 스마트팩토리 구축 사례를 실시간 데모로 확인하세요.
            <br />
            실제 운영 중인 시스템을 직접 체험할 수 있습니다.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="업체명 또는 업종 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {demoCategories.slice(0, 6).map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Demo Grid */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Results Count */}
          <div className="mb-6 text-gray-600">
            총 <span className="font-semibold text-gray-900">{filteredDemos.length}</span>개의 데모 사이트
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDemos.map((demo) => (
              <div
                key={demo.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                {/* Preview Header */}
                <div
                  className="h-36 relative flex items-center justify-center"
                  style={{ backgroundColor: demo.themeColor }}
                >
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative flex items-center gap-3">
                    <Monitor className="text-white/80" size={28} />
                    <Cpu className="text-white/80" size={24} />
                    <Wifi className="text-white/80" size={24} />
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
                    {demo.equipment.length > 3 && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                        +{demo.equipment.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-100">
                    <span>센서 {demo.sensors}개</span>
                    <span>ROI {demo.roi}</span>
                  </div>

                  {/* Demo Button */}
                  <a
                    href={`https://uttec-sensor.duckdns.org${demo.demoUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-primary/10 text-primary font-medium rounded-lg hover:bg-primary hover:text-white transition-colors"
                  >
                    데모 보기
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredDemos.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="mt-4 text-primary hover:underline"
              >
                필터 초기화
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            우리 공장에도 도입하고 싶으신가요?
          </h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            전문가가 공장 환경을 분석하고 최적의 솔루션을 제안해 드립니다.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
          >
            도입 문의하기
          </Link>
        </div>
      </section>
    </div>
  );
}
