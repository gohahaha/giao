/* ==================== Supabase 数据管理 ==================== */

// 初始化 Supabase 客户端
const isSupabaseConfigured = SUPABASE_URL && !SUPABASE_URL.includes('你的');
let supabaseClient = null;

if (isSupabaseConfigured && window.supabase) {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ==================== 成员数据（真实姓名+生日） ====================
const MEMBERS = [
    { id: 1, name: '杨婷',   birthday: '0107', account: '20260107', role: '管理员', title: '小屋管家',     desc: '细心体贴的大姐姐，把小屋打理得井井有条', joinDate: '2024-01-01', motto: '生活的美好在于每一天的陪伴' },
    { id: 2, name: '蒋旗',   birthday: '0209', account: '20260209', role: '成员',   title: '气氛担当',     desc: '有蒋旗在的地方就有欢笑和段子', joinDate: '2024-01-01', motto: '快乐就是和你们在一起' },
    { id: 3, name: '刘雯静', birthday: '0317', account: '20260317', role: '成员',   title: '美食雷达',     desc: '永远在发现好吃的路上，群里吃货代表', joinDate: '2024-01-01', motto: '没有什么是一顿美食解决不了的' },
    { id: 4, name: '陈利勇', birthday: '0507', account: '20260507', role: '成员',   title: '技术达人',     desc: '电脑问题找他准没错，靠谱的技术担当', joinDate: '2024-01-01', motto: '办法总比困难多' },
    { id: 5, name: '李璨江', birthday: '0518', account: '20260518', role: '群主',   title: '群主·小屋创始人', desc: '米奇giaogiao屋的灵魂人物，把大家都聚在一起', joinDate: '2024-01-01', motto: '有你们在，每天都是好日子' },
    { id: 6, name: '王一平', birthday: '0702', account: '20260702', role: '成员',   title: '摄影大师',     desc: '朋友圈摄影师，记录生活中的每一个美好瞬间', joinDate: '2024-01-01', motto: '生活需要仪式感' },
    { id: 7, name: '夏涛',   birthday: '0723', account: '20260723', role: '成员',   title: '运动健将',     desc: '篮球游泳样样行，永远活力满满', joinDate: '2024-01-01', motto: '生命在于运动' },
    { id: 8, name: '简诗语', birthday: '0727', account: '20260727', role: '成员',   title: '文艺青年',     desc: '喜欢读书写诗，用文字温暖每个人的心', joinDate: '2024-01-01', motto: '诗意地栖居在这片大地上' },
    { id: 9, name: '吕鹏',   birthday: '0826', account: '20260826', role: '成员',   title: '深夜陪伴',     desc: '夜晚最活跃的那个人，失眠患者互助协会会长', joinDate: '2024-01-01', motto: '晚安是最好的情话' },
    { id: 10, name: '蒋志星', birthday: '1013', account: '20261013', role: '成员',  title: '治愈担当',     desc: '温柔细心，总能察觉到谁不开心并送上安慰', joinDate: '2024-01-01', motto: '抱抱你，一切都会好的' },
    { id: 11, name: '吕楚钰', birthday: '1104', account: '20261104', role: '成员',  title: '可爱担当',     desc: '元气满满，像小太阳一样温暖着每一个人', joinDate: '2024-01-01', motto: '每天都元气满满' },
    { id: 12, name: '吕佳怡', birthday: '1114', account: '20261114', role: '成员',  title: '自由灵魂',     desc: '随性洒脱，说走就走的旅行达人', joinDate: '2024-01-01', motto: '生活不止眼前的苟且' }
];

const MEMBER_COLORS = ['#E8734A','#3B82F6','#10B981','#8B5CF6','#C41E3A','#F59E0B','#06B6D4','#EC4899','#6366F1','#14B8A6','#F97316','#84CC16'];

const HOUSE_INFO = {
    name: '米奇giaogiao屋', slogan: '无关热闹，只关偏爱', createDate: '2020-04-25',
    description: '米奇giaogiao屋，一个十二人小团体，无关热闹，只关偏爱，记录岁岁年年的陪伴，珍藏所有不被辜负的日常。'
};

// ==================== 登录验证 ====================
function verifyLogin(memberId, password) {
    const member = MEMBERS.find(m => m.id === memberId);
    return member ? member.account === password : false;
}

// ==================== 头像生成 ====================
function getMemberAvatarHTML(member) {
    const color = MEMBER_COLORS[(member.id - 1) % MEMBER_COLORS.length];
    return `<span class="name-avatar" style="background-color:${color}">${member.name.charAt(0)}</span>`;
}

// ==================== 数据操作类（localStorage 优先，Supabase 后台同步）====================
class DataStore {
    constructor() {
        this.useCloud = !!supabaseClient;
        this.cloudOk = false; // 确认 Supabase 连通后才用
        this._checkCloud();
    }

    async _checkCloud() {
        if (!this.useCloud) return;
        try {
            const { data, error } = await supabaseClient
                .from('posts').select('id').limit(1).abortSignal(AbortSignal.timeout(3000));
            if (!error) { this.cloudOk = true; console.log('☁️ Supabase 已连接'); }
        } catch (e) { console.log('📦 使用本地模式（Supabase 不可达）'); }
    }

    // 数据读取：云端优先（如果通），否则本地
    async getFeed() {
        if (this.cloudOk) {
            try { const r = await this._getFeedCloud(); if (r.length > 0) return r; } catch(e){}
        }
        return this.getLocalFeed();
    }
    async getAlbum() {
        if (this.cloudOk) {
            try { const r = await this._getAlbumCloud(); if (r.length > 0) return r; } catch(e){}
        }
        return this.getLocalAlbum();
    }
    async getBoard() {
        if (this.cloudOk) {
            try { const r = await this._getBoardCloud(); if (r.length > 0) return r; } catch(e){}
        }
        return this.getLocalBoard();
    }

    // 数据写入：本地立即保存，后台同步云端
    async addFeed(post) {
        const result = this.addLocalFeed(post);
        if (this.cloudOk) this._addFeedCloud(post).catch(()=>{});
        return result;
    }
    async addBoard(message) {
        const result = this.addLocalBoard(message);
        if (this.cloudOk) this._addBoardCloud(message).catch(()=>{});
        return result;
    }
    async addAlbumPhoto(photo) {
        const result = this.addLocalPhoto(photo);
        if (this.cloudOk) this._addAlbumPhotoCloud(photo).catch(()=>{});
        return result;
    }
    async likeFeed(feedId, authorId) {
        this.toggleLocalLike(feedId, authorId);
        if (this.cloudOk) this._likeFeedCloud(feedId, authorId).catch(()=>{});
    }
    async addComment(feedId, comment) {
        const result = this.addLocalComment(feedId, comment);
        if (this.cloudOk) this._addCommentCloud(feedId, comment).catch(()=>{});
        return result;
    }
    async deleteFeed(feedId, authorId) {
        this.deleteLocalFeed(feedId, authorId);
        if (this.cloudOk) this._deleteFeedCloud(feedId, authorId).catch(()=>{});
    }
    async deleteBoard(boardId, authorId) {
        this.deleteLocalBoard(boardId, authorId);
        if (this.cloudOk) this._deleteBoardCloud(boardId, authorId).catch(()=>{});
    }
    async deleteAlbumPhoto(photoId, authorId) {
        this.deleteLocalPhoto(photoId, authorId);
        if (this.cloudOk) this._deleteAlbumPhotoCloud(photoId, authorId).catch(()=>{});
    }
    async updateFeed(feedId, authorId, newContent) {
        const ok = this.updateLocalFeed(feedId, authorId, newContent);
        if (this.cloudOk) this._updateFeedCloud(feedId, authorId, newContent).catch(()=>{});
        return ok;
    }
    async updateBoard(boardId, authorId, newContent) {
        const ok = this.updateLocalBoard(boardId, authorId, newContent);
        if (this.cloudOk) this._updateBoardCloud(boardId, authorId, newContent).catch(()=>{});
        return ok;
    }

    // 图片上传
    async uploadImage(file) {
        if (this.cloudOk) {
            try {
                const fileExt = file.name.split('.').pop();
                const path = `public/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
                const { error } = await supabaseClient.storage.from('images').upload(path, file);
                if (!error) {
                    const { data: { publicUrl } } = supabaseClient.storage.from('images').getPublicUrl(path);
                    return publicUrl;
                }
            } catch(e) { console.error('上传云端失败，用base64'); }
        }
        return new Promise(r => { const reader = new FileReader(); reader.onload = e => r(e.target.result); reader.readAsDataURL(file); });
    }

    // ==================== 云端实现 ====================
    async _getFeedCloud() {
        const { data: posts, error } = await supabaseClient.from('posts').select('*').order('created_at', { ascending: false }).abortSignal(AbortSignal.timeout(5000));
        if (error || !posts || !posts.length) return [];
        const ids = posts.map(p => p.id);
        const [{ data: likes }, { data: comments }] = await Promise.all([
            supabaseClient.from('likes').select('*').in('post_id', ids).abortSignal(AbortSignal.timeout(5000)),
            supabaseClient.from('comments').select('*').in('post_id', ids).order('created_at', { ascending: true }).abortSignal(AbortSignal.timeout(5000))
        ]);
        const lb = {}, cb = {};
        (likes||[]).forEach(l => { if(!lb[l.post_id])lb[l.post_id]=[]; lb[l.post_id].push(l.author_id); });
        (comments||[]).forEach(c => { if(!cb[c.post_id])cb[c.post_id]=[]; cb[c.post_id].push({id:c.id,authorId:c.author_id,content:c.content,time:new Date(c.created_at).getTime()}); });
        return posts.map(p => ({ id:p.id, authorId:p.author_id, content:p.content, images:p.images||[], likes:lb[p.id]||[], comments:cb[p.id]||[], time:new Date(p.created_at).getTime() }));
    }
    async _getAlbumCloud() {
        const { data, error } = await supabaseClient.from('photos').select('*').order('created_at', { ascending: false }).abortSignal(AbortSignal.timeout(5000));
        if (error || !data) return [];
        return data.map(p => ({ id:p.id, authorId:p.author_id, category:p.category, desc:p.description||'', image:p.image_url, time:new Date(p.created_at).getTime() }));
    }
    async _getBoardCloud() {
        const { data, error } = await supabaseClient.from('messages').select('*').order('created_at', { ascending: false }).abortSignal(AbortSignal.timeout(5000));
        if (error || !data) return [];
        return data.map(m => ({ id:m.id, authorId:m.author_id, content:m.content, time:new Date(m.created_at).getTime() }));
    }
    async _addFeedCloud(post) {
        await supabaseClient.from('posts').insert({ author_id: post.authorId, content: post.content, images: post.images||[] }).abortSignal(AbortSignal.timeout(5000));
    }
    async _addBoardCloud(msg) {
        await supabaseClient.from('messages').insert({ author_id: msg.authorId, content: msg.content }).abortSignal(AbortSignal.timeout(5000));
    }
    async _addAlbumPhotoCloud(photo) {
        await supabaseClient.from('photos').insert({ author_id: photo.authorId, category: photo.category, description: photo.desc||'', image_url: photo.image }).abortSignal(AbortSignal.timeout(5000));
    }
    async _likeFeedCloud(feedId, authorId) {
        const { data: ex } = await supabaseClient.from('likes').select('*').eq('post_id', feedId).eq('author_id', authorId).maybeSingle().abortSignal(AbortSignal.timeout(5000));
        if (ex) await supabaseClient.from('likes').delete().eq('post_id', feedId).eq('author_id', authorId).abortSignal(AbortSignal.timeout(5000));
        else await supabaseClient.from('likes').insert({ post_id: feedId, author_id: authorId }).abortSignal(AbortSignal.timeout(5000));
    }
    async _addCommentCloud(feedId, comment) {
        await supabaseClient.from('comments').insert({ post_id: feedId, author_id: comment.authorId, content: comment.content }).abortSignal(AbortSignal.timeout(5000));
    }
    async _deleteFeedCloud(feedId, authorId) {
        await supabaseClient.from('posts').delete().eq('id', feedId).eq('author_id', authorId).abortSignal(AbortSignal.timeout(5000));
    }
    async _deleteBoardCloud(boardId, authorId) {
        await supabaseClient.from('messages').delete().eq('id', boardId).eq('author_id', authorId).abortSignal(AbortSignal.timeout(5000));
    }
    async _deleteAlbumPhotoCloud(photoId, authorId) {
        await supabaseClient.from('photos').delete().eq('id', photoId).eq('author_id', authorId).abortSignal(AbortSignal.timeout(5000));
    }
    async _updateFeedCloud(feedId, authorId, newContent) {
        await supabaseClient.from('posts').update({ content: newContent }).eq('id', feedId).eq('author_id', authorId).abortSignal(AbortSignal.timeout(5000));
    }
    async _updateBoardCloud(boardId, authorId, newContent) {
        await supabaseClient.from('messages').update({ content: newContent }).eq('id', boardId).eq('author_id', authorId).abortSignal(AbortSignal.timeout(5000));
    }

    // ==================== 成员 ====================
    getMember(memberId) { return MEMBERS.find(m => m.id === memberId) || MEMBERS[0]; }
    async getMemberFeed(memberId) { const f = await this.getFeed(); return f.filter(x => x.authorId === memberId); }
    async getMemberAlbum(memberId) { const a = await this.getAlbum(); return a.filter(x => x.authorId === memberId); }
    async getMemberBoard(memberId) { const b = await this.getBoard(); return b.filter(x => x.authorId === memberId); }

    async getAlbumByCategory(category) {
        const album = await this.getAlbum();
        return category === 'all' ? album : album.filter(a => a.category === category);
    }

    async getTimelineData(year = 'all', month = 'all') {
        const [feed, album, board] = await Promise.all([this.getFeed(), this.getAlbum(), this.getBoard()]);
        let items = [...feed.map(f=>({...f,type:'feed'})), ...album.map(a=>({...a,type:'album'})), ...board.map(b=>({...b,type:'board'}))];
        items.sort((a,b)=>b.time-a.time);
        if (year!=='all') items = items.filter(i => new Date(i.time).getFullYear() === parseInt(year));
        if (month!=='all') items = items.filter(i => new Date(i.time).getMonth()+1 === parseInt(month));
        const grouped = {};
        items.forEach(i => {
            const d = new Date(i.time), key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
            if(!grouped[key]) grouped[key] = { year: d.getFullYear(), month: d.getMonth()+1, items: [] };
            grouped[key].items.push(i);
        });
        return grouped;
    }
    async getYears() {
        const [feed, album, board] = await Promise.all([this.getFeed(), this.getAlbum(), this.getBoard()]);
        return [...new Set([...feed,...album,...board].map(i => new Date(i.time).getFullYear()))].sort((a,b)=>b-a);
    }

    // ==================== localStorage 操作 ====================
    getLocalFeed() { try { return JSON.parse(localStorage.getItem('house_feed')||'[]'); } catch { return []; } }
    addLocalFeed(post) { const f = this.getLocalFeed(); post.id = Date.now(); post.time = Date.now(); post.likes = post.likes || []; post.comments = post.comments || []; f.unshift(post); localStorage.setItem('house_feed', JSON.stringify(f)); return post; }
    toggleLocalLike(feedId, authorId) { const f = this.getLocalFeed(); const i = f.findIndex(x=>x.id===feedId); if(i!==-1){ const li = f[i].likes.indexOf(authorId); if(li===-1) f[i].likes.push(authorId); else f[i].likes.splice(li,1); localStorage.setItem('house_feed', JSON.stringify(f)); } }
    addLocalComment(feedId, comment) { const f = this.getLocalFeed(); const i = f.findIndex(x=>x.id===feedId); if(i!==-1){ comment.time = Date.now(); f[i].comments.push(comment); localStorage.setItem('house_feed', JSON.stringify(f)); } return comment; }
    deleteLocalFeed(feedId, authorId) { const f = this.getLocalFeed().filter(x=>!(x.id===feedId&&x.authorId===authorId)); localStorage.setItem('house_feed', JSON.stringify(f)); }
    updateLocalFeed(feedId, authorId, newContent) { const f = this.getLocalFeed(); const p = f.find(x=>x.id===feedId&&x.authorId===authorId); if(p){ p.content=newContent; localStorage.setItem('house_feed',JSON.stringify(f)); return true; } return false; }
    getLocalAlbum() { try { return JSON.parse(localStorage.getItem('house_album')||'[]'); } catch { return []; } }
    addLocalPhoto(photo) { const a = this.getLocalAlbum(); photo.id = Date.now(); photo.time = Date.now(); a.unshift(photo); localStorage.setItem('house_album', JSON.stringify(a)); return photo; }
    deleteLocalPhoto(photoId, authorId) { const a = this.getLocalAlbum().filter(x=>!(x.id===photoId&&x.authorId===authorId)); localStorage.setItem('house_album', JSON.stringify(a)); }
    getLocalBoard() { try { return JSON.parse(localStorage.getItem('house_board')||'[]'); } catch { return []; } }
    addLocalBoard(msg) { const b = this.getLocalBoard(); msg.id = Date.now(); msg.time = Date.now(); b.unshift(msg); localStorage.setItem('house_board', JSON.stringify(b)); return msg; }
    deleteLocalBoard(boardId, authorId) { const b = this.getLocalBoard().filter(x=>!(x.id===boardId&&x.authorId===authorId)); localStorage.setItem('house_board', JSON.stringify(b)); }
    updateLocalBoard(boardId, authorId, newContent) { const b = this.getLocalBoard(); const m = b.find(x=>x.id===boardId&&x.authorId===authorId); if(m){ m.content=newContent; localStorage.setItem('house_board',JSON.stringify(b)); return true; } return false; }

}

const dataStore = new DataStore();
