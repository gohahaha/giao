/* ==================== 时光轴功能 ==================== */

// 加载时光轴
async function loadTimeline() {
    await initTimelineFilters();
    await renderTimeline();
}

// 初始化时光轴筛选器
async function initTimelineFilters() {
    const yearSelect = document.getElementById('timelineYear');
    const monthSelect = document.getElementById('timelineMonth');

    const years = await dataStore.getYears();

    if (yearSelect) {
        yearSelect.innerHTML = '<option value="all">全部年份</option>' +
            years.map(year => `<option value="${year}">${year}年</option>`).join('');
    }

    if (monthSelect) {
        monthSelect.innerHTML = '<option value="all">全部月份</option>' +
            Array.from({ length: 12 }, (_, i) => i + 1)
                .map(month => `<option value="${month}">${month}月</option>`)
                .join('');
    }
}

// 筛选时光轴
async function filterTimeline() {
    await renderTimeline();
}

// 渲染时光轴
async function renderTimeline() {
    const container = document.getElementById('timelineList');
    if (!container) return;

    const yearEl = document.getElementById('timelineYear');
    const monthEl = document.getElementById('timelineMonth');
    const year = yearEl ? yearEl.value : 'all';
    const month = monthEl ? monthEl.value : 'all';

    const timelineData = await dataStore.getTimelineData(year, month);
    const months = Object.keys(timelineData).sort((a, b) => b.localeCompare(a));

    if (months.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⏳</div>
                <div class="empty-state-text">还没有回忆，快来创建第一条吧～</div>
            </div>
        `;
        return;
    }

    container.innerHTML = months.map(key => {
        const data = timelineData[key];
        return `
            <div class="timeline-month">
                <div class="timeline-month-header">
                    <div class="timeline-month-title">${data.year}年${data.month}月</div>
                    <div class="timeline-month-count">${data.items.length}条记录</div>
                </div>
                <div class="timeline-items">
                    ${data.items.map(item => createTimelineItem(item)).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// 创建时光轴项目
function createTimelineItem(item) {
    const member = getMember(item.authorId);
    const typeIcon = item.type === 'feed' ? '📝' : item.type === 'album' ? '📸' : '💬';

    let content = '';
    if (item.type === 'feed') {
        content = `
            <div class="timeline-item-content">${escapeHtml(item.content)}</div>
            ${item.images && item.images.length > 0 ? `
                <div class="timeline-item-images">
                    ${item.images.slice(0, 3).map(img => `
                        <img src="${img}" alt="图片" onclick="openImageViewer('${img}', '${member.name}', '${formatTime(item.time)}')" loading="lazy">
                    `).join('')}
                </div>
            ` : ''}
        `;
    } else if (item.type === 'album') {
        content = `
            <div class="timeline-item-content">${escapeHtml(item.desc || '上传了照片')}</div>
            <div class="timeline-item-images">
                <img src="${item.image}" alt="照片" onclick="openImageViewer('${item.image}', '${member.name}', '${formatTime(item.time)}')" loading="lazy">
            </div>
        `;
    } else if (item.type === 'board') {
        content = `<div class="timeline-item-content">"${escapeHtml(item.content)}"</div>`;
    }

    return `
        <div class="timeline-item">
            <div class="timeline-item-header">
                <div class="timeline-item-avatar">${member.emoji}</div>
                <div class="timeline-item-meta">
                    <div class="timeline-item-author">${member.name} ${typeIcon}</div>
                    <div class="timeline-item-time">${formatFullTime(item.time)}</div>
                </div>
            </div>
            ${content}
        </div>
    `;
}
