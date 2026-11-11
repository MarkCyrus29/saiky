const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ORIG_DIR = path.join(__dirname, '..', 'assets-original');
const OUT_DIR = path.join(__dirname, '..', 'public', 'assets');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Circular SVG mask generator for round paper discs cut out with scissors
function createCircleMask(size, radius) {
  const r = radius || Math.floor(size * 0.485);
  const c = Math.floor(size / 2);
  return Buffer.from(
    `<svg width="${size}" height="${size}">
      <circle cx="${c}" cy="${c}" r="${r}" fill="white" />
    </svg>`
  );
}

async function prepareHeader() {
  console.log('Processing header...');
  // Normal header is sideways in the original photo: rotate 270 (or -90)
  // Hover header is upright.
  const hNormRot = await sharp(path.join(ORIG_DIR, 'header.jpg'))
    .rotate(270)
    .toBuffer();

  const normBuffer = await sharp(hNormRot)
    .extract({ left: 60, top: 10, width: 2840, height: 925 })
    .resize(1600, 521)
    .toBuffer();

  const hoverBuffer = await sharp(path.join(ORIG_DIR, 'header_hover.jpg'))
    .extract({ left: 55, top: 125, width: 2790, height: 909 })
    .resize(1600, 521)
    .toBuffer();

  await sharp(normBuffer).webp({ quality: 92 }).toFile(path.join(OUT_DIR, 'header.webp'));
  await sharp(normBuffer).jpeg({ quality: 92 }).toFile(path.join(OUT_DIR, 'header.jpg'));

  await sharp(hoverBuffer).webp({ quality: 92 }).toFile(path.join(OUT_DIR, 'header_hover.webp'));
  await sharp(hoverBuffer).jpeg({ quality: 92 }).toFile(path.join(OUT_DIR, 'header_hover.jpg'));

  console.log('Header done: 1600x521');
}

async function prepareTitles() {
  console.log('Processing tracklist titles...');
  // Both tracklist.jpg and tracklist_hover.jpg are sideways: rotate 270
  const tNormRot = await sharp(path.join(ORIG_DIR, 'tracklist.jpg')).rotate(270).toBuffer();
  const tHoverRot = await sharp(path.join(ORIG_DIR, 'tracklist_hover.jpg')).rotate(270).toBuffer();

  const titleConfigs = [
    { num: 1, top: 60, height: 490 },
    { num: 2, top: 570, height: 490 },
    { num: 3, top: 1080, height: 490 },
    { num: 4, top: 1600, height: 380 },
  ];

  for (const c of titleConfigs) {
    const normSlice = await sharp(tNormRot)
      .extract({ left: 20, top: c.top, width: 2920, height: c.height })
      .resize({ width: 1200 })
      .toBuffer();

    const hoverSlice = await sharp(tHoverRot)
      .extract({ left: 20, top: c.top, width: 2920, height: c.height })
      .resize({ width: 1200 })
      .toBuffer();

    await sharp(normSlice).webp({ quality: 92 }).toFile(path.join(OUT_DIR, `title-${c.num}.webp`));
    await sharp(normSlice).jpeg({ quality: 92 }).toFile(path.join(OUT_DIR, `title-${c.num}.jpg`));

    await sharp(hoverSlice).webp({ quality: 92 }).toFile(path.join(OUT_DIR, `title-${c.num}_hover.webp`));
    await sharp(hoverSlice).jpeg({ quality: 92 }).toFile(path.join(OUT_DIR, `title-${c.num}_hover.jpg`));
    console.log(`Title ${c.num} done`);
  }
}

async function prepareVinyls() {
  console.log('Processing vinyls...');
  const mask = createCircleMask(900, 436);

  const vinylConfigs = [
    {
      name: 'youlookedaway',
      norm: { file: 'youlookedaway.jpg', cx: 1408, cy: 1497, size: 2760, rotate: 0 },
      hover: { file: 'youlookedaway_hover.jpg', cx: 1500, cy: 1490, size: 2760, rotate: 0 }
    },
    {
      name: 'wrightway',
      norm: { file: 'wrightway.jpg', cx: 1511, cy: 1431, size: 2800, rotate: 0 },
      hover: { file: 'wrightway_hover.jpg', cx: 1501, cy: 1504, size: 2800, rotate: 0 }
    },
    {
      name: 'question',
      norm: { file: 'question.jpg', cx: 1501, cy: 1469, size: 2760, rotate: 0 },
      hover: { file: 'question_hover.jpg', cx: 1505, cy: 1468, size: 2760, rotate: 0 }
    },
    {
      name: 'traffic',
      norm: { file: 'traffic.jpg', cx: 1453, cy: 1466, size: 2760, rotate: 0 },
      // Note: traffic_hover was photographed rotated 90 degrees counter-clockwise relative to normal,
      // so we rotate 90 degrees clockwise to align with normal!
      hover: { file: 'traffic_hover.jpg', cx: 1426, cy: 1525, size: 2760, rotate: 90 }
    }
  ];

  for (const vc of vinylConfigs) {
    // Process normal
    let nSharp = sharp(path.join(ORIG_DIR, vc.norm.file));
    if (vc.norm.rotate) nSharp = nSharp.rotate(vc.norm.rotate);
    const nBuf = await nSharp.toBuffer();
    const nMeta = await sharp(nBuf).metadata();

    const nHalf = Math.floor(vc.norm.size / 2);
    const nLeft = Math.max(0, Math.min(nMeta.width - vc.norm.size, vc.norm.cx - nHalf));
    const nTop = Math.max(0, Math.min(nMeta.height - vc.norm.size, vc.norm.cy - nHalf));

    const nProcessed = await sharp(nBuf)
      .extract({ left: nLeft, top: nTop, width: vc.norm.size, height: vc.norm.size })
      .resize(900, 900)
      .composite([{ input: mask, blend: 'dest-in' }])
      .toBuffer();

    // Process hover
    let hSharp = sharp(path.join(ORIG_DIR, vc.hover.file));
    if (vc.hover.rotate) hSharp = hSharp.rotate(vc.hover.rotate);
    const hBuf = await hSharp.toBuffer();
    const hMeta = await sharp(hBuf).metadata();

    const hHalf = Math.floor(vc.hover.size / 2);
    const hLeft = Math.max(0, Math.min(hMeta.width - vc.hover.size, vc.hover.cx - hHalf));
    const hTop = Math.max(0, Math.min(hMeta.height - vc.hover.size, vc.hover.cy - hHalf));

    const hProcessed = await sharp(hBuf)
      .extract({ left: hLeft, top: hTop, width: vc.hover.size, height: vc.hover.size })
      .resize(900, 900)
      .composite([{ input: mask, blend: 'dest-in' }])
      .toBuffer();

    await sharp(nProcessed).webp({ quality: 92, alphaQuality: 95 }).toFile(path.join(OUT_DIR, `vinyl-${vc.name}.webp`));
    await sharp(nProcessed).png().toFile(path.join(OUT_DIR, `vinyl-${vc.name}.png`));

    await sharp(hProcessed).webp({ quality: 92, alphaQuality: 95 }).toFile(path.join(OUT_DIR, `vinyl-${vc.name}_hover.webp`));
    await sharp(hProcessed).png().toFile(path.join(OUT_DIR, `vinyl-${vc.name}_hover.png`));

    console.log(`Vinyl ${vc.name} done`);
  }

  // Favicon:
  const faviconBuffer = await sharp(path.join(OUT_DIR, 'vinyl-youlookedaway.png'))
    .resize(64, 64)
    .png()
    .toBuffer();
  await sharp(faviconBuffer).toFile(path.join(OUT_DIR, 'favicon.png'));
  await sharp(faviconBuffer).toFile(path.join(__dirname, '..', 'public', 'favicon.ico'));
  console.log('Favicon done');
}

async function main() {
  console.log('Running repeatable asset preparation script...');
  await prepareHeader();
  await prepareTitles();
  await prepareVinyls();
  console.log('All assets generated in public/assets/ with WebP and PNG/JPEG fallbacks.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
