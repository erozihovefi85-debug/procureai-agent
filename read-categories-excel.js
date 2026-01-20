const XLSX = require('xlsx');
const fs = require('fs');

// 读取Excel文件
const workbook = XLSX.readFile('./【品类及品类对应模式】.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// 转换为JSON
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('Excel数据:');
console.log('总行数:', data.length);
console.log('表头:', data[0]);

// 显示前20行数据
console.log('\n前20行数据:');
data.slice(0, 20).forEach((row, index) => {
  console.log(`行${index}:`, row);
});

// 保存为JSON文件供后续使用
const jsonData = JSON.stringify(data, null, 2);
fs.writeFileSync('./categories-data.json', jsonData, 'utf-8');
console.log('\n数据已保存到 categories-data.json');