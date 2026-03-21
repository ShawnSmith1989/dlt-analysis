// 完整分析最近30期金属性号码出现情况
const fs = require('fs');
const data = fs.readFileSync('data.js', 'utf8');
const lotteryData = eval(data);

// 定义金属性号码范围（08-14）
const metalNumbers = [8, 9, 10, 11, 12, 13, 14];

// 获取最近30期数据（约一个月）
const recentData = lotteryData.slice(0, 30);

console.log('最近30期开奖数据及金属性号码分析:');
console.log('==========================================');

let threeMetalCount = 0;
let totalMetalCount = 0;
const metalFrequency = {};
metalNumbers.forEach(num => {
  metalFrequency[num] = 0;
});

recentData.forEach(item => {
  // 计算金属性号码数量
  const metalCount = item.frontNumbers.filter(num => metalNumbers.includes(num)).length;
  
  // 找出金属性号码
  const metalNumbersInDraw = item.frontNumbers.filter(num => metalNumbers.includes(num));
  
  totalMetalCount += metalCount;
  
  // 统计每个号码出现频率
  metalNumbersInDraw.forEach(num => {
    metalFrequency[num]++;
  });
  
  console.log(`期号: ${item.period} (${item.date}) - 金属性号码数量: ${metalCount}/5`);
  console.log(`前区号码: ${item.frontNumbers.join(', ')}`);
  
  if (metalCount > 0) {
    console.log(`金属性号码: ${metalNumbersInDraw.join(', ')}`);
  }
  
  // 如果金属性号码数量为3个或以上，特别标记
  if (metalCount >= 3) {
    console.log('⚠️  此期金属性号码出现频率较高！');
    threeMetalCount++;
  }
  
  console.log('------------------------------------------');
});

console.log(`\n最近30期金属性号码出现频率统计:`);
console.log('==========================================');

// 按频率排序
const sortedFrequency = Object.entries(metalFrequency)
  .sort((a, b) => b[1] - a[1]);

sortedFrequency.forEach(([num, count]) => {
  if (count > 0) {
    console.log(`号码 ${num}: 出现 ${count} 次`);
  }
});

console.log(`\n总计: 最近30期共出现 ${totalMetalCount} 个金属性号码`);
console.log(`平均每期: ${(totalMetalCount / 30).toFixed(1)} 个金属性号码`);
console.log(`理论平均每期: ${(7 * 5 / 35).toFixed(1)} 个金属性号码 (7个金属性号码占35个号码的20%，前区5个号码)`);
console.log(`出现3个及以上金属性号码的期数: ${threeMetalCount}/30 期 (${(threeMetalCount / 30 * 100).toFixed(1)}%)`);

// 分析历史总体趋势
const allData = lotteryData;
let allMetalCount = 0;
let allThreeMetalCount = 0;
const allMetalFrequency = {};
metalNumbers.forEach(num => {
  allMetalFrequency[num] = 0;
});

allData.forEach(item => {
  const metalCount = item.frontNumbers.filter(num => metalNumbers.includes(num)).length;
  allMetalCount += metalCount;
  
  if (metalCount >= 3) {
    allThreeMetalCount++;
  }
  
  item.frontNumbers.forEach(num => {
    if (metalNumbers.includes(num)) {
      allMetalFrequency[num]++;
    }
  });
});

console.log(`\n历史所有期数 (${allData.length}期) 金属性号码分析:`);
console.log('==========================================');
console.log(`历史平均每期: ${(allMetalCount / allData.length).toFixed(1)} 个金属性号码`);
console.log(`历史上出现3个及以上金属性号码的期数: ${allThreeMetalCount}/${allData.length} 期 (${(allThreeMetalCount / allData.length * 100).toFixed(1)}%)`);