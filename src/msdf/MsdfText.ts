type MsdfGlyph = {
    id: number;
    char: string;
    width: number;
    height: number;
    xoffset: number;
    yoffset: number;
    xadvance: number;
    x: number;
    y: number;
    page: number;
};

type MsdfKerning = {
    first: number;
    second: number;
    amount: number;
};

type MsdfFontJson = {
    pages: string[];
    chars: MsdfGlyph[];
    info: {
        size: number;
    };
    common: {
        lineHeight: number;
        scaleW: number;
        scaleH: number;
    };
    distanceField?: {
        distanceRange: number;
    };
    kernings?: MsdfKerning[];
};

type MsdfLayout = {
    vertices: Float32Array;
    uvs: Float32Array;
    indices: Uint16Array;
    quadKinds: Uint8Array;
    width: number;
    height: number;
};

type MsdfDrawBatch = {
    vertices: Float32Array;
    uvs: Float32Array;
    indices: Uint16Array;
    fillColors: Uint32Array;
    outlineColors: Uint32Array;
    glowColors: Uint32Array;
    shadowColors: Uint32Array;
    packedParamsA: Uint32Array;
    packedParamsB: Uint32Array;
    textColor: Laya.Vector4;
    outlineColor: Laya.Vector4;
    outlineWidth: number;
    glowColor: Laya.Vector4;
    glowSize: number;
    shadowColor: Laya.Vector4;
    shadowOffsetX: number;
    shadowOffsetY: number;
    shadowBlur: number;
};

type MsdfDrawBatchGroup = {
    vertexChunks: Float32Array[];
    uvChunks: Float32Array[];
    indexChunks: Uint16Array[];
    fillColorChunks: Uint32Array[];
    outlineColorChunks: Uint32Array[];
    glowColorChunks: Uint32Array[];
    shadowColorChunks: Uint32Array[];
    packedParamAChunks: Uint32Array[];
    packedParamBChunks: Uint32Array[];
    vertexFloatCount: number;
    uvFloatCount: number;
    indexCount: number;
    vertexCount: number;
};

type MsdfTextOptions = {
    text?: string;
    fontSize?: number;
    letterSpacing?: number;
    textColor?: Laya.Vector4;
    underlineColor?: Laya.Vector4 | null;
    strikethroughColor?: Laya.Vector4 | null;
    outlineColor?: Laya.Vector4;
    outlineWidth?: number;
    glowColor?: Laya.Vector4;
    glowSize?: number;
    shadowColor?: Laya.Vector4;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    shadowBlur?: number;
    underline?: boolean;
    strikethrough?: boolean;
};

type MsdfDecorationOptions = {
    underline?: boolean;
    strikethrough?: boolean;
};

type MsdfDecorationRenderMetrics = {
    leftOverhang: number;
    rightOverhang: number;
    underlineTop: number;
    underlineBottom: number;
    thickness: number;
};

export type MsdfOverflow = "visible" | "hidden" | "scroll" | "shrink" | "ellipsis";
export type MsdfTextLineMetric = {
    x: number;
    y: number;
    width: number;
    height: number;
    align: string;
    text: string;
};

export type MsdfRichTextStyle = {
    fontSize: number;
    textColor: Laya.Vector4;
    textColorCss: string;
    underlineColor?: Laya.Vector4 | null;
    underlineColorCss?: string | null;
    strikethroughColor?: Laya.Vector4 | null;
    strikethroughColorCss?: string | null;
    outlineColor: Laya.Vector4;
    outlineColorCss: string;
    outlineWidth: number;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    align?: string | null;
    alignItems?: string | null;
};

export type MsdfRichTextRun = {
    text: string;
    style: MsdfRichTextStyle;
};

type MsdfRichTextCommand = {
    text: string;
    style: MsdfRichTextStyle;
    x: number;
    y: number;
    width: number;
    height: number;
    next: MsdfRichTextCommand | null;
    prev: MsdfRichTextCommand | null;
};

type MsdfRichTextLine = {
    x: number;
    y: number;
    width: number;
    height: number;
    cmd: MsdfRichTextCommand | null;
    align: string;
    alignItems: string;
};

const DEFAULT_TEXT_COLOR = new Laya.Vector4(1, 1, 1, 1);
const DEFAULT_OUTLINE_COLOR = new Laya.Vector4(0, 0, 0, 1);
const DEFAULT_GLOW_COLOR = new Laya.Vector4(1, 1, 1, 0);
const DEFAULT_SHADOW_COLOR = new Laya.Vector4(0, 0, 0, 0);
const ITALIC_SKEW_DEGREES = 12;
const BOLD_SCALE_X = 1.04;
const LARGE_DECORATION_SCALE_THRESHOLD = 1.75;
const LARGE_DECORATION_THICKNESS_BOOST = 1;
const UNDERLINE_EXTRA_OFFSET_MIN = 0.75;
const UNDERLINE_EXTRA_OFFSET_SCALE = 0.55;
// Keep this in sync with scripts/msdf-decoration.mjs.
const DECORATION_SOURCE_CHAR_CODE = 0xe000;
const DECORATION_SOURCE_CHAR = String.fromCodePoint(DECORATION_SOURCE_CHAR_CODE);
const emojiTest = /[\uD800-\uDBFF][\uDC00-\uDFFF]/;
const wordBoundaryTest = /[a-zA-Z0-9\!-\+\/_]+$/;
const punctuationChars = new Set(Array.from(".,，。、!！；;”’)）]】}》").map(char => char.charCodeAt(0)));
const maxWordLength = 20;
const KERNING_KEY_MULTIPLIER = 0x110000;
const PACKED_EFFECT_SIZE_MAX = 32;
const PACKED_SHADOW_OFFSET_SCALE = 4;
const EFFECT_FLAG_OUTLINE = 1;
const EFFECT_FLAG_GLOW = 2;
const EFFECT_FLAG_SHADOW = 4;
const ELLIPSIS_TEXT = "…";
const QUAD_KIND_TEXT = 0;
const QUAD_KIND_UNDERLINE = 1;
const QUAD_KIND_STRIKETHROUGH = 2;

function createEmptyLayout(): MsdfLayout {
    return {
        vertices: new Float32Array(0),
        uvs: new Float32Array(0),
        indices: new Uint16Array(0),
        quadKinds: new Uint8Array(0),
        width: 0,
        height: 0
    };
}

function createBatchGroup(batch: MsdfDrawBatch): MsdfDrawBatchGroup {
    return {
        vertexChunks: [batch.vertices],
        uvChunks: [batch.uvs],
        indexChunks: [batch.indices],
        fillColorChunks: [batch.fillColors],
        outlineColorChunks: [batch.outlineColors],
        glowColorChunks: [batch.glowColors],
        shadowColorChunks: [batch.shadowColors],
        packedParamAChunks: [batch.packedParamsA],
        packedParamBChunks: [batch.packedParamsB],
        vertexFloatCount: batch.vertices.length,
        uvFloatCount: batch.uvs.length,
        indexCount: batch.indices.length,
        vertexCount: batch.vertices.length >> 1
    };
}

function finalizeBatchGroup(group: MsdfDrawBatchGroup): MsdfDrawBatch {
    if (group.vertexChunks.length === 1) {
        return {
            vertices: group.vertexChunks[0],
            uvs: group.uvChunks[0],
            indices: group.indexChunks[0],
            fillColors: group.fillColorChunks[0],
            outlineColors: group.outlineColorChunks[0],
            glowColors: group.glowColorChunks[0],
            shadowColors: group.shadowColorChunks[0],
            packedParamsA: group.packedParamAChunks[0],
            packedParamsB: group.packedParamBChunks[0],
            textColor: DEFAULT_TEXT_COLOR,
            outlineColor: DEFAULT_OUTLINE_COLOR,
            outlineWidth: 0,
            glowColor: DEFAULT_GLOW_COLOR,
            glowSize: 0,
            shadowColor: DEFAULT_SHADOW_COLOR,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowBlur: 0
        };
    }

    const vertices = new Float32Array(group.vertexFloatCount);
    const uvs = new Float32Array(group.uvFloatCount);
    const indices = new Uint16Array(group.indexCount);
    const fillColors = new Uint32Array(group.vertexCount);
    const outlineColors = new Uint32Array(group.vertexCount);
    const glowColors = new Uint32Array(group.vertexCount);
    const shadowColors = new Uint32Array(group.vertexCount);
    const packedParamsA = new Uint32Array(group.vertexCount);
    const packedParamsB = new Uint32Array(group.vertexCount);
    let vertexFloatOffset = 0;
    let uvFloatOffset = 0;
    let indexOffset = 0;
    let vertexBase = 0;
    let styleOffset = 0;

    for (let i = 0; i < group.vertexChunks.length; i++) {
        const vertexChunk = group.vertexChunks[i];
        const uvChunk = group.uvChunks[i];
        const indexChunk = group.indexChunks[i];
        const fillColorChunk = group.fillColorChunks[i];
        const outlineColorChunk = group.outlineColorChunks[i];
        const glowColorChunk = group.glowColorChunks[i];
        const shadowColorChunk = group.shadowColorChunks[i];
        const packedParamAChunk = group.packedParamAChunks[i];
        const packedParamBChunk = group.packedParamBChunks[i];

        vertices.set(vertexChunk, vertexFloatOffset);
        uvs.set(uvChunk, uvFloatOffset);
        fillColors.set(fillColorChunk, styleOffset);
        outlineColors.set(outlineColorChunk, styleOffset);
        glowColors.set(glowColorChunk, styleOffset);
        shadowColors.set(shadowColorChunk, styleOffset);
        packedParamsA.set(packedParamAChunk, styleOffset);
        packedParamsB.set(packedParamBChunk, styleOffset);

        for (let j = 0; j < indexChunk.length; j++) {
            indices[indexOffset + j] = indexChunk[j] + vertexBase;
        }

        vertexFloatOffset += vertexChunk.length;
        uvFloatOffset += uvChunk.length;
        indexOffset += indexChunk.length;
        vertexBase += vertexChunk.length >> 1;
        styleOffset += fillColorChunk.length;
    }

    return {
        vertices,
        uvs,
        indices,
        fillColors,
        outlineColors,
        glowColors,
        shadowColors,
        packedParamsA,
        packedParamsB,
        textColor: DEFAULT_TEXT_COLOR,
        outlineColor: DEFAULT_OUTLINE_COLOR,
        outlineWidth: 0,
        glowColor: DEFAULT_GLOW_COLOR,
        glowSize: 0,
        shadowColor: DEFAULT_SHADOW_COLOR,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowBlur: 0
    };
}

function appendBatchGroup(groups: MsdfDrawBatch[], pendingGroup: MsdfDrawBatchGroup | null): MsdfDrawBatchGroup | null {
    if (pendingGroup) {
        groups.push(finalizeBatchGroup(pendingGroup));
    }

    return null;
}

function canMergeBatchGroup(group: MsdfDrawBatchGroup, batch: MsdfDrawBatch): boolean {
    return group.vertexCount + (batch.vertices.length >> 1) <= 65535;
}

function mergeBatchGroup(group: MsdfDrawBatchGroup, batch: MsdfDrawBatch): void {
    group.vertexChunks.push(batch.vertices);
    group.uvChunks.push(batch.uvs);
    group.indexChunks.push(batch.indices);
    group.fillColorChunks.push(batch.fillColors);
    group.outlineColorChunks.push(batch.outlineColors);
    group.glowColorChunks.push(batch.glowColors);
    group.shadowColorChunks.push(batch.shadowColors);
    group.packedParamAChunks.push(batch.packedParamsA);
    group.packedParamBChunks.push(batch.packedParamsB);
    group.vertexFloatCount += batch.vertices.length;
    group.uvFloatCount += batch.uvs.length;
    group.indexCount += batch.indices.length;
    group.vertexCount += batch.vertices.length >> 1;
}

function styleScaleX(style: MsdfRichTextStyle): number {
    return style.bold ? BOLD_SCALE_X : 1;
}

function styleSkewExtra(height: number, style: MsdfRichTextStyle): number {
    if (!style.italic || height <= 0) {
        return 0;
    }

    return Math.tan(ITALIC_SKEW_DEGREES * Math.PI / 180) * height;
}

function alignItemsOffset(lineHeight: number, cmdHeight: number, alignItems: string | null | undefined): number {
    if (alignItems === "bottom") {
        return Math.floor(lineHeight - cmdHeight);
    }

    if (alignItems === "middle") {
        return Math.floor((lineHeight - cmdHeight) * 0.5);
    }

    return 0;
}

function packVertexColor(color: Laya.Vector4): number {
    const r = Math.max(0, Math.min(255, Math.round(color.x * 255)));
    const g = Math.max(0, Math.min(255, Math.round(color.y * 255)));
    const b = Math.max(0, Math.min(255, Math.round(color.z * 255)));
    const a = Math.max(0, Math.min(255, Math.round(color.w * 255)));
    return (r | (g << 8) | (b << 16) | (a << 24)) >>> 0;
}

function createVertexColorArray(color: Laya.Vector4, vertexCount: number): Uint32Array {
    const values = new Uint32Array(vertexCount);
    values.fill(packVertexColor(color));
    return values;
}

function createLayoutColorArray(
    layout: MsdfLayout,
    defaultColor: Laya.Vector4,
    underlineColor?: Laya.Vector4 | null,
    strikethroughColor?: Laya.Vector4 | null
): Uint32Array {
    const vertexCount = layout.vertices.length >> 1;
    if (vertexCount === 0) {
        return new Uint32Array(0);
    }

    const values = new Uint32Array(vertexCount);
    const defaultPacked = packVertexColor(defaultColor);
    const underlinePacked = packVertexColor(underlineColor ?? defaultColor);
    const strikethroughPacked = packVertexColor(strikethroughColor ?? defaultColor);

    for (let i = 0; i < layout.quadKinds.length; i++) {
        const vertexOffset = i * 4;
        const packedColor = layout.quadKinds[i] === QUAD_KIND_UNDERLINE
            ? underlinePacked
            : layout.quadKinds[i] === QUAD_KIND_STRIKETHROUGH
                ? strikethroughPacked
                : defaultPacked;

        values[vertexOffset] = packedColor;
        values[vertexOffset + 1] = packedColor;
        values[vertexOffset + 2] = packedColor;
        values[vertexOffset + 3] = packedColor;
    }

    return values;
}

function packNormalizedByte(value: number, maxValue: number): number {
    if (maxValue <= 0) {
        return 0;
    }

    return Math.max(0, Math.min(255, Math.round(value / maxValue * 255)));
}

function packSignedByte(value: number): number {
    const rounded = Math.max(-128, Math.min(127, Math.round(value)));
    return rounded & 0xff;
}

function effectFlags(outlineWidth: number, outlineColor: Laya.Vector4, glowSize: number, glowColor: Laya.Vector4, shadowOffsetX: number, shadowOffsetY: number, shadowBlur: number, shadowColor: Laya.Vector4): number {
    let flags = 0;

    if (outlineWidth > 0 && outlineColor.w > 0) {
        flags |= EFFECT_FLAG_OUTLINE;
    }

    if (glowSize > 0 && glowColor.w > 0) {
        flags |= EFFECT_FLAG_GLOW;
    }

    if (shadowColor.w > 0 && (shadowBlur > 0 || shadowOffsetX !== 0 || shadowOffsetY !== 0)) {
        flags |= EFFECT_FLAG_SHADOW;
    }

    return flags;
}

function createPackedParamsAArray(outlineWidth: number, glowSize: number, shadowBlur: number, vertexCount: number): Uint32Array {
    const values = new Uint32Array(vertexCount);
    const packed = (
        packNormalizedByte(outlineWidth, PACKED_EFFECT_SIZE_MAX)
        | (packNormalizedByte(glowSize, PACKED_EFFECT_SIZE_MAX) << 8)
        | (packNormalizedByte(shadowBlur, PACKED_EFFECT_SIZE_MAX) << 16)
    ) >>> 0;
    values.fill(packed);
    return values;
}

function createPackedParamsBArray(shadowOffsetX: number, shadowOffsetY: number, flags: number, vertexCount: number): Uint32Array {
    const values = new Uint32Array(vertexCount);
    const packed = (
        packSignedByte(shadowOffsetX * PACKED_SHADOW_OFFSET_SCALE)
        | (packSignedByte(shadowOffsetY * PACKED_SHADOW_OFFSET_SCALE) << 8)
        | ((flags & 0xff) << 16)
    ) >>> 0;
    values.fill(packed);
    return values;
}

function isHighSurrogate(code: number): boolean {
    return code >= 0xd800 && code <= 0xdbff;
}

function isLowSurrogate(code: number): boolean {
    return code >= 0xdc00 && code <= 0xdfff;
}

class MsdfFontRenderState {
    readonly material: Laya.Material;

    constructor(font: MsdfBitmapFont) {
        this.material = new Laya.Material();
        applyMaterialBase(this.material, font);
    }
}

function applyMaterialBase(material: Laya.Material, font: MsdfBitmapFont): void {
    material.setShaderName("MsdfTextShader");
    material.setVector2("u_AtlasSize", new Laya.Vector2(font.atlasWidth, font.atlasHeight));
    material.setFloat("u_DistanceRange", font.distanceRange);
}

function kerningKey(first: number, second: number): number {
    return first * KERNING_KEY_MULTIPLIER + second;
}

function normalizeFontJson(raw: any): MsdfFontJson {
    let data = raw;

    if (data && typeof data === "object" && "data" in data) {
        data = data.data;
    }

    if (typeof data === "string") {
        data = JSON.parse(data);
    }

    return data as MsdfFontJson;
}

export function rgba(r: number, g: number, b: number, a: number = 1): Laya.Vector4 {
    return new Laya.Vector4(r, g, b, a);
}

export class MsdfBitmapFont {
    readonly lineHeight: number;
    readonly atlasWidth: number;
    readonly atlasHeight: number;
    readonly distanceRange: number;

    private readonly glyphs = new Map<string, MsdfGlyph>();
    private readonly kernings = new Map<number, number>();
    private readonly decorationGlyph: MsdfGlyph | null = null;
    private _renderState: MsdfFontRenderState | null = null;
    private _missingDecorationGlyphReported = false;

    static fromResources(texture: Laya.Texture, rawData: any): MsdfBitmapFont {
        return new MsdfBitmapFont(texture, normalizeFontJson(rawData));
    }

    static async load(textureUrl: string, jsonUrl: string): Promise<MsdfBitmapFont> {
        const resources = await Laya.loader.load([
            { url: textureUrl, type: Laya.Loader.IMAGE },
            { url: jsonUrl, type: Laya.Loader.JSON }
        ]);

        if (!Array.isArray(resources) || !resources[0]) {
            throw new Error(`Failed to load MSDF texture: ${textureUrl}`);
        }

        return MsdfBitmapFont.fromResources(resources[0] as Laya.Texture, resources[1]);
    }

    constructor(readonly texture: Laya.Texture, readonly data: MsdfFontJson) {
        if (!data || !data.common || !Array.isArray(data.chars)) {
            throw new Error(`Invalid MSDF font data: ${JSON.stringify(data)}`);
        }

        this.lineHeight = data.common.lineHeight;
        this.atlasWidth = data.common.scaleW;
        this.atlasHeight = data.common.scaleH;
        this.distanceRange = data.distanceField?.distanceRange ?? 4;

        for (const glyph of data.chars) {
            this.glyphs.set(glyph.char, glyph);
        }

        this.decorationGlyph = this.glyphs.get(DECORATION_SOURCE_CHAR) ?? null;

        for (const kerning of data.kernings ?? []) {
            this.kernings.set(kerningKey(kerning.first, kerning.second), kerning.amount);
        }
    }

    get renderState(): MsdfFontRenderState {
        if (!this._renderState) {
            this._renderState = new MsdfFontRenderState(this);
        }

        return this._renderState;
    }

    createText(options: MsdfTextOptions): MsdfTextSprite {
        return new MsdfTextSprite(this, options);
    }

    getLineHeight(fontSize: number): number {
        return this.lineHeight * (fontSize / this.lineHeight);
    }

    measureTextWidth(text: string, fontSize: number, letterSpacing: number = 0): number {
        const scale = fontSize / this.lineHeight;
        const scaledLetterSpacing = letterSpacing * scale;
        let penX = 0;
        let widestLine = 0;
        let previousCode = -1;

        for (const char of text) {
            if (char === "\n") {
                widestLine = Math.max(widestLine, penX);
                penX = 0;
                previousCode = -1;
                continue;
            }

            const glyph = this.glyphs.get(char);
            const kern = previousCode >= 0 && glyph
                ? (this.kernings.get(kerningKey(previousCode, glyph.id)) ?? 0) * scale
                : 0;

            penX += (glyph ? glyph.xadvance * scale : fontSize * 0.5) + kern + scaledLetterSpacing;
            previousCode = glyph?.id ?? -1;
        }

        return Math.max(widestLine, penX);
    }

    getDecorationRenderMetrics(fontSize: number): MsdfDecorationRenderMetrics | null {
        if (!this.decorationGlyph) {
            return null;
        }

        const scale = fontSize / this.lineHeight;
        const baseThickness = Math.max(1, Math.ceil(this.decorationGlyph.height * scale));
        const thickness = scale >= LARGE_DECORATION_SCALE_THRESHOLD
            ? baseThickness + LARGE_DECORATION_THICKNESS_BOOST
            : baseThickness;
        const leftOverhang = Math.min(0, this.decorationGlyph.xoffset * scale);
        const rightOverhang = Math.max(0, (this.decorationGlyph.xoffset + this.decorationGlyph.width - this.decorationGlyph.xadvance) * scale);
        const underlineOffset = Math.max(UNDERLINE_EXTRA_OFFSET_MIN, scale * UNDERLINE_EXTRA_OFFSET_SCALE);
        const underlineTop = Math.round(this.decorationGlyph.yoffset * scale + underlineOffset);

        return {
            leftOverhang,
            rightOverhang,
            underlineTop,
            underlineBottom: underlineTop + thickness,
            thickness
        };
    }

    private reportMissingDecorationGlyph(): void {
        if (this._missingDecorationGlyphReported) {
            return;
        }

        this._missingDecorationGlyphReported = true;
        console.error(`[MsdfBitmapFont] decoration glyph U+${DECORATION_SOURCE_CHAR_CODE.toString(16).toUpperCase()} is missing from the atlas; underline/strikethrough will not render.`);
    }

    wrapText(text: string, fontSize: number, maxWidth: number, letterSpacing: number = 0): string {
        if (maxWidth <= 0) {
            return text;
        }

        const scale = fontSize / this.lineHeight;
        const scaledLetterSpacing = letterSpacing * scale;
        let lineWidth = 0;
        let previousCode = -1;
        let result = "";

        for (const char of text) {
            if (char === "\n") {
                result += char;
                lineWidth = 0;
                previousCode = -1;
                continue;
            }

            const glyph = this.glyphs.get(char);
            const advance = glyph ? glyph.xadvance * scale : fontSize * 0.5;
            const kern = previousCode >= 0 && glyph
                ? (this.kernings.get(kerningKey(previousCode, glyph.id)) ?? 0) * scale
                : 0;
            const nextWidth = lineWidth + kern + advance + scaledLetterSpacing;

            if (lineWidth > 0 && nextWidth > maxWidth) {
                result += "\n";
                lineWidth = 0;
                previousCode = -1;
            }

            result += char;
            lineWidth += (glyph ? glyph.xadvance * scale : fontSize * 0.5) + kern + scaledLetterSpacing;
            previousCode = glyph?.id ?? -1;
        }

        return result;
    }

    buildLayout(text: string, fontSize: number, letterSpacing: number = 0, lineSpacing: number = 0, decorations: MsdfDecorationOptions = {}): MsdfLayout {
        const scale = fontSize / this.lineHeight;
        const scaledLetterSpacing = letterSpacing * scale;
        const vertices: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];
        const quadKinds: number[] = [];
        const lineHeight = this.lineHeight * scale;
        const lineInfos: Array<{ y: number; advanceWidth: number; left: number; right: number; }> = [
            {
                y: 0,
                advanceWidth: 0,
                left: Number.POSITIVE_INFINITY,
                right: Number.NEGATIVE_INFINITY
            }
        ];

        let penX = 0;
        let penY = 0;
        let minX = Number.POSITIVE_INFINITY;
        let minY = Number.POSITIVE_INFINITY;
        let maxX = Number.NEGATIVE_INFINITY;
        let maxY = Number.NEGATIVE_INFINITY;
        let quadCount = 0;
        let lineCount = 1;
        let currentLineWidth = 0;
        let widestLine = 0;
        let previousCode = -1;
        let lineIndex = 0;

        const pushQuad = (glyph: MsdfGlyph, left: number, top: number, right: number, bottom: number, quadKind: number = QUAD_KIND_TEXT): void => {
            const u0 = glyph.x / this.atlasWidth;
            const v0 = glyph.y / this.atlasHeight;
            const u1 = (glyph.x + glyph.width) / this.atlasWidth;
            const v1 = (glyph.y + glyph.height) / this.atlasHeight;

            vertices.push(
                left, top,
                right, top,
                right, bottom,
                left, bottom
            );

            uvs.push(
                u0, v0,
                u1, v0,
                u1, v1,
                u0, v1
            );

            const vertexOffset = quadCount * 4;
            indices.push(
                vertexOffset, vertexOffset + 1, vertexOffset + 2,
                vertexOffset, vertexOffset + 2, vertexOffset + 3
            );
            quadKinds.push(quadKind);

            minX = Math.min(minX, left);
            minY = Math.min(minY, top);
            maxX = Math.max(maxX, right);
            maxY = Math.max(maxY, bottom);
            quadCount += 1;
        };

        for (const char of text) {
            if (char === "\n") {
                widestLine = Math.max(widestLine, currentLineWidth);
                lineInfos[lineIndex].advanceWidth = currentLineWidth;
                currentLineWidth = 0;
                penX = 0;
                penY += lineHeight + lineSpacing;
                previousCode = -1;
                lineCount += 1;
                lineIndex += 1;
                lineInfos.push({
                    y: penY,
                    advanceWidth: 0,
                    left: Number.POSITIVE_INFINITY,
                    right: Number.NEGATIVE_INFINITY
                });
                continue;
            }

            const glyph = this.glyphs.get(char);
            if (!glyph) {
                penX += fontSize * 0.5;
                currentLineWidth = Math.max(currentLineWidth, penX);
                previousCode = -1;
                continue;
            }

            if (previousCode >= 0) {
                penX += (this.kernings.get(kerningKey(previousCode, glyph.id)) ?? 0) * scale;
            }

            const left = penX + glyph.xoffset * scale;
            const top = penY + glyph.yoffset * scale;
            const right = left + glyph.width * scale;
            const bottom = top + glyph.height * scale;
            const line = lineInfos[lineIndex];

            line.left = Math.min(line.left, left);
            line.right = Math.max(line.right, right);

            pushQuad(glyph, left, top, right, bottom);

            penX += glyph.xadvance * scale + scaledLetterSpacing;
            currentLineWidth = Math.max(currentLineWidth, penX);
            previousCode = glyph.id;
        }

        widestLine = Math.max(widestLine, currentLineWidth);
        lineInfos[lineIndex].advanceWidth = currentLineWidth;

        if (decorations.underline || decorations.strikethrough) {
            const decorationGlyph = this.decorationGlyph;
            const decorationMetrics = this.getDecorationRenderMetrics(fontSize);

            if (!decorationGlyph || !decorationMetrics) {
                this.reportMissingDecorationGlyph();
            } else {
                for (const line of lineInfos) {
                    const lineLeft = Number.isFinite(line.left)
                        ? Math.min(0, line.left, decorationMetrics.leftOverhang)
                        : decorationMetrics.leftOverhang;
                    const lineRight = Math.max(
                        line.advanceWidth + decorationMetrics.rightOverhang,
                        Number.isFinite(line.right) ? line.right : 0
                    );

                    if (lineRight <= lineLeft) {
                        continue;
                    }

                    if (decorations.underline) {
                        const top = line.y + decorationMetrics.underlineTop;
                        pushQuad(decorationGlyph, lineLeft, top, lineRight, top + decorationMetrics.thickness, QUAD_KIND_UNDERLINE);
                    }

                    if (decorations.strikethrough) {
                        const top = line.y + lineHeight * 0.5 - decorationMetrics.thickness * 0.5;
                        pushQuad(decorationGlyph, lineLeft, top, lineRight, top + decorationMetrics.thickness, QUAD_KIND_STRIKETHROUGH);
                    }
                }
            }
        }

        if (quadCount === 0) {
            return {
                vertices: new Float32Array(0),
                uvs: new Float32Array(0),
                indices: new Uint16Array(0),
                quadKinds: new Uint8Array(0),
                width: widestLine,
                height: lineCount * lineHeight + Math.max(0, lineCount - 1) * lineSpacing
            };
        }

        maxY = Math.max(maxY, lineCount * lineHeight + Math.max(0, lineCount - 1) * lineSpacing);

        const shiftY = minY < 0 ? minY : 0;

        for (let i = 0; i < vertices.length; i += 2) {
            vertices[i] -= minX;
            vertices[i + 1] -= shiftY;
        }

        return {
            vertices: new Float32Array(vertices),
            uvs: new Float32Array(uvs),
            indices: new Uint16Array(indices),
            quadKinds: new Uint8Array(quadKinds),
            width: Math.max(widestLine, maxX - minX),
            height: Math.max(lineCount * lineHeight + Math.max(0, lineCount - 1) * lineSpacing, maxY - shiftY)
        };
    }
}

export class MsdfTextSprite extends Laya.Sprite {
    private materialInstance: Laya.Material;

    private _text: string;
    private _fontSize: number;
    private _letterSpacing: number;
    private _lineSpacing: number;
    private _textColor: Laya.Vector4;
    private _underlineColor: Laya.Vector4 | null;
    private _strikethroughColor: Laya.Vector4 | null;
    private _outlineColor: Laya.Vector4;
    private _outlineWidth: number;
    private _glowColor: Laya.Vector4;
    private _glowSize: number;
    private _shadowColor: Laya.Vector4;
    private _shadowOffsetX: number;
    private _shadowOffsetY: number;
    private _shadowBlur: number;
    private _underline: boolean;
    private _strikethrough: boolean;
    private _layout: MsdfLayout = createEmptyLayout();
    private _runs: MsdfRichTextRun[] = [];
    private _usesRuns = false;
    private _wordWrapWidth = 0;
    private _layoutWidth = 0;
    private _layoutHeight = 0;
    private _defaultAlign = "left";
    private _alignItems = "middle";
    private _overflow: MsdfOverflow = "visible";
    private _contentWidth = 0;
    private _contentHeight = 0;
    private _scrollX = 0;
    private _scrollY = 0;
    private _lines: MsdfTextLineMetric[] = [];
    private _drawBatches: MsdfDrawBatch[] = [];

    constructor(private font: MsdfBitmapFont, options: MsdfTextOptions = {}) {
        super();

        this._text = options.text ?? "";
        this._fontSize = options.fontSize ?? font.lineHeight;
        this._letterSpacing = options.letterSpacing ?? 0;
        this._lineSpacing = 0;
        this._textColor = options.textColor ?? DEFAULT_TEXT_COLOR.clone();
        this._underlineColor = options.underlineColor ?? null;
        this._strikethroughColor = options.strikethroughColor ?? null;
        this._outlineColor = options.outlineColor ?? DEFAULT_OUTLINE_COLOR.clone();
        this._outlineWidth = options.outlineWidth ?? 0;
        this._glowColor = options.glowColor ?? DEFAULT_GLOW_COLOR.clone();
        this._glowSize = options.glowSize ?? 0;
        this._shadowColor = options.shadowColor ?? DEFAULT_SHADOW_COLOR.clone();
        this._shadowOffsetX = options.shadowOffsetX ?? 0;
        this._shadowOffsetY = options.shadowOffsetY ?? 0;
        this._shadowBlur = options.shadowBlur ?? 0;
        this._underline = !!options.underline;
        this._strikethrough = !!options.strikethrough;
        this.materialInstance = this.font.renderState.material;
        this.material = this.materialInstance;
        this.mouseThrough = true;

        this.syncMaterial();
        this.refresh();
    }

    get text(): string {
        return this._text;
    }

    set text(value: string) {
        if (!this._usesRuns && this._text === value) {
            return;
        }
        this._text = value ?? "";
        this._usesRuns = false;
        this._runs = [];
        this.refresh();
    }

    set fontSize(value: number) {
        if (this._fontSize === value) {
            return;
        }
        this._fontSize = value;
        this.refresh();
    }

    set letterSpacing(value: number) {
        if (this._letterSpacing === value) {
            return;
        }
        this._letterSpacing = value;
        this.refresh();
    }

    set lineSpacing(value: number) {
        if (this._lineSpacing === value) {
            return;
        }
        this._lineSpacing = value;
        this.refresh();
    }

    get wordWrapWidth(): number {
        return this._wordWrapWidth;
    }

    set wordWrapWidth(value: number) {
        this._wordWrapWidth = Math.max(0, value);
    }

    get layoutWidth(): number {
        return this._layoutWidth;
    }

    set layoutWidth(value: number) {
        this._layoutWidth = Math.max(0, value);
    }

    get layoutHeight(): number {
        return this._layoutHeight;
    }

    set layoutHeight(value: number) {
        this._layoutHeight = Math.max(0, value);
    }

    get defaultAlign(): string {
        return this._defaultAlign;
    }

    set defaultAlign(value: string) {
        this._defaultAlign = value || "left";
    }

    get alignItems(): string {
        return this._alignItems;
    }

    set alignItems(value: string) {
        this._alignItems = value || "middle";
    }

    get contentWidth(): number {
        return this._contentWidth;
    }

    get contentHeight(): number {
        return this._contentHeight;
    }

    get lines(): ReadonlyArray<MsdfTextLineMetric> {
        return this._lines;
    }

    get overflow(): MsdfOverflow {
        return this._overflow;
    }

    set overflow(value: MsdfOverflow) {
        this._overflow = value || "visible";
    }

    get scrollX(): number {
        return this._scrollX;
    }

    set scrollX(value: number) {
        const next = Math.min(Math.max(value || 0, 0), this.maxScrollX);
        if (this._scrollX === next) {
            return;
        }

        this._scrollX = next;
        this.refresh();
    }

    get scrollY(): number {
        return this._scrollY;
    }

    set scrollY(value: number) {
        const next = Math.min(Math.max(value || 0, 0), this.maxScrollY);
        if (this._scrollY === next) {
            return;
        }

        this._scrollY = next;
        this.refresh();
    }

    get maxScrollX(): number {
        const viewportWidth = this._layoutWidth > 0 ? this._layoutWidth : this.width;
        return Math.max(this._contentWidth - viewportWidth, 0);
    }

    get maxScrollY(): number {
        const viewportHeight = this._layoutHeight > 0 ? this._layoutHeight : this.height;
        return Math.max(this._contentHeight - viewportHeight, 0);
    }

    set textColor(value: Laya.Vector4) {
        this._textColor = value;
        if (!this._usesRuns) {
            this.refresh();
        }
    }

    set underlineColor(value: Laya.Vector4 | null) {
        this._underlineColor = value;
        if (!this._usesRuns) {
            this.refresh();
        }
    }

    set strikethroughColor(value: Laya.Vector4 | null) {
        this._strikethroughColor = value;
        if (!this._usesRuns) {
            this.refresh();
        }
    }

    set outlineColor(value: Laya.Vector4) {
        this._outlineColor = value;
        if (!this._usesRuns) {
            this.refresh();
        }
    }

    set outlineWidth(value: number) {
        this._outlineWidth = value;
        if (!this._usesRuns) {
            this.refresh();
        }
    }

    set glowColor(value: Laya.Vector4) {
        this._glowColor = value;
        this.refresh();
    }

    set glowSize(value: number) {
        this._glowSize = Math.max(0, value);
        this.refresh();
    }

    setGlowStyle(color: Laya.Vector4, size: number): void {
        this._glowColor = color;
        this._glowSize = Math.max(0, size);
    }

    setShadowStyle(color: Laya.Vector4, offsetX: number, offsetY: number, blur: number): void {
        this._shadowColor = color;
        this._shadowOffsetX = offsetX;
        this._shadowOffsetY = offsetY;
        this._shadowBlur = Math.max(0, blur);
    }

    set underline(value: boolean) {
        if (this._underline === value) {
            return;
        }
        this._underline = value;
        this.refresh();
    }

    set strikethrough(value: boolean) {
        if (this._strikethrough === value) {
            return;
        }
        this._strikethrough = value;
        this.refresh();
    }

    setRuns(value: MsdfRichTextRun[]): void {
        this._usesRuns = true;
        this._runs = value ? value.slice() : [];
    }

    resetFont(font: MsdfBitmapFont): void {
        this.font = font;
        this.materialInstance = this.font.renderState.material;
        this.material = this.materialInstance;
        this.refresh();
    }

    refresh(): void {
        if (this._usesRuns) {
            this.refreshRichText();
            return;
        }

        this._layout = this.font.buildLayout(
            this._text,
            this._fontSize,
            this._letterSpacing,
            this._lineSpacing,
            {
                underline: this._underline,
                strikethrough: this._strikethrough
            }
        );
        this._contentWidth = this._layout.width;
        this._contentHeight = this._layout.height;
        this._lines = this._text.length === 0
            ? []
            : this._text.split("\n").map((lineText, index) => ({
                x: 0,
                y: index * (this._layout.height || this.font.getLineHeight(this._fontSize)),
                width: this.font.measureTextWidth(lineText, this._fontSize, this._letterSpacing),
                height: this.font.getLineHeight(this._fontSize),
                align: this._defaultAlign,
                text: lineText
            }));
        this._scrollX = Math.min(this._scrollX, this.maxScrollX);
        this._scrollY = Math.min(this._scrollY, this.maxScrollY);
        this._drawBatches = this._layout.indices.length > 0
            ? (() => {
                const vertexCount = this._layout.vertices.length >> 1;
                const vertices = new Float32Array(this._layout.vertices.length);
                vertices.set(this._layout.vertices);
                if (this._overflow === "scroll" && (this._scrollX !== 0 || this._scrollY !== 0)) {
                    for (let i = 0; i < vertices.length; i += 2) {
                        vertices[i] -= this._scrollX;
                        vertices[i + 1] -= this._scrollY;
                    }
                }
                const flags = effectFlags(
                    this._outlineWidth,
                    this._outlineColor,
                    this._glowSize,
                    this._glowColor,
                    this._shadowOffsetX,
                    this._shadowOffsetY,
                    this._shadowBlur,
                    this._shadowColor
                );

                return [{
                vertices,
                uvs: this._layout.uvs,
                indices: this._layout.indices,
                fillColors: createLayoutColorArray(this._layout, this._textColor, this._underlineColor, this._strikethroughColor),
                outlineColors: createLayoutColorArray(this._layout, this._outlineColor, this._underlineColor, this._strikethroughColor),
                glowColors: createVertexColorArray(this._glowColor, vertexCount),
                shadowColors: createVertexColorArray(this._shadowColor, vertexCount),
                packedParamsA: createPackedParamsAArray(this._outlineWidth, this._glowSize, this._shadowBlur, vertexCount),
                packedParamsB: createPackedParamsBArray(this._shadowOffsetX, this._shadowOffsetY, flags, vertexCount),
                textColor: this._textColor,
                outlineColor: this._outlineColor,
                outlineWidth: this._outlineWidth,
                glowColor: this._glowColor,
                glowSize: this._glowSize,
                shadowColor: this._shadowColor,
                shadowOffsetX: this._shadowOffsetX,
                shadowOffsetY: this._shadowOffsetY,
                shadowBlur: this._shadowBlur
            }];
            })()
            : [];
        this.size(this._layout.width, this._layout.height);
        this.redraw();
    }

    private refreshRichText(): void {
        if (this._runs.length === 0) {
            this._layout = createEmptyLayout();
            this._drawBatches = [];
            this._contentWidth = 0;
            this._contentHeight = 0;
            this._lines = [];
            this.size(this._layoutWidth, this._layoutHeight);
            this.redraw();
            return;
        }

        const lines = this.layoutRuns();
        this._lines = lines.map(line => ({
            x: line.x,
            y: line.y,
            width: line.width,
            height: line.height,
            align: line.align,
            text: this.collectLineText(line)
        }));
        this._scrollX = Math.min(this._scrollX, this.maxScrollX);
        this._scrollY = Math.min(this._scrollY, this.maxScrollY);
        const viewWidth = this._layoutWidth > 0 ? this._layoutWidth : this._contentWidth;
        const viewHeight = this._layoutHeight > 0 ? this._layoutHeight : this._contentHeight;
        const drawBatches: MsdfDrawBatch[] = [];
        const layoutCache = new WeakMap<MsdfRichTextStyle, Map<string, MsdfLayout>>();
        let pendingGroup: MsdfDrawBatchGroup | null = null;

        for (const line of lines) {
            const lineAlign = line.align || this._defaultAlign;
            const lineOffsetX = lineAlign === "center"
                ? Math.max((viewWidth - line.width) * 0.5, 0)
                : lineAlign === "right"
                    ? Math.max(viewWidth - line.width, 0)
                    : 0;

            let cmd = line.cmd;
            while (cmd) {
                const batch = this.buildRunBatch(
                    cmd,
                    lineOffsetX + cmd.x - (this._overflow === "scroll" ? this._scrollX : 0),
                    line.y + cmd.y - (this._overflow === "scroll" ? this._scrollY : 0),
                    layoutCache
                );
                if (batch) {
                    if (pendingGroup && canMergeBatchGroup(pendingGroup, batch)) {
                        mergeBatchGroup(pendingGroup, batch);
                    } else {
                        pendingGroup = appendBatchGroup(drawBatches, pendingGroup);
                        pendingGroup = createBatchGroup(batch);
                    }
                }
                cmd = cmd.next;
            }
        }

        appendBatchGroup(drawBatches, pendingGroup);

        this._layout = createEmptyLayout();
        this._drawBatches = drawBatches;
        this.size(viewWidth, viewHeight);
        this.redraw();
    }

    private syncMaterial(): void {
        const renderState = this.font.renderState;
        if (this.materialInstance !== renderState.material) {
            this.materialInstance = renderState.material;
            this.material = this.materialInstance;
        }
    }

    private redraw(): void {
        this.graphics.clear(true);

        if (this._drawBatches.length === 0) {
            this.syncMaterial();
            return;
        }

        this.syncMaterial();

        const clipped = (this._overflow === "hidden" || this._overflow === "scroll") && this.width > 0 && this.height > 0;
        if (clipped) {
            this.graphics.save();
            this.graphics.clipRect(0, 0, this.width, this.height);
        }

        for (const batch of this._drawBatches) {
            this.graphics.drawTrianglesMSDF(
                this.font.texture,
                0,
                0,
                batch.vertices,
                batch.uvs,
                batch.indices,
                batch.fillColors,
                batch.outlineColors,
                batch.glowColors,
                batch.shadowColors,
                batch.packedParamsA,
                batch.packedParamsB
            );
        }

        if (clipped) {
            this.graphics.restore();
        }
    }

    private collectLineText(line: MsdfRichTextLine): string {
        let text = "";
        let cmd = line.cmd;
        while (cmd) {
            text += cmd.text;
            cmd = cmd.next;
        }
        return text;
    }

    private layoutRuns(): MsdfRichTextLine[] {
        const lines: MsdfRichTextLine[] = [];
        const wordWrap = this._wordWrapWidth > 0;
        const noBreakWord = wordWrap;
        const rectWidth = wordWrap
            ? this._wordWrapWidth
            : this._layoutWidth > 0
                ? this._layoutWidth
                : Number.MAX_VALUE;
        const rectHeight = this._layoutHeight > 0 ? this._layoutHeight : Number.MAX_VALUE;
        const metricCache = new WeakMap<MsdfRichTextStyle, {
            render: { extraWidth: number; height: number; };
            text: Map<string, { width: number; height: number; }>;
        }>();

        let lineX = 0;
        let lineY = 0;
        let lastHeight = this.font.getLineHeight(this._runs[0]?.style.fontSize ?? this.font.lineHeight);
        let currentLine: MsdfRichTextLine | null = null;
        let lastCmd: MsdfRichTextCommand | null = null;

        const getMetricBucket = (style: MsdfRichTextStyle) => {
            let bucket = metricCache.get(style);
            if (bucket) {
                return bucket;
            }

            const lineHeight = this.font.getLineHeight(style.fontSize);
            let renderHeight = lineHeight;
            let extraWidth = 0;

            if (style.underline || style.strikethrough) {
                const decorationMetrics = this.font.getDecorationRenderMetrics(style.fontSize);

                if (decorationMetrics) {
                    extraWidth = -decorationMetrics.leftOverhang + decorationMetrics.rightOverhang;

                    if (style.underline) {
                        renderHeight = Math.max(renderHeight, decorationMetrics.underlineBottom);
                    }

                    if (style.strikethrough) {
                        renderHeight = Math.max(renderHeight, lineHeight * 0.5 + decorationMetrics.thickness * 0.5);
                    }
                }
            }

            bucket = {
                render: { extraWidth, height: renderHeight },
                text: new Map()
            };
            metricCache.set(style, bucket);
            return bucket;
        };

        const getStyleRenderMetrics = (style: MsdfRichTextStyle): { extraWidth: number; height: number; } => {
            return getMetricBucket(style).render;
        };

        const getTextMetrics = (text: string, style: MsdfRichTextStyle): { width: number; height: number; } => {
            const bucket = getMetricBucket(style);
            const cached = bucket.text.get(text);
            if (cached) {
                return cached;
            }

            const baseWidth = this.font.measureTextWidth(text, style.fontSize, this._letterSpacing) + bucket.render.extraWidth;
            const metrics = {
                width: baseWidth * styleScaleX(style) + styleSkewExtra(bucket.render.height, style),
                height: bucket.render.height
            };
            bucket.text.set(text, metrics);
            return metrics;
        };

        const getFallbackStyle = (): MsdfRichTextStyle | null => {
            return this._runs[this._runs.length - 1]?.style ?? this._runs[0]?.style ?? null;
        };

        const trimTrailingGlyph = (text: string): string => {
            if (!text) {
                return "";
            }

            let nextLength = text.length - 1;
            if (nextLength > 0 && isLowSurrogate(text.charCodeAt(nextLength))) {
                nextLength--;
            }

            return text.substring(0, Math.max(nextLength, 0));
        };

        const rebuildLine = (line: MsdfRichTextLine, segments: Array<{ text: string; style: MsdfRichTextStyle; }>, fallbackHeight: number): void => {
            let width = 0;
            let height = 0;
            let prev: MsdfRichTextCommand | null = null;

            line.cmd = null;
            line.align = segments[0]?.style.align || this._defaultAlign;
            line.alignItems = segments[0]?.style.alignItems || this._alignItems;

            for (const segment of segments) {
                if (!segment.text) {
                    continue;
                }

                const metrics = getTextMetrics(segment.text, segment.style);
                const cmdHeight = Math.max(metrics.height, 1);
                const cmd: MsdfRichTextCommand = {
                    text: segment.text,
                    style: segment.style,
                    x: width,
                    y: 0,
                    width: metrics.width,
                    height: cmdHeight,
                    next: null,
                    prev
                };

                if (prev) {
                    prev.next = cmd;
                } else {
                    line.cmd = cmd;
                }

                prev = cmd;
                width += Math.round(cmd.width);
                height = Math.max(height, cmdHeight);
            }

            line.width = Math.round(width);
            line.height = height > 0 ? height : Math.max(fallbackHeight, 1);

            let cmd = line.cmd;
            while (cmd) {
                cmd.y = alignItemsOffset(line.height, cmd.height, line.alignItems);
                cmd = cmd.next;
            }
        };

        const applyEllipsis = (): void => {
            if (this._overflow !== "ellipsis" || lines.length === 0) {
                return;
            }

            let truncateIndex = -1;
            if (rectHeight < Number.MAX_VALUE) {
                truncateIndex = lines.findIndex(line => line.y + line.height > rectHeight);
                if (truncateIndex === 0) {
                    truncateIndex = 1;
                }
            }

            let linesDeleted = false;
            if (truncateIndex > 0 && lines.length > truncateIndex) {
                lines.splice(truncateIndex, lines.length - truncateIndex);
                linesDeleted = true;
            }

            const lastLine = lines[lines.length - 1];
            if (!lastLine) {
                return;
            }

            const segments: Array<{ text: string; style: MsdfRichTextStyle; width: number; height: number; }> = [];
            let cmd = lastLine.cmd;
            while (cmd) {
                const metrics = getTextMetrics(cmd.text, cmd.style);
                segments.push({
                    text: cmd.text,
                    style: cmd.style,
                    width: metrics.width,
                    height: metrics.height
                });
                cmd = cmd.next;
            }

            let baseWidth = segments.reduce((sum, segment) => sum + segment.width, 0);
            const fallbackStyle = segments[segments.length - 1]?.style ?? getFallbackStyle();
            if (!fallbackStyle) {
                return;
            }

            if (!linesDeleted && baseWidth <= rectWidth) {
                return;
            }

            while (segments.length > 0) {
                const ellipsisStyle = segments[segments.length - 1]?.style ?? fallbackStyle;
                const ellipsisWidth = getTextMetrics(ELLIPSIS_TEXT, ellipsisStyle).width;
                if (baseWidth + ellipsisWidth <= rectWidth) {
                    break;
                }

                const tail = segments[segments.length - 1];
                const trimmedText = trimTrailingGlyph(tail.text);
                if (!trimmedText) {
                    baseWidth -= tail.width;
                    segments.pop();
                    continue;
                }

                const trimmedMetrics = getTextMetrics(trimmedText, tail.style);
                baseWidth += trimmedMetrics.width - tail.width;
                tail.text = trimmedText;
                tail.width = trimmedMetrics.width;
                tail.height = trimmedMetrics.height;
            }

            const ellipsisStyle = segments[segments.length - 1]?.style ?? fallbackStyle;
            if (segments.length > 0) {
                const tail = segments[segments.length - 1];
                tail.text += ELLIPSIS_TEXT;
                const mergedMetrics = getTextMetrics(tail.text, tail.style);
                tail.width = mergedMetrics.width;
                tail.height = mergedMetrics.height;
            } else {
                const ellipsisMetrics = getTextMetrics(ELLIPSIS_TEXT, ellipsisStyle);
                segments.push({
                    text: ELLIPSIS_TEXT,
                    style: ellipsisStyle,
                    width: ellipsisMetrics.width,
                    height: ellipsisMetrics.height
                });
            }

            rebuildLine(
                lastLine,
                segments.map(segment => ({ text: segment.text, style: segment.style })),
                fallbackStyle ? this.font.getLineHeight(fallbackStyle.fontSize) : lastHeight
            );
        };

        const addCmd = (text: string, style: MsdfRichTextStyle, metrics?: { width: number; height: number; }): void => {
            if (!text) {
                return;
            }

            const resolvedMetrics = metrics ?? getTextMetrics(text, style);
            const cmdHeight = Math.max(resolvedMetrics.height, 1);
            const cmd: MsdfRichTextCommand = {
                text,
                style,
                x: lineX,
                y: 0,
                width: resolvedMetrics.width,
                height: cmdHeight,
                next: null,
                prev: lastCmd
            };

            if (!currentLine) {
                return;
            }

            if (!currentLine.cmd) {
                currentLine.align = style.align || this._defaultAlign;
                currentLine.alignItems = style.alignItems || this._alignItems;
            }

            lineX += Math.round(cmd.width);
            if (lastCmd) {
                lastCmd.next = cmd;
            } else {
                currentLine.cmd = cmd;
            }
            lastCmd = cmd;
            lastHeight = cmdHeight;
        };

        const addLine = (last: boolean = false): MsdfRichTextLine | null => {
            lineX = 0;

            if (currentLine) {
                let lineHeight = 0;
                let lineWidth = 0;
                let cmd = currentLine.cmd;

                while (cmd) {
                    lineHeight = Math.max(lineHeight, cmd.height);
                    lineWidth += cmd.width;
                    cmd = cmd.next;
                }

                if (lineHeight === 0) {
                    lineHeight = lastHeight;
                }

                currentLine.height = lineHeight;
                currentLine.width = Math.round(lineWidth);

                cmd = currentLine.cmd;
                while (cmd) {
                    cmd.y = alignItemsOffset(lineHeight, cmd.height, currentLine.alignItems);
                    cmd = cmd.next;
                }

                lineY += currentLine.height + this._lineSpacing;
            }

            if (last) {
                return null;
            }

            currentLine = {
                x: 0,
                y: lineY,
                width: 0,
                height: 0,
                cmd: null,
                align: this._defaultAlign,
                alignItems: this._alignItems
            };
            lines.push(currentLine);
            lastCmd = null;
            return currentLine;
        };

        const splitCmd = (cmd: MsdfRichTextCommand, pos: number): boolean => {
            const code = cmd.text.charCodeAt(pos);
            if (isLowSurrogate(code)) {
                pos--;
            }

            if (pos <= 0) {
                return false;
            }

            const tail = cmd.text.substring(pos);
            cmd.text = cmd.text.substring(0, pos);
            cmd.width = getTextMetrics(cmd.text, cmd.style).width;

            const nextCmd: MsdfRichTextCommand = {
                text: tail,
                style: cmd.style,
                x: 0,
                y: 0,
                width: getTextMetrics(tail, cmd.style).width,
                height: cmd.height,
                next: cmd.next,
                prev: cmd
            };

            if (nextCmd.next) {
                nextCmd.next.prev = nextCmd;
            }

            cmd.next = nextCmd;
            return true;
        };

        const moveCmds = (cmd: MsdfRichTextCommand | null): void => {
            if (!cmd || !currentLine) {
                return;
            }

            if (cmd.prev) {
                cmd.prev.next = null;
            }

            while (cmd) {
                const next = cmd.next;
                cmd.x = lineX;
                cmd.y = 0;
                cmd.next = null;
                cmd.prev = lastCmd;

                if (!lastCmd) {
                    currentLine.align = cmd.style.align || this._defaultAlign;
                    currentLine.alignItems = cmd.style.alignItems || this._alignItems;
                    currentLine.cmd = cmd;
                } else {
                    lastCmd.next = cmd;
                }

                lineX += Math.round(cmd.width);
                lastCmd = cmd;
                cmd = next;
            }
        };

        const wrapText = (text: string, style: MsdfRichTextStyle): void => {
            let remainWidth = Math.max(0, rectWidth - lineX);
            const styleMetrics = getStyleRenderMetrics(style);
            const totalMetrics = getTextMetrics(text, style);
            let totalWidth = totalMetrics.width;
            const italicExtra = styleSkewExtra(styleMetrics.height, style);
            const getCharWidth = (charText: string): number => this.font.measureTextWidth(charText, style.fontSize, this._letterSpacing) * styleScaleX(style);

            if (totalWidth <= remainWidth) {
                addCmd(text, style, totalMetrics);
                return;
            }

            let startIndex = 0;
            let wordWidth = italicExtra + styleMetrics.extraWidth;
            let isPunctuation = false;
            let match: RegExpExecArray | null = null;
            const emoji = emojiTest.test(text);
            const len = text.length;

            for (let j = 0; j < len; j++) {
                let charText = text.charAt(j);
                const code = charText.charCodeAt(0);
                if (emoji && isHighSurrogate(code) && j + 1 < len) {
                    charText += text.charAt(j + 1);
                }

                let charWidth: number | null = getCharWidth(charText);
                wordWidth += charWidth;

                if (wordWidth <= remainWidth || (j === startIndex && lineX === 0)) {
                    if (charText.length > 1) {
                        j++;
                    }
                    continue;
                }

                let part = text.substring(startIndex, j);
                wordWidth -= charWidth;

                if (noBreakWord && ((code >= 65 && code <= 90) || (code >= 97 && code <= 122) || (code >= 48 && code <= 57) || (isPunctuation = punctuationChars.has(code)))) {
                    const wordBoundary = part.length > 0 ? ((match = wordBoundaryTest.exec(part)) ? match.index : null) : 0;
                    if (wordBoundary > 0) {
                        if (wordBoundary > part.length - maxWordLength) {
                            j = startIndex + wordBoundary;
                            part = text.substring(startIndex, j);
                            wordWidth = getTextMetrics(part, style).width;
                            charWidth = null;
                        }
                    } else if (wordBoundary != null && lastCmd != null) {
                        let cmd: MsdfRichTextCommand | null = lastCmd;
                        let totalLen = part.length;
                        let newLine = false;

                        while (cmd) {
                            if (cmd.width > 0) {
                                match = wordBoundaryTest.exec(cmd.text);
                                const textLen = cmd.text.length;
                                if (match == null) {
                                    addLine();
                                    if (isPunctuation && totalLen === 0) {
                                        if (splitCmd(cmd, textLen - 1)) {
                                            moveCmds(cmd.next);
                                        } else if (cmd.x > 0) {
                                            moveCmds(cmd);
                                        }
                                    } else if (cmd.next) {
                                        moveCmds(cmd.next);
                                    }
                                    newLine = true;
                                    break;
                                } else if (match.index > 0) {
                                    if (match.index > textLen - (maxWordLength - totalLen)) {
                                        addLine();
                                        if (splitCmd(cmd, match.index)) {
                                            moveCmds(cmd.next);
                                        }
                                        newLine = true;
                                    }
                                    break;
                                } else {
                                    totalLen += textLen;
                                    if (totalLen >= maxWordLength) {
                                        break;
                                    }
                                }
                            }

                            cmd = cmd.prev;
                        }

                        if (newLine) {
                            remainWidth = rectWidth - lineX;
                            if (charWidth != null && wordWidth + charWidth < remainWidth) {
                                wordWidth += charWidth;
                                continue;
                            }
                        }
                    } else if (isPunctuation) {
                        const backup = (emoji && j >= 1 && isLowSurrogate(text.charCodeAt(j - 1))) ? 2 : 1;
                        if (j - backup > startIndex || lineX > 0) {
                            j -= backup;
                            part = text.substring(startIndex, j);
                            wordWidth = getTextMetrics(part, style).width;
                            charWidth = null;
                        }
                    }
                }

                if (part.length > 0) {
                    addCmd(part, style, { width: wordWidth, height: styleMetrics.height });
                }

                addLine();
                startIndex = j;
                remainWidth = rectWidth;
                wordWidth = italicExtra + styleMetrics.extraWidth;

                if (charWidth != null) {
                    wordWidth += charWidth;
                    if (charText.length > 1) {
                        j++;
                    }
                } else if (emoji && isHighSurrogate(text.charCodeAt(j))) {
                    j++;
                }

                if (charWidth == null && j < len - 1) {
                    wordWidth = getTextMetrics(text.substring(startIndex, j + 1), style).width;
                }
            }

            addCmd(text.substring(startIndex, len), style);
        };

        addLine();

        for (const run of this._runs) {
            if (!run.text) {
                continue;
            }

            lastHeight = getStyleRenderMetrics(run.style).height;
            const splitLines = run.text.split("\n");

            for (let i = 0, n = splitLines.length; i < n; i++) {
                const lineText = splitLines[i];
                if (lineText.length > 0) {
                    if (wordWrap) {
                        wrapText(lineText, run.style);
                    } else {
                        addCmd(lineText, run.style);
                    }
                }

                if (i !== n - 1) {
                    addLine();
                }
            }
        }

        addLine(true);
        applyEllipsis();

        let contentWidth = 0;
        let contentHeight = 0;
        for (const line of lines) {
            contentWidth = Math.max(contentWidth, line.width);
            contentHeight = Math.max(contentHeight, line.y + line.height);
        }

        this._contentWidth = contentWidth;
        this._contentHeight = contentHeight;
        return lines;
    }

    private buildRunBatch(cmd: MsdfRichTextCommand, x: number, y: number, layoutCache?: WeakMap<MsdfRichTextStyle, Map<string, MsdfLayout>>): MsdfDrawBatch | null {
        const style = cmd.style;
        let styleLayouts = layoutCache?.get(style);
        if (!styleLayouts && layoutCache) {
            styleLayouts = new Map();
            layoutCache.set(style, styleLayouts);
        }

        let layout = styleLayouts?.get(cmd.text);
        if (!layout) {
            layout = this.font.buildLayout(
                cmd.text,
                style.fontSize,
                this._letterSpacing,
                0,
                {
                    underline: !!style.underline,
                    strikethrough: !!style.strikethrough
                }
            );
            styleLayouts?.set(cmd.text, layout);
        }

        if (layout.indices.length === 0) {
            return null;
        }

        const baseHeight = Math.max(layout.height, this.font.getLineHeight(style.fontSize));
        const italicOffset = styleSkewExtra(baseHeight, style);
        const scaleX = styleScaleX(style);
        const skewX = style.italic ? Math.tan(ITALIC_SKEW_DEGREES * Math.PI / 180) : 0;
        const vertices = new Float32Array(layout.vertices.length);
        const vertexCount = vertices.length >> 1;
        const flags = effectFlags(
            style.outlineWidth,
            style.outlineColor,
            this._glowSize,
            this._glowColor,
            this._shadowOffsetX,
            this._shadowOffsetY,
            this._shadowBlur,
            this._shadowColor
        );

        for (let i = 0; i < layout.vertices.length; i += 2) {
            const localX = layout.vertices[i] * scaleX;
            const localY = layout.vertices[i + 1];
            vertices[i] = x + localX + (style.italic ? italicOffset - skewX * localY : 0);
            vertices[i + 1] = y + localY;
        }

        return {
            vertices,
            uvs: layout.uvs,
            indices: layout.indices,
            fillColors: createLayoutColorArray(layout, style.textColor, style.underlineColor, style.strikethroughColor),
            outlineColors: createLayoutColorArray(layout, style.outlineColor, style.underlineColor, style.strikethroughColor),
            glowColors: createVertexColorArray(this._glowColor, vertexCount),
            shadowColors: createVertexColorArray(this._shadowColor, vertexCount),
            packedParamsA: createPackedParamsAArray(style.outlineWidth, this._glowSize, this._shadowBlur, vertexCount),
            packedParamsB: createPackedParamsBArray(this._shadowOffsetX, this._shadowOffsetY, flags, vertexCount),
            textColor: style.textColor,
            outlineColor: style.outlineColor,
            outlineWidth: style.outlineWidth,
            glowColor: this._glowColor,
            glowSize: this._glowSize,
            shadowColor: this._shadowColor,
            shadowOffsetX: this._shadowOffsetX,
            shadowOffsetY: this._shadowOffsetY,
            shadowBlur: this._shadowBlur
        };
    }
}
