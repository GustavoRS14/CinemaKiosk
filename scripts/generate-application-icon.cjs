const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const projectRoot = path.resolve(__dirname, '..');
const source = path.join(projectRoot, 'Assets', 'ApplicationLogo', 'ApplicationLogo.svg');
const outputDirectory = path.join(projectRoot, 'build');
const output = path.join(outputDirectory, 'ApplicationLogo.ico');
const sizes = [16, 24, 32, 48, 64, 128, 256];

async function generateIcon() {
  const svg = fs.readFileSync(source);
  const images = await Promise.all(sizes.map((size) => sharp(svg)
    .resize(size, size, { fit: 'contain' })
    .png()
    .toBuffer()));
  const directorySize = 6 + (images.length * 16);
  const header = Buffer.alloc(directorySize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = directorySize;
  images.forEach((image, index) => {
    const entry = 6 + (index * 16);
    const size = sizes[index];
    header.writeUInt8(size === 256 ? 0 : size, entry);
    header.writeUInt8(size === 256 ? 0 : size, entry + 1);
    header.writeUInt8(0, entry + 2);
    header.writeUInt8(0, entry + 3);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(image.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += image.length;
  });

  fs.mkdirSync(outputDirectory, { recursive: true });
  fs.writeFileSync(output, Buffer.concat([header, ...images]));
  console.log(`Generated ${output}`);
}

generateIcon().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
