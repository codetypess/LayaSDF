(function (exports, Laya) {
    'use strict';

    class NativeBounds {
        get min() {
            return this.getMin();
        }
        set min(value) {
            this.setMin(value);
        }
        get max() {
            return this.getMax();
        }
        set max(value) {
            this.setMax(value);
        }
        setMin(value) {
            this.float64Array[0] = value.x;
            this.float64Array[1] = value.y;
            this.float64Array[2] = value.z;
            this._nativeObj.setMin();
        }
        getMin() {
            var min = this._boundBox.min;
            this._nativeObj.getMin();
            min.x = this.float64Array[0];
            min.y = this.float64Array[1];
            min.z = this.float64Array[2];
            return min;
        }
        setMax(value) {
            this.float64Array[0] = value.x;
            this.float64Array[1] = value.y;
            this.float64Array[2] = value.z;
            this._nativeObj.setMax();
        }
        getMax() {
            var max = this._boundBox.max;
            this._nativeObj.getMax();
            max.x = this.float64Array[0];
            max.y = this.float64Array[1];
            max.z = this.float64Array[2];
            return max;
        }
        setCenter(value) {
            this.float64Array[0] = value.x;
            this.float64Array[1] = value.y;
            this.float64Array[2] = value.z;
            this._nativeObj.setCenter();
        }
        getCenter() {
            var center = this._center;
            this._nativeObj.getCenter();
            center.x = this.float64Array[0];
            center.y = this.float64Array[1];
            center.z = this.float64Array[2];
            return center;
        }
        setExtent(value) {
            this.float64Array[0] = value.x;
            this.float64Array[1] = value.y;
            this.float64Array[2] = value.z;
            this._nativeObj.setExtent();
        }
        getExtent() {
            var extent = this._extent;
            this._nativeObj.getExtent();
            extent.x = this.float64Array[0];
            extent.y = this.float64Array[1];
            extent.z = this.float64Array[2];
            return extent;
        }
        constructor(min, max) {
            this._center = new Laya.Vector3();
            this._extent = new Laya.Vector3();
            this._boundBox = new Laya.BoundBox(new Laya.Vector3(), new Laya.Vector3());
            this.nativeMemory = new Laya.NativeMemory(NativeBounds.MemoryBlock_size, true);
            this.float32Array = this.nativeMemory.float32Array;
            this.float64Array = this.nativeMemory.float64Array;
            this._nativeObj = new window.conchBounds(this.nativeMemory._buffer);
            min && this.setMin(min);
            max && this.setMax(max);
        }
        _tranform(matrix, out) {
            this.float32Array.set(matrix.elements);
            this._nativeObj._tranform(matrix, out._nativeObj);
        }
        _getBoundBox() {
            this._nativeObj._getBoundBox();
            this._boundBox.min.x = this.float64Array[0];
            this._boundBox.min.y = this.float64Array[1];
            this._boundBox.min.z = this.float64Array[2];
            this._boundBox.max.x = this.float64Array[3];
            this._boundBox.max.y = this.float64Array[4];
            this._boundBox.max.z = this.float64Array[5];
            return this._boundBox;
        }
        calculateBoundsintersection(bounds) {
            var ownMax = this.getMax();
            var ownMin = this.getMin();
            var calMax = bounds.getMax();
            var calMin = bounds.getMin();
            var tempV0 = TEMP_VECTOR3_MAX0;
            var tempV1 = TEMP_VECTOR3_MAX1;
            var thisExtends = this.getExtent();
            var boundExtends = bounds.getExtent();
            tempV0.setValue(Math.max(ownMax.x, calMax.x) - Math.min(ownMin.x, calMin.x), Math.max(ownMax.y, calMax.y) - Math.min(ownMin.y, calMin.y), Math.max(ownMax.z, calMax.z) - Math.min(ownMin.z, calMin.z));
            tempV1.setValue((thisExtends.x + boundExtends.x) * 2.0, (thisExtends.y + boundExtends.y) * 2.0, (thisExtends.z + boundExtends.z) * 2.0);
            if ((tempV0.x) > (tempV1.x))
                return -1;
            if ((tempV0.y) > (tempV1.y))
                return -1;
            if ((tempV0.z) > (tempV1.z))
                return -1;
            return (tempV1.x - tempV0.x) * (tempV1.y - tempV0.y) * (tempV1.z - tempV0.z);
        }
        cloneTo(destObject) {
            this._nativeObj.cloneTo(destObject._nativeObj);
        }
        clone() {
            var dest = new NativeBounds(new Laya.Vector3(), new Laya.Vector3());
            this.cloneTo(dest);
            return dest;
        }
    }
    NativeBounds.MemoryBlock_size = Math.max(6 * 8, 16 * 4);
    const TEMP_VECTOR3_MAX0 = new Laya.Vector3();
    const TEMP_VECTOR3_MAX1 = new Laya.Vector3();

    class RTCameraNodeData {
        get transform() {
            return this._transform;
        }
        set transform(value) {
            this._transform = value;
            this._nativeObj.setTransform(value._nativeObj);
        }
        get farplane() {
            return this._nativeObj._farplane;
        }
        set farplane(value) {
            this._nativeObj._farplane = value;
        }
        get nearplane() {
            return this._nativeObj._nearplane;
        }
        set nearplane(value) {
            this._nativeObj._nearplane = value;
        }
        get fieldOfView() {
            return this._nativeObj._fieldOfView;
        }
        set fieldOfView(value) {
            this._nativeObj._fieldOfView = value;
        }
        get aspectRatio() {
            return this._nativeObj._aspectRatio;
        }
        set aspectRatio(value) {
            this._nativeObj._aspectRatio = value;
        }
        constructor() {
            this._nativeObj = new window.conchRTCameraNodeData();
        }
        setProjectionViewMatrix(value) {
            value && this._nativeObj.setProjectionViewMatrix(value);
        }
    }
    class RTSceneNodeData {
        get lightmapDirtyFlag() {
            return this._nativeObj._lightmapDirtyFlag;
        }
        set lightmapDirtyFlag(value) {
            this._nativeObj._lightmapDirtyFlag = value;
        }
        constructor() {
            this._nativeObj = new window.conchRTSceneNodeData();
        }
    }

    class RTTransform3D extends Laya.Transform3D {
        constructor(owner) {
            super(owner);
            this._localPosition = new Laya.Vector3(0, 0, 0);
            this._localRotation = new Laya.Quaternion(0, 0, 0, 1);
            this._localScale = new Laya.Vector3(1, 1, 1);
            this._localRotationEuler = new Laya.Vector3(0, 0, 0);
            this._localMatrix = new Laya.Matrix4x4();
            this._position = new Laya.Vector3(0, 0, 0);
            this._rotation = new Laya.Quaternion(0, 0, 0, 1);
            this._scale = new Laya.Vector3(1, 1, 1);
            this._rotationEuler = new Laya.Vector3(0, 0, 0);
            this._worldMatrix = new Laya.Matrix4x4();
            this._rtSyncFlag = 0;
            this._isDefaultMatrix = false;
            this._faceInvert = false;
            this._frontFaceValue = 1;
        }
        _initProperty() {
            this._nativeMemory = new Laya.NativeMemory(RTTransform3D.TRANSFORM_SHARE_MEMORY_SIZE * 4, false);
            this._nativeFloat32Buffer = this._nativeMemory.float32Array;
            this._nativeUInt32Buffer = this._nativeMemory.Uint32Array;
            this._nativeObj = new window.conchRTTransform(this._nativeMemory._buffer);
            this._setTransformFlag(Laya.Transform3D.TRANSFORM_WORLDPOSITION | Laya.Transform3D.TRANSFORM_WORLDQUATERNION | Laya.Transform3D.TRANSFORM_WORLDEULER | Laya.Transform3D.TRANSFORM_WORLDSCALE | Laya.Transform3D.TRANSFORM_WORLDMATRIX, true);
            this.rotation = this._rotation;
            this.localScale = this._localScale;
            this.setWorldLossyScale(this._scale);
            this.localRotation = this._localRotation;
        }
        get isDefaultMatrix() {
            if (this._getTransformFlag(Laya.Transform3D.TRANSFORM_LOCALMATRIX)) {
                this.localMatrix;
            }
            return this._isDefaultMatrix;
        }
        _setTransformFlag(type, value) {
            this._nativeObj.setTransformFlag(type, value);
        }
        _getTransformFlag(type) {
            return (this._nativeUInt32Buffer[RTTransform3D.TRANSFORM_CHANGEFLAG_DATAOFFSET] & type) != 0;
        }
        _getRTSyncFlag(type) {
            return (this._nativeUInt32Buffer[RTTransform3D.TRANSFORM_RT_SYNC_FLAG_DATAOFFSET] & type) != 0;
        }
        _setRTSyncFlag(type, value) {
            let flag = this._nativeUInt32Buffer[RTTransform3D.TRANSFORM_RT_SYNC_FLAG_DATAOFFSET];
            if (value)
                flag |= type;
            else
                flag &= ~type;
            this._nativeUInt32Buffer[RTTransform3D.TRANSFORM_RT_SYNC_FLAG_DATAOFFSET] = flag;
        }
        get _RTtransformFlag() {
            return this._nativeUInt32Buffer[RTTransform3D.TRANSFORM_CHANGEFLAG_DATAOFFSET];
        }
        get localPositionX() {
            return this.localPosition.x;
        }
        set localPositionX(x) {
            let localPos = this.localPosition;
            localPos.x = x;
            this.localPosition = localPos;
        }
        get localPositionY() {
            return this.localPosition.y;
        }
        set localPositionY(y) {
            let localPos = this.localPosition;
            localPos.y = y;
            this.localPosition = localPos;
        }
        get localPositionZ() {
            return this.localPosition.z;
        }
        set localPositionZ(z) {
            let localPos = this.localPosition;
            localPos.z = z;
            this.localPosition = localPos;
        }
        get localPosition() {
            if (this._getTransformFlag(Laya.Transform3D.TRANSFORM_LOCALPOS)) {
                this._nativeObj.getLocalPosition();
            }
            if (this._getRTSyncFlag(Laya.Transform3D.TRANSFORM_LOCALPOS)) {
                let index = RTTransform3D.TRANSFORM_LOCALPOS_DATAOFFSET;
                this._localPosition.setValue(this._nativeFloat32Buffer[index], this._nativeFloat32Buffer[index + 1], this._nativeFloat32Buffer[index + 2]);
                this._setRTSyncFlag(Laya.Transform3D.TRANSFORM_LOCALPOS, false);
            }
            return this._localPosition;
        }
        set localPosition(value) {
            let index = RTTransform3D.TRANSFORM_LOCALPOS_DATAOFFSET;
            this._nativeFloat32Buffer[index] = value.x;
            this._nativeFloat32Buffer[index + 1] = value.y;
            this._nativeFloat32Buffer[index + 2] = value.z;
            this._nativeObj.setLocalPosition();
            this._onWorldPositionTransform();
        }
        get localRotation() {
            if (this._getTransformFlag(Laya.Transform3D.TRANSFORM_LOCALQUATERNION)) {
                this._nativeObj.getLocalRotation();
            }
            if (this._getRTSyncFlag(Laya.Transform3D.TRANSFORM_LOCALQUATERNION)) {
                let index = RTTransform3D.TRANSFORM_LOCALQUATERNION_DATAOFFSET;
                this._localRotation.setValue(this._nativeFloat32Buffer[index], this._nativeFloat32Buffer[index + 1], this._nativeFloat32Buffer[index + 2], this._nativeFloat32Buffer[index + 3]);
                this._setRTSyncFlag(Laya.Transform3D.TRANSFORM_LOCALQUATERNION, false);
            }
            return this._localRotation;
        }
        set localRotation(value) {
            value.normalize(this._localRotation);
            let index = RTTransform3D.TRANSFORM_LOCALQUATERNION_DATAOFFSET;
            this._nativeFloat32Buffer[index] = value.x;
            this._nativeFloat32Buffer[index + 1] = value.y;
            this._nativeFloat32Buffer[index + 2] = value.z;
            this._nativeFloat32Buffer[index + 3] = value.w;
            this._nativeObj.setLocalRotation();
            this._onWorldRotationTransform();
        }
        get localScaleX() {
            return this.localScale.x;
        }
        set localScaleX(value) {
            let scale = this.localScale;
            scale.x = value;
            this.localScale = scale;
        }
        get localScaleY() {
            return this.localScale.y;
        }
        set localScaleY(value) {
            let scale = this.localScale;
            scale.y = value;
            this.localScale = scale;
        }
        get localScaleZ() {
            return this.localScale.z;
        }
        set localScaleZ(value) {
            let scale = this.localScale;
            scale.z = value;
            this.localScale = scale;
        }
        get localScale() {
            if (this._getTransformFlag(Laya.Transform3D.TRANSFORM_LOCALPOS)) {
                this._nativeObj.getLocalScale();
            }
            if (this._getRTSyncFlag(Laya.Transform3D.TRANSFORM_LOCALSCALE)) {
                let index = RTTransform3D.TRANSFORM_LOCALSCALE_DATAOFFSET;
                this._localScale.setValue(this._nativeFloat32Buffer[index], this._nativeFloat32Buffer[index + 1], this._nativeFloat32Buffer[index + 2]);
                this._setRTSyncFlag(Laya.Transform3D.TRANSFORM_LOCALSCALE, false);
            }
            return this._localScale;
        }
        set localScale(value) {
            let index = RTTransform3D.TRANSFORM_LOCALSCALE_DATAOFFSET;
            this._nativeFloat32Buffer[index] = value.x;
            this._nativeFloat32Buffer[index + 1] = value.y;
            this._nativeFloat32Buffer[index + 2] = value.z;
            this._nativeObj.setLocalScale();
            this._onWorldScaleTransform();
        }
        get localRotationEuler() {
            if (this._getTransformFlag(Laya.Transform3D.TRANSFORM_LOCALEULER)) {
                this._nativeObj.getLocalRotationEuler();
            }
            if (this._getRTSyncFlag(Laya.Transform3D.TRANSFORM_LOCALEULER)) {
                let index = RTTransform3D.TRANSFORM_LOCALEULER_DATAOFFSET;
                this._localRotationEuler.setValue(this._nativeFloat32Buffer[index], this._nativeFloat32Buffer[index + 1], this._nativeFloat32Buffer[index + 2]);
                this._setRTSyncFlag(Laya.Transform3D.TRANSFORM_LOCALEULER, false);
            }
            return this._localRotationEuler;
        }
        set localRotationEuler(value) {
            let index = RTTransform3D.TRANSFORM_LOCALEULER_DATAOFFSET;
            this._nativeFloat32Buffer[index] = value.x;
            this._nativeFloat32Buffer[index + 1] = value.y;
            this._nativeFloat32Buffer[index + 2] = value.z;
            this._nativeObj.setLocalRotationEuler();
            this._onWorldRotationTransform();
        }
        get localMatrix() {
            if (this._getTransformFlag(Laya.Transform3D.TRANSFORM_LOCALMATRIX)) {
                this._nativeObj.getLocalMatrix();
            }
            if (this._getRTSyncFlag(Laya.Transform3D.TRANSFORM_LOCALEULER)) {
                let index = RTTransform3D.TRANSFORM_LOCALMATRIX_DATAOFFSET;
                for (var i = 0; i < 16; ++i) {
                    this._localMatrix.elements[i] = this._nativeFloat32Buffer[i + index];
                }
                this._setRTSyncFlag(Laya.Transform3D.TRANSFORM_LOCALEULER, false);
            }
            return this._localMatrix;
        }
        set localMatrix(value) {
            let index = RTTransform3D.TRANSFORM_LOCALMATRIX_DATAOFFSET;
            this._nativeFloat32Buffer.set(value.elements, index);
            this._nativeObj.setLocalMatrix();
            this._isDefaultMatrix = value.isIdentity();
            this._onWorldTransform();
        }
        get position() {
            if (this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDPOSITION)) {
                this._nativeObj.getPosition();
            }
            if (this._getRTSyncFlag(Laya.Transform3D.TRANSFORM_WORLDPOSITION)) {
                let index = RTTransform3D.TRANSFORM_WORLDPOS_DATAOFFSET;
                this._position.setValue(this._nativeFloat32Buffer[index], this._nativeFloat32Buffer[index + 1], this._nativeFloat32Buffer[index + 2]);
                this._setRTSyncFlag(Laya.Transform3D.TRANSFORM_WORLDPOSITION, false);
            }
            return this._position;
        }
        set position(value) {
            let index = RTTransform3D.TRANSFORM_WORLDPOS_DATAOFFSET;
            this._nativeFloat32Buffer[index] = value.x;
            this._nativeFloat32Buffer[index + 1] = value.y;
            this._nativeFloat32Buffer[index + 2] = value.z;
            this._nativeObj.setPosition();
            this._onWorldPositionTransform();
        }
        get rotation() {
            if (this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDQUATERNION)) {
                this._nativeObj.getRotation();
            }
            if (this._getRTSyncFlag(Laya.Transform3D.TRANSFORM_WORLDQUATERNION)) {
                let index = RTTransform3D.TRANSFORM_WORLDQUATERNION_DATAOFFSET;
                this._rotation.setValue(this._nativeFloat32Buffer[index], this._nativeFloat32Buffer[index + 1], this._nativeFloat32Buffer[index + 2], this._nativeFloat32Buffer[index + 3]);
                this._setRTSyncFlag(Laya.Transform3D.TRANSFORM_WORLDQUATERNION, false);
            }
            return this._rotation;
        }
        set rotation(value) {
            let index = RTTransform3D.TRANSFORM_WORLDQUATERNION_DATAOFFSET;
            this._nativeFloat32Buffer[index] = value.x;
            this._nativeFloat32Buffer[index + 1] = value.y;
            this._nativeFloat32Buffer[index + 2] = value.z;
            this._nativeFloat32Buffer[index + 3] = value.w;
            this._nativeObj.setRotation();
            this._onWorldRotationTransform();
        }
        get rotationEuler() {
            if (this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDEULER)) {
                this._nativeObj.getRotationEuler();
            }
            if (this._getRTSyncFlag(Laya.Transform3D.TRANSFORM_WORLDEULER)) {
                let index = RTTransform3D.TRANSFORM_WORLDEULER_DATAOFFSET;
                this._rotationEuler.setValue(this._nativeFloat32Buffer[index], this._nativeFloat32Buffer[index + 1], this._nativeFloat32Buffer[index + 2]);
                this._setRTSyncFlag(Laya.Transform3D.TRANSFORM_WORLDEULER, false);
            }
            return this._rotationEuler;
        }
        set rotationEuler(value) {
            let index = RTTransform3D.TRANSFORM_WORLDEULER_DATAOFFSET;
            this._nativeFloat32Buffer[index] = value.x;
            this._nativeFloat32Buffer[index + 1] = value.y;
            this._nativeFloat32Buffer[index + 2] = value.z;
            this._nativeObj.setRotationEuler();
            this._onWorldRotationTransform();
        }
        get worldMatrix() {
            if (this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDMATRIX)) {
                this._nativeObj.getWorldMatrix();
            }
            if (this._getRTSyncFlag(Laya.Transform3D.TRANSFORM_WORLDMATRIX)) {
                let index = RTTransform3D.TRANSFORM_WORLDMATRIX_DATAOFFSET;
                for (var i = 0; i < 16; ++i) {
                    this._worldMatrix.elements[i] = this._nativeFloat32Buffer[i + index];
                }
                this._setRTSyncFlag(Laya.Transform3D.TRANSFORM_WORLDMATRIX, false);
            }
            return this._worldMatrix;
        }
        set worldMatrix(value) {
            let index = RTTransform3D.TRANSFORM_WORLDMATRIX_DATAOFFSET;
            this._nativeFloat32Buffer.set(value.elements, index);
            this._nativeObj.setWorldMatrix();
            this._onWorldTransform();
        }
        _setParent(value) {
            super._setParent(value);
            this._nativeObj.setParent(value ? value._nativeObj : null);
        }
        _onWorldPositionRotationTransform() {
            if (!this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDPOSITION) || !this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDQUATERNION) || !this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDEULER)) {
                this._setTransformFlag(Laya.Transform3D.TRANSFORM_WORLDMATRIX | Laya.Transform3D.TRANSFORM_WORLDPOSITION | Laya.Transform3D.TRANSFORM_WORLDQUATERNION | Laya.Transform3D.TRANSFORM_WORLDEULER, true);
                this.event(Laya.Event.TRANSFORM_CHANGED, this._RTtransformFlag);
            }
            for (var i = 0, n = this._children.length; i < n; i++)
                this._children[i]._onWorldPositionRotationTransform();
        }
        _onWorldPositionScaleTransform() {
            if (!this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDPOSITION) || !this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDSCALE)) {
                this._setTransformFlag(Laya.Transform3D.TRANSFORM_WORLDMATRIX | Laya.Transform3D.TRANSFORM_WORLDPOSITION | Laya.Transform3D.TRANSFORM_WORLDSCALE, true);
                this.event(Laya.Event.TRANSFORM_CHANGED, this._RTtransformFlag);
            }
            for (var i = 0, n = this._children.length; i < n; i++)
                this._children[i]._onWorldPositionScaleTransform();
        }
        _onWorldPositionTransform() {
            if (!this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDPOSITION)) {
                this._setTransformFlag(Laya.Transform3D.TRANSFORM_WORLDMATRIX | Laya.Transform3D.TRANSFORM_WORLDPOSITION, true);
                this.event(Laya.Event.TRANSFORM_CHANGED, this._RTtransformFlag);
            }
            for (var i = 0, n = this._children.length; i < n; i++)
                this._children[i]._onWorldPositionTransform();
        }
        _onWorldRotationTransform() {
            if (!this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDQUATERNION) || !this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDEULER)) {
                this._setTransformFlag(Laya.Transform3D.TRANSFORM_WORLDMATRIX | Laya.Transform3D.TRANSFORM_WORLDQUATERNION | Laya.Transform3D.TRANSFORM_WORLDEULER, true);
                this.event(Laya.Event.TRANSFORM_CHANGED, this._RTtransformFlag);
            }
            for (var i = 0, n = this._children.length; i < n; i++)
                this._children[i]._onWorldPositionRotationTransform();
        }
        _onWorldScaleTransform() {
            if (!this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDSCALE)) {
                this._setTransformFlag(Laya.Transform3D.TRANSFORM_WORLDMATRIX | Laya.Transform3D.TRANSFORM_WORLDSCALE, true);
                this.event(Laya.Event.TRANSFORM_CHANGED, this._RTtransformFlag);
            }
            for (var i = 0, n = this._children.length; i < n; i++)
                this._children[i]._onWorldPositionScaleTransform();
        }
        _onWorldTransform() {
            if (!this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDPOSITION) || !this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDQUATERNION) || !this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDEULER) || !this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDSCALE)) {
                this._setTransformFlag(Laya.Transform3D.TRANSFORM_WORLDMATRIX | Laya.Transform3D.TRANSFORM_WORLDPOSITION | Laya.Transform3D.TRANSFORM_WORLDQUATERNION | Laya.Transform3D.TRANSFORM_WORLDEULER | Laya.Transform3D.TRANSFORM_WORLDSCALE, true);
                this.event(Laya.Event.TRANSFORM_CHANGED, this._RTtransformFlag);
            }
            for (var i = 0, n = this._children.length; i < n; i++)
                this._children[i]._onWorldTransform();
        }
        translate(translation, isLocal = true) {
            if (isLocal) {
                Laya.Matrix4x4.createFromQuaternion(this.localRotation, _tempMatrix0);
                Laya.Vector3.transformCoordinate(translation, _tempMatrix0, _tempVector30);
                Laya.Vector3.add(this.localPosition, _tempVector30, this._localPosition);
                this.localPosition = this._localPosition;
            }
            else {
                Laya.Vector3.add(this.position, translation, this._position);
                this.position = this._position;
            }
        }
        rotate(rotation, isLocal = true, isRadian = true) {
            var rot;
            if (isRadian) {
                rot = rotation;
            }
            else {
                Laya.Vector3.scale(rotation, Math.PI / 180.0, _tempVector30);
                rot = _tempVector30;
            }
            Laya.Quaternion.createFromYawPitchRoll(rot.y, rot.x, rot.z, _tempQuaternion0);
            if (isLocal) {
                Laya.Quaternion.multiply(this.localRotation, _tempQuaternion0, this._localRotation);
                this.localRotation = this._localRotation;
            }
            else {
                Laya.Quaternion.multiply(_tempQuaternion0, this.rotation, this._rotation);
                this.rotation = this._rotation;
            }
        }
        getWorldLossyScale() {
            if (this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDSCALE)) {
                this._nativeObj.getWorldLossyScale();
            }
            if (this._getRTSyncFlag(Laya.Transform3D.TRANSFORM_WORLDSCALE)) {
                let index = RTTransform3D.TRANSFORM_WORLDSCALE_DATAOFFSET;
                this._scale.set(this._nativeFloat32Buffer[index], this._nativeFloat32Buffer[index + 1], this._nativeFloat32Buffer[index + 2]);
                this._setRTSyncFlag(Laya.Transform3D.TRANSFORM_WORLDSCALE, false);
            }
            return this._scale;
        }
        setWorldLossyScale(value) {
            let index = RTTransform3D.TRANSFORM_WORLDSCALE_DATAOFFSET;
            this._nativeFloat32Buffer[index] = value.x;
            this._nativeFloat32Buffer[index + 1] = value.y;
            this._nativeFloat32Buffer[index + 2] = value.z;
            this._nativeObj.setWorldLossyScale();
        }
    }
    RTTransform3D.TRANSFORM_LOCALQUATERNION_DATAOFFSET = 0;
    RTTransform3D.TRANSFORM_LOCALEULER_DATAOFFSET = 4;
    RTTransform3D.TRANSFORM_LOCALPOS_DATAOFFSET = 7;
    RTTransform3D.TRANSFORM_LOCALSCALE_DATAOFFSET = 10;
    RTTransform3D.TRANSFORM_LOCALMATRIX_DATAOFFSET = 13;
    RTTransform3D.TRANSFORM_WORLDQUATERNION_DATAOFFSET = 29;
    RTTransform3D.TRANSFORM_WORLDEULER_DATAOFFSET = 33;
    RTTransform3D.TRANSFORM_WORLDPOS_DATAOFFSET = 36;
    RTTransform3D.TRANSFORM_WORLDSCALE_DATAOFFSET = 39;
    RTTransform3D.TRANSFORM_WORLDMATRIX_DATAOFFSET = 42;
    RTTransform3D.TRANSFORM_CHANGEFLAG_DATAOFFSET = 58;
    RTTransform3D.TRANSFORM_RT_SYNC_FLAG_DATAOFFSET = 59;
    RTTransform3D.TRANSFORM_SHARE_MEMORY_SIZE = 60;
    const _tempVector30 = new Laya.Vector3();
    const _tempQuaternion0 = new Laya.Quaternion();
    const _tempMatrix0 = new Laya.Matrix4x4();

    class RTBaseRenderNode {
        get transform() {
            return this._transform;
        }
        set transform(value) {
            this._nativeObj.setTransform(value._nativeObj);
            this._transform = value;
        }
        get distanceForSort() {
            return this._nativeObj.distanceForSort;
        }
        set distanceForSort(value) {
            this._nativeObj.distanceForSort = value;
        }
        get sortingFudge() {
            return this._nativeObj.sortingFudge;
        }
        set sortingFudge(value) {
            this._nativeObj.sortingFudge = value;
        }
        get castShadow() {
            return this._nativeObj.castShadow;
        }
        set castShadow(value) {
            this._nativeObj.castShadow = value;
        }
        get enable() {
            return this._nativeObj.enable;
        }
        set enable(value) {
            this._nativeObj.enable = value;
        }
        get renderbitFlag() {
            return this._nativeObj.renderbitFlag;
        }
        set renderbitFlag(value) {
            this._nativeObj.renderbitFlag = value;
        }
        get layer() {
            return this._nativeObj.layer;
        }
        set layer(value) {
            this._nativeObj.layer = value;
        }
        get bounds() {
            this._nativeObj._bounds;
            return this._bounds;
        }
        set bounds(value) {
            this._bounds = value;
            this._nativeObj._bounds = value._imp._nativeObj;
        }
        get baseGeometryBounds() {
            return this._baseGeometryBounds;
        }
        set baseGeometryBounds(value) {
            this._baseGeometryBounds = value;
            this._nativeObj.setBaseGeometryBounds(value._imp._nativeObj);
        }
        get boundsChange() {
            return this._nativeObj.boundsChange;
        }
        set boundsChange(value) {
            this._nativeObj.boundsChange = value;
        }
        get customCull() {
            return this._nativeObj._customCull;
        }
        set customCull(value) {
            this._nativeObj._customCull = value;
        }
        get customCullResoult() {
            return this._nativeObj._customCullResoult;
        }
        set customCullResoult(value) {
            this._nativeObj._customCullResoult = value;
        }
        get staticMask() {
            return this._nativeObj.staticMask;
        }
        set staticMask(value) {
            this._nativeObj.staticMask = value;
        }
        get shaderData() {
            return this._shaderData;
        }
        set shaderData(value) {
            this._shaderData = value;
            this._nativeObj.setShaderData(value._nativeObj);
        }
        get lightmapIndex() {
            return this._nativeObj.lightmapIndex;
        }
        set lightmapIndex(value) {
            this._nativeObj.lightmapIndex = value;
        }
        get lightmap() {
            return this._lightmap;
        }
        set lightmap(value) {
            this._lightmap = value;
            this._nativeObj.setLightmap(value ? value._nativeObj : null);
        }
        get probeReflection() {
            return this._probeReflection;
        }
        set probeReflection(value) {
            this._probeReflection = value;
            this._nativeObj.setProbeReflection(value._nativeObj);
        }
        get probeReflectionUpdateMark() {
            return this._nativeObj.probeReflectionUpdateMark;
        }
        set probeReflectionUpdateMark(value) {
            this._nativeObj.probeReflectionUpdateMark = value;
        }
        get reflectionMode() {
            return this._nativeObj.reflectionMode;
        }
        set reflectionMode(value) {
            this._nativeObj.reflectionMode = value;
        }
        get volumetricGI() {
            return this._volumetricGI;
        }
        set volumetricGI(value) {
            this._volumetricGI = value;
            this._nativeObj.setVolumetricGI(value._nativeObj);
        }
        get lightProbUpdateMark() {
            return this._nativeObj.lightProbUpdateMark;
        }
        set lightProbUpdateMark(value) {
            this._nativeObj.lightProbUpdateMark = value;
        }
        get irradientMode() {
            return this._irradientMode;
        }
        set irradientMode(value) {
            this._irradientMode = value;
            this._nativeObj.irradianceMode = value;
        }
        set_renderUpdatePreCall(call, fun) {
            this._renderUpdatePrebindFun = fun.bind(call, Laya.RenderContext3D._instance._contextOBJ);
            this._nativeObj.setRenderUpdatePre(this._renderUpdatePrebindFun);
        }
        set_caculateBoundingBox(call, fun) {
            this._caculateBoundingBoxbindFun = fun.bind(call);
            this._nativeObj.setCalculateBoundingBox(this._caculateBoundingBoxbindFun);
        }
        _getNativeObj() {
            this._nativeObj = new window.conchRTBaseRenderNode();
        }
        constructor() {
            this._getNativeObj();
            this._defaultBaseGeometryBounds = new Laya.Bounds();
            this.baseGeometryBounds = this._defaultBaseGeometryBounds;
            this.renderelements = [];
        }
        get renderNodeType() {
            return this._nativeObj.renderNodeType;
        }
        set renderNodeType(value) {
            this._nativeObj.renderNodeType = value;
        }
        get receiveShadow() {
            return this._nativeObj.receiveShadow;
        }
        set receiveShadow(value) {
            this._nativeObj.receiveShadow = value;
        }
        _applyLightProb() {
            this._nativeObj._applyLightProb();
        }
        _applyReflection() {
            this._nativeObj._applyReflection();
        }
        setRenderelements(value) {
            var tempArray = [];
            this.renderelements.length = 0;
            for (var i = 0; i < value.length; i++) {
                this.renderelements.push(value[i]);
                value[i].owner = this;
                tempArray.push(value[i]._nativeObj);
            }
            this._nativeObj.setRenderElements(tempArray);
        }
        setLightmapScaleOffset(value) {
            this._nativeObj.setLightmapScaleOffset(value);
        }
        setCommonUniformMap(value) {
            this._nativeObj.setCommonUniformMap(value);
        }
        setOneMaterial(index, mat) {
            if (!this.renderelements[index])
                return;
            this.renderelements[index].materialShaderData = mat.shaderData;
            this.renderelements[index].materialRenderQueue = mat.renderQueue;
            this.renderelements[index].subShader = mat.shader.getSubShaderAt(0);
        }
        destroy() {
            var _a;
            (_a = this._shaderData) === null || _a === void 0 ? void 0 : _a.destroy();
            this._nativeObj.destroy();
        }
    }

    class RTDirectLight {
        get shadowNearPlane() {
            return this._nativeObj._shadowNearPlane;
        }
        set shadowNearPlane(value) {
            this._nativeObj._shadowNearPlane = value;
        }
        get shadowCascadesMode() {
            return this._nativeObj._shadowCascadesMode;
        }
        set shadowCascadesMode(value) {
            this._nativeObj._shadowCascadesMode = value;
        }
        get transform() {
            return this._transform;
        }
        set transform(value) {
            this._transform = value;
            this._nativeObj.setTransform(value._nativeObj);
        }
        get shadowResolution() {
            return this._nativeObj._shadowResolution;
        }
        set shadowResolution(value) {
            this._nativeObj._shadowResolution = value;
        }
        get shadowDistance() {
            return this._nativeObj._shadowDistance;
        }
        set shadowDistance(value) {
            this._nativeObj._shadowDistance = value;
        }
        get shadowMode() {
            return this._nativeObj._shadowMode;
        }
        set shadowMode(value) {
            this._nativeObj._shadowMode = value;
        }
        get shadowStrength() {
            return this._nativeObj._shadowStrength;
        }
        set shadowStrength(value) {
            this._nativeObj._shadowStrength = value;
        }
        get shadowDepthBias() {
            return this._nativeObj._shadowDepthBias;
        }
        set shadowDepthBias(value) {
            this._nativeObj._shadowDepthBias = value;
        }
        get shadowNormalBias() {
            return this._nativeObj._shadowNormalBias;
        }
        set shadowNormalBias(value) {
            this._nativeObj._shadowNormalBias = value;
        }
        get shadowTwoCascadeSplits() {
            return this._nativeObj._shadowTwoCascadeSplits;
        }
        set shadowTwoCascadeSplits(value) {
            this._nativeObj._shadowTwoCascadeSplits = value;
        }
        setShadowFourCascadeSplits(value) {
            value && this._nativeObj.setShadowFourCascadeSplits(value);
        }
        setDirection(value) {
            value && this._nativeObj.setDirection(value);
        }
        constructor() {
            this._nativeObj = new window.conchRTDirectLight();
        }
    }

    class RTLightmapData {
        constructor() {
            this._nativeObj = new window.conchRTLightmapData();
        }
        get lightmapColor() {
            return this._lightmapColor;
        }
        set lightmapColor(value) {
            this._lightmapColor = value;
            this._nativeObj.setLightmapColor(value._nativeObj);
        }
        get lightmapDirection() {
            return this._lightmapDirection;
        }
        set lightmapDirection(value) {
            this._lightmapDirection = value;
            this._nativeObj.setLightmapDirection(value._nativeObj);
        }
        destroy() {
            this._nativeObj.destroy();
        }
    }

    class RTMeshRenderNode extends RTBaseRenderNode {
    }

    class RTPointLight {
        get transform() {
            return this._transform;
        }
        set transform(value) {
            this._transform = value;
            this._nativeObj.setTransform(value._nativeObj);
        }
        get range() {
            return this._nativeObj.range;
        }
        set range(value) {
            this._nativeObj.range = value;
        }
        get shadowResolution() {
            return this._nativeObj.shadowResolution;
        }
        set shadowResolution(value) {
            this._nativeObj.shadowResolution = value;
        }
        get shadowDistance() {
            return this._nativeObj.shadowDistance;
        }
        set shadowDistance(value) {
            this._nativeObj.shadowDistance = value;
        }
        ;
        get shadowMode() {
            return this._nativeObj.shadowMode;
        }
        set shadowMode(value) {
            this._nativeObj.shadowMode = value;
        }
        ;
        get shadowStrength() {
            return this._nativeObj.shadowStrength;
        }
        set shadowStrength(value) {
            this._nativeObj.shadowStrength = value;
        }
        get shadowDepthBias() {
            return this._nativeObj.shadowDepthBias;
        }
        set shadowDepthBias(value) {
            this._nativeObj.shadowDepthBias = value;
        }
        get shadowNormalBias() {
            return this._nativeObj.shadowNormalBias;
        }
        set shadowNormalBias(value) {
            this._nativeObj.shadowNormalBias = value;
        }
        get shadowNearPlane() {
            return this._nativeObj.shadowNearPlane;
        }
        set shadowNearPlane(value) {
            this._nativeObj.shadowNearPlane = value;
        }
        constructor() {
            this._nativeObj = new window.conchRTPointLight();
        }
    }

    class RTReflectionProb {
        get boxProjection() {
            return this._nativeObj._boxProjection;
        }
        set boxProjection(value) {
            this._nativeObj._boxProjection = value;
        }
        get bound() {
            return this._bound;
        }
        set bound(value) {
            this._bound = value;
            this._nativeObj.setBounds(value._imp._nativeObj);
        }
        get ambientMode() {
            return this._nativeObj._ambientMode;
        }
        set ambientMode(value) {
            this._nativeObj._ambientMode = value;
        }
        get ambientIntensity() {
            return this._nativeObj._ambientIntensity;
        }
        set ambientIntensity(value) {
            this._nativeObj._ambientIntensity = value;
        }
        get reflectionIntensity() {
            return this._nativeObj._reflectionIntensity;
        }
        set reflectionIntensity(value) {
            this._nativeObj._reflectionIntensity = value;
        }
        get reflectionTexture() {
            return this._reflectionTexture;
        }
        set reflectionTexture(value) {
            this._reflectionTexture = value;
            if (!value) {
                this._nativeObj.setReflectionTexture(null);
                return;
            }
            this._nativeObj.setReflectionTexture(value._nativeObj);
        }
        get iblTex() {
            return this._iblTex;
        }
        set iblTex(value) {
            this._iblTex = value;
            if (!value) {
                this._nativeObj.setIblTex(null);
                return;
            }
            this._nativeObj.setIblTex(value._nativeObj);
        }
        get updateMark() {
            return this._nativeObj._updateMark;
        }
        set updateMark(value) {
            this._nativeObj._updateMark = value;
        }
        get iblTexRGBD() {
            return this._nativeObj._iblTexRGBD;
        }
        set iblTexRGBD(value) {
            this._nativeObj._iblTexRGBD = value;
        }
        setProbePosition(value) {
            value && this._nativeObj.setProbePosition(value);
        }
        setAmbientColor(value) {
            value && this._nativeObj.setAmbientColor(value);
        }
        setAmbientSH(value) {
            this._ambientSH = value;
            this._nativeObj.setAmbientSH(value);
        }
        constructor() {
            this._id = ++RTReflectionProb._idCounter;
            this._nativeObj = new window.conchRTReflectionProb();
        }
        destroy() {
            this._nativeObj.destroy();
        }
    }
    RTReflectionProb._idCounter = 0;

    class RTSimpleSkinRenderNode extends RTBaseRenderNode {
        setSimpleAnimatorParams(value) {
            this._float32Array[0] = value.x;
            this._float32Array[1] = value.y;
            this._float32Array[2] = value.z;
            this._float32Array[3] = value.w;
            this._nativeObj.setSimpleAnimatorParamsByBuffer();
        }
        _getNativeObj() {
            this._nativeObj = new window.conchRTSimpleSkinRenderNode();
            this._nativeMemory = new Laya.NativeMemory(4 * 4, true);
            this._nativeObj.setShareBuffer(this._nativeMemory._buffer);
            this._float32Array = this._nativeMemory.float32Array;
        }
        constructor() {
            super();
        }
    }

    class RTSkinRenderNode extends RTBaseRenderNode {
        _getNativeObj() {
            this._nativeObj = new window.conchRTSkinRenderNode();
        }
        constructor() {
            super();
            this.boneNums = 0;
        }
        computeSkinnedData() {
            (this.boneNums != 0) && this._nativeObj.computeSkinnedData(Laya.Stat.loopCount);
        }
        setRootBoneTransfom(value) {
            this._nativeObj.setRootBoneTransfom(value.transform._nativeObj);
        }
        setOwnerTransform(value) {
            this._nativeObj.setOwnerTransform(value.transform._nativeObj);
        }
        setCacheMesh(cacheMesh) {
            this._nativeObj.resizeCacheMeshInverseBindPoes(cacheMesh._inverseBindPoses.length);
            for (var i = 0, n = cacheMesh._inverseBindPoses.length; i < n; i++) {
                this._nativeObj.setinverseBindPoseDataByIndex(i, cacheMesh._inverseBindPoses[i]);
            }
            this._nativeObj.resizeMatrixCache(cacheMesh._skinnedMatrixCaches.length);
            for (var i = 0, n = cacheMesh._skinnedMatrixCaches.length; i < n; i++) {
                let cache = cacheMesh._skinnedMatrixCaches[i];
                if (!cache)
                    continue;
                this._nativeObj.setMatrixCacheByIndex(i, cache.batchBoneIndex, cache.batchIndex, cache.subMeshIndex);
            }
            this._nativeObj.setSubMeshCount(cacheMesh.subMeshCount);
            this._nativeObj.resizeBoneIndicesList(cacheMesh.subMeshCount);
            for (var i = 0, n = cacheMesh.subMeshCount; i < n; i++) {
                this._nativeObj.setBoneIndicesList(i, cacheMesh.getSubMesh(i)._boneIndicesList);
            }
        }
        setBones(value) {
            this._nativeObj.clearBoneTransform();
            for (var i = 0, n = value.length; i < n; i++) {
                if (value[i]) {
                    this._nativeObj.addBoneTransform(value[i].transform._nativeObj);
                    this.boneNums++;
                }
            }
        }
        setSkinnedData(value) {
            this._nativeObj.resizeSkinnedData(value.length);
            for (var i = 0, n = value.length; i < n; i++) {
                this._nativeObj.setSkinnedDataByIndex(i, value[i]);
            }
        }
    }

    class RTSpotLight {
        get transform() {
            return this._transform;
        }
        set transform(value) {
            this._nativeObj.setTransform(value._nativeObj);
            this._transform = value;
        }
        get shadowResolution() {
            return this._nativeObj._shadowResolution;
        }
        set shadowResolution(value) {
            this._nativeObj._shadowResolution = value;
        }
        get shadowDistance() {
            return this._nativeObj._shadowDistance;
        }
        set shadowDistance(value) {
            this._nativeObj._shadowDistance = value;
        }
        get shadowMode() {
            return this._nativeObj._shadowMode;
        }
        set shadowMode(value) {
            this._nativeObj._shadowMode = value;
        }
        get shadowStrength() {
            return this._nativeObj._shadowStrength;
        }
        set shadowStrength(value) {
            this._nativeObj._shadowStrength = value;
        }
        get shadowDepthBias() {
            return this._nativeObj._shadowDepthBias;
        }
        set shadowDepthBias(value) {
            this._nativeObj._shadowDepthBias = value;
        }
        get shadowNormalBias() {
            return this._nativeObj._shadowNormalBias;
        }
        set shadowNormalBias(value) {
            this._nativeObj._shadowNormalBias = value;
        }
        get shadowNearPlane() {
            return this._nativeObj._shadowNearPlane;
        }
        set shadowNearPlane(value) {
            this._nativeObj._shadowNearPlane = value;
        }
        get spotRange() {
            return this._nativeObj._spotRange;
        }
        set spotRange(value) {
            this._nativeObj._spotRange = value;
        }
        get spotAngle() {
            return this._nativeObj._spotAngle;
        }
        set spotAngle(value) {
            this._nativeObj._spotAngle = value;
        }
        constructor() {
            this._nativeObj = new window.conchRTSpotLight();
        }
        setDirection(value) {
            this._nativeObj.setDirection(value);
        }
    }

    class RTVolumetricGI {
        get irradiance() {
            return this._irradiance;
        }
        set irradiance(value) {
            this._irradiance = value;
            this._nativeObj.setIrradiance(value ? value._nativeObj : null);
        }
        get distance() {
            return this._distance;
        }
        set distance(value) {
            this._distance = value;
            this._nativeObj.setDistance(value ? value._nativeObj : null);
        }
        get bound() {
            return this._bound;
        }
        set bound(value) {
            this._bound = value;
            this._nativeObj.setBounds(value ? value._imp._nativeObj : null);
        }
        get intensity() {
            return this._nativeObj._intensity;
        }
        set intensity(value) {
            this._nativeObj._intensity = value;
        }
        get updateMark() {
            return this._nativeObj._updateMark;
        }
        set updateMark(value) {
            this._nativeObj._updateMark = value;
        }
        constructor() {
            this._id = ++RTVolumetricGI._idCounter;
            this._nativeObj = new window.conchRTVolumetricGI();
            this._defaultBounds = new Laya.Bounds();
            this.bound = this._defaultBounds;
        }
        setParams(value) {
            this._nativeObj.setParams(value);
        }
        setProbeCounts(value) {
            this._nativeObj.setProbeCounts(value);
        }
        setProbeStep(value) {
            this._nativeObj.setProbeStep(value);
        }
    }
    RTVolumetricGI._idCounter = 0;

    class RT3DRenderModuleFactory {
        createTransform(owner) {
            return new RTTransform3D(owner);
        }
        createBounds(min, max) {
            return new NativeBounds(min, max);
        }
        createVolumetricGI() {
            return new RTVolumetricGI();
        }
        createReflectionProbe() {
            return new RTReflectionProb();
        }
        createLightmapData() {
            return new RTLightmapData();
        }
        createDirectLight() {
            return new RTDirectLight();
        }
        createSpotLight() {
            return new RTSpotLight();
        }
        createPointLight() {
            return new RTPointLight();
        }
        createCameraModuleData() {
            return new RTCameraNodeData();
        }
        createSceneModuleData() {
            return new RTSceneNodeData();
        }
        createBaseRenderNode() {
            return new RTBaseRenderNode();
        }
        createMeshRenderNode() {
            return new RTMeshRenderNode();
        }
        createSkinRenderNode() {
            return new RTSkinRenderNode();
        }
        createSimpleSkinRenderNode() {
            return new RTSimpleSkinRenderNode();
        }
    }
    Laya.Laya.addBeforeInitCallback(() => {
        if (!Laya.Laya3DRender.Render3DModuleDataFactory)
            Laya.Laya3DRender.Render3DModuleDataFactory = new RT3DRenderModuleFactory();
    });

    class RTScene3DRenderManager {
        get list() {
            return this._list;
        }
        set list(value) {
            this._list = value;
            let elemnt = this._list.elements;
            for (let i = 0; i < this._list.length; i++) {
                this._addBaseRenderNode(elemnt[i]._baseRenderNode);
            }
        }
        _addBaseRenderNode(object) {
            this._nativeObj.addBaseRenderNode(object._nativeObj);
        }
        _removeBaseRenderNode(object) {
            this._nativeObj.removeBaseRenderNode(object._nativeObj);
        }
        _clearBaseRenderNode() {
            this._nativeObj.clearBaseRenderNode();
        }
        addRenderObject(object) {
            this._list.add(object);
            this._addBaseRenderNode(object._baseRenderNode);
        }
        removeRenderObject(object) {
            this._list.remove(object);
            this._removeBaseRenderNode(object._baseRenderNode);
        }
        removeMotionObject(object) {
        }
        addMotionObject(object) {
        }
        updateMotionObjects() {
        }
        destroy() {
            this._list.destroy();
            this._clearBaseRenderNode();
            this._list = null;
            this._nativeObj = null;
        }
        constructor() {
            this._list = new Laya.SingletonList();
            this._nativeObj = new window.conchRTScene3DRenderManager();
        }
    }

    class GLESDirectLightShadowRP {
        get light() {
            return this._light;
        }
        set light(value) {
            this._light = value;
            this._nativeObj.setLight(value._nativeObj);
        }
        get camera() {
            return this._camera;
        }
        set camera(value) {
            this._camera = value;
            this._nativeObj.setCameraNodeData(value._nativeObj);
        }
        get destTarget() {
            return this._destTarget;
        }
        set destTarget(value) {
            this._destTarget = value;
            this._nativeObj.setRenderTarget(value._nativeObj, Laya.RenderClearFlag.Nothing);
        }
        constructor() {
            this._nativeObj = new window.conchGLESDirectLightShadowCastRP();
        }
        destroy() {
            this._nativeObj = null;
        }
        get shadowCasterCommanBuffer() {
            return this._shadowCasterCommanBuffer;
        }
        set shadowCasterCommanBuffer(value) {
            this._shadowCasterCommanBuffer = value;
            this._nativeObj.clearShadowCasterCommandBuffer();
            value.forEach(element => {
                this._setCmd(element);
            });
        }
        _setCmd(cmd) {
            cmd._apply(false);
            let cmds = cmd._renderCMDs;
            let nativeobCMDs = [];
            cmds.forEach(element => {
                nativeobCMDs.push(element._nativeObj);
            });
            this._nativeObj.addShadowCasterCommandBuffers(nativeobCMDs);
        }
    }

    class GLESForwardAddClusterRP {
        get enableOpaque() {
            return this._nativeObj._enableOpaque;
        }
        set enableOpaque(value) {
            this._nativeObj._enableOpaque = value;
        }
        get enableCMD() {
            return this._nativeObj._enableCMD;
        }
        set enableCMD(value) {
            this._nativeObj._enableCMD = value;
        }
        get enableTransparent() {
            return this._nativeObj._enableTransparent;
        }
        set enableTransparent(value) {
            this._nativeObj._enableTransparent = value;
        }
        get enableOpaqueTexture() {
            return this._nativeObj._enableOpaqueTexture;
        }
        set enableOpaqueTexture(value) {
            this._nativeObj._enableOpaqueTexture = value;
        }
        get destTarget() {
            return this._destTarget;
        }
        set destTarget(value) {
            this._destTarget = value;
            this._nativeObj.setDestTarget(value._nativeObj);
        }
        get pipelineMode() {
            return this._nativeObj._pipelineMode;
        }
        set pipelineMode(value) {
            this._nativeObj._pipelineMode = value;
        }
        get depthTarget() {
            return this._depthTarget;
        }
        set depthTarget(value) {
            this._depthTarget = value;
            this._nativeObj.setDepthTarget(value._nativeObj);
        }
        get depthPipelineMode() {
            return this._nativeObj._depthPipelineMode;
        }
        set depthPipelineMode(value) {
            this._nativeObj._depthPipelineMode = value;
        }
        get depthNormalTarget() {
            return this._depthNormalTarget;
        }
        set depthNormalTarget(value) {
            this._depthNormalTarget = value;
            this._nativeObj.setDepthNormalTarget(value._nativeObj);
        }
        get depthNormalPipelineMode() {
            return this._nativeObj._depthNormalPipelineMode;
        }
        set depthNormalPipelineMode(value) {
            this._nativeObj._depthNormalPipelineMode = value;
        }
        get skyRenderNode() {
            return this._skyRenderNode;
        }
        set skyRenderNode(value) {
            this._skyRenderNode = value;
            this._nativeObj.setSkyRenderNode(value ? value._nativeObj : null);
        }
        get depthTextureMode() {
            return this._nativeObj._depthTextureMode;
        }
        set depthTextureMode(value) {
            this._nativeObj._depthTextureMode = value;
        }
        get opaqueTexture() {
            return this._opaqueTexture;
        }
        set opaqueTexture(value) {
            this._opaqueTexture = value;
            this._nativeObj.setOpaqueTexture(value._nativeObj);
        }
        get camera() {
            return this._camera;
        }
        set camera(value) {
            this._camera = value;
            this._nativeObj.setCameraNodeData(value._nativeObj);
        }
        get clearColor() {
            return this._clearColor;
        }
        set clearColor(value) {
            this._clearColor = value;
            this._nativeObj.setClearColor(value);
        }
        get clearFlag() {
            return this._nativeObj._clearFlag;
        }
        set clearFlag(value) {
            this._nativeObj._clearFlag = value;
        }
        setCameraCullInfo(value) {
            this._cameraCullInfo.position = value._transform.position;
            this._cameraCullInfo.cullingMask = value.cullingMask;
            this._cameraCullInfo.staticMask = value.staticMask;
            this._cameraCullInfo.boundFrustum = value.boundFrustum;
            this._cameraCullInfo.useOcclusionCulling = value.useOcclusionCulling;
            this._nativeObj.setCameraCullInfo(this._cameraCullInfo);
        }
        setViewPort(value) {
            this._nativeObj.setViewport(value);
        }
        setScissor(value) {
            this._nativeObj.setScissor(value);
        }
        _getRenderCMDArray(cmds) {
            let nativeobCMDs = [];
            cmds.forEach(element => {
                nativeobCMDs.push(element._nativeObj);
            });
            return nativeobCMDs;
        }
        get opaquePassCommandBuffer() {
            return this._opaquePassCommandBuffer;
        }
        set opaquePassCommandBuffer(value) {
            this._opaquePassCommandBuffer = value;
            value._apply(false);
            this._nativeObj.setOpaqueCMD(this._getRenderCMDArray(value._renderCMDs));
        }
        setBeforeForwardCmds(value) {
            if (value && value.length > 0) {
                this._nativeObj.clearBeforeForwardCmds();
                value.forEach(element => {
                    element._apply(false);
                    this._nativeObj.addBeforeForwardCmds(this._getRenderCMDArray(element._renderCMDs));
                });
            }
            else {
                this._nativeObj.clearBeforeForwardCmds();
            }
        }
        setBeforeSkyboxCmds(value) {
            if (value && value.length > 0) {
                this._nativeObj.clearBeforeSkyboxCmds();
                value.forEach(element => {
                    element._apply(false);
                    this._nativeObj.addBeforeSkyboxCmds(this._getRenderCMDArray(element._renderCMDs));
                });
            }
            else {
                this._nativeObj.clearBeforeSkyboxCmds();
            }
        }
        setBeforeTransparentCmds(value) {
            if (value && value.length > 0) {
                this._nativeObj.clearBeforeTransparentCmds();
                value.forEach(element => {
                    element._apply(false);
                    this._nativeObj.addBeforeTransparentCmds(this._getRenderCMDArray(element._renderCMDs));
                });
            }
            else {
                this._nativeObj.clearBeforeTransparentCmds();
            }
        }
        constructor() {
            this._opaquePassCommandBuffer = new Laya.CommandBuffer();
            this._cameraCullInfo = new Laya.CameraCullInfo();
            this._nativeObj = new window.conchGLESForwardAddClusterRP();
        }
        destroy() {
            this._nativeObj = null;
        }
    }

    class GLESSpotLightShadowRP {
        get light() {
            return this._light;
        }
        set light(value) {
            this._light = value;
            this._nativeObj.setLight(value._dataModule._nativeObj);
        }
        get destTarget() {
            return this._destTarget;
        }
        set destTarget(value) {
            this._destTarget = value;
            this._nativeObj.setRenderTarget(value._nativeObj, Laya.RenderClearFlag.Nothing);
        }
        constructor() {
            this._nativeObj = new window.conchGLESSpotLightShadowRP();
        }
        destroy() {
            this._nativeObj = null;
        }
    }

    class GLESForwardAddRP {
        get shadowCastPass() {
            return this._nativeObj.shadowCastPass;
        }
        set shadowCastPass(value) {
            this._nativeObj.shadowCastPass = value;
        }
        get directLightShadowPass() {
            return this._directLightShadowPass;
        }
        set directLightShadowPass(value) {
            this._directLightShadowPass = value;
            this._nativeObj.setDirectLightShadowPass(value._nativeObj);
        }
        get enableDirectLightShadow() {
            return this._nativeObj.enableDirectLightShadow;
        }
        set enableDirectLightShadow(value) {
            this._nativeObj.enableDirectLightShadow = value;
        }
        get spotLightShadowPass() {
            return this._spotLightShadowPass;
        }
        set spotLightShadowPass(value) {
            this._spotLightShadowPass = value;
            this._nativeObj.setSpotLightShadowPass(value._nativeObj);
        }
        get enableSpotLightShadowPass() {
            return this._nativeObj.enableSpotLightShadowPass;
        }
        set enableSpotLightShadowPass(value) {
            this._nativeObj.enableSpotLightShadowPass = value;
        }
        get renderpass() {
            return this._renderpass;
        }
        set renderpass(value) {
            this._renderpass = value;
            this._nativeObj.setForwardAddClusterRP(value._nativeObj);
        }
        get enablePostProcess() {
            return this._nativeObj.enablePostProcess;
        }
        set enablePostProcess(value) {
            this._enablePostProcess = value;
            this._nativeObj.enablePostProcess = value;
        }
        get postProcess() {
            return this._postProcess;
        }
        set postProcess(value) {
            this._postProcess = value;
            value._apply(false);
            this._nativeObj.setPostProcess(this._getRenderCMDArray(value._renderCMDs));
        }
        get finalize() {
            return this._finalize;
        }
        set finalize(value) {
            this._finalize = value;
            value._apply(false);
            this._nativeObj.setfinalize(this._getRenderCMDArray(value._renderCMDs));
        }
        constructor() {
            this._finalize = new Laya.CommandBuffer();
            this._nativeObj = new window.conchGLESForwardAddRP();
            this.shadowCastPass = false;
            this.enableDirectLightShadow = false;
            this.enableSpotLightShadowPass = false;
            this.directLightShadowPass = new GLESDirectLightShadowRP();
            this.spotLightShadowPass = new GLESSpotLightShadowRP();
            this.renderpass = new GLESForwardAddClusterRP();
        }
        _getRenderCMDArray(cmds) {
            let nativeobCMDs = [];
            cmds.forEach(element => {
                nativeobCMDs.push(element._nativeObj);
            });
            return nativeobCMDs;
        }
        setAfterEventCmd(value) {
            if (value && value.length > 0) {
                this._nativeObj.clearAfterAllRenderCmds();
                value.forEach(element => {
                    element._apply(false);
                    this._nativeObj.addAfterAllRenderCmds(this._getRenderCMDArray(element._renderCMDs));
                });
            }
            else {
                this._nativeObj.clearAfterAllRenderCmds();
            }
        }
        setBeforeImageEffect(value) {
            if (value && value.length > 0) {
                this._nativeObj.clearBeforeImageEffectCmds();
                value.forEach(element => {
                    element._apply(false);
                    this._nativeObj.addBeforeImageEffectCmds(this._getRenderCMDArray(element._renderCMDs));
                });
            }
            else {
                this._nativeObj.clearBeforeImageEffectCmds();
            }
        }
        destroy() {
            this._nativeObj = null;
            this.directLightShadowPass.destroy();
            this._directLightShadowPass = null;
            this.spotLightShadowPass.destroy();
            this._spotLightShadowPass = null;
            this.renderpass.destroy();
            this._renderpass = null;
        }
    }

    const viewport = new Laya.Viewport(0, 0, 0, 0);
    const offsetScale = new Laya.Vector4();
    const shadowParams = new Laya.Vector4();
    class GLESRender3DProcess {
        constructor() {
            this._tempList = [];
            this.renderpass = new GLESForwardAddRP();
            this._nativeObj = new window.conchGLESRender3DProcess();
        }
        get render3DManager() {
            return this._render3DManager;
        }
        set render3DManager(value) {
            this._render3DManager = value;
            this._nativeObj.renderManager = value._nativeObj;
        }
        destroy() {
            this._nativeObj = null;
            this.renderpass.destroy();
        }
        initRenderpass(camera, context) {
            let renderpass = this.renderpass.renderpass;
            let renderRT = camera._getRenderTexture();
            let clearConst = 0;
            let clearFlag = camera.clearFlag;
            if (clearFlag == Laya.CameraClearFlags.Sky && !camera.scene.skyRenderer._isAvailable()) {
                clearFlag = Laya.CameraClearFlags.SolidColor;
            }
            let hasStencil = renderRT.depthStencilFormat == Laya.RenderTargetFormat.DEPTHSTENCIL_24_8;
            let stencilFlag = hasStencil ? Laya.RenderClearFlag.Stencil : 0;
            switch (clearFlag) {
                case Laya.CameraClearFlags.DepthOnly:
                case Laya.CameraClearFlags.Sky:
                    clearConst = Laya.RenderClearFlag.Depth | stencilFlag;
                    break;
                case Laya.CameraClearFlags.Nothing:
                    clearConst = 0;
                    break;
                case Laya.CameraClearFlags.ColorOnly:
                    clearConst = Laya.RenderClearFlag.Color;
                    break;
                case Laya.CameraClearFlags.SolidColor:
                default:
                    clearConst = Laya.RenderClearFlag.Color | Laya.RenderClearFlag.Depth | stencilFlag;
                    break;
            }
            let clearValue = camera._linearClearColor;
            clearValue = renderRT.gammaCorrection != 1 ? camera.clearColor : camera._linearClearColor;
            renderpass.camera = camera._renderDataModule;
            renderpass.destTarget = renderRT._renderTarget;
            renderpass.clearFlag = clearConst;
            renderpass.clearColor = clearValue;
            let needInternalRT = camera._needInternalRenderTexture();
            if (needInternalRT) {
                viewport.set(0, 0, renderRT.width, renderRT.height);
            }
            else {
                camera.viewport.cloneTo(viewport);
            }
            renderpass.setViewPort(viewport);
            let scissor = Laya.Vector4.tempVec4;
            scissor.setValue(viewport.x, viewport.y, viewport.width, viewport.height);
            renderpass.setScissor(scissor);
            renderpass.enableOpaque = Laya.Stat.enableOpaque;
            renderpass.enableTransparent = Laya.Stat.enableTransparent;
            renderpass.enableCMD = Laya.Stat.enableCameraCMD;
            renderpass.setBeforeSkyboxCmds(camera._cameraEventCommandBuffer[Laya.CameraEventFlags.BeforeSkyBox]);
            renderpass.setBeforeForwardCmds(camera._cameraEventCommandBuffer[Laya.CameraEventFlags.BeforeForwardOpaque]);
            renderpass.setBeforeTransparentCmds(camera._cameraEventCommandBuffer[Laya.CameraEventFlags.BeforeTransparent]);
            this.renderpass.setBeforeImageEffect(camera._cameraEventCommandBuffer[Laya.CameraEventFlags.BeforeImageEffect]);
            this.renderpass.setAfterEventCmd(camera._cameraEventCommandBuffer[Laya.CameraEventFlags.AfterEveryThing]);
            renderpass.setCameraCullInfo(camera);
            if (clearFlag == Laya.CameraClearFlags.Sky) {
                renderpass.skyRenderNode = camera.scene.skyRenderer._baseRenderNode;
            }
            else {
                renderpass.skyRenderNode = null;
            }
            renderpass.pipelineMode = Laya.RenderContext3D._instance.configPipeLineMode;
            let enableShadow = Laya.Scene3D._updateMark % camera.scene._ShadowMapupdateFrequency == 0 && Laya.Stat.enableShadow;
            this.renderpass.shadowCastPass = enableShadow;
            shadowParams.setValue(0, 0, 0, 0);
            if (enableShadow) {
                let mainDirectionLight = camera.scene._mainDirectionLight;
                let needDirectionShadow = mainDirectionLight && mainDirectionLight.shadowMode != Laya.ShadowMode.None;
                this.renderpass.enableDirectLightShadow = needDirectionShadow;
                if (needDirectionShadow) {
                    this.renderpass.directLightShadowPass.camera = camera._renderDataModule;
                    this.renderpass.directLightShadowPass.light = mainDirectionLight._dataModule;
                    let directionShadowMap = Laya.Scene3D._shadowCasterPass.getDirectLightShadowMap(mainDirectionLight);
                    this.renderpass.directLightShadowPass.destTarget = directionShadowMap._renderTarget;
                    shadowParams.x = this.renderpass.directLightShadowPass.light.shadowStrength;
                    camera.scene._shaderValues.setTexture(Laya.ShadowCasterPass.SHADOW_MAP, directionShadowMap);
                }
                let mainSpotLight = camera.scene._mainSpotLight;
                let needSpotShadow = mainSpotLight && mainSpotLight.shadowMode != Laya.ShadowMode.None;
                this.renderpass.enableSpotLightShadowPass = needSpotShadow;
                if (needSpotShadow) {
                    this.renderpass.spotLightShadowPass.light = mainSpotLight;
                    let spotShadowMap = Laya.Scene3D._shadowCasterPass.getSpotLightShadowPassData(mainSpotLight);
                    this.renderpass.spotLightShadowPass.destTarget = spotShadowMap._renderTarget;
                    shadowParams.y = this.renderpass.spotLightShadowPass.light.shadowStrength;
                    camera.scene._shaderValues.setTexture(Laya.ShadowCasterPass.SHADOW_SPOTMAP, spotShadowMap);
                }
                camera.scene._shaderValues.setVector(Laya.ShadowCasterPass.SHADOW_PARAMS, shadowParams);
                let needBlitOpaque = camera.opaquePass;
                renderpass.enableOpaqueTexture = needBlitOpaque;
                if (needBlitOpaque) {
                    let rt = camera._opaqueTexture;
                    renderpass.opaquePassCommandBuffer.clear();
                    renderpass.opaquePassCommandBuffer.blitScreenQuad(renderRT, rt);
                    renderpass.opaquePassCommandBuffer = renderpass.opaquePassCommandBuffer;
                }
                if (Laya.Stat.enablePostprocess && camera.postProcess && camera.postProcess.enable && camera.postProcess.effects.length > 0) {
                    this.renderpass.enablePostProcess = camera.postProcess.enable;
                    camera.postProcess._render(camera);
                    this.renderpass.postProcess = camera.postProcess._context.command;
                }
                else {
                    this.renderpass.enablePostProcess = false;
                }
                this.renderpass.finalize.clear();
                if (!this.renderpass.enablePostProcess && needInternalRT && camera._offScreenRenderTexture) {
                    let dst = camera._offScreenRenderTexture;
                    offsetScale.setValue(camera.normalizedViewport.x, 1.0 - camera.normalizedViewport.y, renderRT.width / dst.width, -renderRT.height / dst.height);
                    this.renderpass.finalize.blitScreenQuad(renderRT, camera._offScreenRenderTexture, offsetScale);
                }
                this.renderpass.finalize = this.renderpass.finalize;
            }
        }
        renderDepth(camera) {
            let depthMode = camera.depthTextureMode;
            if (camera.postProcess && camera.postProcess.enable) {
                depthMode |= camera.postProcess.cameraDepthTextureMode;
            }
            if ((depthMode & Laya.DepthTextureMode.Depth) != 0) {
                let needDepthTex = camera.canblitDepth && camera._internalRenderTexture.depthStencilTexture;
                if (needDepthTex) {
                    camera.depthTexture = camera._cacheDepthTexture.depthStencilTexture;
                    Laya.Camera.depthPass._depthTexture = camera.depthTexture;
                    camera._shaderValues.setTexture(Laya.DepthPass.DEPTHTEXTURE, camera.depthTexture);
                    Laya.Camera.depthPass._setupDepthModeShaderValue(Laya.DepthTextureMode.Depth, camera);
                    depthMode &= ~Laya.DepthTextureMode.Depth;
                }
                else {
                    Laya.Camera.depthPass.getTarget(camera, Laya.DepthTextureMode.Depth, camera.depthTextureFormat);
                    this.renderpass.renderpass.depthTarget = camera.depthTexture._renderTarget;
                    camera._shaderValues.setTexture(Laya.DepthPass.DEPTHTEXTURE, camera.depthTexture);
                }
            }
            if ((depthMode & Laya.DepthTextureMode.DepthNormals) != 0) {
                Laya.Camera.depthPass.getTarget(camera, Laya.DepthTextureMode.DepthNormals, camera.depthTextureFormat);
                this.renderpass.renderpass.depthNormalTarget = camera.depthNormalTexture._renderTarget;
                camera._shaderValues.setTexture(Laya.DepthPass.DEPTHNORMALSTEXTURE, camera.depthNormalTexture);
            }
            this.renderpass.renderpass.depthTextureMode = depthMode;
        }
        fowardRender(context, camera) {
            this.initRenderpass(camera, context);
            this.renderDepth(camera);
            this.renderFowarAddCameraPass(context, this.renderpass);
            Laya.Camera.depthPass.cleanUp();
        }
        renderFowarAddCameraPass(context, renderpass) {
            this._tempList.length = 0;
            this._nativeObj.renderFowarAddCameraPass(context._nativeObj, renderpass._nativeObj);
        }
    }

    class GLESDrawNodeCMDData extends Laya.DrawNodeCMDData {
        get node() {
            return this._node;
        }
        set node(value) {
            this._node = value;
            this._nativeObj.setBaseRenderNode(value._nativeObj);
        }
        get destShaderData() {
            return this._destShaderData;
        }
        set destShaderData(value) {
            this._destShaderData = value;
            this._nativeObj.setShaderData(value._nativeObj);
        }
        get destSubShader() {
            return this._destSubShader;
        }
        set destSubShader(value) {
            this._destSubShader = value;
            this._nativeObj.setSubShader(value.moduleData._nativeObj);
        }
        get subMeshIndex() {
            return this._subMeshIndex;
        }
        set subMeshIndex(value) {
            this._subMeshIndex = value;
            this._nativeObj.setSubMeshIndex(value);
        }
        constructor() {
            super();
            this.type = Laya.RenderCMDType.DrawNode;
            this._nativeObj = new window.conchGLESDrawNodeCMDData();
        }
    }
    class GLESBlitQuadCMDData extends Laya.BlitQuadCMDData {
        get dest() {
            return this._dest;
        }
        set dest(value) {
            this._dest = value;
            this._nativeObj.setDest(value ? value._nativeObj : null);
        }
        get viewport() {
            return this._viewport;
        }
        set viewport(value) {
            value.cloneTo(this._viewport);
            this._nativeObj.setViewport(value);
        }
        get scissor() {
            return this._scissor;
        }
        set scissor(value) {
            value.cloneTo(this._scissor);
            this._nativeObj.setScissor(value);
        }
        get source() {
            return this._source;
        }
        set source(value) {
            this._source = value;
            this._nativeObj.setSource(value._nativeObj);
        }
        get offsetScale() {
            return this._offsetScale;
        }
        set offsetScale(value) {
            value.cloneTo(this._offsetScale);
            this._nativeObj.setOffsetScale(this._offsetScale);
        }
        get element() {
            return this._element;
        }
        set element(value) {
            this._element = value;
            this._nativeObj.setRenderElement(value._nativeObj);
        }
        constructor() {
            super();
            this.type = Laya.RenderCMDType.Blit;
            this._viewport = new Laya.Viewport();
            this._scissor = new Laya.Vector4();
            this._offsetScale = new Laya.Vector4();
            this._nativeObj = new window.conchGLESBlitQuadCMDData();
        }
    }
    class GLESDrawElementCMDData extends Laya.DrawElementCMDData {
        constructor() {
            super();
            this.type = Laya.RenderCMDType.DrawElement;
            this._nativeObj = new window.conchGLESDrawElementCMDData();
        }
        setRenderelements(value) {
            this._elemets = value;
            this._nativeObj.clearElement();
            if (value.length == 1) {
                this._nativeObj.addOneElement(value[0]._nativeObj);
            }
            else {
                value.forEach(element => {
                    this._nativeObj.addOneElement(element._nativeObj);
                });
            }
        }
    }
    class GLESSetViewportCMD extends Laya.SetViewportCMD {
        get viewport() {
            return this._viewport;
        }
        set viewport(value) {
            this._viewport = value;
            this._nativeObj.setViewport(value);
        }
        get scissor() {
            return this._scissor;
        }
        set scissor(value) {
            this._scissor = value;
            this._nativeObj.setScissor(value);
        }
        constructor() {
            super();
            this.type = Laya.RenderCMDType.ChangeViewPort;
            this.scissor = new Laya.Vector4();
            this.viewport = new Laya.Viewport();
            this._nativeObj = new window.conchGLESSetViewportCMD();
        }
    }
    class GLESSetRenderTargetCMD extends Laya.SetRenderTargetCMD {
        get rt() {
            return this._rt;
        }
        set rt(value) {
            this._rt = value;
            this._nativeObj.setRT(value._nativeObj);
        }
        get clearFlag() {
            return this._clearFlag;
        }
        set clearFlag(value) {
            this._clearFlag = value;
            this._nativeObj.setClearFlag(value);
        }
        get clearColorValue() {
            return this._clearColorValue;
        }
        set clearColorValue(value) {
            value.cloneTo(this._clearColorValue);
            this._nativeObj.clearColorValue(value);
        }
        get clearDepthValue() {
            return this._clearDepthValue;
        }
        set clearDepthValue(value) {
            this._clearDepthValue = value;
            this._nativeObj.clearDepthValue(value);
        }
        get clearStencilValue() {
            return this._clearStencilValue;
        }
        set clearStencilValue(value) {
            this._clearStencilValue = value;
            this._nativeObj.clearStencilValue(value);
        }
        constructor() {
            super();
            this.type = Laya.RenderCMDType.ChangeRenderTarget;
            this._clearColorValue = new Laya.Color();
            this._nativeObj = new window.conchGLESSetRenderTargetCMD();
        }
    }
    class GLESSetRenderData extends Laya.SetRenderDataCMD {
        get dataType() {
            return this._dataType;
        }
        set dataType(value) {
            this._dataType = value;
            this._nativeObj.setDataType(value);
        }
        get propertyID() {
            return this._propertyID;
        }
        set propertyID(value) {
            this._propertyID = value;
            this._nativeObj.setPropertyID(value);
        }
        get dest() {
            return this._dest;
        }
        set dest(value) {
            this._dest = value;
            this._nativeObj.setDest(value._nativeObj);
        }
        get value() {
            return this._value;
        }
        set value(value) {
            switch (this.dataType) {
                case Laya.ShaderDataType.Int:
                    this.data_number = value;
                    this._value = this.data_number;
                    this._nativeObj.setInt(this.value);
                    break;
                case Laya.ShaderDataType.Float:
                    this.data_number = value;
                    this._value = this.data_number;
                    this._nativeObj.setFloat(this.value);
                    break;
                case Laya.ShaderDataType.Bool:
                    this.data_number = value;
                    this._value = this.data_number;
                    this._nativeObj.setBool(this.value);
                    break;
                case Laya.ShaderDataType.Matrix4x4:
                    !this.data_mat && (this.data_mat = new Laya.Matrix4x4());
                    value.cloneTo(this.data_mat);
                    this._value = this.data_mat;
                    this._nativeObj.setMatrix4x4(this.value);
                    break;
                case Laya.ShaderDataType.Color:
                    !this.data_Color && (this.data_Color = new Laya.Color());
                    value.cloneTo(this.data_Color);
                    this._value = this.data_Color;
                    this._nativeObj.setColor(this.value);
                    break;
                case Laya.ShaderDataType.Texture2D:
                    this._value = this.data_texture = value;
                    this._nativeObj.setTexture2D(this.data_texture._texture._nativeObj);
                    break;
                case Laya.ShaderDataType.Vector4:
                    !this.data_v4 && (this.data_v4 = new Laya.Vector4());
                    value.cloneTo(this.data_v4);
                    this._value = this.data_v4;
                    this._nativeObj.setVector(this.value);
                    break;
                case Laya.ShaderDataType.Vector2:
                    !this.data_v2 && (this.data_v2 = new Laya.Vector2());
                    value.cloneTo(this.data_v2);
                    this._value = this.data_v2;
                    this._nativeObj.setVector2(this.value);
                    break;
                case Laya.ShaderDataType.Vector3:
                    !this.data_v3 && (this.data_v3 = new Laya.Vector3());
                    value.cloneTo(this.data_v3);
                    this._value = this.data_v3;
                    this._nativeObj.setVector3(this.value);
                    break;
                case Laya.ShaderDataType.Buffer:
                    this._value = this.data_Buffer = value;
                    this._nativeObj.setBufferValue(this.data_Buffer.buffer, this.data_Buffer.byteLength);
                    break;
            }
        }
        constructor() {
            super();
            this.type = Laya.RenderCMDType.ChangeData;
            this._nativeObj = new window.conchGLESSetRenderData();
        }
    }
    class GLESSetShaderDefine extends Laya.SetShaderDefineCMD {
        get define() {
            return this._define;
        }
        set define(value) {
            this._define = value;
            this._nativeObj.setDefine(value);
        }
        get dest() {
            return this._dest;
        }
        set dest(value) {
            this._dest = value;
            this._nativeObj.setDest(value._nativeObj);
        }
        get add() {
            return this._add;
        }
        set add(value) {
            this._add = value;
            this._nativeObj.setAdd(value);
        }
        constructor() {
            super();
            this.type = Laya.RenderCMDType.ChangeShaderDefine;
            this._nativeObj = new window.conchGLESSetShaderDefine();
        }
    }

    class GLESRenderContext3D {
        get globalShaderData() {
            return this._globalShaderData;
        }
        set globalShaderData(value) {
            this._globalShaderData = value;
            this._nativeObj.setGlobalShaderData(value ? value._nativeObj : null);
        }
        get sceneData() {
            return this._sceneData;
        }
        set sceneData(value) {
            this._sceneData = value;
            this._nativeObj.setSceneData(value ? value._nativeObj : null);
        }
        get sceneModuleData() {
            return this._sceneModuleData;
        }
        set sceneModuleData(value) {
            this._sceneModuleData = value;
            this._nativeObj.setSceneNodeData(value ? value._nativeObj : null);
        }
        get cameraModuleData() {
            return this._cameraModuleData;
        }
        set cameraModuleData(value) {
            this._cameraModuleData = value;
            this._nativeObj.setCameraNodeData(value ? value._nativeObj : null);
        }
        get cameraData() {
            return this._cameraData;
        }
        set cameraData(value) {
            this._cameraData = value;
            this._nativeObj.setCameraData(value ? value._nativeObj : null);
        }
        get sceneUpdataMask() {
            return this._nativeObj._sceneUpdataMask;
        }
        set sceneUpdataMask(value) {
            this._nativeObj._sceneUpdataMask = value;
        }
        get cameraUpdateMask() {
            return this._nativeObj._cameraUpdateMask;
        }
        set cameraUpdateMask(value) {
            this._nativeObj._cameraUpdateMask = value;
        }
        get pipelineMode() {
            return this._nativeObj._pipelineMode;
        }
        set pipelineMode(value) {
            this._nativeObj._pipelineMode = value;
        }
        get invertY() {
            return this._nativeObj._invertY;
        }
        set invertY(value) {
            this._nativeObj._invertY = value;
        }
        constructor() {
            this._tempList = [];
            this._nativeObj = new window.conchGLESRenderContext3D();
            this._nativeObj.setGlobalConfigShaderData(Laya.Shader3D._configDefineValues._nativeObj);
            this.cameraUpdateMask = 0;
        }
        setRenderTarget(value, clearFlag) {
            this._nativeObj.setRenderTarget(value ? value._nativeObj : null, clearFlag);
        }
        setViewPort(value) {
            this._nativeObj.setViewport(value);
        }
        setScissor(value) {
            this._nativeObj.setScissor(value);
        }
        setClearData(clearFlag, color, depth, stencil) {
            return this._nativeObj.setClearData(clearFlag, color, depth, stencil);
        }
        drawRenderElementList(list) {
            this._tempList.length = 0;
            let listelement = list.elements;
            listelement.forEach((element) => {
                this._tempList.push(element._nativeObj);
            });
            return this._nativeObj.drawRenderElementList(this._tempList, list.length);
        }
        drawRenderElementOne(node) {
            return this._nativeObj.drawRenderElementOne(node._nativeObj);
        }
        runOneCMD(cmd) {
            this._nativeObj.runOneCMD(cmd._nativeObj);
        }
        runCMDList(cmds) {
            let nativeobCMDs = [];
            cmds.forEach(element => {
                nativeobCMDs.push(element._nativeObj);
            });
            this._nativeObj.runCMDList(nativeobCMDs);
        }
    }

    exports.RenderElementType = void 0;
    (function (RenderElementType) {
        RenderElementType[RenderElementType["Base"] = 0] = "Base";
        RenderElementType[RenderElementType["Skin"] = 1] = "Skin";
        RenderElementType[RenderElementType["Instance"] = 2] = "Instance";
    })(exports.RenderElementType || (exports.RenderElementType = {}));
    class GLESRenderElement3D {
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
        set renderShaderData(data) {
            this._renderShaderData = data;
            this._nativeObj.setRenderShaderData(data ? data._nativeObj : null);
        }
        get renderShaderData() {
            return this._renderShaderData;
        }
        set transform(data) {
            this._transform = data;
            if (data && data._nativeObj) {
                this._nativeObj.setTransform(data._nativeObj);
            }
        }
        get transform() {
            return this._transform;
        }
        get isRender() {
            return this._nativeObj.isRender;
        }
        set isRender(data) {
            this._nativeObj.isRender = data;
        }
        get materialRenderQueue() {
            return this._nativeObj.materialRenderQueue;
        }
        set materialRenderQueue(value) {
            this._nativeObj.materialRenderQueue = value;
        }
        get owner() {
            return this._owner;
        }
        set owner(value) {
            this._owner = value;
            this._nativeObj.setOwner(value._nativeObj);
        }
        get subShader() {
            return this._subShader;
        }
        set subShader(value) {
            this._subShader = value;
            if (value)
                this._nativeObj.setSubShader(value.moduleData._nativeObj);
        }
        get canDynamicBatch() {
            return this._nativeObj.canDynamicBatch;
        }
        set canDynamicBatch(value) {
            this._nativeObj.canDynamicBatch = value;
        }
        get materialId() {
            return this._nativeObj.materialId;
        }
        set materialId(value) {
            this._nativeObj.materialId = value;
        }
        constructor() {
            this.init();
            window.conchGLESRenderElement3D.setCompileDefine(Laya.RTShaderPass.getGlobalCompileDefine()._nativeObj);
        }
        destroy() {
            this._nativeObj.destroy();
            this.geometry = null;
            this.materialShaderData = null;
            this.renderShaderData = null;
            this.transform = null;
        }
        init() {
            this._nativeObj = new window.conchGLESRenderElement3D();
        }
    }

    class GLESSkinRenderElement3D extends GLESRenderElement3D {
        constructor() {
            super();
        }
        get skinnedData() {
            return this._skinnedData;
        }
        set skinnedData(data) {
            this._skinnedData = data;
            this._nativeObj.setSkinnedData(data);
        }
        init() {
            this._nativeObj = new window.conchGLESSkinRenderElement3D();
        }
    }

    class GLES3DRenderPassFactory {
        createInstanceBatch() {
            throw new Laya.NotImplementedError();
        }
        createRender3DProcess() {
            return new GLESRender3DProcess();
        }
        createRenderContext3D() {
            return new GLESRenderContext3D();
        }
        createSetRenderDataCMD() {
            return new GLESSetRenderData();
        }
        createSetShaderDefineCMD() {
            return new GLESSetShaderDefine();
        }
        createDrawNodeCMDData() {
            return new GLESDrawNodeCMDData();
        }
        createBlitQuadCMDData() {
            return new GLESBlitQuadCMDData();
        }
        createDrawElementCMDData() {
            return new GLESDrawElementCMDData();
        }
        createSetViewportCMD() {
            return new GLESSetViewportCMD();
        }
        createSetRenderTargetCMD() {
            return new GLESSetRenderTargetCMD();
        }
        createSetRenderData() {
            return new GLESSetRenderData();
        }
        createSceneRenderManager() {
            return new RTScene3DRenderManager();
        }
        createSkinRenderElement() {
            return new GLESSkinRenderElement3D();
        }
        createInstanceRenderElement3D() {
            throw new Laya.NotImplementedError();
        }
        createDirectLightShadowRP() {
            return new GLESDirectLightShadowRP();
        }
        createSpotLightShadowRP() {
            return new GLESSpotLightShadowRP();
        }
        createForwardAddRP() {
            return new GLESForwardAddRP();
        }
        createForwardAddCluster() {
            return new GLESForwardAddClusterRP();
        }
        createRenderElement3D() {
            return new GLESRenderElement3D();
        }
    }
    Laya.Laya.addBeforeInitCallback(() => {
        if (!Laya.Laya3DRender.Render3DPassFactory)
            Laya.Laya3DRender.Render3DPassFactory = new GLES3DRenderPassFactory();
    });

    exports.GLES3DRenderPassFactory = GLES3DRenderPassFactory;
    exports.GLESBlitQuadCMDData = GLESBlitQuadCMDData;
    exports.GLESDirectLightShadowRP = GLESDirectLightShadowRP;
    exports.GLESDrawElementCMDData = GLESDrawElementCMDData;
    exports.GLESDrawNodeCMDData = GLESDrawNodeCMDData;
    exports.GLESForwardAddClusterRP = GLESForwardAddClusterRP;
    exports.GLESForwardAddRP = GLESForwardAddRP;
    exports.GLESRender3DProcess = GLESRender3DProcess;
    exports.GLESRenderContext3D = GLESRenderContext3D;
    exports.GLESRenderElement3D = GLESRenderElement3D;
    exports.GLESSetRenderData = GLESSetRenderData;
    exports.GLESSetRenderTargetCMD = GLESSetRenderTargetCMD;
    exports.GLESSetShaderDefine = GLESSetShaderDefine;
    exports.GLESSetViewportCMD = GLESSetViewportCMD;
    exports.GLESSkinRenderElement3D = GLESSkinRenderElement3D;
    exports.GLESSpotLightShadowRP = GLESSpotLightShadowRP;
    exports.NativeBounds = NativeBounds;
    exports.RT3DRenderModuleFactory = RT3DRenderModuleFactory;
    exports.RTBaseRenderNode = RTBaseRenderNode;
    exports.RTCameraNodeData = RTCameraNodeData;
    exports.RTDirectLight = RTDirectLight;
    exports.RTLightmapData = RTLightmapData;
    exports.RTMeshRenderNode = RTMeshRenderNode;
    exports.RTPointLight = RTPointLight;
    exports.RTReflectionProb = RTReflectionProb;
    exports.RTScene3DRenderManager = RTScene3DRenderManager;
    exports.RTSceneNodeData = RTSceneNodeData;
    exports.RTSimpleSkinRenderNode = RTSimpleSkinRenderNode;
    exports.RTSkinRenderNode = RTSkinRenderNode;
    exports.RTSpotLight = RTSpotLight;
    exports.RTTransform3D = RTTransform3D;
    exports.RTVolumetricGI = RTVolumetricGI;

})(window.Laya = window.Laya || {}, Laya);
//# sourceMappingURL=laya.opengl_3D.js.map
