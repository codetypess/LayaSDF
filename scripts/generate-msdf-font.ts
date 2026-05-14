#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { copyFileSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { basename, dirname, extname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { injectDecorationGlyph } from "./msdf-decoration.js";

type FontGlyphMetrics = {
    left: number;
    top: number;
    right: number;
    bottom: number;
};

type FontGlyph = {
    char: string;
    x: number;
    y: number;
    width: number;
    height: number;
    xadvance: number;
    xoffset?: number;
    yoffset?: number;
    metrics?: FontGlyphMetrics;
};

type FontJson = {
    chars?: FontGlyph[];
};

type OpenTypeBoundingBox = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
};

type OpenTypePath = {
    getBoundingBox(): OpenTypeBoundingBox;
};

type OpenTypeGlyph = {
    getPath(x: number, y: number, fontSize: number): OpenTypePath;
};

type OpenTypeFont = {
    unitsPerEm: number;
    tables: {
        os2: {
            sTypoAscender: number;
        };
    };
    charToGlyph(char: string): OpenTypeGlyph;
};

type OpenTypeModule = {
    loadSync(path: string): OpenTypeFont;
};

type PngImage = {
    width: number;
    height: number;
    data: Uint8Array;
};

type PngModule = {
    PNG: {
        sync: {
            read(source: Buffer): PngImage;
        };
    };
};

const require = createRequire(import.meta.url);
const opentype = require("opentype.js") as OpenTypeModule;
const { PNG } = require("pngjs") as PngModule;
const METRIC_PRECISION = 4;
const DIGIT_CHARS = "0123456789";
const MSDF_VISIBLE_MIN = 5;
const MSDF_VISIBLE_MAX = 250;

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

function roundMetric(value: number): number {
    return Math.round(value * 10 ** METRIC_PRECISION) / 10 ** METRIC_PRECISION;
}

function injectGlyphMetrics(
    fontPath: string,
    jsonPath: string,
    fontSize: number,
    distanceRange: number
): void {
    const fontJson = JSON.parse(readFileSync(jsonPath, "utf8")) as FontJson;
    const glyphs = fontJson.chars;
    if (!Array.isArray(glyphs) || glyphs.length === 0) {
        return;
    }

    const font = opentype.loadSync(fontPath);
    const baseline = font.tables.os2.sTypoAscender * (fontSize / font.unitsPerEm);
    const pad = Math.floor(distanceRange / 2);

    for (const glyph of glyphs) {
        if (!glyph.char || glyph.width <= 0 || glyph.height <= 0) {
            continue;
        }

        const bounds = font.charToGlyph(glyph.char).getPath(0, 0, fontSize).getBoundingBox();
        if (
            !Number.isFinite(bounds.x1) ||
            !Number.isFinite(bounds.y1) ||
            !Number.isFinite(bounds.x2) ||
            !Number.isFinite(bounds.y2)
        ) {
            continue;
        }

        glyph.metrics = {
            left: roundMetric(bounds.x1 - pad),
            top: roundMetric(bounds.y1 - pad + baseline),
            right: roundMetric(bounds.x2 + pad),
            bottom: roundMetric(bounds.y2 + pad + baseline),
        };
    }

    writeFileSync(jsonPath, `${JSON.stringify(fontJson, null, 4)}\n`);
}

function median3(a: number, b: number, c: number): number {
    if (a > b) {
        [a, b] = [b, a];
    }
    if (b > c) {
        [b, c] = [c, b];
    }
    if (a > b) {
        [a, b] = [b, a];
    }

    return b;
}

function detectGlyphVisibleRowRange(
    atlas: PngImage,
    glyph: FontGlyph
): { firstRow: number; lastRow: number } | null {
    let firstRow = -1;
    let lastRow = -1;

    for (let row = 0; row < glyph.height; row++) {
        let hasVisiblePixel = false;

        for (let col = 0; col < glyph.width; col++) {
            const pixelOffset = ((glyph.y + row) * atlas.width + (glyph.x + col)) * 4;
            const distance = median3(
                atlas.data[pixelOffset],
                atlas.data[pixelOffset + 1],
                atlas.data[pixelOffset + 2]
            );

            if (distance > MSDF_VISIBLE_MIN && distance < MSDF_VISIBLE_MAX) {
                hasVisiblePixel = true;
                break;
            }
        }

        if (!hasVisiblePixel) {
            continue;
        }

        if (firstRow < 0) {
            firstRow = row;
        }
        lastRow = row;
    }

    if (firstRow < 0 || lastRow < firstRow) {
        return null;
    }

    return { firstRow, lastRow };
}

function normalizeDigitRasterMetrics(texturePath: string, jsonPath: string): void {
    const fontJson = JSON.parse(readFileSync(jsonPath, "utf8")) as FontJson;
    const glyphs = fontJson.chars;
    if (!Array.isArray(glyphs) || glyphs.length === 0) {
        return;
    }

    const atlas = PNG.sync.read(readFileSync(texturePath));

    for (const glyph of glyphs) {
        if (!DIGIT_CHARS.includes(glyph.char) || glyph.width <= 0 || glyph.height <= 0) {
            continue;
        }

        const visibleRows = detectGlyphVisibleRowRange(atlas, glyph);
        if (!visibleRows) {
            continue;
        }

        const nextY = glyph.y + visibleRows.firstRow;
        const nextHeight = visibleRows.lastRow - visibleRows.firstRow + 1;

        if (nextY !== glyph.y || nextHeight !== glyph.height) {
            glyph.y = nextY;
            glyph.height = nextHeight;
        }

        if (glyph.metrics && typeof glyph.yoffset === "number" && Number.isFinite(glyph.yoffset)) {
            const yoffset = glyph.yoffset;
            glyph.metrics.top = yoffset;
            glyph.metrics.bottom = yoffset + glyph.height;
        }
    }

    writeFileSync(jsonPath, `${JSON.stringify(fontJson, null, 4)}\n`);
}

function finalizeGlyphMetrics(jsonPath: string): void {
    const fontJson = JSON.parse(readFileSync(jsonPath, "utf8")) as FontJson;
    const glyphs = fontJson.chars;
    if (!Array.isArray(glyphs) || glyphs.length === 0) {
        return;
    }

    for (const glyph of glyphs) {
        const xoffset =
            typeof glyph.xoffset === "number" && Number.isFinite(glyph.xoffset)
                ? glyph.xoffset
                : 0;
        const yoffset =
            typeof glyph.yoffset === "number" && Number.isFinite(glyph.yoffset)
                ? glyph.yoffset
                : 0;

        glyph.metrics ??= {
            left: xoffset,
            top: yoffset,
            right: xoffset + glyph.width,
            bottom: yoffset + glyph.height,
        };

        delete glyph.xoffset;
        delete glyph.yoffset;
    }

    writeFileSync(jsonPath, `${JSON.stringify(fontJson, null, 4)}\n`);
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
const fontSizeArg = getArg("--font-size") ?? "56";
const textureSize = getArg("--texture-size") ?? "2048,2048";
const padding = getArg("--padding") ?? "4";
const distanceRangeArg = getArg("--distance-range") ?? "6";
const fieldType = getArg("--field-type") ?? "msdf";
const parsedFontSize = Number(fontSizeArg);
const parsedDistanceRange = Number(distanceRangeArg);
const fontSize = Number.isFinite(parsedFontSize) ? parsedFontSize : 56;
const distanceRange = Number.isFinite(parsedDistanceRange) ? parsedDistanceRange : 6;

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
    String(fontSize),
    "-p",
    padding,
    "-r",
    String(distanceRange),
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
    injectGlyphMetrics(resolvedFont, jsonOut, fontSize, distanceRange);
    normalizeDigitRasterMetrics(textureOut, jsonOut);
    injectDecorationGlyph({ texturePath: textureOut, jsonPath: jsonOut });
    finalizeGlyphMetrics(jsonOut);
} finally {
    rmSync(tmpRoot, { recursive: true, force: true });
}

console.log(`Wrote atlas: ${textureOut}`);
console.log(`Wrote font json: ${jsonOut}`);
