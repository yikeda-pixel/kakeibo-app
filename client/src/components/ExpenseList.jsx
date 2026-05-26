import './ExpenseList.css';

// カテゴリごとの色マップ
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

// 支出一覧コンポーネント
function ExpenseList({ expenses, onDelete }) {
  if (expenses.length === 0) {
    return (
      <div className="expense-list-empty">
        <p>この月の支出データがありません。レシートを読み込んでください。</p>
      </div>
    );
  }

  // 日付の新しい順に並べる
  const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="expense-list">
      <table className="expense-table">
        <thead>
          <tr>
            <th>日付</th>
            <th>店舗</th>
            <th>商品名</th>
            <th>カテゴリ</th>
            <th className="amount-col">金額</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((expense) => (
            <tr key={expense.id}>
              <td className="date-col">{expense.date}</td>
              <td className="store-col">{expense.store}</td>
              <td>{expense.name}</td>
              <td>
                <span
                  className="category-badge"
                  style={{ background: CATEGORY_COLORS[expense.category] || '#95a5a6' }}
                >
                  {expense.category}
                </span>
              </td>
              <td className="amount-col">¥{expense.amount.toLocaleString()}</td>
              <td>
                <button
                  className="delete-btn"
                  onClick={() => onDelete(expense.id)}
                  title="削除"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExpenseList;
