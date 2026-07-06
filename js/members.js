/* ==================== 成员档案功能 ==================== */

// 加载成员页面
async function loadMembers() {
    renderMembers();
}

// 渲染成员列表
function renderMembers() {
    const container = document.getElementById('membersGrid');
    if (container) {
        container.innerHTML = MEMBERS.map(member => createMemberCard(member)).join('');
    }
}
