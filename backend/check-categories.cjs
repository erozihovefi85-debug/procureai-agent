const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/procureai')
  .then(async () => {
    const ProcurementCategory = mongoose.model('ProcurementCategory', new mongoose.Schema({}, { strict: false }));

    // Check a few categories
    const categories = await ProcurementCategory.find({}).limit(5).lean();
    console.log('Sample categories:');
    categories.forEach(cat => {
      const hasConfig = Boolean(cat.templateConfig);
      const colCount = cat.templateConfig?.columns?.length || 0;
      console.log('Name:', cat.name, '| Has templateConfig:', hasConfig, '| Columns count:', colCount);
      if (cat.templateConfig?.columns?.length > 0) {
        console.log('  Sample column:', cat.templateConfig.columns[0]);
      }
    });

    // Count categories with/without templateConfig
    const total = await ProcurementCategory.countDocuments();
    const withTemplate = await ProcurementCategory.countDocuments({
      'templateConfig.columns': { $exists: true, $ne: [] }
    });
    const withoutTemplate = total - withTemplate;

    console.log('\nTemplate Configuration Stats:');
    console.log('Total categories:', total);
    console.log('With template config:', withTemplate);
    console.log('Without template config:', withoutTemplate);

    // Show all category names without template config
    if (withoutTemplate > 0) {
      const without = await ProcurementCategory.find({
        $or: [
          { 'templateConfig.columns': { $exists: false } },
          { 'templateConfig.columns': { $size: 0 } }
        ]
      }).lean();
      console.log('\nCategories without template config (first 10):');
      without.slice(0, 10).forEach(cat => {
        console.log('-', cat.name, '(', cat.code, ')');
      });
      if (without.length > 10) {
        console.log('... and', without.length - 10, 'more');
      }
    }

    await mongoose.connection.close();
  })
  .catch(err => console.error('Error:', err));
