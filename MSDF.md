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
label.glow = 6;
label.glowColor = "#7dd3fc99";
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
- `html`
- `ubb`
- `fontSize`
- `color`
- `stroke`
- `strokeColor`
- `glow`
- `glowColor`
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

Rich text follows the same usage style as `Laya.Label`: keep the markup in `text`, then enable `html` or `ubb`.

```ts
const rich = new MsdfLabel("支持 <font color=\"#f9e38f\" size=\"36\">HTML</font>、<i>斜体</i>、<u>下划线</u>");
rich.html = true;

const ubb = new MsdfLabel("[color=#7dd3fc]UBB[/color] [u]也可用[/u]");
ubb.ubb = true;
```

Current rich-text rendering supports:

- per-run `color`
- per-run `size`
- `b` / `i` (simulated with horizontal scale / skew)
- `u`
- `strike`
- paragraph/text align inherited from the parsed style

Regenerate the demo atlas:

```bash
node scripts/generate-msdf-font.mjs \
  --font assets/resources/source-han-sans-cn-medium.ttf \
  --charset assets/resources/msdf/demo-charset.txt \
  --padding 8 \
  --distance-range 8 \
  --texture-out assets/resources/msdf/msdf-demo.png \
  --json-out assets/resources/msdf/source-han-sans-cn-medium.json
```

Notes:

- If you only overwrite the existing png/json, the current `.meta` files and `res://` references can stay unchanged.
- If you change file names, let the editor generate new `.meta` files and update the resource URLs in `src/msdf/MsdfLabel.ts` or set `fontTextureUrl` / `fontJsonUrl` / `fontShaderUrl` at runtime.
- The charset file should contain every character you want in the atlas. Missing characters will fall back to spacing only at runtime.
- `scripts/generate-msdf-font.mjs` now post-processes the atlas/json and injects a dedicated decoration glyph for underline and strikethrough. You do not need to keep that glyph in the charset file.
- For smaller text with thicker outlines, keep `padding` and `distance-range` conservative. The demo preset is now `padding 8 / distance-range 8` to avoid per-glyph background artifacts around `fontSize=30, stroke=3`.
- In LayaAir 3.2.x, `a_attribColor` is part of the built-in 2D tint and alpha path, so it cannot safely carry custom per-label style data.
- `src/msdf/MsdfText.ts` now includes a compatibility fallback:
  - old/unpatched engines keep using per-sprite uniforms
  - engines patched with `DrawTrianglesCmd.STYLE_PAYLOAD_VERSION = 1` automatically switch to shared-material style batching
