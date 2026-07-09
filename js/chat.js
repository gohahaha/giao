/* ==================== 聊以室 - 实时聊天 ==================== */

let chatMessages = [];
let chatUnreadCount = 0;
let chatPollTimer = null;
let chatLastCloudId = null; // 记录云端最新消息ID，用于轮询增量拉取
const CHAT_PAGE_SIZE = 50;

// 初始化聊天（登录后调用）
function initChat() {
    // 1. 订阅 Supabase Realtime 实时消息
    dataStore.subscribeToChat((newMsg) => {
        onNewRemoteMessage(newMsg);
    });

    // 2. 启动轮询兜底（每3秒拉一次，保证离线/丢消息时也能同步）
    startChatPolling();
}

// 处理新消息（来自 Realtime 或轮询）
function onNewRemoteMessage(newMsg) {
    // 去重
    if (chatMessages.find(m => m.id === newMsg.id)) return;

    chatMessages.push(newMsg);
    chatLastCloudId = newMsg.id;

    if (currentSection === 'home') {
        appendChatMessage(newMsg);
        scrollChatToBottom();
    } else {
        chatUnreadCount++;
        updateChatUnreadBadge();
    }
}

// 轮询拉取云端新消息
function startChatPolling() {
    if (chatPollTimer) clearInterval(chatPollTimer);
    chatPollTimer = setInterval(async () => {
        try {
            const cloudMsgs = await dataStore._getChatCloud();
            if (!cloudMsgs || cloudMsgs.length === 0) return;

            // 找出本地没有的新消息
            const localIds = new Set(chatMessages.map(m => m.id));
            const newOnes = cloudMsgs.filter(m => !localIds.has(m.id));

            if (newOnes.length > 0) {
                console.log('📡 轮询发现', newOnes.length, '条新消息');
                // 同步到本地存储
                newOnes.forEach(m => {
                    if (!localIds.has(m.id)) {
                        dataStore.addLocalChatMsgDirect(m);
                    }
                });
                // 刷新界面
                await refreshChatMessages();
            }
        } catch(e) {
            // 云端不可达，静默跳过
        }
    }, 3000);
}

// 停止轮询
function stopChatPolling() {
    if (chatPollTimer) {
        clearInterval(chatPollTimer);
        chatPollTimer = null;
    }
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
        const recent = chatMessages.slice(-CHAT_PAGE_SIZE);
        msgContainer.innerHTML = recent.map(msg => createChatBubble(msg)).join('');
        if (chatMessages.length > CHAT_PAGE_SIZE) {
            const loadMore = document.createElement('div');
            loadMore.className = 'chat-load-more';
            loadMore.innerHTML = `<button class="btn-secondary" onclick="loadMoreChatHistory()">📜 加载更多历史消息 (${chatMessages.length - CHAT_PAGE_SIZE}条)</button>`;
            msgContainer.prepend(loadMore);
        }
        chatLastCloudId = chatMessages[chatMessages.length - 1]?.id || null;
    }

    scrollChatToBottom(false);
    document.getElementById('chatInput')?.focus();
}

// 刷新聊天消息（轮询发现新消息后调用）
async function refreshChatMessages() {
    chatMessages = await dataStore.getChat();
    const msgContainer = document.getElementById('chatMessages');
    const emptyHint = document.getElementById('chatEmpty');
    if (!msgContainer) return;

    // 检查是否在首页
    if (currentSection !== 'home') {
        chatUnreadCount++;
        updateChatUnreadBadge();
        return;
    }

    if (chatMessages.length === 0) {
        msgContainer.innerHTML = '';
        if (emptyHint) emptyHint.style.display = 'flex';
        return;
    }

    if (emptyHint) emptyHint.style.display = 'none';

    // 只更新新增的消息（不重绘整个列表）
    const existingIds = new Set(
        Array.from(msgContainer.querySelectorAll('.chat-message[data-id]'))
            .map(el => parseInt(el.getAttribute('data-id')))
    );
    const newMsgs = chatMessages.filter(m => !existingIds.has(m.id));

    if (newMsgs.length > 0) {
        // 移除加载更多按钮
        const loadMore = msgContainer.querySelector('.chat-load-more');
        if (loadMore) loadMore.remove();

        newMsgs.forEach(m => appendChatMessage(m));
        scrollChatToBottom();
    }
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

    input.value = '';
    input.focus();

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

    // 保存到 dataStore（本地保存 + 云端同步）
    const saved = await dataStore.addChatMessage(tempMsg);
    console.log('📤 消息已发送, 云端同步:', dataStore.cloudOk ? '尝试中' : '离线模式');
}

// 删除消息
async function deleteChatMsg(msgId) {
    if (!confirm('确定要删除这条消息吗？')) return;

    await dataStore.deleteChatMessage(msgId, currentMemberId);

    chatMessages = chatMessages.filter(m => m.id !== msgId);

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
