const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const express = require('express');
const fs = require('fs');

puppeteer.use(StealthPlugin());

const EMAIL = 'kingdomsunion@gmail.com';
const PASSWORD = 'wMN*yneq9HPksu$';
const COOKIE_FILE = './cookies.json';

// Initialize the express server
const app = express();
const port = 3000;

// Initialize the browser status
let browserStatus = 'Starting...';

// Set up an HTTP route to provide the browser status
app.get('/status', (req, res) => {
  res.json({ status: browserStatus });
});

// Start the HTTP server before launching the browser
app.listen(port, async () => {
  console.log(`Server is running on http://localhost:${port}`);
  
  // Update the status to "Launching browser"
  browserStatus = 'Launching browser...';

  // Start the browser and update the status
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      protocolTimeout: 180000,
      timeout: 180000,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-web-security',
        '--proxy-server="direct://"',
        '--proxy-bypass-list=*',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-accelerated-2d-canvas',
        '--disable-ipc-flooding-protection',
        '--enable-features=NetworkService,NetworkServiceInProcess',
      ],
      ignoreDefaultArgs: ['--disable-extensions'],
      defaultViewport: null,
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    
    // Update status to "Navigating to login"
    browserStatus = 'Navigating to login page...';

    await page.goto('https://replit.com/login', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    // Logging in and handling cookies
    console.log('🌐 Navigating to login page...');
    await page.waitForSelector('input[name="username"]', { timeout: 20000 });
    await page.type('input[name="username"]', EMAIL, { delay: 50 });
    await page.type('input[name="password"]', PASSWORD, { delay: 50 });
    await page.click('[data-cy="log-in-btn"]');
    
    browserStatus = 'Logging in...';

    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });

    // Save cookies after login
    console.log('✅ Logged in successfully');
    const cookies = await page.cookies();
    fs.writeFileSync(COOKIE_FILE, JSON.stringify(cookies, null, 2));
    console.log(`📁 Cookies saved to: ${COOKIE_FILE}`);

    browserStatus = 'Navigating to REPL project...';

    // Navigate to the REPL project
    await page.goto('https://replit.com/@kingdomsunion/AromaticKeySyntax', {
      waitUntil: 'networkidle2',
      timeout: 90000,
    });

    // Wait for "Run" button and click
    await page.waitForSelector('button.useView_view__C2mnv.css-1qheakp > svg.css-492dz9 + span.css-1xdyip3', {
      timeout: 60000,
    });
    const runButton = await page.$('button.useView_view__C2mnv.css-1qheakp');
    if (runButton) {
      browserStatus = 'Clicking "Run" button...';
      console.log('▶️ Exact "Run" button detected, clicking...');
      await runButton.click();
    } else {
      browserStatus = '⚠️ "Run" button not found.';
      console.warn('⚠️ Exact "Run" button not found.');
    }

  } catch (err) {
    browserStatus = `❌ Error: ${err.message}`;
    console.error(`❌ Login failed or page flow error: ${err.message}`);
  }
});
