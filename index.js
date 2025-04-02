// index.js
require('dotenv').config();
const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 3000;

// بيانات تسجيل الدخول (يجب استخدام environment variables في الإنتاج)
const CREDENTIALS = {
  email: process.env.REPLIT_EMAIL || '4183ca273c@emaily.pro',
  password: process.env.REPLIT_PASSWORD || '4183ca273c@emaily.pro',
  projectName: process.env.REPLIT_PROJECT || 'aa'
};

// محاكاة تسجيل الدخول وإبقاء المشروع نشطًا
async function keepAlive() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('جاري تسجيل الدخول إلى Replit...');
    await page.goto('https://replit.com/login');
    
    // إدخال بيانات الاعتماد
    await page.type('input[name="username"]', CREDENTIALS.email);
    await page.type('input[name="password"]', CREDENTIALS.password);
    await page.click('button[type="submit"]');
    
    console.log('تم تسجيل الدخول بنجاح ✅');
    
    // الانتقال إلى المشروع
    await page.goto(`https://replit.com/@${CREDENTIALS.email}/${CREDENTIALS.projectName}`);
    console.log('تم الوصول إلى المشروع 🚀');

    // إبقاء النافذة مفتوحة
    setInterval(async () => {
      await page.reload();
      console.log('جاري تجديد النشاط... 🔄');
    }, 300000); // كل 5 دقائق

  } catch (error) {
    console.error('حدث خطأ:', error);
    await browser.close();
  }
}

// واجهة الويب
app.get('/', (req, res) => {
  res.send(`
    <html>
      <body style="background: #1a1a1a; color: white; text-align: center;">
        <h1>Hello World 🌍</h1>
        <p>المشروع يعمل بنجاح على ${CREDENTIALS.projectName}</p>
      </body>
    </html>
  `);
});

// بدء التشغيل
app.listen(PORT, () => {
  console.log(`الخادم يعمل على http://localhost:${PORT}`);
  keepAlive();
});
