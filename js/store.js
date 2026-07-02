const Store = {
  _currentUserProfile: null,

  async getProfile(userId) {
    const { data, error } = await sb.from('profiles').select('*').eq('id', userId).single();
    if (error) { console.error('getProfile error:', error); return null; }
    return data;
  },

  async getCurrentProfile() {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return null;
    if (this._currentUserProfile && this._currentUserProfile.id === session.user.id) {
      return this._currentUserProfile;
    }
    this._currentUserProfile = await this.getProfile(session.user.id);
    return this._currentUserProfile;
  },

  clearProfileCache() { this._currentUserProfile = null; },

  async getAll(collection) {
    const { data, error } = await sb.from(collection).select('*');
    if (error) { console.error('getAll error:', error); return []; }
    return data || [];
  },

  async getById(collection, id) {
    const { data, error } = await sb.from(collection).select('*').eq('id', id).single();
    if (error) { console.error('getById error:', error); return null; }
    return data;
  },

  async create(collection, data) {
    const { data: item, error } = await sb.from(collection).insert(data).select().single();
    if (error) { console.error('create error:', error); throw error; }
    return item;
  },

  async update(collection, id, data) {
    const { data: item, error } = await sb.from(collection).update(data).eq('id', id).select().single();
    if (error) { console.error('update error:', error); throw error; }
    return item;
  },

  async remove(collection, id) {
    const { error } = await sb.from(collection).delete().eq('id', id);
    if (error) { console.error('remove error:', error); throw error; }
  },

  async getApprovedComments(entityType, entityId) {
    const { data, error } = await sb.from('comments')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('approved', true)
      .order('created_at', { ascending: false });
    if (error) { console.error('getApprovedComments error:', error); return []; }
    return data || [];
  },

  async getPendingComments() {
    const { data, error } = await sb.from('comments')
      .select('*')
      .eq('approved', false)
      .order('created_at', { ascending: false });
    if (error) { console.error('getPendingComments error:', error); return []; }
    return data || [];
  },

  async approveComment(id) {
    return this.update('comments', id, { approved: true });
  },

  async getStats() {
    const [newsRes, tasksRes, usersRes, commentsRes, pendingRes, bannedRes] = await Promise.all([
      sb.from('news').select('id', { count: 'exact', head: true }),
      sb.from('tasks').select('id', { count: 'exact', head: true }),
      sb.from('profiles').select('id', { count: 'exact', head: true }),
      sb.from('comments').select('id', { count: 'exact', head: true }),
      sb.from('comments').select('id', { count: 'exact', head: true }).eq('approved', false),
      sb.from('profiles').select('id', { count: 'exact', head: true }).eq('banned', true)
    ]);
    return {
      totalNews: newsRes.count || 0,
      totalTasks: tasksRes.count || 0,
      totalUsers: usersRes.count || 0,
      totalComments: commentsRes.count || 0,
      pendingComments: pendingRes.count || 0,
      bannedUsers: bannedRes.count || 0
    };
  }
};
