#!/usr/bin/env node

import { mkdtempSync, mkdirSync, renameSync, rmSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { injectDecorationGlyph } from "./msdf-decoration.mjs";

function printHelp() {
    console.log(`Usage:
  node scripts/generate-msdf-font.mjs --font <ttf/otf> --charset <txt> [options]

Options:
  --font <path>            Input font file.
  --charset <path>         Charset text file.
  --texture-out <path>     Output atlas png path.
  --json-out <path>        Output font json path.
  --font-size <number>     Glyph size. Default: 56
  --texture-size <w,h>     Atlas size. Default: 512,512
  --padding <number>       Glyph padding. Default: 4
  --distance-range <n>     MSDF distance range. Default: 6
  --field-type <type>      msdf | sdf | psdf. Default: msdf
  --help                   Show this help.
`);
}

function getArg(name, fallback = undefined) {
    const index = process.argv.indexOf(name);
    if (index < 0 || index + 1 >= process.argv.length) {
        return fallback;
    }
    return process.argv[index + 1];
}

function hasArg(name) {
    return process.argv.includes(name);
}

if (hasArg("--help")) {
    printHelp();
    process.exit(0);
}

const fontPath = getArg("--font");
const charsetPath = getArg("--charset");

if (!fontPath || !charsetPath) {
    printHelp();
    process.exit(1);
}

const resolvedFont = resolve(fontPath);
const resolvedCharset = resolve(charsetPath);
const textureOut = resolve(getArg("--texture-out", "assets/resources/msdf/msdf-demo.png"));
const jsonOut = resolve(getArg("--json-out", "assets/resources/msdf/source-han-sans-cn-medium.json"));
const fontSize = getArg("--font-size", "56");
const textureSize = getArg("--texture-size", "512,512");
const padding = getArg("--padding", "4");
const distanceRange = getArg("--distance-range", "6");
const fieldType = getArg("--field-type", "msdf");

mkdirSync(dirname(textureOut), { recursive: true });
mkdirSync(dirname(jsonOut), { recursive: true });

const tmpRoot = mkdtempSync(join(tmpdir(), "laya-msdf-"));
const tempTextureBase = join(tmpRoot, basename(textureOut, extname(textureOut)));
const generatedJson = join(tmpRoot, `${basename(resolvedFont, extname(resolvedFont))}.json`);
const generatedTexture = `${tempTextureBase}.png`;

const args = [
    "--yes",
    "msdf-bmfont-xml",
    "-f", "json",
    "-i", resolvedCharset,
    "-o", tempTextureBase,
    "-m", textureSize,
    "-s", fontSize,
    "-p", padding,
    "-r", distanceRange,
    "-t", fieldType,
    resolvedFont
];

console.log(`Generating MSDF atlas from ${resolvedFont}`);

const result = spawnSync("npx", args, {
    stdio: "inherit",
    shell: false
});

if (result.status !== 0) {
    rmSync(tmpRoot, { recursive: true, force: true });
    process.exit(result.status ?? 1);
}

renameSync(generatedTexture, textureOut);
renameSync(generatedJson, jsonOut);

try {
    injectDecorationGlyph({ texturePath: textureOut, jsonPath: jsonOut });
} finally {
    rmSync(tmpRoot, { recursive: true, force: true });
}

console.log(`Wrote atlas: ${textureOut}`);
console.log(`Wrote font json: ${jsonOut}`);
