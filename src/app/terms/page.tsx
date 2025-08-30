"use client";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">利用規約</h1>
        <p className="text-gray-600">最終更新日: 2025年8月30日</p>
      </div>

      {/* 利用規約の内容 */}
      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">第1条（適用）</h2>
          <p className="text-gray-700 mb-4">
            本規約は、Money Student Yeah（以下「本サービス」）の利用に関して適用されます。
            ユーザーは、本規約に従って本サービスを利用するものとします。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">第2条（利用登録）</h2>
          <p className="text-gray-700 mb-4">
            本サービスの利用を希望する者は、本規約に同意の上、当社の定める方法によって利用登録を申請するものとします。
            当社は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあります。
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>虚偽の事項を届け出た場合</li>
            <li>本規約に違反したことがある者からの申請である場合</li>
            <li>その他、当社が利用登録を相当でないと判断した場合</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">第3条（ユーザーIDおよびパスワードの管理）</h2>
          <p className="text-gray-700 mb-4">
            ユーザーは、自己の責任において、本サービスのユーザーIDおよびパスワードを適切に管理するものとします。
            ユーザーは、いかなる場合にも、ユーザーIDおよびパスワードを第三者に譲渡または貸与し、もしくは第三者と共用することはできません。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">第4条（禁止事項）</h2>
          <p className="text-gray-700 mb-4">
            ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>当社のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
            <li>本サービスの運営を妨害するおそれのある行為</li>
            <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
            <li>他のユーザーに成りすます行為</li>
            <li>当社のサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
            <li>その他、当社が不適切と判断する行為</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">第5条（本サービスの提供の停止等）</h2>
          <p className="text-gray-700 mb-4">
            当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
            <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
            <li>その他、当社が本サービスの提供が困難と判断した場合</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">第6条（免責事項）</h2>
          <p className="text-gray-700 mb-4">
            当社は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。
            本サービスで提供される情報は、一般的な情報提供を目的としており、具体的な税務・法律・投資に関するアドバイスではありません。
            重要な判断を行う際は、必ず専門家に相談してください。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">第7条（サービス内容の変更等）</h2>
          <p className="text-gray-700 mb-4">
            当社は、ユーザーに通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">第8条（利用規約の変更）</h2>
          <p className="text-gray-700 mb-4">
            当社は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。
            なお、本規約の変更後、本サービスの利用を継続した場合には、変更後の規約に同意したものとみなします。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">第9条（準拠法・裁判管轄）</h2>
          <p className="text-gray-700 mb-4">
            本規約の解釈にあたっては、日本法を準拠法とします。
            本サービスに関して紛争が生じた場合には、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
          </p>
        </section>
      </div>

      {/* フッター */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <p className="text-sm text-gray-500 text-center">
          お問い合わせ: <a href="mailto:support@moneystudentyeah.com" className="text-blue-600 hover:text-blue-800">support@moneystudentyeah.com</a>
        </p>
      </div>
    </div>
  );
}
