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

type MsdfBatchStyleData = Omit<MsdfDrawBatch, "vertices" | "uvs" | "indices">;

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
export type MsdfTextLineMetric = Laya.ITextLine & {
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

type MsdfRichTextRunMetadata = {
    link?: string | null;
    clickable?: boolean;
};

type MsdfRichTextCommand = {
    text: string;
    style: MsdfRichTextStyle;
    link?: string | null;
    clickable?: boolean;
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
    link?: string | null;
    clickable?: boolean;
    width: number;
    height: number;
};

type MsdfRichTextClickArea = {
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
    link: string | null;
};

type MsdfRichTextLayoutState = {
    lines: MsdfRichTextLine[];
    rectWidth: number;
    rectHeight: number;
    metricCache: MsdfRichTextMetricCache;
    lineX: number;
    lineY: number;
    lastHeight: number;
    currentLine: MsdfRichTextLine | null;
    lastCmd: MsdfRichTextCommand | null;
};

type MsdfRichTextWrapCharInfo = {
    text: string;
    code: number;
    width: number;
};

type MsdfRichTextWrapAdjustment = {
    index: number;
    part: string;
    wordWidth: number;
    charWidth: number | null;
    remainWidth: number;
    continueLoop: boolean;
};

type MsdfRichTextWrapAdvance = {
    index: number;
    startIndex: number;
    remainWidth: number;
    wordWidth: number;
};

type MsdfRichTextShrinkCandidate = {
    lines: MsdfRichTextLine[];
    contentWidth: number;
    contentHeight: number;
    widthScale: number;
    heightScale: number;
    scale: number;
    fillScore: number;
};

type MsdfRichTextLayoutCache = WeakMap<MsdfRichTextStyle, Map<string, MsdfLayout>>;

type MsdfTextRefreshResult = {
    contentWidth: number;
    contentHeight: number;
    lines: MsdfTextLineMetric[];
    drawBatches: MsdfDrawBatch[];
    layout?: MsdfLayout;
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
// 这里的字符编码需要和 scripts/msdf-decoration.ts 保持一致。
const DECORATION_SOURCE_CHAR_CODE = 0xe000;
const DECORATION_SOURCE_CHAR = String.fromCodePoint(DECORATION_SOURCE_CHAR_CODE);
const emojiTest = /[\uD800-\uDBFF][\uDC00-\uDFFF]/;
const wordBoundaryTest = /[a-zA-Z0-9!+/_-]+$/;
const punctuationChars = new Set(
    Array.from(".,，。、!！；;”’)）]】}》").map((char) => char.charCodeAt(0))
);
const maxWordLength = 20;
const KERNING_KEY_MULTIPLIER = 0x110000;
const PACKED_EFFECT_SIZE_MAX = 32;
const PACKED_FACE_DILATE_MAX = 16;
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
        height: 0,
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
        packedParamsB: null,
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
        vertexCount: batch.vertices.length >> 1,
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
    };
}

function appendBatchGroup(
    groups: MsdfDrawBatch[],
    pendingGroup: MsdfDrawBatchGroup | null
): MsdfDrawBatchGroup | null {
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

    return Math.tan((ITALIC_SKEW_DEGREES * Math.PI) / 180) * height;
}

function alignItemsOffset(
    lineHeight: number,
    cmdHeight: number,
    alignItems: string | null | undefined
): number {
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
        const packedColor =
            layout.quadKinds[i] === QUAD_KIND_UNDERLINE
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

function scaleVertices(
    source: Float32Array,
    scale: number,
    offsetX: number = 0,
    offsetY: number = 0
): Float32Array {
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

    return Math.max(0, Math.min(255, Math.round((value / maxValue) * 255)));
}

function packSignedNormalizedByte(value: number, maxValue: number): number {
    if (maxValue <= 0) {
        return 0;
    }

    const normalized = Math.max(-1, Math.min(1, value / maxValue));
    return Math.round(normalized * 127) & 0xff;
}

function packSignedByte(value: number): number {
    const rounded = Math.max(-128, Math.min(127, Math.round(value)));
    return rounded & 0xff;
}

function effectFlags(
    outlineWidth: number,
    outlineColor: Laya.Vector4,
    glowSize: number,
    glowColor: Laya.Vector4,
    shadowOffsetX: number,
    shadowOffsetY: number,
    shadowBlur: number,
    shadowColor: Laya.Vector4
): number {
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

function createPackedParamsAArray(
    outlineWidth: number,
    glowSize: number,
    shadowBlur: number,
    faceDilate: number,
    vertexCount: number
): Uint32Array {
    const values = new Uint32Array(vertexCount);
    const packed = packParamsAValue(outlineWidth, glowSize, shadowBlur, faceDilate);
    values.fill(packed);
    return values;
}

function createPackedParamsBArray(
    shadowOffsetX: number,
    shadowOffsetY: number,
    flags: number,
    vertexCount: number
): Uint32Array {
    const values = new Uint32Array(vertexCount);
    const packed = packParamsBValue(shadowOffsetX, shadowOffsetY, flags);
    values.fill(packed);
    return values;
}

function packParamsAValue(
    outlineWidth: number,
    glowSize: number,
    shadowBlur: number,
    faceDilate: number
): number {
    return (
        (packNormalizedByte(outlineWidth, PACKED_EFFECT_SIZE_MAX) |
            (packNormalizedByte(glowSize, PACKED_EFFECT_SIZE_MAX) << 8) |
            (packNormalizedByte(shadowBlur, PACKED_EFFECT_SIZE_MAX) << 16) |
            (packSignedNormalizedByte(faceDilate, PACKED_FACE_DILATE_MAX) << 24)) >>>
        0
    );
}

function packParamsBValue(shadowOffsetX: number, shadowOffsetY: number, flags: number): number {
    return (
        (packSignedByte(shadowOffsetX * PACKED_SHADOW_OFFSET_SCALE) |
            (packSignedByte(shadowOffsetY * PACKED_SHADOW_OFFSET_SCALE) << 8) |
            ((flags & 0xff) << 16)) >>>
        0
    );
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

function isNil(value: unknown): value is null | undefined {
    return value === null || value === undefined;
}

function hasValue<T>(value: T | null | undefined): value is T {
    return !isNil(value);
}

function colorStringToVector4(
    value: string | null | undefined,
    fallback: Laya.Vector4
): Laya.Vector4 {
    if (!value) {
        return fallback.clone();
    }

    const rgbaValues = Laya.ColorUtils.create(value).arrColor;
    return new Laya.Vector4(
        rgbaValues?.[0] ?? fallback.x,
        rgbaValues?.[1] ?? fallback.y,
        rgbaValues?.[2] ?? fallback.z,
        rgbaValues?.[3] ?? fallback.w
    );
}

function createPlaceholderTextCmd(
    width: number,
    height: number,
    fontSize: number,
    style: Laya.TextStyle
): Laya.ITextCmd {
    return {
        x: 0,
        y: 0,
        width,
        height,
        style,
        ctxFont: "",
        fontSize,
        wt: null as unknown as Laya.WordText,
        obj: null as unknown as Laya.IHtmlObject,
        linkEnd: false,
        next: null as unknown as Laya.ITextCmd,
        prev: null as unknown as Laya.ITextCmd,
    };
}

function createTextLineMetric(
    x: number,
    y: number,
    width: number,
    height: number,
    align: string,
    text: string,
    fontSize: number,
    style: Laya.TextStyle
): MsdfTextLineMetric {
    return {
        x,
        y,
        width,
        height,
        align,
        text,
        cmd: createPlaceholderTextCmd(width, height, fontSize, style),
    };
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

function normalizeFontJson(raw: unknown): MsdfFontJson {
    let data = raw;

    if (data && typeof data === "object" && "data" in data) {
        data = (data as { data: unknown }).data;
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

    static fromResources(texture: Laya.Texture, rawData: unknown): MsdfBitmapFont {
        return new MsdfBitmapFont(texture, normalizeFontJson(rawData));
    }

    static async load(textureUrl: string, jsonUrl: string): Promise<MsdfBitmapFont> {
        const resources = await Laya.loader.load([
            { url: textureUrl, type: Laya.Loader.IMAGE },
            { url: jsonUrl, type: Laya.Loader.JSON },
        ]);

        if (!Array.isArray(resources) || !resources[0]) {
            throw new Error(`Failed to load MSDF texture: ${textureUrl}`);
        }

        return MsdfBitmapFont.fromResources(resources[0] as Laya.Texture, resources[1]);
    }

    constructor(
        readonly texture: Laya.Texture,
        readonly data: MsdfFontJson
    ) {
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
            const kern =
                previousCode >= 0 && glyph
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
        const thickness =
            scale >= LARGE_DECORATION_SCALE_THRESHOLD
                ? baseThickness + LARGE_DECORATION_THICKNESS_BOOST
                : baseThickness;
        const leftOverhang = Math.min(0, this.decorationGlyph.xoffset * scale);
        const rightOverhang = Math.max(
            0,
            (this.decorationGlyph.xoffset +
                this.decorationGlyph.width -
                this.decorationGlyph.xadvance) *
                scale
        );
        const underlineOffset = Math.max(
            UNDERLINE_EXTRA_OFFSET_MIN,
            scale * UNDERLINE_EXTRA_OFFSET_SCALE
        );
        const underlineTop = Math.round(this.decorationGlyph.yoffset * scale + underlineOffset);

        return {
            leftOverhang,
            rightOverhang,
            underlineTop,
            underlineBottom: underlineTop + thickness,
            thickness,
        };
    }

    private reportMissingDecorationGlyph(): void {
        if (this._missingDecorationGlyphReported) {
            return;
        }

        this._missingDecorationGlyphReported = true;
        console.error(
            `[MsdfBitmapFont] decoration glyph U+${DECORATION_SOURCE_CHAR_CODE.toString(16).toUpperCase()} is missing from the atlas; underline/strikethrough will not render.`
        );
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
            const kern =
                previousCode >= 0 && glyph
                    ? (this.kernings.get(kerningKey(previousCode, glyph.id)) ?? 0) * scale
                    : 0;
            const nextWidth = lineWidth + kern + advance + scaledLetterSpacing;

            if (lineWidth > 0 && nextWidth > maxWidth) {
                result += "\n";
                lineWidth = 0;
                previousCode = -1;
            }

            result += char;
            lineWidth +=
                (glyph ? glyph.xadvance * scale : fontSize * 0.5) + kern + scaledLetterSpacing;
            previousCode = glyph?.id ?? -1;
        }

        return result;
    }

    buildLayout(
        text: string,
        fontSize: number,
        letterSpacing: number = 0,
        lineSpacing: number = 0,
        decorations: MsdfDecorationOptions = {}
    ): MsdfLayout {
        // 先把文本转换成可复用的四边形布局。这个阶段只负责生成本地字形几何，
        // 不处理裁剪、滚动、发光/阴影叠加顺序，也不关心最终屏幕上的偏移。
        const scale = fontSize / this.lineHeight;
        const scaledLetterSpacing = letterSpacing * scale;
        const vertices: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];
        const quadKinds: number[] = [];
        const lineHeight = this.lineHeight * scale;
        const lineInfos: Array<{ y: number; advanceWidth: number; left: number; right: number }> = [
            {
                y: 0,
                advanceWidth: 0,
                left: Number.POSITIVE_INFINITY,
                right: Number.NEGATIVE_INFINITY,
            },
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

        const pushQuad = (
            glyph: MsdfGlyph,
            left: number,
            top: number,
            right: number,
            bottom: number,
            quadKind: number = QUAD_KIND_TEXT
        ): void => {
            // 每个字形或装饰线最终都对应一个带 UV 的四边形。
            const u0 = glyph.x / this.atlasWidth;
            const v0 = glyph.y / this.atlasHeight;
            const u1 = (glyph.x + glyph.width) / this.atlasWidth;
            const v1 = (glyph.y + glyph.height) / this.atlasHeight;

            vertices.push(left, top, right, top, right, bottom, left, bottom);

            uvs.push(u0, v0, u1, v0, u1, v1, u0, v1);

            const vertexOffset = quadCount * 4;
            indices.push(
                vertexOffset,
                vertexOffset + 1,
                vertexOffset + 2,
                vertexOffset,
                vertexOffset + 2,
                vertexOffset + 3
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
                    right: Number.NEGATIVE_INFINITY,
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
                        pushQuad(
                            decorationGlyph,
                            lineLeft,
                            top,
                            lineRight,
                            top + decorationMetrics.thickness,
                            QUAD_KIND_UNDERLINE
                        );
                    }

                    if (decorations.strikethrough) {
                        const top = line.y + lineHeight * 0.5 - decorationMetrics.thickness * 0.5;
                        pushQuad(
                            decorationGlyph,
                            lineLeft,
                            top,
                            lineRight,
                            top + decorationMetrics.thickness,
                            QUAD_KIND_STRIKETHROUGH
                        );
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
                height: lineCount * lineHeight + Math.max(0, lineCount - 1) * lineSpacing,
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
            height: Math.max(
                lineCount * lineHeight + Math.max(0, lineCount - 1) * lineSpacing,
                maxY - shiftY
            ),
        };
    }
}

export class MsdfText extends Laya.Text {
    private _msdfFont: MsdfBitmapFont | null = null;
    private materialInstance: Laya.Material;

    private _fontSize = 16;
    private _letterSpacing = 0;
    private _lineSpacing = 0;
    private _faceDilate = 0;
    private _textColor = DEFAULT_TEXT_COLOR.clone();
    private _underlineColor: Laya.Vector4 | null = null;
    private _strikethroughColor: Laya.Vector4 | null = null;
    private _outlineColor = DEFAULT_OUTLINE_COLOR.clone();
    private _outlineWidth = 0;
    private _glowColor = DEFAULT_GLOW_COLOR.clone();
    private _glowSize = 0;
    private _shadowColor = DEFAULT_SHADOW_COLOR.clone();
    private _shadowOffsetX = 0;
    private _shadowOffsetY = 0;
    private _shadowBlur = 0;
    private _underline = false;
    private _strikethrough = false;
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
        clipRectHeight: NO_CONSTRAINT,
    };
    private _defaultAlign = "left";
    private _alignItems = "middle";
    private _contentWidth = 0;
    private _contentHeight = 0;
    private _scrollX = 0;
    private _scrollY = 0;
    private _drawBatches: MsdfDrawBatch[] = [];
    private _plainTextLayoutDirty = true;
    private _plainTextBatchCache: MsdfPlainTextBatchCache = createEmptyPlainTextBatchCache();
    private _richTextClickAreas: MsdfRichTextClickArea[] = [];
    private _richTextClickListening = false;
    private _richTextClickSavedHitArea!: Laya.IHitArea;
    private _richTextClickSavedMouseEnabled = false;
    private _richTextClickSavedMouseThrough = true;
    private _syncingViewSize = false;
    private readonly _richTextHitArea: Laya.IHitArea = {
        contains: (x: number, y: number): boolean => this.hitRichTextClickArea(x, y) !== null,
    };

    constructor() {
        super();
        this._fontSize = 16;
        this._textStyle.fontSize = this._fontSize;
        this._lineSpacing = 0;
        this._textStyle.leading = this._lineSpacing;
        this._defaultAlign = "left";
        this._textStyle.align = this._defaultAlign;
        this._alignItems = "middle";
        this._textStyle.alignItems = this._alignItems;
        this._textStyle.color = "#ffffff";
        this._textStyle.stroke = 0;
        this._textStyle.strokeColor = "#000000";
        this.materialInstance = new Laya.Material();
        this.material = this.materialInstance;
        this.mouseThrough = true;
        this._richTextClickSavedHitArea = this.hitArea;

        this.syncMaterial();
        this.refresh();
    }

    override get text(): string {
        return this._text;
    }

    override set text(value: string) {
        let nextValue = value;
        if (isNil(nextValue)) {
            nextValue = "";
        } else if (typeof nextValue !== "string") {
            nextValue = `${nextValue}`;
        }

        if (!this.ignoreLang && Laya.Text.langPacks) {
            nextValue = Laya.Text.langPacks[nextValue] || nextValue;
        }

        const textChanged = this._text !== nextValue;
        if (!this._usesRuns && !textChanged) {
            return;
        }

        this._text = nextValue;
        this._usesRuns = false;
        this._runs = [];
        this.refreshAfterPlainTextLayoutChange();

        if (textChanged) {
            this.event(Laya.Event.CHANGE);
        }
    }

    override changeText(text: string): void {
        this.text = text;
    }

    override get fontSize(): number {
        return this._fontSize;
    }

    override set fontSize(value: number) {
        if (this._fontSize === value) {
            return;
        }
        this._fontSize = value;
        this._textStyle.fontSize = value;
        this.refreshAfterPlainTextLayoutChange();
    }

    override get align(): string {
        return this._defaultAlign;
    }

    override set align(value: string) {
        const next = value || "left";
        if (this._defaultAlign === next) {
            return;
        }

        this._defaultAlign = next;
        this._textStyle.align = next;
        this.refreshAfterPlainTextLayoutChange();
    }

    override get alignItems(): string {
        return this._alignItems;
    }

    override set alignItems(value: string) {
        const next = value || "middle";
        if (this._alignItems === next) {
            return;
        }

        this._alignItems = next;
        this._textStyle.alignItems = next;
        this.refreshAfterPlainTextLayoutChange();
    }

    override get leading(): number {
        return this._lineSpacing;
    }

    override set leading(value: number) {
        if (this._lineSpacing === value) {
            return;
        }

        this._lineSpacing = value;
        this._textStyle.leading = value;
        this.refreshAfterPlainTextLayoutChange();
    }

    override get color(): string {
        return this._textStyle.color;
    }

    override set color(value: string) {
        const next = value || "#ffffff";
        if (this._textStyle.color === next) {
            return;
        }

        this._textStyle.color = next;
        this._textColor = colorStringToVector4(next, DEFAULT_TEXT_COLOR);
        this.refreshAfterPlainTextStyleChange();
    }

    override get stroke(): number {
        return this._outlineWidth;
    }

    override set stroke(value: number) {
        if (this._outlineWidth === value) {
            return;
        }

        this._outlineWidth = value;
        this._textStyle.stroke = value;
        this.refreshAfterPlainTextStyleChange();
    }

    override get strokeColor(): string {
        return this._textStyle.strokeColor;
    }

    override set strokeColor(value: string) {
        const next = value || "#000000";
        if (this._textStyle.strokeColor === next) {
            return;
        }

        this._textStyle.strokeColor = next;
        this._outlineColor = colorStringToVector4(next, DEFAULT_OUTLINE_COLOR);
        this.refreshAfterPlainTextStyleChange();
    }

    override get underline(): boolean {
        return this._underline;
    }

    override set underline(value: boolean) {
        if (this._underline === value) {
            return;
        }

        this._underline = value;
        this._textStyle.underline = value;
        this.refreshAfterPlainTextLayoutChange();
    }

    override get underlineColor(): string {
        return this._textStyle.underlineColor;
    }

    override set underlineColor(value: string) {
        const next = isNil(value) ? "" : value;
        if ((this._textStyle.underlineColor || "") === next) {
            return;
        }

        this._textStyle.underlineColor = next;
        this._underlineColor = next ? colorStringToVector4(next, this._textColor) : null;
        this.refreshAfterPlainTextStyleChange();
    }

    override get strikethrough(): boolean {
        return this._strikethrough;
    }

    override set strikethrough(value: boolean) {
        if (this._strikethrough === value) {
            return;
        }

        this._strikethrough = value;
        this._textStyle.strikethrough = value;
        this.refreshAfterPlainTextLayoutChange();
    }

    override get strikethroughColor(): string {
        return this._textStyle.strikethroughColor;
    }

    override set strikethroughColor(value: string) {
        const next = isNil(value) ? "" : value;
        if ((this._textStyle.strikethroughColor || "") === next) {
            return;
        }

        this._textStyle.strikethroughColor = next;
        this._strikethroughColor = next ? colorStringToVector4(next, this._textColor) : null;
        this.refreshAfterPlainTextStyleChange();
    }

    override get wordWrap(): boolean {
        return this._wordWrap;
    }

    override set wordWrap(value: boolean) {
        if (this._wordWrap === value) {
            return;
        }

        this._wordWrap = value;
        this.refreshAfterPlainTextLayoutChange();
    }

    set letterSpacing(value: number) {
        if (this._letterSpacing === value) {
            return;
        }
        this._letterSpacing = value;
        this.refreshAfterPlainTextLayoutChange();
    }

    set lineSpacing(value: number) {
        if (this._lineSpacing === value) {
            return;
        }
        this._lineSpacing = value;
        this.refreshAfterPlainTextLayoutChange();
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
        this.align = value;
    }

    get contentWidth(): number {
        this.typeset();
        return this._contentWidth;
    }

    get contentHeight(): number {
        this.typeset();
        return this._contentHeight;
    }

    override get lines(): ReadonlyArray<MsdfTextLineMetric> {
        this.typeset();
        return this._lines as unknown as ReadonlyArray<MsdfTextLineMetric>;
    }

    override get overflow(): MsdfOverflow {
        return this._overflow as MsdfOverflow;
    }

    override set overflow(value: MsdfOverflow) {
        const next = value || "visible";
        if (this._overflow === next) {
            return;
        }

        this._overflow = next;
        this.refresh();
    }

    override get scrollX(): number {
        return this._scrollX;
    }

    override set scrollX(value: number) {
        this.updateScrollValue("x", value);
    }

    override get scrollY(): number {
        return this._scrollY;
    }

    override set scrollY(value: number) {
        this.updateScrollValue("y", value);
    }

    override get maxScrollX(): number {
        const viewportWidth = this._layoutWidth >= 0 ? this._layoutWidth : this.width;
        return Math.max(this._contentWidth - viewportWidth, 0);
    }

    override get maxScrollY(): number {
        const viewportHeight = this._layoutHeight >= 0 ? this._layoutHeight : this.height;
        return Math.max(this._contentHeight - viewportHeight, 0);
    }

    set textColor(value: Laya.Vector4) {
        this._textColor = value;
        this.refreshAfterPlainTextStyleChange();
    }

    set faceDilate(value: number) {
        const next = Number.isFinite(value) ? value : 0;
        if (this._faceDilate === next) {
            return;
        }

        this._faceDilate = next;
        this.refreshAfterEffectChange();
    }

    set outlineColor(value: Laya.Vector4) {
        this._outlineColor = value;
        this.refreshAfterPlainTextStyleChange();
    }

    set outlineWidth(value: number) {
        this._outlineWidth = value;
        this.refreshAfterPlainTextStyleChange();
    }

    set glowColor(value: Laya.Vector4) {
        this._glowColor = value;
        this.refreshAfterEffectChange();
    }

    set glowSize(value: number) {
        this._glowSize = Math.max(0, value);
        this.refreshAfterEffectChange();
    }

    setGlowStyle(color: Laya.Vector4, size: number): void {
        this._glowColor = color;
        this._glowSize = Math.max(0, size);
        this.refreshAfterEffectChange(false);
    }

    setShadowStyle(color: Laya.Vector4, offsetX: number, offsetY: number, blur: number): void {
        this._shadowColor = color;
        this._shadowOffsetX = offsetX;
        this._shadowOffsetY = offsetY;
        this._shadowBlur = Math.max(0, blur);
        this.refreshAfterEffectChange(false);
    }

    setViewportFrame(
        viewportWidth: number,
        viewportHeight: number,
        drawOffsetX: number,
        drawOffsetY: number,
        clipRectX: number,
        clipRectY: number,
        clipRectWidth: number,
        clipRectHeight: number
    ): void {
        const nextFrame = this.createViewFrame(
            viewportWidth,
            viewportHeight,
            drawOffsetX,
            drawOffsetY,
            clipRectX,
            clipRectY,
            clipRectWidth,
            clipRectHeight
        );

        if (this.sameViewFrame(this._viewFrame, nextFrame)) {
            return;
        }

        this._viewFrame = nextFrame;
        this.syncViewSize();
        this.redraw();
    }

    setRuns(value: MsdfRichTextRun[]): void {
        this._usesRuns = true;
        this._runs = value ? value.slice() : [];
    }

    resetFont(font: MsdfBitmapFont): void {
        this._msdfFont = font;
        this.materialInstance = font.renderState.material;
        this.material = this.materialInstance;
        this.refreshAfterPlainTextLayoutChange(true);
    }

    private requireFont(): MsdfBitmapFont {
        return this._msdfFont!;
    }

    private refreshAfterPlainTextLayoutChange(invalidateBatchCache: boolean = false): void {
        this._plainTextLayoutDirty = true;
        if (invalidateBatchCache) {
            this.invalidatePlainTextBatchCache();
        }
        this.refresh();
    }

    private refreshAfterPlainTextStyleChange(): void {
        if (this._usesRuns) {
            return;
        }

        this.invalidatePlainTextBatchCache();
        this.refresh();
    }

    private refreshAfterEffectChange(refreshNow: boolean = true): void {
        this.invalidatePlainTextBatchCache();
        if (refreshNow) {
            this.refresh();
        }
    }

    private updateScrollValue(axis: "x" | "y", value: number): void {
        const next = this._msdfFont
            ? Math.min(Math.max(value || 0, 0), axis === "x" ? this.maxScrollX : this.maxScrollY)
            : Math.max(value || 0, 0);
        const current = axis === "x" ? this._scrollX : this._scrollY;
        if (current === next) {
            return;
        }

        if (axis === "x") {
            this._scrollX = next;
        } else {
            this._scrollY = next;
        }

        this.refresh();
    }

    private createViewFrame(
        viewportWidth: number,
        viewportHeight: number,
        drawOffsetX: number,
        drawOffsetY: number,
        clipRectX: number,
        clipRectY: number,
        clipRectWidth: number,
        clipRectHeight: number
    ): MsdfViewFrame {
        return {
            width: Math.max(0, viewportWidth),
            height: Math.max(0, viewportHeight),
            drawOffsetX: drawOffsetX || 0,
            drawOffsetY: drawOffsetY || 0,
            clipRectX: clipRectX || 0,
            clipRectY: clipRectY || 0,
            clipRectWidth: Math.max(0, clipRectWidth),
            clipRectHeight: Math.max(0, clipRectHeight),
        };
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
        return (
            left.width === right.width &&
            left.height === right.height &&
            left.drawOffsetX === right.drawOffsetX &&
            left.drawOffsetY === right.drawOffsetY &&
            left.clipRectX === right.clipRectX &&
            left.clipRectY === right.clipRectY &&
            left.clipRectWidth === right.clipRectWidth &&
            left.clipRectHeight === right.clipRectHeight
        );
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
        this._syncingViewSize = true;
        try {
            this.size(this.getViewWidth(), this.getViewHeight());
        } finally {
            this._syncingViewSize = false;
        }
    }

    private clampScroll(): void {
        this._scrollX = Math.min(this._scrollX, this.maxScrollX);
        this._scrollY = Math.min(this._scrollY, this.maxScrollY);
    }

    private invalidatePlainTextBatchCache(): void {
        this._plainTextBatchCache = createEmptyPlainTextBatchCache();
    }

    private resolveActiveWrapWidth(): number {
        if (this._wordWrapWidth > 0) {
            return this._wordWrapWidth;
        }

        if (!this._wordWrap) {
            return 0;
        }

        if (this._layoutWidth >= 0) {
            return this._layoutWidth;
        }

        if (this._maxWidth > 0) {
            return this._maxWidth;
        }

        return this._isWidthSet ? this.width : 0;
    }

    private resolvePlainTextLayoutText(font: MsdfBitmapFont): string {
        const wrapWidth = this.resolveActiveWrapWidth();
        if (wrapWidth <= 0) {
            return this._text;
        }

        return font.wrapText(this._text, this._fontSize, wrapWidth, this._letterSpacing);
    }

    private getPlainTextLayout(): MsdfLayout {
        // 纯文本布局只会在真正影响字形形状的属性变化时重建。
        const font = this.requireFont();
        if (this._plainTextLayoutDirty) {
            const layoutText = this.resolvePlainTextLayoutText(font);
            this._layout = font.buildLayout(
                layoutText,
                this._fontSize,
                this._letterSpacing,
                this._lineSpacing,
                {
                    underline: this._underline,
                    strikethrough: this._strikethrough,
                }
            );
            this._plainTextLayoutDirty = false;
            this.invalidatePlainTextBatchCache();
        }

        return this._layout;
    }

    private getPlainTextBatchStyleData(
        layout: MsdfLayout,
        vertexCount: number,
        flags: number
    ): MsdfBatchStyleData {
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
        const fillStrikethroughPacked = packVertexColor(
            this._strikethroughColor ?? this._textColor
        );
        const outlineDefaultPacked = packVertexColor(this._outlineColor);
        const outlineUnderlinePacked = packVertexColor(this._underlineColor ?? this._outlineColor);
        const outlineStrikethroughPacked = packVertexColor(
            this._strikethroughColor ?? this._outlineColor
        );
        const glowPacked = packVertexColor(this._glowColor);
        const shadowPacked = packVertexColor(this._shadowColor);
        const packedParamsAValue = packParamsAValue(
            this._outlineWidth,
            this._glowSize,
            this._shadowBlur,
            this._faceDilate
        );
        const packedParamsBValue = packParamsBValue(
            this._shadowOffsetX,
            this._shadowOffsetY,
            flags
        );

        if (
            !nextCache.fillColors ||
            nextCache.fillDefaultPacked !== fillDefaultPacked ||
            nextCache.fillUnderlinePacked !== fillUnderlinePacked ||
            nextCache.fillStrikethroughPacked !== fillStrikethroughPacked
        ) {
            nextCache.fillColors = createLayoutColorArray(
                layout,
                this._textColor,
                this._underlineColor,
                this._strikethroughColor
            );
            nextCache.fillDefaultPacked = fillDefaultPacked;
            nextCache.fillUnderlinePacked = fillUnderlinePacked;
            nextCache.fillStrikethroughPacked = fillStrikethroughPacked;
        }

        if (
            !nextCache.outlineColors ||
            nextCache.outlineDefaultPacked !== outlineDefaultPacked ||
            nextCache.outlineUnderlinePacked !== outlineUnderlinePacked ||
            nextCache.outlineStrikethroughPacked !== outlineStrikethroughPacked
        ) {
            nextCache.outlineColors = createLayoutColorArray(
                layout,
                this._outlineColor,
                this._underlineColor,
                this._strikethroughColor
            );
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
            nextCache.packedParamsA = createPackedParamsAArray(
                this._outlineWidth,
                this._glowSize,
                this._shadowBlur,
                this._faceDilate,
                vertexCount
            );
            nextCache.packedParamsAValue = packedParamsAValue;
        }

        if (!nextCache.packedParamsB || nextCache.packedParamsBValue !== packedParamsBValue) {
            nextCache.packedParamsB = createPackedParamsBArray(
                this._shadowOffsetX,
                this._shadowOffsetY,
                flags,
                vertexCount
            );
            nextCache.packedParamsBValue = packedParamsBValue;
        }

        return {
            fillColors: nextCache.fillColors,
            outlineColors: nextCache.outlineColors,
            glowColors: nextCache.glowColors,
            shadowColors: nextCache.shadowColors,
            packedParamsA: nextCache.packedParamsA,
            packedParamsB: nextCache.packedParamsB,
        };
    }

    private applyRenderState(
        drawBatches: MsdfDrawBatch[],
        layout: MsdfLayout = createEmptyLayout()
    ): void {
        this._layout = layout;
        this._drawBatches = drawBatches;
        this.syncViewSize();
        this.syncRichTextClickState();
        this.redraw();
    }

    private applyRefreshResult(result: MsdfTextRefreshResult): void {
        this._contentWidth = result.contentWidth;
        this._contentHeight = result.contentHeight;
        this._lines = result.lines;
        this.clampScroll();
        this.applyRenderState(result.drawBatches, result.layout ?? createEmptyLayout());
    }

    private resetRenderState(): void {
        this._contentWidth = 0;
        this._contentHeight = 0;
        this._lines = [];
        this.clearRichTextClickAreas();
        this.applyRenderState([]);
    }

    private clearRichTextClickAreas(): void {
        this._richTextClickAreas.length = 0;
    }

    private syncRichTextClickState(): void {
        const hasClickAreas = this._richTextClickAreas.length > 0;

        if (hasClickAreas) {
            if (!this._richTextClickListening) {
                this._richTextClickSavedHitArea = this.hitArea;
                this._richTextClickSavedMouseEnabled = this.mouseEnabled;
                this._richTextClickSavedMouseThrough = this.mouseThrough;
                this.mouseEnabled = true;
            }

            this.hitArea = this._richTextHitArea;
            this.mouseThrough = false;

            if (this._richTextClickListening) {
                return;
            }

            this.on(Laya.Event.CLICK, this, this.handleRichTextClick);
            this._richTextClickListening = true;
            return;
        }

        if (!this._richTextClickListening) {
            return;
        }

        this.off(Laya.Event.CLICK, this, this.handleRichTextClick);
        this._richTextClickListening = false;
        this.hitArea = this._richTextClickSavedHitArea;
        this.mouseEnabled = this._richTextClickSavedMouseEnabled;
        this.mouseThrough = this._richTextClickSavedMouseThrough;
    }

    private isPointInsideActiveClip(x: number, y: number): boolean {
        if (this._overflow !== "hidden" && this._overflow !== "scroll") {
            return true;
        }

        const clipWidth =
            this._viewFrame.clipRectWidth >= 0 ? this._viewFrame.clipRectWidth : this.width;
        const clipHeight =
            this._viewFrame.clipRectHeight >= 0 ? this._viewFrame.clipRectHeight : this.height;
        const clipX = this._viewFrame.clipRectX;
        const clipY = this._viewFrame.clipRectY;

        return (
            clipWidth > 0 &&
            clipHeight > 0 &&
            x >= clipX &&
            y >= clipY &&
            x <= clipX + clipWidth &&
            y <= clipY + clipHeight
        );
    }

    private hitRichTextClickArea(x: number, y: number): MsdfRichTextClickArea | null {
        if (this._richTextClickAreas.length === 0 || !this.isPointInsideActiveClip(x, y)) {
            return null;
        }

        const localX = x - this._viewFrame.drawOffsetX;
        const localY = y - this._viewFrame.drawOffsetY;

        for (let i = this._richTextClickAreas.length - 1; i >= 0; i--) {
            const area = this._richTextClickAreas[i];
            if (
                localX >= area.x &&
                localY >= area.y &&
                localX <= area.x + area.width &&
                localY <= area.y + area.height
            ) {
                return area;
            }
        }

        return null;
    }

    private handleRichTextClick(): void {
        const area = this.hitRichTextClickArea(this.mouseX, this.mouseY);
        if (!area) {
            return;
        }

        this.bubbleEvent(Laya.Event.LINK, area.link ?? area.text);
    }

    private buildPlainTextLineMetrics(shrinkScale: number): MsdfTextLineMetric[] {
        if (this._text.length === 0) {
            return [];
        }

        const font = this.requireFont();
        const layoutText = this.resolvePlainTextLayoutText(font);

        return this.scaleLineMetrics(
            layoutText
                .split("\n")
                .map((lineText, index) =>
                    createTextLineMetric(
                        0,
                        index * (font.getLineHeight(this._fontSize) + this._lineSpacing),
                        font.measureTextWidth(lineText, this._fontSize, this._letterSpacing),
                        font.getLineHeight(this._fontSize),
                        this._defaultAlign,
                        lineText,
                        this._fontSize,
                        this._textStyle
                    )
                ),
            shrinkScale
        );
    }

    private getScrollOffsetX(): number {
        return this._overflow === "scroll" ? this._scrollX : 0;
    }

    private getScrollOffsetY(): number {
        return this._overflow === "scroll" ? this._scrollY : 0;
    }

    private applyScrollOffsetToVertices(vertices: Float32Array): void {
        const scrollOffsetX = this.getScrollOffsetX();
        const scrollOffsetY = this.getScrollOffsetY();
        if (scrollOffsetX === 0 && scrollOffsetY === 0) {
            return;
        }

        for (let i = 0; i < vertices.length; i += 2) {
            vertices[i] -= scrollOffsetX;
            vertices[i + 1] -= scrollOffsetY;
        }
    }

    private getEffectFlagsForStyle(outlineWidth: number, outlineColor: Laya.Vector4): number {
        return effectFlags(
            outlineWidth,
            outlineColor,
            this._glowSize,
            this._glowColor,
            this._shadowOffsetX,
            this._shadowOffsetY,
            this._shadowBlur,
            this._shadowColor
        );
    }

    private buildPlainTextDrawBatches(shrinkScale: number): MsdfDrawBatch[] {
        if (this._layout.indices.length === 0) {
            return [];
        }

        const vertexCount = this._layout.vertices.length >> 1;
        const vertices = scaleVertices(this._layout.vertices, shrinkScale);
        this.applyScrollOffsetToVertices(vertices);

        const flags = this.getEffectFlagsForStyle(this._outlineWidth, this._outlineColor);
        const styleData = this.getPlainTextBatchStyleData(this._layout, vertexCount, flags);

        return [
            {
                vertices,
                uvs: this._layout.uvs,
                indices: this._layout.indices,
                fillColors: styleData.fillColors,
                outlineColors: styleData.outlineColors,
                glowColors: styleData.glowColors,
                shadowColors: styleData.shadowColors,
                packedParamsA: styleData.packedParamsA,
                packedParamsB: styleData.packedParamsB,
            },
        ];
    }

    private buildPlainTextRefreshResult(): MsdfTextRefreshResult {
        this.clearRichTextClickAreas();
        this._layout = this.getPlainTextLayout();
        const shrinkScale = this.resolveShrinkScale(this._layout.width, this._layout.height);

        return {
            contentWidth: this._layout.width * shrinkScale,
            contentHeight: this._layout.height * shrinkScale,
            lines: this.buildPlainTextLineMetrics(shrinkScale),
            drawBatches: this.buildPlainTextDrawBatches(shrinkScale),
            layout: this._layout,
        };
    }

    private buildRichTextRefreshResult(): MsdfTextRefreshResult {
        const lines = this.layoutRunsForShrink();
        const shrinkScale = this.resolveShrinkScale(this._contentWidth, this._contentHeight);

        return {
            contentWidth: this._contentWidth * shrinkScale,
            contentHeight: this._contentHeight * shrinkScale,
            lines: this.buildRichTextLineMetrics(lines, shrinkScale),
            drawBatches: this.buildRichTextDrawBatches(lines, shrinkScale),
        };
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
            alignItems: this._alignItems,
        };
    }

    private createRichTextLayoutState(): MsdfRichTextLayoutState {
        const font = this.requireFont();
        const wrapWidth = this.resolveActiveWrapWidth();

        return {
            lines: [],
            rectWidth:
                wrapWidth > 0
                    ? wrapWidth
                    : this._layoutWidth >= 0
                      ? this._layoutWidth
                      : Number.MAX_VALUE,
            rectHeight: this._layoutHeight >= 0 ? this._layoutHeight : Number.MAX_VALUE,
            metricCache: new WeakMap(),
            lineX: 0,
            lineY: 0,
            lastHeight: font.getLineHeight(this._runs[0]?.style.fontSize ?? font.lineHeight),
            currentLine: null,
            lastCmd: null,
        };
    }

    private getRichTextFallbackStyle(): MsdfRichTextStyle | null {
        return this._runs[this._runs.length - 1]?.style ?? this._runs[0]?.style ?? null;
    }

    private rebuildRichTextLine(
        line: MsdfRichTextLine,
        segments: Array<{
            text: string;
            style: MsdfRichTextStyle;
            link?: string | null;
            clickable?: boolean;
        }>,
        fallbackHeight: number,
        metricCache: MsdfRichTextMetricCache
    ): void {
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
                link: segment.link ?? null,
                clickable: !!segment.clickable,
                x: width,
                y: 0,
                width: metrics.width,
                height: cmdHeight,
                next: null,
                prev,
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
    }

    private appendRichTextCommand(
        state: MsdfRichTextLayoutState,
        text: string,
        style: MsdfRichTextStyle,
        metrics?: MsdfRichTextMetrics,
        link?: string | null,
        clickable?: boolean
    ): void {
        // cmd 是富文本排版阶段的中间结构，后续才会展开成真正提交给 GPU 的顶点数据。
        if (!text || !state.currentLine) {
            return;
        }

        const resolvedMetrics = metrics ?? this.getRichTextMetrics(text, style, state.metricCache);
        const cmdHeight = Math.max(resolvedMetrics.height, 1);
        const cmd: MsdfRichTextCommand = {
            text,
            style,
            link: link ?? null,
            clickable: !!clickable,
            x: state.lineX,
            y: 0,
            width: resolvedMetrics.width,
            height: cmdHeight,
            next: null,
            prev: state.lastCmd,
        };

        if (!state.currentLine.cmd) {
            state.currentLine.align = style.align || this._defaultAlign;
            state.currentLine.alignItems = style.alignItems || this._alignItems;
        }

        state.lineX += Math.round(cmd.width);
        if (state.lastCmd) {
            state.lastCmd.next = cmd;
        } else {
            state.currentLine.cmd = cmd;
        }
        state.lastCmd = cmd;
        state.lastHeight = cmdHeight;
    }

    private advanceRichTextLine(
        state: MsdfRichTextLayoutState,
        last: boolean = false
    ): MsdfRichTextLine | null {
        // 结束当前行并推进到下一行。last=true 表示只做收尾，不再创建新行。
        state.lineX = 0;

        if (state.currentLine) {
            this.updateRichTextLineLayout(state.currentLine, state.lastHeight);
            state.lineY += state.currentLine.height + this._lineSpacing;
        }

        if (last) {
            return null;
        }

        state.currentLine = this.createRichTextLine(state.lineY);
        state.lines.push(state.currentLine);
        state.lastCmd = null;
        return state.currentLine;
    }

    private splitRichTextCommandAt(
        cmd: MsdfRichTextCommand,
        pos: number,
        metricCache: MsdfRichTextMetricCache
    ): boolean {
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
            link: cmd.link ?? null,
            clickable: !!cmd.clickable,
            x: 0,
            y: 0,
            width: this.getRichTextMetrics(tail, cmd.style, metricCache).width,
            height: cmd.height,
            next: cmd.next,
            prev: cmd,
        };

        if (nextCmd.next) {
            nextCmd.next.prev = nextCmd;
        }

        cmd.next = nextCmd;
        return true;
    }

    private moveRichTextCommands(
        state: MsdfRichTextLayoutState,
        cmd: MsdfRichTextCommand | null
    ): void {
        // 从某个命令开始，把后续命令整体迁移到当前行，避免重新创建和重新测量。
        if (!cmd || !state.currentLine) {
            return;
        }

        if (cmd.prev) {
            cmd.prev.next = null;
        }

        while (cmd) {
            const next: MsdfRichTextCommand | null = cmd.next;
            cmd.x = state.lineX;
            cmd.y = 0;
            cmd.next = null;
            cmd.prev = state.lastCmd;

            if (!state.lastCmd) {
                state.currentLine.align = cmd.style.align || this._defaultAlign;
                state.currentLine.alignItems = cmd.style.alignItems || this._alignItems;
                state.currentLine.cmd = cmd;
            } else {
                state.lastCmd.next = cmd;
            }

            state.lineX += Math.round(cmd.width);
            state.lastCmd = cmd;
            cmd = next;
        }
    }

    private getRichTextWrapCharInfo(
        text: string,
        index: number,
        emoji: boolean,
        style: MsdfRichTextStyle
    ): MsdfRichTextWrapCharInfo {
        const font = this.requireFont();
        let charText = text.charAt(index);
        const code = charText.charCodeAt(0);
        if (emoji && isHighSurrogate(code) && index + 1 < text.length) {
            charText += text.charAt(index + 1);
        }

        return {
            text: charText,
            code,
            width:
                font.measureTextWidth(charText, style.fontSize, this._letterSpacing) *
                styleScaleX(style),
        };
    }

    private tryMoveTrailingWordToNextLine(
        state: MsdfRichTextLayoutState,
        currentPartLength: number,
        isPunctuation: boolean
    ): boolean {
        let cmd: MsdfRichTextCommand | null = state.lastCmd;
        let totalLen = currentPartLength;
        let match: RegExpExecArray | null = null;

        // 当前 run 放不下时，回溯当前行里已有的命令，尝试把整词一起挪到下一行。
        while (cmd) {
            if (cmd.width > 0) {
                match = wordBoundaryTest.exec(cmd.text);
                const textLen = cmd.text.length;
                if (match === null) {
                    this.advanceRichTextLine(state);
                    if (isPunctuation && totalLen === 0) {
                        if (this.splitRichTextCommandAt(cmd, textLen - 1, state.metricCache)) {
                            this.moveRichTextCommands(state, cmd.next);
                        } else if (cmd.x > 0) {
                            this.moveRichTextCommands(state, cmd);
                        }
                    } else if (cmd.next) {
                        this.moveRichTextCommands(state, cmd.next);
                    }
                    return true;
                }

                if (match.index > 0) {
                    if (match.index > textLen - (maxWordLength - totalLen)) {
                        this.advanceRichTextLine(state);
                        if (this.splitRichTextCommandAt(cmd, match.index, state.metricCache)) {
                            this.moveRichTextCommands(state, cmd.next);
                        }
                        return true;
                    }
                    return false;
                }

                totalLen += textLen;
                if (totalLen >= maxWordLength) {
                    return false;
                }
            }

            cmd = cmd.prev;
        }

        return false;
    }

    private resolveWordBoundaryWrapAdjustment(
        state: MsdfRichTextLayoutState,
        text: string,
        style: MsdfRichTextStyle,
        startIndex: number,
        index: number,
        part: string,
        wordWidth: number,
        charInfo: MsdfRichTextWrapCharInfo,
        charWidth: number | null,
        emoji: boolean,
        noBreakWord: boolean,
        remainWidth: number
    ): MsdfRichTextWrapAdjustment {
        const result: MsdfRichTextWrapAdjustment = {
            index,
            part,
            wordWidth,
            charWidth,
            remainWidth,
            continueLoop: false,
        };

        if (!noBreakWord) {
            return result;
        }

        let isPunctuation = false;
        if (
            !(
                (charInfo.code >= 65 && charInfo.code <= 90) ||
                (charInfo.code >= 97 && charInfo.code <= 122) ||
                (charInfo.code >= 48 && charInfo.code <= 57) ||
                (isPunctuation = punctuationChars.has(charInfo.code))
            )
        ) {
            return result;
        }

        const wordBoundary = part.length > 0 ? (wordBoundaryTest.exec(part)?.index ?? null) : 0;
        if (wordBoundary !== null && wordBoundary > 0) {
            if (wordBoundary > part.length - maxWordLength) {
                result.index = startIndex + wordBoundary;
                result.part = text.substring(startIndex, result.index);
                result.wordWidth = this.getRichTextMetrics(
                    result.part,
                    style,
                    state.metricCache
                ).width;
                result.charWidth = null;
            }
            return result;
        }

        if (wordBoundary !== null && state.lastCmd !== null) {
            const movedToNewLine = this.tryMoveTrailingWordToNextLine(
                state,
                part.length,
                isPunctuation
            );
            if (movedToNewLine) {
                result.remainWidth = state.rectWidth - state.lineX;
                if (
                    result.charWidth !== null &&
                    result.wordWidth + result.charWidth < result.remainWidth
                ) {
                    result.wordWidth += result.charWidth;
                    result.continueLoop = true;
                }
            }
            return result;
        }

        if (isPunctuation) {
            const backup =
                emoji && index >= 1 && isLowSurrogate(text.charCodeAt(index - 1)) ? 2 : 1;
            if (index - backup > startIndex || state.lineX > 0) {
                result.index -= backup;
                result.part = text.substring(startIndex, result.index);
                result.wordWidth = this.getRichTextMetrics(
                    result.part,
                    style,
                    state.metricCache
                ).width;
                result.charWidth = null;
            }
        }

        return result;
    }

    private advanceWrappedSegmentState(
        state: MsdfRichTextLayoutState,
        text: string,
        index: number,
        charInfo: MsdfRichTextWrapCharInfo,
        charWidth: number | null,
        emoji: boolean,
        style: MsdfRichTextStyle,
        italicExtra: number,
        extraWidth: number
    ): MsdfRichTextWrapAdvance {
        this.advanceRichTextLine(state);

        const nextState: MsdfRichTextWrapAdvance = {
            index,
            startIndex: index,
            remainWidth: state.rectWidth,
            wordWidth: italicExtra + extraWidth,
        };

        if (charWidth !== null) {
            nextState.wordWidth += charWidth;
            if (charInfo.text.length > 1) {
                nextState.index++;
            }
        } else if (emoji && isHighSurrogate(text.charCodeAt(index))) {
            nextState.index++;
        }

        if (charWidth === null && nextState.index < text.length - 1) {
            nextState.wordWidth = this.getRichTextMetrics(
                text.substring(nextState.startIndex, nextState.index + 1),
                style,
                state.metricCache
            ).width;
        }

        return nextState;
    }

    private wrapRichTextSegment(
        state: MsdfRichTextLayoutState,
        text: string,
        style: MsdfRichTextStyle,
        noBreakWord: boolean,
        link?: string | null,
        clickable?: boolean
    ): void {
        // 换行策略分两步：
        // 1. 先按字符试探这一段还能在本行放下多少；
        // 2. 再尽量回退到词边界，避免把英文/数字单词硬拆开。
        const rectWidth = state.rectWidth;
        let remainWidth = Math.max(0, rectWidth - state.lineX);
        const styleMetrics = this.getRichTextRenderMetrics(style, state.metricCache);
        const totalMetrics = this.getRichTextMetrics(text, style, state.metricCache);
        const italicExtra = styleSkewExtra(styleMetrics.height, style);

        if (totalMetrics.width <= remainWidth) {
            this.appendRichTextCommand(state, text, style, totalMetrics, link, clickable);
            return;
        }

        let startIndex = 0;
        let wordWidth = italicExtra + styleMetrics.extraWidth;
        const emoji = emojiTest.test(text);
        const len = text.length;

        for (let j = 0; j < len; j++) {
            const charInfo = this.getRichTextWrapCharInfo(text, j, emoji, style);
            let charWidth: number | null = charInfo.width;
            wordWidth += charWidth;

            if (wordWidth <= remainWidth || (j === startIndex && state.lineX === 0)) {
                if (charInfo.text.length > 1) {
                    j++;
                }
                continue;
            }

            let part = text.substring(startIndex, j);
            wordWidth -= charWidth;
            const adjustment = this.resolveWordBoundaryWrapAdjustment(
                state,
                text,
                style,
                startIndex,
                j,
                part,
                wordWidth,
                charInfo,
                charWidth,
                emoji,
                noBreakWord,
                remainWidth
            );
            j = adjustment.index;
            part = adjustment.part;
            wordWidth = adjustment.wordWidth;
            charWidth = adjustment.charWidth;
            remainWidth = adjustment.remainWidth;
            if (adjustment.continueLoop) {
                continue;
            }

            if (part.length > 0) {
                this.appendRichTextCommand(
                    state,
                    part,
                    style,
                    { width: wordWidth, height: styleMetrics.height },
                    link,
                    clickable
                );
            }

            const advanced = this.advanceWrappedSegmentState(
                state,
                text,
                j,
                charInfo,
                charWidth,
                emoji,
                style,
                italicExtra,
                styleMetrics.extraWidth
            );
            j = advanced.index;
            startIndex = advanced.startIndex;
            remainWidth = advanced.remainWidth;
            wordWidth = advanced.wordWidth;
        }

        this.appendRichTextCommand(
            state,
            text.substring(startIndex, len),
            style,
            undefined,
            link,
            clickable
        );
    }

    private buildRichTextLineMetrics(
        lines: MsdfRichTextLine[],
        shrinkScale: number
    ): MsdfTextLineMetric[] {
        return this.scaleLineMetrics(
            lines.map((line) =>
                createTextLineMetric(
                    0,
                    line.y,
                    line.width,
                    line.height,
                    line.align,
                    this.collectLineText(line),
                    this._fontSize,
                    this._textStyle
                )
            ),
            shrinkScale
        );
    }

    private measureRichTextLines(lines: MsdfRichTextLine[]): { width: number; height: number } {
        let width = 0;
        let height = 0;

        for (const line of lines) {
            width = Math.max(width, line.width);
            height = Math.max(height, line.y + line.height);
        }

        return { width, height };
    }

    private evaluateRichTextShrinkCandidate(
        wrapWidth: number,
        widthLimit: number,
        heightLimit: number
    ): MsdfRichTextShrinkCandidate {
        this._wordWrapWidth = wrapWidth;
        const lines = this.layoutRuns();
        const contentWidth = this._contentWidth;
        const contentHeight = this._contentHeight;
        const widthScale = contentWidth > 0 ? Math.min(widthLimit / contentWidth, 1) : 1;
        const heightScale = contentHeight > 0 ? Math.min(heightLimit / contentHeight, 1) : 1;
        const scale = Math.min(widthScale, heightScale);

        return {
            lines,
            contentWidth,
            contentHeight,
            widthScale,
            heightScale,
            scale,
            fillScore: (contentWidth * scale) / widthLimit + (contentHeight * scale) / heightLimit,
        };
    }

    private pickBetterRichTextShrinkCandidate(
        left: MsdfRichTextShrinkCandidate,
        right: MsdfRichTextShrinkCandidate,
        scaleEpsilon: number
    ): MsdfRichTextShrinkCandidate {
        if (right.scale > left.scale + scaleEpsilon) {
            return right;
        }

        if (
            Math.abs(right.scale - left.scale) <= scaleEpsilon &&
            right.fillScore > left.fillScore
        ) {
            return right;
        }

        return left;
    }

    private isRichTextShrinkCandidateBalanced(
        candidate: MsdfRichTextShrinkCandidate,
        scaleEpsilon: number
    ): boolean {
        return candidate.widthScale <= candidate.heightScale + scaleEpsilon;
    }

    private searchBetterRichTextShrinkCandidate(
        initialBest: MsdfRichTextShrinkCandidate,
        originalWrapWidth: number,
        widthLimit: number,
        heightLimit: number,
        scaleEpsilon: number,
        balanceEpsilon: number
    ): MsdfRichTextShrinkCandidate {
        let best = initialBest;
        let leftWidth = originalWrapWidth;
        let rightWidth = originalWrapWidth;
        let rightCandidate = initialBest;

        for (let i = 0; i < 3; i++) {
            rightWidth *= 2;
            rightCandidate = this.evaluateRichTextShrinkCandidate(
                rightWidth,
                widthLimit,
                heightLimit
            );
            best = this.pickBetterRichTextShrinkCandidate(best, rightCandidate, scaleEpsilon);
            if (
                this.isRichTextShrinkCandidateBalanced(rightCandidate, scaleEpsilon) ||
                rightCandidate.scale >= 1 - scaleEpsilon
            ) {
                break;
            }
        }

        if (!this.isRichTextShrinkCandidateBalanced(rightCandidate, scaleEpsilon)) {
            return best;
        }

        for (let i = 0; i < 4; i++) {
            const midWidth = (leftWidth + rightWidth) * 0.5;
            const midCandidate = this.evaluateRichTextShrinkCandidate(
                midWidth,
                widthLimit,
                heightLimit
            );
            best = this.pickBetterRichTextShrinkCandidate(best, midCandidate, scaleEpsilon);

            if (
                Math.abs(midCandidate.widthScale - midCandidate.heightScale) <= balanceEpsilon ||
                midCandidate.scale >= 1 - scaleEpsilon ||
                rightWidth - leftWidth <= 1
            ) {
                break;
            }

            if (midCandidate.widthScale > midCandidate.heightScale + scaleEpsilon) {
                leftWidth = midWidth;
            } else {
                rightWidth = midWidth;
            }
        }

        return best;
    }

    private layoutRunsForShrink(): MsdfRichTextLine[] {
        const activeWrapWidth = this.resolveActiveWrapWidth();
        if (this._overflow !== "shrink" || activeWrapWidth <= 0 || this._layoutHeight <= 0) {
            return this.layoutRuns();
        }

        const originalWrapWidth = this._wordWrapWidth;
        const widthLimit = activeWrapWidth;
        const heightLimit = this._layoutHeight;
        const scaleEpsilon = 0.0001;
        const balanceEpsilon = 0.02;
        if (this._wordWrapWidth <= 0) {
            this._wordWrapWidth = activeWrapWidth;
        }

        let best = this.evaluateRichTextShrinkCandidate(
            this._wordWrapWidth,
            widthLimit,
            heightLimit
        );

        try {
            if (best.widthScale > best.heightScale + scaleEpsilon) {
                best = this.searchBetterRichTextShrinkCandidate(
                    best,
                    this._wordWrapWidth,
                    widthLimit,
                    heightLimit,
                    scaleEpsilon,
                    balanceEpsilon
                );
            }
        } finally {
            this._wordWrapWidth = originalWrapWidth;
        }

        this._contentWidth = best.contentWidth;
        this._contentHeight = best.contentHeight;
        return best.lines;
    }

    private getRichTextMetricBucket(
        style: MsdfRichTextStyle,
        metricCache: MsdfRichTextMetricCache
    ): MsdfRichTextMetricBucket {
        const font = this.requireFont();
        let bucket = metricCache.get(style);
        if (bucket) {
            return bucket;
        }

        const lineHeight = font.getLineHeight(style.fontSize);
        let renderHeight = lineHeight;
        let extraWidth = 0;

        if (style.underline || style.strikethrough) {
            const decorationMetrics = font.getDecorationRenderMetrics(style.fontSize);

            if (decorationMetrics) {
                extraWidth = -decorationMetrics.leftOverhang + decorationMetrics.rightOverhang;

                if (style.underline) {
                    renderHeight = Math.max(renderHeight, decorationMetrics.underlineBottom);
                }

                if (style.strikethrough) {
                    renderHeight = Math.max(
                        renderHeight,
                        lineHeight * 0.5 + decorationMetrics.thickness * 0.5
                    );
                }
            }
        }

        bucket = {
            render: { extraWidth, height: renderHeight },
            text: new Map(),
        };
        metricCache.set(style, bucket);
        return bucket;
    }

    private getRichTextRenderMetrics(
        style: MsdfRichTextStyle,
        metricCache: MsdfRichTextMetricCache
    ): { extraWidth: number; height: number } {
        return this.getRichTextMetricBucket(style, metricCache).render;
    }

    private getRichTextMetrics(
        text: string,
        style: MsdfRichTextStyle,
        metricCache: MsdfRichTextMetricCache
    ): MsdfRichTextMetrics {
        const font = this.requireFont();
        const bucket = this.getRichTextMetricBucket(style, metricCache);
        const cached = bucket.text.get(text);
        if (cached) {
            return cached;
        }

        const metrics = {
            width:
                (font.measureTextWidth(text, style.fontSize, this._letterSpacing) +
                    bucket.render.extraWidth) *
                    styleScaleX(style) +
                styleSkewExtra(bucket.render.height, style),
            height: bucket.render.height,
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
        rebuildLine: (
            line: MsdfRichTextLine,
            segments: Array<{
                text: string;
                style: MsdfRichTextStyle;
                link?: string | null;
                clickable?: boolean;
            }>,
            fallbackHeight: number
        ) => void,
        getFallbackStyle: () => MsdfRichTextStyle | null
    ): void {
        if (this._overflow !== "ellipsis" || lines.length === 0) {
            return;
        }

        const font = this.requireFont();

        let truncateIndex = -1;
        if (rectHeight < Number.MAX_VALUE) {
            truncateIndex = lines.findIndex((line) => line.y + line.height > rectHeight);
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
                link: cmd.link ?? null,
                clickable: !!cmd.clickable,
                width: metrics.width,
                height: metrics.height,
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
                link: null,
                clickable: false,
                width: ellipsisMetrics.width,
                height: ellipsisMetrics.height,
            });
        }

        rebuildLine(
            lastLine,
            segments.map((segment) => ({
                text: segment.text,
                style: segment.style,
                link: segment.link ?? null,
                clickable: !!segment.clickable,
            })),
            font.getLineHeight(fallbackStyle.fontSize) || lastHeight
        );
    }

    private scaleLineMetrics(lines: MsdfTextLineMetric[], scale: number): MsdfTextLineMetric[] {
        if (scale === 1) {
            return lines;
        }

        return lines.map((line) =>
            createTextLineMetric(
                line.x * scale,
                line.y * scale,
                line.width * scale,
                line.height * scale,
                line.align,
                line.text,
                this._fontSize,
                this._textStyle
            )
        );
    }

    refresh(): void {
        this._typeset();
    }

    protected override _typeset(): void {
        this._isChanged = false;
        if (this._destroyed) {
            return;
        }

        if (!this._msdfFont) {
            this.resetRenderState();
        } else if (this._usesRuns) {
            this.refreshRichText();
        } else {
            this.applyRefreshResult(this.buildPlainTextRefreshResult());
        }

        this._textWidth = this._contentWidth;
        this._textHeight = this._contentHeight;

        if (this._overflow === "scroll") {
            if (!this._scrollPos) {
                this._scrollPos = new Laya.Point(0, 0);
            }

            this._scrollPos.x = this._scrollX;
            this._scrollPos.y = this._scrollY;
        } else {
            this._scrollPos = null;
        }

        this._onPostLayout?.();
    }

    private refreshRichText(): void {
        if (!this._msdfFont) {
            this.resetRenderState();
            return;
        }

        if (this._runs.length === 0) {
            this.resetRenderState();
            return;
        }

        this.applyRefreshResult(this.buildRichTextRefreshResult());
    }

    private syncMaterial(): void {
        if (!this._msdfFont) {
            return;
        }

        const renderState = this.requireFont().renderState;
        if (this.materialInstance !== renderState.material) {
            this.materialInstance = renderState.material;
            this.material = this.materialInstance;
        }
    }

    private redraw(): void {
        this.graphics.clear(true);
        this.drawBg();

        if (this._drawBatches.length === 0) {
            this.syncMaterial();
            return;
        }

        this.syncMaterial();

        const needsClip = this._overflow === "hidden" || this._overflow === "scroll";
        const clipWidth =
            this._viewFrame.clipRectWidth >= 0 ? this._viewFrame.clipRectWidth : this.width;
        const clipHeight =
            this._viewFrame.clipRectHeight >= 0 ? this._viewFrame.clipRectHeight : this.height;
        if (needsClip && (clipWidth <= 0 || clipHeight <= 0)) {
            return;
        }

        const clipped = needsClip;
        if (clipped) {
            this.graphics.save();
            this.graphics.clipRect(
                this._viewFrame.clipRectX,
                this._viewFrame.clipRectY,
                clipWidth,
                clipHeight
            );
        }

        // 顶点始终保持在本地文本坐标里，真正的视口偏移在这里通过 x/y 参数施加。
        const drawOffsetX = this._viewFrame.drawOffsetX;
        const drawOffsetY = this._viewFrame.drawOffsetY;

        this.drawCurrentBatches(drawOffsetX, drawOffsetY);

        if (clipped) {
            this.graphics.restore();
        }
    }

    private drawCurrentBatches(drawOffsetX: number, drawOffsetY: number): void {
        const font = this.requireFont();

        for (const batch of this._drawBatches) {
            this.graphics.drawTrianglesMSDF(
                font.texture,
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
    }

    private appendRichTextLineText(
        state: MsdfRichTextLayoutState,
        text: string,
        style: MsdfRichTextStyle,
        wordWrap: boolean,
        link?: string | null,
        clickable?: boolean
    ): void {
        if (!text) {
            return;
        }

        if (wordWrap) {
            this.wrapRichTextSegment(state, text, style, true, link, clickable);
        } else {
            this.appendRichTextCommand(state, text, style, undefined, link, clickable);
        }
    }

    private appendRichTextRunSegments(
        state: MsdfRichTextLayoutState,
        run: MsdfRichTextRun,
        wordWrap: boolean
    ): void {
        if (!run.text) {
            return;
        }

        state.lastHeight = this.getRichTextRenderMetrics(run.style, state.metricCache).height;
        const splitLines = run.text.split("\n");
        const metadata = run as MsdfRichTextRun & MsdfRichTextRunMetadata;

        for (let i = 0, n = splitLines.length; i < n; i++) {
            this.appendRichTextLineText(
                state,
                splitLines[i],
                run.style,
                wordWrap,
                metadata.link ?? null,
                !!metadata.clickable
            );

            if (i !== n - 1) {
                this.advanceRichTextLine(state);
            }
        }
    }

    private finalizeRichTextLayout(state: MsdfRichTextLayoutState): MsdfRichTextLine[] {
        this.advanceRichTextLine(state, true);
        // 先完成正常排版，再统一做 ellipsis 裁剪，这样可以复用已有的测量和重建逻辑。
        this.applyEllipsisToRichTextLines(
            state.lines,
            state.rectWidth,
            state.rectHeight,
            state.lastHeight,
            (text, style) => this.getRichTextMetrics(text, style, state.metricCache),
            (line, segments, fallbackHeight) =>
                this.rebuildRichTextLine(line, segments, fallbackHeight, state.metricCache),
            () => this.getRichTextFallbackStyle()
        );

        const measured = this.measureRichTextLines(state.lines);
        this._contentWidth = measured.width;
        this._contentHeight = measured.height;
        return state.lines;
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
        const state = this.createRichTextLayoutState();
        const wordWrap = this._wordWrapWidth > 0;

        this.advanceRichTextLine(state);

        for (const run of this._runs) {
            this.appendRichTextRunSegments(state, run, wordWrap);
        }

        return this.finalizeRichTextLayout(state);
    }

    private resolveRichTextLineOffsetX(
        line: MsdfRichTextLine,
        contentBoxWidth: number,
        shrinkScale: number
    ): number {
        const lineAlign = line.align || this._defaultAlign;
        if (lineAlign === "center") {
            return Math.max((contentBoxWidth - line.width * shrinkScale) * 0.5, 0);
        }

        if (lineAlign === "right") {
            return Math.max(contentBoxWidth - line.width * shrinkScale, 0);
        }

        return 0;
    }

    private appendMergedBatch(
        drawBatches: MsdfDrawBatch[],
        pendingGroup: MsdfDrawBatchGroup | null,
        batch: MsdfDrawBatch
    ): MsdfDrawBatchGroup {
        if (pendingGroup && canMergeBatchGroup(pendingGroup, batch)) {
            mergeBatchGroup(pendingGroup, batch);
            return pendingGroup;
        }

        appendBatchGroup(drawBatches, pendingGroup);
        return createBatchGroup(batch);
    }

    private isRichTextCommandClickable(cmd: MsdfRichTextCommand): boolean {
        return hasValue(cmd.link) || !!cmd.clickable;
    }

    private recordRichTextClickArea(
        cmd: MsdfRichTextCommand,
        x: number,
        y: number,
        width: number,
        height: number
    ): void {
        if (!this.isRichTextCommandClickable(cmd) || width <= 0 || height <= 0) {
            return;
        }

        this._richTextClickAreas.push({
            x,
            y,
            width,
            height,
            text: cmd.text,
            link: cmd.link ?? null,
        });
    }

    private appendRichTextLineBatches(
        drawBatches: MsdfDrawBatch[],
        pendingGroup: MsdfDrawBatchGroup | null,
        line: MsdfRichTextLine,
        contentBoxWidth: number,
        scrollOffsetX: number,
        scrollOffsetY: number,
        layoutCache: MsdfRichTextLayoutCache,
        shrinkScale: number
    ): MsdfDrawBatchGroup | null {
        const lineOffsetX = this.resolveRichTextLineOffsetX(line, contentBoxWidth, shrinkScale);
        let cmd = line.cmd;

        while (cmd) {
            const x = lineOffsetX + cmd.x * shrinkScale - scrollOffsetX;
            const y = (line.y + cmd.y) * shrinkScale - scrollOffsetY;
            const batch = this.buildRunBatch(cmd, x, y, layoutCache, shrinkScale);
            if (batch) {
                this.recordRichTextClickArea(
                    cmd,
                    x,
                    y,
                    cmd.width * shrinkScale,
                    cmd.height * shrinkScale
                );
                pendingGroup = this.appendMergedBatch(drawBatches, pendingGroup, batch);
            }
            cmd = cmd.next;
        }

        return pendingGroup;
    }

    private buildRichTextDrawBatches(
        lines: MsdfRichTextLine[],
        shrinkScale: number
    ): MsdfDrawBatch[] {
        const contentBoxWidth = this._layoutWidth >= 0 ? this._layoutWidth : this._contentWidth;
        const drawBatches: MsdfDrawBatch[] = [];
        this.clearRichTextClickAreas();
        // 富文本里同样的“文本片段 + 样式”组合可能重复出现。
        // 先缓存每个 run 的布局，再把可合并的 run 拼成更大的 GPU batch。
        const layoutCache: MsdfRichTextLayoutCache = new WeakMap();
        const scrollOffsetX = this.getScrollOffsetX();
        const scrollOffsetY = this.getScrollOffsetY();
        let pendingGroup: MsdfDrawBatchGroup | null = null;

        for (const line of lines) {
            pendingGroup = this.appendRichTextLineBatches(
                drawBatches,
                pendingGroup,
                line,
                contentBoxWidth,
                scrollOffsetX,
                scrollOffsetY,
                layoutCache,
                shrinkScale
            );
        }

        appendBatchGroup(drawBatches, pendingGroup);
        return drawBatches;
    }

    private createRichTextBatchStyleData(
        layout: MsdfLayout,
        style: MsdfRichTextStyle,
        vertexCount: number
    ): MsdfBatchStyleData {
        const flags = this.getEffectFlagsForStyle(style.outlineWidth, style.outlineColor);

        return {
            fillColors: createLayoutColorArray(
                layout,
                style.textColor,
                style.underlineColor,
                style.strikethroughColor
            ),
            outlineColors: createLayoutColorArray(
                layout,
                style.outlineColor,
                style.underlineColor,
                style.strikethroughColor
            ),
            glowColors: createVertexColorArray(this._glowColor, vertexCount),
            shadowColors: createVertexColorArray(this._shadowColor, vertexCount),
            packedParamsA: createPackedParamsAArray(
                style.outlineWidth,
                this._glowSize,
                this._shadowBlur,
                this._faceDilate,
                vertexCount
            ),
            packedParamsB: createPackedParamsBArray(
                this._shadowOffsetX,
                this._shadowOffsetY,
                flags,
                vertexCount
            ),
        };
    }

    private transformRunVertices(
        layout: MsdfLayout,
        style: MsdfRichTextStyle,
        x: number,
        y: number,
        shrinkScale: number
    ): Float32Array {
        // 把 run 的局部布局映射到最终顶点：
        // 先应用 bold/italic/shrink，再叠加行内位置偏移。
        const baseHeight = Math.max(
            layout.height,
            this.requireFont().getLineHeight(style.fontSize)
        );
        const italicOffset = styleSkewExtra(baseHeight, style) * shrinkScale;
        const scaleX = styleScaleX(style);
        const skewX = style.italic ? Math.tan((ITALIC_SKEW_DEGREES * Math.PI) / 180) : 0;
        const vertices = new Float32Array(layout.vertices.length);

        for (let i = 0; i < layout.vertices.length; i += 2) {
            const localX = layout.vertices[i] * scaleX * shrinkScale;
            const localY = layout.vertices[i + 1] * shrinkScale;
            vertices[i] = x + localX + (style.italic ? italicOffset - skewX * localY : 0);
            vertices[i + 1] = y + localY;
        }

        return vertices;
    }

    private getRichTextCommandLayout(
        cmd: MsdfRichTextCommand,
        layoutCache?: MsdfRichTextLayoutCache
    ): MsdfLayout {
        const font = this.requireFont();
        const style = cmd.style;
        let styleLayouts = layoutCache?.get(style);
        if (!styleLayouts && layoutCache) {
            styleLayouts = new Map();
            layoutCache.set(style, styleLayouts);
        }

        let layout = styleLayouts?.get(cmd.text);
        if (!layout) {
            // 每个富文本 run 依然复用纯文本的 buildLayout，只是输入样式来自当前 run。
            layout = font.buildLayout(cmd.text, style.fontSize, this._letterSpacing, 0, {
                underline: !!style.underline,
                strikethrough: !!style.strikethrough,
            });
            styleLayouts?.set(cmd.text, layout);
        }

        return layout;
    }

    private buildRunBatch(
        cmd: MsdfRichTextCommand,
        x: number,
        y: number,
        layoutCache?: MsdfRichTextLayoutCache,
        shrinkScale: number = 1
    ): MsdfDrawBatch | null {
        const style = cmd.style;
        const layout = this.getRichTextCommandLayout(cmd, layoutCache);
        if (layout.indices.length === 0) {
            return null;
        }

        // run 级别的形变都在这里完成：bold 拉宽 X，italic 按 Y 倾斜，
        // shrink 统一缩放，x/y 再把这个 run 放到最终行盒中的目标位置。
        const vertices = this.transformRunVertices(layout, style, x, y, shrinkScale);
        const vertexCount = vertices.length >> 1;
        const styleData = this.createRichTextBatchStyleData(layout, style, vertexCount);

        return {
            vertices,
            uvs: layout.uvs,
            indices: layout.indices,
            fillColors: styleData.fillColors,
            outlineColors: styleData.outlineColors,
            glowColors: styleData.glowColors,
            shadowColors: styleData.shadowColors,
            packedParamsA: styleData.packedParamsA,
            packedParamsB: styleData.packedParamsB,
        };
    }

    override _setWidth(value: number): void {
        Laya.Sprite.prototype._setWidth.call(this, value);
        if (this._syncingViewSize) {
            this.drawBg();
            return;
        }

        this.markChanged();
    }

    override _setHeight(value: number): void {
        Laya.Sprite.prototype._setHeight.call(this, value);
        if (this._syncingViewSize) {
            this.drawBg();
            return;
        }

        this.markChanged();
    }
}
