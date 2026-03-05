// ===== Blog Data =====
const blogData = {
    posts: [
        {
            id: 'hello-world',
            title: 'Hello World：全新博客重构上线',
            excerpt: '经过重新设计与开发，我的博客正式上线了。这篇文章记录了重构的动机、技术选型以及未来规划。',
            date: '2025-03-05',
            tags: ['随笔', '博客'],
            readTime: '3 分钟',
            content: `
                <header class="mb-8">
                    <div class="flex flex-wrap gap-2 mb-4">
                        <span class="px-2.5 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">随笔</span>
                        <span class="px-2.5 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">博客</span>
                    </div>
                    <h1 class="text-3xl sm:text-4xl font-bold mb-4">Hello World：全新博客重构上线</h1>
                    <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span class="flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            2025-03-05
                        </span>
                        <span class="flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            3 分钟阅读
                        </span>
                    </div>
                </header>

                <p>Hello World！这是我的全新博客的第一篇文章。</p>

                <h2>为什么要重构？</h2>
                <p>旧的博客已经运行了一段时间，但随着时间的推移，我意识到它需要进行一次彻底的改造：</p>
                <ul>
                    <li>界面风格已经过时，需要现代化的设计</li>
                    <li>移动端体验不佳，需要响应式布局</li>
                    <li>代码结构混乱，难以维护</li>
                    <li>缺少暗色模式，夜间阅读体验差</li>
                </ul>

                <h2>技术选型</h2>
                <p>这次重构采用了以下技术栈：</p>
                
                <h3>前端框架</h3>
                <p>使用原生 HTML5 + CSS3 + JavaScript，配合 <strong>Tailwind CSS</strong> CDN 版本。选择这种方案的原因是：</p>
                <ul>
                    <li>无需构建工具，代码可直接在浏览器运行</li>
                    <li>托管在 GitHub Pages 上，零成本部署</li>
                    <li>Tailwind 提供了现代化的工具类，开发效率高</li>
                </ul>

                <pre><code class="language-html">&lt;!-- 示例代码 --&gt;
&lt;div class="bg-blue-500 text-white p-4 rounded-lg"&gt;
    Hello, Tailwind!
&lt;/div&gt;</code></pre>

                <h3>设计亮点</h3>
                <ul>
                    <li><strong>左侧固定导航栏</strong>：桌面端提供沉浸式的阅读体验</li>
                    <li><strong>Light/Dark 主题切换</strong>：系统级主题适配，手动切换也支持</li>
                    <li><strong>代码高亮</strong>：使用 Highlight.js，支持多种编程语言</li>
                    <li><strong>响应式设计</strong>：Mobile-first，移动端有专属优化</li>
                </ul>

                <h2>未来规划</h2>
                <p>这个博客将持续更新，内容方向包括：</p>
                <ul>
                    <li>技术学习笔记与心得</li>
                    <li>项目实践经验分享</li>
                    <li>开发工具与效率提升</li>
                    <li>系统架构设计思考</li>
                </ul>

                <blockquote>
                    <p>"学习最好的方式是教别人，写博客就是一种教的方式。"</p>
                </blockquote>

                <h2>结语</h2>
                <p>感谢你的访问！如果你对我的文章有任何建议或想法，欢迎在 GitHub 上与我交流。</p>

                <p>让我们一起在技术的世界里探索和成长！🚀</p>
            `
        },
        {
            id: 'modern-frontend-2025',
            title: '2025 年前端开发趋势展望',
            excerpt: '回顾过去一年的前端技术发展，展望 2025 年的新趋势，包括框架演进、构建工具变化等。',
            date: '2025-03-01',
            tags: ['前端', 'JavaScript', '技术趋势'],
            readTime: '8 分钟',
            content: '<p>文章正在撰写中...</p>'
        },
        {
            id: 'docker-best-practices',
            title: 'Docker 容器化最佳实践',
            excerpt: '从实际项目经验出发，总结 Docker 容器化的最佳实践，包括镜像优化、安全加固等。',
            date: '2025-02-20',
            tags: ['Docker', 'DevOps', '云原生'],
            readTime: '12 分钟',
            content: '<p>文章正在撰写中...</p>'
        },
        {
            id: 'vim-workflow',
            title: '我的 Vim 工作流配置分享',
            excerpt: '分享我使用 Vim 进行开发的完整配置，包括插件选择、快捷键映射等。',
            date: '2025-02-10',
            tags: ['Vim', '效率工具', '编辑器'],
            readTime: '6 分钟',
            content: '<p>文章正在撰写中...</p>'
        },
        {
            id: 'git-tips',
            title: 'Git 高级技巧与避坑指南',
            excerpt: '整理日常开发中常用的 Git 高级技巧，以及容易踩坑的地方和解决方案。',
            date: '2025-01-28',
            tags: ['Git', '开发工具'],
            readTime: '10 分钟',
            content: '<p>文章正在撰写中...</p>'
        }
    ],
    
    tags: [
        { name: '前端', count: 12, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
        { name: 'JavaScript', count: 8, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
        { name: 'Docker', count: 5, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300' },
        { name: 'DevOps', count: 6, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
        { name: '云原生', count: 4, color: 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300' },
        { name: 'Vim', count: 3, color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
        { name: 'Git', count: 4, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
        { name: '随笔', count: 7, color: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300' },
        { name: '博客', count: 2, color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
        { name: '效率工具', count: 5, color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' },
        { name: '编辑器', count: 3, color: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300' },
        { name: '开发工具', count: 6, color: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300' },
        { name: '技术趋势', count: 3, color: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300' }
    ]
};

// ===== Theme Management =====
const ThemeManager = {
    init() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add('dark');
            this.updateHighlightTheme(true);
        } else {
            document.documentElement.classList.remove('dark');
            this.updateHighlightTheme(false);
        }
        
        this.bindEvents();
    },
    
    toggle() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        this.updateHighlightTheme(isDark);
    },
    
    updateHighlightTheme(isDark) {
        const lightStylesheet = document.getElementById('hljs-light');
        const darkStylesheet = document.getElementById('hljs-dark');
        
        if (lightStylesheet && darkStylesheet) {
            lightStylesheet.disabled = isDark;
            darkStylesheet.disabled = !isDark;
        }
    },
    
    bindEvents() {
        const themeToggle = document.getElementById('theme-toggle');
        const mobileThemeBtn = document.getElementById('mobile-theme-btn');
        
        themeToggle?.addEventListener('click', () => this.toggle());
        mobileThemeBtn?.addEventListener('click', () => this.toggle());
    }
};

// ===== Navigation =====
const Navigation = {
    init() {
        this.bindEvents();
        this.handleHashChange();
    },
    
    bindEvents() {
        // Mobile menu toggle
        const menuBtn = document.getElementById('mobile-menu-btn');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobile-overlay');
        
        menuBtn?.addEventListener('click', () => {
            sidebar?.classList.toggle('-translate-x-full');
            overlay?.classList.toggle('opacity-0');
            overlay?.classList.toggle('pointer-events-none');
        });
        
        overlay?.addEventListener('click', () => {
            sidebar?.classList.add('-translate-x-full');
            overlay?.classList.add('opacity-0');
            overlay?.classList.add('pointer-events-none');
        });
        
        // Nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href?.startsWith('#')) {
                    e.preventDefault();
                    window.location.hash = href;
                    
                    // Close mobile menu
                    sidebar?.classList.add('-translate-x-full');
                    overlay?.classList.add('opacity-0');
                    overlay?.classList.add('pointer-events-none');
                }
            });
        });
        
        // Hash change
        window.addEventListener('hashchange', () => this.handleHashChange());
        
        // Back to posts button
        document.getElementById('back-to-posts')?.addEventListener('click', () => {
            window.location.hash = '#posts';
        });
    },
    
    handleHashChange() {
        const hash = window.location.hash || '#home';
        const pageId = hash.replace('#', '').split('/')[0];
        
        // Update nav active state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${pageId}`) {
                link.classList.add('active');
            }
        });
        
        // Show/hide sections
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.add('hidden');
        });
        
        const targetSection = document.getElementById(pageId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            targetSection.classList.add('fade-in');
            
            // Re-apply syntax highlighting
            if (pageId === 'article') {
                document.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
            }
        } else if (pageId.startsWith('post/')) {
            // Handle individual post
            const postId = pageId.replace('post/', '');
            this.showArticle(postId);
        }
        
        // Scroll to top
        window.scrollTo(0, 0);
    },
    
    showArticle(postId) {
        const post = blogData.posts.find(p => p.id === postId);
        if (!post) {
            window.location.hash = '#posts';
            return;
        }
        
        // Hide all sections
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.add('hidden');
        });
        
        // Show article section
        const articleSection = document.getElementById('article');
        const articleContent = document.getElementById('article-content');
        
        if (articleSection && articleContent) {
            articleContent.innerHTML = post.content;
            articleSection.classList.remove('hidden');
            articleSection.classList.add('fade-in');
            
            // Apply syntax highlighting
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }
    }
};

// ===== Posts Manager =====
const PostsManager = {
    init() {
        this.renderFeaturedTags();
        this.renderRecentPosts();
        this.renderAllPosts();
        this.renderTagsCloud();
        this.bindEvents();
    },
    
    renderFeaturedTags() {
        const container = document.getElementById('featured-tags');
        if (!container) return;
        
        const featured = blogData.tags.slice(0, 8);
        container.innerHTML = featured.map(tag => `
            <a href="#posts" class="tag px-3 py-1.5 rounded-full text-sm font-medium ${tag.color}" data-tag="${tag.name}">
                ${tag.name}
            </a>
        `).join('');
    },
    
    renderRecentPosts() {
        const container = document.getElementById('recent-posts');
        if (!container) return;
        
        const recent = blogData.posts.slice(0, 3);
        container.innerHTML = recent.map(post => this.createPostCard(post, true)).join('');
    },
    
    renderAllPosts() {
        const container = document.getElementById('posts-grid');
        if (!container) return;
        
        container.innerHTML = blogData.posts.map(post => this.createPostCard(post)).join('');
    },
    
    createPostCard(post, compact = false) {
        if (compact) {
            return `
                <a href="#post/${post.id}" class="post-card block bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all">
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex-1 min-w-0">
                            <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">${post.title}</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">${post.excerpt}</p>
                            <div class="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-500">
                                <span>${post.date}</span>
                                <span>${post.readTime}</span>
                            </div>
                        </div>
                    </div>
                </a>
            `;
        }
        
        return `
            <article class="post-card bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 border border-gray-200 dark:border-gray-700">
                <div class="flex flex-wrap gap-2 mb-3">
                    ${post.tags.map(tag => {
                        const tagData = blogData.tags.find(t => t.name === tag) || { color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' };
                        return `<span class="px-2.5 py-1 rounded-full text-xs font-medium ${tagData.color}">${tag}</span>`;
                    }).join('')}
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    <a href="#post/${post.id}" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">${post.title}</a>
                </h3>
                <p class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">${post.excerpt}</p>
                <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
                    <div class="flex items-center gap-4">
                        <span class="flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            ${post.date}
                        </span>
                        <span class="flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            ${post.readTime}
                        </span>
                    </div>
                    <a href="#post/${post.id}" class="text-primary-600 dark:text-primary-400 hover:underline font-medium">阅读全文 →</a>
                </div>
            </article>
        `;
    },
    
    renderTagsCloud() {
        const container = document.getElementById('tags-cloud');
        if (!container) return;
        
        container.innerHTML = blogData.tags.map(tag => `
            <a href="#posts" class="tag px-4 py-2 rounded-full font-medium ${tag.color}" data-tag="${tag.name}">
                ${tag.name}
                <span class="ml-1.5 text-xs opacity-75">(${tag.count})</span>
            </a>
        `).join('');
    },
    
    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        searchInput?.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            this.filterPosts(query);
        });
        
        // Sort functionality
        const sortSelect = document.getElementById('sort-select');
        sortSelect?.addEventListener('change', (e) => {
            this.sortPosts(e.target.value);
        });
        
        // Tag filtering
        document.addEventListener('click', (e) => {
            const tag = e.target.closest('[data-tag]');
            if (tag) {
                const tagName = tag.dataset.tag;
                window.location.hash = '#posts';
                searchInput.value = tagName;
                this.filterPosts(tagName.toLowerCase());
            }
        });
    },
    
    filterPosts(query) {
        const container = document.getElementById('posts-grid');
        if (!container) return;
        
        const filtered = blogData.posts.filter(post => 
            post.title.toLowerCase().includes(query) ||
            post.excerpt.toLowerCase().includes(query) ||
            post.tags.some(tag => tag.toLowerCase().includes(query))
        );
        
        container.innerHTML = filtered.length > 0 
            ? filtered.map(post => this.createPostCard(post)).join('')
            : '<p class="text-center text-gray-500 dark:text-gray-400 py-8">没有找到匹配的文章</p>';
    },
    
    sortPosts(order) {
        const container = document.getElementById('posts-grid');
        if (!container) return;
        
        const sorted = [...blogData.posts].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return order === 'newest' ? dateB - dateA : dateA - dateB;
        });
        
        container.innerHTML = sorted.map(post => this.createPostCard(post)).join('');
    }
};

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    Navigation.init();
    PostsManager.init();
});
