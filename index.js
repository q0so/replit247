require('dotenv').config();
const playwright = require('playwright-core');

module.exports = async (req, res) => {
  try {
    // إرسال استجابة فورية أولاً
    res.status(200).json({ 
      status: 'processing',
      message: 'جاري تنشيط مشروع Replit',
      timestamp: new Date().toISOString()
    });

    // تشغيل المتصفح في الخلفية
    const browser = await playwright.chromium.launch({
      channel: 'chrome',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    // تنفيذ العمليات مع Replit
    await page.goto('https://replit.com/login');
    await page.fill('input[name="email"]', process.env.REPLIT_EMAIL);
    await page.fill('input[name="password"]', process.env.REPLIT_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/@**');
    
    await page.goto(`https://replit.com/${process.env.REPLIT_PROJECT}`);
    await page.click('[data-cy="run-button"]');
    
    await browser.close();

  } catch (error) {
    console.error('حدث خطأ:', error);
  }
};
