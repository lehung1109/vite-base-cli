import { globby } from 'globby';
import path from 'path';
import fs from 'fs/promises';

interface CopyOption {
  cwd: string;
}

const copy = async (
  src: string | string[],
  dest: string,
  {
    cwd
  }: CopyOption
) => {
  const sourceFiles = await globby(src, {
    cwd,
    dot: true,
    absolute: false,
    gitignore: true,
    ignore: ['.git', 'package-lock.json']
  });

  const destRelativeToCwd = path.resolve(dest);

  return Promise.all(
    sourceFiles.map(async (p) => {
      const dirname = path.dirname(p);
      const basename = path.basename(p);

      const from = path.resolve(cwd, p);
      const to = path.join(destRelativeToCwd, dirname, basename);

      // Ensure the destination directory exists
      await fs.mkdir(path.dirname(to), { recursive: true })

      return fs.copyFile(from, to)
    })
  );
}

export { copy };
