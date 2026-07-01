const Router = {
  routes: {},

  register(name, handler) { this.routes[name] = handler; },

  navigate(route, params = {}) {
    let hash = '#/' + route;
    const query = Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
    if (query) hash += '?' + query;
    location.hash = hash;
  },

  getCurrentRoute() {
    const hash = location.hash.slice(1) || '/login';
    const [path, queryString] = hash.split('?');
    const segments = path.split('/').filter(Boolean);
    const params = {};
    if (queryString) new URLSearchParams(queryString).forEach((v, k) => { params[k] = v; });
    return { segments, params, raw: path };
  },

  handleRoute() {
    try {
      const { segments, params } = this.getCurrentRoute();
      const route = segments[0] || 'login';
      const id = segments[1] || null;

      const mm = document.getElementById('mobileMenu');
      const mo = document.getElementById('mobileOverlay');
      if (mm) mm.classList.remove('open');
      if (mo) mo.classList.remove('open');
      document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.add('hidden'));

      switch (route) {
        case 'login': Pages.login(); break;
        case 'register': Pages.register(); break;
        case 'home': Pages.home(); break;
        case 'news':
          if (id) Pages.newsDetail(id);
          else Pages.newsList();
          break;
        case 'tasks':
          if (id) Pages.taskDetail(id);
          else Pages.tasksList();
          break;
        case 'important': Pages.importantNews(); break;
        case 'search': Pages.search(); break;
        case 'profile': Pages.profile(); break;
        case 'admin':
          if (!Auth.requireAuth()) return;
          if (!id) Admin.dashboard();
          else if (id === 'news') {
            if (segments[2] === 'new') Admin.addNews();
            else Admin.manageNews();
          }
          else if (id === 'tasks') {
            if (segments[2] === 'new') Admin.addTask();
            else Admin.manageTasks();
          }
          else if (id === 'users') Admin.manageUsers();
          else if (id === 'comments') Admin.manageComments();
          else if (id === 'news-list') Admin.manageNews();
          else if (id === 'tasks-list') Admin.manageTasks();
          else Admin.dashboard();
          break;
        default: Pages.login();
      }
    } catch (e) {
      console.error('Route error:', e);
      document.getElementById('app').innerHTML = `
        <div class="min-h-screen flex items-center justify-center">
          <div class="text-center">
            <h1 class="text-xl font-bold mb-2">خطا در بارگذاری صفحه</h1>
            <p class="text-gray-500 text-sm mb-4">${Utils.escapeHtml(e.message)}</p>
            <a href="#/login" class="btn btn-red">بازگشت به صفحه ورود</a>
          </div>
        </div>`;
    }
  },

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    if (!location.hash) location.hash = '#/login';
    this.handleRoute();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  try {
    Store.init();
    Router.init();
  } catch (e) {
    console.error('Init error:', e);
    document.getElementById('app').innerHTML = `
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <h1 class="text-xl font-bold mb-2">خطا در بارگذاری برنامه</h1>
          <p class="text-gray-500 text-sm mb-4">لطفاً کش مرورگر را پاک کرده و دوباره تلاش کنید.</p>
          <button onclick="localStorage.clear(); location.reload();" class="btn btn-red">پاک کردن داده و بارگذاری مجدد</button>
        </div>
      </div>`;
  }
});
