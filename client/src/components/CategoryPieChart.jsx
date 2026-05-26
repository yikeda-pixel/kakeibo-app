import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import './Chart.css';

// Chart.js の必要コンポーネントを登録
ChartJS.register(ArcElement, Tooltip, Legend);

// カテゴリ別カラーパレット
const CATEGORY_COLORS = {
  食費: '#e74c3c',
  外食: '#e67e22',
  日用品: '#f1c40f',
  交通費: '#2ecc71',
  娯楽: '#9b59b6',
  医療: '#1abc9c',
  衣類: '#3498db',
  その他: '#95a5a6',
};

// カテゴリ別の円グラフコンポーネント
function CategoryPieChart({ expenses }) {
  // カテゴリごとに金額を集計
  const totals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const labels = Object.keys(totals);
  const data = Object.values(totals);
  const colors = labels.map((l) => CATEGORY_COLORS[l] || '#95a5a6');

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors,
        borderColor: colors.map((c) => c + 'cc'),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 12 },
          padding: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value = ctx.parsed;
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct = ((value / total) * 100).toFixed(1);
            return ` ¥${value.toLocaleString()} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="chart-wrapper">
      <Pie data={chartData} options={options} />
    </div>
  );
}

export default CategoryPieChart;
