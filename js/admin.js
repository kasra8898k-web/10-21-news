const Admin = {
  dashboard() {
    if (!Auth.requireAdmin()) return;
    const stats = Store.getStats();
    Pages.render(`
    <div class="flex min-h-screen">
      ${this._sidebar('dashboard')}
      <div class="flex-1 p-6 md:p-8">
        <div class="max-w-6xl">
          <h1 class="text-2xl font-black mb-6">داشبورد مدیریت</h1>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 stagger">
            <div class="bg-white rounded-xl p-4 shadow-sm text-center">
              <p class="text-3xl font-black text-red-500">${stats.totalNews}</p>
              <p class="text-xs text-gray-500 mt-1">اخبار</p>
            </div>
            <div class="bg-white rounded-xl p-4 shadow-sm text-center">
              <p class="text-3xl font-black text-red-500">${stats.totalTasks}</p>
              <p class="text-xs text-gray-500 mt-1">تکالیف</p>
            </div>
            <div class="bg-white rounded-xl p-4 shadow-sm text-center">
              <p class="text-3xl font-black text-red-500">${stats.totalUsers}</p>
              <p class="text-xs text-gray-500 mt-1">کاربران</p>
            </div>
            <div class="bg-white rounded-xl p-4 shadow-sm text-center">
              <p class="text-3xl font-black text-red-500">${stats.totalComments}</p>
              <p class="text-xs text-gray-500 mt-1">نظرات</p>
            </div>
            <div class="bg-white rounded-xl p-4 shadow-sm text-center">
              <p class="text-3xl font-black text-orange-500">${stats.pendingComments}</p>
              <p class="text-xs text-gray-500 mt-1">نظرات در انتظار</p>
            </div>
            <div class="bg-white rounded-xl p-4 shadow-sm text-center">
              <p class="text-3xl font-black text-gray-400">${stats.bannedUsers}</p>
              <p class="text-xs text-gray-500 mt-1">مسدود شده</p>
            </div>
          </div>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-white rounded-xl p-6 shadow-sm">
              <h3 class="font-bold mb-4 flex items-center gap-2">
                <span class="w-2 h-2 bg-orange-500 rounded-full pulse-dot"></span>
                آخرین نظرات در انتظار تأیید
              </h3>
              ${this._pendingCommentsPreview()}
            </div>
            <div class="bg-white rounded-xl p-6 shadow-sm">
              <h3 class="font-bold mb-4">آخرین اخبار</h3>
              ${this._latestNewsPreview()}
            </div>
          </div>
        </div>
      </div>
    </div>`);
  },

  _categoryOptions() {
    const groups = Utils.getCategoryGroups();
    return groups.map(g =>
      `<optgroup label="${g.group}">${g.items.map(c => `<option value="${c}">${c}</option>`).join('')}</optgroup>`
    ).join('');
  },

  handleImageUrlInput(imgId, url) {
    const preview = document.getElementById(imgId + 'ImageUrlPreview');
    const img = document.getElementById(imgId + 'ImageUrlImg');
    if (!url.trim()) {
      preview.classList.add('hidden');
      window['image_' + imgId] = null;
      return;
    }
    img.src = url;
    img.onload = () => {
      preview.classList.remove('hidden');
      window['image_' + imgId] = url;
    };
    img.onerror = () => {
      preview.classList.add('hidden');
      window['image_' + imgId] = null;
      Utils.showToast('لینک تصویر معتبر نیست', 'error');
    };
  },

  clearImageUrl(imgId, inputId) {
    document.getElementById(inputId).value = '';
    document.getElementById(imgId + 'ImageUrlPreview').classList.add('hidden');
    window['image_' + imgId] = null;
  },

  // ---- ADD NEWS ----
  addNews() {
    if (!Auth.requireAdmin()) return;
    window.image_newsImg = null;
    Pages.render(`
    <div class="flex min-h-screen">
      ${this._sidebar('add-news')}
      <div class="flex-1 p-6 md:p-8">
        <div class="max-w-3xl">
          <h1 class="text-2xl font-black mb-6">افزودن خبر جدید</h1>
          <form onsubmit="Admin.handleSaveNews(event)" class="bg-white rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">عنوان خبر</label>
              <input type="text" id="newsTitle" class="input input-lg" placeholder="عنوان خبر را وارد کنید" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">دسته‌بندی</label>
              <select id="newsCategory" class="input">${this._categoryOptions()}</select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">تصویر</label>
              ${Components.imageUploadArea('newsImg')}
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">لینک تصویر (اختیاری)</label>
              <input type="url" id="newsImageUrl" class="input" placeholder="https://example.com/image.jpg" oninput="Admin.handleImageUrlInput('newsImg', this.value)">
              <p class="text-xs text-gray-400 mt-1">لینک مستقیم تصویر از اینترنت (تلگرام، واتساپ، Imgur و...)</p>
              <div id="newsImageUrlPreview" class="mt-2 hidden">
                <img id="newsImageUrlImg" src="" class="image-preview mx-auto mb-2">
                <button type="button" onclick="Admin.clearImageUrl('newsImg', 'newsImageUrl')" class="text-red-500 text-xs hover:underline">حذف لینک</button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">خلاصه</label>
              <input type="text" id="newsExcerpt" class="input" placeholder="خلاصه کوتاه خبر (اختیاری)">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">متن کامل</label>
              <textarea id="newsContent" class="input" rows="10" placeholder="متن کامل خبر..." required></textarea>
            </div>
            <div class="flex items-center gap-6">
              <div class="flex items-center gap-2">
                <input type="checkbox" id="newsImportant" class="w-4 h-4 text-red-500 rounded">
                <label for="newsImportant" class="text-sm font-medium text-gray-700">مهم (نمایش در بخش اخبار مهم)</label>
              </div>
              <div class="flex items-center gap-2">
                <input type="checkbox" id="newsBreaking" class="w-4 h-4 rounded" style="accent-color:#CA8A04">
                <label for="newsBreaking" class="text-sm font-medium text-gray-700" style="color:#CA8A04">خبر فوری (نمایش با برچسب زرد)</label>
              </div>
            </div>
            <div class="flex gap-3 pt-2">
              <button type="submit" class="btn btn-red btn-lg">انتشار خبر</button>
              <a href="#/admin" class="btn btn-outline btn-lg">انصراف</a>
            </div>
          </form>
        </div>
      </div>
    </div>`);
    setTimeout(() => Components.initDragDrop('newsImg'), 100);
  },

  handleSaveNews(e) {
    e.preventDefault();
    const user = Auth.getCurrentUser();
    const title = document.getElementById('newsTitle').value.trim();
    const content = document.getElementById('newsContent').value.trim();
    const excerpt = document.getElementById('newsExcerpt').value.trim();
    const category = document.getElementById('newsCategory').value;
    const isImportant = document.getElementById('newsImportant').checked;
    const isBreaking = document.getElementById('newsBreaking').checked;
    const imageUrl = document.getElementById('newsImageUrl').value.trim();
    const image = imageUrl || window.image_newsImg || '';
    if (!title || !content) { Utils.showToast('عنوان و متن الزامی هستند', 'error'); return; }
    Store.create('news', { title, content, excerpt, category, isImportant, isBreaking, image, authorId: user.id });
    Utils.showToast('خبر با موفقیت منتشر شد', 'success');
    location.hash = '#/admin/news-list';
  },

  // ---- ADD TASK ----
  addTask() {
    if (!Auth.requireAdmin()) return;
    window.image_taskImg = null;
    Pages.render(`
    <div class="flex min-h-screen">
      ${this._sidebar('add-task')}
      <div class="flex-1 p-6 md:p-8">
        <div class="max-w-3xl">
          <h1 class="text-2xl font-black mb-6">افزودن تکلیف جدید</h1>
          <form onsubmit="Admin.handleSaveTask(event)" class="bg-white rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">عنوان تکلیف</label>
              <input type="text" id="taskTitle" class="input input-lg" placeholder="عنوان تکلیف را وارد کنید" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">دسته‌بندی</label>
              <select id="taskCategory" class="input">${this._categoryOptions()}</select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">تصویر</label>
              ${Components.imageUploadArea('taskImg')}
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">لینک تصویر (اختیاری)</label>
              <input type="url" id="taskImageUrl" class="input" placeholder="https://example.com/image.jpg" oninput="Admin.handleImageUrlInput('taskImg', this.value)">
              <p class="text-xs text-gray-400 mt-1">لینک مستقیم تصویر از اینترنت (تلگرام، واتساپ، Imgur و...)</p>
              <div id="taskImageUrlPreview" class="mt-2 hidden">
                <img id="taskImageUrlImg" src="" class="image-preview mx-auto mb-2">
                <button type="button" onclick="Admin.clearImageUrl('taskImg', 'taskImageUrl')" class="text-red-500 text-xs hover:underline">حذف لینک</button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">خلاصه</label>
              <input type="text" id="taskExcerpt" class="input" placeholder="خلاصه کوتاه تکلیف (اختیاری)">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">توضیحات کامل</label>
              <textarea id="taskContent" class="input" rows="10" placeholder="توضیحات کامل تکلیف..." required></textarea>
            </div>
            <div class="flex items-center gap-6">
              <div class="flex items-center gap-2">
                <input type="checkbox" id="taskImportant" class="w-4 h-4 text-red-500 rounded">
                <label for="taskImportant" class="text-sm font-medium text-gray-700">مهم</label>
              </div>
              <div class="flex items-center gap-2">
                <input type="checkbox" id="taskBreaking" class="w-4 h-4 rounded" style="accent-color:#CA8A04">
                <label for="taskBreaking" class="text-sm font-medium text-gray-700" style="color:#CA8A04">خبر فوری</label>
              </div>
            </div>
            <div class="flex gap-3 pt-2">
              <button type="submit" class="btn btn-red btn-lg">انتشار تکلیف</button>
              <a href="#/admin" class="btn btn-outline btn-lg">انصراف</a>
            </div>
          </form>
        </div>
      </div>
    </div>`);
    setTimeout(() => Components.initDragDrop('taskImg'), 100);
  },

  handleSaveTask(e) {
    e.preventDefault();
    const user = Auth.getCurrentUser();
    const title = document.getElementById('taskTitle').value.trim();
    const content = document.getElementById('taskContent').value.trim();
    const excerpt = document.getElementById('taskExcerpt').value.trim();
    const category = document.getElementById('taskCategory').value;
    const isImportant = document.getElementById('taskImportant').checked;
    const isBreaking = document.getElementById('taskBreaking').checked;
    const imageUrl = document.getElementById('taskImageUrl').value.trim();
    const image = imageUrl || window.image_taskImg || '';
    if (!title || !content) { Utils.showToast('عنوان و توضیحات الزامی هستند', 'error'); return; }
    Store.create('tasks', { title, content, excerpt, category, isImportant, isBreaking, image, authorId: user.id });
    Utils.showToast('تکلیف با موفقیت منتشر شد', 'success');
    location.hash = '#/admin/tasks-list';
  },

  // ---- MANAGE USERS ----
  manageUsers() {
    if (!Auth.requireAdmin()) return;
    const users = Store.getAll('users');
    Pages.render(`
    <div class="flex min-h-screen">
      ${this._sidebar('users')}
      <div class="flex-1 p-6 md:p-8">
        <div class="max-w-5xl">
          <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-black">مدیریت کاربران</h1>
            <button onclick="Admin.showAddAdmin()" class="btn btn-red btn-sm">افزودن مدیر</button>
          </div>
          <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b bg-gray-50">
                    <th class="text-right px-4 py-3 font-medium text-gray-500">نام</th>
                    <th class="text-right px-4 py-3 font-medium text-gray-500">نام کاربری</th>
                    <th class="text-right px-4 py-3 font-medium text-gray-500">نقش</th>
                    <th class="text-right px-4 py-3 font-medium text-gray-500">تاریخ عضویت</th>
                    <th class="text-right px-4 py-3 font-medium text-gray-500">وضعیت</th>
                    <th class="text-right px-4 py-3 font-medium text-gray-500">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  ${users.map(u => `
                    <tr class="border-b last:border-0 hover:bg-gray-50 transition-colors">
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-2">
                          <div class="w-8 h-8 rounded-full ${u.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'} flex items-center justify-center font-bold text-xs">${u.fullName.charAt(0)}</div>
                          <span class="font-medium">${Utils.escapeHtml(u.fullName)}</span>
                        </div>
                      </td>
                      <td class="px-4 py-3 text-gray-500">@${Utils.escapeHtml(u.username)}</td>
                      <td class="px-4 py-3">
                        <span class="badge ${u.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}">${u.role === 'admin' ? 'مدیر' : 'کاربر'}</span>
                      </td>
                      <td class="px-4 py-3 text-gray-400 text-xs">${Utils.persianDate(u.createdAt)}</td>
                      <td class="px-4 py-3">
                        ${u.banned ? '<span class="badge bg-red-100 text-red-600">مسدود</span>' : '<span class="badge bg-green-100 text-green-600">فعال</span>'}
                      </td>
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-1">
                          ${u.id !== Auth.getCurrentUser().id ? `
                            <button onclick="Admin.toggleBan('${u.id}')" class="btn btn-ghost btn-sm text-xs ${u.banned ? 'text-green-500' : 'text-red-500'}">${u.banned ? 'رفع مسدودی' : 'مسدود کردن'}</button>
                            ${u.role !== 'admin' ? `<button onclick="Admin.toggleComment('${u.id}')" class="btn btn-ghost btn-sm text-xs ${u.canComment === false ? 'text-green-500' : 'text-orange-500'}">${u.canComment === false ? 'فعال کردن نظر' : 'غیرفعال کردن نظر'}</button>` : ''}
                            ${u.role !== 'admin' ? `<button onclick="Admin.makeAdmin('${u.id}')" class="btn btn-ghost btn-sm text-xs text-blue-500">ارتقا به مدیر</button>` : ''}
                          ` : '<span class="text-xs text-gray-400">شما</span>'}
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>`);
  },

  toggleBan(id) {
    const user = Store.getById('users', id);
    if (user) { Store.update('users', id, { banned: !user.banned }); Utils.showToast(user.banned ? 'کاربر از مسدودی خارج شد' : 'کاربر مسدود شد', 'success'); this.manageUsers(); }
  },

  toggleComment(id) {
    const user = Store.getById('users', id);
    if (user) { Store.update('users', id, { canComment: user.canComment === false ? true : false }); Utils.showToast('وضعیت نظردهی تغییر کرد', 'success'); this.manageUsers(); }
  },

  makeAdmin(id) {
    if (confirm('آیا مطمئن هستید؟')) { Store.update('users', id, { role: 'admin' }); Utils.showToast('کاربر به مدیر ارتقا یافت', 'success'); this.manageUsers(); }
  },

  showAddAdmin() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'addAdminModal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3 class="text-lg font-bold mb-4">افزودن مدیر جدید</h3>
        <form onsubmit="Admin.handleAddAdmin(event)">
          <div class="mb-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">نام کامل</label>
            <input type="text" id="adminFullName" class="input" required>
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">نام کاربری</label>
            <input type="text" id="adminUsername" class="input" required>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">رمز عبور</label>
            <input type="password" id="adminPassword" class="input" required>
          </div>
          <div class="flex gap-2">
            <button type="submit" class="btn btn-red">ایجاد</button>
            <button type="button" onclick="document.getElementById('addAdminModal').remove()" class="btn btn-outline">لغو</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(modal);
  },

  handleAddAdmin(e) {
    e.preventDefault();
    const fullName = document.getElementById('adminFullName').value;
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const result = Auth.register(fullName, username, password);
    if (result.error) { Utils.showToast(result.error, 'error'); return; }
    Store.update('users', result.user.id, { role: 'admin' });
    document.getElementById('addAdminModal').remove();
    Utils.showToast('مدیر جدید ایجاد شد', 'success');
    this.manageUsers();
  },

  // ---- MANAGE COMMENTS ----
  manageComments() {
    if (!Auth.requireAdmin()) return;
    const allComments = Store.getAll('comments').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    Pages.render(`
    <div class="flex min-h-screen">
      ${this._sidebar('comments')}
      <div class="flex-1 p-6 md:p-8">
        <div class="max-w-5xl">
          <h1 class="text-2xl font-black mb-6">مدیریت نظرات</h1>
          <div class="space-y-3 stagger">
            ${allComments.length === 0 ? Components.emptyState('نظری ثبت نشده است.') :
              allComments.map(c => {
                const user = Store.getById('users', c.userId);
                const entity = Store.getById(c.entityType === 'news' ? 'news' : 'tasks', c.entityId);
                return `
                <div class="bg-white rounded-xl p-4 shadow-sm flex items-start gap-4">
                  <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm flex-shrink-0">${user ? user.fullName.charAt(0) : '?'}</div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1 flex-wrap">
                      <span class="font-medium text-sm">${user ? Utils.escapeHtml(user.fullName) : 'ناشناس'}</span>
                      <span class="text-xs text-gray-400">در</span>
                      <span class="text-xs text-gray-500 truncate max-w-xs">${entity ? Utils.escapeHtml(entity.title) : 'حذف شده'}</span>
                      <span class="text-xs text-gray-400">${Utils.timeAgo(c.createdAt)}</span>
                      ${c.approved ? '<span class="badge bg-green-100 text-green-600 text-xs">تأیید شده</span>' : '<span class="badge bg-yellow-100 text-yellow-600 text-xs">در انتظار</span>'}
                    </div>
                    <p class="text-sm text-gray-600 mb-2">${Utils.escapeHtml(c.text)}</p>
                    <div class="flex gap-1">
                      ${!c.approved ? `<button onclick="Admin.approveComment('${c.id}')" class="btn btn-ghost btn-sm text-xs text-green-500">تأیید</button>` : ''}
                      <button onclick="Admin.deleteComment('${c.id}')" class="btn btn-ghost btn-sm text-xs text-red-500">حذف</button>
                    </div>
                  </div>
                </div>`;
              }).join('')}
          </div>
        </div>
      </div>
    </div>`);
  },

  approveComment(id) { Store.approveComment(id); Utils.showToast('نظر تأیید شد', 'success'); this.manageComments(); },

  deleteComment(id) {
    if (confirm('آیا از حذف این نظر مطمئن هستید؟')) { Store.remove('comments', id); Utils.showToast('نظر حذف شد', 'success'); this.manageComments(); }
  },

  // ---- MANAGE NEWS ----
  manageNews() {
    if (!Auth.requireAdmin()) return;
    const news = Store.getAll('news').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    Pages.render(`
    <div class="flex min-h-screen">
      ${this._sidebar('admin-news')}
      <div class="flex-1 p-6 md:p-8">
        <div class="max-w-5xl">
          <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-black">مدیریت اخبار</h1>
            <a href="#/admin/news/new" class="btn btn-red btn-sm">افزودن خبر</a>
          </div>
          <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b bg-gray-50">
                    <th class="text-right px-4 py-3 font-medium text-gray-500">عنوان</th>
                    <th class="text-right px-4 py-3 font-medium text-gray-500">دسته</th>
                    <th class="text-right px-4 py-3 font-medium text-gray-500">وضعیت</th>
                    <th class="text-right px-4 py-3 font-medium text-gray-500">تاریخ</th>
                    <th class="text-right px-4 py-3 font-medium text-gray-500">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  ${news.map(n => `
                    <tr class="border-b last:border-0 hover:bg-gray-50 transition-colors">
                      <td class="px-4 py-3 font-medium max-w-xs truncate">${Utils.escapeHtml(n.title)}</td>
                      <td class="px-4 py-3"><span class="badge text-xs" style="background:${Utils.getCategoryColor(n.category).bg};color:${Utils.getCategoryColor(n.category).text}">${n.category}</span></td>
                      <td class="px-4 py-3">
                        <div class="flex gap-1">
                          ${n.isImportant ? '<span class="badge bg-red-100 text-red-600 text-xs">مهم</span>' : ''}
                          ${n.isBreaking ? '<span class="badge text-xs" style="background:#FEF3C7;color:#92400E">فوری</span>' : ''}
                          ${!n.isImportant && !n.isBreaking ? '<span class="badge bg-gray-100 text-gray-500 text-xs">عادی</span>' : ''}
                        </div>
                      </td>
                      <td class="px-4 py-3 text-gray-400 text-xs">${Utils.persianDate(n.createdAt)}</td>
                      <td class="px-4 py-3">
                        <div class="flex gap-1">
                          <a href="#/news/${n.id}" class="btn btn-ghost btn-sm text-xs text-blue-500">مشاهده</a>
                          <button onclick="Admin.deleteItem('news', '${n.id}')" class="btn btn-ghost btn-sm text-xs text-red-500">حذف</button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>`);
  },

  // ---- MANAGE TASKS ----
  manageTasks() {
    if (!Auth.requireAdmin()) return;
    const tasks = Store.getAll('tasks').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    Pages.render(`
    <div class="flex min-h-screen">
      ${this._sidebar('admin-tasks')}
      <div class="flex-1 p-6 md:p-8">
        <div class="max-w-5xl">
          <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-black">مدیریت تکالیف</h1>
            <a href="#/admin/tasks/new" class="btn btn-red btn-sm">افزودن تکلیف</a>
          </div>
          <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b bg-gray-50">
                    <th class="text-right px-4 py-3 font-medium text-gray-500">عنوان</th>
                    <th class="text-right px-4 py-3 font-medium text-gray-500">دسته</th>
                    <th class="text-right px-4 py-3 font-medium text-gray-500">وضعیت</th>
                    <th class="text-right px-4 py-3 font-medium text-gray-500">تاریخ</th>
                    <th class="text-right px-4 py-3 font-medium text-gray-500">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  ${tasks.map(t => `
                    <tr class="border-b last:border-0 hover:bg-gray-50 transition-colors">
                      <td class="px-4 py-3 font-medium max-w-xs truncate">${Utils.escapeHtml(t.title)}</td>
                      <td class="px-4 py-3"><span class="badge text-xs" style="background:${Utils.getCategoryColor(t.category).bg};color:${Utils.getCategoryColor(t.category).text}">${t.category}</span></td>
                      <td class="px-4 py-3">
                        <div class="flex gap-1">
                          ${t.isImportant ? '<span class="badge bg-red-100 text-red-600 text-xs">مهم</span>' : ''}
                          ${t.isBreaking ? '<span class="badge text-xs" style="background:#FEF3C7;color:#92400E">فوری</span>' : ''}
                          ${!t.isImportant && !t.isBreaking ? '<span class="badge bg-gray-100 text-gray-500 text-xs">عادی</span>' : ''}
                        </div>
                      </td>
                      <td class="px-4 py-3 text-gray-400 text-xs">${Utils.persianDate(t.createdAt)}</td>
                      <td class="px-4 py-3">
                        <div class="flex gap-1">
                          <a href="#/tasks/${t.id}" class="btn btn-ghost btn-sm text-xs text-blue-500">مشاهده</a>
                          <button onclick="Admin.deleteItem('tasks', '${t.id}')" class="btn btn-ghost btn-sm text-xs text-red-500">حذف</button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>`);
  },

  deleteItem(collection, id) {
    if (confirm('آیا از حذف مطمئن هستید؟')) {
      Store.remove(collection, id);
      Utils.showToast('حذف شد', 'success');
      if (collection === 'news') this.manageNews();
      else this.manageTasks();
    }
  },

  // ---- SIDEBAR ----
  _sidebar(active) {
    return `
    <div class="admin-sidebar w-64 flex-shrink-0 hidden lg:block">
      <div class="p-4 border-b border-gray-700">
        <a href="#/home" class="flex items-center gap-2">
          <div class="logo">
            <div class="logo-top text-sm"><span>10.</span><span class="logo-21 text-xs px-1.5 py-0.5">21</span></div>
            <div class="logo-bottom text-[0.5rem]">NEWS</div>
          </div>
          <span class="text-white text-sm font-medium mr-2">پنل مدیریت</span>
        </a>
      </div>
      <nav class="p-3 space-y-1">
        <a href="#/admin" class="${active === 'dashboard' ? 'active' : ''}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
          داشبورد
        </a>
        <a href="#/admin/news/new" class="${active === 'add-news' ? 'active' : ''}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          افزودن خبر
        </a>
        <a href="#/admin/tasks/new" class="${active === 'add-task' ? 'active' : ''}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          افزودن تکلیف
        </a>
        <a href="#/admin/news-list" class="${active === 'admin-news' ? 'active' : ''}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
          مدیریت اخبار
        </a>
        <a href="#/admin/tasks-list" class="${active === 'admin-tasks' ? 'active' : ''}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
          مدیریت تکالیف
        </a>
        <a href="#/admin/comments" class="${active === 'comments' ? 'active' : ''}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
          مدیریت نظرات
          ${Store.getPendingComments().length > 0 ? `<span class="mr-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">${Store.getPendingComments().length}</span>` : ''}
        </a>
        <a href="#/admin/users" class="${active === 'users' ? 'active' : ''}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          مدیریت کاربران
        </a>
        <hr class="border-gray-700 my-2">
        <a href="#/home">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          بازگشت به سایت
        </a>
      </nav>
    </div>`;
  },

  _pendingCommentsPreview() {
    const pending = Store.getPendingComments().slice(0, 5);
    if (pending.length === 0) return '<p class="text-sm text-gray-400">نظر در انتظاری وجود ندارد.</p>';
    return pending.map(c => {
      const user = Store.getById('users', c.userId);
      return `
      <div class="flex items-center gap-3 py-2 border-b last:border-0">
        <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold flex-shrink-0">${user ? user.fullName.charAt(0) : '?'}</div>
        <div class="flex-1 min-w-0">
          <p class="text-sm truncate">${Utils.escapeHtml(c.text)}</p>
          <p class="text-xs text-gray-400">${user ? user.fullName : 'ناشناس'} · ${Utils.timeAgo(c.createdAt)}</p>
        </div>
        <button onclick="Admin.approveComment('${c.id}')" class="text-green-500 hover:text-green-600 text-xs font-medium">تأیید</button>
      </div>`;
    }).join('');
  },

  _latestNewsPreview() {
    const news = Store.getAll('news').slice(0, 5);
    if (news.length === 0) return '<p class="text-sm text-gray-400">خبری ثبت نشده.</p>';
    return news.map(n => `
      <div class="flex items-center gap-3 py-2 border-b last:border-0">
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium truncate">${Utils.escapeHtml(n.title)}</p>
          <p class="text-xs text-gray-400">${Utils.persianDate(n.createdAt)}</p>
        </div>
        ${n.isImportant ? '<span class="badge bg-red-100 text-red-600 text-xs">مهم</span>' : ''}
        ${n.isBreaking ? '<span class="badge text-xs" style="background:#FEF3C7;color:#92400E">فوری</span>' : ''}
      </div>
    `).join('');
  }
};
