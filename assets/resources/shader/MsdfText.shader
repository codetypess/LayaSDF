Shader3D Start
{
    type:Shader3D,
    name:MsdfTextShader,
    enableInstancing:true,
    supportReflectionProbe:false,
    shaderType:2,
    uniformMap:{
        u_AtlasSize: { type: Vector2, default: [256, 256] },
        u_DistanceRange: { type: Float, default: 4.0 }
    },
    attributeMap: {
        a_posuv: Vector4,
        a_attribColor: Vector4,
        a_attribFlags: Vector4,
        a_msdfFillColor: Vector4,
        a_msdfOutlineColor: Vector4,
        a_msdfGlowColor: Vector4,
        a_msdfShadowColor: Vector4,
        a_msdfPackedParamsA: Vector4,
    },
    defines: {
        TEXTUREVS: { type: bool, default: true }
    }
    shaderPass:[
        {
            pipeline:Forward,
            VS:textureVS,
            FS:msdfPS
        }
    ]
}
Shader3D End

GLSL Start
#defineGLSL textureVS

    #define SHADER_NAME MsdfTextShader
    #include "Sprite2DVertex.glsl";

    varying vec4 v_msdfFillColor;
    varying vec4 v_msdfOutlineColor;
    varying vec4 v_msdfGlowColor;
    varying vec4 v_msdfShadowColor;
    varying vec4 v_msdfPackedParamsA;
    varying vec3 v_msdfPackedParamsB;

    void main() {
        vertexInfo info;
        getVertexInfo(info);

        v_cliped = info.cliped;
        v_texcoordAlpha = info.texcoordAlpha;
        v_useTex = info.useTex;
        v_color = info.color;
        v_msdfFillColor = a_msdfFillColor;
        v_msdfOutlineColor = a_msdfOutlineColor;
        v_msdfGlowColor = a_msdfGlowColor;
        v_msdfShadowColor = a_msdfShadowColor;
        v_msdfPackedParamsA = a_msdfPackedParamsA;
        v_msdfPackedParamsB = a_attribFlags.yzw;

        vec4 pos;
        getPosition(pos);
        gl_Position = pos;
    }

#endGLSL

#defineGLSL msdfPS
    #define SHADER_NAME MsdfTextShader

    #if defined(GL_FRAGMENT_PRECISION_HIGH)
        precision highp float;
    #else
        precision mediump float;
    #endif

    #ifdef GL_OES_standard_derivatives
        #extension GL_OES_standard_derivatives : enable
    #endif

    #include "Sprite2DFrag.glsl";

    varying vec4 v_msdfFillColor;
    varying vec4 v_msdfOutlineColor;
    varying vec4 v_msdfGlowColor;
    varying vec4 v_msdfShadowColor;
    varying vec4 v_msdfPackedParamsA;
    varying vec3 v_msdfPackedParamsB;

    const float PACKED_EFFECT_SIZE_MAX = 32.0;
    const float PACKED_FACE_DILATE_MAX = 16.0;
    const float SHADOW_OFFSET_INV_SCALE = 0.25;

    float median3(float r, float g, float b) {
        return max(min(r, g), min(max(r, g), b));
    }

    float screenPxRange(vec2 texcoord) {
        // 把图集空间里的 distance range 换算成当前屏幕空间里的像素宽度。
        vec2 unitRange = vec2(u_DistanceRange) / u_AtlasSize;
        vec2 screenTexSize = vec2(1.0) / max(fwidth(texcoord), vec2(0.0001));
        return max(0.5 * dot(unitRange, screenTexSize), 1.0);
    }

    float unpackSignedNormalizedByte(float value, float maxValue) {
        float raw = floor(value * 255.0 + 0.5);
        if (raw > 127.0) {
            raw -= 256.0;
        }

        return raw / 127.0 * maxValue;
    }

    float unpackSignedByte(float value) {
        float raw = floor(value + 0.5);
        if (raw > 127.0) {
            raw -= 256.0;
        }

        return raw;
    }

    void main() {
        clip();

        vec2 texcoord = v_texcoordAlpha.xy;
        float safeDistanceRange = max(u_DistanceRange, 0.0001);
        // MSDF 的 RGB 存的是距离值，取 median 后可以恢复出边缘的有符号距离。
        vec3 msdf = texture2D(u_spriteTexture, texcoord).rgb;
        float sd = median3(msdf.r, msdf.g, msdf.b);
        float pxRange = screenPxRange(texcoord);
        float fieldToScreenPx = pxRange / safeDistanceRange;
        float fieldDistance = (sd - 0.5) * safeDistanceRange;

        vec4 fillColor = v_msdfFillColor;
        vec4 outlineColor = v_msdfOutlineColor;
        vec4 glowColor = v_msdfGlowColor;
        vec4 shadowColor = v_msdfShadowColor;
        float effectFlags = floor(v_msdfPackedParamsB.z + 0.5);
        bool hasOutline = mod(effectFlags, 2.0) > 0.5;
        bool hasGlow = mod(floor(effectFlags / 2.0), 2.0) > 0.5;
        bool hasShadow = mod(floor(effectFlags / 4.0), 2.0) > 0.5;
        float outlineWidth = hasOutline ? v_msdfPackedParamsA.x * PACKED_EFFECT_SIZE_MAX : 0.0;
        float glowSize = hasGlow ? v_msdfPackedParamsA.y * PACKED_EFFECT_SIZE_MAX : 0.0;
        float shadowBlur = hasShadow ? v_msdfPackedParamsA.z * PACKED_EFFECT_SIZE_MAX : 0.0;
        float faceDilate = unpackSignedNormalizedByte(v_msdfPackedParamsA.w, PACKED_FACE_DILATE_MAX);
        vec2 shadowOffset = vec2(
            unpackSignedByte(v_msdfPackedParamsB.x),
            unpackSignedByte(v_msdfPackedParamsB.y)
        ) * SHADOW_OFFSET_INV_SCALE;

        // 这里开始统一使用“距离场单位”描述效果宽度。
        // faceDilate / outline / glow / shadowBlur / shadowOffset 都会随字号一起缩放。
        float shapeFieldDistance = fieldDistance - faceDilate;
        float strokeFieldDistance = shapeFieldDistance + outlineWidth;
        float fillAlpha = clamp(fieldToScreenPx * shapeFieldDistance + 0.5, 0.0, 1.0);
        float strokeAlpha = clamp(fieldToScreenPx * strokeFieldDistance + 0.5, 0.0, 1.0);
        float outlineAlpha = max(strokeAlpha - fillAlpha, 0.0);
        float glowAlpha = 0.0;
        if (glowSize > 0.0 && glowColor.a > 0.0) {
            float outsideFieldDistance = max(-strokeFieldDistance, 0.0);
            glowAlpha = (1.0 - smoothstep(0.0, glowSize, outsideFieldDistance)) * (1.0 - strokeAlpha);
        }

        float shadowAlpha = 0.0;
        if (shadowColor.a > 0.0 && (shadowBlur > 0.0 || shadowOffset.x != 0.0 || shadowOffset.y != 0.0)) {
            vec2 shadowOffsetScreen = shadowOffset * fieldToScreenPx;
            // 阴影偏移也改成距离场单位，再换算回当前屏幕尺度。
            vec2 shadowTexcoord =
                texcoord - (dFdx(texcoord) * shadowOffsetScreen.x - dFdy(texcoord) * shadowOffsetScreen.y);
            vec3 shadowMsdf = texture2D(u_spriteTexture, shadowTexcoord).rgb;
            float shadowSd = median3(shadowMsdf.r, shadowMsdf.g, shadowMsdf.b);
            float shadowPxRange = screenPxRange(shadowTexcoord);
            float shadowFieldToScreenPx = shadowPxRange / safeDistanceRange;
            float shadowFieldDistance = (shadowSd - 0.5) * safeDistanceRange;
            float shadowShapeFieldDistance = shadowFieldDistance - faceDilate + outlineWidth;
            shadowAlpha = shadowBlur > 0.0
                ? smoothstep(-shadowBlur, shadowBlur, shadowShapeFieldDistance)
                : clamp(shadowFieldToScreenPx * shadowShapeFieldDistance + 0.5, 0.0, 1.0);
            shadowAlpha *= (1.0 - strokeAlpha);
        }

        vec4 color = shadowColor * shadowAlpha + glowColor * glowAlpha + outlineColor * outlineAlpha + fillColor * fillAlpha;

        setglColor(color);
    }

#endGLSL
GLSL End
