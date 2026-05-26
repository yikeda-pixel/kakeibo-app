import { useState, useRef } from 'react';
import './ReceiptUpload.css';

// レシート画像をアップロードしてサーバー（Claude API）で解析するコンポーネント
function ReceiptUpload({ onAnalyzed }) {
  const [preview, setPreview] = useState(null);    // プレビュー画像URL
  const [loading, setLoading] = useState(false);   // 解析中フラグ
  const [error, setError] = useState(null);        // エラーメッセージ
  const [dragOver, setDragOver] = useState(false); // ドラッグオーバー状態
  const fileInputRef = useRef(null);

  // ファイル選択またはドロップ時の処理
  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください');
      return;
    }

    // プレビュー表示
    const url = URL.createObjectURL(file);
    setPreview(url);
    setError(null);

    // 自動的に解析を開始
    analyzeReceipt(file);
  };

  // サーバーにレシート画像を送信して解析する
  const analyzeReceipt = async (file) => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '解析に失敗しました');
      }

      const data = await response.json();
      onAnalyzed(data);
      // 解析成功後にプレビューをリセット
      setPreview(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    handleFile(e.target.files[0]);
    // 同じファイルを再選択できるようにリセット
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className="receipt-upload">
      <h2>レシートを読み込む</h2>

      {/* ドラッグ&ドロップエリア */}
      <div
        className={`drop-zone ${dragOver ? 'drag-over' : ''} ${loading ? 'loading' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !loading && fileInputRef.current?.click()}
      >
        {loading ? (
          <div className="loading-content">
            <div className="spinner" />
            <p>Claude が解析中...</p>
          </div>
        ) : preview ? (
          <img src={preview} alt="レシートプレビュー" className="preview-image" />
        ) : (
          <div className="drop-prompt">
            <span className="drop-icon">📷</span>
            <p>クリックまたはドラッグ&ドロップ</p>
            <p className="drop-hint">JPEG・PNG・WebP に対応</p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="file-input-hidden"
      />

      {/* エラー表示 */}
      {error && <p className="error-message">⚠ {error}</p>}
    </div>
  );
}

export default ReceiptUpload;
