/**
 * NEXUS AI生成 - HUD风格脚本
 * 
 * 开发记录:
 * - 2026-03-21: 基于原ai.js改造，适配HUD界面风格
 * - 保持原有五行映射和号码生成算法
 * - 使用HUD风格的结果展示和通知组件
 */

(function() {
    'use strict';
    
    const ELEMENT_COLORS = {
        '水': '#00a8ff',
        '金': '#7a8fa8',
        '火': '#ff6b4a',
        '土': '#c4a35a',
        '木': '#00cc66'
    };
    
    const ELEMENT_CLASSES = {
        '水': 'water',
        '金': 'metal',
        '火': 'fire',
        '土': 'earth',
        '木': 'wood'
    };
    
    const SHICHEN_MAP = {
        23: { name: '子时', element: '水' },
        0: { name: '子时', element: '水' },
        1: { name: '丑时', element: '土' },
        2: { name: '丑时', element: '土' },
        3: { name: '寅时', element: '木' },
        4: { name: '寅时', element: '木' },
        5: { name: '卯时', element: '木' },
        6: { name: '卯时', element: '木' },
        7: { name: '辰时', element: '土' },
        8: { name: '辰时', element: '土' },
        9: { name: '巳时', element: '火' },
        10: { name: '巳时', element: '火' },
        11: { name: '午时', element: '火' },
        12: { name: '午时', element: '火' },
        13: { name: '未时', element: '土' },
        14: { name: '未时', element: '土' },
        15: { name: '申时', element: '金' },
        16: { name: '申时', element: '金' },
        17: { name: '酉时', element: '金' },
        18: { name: '酉时', element: '金' },
        19: { name: '戌时', element: '土' },
        20: { name: '戌时', element: '土' },
        21: { name: '亥时', element: '水' },
        22: { name: '亥时', element: '水' }
    };
    
    const ZODIAC_MAP = {
        'rat': { name: '鼠', element: '水' },
        'ox': { name: '牛', element: '土' },
        'tiger': { name: '虎', element: '木' },
        'rabbit': { name: '兔', element: '木' },
        'dragon': { name: '龙', element: '土' },
        'snake': { name: '蛇', element: '火' },
        'horse': { name: '马', element: '火' },
        'goat': { name: '羊', element: '土' },
        'monkey': { name: '猴', element: '金' },
        'rooster': { name: '鸡', element: '金' },
        'dog': { name: '狗', element: '土' },
        'pig': { name: '猪', element: '水' }
    };
    
    const CONSTELLATION_MAP = {
        'aries': { name: '白羊座', element: '火' },
        'taurus': { name: '金牛座', element: '土' },
        'gemini': { name: '双子座', element: '金' },
        'cancer': { name: '巨蟹座', element: '水' },
        'leo': { name: '狮子座', element: '火' },
        'virgo': { name: '处女座', element: '土' },
        'libra': { name: '天秤座', element: '金' },
        'scorpio': { name: '天蝎座', element: '水' },
        'sagittarius': { name: '射手座', element: '火' },
        'capricorn': { name: '摩羯座', element: '土' },
        'aquarius': { name: '水瓶座', element: '金' },
        'pisces': { name: '双鱼座', element: '水' }
    };
    
    const MOOD_MAP = {
        'happy': { name: '开心/兴奋', element: '火' },
        'calm': { name: '平静/安宁', element: '水' },
        'sad': { name: '忧郁/悲伤', element: '木' },
        'angry': { name: '愤怒/焦躁', element: '火' },
        'worried': { name: '忧虑/思虑', element: '土' },
        'fearful': { name: '恐惧/不安', element: '水' }
    };
    
    const WEATHER_MAP = {
        'sunny': { name: '晴天', element: '火' },
        'cloudy': { name: '多云', element: '金' },
        'overcast': { name: '阴天', element: '土' },
        'lightRain': { name: '小雨', element: '水' },
        'heavyRain': { name: '大雨', element: '水' },
        'thunderstorm': { name: '雷雨', element: '火' },
        'snow': { name: '雪', element: '水' },
        'fog': { name: '雾', element: '水' },
        'haze': { name: '霾', element: '土' }
    };
    
    const WIND_DIR_MAP = {
        'E': { name: '东风', element: '木' },
        'SE': { name: '东南风', element: '木' },
        'S': { name: '南风', element: '火' },
        'SW': { name: '西南风', element: '土' },
        'W': { name: '西风', element: '金' },
        'NW': { name: '西北风', element: '金' },
        'N': { name: '北风', element: '水' },
        'NE': { name: '东北风', element: '土' }
    };
    
    const MOON_PHASE_MAP = {
        'newMoon': { name: '新月', element: '水' },
        'waxingCrescent': { name: '蛾眉月', element: '木' },
        'firstQuarter': { name: '上弦月', element: '木' },
        'waxingGibbous': { name: '盈凸月', element: '火' },
        'fullMoon': { name: '满月', element: '火' },
        'waningGibbous': { name: '亏凸月', element: '土' },
        'lastQuarter': { name: '下弦月', element: '金' },
        'waningCrescent': { name: '残月', element: '水' }
    };
    
    const PROVINCE_MAP = {
        '北京': '水', '天津': '水', '河北': '水', '山西': '金', '内蒙古': '水',
        '辽宁': '水', '吉林': '水', '黑龙江': '水',
        '上海': '木', '江苏': '木', '浙江': '木', '安徽': '土', '福建': '火', '江西': '火',
        '山东': '木',
        '河南': '土', '湖北': '土', '湖南': '火',
        '广东': '火', '广西': '火', '海南': '火',
        '重庆': '金', '四川': '金', '贵州': '火', '云南': '金', '西藏': '金',
        '陕西': '金', '甘肃': '金', '青海': '金', '宁夏': '金', '新疆': '金',
        '香港': '火', '澳门': '火', '台湾': '木'
    };
    
    const WEIGHTS = {
        hour: 0.10,
        temperature: 0.08,
        humidity: 0.05,
        windDir: 0.05,
        windLevel: 0.05,
        weather: 0.05,
        moonPhase: 0.04,
        province: 0.08,
        zodiac: 0.08,
        constellation: 0.05,
        mood: 0.05,
        luckyNumber: 0.05
    };
    
    const FRONT_NUMBERS = {
        '水': [1, 2, 3, 4, 5, 6, 7],
        '金': [8, 9, 10, 11, 12, 13, 14],
        '火': [15, 16, 17, 18, 19, 20, 21],
        '土': [22, 23, 24, 25, 26, 27, 28],
        '木': [29, 30, 31, 32, 33, 34, 35]
    };
    
    const BACK_NUMBERS = {
        '水': [1, 2, 3],
        '金': [4, 5, 6],
        '火': [7, 8, 9],
        '土': [10],
        '木': [11, 12]
    };
    
    function getHourElement(hour) {
        const h = parseInt(hour);
        if (isNaN(h) || h < 0 || h > 23) return null;
        return SHICHEN_MAP[h].element;
    }
    
    function getTemperatureElement(temp) {
        const t = parseFloat(temp);
        if (isNaN(t)) return null;
        if (t < 5) return '水';
        if (t < 15) return '金';
        if (t < 25) return '土';
        if (t < 30) return '木';
        return '火';
    }
    
    function getHumidityElement(humidity) {
        const h = parseFloat(humidity);
        if (isNaN(h)) return null;
        if (h < 30) return '火';
        if (h < 50) return '金';
        if (h < 70) return '土';
        if (h < 85) return '木';
        return '水';
    }
    
    function getWindLevelElement(level) {
        const l = parseInt(level);
        if (isNaN(l)) return null;
        if (l === 0) return '土';
        if (l <= 3) return '木';
        if (l <= 5) return '金';
        if (l <= 7) return '火';
        return '水';
    }
    
    function getNumberElement(num) {
        const lastDigit = parseInt(num) % 10;
        if (lastDigit === 1 || lastDigit === 6) return '水';
        if (lastDigit === 2 || lastDigit === 7) return '火';
        if (lastDigit === 3 || lastDigit === 8) return '木';
        if (lastDigit === 4 || lastDigit === 9) return '金';
        return '土';
    }
    
    function calculateElementScore(inputs) {
        const scores = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
        let totalWeight = 0;
        
        if (inputs.hour !== null && inputs.hour !== undefined && inputs.hour !== '') {
            const element = getHourElement(inputs.hour);
            if (element) {
                scores[element] += WEIGHTS.hour;
                totalWeight += WEIGHTS.hour;
            }
        }
        
        if (inputs.temperature !== null && inputs.temperature !== undefined && inputs.temperature !== '') {
            const element = getTemperatureElement(inputs.temperature);
            if (element) {
                scores[element] += WEIGHTS.temperature;
                totalWeight += WEIGHTS.temperature;
            }
        }
        
        if (inputs.humidity !== null && inputs.humidity !== undefined && inputs.humidity !== '') {
            const element = getHumidityElement(inputs.humidity);
            if (element) {
                scores[element] += WEIGHTS.humidity;
                totalWeight += WEIGHTS.humidity;
            }
        }
        
        if (inputs.windDir && WIND_DIR_MAP[inputs.windDir]) {
            const element = WIND_DIR_MAP[inputs.windDir].element;
            scores[element] += WEIGHTS.windDir;
            totalWeight += WEIGHTS.windDir;
        }
        
        if (inputs.windLevel !== null && inputs.windLevel !== undefined && inputs.windLevel !== '') {
            const element = getWindLevelElement(inputs.windLevel);
            if (element) {
                scores[element] += WEIGHTS.windLevel;
                totalWeight += WEIGHTS.windLevel;
            }
        }
        
        if (inputs.weather && WEATHER_MAP[inputs.weather]) {
            const element = WEATHER_MAP[inputs.weather].element;
            scores[element] += WEIGHTS.weather;
            totalWeight += WEIGHTS.weather;
        }
        
        if (inputs.moonPhase && MOON_PHASE_MAP[inputs.moonPhase]) {
            const element = MOON_PHASE_MAP[inputs.moonPhase].element;
            scores[element] += WEIGHTS.moonPhase;
            totalWeight += WEIGHTS.moonPhase;
        }
        
        if (inputs.province && PROVINCE_MAP[inputs.province]) {
            const element = PROVINCE_MAP[inputs.province];
            scores[element] += WEIGHTS.province;
            totalWeight += WEIGHTS.province;
        }
        
        if (inputs.zodiac && ZODIAC_MAP[inputs.zodiac]) {
            const element = ZODIAC_MAP[inputs.zodiac].element;
            scores[element] += WEIGHTS.zodiac;
            totalWeight += WEIGHTS.zodiac;
        }
        
        if (inputs.constellation && CONSTELLATION_MAP[inputs.constellation]) {
            const element = CONSTELLATION_MAP[inputs.constellation].element;
            scores[element] += WEIGHTS.constellation;
            totalWeight += WEIGHTS.constellation;
        }
        
        if (inputs.mood && MOOD_MAP[inputs.mood]) {
            const element = MOOD_MAP[inputs.mood].element;
            scores[element] += WEIGHTS.mood;
            totalWeight += WEIGHTS.mood;
        }
        
        if (inputs.luckyNumber !== null && inputs.luckyNumber !== undefined && inputs.luckyNumber !== '') {
            const element = getNumberElement(inputs.luckyNumber);
            scores[element] += WEIGHTS.luckyNumber;
            totalWeight += WEIGHTS.luckyNumber;
        }
        
        if (totalWeight === 0) {
            return { '金': 0.2, '木': 0.2, '水': 0.2, '火': 0.2, '土': 0.2 };
        }
        
        return scores;
    }
    
    function shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    
    function generateNumbers(scores) {
        const sortedElements = Object.entries(scores)
            .sort((a, b) => b[1] - a[1]);
        
        const topElements = sortedElements.slice(0, 3).map(([element]) => element);
        
        let frontPool = [];
        let backPool = [];
        
        topElements.forEach(element => {
            frontPool = frontPool.concat(FRONT_NUMBERS[element]);
            backPool = backPool.concat(BACK_NUMBERS[element]);
        });
        
        frontPool = [...new Set(frontPool)];
        backPool = [...new Set(backPool)];
        
        if (frontPool.length < 5) {
            const allElements = ['金', '木', '水', '火', '土'];
            for (const elem of allElements) {
                if (!topElements.includes(elem)) {
                    frontPool = frontPool.concat(FRONT_NUMBERS[elem]);
                    backPool = backPool.concat(BACK_NUMBERS[elem]);
                    if (frontPool.length >= 5) break;
                }
            }
        }
        
        const shuffledFront = shuffleArray(frontPool);
        const frontNumbers = shuffledFront.slice(0, 5).sort((a, b) => a - b);
        
        if (backPool.length < 2) {
            backPool = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        }
        const shuffledBack = shuffleArray(backPool);
        const backNumbers = shuffledBack.slice(0, 2).sort((a, b) => a - b);
        
        return { frontNumbers, backNumbers, elementScores: scores, topElements };
    }
    
    function formatNumber(num) {
        return num.toString().padStart(2, '0');
    }
    
    function getNumberClass(num, isBackArea) {
        if (isBackArea) {
            if (num <= 3) return ELEMENT_CLASSES['水'];
            if (num <= 6) return ELEMENT_CLASSES['金'];
            if (num <= 9) return ELEMENT_CLASSES['火'];
            if (num === 10) return ELEMENT_CLASSES['土'];
            return ELEMENT_CLASSES['木'];
        }
        
        if (num <= 7) return ELEMENT_CLASSES['水'];
        if (num <= 14) return ELEMENT_CLASSES['金'];
        if (num <= 21) return ELEMENT_CLASSES['火'];
        if (num <= 28) return ELEMENT_CLASSES['土'];
        return ELEMENT_CLASSES['木'];
    }
    
    function getNumberElementName(num, isBackArea) {
        if (isBackArea) {
            if (num <= 3) return '水';
            if (num <= 6) return '金';
            if (num <= 9) return '火';
            if (num === 10) return '土';
            return '木';
        }
        
        if (num <= 7) return '水';
        if (num <= 14) return '金';
        if (num <= 21) return '火';
        if (num <= 28) return '土';
        return '木';
    }
    
    function renderResult(result) {
        const frontContainer = document.getElementById('frontNumbers');
        const backContainer = document.getElementById('backNumbers');
        const analysisContainer = document.getElementById('elementAnalysis');
        
        frontContainer.innerHTML = '';
        backContainer.innerHTML = '';
        analysisContainer.innerHTML = '';
        
        result.frontNumbers.forEach((num, index) => {
            const ball = document.createElement('span');
            const elementName = getNumberElementName(num, false);
            ball.className = `result-ball ${getNumberClass(num, false)}`;
            ball.textContent = formatNumber(num);
            ball.style.animationDelay = `${index * 0.1}s`;
            frontContainer.appendChild(ball);
        });
        
        result.backNumbers.forEach((num, index) => {
            const ball = document.createElement('span');
            ball.className = `result-ball back ${getNumberClass(num, true)}`;
            ball.textContent = formatNumber(num);
            ball.style.animationDelay = `${(index + 5) * 0.1}s`;
            backContainer.appendChild(ball);
        });
        
        const elementCounts = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
        result.frontNumbers.forEach(num => {
            const element = getNumberElementName(num, false);
            elementCounts[element]++;
        });
        
        Object.entries(elementCounts).forEach(([element, count]) => {
            if (count > 0) {
                const tag = document.createElement('span');
                tag.className = `element-tag ${ELEMENT_CLASSES[element]}`;
                tag.innerHTML = `<span class="dot"></span>${element}(${count})`;
                analysisContainer.appendChild(tag);
            }
        });
    }
    
    function collectInputs() {
        return {
            hour: document.getElementById('hour').value,
            temperature: document.getElementById('temperature').value,
            humidity: document.getElementById('humidity').value,
            windDir: document.getElementById('windDir').value,
            windLevel: document.getElementById('windLevel').value,
            weather: document.getElementById('weather').value,
            moonPhase: document.getElementById('moonPhase').value,
            province: document.getElementById('province').value,
            zodiac: document.getElementById('zodiac').value,
            constellation: document.getElementById('constellation').value,
            mood: document.getElementById('mood').value,
            luckyNumber: document.getElementById('luckyNumber').value
        };
    }
    
    function updateShichenDisplay() {
        const hour = parseInt(document.getElementById('hour').value);
        const shichenText = document.getElementById('shichenText');
        const shichenElement = document.getElementById('shichenElement');
        
        if (!isNaN(hour) && hour >= 0 && hour <= 23) {
            const shichen = SHICHEN_MAP[hour];
            shichenText.textContent = shichen.name;
            shichenElement.textContent = shichen.element;
            shichenElement.style.borderColor = ELEMENT_COLORS[shichen.element];
            shichenElement.style.color = ELEMENT_COLORS[shichen.element];
        } else {
            shichenText.textContent = '--';
            shichenElement.textContent = '--';
            shichenElement.style.borderColor = '';
            shichenElement.style.color = '';
        }
    }
    
    function updateLocationDisplay() {
        const province = document.getElementById('province').value;
        const locationElementText = document.getElementById('locationElementText');
        
        if (province && PROVINCE_MAP[province]) {
            const element = PROVINCE_MAP[province];
            locationElementText.innerHTML = `<span style="color: ${ELEMENT_COLORS[element]}; font-family: var(--font-display); font-weight: 600;">${element}</span>`;
        } else {
            locationElementText.textContent = '--';
        }
    }
    
    function copyNumbers() {
        const frontNums = Array.from(document.querySelectorAll('#frontNumbers .result-ball'))
            .map(ball => ball.textContent).join(' ');
        const backNums = Array.from(document.querySelectorAll('#backNumbers .result-ball'))
            .map(ball => ball.textContent).join(' ');
        
        const text = `前区: ${frontNums} | 后区: ${backNums}`;
        
        navigator.clipboard.writeText(text).then(() => {
            showHudNotification('号码已复制到剪贴板');
        }).catch(() => {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showHudNotification('号码已复制到剪贴板');
        });
    }
    
    function showHudNotification(message) {
        const existing = document.querySelector('.hud-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = 'hud-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    function initProvinceSelect() {
        const select = document.getElementById('province');
        const provinces = Object.keys(PROVINCE_MAP).sort();
        
        provinces.forEach(province => {
            const option = document.createElement('option');
            option.value = province;
            option.textContent = province;
            if (province === '广东') {
                option.selected = true;
            }
            select.appendChild(option);
        });
        
        updateLocationDisplay();
    }
    
    function initCollapsible() {
        const collapsibles = document.querySelectorAll('.collapsible');
        collapsibles.forEach(el => {
            const header = el.querySelector('.collapsible-header');
            if (header) {
                header.addEventListener('click', (e) => {
                    e.stopPropagation();
                    el.classList.toggle('collapsed');
                });
            }
        });
    }
    
    function initCurrentTime() {
        const now = new Date();
        const hour = now.getHours();
        document.getElementById('hour').value = hour;
        updateShichenDisplay();
    }
    
    function startClock() {
        function updateTime() {
            const now = new Date();
            const timeStr = now.toTimeString().slice(0, 8);
            const timeEl = document.getElementById('currentTime');
            if (timeEl) timeEl.textContent = timeStr;
        }
        updateTime();
        setInterval(updateTime, 1000);
    }
    
    function applyDefaultValues() {
        document.getElementById('temperature').value = 22;
        document.getElementById('humidity').value = 60;
        document.getElementById('weather').value = 'sunny';
        document.getElementById('windDir').value = 'NE';
        document.getElementById('windLevel').value = 2;
        document.getElementById('zodiac').value = 'dragon';
        document.getElementById('constellation').value = 'libra';
        document.getElementById('mood').value = 'happy';
        document.getElementById('luckyNumber').value = 8;
        
        const provinceSelect = document.getElementById('province');
        provinceSelect.value = '广东';
    }
    
    function resetForm() {
        document.getElementById('aiForm').reset();
        initCurrentTime();
        applyDefaultValues();
        updateLocationDisplay();
        
        document.getElementById('placeholderContent').style.display = 'block';
        document.getElementById('resultContent').style.display = 'none';
        document.getElementById('loadingOverlay').style.display = 'none';
    }
    
    function generateAndShow() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        const resultContent = document.getElementById('resultContent');
        const placeholderContent = document.getElementById('placeholderContent');
        
        placeholderContent.style.display = 'none';
        loadingOverlay.style.display = 'flex';
        resultContent.style.display = 'none';
        
        setTimeout(() => {
            const inputs = collectInputs();
            const scores = calculateElementScore(inputs);
            const result = generateNumbers(scores);
            
            loadingOverlay.style.display = 'none';
            resultContent.style.display = 'block';
            
            renderResult(result);
        }, 800);
    }
    
    document.addEventListener('DOMContentLoaded', function() {
        initProvinceSelect();
        initCollapsible();
        initCurrentTime();
        applyDefaultValues();
        startClock();
        
        document.getElementById('hour').addEventListener('input', updateShichenDisplay);
        document.getElementById('hour').addEventListener('change', updateShichenDisplay);
        document.getElementById('province').addEventListener('change', updateLocationDisplay);
        
        document.getElementById('generateBtn').addEventListener('click', generateAndShow);
        document.getElementById('resetBtn').addEventListener('click', resetForm);
        document.getElementById('copyBtn').addEventListener('click', copyNumbers);
        document.getElementById('regenerateBtn').addEventListener('click', generateAndShow);
    });
    
})();
