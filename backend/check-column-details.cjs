const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/procureai')
  .then(async () => {
    const ProcurementCategory = mongoose.model('ProcurementCategory', new mongoose.Schema({}, { strict: false }));

    // Check different categories to see their column configurations
    const categories = await ProcurementCategory.find({}).lean();

    // Group by column count
    const byColCount = {};
    categories.forEach(cat => {
      const count = cat.templateConfig?.columns?.length || 0;
      if (!byColCount[count]) byColCount[count] = [];
      byColCount[count].push(cat.name);
    });

    console.log('Categories grouped by column count:');
    Object.keys(byColCount).sort((a, b) => b - a).forEach(count => {
      console.log(`\n${count} columns (${byColCount[count].length} categories):`);
      byColCount[count].slice(0, 5).forEach(name => console.log('  -', name));
      if (byColCount[count].length > 5) {
        console.log('  ... and', byColCount[count].length - 5, 'more');
      }
    });

    // Show detailed column config for a few different categories
    console.log('\n\nDetailed column configs:');
    const sampleCategories = ['软件开发', '硬件采购', '咨询服务', '地毯', '办公室装修'];
    for (const name of sampleCategories) {
      const cat = categories.find(c => c.name === name);
      if (cat) {
        console.log(`\n${cat.name} (${cat.code}):`);
        if (cat.templateConfig?.columns) {
          cat.templateConfig.columns.forEach(col => {
            console.log(`  - ${col.label} (${col.type})`);
          });
        } else {
          console.log('  No template config');
        }
      }
    }

    await mongoose.connection.close();
  })
  .catch(err => console.error('Error:', err));
