/* ==================== 主应用逻辑 ==================== */

// 当前状态
let currentSection = 'home';
let currentMemberId = 0;       // 对应 MEMBERS 数组的 id

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
    initStars();

    // 检查是否已有本地登录状态
    const savedMemberId = localStorage.getItem('house_current_member');
    if (savedMemberId) {
        currentMemberId = parseInt(savedMemberId);
        const member = MEMBERS.find(m => m.id === currentMemberId);
        if (member) {
            await onUserLoggedIn();
            return;
        }
    }

    // 显示登录页面
    showAuthPage();
});

// ==================== 认证页面 ====================
function showAuthPage() {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

    document.querySelector('.main-content').innerHTML = `
        <div class="auth-container" id="authContainer">
            <div class="auth-card" id="authCard">
                <div class="auth-logo">🏠</div>
                <h2 class="auth-title">欢迎回家</h2>
                <p class="auth-subtitle">米奇giaogiao屋 · 我们的专属小窝</p>

                <!-- 登录表单 -->
                <form id="loginForm" class="auth-form" onsubmit="handleLogin(event)">
                    <div class="form-group">
                        <label>👤 选择你的身份</label>
                        <select id="loginMember" required>
                            <option value="">-- 我是谁？ --</option>
                            ${MEMBERS.map(m => `<option value="${m.id}">${m.name}（${m.role}）</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>🔒 密码</label>
                        <input type="password" id="loginPassword" placeholder="输入8位数字密码" required maxlength="8" pattern="[0-9]{8}" inputmode="numeric" autocomplete="off">
                        <p class="form-hint">💡 密码就是你的账号，格式：2026 + 生日（月日各两位）<br>例如：1月7日生日 → 密码为 20260107</p>
                    </div>
                    <button type="submit" class="btn-primary btn-full" id="loginBtn">
                        <span id="loginBtnText">🏠 进入小屋</span>
                        <span class="loading-spinner-inline" id="loginSpinner" style="display:none"></span>
                    </button>
                </form>
            </div>
        </div>
    `;
}

async function handleLogin(e) {
    e.preventDefault();
    const memberId = parseInt(document.getElementById('loginMember').value);
    const password = document.getElementById('loginPassword').value.trim();

    if (!memberId) {
        showToast('请选择你的身份～');
        return;
    }

    if (!password || password.length !== 8) {
        showToast('请输入8位数字密码～');
        return;
    }

    // 本地验证
    if (!verifyLogin(memberId, password)) {
        const member = MEMBERS.find(m => m.id === memberId);
        if (member) {
            showToast('密码错误！提示：密码 = 2026 + 你的生日（月日各两位）');
        } else {
            showToast('成员不存在！');
        }
        return;
    }

    setAuthLoading(true, 'login');

    // 模拟一个小延迟让用户感受到验证过程
    await new Promise(r => setTimeout(r, 400));

    currentMemberId = memberId;
    localStorage.setItem('house_current_member', currentMemberId);

    setAuthLoading(false, 'login');
    await onUserLoggedIn();
}

function setAuthLoading(loading, form) {
    const btnText = document.getElementById(form === 'login' ? 'loginBtnText' : 'regBtnText');
    const spinner = document.getElementById(form === 'login' ? 'loginSpinner' : 'regSpinner');
    const btn = document.getElementById(form === 'login' ? 'loginBtn' : 'regBtn');

    if (btnText && spinner && btn) {
        if (loading) {
            btnText.style.display = 'none';
            spinner.style.display = 'inline-block';
            btn.disabled = true;
        } else {
            btnText.style.display = 'inline';
            spinner.style.display = 'none';
            btn.disabled = false;
        }
    }
}

async function onUserLoggedIn() {
    // 确保成员有效
    const member = MEMBERS.find(m => m.id === currentMemberId);
    if (!member) {
        localStorage.removeItem('house_current_member');
        currentMemberId = 0;
        showAuthPage();
        return;
    }

    // 重建主内容区和弹窗
    rebuildMainContent();
    rebuildModals();

    // 隐藏 auth 页面
    const authContainer = document.getElementById('authContainer');
    if (authContainer) authContainer.remove();

    // 初始化本地种子数据（仅在本地模式下首次使用）
    dataStore.initLocalSeedData();

    // 初始化导航
    initNavigation();
    updateUserMenu();

    // 首页
    loadHomePage();
}

function rebuildMainContent() {
    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML = `
        <!-- ==================== 首页 ==================== -->
        <section id="home" class="section active">
            <div class="hero">
                <div class="hero-content">
                    <h1 class="hero-title">米奇giaogiao屋</h1>
                    <p class="hero-subtitle">我们的专属小窝</p>
                    <p class="hero-desc">十二人岁岁年年，碎碎念念皆珍藏</p>
                    <div class="hero-hearts">
                        <span>❤️</span><span>🧡</span><span>💛</span><span>💚</span><span>💙</span><span>💜</span>
                    </div>
                </div>
            </div>

            <div class="section-container"><div class="section-header"><h2>✨ 最新动态</h2><a href="#feed" class="see-all" onclick="showSection('feed')">查看全部 →</a></div><div class="latest-feed" id="latestFeed"></div></div>
            <div class="section-container"><div class="section-header"><h2>📸 最新照片</h2><a href="#album" class="see-all" onclick="showSection('album')">查看全部 →</a></div><div class="latest-photos" id="latestPhotos"></div></div>
            <div class="section-container"><div class="section-header"><h2>🏠 小屋家人</h2><a href="#members" class="see-all" onclick="showSection('members')">查看档案 →</a></div><div class="members-preview" id="membersPreview"></div></div>
            <div class="section-container"><div class="section-header"><h2>💭 今日碎碎念</h2><a href="#board" class="see-all" onclick="showSection('board')">写留言 →</a></div><div class="board-preview" id="boardPreview"></div></div>
        </section>

        <!-- ==================== 日常圈 ==================== -->
        <section id="feed" class="section">
            <div class="section-container">
                <div class="section-header"><h2>💬 群友日常圈</h2><button class="btn-primary" onclick="openPostModal()">✏️ 发动态</button></div>
                <div class="feed-filters">
                    <button class="filter-btn active" onclick="filterFeed('all', this)">全部</button>
                    <button class="filter-btn" onclick="filterFeed('text', this)">纯文字</button>
                    <button class="filter-btn" onclick="filterFeed('image', this)">有图</button>
                </div>
                <div class="feed-list" id="feedList"></div>
                <div class="load-more" id="loadMoreFeed"><button class="btn-secondary" onclick="loadMoreFeed()">加载更多</button></div>
            </div>
        </section>

        <!-- ==================== 群相册 ==================== -->
        <section id="album" class="section">
            <div class="section-container">
                <div class="section-header"><h2>📸 专属群相册</h2><button class="btn-primary" onclick="openAlbumModal()">📤 上传照片</button></div>
                <div class="album-tabs">
                    <button class="tab-btn active" onclick="switchAlbumTab('daily', this)">🌿 日常碎片</button>
                    <button class="tab-btn" onclick="switchAlbumTab('party', this)">🎉 聚会合照</button>
                    <button class="tab-btn" onclick="switchAlbumTab('funny', this)">🤡 搞怪瞬间</button>
                    <button class="tab-btn" onclick="switchAlbumTab('archive', this)">📁 专属存档</button>
                </div>
                <div class="album-grid" id="albumGrid"></div>
                <div class="load-more" id="loadMoreAlbum"><button class="btn-secondary" onclick="loadMoreAlbum()">加载更多</button></div>
            </div>
        </section>

        <!-- ==================== 成员档案 ==================== -->
        <section id="members" class="section">
            <div class="section-container">
                <div class="section-header"><h2>👥 小屋成员档案</h2><p class="section-desc">十二位家人的专属花名册</p></div>
                <div class="members-grid" id="membersGrid"></div>
            </div>
        </section>

        <!-- ==================== 时光轴 ==================== -->
        <section id="timeline" class="section">
            <div class="section-container">
                <div class="section-header"><h2>⏳ 回忆时光轴</h2></div>
                <div class="timeline-filters">
                    <select id="timelineYear" onchange="filterTimeline()"><option value="all">全部年份</option></select>
                    <select id="timelineMonth" onchange="filterTimeline()"><option value="all">全部月份</option></select>
                </div>
                <div class="timeline-list" id="timelineList"></div>
            </div>
        </section>

        <!-- ==================== 碎碎念留言板 ==================== -->
        <section id="board" class="section">
            <div class="section-container">
                <div class="section-header"><h2>📝 小屋碎碎念</h2><button class="btn-primary" onclick="openBoardModal()">✏️ 写留言</button></div>
                <div class="board-list" id="boardList"></div>
            </div>
        </section>

        <!-- ==================== 关于我们 ==================== -->
        <section id="about" class="section">
            <div class="section-container">
                <div class="about-page">
                    <div class="about-header"><h1>💖 关于米奇giaogiao屋</h1></div>
                    <div class="about-content">
                        <div class="about-quote"><p>米奇giaogiao屋，一个十二人小团体，无关热闹，只关偏爱，记录岁岁年年的陪伴，珍藏所有不被辜负的日常。</p></div>
                        <div class="about-info">
                            <div class="info-card"><span class="info-icon">🏠</span><h3>小屋名称</h3><p>米奇giaogiao屋</p></div>
                            <div class="info-card"><span class="info-icon">👥</span><h3>成员人数</h3><p>12位家人</p></div>
                            <div class="info-card"><span class="info-icon">📅</span><h3>建群时间</h3><p id="groupDate">2024-01-01</p></div>
                            <div class="info-card"><span class="info-icon">🎯</span><h3>我们的口号</h3><p id="groupSlogan">无关热闹，只关偏爱</p></div>
                        </div>
                        <div class="about-memories"><h2>📸 小屋纪念册</h2><div class="memories-grid" id="aboutMemories"></div></div>
                    </div>
                </div>
            </div>
        </section>
    `;

    // 重建弹窗
    rebuildModals();
}

function rebuildModals() {
    // 移除旧弹窗
    document.querySelectorAll('.modal').forEach(m => m.remove());

    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = `
        <!-- 发动态弹窗 -->
        <div class="modal" id="postModal">
            <div class="modal-overlay" onclick="closeModal('postModal')"></div>
            <div class="modal-content">
                <div class="modal-header"><h3>✏️ 分享日常</h3><button class="modal-close" onclick="closeModal('postModal')">✕</button></div>
                <div class="modal-body">
                    <textarea id="postContent" placeholder="分享今天的日常、碎碎念、心情..." rows="5"></textarea>
                    <div class="post-images-upload">
                        <label class="upload-btn">📷 添加图片<input type="file" id="postImages" multiple accept="image/*" onchange="previewPostImages(this)"></label>
                        <div class="image-preview" id="postImagePreview"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeModal('postModal')">取消</button>
                    <button class="btn-primary" onclick="submitPost()">发布</button>
                </div>
            </div>
        </div>

        <!-- 上传照片弹窗 -->
        <div class="modal" id="albumModal">
            <div class="modal-overlay" onclick="closeModal('albumModal')"></div>
            <div class="modal-content">
                <div class="modal-header"><h3>📤 上传照片</h3><button class="modal-close" onclick="closeModal('albumModal')">✕</button></div>
                <div class="modal-body">
                    <div class="album-category-select">
                        <label>相册分类：</label>
                        <select id="albumCategory">
                            <option value="daily">🌿 日常碎片</option>
                            <option value="party">🎉 聚会合照</option>
                            <option value="funny">🤡 搞怪瞬间</option>
                            <option value="archive">📁 专属存档</option>
                        </select>
                    </div>
                    <textarea id="albumDesc" placeholder="照片描述（可选）" rows="2"></textarea>
                    <div class="post-images-upload">
                        <label class="upload-btn">📷 选择照片<input type="file" id="albumImages" multiple accept="image/*" onchange="previewAlbumImages(this)"></label>
                        <div class="image-preview" id="albumImagePreview"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeModal('albumModal')">取消</button>
                    <button class="btn-primary" onclick="submitAlbum()">上传</button>
                </div>
            </div>
        </div>

        <!-- 写留言弹窗 -->
        <div class="modal" id="boardModal">
            <div class="modal-overlay" onclick="closeModal('boardModal')"></div>
            <div class="modal-content">
                <div class="modal-header"><h3>✏️ 写碎碎念</h3><button class="modal-close" onclick="closeModal('boardModal')">✕</button></div>
                <div class="modal-body">
                    <textarea id="boardContent" placeholder="写下你的碎碎念、祝福、小情绪..." rows="5"></textarea>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeModal('boardModal')">取消</button>
                    <button class="btn-primary" onclick="submitBoard()">发布</button>
                </div>
            </div>
        </div>

        <!-- 成员详情弹窗 -->
        <div class="modal" id="memberModal">
            <div class="modal-overlay" onclick="closeModal('memberModal')"></div>
            <div class="modal-content modal-large">
                <div class="modal-header"><h3 id="memberModalTitle">成员档案</h3><button class="modal-close" onclick="closeModal('memberModal')">✕</button></div>
                <div class="modal-body" id="memberModalBody"></div>
            </div>
        </div>

        <!-- 图片查看器 -->
        <div class="modal modal-image-viewer" id="imageViewer">
            <div class="modal-overlay" onclick="closeModal('imageViewer')"></div>
            <div class="image-viewer-content">
                <button class="modal-close" onclick="closeModal('imageViewer')">✕</button>
                <button class="image-nav prev" onclick="prevImage()">❮</button>
                <img id="viewerImage" src="" alt="查看图片">
                <button class="image-nav next" onclick="nextImage()">❯</button>
                <div class="image-viewer-info" id="viewerInfo"></div>
            </div>
        </div>

        <!-- 评论弹窗 -->
        <div class="modal" id="commentModal">
            <div class="modal-overlay" onclick="closeModal('commentModal')"></div>
            <div class="modal-content">
                <div class="modal-header"><h3>💬 评论</h3><button class="modal-close" onclick="closeModal('commentModal')">✕</button></div>
                <div class="modal-body">
                    <div class="comments-list" id="commentsList"></div>
                    <div class="comment-input" style="display:flex; gap:8px; margin-top:12px;">
                        <input type="text" id="commentContent" placeholder="写评论..." style="flex:1;">
                        <button class="btn-primary" onclick="submitComment()">发送</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 将弹窗添加到 body
    while (modalContainer.children.length > 0) {
        document.body.appendChild(modalContainer.children[0]);
    }
}

function updateUserMenu() {
    const navContainer = document.querySelector('.nav-container');
    // 移除旧的用户菜单
    const oldMenu = document.querySelector('.nav-user-menu');
    if (oldMenu) oldMenu.remove();

    const member = getMember(currentMemberId);
    const userMenu = document.createElement('div');
    userMenu.className = 'nav-user-menu';
    userMenu.innerHTML = `
        ${getMemberAvatarHTML(member)}
        <span class="nav-user-name">${member.name}</span>
        <button class="btn-logout" onclick="handleLogout()" title="退出登录">🚪</button>
    `;
    navContainer.appendChild(userMenu);
}

async function handleLogout() {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('house_current_member');
        currentMemberId = 0;
        location.reload();
    }
}

// ==================== 星星背景 ====================
function initStars() {
    const starsBg = document.getElementById('starsBg');
    if (!starsBg) return;
    const starCount = 50;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.width = `${Math.random() * 3 + 1}px`;
        star.style.height = star.style.width;
        star.style.setProperty('--duration', `${Math.random() * 3 + 2}s`);
        star.style.setProperty('--opacity', Math.random() * 0.5 + 0.1);
        star.style.animationDelay = `${Math.random() * 5}s`;
        starsBg.appendChild(star);
    }
}

// ==================== 导航功能 ====================
function initNavigation() {
    const hash = window.location.hash.replace('#', '') || 'home';
    showSection(hash);

    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '') || 'home';
        showSection(hash);
    });
}

function showSection(sectionId) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === sectionId) link.classList.add('active');
    });

    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    const targetSection = document.getElementById(sectionId);
    if (targetSection) targetSection.classList.add('active');

    window.location.hash = sectionId;
    currentSection = sectionId;
    loadSectionData(sectionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 关闭移动端导航
    const navMenu = document.getElementById('navMenu');
    if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
    }
}

async function loadSectionData(section) {
    switch (section) {
        case 'home': await loadHomePage(); break;
        case 'feed': await loadFeed(); break;
        case 'album': await loadAlbum(); break;
        case 'members': await loadMembers(); break;
        case 'timeline': await loadTimeline(); break;
        case 'board': await loadBoard(); break;
        case 'about': await loadAbout(); break;
    }
}

function toggleNav() {
    const navMenu = document.getElementById('navMenu');
    if (navMenu) navMenu.classList.toggle('active');
}

// ==================== 首页加载 ====================
async function loadHomePage() {
    await Promise.all([
        loadLatestFeed(),
        loadLatestPhotos(),
        loadMembersPreview(),
        loadBoardPreview()
    ]);
}

async function loadLatestFeed() {
    const container = document.getElementById('latestFeed');
    if (!container) return;
    const feed = (await dataStore.getFeed()).slice(0, 3);

    if (feed.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📝</div><div class="empty-state-text">还没有动态，快来分享第一条吧～</div></div>`;
        return;
    }
    container.innerHTML = feed.map(post => createFeedCard(post, true)).join('');
}

async function loadLatestPhotos() {
    const container = document.getElementById('latestPhotos');
    if (!container) return;
    const photos = (await dataStore.getAlbum()).slice(0, 6);

    if (photos.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📸</div><div class="empty-state-text">还没有照片，快来上传第一张吧～</div></div>`;
        return;
    }
    container.innerHTML = `<div class="album-grid">${photos.map(photo => createAlbumItem(photo)).join('')}</div>`;
}

function loadMembersPreview() {
    const container = document.getElementById('membersPreview');
    if (!container) return;
    container.innerHTML = `<div class="members-grid">${MEMBERS.slice(0, 6).map(member => createMemberCard(member)).join('')}</div>`;
}

async function loadBoardPreview() {
    const container = document.getElementById('boardPreview');
    if (!container) return;
    const board = (await dataStore.getBoard()).slice(0, 3);

    if (board.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">💬</div><div class="empty-state-text">还没有留言，快来写下第一条吧～</div></div>`;
        return;
    }
    container.innerHTML = board.map(message => createBoardCard(message)).join('');
}

// ==================== 通用工具函数 ====================
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
    return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatFullTime(timestamp) {
    const date = new Date(timestamp);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function getMember(memberId) {
    return MEMBERS.find(m => m.id === memberId) || MEMBERS[0];
}

function showToast(message, duration = 2000) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), duration);
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// 创建动态卡片
function createFeedCard(post, isPreview = false) {
    const member = getMember(post.authorId);
    const isLiked = post.likes.includes(currentMemberId);
    const isOwner = post.authorId === currentMemberId;

    return `
        <div class="feed-card" data-id="${post.id}">
            <div class="feed-header">
                <div class="feed-avatar">${getMemberAvatarHTML(member)}</div>
                <div class="feed-meta">
                    <div class="feed-author">${member.name}</div>
                    <div class="feed-time">${formatTime(post.time)}</div>
                </div>
            </div>
            <div class="feed-content">${escapeHtml(post.content)}</div>
            ${post.images.length > 0 ? `
                <div class="feed-images ${getImageGridClass(post.images.length)}">
                    ${post.images.map(img => `<img src="${img}" alt="图片" class="feed-image" onclick="openImageViewer('${img}', '${member.name}', '${formatTime(post.time)}')" loading="lazy">`).join('')}
                </div>
            ` : ''}
            ${!isPreview ? `
                <div class="feed-actions">
                    <button class="feed-action ${isLiked ? 'liked' : ''}" onclick="toggleLike(${post.id})">
                        ${isLiked ? '❤️' : '🤍'} <span class="count">${post.likes.length}</span>
                    </button>
                    <button class="feed-action" onclick="openComments(${post.id})">
                        💬 <span class="count">${post.comments.length}</span>
                    </button>
                    ${isOwner ? `<button class="feed-action" onclick="deleteFeedPost(${post.id})">🗑️</button>` : ''}
                </div>
            ` : ''}
        </div>
    `;
}

// 创建相册项
function createAlbumItem(photo) {
    const member = getMember(photo.authorId);
    return `
        <div class="album-item" onclick="openImageViewer('${photo.image}', '${member.name}', '${formatTime(photo.time)}')">
            <img src="${photo.image}" alt="${photo.desc || '照片'}" loading="lazy">
            <div class="album-item-overlay">
                <div class="album-item-author">${getMemberAvatarHTML(member)} ${member.name}</div>
                <div class="album-item-date">${formatTime(photo.time)}</div>
            </div>
        </div>
    `;
}

// 创建成员卡片
function createMemberCard(member) {
    return `
        <div class="member-card" onclick="openMemberDetail(${member.id})">
            <div class="member-avatar-name">${getMemberAvatarHTML(member)}</div>
            <div class="member-name">${member.name}</div>
            <div class="member-title">${member.title}</div>
            <div class="member-desc">${member.desc}</div>
            <div class="member-join">🎂 ${member.birthday.slice(0,2)}月${member.birthday.slice(2,4)}日 · 入坑：${member.joinDate}</div>
        </div>
    `;
}

// 创建留言卡片
function createBoardCard(message) {
    const member = getMember(message.authorId);
    return `
        <div class="board-card" data-id="${message.id}">
            <div class="board-content">${escapeHtml(message.content)}</div>
            <div class="board-footer">
                <div class="board-author">
                    <div class="board-avatar">${getMemberAvatarHTML(member)}</div>
                    <div class="board-name">${member.name}</div>
                </div>
                <div class="board-time">${formatTime(message.time)}</div>
            </div>
        </div>
    `;
}

function getImageGridClass(count) {
    if (count === 1) return 'single';
    if (count === 2) return 'double';
    if (count === 3) return 'triple';
    return 'multi';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== 图片查看器 ====================
let currentViewerImages = [];
let currentViewerIndex = 0;

function openImageViewer(imageSrc, author, time) {
    currentViewerImages = [imageSrc];
    currentViewerIndex = 0;
    updateImageViewer();
    openModal('imageViewer');
}

function updateImageViewer() {
    const img = document.getElementById('viewerImage');
    const info = document.getElementById('viewerInfo');
    if (img) img.src = currentViewerImages[currentViewerIndex] || '';
    if (info) info.textContent = `${currentViewerIndex + 1} / ${currentViewerImages.length}`;
}

function prevImage() {
    currentViewerIndex = (currentViewerIndex - 1 + currentViewerImages.length) % currentViewerImages.length;
    updateImageViewer();
}

function nextImage() {
    currentViewerIndex = (currentViewerIndex + 1) % currentViewerImages.length;
    updateImageViewer();
}

// ==================== 动态功能 ====================
let feedPage = 1;
const feedPageSize = 10;

async function loadFeed() {
    feedPage = 1;
    await renderFeed();
}

async function renderFeed() {
    const container = document.getElementById('feedList');
    if (!container) return;
    const allFeed = await dataStore.getFeed();
    const feed = allFeed.slice(0, feedPage * feedPageSize);

    if (feed.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📝</div><div class="empty-state-text">还没有动态，快来分享第一条吧～</div></div>`;
        const loadMore = document.getElementById('loadMoreFeed');
        if (loadMore) loadMore.style.display = 'none';
        return;
    }

    container.innerHTML = feed.map(post => createFeedCard(post)).join('');

    const loadMoreBtn = document.getElementById('loadMoreFeed');
    if (loadMoreBtn) loadMoreBtn.style.display = feed.length < allFeed.length ? 'block' : 'none';
}

async function loadMoreFeed() {
    feedPage++;
    await renderFeed();
}

async function filterFeed(type, btn) {
    document.querySelectorAll('.feed-filters .filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const container = document.getElementById('feedList');
    if (!container) return;
    let feed = await dataStore.getFeed();

    if (type === 'text') feed = feed.filter(f => f.images.length === 0);
    else if (type === 'image') feed = feed.filter(f => f.images.length > 0);

    if (feed.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-text">没有找到相关动态</div></div>`;
        return;
    }
    container.innerHTML = feed.map(post => createFeedCard(post)).join('');
}

function openPostModal() {
    const content = document.getElementById('postContent');
    const preview = document.getElementById('postImagePreview');
    const input = document.getElementById('postImages');
    if (content) content.value = '';
    if (preview) preview.innerHTML = '';
    if (input) input.value = '';
    openModal('postModal');
}

function previewPostImages(input) {
    const preview = document.getElementById('postImagePreview');
    if (!preview) return;
    preview.innerHTML = '';

    if (input.files) {
        Array.from(input.files).forEach(file => {
            const item = document.createElement('div');
            item.className = 'image-preview-item';
            item.innerHTML = `
                <img src="${URL.createObjectURL(file)}" alt="预览">
                <button class="remove-btn" onclick="this.parentElement.remove()">✕</button>
            `;
            preview.appendChild(item);
        });
    }
}

async function submitPost() {
    const contentEl = document.getElementById('postContent');
    const content = contentEl ? contentEl.value.trim() : '';

    if (!content) {
        showToast('请输入内容～');
        return;
    }

    const imageFiles = document.getElementById('postImages');
    const images = [];

    // 上传图片
    if (imageFiles && imageFiles.files.length > 0) {
        for (const file of imageFiles.files) {
            const url = await dataStore.uploadImage(file);
            images.push(url);
        }
    }

    await dataStore.addFeed({ content, images, authorId: currentMemberId });
    closeModal('postModal');
    showToast('发布成功！✨');

    if (currentSection === 'home') await loadHomePage();
    else if (currentSection === 'feed') await loadFeed();
}

async function toggleLike(feedId) {
    await dataStore.likeFeed(feedId, currentMemberId);
    if (currentSection === 'home') await loadHomePage();
    else await renderFeed();
}

async function deleteFeedPost(feedId) {
    if (confirm('确定要删除这条动态吗？')) {
        await dataStore.deleteFeed(feedId);
        showToast('已删除');
        if (currentSection === 'home') await loadHomePage();
        else await loadFeed();
    }
}

// ==================== 评论功能 ====================
let currentCommentFeedId = null;

async function openComments(feedId) {
    currentCommentFeedId = feedId;
    const feed = await dataStore.getFeed();
    const post = feed.find(f => f.id === feedId);

    if (post) {
        const container = document.getElementById('commentsList');
        if (!container) return;

        if (post.comments.length === 0) {
            container.innerHTML = `<div class="empty-state" style="padding:20px;"><div class="empty-state-text">还没有评论，快来抢沙发～</div></div>`;
        } else {
            container.innerHTML = post.comments.map(comment => {
                const member = getMember(comment.authorId);
                return `
                    <div class="comment-item">
                        <div class="comment-avatar">${getMemberAvatarHTML(member)}</div>
                        <div class="comment-body">
                            <div class="comment-author">${member.name}</div>
                            <div class="comment-text">${escapeHtml(comment.content)}</div>
                            <div class="comment-time">${formatTime(comment.time)}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        const input = document.getElementById('commentContent');
        if (input) input.value = '';
        openModal('commentModal');
    }
}

async function submitComment() {
    const contentEl = document.getElementById('commentContent');
    const content = contentEl ? contentEl.value.trim() : '';

    if (!content) {
        showToast('请输入评论内容～');
        return;
    }

    if (currentCommentFeedId) {
        await dataStore.addComment(currentCommentFeedId, { authorId: currentMemberId, content });
        showToast('评论成功！');
        await openComments(currentCommentFeedId);

        if (currentSection === 'home') await loadHomePage();
        else await renderFeed();
    }
}

// ==================== 成员详情 ====================
async function openMemberDetail(memberId) {
    const member = getMember(memberId);
    const [feed, album, board] = await Promise.all([
        dataStore.getMemberFeed(memberId),
        dataStore.getMemberAlbum(memberId),
        dataStore.getMemberBoard(memberId)
    ]);

    const titleEl = document.getElementById('memberModalTitle');
    if (titleEl) titleEl.textContent = `${member.name}的档案`;

    const body = document.getElementById('memberModalBody');
    if (!body) return;

    body.innerHTML = `
        <div class="member-detail">
            <div class="member-detail-avatar-name">${getMemberAvatarHTML(member)}</div>
            <div class="member-detail-name">${member.name}</div>
            <div class="member-detail-role">${member.role}</div>
            <div class="member-detail-title">${member.title}</div>
            <div class="member-detail-info">
                <div class="member-stat">
                    <div class="member-stat-value">${feed.length}</div>
                    <div class="member-stat-label">动态</div>
                </div>
                <div class="member-stat">
                    <div class="member-stat-value">${album.length}</div>
                    <div class="member-stat-label">照片</div>
                </div>
                <div class="member-stat">
                    <div class="member-stat-value">${board.length}</div>
                    <div class="member-stat-label">留言</div>
                </div>
                <div class="member-stat">
                    <div class="member-stat-value">${member.birthday.slice(0,2)}月${member.birthday.slice(2,4)}日</div>
                    <div class="member-stat-label">🎂 生日</div>
                </div>
            </div>
            <div class="member-detail-desc">
                <strong>个人简介：</strong>${member.desc}<br><br>
                <strong>座右铭：</strong>${member.motto}<br><br>
                <strong>入坑时间：</strong>${member.joinDate}
            </div>
            ${feed.length > 0 ? `<div class="member-detail-posts"><h4>📝 ${member.name}的动态</h4>${feed.slice(0, 5).map(post => createFeedCard(post, true)).join('')}</div>` : ''}
        </div>
    `;

    openModal('memberModal');
}

// ==================== 关于页面 ====================
async function loadAbout() {
    const groupDate = document.getElementById('groupDate');
    const groupSlogan = document.getElementById('groupSlogan');
    if (groupDate) groupDate.textContent = HOUSE_INFO.createDate;
    if (groupSlogan) groupSlogan.textContent = HOUSE_INFO.slogan;

    const album = await dataStore.getAlbum();
    const container = document.getElementById('aboutMemories');
    if (container && album.length > 0) {
        container.innerHTML = album.slice(0, 8).map(p => `<img src="${p.image}" alt="${p.desc || ''}" onclick="openImageViewer('${p.image}')" loading="lazy">`).join('');
    }
}
