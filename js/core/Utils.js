const Utils = {
  generateId(prefix = 'id') {
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).slice(2, 8);
    return `${prefix}_${ts}${rand}`;
  },

  validateTotalAngle(sectors) {
    if (!Array.isArray(sectors) || sectors.length === 0) return false;
    const sum = sectors.reduce((acc, s) => acc + (Number(s.angle) || 0), 0);
    return Math.abs(sum - 360) < 0.01;
  },

  normalizeAngle(sectors) {
    if (!Array.isArray(sectors) || sectors.length === 0) return sectors;
    const total = sectors.reduce((acc, s) => acc + (Number(s.angle) || 0), 0);
    if (total === 0) {
      const each = 360 / sectors.length;
      sectors.forEach(s => { s.angle = each; });
      return sectors;
    }
    const scale = 360 / total;
    sectors.forEach(s => { s.angle = Number((Number(s.angle) * scale).toFixed(2)); });
    const diff = 360 - sectors.reduce((a, s) => a + s.angle, 0);
    sectors[sectors.length - 1].angle = Number((sectors[sectors.length - 1].angle + diff).toFixed(2));
    return sectors;
  },

  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => Utils.deepClone(item));
    const cloned = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = Utils.deepClone(obj[key]);
      }
    }
    return cloned;
  },

  parseColor(input) {
    if (!input || typeof input !== 'string') return null;
    const hex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(input.trim());
    const rgb = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(\s*,\s*[\d.]+\s*)?\)$/.test(input.trim());
    return (hex || rgb) ? input.trim() : null;
  },

  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  isLightColor(hex) {
    const m = /^#?([0-9a-fA-F]{6})$/.exec(hex);
    if (!m) return true;
    const r = parseInt(m[1].slice(0, 2), 16);
    const g = parseInt(m[1].slice(2, 4), 16);
    const b = parseInt(m[1].slice(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
  },

  degToRad(deg) {
    return deg * Math.PI / 180;
  },
};
