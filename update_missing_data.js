// 更新缺失的大乐透数据脚本
// 专门用于获取缺失的开奖号码数据

const fs = require('fs');
const path = require('path');
const https = require('https');

// 文件路径
const dataFile = path.join(__dirname, 'data.js');
const rawDataFile = path.join(__dirname, 'dlt_all.txt');

// 获取最新数据的API - 添加时间戳和随机数以避免缓存
const timestamp = new Date().getTime();
const random = Math.floor(Math.random() * 10000);
const API_URL_BASE = 'https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry?gameNo=85&provinceId=0&pageSize=100&isVerify=1&pageNo=';

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

// 获取网络数据
async function fetchPageData(pageNo) {
    return new Promise((resolve, reject) => {
        // 添加时间戳和随机数以避免缓存
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 10000);
        const url = `${API_URL_BASE}${pageNo}&_=${timestamp}&r=${random}`;
        
        // 设置请求头，模拟浏览器请求
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Referer': 'https://www.sporttery.cn/',
                'Origin': 'https://www.sporttery.cn',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-site'
            }
        };
        
        const req = https.get(url, options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    // 检查是否返回了HTML而不是JSON
                    if (data.trim().startsWith('<!DOCTYPE') || data.trim().startsWith('<html')) {
                        console.warn(`第${pageNo}页API返回了HTML页面而不是JSON数据，可能被限制或暂时不可用`);
                        reject(new Error('API返回了HTML页面而不是JSON数据，可能被限制或暂时不可用'));
                        return;
                    }
                    
                    const response = JSON.parse(data);
                    console.log(`第${pageNo}页API响应结构:`, JSON.stringify(response, null, 2).substring(0, 500) + '...');
                    
                    // 检查多种可能的数据结构
                    if (response.success && response.data && response.data.list) {
                        resolve(response.data.list);
                    } else if (response.success && response.data && response.data.result) {
                        resolve(response.data.result);
                    } else if (response.success && response.value && response.value.list) {
                        resolve(response.value.list);
                    } else if (response.data) {
                        // 如果是直接的数组
                        if (Array.isArray(response.data)) {
                            resolve(response.data);
                        } else if (typeof response.data === 'object') {
                            // 尝试找到数组字段
                            for (const key in response.data) {
                                if (Array.isArray(response.data[key])) {
                                    resolve(response.data[key]);
                                }
                            }
                            reject(new Error('API返回数据中未找到数组字段'));
                        } else {
                            reject(new Error('API返回data字段格式不正确'));
                        }
                    } else {
                        reject(new Error('API返回数据格式不正确'));
                    }
                } catch (error) {
                    reject(new Error('解析API数据失败: ' + error.message + '\n原始数据: ' + data.substring(0, 200)));
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

// 转换API数据格式为标准格式
function convertApiData(apiData) {
    return apiData.map(item => {
        // 检查数据结构
        let lotteryDrawNum, lotteryDrawResult, lotteryDrawTime;
        
        // 尝试从不同可能的结构中提取数据
        if (item.lotteryDrawNum !== undefined) {
            lotteryDrawNum = item.lotteryDrawNum;
            lotteryDrawResult = item.lotteryDrawResult;
            lotteryDrawTime = item.lotteryDrawTime;
        } else if (item.drawNum !== undefined) {
            lotteryDrawNum = item.drawNum;
            lotteryDrawResult = item.drawResult;
            lotteryDrawTime = item.drawTime;
        } else if (item.lottery && item.lottery.lotteryDrawNum) {
            lotteryDrawNum = item.lottery.lotteryDrawNum;
            lotteryDrawResult = item.lottery.lotteryDrawResult;
            lotteryDrawTime = item.lottery.lotteryDrawTime;
        }
        
        // 从 lotteryDrawResult 字符串中提取前区和后区号码
        if (!lotteryDrawResult) {
            console.warn('未找到开奖结果字段', item);
            return null;
        }
        
        const numbers = lotteryDrawResult.split(' ');
        if (numbers.length < 7) {
            console.warn('开奖结果格式不正确', lotteryDrawResult);
            return null;
        }
        
        const frontNumbers = numbers.slice(0, 5).map(n => parseInt(n));
        const backNumbers = numbers.slice(5, 7).map(n => parseInt(n));
        
        return {
            period: lotteryDrawNum,
            date: lotteryDrawTime.split(' ')[0],
            frontNumbers,
            backNumbers,
            rawData: `${lotteryDrawNum} ${lotteryDrawTime.split(' ')[0]} ${numbers.join(' ')}`
        };
    }).filter(item => item !== null); // 过滤掉无效的项
}

// 获取所有页面的数据
async function fetchAllPagesData() {
    const allData = [];
    let pageNo = 1;
    let hasMoreData = true;
    
    while (hasMoreData && pageNo <= 50) { // 限制最多获取50页数据
        try {
            console.log(`正在获取第 ${pageNo} 页数据...`);
            const pageData = await fetchPageData(pageNo);
            
            if (pageData && pageData.length > 0) {
                const convertedData = convertApiData(pageData);
                allData.push(...convertedData);
                console.log(`第 ${pageNo} 页获取到 ${convertedData.length} 条记录`);
                pageNo++;
            } else {
                hasMoreData = false;
            }
        } catch (error) {
            console.error(`获取第 ${pageNo} 页数据失败:`, error.message);
            hasMoreData = false;
        }
    }
    
    return allData;
}

// 检查缺失的数据
function findMissingData(existingData, allData) {
    // 创建现有数据的期号集合
    const existingPeriods = new Set(existingData.map(item => item.period));
    
    // 找出缺失的数据
    const missingData = allData.filter(item => !existingPeriods.has(item.period));
    
    // 按期号排序
    missingData.sort((a, b) => {
        const periodA = parseInt(a.period);
        const periodB = parseInt(b.period);
        return periodB - periodA; // 降序，最新的在前
    });
    
    return missingData;
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
async function updateMissingLotteryData() {
    try {
        console.log('开始检查缺失的大乐透数据...');
        
        // 1. 读取现有数据
        console.log('读取现有数据...');
        const existingData = readExistingData();
        console.log(`现有数据: ${existingData.length} 条记录`);
        
        if (existingData.length > 0) {
            // 找出最新期号
            const latestPeriod = existingData[0].period;
            console.log(`最新期号: ${latestPeriod}`);
        }
        
        // 2. 获取网络所有数据
        console.log('获取网络所有数据...');
        const allData = await fetchAllPagesData();
        console.log(`从API获取到 ${allData.length} 条记录`);
        
        // 3. 检查缺失的数据
        console.log('检查缺失的数据...');
        const missingData = findMissingData(existingData, allData);
        console.log(`发现 ${missingData.length} 条缺失数据`);
        
        if (missingData.length > 0) {
            // 显示缺失的数据
            console.log('缺失的数据:');
            missingData.forEach(item => {
                console.log(`期号: ${item.period}, 日期: ${item.date}`);
            });
            
            // 合并数据（新数据在前）
            const mergedData = [...missingData, ...existingData];
            
            // 4. 更新文件
            updateDataFiles(mergedData);
            console.log(`数据更新完成，新增 ${missingData.length} 条记录`);
            
            return { success: true, newCount: missingData.length, missingData };
        } else {
            console.log('没有缺失数据需要更新');
            return { success: true, newCount: 0 };
        }
    } catch (error) {
        console.error('更新数据失败:', error.message);
        return { success: false, error: error.message };
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    updateMissingLotteryData()
        .then(result => {
            if (result.success) {
                console.log('数据检查更新成功!');
            } else {
                console.error('数据检查更新失败:', result.error);
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('发生未预期的错误:', error);
            process.exit(1);
        });
}

// 导出函数以供其他模块使用
module.exports = { updateMissingLotteryData, fetchPageData, convertApiData, findMissingData };