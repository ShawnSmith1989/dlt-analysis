// 备用数据更新脚本
// 如果官方API被限制，使用备用数据源

const fs = require('fs');
const path = require('path');
const https = require('https');

// 文件路径
const dataFile = path.join(__dirname, 'data.js');
const rawDataFile = path.join(__dirname, 'dlt_all.txt');

// 备用API
const FALLBACK_API_URL = 'https://www.cjcp.com.cn/kaijiang/dlt.shtml';

// 读取现有数据
function readExistingData() {
    try {
        // 尝试读取data.js文件
        if (fs.existsSync(dataFile)) {
            const dataContent = fs.readFileSync(dataFile, 'utf8');
            // 提取lotteryData数组
            const dataMatch = dataContent.match(/const lotteryData = (\[[\s\S]*?\]);/);
            if (dataMatch && dataMatch[1]) {
                return JSON.parse(dataMatch[1]);
            }
        }
    } catch (error) {
        console.error('读取现有数据失败:', error.message);
    }
    return [];
}

// 从备用API获取数据
function fetchFallbackData() {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };
        
        const req = https.get(FALLBACK_API_URL, options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    // 尝试从HTML中提取数据
                    const numbers = extractNumbersFromHTML(data);
                    if (numbers.length > 0) {
                        resolve(numbers);
                    } else {
                        reject(new Error('未能从备用数据源中提取到有效数据'));
                    }
                } catch (error) {
                    reject(new Error('处理备用数据源失败: ' + error.message));
                }
            });
        });
        
        req.on('error', (error) => {
            reject(new Error('网络请求失败: ' + error.message));
        });
        
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('请求超时'));
        });
    });
}

// 从HTML中提取号码数据
function extractNumbersFromHTML(html) {
    // 这是一个简化的示例，实际实现需要根据具体的HTML结构来调整
    const numbers = [];
    
    // 查找包含开奖数据的HTML元素
    // 这里需要根据实际HTML结构进行调整
    const regex = /(\d{4})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{4}-\d{2}-\d{2})/g;
    
    let match;
    while ((match = regex.exec(html)) !== null) {
        const period = match[1];
        const date = match[8];
        const frontNumbers = [
            parseInt(match[2]),
            parseInt(match[3]),
            parseInt(match[4]),
            parseInt(match[5]),
            parseInt(match[6])
        ];
        const backNumbers = [
            parseInt(match[7])
        ];
        
        numbers.push({
            period,
            date,
            frontNumbers,
            backNumbers,
            rawData: `${period} ${date} ${frontNumbers.join(' ')} ${backNumbers.join(' ')}`
        });
    }
    
    return numbers;
}

// 更新数据文件
function updateDataFiles(mergedData) {
    // 更新data.js文件
    const jsContent = `// 大乐透历史数据
// 自动更新于 ${new Date().toISOString()}

const lotteryData = ${JSON.stringify(mergedData, null, 2)};

// 导出数据（不同模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = lotteryData;
} else if (typeof window !== 'undefined') {
    window.lotteryData = lotteryData;
}
`;
    
    fs.writeFileSync(dataFile, jsContent, 'utf8');
    
    // 更新dlt_all.txt文件
    const rawLines = mergedData.map(item => item.rawData || `${item.period} ${item.date} ${item.frontNumbers.join(' ')} ${item.backNumbers.join(' ')}`);
    const rawContent = rawLines.join('\n');
    fs.writeFileSync(rawDataFile, rawContent, 'utf8');
    
    console.log(`成功更新数据文件，共 ${mergedData.length} 条记录`);
}

// 主函数
async function updateLotteryData() {
    try {
        console.log('尝试使用备用数据源更新大乐透数据...');
        
        // 1. 读取现有数据
        console.log('读取现有数据...');
        const existingData = readExistingData();
        console.log(`现有数据: ${existingData.length} 条记录`);
        
        // 2. 获取最新数据
        console.log('从备用数据源获取最新数据...');
        const newData = await fetchFallbackData();
        console.log(`从备用数据源获取到 ${newData.length} 条记录`);
        
        // 3. 合并数据
        console.log('合并新旧数据...');
        const existingPeriods = new Set(existingData.map(item => item.period));
        const filteredNewData = newData.filter(item => !existingPeriods.has(item.period));
        
        if (filteredNewData.length === 0) {
            console.log('没有新数据需要更新');
            return { success: true, newCount: 0 };
        }
        
        // 合并数据（新数据在前）
        const mergedData = [...filteredNewData, ...existingData];
        
        // 按期号降序排序（最新的在前）
        mergedData.sort((a, b) => {
            const periodA = parseInt(a.period);
            const periodB = parseInt(b.period);
            return periodB - periodA;
        });
        
        // 4. 更新文件
        updateDataFiles(mergedData);
        console.log(`数据更新完成，新增 ${filteredNewData.length} 条记录`);
        
        return { success: true, newCount: filteredNewData.length };
    } catch (error) {
        console.error('更新数据失败:', error.message);
        return { success: false, error: error.message };
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    updateLotteryData()
        .then(result => {
            if (result.success) {
                console.log('数据更新成功!');
            } else {
                console.error('数据更新失败:', result.error);
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('发生未预期的错误:', error);
            process.exit(1);
        });
}

// 导出函数以供其他模块使用
module.exports = { updateLotteryData, fetchFallbackData };