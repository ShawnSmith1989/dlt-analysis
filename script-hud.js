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

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    await autoUpdateData();
    loadLocalData();
    bindEvents();
    displayData();
    updateStatistics();
    initElementChart();
    startClock();
}

async function autoUpdateData() {
    try {
        const response = await fetch('/update_data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update' })
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                console.log('自动更新成功:', result.message);
                await reloadScript('data.js');
            }
        }
    } catch (error) {
        console.warn('自动更新数据时出错:', error.message);
    }
}

async function reloadScript(src) {
    const oldScript = document.querySelector(`script[src*="${src}"]`);
    if (oldScript) oldScript.remove();
    
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = `${src}?t=${Date.now()}`;
        script.onload = () => resolve();
        script.onerror = () => resolve();
        document.body.appendChild(script);
    });
}

function loadLocalData() {
    if (typeof lotteryData !== 'undefined' && lotteryData.length > 0) {
        allData = lotteryData.map(item => {
            const analysis = analyzeNumbers(item.frontNumbers, item.backNumbers);
            return { ...item, ...analysis };
        });
        
        allData.sort((a, b) => new Date(b.date) - new Date(a.date));
        filteredData = [...allData];
        
        updateTotalCount();
    } else {
        showHudNotification('数据加载失败，请刷新页面重试');
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
    document.getElementById('confirmUpdate').disabled = true;
    document.getElementById('updateStatus').textContent = '正在连接服务器...';
    document.getElementById('progressBar').style.display = 'block';
    
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress = Math.min(progress + 5, 90);
        document.getElementById('progressFill').style.width = `${progress}%`;
    }, 100);
    
    setTimeout(() => {
        clearInterval(progressInterval);
        document.getElementById('progressFill').style.width = '100%';
        
        document.getElementById('updateResult').innerHTML = `
            <div style="color: var(--text-secondary); margin-top: 15px; font-size: 0.85rem; line-height: 1.8;">
                <p style="color: var(--status-warning); margin-bottom: 10px;">◇ 浏览器环境限制</p>
                <p>请在命令行执行以下命令更新数据：</p>
                <code style="display: block; background: var(--bg-card); padding: 10px; margin: 10px 0; border: var(--border-subtle); font-family: var(--font-display); font-size: 0.8rem;">
                    node update_data.js
                </code>
            </div>
        `;
        
        document.getElementById('confirmUpdate').disabled = false;
    }, 1500);
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
                        callback: function(value) {
                            const periods = this.chart.data.datasets[0]?.data || [];
                            const item = periods.find(d => d.x === value);
                            return item ? item.raw.period : '';
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
    
    chartData.forEach((item, index) => {
        item.frontNumbers.forEach(num => {
            let elementKey = 'water';
            if (num >= 8 && num <= 14) elementKey = 'metal';
            else if (num >= 15 && num <= 21) elementKey = 'fire';
            else if (num >= 22 && num <= 28) elementKey = 'earth';
            else if (num >= 29 && num <= 35) elementKey = 'wood';
            
            const datasetIndex = Object.keys(numberProperties).indexOf(elementKey);
            if (datasetIndex >= 0) {
                datasets[datasetIndex].data.push({
                    x: index + 1,
                    y: num,
                    raw: { period: item.period }
                });
            }
        });
    });
    
    elementChart.data.datasets = datasets;
    elementChart.options.scales.x.min = 0;
    elementChart.options.scales.x.max = periodCount + 1;
    elementChart.update();
}
