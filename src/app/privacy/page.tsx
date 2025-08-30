"use client";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          ホームに戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">プライバシーポリシー</h1>
        <p className="text-gray-600">最終更新日: 2025年8月30日</p>
      </div>

      {/* プライバシーポリシーの内容 */}
      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. 個人情報の収集について</h2>
          <p className="text-gray-700 mb-4">
            Money Student Yeah（以下「当社」）は、本サービスを提供するにあたり、以下の個人情報を収集いたします。
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>アカウント情報（メールアドレス、パスワード）</li>
            <li>プロフィール情報（年齢、在学状況、居住地など）</li>
            <li>収入・勤務情報（勤務時間、収入額など）</li>
            <li>利用履歴・アクセスログ</li>
            <li>その他、サービス提供に必要な情報</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. 個人情報の利用目的</h2>
          <p className="text-gray-700 mb-4">
            当社は、収集した個人情報を以下の目的で利用いたします。
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>本サービスの提供・運営</li>
            <li>扶養制限の計算・シミュレーション</li>
            <li>ユーザーサポート・お問い合わせ対応</li>
            <li>サービスの改善・新機能開発</li>
            <li>セキュリティの確保</li>
            <li>法令に基づく対応</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. 個人情報の管理</h2>
          <p className="text-gray-700 mb-4">
            当社は、ユーザーの個人情報を正確かつ最新の状態に保ち、個人情報の漏洩、滅失またはき損の防止その他の個人情報の安全管理のために必要かつ適切な措置を講じます。
            個人情報の取扱いの全部または一部を委託する場合は、委託先において十分な個人情報保護水準を確保するため、適切な委託先を選定し、委託契約において個人情報の安全管理、機密保持、再委託の制限その他個人情報の取扱いに関する事項を定め、委託先に対する必要かつ適切な監督を行います。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. 個人情報の第三者提供</h2>
          <p className="text-gray-700 mb-4">
            当社は、ユーザーの個人情報を、ユーザーの同意がある場合または法令に基づく場合を除き、第三者に提供いたしません。
            ただし、以下の場合はこの限りではありません。
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>人の生命、身体または財産の保護のために必要な場合であって、ユーザーの同意を得ることが困難であるとき</li>
            <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要な場合であって、ユーザーの同意を得ることが困難であるとき</li>
            <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、ユーザーの同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
            <li>その他、法令に基づく場合</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. 個人情報の開示・訂正・利用停止</h2>
          <p className="text-gray-700 mb-4">
            当社は、ユーザーから個人情報の開示、訂正、利用停止の請求があった場合、法令に基づき適切に対応いたします。
            これらの請求については、以下の連絡先までお問い合わせください。
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">
              <strong>お問い合わせ先:</strong><br />
              メール: <a href="mailto:privacy@moneystudentyeah.com" className="text-blue-600 hover:text-blue-800">privacy@moneystudentyeah.com</a><br />
              受付時間: 平日 9:00-18:00（土日祝日除く）
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. クッキー（Cookie）の使用</h2>
          <p className="text-gray-700 mb-4">
            当社は、ユーザーの利便性向上のため、クッキーを使用することがあります。
            クッキーは、ユーザーのブラウザに送信され、ユーザーのコンピュータに保存されます。
            ユーザーは、ブラウザの設定によりクッキーの受け取りを拒否することができますが、その場合、本サービスの一部機能が正常に動作しない可能性があります。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. アクセス解析ツールの使用</h2>
          <p className="text-gray-700 mb-4">
            当社は、サービスの改善のため、Google Analytics等のアクセス解析ツールを使用することがあります。
            これらのツールは、ユーザーの利用状況を分析し、個人を特定できない形で統計情報を収集します。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. セキュリティ</h2>
          <p className="text-gray-700 mb-4">
            当社は、ユーザーの個人情報の保護のため、以下のセキュリティ対策を実施しています。
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>SSL暗号化通信の使用</li>
            <li>データベースの暗号化</li>
            <li>アクセス制御の実施</li>
            <li>定期的なセキュリティ監査</li>
            <li>従業員への個人情報保護教育</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. プライバシーポリシーの変更</h2>
          <p className="text-gray-700 mb-4">
            当社は、必要に応じて本プライバシーポリシーを変更することがあります。
            重要な変更がある場合は、本サービス内またはメールでユーザーに通知いたします。
            変更後のプライバシーポリシーは、本ページに掲載された時点から効力を生じるものとします。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. お問い合わせ</h2>
          <p className="text-gray-700 mb-4">
            本プライバシーポリシーに関するお問い合わせは、以下の連絡先までお願いいたします。
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">
              <strong>Money Student Yeah プライバシー担当</strong><br />
              メール: <a href="mailto:privacy@moneystudentyeah.com" className="text-blue-600 hover:text-blue-800">privacy@moneystudentyeah.com</a><br />
              受付時間: 平日 9:00-18:00（土日祝日除く）
            </p>
          </div>
        </section>
      </div>

      {/* フッター */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <p className="text-sm text-gray-500 text-center">
          関連リンク: <Link href="/terms" className="text-blue-600 hover:text-blue-800">利用規約</Link>
        </p>
      </div>
    </div>
  );
}
