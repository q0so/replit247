require('dotenv').config();
const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');

module.exports = async (req, res) => {
  // إرسال استجابة فورية أولاً
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head><title>Replit Keepalive</title></head>
      <body>
        <h1>تم التنشيط بنجاح ✅</h1>
        <p>جاري الحفاظ على نشاط المشروع...</p>
      </body>
    </html>
  `);

  try {
    // إعداد المتصفح لبيئة Vercel
    const browser = await puppeteer.launch({
      args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: await chromium.executablePath || '/usr/bin/chromium-browser',
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
    });

    const page = await browser.newPage();
    
    // تسجيل الدخول إلى Replit
    await page.goto('https://replit.com/login', { 
      waitUntil: 'networkidle2',
      timeout: 20000 
    });

    await page.type('#email', process.env.REPLIT_EMAIL);
    await page.type('#password', process.env.REPLIT_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ timeout: 20000 });

    // الانتقال إلى المشروع
    await page.goto(`https://replit.com/${process.env.REPLIT_PROJECT}`, {
      waitUntil: 'networkidle2',
      timeout: 20000
    });

    // تنفيذ نشاط للحفاظ على الاتصال
    await page.evaluate(() => {
      console.log('نشاط حافظة الاتصال - ' + new Date().toLocaleString());
    });

    await browser.close();

  } catch (error) {
    console.error('حدث خطأ:', error.message);
  }
};
