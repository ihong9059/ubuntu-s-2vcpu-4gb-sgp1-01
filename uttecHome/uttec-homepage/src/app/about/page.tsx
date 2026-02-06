import { Metadata } from 'next';
import Link from 'next/link';
import { Users, Target, Award, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: '회사소개 | UTTEC',
  description: 'UTTEC의 비전과 미션, 40년 산업현장 경험을 바탕으로 한 기술력을 소개합니다.',
};

export default function AboutPage() {
  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-dark to-primary py-20">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">회사소개</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            40년 산업현장 경험과 AI 기술의 융합으로
            <br />
            스마트 솔루션의 새로운 기준을 만듭니다
          </p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-primary font-semibold">Our Vision</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
                산업 현장의 디지털 혁신을 이끄는 파트너
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                유티텍은 40년 이상의 산업현장 경험을 가진 전문가들이 설립한 기업입니다.
                임베디드 시스템, 하드웨어 설계, AI 기술을 융합하여 제조업과 농업의
                디지털 전환을 선도합니다.
              </p>
              <p className="text-gray-600 leading-relaxed">
                단순한 기술 공급자가 아닌, 고객의 현장을 이해하고 실질적인 가치를
                창출하는 진정한 파트너가 되고자 합니다.
              </p>
            </div>
            <div className="bg-gray-100 rounded-2xl p-8 h-80 flex items-center justify-center">
              <span className="text-gray-400">회사 이미지 영역</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold">Core Values</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">핵심 가치</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Users, title: '현장 중심', desc: '40년 산업현장 경험을 바탕으로 한 실용적 솔루션' },
              { icon: Target, title: '기술 혁신', desc: 'AI와 IoT 기술을 활용한 지속적인 혁신 추구' },
              { icon: Award, title: '품질 우선', desc: '철저한 품질 관리와 안정적인 시스템 구축' },
              { icon: Clock, title: '신속 대응', desc: '2시간 이내 기술지원 응답 체계' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="text-primary" size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sub Navigation */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/about/history" className="group block bg-gray-50 rounded-xl p-6 hover:bg-primary hover:text-white transition-colors">
              <h3 className="text-xl font-bold mb-2 group-hover:text-white">연혁</h3>
              <p className="text-gray-600 group-hover:text-white/80">40년 기술 혁신의 역사</p>
            </Link>
            <Link href="/about/team" className="group block bg-gray-50 rounded-xl p-6 hover:bg-primary hover:text-white transition-colors">
              <h3 className="text-xl font-bold mb-2 group-hover:text-white">조직/인력</h3>
              <p className="text-gray-600 group-hover:text-white/80">전문가 팀 소개</p>
            </Link>
            <Link href="/about/partners" className="group block bg-gray-50 rounded-xl p-6 hover:bg-primary hover:text-white transition-colors">
              <h3 className="text-xl font-bold mb-2 group-hover:text-white">파트너사</h3>
              <p className="text-gray-600 group-hover:text-white/80">함께하는 파트너</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
