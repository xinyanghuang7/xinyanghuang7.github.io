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

function initArticleQuickNav() {
    const quickNav = document.querySelector('.article-quick-nav');
    if (!quickNav) {
        return;
    }

    const links = Array.from(quickNav.querySelectorAll('[data-section-link]'));
    const sections = links
        .map(link => document.getElementById(link.dataset.sectionLink))
        .filter(Boolean);

    if (!links.length || !sections.length) {
        return;
    }

    const syncQuickNavScroll = (activeLink) => {
        if (!activeLink || quickNav.scrollWidth <= quickNav.clientWidth + 4) {
            return;
        }

        const targetLeft = activeLink.offsetLeft - Math.max(0, (quickNav.clientWidth - activeLink.offsetWidth) / 2);
        const maxLeft = Math.max(0, quickNav.scrollWidth - quickNav.clientWidth);
        const nextLeft = Math.min(maxLeft, Math.max(0, targetLeft));

        quickNav.scrollTo({
            left: nextLeft,
            behavior: 'smooth'
        });
    };

    const setActiveLink = (id) => {
        let activeLink = null;

        links.forEach(link => {
            const isActive = link.dataset.sectionLink === id;
            link.classList.toggle('is-active', isActive);
            link.setAttribute('aria-current', isActive ? 'true' : 'false');

            if (isActive) {
                activeLink = link;
            }
        });

        syncQuickNavScroll(activeLink);
    };

    const observer = new IntersectionObserver((entries) => {
        const visible = entries
            .filter(entry => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
            setActiveLink(visible.target.id);
        }
    }, {
        rootMargin: '-24% 0px -58% 0px',
        threshold: [0.2, 0.35, 0.55]
    });

    sections.forEach(section => observer.observe(section));
}

function initArticleMeta() {
    const readTimeEl = document.getElementById('articleReadTime');
    const main = document.getElementById('main');

    if (!readTimeEl || !main) {
        return;
    }

    const text = main.innerText || '';
    const cleaned = text.replace(/\s+/g, '');
    const estimatedMinutes = Math.max(4, Math.round(cleaned.length / 320));
    readTimeEl.textContent = `阅读约 ${estimatedMinutes} 分钟`;
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

// Build/version self-healing for GitHub Pages 10-minute cache windows
const SITE_BUILD_QUERY_KEY = '__oc_build';
const SITE_BUILD_RELOAD_KEY = 'valueinvest-last-build-reload';

function getCurrentBuildId() {
    const candidates = [
        ...document.querySelectorAll('script[src]'),
        ...document.querySelectorAll('link[rel="stylesheet"][href]')
    ];

    for (const el of candidates) {
        const raw = el.getAttribute('src') || el.getAttribute('href');
        if (!raw || !/[?&]v=/.test(raw)) {
            continue;
        }

        try {
            const resolved = new URL(raw, window.location.href);
            const build = resolved.searchParams.get('v');
            if (build) {
                return build;
            }
        } catch (_) {
            // ignore malformed URLs and keep scanning
        }
    }

    return '';
}

function showBuildRefreshNotice(remoteBuild) {
    if (document.getElementById('buildRefreshNotice')) {
        return;
    }

    const notice = document.createElement('div');
    notice.id = 'buildRefreshNotice';
    notice.setAttribute('role', 'status');
    notice.style.cssText = [
        'position:fixed',
        'right:16px',
        'bottom:16px',
        'z-index:9999',
        'max-width:320px',
        'padding:12px 14px',
        'border-radius:14px',
        'background:rgba(12,12,12,0.94)',
        'border:1px solid rgba(212,175,55,0.45)',
        'color:#fff',
        'box-shadow:0 18px 40px rgba(0,0,0,0.35)',
        'font-size:14px',
        'line-height:1.5'
    ].join(';');

    const text = document.createElement('div');
    text.textContent = '检测到站点有更新版本，点击即可刷新到最新内容。';

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = '刷新到最新版本';
    button.style.cssText = [
        'margin-top:10px',
        'padding:8px 12px',
        'border-radius:999px',
        'border:none',
        'background:#d4af37',
        'color:#111',
        'font-weight:700',
        'cursor:pointer'
    ].join(';');
    button.addEventListener('click', () => redirectToBuild(remoteBuild));

    notice.appendChild(text);
    notice.appendChild(button);
    document.body.appendChild(notice);
}

function redirectToBuild(remoteBuild) {
    if (!remoteBuild) {
        return;
    }

    try {
        const url = new URL(window.location.href);
        const key = `${url.pathname}|${remoteBuild}`;
        sessionStorage.setItem(SITE_BUILD_RELOAD_KEY, key);
        url.searchParams.set(SITE_BUILD_QUERY_KEY, remoteBuild);
        window.location.replace(url.toString());
    } catch (_) {
        // no-op
    }
}

function cleanupBuildQueryParam(currentBuild) {
    try {
        const url = new URL(window.location.href);
        const activeBuild = url.searchParams.get(SITE_BUILD_QUERY_KEY);
        if (activeBuild && activeBuild === currentBuild) {
            url.searchParams.delete(SITE_BUILD_QUERY_KEY);
            window.history.replaceState({}, document.title, url.toString());
            sessionStorage.removeItem(SITE_BUILD_RELOAD_KEY);
        }
    } catch (_) {
        // no-op
    }
}

async function checkForSiteUpdate() {
    const currentBuild = getCurrentBuildId();
    cleanupBuildQueryParam(currentBuild);

    if (!currentBuild || typeof fetch !== 'function') {
        return;
    }

    try {
        const response = await fetch(`/site-version.json?ts=${Date.now()}`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            return;
        }

        const payload = await response.json();
        const remoteBuild = String(payload?.build || '').trim();
        if (!remoteBuild || remoteBuild === currentBuild) {
            return;
        }

        const url = new URL(window.location.href);
        const attemptedKey = `${url.pathname}|${remoteBuild}`;
        const lastAttempt = sessionStorage.getItem(SITE_BUILD_RELOAD_KEY);

        if (lastAttempt === attemptedKey) {
            showBuildRefreshNotice(remoteBuild);
            return;
        }

        redirectToBuild(remoteBuild);
    } catch (error) {
        console.warn('Site version check skipped:', error);
    }
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
    initArticleQuickNav();
    initArticleMeta();
    initLazyLoading();
    initDarkMode();
    initSearch();
    updateProgressBar();
    updateHeader();
    updateFloatingButtons();
    applyReducedMotionFallback();
    checkForSiteUpdate();

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

// Article database (auto-generated from posts/**/*.html via js/posts-data.js)
const articles = Array.isArray(window.__POSTS__) ? window.__POSTS__ : [];

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

    const html = results.map((article, index) => {
        const keywordHtml = (article.keywords || []).slice(0, 3).map(keyword => `
            <span class="search-result-keyword">${keyword}</span>
        `).join('');

        return `
        <a href="${article.url}" class="search-result-item" role="option" aria-selected="false" tabindex="-1" data-search-index="${index}">
            <div class="search-result-date">${article.date}</div>
            <div class="search-result-title">${article.title}</div>
            <div class="search-result-desc">${article.desc}</div>
            <div class="search-result-keywords">${keywordHtml}</div>
        </a>
    `;
    }).join('');

    searchResults.innerHTML = html;
}

// Initialize search
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const searchStatus = document.getElementById('searchStatus');
    const searchStatusText = document.getElementById('searchStatusText');
    const searchLibraryCount = document.getElementById('searchLibraryCount');
    const searchContainer = searchInput?.closest('.search-container');

    if (!searchInput || !searchResults || !searchContainer) return;

    let activeIndex = -1;
    let lastResults = [];
    let isComposing = false;

    if (searchLibraryCount) {
        searchLibraryCount.textContent = String(articles.length);
    }

    const setSearchOpenState = (isOpen) => {
        searchContainer.classList.toggle('is-open', isOpen);
        document.body.classList.toggle('search-open', isOpen);
    };

    const closeResults = ({ clearMarkup = false } = {}) => {
        activeIndex = -1;
        setActiveSearchResult(searchResults, activeIndex);
        setSearchResultsVisibility(searchInput, searchResults, false);
        setSearchOpenState(false);

        if (searchStatusText) {
            searchStatusText.textContent = '支持股票代码 / 日期 / 主题词';
        }

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
        setSearchOpenState(true);

        const statusText = lastResults.length > 0
            ? `找到 ${lastResults.length} 篇相关文章`
            : '未找到相关文章';

        updateSearchStatus(searchStatus, statusText);

        if (searchStatusText) {
            searchStatusText.textContent = lastResults.length > 0
                ? `当前结果：${lastResults.length} 篇`
                : '当前结果：0 篇';
        }
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

    document.addEventListener('keydown', (event) => {
        const activeTag = document.activeElement?.tagName;
        const isTypingContext = document.activeElement?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag);

        if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && !isTypingContext) {
            event.preventDefault();
            searchInput.focus();
            searchInput.select();
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

    window.addEventListener('resize', debounce(() => {
        if (!normalizeSearchText(searchInput.value)) {
            closeResults();
        }
    }, 120));
}





