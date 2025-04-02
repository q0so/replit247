require('dotenv').config();
const puppeteer = require('puppeteer-core');
const chrome = require('chrome-aws-lambda');

module.exports = async (req, res) => {
  // إرسال استجابة فورية
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>حافظة Replit</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f0f2f5;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
        }
        .container {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          text-align: center;
        }
        .success {
          color: #28a745;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="success">✓ تم التنفيذ بنجاح</h1>
        <p>جاري الحفاظ على نشاط مشروع Replit...</p>
        <p>${new Date().toLocaleString('ar-EG')}</p>
      </div>
    </body>
    </html>
  `);

  // الجزء الذي يعمل في الخلفية
  try {
    const browser = await puppeteer.launch({
      args: [...chrome.args, '--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: await chrome.executablePath,
      headless: chrome.headless,
      defaultViewport: chrome.defaultViewport,
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
    
    await page.waitForNavigation({ 
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // الانتقال إلى المشروع
    await page.goto(`https://replit.com/${process.env.REPLIT_PROJECT}`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // تنفيذ أنشطة للحفاظ على النشاط
    await page.evaluate(() => {
      console.log('نشاط حافظة الاتصال - ' + new Date().toLocaleString());
      const tabs = ['files', 'shell', 'console'];
      const randomTab = tabs[Math.floor(Math.random() * tabs.length)];
      document.querySelector(`[data-cy="${randomTab}-tab"]`)?.click();
    });

    await browser.close();

    // جدولة الطلب التالي (للاستمرارية)
    if (process.env.VERCEL_URL) {
      try {
        await axios.get(`${process.env.VERCEL_URL}/api/keepalive`);
      } catch (error) {
        console.error('Error scheduling next request:', error.message);
      }
    }

  } catch (error) {
    console.error('حدث خطأ في المعالجة الخلفية:', error.message);
  }
};
