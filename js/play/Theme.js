(function (global) {
  'use strict';

  /**
   * 双主题切换模块（含左侧滑出侧边栏）
   * - 暗夜为默认主题（body 无 data-theme 属性）
   * - 白昼主题：body[data-theme='light']，由 CSS 变量驱动
   * - 主题状态仅存内存，不持久化，刷新恢复默认暗夜
   * - 侧边栏默认收起，点击左侧把手向右滑出后方可切换
   */
  const Theme = {
    current: 'dark',

    init: function () {
      this.apply('dark');
      this.bind();
      this.syncHandleHeight();
    },

    /** 把手高度与抽屉内容高度一致（两者均垂直居中，等高即完全对齐） */
    syncHandleHeight: function () {
      const drawer = document.getElementById('themeDrawer');
      const handle = document.getElementById('sidebarHandle');
      if (drawer && handle && drawer.offsetHeight > 0) {
        handle.style.height = drawer.offsetHeight + 'px';
      }
    },

    apply: function (theme) {
      this.current = theme === 'light' ? 'light' : 'dark';

      if (this.current === 'light') {
        document.body.setAttribute('data-theme', 'light');
      } else {
        document.body.removeAttribute('data-theme');
      }

      // 同步浏览器状态栏颜色
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute('content', this.current === 'light' ? '#f7f2e5' : '#1a1428');
      }

      // 圆点当前态高亮
      const lightBtn = document.getElementById('themeLightBtn');
      const darkBtn = document.getElementById('themeDarkBtn');
      if (lightBtn) lightBtn.classList.toggle('active', this.current === 'light');
      if (darkBtn) darkBtn.classList.toggle('active', this.current === 'dark');
    },

    openDrawer: function () {
      const drawer = document.getElementById('themeDrawer');
      const mask = document.getElementById('drawerMask');
      const handle = document.getElementById('sidebarHandle');
      if (drawer) drawer.classList.add('open');
      if (mask) mask.style.display = 'block';
      // 打开态：箭头指向左（点击后向左收起）
      if (handle) handle.textContent = '‹';
    },

    closeDrawer: function () {
      const drawer = document.getElementById('themeDrawer');
      const mask = document.getElementById('drawerMask');
      const handle = document.getElementById('sidebarHandle');
      if (drawer) drawer.classList.remove('open');
      if (mask) mask.style.display = 'none';
      // 收起态：箭头指向右（点击后向右滑出）
      if (handle) handle.textContent = '›';
    },

    bind: function () {
      const self = this;
      const lightBtn = document.getElementById('themeLightBtn');
      const darkBtn = document.getElementById('themeDarkBtn');
      const handle = document.getElementById('sidebarHandle');
      const mask = document.getElementById('drawerMask');

      if (lightBtn) {
        lightBtn.addEventListener('click', function () {
          self.apply('light');
          self.closeDrawer();
        });
      }
      if (darkBtn) {
        darkBtn.addEventListener('click', function () {
          self.apply('dark');
          self.closeDrawer();
        });
      }
      if (handle) {
        handle.addEventListener('click', function () {
          const drawer = document.getElementById('themeDrawer');
          if (drawer && drawer.classList.contains('open')) {
            self.closeDrawer();
          } else {
            self.openDrawer();
          }
        });
      }
      if (mask) {
        mask.addEventListener('click', function () { self.closeDrawer(); });
      }
    },
  };

  global.Theme = Theme;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { Theme.init(); });
  } else {
    Theme.init();
  }
})(window);
