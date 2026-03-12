// ============================================
// Premium Frontend Interactions
// ============================================

document.documentElement.classList.add('js-enhanced');

// Scroll Progress Bar with smooth update
function updateProgressBar() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.width = scrolled + '%';
    }
}

// Header scroll effect with blur enhancement
function updateHeader() {
    const header = document.getElementById('header');
    if (header) {
        if (window.pageYOffset > 80) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
}

// Reveal sections on scroll with stagger effect
function initScrollReveal() {
    const sections = document.querySelectorAll('.section');
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add stagger delay based on child index
                const children = entry.target.querySelectorAll('.fade-child');
                children.forEach((child, i) => {
                    setTimeout(() => {
                        child.classList.add('visible');
                    }, i * 100); // 100ms stagger between children
                });
                
                entry.target.classList.add('visible');
                sectionObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
}

// Smooth scroll for navigation links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Back to top and dark mode toggle visibility
function updateFloatingButtons() {
    const backToTop = document.getElementById('backToTop');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const scrollY = window.pageYOffset;
    
    if (backToTop) {
        if (scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }
    
    if (darkModeToggle) {
        if (scrollY > 300) {
            darkModeToggle.classList.add('visible');
        } else {
            darkModeToggle.classList.remove('visible');
        }
    }
}

// Scroll to top
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Theme toggle
const THEME_STORAGE_KEY = 'valueinvest-theme';
const THEME_COLORS = {
    dark: '#0a0a0a',
    light: '#f6efe2'
};

function updateThemeMeta(theme) {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', THEME_COLORS[theme]);
    }
    document.documentElement.style.colorScheme = theme;
}

function updateThemeToggle(theme) {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) return;

    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    darkModeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    darkModeToggle.setAttribute('aria-label', nextTheme === 'light' ? '切换到浅色模式' : '切换到深色模式');
    darkModeToggle.setAttribute('title', nextTheme === 'light' ? '切换到浅色模式' : '切换到深色模式');
}

function applyTheme(theme) {
    const normalizedTheme = theme === 'light' ? 'light' : 'dark';
    document.body.classList.toggle('dark-mode', normalizedTheme === 'dark');
    document.body.classList.toggle('light-mode', normalizedTheme === 'light');
    document.documentElement.setAttribute('data-theme', normalizedTheme);
    updateThemeMeta(normalizedTheme);
    updateThemeToggle(normalizedTheme);
}

function getStoredTheme() {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'dark';
}

function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    applyTheme(getStoredTheme());

    if (!darkModeToggle || darkModeToggle.dataset.themeBound === 'true') {
        return;
    }

    darkModeToggle.dataset.themeBound = 'true';
    darkModeToggle.addEventListener('click', () => {
        const nextTheme = document.body.classList.contains('light-mode') ? 'dark' : 'light';
        applyTheme(nextTheme);
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    });
}

// Lazy load images with fade-in effect
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        img.classList.add('loaded');
                    }
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '50px 0px', threshold: 0.01 });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback: load all images immediately
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
        });
    }
}

// Reading progress persistence
function saveReadingProgress() {
    const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );
    const path = location.pathname;
    localStorage.setItem(`reading-progress-${path}`, scrollPercent);
}

function restoreReadingProgress() {
    const saved = localStorage.getItem(`reading-progress-${location.pathname}`);
    if (saved && saved > 0 && saved < 100) {
        const scrollTo = (saved / 100) * (document.documentElement.scrollHeight - window.innerHeight);
        window.scrollTo({ top: scrollTo, behavior: 'auto' });
    }
}

// Throttle function for performance
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Initialize everything
const throttledScroll = throttle(() => {
    updateProgressBar();
    updateHeader();
    updateFloatingButtons();
    saveReadingProgress();
}, 100);

window.addEventListener('scroll', throttledScroll);

function decorateSectionsForReveal() {
    document.querySelectorAll('.section').forEach(section => {
        Array.from(section.children).forEach(child => {
            if (!child.classList.contains('section-header')) {
                child.classList.add('fade-child');
            }
        });
    });
}

function applyReducedMotionFallback() {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    document.documentElement.style.scrollBehavior = 'auto';
    document.querySelectorAll('.fade-child').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
    });
}

function initPage() {
    decorateSectionsForReveal();
    initScrollReveal();
    initSmoothScroll();
    initLazyLoading();
    initDarkMode();
    initSearch();
    updateProgressBar();
    updateHeader();
    updateFloatingButtons();
    applyReducedMotionFallback();

    // Restore reading position after DOM ready
    setTimeout(restoreReadingProgress, 150);
}

document.addEventListener('DOMContentLoaded', initPage, { once: true });

window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

// Console greeting
console.log('%c ValueInvest ', 'background: #d4af37; color: #000; font-size: 20px; font-weight: bold; padding: 10px;');
console.log('%c Long-term Thinking, High-contrast Design ', 'color: #888; font-size: 12px;');

// ============================================
// Search Functionality
// ============================================

// Article database (auto-generated from archive)
const articles = [
    {
        date: '2026-03-12',
        title: '2026年3月12日美股分析：MSFT + 错杀判断',
        desc: '今日焦点：MSFT 微软平台价值深度解析 + 错杀与逻辑破坏的判断框架',
        url: 'posts/2026/03/12.html',
        keywords: ['MSFT', 'Microsoft', '微软', '错杀', '逻辑破坏', 'Azure', 'Copilot']
    },
    {
        date: '2026-03-11',
        title: '2026年3月11日美股分析：LLY + 安全边际',
        desc: '今日焦点：LLY 礼来制药医疗健康分析 + 安全边际的本质',
        url: 'posts/2026/03/11.html',
        keywords: ['LLY', '礼来', '制药', '医疗', '安全边际']
    },
    {
        date: '2026-03-10',
        title: '2026年3月10日美股分析：META + 长期持有',
        desc: '今日焦点：META 深度研究 + 长期持有的艺术',
        url: 'posts/2026/03/10.html',
        keywords: ['META', 'Meta', '长期持有', '社交广告', 'AI']
    },
    {
        date: '2026-03-09',
        title: '2026年3月9日美股分析：VRT + 竞争优势',
        desc: '今日焦点：VRT Vertiv 电力基础设施分析 + 理解企业的竞争优势',
        url: 'posts/2026/03/09.html',
        keywords: ['VRT', 'Vertiv', '电力基础设施', '竞争优势', '数据中心']
    },
    {
        date: '2026-03-08',
        title: '2026年3月8日美股分析：UNH + 长期持有心态',
        desc: '今日焦点：UNH联合健康防御性分析 + 长期持有的心态修炼',
        url: 'posts/2026/03/08.html',
        keywords: ['UNH', '联合健康', '医疗', '长期持有']
    },
    {
        date: '2026-03-07',
        title: '2026年3月7日美股分析：GOOGL + 护城河识别',
        desc: '今日焦点：GOOGL Alphabet AI护城河分析 + 识别真正护城河的投资原则',
        url: 'posts/2026/03/07.html',
        keywords: ['GOOGL', 'Alphabet', '谷歌', 'AI', '护城河']
    },
    {
        date: '2026-03-05',
        title: '2026年3月5日美股分析：VST + 安全边际',
        desc: '今日焦点：VST 电力股深度分析 + 巴菲特安全边际原则解读',
        url: 'posts/2026/03/05.html',
        keywords: ['VST', 'Vistra', '电力', '安全边际', '巴菲特']
    }
];

function normalizeSearchText(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/[\u3000\s]+/g, ' ')
        .replace(/[./]/g, '-')
        .replace(/年|月/g, '-')
        .replace(/日/g, '')
        .trim();
}

function buildArticleSearchFields(article) {
    const [year, month, day] = article.date.split('-');
    const numericMonth = String(Number(month));
    const numericDay = String(Number(day));

    return [
        article.title,
        article.desc,
        article.date,
        `${year}-${numericMonth}-${numericDay}`,
        `${year}/${numericMonth}/${numericDay}`,
        `${year}年${numericMonth}月${numericDay}日`,
        ...article.keywords
    ].map(normalizeSearchText);
}

// Search function
function searchArticles(query) {
    const normalizedQuery = normalizeSearchText(query);

    if (!normalizedQuery) {
        return [];
    }

    return articles.filter(article => {
        const searchableFields = buildArticleSearchFields(article);
        return searchableFields.some(field => field.includes(normalizedQuery));
    });
}

function setSearchResultsVisibility(searchInput, searchResults, isVisible) {
    if (!searchInput || !searchResults) {
        return;
    }

    searchResults.hidden = !isVisible;
    searchInput.setAttribute('aria-expanded', isVisible ? 'true' : 'false');
}

function updateSearchStatus(statusEl, message) {
    if (statusEl) {
        statusEl.textContent = message;
    }
}

function getSearchResultLinks(searchResults) {
    if (!searchResults) {
        return [];
    }

    return Array.from(searchResults.querySelectorAll('.search-result-item'));
}

function setActiveSearchResult(searchResults, activeIndex) {
    const items = getSearchResultLinks(searchResults);

    items.forEach((item, index) => {
        const isActive = index === activeIndex;
        item.classList.toggle('is-active', isActive);
        item.setAttribute('aria-selected', isActive ? 'true' : 'false');
        item.tabIndex = isActive ? 0 : -1;
    });

    return items;
}

// Display search results
function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');

    if (!searchResults) return;

    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-no-results" role="status">未找到相关文章</div>';
        return;
    }

    const html = results.map((article, index) => `
        <a href="${article.url}" class="search-result-item" role="option" aria-selected="false" tabindex="-1" data-search-index="${index}">
            <div class="search-result-date">${article.date}</div>
            <div class="search-result-title">${article.title}</div>
            <div class="search-result-desc">${article.desc}</div>
        </a>
    `).join('');

    searchResults.innerHTML = html;
}

// Initialize search
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const searchStatus = document.getElementById('searchStatus');

    if (!searchInput || !searchResults) return;

    let activeIndex = -1;
    let lastResults = [];
    let isComposing = false;

    const closeResults = ({ clearMarkup = false } = {}) => {
        activeIndex = -1;
        setActiveSearchResult(searchResults, activeIndex);
        setSearchResultsVisibility(searchInput, searchResults, false);

        if (clearMarkup) {
            searchResults.innerHTML = '';
        }
    };

    const renderResults = (query) => {
        const normalizedQuery = normalizeSearchText(query);

        if (!normalizedQuery) {
            lastResults = [];
            updateSearchStatus(searchStatus, '');
            closeResults({ clearMarkup: true });
            return;
        }

        lastResults = searchArticles(normalizedQuery);
        displaySearchResults(lastResults);
        activeIndex = -1;
        setActiveSearchResult(searchResults, activeIndex);
        setSearchResultsVisibility(searchInput, searchResults, true);

        updateSearchStatus(
            searchStatus,
            lastResults.length > 0
                ? `找到 ${lastResults.length} 篇相关文章`
                : '未找到相关文章'
        );
    };

    const debouncedSearch = debounce(renderResults, 220);

    const moveActiveResult = (direction) => {
        const items = setActiveSearchResult(searchResults, activeIndex);
        if (!items.length) {
            return;
        }

        activeIndex = direction > 0
            ? Math.min(activeIndex + 1, items.length - 1)
            : Math.max(activeIndex - 1, 0);

        const updatedItems = setActiveSearchResult(searchResults, activeIndex);
        const activeItem = updatedItems[activeIndex];

        if (activeItem) {
            activeItem.focus();
            activeItem.scrollIntoView({ block: 'nearest' });
        }
    };

    searchInput.addEventListener('compositionstart', () => {
        isComposing = true;
    });

    searchInput.addEventListener('compositionend', (event) => {
        isComposing = false;
        renderResults(event.target.value);
    });

    ['input', 'search'].forEach((eventName) => {
        searchInput.addEventListener(eventName, (event) => {
            if (isComposing) {
                return;
            }

            debouncedSearch(event.target.value);
        });
    });

    searchInput.addEventListener('focus', () => {
        if (normalizeSearchText(searchInput.value)) {
            renderResults(searchInput.value);
        }
    });

    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeResults();
            searchInput.blur();
            return;
        }

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            if (!lastResults.length && normalizeSearchText(searchInput.value)) {
                renderResults(searchInput.value);
            }

            const items = getSearchResultLinks(searchResults);
            if (!items.length) {
                return;
            }

            event.preventDefault();
            moveActiveResult(event.key === 'ArrowDown' ? 1 : -1);
        }
    });

    searchResults.addEventListener('keydown', (event) => {
        const items = getSearchResultLinks(searchResults);
        if (!items.length) {
            return;
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            closeResults();
            searchInput.focus();
            return;
        }

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            moveActiveResult(event.key === 'ArrowDown' ? 1 : -1);
        }
    });

    searchResults.addEventListener('mousemove', (event) => {
        const target = event.target.closest('.search-result-item');
        if (!target) {
            return;
        }

        const items = getSearchResultLinks(searchResults);
        activeIndex = items.indexOf(target);
        setActiveSearchResult(searchResults, activeIndex);
    });

    searchResults.addEventListener('click', (event) => {
        if (event.target.closest('.search-result-item')) {
            closeResults();
        }
    });

    document.addEventListener('pointerdown', (event) => {
        if (!searchInput.contains(event.target) && !searchResults.contains(event.target)) {
            closeResults();
        }
    });
}


