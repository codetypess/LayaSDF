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
        title.strokeColor = "#243347";
        title.stroke = 2.2;
        title.pos(80, 82);
        this.owner.addChild(title);

        const sample = new MsdfLabel("沉浸描边阴影0123456789");
        sample.fontSize = 54;
        sample.color = "#bae7fa";
        sample.strokeColor = "#102336";
        sample.stroke = 1.6;
        sample.pos(80, 188);
        this.owner.addChild(sample);

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
        wrapped.size(420, 104);
        wrapped.pos(330, 228);
        this.owner.addChild(wrapped);

        const note = new Laya.Label();
        note.text = "MsdfLabel 已接成 UIComponent，当前示例字集仍是离线生成的子集。";
        note.fontSize = 24;
        note.color = "#9cb4c7";
        note.pos(82, 278);
        this.owner.addChild(note);
    }

    private createPanel(): Laya.Sprite {
        const panel = new Laya.Sprite();
        panel.graphics.drawRect(48, 48, 720, 300, "#162132", "#2e4259", 2);
        panel.graphics.drawRect(48, 312, 720, 1, "#2a3b4f");
        return panel;
    }
}
