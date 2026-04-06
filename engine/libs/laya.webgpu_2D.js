(function (exports, Laya) {
    'use strict';

    class WebDefineDatas {
        constructor() {
            this._mask = [];
            this._length = 0;
        }
        _intersectionDefineDatas(define) {
            var unionMask = define._mask;
            var mask = this._mask;
            for (var i = this._length - 1; i >= 0; i--) {
                var value = mask[i] & unionMask[i];
                if (value == 0 && i == this._length - 1)
                    this._length--;
                else
                    mask[i] = value;
            }
        }
        add(define) {
            var index = define._index;
            var size = index + 1;
            var mask = this._mask;
            var maskStart = this._length;
            if (maskStart < size) {
                (mask.length < size) && (mask.length = size);
                for (; maskStart < index; maskStart++)
                    mask[maskStart] = 0;
                mask[index] = define._value;
                this._length = size;
            }
            else {
                mask[index] |= define._value;
            }
        }
        remove(define) {
            var index = define._index;
            var mask = this._mask;
            var endIndex = this._length - 1;
            if (index > endIndex)
                return;
            var newValue = mask[index] & ~define._value;
            if (index == endIndex && newValue === 0)
                this._length--;
            else
                mask[index] = newValue;
        }
        addDefineDatas(define) {
            var addMask = define._mask;
            var size = define._length;
            var mask = this._mask;
            var maskStart = this._length;
            if (maskStart < size) {
                mask.length = size;
                for (var i = 0; i < maskStart; i++)
                    mask[i] |= addMask[i];
                for (; i < size; i++)
                    mask[i] = addMask[i];
                this._length = size;
            }
            else {
                for (var i = 0; i < size; i++) {
                    mask[i] |= addMask[i];
                }
            }
        }
        removeDefineDatas(define) {
            var removeMask = define._mask;
            var mask = this._mask;
            var endIndex = this._length - 1;
            var i = Math.min(define._length, endIndex);
            for (; i >= 0; i--) {
                var newValue = mask[i] & ~removeMask[i];
                if (i == endIndex && newValue === 0) {
                    endIndex--;
                    this._length--;
                }
                else {
                    mask[i] = newValue;
                }
            }
        }
        has(define) {
            var index = define._index;
            if (index >= this._length)
                return false;
            return (this._mask[index] & define._value) !== 0;
        }
        clear() {
            this._length = 0;
        }
        cloneTo(destObject) {
            var destMask = destObject._mask;
            var mask = this._mask;
            var count = this._length;
            destMask.length = count;
            for (var i = 0; i < count; i++)
                destMask[i] = mask[i];
            destObject._length = count;
        }
        clone() {
            var dest = new WebDefineDatas();
            this.cloneTo(dest);
            return dest;
        }
        destroy() {
            delete this._mask;
        }
    }

    class WebGLShaderData extends Laya.ShaderData {
        get uniformBufferDatas() {
            return this._uniformBufferDatas;
        }
        get uniformBuffersMap() {
            return this._uniformBuffersMap;
        }
        _releaseUBOData() {
            if (!this._uniformBufferDatas) {
                return;
            }
            for (let value of this._uniformBufferDatas.values()) {
                value.ubo._updateDataInfo.destroy();
                value.ubo.destroy();
                value.ubo._updateDataInfo = null;
            }
            this._uniformBufferDatas.clear();
            this._uniformBuffersMap.clear();
        }
        constructor(ownerResource = null) {
            super(ownerResource);
            this.applyUBO = false;
            this._data = null;
            this._defineDatas = new WebDefineDatas();
            this._initData();
            this._uniformBufferDatas = new Map();
            this._uniformBuffersMap = new Map();
        }
        _addCheckUBO(key, ubo, uboData) {
            this._uniformBufferDatas.set(key, { ubo: ubo, uboBuffer: uboData });
            uboData._uniformParamsState.forEach((value, id) => {
                this.uniformBuffersMap.set(id, ubo);
            });
            ubo.setDataByUniformBufferData(uboData);
        }
        _initData() {
            this._data = {};
            this._gammaColorMap = new Map();
        }
        getData() {
            return this._data;
        }
        applyUBOData() {
            this._uniformBufferDatas.forEach((value, key) => {
                value.ubo.setDataByUniformBufferData(value.uboBuffer);
            });
            this.applyUBO = false;
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
            return this._data[index];
        }
        setBool(index, value) {
            this._data[index] = value;
        }
        getInt(index) {
            return this._data[index];
        }
        setInt(index, value) {
            this._data[index] = value;
            let ubo = this._uniformBuffersMap.get(index);
            if (ubo) {
                this._uniformBufferDatas.get(ubo._name).uboBuffer._setData(index, this.getInt(index));
            }
        }
        getNumber(index) {
            return this._data[index];
        }
        setNumber(index, value) {
            this._data[index] = value;
            let ubo = this._uniformBuffersMap.get(index);
            if (ubo) {
                this._uniformBufferDatas.get(ubo._name).uboBuffer._setData(index, this.getNumber(index));
                this.applyUBO = true;
            }
        }
        getVector2(index) {
            return this._data[index];
        }
        setVector2(index, value) {
            if (this._data[index]) {
                value.cloneTo(this._data[index]);
            }
            else
                this._data[index] = value.clone();
            let ubo = this._uniformBuffersMap.get(index);
            if (ubo) {
                this._uniformBufferDatas.get(ubo._name).uboBuffer._setData(index, this.getVector2(index));
                this.applyUBO = true;
            }
        }
        getVector3(index) {
            return this._data[index];
        }
        setVector3(index, value) {
            if (this._data[index]) {
                value.cloneTo(this._data[index]);
            }
            else
                this._data[index] = value.clone();
            let ubo = this._uniformBuffersMap.get(index);
            if (ubo) {
                this._uniformBufferDatas.get(ubo._name).uboBuffer._setData(index, this.getVector3(index));
                this.applyUBO = true;
            }
        }
        getVector(index) {
            return this._data[index];
        }
        setVector(index, value) {
            if (this._data[index]) {
                value.cloneTo(this._data[index]);
            }
            else
                this._data[index] = value.clone();
            let ubo = this._uniformBuffersMap.get(index);
            if (ubo) {
                this._uniformBufferDatas.get(ubo._name).uboBuffer._setData(index, this.getVector(index));
                this.applyUBO = true;
            }
        }
        getColor(index) {
            return this._gammaColorMap.get(index);
        }
        setColor(index, value) {
            if (!value)
                return;
            if (this._data[index]) {
                let gammaColor = this._gammaColorMap.get(index);
                value.cloneTo(gammaColor);
                let linearColor = this._data[index];
                linearColor.x = Laya.Color.gammaToLinearSpace(value.r);
                linearColor.y = Laya.Color.gammaToLinearSpace(value.g);
                linearColor.z = Laya.Color.gammaToLinearSpace(value.b);
                linearColor.w = value.a;
            }
            else {
                let linearColor = new Laya.Vector4();
                linearColor.x = Laya.Color.gammaToLinearSpace(value.r);
                linearColor.y = Laya.Color.gammaToLinearSpace(value.g);
                linearColor.z = Laya.Color.gammaToLinearSpace(value.b);
                linearColor.w = value.a;
                this._data[index] = linearColor;
                this._gammaColorMap.set(index, value.clone());
            }
            let ubo = this._uniformBuffersMap.get(index);
            if (ubo) {
                this._uniformBufferDatas.get(ubo._name).uboBuffer._setData(index, this.getLinearColor(index));
                this.applyUBO = true;
            }
        }
        getLinearColor(index) {
            return this._data[index];
        }
        getMatrix4x4(index) {
            return this._data[index];
        }
        setMatrix4x4(index, value) {
            if (this._data[index]) {
                value.cloneTo(this._data[index]);
            }
            else {
                this._data[index] = value.clone();
            }
            let ubo = this._uniformBuffersMap.get(index);
            if (ubo) {
                this._uniformBufferDatas.get(ubo._name).uboBuffer._setData(index, this.getMatrix4x4(index));
                this.applyUBO = true;
            }
        }
        getMatrix3x3(index) {
            return this._data[index];
        }
        setMatrix3x3(index, value) {
            if (this._data[index]) {
                value.cloneTo(this._data[index]);
            }
            else {
                this._data[index] = value.clone();
            }
            let ubo = this._uniformBuffersMap.get(index);
            if (ubo) {
                this._uniformBufferDatas.get(ubo._name).uboBuffer._setData(index, this.getMatrix3x3(index));
            }
        }
        getBuffer(index) {
            return this._data[index];
        }
        setBuffer(index, value) {
            this._data[index] = value;
        }
        setTexture(index, value) {
            var lastValue = this._data[index];
            if (value) {
                let shaderDefine = Laya.WebGLEngine._texGammaDefine[index];
                if (shaderDefine && value && value.gammaCorrection > 1) {
                    this.addDefine(shaderDefine);
                }
                else {
                    shaderDefine && this.removeDefine(shaderDefine);
                }
            }
            this._data[index] = value;
            lastValue && lastValue._removeReference();
            value && value._addReference();
        }
        _setInternalTexture(index, value) {
            this._data[index];
            if (value) {
                let shaderDefine = Laya.WebGLEngine._texGammaDefine[index];
                if (shaderDefine && value && value.gammaCorrection > 1) {
                    this.addDefine(shaderDefine);
                }
                else {
                    shaderDefine && this.removeDefine(shaderDefine);
                }
            }
            this._data[index] = value;
        }
        getTexture(index) {
            return this._data[index];
        }
        getSourceIndex(value) {
            for (var i in this._data) {
                if (this._data[i] == value)
                    return Number(i);
            }
            return -1;
        }
        setUniformBuffer(index, value) {
            this._data[index] = value;
        }
        getUniformBuffer(index) {
            return this._data[index];
        }
        cloneTo(destObject) {
            let destData = destObject._data;
            for (let k in this._data) {
                let value = this._data[k];
                if (value != null) {
                    if (typeof value == "number") {
                        destData[k] = value;
                    }
                    else if (typeof value == "boolean") {
                        destData[k] = value;
                    }
                    else if (value instanceof Laya.Vector2) {
                        let v2 = destData[k] || (destData[k] = new Laya.Vector2());
                        value.cloneTo(v2);
                    }
                    else if (value instanceof Laya.Vector3) {
                        let v3 = destData[k] || (destData[k] = new Laya.Vector3());
                        value.cloneTo(v3);
                    }
                    else if (value instanceof Laya.Vector4) {
                        let color = this.getColor(parseInt(k));
                        if (color) {
                            let clonecolor = color.clone();
                            destObject.setColor(parseInt(k), clonecolor);
                        }
                        else {
                            let v4 = destData[k] || (destData[k] = new Laya.Vector4());
                            value.cloneTo(v4);
                        }
                    }
                    else if (value instanceof Laya.Matrix3x3) {
                        let mat = destData[k] || (destData[k] = new Laya.Matrix3x3());
                        value.cloneTo(mat);
                    }
                    else if (value instanceof Laya.Matrix4x4) {
                        let mat = destData[k] || (destData[k] = new Laya.Matrix4x4());
                        value.cloneTo(mat);
                    }
                    else if (value instanceof Laya.Resource) {
                        destData[k] = value;
                        value._addReference();
                    }
                }
            }
            this._defineDatas.cloneTo(destObject._defineDatas);
            this._gammaColorMap.forEach((color, index) => {
                destObject._gammaColorMap.set(index, color.clone());
            });
            this._cloneUBO(destObject._uniformBufferDatas);
            destObject.applyUBO = true;
        }
        getDefineData() {
            return this._defineDatas;
        }
        _cloneUBO(uboDatas) {
            this._uniformBufferDatas.forEach((value, key) => {
                uboDatas.has(key) && (value.uboBuffer.cloneTo(uboDatas.get(key).uboBuffer));
            });
        }
        clone() {
            var dest = new WebGLShaderData();
            this.cloneTo(dest);
            return dest;
        }
        reset() {
            for (var k in this._data) {
                var value = this._data[k];
                if (value instanceof Laya.Resource) {
                    value._removeReference();
                }
            }
            this._data = {};
            this._gammaColorMap.clear();
            this._uniformBufferDatas.clear();
            this.applyUBO = false;
            this._uniformBuffersMap.clear();
            this._defineDatas.clear();
        }
        destroy() {
            this._defineDatas.destroy();
            this._defineDatas = null;
            for (var k in this._data) {
                var value = this._data[k];
                if (value instanceof Laya.Resource) {
                    value._removeReference();
                }
            }
            this._data = null;
            this._gammaColorMap.clear();
            this._gammaColorMap = null;
            delete this._uniformBufferDatas;
            delete this._uniformBuffersMap;
            this._uniformBufferDatas = null;
            this._uniformBuffersMap = null;
        }
    }

    class WebShaderPass {
        get renderState() {
            return this._renderState;
        }
        set renderState(value) {
            this._renderState = value;
        }
        get validDefine() {
            return this._validDefine;
        }
        set validDefine(value) {
            this._validDefine = value;
        }
        constructor(pass) {
            this._cacheShaderHierarchy = 20;
            this._cacheSharders = {};
            this._renderState = new Laya.RenderState();
            this._renderState.setNull();
        }
        _resizeCacheShaderMap(cacheMap, hierarchy, resizeLength) {
            var end = this._cacheShaderHierarchy - 1;
            if (hierarchy == end) {
                for (var k in cacheMap) {
                    var shader = cacheMap[k];
                    for (var i = 0, n = resizeLength - end; i < n; i++) {
                        if (i == n - 1)
                            cacheMap[0] = shader;
                        else
                            cacheMap = cacheMap[i == 0 ? k : 0] = {};
                    }
                }
            }
            else {
                ++hierarchy;
                for (var k in cacheMap)
                    this._resizeCacheShaderMap(cacheMap[k], hierarchy, resizeLength);
            }
        }
        setCacheShader(compileDefine, shader) {
            var cacheShaders = this._cacheSharders;
            var mask = compileDefine._mask;
            var endIndex = compileDefine._length - 1;
            var maxEndIndex = this._cacheShaderHierarchy - 1;
            for (var i = 0; i < maxEndIndex; i++) {
                var subMask = endIndex < i ? 0 : mask[i];
                var subCacheShaders = cacheShaders[subMask];
                (subCacheShaders) || (cacheShaders[subMask] = subCacheShaders = {});
                cacheShaders = subCacheShaders;
            }
            var cacheKey = endIndex < maxEndIndex ? 0 : mask[maxEndIndex];
            cacheShaders[cacheKey] = shader;
        }
        getCacheShader(compileDefine) {
            compileDefine._intersectionDefineDatas(this._validDefine);
            var cacheShaders = this._cacheSharders;
            var maskLength = compileDefine._length;
            if (maskLength > this._cacheShaderHierarchy) {
                this._resizeCacheShaderMap(cacheShaders, 0, maskLength);
                this._cacheShaderHierarchy = maskLength;
            }
            var mask = compileDefine._mask;
            var endIndex = compileDefine._length - 1;
            var maxEndIndex = this._cacheShaderHierarchy - 1;
            for (var i = 0; i < maxEndIndex; i++) {
                var subMask = endIndex < i ? 0 : mask[i];
                var subCacheShaders = cacheShaders[subMask];
                (subCacheShaders) || (cacheShaders[subMask] = subCacheShaders = {});
                cacheShaders = subCacheShaders;
            }
            var cacheKey = endIndex < maxEndIndex ? 0 : mask[maxEndIndex];
            var shader = cacheShaders[cacheKey];
            return shader;
        }
        destroy() {
        }
    }

    class WebSubShader {
        destroy() {
            throw new Laya.NotImplementedError();
        }
        addShaderPass(pass) { }
    }

    class WebUnitRenderModuleDataFactory {
        createSubShader() {
            return new WebSubShader();
        }
        createShaderPass(pass) {
            return new WebShaderPass(pass);
        }
        createRenderState() {
            return new Laya.RenderState();
        }
        createDefineDatas() {
            return new WebDefineDatas();
        }
    }
    Laya.Laya.addBeforeInitCallback(() => {
        if (!Laya.LayaGL.unitRenderModuleDataFactory)
            Laya.LayaGL.unitRenderModuleDataFactory = new WebUnitRenderModuleDataFactory();
    });

    class WebGPUCapable {
        constructor(descriptor) {
            this.initCapable(descriptor);
        }
        initCapable(descriptor) {
            this._capabilityMap = new Map();
            this._capabilityMap.set(Laya.RenderCapable.Element_Index_Uint32, true);
            this._capabilityMap.set(Laya.RenderCapable.TextureFormat_R32G32B32A32, true);
            this._capabilityMap.set(Laya.RenderCapable.TextureFormat_R16G16B16A16, true);
            this._capabilityMap.set(Laya.RenderCapable.Texture_anisotropic, true);
            this._capabilityMap.set(Laya.RenderCapable.RenderTextureFormat_R16G16B16A16, true);
            this._capabilityMap.set(Laya.RenderCapable.RenderTextureFormat_Depth, true);
            this._capabilityMap.set(Laya.RenderCapable.RenderTextureFormat_ShadowMap, true);
            this._capabilityMap.set(Laya.RenderCapable.Vertex_VAO, true);
            this._capabilityMap.set(Laya.RenderCapable.DrawElement_Instance, true);
            this._capabilityMap.set(Laya.RenderCapable.Shader_TextureLod, true);
            this._capabilityMap.set(Laya.RenderCapable.COMPRESS_TEXTURE_S3TC, false);
            this._capabilityMap.set(Laya.RenderCapable.COMPRESS_TEXTURE_S3TC_SRGB, false);
            this._capabilityMap.set(Laya.RenderCapable.COMPRESS_TEXTURE_PVRTC, false);
            this._capabilityMap.set(Laya.RenderCapable.COMPRESS_TEXTURE_ETC1, false);
            this._capabilityMap.set(Laya.RenderCapable.COMPRESS_TEXTURE_ETC, false);
            this._capabilityMap.set(Laya.RenderCapable.COMPRESS_TEXTURE_ASTC, false);
            this._capabilityMap.set(Laya.RenderCapable.Texture_SRGB, true);
            this._capabilityMap.set(Laya.RenderCapable.MSAA, true);
            this._capabilityMap.set(Laya.RenderCapable.UnifromBufferObject, false);
            this._capabilityMap.set(Laya.RenderCapable.Texture3D, true);
            this._capabilityMap.set(Laya.RenderCapable.Texture_HalfFloatLinearFiltering, true);
            this._capabilityMap.set(Laya.RenderCapable.RenderTextureFormat_R32G32B32A32, true);
            this._capabilityMap.set(Laya.RenderCapable.RenderTextureFormat_R16G16B16A16, true);
            let features = descriptor.requiredFeatures;
            for (const iterator of features) {
                switch (iterator) {
                    case "texture-compression-astc":
                        this._capabilityMap.set(Laya.RenderCapable.COMPRESS_TEXTURE_ASTC, true);
                        break;
                    case "texture-compression-bc":
                        this._capabilityMap.set(Laya.RenderCapable.COMPRESS_TEXTURE_S3TC, true);
                        this._capabilityMap.set(Laya.RenderCapable.COMPRESS_TEXTURE_S3TC_SRGB, true);
                        break;
                    case "texture-compression-etc2":
                        this._capabilityMap.set(Laya.RenderCapable.COMPRESS_TEXTURE_ETC1, true);
                        this._capabilityMap.set(Laya.RenderCapable.COMPRESS_TEXTURE_ETC, true);
                        break;
                    case "float32-filterable":
                        this._capabilityMap.set(Laya.RenderCapable.Texture_FloatLinearFiltering, true);
                        break;
                }
            }
        }
        getCapable(type) {
            return this._capabilityMap.get(type);
        }
    }

    class WebGPUStatis {
        static startFrame() {
            this._frameStatis.submit = 0;
            this._frameStatis.uploadNum = 0;
            this._frameStatis.uploadBytes = 0;
            this._frameStatis.renderElement = 0;
        }
        static addUploadNum(n = 1) {
            this._frameStatis.uploadNum += n;
        }
        static addUploadBytes(n = 1) {
            this._frameStatis.uploadBytes += n;
        }
        static addRenderElement(n = 1) {
            this._frameStatis.renderElement += n;
        }
        static addSubmit(n = 1) {
            this._frameStatis.submit += n;
        }
        static addTexture(texture) {
            this._textureStatis.push(texture);
        }
        static trackObjectCreation(name, id, object, memory) {
            const time = Date.now() - this._start;
            this._dataTiming.push({ action: 'create', name, id, time, memory, object });
            if (!this._dataCreate[name])
                this._dataCreate[name] = { id: [], count: 0, time: [], memory: 0, object: [] };
            this._dataCreate[name].id.push(id);
            this._dataCreate[name].count++;
            this._dataCreate[name].time.push(time);
            this._dataCreate[name].memory += memory;
            this._dataCreate[name].object.push(object);
            this._totalStatis.memory += memory;
        }
        static trackObjectRelease(name, id, object, memory) {
            const time = Date.now() - this._start;
            this._dataTiming.push({ action: 'release', name, id, time, memory, object });
            if (!this._dataRelease[name])
                this._dataRelease[name] = { id: [], count: 0, time: [], memory: 0, object: [] };
            this._dataRelease[name].id.push(id);
            this._dataRelease[name].count++;
            this._dataRelease[name].time.push(time);
            this._dataRelease[name].memory += memory;
            this._dataRelease[name].object.push(object);
            this._totalStatis.memory -= memory;
        }
        static trackObjectAction(name, id, action, object, memory) {
            const time = Date.now() - this._start;
            this._dataTiming.push({ action, name, id, time, memory, object });
            this._totalStatis.memory += memory;
        }
        static printStatisticsAsTable() {
            if (this._dataTiming.length > 0) {
                console.log('timing statistics: ');
                console.table(this._dataTiming);
            }
            if (Object.keys(this._dataCreate).length > 0) {
                console.log('object creation statistics: ');
                console.table(this._dataCreate);
            }
            if (Object.keys(this._dataRelease).length > 0) {
                console.log('object release statistics: ');
                console.table(this._dataRelease);
            }
        }
        static printTotalStatis() {
            console.table(this._totalStatis);
        }
        static printFrameStatis() {
            console.table(this._frameStatis);
        }
        static printTextureStatis() {
            console.log('texture statistics: ');
            console.table(this._textureStatis);
        }
    }
    WebGPUStatis._start = Date.now();
    WebGPUStatis._totalStatis = { memory: 0 };
    WebGPUStatis._frameStatis = {};
    WebGPUStatis._dataTiming = [];
    WebGPUStatis._dataCreate = {};
    WebGPUStatis._dataRelease = {};
    WebGPUStatis._textureStatis = [];

    class WebGPUGlobal {
        static getUniformInfoId() {
            return this._uniformInfoIdCounter++;
        }
        static getId(object) {
            if (this.debug && object)
                WebGPUStatis.trackObjectCreation(object.objectName || 'unknown', this._idCounter, object, 0);
            return this._idCounter++;
        }
        static releaseId(object) {
            if (this.debug && object)
                WebGPUStatis.trackObjectRelease(object.objectName || 'unknown', object.globalId, object, 0);
        }
        static action(object, action, memory = 0) {
            if (this.debug && object)
                WebGPUStatis.trackObjectAction(object.objectName || 'unknown', object.globalId, action, object, memory);
        }
        static reset() {
            this._idCounter = 0;
        }
        static get idCounter() {
            return this._idCounter;
        }
    }
    WebGPUGlobal.debug = false;
    WebGPUGlobal.useCache = true;
    WebGPUGlobal.useBundle = true;
    WebGPUGlobal.useBigBuffer = true;
    WebGPUGlobal.useGlobalContext = true;
    WebGPUGlobal._idCounter = 0;
    WebGPUGlobal._uniformInfoIdCounter = 0;

    class WebGPUBufferManager extends Laya.UniformBufferManager {
        constructor(useBigBuffer) {
            super(useBigBuffer);
            this.objectName = 'WebGPUBufferManager';
            this.globalId = WebGPUGlobal.getId(this);
        }
        destroy() {
            if (super.destroy())
                return true;
            return false;
        }
        createGPUBuffer(size, name) {
            return this.renderContext.device.createBuffer({
                label: name,
                size,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            });
        }
        writeBuffer(buffer, data, offset, size) {
            this.renderContext.device.queue.writeBuffer(buffer, offset, data, offset, size);
        }
        statisGPUMemory(bytes) {
            WebGPURenderEngine._instance._addStatisticsInfo(Laya.GPUEngineStatisticsInfo.M_GPUMemory, bytes);
            WebGPURenderEngine._instance._addStatisticsInfo(Laya.GPUEngineStatisticsInfo.M_GPUBuffer, bytes);
            WebGPUGlobal.action(this, 'expandMemory | uniform', bytes);
        }
        statisUpload(count, bytes) {
            WebGPURenderEngine._instance._addStatisticsInfo(Laya.GPUEngineStatisticsInfo.C_UniformBufferUploadCount, count);
            WebGPUStatis.addUploadNum(count);
            WebGPUStatis.addUploadBytes(bytes);
        }
    }

    class WebGPUShaderDefine {
        static findNumberDefine(code, map) {
            const pattern = /^\s*#define\s+(\w+)\s+([1-9]\d*)(?=\s*($|\/\/))/gm;
            if (!map)
                map = new Map();
            let match;
            while ((match = pattern.exec(code)) !== null) {
                map.set(match[1], match[2]);
            }
            return map;
        }
    }

    class WebGPU_GLSLCommon {
        static replaceStringPart(str, replace, start, end) {
            const beforePart = str.substring(0, start);
            const afterPart = str.substring(end);
            return beforePart + replace + afterPart;
        }
        static findParamInBracket(input, start, bracket = '()') {
            let depth = 0;
            let firstParentIndex = 0;
            const beginBracket = bracket[0];
            const endBracket = bracket[1];
            const length = input.length;
            for (let i = start; i < length; i++) {
                if (input[i] === beginBracket) {
                    firstParentIndex = i;
                    break;
                }
                if (input[i] !== ' ' && input[i] !== '\t' && input[i] !== '\n' && input[i] !== '\r')
                    return null;
            }
            let element;
            let elements = [];
            start = firstParentIndex;
            let currentElementStart = firstParentIndex + 1;
            for (let i = firstParentIndex; i < length; i++) {
                const char = input[i];
                if (char === beginBracket)
                    depth++;
                else if (char === endBracket) {
                    depth--;
                    if (depth === 0) {
                        start = i + 1;
                        element = input.substring(currentElementStart, i).trim();
                        if (element.length > 0)
                            elements.push(element);
                        break;
                    }
                }
                else if (char === ',' && depth === 1) {
                    element = input.substring(currentElementStart, i).trim();
                    if (element.length > 0)
                        elements.push(element);
                    currentElementStart = i + 1;
                }
            }
            const full = input.substring(firstParentIndex, start);
            return {
                full,
                elements,
                index: start
            };
        }
        static replaceArgumentByFunctionCategory(code, variableName, functionNames, replacementInCategory, replacementOutOfCategory) {
            const functionRegex = new RegExp('([\\w]+)\\s*\\(([^)]*)\\)', 'g');
            const updatedCode = code.replace(functionRegex, (match, functionName, argsList) => {
                let args = argsList.split(',').map((arg) => arg.trim());
                const replacement = functionNames.includes(functionName) ? replacementInCategory : replacementOutOfCategory;
                args = args.map((arg) => arg === variableName ? (replacement ? replacement : arg) : arg);
                return `${functionName}(${args.join(', ')})`;
            });
            return updatedCode;
        }
        static removeSpacesInBracket(str, bracket = '()') {
            const length = str.length;
            const beginBracket = bracket[0];
            const endBracket = bracket[1];
            const _process = (index) => {
                let result = '', i = index;
                while (i < length) {
                    const char = str[i];
                    if (char === beginBracket) {
                        const [inner, newIndex] = _process(i + 1);
                        result += beginBracket + inner;
                        i = newIndex;
                    }
                    else if (char === endBracket) {
                        return [result, i - 1];
                    }
                    else {
                        result += char === ' ' && str[i - 1] !== beginBracket && str[i + 1] !== endBracket ? '' : char;
                    }
                    i++;
                }
                return [result, i];
            };
            let result = '', i = 0;
            while (i < length) {
                if (str[i] === beginBracket) {
                    const [inner, newIndex] = _process(i + 1);
                    result += beginBracket + inner;
                    i = newIndex;
                }
                else {
                    result += str[i];
                }
                i++;
            }
            return result;
        }
    }

    class WebGPU_GLSLMacro {
        constructor(all) {
            this.all = all;
            this._parse();
        }
        _parse() {
            let macro = this.all.replace(/^#\s*define\s+/, '').trim();
            macro = WebGPU_GLSLCommon.removeSpacesInBracket(macro);
            const index = macro.indexOf(' ');
            if (index === -1) {
                this.name = macro;
            }
            else {
                const firstPart = macro.slice(0, index);
                let lastPart = macro.slice(index + 1).trim();
                if (lastPart.length === 0)
                    lastPart = undefined;
                const paramStartIndex = firstPart.indexOf('(');
                if (paramStartIndex !== -1) {
                    const paramEndIndex = firstPart.indexOf(')', paramStartIndex);
                    this.name = firstPart.slice(0, paramStartIndex).trim();
                    this.params = firstPart.slice(paramStartIndex + 1, paramEndIndex).split(',').map(param => param.trim());
                    this.replace = lastPart;
                }
                else {
                    this.name = firstPart;
                    this.replace = lastPart;
                }
            }
        }
        replaceMacros(glslCode) {
            let match, outCode = glslCode;
            const regex = new RegExp(`\\b${this.name}\\b`, 'g');
            if (this.params && this.params.length > 0) {
                while ((match = regex.exec(outCode)) !== null) {
                    const param = WebGPU_GLSLCommon.findParamInBracket(outCode, match.index + this.name.length);
                    if (param) {
                        let replace = this.replace;
                        for (let i = 0; i < this.params.length; i++)
                            replace = replace.replace(new RegExp(this.params[i], 'g'), param.elements[i]);
                        outCode = WebGPU_GLSLCommon.replaceStringPart(outCode, replace, match.index, param.index);
                    }
                }
            }
            else
                outCode = outCode.replace(regex, this.replace);
            return outCode;
        }
    }

    class WebGPUShaderCompileUtil {
        static checkDef(node, _defs) {
            if (null == _defs)
                return;
            let arr = node.defParam;
            if (arr) {
                for (let i = 0, len = arr.length; i < len; i++) {
                    let str = arr[i];
                    if ("#ifdef" == node.name || '#ifndef' == node.name) {
                        _defs.add(str);
                    }
                    else {
                        while (true) {
                            let ofs = str.indexOf("defined");
                            if (0 <= ofs) {
                                ofs = str.indexOf("(");
                                if (0 < ofs) {
                                    let ofs2 = str.indexOf(")");
                                    _defs.add(str.substring(ofs + 1, ofs2).trim());
                                    str = str.substring(ofs2 + 1);
                                }
                                else {
                                    break;
                                }
                            }
                            else {
                                break;
                            }
                        }
                    }
                }
            }
        }
        static extractMacros(code) {
            const regex = /^\s*#\s*define\s+/;
            const lines = code.split('\n');
            const macros = [];
            let currentMacro = '';
            for (let i = 0, len = lines.length; i < len; i++) {
                const line = lines[i].trim();
                if (line.length === 0)
                    continue;
                if (currentMacro.length > 0 || regex.test(line)) {
                    if (line.endsWith('\\')) {
                        currentMacro += line.slice(0, -1) + ' ';
                    }
                    else {
                        currentMacro += line;
                        macros.push(new WebGPU_GLSLMacro(currentMacro));
                        currentMacro = '';
                    }
                }
            }
            return macros;
        }
        static macrosToVariable(macros) {
            const regex = /^([_a-zA-Z][_a-zA-Z0-9]*)$/;
            const variable = new Set();
            for (let i = macros.length - 1; i > -1; i--) {
                let name = macros[i].replace;
                if (name) {
                    const ofs = name.indexOf('.');
                    if (ofs >= 0) {
                        name = name.substring(0, ofs).trim();
                        if (name.match(regex))
                            variable.add(name);
                    }
                    else if (name.match(regex))
                        variable.add(name);
                }
            }
            return variable;
        }
        static toScript(root, def, outData) {
            if (null == def)
                def = {};
            let out = this._parseChilds(root, def);
            const macros = this.extractMacros(out);
            const mvariable = this.macrosToVariable(macros);
            if (outData) {
                let st = WebGPUShaderCompileCode.compile(out);
                let uniform = st.uniform;
                let varying = st.varying;
                let attribute = st.attribute;
                let variable = st.variable;
                if (variable) {
                    if (uniform) {
                        for (let k in uniform) {
                            if (variable.has(k) || mvariable.has(k)) {
                                if (null == outData.uniform)
                                    outData.uniform = {};
                                outData.uniform[k] = uniform[k];
                            }
                        }
                    }
                    if (varying) {
                        for (let k in varying) {
                            if (variable.has(k) || mvariable.has(k)) {
                                if (null == outData.varying)
                                    outData.varying = {};
                                outData.varying[k] = varying[k];
                            }
                        }
                    }
                    if (attribute) {
                        for (let k in attribute) {
                            if (variable.has(k) || mvariable.has(k)) {
                                if (null == outData.attribute)
                                    outData.attribute = {};
                                outData.attribute[k] = attribute[k];
                            }
                        }
                    }
                }
                outData.variable = variable;
            }
            out = this.removeUniform(out);
            out = this.removeVarying(out);
            return out;
        }
        static removeUniform(code) {
            let arr = code.split("\n");
            let isParentRemove = false;
            let isUniformStruct = false;
            let isModify = false;
            for (let i = 0, len = arr.length; i < len; i++) {
                let cstr = arr[i].trim();
                if ('' == cstr) {
                    arr.splice(i, 1);
                    len -= 1;
                    i -= 1;
                }
                else if (0 == cstr.indexOf("uniform ")) {
                    isParentRemove = true;
                    arr.splice(i, 1);
                    len -= 1;
                    i -= 1;
                    isModify = true;
                    if (0 < cstr.indexOf("{")) {
                        isUniformStruct = true;
                    }
                }
                else {
                    if (isParentRemove && !isUniformStruct) {
                        if (0 == cstr.indexOf("{")) {
                            isUniformStruct = true;
                            arr.splice(i, 1);
                            len -= 1;
                            i -= 1;
                        }
                    }
                    else if (isUniformStruct) {
                        if (0 <= cstr.indexOf("}")) {
                            isUniformStruct = false;
                        }
                        arr.splice(i, 1);
                        len -= 1;
                        i -= 1;
                    }
                    isParentRemove = false;
                }
            }
            if (isModify)
                code = arr.join('\n');
            return code;
        }
        static removeVarying(code) {
            let arr = code.split("\n");
            let isModify = false;
            for (let i = 0, len = arr.length; i < len; i++) {
                let cstr = arr[i].trim();
                if ('' == cstr) {
                    arr.splice(i, 1);
                    len -= 1;
                    i -= 1;
                }
                else if (0 == cstr.indexOf("varying ")) {
                    arr.splice(i, 1);
                    len -= 1;
                    i -= 1;
                    isModify = true;
                }
            }
            if (isModify)
                code = arr.join('\n');
            return code;
        }
        static checkCondition(st, def) {
            let childs = st.childs;
            let ret = false;
            if (null == childs) {
                return ret;
            }
            for (let i = 0, len = childs.length; i < len; i++) {
                let o = childs[i];
                if (exports.enumOperator["&&"] == o.operator) {
                    if (!ret) {
                        continue;
                    }
                }
                else if (exports.enumOperator["||"] == o.operator) {
                    if (ret) {
                        continue;
                    }
                }
                if ('defined' == o.name) {
                    try {
                        let defName = o.parameter.childs[0].name;
                        let b = !!def[defName];
                        if (o.operator == exports.enumOperator["!"])
                            b = !b;
                        ret = b;
                    }
                    catch (err) { }
                }
                else {
                    if (null != o.name || null == o.operator || null != o.parameter) {
                        if (('' == o.name || null == o.name) && null != o.parameter) {
                            ret = this.checkCondition(o.parameter, def);
                        }
                        else {
                            console.log("TODO:待处理判断", o);
                        }
                    }
                }
            }
            return ret;
        }
        static _parseChilds(parent, def) {
            let childs = parent.childs;
            let checkConditionType = 0;
            let out = '';
            if (null == childs)
                return out;
            for (let i = 0, len = childs.length; i < len; i++) {
                let t = childs[i];
                if ("#ifdef" == t.name || "#ifndef" == t.name || "#if" == t.name || "#elif" == t.name || "#else" == t.name) {
                    if (1 == checkConditionType && ("#elif" == t.name || "#else" == t.name)) {
                        continue;
                    }
                    if (t.condition(def)) {
                        if ("#else" != t.name) {
                            checkConditionType = 1;
                        }
                        else {
                            checkConditionType = 0;
                        }
                        out += this._parseChilds(t, def);
                    }
                    else {
                        checkConditionType = 0;
                    }
                }
                else if (null != t.defParam) {
                    if ('#define' == t.name) {
                        if (Array.isArray(t.defParam)) {
                            let arr = t.defParam;
                            if (1 == arr.length) {
                                def[arr[0]] = true;
                            }
                        }
                        else {
                            console.log('TODO');
                        }
                    }
                    else if ('#undefine' == t.name) {
                        if (Array.isArray(t.defParam)) {
                            let arr = t.defParam;
                            if (1 == arr.length) {
                                delete def[arr[0]];
                            }
                        }
                        else {
                            console.log('TODO');
                        }
                    }
                    if (t.code)
                        out += t.code + "\n";
                }
                else {
                    if (t.code && null == t.root) {
                        out += t.code + "\n";
                    }
                }
            }
            return out;
        }
    }

    class WebGPUShaderToken {
        constructor(includefiles) {
            this.z = 0;
            if (includefiles) {
                this.includefiles = includefiles;
            }
            else {
                this.includefiles = [];
            }
        }
        condition(def) {
            if ('#else' == this.name)
                return true;
            if (null != def) {
                if ("#ifdef" == this.name || "#ifndef" == this.name) {
                    try {
                        let check = this.defParam[0];
                        return ("#ifdef" == this.name) == !!def[check];
                    }
                    catch (err) { }
                }
                else {
                    if (!(this.defParam instanceof WebGPUShaderToken)) {
                        let defParm = this.defParam.join(" ");
                        let parmRoot = WebGPUShaderCompileCode.compile(defParm);
                        this.defParam = parmRoot;
                    }
                    return WebGPUShaderCompileUtil.checkCondition(this.defParam, def);
                }
            }
            else if ("#ifndef" == this.name) {
                return true;
            }
            return false;
        }
        addParameterArr(param, parent) {
            if (null == this.parameterArr) {
                this.parameterArr = [];
            }
            this.parameterArr.push(param);
            param.owner = this;
            if (parent) {
                param.parent = parent;
            }
        }
        setParameter(param, parent) {
            this.parameter = param;
            param.owner = this;
            if (parent)
                param.parent = parent;
        }
        addBody(body) {
            body.setParent(this);
        }
        setParent(parent) {
            if (null == parent.childs) {
                parent.childs = [];
            }
            parent.childs.push(this);
            this.z = parent.z + 1;
            this.parent = parent;
        }
        _parseShaderNode(sn) {
            let ret = '';
            let operator = null;
            if (null != sn.operator) {
                operator = exports.enumOperator[sn.operator];
                if (!sn.operatorRight) {
                    ret += operator;
                    operator = null;
                }
            }
            if (sn.type) {
                if (null != sn.describe) {
                    ret += exports.enumDescribe[sn.describe] + " ";
                }
                if (null != sn.inOrOut) {
                    ret += exports.enumInOut[sn.inOrOut] + " ";
                }
                if (null != sn.type) {
                    ret += sn.type + " ";
                }
                if (null != sn.name) {
                    ret += sn.name;
                }
                if (null != sn.parameter) {
                    let childs = sn.parameter.childs;
                    if (childs) {
                        ret += '(';
                        for (let i = 0, len = childs.length; i < len; i++) {
                            ret += this._parseShaderNode(childs[i]);
                        }
                        ret += ')';
                    }
                }
            }
            else if (sn.parameter) {
                if (null != sn.name) {
                    ret += sn.name;
                }
                if (null != operator) {
                    ret += operator;
                    operator = null;
                }
                ret += '(' + this._getParameter(sn.parameter) + ")";
            }
            else if (sn.parameterArr) {
                ret += this._getParameterArr(sn, '');
            }
            else if (sn.name) {
                ret += sn.name;
            }
            if (null != operator) {
                ret += operator;
            }
            if (null != sn.childs) {
                for (let i = 0, len = sn.childs.length; i < len; i++) {
                    ret += this._parseShaderNode(sn.childs[i]);
                }
            }
            return ret;
        }
        _getParameter(param, isFor = false) {
            let ret = '';
            if (null == param) {
                param = this.parameter;
            }
            if (param) {
                if (param.childs) {
                    let arr = param.childs;
                    for (let i = 0, len = arr.length; i < len; i++) {
                        let sn = arr[i];
                        ret += this._parseShaderNode(sn);
                        if (isFor && i < len - 1) {
                            ret += ';';
                        }
                    }
                }
                else {
                    ret += this._parseShaderNode(param);
                }
            }
            return ret;
        }
        _getParameterArr(st, end = ';') {
            let outStr = '';
            if (null != st.type) {
                outStr += st.type + " ";
            }
            let operator;
            if (null != st.operator && '' != end) {
                operator = exports.enumOperator[st.operator];
                if (!st.operatorRight) {
                    outStr += operator;
                    operator = null;
                }
            }
            let arr = st.parameterArr;
            if (null != st.name) {
                outStr += st.name;
            }
            for (let i = 0, len = arr.length; i < len; i++) {
                outStr += "[" + st._getParameter(arr[i]) + "]";
            }
            if (null != operator) {
                outStr += operator;
            }
            if (st.assign) {
                if (null != st.assignLeft) {
                    outStr += exports.enumOperator[st.assignLeft];
                }
                outStr += "=";
            }
            if (st.childs) {
                outStr += st._getParameter(st);
            }
            return outStr + end;
        }
        toscript(def, out) {
            if (null == out) {
                out = [];
            }
            if (this.type) {
                if ("return" == this.type) {
                    let outStr = this.type + " ";
                    if (this.name) {
                        outStr += this.name;
                    }
                    if (this.parameter) {
                        outStr += "(" + this._getParameter() + ")";
                    }
                    if (null != this.childs) {
                        outStr += this._getParameter(this);
                    }
                    outStr += ";";
                    out.push(outStr);
                }
                else if (this.parameter) {
                    let outStr = this.type + " " + this.name + "(" + this._getParameter() + "){";
                    if (null != this.describe) {
                        outStr = exports.enumDescribe[this.describe] + " " + outStr;
                    }
                    out.push(outStr);
                    if (this.childs) {
                        for (let i = 0, len = this.childs.length; i < len; i++) {
                            this.childs[i].toscript(def, out);
                        }
                    }
                    out.push('}');
                }
                else if (this.parameterArr) {
                    out.push(this._getParameterArr(this));
                }
                else if (this.assign) {
                    let outStr = this.type + " " + this.name;
                    if (null != this.assignLeft) {
                        outStr += exports.enumOperator[this.assignLeft];
                    }
                    outStr += '=';
                    if (this.childs) {
                        outStr += this._getParameter(this);
                        outStr += ';';
                        out.push(outStr);
                    }
                    else {
                        console.log("理论上不存在这种情况！");
                    }
                }
                else if (null != this.name) {
                    let outStr = '';
                    if (null != this.describe) {
                        outStr += exports.enumDescribe[this.describe] + " ";
                    }
                    outStr += this.type + " " + this.name;
                    if (null != this.operator) {
                        outStr += exports.enumOperator[this.operator];
                    }
                    if ('struct' == this.type) {
                        outStr += '{';
                        out.push(outStr);
                        outStr = '';
                        if (null != this.childs) {
                            let arr = this.childs;
                            for (let i = 0, len = arr.length; i < len; i++) {
                                let sn = arr[i];
                                let outStr = this._parseShaderNode(sn);
                                if ('' != outStr) {
                                    out.push(outStr + ";");
                                }
                            }
                        }
                        outStr += '}';
                        if (this.varNames) {
                            outStr += " " + this.varNames.join(",");
                        }
                    }
                    else {
                        if (null != this.childs)
                            outStr += this._getParameter(this);
                    }
                    outStr += ';';
                    out.push(outStr);
                }
                else {
                    out.push(this.type + ";");
                }
            }
            else if (this.parameterArr) {
                out.push(this._getParameterArr(this));
            }
            else if (this.parameter) {
                if (null != this.name) {
                    let outStr = '';
                    if (null != this.operator) {
                        outStr += exports.enumOperator[this.operator];
                    }
                    outStr += this.name + "(" + this._getParameter(null, 'for' == this.name) + ")";
                    if ("layout" == this.name) {
                        if (this.childs) {
                            for (let i = 0, len = this.childs.length; i < len; i++) {
                                let sn = this.childs[i];
                                if (sn.describe == exports.enumDescribe.uniform) {
                                    outStr += ' uniform';
                                }
                                else {
                                    console.log("TODO待处理:", sn);
                                }
                            }
                        }
                        outStr += ';';
                        out.push(outStr);
                    }
                    else {
                        out.push(outStr);
                        if (this.childs) {
                            out.push("{");
                            for (let i = 0, len = this.childs.length; i < len; i++) {
                                let sn = this.childs[i];
                                sn.toscript(def, out);
                            }
                            out.push("}");
                        }
                    }
                }
            }
            else if (this.name) {
                if (this.describe == exports.enumDescribe.uniform) {
                    out.push("uniform " + this.name + "{");
                    for (let i = 0, len = this.childs.length; i < len; i++) {
                        let sn = this.childs[i];
                        sn.toscript(def, out);
                    }
                    let outstr = '}';
                    if (this.varNames) {
                        outstr += " " + this.varNames.join(",");
                    }
                    outstr += ';';
                    out.push(outstr);
                }
                else if (this.assign) {
                    let outStr = this.name;
                    if (null != this.assignLeft) {
                        outStr += exports.enumOperator[this.assignLeft];
                    }
                    outStr += '=';
                    if (this.childs) {
                        outStr += this._getParameter(this);
                        outStr += ';';
                        out.push(outStr);
                    }
                    else {
                        console.log("理论上不存在这种情况！");
                    }
                }
                else {
                    if (this.childs) {
                        out.push(this.name + "{");
                        for (let i = 0, len = this.childs.length; i < len; i++) {
                            let sn = this.childs[i];
                            sn.toscript(def, out);
                        }
                        out.push("}");
                    }
                    else {
                        if (0 > this.name.indexOf("#")) {
                            out.push(this.name + ";");
                        }
                        else {
                            out.push(this.name);
                        }
                    }
                }
            }
            else if (null != this.operator) ;
            else if (this.childs) {
                if (null != this.parent) {
                    out.push("{");
                    for (let i = 0, len = this.childs.length; i < len; i++) {
                        let sn = this.childs[i];
                        sn.toscript(def, out);
                    }
                    out.push("}");
                }
                else {
                    for (let i = 0, len = this.childs.length; i < len; i++) {
                        let sn = this.childs[i];
                        sn.toscript(def, out);
                    }
                }
            }
            else ;
            return out;
        }
    }

    exports.enumInOut = void 0;
    (function (enumInOut) {
        enumInOut[enumInOut["in"] = 0] = "in";
        enumInOut[enumInOut["out"] = 1] = "out";
        enumInOut[enumInOut["inout"] = 2] = "inout";
    })(exports.enumInOut || (exports.enumInOut = {}));
    exports.enumDescribe = void 0;
    (function (enumDescribe) {
        enumDescribe[enumDescribe["uniform"] = 0] = "uniform";
        enumDescribe[enumDescribe["varying"] = 1] = "varying";
        enumDescribe[enumDescribe["const"] = 2] = "const";
        enumDescribe[enumDescribe["mediump"] = 3] = "mediump";
        enumDescribe[enumDescribe["highp"] = 4] = "highp";
        enumDescribe[enumDescribe["lowp"] = 5] = "lowp";
        enumDescribe[enumDescribe["attribute"] = 6] = "attribute";
    })(exports.enumDescribe || (exports.enumDescribe = {}));
    exports.enumOperator = void 0;
    (function (enumOperator) {
        enumOperator[enumOperator["!="] = 0] = "!=";
        enumOperator[enumOperator["=="] = 1] = "==";
        enumOperator[enumOperator["<="] = 2] = "<=";
        enumOperator[enumOperator[">="] = 3] = ">=";
        enumOperator[enumOperator["||"] = 4] = "||";
        enumOperator[enumOperator["&&"] = 5] = "&&";
        enumOperator[enumOperator[">>"] = 6] = ">>";
        enumOperator[enumOperator["<<"] = 7] = "<<";
        enumOperator[enumOperator["++"] = 8] = "++";
        enumOperator[enumOperator["^^"] = 9] = "^^";
        enumOperator[enumOperator["--"] = 10] = "--";
        enumOperator[enumOperator["!"] = 11] = "!";
        enumOperator[enumOperator["+"] = 12] = "+";
        enumOperator[enumOperator["-"] = 13] = "-";
        enumOperator[enumOperator["*"] = 14] = "*";
        enumOperator[enumOperator["/"] = 15] = "/";
        enumOperator[enumOperator["="] = 16] = "=";
        enumOperator[enumOperator["<"] = 17] = "<";
        enumOperator[enumOperator[">"] = 18] = ">";
        enumOperator[enumOperator["&"] = 19] = "&";
        enumOperator[enumOperator["|"] = 20] = "|";
        enumOperator[enumOperator["^"] = 21] = "^";
        enumOperator[enumOperator["%"] = 22] = "%";
    })(exports.enumOperator || (exports.enumOperator = {}));
    const boolCheck = ['<=', '>=', '!=', '==', "&&", "||", '>', '<', '!'];
    const checkBodyName = ['if', 'for', 'while', 'layout'];
    const _clearCR = new RegExp("\r", "g");
    class WebGPUShaderCompileCode {
        static compile(code) {
            let ret = new WebGPUShaderToken();
            code = code.replace(_clearCR, "");
            code = this.removeAnnotation(code).trim();
            this._define.clear();
            WebGPUShaderDefine.findNumberDefine(code, this._define);
            this._compileToTree(ret, code);
            this._parameterNode = null;
            this._parentNode = null;
            this._currNode = null;
            this._currNameNode = null;
            this._currParame = null;
            this._isCheckType = false;
            this._currTmpBody = null;
            ret.uniform = this._uniform;
            ret.variable = this._variable;
            ret.structs = this._struct;
            ret.varying = this._varying;
            ret.attribute = this._attribute;
            if (this._struct) {
                if (this._uniform) {
                    for (let k in this._uniform) {
                        if (this._struct[this._uniform[k].type]) {
                            this._uniform[k].struct = this._struct[this._uniform[k].type];
                        }
                    }
                }
                if (this._varying) {
                    for (let k in this._varying) {
                        if (this._struct[this._varying[k].type]) {
                            this._varying[k].struct = this._struct[this._varying[k].type];
                        }
                    }
                }
                if (this._attribute) {
                    for (let k in this._attribute) {
                        if (this._struct[this._attribute[k].type]) {
                            this._attribute[k].struct = this._struct[this._attribute[k].type];
                        }
                    }
                }
            }
            this._uniform = null;
            this._variable = null;
            this._struct = null;
            this._varying = null;
            this._attribute = null;
            this._varUniform = null;
            return ret;
        }
        static get _currNode() {
            return this.__currNode;
        }
        static set _currNode(value) {
            if (value == this.__currNode)
                return;
            if (null != this.__currNode) {
                if (null != this.__currNode.name && (null == this.__currNode.type || 'return' == this.__currNode.type)) {
                    if (null == this.__currNode.parameter && this.__currNode.describe != exports.enumDescribe.uniform) {
                        let name = this.__currNode.name;
                        if ('' != name && isNaN(Number(name))) {
                            let ofs = name.indexOf(".");
                            if (0 <= ofs) {
                                name = name.substring(0, ofs).trim();
                                if (this._varUniform && this._varUniform[name]) {
                                    name = this.__currNode.name.substring(ofs + 1).trim();
                                }
                            }
                            if ('' != name) {
                                if (null == this._variable)
                                    this._variable = new Set();
                                this._variable.add(name);
                            }
                        }
                    }
                }
            }
            this.__currNode = value;
        }
        static get isCheckType() {
            return this._isCheckType;
        }
        static set isCheckType(value) {
            if (value != this._isCheckType) {
                if (null == this._parameterNode && value) {
                    if (this._parentNode.assign) {
                        this._parentNode = this._parentNode.parent;
                    }
                    if ('return' == this._parentNode.type) {
                        this._parentNode = this._parentNode.parent;
                    }
                }
                this._isCheckType = value;
            }
        }
        static get currNode() {
            if (null == this._currNode) {
                if (null == this._parentNode) {
                    console.log("异常啦！！！");
                }
                this._currNode = new WebGPUShaderToken(this._parentNode.includefiles);
                if (this._parameterNode) {
                    this._currNode.owner = this._parameterNode.owner;
                    this._parameterNode.addBody(this._currNode);
                }
                else {
                    this._parentNode.addBody(this._currNode);
                }
            }
            return this._currNode;
        }
        static updateCurrNode() {
            if (this._parameterNode) {
                if (this._parameterNode.childs) {
                    this._currNode = this._parameterNode.childs[this._parameterNode.childs.length - 1];
                }
                else
                    this._currNode = null;
            }
            else {
                if (this._parentNode.childs) {
                    this._currNode = this._parentNode.childs[this._parentNode.childs.length - 1];
                }
                else {
                    console.log("这里应该有点问题！");
                    this._currNode = null;
                }
            }
        }
        static newParameterNode(parameterType = 0) {
            let sn = new WebGPUShaderToken(this._parentNode.includefiles);
            if (null == this._currNameNode) {
                if (1 == parameterType) {
                    let childs = this._parentNode.childs;
                    let pNode = childs[childs.length - 1];
                    if (pNode.parameterArr) {
                        this._currNameNode = pNode;
                    }
                }
                if (null == this._currNameNode) {
                    this._currNameNode = this.nextCurrNode(true);
                    this._currNameNode.name = '';
                }
            }
            if (1 == parameterType) {
                this._currNameNode.addParameterArr(sn, this._parameterNode);
            }
            else {
                this._currNameNode.setParameter(sn, this._parameterNode);
            }
            this._currNameNode = null;
            this._parameterNode = sn;
            this.updateCurrNode();
        }
        static isEmptyNode(node, isCheckParent = false) {
            for (let name in node) {
                if ('includefiles' == name || 'owner' == name || 'z' == name) {
                    continue;
                }
                if (isCheckParent && 'parent' == name) {
                    continue;
                }
                return false;
            }
            return true;
        }
        static nextCurrNode(isForceCreate = false) {
            if (isForceCreate) {
                this._currNode = null;
                return this.currNode;
            }
            else {
                if (null != this._currNode) {
                    if (this.isEmptyNode(this._currNode)) {
                        return null;
                    }
                    this._currNode = null;
                }
                return null;
            }
        }
        static _compileToTree(root, script) {
            let lines = script.split(";");
            this._parentNode = root;
            for (let i = 0, len = lines.length; i < len; i++) {
                let text = lines[i].trim();
                if (text.length < 1)
                    continue;
                this._parseNode(text);
                this._checkStructDef();
                if (null != this._currParame) {
                    this._parseParameter();
                }
                this._body3Fin();
            }
        }
        static _checkStructDef() {
            let childs = this._parentNode.childs;
            if (childs) {
                let len = childs.length;
                if (2 <= len) {
                    let index = len - 1;
                    let o1 = childs[index];
                    let o2 = childs[len - 2];
                    if (('struct' == o2.type || (o2.describe == exports.enumDescribe.uniform && o2.childs)) && null == o1.name && null != o1.type) {
                        let arr = o1.type.split(',');
                        o2.varNames = arr;
                        childs.splice(index, 1);
                        if (o2.describe == exports.enumDescribe.uniform) {
                            if (null == this._varUniform)
                                this._varUniform = {};
                            for (let i = arr.length - 1; i >= 0; i--) {
                                this._varUniform[arr[i]] = o2.name;
                            }
                        }
                    }
                }
            }
        }
        static _checkTypeByString(text) {
            let sn = this.nextCurrNode(true);
            this.isCheckType = true;
            let arr = text.split(" ");
            for (let i = 0, len = arr.length; i < len; i++) {
                if (this.isCheckType) {
                    this._checkType(arr[i]);
                }
                else {
                    sn.name = arr[i];
                }
            }
            this.isCheckType = false;
        }
        static get _isFor() {
            if (this._parameterNode) {
                let node = this._parameterNode.owner;
                if ("for" == node.name) {
                    return true;
                }
            }
            return false;
        }
        static _parseParameter() {
            if (null != this._currParame) {
                let node = this._parameterNode.owner;
                if (this._isFor) {
                    let _parentNode = this._parentNode;
                    let _parameterNode = this._parameterNode;
                    if (null == _parameterNode.childs || 0 == _parameterNode.childs.length) {
                        this.isCheckType = true;
                    }
                    let sn = this.nextCurrNode(true);
                    this._parameterNode = null;
                    this._parentNode = sn;
                    this._currNode = null;
                    let arr = this._currParame.split(" ");
                    for (let i = 0, len = arr.length; i < len; i++) {
                        this._checkBody(arr[i]);
                    }
                    this._parameterNode = _parameterNode;
                    this._parentNode = _parentNode;
                }
                else {
                    let isFun = false;
                    if (null != node.type && 'return' != node.type && 'else' != node.type)
                        isFun = true;
                    let arr = this._currParame.split(',');
                    for (let i = 0, len = arr.length; i < len; i++) {
                        let str = arr[i];
                        if (isFun) {
                            this._checkTypeByString(str);
                        }
                        else {
                            this._checkBody2(str, false);
                        }
                        if (i < len - 1) {
                            let sn = this.nextCurrNode(true);
                            sn.type = ',';
                            this._currNode = null;
                        }
                    }
                }
            }
            this._currParame = null;
        }
        static _addParam(text) {
            if (null == this._currParame) {
                this._currParame = text;
            }
            else {
                this._currParame += ' ' + text;
            }
        }
        static _checkParameter(text) {
            text = text.trim();
            if ('' == text) {
                if (this._isFor)
                    this._addParam(text);
                return;
            }
            if (this.isCheckType) {
                this._checkType(text);
                return;
            }
            let ofs = text.indexOf("(");
            if (0 <= ofs) {
                this._checkParameter(text.substring(0, ofs));
                this._parseParameter();
                this.newParameterNode();
                text = text.substring(ofs + 1);
                this._checkParameter(text);
            }
            else {
                let ofs = text.indexOf("[");
                if (0 <= ofs) {
                    this._checkParameter(text.substring(0, ofs));
                    this._parseParameter();
                    this.newParameterNode(1);
                    text = text.substring(ofs + 1);
                    this._checkParameter(text);
                }
                else {
                    ofs = text.indexOf(")");
                    if (0 > ofs) {
                        ofs = text.indexOf("]");
                    }
                    if (0 <= ofs) {
                        this._checkParameter(text.substring(0, ofs));
                        this._parseParameter();
                        let owner = this._parameterNode.owner;
                        if (owner) {
                            let obj = null;
                            if (owner.describe == exports.enumDescribe.uniform) {
                                obj = this._uniform;
                            }
                            else if (owner.describe == exports.enumDescribe.attribute) {
                                obj = this._attribute;
                            }
                            else if (owner.describe == exports.enumDescribe.varying) {
                                obj = this._varying;
                            }
                            if (null != obj) {
                                try {
                                    let str = this._parameterNode.childs[0].type;
                                    if (this._define.has(str))
                                        str = this._define.get(str);
                                    const num = Number(str);
                                    if (!isNaN(num) && obj[owner.name]) {
                                        if (null == obj[owner.name].length)
                                            obj[owner.name].length = [];
                                        obj[owner.name].length.push(num);
                                    }
                                }
                                catch (err) { }
                            }
                        }
                        this._parameterNode = this._parameterNode.parent;
                        this.updateCurrNode();
                        text = text.substring(ofs + 1);
                        this._currNameNode = null;
                        if (this.currNode && null != this.currNode.parameter && null == this._parameterNode && 0 <= checkBodyName.indexOf(this.currNode.name)) {
                            this._isCheckBody3 = true;
                        }
                        this._checkBody(text);
                    }
                    else {
                        this._addParam(text);
                    }
                }
            }
        }
        static _body3Fin() {
            let arr = this._currTmpBody;
            this._currTmpBody = null;
            this._isCheckBody3 = false;
            if (arr) {
                if (this._currNode && 0 <= checkBodyName.indexOf(this._currNode.name)) {
                    this._parentNode = this._currNode;
                    this._currNode = null;
                }
                else if (this._parentNode && 0 <= checkBodyName.indexOf(this._parentNode.name)) {
                    this._currNode = null;
                }
                else {
                    console.log("理论上不应该进入这里，待查！");
                    this._currNode = null;
                    this._parentNode = this.currNode;
                    this._currNode = null;
                }
                this.isCheckType = true;
                for (let i = 0, len = arr.length; i < len; i++) {
                    this._checkBody(arr[i]);
                }
                this._parentNode = this._parentNode.parent;
                this.nextCurrNode();
                this.isCheckType = true;
            }
        }
        static _checkBody3(text) {
            if (this._isCheckBody3) {
                if (0 > text.indexOf("{")) {
                    if (null == this._currTmpBody) {
                        this._currTmpBody = [];
                    }
                    this._currTmpBody.push(text);
                    return true;
                }
                else if (null != this._currTmpBody) {
                    console.log("理论上不应该会走到这里，如果到这里，待检查！", this._currTmpBody);
                    this._isCheckBody3 = false;
                    let arr = this._currTmpBody;
                    this._currTmpBody = null;
                    for (let i = 0, len = arr.length; i < len; i++) {
                        this._checkBody(arr[i]);
                    }
                }
                else {
                    this._isCheckBody3 = false;
                }
            }
            return false;
        }
        static _checkBody(text) {
            text = text.trim();
            if ('' == text)
                return;
            if (this._checkBody3(text)) {
                return;
            }
            if (this.isCheckType) {
                this._checkType(text);
                return;
            }
            if (null != this._parameterNode) {
                this._checkParameter(text);
                return;
            }
            if (this._checkOperator(text))
                return;
            let ofs = text.indexOf("=");
            if (0 > ofs) {
                ofs = text.indexOf("(");
                if (0 > ofs) {
                    ofs = text.indexOf("[");
                    if (0 > ofs) {
                        ofs = text.indexOf("{");
                        if (0 <= ofs) {
                            let cstr = text.substring(0, ofs);
                            if ('' != cstr) {
                                this._setNodeName(cstr);
                            }
                            else if (null != this._currNode.type && null == this._currNode.name) {
                                this._currNode.name = this._currNode.type;
                                delete this._currNode.type;
                            }
                            this._parentNode = this.currNode;
                            text = text.substring(ofs + 1);
                            this.isCheckType = true;
                            this._currNode = null;
                            this._checkBody(text);
                        }
                        else {
                            ofs = text.indexOf("}");
                            if (0 <= ofs) {
                                this._childFin(ofs, text);
                            }
                            else {
                                ofs = text.indexOf(",");
                                if (0 <= ofs) {
                                    this._checkBody(text.substring(0, ofs));
                                    this.isCheckType = true;
                                    this.updateCurrNode();
                                    let typeNode = this._currNode;
                                    if (null == typeNode.type) {
                                        console.log("理论上不应该出现这个情况！", text);
                                    }
                                    else {
                                        let sn = this.nextCurrNode(true);
                                        sn.type = typeNode.type;
                                        if (null != typeNode.describe) {
                                            sn.describe = typeNode.describe;
                                        }
                                    }
                                    this.isCheckType = false;
                                    this._checkBody(text.substring(ofs + 1));
                                }
                                else {
                                    if (!this._splitTextCheck(text, "?")) {
                                        if (!this._splitTextCheck(text, ":")) {
                                            this._checkBody2(text);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    else {
                        let cstr = text.substring(0, ofs);
                        this._setNodeName(cstr);
                        this.newParameterNode(1);
                        this._checkParameter(text.substring(ofs + 1));
                    }
                }
                else {
                    let cstr = text.substring(0, ofs).trim();
                    if (null == this._currNode || null == this._currNode.name || '' != cstr) {
                        this._setNodeName(cstr);
                    }
                    else if (null != this._currNode && this._currNode.assign) {
                        this._setNodeName(cstr);
                    }
                    this.newParameterNode();
                    this._checkParameter(text.substring(ofs + 1));
                    return;
                }
            }
            else {
                this._checkEqual(text, ofs);
            }
        }
        static _splitTextCheck(text, cstr, fun) {
            if (null == fun)
                fun = this._checkBody;
            let ofs = text.indexOf(cstr);
            if (0 <= ofs) {
                fun.call(this, text.substring(0, ofs));
                let sn = this.nextCurrNode(true);
                sn.type = cstr;
                this._currNameNode = sn;
                this._currNode = null;
                fun.call(this, text.substring(ofs + cstr.length));
                return true;
            }
            return false;
        }
        static _childFin(ofs, text) {
            let cstr = text.substring(0, ofs);
            this._checkBody(cstr);
            if ("struct" == this._parentNode.type) {
                if (!this._struct)
                    this._struct = {};
                this._struct[this._parentNode.name] = this._parentNode;
            }
            let childs = this._parentNode.childs;
            if (childs) {
                for (let i = childs.length - 1; i >= 0; i--) {
                    let o = childs[i];
                    if (this.isEmptyNode(o, true)) {
                        childs.splice(i, 1);
                    }
                }
            }
            this._parentNode = this._parentNode.parent;
            this.nextCurrNode();
            text = text.substring(ofs + 1);
            this.isCheckType = true;
            if ('' != text) {
                this.nextCurrNode();
                this._checkBody(text);
            }
        }
        static _checkType(text) {
            if ('' == text)
                return;
            let node = this.currNode;
            let inout = exports.enumInOut[text];
            if (undefined != inout && isNaN(Number(text))) {
                node.inOrOut = inout;
            }
            else {
                let describe = exports.enumDescribe[text];
                if (undefined != describe && isNaN(Number(text))) {
                    node.describe = describe;
                }
                else {
                    let ofs = text.indexOf("}");
                    if (0 <= ofs) {
                        this._childFin(ofs, text);
                        return;
                    }
                    ofs = text.indexOf("(");
                    if (0 > ofs) {
                        ofs = text.indexOf("[");
                    }
                    if (0 <= ofs) {
                        this.isCheckType = false;
                        this._checkBody(text);
                    }
                    else {
                        ofs = text.indexOf("=");
                        if (0 <= ofs) {
                            this._checkEqual(text, ofs);
                        }
                        else {
                            ofs = text.indexOf("{");
                            if (0 <= ofs) {
                                this.isCheckType = false;
                                this._checkBody(text);
                            }
                            else {
                                node.type = text;
                                if ('return' == text) {
                                    this._parentNode = node;
                                    this.nextCurrNode();
                                }
                                this.isCheckType = false;
                            }
                        }
                    }
                }
            }
        }
        static _checkEqual(text, ofs) {
            this.isCheckType = false;
            if (0 == ofs) {
                let cstr = text.substring(0, 2);
                if (this._checkOperator(cstr)) {
                    this._checkBody(text.substring(2));
                    return;
                }
            }
            let cstr = text.substring(0, ofs);
            let len = cstr.length;
            if (0 < len) {
                let cstr2 = cstr.substring(len - 2);
                let operator = exports.enumOperator[cstr2];
                if (null != operator && isNaN(Number(cstr2))) {
                    cstr2 = cstr.substring(0, cstr.length - 2).trim();
                    if ('' != cstr2) {
                        this._setNodeName(cstr2);
                    }
                    this._checkOperator("=");
                    this.currNode.assignLeft = operator;
                    this._checkBody(text.substring(ofs + 1));
                    return;
                }
                cstr2 = cstr.substring(len - 1);
                let cstr3 = cstr2 + "=";
                operator = exports.enumOperator[cstr3];
                if (null != operator && isNaN(Number(cstr3))) {
                    this._checkBody(cstr.substring(0, cstr.length - 1).trim());
                    this._checkBody(cstr3);
                    this._checkBody(text.substring(ofs + 1));
                    return;
                }
                operator = exports.enumOperator[cstr2];
                if (null != operator && isNaN(Number(cstr2))) {
                    cstr2 = cstr.substring(0, cstr.length - 1).trim();
                    if ('' != cstr2) {
                        this._setNodeName(cstr2);
                    }
                    this._checkOperator("=");
                    this.currNode.assignLeft = operator;
                    this._checkBody(text.substring(ofs + 1));
                    return;
                }
            }
            this._setNodeName(cstr);
            cstr = text.substring(ofs, ofs + 2);
            if (this._checkOperator(cstr)) {
                ofs += 1;
            }
            else {
                this._checkOperator("=");
            }
            this._checkBody(text.substring(ofs + 1));
        }
        static _setNodeName(value) {
            value = value.trim();
            let node = this.currNode;
            if (null != node.name) {
                this._checkBody2(value, false);
                return;
            }
            if ('' == value && null != node.type) {
                this._checkBody2(node.type, false);
                delete node.type;
            }
            else {
                this._checkBody2(value);
            }
        }
        static _checkBody2(text, isCheckEmpty = true) {
            text = text.trim();
            if ('' == text && isCheckEmpty)
                return;
            let ofs;
            let pstr;
            if ('' != text) {
                for (let k in exports.enumOperator) {
                    if (isNaN(Number(k))) {
                        let num = text.indexOf(k);
                        if (0 <= num) {
                            if (null == ofs || ofs > num) {
                                ofs = num;
                                pstr = k;
                            }
                        }
                    }
                }
            }
            if (null != ofs) {
                this._checkBody2(text.substring(0, ofs));
                this._checkOperator(text.substring(ofs, ofs + pstr.length));
                this._checkBody2(text.substring(ofs + pstr.length));
            }
            else {
                if (!this._splitTextCheck(text, "?", this._checkBody2)) {
                    if (!this._splitTextCheck(text, ":", this._checkBody2)) {
                        let sn = this.currNode;
                        if (null != sn.name) {
                            sn = this.nextCurrNode(true);
                        }
                        sn.name = text;
                        this._currNameNode = sn;
                        if (this._parentNode) {
                            let obj = null;
                            if (this._parentNode.describe == exports.enumDescribe.uniform) {
                                if (null == this._uniform)
                                    this._uniform = {};
                                obj = this._uniform;
                            }
                            else if (this._parentNode.describe == exports.enumDescribe.varying) {
                                if (null == this._varying)
                                    this._varying = {};
                                obj = this._varying;
                            }
                            else if (this._parentNode.describe == exports.enumDescribe.attribute) {
                                if (null == this._attribute)
                                    this._attribute = {};
                                obj = this._attribute;
                            }
                            if (null != obj) {
                                obj[sn.name] = {
                                    type: sn.type,
                                    struct: this._parentNode,
                                    blockName: this._parentNode.name
                                };
                            }
                        }
                        if (sn.describe == exports.enumDescribe.uniform) {
                            if (null == this._uniform)
                                this._uniform = {};
                            this._uniform[sn.name] = { type: sn.type };
                        }
                        else if (sn.describe == exports.enumDescribe.attribute) {
                            if (null == this._attribute)
                                this._attribute = {};
                            this._attribute[sn.name] = { type: sn.type };
                        }
                        else if (sn.describe == exports.enumDescribe.varying) {
                            if (null == this._varying)
                                this._varying = {};
                            this._varying[sn.name] = { type: sn.type };
                        }
                    }
                }
            }
        }
        static _checkOperator(text) {
            let operator = exports.enumOperator[text];
            if (undefined != operator && isNaN(Number(text))) {
                let sn = this.currNode;
                if ('=' == text) {
                    sn.assign = true;
                    if (null == sn.name && null != sn.type) {
                        this._checkBody2(sn.type, false);
                        delete sn.type;
                    }
                    this._parentNode = sn;
                }
                else {
                    if (null != sn.name || null != sn.operator) {
                        sn = this.nextCurrNode(true);
                    }
                    sn.operator = operator;
                    this._currNameNode = sn;
                    if (null != sn.name) {
                        sn.operatorRight = true;
                    }
                }
                return true;
            }
            return false;
        }
        static _parseNode(text) {
            if ('' == text)
                return;
            let ofs = text.indexOf("#");
            if (0 > ofs) {
                text = text.split("\n").join(" ").split("\t").join(" ");
                if (0 == text.indexOf('precision')) {
                    let sn = new WebGPUShaderToken(this._parentNode.includefiles);
                    sn.name = text;
                    this._parentNode.addBody(sn);
                    return;
                }
                let arr = text.split(" ");
                if (!this._isFor)
                    this.isCheckType = true;
                this.nextCurrNode();
                for (let i = 0, len = arr.length; i < len; i++) {
                    text = arr[i];
                    if ('' == text)
                        continue;
                    this._checkBody(text);
                }
            }
            else {
                this._parseNode(text.substring(0, ofs));
                let def = text.substring(ofs);
                ofs = def.indexOf("\n");
                text = null;
                if (0 < ofs) {
                    text = def.substring(ofs + 1);
                    def = def.substring(0, ofs);
                }
                let sn = new WebGPUShaderToken(this._parentNode.includefiles);
                sn.name = def;
                this._parentNode.addBody(sn);
                if (null != text) {
                    this._parseNode(text);
                }
            }
        }
        static removeAnnotation(text) {
            while (true) {
                let i = text.indexOf("//");
                if (0 > i) {
                    break;
                }
                else {
                    let num = text.indexOf('\n', i);
                    if (0 < num) {
                        text = text.substring(0, i) + text.substring(num);
                    }
                    else {
                        text = text.substring(0, i);
                    }
                }
            }
            while (true) {
                let i = text.indexOf("/*");
                if (0 > i) {
                    break;
                }
                else {
                    let num = text.indexOf("*/", i);
                    if (0 < num) {
                        text = text.substring(0, i) + text.substring(num + 2);
                    }
                    else {
                        text = text.substring(0, i);
                    }
                }
            }
            return text;
        }
    }
    WebGPUShaderCompileCode._isCheckType = false;
    WebGPUShaderCompileCode._define = new Map();

    class WebGPUShaderCompileDef {
        static compile(code, defs) {
            code = code.replace(_clearCR, "");
            this._defs = defs;
            let st = new WebGPUShaderToken();
            this._compileToTree(st, code);
            this._parentNode = null;
            this._defs = null;
            this._currNode = null;
            return st;
        }
        static isEmptyNode(node) {
            for (let name in node) {
                if ('includefiles' == name || 'owner' == name || 'z' == name) {
                    continue;
                }
                return false;
            }
            return true;
        }
        static nextCurrNode(isForceCreate = false) {
            if (isForceCreate) {
                this._currNode = null;
                return this.currNode;
            }
            else {
                if (null != this._currNode) {
                    if (this.isEmptyNode(this._currNode)) {
                        return null;
                    }
                    this._currNode = null;
                }
                return null;
            }
        }
        static get currNode() {
            if (null == this._currNode) {
                this._currNode = new WebGPUShaderToken(this._parentNode.includefiles);
                this._parentNode.addBody(this._currNode);
            }
            return this._currNode;
        }
        static _compileToTree(parent, code) {
            this._parentNode = parent;
            let lines = code.split("\n");
            for (let i = 0, len = lines.length; i < len; i++) {
                let text = lines[i];
                if (text.length < 1)
                    continue;
                let ofs = text.indexOf("//");
                if (0 < ofs) {
                    this._parseNode(text.substring(0, ofs));
                    this._parseNode(text.substring(ofs));
                }
                else {
                    this._parseNode(text);
                }
            }
        }
        static _parseNode(text) {
            text = text.split("\t").join(" ").trim();
            if (text.indexOf("#") != 0) {
                if (null == this.currNode.code) {
                    this.currNode.code = text;
                }
                else {
                    this.currNode.code += '\n' + text;
                }
            }
            else {
                let arr = text.split(" ");
                let name = arr.shift();
                if ("#endif" == name) {
                    this._parentNode = this._parentNode.parent;
                    this._currNode = null;
                    return;
                }
                let node;
                switch (name) {
                    case '#ifdef':
                    case "#ifndef":
                    case "#if":
                        node = this.nextCurrNode(true);
                        node.code = text;
                        node.name = name;
                        node.defParam = arr;
                        this._parentNode = node;
                        this._currNode = null;
                        WebGPUShaderCompileUtil.checkDef(node, this._defs);
                        break;
                    case "#elif":
                    case "#else":
                        this._parentNode = this._parentNode.parent;
                        node = this.nextCurrNode(true);
                        node.code = text;
                        node.name = name;
                        node.defParam = arr;
                        this._parentNode = node;
                        this._currNode = null;
                        if ('#elif' == name)
                            WebGPUShaderCompileUtil.checkDef(node, this._defs);
                        break;
                    case "#include":
                        break;
                    default:
                        node = this.nextCurrNode(true);
                        node.code = text;
                        node.name = name;
                        node.defParam = arr;
                        this._currNode = null;
                        break;
                }
            }
        }
    }

    class WebGPU_GLSLStruct {
        constructor(all) {
            this.fields = [];
            this.all = all;
            this._parse(all);
        }
        _parse(all) {
            const headRegex = /struct\s+(\w+)\s*\{/;
            const fieldRegex = /((lowp|mediump|highp)\s+)?([\w]+)\s+([\w]+)\s*(\[\d*\])?;/g;
            const headerMatch = headRegex.exec(all);
            this.name = headerMatch[1];
            let match;
            while ((match = fieldRegex.exec(all)) !== null) {
                const [, precision, , type, name, array] = match;
                const isArray = array !== undefined;
                let arrayLength = undefined;
                if (isArray)
                    arrayLength = parseInt(array.replace(/\D/g, ''));
                this.fields.push({
                    name,
                    type,
                    precision,
                    isArray,
                    arrayLength
                });
            }
        }
        getArrayField(name, isArray = false) {
            for (let i = this.fields.length - 1; i > -1; i--)
                if (this.fields[i].name === name && this.fields[i].isArray === isArray)
                    return this.fields[i];
            return undefined;
        }
    }

    const notPutToFuncCall = [
        "int", "float", "bool", "vec2", "vec3", "vec4",
        "bvec2", "bvec3", "bvec4", "ivec2", "ivec3", "ivec4",
        "hvec2", "hvec3", "hvec4", "fvec2", "fvec3", "fvec4",
        "mat2", "mat3", "mat4", "layout",
        "if", "else", "for", "while", "do", "switch",
        "radians", "degrees", "sin", "cos", "tan",
        "asin", "acos", "atan", "sinh", "cosh",
        "tanh", "asinh", "acosh", "atanh",
        "pow", "exp", "log", "exp2", "log2",
        "sqrt", "inversesqrt",
        "abs", "sign", "floor", "trunc", "round",
        "roundEven", "ceil", "fract", "mod", "modf",
        "min", "max", "clamp", "mix", "step",
        "smoothstep", "isnan", "isinf", "floatBitsToInt",
        "floatBitsToUint", "intBitsToFloat", "uintBitsToFloat",
        "length", "distance", "dot", "cross",
        "normalize", "faceforward", "reflect",
        "refract",
        "matrixCompMult", "outerProduct", "determinant",
        "lessThan", "lessThanEqual", "greaterThan",
        "greaterThanEqual", "equal", "notEqual",
        "any", "all", "not",
        "texture", "texture2D", "textureSize", "textureProj",
        "textureLod", "textureOffset", "texelFetch",
        "texelFetchOffset", "textureProjOffset",
        "textureLodOffset", "textureProjLod",
        "textureProjLodOffset", "textureGrad",
        "textureGradOffset", "textureProjGrad",
        "textureProjGradOffset"
    ];
    class WebGPU_GLSLFunction {
        constructor(all) {
            this.params = [];
            this.calls = [];
            this.samplerProcessed = false;
            this.all = all;
            this._getHeadAndBody();
            this._parse();
        }
        _getHeadAndBody() {
            const all = this.all;
            for (let i = 0, len = all.length; i < len; i++) {
                if (all[i] !== '{')
                    continue;
                this.head = all.substring(0, i);
                this.body = all.substring(i);
                break;
            }
            this.head = this.head.replace(/\n/g, '').trim();
            this.body = this.body.replace(/^\s*[\r\n]/gm, '');
        }
        _parse() {
            const headRegex = /((lowp|mediump|highp)\s+)?(\w+)\s+(\w+)\s*\((.*?)\)/;
            const paramRegex = /((lowp|mediump|highp)\s+)?((in|out|inout|const)\s+)?([\w]+)\s+([\w]+)\s*(\[\d*\])?/g;
            const headMatch = this.head.match(headRegex);
            if (headMatch) {
                this.precision = headMatch[1] ? headMatch[1].trim() : undefined;
                this.return = headMatch[3].trim();
                this.name = headMatch[4].trim();
                const paramsStr = headMatch[5];
                let paramMatch;
                while ((paramMatch = paramRegex.exec(paramsStr)) !== null) {
                    const [, precision, , inout, , type, name, array] = paramMatch;
                    const isStruct = !WebGPU_GLSLFunction.variableType.includes(type);
                    const isArray = array !== undefined;
                    let arrayLength = undefined;
                    if (isArray)
                        arrayLength = parseInt(array.replace(/\D/g, ''));
                    this.params.push({
                        name,
                        type,
                        inout,
                        precision,
                        isArray,
                        arrayLength,
                        isStruct
                    });
                }
            }
            this._findFunctionCalls(this.body);
            this.head = `${this.return} ${this.name}(`;
            this.head += this.params.map(param => {
                let str = '';
                if (param.inout)
                    str += `${param.inout} `;
                str += `${param.type} ${param.name}`;
                if (param.isArray)
                    str += `[${param.arrayLength}]`;
                return str;
            }).join(', ');
            this.head += ')';
        }
        _findFunctionCalls(glslCode) {
            const regex = /(\b\w+\b)\s*\(([^()]*\([^()]*\)[^()]*)*([^()]*)\)/gs;
            let matches;
            while ((matches = regex.exec(glslCode)) !== null) {
                const name = matches[1];
                const args = matches[0].slice(name.length).trim();
                if (!notPutToFuncCall.includes(name)) {
                    const param = WebGPU_GLSLCommon.findParamInBracket(args, 0);
                    if (param) {
                        this.calls.push({
                            name,
                            params: param.elements
                        });
                    }
                }
                if (args.includes('('))
                    this._findFunctionCalls(args);
            }
        }
        processSampler(textureNames) {
            if (!this.samplerProcessed) {
                this.samplerProcessed = true;
                this.samplerParams = [];
                this.samplerBody = this.body;
                for (let i = 0, len = this.params.length; i < len; i++) {
                    const param = this.params[i];
                    if (param.type.includes('sampler')) {
                        let samplerType = 'sampler';
                        let textureType = param.type.replace('sampler', 'texture');
                        if (textureType === 'texture2DShadow') {
                            textureType = 'texture2D';
                            samplerType = 'samplerShadow';
                        }
                        const textureName = param.name + '_texture';
                        const samplerName = param.name + '_sampler';
                        const textureParam = {
                            name: textureName,
                            type: textureType,
                            inout: param.inout,
                            precision: param.precision,
                            isArray: param.isArray,
                            arrayLength: param.arrayLength,
                            isStruct: param.isStruct
                        };
                        const samplerParam = {
                            name: samplerName,
                            type: samplerType,
                            inout: param.inout,
                            precision: param.precision,
                            isArray: param.isArray,
                            arrayLength: param.arrayLength,
                            isStruct: param.isStruct
                        };
                        this.samplerParams.push(textureParam, samplerParam);
                        let functionNames;
                        let replacementInCategory;
                        let replacementOutOfCategory;
                        if (param.type === 'sampler2D') {
                            functionNames = ['texture', 'texture2D'];
                            replacementInCategory = `sampler2D(${textureName}, ${samplerName})`;
                        }
                        else if (param.type === 'samplerCube') {
                            functionNames = ['texture', 'textureCube'];
                            replacementInCategory = `samplerCube(${textureName}, ${samplerName})`;
                        }
                        else if (param.type === 'sampler2DShadow') {
                            functionNames = ['textureLod'];
                            replacementInCategory = `sampler2DShadow(${textureName}, ${samplerName})`;
                        }
                        replacementOutOfCategory = `${textureName}, ${samplerName}`;
                        this.samplerBody = WebGPU_GLSLCommon.replaceArgumentByFunctionCategory(this.samplerBody, param.name, functionNames, replacementInCategory, replacementOutOfCategory);
                    }
                    else
                        this.samplerParams.push(param);
                }
                const functionNames = ['texture', 'texture2D', 'textureCube', 'textureLod'];
                for (let i = 0; i < textureNames.length; i++) {
                    const replacementInCategory = null;
                    const replacementOutOfCategory = `${textureNames[i]}Texture, ${textureNames[i]}Sampler`;
                    this.samplerBody = WebGPU_GLSLCommon.replaceArgumentByFunctionCategory(this.samplerBody, textureNames[i], functionNames, replacementInCategory, replacementOutOfCategory);
                }
                this.samplerOutput = `${this.return} ${this.name}(`;
                this.samplerOutput += this.samplerParams.map(param => {
                    let str = '';
                    if (param.inout)
                        str += `${param.inout}`;
                    str += `${param.type} ${param.name}`;
                    if (param.isArray)
                        str += `[${param.arrayLength}]`;
                    return str;
                }).join(', ');
                this.samplerOutput += ')\n';
                this.samplerOutput += this.samplerBody;
            }
        }
    }
    WebGPU_GLSLFunction.variableType = ['float', 'int', 'void', 'bool', 'vec2', 'vec3', 'vec4', 'mat2', 'mat3', 'mat4'];

    class WebGPU_GLSLUniform {
        constructor(all) {
            this.all = all;
            this._parse(all);
        }
        _parse(all) {
            const fieldRegex = /((lowp|mediump|highp)\s+)?(\w+)\s+(\w+)\s*(\[(\d+)\])?;/g;
            let fieldMatch;
            if ((fieldMatch = fieldRegex.exec(all)) !== null) {
                const [, precision, , type, name, , array] = fieldMatch;
                const isArray = array !== undefined;
                let arrayLength = undefined;
                if (isArray)
                    arrayLength = parseInt(array.replace(/\D/g, ''));
                this.fields = {
                    type,
                    name,
                    precision,
                    isArray,
                    arrayLength
                };
                this.name = name;
            }
        }
    }

    class WebGPU_GLSLProcess {
        constructor() {
            this.glInter = [];
            this.globals = [];
            this.macros = [];
            this.structs = [];
            this.uniforms = [];
            this.functions = [];
            this.textureNames = [];
            this.glslCode = '';
            this.haveVertexID = false;
        }
        process(glslCode, textureNames) {
            this.textureNames = textureNames;
            this._removeComments(glslCode);
            this._extractMacros(this.glslCode);
            for (let i = 0; i < 3; i++)
                this._replaceMacros(this.glslCode);
            this._extractInternals(this.glslCode);
            this._extractFunctions(this.glslCode);
            this._extractStructs(this.glslCode);
            this._extractGlobals(this.glslCode);
            this._findUsedFunctions();
            for (let i = 0; i < this.functions.length; i++)
                this.functions[i].processSampler(textureNames);
            this._outputGLSL();
        }
        getUniforms(glslCode) {
            this._extractMacros(glslCode);
            for (let i = 0; i < 3; i++)
                this._replaceMacros(this.glslCode);
            this._extractUniforms(this.glslCode);
            return this.uniforms;
        }
        _removeComments(glslCode) {
            let result = '';
            let isInSingleLineComment = false;
            let isInMultiLineComment = false;
            let char;
            let next;
            for (let i = 0, len = glslCode.length; i < len; i++) {
                char = glslCode[i];
                next = glslCode[i + 1];
                if (!isInSingleLineComment && char === '/' && next === '*') {
                    isInMultiLineComment = true;
                    i++;
                    continue;
                }
                if (isInMultiLineComment && char === '*' && next === '/') {
                    isInMultiLineComment = false;
                    i++;
                    continue;
                }
                if (!isInMultiLineComment && char === '/' && next === '/') {
                    isInSingleLineComment = true;
                    i++;
                    continue;
                }
                if (isInSingleLineComment && (char === '\n' || char === '\r'))
                    isInSingleLineComment = false;
                if (!isInSingleLineComment && !isInMultiLineComment)
                    result += char;
            }
            this.glslCode = result;
        }
        _removeSpaces(glslCode) {
            let result = '';
            let inString = false;
            let isSpace = false;
            let stringDelimiter = '';
            let prev = '';
            let next = '';
            let char;
            for (let i = 0, len = glslCode.length; i < len; i++) {
                char = glslCode[i];
                if ((char === '"' || char === '\'') && prev !== '\\') {
                    if (!inString) {
                        inString = true;
                        stringDelimiter = char;
                    }
                    else if (char === stringDelimiter)
                        inString = false;
                }
                if (inString)
                    result += char;
                else {
                    isSpace = char === ' ' || char === '\t';
                    if (isSpace) {
                        next = glslCode[i + 1];
                        if (!/[a-zA-Z0-9_]/.test(prev))
                            continue;
                        if (!/[a-zA-Z0-9_]/.test(next))
                            continue;
                    }
                    result += char;
                }
                if (char !== ' ' || inString)
                    prev = char;
            }
            this.glslCode = result.replace(/^\s*[\r\n]/gm, '');
        }
        _extractMacros(glslCode) {
            const regex = /^\s*#\s*define\s+/;
            const lines = glslCode.split('\n');
            const remove = [];
            let currentMacro = '';
            for (let i = 0, len = lines.length; i < len; i++) {
                const line = lines[i].trim();
                if (line.length === 0)
                    continue;
                if (currentMacro.length > 0 || regex.test(line)) {
                    if (line.endsWith('\\')) {
                        currentMacro += line.slice(0, -1) + ' ';
                        remove.push(i);
                    }
                    else {
                        currentMacro += line;
                        this.macros.push(new WebGPU_GLSLMacro(currentMacro));
                        currentMacro = '';
                        remove.push(i);
                    }
                }
            }
            for (let i = remove.length - 1; i > -1; i--)
                lines.splice(remove[i], 1);
            this.glslCode = lines.join('\n');
        }
        _replaceMacros(glslCode) {
            for (let i = 0, len = this.macros.length; i < len; i++)
                glslCode = this.macros[i].replaceMacros(glslCode);
            this.glslCode = glslCode;
        }
        _extractInternals(glslCode) {
            const regex = /\b(gl_VertexID|gl_FragColor|gl_Position)/g;
            let match;
            while ((match = regex.exec(glslCode)) !== null) {
                const res = match[0].trim();
                if (this.glInter.indexOf(res) === -1)
                    this.glInter.push(res);
            }
            if (this.glInter.indexOf('gl_VertexID') !== -1) {
                this.globals.push('int gl_VertexID;');
                this.haveVertexID = true;
            }
        }
        _extractGlobals(glslCode) {
            const regex = /\b(?:const\s+)?(float|int|bool|vec[234]|mat[234]x?[234]?)(\s+\w+)(\[(\d+)\])?(\s*=\s*[^;]+)?;/g;
            let match;
            while ((match = regex.exec(glslCode)) !== null)
                this.globals.push(match[0].trim());
            this.glslCode = glslCode.replace(regex, '');
        }
        _extractStructs(glslCode) {
            const regex = /struct\s+(\w+)\s*\{\s*([^}]+)\s*\}\s*;/gm;
            let match;
            while ((match = regex.exec(glslCode)) !== null)
                this.structs.push(new WebGPU_GLSLStruct(match[0].trim()));
            this.glslCode = glslCode.replace(regex, '');
        }
        _extractUniforms(glslCode) {
            const regex = /\buniform\s+(lowp|mediump|highp)?\s+(\w+)\s+(\w+)\s*;/gm;
            let match;
            while ((match = regex.exec(glslCode)) !== null)
                this.uniforms.push(new WebGPU_GLSLUniform(match[0].trim()));
            this.glslCode = glslCode.replace(regex, '');
        }
        _extractFunctions(glslCode) {
            const functions = this.functions;
            let depth = 0;
            let lineStart = -1;
            let commentMode = '';
            for (let i = 0, len = glslCode.length; i < len; i++) {
                const char = glslCode[i];
                const nextChar = glslCode[i + 1];
                if (commentMode === '') {
                    if (char === '/' && nextChar === '/') {
                        commentMode = '//';
                        i++;
                        continue;
                    }
                    else if (char === '/' && nextChar === '*') {
                        commentMode = '/*';
                        i++;
                        continue;
                    }
                }
                if (commentMode === '//') {
                    if (char === '\n')
                        commentMode = '';
                    continue;
                }
                else if (commentMode === '/*') {
                    if (char === '*' && nextChar === '/') {
                        commentMode = '';
                        i++;
                    }
                    continue;
                }
                if (commentMode !== '')
                    continue;
                if (char === '{' && depth === 0) {
                    let j = i - 1;
                    while (j >= 0 && /\s/.test(glslCode[j]))
                        j--;
                    if (glslCode[j] === ')') {
                        while (j >= 0 && glslCode[j] !== '(')
                            j--;
                        while (j >= 0 && /\s/.test(glslCode[j]))
                            j--;
                        let k = j;
                        while (k >= 0 && !/\s/.test(glslCode[k]))
                            k--;
                        let returnTypeStart = k;
                        while (returnTypeStart >= 0 && /\s/.test(glslCode[returnTypeStart]))
                            returnTypeStart--;
                        let returnTypeEnd = returnTypeStart;
                        while (returnTypeEnd >= 0 && !/\s/.test(glslCode[returnTypeEnd]))
                            returnTypeEnd--;
                        lineStart = returnTypeEnd + 1;
                    }
                }
                if (char === '{')
                    depth++;
                else if (char === '}' && depth > 0) {
                    depth--;
                    if (depth === 0 && lineStart >= 0) {
                        functions.push(new WebGPU_GLSLFunction(glslCode.substring(lineStart, i + 1).trim()));
                        lineStart = -1;
                    }
                }
            }
            for (let i = 0, len = this.functions.length; i < len; i++)
                glslCode = glslCode.replace(this.functions[i].all, '');
            this.glslCode = glslCode;
        }
        _findUsedFunctions() {
            const funcUsedNew = [];
            const funcUsedSet = new Set();
            const _findFunc = (func) => {
                for (let i = 0, len = func.calls.length; i < len; i++) {
                    const call = func.calls[i];
                    for (let j = 0, len = this.functions.length; j < len; j++) {
                        const func = this.functions[j];
                        if (func.name === call.name) {
                            const params = call.params;
                            const funcParams = func.params;
                            if (funcParams.length !== params.length)
                                continue;
                            if (!funcUsedSet.has(j)) {
                                funcUsedNew.push(j);
                                funcUsedSet.add(j);
                            }
                        }
                    }
                }
            };
            funcUsedSet.add(this.functions.length - 1);
            _findFunc(this.functions[this.functions.length - 1]);
            while (funcUsedNew.length > 0) {
                const fn = funcUsedNew.slice();
                funcUsedNew.length = 0;
                for (let i = 0, len = fn.length; i < len; i++)
                    _findFunc(this.functions[fn[i]]);
            }
            for (let i = this.functions.length - 1; i > -1; i--)
                if (!funcUsedSet.has(i))
                    this.functions.splice(i, 1);
        }
        _outputGLSL() {
            let output = '';
            for (let i = 0, len = this.globals.length; i < len; i++)
                output += this.globals[i] + '\n';
            output += '\n';
            for (let i = 0, len = this.structs.length; i < len; i++)
                output += this.structs[i].all + '\n\n';
            for (let i = 0, len = this.functions.length; i < len; i++) {
                if (!this.functions[i].samplerProcessed) {
                    output += this.functions[i].head + '\n';
                    output += this.functions[i].body + '\n\n';
                }
                else {
                    output += this.functions[i].samplerOutput + '\n\n';
                }
            }
            this.glslCode = output;
        }
        _getVariable(name, isArray = false) {
            for (let i = this.structs.length - 1; i > -1; i--) {
                const ret = this.structs[i].getArrayField(name, isArray);
                if (ret !== undefined)
                    return ret;
            }
            return undefined;
        }
        debugInfo() {
            for (let i = 0, len = this.functions.length; i < len; i++)
                console.log(this.functions[i]);
        }
    }

    class NagaWASM {
        async init() {
            await window.naga.initSync.call();
        }
        compileGLSL2WGSL(code, type) {
            return window.naga.glsl_compile(code, type);
        }
    }

    function roundUp(n, align) {
        return (((n + align - 1) / align) | 0) * align;
    }
    function roundDown(n, align) {
        const res = (((n + align - 1) / align) | 0) * align;
        return res > n ? res - align : res;
    }
    const isTypedArray = (arr) => arr && typeof arr.length === 'number' && arr.buffer instanceof ArrayBuffer && typeof arr.byteLength === 'number';

    var GPUAddressMode;
    (function (GPUAddressMode) {
        GPUAddressMode["clamp"] = "clamp-to-edge";
        GPUAddressMode["repeat"] = "repeat";
        GPUAddressMode["mirror"] = "mirror-repeat";
    })(GPUAddressMode || (GPUAddressMode = {}));
    var GPUFilterMode;
    (function (GPUFilterMode) {
        GPUFilterMode["nearest"] = "nearest";
        GPUFilterMode["linear"] = "linear";
    })(GPUFilterMode || (GPUFilterMode = {}));
    var GPUCompareFunction;
    (function (GPUCompareFunction) {
        GPUCompareFunction["never"] = "never";
        GPUCompareFunction["less"] = "less";
        GPUCompareFunction["equal"] = "equal";
        GPUCompareFunction["less_equal"] = "less-equal";
        GPUCompareFunction["greater"] = "greater";
        GPUCompareFunction["not_equal"] = "not-equal";
        GPUCompareFunction["greater_equal"] = "greater-equal";
        GPUCompareFunction["always"] = "always";
    })(GPUCompareFunction || (GPUCompareFunction = {}));
    class WebGPUSampler {
        constructor(obj) {
            this.objectName = 'WebGPUSamper';
            this.source = this._createGPUSampler(obj);
            this.globalId = WebGPUGlobal.getId(this);
        }
        static getWebGPUSampler(params) {
            const cacheKey = WebGPUSampler._getCacheSamplerKey(params);
            if (!this._cacheMap[cacheKey])
                this._cacheMap[cacheKey] = new WebGPUSampler(params);
            return this._cacheMap[cacheKey];
        }
        static _getCacheSamplerKey(params) {
            return (params.wrapU << WebGPUSampler.pointer_wrapU) +
                (params.warpV << WebGPUSampler.pointer_warpV) +
                (params.warpW << WebGPUSampler.pointer_warpW) +
                (params.filterMode << WebGPUSampler.pointer_filterMode) +
                (params.mipmapFilter << WebGPUSampler.pointer_mipmapFilter) +
                (params.comparedMode << WebGPUSampler.pointer_comparedMode) +
                (params.anisoLevel << WebGPUSampler.pointer_anisoLevel);
        }
        _createGPUSampler(params) {
            this._descriptor = this._getSamplerDescriptor(params);
            if (this._descriptor.maxAnisotropy < 1)
                this._descriptor.maxAnisotropy = 1;
            return WebGPURenderEngine._instance.getDevice().createSampler(this._descriptor);
        }
        _getSamplerDescriptor(params) {
            if (params.anisoLevel > 1 && params.mipmapFilter === Laya.FilterMode.Point)
                params.mipmapFilter = Laya.FilterMode.Bilinear;
            return {
                addressModeU: this._getSamplerAddressMode(params.wrapU),
                addressModeV: this._getSamplerAddressMode(params.wrapU),
                addressModeW: this._getSamplerAddressMode(params.warpW),
                magFilter: this._getFilterMode(params.filterMode),
                minFilter: this._getFilterMode(params.filterMode),
                mipmapFilter: this._getFilterMode(params.mipmapFilter),
                compare: this._getGPUCompareFunction(params.comparedMode),
                maxAnisotropy: params.anisoLevel
            };
        }
        _getSamplerAddressMode(warpMode) {
            switch (warpMode) {
                case Laya.WrapMode.Repeat:
                    return GPUAddressMode.repeat;
                case Laya.WrapMode.Mirrored:
                    return GPUAddressMode.mirror;
                case Laya.WrapMode.Clamp:
                default:
                    return GPUAddressMode.clamp;
            }
        }
        _getFilterMode(filterMode) {
            switch (filterMode) {
                case Laya.FilterMode.Bilinear:
                case Laya.FilterMode.Trilinear:
                    return GPUFilterMode.linear;
                case Laya.FilterMode.Point:
                default:
                    return GPUFilterMode.nearest;
            }
        }
        _getGPUCompareFunction(compareMode) {
            switch (compareMode) {
                case Laya.TextureCompareMode.ALWAYS:
                    return GPUCompareFunction.always;
                case Laya.TextureCompareMode.EQUAL:
                    return GPUCompareFunction.equal;
                case Laya.TextureCompareMode.GREATER:
                    return GPUCompareFunction.greater;
                case Laya.TextureCompareMode.GEQUAL:
                    return GPUCompareFunction.greater_equal;
                case Laya.TextureCompareMode.LESS:
                    return GPUCompareFunction.less;
                case Laya.TextureCompareMode.LEQUAL:
                    return GPUCompareFunction.less_equal;
                case Laya.TextureCompareMode.NEVER:
                    return GPUCompareFunction.never;
                case Laya.TextureCompareMode.NOTEQUAL:
                    return GPUCompareFunction.not_equal;
                case Laya.TextureCompareMode.None:
                default:
                    return undefined;
            }
        }
    }
    WebGPUSampler.pointer_wrapU = 0;
    WebGPUSampler.pointer_warpV = 2;
    WebGPUSampler.pointer_warpW = 4;
    WebGPUSampler.pointer_filterMode = 6;
    WebGPUSampler.pointer_mipmapFilter = 8;
    WebGPUSampler.pointer_comparedMode = 10;
    WebGPUSampler.pointer_anisoLevel = 14;
    WebGPUSampler._cacheMap = {};

    class WebGPUInternalTex {
        get filterMode() {
            return this._filterMode;
        }
        set filterMode(value) {
            if (this._filterMode !== value) {
                switch (value) {
                    case Laya.FilterMode.Point:
                        this._webGPUSamplerParams.filterMode = Laya.FilterMode.Point;
                        this._webGPUSamplerParams.mipmapFilter = Laya.FilterMode.Point;
                        break;
                    case Laya.FilterMode.Bilinear:
                        this._webGPUSamplerParams.filterMode = Laya.FilterMode.Bilinear;
                        this._webGPUSamplerParams.mipmapFilter = Laya.FilterMode.Point;
                        break;
                    case Laya.FilterMode.Trilinear:
                        this._webGPUSamplerParams.filterMode = Laya.FilterMode.Bilinear;
                        this._webGPUSamplerParams.mipmapFilter = Laya.FilterMode.Bilinear;
                        break;
                }
                this._webgpuSampler = WebGPUSampler.getWebGPUSampler(this._webGPUSamplerParams);
                this._filterMode = value;
            }
        }
        get wrapU() {
            return this._wrapU;
        }
        set wrapU(value) {
            if (this._wrapU !== value) {
                this._webGPUSamplerParams.wrapU = value;
                this._webgpuSampler = WebGPUSampler.getWebGPUSampler(this._webGPUSamplerParams);
                this._wrapU = value;
            }
        }
        get wrapV() {
            return this._wrapV;
        }
        set wrapV(value) {
            if (this._wrapV !== value) {
                this._webGPUSamplerParams.wrapU = value;
                this._webgpuSampler = WebGPUSampler.getWebGPUSampler(this._webGPUSamplerParams);
                this._wrapV = value;
            }
        }
        get wrapW() {
            return this._wrapW;
        }
        set wrapW(value) {
            if (this._wrapW !== value) {
                this._webGPUSamplerParams.wrapU = value;
                this._webgpuSampler = WebGPUSampler.getWebGPUSampler(this._webGPUSamplerParams);
                this._wrapW = value;
            }
        }
        get anisoLevel() {
            return this._anisoLevel;
        }
        set anisoLevel(value) {
            if (this._anisoLevel !== value && this.resource) {
                this._webGPUSamplerParams.anisoLevel = value;
                this._webgpuSampler = WebGPUSampler.getWebGPUSampler(this._webGPUSamplerParams);
                this._anisoLevel = value;
            }
        }
        get compareMode() {
            return this._compareMode;
        }
        set compareMode(value) {
            if (this._compareMode !== value) {
                this._webGPUSamplerParams.comparedMode = value;
                this._webgpuSampler = WebGPUSampler.getWebGPUSampler(this._webGPUSamplerParams);
                this._compareMode = value;
            }
        }
        get sampler() {
            return this._webgpuSampler;
        }
        get gpuMemory() {
            return this._gpuMemory;
        }
        set gpuMemory(value) {
            this._changeTexMemory(value);
            this._gpuMemory = value;
        }
        constructor(width, height, depth, dimension, mipmap, multiSamples, useSRGBLoader, gammaCorrection) {
            this.objectName = 'WebGPUInternalTex';
            this._webGPUSamplerParams = {
                comparedMode: Laya.TextureCompareMode.None,
                wrapU: Laya.WrapMode.Repeat,
                warpV: Laya.WrapMode.Repeat,
                warpW: Laya.WrapMode.Repeat,
                mipmapFilter: Laya.FilterMode.Bilinear,
                filterMode: Laya.FilterMode.Bilinear,
                anisoLevel: 1
            };
            this._gpuMemory = 0;
            this.width = width;
            this.height = height;
            this.depth = depth;
            this.dimension = dimension;
            this.multiSamplers = multiSamples;
            const _isPot = (value) => {
                return (value & (value - 1)) === 0;
            };
            this.isPotSize = _isPot(width) && _isPot(height);
            if (dimension === Laya.TextureDimension.Tex3D) {
                this.isPotSize = this.isPotSize && _isPot(this.depth);
            }
            this.mipmap = mipmap && this.isPotSize;
            this.mipmapCount = this.mipmap ? Math.max(Math.ceil(Math.log2(width)) + 1, Math.ceil(Math.log2(height)) + 1) : 1;
            this.maxMipmapLevel = this.mipmapCount - 1;
            this.baseMipmapLevel = 0;
            this.useSRGBLoad = useSRGBLoader;
            this.gammaCorrection = gammaCorrection;
            this._engine = WebGPURenderEngine._instance;
            this._webgpuSampler = WebGPUSampler.getWebGPUSampler(this._webGPUSamplerParams);
            switch (dimension) {
                case Laya.TextureDimension.Tex2D:
                    this._statistics_M_TextureX = Laya.GPUEngineStatisticsInfo.M_Texture2D;
                    this._statistics_RC_TextureX = Laya.GPUEngineStatisticsInfo.RC_Texture2D;
                    break;
                case Laya.TextureDimension.Tex3D:
                    this._statistics_M_TextureX = Laya.GPUEngineStatisticsInfo.M_Texture3D;
                    this._statistics_RC_TextureX = Laya.GPUEngineStatisticsInfo.RC_Texture3D;
                    break;
                case Laya.TextureDimension.Cube:
                    this._statistics_M_TextureX = Laya.GPUEngineStatisticsInfo.M_TextureCube;
                    this._statistics_RC_TextureX = Laya.GPUEngineStatisticsInfo.RC_TextureCube;
                    break;
                case Laya.TextureDimension.Texture2DArray:
                    this._statistics_M_TextureX = Laya.GPUEngineStatisticsInfo.M_Texture2DArray;
                    this._statistics_RC_TextureX = Laya.GPUEngineStatisticsInfo.RC_Texture2DArray;
                    break;
            }
            this._statistics_M_TextureA = Laya.GPUEngineStatisticsInfo.M_ALLTexture;
            this._statistics_RC_TextureA = Laya.GPUEngineStatisticsInfo.RC_ALLTexture;
            this.globalId = WebGPUGlobal.getId(this);
            WebGPUStatis.addTexture(this);
        }
        statisAsRenderTexture() {
            this._statistics_M_TextureA = Laya.GPUEngineStatisticsInfo.M_ALLRenderTexture;
            this._statistics_RC_TextureA = Laya.GPUEngineStatisticsInfo.RC_ALLRenderTexture;
        }
        getTextureView() {
            let dimension;
            switch (this.dimension) {
                case Laya.TextureDimension.Tex2D:
                    dimension = '2d';
                    break;
                case Laya.TextureDimension.Cube:
                    dimension = 'cube';
                    break;
                case Laya.TextureDimension.Tex3D:
                    dimension = '3d';
                    break;
                case Laya.TextureDimension.Texture2DArray:
                    dimension = '2d-array';
                    break;
                case Laya.TextureDimension.CubeArray:
                    dimension = 'cube-array';
                    break;
                default:
                    dimension = '2d';
                    break;
            }
            const descriptor = {
                format: this._webGPUFormat,
                dimension,
                baseMipLevel: this.baseMipmapLevel,
                mipLevelCount: this.maxMipmapLevel - this.baseMipmapLevel + 1,
            };
            return this.resource.createView(descriptor);
        }
        _changeTexMemory(memory) {
            this._engine._addStatisticsInfo(Laya.GPUEngineStatisticsInfo.M_GPUMemory, -this._gpuMemory + memory);
            if (this._statistics_M_TextureA !== Laya.GPUEngineStatisticsInfo.M_ALLRenderTexture)
                this._engine._addStatisticsInfo(this._statistics_M_TextureX, -this._gpuMemory + memory);
            this._engine._addStatisticsInfo(this._statistics_M_TextureA, -this._gpuMemory + memory);
        }
        dispose() {
            this.gpuMemory = 0;
            WebGPUGlobal.releaseId(this);
            this.resource.destroy();
        }
    }

    function guessTextureBindingViewDimensionForTexture$1(texture) {
        switch (texture.dimension) {
            case '1d':
                return '1d';
            case '3d':
                return '3d';
            default:
            case '2d':
                return texture.depthOrArrayLayers > 1 ? '2d-array' : '2d';
        }
    }
    function normalizeGPUExtent3Dict(size) {
        return [size.width, size.height || 1, size.depthOrArrayLayers || 1];
    }
    function normalizeGPUExtent3D(size) {
        return (Array.isArray(size) || isTypedArray(size))
            ? [...size, 1, 1].slice(0, 3)
            : normalizeGPUExtent3Dict(size);
    }
    function numMipLevels(size, dimension) {
        const sizes = normalizeGPUExtent3D(size);
        const maxSize = Math.max(...sizes.slice(0, dimension === '3d' ? 3 : 2));
        return 1 + Math.log2(maxSize) | 0;
    }
    function getMipmapGenerationWGSL(textureBindingViewDimension) {
        let textureSnippet;
        let sampleSnippet;
        switch (textureBindingViewDimension) {
            case '2d':
                textureSnippet = 'texture_2d<f32>';
                sampleSnippet = 'textureSample(ourTexture, ourSampler, fsInput.texcoord)';
                break;
            case '2d-array':
                textureSnippet = 'texture_2d_array<f32>';
                sampleSnippet = `
          textureSample(
              ourTexture,
              ourSampler,
              fsInput.texcoord,
              uni.layer)`;
                break;
            case 'cube':
                textureSnippet = 'texture_cube<f32>';
                sampleSnippet = `
          textureSample(
              ourTexture,
              ourSampler,
              faceMat[uni.layer] * vec3f(fract(fsInput.texcoord), 1))`;
                break;
            case 'cube-array':
                textureSnippet = 'texture_cube_array<f32>';
                sampleSnippet = `
          textureSample(
              ourTexture,
              ourSampler,
              faceMat[uni.layer] * vec3f(fract(fsInput.texcoord), 1), uni.layer)`;
                break;
            default:
                throw new Error(`unsupported view: ${textureBindingViewDimension}`);
        }
        return `
        const faceMat = array(
          mat3x3f( 0,  0,  -2,  0, -2,   0,  1,  1,   1),   // pos-x
          mat3x3f( 0,  0,   2,  0, -2,   0, -1,  1,  -1),   // neg-x
          mat3x3f( 2,  0,   0,  0,  0,   2, -1,  1,  -1),   // pos-y
          mat3x3f( 2,  0,   0,  0,  0,  -2, -1, -1,   1),   // neg-y
          mat3x3f( 2,  0,   0,  0, -2,   0, -1,  1,   1),   // pos-z
          mat3x3f(-2,  0,   0,  0, -2,   0,  1,  1,  -1));  // neg-z

        struct VSOutput {
          @builtin(position) position: vec4f,
          @location(0) texcoord: vec2f,
        };

        @vertex fn vs(
          @builtin(vertex_index) vertexIndex : u32
        ) -> VSOutput {
          var pos = array<vec2f, 3>(
            vec2f(-1.0, -1.0),
            vec2f(-1.0,  3.0),
            vec2f( 3.0, -1.0),
          );

          var vsOutput: VSOutput;
          let xy = pos[vertexIndex];
          vsOutput.position = vec4f(xy, 0.0, 1.0);
          vsOutput.texcoord = xy * vec2f(0.5, -0.5) + vec2f(0.5);
          return vsOutput;
        }

        struct Uniforms {
          layer: u32,
        };

        @group(0) @binding(0) var ourSampler: sampler;
        @group(0) @binding(1) var ourTexture: ${textureSnippet};
        @group(0) @binding(2) var<uniform> uni: Uniforms;

        @fragment fn fs(fsInput: VSOutput) -> @location(0) vec4f {
          _ = uni.layer; // make sure this is used so all pipelines have the same bindings
          return ${sampleSnippet};
        }
      `;
    }
    const byDevice$1 = new WeakMap();
    function genMipmap(device, texture, textureBindingViewDimension) {
        let perDeviceInfo = byDevice$1.get(device);
        if (!perDeviceInfo) {
            perDeviceInfo = {
                pipelineByFormatAndView: {},
                moduleByViewType: {},
            };
            byDevice$1.set(device, perDeviceInfo);
        }
        let { sampler, uniformBuffer, uniformValues, } = perDeviceInfo;
        const { pipelineByFormatAndView, moduleByViewType, } = perDeviceInfo;
        textureBindingViewDimension = textureBindingViewDimension || guessTextureBindingViewDimensionForTexture$1(texture);
        let module = moduleByViewType[textureBindingViewDimension];
        if (!module) {
            const code = getMipmapGenerationWGSL(textureBindingViewDimension);
            module = device.createShaderModule({
                label: `mipLevelGeneration for ${textureBindingViewDimension}`,
                code,
            });
            moduleByViewType[textureBindingViewDimension] = module;
        }
        if (!sampler) {
            sampler = device.createSampler({
                minFilter: 'linear',
                magFilter: 'linear',
            });
            uniformBuffer = device.createBuffer({
                size: 16,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            });
            uniformValues = new Uint32Array(1);
            Object.assign(perDeviceInfo, { sampler, uniformBuffer, uniformValues });
        }
        const id = `${texture.format}.${textureBindingViewDimension}`;
        if (!pipelineByFormatAndView[id]) {
            pipelineByFormatAndView[id] = device.createRenderPipeline({
                label: `mipLevelGenerator for ${textureBindingViewDimension}`,
                layout: 'auto',
                vertex: {
                    module,
                    entryPoint: 'vs',
                },
                fragment: {
                    module,
                    entryPoint: 'fs',
                    targets: [{ format: texture.format }],
                },
            });
        }
        const pipeline = pipelineByFormatAndView[id];
        for (let baseMipLevel = 1; baseMipLevel < texture.mipLevelCount; ++baseMipLevel) {
            for (let baseArrayLayer = 0; baseArrayLayer < texture.depthOrArrayLayers; ++baseArrayLayer) {
                uniformValues[0] = baseArrayLayer;
                device.queue.writeBuffer(uniformBuffer, 0, uniformValues);
                const bindGroup = device.createBindGroup({
                    layout: pipeline.getBindGroupLayout(0),
                    entries: [
                        { binding: 0, resource: sampler },
                        {
                            binding: 1,
                            resource: texture.createView({
                                dimension: textureBindingViewDimension,
                                baseMipLevel: baseMipLevel - 1,
                                mipLevelCount: 1,
                            }),
                        },
                        { binding: 2, resource: { buffer: uniformBuffer } },
                    ],
                });
                const renderPassDescriptor = {
                    label: 'mip gen renderPass',
                    colorAttachments: [
                        {
                            view: texture.createView({
                                dimension: '2d',
                                baseMipLevel,
                                mipLevelCount: 1,
                                baseArrayLayer,
                                arrayLayerCount: 1,
                            }),
                            loadOp: 'clear',
                            storeOp: 'store',
                        },
                    ],
                };
                const encoder = device.createCommandEncoder({
                    label: 'mip gen encoder',
                });
                const pass = encoder.beginRenderPass(renderPassDescriptor);
                pass.setPipeline(pipeline);
                pass.setBindGroup(0, bindGroup);
                pass.draw(3);
                pass.end();
                const commandBuffer = encoder.finish();
                device.queue.submit([commandBuffer]);
            }
        }
    }

    function guessTextureBindingViewDimensionForTexture(texture) {
        switch (texture.dimension) {
            case '1d':
                return '1d';
            case '3d':
                return '3d';
            default:
            case '2d':
                return texture.depthOrArrayLayers > 1 ? '2d-array' : '2d';
        }
    }
    function getGPUTextureDescriptor(dimension, width, height, format) {
        const textureSize = {
            width,
            height,
            depthOrArrayLayers: 1,
        };
        let usage = GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC;
        let dimensionType;
        switch (dimension) {
            case Laya.TextureDimension.Tex2D:
            case Laya.TextureDimension.Cube:
            case Laya.TextureDimension.Texture2DArray:
                dimensionType = exports.WebGPUTextureDimension.D2D;
                break;
            case Laya.TextureDimension.Tex3D:
                dimensionType = exports.WebGPUTextureDimension.D3D;
                break;
            default:
                throw "DimensionType Unknown format";
        }
        const textureDescriptor = {
            size: textureSize,
            mipLevelCount: 1,
            sampleCount: 1,
            dimension: dimensionType,
            format,
            usage,
        };
        return textureDescriptor;
    }
    function getPremultiplyAlphaWGSL(textureBindingViewDimension) {
        let textureSnippet;
        let sampleSnippet;
        switch (textureBindingViewDimension) {
            case '2d':
                textureSnippet = 'texture_2d<f32>';
                sampleSnippet = 'textureSample(ourTexture, ourSampler, fsInput.texcoord)';
                break;
            case '2d-array':
                textureSnippet = 'texture_2d_array<f32>';
                sampleSnippet = `
          textureSample(
              ourTexture,
              ourSampler,
              fsInput.texcoord,
              uni.layer)`;
                break;
            case 'cube':
                textureSnippet = 'texture_cube<f32>';
                sampleSnippet = `
          textureSample(
              ourTexture,
              ourSampler,
              faceMat[uni.layer] * vec3f(fract(fsInput.texcoord), 1))`;
                break;
            case 'cube-array':
                textureSnippet = 'texture_cube_array<f32>';
                sampleSnippet = `
          textureSample(
              ourTexture,
              ourSampler,
              faceMat[uni.layer] * vec3f(fract(fsInput.texcoord), 1), uni.layer)`;
                break;
            default:
                throw new Error(`unsupported view: ${textureBindingViewDimension}`);
        }
        return `
        const faceMat = array(
          mat3x3f( 0,  0,  -2,  0, -2,   0,  1,  1,   1),   // pos-x
          mat3x3f( 0,  0,   2,  0, -2,   0, -1,  1,  -1),   // neg-x
          mat3x3f( 2,  0,   0,  0,  0,   2, -1,  1,  -1),   // pos-y
          mat3x3f( 2,  0,   0,  0,  0,  -2, -1, -1,   1),   // neg-y
          mat3x3f( 2,  0,   0,  0, -2,   0, -1,  1,   1),   // pos-z
          mat3x3f(-2,  0,   0,  0, -2,   0,  1,  1,  -1));  // neg-z

        struct VSOutput {
          @builtin(position) position: vec4f,
          @location(0) texcoord: vec2f,
        };

        struct Uniforms {
          layer: f32,
          sx: f32,
          sy: f32,
          wx: f32,
          wy: f32,
        };

        @vertex fn vs(
          @builtin(vertex_index) vertexIndex : u32
        ) -> VSOutput {
          let pos1 = array<vec2f, 6>(
            vec2f(-1.0, 1.0),
            vec2f(1.0, 1.0),
            vec2f(-1.0, -1.0),
            vec2f(1.0, 1.0),
            vec2f(1.0, -1.0),
            vec2f(-1.0, -1.0),
          );

          let pos2 = array<vec2f, 6>(
            vec2f(uni.sx, uni.sy),
            vec2f(uni.sx + uni.wx, uni.sy),
            vec2f(uni.sx, uni.sy + uni.wy),
            vec2f(uni.sx + uni.wx, uni.sy),
            vec2f(uni.sx + uni.wx, uni.sy + uni.wy),
            vec2f(uni.sx, uni.sy + uni.wy),
          );

          var vsOutput: VSOutput;
          let xy1 = pos1[vertexIndex];
          let xy2 = pos2[vertexIndex];
          vsOutput.position = vec4f(xy1, 0.0, 1.0);
          vsOutput.texcoord = xy2 * vec2f(0.5) + vec2f(0.5);
          return vsOutput;
        }

        @group(0) @binding(0) var ourSampler: sampler;
        @group(0) @binding(1) var ourTexture: ${textureSnippet};
        @group(0) @binding(2) var<uniform> uni: Uniforms;

        @fragment fn fs(fsInput: VSOutput) -> @location(0) vec4f {
          _ = uni.layer; //make sure this is used so all pipelines have the same bindings
          let c = ${sampleSnippet};
          let r = c.x * c.w;
          let g = c.y * c.w;
          let b = c.z * c.w;
          let a = c.w;
          return vec4f(r, g, b, a);
        }
      `;
    }
    const byDevice = new WeakMap();
    function doPremultiplyAlpha(device, tex, xOffset, yOffset, width, height) {
        const texture = tex.resource;
        const tw = texture.width;
        const th = texture.height;
        const sx = -1.0 + xOffset / tw * 2.0;
        const sy = -1.0 + yOffset / th * 2.0;
        const wx = width / tw * 2.0;
        const wy = height / th * 2.0;
        const textureDescriptor = getGPUTextureDescriptor(tex.dimension, width, height, tex._webGPUFormat);
        const textureTemp = device.createTexture(textureDescriptor);
        let perDeviceInfo = byDevice.get(device);
        if (!perDeviceInfo) {
            perDeviceInfo = {
                pipelineByFormatAndView: {},
                moduleByViewType: {},
            };
            byDevice.set(device, perDeviceInfo);
        }
        let { sampler, uniformBuffer, uniformValues, } = perDeviceInfo;
        const { pipelineByFormatAndView, moduleByViewType, } = perDeviceInfo;
        const textureBindingViewDimension = guessTextureBindingViewDimensionForTexture(texture);
        let module = moduleByViewType[textureBindingViewDimension];
        if (!module) {
            const code = getPremultiplyAlphaWGSL(textureBindingViewDimension);
            module = device.createShaderModule({
                label: `premultiplyAlpha for ${textureBindingViewDimension}`,
                code,
            });
            moduleByViewType[textureBindingViewDimension] = module;
        }
        if (!sampler) {
            sampler = device.createSampler({
                minFilter: 'linear',
                magFilter: 'linear',
            });
            uniformBuffer = device.createBuffer({
                size: 32,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            });
            uniformValues = new Float32Array(8);
            Object.assign(perDeviceInfo, { sampler, uniformBuffer, uniformValues });
        }
        const id = `${texture.format}.${textureBindingViewDimension}`;
        if (!pipelineByFormatAndView[id]) {
            pipelineByFormatAndView[id] = device.createRenderPipeline({
                label: `premultiplyAlpha for ${textureBindingViewDimension}`,
                layout: 'auto',
                vertex: {
                    module,
                    entryPoint: 'vs',
                },
                fragment: {
                    module,
                    entryPoint: 'fs',
                    targets: [{ format: texture.format }],
                },
            });
        }
        const pipeline = pipelineByFormatAndView[id];
        uniformValues[1] = sx;
        uniformValues[2] = sy;
        uniformValues[3] = wx;
        uniformValues[4] = wy;
        for (let baseArrayLayer = 0; baseArrayLayer < texture.depthOrArrayLayers; ++baseArrayLayer) {
            uniformValues[0] = baseArrayLayer;
            device.queue.writeBuffer(uniformBuffer, 0, uniformValues);
            const bindGroup = device.createBindGroup({
                layout: pipeline.getBindGroupLayout(0),
                entries: [
                    { binding: 0, resource: sampler },
                    {
                        binding: 1,
                        resource: texture.createView({
                            dimension: textureBindingViewDimension,
                            baseMipLevel: 0,
                            mipLevelCount: 1,
                        }),
                    },
                    { binding: 2, resource: { buffer: uniformBuffer } },
                ],
            });
            const renderPassDescriptor = {
                label: 'premultiAlpha renderPass',
                colorAttachments: [
                    {
                        view: textureTemp.createView({
                            dimension: '2d',
                            baseMipLevel: 0,
                            mipLevelCount: 1,
                            baseArrayLayer,
                            arrayLayerCount: 1,
                        }),
                        loadOp: 'clear',
                        storeOp: 'store',
                    },
                ],
            };
            const encoder = device.createCommandEncoder({
                label: 'premultiAlpha encoder',
            });
            const pass = encoder.beginRenderPass(renderPassDescriptor);
            pass.setPipeline(pipeline);
            pass.setBindGroup(0, bindGroup);
            pass.draw(6);
            pass.end();
            encoder.copyTextureToTexture({ texture: textureTemp }, { texture, origin: { x: xOffset, y: yOffset } }, { width, height, depthOrArrayLayers: 1 });
            const commandBuffer = encoder.finish();
            device.queue.submit([commandBuffer]);
        }
    }

    class WebGPUInternalRT {
        constructor(colorFormat, depthStencilFormat, isCube, generateMipmap, samples, sRGB) {
            this.isSRGB = false;
            this.gpuMemory = 0;
            this.formatId = '';
            this.objectName = 'WebGPUInternalRT';
            this._isCube = isCube;
            this._samples = samples;
            this.isSRGB = sRGB;
            this._generateMipmap = generateMipmap;
            this.colorFormat = colorFormat;
            this.depthStencilFormat = depthStencilFormat;
            this._textures = [];
            if (samples > 1)
                this._texturesResolve = [];
            this._colorStates = [];
            this._renderPassDescriptor = { colorAttachments: [] };
            this._renderBundleDescriptor = { colorFormats: [] };
            this.formatId = '<' + colorFormat + '_' + depthStencilFormat + (sRGB ? '_t' : '_f') + '>';
            this.globalId = WebGPUGlobal.getId(this);
        }
        dispose() {
            WebGPUGlobal.releaseId(this);
            if (this._textures) {
                for (let i = this._textures.length - 1; i > -1; i--)
                    this._textures[i].dispose();
                this._textures.length = 0;
            }
            if (this._texturesResolve) {
                for (let i = this._texturesResolve.length - 1; i > -1; i--)
                    this._texturesResolve[i].dispose();
                this._texturesResolve.length = 0;
            }
            if (this._depthTexture) {
                this._depthTexture.dispose();
                this._depthTexture = null;
            }
        }
    }

    class WebGPURenderPassHelper {
        static getDescriptor(rt, clearflag, clearColor = null, clearDepthValue = 1, clearStencilValue = 0) {
            this.setColorAttachments(rt._renderPassDescriptor, rt, !!(clearflag & Laya.RenderClearFlag.Color), clearColor);
            this.setDepthAttachments(rt._renderPassDescriptor, rt, !!(clearflag & Laya.RenderClearFlag.Depth), clearDepthValue, clearStencilValue);
            return rt._renderPassDescriptor;
        }
        static getBundleDescriptor(rt) {
            const desc = rt._renderBundleDescriptor;
            const colorFormats = desc.colorFormats;
            colorFormats.length = rt._textures.length;
            for (let i = 0, len = rt._textures.length; i < len; i++) {
                if (rt._textures[0]._webGPUFormat === 'depth16unorm'
                    || rt._textures[0]._webGPUFormat === 'depth24plus-stencil8'
                    || rt._textures[0]._webGPUFormat === 'depth32float') {
                    colorFormats[i] = rt._depthTexture._webGPUFormat;
                }
                else
                    colorFormats[i] = rt._textures[i]._webGPUFormat;
            }
            if (rt._textures[0]._webGPUFormat === 'depth16unorm'
                || rt._textures[0]._webGPUFormat === 'depth24plus-stencil8'
                || rt._textures[0]._webGPUFormat === 'depth32float') {
                desc.depthStencilFormat = rt._textures[0]._webGPUFormat;
            }
            else
                desc.depthStencilFormat = rt._depthTexture ? rt._depthTexture._webGPUFormat : undefined;
            desc.sampleCount = rt._samples;
            return desc;
        }
        static setColorAttachments(desc, rt, clear, clearColor = Laya.Color.BLACK) {
            desc.colorAttachments = [];
            const colorArray = desc.colorAttachments;
            if (rt._textures[0]._webGPUFormat === 'depth16unorm'
                || rt._textures[0]._webGPUFormat === 'depth24plus-stencil8'
                || rt._textures[0]._webGPUFormat === 'depth32float') {
                colorArray[0] = {
                    view: rt._depthTexture.getTextureView(),
                    loadOp: clear ? 'clear' : 'load',
                    storeOp: 'store',
                    clearValue: {
                        r: clearColor.r,
                        g: clearColor.g,
                        b: clearColor.b,
                        a: clearColor.a
                    }
                };
            }
            else {
                colorArray.length = rt._textures.length;
                for (let i = 0, len = rt._textures.length; i < len; i++) {
                    let attachment;
                    if (rt._textures[i].multiSamplers > 1)
                        attachment = colorArray[i] = {
                            view: rt._textures[i].getTextureView(),
                            resolveTarget: rt._texturesResolve[i].getTextureView(),
                            loadOp: 'clear',
                            storeOp: 'store'
                        };
                    else
                        attachment = colorArray[i] = {
                            view: rt._textures[i].getTextureView(),
                            loadOp: 'clear',
                            storeOp: 'store'
                        };
                    if (clear) {
                        attachment.loadOp = 'clear';
                        attachment.clearValue = {
                            r: clearColor.r,
                            g: clearColor.g,
                            b: clearColor.b,
                            a: clearColor.a
                        };
                    }
                    else
                        attachment.loadOp = 'load';
                }
            }
        }
        static setDepthAttachments(desc, rt, clear, clearDepthValue = 1, clearStencilValue = 0) {
            if (rt._textures[0]._webGPUFormat === 'depth16unorm'
                || rt._textures[0]._webGPUFormat === 'depth24plus-stencil8'
                || rt._textures[0]._webGPUFormat === 'depth32float') {
                const depthStencil = desc.depthStencilAttachment = { view: rt._textures[0].getTextureView() };
                depthStencil.depthClearValue = clearDepthValue;
                depthStencil.depthLoadOp = clear ? 'clear' : 'load';
                depthStencil.depthStoreOp = 'store';
                delete depthStencil.stencilClearValue;
                delete depthStencil.stencilLoadOp;
                delete depthStencil.stencilStoreOp;
            }
            else if (rt._depthTexture) {
                const hasStencil = rt._depthTexture._webGPUFormat.indexOf('stencil8') !== -1;
                const depthStencil = desc.depthStencilAttachment = { view: rt._depthTexture.getTextureView() };
                if (clear) {
                    depthStencil.depthClearValue = clearDepthValue;
                    depthStencil.depthLoadOp = 'clear';
                    depthStencil.depthStoreOp = 'store';
                    if (hasStencil) {
                        depthStencil.stencilClearValue = clearStencilValue;
                        depthStencil.stencilLoadOp = 'clear';
                        depthStencil.stencilStoreOp = 'store';
                    }
                    else {
                        delete depthStencil.stencilClearValue;
                        delete depthStencil.stencilLoadOp;
                        delete depthStencil.stencilStoreOp;
                    }
                }
                else {
                    depthStencil.depthClearValue = clearDepthValue;
                    depthStencil.depthLoadOp = 'load';
                    depthStencil.depthStoreOp = 'store';
                    if (hasStencil) {
                        depthStencil.stencilClearValue = clearStencilValue;
                        depthStencil.stencilLoadOp = 'load';
                        depthStencil.stencilStoreOp = 'store';
                    }
                    else {
                        delete depthStencil.stencilClearValue;
                        delete depthStencil.stencilLoadOp;
                        delete depthStencil.stencilStoreOp;
                    }
                }
            }
            else
                delete desc.depthStencilAttachment;
        }
    }

    const WebGPUCubeMap = [4, 5, 0, 1, 2, 3];
    exports.WebGPUTextureDimension = void 0;
    (function (WebGPUTextureDimension) {
        WebGPUTextureDimension["D1D"] = "1d";
        WebGPUTextureDimension["D2D"] = "2d";
        WebGPUTextureDimension["D3D"] = "3d";
    })(exports.WebGPUTextureDimension || (exports.WebGPUTextureDimension = {}));
    exports.WebGPUTextureFormat = void 0;
    (function (WebGPUTextureFormat) {
        WebGPUTextureFormat["r8unorm"] = "r8unorm";
        WebGPUTextureFormat["r8snorm"] = "r8snorm";
        WebGPUTextureFormat["r8uint"] = "r8uint";
        WebGPUTextureFormat["r8sint"] = "r8sint";
        WebGPUTextureFormat["r16uint"] = "r16uint";
        WebGPUTextureFormat["r16sint"] = "r16sint";
        WebGPUTextureFormat["r16float"] = "r16float";
        WebGPUTextureFormat["rg8unorm"] = "rg8unorm";
        WebGPUTextureFormat["rg8snorm"] = "rg8snorm";
        WebGPUTextureFormat["rg8uint"] = "rg8uint";
        WebGPUTextureFormat["rg8sint"] = "rg8sint";
        WebGPUTextureFormat["r32uint"] = "r32uint";
        WebGPUTextureFormat["r32sint"] = "r32sint";
        WebGPUTextureFormat["r32float"] = "r32float";
        WebGPUTextureFormat["rg16uint"] = "rg16uint";
        WebGPUTextureFormat["rg16sint"] = "rg16sint";
        WebGPUTextureFormat["rg16float"] = "rg16float";
        WebGPUTextureFormat["rgba8unorm"] = "rgba8unorm";
        WebGPUTextureFormat["rgba8unorm_srgb"] = "rgba8unorm-srgb";
        WebGPUTextureFormat["rgba8snorm"] = "rgba8snorm";
        WebGPUTextureFormat["rgba8uint"] = "rgba8uint";
        WebGPUTextureFormat["rgba8sint"] = "rgba8sint";
        WebGPUTextureFormat["bgra8unorm"] = "bgra8unorm";
        WebGPUTextureFormat["bgra8unorm_srgb"] = "bgra8unorm-srgb";
        WebGPUTextureFormat["rgb9e5ufloat"] = "rgb9e5ufloat";
        WebGPUTextureFormat["rgb10a2unorm"] = "rgb10a2unorm";
        WebGPUTextureFormat["rg11b10ufloat"] = "rg11b10ufloat";
        WebGPUTextureFormat["rg32uint"] = "rg32uint";
        WebGPUTextureFormat["rg32sint"] = "rg32sint";
        WebGPUTextureFormat["rg32float"] = "rg32float";
        WebGPUTextureFormat["rgba16uint"] = "rgba16uint";
        WebGPUTextureFormat["rgba16sint"] = "rgba16sint";
        WebGPUTextureFormat["rgba16float"] = "rgba16float";
        WebGPUTextureFormat["rgba32uint"] = "rgba32uint";
        WebGPUTextureFormat["rgba32sint"] = "rgba32sint";
        WebGPUTextureFormat["rgba32float"] = "rgba32float";
        WebGPUTextureFormat["stencil8"] = "stencil8";
        WebGPUTextureFormat["depth16unorm"] = "depth16unorm";
        WebGPUTextureFormat["depth24plus"] = "depth24plus";
        WebGPUTextureFormat["depth24plus_stencil8"] = "depth24plus-stencil8";
        WebGPUTextureFormat["depth32float"] = "depth32float";
        WebGPUTextureFormat["depth32float_stencil8"] = "depth32float-stencil8";
        WebGPUTextureFormat["bc1_rgba_unorm"] = "bc1-rgba-unorm";
        WebGPUTextureFormat["bc1_rgba_unorm_srgb"] = "bc1-rgba-unorm-srgb";
        WebGPUTextureFormat["bc2_rgba_unorm"] = "bc2-rgba-unorm";
        WebGPUTextureFormat["bc2_rgba_unorm_srgb"] = "bc2-rgba-unorm-srgb";
        WebGPUTextureFormat["bc3_rgba_unorm"] = "bc3-rgba-unorm";
        WebGPUTextureFormat["bc3_rgba_unorm_srgb"] = "bc3-rgba-unorm-srgb";
        WebGPUTextureFormat["bc4_r_unorm"] = "bc4-r-unorm";
        WebGPUTextureFormat["bc4_r_snorm"] = "bc4-r-snorm";
        WebGPUTextureFormat["bc5_rg_unorm"] = "bc5-rg-unorm";
        WebGPUTextureFormat["bc5_rg_snorm"] = "bc5-rg-snorm";
        WebGPUTextureFormat["bc6h_rgb_ufloat"] = "bc6h-rgb-ufloat";
        WebGPUTextureFormat["bc6h_rgb_float"] = "bc6h-rgb-float";
        WebGPUTextureFormat["bc7_rgba_unorm"] = "bc7-rgba-unorm";
        WebGPUTextureFormat["bc7_rgba_unorm_srgb"] = "bc7-rgba-unorm-srgb";
        WebGPUTextureFormat["etc2_rgb8unorm"] = "etc2-rgb8unorm";
        WebGPUTextureFormat["etc2_rgb8unorm_srgb"] = "etc2-rgb8unorm-srgb";
        WebGPUTextureFormat["etc2_rgb8a1unorm"] = "etc2-rgb8a1unorm";
        WebGPUTextureFormat["etc2_rgb8a1unorm_srgb"] = "etc2-rgb8a1unorm-srgb";
        WebGPUTextureFormat["etc2_rgba8unorm"] = "etc2-rgba8unorm";
        WebGPUTextureFormat["etc2_rgba8unorm_srgb"] = "etc2-rgba8unorm-srgb";
        WebGPUTextureFormat["astc_4x4_unorm"] = "astc-4x4-unorm";
        WebGPUTextureFormat["astc_4x4_unorm_srgb"] = "astc-4x4-unorm-srgb";
        WebGPUTextureFormat["astc_5x4_unorm"] = "astc-5x4-unorm";
        WebGPUTextureFormat["astc_5x4_unorm_srgb"] = "astc-5x4-unorm-srgb";
        WebGPUTextureFormat["astc_5x5_unorm"] = "astc-5x5-unorm";
        WebGPUTextureFormat["astc_5x5_unorm_srgb"] = "astc-5x5-unorm-srgb";
        WebGPUTextureFormat["astc_6x5_unorm"] = "astc-6x5-unorm";
        WebGPUTextureFormat["astc_6x5_unorm_srgb"] = "astc-6x5-unorm-srgb";
        WebGPUTextureFormat["astc_6x6_unorm"] = "astc-6x6-unorm";
        WebGPUTextureFormat["astc_6x6_unorm_srgb"] = "astc-6x6-unorm-srgb";
        WebGPUTextureFormat["astc_8x5_unorm"] = "astc-8x5-unorm";
        WebGPUTextureFormat["astc_8x5_unorm_srgb"] = "astc-8x5-unorm-srgb";
        WebGPUTextureFormat["astc_8x6_unorm"] = "astc-8x6-unorm";
        WebGPUTextureFormat["astc_8x6_unorm_srgb"] = "astc-8x6-unorm-srgb";
        WebGPUTextureFormat["astc_8x8_unorm"] = "astc-8x8-unorm";
        WebGPUTextureFormat["astc_8x8_unorm_srgb"] = "astc-8x8-unorm-srgb";
        WebGPUTextureFormat["astc_10x5_unorm"] = "astc-10x5-unorm";
        WebGPUTextureFormat["astc_10x5_unorm_srgb"] = "astc-10x5-unorm-srgb";
        WebGPUTextureFormat["astc_10x6_unorm"] = "astc-10x6-unorm";
        WebGPUTextureFormat["astc_10x6_unorm_srgb"] = "astc-10x6-unorm-srgb";
        WebGPUTextureFormat["astc_10x8_unorm"] = "astc-10x8-unorm";
        WebGPUTextureFormat["astc_10x8_unorm_srgb"] = "astc-10x8-unorm-srgb";
        WebGPUTextureFormat["astc_10x10_unorm"] = "astc-10x10-unorm";
        WebGPUTextureFormat["astc_10x10_unorm_srgb"] = "astc-10x10-unorm-srgb";
        WebGPUTextureFormat["astc_12x10_unorm"] = "astc-12x10-unorm";
        WebGPUTextureFormat["astc_12x10_unorm_srgb"] = "astc-12x10-unorm-srgb";
        WebGPUTextureFormat["astc_12x12_unorm"] = "astc-12x12-unorm";
        WebGPUTextureFormat["astc_12x12_unorm_srgb"] = "astc-12x12-unorm-srgb";
    })(exports.WebGPUTextureFormat || (exports.WebGPUTextureFormat = {}));
    class WebGPUTextureContext {
        constructor(engine) {
            this._engine = engine;
        }
        createTexture3DInternal(dimension, width, height, depth, format, generateMipmap, sRGB, premultipliedAlpha) {
            let useSRGBExt = this.isSRGBFormat(format) || (sRGB && this.supportSRGB(format, generateMipmap));
            if (premultipliedAlpha) {
                useSRGBExt = false;
            }
            let gammaCorrection = 1.0;
            if (!useSRGBExt && sRGB) {
                gammaCorrection = 2.2;
            }
            const pixelByteSize = this._getGPUTexturePixelByteSize(format);
            const gpuTextureFormat = this._getGPUTextureFormat(format, useSRGBExt);
            const textureDescriptor = this._getGPUTextureDescriptor(dimension, width, height, gpuTextureFormat, depth, generateMipmap, 1, this.isCompressTexture(format));
            if (generateMipmap)
                textureDescriptor.mipLevelCount = 1 + Math.log2(Math.max(width, height)) | 0;
            textureDescriptor.label = 'texture array';
            const gpuTexture = this._engine.getDevice().createTexture(textureDescriptor);
            const internalTex = new WebGPUInternalTex(width, height, depth, dimension, generateMipmap, 1, useSRGBExt, gammaCorrection);
            internalTex.resource = gpuTexture;
            internalTex._webGPUFormat = gpuTextureFormat;
            internalTex.gpuMemory = (width * height * depth * pixelByteSize * (generateMipmap ? 1.33333 : 1)) | 0;
            WebGPUGlobal.action(internalTex, 'allocMemory | texture', internalTex.gpuMemory);
            return internalTex;
        }
        async setTexture3DImageData(texture, source, depth, premultiplyAlpha, invertY) {
            if (!source)
                return;
            const device = WebGPURenderEngine._instance.getDevice();
            for (let i = 0; i < depth; i++) {
                const imageBitmapSource = await createImageBitmap(source[i]);
                const image = { source: imageBitmapSource, flipY: invertY, origin: [0, 0] };
                const textureCopyView = {
                    texture: texture.resource,
                    origin: {
                        x: 0,
                        y: 0,
                    },
                    mipLevel: 0,
                    premultipliedAlpha: premultiplyAlpha,
                    colorSpace: texture.useSRGBLoad ? "srgb" : undefined,
                };
                const copySize = { width: source[i].width, height: source[i].height, depthOrArrayLayers: i };
                device.queue.copyExternalImageToTexture(image, textureCopyView, copySize);
            }
            if (texture.mipmap)
                genMipmap(device, texture.resource);
        }
        setTexture3DPixelsData(texture, source, depth, premultiplyAlpha, invertY) {
            if (!source)
                return;
            const imageCopy = {
                texture: texture.resource,
                mipLevel: 0,
                premultipliedAlpha: premultiplyAlpha
            };
            const block = this._getBlockInformationFromFormat(texture._webGPUFormat);
            const bytesPerRow = Math.ceil(texture.width / block.width) * block.length;
            const height = texture.height;
            const dataLayout = {
                offset: 0,
                bytesPerRow: bytesPerRow,
                rowsPerImage: height
            };
            const size = {
                width: Math.ceil(texture.width / block.width) * block.width,
                height: Math.ceil(height / block.height) * block.height,
                depthOrArrayLayers: depth
            };
            const device = WebGPURenderEngine._instance.getDevice();
            device.queue.writeTexture(imageCopy, source.buffer, dataLayout, size);
            if (premultiplyAlpha)
                doPremultiplyAlpha(device, texture, 0, 0, texture.width, texture.height);
            if (texture.mipmap)
                genMipmap(device, texture.resource);
        }
        setTexture3DSubPixelsData(texture, source, mipmapLevel, generateMipmap, xOffset, yOffset, zOffset, width, height, depth, premultiplyAlpha, invertY) {
            if (!source)
                return;
            const imageCopy = {
                texture: texture.resource,
                mipLevel: mipmapLevel,
                premultipliedAlpha: premultiplyAlpha,
                origin: {
                    x: xOffset,
                    y: yOffset,
                    z: zOffset,
                },
            };
            const block = this._getBlockInformationFromFormat(texture._webGPUFormat);
            const bytesPerRow = Math.ceil(width / block.width) * block.length;
            const dataLayout = {
                offset: 0,
                bytesPerRow: bytesPerRow,
                rowsPerImage: height
            };
            const size = {
                width: Math.ceil(width / block.width) * block.width,
                height: Math.ceil(height / block.height) * block.height,
                depthOrArrayLayers: depth
            };
            const device = WebGPURenderEngine._instance.getDevice();
            device.queue.writeTexture(imageCopy, source.buffer, dataLayout, size);
            if (premultiplyAlpha)
                doPremultiplyAlpha(device, texture, xOffset, yOffset, width, height);
            if (generateMipmap)
                genMipmap(device, texture.resource);
        }
        _getGPUTexturePixelByteSize(format) {
            switch (format) {
                case Laya.TextureFormat.R5G6B5:
                    return 2;
                case Laya.TextureFormat.R8G8B8:
                    return 3;
                case Laya.TextureFormat.R8G8B8A8:
                    return 4;
                case Laya.TextureFormat.R32G32B32:
                    return 12;
                case Laya.TextureFormat.R32G32B32A32:
                    return 16;
                case Laya.TextureFormat.R16G16B16:
                    return 6;
                case Laya.TextureFormat.R16G16B16A16:
                    return 8;
                default:
                    return 4;
            }
        }
        _getGPURenderTexturePixelByteSize(format) {
            switch (format) {
                case Laya.RenderTargetFormat.R8G8B8:
                    return 3;
                case Laya.RenderTargetFormat.R8G8B8A8:
                    return 4;
                case Laya.RenderTargetFormat.R32G32B32:
                    return 12;
                case Laya.RenderTargetFormat.R32G32B32A32:
                    return 16;
                case Laya.RenderTargetFormat.R16G16B16:
                    return 6;
                case Laya.RenderTargetFormat.R16G16B16A16:
                    return 8;
                case Laya.RenderTargetFormat.DEPTH_16:
                    return 2;
                case Laya.RenderTargetFormat.DEPTH_32:
                    return 4;
                case Laya.RenderTargetFormat.DEPTHSTENCIL_24_8:
                    return 4;
                case Laya.RenderTargetFormat.DEPTHSTENCIL_24_Plus:
                    return 4;
                case Laya.RenderTargetFormat.STENCIL_8:
                    return 1;
                default:
                    return 4;
            }
        }
        _getGPUTextureFormat(format, useSRGB) {
            let webgpuTextureFormat = exports.WebGPUTextureFormat.rgba8uint;
            switch (format) {
                case Laya.TextureFormat.R5G6B5:
                    return null;
                case Laya.TextureFormat.R8G8B8:
                case Laya.TextureFormat.R8G8B8A8:
                    webgpuTextureFormat = !useSRGB ? exports.WebGPUTextureFormat.rgba8unorm : exports.WebGPUTextureFormat.rgba8unorm_srgb;
                    break;
                case Laya.TextureFormat.R32G32B32:
                case Laya.TextureFormat.R32G32B32A32:
                    webgpuTextureFormat = exports.WebGPUTextureFormat.rgba32float;
                    break;
                case Laya.TextureFormat.R16G16B16:
                case Laya.TextureFormat.R16G16B16A16:
                    webgpuTextureFormat = exports.WebGPUTextureFormat.rgba16float;
                    break;
                case Laya.TextureFormat.DXT1:
                    webgpuTextureFormat = !useSRGB ? exports.WebGPUTextureFormat.bc1_rgba_unorm : exports.WebGPUTextureFormat.bc1_rgba_unorm_srgb;
                    break;
                case Laya.TextureFormat.DXT3:
                    webgpuTextureFormat = !useSRGB ? exports.WebGPUTextureFormat.bc2_rgba_unorm : exports.WebGPUTextureFormat.bc2_rgba_unorm_srgb;
                    break;
                case Laya.TextureFormat.DXT5:
                    webgpuTextureFormat = !useSRGB ? exports.WebGPUTextureFormat.bc3_rgba_unorm : exports.WebGPUTextureFormat.bc3_rgba_unorm_srgb;
                    break;
                case Laya.TextureFormat.ETC2RGBA:
                    webgpuTextureFormat = exports.WebGPUTextureFormat.etc2_rgba8unorm;
                    break;
                case Laya.TextureFormat.ETC2RGB:
                    webgpuTextureFormat = exports.WebGPUTextureFormat.etc2_rgb8unorm;
                    break;
                case Laya.TextureFormat.ETC2SRGB:
                    webgpuTextureFormat = exports.WebGPUTextureFormat.etc2_rgb8unorm_srgb;
                    break;
                case Laya.TextureFormat.ETC2SRGB_Alpha8:
                    webgpuTextureFormat = exports.WebGPUTextureFormat.etc2_rgba8unorm_srgb;
                    break;
                case Laya.TextureFormat.ETC2RGB_Alpha1:
                    webgpuTextureFormat = exports.WebGPUTextureFormat.etc2_rgb8a1unorm;
                    break;
                case Laya.TextureFormat.ETC2SRGB_Alpha1:
                    webgpuTextureFormat = exports.WebGPUTextureFormat.etc2_rgb8a1unorm_srgb;
                    break;
                case Laya.TextureFormat.ASTC4x4:
                case Laya.TextureFormat.ASTC4x4SRGB:
                    webgpuTextureFormat = !useSRGB ? exports.WebGPUTextureFormat.astc_4x4_unorm : exports.WebGPUTextureFormat.astc_4x4_unorm_srgb;
                    break;
                case Laya.TextureFormat.ASTC6x6:
                case Laya.TextureFormat.ASTC6x6SRGB:
                    webgpuTextureFormat = !useSRGB ? exports.WebGPUTextureFormat.astc_6x6_unorm : exports.WebGPUTextureFormat.astc_6x6_unorm_srgb;
                    break;
                case Laya.TextureFormat.ASTC8x8:
                case Laya.TextureFormat.ASTC8x8SRGB:
                    webgpuTextureFormat = !useSRGB ? exports.WebGPUTextureFormat.astc_8x8_unorm : exports.WebGPUTextureFormat.astc_8x8_unorm_srgb;
                    break;
                case Laya.TextureFormat.ASTC10x10:
                case Laya.TextureFormat.ASTC10x10SRGB:
                    webgpuTextureFormat = !useSRGB ? exports.WebGPUTextureFormat.astc_10x10_unorm : exports.WebGPUTextureFormat.astc_10x10_unorm_srgb;
                    break;
                case Laya.TextureFormat.ASTC12x12:
                case Laya.TextureFormat.ASTC12x12SRGB:
                    webgpuTextureFormat = !useSRGB ? exports.WebGPUTextureFormat.astc_12x12_unorm : exports.WebGPUTextureFormat.astc_12x12_unorm_srgb;
                    break;
                default:
                    throw "unknow TextureFormat";
            }
            return webgpuTextureFormat;
        }
        _getGPURenderTargetFormat(format, useSRGB) {
            let webgpuTextureFormat = exports.WebGPUTextureFormat.rgba8uint;
            switch (format) {
                case Laya.RenderTargetFormat.R8G8B8:
                case Laya.RenderTargetFormat.R8G8B8A8:
                    webgpuTextureFormat = !useSRGB ? exports.WebGPUTextureFormat.bgra8unorm : exports.WebGPUTextureFormat.bgra8unorm_srgb;
                    break;
                case Laya.RenderTargetFormat.R32G32B32:
                case Laya.RenderTargetFormat.R32G32B32A32:
                    webgpuTextureFormat = exports.WebGPUTextureFormat.rgba32float;
                    break;
                case Laya.RenderTargetFormat.R16G16B16:
                case Laya.RenderTargetFormat.R16G16B16A16:
                    webgpuTextureFormat = exports.WebGPUTextureFormat.rgba16float;
                    break;
                case Laya.RenderTargetFormat.DEPTH_16:
                    webgpuTextureFormat = exports.WebGPUTextureFormat.depth16unorm;
                    break;
                case Laya.RenderTargetFormat.DEPTH_32:
                    webgpuTextureFormat = exports.WebGPUTextureFormat.depth32float;
                    break;
                case Laya.RenderTargetFormat.DEPTHSTENCIL_24_8:
                    webgpuTextureFormat = exports.WebGPUTextureFormat.depth24plus_stencil8;
                    break;
                case Laya.RenderTargetFormat.DEPTHSTENCIL_24_Plus:
                    webgpuTextureFormat = exports.WebGPUTextureFormat.depth24plus;
                    break;
                case Laya.RenderTargetFormat.STENCIL_8:
                    webgpuTextureFormat = exports.WebGPUTextureFormat.stencil8;
                    break;
                default:
                    throw "unknow TextureFormat";
            }
            return webgpuTextureFormat;
        }
        isCompressTexture(format) {
            switch (format) {
                case Laya.TextureFormat.DXT1:
                case Laya.TextureFormat.DXT3:
                case Laya.TextureFormat.DXT5:
                case Laya.TextureFormat.ETC2RGBA:
                case Laya.TextureFormat.ETC1RGB:
                case Laya.TextureFormat.ETC2RGB:
                case Laya.TextureFormat.ETC2SRGB:
                case Laya.TextureFormat.ETC2SRGB_Alpha8:
                case Laya.TextureFormat.ASTC4x4:
                case Laya.TextureFormat.ASTC4x4SRGB:
                case Laya.TextureFormat.ASTC6x6:
                case Laya.TextureFormat.ASTC6x6SRGB:
                case Laya.TextureFormat.ASTC8x8:
                case Laya.TextureFormat.ASTC8x8SRGB:
                case Laya.TextureFormat.ASTC10x10:
                case Laya.TextureFormat.ASTC10x10SRGB:
                case Laya.TextureFormat.ASTC12x12:
                case Laya.TextureFormat.ASTC12x12SRGB:
                    return true;
                default:
                    return false;
            }
        }
        getFormatPixelsParams(format) {
            let formatParams = {
                channels: 0,
                bytesPerPixel: 0,
                dataTypedCons: Uint8Array,
                typedSize: 1
            };
            switch (format) {
                case Laya.TextureFormat.R8G8B8A8:
                    formatParams.channels = 4;
                    formatParams.bytesPerPixel = 4;
                    formatParams.dataTypedCons = Uint8Array;
                    formatParams.typedSize = 1;
                    return formatParams;
                case Laya.TextureFormat.R8G8B8:
                    formatParams.channels = 3;
                    formatParams.bytesPerPixel = 3;
                    formatParams.dataTypedCons = Uint8Array;
                    formatParams.typedSize = 1;
                    return formatParams;
                case Laya.TextureFormat.R5G6B5:
                    formatParams.channels = 3;
                    formatParams.bytesPerPixel = 2;
                    formatParams.dataTypedCons = Uint16Array;
                    formatParams.typedSize = 2;
                    return formatParams;
                case Laya.TextureFormat.R16G16B16:
                    formatParams.channels = 3;
                    formatParams.bytesPerPixel = 6;
                    formatParams.dataTypedCons = Uint16Array;
                    formatParams.typedSize = 2;
                    return formatParams;
                case Laya.TextureFormat.R16G16B16A16:
                    formatParams.channels = 4;
                    formatParams.bytesPerPixel = 8;
                    formatParams.dataTypedCons = Uint16Array;
                    formatParams.typedSize = 2;
                    return formatParams;
                case Laya.TextureFormat.R32G32B32:
                    formatParams.channels = 3;
                    formatParams.bytesPerPixel = 12;
                    formatParams.dataTypedCons = Float32Array;
                    formatParams.typedSize = 4;
                    return formatParams;
                case Laya.TextureFormat.R32G32B32A32:
                    formatParams.channels = 4;
                    formatParams.bytesPerPixel = 16;
                    formatParams.dataTypedCons = Float32Array;
                    formatParams.typedSize = 4;
                    return formatParams;
                default:
                    return formatParams;
            }
        }
        _getGPUTextureDescriptor(dimension, width, height, gpuFormat, layerCount, generateMipmap, multiSamples, isCompressTexture) {
            const textureSize = {
                width: width,
                height: height,
                depthOrArrayLayers: layerCount,
            };
            const canCopy = !isCompressTexture;
            let usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST;
            const mipLevelCount = generateMipmap ? Math.max(Math.ceil(Math.log2(width)) + 1, Math.ceil(Math.log2(height)) + 1) : 1;
            if (canCopy)
                usage |= GPUTextureUsage.RENDER_ATTACHMENT;
            let dimensionType;
            switch (dimension) {
                case Laya.TextureDimension.Tex2D:
                case Laya.TextureDimension.Cube:
                case Laya.TextureDimension.Texture2DArray:
                    dimensionType = exports.WebGPUTextureDimension.D2D;
                    break;
                case Laya.TextureDimension.Tex3D:
                    dimensionType = exports.WebGPUTextureDimension.D3D;
                    break;
                default:
                    throw "DimensionType Unknown format";
            }
            const textureDescriptor = {
                size: textureSize,
                mipLevelCount,
                sampleCount: multiSamples,
                dimension: dimensionType,
                format: gpuFormat,
                usage,
            };
            return textureDescriptor;
        }
        createTextureInternal(dimension, width, height, format, generateMipmap, sRGB, premultipliedAlpha) {
            let layerCount;
            switch (dimension) {
                case Laya.TextureDimension.Tex2D:
                    layerCount = 1;
                    break;
                case Laya.TextureDimension.Cube:
                    layerCount = 6;
                    break;
            }
            if (dimension === Laya.TextureDimension.Tex3D) {
                throw "error";
            }
            let useSRGBExt = this.isSRGBFormat(format) || (sRGB && this.supportSRGB(format, generateMipmap));
            if (premultipliedAlpha) {
                useSRGBExt = false;
            }
            let gammaCorrection = 1.0;
            if (!useSRGBExt && sRGB) {
                gammaCorrection = 2.2;
            }
            const pixelByteSize = this._getGPUTexturePixelByteSize(format);
            const gpuTextureFormat = this._getGPUTextureFormat(format, useSRGBExt);
            const textureDescriptor = this._getGPUTextureDescriptor(dimension, width, height, gpuTextureFormat, layerCount, generateMipmap, 1, this.isCompressTexture(format));
            if (generateMipmap)
                textureDescriptor.mipLevelCount = 1 + Math.log2(Math.max(width, height)) | 0;
            layerCount === 6 ? textureDescriptor.label = 'textureCube' : textureDescriptor.label = 'texture';
            const gpuTexture = this._engine.getDevice().createTexture(textureDescriptor);
            const internalTex = new WebGPUInternalTex(width, height, 1, dimension, generateMipmap, 1, useSRGBExt, gammaCorrection);
            internalTex.resource = gpuTexture;
            internalTex._webGPUFormat = gpuTextureFormat;
            internalTex.gpuMemory = (width * height * pixelByteSize * (generateMipmap ? 1.33333 : 1)) | 0;
            WebGPUGlobal.action(internalTex, 'allocMemory | texture', internalTex.gpuMemory);
            return internalTex;
        }
        async setTextureImageData(texture, source, premultiplyAlpha, invertY) {
            if (!source)
                return;
            const imageBitmapSource = await createImageBitmap(source);
            const image = { source: imageBitmapSource, flipY: invertY, origin: [0, 0] };
            const textureCopyView = {
                texture: texture.resource,
                origin: {
                    x: 0,
                    y: 0,
                },
                mipLevel: 0,
                premultipliedAlpha: premultiplyAlpha,
                colorSpace: texture.useSRGBLoad ? "srgb" : undefined,
            };
            const copySize = { width: source.width, height: source.height };
            const device = WebGPURenderEngine._instance.getDevice();
            device.queue.copyExternalImageToTexture(image, textureCopyView, copySize);
            if (texture.mipmap)
                genMipmap(device, texture.resource);
        }
        setTextureSubImageData(texture, source, x, y, premultiplyAlpha, invertY) {
            if (!source)
                return;
            const image = { source: source, flipY: invertY, origin: { x: 0, y: 0 } };
            const textureCopyView = {
                texture: texture.resource,
                origin: {
                    x: x,
                    y: y,
                },
                mipLevel: 0,
                premultipliedAlpha: premultiplyAlpha,
                colorSpace: texture.useSRGBLoad ? "srgb" : undefined
            };
            const copySize = { width: source.width, height: source.height };
            WebGPURenderEngine._instance.getDevice().queue.copyExternalImageToTexture(image, textureCopyView, copySize);
        }
        _getBlockInformationFromFormat(format) {
            switch (format) {
                case exports.WebGPUTextureFormat.r8unorm:
                case exports.WebGPUTextureFormat.r8snorm:
                case exports.WebGPUTextureFormat.r8uint:
                case exports.WebGPUTextureFormat.r8sint:
                    return { width: 1, height: 1, length: 1 };
                case exports.WebGPUTextureFormat.r16uint:
                case exports.WebGPUTextureFormat.r16sint:
                case exports.WebGPUTextureFormat.r16float:
                case exports.WebGPUTextureFormat.rg8unorm:
                case exports.WebGPUTextureFormat.rg8snorm:
                case exports.WebGPUTextureFormat.rg8uint:
                case exports.WebGPUTextureFormat.rg8sint:
                    return { width: 1, height: 1, length: 2 };
                case exports.WebGPUTextureFormat.r32uint:
                case exports.WebGPUTextureFormat.r32sint:
                case exports.WebGPUTextureFormat.r32float:
                case exports.WebGPUTextureFormat.rg16uint:
                case exports.WebGPUTextureFormat.rg16sint:
                case exports.WebGPUTextureFormat.rg16float:
                case exports.WebGPUTextureFormat.rgba8unorm:
                case exports.WebGPUTextureFormat.rgba8unorm_srgb:
                case exports.WebGPUTextureFormat.rgba8snorm:
                case exports.WebGPUTextureFormat.rgba8uint:
                case exports.WebGPUTextureFormat.rgba8sint:
                case exports.WebGPUTextureFormat.bgra8unorm:
                case exports.WebGPUTextureFormat.bgra8unorm_srgb:
                case exports.WebGPUTextureFormat.rgb9e5ufloat:
                case exports.WebGPUTextureFormat.rgb10a2unorm:
                case exports.WebGPUTextureFormat.rg11b10ufloat:
                    return { width: 1, height: 1, length: 4 };
                case exports.WebGPUTextureFormat.rg32uint:
                case exports.WebGPUTextureFormat.rg32sint:
                case exports.WebGPUTextureFormat.rg32float:
                case exports.WebGPUTextureFormat.rgba16uint:
                case exports.WebGPUTextureFormat.rgba16sint:
                case exports.WebGPUTextureFormat.rgba16float:
                    return { width: 1, height: 1, length: 8 };
                case exports.WebGPUTextureFormat.rgba32uint:
                case exports.WebGPUTextureFormat.rgba32sint:
                case exports.WebGPUTextureFormat.rgba32float:
                    return { width: 1, height: 1, length: 16 };
                case exports.WebGPUTextureFormat.stencil8:
                    throw "No fixed size for Stencil8 format!";
                case exports.WebGPUTextureFormat.depth16unorm:
                    return { width: 1, height: 1, length: 2 };
                case exports.WebGPUTextureFormat.depth24plus:
                    throw "No fixed size for Depth24Plus format!";
                case exports.WebGPUTextureFormat.depth24plus_stencil8:
                    return { width: 1, height: 1, length: 4 };
                case exports.WebGPUTextureFormat.depth32float:
                    return { width: 1, height: 1, length: 4 };
                case exports.WebGPUTextureFormat.depth32float_stencil8:
                    return { width: 1, height: 1, length: 5 };
                case exports.WebGPUTextureFormat.bc7_rgba_unorm:
                case exports.WebGPUTextureFormat.bc7_rgba_unorm_srgb:
                case exports.WebGPUTextureFormat.bc6h_rgb_float:
                case exports.WebGPUTextureFormat.bc6h_rgb_ufloat:
                case exports.WebGPUTextureFormat.bc5_rg_unorm:
                case exports.WebGPUTextureFormat.bc5_rg_snorm:
                case exports.WebGPUTextureFormat.bc3_rgba_unorm:
                case exports.WebGPUTextureFormat.bc3_rgba_unorm_srgb:
                case exports.WebGPUTextureFormat.bc2_rgba_unorm:
                case exports.WebGPUTextureFormat.bc2_rgba_unorm_srgb:
                    return { width: 4, height: 4, length: 16 };
                case exports.WebGPUTextureFormat.bc4_r_unorm:
                case exports.WebGPUTextureFormat.bc4_r_snorm:
                case exports.WebGPUTextureFormat.bc1_rgba_unorm:
                case exports.WebGPUTextureFormat.bc1_rgba_unorm_srgb:
                    return { width: 4, height: 4, length: 8 };
                case exports.WebGPUTextureFormat.etc2_rgb8unorm:
                case exports.WebGPUTextureFormat.etc2_rgb8unorm_srgb:
                case exports.WebGPUTextureFormat.etc2_rgb8a1unorm:
                case exports.WebGPUTextureFormat.etc2_rgb8a1unorm_srgb:
                    return { width: 4, height: 4, length: 8 };
                case exports.WebGPUTextureFormat.etc2_rgb8unorm:
                case exports.WebGPUTextureFormat.etc2_rgba8unorm_srgb:
                    return { width: 4, height: 4, length: 16 };
                case exports.WebGPUTextureFormat.astc_4x4_unorm:
                case exports.WebGPUTextureFormat.astc_4x4_unorm_srgb:
                    return { width: 4, height: 4, length: 16 };
                case exports.WebGPUTextureFormat.astc_5x4_unorm:
                case exports.WebGPUTextureFormat.astc_5x4_unorm_srgb:
                    return { width: 5, height: 4, length: 16 };
                case exports.WebGPUTextureFormat.astc_5x5_unorm:
                case exports.WebGPUTextureFormat.astc_5x5_unorm_srgb:
                    return { width: 5, height: 5, length: 16 };
                case exports.WebGPUTextureFormat.astc_6x5_unorm:
                case exports.WebGPUTextureFormat.astc_6x5_unorm_srgb:
                    return { width: 6, height: 5, length: 16 };
                case exports.WebGPUTextureFormat.astc_6x6_unorm:
                case exports.WebGPUTextureFormat.astc_6x6_unorm_srgb:
                    return { width: 6, height: 6, length: 16 };
                case exports.WebGPUTextureFormat.astc_8x5_unorm:
                case exports.WebGPUTextureFormat.astc_8x5_unorm_srgb:
                    return { width: 8, height: 5, length: 16 };
                case exports.WebGPUTextureFormat.astc_8x6_unorm:
                case exports.WebGPUTextureFormat.astc_8x6_unorm_srgb:
                    return { width: 8, height: 6, length: 16 };
                case exports.WebGPUTextureFormat.astc_8x8_unorm:
                case exports.WebGPUTextureFormat.astc_8x8_unorm_srgb:
                    return { width: 8, height: 8, length: 16 };
                case exports.WebGPUTextureFormat.astc_10x5_unorm:
                case exports.WebGPUTextureFormat.astc_10x5_unorm_srgb:
                    return { width: 10, height: 5, length: 16 };
                case exports.WebGPUTextureFormat.astc_10x6_unorm:
                case exports.WebGPUTextureFormat.astc_10x6_unorm_srgb:
                    return { width: 10, height: 6, length: 16 };
                case exports.WebGPUTextureFormat.astc_10x8_unorm:
                case exports.WebGPUTextureFormat.astc_10x8_unorm_srgb:
                    return { width: 10, height: 8, length: 16 };
                case exports.WebGPUTextureFormat.astc_10x10_unorm:
                case exports.WebGPUTextureFormat.astc_10x10_unorm_srgb:
                    return { width: 10, height: 10, length: 16 };
                case exports.WebGPUTextureFormat.astc_12x10_unorm:
                case exports.WebGPUTextureFormat.astc_12x10_unorm_srgb:
                    return { width: 12, height: 10, length: 16 };
                case exports.WebGPUTextureFormat.astc_12x12_unorm:
                case exports.WebGPUTextureFormat.astc_12x12_unorm_srgb:
                    return { width: 12, height: 12, length: 16 };
            }
            return { width: 1, height: 1, length: 4 };
        }
        setTexturePixelsData(texture, source, premultiplyAlpha, invertY) {
            if (!source)
                return;
            if (texture._webGPUFormat === 'depth32float')
                debugger;
            const imageCopy = {
                texture: texture.resource,
                mipLevel: 0,
                premultipliedAlpha: premultiplyAlpha,
            };
            const block = this._getBlockInformationFromFormat(texture._webGPUFormat);
            const bytesPerRow = Math.ceil(texture.width / block.width) * block.length;
            const height = texture.height;
            const dataLayout = {
                offset: 0,
                bytesPerRow: bytesPerRow,
                rowsPerImage: height
            };
            const size = {
                width: Math.ceil(texture.width / block.width) * block.width,
                height: Math.ceil(height / block.height) * block.height,
            };
            const device = WebGPURenderEngine._instance.getDevice();
            device.queue.writeTexture(imageCopy, source.buffer, dataLayout, size);
            if (premultiplyAlpha)
                doPremultiplyAlpha(device, texture, 0, 0, texture.width, texture.height);
            if (texture.mipmap)
                genMipmap(device, texture.resource);
        }
        setTextureSubPixelsData(texture, source, mipmapLevel, generateMipmap, xOffset, yOffset, width, height, premultiplyAlpha, invertY) {
            if (!source)
                return;
            const imageCopy = {
                texture: texture.resource,
                mipLevel: mipmapLevel,
                premultipliedAlpha: premultiplyAlpha,
                origin: {
                    x: xOffset,
                    y: yOffset,
                },
            };
            const block = this._getBlockInformationFromFormat(texture._webGPUFormat);
            const bytesPerRow = Math.ceil(width / block.width) * block.length;
            const dataLayout = {
                offset: 0,
                bytesPerRow: bytesPerRow,
                rowsPerImage: height
            };
            const size = {
                width: Math.ceil(width / block.width) * block.width,
                height: Math.ceil(height / block.height) * block.height,
            };
            const device = WebGPURenderEngine._instance.getDevice();
            device.queue.writeTexture(imageCopy, source.buffer, dataLayout, size);
            if (premultiplyAlpha)
                doPremultiplyAlpha(device, texture, xOffset, yOffset, width, height);
            if (generateMipmap)
                genMipmap(device, texture.resource);
        }
        setTextureDDSData(texture, ddsInfo) {
            const device = WebGPURenderEngine._instance.getDevice();
            let premultiplyAlpha = false;
            let source = ddsInfo.source;
            let dataOffset = ddsInfo.dataOffset;
            let bpp = ddsInfo.bpp;
            let blockBytes = ddsInfo.blockBytes;
            let mipmapCount = ddsInfo.mipmapCount;
            let compressed = ddsInfo.compressed;
            let width = texture.width;
            let height = texture.height;
            texture.maxMipmapLevel = mipmapCount - 1;
            let formatParams = this.getFormatPixelsParams(ddsInfo.format);
            let channelsByte = formatParams.bytesPerPixel / formatParams.channels;
            let dataTypeConstur = formatParams.dataTypedCons;
            let mipmapWidth = width;
            let mipmapHeight = height;
            for (let index = 0; index < mipmapCount; index++) {
                const block = this._getBlockInformationFromFormat(texture._webGPUFormat);
                const bytesPerRow = Math.ceil(mipmapWidth / block.width) * block.length;
                const size = {
                    width: Math.ceil(mipmapWidth / block.width) * block.width,
                    height: Math.ceil(mipmapHeight / block.height) * block.height,
                };
                const imageCopy = {
                    texture: texture.resource,
                    mipLevel: index,
                    premultipliedAlpha: premultiplyAlpha
                };
                const dataLayout = {
                    offset: 0,
                    bytesPerRow: bytesPerRow,
                    rowsPerImage: mipmapHeight
                };
                if (compressed) {
                    let dataLength = (((Math.max(4, mipmapWidth) / 4) * Math.max(4, mipmapHeight)) / 4) * blockBytes;
                    let sourceData = new Uint8Array(source, dataOffset, dataLength);
                    device.queue.writeTexture(imageCopy, sourceData, dataLayout, size);
                    dataOffset += bpp ? (mipmapWidth * mipmapHeight * (bpp / 8)) : dataLength;
                }
                else {
                    let dataLength = mipmapWidth * mipmapHeight * formatParams.channels;
                    let sourceData = new dataTypeConstur(source, dataOffset, dataLength);
                    device.queue.writeTexture(imageCopy, sourceData, dataLayout, size);
                    dataOffset += dataLength * channelsByte;
                }
                mipmapWidth = Math.max(1, mipmapWidth * 0.5);
                mipmapHeight = Math.max(1, mipmapHeight * 0.5);
            }
        }
        setTextureKTXData(texture, ktxInfo) {
            const device = WebGPURenderEngine._instance.getDevice();
            let premultipliedAlpha = false;
            let width = texture.width;
            let height = texture.height;
            let mipmapCount = ktxInfo.mipmapCount;
            texture.maxMipmapLevel = mipmapCount - 1;
            let source = ktxInfo.source;
            ktxInfo.compress;
            let mipmapWidth = width;
            let mipmapHeight = height;
            let dataOffset = ktxInfo.headerOffset + ktxInfo.bytesOfKeyValueData;
            const imageSize = new Int32Array(source, dataOffset, 1)[0];
            dataOffset += 4;
            const block = this._getBlockInformationFromFormat(texture._webGPUFormat);
            const bytesPerRow = Math.ceil(mipmapWidth / block.width) * block.length;
            const size = {
                width: Math.ceil(mipmapWidth / block.width) * block.width,
                height: Math.ceil(mipmapHeight / block.height) * block.height,
            };
            const imageCopy = {
                texture: texture.resource,
                mipLevel: 0,
                premultipliedAlpha: premultipliedAlpha
            };
            let sourceData = new Uint8Array(source, dataOffset, imageSize);
            const dataLayout = {
                offset: 0,
                bytesPerRow: bytesPerRow,
                rowsPerImage: mipmapHeight
            };
            device.queue.writeTexture(imageCopy, sourceData, dataLayout, size);
            dataOffset += imageSize;
            dataOffset += 3 - ((imageSize + 3) % 4);
            mipmapWidth = Math.max(1, mipmapWidth * 0.5);
            mipmapHeight = Math.max(1, mipmapHeight * 0.5);
            if (texture.maxMipmapLevel > 1)
                genMipmap(WebGPURenderEngine._instance.getDevice(), texture.resource);
        }
        setTextureHDRData(texture, hdrInfo) {
            const hdrPixelData = hdrInfo.readScanLine();
            this.setTexturePixelsData(texture, hdrPixelData, false, false);
        }
        setCubeImageData(texture, source, premultiplyAlpha, invertY) {
            if (!source)
                return;
            for (let index = 0; index < 6; index++) {
                const sourceData = source[index];
                if (sourceData) {
                    const image = { source: sourceData, flipY: invertY, origin: { x: 0, y: 0 } };
                    const textureCopyView = {
                        texture: texture.resource,
                        origin: {
                            x: 0,
                            y: 0,
                            z: WebGPUCubeMap[index]
                        },
                        mipLevel: 0,
                        premultipliedAlpha: premultiplyAlpha,
                        colorSpace: texture.useSRGBLoad ? "srgb" : undefined
                    };
                    const copySize = { width: sourceData.width, height: sourceData.height };
                    WebGPURenderEngine._instance.getDevice().queue.copyExternalImageToTexture(image, textureCopyView, copySize);
                }
            }
            if (premultiplyAlpha)
                doPremultiplyAlpha(WebGPURenderEngine._instance.getDevice(), texture, 0, 0, texture.width, texture.height);
            if (texture.mipmap)
                genMipmap(WebGPURenderEngine._instance.getDevice(), texture.resource);
        }
        setCubePixelsData(texture, source, premultiplyAlpha, invertY) {
            if (!source)
                return;
            for (let index = 0; index < 6; index++) {
                const sourceData = source[index];
                if (sourceData) {
                    const imageCopy = {
                        texture: texture.resource,
                        mipLevel: 0,
                        premultipliedAlpha: premultiplyAlpha,
                        origin: {
                            x: 0,
                            y: 0,
                            z: WebGPUCubeMap[index]
                        }
                    };
                    const width = texture.width;
                    const height = texture.height;
                    const block = this._getBlockInformationFromFormat(texture._webGPUFormat);
                    const bytesPerRow = Math.ceil(width / block.width) * block.length;
                    const dataLayout = {
                        offset: 0,
                        bytesPerRow: bytesPerRow,
                        rowsPerImage: height
                    };
                    const size = {
                        width: Math.ceil(width / block.width) * block.width,
                        height: Math.ceil(height / block.height) * block.height,
                        depthOrArrayLayers: 1
                    };
                    WebGPURenderEngine._instance.getDevice().queue.writeTexture(imageCopy, sourceData.buffer, dataLayout, size);
                }
            }
            if (premultiplyAlpha)
                doPremultiplyAlpha(WebGPURenderEngine._instance.getDevice(), texture, 0, 0, texture.width, texture.height);
            if (texture.mipmap)
                genMipmap(WebGPURenderEngine._instance.getDevice(), texture.resource);
        }
        setCubeSubPixelData(texture, source, mipmapLevel, generateMipmap, xOffset, yOffset, width, height, premultiplyAlpha, invertY) {
            if (!source)
                return;
            generateMipmap = generateMipmap && mipmapLevel === 0;
            for (let index = 0; index < 6; index++) {
                const sourceData = source[index];
                if (sourceData) {
                    const imageCopy = {
                        texture: texture.resource,
                        mipLevel: mipmapLevel,
                        premultipliedAlpha: premultiplyAlpha,
                        origin: {
                            x: xOffset,
                            y: yOffset,
                            z: WebGPUCubeMap[index]
                        }
                    };
                    const block = this._getBlockInformationFromFormat(texture._webGPUFormat);
                    const bytesPerRow = Math.ceil(width / block.width) * block.length;
                    const dataLayout = {
                        offset: 0,
                        bytesPerRow: bytesPerRow,
                        rowsPerImage: height
                    };
                    const size = {
                        width: Math.ceil(width / block.width) * block.width,
                        height: Math.ceil(height / block.height) * block.height,
                        depthOrArrayLayers: 1
                    };
                    WebGPURenderEngine._instance.getDevice().queue.writeTexture(imageCopy, sourceData.buffer, dataLayout, size);
                }
            }
            if (premultiplyAlpha)
                doPremultiplyAlpha(WebGPURenderEngine._instance.getDevice(), texture, xOffset, yOffset, width, height);
            if (texture.mipmap && generateMipmap)
                genMipmap(WebGPURenderEngine._instance.getDevice(), texture.resource);
        }
        setCubeKTXData(texture, ktxInfo) {
            const device = WebGPURenderEngine._instance.getDevice();
            let premultipliedAlpha = false;
            texture.maxMipmapLevel = ktxInfo.mipmapCount - 1;
            let width = texture.width;
            let height = texture.height;
            let mipmapWidth = width;
            let mipmapHeight = height;
            let dataOffset = ktxInfo.headerOffset + ktxInfo.bytesOfKeyValueData;
            let source = ktxInfo.source;
            let compressed = ktxInfo.compress;
            for (let index = 0; index < ktxInfo.mipmapCount; index++) {
                let imageSize = new Int32Array(source, dataOffset, 1)[0];
                dataOffset += 4;
                for (let face = 0; face < 6; face++) {
                    const block = this._getBlockInformationFromFormat(texture._webGPUFormat);
                    const bytesPerRow = Math.ceil(mipmapWidth / block.width) * block.length;
                    const size = {
                        width: Math.ceil(mipmapWidth / block.width) * block.width,
                        height: Math.ceil(mipmapHeight / block.height) * block.height,
                        depthOrArrayLayers: 1
                    };
                    const imageCopy = {
                        texture: texture.resource,
                        mipLevel: index,
                        premultipliedAlpha: premultipliedAlpha,
                        origin: {
                            x: 0,
                            y: 0,
                            z: face
                        }
                    };
                    const dataLayout = {
                        offset: 0,
                        bytesPerRow: bytesPerRow,
                        rowsPerImage: mipmapHeight
                    };
                    if (compressed) {
                        let sourceData = new Uint8Array(source, dataOffset, imageSize);
                        device.queue.writeTexture(imageCopy, sourceData, dataLayout, size);
                    }
                    else {
                        let pixelParams = this.getFormatPixelsParams(ktxInfo.format);
                        let typedSize = imageSize / pixelParams.typedSize;
                        let sourceData = new pixelParams.dataTypedCons(source, dataOffset, typedSize);
                        device.queue.writeTexture(imageCopy, sourceData, dataLayout, size);
                    }
                    dataOffset += imageSize;
                    dataOffset += 3 - ((imageSize + 3) % 4);
                }
                mipmapWidth = Math.max(1, mipmapWidth * 0.5);
                mipmapHeight = Math.max(1, mipmapHeight * 0.5);
            }
        }
        setCubeDDSData(texture, ddsInfo) {
            const device = WebGPURenderEngine._instance.getDevice();
            let premultiplyAlpha = false;
            let source = ddsInfo.source;
            let dataOffset = ddsInfo.dataOffset;
            let bpp = ddsInfo.bpp;
            let blockBytes = ddsInfo.blockBytes;
            let mipmapCount = ddsInfo.mipmapCount;
            let compressed = ddsInfo.compressed;
            let width = texture.width;
            let height = texture.height;
            texture.maxMipmapLevel = mipmapCount - 1;
            let formatParams = this.getFormatPixelsParams(ddsInfo.format);
            let channelsByte = formatParams.bytesPerPixel / formatParams.channels;
            let dataTypeConstur = formatParams.dataTypedCons;
            for (let face = 0; face < 6; face++) {
                let mipmapWidth = width;
                let mipmapHeight = height;
                for (let index = 0; index < mipmapCount; index++) {
                    const block = this._getBlockInformationFromFormat(texture._webGPUFormat);
                    const bytesPerRow = Math.ceil(mipmapWidth / block.width) * block.length;
                    const size = {
                        width: Math.ceil(mipmapWidth / block.width) * block.width,
                        height: Math.ceil(mipmapHeight / block.height) * block.height,
                        depthOrArrayLayers: 1
                    };
                    const imageCopy = {
                        texture: texture.resource,
                        mipLevel: index,
                        premultipliedAlpha: premultiplyAlpha,
                        origin: {
                            x: 0,
                            y: 0,
                            z: face
                        }
                    };
                    const dataLayout = {
                        offset: 0,
                        bytesPerRow: bytesPerRow,
                        rowsPerImage: mipmapHeight
                    };
                    if (compressed) {
                        let dataLength = Math.max(4, mipmapWidth) / 4 * Math.max(4, mipmapHeight) / 4 * blockBytes;
                        let sourceData = new Uint8Array(source, dataOffset, dataLength);
                        device.queue.writeTexture(imageCopy, sourceData, dataLayout, size);
                        dataOffset += bpp ? (mipmapWidth * mipmapHeight * (bpp / 8)) : dataLength;
                    }
                    else {
                        let dataLength = mipmapWidth * mipmapHeight * formatParams.channels;
                        let sourceData = new dataTypeConstur(source, dataOffset, dataLength);
                        device.queue.writeTexture(imageCopy, sourceData, dataLayout, size);
                        dataOffset += dataLength * channelsByte;
                    }
                    mipmapWidth = Math.max(1, mipmapWidth * 0.5);
                    mipmapHeight = Math.max(1, mipmapHeight * 0.5);
                }
            }
        }
        setTextureCompareMode(texture, compareMode) {
            switch (compareMode) {
                case Laya.TextureCompareMode.LEQUAL:
                    break;
                case Laya.TextureCompareMode.GEQUAL:
                    break;
                case Laya.TextureCompareMode.LESS:
                    break;
                case Laya.TextureCompareMode.GREATER:
                    break;
                case Laya.TextureCompareMode.EQUAL:
                    break;
                case Laya.TextureCompareMode.NOTEQUAL:
                    break;
                case Laya.TextureCompareMode.ALWAYS:
                    break;
                case Laya.TextureCompareMode.NEVER:
                    break;
                case Laya.TextureCompareMode.None:
            }
            return compareMode;
        }
        createRenderTextureInternal(dimension, width, height, format, generateMipmap, sRGB) {
            let multiSamples = 1;
            let gpuColorFormat = this._getGPURenderTargetFormat(format, sRGB);
            const gpuColorDescriptor = this._getGPUTextureDescriptor(dimension, width, height, gpuColorFormat, 1, generateMipmap, multiSamples, false);
            const gpuColorTexture = this._engine.getDevice().createTexture(gpuColorDescriptor);
            gpuColorDescriptor.label = 'renderTexture';
            const pixelByteSize = this._getGPURenderTexturePixelByteSize(format);
            let texture = new WebGPUInternalTex(width, height, 1, dimension, generateMipmap, multiSamples, false, 1);
            texture.resource = gpuColorTexture;
            texture._webGPUFormat = gpuColorFormat;
            texture.statisAsRenderTexture();
            texture.gpuMemory = (width * height * pixelByteSize * (generateMipmap ? 1.33333 : 1)) | 0;
            WebGPUGlobal.action(texture, 'allocMemory | texture', texture.gpuMemory);
            return texture;
        }
        isSRGBFormat(format) {
            switch (format) {
                case Laya.TextureFormat.ETC2SRGB:
                case Laya.TextureFormat.ETC2SRGB_Alpha8:
                case Laya.TextureFormat.ASTC4x4SRGB:
                case Laya.TextureFormat.ASTC6x6SRGB:
                case Laya.TextureFormat.ASTC8x8SRGB:
                case Laya.TextureFormat.ASTC10x10SRGB:
                case Laya.TextureFormat.ASTC12x12SRGB:
                    return true;
                default:
                    return false;
            }
        }
        supportSRGB(format, mipmap) {
            switch (format) {
                case Laya.TextureFormat.R8G8B8:
                    return this._engine.getCapable(Laya.RenderCapable.Texture_SRGB);
                case Laya.TextureFormat.R8G8B8A8:
                    return this._engine.getCapable(Laya.RenderCapable.Texture_SRGB);
                case Laya.TextureFormat.DXT1:
                case Laya.TextureFormat.DXT3:
                case Laya.TextureFormat.DXT5:
                    return this._engine.getCapable(Laya.RenderCapable.COMPRESS_TEXTURE_S3TC_SRGB);
                default:
                    return false;
            }
        }
        supportGenerateMipmap(format) {
            switch (format) {
                case Laya.RenderTargetFormat.DEPTH_16:
                case Laya.RenderTargetFormat.DEPTHSTENCIL_24_8:
                case Laya.RenderTargetFormat.DEPTH_32:
                case Laya.RenderTargetFormat.STENCIL_8:
                    return false;
                default:
                    return true;
            }
        }
        createRenderTargetInternal(width, height, colorFormat, depthStencilFormat, generateMipmap, sRGB, multiSamples) {
            generateMipmap = generateMipmap && this.supportGenerateMipmap(colorFormat);
            const useSRGBExt = this.isSRGBFormat(colorFormat) || (sRGB && this.supportSRGB(colorFormat, generateMipmap));
            const gammaCorrection = 1.0;
            const pixelByteSize = this._getGPURenderTexturePixelByteSize(colorFormat);
            const gpuColorFormat = this._getGPURenderTargetFormat(colorFormat, sRGB);
            const gpuColorDescriptor = this._getGPUTextureDescriptor(Laya.TextureDimension.Tex2D, width, height, gpuColorFormat, 1, generateMipmap, multiSamples, false);
            gpuColorDescriptor.usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST;
            gpuColorDescriptor.label = 'renderTarget color';
            const gpuColorTexture = this._engine.getDevice().createTexture(gpuColorDescriptor);
            const internalRT = new WebGPUInternalRT(colorFormat, depthStencilFormat, false, generateMipmap, multiSamples, useSRGBExt);
            internalRT._textures.push(new WebGPUInternalTex(width, height, 1, Laya.TextureDimension.Tex2D, generateMipmap, multiSamples, useSRGBExt, gammaCorrection));
            internalRT._textures[0].resource = gpuColorTexture;
            internalRT._textures[0]._webGPUFormat = gpuColorFormat;
            internalRT._textures[0].statisAsRenderTexture();
            internalRT._textures[0].gpuMemory = (width * height * multiSamples * pixelByteSize * (generateMipmap ? 1.33333 : 1)) | 0;
            WebGPUGlobal.action(internalRT._textures[0], 'allocMemory | texture', internalRT._textures[0].gpuMemory);
            if (multiSamples > 1) {
                const gpuColorDescriptor = this._getGPUTextureDescriptor(Laya.TextureDimension.Tex2D, width, height, gpuColorFormat, 1, generateMipmap, 1, false);
                gpuColorDescriptor.usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST;
                const gpuColorTexture = this._engine.getDevice().createTexture(gpuColorDescriptor);
                internalRT._texturesResolve.push(new WebGPUInternalTex(width, height, 1, Laya.TextureDimension.Tex2D, generateMipmap, 1, useSRGBExt, gammaCorrection));
                internalRT._texturesResolve[0].resource = gpuColorTexture;
                internalRT._texturesResolve[0]._webGPUFormat = gpuColorFormat;
                internalRT._texturesResolve[0].statisAsRenderTexture();
                internalRT._texturesResolve[0].gpuMemory = (width * height * pixelByteSize * (generateMipmap ? 1.33333 : 1)) | 0;
                WebGPUGlobal.action(internalRT._texturesResolve[0], 'allocMemory | texture', internalRT._texturesResolve[0].gpuMemory);
            }
            if (colorFormat === Laya.RenderTargetFormat.DEPTH_16
                || colorFormat === Laya.RenderTargetFormat.DEPTH_32
                || colorFormat === Laya.RenderTargetFormat.DEPTHSTENCIL_24_8) {
                depthStencilFormat = Laya.RenderTargetFormat.R8G8B8A8;
            }
            if (depthStencilFormat !== Laya.RenderTargetFormat.None) {
                const pixelByteSize = this._getGPURenderTexturePixelByteSize(depthStencilFormat);
                const gpuDepthFormat = this._getGPURenderTargetFormat(depthStencilFormat, false);
                const gpuDepthDescriptor = this._getGPUTextureDescriptor(Laya.TextureDimension.Tex2D, width, height, gpuDepthFormat, 1, generateMipmap, multiSamples, false);
                gpuDepthDescriptor.usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT;
                gpuDepthDescriptor.label = 'renderTarget depth';
                const gpuDepthTexture = this._engine.getDevice().createTexture(gpuDepthDescriptor);
                internalRT._depthTexture = new WebGPUInternalTex(width, height, 1, Laya.TextureDimension.Tex2D, false, multiSamples, false, 1);
                internalRT._depthTexture.resource = gpuDepthTexture;
                internalRT._depthTexture._webGPUFormat = gpuDepthFormat;
                internalRT._depthTexture.statisAsRenderTexture();
                internalRT._depthTexture.gpuMemory = width * height * multiSamples * pixelByteSize;
                WebGPUGlobal.action(internalRT._depthTexture, 'allocMemory | texture_depth', internalRT._depthTexture.gpuMemory);
            }
            WebGPURenderPassHelper.setColorAttachments(internalRT._renderPassDescriptor, internalRT, true);
            WebGPURenderPassHelper.setDepthAttachments(internalRT._renderPassDescriptor, internalRT, true);
            return internalRT;
        }
        createRenderTargetDepthTexture(renderTarget, dimension, width, height) {
            return renderTarget._depthTexture;
        }
        createRenderTargetCubeInternal(size, colorFormat, depthStencilFormat, generateMipmap, sRGB, multiSamples) {
            throw new Laya.NotImplementedError();
        }
        bindRenderTarget(renderTarget, faceIndex) {
            throw new Laya.NotImplementedError();
        }
        bindoutScreenTarget() {
            throw new Laya.NotImplementedError();
        }
        unbindRenderTarget(renderTarget) {
            throw new Laya.NotImplementedError();
        }
        readRenderTargetPixelData(renderTarget, xOffset, yOffset, width, height, out) {
            throw new Laya.NotImplementedError();
        }
        async readRenderTargetPixelDataAsync(renderTarget, xOffset, yOffset, width, height, out) {
            const texture = renderTarget._textures[0].resource;
            const device = this._engine.getDevice();
            switch (renderTarget.colorFormat) {
                case Laya.RenderTargetFormat.R8G8B8A8:
                    {
                        const bytesPerRow = Math.ceil(width * 4 / 256) * 256;
                        const bufferSize = bytesPerRow * height;
                        const buffer = device.createBuffer({
                            size: bufferSize,
                            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
                        });
                        const commandEncoder = device.createCommandEncoder();
                        commandEncoder.copyTextureToBuffer({ texture, origin: { x: xOffset, y: yOffset } }, { buffer, bytesPerRow }, { width, height, depthOrArrayLayers: 1 });
                        const commands = commandEncoder.finish();
                        device.queue.submit([commands]);
                        const outView = new Uint8Array(out.buffer);
                        await buffer.mapAsync(GPUMapMode.READ);
                        const arrayBuffer = buffer.getMappedRange();
                        const data = new Uint8Array(arrayBuffer);
                        for (let j = 0; j < height; j++) {
                            for (let i = 0; i < width; i++) {
                                outView[j * width * 4 + i * 4 + 0] = data[j * bytesPerRow + i * 4 + 2];
                                outView[j * width * 4 + i * 4 + 1] = data[j * bytesPerRow + i * 4 + 1];
                                outView[j * width * 4 + i * 4 + 2] = data[j * bytesPerRow + i * 4 + 0];
                                outView[j * width * 4 + i * 4 + 3] = data[j * bytesPerRow + i * 4 + 3];
                            }
                        }
                        buffer.unmap();
                        buffer.destroy();
                        return Promise.resolve(out);
                    }
                case Laya.RenderTargetFormat.R16G16B16A16:
                    {
                        const bytesPerRow = Math.ceil(width * 8 / 256) * 256;
                        const bufferSize = bytesPerRow * height;
                        const buffer = device.createBuffer({
                            size: bufferSize,
                            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
                        });
                        const commandEncoder = device.createCommandEncoder();
                        commandEncoder.copyTextureToBuffer({ texture, origin: { x: xOffset, y: yOffset } }, { buffer, bytesPerRow }, { width, height, depthOrArrayLayers: 1 });
                        const commands = commandEncoder.finish();
                        device.queue.submit([commands]);
                        const outView = new Uint16Array(out.buffer);
                        await buffer.mapAsync(GPUMapMode.READ);
                        const arrayBuffer = buffer.getMappedRange();
                        const data = new Uint16Array(arrayBuffer);
                        for (let j = 0; j < height; j++) {
                            for (let i = 0; i < width; i++) {
                                outView[j * width * 4 + i * 4 + 0] = data[j * bytesPerRow + i * 4 + 2];
                                outView[j * width * 4 + i * 4 + 1] = data[j * bytesPerRow + i * 4 + 1];
                                outView[j * width * 4 + i * 4 + 2] = data[j * bytesPerRow + i * 4 + 0];
                                outView[j * width * 4 + i * 4 + 3] = data[j * bytesPerRow + i * 4 + 3];
                            }
                        }
                        buffer.unmap();
                        buffer.destroy();
                        return Promise.resolve(out);
                    }
                case Laya.RenderTargetFormat.R32G32B32A32:
                    {
                        const bytesPerRow = Math.ceil(width * 16 / 256) * 256;
                        const bufferSize = bytesPerRow * height;
                        const buffer = device.createBuffer({
                            size: bufferSize,
                            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
                        });
                        const commandEncoder = device.createCommandEncoder();
                        commandEncoder.copyTextureToBuffer({ texture, origin: { x: xOffset, y: yOffset } }, { buffer, bytesPerRow }, { width, height, depthOrArrayLayers: 1 });
                        const commands = commandEncoder.finish();
                        device.queue.submit([commands]);
                        const outView = new Uint32Array(out.buffer);
                        await buffer.mapAsync(GPUMapMode.READ);
                        const arrayBuffer = buffer.getMappedRange();
                        const data = new Uint32Array(arrayBuffer);
                        for (let j = 0; j < height; j++) {
                            for (let i = 0; i < width; i++) {
                                outView[j * width * 4 + i * 4 + 0] = data[j * bytesPerRow + i * 4 + 2];
                                outView[j * width * 4 + i * 4 + 1] = data[j * bytesPerRow + i * 4 + 1];
                                outView[j * width * 4 + i * 4 + 2] = data[j * bytesPerRow + i * 4 + 0];
                                outView[j * width * 4 + i * 4 + 3] = data[j * bytesPerRow + i * 4 + 3];
                            }
                        }
                        buffer.unmap();
                        buffer.destroy();
                        return Promise.resolve(out);
                    }
            }
            return Promise.resolve(out);
        }
        initVideoTextureData(texture) { }
        async updateVideoTexture(texture, video, premultiplyAlpha, invertY) {
            if (!video)
                return;
            const image = { source: video, flipY: invertY, origin: [0, 0] };
            const textureCopyView = {
                texture: texture.resource,
                origin: {
                    x: 0,
                    y: 0,
                },
                mipLevel: 0,
                premultipliedAlpha: premultiplyAlpha,
                colorSpace: texture.useSRGBLoad ? "srgb" : undefined,
            };
            const copySize = { width: video.videoWidth, height: video.videoHeight };
            const device = WebGPURenderEngine._instance.getDevice();
            device.queue.copyExternalImageToTexture(image, textureCopyView, copySize);
        }
        getRenderTextureDataAsync(internalTex, x, y, width, height) {
            let bytesPerRow = 0;
            switch (internalTex.colorFormat) {
                case Laya.RenderTargetFormat.R8G8B8A8:
                    bytesPerRow = Math.ceil(width * 4 / 256) * 256;
                    break;
                case Laya.RenderTargetFormat.R16G16B16A16:
                    bytesPerRow = Math.ceil(width * 8 / 256) * 256;
                    break;
                case Laya.RenderTargetFormat.R32G32B32A32:
                    bytesPerRow = Math.ceil(width * 16 / 256) * 256;
                    break;
            }
            return this.readRenderTargetPixelDataAsync(internalTex, x, y, width, height, new Uint8Array(bytesPerRow * height));
        }
    }

    class WebGPUUniformBuffer extends Laya.UniformBufferUser {
        constructor(name, set, binding, size, manager, data) {
            super(name, size, manager, data);
            this.objectName = 'WebGPUUniformBuffer';
            this.set = set;
            this.binding = binding;
            if (manager.useBigBuffer) {
                this._gpuBuffer = this.bufferBlock.cluster.buffer;
                this._gpuBindGroupEntry = {
                    binding,
                    resource: {
                        buffer: this._gpuBuffer,
                        offset: this.bufferBlock.offset,
                        size,
                    },
                };
            }
            else {
                this._gpuBuffer = this.bufferAlone.buffer;
                this._gpuBindGroupEntry = {
                    binding,
                    resource: {
                        buffer: this._gpuBuffer,
                        offset: 0,
                        size,
                    },
                };
            }
            this.globalId = WebGPUGlobal.getId(this);
        }
        notifyGPUBufferChange() {
            super.notifyGPUBufferChange();
            this._gpuBuffer = this.bufferBlock.cluster.buffer;
            this._gpuBindGroupEntry = {
                binding: this.binding,
                resource: {
                    buffer: this._gpuBuffer,
                    offset: this.bufferBlock.offset,
                    size: this.bufferBlock.size,
                },
            };
        }
        clearGPUBufferBind() {
            this.data.clearBindGroup();
        }
        getGPUBindEntry() {
            return this._gpuBindGroupEntry;
        }
        getUniformNameStr() {
            let str = '|';
            this.items.forEach(item => str += item.name + '|');
            return str;
        }
        debugInfo() {
            if (this.itemNum > 0) {
                const typeName = (type) => {
                    if (type instanceof Int32Array)
                        return 'Init32Array';
                    if (type instanceof Float32Array)
                        return 'Float32Array';
                    return 'Unknown';
                };
                console.log("strId =", this.strId);
                this.items.forEach((item, key) => {
                    console.log("key: %d, type: %s, view: %s, offset: %d, size: %d, padding: %d, elements: %d, count: %d", key, item.type, typeName(item.view), item.view.byteOffset, item.view.byteLength, Laya.roundUp(item.view.byteLength / item.count, item.align) - item.view.BYTES_PER_ELEMENT * item.elements, item.elements, item.count);
                });
            }
        }
        destroy() {
            if (super.destroy()) {
                this._gpuBuffer = null;
                this._gpuBindGroupEntry = null;
                return true;
            }
            return false;
        }
    }

    class WebGPUShaderData extends Laya.ShaderData {
        get isShare() {
            return this._isShare;
        }
        set isShare(value) {
            this._isShare = value;
            if (this.instShaderData)
                this.instShaderData.isShare = value;
            if (this.skinShaderData)
                for (let i = this.skinShaderData.length - 1; i > -1; i--)
                    this.skinShaderData[i].isShare = value;
        }
        get isStatic() {
            return this._isStatic;
        }
        set isStatic(value) {
            this._isStatic = value;
            if (this.instShaderData)
                this.instShaderData.isStatic = value;
            if (this.skinShaderData)
                for (let i = this.skinShaderData.length - 1; i > -1; i--)
                    this.skinShaderData[i].isStatic = value;
        }
        static __init__() {
            if (!this._dummyTexture2D) {
                this._dummyTexture2D = new Laya.Texture2D(1, 1, Laya.TextureFormat.R8G8B8A8, false, true, false, false);
                const data = new Uint8Array([255, 255, 255, 255]);
                this._dummyTexture2D.setPixelsData(data, false, false);
                this._dummyTexture2D.lock = true;
            }
            if (!this._dummyTextureCube) {
                this._dummyTextureCube = new Laya.TextureCube(1, Laya.TextureFormat.R8G8B8A8, false, false, false);
                this._dummyTextureCube.lock = true;
            }
            Laya.Material.__initDefine__();
            this._stateKeyMap = new Set();
            this._stateKeyMap.add(Laya.Shader3D.BLEND);
            this._stateKeyMap.add(Laya.Shader3D.BLEND_EQUATION);
            this._stateKeyMap.add(Laya.Shader3D.BLEND_SRC);
            this._stateKeyMap.add(Laya.Shader3D.BLEND_DST);
            this._stateKeyMap.add(Laya.Shader3D.DEPTH_WRITE);
            this._stateKeyMap.add(Laya.Shader3D.DEPTH_TEST);
            this._stateKeyMap.add(Laya.Shader3D.STENCIL_TEST);
            this._stateKeyMap.add(Laya.Shader3D.STENCIL_Op);
            this._stateKeyMap.add(Laya.Shader3D.STENCIL_Ref);
            this._stateKeyMap.add(Laya.Shader3D.STENCIL_WRITE);
        }
        constructor(ownerResource = null) {
            super(ownerResource);
            this.stateKey = '';
            this._destroyed = false;
            this._bindGroupKey = '';
            this._isShare = true;
            this._isStatic = false;
            this.changeMark = 0;
            this.objectName = 'WebGPUShaderData';
            this._data = {};
            this._gammaColorMap = new Map();
            this._bindGroupMap = new Map();
            this._defineDatas = new WebDefineDatas();
            this.globalId = WebGPUGlobal.getId(this);
            WebGPUShaderData.objectCount++;
        }
        createUniformBuffer(info, single = false, inst = false) {
            if (single && this._uniformBuffer)
                return;
            if (info && info.uniform) {
                if (!this._uniformBuffer || this._infoId !== info.uniform.globalId) {
                    if (this._uniformBuffer)
                        this._uniformBuffer.destroy();
                    this._infoId = info.uniform.globalId;
                    const gpuBuffer = WebGPURenderEngine._instance.gpuBufferMgr;
                    this._uniformBuffer = new WebGPUUniformBuffer(info.name, info.set, info.binding, info.uniform.size, gpuBuffer, this);
                    for (let i = 0, len = info.uniform.items.length; i < len; i++) {
                        const uniform = info.uniform.items[i];
                        this._uniformBuffer.addUniform(uniform.propertyId, uniform.name, uniform.type, uniform.offset, uniform.align, uniform.size, uniform.element, uniform.count);
                    }
                    this._updateUniformData();
                }
            }
        }
        _updateUniformData() {
            for (const id in this._data)
                this._uniformBuffer.setUniformData(Number(id), this._data[id]);
            if (this.instShaderData)
                this.instShaderData._updateUniformData();
            if (this.skinShaderData)
                for (let i = this.skinShaderData.length - 1; i > -1; i--)
                    this.skinShaderData[i]._updateUniformData();
        }
        removeBindGroup(index) {
            if (this._bindGroupResourceSet
                && this._bindGroupResourceSet.has(index)) {
                this._bindGroupKey = '';
                this._bindGroup = null;
                this._bindGroupResourceSet = null;
                this._bindGroupLayoutEntries = null;
            }
            if (this._bindGroupMap.size > 0) {
                for (let [key, value] of this._bindGroupMap) {
                    if (value[2].has(index)) {
                        this._bindGroupMap.delete(key);
                    }
                }
            }
            if (this.instShaderData)
                this.instShaderData.removeBindGroup(index);
            if (this.skinShaderData)
                for (let i = this.skinShaderData.length - 1; i > -1; i--)
                    this.skinShaderData[i].removeBindGroup(index);
        }
        clearBindGroup() {
            this._bindGroupMap.clear();
            this._bindGroupKey = '';
            this._bindGroup = null;
            this._bindGroupResourceSet = null;
            this._bindGroupLayoutEntries = null;
            if (this.instShaderData)
                this.instShaderData.clearBindGroup();
            if (this.skinShaderData)
                for (let i = this.skinShaderData.length - 1; i > -1; i--)
                    this.skinShaderData[i].clearBindGroup();
        }
        createBindGroupLayoutEntry(info) {
            var _a, _b;
            const bindGroupLayoutEntries = [];
            let internalTex;
            for (const item of info) {
                switch (item.type) {
                    case exports.WebGPUBindingInfoType.buffer:
                        if (item.uniform) {
                            bindGroupLayoutEntries.push({
                                binding: item.binding,
                                visibility: item.visibility,
                                buffer: item.buffer,
                            });
                        }
                        break;
                    case exports.WebGPUBindingInfoType.texture:
                        if (item.texture) {
                            let texture = (_a = this.getTexture(item.propertyId)) !== null && _a !== void 0 ? _a : WebGPUShaderData._dummyTexture2D;
                            if (item.texture.viewDimension === 'cube' && texture === WebGPUShaderData._dummyTexture2D)
                                texture = WebGPUShaderData._dummyTextureCube;
                            if (texture instanceof WebGPUInternalTex)
                                internalTex = texture;
                            else
                                internalTex = texture._texture;
                            if (!internalTex) {
                                texture = WebGPUShaderData._dummyTexture2D;
                                internalTex = texture._texture;
                            }
                            if (internalTex.compareMode > 0)
                                item.texture.sampleType = 'depth';
                            else if (internalTex._webGPUFormat === exports.WebGPUTextureFormat.depth16unorm
                                || internalTex._webGPUFormat === exports.WebGPUTextureFormat.depth24plus_stencil8
                                || internalTex._webGPUFormat === exports.WebGPUTextureFormat.depth32float) {
                                item.texture.sampleType = 'unfilterable-float';
                            }
                            else {
                                const supportFloatLinearFiltering = Laya.LayaGL.renderEngine.getCapable(Laya.RenderCapable.Texture_FloatLinearFiltering);
                                if (!supportFloatLinearFiltering && texture.format === Laya.TextureFormat.R32G32B32A32)
                                    item.texture.sampleType = 'unfilterable-float';
                                else
                                    item.texture.sampleType = 'float';
                            }
                            bindGroupLayoutEntries.push({
                                binding: item.binding,
                                visibility: item.visibility,
                                texture: item.texture,
                            });
                        }
                        break;
                    case exports.WebGPUBindingInfoType.sampler:
                        if (item.sampler) {
                            let texture = (_b = this.getTexture(item.propertyId)) !== null && _b !== void 0 ? _b : WebGPUShaderData._dummyTexture2D;
                            if (texture instanceof WebGPUInternalTex)
                                internalTex = texture;
                            else
                                internalTex = texture._texture;
                            if (!internalTex) {
                                texture = WebGPUShaderData._dummyTexture2D;
                                internalTex = texture._texture;
                            }
                            if (internalTex.compareMode > 0)
                                item.sampler.type = 'comparison';
                            else if (internalTex._webGPUFormat === exports.WebGPUTextureFormat.depth16unorm
                                || internalTex._webGPUFormat === exports.WebGPUTextureFormat.depth24plus_stencil8
                                || internalTex._webGPUFormat === exports.WebGPUTextureFormat.depth32float) {
                                if (item.sampler.type !== 'non-filtering') {
                                    item.sampler.type = 'non-filtering';
                                    internalTex.filterMode = Laya.FilterMode.Point;
                                }
                            }
                            else {
                                const supportFloatLinearFiltering = Laya.LayaGL.renderEngine.getCapable(Laya.RenderCapable.Texture_FloatLinearFiltering);
                                if (!supportFloatLinearFiltering && texture.format === Laya.TextureFormat.R32G32B32A32) {
                                    if (item.sampler.type !== 'non-filtering') {
                                        item.sampler.type = 'non-filtering';
                                        internalTex.filterMode = Laya.FilterMode.Point;
                                    }
                                }
                                else if (item.sampler.type !== 'filtering') {
                                    item.sampler.type = 'filtering';
                                    internalTex.filterMode = Laya.FilterMode.Bilinear;
                                }
                            }
                            bindGroupLayoutEntries.push({
                                binding: item.binding,
                                visibility: item.visibility,
                                sampler: item.sampler,
                            });
                        }
                        break;
                }
            }
            return bindGroupLayoutEntries;
        }
        bindGroup(groupId, name, info, command, bundle) {
            const device = WebGPURenderEngine._instance.getDevice();
            let key = '';
            let bindGroup;
            let bindGroupResourceSet;
            let bindGroupLayoutEntries;
            if (this.isShare) {
                for (let i = info.length - 1; i > -1; i--)
                    key += info[i].propertyId + '_';
                if (key === this._bindGroupKey) {
                    bindGroup = this._bindGroup;
                    bindGroupResourceSet = this._bindGroupResourceSet;
                    bindGroupLayoutEntries = this._bindGroupLayoutEntries;
                }
                else {
                    const bindInfo = this._bindGroupMap.get(key);
                    bindGroup = bindInfo ? bindInfo[0] : null;
                    bindGroupLayoutEntries = bindInfo ? bindInfo[1] : null;
                    bindGroupResourceSet = bindInfo ? bindInfo[2] : null;
                }
            }
            else {
                bindGroup = this._bindGroup;
                bindGroupResourceSet = this._bindGroupResourceSet;
                bindGroupLayoutEntries = this._bindGroupLayoutEntries;
            }
            const _createBindGroupEntry = (info, bindGroupEntries, bindGroupResourceSet) => {
                var _a, _b;
                let internalTex;
                for (const item of info) {
                    switch (item.type) {
                        case exports.WebGPUBindingInfoType.buffer:
                            if (item.uniform) {
                                if (!this._uniformBuffer) {
                                    console.warn('uniformBuffer is null');
                                    bindGroupEntries.length = 0;
                                }
                                bindGroupEntries.push(this._uniformBuffer.getGPUBindEntry());
                            }
                            break;
                        case exports.WebGPUBindingInfoType.texture:
                            if (item.texture) {
                                let texture = (_a = this.getTexture(item.propertyId)) !== null && _a !== void 0 ? _a : WebGPUShaderData._dummyTexture2D;
                                if (item.texture.viewDimension === 'cube' && texture === WebGPUShaderData._dummyTexture2D)
                                    texture = WebGPUShaderData._dummyTextureCube;
                                if (texture instanceof WebGPUInternalTex)
                                    internalTex = texture;
                                else
                                    internalTex = texture._texture;
                                if (!internalTex) {
                                    texture = WebGPUShaderData._dummyTexture2D;
                                    internalTex = texture._texture;
                                }
                                bindGroupEntries.push({
                                    binding: item.binding,
                                    resource: internalTex.getTextureView(),
                                });
                                bindGroupResourceSet.add(item.propertyId);
                            }
                            break;
                        case exports.WebGPUBindingInfoType.sampler:
                            if (item.sampler) {
                                let texture = (_b = this.getTexture(item.propertyId)) !== null && _b !== void 0 ? _b : WebGPUShaderData._dummyTexture2D;
                                if (texture instanceof WebGPUInternalTex)
                                    internalTex = texture;
                                else
                                    internalTex = texture._texture;
                                if (!internalTex) {
                                    texture = WebGPUShaderData._dummyTexture2D;
                                    internalTex = texture._texture;
                                }
                                bindGroupEntries.push({
                                    binding: item.binding,
                                    resource: internalTex.sampler.source,
                                });
                            }
                            break;
                    }
                }
            };
            if (!bindGroup) {
                bindGroupLayoutEntries = this.createBindGroupLayoutEntry(info);
                bindGroupResourceSet = new Set();
                const bindGroupEntries = [];
                _createBindGroupEntry(info, bindGroupEntries, bindGroupResourceSet);
                if (bindGroupEntries.length === 0)
                    return null;
                const bindGroupLayoutDesc = { entries: bindGroupLayoutEntries };
                bindGroup = device.createBindGroup({
                    label: name + '_' + this._infoId + ' ' + key,
                    layout: device.createBindGroupLayout(bindGroupLayoutDesc),
                    entries: bindGroupEntries,
                });
                if (this.isShare) {
                    this._bindGroupMap.set(key, [bindGroup, bindGroupLayoutEntries, bindGroupResourceSet]);
                    this._bindGroupKey = key;
                    this._bindGroup = bindGroup;
                    this._bindGroupLayoutEntries = bindGroupLayoutEntries;
                    this._bindGroupResourceSet = bindGroupResourceSet;
                }
                else {
                    this._bindGroup = bindGroup;
                    this._bindGroupLayoutEntries = bindGroupLayoutEntries;
                    this._bindGroupResourceSet = bindGroupResourceSet;
                }
            }
            command === null || command === void 0 ? void 0 : command.setBindGroup(groupId, bindGroup);
            bundle === null || bundle === void 0 ? void 0 : bundle.setBindGroup(groupId, bindGroup);
            return bindGroupLayoutEntries;
        }
        uploadUniform() {
            var _a;
            (_a = this._uniformBuffer) === null || _a === void 0 ? void 0 : _a.upload();
            if (this.instShaderData)
                this.instShaderData.uploadUniform();
            if (this.skinShaderData)
                for (let i = this.skinShaderData.length - 1; i > -1; i--)
                    this.skinShaderData[i].uploadUniform();
        }
        getData() {
            return this._data;
        }
        getDefineData() {
            return this._defineDatas;
        }
        addDefine(define) {
            if (!this._defineDatas.has(define)) {
                const names1 = [];
                Laya.Shader3D._getNamesByDefineData(this._defineDatas, names1);
                this._defineDatas.add(define);
                this.changeMark++;
                const names2 = [];
                Laya.Shader3D._getNamesByDefineData(this._defineDatas, names2);
                for (const item of names1) {
                    if (!names2.includes(item)) ;
                }
                for (const item of names2) {
                    if (!names1.includes(item)) ;
                }
                if (this.instShaderData)
                    this.instShaderData.addDefine(define);
                if (this.skinShaderData)
                    for (let i = this.skinShaderData.length - 1; i > -1; i--)
                        this.skinShaderData[i].addDefine(define);
            }
        }
        addDefines(defines) {
            this._defineDatas.addDefineDatas(defines);
            this.changeMark++;
            const names = [];
            Laya.Shader3D._getNamesByDefineData(defines, names);
            if (this.instShaderData)
                this.instShaderData.addDefines(defines);
            if (this.skinShaderData)
                for (let i = this.skinShaderData.length - 1; i > -1; i--)
                    this.skinShaderData[i].addDefines(defines);
        }
        removeDefine(define) {
            if (this._defineDatas.has(define)) {
                const names1 = [];
                Laya.Shader3D._getNamesByDefineData(this._defineDatas, names1);
                this._defineDatas.remove(define);
                this.changeMark++;
                const names2 = [];
                Laya.Shader3D._getNamesByDefineData(this._defineDatas, names2);
                for (const item of names1) {
                    if (!names2.includes(item)) ;
                }
                for (const item of names2) {
                    if (!names1.includes(item)) ;
                }
                if (this.instShaderData)
                    this.instShaderData.removeDefine(define);
                if (this.skinShaderData)
                    for (let i = this.skinShaderData.length - 1; i > -1; i--)
                        this.skinShaderData[i].removeDefine(define);
            }
        }
        hasDefine(define) {
            return this._defineDatas.has(define);
        }
        clearDefine() {
            this._defineDatas.clear();
            if (this.instShaderData)
                this.instShaderData.clearDefine();
            if (this.skinShaderData)
                for (let i = this.skinShaderData.length - 1; i > -1; i--)
                    this.skinShaderData[i].clearDefine();
        }
        getBool(index) {
            return this._data[index];
        }
        setBool(index, value) {
            if (this._data[index] === value)
                return;
            this._data[index] = value;
            if (this._uniformBuffer)
                this._uniformBuffer.setBool(index, value);
            if (this.instShaderData)
                this.instShaderData.setBool(index, value);
            if (this.skinShaderData)
                for (let i = this.skinShaderData.length - 1; i > -1; i--)
                    this.skinShaderData[i].setBool(index, value);
        }
        getInt(index) {
            return this._data[index];
        }
        setInt(index, value) {
            var _a, _b, _c, _d, _e, _f, _g;
            if (this._data[index] === value)
                return;
            this._data[index] = value;
            if (WebGPUShaderData._stateKeyMap.has(index)) {
                this.stateKey = '<';
                this.stateKey += ((_a = this._data[Laya.Shader3D.BLEND]) !== null && _a !== void 0 ? _a : 'x') + '_';
                this.stateKey += ((_b = this._data[Laya.Shader3D.BLEND_EQUATION]) !== null && _b !== void 0 ? _b : 'x') + '_';
                this.stateKey += ((_c = this._data[Laya.Shader3D.BLEND_SRC]) !== null && _c !== void 0 ? _c : 'x') + '_';
                this.stateKey += ((_d = this._data[Laya.Shader3D.BLEND_DST]) !== null && _d !== void 0 ? _d : 'x') + '_';
                this.stateKey += (this._data[Laya.Shader3D.DEPTH_WRITE] ? 't' : 'f') + '_';
                this.stateKey += ((_e = this._data[Laya.Shader3D.DEPTH_TEST]) !== null && _e !== void 0 ? _e : 'x') + '_';
                this.stateKey += ((_f = this._data[Laya.Shader3D.STENCIL_TEST]) !== null && _f !== void 0 ? _f : 'x') + '_';
                if (this._data[Laya.Shader3D.STENCIL_Op]) {
                    this.stateKey += this._data[Laya.Shader3D.STENCIL_Op].x + '_';
                    this.stateKey += this._data[Laya.Shader3D.STENCIL_Op].y + '_';
                    this.stateKey += this._data[Laya.Shader3D.STENCIL_Op].z + '_';
                }
                else
                    this.stateKey += 'x_x_x_';
                this.stateKey += ((_g = this._data[Laya.Shader3D.STENCIL_Ref]) !== null && _g !== void 0 ? _g : 'x') + '_';
                this.stateKey += (this._data[Laya.Shader3D.STENCIL_WRITE] ? 't' : 'f') + '>_';
            }
            if (this._uniformBuffer)
                this._uniformBuffer.setInt(index, value);
            if (this.instShaderData)
                this.instShaderData.setInt(index, value);
            if (this.skinShaderData)
                for (let i = this.skinShaderData.length - 1; i > -1; i--)
                    this.skinShaderData[i].setInt(index, value);
        }
        getNumber(index) {
            return this._data[index];
        }
        setNumber(index, value) {
            if (this._data[index] === value)
                return;
            this._data[index] = value;
            if (this._uniformBuffer)
                this._uniformBuffer.setFloat(index, value);
            if (this.instShaderData)
                this.instShaderData.setNumber(index, value);
            if (this.skinShaderData)
                for (let i = this.skinShaderData.length - 1; i > -1; i--)
                    this.skinShaderData[i].setNumber(index, value);
        }
        getVector2(index) {
            return this._data[index];
        }
        setVector2(index, value) {
            const v2 = this._data[index];
            if (v2) {
                if (Laya.Vector2.equals(v2, value))
                    return;
                value.cloneTo(this._data[index]);
            }
            else
                this._data[index] = value.clone();
            if (this._uniformBuffer)
                this._uniformBuffer.setVector2(index, value);
            if (this.instShaderData)
                this.instShaderData.setVector2(index, value);
            if (this.skinShaderData)
                for (let i = this.skinShaderData.length - 1; i > -1; i--)
                    this.skinShaderData[i].setVector2(index, value);
        }
        getVector3(index) {
            return this._data[index];
        }
        setVector3(index, value) {
            const v3 = this._data[index];
            if (v3) {
                if (Laya.Vector3.equals(v3, value))
                    return;
                value.cloneTo(this._data[index]);
            }
            else
                this._data[index] = value.clone();
            if (this._uniformBuffer)
                this._uniformBuffer.setVector3(index, value);
            if (this.instShaderData)
                this.instShaderData.setVector3(index, value);
            if (this.skinShaderData)
                for (let i = this.skinShaderData.length - 1; i > -1; i--)
                    this.skinShaderData[i].setVector3(index, value);
        }
        getVector(index) {
            return this._data[index];
        }
        setVector(index, value) {
            const v4 = this._data[index];
            if (v4) {
                if (Laya.Vector4.equals(v4, value))
                    return;
                value.cloneTo(this._data[index]);
            }
            else
                this._data[index] = value.clone();
            if (this._uniformBuffer)
                this._uniformBuffer.setVector4(index, value);
            if (this.instShaderData)
                this.instShaderData.setVector(index, value);
            if (this.skinShaderData)
                for (let i = this.skinShaderData.length - 1; i > -1; i--)
                    this.skinShaderData[i].setVector(index, value);
        }
        getColor(index) {
            return this._gammaColorMap.get(index);
        }
        setColor(index, value) {
            if (!value)
                return;
            if (this._data[index]) {
                const gammaColor = this._gammaColorMap.get(index);
                if (this._data[index].equal(gammaColor))
                    return;
                value.cloneTo(gammaColor);
                const linearColor = this._data[index];
                linearColor.x = Laya.Color.gammaToLinearSpace(value.r);
                linearColor.y = Laya.Color.gammaToLinearSpace(value.g);
                linearColor.z = Laya.Color.gammaToLinearSpace(value.b);
                linearColor.w = value.a;
                if (this._uniformBuffer)
                    this._uniformBuffer.setVector4(index, linearColor);
            }
            else {
                const linearColor = new Laya.Vector4();
                linearColor.x = Laya.Color.gammaToLinearSpace(value.r);
                linearColor.y = Laya.Color.gammaToLinearSpace(value.g);
                linearColor.z = Laya.Color.gammaToLinearSpace(value.b);
                linearColor.w = value.a;
                this._data[index] = linearColor;
                this._gammaColorMap.set(index, value.clone());
                if (this._uniformBuffer)
                    this._uniformBuffer.setVector4(index, linearColor);
            }
            if (this.instShaderData)
                this.instShaderData.setColor(index, value);
            if (this.skinShaderData)
                for (let i = this.skinShaderData.length - 1; i > -1; i--)
                    this.skinShaderData[i].setColor(index, value);
        }
        getMatrix3x3(index) {
            return this._data[index];
        }
        setMatrix3x3(index, value) {
            const mat = this._data[index];
            if (mat)
                value.cloneTo(this._data[index]);
            else
                this._data[index] = value.clone();
            if (this._uniformBuffer)
                this._uniformBuffer.setMatrix3x3(index, value);
            if (this.instShaderData)
                this.instShaderData.setMatrix3x3(index, value);
            if (this.skinShaderData)
                for (let i = this.skinShaderData.length - 1; i > -1; i--)
                    this.skinShaderData[i].setMatrix3x3(index, value);
        }
        getMatrix4x4(index) {
            return this._data[index];
        }
        setMatrix4x4(index, value) {
            const mat = this._data[index];
            if (mat) {
                if (mat.equalsOtherMatrix(value))
                    return;
                value.cloneTo(this._data[index]);
            }
            else
                this._data[index] = value.clone();
            if (this._uniformBuffer)
                this._uniformBuffer.setMatrix4x4(index, value);
            if (this.instShaderData)
                this.instShaderData.setMatrix4x4(index, value);
            if (this.skinShaderData)
                for (let i = this.skinShaderData.length - 1; i > -1; i--)
                    this.skinShaderData[i].setMatrix4x4(index, value);
        }
        getBuffer(index) {
            return this._data[index];
        }
        setBuffer(index, value) {
            this._data[index] = value;
            if (this._uniformBuffer)
                this._uniformBuffer.setBuffer(index, value);
            if (this.instShaderData)
                this.instShaderData.setBuffer(index, value);
            if (this.skinShaderData)
                for (let i = this.skinShaderData.length - 1; i > -1; i--)
                    this.skinShaderData[i].setBuffer(index, value);
        }
        setTexture(index, value) {
            if (value instanceof Laya.Texture)
                value = value.bitmap;
            const lastValue = this._data[index];
            if (lastValue != value) {
                if (value) {
                    const shaderDefine = WebGPURenderEngine._instance._texGammaDefine[index];
                    if (shaderDefine) {
                        if (value.gammaCorrection > 1)
                            this.addDefine(shaderDefine);
                        else
                            this.removeDefine(shaderDefine);
                    }
                }
                this.changeMark++;
                this._data[index] = value;
                lastValue && lastValue._removeReference();
                value && value._addReference();
                this.removeBindGroup(index);
                if (this.instShaderData)
                    this.instShaderData.setTexture(index, value);
                if (this.skinShaderData)
                    for (let i = this.skinShaderData.length - 1; i > -1; i--)
                        this.skinShaderData[i].setTexture(index, value);
            }
        }
        _setInternalTexture(index, value) {
            const lastValue = this._data[index];
            if (lastValue != value) {
                if (value) {
                    const shaderDefine = WebGPURenderEngine._instance._texGammaDefine[index];
                    if (shaderDefine) {
                        if (value.gammaCorrection > 1)
                            this.addDefine(shaderDefine);
                        else
                            this.removeDefine(shaderDefine);
                    }
                }
                this.changeMark++;
                this._data[index] = value;
                this.removeBindGroup(index);
                if (this.instShaderData)
                    this.instShaderData._setInternalTexture(index, value);
                if (this.skinShaderData)
                    for (let i = this.skinShaderData.length - 1; i > -1; i--)
                        this.skinShaderData[i]._setInternalTexture(index, value);
            }
        }
        getTexture(index) {
            return this._data[index];
        }
        getSourceIndex(value) {
            for (const i in this._data)
                if (this._data[i] === value)
                    return Number(i);
            return -1;
        }
        cloneTo(dest) {
            dest._data = {};
            for (const id in this._data) {
                dest._data[id] = this._data[id];
                if (dest._uniformBuffer)
                    dest._uniformBuffer.setUniformData(Number(id), this._data[id]);
            }
            dest._defineDatas.clear();
            this._defineDatas.cloneTo(dest._defineDatas);
            dest._gammaColorMap.clear();
            this._gammaColorMap.forEach((value, key) => { dest._gammaColorMap.set(key, value); });
            dest._infoId = this._infoId;
            dest._isShare = this._isShare;
            dest._isStatic = this._isStatic;
            dest.changeMark = this.changeMark;
        }
        clone() {
            const dest = new WebGPUShaderData();
            this.cloneTo(dest);
            return dest;
        }
        _releaseUBOData() { }
        clear() {
            this._gammaColorMap.clear();
            this._bindGroupMap.clear();
            this._bindGroupKey = '';
            this._bindGroup = null;
            this._bindGroupResourceSet = null;
            this._bindGroupLayoutEntries = null;
            if (this.instShaderData)
                this.instShaderData.clear();
            if (this.skinShaderData)
                for (let i = this.skinShaderData.length - 1; i > -1; i--)
                    this.skinShaderData[i].clear();
        }
        destroy() {
            if (!this._destroyed) {
                this._destroyed = true;
                WebGPUGlobal.releaseId(this);
                WebGPUShaderData.objectCount--;
                this._gammaColorMap = null;
                this._bindGroupMap = null;
                this._bindGroupKey = null;
                this._bindGroup = null;
                this._bindGroupResourceSet = null;
                this._bindGroupLayoutEntries = null;
                if (this._uniformBuffer)
                    this._uniformBuffer.destroy();
                if (this.instShaderData) {
                    this.instShaderData.destroy();
                    this.instShaderData = null;
                }
                if (this.skinShaderData) {
                    for (let i = this.skinShaderData.length - 1; i > -1; i--)
                        this.skinShaderData[i].destroy();
                    this.skinShaderData = null;
                }
            }
        }
    }
    WebGPUShaderData._bindGroupCounter = 0;
    WebGPUShaderData.objectCount = 0;

    class WebGPUUniformBlockInfo {
        constructor(name, size) {
            this.objectName = 'WebGPUUniformBlockInfo';
            this.name = name;
            this.size = size;
            this.items = [];
            this.globalId = WebGPUGlobal.getId(this);
        }
        addUniform(name, type, offset, align, size, element, count) {
            this.items.push({
                propertyId: Laya.Shader3D.propertyNameToID(name),
                name,
                type,
                size,
                align,
                offset,
                element,
                count
            });
        }
        hasUniform(propertyId) {
            for (let i = this.items.length - 1; i > -1; i--)
                if (this.items[i].propertyId === propertyId)
                    return true;
            return false;
        }
        debugInfo() {
            for (let i = 0, len = this.items.length; i < len; i++) {
                const item = this.items[i];
                console.log('id: %d, name: %s, type: %s, size: %d, align: %d, offset: %d, elements: %d, count: %d', item.propertyId, item.name, item.type, item.size, item.align, item.offset, item.element, item.count);
            }
        }
        destroy() {
            WebGPUGlobal.releaseId(this);
        }
    }

    exports.WebGPUBindingInfoType = void 0;
    (function (WebGPUBindingInfoType) {
        WebGPUBindingInfoType[WebGPUBindingInfoType["buffer"] = 0] = "buffer";
        WebGPUBindingInfoType[WebGPUBindingInfoType["texture"] = 1] = "texture";
        WebGPUBindingInfoType[WebGPUBindingInfoType["sampler"] = 2] = "sampler";
    })(exports.WebGPUBindingInfoType || (exports.WebGPUBindingInfoType = {}));
    class WebGPUCodeGenerator {
        static async init(next) {
            if (this.inited) {
                if (next)
                    next();
                return;
            }
            this.naga = new NagaWASM();
            await this.naga.init();
            this.inited = true;
            if (next)
                next();
            Laya.Graphics.add2DGlobalUniformData(Laya.Shader3D.propertyNameToID('u_GraphicDummy'), 'u_GraphicDummy', Laya.ShaderDataType.Vector4);
            WebGPUShaderData.__init__();
        }
        static _attributeString(attributeMap) {
            let res = '';
            for (const key in attributeMap) {
                let location = attributeMap[key][0];
                const type = this._getAttributeT2S(attributeMap[key][1]);
                if (type === 'mat3') {
                    res = `${res}layout(location = ${location++}) in vec3 ${key}_0;\n`;
                    res = `${res}layout(location = ${location++}) in vec3 ${key}_1;\n`;
                    res = `${res}layout(location = ${location++}) in vec3 ${key}_2;\n`;
                }
                else if (type === 'mat4') {
                    res = `${res}layout(location = ${location++}) in vec4 ${key}_0;\n`;
                    res = `${res}layout(location = ${location++}) in vec4 ${key}_1;\n`;
                    res = `${res}layout(location = ${location++}) in vec4 ${key}_2;\n`;
                    res = `${res}layout(location = ${location++}) in vec4 ${key}_3;\n`;
                }
                else
                    res = `${res}layout(location = ${location}) in ${type} ${key};\n`;
            }
            return res;
        }
        static _varyingString(varyingMap, io = 'out') {
            let res = '';
            let count = 0;
            for (const key in varyingMap) {
                const type = varyingMap[key];
                res = `${res}layout(location = ${count++}) ${io} ${type} ${key};\n`;
            }
            return res;
        }
        static _uniformString2D(uniformMap, arrayMap) {
            const globalUniformMap = Laya.LayaGL.renderDeviceFactory.createGlobalUniformMap;
            const cameraUniformMap = globalUniformMap("BaseCamera");
            const scene2DUniformMap = globalUniformMap("Sprite2DGlobal");
            const sprite2DUniformMap = globalUniformMap("Sprite2D");
            const scene2DUniforms = [];
            const sprite2DUniforms = [];
            const materialUniforms = [];
            const textureUniforms = [];
            const uniformInfo = [];
            const _have = (group, name) => {
                for (let i = group.length - 1; i > -1; i--)
                    if (group[i].name === name)
                        return true;
                return false;
            };
            const regex = /\[(.*?)\]/g;
            const _catalog = (key, name, type) => {
                const id = Laya.Shader3D.propertyNameToID(key.replace(regex, '_'));
                if (scene2DUniformMap.hasPtrID(id)) {
                    if (!_have(scene2DUniforms, name))
                        scene2DUniforms.push({ name, type, set: 0 });
                }
                else if (sprite2DUniformMap.hasPtrID(id)) {
                    if (!_have(sprite2DUniforms, name))
                        sprite2DUniforms.push({ name, type, set: 2 });
                }
                else if (type === 'sampler2D' || type === 'samplerCube' || type === 'sampler2DArray' || type === 'sampler2DShadow') {
                    if (!_have(textureUniforms, name))
                        textureUniforms.push({ name, type, set: 3 });
                }
                else if (!_have(materialUniforms, name))
                    materialUniforms.push({ name, type, set: 3 });
            };
            for (const key in uniformMap) {
                const dataType = this._getAttributeT2S(uniformMap[key].type);
                _catalog(key, uniformMap[key].name, dataType);
            }
            if (sprite2DUniforms.length === 0)
                sprite2DUniforms.push({ name: 'u_WorldMat', type: 'mat4', set: 2 });
            if (materialUniforms.length === 0)
                materialUniforms.push({ name: 'u_AlbedoColor', type: 'vec4', set: 3 });
            let uniformGLSL = '';
            const typeNum = 10;
            const visibility = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT;
            const _procUniforms = (set, binding, name, uniformMap, uniforms) => {
                const sortedUniforms = [];
                for (let i = 0; i < typeNum; i++)
                    sortedUniforms[i] = [];
                uniformGLSL = `${uniformGLSL}layout(set = ${set}, binding = ${binding}) uniform ${name} {\n`;
                if (uniforms) {
                    for (let i = 0, len = uniforms.length; i < len; i++) {
                        const nameStr = uniforms[i].name;
                        const typeStr = uniforms[i].type;
                        if (typeStr === 'sampler2D' || typeStr === 'samplerCube' || typeStr === 'sampler2DArray' || typeStr === 'sampler2DShadow')
                            textureUniforms.push({ name: nameStr, type: typeStr, set });
                        else
                            sortedUniforms[this._getAttributeS2N(typeStr)].push({ name: nameStr, type: typeStr, set });
                    }
                }
                else if (uniformMap) {
                    const data = uniformMap._idata;
                    for (const key in data) {
                        let nameStr;
                        if (data[key].arrayLength > 0) {
                            nameStr = `${data[key].propertyName}[${data[key].arrayLength}]`;
                            arrayMap[nameStr] = data[key].arrayLength;
                        }
                        else
                            nameStr = data[key].propertyName;
                        const typeStr = this._getAttributeT2S(data[key].uniformtype);
                        if (data[key].propertyName.indexOf('.') !== -1)
                            continue;
                        if (typeStr === '')
                            continue;
                        else if (typeStr === 'sampler2D' || typeStr === 'samplerCube' || typeStr === 'sampler2DArray')
                            textureUniforms.push({ name: nameStr, type: typeStr, set });
                        else
                            sortedUniforms[this._getAttributeS2N(typeStr)].push({ name: nameStr, type: typeStr, set });
                    }
                }
                for (let i = 1; i < typeNum; i++)
                    sortedUniforms[0].push(...sortedUniforms[i]);
                for (let i = 0, len = sortedUniforms[0].length; i < len; i++)
                    uniformGLSL = `${uniformGLSL}    ${sortedUniforms[0][i].type} ${sortedUniforms[0][i].name};\n`;
                uniformGLSL = `${uniformGLSL}};\n\n`;
                uniformInfo.push({
                    id: WebGPUGlobal.getUniformInfoId(),
                    set,
                    binding,
                    visibility,
                    type: exports.WebGPUBindingInfoType.buffer,
                    name,
                    propertyId: Laya.Shader3D.propertyNameToID(name),
                    uniform: this._genUniformBlockInfo(name, sortedUniforms[0], arrayMap),
                    buffer: { type: 'uniform', hasDynamicOffset: false, minBindingSize: 0 },
                });
                return sortedUniforms[0];
            };
            _procUniforms(0, 0, 'scene3D', scene2DUniformMap);
            _procUniforms(1, 0, 'camera', cameraUniformMap);
            _procUniforms(2, 0, 'sprite3D', null, sprite2DUniforms);
            _procUniforms(3, 0, 'material', null, materialUniforms);
            return {
                uniformGLSL,
                uniformInfo,
                textureUniforms,
            };
        }
        static _uniformString3D(uniformMap, arrayMap) {
            const globalUniformMap = Laya.LayaGL.renderDeviceFactory.createGlobalUniformMap;
            const scene3DUniformMap = globalUniformMap("Scene3D");
            const cameraUniformMap = globalUniformMap("BaseCamera");
            const sprite3DUniformMap = globalUniformMap("Sprite3D");
            const simpleSkinnedMeshUniformMap = globalUniformMap("SimpleSkinnedMesh");
            const shurikenSprite3DUniformMap = globalUniformMap("ShurikenSprite3D");
            const trailRenderUniformMap = globalUniformMap("TrailRender");
            const skyRendererUniformMap = globalUniformMap("SkyRenderer");
            const scene3DUniforms = [];
            const cameraUniforms = [];
            const sprite3DUniforms = [];
            const materialUniforms = [];
            const textureUniforms = [];
            sprite3DUniformMap.addShaderUniform(Laya.SkinnedMeshSprite3D.BONES, 'u_Bones', Laya.ShaderDataType.Matrix4x4);
            const uniformInfo = [];
            const _have = (group, name) => {
                for (let i = group.length - 1; i > -1; i--)
                    if (group[i].name === name)
                        return true;
                return false;
            };
            const regex = /\[(.*?)\]/g;
            const _catalog = (key, name, type) => {
                const id = Laya.Shader3D.propertyNameToID(key.replace(regex, '_'));
                if (scene3DUniformMap.hasPtrID(id)) {
                    if (!_have(scene3DUniforms, name))
                        scene3DUniforms.push({ name, type, set: 0 });
                }
                else if (cameraUniformMap.hasPtrID(id)) {
                    if (!_have(cameraUniforms, name))
                        cameraUniforms.push({ name, type, set: 1 });
                }
                else if (sprite3DUniformMap.hasPtrID(id)) {
                    if (!_have(sprite3DUniforms, name))
                        sprite3DUniforms.push({ name, type, set: 2 });
                }
                else if (simpleSkinnedMeshUniformMap.hasPtrID(id)) {
                    if (!_have(sprite3DUniforms, name))
                        sprite3DUniforms.push({ name, type, set: 2 });
                }
                else if (shurikenSprite3DUniformMap.hasPtrID(id)) {
                    if (!_have(sprite3DUniforms, name))
                        sprite3DUniforms.push({ name, type, set: 2 });
                }
                else if (trailRenderUniformMap.hasPtrID(id)) {
                    if (!_have(sprite3DUniforms, name))
                        sprite3DUniforms.push({ name, type, set: 2 });
                }
                else if (skyRendererUniformMap.hasPtrID(id)) {
                    if (!_have(sprite3DUniforms, name))
                        sprite3DUniforms.push({ name, type, set: 2 });
                }
                else if (type === 'sampler2D' || type === 'samplerCube' || type === 'sampler2DArray' || type === 'sampler2DShadow') {
                    if (!_have(textureUniforms, name))
                        textureUniforms.push({ name, type, set: 3 });
                }
                else if (!_have(materialUniforms, name))
                    materialUniforms.push({ name, type, set: 3 });
            };
            for (const key in uniformMap) {
                const dataType = this._getAttributeT2S(uniformMap[key].type);
                _catalog(key, uniformMap[key].name, dataType);
            }
            let haveWorldMat = false;
            for (let i = sprite3DUniforms.length - 1; i > -1; i--) {
                if (sprite3DUniforms[i].name === 'u_WorldMat') {
                    haveWorldMat = true;
                    break;
                }
            }
            if (!haveWorldMat)
                sprite3DUniforms.push({ name: 'u_WorldMat', type: 'mat4', set: 2 });
            if (materialUniforms.length === 0)
                materialUniforms.push({ name: 'u_AlbedoColor', type: 'vec4', set: 3 });
            let uniformGLSL = '';
            const typeNum = 10;
            const visibility = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT;
            const _procUniforms = (set, binding, name, uniformMap, uniforms) => {
                const sortedUniforms = [];
                for (let i = 0; i < typeNum; i++)
                    sortedUniforms[i] = [];
                uniformGLSL = `${uniformGLSL}layout(set = ${set}, binding = ${binding}) uniform ${name} {\n`;
                if (uniforms) {
                    for (let i = 0, len = uniforms.length; i < len; i++) {
                        const nameStr = uniforms[i].name;
                        const typeStr = uniforms[i].type;
                        if (typeStr === 'sampler2D' || typeStr === 'samplerCube' || typeStr === 'sampler2DArray' || typeStr === 'sampler2DShadow')
                            textureUniforms.push({ name: nameStr, type: typeStr, set });
                        else
                            sortedUniforms[this._getAttributeS2N(typeStr)].push({ name: nameStr, type: typeStr, set });
                    }
                }
                else if (uniformMap) {
                    const data = uniformMap._idata;
                    for (const key in data) {
                        let nameStr;
                        if (data[key].arrayLength > 0) {
                            nameStr = `${data[key].propertyName}[${data[key].arrayLength}]`;
                            arrayMap[nameStr] = data[key].arrayLength;
                        }
                        else
                            nameStr = data[key].propertyName;
                        const typeStr = this._getAttributeT2S(data[key].uniformtype);
                        if (data[key].propertyName.indexOf('.') !== -1)
                            continue;
                        if (typeStr === '')
                            continue;
                        else if (typeStr === 'sampler2D' || typeStr === 'samplerCube' || typeStr === 'sampler2DArray')
                            textureUniforms.push({ name: nameStr, type: typeStr, set });
                        else
                            sortedUniforms[this._getAttributeS2N(typeStr)].push({ name: nameStr, type: typeStr, set });
                    }
                }
                for (let i = 1; i < typeNum; i++)
                    sortedUniforms[0].push(...sortedUniforms[i]);
                for (let i = 0, len = sortedUniforms[0].length; i < len; i++)
                    uniformGLSL = `${uniformGLSL}    ${sortedUniforms[0][i].type} ${sortedUniforms[0][i].name};\n`;
                uniformGLSL = `${uniformGLSL}};\n\n`;
                uniformInfo.push({
                    id: WebGPUGlobal.getUniformInfoId(),
                    set,
                    binding,
                    visibility,
                    type: exports.WebGPUBindingInfoType.buffer,
                    name,
                    propertyId: Laya.Shader3D.propertyNameToID(name),
                    uniform: this._genUniformBlockInfo(name, sortedUniforms[0], arrayMap),
                    buffer: { type: 'uniform', hasDynamicOffset: false, minBindingSize: 0 },
                });
                return sortedUniforms[0];
            };
            _procUniforms(0, 0, 'scene3D', scene3DUniformMap);
            _procUniforms(1, 0, 'camera', cameraUniformMap);
            _procUniforms(2, 0, 'sprite3D', null, sprite3DUniforms);
            _procUniforms(3, 0, 'material', null, materialUniforms);
            return {
                uniformGLSL,
                uniformInfo,
                textureUniforms,
            };
        }
        static _textureString(textureUniforms, uniformInfo, visibility) {
            let res = '';
            let binding = [1, 1, 1, 1];
            for (let i = uniformInfo.length - 1; i > -1; i--)
                if (binding[uniformInfo[i].set] <= uniformInfo[i].binding)
                    binding[uniformInfo[i].set] = uniformInfo[i].binding + 1;
            if (textureUniforms.length > 0) {
                for (let i = 0, len = textureUniforms.length; i < len; i++) {
                    const tu = textureUniforms[i];
                    if (tu.type === 'sampler2D') {
                        res = `${res}layout(set = ${tu.set}, binding = ${binding[tu.set]++}) uniform sampler ${tu.name}Sampler;\n`;
                        res = `${res}layout(set = ${tu.set}, binding = ${binding[tu.set]++}) uniform texture2D ${tu.name}Texture;\n`;
                        res = `${res}#define ${tu.name} sampler2D(${tu.name}Texture, ${tu.name}Sampler)\n\n`;
                        uniformInfo.push({
                            id: WebGPUGlobal.getUniformInfoId(),
                            set: tu.set,
                            binding: binding[tu.set] - 2,
                            visibility,
                            type: exports.WebGPUBindingInfoType.sampler,
                            name: `${tu.name}Sampler`,
                            propertyId: Laya.Shader3D.propertyNameToID(tu.name),
                            sampler: { type: 'filtering' },
                        });
                        uniformInfo.push({
                            id: WebGPUGlobal.getUniformInfoId(),
                            set: tu.set,
                            binding: binding[tu.set] - 1,
                            visibility,
                            type: exports.WebGPUBindingInfoType.texture,
                            name: `${tu.name}Texture`,
                            propertyId: Laya.Shader3D.propertyNameToID(tu.name),
                            texture: { sampleType: 'float', viewDimension: '2d', multisampled: false },
                        });
                    }
                    if (tu.type === 'samplerCube') {
                        res = `${res}layout(set = ${tu.set}, binding = ${binding[tu.set]++}) uniform sampler ${tu.name}Sampler;\n`;
                        res = `${res}layout(set = ${tu.set}, binding = ${binding[tu.set]++}) uniform textureCube ${tu.name}Texture;\n`;
                        res = `${res}#define ${tu.name} samplerCube(${tu.name}Texture, ${tu.name}Sampler)\n\n`;
                        uniformInfo.push({
                            id: WebGPUGlobal.getUniformInfoId(),
                            set: tu.set,
                            binding: binding[tu.set] - 2,
                            visibility,
                            type: exports.WebGPUBindingInfoType.sampler,
                            name: `${tu.name}Sampler`,
                            propertyId: Laya.Shader3D.propertyNameToID(tu.name),
                            sampler: { type: 'filtering' },
                        });
                        uniformInfo.push({
                            id: WebGPUGlobal.getUniformInfoId(),
                            set: tu.set,
                            binding: binding[tu.set] - 1,
                            visibility,
                            type: exports.WebGPUBindingInfoType.texture,
                            name: `${tu.name}Texture`,
                            propertyId: Laya.Shader3D.propertyNameToID(tu.name),
                            texture: { sampleType: 'float', viewDimension: 'cube', multisampled: false },
                        });
                    }
                    if (tu.type === 'sampler2DArray') {
                        res = `${res}layout(set = ${tu.set}, binding = ${binding[tu.set]++}) uniform sampler ${tu.name}Sampler;\n`;
                        res = `${res}layout(set = ${tu.set}, binding = ${binding[tu.set]++}) uniform texture2DArray ${tu.name}Texture;\n`;
                        res = `${res}#define ${tu.name} sampler2DArray(${tu.name}Texture, ${tu.name}Sampler)\n\n`;
                        uniformInfo.push({
                            id: WebGPUGlobal.getUniformInfoId(),
                            set: tu.set,
                            binding: binding[tu.set] - 2,
                            visibility,
                            type: exports.WebGPUBindingInfoType.sampler,
                            name: `${tu.name}Sampler`,
                            propertyId: Laya.Shader3D.propertyNameToID(tu.name),
                            sampler: { type: 'filtering' },
                        });
                        uniformInfo.push({
                            id: WebGPUGlobal.getUniformInfoId(),
                            set: tu.set,
                            binding: binding[tu.set] - 1,
                            visibility,
                            type: exports.WebGPUBindingInfoType.texture,
                            name: `${tu.name}Texture`,
                            propertyId: Laya.Shader3D.propertyNameToID(tu.name),
                            texture: { sampleType: 'float', viewDimension: '2d-array', multisampled: false },
                        });
                    }
                    if (tu.type === 'sampler2DShadow') {
                        res = `${res}layout(set = ${tu.set}, binding = ${binding[tu.set]++}) uniform samplerShadow ${tu.name}Sampler;\n`;
                        res = `${res}layout(set = ${tu.set}, binding = ${binding[tu.set]++}) uniform texture2D ${tu.name}Texture;\n`;
                        res = `${res}#define ${tu.name} sampler2DShadow(${tu.name}Texture, ${tu.name}Sampler)\n\n`;
                        uniformInfo.push({
                            id: WebGPUGlobal.getUniformInfoId(),
                            set: tu.set,
                            binding: binding[tu.set] - 2,
                            visibility,
                            type: exports.WebGPUBindingInfoType.sampler,
                            name: `${tu.name}Sampler`,
                            propertyId: Laya.Shader3D.propertyNameToID(tu.name),
                            sampler: { type: 'filtering' },
                        });
                        uniformInfo.push({
                            id: WebGPUGlobal.getUniformInfoId(),
                            set: tu.set,
                            binding: binding[tu.set] - 1,
                            visibility,
                            type: exports.WebGPUBindingInfoType.texture,
                            name: `${tu.name}Texture`,
                            propertyId: Laya.Shader3D.propertyNameToID(tu.name),
                            texture: { sampleType: 'float', viewDimension: '2d', multisampled: false },
                        });
                    }
                }
            }
            return res;
        }
        static _changeUnfitCode(code) {
            const regex1 = /const\s+(?:in|highp|mediump|lowp)\s+/g;
            code = code.replace(regex1, 'in ');
            const regex2 = /(?:texture2D|textureCube)\s*\(\s*/g;
            return code.replace(regex2, 'texture(');
        }
        static _genAWorldMat() {
            return '#define a_WorldMat mat4(a_WorldMat_0, a_WorldMat_1, a_WorldMat_2, a_WorldMat_3)';
        }
        static _genInverseFunc() {
            const func = `
mat2 inverse(mat2 m)
{
    return mat2(m[1][1], -m[0][1], -m[1][0], m[0][0]) / (m[0][0] * m[1][1] - m[0][1] * m[1][0]);
}
mat3 inverse(mat3 m)
{
    float a00 = m[0][0], a01 = m[0][1], a02 = m[0][2];
    float a10 = m[1][0], a11 = m[1][1], a12 = m[1][2];
    float a20 = m[2][0], a21 = m[2][1], a22 = m[2][2];

    float b01 = a22 * a11 - a12 * a21;
    float b11 = a12 * a20 - a22 * a10;
    float b21 = a21 * a10 - a11 * a20;

    float det = a00 * b01 + a01 * b11 + a02 * b21;

    return mat3(
           b01, (-a22 * a01 + a02 * a21), (a12 * a01 - a02 * a11), b11, (a22 * a00 - a02 * a20),
	       (-a12 * a00 + a02 * a10), b21, (-a21 * a00 + a01 * a20), (a11 * a00 - a01 * a10))
	/ det;
}
mat4 inverse(mat4 m)
{
    float a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3];
    float a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3];
    float a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3];
    float a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3];

	float b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10;
	float b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12;
	float b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30;
	float b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;

	float det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    return mat4(
           a11 * b11 - a12 * b10 + a13 * b09, a02 * b10 - a01 * b11 - a03 * b09, a31 * b05 - a32 * b04 + a33 * b03,
	       a22 * b04 - a21 * b05 - a23 * b03, a12 * b08 - a10 * b11 - a13 * b07, a00 * b11 - a02 * b08 + a03 * b07,
	       a32 * b02 - a30 * b05 - a33 * b01, a20 * b05 - a22 * b02 + a23 * b01, a10 * b10 - a11 * b08 + a13 * b06,
	       a01 * b08 - a00 * b10 - a03 * b06, a30 * b04 - a31 * b02 + a33 * b00, a21 * b02 - a20 * b04 - a23 * b00,
	       a11 * b07 - a10 * b09 - a12 * b06, a00 * b09 - a01 * b07 + a02 * b06, a31 * b01 - a30 * b03 - a32 * b00,
	       a20 * b03 - a21 * b01 + a22 * b00)
	/ det;
}
mat2 transpose(mat2 m)
{
    return mat2(
    m[0][0], m[1][0],
	m[0][1], m[1][1]);
}
mat3 transpose(mat3 m)
{
    return mat3(
    m[0][0], m[1][0], m[2][0],
	m[0][1], m[1][1], m[2][1],
	m[0][2], m[1][2], m[2][2]);
}
mat4 transpose(mat4 m)
{
    return mat4(
    m[0][0], m[1][0], m[2][0], m[3][0],
	m[0][1], m[1][1], m[2][1], m[3][1],
	m[0][2], m[1][2], m[2][2], m[3][2],
	m[0][3], m[1][3], m[2][3], m[3][3]);
}`;
            return `${func}\n\n`;
        }
        static _genUniformBlockInfo(name, uniforms, arrayMap) {
            if (uniforms.length === 0)
                return undefined;
            const _getUniformAlign = (type) => {
                switch (type) {
                    case 'int':
                    case 'float':
                        return 4;
                    case 'vec2':
                        return 8;
                    case 'vec3':
                    case 'vec4':
                    case 'mat3':
                    case 'mat4':
                        return 16;
                    default:
                        return 4;
                }
            };
            const _getUniformElements = (type) => {
                switch (type) {
                    case 'int':
                    case 'float':
                        return 1;
                    case 'vec2':
                        return 2;
                    case 'vec3':
                        return 3;
                    case 'vec4':
                        return 4;
                    case 'mat3':
                        return 12;
                    case 'mat4':
                        return 16;
                    default:
                        return 1;
                }
            };
            const _getUniformSize = (type, count = 1) => {
                if (count <= 1) {
                    switch (type) {
                        case 'int':
                        case 'float':
                            return 4;
                        case 'vec2':
                            return 8;
                        case 'vec3':
                            return 12;
                        case 'vec4':
                            return 16;
                        case 'mat3':
                            return 48;
                        case 'mat4':
                            return 64;
                        default:
                            return 4;
                    }
                }
                else {
                    switch (type) {
                        case 'int':
                        case 'float':
                            return 4 * count;
                        case 'vec2':
                            return 8 * count;
                        case 'vec3':
                            return 16 * count;
                        case 'vec4':
                            return 16 * count;
                        case 'mat3':
                            return 48 * count;
                        case 'mat4':
                            return 64 * count;
                        default:
                            return 4 * count;
                    }
                }
            };
            const _calcUniformBufferSize = (uniforms, arrayMap) => {
                let byteLength = 0;
                let maxAlign = 0;
                const regex = /\[(.*?)\]/g;
                const layout = [];
                for (let i = 0, len = uniforms.length; i < len; i++) {
                    const uniform = uniforms[i];
                    const count = arrayMap[uniform.name] || 1;
                    const align = _getUniformAlign(uniform.type);
                    const size = _getUniformSize(uniform.type, count);
                    const elements = _getUniformElements(uniform.type);
                    const name = uniform.name.replace(regex, '');
                    if (align > maxAlign)
                        maxAlign = align;
                    byteLength = roundUp(byteLength, align);
                    byteLength += size;
                    layout.push({ name, type: uniform.type, offset: byteLength - size, align, size, elements, count });
                }
                byteLength = roundUp(byteLength, maxAlign);
                return { byteLength, layout };
            };
            const size = _calcUniformBufferSize(uniforms, arrayMap);
            const uniformBlockInfo = new WebGPUUniformBlockInfo(name, size.byteLength);
            for (let i = 0, len = size.layout.length; i < len; i++) {
                const uniform = size.layout[i];
                uniformBlockInfo.addUniform(uniform.name, uniform.type, uniform.offset, uniform.align, uniform.size, uniform.elements, uniform.count);
            }
            return uniformBlockInfo;
        }
        static _getAttributeT2S(type) {
            switch (type) {
                case Laya.ShaderDataType.Int:
                    return 'int';
                case Laya.ShaderDataType.Bool:
                    return 'bool';
                case Laya.ShaderDataType.Float:
                    return 'float';
                case Laya.ShaderDataType.Vector2:
                    return 'vec2';
                case Laya.ShaderDataType.Vector3:
                    return 'vec3';
                case Laya.ShaderDataType.Vector4:
                case Laya.ShaderDataType.Color:
                    return 'vec4';
                case Laya.ShaderDataType.Matrix3x3:
                    return 'mat3';
                case Laya.ShaderDataType.Matrix4x4:
                    return 'mat4';
                case Laya.ShaderDataType.Texture2D:
                    return 'sampler2D';
                case Laya.ShaderDataType.TextureCube:
                    return 'samplerCube';
                case Laya.ShaderDataType.Texture2DArray:
                    return 'sampler2DArray';
                default:
                    return '';
            }
        }
        static _getAttributeS2T(name) {
            switch (name) {
                case 'int':
                    return Laya.ShaderDataType.Int;
                case 'bool':
                    return Laya.ShaderDataType.Bool;
                case 'float':
                    return Laya.ShaderDataType.Float;
                case 'vec2':
                    return Laya.ShaderDataType.Vector2;
                case 'vec3':
                    return Laya.ShaderDataType.Vector3;
                case 'vec4':
                    return Laya.ShaderDataType.Vector4;
                case 'mat3':
                    return Laya.ShaderDataType.Matrix3x3;
                case 'mat4':
                    return Laya.ShaderDataType.Matrix4x4;
                case 'sampler2D':
                    return Laya.ShaderDataType.Texture2D;
                case 'samplerCube':
                    return Laya.ShaderDataType.TextureCube;
                case 'sampler2DArray':
                    return Laya.ShaderDataType.Texture2DArray;
                case 'sampler2DShadow':
                    return Laya.ShaderDataType.Texture2D;
                default:
                    return '';
            }
        }
        static _getAttributeS2N(name) {
            switch (name) {
                case 'mat4':
                    return 0;
                case 'mat3':
                    return 1;
                case 'vec4':
                    return 2;
                case 'vec3':
                    return 3;
                case 'vec2':
                    return 4;
                case 'float':
                    return 5;
                case 'bool':
                    return 6;
                case 'int':
                    return 7;
                default:
                    return 8;
            }
        }
        static shaderLanguageProcess(defineString, attributeMap, uniformMap, arrayMap, VS, FS, is2D) {
            const defMap = {};
            const varyingMap = {};
            const varyingMapVS = {};
            const varyingMapFS = {};
            const clusterSlices = Laya.Config3D.lightClusterCount;
            defineString.push('GRAPHICS_API_GLES3');
            let defineStr = '';
            defineStr += '#define MAX_LIGHT_COUNT ' + Laya.Config3D.maxLightCount + '\n';
            defineStr += '#define MAX_LIGHT_COUNT_PER_CLUSTER ' + Laya.Config3D._maxAreaLightCountPerClusterAverage + '\n';
            defineStr += '#define CLUSTER_X_COUNT ' + clusterSlices.x + '\n';
            defineStr += '#define CLUSTER_Y_COUNT ' + clusterSlices.y + '\n';
            defineStr += '#define CLUSTER_Z_COUNT ' + clusterSlices.z + '\n';
            defineStr += '#define MORPH_MAX_COUNT ' + Laya.Config3D.maxMorphTargetCount + '\n';
            defineStr += '#define SHADER_CAPAILITY_LEVEL ' + Laya.LayaGL.renderEngine.getParams(Laya.RenderParams.SHADER_CAPAILITY_LEVEL) + '\n';
            for (let i = 0, len = defineString.length; i < len; i++) {
                const def = defineString[i];
                defineStr += '#define ' + def + '\n';
                defMap[def] = true;
            }
            const vs = VS.toscript(defMap, []);
            if (vs[0].indexOf('#version') === 0)
                vs.shift();
            const fs = FS.toscript(defMap, []);
            if (fs[0].indexOf('#version') === 0)
                fs.shift();
            let vsOut = '', fsOut = '';
            const vsTod = {};
            const fsTod = {};
            {
                const defs = new Set();
                const token = WebGPUShaderCompileDef.compile(vs.join('\n'), defs);
                const defMap = {};
                defineString.forEach(def => { defMap[def] = true; });
                defMap['GL_FRAGMENT_PRECISION_HIGH'] = true;
                vsOut = WebGPUShaderCompileUtil.toScript(token, defMap, vsTod);
                if (vsTod.varying)
                    for (const key in vsTod.varying)
                        if (!varyingMapVS[key])
                            varyingMapVS[key] = vsTod.varying[key].type;
                if (vsTod.variable) {
                    const attributeUsed = {};
                    for (const k in attributeMap)
                        if (vsTod.variable.has(k))
                            attributeUsed[k] = attributeMap[k];
                    attributeMap = attributeUsed;
                }
            }
            {
                const defs = new Set();
                const token = WebGPUShaderCompileDef.compile(fs.join('\n'), defs);
                const defMap = {};
                defineString.forEach(def => { defMap[def] = true; });
                defMap['GL_FRAGMENT_PRECISION_HIGH'] = true;
                fsOut = WebGPUShaderCompileUtil.toScript(token, defMap, fsTod);
                if (fsTod.varying)
                    for (const key in fsTod.varying)
                        if (!varyingMapFS[key])
                            varyingMapFS[key] = fsTod.varying[key].type;
            }
            for (const key in varyingMapVS)
                varyingMap[key] = varyingMapVS[key];
            const attributeGLSL = this._attributeString(attributeMap);
            const varyingGLSL_vs = this._varyingString(varyingMap, 'out');
            const varyingGLSL_fs = this._varyingString(varyingMap, 'in');
            const { uniformGLSL, uniformInfo, textureUniforms } = is2D ? this._uniformString2D(uniformMap, arrayMap) : this._uniformString3D(uniformMap, arrayMap);
            const inverseFunc = this._genInverseFunc();
            const aWorldMat = this._genAWorldMat();
            const textureUniforms_vs = [];
            const textureUniforms_fs = [];
            if (vsTod.variable) {
                for (let i = 0, len = textureUniforms.length; i < len; i++) {
                    const name = textureUniforms[i].name;
                    if (vsTod.variable.has(name)) {
                        textureUniforms_vs.push(textureUniforms[i]);
                        if (uniformMap[name]
                            && uniformMap[name].shadow) {
                            textureUniforms[i].type = 'sampler2DShadow';
                        }
                    }
                }
            }
            if (fsTod.variable) {
                for (let i = 0, len = textureUniforms.length; i < len; i++) {
                    if (fsTod.variable.has(textureUniforms[i].name)) {
                        textureUniforms_fs.push(textureUniforms[i]);
                        if (uniformMap[textureUniforms[i].name]
                            && uniformMap[textureUniforms[i].name].shadow) {
                            textureUniforms[i].type = 'sampler2DShadow';
                        }
                    }
                }
            }
            const textureGLSL_vs = this._textureString(textureUniforms_vs, uniformInfo, GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT);
            const textureGLSL_fs = this._textureString(textureUniforms_fs, uniformInfo, GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT);
            const textureNames_vs = [];
            const textureNames_fs = [];
            for (let i = 0, len = textureUniforms_vs.length; i < len; i++)
                textureNames_vs.push(textureUniforms_vs[i].name);
            for (let i = 0, len = textureUniforms_fs.length; i < len; i++)
                textureNames_fs.push(textureUniforms_fs[i].name);
            const vertexHead = `#version 450 core
precision highp float;
precision highp int;
${attributeGLSL}
${varyingGLSL_vs}
${uniformGLSL}
${textureGLSL_vs}
${aWorldMat}
`;
            const fragmentHead = `#version 450 core
precision highp float;
precision highp int;
layout(location = 0) out vec4 gl_FragColor;
${varyingGLSL_fs}
${uniformGLSL}
${textureGLSL_fs}
`;
            let vsBody = defineStr + (inverseFunc ) + vsOut;
            let fsBody = defineStr + (inverseFunc ) + fsOut;
            if (this.forNaga) {
                vsBody = this._changeUnfitCode(vsBody);
                fsBody = this._changeUnfitCode(fsBody);
            }
            const procVS = new WebGPU_GLSLProcess();
            const procFS = new WebGPU_GLSLProcess();
            procVS.process(vsBody, textureNames_vs);
            procFS.process(fsBody, textureNames_fs);
            let dstVS = vertexHead + procVS.glslCode;
            let dstFS = fragmentHead + procFS.glslCode;
            let wgsl_vs = this.naga.compileGLSL2WGSL(dstVS, 'vertex');
            let wgsl_fs = this.naga.compileGLSL2WGSL(dstFS, 'fragment');
            {
                const regex = /let\s+([_a-zA-Z][_a-zA-Z0-9]*)\s*=\s*textureSample\(((?:[^()]|\((?:[^()]*|\([^()]*\))*\))*)\);/g;
                let match;
                while ((match = regex.exec(wgsl_vs)) !== null) {
                    const variable = match[1];
                    const argss = match[2].split(',');
                    let code;
                    if (argss.length === 3) {
                        code = `
    let ${variable}_1 = textureDimensions(${argss[0]}, 0);
    let ${variable}_2 = ${argss[2]};
    let ${variable}_3 = vec2<u32>(u32(f32(${variable}_1.x) * ${variable}_2.x), u32(f32(${variable}_1.y) * ${variable}_2.y));
    let ${variable} = textureLoad(${argss[0]}, ${variable}_3, 0);`;
                    }
                    else if (argss.length === 4) {
                        code = `
    let ${variable}_1 = textureDimensions(${argss[0]}, 0);
    let ${variable}_2 = ${argss[2]};
    let ${variable}_3 = vec2<u32>(u32(f32(${variable}_1.x) * ${variable}_2.x), u32(f32(${variable}_1.y) * ${variable}_2.y));
    let ${variable} = textureLoad(${argss[0]}, ${variable}_3, ${argss[3]}, 0);`;
                    }
                    wgsl_vs = wgsl_vs.replace(match[0], code);
                }
            }
            if (procVS.haveVertexID) {
                const regex = /fn\s+main\([^{}]*\{/g;
                let match;
                if ((match = regex.exec(wgsl_vs)) !== null) {
                    const str = match[0];
                    let code = '';
                    let add = false;
                    for (let i = 0; i < str.length; i++) {
                        if (str[i] === '(' && !add) {
                            add = true;
                            code += str[i];
                            code += '@builtin(vertex_index) vertexIndex : u32, ';
                        }
                        else if (str[i] === '{') {
                            code += str[i];
                            code += '\n    gl_VertexID = i32(vertexIndex);';
                        }
                        else
                            code += str[i];
                    }
                    wgsl_vs = wgsl_vs.replace(match[0], code);
                }
            }
            return { glsl_vs: dstVS, glsl_fs: dstFS, vs: wgsl_vs, fs: wgsl_fs, uniformInfo };
        }
        static collectUniform(defineString, uniformMap, VS, FS) {
            const uniformMapEx = {};
            for (const key in uniformMap) {
                if (typeof uniformMap[key] === 'object') {
                    const blockUniform = uniformMap[key];
                    for (const uniformName in blockUniform) {
                        const dataType = blockUniform[uniformName];
                        uniformMapEx[uniformName] = { name: uniformName, type: dataType };
                    }
                }
                else
                    uniformMapEx[key] = { name: key, type: uniformMap[key] };
            }
            defineString.push('GRAPHICS_API_GLES3');
            let defineStr = '';
            defineStr += '#define MAX_LIGHT_COUNT ' + Laya.Config3D.maxLightCount + '\n';
            defineStr += '#define MAX_LIGHT_COUNT_PER_CLUSTER ' + Laya.Config3D._maxAreaLightCountPerClusterAverage + '\n';
            defineStr += '#define CLUSTER_X_COUNT ' + Laya.Config3D.lightClusterCount.x + '\n';
            defineStr += '#define CLUSTER_Y_COUNT ' + Laya.Config3D.lightClusterCount.y + '\n';
            defineStr += '#define CLUSTER_Z_COUNT ' + Laya.Config3D.lightClusterCount.z + '\n';
            defineStr += '#define MORPH_MAX_COUNT ' + Laya.Config3D.maxMorphTargetCount + '\n';
            defineStr += '#define SHADER_CAPAILITY_LEVEL ' + Laya.LayaGL.renderEngine.getParams(Laya.RenderParams.SHADER_CAPAILITY_LEVEL) + '\n';
            const defMap = {};
            for (let i = defineString.length - 1; i > -1; i--)
                defMap[defineString[i]] = true;
            let keyWithArray;
            let vsOut = '', fsOut = '';
            const vs = VS.toscript(defMap, []);
            const fs = FS.toscript(defMap, []);
            const vsTod = {};
            const fsTod = {};
            const arrayMap = {};
            {
                const token = WebGPUShaderCompileDef.compile(defineStr + vs.join('\n'));
                const defMap = {};
                defineString.forEach(def => { defMap[def] = true; });
                defMap['GL_FRAGMENT_PRECISION_HIGH'] = true;
                vsOut = WebGPUShaderCompileUtil.toScript(token, defMap, vsTod);
                if (vsTod.uniform) {
                    for (const key in vsTod.uniform) {
                        if (!uniformMapEx[key]) {
                            if (vsTod.uniform[key].length && vsTod.uniform[key].length[0]) {
                                keyWithArray = `${key}[${vsTod.uniform[key].length[0]}]`;
                                uniformMapEx[key] = {
                                    name: keyWithArray,
                                    type: this._getAttributeS2T(vsTod.uniform[key].type)
                                };
                                arrayMap[keyWithArray] = vsTod.uniform[key].length[0];
                            }
                            else
                                uniformMapEx[key] = {
                                    name: key,
                                    type: this._getAttributeS2T(vsTod.uniform[key].type)
                                };
                        }
                    }
                }
            }
            {
                const token = WebGPUShaderCompileDef.compile(defineStr + fs.join('\n'));
                const defMap = {};
                defineString.forEach(def => { defMap[def] = true; });
                defMap['GL_FRAGMENT_PRECISION_HIGH'] = true;
                fsOut = WebGPUShaderCompileUtil.toScript(token, defMap, fsTod);
                if (fsTod.uniform) {
                    for (const key in fsTod.uniform) {
                        if (!uniformMapEx[key]) {
                            if (fsTod.uniform[key].length && fsTod.uniform[key].length[0]) {
                                keyWithArray = `${key}[${fsTod.uniform[key].length[0]}]`;
                                uniformMapEx[key] = {
                                    name: keyWithArray,
                                    type: this._getAttributeS2T(fsTod.uniform[key].type)
                                };
                                arrayMap[keyWithArray] = fsTod.uniform[key].length[0];
                            }
                            else
                                uniformMapEx[key] = {
                                    name: key,
                                    type: this._getAttributeS2T(fsTod.uniform[key].type)
                                };
                        }
                    }
                }
            }
            const uniform_vs = new WebGPU_GLSLProcess().getUniforms(vsOut);
            const uniform_fs = new WebGPU_GLSLProcess().getUniforms(fsOut);
            for (let i = uniform_vs.length - 1; i > -1; i--) {
                const name = uniform_vs[i].name;
                const type = uniform_vs[i].fields.type;
                const arrayLength = uniform_vs[i].fields.arrayLength;
                if (uniformMapEx[name] && type === 'sampler2DShadow')
                    uniformMapEx[name].shadow = true;
                else {
                    uniformMapEx[name] = {
                        name,
                        type: this._getAttributeS2T(type),
                        shadow: type === 'sampler2DShadow' ? true : undefined
                    };
                }
                if (arrayLength !== undefined)
                    arrayMap[`${name}[${arrayLength}]`] = arrayLength;
            }
            for (let i = uniform_fs.length - 1; i > -1; i--) {
                const name = uniform_fs[i].name;
                const type = uniform_fs[i].fields.type;
                const arrayLength = uniform_fs[i].fields.arrayLength;
                if (uniformMapEx[name] && type === 'sampler2DShadow')
                    uniformMapEx[name].shadow = true;
                else {
                    uniformMapEx[name] = {
                        name,
                        type: this._getAttributeS2T(type),
                        shadow: type === 'sampler2DShadow' ? true : undefined
                    };
                }
                if (arrayLength !== undefined)
                    arrayMap[`${name}[${arrayLength}]`] = arrayLength;
            }
            return { uniform: uniformMapEx, arr: arrayMap };
        }
    }
    WebGPUCodeGenerator.inited = false;
    WebGPUCodeGenerator.forNaga = true;

    class WebGPURenderEngineFactory {
        createUniformBufferObject(glPointer, name, bufferUsage, byteLength, isSingle) {
            throw new Laya.NotImplementedError();
        }
        async createEngine(config, canvas) {
            const gpuConfig = new WebGPUConfig();
            gpuConfig.alphaMode = Laya.Config.premultipliedAlpha ? "premultiplied" : "opaque";
            gpuConfig.colorSpace = "srgb";
            switch (Laya.Config.powerPreference) {
                case "default":
                    gpuConfig.powerPreference = "high-performance";
                    break;
                default:
                    gpuConfig.powerPreference = Laya.Config.powerPreference;
                    break;
            }
            gpuConfig.deviceDescriptor.requiredFeatures = [
                "depth-clip-control",
                "depth32float-stencil8",
                "texture-compression-bc",
                "texture-compression-etc2",
                "texture-compression-astc",
                "timestamp-query",
                "indirect-first-instance",
                "shader-f16",
                "rg11b10ufloat-renderable",
                "bgra8unorm-storage",
                "float32-filterable",
            ];
            const engine = new WebGPURenderEngine(gpuConfig, canvas._source);
            Laya.LayaGL.renderEngine = engine;
            await engine.initRenderEngine();
            Laya.LayaGL.textureContext = engine.getTextureContext();
            await WebGPUCodeGenerator.init();
        }
    }
    Laya.Laya.addBeforeInitCallback(() => {
        if (!Laya.LayaGL.renderOBJCreate)
            Laya.LayaGL.renderOBJCreate = new WebGPURenderEngineFactory();
    });

    class WebGPUConfig {
        constructor() {
            this.deviceDescriptor = {};
            this.alphaMode = 'premultiplied';
            this.usage = GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC;
            this.colorSpace = 'srgb';
            this.depthStencilFormat = exports.WebGPUTextureFormat.depth24plus_stencil8;
            this.msaa = false;
        }
    }
    class WebGPURenderEngine {
        constructor(config, canvas) {
            this.screenResized = false;
            this._remapZ = false;
            this._screenInvertY = true;
            this._lodTextureSample = false;
            this._breakTextureSample = false;
            this._GPUStatisticsInfo = new Map();
            this.objectName = 'WebGPURenderEngine';
            this._propertyNameMap = {};
            this._propertyNameCounter = 0;
            this._defineMap = {};
            this._defineCounter = 0;
            this._maskMap = [];
            this._texGammaDefine = {};
            this._config = config;
            this._canvas = canvas;
            if (navigator.gpu)
                WebGPURenderEngine._instance = this;
            else
                console.error('WebGPU is not supported by your browser');
            this.gpuBufferMgr = new WebGPUBufferManager(WebGPUGlobal.useBigBuffer);
            this._initStatisticsInfo();
            this.globalId = WebGPUGlobal.getId(this);
        }
        _getAdapter() {
            return navigator.gpu.requestAdapter({ powerPreference: this._config.powerPreference });
        }
        _initAdapter(adapter) {
            var _a;
            if (!adapter) {
                throw 'Could not retrieve a WebGPU adapter (adapter is null).';
            }
            else {
                this._adapter = adapter;
                const deviceDescriptor = this._config.deviceDescriptor;
                this._adapterSupportedExtensions = [];
                (_a = this._adapter.features) === null || _a === void 0 ? void 0 : _a.forEach(feature => this._adapterSupportedExtensions.push(feature));
                if (deviceDescriptor === null || deviceDescriptor === void 0 ? void 0 : deviceDescriptor.requiredFeatures) {
                    const requestedExtensions = deviceDescriptor.requiredFeatures;
                    const validExtensions = [];
                    for (const extension of requestedExtensions)
                        if (this._adapterSupportedExtensions.indexOf(extension) !== -1)
                            validExtensions.push(extension);
                    deviceDescriptor.requiredFeatures = validExtensions;
                }
            }
        }
        _getGPUdevice(deviceDescriptor) {
            this._supportCapatable = new WebGPUCapable(deviceDescriptor);
            return this._adapter.requestDevice(deviceDescriptor);
        }
        _unCapturedErrorCall(event) {
            console.warn('WebGPU unCaptured error: ' + event.error);
            console.warn('WebGPU unCaptured error message: ' + event.error.message);
        }
        _deviceLostCall(info) {
            console.error('WebGPU context lost' + info);
        }
        _initDevice(device) {
            this._device = device;
            this._deviceEnabledExtensions = [];
            this._device.features.forEach(element => {
                this._deviceEnabledExtensions.push(element);
            });
            this._device.addEventListener('uncapturederror', this._unCapturedErrorCall);
            this._device.lost.then(this._deviceLostCall);
        }
        async _initAsync() {
            return await this._getAdapter()
                .then((adapter) => {
                this._initAdapter(adapter);
                return this._getGPUdevice(this._config.deviceDescriptor);
            })
                .then((device) => {
                this._initDevice(device);
                return Promise.resolve();
            }, (e) => {
                console.log(e);
                throw 'Could not get WebGPU device';
            });
        }
        resizeOffScreen(width, height) {
            const w = width | 0;
            const h = height | 0;
            if (w === 0 || h === 0)
                return;
            if (!this._screenRT
                || this._screenRT._textures[0].width !== w
                || this._screenRT._textures[0].height !== h) {
                console.log('canvas resize =', w, h);
                this.createScreenRT();
            }
        }
        getDevice() {
            return this._device;
        }
        startFrame() {
            this.gpuBufferMgr.startFrame();
        }
        upload() {
            this.gpuBufferMgr.upload();
        }
        _initContext() {
            var _a;
            this._context = this._canvas.getContext('webgpu');
            if (!this._context)
                throw 'Could not get context';
            const preferredFormat = navigator.gpu.getPreferredCanvasFormat();
            console.log('preferredFormat =', preferredFormat);
            const format = this._config.swapChainFormat || exports.WebGPUTextureFormat.bgra8unorm;
            const usage = (_a = this._config.usage) !== null && _a !== void 0 ? _a : GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC;
            this._context.configure({
                device: this._device,
                format,
                usage,
                alphaMode: this._config.alphaMode,
            });
            WebGPURenderEngine._offscreenFormat = format;
        }
        async initRenderEngine() {
            await this._initAsync();
            this._initContext();
            this._textureContext = new WebGPUTextureContext(this);
            this.createScreenRT();
        }
        copySubFrameBuffertoTex(texture, level, xoffset, yoffset, x, y, width, height) {
            throw new Laya.NotImplementedError;
        }
        propertyNameToID(name) {
            if (this._propertyNameMap[name] !== undefined) {
                return this._propertyNameMap[name];
            }
            else {
                const id = this._propertyNameCounter++;
                this._propertyNameMap[name] = id;
                this._propertyNameMap[id] = name;
                return id;
            }
        }
        propertyIDToName(id) {
            return this._propertyNameMap[id];
        }
        getDefineByName(name) {
            let define = this._defineMap[name];
            if (!define) {
                const maskMap = this._maskMap;
                const counter = this._defineCounter;
                const index = Math.floor(counter / 32);
                const value = 1 << counter % 32;
                define = new Laya.ShaderDefine(index, value);
                this._defineMap[name] = define;
                if (index === maskMap.length) {
                    maskMap.length++;
                    maskMap[index] = {};
                }
                maskMap[index][value] = name;
                this._defineCounter++;
            }
            return define;
        }
        getNamesByDefineData(defineData, out) {
            const maskMap = this._maskMap;
            const mask = defineData._mask;
            out.length = 0;
            for (let i = 0, n = defineData._length; i < n; i++) {
                const subMaskMap = maskMap[i];
                const subMask = mask[i];
                for (let j = 0; j < 32; j++) {
                    const d = 1 << j;
                    if (subMask > 0 && d > subMask)
                        break;
                    if (subMask & d)
                        out.push(subMaskMap[d]);
                }
            }
        }
        addTexGammaDefine(key, value) {
            this._texGammaDefine[key] = value;
        }
        getParams(params) {
            switch (params) {
                case Laya.RenderParams.Max_Active_Texture_Count:
                    return this._device.limits.maxSampledTexturesPerShaderStage;
                case Laya.RenderParams.Max_Uniform_Count:
                    return this._device.limits.maxUniformBuffersPerShaderStage;
                case Laya.RenderParams.Max_AnisoLevel_Count:
                    return 16;
                case Laya.RenderParams.MAX_Texture_Size:
                    return this._device.limits.maxTextureDimension2D;
                case Laya.RenderParams.MAX_Texture_Image_Uint:
                    return 1024;
            }
            return 0;
        }
        getCapable(capatableType) {
            return this._supportCapatable.getCapable(capatableType);
        }
        getTextureContext() {
            return this._textureContext;
        }
        getCreateRenderOBJContext() {
            return new WebGPURenderEngineFactory();
        }
        _initStatisticsInfo() {
            for (let i = 0; i < Laya.GPUEngineStatisticsInfo.Count; i++) {
                this._GPUStatisticsInfo.set(i, 0);
            }
        }
        _addStatisticsInfo(info, value) {
            this._enableStatistics && this._GPUStatisticsInfo.set(info, this._GPUStatisticsInfo.get(info) + value);
        }
        clearStatisticsInfo() {
            if (this._enableStatistics) {
                for (let i = 0; i < Laya.GPUEngineStatisticsInfo.FrameClearCount; i++) {
                    this._GPUStatisticsInfo.set(i, 0);
                }
            }
        }
        getStatisticsInfo(info) {
            return this._GPUStatisticsInfo.get(info);
        }
        createScreenRT() {
            this._screenRT =
                this._textureContext.createRenderTargetInternal(this._canvas.width, this._canvas.height, Laya.RenderTargetFormat.R8G8B8A8, Laya.RenderTargetFormat.None, false, false, 1);
            this.screenResized = true;
        }
        endFrame() {
        }
    }

    class WebGPURenderCommandEncoder {
        constructor() {
            this.objectName = 'WebGPURenderCommandEncoder';
            this._engine = WebGPURenderEngine._instance;
            this._device = this._engine.getDevice();
            this.globalId = WebGPUGlobal.getId(this);
        }
        startRender(renderPassDesc) {
            this._commandEncoder = this._device.createCommandEncoder();
            this._encoder = this._commandEncoder.beginRenderPass(renderPassDesc);
        }
        setPipeline(pipeline) {
            this._encoder.setPipeline(pipeline);
        }
        setIndexBuffer(buffer, indexFormat, byteSize, offset = 0) {
            this._encoder.setIndexBuffer(buffer, indexFormat, offset, byteSize);
        }
        setVertexBuffer(slot, buffer, offset = 0, size = 0) {
            this._encoder.setVertexBuffer(slot, buffer, offset, size);
        }
        drawIndirect(indirectBuffer, indirectOffset) {
        }
        drawIndexedIndirect(indirectBuffer, indirectOffset) {
        }
        setBindGroup(index, bindGroup, dynamicOffsets) {
            this._encoder.setBindGroup(index, bindGroup, dynamicOffsets);
        }
        setBindGroupByDataOffaset(index, bindGroup, dynamicOffsetsData, dynamicOffsetsDataStart, dynamicOffsetsDataLength) {
            this._encoder.setBindGroup(index, bindGroup, dynamicOffsetsData, dynamicOffsetsDataStart, dynamicOffsetsDataLength);
        }
        setViewport(x, y, width, height, minDepth, maxDepth) {
            this._encoder.setViewport(x, y, width, height, minDepth, maxDepth);
        }
        setScissorRect(x, y, width, height) {
            this._encoder.setScissorRect(x, y, width, height);
        }
        setStencilReference(ref) {
            this._encoder.setStencilReference(ref);
        }
        end() {
            this._encoder.end();
        }
        finish() {
            return this._commandEncoder.finish();
        }
        playBundle(bundles) {
            this._encoder.executeBundles(bundles);
        }
        applyGeometry(geometry, setBuffer = true) {
            const { bufferState, indexFormat, drawType, instanceCount, _drawArrayInfo, _drawElementInfo } = geometry;
            const { _vertexBuffers: vertexBuffers, _bindedIndexBuffer: indexBuffer } = bufferState;
            let indexByte = 2;
            if (setBuffer) {
                vertexBuffers.forEach((vb, i) => this.setVertexBuffer(i, vb.source._source, 0, vb.source._size));
                if (indexBuffer) {
                    indexByte = geometry.gpuIndexByte;
                    this.setIndexBuffer(indexBuffer.source._source, geometry.gpuIndexFormat, indexBuffer.source._size, 0);
                }
            }
            let triangles = 0;
            let count = 0, start = 0;
            switch (drawType) {
                case Laya.DrawType.DrawArray:
                    for (let i = _drawArrayInfo.length - 1; i > -1; i--) {
                        count = _drawArrayInfo[i].count;
                        start = _drawArrayInfo[i].start;
                        triangles += count - 2;
                        this._encoder.draw(count, 1, start, 0);
                    }
                    break;
                case Laya.DrawType.DrawElement:
                    for (let i = _drawElementInfo.length - 1; i > -1; i--) {
                        count = _drawElementInfo[i].elementCount;
                        start = _drawElementInfo[i].elementStart;
                        triangles += count / 3;
                        this._encoder.drawIndexed(count, 1, start / indexByte, 0);
                    }
                    break;
                case Laya.DrawType.DrawArrayInstance:
                    for (let i = _drawArrayInfo.length - 1; i > -1; i--) {
                        count = _drawArrayInfo[i].count;
                        start = _drawArrayInfo[i].start;
                        triangles += (count - 2) * instanceCount;
                        this._encoder.draw(count, instanceCount, start, 0);
                        this._engine._addStatisticsInfo(Laya.GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, 1);
                    }
                    break;
                case Laya.DrawType.DrawElementInstance:
                    for (let i = _drawElementInfo.length - 1; i > -1; i--) {
                        count = _drawElementInfo[i].elementCount;
                        start = _drawElementInfo[i].elementStart;
                        triangles += count / 3 * instanceCount;
                        this._encoder.drawIndexed(count, instanceCount, start / indexByte, 0);
                        this._engine._addStatisticsInfo(Laya.GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, 1);
                    }
                    break;
            }
            this._engine._addStatisticsInfo(Laya.GPUEngineStatisticsInfo.C_TriangleCount, triangles);
            return triangles;
        }
        applyGeometryPart(geometry, part, setBuffer = true) {
            const { bufferState, indexFormat, drawType, instanceCount, _drawArrayInfo, _drawElementInfo } = geometry;
            const { _vertexBuffers: vertexBuffers, _bindedIndexBuffer: indexBuffer } = bufferState;
            let indexByte = 2;
            if (setBuffer) {
                vertexBuffers.forEach((vb, i) => this.setVertexBuffer(i, vb.source._source, 0, vb.source._size));
                if (indexBuffer) {
                    indexByte = geometry.gpuIndexByte;
                    this.setIndexBuffer(indexBuffer.source._source, geometry.gpuIndexFormat, indexBuffer.source._size, 0);
                }
            }
            let triangles = 0;
            let count = 0, start = 0;
            switch (drawType) {
                case Laya.DrawType.DrawArray:
                    count = _drawArrayInfo[part].count;
                    start = _drawArrayInfo[part].start;
                    triangles = count - 2;
                    this._encoder.draw(count, 1, start, 0);
                    break;
                case Laya.DrawType.DrawElement:
                    count = _drawElementInfo[part].elementCount;
                    start = _drawElementInfo[part].elementStart;
                    triangles = count / 3;
                    this._encoder.drawIndexed(count, 1, start / indexByte, 0);
                    break;
                case Laya.DrawType.DrawArrayInstance:
                    count = _drawArrayInfo[part].count;
                    start = _drawArrayInfo[part].start;
                    triangles = (count - 2) * instanceCount;
                    this._encoder.draw(count, instanceCount, start, 0);
                    this._engine._addStatisticsInfo(Laya.GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, 1);
                    break;
                case Laya.DrawType.DrawElementInstance:
                    count = _drawElementInfo[part].elementCount;
                    start = _drawElementInfo[part].elementStart;
                    triangles = count / 3 * instanceCount;
                    this._encoder.drawIndexed(count, instanceCount, start / indexByte, 0);
                    this._engine._addStatisticsInfo(Laya.GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, 1);
                    break;
            }
            this._engine._addStatisticsInfo(Laya.GPUEngineStatisticsInfo.C_TriangleCount, triangles);
            return triangles;
        }
        destroy() {
            WebGPUGlobal.releaseId(this);
        }
    }

    class WebGPURenderContext2D {
        constructor() {
            this.invertY = false;
            this.pipelineMode = 'Forward';
            this.sceneData = new WebGPUShaderData();
            this.cameraData = new WebGPUShaderData();
            this.renderCommand = new WebGPURenderCommandEncoder();
            this.pipelineCache = [];
            this._needStart = true;
            this._globalConfigShaderData = Laya.Shader3D._configDefineValues;
            this._clearColor = new Laya.Color();
            this._viewport = new Laya.Viewport();
        }
        drawRenderElementList(list) {
            const len = list.length;
            if (len === 0)
                return 0;
            if (this._needStart) {
                this._start();
                this._needStart = false;
            }
            if (WebGPUGlobal.useGlobalContext)
                Laya.WebGPUContext.startRender();
            for (let i = 0, n = list.length; i < n; i++) {
                list.elements[i].prepare(this);
                list.elements[i].render(this, this.renderCommand);
            }
            this._submit();
            return 0;
        }
        setOffscreenView(width, height) {
            this._offscreenWidth = width;
            this._offscreenHeight = height;
        }
        setRenderTarget(value, clear, clearColor) {
            this._needClearColor = clear;
            clearColor && clearColor.cloneTo(this._clearColor);
            if (this.destRT !== value) {
                this.destRT = value;
                this._needStart = true;
            }
            if (value)
                this._viewport.set(0, 0, value._textures[0].width, value._textures[0].height);
        }
        drawRenderElementOne(node) {
            if (this._needStart) {
                this._start();
                this._needStart = false;
            }
            if (WebGPUGlobal.useGlobalContext)
                Laya.WebGPUContext.startRender();
            node.prepare(this);
            node.render(this, this.renderCommand);
            this._submit();
        }
        _submit() {
            this.renderCommand.end();
            if (WebGPUGlobal.useBigBuffer)
                WebGPURenderEngine._instance.upload();
            this.device.queue.submit([this.renderCommand.finish()]);
            this._needStart = true;
            WebGPUStatis.addSubmit();
        }
        _setScreenRT() {
            if (!this.destRT) {
                WebGPURenderEngine._instance._screenRT._textures[0].resource = WebGPURenderEngine._instance._context.getCurrentTexture();
                WebGPURenderEngine._instance._screenRT._textures[0].multiSamplers = 1;
                this.setRenderTarget(WebGPURenderEngine._instance._screenRT, this._needClearColor, this._clearColor);
            }
        }
        _start() {
            this._setScreenRT();
            this.device = WebGPURenderEngine._instance.getDevice();
            const renderPassDesc = WebGPURenderPassHelper.getDescriptor(this.destRT, this._needClearColor ? Laya.RenderClearFlag.Color : Laya.RenderClearFlag.Nothing, this._clearColor);
            this.renderCommand.startRender(renderPassDesc);
            this.renderCommand.setViewport(this._viewport.x, this._viewport.y, this._viewport.width, this._viewport.height, 0, 1);
            this._needClearColor = false;
        }
    }

    class WebGPUBlendState {
        static getBlendState(blend, operationRGB, srcBlendRGB, dstBlendRGB, operationAlpha, srcBlendAlpha, dstBlendAlpha) {
            const cacheID = this._getBlendStateCacheID(blend, operationRGB, srcBlendRGB, dstBlendRGB, operationAlpha, srcBlendAlpha, dstBlendAlpha);
            let state = this._cache[cacheID];
            if (!state)
                this._cache[cacheID] = state = { state: this._createBlendState(operationRGB, srcBlendRGB, dstBlendRGB, operationAlpha, srcBlendAlpha, dstBlendAlpha), key: cacheID, id: this._idCounter++ };
            return state;
        }
        static _getBlendStateCacheID(blend, operationRGB, srcBlendRGB, dstBlendRGB, operationAlpha, srcBlendAlpha, dstBlendAlpha) {
            if (blend === Laya.BlendType.BLEND_DISABLE) {
                return 0;
            }
            else {
                return (blend << this._pointer_BlendType) +
                    (srcBlendRGB << this._pointer_srcBlendRGB_BlendFactor) +
                    (dstBlendRGB << this._pointer_dstBlendRGB_BlendFactor) +
                    (srcBlendAlpha << this._pointer_srcBlendAlpha_BlendFactor) +
                    (dstBlendAlpha << this._pointer_dstBlendAlpha_BlendFactor) +
                    (operationRGB << this._pointer_OperationRGB_BlendEquationSeparate) +
                    (operationAlpha << this._pointer_OperationAlpha_BlendEquationSeparate);
            }
        }
        static _createBlendState(operationRGB, srcBlendRGB, dstBlendRGB, operationAlpha, srcBlendAlpha, dstBlendAlpha) {
            return {
                color: this._getComponent(operationRGB, srcBlendRGB, dstBlendRGB),
                alpha: this._getComponent(operationAlpha, srcBlendAlpha, dstBlendAlpha)
            };
        }
        static _getFactor(factor) {
            switch (factor) {
                case Laya.BlendFactor.Zero:
                    return "zero";
                case Laya.BlendFactor.One:
                    return "one";
                case Laya.BlendFactor.SourceColor:
                    return "src";
                case Laya.BlendFactor.OneMinusSourceColor:
                    return "one-minus-src";
                case Laya.BlendFactor.DestinationColor:
                    return "dst";
                case Laya.BlendFactor.OneMinusDestinationColor:
                    return "one-minus-dst";
                case Laya.BlendFactor.SourceAlpha:
                    return "src-alpha";
                case Laya.BlendFactor.OneMinusSourceAlpha:
                    return "one-minus-src-alpha";
                case Laya.BlendFactor.DestinationAlpha:
                    return "dst-alpha";
                case Laya.BlendFactor.OneMinusDestinationAlpha:
                    return "one-minus-dst-alpha";
                case Laya.BlendFactor.SourceAlphaSaturate:
                    return "src-alpha-saturated";
                case Laya.BlendFactor.BlendColor:
                    return "constant";
                case Laya.BlendFactor.OneMinusBlendColor:
                    return "one-minus-constant";
            }
        }
        static _getComponent(operation, src, dst) {
            const comp = {};
            switch (operation) {
                case Laya.BlendEquationSeparate.ADD:
                    comp.operation = "add";
                    break;
                case Laya.BlendEquationSeparate.SUBTRACT:
                    comp.operation = "subtract";
                    break;
                case Laya.BlendEquationSeparate.MAX:
                    comp.operation = "max";
                    break;
                case Laya.BlendEquationSeparate.MIN:
                    comp.operation = "min";
                    break;
                case Laya.BlendEquationSeparate.REVERSE_SUBTRACT:
                    comp.operation = "reverse-subtract";
                    break;
                default:
                    comp.operation = "add";
                    break;
            }
            comp.srcFactor = WebGPUBlendState._getFactor(src);
            comp.dstFactor = WebGPUBlendState._getFactor(dst);
            return comp;
        }
    }
    WebGPUBlendState._idCounter = 0;
    WebGPUBlendState._pointer_BlendType = 0;
    WebGPUBlendState._pointer_OperationRGB_BlendEquationSeparate = 4;
    WebGPUBlendState._pointer_OperationAlpha_BlendEquationSeparate = 8;
    WebGPUBlendState._pointer_srcBlendRGB_BlendFactor = 12;
    WebGPUBlendState._pointer_dstBlendRGB_BlendFactor = 16;
    WebGPUBlendState._pointer_srcBlendAlpha_BlendFactor = 20;
    WebGPUBlendState._pointer_dstBlendAlpha_BlendFactor = 24;
    WebGPUBlendState._cache = {};
    class WebGPUDepthStencilState {
        static getDepthStencilState(format, depthWriteEnabled, depthCompare, stencilParam = null, depthBiasParam = null) {
            const cacheID = this._getDepthStencilCacheID(format, depthWriteEnabled, depthCompare, stencilParam, depthBiasParam);
            let state = this._cache[cacheID];
            if (!state)
                this._cache[cacheID] = state = { state: this._createDepthStencilState(format, depthWriteEnabled, depthCompare, stencilParam, depthBiasParam), key: cacheID, id: this._idCounter++ };
            return state;
        }
        static _getDepthStencilCacheID(format, depthWriteEnabled, depthCompare, stencilParam = null, depthBiasParam = null) {
            if (stencilParam['enable'])
                return (Number(depthWriteEnabled) << this._pointer_DepthWriteEnable) +
                    (depthCompare << this._pointer_DepthCompare) +
                    (format << this._pointer_DepthFormat) +
                    (stencilParam['test'] << this._pointer_StencilTest) +
                    (stencilParam['op'].x << this._pointer_StencilOp1) +
                    (stencilParam['op'].y << this._pointer_StencilOp2) +
                    (stencilParam['op'].z << this._pointer_StencilOp3);
            return (Number(depthWriteEnabled) << this._pointer_DepthWriteEnable) +
                (depthCompare << this._pointer_DepthCompare) +
                (format << this._pointer_DepthFormat);
        }
        static _createDepthStencilState(format, depthWriteEnabled, depthCompare, stencilParam = null, depthBiasParam = null) {
            let stateFormat;
            let stateDepthCompare;
            switch (format) {
                case Laya.RenderTargetFormat.DEPTH_16:
                    stateFormat = "depth16unorm";
                    break;
                case Laya.RenderTargetFormat.DEPTHSTENCIL_24_8:
                    stateFormat = "depth24plus-stencil8";
                    break;
                case Laya.RenderTargetFormat.DEPTH_32:
                    stateFormat = "depth32float";
                    break;
                case Laya.RenderTargetFormat.STENCIL_8:
                    stateFormat = "stencil8";
                    break;
                case Laya.RenderTargetFormat.DEPTHSTENCIL_24_Plus:
                    stateFormat = "depth24plus";
                    break;
                default:
                    stateFormat = "depth24plus-stencil8";
                    break;
            }
            switch (depthCompare) {
                case Laya.CompareFunction.Never:
                    stateDepthCompare = "never";
                    break;
                case Laya.CompareFunction.Less:
                    stateDepthCompare = "less";
                    break;
                case Laya.CompareFunction.Equal:
                    stateDepthCompare = "equal";
                    break;
                case Laya.CompareFunction.LessEqual:
                    stateDepthCompare = "less-equal";
                    break;
                case Laya.CompareFunction.Greater:
                    stateDepthCompare = "greater";
                    break;
                case Laya.CompareFunction.NotEqual:
                    stateDepthCompare = "not-equal";
                    break;
                case Laya.CompareFunction.GreaterEqual:
                    stateDepthCompare = "greater-equal";
                    break;
                case Laya.CompareFunction.Always:
                    stateDepthCompare = "always";
                    break;
                default:
                    stateDepthCompare = "less";
                    break;
            }
            const state = {
                format: stateFormat,
                depthCompare: stateDepthCompare,
                depthWriteEnabled,
            };
            if (stencilParam['enable']) {
                let stateStencilCompare;
                let stateFailOp;
                let stateDepthFailOp;
                let statePassOp;
                switch (stencilParam['test']) {
                    case Laya.RenderState.STENCILTEST_NEVER:
                        stateStencilCompare = 'never';
                        break;
                    case Laya.RenderState.STENCILTEST_LESS:
                        stateStencilCompare = 'less';
                        break;
                    case Laya.RenderState.STENCILTEST_EQUAL:
                        stateStencilCompare = 'equal';
                        break;
                    case Laya.RenderState.STENCILTEST_GREATER:
                        stateStencilCompare = 'greater';
                        break;
                    case Laya.RenderState.STENCILTEST_NOTEQUAL:
                        stateStencilCompare = 'not-equal';
                        break;
                    case Laya.RenderState.STENCILTEST_GEQUAL:
                        stateStencilCompare = 'greater-equal';
                        break;
                    case Laya.RenderState.STENCILTEST_ALWAYS:
                        stateStencilCompare = 'always';
                        break;
                    default:
                        stateStencilCompare = 'less';
                        break;
                }
                switch (stencilParam['op'].x) {
                    case Laya.StencilOperation.Keep:
                        stateFailOp = 'keep';
                        break;
                    case Laya.StencilOperation.Zero:
                        stateFailOp = 'zero';
                        break;
                    case Laya.StencilOperation.Invert:
                        stateFailOp = 'invert';
                        break;
                    case Laya.StencilOperation.Replace:
                        stateFailOp = 'replace';
                        break;
                    case Laya.StencilOperation.IncrementSaturate:
                        stateFailOp = 'increment-clamp';
                        break;
                    case Laya.StencilOperation.DecrementSaturate:
                        stateFailOp = 'decrement-clamp';
                        break;
                    case Laya.StencilOperation.IncrementWrap:
                        stateFailOp = 'increment-wrap';
                        break;
                    case Laya.StencilOperation.DecrementWrap:
                        stateFailOp = 'decrement-wrap';
                        break;
                }
                switch (stencilParam['op'].y) {
                    case Laya.StencilOperation.Keep:
                        stateDepthFailOp = 'keep';
                        break;
                    case Laya.StencilOperation.Zero:
                        stateDepthFailOp = 'zero';
                        break;
                    case Laya.StencilOperation.Invert:
                        stateDepthFailOp = 'invert';
                        break;
                    case Laya.StencilOperation.Replace:
                        stateDepthFailOp = 'replace';
                        break;
                    case Laya.StencilOperation.IncrementSaturate:
                        stateDepthFailOp = 'increment-clamp';
                        break;
                    case Laya.StencilOperation.DecrementSaturate:
                        stateDepthFailOp = 'decrement-clamp';
                        break;
                    case Laya.StencilOperation.IncrementWrap:
                        stateDepthFailOp = 'increment-wrap';
                        break;
                    case Laya.StencilOperation.DecrementWrap:
                        stateDepthFailOp = 'decrement-wrap';
                        break;
                }
                switch (stencilParam['op'].z) {
                    case Laya.StencilOperation.Keep:
                        statePassOp = 'keep';
                        break;
                    case Laya.StencilOperation.Zero:
                        statePassOp = 'zero';
                        break;
                    case Laya.StencilOperation.Invert:
                        statePassOp = 'invert';
                        break;
                    case Laya.StencilOperation.Replace:
                        statePassOp = 'replace';
                        break;
                    case Laya.StencilOperation.IncrementSaturate:
                        statePassOp = 'increment-clamp';
                        break;
                    case Laya.StencilOperation.DecrementSaturate:
                        statePassOp = 'decrement-clamp';
                        break;
                    case Laya.StencilOperation.IncrementWrap:
                        statePassOp = 'increment-wrap';
                        break;
                    case Laya.StencilOperation.DecrementWrap:
                        statePassOp = 'decrement-wrap';
                        break;
                }
                state.stencilFront = {
                    compare: stateStencilCompare,
                    failOp: stateFailOp,
                    depthFailOp: stateDepthFailOp,
                    passOp: statePassOp
                };
                state.stencilReadMask = 0xff;
                if (stencilParam['write'])
                    state.stencilWriteMask = 0xff;
            }
            return state;
        }
    }
    WebGPUDepthStencilState._idCounter = 0;
    WebGPUDepthStencilState._pointer_DepthWriteEnable = 0;
    WebGPUDepthStencilState._pointer_DepthCompare = 4;
    WebGPUDepthStencilState._pointer_DepthFormat = 8;
    WebGPUDepthStencilState._pointer_StencilTest = 12;
    WebGPUDepthStencilState._pointer_StencilOp1 = 16;
    WebGPUDepthStencilState._pointer_StencilOp2 = 20;
    WebGPUDepthStencilState._pointer_StencilOp3 = 24;
    WebGPUDepthStencilState._cache = {};
    class WebGPUPrimitiveState {
        static getGPUPrimitiveState(topology, frontFace, cullMode) {
            const cacheID = this._getGPUPrimitiveStateID(topology, frontFace, cullMode);
            let state = this._cache[cacheID];
            if (!state)
                this._cache[cacheID] = state = { state: this._createPrimitiveState(topology, frontFace, cullMode), key: cacheID, id: this._idCounter++ };
            return state;
        }
        static _getGPUPrimitiveStateID(topology, frontFace, cullMode) {
            return (topology << this._pointer_Topology) +
                (frontFace << this._pointer_FrontFace) +
                (cullMode << this._pointer_CullMode);
        }
        static _createPrimitiveState(topology, frontFace, cullMode) {
            const state = {};
            switch (topology) {
                case Laya.MeshTopology.Points:
                    state.topology = "point-list";
                    break;
                case Laya.MeshTopology.Lines:
                    state.topology = "line-list";
                    break;
                case Laya.MeshTopology.LineStrip:
                    state.topology = "line-strip";
                    break;
                case Laya.MeshTopology.Triangles:
                    state.topology = "triangle-list";
                    break;
                case Laya.MeshTopology.TriangleStrip:
                    state.topology = "triangle-strip";
                    break;
                default:
                    state.topology = "triangle-list";
                    break;
            }
            switch (cullMode) {
                case Laya.CullMode.Off:
                    state.cullMode = "none";
                    break;
                case Laya.CullMode.Back:
                    state.cullMode = "back";
                    break;
                case Laya.CullMode.Front:
                    state.cullMode = "front";
                    break;
            }
            switch (frontFace) {
                case Laya.FrontFace.CCW:
                    state.frontFace = "cw";
                    break;
                case Laya.FrontFace.CW:
                    state.frontFace = "ccw";
                    break;
            }
            return state;
        }
    }
    WebGPUPrimitiveState._idCounter = 0;
    WebGPUPrimitiveState._pointer_Topology = 0;
    WebGPUPrimitiveState._pointer_FrontFace = 4;
    WebGPUPrimitiveState._pointer_CullMode = 8;
    WebGPUPrimitiveState._cache = {};
    class WebGPURenderPipeline {
        static getRenderPipeline(info, shaderInstance, renderTarget, entries, stateKey) {
            var _a;
            const primitiveState = WebGPUPrimitiveState.getGPUPrimitiveState(info.geometry.mode, info.frontFace, info.cullMode);
            return this._createRenderPipeline(info.blendState.state, (_a = info.depthStencilState) === null || _a === void 0 ? void 0 : _a.state, primitiveState.state, info.geometry.bufferState.vertexState, shaderInstance, renderTarget, entries, stateKey);
        }
        static _createRenderPipeline(blendState, depthState, primitiveState, vertexBuffers, shaderInstance, renderTarget, entries, stateKey) {
            const device = WebGPURenderEngine._instance.getDevice();
            const descriptor = shaderInstance.getRenderPipelineDescriptor();
            descriptor.label = 'render_' + this.idCounter;
            descriptor.vertex.buffers = vertexBuffers;
            const textureNum = renderTarget._textures.length;
            if (renderTarget._textures[0]._webGPUFormat === 'depth16unorm'
                || renderTarget._textures[0]._webGPUFormat === 'depth24plus-stencil8'
                || renderTarget._textures[0]._webGPUFormat === 'depth32float') {
                renderTarget._colorStates.length = 0;
                renderTarget._colorStates[0] = {
                    format: renderTarget._depthTexture._webGPUFormat,
                    blend: blendState,
                    writeMask: GPUColorWrite.ALL,
                };
            }
            else {
                if (renderTarget._colorStates.length === textureNum) {
                    for (let i = renderTarget._colorStates.length - 1; i > -1; i--) {
                        renderTarget._colorStates[i].format = renderTarget._textures[i]._webGPUFormat;
                        renderTarget._colorStates[i].blend = blendState;
                    }
                }
                else {
                    renderTarget._colorStates.length = textureNum;
                    for (let i = 0; i < textureNum; i++) {
                        renderTarget._colorStates[i] = {
                            format: renderTarget._textures[i]._webGPUFormat,
                            blend: blendState,
                            writeMask: GPUColorWrite.ALL,
                        };
                    }
                }
            }
            descriptor.fragment.targets = renderTarget._colorStates;
            descriptor.primitive = primitiveState;
            if (renderTarget._textures[0]._webGPUFormat === 'depth16unorm'
                || renderTarget._textures[0]._webGPUFormat === 'depth24plus-stencil8'
                || renderTarget._textures[0]._webGPUFormat === 'depth32float') {
                descriptor.depthStencil = {
                    format: renderTarget._textures[0]._webGPUFormat,
                    depthWriteEnabled: true,
                    depthCompare: 'less',
                };
            }
            else {
                if (depthState)
                    descriptor.depthStencil = depthState;
                else
                    delete descriptor.depthStencil;
            }
            descriptor.layout = shaderInstance.createPipelineLayout(device, 'pipelineLayout_' + this.idCounter, entries);
            descriptor.multisample.count = renderTarget._samples;
            const renderPipeline = device.createRenderPipeline(descriptor);
            console.log('create renderPipeline_' + this.idCounter, stateKey, descriptor, renderTarget._samples, shaderInstance);
            this.idCounter++;
            return renderPipeline;
        }
    }
    WebGPURenderPipeline.idCounter = 0;

    class WebGPURenderElement2D {
        constructor() {
            this._stateKey = [];
            this._pipeline = [];
            this._shaderInstances = [];
            this._passNum = 0;
            this._passIndex = [];
            this._shaderDataState = {};
            this._shaderDataObject = {};
            this.needClearBundle = false;
            this.isStatic = false;
            this.staticChange = false;
            this.objectName = 'WebGPURenderElement2D';
            this.renderStateIsBySprite = true;
            this.globalId = WebGPUGlobal.getId(this);
        }
        _getShaderPassUniform(shaderpass, defineData) {
            const defineString = WebGPURenderElement2D._defineStrings;
            Laya.Shader3D._getNamesByDefineData(defineData, defineString);
            return WebGPUCodeGenerator.collectUniform(defineString, shaderpass._owner._uniformMap, shaderpass._VS, shaderpass._PS);
        }
        _collectUniform(compileDefine) {
            const uniformMap = {};
            const arrayMap = {};
            const passes = this.subShader._passes;
            for (let i = passes.length - 1; i > -1; i--) {
                const { uniform, arr } = this._getShaderPassUniform(passes[i], compileDefine);
                for (const key in uniform)
                    uniformMap[key] = uniform[key];
                for (const key in arr)
                    arrayMap[key] = arr[key];
            }
            return { uniformMap, arrayMap };
        }
        _compileShader(context) {
            var _a, _b, _c, _d, _e, _f;
            const compileDefine = WebGPURenderElement2D._compileDefine;
            if (this._sceneData)
                this._sceneData._defineDatas.cloneTo(compileDefine);
            else if (context._globalConfigShaderData)
                context._globalConfigShaderData.cloneTo(compileDefine);
            const returnGamma = !(context.destRT) || ((context.destRT)._textures[0].gammaCorrection != 1);
            if (returnGamma)
                compileDefine.add(Laya.ShaderDefines2D.GAMMASPACE);
            else
                compileDefine.remove(Laya.ShaderDefines2D.GAMMASPACE);
            compileDefine.add(Laya.ShaderDefines2D.GAMMASPACE);
            if (context.invertY)
                compileDefine.add(Laya.ShaderDefines2D.INVERTY);
            else
                compileDefine.remove(Laya.ShaderDefines2D.INVERTY);
            if (this.value2DShaderData)
                compileDefine.addDefineDatas(this.value2DShaderData.getDefineData());
            if (this.materialShaderData)
                compileDefine.addDefineDatas(this.materialShaderData._defineDatas);
            for (let i = 0; i < this._passNum; i++) {
                const index = this._passIndex[i];
                const pass = this.subShader._passes[index];
                if (!pass.moduleData.getCacheShader(compileDefine.clone())) {
                    const { uniformMap, arrayMap } = this._collectUniform(compileDefine);
                    pass.uniformMap = uniformMap;
                    pass.arrayMap = arrayMap;
                }
                const shaderInstance = pass.withCompile(compileDefine.clone(), true);
                this._shaderInstances[index] = shaderInstance;
                if (i === 0) {
                    (_a = this._sceneData) === null || _a === void 0 ? void 0 : _a.createUniformBuffer(shaderInstance.uniformInfo[0], true);
                    (_b = this._cameraData) === null || _b === void 0 ? void 0 : _b.createUniformBuffer(shaderInstance.uniformInfo[1], true);
                    (_c = this.value2DShaderData) === null || _c === void 0 ? void 0 : _c.createUniformBuffer(shaderInstance.uniformInfo[2], false);
                    (_d = this.materialShaderData) === null || _d === void 0 ? void 0 : _d.createUniformBuffer(shaderInstance.uniformInfo[3], false);
                }
            }
            (_e = this.value2DShaderData) === null || _e === void 0 ? void 0 : _e.clearBindGroup();
            (_f = this.materialShaderData) === null || _f === void 0 ? void 0 : _f.clearBindGroup();
            this._takeCurPass(context.pipelineMode);
        }
        _calcStateKey(shaderInstance, dest, context) {
            let stateKey = '';
            stateKey += dest.formatId + '_';
            stateKey += dest._samples + '_';
            stateKey += shaderInstance._id + '_';
            stateKey += this.materialShaderData.stateKey;
            stateKey += this.geometry.bufferState.stateId + '_';
            stateKey += this.geometry.bufferState.updateBufferLayoutFlag;
            return stateKey;
        }
        _getWebGPURenderPipeline(shaderInstance, dest, context, entries, stateKey) {
            this._getBlendState(shaderInstance);
            this._getDepthStencilState(shaderInstance, dest);
            if (this.renderStateIsBySprite || !this.materialShaderData)
                this._getCullFrontMode(this.value2DShaderData, shaderInstance, false, context.invertY);
            else
                this._getCullFrontMode(this.materialShaderData, shaderInstance, false, context.invertY);
            return WebGPURenderPipeline.getRenderPipeline(this, shaderInstance, dest, entries, stateKey);
        }
        _getBlendState(shaderInstance) {
            if (this.renderStateIsBySprite || !this.materialShaderData) {
                if (shaderInstance._shaderPass.statefirst)
                    this.blendState = this._getRenderStateBlendByShader(this.value2DShaderData, shaderInstance);
                else
                    this.blendState = this._getRenderStateBlendByMaterial(this.value2DShaderData);
            }
            else {
                if (shaderInstance._shaderPass.statefirst)
                    this.blendState = this._getRenderStateBlendByShader(this.materialShaderData, shaderInstance);
                else
                    this.blendState = this._getRenderStateBlendByMaterial(this.materialShaderData);
            }
        }
        _getRenderStateBlendByShader(shaderData, shaderInstance) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
            const data = shaderData.getData();
            const renderState = shaderInstance._shaderPass.renderState;
            const blend = (_b = ((_a = renderState.blend) !== null && _a !== void 0 ? _a : data[Laya.Shader3D.BLEND])) !== null && _b !== void 0 ? _b : Laya.RenderState.Default.blend;
            let blendState;
            switch (blend) {
                case Laya.RenderState.BLEND_DISABLE:
                    blendState = WebGPUBlendState.getBlendState(blend, Laya.RenderState.BLENDEQUATION_ADD, Laya.RenderState.BLENDPARAM_ONE, Laya.RenderState.BLENDPARAM_ZERO, Laya.RenderState.BLENDEQUATION_ADD, Laya.RenderState.BLENDPARAM_ONE, Laya.RenderState.BLENDPARAM_ZERO);
                    break;
                case Laya.RenderState.BLEND_ENABLE_ALL:
                    const blendEquation = (_d = ((_c = renderState.blendEquation) !== null && _c !== void 0 ? _c : data[Laya.Shader3D.BLEND_EQUATION])) !== null && _d !== void 0 ? _d : Laya.RenderState.Default.blendEquation;
                    const srcBlend = (_f = ((_e = renderState.srcBlend) !== null && _e !== void 0 ? _e : data[Laya.Shader3D.BLEND_SRC])) !== null && _f !== void 0 ? _f : Laya.RenderState.Default.srcBlend;
                    const dstBlend = (_h = ((_g = renderState.dstBlend) !== null && _g !== void 0 ? _g : data[Laya.Shader3D.BLEND_DST])) !== null && _h !== void 0 ? _h : Laya.RenderState.Default.dstBlend;
                    blendState = WebGPUBlendState.getBlendState(blend, blendEquation, srcBlend, dstBlend, blendEquation, srcBlend, dstBlend);
                    break;
                case Laya.RenderState.BLEND_ENABLE_SEPERATE:
                    const blendEquationRGB = (_k = ((_j = renderState.blendEquationRGB) !== null && _j !== void 0 ? _j : data[Laya.Shader3D.BLEND_EQUATION_RGB])) !== null && _k !== void 0 ? _k : Laya.RenderState.Default.blendEquationRGB;
                    const blendEquationAlpha = (_m = ((_l = renderState.blendEquationAlpha) !== null && _l !== void 0 ? _l : data[Laya.Shader3D.BLEND_EQUATION_ALPHA])) !== null && _m !== void 0 ? _m : Laya.RenderState.Default.blendEquationAlpha;
                    const srcRGB = (_p = ((_o = renderState.srcBlendRGB) !== null && _o !== void 0 ? _o : data[Laya.Shader3D.BLEND_SRC_RGB])) !== null && _p !== void 0 ? _p : Laya.RenderState.Default.srcBlendRGB;
                    const dstRGB = (_r = ((_q = renderState.dstBlendRGB) !== null && _q !== void 0 ? _q : data[Laya.Shader3D.BLEND_DST_RGB])) !== null && _r !== void 0 ? _r : Laya.RenderState.Default.dstBlendRGB;
                    const srcAlpha = (_t = ((_s = renderState.srcBlendAlpha) !== null && _s !== void 0 ? _s : data[Laya.Shader3D.BLEND_SRC_ALPHA])) !== null && _t !== void 0 ? _t : Laya.RenderState.Default.srcBlendAlpha;
                    const dstAlpha = (_v = ((_u = renderState.dstBlendAlpha) !== null && _u !== void 0 ? _u : data[Laya.Shader3D.BLEND_DST_ALPHA])) !== null && _v !== void 0 ? _v : Laya.RenderState.Default.dstBlendAlpha;
                    blendState = WebGPUBlendState.getBlendState(blend, blendEquationRGB, srcRGB, dstRGB, blendEquationAlpha, srcAlpha, dstAlpha);
                    break;
                default:
                    throw 'blendState set error';
            }
            return blendState;
        }
        _getRenderStateBlendByMaterial(shaderData) {
            var _a;
            const data = shaderData.getData();
            const blend = (_a = data[Laya.Shader3D.BLEND]) !== null && _a !== void 0 ? _a : Laya.RenderState.Default.blend;
            let blendState;
            switch (blend) {
                case Laya.RenderState.BLEND_DISABLE:
                    blendState = WebGPUBlendState.getBlendState(blend, Laya.RenderState.BLENDEQUATION_ADD, Laya.RenderState.BLENDPARAM_ONE, Laya.RenderState.BLENDPARAM_ZERO, Laya.RenderState.BLENDEQUATION_ADD, Laya.RenderState.BLENDPARAM_ONE, Laya.RenderState.BLENDPARAM_ZERO);
                    break;
                case Laya.RenderState.BLEND_ENABLE_ALL:
                    let blendEquation = data[Laya.Shader3D.BLEND_EQUATION];
                    blendEquation = blendEquation !== null && blendEquation !== void 0 ? blendEquation : Laya.RenderState.Default.blendEquation;
                    let srcBlend = data[Laya.Shader3D.BLEND_SRC];
                    srcBlend = srcBlend !== null && srcBlend !== void 0 ? srcBlend : Laya.RenderState.Default.srcBlend;
                    let dstBlend = data[Laya.Shader3D.BLEND_DST];
                    dstBlend = dstBlend !== null && dstBlend !== void 0 ? dstBlend : Laya.RenderState.Default.dstBlend;
                    blendState = WebGPUBlendState.getBlendState(blend, blendEquation, srcBlend, dstBlend, blendEquation, srcBlend, dstBlend);
                    break;
                case Laya.RenderState.BLEND_ENABLE_SEPERATE:
                    let blendEquationRGB = data[Laya.Shader3D.BLEND_EQUATION_RGB];
                    blendEquationRGB = blendEquationRGB !== null && blendEquationRGB !== void 0 ? blendEquationRGB : Laya.RenderState.Default.blendEquationRGB;
                    let blendEquationAlpha = data[Laya.Shader3D.BLEND_EQUATION_ALPHA];
                    blendEquationAlpha = blendEquationAlpha !== null && blendEquationAlpha !== void 0 ? blendEquationAlpha : Laya.RenderState.Default.blendEquationAlpha;
                    let srcRGB = data[Laya.Shader3D.BLEND_SRC_RGB];
                    srcRGB = srcRGB !== null && srcRGB !== void 0 ? srcRGB : Laya.RenderState.Default.srcBlendRGB;
                    let dstRGB = data[Laya.Shader3D.BLEND_DST_RGB];
                    dstRGB = dstRGB !== null && dstRGB !== void 0 ? dstRGB : Laya.RenderState.Default.dstBlendRGB;
                    let srcAlpha = data[Laya.Shader3D.BLEND_SRC_ALPHA];
                    srcAlpha = srcAlpha !== null && srcAlpha !== void 0 ? srcAlpha : Laya.RenderState.Default.srcBlendAlpha;
                    let dstAlpha = data[Laya.Shader3D.BLEND_DST_ALPHA];
                    dstAlpha = dstAlpha !== null && dstAlpha !== void 0 ? dstAlpha : Laya.RenderState.Default.dstBlendAlpha;
                    blendState = WebGPUBlendState.getBlendState(blend, blendEquationRGB, srcRGB, dstRGB, blendEquationAlpha, srcAlpha, dstAlpha);
                    break;
                default:
                    throw 'blendState set error';
            }
            return blendState;
        }
        _getDepthStencilState(shaderInstance, dest) {
            if (dest._depthTexture) {
                if (this.renderStateIsBySprite || !this.materialShaderData) {
                    if (shaderInstance._shaderPass.statefirst)
                        this.depthStencilState = this._getRenderStateDepthByShader(this.value2DShaderData, shaderInstance, dest);
                    else
                        this.depthStencilState = this._getRenderStateDepthByMaterial(this.value2DShaderData, dest);
                }
                else {
                    if (shaderInstance._shaderPass.statefirst)
                        this.depthStencilState = this._getRenderStateDepthByShader(this.materialShaderData, shaderInstance, dest);
                    else
                        this.depthStencilState = this._getRenderStateDepthByMaterial(this.materialShaderData, dest);
                }
            }
            else
                this.depthStencilState = null;
        }
        _getRenderStateDepthByShader(shaderData, shaderInstance, dest) {
            var _a, _b, _c, _d;
            const data = shaderData.getData();
            const renderState = shaderInstance._shaderPass.renderState;
            const depthWrite = (_b = ((_a = renderState.depthWrite) !== null && _a !== void 0 ? _a : data[Laya.Shader3D.DEPTH_WRITE])) !== null && _b !== void 0 ? _b : Laya.RenderState.Default.depthWrite;
            const depthTest = (_d = ((_c = renderState.depthTest) !== null && _c !== void 0 ? _c : data[Laya.Shader3D.DEPTH_TEST])) !== null && _d !== void 0 ? _d : Laya.RenderState.Default.depthTest;
            return WebGPUDepthStencilState.getDepthStencilState(dest.depthStencilFormat, depthWrite, depthTest);
        }
        _getRenderStateDepthByMaterial(shaderData, dest) {
            var _a, _b;
            const data = shaderData.getData();
            const depthWrite = (_a = data[Laya.Shader3D.DEPTH_WRITE]) !== null && _a !== void 0 ? _a : Laya.RenderState.Default.depthWrite;
            const depthTest = (_b = data[Laya.Shader3D.DEPTH_TEST]) !== null && _b !== void 0 ? _b : Laya.RenderState.Default.depthTest;
            return WebGPUDepthStencilState.getDepthStencilState(dest.depthStencilFormat, depthWrite, depthTest);
        }
        _getCullFrontMode(shaderData, shaderInstance, isTarget, invertFront) {
            var _a;
            const renderState = shaderInstance._shaderPass.renderState;
            const data = shaderData.getData();
            let cull = data[Laya.Shader3D.CULL];
            if (shaderInstance._shaderPass.statefirst)
                cull = (_a = renderState.cull) !== null && _a !== void 0 ? _a : cull;
            cull = cull !== null && cull !== void 0 ? cull : Laya.RenderState.Default.cull;
            switch (cull) {
                case Laya.RenderState.CULL_NONE:
                    this.cullMode = Laya.CullMode.Off;
                    if (isTarget !== invertFront)
                        this.frontFace = Laya.FrontFace.CCW;
                    else
                        this.frontFace = Laya.FrontFace.CW;
                    break;
                case Laya.RenderState.CULL_FRONT:
                    this.cullMode = Laya.CullMode.Front;
                    if (isTarget !== invertFront)
                        this.frontFace = Laya.FrontFace.CCW;
                    else
                        this.frontFace = Laya.FrontFace.CW;
                    break;
                case Laya.RenderState.CULL_BACK:
                default:
                    this.cullMode = Laya.CullMode.Back;
                    if (isTarget !== invertFront)
                        this.frontFace = Laya.FrontFace.CCW;
                    else
                        this.frontFace = Laya.FrontFace.CW;
                    break;
            }
        }
        _isShaderDataChange(context) {
            let change = false;
            let shaderDataState = this._shaderDataState[context.pipelineMode];
            let shaderDataObject = this._shaderDataObject[context.pipelineMode];
            if (!shaderDataState)
                shaderDataState = this._shaderDataState[context.pipelineMode] = [];
            if (!shaderDataObject)
                shaderDataObject = this._shaderDataObject[context.pipelineMode] = [];
            if (this._sceneData) {
                if (shaderDataState[0] != this._sceneData.changeMark) {
                    shaderDataState[0] = this._sceneData.changeMark;
                    change = true;
                }
                if (shaderDataObject[0] != this._sceneData.globalId) {
                    shaderDataObject[0] = this._sceneData.globalId;
                    change = true;
                }
            }
            if (this._cameraData) {
                if (shaderDataState[1] != this._cameraData.changeMark) {
                    shaderDataState[1] = this._cameraData.changeMark;
                    change = true;
                }
                if (shaderDataObject[1] != this._cameraData.globalId) {
                    shaderDataObject[1] = this._cameraData.globalId;
                    change = true;
                }
            }
            if (this.value2DShaderData) {
                if (shaderDataState[2] != this.value2DShaderData.changeMark) {
                    shaderDataState[2] = this.value2DShaderData.changeMark;
                    change = true;
                }
                if (shaderDataObject[2] != this.value2DShaderData.globalId) {
                    shaderDataObject[2] = this.value2DShaderData.globalId;
                    change = true;
                }
            }
            if (this.materialShaderData) {
                if (shaderDataState[3] != this.materialShaderData.changeMark) {
                    shaderDataState[3] = this.materialShaderData.changeMark;
                    change = true;
                }
                if (shaderDataObject[3] != this.materialShaderData.globalId) {
                    shaderDataObject[3] = this.materialShaderData.globalId;
                    change = true;
                }
            }
            return change;
        }
        _createBindGroupLayout(shaderInstance) {
            let entries;
            const bindGroupLayout = new Array(4);
            const shaderData = new Array(4);
            shaderData[0] = this._sceneData;
            shaderData[1] = this._cameraData;
            shaderData[2] = this.value2DShaderData;
            shaderData[3] = this.materialShaderData;
            const uniformSetMap = shaderInstance.uniformSetMap;
            let error = false;
            for (let i = 0; i < 4; i++) {
                if (shaderData[i]) {
                    entries = shaderData[i].createBindGroupLayoutEntry(uniformSetMap[i]);
                    if (entries)
                        bindGroupLayout[i] = entries;
                    else
                        error = true;
                }
                else
                    error = true;
            }
            return error ? undefined : bindGroupLayout;
        }
        _bindGroup(shaderInstance, command) {
            var _a, _b, _c, _d;
            const uniformSetMap = shaderInstance.uniformSetMap;
            (_a = this._sceneData) === null || _a === void 0 ? void 0 : _a.bindGroup(0, 'scene3D', uniformSetMap[0], command);
            (_b = this._cameraData) === null || _b === void 0 ? void 0 : _b.bindGroup(1, 'camera', uniformSetMap[1], command);
            (_c = this.value2DShaderData) === null || _c === void 0 ? void 0 : _c.bindGroup(2, 'sprite3D', uniformSetMap[2], command);
            (_d = this.materialShaderData) === null || _d === void 0 ? void 0 : _d.bindGroup(3, 'material', uniformSetMap[3], command);
        }
        _uploadUniform() {
            var _a, _b, _c, _d;
            (_a = this._sceneData) === null || _a === void 0 ? void 0 : _a.uploadUniform();
            (_b = this._cameraData) === null || _b === void 0 ? void 0 : _b.uploadUniform();
            (_c = this.value2DShaderData) === null || _c === void 0 ? void 0 : _c.uploadUniform();
            (_d = this.materialShaderData) === null || _d === void 0 ? void 0 : _d.uploadUniform();
        }
        _uploadGeometry(command) {
            let triangles = 0;
            if (command) {
                if (WebGPUGlobal.useGlobalContext)
                    triangles += Laya.WebGPUContext.applyCommandGeometry(command, this.geometry);
                else
                    triangles += command.applyGeometry(this.geometry);
            }
            return triangles;
        }
        _createPipeline(index, context, shaderInstance, command, stateKey) {
            this.value2DShaderData.isShare = false;
            const bindGroupLayout = this._createBindGroupLayout(shaderInstance);
            if (bindGroupLayout) {
                const pipeline = this._getWebGPURenderPipeline(shaderInstance, context.destRT, context, bindGroupLayout, stateKey);
                if (command) {
                    if (WebGPUGlobal.useGlobalContext)
                        Laya.WebGPUContext.setCommandPipeline(command, pipeline);
                    else
                        command.setPipeline(pipeline);
                }
                if (WebGPUGlobal.useCache) {
                    shaderInstance.renderPipelineMap.set(stateKey, pipeline);
                    this._pipeline[index] = pipeline;
                    this._stateKey[index] = stateKey;
                }
                context.pipelineCache.push({ pipeline, shaderInstance, samples: context.destRT._samples, stateKey });
                console.log('pipelineCache2d =', context.pipelineCache);
                return pipeline;
            }
            return null;
        }
        _takeCurPass(pipelineMode) {
            this._passNum = 0;
            this._passName = pipelineMode;
            const passes = this.subShader._passes;
            for (let i = 0, len = passes.length; i < len; i++) {
                if (passes[i].pipelineMode === pipelineMode) {
                    this._passIndex[this._passNum++] = i;
                }
            }
        }
        prepare(context) {
            this._takeCurPass(context.pipelineMode);
            if (this._passNum === 0)
                return false;
            this._sceneData = context.sceneData;
            if (!this._sceneData)
                this._sceneData = WebGPURenderElement2D._sceneShaderData;
            this._cameraData = context.cameraData;
            if (!this.value2DShaderData)
                this.value2DShaderData = WebGPURenderElement2D._value2DShaderData;
            if (!this.materialShaderData)
                this.materialShaderData = WebGPURenderElement2D._materialShaderData;
            let compile = false;
            if (this._isShaderDataChange(context)) {
                this._compileShader(context);
                compile = true;
            }
            return compile;
        }
        render(context, command) {
            let triangles = 0;
            for (let i = 0; i < this._passNum; i++) {
                const index = this._passIndex[i];
                let pipeline = this._pipeline[index];
                const shaderInstance = this._shaderInstances[index];
                if (shaderInstance && shaderInstance.complete) {
                    this._getDepthStencilState(shaderInstance, context.destRT);
                    if (WebGPUGlobal.useCache) {
                        let stateKey;
                        if (this.materialShaderData)
                            stateKey = this._calcStateKey(shaderInstance, context.destRT, context);
                        else
                            stateKey = this._stateKey[index];
                        if (this._stateKey[index] !== stateKey || pipeline) {
                            this._stateKey[index] = stateKey;
                            pipeline = this._pipeline[index] = shaderInstance.renderPipelineMap.get(stateKey);
                        }
                        if (!pipeline)
                            pipeline = this._createPipeline(index, context, shaderInstance, command, stateKey);
                        else if (command) {
                            if (WebGPUGlobal.useGlobalContext)
                                Laya.WebGPUContext.setCommandPipeline(command, pipeline);
                            else
                                command.setPipeline(pipeline);
                        }
                    }
                    else
                        this._createPipeline(index, context, shaderInstance, command);
                    if (command)
                        this._bindGroup(shaderInstance, command);
                    this._uploadUniform();
                    triangles += this._uploadGeometry(command);
                }
            }
            return triangles;
        }
        destroy() {
            WebGPUGlobal.releaseId(this);
            this._shaderInstances.length = 0;
            this._pipeline.length = 0;
            this._stateKey.length = 0;
        }
    }
    WebGPURenderElement2D._sceneShaderData = new WebGPUShaderData();
    WebGPURenderElement2D._value2DShaderData = new WebGPUShaderData();
    WebGPURenderElement2D._materialShaderData = new WebGPUShaderData();
    WebGPURenderElement2D._compileDefine = new WebDefineDatas();
    WebGPURenderElement2D._defineStrings = [];
    WebGPURenderElement2D.bundleIdCounter = 0;

    class WebGPURender2DProcess {
        createRenderElement2D() {
            return new WebGPURenderElement2D();
        }
        createRenderContext2D() {
            return new WebGPURenderContext2D();
        }
    }
    Laya.Laya.addBeforeInitCallback(() => {
        if (!Laya.LayaGL.render2DRenderPassFactory)
            Laya.LayaGL.render2DRenderPassFactory = new WebGPURender2DProcess();
    });

    class WebGPUBuffer {
        constructor(usage, byteSize = 0, mappedAtCreation = false) {
            this._size = 0;
            this._isCreate = false;
            this._mappedAtCreation = false;
            this.objectName = 'WebGPUBuffer';
            this._size = Laya.roundUp(byteSize, 4);
            this._usage = usage;
            this._mappedAtCreation = mappedAtCreation;
            this.globalId = WebGPUGlobal.getId(this);
            if (this._size > 0)
                this._create();
        }
        setDataLength(length) {
            const size = Laya.roundUp(length, 4);
            if (!this._isCreate || this._size != size) {
                WebGPURenderEngine._instance._addStatisticsInfo(Laya.GPUEngineStatisticsInfo.M_GPUMemory, -this._size);
                WebGPURenderEngine._instance._addStatisticsInfo(Laya.GPUEngineStatisticsInfo.M_GPUBuffer, -this._size);
                this._size = size;
                this._create();
            }
        }
        _create() {
            this._source = WebGPURenderEngine._instance.getDevice().createBuffer({
                size: this._size,
                usage: this._usage,
                mappedAtCreation: this._mappedAtCreation
            });
            this._isCreate = true;
            WebGPUGlobal.action(this, 'allocMemory | buffer', this._size);
            WebGPURenderEngine._instance._addStatisticsInfo(Laya.GPUEngineStatisticsInfo.M_GPUMemory, this._size);
            WebGPURenderEngine._instance._addStatisticsInfo(Laya.GPUEngineStatisticsInfo.M_GPUBuffer, this._size);
        }
        setData(srcData, srcOffset) {
            let size = 0, offset = 0;
            let buffer = srcData.buffer;
            if (buffer) {
                offset = srcData.byteOffset + srcOffset;
                size = Laya.roundUp(srcData.byteLength, 4);
                if (size > srcData.byteLength) {
                    const buffer2 = new ArrayBuffer(size);
                    new Uint8Array(buffer2).set(new Uint8Array(buffer, offset, srcData.byteLength));
                    buffer = buffer2;
                    offset = 0;
                }
                if (this._mappedAtCreation) {
                    new Uint8Array(this._source.getMappedRange(0, size)).set(new Uint8Array(buffer, offset, size));
                    this._mappedAtCreation = false;
                    this._source.unmap();
                }
                else
                    WebGPURenderEngine._instance.getDevice().queue.writeBuffer(this._source, 0, buffer, offset, size);
            }
            else {
                offset = srcOffset;
                size = Laya.roundUp(srcData.byteLength - offset, 4);
                if (size > srcData.byteLength - offset) {
                    const buffer2 = new ArrayBuffer(size);
                    new Uint8Array(buffer2).set(new Uint8Array(srcData, offset, srcData.byteLength - offset));
                    srcData = buffer2;
                    offset = 0;
                }
                if (this._mappedAtCreation) {
                    new Uint8Array(this._source.getMappedRange(0, size)).set(new Uint8Array(srcData, offset, size));
                    this._mappedAtCreation = false;
                    this._source.unmap();
                }
                else
                    WebGPURenderEngine._instance.getDevice().queue.writeBuffer(this._source, 0, srcData, offset, size);
            }
        }
        setDataEx(srcData, srcOffset, byteLength, dstOffset = 0) {
            let size = 0, offset = 0;
            let buffer = srcData.buffer;
            if (buffer) {
                offset = srcData.byteOffset + srcOffset;
                size = Laya.roundUp(srcData.byteLength, 4);
                if (size > srcData.byteLength) {
                    const buffer2 = new ArrayBuffer(size);
                    new Uint8Array(buffer2).set(new Uint8Array(buffer, offset, srcData.byteLength));
                    buffer = buffer2;
                    offset = 0;
                }
                if (this._mappedAtCreation) {
                    new Uint8Array(this._source.getMappedRange(dstOffset, size)).set(new Uint8Array(buffer, offset, size));
                    this._mappedAtCreation = false;
                    this._source.unmap();
                }
                else
                    WebGPURenderEngine._instance.getDevice().queue.writeBuffer(this._source, dstOffset, buffer, offset, size);
            }
            else {
                offset = srcOffset;
                size = Laya.roundUp(byteLength, 4);
                if (size > byteLength) {
                    const buffer2 = new ArrayBuffer(size);
                    new Uint8Array(buffer2).set(new Uint8Array(srcData, offset, byteLength));
                    srcData = buffer2;
                    offset = 0;
                }
                if (this._mappedAtCreation) {
                    new Uint8Array(this._source.getMappedRange(dstOffset, size)).set(new Uint8Array(srcData, offset, size));
                    this._mappedAtCreation = false;
                    this._source.unmap();
                }
                else
                    WebGPURenderEngine._instance.getDevice().queue.writeBuffer(this._source, dstOffset, srcData, offset, size);
            }
        }
        readDataFromBuffer() {
            return new Promise((resolve, reject) => {
                this._source.mapAsync(GPUMapMode.READ)
                    .then(() => {
                    const arrayBuffer = this._source.getMappedRange();
                    const data = new Uint8Array(arrayBuffer).slice();
                    this._source.unmap();
                    resolve(data);
                })
                    .catch(error => {
                    this._source.unmap();
                    reject(error);
                });
            });
        }
        async readFromBuffer(buffer, size) {
            await buffer.mapAsync(GPUMapMode.READ);
            const arrayBuffer = buffer.getMappedRange();
            const data = new Float32Array(arrayBuffer).slice(0, size / 4);
            buffer.unmap();
            return data;
        }
        release() {
            WebGPURenderEngine._instance._addStatisticsInfo(Laya.GPUEngineStatisticsInfo.M_GPUMemory, -this._size);
            WebGPURenderEngine._instance._addStatisticsInfo(Laya.GPUEngineStatisticsInfo.M_GPUBuffer, -this._size);
            WebGPUGlobal.releaseId(this);
        }
    }

    exports.WebGPUVertexStepMode = void 0;
    (function (WebGPUVertexStepMode) {
        WebGPUVertexStepMode["vertex"] = "vertex";
        WebGPUVertexStepMode["instance"] = "instance";
    })(exports.WebGPUVertexStepMode || (exports.WebGPUVertexStepMode = {}));
    class WebGPUBufferState {
        isNeedChangeFormat() {
            for (let i = this._vertexBuffers.length - 1; i > -1; i--) {
                const attributes = this.vertexState[i].attributes;
                for (let j = attributes.length - 1; j > -1; j--) {
                    if (attributes[j].format === 'uint8x4') {
                        return true;
                    }
                }
            }
            return false;
        }
        applyState(vertexBuffers, indexBuffer) {
            this._vertexBuffers = vertexBuffers.slice();
            this._bindedIndexBuffer = indexBuffer;
            this._getVertexBufferLayoutArray();
            this.updateBufferLayoutFlag++;
        }
        constructor() {
            this.updateBufferLayoutFlag = 0;
            this.vertexState = [];
            this.objectName = 'WebGPUBufferState';
            this.id = WebGPUBufferState.idCounter++;
            this.stateId = 'x';
            this.globalId = WebGPUGlobal.getId(this);
        }
        _getVertexBufferLayoutArray() {
            this.stateId = '';
            this.vertexState.length = 0;
            this._vertexBuffers.forEach(element => {
                const vertexDec = element.vertexDeclaration;
                const vertexAttribute = new Array();
                for (let i in vertexDec._shaderValues) {
                    const vertexState = vertexDec._shaderValues[i];
                    const format = this._getvertexAttributeFormat(vertexState.elementString);
                    const ss = this._getvertexAttributeSymbol(vertexState.elementString);
                    vertexAttribute.push({
                        format,
                        offset: vertexState.elementOffset,
                        shaderLocation: parseInt(i)
                    });
                    this.stateId += ss;
                }
                const verteBufferLayout = {
                    arrayStride: vertexDec.vertexStride,
                    stepMode: element.instanceBuffer ? exports.WebGPUVertexStepMode.instance : exports.WebGPUVertexStepMode.vertex,
                    attributes: vertexAttribute
                };
                this.vertexState.push(verteBufferLayout);
            });
        }
        _getvertexAttributeFormat(elementFormat) {
            switch (elementFormat) {
                case Laya.VertexElementFormat.Single:
                    return "float32";
                case Laya.VertexElementFormat.Vector2:
                    return "float32x2";
                case Laya.VertexElementFormat.Vector3:
                    return "float32x3";
                case Laya.VertexElementFormat.Vector4:
                    return "float32x4";
                case Laya.VertexElementFormat.Color:
                    return "float32x4";
                case Laya.VertexElementFormat.Byte4:
                    return "uint8x4";
                case Laya.VertexElementFormat.Byte2:
                    return "uint8x2";
                case Laya.VertexElementFormat.Short2:
                    return "float16x2";
                case Laya.VertexElementFormat.Short4:
                    return "float16x4";
                case Laya.VertexElementFormat.NormalizedShort2:
                    return "unorm16x2";
                case Laya.VertexElementFormat.NormalizedShort4:
                    return "unorm16x4";
                case Laya.VertexElementFormat.NorByte4:
                    return "unorm8x4";
                default:
                    throw 'no cache has vertex mode';
            }
        }
        _getvertexAttributeSymbol(elementFormat) {
            switch (elementFormat) {
                case Laya.VertexElementFormat.Single:
                    return '0';
                case Laya.VertexElementFormat.Vector2:
                    return '1';
                case Laya.VertexElementFormat.Vector3:
                    return '2';
                case Laya.VertexElementFormat.Vector4:
                    return '3';
                case Laya.VertexElementFormat.Color:
                    return '4';
                case Laya.VertexElementFormat.Byte4:
                    return '5';
                case Laya.VertexElementFormat.Byte2:
                    return '6';
                case Laya.VertexElementFormat.Short2:
                    return '7';
                case Laya.VertexElementFormat.Short4:
                    return '8';
                case Laya.VertexElementFormat.NormalizedShort2:
                    return '9';
                case Laya.VertexElementFormat.NormalizedShort4:
                    return 'a';
                case Laya.VertexElementFormat.NorByte4:
                    return 'b';
                default:
                    throw 'no cache has vertex mode';
            }
        }
        destroy() {
            WebGPUGlobal.releaseId(this);
        }
    }
    WebGPUBufferState.idCounter = 0;

    class WebGPUCommandUniformMap extends Laya.CommandUniformMap {
        constructor(stateName) {
            super(stateName);
            this._idata = {};
            this._stateName = stateName;
        }
        hasPtrID(propertyID) {
            return !!(this._idata[propertyID] != null);
        }
        addShaderUniform(propertyID, propertyName, uniformtype, block = '') {
            this._idata[propertyID] = { uniformtype, propertyName, arrayLength: 0 };
        }
        addShaderUniformArray(propertyID, propertyName, uniformtype, arrayLength, block = '') {
            if (uniformtype !== Laya.ShaderDataType.Matrix4x4 && uniformtype !== Laya.ShaderDataType.Vector4)
                throw ('because of align rule, the engine does not support other types as arrays.');
            this._idata[propertyID] = { uniformtype, propertyName, arrayLength };
        }
        addShaderBlockUniform(propertyID, blockname, blockProperty) {
            return null;
        }
    }

    class WebGPUIndexBuffer {
        constructor(targetType, bufferUsageType) {
            this.objectName = 'WebGPUIndexBuffer';
            let usage = GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST;
            this.source = new WebGPUBuffer(usage, 0);
            this.globalId = WebGPUGlobal.getId(this);
        }
        _setIndexDataLength(length) {
            this.source.setDataLength(length);
        }
        _setIndexData(data, bufferOffset) {
            this.source.setData(data, bufferOffset);
        }
        destroy() {
            WebGPUGlobal.releaseId(this);
            this.source.release();
        }
    }

    exports.WebGPUPrimitiveTopology = void 0;
    (function (WebGPUPrimitiveTopology) {
        WebGPUPrimitiveTopology["point_list"] = "point-list";
        WebGPUPrimitiveTopology["line_list"] = "line-list";
        WebGPUPrimitiveTopology["line_strip"] = "line-strip";
        WebGPUPrimitiveTopology["triangle_list"] = "triangle-list";
        WebGPUPrimitiveTopology["triangle_strip"] = "triangle-strip";
    })(exports.WebGPUPrimitiveTopology || (exports.WebGPUPrimitiveTopology = {}));
    class WebGPURenderGeometry {
        get instanceCount() {
            return this._instanceCount;
        }
        set instanceCount(value) {
            this._instanceCount = value;
        }
        get mode() {
            return this._mode;
        }
        set mode(value) {
            this._mode = value;
        }
        get indexFormat() {
            return this._indexFormat;
        }
        set indexFormat(value) {
            this._indexFormat = value;
            this.gpuIndexFormat = (value === Laya.IndexFormat.UInt16) ? 'uint16' : 'uint32';
            this.gpuIndexByte = (value === Laya.IndexFormat.UInt16) ? 2 : 4;
        }
        constructor(mode, drawType) {
            this.checkDataFormat = false;
            this.gpuIndexFormat = 'uint16';
            this.gpuIndexByte = 2;
            this.objectName = 'WebGPURenderGeometry';
            this.mode = mode;
            this.drawType = drawType;
            this.indexFormat = Laya.IndexFormat.UInt16;
            this._drawArrayInfo = [];
            this._drawElementInfo = [];
            this._instanceCount = 1;
            this._id = WebGPURenderGeometry._idCounter++;
            this.globalId = WebGPUGlobal.getId(this);
        }
        setDrawArrayParams(first, count) {
            this._drawArrayInfo.push({
                start: first,
                count: count
            });
        }
        setDrawElemenParams(count, offset) {
            this._drawElementInfo.push({
                elementStart: offset,
                elementCount: count
            });
        }
        setInstanceRenderOffset(offset, instanceCount) {
        }
        clearRenderParams() {
            this._drawElementInfo.length = 0;
            this._drawArrayInfo.length = 0;
        }
        cloneTo(obj) {
            obj.mode = this.mode;
            obj.drawType = this.drawType;
            obj.indexFormat = this.indexFormat;
            obj.instanceCount = this.instanceCount;
            obj._drawArrayInfo = this._drawArrayInfo.slice();
            obj._drawElementInfo = this._drawElementInfo.slice();
        }
        destroy() {
            WebGPUGlobal.releaseId(this);
        }
    }
    WebGPURenderGeometry._idCounter = 0;

    class WebGPUShaderInstance {
        constructor(name) {
            this._id = WebGPUShaderInstance.idCounter++;
            this.destroyed = false;
            this.complete = false;
            this.renderPipelineMap = new Map();
            this.uniformSetMap = {};
            this.objectName = 'WebGPUShaderInstance';
            this.name = name;
            this.globalId = WebGPUGlobal.getId(this);
        }
        getRenderPipelineDescriptor() {
            const colorTargetState = {
                format: 'bgra8unorm',
                blend: {
                    alpha: {
                        srcFactor: 'src-alpha',
                        dstFactor: 'one-minus-src-alpha',
                        operation: 'add',
                    },
                    color: {
                        srcFactor: 'src-alpha',
                        dstFactor: 'one-minus-src-alpha',
                        operation: 'add',
                    },
                },
                writeMask: GPUColorWrite.ALL,
            };
            const renderPipelineDescriptor = {
                label: 'render',
                layout: 'auto',
                vertex: {
                    buffers: [],
                    module: this._vsShader,
                    entryPoint: 'main',
                },
                fragment: {
                    module: this._fsShader,
                    entryPoint: 'main',
                    targets: [colorTargetState],
                },
                primitive: {
                    topology: 'triangle-list',
                    frontFace: 'ccw',
                    cullMode: 'back',
                },
                depthStencil: {
                    format: 'depth24plus-stencil8',
                    depthWriteEnabled: true,
                    depthCompare: 'less',
                },
                multisample: {
                    count: 1,
                },
            };
            return renderPipelineDescriptor;
        }
        _create(shaderProcessInfo, shaderPass) {
            const engine = WebGPURenderEngine._instance;
            const device = engine.getDevice();
            const shaderObj = WebGPUCodeGenerator.shaderLanguageProcess(shaderProcessInfo.defineString, shaderProcessInfo.attributeMap, shaderPass.uniformMap, shaderPass.arrayMap, shaderProcessInfo.vs, shaderProcessInfo.ps, shaderProcessInfo.is2D);
            this.uniformInfo = shaderObj.uniformInfo;
            this.uniformInfo.forEach(item => {
                if (!this.uniformSetMap[item.set])
                    this.uniformSetMap[item.set] = new Array();
                this.uniformSetMap[item.set].push(item);
            });
            this._shaderPass = shaderPass;
            this._vsShader = device.createShaderModule({ code: shaderObj.vs });
            this._fsShader = device.createShaderModule({ code: shaderObj.fs });
            this.complete = true;
            const dimension = shaderProcessInfo.is2D ? '2d' : '3d';
            console.log('create ' + dimension + ' shaderInstance_' + this._id, shaderPass._owner._owner.name, this._shaderPass, this.uniformSetMap, { vs: shaderObj.glsl_vs }, { fs: shaderObj.glsl_fs });
        }
        createPipelineLayout(device, name, entries) {
            const _createBindGroupLayout = (set, name, info) => {
                const data = [];
                for (let i = 0; i < info.length; i++) {
                    const item = info[i];
                    if (item.set === set)
                        data.push(item);
                }
                if (data.length === 0)
                    return null;
                const desc = {
                    label: name,
                    entries: entries ? entries[set] : [],
                };
                if (!entries) {
                    for (let i = 0; i < data.length; i++) {
                        switch (data[i].type) {
                            case exports.WebGPUBindingInfoType.buffer:
                                desc.entries.push({
                                    binding: data[i].binding,
                                    visibility: data[i].visibility,
                                    buffer: data[i].buffer,
                                });
                                break;
                            case exports.WebGPUBindingInfoType.sampler:
                                desc.entries.push({
                                    binding: data[i].binding,
                                    visibility: data[i].visibility,
                                    sampler: data[i].sampler,
                                });
                                break;
                            case exports.WebGPUBindingInfoType.texture:
                                desc.entries.push({
                                    binding: data[i].binding,
                                    visibility: data[i].visibility,
                                    texture: data[i].texture,
                                });
                                break;
                        }
                    }
                }
                return device.createBindGroupLayout(desc);
            };
            const bindGroupLayouts = [];
            for (let i = 0; i < 4; i++) {
                const group = _createBindGroupLayout(i, `group${i}`, this.uniformInfo);
                if (group)
                    bindGroupLayouts.push(group);
            }
            return device.createPipelineLayout({ label: name, bindGroupLayouts });
        }
        _disposeResource() {
            if (!this.destroyed) {
                WebGPUGlobal.releaseId(this);
                this.renderPipelineMap.clear();
                this.destroyed = true;
            }
        }
    }
    WebGPUShaderInstance.idCounter = 0;

    class WebGPUVertexBuffer {
        constructor(targetType, bufferUsageType) {
            this.objectName = 'WebGPUVertexBuffer';
            const usage = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;
            this.source = new WebGPUBuffer(usage, 0);
            this.globalId = WebGPUGlobal.getId(this);
        }
        setData(buffer, bufferOffset = 0, dataStartIndex = 0, dataCount = Number.MAX_SAFE_INTEGER) {
            const needSubData = dataStartIndex !== 0 || dataCount !== Number.MAX_SAFE_INTEGER;
            if (needSubData) {
                this.source.setDataEx(buffer, dataStartIndex, dataCount, bufferOffset);
                this.buffer = buffer;
            }
            else {
                this.source.setData(buffer, bufferOffset);
                this.buffer = buffer;
            }
        }
        setDataLength(byteLength) {
            this.source.setDataLength(byteLength);
        }
        destroy() {
            WebGPUGlobal.releaseId(this);
            this.source.release();
            this.vertexDeclaration = null;
        }
    }

    class WebGPURenderDeviceFactory {
        createShaderInstance(shaderProcessInfo, shaderPass) {
            const shaderIns = new WebGPUShaderInstance(shaderPass._owner._owner.name);
            shaderIns._create(shaderProcessInfo, shaderPass);
            return shaderIns;
        }
        createIndexBuffer(bufferUsage) {
            return new WebGPUIndexBuffer(Laya.BufferTargetType.ELEMENT_ARRAY_BUFFER, bufferUsage);
        }
        createVertexBuffer(bufferUsageType) {
            return new WebGPUVertexBuffer(Laya.BufferTargetType.ARRAY_BUFFER, bufferUsageType);
        }
        createBufferState() {
            return new WebGPUBufferState();
        }
        createRenderGeometryElement(mode, drawType) {
            return new WebGPURenderGeometry(mode, drawType);
        }
        createEngine(config, canvas) {
            return Promise.resolve();
        }
        createGlobalUniformMap(blockName) {
            let comMap = WebGPURenderDeviceFactory.globalBlockMap[blockName];
            if (!comMap)
                comMap = WebGPURenderDeviceFactory.globalBlockMap[blockName] = new WebGPUCommandUniformMap(blockName);
            return comMap;
        }
        createShaderData(ownerResource) {
            return new WebGPUShaderData(ownerResource);
        }
    }
    WebGPURenderDeviceFactory.globalBlockMap = {};
    Laya.Laya.addBeforeInitCallback(() => {
        if (!Laya.LayaGL.renderDeviceFactory)
            Laya.LayaGL.renderDeviceFactory = new WebGPURenderDeviceFactory();
    });

    class WebGPUResourceRecover {
        constructor() {
            this.recoverList = [];
        }
        needRecover(res) {
            this.recoverList.push(res);
            this.frameCount = Laya.Laya.timer.currFrame;
        }
        recover() {
            if (this.frameCount < Laya.Laya.timer.currFrame) {
                for (let i = this.recoverList.length - 1; i > -1; i--)
                    this.recoverList[i]._source.destroy();
                this.recoverList.length = 0;
            }
        }
    }

    class WebGPURenderBundle {
        constructor(device, dest, shotRateSet) {
            this._shotNum = 0;
            this._shotCount = 0;
            this._shotRateSet = 0.7;
            this._shotEstimate = 0;
            this.renderTimeStamp = 0;
            this.renderTriangles = 0;
            this.renderBundle = null;
            this._elements = new Set();
            const desc = WebGPURenderPassHelper.getBundleDescriptor(dest);
            this.id = WebGPURenderBundle.idCounter++;
            desc.label = `BundleEncoder_${this.id}`;
            this._engine = WebGPURenderEngine._instance;
            this._encoder = device.createRenderBundleEncoder(desc);
            this._shotRateSet = shotRateSet;
        }
        render(context, element) {
            this._elements.add(element.bundleId);
            this.renderTriangles += element._render(context, null, this);
            this._shotNum++;
            this.renderTimeStamp = Laya.Laya.timer.currTimer;
        }
        finish() {
            this.renderBundle = this._encoder.finish();
            this.renderBundle.label = `RenderBundle_${this.id}`;
        }
        hasElement(elementId) {
            const has = this._elements.has(elementId);
            if (has)
                this._shotNum++;
            return has;
        }
        addShot() {
            this._shotNum++;
        }
        removeMyIds(elements) {
            this._elements.forEach(id => elements.delete(id));
        }
        clearShotNum() {
            this._shotNum = 0;
        }
        isLowShotRate() {
            const shotRate = this._elements.size > 0 ? this._shotNum / this._elements.size : 1;
            if (shotRate === 1) {
                this._shotEstimate = 0;
                this._shotCount = 0;
                return false;
            }
            if (this._shotRateSet === 1) {
                this._shotEstimate = 0;
                this._shotCount = 0;
                return true;
            }
            if (shotRate < this._shotRateSet) {
                if (this._shotEstimate++ > 10) {
                    this._shotEstimate = 0;
                    this._shotCount = 0;
                    return true;
                }
            }
            if (this._shotCount++ > 500) {
                this._shotEstimate = 0;
                this._shotCount = 0;
                return true;
            }
            return false;
        }
        setPipeline(pipeline) {
            this._encoder.setPipeline(pipeline);
        }
        setIndexBuffer(buffer, indexFormat, byteSize, offset = 0) {
            this._encoder.setIndexBuffer(buffer, indexFormat, offset, byteSize);
        }
        setVertexBuffer(slot, buffer, offset = 0, size = 0) {
            this._encoder.setVertexBuffer(slot, buffer, offset, size);
        }
        setBindGroup(index, bindGroup, dynamicOffsets) {
            this._encoder.setBindGroup(index, bindGroup, dynamicOffsets);
        }
        applyGeometry(geometry, setBuffer = true) {
            const { bufferState, indexFormat, drawType, instanceCount, _drawArrayInfo, _drawElementInfo } = geometry;
            const { _vertexBuffers: vertexBuffers, _bindedIndexBuffer: indexBuffer } = bufferState;
            let indexByte = 2;
            if (setBuffer) {
                vertexBuffers.forEach((vb, i) => this.setVertexBuffer(i, vb.source._source, 0, vb.source._size));
                if (indexBuffer) {
                    indexByte = geometry.gpuIndexByte;
                    this.setIndexBuffer(indexBuffer.source._source, geometry.gpuIndexFormat, indexBuffer.source._size, 0);
                }
            }
            let triangles = 0;
            let count = 0, start = 0;
            switch (drawType) {
                case Laya.DrawType.DrawArray:
                    for (let i = _drawArrayInfo.length - 1; i > -1; i--) {
                        count = _drawArrayInfo[i].count;
                        start = _drawArrayInfo[i].start;
                        triangles += count - 2;
                        this._encoder.draw(count, 1, start, 0);
                    }
                    break;
                case Laya.DrawType.DrawElement:
                    for (let i = _drawElementInfo.length - 1; i > -1; i--) {
                        count = _drawElementInfo[i].elementCount;
                        start = _drawElementInfo[i].elementStart;
                        triangles += count / 3;
                        this._encoder.drawIndexed(count, 1, start / indexByte, 0);
                    }
                    break;
                case Laya.DrawType.DrawArrayInstance:
                    for (let i = _drawArrayInfo.length - 1; i > -1; i--) {
                        count = _drawArrayInfo[i].count;
                        start = _drawArrayInfo[i].start;
                        triangles += (count - 2) * instanceCount;
                        this._encoder.draw(count, instanceCount, start, 0);
                        this._engine._addStatisticsInfo(Laya.GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, 1);
                    }
                    break;
                case Laya.DrawType.DrawElementInstance:
                    for (let i = _drawElementInfo.length - 1; i > -1; i--) {
                        count = _drawElementInfo[i].elementCount;
                        start = _drawElementInfo[i].elementStart;
                        triangles += count / 3 * instanceCount;
                        this._encoder.drawIndexed(count, instanceCount, start / indexByte, 0);
                        this._engine._addStatisticsInfo(Laya.GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, 1);
                    }
                    break;
            }
            this._engine._addStatisticsInfo(Laya.GPUEngineStatisticsInfo.C_TriangleCount, triangles);
            return triangles;
        }
        applyGeometryPart(geometry, part, setBuffer = true) {
            const { bufferState, indexFormat, drawType, instanceCount, _drawArrayInfo, _drawElementInfo } = geometry;
            const { _vertexBuffers: vertexBuffers, _bindedIndexBuffer: indexBuffer } = bufferState;
            let indexByte = 2;
            if (setBuffer) {
                vertexBuffers.forEach((vb, i) => this.setVertexBuffer(i, vb.source._source, 0, vb.source._size));
                if (indexBuffer) {
                    indexByte = geometry.gpuIndexByte;
                    this.setIndexBuffer(indexBuffer.source._source, geometry.gpuIndexFormat, indexBuffer.source._size, 0);
                }
            }
            let triangles = 0;
            let count = 0, start = 0;
            switch (drawType) {
                case Laya.DrawType.DrawArray:
                    count = _drawArrayInfo[part].count;
                    start = _drawArrayInfo[part].start;
                    triangles = count - 2;
                    this._encoder.draw(count, 1, start, 0);
                    break;
                case Laya.DrawType.DrawElement:
                    count = _drawElementInfo[part].elementCount;
                    start = _drawElementInfo[part].elementStart;
                    triangles = count / 3;
                    this._encoder.drawIndexed(count, 1, start / indexByte, 0);
                    break;
                case Laya.DrawType.DrawArrayInstance:
                    count = _drawArrayInfo[part].count;
                    start = _drawArrayInfo[part].start;
                    triangles = (count - 2) * instanceCount;
                    this._encoder.draw(count, instanceCount, start, 0);
                    this._engine._addStatisticsInfo(Laya.GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, 1);
                    break;
                case Laya.DrawType.DrawElementInstance:
                    count = _drawElementInfo[part].elementCount;
                    start = _drawElementInfo[part].elementStart;
                    triangles += count / 3 * instanceCount;
                    this._encoder.drawIndexed(count, instanceCount, start / indexByte, 0);
                    this._engine._addStatisticsInfo(Laya.GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, 1);
                    break;
            }
            this._engine._addStatisticsInfo(Laya.GPUEngineStatisticsInfo.C_TriangleCount, triangles);
            return triangles;
        }
        destroy() {
            this._encoder = null;
            this._elements.clear();
            this._elements = null;
            this.renderBundle = null;
        }
    }
    WebGPURenderBundle.idCounter = 0;

    class WebGPURenderBundleManager {
        constructor() {
            this.elementsMaxPerBundleStatic = 100;
            this.elementsMaxPerBundleDynamic = 30;
            this.bundles = [];
            this._triangles = 0;
            this._elementsMap = new Map();
            this._renderBundles = [];
            this._needUpdateRenderBundles = false;
        }
        renderBundles(passEncoder) {
            const rbs = this._renderBundles;
            if (this._needUpdateRenderBundles) {
                rbs.length = 0;
                this._triangles = 0;
                for (let i = 0, len = this.bundles.length; i < len; i++) {
                    rbs.push(this.bundles[i].renderBundle);
                    this._triangles += this.bundles[i].renderTriangles;
                }
                this._needUpdateRenderBundles = false;
            }
            passEncoder.executeBundles(rbs);
            this.renderTimeStamp = Laya.Laya.timer.currTimer;
            WebGPURenderEngine._instance._addStatisticsInfo(Laya.GPUEngineStatisticsInfo.C_TriangleCount, this._triangles);
        }
        has(elementId) {
            const bundle = this._elementsMap.get(elementId);
            if (bundle) {
                bundle.addShot();
                return true;
            }
            return false;
        }
        getBundle(elementId) {
            for (let i = this.bundles.length - 1; i > -1; i--)
                if (this.bundles[i].hasElement(elementId))
                    return this.bundles[i];
            return null;
        }
        createBundle(context, elements, shotRateSet) {
            const bundle = new WebGPURenderBundle(context.device, context.destRT, shotRateSet);
            for (let i = 0, len = elements.length; i < len; i++) {
                bundle.render(context, elements[i]);
                this._elementsMap.set(elements[i].bundleId, bundle);
            }
            bundle.finish();
            this.bundles.push(bundle);
            this._needUpdateRenderBundles = true;
        }
        removeBundle(bundle) {
            if (bundle) {
                const idx = this.bundles.indexOf(bundle);
                if (idx !== -1) {
                    this.bundles[idx].removeMyIds(this._elementsMap);
                    this.bundles.splice(idx, 1);
                    this._needUpdateRenderBundles = true;
                }
            }
        }
        removeBundleByElement(elementId) {
            this.removeBundle(this.getBundle(elementId));
        }
        clearBundle() {
            this.bundles.forEach(bundle => bundle.destroy());
            this.bundles.length = 0;
            this._elementsMap.clear();
            this._needUpdateRenderBundles = true;
        }
        clearShot() {
            this.bundles.forEach(bundle => bundle.clearShotNum());
        }
        removeLowShotBundle() {
            let remove = false;
            const bundles = this.bundles;
            for (let i = bundles.length - 1; i > -1; i--) {
                if (bundles[i].isLowShotRate()) {
                    bundles[i].removeMyIds(this._elementsMap);
                    bundles.splice(i, 1);
                    remove = true;
                }
            }
            if (remove)
                this._needUpdateRenderBundles = true;
            return remove;
        }
        destroy() {
            this.clearBundle();
        }
    }

    class WebGPURenderBundleManagerSet {
        constructor() {
            this.bundleManager = new WebGPURenderBundleManager();
            this.elementsToBundleStatic = [];
            this.elementsToBundleDynamic = [];
        }
        clearBundle() {
            this.bundleManager.clearBundle();
            this.elementsToBundleStatic.length = 0;
            this.elementsToBundleDynamic.length = 0;
        }
    }

    class WebGPUBufferAlone extends Laya.UniformBufferAlone {
        constructor(size, manager) {
            super(size, manager);
            this.objectName = 'WebGPUBufferAlone';
            this.globalId = WebGPUGlobal.getId(this);
            WebGPUGlobal.action(this, 'allocMemory', this.alignedSize);
        }
        destroy() {
            if (super.destroy()) {
                WebGPUGlobal.action(this, 'releaseMemory | uniform', this.alignedSize);
                WebGPUGlobal.releaseId(this);
                return true;
            }
            return false;
        }
    }

    class WebGPUBufferBlock extends Laya.UniformBufferBlock {
        constructor(sn, buffer, index, size, alignedSize, user) {
            super(sn, buffer, index, size, alignedSize, user);
            this.objectName = 'WebGPUBufferBlock';
            this.globalId = WebGPUGlobal.getId(this);
            WebGPUGlobal.action(this, 'getMemory', this.alignedSize);
        }
        destroy() {
            if (super.destroy()) {
                WebGPUGlobal.action(this, 'returnMemory | uniform', this.alignedSize);
                WebGPUGlobal.releaseId(this);
                return true;
            }
            return false;
        }
    }

    class WebGPUBufferCluster extends Laya.UniformBufferCluster {
        constructor(blockSize, blockNum, manager) {
            super(blockSize, blockNum, manager);
            this.objectName = 'WebGPUBufferCluster';
            this.globalId = WebGPUGlobal.getId(this);
            WebGPUGlobal.action(this, 'allocMemory', this.totalSize);
        }
        destroy() {
            if (super.destroy()) {
                WebGPUGlobal.action(this, 'releaseMemory | uniform', this.totalSize);
                WebGPUGlobal.releaseId(this);
                return true;
            }
            return false;
        }
    }

    exports.NagaWASM = NagaWASM;
    exports.WebDefineDatas = WebDefineDatas;
    exports.WebGLShaderData = WebGLShaderData;
    exports.WebGPUBlendState = WebGPUBlendState;
    exports.WebGPUBuffer = WebGPUBuffer;
    exports.WebGPUBufferAlone = WebGPUBufferAlone;
    exports.WebGPUBufferBlock = WebGPUBufferBlock;
    exports.WebGPUBufferCluster = WebGPUBufferCluster;
    exports.WebGPUBufferManager = WebGPUBufferManager;
    exports.WebGPUBufferState = WebGPUBufferState;
    exports.WebGPUCapable = WebGPUCapable;
    exports.WebGPUCodeGenerator = WebGPUCodeGenerator;
    exports.WebGPUCommandUniformMap = WebGPUCommandUniformMap;
    exports.WebGPUConfig = WebGPUConfig;
    exports.WebGPUDepthStencilState = WebGPUDepthStencilState;
    exports.WebGPUGlobal = WebGPUGlobal;
    exports.WebGPUIndexBuffer = WebGPUIndexBuffer;
    exports.WebGPUInternalRT = WebGPUInternalRT;
    exports.WebGPUInternalTex = WebGPUInternalTex;
    exports.WebGPUPrimitiveState = WebGPUPrimitiveState;
    exports.WebGPURender2DProcess = WebGPURender2DProcess;
    exports.WebGPURenderBundle = WebGPURenderBundle;
    exports.WebGPURenderBundleManager = WebGPURenderBundleManager;
    exports.WebGPURenderBundleManagerSet = WebGPURenderBundleManagerSet;
    exports.WebGPURenderCommandEncoder = WebGPURenderCommandEncoder;
    exports.WebGPURenderContext2D = WebGPURenderContext2D;
    exports.WebGPURenderDeviceFactory = WebGPURenderDeviceFactory;
    exports.WebGPURenderElement2D = WebGPURenderElement2D;
    exports.WebGPURenderEngine = WebGPURenderEngine;
    exports.WebGPURenderEngineFactory = WebGPURenderEngineFactory;
    exports.WebGPURenderGeometry = WebGPURenderGeometry;
    exports.WebGPURenderPassHelper = WebGPURenderPassHelper;
    exports.WebGPURenderPipeline = WebGPURenderPipeline;
    exports.WebGPUResourceRecover = WebGPUResourceRecover;
    exports.WebGPUSampler = WebGPUSampler;
    exports.WebGPUShaderCompileCode = WebGPUShaderCompileCode;
    exports.WebGPUShaderCompileDef = WebGPUShaderCompileDef;
    exports.WebGPUShaderCompileUtil = WebGPUShaderCompileUtil;
    exports.WebGPUShaderData = WebGPUShaderData;
    exports.WebGPUShaderDefine = WebGPUShaderDefine;
    exports.WebGPUShaderInstance = WebGPUShaderInstance;
    exports.WebGPUShaderToken = WebGPUShaderToken;
    exports.WebGPUStatis = WebGPUStatis;
    exports.WebGPUTextureContext = WebGPUTextureContext;
    exports.WebGPUUniformBlockInfo = WebGPUUniformBlockInfo;
    exports.WebGPUUniformBuffer = WebGPUUniformBuffer;
    exports.WebGPUVertexBuffer = WebGPUVertexBuffer;
    exports.WebGPU_GLSLCommon = WebGPU_GLSLCommon;
    exports.WebGPU_GLSLFunction = WebGPU_GLSLFunction;
    exports.WebGPU_GLSLMacro = WebGPU_GLSLMacro;
    exports.WebGPU_GLSLProcess = WebGPU_GLSLProcess;
    exports.WebGPU_GLSLStruct = WebGPU_GLSLStruct;
    exports.WebGPU_GLSLUniform = WebGPU_GLSLUniform;
    exports.WebShaderPass = WebShaderPass;
    exports.WebSubShader = WebSubShader;
    exports.WebUnitRenderModuleDataFactory = WebUnitRenderModuleDataFactory;
    exports._clearCR = _clearCR;
    exports.boolCheck = boolCheck;
    exports.doPremultiplyAlpha = doPremultiplyAlpha;
    exports.genMipmap = genMipmap;
    exports.isTypedArray = isTypedArray;
    exports.normalizeGPUExtent3D = normalizeGPUExtent3D;
    exports.numMipLevels = numMipLevels;
    exports.roundDown = roundDown;
    exports.roundUp = roundUp;

})(window.Laya = window.Laya || {}, Laya);
//# sourceMappingURL=laya.webgpu_2D.js.map
