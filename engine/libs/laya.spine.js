(function (exports, Laya) {
    'use strict';

    class ExternalSkin {
        get source() {
            return this._source;
        }
        set source(value) {
            this._source = value;
            if (value) {
                Laya.ILaya.loader.load(value, Laya.Loader.SPINE).then((templet) => {
                    if (!this._source || templet && !templet.isCreateFromURL(this._source))
                        return;
                    this.templet = templet;
                });
            }
            else
                this.templet = null;
        }
        get items() {
            return this._items;
        }
        set items(value) {
            this._items = value;
        }
        get templet() {
            return this._templet;
        }
        set templet(value) {
            this.init(value);
        }
        init(templet) {
            this._templet = templet;
            if (!this._templet) {
                return;
            }
            this.flush();
        }
        flush() {
            var _a;
            if (this.target && this.target.templet && this._items && this._templet && this._templet.skeletonData) {
                if (null == this.target.templet._textures)
                    return;
                for (let i = this._items.length - 1; i >= 0; i--) {
                    let o = this._items[i];
                    let attachmentStr = o.attachment;
                    let slot = o.slot;
                    let skinStr = o.skin;
                    if (attachmentStr && slot && skinStr) {
                        let attachment = null;
                        let skins = this._templet.skeletonData.skins;
                        for (let j = skins.length - 1; j >= 0; j--) {
                            if (skins[j].name == skinStr) {
                                let skin = skins[j];
                                let attachments = skin.attachments;
                                for (let j = attachments.length - 1; j >= 0; j--) {
                                    attachment = (_a = attachments[j]) === null || _a === void 0 ? void 0 : _a[attachmentStr];
                                    if (attachment) {
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                        if (attachment) {
                            let regionPage = attachment.region.page;
                            this.target.templet._textures[regionPage.name] = regionPage.texture;
                            let slotObj = this.target.getSkeleton().findSlot(slot);
                            if (slotObj) {
                                slotObj.setAttachment(attachment);
                            }
                            this.target.changeNormal();
                        }
                    }
                }
            }
        }
    }

    class ExternalSkinItem {
        get skin() {
            return this._skin;
        }
        set skin(value) {
            this._skin = value;
        }
        get slot() {
            return this._slot;
        }
        set slot(value) {
            this._slot = value;
        }
        get attachment() {
            return this._attachment;
        }
        set attachment(value) {
            this._attachment = value;
        }
    }

    var spineVertex = "#if !defined(SpineVertex_lib)\n    #define SpineVertex_lib\n\n#ifdef SPINE_SIMPLE\n    uniform vec4 u_SimpleAnimatorParams;\n    uniform sampler2D u_SimpleAnimatorTexture;\n    uniform float u_SimpleAnimatorTextureSize;\n\n    vec4 getBonePosBake(float FramePos, float boneIndices , float weight , vec2 pos , float offset){\n        vec2 uv = vec2(0.0,0.0);\n        //float 2 * 4\n        float PixelPos = FramePos + boneIndices * 2.0;\n        float halfOffset = offset * 0.5;\n        float uvoffset = PixelPos / u_SimpleAnimatorTextureSize;\n\n        uv.y = floor(uvoffset) * offset + halfOffset;\n        uv.x = mod(PixelPos, u_SimpleAnimatorTextureSize) * offset + halfOffset;\n        \n        vec4 up = texture2D(u_SimpleAnimatorTexture, uv);\n        uv.x += offset;\n        vec4 down = texture2D(u_SimpleAnimatorTexture, uv);\n        // vec4 up = vec4(1.0,1.0 ,1.0 ,0.0 );\n        // vec4 down = vec4( 1.0,1.0 ,1.0 ,0.0 );\n        float x = pos.x*up.x + pos.y*up.y +up.z;\n        float y = pos.x*down.x + pos.y*down.y +down.z;\n        pos.x=x*weight;\n        pos.y=y*weight;\n        return vec4(pos,0.,1.0);\n    }\n#endif\n\n#if defined(SPINE_FAST) || defined(SPINE_RB)\n    uniform vec4 u_sBone[200];\n    vec4 getBonePos(float fboneId,float weight,vec2 pos){\n        int boneId=int(fboneId);\n        vec4 up= u_sBone[boneId*2];\n        vec4 down=u_sBone[boneId*2+1];\n        float x = pos.x*up.x + pos.y*up.y +up.z ;\n        float y = pos.x*down.x + pos.y*down.y +down.z;\n        pos.x=x*weight;\n        pos.y=y*weight;\n        return vec4(pos,0.,1.0);\n    }\n#endif\n\nuniform vec4 u_clipMatDir;\nuniform vec2 u_clipMatPos;// 这个是全局的，不用再应用矩阵了。\nuniform vec2 u_size;\n\n\n// #ifdef GPU_INSTANCE\n//     uniform vec3 a_NMatrix[2];\n// #else\n    uniform vec3 u_NMatrix[2];\n// #endif //GPU_INSTANCE\nuniform vec4 u_color;\n\nvarying vec2 vUv;\nvarying vec4 vColor;\nvarying vec2 v_cliped;\n\nvec4 getSpinePos(){\n\n    #ifdef SPINE_SIMPLE\n        #ifdef GPU_INSTANCE\n            float currentPixelPos = a_SimpleTextureParams.x + a_SimpleTextureParams.y;\n\t    #else // GPU_INSTANCE\n            float currentPixelPos = u_SimpleAnimatorParams.x + u_SimpleAnimatorParams.y;\n\t    #endif // GPU_INSTANCE\n\n        float offset = 1.0 / u_SimpleAnimatorTextureSize;\n\n        return getBonePosBake(currentPixelPos,a_BoneId,a_weight,a_pos,offset)\n        +getBonePosBake(currentPixelPos,a_PosWeightBoneID_2.w,a_PosWeightBoneID_2.z,a_PosWeightBoneID_2.xy,offset)\n        +getBonePosBake(currentPixelPos,a_PosWeightBoneID_3.w,a_PosWeightBoneID_3.z,a_PosWeightBoneID_3.xy,offset)\n        +getBonePosBake(currentPixelPos,a_PosWeightBoneID_4.w,a_PosWeightBoneID_4.z,a_PosWeightBoneID_4.xy,offset);\n    #else\n        #ifdef SPINE_FAST\n            return getBonePos(a_BoneId,a_weight,a_pos)\n            +getBonePos(a_PosWeightBoneID_2.w,a_PosWeightBoneID_2.z,a_PosWeightBoneID_2.xy)\n            +getBonePos(a_PosWeightBoneID_3.w,a_PosWeightBoneID_3.z,a_PosWeightBoneID_3.xy)\n            +getBonePos(a_PosWeightBoneID_4.w,a_PosWeightBoneID_4.z,a_PosWeightBoneID_4.xy);\n        #endif\n        \n        #ifdef SPINE_RB\n            return getBonePos(a_BoneId,1.0,a_pos);\n            //return vec4(pos,0.,1.);\n        #endif\n    #endif // SPINE_SIMPLE\n    //spine Texture\n    return vec4(a_pos.x,a_pos.y,0.,1.);\n\n}\n\n\nvec2 getClipedInfo(vec2 screenPos){\n    vec2 cliped;\n    float clipw = length(u_clipMatDir.xy);\n    float cliph = length(u_clipMatDir.zw);\n    vec2 clippos = screenPos - u_clipMatPos.xy;\t//pos已经应用矩阵了，为了减的有意义，clip的位置也要缩放\n    if(clipw>20000. && cliph>20000.)\n        cliped = vec2(0.5,0.5);\n    else {\n        //clipdir是带缩放的方向，由于上面clippos是在缩放后的空间计算的，所以需要把方向先normalize一下\n        cliped =vec2( dot(clippos,u_clipMatDir.xy)/clipw/clipw, dot(clippos,u_clipMatDir.zw)/cliph/cliph);\n    }\n    return cliped;\n}\n\nvec4 getScreenPos(vec4 pos){\n    #ifdef GPU_INSTANCE\n        vec3 down =a_NMatrix_1;\n        vec3 up =a_NMatrix_0;\n    #else\n        vec3 down =u_NMatrix[1];\n        vec3 up =u_NMatrix[0];\n    #endif\n    float x=up.x*pos.x+up.y*pos.y+up.z;\n    float y=down.x*pos.x+down.y*pos.y+down.z;\n    v_cliped = getClipedInfo(vec2(x,y));\n    return vec4((x/u_size.x-0.5)*2.0,(0.5-y/u_size.y)*2.0,pos.z,1.0);\n}\n\n\n#endif // SpineVertex_lib";

    var spineFragment = "#if !defined(SpineFragment_lib)\n        #define SpineFragment_lib\n\nvarying vec2 vUv;\nvarying vec4 vColor;\nvarying vec2 v_cliped;\n\n\nvec3 gammaToLinear(in vec3 value)\n{\n    return pow((value + 0.055) / 1.055, vec3(2.4));\n}\n\nvec4 gammaToLinear(in vec4 value)\n{\n    return vec4(gammaToLinear(value.rgb), value.a);\n}\n\nvec3 linearToGamma(in vec3 value)\n{\n    return vec3(mix(pow(value.rgb, vec3(0.41666)) * 1.055 - vec3(0.055), value.rgb * 12.92, vec3(lessThanEqual(value.rgb, vec3(0.0031308)))));\n\n    // return pow(value, vec3(1.0 / 2.2));\n    // return pow(value, vec3(0.455));\n}\n\nvec4 linearToGamma(in vec4 value)\n{\n    return vec4(linearToGamma(value.rgb), value.a);\n}\n\nvec4 getColor(){\n    vec4 color = texture2D(u_spineTexture, vUv.xy);//vec4(1.0,0.0,0.0,1.0);\n    #ifndef GAMMATEXTURE\n        //是linear数据\n        #ifdef GAMMASPACE\n            color.xyz = linearToGamma(color.xyz);    \n        #endif\n    #else\n        //gamma数据\n        #ifndef GAMMASPACE\n            color.xyz = gammaToLinear(color.xyz);\n        #endif\n    #endif\n    return color*vColor;\n}\n\nvoid clip(){\n    if(v_cliped.x<0.) discard;\n    if(v_cliped.x>1.) discard;\n    if(v_cliped.y<0.) discard;\n    if(v_cliped.y>1.) discard;\n}\n\n#endif //SpineFragment_lib";

    var spineStandardVS = "#define SHADER_NAME SpineStandardVS\n#include \"SpineVertex.glsl\"\n\nvoid main()\n{\n    vUv = a_texcoord;\n    vColor = a_color*u_color;\n\n    #ifdef PREMULTIPLYALPHA\n        vColor.rgb = vColor.rgb * vColor.a;\n    #endif\n\n    vec4 pos = getSpinePos();\n    gl_Position = getScreenPos(pos);\n}";

    var spineStandardFS = "#define SHADER_NAME SpineStandardFS\n#include \"SpineFragment.glsl\"\n\n#ifdef COLOR_FILTER\n    uniform vec4 u_colorAlpha;\n    uniform mat4 u_colorMat;\n#endif\n\nvoid main(){\n    clip();\n    gl_FragColor = getColor();\n\n    #ifdef COLOR_FILTER\n        mat4 alphaMat = u_colorMat;\n\n        alphaMat[0][3] *= gl_FragColor.a;\n        alphaMat[1][3] *= gl_FragColor.a;\n        alphaMat[2][3] *= gl_FragColor.a;\n\n        gl_FragColor = gl_FragColor * alphaMat;\n        gl_FragColor += u_colorAlpha / 255.0 * gl_FragColor.a;\n    #endif\n}";

    class SpineShaderInit {
        static SetSpineBlendMode(value, mat, premultipliedAlpha = true) {
            switch (value) {
                case 1:
                    mat.blend = Laya.RenderState.BLEND_ENABLE_ALL;
                    mat.blendSrc = Laya.RenderState.BLENDPARAM_SRC_ALPHA;
                    mat.blendDst = Laya.RenderState.BLENDPARAM_ONE;
                    break;
                case 3:
                    mat.blend = Laya.RenderState.BLEND_ENABLE_SEPERATE;
                    mat.blendSrcRGB = Laya.RenderState.BLENDPARAM_ONE;
                    mat.blendDstRGB = Laya.RenderState.BLENDPARAM_ONE_MINUS_SRC_COLOR;
                    mat.blendSrcAlpha = Laya.RenderState.BLENDPARAM_ONE;
                    mat.blendDstAlpha = Laya.RenderState.BLENDPARAM_ONE;
                    break;
                case 2:
                    mat.blend = Laya.RenderState.BLEND_ENABLE_ALL;
                    mat.blendSrc = Laya.RenderState.BLENDPARAM_DST_COLOR;
                    mat.blendDst = Laya.RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
                    break;
                default:
                    mat.blend = Laya.RenderState.BLEND_ENABLE_ALL;
                    mat.blendSrc = premultipliedAlpha ? Laya.RenderState.BLENDPARAM_ONE : Laya.RenderState.BLENDPARAM_SRC_ALPHA;
                    mat.blendDst = Laya.RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
            }
        }
        static initSpineMaterial(mat) {
            mat.alphaTest = false;
            mat.depthWrite = false;
            mat.cull = Laya.RenderState.CULL_NONE;
            mat.blend = Laya.RenderState.BLEND_ENABLE_ALL;
            mat.blendSrc = Laya.RenderState.BLENDPARAM_SRC_ALPHA;
            mat.blendDst = Laya.RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
            mat.depthTest = Laya.RenderState.DEPTHTEST_OFF;
        }
        static init() {
            Laya.Shader3D.addInclude("SpineVertex.glsl", spineVertex);
            Laya.Shader3D.addInclude("SpineFragment.glsl", spineFragment);
            SpineShaderInit.BONEMAT = Laya.Shader3D.propertyNameToID("u_sBone");
            SpineShaderInit.NMatrix = Laya.Shader3D.propertyNameToID("u_NMatrix");
            SpineShaderInit.Color = Laya.Shader3D.propertyNameToID("u_color");
            SpineShaderInit.Size = Laya.Shader3D.propertyNameToID("u_size");
            SpineShaderInit.SpineTexture = Laya.Shader3D.propertyNameToID("u_spineTexture");
            SpineShaderInit.SPINE_FAST = Laya.Shader3D.getDefineByName("SPINE_FAST");
            SpineShaderInit.SPINE_RB = Laya.Shader3D.getDefineByName("SPINE_RB");
            SpineShaderInit.SPINE_PREMULTIPLYALPHA = Laya.Shader3D.getDefineByName("PREMULTIPLYALPHA");
            SpineShaderInit.SIMPLE_SIMPLEANIMATORPARAMS = Laya.Shader3D.propertyNameToID("u_SimpleAnimatorParams");
            SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURE = Laya.Shader3D.propertyNameToID("u_SimpleAnimatorTexture");
            SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURESIZE = Laya.Shader3D.propertyNameToID("u_SimpleAnimatorTextureSize");
            SpineShaderInit.SPINE_SIMPLE = Laya.Shader3D.getDefineByName("SPINE_SIMPLE");
            SpineShaderInit.SPINE_GPU_INSTANCE = Laya.Shader3D.getDefineByName("GPU_INSTANCE");
            const commandUniform = Laya.LayaGL.renderDeviceFactory.createGlobalUniformMap("Sprite2D");
            commandUniform.addShaderUniform(SpineShaderInit.BONEMAT, "u_sBone", Laya.ShaderDataType.Buffer);
            commandUniform.addShaderUniform(SpineShaderInit.NMatrix, "u_NMatrix", Laya.ShaderDataType.Buffer);
            commandUniform.addShaderUniform(SpineShaderInit.Color, "u_color", Laya.ShaderDataType.Color);
            commandUniform.addShaderUniform(SpineShaderInit.Size, "u_size", Laya.ShaderDataType.Vector2);
            commandUniform.addShaderUniform(SpineShaderInit.SIMPLE_SIMPLEANIMATORPARAMS, "u_SimpleAnimatorParams", Laya.ShaderDataType.Vector4);
            commandUniform.addShaderUniform(SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURE, "u_SimpleAnimatorTexture", Laya.ShaderDataType.Texture2D);
            commandUniform.addShaderUniform(SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURESIZE, "u_SimpleAnimatorTextureSize", Laya.ShaderDataType.Float);
            let shader = Laya.Shader3D.add("SpineStandard", true, false);
            shader.shaderType = Laya.ShaderFeatureType.D2;
            let uniformMap = {
                "u_spineTexture": Laya.ShaderDataType.Texture2D
            };
            let subShader = new Laya.SubShader(SpineShaderInit.textureSpineAttribute, uniformMap, {});
            shader.addSubShader(subShader);
            subShader.addShaderPass(spineStandardVS, spineStandardFS);
            SpineShaderInit.SpineFastVertexDeclaration = new Laya.VertexDeclaration(88, [
                new Laya.VertexElement(0, Laya.VertexElementFormat.Vector2, 0),
                new Laya.VertexElement(8, Laya.VertexElementFormat.Vector4, 1),
                new Laya.VertexElement(24, Laya.VertexElementFormat.Vector2, 2),
                new Laya.VertexElement(32, Laya.VertexElementFormat.Single, 3),
                new Laya.VertexElement(36, Laya.VertexElementFormat.Single, 4),
                new Laya.VertexElement(40, Laya.VertexElementFormat.Vector4, 5),
                new Laya.VertexElement(56, Laya.VertexElementFormat.Vector4, 6),
                new Laya.VertexElement(72, Laya.VertexElementFormat.Vector4, 7),
            ]);
            SpineShaderInit.SpineNormalVertexDeclaration = new Laya.VertexDeclaration(32, [
                new Laya.VertexElement(0, Laya.VertexElementFormat.Vector2, 0),
                new Laya.VertexElement(8, Laya.VertexElementFormat.Vector4, 1),
                new Laya.VertexElement(24, Laya.VertexElementFormat.Vector2, 2)
            ]);
            SpineShaderInit.SpineRBVertexDeclaration = new Laya.VertexDeclaration(36, [
                new Laya.VertexElement(0, Laya.VertexElementFormat.Vector2, 0),
                new Laya.VertexElement(8, Laya.VertexElementFormat.Vector4, 1),
                new Laya.VertexElement(24, Laya.VertexElementFormat.Vector2, 2),
                new Laya.VertexElement(32, Laya.VertexElementFormat.Single, 4),
            ]);
            SpineShaderInit.instanceNMatrixDeclaration = new Laya.VertexDeclaration(24, [
                new Laya.VertexElement(0, Laya.VertexElementFormat.Vector3, 8),
                new Laya.VertexElement(12, Laya.VertexElementFormat.Vector3, 9),
            ]);
            SpineShaderInit.instanceSimpleAnimatorDeclaration = new Laya.VertexDeclaration(16, [
                new Laya.VertexElement(0, Laya.VertexElementFormat.Vector4, 10),
            ]);
        }
    }
    SpineShaderInit.textureSpineAttribute = {
        'a_texcoord': [0, Laya.ShaderDataType.Vector2],
        'a_color': [1, Laya.ShaderDataType.Vector4],
        'a_pos': [2, Laya.ShaderDataType.Vector2],
        "a_weight": [3, Laya.ShaderDataType.Float],
        "a_BoneId": [4, Laya.ShaderDataType.Float],
        'a_PosWeightBoneID_2': [5, Laya.ShaderDataType.Vector4],
        'a_PosWeightBoneID_3': [6, Laya.ShaderDataType.Vector4],
        'a_PosWeightBoneID_4': [7, Laya.ShaderDataType.Vector4],
        'a_NMatrix_0': [8, Laya.ShaderDataType.Vector3],
        'a_NMatrix_1': [9, Laya.ShaderDataType.Vector3],
        'a_SimpleTextureParams': [10, Laya.ShaderDataType.Vector4]
    };
    Laya.Laya.addAfterInitCallback(SpineShaderInit.init);

    class SpineMeshBase {
        get material() {
            return this._material;
        }
        set material(value) {
            this._material = value;
            this.element.materialShaderData = this._material._shaderValues;
            this.element.subShader = this._material._shader.getSubShaderAt(0);
        }
        constructor(material) {
            this.verticesLength = 0;
            this.indicesLength = 0;
            this.init();
            this.material = material;
        }
        init() {
            let geo = Laya.LayaGL.renderDeviceFactory.createRenderGeometryElement(Laya.MeshTopology.Triangles, Laya.DrawType.DrawElement);
            let mesh = Laya.LayaGL.renderDeviceFactory.createBufferState();
            geo.bufferState = mesh;
            let vb = Laya.LayaGL.renderDeviceFactory.createVertexBuffer(Laya.BufferUsage.Dynamic);
            vb.vertexDeclaration = this.vertexDeclarition;
            let ib = Laya.LayaGL.renderDeviceFactory.createIndexBuffer(Laya.BufferUsage.Dynamic);
            mesh.applyState([vb], ib);
            geo.indexFormat = Laya.IndexFormat.UInt16;
            this.geo = geo;
            this.vb = vb;
            this.ib = ib;
            this.element = Laya.LayaGL.render2DRenderPassFactory.createRenderElement2D();
            this.element.canotPool = true;
            this.element.geometry = geo;
            this.element.renderStateIsBySprite = false;
        }
        draw() {
            let vb = this.vb;
            let ib = this.ib;
            let vblen = this.verticesLength * 4;
            let iblen = this.indicesLength * 2;
            vb.setDataLength(vblen);
            vb.setData(this.vertexArray.buffer, 0, this.vertexArray.byteOffset, vblen);
            ib._setIndexDataLength(iblen);
            ib._setIndexData(new Uint16Array(this.indexArray.buffer, this.indexArray.byteOffset, iblen / 2), 0);
            this.geo.clearRenderParams();
            this.geo.setDrawElemenParams(iblen / 2, 0);
            this.element.geometry = this.geo;
        }
        drawByData(vertices, vblength, indices, iblength) {
            this.vertexArray = vertices;
            this.indexArray = indices;
            this.verticesLength = vblength;
            this.indicesLength = iblength;
            this.draw();
        }
        clear() {
            this.verticesLength = 0;
            this.indicesLength = 0;
        }
        destroy() {
            this.geo.destroy();
            this.vb.destroy();
            this.ib.destroy();
            this.element.destroy();
            this.geo = null;
            this.vb = null;
            this.ib = null;
            this.element = null;
            this._material = null;
        }
        _cloneTo(target) {
            target.verticesLength = this.verticesLength;
            target.indicesLength = this.indicesLength;
            target.vertexArray = new Float32Array(this.vertexArray);
            target.indexArray = new Uint16Array(this.indexArray);
        }
    }
    SpineMeshBase.maxVertex = 10922;

    class SpineVirtualMesh extends SpineMeshBase {
        constructor(material) {
            super(material);
            if (SpineVirtualMesh.vertexArray == null) {
                SpineVirtualMesh.vertexArray = new Float32Array(SpineMeshBase.maxVertex * SpineVirtualMesh.vertexSize);
                SpineVirtualMesh.indexArray = new Uint16Array(SpineMeshBase.maxVertex * 3);
            }
            this.vertexArray = SpineVirtualMesh.vertexArray;
            this.indexArray = SpineVirtualMesh.indexArray;
        }
        appendVerticesClip(vertices, indices) {
            let indicesLength = indices.length;
            let vertexCount = vertices.length / 8;
            let vertexSize = SpineVirtualMesh.vertexSize;
            let verticesLength = vertexCount * vertexSize;
            let indexStart = this.verticesLength / vertexSize;
            let vertexBuffer = this.vertexArray;
            let before = this.verticesLength;
            let vlen = before;
            for (let j = 0; j < verticesLength; vlen += vertexSize, j += 8) {
                vertexBuffer[vlen] = vertices[j + 6];
                vertexBuffer[vlen + 1] = vertices[j + 7];
                vertexBuffer[vlen + 2] = vertices[j + 2];
                vertexBuffer[vlen + 3] = vertices[j + 3];
                vertexBuffer[vlen + 4] = vertices[j + 4];
                vertexBuffer[vlen + 5] = vertices[j + 5];
                vertexBuffer[vlen + 6] = vertices[j];
                vertexBuffer[vlen + 7] = vertices[j + 1];
            }
            this.verticesLength = before + verticesLength;
            let indicesArray = this.indexArray;
            for (let i = this.indicesLength, j = 0; j < indicesLength; i++, j++)
                indicesArray[i] = indices[j] + indexStart;
            this.indicesLength += indicesLength;
        }
        canAppend(verticesLength, indicesLength) {
            return this.verticesLength + verticesLength < SpineVirtualMesh.maxVertex * SpineVirtualMesh.vertexSize && this.indicesLength + indicesLength < SpineVirtualMesh.maxVertex * 3;
        }
        appendVertices(vertices, verticesLength, indices, indicesLength, finalColor, uvs) {
            let vertexSize = SpineVirtualMesh.vertexSize;
            let indexStart = this.verticesLength / vertexSize;
            let vertexBuffer = this.vertexArray;
            let before = this.verticesLength;
            for (let u = 0, v = 0, n = verticesLength; v < n; v += vertexSize, u += 2) {
                let size = before + v;
                vertexBuffer[size] = uvs[u];
                vertexBuffer[size + 1] = uvs[u + 1];
                vertexBuffer[size + 2] = finalColor.r;
                vertexBuffer[size + 3] = finalColor.g;
                vertexBuffer[size + 4] = finalColor.b;
                vertexBuffer[size + 5] = finalColor.a;
                vertexBuffer[size + 6] = vertices[v];
                vertexBuffer[size + 7] = vertices[v + 1];
            }
            this.verticesLength = before + verticesLength;
            let indicesArray = this.indexArray;
            for (let i = this.indicesLength, j = 0; j < indicesLength; i++, j++)
                indicesArray[i] = indices[j] + indexStart;
            this.indicesLength += indicesLength;
        }
        get vertexDeclarition() {
            return SpineShaderInit.SpineNormalVertexDeclaration;
        }
    }
    SpineVirtualMesh.vertexSize = 8;
    SpineVirtualMesh.vertexSize_TwoColor = 12;

    class SpineNormalRenderBase {
        constructor() {
            this.vmeshs = [];
            this.nextBatchIndex = 0;
        }
        clearBatch() {
            for (var i = 0; i < this.vmeshs.length; i++) {
                this.vmeshs[i].clear();
            }
            this.nextBatchIndex = 0;
        }
        nextBatch(material, spineRenderNode) {
            if (this.vmeshs.length == this.nextBatchIndex) {
                let vmesh = this.createMesh(material);
                this.vmeshs.push(vmesh);
                spineRenderNode._renderElements[this.nextBatchIndex++] = vmesh.element;
                vmesh.element.value2DShaderData = spineRenderNode._spriteShaderData;
                return vmesh;
            }
            let vmesh = this.vmeshs[this.nextBatchIndex];
            spineRenderNode._renderElements[this.nextBatchIndex++] = vmesh.element;
            vmesh.material = material;
            return vmesh;
        }
        destroy() {
            this.vmeshs.forEach((value) => {
                value.destroy();
            });
            this.nextBatchIndex = 0;
        }
    }

    const QUAD_TRIANGLES$1 = [0, 1, 2, 2, 3, 0];
    class SpineSkeletonRenderer extends SpineNormalRenderBase {
        createMesh(material) {
            return new SpineVirtualMesh(material);
        }
        constructor(templet, twoColorTint = true) {
            super();
            this.vertexEffect = null;
            this.tempColor = new window.spine.Color();
            this.tempColor2 = new window.spine.Color();
            this.vertexSize = 2 + 2 + 4;
            this.twoColorTint = false;
            this.twoColorTint = twoColorTint;
            if (twoColorTint)
                this.vertexSize += 4;
            this.templet = templet;
            if (SpineSkeletonRenderer.vertices == null) {
                SpineSkeletonRenderer.vertices = spine.Utils.newFloatArray(12 * 1024);
            }
            this.renderable = { vertices: null, numVertices: 0, numFloats: 0 };
            this.clipper = new spine.SkeletonClipping();
        }
        draw(skeleton, renderNode, slotRangeStart, slotRangeEnd) {
            let clipper = this.clipper;
            this.clearBatch();
            let twoColorTint = this.twoColorTint;
            let blendMode = null;
            let renderable = this.renderable;
            let uvs;
            let triangles;
            let drawOrder = skeleton.drawOrder;
            let attachmentColor;
            let skeletonColor = skeleton.color;
            let vertexSize = twoColorTint ? SpineVirtualMesh.vertexSize_TwoColor : SpineVirtualMesh.vertexSize;
            let inRange = false;
            if (slotRangeStart == -1)
                inRange = true;
            let mesh;
            let spineTex;
            let needSlot = this.templet.needSlot;
            let staticVetices = SpineSkeletonRenderer.vertices;
            for (let i = 0, n = drawOrder.length; i < n; i++) {
                let clippedVertexSize = clipper.isClipping() ? 2 : vertexSize;
                let slot = drawOrder[i];
                let boneOrSlot = needSlot ? slot : slot.bone;
                if (!slot.bone.active) {
                    clipper.clipEndWithSlot(slot);
                    continue;
                }
                if (slotRangeStart >= 0 && slotRangeStart == slot.data.index) {
                    inRange = true;
                }
                if (!inRange) {
                    clipper.clipEndWithSlot(slot);
                    continue;
                }
                if (slotRangeEnd >= 0 && slotRangeEnd == slot.data.index) {
                    inRange = false;
                }
                let attachment = slot.getAttachment();
                let texture;
                if (attachment instanceof window.spine.RegionAttachment) {
                    let region = attachment;
                    renderable.vertices = staticVetices;
                    renderable.numVertices = 4;
                    renderable.numFloats = clippedVertexSize << 2;
                    region.computeWorldVertices(boneOrSlot, renderable.vertices, 0, clippedVertexSize);
                    triangles = QUAD_TRIANGLES$1;
                    uvs = region.uvs;
                    texture = region.region.page.texture;
                    attachmentColor = region.color;
                }
                else if (attachment instanceof window.spine.MeshAttachment) {
                    let mesh = attachment;
                    renderable.vertices = staticVetices;
                    renderable.numVertices = (mesh.worldVerticesLength >> 1);
                    renderable.numFloats = renderable.numVertices * clippedVertexSize;
                    if (renderable.numFloats > renderable.vertices.length) {
                        renderable.vertices = staticVetices = window.spine.Utils.newFloatArray(renderable.numFloats);
                    }
                    mesh.computeWorldVertices(slot, 0, mesh.worldVerticesLength, renderable.vertices, 0, clippedVertexSize);
                    triangles = mesh.triangles;
                    texture = mesh.region.page.texture;
                    uvs = mesh.uvs;
                    attachmentColor = mesh.color;
                }
                else if (attachment instanceof window.spine.ClippingAttachment) {
                    let clip = (attachment);
                    clipper.clipStart(slot, clip);
                    continue;
                }
                else {
                    clipper.clipEndWithSlot(slot);
                    continue;
                }
                if (texture) {
                    let slotColor = slot.color;
                    let finalColor = this.tempColor;
                    finalColor.r = skeletonColor.r * slotColor.r * attachmentColor.r;
                    finalColor.g = skeletonColor.g * slotColor.g * attachmentColor.g;
                    finalColor.b = skeletonColor.b * slotColor.b * attachmentColor.b;
                    finalColor.a = skeletonColor.a * slotColor.a * attachmentColor.a;
                    let darkColor = this.tempColor2;
                    if (!slot.darkColor)
                        darkColor.set(0, 0, 0, 1.0);
                    else {
                        darkColor.setFromColor(slot.darkColor);
                    }
                    let slotBlendMode = slot.data.blendMode;
                    let needNewMat = false;
                    if (slotBlendMode != blendMode) {
                        blendMode = slotBlendMode;
                        needNewMat = true;
                    }
                    if (spineTex != texture) {
                        spineTex = texture;
                        needNewMat = true;
                    }
                    if (needNewMat) {
                        mesh && mesh.draw();
                        let mat = renderNode.getMaterial(texture.realTexture, blendMode);
                        mesh = this.nextBatch(mat, renderNode);
                        mesh.clear();
                    }
                    if (clipper.isClipping()) {
                        clipper.clipTriangles(renderable.vertices, renderable.numFloats, triangles, triangles.length, uvs, finalColor, darkColor, twoColorTint);
                        if (!mesh.canAppend(clipper.clippedVertices.length, clipper.clippedTriangles.length)) {
                            mesh.draw();
                            mesh = this.nextBatch(mesh.material, renderNode);
                            mesh.clear();
                        }
                        mesh.appendVerticesClip(clipper.clippedVertices, clipper.clippedTriangles);
                    }
                    else {
                        if (!mesh.canAppend(renderable.numFloats, triangles.length)) {
                            mesh.draw();
                            mesh = this.nextBatch(mesh.material, renderNode);
                            mesh.clear();
                        }
                        if (finalColor.a != 0) {
                            mesh.appendVertices(renderable.vertices, renderable.numFloats, triangles, triangles.length, finalColor, uvs);
                        }
                    }
                }
                clipper.clipEndWithSlot(slot);
            }
            clipper.clipEnd();
            mesh && mesh.draw();
        }
    }

    class SpineWasmVirturalMesh extends SpineMeshBase {
        constructor(material) {
            super(material);
            this._renderElement2D = Laya.LayaGL.render2DRenderPassFactory.createRenderElement2D();
            this._renderElement2D.geometry = this.geo;
        }
        get vertexDeclarition() {
            return SpineShaderInit.SpineNormalVertexDeclaration;
        }
    }

    class SpineWasmRender extends SpineNormalRenderBase {
        constructor(templet, twoColorTint = true) {
            super();
            this.twoColorTint = false;
            this.vmeshs = [];
            this.nextBatchIndex = 0;
            this.twoColorTint = twoColorTint;
            this.templet = templet;
        }
        createMesh(material) {
            return new SpineWasmVirturalMesh(material);
        }
        draw(skeleton, renderNode, slotRangeStart, slotRangeEnd) {
            this.nextBatchIndex = 0;
            SpineAdapter.drawSkeleton((vbLen, ibLen, texturePath, blendMode) => {
                let mat = renderNode.getMaterial(this.templet.getTexture(texturePath), blendMode.value);
                let mesh = this.nextBatch(mat, renderNode);
                mesh.drawByData(SpineAdapter._vbArray, vbLen, SpineAdapter._ibArray, ibLen);
            }, skeleton, false, slotRangeStart, slotRangeEnd);
        }
    }

    class SpineAdapter {
        static initialize() {
            if (window.Spine) {
                SpineAdapter.isWasm = true;
                return window.Spine().then((spine) => {
                    SpineAdapter._spine = spine;
                    window.spine = spine;
                    SpineAdapter.initClass();
                    SpineAdapter.bindBuffer(10922 * 12, 10922 * 3);
                    SpineAdapter.allAdpat();
                    return Promise.resolve();
                });
            }
            else if (window.spine) {
                SpineAdapter.isWasm = false;
                SpineAdapter.adaptJS();
                SpineAdapter.allAdpat();
            }
        }
        static createNormalRender(templet, twoColorTint) {
            return SpineAdapter.isWasm ? new SpineWasmRender(templet, twoColorTint) : new SpineSkeletonRenderer(templet, twoColorTint);
        }
        static allAdpat() {
            let stateProto = window.spine.AnimationState.prototype;
            stateProto.oldApply = stateProto.apply;
            stateProto.applyCache = function (skeleton) {
            };
            stateProto.getCurrentPlayTimeOld = function (trackIndex) {
                return this.getCurrentOld(trackIndex).getAnimationTime();
            };
            stateProto.getCurrentPlayTime = stateProto.getCurrentPlayTimeOld;
            stateProto.getCurrentPlayTimeByCache = function (trackIndex) {
                let entry = this.getCurrent(trackIndex);
                let animationStart = entry.animationStart, animationEnd = entry.animationEnd;
                let duration = animationEnd - animationStart;
                entry.trackLast = entry.nextTrackLast;
                let trackLastWrapped = entry.trackLast % duration;
                let animationTime = entry.getAnimationTime();
                let complete = false;
                if (entry.loop)
                    complete = duration == 0 || trackLastWrapped > entry.trackTime % duration;
                else
                    complete = animationTime >= animationEnd && entry.animationLast < animationEnd;
                if (complete) {
                    this.dispatchEvent(entry, "complete", null);
                    entry.nextAnimationLast = -1;
                    entry.nextTrackLast = -1;
                    return 0;
                }
                entry.nextAnimationLast = animationTime;
                entry.nextTrackLast = entry.trackTime;
                let animationLast = entry.animationLast;
                return Math.max(animationLast, 0);
            };
            let skeletonProto = window.spine.Skeleton.prototype;
            skeletonProto.oldUpdateWorldTransform = skeletonProto.updateWorldTransform;
            skeletonProto.updateWorldTransformCache = function () {
            };
            window.spine.AnimationState.prototype.dispatchEvent = function (entry, type, event) {
                this.eventsObject[type](entry, event);
            };
        }
        static adaptJS() {
            if (window.spine) {
                window.spine.AnimationState.prototype.oldAddListener = window.spine.AnimationState.prototype.addListener;
                window.spine.AnimationState.prototype.addListener = function (data) {
                    this.eventsObject = data;
                    this.oldAddListener(data);
                };
                let sketonDataProto = window.spine.SkeletonData.prototype;
                sketonDataProto.getAnimationsSize = function () { return this.animations.length; };
                sketonDataProto.getAnimationByIndex = function (index) { return this.animations[index]; };
                sketonDataProto.getSkinIndexByName = function (name) {
                    let skins = this.skins;
                    for (let i = 0, n = skins.length; i < n; i++) {
                        if (skins[i].name == name) {
                            return i;
                        }
                    }
                    return -1;
                };
                let skeletonProto = window.spine.Skeleton.prototype;
                skeletonProto.showSkinByIndex = function (index) {
                    this.setSkin(this.data.skins[index]);
                };
                let stateProto = window.spine.AnimationState.prototype;
                stateProto.getCurrentOld = stateProto.getCurrent;
                stateProto.getCurrent = function (trackIndex) {
                    let result = this.getCurrentOld(trackIndex);
                    this.currentTrack = result;
                    return result;
                };
            }
        }
        static initClass() {
            let stateProto = spine.AnimationState.prototype;
            stateProto.addListener = function (data) {
                this.eventsObject = data;
                this.setListener(SpineAdapter._spine.AnimationStateListenerObject.implement({
                    callback: (state, type, entry, event) => {
                        data[SpineAdapter.stateMap[type.value]](entry, event);
                    }
                }));
            };
            stateProto.getCurrentOld = stateProto.getCurrent;
            stateProto.setAnimationOld = stateProto.setAnimation;
            stateProto.setAnimation = function (trackIndex, animationName, loop) {
                if (this.__tracks) {
                    this.__tracks.length = 0;
                }
                return this.setAnimationOld(trackIndex, animationName, loop);
            };
            stateProto.getCurrent = function (trackIndex) {
                let result;
                let __tracks = this.__tracks;
                if (!__tracks) {
                    __tracks = this.__tracks = [];
                    result = this.getCurrentOld(trackIndex);
                    __tracks[trackIndex] = result;
                }
                else {
                    result = __tracks[trackIndex];
                }
                if (!result) {
                    result = this.getCurrentOld(trackIndex);
                    __tracks[trackIndex] = result;
                }
                this.currentTrack = result;
                return result;
            };
            window.spine.TextureAtlas = TextureAtlas;
            Object.defineProperty(window.spine.Skin.prototype, "attachments", {
                get: function () {
                    return this.getAttachments();
                }
            });
            let skeletonProto = window.spine.Skeleton.prototype;
            Object.defineProperty(skeletonProto, "slots", {
                get: function () {
                    return this.getSlots();
                }
            });
            Object.defineProperty(skeletonProto, "data", {
                get: function () {
                    return this.getData();
                }
            });
            Object.defineProperty(skeletonProto, "bones", {
                get: function () {
                    return this.getBones();
                }
            });
            Object.defineProperty(skeletonProto, "color", {
                get: function () {
                    return this.getColor();
                }
            });
            let skeletonDataProto = window.spine.SkeletonData.prototype;
            Object.defineProperty(skeletonDataProto, "name", {
                get: function () {
                    return this.getName();
                }
            });
            Object.defineProperty(skeletonDataProto, "skins", {
                get: function () {
                    return this.getSkins();
                }
            });
            Object.defineProperty(skeletonDataProto, "slots", {
                get: function () {
                    return this.getSlots();
                }
            });
            let animationProto = window.spine.Animation.prototype;
            Object.defineProperty(animationProto, "name", {
                get: function () {
                    return this.getName();
                }
            });
            Object.defineProperty(animationProto, "duration", {
                get: function () {
                    return this.getDuration();
                }
            });
            Object.defineProperty(animationProto, "timelines", {
                get: function () {
                    return this.getTimelines();
                }
            });
            Object.defineProperty(skeletonDataProto, "animations", {
                get: function () {
                    return this.getAnimations();
                }
            });
            Object.defineProperty(window.spine.Skin.prototype, "name", {
                get: function () {
                    return this.getName();
                }
            });
            let slotDataProto = window.spine.SlotData.prototype;
            Object.defineProperty(slotDataProto, "boneData", {
                get: function () {
                    return this.getBoneData();
                }
            });
            Object.defineProperty(slotDataProto, "color", {
                get: function () {
                    return this.getColor();
                }
            });
            Object.defineProperty(slotDataProto, "index", {
                get: function () {
                    return this.getIndex();
                }
            });
            Object.defineProperty(slotDataProto, "attachmentName", {
                get: function () {
                    return this.getAttachmentName();
                }
            });
            Object.defineProperty(slotDataProto, "blendMode", {
                get: function () {
                    return this.getBlendMode().value;
                }
            });
            Object.defineProperty(window.spine.BoneData.prototype, "index", {
                get: function () {
                    return this.getIndex();
                }
            });
            let regionAttachMentProto = window.spine.RegionAttachment.prototype;
            Object.defineProperty(regionAttachMentProto, "color", {
                get: function () {
                    return this.getColor();
                }
            });
            Object.defineProperty(regionAttachMentProto, "name", {
                get: function () {
                    return this.getName();
                }
            });
            Object.defineProperty(regionAttachMentProto, "offset", {
                get: function () {
                    let from = this.getOffset();
                    return from;
                }
            });
            Object.defineProperty(regionAttachMentProto, "uvs", {
                get: function () {
                    return this.getRotateUVs();
                }
            });
            Object.defineProperty(regionAttachMentProto, "region", {
                get: function () {
                    return this;
                }
            });
            Object.defineProperty(regionAttachMentProto, "page", {
                get: function () {
                    return this.getPage();
                }
            });
            Object.defineProperty(window.spine.AtlasPage.prototype, "name", {
                get: function () {
                    return this.getName();
                }
            });
            let meshAttachmentProto = window.spine.MeshAttachment.prototype;
            Object.defineProperty(meshAttachmentProto, "bones", {
                get: function () {
                    return this.getBones();
                }
            });
            Object.defineProperty(meshAttachmentProto, "uvs", {
                get: function () {
                    return this.getUVs();
                }
            });
            Object.defineProperty(meshAttachmentProto, "triangles", {
                get: function () {
                    return this.getTriangles();
                }
            });
            Object.defineProperty(meshAttachmentProto, "vertices", {
                get: function () {
                    let from = this.getVertices();
                    return from;
                }
            });
            Object.defineProperty(meshAttachmentProto, "color", {
                get: function () {
                    return this.getColor();
                }
            });
            Object.defineProperty(meshAttachmentProto, "region", {
                get: function () {
                    return this;
                }
            });
            Object.defineProperty(meshAttachmentProto, "page", {
                get: function () {
                    return this.getPage();
                }
            });
            Object.defineProperty(meshAttachmentProto, "name", {
                get: function () {
                    return this.getName();
                }
            });
            let eventTimelineProto = window.spine.EventTimeline.prototype;
            Object.defineProperty(eventTimelineProto, "frames", {
                get: function () {
                    return this.getFrames();
                }
            });
            Object.defineProperty(eventTimelineProto, "events", {
                get: function () {
                    return this.getEvents();
                }
            });
            let attachmentTimelineProto = window.spine.AttachmentTimeline.prototype;
            Object.defineProperty(attachmentTimelineProto, "frames", {
                get: function () {
                    return this.getFrames();
                }
            });
            Object.defineProperty(attachmentTimelineProto, "slotIndex", {
                get: function () {
                    return this.getSlotIndex();
                }
            });
            Object.defineProperty(attachmentTimelineProto, "attachmentNames", {
                get: function () {
                    return this.getAttachmentNames();
                }
            });
            let drawOrderTimelineProto = window.spine.DrawOrderTimeline.prototype;
            Object.defineProperty(drawOrderTimelineProto, "frames", {
                get: function () {
                    return this.getFrames();
                }
            });
            Object.defineProperty(drawOrderTimelineProto, "drawOrders", {
                get: function () {
                    return this.getDrawOrders();
                }
            });
            let colorTimelineProto = window.spine.ColorTimeline.prototype;
            Object.defineProperty(colorTimelineProto, "frames", {
                get: function () {
                    return this.getFrames();
                }
            });
            Object.defineProperty(colorTimelineProto, "slotIndex", {
                get: function () {
                    return this.getSlotIndex();
                }
            });
            let trackEntryProto = window.spine.TrackEntry.prototype;
            Object.defineProperty(trackEntryProto, "loop", {
                get: function () {
                    return this.getLoop();
                }
            });
            Object.defineProperty(trackEntryProto, "animationStart", {
                get: function () {
                    return this.getAnimationStart();
                },
                set: function (value) {
                }
            });
            Object.defineProperty(trackEntryProto, "animationEnd", {
                get: function () {
                    return this.getAnimationEnd();
                }
            });
            Object.defineProperty(trackEntryProto, "animationLast", {
                get: function () {
                    return this.getAnimationLast();
                }
            });
            Object.defineProperty(trackEntryProto, "nextAnimationLast", {
                get: function () {
                    return this.getAnimationLast();
                },
                set: function (value) {
                    this.setNextAnimationLast(value);
                }
            });
            Object.defineProperty(trackEntryProto, "trackTime", {
                get: function () {
                    return this.getTrackTime();
                }
            });
            Object.defineProperty(trackEntryProto, "animation", {
                get: function () {
                    return this.getAnimation();
                }
            });
            let boneProto = window.spine.Bone.prototype;
            Object.defineProperty(boneProto, "a", {
                get: function () {
                    return this.getA();
                }
            });
            Object.defineProperty(boneProto, "b", {
                get: function () {
                    return this.getB();
                }
            });
            Object.defineProperty(boneProto, "c", {
                get: function () {
                    return this.getC();
                }
            });
            Object.defineProperty(boneProto, "d", {
                get: function () {
                    return this.getD();
                }
            });
            Object.defineProperty(boneProto, "worldX", {
                get: function () {
                    return this.getWorldX();
                }
            });
            Object.defineProperty(boneProto, "worldY", {
                get: function () {
                    return this.getWorldY();
                }
            });
            let eventProto = window.spine.Event.prototype;
            Object.defineProperty(eventProto, "volume", {
                get: function () {
                    return this.getVolume();
                }
            });
            Object.defineProperty(eventProto, "balance", {
                get: function () {
                    return this.getBalance();
                }
            });
            Object.defineProperty(eventProto, "time", {
                get: function () {
                    return this.getTime();
                }
            });
            Object.defineProperty(eventProto, "data", {
                get: function () {
                    return this.getData();
                }
            });
            Object.defineProperty(eventProto, "floatValue", {
                get: function () {
                    return this.getFloatValue();
                }
            });
            Object.defineProperty(eventProto, "intValue", {
                get: function () {
                    return this.getIntValue();
                }
            });
            Object.defineProperty(eventProto, "stringValue", {
                get: function () {
                    return this.getStringValue();
                }
            });
            let eventDataProto = window.spine.EventData.prototype;
            Object.defineProperty(eventDataProto, "name", {
                get: function () {
                    return this.getName();
                }
            });
            Object.defineProperty(eventDataProto, "audioPath", {
                get: function () {
                    return this.getAudioPath();
                }
            });
        }
        static bindBuffer(maxNumVertices, maxNumIndices) {
            SpineAdapter._spine.createBuffer(maxNumVertices, maxNumIndices);
            SpineAdapter._vbArray = SpineAdapter._spine.getVertexsBuffer();
            SpineAdapter._ibArray = SpineAdapter._spine.getIndexsBuffer();
        }
        static drawSkeleton(fun, skeleton, twoColorTint, slotRangeStart, slotRangeEnd) {
            SpineAdapter._spine.drawSkeleton(fun, skeleton, twoColorTint, slotRangeStart, slotRangeEnd);
        }
    }
    SpineAdapter.stateMap = { 0: "start", 1: "interrupt", 2: "end", 3: "complete", 4: "dispose", 5: "event" };
    class TextureAtlas {
        constructor(atlasText, textureLoader) {
            return new SpineAdapter._spine.Atlas(atlasText, "", SpineAdapter._spine.TextureLoader.implement({
                load: (page, url) => {
                    let texture = textureLoader(url);
                    page.texture = texture;
                },
                unload: function (s) {
                }
            }), true);
        }
    }
    Laya.Laya.addBeforeInitCallback(SpineAdapter.initialize);

    class SpineNormalRender {
        getSpineColor() {
            return this._spineColor;
        }
        destroy() {
            this._renerer.destroy();
        }
        initBake(obj) {
        }
        init(skeleton, templet, renderNode, state) {
            this._renerer = SpineAdapter.createNormalRender(templet, false);
            this._skeleton = skeleton;
            this._owner = renderNode;
            let scolor = skeleton.color;
            this._spineColor = new Laya.Color(scolor.r, scolor.g, scolor.b, scolor.a);
            let color = renderNode._spriteShaderData.getColor(SpineShaderInit.Color) || new Laya.Color();
            color.setValue(scolor.r, scolor.g, scolor.b, scolor.a);
            if (renderNode._renderAlpha !== undefined) {
                color.a *= renderNode._renderAlpha;
            }
            else
                color.a *= renderNode.owner.alpha;
            renderNode._spriteShaderData.setColor(SpineShaderInit.Color, color);
            renderNode._spriteShaderData.removeDefine(SpineShaderInit.SPINE_FAST);
            renderNode._spriteShaderData.removeDefine(SpineShaderInit.SPINE_RB);
        }
        play(animationName) {
        }
        setSkinIndex(index) {
        }
        changeSkeleton(skeleton) {
            this._skeleton = skeleton;
        }
        render(time) {
            this._owner.clear();
            this._renerer.draw(this._skeleton, this._owner, -1, -1);
        }
    }

    class MultiRenderData {
        constructor() {
            this.renderData = [];
            this.id = MultiRenderData.ID++;
        }
        addData(textureName, blendMode, offset, length) {
            this.currentData = { textureName: textureName, blendMode, offset, length };
            this.renderData.push(this.currentData);
        }
        endData(length) {
            this.currentData.length = length - this.currentData.offset;
        }
    }
    MultiRenderData.ID = 0;

    class IBCreator {
        get realIb() {
            return this.ib;
        }
        constructor() {
            this.maxIndexCount = 0;
            this.ibLength = 0;
        }
        updateFormat(vertexCount) {
            let ntype = IBCreator.getIndexFormat(vertexCount);
            if (this.type === ntype)
                return;
            this.type = ntype;
            this._updateBuffer();
        }
        setBufferLength(maxIndexCount) {
            if (maxIndexCount <= this.maxIndexCount)
                return;
            this.maxIndexCount = maxIndexCount;
            this._updateBuffer();
        }
        _updateBuffer() {
            let oldbuffer = this.ib;
            switch (this.type) {
                case Laya.IndexFormat.UInt16:
                    this.size = 2;
                    this.ib = new Uint16Array(this.maxIndexCount);
                    break;
                case Laya.IndexFormat.UInt32:
                    this.size = 4;
                    this.ib = new Uint32Array(this.maxIndexCount);
                    break;
            }
            if (oldbuffer)
                this.ib.set(oldbuffer);
        }
        createIB(attachs, vbCreator, order) {
            let offset = 0;
            let slotVBMap = vbCreator.slotVBMap;
            let drawOrder;
            let getAttach;
            if (order) {
                drawOrder = order;
                getAttach = function (value) {
                    return attachs[value];
                };
            }
            else {
                drawOrder = attachs;
                getAttach = function (value) {
                    return value;
                };
            }
            let outRenderData = new MultiRenderData();
            let texture;
            let blend;
            let uploadData = [];
            let end = -1;
            for (let i = 0, n = drawOrder.length; i < n; i++) {
                let attach = getAttach(drawOrder[i]);
                if (attach.attachment && !attach.isPath) {
                    let needAdd = false;
                    if (texture != attach.textureName) {
                        texture = attach.textureName;
                        needAdd = true;
                    }
                    if (blend != attach.blendMode) {
                        blend = attach.blendMode;
                        needAdd = true;
                    }
                    if (needAdd) {
                        if (outRenderData.currentData) {
                            outRenderData.endData(offset);
                        }
                        outRenderData.addData(attach.textureName, attach.blendMode, offset, 0);
                    }
                    let attachPos = slotVBMap.get(attach.slotId).get(attach.attachment);
                    if (attach.attachment && attach.indexArray) {
                        uploadData.push({
                            data: attach.indexArray,
                            offset: attachPos.offset,
                            start: offset
                        });
                        offset += attach.indexArray.length;
                        end = Math.max(end, offset);
                    }
                }
            }
            let vertexCount = vbCreator.maxVertexCount;
            let ntype = IBCreator.getIndexFormat(vertexCount);
            let needUpdateBuffer = false;
            if (ntype !== this.type) {
                this.type = ntype;
                needUpdateBuffer = true;
            }
            if (end > this.maxIndexCount) {
                this.maxIndexCount = end;
                needUpdateBuffer = true;
            }
            needUpdateBuffer && this._updateBuffer();
            let ib = this.ib;
            for (let i = 0, len = uploadData.length; i < len; i++) {
                let upload = uploadData[i];
                let offset = upload.offset;
                let start = upload.start;
                for (let j = 0, n = upload.data.length; j < n; j++) {
                    ib[start + j] = upload.data[j] + offset;
                }
            }
            if (texture) {
                outRenderData.endData(offset);
            }
            this.outRenderData = outRenderData;
            this.ibLength = offset;
        }
        static getIndexFormat(vertexCount) {
            let type = Laya.IndexFormat.UInt32;
            if (vertexCount < 65536) {
                type = Laya.IndexFormat.UInt16;
            }
            return type;
        }
    }

    class ChangeDeform {
        constructor() {
        }
        initChange(vb) {
            this.sizeMap = vb.slotVBMap.get(this.slotId);
            return true;
        }
        updateVB(vb, slots) {
            if (!this.sizeMap) {
                this.sizeMap = vb.slotVBMap.get(this.slotId);
                if (!this.sizeMap) {
                    return false;
                }
            }
            let slot = slots[this.slotId];
            if (slot.attachment) {
                let deform = slot.deform;
                if (!deform || !deform.length) {
                    return false;
                }
                let vertexSize = vb.vertexSize;
                let attachmentPos = this.sizeMap.get(slot.attachment.name);
                let offset = attachmentPos.offset * vertexSize;
                let vbData = vb.vb;
                let attachmentParse = attachmentPos.attachment;
                vb.appendDeform(attachmentParse, deform, offset, vbData);
            }
            return true;
        }
        clone() {
            let out = new ChangeDeform;
            out.slotId = this.slotId;
            return out;
        }
    }

    class ChangeDrawOrder {
        changeOrder(attachMap) {
            return this.order;
        }
        change(vb, slotAttachMap) {
            return true;
        }
    }

    class ChangeRGBA {
        constructor(slotId) {
            this.slotId = slotId;
        }
        initChange(vb) {
            this.sizeMap = vb.slotVBMap.get(this.slotId);
            return true;
        }
        updateVB(vb, slots) {
            if (!this.sizeMap) {
                this.sizeMap = vb.slotVBMap.get(this.slotId);
                if (!this.sizeMap) {
                    return false;
                }
            }
            let slot = slots[this.slotId];
            if (slot.attachment) {
                let vertexSize = vb.vertexSize;
                let attachmentPos = this.sizeMap.get(slot.attachment.name);
                let offset = attachmentPos.offset * vertexSize;
                let vbData = vb.vb;
                let attachment = attachmentPos.attachment;
                let r, g, b, a;
                let attachmentColor = attachment.attachmentColor;
                let light = slot.color;
                slot.darkColor;
                if (!attachmentColor) {
                    r = light.r;
                    g = light.g;
                    b = light.b;
                    a = light.a;
                }
                else {
                    r = light.r * attachmentColor.r;
                    g = light.g * attachmentColor.g;
                    b = light.b * attachmentColor.b;
                    a = light.a * attachmentColor.a;
                }
                let n = attachment.vertexCount;
                for (let i = 0; i < n; i++) {
                    vbData[offset + i * vertexSize + 2] = r;
                    vbData[offset + i * vertexSize + 3] = g;
                    vbData[offset + i * vertexSize + 4] = b;
                    vbData[offset + i * vertexSize + 5] = a;
                }
            }
            return true;
        }
        clone() {
            return new ChangeRGBA(this.slotId);
        }
    }

    class ChangeSlot {
        change(vb, slotAttachMap) {
            let map = slotAttachMap.get(this.slotId);
            let attachmentParse = map.get(this.attachment);
            if (attachmentParse) {
                vb.appendVB(attachmentParse);
            }
            else {
                attachmentParse = map.get(null);
            }
            this.attachmentParse = attachmentParse;
            return !this.attachmentParse.isclip;
        }
        changeOrder(attachMap) {
            attachMap[this.slotId] = this.attachmentParse;
            return null;
        }
    }

    const step = 1 / 30;
    class AnimationRender {
        static getFloat32Array(bone) {
            let rs = new Float32Array(8);
            rs[0] = bone.a;
            rs[1] = bone.b;
            rs[2] = bone.worldX;
            rs[3] = 0;
            rs[4] = bone.c;
            rs[5] = bone.d;
            rs[6] = bone.worldY;
            rs[7] = 0;
            return rs;
        }
        constructor() {
            this.changeIB = new Map();
            this.frames = [];
            this.skinDataArray = [];
            this.boneFrames = [];
            this.eventsFrames = [];
        }
        checkChangeVB() {
            if (!this.changeVB) {
                this.changeVB = [];
            }
        }
        getFrameIndex(time, frameIndex) {
            let frames = this.frames;
            let n = frames.length;
            for (let i = 1; i < n; i++)
                if (frames[i] > time)
                    return i - 1;
            return n - 1;
        }
        cacheBones(preRender) {
            let duration = preRender._play(this.name);
            let totalFrame = Math.round(duration / step) || 1;
            for (let i = 0; i <= totalFrame; i++) {
                let bones = preRender._updateState(i == 0 ? 0 : step);
                let frame = [];
                this.boneFrames.push(frame);
                for (let j = 0; j < bones.length; j++) {
                    let bone = bones[j];
                    let rs = AnimationRender.getFloat32Array(bone);
                    frame.push(rs);
                }
            }
        }
        check(animation, preRender) {
            this.name = animation.name;
            let timeline = animation.timelines;
            let tempMap = this.changeIB;
            let tempArray = this.frames;
            tempMap.clear();
            tempArray.length = 0;
            tempArray[0] = 0;
            tempMap.set(0, []);
            let hasClip;
            for (let i = 0, n = timeline.length; i < n; i++) {
                let time = timeline[i];
                if (time instanceof spine.AttachmentTimeline) {
                    let attachment = time;
                    let frames = attachment.frames;
                    let attachmentNames = attachment.attachmentNames;
                    let slotIndex = attachment.slotIndex;
                    for (let j = 0, m = frames.length; j < m; j++) {
                        let frame = frames[j];
                        let change = new ChangeSlot();
                        change.slotId = slotIndex;
                        change.attachment = attachmentNames[j] || null;
                        let arr = tempMap.get(frame);
                        if (!arr) {
                            tempArray.push(frame);
                            arr = [];
                            tempMap.set(frame, arr);
                        }
                        arr.push(change);
                    }
                }
                else if (time instanceof spine.DrawOrderTimeline) {
                    let drawOrder = time;
                    let frames = drawOrder.frames;
                    let orders = time.drawOrders;
                    for (let j = 0, m = frames.length; j < m; j++) {
                        let frame = frames[j];
                        let change = new ChangeDrawOrder();
                        change.order = orders[j];
                        let arr = tempMap.get(frame);
                        if (!arr) {
                            tempArray.push(frame);
                            arr = [];
                            tempMap.set(frame, arr);
                        }
                        arr.unshift(change);
                    }
                }
                else if (time instanceof (spine.ColorTimeline || spine.RGBATimeline)
                    || (spine.TwoColorTimeline && time instanceof spine.TwoColorTimeline)) {
                    let rgba = time;
                    let frames = rgba.frames;
                    let slotIndex = rgba.slotIndex;
                    if (frames.length == 5 && frames[0] == 0 && frames[4] == 0) {
                        let change = new ChangeSlot();
                        change.slotId = slotIndex;
                        change.attachment = null;
                        let arr = tempMap.get(0);
                        if (!arr) {
                            tempArray.push(0);
                            arr = [];
                            tempMap.set(0, arr);
                        }
                        arr.push(change);
                    }
                    else {
                        this.checkChangeVB();
                        let changeRGBA = new ChangeRGBA(slotIndex);
                        this.changeVB.push(changeRGBA);
                    }
                }
                else if (time instanceof window.spine.ClippingAttachment) {
                    hasClip = true;
                }
                else if (time instanceof window.spine.EventTimeline) {
                    if (preRender.canCache) {
                        let eventTime = time;
                        let frames = eventTime.frames;
                        let events = eventTime.events;
                        for (let j = 0, m = frames.length; j < m; j++) {
                            let frame = frames[j];
                            let event = events[j];
                            let arr = this.eventsFrames[Math.round(frame / step)] = this.eventsFrames[frame] || [];
                            arr.push(event);
                        }
                    }
                }
                else if (time instanceof spine.DeformTimeline) {
                    this.checkChangeVB();
                    let slotIndex = time.slotIndex;
                    let change = new ChangeDeform();
                    change.slotId = slotIndex;
                    this.changeVB.push(change);
                }
            }
            tempArray.sort();
            if (!hasClip) {
                if (preRender.canCache) {
                    this.cacheBones(preRender);
                    this.isCache = true;
                }
            }
            this.frameNumber = tempArray.length;
        }
        createSkinData(mainVB, mainIB, slotAttachMap, attachMap) {
            let skinData = new SkinAniRenderData();
            let tempMap = this.changeIB;
            let tempArray = this.frames;
            skinData.init(tempMap, mainVB, mainIB, tempArray, slotAttachMap, attachMap, this.changeVB);
            skinData.updateBoneMat = this.isCache ? (this.eventsFrames.length == 0 ? skinData.updateBoneMatCache : skinData.updateBoneMatCacheEvent) : skinData.updateBoneMatByBone;
            this.skinDataArray.push(skinData);
            return skinData;
        }
    }
    AnimationRender.tempIbCreate = new IBCreator();
    class SkinAniRenderData {
        constructor() {
            this.ibs = [];
            this.checkVBChange = this.checkVBChangeEmpty;
        }
        checkVBChangeEmpty(slots) {
            return false;
        }
        checkVBChangeS(slots) {
            let result = false;
            for (let i = 0, n = this.changeVB.length; i < n; i++) {
                if (this.changeVB[i].updateVB(this.vb, slots)) {
                    result = true;
                }
            }
            return result;
        }
        getIB(frameIndex) {
            if (frameIndex == -1) {
                return this.mainibRender;
            }
            return this.ibs[frameIndex];
        }
        updateBoneMatCache(delta, animation, bones, state, boneMat) {
            this.vb.updateBoneCache(animation.boneFrames, delta / step, boneMat);
        }
        updateBoneMatCacheEvent(delta, animation, bones, state, boneMat) {
            let f = delta / step;
            this.vb.updateBoneCache(animation.boneFrames, f, boneMat);
            let currFrame = Math.round(f);
            let curentTrack = state.currentTrack;
            let lastEventFrame = curentTrack.lastEventFrame;
            if (lastEventFrame == currFrame) {
                return;
            }
            if (lastEventFrame > currFrame || lastEventFrame == undefined) {
                lastEventFrame = -1;
            }
            if (currFrame - lastEventFrame <= 1) {
                let events = animation.eventsFrames[currFrame];
                if (events) {
                    for (let i = 0, n = events.length; i < n; i++) {
                        state.dispatchEvent(null, "event", events[i]);
                    }
                }
            }
            else {
                for (let i = lastEventFrame + 1; i <= currFrame; i++) {
                    let events = animation.eventsFrames[i];
                    if (events) {
                        for (let j = 0, m = events.length; j < m; j++) {
                            state.dispatchEvent(null, "event", events[j]);
                        }
                    }
                }
            }
            curentTrack.lastEventFrame = currFrame;
        }
        updateBoneMatByBone(delta, animation, bones, state, boneMat) {
            this.vb.updateBone(bones, boneMat);
        }
        init(tempMap, mainVB, mainIB, tempArray, slotAttachMap, attachMap, changeVB) {
            this.mainIB = mainIB;
            let mutiRenderAble = false;
            if (changeVB) {
                this.vb = mainVB.clone();
                this.checkVBChange = this.checkVBChangeS;
                let myChangeVB = this.changeVB = [];
                for (let i = 0, n = changeVB.length; i < n; i++) {
                    let changeVBItem = changeVB[i].clone();
                    if (changeVBItem.initChange(this.vb)) {
                        myChangeVB.push(changeVBItem);
                    }
                }
            }
            if (tempArray.length == 1 && !tempMap.get(0).length) {
                if (this.vb) {
                    this.vb.initBoneMat();
                }
                else {
                    this.canInstance = true;
                }
                this.vb = this.vb || mainVB;
                this.ibs.push(this.mainIB);
                if (this.mainIB.outRenderData.renderData.length > 1) {
                    mutiRenderAble = true;
                }
            }
            else {
                this.vb = this.vb || mainVB.clone();
                for (let i = 0, n = tempArray.length; i < n; i++) {
                    let frame = tempArray[i];
                    let arr = tempMap.get(frame);
                    for (let j = 0, m = arr.length; j < m; j++) {
                        if (!arr[j].change(this.vb, slotAttachMap)) {
                            this.isNormalRender = true;
                        }
                    }
                }
                let tAttachMap = attachMap.slice();
                let order;
                this.vb.initBoneMat();
                for (let j = 0, m = tempArray.length; j < m; j++) {
                    let iChanges = tempMap.get(tempArray[j]);
                    for (let k = 0, l = iChanges.length; k < l; k++) {
                        let ichange = iChanges[k];
                        let newOrder = ichange.changeOrder(tAttachMap);
                        if (newOrder) {
                            order = newOrder;
                        }
                    }
                    let tempCreator = AnimationRender.tempIbCreate;
                    tempCreator.createIB(tAttachMap, this.vb, order);
                    let ibnew = tempCreator.ib.slice(0, tempCreator.ibLength);
                    let outRenderData = tempCreator.outRenderData;
                    let data = { realIb: ibnew, outRenderData: outRenderData, type: tempCreator.type, size: tempCreator.size };
                    this.ibs[j] = data;
                    if (outRenderData.renderData.length > 1) {
                        mutiRenderAble = true;
                    }
                }
            }
            this.mutiRenderAble = mutiRenderAble;
        }
    }

    class SpineOptimizeConst {
    }
    SpineOptimizeConst.BONEVERTEX = 22;
    SpineOptimizeConst.RIGIDBODYVERTEX = 9;

    const QUAD_TRIANGLES = [0, 1, 2, 2, 3, 0];
    class AttachmentParse {
        constructor() {
            this.vertexCount = 0;
            this.indexCount = 0;
            this.isNormalRender = false;
            this.vertexBones = 0;
        }
        init(attachment, boneIndex, slotId, deform, slot) {
            this.slotId = slotId;
            this.sourceData = attachment;
            this.attachment = attachment.name;
            this.boneIndex = boneIndex;
            let slotColor = slot.color;
            this.blendMode = slot.blendMode;
            let color = this.color = new Laya.Color();
            let attchmentColor;
            if (attachment instanceof window.spine.RegionAttachment) {
                attchmentColor = attachment.color;
                let region = attachment;
                this.vertexArray = region.offset;
                this.stride = 2;
                this.indexArray = QUAD_TRIANGLES;
                this.uvs = region.uvs;
                this.textureName = region.region.page.name;
            }
            else if (attachment instanceof window.spine.MeshAttachment) {
                attchmentColor = attachment.color;
                let vside = SpineOptimizeConst.BONEVERTEX;
                let mesh = attachment;
                this.textureName = mesh.region.page.name;
                if (!mesh.bones || mesh.bones.length == 0) {
                    if (deform && deform.length > 1) {
                        this.vertexArray = new Float32Array(deform);
                    }
                    else {
                        this.vertexArray = mesh.vertices;
                    }
                    this.stride = 2;
                    this.indexArray = mesh.triangles;
                    this.uvs = mesh.uvs;
                }
                else {
                    if (deform && deform.length > 1) {
                        debugger;
                    }
                    this.stride = vside - 6;
                    let vertexSize = mesh.uvs.length / 2;
                    let vertexArray = this.vertexArray = new Float32Array(vertexSize * this.stride);
                    this.indexArray = mesh.triangles;
                    this.uvs = mesh.uvs;
                    let vertices = mesh.vertices;
                    let bones = mesh.bones;
                    let v = 0;
                    let needPoint = (vside - 6) / 4;
                    this.vertexBones = needPoint;
                    for (let w = 0, b = 0; w < vertexSize; w++) {
                        let n = bones[v++];
                        n += v;
                        let result = [];
                        let offset = w * this.stride;
                        let nid = 0;
                        for (; v < n; v++, b += 3, nid++) {
                            result.push([vertices[b], vertices[b + 1], vertices[b + 2], bones[v]]);
                        }
                        if (result.length > needPoint) {
                            this.vertexBones = Math.max(this.vertexBones, result.length);
                            result.length = needPoint;
                            this.isNormalRender = true;
                        }
                        for (let i = 0; i < needPoint; i++) {
                            let v = result[i];
                            if (!v)
                                continue;
                            vertexArray[offset + i * 4] = v[0];
                            vertexArray[offset + i * 4 + 1] = v[1];
                            vertexArray[offset + i * 4 + 2] = v[2];
                            vertexArray[offset + i * 4 + 3] = v[3];
                        }
                    }
                }
            }
            else if (attachment instanceof window.spine.ClippingAttachment) {
                this.attachment = null;
                this.isclip = true;
            }
            else if (attachment instanceof spine.PathAttachment) {
                this.attachment = attachment.name;
                this.vertexArray = new Float32Array(attachment.vertices);
                this.isPath = true;
            }
            else {
                this.attachment = null;
            }
            if (this.textureName) {
                this.vertexCount = this.uvs.length / 2;
                this.indexCount = this.indexArray.length;
            }
            if (attchmentColor) {
                if (attchmentColor.a != 1 || attchmentColor.r != 1 || attchmentColor.g != 1 && attchmentColor.b != 1) {
                    this.attachmentColor = attchmentColor;
                }
                color.r = slotColor.r * attchmentColor.r;
                color.g = slotColor.g * attchmentColor.g;
                color.b = slotColor.b * attchmentColor.b;
                color.a = slotColor.a * attchmentColor.a;
            }
            return true;
        }
    }

    class SlotUtils {
        static checkAttachment(attachment) {
            if (attachment == null)
                return exports.ESpineRenderType.rigidBody;
            if (attachment instanceof window.spine.RegionAttachment) {
                return exports.ESpineRenderType.rigidBody;
            }
            else if (attachment instanceof window.spine.MeshAttachment) {
                let mesh = attachment;
                if (!mesh.bones) {
                    return exports.ESpineRenderType.rigidBody;
                }
                else {
                    return exports.ESpineRenderType.boneGPU;
                }
            }
            else {
                return exports.ESpineRenderType.normal;
            }
        }
        static appendIndexArray(attachmentParse, indexArray, size, offset) {
            if (!attachmentParse.attachment)
                return offset;
            let slotindexArray = attachmentParse.indexArray;
            for (let j = 0, n = slotindexArray.length; j < n; j++) {
                indexArray[offset] = slotindexArray[j] + size;
                offset++;
            }
            return offset;
        }
    }

    class AnimationRenderProxy {
        constructor(animator) {
            this.animator = animator;
            this.reset();
        }
        set skinIndex(value) {
            this.currentSKin = this.animator.skinDataArray[value];
        }
        get name() {
            return this.animator.name;
        }
        reset() {
            this.currentTime = -1;
            this.currentFrameIndex = -2;
        }
        renderWithOutMat(slots, updator, curTime) {
            let beforeFrame = this.currentFrameIndex;
            let nowFrame = this.animator.getFrameIndex(curTime, beforeFrame);
            let currentSKin = this.currentSKin;
            let vb = currentSKin.vb;
            if (currentSKin.checkVBChange(slots)) {
                updator.updateVB(vb.vb, vb.vbLength);
            }
            if (nowFrame != beforeFrame) {
                let ib = currentSKin.getIB(nowFrame);
                updator.updateIB(ib.realIb, ib.type, ib.size, ib.realIb.length, ib.outRenderData, currentSKin.mutiRenderAble);
                this.currentTime = curTime;
                this.currentFrameIndex = nowFrame;
            }
        }
        render(bones, slots, updator, curTime, boneMat) {
            this.renderWithOutMat(slots, updator, curTime);
            this.currentSKin.updateBoneMat(curTime, this.animator, bones, this.state, boneMat);
        }
    }

    class SpineOptimizeRender {
        constructor(spineOptimize) {
            this._skinIndex = 0;
            this.renderProxyMap = new Map();
            this.geoMap = new Map();
            this.animatorMap = new Map();
            this.skinRenderArray = [];
            this.boneMat = new Float32Array(spineOptimize.maxBoneNumber * 8);
            spineOptimize.skinAttachArray.forEach((value) => {
                this.skinRenderArray.push(new SkinRender(this, value));
            });
            let animators = spineOptimize.animators;
            for (let i = 0, n = animators.length; i < n; i++) {
                let animator = animators[i];
                this.animatorMap.set(animator.name, new AnimationRenderProxy(animator));
            }
            this.currentRender = this.skinRenderArray[this._skinIndex];
        }
        getSpineColor() {
            return this.spineColor;
        }
        destroy() {
            this.geoMap.forEach((value) => {
                value.geo.destroy();
                value.vb.destroy();
                value.ib.destroy();
            });
            this.geoMap.clear();
            this.animatorMap.clear();
        }
        initBake(obj) {
            this.bakeData = obj;
            if (obj) {
                let render = this.renderProxyMap.get(ERenderProxyType.RenderBake) || new RenderBake(this.bones, this.slots, this._nodeOwner);
                render.simpleAnimatorTexture = obj.texture2d;
                render._bonesNums = obj.bonesNums;
                render.aniOffsetMap = obj.aniOffsetMap;
                this.renderProxyMap.set(ERenderProxyType.RenderBake, render);
            }
            this.isBake = !!obj;
            if (this._curAnimationName) {
                this._clear();
                this.play(this._curAnimationName);
            }
        }
        initRender(type) {
            let geoResult = this.geoMap.get(type);
            if (!geoResult) {
                let geo = Laya.LayaGL.renderDeviceFactory.createRenderGeometryElement(Laya.MeshTopology.Triangles, Laya.DrawType.DrawElement);
                let mesh = Laya.LayaGL.renderDeviceFactory.createBufferState();
                geo.bufferState = mesh;
                let vb = Laya.LayaGL.renderDeviceFactory.createVertexBuffer(Laya.BufferUsage.Dynamic);
                vb.vertexDeclaration = type == exports.ESpineRenderType.rigidBody ? SpineShaderInit.SpineRBVertexDeclaration : SpineShaderInit.SpineFastVertexDeclaration;
                let ib = Laya.LayaGL.renderDeviceFactory.createIndexBuffer(Laya.BufferUsage.Dynamic);
                mesh.applyState([vb], ib);
                geo.indexFormat = Laya.IndexFormat.UInt16;
                geoResult = { geo, vb, ib };
                this.geoMap.set(type, geoResult);
            }
            return geoResult;
        }
        changeSkeleton(skeleton) {
            this._skeleton = skeleton;
            this.bones = skeleton.bones;
            this.slots = skeleton.slots;
            this.renderProxyMap.get(ERenderProxyType.RenderNormal)._skeleton = skeleton;
        }
        init(skeleton, templet, renderNode, state) {
            this._skeleton = skeleton;
            this.bones = skeleton.bones;
            this.slots = skeleton.slots;
            this._nodeOwner = renderNode;
            let scolor = skeleton.color;
            this.spineColor = new Laya.Color(scolor.r, scolor.g, scolor.b, scolor.a);
            let color = renderNode._spriteShaderData.getColor(SpineShaderInit.Color) || new Laya.Color();
            color.setValue(scolor.r, scolor.g, scolor.b, scolor.a);
            if (renderNode._renderAlpha !== undefined) {
                color.a *= renderNode._renderAlpha;
            }
            else
                color.a *= renderNode.owner.alpha;
            renderNode._spriteShaderData.setColor(SpineShaderInit.Color, color);
            this.skinRenderArray.forEach((value) => {
                value.init(skeleton, templet, renderNode);
            });
            this._state = state;
            this.animatorMap.forEach((value, key) => {
                value.state = state;
            });
            let renderOptimize = new RenderOptimize(this.bones, this.slots, this._nodeOwner);
            let renderNormal = new RenderNormal(skeleton, this._nodeOwner);
            this.renderProxyMap.set(ERenderProxyType.RenderNormal, renderNormal);
            this.renderProxyMap.set(ERenderProxyType.RenderOptimize, renderOptimize);
        }
        get renderProxytype() {
            return this._renderProxytype;
        }
        set renderProxytype(value) {
            if (this.isBake && value == ERenderProxyType.RenderOptimize) {
                if (this.bakeData.aniOffsetMap[this._curAnimationName] != undefined) {
                    value = ERenderProxyType.RenderBake;
                }
            }
            this.renderProxy = this.renderProxyMap.get(value);
            if (value == ERenderProxyType.RenderNormal) {
                this._nodeOwner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_FAST);
                this._nodeOwner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_RB);
            }
            this._renderProxytype = value;
        }
        beginCache() {
            this._state.apply = this._state.applyCache;
            this._state.getCurrentPlayTime = this._state.getCurrentPlayTimeByCache;
            this._skeleton.updateWorldTransform = this._skeleton.updateWorldTransformCache;
        }
        endCache() {
            this._state.apply = this._state.oldApply;
            this._state.getCurrentPlayTime = this._state.getCurrentPlayTimeOld;
            this._skeleton.updateWorldTransform = this._skeleton.oldUpdateWorldTransform;
        }
        setSkinIndex(index) {
            this._skinIndex = index;
            this.currentRender = this.skinRenderArray[index];
            switch (this.currentRender.skinAttachType) {
                case exports.ESpineRenderType.boneGPU:
                    this._nodeOwner._spriteShaderData.addDefine(SpineShaderInit.SPINE_FAST);
                    this._nodeOwner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_RB);
                    break;
                case exports.ESpineRenderType.rigidBody:
                    this._nodeOwner._spriteShaderData.addDefine(SpineShaderInit.SPINE_RB);
                    this._nodeOwner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_FAST);
                    break;
                case exports.ESpineRenderType.normal:
                    this._nodeOwner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_FAST);
                    this._nodeOwner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_RB);
                    break;
            }
            if (this.currentAnimation) {
                this._clear();
                this.play(this._curAnimationName);
            }
        }
        _clear() {
            this._nodeOwner.clear();
            this._isRender = false;
        }
        play(animationName) {
            this._curAnimationName = animationName;
            let currentRender = this.currentRender;
            let oldRenderProxy = this.renderProxy;
            let old = this.currentAnimation;
            let oldSkinData = old ? old.currentSKin : null;
            let currentAnimation = this.currentAnimation = this.animatorMap.get(animationName);
            currentAnimation.skinIndex = this._skinIndex;
            let currentSKin = currentAnimation.currentSKin;
            if (old) {
                old.reset();
            }
            if (currentSKin.isNormalRender) {
                this.renderProxytype = ERenderProxyType.RenderNormal;
            }
            else {
                if (currentRender.vertexBones > 4) {
                    console.warn(`In FastRender mode - Current skin: ${currentRender.name} has ${currentRender.vertexBones} bones influencing each vertex. This exceeds the recommended limit of 4 bones per vertex.`);
                }
                switch (this.currentRender.skinAttachType) {
                    case exports.ESpineRenderType.boneGPU:
                        this._nodeOwner._spriteShaderData.addDefine(SpineShaderInit.SPINE_FAST);
                        this._nodeOwner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_RB);
                        break;
                    case exports.ESpineRenderType.rigidBody:
                        this._nodeOwner._spriteShaderData.addDefine(SpineShaderInit.SPINE_RB);
                        this._nodeOwner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_FAST);
                        break;
                    case exports.ESpineRenderType.normal:
                        this._nodeOwner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_FAST);
                        this._nodeOwner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_RB);
                        break;
                }
                if (old && oldSkinData.isNormalRender) {
                    this._clear();
                }
                if (oldSkinData != currentSKin) {
                    currentRender.updateVB(currentSKin.vb.vb, currentSKin.vb.vbLength);
                }
                let mutiRenderAble = currentSKin.mutiRenderAble;
                if (this._isRender) {
                    if (mutiRenderAble != oldSkinData.mutiRenderAble) {
                        this._clear();
                    }
                }
                if (!this._isRender) {
                    if (mutiRenderAble) {
                        this.renderProxytype = ERenderProxyType.RenderOptimize;
                    }
                    else {
                        this.renderProxytype = ERenderProxyType.RenderOptimize;
                    }
                    this._isRender = true;
                }
            }
            if (oldRenderProxy) {
                oldRenderProxy.leave();
            }
            this.renderProxy.change(currentRender, currentAnimation);
            if ((currentAnimation.animator.isCache || this.renderProxytype == ERenderProxyType.RenderBake) && !currentSKin.isNormalRender) {
                this.beginCache();
            }
            else {
                this.endCache();
            }
        }
        render(time) {
            this.renderProxy.render(time, this.boneMat);
        }
    }
    var ERenderProxyType;
    (function (ERenderProxyType) {
        ERenderProxyType[ERenderProxyType["RenderNormal"] = 0] = "RenderNormal";
        ERenderProxyType[ERenderProxyType["RenderOptimize"] = 1] = "RenderOptimize";
        ERenderProxyType[ERenderProxyType["RenderBake"] = 2] = "RenderBake";
    })(ERenderProxyType || (ERenderProxyType = {}));
    class RenderOptimize {
        constructor(bones, slots, renderNode) {
            this.bones = bones;
            this.slots = slots;
            this._renderNode = renderNode;
        }
        change(currentRender, currentAnimation) {
            this.skinRender = currentRender;
            this.currentAnimation = currentAnimation;
        }
        leave() {
        }
        render(curTime, boneMat) {
            this.currentAnimation.render(this.bones, this.slots, this.skinRender, curTime, boneMat);
            this._renderNode._spriteShaderData.setBuffer(SpineShaderInit.BONEMAT, boneMat);
        }
    }
    class RenderNormal {
        constructor(skeleton, renderNode) {
            this._renderNode = renderNode;
            this._skeleton = skeleton;
        }
        leave() {
        }
        change(currentRender, currentAnimation) {
            this._renerer = currentRender._renerer;
        }
        render(curTime, boneMat) {
            this._renderNode.clear();
            this._renerer.draw(this._skeleton, this._renderNode, -1, -1);
        }
    }
    class RenderBake {
        get simpleAnimatorTexture() {
            return this._simpleAnimatorTexture;
        }
        set simpleAnimatorTexture(value) {
            if (this._simpleAnimatorTexture) {
                this._simpleAnimatorTexture._removeReference();
            }
            this._simpleAnimatorTexture = value;
            this._simpleAnimatorTextureSize = value.width;
            this._renderNode._spriteShaderData.setTexture(SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURE, value);
            value._addReference();
            this._renderNode._spriteShaderData.setNumber(SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURESIZE, this._simpleAnimatorTextureSize);
        }
        get simpleAnimatorOffset() {
            return this._simpleAnimatorOffset;
        }
        set simpleAnimatorOffset(value) {
            value.cloneTo(this._simpleAnimatorOffset);
        }
        constructor(bones, slots, renderNode) {
            this.step = 1 / 60;
            this._simpleAnimatorParams = new Laya.Vector4();
            this.bones = bones;
            this.slots = slots;
            this._renderNode = renderNode;
            this._simpleAnimatorOffset = new Laya.Vector2();
        }
        leave() {
            this._renderNode._spriteShaderData.removeDefine(SpineShaderInit.SPINE_SIMPLE);
            this._renderNode._renderType = Laya.BaseRender2DType.spine;
        }
        change(currentRender, currentAnimation) {
            this.skinRender = currentRender;
            this.currentAnimation = currentAnimation;
            this._renderNode._spriteShaderData.addDefine(SpineShaderInit.SPINE_SIMPLE);
            this._simpleAnimatorOffset.x = this.aniOffsetMap[currentAnimation.name];
            if (currentAnimation.currentSKin.canInstance) {
                this._renderNode._renderType = Laya.BaseRender2DType.spineSimple;
            }
        }
        _computeAnimatorParamsData() {
            this._simpleAnimatorParams.x = this._simpleAnimatorOffset.x;
            this._simpleAnimatorParams.y = Math.round(this._simpleAnimatorOffset.y) * this._bonesNums * 2;
        }
        setCustomData(value1, value2 = 0) {
            this._simpleAnimatorParams.z = value1;
            this._simpleAnimatorParams.w = value2;
        }
        render(curTime, boneMat) {
            this.currentAnimation.renderWithOutMat(this.slots, this.skinRender, curTime);
            this._simpleAnimatorOffset.y = curTime / this.step;
            this._computeAnimatorParamsData();
            this._renderNode._spriteShaderData.setVector(SpineShaderInit.SIMPLE_SIMPLEANIMATORPARAMS, this._simpleAnimatorParams);
        }
    }
    class SkinRender {
        constructor(owner, skinAttach) {
            this.currentMaterials = [];
            this.vertexBones = 0;
            this.owner = owner;
            this.name = skinAttach.name;
            this.elements = [];
            this.vertexBones = skinAttach.vertexBones;
            this.hasNormalRender = skinAttach.hasNormalRender;
            this.elementsMap = new Map();
            this.skinAttachType = skinAttach.type;
            let geoResult = owner.initRender(skinAttach.type);
            this.geo = geoResult.geo;
            this.vb = geoResult.vb;
            this.ib = geoResult.ib;
        }
        getMaterialByName(name, blendMode) {
            return this.templet.getMaterial(this.templet.getTexture(name), blendMode);
        }
        updateVB(vertexArray, vbLength) {
            let vb = this.vb;
            let vblen = vbLength * 4;
            vb.setDataLength(vblen);
            vb.setData(vertexArray.buffer, 0, 0, vblen);
        }
        updateIB(indexArray, type, size, ibLength, mutiRenderData, isMuti) {
            let ib = this.ib;
            ib._setIndexDataLength(ibLength * size);
            ib._setIndexData(indexArray, 0);
            ib.indexType = type;
            ib.indexCount = ibLength;
            this.geo.indexFormat = type;
            if (isMuti) {
                let elementsCreator = this.elementsMap.get(mutiRenderData.id);
                if (!elementsCreator) {
                    elementsCreator = new ElementCreator(mutiRenderData, this);
                    this.elementsMap.set(mutiRenderData.id, elementsCreator);
                }
                elementsCreator.cloneTo(this.elements);
                this.currentMaterials = elementsCreator.currentMaterials;
                this.owner._nodeOwner.updateElements(this.geo, this.elements);
            }
            else {
                let currentData = mutiRenderData.currentData;
                if (!currentData) {
                    this.owner._nodeOwner.clear();
                    this.currentData = null;
                    return;
                }
                let material = currentData.material;
                if (!material) {
                    material = currentData.material = this.getMaterialByName(currentData.textureName, currentData.blendMode);
                }
                if (currentData != this.currentData) {
                    this.owner._nodeOwner.clear();
                    this.owner._nodeOwner.drawGeo(this.geo, material, ibLength, 0);
                    this.currentData = currentData;
                }
            }
        }
        init(skeleton, templet, renderNode) {
            this.templet = templet;
            if (this.hasNormalRender) {
                this._renerer = SpineAdapter.createNormalRender(templet, false);
            }
        }
        render(time) {
        }
    }
    class ElementCreator {
        constructor(mutiRenderData, skinData) {
            let elements = this.elements = [];
            let currentMaterials = this.currentMaterials = [];
            let renderData = mutiRenderData.renderData;
            for (let i = 0, n = renderData.length; i < n; i++) {
                let data = renderData[i];
                let mat = skinData.getMaterialByName(data.textureName, data.blendMode);
                if (currentMaterials.indexOf(mat) == -1) {
                    this.currentMaterials.push(mat);
                }
                elements[i] = [mat, data.length, data.offset * 2];
            }
        }
        cloneTo(source) {
            let target = this.elements;
            for (let i = 0, n = target.length; i < n; i++) {
                source[i] = target[i];
            }
            source.length = target.length;
        }
    }

    class VBCreator {
        constructor(autoNew = true, maxVertexCount = 0) {
            this.boneMaxId = 0;
            this.maxVertexCount = maxVertexCount;
            this.init(autoNew);
        }
        init(autoNew) {
            this.mapIndex = new Map();
            this.slotVBMap = new Map();
            this.boneArray = [];
            if (autoNew) {
                this._updateBuffer();
            }
            this.vbLength = 0;
        }
        _updateBuffer() {
            let oldbuffer = this.vb;
            this.vb = new Float32Array(this.maxVertexCount * this.vertexSize);
            if (oldbuffer)
                this.vb.set(oldbuffer);
        }
        setBufferLength(maxVertexCount) {
            if (maxVertexCount <= this.maxVertexCount)
                return;
            this.maxVertexCount = maxVertexCount;
            this._updateBuffer();
        }
        appendAndCreateIB(attach) {
            this.appendVB(attach);
        }
        getBoneId(boneIndex) {
            let id = this.mapIndex.get(boneIndex);
            if (id == undefined) {
                id = this.boneMaxId;
                this.mapIndex.set(boneIndex, id);
                this.boneArray.push(id, boneIndex);
                this.boneMaxId++;
            }
            return id;
        }
        initBoneMat() {
            this.boneMat = new Float32Array(8 * this.mapIndex.size);
        }
        appendVB(attach) {
            let offset;
            let map = this.slotVBMap.get(attach.slotId);
            if (map) {
                let offset = map.get(attach.attachment);
                if (offset != undefined) {
                    return offset;
                }
            }
            else {
                map = new Map();
                this.slotVBMap.set(attach.slotId, map);
            }
            offset = this.vbLength / this.vertexSize;
            map.set(attach.attachment, { offset: offset, attachment: attach });
            if (!attach.vertexCount)
                return offset;
            if (offset + attach.vertexCount >= this.maxVertexCount) {
                this.setBufferLength(offset + attach.vertexCount);
            }
            this.vbLength = this.appendVertexArray(attach, this.vb, this.vbLength, this);
            return offset;
        }
        updateBone(bones, boneMat) {
            let boneArray = this.boneArray;
            for (let i = 0, n = boneArray.length; i < n; i += 2) {
                let offset = boneArray[i] * 8;
                let bone = bones[boneArray[i + 1]];
                boneMat[offset] = bone.a;
                boneMat[offset + 1] = bone.b;
                boneMat[offset + 2] = bone.worldX;
                boneMat[offset + 3] = 0;
                boneMat[offset + 4] = bone.c;
                boneMat[offset + 5] = bone.d;
                boneMat[offset + 6] = bone.worldY;
                boneMat[offset + 7] = 0;
            }
        }
        updateBoneCache(boneFrames, frames, boneMat) {
            let boneArray = this.boneArray;
            let floor = Math.floor(frames);
            let detal;
            if (floor == boneFrames.length - 1) {
                detal = 0;
            }
            else {
                detal = frames - floor;
            }
            let boneFrames1 = boneFrames[floor];
            let boneFrames2 = boneFrames[floor + 1];
            if (detal > 0.0001) {
                for (let i = 0, n = boneArray.length; i < n; i += 2) {
                    let offset = boneArray[i] * 8;
                    let boneFloatArray = boneFrames1[boneArray[i + 1]];
                    let boneFloatArray2 = boneFrames2[boneArray[i + 1]];
                    boneMat[offset] = boneFloatArray[0] + (boneFloatArray2[0] - boneFloatArray[0]) * detal;
                    boneMat[offset + 1] = boneFloatArray[1] + (boneFloatArray2[1] - boneFloatArray[1]) * detal;
                    boneMat[offset + 2] = boneFloatArray[2] + (boneFloatArray2[2] - boneFloatArray[2]) * detal;
                    boneMat[offset + 3] = 0;
                    boneMat[offset + 4] = boneFloatArray[4] + (boneFloatArray2[4] - boneFloatArray[4]) * detal;
                    boneMat[offset + 5] = boneFloatArray[5] + (boneFloatArray2[5] - boneFloatArray[5]) * detal;
                    boneMat[offset + 6] = boneFloatArray[6] + (boneFloatArray2[6] - boneFloatArray[6]) * detal;
                    boneMat[offset + 7] = 0;
                }
            }
            else {
                for (let i = 0, n = boneArray.length; i < n; i += 2) {
                    let offset = boneArray[i] * 8;
                    let bone = boneFrames1[boneArray[i + 1]];
                    boneMat.set(bone, offset);
                }
            }
        }
        _cloneTo(target) {
            target.vb = new Float32Array(this.vb);
            target.vbLength = this.vbLength;
            target.mapIndex = new Map(this.mapIndex);
            target.boneMaxId = this.boneMaxId;
            target.boneArray = this.boneArray.slice();
            this.slotVBMap.forEach((value, key) => {
                target.slotVBMap.set(key, new Map(value));
            });
        }
        clone() {
            let rs = this._create();
            this._cloneTo(rs);
            return rs;
        }
    }
    class VBBoneCreator extends VBCreator {
        _create() {
            return new VBBoneCreator(false, this.maxVertexCount);
        }
        get vertexSize() {
            return SpineOptimizeConst.BONEVERTEX;
        }
        appendVertexArray(attachmentParse, vertexArray, offset, boneGet) {
            if (!attachmentParse.attachment) {
                boneGet.getBoneId(attachmentParse.boneIndex);
                return offset;
            }
            let vside = this.vertexSize;
            let slotVertex = attachmentParse.vertexArray;
            let uvs = attachmentParse.uvs;
            let color = attachmentParse.color;
            if (attachmentParse.stride == 2) {
                let boneid = boneGet.getBoneId(attachmentParse.boneIndex);
                for (let j = 0, n = slotVertex.length; j < n; j += attachmentParse.stride) {
                    vertexArray[offset] = uvs[j];
                    vertexArray[offset + 1] = uvs[j + 1];
                    vertexArray[offset + 2] = color.r;
                    vertexArray[offset + 3] = color.g;
                    vertexArray[offset + 4] = color.b;
                    vertexArray[offset + 5] = color.a;
                    vertexArray[offset + 6] = slotVertex[j];
                    vertexArray[offset + 7] = slotVertex[j + 1];
                    vertexArray[offset + 8] = 1;
                    vertexArray[offset + 9] = boneid;
                    let leftsize = vside - 10;
                    let ox = offset + 10;
                    for (let z = 0; z < leftsize / 4; z++) {
                        vertexArray[ox + z * 4] = 0;
                        vertexArray[ox + z * 4 + 1] = 0;
                        vertexArray[ox + z * 4 + 2] = 0;
                        vertexArray[ox + z * 4 + 3] = 0;
                    }
                    offset += vside;
                }
            }
            else {
                for (let j = 0, uvid = 0, n = slotVertex.length; j < n; j += attachmentParse.stride, uvid += 2) {
                    vertexArray[offset] = uvs[uvid];
                    vertexArray[offset + 1] = uvs[uvid + 1];
                    vertexArray[offset + 2] = color.r;
                    vertexArray[offset + 3] = color.g;
                    vertexArray[offset + 4] = color.b;
                    vertexArray[offset + 5] = color.a;
                    let leftsize = vside - 6;
                    let ox = offset + 6;
                    for (let z = 0; z < leftsize / 4; z++) {
                        vertexArray[ox + z * 4] = slotVertex[j + z * 4];
                        vertexArray[ox + z * 4 + 1] = slotVertex[j + z * 4 + 1];
                        vertexArray[ox + z * 4 + 2] = slotVertex[j + z * 4 + 2];
                        vertexArray[ox + z * 4 + 3] = boneGet.getBoneId(slotVertex[j + z * 4 + 3]);
                    }
                    offset += vside;
                }
            }
            return offset;
        }
        appendDeform(attachmentParse, deform, offset, out) {
            if (!attachmentParse.attachment) {
                return;
            }
            let vside = this.vertexSize;
            let slotVertex = attachmentParse.vertexArray;
            if (attachmentParse.stride == 2) {
                for (let j = 0, n = slotVertex.length; j < n; j += attachmentParse.stride) {
                    out[offset + 6] = deform[j];
                    out[offset + 7] = deform[j + 1];
                    offset += vside;
                }
            }
            else {
                let attchment = attachmentParse.sourceData;
                let bones = attchment.bones;
                let vertexCount = attachmentParse.vertexCount;
                let maxbones = (vside - 6) / 4;
                let f = 0, v = 0;
                for (let w = 0; w < vertexCount; w++) {
                    let len = bones[v++];
                    let slotOffset = w * (vside - 6);
                    let vertexOffset = offset + w * vside + 6;
                    for (let i = 0; i < len; i++) {
                        if (i >= maxbones)
                            break;
                        let deformOffset = f + i * 2;
                        let slotIndex = slotOffset + i * 4;
                        let boneOffset = vertexOffset + i * 4;
                        out[boneOffset] = slotVertex[slotIndex] + deform[deformOffset];
                        out[boneOffset + 1] = slotVertex[slotIndex + 1] + deform[deformOffset + 1];
                    }
                    v += len;
                    f += 2 * len;
                }
            }
        }
    }
    class VBRigBodyCreator extends VBCreator {
        _create() {
            return new VBRigBodyCreator(false, this.maxVertexCount);
        }
        get vertexSize() {
            return 9;
        }
        appendVertexArray(attachmentParse, vertexArray, offset, boneGet) {
            let slotVertex = attachmentParse.vertexArray;
            let uvs = attachmentParse.uvs;
            let color = attachmentParse.color;
            let vside = this.vertexSize;
            if (attachmentParse.stride == 2) {
                let boneid = boneGet.getBoneId(attachmentParse.boneIndex);
                for (let j = 0, n = slotVertex.length; j < n; j += attachmentParse.stride) {
                    vertexArray[offset + 6] = slotVertex[j];
                    vertexArray[offset + 7] = slotVertex[j + 1];
                    vertexArray[offset + 2] = color.r;
                    vertexArray[offset + 3] = color.g;
                    vertexArray[offset + 4] = color.b;
                    vertexArray[offset + 5] = color.a;
                    vertexArray[offset + 0] = uvs[j];
                    vertexArray[offset + 1] = uvs[j + 1];
                    vertexArray[offset + 8] = boneid;
                    offset += vside;
                }
            }
            return offset;
        }
        appendDeform(attachmentParse, deform, offset, out) {
            if (!attachmentParse.attachment) {
                return;
            }
            let vside = this.vertexSize;
            let slotVertex = attachmentParse.vertexArray;
            if (attachmentParse.stride == 2) {
                for (let j = 0, n = slotVertex.length; j < n; j += attachmentParse.stride) {
                    out[offset + 6] = deform[j];
                    out[offset + 7] = deform[j + 1];
                    offset += vside;
                }
            }
        }
    }

    class SketonOptimise {
        constructor() {
            this.blendModeMap = new Map();
            this.skinAttachArray = [];
            this.animators = [];
            this.canCache = SketonOptimise.cacheSwitch;
        }
        _initSpineRender(skeleton, templet, renderNode, state) {
            let sp;
            if (SketonOptimise.normalRenderSwitch) {
                sp = new SpineNormalRender();
            }
            else if (this.maxBoneNumber > SketonOptimise.MAX_BONES) {
                console.warn("The number of Bones :", this.maxBoneNumber, " > ", SketonOptimise.MAX_BONES, ", use CPU caculation");
                sp = new SpineNormalRender();
            }
            else {
                sp = new SpineOptimizeRender(this);
            }
            sp.init(skeleton, templet, renderNode, state);
            return sp;
        }
        _updateState(delta) {
            this._state.update(delta);
            this._state.getCurrent(0);
            this._state.apply(this.sketon);
            this.sketon.updateWorldTransform();
            return this.sketon.bones;
        }
        _play(animationName) {
            let trackEntry = this._state.setAnimation(0, animationName, true);
            trackEntry.animationStart = 0;
            let animationDuration = trackEntry.animation.duration;
            return animationDuration;
        }
        checkMainAttach(skeletonData) {
            this.sketon = new window.spine.Skeleton(skeletonData);
            this._stateData = new window.spine.AnimationStateData(this.sketon.data);
            this._state = new window.spine.AnimationState(this._stateData);
            this.attachMentParse(skeletonData);
            this.initAnimation(skeletonData.animations);
        }
        attachMentParse(skeletonData) {
            let skins = skeletonData.skins;
            let slots = skeletonData.slots;
            let defaultSkinAttach;
            for (let i = 0, n = skins.length; i < n; i++) {
                let skin = skins[i];
                let skinAttach = new SkinAttach();
                skinAttach.name = skin.name;
                if (i != 0) {
                    skinAttach.copyFrom(defaultSkinAttach);
                }
                skinAttach.attachMentParse(skin, slots);
                this.skinAttachArray.push(skinAttach);
                skinAttach.checkMainAttach(slots);
                if (i == 0) {
                    defaultSkinAttach = skinAttach;
                }
            }
        }
        initAnimation(animations) {
            let maxBoneNumber = 0;
            for (let i = 0, n = animations.length; i < n; i++) {
                let animation = animations[i];
                let animator = new AnimationRender();
                animator.check(animation, this);
                this.animators.push(animator);
                this.skinAttachArray.forEach((value) => {
                    value.initAnimator(animator);
                });
                animator.skinDataArray.forEach((skinData) => {
                    if (!skinData.isNormalRender) {
                        let boneNumber = skinData.vb.boneArray.length / 2;
                        if (boneNumber > maxBoneNumber) {
                            maxBoneNumber = boneNumber;
                        }
                    }
                });
            }
            this.maxBoneNumber = maxBoneNumber;
        }
        cacheBone() {
            if (!SketonOptimise.cacheSwitch) {
                for (let i = 0, n = this.animators.length; i < n; i++) {
                    let animator = this.animators[i];
                    if (animator.boneFrames.length == 0) {
                        animator.cacheBones(this);
                    }
                }
            }
        }
        init(slots) {
        }
    }
    SketonOptimise.normalRenderSwitch = false;
    SketonOptimise.MAX_BONES = 100;
    SketonOptimise.cacheSwitch = false;
    class SkinAttach {
        constructor() {
            this.vertexBones = 0;
            this.slotAttachMap = new Map();
            this.mainAttachMentOrder = [];
        }
        copyFrom(other) {
            other.slotAttachMap.forEach((value, key) => {
                this.slotAttachMap.set(key, new Map(value));
            });
        }
        checkMainAttach(slots) {
            this.init(slots);
        }
        attachMentParse(skinData, slots) {
            let type = exports.ESpineRenderType.rigidBody;
            let vertexBones = 0;
            let attachments = skinData.attachments;
            let vertexCount = 0;
            let indexCount = 0;
            for (let i = 0, n = slots.length; i < n; i++) {
                let attachment = attachments[i];
                let slot = slots[i];
                let boneIndex = slot.boneData.index;
                let map = this.slotAttachMap.get(i);
                let slotAttachName = slot.attachmentName;
                if (!map) {
                    map = new Map();
                    this.slotAttachMap.set(i, map);
                }
                if (attachment) {
                    for (let key in attachment) {
                        let attach = attachment[key];
                        let deform = null;
                        let parse = new AttachmentParse();
                        parse.init(attach, boneIndex, i, deform, slot);
                        vertexBones = Math.max(vertexBones, parse.vertexBones);
                        let tempType = SlotUtils.checkAttachment(parse ? parse.sourceData : null);
                        if (tempType < type) {
                            type = tempType;
                        }
                        indexCount += parse.indexCount;
                        vertexCount += parse.vertexCount;
                        map.set(key, parse);
                    }
                }
                else if (slotAttachName) {
                    let parse = map.get(slotAttachName);
                    if (parse) {
                        indexCount += parse.indexCount;
                        vertexCount += parse.vertexCount;
                        vertexBones = Math.max(vertexBones, parse.vertexBones);
                        let tempType = SlotUtils.checkAttachment(parse ? parse.sourceData : null);
                        if (tempType < type) {
                            type = tempType;
                        }
                    }
                }
                if (!map.get(null)) {
                    let nullAttachment = new AttachmentParse();
                    nullAttachment.slotId = i;
                    nullAttachment.color = slot.color;
                    nullAttachment.boneIndex = boneIndex;
                    nullAttachment.attachment = null;
                    map.set(nullAttachment.attachment, nullAttachment);
                }
            }
            this.type = type;
            this.vertexBones = vertexBones;
            switch (this.type) {
                case exports.ESpineRenderType.normal:
                    this.mainVB = new VBBoneCreator(true, vertexCount);
                    break;
                case exports.ESpineRenderType.boneGPU:
                    this.mainVB = new VBBoneCreator(true, vertexCount);
                    break;
                case exports.ESpineRenderType.rigidBody:
                    this.mainVB = new VBRigBodyCreator(true, vertexCount);
                    break;
            }
            this.mainIB = new IBCreator();
            this.mainIB.updateFormat(vertexCount);
            this.mainIB.setBufferLength(indexCount);
        }
        init(slots) {
            let mainAttachMentOrder = this.mainAttachMentOrder;
            slots.forEach((slot, index) => {
                let attchment = slot.attachmentName;
                if (attchment) {
                    let attach = this.slotAttachMap.get(index).get(attchment);
                    if (attach) {
                        this.mainVB.appendVB(attach);
                    }
                    else {
                        attach = this.slotAttachMap.get(index).get(null);
                    }
                    if (attach.isclip)
                        this.isNormalRender = true;
                    mainAttachMentOrder.push(attach);
                }
                else {
                    let attach = this.slotAttachMap.get(index).get(null);
                    mainAttachMentOrder.push(attach);
                }
            });
            this.mainVB.initBoneMat();
            this.mainIB.createIB(mainAttachMentOrder, this.mainVB);
        }
        initAnimator(animator) {
            let skinData = animator.createSkinData(this.mainVB, this.mainIB, this.slotAttachMap, this.mainAttachMentOrder);
            if (this.isNormalRender) {
                skinData.isNormalRender = true;
            }
            skinData.mainibRender = this.mainIB;
            skinData.name = this.name;
            if (skinData.isNormalRender) {
                this.hasNormalRender = true;
            }
        }
    }

    class SpineEmptyRender {
        getSpineColor() {
            return Laya.Color.WHITE;
        }
        changeSkeleton(skeleton) {
        }
        init(skeleton, templet, renderNode, state) {
        }
        play(animationName) {
        }
        render(time) {
        }
        setSkinIndex(index) {
        }
        initBake(obj) {
        }
        destroy() {
        }
    }
    SpineEmptyRender.instance = new SpineEmptyRender();

    class Spine2DRenderNode extends Laya.BaseRenderNode2D {
        static createRenderElement2D() {
            if (this._pool.length > 0) {
                return this._pool.pop();
            }
            let element = Laya.LayaGL.render2DRenderPassFactory.createRenderElement2D();
            element.geometry = Laya.LayaGL.renderDeviceFactory.createRenderGeometryElement(Laya.MeshTopology.Triangles, Laya.DrawType.DrawElement);
            element.renderStateIsBySprite = false;
            return element;
        }
        static recoverRenderElement2D(value) {
            if (!value.canotPool) {
                this._pool.push(value);
            }
        }
        constructor() {
            super();
            this._currentPlayTime = 0;
            this._pause = true;
            this._playbackRate = 1.0;
            this._playAudio = true;
            this._soundChannelArr = [];
            this.trackIndex = 0;
            this._skinName = "default";
            this._loop = true;
            this._matBuffer = new Float32Array(6);
            this._useFastRender = true;
            this._needUpdate = false;
            this._renderElements = [];
            this._materials = [];
            this.spineItem = SpineEmptyRender.instance;
        }
        get externalSkins() {
            return this._externalSkins;
        }
        set externalSkins(value) {
            if (value) {
                for (let i = value.length - 1; i >= 0; i--) {
                    value[i].target = this;
                }
            }
            this._externalSkins = value;
        }
        addCMDCall(context, px, py) {
            let shaderData = this._spriteShaderData;
            let mat = context._curMat;
            let buffer = this._matBuffer;
            buffer[0] = mat.a;
            buffer[1] = -mat.c;
            buffer[2] = mat.tx + mat.a * px + mat.c * py;
            buffer[3] = mat.b;
            buffer[4] = -mat.d;
            buffer[5] = mat.ty + mat.b * px + mat.d * py;
            shaderData.setBuffer(SpineShaderInit.NMatrix, buffer);
            Laya.Vector2.TempVector2.setValue(context.width, context.height);
            shaderData.setVector2(SpineShaderInit.Size, Laya.Vector2.TempVector2);
            if (this._renderAlpha !== context.globalAlpha) {
                let scolor = this.spineItem.getSpineColor();
                let a = scolor.a * context.globalAlpha;
                let color = shaderData.getColor(SpineShaderInit.Color) || new Laya.Color();
                color.setValue(scolor.r, scolor.g, scolor.b, a);
                shaderData.setColor(SpineShaderInit.Color, color);
                this._renderAlpha = context.globalAlpha;
            }
            let filter = context._colorFiler;
            if (filter) {
                this._spriteShaderData.addDefine(Laya.ShaderDefines2D.FILTERCOLOR);
                Laya.Matrix4x4.TEMPMatrix0.cloneByArray(filter._mat);
                shaderData.setMatrix4x4(Laya.ShaderDefines2D.UNIFORM_COLORMAT, Laya.Matrix4x4.TEMPMatrix0);
                Laya.Vector4.tempVec4.setValue(filter._alpha[0], filter._alpha[1], filter._alpha[2], filter._alpha[3]);
                shaderData.setVector(Laya.ShaderDefines2D.UNIFORM_COLORALPHA, Laya.Vector4.tempVec4);
            }
            else {
                this._spriteShaderData.removeDefine(Laya.ShaderDefines2D.FILTERCOLOR);
            }
            context._copyClipInfoToShaderData(this._spriteShaderData);
        }
        resetExternalSkin() {
            if (this._skeleton) {
                this._skeleton = new spine.Skeleton(this._templet.skeletonData);
                this.spineItem.changeSkeleton(this._skeleton);
                this._flushExtSkin();
            }
        }
        get source() {
            return this._source;
        }
        set source(value) {
            this._source = value;
            if (value) {
                let template = Laya.ILaya.loader.getRes(value, Laya.Loader.SPINE);
                if (template) {
                    this.templet = template;
                }
                else {
                    Laya.ILaya.loader.load(value, Laya.Loader.SPINE).then((templet) => {
                        if (!this._source || templet && !templet.isCreateFromURL(this._source))
                            return;
                        if (this.destroyed)
                            return;
                        this.templet = templet;
                    });
                }
            }
            else
                this.templet = null;
        }
        get skinName() {
            return this._skinName;
        }
        set skinName(value) {
            this._skinName = value;
            if (this._templet)
                this.showSkinByName(value);
        }
        get maxDetlaTime() {
            return this._timeKeeper.maxDelta;
        }
        set maxDetlaTime(value) {
            this._timeKeeper.maxDelta = value;
        }
        get animationName() {
            return this._animationName;
        }
        set animationName(value) {
            this._animationName = value;
            if (this._templet)
                this.play(value, this._loop, true);
        }
        get loop() {
            return this._loop;
        }
        set loop(value) {
            this._loop = value;
            if (this._templet)
                this.play(this._animationName, this._loop, true);
        }
        set url(value) {
            if (this._skin != value) {
                this._skin = value;
                Laya.Laya.loader.load(value, Laya.Loader.SPINE).then((templet) => {
                    this.init(templet);
                });
            }
        }
        get url() {
            return this._skin;
        }
        get templet() {
            return this._templet;
        }
        set templet(value) {
            this.init(value);
        }
        set currentTime(value) {
            if (!this._templet)
                return;
            value /= 1000;
            if (value < this._playStart || (!!this._playEnd && value > this._playEnd) || value > this._duration)
                throw new Error("AnimationPlayer: value must large than playStartTime,small than playEndTime.");
            this._state.update(value - this._currentPlayTime);
            this._currentPlayTime = value;
        }
        get playState() {
            if (this._pause)
                if (this._currentPlayTime)
                    return Spine2DRenderNode.PAUSED;
                else
                    return Spine2DRenderNode.STOPPED;
            return Spine2DRenderNode.PLAYING;
        }
        set useFastRender(value) {
            if (this._useFastRender === value)
                return;
            this._useFastRender = value;
            if (!this._templet)
                return;
            if (value) {
                if ((this.spineItem instanceof SpineNormalRender)) {
                    this.spineItem.destroy();
                    let before = SketonOptimise.normalRenderSwitch;
                    SketonOptimise.normalRenderSwitch = false;
                    this.spineItem = this._templet.sketonOptimise._initSpineRender(this._skeleton, this._templet, this, this._state);
                    SketonOptimise.normalRenderSwitch = before;
                    this.play(this._animationName, this._loop, true, this._currentPlayTime);
                }
            }
            else {
                this.changeNormal();
            }
        }
        get useFastRender() {
            return this._useFastRender;
        }
        onAwake() {
            if (this._skeleton) {
                if (Laya.LayaEnv.isPlaying && this._animationName !== undefined)
                    this.play(this._animationName, this._loop, true);
            }
        }
        init(templet) {
            if (this._templet) {
                this.clear();
                this.reset();
            }
            this._templet = templet;
            if (!this._templet)
                return;
            this._templet._addReference();
            this._skeleton = new spine.Skeleton(this._templet.skeletonData);
            this._stateData = new spine.AnimationStateData(this._skeleton.data);
            this._state = new spine.AnimationState(this._stateData);
            this._timeKeeper = new TimeKeeper(Laya.Laya.timer);
            if (!this._useFastRender) {
                let before = SketonOptimise.normalRenderSwitch;
                SketonOptimise.normalRenderSwitch = true;
                this.spineItem = this._templet.sketonOptimise._initSpineRender(this._skeleton, this._templet, this, this._state);
                SketonOptimise.normalRenderSwitch = before;
            }
            else
                this.spineItem = this._templet.sketonOptimise._initSpineRender(this._skeleton, this._templet, this, this._state);
            let skinIndex = this._templet.getSkinIndexByName(this._skinName);
            if (skinIndex != -1)
                this.showSkinByIndex(skinIndex);
            this._state.addListener({
                start: (entry) => {
                },
                interrupt: (entry) => {
                },
                end: (entry) => {
                },
                dispose: (entry) => {
                },
                complete: (entry) => {
                    this.event(Laya.Event.END);
                    if (entry.loop) {
                        this.event(Laya.Event.COMPLETE);
                    }
                    else {
                        this.stop();
                    }
                },
                event: (entry, event) => {
                    let eventData = {
                        audioValue: event.data.audioPath,
                        audioPath: event.data.audioPath,
                        floatValue: event.floatValue,
                        intValue: event.intValue,
                        name: event.data.name,
                        stringValue: event.stringValue,
                        time: event.time * 1000,
                        balance: event.balance,
                        volume: event.volume
                    };
                    this.event(Laya.Event.LABEL, eventData);
                    if (this._playAudio && eventData.audioValue) {
                        let channel = Laya.SoundManager.playSound(templet.basePath + eventData.audioValue, 1, Laya.Handler.create(this, this._onAniSoundStoped), null, (this._currentPlayTime * 1000 - eventData.time) / 1000);
                        Laya.SoundManager.playbackRate = this._playbackRate;
                        channel && this._soundChannelArr.push(channel);
                    }
                },
            });
            this._flushExtSkin();
            this.event(Laya.Event.READY);
            if (Laya.LayaEnv.isPlaying && this._animationName !== undefined) {
                this.play(this._animationName, this._loop, true);
            }
        }
        play(nameOrIndex, loop, force = true, start = 0, end = 0, freshSkin = true, playAudio = true) {
            this._playAudio = playAudio;
            start /= 1000;
            end /= 1000;
            this._loop = loop;
            if (start < 0 || end < 0)
                throw new Error("SpineSkeleton: start and end must large than zero.");
            if ((end !== 0) && (start > end))
                throw new Error("SpineSkeleton: start must less than end.");
            if (typeof nameOrIndex == "number") {
                nameOrIndex = this.getAniNameByIndex(nameOrIndex);
            }
            else {
                let hasAni = !!this.templet.findAnimation(nameOrIndex);
                if (!hasAni)
                    return;
            }
            if (force || this._pause || this._currentPlayTime || this._animationName != nameOrIndex) {
                this._animationName = nameOrIndex;
                this.spineItem.play(nameOrIndex);
                let trackEntry = this._state.setAnimation(this.trackIndex, nameOrIndex, loop);
                trackEntry.animationStart = start;
                if (!!end && end < trackEntry.animationEnd)
                    trackEntry.animationEnd = end;
                let animationDuration = trackEntry.animation.duration;
                this._duration = animationDuration;
                this._playStart = start;
                this._playEnd = end <= animationDuration ? end : animationDuration;
                if (this._pause) {
                    this._pause = false;
                    this._beginUpdate();
                }
                this._update();
                this.event(Laya.Event.PLAYED);
            }
        }
        _update() {
            this._timeKeeper.update();
            let state = this._state;
            let delta = this._timeKeeper.delta * this._playbackRate;
            state.update(delta);
            let currentPlayTime = this._currentPlayTime = state.getCurrentPlayTime(this.trackIndex);
            state.apply(this._skeleton);
            if (!this._state || !this._skeleton) {
                return;
            }
            this._skeleton.updateWorldTransform();
            this.spineItem.render(currentPlayTime);
            this.owner.repaint();
        }
        _flushExtSkin() {
            if (null == this._skeleton)
                return;
            let skins = this._externalSkins;
            if (skins) {
                for (let i = skins.length - 1; i >= 0; i--) {
                    skins[i].flush();
                }
            }
        }
        getAnimNum() {
            return this._templet.skeletonData.getAnimationsSize();
        }
        getAniNameByIndex(index) {
            return this._templet.getAniNameByIndex(index);
        }
        getSlotByName(slotName) {
            return this._skeleton.findSlot(slotName);
        }
        playbackRate(value) {
            this._playbackRate = value;
        }
        showSkinByName(name) {
            this.showSkinByIndex(this._templet.getSkinIndexByName(name));
        }
        showSkinByIndex(skinIndex) {
            this.spineItem.setSkinIndex(skinIndex);
            this._skeleton.showSkinByIndex(skinIndex);
            this._skeleton.setSlotsToSetupPose();
        }
        event(type, data) {
            this.owner.event(type, data);
        }
        stop() {
            if (!this._pause) {
                this._pause = true;
                this._clearUpdate();
                this._state.update(-this._currentPlayTime);
                this._currentPlayTime = 0;
                this.event(Laya.Event.STOPPED);
                if (this._soundChannelArr.length > 0) {
                    this._onAniSoundStoped(true);
                }
            }
        }
        _clearUpdate() {
            this._needUpdate = false;
        }
        _beginUpdate() {
            this._needUpdate = true;
        }
        onUpdate() {
            this._needUpdate && this._update();
        }
        paused() {
            if (!this._pause) {
                this._pause = true;
                this._clearUpdate();
                this.event(Laya.Event.PAUSED);
                if (this._soundChannelArr.length > 0) {
                    for (let len = this._soundChannelArr.length, i = 0; i < len; i++) {
                        let channel = this._soundChannelArr[i];
                        if (!channel.isStopped) {
                            channel.pause();
                        }
                    }
                }
            }
        }
        resume() {
            if (this._pause) {
                this._pause = false;
                this._beginUpdate();
                if (this._soundChannelArr.length > 0) {
                    for (let len = this._soundChannelArr.length, i = 0; i < len; i++) {
                        let channel = this._soundChannelArr[i];
                        if (channel.audioBuffer) {
                            channel.resume();
                        }
                    }
                }
            }
        }
        _onAniSoundStoped(force) {
            for (let len = this._soundChannelArr.length, i = 0; i < len; i++) {
                let channel = this._soundChannelArr[i];
                if (channel.isStopped || force) {
                    !channel.isStopped && channel.stop();
                    this._soundChannelArr.splice(i, 1);
                    len--;
                    i--;
                }
            }
        }
        reset() {
            this._templet._removeReference(1);
            this._templet = null;
            this._timeKeeper = null;
            this._skeleton = null;
            this._state.clearListeners();
            this._state = null;
            this._pause = true;
            this._clearUpdate();
            if (this._soundChannelArr.length > 0)
                this._onAniSoundStoped(true);
        }
        addAnimation(nameOrIndex, loop = false, delay = 0) {
            delay /= 1000;
            let animationName = nameOrIndex;
            if (typeof animationName == "number") {
                animationName = this.getAniNameByIndex(animationName);
            }
            this._animationName = animationName;
            this._state.addAnimation(this.trackIndex, animationName, loop, delay);
        }
        setMix(fromNameOrIndex, toNameOrIndex, duration) {
            duration /= 1000;
            let fromName = fromNameOrIndex;
            if (typeof fromName == "number") {
                fromName = this.getAniNameByIndex(fromName);
            }
            let toName = toNameOrIndex;
            if (typeof toName == "number") {
                toName = this.getAniNameByIndex(toName);
            }
            this._stateData.setMix(fromName, toName, duration);
        }
        getBoneByName(boneName) {
            return this._skeleton.findBone(boneName);
        }
        getSkeleton() {
            return this._skeleton;
        }
        setSlotAttachment(slotName, attachmentName) {
            this.changeNormal();
            this._skeleton.setAttachment(slotName, attachmentName);
        }
        clear() {
            this._renderElements.forEach(element => {
                Spine2DRenderNode.recoverRenderElement2D(element);
            });
            super.clear();
        }
        changeNormal() {
            if (!(this.spineItem instanceof SpineNormalRender)) {
                this.spineItem.destroy();
                let before = SketonOptimise.normalRenderSwitch;
                SketonOptimise.normalRenderSwitch = true;
                this.spineItem = this._templet.sketonOptimise._initSpineRender(this._skeleton, this._templet, this, this._state);
                SketonOptimise.normalRenderSwitch = before;
            }
        }
        onDestroy() {
            if (this._templet) {
                this.reset();
            }
            this.spineItem.destroy();
        }
        drawGeos(geo, elements) {
            for (var i = 0, n = elements.length; i < n; i++) {
                let element = Spine2DRenderNode.createRenderElement2D();
                element.geometry.bufferState = geo.bufferState;
                element.geometry.indexFormat = geo.indexFormat;
                element.geometry.clearRenderParams();
                element.geometry.setDrawElemenParams(elements[i][1], elements[i][2]);
                let material = elements[i][0];
                this._renderElements.push(element);
                if (this._materials[0] != null) {
                    let rendernodeMaterial = this._materials[i];
                    rendernodeMaterial.setTextureByIndex(SpineShaderInit.SpineTexture, material.getTextureByIndex(SpineShaderInit.SpineTexture));
                    rendernodeMaterial.blendSrc = material.blendSrc;
                    rendernodeMaterial.blendDst = material.blendDst;
                    material = rendernodeMaterial;
                }
                element.materialShaderData = material.shaderData;
                element.subShader = material._shader.getSubShaderAt(0);
                element.value2DShaderData = this._spriteShaderData;
            }
        }
        updateElements(geo, elements) {
            this.clear();
            this.drawGeos(geo, elements);
        }
        drawGeo(geo, material, count, offset) {
            let element = Spine2DRenderNode.createRenderElement2D();
            let eleGeo = element.geometry;
            eleGeo.bufferState = geo.bufferState;
            eleGeo.indexFormat = geo.indexFormat;
            eleGeo.instanceCount = geo.instanceCount;
            eleGeo.clearRenderParams();
            eleGeo.setDrawElemenParams(count, offset);
            this._renderElements.push(element);
            if (this._materials[0] != null) {
                let rendernodeMaterial = this._materials[0];
                rendernodeMaterial.setTextureByIndex(SpineShaderInit.SpineTexture, material.getTextureByIndex(SpineShaderInit.SpineTexture));
                rendernodeMaterial.blendSrc = material.blendSrc;
                rendernodeMaterial.blendDst = material.blendDst;
                material = rendernodeMaterial;
            }
            element.materialShaderData = material.shaderData;
            element.subShader = material._shader.getSubShaderAt(0);
            element.value2DShaderData = this._spriteShaderData;
        }
        getMaterial(texture, blendMode) {
            let mat;
            if (this._materials.length <= this._renderElements.length) {
                mat = this.templet.getMaterial(texture, blendMode);
            }
            else {
                mat = this._materials[this._renderElements.length];
                SpineShaderInit.SetSpineBlendMode(blendMode, mat);
                mat.setTextureByIndex(SpineShaderInit.SpineTexture, texture);
            }
            return mat;
        }
    }
    Spine2DRenderNode._pool = [];
    Spine2DRenderNode.STOPPED = 0;
    Spine2DRenderNode.PAUSED = 1;
    Spine2DRenderNode.PLAYING = 2;
    exports.ERenderType = void 0;
    (function (ERenderType) {
        ERenderType[ERenderType["normal"] = 0] = "normal";
        ERenderType[ERenderType["boneGPU"] = 1] = "boneGPU";
        ERenderType[ERenderType["rigidBody"] = 2] = "rigidBody";
    })(exports.ERenderType || (exports.ERenderType = {}));
    class TimeKeeper {
        constructor(timer) {
            this.maxDelta = 0.064;
            this.timer = timer;
        }
        update() {
            this.delta = this.timer.delta / 1000;
            if (this.delta > this.maxDelta)
                this.delta = this.maxDelta;
        }
    }
    Laya.ClassUtils.regClass("Spine2DRenderNode", Spine2DRenderNode);

    class SpineSkeleton extends Laya.Sprite {
        constructor() {
            super();
            this._spineComponent = this.addComponent(Spine2DRenderNode);
        }
        get externalSkins() {
            return this._spineComponent.externalSkins;
        }
        set externalSkins(value) {
            this._spineComponent.externalSkins = value;
        }
        resetExternalSkin() {
            this._spineComponent.resetExternalSkin();
        }
        get source() {
            return this._spineComponent.source;
        }
        set source(value) {
            this._spineComponent.source = value;
        }
        get skinName() {
            return this._spineComponent.skinName;
        }
        set skinName(value) {
            this._spineComponent.skinName = value;
        }
        get animationName() {
            return this._spineComponent.animationName;
        }
        set animationName(value) {
            this._spineComponent.animationName = value;
        }
        get loop() {
            return this._spineComponent.loop;
        }
        set loop(value) {
            this._spineComponent.loop = value;
        }
        get templet() {
            return this._spineComponent.templet;
        }
        set templet(value) {
            this._spineComponent.templet = value;
        }
        set currentTime(value) {
            this._spineComponent.currentTime = value;
        }
        get playState() {
            return this._spineComponent.playState;
        }
        get spineItem() {
            return this._spineComponent.spineItem;
        }
        set spineItem(value) {
            this._spineComponent.spineItem = value;
        }
        play(nameOrIndex, loop, force = true, start = 0, end = 0, freshSkin = true, playAudio = true) {
            this._spineComponent.play(nameOrIndex, loop, force, start, end, freshSkin, playAudio);
        }
        getAnimNum() {
            return this._spineComponent.getAnimNum();
        }
        getAniNameByIndex(index) {
            return this._spineComponent.getAniNameByIndex(index);
        }
        getSlotByName(slotName) {
            return this._spineComponent.getSlotByName(slotName);
        }
        playbackRate(value) {
            this._spineComponent.playbackRate(value);
        }
        showSkinByName(name) {
            this._spineComponent.showSkinByName(name);
        }
        showSkinByIndex(skinIndex) {
            this._spineComponent.showSkinByIndex(skinIndex);
        }
        stop() {
            this._spineComponent.stop();
        }
        paused() {
            this._spineComponent.paused();
        }
        resume() {
            this._spineComponent.resume();
        }
        destroy(destroyChild = true) {
            if (this._spineComponent.templet) {
                this._spineComponent.reset();
            }
            super.destroy(destroyChild);
        }
        addAnimation(nameOrIndex, loop = false, delay = 0) {
            this._spineComponent.addAnimation(nameOrIndex, loop, delay);
        }
        setMix(fromNameOrIndex, toNameOrIndex, duration) {
            this._spineComponent.setMix(fromNameOrIndex, toNameOrIndex, duration);
        }
        getBoneByName(boneName) {
            return this._spineComponent.getBoneByName(boneName);
        }
        getSkeleton() {
            return this._spineComponent.getSkeleton();
        }
        setSlotAttachment(slotName, attachmentName) {
            this._spineComponent.setSlotAttachment(slotName, attachmentName);
        }
    }
    exports.ESpineRenderType = void 0;
    (function (ESpineRenderType) {
        ESpineRenderType[ESpineRenderType["boneGPU"] = 0] = "boneGPU";
        ESpineRenderType[ESpineRenderType["normal"] = 1] = "normal";
        ESpineRenderType[ESpineRenderType["rigidBody"] = 2] = "rigidBody";
    })(exports.ESpineRenderType || (exports.ESpineRenderType = {}));

    class SpineTemplet extends Laya.Resource {
        constructor() {
            super();
            this.materialMap = new Map();
            this.mainBlendMode = 0;
            this._premultipliedAlpha = true;
            this._textures = {};
            this.sketonOptimise = new SketonOptimise();
        }
        get _mainTexture() {
            let i = 0;
            let tex;
            for (let k in this._textures) {
                tex = this._textures[k];
                if (tex) {
                    i++;
                    if (i > 1) {
                        return null;
                    }
                }
            }
            return tex;
        }
        get premultipliedAlpha() {
            return this._premultipliedAlpha;
        }
        get basePath() {
            return this._basePath;
        }
        getMaterial(texture, blendMode) {
            if (!texture) {
                console.error("SpineError:cant Find Main Texture");
                texture = Laya.Texture2D.whiteTexture;
            }
            let key = texture.id + "_" + blendMode;
            let mat = this.materialMap.get(key);
            if (!mat) {
                mat = new Laya.Material();
                mat.setShaderName("SpineStandard");
                SpineShaderInit.initSpineMaterial(mat);
                mat.setTextureByIndex(SpineShaderInit.SpineTexture, texture);
                if (texture.gammaCorrection != 1) {
                    mat.addDefine(Laya.ShaderDefines2D.GAMMATEXTURE);
                }
                else {
                    mat.removeDefine(Laya.ShaderDefines2D.GAMMATEXTURE);
                }
                SpineShaderInit.SetSpineBlendMode(blendMode, mat, this._premultipliedAlpha);
                if (this._premultipliedAlpha) {
                    mat.addDefine(SpineShaderInit.SPINE_PREMULTIPLYALPHA);
                }
                else {
                    mat.removeDefine(SpineShaderInit.SPINE_PREMULTIPLYALPHA);
                }
                mat._addReference();
                this.materialMap.set(key, mat);
            }
            return mat;
        }
        getTexture(name) {
            return this._textures[name];
        }
        _parse(desc, atlas, textures, premultipliedAlpha = true) {
            var _a;
            let atlasLoader = new spine.AtlasAttachmentLoader(atlas);
            if (desc instanceof ArrayBuffer) {
                let skeletonBinary = new spine.SkeletonBinary(atlasLoader, false);
                this.skeletonData = skeletonBinary.readSkeletonData(new Uint8Array(desc));
            }
            else {
                let skeletonJson = new spine.SkeletonJson(atlasLoader, false);
                this.skeletonData = skeletonJson.readSkeletonData(desc);
            }
            this._textures = textures;
            this.mainBlendMode = ((_a = this.skeletonData.slots[0]) === null || _a === void 0 ? void 0 : _a.blendMode) || 0;
            this.mainTexture = this._mainTexture;
            this.width = this.skeletonData.width;
            this.height = this.skeletonData.height;
            this.offsetX = this.skeletonData.x;
            this.offsetY = this.skeletonData.y;
            this._premultipliedAlpha = premultipliedAlpha;
            this.sketonOptimise.checkMainAttach(this.skeletonData);
        }
        getAniNameByIndex(index) {
            let tAni = this.skeletonData.getAnimationByIndex(index);
            if (tAni)
                return tAni.name;
            return null;
        }
        findAnimation(name) {
            return this.skeletonData.findAnimation(name);
        }
        getSkinIndexByName(skinName) {
            return this.skeletonData.getSkinIndexByName(skinName);
        }
        _disposeResource() {
            for (let k in this._textures) {
                let tex = this._textures[k];
                if (tex) {
                    tex._removeReference();
                }
            }
            if (this._referenceCount <= 0) {
                this.materialMap.forEach(value => {
                    value._removeReference();
                });
                this.materialMap.clear();
            }
            else {
                console.error("SpineTemplet is using");
            }
        }
    }
    SpineTemplet.RuntimeVersion = "3.8";

    class SpineTexture {
        constructor(tex) {
            this.realTexture = tex;
        }
        getImage() {
            var _a, _b, _c, _d;
            return {
                width: (_b = ((_a = this.realTexture) === null || _a === void 0 ? void 0 : _a.width)) !== null && _b !== void 0 ? _b : 16,
                height: (_d = ((_c = this.realTexture) === null || _c === void 0 ? void 0 : _c.height)) !== null && _d !== void 0 ? _d : 16,
            };
        }
        setFilters(minFilter, magFilter) {
            if (!this.realTexture)
                return;
            let filterMode;
            if (magFilter === window.spine.TextureFilter.Nearest)
                filterMode = Laya.FilterMode.Point;
            else
                filterMode = Laya.FilterMode.Bilinear;
            this.realTexture.filterMode = filterMode;
        }
        convertWrapMode(mode) {
            return mode == spine.TextureWrap.ClampToEdge ? Laya.WrapMode.Clamp : (mode == spine.TextureWrap.MirroredRepeat ? Laya.WrapMode.Mirrored : Laya.WrapMode.Repeat);
        }
        setWraps(uWrap, vWrap) {
            if (!this.realTexture)
                return;
            this.realTexture.wrapModeU = this.convertWrapMode(uWrap);
            this.realTexture.wrapModeV = this.convertWrapMode(vWrap);
        }
    }

    const _premultipliedAlpha = true;
    class SpineTempletLoader {
        load(task) {
            let atlasUrl = Laya.Utils.replaceFileExtension(task.url, "atlas");
            return Promise.all([
                task.loader.fetch(task.url, task.ext == "skel" ? "arraybuffer" : "json", task.progress.createCallback()),
                task.loader.fetch(atlasUrl, "text", task.progress.createCallback())
            ]).then(res => {
                if (!res[0] || !res[1])
                    return null;
                let templet = new SpineTemplet();
                let version = SpineTemplet.RuntimeVersion;
                if (version == "4.1") {
                    templet.needSlot = true;
                }
                if (version.startsWith('4.'))
                    return this.parseAtlas4(res[0], res[1], task, templet);
                else
                    return this.parseAtlas3(res[0], res[1], task, templet);
            });
        }
        parseAtlas3(desc, atlasText, task, templet) {
            var _a;
            let atlasPages = [];
            let basePath = Laya.URL.getPath(task.url);
            let atlas = new spine.TextureAtlas(atlasText, (path) => {
                let url = basePath + path;
                atlasPages.push({
                    url, type: Laya.Loader.TEXTURE2D,
                    propertyParams: {
                        premultiplyAlpha: _premultipliedAlpha
                    },
                    constructParams: [0, 0, Laya.TextureFormat.R8G8B8A8, false, false, true, _premultipliedAlpha]
                });
                return new SpineTexture(null);
            });
            return Laya.Laya.loader.load(atlasPages, null, (_a = task.progress) === null || _a === void 0 ? void 0 : _a.createCallback()).then((res) => {
                let textures = {};
                let premultipliedAlpha = true;
                for (var i = 0; i < res.length; i++) {
                    let tex = res[i];
                    if (tex)
                        tex._addReference();
                    let pages = atlas.pages;
                    let page = pages[i];
                    premultipliedAlpha = page.pma || (tex._premultiplyAlpha && premultipliedAlpha);
                    page.texture.realTexture = tex;
                    page.texture.setFilters(page.minFilter, page.magFilter);
                    page.texture.setWraps(page.uWrap, page.vWrap);
                    page.width = page.texture.getImage().width;
                    page.height = page.texture.getImage().height;
                    textures[page.name] = tex;
                }
                let regions = atlas.regions;
                for (const region of regions) {
                    let page = region.page;
                    region.u = region.x / page.width;
                    region.v = region.y / page.height;
                    if (region.rotate) {
                        region.u2 = (region.x + region.height) / page.width;
                        region.v2 = (region.y + region.width) / page.height;
                    }
                    else {
                        region.u2 = (region.x + region.width) / page.width;
                        region.v2 = (region.y + region.height) / page.height;
                    }
                }
                templet._parse(desc, atlas, textures, premultipliedAlpha);
                return templet;
            });
        }
        parseAtlas4(desc, atlasText, task, templet) {
            var _a;
            let atlas = new spine.TextureAtlas(atlasText);
            let basePath = Laya.URL.getPath(task.url);
            return Laya.Laya.loader.load(atlas.pages.map((page) => {
                return {
                    url: basePath + page.name,
                    type: Laya.Loader.TEXTURE2D,
                    propertyParams: {
                        premultiplyAlpha: _premultipliedAlpha
                    },
                    constructParams: [0, 0, Laya.TextureFormat.R8G8B8A8, false, false, true, _premultipliedAlpha]
                };
            }), null, (_a = task.progress) === null || _a === void 0 ? void 0 : _a.createCallback()).then((res) => {
                let textures = {};
                let premultipliedAlpha = true;
                let pages = atlas.pages;
                for (let i = 0, len = res.length; i < len; i++) {
                    let tex = res[i];
                    if (tex)
                        tex._addReference();
                    let page = pages[i];
                    textures[page.name] = tex;
                    premultipliedAlpha = page.pma || (tex._premultiplyAlpha && premultipliedAlpha);
                    page.setTexture(new SpineTexture(tex));
                }
                templet._parse(desc, atlas, textures, premultipliedAlpha);
                return templet;
            });
        }
    }
    Laya.Loader.registerLoader(["skel"], SpineTempletLoader, Laya.Loader.SPINE);

    let c = Laya.ClassUtils.regClass;
    c("SpineSkeleton", SpineSkeleton);
    c("ExternalSkin", ExternalSkin);
    c("ExternalSkinItem", ExternalSkinItem);
    Laya.Laya.addBeforeInitCallback(() => {
        if (Laya.PlayerConfig.spineVersion)
            SpineTemplet.RuntimeVersion = Laya.PlayerConfig.spineVersion;
    });

    class SpineBakeScript extends Laya.Script {
        constructor() {
            super();
        }
        onEnable() {
            if (this.bakeData)
                this.initBake(JSON.parse(this.bakeData));
        }
        onDisable() {
            let spine = this.owner.getComponent(Spine2DRenderNode);
            if (spine.spineItem)
                spine.spineItem.initBake(null);
        }
        async attach(spine) {
            let texture = await Laya.Laya.loader.load({
                url: this.url,
                type: Laya.Loader.TEXTURE2D,
                constructParams: [
                    256, 256, Laya.TextureFormat.R32G32B32A32, false, false, false, false
                ]
            });
            spine.initBake({
                bonesNums: 60,
                aniOffsetMap: {
                    "idle": 0,
                    "skill": 179 * 60 * 2
                },
                texture2d: texture
            });
        }
        async initBake(data) {
            const textureWidth = data.aniOffsetMap.textureWidth || 256;
            let texture = await Laya.Laya.loader.load({
                url: data.simpPath,
                type: Laya.Loader.TEXTURE2D,
                constructParams: [
                    textureWidth, textureWidth, Laya.TextureFormat.R32G32B32A32, false, false, false, false
                ]
            });
            data.texture2d = texture;
            let spine = this.owner.getComponent(Spine2DRenderNode);
            if (spine.spineItem && !(spine.spineItem instanceof SpineEmptyRender)) {
                spine.spineItem.initBake(data);
            }
            else {
                this.owner.on(Laya.Event.READY, this, () => {
                    spine.spineItem.initBake(data);
                });
            }
        }
    }
    Laya.ClassUtils.regClass("SpineBakeScript", SpineBakeScript);

    class SpineInstanceBatch {
        constructor() {
            this._recoverList = new Laya.FastSinglelist();
        }
        check(left, right) {
            if (left.materialShaderData != right.materialShaderData
                || left.geometry.instanceCount
                || right.geometry.instanceCount)
                return false;
            return true;
        }
        batchRenderElement(list, start, length) {
            let elementArray = list.elements;
            let batchStart = -1;
            for (let i = 0; i < length - 1; i++) {
                let index = start + i;
                let cElement = elementArray[index];
                let nElement = elementArray[index + 1];
                if (this.check(cElement, nElement)) {
                    if (batchStart == -1) {
                        batchStart = i;
                    }
                }
                else {
                    if (batchStart != -1) {
                        this.batch(list, batchStart + start, i - batchStart);
                    }
                    batchStart = 0;
                }
            }
            if (batchStart != -1) {
                this.batch(list, batchStart + start, length - batchStart);
            }
        }
        updateBuffer(info, nMatrixData, simpleAnimatorData, instanceCount) {
            let nMatrixInstanceVB = info.nMatrixInstanceVB;
            let simpleAnimatorVB = info.simpleAnimatorVB;
            nMatrixInstanceVB.setData(nMatrixData.buffer, 0, 0, instanceCount * 6 * 4);
            simpleAnimatorVB.setData(simpleAnimatorData.buffer, 0, 0, instanceCount * 4 * 4);
        }
        batch(list, start, length) {
            let instanceElement, geometry;
            let elementArray = list.elements;
            let nMatrixData = SpineInstanceElement2DTool._instanceBufferCreate(6 * SpineInstanceElement2DTool.MaxInstanceCount);
            let simpleAnimatorData = SpineInstanceElement2DTool._instanceBufferCreate(4 * SpineInstanceElement2DTool.MaxInstanceCount);
            let info;
            let instanceCount = 0;
            for (let i = 0; i < length; i++) {
                let element = elementArray[start + i];
                let shaderData = element.value2DShaderData;
                if (!instanceElement) {
                    let originGeo = element.geometry;
                    info = SpineInstanceElement2DTool.getInstanceInfo(originGeo);
                    instanceElement = info.element;
                    this._recoverList.add(info);
                    geometry = instanceElement.geometry;
                    instanceCount = geometry.instanceCount = 0;
                    instanceElement.subShader = element.subShader;
                    instanceElement.materialShaderData = element.materialShaderData;
                    instanceElement.value2DShaderData = element.value2DShaderData;
                    instanceElement.renderStateIsBySprite = element.renderStateIsBySprite;
                    instanceElement.value2DShaderData.addDefine(SpineShaderInit.SPINE_GPU_INSTANCE);
                }
                let nMatrixBuffer = shaderData.getBuffer(SpineShaderInit.NMatrix);
                nMatrixData.set(nMatrixBuffer, instanceCount * 6);
                let simpleAnimatorParams = shaderData.getVector(SpineShaderInit.SIMPLE_SIMPLEANIMATORPARAMS);
                let offset = instanceCount * 4;
                simpleAnimatorData[offset] = simpleAnimatorParams.x;
                simpleAnimatorData[offset + 1] = simpleAnimatorParams.y;
                simpleAnimatorData[offset + 2] = simpleAnimatorParams.z;
                simpleAnimatorData[offset + 3] = simpleAnimatorParams.w;
                instanceCount++;
                geometry.instanceCount = instanceCount;
                if (geometry.instanceCount == SpineInstanceElement2DTool.MaxInstanceCount) {
                    this.updateBuffer(info, nMatrixData, simpleAnimatorData, geometry.instanceCount);
                    list.add(instanceElement);
                    instanceElement = null;
                }
            }
            if (instanceElement) {
                this.updateBuffer(info, nMatrixData, simpleAnimatorData, geometry.instanceCount);
                list.add(instanceElement);
            }
            SpineInstanceElement2DTool._instanceBufferRecover(nMatrixData);
            SpineInstanceElement2DTool._instanceBufferRecover(simpleAnimatorData);
        }
        recover() {
            let length = this._recoverList.length;
            let recoverArray = this._recoverList.elements;
            for (let i = 0; i < length; i++) {
                let info = recoverArray[i];
                SpineInstanceElement2DTool.recover(info);
            }
            this._recoverList.length = 0;
        }
    }
    Laya.Laya.addAfterInitCallback(function () {
        SpineInstanceBatch.instance = new SpineInstanceBatch;
        Laya.RenderManager2D.regisBatch(Laya.BaseRender2DType.spineSimple, SpineInstanceBatch.instance);
    });
    class SpineInstanceElement2DTool {
        static getInstanceInfo(geometry) {
            let infos = SpineInstanceElement2DTool._instanceBufferInfoMap.get(geometry);
            if (!infos) {
                infos = [];
                SpineInstanceElement2DTool._instanceBufferInfoMap.set(geometry, infos);
            }
            let info = infos.pop() || SpineInstanceElement2DTool.createInstanceInfo(geometry);
            return info;
        }
        static createInstanceInfo(geometry) {
            let element = Laya.LayaGL.render2DRenderPassFactory.createRenderElement2D();
            let instanceGeometry = element.geometry = Laya.LayaGL.renderDeviceFactory.createRenderGeometryElement(Laya.MeshTopology.Triangles, Laya.DrawType.DrawElementInstance);
            let state = Laya.LayaGL.renderDeviceFactory.createBufferState();
            let info = { state, element, source: geometry };
            let oriBufferState = geometry.bufferState;
            let vertexArray = oriBufferState._vertexBuffers.slice();
            let nMatrixInstanceVB = Laya.LayaGL.renderDeviceFactory.createVertexBuffer(Laya.BufferUsage.Dynamic);
            nMatrixInstanceVB.setDataLength(SpineInstanceElement2DTool.MaxInstanceCount * 16 * 4);
            nMatrixInstanceVB.vertexDeclaration = SpineShaderInit.instanceNMatrixDeclaration;
            nMatrixInstanceVB.instanceBuffer = true;
            vertexArray.push(nMatrixInstanceVB);
            info.nMatrixInstanceVB = nMatrixInstanceVB;
            let simpleAnimatorVB = Laya.LayaGL.renderDeviceFactory.createVertexBuffer(Laya.BufferUsage.Dynamic);
            simpleAnimatorVB.setDataLength(SpineInstanceElement2DTool.MaxInstanceCount * 4 * 4);
            simpleAnimatorVB.vertexDeclaration = SpineShaderInit.instanceSimpleAnimatorDeclaration;
            simpleAnimatorVB.instanceBuffer = true;
            vertexArray.push(simpleAnimatorVB);
            info.simpleAnimatorVB = simpleAnimatorVB;
            state.applyState(vertexArray, geometry.bufferState._bindedIndexBuffer);
            instanceGeometry.drawParams.elements = geometry.drawParams.elements.slice();
            instanceGeometry.drawParams.length = geometry.drawParams.length;
            instanceGeometry.indexFormat = geometry.indexFormat;
            instanceGeometry.bufferState = state;
            return info;
        }
        static recover(info) {
            let element = info.element;
            element.value2DShaderData.removeDefine(SpineShaderInit.SPINE_GPU_INSTANCE);
            element.value2DShaderData = null;
            element.materialShaderData = null;
            element.subShader = null;
            let infos = SpineInstanceElement2DTool._instanceBufferInfoMap.get(info.source);
            infos.push(info);
        }
        static _instanceBufferCreate(length) {
            let array = SpineInstanceElement2DTool._bufferPool[length];
            if (!array) {
                array = SpineInstanceElement2DTool._bufferPool[length] = [];
            }
            let element = array.pop() || new Float32Array(length);
            return element;
        }
        static _instanceBufferRecover(float32) {
            let length = float32.length;
            let array = SpineInstanceElement2DTool._bufferPool[length];
            if (!array) {
                array = SpineInstanceElement2DTool._bufferPool[length] = [];
            }
            array.push(float32);
        }
    }
    SpineInstanceElement2DTool.MaxInstanceCount = 2048;
    SpineInstanceElement2DTool._instanceBufferInfoMap = new Map;
    SpineInstanceElement2DTool._bufferPool = [];

    exports.AnimationRender = AnimationRender;
    exports.AnimationRenderProxy = AnimationRenderProxy;
    exports.AttachmentParse = AttachmentParse;
    exports.ChangeDeform = ChangeDeform;
    exports.ChangeDrawOrder = ChangeDrawOrder;
    exports.ChangeRGBA = ChangeRGBA;
    exports.ChangeSlot = ChangeSlot;
    exports.ExternalSkin = ExternalSkin;
    exports.ExternalSkinItem = ExternalSkinItem;
    exports.IBCreator = IBCreator;
    exports.MultiRenderData = MultiRenderData;
    exports.SketonOptimise = SketonOptimise;
    exports.SkinAniRenderData = SkinAniRenderData;
    exports.SkinAttach = SkinAttach;
    exports.SkinRender = SkinRender;
    exports.SlotUtils = SlotUtils;
    exports.Spine2DRenderNode = Spine2DRenderNode;
    exports.SpineAdapter = SpineAdapter;
    exports.SpineBakeScript = SpineBakeScript;
    exports.SpineEmptyRender = SpineEmptyRender;
    exports.SpineInstanceBatch = SpineInstanceBatch;
    exports.SpineInstanceElement2DTool = SpineInstanceElement2DTool;
    exports.SpineMeshBase = SpineMeshBase;
    exports.SpineNormalRender = SpineNormalRender;
    exports.SpineNormalRenderBase = SpineNormalRenderBase;
    exports.SpineOptimizeConst = SpineOptimizeConst;
    exports.SpineOptimizeRender = SpineOptimizeRender;
    exports.SpineShaderInit = SpineShaderInit;
    exports.SpineSkeleton = SpineSkeleton;
    exports.SpineSkeletonRenderer = SpineSkeletonRenderer;
    exports.SpineTemplet = SpineTemplet;
    exports.SpineTexture = SpineTexture;
    exports.SpineVirtualMesh = SpineVirtualMesh;
    exports.SpineWasmRender = SpineWasmRender;
    exports.SpineWasmVirturalMesh = SpineWasmVirturalMesh;
    exports.VBBoneCreator = VBBoneCreator;
    exports.VBCreator = VBCreator;
    exports.VBRigBodyCreator = VBRigBodyCreator;

})(window.Laya = window.Laya || {}, Laya);
//# sourceMappingURL=laya.spine.js.map
