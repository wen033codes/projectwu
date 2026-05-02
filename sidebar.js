document.addEventListener("DOMContentLoaded", function() {
    // Inject CSS for font-awesome if not already present
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const faLink = document.createElement('link');
        faLink.rel = 'stylesheet';
        faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(faLink);
    }

    // Sidebar HTML structure
    const sidebarHTML = `
        <div id="sidebar-overlay" class="sidebar-overlay"></div>
        <div id="sidebar" class="sidebar">
            <div class="sidebar-header">
                <h2>導覽選單</h2>
                <button id="close-sidebar" class="close-btn"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="sidebar-content">
                <ul class="sidebar-menu">
                    <li class="main-category-item"><a href="index.html" class="main-category-link"><i class="fa-solid fa-house"></i> 首頁</a></li>
                    <li class="main-category-item"><a href="smart-home.html" class="main-category-link"><i class="fa-solid fa-house-signal"></i> 智能家居改造</a></li>
                    
                    <li class="main-category-header"><i class="fa-solid fa-screwdriver-wrench"></i> DIY輔具</li>
                    <li class="menu-category indent-1">全功能滑鼠</li>
                    <li class="indent-2"><a href="flying-squirrel-mouse.html">小飛鼠藍牙穿戴式滑鼠</a></li>
                    <li class="indent-2"><a href="puff-suck-mouse.html">藍牙吹吸滑鼠</a></li>
                    <li class="indent-2"><a href="orange-cat-mouse.html">小橘喵聲控藍牙滑鼠</a></li>
                    <li class="indent-2"><a href="cloud-leopard-mouse.html">小雲豹的藍牙雙按鍵滑鼠</a></li>
                    
                    <li class="menu-category indent-1">滑鼠按鍵</li>
                    <li class="indent-2"><a href="tadpole-mouse-button-v2.html">小蝌蚪藍牙滑鼠按鍵</a></li>
                    <li class="indent-2"><a href="puff-suck-mouse-button.html">藍牙吹吸滑鼠按鍵</a></li>
                    
                    <li class="menu-category indent-1">iOS切換開關</li>
                    <li class="indent-2"><a href="tadpole-switch-v1.html">小蝌蚪藍牙切換開關</a></li>
                    <li class="indent-2"><a href="puff-suck-switch.html">藍牙吹吸按鍵</a></li>
                    
                    <li class="main-category-header" style="align-items: center;">
                        <i class="fa-solid fa-microphone"></i> 聲控 / 
                        <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 4px;">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                            <line x1="12" y1="5" x2="12" y2="2"></line>
                            <line x1="16" y1="6" x2="18" y2="3"></line>
                            <line x1="8" y1="6" x2="6" y2="3"></line>
                        </svg>
                        眼控輔具
                    </li>
                    <li class="indent-2"><a href="white-pigeon-bell.html">小白鴿聲控叫人鈴</a></li>
                    <li class="indent-2"><a href="parrot-emergency-box.html">小鸚鵡聲控緊急連絡盒</a></li>
                    <li class="indent-2"><a href="little-myna.html">小八哥</a></li>
                    <li class="indent-2"><a href="husky.html">哈士奇</a></li>
                    
                    <li class="main-category-item"><a href="qa.html" class="main-category-link"><i class="fa-solid fa-circle-question"></i> Q&A</a></li>
                </ul>
            </div>
        </div>
        <button id="open-sidebar" class="open-sidebar-btn"><i class="fa-solid fa-bars"></i></button>
    `;

    // Append sidebar to body
    document.body.insertAdjacentHTML('beforeend', sidebarHTML);

    // Add event listeners
    const openBtn = document.getElementById('open-sidebar');
    const closeBtn = document.getElementById('close-sidebar');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    openBtn.addEventListener('click', function() {
        sidebar.classList.add('active');
        overlay.classList.add('active');
    });

    closeBtn.addEventListener('click', function() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });

    overlay.addEventListener('click', function() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });
});
