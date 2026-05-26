import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import './Chart.css';

// Chart.js の必要コンポーネントを登録
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// 月別支出推移の棒グラフコンポーネント
function MonthlyBarChart({ expenses }) {
  // 月ごとに金額を集計
  const totals = expenses.reduce((acc, e) => {
    // YYYY-MM 形式で集計キーを作る
    const month = e.date.slice(0, 7);
    acc[month] = (acc[month] || 0) + e.amount;
    return acc;
  }, {});

  // 月を昇順に並べる
  const sortedMonths = Object.keys(totals).sort();
  const data = sortedMonths.map((m) => totals[m]);

  // YYYY-MM を「YYYY年MM月」表示に変換
  const labels = sortedMonths.map((m) => {
    const [year, month] = m.split('-');
    return `${year}年${parseInt(month)}月`;
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: '支出合計（円）',
        data,
        backgroundColor: '#3498db99',
        borderColor: '#3498db',
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ¥${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v) => `¥${v.toLocaleString()}`,
        },
      },
    },
  };

  return (
    <div className="chart-wrapper">
      <Bar data={chartData} options={options} />
    </div>
  );
}

export default MonthlyBarChart;
