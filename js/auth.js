const Auth = {
  login(username, password) {
    const user = Store.getUserByUsername(username);
    if (!user) return { error: 'نام کاربری یافت نشد' };
    if (user.banned) return { error: 'حساب کاربری شما مسدود شده است' };
    if (user.password !== password) return { error: 'رمز عبور اشتباه است' };
    Store.setCurrentUser(user);
    return { user };
  },

  register(fullName, username, password) {
    if (!fullName.trim()) return { error: 'نام کامل را وارد کنید' };
    if (!username.trim()) return { error: 'نام کاربری را وارد کنید' };
    if (username.length < 3) return { error: 'نام کاربری باید حداقل ۳ کاراکتر باشد' };
    if (!password || password.length < 4) return { error: 'رمز عبور باید حداقل ۴ کاراکتر باشد' };
    if (Store.getUserByUsername(username)) return { error: 'نام کاربری قبلاً استفاده شده است' };
    const user = Store.create('users', { fullName, username, password, role: 'user', banned: false, canComment: true });
    Store.setCurrentUser(user);
    return { user };
  },

  logout() {
    Store.setCurrentUser(null);
    Router.navigate('login');
  },

  getCurrentUser() { return Store.getCurrentUser(); },
  isLoggedIn() { return !!Store.getCurrentUser(); },
  isAdmin() { return Store.isAdmin(); },

  requireAuth() {
    if (!this.isLoggedIn()) { Router.navigate('login'); return false; }
    return true;
  },

  requireAdmin() {
    if (!this.requireAuth()) return false;
    if (!this.isAdmin()) {
      Utils.showToast('دسترسی مدیریتی مورد نیاز است', 'error');
      Router.navigate('home');
      return false;
    }
    return true;
  }
};
