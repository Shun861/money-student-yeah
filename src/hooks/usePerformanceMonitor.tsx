"use client";
import { useEffect, useState, useRef } from 'react';

interface PerformanceMetrics {
  loadTime: number | null;
  renderTime: number | null;
  bundleSize: number | null;
  networkLatency: number | null;
}

// パフォーマンス測定結果のキャッシュ
let cachedMetrics: PerformanceMetrics | null = null;
let lastMeasurementTime = 0;
const CACHE_DURATION = 30000; // 30秒間キャッシュ

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: null,
    renderTime: null,
    bundleSize: null,
    networkLatency: null
  });
  
  const measurementInProgress = useRef(false);

  useEffect(() => {
    // キャッシュが有効な場合は使用
    const now = Date.now();
    if (cachedMetrics && (now - lastMeasurementTime) < CACHE_DURATION) {
      setMetrics(cachedMetrics);
      return;
    }

    // 既に測定中の場合はスキップ
    if (measurementInProgress.current) {
      return;
    }

    measurementInProgress.current = true;

    // デバウンス付きの測定関数
    const measureWithDebounce = () => {
      const timeoutId = setTimeout(() => {
        runMeasurements();
        measurementInProgress.current = false;
      }, 100); // 100ms デバウンス

      return () => {
        clearTimeout(timeoutId);
        measurementInProgress.current = false;
      };
    };

    // ページロード時間を測定
    const measureLoadTime = (): number | null => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation && navigation.loadEventEnd && navigation.fetchStart) {
          return Math.round(navigation.loadEventEnd - navigation.fetchStart);
        }
      }
      return null;
    };

    // レンダリング時間を測定
    const measureRenderTime = (): number | null => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation && navigation.domContentLoadedEventEnd && navigation.domContentLoadedEventStart) {
          return Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
        }
      }
      return null;
    };

    // ネットワーク待機時間を測定
    const measureNetworkLatency = (): number | null => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation && navigation.responseStart && navigation.requestStart) {
          return Math.round(navigation.responseStart - navigation.requestStart);
        }
      }
      return null;
    };

    // バンドルサイズを推定（リソースサイズの合計）
    const estimateBundleSize = (): number | null => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        try {
          const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
          const jsResources = resources.filter(resource => 
            resource.name.includes('.js') || resource.name.includes('/_next/')
          );
          
          const totalSize = jsResources.reduce((total, resource) => {
            return total + (resource.transferSize || 0);
          }, 0);
          
          return Math.round(totalSize / 1024); // KB単位
        } catch (error) {
          console.warn('Bundle size estimation failed:', error);
          return null;
        }
      }
      return null;
    };

    // 全ての測定を実行
    const runMeasurements = () => {
      const newMetrics: PerformanceMetrics = {
        loadTime: measureLoadTime(),
        renderTime: measureRenderTime(),
        networkLatency: measureNetworkLatency(),
        bundleSize: estimateBundleSize()
      };

      // キャッシュに保存
      cachedMetrics = newMetrics;
      lastMeasurementTime = Date.now();
      
      setMetrics(newMetrics);
    };

    // ページロード完了後に測定
    if (document.readyState === 'complete') {
      const cleanup = measureWithDebounce();
      return cleanup;
    } else {
      const handleLoad = () => {
        measureWithDebounce();
      };
      
      window.addEventListener('load', handleLoad);
      return () => {
        window.removeEventListener('load', handleLoad);
        measurementInProgress.current = false;
      };
    }
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
