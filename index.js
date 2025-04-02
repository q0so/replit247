require('dotenv').config();
const puppeteer = require('puppeteer-core');
const chrome = require('chrome-aws-lambda');

module.exports = async (req, res) => {
  // إرسال استجابة "Done" فورًا
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Replit Keepalive</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
          }
          .message {
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
        </style>
      </head>
      <body>
        <div class="message">
          <h1>Done!</h1>
          <p>تم تنشيط مشروع Replit بنجاح</p>
          <p>${new Date().toLocaleString()}</p>
        </div>
      </body>
    </html>
  `);

  // الجزء الذي يتعامل مع Replit (يعمل في الخلفية)
  try {
    const browser = await puppeteer.launch({
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: true,
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

    // إرسال طلب جديد بعد 5 دقائق (للاستمرارية)
    if (process.env.VERCEL_URL) {
      setTimeout(async () => {
        await fetch(`${process.env.VERCEL_URL}/api/keepalive`);
      }, 5 * 60 * 1000);
    }

  } catch (error) {
    console.error('حدث خطأ في الجزء الخلفي:', error);
  }
};
