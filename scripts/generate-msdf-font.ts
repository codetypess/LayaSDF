#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { copyFileSync, mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { injectDecorationGlyph } from "./msdf-decoration.js";

function printHelp(): void {
    console.log(`Usage:
  tsx scripts/generate-msdf-font.ts --font <ttf/otf> --charset <txt> [options]

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

function getArg(name: string, fallback?: string): string | undefined {
    const index = process.argv.indexOf(name);
    if (index < 0 || index + 1 >= process.argv.length) {
        return fallback;
    }

    return process.argv[index + 1];
}

function hasArg(name: string): boolean {
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
const textureOut = resolve(getArg("--texture-out") ?? "assets/resources/msdf/msdf-demo.png");
const jsonOut = resolve(
    getArg("--json-out") ?? "assets/resources/msdf/source-han-sans-cn-medium.json"
);
const fontSize = getArg("--font-size") ?? "56";
const textureSize = getArg("--texture-size") ?? "2048,2048";
const padding = getArg("--padding") ?? "4";
const distanceRange = getArg("--distance-range") ?? "6";
const fieldType = getArg("--field-type") ?? "msdf";

mkdirSync(dirname(textureOut), { recursive: true });
mkdirSync(dirname(jsonOut), { recursive: true });

const tmpRoot = mkdtempSync(join(tmpdir(), "laya-msdf-"));
const tempTextureBase = join(tmpRoot, basename(textureOut, extname(textureOut)));
const generatedJson = join(tmpRoot, `${basename(resolvedFont, extname(resolvedFont))}.json`);
const generatedTexture = `${tempTextureBase}.png`;

const args = [
    "--yes",
    "msdf-bmfont-xml",
    "--pot",
    "-f",
    "json",
    "-i",
    resolvedCharset,
    "-o",
    tempTextureBase,
    "-m",
    textureSize,
    "-s",
    fontSize,
    "-p",
    padding,
    "-r",
    distanceRange,
    "-t",
    fieldType,
    resolvedFont,
];

const isWindows = process.platform === "win32";
const npxCommand = isWindows ? (process.env.ComSpec ?? "cmd.exe") : "npx";
const npxArgs = isWindows ? ["/d", "/s", "/c", "npx", ...args] : args;

console.log(`Generating MSDF atlas from ${resolvedFont}`);

const result = spawnSync(npxCommand, npxArgs, {
    stdio: "inherit",
    shell: false,
});

if (result.error) {
    console.error(`Failed to launch ${npxCommand}:`, result.error);
    rmSync(tmpRoot, { recursive: true, force: true });
    process.exit(1);
}

if (result.status !== 0) {
    rmSync(tmpRoot, { recursive: true, force: true });
    process.exit(result.status ?? 1);
}

try {
    copyFileSync(generatedTexture, textureOut);
    copyFileSync(generatedJson, jsonOut);
    injectDecorationGlyph({ texturePath: textureOut, jsonPath: jsonOut });
} finally {
    rmSync(tmpRoot, { recursive: true, force: true });
}

console.log(`Wrote atlas: ${textureOut}`);
console.log(`Wrote font json: ${jsonOut}`);
