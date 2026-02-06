import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Cpu, CircuitBoard, Wifi, Brain } from 'lucide-react';

export const metadata: Metadata = {
  title: '조직/인력 | UTTEC',
  description: 'UTTEC의 핵심 전문가 팀을 소개합니다. 40년 이상의 임베디드, IoT, AI 전문 경력.',
};

const teamMembers = [
  {
    name: '홍광선',
    nameEn: 'Kwangsun Hong',
    role: '대표이사 / CEO',
    career: '40년+',
    color: 'primary',
    specialties: [
      'ARM/FPGA 임베디드 시스템',
      'BLE Mesh, Zigbee, LoRaWAN',
      'AI Service 개발',
      'Smart Parking/Factory',
    ],
    experience: [
      { company: '삼성전자', detail: 'Digital Set-Top Box, LCD/Printer Controller 개발' },
      { company: '하이시스 코일팩', detail: '국내 최초 스마트 모터 OBD 진단기 개발' },
      { company: '유티텍 (현재)', detail: 'LIN 제어 시스템, AI 서비스, IoT 솔루션 개발' },
    ],
    techIcons: [Brain, Wifi],
  },
  {
    name: '임호균',
    nameEn: 'Hokyun Lim',
    role: '이사 / CTO',
    career: '38년+',
    color: 'factory',
    specialties: [
      'CPU/프로세서 (ARM, TI DSP, ARC)',
      'H/W 설계 (PCI, FPGA, Power)',
      'Modbus, CAN, RS-485 프로토콜',
      'RTOS, WinCE, Linux, Zephyr OS',
    ],
    experience: [
      { company: 'Authortec Corp (미국)', detail: 'DVD authoring S/W, Media player 개발' },
      { company: 'QuickLogic Corp (미국)', detail: 'ASSP Chip/Logic 개발' },
      { company: '삼성전자', detail: 'ARM, S3C CPU 기반 H/W 설계' },
      { company: 'LG전자', detail: 'Digital CAM Board 설계' },
    ],
    techIcons: [Cpu, CircuitBoard],
  },
];

export default function TeamPage() {
  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-dark to-primary py-20">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">조직/인력</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            산업 현장의 디지털 혁신을 이끄는
            <br />
            최고의 전문가 팀
          </p>
        </div>
      </section>

      {/* Team Overview Stats */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '78년+', label: '합산 기술 경력' },
              { value: '15건+', label: '특허/기술 보유' },
              { value: '100+', label: '수행 프로젝트' },
              { value: '2시간', label: '기술지원 응답' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold">Our Team</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">핵심 인력</h2>
          </div>

          <div className="space-y-12 max-w-5xl mx-auto">
            {teamMembers.map((member) => (
              <div key={member.name} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className={`bg-${member.color} h-2`} />
                <div className="p-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Profile */}
                    <div className="md:w-1/3">
                      <div className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto md:mx-0 mb-4">
                        <div className="flex gap-2">
                          {member.techIcons.map((Icon, i) => (
                            <Icon key={i} className="text-gray-400" size={32} />
                          ))}
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 text-center md:text-left">
                        {member.name}
                      </h3>
                      <p className="text-gray-500 text-center md:text-left">{member.nameEn}</p>
                      <p className="text-primary font-semibold mt-1 text-center md:text-left">
                        {member.role}
                      </p>
                      <div className="mt-3 inline-block px-3 py-1 bg-primary/10 rounded-full text-primary text-sm font-medium">
                        경력 {member.career}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="md:w-2/3">
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">핵심 기술</h4>
                        <div className="flex flex-wrap gap-2">
                          {member.specialties.map((spec) => (
                            <span
                              key={spec}
                              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">주요 경력</h4>
                        <div className="space-y-3">
                          {member.experience.map((exp) => (
                            <div key={exp.company} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-primary/60 rounded-full mt-2 flex-shrink-0" />
                              <div>
                                <span className="font-semibold text-gray-900">{exp.company}</span>
                                <p className="text-gray-600 text-sm">{exp.detail}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Competency */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-semibold">Core Competency</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">UTTEC 핵심 역량</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Cpu,
                title: '임베디드 시스템',
                items: ['ARM/FPGA', 'MCU 개발', '펌웨어', 'RTOS/Linux'],
              },
              {
                icon: Wifi,
                title: 'IoT/통신 프로토콜',
                items: ['BLE Mesh', 'Zigbee/LoRa', 'Modbus/CAN', 'RS-485/232'],
              },
              {
                icon: Brain,
                title: 'AI/스마트 솔루션',
                items: ['AI 예지보전', '스마트 팩토리', '스마트 팜', 'AI 서비스'],
              },
            ].map((comp) => (
              <div key={comp.title} className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <comp.icon className="text-primary" size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{comp.title}</h3>
                <ul className="space-y-1">
                  {comp.items.map((item) => (
                    <li key={item} className="text-gray-600 text-sm">{item}</li>
                  ))}
                </ul>
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
