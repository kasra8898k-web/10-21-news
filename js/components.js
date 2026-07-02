const Components = {
  navbar(user) {
    if (!user) return '';
    const isAdmin = user.role === 'admin';
    return `
    <nav class="navbar" id="mainNavbar">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-6">
            <a href="#/home" class="flex-shrink-0">${this.logo()}</a>
            <div class="hidden md:flex items-center gap-1">
              <a href="#/home" class="nav-link">خانه</a>
              <a href="#/news" class="nav-link">اخبار</a>
              <a href="#/tasks" class="nav-link">تکالیف</a>
              <a href="#/important" class="nav-link">اخبار مهم</a>
              ${isAdmin ? '<a href="#/admin" class="nav-link text-red-600 flex items-center gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>پنل مدیریت</a>' : ''}
            </div>
          </div>
          <div class="hidden md:flex items-center gap-3">
            <div class="relative">
              <input type="text" id="searchInput" placeholder="جستجو..." class="input py-2 pr-10 pl-4 w-48 focus:w-64 transition-all duration-300 text-sm" dir="rtl">
              <svg class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <div class="dropdown">
              <button onclick="Components.toggleDropdown(this)" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all">
                <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm">${user.full_name.charAt(0)}</div>
                <span class="text-sm font-medium text-gray-700">${user.full_name}</span>
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <div class="dropdown-menu hidden">
                <a href="#/profile" class="dropdown-item">پروفایل من</a>
                ${isAdmin ? '<a href="#/admin" class="dropdown-item">پنل مدیریت</a>' : ''}
                <hr class="my-1 border-gray-100">
                <button onclick="Auth.logout()" class="block w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all">خروج</button>
              </div>
            </div>
          </div>
          <button onclick="Components.toggleMobileMenu()" class="md:hidden p-2 rounded-lg hover:bg-gray-100">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        </div>
      </div>
    </nav>
    <div class="mobile-overlay" id="mobileOverlay" onclick="Components.closeMobileMenu()"></div>
    <div class="mobile-menu" id="mobileMenu">
      <div class="p-4 border-b flex items-center justify-between">
        ${this.logo()}
        <button onclick="Components.closeMobileMenu()" class="p-2 rounded-lg hover:bg-gray-100">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      <div class="p-4 space-y-1">
        <a href="#/home" onclick="Components.closeMobileMenu()" class="mobile-link">خانه</a>
        <a href="#/news" onclick="Components.closeMobileMenu()" class="mobile-link">اخبار</a>
        <a href="#/tasks" onclick="Components.closeMobileMenu()" class="mobile-link">تکالیف</a>
        <a href="#/important" onclick="Components.closeMobileMenu()" class="mobile-link">اخبار مهم</a>
        ${isAdmin ? '<a href="#/admin" onclick="Components.closeMobileMenu()" class="mobile-link text-red-600 font-medium">پنل مدیریت</a>' : ''}
        <hr class="my-2">
        <a href="#/profile" onclick="Components.closeMobileMenu()" class="mobile-link">پروفایل</a>
        <button onclick="Auth.logout(); Components.closeMobileMenu()" class="block w-full text-right px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 font-medium">خروج</button>
      </div>
    </div>`;
  },

  logo() {
    return `
    <div class="logo">
      <div class="logo-top">
        <span>10.</span><span class="logo-21">21</span>
      </div>
      <div class="logo-bottom">NEWS</div>
    </div>`;
  },

  toggleDropdown(btn) {
    const menu = btn.nextElementSibling;
    const wasHidden = menu.classList.contains('hidden');
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.add('hidden'));
    if (wasHidden) menu.classList.remove('hidden');
  },

  toggleMobileMenu() {
    const mm = document.getElementById('mobileMenu');
    const mo = document.getElementById('mobileOverlay');
    if (mm) mm.classList.add('open');
    if (mo) mo.classList.add('open');
  },

  closeMobileMenu() {
    const mm = document.getElementById('mobileMenu');
    const mo = document.getElementById('mobileOverlay');
    if (mm) mm.classList.remove('open');
    if (mo) mo.classList.remove('open');
  },

  newsCard(item, type = 'news') {
    const catColor = Utils.getCategoryColor(item.category);
    const route = type === 'news' ? 'news' : 'tasks';
    const createdAt = item.created_at || item.createdAt;
    return `
    <a href="#/${route}/${item.id}" class="block bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden card-hover border border-gray-100/80" style="box-shadow:0 1px 3px rgba(0,0,0,.04),0 4px 16px rgba(0,0,0,.03)">
      <div class="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
        ${item.image ?
          `<img src="${item.image}" alt="${Utils.escapeHtml(item.title)}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" onerror="this.parentElement.innerHTML='<div class=\\'w-full h-full flex items-center justify-center\\'><svg class=\\'w-12 h-12 text-gray-200\\' fill=\\'none\\' stroke=\\'currentColor\\' viewBox=\\'0 0 24 24\\'><path stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'1.5\\' d=\\'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z\\'></path></svg></div>'">` :
          `<div class="w-full h-full flex items-center justify-center">
            <svg class="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>`}
        <div class="absolute top-3 right-3 flex gap-2">
          ${item.is_important ? '<span class="badge text-white text-xs" style="background:linear-gradient(135deg,#C8102E,#A50D24);box-shadow:0 2px 8px rgba(200,16,46,.3)">مهم</span>' : ''}
          ${item.is_breaking ? '<span class="badge text-xs" style="background:linear-gradient(135deg,#FACC15,#EAB308);color:#713F12;box-shadow:0 2px 8px rgba(234,179,8,.25)">خبر فوری</span>' : ''}
        </div>
        <div class="absolute bottom-3 right-3 badge text-xs" style="background:${catColor.bg};color:${catColor.text};border:1px solid ${catColor.border};backdrop-filter:blur(8px)">${item.category}</div>
      </div>
      <div class="p-5">
        <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 leading-7">${Utils.escapeHtml(item.title)}</h3>
        <p class="text-sm text-gray-500/80 mb-3 line-clamp-2 leading-6">${Utils.escapeHtml(item.excerpt || Utils.truncate(item.content, 100))}</p>
        <div class="flex items-center justify-between text-xs text-gray-400">
          <span>${Utils.timeAgo(createdAt)}</span>
          <span class="text-red-500 hover:text-red-600 font-medium transition-colors">ادامه مطلب →</span>
        </div>
      </div>
    </a>`;
  },

  async commentSection(entityType, entityId) {
    const user = await Auth.getCurrentUser();
    const comments = await Store.getApprovedComments(entityType, entityId);
    const canComment = user && user.can_comment !== false;
    return `
    <div class="mt-10 border-t border-gray-100 pt-8">
      <h3 class="section-label mb-5">نظرات (${comments.length})</h3>
      ${user ? (canComment ? `
      <div class="mb-6">
        <textarea id="commentText" class="input mb-3" placeholder="نظر خود را بنویسید..." rows="3"></textarea>
        <button onclick="Pages.submitComment('${entityType}', '${entityId}')" class="btn btn-red btn-sm">ارسال نظر</button>
        <p class="text-xs text-gray-400 mt-2">نظر شما پس از تأیید مدیر نمایش داده می‌شود.</p>
      </div>` : '<p class="text-sm text-gray-400 mb-6">امکان ثبت نظر برای شما غیرفعال شده است.</p>') : '<p class="text-sm text-gray-400 mb-6">برای ثبت نظر وارد شوید.</p>'}
      <div class="space-y-4 stagger" id="commentsContainer">
        ${comments.length === 0 ? '<p class="text-sm text-gray-400 text-center py-6">هنوز نظری ثبت نشده است.</p>' :
          await Promise.all(comments.map(async c => {
            const cu = c.user_id ? await Store.getProfile(c.user_id) : null;
            return `
            <div class="flex gap-3 p-4 rounded-xl bg-gray-50/60 slide-up">
              <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0" style="background:linear-gradient(135deg,rgba(200,16,46,.08),rgba(200,16,46,.18));color:#C8102E">${cu ? cu.full_name.charAt(0) : '?'}</div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-medium text-sm text-gray-900">${cu ? Utils.escapeHtml(cu.full_name) : 'کاربر حذف شده'}</span>
                  <span class="text-xs text-gray-400">${Utils.timeAgo(c.created_at)}</span>
                </div>
                <p class="text-sm text-gray-600 leading-6">${Utils.escapeHtml(c.text)}</p>
              </div>
            </div>`;
          })).then(items => items.join(''))}
      </div>
    </div>`;
  },

  loading() {
    return `<div class="flex items-center justify-center py-20"><div class="spinner"></div></div>`;
  },

  emptyState(message) {
    return `
    <div class="text-center py-20">
      <div class="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center" style="background:linear-gradient(135deg,rgba(200,16,46,.06),rgba(200,16,46,.12))">
        <svg class="w-8 h-8 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      </div>
      <p class="text-gray-400 text-lg">${message}</p>
    </div>`;
  },

  imageUploadArea(id, currentImage) {
    return `
    <div class="drop-zone" id="${id}DropZone" onclick="document.getElementById('${id}Input').click()">
      <input type="file" id="${id}Input" accept="image/*" class="hidden" onchange="Components.handleImageUpload(event, '${id}')">
      <div id="${id}Preview">
        ${currentImage ?
          `<img src="${currentImage}" class="image-preview mx-auto mb-2">` :
          `<svg class="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <p class="text-gray-400 text-sm">کلیک کنید یا تصویر را بکشید و رها کنید</p>
          <p class="text-gray-300 text-xs mt-1">PNG, JPG, GIF (حداکثر ۲ مگابایت)</p>`}
      </div>
    </div>`;
  },

  handleImageUpload(event, id) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      Utils.showToast('حجم تصویر نباید بیش از ۲ مگابایت باشد', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const preview = document.getElementById(id + 'Preview');
      if (preview) {
        preview.innerHTML = `<img src="${dataUrl}" class="image-preview mx-auto mb-2 cursor-pointer" onclick="document.getElementById('${id}Input').click()">
          <button onclick="event.stopPropagation(); Components.removeImage('${id}')" class="text-red-500 text-xs hover:underline">حذف تصویر</button>`;
      }
      window['image_' + id] = dataUrl;
    };
    reader.readAsDataURL(file);
  },

  removeImage(id) {
    window['image_' + id] = null;
    const preview = document.getElementById(id + 'Preview');
    if (preview) {
      preview.innerHTML = `
        <svg class="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        <p class="text-gray-400 text-sm">کلیک کنید یا تصویر را بکشید و رها کنید</p>
        <p class="text-gray-300 text-xs mt-1">PNG, JPG, GIF (حداکثر ۲ مگابایت)</p>`;
    }
  },

  initDragDrop(id) {
    const zone = document.getElementById(id + 'DropZone');
    if (!zone) return;
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('active'); });
    zone.addEventListener('dragleave', () => { zone.classList.remove('active'); });
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('active');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        const input = document.getElementById(id + 'Input');
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        input.dispatchEvent(new Event('change'));
      }
    });
  }
};
