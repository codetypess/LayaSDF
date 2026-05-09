(function (exports, Laya) {
    'use strict';

    class CommonMemoryAllocater {
        static creatBlock(size) {
            const buffer = new ArrayBuffer(size);
            return buffer;
        }
        static freeMemoryBlock(buffer) {
        }
    }

    class NativeMemory {
        constructor(size, shared) {
            if (shared) {
                if (size > NativeMemory._sharedBuffer.byteLength) {
                    throw new Error("NativeMemory:shared buffer not enough");
                }
                this._buffer = NativeMemory._sharedBuffer;
            }
            else {
                this._buffer = CommonMemoryAllocater.creatBlock(size);
            }
            this._idata = new Int32Array(this._buffer);
            this._uidata = new Uint32Array(this._buffer);
            this._fdata = new Float32Array(this._buffer);
            this._f64data = new Float64Array(this._buffer);
            this._byteArray = new Uint8Array(this._buffer);
            this._byteLength = size;
        }
        get float32Array() {
            return this._fdata;
        }
        get float64Array() {
            return this._f64data;
        }
        get uint8Array() {
            return this._byteArray;
        }
        get int32Array() {
            return this._idata;
        }
        get Uint32Array() {
            return this._uidata;
        }
        destroy() {
            if (this._destroyed)
                return;
            this.clear();
            CommonMemoryAllocater.freeMemoryBlock(this._buffer);
            this._destroyed = true;
        }
        clear() {
            this._idata = null;
            this._fdata = null;
            this._byteArray = null;
        }
    }
    NativeMemory.NativeSourceID = 0;
    NativeMemory._sharedBuffer = new ArrayBuffer(256);

    class RTDefineDatas {
        constructor() {
            this._nativeObj = new window.conchRTDefineDatas();
        }
        get _length() {
            return this._nativeObj._length;
        }
        set _length(value) {
            this._nativeObj._length = value;
        }
        get _mask() {
            return this._nativeObj._mask;
        }
        set _mask(value) {
            this._nativeObj._mask = value;
        }
        _intersectionDefineDatas(define) {
            this._nativeObj._intersectionDefineDatas(define);
        }
        add(define) {
            this._nativeObj.add(define);
        }
        remove(define) {
            this._nativeObj.remove(define);
        }
        addDefineDatas(define) {
            this._nativeObj.addDefineDatas(define._nativeObj);
        }
        removeDefineDatas(define) {
            this._nativeObj.removeDefineDatas(define._nativeObj);
        }
        has(define) {
            return this._nativeObj.has(define);
        }
        clear() {
            this._nativeObj.clear();
        }
        cloneTo(destObject) {
            this._nativeObj.cloneTo(destObject._nativeObj);
        }
        clone() {
            var dest = new RTDefineDatas();
            this.cloneTo(dest);
            return dest;
        }
        destroy() {
            this._nativeObj.destroy();
        }
    }

    class RTRenderState extends Laya.RenderState {
        set cull(value) {
            this._nativeObj.cull = value;
        }
        get cull() {
            return this._nativeObj.cull;
        }
        set blend(value) {
            this._nativeObj.blend = value;
        }
        get blend() {
            return this._nativeObj.blend;
        }
        set srcBlend(value) {
            this._nativeObj.srcBlend = value;
        }
        get srcBlend() {
            return this._nativeObj.srcBlend;
        }
        set dstBlend(value) {
            this._nativeObj.dstBlend = value;
        }
        get dstBlend() {
            return this._nativeObj.dstBlend;
        }
        set srcBlendRGB(value) {
            this._nativeObj.srcBlendRGB = value;
        }
        get srcBlendRGB() {
            return this._nativeObj.srcBlendRGB;
        }
        set dstBlendRGB(value) {
            this._nativeObj.dstBlendRGB = value;
        }
        get dstBlendRGB() {
            return this._nativeObj.dstBlendRGB;
        }
        set srcBlendAlpha(value) {
            this._nativeObj.srcBlendAlpha = value;
        }
        get srcBlendAlpha() {
            return this._nativeObj.srcBlendAlpha;
        }
        set dstBlendAlpha(value) {
            this._nativeObj.dstBlendAlpha = value;
        }
        get dstBlendAlpha() {
            return this._nativeObj.dstBlendAlpha;
        }
        set blendEquation(value) {
            this._nativeObj.blendEquation = value;
        }
        get blendEquation() {
            return this._nativeObj.blendEquation;
        }
        set blendEquationRGB(value) {
            this._nativeObj.blendEquationRGB = value;
        }
        get blendEquationRGB() {
            return this._nativeObj.blendEquationRGB;
        }
        set blendEquationAlpha(value) {
            this._nativeObj.blendEquationAlpha = value;
        }
        get blendEquationAlpha() {
            return this._nativeObj.blendEquationAlpha;
        }
        set depthTest(value) {
            this._nativeObj.depthTest = value;
        }
        get depthTest() {
            return this._nativeObj.depthTest;
        }
        set depthWrite(value) {
            this._nativeObj.depthWrite = value;
        }
        get depthWrite() {
            return this._nativeObj.depthWrite;
        }
        set stencilWrite(value) {
            this._nativeObj.stencilWrite = value;
        }
        get stencilWrite() {
            return this._nativeObj.stencilWrite;
        }
        set stencilTest(value) {
            this._nativeObj.stencilTest = value;
        }
        get stencilTest() {
            return this._nativeObj.stencilTest;
        }
        set stencilRef(value) {
            this._nativeObj.stencilRef = value;
        }
        get stencilRef() {
            return this._nativeObj.stencilRef;
        }
        set stencilOp(value) {
            this._nativeObj.setStencilOp(value);
        }
        get stencilOp() {
            let value = this._nativeObj.getStencilOp();
            let _tempVector3 = new Laya.Vector3();
            _tempVector3.x = value.x;
            _tempVector3.y = value.y;
            _tempVector3.z = value.z;
            return _tempVector3;
        }
        setNull() {
            this._nativeObj.setNull();
        }
        createObj() {
            this._nativeObj = new window.conchRenderState();
        }
        constructor() {
            super();
        }
        cloneTo(dest) {
            this._nativeObj.cloneTo(dest._nativeObj);
        }
        clone() {
            let state = new RTRenderState();
            this.cloneTo(state);
            return state;
        }
    }

    class RTShaderDefine extends Laya.ShaderDefine {
        constructor(index, value) {
            super(index, value);
        }
    }

    class RTShaderPass {
        constructor(pass) {
            this._validDefine = new RTDefineDatas();
            this.is2D = false;
            this._nativeObj = new window.conchRTShaderPass();
            this._createShaderInstanceFun = this.nativeCreateShaderInstance.bind(this);
            this._nativeObj.setCreateShaderInstanceFunction(this._createShaderInstanceFun);
            this.renderState = new RTRenderState();
            this.renderState.setNull();
            this._pass = pass;
        }
        get nodeCommonMap() {
            return this._nodeCommonMap;
        }
        set nodeCommonMap(value) {
            this._nativeObj.setCommonUniformMap(value);
        }
        static getGlobalCompileDefine() {
            if (!RTShaderPass._globalCompileDefine) {
                RTShaderPass._globalCompileDefine = new RTDefineDatas();
            }
            return RTShaderPass._globalCompileDefine;
        }
        get statefirst() {
            return this._nativeObj._statefirst;
        }
        set statefirst(value) {
            this._nativeObj._statefirst = value;
        }
        get renderState() {
            return this._renderState;
        }
        set renderState(value) {
            this._renderState = value;
            this._nativeObj.setRenderState(value._nativeObj);
        }
        get pipelineMode() {
            return this._nativeObj._pipelineMode;
        }
        set pipelineMode(value) {
            this._nativeObj._pipelineMode = value;
        }
        get validDefine() {
            return this._validDefine;
        }
        set validDefine(value) {
            this._validDefine = value;
            this._nativeObj.setValidDefine(value._nativeObj);
        }
        nativeCreateShaderInstance() {
            var shaderIns = this._pass.withCompile(RTShaderPass.getGlobalCompileDefine(), this._nativeObj.is2D);
            return shaderIns._nativeObj;
        }
        destroy() {
            this._nativeObj.destroy();
        }
        setCacheShader(defines, shaderInstance) {
            this._nativeObj.setCacheShader(defines._nativeObj, shaderInstance._nativeObj, shaderInstance);
        }
        getCacheShader(defines) {
            return this._nativeObj.getCacheShader(defines._nativeObj);
        }
    }
    RTShaderPass._globalCompileDefine = null;

    class RTSubShader {
        constructor() {
            this._nativeObj = new window.conchRTSubShader();
        }
        get enableInstance() {
            return this._nativeObj.enableInstance;
        }
        set enableInstance(value) {
            this._nativeObj.enableInstance = value;
        }
        destroy() {
            this._nativeObj.destroy();
        }
        addShaderPass(pass) {
            this._nativeObj.addShaderPass(pass._nativeObj);
        }
    }

    class RTUintRenderModuleDataFactory {
        createSubShader() {
            return new RTSubShader();
        }
        createShaderPass(pass) {
            return new RTShaderPass(pass);
        }
        createRenderState() {
            return new RTRenderState();
        }
        createDefineDatas() {
            return new RTDefineDatas();
        }
    }
    Laya.Laya.addBeforeInitCallback(() => {
        if (!Laya.LayaGL.unitRenderModuleDataFactory)
            Laya.LayaGL.unitRenderModuleDataFactory = new RTUintRenderModuleDataFactory();
    });

    class GLESBufferState {
        constructor() {
            this._nativeObj = new window.conchGLESBufferState();
        }
        applyState(vertexBuffers, indexBuffer) {
            this._vertexBuffers = vertexBuffers;
            this._bindedIndexBuffer = indexBuffer;
            let tempVertexBuffers = [];
            vertexBuffers.forEach((element) => {
                tempVertexBuffers.push(element._nativeObj);
            });
            this._nativeObj.applyState(tempVertexBuffers, indexBuffer ? indexBuffer._nativeObj : null);
        }
        destroy() {
            this._nativeObj.destroy();
        }
    }

    class GLESCommandUniformMap extends Laya.CommandUniformMap {
        constructor(stateName) {
            super(stateName);
            this._nativeObj = new window.conchGLESCommandUniformMap.create(stateName);
        }
        addShaderUniform(propertyID, propertyKey, uniformtype, block = "") {
            this._nativeObj.addShaderUniform(propertyID, propertyKey, uniformtype, block);
        }
        addShaderUniformArray(propertyID, propertyName, uniformtype, arrayLength, block = "") {
            if (uniformtype !== Laya.ShaderDataType.Matrix4x4 && uniformtype !== Laya.ShaderDataType.Vector4)
                throw ('because of align rule, the engine does not support other types as arrays.');
            this._nativeObj.addShaderUniform(propertyID, propertyName, uniformtype, block);
        }
        addShaderBlockUniform(propertyID, blockname, blockProperty) {
            this._nativeObj.addShaderBlockUniform(propertyID, blockname, blockProperty);
        }
    }

    class GLESInternalTex {
        constructor(nativeObj) {
            this._nativeObj = nativeObj;
        }
        get wrapU() {
            return this._nativeObj.wrapU;
        }
        set wrapU(value) {
            this._nativeObj.wrapU = value;
        }
        get wrapV() {
            return this._nativeObj.wrapV;
        }
        set wrapV(value) {
            this._nativeObj.wrapV = value;
        }
        get wrapW() {
            return this._nativeObj.wrapW;
        }
        set wrapW(value) {
            this._nativeObj.wrapW = value;
        }
        set baseMipmapLevel(value) {
            this._nativeObj.baseMipmapLevel = value;
        }
        get baseMipmapLevel() {
            return this._nativeObj.baseMipmapLevel;
        }
        set maxMipmapLevel(value) {
            this._nativeObj.maxMipmapLevel = value;
        }
        get maxMipmapLevel() {
            return this._nativeObj.maxMipmapLevel;
        }
        get compareMode() {
            return this._nativeObj.compareMode;
        }
        set compareMode(value) {
            this._nativeObj.compareMode = value;
        }
        get anisoLevel() {
            return this._nativeObj.anisoLevel;
        }
        set anisoLevel(value) {
            this._nativeObj.anisoLevel = value;
        }
        get filterMode() {
            return this._nativeObj.filterMode;
        }
        set filterMode(value) {
            this._nativeObj.filterMode = value;
        }
        get mipmapCount() {
            return this._nativeObj.mipmapCount;
        }
        get mipmap() {
            return this._nativeObj.mipmap;
        }
        get isPotSize() {
            return this._nativeObj.getIsPotSize();
        }
        get useSRGBLoad() {
            return this._nativeObj.useSRGBLoad;
        }
        get depth() {
            return this._nativeObj.getDepth();
        }
        get gammaCorrection() {
            return this._nativeObj.gammaCorrection;
        }
        set gammaCorrection(value) {
            this._nativeObj.gammaCorrection = value;
        }
        get resource() {
            return this._nativeObj;
        }
        get width() {
            return this._nativeObj.getWidth();
        }
        get height() {
            return this._nativeObj.getHeight();
        }
        get gpuMemory() {
            return this._nativeObj.getGPUMemory();
        }
        dispose() {
            this._nativeObj.dispose();
            this._nativeObj = null;
        }
    }

    class GLESInternalRT {
        constructor(nativeObj) {
            this._nativeObj = nativeObj;
        }
        get _isCube() {
            return this._nativeObj._isCube;
        }
        set _isCube(value) {
            this._nativeObj._isCube = value;
        }
        get _samples() {
            return this._nativeObj._samples;
        }
        set _samples(value) {
            this._nativeObj._samples = value;
        }
        get _generateMipmap() {
            return this._nativeObj._generateMipmap;
        }
        set _generateMipmap(value) {
            this._nativeObj._generateMipmap = value;
        }
        get colorFormat() {
            return this._nativeObj.colorFormat;
        }
        set colorFormat(value) {
            this._nativeObj.colorFormat = value;
        }
        get depthStencilFormat() {
            return this._nativeObj.depthStencilFormat;
        }
        set depthStencilFormat(value) {
            this._nativeObj.depthStencilFormat = value;
        }
        get isSRGB() {
            return this._nativeObj.isSRGB;
        }
        set isSRGB(value) {
            this._nativeObj.isSRGB = value;
        }
        get gpuMemory() {
            return this._nativeObj.gpuMemory;
        }
        set gpuMemory(value) {
            this._nativeObj.gpuMemory = value;
        }
        get _textures() {
            if (this._texturesRef) {
                return this._texturesRef;
            }
            else {
                this._texturesRef = [];
                let textures = this._nativeObj.getTextures();
                textures.forEach((element) => {
                    this._texturesRef.push(new GLESInternalTex(element));
                });
                return this._texturesRef;
            }
        }
        get _depthTexture() {
            if (this._depthTextureRef) {
                return this._depthTextureRef;
            }
            else {
                var nativeObj = this._nativeObj.getDepthTexture();
                if (nativeObj)
                    this._depthTextureRef = new GLESInternalTex(nativeObj);
                return this._depthTextureRef;
            }
        }
        dispose() {
            this._nativeObj.dispose();
        }
    }

    class GLESTextureContext {
        constructor(native) {
            this._native = native;
            this.needBitmap = false;
        }
        createTextureInternal(dimension, width, height, format, generateMipmap, sRGB, premultipliedAlpha) {
            var tex = new GLESInternalTex(this._native.createTextureInternal(dimension, width, height, format, generateMipmap, sRGB, premultipliedAlpha));
            return tex;
        }
        setTextureImageData(texture, source, premultiplyAlpha, invertY) {
            if (source instanceof HTMLCanvasElement) {
                throw "native cant draw HTMLCanvasElement";
            }
            this._native.setTextureImageData(texture._nativeObj, source._nativeObj.conchImgId, premultiplyAlpha, invertY);
        }
        setTexturePixelsData(texture, source, premultiplyAlpha, invertY) {
            this._native.setTexturePixelsData(texture._nativeObj, source, premultiplyAlpha, invertY);
        }
        initVideoTextureData(texture) {
            this._native.initVideoTextureData(texture._nativeObj);
        }
        setTextureSubPixelsData(texture, source, mipmapLevel, generateMipmap, xOffset, yOffset, width, height, premultiplyAlpha, invertY) {
            this._native.setTextureSubPixelsData(texture._nativeObj, source, mipmapLevel, generateMipmap, xOffset, yOffset, width, height, premultiplyAlpha, invertY);
        }
        setTextureSubImageData(texture, source, x, y, premultiplyAlpha, invertY) {
            if (source instanceof HTMLCanvasElement) {
                throw "native cant draw HTMLCanvasElement";
            }
            throw "native not need this function";
        }
        setTexture3DImageData(texture, source, depth, premultiplyAlpha, invertY) {
            this._native.setTexture3DImageData(texture._nativeObj, source.map(function (s) { return s._nativeObj; }), depth, premultiplyAlpha, invertY);
        }
        createTexture3DInternal(dimension, width, height, depth, format, generateMipmap, sRGB, premultipliedAlpha) {
            return new GLESInternalTex(this._native.createTexture3DInternal(dimension, width, height, depth, format, generateMipmap, sRGB, premultipliedAlpha));
        }
        setTexture3DPixelsData(texture, source, depth, premultiplyAlpha, invertY) {
            this._native.setTexture3DPixelsData(texture._nativeObj, source, depth, premultiplyAlpha, invertY);
        }
        setTexture3DSubPixelsData(texture, source, mipmapLevel, generateMipmap, xOffset, yOffset, zOffset, width, height, depth, premultiplyAlpha, invertY) {
            this._native.setTexture3DSubPixelsData(texture._nativeObj, source, mipmapLevel, generateMipmap, xOffset, yOffset, zOffset, width, height, depth, premultiplyAlpha, invertY);
        }
        setTextureHDRData(texture, hdrInfo) {
            let sourceData = hdrInfo.readScanLine();
            this.setTexturePixelsData(texture, sourceData, false, false);
        }
        setTextureDDSData(texture, ddsInfo) {
            this._native.setTextureDDSData(texture._nativeObj, ddsInfo);
        }
        setTextureKTXData(texture, ktxInfo) {
            this._native.setTextureKTXData(texture._nativeObj, ktxInfo);
        }
        setCubeImageData(texture, sources, premultiplyAlpha, invertY) {
            var images = [];
            var length = sources.length;
            for (let index = 0; index < length; index++) {
                images.push(sources[index]._nativeObj);
            }
            this._native.setCubeImageData(texture._nativeObj, images, premultiplyAlpha, invertY);
        }
        setCubePixelsData(texture, source, premultiplyAlpha, invertY) {
            this._native.setCubePixelsData(texture._nativeObj, source, premultiplyAlpha, invertY);
        }
        setCubeSubPixelData(texture, source, mipmapLevel, generateMipmap, xOffset, yOffset, width, height, premultiplyAlpha, invertY) {
            this._native.setCubeSubPixelData(texture._nativeObj, source, mipmapLevel, generateMipmap, xOffset, yOffset, width, height, premultiplyAlpha, invertY);
        }
        setCubeDDSData(texture, ddsInfo) {
            this._native.setCubeDDSData(texture._nativeObj, ddsInfo);
        }
        setCubeKTXData(texture, ktxInfo) {
            this._native.setCubeKTXData(texture._nativeObj, ktxInfo);
        }
        setTextureCompareMode(texture, compareMode) {
            return this._native.setTextureCompareMode(texture._nativeObj, compareMode);
        }
        bindRenderTarget(renderTarget, faceIndex = 0) {
            this._native.bindRenderTarget(renderTarget._nativeObj, faceIndex);
        }
        bindoutScreenTarget() {
            this._native.bindoutScreenTarget();
        }
        unbindRenderTarget(renderTarget) {
            this._native.unbindRenderTarget(renderTarget._nativeObj);
        }
        createRenderTargetInternal(width, height, colorFormat, depthStencilFormat, generateMipmap, sRGB, multiSamples) {
            return new GLESInternalRT(this._native.createRenderTargetInternal(width, height, colorFormat, depthStencilFormat ? depthStencilFormat : Laya.RenderTargetFormat.None, generateMipmap, sRGB, multiSamples));
        }
        createRenderTargetCubeInternal(size, colorFormat, depthStencilFormat, generateMipmap, sRGB, multiSamples) {
            return new GLESInternalRT(this._native.createRenderTargetCubeInternal(size, colorFormat, depthStencilFormat, generateMipmap, sRGB, multiSamples));
        }
        createRenderTextureCubeInternal(dimension, size, format, generateMipmap, sRGB) {
            return new GLESInternalTex(this._native.createRenderTextureCubeInternal(dimension, size, format, generateMipmap, sRGB));
        }
        createRenderTargetDepthTexture(renderTarget, dimension, width, height) {
            return new GLESInternalTex(this._native.createRenderTargetDepthTexture(renderTarget._nativeObj, dimension, width, height));
        }
        readRenderTargetPixelData(renderTarget, xOffset, yOffset, width, height, out) {
            return this._native.readRenderTargetPixelData(renderTarget._nativeObj, xOffset, yOffset, width, height, out);
        }
        readRenderTargetPixelDataAsync(renderTarget, xOffset, yOffset, width, height, out) {
            return Promise.resolve(this.readRenderTargetPixelData(renderTarget, xOffset, yOffset, width, height, out));
        }
        updateVideoTexture(texture, video, premultiplyAlpha, invertY) {
            this._native.updateVideoTexture(texture._nativeObj, video._nativeObj.conchImgId, premultiplyAlpha, invertY);
        }
    }

    exports.GLESMode = void 0;
    (function (GLESMode) {
        GLESMode[GLESMode["Auto"] = 0] = "Auto";
        GLESMode[GLESMode["WebGL2"] = 1] = "WebGL2";
        GLESMode[GLESMode["WebGL1"] = 2] = "WebGL1";
    })(exports.GLESMode || (exports.GLESMode = {}));
    class GLESEngine {
        constructor(config, webglMode = exports.GLESMode.Auto) {
            this._remapZ = true;
            this._screenInvertY = false;
            this._lodTextureSample = true;
            this._breakTextureSample = true;
            this._nativeObj = new window.conchGLESEngine(config, webglMode);
        }
        endFrame() {
        }
        get _enableStatistics() {
            return this._nativeObj.enableStatistics;
        }
        set _enableStatistics(value) {
            this._nativeObj.enableStatistics = value;
        }
        resizeOffScreen(width, height) {
            this._nativeObj.resizeOffScreen(width, height);
        }
        getDefineByName(name) {
            let nativeRet = this._nativeObj.getDefineByName(name);
            let ret = new RTShaderDefine(nativeRet._index, nativeRet._value);
            return ret;
        }
        getNamesByDefineData(defineData, out) {
            out.length = 0;
            this._nativeObj.getNamesByDefineData(defineData._nativeObj, out);
        }
        addTexGammaDefine(key, value) {
            this._nativeObj.addTexGammaDefine(key, value);
        }
        initRenderEngine(canvas) {
            this._nativeObj.initRenderEngine();
            this._GLTextureContext = new GLESTextureContext(this._nativeObj.getTextureContext());
        }
        copySubFrameBuffertoTex(texture, level, xoffset, yoffset, x, y, width, height) {
            throw new Laya.NotImplementedError();
        }
        propertyNameToID(name) {
            return this._nativeObj.propertyNameToID(name);
        }
        propertyIDToName(id) {
            return this._nativeObj.propertyIDToName(id);
        }
        getParams(params) {
            return this._nativeObj.getParams(params);
        }
        getCapable(capatableType) {
            return this._nativeObj.getCapable(capatableType);
        }
        getTextureContext() {
            return this._GLTextureContext;
        }
        getCreateRenderOBJContext() {
            throw new Laya.NotImplementedError();
        }
        clearStatisticsInfo() {
            this._nativeObj.clearStatisticsInfo();
        }
        getStatisticsInfo(info) {
            return this._nativeObj.getStatisticsInfo(info);
        }
        viewport(x, y, width, height) {
            this._nativeObj.viewport(x, y, width, height);
        }
        scissor(x, y, width, height) {
            this._nativeObj.scissor(x, y, width, height);
        }
    }

    class GLESIndexBuffer {
        destroy() {
            this._nativeObj.destroy();
        }
        _setIndexDataLength(data) {
            this._nativeObj._setIndexDataLength(data);
        }
        _setIndexData(data, bufferOffset) {
            this._nativeObj._setIndexData(data, bufferOffset);
        }
        get indexType() {
            return this._nativeObj._indexType;
        }
        set indexType(value) {
            this._nativeObj._indexType = value;
        }
        get indexCount() {
            return this._nativeObj._indexCount;
        }
        set indexCount(value) {
            this._nativeObj._indexCount = value;
        }
        constructor(targetType, bufferUsageType) {
            this._nativeObj = new window.conchGLESIndexBuffer(targetType, bufferUsageType);
        }
    }

    class GLESShaderInstance {
        constructor() {
            this._attributeMapTemp = new Map();
        }
        _create(shaderProcessInfo, shaderPass) {
            this._shaderPass = shaderPass;
            let shaderObj = Laya.GLSLCodeGenerator.GLShaderLanguageProcess3D(shaderProcessInfo.defineString, shaderProcessInfo.attributeMap, shaderProcessInfo.uniformMap, shaderProcessInfo.vs, shaderProcessInfo.ps);
            this._attributeMapTemp.clear();
            for (var k in shaderProcessInfo.attributeMap) {
                this._attributeMapTemp.set(k, shaderProcessInfo.attributeMap[k][0]);
            }
            this._nativeObj = new window.conchGLESShaderInstance(shaderProcessInfo.is2D, shaderObj.vs, shaderObj.fs, this._attributeMapTemp, shaderPass.moduleData._nativeObj);
        }
        _disposeResource() {
            this._nativeObj.destroy();
            this._nativeObj = null;
        }
    }

    class GLESRenderGeometryElement {
        constructor(mode, drawType) {
            this._nativeObj = new window.conchGLESRenderGeometryElement();
            this.mode = mode;
            this.drawParams = new Laya.FastSinglelist();
            this.drawType = drawType;
        }
        setDrawArrayParams(first, count) {
            this.drawParams.add(first);
            this.drawParams.add(count);
            this._nativeObj.setDrawArrayParams(first, count);
        }
        setDrawElemenParams(count, offset) {
            this.drawParams.add(offset);
            this.drawParams.add(count);
            this._nativeObj.setDrawElementParams(count, offset);
        }
        destroy() {
            this._nativeObj.destroy();
        }
        clearRenderParams() {
            this.drawParams.length = 0;
            this._nativeObj.clearRenderParams();
        }
        set bufferState(value) {
            this._bufferState = value;
            this._nativeObj.setBufferState(value ? value._nativeObj : null);
        }
        get bufferState() {
            return this._bufferState;
        }
        set mode(value) {
            this._nativeObj.mode = value;
        }
        get mode() {
            return this._nativeObj.mode;
        }
        set drawType(value) {
            this._nativeObj.drawType = value;
        }
        get drawType() {
            return this._nativeObj.drawType;
        }
        set instanceCount(value) {
            this._nativeObj.instanceCount = value;
        }
        get instanceCount() {
            return this._nativeObj.instanceCount;
        }
        set indexFormat(value) {
            this._nativeObj.indexFormat = value;
        }
        get indexFormat() {
            return this._nativeObj.indexFormat;
        }
    }

    class GLESVertexBuffer {
        constructor(targetType, bufferUsageType) {
            this._attributeMapTemp = new Map();
            this._nativeObj = new window.conchGLESVertexBuffer(targetType, bufferUsageType);
        }
        get vertexDeclaration() {
            return this._vertexDeclaration;
        }
        set vertexDeclaration(value) {
            this._vertexDeclaration = value;
            this._shaderValues = this._vertexDeclaration._shaderValues;
            this._nativeObj.clearVertexDeclaration();
            for (var k in this._shaderValues) {
                this._nativeObj.setVertexDeclaration(parseInt(k), this._shaderValues[k]);
            }
        }
        get instanceBuffer() {
            return this._nativeObj._instanceBuffer;
        }
        set instanceBuffer(value) {
            this._nativeObj._instanceBuffer = value;
        }
        setData(buffer, bufferOffset, dataStartIndex, dataCount) {
            this._nativeObj.setData(buffer, bufferOffset, dataStartIndex, dataCount);
        }
        setDataLength(byteLength) {
            this._nativeObj.setDataLength(byteLength);
        }
        destroy() {
            this._nativeObj.destroy();
            this._nativeObj = null;
        }
    }

    class GLESShaderData extends Laya.ShaderData {
        constructor(ownerResource = null) {
            super(ownerResource);
            this._defineDatas = new RTDefineDatas();
            this._nativeObj = new window.conchGLESShaderData(this._defineDatas._nativeObj);
            this._textureData = {};
            this._bufferData = {};
        }
        _releaseUBOData() {
        }
        setUniformBuffer(index, value) {
        }
        getUniformBuffer(index) {
            return null;
        }
        getDefineData() {
            return this._defineDatas;
        }
        getData() {
        }
        addDefine(define) {
            this._defineDatas.add(define);
        }
        addDefines(define) {
            this._defineDatas.addDefineDatas(define);
        }
        removeDefine(define) {
            this._defineDatas.remove(define);
        }
        hasDefine(define) {
            return this._defineDatas.has(define);
        }
        clearDefine() {
            this._defineDatas.clear();
        }
        getBool(index) {
            return this._nativeObj.getBool(index);
        }
        setBool(index, value) {
            this._nativeObj.setBool(index, value);
        }
        getInt(index) {
            return this._nativeObj.getInt(index);
        }
        setInt(index, value) {
            this._nativeObj.setInt(index, value);
        }
        getNumber(index) {
            return this._nativeObj.getNumber(index);
        }
        setNumber(index, value) {
            this._nativeObj.setNumber(index, value);
        }
        getVector2(index) {
            let value = this._nativeObj.getVector2(index);
            if (value == null) {
                return value;
            }
            else {
                let _tempVector2 = new Laya.Vector2();
                _tempVector2.x = value.x;
                _tempVector2.y = value.y;
                return _tempVector2;
            }
        }
        setVector2(index, value) {
            this._nativeObj.setVector2(index, value);
        }
        getVector3(index) {
            let value = this._nativeObj.getVector3(index);
            if (value == null) {
                return value;
            }
            else {
                let _tempVector3 = new Laya.Vector3();
                _tempVector3.x = value.x;
                _tempVector3.y = value.y;
                _tempVector3.z = value.z;
                return _tempVector3;
            }
        }
        setVector3(index, value) {
            this._nativeObj.setVector3(index, value);
        }
        getVector(index) {
            let value = this._nativeObj.getVector(index);
            let _tempVector = new Laya.Vector4();
            _tempVector.x = value.x;
            _tempVector.y = value.y;
            _tempVector.z = value.z;
            _tempVector.w = value.w;
            return _tempVector;
        }
        setVector(index, value) {
            this._nativeObj.setVector(index, value);
        }
        getColor(index) {
            let value = this._nativeObj.getColor(index);
            if (value == null) {
                return value;
            }
            else {
                let _tempColor = new Laya.Color();
                _tempColor.r = value.r;
                _tempColor.g = value.g;
                _tempColor.b = value.b;
                _tempColor.a = value.a;
                return _tempColor;
            }
        }
        setColor(index, value) {
            if (!value)
                return;
            this._nativeObj.setColor(index, value);
        }
        getMatrix4x4(index) {
            let value = this._nativeObj.getMatrix4x4(index);
            if (value == null) {
                return value;
            }
            else {
                let _tempMatrix4x4 = new Laya.Matrix4x4();
                _tempMatrix4x4.elements.set(value.elements);
                return _tempMatrix4x4;
            }
        }
        setMatrix4x4(index, value) {
            this._nativeObj.setMatrix4x4(index, value);
        }
        getMatrix3x3(index) {
            let value = this._nativeObj.getMatrix3x3(index);
            if (value == null) {
                return value;
            }
            else {
                let _tempMatrix3x3 = new Laya.Matrix3x3();
                _tempMatrix3x3.elements.set(value.elements);
                return _tempMatrix3x3;
            }
        }
        setMatrix3x3(index, value) {
            this._nativeObj.setMatrix3x3(index, value);
        }
        getBuffer(index) {
            return null;
        }
        setBuffer(index, value) {
            this._bufferData[index] = value;
            this._nativeObj.setBuffer(index, value);
        }
        setTexture(index, value) {
            var lastValue = this._textureData[index];
            if (value && value.bitmap)
                value = value.bitmap;
            this._textureData[index] = value;
            if (value && value._texture) {
                this._setInternalTexture(index, value._texture._nativeObj);
            }
            lastValue && lastValue._removeReference();
            value && value._addReference();
        }
        _setInternalTexture(index, value) {
            this._nativeObj._setInternalTexture(index, value);
        }
        getTexture(index) {
            return this._textureData[index];
        }
        cloneTo(destObject) {
            this._nativeObj.cloneTo(destObject._nativeObj);
            var dest = destObject;
            var destData = dest._textureData;
            for (var k in this._textureData) {
                var value = this._textureData[k];
                if (value != null) {
                    if (value instanceof Laya.BaseTexture) {
                        destData[k] = value;
                        value._addReference();
                    }
                }
            }
        }
        clone() {
            var dest = new GLESShaderData();
            this.cloneTo(dest);
            return dest;
        }
        destroy() {
            this._nativeObj.destroy();
            this._nativeObj = null;
        }
    }

    class GLESRenderDeviceFactory {
        constructor() {
            this.globalBlockMap = {};
        }
        createShaderData(ownerResource) {
            return new GLESShaderData(ownerResource);
        }
        createGlobalUniformMap(blockName) {
            let comMap = this.globalBlockMap[blockName];
            if (!comMap)
                comMap = this.globalBlockMap[blockName] = new GLESCommandUniformMap(blockName);
            return comMap;
        }
        createShaderInstance(shaderProcessInfo, shaderPass) {
            let shaderIns = new GLESShaderInstance();
            shaderIns._create(shaderProcessInfo, shaderPass);
            return shaderIns;
        }
        createIndexBuffer(bufferUsage) {
            return new GLESIndexBuffer(Laya.BufferTargetType.ELEMENT_ARRAY_BUFFER, bufferUsage);
        }
        createVertexBuffer(bufferUsageType) {
            return new GLESVertexBuffer(Laya.BufferTargetType.ARRAY_BUFFER, bufferUsageType);
        }
        createBufferState() {
            return new GLESBufferState();
        }
        createRenderGeometryElement(mode, drawType) {
            return new GLESRenderGeometryElement(mode, drawType);
        }
        createEngine(config, canvas) {
            throw new Laya.NotImplementedError();
        }
    }
    Laya.Laya.addBeforeInitCallback(() => {
        if (!Laya.LayaGL.renderDeviceFactory)
            Laya.LayaGL.renderDeviceFactory = new GLESRenderDeviceFactory();
    });

    class GLESRenderEngineFactory {
        createUniformBufferObject(glPointer, name, bufferUsage, byteLength, isSingle) {
            throw new Laya.NotImplementedError();
        }
        createEngine(config, canvas) {
            let engine;
            let glConfig = { stencil: Laya.Config.isStencil, alpha: Laya.Config.isAlpha, antialias: Laya.Config.isAntialias, premultipliedAlpha: Laya.Config.premultipliedAlpha, preserveDrawingBuffer: Laya.Config.preserveDrawingBuffer, depth: Laya.Config.isDepth, failIfMajorPerformanceCaveat: Laya.Config.isfailIfMajorPerformanceCaveat, powerPreference: Laya.Config.powerPreference };
            const webglMode = Laya.Config.useWebGL2 ? exports.GLESMode.Auto : exports.GLESMode.WebGL1;
            engine = new GLESEngine(glConfig, webglMode);
            engine.initRenderEngine(canvas._source);
            new Laya.LayaGL();
            Laya.LayaGL.renderEngine = engine;
            Laya.LayaGL.textureContext = engine.getTextureContext();
            Laya.Laya.addAfterInitCallback(this.afterInit);
            return Promise.resolve();
        }
        afterInit() {
            GLESRenderEngineFactory._setVertexDec(Laya.VertexMesh.instanceWorldMatrixDeclaration, "instanceWorldMatrixDeclaration");
            GLESRenderEngineFactory._setVertexDec(Laya.VertexMesh.instanceLightMapScaleOffsetDeclaration, "instanceLightMapScaleOffsetDeclaration");
            GLESRenderEngineFactory._setVertexDec(Laya.VertexMesh.instanceSimpleAnimatorDeclaration, "instanceSimpleAnimatorDeclaration");
        }
        static _setVertexDec(value, regName) {
            let shaderValues = value._shaderValues;
            for (var k in shaderValues) {
                Laya.LayaGL.renderEngine._nativeObj.regGlobalVertexDeclaration(regName, parseInt(k), shaderValues[k]);
            }
        }
    }
    Laya.Laya.addBeforeInitCallback(() => {
        if (!Laya.LayaGL.renderOBJCreate)
            Laya.LayaGL.renderOBJCreate = new GLESRenderEngineFactory();
    });

    class GLESREnderContext2D {
        get invertY() {
            return this._nativeObj.invertY;
        }
        set invertY(value) {
            this._nativeObj.invertY = value;
        }
        get pipelineMode() {
            return this._nativeObj.pipelineMode;
        }
        set pipelineMode(value) {
            this._nativeObj.pipelineMode = value;
        }
        constructor() {
            this._tempList = [];
            this._nativeObj = new window.conchGLESRenderContext2D();
            this._nativeObj.setGlobalConfigShaderData(Laya.Shader3D._configDefineValues._nativeObj);
            this._nativeObj.pipelineMode = "Forward";
            (!GLESREnderContext2D.isCreateBlitScreenELement) && this.setBlitScreenElement();
        }
        get sceneData() {
            return this._sceneData;
        }
        set sceneData(value) {
            this._sceneData = value;
            this._nativeObj.setSceneShaderData(value ? value._nativeObj : null);
        }
        setBlitScreenElement() {
            let blitScreenElement = Laya.LayaGL.render2DRenderPassFactory.createRenderElement2D();
            let shaderData = Laya.LayaGL.renderDeviceFactory.createShaderData();
            let _vertices = new Float32Array([
                1, 1, 1, 1,
                1, -1, 1, 0,
                -1, 1, 0, 1,
                -1, -1, 0, 0
            ]);
            let _vertexBuffer = new GLESVertexBuffer(Laya.BufferTargetType.ARRAY_BUFFER, Laya.BufferUsage.Dynamic);
            _vertexBuffer.setDataLength(64);
            _vertexBuffer.setData(_vertices.buffer, 0, 0, _vertices.buffer.byteLength);
            let declaration = new Laya.VertexDeclaration(16, [new Laya.VertexElement(0, Laya.VertexElementFormat.Vector4, 0)]);
            _vertexBuffer.vertexDeclaration = declaration;
            let geometry = Laya.LayaGL.renderDeviceFactory.createRenderGeometryElement(Laya.MeshTopology.TriangleStrip, Laya.DrawType.DrawArray);
            geometry.setDrawArrayParams(0, 4);
            let bufferState = Laya.LayaGL.renderDeviceFactory.createBufferState();
            bufferState.applyState([_vertexBuffer], null);
            geometry.bufferState = bufferState;
            let attributeMap = {
                'a_PositionTexcoord': [0, Laya.ShaderDataType.Vector4]
            };
            let uniformMap = {
                "u_MainTex": Laya.ShaderDataType.Texture2D,
            };
            let shader = Laya.Shader3D.add("GLESblitScreen", false, false);
            shader.shaderType = Laya.ShaderFeatureType.D2;
            let subShader = new Laya.SubShader(attributeMap, uniformMap, {});
            shader.addSubShader(subShader);
            let vs = `
            #define SHADER_NAME GLESblitScreenVS

            varying vec2 v_Texcoord0;

            void main()
            {
                gl_Position = vec4(- 1.0 + (a_PositionTexcoord.x + 1.0), (1.0 - ((- 1.0 + (-a_PositionTexcoord.y + 1.0)) + 1.0) / 2.0) * 2.0 - 1.0, 0.0, 1.0);

                v_Texcoord0 = a_PositionTexcoord.zw;
            }
        `;
            let fs = `
            #define SHADER_NAME GLESblitScreenFS

            varying vec2 v_Texcoord0;

            void main()
            {
                vec4 mainColor = texture2D(u_MainTex, v_Texcoord0);
               
                gl_FragColor = mainColor;
            }
        `;
            let pass = subShader.addShaderPass(vs, fs);
            pass.statefirst = true;
            let blitState = pass.renderState;
            blitState.depthTest = Laya.RenderState.DEPTHTEST_ALWAYS;
            blitState.depthWrite = false;
            blitState.cull = Laya.RenderState.CULL_NONE;
            blitState.blend = Laya.RenderState.BLEND_DISABLE;
            blitState.stencilRef = 1;
            blitState.stencilTest = Laya.RenderState.STENCILTEST_OFF;
            blitState.stencilWrite = false;
            blitState.stencilOp = new Laya.Vector3(Laya.RenderState.STENCILOP_KEEP, Laya.RenderState.STENCILOP_KEEP, Laya.RenderState.STENCILOP_REPLACE);
            blitScreenElement.geometry = geometry;
            blitScreenElement.materialShaderData = shaderData;
            blitScreenElement.subShader = subShader;
            blitScreenElement.renderStateIsBySprite = false;
            this._nativeObj.setBlitScreenElement(blitScreenElement._nativeObj);
            GLESREnderContext2D.isCreateBlitScreenELement = true;
            GLESREnderContext2D.blitScreenElement = blitScreenElement;
        }
        drawRenderElementList(list) {
            this._tempList.length = 0;
            let listelement = list.elements;
            listelement.forEach((element) => {
                this._tempList.push(element._nativeObj);
            });
            return this._nativeObj.drawRenderElementList(this._tempList, list.length);
        }
        setRenderTarget(value, clear, clearColor) {
            this._nativeObj.setRenderTarget(value ? value._nativeObj : null, clear, clearColor);
        }
        setOffscreenView(width, height) {
            this._nativeObj.setOffscreenView(width, height);
        }
        drawRenderElementOne(node) {
            this._nativeObj.drawRenderElementOne(node._nativeObj);
        }
    }
    GLESREnderContext2D.isCreateBlitScreenELement = false;

    class GLESREnderElement2D {
        set geometry(data) {
            this._geometry = data;
            this._nativeObj.setGeometry(data ? data._nativeObj : null);
        }
        get geometry() {
            return this._geometry;
        }
        set materialShaderData(data) {
            this._materialShaderData = data;
            this._nativeObj.setMaterialShaderData(data ? data._nativeObj : null);
        }
        get materialShaderData() {
            return this._materialShaderData;
        }
        set value2DShaderData(data) {
            this._value2DShaderData = data;
            this._nativeObj.setValue2DShaderData(data ? data._nativeObj : null);
        }
        get value2DShaderData() {
            return this._value2DShaderData;
        }
        get subShader() {
            return this._subShader;
        }
        set subShader(value) {
            this._subShader = value;
            this._nativeObj.setSubShader(value.moduleData._nativeObj);
        }
        init() {
            this._nativeObj = new window.conchGLESRenderElement2D();
            window.conchGLESRenderElement2D.setCompileDefine(RTShaderPass.getGlobalCompileDefine()._nativeObj);
        }
        constructor() {
            this._renderStateIsBySprite = true;
            this.init();
        }
        get nodeCommonMap() {
            return this._nodeCommonMap;
        }
        set nodeCommonMap(value) {
            this._nodeCommonMap = value;
        }
        get renderStateIsBySprite() {
            return this._renderStateIsBySprite;
        }
        set renderStateIsBySprite(value) {
            this._renderStateIsBySprite = value;
            this._nativeObj.renderStateIsBySprite = value;
        }
        destroy() {
            this._nativeObj.destroy();
            this.geometry = null;
        }
    }

    class GLESRender2DProcess {
        createRenderElement2D() {
            return new GLESREnderElement2D();
        }
        createRenderContext2D() {
            return new GLESREnderContext2D();
        }
    }
    Laya.Laya.addBeforeInitCallback(() => {
        if (!Laya.LayaGL.render2DRenderPassFactory)
            Laya.LayaGL.render2DRenderPassFactory = new GLESRender2DProcess();
    });

    exports.CommonMemoryAllocater = CommonMemoryAllocater;
    exports.GLESBufferState = GLESBufferState;
    exports.GLESCommandUniformMap = GLESCommandUniformMap;
    exports.GLESEngine = GLESEngine;
    exports.GLESIndexBuffer = GLESIndexBuffer;
    exports.GLESInternalRT = GLESInternalRT;
    exports.GLESInternalTex = GLESInternalTex;
    exports.GLESREnderContext2D = GLESREnderContext2D;
    exports.GLESREnderElement2D = GLESREnderElement2D;
    exports.GLESRender2DProcess = GLESRender2DProcess;
    exports.GLESRenderDeviceFactory = GLESRenderDeviceFactory;
    exports.GLESRenderEngineFactory = GLESRenderEngineFactory;
    exports.GLESRenderGeometryElement = GLESRenderGeometryElement;
    exports.GLESShaderData = GLESShaderData;
    exports.GLESShaderInstance = GLESShaderInstance;
    exports.GLESTextureContext = GLESTextureContext;
    exports.GLESVertexBuffer = GLESVertexBuffer;
    exports.NativeMemory = NativeMemory;
    exports.RTDefineDatas = RTDefineDatas;
    exports.RTRenderState = RTRenderState;
    exports.RTShaderDefine = RTShaderDefine;
    exports.RTShaderPass = RTShaderPass;
    exports.RTSubShader = RTSubShader;
    exports.RTUintRenderModuleDataFactory = RTUintRenderModuleDataFactory;

})(window.Laya = window.Laya || {}, Laya);
//# sourceMappingURL=laya.opengl_2D.js.map
