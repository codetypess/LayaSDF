# MSDF Workflow

Current demo resources:

- Atlas: `assets/resources/msdf/msdf-demo.png`
- Font data: `assets/resources/msdf/source-han-sans-cn-medium.json`
- Charset: `assets/resources/msdf/demo-charset.txt`
- Shader: `assets/shaders/MsdfText.shader`
- Runtime code: `src/msdf/MsdfText.ts`
- UI component: `src/msdf/MsdfLabel.ts`

Use `MsdfLabel` like a regular `Label`:

```ts
import { MsdfLabel } from "./msdf/MsdfLabel";

const label = new MsdfLabel("MSDF 文本");
label.fontSize = 32;
label.color = "#ffffff";
label.stroke = 1.5;
label.strokeColor = "#000000";
label.wordWrap = true;
label.leading = 8;
label.letterSpacing = 1;
label.padding = "8,12,8,12";
label.align = "center";
label.valign = "middle";
label.bgColor = "#1a2736";
label.borderColor = "#3b546d";
label.size(320, 96);
this.owner.addChild(label);
```

Supported common properties:

- `text`
- `fontSize`
- `color`
- `stroke`
- `strokeColor`
- `wordWrap`
- `leading`
- `letterSpacing`
- `padding`
- `align`
- `valign`
- `bgColor`
- `borderColor`
- `fontTextureUrl`
- `fontJsonUrl`
- `fontShaderUrl`

Regenerate the demo atlas:

```bash
node scripts/generate-msdf-font.mjs \
  --font assets/resources/source-han-sans-cn-medium.ttf \
  --charset assets/resources/msdf/demo-charset.txt \
  --texture-out assets/resources/msdf/msdf-demo.png \
  --json-out assets/resources/msdf/source-han-sans-cn-medium.json
```

Notes:

- If you only overwrite the existing png/json, the current `.meta` files and `res://` references can stay unchanged.
- If you change file names, let the editor generate new `.meta` files and update the resource URLs in `src/msdf/MsdfLabel.ts` or set `fontTextureUrl` / `fontJsonUrl` / `fontShaderUrl` at runtime.
- The charset file should contain every character you want in the atlas. Missing characters will fall back to spacing only at runtime.
