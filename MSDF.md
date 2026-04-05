# MSDF Workflow

Current demo resources:

- Atlas: `assets/resources/msdf/msdf-demo.png`
- Font data: `assets/resources/msdf/source-han-sans-cn-medium.json`
- Charset: `assets/resources/msdf/demo-charset.txt`
- Shader: `assets/shaders/MsdfText.shader`
- Runtime code: `src/msdf/MsdfText.ts`

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
- If you change file names, let the editor generate new `.meta` files and update the resource URLs in `src/Main.ts`.
- The charset file should contain every character you want in the atlas. Missing characters will fall back to spacing only at runtime.
