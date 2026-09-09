(function () {
    'use strict';

    var LANGUAGE_LABELS = {
        zh: '中文',
        en: 'English',
        ja: '日本語',
        ko: '한국어',
        fr: 'Français',
        es: 'Español',
        de: 'Deutsch',
        ru: 'Русский'
    };

    var CATEGORY_LABELS = {
        novel: '小说',
        scifi: '科幻',
        history: '历史',
        philosophy: '哲学',
        biography: '传记',
        programming: '编程',
        poetry: '诗歌',
        economy: '经济'
    };

    var state = {
        books: [],
        filtered: [],
        filters: {
            language: 'all',
            category: 'all',
            search: ''
        },
        sort: 'rating-desc'
    };

    var els = {};

    function qs(id) {
        return document.getElementById(id);
    }

    function resolveDataPath() {
        var base = document.querySelector('base');
        var href = base ? base.getAttribute('href') : '';
        if (href && href.charAt(href.length - 1) !== '/') {
            href += '/';
        }
        return href + 'data/data.json';
    }

    function debounce(fn, wait) {
        var timeout;
        return function () {
            var args = arguments;
            var ctx = this;
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                fn.apply(ctx, args);
            }, wait);
        };
    }

    function initTheme() {
        var stored = null;
        try {
            stored = localStorage.getItem('theme');
        } catch (e) {}
        var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        var theme = stored || (prefersDark ? 'dark' : 'light');
        setTheme(theme);
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem('theme', theme);
        } catch (e) {}
    }

    function toggleTheme() {
        var current = document.documentElement.getAttribute('data-theme') || 'light';
        setTheme(current === 'dark' ? 'light' : 'dark');
    }

    function loadBooks() {
        showLoading(true);
        showEmpty(false);
        var path = resolveDataPath();
        fetch(path)
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(function (data) {
                state.books = Array.isArray(data) ? data : (data.books || []);
                showLoading(false);
                applyFiltersAndSort();
            })
            .catch(function (err) {
                console.error('加载书籍数据失败:', err);
                showLoading(false);
                qs('resultCount').textContent = '加载失败，请刷新重试';
            });
    }

    function escapeHtml(s) {
        if (s == null) return '';
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderStars(rating) {
        var r = Math.round(rating * 2) / 2;
        var full = Math.floor(r);
        var half = (r - full) >= 0.5 ? 1 : 0;
        var empty = 5 - full - half;
        var html = '';
        var starFull = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
        var starHalf = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><defs><linearGradient id="half"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><polygon fill="url(#half)" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
        var starEmpty = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
        for (var i = 0; i < full; i++) html += starFull;
        for (var j = 0; j < half; j++) html += starHalf;
        for (var k = 0; k < empty; k++) html += starEmpty;
        return html;
    }

    function createBookCard(book) {
        var langLabel = LANGUAGE_LABELS[book.language] || book.language;
        var catLabel = CATEGORY_LABELS[book.category] || book.category;
        var el = document.createElement('article');
        el.className = 'book-card';
        el.setAttribute('data-id', book.id);
        el.innerHTML =
            '<div class="book-cover">' +
                (book.coverUrl ? '<img src="' + escapeHtml(book.coverUrl) + '" alt="' + escapeHtml(book.title) + '" loading="lazy" onerror="this.style.display=\'none\'"/>' : '') +
                '<span class="book-badge lang-' + escapeHtml(book.language) + '">' + escapeHtml(langLabel) + '</span>' +
                '<span class="book-rating-badge">' +
                    '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' +
                    escapeHtml(Number(book.rating).toFixed(1)) +
                '</span>' +
            '</div>' +
            '<div class="book-info">' +
                '<h3 class="book-title" title="' + escapeHtml(book.title) + '">' + escapeHtml(book.title) + '</h3>' +
                '<p class="book-author" title="' + escapeHtml(book.author) + '">' + escapeHtml(book.author) + '</p>' +
                '<div class="book-meta">' +
                    '<span class="category-tag">' + escapeHtml(catLabel) + '</span>' +
                    '<span class="book-meta-item">' +
                        '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>' +
                        escapeHtml(book.pages) +
                    '</span>' +
                '</div>' +
            '</div>';
        el.addEventListener('click', function () {
            openModal(book);
        });
        return el;
    }

    function renderBooks() {
        var grid = els.bookGrid;
        grid.innerHTML = '';
        var list = state.filtered;
        if (list.length === 0) {
            showEmpty(true);
            els.resultCount.textContent = '共 0 本书';
            return;
        }
        showEmpty(false);
        var frag = document.createDocumentFragment();
        for (var i = 0; i < list.length; i++) {
            frag.appendChild(createBookCard(list[i]));
        }
        grid.appendChild(frag);
        els.resultCount.textContent = '共 ' + list.length + ' 本书';
    }

    function applyFiltersAndSort() {
        var f = state.filters;
        var keyword = f.search.trim().toLowerCase();
        var result = state.books.filter(function (b) {
            if (f.language !== 'all' && b.language !== f.language) return false;
            if (f.category !== 'all' && b.category !== f.category) return false;
            if (keyword) {
                var hay = [
                    b.title, b.originalTitle, b.author, b.translator,
                    b.description, b.isbn
                ].join(' ').toLowerCase();
                if (hay.indexOf(keyword) === -1) return false;
            }
            return true;
        });
        result.sort(getSortComparator(state.sort));
        state.filtered = result;
        renderBooks();
    }

    function getSortComparator(sort) {
        switch (sort) {
            case 'rating-asc':
                return function (a, b) { return a.rating - b.rating; };
            case 'rating-desc':
                return function (a, b) { return b.rating - a.rating; };
            case 'year-asc':
                return function (a, b) { return (a.publishYear || 0) - (b.publishYear || 0); };
            case 'year-desc':
                return function (a, b) { return (b.publishYear || 0) - (a.publishYear || 0); };
            case 'title-asc':
                return function (a, b) { return a.title.localeCompare(b.title); };
            case 'title-desc':
                return function (a, b) { return b.title.localeCompare(a.title); };
            default:
                return function () { return 0; };
        }
    }

    function showLoading(show) {
        els.loadingState.style.display = show ? 'flex' : 'none';
        if (show) {
            els.bookGrid.style.display = 'none';
        } else {
            els.bookGrid.style.display = 'grid';
        }
    }

    function showEmpty(show) {
        els.emptyState.style.display = show ? 'flex' : 'none';
    }

    function openModal(book) {
        var langLabel = LANGUAGE_LABELS[book.language] || book.language;
        var catLabel = CATEGORY_LABELS[book.category] || book.category;
        var html = '';
        html += '<div class="book-detail-header">';
        html +=   '<div class="book-detail-cover">';
        if (book.coverUrl) {
            html += '<img src="' + escapeHtml(book.coverUrl) + '" alt="' + escapeHtml(book.title) + '"/>';
        }
        html +=   '</div>';
        html +=   '<div class="book-detail-info">';
        html +=     '<h2 class="book-detail-title" id="modalTitle">' + escapeHtml(book.title) + '</h2>';
        if (book.originalTitle && book.originalTitle !== book.title) {
            html +=   '<p class="book-detail-original">原名：' + escapeHtml(book.originalTitle) + '</p>';
        }
        html +=     '<div class="book-detail-authors">';
        html +=       '<span>作者：<strong>' + escapeHtml(book.author) + '</strong></span>';
        if (book.translator) {
            html += '<span>译者：<strong>' + escapeHtml(book.translator) + '</strong></span>';
        }
        html +=     '</div>';
        html +=     '<div class="book-detail-rating-row">';
        html +=       '<div class="book-detail-rating">' +
                        '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' +
                        escapeHtml(Number(book.rating).toFixed(1)) +
                    '</div>';
        html +=       '<div style="color:var(--text-tertiary)">' + renderStars(book.rating) + '</div>';
        html +=     '</div>';
        html +=     '<div class="book-detail-tags">';
        html +=       '<span class="category-tag">' + escapeHtml(langLabel) + '</span>';
        html +=       '<span class="category-tag">' + escapeHtml(catLabel) + '</span>';
        html +=     '</div>';
        html +=   '</div>';
        html += '</div>';

        html += '<div class="book-detail-body">';
        if (book.description) {
            html += '<div class="book-detail-section">';
            html +=   '<h3 class="section-title">简介</h3>';
            html +=   '<p class="book-description">' + escapeHtml(book.description) + '</p>';
            html += '</div>';
        }
        html +=   '<div class="book-detail-section">';
        html +=     '<h3 class="section-title">书籍信息</h3>';
        html +=     '<div class="book-fields">';
        html +=       '<div class="book-field"><span class="book-field-label">语言</span><span class="book-field-value">' + escapeHtml(langLabel) + '</span></div>';
        html +=       '<div class="book-field"><span class="book-field-label">分类</span><span class="book-field-value">' + escapeHtml(catLabel) + '</span></div>';
        if (book.publishYear) html += '<div class="book-field"><span class="book-field-label">出版年份</span><span class="book-field-value">' + escapeHtml(book.publishYear) + '</span></div>';
        if (book.pages) html += '<div class="book-field"><span class="book-field-label">页数</span><span class="book-field-value">' + escapeHtml(book.pages) + ' 页</span></div>';
        if (book.isbn) html += '<div class="book-field"><span class="book-field-label">ISBN</span><span class="book-field-value">' + escapeHtml(book.isbn) + '</span></div>';
        html +=     '</div>';
        html +=   '</div>';

        if (book.readUrl || book.downloadUrl) {
            html += '<div class="book-detail-section">';
            html +=   '<h3 class="section-title">获取书籍</h3>';
            html +=   '<div class="book-actions">';
            if (book.readUrl) {
                html += '<a class="btn btn-primary" href="' + escapeHtml(book.readUrl) + '" target="_blank" rel="noopener noreferrer">' +
                    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>' +
                    '在线阅读</a>';
            }
            if (book.downloadUrl) {
                html += '<a class="btn btn-secondary" href="' + escapeHtml(book.downloadUrl) + '" target="_blank" rel="noopener noreferrer">' +
                    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
                    '下载书籍</a>';
            }
            html +=   '</div>';
            html += '</div>';
        }
        html += '</div>';

        els.modalBody.innerHTML = html;
        els.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        els.modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    function handleTagClick(container, type, activeClass) {
        container.addEventListener('click', function (e) {
            var btn = e.target.closest('button.tag');
            if (!btn) return;
            var buttons = container.querySelectorAll('button.tag');
            for (var i = 0; i < buttons.length; i++) buttons[i].classList.remove(activeClass);
            btn.classList.add(activeClass);
            state.filters[type] = btn.getAttribute('data-' + type);
            applyFiltersAndSort();
        });
    }

    function initBackToTop() {
        var btn = els.backToTop;
        window.addEventListener('scroll', debounce(function () {
            if (window.pageYOffset > 400) {
                if (btn.style.display === 'none') btn.style.display = 'flex';
                btn.classList.add('show');
            } else {
                btn.classList.remove('show');
                btn.style.display = 'none';
            }
        }, 100));
        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function initEvents() {
        var searchInput = els.searchInput;
        var clearBtn = els.clearSearch;
        var debouncedSearch = debounce(function () {
            state.filters.search = searchInput.value;
            clearBtn.style.display = searchInput.value ? 'flex' : 'none';
            applyFiltersAndSort();
        }, 250);
        searchInput.addEventListener('input', debouncedSearch);
        clearBtn.addEventListener('click', function () {
            searchInput.value = '';
            state.filters.search = '';
            clearBtn.style.display = 'none';
            applyFiltersAndSort();
            searchInput.focus();
        });

        handleTagClick(els.languageTags, 'language', 'active');
        handleTagClick(els.categoryTags, 'category', 'active');

        els.sortSelect.addEventListener('change', function () {
            state.sort = els.sortSelect.value;
            applyFiltersAndSort();
        });

        els.themeToggle.addEventListener('click', toggleTheme);

        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
                var stored = null;
                try { stored = localStorage.getItem('theme'); } catch (err) {}
                if (!stored) {
                    setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }

        els.modalClose.addEventListener('click', closeModal);
        els.modalOverlay.addEventListener('click', closeModal);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && els.modal.style.display === 'flex') {
                closeModal();
            }
        });
    }

    function cacheElements() {
        els.searchInput = qs('searchInput');
        els.clearSearch = qs('clearSearch');
        els.languageTags = qs('languageTags');
        els.categoryTags = qs('categoryTags');
        els.sortSelect = qs('sortSelect');
        els.bookGrid = qs('bookGrid');
        els.loadingState = qs('loadingState');
        els.emptyState = qs('emptyState');
        els.resultCount = qs('resultCount');
        els.backToTop = qs('backToTop');
        els.themeToggle = qs('themeToggle');
        els.modal = qs('modal');
        els.modalOverlay = qs('modalOverlay');
        els.modalClose = qs('modalClose');
        els.modalBody = qs('modalBody');
    }

    function init() {
        cacheElements();
        initTheme();
        initBackToTop();
        initEvents();
        loadBooks();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
