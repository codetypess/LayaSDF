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
    // 本地文本坐标系下的几何数据，最终的绘制偏移和裁剪会在更后面的阶段处理。
    vertices: Float32Array;
    uvs: Float32Array;
    indices: Uint16Array;
    quadKinds: Uint8Array;
    width: number;
    height: number;
};

type MsdfDrawBatch = {
    // 一次 GPU 提交所需的完整数据，已经把布局和样式都展开成按顶点存储。
    vertices: Float32Array;
    uvs: Float32Array;
    indices: Uint16Array;
    fillColors: Uint32Array;
    outlineColors: Uint32Array;
    glowColors: Uint32Array;
    shadowColors: Uint32Array;
    packedParamsA: Uint32Array;
    packedParamsB: Uint32Array;
};

type MsdfViewFrame = {
    // 来自 MsdfLabel 的视口信息。文本几何本身仍然保持在本地坐标里。
    width: number;
    height: number;
    drawOffsetX: number;
    drawOffsetY: number;
    clipRectX: number;
    clipRectY: number;
    clipRectWidth: number;
    clipRectHeight: number;
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

type MsdfPlainTextBatchCache = {
    // 纯文本经常在布局不变的情况下重复重绘，这里缓存展开后的按顶点样式数组，
    // 避免滚动或视口更新时每次都重新构造颜色和效果参数。
    layout: MsdfLayout | null;
    fillDefaultPacked: number;
    fillUnderlinePacked: number;
    fillStrikethroughPacked: number;
    outlineDefaultPacked: number;
    outlineUnderlinePacked: number;
    outlineStrikethroughPacked: number;
    glowPacked: number;
    shadowPacked: number;
    packedParamsAValue: number;
    packedParamsBValue: number;
    fillColors: Uint32Array | null;
    outlineColors: Uint32Array | null;
    glowColors: Uint32Array | null;
    shadowColors: Uint32Array | null;
    packedParamsA: Uint32Array | null;
    packedParamsB: Uint32Array | null;
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
    y: number;
    width: number;
    height: number;
    cmd: MsdfRichTextCommand | null;
    align: string;
    alignItems: string;
};

type MsdfRichTextMetrics = {
    width: number;
    height: number;
};

type MsdfRichTextMetricBucket = {
    render: {
        extraWidth: number;
        height: number;
    };
    text: Map<string, MsdfRichTextMetrics>;
};

type MsdfRichTextMetricCache = WeakMap<MsdfRichTextStyle, MsdfRichTextMetricBucket>;

type MsdfRichTextLineSegment = {
    text: string;
    style: MsdfRichTextStyle;
    width: number;
    height: number;
};

const DEFAULT_TEXT_COLOR = new Laya.Vector4(1, 1, 1, 1);
const DEFAULT_OUTLINE_COLOR = new Laya.Vector4(0, 0, 0, 1);
const DEFAULT_GLOW_COLOR = new Laya.Vector4(1, 1, 1, 0);
const NO_CONSTRAINT = -1;
const DEFAULT_SHADOW_COLOR = new Laya.Vector4(0, 0, 0, 0);
const ITALIC_SKEW_DEGREES = 12;
const BOLD_SCALE_X = 1.04;
const LARGE_DECORATION_SCALE_THRESHOLD = 1.75;
const LARGE_DECORATION_THICKNESS_BOOST = 1;
const UNDERLINE_EXTRA_OFFSET_MIN = 0.75;
const UNDERLINE_EXTRA_OFFSET_SCALE = 0.55;
// 图集里会额外注入一个私有字形，运行时把它拉伸成下划线和删除线。
// 这里的字符编码需要和 scripts/msdf-decoration.mjs 保持一致。
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

function createEmptyPlainTextBatchCache(): MsdfPlainTextBatchCache {
    return {
        layout: null,
        fillDefaultPacked: -1,
        fillUnderlinePacked: -1,
        fillStrikethroughPacked: -1,
        outlineDefaultPacked: -1,
        outlineUnderlinePacked: -1,
        outlineStrikethroughPacked: -1,
        glowPacked: -1,
        shadowPacked: -1,
        packedParamsAValue: -1,
        packedParamsBValue: -1,
        fillColors: null,
        outlineColors: null,
        glowColors: null,
        shadowColors: null,
        packedParamsA: null,
        packedParamsB: null
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
            packedParamsB: group.packedParamBChunks[0]
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
        packedParamsB
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

function scaleVertices(source: Float32Array, scale: number, offsetX: number = 0, offsetY: number = 0): Float32Array {
    const vertices = new Float32Array(source.length);
    for (let i = 0; i < source.length; i += 2) {
        vertices[i] = source[i] * scale + offsetX;
        vertices[i + 1] = source[i + 1] * scale + offsetY;
    }
    return vertices;
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
    const packed = packParamsAValue(outlineWidth, glowSize, shadowBlur);
    values.fill(packed);
    return values;
}

function createPackedParamsBArray(shadowOffsetX: number, shadowOffsetY: number, flags: number, vertexCount: number): Uint32Array {
    const values = new Uint32Array(vertexCount);
    const packed = packParamsBValue(shadowOffsetX, shadowOffsetY, flags);
    values.fill(packed);
    return values;
}

function packParamsAValue(outlineWidth: number, glowSize: number, shadowBlur: number): number {
    return (
        packNormalizedByte(outlineWidth, PACKED_EFFECT_SIZE_MAX)
        | (packNormalizedByte(glowSize, PACKED_EFFECT_SIZE_MAX) << 8)
        | (packNormalizedByte(shadowBlur, PACKED_EFFECT_SIZE_MAX) << 16)
    ) >>> 0;
}

function packParamsBValue(shadowOffsetX: number, shadowOffsetY: number, flags: number): number {
    return (
        packSignedByte(shadowOffsetX * PACKED_SHADOW_OFFSET_SCALE)
        | (packSignedByte(shadowOffsetY * PACKED_SHADOW_OFFSET_SCALE) << 8)
        | ((flags & 0xff) << 16)
    ) >>> 0;
}

function isHighSurrogate(code: number): boolean {
    return code >= 0xd800 && code <= 0xdbff;
}

function isLowSurrogate(code: number): boolean {
    return code >= 0xdc00 && code <= 0xdfff;
}

function trimTrailingGlyph(text: string): string {
    if (!text) {
        return "";
    }

    let nextLength = text.length - 1;
    if (nextLength > 0 && isLowSurrogate(text.charCodeAt(nextLength))) {
        nextLength--;
    }

    return text.substring(0, Math.max(nextLength, 0));
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
        // 先把文本转换成可复用的四边形布局。这个阶段只负责生成本地字形几何，
        // 不处理裁剪、滚动、发光/阴影叠加顺序，也不关心最终屏幕上的偏移。
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
            // 每个字形或装饰线最终都对应一个带 UV 的四边形。
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
            // 装饰线复用注入图集的那个私有字形，但会按每一行的宽度拉伸。
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

        // 把布局归一化到以文本块左上附近为原点，外部就能用一次整体偏移去放置它。
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
    private _layoutWidth = NO_CONSTRAINT;
    private _layoutHeight = NO_CONSTRAINT;
    private _viewFrame: MsdfViewFrame = {
        width: NO_CONSTRAINT,
        height: NO_CONSTRAINT,
        drawOffsetX: 0,
        drawOffsetY: 0,
        clipRectX: 0,
        clipRectY: 0,
        clipRectWidth: NO_CONSTRAINT,
        clipRectHeight: NO_CONSTRAINT
    };
    private _defaultAlign = "left";
    private _alignItems = "middle";
    private _overflow: MsdfOverflow = "visible";
    private _contentWidth = 0;
    private _contentHeight = 0;
    private _scrollX = 0;
    private _scrollY = 0;
    private _lines: MsdfTextLineMetric[] = [];
    private _drawBatches: MsdfDrawBatch[] = [];
    private _plainTextLayoutDirty = true;
    private _plainTextBatchCache: MsdfPlainTextBatchCache = createEmptyPlainTextBatchCache();

    constructor(private font: MsdfBitmapFont | null = null, options: MsdfTextOptions = {}) {
        super();

        this._text = options.text ?? "";
        this._fontSize = options.fontSize ?? font?.lineHeight ?? 16;
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
        this.materialInstance = this.font?.renderState.material ?? new Laya.Material();
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
        this._plainTextLayoutDirty = true;
        this.refresh();
    }

    set fontSize(value: number) {
        if (this._fontSize === value) {
            return;
        }
        this._fontSize = value;
        this._plainTextLayoutDirty = true;
        this.refresh();
    }

    set letterSpacing(value: number) {
        if (this._letterSpacing === value) {
            return;
        }
        this._letterSpacing = value;
        this._plainTextLayoutDirty = true;
        this.refresh();
    }

    set lineSpacing(value: number) {
        if (this._lineSpacing === value) {
            return;
        }
        this._lineSpacing = value;
        this._plainTextLayoutDirty = true;
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
        this._layoutWidth = Number.isFinite(value) && value >= 0 ? value : NO_CONSTRAINT;
    }

    get layoutHeight(): number {
        return this._layoutHeight;
    }

    set layoutHeight(value: number) {
        this._layoutHeight = Number.isFinite(value) && value >= 0 ? value : NO_CONSTRAINT;
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
        const next = this.font
            ? Math.min(Math.max(value || 0, 0), this.maxScrollX)
            : Math.max(value || 0, 0);
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
        const next = this.font
            ? Math.min(Math.max(value || 0, 0), this.maxScrollY)
            : Math.max(value || 0, 0);
        if (this._scrollY === next) {
            return;
        }

        this._scrollY = next;
        this.refresh();
    }

    get maxScrollX(): number {
        const viewportWidth = this._layoutWidth >= 0 ? this._layoutWidth : this.width;
        return Math.max(this._contentWidth - viewportWidth, 0);
    }

    get maxScrollY(): number {
        const viewportHeight = this._layoutHeight >= 0 ? this._layoutHeight : this.height;
        return Math.max(this._contentHeight - viewportHeight, 0);
    }

    set textColor(value: Laya.Vector4) {
        this._textColor = value;
        if (!this._usesRuns) {
            this.invalidatePlainTextBatchCache();
            this.refresh();
        }
    }

    set underlineColor(value: Laya.Vector4 | null) {
        this._underlineColor = value;
        if (!this._usesRuns) {
            this.invalidatePlainTextBatchCache();
            this.refresh();
        }
    }

    set strikethroughColor(value: Laya.Vector4 | null) {
        this._strikethroughColor = value;
        if (!this._usesRuns) {
            this.invalidatePlainTextBatchCache();
            this.refresh();
        }
    }

    set outlineColor(value: Laya.Vector4) {
        this._outlineColor = value;
        if (!this._usesRuns) {
            this.invalidatePlainTextBatchCache();
            this.refresh();
        }
    }

    set outlineWidth(value: number) {
        this._outlineWidth = value;
        if (!this._usesRuns) {
            this.invalidatePlainTextBatchCache();
            this.refresh();
        }
    }

    set glowColor(value: Laya.Vector4) {
        this._glowColor = value;
        this.invalidatePlainTextBatchCache();
        this.refresh();
    }

    set glowSize(value: number) {
        this._glowSize = Math.max(0, value);
        this.invalidatePlainTextBatchCache();
        this.refresh();
    }

    setGlowStyle(color: Laya.Vector4, size: number): void {
        this._glowColor = color;
        this._glowSize = Math.max(0, size);
        this.invalidatePlainTextBatchCache();
    }

    setShadowStyle(color: Laya.Vector4, offsetX: number, offsetY: number, blur: number): void {
        this._shadowColor = color;
        this._shadowOffsetX = offsetX;
        this._shadowOffsetY = offsetY;
        this._shadowBlur = Math.max(0, blur);
        this.invalidatePlainTextBatchCache();
    }

    setViewportFrame(viewportWidth: number, viewportHeight: number, drawOffsetX: number, drawOffsetY: number, clipRectX: number, clipRectY: number, clipRectWidth: number, clipRectHeight: number): void {
        const nextFrame: MsdfViewFrame = {
            width: Math.max(0, viewportWidth),
            height: Math.max(0, viewportHeight),
            drawOffsetX: drawOffsetX || 0,
            drawOffsetY: drawOffsetY || 0,
            clipRectX: clipRectX || 0,
            clipRectY: clipRectY || 0,
            clipRectWidth: Math.max(0, clipRectWidth),
            clipRectHeight: Math.max(0, clipRectHeight)
        };

        if (this.sameViewFrame(this._viewFrame, nextFrame)) {
            return;
        }

        this._viewFrame = nextFrame;
        this.syncViewSize();
        this.redraw();
    }

    set underline(value: boolean) {
        if (this._underline === value) {
            return;
        }
        this._underline = value;
        this._plainTextLayoutDirty = true;
        this.refresh();
    }

    set strikethrough(value: boolean) {
        if (this._strikethrough === value) {
            return;
        }
        this._strikethrough = value;
        this._plainTextLayoutDirty = true;
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
        this._plainTextLayoutDirty = true;
        this.invalidatePlainTextBatchCache();
        this.refresh();
    }

    private resolveShrinkScale(contentWidth: number, contentHeight: number): number {
        if (this._overflow !== "shrink") {
            return 1;
        }

        const limitWidth = this._layoutWidth >= 0 ? this._layoutWidth : Number.POSITIVE_INFINITY;
        const limitHeight = this._layoutHeight >= 0 ? this._layoutHeight : Number.POSITIVE_INFINITY;
        let scale = 1;

        if (Number.isFinite(limitWidth) && contentWidth > limitWidth && contentWidth > 0) {
            scale = Math.min(scale, limitWidth / contentWidth);
        }

        if (Number.isFinite(limitHeight) && contentHeight > limitHeight && contentHeight > 0) {
            scale = Math.min(scale, limitHeight / contentHeight);
        }

        return Math.max(Math.min(scale, 1), 0.01);
    }

    private sameViewFrame(left: MsdfViewFrame, right: MsdfViewFrame): boolean {
        return left.width === right.width
            && left.height === right.height
            && left.drawOffsetX === right.drawOffsetX
            && left.drawOffsetY === right.drawOffsetY
            && left.clipRectX === right.clipRectX
            && left.clipRectY === right.clipRectY
            && left.clipRectWidth === right.clipRectWidth
            && left.clipRectHeight === right.clipRectHeight;
    }

    private getViewWidth(): number {
        if (this._viewFrame.width >= 0) {
            return this._viewFrame.width;
        }

        if (this._layoutWidth >= 0) {
            return this._layoutWidth;
        }

        return this._contentWidth;
    }

    private getViewHeight(): number {
        if (this._viewFrame.height >= 0) {
            return this._viewFrame.height;
        }

        if (this._layoutHeight >= 0) {
            return this._layoutHeight;
        }

        return this._contentHeight;
    }

    private syncViewSize(): void {
        this.size(this.getViewWidth(), this.getViewHeight());
    }

    private clampScroll(): void {
        this._scrollX = Math.min(this._scrollX, this.maxScrollX);
        this._scrollY = Math.min(this._scrollY, this.maxScrollY);
    }

    private invalidatePlainTextBatchCache(): void {
        this._plainTextBatchCache = createEmptyPlainTextBatchCache();
    }

    private getPlainTextLayout(): MsdfLayout {
        // 纯文本布局只会在真正影响字形形状的属性变化时重建。
        if (this._plainTextLayoutDirty) {
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
            this._plainTextLayoutDirty = false;
            this.invalidatePlainTextBatchCache();
        }

        return this._layout;
    }

    private getPlainTextBatchStyleData(layout: MsdfLayout, vertexCount: number, flags: number): Omit<MsdfDrawBatch, "vertices" | "uvs" | "indices"> {
        // layout 已经标明了哪些 quad 是正文、下划线或删除线。
        // 这里把高层样式参数一次性展开成按顶点存储的打包数组，供 drawTrianglesMSDF 直接消费。
        const cache = this._plainTextBatchCache;
        if (cache.layout !== layout) {
            this.invalidatePlainTextBatchCache();
            this._plainTextBatchCache.layout = layout;
        }

        const nextCache = this._plainTextBatchCache;
        const fillDefaultPacked = packVertexColor(this._textColor);
        const fillUnderlinePacked = packVertexColor(this._underlineColor ?? this._textColor);
        const fillStrikethroughPacked = packVertexColor(this._strikethroughColor ?? this._textColor);
        const outlineDefaultPacked = packVertexColor(this._outlineColor);
        const outlineUnderlinePacked = packVertexColor(this._underlineColor ?? this._outlineColor);
        const outlineStrikethroughPacked = packVertexColor(this._strikethroughColor ?? this._outlineColor);
        const glowPacked = packVertexColor(this._glowColor);
        const shadowPacked = packVertexColor(this._shadowColor);
        const packedParamsAValue = packParamsAValue(this._outlineWidth, this._glowSize, this._shadowBlur);
        const packedParamsBValue = packParamsBValue(this._shadowOffsetX, this._shadowOffsetY, flags);

        if (!nextCache.fillColors
            || nextCache.fillDefaultPacked !== fillDefaultPacked
            || nextCache.fillUnderlinePacked !== fillUnderlinePacked
            || nextCache.fillStrikethroughPacked !== fillStrikethroughPacked) {
            nextCache.fillColors = createLayoutColorArray(layout, this._textColor, this._underlineColor, this._strikethroughColor);
            nextCache.fillDefaultPacked = fillDefaultPacked;
            nextCache.fillUnderlinePacked = fillUnderlinePacked;
            nextCache.fillStrikethroughPacked = fillStrikethroughPacked;
        }

        if (!nextCache.outlineColors
            || nextCache.outlineDefaultPacked !== outlineDefaultPacked
            || nextCache.outlineUnderlinePacked !== outlineUnderlinePacked
            || nextCache.outlineStrikethroughPacked !== outlineStrikethroughPacked) {
            nextCache.outlineColors = createLayoutColorArray(layout, this._outlineColor, this._underlineColor, this._strikethroughColor);
            nextCache.outlineDefaultPacked = outlineDefaultPacked;
            nextCache.outlineUnderlinePacked = outlineUnderlinePacked;
            nextCache.outlineStrikethroughPacked = outlineStrikethroughPacked;
        }

        if (!nextCache.glowColors || nextCache.glowPacked !== glowPacked) {
            nextCache.glowColors = createVertexColorArray(this._glowColor, vertexCount);
            nextCache.glowPacked = glowPacked;
        }

        if (!nextCache.shadowColors || nextCache.shadowPacked !== shadowPacked) {
            nextCache.shadowColors = createVertexColorArray(this._shadowColor, vertexCount);
            nextCache.shadowPacked = shadowPacked;
        }

        if (!nextCache.packedParamsA || nextCache.packedParamsAValue !== packedParamsAValue) {
            nextCache.packedParamsA = createPackedParamsAArray(this._outlineWidth, this._glowSize, this._shadowBlur, vertexCount);
            nextCache.packedParamsAValue = packedParamsAValue;
        }

        if (!nextCache.packedParamsB || nextCache.packedParamsBValue !== packedParamsBValue) {
            nextCache.packedParamsB = createPackedParamsBArray(this._shadowOffsetX, this._shadowOffsetY, flags, vertexCount);
            nextCache.packedParamsBValue = packedParamsBValue;
        }

        return {
            fillColors: nextCache.fillColors,
            outlineColors: nextCache.outlineColors,
            glowColors: nextCache.glowColors,
            shadowColors: nextCache.shadowColors,
            packedParamsA: nextCache.packedParamsA,
            packedParamsB: nextCache.packedParamsB
        };
    }

    private applyRenderState(drawBatches: MsdfDrawBatch[], layout: MsdfLayout = createEmptyLayout()): void {
        this._layout = layout;
        this._drawBatches = drawBatches;
        this.syncViewSize();
        this.redraw();
    }

    private resetRenderState(): void {
        this._contentWidth = 0;
        this._contentHeight = 0;
        this._lines = [];
        this.applyRenderState([]);
    }

    private buildPlainTextLineMetrics(shrinkScale: number): MsdfTextLineMetric[] {
        if (this._text.length === 0) {
            return [];
        }

        return this.scaleLineMetrics(this._text.split("\n").map((lineText, index) => ({
            x: 0,
            y: index * (this.font.getLineHeight(this._fontSize) + this._lineSpacing),
            width: this.font.measureTextWidth(lineText, this._fontSize, this._letterSpacing),
            height: this.font.getLineHeight(this._fontSize),
            align: this._defaultAlign,
            text: lineText
        })), shrinkScale);
    }

    private buildPlainTextDrawBatches(shrinkScale: number): MsdfDrawBatch[] {
        if (this._layout.indices.length === 0) {
            return [];
        }

        const vertexCount = this._layout.vertices.length >> 1;
        const vertices = scaleVertices(this._layout.vertices, shrinkScale);
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
        const styleData = this.getPlainTextBatchStyleData(this._layout, vertexCount, flags);

        return [{
            vertices,
            uvs: this._layout.uvs,
            indices: this._layout.indices,
            fillColors: styleData.fillColors,
            outlineColors: styleData.outlineColors,
            glowColors: styleData.glowColors,
            shadowColors: styleData.shadowColors,
            packedParamsA: styleData.packedParamsA,
            packedParamsB: styleData.packedParamsB
        }];
    }

    private updateRichTextLineLayout(line: MsdfRichTextLine, fallbackHeight: number): void {
        let lineHeight = 0;
        let lineWidth = 0;
        let cmd = line.cmd;

        while (cmd) {
            lineHeight = Math.max(lineHeight, cmd.height);
            lineWidth += cmd.width;
            cmd = cmd.next;
        }

        if (lineHeight === 0) {
            lineHeight = fallbackHeight;
        }

        line.height = lineHeight;
        line.width = Math.round(lineWidth);

        cmd = line.cmd;
        while (cmd) {
            cmd.y = alignItemsOffset(lineHeight, cmd.height, line.alignItems);
            cmd = cmd.next;
        }
    }

    private createRichTextLine(y: number): MsdfRichTextLine {
        return {
            y,
            width: 0,
            height: 0,
            cmd: null,
            align: this._defaultAlign,
            alignItems: this._alignItems
        };
    }

    private buildRichTextLineMetrics(lines: MsdfRichTextLine[], shrinkScale: number): MsdfTextLineMetric[] {
        return this.scaleLineMetrics(lines.map(line => ({
            x: 0,
            y: line.y,
            width: line.width,
            height: line.height,
            align: line.align,
            text: this.collectLineText(line)
        })), shrinkScale);
    }

    private measureRichTextLines(lines: MsdfRichTextLine[]): { width: number; height: number; } {
        let width = 0;
        let height = 0;

        for (const line of lines) {
            width = Math.max(width, line.width);
            height = Math.max(height, line.y + line.height);
        }

        return { width, height };
    }

    private layoutRunsForShrink(): MsdfRichTextLine[] {
        if (this._overflow !== "shrink" || this._wordWrapWidth <= 0 || this._layoutHeight <= 0) {
            return this.layoutRuns();
        }

        const originalWrapWidth = this._wordWrapWidth;
        const widthLimit = originalWrapWidth;
        const scaleEpsilon = 0.0001;
        const balanceEpsilon = 0.02;
        type ShrinkCandidate = {
            lines: MsdfRichTextLine[];
            contentWidth: number;
            contentHeight: number;
            widthScale: number;
            heightScale: number;
            scale: number;
            fillScore: number;
        };

        const evaluate = (wrapWidth: number): ShrinkCandidate => {
            this._wordWrapWidth = wrapWidth;
            const lines = this.layoutRuns();
            const contentWidth = this._contentWidth;
            const contentHeight = this._contentHeight;
            const widthScale = contentWidth > 0 ? Math.min(widthLimit / contentWidth, 1) : 1;
            const heightScale = contentHeight > 0 ? Math.min(this._layoutHeight / contentHeight, 1) : 1;
            const scale = Math.min(widthScale, heightScale);
            return {
                lines,
                contentWidth,
                contentHeight,
                widthScale,
                heightScale,
                scale,
                fillScore: (contentWidth * scale) / widthLimit + (contentHeight * scale) / this._layoutHeight
            };
        };

        const pickBetter = (left: ShrinkCandidate, right: ShrinkCandidate): ShrinkCandidate => {
            if (right.scale > left.scale + scaleEpsilon) {
                return right;
            }

            if (Math.abs(right.scale - left.scale) <= scaleEpsilon && right.fillScore > left.fillScore) {
                return right;
            }

            return left;
        };

        let best = evaluate(originalWrapWidth);

        try {
            if (best.widthScale > best.heightScale + scaleEpsilon) {
                let leftWidth = originalWrapWidth;
                let rightWidth = originalWrapWidth;
                let rightCandidate = best;

                for (let i = 0; i < 3; i++) {
                    rightWidth *= 2;
                    rightCandidate = evaluate(rightWidth);
                    best = pickBetter(best, rightCandidate);
                    if (rightCandidate.widthScale <= rightCandidate.heightScale + scaleEpsilon
                        || rightCandidate.scale >= 1 - scaleEpsilon) {
                        break;
                    }
                }

                if (rightCandidate.widthScale <= rightCandidate.heightScale + scaleEpsilon) {
                    for (let i = 0; i < 4; i++) {
                        const midWidth = (leftWidth + rightWidth) * 0.5;
                        const midCandidate = evaluate(midWidth);
                        best = pickBetter(best, midCandidate);

                        if (Math.abs(midCandidate.widthScale - midCandidate.heightScale) <= balanceEpsilon
                            || midCandidate.scale >= 1 - scaleEpsilon
                            || rightWidth - leftWidth <= 1) {
                            break;
                        }

                        if (midCandidate.widthScale > midCandidate.heightScale + scaleEpsilon) {
                            leftWidth = midWidth;
                        } else {
                            rightWidth = midWidth;
                        }
                    }
                }
            }
        } finally {
            this._wordWrapWidth = originalWrapWidth;
        }

        this._contentWidth = best.contentWidth;
        this._contentHeight = best.contentHeight;
        return best.lines;
    }

    private getRichTextMetricBucket(style: MsdfRichTextStyle, metricCache: MsdfRichTextMetricCache): MsdfRichTextMetricBucket {
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
    }

    private getRichTextRenderMetrics(style: MsdfRichTextStyle, metricCache: MsdfRichTextMetricCache): { extraWidth: number; height: number; } {
        return this.getRichTextMetricBucket(style, metricCache).render;
    }

    private getRichTextMetrics(text: string, style: MsdfRichTextStyle, metricCache: MsdfRichTextMetricCache): MsdfRichTextMetrics {
        const bucket = this.getRichTextMetricBucket(style, metricCache);
        const cached = bucket.text.get(text);
        if (cached) {
            return cached;
        }

        const metrics = {
            width: (this.font.measureTextWidth(text, style.fontSize, this._letterSpacing) + bucket.render.extraWidth) * styleScaleX(style)
                + styleSkewExtra(bucket.render.height, style),
            height: bucket.render.height
        };
        bucket.text.set(text, metrics);
        return metrics;
    }

    private applyEllipsisToRichTextLines(
        lines: MsdfRichTextLine[],
        rectWidth: number,
        rectHeight: number,
        lastHeight: number,
        getTextMetrics: (text: string, style: MsdfRichTextStyle) => MsdfRichTextMetrics,
        rebuildLine: (line: MsdfRichTextLine, segments: Array<{ text: string; style: MsdfRichTextStyle; }>, fallbackHeight: number) => void,
        getFallbackStyle: () => MsdfRichTextStyle | null
    ): void {
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

        const segments: MsdfRichTextLineSegment[] = [];
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
            this.font.getLineHeight(fallbackStyle.fontSize) || lastHeight
        );
    }

    private scaleLineMetrics(lines: MsdfTextLineMetric[], scale: number): MsdfTextLineMetric[] {
        if (scale === 1) {
            return lines;
        }

        return lines.map(line => ({
            x: line.x * scale,
            y: line.y * scale,
            width: line.width * scale,
            height: line.height * scale,
            align: line.align,
            text: line.text
        }));
    }

    refresh(): void {
        if (!this.font) {
            this.resetRenderState();
            return;
        }

        if (this._usesRuns) {
            this.refreshRichText();
            return;
        }

        this._layout = this.getPlainTextLayout();
        const shrinkScale = this.resolveShrinkScale(this._layout.width, this._layout.height);
        this._contentWidth = this._layout.width * shrinkScale;
        this._contentHeight = this._layout.height * shrinkScale;
        this._lines = this.buildPlainTextLineMetrics(shrinkScale);
        this.clampScroll();
        this.applyRenderState(this.buildPlainTextDrawBatches(shrinkScale), this._layout);
    }

    private refreshRichText(): void {
        if (!this.font) {
            this.resetRenderState();
            return;
        }

        if (this._runs.length === 0) {
            this.resetRenderState();
            return;
        }

        const lines = this.layoutRunsForShrink();
        const shrinkScale = this.resolveShrinkScale(this._contentWidth, this._contentHeight);
        this._contentWidth *= shrinkScale;
        this._contentHeight *= shrinkScale;
        this._lines = this.buildRichTextLineMetrics(lines, shrinkScale);
        this.clampScroll();
        const contentBoxWidth = this._layoutWidth >= 0 ? this._layoutWidth : this._contentWidth;
        const drawBatches: MsdfDrawBatch[] = [];
        // 富文本里同样的“文本片段 + 样式”组合可能重复出现。
        // 先缓存每个 run 的布局，再把可合并的 run 拼成更大的 GPU batch。
        const layoutCache = new WeakMap<MsdfRichTextStyle, Map<string, MsdfLayout>>();
        let pendingGroup: MsdfDrawBatchGroup | null = null;

        for (const line of lines) {
            const lineAlign = line.align || this._defaultAlign;
            const lineOffsetX = lineAlign === "center"
                ? Math.max((contentBoxWidth - line.width * shrinkScale) * 0.5, 0)
                : lineAlign === "right"
                    ? Math.max(contentBoxWidth - line.width * shrinkScale, 0)
                    : 0;

            let cmd = line.cmd;
            while (cmd) {
                const batch = this.buildRunBatch(
                    cmd,
                    lineOffsetX + cmd.x * shrinkScale - (this._overflow === "scroll" ? this._scrollX : 0),
                    (line.y + cmd.y) * shrinkScale - (this._overflow === "scroll" ? this._scrollY : 0),
                    layoutCache,
                    shrinkScale
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

        this.applyRenderState(drawBatches);
    }

    private syncMaterial(): void {
        if (!this.font) {
            return;
        }

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

        const clipWidth = this._viewFrame.clipRectWidth >= 0 ? this._viewFrame.clipRectWidth : this.width;
        const clipHeight = this._viewFrame.clipRectHeight >= 0 ? this._viewFrame.clipRectHeight : this.height;
        const needsClip = this._overflow === "hidden" || this._overflow === "scroll";
        if (needsClip && (clipWidth <= 0 || clipHeight <= 0)) {
            return;
        }

        const clipped = needsClip;
        if (clipped) {
            this.graphics.save();
            this.graphics.clipRect(this._viewFrame.clipRectX, this._viewFrame.clipRectY, clipWidth, clipHeight);
        }

        // 顶点始终保持在本地文本坐标里，真正的视口偏移在这里通过 x/y 参数施加。
        const drawOffsetX = this._viewFrame.drawOffsetX;
        const drawOffsetY = this._viewFrame.drawOffsetY;

        for (const batch of this._drawBatches) {
            this.graphics.drawTrianglesMSDF(
                this.font.texture,
                drawOffsetX,
                drawOffsetY,
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
        // 富文本会先变成链表形式的中间结构（line -> cmd -> cmd ...），
        // 这样在换行、拆分、ellipsis 裁剪时成本更低，最后再展开成顶点数据。
        const lines: MsdfRichTextLine[] = [];
        const wordWrap = this._wordWrapWidth > 0;
        const noBreakWord = wordWrap;
        const rectWidth = wordWrap
            ? this._wordWrapWidth
            : this._layoutWidth >= 0
                ? this._layoutWidth
                : Number.MAX_VALUE;
        const rectHeight = this._layoutHeight >= 0 ? this._layoutHeight : Number.MAX_VALUE;
        const metricCache: MsdfRichTextMetricCache = new WeakMap();

        let lineX = 0;
        let lineY = 0;
        let lastHeight = this.font.getLineHeight(this._runs[0]?.style.fontSize ?? this.font.lineHeight);
        let currentLine: MsdfRichTextLine | null = null;
        let lastCmd: MsdfRichTextCommand | null = null;

        const getFallbackStyle = (): MsdfRichTextStyle | null => {
            return this._runs[this._runs.length - 1]?.style ?? this._runs[0]?.style ?? null;
        };

        const rebuildLine = (line: MsdfRichTextLine, segments: Array<{ text: string; style: MsdfRichTextStyle; }>, fallbackHeight: number): void => {
            // 在 ellipsis 或重排后，用新的 segments 重新搭建这一行的命令链。
            let width = 0;
            let prev: MsdfRichTextCommand | null = null;

            line.cmd = null;
            line.align = segments[0]?.style.align || this._defaultAlign;
            line.alignItems = segments[0]?.style.alignItems || this._alignItems;

            for (const segment of segments) {
                if (!segment.text) {
                    continue;
                }

                const metrics = this.getRichTextMetrics(segment.text, segment.style, metricCache);
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
            }

            this.updateRichTextLineLayout(line, Math.max(fallbackHeight, 1));
        };

        const addCmd = (text: string, style: MsdfRichTextStyle, metrics?: { width: number; height: number; }): void => {
            // cmd 是富文本排版阶段的中间结构，后续才会展开成真正提交给 GPU 的顶点数据。
            if (!text) {
                return;
            }

            const resolvedMetrics = metrics ?? this.getRichTextMetrics(text, style, metricCache);
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
            // 结束当前行并推进到下一行。last=true 表示只做收尾，不再创建新行。
            lineX = 0;

            if (currentLine) {
                this.updateRichTextLineLayout(currentLine, lastHeight);
                lineY += currentLine.height + this._lineSpacing;
            }

            if (last) {
                return null;
            }

            currentLine = this.createRichTextLine(lineY);
            lines.push(currentLine);
            lastCmd = null;
            return currentLine;
        };

        const splitCmd = (cmd: MsdfRichTextCommand, pos: number): boolean => {
            // 把一个命令从中间切开，常用于把过长的单词或片段拆到下一行。
            const code = cmd.text.charCodeAt(pos);
            if (isLowSurrogate(code)) {
                pos--;
            }

            if (pos <= 0) {
                return false;
            }

            const tail = cmd.text.substring(pos);
            cmd.text = cmd.text.substring(0, pos);
            cmd.width = this.getRichTextMetrics(cmd.text, cmd.style, metricCache).width;

            const nextCmd: MsdfRichTextCommand = {
                text: tail,
                style: cmd.style,
                x: 0,
                y: 0,
                width: this.getRichTextMetrics(tail, cmd.style, metricCache).width,
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
            // 从某个命令开始，把后续命令整体迁移到当前行，避免重新创建和重新测量。
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
            // 换行策略分两步：
            // 1. 先按字符试探这一段还能在本行放下多少；
            // 2. 再尽量回退到词边界，避免把英文/数字单词硬拆开。
            let remainWidth = Math.max(0, rectWidth - lineX);
            const styleMetrics = this.getRichTextRenderMetrics(style, metricCache);
            const totalMetrics = this.getRichTextMetrics(text, style, metricCache);
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
                    // 对英文、数字和标点做额外边界处理，让“词”尽量保持完整。
                    const wordBoundary = part.length > 0 ? ((match = wordBoundaryTest.exec(part)) ? match.index : null) : 0;
                    if (wordBoundary > 0) {
                        if (wordBoundary > part.length - maxWordLength) {
                            j = startIndex + wordBoundary;
                            part = text.substring(startIndex, j);
                            wordWidth = this.getRichTextMetrics(part, style, metricCache).width;
                            charWidth = null;
                        }
                    } else if (wordBoundary != null && lastCmd != null) {
                        let cmd: MsdfRichTextCommand | null = lastCmd;
                        let totalLen = part.length;
                        let newLine = false;

                        // 当前 run 放不下时，回溯当前行里已有的命令，尝试把整词一起挪到下一行。
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
                            wordWidth = this.getRichTextMetrics(part, style, metricCache).width;
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
                    wordWidth = this.getRichTextMetrics(text.substring(startIndex, j + 1), style, metricCache).width;
                }
            }

            addCmd(text.substring(startIndex, len), style);
        };

        addLine();

        for (const run of this._runs) {
            if (!run.text) {
                continue;
            }

            lastHeight = this.getRichTextRenderMetrics(run.style, metricCache).height;
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
        // 先完成正常排版，再统一做 ellipsis 裁剪，这样可以复用已有的测量和重建逻辑。
        this.applyEllipsisToRichTextLines(
            lines,
            rectWidth,
            rectHeight,
            lastHeight,
            (text, style) => this.getRichTextMetrics(text, style, metricCache),
            rebuildLine,
            getFallbackStyle
        );

        const measured = this.measureRichTextLines(lines);
        this._contentWidth = measured.width;
        this._contentHeight = measured.height;
        return lines;
    }

    private buildRunBatch(cmd: MsdfRichTextCommand, x: number, y: number, layoutCache?: WeakMap<MsdfRichTextStyle, Map<string, MsdfLayout>>, shrinkScale: number = 1): MsdfDrawBatch | null {
        const style = cmd.style;
        let styleLayouts = layoutCache?.get(style);
        if (!styleLayouts && layoutCache) {
            styleLayouts = new Map();
            layoutCache.set(style, styleLayouts);
        }

        let layout = styleLayouts?.get(cmd.text);
        if (!layout) {
            // 每个富文本 run 依然复用纯文本的 buildLayout，只是输入样式来自当前 run。
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

        // run 级别的形变都在这里完成：bold 拉宽 X，italic 按 Y 倾斜，
        // shrink 统一缩放，x/y 再把这个 run 放到最终行盒中的目标位置。
        const baseHeight = Math.max(layout.height, this.font.getLineHeight(style.fontSize));
        const italicOffset = styleSkewExtra(baseHeight, style) * shrinkScale;
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

        // 把 run 的局部布局映射到最终顶点：
        // 先应用 bold/italic/shrink，再叠加行内位置偏移。
        for (let i = 0; i < layout.vertices.length; i += 2) {
            const localX = layout.vertices[i] * scaleX * shrinkScale;
            const localY = layout.vertices[i + 1] * shrinkScale;
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
            packedParamsB: createPackedParamsBArray(this._shadowOffsetX, this._shadowOffsetY, flags, vertexCount)
        };
    }
}
