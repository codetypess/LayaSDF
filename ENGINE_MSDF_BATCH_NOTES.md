# LayaAir 3.2.8 MSDF Batch Notes

## Root Cause

The 3.2.8 2D pipeline already uses `a_attribColor` as built-in tint and alpha input:

- `tmp/LayaAir/src/layaAir/laya/webgl/shader/d2/NewShader/Sprite2DVertex.glsl`
  - `info.color = a_attribColor;`
  - `info.color.a *= u_VertAlpha;`
  - `info.color.xyz *= info.color.w;`
- `tmp/LayaAir/src/layaAir/laya/webgl/shader/d2/NewShader/Sprite2DFrag.glsl`
  - `color.a *= v_color.w;`
  - `color.rgb *= transColor.rgb;`

So `a_attribColor` cannot carry a custom MSDF style index. Any node alpha, tint, or filter changes will corrupt the payload.

## Minimal Engine Patch

Use the existing spare `a_attribFlags` lanes as dedicated per-draw payload:

- `a_attribFlags.g`: `styleIndex`
- `a_attribFlags.b`: `outlineWidth`

### 1. Graphics / DrawTrianglesCmd / Context

Extend the draw-triangle path with an extra style payload:

- `tmp/LayaAir/src/layaAir/laya/display/Graphics.ts`
- `tmp/LayaAir/src/layaAir/laya/display/cmd/DrawTrianglesCmd.ts`
- `tmp/LayaAir/src/layaAir/laya/renders/Context.ts`

Suggested new signature:

```ts
drawTriangles(
    texture: Texture,
    x: number,
    y: number,
    vertices: Float32Array,
    uvs: Float32Array,
    indices: Uint16Array,
    matrix: Matrix | null = null,
    alpha: number = 1,
    color: string | number | number[] = null,
    blendMode: string | null = null,
    styleIndex: number = 0,
    outlineWidth: number = 0
): DrawTrianglesCmd
```

Thread `styleIndex` and `outlineWidth` through `DrawTrianglesCmd.run()` into `Context.drawTriangles(...)`.

Add a static engine marker so project code can safely detect whether the patch is present:

```ts
DrawTrianglesCmd.STYLE_PAYLOAD_VERSION = 1;
```

### 2. MeshTexture Vertex Fill

Patch:

- `tmp/LayaAir/src/layaAir/laya/webgl/utils/MeshTexture.ts`

Today only `a_attribFlags.r` is written:

```ts
vbdata[f32pos + 8] = 0xff;
```

Change it to:

```ts
vbdata[f32pos + 8] = 0xff;      // useTex
vbdata[f32pos + 9] = styleIndex;
vbdata[f32pos + 10] = outlineWidth;
vbdata[f32pos + 11] = 0.0;
```

And pass both values into `addData(...)`.

### 3. MSDF Shader

Keep the MSDF fill/stroke data in a shared style texture, but decode the style index directly from `a_attribFlags.g` in the custom MSDF vertex shader. No engine-wide shader include patch is required.

Fragment-side example:

```glsl
varying float v_styleIndex;
varying float v_outlineWidth;

float styleX = (v_styleIndex + 0.5) / u_StyleTextureSize.x;
vec4 fillStyle = texture2D(u_StyleTexture, vec2(styleX, 0.5 / u_StyleTextureSize.y));
vec4 outlineStyle = texture2D(u_StyleTexture, vec2(styleX, 1.5 / u_StyleTextureSize.y));
float outlineWidth = v_outlineWidth;
```

Then still finish with:

```glsl
setglColor(color);
```

That preserves:

- node alpha
- parent alpha
- built-in tint
- color filters
- clip path

## Why This Is The Right 3.2.8 Fix

`MeshTexture` already allocates a full `a_attribFlags: vec4` slot in the vertex layout, but 3.2.8 only consumes `.r` for `useTex`.
So using `.g/.b` for MSDF style payload is the smallest possible engine patch that keeps the existing 2D batch path intact, while leaving `a_attribColor` untouched for built-in tint and alpha.
