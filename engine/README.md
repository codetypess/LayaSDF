# Engine Notes

This project now keeps the compiled LayaAir engine libraries in [libs](/Users/codetypess/Desktop/Github/LayaSDF/engine/libs).

Current setup:

- Runtime libraries: [engine/libs](/Users/codetypess/Desktop/Github/LayaSDF/engine/libs)
- Project type declarations: [engine/types](/Users/codetypess/Desktop/Github/LayaSDF/engine/types)
- Local engine source workspace used for patching and rebuilding: [tmp/LayaAir](/Users/codetypess/Desktop/Github/LayaSDF/tmp/LayaAir)

MSDF-related custom patch:

- The current patch adds per-draw `styleIndex` and `outlineWidth` payloads to the 2D `drawTriangles` pipeline.
- Source patch points are:
  - [Graphics.ts](/Users/codetypess/Desktop/Github/LayaSDF/tmp/LayaAir/src/layaAir/laya/display/Graphics.ts)
  - [DrawTrianglesCmd.ts](/Users/codetypess/Desktop/Github/LayaSDF/tmp/LayaAir/src/layaAir/laya/display/cmd/DrawTrianglesCmd.ts)
  - [Context.ts](/Users/codetypess/Desktop/Github/LayaSDF/tmp/LayaAir/src/layaAir/laya/renders/Context.ts)
  - [MeshTexture.ts](/Users/codetypess/Desktop/Github/LayaSDF/tmp/LayaAir/src/layaAir/laya/webgl/utils/MeshTexture.ts)

How to rebuild and refresh the local libraries:

```bash
cd tmp/LayaAir
npm install
npm run build
mkdir -p ../../engine/libs
cp -R build/libs/. ../../engine/libs/
```

Notes:

- `engine/libs` is the compiled output snapshot kept with this project for convenience.
- The editable engine source is still `tmp/LayaAir`; do not patch `engine/libs` directly unless you intentionally want to hand-edit built output.
- The project-side MSDF runtime will only enable the batched style path when the patched engine is present. The engine marker is `DrawTrianglesCmd.STYLE_PAYLOAD_VERSION = 1`.
- More background is documented in [ENGINE_MSDF_BATCH_NOTES.md](/Users/codetypess/Desktop/Github/LayaSDF/ENGINE_MSDF_BATCH_NOTES.md).
