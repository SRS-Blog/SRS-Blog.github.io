/* 返回顶部按钮：平时显示滚动百分比数字，鼠标悬停时显示 ↑ 箭头 */
/* 说明：JS 只负责计算并写入百分比数字，显示/隐藏与居中全部交给 readPercent.css 控制，
   避免内联样式与 CSS 冲突，也不再依赖脆弱的 childNodes 索引。 */
(function () {
  function updatePercent() {
    var up = document.getElementById('go-up');
    if (!up) return;
    var percent = up.querySelector('#percent');
    if (!percent) return;
    var scrolled = document.documentElement.scrollTop || document.body.scrollTop || 0;
    var total = (document.documentElement.scrollHeight || document.body.scrollHeight) - document.documentElement.clientHeight;
    var result = total > 0 ? Math.min(100, Math.round(scrolled / total * 100)) : 0;
    percent.innerHTML = result + '<span>%</span>';
  }
  window.addEventListener('scroll', updatePercent, { passive: true });
  window.addEventListener('load', updatePercent);
  document.addEventListener('pjax:complete', updatePercent); // 兼容 pjax 切换页面
  updatePercent();
})();
