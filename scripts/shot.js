#!/usr/bin/env node
/*
  Take a sharp (2x) screenshot of a live site and save it into images/work.

  Usage:
    npm run shot -- https://example.com example-name
    npm run shot -- https://example.com/gallery example-gallery

  Then add the file to projects.js:  image: "images/work/example-name.jpg"
*/
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const [url, name] = process.argv.slice(2);
if (!url || !name) {
  console.error('Usage: npm run shot -- <url> <file-name>');
  process.exit(1);
}

const chromes = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium'
];
const chrome = chromes.find(p => fs.existsSync(p));
if (!chrome) { console.error('No Chrome/Chromium found.'); process.exit(1); }

const outDir = path.join(__dirname, '..', 'images', 'work');
fs.mkdirSync(outDir, { recursive: true });
const png = path.join('/tmp', name + '.png');
const jpg = path.join(outDir, name + '.jpg');

console.log('Capturing ' + url + ' ...');
try {
  execFileSync(chrome, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars',
    '--force-device-scale-factor=2', '--window-size=1440,900',
    '--virtual-time-budget=15000', '--screenshot=' + png, url
  ], { stdio: 'ignore' });
} catch (e) { /* Chrome often exits non-zero after a successful capture */ }

if (!fs.existsSync(png)) { console.error('Screenshot failed.'); process.exit(1); }

if (process.platform === 'darwin') {
  execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '88', png, '--out', jpg], { stdio: 'ignore' });
} else {
  fs.copyFileSync(png, path.join(outDir, name + '.png'));
}
console.log('Saved ' + path.relative(process.cwd(), jpg));
console.log('Now add to projects.js:  image: "images/work/' + name + '.jpg"');
