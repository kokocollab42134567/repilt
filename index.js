const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

const EMAIL = 'kingdomsunion@gmail.com';
const PASSWORD = 'wMN*yneq9HPksu$';
const COOKIE_FILE = './cookies.json';

puppeteer.use(StealthPlugin());

(async () => {
  console.log('🚀 Launching browser...');

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
      '--proxy-server="direct://"',
      '--proxy-bypass-list=*',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-accelerated-2d-canvas',
      '--single-process', // Important for weak devices
      '--no-zygote',       // Important for weak devices
    ],
    defaultViewport: { width: 1280, height: 720 },
  });

  const page = await browser.newPage();

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

  try {
    console.log('🌐 Opening login page...');
    await page.goto('https://replit.com/login', { waitUntil: 'domcontentloaded', timeout: 45000 });

    console.log('✏️ Typing credentials...');
    await page.type('input[name="username"]', EMAIL, { delay: 30 });
    await page.type('input[name="password"]', PASSWORD, { delay: 30 });

    console.log('🔓 Logging in...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 45000 }),
      page.click('[data-cy="log-in-btn"]')
    ]);

    console.log('✅ Logged in! Saving cookies...');
    const cookies = await page.cookies();
    fs.writeFileSync(COOKIE_FILE, JSON.stringify(cookies, null, 2));
    console.log(`📁 Cookies saved to: ${COOKIE_FILE}`);

    console.log('🔄 Navigating to project page...');
    await page.goto('https://replit.com/@kingdomsunion/AromaticKeySyntax', { waitUntil: 'networkidle2', timeout: 60000 });

    console.log('▶️ Waiting for "Run" button...');
    await page.waitForSelector('button.useView_view__C2mnv.css-1qheakp', { timeout: 45000 });

    console.log('▶️ Clicking "Run" button...');
    await page.click('button.useView_view__C2mnv.css-1qheakp');

    console.log('✅ Script completed.');
    // Optional: Close browser if you want
    // await browser.close();

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    try {
      const title = await page.title();
      const url = page.url();
      console.log(`📄 Page title: ${title}`);
      console.log(`🌍 Page URL: ${url}`);
    } catch (e) {
      console.error('⚠️ Failed to fetch page info for debug.');
    }
  }
})();
