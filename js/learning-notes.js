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

  function pathChip(path) {
    if (!path) return '';
    return `<code class="learning-path-chip">${escapeHtml(path)}</code>`;
  }

  function renderStats() {
    const el = $('#learningStats');
    if (!el) return;
    const stats = Array.isArray(data.statCards) && data.statCards.length ? data.statCards : [
      { label: '学习总数', value: data.topicCount || 0, note: '本地学习 lane 已沉淀的主题总量', path: 'knowledge/investing/automation/feishu-deep-study-catalog.md' },
      { label: '最新展示', value: (data.recent || []).length, note: '前端只展示最近 10 条', path: 'xinyanghuang7.github.io/js/learning-notes-data.js' },
      { label: '母框架', value: (data.motherFrameworks || []).length, note: '可反复复用的判断骨架', path: 'knowledge/investing/frameworks/core-frameworks.md' },
      { label: '最近更新', value: data.newest || data.updatedAt || '待同步', note: '最新一条学习进入系统的时间', path: 'knowledge/investing/automation/feishu-deep-study-topic-log.md' }
    ];
    el.innerHTML = stats.map((item) => `
      <article class="learning-stat-card">
        <div class="learning-stat-label">${escapeHtml(item.label)}</div>
        <div class="learning-stat-value">${escapeHtml(item.value)}</div>
        <p>${escapeHtml(item.note)}</p>
        ${pathChip(item.path)}
      </article>
    `).join('');
  }

  function renderFeatured() {
    const el = $('#featuredLearning');
    if (!el) return;
    const item = data.featuredLatest;
    if (!item) {
      el.innerHTML = '<p class="learning-empty">暂无精选学习摘要。</p>';
      return;
    }
    el.innerHTML = `
      <article class="learning-featured-card">
        <div class="learning-note-meta">
          <span>${escapeHtml(item.timestamp)}</span>
          <span>${escapeHtml(item.category)}</span>
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.summary)}</p>
        <div class="learning-source-row">
          <span>${escapeHtml(item.source || '学习系统')}</span>
          ${pathChip(item.localRecord)}
        </div>
      </article>
    `;
  }

  function renderFrameworks() {
    const el = $('#frameworkGrid');
    if (!el) return;
    el.innerHTML = (data.motherFrameworks || []).map((item, index) => `
      <article class="learning-framework-card" style="--delay:${index * 70}ms">
        <div class="learning-card-index">0${index + 1}</div>
        <div class="course-card-kicker">Reusable Check · ${escapeHtml(item.updatedAt || data.updatedAt || '待更新')}</div>
        <h3>${escapeHtml(item.shortName || item.title)}</h3>
        <p class="learning-framework-takeaway">${escapeHtml(item.takeaway)}</p>
        <p>${escapeHtml(item.detail || '')}</p>
        <div class="learning-chip-row" aria-label="检查变量">
          ${(item.checks || []).map(check => `<span class="learning-chip">${escapeHtml(check)}</span>`).join('')}
        </div>
        <div class="learning-applies">适用：${escapeHtml((item.appliesTo || []).join(' / '))}</div>
        ${pathChip(item.localPath)}
      </article>
    `).join('');
  }

  function renderCategories() {
    const el = $('#categoryGrid');
    if (!el) return;
    el.innerHTML = (data.categories || []).map((item) => `
      <article class="learning-category-card">
        <div class="learning-category-count">${escapeHtml(item.count)}</div>
        <div class="learning-category-label">已学 ${escapeHtml(item.count)} 条</div>
        <h3>${escapeHtml(item.plainName || item.name)}</h3>
        <p>${escapeHtml(item.description)}</p>
        ${pathChip(item.localPath)}
      </article>
    `).join('');
  }

  function fallbackNotes() {
    if (Array.isArray(data.fallbackRecent) && data.fallbackRecent.length) {
      return data.fallbackRecent;
    }
    return (data.motherFrameworks || []).slice(0, 3).map((item) => ({
      timestamp: data.updatedAt || '待同步',
      title: item.shortName || item.title,
      method: item.takeaway,
      category: '框架 fallback',
      source: 'learning-notes-data.js fallback',
      localRecord: item.localPath || 'knowledge/investing/automation/feishu-deep-study-notes.md'
    }));
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
          ${pathChip(item.localRecord)}
        </div>
      </article>
    `;
  }

  function renderNotes(filterValue) {
    const el = $('#notesList');
    if (!el) return;
    const recent = Array.isArray(data.recent) ? data.recent.slice(0, 10) : [];
    const notes = recent.length ? recent : fallbackNotes();
    const filtered = filterValue && filterValue !== 'all'
      ? notes.filter(item => item.category === filterValue)
      : notes;
    const hasPrimaryData = recent.length > 0;
    el.innerHTML = filtered.map(noteTemplate).join('') || '<p class="learning-empty">没有匹配的学习笔记；可以切回“全部”，或回到本地学习系统查看完整目录。</p>';
    const count = $('#visibleNoteCount');
    const status = $('#visibleNoteStatus');
    if (count) count.textContent = `${filtered.length} / ${data.topicCount || filtered.length} 条`;
    if (status) status.textContent = hasPrimaryData ? '当前显示最近 ' : 'fallback 显示 ';
  }

  function renderFilters() {
    const el = $('#categoryFilters');
    if (!el) return;
    const categories = ['all'].concat((data.categories || []).map(item => item.name));
    el.innerHTML = categories.map((category, index) => {
      const label = index === 0 ? '全部' : ((data.categories || []).find(item => item.name === category)?.plainName || category);
      return `
        <button class="learning-filter${index === 0 ? ' active' : ''}" type="button" data-filter="${escapeHtml(category)}">
          ${escapeHtml(label)}
        </button>
      `;
    }).join('');
    el.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-filter]');
      if (!button) return;
      el.querySelectorAll('.learning-filter').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      renderNotes(button.getAttribute('data-filter'));
    });
  }

  renderStats();
  renderFeatured();
  renderFrameworks();
  renderCategories();
  renderFilters();
  renderNotes('all');
})();
