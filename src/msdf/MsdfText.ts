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
    width: number;
    height: number;
};

type MsdfDrawBatch = {
    vertices: Float32Array;
    uvs: Float32Array;
    indices: Uint16Array;
    textColor: Laya.Vector4;
    outlineColor: Laya.Vector4;
    outlineWidth: number;
};

type MsdfDrawBatchGroup = {
    textColor: Laya.Vector4;
    outlineColor: Laya.Vector4;
    outlineWidth: number;
    renderStyleKey: string;
    vertexChunks: Float32Array[];
    uvChunks: Float32Array[];
    indexChunks: Uint16Array[];
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
    outlineColor?: Laya.Vector4;
    outlineWidth?: number;
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

export type MsdfRichTextStyle = {
    fontSize: number;
    textColor: Laya.Vector4;
    textColorCss: string;
    outlineColor: Laya.Vector4;
    outlineColorCss: string;
    outlineWidth: number;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    align?: string | null;
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
};

const DEFAULT_TEXT_COLOR = new Laya.Vector4(1, 1, 1, 1);
const DEFAULT_OUTLINE_COLOR = new Laya.Vector4(0, 0, 0, 1);
const STYLE_TEXTURE_WIDTH = 256;
const STYLE_TEXTURE_HEIGHT = 2;
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

function createEmptyLayout(): MsdfLayout {
    return {
        vertices: new Float32Array(0),
        uvs: new Float32Array(0),
        indices: new Uint16Array(0),
        width: 0,
        height: 0
    };
}

function clamp01(value: number): number {
    return Math.max(0, Math.min(1, value));
}

function colorKey(color: Laya.Vector4): string {
    return `${color.x.toFixed(4)},${color.y.toFixed(4)},${color.z.toFixed(4)},${color.w.toFixed(4)}`;
}

function styleKey(textColor: Laya.Vector4, outlineColor: Laya.Vector4): string {
    return `${colorKey(textColor)}|${colorKey(outlineColor)}`;
}

function renderStyleKey(textColor: Laya.Vector4, outlineColor: Laya.Vector4, outlineWidth: number): string {
    return `${styleKey(textColor, outlineColor)}|${outlineWidth.toFixed(4)}`;
}

function createBatchGroup(batch: MsdfDrawBatch): MsdfDrawBatchGroup {
    return {
        textColor: batch.textColor,
        outlineColor: batch.outlineColor,
        outlineWidth: batch.outlineWidth,
        renderStyleKey: renderStyleKey(batch.textColor, batch.outlineColor, batch.outlineWidth),
        vertexChunks: [batch.vertices],
        uvChunks: [batch.uvs],
        indexChunks: [batch.indices],
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
            textColor: group.textColor,
            outlineColor: group.outlineColor,
            outlineWidth: group.outlineWidth
        };
    }

    const vertices = new Float32Array(group.vertexFloatCount);
    const uvs = new Float32Array(group.uvFloatCount);
    const indices = new Uint16Array(group.indexCount);
    let vertexFloatOffset = 0;
    let uvFloatOffset = 0;
    let indexOffset = 0;
    let vertexBase = 0;

    for (let i = 0; i < group.vertexChunks.length; i++) {
        const vertexChunk = group.vertexChunks[i];
        const uvChunk = group.uvChunks[i];
        const indexChunk = group.indexChunks[i];

        vertices.set(vertexChunk, vertexFloatOffset);
        uvs.set(uvChunk, uvFloatOffset);

        for (let j = 0; j < indexChunk.length; j++) {
            indices[indexOffset + j] = indexChunk[j] + vertexBase;
        }

        vertexFloatOffset += vertexChunk.length;
        uvFloatOffset += uvChunk.length;
        indexOffset += indexChunk.length;
        vertexBase += vertexChunk.length >> 1;
    }

    return {
        vertices,
        uvs,
        indices,
        textColor: group.textColor,
        outlineColor: group.outlineColor,
        outlineWidth: group.outlineWidth
    };
}

function appendBatchGroup(groups: MsdfDrawBatch[], pendingGroup: MsdfDrawBatchGroup | null): MsdfDrawBatchGroup | null {
    if (pendingGroup) {
        groups.push(finalizeBatchGroup(pendingGroup));
    }

    return null;
}

function canMergeBatchGroup(group: MsdfDrawBatchGroup, batch: MsdfDrawBatch): boolean {
    if (group.renderStyleKey !== renderStyleKey(batch.textColor, batch.outlineColor, batch.outlineWidth)) {
        return false;
    }

    return group.vertexCount + (batch.vertices.length >> 1) <= 65535;
}

function mergeBatchGroup(group: MsdfDrawBatchGroup, batch: MsdfDrawBatch): void {
    group.vertexChunks.push(batch.vertices);
    group.uvChunks.push(batch.uvs);
    group.indexChunks.push(batch.indices);
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

function isHighSurrogate(code: number): boolean {
    return code >= 0xd800 && code <= 0xdbff;
}

function isLowSurrogate(code: number): boolean {
    return code >= 0xdc00 && code <= 0xdfff;
}

function writePackedColor(target: Uint8Array, offset: number, color: Laya.Vector4): void {
    target[offset] = Math.round(clamp01(color.x) * 255);
    target[offset + 1] = Math.round(clamp01(color.y) * 255);
    target[offset + 2] = Math.round(clamp01(color.z) * 255);
    target[offset + 3] = Math.round(clamp01(color.w) * 255);
}

let cachedBatchStyleSupport: boolean | null = null;

function supportsMsdfBatchStyle(): boolean {
    if (cachedBatchStyleSupport != null) {
        return cachedBatchStyleSupport;
    }

    cachedBatchStyleSupport = ((Laya as any).DrawTrianglesCmd?.STYLE_PAYLOAD_VERSION ?? 0) >= 1;
    return cachedBatchStyleSupport;
}

class MsdfStyleRegistry {
    readonly textureSize = new Laya.Vector2(STYLE_TEXTURE_WIDTH, STYLE_TEXTURE_HEIGHT);
    readonly texture: Laya.Texture2D;

    private readonly styleMap = new Map<string, number>();
    private readonly pixels = new Uint8Array(STYLE_TEXTURE_WIDTH * STYLE_TEXTURE_HEIGHT * 4);
    private styleCount = 0;

    constructor() {
        this.texture = new Laya.Texture2D(STYLE_TEXTURE_WIDTH, STYLE_TEXTURE_HEIGHT, Laya.TextureFormat.R8G8B8A8, false, false, false);
        this.texture.filterMode = Laya.FilterMode.Point;
        this.texture.setPixelsData(this.pixels, false, false);
    }

    register(textColor: Laya.Vector4, outlineColor: Laya.Vector4): number {
        const key = styleKey(textColor, outlineColor);
        const cached = this.styleMap.get(key);
        if (cached != null) {
            return cached;
        }

        if (this.styleCount >= STYLE_TEXTURE_WIDTH) {
            throw new Error(`MSDF style registry is full. Max styles: ${STYLE_TEXTURE_WIDTH}`);
        }

        const styleIndex = this.styleCount++;
        this.styleMap.set(key, styleIndex);

        writePackedColor(this.pixels, styleIndex * 4, textColor);
        writePackedColor(this.pixels, (STYLE_TEXTURE_WIDTH + styleIndex) * 4, outlineColor);
        this.texture.setPixelsData(this.pixels, false, false);

        return styleIndex;
    }
}

class MsdfFontRenderState {
    readonly styleRegistry = new MsdfStyleRegistry();
    readonly material: Laya.Material;

    constructor(font: MsdfBitmapFont) {
        this.material = new Laya.Material();
        applyMaterialBase(this.material, font, this.styleRegistry, true);
    }
}

function applyMaterialBase(material: Laya.Material, font: MsdfBitmapFont, styleRegistry: MsdfStyleRegistry, useStyleTexture: boolean): void {
    material.setShaderName("MsdfTextShader");
    material.setVector2("u_AtlasSize", new Laya.Vector2(font.atlasWidth, font.atlasHeight));
    material.setFloat("u_DistanceRange", font.distanceRange);
    material.setTexture("u_StyleTexture", styleRegistry.texture);
    material.setVector2("u_StyleTextureSize", styleRegistry.textureSize);
    material.setFloat("u_UseStyleTexture", useStyleTexture ? 1 : 0);
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

        const pushQuad = (glyph: MsdfGlyph, left: number, top: number, right: number, bottom: number): void => {
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
                        pushQuad(decorationGlyph, lineLeft, top, lineRight, top + decorationMetrics.thickness);
                    }

                    if (decorations.strikethrough) {
                        const top = line.y + lineHeight * 0.5 - decorationMetrics.thickness * 0.5;
                        pushQuad(decorationGlyph, lineLeft, top, lineRight, top + decorationMetrics.thickness);
                    }
                }
            }
        }

        if (quadCount === 0) {
            return {
                vertices: new Float32Array(0),
                uvs: new Float32Array(0),
                indices: new Uint16Array(0),
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
            width: Math.max(widestLine, maxX - minX),
            height: Math.max(lineCount * lineHeight + Math.max(0, lineCount - 1) * lineSpacing, maxY - shiftY)
        };
    }
}

export class MsdfTextSprite extends Laya.Sprite {
    private materialInstance: Laya.Material;
    private readonly useBatchStyleData: boolean;

    private _text: string;
    private _fontSize: number;
    private _letterSpacing: number;
    private _lineSpacing: number;
    private _textColor: Laya.Vector4;
    private _outlineColor: Laya.Vector4;
    private _outlineWidth: number;
    private _underline: boolean;
    private _strikethrough: boolean;
    private _layout: MsdfLayout = createEmptyLayout();
    private _runs: MsdfRichTextRun[] = [];
    private _usesRuns = false;
    private _wordWrapWidth = 0;
    private _layoutWidth = 0;
    private _defaultAlign = "left";
    private _contentWidth = 0;
    private _contentHeight = 0;
    private _drawBatches: MsdfDrawBatch[] = [];
    private _multiStyleFallbackReported = false;

    constructor(private font: MsdfBitmapFont, options: MsdfTextOptions = {}) {
        super();

        this._text = options.text ?? "";
        this._fontSize = options.fontSize ?? font.lineHeight;
        this._letterSpacing = options.letterSpacing ?? 0;
        this._lineSpacing = 0;
        this._textColor = options.textColor ?? DEFAULT_TEXT_COLOR.clone();
        this._outlineColor = options.outlineColor ?? DEFAULT_OUTLINE_COLOR.clone();
        this._outlineWidth = options.outlineWidth ?? 0;
        this._underline = !!options.underline;
        this._strikethrough = !!options.strikethrough;
        this.useBatchStyleData = supportsMsdfBatchStyle();

        this.materialInstance = this.useBatchStyleData
            ? this.font.renderState.material
            : new Laya.Material();
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

    get defaultAlign(): string {
        return this._defaultAlign;
    }

    set defaultAlign(value: string) {
        this._defaultAlign = value || "left";
    }

    get contentWidth(): number {
        return this._contentWidth;
    }

    get contentHeight(): number {
        return this._contentHeight;
    }

    set textColor(value: Laya.Vector4) {
        this._textColor = value;
        if (!this._usesRuns) {
            if (this._drawBatches[0]) {
                this._drawBatches[0].textColor = value;
            }
            this.redraw();
        }
    }

    set outlineColor(value: Laya.Vector4) {
        this._outlineColor = value;
        if (!this._usesRuns) {
            if (this._drawBatches[0]) {
                this._drawBatches[0].outlineColor = value;
            }
            this.redraw();
        }
    }

    set outlineWidth(value: number) {
        this._outlineWidth = value;
        if (!this._usesRuns) {
            if (this._drawBatches[0]) {
                this._drawBatches[0].outlineWidth = value;
            }
            this.redraw();
        }
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
        if (this.useBatchStyleData) {
            this.materialInstance = this.font.renderState.material;
            this.material = this.materialInstance;
        }
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
        this._drawBatches = this._layout.indices.length > 0
            ? [{
                vertices: this._layout.vertices,
                uvs: this._layout.uvs,
                indices: this._layout.indices,
                textColor: this._textColor,
                outlineColor: this._outlineColor,
                outlineWidth: this._outlineWidth
            }]
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
            this.size(this._layoutWidth, 0);
            this.redraw();
            return;
        }

        const lines = this.layoutRuns();
        const viewWidth = this._layoutWidth > 0 ? this._layoutWidth : this._contentWidth;
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
                const batch = this.buildRunBatch(cmd, lineOffsetX + cmd.x, line.y + cmd.y, layoutCache);
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
        this.size(viewWidth, this._contentHeight);
        this.redraw();
    }

    private syncMaterial(batch: MsdfDrawBatch | null = this._drawBatches[0] ?? null): void {
        const renderState = this.font.renderState;

        if (this.useBatchStyleData) {
            if (this.materialInstance !== renderState.material) {
                this.materialInstance = renderState.material;
                this.material = this.materialInstance;
            }
            return;
        }

        applyMaterialBase(this.materialInstance, this.font, renderState.styleRegistry, false);
        this.materialInstance.setVector4("u_TextColor", batch?.textColor ?? this._textColor);
        this.materialInstance.setVector4("u_OutlineColor", batch?.outlineColor ?? this._outlineColor);
        this.materialInstance.setFloat("u_OutlineWidth", batch?.outlineWidth ?? this._outlineWidth);
    }

    private redraw(): void {
        this.graphics.clear(true);

        if (this._drawBatches.length === 0) {
            this.syncMaterial();
            return;
        }

        const firstBatch = this._drawBatches[0];
        this.syncMaterial(firstBatch);

        if (!this.useBatchStyleData) {
            const expectedStyle = renderStyleKey(firstBatch.textColor, firstBatch.outlineColor, firstBatch.outlineWidth);
            const hasMultiStyle = this._drawBatches.some((batch, index) =>
                index > 0 && renderStyleKey(batch.textColor, batch.outlineColor, batch.outlineWidth) !== expectedStyle);

            if (hasMultiStyle) {
                this.reportMultiStyleFallback();
            }
        }

        for (const batch of this._drawBatches) {
            if (this.useBatchStyleData) {
                const styleIndex = this.font.renderState.styleRegistry.register(batch.textColor, batch.outlineColor);
                this.graphics.drawTriangles(
                    this.font.texture,
                    0,
                    0,
                    batch.vertices,
                    batch.uvs,
                    batch.indices,
                    null,
                    1,
                    null,
                    null,
                    styleIndex,
                    batch.outlineWidth
                );
            } else {
                this.graphics.drawTriangles(this.font.texture, 0, 0, batch.vertices, batch.uvs, batch.indices);
            }
        }
    }

    private reportMultiStyleFallback(): void {
        if (this._multiStyleFallbackReported) {
            return;
        }

        this._multiStyleFallbackReported = true;
        console.error("[MsdfTextSprite] rich text with multiple styles requires DrawTriangles STYLE_PAYLOAD_VERSION >= 1; rendering with the first style only.");
    }

    private layoutRuns(): MsdfRichTextLine[] {
        const lines: MsdfRichTextLine[] = [];
        const wordWrap = this._wordWrapWidth > 0;
        const noBreakWord = wordWrap;
        const rectWidth = wordWrap ? this._wordWrapWidth : Number.MAX_VALUE;
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
                    cmd.y = Math.floor((lineHeight - cmd.height) * 0.5);
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
                align: this._defaultAlign
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
            textColor: style.textColor,
            outlineColor: style.outlineColor,
            outlineWidth: style.outlineWidth
        };
    }
}
