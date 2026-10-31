import knowledge from './knowledge.json';

// 預設 Master Token（使用者可透過 npx wrangler secret put MASTER_TOKEN 隨時覆蓋）
const DEFAULT_MASTER_TOKEN = "pjwu-master-2026-safe-token-89f4b";

// 後台管理 HTML 介面產生器（含 Master Token 設備綁定授權防護）
function renderAdminHtml() {
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI 客服紀錄管理後台 - 設備授權安全版</title>
  <link rel="icon" href="https://wen033codes.github.io/favicon.png" type="image/png">
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
    .auth-icon {
      font-size: 48px;
      margin-bottom: 12px;
      display: inline-block;
    }
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
      margin-bottom: 24px;
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
      margin-bottom: 24px;
    }
    .stat-card {
      background: var(--card-bg);
      padding: 16px 20px;
      border-radius: 12px;
      border: 1px solid var(--border);
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .stat-title { font-size: 13px; color: var(--text-muted); margin-bottom: 4px; }
    .stat-val { font-size: 24px; font-weight: 700; color: var(--text-main); }
    .controls {
      background: var(--card-bg);
      padding: 16px 20px;
      border-radius: 12px;
      border: 1px solid var(--border);
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 20px;
      align-items: center;
      justify-content: space-between;
    }
    .search-input {
      flex: 1;
      min-width: 240px;
      padding: 8px 14px;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 14px;
      outline: none;
    }
    .search-input:focus { border-color: var(--primary); }
    .btn {
      padding: 8px 16px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-size: 14px;
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
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid #a7f3d0;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .log-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 18px 20px;
      margin-bottom: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
      transition: border-color 0.2s;
    }
    .log-card:hover { border-color: #cbd5e1; }
    .log-meta {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 10px;
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 1px solid #f1f5f9;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
    }
    .badge-gemini { background: #ede9fe; color: #6d28d9; }
    .badge-cf { background: #ffedd5; color: #c2410c; }
    .badge-fallback { background: #fee2e2; color: #b91c1c; }
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
    .empty-state { text-align: center; padding: 60px 20px; color: var(--text-muted); }

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
          <h1>🤖 AI 客服對話紀錄管理後台</h1>
          <p style="font-size:13px;color:var(--text-muted);margin-top:4px;">DIY 無障礙輔具網站對話歷史與模型使用統計</p>
        </div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <span class="device-pill" id="current-device-label">🟢 已授權設備</span>
          <button class="btn btn-secondary" onclick="openDevicesModal()">📱 授權設備清單</button>
          <button class="btn btn-danger" onclick="unbindCurrentDevice()">登出/解除綁定</button>
        </div>
      </header>

      <div class="notice">
        ℹ️ <strong>自動容量清理維護：</strong>
        系統於每次寫入新對話時，會自動檢查並刪除超過 <strong>30 天（一個月）</strong> 的紀錄，免維護、免排程且不佔額外資料庫容量。
      </div>

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

      <div class="controls">
        <input type="text" id="search-input" class="search-input" placeholder="🔍 搜尋提問關鍵字或回覆內容..." />
        <button class="btn btn-primary" onclick="loadLogs(1)">搜尋 / 重新整理</button>
      </div>

      <div id="logs-list">
        <div class="empty-state">資料載入中...</div>
      </div>

      <div class="pagination" id="pagination-bar" style="display:none;">
        <button id="btn-prev" class="btn btn-secondary" onclick="changePage(-1)">上一頁</button>
        <span id="page-info" style="font-size:14px;color:var(--text-muted);">第 1 頁</span>
        <button id="btn-next" class="btn btn-secondary" onclick="changePage(1)">下一頁</button>
      </div>
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

    function getDeviceToken() {
      return localStorage.getItem(STORAGE_KEY) || "";
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

    // 載入對話紀錄
    async function loadLogs(page = 1) {
      currentPage = page;
      const token = getDeviceToken();
      const search = document.getElementById("search-input").value.trim();
      const listEl = document.getElementById("logs-list");
      listEl.innerHTML = '<div class="empty-state">資料載入中...</div>';

      try {
        const queryParams = new URLSearchParams({ page, pageSize, search });
        const res = await fetch('/api/logs?' + queryParams.toString(), {
          headers: { "x-device-token": token }
        });

        if (res.status === 401) {
          showAuthView("授權過期或未授權，請重新驗證 Master Token。");
          return;
        }

        const data = await res.json();
        document.getElementById("stat-total").innerText = data.total || 0;
        document.getElementById("stat-gemini").innerText = data.stats?.geminiCount || 0;
        document.getElementById("stat-cf").innerText = data.stats?.cfCount || 0;

        if (!data.items || data.items.length === 0) {
          listEl.innerHTML = '<div class="empty-state">尚無符合的對話紀錄。</div>';
          document.getElementById("pagination-bar").style.display = "none";
          return;
        }

        let html = '';
        data.items.forEach(item => {
          let badgeClass = 'badge-gemini';
          if (item.provider?.includes('cloudflare')) badgeClass = 'badge-cf';
          else if (item.provider?.includes('fallback')) badgeClass = 'badge-fallback';

          const timeStr = formatUtcToTaipei(item.created_at);

          html += \`
            <div class="log-card">
              <div class="log-meta">
                <span>🕒 <strong>\${timeStr}</strong> (UTC+8)</span>
                <span>
                  <span class="badge \${badgeClass}">\${item.provider || '未知模型'}</span>
                  \${item.client_ip ? \`<span style="margin-left:8px;">IP: \${item.client_ip}</span>\` : ''}
                </span>
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
        document.getElementById("page-info").innerText = \`第 \${currentPage} / \${totalPages} 頁 (共 \${data.total} 筆)\`;
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
          html += \`
            <div class="device-item">
              <div>
                <div style="font-weight:600;font-size:14px;">
                  \${escapeHtml(d.device_name)} \${isCurrent ? '<span style="color:#059669;font-size:12px;">(目前這台設備)</span>' : ''}
                </div>
                <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">
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

    // 網頁載入時檢查設備綁定狀態
    checkDeviceAuth();
  </script>
</body>
</html>`;
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
        "SELECT id, device_id, device_name, client_ip, created_at, last_used_at FROM authorized_devices ORDER BY id DESC"
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
    // 路由 6：後台紀錄查詢 API（需已授權設備存取）
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
        const offset = (page - 1) * pageSize;

        let countSql = "SELECT COUNT(*) as total FROM chat_logs";
        let querySql = "SELECT * FROM chat_logs";
        const params = [];

        if (search) {
          countSql += " WHERE user_message LIKE ? OR ai_reply LIKE ?";
          querySql += " WHERE user_message LIKE ? OR ai_reply LIKE ?";
          params.push(`%${search}%`, `%${search}%`);
        }

        querySql += " ORDER BY id DESC LIMIT ? OFFSET ?";
        const queryParams = [...params, pageSize, offset];

        const [totalRes, itemsRes, statsRes] = await Promise.all([
          env.DB.prepare(countSql).bind(...params).first(),
          env.DB.prepare(querySql).bind(...queryParams).all(),
          env.DB.prepare(`
            SELECT 
              COUNT(CASE WHEN provider LIKE '%gemini%' THEN 1 END) as geminiCount,
              COUNT(CASE WHEN provider LIKE '%cloudflare%' THEN 1 END) as cfCount
            FROM chat_logs
          `).first()
        ]);

        return new Response(JSON.stringify({
          total: totalRes?.total || 0,
          page,
          pageSize,
          items: itemsRes?.results || [],
          stats: statsRes || { geminiCount: 0, cfCount: 0 }
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
      // 步驟 4：記錄對話紀錄至 Cloudflare D1，並在儲存時自動檢查並清理過期紀錄（保留30天/1個月）
      // 使用 ctx.waitUntil 非阻塞執行，完全不增加訪客等待 AI 回應的時間
      // ============================================================
      if (env.DB) {
        const clientIp = request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || "unknown";
        const userAgent = request.headers.get("user-agent") || "unknown";

        const saveAndCleanupTask = (async () => {
          try {
            // 1. 寫入新紀錄
            await env.DB.prepare(
              `INSERT INTO chat_logs (user_message, ai_reply, provider, client_ip, user_agent, created_at)
               VALUES (?, ?, ?, ?, ?, datetime('now'))`
            ).bind(message, replyText, usedProvider, clientIp, userAgent).run();

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
