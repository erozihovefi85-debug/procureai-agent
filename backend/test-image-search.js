import imageSearchService from './src/services/imageSearchService.js';

console.log('=== Testing Image Search Service ===\n');

// 测试配置状态
console.log('1. Configuration Status:');
const config = imageSearchService.getConfigStatus();
console.log(JSON.stringify(config, null, 2));

// 测试服务是否已配置
console.log('\n2. Service Configured:', imageSearchService.isConfigured());

// 测试搜索功能（使用测试图片URL）
console.log('\n3. Testing search with test image...');

async function testSearch() {
  try {
    // 使用淘宝商品测试图片
    const testImageUrl = 'http://g-search3.alicdn.com/img/bao/uploaded/i4/O1CN01IDpcD81zHbpHs1YgT_!!2200811456689.jpg';
    
    console.log('Search URL:', testImageUrl);
    
    const result = await imageSearchService.searchSimilarImages(testImageUrl, 'test-user');
    
    console.log('\n4. Search Result:');
    console.log('Success:', result.success);
    console.log('Provider:', result.provider);
    console.log('Results Count:', result.results?.length);
    
    if (result.results && result.results.length > 0) {
      console.log('\n5. First 3 results:');
      result.results.slice(0, 3).forEach((item, index) => {
        console.log(`\nResult ${index + 1}:`);
        console.log('  Title:', item.title);
        console.log('  Price:', item.price);
        console.log('  Source:', item.source);
        console.log('  Match Rate:', item.match_rate);
        console.log('  Link:', item.detail_url);
      });
    } else {
      console.log('\n❌ No results found!');
      console.log('Error:', result.error);
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testSearch().then(() => {
  console.log('\n=== Test Completed ===');
  process.exit(0);
}).catch(error => {
  console.error('Test error:', error);
  process.exit(1);
});
