// 自動訪客瀏覽統計上報 (pjwu-ai-chat 第一方追蹤，支援 Beacon / Fetch / 影像 Ping)
(function initAnalytics() {
    try {
        let visitorId = '';
        try {
            const TRACK_STORAGE_KEY = 'pjwu_visitor_uuid';
            visitorId = localStorage.getItem(TRACK_STORAGE_KEY);
            if (!visitorId) {
                visitorId = 'v_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
                localStorage.setItem(TRACK_STORAGE_KEY, visitorId);
            }
        } catch (_) {
            visitorId = 'v_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
        }

        let pagePath = window.location.pathname || '/';
        if (window.location.protocol === 'file:') {
            if (pagePath.includes('bopomofo-aac')) {
                pagePath = '/projectwu/bopomofo-aac/index.html';
            } else {
                const parts = pagePath.split(/[\\/]/);
                pagePath = '/projectwu/' + (parts.pop() || 'index.html');
            }
        } else if (pagePath === '/' || pagePath === '/projectwu' || pagePath === '/projectwu/') {
            pagePath = '/projectwu/index.html';
        } else if (pagePath.endsWith('/bopomofo-aac') || pagePath.endsWith('/bopomofo-aac/')) {
            pagePath = '/projectwu/bopomofo-aac/index.html';
        }

        let pageTitle = document.title || '';
        const splitIdx = Math.max(pageTitle.lastIndexOf(' - '), pageTitle.lastIndexOf(' — '));
        if (splitIdx !== -1) {
            pageTitle = pageTitle.substring(0, splitIdx).trim();
        }
        const pageRef = document.referrer || '';
        const pageData = JSON.stringify({
            path: pagePath,
            title: pageTitle,
            referrer: pageRef,
            visitorId: visitorId
        });

        const trackUrl = 'https://pjwu-ai-chat.aicoding.workers.dev/api/track';

        let sent = false;
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            try {
                const blob = new Blob([pageData], { type: 'text/plain' });
                sent = navigator.sendBeacon(trackUrl, blob);
            } catch (_) {}
        }

        if (!sent) {
            if (typeof fetch === 'function') {
                fetch(trackUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: pageData,
                    mode: 'cors',
                    keepalive: true
                }).catch(function() {
                    sendPingFallback();
                });
            } else {
                sendPingFallback();
            }
        }

        function sendPingFallback() {
            try {
                const q = '?path=' + encodeURIComponent(pagePath) +
                          '&title=' + encodeURIComponent(pageTitle) +
                          '&referrer=' + encodeURIComponent(pageRef) +
                          '&visitorId=' + encodeURIComponent(visitorId);
                const img = new Image();
                img.src = trackUrl + q;
            } catch (_) {}
        }
    } catch (_) {}
})();
