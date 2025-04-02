require('dotenv').config();
const puppeteer = require('puppeteer-core');
const chrome = require('chrome-aws-lambda');
const axios = require('axios');

module.exports = async (req, res) => {
  try {
    // إعداد المتصفح لبيئة Vercel
    const browser = await puppeteer.launch({
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: chrome.headless,
      defaultViewport: chrome.defaultViewport,
    });

    const page = await browser.newPage();
    
    // تسجيل الدخول إلى Replit
    await page.goto('https://replit.com/login', { waitUntil: 'networkidle2' });
    await page.type('input[name="email"]', process.env.REPLIT_EMAIL);
    await page.type('input[name="password"]', process.env.REPLIT_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // الانتقال إلى المشروع
    await page.goto(`https://replit.com/${process.env.REPLIT_PROJECT}`, {
      waitUntil: 'networkidle2'
    });

    // تنفيذ نشاط عشوائي
    await page.evaluate(() => {
      console.log('نشاط حافظة الاتصال - ' + new Date().toLocaleTimeString());
      const tabs = ['files', 'shell', 'console'];
      const randomTab = tabs[Math.floor(Math.random() * tabs.length)];
      document.querySelector(`[data-cy="${randomTab}-tab"]`)?.click();
    });

    await browser.close();

    // إرسال استجابة ناجحة
    res.status(200).json({
      status: 'success',
      message: 'تم تنفيذ نشاط Replit بنجاح',
      timestamp: new Date().toISOString()
    });

    // جدولة الطلب التالي (حل بديل للفترات الزمنية)
    if (process.env.VERCEL_URL) {
      const nextRun = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      await axios.get(`${process.env.VERCEL_URL}/index`);
      console.log(`تم جدولة التشغيل التالي لـ ${nextRun}`);
    }

  } catch (error) {
    console.error('حدث خطأ:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
