(function (global) {
  'use strict';

  const SESSION_TTL = 24 * 60 * 60 * 1000;

  const Auth = {
    login(username, password) {
      if (username === CONFIG.ADMIN.username && password === CONFIG.ADMIN.password) {
        Storage.set(CONFIG.STORAGE_KEYS.ADMIN_SESSION, {
          loggedIn: true,
          ts: Date.now(),
          username: username,
        });
        return { ok: true };
      }
      return { ok: false, message: '账号或密码错误' };
    },

    check() {
      const s = Storage.get(CONFIG.STORAGE_KEYS.ADMIN_SESSION);
      if (!s || !s.loggedIn) return false;
      if (Date.now() - (s.ts || 0) > SESSION_TTL) {
        Auth.logout();
        return false;
      }
      return true;
    },

    logout() {
      Storage.remove(CONFIG.STORAGE_KEYS.ADMIN_SESSION);
    },

    requireLogin() {
      if (!Auth.check()) {
        location.replace('admin-login.html');
        return false;
      }
      return true;
    },
  };

  global.Auth = Auth;
})(window);
