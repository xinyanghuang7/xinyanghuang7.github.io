// ============================================
// Premium Frontend Interactions
// ============================================

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
    const sections = Array.from(document.querySelectorAll('.section'));
    if (!sections.length) {
        return;
    }

    const root = document.documentElement;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const revealSection = (section) => {
        if (!section || section.classList.contains('visible')) {
            return;
        }

        const children = section.querySelectorAll('.fade-child');
        children.forEach((child, i) => {
            const delay = prefersReducedMotion ? 0 : i * 100;
            setTimeout(() => {
                child.classList.add('visible');
            }, delay);
        });

        section.classList.add('visible');
    };

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        root.classList.remove('js-enhanced');
        sections.forEach(revealSection);
        return;
    }

    root.classList.add('js-enhanced');

    const isNearViewport = (section) => {
        const rect = section.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const revealTop = viewportHeight * 0.96;

        return rect.top <= revealTop && rect.bottom >= 0;
    };

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.05
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                revealSection(entry.target);
                sectionObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const primeVisibleSections = () => {
        sections.forEach((section) => {
            if (isNearViewport(section)) {
                revealSection(section);
                sectionObserver.unobserve(section);
            }
        });
    };

    sections.forEach((section) => {
        sectionObserver.observe(section);
    });

    window.requestAnimationFrame(primeVisibleSections);
    window.setTimeout(primeVisibleSections, 180);
    window.addEventListener('load', primeVisibleSections, { once: true });
    window.addEventListener('resize', debounce(primeVisibleSections, 120));
}

// Smooth scroll for navigation links
function getStickyHeaderHeight() {
    const header = document.getElementById('header');
    return header ? header.getBoundingClientRect().height : 80;
}

function syncStickyOffsets() {
    const root = document.documentElement;
    const headerHeight = Math.max(64, Math.ceil(getStickyHeaderHeight()));
    const anchorOffset = headerHeight + 24;

    root.style.setProperty('--oc-header-height', `${headerHeight}px`);
    root.style.setProperty('--oc-quick-nav-height', '0px');
    root.style.setProperty('--oc-quick-nav-gap', '0px');
    root.style.setProperty('--oc-anchor-offset', `${anchorOffset}px`);

    if (document.body) {
        document.body.classList.remove('has-article-quick-nav', 'has-mobile-quick-nav');
    }

    applyBuildRefreshNoticeLayout();
}

function getAnchorScrollOffset() {
    const offset = getStickyHeaderHeight() + 24;
    return Math.max(88, Math.round(offset));
}

function scrollToAnchorTarget(target, { behavior = 'smooth', updateHash = true } = {}) {
    if (!target) {
        return;
    }

    const elementPosition = target.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - getAnchorScrollOffset(target);

    window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior
    });

    if (updateHash && target.id) {
        history.replaceState(null, '', `#${target.id}`);
    }
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) {
                return;
            }

            e.preventDefault();
            scrollToAnchorTarget(target);
        });
    });

    if (window.location.hash) {
        const initialTarget = document.querySelector(window.location.hash);
        if (initialTarget) {
            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => {
                    scrollToAnchorTarget(initialTarget, { behavior: 'auto', updateHash: false });
                });
            });
        }
    }
}


function initChapterInlineOutline() {
    const outlineRoot = document.getElementById('chapterInlineOutline');
    const chapterBody = document.querySelector('.chapter-body-card');

    if (!outlineRoot || !chapterBody) {
        return;
    }

    const headings = Array.from(chapterBody.querySelectorAll('h2, h3'))
        .filter((heading) => (heading.textContent || '').trim())
        .slice(0, 10);

    if (!headings.length) {
        outlineRoot.hidden = true;
        return;
    }

    const items = headings.map((heading, index) => {
        if (!heading.id) {
            heading.id = `chapter-heading-${index + 1}`;
        }

        return `
            <a class="chapter-inline-outline-link" href="#${heading.id}">
                <span class="chapter-inline-outline-index">${String(index + 1).padStart(2, '0')}</span>
                <span class="chapter-inline-outline-label">${heading.textContent.trim()}</span>
            </a>
        `;
    }).join('');

    outlineRoot.innerHTML = `
        <div class="chapter-inline-outline-eyebrow">章节索引</div>
        <div class="chapter-inline-outline-list">${items}</div>
    `;
    outlineRoot.hidden = false;
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

// Back to top visibility
function updateFloatingButtons() {
    const backToTop = document.getElementById('backToTop');
    const scrollY = window.pageYOffset;

    if (!backToTop) {
        return;
    }

    if (scrollY > 500) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
}

// Scroll to top
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Single-theme editorial surface
const SITE_THEME_COLOR = '#ECE9E0';

function initEditorialTheme() {
    document.body.classList.remove('dark-mode');
    document.body.classList.add('light-mode');
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.style.colorScheme = 'light';

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', SITE_THEME_COLOR);
    }
}

// Build/version self-healing for GitHub Pages 10-minute cache windows
const SITE_BUILD_QUERY_KEY = '__oc_build';
const SITE_BUILD_RELOAD_KEY = 'valueinvest-last-build-reload';

function getCurrentBuildId() {
    const candidates = [
        ...document.querySelectorAll('script[src]'),
        ...document.querySelectorAll('link[rel="stylesheet"][href]')
    ];
    const builds = [];

    for (const el of candidates) {
        const raw = el.getAttribute('src') || el.getAttribute('href');
        if (!raw || !/[?&]v=/.test(raw)) {
            continue;
        }

        try {
            const resolved = new URL(raw, window.location.href);
            const build = resolved.searchParams.get('v');
            if (build) {
                builds.push(build);
            }
        } catch (_) {
            // ignore malformed URLs and keep scanning
        }
    }

    if (!builds.length) {
        return '';
    }

    builds.sort();
    return builds[builds.length - 1];
}

function compareBuildIds(left, right) {
    return String(left || '').localeCompare(String(right || ''), undefined, {
        numeric: true,
        sensitivity: 'base'
    });
}

function applyBuildRefreshNoticeLayout(notice = document.getElementById('buildRefreshNotice')) {
    if (!notice) {
        return;
    }

    notice.style.left = 'auto';
    notice.style.right = '16px';
    notice.style.bottom = '16px';
    notice.style.maxWidth = '320px';
}

function showBuildRefreshNotice(remoteBuild) {
    const existing = document.getElementById('buildRefreshNotice');
    if (existing) {
        applyBuildRefreshNoticeLayout(existing);
        return;
    }

    const notice = document.createElement('div');
    notice.id = 'buildRefreshNotice';
    notice.setAttribute('role', 'status');
    notice.style.cssText = [
        'position:fixed',
        'z-index:9999',
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
    button.textContent = '刷新到最新版';
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
    applyBuildRefreshNoticeLayout(notice);
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
        if (!activeBuild) {
            return false;
        }

        url.searchParams.delete(SITE_BUILD_QUERY_KEY);
        window.history.replaceState({}, document.title, url.toString());

        if (activeBuild === currentBuild || compareBuildIds(activeBuild, currentBuild) <= 0) {
            sessionStorage.removeItem(SITE_BUILD_RELOAD_KEY);
            return false;
        }

        const mismatchKey = `${url.pathname}|mismatch|${activeBuild}|${currentBuild}`;
        sessionStorage.setItem(SITE_BUILD_RELOAD_KEY, mismatchKey);
        showBuildRefreshNotice(activeBuild);
        return true;
    } catch (_) {
        return false;
    }
}

async function checkForSiteUpdate() {
    const currentBuild = getCurrentBuildId();
    const handledMismatch = cleanupBuildQueryParam(currentBuild);

    if (handledMismatch || !currentBuild || typeof fetch !== 'function') {
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
        if (!remoteBuild) {
            return;
        }

        if (compareBuildIds(remoteBuild, currentBuild) <= 0) {
            sessionStorage.removeItem(SITE_BUILD_RELOAD_KEY);
            const existingNotice = document.getElementById('buildRefreshNotice');
            if (existingNotice) {
                existingNotice.remove();
            }
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
    document.documentElement.classList.remove('js-enhanced');

    document.querySelectorAll('.section, .fade-child').forEach(el => {
        el.classList.add('visible');
        el.style.opacity = '1';
        el.style.transform = 'none';
    });
}

function initPayoffChartExplorer() {
    const chartBlocks = Array.from(document.querySelectorAll('.payoff-chart-block'));
    if (!chartBlocks.length) return;

    const formatNumber = (value) => {
        const numeric = Number(value || 0);
        return Number.isFinite(numeric)
            ? new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 }).format(numeric)
            : '--';
    };

    chartBlocks.forEach((block) => {
        const svg = block.querySelector('.payoff-chart-svg');
        const tooltip = block.querySelector('.payoff-chart-tooltip');
        const tooltipLabel = tooltip?.querySelector('.payoff-chart-tooltip-label');
        const tooltipValue = tooltip?.querySelector('.payoff-chart-tooltip-value');
        const tooltipSecondary = tooltip?.querySelector('.payoff-chart-tooltip-secondary');
        const liveRegion = block.querySelector('.payoff-chart-live');
        const dataNode = block.querySelector('.payoff-chart-data');
        const focusLine = svg?.querySelector('.payoff-chart-focus-line');
        const focusDot = svg?.querySelector('.payoff-chart-focus-dot');
        const wrap = block.querySelector('.payoff-chart-svg-wrap');

        if (!svg || !tooltip || !tooltipLabel || !tooltipValue || !tooltipSecondary || !liveRegion || !dataNode || !focusLine || !focusDot || !wrap) {
            return;
        }

        let payload;
        try {
            payload = JSON.parse(dataNode.textContent || '{}');
        } catch {
            return;
        }

        const points = Array.isArray(payload.points) ? payload.points : [];
        const viewBox = payload.viewBox || {};
        const viewWidth = Number(viewBox.width) || 960;
        const viewHeight = Number(viewBox.height) || 560;
        if (!points.length) return;

        const setActivePoint = (point) => {
            const x = Number(point.x || 0);
            const y = Number(point.y || 0);
            focusLine.setAttribute('x1', String(x));
            focusLine.setAttribute('x2', String(x));
            focusLine.setAttribute('visibility', 'visible');
            focusDot.setAttribute('cx', String(x));
            focusDot.setAttribute('cy', String(y));
            focusDot.setAttribute('visibility', 'visible');

            tooltip.hidden = false;
            tooltip.style.left = `${(x / viewWidth) * 100}%`;
            tooltip.style.top = `${Math.max(6, (y / viewHeight) * 100 - 3)}%`;
            tooltipLabel.textContent = payload.underlyingLabel || '到期股价';
            tooltipValue.textContent = formatNumber(point.price);
            tooltipSecondary.textContent = `${payload.profitLabel || '到期盈亏'}：${formatNumber(point.profit)}`;
            liveRegion.textContent = `${payload.underlyingLabel || '到期股价'} ${formatNumber(point.price)}，${payload.profitLabel || '到期盈亏'} ${formatNumber(point.profit)}`;
        };

        const nearestPoint = (clientX) => {
            const rect = wrap.getBoundingClientRect();
            const relativeX = ((clientX - rect.left) / rect.width) * viewWidth;
            let best = points[0];
            let bestDistance = Math.abs(relativeX - Number(best.x || 0));
            for (let index = 1; index < points.length; index += 1) {
                const candidate = points[index];
                const distance = Math.abs(relativeX - Number(candidate.x || 0));
                if (distance < bestDistance) {
                    best = candidate;
                    bestDistance = distance;
                }
            }
            return best;
        };

        const reset = () => {
            tooltip.hidden = true;
            focusLine.setAttribute('visibility', 'hidden');
            focusDot.setAttribute('visibility', 'hidden');
            liveRegion.textContent = '拖动或悬停图表，可直接查看不同到期股价下的盈亏变化。';
        };

        const handlePointer = (event) => {
            const clientX = event.clientX ?? event.touches?.[0]?.clientX ?? event.changedTouches?.[0]?.clientX;
            if (typeof clientX !== 'number') return;
            const point = nearestPoint(clientX);
            setActivePoint(point);
        };

        wrap.addEventListener('pointermove', handlePointer);
        wrap.addEventListener('pointerenter', handlePointer);
        wrap.addEventListener('pointerleave', reset);
        wrap.addEventListener('touchstart', handlePointer, { passive: true });
        wrap.addEventListener('touchmove', handlePointer, { passive: true });

        setActivePoint(points[Math.floor(points.length / 2)]);
    });
}

function initCourseChapterFilter() {
    const searchInput = document.getElementById('courseChapterSearch');
    const statusEl = document.getElementById('courseChapterSearchStatus');
    const emptyState = document.getElementById('courseChapterEmptyState');
    const cards = Array.from(document.querySelectorAll('[data-course-card]'));

    if (!searchInput || !statusEl || !cards.length) {
        return;
    }

    const normalize = (value) => String(value || '')
        .toLowerCase()
        .replace(/[\s\u3000]+/g, ' ')
        .trim();

    const applyFilter = () => {
        const query = normalize(searchInput.value);
        let visibleCount = 0;

        cards.forEach((card) => {
            const haystack = normalize(card.getAttribute('data-course-search'));
            const isVisible = !query || haystack.includes(query);
            card.hidden = !isVisible;
            card.classList.toggle('is-filter-hit', Boolean(query) && isVisible);
            if (isVisible) {
                visibleCount += 1;
            }
        });

        if (!query) {
            statusEl.textContent = `默认显示全部章节（共 ${cards.length} 章）`;
        } else {
            statusEl.textContent = `找到 ${visibleCount} / ${cards.length} 个匹配章节`;
        }

        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }
    };

    searchInput.addEventListener('input', applyFilter);
    applyFilter();
}

function initComfortInteractions() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        return;
    }

    const selectors = [
        '.highlight-box',
        '.analysis-box',
        '.stock-card',
        '.stock-detail-card',
        '.wisdom-card',
        '.course-grid-card',
        '.course-toolkit-card',
        '.research-card',
        '.homepage-course-entry',
        '.editorial-band',
        '.chapter-summary-card',
        '.chapter-nav-card',
        '.course-filter-panel'
    ];

    const cards = Array.from(document.querySelectorAll(selectors.join(',')));
    cards.forEach((card) => {
        if (card.dataset.comfortBound === 'true') {
            return;
        }

        card.dataset.comfortBound = 'true';
        card.classList.add('comfort-hover-surface');

        card.addEventListener('pointermove', (event) => {
            const rect = card.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--comfort-x', `${x.toFixed(2)}%`);
            card.style.setProperty('--comfort-y', `${y.toFixed(2)}%`);
        });

        card.addEventListener('pointerleave', () => {
            card.style.removeProperty('--comfort-x');
            card.style.removeProperty('--comfort-y');
        });
    });
}

function ensureVelvetLoader() {
    if (!document.body || document.querySelector('.site-loader')) {
        return;
    }

    const loader = document.createElement('div');
    loader.className = 'site-loader';
    loader.setAttribute('aria-hidden', 'true');
    loader.innerHTML = `
        <div class="site-loader__inner">
            <div class="site-loader__eyebrow">ValueInvest After Hours</div>
            <div class="site-loader__title">Velvet Research</div>
            <div class="site-loader__line"></div>
        </div>
    `;

    document.body.prepend(loader);
}

function completeVelvetLoader() {
    if (!document.body) {
        return;
    }

    document.body.classList.add('velvet-loaded');

    window.setTimeout(() => {
        const loader = document.querySelector('.site-loader');
        if (loader) {
            loader.remove();
        }
    }, 900);
}

function initPage() {
    ensureVelvetLoader();
    decorateSectionsForReveal();
    syncStickyOffsets();
    initScrollReveal();
    initSmoothScroll();
    initArticleMeta();
    initChapterInlineOutline();
    initPayoffChartExplorer();
    initCourseChapterFilter();
    initComfortInteractions();
    initLazyLoading();
    initEditorialTheme();
    initSearch();
    updateProgressBar();
    updateHeader();
    updateFloatingButtons();
    applyReducedMotionFallback();
    checkForSiteUpdate();

    window.requestAnimationFrame(syncStickyOffsets);

    if (document.fonts?.ready) {
        document.fonts.ready.then(() => {
            window.requestAnimationFrame(syncStickyOffsets);
            completeVelvetLoader();
        }).catch(() => {
            completeVelvetLoader();
        });
    } else {
        completeVelvetLoader();
    }

    // Restore reading position after DOM ready
    setTimeout(restoreReadingProgress, 150);
}

document.addEventListener('DOMContentLoaded', initPage, { once: true });
window.addEventListener('resize', debounce(syncStickyOffsets, 80));

window.addEventListener('load', () => {
    syncStickyOffsets();
    document.body.style.opacity = '1';
    completeVelvetLoader();
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






