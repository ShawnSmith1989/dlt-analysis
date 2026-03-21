/**
 * NEXUS CORE - 能量核心系统
 * JARVIS/Cyberpunk HUD 风格交互逻辑
 * 
 * 开发记录：
 * - 2026-03-21: 完全重写JS，适配新的HUD DOM结构
 * - 用户要求：电影级科技感界面，参考《钢铁侠》J.A.R.V.I.S.或《赛博朋克》HUD
 * - 关键变更：
 *   1. DOM选择器更新：.material-card → .data-node
 *   2. 选择器/输入框：.material-select → .node-select, .material-input → .node-input
 *   3. 能量核心：.circular-furnace → .energy-core
 *   4. 结果面板：.result-section → .result-panel
 *   5. 添加系统时间显示
 *   6. 添加加载百分比动画
 */

(function() {
    'use strict';
    
    /**
     * 五行颜色配置 - 冷色调版本
     */
    const ELEMENT_COLORS = {
        '水': '#00a8ff',
        '金': '#7a8fa8',
        '火': '#ff6b4a',
        '土': '#c4a35a',
        '木': '#00cc66'
    };
    
    /**
     * 时辰与五行映射
     */
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
    
    /**
     * 生肖与五行映射
     */
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
    
    /**
     * 星座与五行映射
     */
    const CONSTELLATION_MAP = {
        'aries': { name: '白羊', element: '火' },
        'taurus': { name: '金牛', element: '土' },
        'gemini': { name: '双子', element: '金' },
        'cancer': { name: '巨蟹', element: '水' },
        'leo': { name: '狮子', element: '火' },
        'virgo': { name: '处女', element: '土' },
        'libra': { name: '天秤', element: '金' },
        'scorpio': { name: '天蝎', element: '水' },
        'sagittarius': { name: '射手', element: '火' },
        'capricorn': { name: '摩羯', element: '土' },
        'aquarius': { name: '水瓶', element: '金' },
        'pisces': { name: '双鱼', element: '水' }
    };
    
    /**
     * 心情与五行映射
     */
    const MOOD_MAP = {
        'happy': { name: '开心', element: '火' },
        'calm': { name: '平静', element: '水' },
        'sad': { name: '忧郁', element: '木' },
        'angry': { name: '愤怒', element: '火' },
        'worried': { name: '忧虑', element: '土' },
        'fearful': { name: '恐惧', element: '水' }
    };
    
    /**
     * 天气与五行映射
     */
    const WEATHER_MAP = {
        'sunny': { name: '晴', element: '火' },
        'cloudy': { name: '多云', element: '金' },
        'overcast': { name: '阴', element: '土' },
        'lightRain': { name: '小雨', element: '水' },
        'heavyRain': { name: '大雨', element: '水' },
        'thunderstorm': { name: '雷雨', element: '火' },
        'snow': { name: '雪', element: '水' },
        'fog': { name: '雾', element: '水' }
    };
    
    /**
     * 风向与五行映射
     */
    const WIND_DIR_MAP = {
        'E': { name: '东风', element: '木' },
        'SE': { name: '东南', element: '木' },
        'S': { name: '南风', element: '火' },
        'SW': { name: '西南', element: '土' },
        'W': { name: '西风', element: '金' },
        'NW': { name: '西北', element: '金' },
        'N': { name: '北风', element: '水' },
        'NE': { name: '东北', element: '土' }
    };
    
    /**
     * 月相与五行映射
     */
    const MOON_PHASE_MAP = {
        'newMoon': { name: '新月', element: '水' },
        'waxingCrescent': { name: '蛾眉', element: '木' },
        'firstQuarter': { name: '上弦', element: '木' },
        'waxingGibbous': { name: '盈凸', element: '火' },
        'fullMoon': { name: '满月', element: '火' },
        'waningGibbous': { name: '亏凸', element: '土' },
        'lastQuarter': { name: '下弦', element: '金' },
        'waningCrescent': { name: '残月', element: '水' }
    };
    
    /**
     * 省份与五行映射
     */
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
    
    /**
     * 参数权重配置
     */
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
    
    /**
     * 前区号码五行映射
     */
    const FRONT_NUMBERS = {
        '水': [1, 2, 3, 4, 5, 6, 7],
        '金': [8, 9, 10, 11, 12, 13, 14],
        '火': [15, 16, 17, 18, 19, 20, 21],
        '土': [22, 23, 24, 25, 26, 27, 28],
        '木': [29, 30, 31, 32, 33, 34, 35]
    };
    
    /**
     * 后区号码五行映射
     */
    const BACK_NUMBERS = {
        '水': [1, 2, 3],
        '金': [4, 5, 6],
        '火': [7, 8, 9],
        '土': [10],
        '木': [11, 12]
    };
    
    /**
     * 当前选中的材料
     */
    let selectedMaterials = {};
    
    /**
     * 音效上下文
     */
    let audioContext = null;
    
    /**
     * 初始化音频上下文
     */
    function initAudio() {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('音频初始化失败:', e);
        }
    }
    
    /**
     * 播放音效
     */
    function playSound(type) {
        if (!audioContext) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch (type) {
            case 'select':
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
            case 'initiate':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.5);
                oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 1);
                gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 1);
                break;
            case 'success':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.4);
                break;
        }
    }
    
    /**
     * 初始化时辰选择器
     */
    function initHourSelect() {
        const select = document.getElementById('hourSelect');
        if (!select) return;
        
        for (let i = 0; i < 24; i++) {
            const shichen = SHICHEN_MAP[i];
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i.toString().padStart(2, '0')}:00`;
            select.appendChild(option);
        }
        
        const currentHour = new Date().getHours();
        select.value = currentHour;
        updateNodeDisplay('hour', currentHour);
    }
    
    /**
     * 初始化省份选择器
     */
    function initProvinceSelect() {
        const select = document.getElementById('provinceSelect');
        if (!select) return;
        
        const provinces = Object.keys(PROVINCE_MAP).sort();
        
        provinces.forEach(province => {
            const option = document.createElement('option');
            option.value = province;
            option.textContent = province;
            select.appendChild(option);
        });
        
        select.value = '广东';
        updateNodeDisplay('province', '广东');
    }
    
    /**
     * 默认显示值映射 - 保持与HTML初始值一致
     * 2026-03-21: 修复重置时标签突变问题
     */
    const DEFAULT_DISPLAY_VALUES = {
        'hour': '--:--',
        'province': '--',
        'weather': '--',
        'temperature': '--°C',
        'humidity': '--%',
        'windDir': '--',
        'windLevel': '--级',
        'moonPhase': '--',
        'zodiac': '--',
        'constellation': '--',
        'mood': '--',
        'luckyNumber': '--'
    };
    
    /**
     * 更新节点显示 - 适配新的HUD DOM结构
     * 2026-03-21: 完全重写以适配 .data-node 结构
     * 2026-03-21: 修复清空值时恢复原始占位符格式
     */
    function updateNodeDisplay(param, value) {
        const displayIdMap = {
            'hour': 'hourDisplay',
            'province': 'provinceDisplay',
            'weather': 'weatherDisplay',
            'temperature': 'tempDisplay',
            'humidity': 'humidityDisplay',
            'windDir': 'windDirDisplay',
            'windLevel': 'windLevelDisplay',
            'moonPhase': 'moonDisplay',
            'zodiac': 'zodiacDisplay',
            'constellation': 'constellationDisplay',
            'mood': 'moodDisplay',
            'luckyNumber': 'luckyDisplay'
        };
        
        const displayId = displayIdMap[param];
        if (!displayId) return;
        
        const displayEl = document.getElementById(displayId);
        if (!displayEl) return;
        
        const nodeEl = displayEl.closest('.data-node');
        
        if (!value && value !== 0) {
            displayEl.textContent = DEFAULT_DISPLAY_VALUES[param] || '--';
            if (nodeEl) nodeEl.classList.remove('active');
            delete selectedMaterials[param];
            return;
        }
        
        let displayText = '';
        let element = '';
        
        switch (param) {
            case 'hour':
                const hour = parseInt(value);
                const shichen = SHICHEN_MAP[hour];
                displayText = `${hour.toString().padStart(2, '0')}:00`;
                element = shichen.element;
                break;
            case 'province':
                element = PROVINCE_MAP[value];
                displayText = value;
                break;
            case 'weather':
                const weather = WEATHER_MAP[value];
                displayText = weather.name;
                element = weather.element;
                break;
            case 'temperature':
                const temp = parseFloat(value);
                if (temp < 5) element = '水';
                else if (temp < 15) element = '金';
                else if (temp < 25) element = '土';
                else if (temp < 35) element = '木';
                else element = '火';
                displayText = `${value}°C`;
                break;
            case 'humidity':
                const humidity = parseFloat(value);
                if (humidity < 30) element = '火';
                else if (humidity < 50) element = '金';
                else if (humidity < 70) element = '土';
                else if (humidity < 85) element = '木';
                else element = '水';
                displayText = `${value}%`;
                break;
            case 'windDir':
                const windDir = WIND_DIR_MAP[value];
                displayText = windDir.name;
                element = windDir.element;
                break;
            case 'windLevel':
                const level = parseInt(value);
                if (level === 0) element = '土';
                else if (level <= 3) element = '木';
                else if (level <= 5) element = '金';
                else if (level <= 7) element = '火';
                else element = '水';
                displayText = `${value}级`;
                break;
            case 'moonPhase':
                const moon = MOON_PHASE_MAP[value];
                displayText = moon.name;
                element = moon.element;
                break;
            case 'zodiac':
                const zodiac = ZODIAC_MAP[value];
                displayText = zodiac.name;
                element = zodiac.element;
                break;
            case 'constellation':
                const constellation = CONSTELLATION_MAP[value];
                displayText = constellation.name;
                element = constellation.element;
                break;
            case 'mood':
                const mood = MOOD_MAP[value];
                displayText = mood.name;
                element = mood.element;
                break;
            case 'luckyNumber':
                const num = parseInt(value) % 10;
                if (num === 1 || num === 6) element = '水';
                else if (num === 2 || num === 7) element = '火';
                else if (num === 3 || num === 8) element = '木';
                else if (num === 4 || num === 9) element = '金';
                else element = '土';
                displayText = `#${value}`;
                break;
        }
        
        displayEl.textContent = displayText;
        if (nodeEl) nodeEl.classList.add('active');
        selectedMaterials[param] = { value, element };
        
        playSound('select');
        updateCoreStatus();
    }
    
    /**
     * 更新核心状态显示
     * 2026-03-21: 新增功能，在核心中心显示选中材料数量
     */
    function updateCoreStatus() {
        const coreData = document.getElementById('coreData');
        if (!coreData) return;
        
        const count = Object.keys(selectedMaterials).length;
        const dataValue = coreData.querySelector('.data-value');
        
        if (dataValue) {
            if (count === 0) {
                dataValue.textContent = '待机';
            } else {
                dataValue.textContent = `${count}/12`;
            }
        }
    }
    
    /**
     * 绑定节点选择事件
     * 2026-03-21: 适配新的 .node-select 和 .node-input 选择器
     */
    function bindNodeEvents() {
        document.querySelectorAll('.node-select').forEach(select => {
            select.addEventListener('change', function() {
                const nodeEl = this.closest('.data-node');
                const param = nodeEl ? nodeEl.dataset.param : null;
                if (param) {
                    updateNodeDisplay(param, this.value);
                }
            });
        });
        
        document.querySelectorAll('.node-input').forEach(input => {
            input.addEventListener('input', function() {
                const nodeEl = this.closest('.data-node');
                const param = nodeEl ? nodeEl.dataset.param : null;
                if (param) {
                    updateNodeDisplay(param, this.value);
                }
            });
            
            input.addEventListener('change', function() {
                const nodeEl = this.closest('.data-node');
                const param = nodeEl ? nodeEl.dataset.param : null;
                if (param) {
                    updateNodeDisplay(param, this.value);
                }
            });
        });
    }
    
    /**
     * 计算五行得分
     */
    function calculateElementScore() {
        const scores = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
        let totalWeight = 0;
        
        Object.entries(selectedMaterials).forEach(([param, data]) => {
            const weight = WEIGHTS[param] || 0.05;
            if (data.element && scores.hasOwnProperty(data.element)) {
                scores[data.element] += weight;
                totalWeight += weight;
            }
        });
        
        if (totalWeight === 0) {
            return { '金': 0.2, '木': 0.2, '水': 0.2, '火': 0.2, '土': 0.2 };
        }
        
        const total = Object.values(scores).reduce((a, b) => a + b, 0);
        Object.keys(scores).forEach(key => {
            scores[key] = scores[key] / total;
        });
        
        return scores;
    }
    
    /**
     * 打乱数组
     */
    function shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    
    /**
     * 生成号码
     */
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
        
        return { frontNumbers, backNumbers, elementScores: scores };
    }
    
    /**
     * 获取号码的五行属性
     */
    function getNumberElement(num, isBackArea = false) {
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
    
    /**
     * 格式化号码
     */
    function formatNumber(num) {
        return num.toString().padStart(2, '0');
    }
    
    /**
     * 渲染结果
     * 2026-03-21: 适配新的 .number-matrix 结构
     */
    function renderResult(result) {
        const frontBalls = document.getElementById('frontBalls');
        const backBalls = document.getElementById('backBalls');
        
        if (!frontBalls || !backBalls) return;
        
        frontBalls.innerHTML = '';
        backBalls.innerHTML = '';
        
        result.frontNumbers.forEach((num, index) => {
            const ball = document.createElement('div');
            ball.className = `number-ball ${getNumberElement(num)}`;
            ball.textContent = formatNumber(num);
            ball.style.animationDelay = `${index * 0.1}s`;
            frontBalls.appendChild(ball);
        });
        
        result.backNumbers.forEach((num, index) => {
            const ball = document.createElement('div');
            ball.className = `number-ball ${getNumberElement(num, true)}`;
            ball.textContent = formatNumber(num);
            ball.style.animationDelay = `${(index + 5) * 0.1}s`;
            backBalls.appendChild(ball);
        });
        
        updateElementBar(result.elementScores);
    }
    
    /**
     * 更新五行分析条
     * 2026-03-21: 适配新的 .bar-segment 结构
     */
    function updateElementBar(scores) {
        const elementBar = document.getElementById('elementBar');
        if (!elementBar) return;
        
        const segments = elementBar.querySelectorAll('.bar-segment');
        const elements = ['water', 'metal', 'fire', 'earth', 'wood'];
        const elementKeys = ['水', '金', '火', '土', '木'];
        
        segments.forEach((segment, index) => {
            const element = elementKeys[index];
            const width = Math.max(5, scores[element] * 100);
            segment.style.setProperty('--width', `${width}%`);
        });
    }
    
    /**
     * 更新系统时间
     * 2026-03-21: 新增功能，实时显示系统时间
     */
    function updateSystemTime() {
        const timeEl = document.getElementById('systemTime');
        if (!timeEl) return;
        
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        
        timeEl.textContent = `${hours}:${minutes}:${seconds}`;
    }
    
    /**
     * 显示加载动画
     * 2026-03-21: 适配新的加载动画结构，添加百分比显示
     */
    function showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        const loadingStatus = document.getElementById('loadingStatus');
        const loadingDesc = document.getElementById('loadingDesc');
        const loadingPercent = document.getElementById('loadingPercent');
        
        if (!overlay) return null;
        
        overlay.classList.add('show');
        
        const messages = [
            { status: '扫描中', desc: '正在分析输入参数' },
            { status: '处理中', desc: '正在计算五行矩阵' },
            { status: '生成中', desc: '正在构建号码序列' },
            { status: '完成', desc: '输出就绪' }
        ];
        
        let progress = 0;
        let messageIndex = 0;
        
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress > 100) progress = 100;
            
            if (loadingPercent) {
                loadingPercent.textContent = `${Math.floor(progress)}%`;
            }
            
            if (progress >= (messageIndex + 1) * 25 && messageIndex < messages.length - 1) {
                messageIndex++;
                if (loadingStatus) loadingStatus.textContent = messages[messageIndex].status;
                if (loadingDesc) loadingDesc.textContent = messages[messageIndex].desc;
            }
        }, 300);
        
        playSound('initiate');
        
        return progressInterval;
    }
    
    /**
     * 隐藏加载动画
     */
    function hideLoading(interval) {
        if (interval) clearInterval(interval);
        
        const overlay = document.getElementById('loadingOverlay');
        const loadingPercent = document.getElementById('loadingPercent');
        
        if (loadingPercent) loadingPercent.textContent = '100%';
        
        setTimeout(() => {
            if (overlay) overlay.classList.remove('show');
        }, 200);
    }
    
    /**
     * 开始处理
     * 2026-03-21: 适配新的 .energy-core 和 .result-panel 结构
     */
    async function startInitiate() {
        const coreEl = document.getElementById('energyCore');
        const resultPanel = document.getElementById('resultSection');
        const coreData = document.getElementById('coreData');
        
        if (coreEl) {
            coreEl.classList.add('processing');
        }
        
        if (coreData) {
            const dataValue = coreData.querySelector('.data-value');
            if (dataValue) {
                dataValue.textContent = '运行中';
            }
        }
        
        const loadingInterval = showLoading();
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        hideLoading(loadingInterval);
        
        const scores = calculateElementScore();
        const result = generateNumbers(scores);
        
        renderResult(result);
        if (resultPanel) resultPanel.classList.add('show');
        
        playSound('success');
        
        if (coreEl) {
            coreEl.classList.remove('processing');
        }
        
        if (coreData) {
            const dataValue = coreData.querySelector('.data-value');
            if (dataValue) {
                dataValue.textContent = '完成';
            }
        }
        
        setTimeout(() => {
            updateCoreStatus();
        }, 2000);
        
        if (resultPanel) {
            resultPanel.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    /**
     * 重置所有节点
     * 2026-03-21: 适配新的DOM结构
     * 2026-03-21: 修复重置时标签突变问题，使用DEFAULT_DISPLAY_VALUES
     */
    function resetNodes() {
        selectedMaterials = {};
        
        document.querySelectorAll('.node-select').forEach(select => {
            select.selectedIndex = 0;
        });
        
        document.querySelectorAll('.node-input').forEach(input => {
            input.value = '';
        });
        
        document.querySelectorAll('.data-node').forEach(node => {
            const param = node.dataset.param;
            const valueEl = node.querySelector('.node-value');
            if (valueEl && param) {
                valueEl.textContent = DEFAULT_DISPLAY_VALUES[param] || '--';
            }
            node.classList.remove('active');
        });
        
        const coreEl = document.getElementById('energyCore');
        if (coreEl) coreEl.classList.remove('processing');
        
        const resultPanel = document.getElementById('resultSection');
        if (resultPanel) resultPanel.classList.remove('show');
        
        const coreData = document.getElementById('coreData');
        if (coreData) {
            const dataValue = coreData.querySelector('.data-value');
            if (dataValue) {
                dataValue.textContent = '待机';
            }
        }
        
        const hourSelect = document.getElementById('hourSelect');
        const provinceSelect = document.getElementById('provinceSelect');
        
        if (hourSelect) {
            hourSelect.value = new Date().getHours();
            updateNodeDisplay('hour', new Date().getHours());
        }
        
        if (provinceSelect) {
            provinceSelect.value = '广东';
            updateNodeDisplay('province', '广东');
        }
    }
    
    /**
     * 复制号码
     */
    function copyNumbers() {
        const frontNums = Array.from(document.querySelectorAll('#frontBalls .number-ball'))
            .map(ball => ball.textContent).join(' ');
        const backNums = Array.from(document.querySelectorAll('#backBalls .number-ball'))
            .map(ball => ball.textContent).join(' ');
        
        const text = `前区: ${frontNums} | 后区: ${backNums}`;
        
        navigator.clipboard.writeText(text).then(() => {
            showNotification('号码已复制');
        }).catch(() => {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showNotification('号码已复制');
        });
    }
    
    /**
     * 显示通知
     * 2026-03-21: 更新为HUD风格通知
     */
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            font-family: 'Orbitron', monospace;
            font-size: 0.85rem;
            font-weight: 600;
            letter-spacing: 2px;
            text-transform: uppercase;
            background: rgba(0, 212, 255, 0.15);
            color: #00d4ff;
            padding: 12px 30px;
            border: 1px solid rgba(0, 212, 255, 0.5);
            backdrop-filter: blur(10px);
            z-index: 10000;
            box-shadow: 0 0 25px rgba(0, 212, 255, 0.3);
            animation: notifyAppear 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
    
    /**
     * 初始化
     * 2026-03-21: 完全重写初始化逻辑
     */
    document.addEventListener('DOMContentLoaded', function() {
        initAudio();
        initHourSelect();
        initProvinceSelect();
        bindNodeEvents();
        
        updateSystemTime();
        setInterval(updateSystemTime, 1000);
        
        const initiateBtn = document.getElementById('alchemyBtn');
        const resetBtn = document.getElementById('resetBtn');
        const copyBtn = document.getElementById('copyBtn');
        const regenerateBtn = document.getElementById('regenerateBtn');
        
        if (initiateBtn) {
            initiateBtn.addEventListener('click', function() {
                initAudio();
                startInitiate();
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', resetNodes);
        }
        
        if (copyBtn) {
            copyBtn.addEventListener('click', copyNumbers);
        }
        
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', function() {
                initAudio();
                startInitiate();
            });
        }
    });
    
})();
