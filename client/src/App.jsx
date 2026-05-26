import { useState, useEffect } from 'react';
import ReceiptUpload from './components/ReceiptUpload.jsx';
import ExpenseList from './components/ExpenseList.jsx';
import CategoryPieChart from './components/CategoryPieChart.jsx';
import MonthlyBarChart from './components/MonthlyBarChart.jsx';
import './App.css';

// localStorage のキー
const STORAGE_KEY = 'kakeibo_expenses';

function App() {
  // 支出データの状態管理
  const [expenses, setExpenses] = useState(() => {
    // 初回レンダリング時に localStorage からデータを読み込む
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // 選択中の月（YYYY-MM 形式）
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // バリデーション警告メッセージ（複数対応）
  const [warnings, setWarnings] = useState([]);

  // expenses が変わるたびに localStorage に保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  // レシート解析結果を支出データに追加する
  const handleReceiptAnalyzed = (receiptData) => {
    const newWarnings = [];

    // 【検証1】負の金額チェック
    const negativeItems = receiptData.items.filter((item) => item.amount < 0);
    if (negativeItems.length > 0) {
      const names = negativeItems.map((i) => i.name).join('、');
      newWarnings.push(`負の金額が含まれています（${names}）。値引き・返品の可能性があります。`);
    }

    // 【検証2】重複レシートチェック（同一日付・合計金額）
    // 各 expense に receiptTotal を保持しているので、それと照合する
    const isDuplicate = expenses.some(
      (e) => e.date === receiptData.date && e.receiptTotal === receiptData.total
    );
    if (isDuplicate) {
      newWarnings.push(
        `同じ日付・合計金額のレシートが既に登録されています（${receiptData.date}、¥${receiptData.total.toLocaleString()}）。重複登録の可能性があります。`
      );
    }

    setWarnings(newWarnings);

    // 警告があっても登録は続行する（ユーザーが確認できるように）
    const newExpenses = receiptData.items.map((item, index) => ({
      id: `${Date.now()}-${index}`,
      date: receiptData.date,
      store: receiptData.store,
      name: item.name,
      amount: item.amount,
      category: item.category,
      // 重複検知に使うレシート合計を各アイテムに付与
      receiptTotal: receiptData.total,
    }));
    setExpenses((prev) => [...prev, ...newExpenses]);
  };

  // 支出を削除する
  const handleDelete = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // 選択月でフィルタリングした支出
  const filteredExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));

  // 月の合計金額
  const monthlyTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="app">
      <header className="app-header">
        <h1>レシート家計簿</h1>
        <div className="month-selector">
          <label htmlFor="month">表示月：</label>
          <input
            id="month"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
          <span className="monthly-total">
            合計：<strong>¥{monthlyTotal.toLocaleString()}</strong>
          </span>
        </div>
      </header>

      <main className="app-main">
        {/* レシートアップロードセクション */}
        <section className="section">
          <ReceiptUpload onAnalyzed={handleReceiptAnalyzed} />
        </section>

        {/* バリデーション警告バナー */}
        {warnings.length > 0 && (
          <div className="warning-banner" role="alert">
            <div className="warning-banner-header">
              <span>⚠ 登録時の注意</span>
              <button
                className="warning-close-btn"
                onClick={() => setWarnings([])}
                aria-label="警告を閉じる"
              >
                ✕
              </button>
            </div>
            <ul className="warning-list">
              {warnings.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        {/* グラフセクション */}
        {filteredExpenses.length > 0 && (
          <section className="section charts-section">
            <div className="chart-container">
              <h2>カテゴリ別支出</h2>
              <CategoryPieChart expenses={filteredExpenses} />
            </div>
            <div className="chart-container">
              <h2>月別支出推移</h2>
              <MonthlyBarChart expenses={expenses} />
            </div>
          </section>
        )}

        {/* 支出一覧セクション */}
        <section className="section">
          <h2>{selectedMonth} の支出一覧</h2>
          <ExpenseList expenses={filteredExpenses} onDelete={handleDelete} />
        </section>
      </main>
    </div>
  );
}

export default App;
