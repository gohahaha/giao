/* ==================== Supabase 数据管理 ==================== */

// 初始化 Supabase 客户端
const isSupabaseConfigured = SUPABASE_URL && !SUPABASE_URL.includes('你的');
let supabaseClient = null;

if (isSupabaseConfigured && window.supabase) {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ==================== 成员数据（真实姓名+生日） ====================
const MEMBERS = [
    {
        id: 1,
        name: '杨婷',
        birthday: '0107',
        account: '20260107',
        role: '管理员',
        title: '小屋管家',
        desc: '细心体贴的大姐姐，把小屋打理得井井有条',
        joinDate: '2024-01-01',
        motto: '生活的美好在于每一天的陪伴'
    },
    {
        id: 2,
        name: '蒋旗',
        birthday: '0209',
        account: '20260209',
        role: '成员',
        title: '气氛担当',
        desc: '有蒋旗在的地方就有欢笑和段子',
        joinDate: '2024-01-01',
        motto: '快乐就是和你们在一起'
    },
    {
        id: 3,
        name: '刘雯静',
        birthday: '0317',
        account: '20260317',
        role: '成员',
        title: '美食雷达',
        desc: '永远在发现好吃的路上，群里吃货代表',
        joinDate: '2024-01-01',
        motto: '没有什么是一顿美食解决不了的'
    },
    {
        id: 4,
        name: '陈利勇',
        birthday: '0507',
        account: '20260507',
        role: '成员',
        title: '技术达人',
        desc: '电脑问题找他准没错，靠谱的技术担当',
        joinDate: '2024-01-01',
        motto: '办法总比困难多'
    },
    {
        id: 5,
        name: '李璨江',
        birthday: '0518',
        account: '20260518',
        role: '群主',
        title: '群主·小屋创始人',
        desc: '米奇giaogiao屋的灵魂人物，把大家都聚在一起',
        joinDate: '2024-01-01',
        motto: '有你们在，每天都是好日子'
    },
    {
        id: 6,
        name: '王一平',
        birthday: '0702',
        account: '20260702',
        role: '成员',
        title: '摄影大师',
        desc: '朋友圈摄影师，记录生活中的每一个美好瞬间',
        joinDate: '2024-01-01',
        motto: '生活需要仪式感'
    },
    {
        id: 7,
        name: '夏涛',
        birthday: '0723',
        account: '20260723',
        role: '成员',
        title: '运动健将',
        desc: '篮球游泳样样行，永远活力满满',
        joinDate: '2024-01-01',
        motto: '生命在于运动'
    },
    {
        id: 8,
        name: '简诗语',
        birthday: '0727',
        account: '20260727',
        role: '成员',
        title: '文艺青年',
        desc: '喜欢读书写诗，用文字温暖每个人的心',
        joinDate: '2024-01-01',
        motto: '诗意地栖居在这片大地上'
    },
    {
        id: 9,
        name: '吕鹏',
        birthday: '0826',
        account: '20260826',
        role: '成员',
        title: '深夜陪伴',
        desc: '夜晚最活跃的那个人，失眠患者互助协会会长',
        joinDate: '2024-01-01',
        motto: '晚安是最好的情话'
    },
    {
        id: 10,
        name: '蒋志星',
        birthday: '1013',
        account: '20261013',
        role: '成员',
        title: '治愈担当',
        desc: '温柔细心，总能察觉到谁不开心并送上安慰',
        joinDate: '2024-01-01',
        motto: '抱抱你，一切都会好的'
    },
    {
        id: 11,
        name: '吕楚钰',
        birthday: '1104',
        account: '20261104',
        role: '成员',
        title: '可爱担当',
        desc: '元气满满，像小太阳一样温暖着每一个人',
        joinDate: '2024-01-01',
        motto: '每天都元气满满'
    },
    {
        id: 12,
        name: '吕佳怡',
        birthday: '1114',
        account: '20261114',
        role: '成员',
        title: '自由灵魂',
        desc: '随性洒脱，说走就走的旅行达人',
        joinDate: '2024-01-01',
        motto: '生活不止眼前的苟且'
    }
];

// 成员头像颜色表（每人一个专属颜色）
const MEMBER_COLORS = [
    '#E8734A', '#3B82F6', '#10B981', '#8B5CF6',
    '#C41E3A', '#F59E0B', '#06B6D4', '#EC4899',
    '#6366F1', '#14B8A6', '#F97316', '#84CC16'
];

// ==================== 小屋信息 ====================
const HOUSE_INFO = {
    name: '米奇giaogiao屋',
    slogan: '无关热闹，只关偏爱',
    createDate: '2024-01-01',
    description: '米奇giaogiao屋，一个十二人小团体，无关热闹，只关偏爱，记录岁岁年年的陪伴，珍藏所有不被辜负的日常。'
};

// ==================== 本地登录验证 ====================
function verifyLogin(memberId, password) {
    const member = MEMBERS.find(m => m.id === memberId);
    if (!member) return false;
    return member.account === password;
}

// ==================== 头像生成 ====================
function getMemberAvatarHTML(member) {
    const color = MEMBER_COLORS[(member.id - 1) % MEMBER_COLORS.length];
    const initial = member.name.charAt(0);
    return `<span class="name-avatar" style="background-color:${color}">${initial}</span>`;
}

// ==================== 数据操作类（Supabase 优先 + localStorage 降级）====================
class DataStore {
    constructor() {
        this.useCloud = !!supabaseClient;
    }

    // ==================== 动态 (Feed) ====================

    async getFeed() {
        if (!this.useCloud) return this.getLocalFeed();

        try {
            // 获取动态
            const { data: posts, error } = await supabaseClient
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (!posts || posts.length === 0) return [];

            const postIds = posts.map(p => p.id);

            // 批量获取点赞
            const { data: likes } = await supabaseClient
                .from('likes')
                .select('*')
                .in('post_id', postIds);

            // 批量获取评论
            const { data: comments } = await supabaseClient
                .from('comments')
                .select('*')
                .in('post_id', postIds)
                .order('created_at', { ascending: true });

            const likesByPost = {};
            (likes || []).forEach(l => {
                if (!likesByPost[l.post_id]) likesByPost[l.post_id] = [];
                likesByPost[l.post_id].push(l.author_id);
            });

            const commentsByPost = {};
            (comments || []).forEach(c => {
                if (!commentsByPost[c.post_id]) commentsByPost[c.post_id] = [];
                commentsByPost[c.post_id].push({
                    id: c.id,
                    authorId: c.author_id,
                    content: c.content,
                    time: new Date(c.created_at).getTime()
                });
            });

            return posts.map(post => ({
                id: post.id,
                authorId: post.author_id,
                content: post.content,
                images: post.images || [],
                likes: likesByPost[post.id] || [],
                comments: commentsByPost[post.id] || [],
                time: new Date(post.created_at).getTime()
            }));
        } catch (err) {
            console.error('getFeed 云端失败，降级到本地:', err.message);
            return this.getLocalFeed();
        }
    }

    async addFeed(post) {
        if (!this.useCloud) return this.addLocalFeed(post);

        try {
            const { data, error } = await supabaseClient
                .from('posts')
                .insert({
                    author_id: post.authorId,
                    content: post.content,
                    images: post.images || []
                })
                .select()
                .single();

            if (error) throw error;

            return {
                id: data.id,
                authorId: data.author_id,
                content: data.content,
                images: data.images || [],
                likes: [],
                comments: [],
                time: new Date(data.created_at).getTime()
            };
        } catch (err) {
            console.error('addFeed 云端失败，降级到本地:', err.message);
            return this.addLocalFeed(post);
        }
    }

    async likeFeed(feedId, authorId) {
        if (!this.useCloud) return this.toggleLocalLike(feedId, authorId);

        try {
            // 检查是否已点赞
            const { data: existing } = await supabaseClient
                .from('likes')
                .select('*')
                .eq('post_id', feedId)
                .eq('author_id', authorId)
                .maybeSingle();

            if (existing) {
                await supabaseClient
                    .from('likes')
                    .delete()
                    .eq('post_id', feedId)
                    .eq('author_id', authorId);
            } else {
                await supabaseClient
                    .from('likes')
                    .insert({
                        post_id: feedId,
                        author_id: authorId
                    });
            }
            return true;
        } catch (err) {
            console.error('likeFeed 云端失败，降级到本地:', err.message);
            return this.toggleLocalLike(feedId, authorId);
        }
    }

    async addComment(feedId, comment) {
        if (!this.useCloud) return this.addLocalComment(feedId, comment);

        try {
            const { data, error } = await supabaseClient
                .from('comments')
                .insert({
                    post_id: feedId,
                    author_id: comment.authorId,
                    content: comment.content
                })
                .select()
                .single();

            if (error) throw error;

            return {
                id: data.id,
                authorId: data.author_id,
                content: data.content,
                time: new Date(data.created_at).getTime()
            };
        } catch (err) {
            console.error('addComment 云端失败，降级到本地:', err.message);
            return this.addLocalComment(feedId, comment);
        }
    }

    async deleteFeed(feedId) {
        if (!this.useCloud) return this.deleteLocalFeed(feedId);

        try {
            const { error } = await supabaseClient
                .from('posts')
                .delete()
                .eq('id', feedId);

            if (error) throw error;
        } catch (err) {
            console.error('deleteFeed 云端失败，降级到本地:', err.message);
            this.deleteLocalFeed(feedId);
        }
    }

    // ==================== 相册 (Album) ====================

    async getAlbum() {
        if (!this.useCloud) return this.getLocalAlbum();

        try {
            const { data, error } = await supabaseClient
                .from('photos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).map(photo => ({
                id: photo.id,
                authorId: photo.author_id,
                category: photo.category,
                desc: photo.description || '',
                image: photo.image_url,
                time: new Date(photo.created_at).getTime()
            }));
        } catch (err) {
            console.error('getAlbum 云端失败，降级到本地:', err.message);
            return this.getLocalAlbum();
        }
    }

    async getAlbumByCategory(category) {
        const album = await this.getAlbum();
        if (category === 'all') return album;
        return album.filter(a => a.category === category);
    }

    async addAlbumPhoto(photo) {
        if (!this.useCloud) return this.addLocalPhoto(photo);

        try {
            const { data, error } = await supabaseClient
                .from('photos')
                .insert({
                    author_id: photo.authorId,
                    category: photo.category,
                    description: photo.desc || '',
                    image_url: photo.image
                })
                .select()
                .single();

            if (error) throw error;

            return {
                id: data.id,
                authorId: data.author_id,
                category: data.category,
                desc: data.description,
                image: data.image_url,
                time: new Date(data.created_at).getTime()
            };
        } catch (err) {
            console.error('addAlbumPhoto 云端失败，降级到本地:', err.message);
            return this.addLocalPhoto(photo);
        }
    }

    async deleteAlbumPhoto(photoId) {
        if (!this.useCloud) return this.deleteLocalPhoto(photoId);

        try {
            const { error } = await supabaseClient
                .from('photos')
                .delete()
                .eq('id', photoId);

            if (error) throw error;
        } catch (err) {
            console.error('deleteAlbumPhoto 云端失败，降级到本地:', err.message);
            this.deleteLocalPhoto(photoId);
        }
    }

    // ==================== 留言板 (Board) ====================

    async getBoard() {
        if (!this.useCloud) return this.getLocalBoard();

        try {
            const { data, error } = await supabaseClient
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).map(msg => ({
                id: msg.id,
                authorId: msg.author_id,
                content: msg.content,
                time: new Date(msg.created_at).getTime()
            }));
        } catch (err) {
            console.error('getBoard 云端失败，降级到本地:', err.message);
            return this.getLocalBoard();
        }
    }

    async addBoard(message) {
        if (!this.useCloud) return this.addLocalBoard(message);

        try {
            const { data, error } = await supabaseClient
                .from('messages')
                .insert({
                    author_id: message.authorId,
                    content: message.content
                })
                .select()
                .single();

            if (error) throw error;

            return {
                id: data.id,
                authorId: data.author_id,
                content: data.content,
                time: new Date(data.created_at).getTime()
            };
        } catch (err) {
            console.error('addBoard 云端失败，降级到本地:', err.message);
            return this.addLocalBoard(message);
        }
    }

    async deleteBoard(boardId) {
        if (!this.useCloud) return this.deleteLocalBoard(boardId);

        try {
            const { error } = await supabaseClient
                .from('messages')
                .delete()
                .eq('id', boardId);

            if (error) throw error;
        } catch (err) {
            console.error('deleteBoard 云端失败，降级到本地:', err.message);
            this.deleteLocalBoard(boardId);
        }
    }

    // ==================== 成员相关 ====================

    getMember(memberId) {
        return MEMBERS.find(m => m.id === memberId) || MEMBERS[0];
    }

    async getMemberFeed(memberId) {
        const feed = await this.getFeed();
        return feed.filter(f => f.authorId === memberId);
    }

    async getMemberAlbum(memberId) {
        const album = await this.getAlbum();
        return album.filter(a => a.authorId === memberId);
    }

    async getMemberBoard(memberId) {
        const board = await this.getBoard();
        return board.filter(b => b.authorId === memberId);
    }

    // ==================== 时光轴 ====================

    async getTimelineData(year = 'all', month = 'all') {
        const [feed, album, board] = await Promise.all([
            this.getFeed(), this.getAlbum(), this.getBoard()
        ]);

        let allItems = [
            ...feed.map(f => ({ ...f, type: 'feed' })),
            ...album.map(a => ({ ...a, type: 'album' })),
            ...board.map(b => ({ ...b, type: 'board' }))
        ];

        allItems.sort((a, b) => b.time - a.time);

        if (year !== 'all') {
            allItems = allItems.filter(item => {
                const date = new Date(item.time);
                return date.getFullYear() === parseInt(year);
            });
        }

        if (month !== 'all') {
            allItems = allItems.filter(item => {
                const date = new Date(item.time);
                return date.getMonth() + 1 === parseInt(month);
            });
        }

        const grouped = {};
        allItems.forEach(item => {
            const date = new Date(item.time);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!grouped[key]) {
                grouped[key] = {
                    year: date.getFullYear(),
                    month: date.getMonth() + 1,
                    items: []
                };
            }
            grouped[key].items.push(item);
        });

        return grouped;
    }

    async getYears() {
        const [feed, album, board] = await Promise.all([
            this.getFeed(), this.getAlbum(), this.getBoard()
        ]);

        const years = new Set();
        [...feed, ...album, ...board].forEach(item => {
            years.add(new Date(item.time).getFullYear());
        });

        return Array.from(years).sort((a, b) => b - a);
    }

    // ==================== 图片上传（Supabase Storage 优先，base64 降级）====================

    async uploadImage(file) {
        if (!this.useCloud) {
            return this.uploadImageAsBase64(file);
        }

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
            const filePath = `public/${fileName}`;

            const { error: uploadError } = await supabaseClient.storage
                .from('images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabaseClient.storage
                .from('images')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (err) {
            console.error('图片上传云端失败，降级到 base64:', err.message);
            return this.uploadImageAsBase64(file);
        }
    }

    uploadImageAsBase64(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    }

    // ==================== 降级：本地 localStorage（Supabase 不可用时使用）====================

    getLocalFeed() {
        try { return JSON.parse(localStorage.getItem('house_feed') || '[]'); }
        catch { return []; }
    }

    addLocalFeed(post) {
        const feed = this.getLocalFeed();
        post.id = Date.now();
        post.time = Date.now();
        post.likes = [];
        post.comments = [];
        feed.unshift(post);
        localStorage.setItem('house_feed', JSON.stringify(feed));
        return post;
    }

    toggleLocalLike(feedId, authorId) {
        const feed = this.getLocalFeed();
        const index = feed.findIndex(f => f.id === feedId);
        if (index !== -1) {
            const likeIndex = feed[index].likes.indexOf(authorId);
            if (likeIndex === -1) feed[index].likes.push(authorId);
            else feed[index].likes.splice(likeIndex, 1);
            localStorage.setItem('house_feed', JSON.stringify(feed));
        }
    }

    addLocalComment(feedId, comment) {
        const feed = this.getLocalFeed();
        const index = feed.findIndex(f => f.id === feedId);
        if (index !== -1) {
            comment.time = Date.now();
            feed[index].comments.push(comment);
            localStorage.setItem('house_feed', JSON.stringify(feed));
        }
        return comment;
    }

    deleteLocalFeed(feedId) {
        const feed = this.getLocalFeed().filter(f => f.id !== feedId);
        localStorage.setItem('house_feed', JSON.stringify(feed));
    }

    getLocalAlbum() {
        try { return JSON.parse(localStorage.getItem('house_album') || '[]'); }
        catch { return []; }
    }

    addLocalPhoto(photo) {
        const album = this.getLocalAlbum();
        photo.id = Date.now();
        photo.time = Date.now();
        album.unshift(photo);
        localStorage.setItem('house_album', JSON.stringify(album));
        return photo;
    }

    deleteLocalPhoto(photoId) {
        const album = this.getLocalAlbum().filter(a => a.id !== photoId);
        localStorage.setItem('house_album', JSON.stringify(album));
    }

    getLocalBoard() {
        try { return JSON.parse(localStorage.getItem('house_board') || '[]'); }
        catch { return []; }
    }

    addLocalBoard(message) {
        const board = this.getLocalBoard();
        message.id = Date.now();
        message.time = Date.now();
        board.unshift(message);
        localStorage.setItem('house_board', JSON.stringify(board));
        return message;
    }

    deleteLocalBoard(boardId) {
        const board = this.getLocalBoard().filter(b => b.id !== boardId);
        localStorage.setItem('house_board', JSON.stringify(board));
    }

    // ==================== 初始化本地种子数据（首次使用时自动填充）====================
    initLocalSeedData() {
        if (localStorage.getItem('house_feed_seeded')) return;

        const sampleFeed = [
            { id: Date.now() - 100000, authorId: 5, content: '欢迎来到米奇giaogiao屋！这里是我们十二个人的专属小窝～以后所有的日常、照片、碎碎念都可以存在这里啦！', images: [], likes: [1, 2, 3, 4, 6], comments: [{ authorId: 2, content: '终于有自己的小屋了！太棒了！', time: Date.now() - 90000 }, { authorId: 3, content: '以后再也不用担心聊天记录过期了～', time: Date.now() - 80000 }], time: Date.now() - 100000 },
            { id: Date.now() - 200000, authorId: 6, content: '今天天气好好，出去拍了好多照片！分享给大家看看～📸', images: ['https://picsum.photos/400/400?random=1', 'https://picsum.photos/400/400?random=2'], likes: [5, 1, 7], comments: [{ authorId: 1, content: '好美啊！下次一起去拍照！', time: Date.now() - 190000 }], time: Date.now() - 200000 },
            { id: Date.now() - 300000, authorId: 9, content: '深夜碎碎念：今天工作好累，但是想到有你们这群朋友就觉得一切都值得了。晚安🌙', images: [], likes: [5, 1, 2, 3, 4, 6, 7, 8, 10, 11, 12], comments: [{ authorId: 10, content: '抱抱，明天会更好的！', time: Date.now() - 290000 }], time: Date.now() - 300000 }
        ];

        const sampleAlbum = [
            { id: Date.now() - 100000, authorId: 5, category: 'party', desc: '第一次全员聚餐合影！十二个人终于凑齐了！', image: 'https://picsum.photos/400/400?random=10', time: Date.now() - 100000 },
            { id: Date.now() - 200000, authorId: 3, category: 'daily', desc: '今天的下午茶，发现了一家超棒的店！', image: 'https://picsum.photos/400/400?random=11', time: Date.now() - 200000 },
            { id: Date.now() - 300000, authorId: 2, category: 'funny', desc: '哈哈哈哈哈哈哈这个表情绝了', image: 'https://picsum.photos/400/400?random=12', time: Date.now() - 300000 }
        ];

        const sampleBoard = [
            { id: Date.now() - 50000, authorId: 5, content: '小屋正式成立啦！希望我们十二个人能一直一直在一起，记录所有美好的瞬间。爱你们！❤️', time: Date.now() - 50000 },
            { id: Date.now() - 150000, authorId: 10, content: '今天入群一周年纪念日，感谢遇见你们每一个人都那么好～', time: Date.now() - 150000 }
        ];

        localStorage.setItem('house_feed', JSON.stringify(sampleFeed));
        localStorage.setItem('house_album', JSON.stringify(sampleAlbum));
        localStorage.setItem('house_board', JSON.stringify(sampleBoard));
        localStorage.setItem('house_feed_seeded', 'true');
    }
}

// 创建全局数据存储实例
const dataStore = new DataStore();
