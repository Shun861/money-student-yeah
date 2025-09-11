interface ChartLoadingSkeletonProps {
  height?: number;
  className?: string;
}

export function ChartLoadingSkeleton({ 
  height = 400, 
  className = '' 
}: ChartLoadingSkeletonProps) {
  return (
    <div 
      className={`bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center ${className}`}
      style={{ height: `${height}px` }}
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm">チャートを読み込んでいます...</p>
      </div>
    </div>
  );
}
