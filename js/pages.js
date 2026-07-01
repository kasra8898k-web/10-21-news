const Pages = {
  render(content) {
    const app = document.getElementById('app');
    const navHtml = Auth.isLoggedIn() ? Components.navbar() : '';
    const isLoginPage = location.hash === '#/login' || location.hash === '#/register' || location.hash === '';
    app.innerHTML = `
      ${!isLoginPage ? navHtml : ''}
      <main class="${!isLoginPage ? 'pt-0' : ''}">${content}</main>`;
    if (!isLoginPage) {
      window.scrollTo(0, 0);
      const main = app.querySelector('main');
      if (main) main.classList.add('page-enter');
      this.initNavbarScroll();
      this.initSearch();
    }
  },

  initNavbarScroll() {
    const navbar = document.getElementById('mainNavbar');
    if (!navbar) return;
    const handler = () => {
      if (window.scrollY > 10) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    };
    window.removeEventListener('scroll', handler);
    window.addEventListener('scroll', handler);
  },

  initSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = input.value.trim();
        if (q) Router.navigate('search', { q });
      }
    });
  },

  _getGreeting() {
    const h = new Date().getHours();
    if (h < 6) return 'شب بخیر';
    if (h < 12) return 'صبح بخیر';
    if (h < 17) return 'عصر بخیر';
    return 'شب بخیر';
  },

  // ---- HOME ----
  home() {
    if (!Auth.requireAuth()) return;
    const user = Auth.getCurrentUser();
    const allNews = Store.getAll('news').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const importantNews = allNews.filter(n => n.isImportant).slice(0, 3);
    const latestNews = allNews.slice(0, 6);
    const allTasks = Store.getAll('tasks').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
    const groups = Utils.getCategoryGroups();

    this.render(`
    <div class="hero-gradient text-white py-20 md:py-28 relative">
      <div class="hero-floating" style="width:400px;height:400px;top:-100px;left:-100px"></div>
      <div class="hero-floating" style="width:300px;height:300px;bottom:-80px;right:-60px;background:rgba(255,255,255,.04)"></div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="max-w-3xl">
          <p class="text-red-300/80 text-sm mb-4 font-medium tracking-wide">${this._getGreeting()}، ${Utils.escapeHtml(user.fullName)}</p>
          <h1 class="text-3xl md:text-5xl font-black mb-5 leading-tight" style="text-shadow:0 2px 20px rgba(0,0,0,.2)">۱۰.۲۱ <span style="color:#f87171">نيوز</span></h1>
          <p class="text-gray-300/80 text-lg md:text-xl mb-10 leading-relaxed max-w-xl">پایگاه خبری و تکالیف جامع و به‌روز</p>
          <div class="flex gap-3 flex-wrap">
            <a href="#/news" class="btn btn-red btn-lg">آخرین اخبار</a>
            <a href="#/important" class="btn btn-outline btn-lg">اخبار مهم</a>
          </div>
        </div>
      </div>
    </div>

    ${importantNews.length > 0 ? `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7 relative z-10">
      <div class="grid md:grid-cols-3 gap-4 stagger">
        ${importantNews.map(n => `
          <a href="#/news/${n.id}" class="important-card">
            <div class="important-icon">
              <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-1">
                ${n.isBreaking ? '<span class="text-xs font-bold" style="color:#CA8A04">فوری</span>' : ''}
              </div>
              <h3 class="font-bold text-sm text-gray-900 line-clamp-2 leading-6">${Utils.escapeHtml(n.title)}</h3>
              <span class="text-xs text-gray-400 mt-1.5 block">${Utils.timeAgo(n.createdAt)}</span>
            </div>
          </a>
        `).join('')}
      </div>
    </div>` : ''}

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div class="grid lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
          <div class="flex items-center justify-between mb-8">
            <h2 class="section-label">آخرین اخبار</h2>
            <a href="#/news" class="text-sm text-red-500 hover:text-red-600 font-medium transition-colors">مشاهده همه →</a>
          </div>
          <div class="grid sm:grid-cols-2 gap-5 stagger">
            ${latestNews.length > 0 ?
              latestNews.map(n => Components.newsCard(n, 'news')).join('') :
              Components.emptyState('هنوز خبری منتشر نشده است.')}
          </div>
        </div>
        <div>
          <div class="sidebar-card p-6 sticky top-20">
            <h3 class="section-label mb-5" style="font-size:1rem">تکالیف جاری</h3>
            ${allTasks.length > 0 ? allTasks.map(t => `
              <a href="#/tasks/${t.id}" class="task-row mb-1">
                <h4 class="font-medium text-sm mb-1.5 text-gray-900">${Utils.escapeHtml(t.title)}</h4>
                <div class="flex items-center gap-2 text-xs text-gray-400">
                  <span class="badge text-xs" style="background:${Utils.getCategoryColor(t.category).bg};color:${Utils.getCategoryColor(t.category).text}">${t.category}</span>
                  <span>·</span>
                  <span>${Utils.timeAgo(t.createdAt)}</span>
                </div>
              </a>
            `).join('') : '<p class="text-sm text-gray-400 py-4 text-center">تکلیفی ثبت نشده است.</p>'}

            <div class="mt-6 pt-5 border-t border-gray-100">
              <h4 class="font-bold text-sm mb-3 text-gray-900">دسته‌بندی‌ها</h4>
              ${groups.map(g => `
                <div class="mb-3">
                  <p class="text-xs text-gray-400 font-medium mb-2">${g.group}</p>
                  <div class="flex flex-wrap gap-2">
                    ${g.items.map(cat => {
                      const c = Utils.getCategoryColor(cat);
                      return `<a href="#/news?cat=${encodeURIComponent(cat)}" class="badge text-xs hover:scale-105 transition-transform cursor-pointer" style="background:${c.bg};color:${c.text}">${cat}</a>`;
                    }).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>`);
  },

  // ---- NEWS LISTING ----
  newsList() {
    if (!Auth.requireAuth()) return;
    const params = new URLSearchParams(location.hash.split('?')[1] || '');
    const cat = params.get('cat');
    let news = Store.getAll('news').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (cat) news = news.filter(n => n.category === cat);

    const allCats = Utils.getAllCategoryNames();
    const activeCats = [...new Set(Store.getAll('news').map(n => n.category))];
    const displayCats = ['همه', ...allCats.filter(c => activeCats.includes(c))];
    const groups = Utils.getCategoryGroups();

    this.render(`
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="mb-10">
        <h1 class="section-label text-2xl mb-3">اخبار</h1>
        <p class="text-gray-500">آخرین اخبار و رویدادها</p>
      </div>
      <div class="mb-8 space-y-3">
        ${groups.map(g => {
          const groupCats = g.items.filter(c => displayCats.includes(c));
          if (groupCats.length === 0) return '';
          return `
          <div>
            <p class="text-xs text-gray-400 font-medium mb-2">${g.group}</p>
            <div class="flex flex-wrap gap-2">
              ${groupCats.map(c => {
                const isActive = c === cat;
                const color = Utils.getCategoryColor(c);
                return `<button onclick="location.hash='#/news?cat=${encodeURIComponent(c)}'" class="badge text-sm cursor-pointer transition-all ${isActive ? 'ring-2 ring-red-500' : ''}" style="background:${color.bg};color:${color.text}">${c}</button>`;
              }).join('')}
            </div>
          </div>`;
        }).join('')}
        <button onclick="location.hash='#/news'" class="badge text-sm cursor-pointer transition-all ${!cat ? 'ring-2 ring-red-500' : ''}" style="${!cat ? 'background:#C8102E;color:white' : 'background:#f3f4f6;color:#374151'}">همه</button>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
        ${news.length > 0 ?
          news.map(n => Components.newsCard(n, 'news')).join('') :
          Components.emptyState('خبری یافت نشد.')}
      </div>
    </div>`);
  },

  // ---- SINGLE NEWS ----
  newsDetail(id) {
    if (!Auth.requireAuth()) return;
    const item = Store.getById('news', id);
    if (!item) { this.render(Components.emptyState('خبر یافت نشد.')); return; }
    const author = Store.getById('users', item.authorId);
    const catColor = Utils.getCategoryColor(item.category);
    const allNews = Store.getAll('news').filter(n => n.id !== id).slice(0, 4);

    this.render(`
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <a href="#/news" class="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 mb-8 transition-colors">
        <svg class="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        بازگشت به لیست اخبار
      </a>
      <article class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-100" style="box-shadow:0 1px 3px rgba(0,0,0,.04),0 8px 24px rgba(0,0,0,.03)">
        <div class="flex items-center gap-2.5 mb-5 flex-wrap">
          <span class="badge text-xs" style="background:${catColor.bg};color:${catColor.text}">${item.category}</span>
          ${item.isImportant ? '<span class="badge text-xs" style="background:linear-gradient(135deg,#C8102E,#A50D24);color:#fff">مهم</span>' : ''}
          ${item.isBreaking ? '<span class="badge text-xs" style="background:linear-gradient(135deg,#FACC15,#EAB308);color:#713F12">خبر فوری</span>' : ''}
          <span class="text-xs text-gray-400">${Utils.persianDate(item.createdAt)}</span>
        </div>
        <h1 class="text-2xl md:text-3xl font-black mb-5 leading-8">${Utils.escapeHtml(item.title)}</h1>
        <div class="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
          <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm" style="background:linear-gradient(135deg,rgba(200,16,46,.08),rgba(200,16,46,.18));color:#C8102E">
            ${author ? author.fullName.charAt(0) : '?'}
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">${author ? Utils.escapeHtml(author.fullName) : 'ناشناس'}</p>
            <p class="text-xs text-gray-400">${Utils.timeAgo(item.createdAt)}</p>
          </div>
        </div>
        ${item.image ? `<img src="${item.image}" alt="${Utils.escapeHtml(item.title)}" class="w-full rounded-xl mb-6 max-h-96 object-cover">` : ''}
        <div class="prose prose-lg max-w-none text-gray-700 leading-8 text-justify whitespace-pre-line">${Utils.escapeHtml(item.content)}</div>
      </article>
      ${Components.commentSection('news', item.id)}
      ${allNews.length > 0 ? `
      <div class="mt-12 border-t border-gray-100 pt-8">
        <h3 class="section-label mb-5">اخبار مرتبط</h3>
        <div class="grid sm:grid-cols-2 gap-5 stagger">
          ${allNews.map(n => Components.newsCard(n, 'news')).join('')}
        </div>
      </div>` : ''}
    </div>`);
  },

  // ---- TASKS LISTING ----
  tasksList() {
    if (!Auth.requireAuth()) return;
    const params = new URLSearchParams(location.hash.split('?')[1] || '');
    const cat = params.get('cat');
    let tasks = Store.getAll('tasks').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (cat) tasks = tasks.filter(t => t.category === cat);

    const allCats = Utils.getAllCategoryNames();
    const activeCats = [...new Set(Store.getAll('tasks').map(t => t.category))];
    const displayCats = ['همه', ...allCats.filter(c => activeCats.includes(c))];
    const groups = Utils.getCategoryGroups();

    this.render(`
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="mb-10">
        <h1 class="section-label text-2xl mb-3">تکالیف</h1>
        <p class="text-gray-500">تکالیف و مأموریت‌های درسی و فوق‌برنامه</p>
      </div>
      <div class="mb-8 space-y-3">
        ${groups.map(g => {
          const groupCats = g.items.filter(c => displayCats.includes(c));
          if (groupCats.length === 0) return '';
          return `
          <div>
            <p class="text-xs text-gray-400 font-medium mb-2">${g.group}</p>
            <div class="flex flex-wrap gap-2">
              ${groupCats.map(c => {
                const isActive = c === cat;
                const color = Utils.getCategoryColor(c);
                return `<button onclick="location.hash='#/tasks?cat=${encodeURIComponent(c)}'" class="badge text-sm cursor-pointer transition-all ${isActive ? 'ring-2 ring-red-500' : ''}" style="background:${color.bg};color:${color.text}">${c}</button>`;
              }).join('')}
            </div>
          </div>`;
        }).join('')}
        <button onclick="location.hash='#/tasks'" class="badge text-sm cursor-pointer transition-all ${!cat ? 'ring-2 ring-red-500' : ''}" style="${!cat ? 'background:#C8102E;color:white' : 'background:#f3f4f6;color:#374151'}">همه</button>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
        ${tasks.length > 0 ?
          tasks.map(t => Components.newsCard(t, 'tasks')).join('') :
          Components.emptyState('تکلیفی ثبت نشده است.')}
      </div>
    </div>`);
  },

  // ---- SINGLE TASK ----
  taskDetail(id) {
    if (!Auth.requireAuth()) return;
    const item = Store.getById('tasks', id);
    if (!item) { this.render(Components.emptyState('تکلیف یافت نشد.')); return; }
    const author = Store.getById('users', item.authorId);
    const catColor = Utils.getCategoryColor(item.category);

    this.render(`
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <a href="#/tasks" class="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 mb-8 transition-colors">
        <svg class="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        بازگشت به لیست تکالیف
      </a>
      <article class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-100" style="box-shadow:0 1px 3px rgba(0,0,0,.04),0 8px 24px rgba(0,0,0,.03)">
        <div class="flex items-center gap-2.5 mb-5 flex-wrap">
          <span class="badge text-xs" style="background:${catColor.bg};color:${catColor.text}">${item.category}</span>
          ${item.isImportant ? '<span class="badge text-xs" style="background:linear-gradient(135deg,#C8102E,#A50D24);color:#fff">مهم</span>' : ''}
          ${item.isBreaking ? '<span class="badge text-xs" style="background:linear-gradient(135deg,#FACC15,#EAB308);color:#713F12">خبر فوری</span>' : ''}
          <span class="text-xs text-gray-400">${Utils.persianDate(item.createdAt)}</span>
        </div>
        <h1 class="text-2xl md:text-3xl font-black mb-5 leading-8">${Utils.escapeHtml(item.title)}</h1>
        <div class="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
          <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm" style="background:linear-gradient(135deg,rgba(200,16,46,.08),rgba(200,16,46,.18));color:#C8102E">
            ${author ? author.fullName.charAt(0) : '?'}
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">${author ? Utils.escapeHtml(author.fullName) : 'ناشناس'}</p>
            <p class="text-xs text-gray-400">${Utils.timeAgo(item.createdAt)}</p>
          </div>
        </div>
        ${item.image ? `<img src="${item.image}" alt="${Utils.escapeHtml(item.title)}" class="w-full rounded-xl mb-6 max-h-96 object-cover">` : ''}
        <div class="prose prose-lg max-w-none text-gray-700 leading-8 text-justify whitespace-pre-line">${Utils.escapeHtml(item.content)}</div>
      </article>
      ${Components.commentSection('task', item.id)}
    </div>`);
  },

  // ---- IMPORTANT NEWS ----
  importantNews() {
    if (!Auth.requireAuth()) return;
    const important = Store.getAll('news').filter(n => n.isImportant).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    this.render(`
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="mb-10">
        <h1 class="section-label text-2xl mb-3">اخبار مهم</h1>
        <p class="text-gray-500">اخبار مهم و ویژه توسط مدیریت</p>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
        ${important.length > 0 ?
          important.map(n => Components.newsCard(n, 'news')).join('') :
          Components.emptyState('اخبار مهمی ثبت نشده است.')}
      </div>
    </div>`);
  },

  // ---- SEARCH ----
  search() {
    if (!Auth.requireAuth()) return;
    const params = new URLSearchParams(location.hash.split('?')[1] || '');
    const q = params.get('q') || '';
    let results = [];
    if (q) {
      const newsResults = Utils.search(q, Store.getAll('news'), ['title', 'content', 'category', 'excerpt']).map(n => ({ ...n, _type: 'news' }));
      const taskResults = Utils.search(q, Store.getAll('tasks'), ['title', 'content', 'category', 'excerpt']).map(t => ({ ...t, _type: 'tasks' }));
      results = [...newsResults, ...taskResults].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    this.render(`
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="mb-10">
        <h1 class="section-label text-2xl mb-3">نتایج جستجو</h1>
        <p class="text-gray-500">${q ? `نتایج جستجو برای «${Utils.escapeHtml(q)}» (${results.length} نتیجه)` : 'عبارتی وارد کنید'}</p>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
        ${results.length > 0 ?
          results.map(r => Components.newsCard(r, r._type)).join('') :
          Components.emptyState('نتیجه‌ای یافت نشد.')}
      </div>
    </div>`);
  },

  // ---- LOGIN ----
  login() {
    if (Auth.isLoggedIn()) { Router.navigate('home'); return; }
    this.render(`
    <div class="min-h-screen flex items-center justify-center px-4" style="background:linear-gradient(135deg,#1a1f2e 0%,#3d0a14 45%,#8B0B1E 100%);position:relative;overflow:hidden">
      <div class="hero-floating" style="width:500px;height:500px;top:-150px;left:-150px"></div>
      <div class="hero-floating" style="width:400px;height:400px;bottom:-100px;right:-80px;background:rgba(255,255,255,.03)"></div>
      <div class="w-full max-w-md relative z-10">
        <div class="text-center mb-8">
          <div class="inline-block mb-4">${Components.logo()}</div>
          <h1 class="text-2xl font-bold text-white mt-4">ورود به حساب کاربری</h1>
          <p class="text-gray-400/70 text-sm mt-2">برای دسترسی به محتوا وارد شوید</p>
        </div>
        <div class="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl slide-up" style="box-shadow:0 20px 60px rgba(0,0,0,.3)">
          <form onsubmit="Pages.handleLogin(event)">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1.5">نام کاربری</label>
              <input type="text" id="loginUsername" class="input" placeholder="نام کاربری خود را وارد کنید" required>
            </div>
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-1.5">رمز عبور</label>
              <input type="password" id="loginPassword" class="input" placeholder="رمز عبور" required>
            </div>
            <button type="submit" class="btn btn-red w-full btn-lg" style="box-shadow:0 4px 16px rgba(200,16,46,.3)">ورود</button>
          </form>
          <div class="mt-6 text-center">
            <p class="text-sm text-gray-500">
              حساب کاربری ندارید؟
              <a href="#/register" class="text-red-500 hover:text-red-600 font-medium transition-colors">ثبت‌نام کنید</a>
            </p>
          </div>
        </div>
      </div>
    </div>`);
  },

  handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const result = Auth.login(username, password);
    if (result.error) Utils.showToast(result.error, 'error');
    else { Utils.showToast('خوش آمدید!', 'success'); Router.navigate('home'); }
  },

  // ---- REGISTER ----
  register() {
    if (Auth.isLoggedIn()) { Router.navigate('home'); return; }
    this.render(`
    <div class="min-h-screen flex items-center justify-center px-4" style="background:linear-gradient(135deg,#1a1f2e 0%,#3d0a14 45%,#8B0B1E 100%);position:relative;overflow:hidden">
      <div class="hero-floating" style="width:500px;height:500px;top:-150px;left:-150px"></div>
      <div class="hero-floating" style="width:400px;height:400px;bottom:-100px;right:-80px;background:rgba(255,255,255,.03)"></div>
      <div class="w-full max-w-md relative z-10">
        <div class="text-center mb-8">
          <div class="inline-block mb-4">${Components.logo()}</div>
          <h1 class="text-2xl font-bold text-white mt-4">ایجاد حساب کاربری</h1>
          <p class="text-gray-400/70 text-sm mt-2">عضویت در ۱۰.۲۱ نیوز</p>
        </div>
        <div class="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl slide-up" style="box-shadow:0 20px 60px rgba(0,0,0,.3)">
          <form onsubmit="Pages.handleRegister(event)">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1.5">نام کامل</label>
              <input type="text" id="regFullName" class="input" placeholder="نام و نام خانوادگی" required>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1.5">نام کاربری</label>
              <input type="text" id="regUsername" class="input" placeholder="نام کاربری (حداقل ۳ کاراکتر)" required>
            </div>
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-1.5">رمز عبور</label>
              <input type="password" id="regPassword" class="input" placeholder="رمز عبور (حداقل ۴ کاراکتر)" required>
            </div>
            <button type="submit" class="btn btn-red w-full btn-lg" style="box-shadow:0 4px 16px rgba(200,16,46,.3)">ثبت‌نام</button>
          </form>
          <div class="mt-6 text-center">
            <p class="text-sm text-gray-500">
              قبلاً ثبت‌نام کرده‌اید؟
              <a href="#/login" class="text-red-500 hover:text-red-600 font-medium transition-colors">وارد شوید</a>
            </p>
          </div>
        </div>
      </div>
    </div>`);
  },

  handleRegister(e) {
    e.preventDefault();
    const fullName = document.getElementById('regFullName').value;
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const result = Auth.register(fullName, username, password);
    if (result.error) Utils.showToast(result.error, 'error');
    else { Utils.showToast('ثبت‌نام موفقیت‌آمیز بود!', 'success'); Router.navigate('home'); }
  },

  // ---- PROFILE ----
  profile() {
    if (!Auth.requireAuth()) return;
    const user = Auth.getCurrentUser();
    const myNews = Store.getAll('news').filter(n => n.authorId === user.id);
    const myComments = Store.getAll('comments').filter(c => c.userId === user.id);
    this.render(`
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="profile-card bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-8 slide-up border border-gray-100" style="box-shadow:0 1px 3px rgba(0,0,0,.04),0 8px 24px rgba(0,0,0,.03)">
        <div class="profile-header flex items-center gap-5 mb-8">
          <div class="profile-avatar w-20 h-20 rounded-2xl flex items-center justify-center font-black text-3xl" style="background:linear-gradient(135deg,rgba(200,16,46,.08),rgba(200,16,46,.18));color:#C8102E">${user.fullName.charAt(0)}</div>
          <div>
            <h1 class="text-xl sm:text-2xl font-black">${Utils.escapeHtml(user.fullName)}</h1>
            <p class="text-gray-500 mt-0.5">@${Utils.escapeHtml(user.username)}</p>
            <span class="badge mt-2 ${user.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}">${user.role === 'admin' ? 'مدیر' : 'کاربر'}</span>
          </div>
        </div>
        <div class="profile-stats grid grid-cols-3 gap-4 text-center border-t border-gray-100 pt-6">
          <div>
            <p class="text-xl sm:text-2xl font-black text-red-500">${myNews.length}</p>
            <p class="text-xs sm:text-sm text-gray-500">اخبار</p>
          </div>
          <div>
            <p class="text-xl sm:text-2xl font-black text-red-500">${myComments.length}</p>
            <p class="text-xs sm:text-sm text-gray-500">نظرات</p>
          </div>
          <div>
            <p class="text-xl sm:text-2xl font-black text-red-500">${Utils.persianDate(user.createdAt)}</p>
            <p class="text-xs sm:text-sm text-gray-500">تاریخ عضویت</p>
          </div>
        </div>
      </div>
      ${myNews.length > 0 ? `
      <div>
        <h2 class="section-label mb-5">اخبار منتشر شده</h2>
        <div class="grid sm:grid-cols-2 gap-5 stagger">
          ${myNews.map(n => Components.newsCard(n, 'news')).join('')}
        </div>
      </div>` : ''}
    </div>`);
  },

  // ---- COMMENT SUBMIT ----
  submitComment(entityType, entityId) {
    const textarea = document.getElementById('commentText');
    if (!textarea) return;
    const text = textarea.value.trim();
    if (!text) { Utils.showToast('نظر نمی‌تواند خالی باشد', 'error'); return; }
    const user = Auth.getCurrentUser();
    Store.create('comments', { entityType, entityId, userId: user.id, text, approved: false });
    textarea.value = '';
    Utils.showToast('نظر شما ثبت شد و پس از تأیید نمایش داده خواهد شد.', 'success');
  }
};
