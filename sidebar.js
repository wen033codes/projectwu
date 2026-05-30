document.addEventListener("DOMContentLoaded", function() {
    // Inject Favicon if not already present
    if (!document.querySelector('link[rel*="icon"]')) {
        const faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        faviconLink.type = 'image/png';
        faviconLink.href = 'favicon.png';
        document.head.appendChild(faviconLink);
    }

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
                    
                    <li class="main-category-item has-submenu" data-panel="diy-panel">
                        <a href="javascript:void(0)" class="main-category-link submenu-toggle" style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="display:flex; align-items:center;"><i class="fa-solid fa-screwdriver-wrench"></i> DIY輔具</span>
                            <i class="fa-solid fa-chevron-right arrow-icon"></i>
                        </a>
                    </li>
                    
                    <li class="main-category-item has-submenu" data-panel="voice-panel">
                        <a href="javascript:void(0)" class="main-category-link submenu-toggle" style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="display:flex; align-items:center;">
                                <i class="fa-solid fa-microphone"></i> 聲控 / 
                                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 4px;">
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                    <line x1="12" y1="5" x2="12" y2="2"></line>
                                    <line x1="16" y1="6" x2="18" y2="3"></line>
                                    <line x1="8" y1="6" x2="6" y2="3"></line>
                                </svg>
                                眼控輔具
                            </span>
                            <i class="fa-solid fa-chevron-right arrow-icon"></i>
                        </a>
                    </li>
                    
                    <li class="main-category-item"><a href="qa.html" class="main-category-link"><i class="fa-solid fa-circle-question"></i> Q&A</a></li>
                </ul>
            </div>

            <!-- DIY Panel -->
            <div id="diy-panel" class="submenu-panel">
                <div class="submenu-header">
                    <button class="back-btn"><i class="fa-solid fa-chevron-left"></i> 返回</button>
                    <h3><i class="fa-solid fa-screwdriver-wrench"></i> DIY輔具</h3>
                </div>
                <div class="submenu-content">
                    <ul class="sidebar-menu">
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
                    </ul>
                </div>
            </div>

            <!-- Voice Panel -->
            <div id="voice-panel" class="submenu-panel">
                <div class="submenu-header">
                    <button class="back-btn"><i class="fa-solid fa-chevron-left"></i> 返回</button>
                    <h3 style="display:flex; align-items:center;">
                        <i class="fa-solid fa-microphone"></i> 聲控/
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 4px;">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                            <line x1="12" y1="5" x2="12" y2="2"></line>
                            <line x1="16" y1="6" x2="18" y2="3"></line>
                            <line x1="8" y1="6" x2="6" y2="3"></line>
                        </svg>
                        眼控輔具
                    </h3>
                </div>
                <div class="submenu-content">
                    <ul class="sidebar-menu">
                        <li class="indent-2"><a href="white-pigeon-bell.html">小白鴿聲控叫人鈴</a></li>
                        <li class="indent-2"><a href="parrot-emergency-box.html">小鸚鵡聲控緊急連絡盒</a></li>
                        <li class="indent-2"><a href="little-myna.html">小八哥語音轉譯</a></li>
                        <li class="indent-2"><a href="husky.html">哈士奇眼控叫人鈴</a></li>
                    </ul>
                </div>
            </div>
        </div>
    `;

    // Append sidebar to body
    document.body.insertAdjacentHTML('beforeend', sidebarHTML);

    // Append open button to top-bar
    const openBtnHTML = `<button id="open-sidebar" class="open-sidebar-btn"><i class="fa-solid fa-bars"></i></button>`;
    const topBar = document.querySelector('.top-bar');
    if (topBar) {
        topBar.insertAdjacentHTML('afterbegin', openBtnHTML);
    } else {
        document.body.insertAdjacentHTML('beforeend', openBtnHTML);
    }

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
        
        // Reset submenus
        document.querySelectorAll('.submenu-panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.has-submenu').forEach(li => li.classList.remove('active'));
    });

    // Submenu logic
    const submenuToggles = document.querySelectorAll('.submenu-toggle');
    const backBtns = document.querySelectorAll('.back-btn');

    submenuToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const parentLi = this.closest('.has-submenu');
            const panelId = parentLi.getAttribute('data-panel');
            const panel = document.getElementById(panelId);
            
            // Toggle active state
            if (panel.classList.contains('active')) {
                panel.classList.remove('active');
                parentLi.classList.remove('active');
            } else {
                // Close other panels first
                document.querySelectorAll('.submenu-panel').forEach(p => p.classList.remove('active'));
                document.querySelectorAll('.has-submenu').forEach(li => li.classList.remove('active'));
                
                panel.classList.add('active');
                parentLi.classList.add('active');
            }
        });
    });

    backBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const panel = this.closest('.submenu-panel');
            if (panel) {
                panel.classList.remove('active');
                
                // Remove active class from corresponding li
                const panelId = panel.id;
                const li = document.querySelector(`.has-submenu[data-panel="${panelId}"]`);
                if (li) {
                    li.classList.remove('active');
                }
            }
        });
    });
});
