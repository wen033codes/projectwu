// chatbot.js - 輔具與智能家居 AI 客服浮動視窗
(function() {
  const WORKER_API_URL = "https://pjwu-ai-chat.aicoding.workers.dev"; 
  let chatHistory = [];

  // ==========================================
  // 【圖示樣式選擇】：
  // 'HEADSET' (目前預設)  ：選項 4「極簡科技耳麥」圖示
  // 'AI_BUBBLE' (保留備用)：細緻線條版「AI 雙對話氣泡」圖示
  // ==========================================
  const CURRENT_ICON = 'HEADSET';

  const ICONS = {
    // 選項 4：極簡科技耳麥 (純粹、大器、現代支援中心代表)
    'HEADSET': `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 11h3a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a9 9 0 0 1 18 0v6a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h3"/>
        <path d="M19 17v2a3 3 0 0 1-3 3h-4"/>
        <circle cx="11.5" cy="22" r="1.3" fill="currentColor"/>
      </svg>`,
    // 細線升級版：AI 雙對話氣泡 (線條優化為 1.5，更顯精緻清晰)
    'AI_BUBBLE': `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <!-- 後方對話泡泡 (右下) -->
        <path d="M14 8.5h3.5a2.5 2.5 0 0 1 2.5 2.5v3.5a2.5 2.5 0 0 1-2.5 2.5h-.5l-2 2v-2H11" />
        <!-- 前方主要對話泡泡 (左上) -->
        <path d="M3.5 4h10a2.5 2.5 0 0 1 2.5 2.5v6a2.5 2.5 0 0 1-2.5 2.5H6.5l-3 3V6.5A2.5 2.5 0 0 1 3.5 4z" />
        <!-- 細緻文字 AI -->
        <path d="M6.5 12.5L8.5 7.5L10.5 12.5" stroke-width="1.4" />
        <path d="M7.2 11h2.6" stroke-width="1.4" />
        <path d="M12.8 7.5v5" stroke-width="1.4" />
      </svg>`
  };

  const selectedSvg = ICONS[CURRENT_ICON] || ICONS['HEADSET'];

  // 注入樣式 (採用優雅柔和的淺紫色 / 薰衣草紫羅蘭系)
  const style = document.createElement("style");
  style.innerHTML = `
    .pjwu-chat-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #a855f7, #7c3aed);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 18px rgba(124, 58, 237, 0.4);
      z-index: 99999;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
    }
    .pjwu-chat-btn:hover {
      transform: scale(1.1) translateY(-2px);
      box-shadow: 0 8px 26px rgba(124, 58, 237, 0.5);
      background: linear-gradient(135deg, #9333ea, #6d28d9);
    }
    .pjwu-chat-modal {
      display: none;
      position: fixed;
      bottom: 95px;
      right: 24px;
      width: 370px;
      max-width: calc(100vw - 32px);
      height: 520px;
      max-height: calc(100vh - 120px);
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 10px 32px rgba(109, 40, 217, 0.15);
      flex-direction: column;
      overflow: hidden;
      z-index: 99999;
      border: 1px solid #e9d5ff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans TC", sans-serif;
    }
    .pjwu-chat-header {
      background: linear-gradient(135deg, #a855f7, #7c3aed);
      color: white;
      padding: 14px 16px;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 8px rgba(124, 58, 237, 0.2);
    }
    .pjwu-chat-messages {
      flex: 1;
      padding: 14px;
      overflow-y: auto;
      font-size: 14px;
      line-height: 1.6;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #faf5ff;
    }
    .pjwu-msg {
      max-width: 86%;
      padding: 10px 14px;
      border-radius: 12px;
      word-break: break-word;
    }
    .pjwu-msg-bot {
      background: #ffffff;
      color: #1e293b;
      align-self: flex-start;
      border: 1px solid #f3e8ff;
      border-bottom-left-radius: 3px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .pjwu-msg-user {
      background: linear-gradient(135deg, #a855f7, #7c3aed);
      color: #ffffff;
      align-self: flex-end;
      border-bottom-right-radius: 3px;
      box-shadow: 0 2px 6px rgba(124, 58, 237, 0.25);
    }
    .pjwu-chat-link {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      color: #7c3aed;
      font-weight: 600;
      text-decoration: underline;
      text-underline-offset: 3px;
      margin: 2px 0;
      padding: 1px 4px;
      border-radius: 4px;
      background: #f5f3ff;
      border: 1px solid #ddd6fe;
      transition: all 0.15s ease;
    }
    .pjwu-chat-link:hover {
      color: #ffffff;
      background: #7c3aed;
      text-decoration: none;
    }
    .pjwu-chat-footer {
      padding: 10px 12px;
      border-top: 1px solid #f3e8ff;
      background: white;
      display: flex;
      gap: 8px;
    }
    .pjwu-chat-input {
      flex: 1;
      padding: 9px 12px;
      border: 1.5px solid #e9d5ff;
      border-radius: 8px;
      outline: none;
      font-size: 14px;
      transition: border-color 0.2s;
    }
    .pjwu-chat-input:focus {
      border-color: #a855f7;
    }
    .pjwu-chat-send {
      background: linear-gradient(135deg, #a855f7, #7c3aed);
      color: white;
      border: none;
      padding: 0 16px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      font-size: 14px;
      transition: background 0.2s;
    }
    .pjwu-chat-send:hover {
      background: #6d28d9;
    }
    .pjwu-chat-send:disabled {
      background: #d8b4fe;
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(style);

  // 建立對話框 DOM
  const root = document.createElement("div");
  root.id = "pjwu-ai-chat-root";
  root.innerHTML = `
    <div id="pjwu-chat-btn" class="pjwu-chat-btn" title="開啟 AI 客服小幫手">${selectedSvg}</div>
    <div id="pjwu-chat-modal" class="pjwu-chat-modal">
      <div class="pjwu-chat-header">
        <span style="display:flex;align-items:center;gap:8px;">
          ${selectedSvg.replace(/width="[0-9]+"/, 'width="22"').replace(/height="[0-9]+"/, 'height="22"')}
          輔具與智能家居 AI 客服
        </span>
        <span id="pjwu-chat-close" style="cursor:pointer;font-size:20px;">✕</span>
      </div>
      <div id="pjwu-chat-messages" class="pjwu-chat-messages">
        <div class="pjwu-msg pjwu-msg-bot">
          您好！我是您的線上客服專員 👋<br>
          您可以詢問任何關於<strong>小白鴿、吹吸滑鼠、小橘喵、哈士奇眼控、開關改造或材料規格</strong>的問題，隨時為您解答！
        </div>
      </div>
      <div class="pjwu-chat-footer">
        <input id="pjwu-chat-input" class="pjwu-chat-input" type="text" placeholder="請輸入您的問題..." />
        <button id="pjwu-chat-send" class="pjwu-chat-send">送出</button>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  const btn = document.getElementById("pjwu-chat-btn");
  const modal = document.getElementById("pjwu-chat-modal");
  const closeBtn = document.getElementById("pjwu-chat-close");
  const input = document.getElementById("pjwu-chat-input");
  const sendBtn = document.getElementById("pjwu-chat-send");
  const messagesBox = document.getElementById("pjwu-chat-messages");

  btn.onclick = () => {
    const isShow = modal.style.display === "flex";
    modal.style.display = isShow ? "none" : "flex";
    if (!isShow) input.focus();
  };
  closeBtn.onclick = () => modal.style.display = "none";

  async function handleSend() {
    const text = input.value.trim();
    if (!text || sendBtn.disabled) return;

    messagesBox.innerHTML += `<div class="pjwu-msg pjwu-msg-user">${text.replace(/</g, "&lt;")}</div>`;
    input.value = "";
    sendBtn.disabled = true;
    messagesBox.scrollTop = messagesBox.scrollHeight;

    const loadingId = "loading-" + Date.now();
    messagesBox.innerHTML += `<div id="${loadingId}" class="pjwu-msg pjwu-msg-bot" style="color:#64748b;font-style:italic;">客服專員思考中...</div>`;
    messagesBox.scrollTop = messagesBox.scrollHeight;

    try {
      const res = await fetch(WORKER_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: chatHistory })
      });
      const data = await res.json();
      document.getElementById(loadingId).remove();

      if (data.error) {
        const isQuota = data.error.includes("quota") || 
                        data.error.includes("Resource has been exhausted") || 
                        data.error.includes("429") ||
                        data.error.includes("RESOURCE_EXHAUSTED");
        const friendlyNotice = isQuota
          ? "💡 目前線上諮詢人數較多或今日免費額度已達上限，請稍候片刻再試，或歡迎直接點選選單瀏覽各項輔具詳細說明喔！"
          : `💡 服務提示：${data.error}`;
        messagesBox.innerHTML += `<div class="pjwu-msg pjwu-msg-bot">${friendlyNotice}</div>`;
        return;
      }

      const reply = data.reply || "抱歉，目前暫時無法取得回覆。";
      // 支援 Markdown 粗體、斜體與超連結 [中文標題](網址)
      const formattedReply = reply
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="pjwu-chat-link" target="_self">$1</a>')
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/\n/g, "<br>");
      messagesBox.innerHTML += `<div class="pjwu-msg pjwu-msg-bot">${formattedReply}</div>`;

      chatHistory.push({ role: "user", content: text });
      chatHistory.push({ role: "assistant", content: reply });
    } catch (e) {
      const loader = document.getElementById(loadingId);
      if (loader) loader.innerText = "連線失敗，請確認 Worker 網址或網路狀態。";
    } finally {
      sendBtn.disabled = false;
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }
  }

  sendBtn.onclick = handleSend;
  input.onkeydown = (e) => { if (e.key === "Enter") handleSend(); };
})();
