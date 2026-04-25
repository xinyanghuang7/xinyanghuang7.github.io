(function () {
  const data = window.__LEARNING_NOTES__ || {};

  function $(selector) {
    return document.querySelector(selector);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderStats() {
    const el = $('#learningStats');
    if (!el) return;
    const stats = [
      ['学习主题', data.topicCount || 0],
      ['母框架', (data.motherFrameworks || []).length],
      ['覆盖分类', (data.categories || []).length],
      ['最新同步', data.updatedAt || '待同步']
    ];
    el.innerHTML = stats.map(([label, value]) => `
      <div class="learning-stat-card">
        <div class="learning-stat-value">${escapeHtml(value)}</div>
        <div class="learning-stat-label">${escapeHtml(label)}</div>
      </div>
    `).join('');
  }

  function renderFrameworks() {
    const el = $('#frameworkGrid');
    if (!el) return;
    el.innerHTML = (data.motherFrameworks || []).map((item, index) => `
      <article class="learning-framework-card" style="--delay:${index * 70}ms">
        <div class="learning-card-index">0${index + 1}</div>
        <div class="course-card-kicker">Mother Framework</div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.takeaway)}</p>
        <div class="learning-chip-row" aria-label="检查变量">
          ${(item.checks || []).map(check => `<span class="learning-chip">${escapeHtml(check)}</span>`).join('')}
        </div>
        <div class="learning-applies">适用：${escapeHtml((item.appliesTo || []).join(' / '))}</div>
      </article>
    `).join('');
  }

  function renderCategories() {
    const el = $('#categoryGrid');
    if (!el) return;
    el.innerHTML = (data.categories || []).map((item) => `
      <article class="learning-category-card">
        <div class="learning-category-count">${escapeHtml(item.count)}</div>
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.description)}</p>
      </article>
    `).join('');
  }

  function noteTemplate(item) {
    return `
      <article class="learning-note-card" data-category="${escapeHtml(item.category)}">
        <div class="learning-note-meta">
          <span>${escapeHtml(item.timestamp)}</span>
          <span>${escapeHtml(item.category)}</span>
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.method)}</p>
        <div class="learning-note-foot">
          <span>${escapeHtml(item.source)}</span>
          <span>${escapeHtml(item.localRecord)}</span>
        </div>
      </article>
    `;
  }

  function renderNotes(filterValue) {
    const el = $('#notesList');
    if (!el) return;
    const notes = data.recent || [];
    const filtered = filterValue && filterValue !== 'all'
      ? notes.filter(item => item.category === filterValue)
      : notes;
    el.innerHTML = filtered.map(noteTemplate).join('') || '<p class="learning-empty">没有匹配的学习笔记。</p>';
    const count = $('#visibleNoteCount');
    if (count) count.textContent = String(filtered.length);
  }

  function renderFilters() {
    const el = $('#categoryFilters');
    if (!el) return;
    const categories = ['all'].concat((data.categories || []).map(item => item.name));
    el.innerHTML = categories.map((category, index) => `
      <button class="learning-filter${index === 0 ? ' active' : ''}" type="button" data-filter="${escapeHtml(category)}">
        ${index === 0 ? '全部' : escapeHtml(category)}
      </button>
    `).join('');
    el.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-filter]');
      if (!button) return;
      el.querySelectorAll('.learning-filter').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      renderNotes(button.getAttribute('data-filter'));
    });
  }

  function renderIntegration() {
    const el = $('#integrationList');
    if (!el) return;
    el.innerHTML = (data.localIntegration || []).map(item => `<li>${escapeHtml(item)}</li>`).join('');
  }

  renderStats();
  renderFrameworks();
  renderCategories();
  renderFilters();
  renderNotes('all');
  renderIntegration();
})();
