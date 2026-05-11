import { MsdfLabel } from "./msdf/MsdfLabel";
import { MsdfBitmapFont } from "./msdf/MsdfText";

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

type Padding = [number, number, number, number];

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

@regClass()
export class TestOverflow extends Laya.Script {

    override onStart(): void {
        Laya.stage.bgColor = "#0b1220";
        MsdfBitmapFont.registerFont("demo-msdf", MSDF_ATLAS_URL, MSDF_JSON_URL, MSDF_SHADER_URL);

        const label = this.createMsdfLabel("overflow=hidden：超出的内容应该直接被裁掉，不能继续画到卡片外。");
        label.x = PANEL_X + CONTENT_PADDING;
        label.y = PANEL_Y + CONTENT_PADDING;
        label.font = "demo-msdf";
        label.fontSize = 28;
        label.wordWrap = true;
        label.overflow = "hidden";
        label.size(290, 78);
        label.padding = "10,10,10,10";
        label.bgColor = "#16263a";
        label.borderColor = "#35506d";
        this.owner.addChild(label);

        this.owner.addChild(this.createPaddingOverlay(label));
        this.owner.addChild(this.createNote(`padding=${label.padding}，绿色框是内容区，黄色十字是内容原点。`));

        const zeroHeightLabel = this.createMsdfLabel("overflow=hidden 且 height=0 时不应该再看到任何文字。");
        zeroHeightLabel.x = PANEL_X + CONTENT_PADDING;
        zeroHeightLabel.y = PANEL_Y + CONTENT_PADDING + 168;
        zeroHeightLabel.font = "demo-msdf";
        zeroHeightLabel.fontSize = 28;
        zeroHeightLabel.wordWrap = true;
        zeroHeightLabel.overflow = "hidden";
        zeroHeightLabel.size(290, 0);
        zeroHeightLabel.padding = "10,10,10,10";
        zeroHeightLabel.bgColor = "#16263a";
        zeroHeightLabel.borderColor = "#35506d";
        this.owner.addChild(zeroHeightLabel);

        this.owner.addChild(this.createPaddingOverlay(zeroHeightLabel));
        this.owner.addChild(this.createZeroHeightNote("overflow=hidden + height=0：应完全不渲染文本。"));
    }

    private createMsdfLabel(text: string): MsdfLabel {
        const label = new MsdfLabel(text);
        label.color = "#d9e7f5";
        label.leading = 6;
        return label;
    }

    private createPaddingOverlay(label: MsdfLabel): Laya.Sprite {
        const overlay = new Laya.Sprite();
        const [top, right, bottom, left] = parsePadding(label.padding);
        const contentWidth = Math.max(label.width - left - right, 0);
        const contentHeight = Math.max(label.height - top - bottom, 0);

        overlay.pos(label.x, label.y);
        overlay.mouseEnabled = false;
        overlay.graphics.drawRect(0, 0, label.width, label.height, null, "#ff6b6b", 2);
        overlay.graphics.drawRect(left, top, contentWidth, contentHeight, null, "#52d273", 2);
        overlay.graphics.drawLine(left - 6, top, left + 6, top, "#ffd166", 2);
        overlay.graphics.drawLine(left, top - 6, left, top + 6, "#ffd166", 2);
        return overlay;
    }

    private createNote(text: string): Laya.Label {
        const note = new Laya.Label();
        note.text = text;
        note.fontSize = 22;
        note.color = "#9fb7cf";
        note.width = 640;
        note.wordWrap = true;
        note.leading = 6;
        note.pos(PANEL_X + CONTENT_PADDING, PANEL_Y + CONTENT_PADDING + 96);
        return note;
    }

    private createZeroHeightNote(text: string): Laya.Label {
        const note = new Laya.Label();
        note.text = text;
        note.fontSize = 22;
        note.color = "#9fb7cf";
        note.width = 640;
        note.wordWrap = true;
        note.leading = 6;
        note.pos(PANEL_X + CONTENT_PADDING, PANEL_Y + CONTENT_PADDING + 208);
        return note;
    }
}
