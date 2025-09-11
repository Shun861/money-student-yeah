"use client";
import { useState } from "react";
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

interface PredictionData {
  month: string;
  predictedIncome: number;
  actualIncome?: number;
}

interface IncomePredictionCoreProps {
  currentMonthlyIncome: number;
  growthRate: number;
  months: number;
}

export function IncomePredictionCore({ currentMonthlyIncome, growthRate, months }: IncomePredictionCoreProps) {
  const [customGrowthRate, setCustomGrowthRate] = useState(growthRate);
  const [customMonths, setCustomMonths] = useState(months);

  const generatePredictionData = (monthlyIncome: number, rate: number, numMonths: number): PredictionData[] => {
    const data: PredictionData[] = [];
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    
    let currentIncome = monthlyIncome;
    for (let i = 0; i < numMonths; i++) {
      data.push({
        month: months[i % 12],
        predictedIncome: currentIncome
      });
      currentIncome *= (1 + rate / 100);
    }
    
    return data;
  };

  const predictionData = generatePredictionData(currentMonthlyIncome, customGrowthRate, customMonths);

  const chartData = {
    labels: predictionData.map(d => d.month),
    datasets: [
      {
        label: '予測収入',
        data: predictionData.map(d => d.predictedIncome),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      }
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
        text: '収入予測',
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function(this: any, tooltipItem: any) {
            return `予測収入: ¥${tooltipItem.parsed.y.toLocaleString()}`;
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

  const totalPredictedIncome = predictionData.reduce((sum, d) => sum + d.predictedIncome, 0);
  const averageMonthlyIncome = totalPredictedIncome / predictionData.length;

  return (
    <div className="space-y-6">
      {/* 設定パネル */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">予測設定</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              成長率 (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={customGrowthRate}
              onChange={(e) => setCustomGrowthRate(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              予測期間 (ヶ月)
            </label>
            <input
              type="number"
              min="1"
              max="24"
              value={customMonths}
              onChange={(e) => setCustomMonths(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* 予測グラフ */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <Line data={chartData} options={options} />
      </div>

      {/* 予測サマリー */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h4 className="text-lg font-medium mb-2">総予測収入</h4>
          <div className="text-2xl font-bold text-blue-600">
            ¥{totalPredictedIncome.toLocaleString()}
          </div>
          <p className="text-sm text-gray-500 mt-1">{customMonths}ヶ月分</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h4 className="text-lg font-medium mb-2">月平均収入</h4>
          <div className="text-2xl font-bold text-green-600">
            ¥{averageMonthlyIncome.toLocaleString()}
          </div>
          <p className="text-sm text-gray-500 mt-1">予測期間中</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h4 className="text-lg font-medium mb-2">成長率</h4>
          <div className="text-2xl font-bold text-purple-600">
            {customGrowthRate > 0 ? '+' : ''}{customGrowthRate}%
          </div>
          <p className="text-sm text-gray-500 mt-1">月次成長</p>
        </div>
      </div>

      {/* 詳細予測表 */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">月別予測詳細</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">月</th>
                <th className="text-right py-2">予測収入</th>
                <th className="text-right py-2">累積収入</th>
              </tr>
            </thead>
            <tbody>
              {predictionData.map((data, index) => {
                const cumulativeIncome = predictionData
                  .slice(0, index + 1)
                  .reduce((sum, d) => sum + d.predictedIncome, 0);
                
                return (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-2">{data.month}</td>
                    <td className="text-right py-2">¥{data.predictedIncome.toLocaleString()}</td>
                    <td className="text-right py-2">¥{cumulativeIncome.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
