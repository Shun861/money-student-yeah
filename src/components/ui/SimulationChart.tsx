"use client";
import { Suspense, lazy } from "react";
import { ChartLoadingSkeleton } from "./ChartLoadingSkeleton";

// 動的インポートでChart.jsコンポーネントを遅延読み込み
const SimulationChartCore = lazy(() => import('./SimulationChartCore'));

interface SimulationData {
  month: string;
  cumulativeIncome: number;
  limit103: number;
  limit130: number;
  limit150: number;
}

interface SimulationChartProps {
  data: SimulationData[];
  exceedDate: string | null;
  exceedAmount: number;
  monthlyAverage: number;
}

export function SimulationChart({ data, exceedDate, exceedAmount, monthlyAverage }: SimulationChartProps) {
  return (
    <Suspense fallback={<ChartLoadingSkeleton height={500} />}>
      <SimulationChartCore 
        data={data}
        exceedDate={exceedDate}
        exceedAmount={exceedAmount}
        monthlyAverage={monthlyAverage}
      />
    </Suspense>
  );
}
