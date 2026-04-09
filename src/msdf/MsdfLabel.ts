import { MsdfBitmapFont, MsdfRichTextRun, MsdfRichTextStyle, MsdfTextSprite } from "./MsdfText";

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
    const num = Laya.Utils.fromStringColor(value || "#ffffff");
    const r = ((num >> 16) & 0xff) / 255;
    const g = ((num >> 8) & 0xff) / 255;
    const b = (num & 0xff) / 255;
    const a = num > 0xffffff ? ((num >> 24) & 0xff) / 255 : 1;
    return new Laya.Vector4(r, g, b, a);
}

function normalizeColor(value: string | null | undefined, fallback: string): string {
    return value || fallback;
}

function sameRichStyle(left: MsdfRichTextStyle, right: MsdfRichTextStyle): boolean {
    return left.fontSize === right.fontSize
        && left.textColorCss === right.textColorCss
        && left.outlineColorCss === right.outlineColorCss
        && left.outlineWidth === right.outlineWidth
        && !!left.bold === !!right.bold
        && !!left.italic === !!right.italic
        && !!left.underline === !!right.underline
        && !!left.strikethrough === !!right.strikethrough
        && (left.align ?? "") === (right.align ?? "");
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
    private _glow = 0;
    private _glowColor = "#ffffff";
    private _bgColor = "";
    private _borderColor = "";
    private _wordWrap = false;
    private _bold = false;
    private _italic = false;
    private _underline = false;
    private _strikethrough = false;
    private _html = false;
    private _ubb = false;

    private _fontTextureUrl = DEFAULT_MSDF_ATLAS_URL;
    private _fontJsonUrl = DEFAULT_MSDF_FONT_JSON_URL;
    private _fontShaderUrl = DEFAULT_MSDF_SHADER_URL;
    private _paddingValues: Padding = [0, 0, 0, 0];

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
        this.callLater(this.updateLayoutFrame);
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
        this._paddingValues = parsePadding(this._padding);
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

    get glow(): number {
        return this._glow;
    }

    set glow(value: number) {
        const next = Math.max(0, value || 0);
        if (this._glow === next) {
            return;
        }
        this._glow = next;
        this.callLater(this.changeText);
    }

    get glowColor(): string {
        return this._glowColor;
    }

    set glowColor(value: string) {
        if (this._glowColor === value) {
            return;
        }
        this._glowColor = value || "#ffffff";
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
        this.callLater(this.updateLayoutFrame);
    }

    get borderColor(): string {
        return this._borderColor;
    }

    set borderColor(value: string) {
        if (this._borderColor === value) {
            return;
        }
        this._borderColor = value || "";
        this.callLater(this.updateLayoutFrame);
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

    get bold(): boolean {
        return this._bold;
    }

    set bold(value: boolean) {
        const next = !!value;
        if (this._bold === next) {
            return;
        }
        this._bold = next;
        this.callLater(this.changeText);
    }

    get italic(): boolean {
        return this._italic;
    }

    set italic(value: boolean) {
        const next = !!value;
        if (this._italic === next) {
            return;
        }
        this._italic = next;
        this.callLater(this.changeText);
    }

    get underline(): boolean {
        return this._underline;
    }

    set underline(value: boolean) {
        const next = !!value;
        if (this._underline === next) {
            return;
        }
        this._underline = next;
        this.callLater(this.changeText);
    }

    get strikethrough(): boolean {
        return this._strikethrough;
    }

    set strikethrough(value: boolean) {
        const next = !!value;
        if (this._strikethrough === next) {
            return;
        }
        this._strikethrough = next;
        this.callLater(this.changeText);
    }

    get html(): boolean {
        return this._html;
    }

    set html(value: boolean) {
        const next = !!value;
        if (this._html === next) {
            return;
        }
        this._html = next;
        this.callLater(this.changeText);
    }

    get ubb(): boolean {
        return this._ubb;
    }

    set ubb(value: boolean) {
        const next = !!value;
        if (this._ubb === next) {
            return;
        }
        this._ubb = next;
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
        return (this._textSprite?.contentWidth ?? 0) + this._paddingValues[1] + this._paddingValues[3] + this.getGlowPadding() * 2;
    }

    protected measureHeight(): number {
        return (this._textSprite?.contentHeight ?? 0) + this._paddingValues[0] + this._paddingValues[2] + this.getGlowPadding() * 2;
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
                this._textSprite = new MsdfTextSprite(font);
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

    private createBaseTextStyle(): any {
        const TextStyleCtor = (Laya as any).TextStyle;
        const style = TextStyleCtor ? new TextStyleCtor() : {};

        style.fontSize = this._fontSize;
        style.color = this._color;
        style.bold = this._bold;
        style.italic = this._italic;
        style.underline = this._underline;
        style.underlineColor = null;
        style.strikethrough = this._strikethrough;
        style.strikethroughColor = null;
        style.align = this._align;
        style.valign = this._valign;
        style.leading = this._leading;
        style.stroke = this._stroke;
        style.strokeColor = this._strokeColor;

        return style;
    }

    private toRichTextStyle(style: any): MsdfRichTextStyle {
        const textColorCss = normalizeColor(style?.color, this._color);
        const outlineColorCss = normalizeColor(style?.strokeColor, this._strokeColor);
        const strokeValue = style?.stroke;
        const outlineWidth = typeof strokeValue === "number"
            ? strokeValue
            : Number(strokeValue ?? this._stroke) || 0;

        return {
            fontSize: Number(style?.fontSize ?? this._fontSize) || this._fontSize,
            textColor: colorToVector4(textColorCss),
            textColorCss,
            outlineColor: colorToVector4(outlineColorCss),
            outlineColorCss,
            outlineWidth,
            bold: !!style?.bold,
            italic: !!style?.italic,
            underline: !!style?.underline,
            strikethrough: !!style?.strikethrough,
            align: style?.align || this._align
        };
    }

    private appendRichTextRun(runs: MsdfRichTextRun[], text: string, style: MsdfRichTextStyle): void {
        if (!text) {
            return;
        }

        const previous = runs[runs.length - 1];
        if (previous && sameRichStyle(previous.style, style)) {
            previous.text += text;
            return;
        }

        runs.push({ text, style });
    }

    private buildTextRuns(): MsdfRichTextRun[] {
        const sourceText = this._text.replace(/\r\n?/g, "\n");
        const baseStyle = this.createBaseTextStyle();
        const runs: MsdfRichTextRun[] = [];

        let parsedText = sourceText;
        let useHtml = this._html;

        if (this._ubb) {
            const ubbParser = (Laya as any).UBBParser?.defaultParser;
            if (ubbParser) {
                parsedText = ubbParser.parse(parsedText);
                useHtml = true;
            }
        }

        if (!useHtml) {
            this.appendRichTextRun(runs, parsedText, this.toRichTextStyle(baseStyle));
            return runs;
        }

        const htmlParser = (Laya as any).HtmlParser?.defaultParser;
        const htmlElementType = (Laya as any).HtmlElementType;
        const htmlElement = (Laya as any).HtmlElement;

        if (!htmlParser || !htmlElementType) {
            this.appendRichTextRun(runs, parsedText, this.toRichTextStyle(baseStyle));
            return runs;
        }

        const elements: any[] = [];
        htmlParser.parse(parsedText, baseStyle, elements);

        for (const element of elements) {
            if (element.type !== htmlElementType.Text || !element.text) {
                continue;
            }

            this.appendRichTextRun(runs, element.text, this.toRichTextStyle(element.style));
        }

        if (htmlElement?.returnToPool) {
            htmlElement.returnToPool(elements);
        }

        return runs;
    }

    private getGlowPadding(): number {
        return this._glow > 0 ? Math.ceil(this._glow) : 0;
    }

    private changeText(): void {
        if (!this._font || !this._textSprite) {
            return;
        }

        const padding = this._paddingValues;
        const glowPadding = this.getGlowPadding();
        const availableWidth = this._hasExplicitWidth
            ? Math.max(this.width - padding[1] - padding[3] - glowPadding * 2, 0)
            : 0;
        const wrapWidth = this._wordWrap && this._hasExplicitWidth ? availableWidth : 0;

        this._textSprite.layoutWidth = this._hasExplicitWidth ? availableWidth : 0;
        this._textSprite.wordWrapWidth = wrapWidth;
        this._textSprite.letterSpacing = this._letterSpacing;
        this._textSprite.lineSpacing = this._leading;
        this._textSprite.defaultAlign = this._align;
        this._textSprite.setGlowStyle(colorToVector4(this._glowColor), this._glow);
        this._textSprite.setRuns(this.buildTextRuns());
        this._textSprite.refresh();
        this.updateLayoutFrame();
    }

    private updateLayoutFrame(): void {
        if (!this._textSprite) {
            return;
        }

        const padding = this._paddingValues;
        const glowPadding = this.getGlowPadding();
        const measuredWidth = this._textSprite.contentWidth + padding[1] + padding[3] + glowPadding * 2;
        const measuredHeight = this._textSprite.contentHeight + padding[0] + padding[2] + glowPadding * 2;
        const layoutWidth = this._hasExplicitWidth ? this.width : measuredWidth;
        const layoutHeight = this._hasExplicitHeight ? this.height : measuredHeight;
        const availableHeight = this._hasExplicitHeight
            ? Math.max(layoutHeight - padding[0] - padding[2] - glowPadding * 2, 0)
            : this._textSprite.contentHeight;

        const x = padding[3] + glowPadding;
        let y = padding[0] + glowPadding;
        if (this._valign === "middle") {
            y += Math.max((availableHeight - this._textSprite.contentHeight) * 0.5, 0);
        } else if (this._valign === "bottom") {
            y += Math.max(availableHeight - this._textSprite.contentHeight, 0);
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
