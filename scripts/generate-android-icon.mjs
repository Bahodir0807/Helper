import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Resvg} from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const sourceSvgPath = path.join(rootDir, 'assets', 'icons', 'app-icon.svg');
const outputDir = path.join(
  rootDir,
  'android',
  'app',
  'src',
  'main',
  'res',
  'drawable-nodpi',
);
const outputPngPath = path.join(outputDir, 'ic_launcher_foreground.png');

async function main() {
  const svg = await fs.readFile(sourceSvgPath, 'utf8');

  const icon = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 432,
    },
  }).render();

  await fs.mkdir(outputDir, {recursive: true});
  await fs.writeFile(outputPngPath, icon.asPng());

  process.stdout.write(
    `Android icon updated: ${path.relative(rootDir, outputPngPath)}\n`,
  );
}

main().catch(error => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exit(1);
});
