const Storage = {
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      try {
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    } catch (e) {
      console.warn('[Storage] 读取失败:', e);
      return null;
    }
  },

  set(key, value) {
    try {
      const data = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, data);
      return true;
    } catch (e) {
      console.warn('[Storage] 写入失败:', e);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn('[Storage] 删除失败:', e);
      return false;
    }
  },

  getStoryData() {
    const d = Storage.get(CONFIG.STORAGE_KEYS.STORY_DATA);
    if (!d || !d.nodes || Object.keys(d.nodes).length === 0) return null;
    return d;
  },

  setStoryData(data) {
    return Storage.set(CONFIG.STORAGE_KEYS.STORY_DATA, data);
  },
};
