const { fetchLatestData, convertApiData, mergeData } = require('../update_data');

function getCurrentData() {
  const modulePath = require.resolve('../data.js');
  delete require.cache[modulePath];
  return require('../data.js');
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
}

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({
      success: false,
      message: 'Method Not Allowed'
    });
    return;
  }

  const existingData = getCurrentData();

  try {
    const apiData = await fetchLatestData();
    const latestData = convertApiData(apiData);
    const { mergedData, newCount } = mergeData(existingData, latestData);

    res.status(200).json({
      success: true,
      message: newCount > 0 ? `已同步 ${newCount} 条最新记录` : '数据已是最新',
      newCount,
      latestPeriod: mergedData[0] ? mergedData[0].period : null,
      mergedData
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      message: '实时更新失败，已加载本地数据',
      newCount: 0,
      latestPeriod: existingData[0] ? existingData[0].period : null,
      mergedData: existingData,
      fallback: true,
      error: error.message
    });
  }
};
