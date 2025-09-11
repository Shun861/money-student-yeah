"use client";
import { Suspense, lazy } from "react";
import { ChartLoadingSkeleton } from "./ChartLoadingSkeleton";

// 動的インポートでChart.jsコンポーネントを遅延読み込み
const IncomePredictionCore = lazy(() => 
  import('./IncomePredictionCore').then(module => ({ default: module.IncomePredictionCore }))
);

interface IncomePredictionProps {
  currentMonthlyIncome: number;
  growthRate: number;
  months: number;
}

export function IncomePrediction({ currentMonthlyIncome, growthRate, months }: IncomePredictionProps) {
  return (
    <Suspense fallback={<ChartLoadingSkeleton height={600} />}>
      <IncomePredictionCore 
        currentMonthlyIncome={currentMonthlyIncome}
        growthRate={growthRate}
        months={months}
      />
    </Suspense>
  );
}
