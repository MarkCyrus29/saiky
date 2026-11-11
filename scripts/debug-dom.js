const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 3012;
const CDP_PORT = 9225;

async function waitFor(url, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await new Promise((res, rej) => {
        const req = http.get(url, (r) => (r.statusCode === 200 ? res() : rej()));
        req.on('error', rej);
        req.setTimeout(800, () => req.destroy());
      });
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  throw new Error('Timeout on ' + url);
}

async function main() {
  const nextBinary = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next');
  const nextProc = spawn(process.execPath, [nextBinary, 'start', '-p', String(PORT)], {
    cwd: path.join(__dirname, '..'),
    stdio: 'ignore',
  });

  let chromeProc;
  try {
    await waitFor(`http://127.0.0.1:${PORT}`);
    chromeProc = spawn(
      CHROME_PATH,
      [
        '--headless=new',
        '--disable-gpu',
        '--remote-debugging-port=' + CDP_PORT,
        '--window-size=390,1400',
        `http://127.0.0.1:${PORT}`,
      ],
      { stdio: 'ignore' }
    );

    await waitFor(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const tabs = await new Promise((res) => {
      http.get(`http://127.0.0.1:${CDP_PORT}/json/list`, (r) => {
        let d = '';
        r.on('data', (c) => (d += c));
        r.on('end', () => res(JSON.parse(d)));
      });
    });

    // Connect WebSocket using built-in global WebSocket in Node 22
    const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
    await new Promise((res) => ws.addEventListener('open', res));

    let id = 1;
    function send(method, params = {}) {
      return new Promise((res) => {
        const msgId = id++;
        const handler = (evt) => {
          const m = JSON.parse(evt.data);
          if (m.id === msgId) {
            ws.removeEventListener('message', handler);
            res(m.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    // 1. Mobile Rows
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/` });
    await new Promise((r) => setTimeout(r, 800));
    const s1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(__dirname, '..', 'screenshot-390.png'), Buffer.from(s1.data, 'base64'));
    console.log('Saved screenshot-390.png');

    // 2. Mobile Player
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/?mode=player` });
    await new Promise((r) => setTimeout(r, 800));
    const s2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(__dirname, '..', 'screenshot-mobile-player.png'), Buffer.from(s2.data, 'base64'));
    console.log('Saved screenshot-mobile-player.png');

    // 3. Desktop Rows
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 1200,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/` });
    await new Promise((r) => setTimeout(r, 800));
    const s3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(__dirname, '..', 'screenshot-1440.png'), Buffer.from(s3.data, 'base64'));
    console.log('Saved screenshot-1440.png');

    // 4. Desktop Player
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/?mode=player` });
    await new Promise((r) => setTimeout(r, 800));
    const s4 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(__dirname, '..', 'screenshot-player.png'), Buffer.from(s4.data, 'base64'));
    console.log('Saved screenshot-player.png');

    // 5. Chords Page
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/track/demo-test/chords` });
    await new Promise((r) => setTimeout(r, 800));
    const s5 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(__dirname, '..', 'screenshot-chords.png'), Buffer.from(s5.data, 'base64'));
    console.log('Saved screenshot-chords.png');
    ws.close();
  } finally {
    if (chromeProc) chromeProc.kill();
    nextProc.kill();
  }
}

main().catch(console.error);
