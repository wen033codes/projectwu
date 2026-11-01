import knowledge from './knowledge.json';

// 預設 Master Token（使用者可透過 npx wrangler secret put MASTER_TOKEN 隨時覆蓋）
const DEFAULT_MASTER_TOKEN = "pjwu-master-2026-safe-token-89f4b";

// 後台管理 HTML 介面產生器（含 Master Token 設備綁定、自動依日期分類與點選切換當日紀錄）
function renderAdminHtml() {
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI 客服紀錄與網站訪客統計管理後台</title>
  <link rel="icon" href="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2064%2064'%3E%3Cdefs%3E%3ClinearGradient%20id='bg'%20x1='0%25'%20y1='0%25'%20x2='100%25'%20y2='100%25'%3E%3Cstop%20offset='0%25'%20stop-color='%23a855f7'/%3E%3Cstop%20offset='100%25'%20stop-color='%237c3aed'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle%20cx='32'%20cy='32'%20r='30'%20fill='url(%23bg)'/%3E%3Cg%20transform='translate(14,14)%20scale(1.5)'%20stroke='%23ffffff'%20stroke-width='2.2'%20stroke-linecap='round'%20stroke-linejoin='round'%20fill='none'%3E%3Cpath%20d='M3%2011h3a2%202%200%200%201%202%202v4a2%202%200%200%201-2%202H5a2%202%200%200%201-2-2v-6a9%209%200%200%201%2018%200v6a2%202%200%200%201-2%202h-1a2%202%200%200%201-2-2v-4a2%202%200%200%201%202-2h3'/%3E%3Cpath%20d='M19%2017v2a3%203%200%200%201-3%203h-4'/%3E%3Ccircle%20cx='11.5'%20cy='22'%20r='1.4'%20fill='%23ffffff'%20stroke='none'/%3E%3C/g%3E%3C/svg%3E">
  <style>
    :root {
      --primary: #7c3aed;
      --primary-hover: #6d28d9;
      --primary-light: #f5f3ff;
      --border: #e2e8f0;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --text-main: #1e293b;
      --text-muted: #64748b;
      --danger: #ef4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans TC", sans-serif;
      background: var(--bg);
      color: var(--text-main);
      padding: 24px 16px;
      line-height: 1.5;
    }
    .container { max-width: 1100px; margin: 0 auto; }

    /* 設備綁定鎖定視窗 */
    .auth-overlay {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 70vh;
    }
    .auth-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 32px 28px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.06);
      text-align: center;
    }
    .auth-icon { font-size: 48px; margin-bottom: 12px; display: inline-block; }
    .auth-title { font-size: 20px; font-weight: 700; color: #4c1d95; margin-bottom: 8px; }
    .auth-desc { font-size: 13px; color: var(--text-muted); margin-bottom: 24px; line-height: 1.6; }
    .form-group { text-align: left; margin-bottom: 16px; }
    .form-label { font-size: 13px; font-weight: 600; color: var(--text-main); margin-bottom: 6px; display: block; }
    .form-control {
      width: 100%;
      padding: 10px 14px;
      border: 1.5px solid var(--border);
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    .form-control:focus { border-color: var(--primary); }

    /* 主後台視圖 */
    #dashboard-view { display: none; }
    header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border);
    }
    h1 {
      font-size: 22px;
      color: #6d28d9;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .device-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
    }
    .stats-bar {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: var(--card-bg);
      padding: 14px 18px;
      border-radius: 12px;
      border: 1px solid var(--border);
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .stat-title { font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
    .stat-val { font-size: 22px; font-weight: 700; color: var(--text-main); }

    /* 日期分類選擇列 (Date Tabs) */
    .date-nav-section {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px 16px;
      margin-bottom: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .date-nav-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted);
    }
    .date-tabs-container {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 6px;
      scrollbar-width: thin;
    }
    .date-tab-btn {
      padding: 7px 14px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: #f8fafc;
      color: var(--text-main);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .date-tab-btn:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }
    .date-tab-btn.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
      box-shadow: 0 2px 6px rgba(124, 58, 237, 0.25);
    }
    .date-badge {
      font-size: 11px;
      background: rgba(0,0,0,0.06);
      padding: 1px 6px;
      border-radius: 10px;
    }
    .date-tab-btn.active .date-badge {
      background: rgba(255,255,255,0.25);
      color: white;
    }

    .controls {
      background: var(--card-bg);
      padding: 14px 18px;
      border-radius: 12px;
      border: 1px solid var(--border);
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 16px;
      align-items: center;
      justify-content: space-between;
    }
    .current-date-heading {
      font-size: 15px;
      font-weight: 600;
      color: #4c1d95;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .search-input {
      flex: 1;
      min-width: 240px;
      padding: 8px 14px;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 13px;
      outline: none;
    }
    .search-input:focus { border-color: var(--primary); }
    .btn {
      padding: 7px 14px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s;
    }
    .btn-primary { background: var(--primary); color: white; }
    .btn-primary:hover { background: var(--primary-hover); }
    .btn-secondary { background: #f1f5f9; color: var(--text-main); border: 1px solid var(--border); }
    .btn-secondary:hover { background: #e2e8f0; }
    .btn-danger { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
    .btn-danger:hover { background: #fecaca; }

    .notice {
      font-size: 13px;
      color: #059669;
      background: #ecfdf5;
      padding: 8px 14px;
      border-radius: 8px;
      border: 1px solid #a7f3d0;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .log-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px 18px;
      margin-bottom: 14px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
      transition: border-color 0.2s;
    }
    .log-card:hover { border-color: #cbd5e1; }
    .log-meta {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 1px solid #f1f5f9;
    }
    .client-tags {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      margin-top: 4px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
    }
    .badge-gemini { background: #ede9fe; color: #6d28d9; }
    .badge-cf { background: #ffedd5; color: #c2410c; }
    .badge-fallback { background: #fee2e2; color: #b91c1c; }
    .badge-client { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; font-weight: 500; }
    .badge-ip { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; font-weight: 500; }

    .msg-section { margin-bottom: 10px; }
    .msg-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .msg-bubble {
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 14px;
      line-height: 1.6;
      word-break: break-word;
      white-space: pre-wrap;
    }
    .msg-user { background: #f8fafc; border: 1px solid #e2e8f0; color: #0f172a; font-weight: 500; }
    .msg-ai { background: var(--primary-light); border: 1px solid #ddd6fe; color: #1e1b4b; }
    .pagination {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-top: 24px;
      align-items: center;
    }
    .empty-state { text-align: center; padding: 50px 20px; color: var(--text-muted); }

    /* 設備列表 Modal */
    .modal-backdrop {
      display: none;
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.4);
      z-index: 1000;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .modal-box {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 550px;
      padding: 24px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
    }
    .modal-header h3 { font-size: 18px; color: #4c1d95; }
    .modal-close { cursor: pointer; font-size: 20px; color: var(--text-muted); }
    .device-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 14px;
      border: 1px solid var(--border);
      border-radius: 8px;
      margin-bottom: 10px;
    }

    /* 主分頁切換導覽 (Main Nav Tabs) */
    .main-nav-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
      border-bottom: 2px solid var(--border);
      padding-bottom: 2px;
    }
    .main-tab-btn {
      background: none;
      border: none;
      font-size: 15px;
      font-weight: 600;
      color: var(--text-muted);
      padding: 10px 20px;
      cursor: pointer;
      border-radius: 10px 10px 0 0;
      border-bottom: 3px solid transparent;
      margin-bottom: -2px;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .main-tab-btn:hover {
      color: var(--primary);
      background: var(--primary-light);
    }
    .main-tab-btn.active {
      color: var(--primary);
      border-bottom-color: var(--primary);
      background: white;
    }

    /* 訪客統計儀表板專用樣式 */
    .analytics-grid {
      display: grid;
      grid-template-columns: 3fr 2fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    @media (max-width: 860px) {
      .analytics-grid { grid-template-columns: 1fr; }
    }
    .analytics-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 18px 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
      margin-bottom: 16px;
    }
    .analytics-card-title {
      font-size: 14px;
      font-weight: 700;
      color: #334155;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .analytics-card-title .badge {
      font-size: 11px;
      font-weight: 500;
      background: #f1f5f9;
      color: var(--text-muted);
      padding: 2px 8px;
      border-radius: 12px;
    }
    
    /* 趨勢長條圖 (Trend Bar Chart) */
    .trend-chart-box {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }
    .trend-chart-legend {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: var(--text-muted);
      align-items: center;
    }
    .legend-dot {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 3px;
      margin-right: 5px;
    }
    .trend-chart-container {
      display: flex;
      align-items: flex-end;
      gap: 10px;
      height: 170px;
      padding: 20px 6px 30px 6px;
      border-bottom: 1px dashed var(--border);
      position: relative;
      margin-top: 10px;
    }
    .trend-bar-group {
      flex: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      position: relative;
      cursor: pointer;
    }
    .trend-bars-wrapper {
      display: flex;
      align-items: flex-end;
      gap: 3px;
      width: 100%;
      justify-content: center;
      height: 100%;
    }
    .trend-bar-pv {
      background: #7c3aed;
      border-radius: 4px 4px 0 0;
      width: 45%;
      min-height: 4px;
      transition: height 0.3s ease;
    }
    .trend-bar-uv {
      background: #38bdf8;
      border-radius: 4px 4px 0 0;
      width: 45%;
      min-height: 4px;
      transition: height 0.3s ease;
    }
    .trend-bar-group:hover .trend-bar-pv { background: #6d28d9; }
    .trend-bar-group:hover .trend-bar-uv { background: #0284c7; }
    .trend-date-label {
      position: absolute;
      bottom: -24px;
      font-size: 11px;
      color: var(--text-muted);
      white-space: nowrap;
    }
    .trend-tooltip {
      visibility: hidden;
      position: absolute;
      bottom: 105%;
      left: 50%;
      transform: translateX(-50%);
      background: #1e293b;
      color: white;
      padding: 7px 11px;
      border-radius: 6px;
      font-size: 11px;
      white-space: nowrap;
      z-index: 10;
      opacity: 0;
      transition: opacity 0.2s;
      pointer-events: none;
      box-shadow: 0 4px 10px rgba(0,0,0,0.25);
      line-height: 1.5;
    }
    .trend-bar-group:hover .trend-tooltip {
      visibility: visible;
      opacity: 1;
    }

    /* 排行榜與分佈 */
    .rank-list { list-style: none; margin: 0; padding: 0; }
    .rank-item {
      display: flex;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #f1f5f9;
      font-size: 13px;
      gap: 12px;
    }
    .rank-item:last-child { border-bottom: none; }
    .rank-num {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #f1f5f9;
      color: var(--text-muted);
      font-weight: 700;
      font-size: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .rank-num.top1 { background: #fef3c7; color: #b45309; }
    .rank-num.top2 { background: #e2e8f0; color: #475569; }
    .rank-num.top3 { background: #ffedd5; color: #c2410c; }
    .rank-info { flex: 1; min-width: 0; }
    .rank-title { font-weight: 600; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .rank-sub { font-size: 11px; color: var(--text-muted); font-family: monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .rank-val { font-weight: 700; color: #4c1d95; text-align: right; flex-shrink: 0; font-size: 13px; }
    .rank-bar-bg { height: 4px; background: #f1f5f9; border-radius: 2px; margin-top: 5px; overflow: hidden; }
    .rank-bar-fill { height: 100%; background: linear-gradient(90deg, #a855f7, #7c3aed); border-radius: 2px; }

    /* 訪客即時串流清單 */
    .table-container {
      overflow-x: auto;
    }
    .stream-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      text-align: left;
    }
    .stream-table th {
      padding: 10px 12px;
      background: #f8fafc;
      color: var(--text-muted);
      font-weight: 600;
      border-bottom: 1px solid var(--border);
      white-space: nowrap;
    }
    .stream-table td {
      padding: 10px 12px;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }
    .stream-table tr:hover td { background: #fbfbfe; }
  </style>
</head>
<body>
  <div class="container">

    <!-- 1. 設備綁定與授權區塊（未綁定設備時顯示） -->
    <div id="auth-view" class="auth-overlay">
      <div class="auth-card">
        <div class="auth-icon">🛡️</div>
        <h2 class="auth-title">設備授權與綁定</h2>
        <p class="auth-desc">本後台受 Master Token 安全防護。<br>請輸入管理員 Master Token 將目前設備完成綁定授權，日後此設備即可直接免密存取。</p>
        
        <div class="form-group">
          <label class="form-label" for="inp-master-token">Master Token：</label>
          <input type="password" id="inp-master-token" class="form-control" placeholder="請輸入安全 Master Token" />
        </div>
        <div class="form-group">
          <label class="form-label" for="inp-device-name">此設備備註名稱：</label>
          <input type="text" id="inp-device-name" class="form-control" placeholder="例如：我的 iPhone、辦公室桌機" value="我的常用設備" />
        </div>

        <button id="btn-bind" class="btn btn-primary" style="width:100%;padding:11px;" onclick="bindCurrentDevice()">
          🔐 驗證並綁定此設備
        </button>
        <div id="auth-error" style="color:var(--danger);font-size:13px;margin-top:12px;display:none;"></div>
      </div>
    </div>

    <!-- 2. 主儀表板視圖（綁定成功的設備才能進入） -->
    <div id="dashboard-view">
      <header>
        <div>
          <h1 style="display:flex;align-items:center;gap:10px;">
            <span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg, #a855f7, #7c3aed);color:white;box-shadow:0 2px 6px rgba(124,58,237,0.3);flex-shrink:0;">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 11h3a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a9 9 0 0 1 18 0v6a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h3"></path>
                <path d="M19 17v2a3 3 0 0 1-3 3h-4"></path>
                <circle cx="11.5" cy="22" r="1.4" fill="currentColor"></circle>
              </svg>
            </span>
            AI 客服對話紀錄管理後台
          </h1>
          <p style="font-size:13px;color:var(--text-muted);margin-top:4px;">DIY 無障礙輔具網站對話歷史、日期分類與設備統計</p>
        </div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <span class="device-pill" id="current-device-label">🟢 已授權設備</span>
          <button class="btn btn-secondary" onclick="openDevicesModal()">📱 授權設備清單</button>
          <button class="btn btn-danger" onclick="unbindCurrentDevice()">登出/解除綁定</button>
        </div>
      </header>

      <!-- 導覽分頁切換 -->
      <div class="main-nav-tabs">
        <button class="main-tab-btn active" id="btn-tab-chat" onclick="switchDashboardView('chat')">
          <span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg, #a855f7, #7c3aed);color:white;flex-shrink:0;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 11h3a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a9 9 0 0 1 18 0v6a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h3"></path>
              <path d="M19 17v2a3 3 0 0 1-3 3h-4"></path>
              <circle cx="11.5" cy="22" r="1.4" fill="currentColor"></circle>
            </svg>
          </span>
          AI 客服對話紀錄
        </button>
        <button class="main-tab-btn" id="btn-tab-stats" onclick="switchDashboardView('stats')">
          📊 網站訪客瀏覽統計
        </button>
      </div>

      <!-- 分頁 1：AI 客服紀錄視圖 -->
      <div id="view-chat">
        <div class="notice">
          ℹ️ <strong>自動容量清理維護：</strong>
        系統於每次寫入新對話時，會自動檢查並刪除超過 <strong>30 天（一個月）</strong> 的紀錄，免維護、免排程且不佔額外資料庫容量。
      </div>

      <!-- 統計數據 -->
      <div class="stats-bar">
        <div class="stat-card">
          <div class="stat-title">總對話紀錄數（30天內）</div>
          <div id="stat-total" class="stat-val">-</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">Gemini API 調用次數</div>
          <div id="stat-gemini" class="stat-val" style="color:#7c3aed;">-</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">Workers AI 備援次數</div>
          <div id="stat-cf" class="stat-val" style="color:#ea580c;">-</div>
        </div>
      </div>

      <!-- 📅 自動日期分組與點選切換列 -->
      <div class="date-nav-section">
        <div class="date-nav-header">
          <span>📅 請點選日期切換當日紀錄：</span>
          <span id="date-count-summary" style="font-size:12px;color:var(--text-muted);">載入中...</span>
        </div>
        <div class="date-tabs-container" id="date-tabs-bar">
          <div style="font-size:13px;color:var(--text-muted);padding:6px 0;">正在載入可用日期...</div>
        </div>
      </div>

      <!-- 搜尋與當日標題列 -->
      <div class="controls">
        <div class="current-date-heading" id="current-filter-label">
          <span>📅 載入當日紀錄中...</span>
        </div>
        <div style="display:flex;gap:8px;flex:1;max-width:550px;">
          <input type="text" id="search-input" class="search-input" placeholder="🔍 搜尋當日提問、回覆、IP 或系統/瀏覽器..." />
          <button class="btn btn-primary" onclick="loadLogs(1)">搜尋</button>
        </div>
      </div>

      <!-- 紀錄卡片列表 -->
      <div id="logs-list">
        <div class="empty-state">資料載入中...</div>
      </div>

      <!-- 分頁控制 -->
        <div class="pagination" id="pagination-bar" style="display:none;">
          <button id="btn-prev" class="btn btn-secondary" onclick="changePage(-1)">上一頁</button>
          <span id="page-info" style="font-size:14px;color:var(--text-muted);">第 1 頁</span>
          <button id="btn-next" class="btn btn-secondary" onclick="changePage(1)">下一頁</button>
        </div>
      </div><!-- end view-chat -->

      <!-- 分頁 2：網站訪客統計視圖 -->
      <div id="view-stats" style="display:none;">
        <div class="notice" style="background:#f0fdf4;border-color:#bbf7d0;color:#166534;justify-content:space-between;flex-wrap:wrap;gap:8px;">
          <div>
            📈 <strong>第一方訪客追蹤（AdBlock 免疫）：</strong>
            所有造訪紀錄皆由 Cloudflare Worker 第一方 API 記錄，資料保留 60 天並自動滾動清理。
          </div>
          <button class="btn btn-secondary" style="padding:4px 10px;font-size:12px;" onclick="loadVisitorStats()">
            🔄 重新整理
          </button>
        </div>

        <!-- 4 大核心數據卡片 -->
        <div class="stats-bar">
          <div class="stat-card">
            <div class="stat-title">今日頁面瀏覽量 (PV)</div>
            <div id="stat-today-pv" class="stat-val" style="color:#7c3aed;">-</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">今日獨立訪客 (UV)</div>
            <div id="stat-today-uv" class="stat-val" style="color:#0284c7;">-</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">30 天累計瀏覽量 (PV)</div>
            <div id="stat-total-pv" class="stat-val">-</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">30 天累計獨立訪客 (UV)</div>
            <div id="stat-total-uv" class="stat-val" style="color:#059669;">-</div>
          </div>
        </div>

        <!-- 近 14 天每日走勢長條圖 -->
        <div class="trend-chart-box">
          <div class="analytics-card-title">
            <span>📅 過去 14 天瀏覽趨勢 (每日 PV / UV)</span>
            <div class="trend-chart-legend">
              <span><span class="legend-dot" style="background:#7c3aed;"></span>瀏覽量 (PV)</span>
              <span><span class="legend-dot" style="background:#38bdf8;"></span>獨立訪客 (UV)</span>
            </div>
          </div>
          <div id="trend-chart-content" class="trend-chart-container">
            <div style="font-size:13px;color:var(--text-muted);text-align:center;width:100%;padding:40px 0;">載入趨勢圖表中...</div>
          </div>
        </div>

        <!-- 排行榜與分佈分析 -->
        <div class="analytics-grid">
          <!-- 左欄：熱門頁面排行 -->
          <div class="analytics-card">
            <div class="analytics-card-title">
              <span>🔥 熱門瀏覽頁面 Top 10</span>
              <span class="badge">依瀏覽次數</span>
            </div>
            <div id="top-pages-list">
              <div style="font-size:13px;color:var(--text-muted);padding:20px 0;text-align:center;">載入中...</div>
            </div>
          </div>

          <!-- 右欄：來源與裝置分佈 -->
          <div>
            <div class="analytics-card">
              <div class="analytics-card-title">
                <span>🌐 訪客主要來源</span>
                <span class="badge">Referrer</span>
              </div>
              <div id="top-referrers-list">
                <div style="font-size:13px;color:var(--text-muted);padding:14px 0;text-align:center;">載入中...</div>
              </div>
            </div>

            <div class="analytics-card">
              <div class="analytics-card-title">
                <span>💻 造訪裝置比例</span>
                <span class="badge">設備分佈</span>
              </div>
              <div id="device-stats-list">
                <div style="font-size:13px;color:var(--text-muted);padding:14px 0;text-align:center;">載入中...</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 最新即時訪客造訪串流 -->
        <div class="analytics-card">
          <div class="analytics-card-title">
            <span>⚡ 最新即時造訪動態 (最近 25 筆)</span>
            <span class="badge" id="recent-views-badge">即時串流</span>
          </div>
          <div class="table-container">
            <table class="stream-table">
              <thead>
                <tr>
                  <th>時間 (台北)</th>
                  <th>造訪頁面</th>
                  <th>訪客來源</th>
                  <th>IP / 地區</th>
                  <th>裝置與瀏覽器</th>
                </tr>
              </thead>
              <tbody id="recent-views-tbody">
                <tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:30px;">載入動態中...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div><!-- end view-stats -->
    </div>

    <!-- 3. 已授權設備管理彈窗 -->
    <div id="devices-modal" class="modal-backdrop">
      <div class="modal-box">
        <div class="modal-header">
          <h3>📱 已綁定授權的設備列表</h3>
          <span class="modal-close" onclick="closeDevicesModal()">✕</span>
        </div>
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:14px;">
          以下是目前通過 Master Token 授權可查閱紀錄的設備。若設備遺失或不再使用，可隨時撤銷其權限：
        </p>
        <div id="devices-list" style="max-height:300px;overflow-y:auto;">
          資料載入中...
        </div>
      </div>
    </div>

  </div>

  <script>
    const STORAGE_KEY = "pjwu_device_token";
    let currentPage = 1;
    const pageSize = 20;
    let selectedDate = ""; // 空字串表示全部，例如 "2026-10-31"

    function getDeviceToken() {
      return localStorage.getItem(STORAGE_KEY) || "";
    }

    // 解析 User-Agent 的作業系統與瀏覽器
    function parseClientUa(ua) {
      if (!ua) return { os: "未知系統", browser: "未知瀏覽器", deviceType: "設備" };

      let os = "其他系統";
      if (/windows nt 10/i.test(ua)) os = "Windows 10/11";
      else if (/windows nt 6\.3/i.test(ua)) os = "Windows 8.1";
      else if (/windows nt 6\.1/i.test(ua)) os = "Windows 7";
      else if (/iphone/i.test(ua)) os = "iPhone (iOS)";
      else if (/ipad/i.test(ua)) os = "iPad (iPadOS)";
      else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
      else if (/android/i.test(ua)) os = "Android";
      else if (/linux/i.test(ua)) os = "Linux";

      let browser = "其他瀏覽器";
      if (/edg/i.test(ua)) browser = "Microsoft Edge";
      else if (/line/i.test(ua)) browser = "LINE 內建瀏覽器";
      else if (/fban|fbav/i.test(ua)) browser = "FB 內建瀏覽器";
      else if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) browser = "Google Chrome";
      else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = "Apple Safari";
      else if (/firefox|fxios/i.test(ua)) browser = "Firefox";

      let deviceType = "💻 電腦";
      if (/mobile|iphone|android.*mobile/i.test(ua)) deviceType = "📱 手機";
      else if (/ipad|tablet|android(?!.*mobile)/i.test(ua)) deviceType = "平板";

      return { os, browser, deviceType };
    }

    // 檢查設備綁定狀態
    async function checkDeviceAuth() {
      const token = getDeviceToken();
      if (!token) {
        showAuthView();
        return;
      }

      try {
        const res = await fetch("/api/auth/check", {
          headers: { "x-device-token": token }
        });
        const data = await res.json();
        if (data.valid) {
          showDashboard(data.deviceName);
          loadLogs(1);
        } else {
          localStorage.removeItem(STORAGE_KEY);
          showAuthView("此設備授權已失效或已被撤銷，請重新輸入 Master Token 進行綁定。");
        }
      } catch (err) {
        showAuthView("驗證設備狀態失敗，請稍候再試。");
      }
    }

    // 執行設備綁定
    async function bindCurrentDevice() {
      const masterToken = document.getElementById("inp-master-token").value.trim();
      const deviceName = document.getElementById("inp-device-name").value.trim() || "未命名設備";
      const errEl = document.getElementById("auth-error");
      const btn = document.getElementById("btn-bind");

      if (!masterToken) {
        errEl.innerText = "請輸入 Master Token！";
        errEl.style.display = "block";
        return;
      }

      btn.disabled = true;
      btn.innerText = "綁定驗證中...";
      errEl.style.display = "none";

      try {
        const res = await fetch("/api/auth/bind", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ masterToken, deviceName })
        });
        const data = await res.json();

        if (data.success && data.deviceId) {
          localStorage.setItem(STORAGE_KEY, data.deviceId);
          showDashboard(data.deviceName);
          loadLogs(1);
        } else {
          errEl.innerText = data.error || "Master Token 不正確，驗證失敗！";
          errEl.style.display = "block";
        }
      } catch (e) {
        errEl.innerText = "連線驗證發生異常：" + e.message;
        errEl.style.display = "block";
      } finally {
        btn.disabled = false;
        btn.innerText = "🔐 驗證並綁定此設備";
      }
    }

    // 解除目前設備綁定 / 登出
    async function unbindCurrentDevice() {
      if (!confirm("確定要將目前此設備解除綁定並登出嗎？解除後需重新輸入 Master Token 才能存取。")) return;
      const token = getDeviceToken();
      if (token) {
        try {
          await fetch("/api/devices/revoke", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-device-token": token },
            body: JSON.stringify({ deviceId: token })
          });
        } catch (_) {}
      }
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }

    function showAuthView(errorMsg) {
      document.getElementById("auth-view").style.display = "flex";
      document.getElementById("dashboard-view").style.display = "none";
      if (errorMsg) {
        const errEl = document.getElementById("auth-error");
        errEl.innerText = errorMsg;
        errEl.style.display = "block";
      }
    }

    function showDashboard(deviceName) {
      document.getElementById("auth-view").style.display = "none";
      document.getElementById("dashboard-view").style.display = "block";
      document.getElementById("current-device-label").innerText = "🟢 已授權設備：" + (deviceName || "本機");
    }

    // 切換點選的日期
    function selectDate(dateStr) {
      if (selectedDate === dateStr) return;
      selectedDate = dateStr;
      updateFilterLabel();

      // 更新日期標籤 active 樣式
      document.querySelectorAll(".date-tab-btn").forEach(btn => {
        const btnDate = btn.getAttribute("data-date") || "";
        if (btnDate === dateStr) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });

      loadLogs(1);
    }

    // 渲染日期切換按鈕列（完全依日期區分，不包含全部紀錄）
    function renderDateTabs(availableDates = []) {
      const tabsBar = document.getElementById("date-tabs-bar");
      const summaryEl = document.getElementById("date-count-summary");
      if (summaryEl) {
        summaryEl.innerText = \`共 \${availableDates.length} 個有紀錄的日期\`;
      }

      if (!availableDates || availableDates.length === 0) {
        if (tabsBar) tabsBar.innerHTML = '<div style="font-size:13px;color:var(--text-muted);padding:6px 0;">尚無任何日期的對話紀錄。</div>';
        return;
      }

      // 如果尚未選定日期，預設選取最新有紀錄的那一天
      if (!selectedDate && availableDates.length > 0) {
        selectedDate = availableDates[0].log_date;
      }

      let html = '';
      availableDates.forEach(d => {
        const isActive = selectedDate === d.log_date;
        html += \`
          <button class="date-tab-btn \${isActive ? 'active' : ''}" data-date="\${d.log_date}" onclick="selectDate('\${d.log_date}')">
            📅 \${d.log_date} <span class="date-badge">\${d.count} 則</span>
          </button>
        \`;
      });

      if (tabsBar) tabsBar.innerHTML = html;
      updateFilterLabel();
    }

    function updateFilterLabel() {
      const labelEl = document.getElementById("current-filter-label");
      if (labelEl) {
        labelEl.innerHTML = selectedDate
          ? \`<span>📅 正在檢視當日紀錄：<strong>\${selectedDate}</strong></span>\`
          : '<span>📅 請點選上方日期檢視當日紀錄</span>';
      }
    }

    // 載入對話紀錄
    async function loadLogs(page = 1) {
      currentPage = page;
      const token = getDeviceToken();
      const search = document.getElementById("search-input").value.trim();
      const listEl = document.getElementById("logs-list");
      listEl.innerHTML = '<div class="empty-state">資料載入中...</div>';

      try {
        const queryParams = new URLSearchParams({ page, pageSize, search, date: selectedDate });
        const res = await fetch('/api/logs?' + queryParams.toString(), {
          headers: { "x-device-token": token }
        });

        if (res.status === 401) {
          showAuthView("授權過期或未授權，請重新驗證 Master Token。");
          return;
        }

        const data = await res.json();
        document.getElementById("stat-total").innerText = data.totalAll || data.total || 0;
        document.getElementById("stat-gemini").innerText = data.stats?.geminiCount || 0;
        document.getElementById("stat-cf").innerText = data.stats?.cfCount || 0;

        // 若尚未設定 selectedDate 且 API 回傳了可用日期，自動指定最新日期並重新載入該日
        if (!selectedDate && data.availableDates && data.availableDates.length > 0) {
          selectedDate = data.availableDates[0].log_date;
          renderDateTabs(data.availableDates);
          loadLogs(1);
          return;
        }

        // 渲染日期選單列
        if (data.availableDates) {
          renderDateTabs(data.availableDates);
        }

        if (!data.items || data.items.length === 0) {
          const emptyText = selectedDate 
            ? \`📅 \${selectedDate} 當日尚無對話紀錄。\` 
            : '尚無符合的對話紀錄。';
          listEl.innerHTML = \`<div class="empty-state">\${emptyText}</div>\`;
          document.getElementById("pagination-bar").style.display = "none";
          return;
        }

        let html = '';
        data.items.forEach(item => {
          let badgeClass = 'badge-gemini';
          if (item.provider?.includes('cloudflare')) badgeClass = 'badge-cf';
          else if (item.provider?.includes('fallback')) badgeClass = 'badge-fallback';

          const timeStr = formatUtcToTaipei(item.created_at);
          const clientInfo = parseClientUa(item.user_agent);

          // 地區資訊組合
          let geoInfo = '';
          if (item.client_city || item.client_country) {
            geoInfo = \`(\${[item.client_city, item.client_country].filter(Boolean).join(', ')})\`;
          }

          html += \`
            <div class="log-card">
              <div class="log-meta">
                <div>
                  🕒 <strong>\${timeStr}</strong> (UTC+8)
                  <span class="badge \${badgeClass}" style="margin-left:8px;">\${item.provider || '未知模型'}</span>
                </div>
                <div class="client-tags">
                  \${item.client_ip ? \`<span class="badge badge-ip" title="訪客連線 IP">🌐 \${item.client_ip} \${geoInfo}</span>\` : ''}
                  <span class="badge badge-client" title="訪客作業系統與設備">💻 \${clientInfo.deviceType} · \${clientInfo.os}</span>
                  <span class="badge badge-client" title="訪客瀏覽器">🧭 \${clientInfo.browser}</span>
                </div>
              </div>
              <div class="msg-section">
                <div class="msg-label">👤 訪客提問：</div>
                <div class="msg-bubble msg-user">\${escapeHtml(item.user_message)}</div>
              </div>
              <div class="msg-section">
                <div class="msg-label">🤖 AI 客服回覆：</div>
                <div class="msg-bubble msg-ai">\${escapeHtml(item.ai_reply || '無回覆內容')}</div>
              </div>
            </div>
          \`;
        });
        listEl.innerHTML = html;

        const totalPages = Math.ceil(data.total / pageSize) || 1;
        document.getElementById("page-info").innerText = \`第 \${currentPage} / \${totalPages} 頁 (本條件共 \${data.total} 筆)\`;
        document.getElementById("btn-prev").disabled = currentPage <= 1;
        document.getElementById("btn-next").disabled = currentPage >= totalPages;
        document.getElementById("pagination-bar").style.display = totalPages > 1 ? "flex" : "none";

      } catch (err) {
        listEl.innerHTML = \`<div class="empty-state" style="color:#ef4444;">載入失敗：\${err.message}</div>\`;
      }
    }

    function changePage(delta) {
      loadLogs(currentPage + delta);
    }

    // 授權設備管理彈窗
    async function openDevicesModal() {
      const modal = document.getElementById("devices-modal");
      const listEl = document.getElementById("devices-list");
      modal.style.display = "flex";
      listEl.innerHTML = "載入設備清單中...";

      try {
        const res = await fetch("/api/devices", {
          headers: { "x-device-token": getDeviceToken() }
        });
        const devices = await res.json();
        if (!devices || devices.length === 0) {
          listEl.innerHTML = '<div style="color:var(--text-muted);padding:10px;">目前尚無已綁定設備。</div>';
          return;
        }

        const currentToken = getDeviceToken();
        let html = '';
        devices.forEach(d => {
          const isCurrent = d.device_id === currentToken;
          const devInfo = parseClientUa(d.user_agent);
          html += \`
            <div class="device-item">
              <div>
                <div style="font-weight:600;font-size:14px;">
                  \${escapeHtml(d.device_name)} \${isCurrent ? '<span style="color:#059669;font-size:12px;">(目前這台設備)</span>' : ''}
                </div>
                <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">
                  \${devInfo.deviceType} · \${devInfo.os} · \${devInfo.browser}
                </div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">
                  綁定時間：\${formatUtcToTaipei(d.created_at)} | 最近使用：\${formatUtcToTaipei(d.last_used_at)}
                </div>
              </div>
              <div>
                <button class="btn btn-danger" style="font-size:12px;padding:4px 10px;" onclick="revokeDevice('\${d.device_id}')">
                  \${isCurrent ? '解除本機' : '撤銷授權'}
                </button>
              </div>
            </div>
          \`;
        });
        listEl.innerHTML = html;
      } catch (e) {
        listEl.innerHTML = '<div style="color:#ef4444;">載入設備列表失敗：' + e.message + '</div>';
      }
    }

    async function revokeDevice(deviceId) {
      if (!confirm("確定要撤銷此設備的授權嗎？該設備往後將無法查閱紀錄。")) return;
      try {
        await fetch("/api/devices/revoke", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-device-token": getDeviceToken() },
          body: JSON.stringify({ deviceId })
        });
        if (deviceId === getDeviceToken()) {
          localStorage.removeItem(STORAGE_KEY);
          location.reload();
        } else {
          openDevicesModal();
        }
      } catch (e) {
        alert("撤銷失敗：" + e.message);
      }
    }

    function closeDevicesModal() {
      document.getElementById("devices-modal").style.display = "none";
    }

    function formatUtcToTaipei(utcString) {
      if (!utcString) return '-';
      const d = new Date(utcString.replace(' ', 'T') + 'Z');
      if (isNaN(d.getTime())) return utcString;
      return d.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false });
    }

    function escapeHtml(str) {
      if (!str) return '';
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    document.getElementById("search-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") loadLogs(1);
    });

    document.getElementById("inp-master-token").addEventListener("keydown", (e) => {
      if (e.key === "Enter") bindCurrentDevice();
    });

    var currentDashboardView = 'chat';
    function switchDashboardView(view) {
      currentDashboardView = view;
      document.getElementById('btn-tab-chat').classList.toggle('active', view === 'chat');
      document.getElementById('btn-tab-stats').classList.toggle('active', view === 'stats');
      document.getElementById('view-chat').style.display = view === 'chat' ? 'block' : 'none';
      document.getElementById('view-stats').style.display = view === 'stats' ? 'block' : 'none';
      if (view === 'stats') {
        loadVisitorStats();
      }
    }

    async function loadVisitorStats() {
      var token = getDeviceToken();
      if (!token) return;
      try {
        var res = await fetch('/api/stats', {
          headers: { 'x-device-token': token }
        });
        if (!res.ok) throw new Error('取得統計失敗 (' + res.status + ')');
        var data = await res.json();
        renderVisitorStats(data);
      } catch (err) {
        console.error('載入統計失敗：', err);
      }
    }

    function getPageFullUrl(path) {
      if (!path || path === '/' || path === '/projectwu' || path === '/projectwu/') {
        return 'https://wen033codes.github.io/projectwu/index.html';
      }
      if (path.indexOf('http') === 0) return path;
      var cleanPath = path.indexOf('/') === 0 ? path : '/' + path;
      if (cleanPath.indexOf('/projectwu') === 0) {
        return 'https://wen033codes.github.io' + cleanPath;
      }
      return 'https://wen033codes.github.io/projectwu' + cleanPath;
    }

    function renderVisitorStats(data) {
      document.getElementById('stat-today-pv').innerText = (data.todayPv || 0).toLocaleString();
      document.getElementById('stat-today-uv').innerText = (data.todayUv || 0).toLocaleString();
      document.getElementById('stat-total-pv').innerText = (data.totalPv || 0).toLocaleString();
      document.getElementById('stat-total-uv').innerText = (data.totalUv || 0).toLocaleString();

      // 1. 趨勢長條圖
      var trendContainer = document.getElementById('trend-chart-content');
      if (data.dailyTrend && data.dailyTrend.length > 0) {
        var maxPv = Math.max.apply(Math, data.dailyTrend.map(function(d) { return d.pv; }).concat([1]));
        var trendHtml = '';
        data.dailyTrend.forEach(function(d) {
          var pvHeight = Math.max(Math.round((d.pv / maxPv) * 100), 5);
          var uvHeight = Math.max(Math.round((d.uv / maxPv) * 100), 5);
          var shortDate = d.stat_date.substring(5);
          trendHtml += '<div class="trend-bar-group">' +
            '<div class="trend-tooltip">' +
              '<strong>' + escapeHtml(d.stat_date) + '</strong><br>' +
              '瀏覽量 (PV)：' + d.pv + '<br>' +
              '獨立訪客 (UV)：' + d.uv +
            '</div>' +
            '<div class="trend-bars-wrapper">' +
              '<div class="trend-bar-pv" style="height:' + pvHeight + '%;"></div>' +
              '<div class="trend-bar-uv" style="height:' + uvHeight + '%;"></div>' +
            '</div>' +
            '<span class="trend-date-label">' + shortDate + '</span>' +
          '</div>';
        });
        trendContainer.innerHTML = trendHtml;
      } else {
        trendContainer.innerHTML = '<div style="font-size:13px;color:var(--text-muted);text-align:center;width:100%;padding:40px 0;">尚無足夠趨勢資料（訪客開始瀏覽後將自動累積）</div>';
      }

      // 2. 熱門頁面 Top 10
      var topPagesContainer = document.getElementById('top-pages-list');
      if (data.topPages && data.topPages.length > 0) {
        var maxPagePv = (data.topPages[0] && data.topPages[0].pv) || 1;
        var pagesHtml = '<ul class="rank-list">';
        data.topPages.forEach(function(p, idx) {
          var rankCls = idx === 0 ? 'top1' : (idx === 1 ? 'top2' : (idx === 2 ? 'top3' : ''));
          var fillWidth = Math.round((p.pv / maxPagePv) * 100);
          var displayTitle = p.title ? escapeHtml(p.title) : escapeHtml(p.path);
          var pageUrl = getPageFullUrl(p.path);
          pagesHtml += '<li class="rank-item">' +
            '<div class="rank-num ' + rankCls + '">' + (idx + 1) + '</div>' +
            '<div class="rank-info">' +
              '<div class="rank-title" title="' + displayTitle + '">' + displayTitle + '</div>' +
              '<div class="rank-sub">' +
                '<a href="' + escapeHtml(pageUrl) + '" target="_blank" rel="noopener noreferrer" style="color:#7c3aed;text-decoration:none;display:inline-flex;align-items:center;gap:3px;" title="在新分頁開啟此網頁">' +
                  '🔗 <span style="text-decoration:underline;">' + escapeHtml(p.path) + '</span> ↗' +
                '</a>' +
              '</div>' +
              '<div class="rank-bar-bg"><div class="rank-bar-fill" style="width:' + fillWidth + '%;"></div></div>' +
            '</div>' +
            '<div class="rank-val">' +
              p.pv.toLocaleString() + ' <span style="font-size:11px;font-weight:normal;color:var(--text-muted);">PV</span>' +
              '<div style="font-size:11px;font-weight:normal;color:var(--text-muted);">' + p.uv + ' UV</div>' +
            '</div>' +
          '</li>';
        });
        pagesHtml += '</ul>';
        topPagesContainer.innerHTML = pagesHtml;
      } else {
        topPagesContainer.innerHTML = '<div style="font-size:13px;color:var(--text-muted);padding:20px 0;text-align:center;">暫無頁面瀏覽資料</div>';
      }

      // 3. 訪客主要來源 Top Referrers
      var topRefContainer = document.getElementById('top-referrers-list');
      if (data.topReferrers && data.topReferrers.length > 0) {
        var refHtml = '<ul class="rank-list">';
        data.topReferrers.forEach(function(r) {
          var refText = r.ref;
          var isHttp = refText.indexOf('http') === 0;
          try {
            if (isHttp) {
              var u = new URL(refText);
              refText = u.hostname + (u.pathname !== '/' ? u.pathname : '');
            }
          } catch (_) {}
          var refContent = isHttp
            ? '<a href="' + escapeHtml(r.ref) + '" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:none;display:inline-flex;align-items:center;gap:3px;" title="' + escapeHtml(r.ref) + '">🔗 ' + escapeHtml(refText) + ' ↗</a>'
            : '<span style="color:var(--text-muted);">📍 ' + escapeHtml(refText) + '</span>';

          refHtml += '<li class="rank-item" style="padding:6px 0;">' +
            '<div class="rank-info">' +
              '<div class="rank-title" style="font-size:12px;">' + refContent + '</div>' +
            '</div>' +
            '<div class="rank-val" style="font-size:12px;">' + r.count.toLocaleString() + ' 次</div>' +
          '</li>';
        });
        refHtml += '</ul>';
        topRefContainer.innerHTML = refHtml;
      } else {
        topRefContainer.innerHTML = '<div style="font-size:13px;color:var(--text-muted);padding:14px 0;text-align:center;">暫無來源資料</div>';
      }

      // 4. 造訪裝置比例
      var devContainer = document.getElementById('device-stats-list');
      if (data.deviceStats && data.deviceStats.length > 0) {
        var totalDevCount = data.deviceStats.reduce(function(sum, d) { return sum + d.count; }, 0) || 1;
        var devHtml = '<div style="display:flex;flex-direction:column;gap:8px;">';
        data.deviceStats.forEach(function(d) {
          var pct = Math.round((d.count / totalDevCount) * 100);
          devHtml += '<div>' +
            '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px;">' +
              '<span>' + escapeHtml(d.device_type) + '</span>' +
              '<span style="font-weight:600;">' + d.count + ' 次 (' + pct + '%)</span>' +
            '</div>' +
            '<div class="rank-bar-bg" style="margin-top:0;"><div class="rank-bar-fill" style="width:' + pct + '%;background:#38bdf8;"></div></div>' +
          '</div>';
        });
        devHtml += '</div>';
        devContainer.innerHTML = devHtml;
      } else {
        devContainer.innerHTML = '<div style="font-size:13px;color:var(--text-muted);padding:14px 0;text-align:center;">暫無裝置資料</div>';
      }

      // 5. 最新即時串流 (Recent Views)
      var tbody = document.getElementById('recent-views-tbody');
      if (data.recentViews && data.recentViews.length > 0) {
        var rowsHtml = '';
        data.recentViews.forEach(function(v) {
          var timeStr = formatUtcToTaipei(v.created_at);
          var refDisplay = v.referrer || '直接訪問';
          if (refDisplay.length > 35) refDisplay = refDisplay.substring(0, 32) + '...';
          var pageTitle = v.title ? escapeHtml(v.title) : escapeHtml(v.path);
          var pageUrl = getPageFullUrl(v.path);
          var isRefHttp = v.referrer && v.referrer.indexOf('http') === 0;
          var refCell = isRefHttp
            ? '<a href="' + escapeHtml(v.referrer) + '" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:none;display:inline-flex;align-items:center;gap:3px;" title="' + escapeHtml(v.referrer) + '">🔗 ' + escapeHtml(refDisplay) + ' ↗</a>'
            : '<span>' + (v.referrer ? '🔗 ' : '📍 ') + escapeHtml(refDisplay) + '</span>';

          rowsHtml += '<tr>' +
            '<td style="color:var(--text-muted);font-size:12px;white-space:nowrap;">' + timeStr + '</td>' +
            '<td>' +
              '<div style="font-weight:600;color:var(--text-main);max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="' + pageTitle + '">' +
                pageTitle +
              '</div>' +
              '<div style="font-size:11px;font-family:monospace;margin-top:2px;">' +
                '<a href="' + escapeHtml(pageUrl) + '" target="_blank" rel="noopener noreferrer" style="color:#7c3aed;text-decoration:none;display:inline-flex;align-items:center;gap:3px;" title="在新分頁開啟此網頁">' +
                  '🔗 <span style="text-decoration:underline;">' + escapeHtml(v.path) + '</span> ↗' +
                '</a>' +
              '</div>' +
            '</td>' +
            '<td style="font-size:12px;color:var(--text-muted);">' +
              refCell +
            '</td>' +
            '<td style="font-size:12px;">' +
              '<div>' + escapeHtml(v.client_ip || '-') + '</div>' +
              '<div style="font-size:11px;color:var(--text-muted);">' + escapeHtml(v.client_country || '') + ' ' + escapeHtml(v.client_city || '') + '</div>' +
            '</td>' +
            '<td style="font-size:12px;">' +
              '<div>' + escapeHtml(v.device_type || '電腦') + ' · ' + escapeHtml(v.os || '-') + '</div>' +
              '<div style="font-size:11px;color:var(--text-muted);">' + escapeHtml(v.browser || '-') + '</div>' +
            '</td>' +
          '</tr>';
        });
        tbody.innerHTML = rowsHtml;
      } else {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:30px;">尚無訪客瀏覽紀錄</td></tr>';
      }
    }

    // 網頁載入時檢查設備綁定狀態
    checkDeviceAuth();
  </script>
</body>
</html>`;
}

// 輔助函式：確保訪客統計表存在
let isStatsTableChecked = false;
async function ensureStatsTable(db) {
  if (isStatsTableChecked || !db) return;
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS page_views (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT NOT NULL,
        title TEXT,
        referrer TEXT,
        visitor_id TEXT,
        client_ip TEXT,
        user_agent TEXT,
        device_type TEXT,
        os TEXT,
        browser TEXT,
        client_country TEXT,
        client_city TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_pv_created_at ON page_views(created_at)`).run();
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_pv_path ON page_views(path)`).run();
    isStatsTableChecked = true;
  } catch (e) {
    console.error("Failed to ensure page_views table:", e);
  }
}

// 輔助函式：伺服器端解析 User-Agent
function parseUserAgentServer(ua) {
  if (!ua) return { os: "未知系統", browser: "未知瀏覽器", deviceType: "💻 電腦" };

  let os = "其他系統";
  if (/windows nt 10/i.test(ua)) os = "Windows 10/11";
  else if (/windows nt 6\.3/i.test(ua)) os = "Windows 8.1";
  else if (/windows nt 6\.1/i.test(ua)) os = "Windows 7";
  else if (/iphone/i.test(ua)) os = "iPhone (iOS)";
  else if (/ipad/i.test(ua)) os = "iPad (iPadOS)";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/linux/i.test(ua)) os = "Linux";

  let browser = "其他瀏覽器";
  if (/edg/i.test(ua)) browser = "Microsoft Edge";
  else if (/line/i.test(ua)) browser = "LINE";
  else if (/fban|fbav/i.test(ua)) browser = "Facebook";
  else if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) browser = "Chrome";
  else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = "Safari";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";

  let deviceType = "💻 電腦";
  if (/mobile|iphone|android.*mobile/i.test(ua)) deviceType = "📱 手機";
  else if (/ipad|tablet|android(?!.*mobile)/i.test(ua)) deviceType = "平板";

  return { os, browser, deviceType };
}

// 輔助函式：檢查設備 Token 是否有效
async function verifyDeviceToken(db, token) {
  if (!db || !token) return null;
  const row = await db.prepare(
    "SELECT id, device_id, device_name FROM authorized_devices WHERE device_id = ?"
  ).bind(token).first();
  if (row) {
    // 異步刷新最後使用時間
    db.prepare("UPDATE authorized_devices SET last_used_at = datetime('now') WHERE id = ?").bind(row.id).run();
    return row;
  }
  return null;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-device-token",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const masterToken = env.MASTER_TOKEN || DEFAULT_MASTER_TOKEN;

    // ============================================================
    // 路由 1：後台管理介面（僅在 Worker 內部）
    // ============================================================
    if (request.method === "GET" && (url.pathname === "/logs" || url.pathname === "/admin/logs" || url.pathname === "/admin")) {
      return new Response(renderAdminHtml(), {
        headers: { "Content-Type": "text/html; charset=UTF-8" }
      });
    }

    // ============================================================
    // 路由 2：設備授權檢驗 API
    // ============================================================
    if (request.method === "GET" && url.pathname === "/api/auth/check") {
      const token = request.headers.get("x-device-token") || url.searchParams.get("device_token");
      const dev = await verifyDeviceToken(env.DB, token);
      if (dev) {
        return new Response(JSON.stringify({ valid: true, deviceName: dev.device_name }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      return new Response(JSON.stringify({ valid: false }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ============================================================
    // 路由 3：設備綁定 API (需要 Master Token)
    // ============================================================
    if (request.method === "POST" && url.pathname === "/api/auth/bind") {
      try {
        const { masterToken: inputToken, deviceName = "未命名設備" } = await request.json();
        if (!inputToken || inputToken !== masterToken) {
          return new Response(JSON.stringify({ success: false, error: "Master Token 不正確" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        const clientIp = request.headers.get("cf-connecting-ip") || "unknown";
        const userAgent = request.headers.get("user-agent") || "unknown";
        const newDeviceId = "dev_" + crypto.randomUUID();

        await env.DB.prepare(
          `INSERT INTO authorized_devices (device_id, device_name, client_ip, user_agent, created_at, last_used_at)
           VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`
        ).bind(newDeviceId, deviceName, clientIp, userAgent).run();

        return new Response(JSON.stringify({ 
          success: true, 
          deviceId: newDeviceId, 
          deviceName 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // ============================================================
    // 路由 4：授權設備清單 API（需已授權設備存取）
    // ============================================================
    if (request.method === "GET" && url.pathname === "/api/devices") {
      const token = request.headers.get("x-device-token") || url.searchParams.get("device_token");
      const dev = await verifyDeviceToken(env.DB, token);
      if (!dev) {
        return new Response(JSON.stringify({ error: "未授權設備" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const list = await env.DB.prepare(
        "SELECT id, device_id, device_name, client_ip, user_agent, created_at, last_used_at FROM authorized_devices ORDER BY id DESC"
      ).all();

      return new Response(JSON.stringify(list.results || []), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ============================================================
    // 路由 5：撤銷設備授權 API
    // ============================================================
    if (request.method === "POST" && url.pathname === "/api/devices/revoke") {
      const token = request.headers.get("x-device-token");
      const dev = await verifyDeviceToken(env.DB, token);
      if (!dev) {
        return new Response(JSON.stringify({ error: "未授權設備" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const { deviceId } = await request.json();
      await env.DB.prepare("DELETE FROM authorized_devices WHERE device_id = ?").bind(deviceId).run();
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ============================================================
    // 路由 6：後台紀錄查詢 API（支援日期篩選與可用日期分組清單）
    // ============================================================
    if (request.method === "GET" && url.pathname === "/api/logs") {
      const token = request.headers.get("x-device-token") || url.searchParams.get("device_token");
      const dev = await verifyDeviceToken(env.DB, token);
      if (!dev) {
        return new Response(JSON.stringify({ error: "此設備尚未授權或已失效，請先以 Master Token 進行綁定。" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      try {
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const pageSize = parseInt(url.searchParams.get("pageSize") || "20", 10);
        const search = (url.searchParams.get("search") || "").trim();
        const dateFilter = (url.searchParams.get("date") || "").trim();
        const offset = (page - 1) * pageSize;

        let whereClauses = [];
        const params = [];

        if (dateFilter) {
          whereClauses.push("date(created_at, '+8 hours') = ?");
          params.push(dateFilter);
        }

        if (search) {
          whereClauses.push("(user_message LIKE ? OR ai_reply LIKE ? OR client_ip LIKE ? OR user_agent LIKE ? OR client_city LIKE ?)");
          params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }

        const whereSql = whereClauses.length > 0 ? " WHERE " + whereClauses.join(" AND ") : "";

        const countSql = `SELECT COUNT(*) as total FROM chat_logs${whereSql}`;
        const querySql = `SELECT * FROM chat_logs${whereSql} ORDER BY id DESC LIMIT ? OFFSET ?`;
        const queryParams = [...params, pageSize, offset];

        // 同時取得當前過濾筆數、紀錄列表、全站總筆數、模型統計與日期分組統計
        const [totalRes, itemsRes, totalAllRes, statsRes, dateGroupsRes] = await Promise.all([
          env.DB.prepare(countSql).bind(...params).first(),
          env.DB.prepare(querySql).bind(...queryParams).all(),
          env.DB.prepare("SELECT COUNT(*) as totalAll FROM chat_logs").first(),
          env.DB.prepare(`
            SELECT 
              COUNT(CASE WHEN provider LIKE '%gemini%' THEN 1 END) as geminiCount,
              COUNT(CASE WHEN provider LIKE '%cloudflare%' THEN 1 END) as cfCount
            FROM chat_logs
          `).first(),
          env.DB.prepare(`
            SELECT date(created_at, '+8 hours') as log_date, COUNT(*) as count 
            FROM chat_logs 
            GROUP BY log_date 
            ORDER BY log_date DESC
          `).all()
        ]);

        return new Response(JSON.stringify({
          total: totalRes?.total || 0,
          totalAll: totalAllRes?.totalAll || 0,
          page,
          pageSize,
          items: itemsRes?.results || [],
          stats: statsRes || { geminiCount: 0, cfCount: 0 },
          availableDates: dateGroupsRes?.results || []
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // ============================================================
    // 路由 6：前台頁面瀏覽統計接收 API (Beacon / Fetch 第一方上報)
    // ============================================================
    if (request.method === "POST" && url.pathname === "/api/track") {
      try {
        await ensureStatsTable(env.DB);
        let body = {};
        try {
          body = await request.json();
        } catch (_) {}

        // 來源安全性防護：若有 Origin / Referer 標頭，驗證是否為本網站 (防外部盜連灌水)
        const originHeader = (request.headers.get("origin") || "").toLowerCase();
        const refererHeader = (request.headers.get("referer") || "").toLowerCase();
        const isTrusted = !originHeader || originHeader === "null" || originHeader.includes("github.io") || originHeader.includes("localhost") || originHeader.includes("127.0.0.1") || refererHeader.includes("github.io");
        if (!isTrusted) {
          return new Response(JSON.stringify({ success: false, reason: "Untrusted origin" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        const path = (body.path || "/").substring(0, 255);
        const title = (body.title || "").substring(0, 255);
        const referrer = (body.referrer || "").substring(0, 500);
        const visitorId = (body.visitorId || "").substring(0, 100);

        const clientIp = request.headers.get("cf-connecting-ip") || "unknown";
        const userAgent = request.headers.get("user-agent") || "unknown";
        const clientCountry = request.cf?.country || "TW";
        const clientCity = request.cf?.city || "unknown";

        const { os, browser, deviceType } = parseUserAgentServer(userAgent);

        ctx.waitUntil(
          (async () => {
            try {
              await env.DB.prepare(`
                INSERT INTO page_views (path, title, referrer, visitor_id, client_ip, user_agent, device_type, os, browser, client_country, client_city, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
              `).bind(path, title, referrer, visitorId, clientIp, userAgent, deviceType, os, browser, clientCountry, clientCity).run();

              // 自動清理逾 60 天舊資料 (保持免費輕量無負擔)
              await env.DB.prepare(`DELETE FROM page_views WHERE created_at < datetime('now', '-60 days')`).run();
            } catch (e) {
              console.error("Failed to insert page_view:", e);
            }
          })()
        );

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // ============================================================
    // 路由 7：後台訪客統計數據 API (需驗證設備 Token)
    // ============================================================
    if (request.method === "GET" && url.pathname === "/api/stats") {
      const token = request.headers.get("x-device-token") || url.searchParams.get("device_token");
      const dev = await verifyDeviceToken(env.DB, token);
      if (!dev) {
        return new Response(JSON.stringify({ error: "尚未通過 Master Token 設備授權" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      await ensureStatsTable(env.DB);

      try {
        const [todayStats, totalStats, dailyTrend, topPages, topReferrers, deviceStats, recentViews] = await Promise.all([
          // 1. 今日 PV 與 UV (+8 小時台北時間)
          env.DB.prepare(`
            SELECT 
              COUNT(*) as todayPv,
              COUNT(DISTINCT visitor_id) as todayUv
            FROM page_views 
            WHERE date(created_at, '+8 hours') = date('now', '+8 hours')
          `).first(),

          // 2. 30 天累計 PV 與 UV
          env.DB.prepare(`
            SELECT 
              COUNT(*) as totalPv,
              COUNT(DISTINCT visitor_id) as totalUv
            FROM page_views
          `).first(),

          // 3. 過去 14 天每日走勢
          env.DB.prepare(`
            SELECT 
              date(created_at, '+8 hours') as stat_date,
              COUNT(*) as pv,
              COUNT(DISTINCT visitor_id) as uv
            FROM page_views
            WHERE created_at >= datetime('now', '-14 days')
            GROUP BY stat_date
            ORDER BY stat_date ASC
          `).all(),

          // 4. 熱門瀏覽頁面 Top 10
          env.DB.prepare(`
            SELECT 
              path,
              title,
              COUNT(*) as pv,
              COUNT(DISTINCT visitor_id) as uv
            FROM page_views
            GROUP BY path
            ORDER BY pv DESC
            LIMIT 10
          `).all(),

          // 5. 訪客來源 Top 8
          env.DB.prepare(`
            SELECT 
              CASE 
                WHEN referrer = '' OR referrer IS NULL THEN '直接訪問 (Direct / 書籤)'
                ELSE referrer 
              END as ref,
              COUNT(*) as count
            FROM page_views
            GROUP BY ref
            ORDER BY count DESC
            LIMIT 8
          `).all(),

          // 6. 裝置類型分佈
          env.DB.prepare(`
            SELECT 
              COALESCE(device_type, '💻 電腦') as device_type,
              COUNT(*) as count
            FROM page_views
            GROUP BY device_type
            ORDER BY count DESC
          `).all(),

          // 7. 最近 25 筆詳細紀錄
          env.DB.prepare(`
            SELECT 
              id, path, title, referrer, client_ip, client_country, client_city,
              device_type, os, browser, created_at
            FROM page_views
            ORDER BY id DESC
            LIMIT 25
          `).all()
        ]);

        return new Response(JSON.stringify({
          todayPv: todayStats?.todayPv || 0,
          todayUv: todayStats?.todayUv || 0,
          totalPv: totalStats?.totalPv || 0,
          totalUv: totalStats?.totalUv || 0,
          dailyTrend: dailyTrend?.results || [],
          topPages: topPages?.results || [],
          topReferrers: topReferrers?.results || [],
          deviceStats: deviceStats?.results || [],
          recentViews: recentViews?.results || []
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed. For logs management, please visit /logs", { status: 405 });
    }

    try {
      const { message, history = [] } = await request.json();
      if (!message) {
        return new Response(JSON.stringify({ error: "訊息不能為空" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // 檢查是否至少有一種 AI 服務可用 (GEMINI_API_KEY 或 Cloudflare Workers AI env.AI)
      if (!env.GEMINI_API_KEY && !env.AI) {
        return new Response(JSON.stringify({ 
          error: "尚未設定 GEMINI_API_KEY Secret 且未綁定 Cloudflare Workers AI (env.AI)，請至少配置其中一項。" 
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // 系統提示詞（System Instruction）
      const systemInstruction = `你是一位專業、富有同理心且熱心助人的「DIY無障礙輔具與智能家居」線上專屬AI客服小助手。
請基於以下【網站知識庫】與【網站頁面地圖】親切回答使用者的詢問。

【超核心原則與業務邊界防護（必須嚴格遵守）】：
1. 【嚴格業務範圍限制】：你的職責「僅限於」解答與【無障礙輔具、肢體障礙/漸凍人照護、自製DIY輔具（如小白鴿叫人鈴、吹吸滑鼠/開關、小橘喵聲控滑鼠、哈士奇眼控、小飛鼠穿戴滑鼠、小蝌蚪開關、智能家居聲控改造等）、硬體規格、零件購買指南與程式燒錄手冊】相關之議題。
2. 【婉拒無關問題】：若使用者詢問與本站主題完全無關的問題（例如：一般閒聊、時事新聞、娛樂八卦、寫作業、寫程式碼、算命、投資理財等），請務必「禮貌婉拒並引導回本站業務」。
   婉拒範例：「您好！我是專門為『DIY無障礙輔具與智能家居改造』服務的專屬諮詢小幫手。我主要為您解答小白鴿叫人鈴、吹吸滑鼠、小橘喵、哈士奇眼控等輔具製作、操作與零件規格問題喔！如果您或身邊親友有電腦/手機操作或居家環境無障礙改造的需求，歡迎隨時詢問我 😊」
3. 【頁面連結導引】：回答中只要提及任何自製輔具、手冊、Q&A 或改造說明，請務必提供可點選的 Markdown 格式超連結（格式範例：[👉 小白鴿聲控叫人鈴完整介紹](white-pigeon-bell.html) 或 [👉 小白鴿使用手冊](dove-manual.html)）。
4. 【嚴格禁止裸露英文檔名】：絕對不要在回覆對話中直接顯示網頁英文檔名（嚴禁出現如「詳情請見 white-pigeon-bell.html」這種生硬文字）！超連結文字一律使用親切明瞭的繁體中文名稱！
5. 【同理心與專業建議】：針對使用者的身體障礙狀況，主動推薦最合適的輔具（手不能動推薦吹吸系列；僅能動眼球推薦哈士奇眼控；口語尚可推薦小白鴿或小橘喵）。
6. 【繁體中文】：請一律使用繁體中文（台灣）回答，語氣溫和、有耐心、充滿關懷。

【網站頁面地圖（請以此產生中文超連結）】：
- 小白鴿聲控叫人鈴：white-pigeon-bell.html
- 小白鴿聲控叫人鈴使用說明：dove-manual.html
- 小鸚鵡聲控緊急連絡盒：parrot-emergency-box.html
- 小鸚鵡聲控緊急連絡盒使用說明：parrot-manual.html
- 藍牙吹吸滑鼠：puff-suck-mouse.html
- 藍牙吹吸切換開關 (iOS切換控制)：puff-suck-switch.html
- 藍牙吹吸滑鼠按鍵：puff-suck-mouse-button.html
- 小橘喵藍牙聲控滑鼠：orange-cat-mouse.html
- 小蝌蚪藍牙切換開關：tadpole-switch.html
- 小蝌蚪藍牙滑鼠按鍵：tadpole-mouse-button.html
- 小雲豹藍牙雙鍵滑鼠：cloud-leopard-mouse.html
- 小飛鼠藍牙穿戴式滑鼠：flying-squirrel-mouse.html
- 哈士奇眼控叫人鈴：husky.html
- 微蜂晃動叫人鈴：micro-bee-shake-bell.html
- 小八哥語音播放盒：little-myna.html
- 智能家居改造方案：smart-home.html
- KSB040 充電電池模組：ksb040.html
- Q&A 常見問題與材料購買指南：qa.html
- 網站首頁：index.html

【網站知識庫內容】：
${JSON.stringify(knowledge, null, 2)}
`;

      let replyText = null;
      let usedProvider = null;
      let geminiErrorMessage = "";
      let isGeminiQuotaExceeded = false;

      // ============================================================
      // 步驟 1：優先使用 Google Gemini API
      // ============================================================
      if (env.GEMINI_API_KEY) {
        const contents = [];
        for (const item of history.slice(-6)) {
          contents.push({
            role: item.role === "assistant" ? "model" : "user",
            parts: [{ text: item.content }]
          });
        }
        contents.push({
          role: "user",
          parts: [{ text: message }]
        });

        // 優先支援最新且穩定度最佳的 Gemini 模型
        const geminiModels = [
          "gemini-3.5-flash-lite",
          "gemini-3.8-flash",
          "gemini-2.5-flash"
        ];

        for (const model of geminiModels) {
          try {
            const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
            const res = await fetch(geminiApiUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                system_instruction: {
                  parts: [{ text: systemInstruction }]
                },
                contents: contents,
                generationConfig: {
                  temperature: 0.4,
                  maxOutputTokens: 800
                }
              })
            });

            const data = await res.json();
            if (data.candidates && data.candidates.length > 0 && data.candidates[0]?.content?.parts?.[0]?.text) {
              replyText = data.candidates[0].content.parts[0].text;
              usedProvider = `gemini (${model})`;
              break;
            } else if (data.error) {
              geminiErrorMessage = data.error.message || JSON.stringify(data.error);
              console.warn(`Gemini 模型 ${model} 請求未成功:`, geminiErrorMessage);

              if (
                geminiErrorMessage.includes("quota") ||
                geminiErrorMessage.includes("Resource has been exhausted") ||
                geminiErrorMessage.includes("429") ||
                geminiErrorMessage.includes("RESOURCE_EXHAUSTED") ||
                geminiErrorMessage.includes("Rate limit")
              ) {
                isGeminiQuotaExceeded = true;
              }
            }
          } catch (e) {
            geminiErrorMessage = e.message;
            console.warn(`Gemini API fetch 例外 (${model}):`, e.message);
          }
        }
      } else {
        geminiErrorMessage = "未設定 GEMINI_API_KEY";
      }

      // ============================================================
      // 步驟 2：備援機制 - 若 Gemini 未設定、達到額度限制或調用失敗，改用 Cloudflare Workers AI
      // ============================================================
      if (!replyText && env.AI) {
        console.warn(
          `觸發備援機制：切換至 Cloudflare Workers AI (原因: ${
            isGeminiQuotaExceeded ? "Gemini 配額/頻率超限" : geminiErrorMessage || "Gemini 未產出回覆"
          })`
        );

        // Workers AI 備選模型：以繁體中文表現佳且活躍支援的最新開源模型為主
        const cfModels = [
          "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
          "@cf/meta/llama-3.1-8b-instruct-fast",
          "@cf/meta/llama-3.2-3b-instruct",
          "@cf/qwen/qwen2.5-7b-instruct",
          "@cf/google/gemma-2-9b-it"
        ];

        const cfMessages = [
          { role: "system", content: systemInstruction },
          ...history.slice(-6).map(item => ({
            role: item.role === "assistant" ? "assistant" : "user",
            content: item.content
          })),
          { role: "user", content: message }
        ];

        for (const cfModel of cfModels) {
          try {
            const aiRes = await env.AI.run(cfModel, {
              messages: cfMessages,
              max_tokens: 800,
              temperature: 0.4
            });

            if (aiRes && (aiRes.response || aiRes.text)) {
              replyText = (aiRes.response || aiRes.text).trim();
              usedProvider = `cloudflare-workers-ai (${cfModel})`;
              console.log(`Cloudflare Workers AI 備援成功 (${cfModel})`);
              break;
            }
          } catch (cfErr) {
            console.warn(`Cloudflare Workers AI 模型 ${cfModel} 請求失敗:`, cfErr.message);
          }
        }
      }

      // ============================================================
      // 步驟 3：若所有 AI 皆無法取得回覆，回傳友善提示
      // ============================================================
      if (!replyText) {
        const friendlyMessage = isGeminiQuotaExceeded
          ? "💡 目前線上諮詢人數較多或今日免費額度已達上限，請稍候片刻再試，或歡迎直接點選選單瀏覽各項輔具詳細說明喔！"
          : "💡 目前線上諮詢服務連線稍忙碌，請稍候片刻再試，或歡迎直接瀏覽相關網頁完整說明喔！";

        replyText = friendlyMessage;
        usedProvider = "fallback-notice";
      }

      // ============================================================
      // 步驟 4：記錄對話紀錄至 Cloudflare D1（含訪客連線 IP、國家/城市、User-Agent 等完整資訊）
      // 使用 ctx.waitUntil 非阻塞執行，完全不增加訪客等待 AI 回應的時間
      // ============================================================
      if (env.DB) {
        const clientIp = request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || "unknown";
        const userAgent = request.headers.get("user-agent") || "unknown";
        const clientCountry = request.cf?.country || "";
        const clientCity = request.cf?.city || "";

        const saveAndCleanupTask = (async () => {
          try {
            // 1. 寫入新紀錄（含 IP、國家、城市、User-Agent）
            await env.DB.prepare(
              `INSERT INTO chat_logs (user_message, ai_reply, provider, client_ip, user_agent, client_country, client_city, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
            ).bind(message, replyText, usedProvider, clientIp, userAgent, clientCountry, clientCity).run();

            // 2. 自動檢查並刪除超過 30 天（一個月）的舊紀錄
            await env.DB.prepare(
              `DELETE FROM chat_logs WHERE created_at < datetime('now', '-30 days')`
            ).run();
          } catch (dbErr) {
            console.error("儲存對話紀錄或清理過期紀錄失敗:", dbErr);
          }
        })();

        if (ctx && ctx.waitUntil) {
          ctx.waitUntil(saveAndCleanupTask);
        } else {
          await saveAndCleanupTask;
        }
      }

      // 成功回傳結果
      return new Response(JSON.stringify({ 
        reply: replyText,
        provider: usedProvider
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};
