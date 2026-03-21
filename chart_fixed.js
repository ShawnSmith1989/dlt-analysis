// 复制chart.js的内容到新文件

// 显示通知函数
function showNotification(message, type = 'info') {
    console.log(`Notification (${type}): ${message}`);
    
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3`;
    notification.style.zIndex = '9999';
    notification.style.minWidth = '300px';
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 添加进入动画
    notification.style.opacity = '0';
    notification.style.transform = 'translate(-50%, -20px)';
    notification.style.transition = 'opacity 0.3s, transform 0.3s';
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translate(-50%, 0)';
    }, 10);
    
    // 3秒后移除
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translate(-50%, -20px)';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 大乐透号码五行属性定义
const elementAttributes = {
    1: '水', 2: '水', 3: '水', 4: '水', 5: '水', 6: '水', 7: '水',   // 1-7: 水
    8: '金', 9: '金', 10: '金', 11: '金', 12: '金', 13: '金', 14: '金', // 8-14: 金
    15: '火', 16: '火', 17: '火', 18: '火', 19: '火', 20: '火', 21: '火', // 15-21: 火
    22: '土', 23: '土', 24: '土', 25: '土', 26: '土', 27: '土', 28: '土', // 22-28: 土
    29: '木', 30: '木', 31: '木', 32: '木', 33: '木', 34: '木', 35: '木'  // 29-35: 木
};

// 颜色配置
const elementColors = {
    '木': '#2ecc71', // 绿色
    '水': '#3498db', // 蓝色
    '金': '#2c3e50', // 黑色
    '土': '#f39c12', // 黄色
    '火': '#e74c3c'  // 红色
};

// 图表实例
let distributionChart = null;

// 当前显示的数据
let currentData = [];
let currentPage = 1;
const itemsPerPage = 15;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM已加载');
    
    // 检查数据是否已加载
    if (typeof lotteryData === 'undefined') {
        console.error('数据未加载，请检查data.js文件');
        showNotification('数据加载失败，请刷新页面重试', 'error');
        return;
    }
    
    console.log('数据已加载，记录数:', lotteryData.length);
    
    // 确保Chart库已加载
    const checkChart = setInterval(function() {
        if (typeof Chart !== 'undefined') {
            clearInterval(checkChart);
            console.log('Chart库已加载，开始初始化...');
            
            initializeChart();
            loadTableData();
            attachEventListeners();
            console.log('图表初始化完成');
        } else {
            console.log('等待Chart库加载...');
        }
    }, 100);
    
    // 超时检查
    setTimeout(function() {
        if (typeof Chart === 'undefined') {
            clearInterval(checkChart);
            console.error('Chart库加载超时');
            showNotification('图表库加载失败，请检查网络连接', 'error');
        }
    }, 10000); // 10秒超时
});

// 初始化图表
function initializeChart() {
    const ctx = document.getElementById('distributionChart').getContext('2d');
    
    // 获取期数设置
    const periodCount = parseInt(document.getElementById('periodCount').value);
    
    // 准备数据
    const chartData = prepareChartData(periodCount);
    
    // 创建图表
    distributionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [
                {
                    label: '蓝色(水)',
                    data: chartData.datasets.water,
                    borderColor: elementColors['水'],
                    backgroundColor: elementColors['水'] + '20',
                    fill: false,
                    tension: 0.3
                },
                {
                    label: '黑色(金)',
                    data: chartData.datasets.metal,
                    borderColor: elementColors['金'],
                    backgroundColor: elementColors['金'] + '20',
                    fill: false,
                    tension: 0.3
                },
                {
                    label: '红色(火)',
                    data: chartData.datasets.fire,
                    borderColor: elementColors['火'],
                    backgroundColor: elementColors['火'] + '20',
                    fill: false,
                    tension: 0.3
                },
                {
                    label: '黄色(土)',
                    data: chartData.datasets.earth,
                    borderColor: elementColors['土'],
                    backgroundColor: elementColors['土'] + '20',
                    fill: false,
                    tension: 0.3
                },
                {
                    label: '绿色(木)',
                    data: chartData.datasets.wood,
                    borderColor: elementColors['木'],
                    backgroundColor: elementColors['木'] + '20',
                    fill: false,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '大乐透号码属性分布趋势'
                },
                legend: {
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: '期号'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: '出现次数'
                    },
                    min: 0,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
    
    // 更新统计信息
    updateStatistics(chartData);
}

// 准备图表数据
function prepareChartData(periodCount) {
    // 获取数据
    let data = [...lotteryData];
    
    // 如果指定了期数，则筛选数据
    if (periodCount > 0 && periodCount < data.length) {
        data = data.slice(0, periodCount);
    }
    
    // 反转数组，使最新的数据在前面
    data = data.reverse();
    
    // 准备数据
    const labels = [];
    const datasets = {
        water: [],
        metal: [],
        fire: [],
        earth: [],
        wood: []
    };
    
    // 遍历每一期数据
    data.forEach(item => {
        // 添加标签
        labels.push(item.period);
        
        // 初始化计数器
        const counts = {
            '木': 0,
            '水': 0,
            '金': 0,
            '土': 0,
            '火': 0
        };
        
        // 计算前区号码的属性
        item.frontNumbers.forEach(num => {
            const element = elementAttributes[num];
            counts[element]++;
        });
        
        // 添加到数据集
        datasets.water.push(counts['水']);
        datasets.metal.push(counts['金']);
        datasets.fire.push(counts['火']);
        datasets.earth.push(counts['土']);
        datasets.wood.push(counts['木']);
    });
    
    return {
        labels,
        datasets
    };
}

// 更新统计信息
function updateStatistics(chartData) {
    const totalPeriods = chartData.labels.length;
    
    // 计算平均值
    const avgWater = (chartData.datasets.water.reduce((a, b) => a + b, 0) / totalPeriods).toFixed(2);
    const avgMetal = (chartData.datasets.metal.reduce((a, b) => a + b, 0) / totalPeriods).toFixed(2);
    const avgFire = (chartData.datasets.fire.reduce((a, b) => a + b, 0) / totalPeriods).toFixed(2);
    const avgEarth = (chartData.datasets.earth.reduce((a, b) => a + b, 0) / totalPeriods).toFixed(2);
    const avgWood = (chartData.datasets.wood.reduce((a, b) => a + b, 0) / totalPeriods).toFixed(2);
    
    // 更新DOM
    document.getElementById('totalPeriods').textContent = totalPeriods;
    document.getElementById('blueAvg').textContent = avgWater;
    document.getElementById('blackAvg').textContent = avgMetal;
    document.getElementById('redAvg').textContent = avgFire;
    document.getElementById('yellowAvg').textContent = avgEarth;
    document.getElementById('greenAvg').textContent = avgWood;
}

// 加载表格数据
function loadTableData() {
    // 获取期数设置
    const periodCount = parseInt(document.getElementById('periodCount').value);
    
    // 获取数据
    let data = [...lotteryData];
    
    // 如果指定了期数，则筛选数据
    if (periodCount > 0 && periodCount < data.length) {
        data = data.slice(0, periodCount);
    }
    
    // 保存当前数据
    currentData = data;
    
    // 重置页码
    currentPage = 1;
    
    // 渲染表格
    renderTable();
    
    // 渲染分页
    renderPagination();
}

// 渲染表格
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    
    // 清空表格
    tableBody.innerHTML = '';
    
    // 计算分页范围
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, currentData.length);
    
    // 渲染当前页的数据
    for (let i = startIndex; i < endIndex; i++) {
        const item = currentData[i];
        const row = createTableRow(item);
        tableBody.appendChild(row);
    }
}

// 创建表格行
function createTableRow(item) {
    const row = document.createElement('tr');
    
    // 期号
    const periodCell = document.createElement('td');
    periodCell.textContent = item.period;
    row.appendChild(periodCell);
    
    // 开奖日期
    const dateCell = document.createElement('td');
    dateCell.textContent = item.date;
    row.appendChild(dateCell);
    
    // 前区号码
    const frontAreaCell = document.createElement('td');
    item.frontNumbers.forEach(num => {
        const ball = document.createElement('span');
        ball.className = 'result-ball';
        ball.style.backgroundColor = elementColors[elementAttributes[num]];
        ball.textContent = num;
        frontAreaCell.appendChild(ball);
    });
    row.appendChild(frontAreaCell);
    
    // 后区号码
    const backAreaCell = document.createElement('td');
    item.backNumbers.forEach(num => {
        const ball = document.createElement('span');
        ball.className = 'result-ball';
        ball.style.backgroundColor = '#95a5a6';
        ball.textContent = num;
        backAreaCell.appendChild(ball);
    });
    row.appendChild(backAreaCell);
    
    // 号码属性
    const attributeCell = document.createElement('td');
    const attributes = [];
    const counts = { '木': 0, '水': 0, '金': 0, '土': 0, '火': 0 };
    
    item.frontNumbers.forEach(num => {
        const element = elementAttributes[num];
        counts[element]++;
    });
    
    for (const [element, count] of Object.entries(counts)) {
        if (count > 0) {
            const badge = document.createElement('span');
            badge.className = 'element-badge';
            badge.style.backgroundColor = elementColors[element];
            attributeCell.appendChild(badge);
            attributeCell.appendChild(document.createTextNode(element + count + ' '));
        }
    }
    row.appendChild(attributeCell);
    
    // 奇偶比
    const oddEvenCell = document.createElement('td');
    let oddCount = 0;
    let evenCount = 0;
    item.frontNumbers.forEach(num => {
        if (num % 2 === 0) {
            evenCount++;
        } else {
            oddCount++;
        }
    });
    oddEvenCell.textContent = `${oddCount}:${evenCount}`;
    row.appendChild(oddEvenCell);
    
    // 质合比
    const primeCompositeCell = document.createElement('td');
    let primeCount = 0;
    let compositeCount = 0;
    item.frontNumbers.forEach(num => {
        if (isPrime(num)) {
            primeCount++;
        } else {
            compositeCount++;
        }
    });
    primeCompositeCell.textContent = `${primeCount}:${compositeCount}`;
    row.appendChild(primeCompositeCell);
    
    // 和值
    const sumCell = document.createElement('td');
    const sum = item.frontNumbers.reduce((a, b) => a + b, 0);
    sumCell.textContent = sum;
    row.appendChild(sumCell);
    
    // 跨度
    const spanCell = document.createElement('td');
    const sortedNumbers = [...item.frontNumbers].sort((a, b) => a - b);
    const span = sortedNumbers[4] - sortedNumbers[0];
    spanCell.textContent = span;
    row.appendChild(spanCell);
    
    return row;
}

// 判断是否为质数
function isPrime(num) {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    
    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    
    return true;
}

// 渲染分页
function renderPagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    const totalPages = Math.ceil(currentData.length / itemsPerPage);
    
    // 上一页
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    const prevLink = document.createElement('a');
    prevLink.className = 'page-link';
    prevLink.href = '#';
    prevLink.setAttribute('aria-label', 'Previous');
    prevLink.innerHTML = '<span aria-hidden="true">&laquo;</span>';
    prevLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            renderTable();
            renderPagination();
        }
    });
    prevLi.appendChild(prevLink);
    pagination.appendChild(prevLi);
    
    // 页码
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        const link = document.createElement('a');
        link.className = 'page-link';
        link.href = '#';
        link.textContent = i;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = i;
            renderTable();
            renderPagination();
        });
        li.appendChild(link);
        pagination.appendChild(li);
    }
    
    // 下一页
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    const nextLink = document.createElement('a');
    nextLink.className = 'page-link';
    nextLink.href = '#';
    nextLink.setAttribute('aria-label', 'Next');
    nextLink.innerHTML = '<span aria-hidden="true">&raquo;</span>';
    nextLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
            renderPagination();
        }
    });
    nextLi.appendChild(nextLink);
    pagination.appendChild(nextLi);
}

// 添加事件监听器
function attachEventListeners() {
    // 期数变化
    document.getElementById('periodCount').addEventListener('change', function() {
        updateChart();
        loadTableData();
    });
    
    // 图表类型变化
    document.getElementById('chartType').addEventListener('change', function() {
        updateChart();
    });
    
    // 更新按钮
    document.getElementById('updateButton').addEventListener('click', function() {
        updateChart();
        loadTableData();
    });
    
    // 更新数据按钮
    document.getElementById('updateData').addEventListener('click', function() {
        showUpdateModal();
    });
    
    // 确认更新按钮
    document.getElementById('confirmUpdate').addEventListener('click', function() {
        startDataUpdate();
    });
}

// 更新图表
function updateChart() {
    // 获取期数设置
    const periodCount = parseInt(document.getElementById('periodCount').value);
    
    // 准备数据
    const chartData = prepareChartData(periodCount);
    
    // 更新图表
    distributionChart.data.labels = chartData.labels;
    distributionChart.data.datasets[0].data = chartData.datasets.water;
    distributionChart.data.datasets[1].data = chartData.datasets.metal;
    distributionChart.data.datasets[2].data = chartData.datasets.fire;
    distributionChart.data.datasets[3].data = chartData.datasets.earth;
    distributionChart.data.datasets[4].data = chartData.datasets.wood;
    
    // 获取图表类型
    const chartType = document.getElementById('chartType').value;
    distributionChart.config.type = chartType;
    
    // 更新图表
    distributionChart.update();
    
    // 更新统计信息
    updateStatistics(chartData);
}

// 显示更新数据模态框
function showUpdateModal() {
    const modal = new bootstrap.Modal(document.getElementById('updateModal'));
    modal.show();
    
    // 重置状态
    document.getElementById('updateStatus').textContent = '准备更新最新开奖数据...';
    document.getElementById('updateResult').innerHTML = '';
    document.getElementById('updateProgressContainer').style.display = 'none';
    document.getElementById('confirmUpdate').disabled = false;
}

// 开始数据更新
function startDataUpdate() {
    // 禁用按钮
    document.getElementById('confirmUpdate').disabled = true;
    
    // 显示进度条
    document.getElementById('updateProgressContainer').style.display = 'block';
    
    // 模拟进度
    let progress = 0;
    const progressBar = document.getElementById('updateProgress');
    const progressInterval = setInterval(() => {
        progress = Math.min(progress + 10, 90);
        progressBar.style.width = `${progress}%`;
        progressBar.textContent = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
    }, 100);
    
    // 模拟检测过程
    setTimeout(() => {
        // 停止进度条
        clearInterval(progressInterval);
        progressBar.style.width = '100%';
        progressBar.textContent = '100%';
        progressBar.setAttribute('aria-valuenow', 100);
        
        // 显示提示信息
        document.getElementById('updateResult').innerHTML = `
            <div class="alert alert-info">
                <h6><i class="bi bi-info-circle-fill"></i> 浏览器安全限制</h6>
                <p class="mb-2">由于浏览器的CORS安全策略，无法直接从网页更新数据。</p>
                <p class="mb-2">请按照以下步骤手动更新数据：</p>
                <ol class="mb-0">
                    <li>打开命令提示符（按Win+R，输入cmd，回车）</li>
                    <li>输入以下命令并回车：<br><code>cd d:\\daletgou\\dlt4</code></li>
                    <li>再输入以下命令并回车：<br><code>node update_data.js</code></li>
                    <li>等待数据更新完成</li>
                    <li>刷新此页面查看最新数据</li>
                </ol>
                <div class="mt-3">
                    <button class="btn btn-primary" onclick="copyUpdateCommand()">
                        <i class="bi bi-clipboard"></i> 复制命令到剪贴板
                    </button>
                </div>
            </div>
        `;
        
        // 不自动关闭模态框，让用户阅读提示
        document.getElementById('confirmUpdate').disabled = false;
        
    }, 1000); // 1秒后显示提示
}

// 复制更新命令到剪贴板
function copyUpdateCommand() {
    const commands = [
        'cd d:\\\\daletgou\\\\dlt4',
        'node update_data.js'
    ];
    
    // 创建临时文本区域
    const textArea = document.createElement('textarea');
    textArea.value = commands.join('\r\n');
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('命令已复制到剪贴板', 'success');
        
        // 更新按钮文本
        const button = event.target.closest('button');
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="bi bi-check-circle"></i> 已复制';
        button.classList.remove('btn-primary');
        button.classList.add('btn-success');
        
        // 3秒后恢复按钮
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('btn-success');
            button.classList.add('btn-primary');
        }, 3000);
    } catch (err) {
        console.error('复制失败:', err);
        showNotification('复制失败，请手动复制命令', 'error');
    } finally {
        document.body.removeChild(textArea);
    }
}

