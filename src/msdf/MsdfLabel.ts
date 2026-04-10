import { MsdfBitmapFont, MsdfOverflow, MsdfRichTextRun, MsdfRichTextStyle, MsdfTextLineMetric, MsdfTextSprite } from "./MsdfText";

const DEFAULT_MSDF_SHADER_URL = "res://66e84b33-56bf-4d18-97d1-4239936447c2";
const DEFAULT_MSDF_ATLAS_URL = "res://40ae4c4f-c490-4311-99f2-d7b00cd1976b";
const DEFAULT_MSDF_FONT_JSON_URL = "res://bb450ed1-6826-4998-b470-d77a2462095a";

type Padding = [number, number, number, number];
type MsdfLabelFitContent = "no" | "yes" | "height";
type MsdfFontResourceConfig = {
    textureUrl: string;
    jsonUrl: string;
    shaderUrl?: string;
};
const NORMALIZE_CR = /\r\n?/g;
const ESCAPE_CHARS_PATTERN = /\\(\w)/g;
const ESCAPE_SEQUENCE: Record<string, string> = { "\\n": "\n", "\\t": "\t" };

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
        && (left.underlineColorCss ?? "") === (right.underlineColorCss ?? "")
        && (left.strikethroughColorCss ?? "") === (right.strikethroughColorCss ?? "")
        && left.outlineColorCss === right.outlineColorCss
        && left.outlineWidth === right.outlineWidth
        && !!left.bold === !!right.bold
        && !!left.italic === !!right.italic
        && !!left.underline === !!right.underline
        && !!left.strikethrough === !!right.strikethrough
        && (left.align ?? "") === (right.align ?? "")
        && (left.alignItems ?? "") === (right.alignItems ?? "");
}

@regClass()
export class MsdfLabel extends Laya.UIComponent {
    private static readonly fontCache = new Map<string, Promise<MsdfBitmapFont>>();
    private static readonly registeredFonts = new Map<string, MsdfFontResourceConfig>();

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
    private _alignItems = "middle";
    private _leading = 0;
    private _padding = "0,0,0,0";
    private _stroke = 0;
    private _strokeColor = "#000000";
    private _glow = 0;
    private _glowColor = "#ffffff";
    private _shadowColor = "#000000";
    private _shadowBlur = 0;
    private _shadowOffsetX = 0;
    private _shadowOffsetY = 0;
    private _bgColor = "";
    private _borderColor = "";
    private _wordWrap = false;
    private _bold = false;
    private _italic = false;
    private _underline = false;
    private _underlineColor = "";
    private _strikethrough = false;
    private _strikethroughColor = "";
    private _html = false;
    private _ubb = false;
    private _fontName = "";
    private _maxWidth = 0;
    private _overflow: MsdfOverflow = "visible";
    private _fitContent: MsdfLabelFitContent = "no";
    private _fitFlag = false;
    private _ignoreLang = false;
    private _templateVars: Record<string, any> | null = null;
    private _htmlParseOptions: any = null;
    private _parseEscapeChars = true;

    private _fontTextureUrl = DEFAULT_MSDF_ATLAS_URL;
    private _fontJsonUrl = DEFAULT_MSDF_FONT_JSON_URL;
    private _fontShaderUrl = DEFAULT_MSDF_SHADER_URL;
    private _paddingValues: Padding = [0, 0, 0, 0];
    private _maxOutlineWidth = 0;

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

    static registerFont(name: string, textureUrl: string, jsonUrl: string, shaderUrl: string = DEFAULT_MSDF_SHADER_URL): void {
        if (!name) {
            return;
        }

        MsdfLabel.registeredFonts.set(name, { textureUrl, jsonUrl, shaderUrl });
    }

    static unregisterFont(name: string): void {
        if (!name) {
            return;
        }

        MsdfLabel.registeredFonts.delete(name);
    }

    private static replaceEscapeChar(word: string): string {
        return ESCAPE_SEQUENCE[word] ?? word;
    }

    get text(): string {
        return this._text;
    }

    set text(value: string) {
        let nextValue = value == null ? "" : typeof value === "string" ? value : `${value}`;
        const langPacks = (Laya.Text as typeof Laya.Text & { langPacks?: Record<string, string>; })?.langPacks;
        if (!this._ignoreLang && langPacks) {
            nextValue = langPacks[nextValue] || nextValue;
        }

        if (this._text === nextValue) {
            return;
        }
        this._text = nextValue;
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

    get alignItems(): string {
        return this._alignItems;
    }

    set alignItems(value: string) {
        const next = value || "middle";
        if (this._alignItems === next) {
            return;
        }
        this._alignItems = next;
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

    get shadowColor(): string {
        return this._shadowColor;
    }

    set shadowColor(value: string) {
        if (this._shadowColor === value) {
            return;
        }
        this._shadowColor = value || "#000000";
        this.callLater(this.changeText);
    }

    get shadowBlur(): number {
        return this._shadowBlur;
    }

    set shadowBlur(value: number) {
        const next = Math.max(0, value || 0);
        if (this._shadowBlur === next) {
            return;
        }
        this._shadowBlur = next;
        this.callLater(this.changeText);
    }

    get shadowOffsetX(): number {
        return this._shadowOffsetX;
    }

    set shadowOffsetX(value: number) {
        if (this._shadowOffsetX === value) {
            return;
        }
        this._shadowOffsetX = value || 0;
        this.callLater(this.changeText);
    }

    get shadowOffsetY(): number {
        return this._shadowOffsetY;
    }

    set shadowOffsetY(value: number) {
        if (this._shadowOffsetY === value) {
            return;
        }
        this._shadowOffsetY = value || 0;
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

    get underlineColor(): string {
        return this._underlineColor;
    }

    set underlineColor(value: string) {
        if (this._underlineColor === value) {
            return;
        }
        this._underlineColor = value || "";
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

    get strikethroughColor(): string {
        return this._strikethroughColor;
    }

    set strikethroughColor(value: string) {
        if (this._strikethroughColor === value) {
            return;
        }
        this._strikethroughColor = value || "";
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

    get font(): string {
        return this._fontName;
    }

    set font(value: string) {
        if (this._fontName === value) {
            return;
        }

        this._fontName = value || "";
        const resources = this.resolveFontResources(this._fontName);
        if (!resources) {
            console.warn(`[MsdfLabel] unresolved font "${this._fontName}". Use MsdfLabel.registerFont(name, textureUrl, jsonUrl, shaderUrl) or pass "texture|json|shader".`);
            return;
        }

        this.applyFontResources(resources);
    }

    get maxWidth(): number {
        return this._maxWidth;
    }

    set maxWidth(value: number) {
        const next = Math.max(0, value || 0);
        if (this._maxWidth === next) {
            return;
        }

        this._maxWidth = next;
        this.callLater(this.changeText);
    }

    get overflow(): MsdfOverflow {
        return this._overflow;
    }

    set overflow(value: MsdfOverflow) {
        const next = value || "visible";
        if (this._overflow === next) {
            return;
        }

        this._overflow = next;
        this.callLater(this.changeText);
    }

    get fitContent(): MsdfLabelFitContent {
        return this._fitContent;
    }

    set fitContent(value: MsdfLabelFitContent | boolean) {
        const next = typeof value === "boolean"
            ? (value ? "yes" : "no")
            : (value || "no");
        if (this._fitContent === next) {
            return;
        }

        this._fitContent = next;
        this.callLater(this.changeText);
    }

    get textField(): MsdfTextSprite | null {
        return this._textSprite;
    }

    get ignoreLang(): boolean {
        return this._ignoreLang;
    }

    set ignoreLang(value: boolean) {
        const next = !!value;
        if (this._ignoreLang === next) {
            return;
        }

        this._ignoreLang = next;
        this.text = this._text;
    }

    get templateVars(): Record<string, any> | null {
        return this._templateVars;
    }

    set templateVars(value: Record<string, any> | boolean | null) {
        if (!this._templateVars && !value) {
            return;
        }

        if (value === true) {
            this._templateVars = {};
        } else if (value === false || value == null) {
            this._templateVars = null;
        } else {
            this._templateVars = value;
        }

        this.callLater(this.changeText);
    }

    get htmlParseOptions(): any {
        return this._htmlParseOptions;
    }

    set htmlParseOptions(value: any) {
        this._htmlParseOptions = value;
    }

    get lines(): ReadonlyArray<MsdfTextLineMetric> {
        return this._textSprite?.lines ?? [];
    }

    get scrollX(): number {
        return this._textSprite?.scrollX ?? 0;
    }

    set scrollX(value: number) {
        if (!this._textSprite) {
            return;
        }

        this._textSprite.scrollX = value || 0;
        this.updateLayoutFrame();
    }

    get scrollY(): number {
        return this._textSprite?.scrollY ?? 0;
    }

    set scrollY(value: number) {
        if (!this._textSprite) {
            return;
        }

        this._textSprite.scrollY = value || 0;
        this.updateLayoutFrame();
    }

    get maxScrollX(): number {
        return this._textSprite?.maxScrollX ?? 0;
    }

    get maxScrollY(): number {
        return this._textSprite?.maxScrollY ?? 0;
    }

    get textWidth(): number {
        const effectInsets = this.getEffectInsets();
        return (this._textSprite?.contentWidth ?? 0) + effectInsets[1] + effectInsets[3];
    }

    get textHeight(): number {
        const effectInsets = this.getEffectInsets();
        return (this._textSprite?.contentHeight ?? 0) + effectInsets[0] + effectInsets[2];
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
        const effectInsets = this.getEffectInsets();
        return (this._textSprite?.contentWidth ?? 0)
            + this._paddingValues[1]
            + this._paddingValues[3]
            + effectInsets[1]
            + effectInsets[3];
    }

    protected measureHeight(): number {
        const effectInsets = this.getEffectInsets();
        return (this._textSprite?.contentHeight ?? 0)
            + this._paddingValues[0]
            + this._paddingValues[2]
            + effectInsets[0]
            + effectInsets[2];
    }

    protected commitMeasure(): void {
        this.runCallLater(this.changeText);
        super.commitMeasure();
    }

    get_width(): number {
        if (this._hasExplicitWidth || this._text) {
            return super.get_width();
        }

        return 0;
    }

    get_height(): number {
        if (this._hasExplicitHeight || this._text) {
            return super.get_height();
        }

        return 0;
    }

    protected _sizeChanged(): void {
        super._sizeChanged();
        this.callLater(this.changeText);
    }

    set_width(value: number): void {
        if (this._fitContent === "yes" && !this._fitFlag) {
            return;
        }

        this._hasExplicitWidth = value > 0;
        super.set_width(value);
    }

    set_height(value: number): void {
        if ((this._fitContent === "yes" || this._fitContent === "height") && !this._fitFlag) {
            return;
        }

        this._hasExplicitHeight = value > 0;
        super.set_height(value);
    }

    set_dataSource(value: any): void {
        this._dataSource = value;
        if (typeof value === "number" || typeof value === "string") {
            this.text = `${value}`;
            return;
        }

        super.set_dataSource(value);
    }

    private resolveFontResources(value: string): MsdfFontResourceConfig | null {
        if (!value) {
            return {
                textureUrl: DEFAULT_MSDF_ATLAS_URL,
                jsonUrl: DEFAULT_MSDF_FONT_JSON_URL,
                shaderUrl: DEFAULT_MSDF_SHADER_URL
            };
        }

        const registered = MsdfLabel.registeredFonts.get(value);
        if (registered) {
            return registered;
        }

        const parts = value.split("|").map(item => item.trim()).filter(Boolean);
        if (parts.length === 2 || parts.length === 3) {
            return {
                textureUrl: parts[0],
                jsonUrl: parts[1],
                shaderUrl: parts[2] || DEFAULT_MSDF_SHADER_URL
            };
        }

        return null;
    }

    setVar(name: string, value: any): MsdfLabel {
        if (!this._templateVars) {
            this._templateVars = {};
        }
        this._templateVars[name] = value;
        this.callLater(this.changeText);
        return this;
    }

    private parseTemplate(template: string): string {
        if (!this._templateVars) {
            return template;
        }

        let pos1 = 0;
        let pos2 = 0;
        let pos3 = 0;
        let result = "";

        while ((pos2 = template.indexOf("{", pos1)) !== -1) {
            if (pos2 > 0 && template.charCodeAt(pos2 - 1) === 92) {
                result += template.substring(pos1, pos2 - 1);
                result += "{";
                pos1 = pos2 + 1;
                continue;
            }

            result += template.substring(pos1, pos2);
            pos1 = pos2;
            pos2 = template.indexOf("}", pos1);
            if (pos2 === -1) {
                break;
            }

            if (pos2 === pos1 + 1) {
                result += template.substring(pos1, pos1 + 2);
                pos1 = pos2 + 1;
                continue;
            }

            const tag = template.substring(pos1 + 1, pos2);
            pos3 = tag.indexOf("=");
            if (pos3 !== -1) {
                const value = this._templateVars[tag.substring(0, pos3)];
                result += value == null ? tag.substring(pos3 + 1) : value;
            } else {
                const value = this._templateVars[tag];
                if (value != null) {
                    result += value;
                }
            }

            pos1 = pos2 + 1;
        }

        if (pos1 < template.length) {
            result += template.substring(pos1);
        }

        return result;
    }

    private applyFontResources(resources: MsdfFontResourceConfig): void {
        const textureUrl = resources.textureUrl || DEFAULT_MSDF_ATLAS_URL;
        const jsonUrl = resources.jsonUrl || DEFAULT_MSDF_FONT_JSON_URL;
        const shaderUrl = resources.shaderUrl || DEFAULT_MSDF_SHADER_URL;

        if (this._fontTextureUrl === textureUrl
            && this._fontJsonUrl === jsonUrl
            && this._fontShaderUrl === shaderUrl) {
            return;
        }

        this._fontTextureUrl = textureUrl;
        this._fontJsonUrl = jsonUrl;
        this._fontShaderUrl = shaderUrl;
        this.reloadFont();
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
        style.underlineColor = this._underlineColor || null;
        style.strikethrough = this._strikethrough;
        style.strikethroughColor = this._strikethroughColor || null;
        style.align = this._align;
        style.alignItems = this._alignItems;
        style.valign = this._valign;
        style.leading = this._leading;
        style.stroke = this._stroke;
        style.strokeColor = this._strokeColor;

        return style;
    }

    private toRichTextStyle(style: any): MsdfRichTextStyle {
        const textColorCss = normalizeColor(style?.color, this._color);
        const underlineColorCss = style?.underlineColor || null;
        const strikethroughColorCss = style?.strikethroughColor || null;
        const outlineColorCss = normalizeColor(style?.strokeColor, this._strokeColor);
        const strokeValue = style?.stroke;
        const outlineWidth = typeof strokeValue === "number"
            ? strokeValue
            : Number(strokeValue ?? this._stroke) || 0;

        return {
            fontSize: Number(style?.fontSize ?? this._fontSize) || this._fontSize,
            textColor: colorToVector4(textColorCss),
            textColorCss,
            underlineColor: underlineColorCss ? colorToVector4(underlineColorCss) : null,
            underlineColorCss,
            strikethroughColor: strikethroughColorCss ? colorToVector4(strikethroughColorCss) : null,
            strikethroughColorCss,
            outlineColor: colorToVector4(outlineColorCss),
            outlineColorCss,
            outlineWidth,
            bold: !!style?.bold,
            italic: !!style?.italic,
            underline: !!style?.underline,
            strikethrough: !!style?.strikethrough,
            align: style?.align || this._align,
            alignItems: style?.alignItems || this._alignItems
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
        let sourceText = this._text.replace(NORMALIZE_CR, "\n");
        if (this._parseEscapeChars) {
            sourceText = sourceText.replace(ESCAPE_CHARS_PATTERN, MsdfLabel.replaceEscapeChar);
        }
        if (this._templateVars) {
            sourceText = this.parseTemplate(sourceText);
        }
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
        htmlParser.parse(parsedText, baseStyle, elements, this._htmlParseOptions);

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

    private getMaxOutlineWidth(runs?: MsdfRichTextRun[]): number {
        let maxOutlineWidth = Math.max(this._stroke, 0);
        const sourceRuns = runs ?? this.buildTextRuns();
        for (const run of sourceRuns) {
            maxOutlineWidth = Math.max(maxOutlineWidth, run.style.outlineWidth || 0);
        }
        return maxOutlineWidth;
    }

    private getEffectInsets(maxOutlineWidth: number = this._maxOutlineWidth): Padding {
        const outlineExtent = Math.max(maxOutlineWidth, 0);
        const primaryInset = Math.ceil(outlineExtent + Math.max(this._glow, 0));

        if (this._shadowBlur <= 0 && this._shadowOffsetX === 0 && this._shadowOffsetY === 0) {
            return [primaryInset, primaryInset, primaryInset, primaryInset];
        }

        const shadowBaseInset = outlineExtent + Math.ceil(this._shadowBlur);
        return [
            Math.max(primaryInset, Math.max(0, Math.ceil(shadowBaseInset - this._shadowOffsetY))),
            Math.max(primaryInset, Math.max(0, Math.ceil(shadowBaseInset + this._shadowOffsetX))),
            Math.max(primaryInset, Math.max(0, Math.ceil(shadowBaseInset + this._shadowOffsetY))),
            Math.max(primaryInset, Math.max(0, Math.ceil(shadowBaseInset - this._shadowOffsetX)))
        ];
    }

    changeText(text?: string): void {
        if (typeof text === "string") {
            this.text = text;
            return;
        }

        if (!this._font || !this._textSprite) {
            return;
        }

        const runs = this.buildTextRuns();
        this._maxOutlineWidth = this.getMaxOutlineWidth(runs);
        const padding = this._paddingValues;
        const effectInsets = this.getEffectInsets(this._maxOutlineWidth);
        const availableWidth = this._hasExplicitWidth
            ? Math.max(this.width - padding[1] - padding[3] - effectInsets[1] - effectInsets[3], 0)
            : Number.MAX_VALUE;
        const availableHeight = this._hasExplicitHeight
            ? Math.max(this.height - padding[0] - padding[2] - effectInsets[0] - effectInsets[2], 0)
            : 0;
        const maxWidth = this._maxWidth > 0
            ? Math.max(this._maxWidth - padding[1] - padding[3] - effectInsets[1] - effectInsets[3], 0)
            : Number.MAX_VALUE;
        const widthLimit = Math.min(availableWidth, maxWidth);
        const hasWidthLimit = Number.isFinite(widthLimit) && widthLimit < Number.MAX_VALUE;
        const wrapWidth = (this._wordWrap || this._maxWidth > 0 || this._overflow === "ellipsis") && hasWidthLimit
            ? widthLimit
            : 0;

        this._textSprite.layoutWidth = this._hasExplicitWidth ? Math.max(availableWidth, 0) : 0;
        this._textSprite.layoutHeight = availableHeight;
        this._textSprite.wordWrapWidth = wrapWidth;
        this._textSprite.letterSpacing = this._letterSpacing;
        this._textSprite.lineSpacing = this._leading;
        this._textSprite.defaultAlign = this._align;
        this._textSprite.alignItems = this._alignItems;
        this._textSprite.overflow = this._overflow;
        this._textSprite.setGlowStyle(colorToVector4(this._glowColor), this._glow);
        this._textSprite.setShadowStyle(
            colorToVector4(this._shadowColor),
            this._shadowOffsetX,
            this._shadowOffsetY,
            this._shadowBlur
        );
        this._textSprite.setRuns(runs);
        this._textSprite.refresh();
        this.updateLayoutFrame();
    }

    private updateLayoutFrame(): void {
        if (!this._textSprite) {
            return;
        }

        const padding = this._paddingValues;
        const effectInsets = this.getEffectInsets();
        const measuredWidth = this._textSprite.contentWidth + padding[1] + padding[3] + effectInsets[1] + effectInsets[3];
        const measuredHeight = this._textSprite.contentHeight + padding[0] + padding[2] + effectInsets[0] + effectInsets[2];

        if (!this._fitFlag && (this._fitContent === "yes" || this._fitContent === "height")) {
            this._fitFlag = true;
            if (this._fitContent === "height") {
                this.set_height(measuredHeight);
            } else {
                this.set_width(measuredWidth);
                this.set_height(measuredHeight);
            }
            this._fitFlag = false;
        }

        const layoutWidth = this._hasExplicitWidth ? this.width : measuredWidth;
        const layoutHeight = this._hasExplicitHeight ? this.height : measuredHeight;
        const availableHeight = this._hasExplicitHeight
            ? Math.max(layoutHeight - padding[0] - padding[2] - effectInsets[0] - effectInsets[2], 0)
            : this._textSprite.contentHeight;

        const x = padding[3] + effectInsets[3];
        let y = padding[0] + effectInsets[0];
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
