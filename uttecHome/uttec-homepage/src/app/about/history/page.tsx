import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: '연혁 | UTTEC',
  description: 'UTTEC의 40년 기술 혁신의 역사를 소개합니다. 임베디드 시스템에서 AI·IoT 솔루션 기업으로의 여정.',
};

const timeline = [
  {
    era: '2020s',
    title: 'AI·IoT 솔루션 기업으로 전환',
    events: [
      { year: '2026', desc: '기업 홈페이지 리뉴얼, AI 교육 플랫폼 런칭' },
      { year: '2025', desc: '자격시험 가이드 플랫폼 오픈 (uttec-cert)' },
      { year: '2024', desc: 'AI 예지보전 시스템 개발, 스마트팩토리 25개 업체 데모 구축' },
      { year: '2023', desc: 'IoT 센서 기반 스마트팜 솔루션 프로토타입 완성' },
      { year: '2022', desc: 'BLE Mesh, LoRaWAN 기반 산업용 IoT 플랫폼 개발' },
      { year: '2020', desc: '유티텍(UTTEC) 법인 설립, AI·IoT 사업 본격화' },
    ],
  },
  {
    era: '2010s',
    title: '스마트 시스템 및 IoT 선도',
    events: [
      { year: '2019', desc: 'LIN 제어 시스템 개발, 스마트파킹 솔루션 상용화' },
      { year: '2017', desc: 'Zigbee/Thread 기반 IoT 게이트웨이 개발' },
      { year: '2015', desc: '스마트 모터 OBD 진단기 국내 최초 개발 (하이시스 코일팩)' },
      { year: '2012', desc: 'ARM Cortex 기반 산업용 임베디드 보드 시리즈 출시' },
    ],
  },
  {
    era: '2000s',
    title: '반도체 및 디지털 시스템 전문화',
    events: [
      { year: '2008', desc: 'FPGA/Xilinx 기반 영상 처리 시스템 개발' },
      { year: '2005', desc: 'DVD Authoring S/W 및 Media Player 개발 (Authortec Corp)' },
      { year: '2002', desc: 'QuickLogic ASSP Chip/Logic 개발 참여' },
      { year: '2000', desc: 'PCI Board, Video Controller 설계 기술 확보' },
    ],
  },
  {
    era: '1990s',
    title: '대기업 핵심 기술 개발',
    events: [
      { year: '1998', desc: 'Samsung S3C CPU 기반 H/W 설계 (삼성전자)' },
      { year: '1995', desc: 'Digital Set-Top Box, LCD Controller 개발 (삼성전자)' },
      { year: '1992', desc: 'Digital CAM Board 설계 (LG전자)' },
      { year: '1990', desc: 'ARM 프로세서 기반 시스템 설계 시작' },
    ],
  },
  {
    era: '1980s',
    title: '임베디드 기술의 출발',
    events: [
      { year: '1988', desc: 'MCU 펌웨어 및 RTOS 기반 시스템 개발 착수' },
      { year: '1986', desc: '산업용 제어 시스템 H/W 설계 경력 시작' },
    ],
  },
];

export default function HistoryPage() {
  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-dark to-primary py-20">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">연혁</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            40년 기술 혁신의 역사
            <br />
            임베디드에서 AI·IoT까지
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 -translate-x-1/2" />

            {timeline.map((era) => (
              <div key={era.era} className="mb-16 last:mb-0">
                {/* Era header */}
                <div className="relative flex items-center mb-8">
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-12 h-12 bg-primary rounded-full flex items-center justify-center z-10">
                    <span className="text-white font-bold text-sm">{era.era}</span>
                  </div>
                  <div className="ml-16 md:ml-0 md:text-center md:w-full">
                    <h3 className="text-xl font-bold text-gray-900 md:ml-20">{era.title}</h3>
                  </div>
                </div>

                {/* Events */}
                {era.events.map((event, idx) => (
                  <div
                    key={event.year + idx}
                    className={`relative flex items-start mb-6 ${
                      idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                  >
                    {/* Dot */}
                    <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 bg-primary/60 rounded-full mt-2 z-10" />

                    {/* Content */}
                    <div className={`ml-12 md:ml-0 md:w-1/2 ${idx % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                      <div className="bg-gray-50 rounded-xl p-4 hover:bg-primary/5 transition-colors">
                        <span className="text-primary font-bold text-lg">{event.year}</span>
                        <p className="text-gray-700 mt-1">{event.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Back Navigation */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            <ArrowLeft size={20} />
            회사소개로 돌아가기
          </Link>
        </div>
      </section>
    </div>
  );
}
