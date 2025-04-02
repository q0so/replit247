require('dotenv').config();
const puppeteer = require('puppeteer-core');

module.exports = async (req, res) => {
  try {
    // 1. أرسل استجابة ناجحة فورًا (قبل أي عمليات)
    res.status(200).send('Request received');
    
    // 2. التنفيذ الفعلي في الخلفية (بعد إرسال الاستجابة)
    setTimeout(async () => {
      try {
        const browser = await puppeteer.launch({
          executablePath: '/usr/bin/chromium-browser',
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          headless: true
        });
        
        const page = await browser.newPage();
        
        // تسجيل الدخول إلى Replit
        await page.goto('https://replit.com/login', { waitUntil: 'networkidle2' });
        await page.type('input[name="email"]', process.env.REPLIT_EMAIL);
        await page.type('input[name="password"]', process.env.REPLIT_PASSWORD);
        await page.click('button[type="submit"]');
        
        // الانتقال إلى المشروع
        await page.waitForNavigation();
        await page.goto(`https://replit.com/${process.env.REPLIT_PROJECT}`);
        
        console.log('تم تسجيل الدخول بنجاح في الخلفية');
        await browser.close();
        
      } catch (backgroundError) {
        console.error('خطأ في المعالجة الخلفية:', backgroundError);
      }
    }, 100); // تأخير بسيط لضمان إرسال الاستجابة أولاً
  } catch (error) {
    console.error('خطأ في الإطار العام:', error);
    res.status(500).send('Server error'); // سيظهر هذا للمستخدم
  }
};
