import { MsdfBitmapFont, MsdfTextSprite } from "./MsdfText";

const DEFAULT_MSDF_SHADER_URL = "res://66e84b33-56bf-4d18-97d1-4239936447c2";
const DEFAULT_MSDF_ATLAS_URL = "res://40ae4c4f-c490-4311-99f2-d7b00cd1976b";
const DEFAULT_MSDF_FONT_JSON_URL = "res://bb450ed1-6826-4998-b470-d77a2462095a";

type Padding = [number, number, number, number];

const { regClass } = Laya;

function parsePadding(value: string): Padding {
    const parts = value.split(",").map(item => Number(item.trim()) || 0);

    if (parts.length === 1) {
        return [parts[0], parts[0], parts[0], parts[0]];
    }

    if (parts.length === 2) {
        return [parts[0], parts[1], parts[0], parts[1]];
    }

    if (parts.length === 3) {
        return [parts[0], parts[1], parts[2], parts[1]];
    }

    return [
        parts[0] ?? 0,
        parts[1] ?? 0,
        parts[2] ?? 0,
        parts[3] ?? 0
    ];
}

function colorToVector4(value: string): Laya.Vector4 {
    const num = Laya.Utils.fromStringColor(value);
    const r = ((num >> 16) & 0xff) / 255;
    const g = ((num >> 8) & 0xff) / 255;
    const b = (num & 0xff) / 255;
    const a = num > 0xffffff ? ((num >> 24) & 0xff) / 255 : 1;
    return new Laya.Vector4(r, g, b, a);
}

@regClass()
export class MsdfLabel extends Laya.UIComponent {
    private static readonly fontCache = new Map<string, Promise<MsdfBitmapFont>>();

    private _textSprite: MsdfTextSprite | null = null;
    private _font: MsdfBitmapFont | null = null;
    private _resourceKey = "";
    private _hasExplicitWidth = false;
    private _hasExplicitHeight = false;

    private _text = "";
    private _fontSize = 56;
    private _letterSpacing = 0;
    private _color = "#ffffff";
    private _align = "left";
    private _valign = "top";
    private _leading = 0;
    private _padding = "0,0,0,0";
    private _stroke = 0;
    private _strokeColor = "#000000";
    private _bgColor = "";
    private _borderColor = "";
    private _wordWrap = false;

    private _fontTextureUrl = DEFAULT_MSDF_ATLAS_URL;
    private _fontJsonUrl = DEFAULT_MSDF_FONT_JSON_URL;
    private _fontShaderUrl = DEFAULT_MSDF_SHADER_URL;

    constructor(text?: string) {
        super(false);
        this._text = text ?? "";
        this.createChildren();
        this.initialize();
    }

    static preload(textureUrl: string = DEFAULT_MSDF_ATLAS_URL, jsonUrl: string = DEFAULT_MSDF_FONT_JSON_URL, shaderUrl: string = DEFAULT_MSDF_SHADER_URL): Promise<MsdfBitmapFont> {
        const key = `${shaderUrl}|${textureUrl}|${jsonUrl}`;
        let task = MsdfLabel.fontCache.get(key);

        if (!task) {
            task = (async () => {
                await Laya.loader.load(shaderUrl);
                return MsdfBitmapFont.load(textureUrl, jsonUrl);
            })();
            MsdfLabel.fontCache.set(key, task);
        }

        return task;
    }

    get text(): string {
        return this._text;
    }

    set text(value: string) {
        if (this._text === value) {
            return;
        }
        this._text = value ?? "";
        this.callLater(this.changeText);
        this.event(Laya.Event.CHANGE);
    }

    get fontSize(): number {
        return this._fontSize;
    }

    set fontSize(value: number) {
        if (this._fontSize === value) {
            return;
        }
        this._fontSize = value;
        this.callLater(this.changeText);
    }

    get letterSpacing(): number {
        return this._letterSpacing;
    }

    set letterSpacing(value: number) {
        if (this._letterSpacing === value) {
            return;
        }
        this._letterSpacing = value;
        this.callLater(this.changeText);
    }

    get color(): string {
        return this._color;
    }

    set color(value: string) {
        if (this._color === value) {
            return;
        }
        this._color = value || "#ffffff";
        this.callLater(this.changeText);
    }

    get align(): string {
        return this._align;
    }

    set align(value: string) {
        if (this._align === value) {
            return;
        }
        this._align = value || "left";
        this.callLater(this.changeText);
    }

    get valign(): string {
        return this._valign;
    }

    set valign(value: string) {
        if (this._valign === value) {
            return;
        }
        this._valign = value || "top";
        this.callLater(this.changeText);
    }

    get leading(): number {
        return this._leading;
    }

    set leading(value: number) {
        if (this._leading === value) {
            return;
        }
        this._leading = value;
        this.callLater(this.changeText);
    }

    get padding(): string {
        return this._padding;
    }

    set padding(value: string) {
        if (this._padding === value) {
            return;
        }
        this._padding = value || "0,0,0,0";
        this.callLater(this.changeText);
    }

    get stroke(): number {
        return this._stroke;
    }

    set stroke(value: number) {
        if (this._stroke === value) {
            return;
        }
        this._stroke = value;
        this.callLater(this.changeText);
    }

    get strokeColor(): string {
        return this._strokeColor;
    }

    set strokeColor(value: string) {
        if (this._strokeColor === value) {
            return;
        }
        this._strokeColor = value || "#000000";
        this.callLater(this.changeText);
    }

    get bgColor(): string {
        return this._bgColor;
    }

    set bgColor(value: string) {
        if (this._bgColor === value) {
            return;
        }
        this._bgColor = value || "";
        this.callLater(this.changeText);
    }

    get borderColor(): string {
        return this._borderColor;
    }

    set borderColor(value: string) {
        if (this._borderColor === value) {
            return;
        }
        this._borderColor = value || "";
        this.callLater(this.changeText);
    }

    get wordWrap(): boolean {
        return this._wordWrap;
    }

    set wordWrap(value: boolean) {
        if (this._wordWrap === value) {
            return;
        }
        this._wordWrap = value;
        this.callLater(this.changeText);
    }

    get fontTextureUrl(): string {
        return this._fontTextureUrl;
    }

    set fontTextureUrl(value: string) {
        if (this._fontTextureUrl === value) {
            return;
        }
        this._fontTextureUrl = value || DEFAULT_MSDF_ATLAS_URL;
        this.reloadFont();
    }

    get fontJsonUrl(): string {
        return this._fontJsonUrl;
    }

    set fontJsonUrl(value: string) {
        if (this._fontJsonUrl === value) {
            return;
        }
        this._fontJsonUrl = value || DEFAULT_MSDF_FONT_JSON_URL;
        this.reloadFont();
    }

    get fontShaderUrl(): string {
        return this._fontShaderUrl;
    }

    set fontShaderUrl(value: string) {
        if (this._fontShaderUrl === value) {
            return;
        }
        this._fontShaderUrl = value || DEFAULT_MSDF_SHADER_URL;
        this.reloadFont();
    }

    protected createChildren(): void {
        super.createChildren();
        this.reloadFont();
    }

    protected measureWidth(): number {
        const padding = parsePadding(this._padding);
        return (this._textSprite?.width ?? 0) + padding[1] + padding[3];
    }

    protected measureHeight(): number {
        const padding = parsePadding(this._padding);
        return (this._textSprite?.height ?? 0) + padding[0] + padding[2];
    }

    protected commitMeasure(): void {
        this.runCallLater(this.changeText);
        super.commitMeasure();
    }

    protected _sizeChanged(): void {
        super._sizeChanged();
        this.callLater(this.changeText);
    }

    set_width(value: number): void {
        this._hasExplicitWidth = value > 0;
        super.set_width(value);
    }

    set_height(value: number): void {
        this._hasExplicitHeight = value > 0;
        super.set_height(value);
    }

    set_dataSource(value: any): void {
        if (typeof value === "number" || typeof value === "string") {
            this.text = `${value}`;
            return;
        }

        super.set_dataSource(value);
    }

    private reloadFont(): void {
        const nextKey = `${this._fontShaderUrl}|${this._fontTextureUrl}|${this._fontJsonUrl}`;
        this._resourceKey = nextKey;
        this._font = null;

        MsdfLabel.preload(this._fontTextureUrl, this._fontJsonUrl, this._fontShaderUrl).then(font => {
            if (this.destroyed || this._resourceKey !== nextKey) {
                return;
            }

            this._font = font;

            if (!this._textSprite) {
                this._textSprite = font.createText({});
                this._textSprite.mouseThrough = true;
                this.addChild(this._textSprite);
            } else {
                this._textSprite.resetFont(font);
            }

            this.changeText();
            this.event(Laya.Event.LOADED);
        }).catch(error => {
            console.error("[MsdfLabel] failed to load font resources", error);
        });
    }

    private changeText(): void {
        if (!this._font || !this._textSprite) {
            return;
        }

        const padding = parsePadding(this._padding);
        const wrapWidth = this._wordWrap && this._hasExplicitWidth
            ? Math.max(this.width - padding[1] - padding[3], 0)
            : 0;

        this._textSprite.text = wrapWidth > 0
            ? this._font.wrapText(this._text, this._fontSize, wrapWidth, this._letterSpacing)
            : this._text;
        this._textSprite.fontSize = this._fontSize;
        this._textSprite.letterSpacing = this._letterSpacing;
        this._textSprite.lineSpacing = this._leading;
        this._textSprite.textColor = colorToVector4(this._color);
        this._textSprite.outlineColor = colorToVector4(this._strokeColor);
        this._textSprite.outlineWidth = this._stroke;
        this._textSprite.refresh();

        const measuredWidth = this._textSprite.width + padding[1] + padding[3];
        const measuredHeight = this._textSprite.height + padding[0] + padding[2];
        const layoutWidth = this._hasExplicitWidth ? this.width : measuredWidth;
        const layoutHeight = this._hasExplicitHeight ? this.height : measuredHeight;
        const availableWidth = this._hasExplicitWidth ? Math.max(layoutWidth - padding[1] - padding[3], 0) : this._textSprite.width;
        const availableHeight = this._hasExplicitHeight ? Math.max(layoutHeight - padding[0] - padding[2], 0) : this._textSprite.height;

        let x = padding[3];
        if (this._align === "center") {
            x += Math.max((availableWidth - this._textSprite.width) * 0.5, 0);
        } else if (this._align === "right") {
            x += Math.max(availableWidth - this._textSprite.width, 0);
        }

        let y = padding[0];
        if (this._valign === "middle") {
            y += Math.max((availableHeight - this._textSprite.height) * 0.5, 0);
        } else if (this._valign === "bottom") {
            y += Math.max(availableHeight - this._textSprite.height, 0);
        }

        this._textSprite.pos(x, y);
        this.drawBackground(layoutWidth, layoutHeight);
        this.repaint();
    }

    private drawBackground(width: number, height: number): void {
        this.graphics.clear();

        if (width <= 0 || height <= 0) {
            return;
        }

        if (!this._bgColor && !this._borderColor) {
            return;
        }

        this.graphics.drawRect(0, 0, width, height, this._bgColor || null, this._borderColor || null, this._borderColor ? 1 : 0);
    }
}
