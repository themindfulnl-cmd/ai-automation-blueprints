// Usage: node render.js <reel> <lang> [--still t1,t2,...]
// Renders reel.html frame by frame (30 fps) and pipes PNG frames into ffmpeg -> MP4 (1080x1920, H.264).
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

(async () => {
  const [reel = '01', lang = 'en', flag, list] = process.argv.slice(2);
  const pageFile = reel === 'launch' ? 'sketch.html' : 'reel.html';
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(__dirname, `${pageFile}?reel=${reel}&lang=${lang}`));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const stage = await page.$('#stage');

  if (flag === '--still') {
    for (const t of list.split(',').map(Number)) {
      await page.evaluate(t => window.renderAt(t), t);
      await stage.screenshot({ path: path.join(__dirname, `../out/still-${reel}-${lang}-${t}.png`) });
    }
    await browser.close();
    return;
  }

  const fps = 30, dur = await page.evaluate(() => window.DURATION);
  const out = path.join(__dirname, `../out/post-${reel}-${lang}.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
    '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-shortest',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '20', '-c:a', 'aac', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < Math.round(dur * fps); f++) {
    await page.evaluate(t => window.renderAt(t), f / fps);
    const buf = await stage.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log('wrote', out);
})();
