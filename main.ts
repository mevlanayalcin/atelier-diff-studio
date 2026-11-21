// Atelier Meridian hand-in (Node 22, standard library only). The game is game/: static files a
// desktop browser opens offline (game/index.html, its stylesheet and its ES modules, no library
// and no network request). This program copies game/ and the four screenshots in screenshots/
// (the first by name, 01-conservatory-hunt.jpg, is the cover) to /output and writes
// /output/dossier.json with the vendored make.fun library, unchanged.
//
// Play locally with `node serve.ts` and open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

/** The scorer's caps (reference/gate.json); only text_max_bytes shapes the dossier's bytes. */
const LIMITS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function copyEntry(): void {
  mkdirSync(outputDir, { recursive: true });
  cpSync(join(root, 'game'), join(outputDir, 'game'), { recursive: true });
  mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
  const shots = join(root, 'screenshots');
  if (existsSync(shots)) cpSync(shots, join(outputDir, 'screenshots'), { recursive: true });
}

copyEntry();
writeFileSync(join(outputDir, 'dossier.json'), buildDossier(outputDir, LIMITS));
