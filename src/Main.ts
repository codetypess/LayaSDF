import { MsdfLabel } from "./msdf/MsdfLabel";

const { regClass } = Laya;

@regClass()
export class Main extends Laya.Script {

    onStart() {
        Laya.stage.bgColor = "#0f1722";

        this.owner.addChild(this.createPanel());

        const title = new MsdfLabel("MSDF文字演示");
        title.fontSize = 86;
        title.color = "#f9e38f";
        title.strokeColor = "#0d906b";
        title.stroke = 4;
        title.glow = 5;
        title.glowColor = "#e5e830cc";
        title.shadowColor = "#041520cc";
        title.shadowBlur = 2;
        title.shadowOffsetX = 6;
        title.shadowOffsetY = 6;
        title.pos(80, 30);
        this.owner.addChild(title);

        const sectionTitle = new Laya.Label();
        sectionTitle.text = "描边对比：统一 stroke = 3，观察 20 / 25 / 30 / 35 / 40 / 45";
        sectionTitle.fontSize = 22;
        sectionTitle.color = "#bae7fa";
        sectionTitle.font = "resources/source-han-sans-cn-medium.ttf";
        sectionTitle.pos(84, 130);
        this.owner.addChild(sectionTitle);

        const sizes = [20, 25, 30, 35, 40, 45];
        // const strokes = [1.5, 2.5, 3, 3, 3, 3];
        const strokes = [0,0,0,3,3,3];
        const strokeColors = ["#f44336", "#ff9800", "#ffeb3b", "#4caf50", "#2196f3", "#9c27b0"];
        let leftY = 170;

        for (let i = 0; i < sizes.length; i++) {
            const fontSize = sizes[i];
            const sample = this.createSampleLabel(fontSize, strokes[i], strokeColors[i]);
            sample.pos(84, leftY);
            this.owner.addChild(sample);

            leftY += fontSize + 20;
        }

        const wrapped = new MsdfLabel("MSDFLabel 现已支持 <font color=\"#f9e38f\" size=\"34\">HTML 富文本</font>、<i>斜体</i>、<u>下划线</u>、<strike>删除线</strike> 和自动换行。");
        wrapped.html = true;
        wrapped.fontSize = 28;
        wrapped.color = "#dbe8f2";
        wrapped.strokeColor = "#11212e";
        wrapped.stroke = 1.2;
        // wrapped.glow = 2;
        // wrapped.glowColor = "#ff4000";
        wrapped.shadowColor = "#020617cc";
        wrapped.shadowBlur = 0;
        wrapped.shadowOffsetX = 2;
        wrapped.shadowOffsetY = 2;
        wrapped.bgColor = "#1a2736";
        wrapped.borderColor = "#3b546d";
        wrapped.wordWrap = true;
        wrapped.leading = 14;
        wrapped.letterSpacing = 1;
        wrapped.padding = "12,16,12,16";
        wrapped.align = "left";
        wrapped.valign = "middle";
        wrapped.size(640, 118);
        wrapped.pos(84, 490);
        this.owner.addChild(wrapped);

        const note = new Laya.Label();
        note.text = "富文本使用方式与 Laya Label 一致：文本放在 text，配合 html=true 或 ubb=true。";
        note.fontSize = 20;
        note.color = "#9cb4c7";
        note.pos(84, 602);
        this.owner.addChild(note);
    }

    private createSampleLabel(fontSize: number, stroke: number, strokeColor: string): MsdfLabel {
        const sample = new MsdfLabel(`${fontSize}px 我们沉浸描边影响测试演示繁鼻 0123 S=${stroke}`);
        sample.fontSize = fontSize;
        sample.color = "#bae7fa";
        sample.strokeColor = strokeColor;
        sample.stroke = stroke;
        sample.underline = true;
        sample.bold = true;
        return sample;
    }

    private createPanel(): Laya.Sprite {
        const panel = new Laya.Sprite();
        panel.graphics.drawRect(24, 24, 1040, 600, "#162132", "#2e4259", 2);
        panel.graphics.drawRect(24, 480, 1040, 1, "#2a3b4f");
        return panel;
    }
}
