const Utils = {
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  },

  persianDate(dateStr) {
    const d = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    try { return d.toLocaleDateString('fa-IR', options); }
    catch { return d.toLocaleDateString('fa'); }
  },

  persianDateTime(dateStr) {
    const d = new Date(dateStr);
    try {
      return d.toLocaleDateString('fa-IR', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch { return d.toLocaleDateString('fa'); }
  },

  timeAgo(dateStr) {
    const now = new Date();
    const d = new Date(dateStr);
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'همین الان';
    if (diff < 3600) return `${Math.floor(diff / 60)} دقیقه پیش`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ساعت پیش`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} روز پیش`;
    return Utils.persianDate(dateStr);
  },

  truncate(text, maxLen = 150) {
    if (!text || text.length <= maxLen) return text;
    return text.substring(0, maxLen) + '...';
  },

  search(query, items, fields) {
    if (!query || !query.trim()) return items;
    const q = query.trim().toLowerCase();
    return items.filter(item =>
      fields.some(f => item[f] && item[f].toLowerCase().includes(q))
    );
  },

  showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const colors = { success: '#059669', error: '#DC2626', info: '#2563EB', warning: '#D97706' };
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.background = colors[type] || colors.success;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  getCategoryColor(category) {
    const colors = {
      'ریاضی':         { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
      'زیست‌شناسی':    { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
      'شیمی':          { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE' },
      'فیزیک':         { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' },
      'عمومی':         { bg: '#FDF2F8', text: '#BE185D', border: '#FBCFE8' },
      'خارج از درس':   { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' },
      'تابستانی':      { bg: '#FEF9C3', text: '#A16207', border: '#FDE68A' },
      'تعطیلی':        { bg: '#F0FDFA', text: '#0F766E', border: '#99F6E4' },
      'جنگ':           { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' },
      'بیانیه‌های رسمی': { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
      'صحبت‌های مدرسه': { bg: '#EDE9FE', text: '#5B21B6', border: '#DDD6FE' }
    };
    return colors[category] || { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' };
  },

  getCategoryGroups() {
    return [
      { group: 'موضوعات درسی', items: ['ریاضی', 'زیست‌شناسی', 'شیمی', 'فیزیک', 'عمومی'] },
      { group: 'خارج از درس', items: ['خارج از درس', 'تابستانی', 'تعطیلی', 'جنگ', 'بیانیه‌های رسمی', 'صحبت‌های مدرسه'] }
    ];
  },

  getAllCategoryNames() {
    return this.getCategoryGroups().flatMap(g => g.items);
  }
};
