import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/privacy')({
  component: PrivacyPolicy,
})

function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="prose prose-gray max-w-none">
        <h1 className="text-3xl font-light mb-8">개인정보처리방침</h1>
        
        <p className="text-sm text-gray-600 mb-8">시행일: 2025년 1월 22일</p>

        <section className="mb-8">
          <h2 className="text-xl font-normal mb-4">1. 개인정보의 수집 및 이용 목적</h2>
          <p>Ⓡ RITE는 다음과 같은 목적으로 개인정보를 수집 및 이용합니다:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>이벤트 주최자 회원가입 및 관리</li>
            <li>DJ 이벤트 생성 및 관리</li>
            <li>DJ 제출 자료 관리</li>
            <li>Instagram 계정 연동 서비스 제공</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-normal mb-4">2. 수집하는 개인정보 항목</h2>
          
          <h3 className="text-lg font-normal mb-2">이벤트 주최자</h3>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>이메일 주소</li>
            <li>이름 (선택)</li>
            <li>Instagram 계정 정보 (연동 시)</li>
          </ul>

          <h3 className="text-lg font-normal mb-2">DJ</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Instagram 핸들 (@username)</li>
            <li>게스트 리스트 (이름, 전화번호)</li>
            <li>계좌 정보 (은행명, 계좌번호, 예금주)</li>
            <li>주민등록번호 (세금 처리 목적)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-normal mb-4">3. 개인정보의 보유 및 이용 기간</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>이벤트 종료 후 1년간 보관</li>
            <li>세무 관련 정보는 관련 법령에 따라 5년간 보관</li>
            <li>회원 탈퇴 시 즉시 파기</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-normal mb-4">4. 개인정보의 제3자 제공</h2>
          <p>RITE는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우는 예외로 합니다:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의거하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-normal mb-4">5. 개인정보의 안전성 확보 조치</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>SSL 암호화 통신</li>
            <li>주민등록번호 등 민감정보 암호화 저장</li>
            <li>접근 권한 관리</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-normal mb-4">6. 이용자의 권리</h2>
          <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>개인정보 열람 요구</li>
            <li>개인정보 정정·삭제 요구</li>
            <li>개인정보 처리 정지 요구</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-normal mb-4">7. 개인정보 보호책임자</h2>
          <p>이메일: privacy@rite.party</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-normal mb-4">8. 개인정보처리방침 변경</h2>
          <p>이 개인정보처리방침은 법령이나 서비스의 변경사항을 반영하기 위한 목적 등으로 변경될 수 있습니다.</p>
        </section>
      </div>
    </div>
  )
}