/**
 * NEXUS 数据矩阵 - HUD风格脚本
 * 
 * 开发记录:
 * - 2026-03-21: 基于原script.js改造，适配HUD界面风格
 * - 保持原有数据分析和筛选功能
 * - 使用HUD风格的表格、分页、通知组件
 * - 2026-03-22: 添加五行属性分布图表
 *   - 竖轴为号码大小，按五行属性分为五个刻度
 *   - 横轴为期数
 *   - 使用Chart.js实现散点图
 * - 2026-03-24: 实现刷新页面自动获取最新开奖数据功能
 *   - 添加fetchLatestData()前端直接从API获取数据
 *   - 添加checkForUpdates()检查数据更新
 *   - 添加错误处理和用户提示机制
 */

const numberProperties = {
    water: { range: [1, 7], element: "水", class: "water" },
    metal: { range: [8, 14], element: "金", class: "metal" },
    fire: { range: [15, 21], element: "火", class: "fire" },
    earth: { range: [22, 28], element: "土", class: "earth" },
    wood: { range: [29, 35], element: "木", class: "wood" }
};

const backNumberProperties = {
    water: { range: [1, 3], element: "水", class: "water" },
    metal: { range: [4, 6], element: "金", class: "metal" },
    fire: { range: [7, 9], element: "火", class: "fire" },
    earth: { range: [10, 10], element: "土", class: "earth" },
    wood: { range: [11, 12], element: "木", class: "wood" }
};

const elementColors = {
    water: 'rgba(30, 136, 229, 0.75)',
    metal: 'rgba(120, 144, 156, 0.75)',
    fire: 'rgba(239, 83, 80, 0.75)',
    earth: 'rgba(255, 152, 0, 0.75)',
    wood: 'rgba(76, 175, 80, 0.75)'
};

let elementChart = null;

const primeNumbers = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31];

let allData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 20;

const API_URL = 'https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry?gameNo=85&provinceId=0&pageSize=20&isVerify=1&pageNo=1';

document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
    loadLocalData();
    showHudNotification('正在检查最新开奖数据...', 'info');
    await checkForUpdates();
    bindEvents();
    displayData();
    updateStatistics();
    initElementChart();
    startClock();
}

/**
 * 检查数据更新 - 2026-03-24新增
 * 优先尝试前端直接获取，失败则尝试后端接口
 */
async function checkForUpdates() {
    const currentLatestPeriod = allData.length > 0 ? allData[0].period : '0';

    try {
        const result = await autoUpdateData();
        const latestPeriod = allData.length > 0 ? allData[0].period : '0';

        if (parseInt(latestPeriod) > parseInt(currentLatestPeriod)) {
            showHudNotification(`数据更新成功！最新期号 ${latestPeriod}`, 'success');
        } else if (result && result.message) {
            showHudNotification(result.message, 'info');
        } else {
            showHudNotification('数据已是最新', 'info');
        }
        return true;
    } catch (error) {
        console.warn('后端更新失败，尝试前端直连:', error.message);
    }

    try {
        const latestData = await fetchLatestDataFromAPI();
        if (latestData && latestData.length > 0) {
            const latestPeriod = latestData[0].lotteryDrawNum || latestData[0].period;
            if (parseInt(latestPeriod) > parseInt(currentLatestPeriod)) {
                const newRecords = await mergeNewData(latestData);
                if (newRecords > 0) {
                    updateDataView();
                    showHudNotification(`已同步 ${newRecords} 条最新记录`, 'success');
                    return true;
                }
            } else {
                showHudNotification('数据已是最新', 'info');
                return true;
            }
        }
    } catch (error) {
        console.warn('前端获取数据失败:', error.message);
    }

    showHudNotification('自动更新失败，当前显示本地数据', 'error');
    return false;
}

/**
 * 从API直接获取最新数据 - 2026-03-24新增
 * 使用JSONP方式绕过跨域限制
 */
function fetchLatestDataFromAPI() {
    return new Promise((resolve, reject) => {
        const callbackName = 'lotteryCallback_' + Date.now();
        const url = `${API_URL}&callback=${callbackName}`;
        
        window[callbackName] = function(data) {
            delete window[callbackName];
            document.body.removeChild(script);
            
            try {
                if (data.success && data.value && data.value.list) {
                    resolve(data.value.list);
                } else if (data.success && data.data && data.data.list) {
                    resolve(data.data.list);
                } else {
                    reject(new Error('API返回数据格式不正确'));
                }
            } catch (e) {
                reject(e);
            }
        };
        
        const script = document.createElement('script');
        script.src = url;
        script.onerror = () => {
            delete window[callbackName];
            document.body.removeChild(script);
            reject(new Error('网络请求失败'));
        };
        
        const timeout = setTimeout(() => {
            delete window[callbackName];
            if (script.parentNode) {
                document.body.removeChild(script);
            }
            reject(new Error('请求超时'));
        }, 10000);
        
        script.onload = () => clearTimeout(timeout);
        document.body.appendChild(script);
    });
}

/**
 * 合并新数据到现有数据 - 2026-03-24新增
 */
async function mergeNewData(apiData) {
    if (!apiData || apiData.length === 0) return 0;
    
    const existingPeriods = new Set(allData.map(item => item.period));
    let newCount = 0;
    
    const convertedData = apiData.map(item => {
        const lotteryDrawNum = item.lotteryDrawNum;
        const lotteryDrawResult = item.lotteryDrawResult;
        const lotteryDrawTime = item.lotteryDrawTime;
        
        if (!lotteryDrawResult) return null;
        
        const numbers = lotteryDrawResult.split(' ');
        if (numbers.length < 7) return null;
        
        return {
            period: lotteryDrawNum,
            date: lotteryDrawTime ? lotteryDrawTime.split(' ')[0] : '',
            frontNumbers: numbers.slice(0, 5).map(n => parseInt(n)),
            backNumbers: numbers.slice(5, 7).map(n => parseInt(n)),
            rawData: `${lotteryDrawNum} ${lotteryDrawTime ? lotteryDrawTime.split(' ')[0] : ''} ${numbers.join(' ')}`
        };
    }).filter(item => item !== null);
    
    for (const item of convertedData) {
        if (!existingPeriods.has(item.period)) {
            const analysis = analyzeNumbers(item.frontNumbers, item.backNumbers);
            allData.unshift({ ...item, ...analysis });
            existingPeriods.add(item.period);
            newCount++;
        }
    }
    
    if (newCount > 0) {
        allData.sort((a, b) => parseInt(b.period) - parseInt(a.period));
        filteredData = [...allData];
        updateTotalCount();
    }
    
    return newCount;
}

async function autoUpdateData() {
    const response = await fetch('/update_data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update' })
    });

    if (!response.ok) {
        throw new Error(`更新接口请求失败: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
        throw new Error(result.message || '更新接口执行失败');
    }

    const latestData = await fetchLocalDataFile();
    loadDataIntoState(latestData);
    updateDataView();
    return result;
}

function loadLocalData() {
    if (typeof lotteryData !== 'undefined' && lotteryData.length > 0) {
        loadDataIntoState(lotteryData);
        updateTotalCount();
    } else {
        showHudNotification('数据加载失败，请刷新页面重试', 'error');
    }
}

function loadDataIntoState(data) {
    allData = data.map(item => {
        const analysis = analyzeNumbers(item.frontNumbers, item.backNumbers);
        return { ...item, ...analysis };
    });
    allData.sort((a, b) => parseInt(b.period) - parseInt(a.period));
    filteredData = [...allData];
}

async function fetchLocalDataFile() {
    const response = await fetch(`data.js?t=${Date.now()}`, {
        cache: 'no-store'
    });

    if (!response.ok) {
        throw new Error(`读取本地数据失败: ${response.status}`);
    }

    const text = await response.text();
    const match = text.match(/const lotteryData = (\[[\s\S]*?\]);/);
    if (!match || !match[1]) {
        throw new Error('解析本地数据失败');
    }

    return JSON.parse(match[1]);
}

function updateDataView() {
    currentPage = 1;
    displayData();
    updateStatistics();
    updateTotalCount();
    if (elementChart) {
        updateElementChart();
    }
}

function analyzeNumbers(frontNumbers, backNumbers) {
    const oddEven = calculateOddEven(frontNumbers);
    const primeComposite = calculatePrimeComposite(frontNumbers);
    const numProperties = getNumberProperties(frontNumbers);
    const sum = frontNumbers.reduce((total, num) => total + num, 0);
    const range = Math.max(...frontNumbers) - Math.min(...frontNumbers);
    
    return { oddEven, primeComposite, numberProperties: numProperties, sum, range };
}

function calculateOddEven(numbers) {
    let oddCount = 0, evenCount = 0;
    for (const num of numbers) {
        if (num % 2 === 0) evenCount++;
        else oddCount++;
    }
    return `${oddCount}:${evenCount}`;
}

function calculatePrimeComposite(numbers) {
    let primeCount = 0, compositeCount = 0;
    for (const num of numbers) {
        if (primeNumbers.includes(num)) primeCount++;
        else compositeCount++;
    }
    return `${primeCount}:${compositeCount}`;
}

function getNumberProperties(numbers) {
    const properties = {};
    for (const num of numbers) {
        for (const [key, config] of Object.entries(numberProperties)) {
            if (num >= config.range[0] && num <= config.range[1]) {
                if (!properties[key]) properties[key] = [];
                properties[key].push(num);
                break;
            }
        }
    }
    return properties;
}

function getNumberClass(num, isBack = false) {
    const props = isBack ? backNumberProperties : numberProperties;
    for (const [key, config] of Object.entries(props)) {
        if (num >= config.range[0] && num <= config.range[1]) {
            return config.class;
        }
    }
    return '';
}

function displayData() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);
    const pageData = filteredData.slice(startIndex, endIndex);
    
    for (const item of pageData) {
        const row = createTableRow(item);
        tableBody.appendChild(row);
    }
    
    updatePagination();
}

function createTableRow(data) {
    const row = document.createElement('tr');
    
    row.innerHTML = `<td style="font-family: var(--font-display); letter-spacing: 1px;">${data.period}</td>`;
    
    row.innerHTML += `<td>${formatDate(data.date)}</td>`;
    
    const frontBalls = data.frontNumbers.map(num => 
        `<span class="number-ball ${getNumberClass(num)}">${formatNumber(num)}</span>`
    ).join('');
    row.innerHTML += `<td><div class="number-cell">${frontBalls}</div></td>`;
    
    const backBalls = data.backNumbers.map(num => 
        `<span class="number-ball back ${getNumberClass(num, true)}">${formatNumber(num)}</span>`
    ).join('');
    row.innerHTML += `<td><div class="number-cell">${backBalls}</div></td>`;
    
    const propertyHtml = Object.entries(data.numberProperties).map(([key, numbers]) => {
        const config = numberProperties[key];
        return `<span class="hud-badge" style="border-color: var(--element-${key}); color: var(--element-${key});">${config.element}${numbers.length}</span>`;
    }).join(' ');
    row.innerHTML += `<td class="attr-cell">${propertyHtml}</td>`;
    
    row.innerHTML += `<td class="attr-cell">${data.oddEven}</td>`;
    row.innerHTML += `<td class="attr-cell">${data.primeComposite}</td>`;
    row.innerHTML += `<td class="attr-cell">${data.sum}</td>`;
    row.innerHTML += `<td class="attr-cell">${data.range}</td>`;
    
    return row;
}

function formatNumber(num) {
    return num < 10 ? `0${num}` : num.toString();
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '«';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayData();
        }
    });
    pagination.appendChild(prevBtn);
    
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            displayData();
        });
        pagination.appendChild(pageBtn);
    }
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '»';
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayData();
        }
    });
    pagination.appendChild(nextBtn);
}

function updateStatistics() {
    updateTotalCount();
    
    if (filteredData.length === 0) {
        document.getElementById('statOddEven').textContent = '--';
        document.getElementById('statPrime').textContent = '--';
        document.getElementById('statSum').textContent = '--';
        document.getElementById('statSpan').textContent = '--';
        return;
    }
    
    let totalOdd = 0, totalEven = 0;
    let totalPrime = 0, totalComposite = 0;
    let totalSum = 0, totalRange = 0;
    
    for (const item of filteredData) {
        const [odd, even] = item.oddEven.split(':').map(n => parseInt(n));
        totalOdd += odd;
        totalEven += even;
        
        const [prime, composite] = item.primeComposite.split(':').map(n => parseInt(n));
        totalPrime += prime;
        totalComposite += composite;
        
        totalSum += item.sum;
        totalRange += item.range;
    }
    
    const avgOdd = (totalOdd / filteredData.length).toFixed(1);
    const avgEven = (totalEven / filteredData.length).toFixed(1);
    document.getElementById('statOddEven').textContent = `${avgOdd}:${avgEven}`;
    
    const avgPrime = (totalPrime / filteredData.length).toFixed(1);
    const avgComposite = (totalComposite / filteredData.length).toFixed(1);
    document.getElementById('statPrime').textContent = `${avgPrime}:${avgComposite}`;
    
    document.getElementById('statSum').textContent = Math.round(totalSum / filteredData.length);
    document.getElementById('statSpan').textContent = Math.round(totalRange / filteredData.length);
}

function updateTotalCount() {
    document.getElementById('totalCount').textContent = filteredData.length;
}

function filterData() {
    const periodStart = document.getElementById('periodStart').value.trim();
    const periodEnd = document.getElementById('periodEnd').value.trim();
    const filterNumber = document.getElementById('filterNumber').value.trim();
    
    filteredData = [...allData];
    
    if (periodStart) {
        filteredData = filteredData.filter(item => parseInt(item.period) >= parseInt(periodStart));
    }
    
    if (periodEnd) {
        filteredData = filteredData.filter(item => parseInt(item.period) <= parseInt(periodEnd));
    }
    
    if (filterNumber) {
        const num = parseInt(filterNumber);
        if (num >= 1 && num <= 35) {
            filteredData = filteredData.filter(item => 
                item.frontNumbers.includes(num)
            );
        } else if (num >= 1 && num <= 12) {
            filteredData = filteredData.filter(item => 
                item.backNumbers.includes(num)
            );
        }
    }
    
    currentPage = 1;
    displayData();
    updateStatistics();
    
    if (filteredData.length === 0) {
        showHudNotification('没有符合条件的数据');
    } else {
        showHudNotification(`筛选完成 · 共 ${filteredData.length} 条记录`);
    }
}

function resetFilter() {
    document.getElementById('periodStart').value = '';
    document.getElementById('periodEnd').value = '';
    document.getElementById('filterNumber').value = '';
    
    filteredData = [...allData];
    currentPage = 1;
    
    displayData();
    updateStatistics();
    showHudNotification('筛选已重置');
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

function showUpdateModal() {
    document.getElementById('updateModal').classList.add('show');
    document.getElementById('updateStatus').textContent = '准备更新最新开奖数据...';
    document.getElementById('progressBar').style.display = 'none';
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('updateResult').innerHTML = '';
}

function hideUpdateModal() {
    document.getElementById('updateModal').classList.remove('show');
}

async function confirmUpdate() {
    const confirmButton = document.getElementById('confirmUpdate');
    const progressFill = document.getElementById('progressFill');
    const updateResult = document.getElementById('updateResult');

    confirmButton.disabled = true;
    document.getElementById('updateStatus').textContent = '正在同步最新开奖数据...';
    document.getElementById('progressBar').style.display = 'block';
    updateResult.innerHTML = '';

    let progress = 0;
    const progressInterval = setInterval(() => {
        progress = Math.min(progress + 8, 92);
        progressFill.style.width = `${progress}%`;
    }, 120);

    try {
        const result = await autoUpdateData();
        clearInterval(progressInterval);
        progressFill.style.width = '100%';
        document.getElementById('updateStatus').textContent = '同步完成';
        updateResult.innerHTML = `
            <div style="color: var(--text-secondary); margin-top: 15px; font-size: 0.85rem; line-height: 1.8;">
                <p style="color: var(--status-success); margin-bottom: 10px;">◇ 数据已同步</p>
                <p>${result.message || '最新开奖数据已加载到当前页面'}</p>
            </div>
        `;
        showHudNotification('数据同步完成');
    } catch (error) {
        clearInterval(progressInterval);
        progressFill.style.width = '100%';
        document.getElementById('updateStatus').textContent = '同步失败';
        updateResult.innerHTML = `
            <div style="color: var(--text-secondary); margin-top: 15px; font-size: 0.85rem; line-height: 1.8;">
                <p style="color: var(--status-danger, #ff6b6b); margin-bottom: 10px;">◇ 更新失败</p>
                <p>${error.message}</p>
            </div>
        `;
        showHudNotification('数据同步失败', 'error');
    } finally {
        confirmButton.disabled = false;
    }
}

function startClock() {
    function updateTime() {
        const now = new Date();
        const timeStr = now.toTimeString().slice(0, 8);
        document.getElementById('currentTime').textContent = timeStr;
    }
    updateTime();
    setInterval(updateTime, 1000);
}

function bindEvents() {
    document.getElementById('filterButton').addEventListener('click', filterData);
    document.getElementById('resetFilter').addEventListener('click', resetFilter);
    document.getElementById('updateDataBtn').addEventListener('click', showUpdateModal);
    document.getElementById('closeModal').addEventListener('click', hideUpdateModal);
    document.getElementById('cancelUpdate').addEventListener('click', hideUpdateModal);
    document.getElementById('confirmUpdate').addEventListener('click', confirmUpdate);
    
    document.getElementById('periodStart').addEventListener('keypress', e => {
        if (e.key === 'Enter') filterData();
    });
    document.getElementById('periodEnd').addEventListener('keypress', e => {
        if (e.key === 'Enter') filterData();
    });
    document.getElementById('filterNumber').addEventListener('keypress', e => {
        if (e.key === 'Enter') filterData();
    });
    
    document.getElementById('updateModal').addEventListener('click', e => {
        if (e.target.id === 'updateModal') hideUpdateModal();
    });
    
    const chartPeriodsSelect = document.getElementById('chartPeriods');
    if (chartPeriodsSelect) {
        chartPeriodsSelect.addEventListener('change', () => {
            updateElementChart();
        });
    }
}

function initElementChart() {
    const ctx = document.getElementById('elementChart');
    if (!ctx) return;
    
    elementChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(8, 18, 35, 0.95)',
                    titleColor: '#00d4ff',
                    bodyColor: '#e0f4ff',
                    borderColor: 'rgba(0, 212, 255, 0.5)',
                    borderWidth: 1,
                    titleFont: {
                        family: "'Orbitron', monospace",
                        size: 11
                    },
                    bodyFont: {
                        family: "'Rajdhani', sans-serif",
                        size: 12
                    },
                    callbacks: {
                        title: function(context) {
                            return `第 ${context[0].raw.period} 期`;
                        },
                        label: function(context) {
                            const element = context.dataset.elementName;
                            return `${element}: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: '期数',
                        color: '#8ab4c8',
                        font: {
                            family: "'Orbitron', monospace",
                            size: 11
                        }
                    },
                    ticks: {
                        color: '#5a7a8a',
                        font: {
                            family: "'Rajdhani', sans-serif",
                            size: 10
                        },
                        stepSize: 2,
                        callback: function(value) {
                            const labels = this.chart.data.periodLabels || [];
                            const index = Math.round(value);
                            if (index >= 0 && index < labels.length && index % 2 === 0) {
                                return labels[index];
                            }
                            return '';
                        }
                    },
                    grid: {
                        color: 'rgba(0, 212, 255, 0.1)',
                        drawOnChartArea: true
                    }
                },
                y: {
                    min: 0,
                    max: 36,
                    title: {
                        display: true,
                        text: '号码',
                        color: '#8ab4c8',
                        font: {
                            family: "'Orbitron', monospace",
                            size: 11
                        }
                    },
                    ticks: {
                        color: '#5a7a8a',
                        font: {
                            family: "'Rajdhani', sans-serif",
                            size: 10
                        },
                        stepSize: 7,
                        autoSkip: false,
                        callback: function(value) {
                            if (value === 0) return '0';
                            if (value === 7) return '7';
                            if (value === 14) return '14';
                            if (value === 21) return '21';
                            if (value === 28) return '28';
                            if (value === 35) return '35';
                            return '';
                        }
                    },
                    afterBuildTicks: function(scale) {
                        scale.ticks = [
                            { value: 0, label: '0' },
                            { value: 3.5, label: '水' },
                            { value: 7, label: '7' },
                            { value: 10.5, label: '金' },
                            { value: 14, label: '14' },
                            { value: 17.5, label: '火' },
                            { value: 21, label: '21' },
                            { value: 24.5, label: '土' },
                            { value: 28, label: '28' },
                            { value: 31.5, label: '木' },
                            { value: 35, label: '35' }
                        ];
                        return scale.ticks;
                    },
                    grid: {
                        color: function(context) {
                            if (context.tick.value === 7) return 'rgba(30, 136, 229, 0.4)';
                            if (context.tick.value === 14) return 'rgba(120, 144, 156, 0.4)';
                            if (context.tick.value === 21) return 'rgba(239, 83, 80, 0.4)';
                            if (context.tick.value === 28) return 'rgba(255, 152, 0, 0.4)';
                            if (context.tick.value === 35) return 'rgba(76, 175, 80, 0.4)';
                            return 'rgba(0, 212, 255, 0.05)';
                        },
                        lineWidth: function(context) {
                            if ([7, 14, 21, 28, 35].includes(context.tick.value)) return 2;
                            return 1;
                        }
                    }
                }
            }
        }
    });
    
    updateElementChart();
}

function updateElementChart() {
    if (!elementChart || !allData.length) return;
    
    let periodCount = parseInt(document.getElementById('chartPeriods')?.value || 100);
    const chartData = periodCount === 0 ? [...allData].reverse() : allData.slice(0, periodCount).reverse();
    periodCount = chartData.length;
    
    const datasets = Object.keys(numberProperties).map(element => ({
        label: numberProperties[element].element,
        elementName: numberProperties[element].element,
        data: [],
        backgroundColor: elementColors[element],
        borderColor: elementColors[element].replace('0.75', '1'),
        pointRadius: 1.5,
        pointHoverRadius: 3,
        pointStyle: 'circle'
    }));
    
    const periodLabels = [];
    chartData.forEach((item, index) => {
        periodLabels.push(item.period);
        item.frontNumbers.forEach(num => {
            let elementKey = 'water';
            if (num >= 8 && num <= 14) elementKey = 'metal';
            else if (num >= 15 && num <= 21) elementKey = 'fire';
            else if (num >= 22 && num <= 28) elementKey = 'earth';
            else if (num >= 29 && num <= 35) elementKey = 'wood';
            
            const datasetIndex = Object.keys(numberProperties).indexOf(elementKey);
            if (datasetIndex >= 0) {
                datasets[datasetIndex].data.push({
                    x: index,
                    y: num,
                    raw: { period: item.period }
                });
            }
        });
    });
    
    elementChart.data.datasets = datasets;
    elementChart.data.periodLabels = periodLabels;
    elementChart.options.scales.x.min = -0.5;
    elementChart.options.scales.x.max = periodCount - 0.5;
    elementChart.update();
}
