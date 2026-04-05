import { MsdfBitmapFont, rgba } from "./msdf/MsdfText";

const { regClass } = Laya;

const MSDF_SHADER_URL = "res://66e84b33-56bf-4d18-97d1-4239936447c2";
const MSDF_ATLAS_URL = "res://40ae4c4f-c490-4311-99f2-d7b00cd1976b";
const MSDF_FONT_JSON_URL = "res://bb450ed1-6826-4998-b470-d77a2462095a";

@regClass()
export class Main extends Laya.Script {

    async onStart() {
        Laya.stage.bgColor = "#0f1722";

        await Laya.loader.load(MSDF_SHADER_URL);
        const shader = Laya.Shader3D.find("MsdfTextShader");

        if (!shader) {
            throw new Error(`MSDF shader failed to load: ${MSDF_SHADER_URL}`);
        }

        const font = await MsdfBitmapFont.load(MSDF_ATLAS_URL, MSDF_FONT_JSON_URL);

        this.owner.addChild(this.createPanel());

        // const titleShadow = font.createText({
        //     text: "MSDF文字演示",
        //     fontSize: 86,
        //     textColor: rgba(0.0, 0.0, 0.0, 0.32),
        //     outlineColor: rgba(0.0, 0.0, 0.0, 0.32),
        //     outlineWidth: 0.0
        // });
        // titleShadow.pos(85, 88);
        // this.owner.addChild(titleShadow);

        const title = font.createText({
            text: "MSDF文字演示",
            fontSize: 86,
            textColor: rgba(0.98, 0.89, 0.56, 1.0),
            outlineColor: rgba(0.14, 0.20, 0.29, 1.0),
            outlineWidth: 2.2
        });
        title.pos(80, 82);
        this.owner.addChild(title);

        // const sampleShadow = font.createText({
        //     text: "沉浸描边阴影0123456789",
        //     fontSize: 54,
        //     textColor: rgba(0.0, 0.0, 0.0, 0.28),
        //     outlineColor: rgba(0.0, 0.0, 0.0, 0.28),
        //     outlineWidth: 0.0
        // });
        // sampleShadow.pos(83, 193);
        // this.owner.addChild(sampleShadow);

        const sample = font.createText({
            text: "沉浸描边阴影0123456789",
            fontSize: 54,
            textColor: rgba(0, 0, 0, 1.0),
            outlineColor: rgba(0, 1, 1, 1.0),
            outlineWidth: 2
        });
        sample.pos(80, 188);
        this.owner.addChild(sample);

        const note = new Laya.Label();
        note.text = "字集来自示例子集，资源为离线生成的 MSDF atlas。";
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
