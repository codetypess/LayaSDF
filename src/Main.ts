import { MsdfLabel } from "./msdf/MsdfLabel";
import { MsdfBitmapFont } from "./msdf/MsdfText";

const { regClass } = Laya;

const MSDF_SHADER_URL = "resources/shader/MsdfText.shader";
const MSDF_ATLAS_URL = "resources/font/SourceHanSans.png";
const MSDF_JSON_URL = "resources/font/SourceHanSans.json";
const NATIVE_FONT_URL = "resources/source-han-sans-cn-medium.ttf";
const CARD_WIDTH = 492;
const CARD_HEIGHT = 340;
const RICH_TEXT_CARD_HEIGHT = 420;
const CARD_GAP = 24;
const PANEL_X = 24;
const PANEL_Y = 24;
const PANEL_WIDTH = 1104;
const PANEL_HEIGHT = 760;
const CONTENT_PADDING = 24;
const HEADER_HEIGHT = 120;
const GROUP_HEADER_HEIGHT = 58;
const GROUP_GAP = 28;
const GROUP_CONTENT_GAP = 12;
const COMPARE_TOP = 88;
const COMPARE_GAP = 16;
const SECTION_HEIGHT = 108;

type MainCompareCase = {
    id: string;
    title: string;
    note: string;
    buildMsdf: () => MsdfLabel;
    buildNative: () => Laya.Label;
    cardHeight?: number;
};

type MainCompareGroup = {
    id: string;
    title: string;
    note: string;
    cases: MainCompareCase[];
};

@regClass()
export class Main extends Laya.Script {
    override onStart(): void {
        Laya.stage.bgColor = "#0b1220";
        MsdfBitmapFont.registerFont("demo-msdf", MSDF_ATLAS_URL, MSDF_JSON_URL, MSDF_SHADER_URL);

        const groups = this.createRegressionGroups();
        const panel = this.createPanel();
        this.owner.addChild(panel);

        const header = this.createHeader(panel.width - CONTENT_PADDING * 2, groups);
        header.pos(CONTENT_PADDING, CONTENT_PADDING);
        panel.addChild(header);

        const content = this.createRegressionContent(groups);
        content.pos(CONTENT_PADDING, header.y + header.height + 18);
        panel.addChild(content);

        panel.refresh();

        Laya.timer.once(2000, this, () => {
            const labdesc = this.owner.getChildByName("labdesc") as MsdfLabel;
            console.log(
                "labdesc before1",
                labdesc.constructor.name,
                labdesc.textField.textHeight,
                labdesc.textField.textHeight
            );
            labdesc.text = "";
            console.log(
                "labdesc after1",
                labdesc.constructor.name,
                labdesc.textField.textWidth,
                labdesc.textField.textHeight
            );
            labdesc.text = "开始行军";
            console.log(
                "labdesc after1",
                labdesc.constructor.name,
                labdesc.textField.textWidth,
                labdesc.textField.textHeight
            );
            console.log(
                "labdesc after2",
                labdesc.constructor.name,
                labdesc.textField.textWidth,
                labdesc.textField.textHeight
            );

            Laya.loader.load("resources/Prefab2D.lh", Laya.Loader.HIERARCHY).then((prefab) => {
                const node = prefab.create();
                const label = node.getChildByName("labelTxt") as MsdfLabel;
                console.log(
                    "label before:",
                    label.constructor.name,
                    label.textField.textWidth,
                    label.textField.textHeight
                );
                label.text = "开始行军";
                console.log(
                    "labd after",
                    label.constructor.name,
                    label.textField.textWidth,
                    label.textField.textHeight
                );
            });
        });
    }

    private createRegressionGroups(): MainCompareGroup[] {
        return [
            {
                id: "A",
                title: "样式与基础",
                note: "优先确认字体映射、装饰线颜色和模板文本解析。",
                cases: [
                    {
                        id: "A1",
                        title: "font + basic",
                        note: "验证 font 属性映射、字号、描边、阴影和基础测量。",
                        buildMsdf: () => {
                            const label = this.createMsdfLabel(
                                "font 属性已接入 demo-msdf，描边和投影同时开启。"
                            );
                            label.font = "demo-msdf";
                            label.fontSize = 34;
                            label.stroke = 2;
                            label.wordWrap = true;
                            label.strokeColor = "#1d9c7c";
                            label.shadowColor = "#03111fcc";
                            label.shadowOffsetX = 3;
                            label.shadowOffsetY = 3;
                            label.width = 480;
                            return label;
                        },
                        buildNative: () => {
                            const label = this.createNativeLabel(
                                "Laya.Label 使用 TTF 作为基准参照。"
                            );
                            label.font = NATIVE_FONT_URL;
                            label.wordWrap = true;
                            label.fontSize = 34;
                            label.stroke = 2;
                            label.width = 480;
                            label.strokeColor = "#1d9c7c";
                            return label;
                        },
                    },
                    {
                        id: "A2",
                        title: "decoration colors",
                        note: "验证 underlineColor、strikethroughColor；未设置时应继续跟随主文字颜色。",
                        buildMsdf: () => {
                            const label = this.createMsdfLabel("装饰线颜色独立");
                            label.font = "demo-msdf";
                            label.fontSize = 32;
                            label.underline = true;
                            label.underlineColor = "#56d39b";
                            label.strikethrough = true;
                            label.strikethroughColor = "#ffb347";
                            label.stroke = 1.5;
                            label.strokeColor = "#21406d";
                            return label;
                        },
                        buildNative: () => {
                            const label = this.createNativeLabel("装饰线颜色独立");
                            label.font = NATIVE_FONT_URL;
                            label.fontSize = 32;
                            label.underline = true;
                            label.underlineColor = "#56d39b";
                            label.strikethrough = true;
                            label.strikethroughColor = "#ffb347";
                            label.stroke = 1.5;
                            label.strokeColor = "#21406d";
                            return label;
                        },
                    },
                    {
                        id: "A3",
                        title: "faceDilate thicker",
                        note: "验证 faceDilate < 0 时字形变肥，方便直接观察笔画膨胀。",
                        buildMsdf: () => {
                            const label = this.createMsdfLabel(
                                "faceDilate < 0 时，笔画会更肥，适合微调字重。"
                            );
                            label.font = "demo-msdf";
                            label.fontSize = 28;
                            label.faceDilate = -0.5;
                            label.wordWrap = true;
                            label.width = 300;
                            label.padding = "10,12,10,12";
                            label.bgColor = "#16263a";
                            label.borderColor = "#35506d";
                            label.stroke = 1;
                            label.strokeColor = "#21406d";
                            return label;
                        },
                        buildNative: () => {
                            const label = this.createNativeLabel(
                                "原生 Label 无 faceDilate，这里作为常规字重基线。"
                            );
                            label.font = NATIVE_FONT_URL;
                            label.fontSize = 28;
                            label.wordWrap = true;
                            label.width = 300;
                            label.padding = "10,12,10,12";
                            label.bgColor = "#16263a";
                            label.borderColor = "#35506d";
                            label.stroke = 1;
                            label.strokeColor = "#21406d";
                            return label;
                        },
                    },
                    {
                        id: "A4",
                        title: "faceDilate thinner",
                        note: "验证 faceDilate > 0 时字形变瘦，和上一张负值卡片做正负对照。",
                        buildMsdf: () => {
                            const label = this.createMsdfLabel(
                                "faceDilate > 0 时，笔画会更瘦，轮廓更收紧。"
                            );
                            label.font = "demo-msdf";
                            label.fontSize = 28;
                            label.faceDilate = 0.5;
                            label.wordWrap = true;
                            label.width = 300;
                            label.padding = "10,12,10,12";
                            label.bgColor = "#16263a";
                            label.borderColor = "#35506d";
                            label.stroke = 1;
                            label.strokeColor = "#21406d";
                            return label;
                        },
                        buildNative: () => {
                            const label = this.createNativeLabel(
                                "原生 Label 无 faceDilate，这里作为常规字重基线。"
                            );
                            label.font = NATIVE_FONT_URL;
                            label.fontSize = 28;
                            label.wordWrap = true;
                            label.width = 300;
                            label.padding = "10,12,10,12";
                            label.bgColor = "#16263a";
                            label.borderColor = "#35506d";
                            label.stroke = 1;
                            label.strokeColor = "#21406d";
                            return label;
                        },
                    },
                    {
                        id: "A5",
                        title: "template + escape",
                        note: "验证 templateVars、setVar 和 \\n 转义字符解析。",
                        buildMsdf: () => {
                            const label = this.createMsdfLabel(
                                "当前波次 {wave=0}\\n当前分数 {score=0}"
                            );
                            label.font = "demo-msdf";
                            label.fontSize = 26;
                            label.templateVars = true;
                            label.setVar("wave", 7);
                            label.setVar("score", 1280);
                            label.padding = "10,12,10,12";
                            label.bgColor = "#16263a";
                            label.borderColor = "#35506d";
                            return label;
                        },
                        buildNative: () => {
                            const label = this.createNativeLabel(
                                "当前波次 {wave=0}\\n当前分数 {score=0}"
                            );
                            label.font = NATIVE_FONT_URL;
                            label.fontSize = 26;
                            label.templateVars = true;
                            label.setVar("wave", 7);
                            label.setVar("score", 1280);
                            label.padding = "10,12,10,12";
                            label.bgColor = "#16263a";
                            label.borderColor = "#35506d";
                            return label;
                        },
                    },
                ],
            },
            {
                id: "B",
                title: "布局与尺寸",
                note: "重点检查 maxWidth 触发换行和 fitContent 的尺寸回写。",
                cases: [
                    {
                        id: "B1",
                        title: "maxWidth wrap",
                        note: "不显式设 width，仅靠 maxWidth 触发换行，保留基础换行对齐检查。",
                        buildMsdf: () => {
                            const label = this.createMsdfLabel(
                                "maxWidth=270 时应自动换行，不需要先手动设置组件宽度。"
                            );
                            label.font = "demo-msdf";
                            label.fontSize = 28;
                            label.maxWidth = 270;
                            label.leading = 8;
                            label.bgColor = "#16263a";
                            label.borderColor = "#35506d";
                            label.padding = "10,12,10,12";
                            return label;
                        },
                        buildNative: () => {
                            const label = this.createNativeLabel(
                                "maxWidth=270 时应自动换行，不需要先手动设置组件宽度。"
                            );
                            label.font = NATIVE_FONT_URL;
                            label.fontSize = 28;
                            label.maxWidth = 270;
                            label.leading = 8;
                            label.bgColor = "#16263a";
                            label.borderColor = "#35506d";
                            label.padding = "10,12,10,12";
                            return label;
                        },
                    },
                    {
                        id: "B2",
                        title: "fitContent yes",
                        note: "内容驱动宽高，忽略外部 size 写入。",
                        buildMsdf: () => {
                            const label = this.createMsdfLabel("fitContent = yes");
                            label.font = "demo-msdf";
                            label.fontSize = 30;
                            label.fitContent = "yes";
                            label.padding = "12,16,12,16";
                            label.bgColor = "#163247";
                            label.borderColor = "#2d728f";
                            label.stroke = 1.5;
                            label.strokeColor = "#63d1ae";
                            label.size(120, 40);
                            return label;
                        },
                        buildNative: () => {
                            const label = this.createNativeLabel("fitContent = yes");
                            label.font = NATIVE_FONT_URL;
                            label.fontSize = 30;
                            label.fitContent = "yes";
                            label.padding = "12,16,12,16";
                            label.bgColor = "#163247";
                            label.borderColor = "#2d728f";
                            label.stroke = 1.5;
                            label.strokeColor = "#63d1ae";
                            label.size(120, 40);
                            return label;
                        },
                    },
                ],
            },
            {
                id: "C",
                title: "Overflow 与视口",
                note: "集中看 hidden、ellipsis、shrink、scroll 这些最容易产生行为差异的场景。",
                cases: [
                    {
                        id: "C1",
                        title: "overflow hidden",
                        note: "固定宽高后裁剪溢出内容。",
                        buildMsdf: () => {
                            const label = this.createMsdfLabel(
                                "overflow=hidden：超出的内容应该直接被裁掉，不能继续画到卡片外。"
                            );
                            label.font = "demo-msdf";
                            label.fontSize = 28;
                            label.wordWrap = true;
                            label.overflow = "hidden";
                            label.size(290, 78);
                            label.padding = "10,12,10,12";
                            label.bgColor = "#16263a";
                            label.borderColor = "#35506d";
                            return label;
                        },
                        buildNative: () => {
                            const label = this.createNativeLabel(
                                "overflow=hidden：超出的内容应该直接被裁掉，不能继续画到卡片外。"
                            );
                            label.font = NATIVE_FONT_URL;
                            label.fontSize = 28;
                            label.wordWrap = true;
                            label.overflow = "hidden";
                            label.size(290, 78);
                            label.padding = "10,12,10,12";
                            label.bgColor = "#16263a";
                            label.borderColor = "#35506d";
                            return label;
                        },
                    },
                    {
                        id: "C2",
                        title: "overflow ellipsis",
                        note: "固定宽高后省略最后可见行。",
                        buildMsdf: () => {
                            const label = this.createMsdfLabel(
                                "overflow=ellipsis：文本过长时，最后应该以省略号收尾，而不是直接穿出边界。"
                            );
                            label.font = "demo-msdf";
                            label.fontSize = 28;
                            label.overflow = "ellipsis";
                            label.size(300, 84);
                            label.padding = "10,12,10,12";
                            label.bgColor = "#16263a";
                            label.borderColor = "#35506d";
                            return label;
                        },
                        buildNative: () => {
                            const label = this.createNativeLabel(
                                "overflow=ellipsis：文本过长时，最后应该以省略号收尾，而不是直接穿出边界。"
                            );
                            label.font = NATIVE_FONT_URL;
                            label.fontSize = 28;
                            label.overflow = "ellipsis";
                            label.size(300, 84);
                            label.padding = "10,12,10,12";
                            label.bgColor = "#16263a";
                            label.borderColor = "#35506d";
                            return label;
                        },
                    },
                    {
                        id: "C3",
                        title: "overflow shrink",
                        note: "固定宽高后整体缩小文本，以适应内容区域。",
                        buildMsdf: () => {
                            const label = this.createMsdfLabel(
                                "overflow=shrink 时，文本应整体缩小并保持完整显示。overflow=shrink 时，文本应整体缩小并保持完整显示。"
                            );
                            label.font = "demo-msdf";
                            label.fontSize = 30;
                            label.wordWrap = true;
                            label.overflow = "shrink";
                            label.size(296, 84);
                            label.padding = "10,12,10,12";
                            label.bgColor = "#16263a";
                            label.borderColor = "#d33408";
                            return label;
                        },
                        buildNative: () => {
                            const label = this.createNativeLabel(
                                "overflow=shrink 时，文本应整体缩小并保持完整显示。"
                            );
                            label.font = NATIVE_FONT_URL;
                            label.fontSize = 30;
                            label.wordWrap = true;
                            label.overflow = "shrink";
                            label.size(296, 84);
                            label.padding = "10,12,10,12";
                            label.bgColor = "#16263a";
                            label.borderColor = "#35506d";
                            return label;
                        },
                    },
                    {
                        id: "C4",
                        title: "scroll via textField",
                        note: "固定区域后设置 scrollY，比较 textField 驱动的滚动窗口结果。",
                        buildMsdf: () => {
                            const label = this.createMsdfLabel(
                                "scroll 模式下，内容区域应该固定，scrollY 改变后只移动视窗内的文本。这里故意放三行内容用于比对。"
                            );
                            label.font = "demo-msdf";
                            label.fontSize = 26;
                            label.wordWrap = true;
                            label.overflow = "scroll";
                            label.size(296, 84);
                            label.padding = "10,12,10,12";
                            label.bgColor = "#16263a";
                            label.borderColor = "#35506d";
                            label.textField.scrollY = 34;
                            return label;
                        },
                        buildNative: () => {
                            const label = this.createNativeLabel(
                                "scroll 模式下，内容区域应该固定，scrollY 改变后只移动视窗内的文本。这里故意放三行内容用于比对。"
                            );
                            label.font = NATIVE_FONT_URL;
                            label.fontSize = 26;
                            label.wordWrap = true;
                            label.overflow = "scroll";
                            label.size(296, 84);
                            label.padding = "10,12,10,12";
                            label.bgColor = "#16263a";
                            label.borderColor = "#35506d";
                            label.textField.scrollY = 34;
                            return label;
                        },
                    },
                ],
            },
            {
                id: "D",
                title: "语法混排",
                note: "补充 UBB 和 HTML 的富文本场景，重点看嵌套样式、段落、列表、换行和下划线点击事件。",
                cases: [
                    {
                        id: "D1",
                        title: "ubb rich styles",
                        note: "验证 UBB 的 color、size、b、i、u、url 嵌套，以及下划线点击事件。",
                        cardHeight: RICH_TEXT_CARD_HEIGHT,
                        buildMsdf: () => {
                            const label = this.createMsdfLabel(this.createUbbSampleText());
                            label.font = "demo-msdf";
                            label.fontSize = 24;
                            label.ubb = true;
                            label.wordWrap = true;
                            label.width = 300;
                            label.leading = 7;
                            label.padding = "10,12,10,12";
                            label.bgColor = "#16263a";
                            label.borderColor = "#35506d";
                            label.stroke = 1.5;
                            label.strokeColor = "#1b4a69";
                            label.shadowColor = "#020b14cc";
                            label.shadowOffsetX = 2;
                            label.shadowOffsetY = 2;
                            label.on(Laya.Event.LINK, this, this.handleMsdfRichTextLink);
                            return label;
                        },
                        buildNative: () => {
                            const label = this.createNativeLabel(this.createUbbSampleText());
                            label.font = NATIVE_FONT_URL;
                            label.fontSize = 24;
                            label.ubb = true;
                            label.wordWrap = true;
                            label.width = 300;
                            label.leading = 7;
                            label.padding = "10,12,10,12";
                            label.bgColor = "#16263a";
                            label.borderColor = "#35506d";
                            label.stroke = 1.5;
                            label.strokeColor = "#1b4a69";
                            return label;
                        },
                    },
                    {
                        id: "D2",
                        title: "html rich layout",
                        note: "验证 HTML 的 b、i、u、a、div、p、li、br 和下划线点击事件。",
                        cardHeight: RICH_TEXT_CARD_HEIGHT,
                        buildMsdf: () => {
                            const label = this.createMsdfLabel(this.createHtmlSampleText());
                            label.font = "demo-msdf";
                            label.fontSize = 24;
                            label.html = true;
                            label.wordWrap = true;
                            label.width = 300;
                            label.leading = 6;
                            label.padding = "10,12,10,12";
                            label.bgColor = "#16263a";
                            label.borderColor = "#35506d";
                            label.stroke = 1.5;
                            label.strokeColor = "#36597b";
                            label.shadowColor = "#04111acc";
                            label.shadowOffsetX = 2;
                            label.shadowOffsetY = 2;
                            label.on(Laya.Event.LINK, this, this.handleMsdfRichTextLink);
                            return label;
                        },
                        buildNative: () => {
                            const label = this.createNativeLabel(this.createHtmlSampleText());
                            label.font = NATIVE_FONT_URL;
                            label.fontSize = 24;
                            label.html = true;
                            label.wordWrap = true;
                            label.width = 300;
                            label.leading = 6;
                            label.padding = "10,12,10,12";
                            label.bgColor = "#16263a";
                            label.borderColor = "#35506d";
                            label.stroke = 1.5;
                            label.strokeColor = "#36597b";
                            return label;
                        },
                    },
                ],
            },
        ];
    }

    private createRegressionContent(groups: MainCompareGroup[]): Laya.Box {
        const content = new Laya.Box();
        let offsetY = 0;

        for (const group of groups) {
            const section = this.createRegressionSection(group);
            section.pos(0, offsetY);
            content.addChild(section);
            offsetY += section.height + GROUP_GAP;
        }

        content.size(CARD_WIDTH * 2 + CARD_GAP, Math.max(0, offsetY - GROUP_GAP));
        return content;
    }

    private createRegressionSection(group: MainCompareGroup): Laya.Box {
        const section = new Laya.Box();
        const groupHeader = this.createGroupHeader(group);
        section.addChild(groupHeader);

        const cardsTop = groupHeader.height + GROUP_CONTENT_GAP;
        const rowHeights: number[] = [];
        group.cases.forEach((item, index) => {
            const card = this.createComparisonCard(item);
            const rowIndex = Math.floor(index / 2);
            const y = rowHeights
                .slice(0, rowIndex)
                .reduce((sum, height) => sum + height + CARD_GAP, cardsTop);
            rowHeights[rowIndex] = Math.max(rowHeights[rowIndex] ?? 0, card.height);
            card.pos((index % 2) * (CARD_WIDTH + CARD_GAP), y);
            section.addChild(card);
        });

        const gridHeight = rowHeights.reduce(
            (sum, height, index) => sum + height + (index > 0 ? CARD_GAP : 0),
            0
        );
        section.size(CARD_WIDTH * 2 + CARD_GAP, cardsTop + gridHeight);
        return section;
    }

    private createComparisonCard(item: MainCompareCase): Laya.Sprite {
        const card = this.createCaseCard(
            item.id,
            item.title,
            item.note,
            item.cardHeight ?? CARD_HEIGHT
        );

        const nativeTag = this.createTag("Laya", "#3a2317", "#ffbe78");
        nativeTag.pos(18, COMPARE_TOP);
        card.addChild(nativeTag);

        const nativeLabel = item.buildNative();
        nativeLabel.pos(18, COMPARE_TOP + 34);
        card.addChild(nativeLabel);

        const msdfTag = this.createTag("MSDF", "#17384a", "#53c7ff");
        msdfTag.pos(18, COMPARE_TOP + SECTION_HEIGHT + COMPARE_GAP);
        card.addChild(msdfTag);

        const msdfLabel = item.buildMsdf();
        msdfLabel.pos(18, COMPARE_TOP + SECTION_HEIGHT + COMPARE_GAP + 34);
        card.addChild(msdfLabel);

        return card;
    }

    private createHeader(width: number, groups: MainCompareGroup[]): Laya.Box {
        const box = new Laya.Box();
        box.size(width, HEADER_HEIGHT);

        const title = new MsdfLabel();
        title.fontSize = 36;
        title.color = "#000000";
        title.text = "MsdfLabel / Laya.Label 手工回归入口";
        title.font = "demo-msdf";
        title.stroke = 2;
        title.strokeColor = "#fff200";
        title.shadowColor = "#fc0000";
        title.shadowOffsetX = 3;
        title.shadowOffsetY = 3;
        title.pos(0, 0);
        box.addChild(title);

        const note = new Laya.Label();
        note.font = NATIVE_FONT_URL;
        note.fontSize = 20;
        note.color = "#8fa6bd";
        note.width = width;
        note.leading = 4;
        note.wordWrap = true;
        note.text =
            "入口按组组织关键回归场景。每张卡片保持 Laya 在上、MSDF 在下，优先观察对齐、换行、overflow 裁剪、shrink、scroll 和 template 解析。";
        note.pos(2, 48);
        box.addChild(note);

        const summary = new Laya.Label();
        summary.font = NATIVE_FONT_URL;
        summary.fontSize = 18;
        summary.color = "#59c1ff";
        summary.width = width;
        summary.leading = 4;
        summary.wordWrap = true;
        summary.text = this.buildHeaderSummary(groups);
        summary.pos(2, 90);
        box.addChild(summary);

        return box;
    }

    private buildHeaderSummary(groups: MainCompareGroup[]): string {
        return groups
            .map((group) => `${group.id} ${group.title} (${group.cases.length})`)
            .join("  |  ");
    }

    private createGroupHeader(group: MainCompareGroup): Laya.Sprite {
        const box = new Laya.Sprite();
        box.size(CARD_WIDTH * 2 + CARD_GAP, GROUP_HEADER_HEIGHT);
        box.graphics.drawRect(0, 0, box.width, box.height, "#10263c", "#2e5677", 2);
        box.graphics.drawLine(0, box.height - 1, box.width, box.height - 1, "#4b88b8", 1);

        const titleLabel = new Laya.Label();
        titleLabel.font = NATIVE_FONT_URL;
        titleLabel.fontSize = 24;
        titleLabel.color = "#d8e7f5";
        titleLabel.text = `${group.id} · ${group.title}`;
        titleLabel.pos(16, 8);
        box.addChild(titleLabel);

        const noteLabel = new Laya.Label();
        noteLabel.font = NATIVE_FONT_URL;
        noteLabel.fontSize = 17;
        noteLabel.color = "#86a2bd";
        noteLabel.width = box.width - 160;
        noteLabel.text = group.note;
        noteLabel.pos(16, 32);
        box.addChild(noteLabel);

        const countTagWidth = 84;
        const countTag = this.createTag(
            `${group.cases.length} Cases`,
            "#1b3954",
            "#61c3ff",
            countTagWidth
        );
        countTag.pos(box.width - countTagWidth - 16, 16);
        box.addChild(countTag);

        return box;
    }

    private createCaseCard(id: string, title: string, note: string, height: number): Laya.Sprite {
        const card = new Laya.Sprite();
        card.size(CARD_WIDTH, height);
        card.graphics.drawRect(0, 0, CARD_WIDTH, height, "#111c2b", "#2a425f", 2);
        card.graphics.drawLine(
            18,
            COMPARE_TOP + SECTION_HEIGHT + 4,
            CARD_WIDTH - 18,
            COMPARE_TOP + SECTION_HEIGHT + 4,
            "#22364d",
            1
        );

        const titleLabel = new Laya.Label();
        titleLabel.font = NATIVE_FONT_URL;
        titleLabel.fontSize = 24;
        titleLabel.color = "#d8e7f5";
        titleLabel.text = `${id}  ${title}`;
        titleLabel.pos(18, 14);
        card.addChild(titleLabel);

        const noteLabel = new Laya.Label();
        noteLabel.font = NATIVE_FONT_URL;
        noteLabel.fontSize = 17;
        noteLabel.color = "#86a2bd";
        noteLabel.width = CARD_WIDTH - 36;
        noteLabel.wordWrap = true;
        noteLabel.leading = 4;
        noteLabel.text = note;
        noteLabel.pos(18, 42);
        card.addChild(noteLabel);

        card.graphics.drawRect(
            18,
            COMPARE_TOP + 32,
            CARD_WIDTH - 36,
            SECTION_HEIGHT - 16,
            null,
            "#2a425f",
            1
        );
        card.graphics.drawRect(
            18,
            COMPARE_TOP + SECTION_HEIGHT + COMPARE_GAP + 32,
            CARD_WIDTH - 36,
            SECTION_HEIGHT - 16,
            null,
            "#2a425f",
            1
        );

        return card;
    }

    private createTag(
        text: string,
        fillColor: string,
        borderColor: string,
        width: number = 64
    ): Laya.Sprite {
        const box = new Laya.Sprite();
        box.graphics.drawRect(0, 0, width, 24, fillColor, borderColor, 1);

        const label = new Laya.Label();
        label.font = NATIVE_FONT_URL;
        label.fontSize = 15;
        label.color = "#e7f1fb";
        label.align = "center";
        label.valign = "middle";
        label.size(width, 24);
        label.text = text;
        box.addChild(label);

        return box;
    }

    private createUbbSampleText(): string {
        return (
            "[size=30][color=#71d7ff][b]首领警报[/b][/color][/size]\n" +
            "[i][color=#ff9c73]第二形态已激活[/color][/i]\n" +
            "[url=msdf://shield-file][u][size=24][color=#ffe082]护盾文件[/color][/size][/u][/url] [u][color=#bde7ff]备用文件[/color][/u]\n" +
            "[color=#9fe29f][b]建议：[/b][/color][size=22]集火核心并保持走位[/size]"
        );
    }

    private createHtmlSampleText(): string {
        return (
            "<div><b>任务简报</b></div>" +
            "<p><i>第一阶段：</i><a href='msdf://mission-file'><u>封锁入口文件</u></a> <u>备用文件</u><br />第二阶段：保持阵型</p>" +
            "<p><li>前排吸收伤害</li><li>后排集中输出</li></p>" +
            "<span>剩余时间&nbsp;00:18</span>"
        );
    }

    private handleMsdfRichTextLink(value: string): void {
        console.log("[MSDF RichText LINK]", value);
    }

    private createMsdfLabel(text: string): MsdfLabel {
        const label = new MsdfLabel(text);
        label.color = "#d9e7f5";
        label.leading = 6;
        return label;
    }

    private createNativeLabel(text: string): Laya.Label {
        const label = new Laya.Label();
        label.text = text;
        label.color = "#d9e7f5";
        label.leading = 6;
        return label;
    }

    private createPanel(): Laya.Panel {
        const panel = new Laya.Panel();
        panel.pos(PANEL_X, PANEL_Y);
        panel.size(
            Math.min(PANEL_WIDTH, Math.max(Laya.stage.width - PANEL_X * 2, 320)),
            Math.min(PANEL_HEIGHT, Math.max(Laya.stage.height - PANEL_Y * 2, 320))
        );
        panel.graphics.drawRect(0, 0, panel.width, panel.height, "#0f1a2a", "#324a67", 2);
        panel.scrollType = Laya.ScrollType.Vertical;
        panel.vScrollBarSkin = "";
        panel.elasticEnabled = true;
        return panel;
    }
}
