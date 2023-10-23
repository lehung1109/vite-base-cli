import fs from 'fs/promises';
import path, { join } from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import chalk from 'chalk'
import { install } from '../helpers/install.js';
import { tmpdir } from 'os';
import { promisify } from 'util';
import { Stream } from 'stream';
import got from 'got';
import tar from 'tar'
import { createWriteStream } from 'fs';
import pRetry from 'p-retry';

export const filename = fileURLToPath(import.meta.url);
export const dirname = path.dirname(filename);

interface Props {
  appName: string;
  root: string;
}

const pipeline = promisify(Stream.pipeline)

const { cyan } = chalk;

const downloadTar = async (url: string) => {
  const tempFile = join(tmpdir(), `vite.temp-${Date.now()}`);

  await pipeline(got.stream(url), createWriteStream(tempFile));

  return tempFile;
}

const downloadAndExtract = async (root: string) => {
  const tempFile = await downloadTar(
    'http://codeload.github.com/lehung1109/vite-base/tar.gz/main'
  );

  await tar.x({
    file: tempFile,
    cwd: root,
    strip: 1,
  });

  await fs.unlink(tempFile)
}

const installTemplate = async (model: Props) => {
  const { appName, root } = model;
  console.log('\nInitializing project');

  await pRetry(async () => downloadAndExtract(root), {
    retries: 3,
  });

  const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));

  packageJson.name = appName;
  packageJson.description = '';
  packageJson.version = '0.1.0';
  packageJson.bin = '';

  const devDeps = Object.keys(packageJson.devDependencies).length;

  if (!devDeps) delete packageJson.devDependencies;

  await fs.writeFile(
    path.join(root, 'package.json'),
    JSON.stringify(packageJson, null, 2) + os.EOL
  );

  console.log('\nInstalling dependencies:');

  for (const dependency in packageJson.dependencies) {
    console.log(`- ${cyan(dependency)}`);
  }

  if (devDeps) {
    console.log('\nInstalling devDependencies:');

    for (const dependency in packageJson.devDependencies)
      console.log(`- ${cyan(dependency)}`)
  }

  await install();
};

export { installTemplate }