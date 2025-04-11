setInterval(() => {
  // 基础时间计算
  const now = new Date();
  const createTime = new Date('2025-04-8 00:00:00');
  const launchTime = new Date('08/01/2022 00:00:00');
  
  // 网站运行时间计算
  const siteSeconds = Math.round((now - createTime) / 1000);
  const siteTime = calculateTime(siteSeconds);
  
  // 旅行者1号距离计算
  const voyagerSeconds = Math.round((now - launchTime) / 1000);
  const voyagerDistance = Math.trunc(234e8 + (voyagerSeconds * 17));
  const astronomicalUnits = (voyagerDistance / 1496e5).toFixed(6);
  
  // 每日时段判断
  const hours = now.getHours();
  const isDayTime = hours >= 9 && hours < 22;
  
  // 构建显示内容
  let displayContent = `
    <div class="time-display">
      ${getStatusBadge(isDayTime)}
      <div class="time-stats">
        <div class="site-runtime">
          本站居然运行了: 
          ${siteTime.years}年 ${siteTime.days}天 ${siteTime.hours}:${siteTime.minutes}:${siteTime.seconds}
          <svg class="aixin-icon" style="width:15px;height:13px;fill:red;margin-left:5px;">
            <use xlink:href="#icon-aixin2"></use>
          </svg>
        </div>
        <div class="voyager-info">
          旅行者1号当前距离地球: 
          ${formatNumber(voyagerDistance)} km，约为 ${astronomicalUnits} 个天文单位
          🚀 
        </div>
        <div class="fun-fact">
          ${getRandomFunFact(siteTime)}
        </div>
      </div>
    </div>
  `;
  
  // 更新DOM
  const workboard = document.getElementById("workboard");
  if (workboard) {
    workboard.innerHTML = displayContent;
  }
}, 1000);

// 辅助函数：计算时间分量
function calculateTime(totalSeconds) {
  const years = Math.floor(totalSeconds / (365 * 24 * 3600));
  let remaining = totalSeconds % (365 * 24 * 3600);
  
  const days = Math.floor(remaining / (24 * 3600));
  remaining %= 24 * 3600;
  
  const hours = padZero(Math.floor(remaining / 3600));
  remaining %= 3600;
  
  const minutes = padZero(Math.floor(remaining / 60));
  const seconds = padZero(remaining % 60);
  
  return { years, days, hours, minutes, seconds };
}

// 辅助函数：补零
function padZero(num) {
  return num > 9 ? num : '0' + num;
}

// 辅助函数：获取状态徽章
function getStatusBadge(isDayTime) {
  return isDayTime ? 
    `<img class="boardsign" src="https://img.shields.io/badge/糖果屋-营业中-6adea8?style=social&logo=cakephp" title="距离百年老店也就差不到一百年~">` :
    `<img class="boardsign" src="https://img.shields.io/badge/糖果屋-打烊了-6adea8?style=social&logo=coffeescript" title="这个点了应该去睡觉啦，熬夜对身体不好哦">`;
}

// 辅助函数：格式化大数字
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 辅助函数：获取随机趣味知识
function getRandomFunFact(siteTime) {
  const facts = [
    `🌌 这段代码已经运行了 ${siteTime.years} 年 ${siteTime.days} 天`,
    `🍬 糖果屋的糖果库存: ${Math.floor(Math.random() * 1000)} 颗`,
    `⏳ 下一个百年老店倒计时: ${100 - siteTime.years} 年`
  ];
  return facts[Math.floor(Math.random() * facts.length)];
}