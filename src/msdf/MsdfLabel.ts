import {
    MsdfBitmapFont,
    MsdfOverflow,
    MsdfRichTextRun,
    MsdfRichTextStyle,
    MsdfTextLineMetric,
    MsdfTextSprite,
} from "./MsdfText";

type Padding = [number, number, number, number];
type MsdfLabelFitContent = "no" | "yes" | "height";
type MsdfLabelRefreshKind = "text" | "layout";
type MsdfTemplateVars = Record<string, unknown>;
type MsdfFontResourceConfig = {
    textureUrl: string;
    jsonUrl: string;
    shaderUrl: string;
};
type MsdfLabelSize = {
    width: number;
    height: number;
};
type MsdfLabelContentBox = {
    x: number;
    y: number;
    width: number;
    height: number;
};
type MsdfLabelParsedText = {
    text: string;
    useHtml: boolean;
};
type MsdfLabelRichTextRunMetadata = {
    link?: string | null;
    clickable?: boolean;
};
type MsdfLabelTextSpriteLayout = {
    layoutWidth: number;
    layoutHeight: number;
    wrapWidth: number;
};
type MsdfFontJsonAsset = {
    pages?: unknown;
    data?: unknown;
};
type MsdfLabelViewportFrame = {
    width: number;
    height: number;
    drawOffsetX: number;
    drawOffsetY: number;
    clipRectX: number;
    clipRectY: number;
    clipRectWidth: number;
    clipRectHeight: number;
};
const NORMALIZE_CR = /\r\n?/g;
const ESCAPE_CHARS_PATTERN = /\\(\w)/g;
const ESCAPE_SEQUENCE: Record<string, string> = { "\\n": "\n", "\\t": "\t" };
const JSON_ASSET_PATTERN = /\.json(?:$|[?#])/i;
const URL_SCHEME_PATTERN = /^(?:[a-z]+:)?\/\//i;
const WINDOWS_ABSOLUTE_PATH_PATTERN = /^[a-zA-Z]:[\\/]/;
const DEFAULT_MSDF_SHADER_URL = "resources/shader/MsdfText.shader";

const { regClass } = Laya;

function parsePadding(value: string): Padding {
    const parts = value.split(",").map((item) => Number(item.trim()) || 0);

    if (parts.length === 1) {
        return [parts[0], parts[0], parts[0], parts[0]];
    }

    if (parts.length === 2) {
        return [parts[0], parts[1], parts[0], parts[1]];
    }

    if (parts.length === 3) {
        return [parts[0], parts[1], parts[2], parts[1]];
    }

    return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0, parts[3] ?? 0];
}

function colorToVector4(value: string): Laya.Vector4 {
    const rgba = Laya.ColorUtils.create(value || "#ffffff").arrColor;
    const r = rgba?.[0] ?? 1;
    const g = rgba?.[1] ?? 1;
    const b = rgba?.[2] ?? 1;
    const a = rgba?.[3] ?? 1;
    return new Laya.Vector4(r, g, b, a);
}

function normalizeColor(value: string | null | undefined, fallback: string): string {
    return value || fallback;
}

function normalizeFontJsonAssetData(raw: unknown): MsdfFontJsonAsset | null {
    let data = raw;

    if (data && typeof data === "object" && "data" in data) {
        data = (data as { data: unknown }).data;
    }

    if (typeof data === "string") {
        try {
            data = JSON.parse(data);
        } catch {
            return null;
        }
    }

    return data && typeof data === "object" ? (data as MsdfFontJsonAsset) : null;
}

function normalizeAssetUrl(value: string): string {
    return value.replace(/\\/g, "/");
}

function isAbsoluteAssetUrl(value: string): boolean {
    return (
        value.startsWith("res://") ||
        value.startsWith("/") ||
        WINDOWS_ABSOLUTE_PATH_PATTERN.test(value) ||
        URL_SCHEME_PATTERN.test(value)
    );
}

function resolveAssetUrl(baseUrl: string, relativeUrl: string): string {
    const normalizedRelativeUrl = normalizeAssetUrl(relativeUrl.trim());
    if (!normalizedRelativeUrl) {
        return "";
    }

    if (isAbsoluteAssetUrl(normalizedRelativeUrl)) {
        return normalizedRelativeUrl;
    }

    const baseSegments = normalizeAssetUrl(baseUrl).split("/");
    baseSegments.pop();

    for (const segment of normalizedRelativeUrl.split("/")) {
        if (!segment || segment === ".") {
            continue;
        }

        if (segment === "..") {
            if (baseSegments.length > 0) {
                baseSegments.pop();
            }
            continue;
        }

        baseSegments.push(segment);
    }

    return baseSegments.join("/");
}

function sameRichStyle(left: MsdfRichTextStyle, right: MsdfRichTextStyle): boolean {
    return (
        left.fontSize === right.fontSize &&
        left.textColorCss === right.textColorCss &&
        (left.underlineColorCss ?? "") === (right.underlineColorCss ?? "") &&
        (left.strikethroughColorCss ?? "") === (right.strikethroughColorCss ?? "") &&
        left.outlineColorCss === right.outlineColorCss &&
        left.outlineWidth === right.outlineWidth &&
        !!left.bold === !!right.bold &&
        !!left.italic === !!right.italic &&
        !!left.underline === !!right.underline &&
        !!left.strikethrough === !!right.strikethrough &&
        (left.align ?? "") === (right.align ?? "") &&
        (left.alignItems ?? "") === (right.alignItems ?? "")
    );
}

@Laya.regClass()
@Laya.classInfo({
    menu: "自定义",
})
export class MsdfLabel extends Laya.Label {
    private static readonly fontCache = new Map<string, Promise<MsdfBitmapFont>>();
    private static readonly registeredFonts = new Map<string, MsdfFontResourceConfig>();

    private _textSprite!: MsdfTextSprite;
    private _font: MsdfBitmapFont | null = null;
    private _resourceKey = "";
    private _hasExplicitWidth = false;
    private _hasExplicitHeight = false;

    private _text = "";
    private _fontSize = 56;
    private _letterSpacing = 0;
    private _faceDilate = 0;
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
    protected override _fitContent: MsdfLabelFitContent = "no";
    private _msdfFitFlag = false;
    private _ignoreLang = false;
    private _templateVars: MsdfTemplateVars | null = null;
    private _htmlParseOptions: Laya.HtmlParseOptions | null = null;
    private _parseEscapeChars = true;

    private _fontTextureUrl = "";
    private _fontJsonUrl = "";
    private _fontShaderUrl = "";
    private _paddingValues: Padding = [0, 0, 0, 0];
    private _maxOutlineWidth = 0;
    private _fontResolveToken = 0;

    constructor(text?: string) {
        super();

        if (text !== undefined) {
            this.text = text;
        }
    }

    protected override createChildren(): void {
        if (!this._textSprite) {
            this._textSprite = new MsdfTextSprite();
            this.configureInternalTextSprite(this._textSprite);
            this.addChild(this._textSprite);
        }
    }

    override onAfterDeserialize(): void {
        super.onAfterDeserialize();

        this.configureInternalTextSprite(this._textSprite);
        this.pruneLegacySerializedChildren();
    }

    private configureInternalTextSprite(textSprite: MsdfTextSprite): void {
        textSprite.mouseThrough = true;
        textSprite.visible = false;
        textSprite.hideFlags = Laya.HideFlags.HideAndDontSave;
        this._tf = textSprite as unknown as Laya.Text;
        this._tf.hideFlags = Laya.HideFlags.HideAndDontSave;
    }

    private pruneLegacySerializedChildren(): void {
        for (let index = this.numChildren - 1; index >= 0; index -= 1) {
            const child = this.getChildAt(index);
            if (!this.isLegacySerializedChild(child)) {
                continue;
            }

            this.removeChildAt(index);
            child.destroy();
        }
    }

    private isLegacySerializedChild(child: Laya.Node): child is Laya.Sprite {
        return (
            child !== this._textSprite &&
            child instanceof Laya.Sprite &&
            child.hideFlags === 0 &&
            child.mouseThrough === true &&
            child.numChildren === 0 &&
            !child.name
        );
    }

    static preload(
        textureUrl: string,
        jsonUrl: string,
        shaderUrl: string
    ): Promise<MsdfBitmapFont> {
        const key = MsdfLabel.getFontResourceKey(textureUrl, jsonUrl, shaderUrl);
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

    static registerFont(
        name: string,
        textureUrl: string,
        jsonUrl: string,
        shaderUrl: string
    ): void {
        if (!name || !textureUrl || !jsonUrl || !shaderUrl) {
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

    private static getFontResourceKey(
        textureUrl: string,
        jsonUrl: string,
        shaderUrl: string
    ): string {
        return `${shaderUrl}|${textureUrl}|${jsonUrl}`;
    }

    private scheduleRefresh(kind: MsdfLabelRefreshKind = "text"): void {
        this.callLater(kind === "text" ? this.changeText : this.updateLayoutFrame);
    }

    override get text(): string {
        return this._text;
    }

    override set text(value: string) {
        let nextValue =
            value === null || value === undefined
                ? ""
                : typeof value === "string"
                  ? value
                  : `${value}`;
        const langPacks = (Laya.Text as typeof Laya.Text & { langPacks?: Record<string, string> })
            ?.langPacks;
        if (!this._ignoreLang && langPacks) {
            nextValue = langPacks[nextValue] || nextValue;
        }

        if (this._text === nextValue) {
            return;
        }
        this._text = nextValue;
        this.scheduleRefresh();
        this.event(Laya.Event.CHANGE);
    }

    override get fontSize(): number {
        return this._fontSize;
    }

    override set fontSize(value: number) {
        if (this._fontSize === value) {
            return;
        }
        this._fontSize = value;
        this.scheduleRefresh();
    }

    get letterSpacing(): number {
        return this._letterSpacing;
    }

    set letterSpacing(value: number) {
        if (this._letterSpacing === value) {
            return;
        }
        this._letterSpacing = value;
        this.scheduleRefresh();
    }

    get faceDilate(): number {
        return this._faceDilate;
    }

    set faceDilate(value: number) {
        const next = Number.isFinite(value) ? value : 0;
        if (this._faceDilate === next) {
            return;
        }

        this._faceDilate = next;
        this.scheduleRefresh();
    }

    override get color(): string {
        return this._color;
    }

    override set color(value: string) {
        if (this._color === value) {
            return;
        }
        this._color = value || "#ffffff";
        this.scheduleRefresh();
    }

    override get align(): string {
        return this._align;
    }

    override set align(value: string) {
        if (this._align === value) {
            return;
        }
        this._align = value || "left";
        this.scheduleRefresh();
    }

    override get valign(): string {
        return this._valign;
    }

    override set valign(value: string) {
        if (this._valign === value) {
            return;
        }
        this._valign = value || "top";
        this.scheduleRefresh("layout");
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
        this.scheduleRefresh();
    }

    override get leading(): number {
        return this._leading;
    }

    override set leading(value: number) {
        if (this._leading === value) {
            return;
        }
        this._leading = value;
        this.scheduleRefresh();
    }

    override get padding(): string {
        return this._padding;
    }

    override set padding(value: string) {
        if (this._padding === value) {
            return;
        }
        this._padding = value || "0,0,0,0";
        this._paddingValues = parsePadding(this._padding);
        this.scheduleRefresh();
    }

    @Laya.property({
        type: Number,
        step: 0.1,
        min: 0,
        fractionDigits: 1,
    })
    override get stroke(): number {
        return this._stroke;
    }

    override set stroke(value: number) {
        if (this._stroke === value) {
            return;
        }
        this._stroke = value;
        this.scheduleRefresh();
    }

    override get strokeColor(): string {
        return this._strokeColor;
    }

    override set strokeColor(value: string) {
        if (this._strokeColor === value) {
            return;
        }
        this._strokeColor = value || "#000000";
        this.scheduleRefresh();
    }

    @Laya.property({
        type: Number,
        step: 0.1,
        min: 0,
        fractionDigits: 1,
    })
    get glow(): number {
        return this._glow;
    }

    set glow(value: number) {
        const next = Math.max(0, value || 0);
        if (this._glow === next) {
            return;
        }
        this._glow = next;
        this.scheduleRefresh();
    }

    @Laya.property({
        type: String,
        inspector: "color",
    })
    get glowColor(): string {
        return this._glowColor;
    }

    set glowColor(value: string) {
        if (this._glowColor === value) {
            return;
        }
        this._glowColor = value || "#ffffff";
        this.scheduleRefresh();
    }

    @Laya.property({
        type: Number,
        step: 0.1,
        min: 0,
        fractionDigits: 1,
    })
    get shadowBlur(): number {
        return this._shadowBlur;
    }

    set shadowBlur(value: number) {
        const next = Math.max(0, value || 0);
        if (this._shadowBlur === next) {
            return;
        }
        this._shadowBlur = next;
        this.scheduleRefresh();
    }

    @Laya.property({
        type: Number,
        step: 0.1,
        fractionDigits: 1,
    })
    get shadowOffsetX(): number {
        return this._shadowOffsetX;
    }

    set shadowOffsetX(value: number) {
        if (this._shadowOffsetX === value) {
            return;
        }
        this._shadowOffsetX = value || 0;
        this.scheduleRefresh();
    }

    @Laya.property({
        type: Number,
        step: 0.1,
        fractionDigits: 1,
    })
    get shadowOffsetY(): number {
        return this._shadowOffsetY;
    }

    set shadowOffsetY(value: number) {
        if (this._shadowOffsetY === value) {
            return;
        }
        this._shadowOffsetY = value || 0;
        this.scheduleRefresh();
    }

    @Laya.property({
        type: String,
        inspector: "color",
    })
    get shadowColor(): string {
        return this._shadowColor;
    }

    set shadowColor(value: string) {
        if (this._shadowColor === value) {
            return;
        }
        this._shadowColor = value || "#000000";
        this.scheduleRefresh();
    }

    override get bgColor(): string {
        return this._bgColor;
    }

    override set bgColor(value: string) {
        if (this._bgColor === value) {
            return;
        }
        this._bgColor = value || "";
        this.scheduleRefresh("layout");
    }

    override get borderColor(): string {
        return this._borderColor;
    }

    override set borderColor(value: string) {
        if (this._borderColor === value) {
            return;
        }
        this._borderColor = value || "";
        this.scheduleRefresh("layout");
    }

    override get wordWrap(): boolean {
        return this._wordWrap;
    }

    override set wordWrap(value: boolean) {
        if (this._wordWrap === value) {
            return;
        }
        this._wordWrap = value;
        this.scheduleRefresh();
    }

    override get bold(): boolean {
        return this._bold;
    }

    override set bold(value: boolean) {
        const next = !!value;
        if (this._bold === next) {
            return;
        }
        this._bold = next;
        this.scheduleRefresh();
    }

    override get italic(): boolean {
        return this._italic;
    }

    override set italic(value: boolean) {
        const next = !!value;
        if (this._italic === next) {
            return;
        }
        this._italic = next;
        this.scheduleRefresh();
    }

    override get underline(): boolean {
        return this._underline;
    }

    override set underline(value: boolean) {
        const next = !!value;
        if (this._underline === next) {
            return;
        }
        this._underline = next;
        this.scheduleRefresh();
    }

    override get underlineColor(): string {
        return this._underlineColor;
    }

    override set underlineColor(value: string) {
        if (this._underlineColor === value) {
            return;
        }
        this._underlineColor = value || "";
        this.scheduleRefresh();
    }

    override get strikethrough(): boolean {
        return this._strikethrough;
    }

    override set strikethrough(value: boolean) {
        const next = !!value;
        if (this._strikethrough === next) {
            return;
        }
        this._strikethrough = next;
        this.scheduleRefresh();
    }

    override get strikethroughColor(): string {
        return this._strikethroughColor;
    }

    override set strikethroughColor(value: string) {
        if (this._strikethroughColor === value) {
            return;
        }
        this._strikethroughColor = value || "";
        this.scheduleRefresh();
    }

    override get html(): boolean {
        return this._html;
    }

    override set html(value: boolean) {
        const next = !!value;
        if (this._html === next) {
            return;
        }
        this._html = next;
        this.scheduleRefresh();
    }

    override get ubb(): boolean {
        return this._ubb;
    }

    override set ubb(value: boolean) {
        const next = !!value;
        if (this._ubb === next) {
            return;
        }
        this._ubb = next;
        this.scheduleRefresh();
    }

    @Laya.property({
        name: "font",
        type: "string",
        caption: "Font",
        inspector: "asset",
        isAsset: true,
        assetTypeFilter: "Json",
        useAssetPath: true,
        tips: "选择 MSDF 字体 json。脚本里仍然支持注册名和 texture|json|shader。",
    })
    override get font(): string {
        return this._fontName;
    }

    override set font(value: string) {
        this.cancelPendingFontResolution();

        if (this._fontName === value) {
            return;
        }

        this._fontName = value || "";
        if (!this._fontName) {
            this.setFontResourceUrls("", "", "");
            return;
        }

        const resources = this.resolveFontResources(this._fontName);
        if (!resources) {
            if (this.isFontJsonReference(this._fontName)) {
                this.resolveFontJsonReference(this._fontName, this._fontResolveToken);
                return;
            }

            console.warn(
                `[MsdfLabel] unresolved font "${this._fontName}". Use MsdfLabel.registerFont(name, textureUrl, jsonUrl, shaderUrl), pass "texture|json|shader", or assign an MSDF json path.`
            );
            return;
        }

        this.applyFontResources(resources);
    }

    override get maxWidth(): number {
        return this._maxWidth;
    }

    override set maxWidth(value: number) {
        const next = Math.max(0, value || 0);
        if (this._maxWidth === next) {
            return;
        }

        this._maxWidth = next;
        this.scheduleRefresh();
    }

    override get overflow(): MsdfOverflow {
        return this._overflow;
    }

    override set overflow(value: MsdfOverflow) {
        const next = value || "visible";
        if (this._overflow === next) {
            return;
        }

        this._overflow = next;
        this.scheduleRefresh();
    }

    override get fitContent(): MsdfLabelFitContent {
        return this._fitContent;
    }

    override set fitContent(value: MsdfLabelFitContent | boolean) {
        const next = typeof value === "boolean" ? (value ? "yes" : "no") : value || "no";
        if (this._fitContent === next) {
            return;
        }

        this._fitContent = next;
        this.scheduleRefresh();
    }

    override get textField(): Laya.Text {
        return this._tf;
    }

    get msdfTextField(): MsdfTextSprite {
        return this._textSprite;
    }

    override get ignoreLang(): boolean {
        return this._ignoreLang;
    }

    override set ignoreLang(value: boolean) {
        const next = !!value;
        if (this._ignoreLang === next) {
            return;
        }

        this._ignoreLang = next;
        this.text = this._text;
    }

    override get templateVars(): MsdfTemplateVars {
        return this._templateVars ?? {};
    }

    override set templateVars(value: MsdfTemplateVars | boolean) {
        const nextValue = value as MsdfTemplateVars | boolean | null | undefined;

        if (!this._templateVars && !nextValue) {
            return;
        }

        if (nextValue === true) {
            this._templateVars = {};
        } else if (nextValue === false || nextValue === null || nextValue === undefined) {
            this._templateVars = null;
        } else {
            this._templateVars = nextValue;
        }

        this.scheduleRefresh();
    }

    get htmlParseOptions(): Laya.HtmlParseOptions | null {
        return this._htmlParseOptions;
    }

    set htmlParseOptions(value: Laya.HtmlParseOptions | null) {
        this._htmlParseOptions = value;
    }

    get lines(): ReadonlyArray<MsdfTextLineMetric> {
        return this._textSprite.lines;
    }

    get scrollX(): number {
        return this._textSprite.scrollX;
    }

    set scrollX(value: number) {
        this.updateScrollOffset("x", value);
    }

    get scrollY(): number {
        return this._textSprite.scrollY;
    }

    set scrollY(value: number) {
        this.updateScrollOffset("y", value);
    }

    get maxScrollX(): number {
        return this._textSprite.maxScrollX;
    }

    get maxScrollY(): number {
        return this._textSprite.maxScrollY;
    }

    get textWidth(): number {
        const effectInsets = this.getEffectInsets();
        return this._textSprite.contentWidth + effectInsets[1] + effectInsets[3];
    }

    get textHeight(): number {
        const effectInsets = this.getEffectInsets();
        return this._textSprite.contentHeight + effectInsets[0] + effectInsets[2];
    }

    get fontTextureUrl(): string {
        return this._fontTextureUrl;
    }

    set fontTextureUrl(value: string) {
        this.cancelPendingFontResolution();
        this.setFontResourceUrls(value || "", this._fontJsonUrl, this._fontShaderUrl);
    }

    get fontJsonUrl(): string {
        return this._fontJsonUrl;
    }

    set fontJsonUrl(value: string) {
        const nextValue = value || "";

        this.cancelPendingFontResolution();
        if (!nextValue) {
            this.setFontResourceUrls(this._fontTextureUrl, "", this._fontShaderUrl);
            return;
        }

        if (this._fontTextureUrl) {
            this.setFontResourceUrls(
                this._fontTextureUrl,
                nextValue,
                this.resolveMsdfShaderUrl(this._fontShaderUrl)
            );
            return;
        }

        this.resolveFontJsonReference(nextValue, this._fontResolveToken, false);
    }

    get fontShaderUrl(): string {
        return this._fontShaderUrl;
    }

    set fontShaderUrl(value: string) {
        this.cancelPendingFontResolution();
        this.setFontResourceUrls(this._fontTextureUrl, this._fontJsonUrl, value || "");
    }

    protected override measureWidth(): number {
        const effectInsets = this.getEffectInsets();
        return (
            this._textSprite.contentWidth +
            this._paddingValues[1] +
            this._paddingValues[3] +
            effectInsets[1] +
            effectInsets[3]
        );
    }

    protected override measureHeight(): number {
        const effectInsets = this.getEffectInsets();
        return (
            this._textSprite.contentHeight +
            this._paddingValues[0] +
            this._paddingValues[2] +
            effectInsets[0] +
            effectInsets[2]
        );
    }

    protected override commitMeasure(): void {
        this.runCallLater(this.changeText);
        super.commitMeasure();
    }

    override get_width(): number {
        if (this._hasExplicitWidth || this._text) {
            return super.get_width();
        }

        return 0;
    }

    override get_height(): number {
        if (this._hasExplicitHeight || this._text) {
            return super.get_height();
        }

        return 0;
    }

    protected override _sizeChanged(): void {
        super._sizeChanged();
        this.scheduleRefresh();
    }

    override set_width(value: number): void {
        if (this._fitContent === "yes" && !this._msdfFitFlag) {
            return;
        }

        this._hasExplicitWidth = Number.isFinite(value) && value >= 0;
        super.set_width(value);
    }

    override set_height(value: number): void {
        if ((this._fitContent === "yes" || this._fitContent === "height") && !this._msdfFitFlag) {
            return;
        }

        this._hasExplicitHeight = Number.isFinite(value) && value >= 0;
        super.set_height(value);
    }

    override set_dataSource(value: unknown): void {
        this._dataSource = value;
        if (typeof value === "number" || typeof value === "string") {
            this.text = `${value}`;
            return;
        }

        super.set_dataSource(value);
    }

    private resolveFontResources(value: string): MsdfFontResourceConfig | null {
        if (!value) {
            return null;
        }

        const registered = MsdfLabel.registeredFonts.get(value);
        if (registered) {
            return registered;
        }

        const parts = value
            .split("|")
            .map((item) => item.trim())
            .filter(Boolean);
        if (parts.length === 3) {
            return {
                textureUrl: parts[0],
                jsonUrl: parts[1],
                shaderUrl: parts[2],
            };
        }

        return null;
    }

    private isFontJsonReference(value: string): boolean {
        return JSON_ASSET_PATTERN.test(value);
    }

    private cancelPendingFontResolution(): void {
        this._fontResolveToken += 1;
    }

    private resolveMsdfShaderUrl(shaderUrl: string | null | undefined): string {
        return shaderUrl || DEFAULT_MSDF_SHADER_URL;
    }

    private resolveFontJsonReference(
        jsonUrl: string,
        requestToken: number,
        syncFontName: boolean = true
    ): void {
        const resolvedJsonUrl = normalizeAssetUrl(jsonUrl);
        const resolvedShaderUrl = this.resolveMsdfShaderUrl(this._fontShaderUrl);

        void Laya.loader
            .load({ url: resolvedJsonUrl, type: Laya.Loader.JSON })
            .then((rawData) => {
                if (this.destroyed || requestToken !== this._fontResolveToken) {
                    return;
                }

                const resources = this.resolveFontResourcesFromJsonAsset(
                    resolvedJsonUrl,
                    rawData,
                    resolvedShaderUrl
                );
                if (!resources) {
                    console.warn(
                        `[MsdfLabel] invalid MSDF font json "${resolvedJsonUrl}". Expected pages[0] to point to the atlas image.`
                    );
                    return;
                }

                if (syncFontName) {
                    this._fontName = resolvedJsonUrl;
                }
                this.applyFontResources(resources);
            })
            .catch((error) => {
                if (this.destroyed || requestToken !== this._fontResolveToken) {
                    return;
                }

                console.error(
                    `[MsdfLabel] failed to resolve font json "${resolvedJsonUrl}"`,
                    error
                );
            });
    }

    private resolveFontResourcesFromJsonAsset(
        jsonUrl: string,
        rawData: unknown,
        shaderUrl: string
    ): MsdfFontResourceConfig | null {
        const fontData = normalizeFontJsonAssetData(rawData);
        const pages = Array.isArray(fontData?.pages) ? fontData.pages : null;
        const page = typeof pages?.[0] === "string" ? pages[0] : "";
        if (!page) {
            return null;
        }

        return {
            textureUrl: resolveAssetUrl(jsonUrl, page),
            jsonUrl,
            shaderUrl,
        };
    }

    override setVar(name: string, value: unknown): this {
        if (!this._templateVars) {
            this._templateVars = {};
        }
        this._templateVars[name] = value;
        this.scheduleRefresh();
        return this;
    }

    private appendTemplateValue(result: string, value: unknown): string {
        return result + (value as string | number | boolean | bigint | object | null | undefined);
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
                result =
                    value === null || value === undefined
                        ? result + tag.substring(pos3 + 1)
                        : this.appendTemplateValue(result, value);
            } else {
                const value = this._templateVars[tag];
                if (value !== null && value !== undefined) {
                    result = this.appendTemplateValue(result, value);
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
        this.setFontResourceUrls(resources.textureUrl, resources.jsonUrl, resources.shaderUrl);
    }

    private setFontResourceUrls(textureUrl: string, jsonUrl: string, shaderUrl: string): void {
        if (
            this._fontTextureUrl === textureUrl &&
            this._fontJsonUrl === jsonUrl &&
            this._fontShaderUrl === shaderUrl
        ) {
            return;
        }

        this._fontTextureUrl = textureUrl;
        this._fontJsonUrl = jsonUrl;
        this._fontShaderUrl = shaderUrl;
        this.reloadFont();
    }

    private hasCompleteFontResources(): boolean {
        return !!this._fontTextureUrl && !!this._fontJsonUrl && !!this._fontShaderUrl;
    }

    private clearTextSprite(): void {
        this._textSprite.visible = false;
        this._textSprite.graphics.clear(true);
        this._textSprite.size(0, 0);
    }

    private clearFontState(): void {
        this._resourceKey = "";
        this._font = null;
    }

    private applyLoadedFont(font: MsdfBitmapFont): void {
        this._font = font;
        this._textSprite.resetFont(font);
        this._textSprite.visible = true;
        this.changeText();
        this.event(Laya.Event.LOADED);
    }

    private updateScrollOffset(axis: "x" | "y", value: number): void {
        if (axis === "x") {
            this._textSprite.scrollX = value || 0;
        } else {
            this._textSprite.scrollY = value || 0;
        }

        this.updateLayoutFrame();
    }

    private reloadFont(): void {
        if (!this.hasCompleteFontResources()) {
            this.clearFontState();
            this.clearTextSprite();
            this.drawBackground(this.width, this.height);
            return;
        }

        const nextKey = MsdfLabel.getFontResourceKey(
            this._fontTextureUrl,
            this._fontJsonUrl,
            this._fontShaderUrl
        );
        this._resourceKey = nextKey;
        this._font = null;

        MsdfLabel.preload(this._fontTextureUrl, this._fontJsonUrl, this._fontShaderUrl)
            .then((font) => {
                if (this.destroyed || this._resourceKey !== nextKey) {
                    return;
                }

                this.applyLoadedFont(font);
            })
            .catch((error) => {
                console.error("[MsdfLabel] failed to load font resources", error);
            });
    }

    private getMeasuredLabelSize(effectInsets: Padding): MsdfLabelSize {
        return {
            width:
                this._textSprite.contentWidth +
                this._paddingValues[1] +
                this._paddingValues[3] +
                effectInsets[1] +
                effectInsets[3],
            height:
                this._textSprite.contentHeight +
                this._paddingValues[0] +
                this._paddingValues[2] +
                effectInsets[0] +
                effectInsets[2],
        };
    }

    private getLayoutSize(measuredSize: MsdfLabelSize): MsdfLabelSize {
        return {
            width: this._hasExplicitWidth ? this.width : measuredSize.width,
            height: this._hasExplicitHeight ? this.height : measuredSize.height,
        };
    }

    private getContentBox(layoutSize: MsdfLabelSize, effectInsets: Padding): MsdfLabelContentBox {
        return {
            x: this._paddingValues[3] + effectInsets[3],
            y: this._paddingValues[0] + effectInsets[0],
            width: Math.max(
                layoutSize.width -
                    this._paddingValues[1] -
                    this._paddingValues[3] -
                    effectInsets[1] -
                    effectInsets[3],
                0
            ),
            height: Math.max(
                layoutSize.height -
                    this._paddingValues[0] -
                    this._paddingValues[2] -
                    effectInsets[0] -
                    effectInsets[2],
                0
            ),
        };
    }

    private createBaseTextStyle(): Laya.TextStyle {
        const style = new Laya.TextStyle();

        style.fontSize = this._fontSize;
        style.color = this._color;
        style.bold = this._bold;
        style.italic = this._italic;
        style.underline = this._underline;
        style.underlineColor = this._underlineColor || "";
        style.strikethrough = this._strikethrough;
        style.strikethroughColor = this._strikethroughColor || "";
        style.align = this._align;
        style.alignItems = this._alignItems;
        style.valign = this._valign;
        style.leading = this._leading;
        style.stroke = this._stroke;
        style.strokeColor = this._strokeColor;

        return style;
    }

    private toRichTextStyle(style: Laya.TextStyle | null | undefined): MsdfRichTextStyle {
        const textColorCss = normalizeColor(style?.color, this._color);
        const underlineColorCss = style?.underlineColor || null;
        const strikethroughColorCss = style?.strikethroughColor || null;
        const outlineColorCss = normalizeColor(style?.strokeColor, this._strokeColor);
        const strokeValue = style?.stroke;
        const outlineWidth =
            typeof strokeValue === "number"
                ? strokeValue
                : Number(strokeValue ?? this._stroke) || 0;

        return {
            fontSize: Number(style?.fontSize ?? this._fontSize) || this._fontSize,
            textColor: colorToVector4(textColorCss),
            textColorCss,
            underlineColor: underlineColorCss ? colorToVector4(underlineColorCss) : null,
            underlineColorCss,
            strikethroughColor: strikethroughColorCss
                ? colorToVector4(strikethroughColorCss)
                : null,
            strikethroughColorCss,
            outlineColor: colorToVector4(outlineColorCss),
            outlineColorCss,
            outlineWidth,
            bold: !!style?.bold,
            italic: !!style?.italic,
            underline: !!style?.underline,
            strikethrough: !!style?.strikethrough,
            align: style?.align || this._align,
            alignItems: style?.alignItems || this._alignItems,
        };
    }

    private appendRichTextRun(
        runs: MsdfRichTextRun[],
        text: string,
        style: MsdfRichTextStyle,
        link: string | null = null,
        clickable: boolean = false
    ): void {
        if (!text) {
            return;
        }

        const previous = runs[runs.length - 1] as
            | (MsdfRichTextRun & MsdfLabelRichTextRunMetadata)
            | undefined;
        if (
            previous &&
            sameRichStyle(previous.style, style) &&
            (previous.link ?? null) === link &&
            !!previous.clickable === clickable
        ) {
            previous.text += text;
            return;
        }

        const run: MsdfRichTextRun & MsdfLabelRichTextRunMetadata = {
            text,
            style,
            link,
            clickable,
        };
        runs.push(run);
    }

    private normalizeSourceText(): string {
        let sourceText = this._text.replace(NORMALIZE_CR, "\n");
        if (this._parseEscapeChars) {
            sourceText = sourceText.replace(ESCAPE_CHARS_PATTERN, MsdfLabel.replaceEscapeChar);
        }
        if (this._templateVars) {
            sourceText = this.parseTemplate(sourceText);
        }
        return sourceText;
    }

    private resolveParsedText(sourceText: string): MsdfLabelParsedText {
        let parsedText = sourceText;
        let useHtml = this._html;

        if (this._ubb) {
            const ubbParser = Laya.UBBParser?.defaultParser;
            if (ubbParser) {
                parsedText = ubbParser.parse(parsedText);
                useHtml = true;
            }
        }

        return { text: parsedText, useHtml };
    }

    private appendHtmlRuns(
        runs: MsdfRichTextRun[],
        text: string,
        baseStyle: Laya.TextStyle
    ): boolean {
        const htmlParser = Laya.HtmlParser?.defaultParser;
        const htmlElementType = Laya.HtmlElementType;
        const htmlElement = Laya.HtmlElement;

        if (!htmlParser || !htmlElementType) {
            return false;
        }

        const elements: Laya.HtmlElement[] = [];
        htmlParser.parse(text, baseStyle, elements, this._htmlParseOptions ?? undefined);
        let currentLink: string | null = null;

        for (const element of elements) {
            if (element.type === htmlElementType.Link) {
                currentLink = element.getAttrString("href", "");
                continue;
            }

            if (element.type === htmlElementType.LinkEnd) {
                currentLink = null;
                continue;
            }

            if (element.type !== htmlElementType.Text || !element.text) {
                continue;
            }

            const richStyle = this.toRichTextStyle(element.style);
            this.appendRichTextRun(
                runs,
                element.text,
                richStyle,
                currentLink,
                currentLink !== null || !!richStyle.underline
            );
        }

        if (htmlElement?.returnToPool) {
            htmlElement.returnToPool(elements);
        }

        return true;
    }

    private buildTextRuns(): MsdfRichTextRun[] {
        // MsdfLabel 负责把原始文本解析成带样式的 runs，
        // MsdfTextSprite 只接收已经解析完成的 runs 和布局约束。
        const sourceText = this.normalizeSourceText();
        const baseStyle = this.createBaseTextStyle();
        const runs: MsdfRichTextRun[] = [];
        const parsed = this.resolveParsedText(sourceText);

        if (!parsed.useHtml) {
            this.appendRichTextRun(runs, parsed.text, this.toRichTextStyle(baseStyle));
            return runs;
        }

        if (!this.appendHtmlRuns(runs, parsed.text, baseStyle)) {
            this.appendRichTextRun(runs, parsed.text, this.toRichTextStyle(baseStyle));
            return runs;
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
            Math.max(primaryInset, Math.max(0, Math.ceil(shadowBaseInset - this._shadowOffsetX))),
        ];
    }

    private resolveTextSpriteLayout(effectInsets: Padding): MsdfLabelTextSpriteLayout {
        const explicitContentBox = this.getContentBox(
            { width: this.width, height: this.height },
            effectInsets
        );
        const availableWidth = this._hasExplicitWidth ? explicitContentBox.width : Number.MAX_VALUE;
        const availableHeight = this._hasExplicitHeight ? explicitContentBox.height : 0;
        const maxWidth =
            this._maxWidth > 0
                ? Math.max(
                      this._maxWidth -
                          this._paddingValues[1] -
                          this._paddingValues[3] -
                          effectInsets[1] -
                          effectInsets[3],
                      0
                  )
                : Number.MAX_VALUE;
        const widthLimit = Math.min(availableWidth, maxWidth);
        const hasWidthLimit = Number.isFinite(widthLimit) && widthLimit < Number.MAX_VALUE;
        const wrapWidth =
            (this._wordWrap || this._maxWidth > 0 || this._overflow === "ellipsis") && hasWidthLimit
                ? widthLimit
                : 0;

        return {
            layoutWidth: this._hasExplicitWidth ? Math.max(availableWidth, 0) : -1,
            layoutHeight: this._hasExplicitHeight ? availableHeight : -1,
            wrapWidth,
        };
    }

    private applyTextSpriteLayout(
        runs: MsdfRichTextRun[],
        layout: MsdfLabelTextSpriteLayout
    ): void {
        this._textSprite.layoutWidth = layout.layoutWidth;
        this._textSprite.layoutHeight = layout.layoutHeight;
        this._textSprite.wordWrapWidth = layout.wrapWidth;
        this._textSprite.letterSpacing = this._letterSpacing;
        this._textSprite.faceDilate = this._faceDilate;
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
    }

    private resolveValignOffset(contentBoxHeight: number): number {
        if (this._valign === "middle") {
            return Math.max((contentBoxHeight - this._textSprite.contentHeight) * 0.5, 0);
        }

        if (this._valign === "bottom") {
            return Math.max(contentBoxHeight - this._textSprite.contentHeight, 0);
        }

        return 0;
    }

    private applyFitContentSize(measuredSize: MsdfLabelSize): void {
        if (this._msdfFitFlag || (this._fitContent !== "yes" && this._fitContent !== "height")) {
            return;
        }

        this._msdfFitFlag = true;
        if (this._fitContent === "height") {
            this.set_height(measuredSize.height);
        } else {
            this.set_width(measuredSize.width);
            this.set_height(measuredSize.height);
        }
        this._msdfFitFlag = false;
    }

    private getViewportContentBox(
        layoutSize: MsdfLabelSize,
        effectInsets: Padding
    ): MsdfLabelContentBox {
        const contentBox = this.getContentBox(layoutSize, effectInsets);
        if (this._hasExplicitHeight) {
            return contentBox;
        }

        return {
            ...contentBox,
            height: this._textSprite.contentHeight,
        };
    }

    private resolveViewportFrame(
        layoutSize: MsdfLabelSize,
        contentBox: MsdfLabelContentBox
    ): MsdfLabelViewportFrame {
        return {
            width: layoutSize.width,
            height: layoutSize.height,
            drawOffsetX: contentBox.x,
            drawOffsetY: contentBox.y + this.resolveValignOffset(contentBox.height),
            clipRectX: 0,
            clipRectY: 0,
            clipRectWidth: layoutSize.width,
            clipRectHeight: layoutSize.height,
        };
    }

    private applyViewportFrame(frame: MsdfLabelViewportFrame): void {
        this._textSprite.pos(0, 0);
        this._textSprite.setViewportFrame(
            frame.width,
            frame.height,
            frame.drawOffsetX,
            frame.drawOffsetY,
            frame.clipRectX,
            frame.clipRectY,
            frame.clipRectWidth,
            frame.clipRectHeight
        );
    }

    changeText(text?: string): void {
        if (typeof text === "string") {
            this.text = text;
            return;
        }

        if (!this._font) {
            return;
        }

        const runs = this.buildTextRuns();
        this._maxOutlineWidth = this.getMaxOutlineWidth(runs);
        const effectInsets = this.getEffectInsets(this._maxOutlineWidth);
        const textSpriteLayout = this.resolveTextSpriteLayout(effectInsets);

        // 真正参与排版的是扣掉 padding 和效果外扩后的内容区。
        // glow/shadow/outline 虽然是视觉效果，但它们会占用标签的可用排版空间。
        this.applyTextSpriteLayout(runs, textSpriteLayout);
        this._textSprite.refresh();
        this.updateLayoutFrame();
    }

    private updateLayoutFrame(): void {
        const effectInsets = this.getEffectInsets();
        const measuredSize = this.getMeasuredLabelSize(effectInsets);
        this.applyFitContentSize(measuredSize);
        const layoutSize = this.getLayoutSize(measuredSize);
        const contentBox = this.getViewportContentBox(layoutSize, effectInsets);
        const viewportFrame = this.resolveViewportFrame(layoutSize, contentBox);

        this.applyViewportFrame(viewportFrame);
        this.drawBackground(layoutSize.width, layoutSize.height);
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

        this.graphics.drawRect(
            0,
            0,
            width,
            height,
            this._bgColor || null,
            this._borderColor || null,
            this._borderColor ? 1 : 0
        );
    }
}
