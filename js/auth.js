const Auth = {
  async login(username, password) {
    const { data, error } = await sb.auth.signInWithPassword({ username, password });
    if (error) return { error: error.message === 'Invalid login credentials' ? 'نام کاربری یا رمز عبور اشتباه است' : error.message };
    const profile = await Store.getProfile(data.user.id);
    if (profile && profile.banned) {
      await sb.auth.signOut();
      return { error: 'حساب کاربری شما مسدود شده است' };
    }
    Store._currentUserProfile = profile;
    return { user: data.user, profile };
  },

  async register(fullName, username, password) {
    if (!fullName.trim()) return { error: 'نام کامل را وارد کنید' };
    if (!username.trim()) return { error: 'نام کاربری را وارد کنید' };
    if (username.length < 3) return { error: 'نام کاربری باید حداقل ۳ کاراکتر باشد' };
    if (!password || password.length < 4) return { error: 'رمز عبور باید حداقل ۴ کاراکتر باشد' };

    const { data, error } = await sb.auth.signUp({
      username,
      password,
      options: { data: { full_name: fullName, username } }
    });
    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already exists'))
        return { error: 'نام کاربری قبلاً استفاده شده است' };
      return { error: error.message };
    }
    const profile = await Store.getProfile(data.user.id);
    Store._currentUserProfile = profile;
    return { user: data.user, profile };
  },

  async logout() {
    await sb.auth.signOut();
    Store.clearProfileCache();
    Router.navigate('login');
  },

  async getCurrentUser() { return Store.getCurrentProfile(); },
  async isLoggedIn() {
    const { data: { session } } = await sb.auth.getSession();
    return !!session;
  },
  async isAdmin() {
    const profile = await Store.getCurrentProfile();
    return profile && profile.role === 'admin';
  },

  async requireAuth() {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { Router.navigate('login'); return false; }
    return true;
  },

  async requireAdmin() {
    const authed = await this.requireAuth();
    if (!authed) return false;
    const profile = await Store.getCurrentProfile();
    if (!profile || profile.role !== 'admin') {
      Utils.showToast('دسترسی مدیریتی مورد نیاز است', 'error');
      Router.navigate('home');
      return false;
    }
    return true;
  }
};
