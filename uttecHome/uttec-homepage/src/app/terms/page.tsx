import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '이용약관 | UTTEC',
  description: '(주)유티텍 홈페이지 이용약관을 안내합니다.',
};

export default function TermsPage() {
  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-800 to-gray-900 py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl font-bold mb-3">이용약관</h1>
          <p className="text-white/70">시행일: 2026년 01월 01일</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-gray max-w-none">
            {[
              {
                title: '제1조 (목적)',
                content: `본 약관은 (주)유티텍(이하 "회사")이 운영하는 웹사이트(이하 "사이트")에서 제공하는 서비스(이하 "서비스")의 이용조건 및 절차, 이용자와 회사의 권리·의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.`,
              },
              {
                title: '제2조 (정의)',
                content: `1. "사이트"란 회사가 서비스를 이용자에게 제공하기 위하여 컴퓨터 등 정보통신설비를 이용하여 설정한 가상의 영업장을 말합니다.
2. "이용자"란 사이트에 접속하여 본 약관에 따라 회사가 제공하는 서비스를 이용하는 자를 말합니다.
3. "서비스"란 회사가 사이트를 통해 제공하는 회사 소개, 솔루션 안내, 문의 접수, 교육 플랫폼 연결 등 일체의 서비스를 말합니다.`,
              },
              {
                title: '제3조 (약관의 효력 및 변경)',
                content: `1. 본 약관은 사이트에 게시하여 공시하며, 이용자가 사이트를 이용함으로써 효력이 발생합니다.
2. 회사는 합리적인 사유가 발생할 경우 관련 법령에 위배되지 않는 범위 안에서 본 약관을 변경할 수 있으며, 변경된 약관은 사이트에 공지함으로써 효력이 발생합니다.
3. 이용자는 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단할 수 있습니다.`,
              },
              {
                title: '제4조 (서비스의 제공)',
                content: `회사는 다음의 서비스를 제공합니다.

1. 회사 및 솔루션 정보 제공
   - 스마트팩토리, 스마트팜, AI 교육 등 사업 영역 소개
2. 데모 사이트 연결
   - 스마트팩토리 모니터링 데모 체험
3. 문의 접수
   - 솔루션 도입 상담, 파트너십 문의 등
4. 외부 플랫폼 연결
   - AI 교육 플랫폼, 자격시험 가이드, 진로지도 플랫폼`,
              },
              {
                title: '제5조 (서비스의 중단)',
                content: `1. 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.
2. 회사는 서비스의 제공에 필요한 경우 정기점검을 실시할 수 있으며, 정기점검시간은 사이트에 공지한 바에 따릅니다.`,
              },
              {
                title: '제6조 (이용자의 의무)',
                content: `이용자는 다음 행위를 하여서는 안 됩니다.

1. 타인의 정보를 도용하는 행위
2. 회사의 서비스 정보를 이용하여 얻은 정보를 회사의 사전 승낙 없이 복제, 유통, 조장하거나 상업적으로 이용하는 행위
3. 회사의 저작권, 제3자의 저작권 등 기타 권리를 침해하는 행위
4. 공공질서 및 미풍양속에 위반되는 내용의 정보, 문장, 도형, 음성 등을 타인에게 유포하는 행위
5. 서비스와 관련된 설비의 오동작이나 정보 등의 파괴 및 혼란을 유발시키는 컴퓨터 바이러스 감염 자료를 등록 또는 유포하는 행위
6. 기타 불법적이거나 부당한 행위`,
              },
              {
                title: '제7조 (회사의 의무)',
                content: `1. 회사는 관련 법령과 본 약관이 금지하거나 미풍양속에 반하는 행위를 하지 않으며, 지속적이고 안정적으로 서비스를 제공하기 위하여 최선을 다하여 노력합니다.
2. 회사는 이용자가 안전하게 서비스를 이용할 수 있도록 개인정보(신용정보 포함) 보호를 위해 보안시스템을 갖추어야 하며, 개인정보처리방침을 공시하고 준수합니다.`,
              },
              {
                title: '제8조 (저작권의 귀속)',
                content: `1. 사이트에 게시된 콘텐츠(텍스트, 이미지, 디자인, 소스코드 등)의 저작권은 회사에 귀속됩니다.
2. 이용자는 사이트를 이용함으로써 얻은 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 등 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.`,
              },
              {
                title: '제9조 (면책조항)',
                content: `1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
2. 회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.
3. 회사는 사이트를 통해 연결되는 외부 플랫폼(데모 사이트, 교육 플랫폼 등)의 서비스 내용에 대해서는 책임을 지지 않습니다.`,
              },
              {
                title: '제10조 (분쟁해결)',
                content: `1. 회사와 이용자 간에 발생한 분쟁에 관한 소송은 대전지방법원을 관할 법원으로 합니다.
2. 회사와 이용자 간에 제기된 소송에는 대한민국법을 적용합니다.`,
              },
              {
                title: '부칙',
                content: `본 약관은 2026년 1월 1일부터 시행합니다.`,
              },
            ].map((section, idx) => (
              <div key={idx} className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h2>
                <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Info */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">(주)유티텍</h3>
              <div className="text-gray-600 text-sm space-y-1">
                <p>대표이사: 홍광선</p>
                <p>주소: 대전광역시 유성구 테크노2로 314, 2층 (관평동)</p>
                <p>전화: 042-716-8884 | 팩스: 042-716-8883</p>
                <p>이메일: info@uttec.co.kr</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Nav */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <Link
            href="/privacy"
            className="text-primary font-semibold hover:underline"
          >
            개인정보처리방침 보기
          </Link>
        </div>
      </section>
    </div>
  );
}
