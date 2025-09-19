export default function SettingsLoading() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="animate-pulse space-y-8">
        {/* ページヘッダー */}
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>

        {/* セクション1 */}
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-100 rounded"></div>
            <div className="h-16 bg-gray-100 rounded"></div>
          </div>
        </div>

        {/* セクション2 */}
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="space-y-4">
            <div className="h-16 bg-gray-100 rounded"></div>
            <div className="h-16 bg-gray-100 rounded"></div>
            <div className="h-16 bg-gray-100 rounded"></div>
            <div className="h-16 bg-gray-100 rounded"></div>
          </div>
        </div>

        {/* セクション3 */}
        <div className="bg-white rounded-lg border border-red-200 p-6 shadow-sm">
          <div className="h-6 bg-red-100 rounded w-36 mb-4"></div>
          <div className="h-32 bg-red-50 rounded"></div>
        </div>
      </div>
    </div>
  );
}