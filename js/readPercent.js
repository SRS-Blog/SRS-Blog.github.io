/* 返回顶部按钮：平时显示滚动百分比数字；滚到底部(100%)或悬停时显示 ↑ 箭头 */
/* JS 只负责：更新百分比数字 + 到底时给按钮加 .at-bottom 类；显示切换全部交给 CSS，避免内联样式冲突 */
(function () {
  function update() {
    var up = document.getElementById('go-up');
    if (!up) return;
    var percent = up.querySelector('#percent');
    if (!percent) return;
    var de = document.documentElement;
    var scrolled = de.scrollTop || document.body.scrollTop || 0;
    var total = (de.scrollHeight || document.body.scrollHeight) - de.clientHeight;
    var result = total > 0 ? Math.min(100, Math.round(scrolled / total * 100)) : 0;
    percent.innerHTML = result + '<span>%</span>';
    // 到达底部(容差2px)时切换为 ↑ 箭头，方便一键回到顶部
    var atBottom = total <= 0 || scrolled >= total - 2;
    up.classList.toggle('at-bottom', atBottom);
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('load', update);
  document.addEventListener('pjax:complete', update); // 兼容 pjax 换页
  update();
})();