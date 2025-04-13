// 防抖全局计时器
let TT = null;    //time用来控制事件的触发
// 防抖函数:fn->逻辑 time->防抖时间
function debounce(fn, time) {
    if (TT !== null) clearTimeout(TT);
    TT = setTimeout(fn, time);
}


let ipLoacation = null;

// 获取距离函数
function getDistance(e1, n1, e2, n2) {
    const R = 6371;
    const { sin, cos, asin, PI, hypot } = Math;
    let getPoint = (e, n) => {
        e *= PI / 180;
        n *= PI / 180;
        return { x: cos(n) * cos(e), y: cos(n) * sin(e), z: sin(n) };
    };
    let a = getPoint(e1, n1);
    let b = getPoint(e2, n2);
    let c = hypot(a.x - b.x, a.y - b.y, a.z - b.z);
    return Math.round(asin(c / 2) * 2 * R);
}

// 初始化位置请求
function fetchLocation() {
    $.ajax({
        type: 'get',
        url: 'https://apis.map.qq.com/ws/location/v1/ip',
        data: {
            key: 'NGNBZ-T3BWC-RTU24-AUJQP-N4KY6-F3FIH',
            output: 'jsonp',
        },
        dataType: 'jsonp',
        success: function(res) {
            if (res.status === 0) {
                ipLoacation = res;
                renderWelcome();
            }
        },
        error: function() {
            console.warn('位置获取失败，使用默认欢迎语');
            renderWelcome(true);
        }
    });
}

// 渲染欢迎信息
function renderWelcome(fallback = false) {
    const welcomeEl = document.getElementById("welcome-info");
    if (!welcomeEl) {
        setTimeout(() => renderWelcome(fallback), 100);
        return;
    }

    let htmlContent = '';
    if (fallback || !ipLoacation) {
        // 默认欢迎语（无位置信息）
        htmlContent = getTimeBasedGreeting();
    } else {
        // 完整欢迎语（含位置信息）
        const dist = getDistance(112.720513, 37.732379, 
                              ipLoacation.result.location.lng, 
                              ipLoacation.result.location.lat);
        const posInfo = getLocationDescription();
        htmlContent = `
            <b><center>🎉 欢迎信息 🎉</center>
            &emsp;&emsp;${getTimeBasedGreeting()}
            ${posInfo ? `欢迎来自 <span style="color:var(--theme-color)">${posInfo.pos}</span> 的小伙伴` : ''}
            ${dist ? `，您距离站长约 <span style="color:var(--theme-color)">${dist}</span> 公里` : ''}
            ${posInfo ? `，${posInfo.desc}` : ''}</b>
        `;
    }
    
    welcomeEl.innerHTML = htmlContent;
}

// 获取时间相关问候语
function getTimeBasedGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return "<span>上午好</span>，一日之计在于晨！";
    if (hour >= 11 && hour < 13) return "<span>中午好</span>，该摸鱼吃午饭了。";
    if (hour >= 13 && hour < 15) return "<span>下午好</span>，懒懒地睡个午觉吧！";
    if (hour >= 15 && hour < 16) return "<span>三点几啦</span>，一起饮茶呀！";
    if (hour >= 16 && hour < 19) return "<span>夕阳无限好！</span>";
    if (hour >= 19 && hour < 24) return "<span>晚上好</span>，夜生活嗨起来！";
    return "夜深了，早点休息，少熬夜。";
}

// 获取位置描述
function getLocationDescription() {
    if (!ipLoacation) return null;
    
    const info = ipLoacation.result.ad_info;
    let pos = info.nation;
    let desc = "带我去你的城市逛逛吧！";
    
    if (info.nation === "中国") {
        pos = `${info.province || ''} ${info.city || ''} ${info.district || ''}`.trim();
        desc = getChineseLocationDesc(info.province, info.city);
    } else {
        desc = getInternationalLocationDesc(info.nation);
    }
    
    return { pos, desc };
}

// 中国省份描述
function getChineseLocationDesc(province, city) {
    // 保持你原有的省份/城市switch-case逻辑
    // 示例：
    switch (province) {
        case "北京市": return "北——京——欢迎你~~~";
        case "广东省": return "老板来两斤福建人";
        // 其他省份...
        default: return "带我去你的城市逛逛吧！";
    }
}

// 国际位置描述
function getInternationalLocationDesc(country) {
    switch (country) {
        case "日本": return "よろしく，一起去看樱花吗";
        case "美国": return "Let us live in peace!";
        // 其他国家...
        default: return "带我去你的国家逛逛吧";
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', fetchLocation);
document.addEventListener('pjax:complete', () => {
    if (ipLoacation) renderWelcome();
    else fetchLocation();
});