/* ==================== 聊以室 - 实时聊天 ==================== */

let chatMessages = [];
let chatUnreadCount = 0;
const CHAT_PAGE_SIZE = 50;

// 初始化聊天（登录后调用）
function initChat() {
    // 订阅实时消息
    dataStore.subscribeToChat((newMsg) => {
        // 实时收到新消息
        chatMessages.push(newMsg);
        if (currentSection === 'chat') {
            appendChatMessage(newMsg);
            scrollChatToBottom();
        } else {
            chatUnreadCount++;
            updateChatUnreadBadge();
        }
    });
}

// 加载聊以室
async function loadChat() {
    chatUnreadCount = 0;
    updateChatUnreadBadge();
    chatMessages = await dataStore.getChat();

    const msgContainer = document.getElementById('chatMessages');
    const emptyHint = document.getElementById('chatEmpty');

    if (!msgContainer) return;

    if (chatMessages.length === 0) {
        msgContainer.innerHTML = '';
        if (emptyHint) emptyHint.style.display = 'flex';
    } else {
        if (emptyHint) emptyHint.style.display = 'none';
        // 只渲染最近的消息
        const recent = chatMessages.slice(-CHAT_PAGE_SIZE);
        msgContainer.innerHTML = recent.map(msg => createChatBubble(msg)).join('');
        // 如果有更多历史消息
        if (chatMessages.length > CHAT_PAGE_SIZE) {
            const loadMore = document.createElement('div');
            loadMore.className = 'chat-load-more';
            loadMore.innerHTML = `<button class="btn-secondary" onclick="loadMoreChatHistory()">📜 加载更多历史消息 (${chatMessages.length - CHAT_PAGE_SIZE}条)</button>`;
            msgContainer.prepend(loadMore);
        }
    }

    scrollChatToBottom(false);
    document.getElementById('chatInput')?.focus();
}

// 加载更多历史消息
let chatDisplayCount = CHAT_PAGE_SIZE;
function loadMoreChatHistory() {
    chatDisplayCount += CHAT_PAGE_SIZE;
    const msgContainer = document.getElementById('chatMessages');
    if (!msgContainer) return;

    const recent = chatMessages.slice(-chatDisplayCount);
    msgContainer.innerHTML = recent.map(msg => createChatBubble(msg)).join('');

    if (chatMessages.length > chatDisplayCount) {
        const loadMore = document.createElement('div');
        loadMore.className = 'chat-load-more';
        loadMore.innerHTML = `<button class="btn-secondary" onclick="loadMoreChatHistory()">📜 加载更多历史消息 (${chatMessages.length - chatDisplayCount}条)</button>`;
        msgContainer.prepend(loadMore);
    }
}

// 创建聊天气泡
function createChatBubble(msg) {
    const isSelf = Number(msg.authorId) === Number(currentMemberId);
    const member = getMember(msg.authorId);
    const time = new Date(msg.time);
    const timeStr = `${String(time.getHours()).padStart(2,'0')}:${String(time.getMinutes()).padStart(2,'0')}`;

    return `
        <div class="chat-message ${isSelf ? 'self' : 'other'}" data-id="${msg.id}">
            ${!isSelf ? `
                <div class="chat-avatar" onclick="openMemberDetail(${member.id})" title="${member.name}">
                    ${getMemberAvatarHTML(member)}
                </div>
            ` : ''}
            <div class="chat-bubble-wrapper">
                ${!isSelf ? `<div class="chat-sender-name">${member.name}</div>` : ''}
                <div class="chat-bubble ${isSelf ? 'self' : 'other'}">
                    <div class="chat-bubble-text">${escapeHtml(msg.content)}</div>
                </div>
                <div class="chat-meta ${isSelf ? 'self' : 'other'}">
                    <span class="chat-time">${timeStr}</span>
                    ${isSelf ? `<button class="chat-delete-btn" onclick="deleteChatMsg(${msg.id})" title="删除">🗑️</button>` : ''}
                </div>
            </div>
            ${isSelf ? `
                <div class="chat-avatar" onclick="openMemberDetail(${member.id})" title="${member.name}">
                    ${getMemberAvatarHTML(member)}
                </div>
            ` : ''}
        </div>
    `;
}

// 追加单条消息（实时收到）
function appendChatMessage(msg) {
    const msgContainer = document.getElementById('chatMessages');
    const emptyHint = document.getElementById('chatEmpty');
    if (!msgContainer) return;

    if (emptyHint) emptyHint.style.display = 'none';

    // 移除加载更多按钮
    const loadMore = msgContainer.querySelector('.chat-load-more');
    if (loadMore) loadMore.remove();

    msgContainer.insertAdjacentHTML('beforeend', createChatBubble(msg));
}

// 发送消息
async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    if (!input) return;

    const content = input.value.trim();
    if (!content) return;

    // 乐观更新：立即显示
    const tempMsg = {
        id: Date.now(),
        authorId: currentMemberId,
        content: content,
        time: Date.now()
    };

    chatMessages.push(tempMsg);
    appendChatMessage(tempMsg);
    scrollChatToBottom();
    input.value = '';
    input.focus();

    // 保存到 dataStore（本地 + 云端后台同步）
    await dataStore.addChatMessage(tempMsg);
}

// 删除消息
async function deleteChatMsg(msgId) {
    if (!confirm('确定要删除这条消息吗？')) return;

    await dataStore.deleteChatMessage(msgId, currentMemberId);

    // 从本地数组移除
    chatMessages = chatMessages.filter(m => m.id !== msgId);

    // 重新渲染
    const msgContainer = document.getElementById('chatMessages');
    const emptyHint = document.getElementById('chatEmpty');
    if (!msgContainer) return;

    chatDisplayCount = CHAT_PAGE_SIZE;
    if (chatMessages.length === 0) {
        msgContainer.innerHTML = '';
        if (emptyHint) emptyHint.style.display = 'flex';
    } else {
        if (emptyHint) emptyHint.style.display = 'none';
        const recent = chatMessages.slice(-chatDisplayCount);
        msgContainer.innerHTML = recent.map(msg => createChatBubble(msg)).join('');
        if (chatMessages.length > chatDisplayCount) {
            const loadMore = document.createElement('div');
            loadMore.className = 'chat-load-more';
            loadMore.innerHTML = `<button class="btn-secondary" onclick="loadMoreChatHistory()">📜 加载更多历史消息 (${chatMessages.length - chatDisplayCount}条)</button>`;
            msgContainer.prepend(loadMore);
        }
    }

    showToast('消息已删除');
}

// 滚动到底部
function scrollChatToBottom(smooth = true) {
    const msgContainer = document.getElementById('chatMessages');
    if (!msgContainer) return;
    setTimeout(() => {
        msgContainer.scrollTo({
            top: msgContainer.scrollHeight,
            behavior: smooth ? 'smooth' : 'auto'
        });
    }, 50);
}

// 更新未读角标
function updateChatUnreadBadge() {
    const navLinks = document.querySelectorAll('.nav-link[data-section="home"]');
    navLinks.forEach(link => {
        if (chatUnreadCount > 0) {
            link.setAttribute('data-badge', chatUnreadCount > 99 ? '99+' : chatUnreadCount);
        } else {
            link.removeAttribute('data-badge');
        }
    });
}

// 聊天输入框 Enter 发送
document.addEventListener('keydown', function(e) {
    if (e.target.id === 'chatInput' && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
    }
});
