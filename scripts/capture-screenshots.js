const { spawn, execSync } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 3005;

async function waitForServer() {
  const start = Date.now();
  while (Date.now() - start < 15000) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${PORT}`, (res) => {
          if (res.statusCode === 200) resolve();
          else reject(new Error('Status ' + res.statusCode));
        });
        req.on('error', reject);
        req.setTimeout(800, () => req.destroy());
      });
      console.log('Server is ready on port', PORT);
      return;
    } catch (e) {
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  throw new Error('Server timeout');
}

async function main() {
  console.log('Starting Next.js server on port', PORT);
  const nextBinary = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next');
  const nextProcess = spawn(process.execPath, [nextBinary, 'start', '-H', '0.0.0.0', '-p', String(PORT)], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
  });

  try {
    await waitForServer();

    const targets = [
      {
        url: `http://localhost:${PORT}/`,
        size: '1440,900',
        out: 'screenshot-player.png',
        extra: '',
      },
      {
        url: `http://localhost:${PORT}/track/you-looked-away/lyrics`,
        size: '1440,900',
        out: 'screenshot-lyrics.png',
        extra: '',
      },
      {
        url: `http://localhost:${PORT}/`,
        size: '390,844',
        out: 'screenshot-390.png',
        extra: '--user-agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"',
      },
    ];

    for (const t of targets) {
      console.log(`Capturing ${t.out} at ${t.size}...`);
      const cmd = `"${CHROME_PATH}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --virtual-time-budget=3000 --window-size=${t.size} ${t.extra} --screenshot="${path.join(__dirname, '..', t.out)}" "${t.url}"`;
      execSync(cmd);
      console.log(`Captured ${t.out}`);
    }
  } finally {
    console.log('Stopping server...');
    nextProcess.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
