import { MsdfLabel } from "./msdf/MsdfLabel";

const { regClass } = Laya;

const MSDF_SHADER_URL = "res://66e84b33-56bf-4d18-97d1-4239936447c2";
const MSDF_ATLAS_URL = "res://40ae4c4f-c490-4311-99f2-d7b00cd1976b";
const MSDF_JSON_URL = "res://bb450ed1-6826-4998-b470-d77a2462095a";
const NATIVE_FONT_URL = "resources/source-han-sans-cn-medium.ttf";
const CARD_WIDTH = 492;
const CARD_HEIGHT = 340;
const CARD_GAP = 24;
const PANEL_X = 24;
const PANEL_Y = 24;
const PANEL_WIDTH = 1104;
const PANEL_HEIGHT = 760;
const CONTENT_PADDING = 24;
const HEADER_HEIGHT = 78;
const GRID_TOP = 124;
const COMPARE_TOP = 88;
const COMPARE_GAP = 16;
const SECTION_HEIGHT = 108;

@regClass()
export class Main extends Laya.Script {

    onStart(): void {
        Laya.stage.bgColor = "#0b1220";
        MsdfLabel.registerFont("demo-msdf", MSDF_ATLAS_URL, MSDF_JSON_URL, MSDF_SHADER_URL);

        const panel = this.createPanel();
        this.owner.addChild(panel);

        const cases = [
            {
                title: "font + basic",
                note: "验证 font 属性映射、字号、描边、阴影和基础测量。",
                buildMsdf: () => {
                    const label = this.createMsdfLabel("font 属性已接入 demo-msdf，描边和投影同时开启。");
                    label.font = "demo-msdf";
                    label.fontSize = 34;
                    label.stroke = 2;
                    label.strokeColor = "#1d9c7c";
                    label.shadowColor = "#03111fcc";
                    label.shadowOffsetX = 4;
                    label.shadowOffsetY = 4;
                    return label;
                },
                buildNative: () => {
                    const label = this.createNativeLabel("Laya.Label 使用 TTF 作为基准参照。");
                    label.font = NATIVE_FONT_URL;
                    label.fontSize = 34;
                    label.stroke = 2;
                    label.strokeColor = "#1d9c7c";
                    return label;
                }
            },
            {
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
                }
            },
            {
                title: "maxWidth wrap",
                note: "不显式设 width，仅靠 maxWidth 触发换行，保留基础换行对齐检查。",
                buildMsdf: () => {
                    const label = this.createMsdfLabel("maxWidth=270 时应自动换行，不需要先手动设置组件宽度。");
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
                    const label = this.createNativeLabel("maxWidth=270 时应自动换行，不需要先手动设置组件宽度。");
                    label.font = NATIVE_FONT_URL;
                    label.fontSize = 28;
                    label.maxWidth = 270;
                    label.leading = 8;
                    label.bgColor = "#16263a";
                    label.borderColor = "#35506d";
                    label.padding = "10,12,10,12";
                    return label;
                }
            },
            {
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
                }
            },
            {
                title: "overflow hidden",
                note: "固定宽高后裁剪溢出内容。",
                buildMsdf: () => {
                    const label = this.createMsdfLabel("overflow=hidden：超出的内容应该直接被裁掉，不能继续画到卡片外。");
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
                    const label = this.createNativeLabel("overflow=hidden：超出的内容应该直接被裁掉，不能继续画到卡片外。");
                    label.font = NATIVE_FONT_URL;
                    label.fontSize = 28;
                    label.wordWrap = true;
                    label.overflow = "hidden";
                    label.size(290, 78);
                    label.padding = "10,12,10,12";
                    label.bgColor = "#16263a";
                    label.borderColor = "#35506d";
                    return label;
                }
            },
            {
                title: "overflow ellipsis",
                note: "固定宽高后省略最后可见行。",
                buildMsdf: () => {
                    const label = this.createMsdfLabel("overflow=ellipsis：文本过长时，最后应该以省略号收尾，而不是直接穿出边界。");
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
                    const label = this.createNativeLabel("overflow=ellipsis：文本过长时，最后应该以省略号收尾，而不是直接穿出边界。");
                    label.font = NATIVE_FONT_URL;
                    label.fontSize = 28;
                    label.overflow = "ellipsis";
                    label.size(300, 84);
                    label.padding = "10,12,10,12";
                    label.bgColor = "#16263a";
                    label.borderColor = "#35506d";
                    return label;
                }
            },
            {
                title: "template + escape",
                note: "验证 templateVars、setVar 和 \\n 转义字符解析。",
                buildMsdf: () => {
                    const label = this.createMsdfLabel("当前波次 {wave=0}\\n当前分数 {score=0}");
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
                    const label = this.createNativeLabel("当前波次 {wave=0}\\n当前分数 {score=0}");
                    label.font = NATIVE_FONT_URL;
                    label.fontSize = 26;
                    label.templateVars = true;
                    label.setVar("wave", 7);
                    label.setVar("score", 1280);
                    label.padding = "10,12,10,12";
                    label.bgColor = "#16263a";
                    label.borderColor = "#35506d";
                    return label;
                }
            },
            {
                title: "scroll via textField",
                note: "固定区域后设置 scrollY，比较 textField 驱动的滚动窗口结果。",
                buildMsdf: () => {
                    const label = this.createMsdfLabel("scroll 模式下，内容区域应该固定，scrollY 改变后只移动视窗内的文本。这里故意放三行内容用于比对。");
                    label.font = "demo-msdf";
                    label.fontSize = 26;
                    label.wordWrap = true;
                    label.overflow = "scroll";
                    label.size(296, 84);
                    label.padding = "10,12,10,12";
                    label.bgColor = "#16263a";
                    label.borderColor = "#35506d";
                    label.once(Laya.Event.LOADED, label, () => {
                        if (label.textField) {
                            label.textField.scrollY = 34;
                        }
                    });
                    return label;
                },
                buildNative: () => {
                    const label = this.createNativeLabel("scroll 模式下，内容区域应该固定，scrollY 改变后只移动视窗内的文本。这里故意放三行内容用于比对。");
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
                }
            }
        ];

        const header = this.createHeader(panel.width - CONTENT_PADDING * 2);
        header.pos(CONTENT_PADDING, CONTENT_PADDING);
        panel.addChild(header);

        const grid = new Laya.Box();
        grid.pos(CONTENT_PADDING, GRID_TOP);
        panel.addChild(grid);

        cases.forEach((item, index) => {
            const card = this.createCaseCard(item.title, item.note);
            card.pos((index % 2) * (CARD_WIDTH + CARD_GAP), Math.floor(index / 2) * (CARD_HEIGHT + CARD_GAP));
            grid.addChild(card);

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
        });

        const rowCount = Math.ceil(cases.length / 2);
        const gridHeight = rowCount > 0 ? rowCount * CARD_HEIGHT + (rowCount - 1) * CARD_GAP : 0;
        grid.size(CARD_WIDTH * 2 + CARD_GAP, gridHeight);
        panel.refresh();
    }

    private createHeader(width: number): Laya.Box {
        const box = new Laya.Box();
        box.size(width, HEADER_HEIGHT);

        const title = new Laya.Label();
        title.font = NATIVE_FONT_URL;
        title.fontSize = 36;
        title.color = "#f8e7a4";
        title.text = "MsdfLabel / Laya.Label 对齐测试";
        title.pos(0, 0);
        box.addChild(title);

        const note = new Laya.Label();
        note.font = NATIVE_FONT_URL;
        note.fontSize = 20;
        note.color = "#8fa6bd";
        note.width = width;
        note.leading = 4;
        note.wordWrap = true;
        note.text = "示例已收敛为关键对齐项。每张卡片按 Laya 在上、MSDF 在下排列，Panel 仅保留垂直滚动。";
        note.pos(2, 48);
        box.addChild(note);

        return box;
    }

    private createCaseCard(title: string, note: string): Laya.Sprite {
        const card = new Laya.Sprite();
        card.size(CARD_WIDTH, CARD_HEIGHT);
        card.graphics.drawRect(0, 0, CARD_WIDTH, CARD_HEIGHT, "#111c2b", "#2a425f", 2);
        card.graphics.drawLine(18, COMPARE_TOP + SECTION_HEIGHT + 4, CARD_WIDTH - 18, COMPARE_TOP + SECTION_HEIGHT + 4, "#22364d", 1);

        const titleLabel = new Laya.Label();
        titleLabel.font = NATIVE_FONT_URL;
        titleLabel.fontSize = 24;
        titleLabel.color = "#d8e7f5";
        titleLabel.text = title;
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

        card.graphics.drawRect(18, COMPARE_TOP + 32, CARD_WIDTH - 36, SECTION_HEIGHT - 16, null, "#2a425f", 1);
        card.graphics.drawRect(18, COMPARE_TOP + SECTION_HEIGHT + COMPARE_GAP + 32, CARD_WIDTH - 36, SECTION_HEIGHT - 16, null, "#2a425f", 1);

        return card;
    }

    private createTag(text: string, fillColor: string, borderColor: string): Laya.Sprite {
        const box = new Laya.Sprite();
        box.graphics.drawRect(0, 0, 64, 24, fillColor, borderColor, 1);

        const label = new Laya.Label();
        label.font = NATIVE_FONT_URL;
        label.fontSize = 15;
        label.color = "#e7f1fb";
        label.align = "center";
        label.valign = "middle";
        label.size(64, 24);
        label.text = text;
        box.addChild(label);

        return box;
    }

    private createMsdfLabel(text: string): MsdfLabel {
        const label = new MsdfLabel(text);
        label.color = "#d9e7f5";
        label.leading = 6;
        label.shadowColor = "#020817cc";
        label.shadowOffsetX = 2;
        label.shadowOffsetY = 2;
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
        panel.scrollType = (Laya as any).ScrollType?.Vertical ?? 2;
        panel.vScrollBarSkin = "";
        panel.elasticEnabled = true;
        return panel;
    }
}
