require('dotenv').config();
const puppeteer = require('puppeteer-core');

module.exports = async (req, res) => {
  try {
    // إرسال الاستجابة الفورية أولاً
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send('<h1>Done</h1>');

    // المعالجة الخلفية مع تحسينات الأمان
    if (req.method === 'GET') {
      setTimeout(async () => {
        let browser;
        try {
          browser = await puppeteer.launch({
            executablePath: process.env.CHROME_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--single-process'
            ],
            headless: true,
            timeout: 30000
          });

          const page = await browser.newPage();
          await page.setDefaultNavigationTimeout(60000);

          // تسجيل الدخول إلى Replit
          await page.goto('https://replit.com/login', { 
            waitUntil: 'domcontentloaded',
            timeout: 60000
          });

          await page.type('input[name="email"]', process.env.REPLIT_EMAIL);
          await page.type('input[name="password"]', process.env.REPLIT_PASSWORD);
          await Promise.all([
            page.waitForNavigation({ timeout: 60000 }),
            page.click('button[type="submit"]')
          ]);

          // الانتقال إلى المشروع
          await page.goto(`https://replit.com/${process.env.REPLIT_PROJECT}`, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
          });

          // إجراء نشاط بسيط
          await page.evaluate(() => {
            console.log('Keepalive activity executed at:', new Date());
          });

        } catch (err) {
          console.error('Background error:', err.message);
        } finally {
          if (browser) await browser.close();
        }
      }, 500);
    }
  } catch (err) {
    console.error('Main function error:', err.message);
  }
};
