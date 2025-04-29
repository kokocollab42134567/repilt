const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const http = require('http');

const COOKIE_FILE = './cookies.json';

puppeteer.use(StealthPlugin());

let browser, page;

async function launchBrowser() {
  console.log('🚀 Launching browser...');

  try {
    browser = await puppeteer.connect({
      browserWSEndpoint: 'wss://production-sfo.browserless.io/?token=SCtsRZKaUy9UsBe65e9925403d452f8a0f55a8129f&proxy=residential'
    });

    page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

    console.log('🍪 Loading cookies...');
    if (fs.existsSync(COOKIE_FILE)) {
      const cookies = JSON.parse(fs.readFileSync(COOKIE_FILE));
      await page.setCookie(...cookies);
      console.log('✅ Cookies loaded.');
    } else {
      throw new Error('Cookies file not found!');
    }

    console.log('🔄 Navigating to project page...');
    await page.goto('https://replit.com/@kingdomsunion/AromaticKeySyntax', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    const runButtonSelector = 'button.useView_view__C2mnv.css-1qheakp';
    console.log('🔍 Checking for "Run" button...');

    try {
      await page.waitForSelector(runButtonSelector, { timeout: 15000 });
      console.log('▶️ Clicking "Run" button...');
      await page.click(runButtonSelector);
    } catch (e) {
      console.log('ℹ️ "Run" button not found — assuming already running.');
    }

    console.log('✅ Script setup complete. Keeping page open...');
    await page.waitForSelector('body', { timeout: 0 });

  } catch (error) {
    console.error('❌ Error in launchBrowser:', error);
    if (page) {
      try {
        console.log(`📄 Page title: ${await page.title()}`);
        console.log(`🌍 Page URL: ${page.url()}`);
      } catch {
        console.error('⚠️ Failed to fetch page info for debug.');
      }
    }
    process.exit(1); // Exit with error so Render knows it failed
  }
}

// Handle unhandled rejections globally
process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Promise Rejection:', reason);
  process.exit(1);
});


// Create HTTP server on port 8000
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('hi\n');
});

server.listen(8000, () => {
  console.log('🌐 Simple server running at http://localhost:8000');
});
launchBrowser();

// Self-check every 2 minutes — just print "hi"
setInterval(() => {
  console.log('hi');
}, 2 * 60 * 1000);

// Prevent Node from exiting
process.stdin.resume();
