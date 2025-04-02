require('dotenv').config();
const puppeteer = require('puppeteer-core');

module.exports = async (req, res) => {
  // إرسال الاستجابة الفورية
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send('<h1>Done</h1>');
  
  // التنفيذ الخلفي (لا يؤثر على الاستجابة)
  setTimeout(async () => {
    try {
      const browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium-browser',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true
      });
      
      const page = await browser.newPage();
      
      // تسجيل الدخول إلى Replit
      await page.goto('https://replit.com/login', { 
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      await page.type('input[name="email"]', process.env.REPLIT_EMAIL);
      await page.type('input[name="password"]', process.env.REPLIT_PASSWORD);
      await page.click('button[type="submit"]');
      
      // الانتقال إلى المشروع
      await page.waitForNavigation({ timeout: 30000 });
      await page.goto(`https://replit.com/${process.env.REPLIT_PROJECT}`, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      // تنفيذ نشاط بسيط
      await page.evaluate(() => {
        console.log('نشاط خلفي - ' + new Date().toLocaleString());
      });
      
      await browser.close();
      
    } catch (error) {
      console.error('حدث خطأ في المعالجة الخلفية:', error.message);
    }
  }, 100);
};
