import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* ロゴ */}
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">MS</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Money Student</span>
          </Link>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-xl sm:px-10">
          {children}
        </div>
      </div>

      {/* フッターリンク */}
      <div className="mt-8 text-center">
        <div className="flex justify-center space-x-6 text-sm text-gray-600">
          <Link href="/terms" className="hover:text-gray-900 transition-colors">
            利用規約
          </Link>
          <Link href="/privacy" className="hover:text-gray-900 transition-colors">
            プライバシーポリシー
          </Link>
        </div>
      </div>
    </div>
  );
}
