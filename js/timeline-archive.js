// Lightweight timeline archive built from js/posts-data.js.
// Keeps homepage selection simple: month anchors + centered reading cards.
(function () {
  const posts = window.__POSTS__ || window.POSTS_DATABASE || [];
  const nav = document.getElementById('timelineMonthNav');
  const carousel = document.getElementById('timelineCarousel');
  if (!posts.length || !nav || !carousel) return;

  const prevButton = document.getElementById('timelinePrev');
  const nextButton = document.getElementById('timelineNext');
  const monthKey = (date) => String(date || '').slice(0, 7);
  const monthLabel = (key) => {
    const [year, month] = key.split('-');
    return `${year}年${Number(month)}月`;
  };
  const months = [...new Set(posts.map((post) => monthKey(post.date)).filter(Boolean))];
  let currentIndex = 0;
  let scrollTimer = null;

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }[char]));
  }

  function compactTitle(title) {
    return String(title || '未命名文章').replace(/^\d{4}年\d{1,2}月\d{1,2}日美股[:：]?\s*/u, '');
  }

  function renderNav() {
    nav.innerHTML = months.map((key, index) => `
      <button class="timeline-month-pill${index === 0 ? ' is-active' : ''}" type="button" data-month="${key}">
        ${monthLabel(key)}
      </button>
    `).join('');
  }

  function renderCards() {
    carousel.innerHTML = posts.map((post, index) => {
      const date = post.date || '';
      const title = compactTitle(post.title);
      const desc = post.desc || post.summary || '点击进入全文，直接阅读当天研究内容。';
      const key = monthKey(date);
      const keywords = (post.keywords || []).slice(0, 4).map((word) => `<span>${escapeHtml(word)}</span>`).join('');
      return `
        <article class="timeline-card${index === 0 ? ' is-active' : ''}" data-index="${index}" data-month="${key}">
          <a href="${post.url}" class="timeline-card-link">
            <time datetime="${date}">${date}</time>
            <h4>${escapeHtml(title)}</h4>
            <p>${escapeHtml(desc)}</p>
            ${keywords ? `<div class="timeline-card-keywords" aria-label="文章关键词">${keywords}</div>` : ''}
          </a>
        </article>
      `;
    }).join('');
  }

  function setActive(index, shouldScroll = true) {
    currentIndex = Math.max(0, Math.min(index, posts.length - 1));
    const cards = [...carousel.querySelectorAll('.timeline-card')];
    cards.forEach((card, cardIndex) => {
      const active = cardIndex === currentIndex;
      card.classList.toggle('is-active', active);
      card.setAttribute('aria-current', active ? 'true' : 'false');
    });

    const month = cards[currentIndex]?.dataset.month;
    nav.querySelectorAll('.timeline-month-pill').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.month === month);
    });

    if (shouldScroll && cards[currentIndex]) {
      cards[currentIndex].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  function nearestCardIndex() {
    const cards = [...carousel.querySelectorAll('.timeline-card')];
    const carouselBox = carousel.getBoundingClientRect();
    const center = carouselBox.left + carouselBox.width / 2;
    let nearest = currentIndex;
    let nearestDistance = Number.POSITIVE_INFINITY;
    cards.forEach((card, index) => {
      const box = card.getBoundingClientRect();
      const cardCenter = box.left + box.width / 2;
      const distance = Math.abs(cardCenter - center);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = index;
      }
    });
    return nearest;
  }

  function bind() {
    nav.addEventListener('click', (event) => {
      const button = event.target.closest('.timeline-month-pill');
      if (!button) return;
      const index = posts.findIndex((post) => monthKey(post.date) === button.dataset.month);
      if (index >= 0) setActive(index);
    });

    prevButton?.addEventListener('click', () => setActive(currentIndex - 1));
    nextButton?.addEventListener('click', () => setActive(currentIndex + 1));

    carousel.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setActive(currentIndex - 1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setActive(currentIndex + 1);
      }
      if (event.key === 'Enter') {
        const activeLink = carousel.querySelector('.timeline-card.is-active a');
        if (activeLink) activeLink.click();
      }
    });

    carousel.addEventListener('click', (event) => {
      const card = event.target.closest('.timeline-card');
      if (!card) return;
      const index = Number(card.dataset.index);
      if (index !== currentIndex) {
        event.preventDefault();
        setActive(index);
      }
    });

    carousel.addEventListener('scroll', () => {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => setActive(nearestCardIndex(), false), 90);
    }, { passive: true });
  }

  renderNav();
  renderCards();
  bind();
  setActive(0, false);
})();
