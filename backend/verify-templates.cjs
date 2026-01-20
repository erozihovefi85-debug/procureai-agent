const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/procureai')
  .then(async () => {
    const ProcurementCategory = mongoose.model('ProcurementCategory', new mongoose.Schema({}, { strict: false }));

    // Check specific categories
    const testCategories = ['软件开发', '硬件采购', '咨询服务', '地毯', '办公设备', '猎头服务', '会议室', '差旅'];

    console.log('验证不同品类的专属模板字段:\n');
    for (const name of testCategories) {
      const cat = await ProcurementCategory.findOne({ name: new RegExp(name, 'i') });
      if (cat) {
        console.log(`${cat.name} (${cat.templateConfig?.columns?.length || 0} 字段):`);
        if (cat.templateConfig?.columns) {
          cat.templateConfig.columns.slice(0, 5).forEach(col => {
            console.log(`  - ${col.label} (${col.type})`);
          });
          if (cat.templateConfig.columns.length > 5) {
            console.log(`  ... 还有 ${cat.templateConfig.columns.length - 5} 个字段`);
          }
        }
        console.log('');
      }
    }

    await mongoose.connection.close();
  })
  .catch(err => console.error('Error:', err));
