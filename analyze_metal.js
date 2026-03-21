// 分析最近10期金属性号码出现情况
const fs = require('fs');
const data = fs.readFileSync('data.js', 'utf8');
const lotteryData = eval(data);

// 定义金属性号码范围（08-14）
const metalNumbers = [8, 9, 10, 11, 12, 13, 14];

// 获取最近10期数据（约一个月）
const recentData = lotteryData.slice(0, 10);

console.log('最近10期开奖数据及金属性号码分析:');
console.log('==========================================');

recentData.forEach(item => {
  // 计算金属性号码数量
  const metalCount = item.frontNumbers.filter(num => metalNumbers.includes(num)).length;
  
  // 找出金属性号码
  const metalNumbersInDraw = item.frontNumbers.filter(num => metalNumbers.includes(num));
  
  console.log(`期号: ${item.period} (${item.date}) - 金属性号码数量: ${metalCount}/5`);
  console.log(`前区号码: ${item.frontNumbers.join(', ')}`);
  
  if (metalCount > 0) {
    console.log(`金属性号码: ${metalNumbersInDraw.join(', ')}`);
  }
  
  // 如果金属性号码数量为3个或以上，特别标记
  if (metalCount >= 3) {
    console.log('⚠️  此期金属性号码出现频率较高！');
  }
  
  console.log('------------------------------------------');
});