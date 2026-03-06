// Scroll Progress Bar
function updateProgressBar() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.width = scrolled + '%';
    }
}

// Header scroll effect
function updateHeader() {
    const header = document.getElementById('header');
    if (header) {
        if (window.pageYOffset > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
}

// Back to top button visibility
function updateBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        if (window.pageYOffset > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }
}

// Scroll to top
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Intersection Observer for fade-in animations
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
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

// Format date for display
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
}

// Get current date in YYYY-MM-DD format
function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Throttle scroll events for performance
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Lazy load images
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '50px 0px' });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for older browsers
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
    localStorage.setItem(`reading-progress-${location.pathname}`, scrollPercent);
}

function restoreReadingProgress() {
    const saved = localStorage.getItem(`reading-progress-${location.pathname}`);
    if (saved && saved > 0 && saved < 100) {
        const scrollTo = (saved / 100) * (document.documentElement.scrollHeight - window.innerHeight);
        window.scrollTo({ top: scrollTo, behavior: 'instant' });
    }
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
            localStorage.setItem('dark-mode', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        });
    }
}

// Search functionality
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    if (!searchInput) return;
    
    let searchData = [];
    
    // Load search index
    fetch('search-index.json')
        .then(r => r.json())
        .then(data => { searchData = data; })
        .catch(() => console.log('Search index not available'));
    
    const performSearch = debounce((query) => {
        if (!query || query.length < 2) {
            searchResults.innerHTML = '';
            return;
        }
        
        const results = searchData.filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            (item.content && item.content.toLowerCase().includes(query.toLowerCase()))
        ).slice(0, 5);
        
        searchResults.innerHTML = results.map(r => 
            `<a href="${r.url}" class="search-result-item">${r.title}</a>`
        ).join('') || '<div class="search-no-results">无结果</div>';
    }, 300);
    
    searchInput.addEventListener('input', (e) => performSearch(e.target.value));
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize all functions
const throttledScroll = throttle(() => {
    updateProgressBar();
    updateHeader();
    updateBackToTop();
    saveReadingProgress();
}, 100);

window.addEventListener('scroll', throttledScroll);

document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initSmoothScroll();
    initLazyLoading();
    initDarkMode();
    initSearch();
    updateProgressBar();
    
    // Restore reading position after a short delay
    setTimeout(restoreReadingProgress, 100);
});

// Prevent animation flickering on page load
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

// Respect reduced motion preference
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.scrollBehavior = 'auto';
}
