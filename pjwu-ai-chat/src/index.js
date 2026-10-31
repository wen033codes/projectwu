import knowledge from './knowledge.json';

export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      // 1. 檢查是否已設定 GEMINI_API_KEY Secret
      if (!env.GEMINI_API_KEY) {
        return new Response(JSON.stringify({ 
          error: "尚未在 Cloudflare Worker 設定 GEMINI_API_KEY Secret，請執行 npx wrangler secret put GEMINI_API_KEY。" 
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const { message, history = [] } = await request.json();
      if (!message) {
        return new Response(JSON.stringify({ error: "訊息不能為空" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // 2. 系統提示詞（System Instruction）
      const systemInstruction = `你是一位專業、富有同理心且熱心助人的「DIY無障礙輔具與智能家居」線上AI客服小助手。
請基於以下【網站知識庫】與【網站頁面地圖】親切回答使用者的詢問。

【超核心要求（必須嚴格遵守）】：
1. 【頁面連結導引】：回答中只要提及任何自製輔具、手冊、Q&A 或改造說明，請務必提供可點選的 Markdown 格式超連結（格式範例：[👉 小白鴿聲控叫人鈴完整介紹](white-pigeon-bell.html) 或 [👉 小白鴿使用手冊](dove-manual.html)）。
2. 【嚴格禁止裸露英文檔名】：絕對不要在回覆對話中直接顯示網頁英文檔名（嚴禁出現如「詳情請見 white-pigeon-bell.html」這種生硬文字）！超連結文字一律使用親切明瞭的繁體中文名稱！
3. 【同理心與專業建議】：針對使用者的身體障礙狀況，主動推薦最合適的輔具（手不能動推薦吹吸系列；僅能動眼球推薦哈士奇眼控；口語尚可推薦小白鴿或小橘喵）。
4. 【繁體中文】：請一律使用繁體中文（台灣）回答，語氣溫和、有耐心、充滿關懷。

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

      // 3. 轉換對話歷史為 Gemini 格式
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

      // 4. 調用 Google Gemini API (指定 Gemini 3.5 Flash Lite，並設定相容性備援)
      const models = [
        "gemini-3.5-flash-lite",
        "gemini-2.5-flash-lite",
        "gemini-2.0-flash-lite",
        "gemini-1.5-flash"
      ];

      let geminiData = null;
      let lastErrorMessage = "";

      for (const model of models) {
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
          if (data.candidates && data.candidates.length > 0) {
            geminiData = data;
            break;
          } else if (data.error) {
            lastErrorMessage = data.error.message || JSON.stringify(data.error);
            console.warn(`Model ${model} failed:`, lastErrorMessage);
          }
        } catch (e) {
          lastErrorMessage = e.message;
        }
      }

      // 若未取得有效回覆（包含配額額度用盡或頻率限制）
      if (!geminiData) {
        const isQuotaExceeded = lastErrorMessage.includes("quota") || 
                                lastErrorMessage.includes("Resource has been exhausted") || 
                                lastErrorMessage.includes("429") ||
                                lastErrorMessage.includes("RESOURCE_EXHAUSTED") ||
                                lastErrorMessage.includes("Rate limit");

        const friendlyMessage = isQuotaExceeded
          ? "💡 目前線上諮詢人數較多或今日免費額度已達上限，請稍候片刻再試，或歡迎直接點選選單瀏覽各項輔具詳細說明喔！"
          : "💡 目前線上諮詢服務連線稍忙碌，請稍候片刻再試，或歡迎直接瀏覽相關網頁完整說明喔！";

        return new Response(JSON.stringify({ reply: friendlyMessage }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const replyText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "抱歉，目前暫時無法取得回覆。";

      return new Response(JSON.stringify({ reply: replyText }), {
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
