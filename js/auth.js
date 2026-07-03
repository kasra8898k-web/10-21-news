const Auth = {
  async login(username, password) {
    const clean = (username || '').trim();
    if (!clean) throw new Error('نام کاربری را وارد کنید');
    if (!password) throw new Error('رمز عبور را وارد کنید');

    const email = Utils.fakeEmail(clean);

    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message === 'Invalid login credentials')
        throw new Error('نام کاربری یا رمز عبور اشتباه است');
      throw new Error(error.message);
    }

    let profile = await Store.getProfile(data.user.id);
    if (!profile) {
      for (let i = 0; i < 3; i++) {
        await new Promise(r => setTimeout(r, 500 * (i + 1)));
        profile = await Store.getProfile(data.user.id);
        if (profile) break;
      }
    }
    if (profile && profile.banned) {
      await sb.auth.signOut();
      throw new Error('حساب کاربری شما مسدود شده است');
    }
    Store._currentUserProfile = profile;
    return { user: data.user, profile };
  },

  async register(fullName, username, password) {
    if (!fullName.trim()) throw new Error('نام کامل را وارد کنید');
    if (!username.trim()) throw new Error('نام کاربری را وارد کنید');
    if (username.length < 3) throw new Error('نام کاربری باید حداقل ۳ کاراکتر باشد');
    if (!password || password.length < 4) throw new Error('رمز عبور باید حداقل ۴ کاراکتر باشد');

    const email = Utils.fakeEmail(username);

    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName.trim(), username: username.trim() } }
    });
    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already exists'))
        throw new Error('نام کاربری قبلاً استفاده شده است');
      throw new Error(error.message);
    }

    let profile = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
      profile = await Store.getProfile(data.user.id);
      if (profile) break;
    }
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
    try {
      const { data: { session } } = await sb.auth.getSession();
      return !!session;
    } catch { return false; }
  },

  async isAdmin() {
    const profile = await Store.getCurrentProfile();
    return profile && profile.role === 'admin';
  },

  async requireAuth() {
    try {
      const { data: { session } } = await sb.auth.getSession();
      if (!session) { Router.navigate('login'); return false; }
      return true;
    } catch {
      Router.navigate('login');
      return false;
    }
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
