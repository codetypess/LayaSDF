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
        title.pos(80, 30);
        this.owner.addChild(title);

        const sectionTitle = new Laya.Label();
        sectionTitle.text = "描边对比：统一 stroke = 3，观察 20 / 25 / 30 / 35 / 40 / 45";
        sectionTitle.fontSize = 22;
        sectionTitle.color = "#9cb4c7";
        sectionTitle.font = "resources/source-han-sans-cn-medium.ttf";
        sectionTitle.pos(84, 130);
        this.owner.addChild(sectionTitle);

        const sizes = [20, 25, 30, 35, 40, 45];
        const strokes = [2, 2.5, 3, 3, 3, 3];
        // const strokes = [0,0,0,0,0,0];
        let leftY = 170;

        for (let i = 0; i < sizes.length; i++) {
            const fontSize = sizes[i];
            const sample = this.createSampleLabel(fontSize, strokes[i]);
            sample.pos(84, leftY);
            this.owner.addChild(sample);

            leftY += fontSize + 20;
        }

        const wrapped = new MsdfLabel("MSDFLabel 组件支持基础对齐、描边和自动换行。");
        wrapped.fontSize = 28;
        wrapped.color = "#dbe8f2";
        wrapped.strokeColor = "#11212e";
        wrapped.stroke = 1.2;
        wrapped.bgColor = "#1a2736";
        wrapped.borderColor = "#3b546d";
        wrapped.wordWrap = true;
        wrapped.leading = 10;
        wrapped.letterSpacing = 1;
        wrapped.padding = "12,16,12,16";
        wrapped.align = "center";
        wrapped.valign = "middle";
        wrapped.size(640, 96);
        wrapped.pos(84, 490);
        this.owner.addChild(wrapped);

        const note = new Laya.Label();
        note.text = "都使用同一套 MSDF 字图，仅字号不同，方便观察 distance-range / padding 对粗描边的影响。";
        note.fontSize = 20;
        note.color = "#9cb4c7";
        note.pos(84, 600);
        this.owner.addChild(note);
    }

    private createSampleLabel(fontSize: number, stroke: number): MsdfLabel {
        const sample = new MsdfLabel(`${fontSize}px 我们沉浸描边影响测试 0123 S=${stroke}`);
        sample.fontSize = fontSize;
        sample.color = "#bae7fa";
        sample.strokeColor = "#bd0b0b";
        sample.stroke = stroke;
        return sample;
    }

    private createPanel(): Laya.Sprite {
        const panel = new Laya.Sprite();
        panel.graphics.drawRect(24, 24, 1040, 600, "#162132", "#2e4259", 2);
        panel.graphics.drawRect(24, 480, 1040, 1, "#2a3b4f");
        return panel;
    }
}
