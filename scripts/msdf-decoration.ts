#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

type Rect = {
    x: number;
    y: number;
    width: number;
    height: number;
};

type FontGlyph = Rect & {
    id?: number;
    index?: number;
    char: string;
    xadvance: number;
    metrics?: {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
    chnl?: number;
    page?: number;
};

type FontJson = {
    chars?: FontGlyph[];
    common?: {
        lineHeight?: number;
        scaleW?: number;
        scaleH?: number;
    };
    info?: {
        charset?: string[];
    };
};

type PngImage = {
    width: number;
    height: number;
    data: Uint8Array;
};

type PngModule = {
    PNG: {
        new (options: { width: number; height: number }): PngImage;
        sync: {
            read(source: Buffer): PngImage;
            write(image: PngImage): Buffer;
        };
    };
};

type DecorationGlyphLayout = {
    width: number;
    height: number;
    left: number;
    top: number;
    xadvance: number;
};

type DecorationGlyphInput = {
    texturePath: string;
    jsonPath: string;
};

const require = createRequire(import.meta.url);
const { PNG } = require("pngjs") as PngModule;

export const DECORATION_GLYPH_CODEPOINT = 0xe000;
export const DECORATION_GLYPH_CHAR = String.fromCodePoint(DECORATION_GLYPH_CODEPOINT);

const CELL_PADDING = 2;
const GLYPH_CHANNEL_MASK = 15;
const DECORATION_EDGE_BLEED = 2;

function getArg(name: string, fallback?: string): string | undefined {
    const index = process.argv.indexOf(name);
    if (index < 0 || index + 1 >= process.argv.length) {
        return fallback;
    }

    return process.argv[index + 1];
}

function printHelp(): void {
    console.log(`Usage:
  tsx scripts/msdf-decoration.ts --texture <png> --json <json>

Inject a custom decoration glyph into an existing MSDF atlas/json pair.
`);
}

function copyPng(source: PngImage, target: PngImage): void {
    const copyWidth = Math.min(source.width, target.width);
    const copyHeight = Math.min(source.height, target.height);
    const sourceStride = source.width * 4;
    const targetStride = target.width * 4;
    const copyStride = copyWidth * 4;

    for (let y = 0; y < copyHeight; y++) {
        const sourceOffset = y * sourceStride;
        const targetOffset = y * targetStride;
        target.data.set(
            source.data.subarray(sourceOffset, sourceOffset + copyStride),
            targetOffset
        );
    }
}

function fillRect(
    image: PngImage,
    x: number,
    y: number,
    width: number,
    height: number,
    r: number,
    g: number,
    b: number,
    a: number
): void {
    const startX = Math.max(0, x);
    const startY = Math.max(0, y);
    const endX = Math.min(image.width, x + width);
    const endY = Math.min(image.height, y + height);

    if (endX <= startX || endY <= startY) {
        return;
    }

    for (let row = startY; row < endY; row++) {
        for (let col = startX; col < endX; col++) {
            const offset = (row * image.width + col) * 4;
            image.data[offset] = r;
            image.data[offset + 1] = g;
            image.data[offset + 2] = b;
            image.data[offset + 3] = a;
        }
    }
}

function intersects(a: Rect, b: Rect): boolean {
    return (
        a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
    );
}

function findReusableSlot(
    glyphs: FontGlyph[],
    atlasWidth: number,
    atlasHeight: number,
    glyphWidth: number,
    glyphHeight: number
): { x: number; y: number } | null {
    const blocked = glyphs.map((glyph) => ({
        x: Math.max(0, glyph.x - CELL_PADDING),
        y: Math.max(0, glyph.y - CELL_PADDING),
        width: glyph.width + CELL_PADDING * 2,
        height: glyph.height + CELL_PADDING * 2,
    }));

    const maxX = Math.max(CELL_PADDING, atlasWidth - glyphWidth - CELL_PADDING);
    const maxY = Math.max(CELL_PADDING, atlasHeight - glyphHeight - CELL_PADDING);

    for (let y = maxY; y >= CELL_PADDING; y--) {
        for (let x = maxX; x >= CELL_PADDING; x--) {
            const candidate = { x, y, width: glyphWidth, height: glyphHeight };
            if (!blocked.some((rect) => intersects(candidate, rect))) {
                return { x, y };
            }
        }
    }

    return null;
}

function getDecorationGlyphMetrics(fontJson: FontJson): DecorationGlyphLayout {
    const lineHeight = Math.max(1, Number(fontJson.common?.lineHeight) || 25);
    const overhang = Math.max(1, Math.round(lineHeight * 0.08));
    const height = 1;
    const xadvance = Math.max(overhang * 2 + 1, Math.round(lineHeight * 0.56));
    const width = xadvance + overhang * 2;
    const centerY = lineHeight - Math.max(1, Math.round(lineHeight * 0.04));
    const top = Math.max(0, Math.round(centerY - height * 0.5));

    return {
        width,
        height,
        left: -overhang,
        top,
        xadvance,
    };
}

export function injectDecorationGlyph({ texturePath, jsonPath }: DecorationGlyphInput): FontGlyph {
    const resolvedTexture = resolve(texturePath);
    const resolvedJson = resolve(jsonPath);
    const atlas = PNG.sync.read(readFileSync(resolvedTexture));
    const fontJson = JSON.parse(readFileSync(resolvedJson, "utf8")) as FontJson;
    const glyphMetrics = getDecorationGlyphMetrics(fontJson);
    const sourceGlyphs = Array.isArray(fontJson.chars) ? fontJson.chars : [];
    const existingGlyph =
        sourceGlyphs.find((glyph) => glyph.char === DECORATION_GLYPH_CHAR) ?? null;
    const contentGlyphs = sourceGlyphs.filter((glyph) => glyph.char !== DECORATION_GLYPH_CHAR);

    const nextIndex =
        existingGlyph && typeof existingGlyph.index === "number"
            ? existingGlyph.index
            : Math.max(-1, ...sourceGlyphs.map((glyph) => Number(glyph.index) || 0)) + 1;

    let contentWidth = 1;
    let contentHeight = 1;
    for (const glyph of contentGlyphs) {
        contentWidth = Math.max(contentWidth, glyph.x + glyph.width);
        contentHeight = Math.max(contentHeight, glyph.y + glyph.height);
    }

    const searchWidth = Math.max(contentWidth, atlas.width, Number(fontJson.common?.scaleW) || 0);
    const reusableSlot = findReusableSlot(
        contentGlyphs,
        searchWidth,
        contentHeight,
        glyphMetrics.width,
        glyphMetrics.height
    );
    const glyphX = reusableSlot?.x ?? CELL_PADDING;
    const glyphY = reusableSlot?.y ?? contentHeight + CELL_PADDING;
    const atlasWidth = reusableSlot
        ? searchWidth
        : Math.max(searchWidth, glyphX + glyphMetrics.width);
    const atlasHeight = reusableSlot ? contentHeight : glyphY + glyphMetrics.height + CELL_PADDING;

    const output = new PNG({ width: atlasWidth, height: atlasHeight });
    copyPng(atlas, output);

    if (
        existingGlyph &&
        existingGlyph.width > 0 &&
        existingGlyph.height > 0 &&
        existingGlyph.x < output.width &&
        existingGlyph.y < output.height
    ) {
        fillRect(
            output,
            existingGlyph.x - DECORATION_EDGE_BLEED,
            existingGlyph.y,
            existingGlyph.width + DECORATION_EDGE_BLEED * 2,
            existingGlyph.height,
            0,
            0,
            0,
            0
        );
    }

    fillRect(
        output,
        glyphX - DECORATION_EDGE_BLEED,
        glyphY,
        glyphMetrics.width + DECORATION_EDGE_BLEED * 2,
        glyphMetrics.height,
        255,
        255,
        255,
        255
    );
    writeFileSync(resolvedTexture, Uint8Array.from(PNG.sync.write(output)));

    const nextGlyph: FontGlyph = {
        id: DECORATION_GLYPH_CODEPOINT,
        index: nextIndex,
        char: DECORATION_GLYPH_CHAR,
        width: glyphMetrics.width,
        height: glyphMetrics.height,
        xadvance: glyphMetrics.xadvance,
        metrics: {
            left: glyphMetrics.left,
            top: glyphMetrics.top,
            right: glyphMetrics.left + glyphMetrics.width,
            bottom: glyphMetrics.top + glyphMetrics.height,
        },
        chnl: GLYPH_CHANNEL_MASK,
        x: glyphX,
        y: glyphY,
        page: 0,
    };

    fontJson.chars = contentGlyphs;
    fontJson.chars.push(nextGlyph);
    fontJson.common ??= {};
    fontJson.common.scaleW = atlasWidth;
    fontJson.common.scaleH = atlasHeight;

    if (
        Array.isArray(fontJson.info?.charset) &&
        !fontJson.info.charset.includes(DECORATION_GLYPH_CHAR)
    ) {
        fontJson.info.charset.push(DECORATION_GLYPH_CHAR);
    }

    writeFileSync(resolvedJson, `${JSON.stringify(fontJson, null, 4)}\n`);
    return nextGlyph;
}

function runCli(): void {
    if (process.argv.includes("--help")) {
        printHelp();
        process.exit(0);
    }

    const texturePath = getArg("--texture");
    const jsonPath = getArg("--json");

    if (!texturePath || !jsonPath) {
        printHelp();
        process.exit(1);
    }

    const glyph = injectDecorationGlyph({ texturePath, jsonPath });
    const code = `U+${DECORATION_GLYPH_CODEPOINT.toString(16).toUpperCase()}`;
    console.log(`Injected ${code} into ${resolve(texturePath)} at (${glyph.x}, ${glyph.y}).`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    runCli();
}
