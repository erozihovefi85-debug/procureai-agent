const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// 读取Excel文件
const excelPath = path.resolve(__dirname, '../【品类及品类对应模式】.xlsx');
console.log('Reading Excel from:', excelPath);

const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// 转换为JSON
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('Excel数据:');
console.log('总行数:', data.length);
console.log('表头:', data[0]);

// 显示所有数据
console.log('\n所有数据:');
data.forEach((row, index) => {
  console.log(`行${index}:`, row);
});

// 保存为JSON文件供后续使用
const outputPath = path.resolve(__dirname, '../categories-data.json');
const jsonData = JSON.stringify(data, null, 2);
fs.writeFileSync(outputPath, jsonData, 'utf-8');
console.log('\n数据已保存到 categories-data.json');