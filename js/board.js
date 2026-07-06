/* ==================== 留言板功能 ==================== */

// 加载留言板
async function loadBoard() {
    await renderBoard();
}

// 渲染留言板
async function renderBoard() {
    const container = document.getElementById('boardList');
    if (!container) return;
    const board = await dataStore.getBoard();

    if (board.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <div class="empty-state-text">还没有留言，快来写下第一条吧～</div>
            </div>
        `;
        return;
    }

    container.innerHTML = board.map(message => createBoardCard(message)).join('');
}

// 打开留言弹窗
function openBoardModal() {
    const content = document.getElementById('boardContent');
    if (content) content.value = '';
    openModal('boardModal');
}

// 提交留言
async function submitBoard() {
    const contentEl = document.getElementById('boardContent');
    const content = contentEl ? contentEl.value.trim() : '';

    if (!content) {
        showToast('请输入留言内容～');
        return;
    }

    await dataStore.addBoard({ content });
    closeModal('boardModal');
    showToast('留言成功！💌');

    if (currentSection === 'home') await loadHomePage();
    else if (currentSection === 'board') await loadBoard();
}
