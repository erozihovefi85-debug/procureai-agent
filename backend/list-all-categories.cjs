const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// 读取Excel文件
const excelPath = path.resolve(__dirname, '../【品类及品类对应模式】.xlsx');
const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// 转换为JSON
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('所有品类列表 (219个):');
console.log('======================');

const categories = [];
data.slice(1).forEach((row, index) => {
  if (row[2]) { // 三级品类
    categories.push({
      一级品类: row[0],
      二级品类: row[1],
      三级品类: row[2],
      完整路径: `${row[0]} > ${row[1]} > ${row[2]}`
    });
  }
});

categories.forEach((cat, idx) => {
  console.log(`${idx + 1}. ${cat.三级品类} (${cat.二级品类} / ${cat.一级品类})`);
});

console.log(`\n总计: ${categories.length} 个品类`);

// 保存为JSON供后续使用
const outputPath = path.resolve(__dirname, '../all-categories.json');
fs.writeFileSync(outputPath, JSON.stringify(categories, null, 2), 'utf-8');
console.log(`\n已保存到: ${outputPath}`);
