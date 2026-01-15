@echo off
cls
echo ========================================
echo    初始化 ProcureAI 数据库
echo ========================================
echo.

echo 检查 MongoDB 服务...
sc query MongoDB | findstr "RUNNING" >nul
if %errorlevel% equ 1 (
    echo [ERROR] MongoDB 服务未运行
    echo.
    echo 请先运行: check-mongodb-service.bat
    echo.
    pause
    exit /b 1
)
echo [OK] MongoDB 服务正在运行
echo.

echo 检查后端依赖...
if not exist "backend\node_modules\" (
    echo [ERROR] 后端依赖未安装
    echo 请先运行: start.bat
    echo.
    pause
    exit /b 1
)
echo [OK] 后端依赖已安装
echo.

echo ========================================
echo    数据库初始化选项
echo ========================================
echo.
echo 1. 创建管理员账户（首次使用）
echo 2. 创建示例数据（测试用）
echo 3. 完整初始化（推荐）
echo 4. 退出
echo.
set /p choice="请选择 (1-4): "

if "%choice%"=="1" goto create-admin
if "%choice%"=="2" goto create-sample
if "%choice%"=="3" goto full-init
if "%choice%"=="4" goto end

:create-admin
echo.
echo [1/2] 创建管理员账户...
cd backend
call node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/procureai', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['Free', 'PLUS', 'PRO', 'ADMIN'], default: 'Free' },
  credits: { type: Number, default: 100 },
  joinDate: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    const existing = await User.findOne({ email: 'admin@procureai.com' });
    if (existing) {
      console.log('[INFO] 管理员账户已存在，正在更新密码...');
      existing.password = 'admin123';
      await existing.save();
    } else {
      console.log('[INFO] 创建管理员账户...');
      await User.create({
        name: 'Admin',
        email: 'admin@procureai.com',
        password: 'admin123',
        role: 'ADMIN',
        credits: 999999
      });
    }
    console.log('[OK] 管理员账户创建/更新成功！');
    console.log('');
    console.log('管理员账号信息:');
    console.log('  邮箱: admin@procureai.com');
    console.log('  密码: admin123');
    console.log('');
    console.log('⚠ 警告: 请在登录后立即修改默认密码！');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[ERROR] 创建管理员账户失败:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

createAdmin();
"
cd ..
if %errorlevel% equ 0 (
    echo.
    echo [OK] 管理员账户创建成功！
    echo.
    echo 下一步: 运行 start.bat 启动服务
) else (
    echo.
    echo [ERROR] 管理员账户创建失败
)
goto end

:create-sample
echo.
echo [1/2] 创建示例数据...
cd backend
call node -e "
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/procureai');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['Free', 'PLUS', 'PRO', 'ADMIN'], default: 'Free' },
  credits: { type: Number, default: 100 },
  joinDate: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createSampleData() {
  try {
    // 创建测试用户
    const testUser = await User.findOne({ email: 'test@procureai.com' });
    if (!testUser) {
      await User.create({
        name: 'Test User',
        email: 'test@procureai.com',
        password: '123456',
        role: 'PLUS',
        credits: 500
      });
      console.log('[OK] 测试用户已创建');
    } else {
      console.log('[INFO] 测试用户已存在');
    }

    // 创建更多测试用户
    const roles = ['Free', 'PLUS', 'PRO'];
    for (let i = 1; i <= 10; i++) {
      const email = `user${i}@test.com`;
      const existing = await User.findOne({ email });
      if (!existing) {
        await User.create({
          name: \`Test User \${i}\`,
          email: email,
          password: '123456',
          role: roles[i % 3],
          credits: Math.floor(Math.random() * 1000)
        });
      }
    }

    console.log('[OK] 示例数据创建成功！');
    console.log('');
    console.log('测试账号:');
    console.log('  邮箱: test@procureai.com');
    console.log('  密码: 123456');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[ERROR] 创建示例数据失败:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

createSampleData();
"
cd ..
if %errorlevel% equ 0 (
    echo.
    echo [OK] 示例数据创建成功！
    echo.
    echo 下一步: 运行 start.bat 启动服务
) else (
    echo.
    echo [ERROR] 示例数据创建失败
)
goto end

:full-init
echo.
echo [1/2] 完整初始化（管理员 + 示例数据）...
cd backend
call node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/procureai');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['Free', 'PLUS', 'PRO', 'ADMIN'], default: 'Free' },
  credits: { type: Number, default: 100 },
  joinDate: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', userSchema);

async function fullInit() {
  try {
    console.log('[INFO] 开始完整初始化...');
    console.log('');

    // 1. 创建/更新管理员
    const admin = await User.findOne({ email: 'admin@procureai.com' });
    if (!admin) {
      await User.create({
        name: 'Admin',
        email: 'admin@procureai.com',
        password: 'admin123',
        role: 'ADMIN',
        credits: 999999
      });
      console.log('[OK] 管理员账户已创建');
    } else {
      admin.password = 'admin123';
      admin.role = 'ADMIN';
      admin.credits = 999999;
      await admin.save();
      console.log('[OK] 管理员账户已更新');
    }

    // 2. 创建测试用户
    const testUser = await User.findOne({ email: 'test@procureai.com' });
    if (!testUser) {
      await User.create({
        name: 'Test User',
        email: 'test@procureai.com',
        password: '123456',
        role: 'PLUS',
        credits: 500
      });
      console.log('[OK] 测试用户已创建');
    }

    // 3. 创建更多测试用户
    const roles = ['Free', 'PLUS', 'PRO'];
    let userCount = 0;
    for (let i = 1; i <= 20; i++) {
      const email = \`user\${i}@test.com\`;
      const existing = await User.findOne({ email });
      if (!existing) {
        await User.create({
          name: \`Test User \${i}\`,
          email: email,
          password: '123456',
          role: roles[i % 3],
          credits: Math.floor(Math.random() * 1000)
        });
        userCount++;
      }
    }
    console.log(\`[OK] 已创建 \${userCount} 个测试用户\`);

    // 4. 显示统计
    const totalUsers = await User.countDocuments();
    const freeUsers = await User.countDocuments({ role: 'Free' });
    const plusUsers = await User.countDocuments({ role: 'PLUS' });
    const proUsers = await User.countDocuments({ role: 'PRO' });
    const adminUsers = await User.countDocuments({ role: 'ADMIN' });

    console.log('');
    console.log('[OK] 数据库初始化完成！');
    console.log('');
    console.log('数据库统计:');
    console.log(\`  总用户数: \${totalUsers}\`);
    console.log(\`  Free 用户: \${freeUsers}\`);
    console.log(\`  PLUS 用户: \${plusUsers}\`);
    console.log(\`  PRO 用户: \${proUsers}\`);
    console.log(\`  ADMIN 用户: \${adminUsers}\`);
    console.log('');
    console.log('重要账号信息:');
    console.log('');
    console.log('管理员账号:');
    console.log('  邮箱: admin@procureai.com');
    console.log('  密码: admin123');
    console.log('');
    console.log('测试账号:');
    console.log('  邮箱: test@procureai.com');
    console.log('  密码: 123456');
    console.log('');
    console.log('⚠ 警告: 请在首次登录后立即修改默认密码！');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[ERROR] 完整初始化失败:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

fullInit();
"
cd ..
if %errorlevel% equ 0 (
    echo.
    echo [OK] 完整初始化成功！
    echo.
    echo 下一步: 运行 start.bat 启动服务
) else (
    echo.
    echo [ERROR] 完整初始化失败
)
goto end

:end
echo.
pause
