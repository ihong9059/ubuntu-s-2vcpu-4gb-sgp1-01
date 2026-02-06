import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '개인정보처리방침 | UTTEC',
  description: '(주)유티텍의 개인정보처리방침을 안내합니다.',
};

export default function PrivacyPage() {
  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-800 to-gray-900 py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl font-bold mb-3">개인정보처리방침</h1>
          <p className="text-white/70">시행일: 2026년 01월 01일</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-8 leading-relaxed">
              (주)유티텍(이하 &quot;회사&quot;)은 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
            </p>

            {[
              {
                title: '제1조 (개인정보의 처리 목적)',
                content: `회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.

1. 홈페이지 문의 접수 및 처리
   - 문의 내용 확인, 상담 및 회신, 서비스 안내

2. 솔루션 도입 상담
   - 스마트팩토리, 스마트팜 등 솔루션 도입 관련 상담 및 견적 제공

3. 교육 서비스 제공
   - AI 교육 플랫폼 회원 관리, 교육 과정 안내`,
              },
              {
                title: '제2조 (처리하는 개인정보 항목)',
                content: `회사는 다음의 개인정보 항목을 처리하고 있습니다.

1. 문의 접수 (필수)
   - 회사명, 담당자명, 이메일, 전화번호, 문의 내용

2. 자동 수집 항목
   - IP 주소, 쿠키, 방문 일시, 서비스 이용 기록`,
              },
              {
                title: '제3조 (개인정보의 처리 및 보유기간)',
                content: `회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.

1. 문의 접수 정보: 문의 처리 완료 후 3년
2. 자동 수집 정보: 수집일로부터 1년`,
              },
              {
                title: '제4조 (개인정보의 제3자 제공)',
                content: `회사는 정보주체의 개인정보를 제1조에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 「개인정보 보호법」 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.`,
              },
              {
                title: '제5조 (개인정보의 파기)',
                content: `회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.

1. 전자적 파일 형태: 복구 및 재생이 불가능한 방법으로 파기
2. 기록물, 인쇄물, 서면: 분쇄기로 분쇄하거나 소각`,
              },
              {
                title: '제6조 (정보주체의 권리·의무)',
                content: `정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.

1. 개인정보 열람 요구
2. 오류 등이 있을 경우 정정 요구
3. 삭제 요구
4. 처리 정지 요구

권리 행사는 서면, 전화, 이메일 등을 통하여 하실 수 있으며, 회사는 이에 대해 지체 없이 조치하겠습니다.`,
              },
              {
                title: '제7조 (개인정보의 안전성 확보조치)',
                content: `회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.

1. 관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육
2. 기술적 조치: 개인정보 암호화, 보안 프로그램 설치 및 갱신
3. 물리적 조치: 전산실, 자료보관실 등의 접근 통제`,
              },
              {
                title: '제8조 (개인정보 보호 책임자)',
                content: `회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호 책임자를 지정하고 있습니다.

개인정보 보호 책임자
- 성명: 홍광선
- 직책: 대표이사
- 연락처: 010-3922-1809
- 이메일: uttec@uttec.co.kr`,
              },
              {
                title: '제9조 (개인정보 처리방침 변경)',
                content: `이 개인정보 처리방침은 2026년 1월 1일부터 적용됩니다. 이전의 개인정보 처리방침은 아래에서 확인하실 수 있습니다.

변경 시 시행 최소 7일 전에 홈페이지를 통해 공지하겠습니다.`,
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
              <h3 className="font-bold text-gray-900 mb-3">문의처</h3>
              <div className="text-gray-600 text-sm space-y-1">
                <p>(주)유티텍 | 대표이사 홍광선</p>
                <p>주소: 대전광역시 유성구 테크노2로 314, 2층 (관평동)</p>
                <p>전화: 010-3922-1809 | 팩스: 042-716-8883</p>
                <p>이메일: uttec@uttec.co.kr</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Nav */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <Link
            href="/terms"
            className="text-primary font-semibold hover:underline"
          >
            이용약관 보기
          </Link>
        </div>
      </section>
    </div>
  );
}
