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

type MsdfTextOptions = {
    text?: string;
    fontSize?: number;
    letterSpacing?: number;
    textColor?: Laya.Vector4;
    outlineColor?: Laya.Vector4;
    outlineWidth?: number;
};

const DEFAULT_TEXT_COLOR = new Laya.Vector4(1, 1, 1, 1);
const DEFAULT_OUTLINE_COLOR = new Laya.Vector4(0, 0, 0, 1);
const STYLE_TEXTURE_WIDTH = 256;
const STYLE_TEXTURE_HEIGHT = 2;

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

function kerningKey(first: number, second: number): string {
    return `${first}:${second}`;
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
    private readonly kernings = new Map<string, number>();
    private _renderState: MsdfFontRenderState | null = null;

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

    wrapText(text: string, fontSize: number, maxWidth: number, letterSpacing: number = 0): string {
        if (maxWidth <= 0) {
            return text;
        }

        const scale = fontSize / this.lineHeight;
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
            const nextWidth = lineWidth + kern + advance + letterSpacing * scale;

            if (lineWidth > 0 && nextWidth > maxWidth) {
                result += "\n";
                lineWidth = 0;
                previousCode = -1;
            }

            result += char;
            lineWidth += (glyph ? glyph.xadvance * scale : fontSize * 0.5) + kern + letterSpacing * scale;
            previousCode = glyph?.id ?? -1;
        }

        return result;
    }

    buildLayout(text: string, fontSize: number, letterSpacing: number = 0, lineSpacing: number = 0): MsdfLayout {
        const scale = fontSize / this.lineHeight;
        const vertices: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];

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

        for (const char of text) {
            if (char === "\n") {
                widestLine = Math.max(widestLine, currentLineWidth);
                currentLineWidth = 0;
                penX = 0;
                penY += this.lineHeight * scale + lineSpacing;
                previousCode = -1;
                lineCount += 1;
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

            penX += (glyph.xadvance + letterSpacing) * scale;
            currentLineWidth = Math.max(currentLineWidth, penX);
            previousCode = glyph.id;
            quadCount += 1;
        }

        widestLine = Math.max(widestLine, currentLineWidth);

        if (quadCount === 0) {
            return {
                vertices: new Float32Array(0),
                uvs: new Float32Array(0),
                indices: new Uint16Array(0),
                width: widestLine,
                height: lineCount * this.lineHeight * scale + Math.max(0, lineCount - 1) * lineSpacing
            };
        }

        maxY = Math.max(maxY, lineCount * this.lineHeight * scale + Math.max(0, lineCount - 1) * lineSpacing);

        for (let i = 0; i < vertices.length; i += 2) {
            vertices[i] -= minX;
            vertices[i + 1] -= minY;
        }

        return {
            vertices: new Float32Array(vertices),
            uvs: new Float32Array(uvs),
            indices: new Uint16Array(indices),
            width: Math.max(widestLine, maxX - minX),
            height: Math.max(lineCount * this.lineHeight * scale + Math.max(0, lineCount - 1) * lineSpacing, maxY - minY)
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
    private _layout: MsdfLayout = createEmptyLayout();
    private _styleIndex = 0;

    constructor(private font: MsdfBitmapFont, options: MsdfTextOptions = {}) {
        super();

        this._text = options.text ?? "";
        this._fontSize = options.fontSize ?? font.lineHeight;
        this._letterSpacing = options.letterSpacing ?? 0;
        this._lineSpacing = 0;
        this._textColor = options.textColor ?? DEFAULT_TEXT_COLOR.clone();
        this._outlineColor = options.outlineColor ?? DEFAULT_OUTLINE_COLOR.clone();
        this._outlineWidth = options.outlineWidth ?? 0;
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
        if (this._text === value) {
            return;
        }
        this._text = value;
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

    set textColor(value: Laya.Vector4) {
        this._textColor = value;
        if (this.useBatchStyleData) {
            this.redraw();
        } else {
            this.syncMaterial();
        }
    }

    set outlineColor(value: Laya.Vector4) {
        this._outlineColor = value;
        if (this.useBatchStyleData) {
            this.redraw();
        } else {
            this.syncMaterial();
        }
    }

    set outlineWidth(value: number) {
        this._outlineWidth = value;
        if (this.useBatchStyleData) {
            this.redraw();
        } else {
            this.syncMaterial();
        }
    }

    resetFont(font: MsdfBitmapFont): void {
        this.font = font;
        if (this.useBatchStyleData) {
            this.materialInstance = this.font.renderState.material;
            this.material = this.materialInstance;
        }
        this.syncMaterial();
        this.refresh();
    }

    refresh(): void {
        this._layout = this.font.buildLayout(this._text, this._fontSize, this._letterSpacing, this._lineSpacing);
        this.redraw();
    }

    private syncMaterial(): void {
        const renderState = this.font.renderState;

        if (this.useBatchStyleData) {
            this._styleIndex = renderState.styleRegistry.register(this._textColor, this._outlineColor);
            return;
        }

        applyMaterialBase(this.materialInstance, this.font, renderState.styleRegistry, false);
        this.materialInstance.setVector4("u_TextColor", this._textColor);
        this.materialInstance.setVector4("u_OutlineColor", this._outlineColor);
        this.materialInstance.setFloat("u_OutlineWidth", this._outlineWidth);
    }

    private redraw(): void {
        this.syncMaterial();
        this.graphics.clear(true);

        if (this._layout.indices.length > 0) {
            if (this.useBatchStyleData) {
                this.graphics.drawTriangles(
                    this.font.texture,
                    0,
                    0,
                    this._layout.vertices,
                    this._layout.uvs,
                    this._layout.indices,
                    null,
                    1,
                    null,
                    null,
                    this._styleIndex,
                    this._outlineWidth
                );
            } else {
                this.graphics.drawTriangles(this.font.texture, 0, 0, this._layout.vertices, this._layout.uvs, this._layout.indices);
            }
        }

        this.size(this._layout.width, this._layout.height);
    }
}
