// ============================================
// Calendar Archive Component
// ============================================

const CalendarArchive = {
    currentDate: new Date(),
    today: new Date(),
    postsData: [],
    
    init() {
        const calendarGrid = document.getElementById('calendarGrid');
        if (!calendarGrid) return;
        
        // Get posts data from global __POSTS__ if available
        this.postsData = window.__POSTS__ || window.POSTS_DATABASE || [];
        
        // Find latest post date
        if (this.postsData.length > 0) {
            const latestPost = this.postsData[0];
            if (latestPost && latestPost.date) {
                this.currentDate = new Date(latestPost.date + 'T00:00:00');
            }
        }
        
        this.bindEvents();
        this.render();
    },
    
    bindEvents() {
        const prevBtn = document.getElementById('calendarPrev');
        const nextBtn = document.getElementById('calendarNext');
        const todayBtn = document.getElementById('calendarToday');
        const monthSelect = document.getElementById('calendarMonthSelect');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigateMonth(-1));
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateMonth(1));
        }
        if (todayBtn) {
            todayBtn.addEventListener('click', () => this.jumpToLatest());
        }
        if (monthSelect) {
            monthSelect.addEventListener('change', (event) => {
                const value = event.target.value;
                if (!value) return;
                const [year, month] = value.split('-').map(Number);
                this.currentDate = new Date(year, month - 1, 1);
                this.render();
            });
        }
    },
    
    navigateMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.render();
    },
    
    jumpToLatest() {
        if (this.postsData.length > 0) {
            const latestPost = this.postsData[0];
            if (latestPost && latestPost.date) {
                this.currentDate = new Date(latestPost.date + 'T00:00:00');
            }
        } else {
            this.currentDate = new Date();
        }
        this.render();
    },
    
    getPostsForDate(dateStr) {
        return this.postsData.filter(post => post.date === dateStr);
    },

    getAvailableMonths() {
        const unique = new Map();
        this.postsData.forEach((post) => {
            const [year, month] = post.date.split('-');
            const key = `${year}-${month}`;
            if (!unique.has(key)) {
                unique.set(key, {
                    value: key,
                    label: `${year}年${Number(month)}月`
                });
            }
        });
        return [...unique.values()];
    },

    populateMonthSelect(year, month) {
        const select = document.getElementById('calendarMonthSelect');
        if (!select) return;
        const currentValue = `${year}-${String(month + 1).padStart(2, '0')}`;
        const options = this.getAvailableMonths();
        select.innerHTML = options.map(option => `<option value="${option.value}"${option.value === currentValue ? ' selected' : ''}>${option.label}</option>`).join('');
    },
    
    formatDateStr(year, month, day) {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    },
    
    render() {
        const grid = document.getElementById('calendarGrid');
        const yearEl = document.getElementById('calendarYear');
        const monthEl = document.getElementById('calendarMonth');
        
        if (!grid) return;
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update header
        if (yearEl) yearEl.textContent = year;
        if (monthEl) monthEl.textContent = month + 1;
        this.populateMonthSelect(year, month);
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        // Today's date string for highlighting
        const todayStr = this.formatDateStr(
            this.today.getFullYear(),
            this.today.getMonth(),
            this.today.getDate()
        );
        
        let html = '';
        
        // Previous month overflow days
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            html += `<div class="calendar-day other-month">${day}</div>`;
        }
        
        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = this.formatDateStr(year, month, day);
            const posts = this.getPostsForDate(dateStr);
            const hasPost = posts.length > 0;
            const isToday = dateStr === todayStr;
            
            let classes = 'calendar-day';
            let content = day;
            let attrs = '';
            
            if (hasPost) {
                classes += ' has-post';
                attrs += ` data-date="${dateStr}"`;
                
                if (posts.length > 1) {
                    attrs += ` data-count="${posts.length}"`;
                }
                
                // Add tooltip with post title
                const post = posts[0];
                const tooltip = `
                    <div class="calendar-tooltip">
                        <div class="calendar-tooltip-title">${this.escapeHtml(post.title)}</div>
                        <div class="calendar-tooltip-desc">${this.escapeHtml(post.summary || '点击查看全文')}</div>
                    </div>
                `;
                content += tooltip;
            } else {
                classes += ' empty';
            }
            
            if (isToday) {
                classes += ' is-today';
            }
            
            html += `<div class="${classes}"${attrs}>${content}</div>`;
        }
        
        // Next month overflow days to fill 6 rows (42 cells)
        const totalCells = firstDay + daysInMonth;
        const remainingCells = 42 - totalCells;
        for (let day = 1; day <= remainingCells; day++) {
            html += `<div class="calendar-day other-month">${day}</div>`;
        }
        
        grid.innerHTML = html;
        
        // Bind click events for days with posts
        grid.querySelectorAll('.calendar-day.has-post').forEach(dayEl => {
            dayEl.addEventListener('click', () => {
                const dateStr = dayEl.dataset.date;
                const posts = this.getPostsForDate(dateStr);
                if (posts.length > 0) {
                    window.location.href = posts[0].url;
                }
            });
        });
    },
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Expose for debugging / downstream hooks
window.CalendarArchive = CalendarArchive;

// Initialize calendar safely whether DOMContentLoaded already fired or not
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        CalendarArchive.init();
    });
} else {
    CalendarArchive.init();
}
