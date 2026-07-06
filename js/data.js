/* ==================== Supabase 数据管理 ==================== */

// 初始化 Supabase 客户端
const isSupabaseConfigured = SUPABASE_URL && !SUPABASE_URL.includes('你的');
let supabaseClient = null;

if (isSupabaseConfigured && window.supabase) {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ==================== 示例成员数据 ====================
const MEMBERS = [
    {
        id: 1,
        name: '米奇',
        emoji: '🐭',
        title: '群主·小屋创始人',
        desc: '最爱你们的米奇，giaogiao屋的灵魂人物',
        joinDate: '2024-01-01',
        motto: '有你们在，每天都是好日子'
    },
    {
        id: 2,
        name: '小橘',
        emoji: '🍊',
        title: '气氛担当',
        desc: '有小橘在的地方就有欢笑',
        joinDate: '2024-01-01',
        motto: '快乐就是和你们在一起'
    },
    {
        id: 3,
        name: '奶茶',
        emoji: '🧋',
        title: '美食雷达',
        desc: '永远在找好吃的路上',
        joinDate: '2024-01-01',
        motto: '没有什么是一杯奶茶解决不了的'
    },
    {
        id: 4,
        name: '星星',
        emoji: '⭐',
        title: '摄影大师',
        desc: '记录生活中的每个美好瞬间',
        joinDate: '2024-01-01',
        motto: '生活需要仪式感'
    },
    {
        id: 5,
        name: '月亮',
        emoji: '🌙',
        title: '深夜陪伴',
        desc: '夜晚最温暖的陪伴者',
        joinDate: '2024-01-01',
        motto: '晚安是最好的情话'
    },
    {
        id: 6,
        name: '小熊',
        emoji: '🐻',
        title: '治愈系',
        desc: '温柔可爱的小熊，给你最暖的拥抱',
        joinDate: '2024-01-01',
        motto: '抱抱你，一切都会好的'
    },
    {
        id: 7,
        name: '西瓜',
        emoji: '🍉',
        title: '夏日清凉',
        desc: '甜甜的西瓜，甜甜的夏天',
        joinDate: '2024-01-01',
        motto: '夏天和西瓜最配了'
    },
    {
        id: 8,
        name: '猫咪',
        emoji: '🐱',
        title: '慵懒日常',
        desc: '像猫一样享受生活的每一刻',
        joinDate: '2024-01-01',
        motto: '今日份的慵懒已上线'
    },
    {
        id: 9,
        name: '小兔',
        emoji: '🐰',
        title: '可爱担当',
        desc: '蹦蹦跳跳的小兔子',
        joinDate: '2024-01-01',
        motto: '每天都元气满满'
    },
    {
        id: 10,
        name: '小鱼',
        emoji: '🐟',
        title: '自由灵魂',
        desc: '像鱼一样自由自在',
        joinDate: '2024-01-01',
        motto: '生活不止眼前的苟且'
    }
];

// ==================== 小屋信息 ====================
const HOUSE_INFO = {
    name: '米奇giaogiao屋',
    slogan: '无关热闹，只关偏爱',
    createDate: '2024-01-01',
    description: '米奇giaogiao屋，一个十人小团体，无关热闹，只关偏爱，记录岁岁年年的陪伴，珍藏所有不被辜负的日常。'
};

// ==================== Supabase 数据操作类 ====================
class DataStore {
    constructor() {
        this.profiles = new Map(); // user_id -> member_id
        this.ready = false;
    }

    // 初始化
    async init() {
        if (!supabaseClient) return;
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            await this.loadProfiles();
            this.ready = true;
        }
    }

    // 加载所有用户档案
    async loadProfiles() {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('id, member_id');
        if (!error && data) {
            this.profiles.clear();
            data.forEach(p => this.profiles.set(p.id, p.member_id));
        }
    }

    // 获取 member_id from user_id
    getMemberId(userId) {
        return this.profiles.get(userId) || 0;
    }

    // ==================== 动态 (Feed) ====================

    async getFeed() {
        if (!supabaseClient) return this.getLocalFeed();

        const { data: posts, error } = await supabaseClient
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) { console.error('getFeed error:', error); return []; }
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
            likesByPost[l.post_id].push(this.getMemberId(l.user_id));
        });

        const commentsByPost = {};
        (comments || []).forEach(c => {
            if (!commentsByPost[c.post_id]) commentsByPost[c.post_id] = [];
            commentsByPost[c.post_id].push({
                authorId: this.getMemberId(c.user_id),
                content: c.content,
                time: new Date(c.created_at).getTime()
            });
        });

        return posts.map(post => ({
            id: post.id,
            authorId: this.getMemberId(post.user_id),
            content: post.content,
            images: post.images || [],
            likes: likesByPost[post.id] || [],
            comments: commentsByPost[post.id] || [],
            time: new Date(post.created_at).getTime()
        }));
    }

    async addFeed(post) {
        if (!supabaseClient) return this.addLocalFeed(post);

        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) return null;

        const { data, error } = await supabaseClient
            .from('posts')
            .insert({
                user_id: session.user.id,
                content: post.content,
                images: post.images || []
            })
            .select()
            .single();

        if (error) { console.error('addFeed error:', error); return null; }

        return {
            id: data.id,
            authorId: this.getMemberId(data.user_id),
            content: data.content,
            images: data.images || [],
            likes: [],
            comments: [],
            time: new Date(data.created_at).getTime()
        };
    }

    async likeFeed(feedId, userId) {
        if (!supabaseClient) return this.toggleLocalLike(feedId, userId);

        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) return null;

        // 检查是否已点赞
        const { data: existing } = await supabaseClient
            .from('likes')
            .select('*')
            .eq('post_id', feedId)
            .eq('user_id', session.user.id)
            .single();

        if (existing) {
            // 取消点赞
            await supabaseClient
                .from('likes')
                .delete()
                .eq('post_id', feedId)
                .eq('user_id', session.user.id);
        } else {
            // 点赞
            await supabaseClient
                .from('likes')
                .insert({
                    post_id: feedId,
                    user_id: session.user.id
                });
        }

        return true;
    }

    async addComment(feedId, comment) {
        if (!supabaseClient) return this.addLocalComment(feedId, comment);

        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) return null;

        const { data, error } = await supabaseClient
            .from('comments')
            .insert({
                post_id: feedId,
                user_id: session.user.id,
                content: comment.content
            })
            .select()
            .single();

        if (error) { console.error('addComment error:', error); return null; }

        return {
            authorId: this.getMemberId(data.user_id),
            content: data.content,
            time: new Date(data.created_at).getTime()
        };
    }

    async deleteFeed(feedId) {
        if (!supabaseClient) return this.deleteLocalFeed(feedId);

        const { error } = await supabaseClient
            .from('posts')
            .delete()
            .eq('id', feedId);

        if (error) console.error('deleteFeed error:', error);
    }

    // ==================== 相册 (Album) ====================

    async getAlbum() {
        if (!supabaseClient) return this.getLocalAlbum();

        const { data, error } = await supabaseClient
            .from('photos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) { console.error('getAlbum error:', error); return []; }

        return (data || []).map(photo => ({
            id: photo.id,
            authorId: this.getMemberId(photo.user_id),
            category: photo.category,
            desc: photo.description || '',
            image: photo.image_url,
            time: new Date(photo.created_at).getTime()
        }));
    }

    async getAlbumByCategory(category) {
        const album = await this.getAlbum();
        if (category === 'all') return album;
        return album.filter(a => a.category === category);
    }

    async addAlbumPhoto(photo) {
        if (!supabaseClient) return this.addLocalPhoto(photo);

        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) return null;

        const { data, error } = await supabaseClient
            .from('photos')
            .insert({
                user_id: session.user.id,
                category: photo.category,
                description: photo.desc || '',
                image_url: photo.image
            })
            .select()
            .single();

        if (error) { console.error('addAlbumPhoto error:', error); return null; }

        return {
            id: data.id,
            authorId: this.getMemberId(data.user_id),
            category: data.category,
            desc: data.description,
            image: data.image_url,
            time: new Date(data.created_at).getTime()
        };
    }

    async deleteAlbumPhoto(photoId) {
        if (!supabaseClient) return this.deleteLocalPhoto(photoId);

        const { error } = await supabaseClient
            .from('photos')
            .delete()
            .eq('id', photoId);

        if (error) console.error('deleteAlbumPhoto error:', error);
    }

    // ==================== 留言板 (Board) ====================

    async getBoard() {
        if (!supabaseClient) return this.getLocalBoard();

        const { data, error } = await supabaseClient
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) { console.error('getBoard error:', error); return []; }

        return (data || []).map(msg => ({
            id: msg.id,
            authorId: this.getMemberId(msg.user_id),
            content: msg.content,
            time: new Date(msg.created_at).getTime()
        }));
    }

    async addBoard(message) {
        if (!supabaseClient) return this.addLocalBoard(message);

        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) return null;

        const { data, error } = await supabaseClient
            .from('messages')
            .insert({
                user_id: session.user.id,
                content: message.content
            })
            .select()
            .single();

        if (error) { console.error('addBoard error:', error); return null; }

        return {
            id: data.id,
            authorId: this.getMemberId(data.user_id),
            content: data.content,
            time: new Date(data.created_at).getTime()
        };
    }

    async deleteBoard(boardId) {
        if (!supabaseClient) return this.deleteLocalBoard(boardId);

        const { error } = await supabaseClient
            .from('messages')
            .delete()
            .eq('id', boardId);

        if (error) console.error('deleteBoard error:', error);
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

    // ==================== 图片上传 ====================

    async uploadImage(file) {
        if (!supabaseClient) {
            // 离线模式：转成 base64
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
        }

        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) return '';

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `${session.user.id}/${fileName}`;

        const { error: uploadError } = await supabaseClient.storage
            .from('images')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Image upload error:', uploadError);
            // 降级为 base64
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
        }

        const { data: { publicUrl } } = supabaseClient.storage
            .from('images')
            .getPublicUrl(filePath);

        return publicUrl;
    }

    // ==================== 认证相关 ====================

    async signUp(email, password, memberId) {
        if (!supabaseClient) throw new Error('Supabase 未配置');

        // 注册用户
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password
        });

        if (error) throw error;
        if (!data.user) throw new Error('注册失败');

        // 创建档案
        const { error: profileError } = await supabaseClient
            .from('profiles')
            .insert({
                id: data.user.id,
                member_id: memberId,
                email: email
            });

        if (profileError) throw profileError;

        await this.loadProfiles();
        return data.user;
    }

    async signIn(email, password) {
        if (!supabaseClient) throw new Error('Supabase 未配置');

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        await this.loadProfiles();
        return data.user;
    }

    async signOut() {
        if (!supabaseClient) return;
        await supabaseClient.auth.signOut();
        this.profiles.clear();
        this.ready = false;
    }

    async getCurrentUser() {
        if (!supabaseClient) return null;
        const { data: { session } } = await supabaseClient.auth.getSession();
        return session ? session.user : null;
    }

    async getCurrentMemberId() {
        const user = await this.getCurrentUser();
        if (!user) return 0;
        return this.getMemberId(user.id);
    }

    // ==================== 种子数据 ====================

    async seedSampleData() {
        if (!supabaseClient) return;

        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) return;

        // 检查是否已有数据
        const { count } = await supabaseClient
            .from('posts')
            .select('*', { count: 'exact', head: true });

        if (count > 0) return; // 已有数据，不重复播种

        const userId = session.user.id;
        const now = Date.now();

        // 示例动态
        const posts = [
            {
                user_id: userId,
                content: '欢迎来到米奇giaogiao屋！这里是我们十个人的专属小窝，以后所有的日常、照片、碎碎念都可以存在这里啦～',
                images: [],
                created_at: new Date(now - 100000).toISOString()
            },
            {
                user_id: userId,
                content: '今天天气好好，和小橘一起去了公园散步，拍了好多照片！分享给大家看看～',
                images: ['https://picsum.photos/400/400?random=1', 'https://picsum.photos/400/400?random=2'],
                created_at: new Date(now - 200000).toISOString()
            },
            {
                user_id: userId,
                content: '深夜碎碎念：今天工作好累，但是想到有你们这群朋友就觉得一切都值得了。晚安，好梦～🌙',
                images: [],
                created_at: new Date(now - 300000).toISOString()
            }
        ];

        for (const post of posts) {
            await supabaseClient.from('posts').insert(post);
        }

        // 示例留言
        const messages = [
            {
                user_id: userId,
                content: '小屋正式成立啦！希望我们能一直一直在一起，记录所有美好的瞬间。爱你们！❤️',
                created_at: new Date(now - 50000).toISOString()
            },
            {
                user_id: userId,
                content: '今天入群一周年纪念日，感谢遇见你们每一个人都那么好～',
                created_at: new Date(now - 150000).toISOString()
            }
        ];

        for (const msg of messages) {
            await supabaseClient.from('messages').insert(msg);
        }

        console.log('✅ 种子数据已播种');
    }

    // ==================== 降级：本地 localStorage 操作（Supabase 未配置时使用）====================

    getLocalFeed() {
        try {
            return JSON.parse(localStorage.getItem('house_feed') || '[]');
        } catch { return []; }
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

    toggleLocalLike(feedId, userId) {
        const feed = this.getLocalFeed();
        const index = feed.findIndex(f => f.id === feedId);
        if (index !== -1) {
            const likeIndex = feed[index].likes.indexOf(userId);
            if (likeIndex === -1) feed[index].likes.push(userId);
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

    // 初始化本地种子数据
    initLocalSeedData() {
        if (localStorage.getItem('house_feed')) return;

        const sampleFeed = [
            { id: Date.now() - 100000, authorId: 1, content: '欢迎来到米奇giaogiao屋！这里是我们十个人的专属小窝～', images: [], likes: [2, 3, 4, 5], comments: [{ authorId: 2, content: '终于有自己的小屋了！太棒了', time: Date.now() - 90000 }, { authorId: 3, content: '以后再也不用担心聊天记录过期了', time: Date.now() - 80000 }], time: Date.now() - 100000 },
            { id: Date.now() - 200000, authorId: 2, content: '今天天气好好，和小橘一起去了公园散步！', images: ['https://picsum.photos/400/400?random=1', 'https://picsum.photos/400/400?random=2'], likes: [1, 3, 5], comments: [{ authorId: 4, content: '好美啊！下次一起去', time: Date.now() - 190000 }], time: Date.now() - 200000 },
            { id: Date.now() - 300000, authorId: 5, content: '深夜碎碎念：今天工作好累，但是想到有你们这群朋友就觉得一切都值得了。晚安🌙', images: [], likes: [1, 2, 3, 4, 6, 7, 8, 9, 10], comments: [{ authorId: 6, content: '抱抱月亮，明天会更好的', time: Date.now() - 290000 }], time: Date.now() - 300000 }
        ];

        const sampleAlbum = [
            { id: Date.now() - 100000, authorId: 1, category: 'party', desc: '第一次全员聚餐合影', image: 'https://picsum.photos/400/400?random=10', time: Date.now() - 100000 },
            { id: Date.now() - 200000, authorId: 3, category: 'daily', desc: '今天的下午茶', image: 'https://picsum.photos/400/400?random=11', time: Date.now() - 200000 },
            { id: Date.now() - 300000, authorId: 2, category: 'funny', desc: '小橘的搞笑表情', image: 'https://picsum.photos/400/400?random=12', time: Date.now() - 300000 }
        ];

        const sampleBoard = [
            { id: Date.now() - 50000, authorId: 1, content: '小屋正式成立啦！希望我们能一直一直在一起❤️', time: Date.now() - 50000 },
            { id: Date.now() - 150000, authorId: 6, content: '今天入群一周年，感谢遇见你们每一个人～', time: Date.now() - 150000 }
        ];

        localStorage.setItem('house_feed', JSON.stringify(sampleFeed));
        localStorage.setItem('house_album', JSON.stringify(sampleAlbum));
        localStorage.setItem('house_board', JSON.stringify(sampleBoard));
    }
}

// 创建全局数据存储实例
const dataStore = new DataStore();
