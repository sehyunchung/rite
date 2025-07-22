import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/terms')({
  component: TermsOfService,
})

function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="prose prose-gray max-w-none">
        <h1 className="text-3xl font-light mb-8">서비스 이용약관</h1>
        
        <p className="text-sm text-gray-600 mb-8">시행일: 2025년 7월 22일</p>

        <section className="mb-8">
          <h2 className="text-xl font-normal mb-4">제1조 (목적)</h2>
          <p>이 약관은 Ⓡ RITE (이하 "서비스")가 제공하는 DJ 이벤트 관리 플랫폼 서비스의 이용조건 및 절차, 이용자와 서비스의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-normal mb-4">제2조 (정의)</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>"서비스"</strong>란 RITE가 제공하는 DJ 이벤트 관리 플랫폼을 의미합니다.</li>
            <li><strong>"이용자"</strong>란 이 약관에 따라 서비스를 이용하는 주최자와 DJ를 포함합니다.</li>
            <li><strong>"주최자"</strong>란 이벤트를 생성하고 관리하는 회원을 의미합니다.</li>
            <li><strong>"DJ"</strong>란 이벤트에 참여하여 자료를 제출하는 자를 의미합니다.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-normal mb-4">제3조 (약관의 효력 및 변경)</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력을 발생합니다.</li>
            <li>서비스는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이 약관을 변경할 수 있습니다.</li>
            <li>변경된 약관은 공지된 시점부터 효력을 발생합니다.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-normal mb-4">제4조 (서비스의 제공)</h2>
          <p>서비스는 다음과 같은 업무를 수행합니다:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>DJ 이벤트 생성 및 관리 기능</li>
            <li>DJ 제출 링크 생성 및 자료 수집</li>
            <li>Instagram 연동 기능</li>
            <li>게스트 리스트 및 결제 정보 관리</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-normal mb-4">제5조 (이용자의 의무)</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>이용자는 다음 행위를 하여서는 안 됩니다:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>타인의 정보를 도용하는 행위</li>
                <li>서비스의 운영을 방해하는 행위</li>
                <li>저작권 등 타인의 권리를 침해하는 행위</li>
                <li>법령이나 공서양속에 반하는 행위</li>
              </ul>
            </li>
            <li>이용자는 관련 법령, 이 약관의 규정을 준수하여야 합니다.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-normal mb-4">제6조 (서비스 이용의 제한)</h2>
          <p>서비스는 이용자가 이 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 경고, 일시정지, 영구정지 등으로 서비스 이용을 단계적으로 제한할 수 있습니다.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-normal mb-4">제7조 (저작권의 귀속)</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>서비스에 대한 저작권 및 지적재산권은 서비스에 귀속됩니다.</li>
            <li>이용자가 서비스 내에 게시한 콘텐츠의 저작권은 해당 이용자에게 귀속됩니다.</li>
            <li>이용자는 서비스를 이용함으로써 얻은 정보를 서비스의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-normal mb-4">제8조 (면책조항)</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>서비스는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</li>
            <li>서비스는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</li>
            <li>서비스는 이용자가 서비스와 관련하여 게재한 정보, 자료, 사실의 신뢰도, 정확성 등의 내용에 관하여는 책임을 지지 않습니다.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-normal mb-4">제9조 (분쟁의 해결)</h2>
          <p>이 약관과 관련하여 분쟁이 발생한 경우, 서비스와 이용자는 분쟁의 해결을 위해 성실히 협의합니다. 협의가 되지 않을 경우 관련 법령에 따라 해결합니다.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-normal mb-4">부칙</h2>
          <p>이 약관은 2025년 7월 22일부터 시행됩니다.</p>
        </section>
      </div>
    </div>
  )
}