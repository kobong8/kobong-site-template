// Run before the stylesheet to restore the theme without a light flash.
(() => {
  let theme = 'light';
  try { if (localStorage.getItem('kobong-theme') === 'dark') theme = 'dark'; } catch {}
  document.documentElement.dataset.theme = theme;
})();
