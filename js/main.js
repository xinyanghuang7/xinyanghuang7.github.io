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

// Dark mode toggle
function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedMode = localStorage.getItem('dark-mode');
    
    if (savedMode === 'dark' || (!savedMode && prefersDark)) {
        document.body.classList.add('dark-mode');
    }
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('dark-mode', 
                document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        });
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
        window.scrollTo({ top: scrollTo, behavior: 'instant' });
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

document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initSmoothScroll();
    initLazyLoading();
    initDarkMode();
    updateProgressBar();
    updateFloatingButtons();
    
    // Restore reading position after DOM ready
    setTimeout(restoreReadingProgress, 150);
    
    // Add fade-child classes to section content for stagger effect
    document.querySelectorAll('.section').forEach(section => {
        const children = section.children;
        for (let i = 0; i < children.length; i++) {
            if (!children[i].classList.contains('section-header')) {
                children[i].classList.add('fade-child');
            }
        }
    });
});

window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

// Respect reduced motion preference
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.scrollBehavior = 'auto';
    // Remove animation classes
    document.querySelectorAll('.fade-child').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
    });
}

// Console greeting
console.log('%c ValueInvest ', 'background: #d4af37; color: #000; font-size: 20px; font-weight: bold; padding: 10px;');
console.log('%c Long-term Thinking, High-contrast Design ', 'color: #888; font-size: 12px;');

// ============================================
// Search Functionality
// ============================================

// Article database (auto-generated from archive)
const articles = [
    {
        date: '2026-03-11',
        title: '2026骞?鏈?1鏃ョ編鑲″垎鏋愶細LLY + 瀹夊叏杈归檯',
        desc: '浠婃棩鐒︾偣锛歀LY 绀兼潵鍒惰嵂鍖荤枟鍋ュ悍鍒嗘瀽 + 瀹夊叏杈归檯鐨勬湰璐?,
        url: 'posts/2026/03/11.html',
        keywords: ['LLY', '绀兼潵', '鍒惰嵂', '鍖荤枟', '瀹夊叏杈归檯']
    },
    {
        date: '2026-03-08',
        title: '2026骞?鏈?鏃ョ編鑲″垎鏋愶細UNH + 闀挎湡鎸佹湁蹇冩€?,
        desc: '浠婃棩鐒︾偣锛歎NH鑱斿悎鍋ュ悍闃插尽鎬у垎鏋?+ 闀挎湡鎸佹湁鐨勫績鎬佷慨鐐?,
        url: 'posts/2026/03/08.html',
        keywords: ['UNH', '鑱斿悎鍋ュ悍', '鍖荤枟', '闀挎湡鎸佹湁']
    },
    {
        date: '2026-03-07',
        title: '2026骞?鏈?鏃ョ編鑲″垎鏋愶細GOOGL + 鎶ゅ煄娌宠瘑鍒?,
        desc: '浠婃棩鐒︾偣锛欸OOGL Alphabet AI鎶ゅ煄娌冲垎鏋?+ 璇嗗埆鐪熸鎶ゅ煄娌崇殑鎶曡祫鍘熷垯',
        url: 'posts/2026/03/07.html',
        keywords: ['GOOGL', 'Alphabet', '璋锋瓕', 'AI', '鎶ゅ煄娌?]
    },
    {
        date: '2026-03-05',
        title: '2026骞?鏈?鏃ョ編鑲″垎鏋愶細VST + 瀹夊叏杈归檯',
        desc: '浠婃棩鐒︾偣锛歏ST 鐢靛姏鑲℃繁搴﹀垎鏋?+ 宸磋彶鐗瑰畨鍏ㄨ竟闄呭師鍒欒В璇?,
        url: 'posts/2026/03/05.html',
        keywords: ['VST', 'Vistra', '鐢靛姏', '瀹夊叏杈归檯', '宸磋彶鐗?]
    }
];

// Search function
function searchArticles(query) {
    if (!query || query.trim().length === 0) {
        return [];
    }
    
    const lowerQuery = query.toLowerCase().trim();
    
    return articles.filter(article => {
        // Search in title
        if (article.title.toLowerCase().includes(lowerQuery)) return true;
        
        // Search in description
        if (article.desc.toLowerCase().includes(lowerQuery)) return true;
        
        // Search in keywords
        if (article.keywords.some(kw => kw.toLowerCase().includes(lowerQuery))) return true;
        
        // Search in date
        if (article.date.includes(lowerQuery)) return true;
        
        return false;
    });
}

// Display search results
function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    
    if (!searchResults) return;
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-no-results">鏈壘鍒扮浉鍏虫枃绔?/div>';
        searchResults.style.display = 'block';
        return;
    }
    
    const html = results.map(article => `
        <a href="${article.url}" class="search-result-item">
            <div class="search-result-date">${article.date}</div>
            <div class="search-result-title">${article.title}</div>
            <div class="search-result-desc">${article.desc}</div>
        </a>
    `).join('');
    
    searchResults.innerHTML = html;
    searchResults.style.display = 'block';
}

// Initialize search
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    if (!searchInput) return;
    
    // Debounced search
    const debouncedSearch = debounce((query) => {
        if (query.trim().length === 0) {
            searchResults.style.display = 'none';
            return;
        }
        
        const results = searchArticles(query);
        displaySearchResults(results);
    }, 300);
    
    // Input event
    searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });
    
    // Focus event
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim().length > 0) {
            const results = searchArticles(searchInput.value);
            displaySearchResults(results);
        }
    });
    
    // Click outside to close
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
    
    // Keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchResults.style.display = 'none';
            searchInput.blur();
        }
    });
}

// Add to DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initSmoothScroll();
    initLazyLoading();
    initDarkMode();
    initSearch(); // Add search initialization
    updateProgressBar();
    updateFloatingButtons();
    
    // Restore reading position after DOM ready
    setTimeout(restoreReadingProgress, 150);
    
    // Add fade-child classes to section content for stagger effect
    document.querySelectorAll('.section').forEach(section => {
        const children = section.children;
        for (let i = 0; i < children.length; i++) {
            if (!children[i].classList.contains('section-header')) {
                children[i].classList.add('fade-child');
            }
        }
    });
});
