(function (global) {
  'use strict';

  /**
   * 管理员入口模块（游玩页右下角圆点 → 登录弹窗）
   * - 输入框默认空，由用户手动填入
   * - 校验逻辑复用 Auth.login（admin / 123456），成功跳转管理员后台
   * - 不提供注册功能
   */
  const AdminEntry = {
    init: function () {
      this.fab = document.getElementById('adminFab');
      this.modal = document.getElementById('adminModal');
      this.userInput = document.getElementById('adminUserInput');
      this.passInput = document.getElementById('adminPassInput');
      this.errorEl = document.getElementById('adminError');
      this.loginBtn = document.getElementById('adminLoginBtn');
      this.cancelBtn = document.getElementById('adminCancelBtn');

      if (!this.fab || !this.modal) return;
      this.bind();
    },

    bind: function () {
      const self = this;

      this.fab.addEventListener('click', function () { self.open(); });
      this.cancelBtn.addEventListener('click', function () { self.close(); });

      // 点击遮罩空白处关闭
      this.modal.addEventListener('click', function (e) {
        if (e.target === self.modal) self.close();
      });

      this.loginBtn.addEventListener('click', function () { self.tryLogin(); });
      this.passInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') self.tryLogin();
      });
      this.userInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') self.passInput.focus();
      });
    },

    open: function () {
      // 每次打开都清空输入，默认空值由用户手动填入
      this.userInput.value = '';
      this.passInput.value = '';
      this.errorEl.textContent = '';
      this.loginBtn.disabled = false;
      this.loginBtn.textContent = '登 录';
      this.modal.style.display = 'flex';

      const self = this;
      setTimeout(function () { self.userInput.focus(); }, 120);
    },

    close: function () {
      this.modal.style.display = 'none';
    },

    tryLogin: function () {
      const username = this.userInput.value.trim();
      const password = this.passInput.value;

      if (!username || !password) {
        this.errorEl.textContent = '请输入账号和密码';
        return;
      }

      const result = Auth.login(username, password);

      if (result.ok) {
        this.errorEl.textContent = '';
        this.loginBtn.disabled = true;
        this.loginBtn.textContent = '登录中...';
        location.href = 'admin-dashboard.html';
      } else {
        this.errorEl.textContent = result.message || '账号或密码错误';
        if (navigator.vibrate) {
          try { navigator.vibrate(60); } catch (e) {}
        }
      }
    },
  };

  global.AdminEntry = AdminEntry;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { AdminEntry.init(); });
  } else {
    AdminEntry.init();
  }
})(window);
