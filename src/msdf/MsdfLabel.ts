import { MsdfBitmapFont, MsdfOverflow, MsdfText, MsdfTextLineMetric } from "./MsdfText";

type MsdfLabelFitContent = "no" | "yes" | "height";
type MsdfTemplateVars = Record<string, unknown>;
type MsdfFontResourceConfig = {
    textureUrl: string;
    jsonUrl: string;
    shaderUrl: string;
};
type MsdfFontJsonAsset = {
    pages?: unknown;
    data?: unknown;
};
type LayaLabelFitFlagHost = {
    _fitFlag?: boolean;
};

const JSON_ASSET_PATTERN = /\.json(?:$|[?#])/i;
const URL_SCHEME_PATTERN = /^(?:[a-z]+:)?\/\//i;
const WINDOWS_ABSOLUTE_PATH_PATTERN = /^[a-zA-Z]:[\\/]/;
const DEFAULT_MSDF_SHADER_URL = "resources/shader/MsdfText.shader";
const RES_URL_PREFIX = "res://";
const DEFAULT_FONT_SIZE = 56;

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
        value.startsWith(RES_URL_PREFIX) ||
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

function isNil(value: unknown): value is null | undefined {
    return value === null || value === undefined;
}

function colorToVector4(value: string, fallback: string = "#ffffff"): Laya.Vector4 {
    const rgba = Laya.ColorUtils.create(value || fallback).arrColor;
    return new Laya.Vector4(rgba?.[0] ?? 1, rgba?.[1] ?? 1, rgba?.[2] ?? 1, rgba?.[3] ?? 1);
}

@Laya.regClass()
@Laya.classInfo({
    menu: "自定义",
})
export class MsdfLabel extends Laya.Label {
    private static readonly fontCache = new Map<string, Promise<MsdfBitmapFont>>();
    private static readonly loadedFontCache = new Map<string, MsdfBitmapFont>();
    private static readonly registeredFonts = new Map<string, MsdfFontResourceConfig>();

    private _textSprite!: MsdfText;
    private _font: MsdfBitmapFont | null = null;
    private _resourceKey = "";
    private _fontResolveToken = 0;
    private _fontName = "";
    private _fontTextureUrl = "";
    private _fontJsonUrl = "";
    private _fontShaderUrl = "";
    private _hasExplicitWidth = false;
    private _hasExplicitHeight = false;
    private _msdfFitFlag = false;
    private _glowColor = "#ffffff";
    private _shadowColor = "#000000";

    protected override _fitContent: MsdfLabelFitContent = "no";

    constructor(text?: string) {
        super();

        if (!isNil(text)) {
            this.text = text;
        }
    }

    protected override createChildren(): void {
        if (this._textSprite) {
            return;
        }

        this._textSprite = new MsdfText();
        this._textSprite.fontSize = DEFAULT_FONT_SIZE;
        this.configureInternalTextSprite(this._textSprite);
        this.addChild(this._textSprite);
    }

    override onAfterDeserialize(): void {
        super.onAfterDeserialize();

        this.configureInternalTextSprite(this._textSprite);
        this.pruneLegacySerializedChildren();
        this.syncTextHostLayout();
    }

    private configureInternalTextSprite(textSprite: MsdfText): void {
        textSprite.mouseThrough = true;
        textSprite.visible = true;
        textSprite.hideFlags = Laya.HideFlags.HideAndDontSave;
        textSprite._onPostLayout = () => this.handleTextPostLayout();
        textSprite.off(Laya.Event.CHANGE, this, this.handleTextFieldChange);
        textSprite.on(Laya.Event.CHANGE, this, this.handleTextFieldChange);
        this._tf = textSprite;
        this._tf.hideFlags = Laya.HideFlags.HideAndDontSave;
    }

    private handleTextFieldChange(): void {
        this.event(Laya.Event.CHANGE);
        if (!this._isWidthSet || !this._isHeightSet) {
            this.onCompResize();
        }
        this.syncTextHostLayout();
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
        const loadedFont = MsdfLabel.loadedFontCache.get(key);
        if (loadedFont) {
            return Promise.resolve(loadedFont);
        }

        let task = MsdfLabel.fontCache.get(key);
        if (!task) {
            task = (async () => {
                await Laya.loader.load(shaderUrl);
                const font = await MsdfBitmapFont.load(textureUrl, jsonUrl);
                MsdfLabel.loadedFontCache.set(key, font);
                return font;
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

    private static getFontResourceKey(
        textureUrl: string,
        jsonUrl: string,
        shaderUrl: string
    ): string {
        return `${shaderUrl}|${textureUrl}|${jsonUrl}`;
    }

    override get text(): string {
        return this._textSprite.text;
    }

    override set text(value: string) {
        this._textSprite.text = value;
    }

    override get fontSize(): number {
        return this._textSprite.fontSize;
    }

    override set fontSize(value: number) {
        this._textSprite.fontSize = value;
    }

    get letterSpacing(): number {
        return this._textSprite.letterSpacing;
    }

    set letterSpacing(value: number) {
        this._textSprite.letterSpacing = value;
    }

    get faceDilate(): number {
        return this._textSprite.faceDilate;
    }

    set faceDilate(value: number) {
        this._textSprite.faceDilate = value;
    }

    override get color(): string {
        return this._textSprite.color;
    }

    override set color(value: string) {
        this._textSprite.color = value;
    }

    override get align(): string {
        return this._textSprite.align;
    }

    override set align(value: string) {
        this._textSprite.align = value;
    }

    override get valign(): string {
        return this._textSprite.valign;
    }

    override set valign(value: string) {
        this._textSprite.valign = value;
    }

    override get alignItems(): string {
        return this._textSprite.alignItems;
    }

    override set alignItems(value: string) {
        this._textSprite.alignItems = value;
    }

    override get leading(): number {
        return this._textSprite.leading;
    }

    override set leading(value: number) {
        this._textSprite.leading = value;
    }

    override get padding(): string {
        return this._textSprite.padding.join(",");
    }

    override set padding(value: string) {
        this._textSprite.padding = value;
    }

    @Laya.property({
        type: Number,
        step: 0.1,
        min: 0,
        fractionDigits: 1,
    })
    override get stroke(): number {
        return this._textSprite.stroke;
    }

    override set stroke(value: number) {
        this._textSprite.stroke = value;
    }

    override get strokeColor(): string {
        return this._textSprite.strokeColor;
    }

    override set strokeColor(value: string) {
        this._textSprite.strokeColor = value;
    }

    @Laya.property({
        type: Number,
        step: 0.1,
        min: 0,
        fractionDigits: 1,
    })
    get glow(): number {
        return this._textSprite.glowSize;
    }

    set glow(value: number) {
        this._textSprite.setGlowStyle(colorToVector4(this._glowColor), value);
    }

    @Laya.property({
        type: String,
        inspector: "color",
    })
    get glowColor(): string {
        return this._glowColor;
    }

    set glowColor(value: string) {
        this._glowColor = value || "#ffffff";
        this._textSprite.setGlowStyle(colorToVector4(this._glowColor), this.glow);
    }

    @Laya.property({
        type: Number,
        step: 0.1,
        min: 0,
        fractionDigits: 1,
    })
    get shadowBlur(): number {
        return this._textSprite.shadowBlur;
    }

    set shadowBlur(value: number) {
        this._textSprite.setShadowStyle(
            colorToVector4(this._shadowColor, "#000000"),
            this.shadowOffsetX,
            this.shadowOffsetY,
            value
        );
    }

    @Laya.property({
        type: Number,
        step: 0.1,
        fractionDigits: 1,
    })
    get shadowOffsetX(): number {
        return this._textSprite.shadowOffsetX;
    }

    set shadowOffsetX(value: number) {
        this._textSprite.setShadowStyle(
            colorToVector4(this._shadowColor, "#000000"),
            value,
            this.shadowOffsetY,
            this.shadowBlur
        );
    }

    @Laya.property({
        type: Number,
        step: 0.1,
        fractionDigits: 1,
    })
    get shadowOffsetY(): number {
        return this._textSprite.shadowOffsetY;
    }

    set shadowOffsetY(value: number) {
        this._textSprite.setShadowStyle(
            colorToVector4(this._shadowColor, "#000000"),
            this.shadowOffsetX,
            value,
            this.shadowBlur
        );
    }

    @Laya.property({
        type: String,
        inspector: "color",
    })
    get shadowColor(): string {
        return this._shadowColor;
    }

    set shadowColor(value: string) {
        this._shadowColor = value || "#000000";
        this._textSprite.setShadowStyle(
            colorToVector4(this._shadowColor, "#000000"),
            this.shadowOffsetX,
            this.shadowOffsetY,
            this.shadowBlur
        );
    }

    override get bgColor(): string {
        return this._textSprite.bgColor;
    }

    override set bgColor(value: string) {
        this._textSprite.bgColor = value;
    }

    override get borderColor(): string {
        return this._textSprite.borderColor;
    }

    override set borderColor(value: string) {
        this._textSprite.borderColor = value;
    }

    override get wordWrap(): boolean {
        return this._textSprite.wordWrap;
    }

    override set wordWrap(value: boolean) {
        this._textSprite.wordWrap = value;
    }

    override get bold(): boolean {
        return this._textSprite.bold;
    }

    override set bold(value: boolean) {
        this._textSprite.bold = value;
    }

    override get italic(): boolean {
        return this._textSprite.italic;
    }

    override set italic(value: boolean) {
        this._textSprite.italic = value;
    }

    override get underline(): boolean {
        return this._textSprite.underline;
    }

    override set underline(value: boolean) {
        this._textSprite.underline = value;
    }

    override get underlineColor(): string {
        return this._textSprite.underlineColor;
    }

    override set underlineColor(value: string) {
        this._textSprite.underlineColor = value;
    }

    override get strikethrough(): boolean {
        return this._textSprite.strikethrough;
    }

    override set strikethrough(value: boolean) {
        this._textSprite.strikethrough = value;
    }

    override get strikethroughColor(): string {
        return this._textSprite.strikethroughColor;
    }

    override set strikethroughColor(value: string) {
        this._textSprite.strikethroughColor = value;
    }

    override get html(): boolean {
        return this._textSprite.html;
    }

    override set html(value: boolean) {
        this._textSprite.html = value;
    }

    override get ubb(): boolean {
        return this._textSprite.ubb;
    }

    override set ubb(value: boolean) {
        this._textSprite.ubb = value;
    }

    @Laya.property({
        name: "font",
        type: "string",
        caption: "Font",
        inspector: "asset",
        isAsset: true,
        assetTypeFilter: "Json",
        tips: "选择 MSDF 字体 json。编辑器会序列化为 res://uuid，脚本里仍然支持注册名和 texture|json|shader。",
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
        return this._textSprite.maxWidth;
    }

    override set maxWidth(value: number) {
        this._textSprite.maxWidth = value;
    }

    override get overflow(): MsdfOverflow {
        return this._textSprite.overflow;
    }

    override set overflow(value: MsdfOverflow) {
        this._textSprite.overflow = value;
    }

    override get fitContent(): MsdfLabelFitContent {
        return this._fitContent;
    }

    override set fitContent(value: MsdfLabelFitContent | boolean) {
        const next = typeof value === "boolean" ? (value ? "yes" : "no") : value || "no";
        if (this._fitContent === next) {
            return;
        }

        if (this.isFitContentValue(next) && !Laya.SerializeUtil.isDeserializing) {
            this._textSprite.typeset();
            if (this.canApplyFitContentInCurrentMode()) {
                this.writeFitContentSize(this._textSprite.getFitContentSize(), next);
            }
        }

        this._fitContent = next;
        this.syncTextHostLayout();
    }

    override get textField(): Laya.Text {
        return this._tf;
    }

    get msdfTextField(): MsdfText {
        return this._textSprite;
    }

    override get ignoreLang(): boolean {
        return this._textSprite.ignoreLang;
    }

    override set ignoreLang(value: boolean) {
        if (this._textSprite.ignoreLang === value) {
            return;
        }

        const previous = this._textSprite.text;
        this._textSprite.ignoreLang = value;
        this._textSprite.text = previous;
    }

    override get templateVars(): MsdfTemplateVars {
        return this._textSprite.templateVars as MsdfTemplateVars;
    }

    override set templateVars(value: MsdfTemplateVars | boolean) {
        this._textSprite.templateVars = value as Record<string, string> | boolean;
    }

    get htmlParseOptions(): Laya.HtmlParseOptions | null {
        return this._textSprite.htmlParseOptions;
    }

    set htmlParseOptions(value: Laya.HtmlParseOptions | null) {
        this._textSprite.htmlParseOptions = value as Laya.HtmlParseOptions;
    }

    get lines(): ReadonlyArray<MsdfTextLineMetric> {
        return this._textSprite.lines;
    }

    get scrollX(): number {
        return this._textSprite.scrollX;
    }

    set scrollX(value: number) {
        this._textSprite.scrollX = value;
    }

    get scrollY(): number {
        return this._textSprite.scrollY;
    }

    set scrollY(value: number) {
        this._textSprite.scrollY = value;
    }

    get maxScrollX(): number {
        return this._textSprite.maxScrollX;
    }

    get maxScrollY(): number {
        return this._textSprite.maxScrollY;
    }

    get textWidth(): number {
        return this._textSprite.textWidth;
    }

    get textHeight(): number {
        return this._textSprite.textHeight;
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
        return this._textSprite.width;
    }

    protected override measureHeight(): number {
        return this._textSprite.height;
    }

    override get_width(): number {
        if (this._hasExplicitWidth || this._textSprite.text) {
            return super.get_width();
        }

        return 0;
    }

    override get_height(): number {
        if (this._hasExplicitHeight || this._textSprite.text) {
            return super.get_height();
        }

        return 0;
    }

    protected override _sizeChanged(): void {
        super._sizeChanged();
        this.syncTextHostLayout();
    }

    override set_width(value: number): void {
        if (
            this._fitContent === "yes" &&
            !this._msdfFitFlag &&
            this.canBlockExternalWidthInCurrentMode()
        ) {
            return;
        }

        this._hasExplicitWidth = Number.isFinite(value) && value >= 0;
        super.set_width(value);
        this.syncTextHostLayout();
    }

    override set_height(value: number): void {
        if (
            this.isFitContentValue(this._fitContent) &&
            !this._msdfFitFlag &&
            this.canBlockExternalHeightInCurrentMode()
        ) {
            return;
        }

        this._hasExplicitHeight = Number.isFinite(value) && value >= 0;
        super.set_height(value);
        this.syncTextHostLayout();
    }

    override set_dataSource(value: unknown): void {
        this._dataSource = value;
        if (typeof value === "number" || typeof value === "string") {
            this.text = `${value}`;
            return;
        }

        super.set_dataSource(value);
    }

    override setVar(name: string, value: unknown): this {
        this._textSprite.setVar(name, value);
        return this;
    }

    changeText(text?: string): void {
        if (typeof text === "string") {
            this.text = text;
            return;
        }

        this._textSprite.refresh();
    }

    private handleTextPostLayout(): void {
        if (!this.isFitContentValue(this._fitContent) || !this.canApplyFitContentInCurrentMode()) {
            return;
        }

        this.writeFitContentSize(this._textSprite.getFitContentSize(), this._fitContent);
    }

    private syncTextHostLayout(): void {
        if (!this._textSprite) {
            return;
        }

        this._textSprite.pos(0, 0);
        this._textSprite.setLabelHostLayout(
            super.get_width(),
            super.get_height(),
            this._hasExplicitWidth,
            this._hasExplicitHeight
        );
    }

    private isFitContentValue(value: MsdfLabelFitContent): boolean {
        return value === "yes" || value === "height";
    }

    private isEditingNode(): boolean {
        return this._getBit(Laya.NodeFlags.EDITING_NODE);
    }

    private canApplyFitContentInCurrentMode(): boolean {
        return (
            !this.isEditingNode() ||
            (this._textSprite.textWidth > 0 && this._textSprite.textHeight > 0)
        );
    }

    private canBlockExternalWidthInCurrentMode(): boolean {
        return !this.isEditingNode() || this._textSprite.textWidth > 0;
    }

    private canBlockExternalHeightInCurrentMode(): boolean {
        return !this.isEditingNode() || this._textSprite.textHeight > 0;
    }

    private withFitContentWrite<T>(callback: () => T): T {
        const nativeLabel = this as unknown as LayaLabelFitFlagHost;
        const previousMsdfFitFlag = this._msdfFitFlag;
        const hadNativeFitFlag = Object.prototype.hasOwnProperty.call(nativeLabel, "_fitFlag");
        const previousNativeFitFlag = nativeLabel._fitFlag;

        this._msdfFitFlag = true;
        nativeLabel._fitFlag = true;
        try {
            return callback();
        } finally {
            this._msdfFitFlag = previousMsdfFitFlag;
            if (hadNativeFitFlag) {
                nativeLabel._fitFlag = previousNativeFitFlag;
            } else {
                delete nativeLabel._fitFlag;
            }
        }
    }

    private writeFitContentSize(
        size: { width: number; height: number },
        fitContent: MsdfLabelFitContent
    ): void {
        this.withFitContentWrite(() => {
            if (fitContent === "height") {
                this.set_height(size.height);
                return;
            }

            this.set_width(size.width);
            this.set_height(size.height);
        });
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
        return value.startsWith(RES_URL_PREFIX) || JSON_ASSET_PATTERN.test(value);
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

        void Promise.all([
            Laya.loader.load({ url: resolvedJsonUrl, type: Laya.Loader.JSON }),
            Laya.AssetDb.inst.resolveURL(resolvedJsonUrl),
        ])
            .then(([rawData, resolvedAssetUrl]) => {
                if (this.destroyed || requestToken !== this._fontResolveToken) {
                    return;
                }

                const resources = this.resolveFontResourcesFromJsonAsset(
                    resolvedJsonUrl,
                    rawData,
                    resolvedShaderUrl,
                    normalizeAssetUrl(resolvedAssetUrl || resolvedJsonUrl)
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
        shaderUrl: string,
        resourceBaseUrl: string = jsonUrl
    ): MsdfFontResourceConfig | null {
        const fontData = normalizeFontJsonAssetData(rawData);
        const pages = Array.isArray(fontData?.pages) ? fontData.pages : null;
        const page = typeof pages?.[0] === "string" ? pages[0] : "";
        if (!page) {
            return null;
        }

        return {
            textureUrl: resolveAssetUrl(resourceBaseUrl, page),
            jsonUrl,
            shaderUrl,
        };
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
        this._textSprite.clearFont();
        this._textSprite.size(0, 0);
    }

    private clearFontState(): void {
        this._resourceKey = "";
        this._font = null;
    }

    private applyLoadedFont(font: MsdfBitmapFont): void {
        this._font = font;
        this._textSprite.resetFont(font);
        this.syncTextHostLayout();
        this.event(Laya.Event.LOADED);
    }

    private reloadFont(): void {
        if (!this.hasCompleteFontResources()) {
            this.clearFontState();
            this.clearTextSprite();
            return;
        }

        const nextKey = MsdfLabel.getFontResourceKey(
            this._fontTextureUrl,
            this._fontJsonUrl,
            this._fontShaderUrl
        );
        this._resourceKey = nextKey;
        this._font = null;

        const loadedFont = MsdfLabel.loadedFontCache.get(nextKey);
        if (loadedFont) {
            this.applyLoadedFont(loadedFont);
            return;
        }

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
}
