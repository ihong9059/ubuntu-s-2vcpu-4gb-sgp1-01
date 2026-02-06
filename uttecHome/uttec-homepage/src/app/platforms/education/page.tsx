import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Code, Cpu, BookOpen, Users, Play, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI 교육 플랫폼 | UTTEC',
  description: '하드웨어 제어와 AI를 결합한 실습 중심 교육 플랫폼. 웹에서 C언어와 아두이노를 배워보세요.',
};

export default function EducationPage() {
  const courses = [
    {
      level: '입문',
      title: 'C언어 기초',
      desc: '변수, 조건문, 반복문 등 프로그래밍의 기본 개념을 배웁니다.',
      lessons: 20,
    },
    {
      level: '초급',
      title: '아두이노 제어',
      desc: 'C언어로 아두이노를 제어하고 LED, 센서를 다루는 방법을 배웁니다.',
      lessons: 25,
    },
    {
      level: '중급',
      title: '센서 활용',
      desc: '다양한 센서를 활용한 프로젝트를 진행합니다.',
      lessons: 30,
    },
    {
      level: '고급',
      title: 'AI 프로젝트',
      desc: '머신러닝과 하드웨어를 결합한 AI 프로젝트를 완성합니다.',
      lessons: 20,
    },
  ];

  const features = [
    { icon: Code, title: '웹 기반 실습', desc: '설치 없이 브라우저에서 바로 코딩 실습' },
    { icon: Cpu, title: '실제 하드웨어 연동', desc: '아두이노, 라즈베리파이와 실시간 연결' },
    { icon: BookOpen, title: '단계별 커리큘럼', desc: '초등학생부터 성인까지 맞춤 과정' },
    { icon: Users, title: '1:1 멘토링', desc: '전문 강사의 실시간 피드백' },
  ];

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-br from-education to-purple-900 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-6 text-white">
              AI Education Platform
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              하드웨어 + AI
              <br />
              융합 교육 플랫폼
            </h1>
            <p className="text-xl text-white/80 mb-8">
              웹 브라우저에서 C언어를 배우고 실제 아두이노를 제어하며
              AI 프로젝트까지 완성하는 실습 중심 교육 플랫폼입니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://uttec-edu.duckdns.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-education font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                플랫폼 바로가기
                <ExternalLink size={20} />
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/20"
              >
                교육 문의
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="w-14 h-14 bg-education/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="text-education" size={28} />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-education font-semibold">Curriculum</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">교육 과정</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              초보자부터 전문가까지 단계별로 구성된 커리큘럼을 제공합니다.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <div
                key={course.title}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="inline-block px-3 py-1 bg-education/10 text-education text-sm font-medium rounded-full mb-4">
                  {course.level}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{course.desc}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Play size={16} />
                  <span>{course.lessons}개 레슨</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-education">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            지금 바로 무료로 시작하세요
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            회원가입 없이 체험 코스를 무료로 수강할 수 있습니다.
          </p>
          <a
            href="https://uttec-edu.duckdns.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-education font-semibold rounded-xl hover:bg-gray-100 transition-colors"
          >
            무료 체험하기
            <ArrowRight size={20} />
          </a>
        </div>
      </section>
    </div>
  );
}
