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
        a_msdfParams: Float,
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
    varying float v_msdfParams;

    void main() {
        vertexInfo info;
        getVertexInfo(info);

        v_cliped = info.cliped;
        v_texcoordAlpha = info.texcoordAlpha;
        v_useTex = info.useTex;
        v_color = info.color;
        v_msdfFillColor = a_msdfFillColor;
        v_msdfOutlineColor = a_msdfOutlineColor;
        v_msdfParams = a_msdfParams;

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
    varying float v_msdfParams;

    float median3(float r, float g, float b) {
        return max(min(r, g), min(max(r, g), b));
    }

    float screenPxRange(vec2 texcoord) {
        vec2 unitRange = vec2(u_DistanceRange) / u_AtlasSize;
        vec2 screenTexSize = vec2(1.0) / max(fwidth(texcoord), vec2(0.0001));
        return max(0.5 * dot(unitRange, screenTexSize), 1.0);
    }

    void main() {
        clip();

        vec2 texcoord = v_texcoordAlpha.xy;
        vec3 msdf = texture2D(u_spriteTexture, texcoord).rgb;
        float sd = median3(msdf.r, msdf.g, msdf.b);
        float screenDistance = screenPxRange(texcoord) * (sd - 0.5);

        vec4 fillColor = v_msdfFillColor;
        vec4 outlineColor = v_msdfOutlineColor;
        float outlineWidth = v_msdfParams;

        float fillAlpha = clamp(screenDistance + 0.5, 0.0, 1.0);
        float strokeAlpha = clamp(screenDistance + outlineWidth + 0.5, 0.0, 1.0);
        float outlineAlpha = max(strokeAlpha - fillAlpha, 0.0);

        vec4 color = outlineColor * outlineAlpha + fillColor * fillAlpha;

        setglColor(color);
    }

#endGLSL
GLSL End
