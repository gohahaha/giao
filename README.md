# 🏠 米奇giaogiao屋 · 我们的专属小窝

> 十人岁岁年年，碎碎念念皆珍藏 ❤️

## ✨ 功能特性

- 💬 **群友日常圈** - 专属朋友圈，永久保存所有动态
- 📸 **专属群相册** - 分类存档照片，告别图片过期
- 👥 **成员档案** - 10人专属花名册
- ⏳ **回忆时光轴** - 按时间回顾珍贵回忆
- 📝 **碎碎念留言板** - 随手记录小情绪
- 💖 **关于我们** - 记录小屋初心

## 🚀 快速开始

### 本地预览

直接用浏览器打开 `index.html` 即可预览！

### 部署到 GitHub Pages

1. **创建 GitHub 仓库**
   - 登录 GitHub
   - 点击右上角 "+" → "New repository"
   - 仓库名填写：`house`（或你喜欢的名字）
   - 选择 "Public"
   - 点击 "Create repository"

2. **上传文件**
   - 将所有文件上传到仓库
   - 或者使用 Git 命令：
   ```bash
   git init
   git add .
   git commit -m "初始化米奇giaogiao屋"
   git branch -M main
   git remote add origin https://github.com/你的用户名/house.git
   git push -u origin main
   ```

3. **开启 GitHub Pages**
   - 进入仓库 → Settings → Pages
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "main" 和 "/ (root)"
   - 点击 "Save"
   - 等待几分钟，访问 `https://你的用户名.github.io/house/`

## 📝 如何更新内容

### 发动态

1. 点击顶部导航 "日常圈"
2. 点击右上角 "✏️ 发动态"
3. 选择你是谁
4. 输入内容，可选添加图片
5. 点击 "发布"

### 上传照片

1. 点击顶部导航 "群相册"
2. 点击右上角 "📤 上传照片"
3. 选择上传者和相册分类
4. 选择照片
5. 点击 "上传"

### 写留言

1. 点击顶部导航 "碎碎念"
2. 点击右上角 "✏️ 写留言"
3. 选择你是谁
4. 写下你的碎碎念
5. 点击 "发布"

## 🎨 自定义配置

### 修改成员信息

编辑 `js/data.js` 文件中的 `MEMBERS` 数组：

```javascript
const MEMBERS = [
    {
        id: 1,
        name: '米奇',        // 昵称
        emoji: '🐭',         // 头像表情
        title: '群主·小屋创始人', // 头衔
        desc: '最爱你们的米奇',   // 简介
        joinDate: '2024-01-01', // 入坑时间
        motto: '有你们在，每天都是好日子' // 座右铭
    },
    // ... 其他成员
];
```

### 修改小屋信息

编辑 `js/data.js` 文件中的 `HOUSE_INFO` 对象：

```javascript
const HOUSE_INFO = {
    name: '米奇giaogiao屋',
    slogan: '无关热闹，只关偏爱',
    createDate: '2024-01-01',
    description: '...'
};
```

## 📱 手机端使用

网站已适配手机端，建议：

1. 将网站添加到手机桌面（像APP一样使用）
   - **iPhone**: Safari 打开 → 点击分享按钮 → 添加到主屏幕
   - **Android**: Chrome 打开 → 点击菜单 → 添加到主屏幕

2. 将网址分享给其他群友（只有知道链接的人才能访问）

## 🔒 隐私说明

- 网站已设置 `noindex, nofollow`，不会被搜索引擎收录
- 数据存储在浏览器本地（localStorage），不会上传到服务器
- 只有知道网址的人才能访问
- 建议不要将网址公开分享

## 💾 数据备份

数据存储在浏览器的 localStorage 中，建议定期备份：

1. 打开浏览器开发者工具（F12）
2. 切换到 "Console" 标签
3. 输入以下命令导出数据：
   ```javascript
   copy(JSON.stringify({
       feed: JSON.parse(localStorage.getItem('house_feed') || '[]'),
       album: JSON.parse(localStorage.getItem('house_album') || '[]'),
       board: JSON.parse(localStorage.getItem('house_board') || '[]')
   }))
   ```
4. 粘贴保存到文件

## 🛠️ 技术栈

- HTML5
- CSS3 (响应式设计)
- Vanilla JavaScript (无框架依赖)
- localStorage (本地存储)

## 📄 许可证

MIT License - 仅供米奇giaogiao屋内部使用

---

**米奇giaogiao屋** · 无关热闹，只关偏爱 · 记录岁岁年年的陪伴 ❤️
