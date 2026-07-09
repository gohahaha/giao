/* ==================== Supabase 数据管理 ==================== */

// 初始化 Supabase 客户端
const isSupabaseConfigured = SUPABASE_URL && !SUPABASE_URL.includes('你的');
let supabaseClient = null;

if (isSupabaseConfigured && window.supabase) {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ==================== 成员数据（真实姓名+生日） ====================
const MEMBERS = [
    { id: 1, name: '杨婷',   birthday: '0107', account: '20260107', role: '管理员', title: '小屋管家',     motto: '生活的美好在于每一天的陪伴' },
    { id: 2, name: '蒋旗',   birthday: '0209', account: '20260209', role: '成员',   title: '气氛担当',     motto: '快乐就是和你们在一起' },
    { id: 3, name: '刘雯静', birthday: '0317', account: '20260317', role: '成员',   title: '美食雷达',     motto: '没有什么是一顿美食解决不了的' },
    { id: 4, name: '陈利勇', birthday: '0507', account: '20260507', role: '成员',   title: '技术达人',     motto: '办法总比困难多' },
    { id: 5, name: '李璨江', birthday: '0518', account: '20260518', role: '群主',   title: '群主·小屋创始人', motto: '有你们在，每天都是好日子' },
    { id: 6, name: '王一平', birthday: '0702', account: '20260702', role: '成员',   title: '摄影大师',     motto: '生活需要仪式感' },
    { id: 7, name: '夏涛',   birthday: '0723', account: '20260723', role: '成员',   title: '运动健将',     motto: '生命在于运动' },
    { id: 8, name: '简诗语', birthday: '0727', account: '20260727', role: '成员',   title: '文艺青年',     motto: '诗意地栖居在这片大地上' },
    { id: 9, name: '吕鹏',   birthday: '0826', account: '20260826', role: '成员',   title: '深夜陪伴',     motto: '晚安是最好的情话' },
    { id: 10, name: '蒋志星', birthday: '1013', account: '20261013', role: '成员',  title: '治愈担当',     motto: '抱抱你，一切都会好的' },
    { id: 11, name: '吕楚钰', birthday: '1104', account: '20261104', role: '成员',  title: '可爱担当',     motto: '每天都元气满满' },
    { id: 12, name: '吕佳怡', birthday: '1114', account: '20261114', role: '成员',  title: '自由灵魂',     motto: '生活不止眼前的苟且' }
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
    const customAvatar = dataStore.getCustomAvatar(member.id);
    if (customAvatar) {
        // 如果是 emoji（长度 ≤ 4 且不含 /），显示为 emoji 头像
        if (customAvatar.length <= 4 && !customAvatar.includes('/') && !customAvatar.includes('.')) {
            return `<span class="name-avatar custom-emoji-avatar">${customAvatar}</span>`;
        }
        // 否则当作图片 URL
        return `<span class="name-avatar" style="background-image:url(${customAvatar});background-size:cover;background-position:center"><span style="opacity:0">${member.name.charAt(0)}</span></span>`;
    }
    const color = MEMBER_COLORS[(member.id - 1) % MEMBER_COLORS.length];
    return `<span class="name-avatar" style="background-color:${color}">${member.name.charAt(0)}</span>`;
}

// 获取成员的当前显示签名（自定义优先，否则用默认 motto）
function getMemberDisplayMotto(member) {
    return dataStore.getCustomMotto(member.id) || member.motto;
}

// 获取成员的当前显示标签（自定义优先，否则用默认 title）
function getMemberDisplayTitle(member) {
    return dataStore.getCustomTitle(member.id) || member.title;
}

// 获取成员的标签颜色（自定义优先，否则用默认成员色）
function getMemberTitleColor(member) {
    return dataStore.getCustomTitleColor(member.id) || MEMBER_COLORS[(member.id - 1) % MEMBER_COLORS.length];
}

// ==================== 数据操作类（localStorage 优先，Supabase 后台同步）====================
class DataStore {
    constructor() {
        this.useCloud = !!supabaseClient;
        this.cloudOk = false; // 确认 Supabase 连通后才用
        this._checkCloud();
        this._runCleanup();
    }

    _runCleanup() {
        // v5 清理：彻底清除所有旧数据，重新开始
        if (!localStorage.getItem('house_v5_final_cleanup')) {
            localStorage.removeItem('house_feed_seeded');
            localStorage.removeItem('house_feed');
            localStorage.removeItem('house_album');
            localStorage.removeItem('house_board');
            localStorage.removeItem('house_avatars');
            localStorage.removeItem('house_mottos');
            localStorage.removeItem('house_titles');
            localStorage.removeItem('house_title_colors');
            localStorage.setItem('house_v5_final_cleanup', 'true');
        }
    }

    async _checkCloud() {
        if (!this.useCloud) return;
        try {
            const { data, error } = await supabaseClient
                .from('posts').select('id').limit(1).abortSignal(AbortSignal.timeout(3000));
            if (!error) { this.cloudOk = true; console.log('☁️ Supabase 已连接'); }
        } catch (e) { console.log('📦 使用本地模式（Supabase 不可达）'); }
    }

    // 实时订阅：监听所有表变更，自动刷新 UI
    subscribeToChanges(onChange) {
        if (!this.useCloud || !supabaseClient) return;
        const channel = supabaseClient
            .channel('realtime-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
                console.log('🔄 动态更新:', payload.eventType);
                onChange('feed');
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, (payload) => {
                console.log('🔄 评论更新:', payload.eventType);
                onChange('feed');
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, (payload) => {
                console.log('🔄 点赞更新:', payload.eventType);
                onChange('feed');
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'photos' }, (payload) => {
                console.log('🔄 相册更新:', payload.eventType);
                onChange('album');
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
                console.log('🔄 留言更新:', payload.eventType);
                onChange('board');
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') console.log('🔔 实时消息已开启');
                else console.log('📡 实时消息状态:', status);
            });

        // 定期重连保活
        this._realtimeChannel = channel;
    }

    // 取消实时订阅
    unsubscribeChanges() {
        if (this._realtimeChannel) {
            supabaseClient.removeChannel(this._realtimeChannel);
            this._realtimeChannel = null;
        }
    }

    // ==================== 聊以室 ====================
    async getChat() {
        if (this.cloudOk) {
            try { const r = await this._getChatCloud(); if (r.length > 0) return r; } catch(e){}
        }
        return this.getLocalChat();
    }
    async addChatMessage(msg) {
        const result = this.addLocalChatMsg(msg);
        if (this.cloudOk) this._addChatMessageCloud(msg).catch(()=>{});
        return result;
    }
    async deleteChatMessage(msgId, authorId) {
        this.deleteLocalChatMsg(msgId, authorId);
        if (this.cloudOk) this._deleteChatMessageCloud(msgId, authorId).catch(()=>{});
    }

    // 聊以室实时订阅（仅 INSERT）
    subscribeToChat(onNewMessage) {
        if (!this.useCloud || !supabaseClient) return;
        this._chatChannel = supabaseClient
            .channel('realtime-chat')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
                console.log('💬 新聊天消息:', payload.new);
                const msg = {
                    id: payload.new.id,
                    authorId: payload.new.author_id,
                    content: payload.new.content,
                    time: new Date(payload.new.created_at).getTime()
                };
                // 避免重复（如果是自己发的，本地已有了）
                const local = this.getLocalChat();
                if (!local.find(m => m.id === msg.id)) {
                    this.addLocalChatMsgDirect(msg);
                    onNewMessage(msg);
                }
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') console.log('🔔 聊以室实时消息已开启');
                else console.log('📡 聊以室状态:', status);
            });
    }

    unsubscribeChat() {
        if (this._chatChannel) {
            supabaseClient.removeChannel(this._chatChannel);
            this._chatChannel = null;
        }
    }

    // 云端实现
    async _getChatCloud() {
        const { data, error } = await supabaseClient.from('chat_messages').select('*').order('created_at', { ascending: false }).limit(100).abortSignal(AbortSignal.timeout(5000));
        if (error || !data) return [];
        return data.map(m => ({ id: m.id, authorId: m.author_id, content: m.content, time: new Date(m.created_at).getTime() })).reverse();
    }
    async _addChatMessageCloud(msg) {
        const { error } = await supabaseClient.from('chat_messages').insert({ id: msg.id, author_id: msg.authorId, content: msg.content, created_at: new Date(msg.time).toISOString() }).abortSignal(AbortSignal.timeout(5000));
        if (error) console.error('❌ 聊天消息云端同步失败:', error.message, '(需在Supabase创建chat_messages表)');
    }
    async _deleteChatMessageCloud(msgId, authorId) {
        await supabaseClient.from('chat_messages').delete().eq('id', msgId).eq('author_id', authorId).abortSignal(AbortSignal.timeout(5000));
    }

    // 本地实现
    getLocalChat() { try { return JSON.parse(localStorage.getItem('house_chat')||'[]'); } catch { return []; } }
    addLocalChatMsg(msg) { const c = this.getLocalChat(); msg.id = Date.now(); msg.time = Date.now(); c.push(msg); localStorage.setItem('house_chat', JSON.stringify(c)); return msg; }
    addLocalChatMsgDirect(msg) { const c = this.getLocalChat(); c.push(msg); localStorage.setItem('house_chat', JSON.stringify(c)); }
    deleteLocalChatMsg(msgId, authorId) { const c = this.getLocalChat().filter(x=>!(x.id===msgId&&x.authorId===authorId)); localStorage.setItem('house_chat', JSON.stringify(c)); }

    // 数据读取：云端+本地合并（本地评论/点赞优先，避免刚提交的内容"消失"）
    async getFeed() {
        if (this.cloudOk) {
            try {
                const cloud = await this._getFeedCloud();
                const local = this.getLocalFeed();
                if (cloud.length > 0) {
                    // 合并：本地数据中更新鲜的评论/点赞覆盖云端数据
                    return cloud.map(cp => {
                        const lp = local.find(l => l.id === cp.id);
                        if (lp && (lp.comments.length > cp.comments.length || lp.likes.length > cp.likes.length)) {
                            return { ...cp, comments: lp.comments, likes: lp.likes };
                        }
                        return cp;
                    });
                }
            } catch(e){}
        }
        return this.getLocalFeed();
    }
    async getAlbum() {
        if (this.cloudOk) {
            try {
                const cloud = await this._getAlbumCloud();
                const local = this.getLocalAlbum();
                if (cloud.length > 0) {
                    // 合并：本地新上传的照片也显示
                    const cloudIds = new Set(cloud.map(c => c.id));
                    const localNotInCloud = local.filter(l => !cloudIds.has(l.id));
                    return [...localNotInCloud, ...cloud];
                }
            } catch(e){}
        }
        return this.getLocalAlbum();
    }
    async getBoard() {
        if (this.cloudOk) {
            try {
                const cloud = await this._getBoardCloud();
                const local = this.getLocalBoard();
                if (cloud.length > 0) {
                    const cloudIds = new Set(cloud.map(c => c.id));
                    const localNotInCloud = local.filter(l => !cloudIds.has(l.id));
                    return [...localNotInCloud, ...cloud];
                }
            } catch(e){}
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
        await supabaseClient.from('posts').insert({ id: post.id, author_id: post.authorId, content: post.content, images: post.images||[], created_at: new Date(post.time).toISOString() }).abortSignal(AbortSignal.timeout(5000));
    }
    async _addBoardCloud(msg) {
        await supabaseClient.from('messages').insert({ id: msg.id, author_id: msg.authorId, content: msg.content, created_at: new Date(msg.time).toISOString() }).abortSignal(AbortSignal.timeout(5000));
    }
    async _addAlbumPhotoCloud(photo) {
        await supabaseClient.from('photos').insert({ id: photo.id, author_id: photo.authorId, category: photo.category, description: photo.desc||'', image_url: photo.image, created_at: new Date(photo.time).toISOString() }).abortSignal(AbortSignal.timeout(5000));
    }
    async _likeFeedCloud(feedId, authorId) {
        const { data: ex } = await supabaseClient.from('likes').select('*').eq('post_id', feedId).eq('author_id', authorId).maybeSingle().abortSignal(AbortSignal.timeout(5000));
        if (ex) await supabaseClient.from('likes').delete().eq('post_id', feedId).eq('author_id', authorId).abortSignal(AbortSignal.timeout(5000));
        else await supabaseClient.from('likes').insert({ post_id: feedId, author_id: authorId }).abortSignal(AbortSignal.timeout(5000));
    }
    async _addCommentCloud(feedId, comment) {
        await supabaseClient.from('comments').insert({ post_id: feedId, author_id: comment.authorId, content: comment.content, created_at: new Date(comment.time).toISOString() }).abortSignal(AbortSignal.timeout(5000));
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

    // ==================== 自定义头像 & 签名 & 标签 ====================
    getAllCustomAvatars() { try { return JSON.parse(localStorage.getItem('house_avatars')||'{}'); } catch { return {}; } }
    getCustomAvatar(memberId) { const avatars = this.getAllCustomAvatars(); return avatars[memberId] || null; }
    saveCustomAvatar(memberId, avatar) { const avatars = this.getAllCustomAvatars(); avatars[memberId] = avatar; localStorage.setItem('house_avatars', JSON.stringify(avatars)); }
    getAllCustomMottos() { try { return JSON.parse(localStorage.getItem('house_mottos')||'{}'); } catch { return {}; } }
    getCustomMotto(memberId) { const mottos = this.getAllCustomMottos(); return mottos[memberId] || null; }
    saveCustomMotto(memberId, motto) { const mottos = this.getAllCustomMottos(); mottos[memberId] = motto; localStorage.setItem('house_mottos', JSON.stringify(mottos)); }
    getAllCustomTitles() { try { return JSON.parse(localStorage.getItem('house_titles')||'{}'); } catch { return {}; } }
    getCustomTitle(memberId) { const titles = this.getAllCustomTitles(); return titles[memberId] || null; }
    saveCustomTitle(memberId, title) { const titles = this.getAllCustomTitles(); titles[memberId] = title; localStorage.setItem('house_titles', JSON.stringify(titles)); }
    getAllCustomTitleColors() { try { return JSON.parse(localStorage.getItem('house_title_colors')||'{}'); } catch { return {}; } }
    getCustomTitleColor(memberId) { const colors = this.getAllCustomTitleColors(); return colors[memberId] || null; }
    saveCustomTitleColor(memberId, color) { const colors = this.getAllCustomTitleColors(); colors[memberId] = color; localStorage.setItem('house_title_colors', JSON.stringify(colors)); }

}

const dataStore = new DataStore();
