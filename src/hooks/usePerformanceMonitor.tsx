"use client";
import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number | null;
  renderTime: number | null;
  bundleSize: number | null;
  networkLatency: number | null;
}

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: null,
    renderTime: null,
    bundleSize: null,
    networkLatency: null
  });

  useEffect(() => {
    // ページロード時間を測定
    const measureLoadTime = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadTime = navigation.loadEventEnd - navigation.fetchStart;
        
        setMetrics(prev => ({
          ...prev,
          loadTime: Math.round(loadTime)
        }));
      }
    };

    // レンダリング時間を測定
    const measureRenderTime = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const renderTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        
        setMetrics(prev => ({
          ...prev,
          renderTime: Math.round(renderTime)
        }));
      }
    };

    // ネットワーク待機時間を測定
    const measureNetworkLatency = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const networkLatency = navigation.responseStart - navigation.requestStart;
        
        setMetrics(prev => ({
          ...prev,
          networkLatency: Math.round(networkLatency)
        }));
      }
    };

    // バンドルサイズを推定（リソースサイズの合計）
    const estimateBundleSize = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const jsResources = resources.filter(resource => 
          resource.name.includes('.js') || resource.name.includes('/_next/')
        );
        
        const totalSize = jsResources.reduce((total, resource) => {
          return total + (resource.transferSize || 0);
        }, 0);
        
        setMetrics(prev => ({
          ...prev,
          bundleSize: Math.round(totalSize / 1024) // KB単位
        }));
      }
    };

    // 全ての測定を実行
    const runMeasurements = () => {
      measureLoadTime();
      measureRenderTime();
      measureNetworkLatency();
      estimateBundleSize();
    };

    // ページロード完了後に測定
    if (document.readyState === 'complete') {
      runMeasurements();
    } else {
      window.addEventListener('load', runMeasurements);
    }

    return () => {
      window.removeEventListener('load', runMeasurements);
    };
  }, []);

  return metrics;
}

// パフォーマンス情報を表示するコンポーネント
interface PerformanceDisplayProps {
  showInProduction?: boolean;
}

export function PerformanceDisplay({ showInProduction = false }: PerformanceDisplayProps) {
  const metrics = usePerformanceMonitor();
  
  // 本番環境では表示しない（開発環境のみ）
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white text-xs p-3 rounded-lg max-w-xs z-50">
      <h4 className="font-semibold mb-2">🚀 パフォーマンス指標</h4>
      <div className="space-y-1">
        <div>
          <span className="opacity-70">ロード時間:</span>{' '}
          <span className="font-mono">
            {metrics.loadTime !== null ? `${metrics.loadTime}ms` : '測定中...'}
          </span>
        </div>
        <div>
          <span className="opacity-70">レンダリング:</span>{' '}
          <span className="font-mono">
            {metrics.renderTime !== null ? `${metrics.renderTime}ms` : '測定中...'}
          </span>
        </div>
        <div>
          <span className="opacity-70">ネットワーク:</span>{' '}
          <span className="font-mono">
            {metrics.networkLatency !== null ? `${metrics.networkLatency}ms` : '測定中...'}
          </span>
        </div>
        <div>
          <span className="opacity-70">バンドル:</span>{' '}
          <span className="font-mono">
            {metrics.bundleSize !== null ? `${metrics.bundleSize}KB` : '測定中...'}
          </span>
        </div>
      </div>
    </div>
  );
}
