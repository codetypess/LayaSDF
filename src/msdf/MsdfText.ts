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

    createText(options: MsdfTextOptions): MsdfTextSprite {
        return new MsdfTextSprite(this, options);
    }

    buildLayout(text: string, fontSize: number, letterSpacing: number = 0): MsdfLayout {
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
                penY += this.lineHeight * scale;
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
                vertices: new Float32Array(),
                uvs: new Float32Array(),
                indices: new Uint16Array(),
                width: widestLine,
                height: lineCount * this.lineHeight * scale
            };
        }

        maxY = Math.max(maxY, lineCount * this.lineHeight * scale);

        for (let i = 0; i < vertices.length; i += 2) {
            vertices[i] -= minX;
            vertices[i + 1] -= minY;
        }

        return {
            vertices: new Float32Array(vertices),
            uvs: new Float32Array(uvs),
            indices: new Uint16Array(indices),
            width: Math.max(widestLine, maxX - minX),
            height: Math.max(lineCount * this.lineHeight * scale, maxY - minY)
        };
    }
}

export class MsdfTextSprite extends Laya.Sprite {
    private readonly materialInstance: Laya.Material;

    private _text: string;
    private _fontSize: number;
    private _letterSpacing: number;
    private _textColor: Laya.Vector4;
    private _outlineColor: Laya.Vector4;
    private _outlineWidth: number;

    constructor(private readonly font: MsdfBitmapFont, options: MsdfTextOptions = {}) {
        super();

        this._text = options.text ?? "";
        this._fontSize = options.fontSize ?? font.lineHeight;
        this._letterSpacing = options.letterSpacing ?? 0;
        this._textColor = options.textColor ?? DEFAULT_TEXT_COLOR.clone();
        this._outlineColor = options.outlineColor ?? DEFAULT_OUTLINE_COLOR.clone();
        this._outlineWidth = options.outlineWidth ?? 0;

        this.materialInstance = new Laya.Material();
        this.materialInstance.setShaderName("MsdfTextShader");
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

    set textColor(value: Laya.Vector4) {
        this._textColor = value;
        this.syncMaterial();
    }

    set outlineColor(value: Laya.Vector4) {
        this._outlineColor = value;
        this.syncMaterial();
    }

    set outlineWidth(value: number) {
        this._outlineWidth = value;
        this.syncMaterial();
    }

    refresh(): void {
        const layout = this.font.buildLayout(this._text, this._fontSize, this._letterSpacing);

        this.graphics.clear(true);

        if (layout.indices.length > 0) {
            this.graphics.drawTriangles(this.font.texture, 0, 0, layout.vertices, layout.uvs, layout.indices);
        }

        this.size(layout.width, layout.height);
    }

    private syncMaterial(): void {
        this.materialInstance.setVector4("u_TextColor", this._textColor);
        this.materialInstance.setVector4("u_OutlineColor", this._outlineColor);
        this.materialInstance.setVector2("u_AtlasSize", new Laya.Vector2(this.font.atlasWidth, this.font.atlasHeight));
        this.materialInstance.setFloat("u_DistanceRange", this.font.distanceRange);
        this.materialInstance.setFloat("u_OutlineWidth", this._outlineWidth);
    }
}
