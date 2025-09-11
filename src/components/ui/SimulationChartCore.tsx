"use client";
import { useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Chart.jsの登録を動的インポート時に実行
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SimulationData {
  month: string;
  cumulativeIncome: number;
  limit103: number;
  limit130: number;
  limit150: number;
}

interface SimulationChartCoreProps {
  data: SimulationData[];
  exceedDate: string | null;
  exceedAmount: number;
  monthlyAverage: number;
}

export default function SimulationChartCore({ data, exceedDate, exceedAmount, monthlyAverage }: SimulationChartCoreProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);

  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: '累積収入',
        data: data.map(d => d.cumulativeIncome),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: '103万円制限',
        data: data.map(d => d.limit103),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderDash: [5, 5],
        fill: false,
      },
      {
        label: '130万円制限',
        data: data.map(d => d.limit130),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderDash: [5, 5],
        fill: false,
      },
      {
        label: '150万円制限',
        data: data.map(d => d.limit150),
        borderColor: 'rgb(107, 114, 128)',
        backgroundColor: 'rgba(107, 114, 128, 0.1)',
        borderDash: [5, 5],
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '扶養制限シミュレーション',
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function(this: any, tooltipItem: any) {
            return `${tooltipItem.dataset.label}: ¥${tooltipItem.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          callback: function(this: any, tickValue: any) {
            const value = typeof tickValue === 'number' ? tickValue : 0;
            return '¥' + (value / 10000).toFixed(0) + '万';
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
      
      {exceedDate && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-900">扶養制限超過予測</h3>
          </div>
          <div className="space-y-2 text-red-800">
            <p><strong>超過予定日:</strong> {new Date(exceedDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>超過金額:</strong> ¥{exceedAmount.toLocaleString()}</p>
            <p><strong>月平均収入:</strong> ¥{monthlyAverage.toLocaleString()}</p>
          </div>
        </div>
      )}
      
      {!exceedDate && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-green-900">扶養制限内で安定</h3>
          </div>
          <div className="space-y-2 text-green-800">
            <p><strong>月平均収入:</strong> ¥{monthlyAverage.toLocaleString()}</p>
            <p>現在のペースでは扶養制限を超える心配はありません。</p>
          </div>
        </div>
      )}
    </div>
  );
}
