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

  async handleRoute() {
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
        case 'login': await Pages.login(); break;
        case 'register': await Pages.register(); break;
        case 'home': await Pages.home(); break;
        case 'news':
          if (id) await Pages.newsDetail(id);
          else await Pages.newsList();
          break;
        case 'tasks':
          if (id) await Pages.taskDetail(id);
          else await Pages.tasksList();
          break;
        case 'important': await Pages.importantNews(); break;
        case 'search': await Pages.search(); break;
        case 'profile': await Pages.profile(); break;
        case 'admin':
          if (!(await Auth.requireAuth())) return;
          if (!id) await Admin.dashboard();
          else if (id === 'news') {
            if (segments[2] === 'new') await Admin.addNews();
            else await Admin.manageNews();
          }
          else if (id === 'tasks') {
            if (segments[2] === 'new') await Admin.addTask();
            else await Admin.manageTasks();
          }
          else if (id === 'users') await Admin.manageUsers();
          else if (id === 'comments') await Admin.manageComments();
          else if (id === 'news-list') await Admin.manageNews();
          else if (id === 'tasks-list') await Admin.manageTasks();
          else await Admin.dashboard();
          break;
        default: await Pages.login();
      }
    } catch (e) {
      console.error('Route error:', e);
      document.getElementById('app').innerHTML = `
        <div class="min-h-screen flex items-center justify-center px-4">
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

let _scrollHandler = null;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
      const profile = await Store.getProfile(session.user.id);
      if (profile && profile.banned) {
        await sb.auth.signOut();
      } else {
        Store._currentUserProfile = profile;
      }
    }
  } catch (e) {
    console.error('Init session error:', e);
  }
  Router.init();
});
