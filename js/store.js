const Store = {
  _db: null,

  init() {
    try {
      const saved = localStorage.getItem('ten21_db');
      if (saved) {
        this._db = JSON.parse(saved);
        if (!this._db || typeof this._db !== 'object') throw new Error('Invalid DB');
        if (!Array.isArray(this._db.users)) this._db.users = [];
        if (!Array.isArray(this._db.news)) this._db.news = [];
        if (!Array.isArray(this._db.tasks)) this._db.tasks = [];
        if (!Array.isArray(this._db.comments)) this._db.comments = [];
        return;
      }
    } catch (e) {
      console.warn('Corrupted DB in localStorage, resetting:', e.message);
      localStorage.removeItem('ten21_db');
    }
    this._db = this._seed();
    this._save();
  },

  _save() {
    try {
      localStorage.setItem('ten21_db', JSON.stringify(this._db));
    } catch (e) {
      console.error('Failed to save to localStorage:', e.message);
      Utils.showToast('خطا در ذخیره‌سازی. ممکن است فضای ذخیره‌سازی پر باشد.', 'error');
    }
  },

  _seed() {
    const adminId = Utils.generateId();
    return {
      users: [
        { id: adminId, fullName: 'مدیر سایت', username: 'admin', password: '1234', role: 'admin', banned: false, canComment: true, createdAt: new Date().toISOString() }
      ],
      news: [],
      tasks: [],
      comments: [],
      currentUser: null
    };
  },

  getAll(collection) { return this._db[collection] || []; },

  getById(collection, id) {
    return (this._db[collection] || []).find(item => item.id === id);
  },

  create(collection, data) {
    if (!this._db[collection]) this._db[collection] = [];
    const item = { id: Utils.generateId(), ...data, createdAt: new Date().toISOString() };
    this._db[collection].push(item);
    this._save();
    return item;
  },

  update(collection, id, data) {
    const idx = this._db[collection].findIndex(item => item.id === id);
    if (idx === -1) return null;
    this._db[collection][idx] = { ...this._db[collection][idx], ...data };
    this._save();
    return this._db[collection][idx];
  },

  remove(collection, id) {
    this._db[collection] = this._db[collection].filter(item => item.id !== id);
    this._save();
  },

  getUserByUsername(username) {
    return this._db.users.find(u => u.username === username);
  },

  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  },

  getCurrentUser() {
    if (this._db.currentUser) {
      const user = this.getById('users', this._db.currentUser.id);
      if (!user) {
        this._db.currentUser = null;
        this._save();
      }
      return user;
    }
    return null;
  },

  setCurrentUser(user) {
    this._db.currentUser = user ? { id: user.id } : null;
    this._save();
  },

  getApprovedComments(entityType, entityId) {
    return this._db.comments.filter(c =>
      c.entityType === entityType && c.entityId === entityId && c.approved
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getPendingComments() {
    return this._db.comments.filter(c => !c.approved);
  },

  approveComment(id) {
    this.update('comments', id, { approved: true });
  },

  getStats() {
    return {
      totalUsers: this._db.users.length,
      totalNews: this._db.news.length,
      totalTasks: this._db.tasks.length,
      totalComments: this._db.comments.length,
      pendingComments: this._db.comments.filter(c => !c.approved).length,
      bannedUsers: this._db.users.filter(u => u.banned).length
    };
  }
};
