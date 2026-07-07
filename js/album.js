/* ==================== 相册功能 ==================== */

let currentAlbumCategory = 'daily';
let albumPage = 1;
const albumPageSize = 12;

// 加载相册
async function loadAlbum() {
    albumPage = 1;
    await renderAlbum();
}

// 渲染相册
async function renderAlbum() {
    const container = document.getElementById('albumGrid');
    if (!container) return;
    const allPhotos = await dataStore.getAlbumByCategory(currentAlbumCategory);
    const photos = allPhotos.slice(0, albumPage * albumPageSize);

    if (photos.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state-icon">📸</div>
                <div class="empty-state-text">还没有照片，快来上传第一张吧～</div>
            </div>
        `;
        const loadMore = document.getElementById('loadMoreAlbum');
        if (loadMore) loadMore.style.display = 'none';
        return;
    }

    container.innerHTML = photos.map(photo => createAlbumItem(photo)).join('');

    const loadMoreBtn = document.getElementById('loadMoreAlbum');
    if (loadMoreBtn) loadMoreBtn.style.display = photos.length < allPhotos.length ? 'block' : 'none';
}

// 切换相册分类
async function switchAlbumTab(category, btn) {
    currentAlbumCategory = category;

    document.querySelectorAll('.album-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    albumPage = 1;
    await renderAlbum();
}

// 加载更多照片
async function loadMoreAlbum() {
    albumPage++;
    await renderAlbum();
}

// 打开上传照片弹窗
function openAlbumModal() {
    const desc = document.getElementById('albumDesc');
    const preview = document.getElementById('albumImagePreview');
    const input = document.getElementById('albumImages');
    if (desc) desc.value = '';
    if (preview) preview.innerHTML = '';
    if (input) input.value = '';
    openModal('albumModal');
}

// 预览相册图片
function previewAlbumImages(input) {
    const preview = document.getElementById('albumImagePreview');
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

// 提交相册照片
async function submitAlbum() {
    const categoryEl = document.getElementById('albumCategory');
    const descEl = document.getElementById('albumDesc');
    const category = categoryEl ? categoryEl.value : 'daily';
    const desc = descEl ? descEl.value.trim() : '';

    const imageFiles = document.getElementById('albumImages');
    if (!imageFiles || imageFiles.files.length === 0) {
        showToast('请选择照片～');
        return;
    }

    // 上传每张照片（本地模式用 base64）
    for (const file of imageFiles.files) {
        const url = await dataStore.uploadImage(file);
        await dataStore.addAlbumPhoto({
            category,
            desc: desc || '未命名照片',
            image: url,
            authorId: currentMemberId
        });
    }

    closeModal('albumModal');
    showToast(`成功上传 ${imageFiles.files.length} 张照片！📸`);

    if (currentSection === 'home') await loadHomePage();
    else if (currentSection === 'album') await loadAlbum();
}

// ==================== 删除照片 ====================
async function deleteAlbumPhoto(photoId) {
    if (confirm('确定要删除这张照片吗？')) {
        await dataStore.deleteAlbumPhoto(photoId, currentMemberId);
        showToast('已删除');
        if (currentSection === 'home') await loadHomePage();
        else if (currentSection === 'album') await loadAlbum();
    }
}
