const fs = require('fs');
const data = fs.readFileSync('data.js', 'utf8');
console.log('数据类型:', typeof data);
console.log('前100个字符:', data.substring(0, 100));

// 尝试直接解析
try {
  const lotteryData = eval(data);
  console.log('解析成功，数据类型:', typeof lotteryData);
  if (Array.isArray(lotteryData)) {
    console.log('是数组，长度:', lotteryData.length);
    console.log('第一个元素:', JSON.stringify(lotteryData[0], null, 2));
  } else if (typeof lotteryData === 'object') {
    console.log('是对象，键:', Object.keys(lotteryData));
    if (lotteryData.lotteryData) {
      console.log('lotteryData是数组，长度:', lotteryData.lotteryData.length);
      console.log('第一个元素:', JSON.stringify(lotteryData.lotteryData[0], null, 2));
    }
  }
} catch (error) {
  console.error('解析失败:', error.message);
}