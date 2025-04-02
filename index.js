require('dotenv').config();
const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');

app.get("/", (req, res) => {
  res.send('<center><h1>DONE</h1></center>')
});

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
