// Usage: node add-hook.js <clip.mov|mp4> <reel.mp4> <out.mp4> "<hook text, | = new line, *word* = colour>" [seconds]
// Puts a hook card over a real clip (cropped to 9:16, muted), then cuts to the animated reel.
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const path = require('path'), os = require('os'), fs = require('fs');

(async () => {
  const [clip, reel, out, hook, secs = '3.8'] = process.argv.slice(2);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hook-'));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('file://' + path.join(__dirname, 'hook.html') + '?hook=' + encodeURIComponent(hook));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);
  await (await page.$('#stage')).screenshot({ path: path.join(tmp, 'card.png'), omitBackground: true });
  await browser.close();

  const ff = a => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a], { stdio: 'inherit' });
  // hook part: crop clip to 1080x1920, card pops in, silent audio to match the reel
  ff(['-i', clip, '-loop', '1', '-i', path.join(tmp, 'card.png'), '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
    '-filter_complex', `[0:v]setpts=1.6*PTS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1[v];` +
      `[1:v]format=rgba,fade=in:st=0.15:d=0.3:alpha=1[c];[v][c]overlay=0:0:shortest=1,format=yuv420p[o]`,
    '-map', '[o]', '-map', '2:a', '-t', secs, '-c:v', 'libx264', '-crf', '20', '-c:a', 'aac', '-ar', '44100', path.join(tmp, 'hook.mp4')]);
  // join hook + reel
  ff(['-i', path.join(tmp, 'hook.mp4'), '-i', reel, '-filter_complex', '[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]',
    '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-movflags', '+faststart', out]);
  fs.copyFileSync(path.join(tmp, 'card.png'), out.replace(/\.mp4$/, '-hookcard.png'));
  console.log('wrote', out);
})();
