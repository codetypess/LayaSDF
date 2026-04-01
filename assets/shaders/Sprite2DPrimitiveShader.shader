Shader3D Start
{
    type:Shader3D,
    name:Sprite2DPrimitiveShader,
    enableInstancing:true,
    supportReflectionProbe:true,
    shaderType:2,
    uniformMap:{

    },
    attributeMap: {
        a_position : Vector4,
        a_attribColor : Vector4,
    },
    defines: {
        PRIMITIVEMESH: { type: bool, default: true }
    }
    shaderPass:[
        {
            pipeline:Forward,
            VS:primitiveVS,
            FS:primitivePS
        }
    ]
}
Shader3D End

GLSL Start
#defineGLSL primitiveVS

    #define SHADER_NAME Sprite2DPrimitiveShader
    #define PRIMITIVEMESH
    #include "Sprite2DVertex.glsl";


    #ifdef WORLDMAT
        uniform mat4 mmat;
    #endif

    void main(){
        vertexInfo info;
        getVertexInfo(info);
        
        //Update 
        v_color = info.color;
        v_cliped = info.cliped;
        
        vec4 pos;
        
        getPosition(pos);
        gl_Position = pos;
    }

#endGLSL

#defineGLSL primitivePS
    #define SHADER_NAME Sprite2DPrimitiveShader
    #define PRIMITIVEMESH
    precision mediump float;

    #include "Sprite2DFrag.glsl";

    void main(){
        clip();
        gl_FragColor = getGlColor(v_color);
        gl_FragColor.rgb*=gl_FragColor.a;
    }
    
#endGLSL
GLSL End


