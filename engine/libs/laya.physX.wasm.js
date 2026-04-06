(function (exports, Laya) {
    'use strict';

    class pxCollisionTool {
        constructor() {
        }
        static getCollision(pxCollsionData, isTrigger) {
            let collisionData = pxCollsionData.get(0);
            if (!collisionData)
                return null;
            let collsion = pxCollisionTool._collisionPool.length === 0 ? new Laya.Collision() : pxCollisionTool._collisionPool.pop();
            collsion._inPool = false;
            if (isTrigger) {
                let otherShape = pxColliderShape._shapePool.get(collisionData.otherShape);
                let triggerShape = pxColliderShape._shapePool.get(collisionData.triggerShape);
                if (!otherShape || !triggerShape)
                    return null;
                collsion._colliderA = otherShape._pxCollider;
                collsion._colliderB = triggerShape._pxCollider;
                collsion._isTrigger = true;
            }
            else {
                let shape0 = pxColliderShape._shapePool.get(collisionData.pxShape0);
                let shape1 = pxColliderShape._shapePool.get(collisionData.pxShape1);
                if (!shape0 || !shape1)
                    return null;
                collsion._colliderA = shape0._pxCollider;
                collsion._colliderB = shape1._pxCollider;
                for (let i = 0, j = collisionData.contactCount; i < j; i++) {
                    let contactInfo = collisionData["contactPoint" + i];
                    if (!contactInfo)
                        continue;
                    let contact = pxCollisionTool._contactPoint;
                    contact._colliderA = collsion._colliderA;
                    contact._colliderB = collsion._colliderB;
                    contact.normal = pxCollisionTool._tempV3.setValue(contactInfo.normal.x, contactInfo.normal.y, contactInfo.normal.z);
                    contact.positionOnA = contact.positionOnB = pxCollisionTool._tempV3.setValue(contactInfo.position.x, contactInfo.position.y, contactInfo.position.z);
                    collsion.contacts.push(contact);
                }
            }
            return collsion;
        }
        static getRayCastResult(out, quaryResult) {
            if (quaryResult.Quary) {
                out.succeeded = quaryResult.Quary;
                let normal = out.normal;
                normal.x = quaryResult.normal.x;
                normal.y = quaryResult.normal.y;
                normal.z = quaryResult.normal.z;
                let hitPos = out.point;
                hitPos.x = quaryResult.position.x;
                hitPos.y = quaryResult.position.y;
                hitPos.z = quaryResult.position.z;
                out.collider = pxCollider._ActorPool.get(quaryResult.ActorUUID);
            }
            return out;
        }
        static getRayCastResults(out, quaryResults) {
            let quarySize = quaryResults.size();
            if (quarySize <= 0)
                return out;
            out.length = 0;
            for (let i = 0; i < quarySize; i++) {
                let result = quaryResults.get(i);
                let outItem = pxCollisionTool._hitPool.length === 0 ? new Laya.HitResult() : pxCollisionTool._hitPool.pop();
                outItem._inPool = false;
                if (result) {
                    outItem.succeeded = result.Quary;
                    let normal = outItem.normal;
                    normal.x = result.normal.x;
                    normal.y = result.normal.y;
                    normal.z = result.normal.z;
                    let hitPos = outItem.point;
                    hitPos.x = result.position.x;
                    hitPos.y = result.position.y;
                    hitPos.z = result.position.z;
                    outItem.collider = pxCollider._ActorPool.get(result.ActorUUID);
                    out.push(outItem);
                }
            }
            return out;
        }
        static reCoverCollision(value) {
            if (!value._inPool) {
                value._inPool = true;
                pxCollisionTool._collisionPool.push(value);
            }
        }
        static reCoverHitresults(value) {
            if (!value._inPool) {
                value._inPool = true;
                pxCollisionTool._hitPool.push(value);
            }
        }
    }
    pxCollisionTool._collisionPool = [];
    pxCollisionTool._hitPool = [];
    pxCollisionTool._tempV3 = new Laya.Vector3();
    pxCollisionTool._contactPoint = new Laya.ContactPoint();

    exports.partFlag = void 0;
    (function (partFlag) {
        partFlag[partFlag["eSOLVE_CONTACT"] = 1] = "eSOLVE_CONTACT";
        partFlag[partFlag["eMODIFY_CONTACTS"] = 2] = "eMODIFY_CONTACTS";
        partFlag[partFlag["eNOTIFY_TOUCH_FOUND"] = 4] = "eNOTIFY_TOUCH_FOUND";
        partFlag[partFlag["eNOTIFY_TOUCH_PERSISTS"] = 8] = "eNOTIFY_TOUCH_PERSISTS";
        partFlag[partFlag["eNOTIFY_TOUCH_LOST"] = 16] = "eNOTIFY_TOUCH_LOST";
        partFlag[partFlag["eNOTIFY_TOUCH_CCD"] = 32] = "eNOTIFY_TOUCH_CCD";
        partFlag[partFlag["eNOTIFY_THRESHOLD_FORCE_FOUND"] = 64] = "eNOTIFY_THRESHOLD_FORCE_FOUND";
        partFlag[partFlag["eNOTIFY_THRESHOLD_FORCE_PERSISTS"] = 128] = "eNOTIFY_THRESHOLD_FORCE_PERSISTS";
        partFlag[partFlag["eNOTIFY_THRESHOLD_FORCE_LOST"] = 256] = "eNOTIFY_THRESHOLD_FORCE_LOST";
        partFlag[partFlag["eNOTIFY_CONTACT_POINTS"] = 512] = "eNOTIFY_CONTACT_POINTS";
        partFlag[partFlag["eDETECT_DISCRETE_CONTACT"] = 1024] = "eDETECT_DISCRETE_CONTACT";
        partFlag[partFlag["eDETECT_CCD_CONTACT"] = 2048] = "eDETECT_CCD_CONTACT";
        partFlag[partFlag["ePRE_SOLVER_VELOCITY"] = 4096] = "ePRE_SOLVER_VELOCITY";
        partFlag[partFlag["ePOST_SOLVER_VELOCITY"] = 8192] = "ePOST_SOLVER_VELOCITY";
        partFlag[partFlag["eCONTACT_EVENT_POSE"] = 16384] = "eCONTACT_EVENT_POSE";
        partFlag[partFlag["eNEXT_FREE"] = 32768] = "eNEXT_FREE";
        partFlag[partFlag["eCONTACT_DEFAULT"] = 1025] = "eCONTACT_DEFAULT";
        partFlag[partFlag["eTRIGGER_DEFAULT"] = 1044] = "eTRIGGER_DEFAULT";
    })(exports.partFlag || (exports.partFlag = {}));
    class pxPhysicsManager {
        constructor(physicsSettings) {
            this._physicsUpdateList = new Laya.PhysicsUpdateList();
            this._dynamicUpdateList = new Laya.PhysicsUpdateList();
            this.fixedTime = 1.0 / 60.0;
            this.enableCCD = false;
            this._contactCollisionsBegin = new Map();
            this._contactCollisionsPersist = new Map();
            this._contactCollisionsEnd = new Map();
            this._triggerCollisionsBegin = new Map();
            this._triggerCollisionsPersist = new Map();
            this._triggerCollisionsEnd = new Map();
            this._gravity = new Laya.Vector3(0, -9.81, 0);
            const triggerCallback = {
                onWake: (wakeActors) => {
                    let size = wakeActors.size();
                    for (let i = 0; i < size; i++) {
                        let uuid = wakeActors.get(i);
                        this.addDynamicElementByUUID(uuid);
                    }
                },
                onSleep: (sleepActors) => {
                    let size = sleepActors.size();
                    for (let i = 0; i < size; i++) {
                        let uuid = sleepActors.get(i);
                        this.removeDynamicElementByUUID(uuid);
                    }
                },
                onContactBegin: (startContacts) => {
                    this.setDataToMap(startContacts, "onContactBegin");
                },
                onContactEnd: (onContactEnd) => {
                    this.setDataToMap(onContactEnd, "onContactEnd");
                },
                onContactPersist: (onContactPersist) => {
                    this.setDataToMap(onContactPersist, "onContactPersist");
                },
                onTriggerBegin: (startTrigger) => {
                    this.setDataToMap(startTrigger, "onTriggerBegin", true);
                },
                onTriggerEnd: (lostTrigger) => {
                    this.setDataToMap(lostTrigger, "onTriggerEnd", true);
                }
            };
            this.enableCCD = physicsSettings.enableCCD;
            const pxPhysics = pxPhysicsCreateUtil._pxPhysics;
            pxPhysicsCreateUtil._physXSimulationCallbackInstance = pxPhysicsCreateUtil._physX.PxSimulationEventCallback.implement(triggerCallback);
            pxPhysicsCreateUtil._sceneDesc = pxPhysicsCreateUtil._physX.getDefaultSceneDesc(pxPhysics.getTolerancesScale(), 0, pxPhysicsCreateUtil._physXSimulationCallbackInstance);
            this._pxScene = pxPhysics.createScene(pxPhysicsCreateUtil._sceneDesc);
            this.setGravity(this._gravity);
            this._pxcontrollerManager = this._pxScene.createControllerManager();
            if (pxPhysicsCreateUtil._physXPVD) {
                this._pxScene.setPVDClient();
            }
            this.fixedTime = physicsSettings.fixedTimeStep;
        }
        setActiveCollider(collider, value) {
            collider.active = value;
            if (value) {
                collider._physicsManager = this;
            }
            else {
                collider._physicsManager = null;
            }
        }
        enableDebugDrawer(value) {
            throw new Laya.NotImplementedError();
        }
        setDataToMap(dataCallBack, eventType, isTrigger = false) {
            let curCollision = pxCollisionTool.getCollision(dataCallBack, isTrigger);
            if (!curCollision)
                return;
            let _colliderA = curCollision._colliderA;
            let _colliderB = curCollision._colliderB;
            switch (eventType) {
                case "onContactBegin":
                    this._contactCollisionsBegin.set(_colliderA._id, curCollision);
                    this._contactCollisionsBegin.set(_colliderB._id, curCollision);
                    break;
                case "onContactPersist":
                    this._contactCollisionsPersist.set(_colliderA._id, curCollision);
                    this._contactCollisionsPersist.set(_colliderB._id, curCollision);
                    break;
                case "onContactEnd":
                    this._contactCollisionsEnd.set(_colliderA._id, curCollision);
                    this._contactCollisionsEnd.set(_colliderB._id, curCollision);
                    break;
                case "onTriggerBegin":
                    this._triggerCollisionsBegin.set(_colliderA._id, curCollision);
                    this._triggerCollisionsBegin.set(_colliderB._id, curCollision);
                    this._triggerCollisionsPersist.set(_colliderA._id, curCollision);
                    this._triggerCollisionsPersist.set(_colliderB._id, curCollision);
                    break;
                case "onTriggerEnd":
                    this._triggerCollisionsEnd.set(_colliderA._id, curCollision);
                    this._triggerCollisionsEnd.set(_colliderB._id, curCollision);
                    this._triggerCollisionsPersist.delete(_colliderA._id);
                    this._triggerCollisionsPersist.delete(_colliderB._id);
                    break;
            }
        }
        setGravity(gravity) {
            this._pxScene.setGravity(gravity);
        }
        _addCharactorCollider(charactorCollider) {
            charactorCollider._createController();
            this._dynamicUpdateList.add(charactorCollider);
        }
        _removeCharactorCollider(charactorCollider) {
            charactorCollider._releaseController();
            this._dynamicUpdateList.remove(charactorCollider);
        }
        addDynamicElementByUUID(uuid) {
            let collider = pxCollider._ActorPool.get(uuid);
            if (!collider || collider.inPhysicUpdateListIndex !== -1)
                return;
            this._dynamicUpdateList.add(collider);
        }
        removeDynamicElementByUUID(uuid) {
            let collider = pxCollider._ActorPool.get(uuid);
            if (!collider || collider.IsKinematic || collider.inPhysicUpdateListIndex === -1)
                return;
            this._dynamicUpdateList.remove(collider);
        }
        addCollider(collider) {
            if (!collider.active) {
                return;
            }
            let pxcollider = collider;
            switch (pxcollider._type) {
                case exports.pxColliderType.StaticCollider:
                    this._pxScene.addActor(pxcollider._pxActor, null);
                    Laya.Stat.physics_staticRigidBodyCount++;
                    break;
                case exports.pxColliderType.RigidbodyCollider:
                    pxcollider.setWorldTransform(true);
                    this._pxScene.addActor(pxcollider._pxActor, null);
                    if (!collider.IsKinematic) {
                        this._dynamicUpdateList.add(collider);
                        Laya.Stat.physics_dynamicRigidBodyCount++;
                    }
                    else {
                        Laya.Stat.phyiscs_KinematicRigidBodyCount++;
                    }
                    break;
                case exports.pxColliderType.CharactorCollider:
                    this._addCharactorCollider(collider);
                    Laya.Stat.physics_CharacterControllerCount++;
                    break;
            }
            pxcollider._isSimulate = true;
        }
        removeCollider(collider) {
            let pxcollider = collider;
            switch (pxcollider._type) {
                case exports.pxColliderType.StaticCollider:
                    if (collider.inPhysicUpdateListIndex !== -1)
                        this._physicsUpdateList.remove(collider);
                    this._pxScene.removeActor(pxcollider._pxActor, true);
                    Laya.Stat.physics_staticRigidBodyCount--;
                    break;
                case exports.pxColliderType.RigidbodyCollider:
                    if (collider.inPhysicUpdateListIndex !== -1)
                        !collider.IsKinematic && this._dynamicUpdateList.remove(collider);
                    this._pxScene.removeActor(pxcollider._pxActor, true);
                    if (!collider.IsKinematic) {
                        Laya.Stat.physics_dynamicRigidBodyCount--;
                    }
                    else {
                        Laya.Stat.phyiscs_KinematicRigidBodyCount--;
                    }
                    break;
                case exports.pxColliderType.CharactorCollider:
                    this._removeCharactorCollider(pxcollider);
                    Laya.Stat.physics_CharacterControllerCount--;
                    break;
            }
            pxcollider._isSimulate = false;
        }
        _collision_event() {
            this._collision_EnterEvent();
            this._collision_StayEvent();
            this._collision_ExitEvent();
        }
        _collision_EnterEvent() {
            this._contactCollisionsBegin.forEach((value, key) => {
                if (!value)
                    return;
                Laya.Physics3DStatInfo.addStatisticsInfo(Laya.EPhysicsStatisticsInfo.C_PhysicsEventCount, 1);
                let ownerA = value._colliderA.owner;
                let ownerB = value._colliderB.owner;
                value.other = value._colliderB.component;
                ownerA.event(Laya.Event.COLLISION_ENTER, value);
                value.other = value._colliderA.component;
                ownerB.event(Laya.Event.COLLISION_ENTER, value);
                pxCollisionTool.reCoverCollision(value);
            });
        }
        _collision_StayEvent() {
            this._contactCollisionsPersist.forEach((value, key) => {
                if (!value)
                    return;
                Laya.Physics3DStatInfo.addStatisticsInfo(Laya.EPhysicsStatisticsInfo.C_PhysicsEventCount, 1);
                let ownerA = value._colliderA.owner;
                let ownerB = value._colliderB.owner;
                value.other = value._colliderB.component;
                ownerA.event(Laya.Event.COLLISION_STAY, value);
                value.other = value._colliderA.component;
                ownerB.event(Laya.Event.COLLISION_STAY, value);
                pxCollisionTool.reCoverCollision(value);
            });
        }
        _collision_ExitEvent() {
            this._contactCollisionsEnd.forEach((value, key) => {
                if (!value)
                    return;
                Laya.Physics3DStatInfo.addStatisticsInfo(Laya.EPhysicsStatisticsInfo.C_PhysicsEventCount, 1);
                let ownerA = value._colliderA.owner;
                let ownerB = value._colliderB.owner;
                value.other = value._colliderB.component;
                ownerA.event(Laya.Event.COLLISION_EXIT, value);
                value.other = value._colliderA.component;
                ownerB.event(Laya.Event.COLLISION_EXIT, value);
                pxCollisionTool.reCoverCollision(value);
            });
        }
        _trigger_Event() {
            this._trigger_EnterEvent();
            this._trigger_StayEvent();
            this._trigger_ExitEvent();
        }
        _trigger_EnterEvent() {
            this._triggerCollisionsBegin.forEach((value, key) => {
                if (!value)
                    return;
                Laya.Physics3DStatInfo.addStatisticsInfo(Laya.EPhysicsStatisticsInfo.C_PhysicsEventCount, 1);
                let ownerA = value._colliderA.owner;
                let ownerB = value._colliderB.owner;
                ownerA.event(Laya.Event.TRIGGER_ENTER, value);
                ownerB.event(Laya.Event.TRIGGER_ENTER, value);
                pxCollisionTool.reCoverCollision(value);
            });
        }
        _trigger_StayEvent() {
            this._triggerCollisionsPersist.forEach((value, key) => {
                if (!value)
                    return;
                Laya.Physics3DStatInfo.addStatisticsInfo(Laya.EPhysicsStatisticsInfo.C_PhysicsEventCount, 1);
                let ownerA = value._colliderA.owner;
                let ownerB = value._colliderB.owner;
                ownerA.event(Laya.Event.TRIGGER_STAY, value);
                ownerB.event(Laya.Event.TRIGGER_STAY, value);
                pxCollisionTool.reCoverCollision(value);
            });
        }
        _trigger_ExitEvent() {
            this._triggerCollisionsEnd.forEach((value, key) => {
                if (!value)
                    return;
                Laya.Physics3DStatInfo.addStatisticsInfo(Laya.EPhysicsStatisticsInfo.C_PhysicsEventCount, 1);
                let ownerA = value._colliderA.owner;
                let ownerB = value._colliderB.owner;
                ownerA.event(Laya.Event.TRIGGER_EXIT, value);
                ownerB.event(Laya.Event.TRIGGER_EXIT, value);
                pxCollisionTool.reCoverCollision(value);
            });
        }
        _updatePhysicsEvents() {
            this._collision_event();
            this._trigger_Event();
            this._contactCollisionsBegin.clear();
            this._contactCollisionsPersist.clear();
            this._contactCollisionsEnd.clear();
            this._triggerCollisionsBegin.clear();
            this._triggerCollisionsEnd.clear();
        }
        _updatePhysicsTransformToRender() {
            var elements = this._dynamicUpdateList.elements;
            for (var i = 0, n = this._dynamicUpdateList.length; i < n; i++) {
                var physicCollider = elements[i];
                physicCollider.getWorldTransform();
            }
        }
        _updatePhysicsTransformFromRender() {
            var elements = this._physicsUpdateList.elements;
            for (var i = 0, n = this._physicsUpdateList.length; i < n; i++) {
                var physicCollider = elements[i];
                physicCollider.setWorldTransform(false);
                physicCollider.inPhysicUpdateListIndex = -1;
            }
            this._physicsUpdateList.length = 0;
        }
        update(elapsedTime) {
            this._updatePhysicsTransformFromRender();
            this._pxScene.simulate(1 / 60, true);
            this._pxScene.fetchResults(true);
            this._updatePhysicsTransformToRender();
            this._updatePhysicsEvents();
        }
        rayCast(ray, outHitResult, distance = 1000000, collisonGroup = 1 << 4, collisionMask = 1 << 4) {
            let result = this._pxScene.raycastCloset(ray.origin, ray.direction, distance, collisonGroup, collisionMask);
            pxCollisionTool.getRayCastResult(outHitResult, result);
            return outHitResult.succeeded;
        }
        rayCastAll(ray, out, distance = 1000000, collisonGroup = 1 << 4, collisionMask = 1 << 4) {
            let results = this._pxScene.raycastAllHits(ray.origin, ray.direction, distance, collisonGroup, collisionMask);
            pxCollisionTool.getRayCastResults(out, results);
            return (out.length >= 1 ? true : false);
        }
        shapeCast(shape, fromPosition, toPosition, out, fromRotation = new Laya.Quaternion(), toRotation = new Laya.Quaternion(), collisonGroup = 1 << 4, collisionMask = 1 << 4, allowedCcdPenetration = 0.0) {
            let transform = pxPhysicsManager._tempTransform;
            fromPosition.cloneTo(transform.translation);
            let distance = Laya.Vector3.distance(fromPosition, toPosition);
            Laya.Vector3.subtract(toPosition, fromPosition, pxPhysicsManager._tempVector30);
            Laya.Vector3.normalize(pxPhysicsManager._tempVector30, pxPhysicsManager._tempVector30);
            let dir = pxPhysicsManager._tempVector30;
            let result = this._pxScene.sweepSingle(shape._pxGeometry, transform, dir, distance, collisonGroup, collisionMask, allowedCcdPenetration);
            pxCollisionTool.getRayCastResult(out, result);
            return out.succeeded;
        }
        shapeCastAll(shape, fromPosition, toPosition, out, fromRotation = new Laya.Quaternion(), toRotation = new Laya.Quaternion(), collisonGroup = 1 << 4, collisionMask = 1 << 4, allowedCcdPenetration = 0.0) {
            let transform = pxPhysicsManager._tempTransform;
            fromPosition.cloneTo(transform.translation);
            let distance = Laya.Vector3.distance(fromPosition, toPosition);
            Laya.Vector3.subtract(toPosition, fromPosition, pxPhysicsManager._tempVector30);
            Laya.Vector3.normalize(pxPhysicsManager._tempVector30, pxPhysicsManager._tempVector30);
            let dir = pxPhysicsManager._tempVector30;
            let results = this._pxScene.sweepAny(shape._pxGeometry, transform, dir, distance, collisonGroup, collisionMask, allowedCcdPenetration);
            pxCollisionTool.getRayCastResults(out, results);
            return (out.length >= 1 ? true : false);
        }
        sphereQuery(pos, radius, result, collisionmask) {
        }
        destroy() {
        }
    }
    pxPhysicsManager._tempTransform = { translation: new Laya.Vector3(), rotation: new Laya.Quaternion() };
    pxPhysicsManager._tempVector30 = new Laya.Vector3();

    class pxPhysicsMaterial {
        constructor() {
            this._bounciness = 0.1;
            this._dynamicFriction = 0.1;
            this._staticFriction = 0.1;
            this._bounceCombine = Laya.PhysicsCombineMode.Average;
            this._frictionCombine = Laya.PhysicsCombineMode.Average;
            this._pxMaterial = pxPhysicsCreateUtil._pxPhysics.createMaterial(this._staticFriction, this._dynamicFriction, this._bounciness);
        }
        setBounciness(value) {
            this._pxMaterial.setRestitution(value);
        }
        setDynamicFriction(value) {
            this._pxMaterial.setDynamicFriction(value);
        }
        setStaticFriction(value) {
            this._pxMaterial.setStaticFriction(value);
        }
        setBounceCombine(value) {
            this._pxMaterial.setRestitutionCombineMode(value);
        }
        setFrictionCombine(value) {
            this._pxMaterial.setFrictionCombineMode(value);
        }
        destroy() {
            this._pxMaterial.release();
        }
    }

    exports.ShapeFlag = void 0;
    (function (ShapeFlag) {
        ShapeFlag[ShapeFlag["SIMULATION_SHAPE"] = 1] = "SIMULATION_SHAPE";
        ShapeFlag[ShapeFlag["SCENE_QUERY_SHAPE"] = 2] = "SCENE_QUERY_SHAPE";
        ShapeFlag[ShapeFlag["TRIGGER_SHAPE"] = 4] = "TRIGGER_SHAPE";
    })(exports.ShapeFlag || (exports.ShapeFlag = {}));
    class pxColliderShape {
        constructor() {
            this._offset = new Laya.Vector3(0, 0, 0);
            this._scale = new Laya.Vector3(1, 1, 1);
            this._shapeFlags = exports.ShapeFlag.SCENE_QUERY_SHAPE;
            this._pxMaterials = new Array(1);
            this._destroyed = false;
            this.filterData = { word0: Laya.Physics3DUtils.PHYSXDEFAULTMASKVALUE, word1: Laya.Physics3DUtils.PHYSXDEFAULTMASKVALUE, word2: 0, word3: 0 };
        }
        _createShape() {
            this._id = pxColliderShape._pxShapeID++;
            this._pxMaterials[0] = new pxPhysicsMaterial();
            this._pxShape = pxPhysicsCreateUtil._pxPhysics.createShape(this._pxGeometry, this._pxMaterials[0]._pxMaterial, true, new pxPhysicsCreateUtil._physX.PxShapeFlags(this._shapeFlags));
            this._pxShape && this._pxShape.setUUID(this._id);
            pxColliderShape._shapePool.set(this._id, this);
        }
        _modifyFlag(flag, value) {
            this._shapeFlags = value ? this._shapeFlags | flag : this._shapeFlags & ~flag;
        }
        getPhysicsShape() {
            return this._pxShape;
        }
        addToActor(collider) {
            if (this._pxCollider != collider) {
                if (this._pxShape)
                    collider._pxActor.attachShape(this._pxShape);
                this._pxCollider = collider;
                this.setOffset(this._offset);
            }
        }
        removeFromActor(collider) {
            if (this._pxCollider == collider) {
                if (this._pxShape)
                    collider._pxActor.detachShape(this._pxShape, true);
                this._pxCollider = null;
            }
        }
        setOffset(position) {
            position.cloneTo(this._offset);
            if (!this._pxCollider)
                return;
            if (this._pxShape) {
                const transform = pxColliderShape.transform;
                this._pxCollider.owner.transform.getWorldLossyScale().cloneTo(this._scale);
                if (this._pxCollider.owner)
                    Laya.Vector3.multiply(position, this._scale, transform.translation);
                this._pxShape.setLocalPose(transform);
            }
        }
        getOffset() {
            return this._offset;
        }
        setIsTrigger(value) {
            this._modifyFlag(exports.ShapeFlag.SIMULATION_SHAPE, !value);
            this._modifyFlag(exports.ShapeFlag.TRIGGER_SHAPE, value);
            this._setShapeFlags(this._shapeFlags);
        }
        _setShapeFlags(flags) {
            this._shapeFlags = flags;
            if (this._pxShape)
                this._pxShape.setFlags(new pxPhysicsCreateUtil._physX.PxShapeFlags(this._shapeFlags));
        }
        setSimulationFilterData(colliderGroup, colliderMask) {
            this.filterData.word0 = colliderGroup;
            this.filterData.word1 = colliderMask;
            this.filterData.word2 = exports.partFlag.eCONTACT_DEFAULT;
            if (this._pxShape) {
                this._pxShape.setSimulationFilterData(this.filterData);
                this._pxShape.setQueryFilterData(this.filterData);
            }
        }
        setEventFilterData(filterWorld2Number) {
            this.filterData.word2 = filterWorld2Number;
            if (this._pxShape) {
                this._pxShape.setSimulationFilterData(this.filterData);
                this._pxShape.setQueryFilterData(this.filterData);
            }
        }
        destroy() {
            if (this._pxShape) {
                if (this._pxCollider && this._pxCollider._physicsManager) {
                    this._pxCollider._physicsManager.removeCollider(this._pxCollider);
                }
                this._pxShape.release();
                this._pxShape = undefined;
            }
            pxColliderShape._shapePool.delete(this._id);
            this._pxMaterials.forEach(element => {
                element.destroy();
            });
            this._pxMaterials.length = 0;
            this._destroyed = true;
        }
    }
    pxColliderShape._shapePool = new Map();
    pxColliderShape._pxShapeID = 0;
    pxColliderShape.transform = {
        translation: new Laya.Vector3(),
        rotation: new Laya.Quaternion()
    };

    class pxCompoundShape extends pxColliderShape {
        constructor() {
            super();
            this.pxShapes = [];
            this._pxGeometry = new pxPhysicsCreateUtil._physX.PxBoxGeometry(0.1, 0.1, 0.1);
            this._createShape();
        }
        addChildShape(shape) {
            this.pxShapes.push(shape);
            let trigger = false;
            if (this._physicsComponent instanceof Laya.Rigidbody3D) {
                trigger = this._physicsComponent.trigger;
            }
            if (this._physicsComponent instanceof Laya.PhysicsCollider) {
                trigger = this._physicsComponent.isTrigger;
            }
            shape.setIsTrigger(trigger);
            shape.setSimulationFilterData((this._physicsComponent && this._physicsComponent.collisionGroup != Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) ? this._physicsComponent.collisionGroup : Laya.Physics3DUtils.PHYSXDEFAULTMASKVALUE, (this._physicsComponent && this._physicsComponent.canCollideWith != Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) ? this._physicsComponent.canCollideWith : Laya.Physics3DUtils.PHYSXDEFAULTMASKVALUE);
            this._pxCollider && this._pxCollider.setColliderShape(shape);
        }
        removeChildShape(shape, index) {
            this.pxShapes.splice(index, 1);
            this._pxCollider && shape.removeFromActor(this._pxCollider);
        }
        setShapeData(component) {
            this._physicsComponent = component;
        }
        refreshShapes() {
            this.pxShapes.forEach(shape => {
                let trigger = false;
                if (this._physicsComponent instanceof Laya.Rigidbody3D) {
                    trigger = this._physicsComponent.trigger;
                }
                if (this._physicsComponent instanceof Laya.PhysicsCollider) {
                    trigger = this._physicsComponent.isTrigger;
                }
                shape.setIsTrigger(trigger);
                shape.setSimulationFilterData((this._physicsComponent && this._physicsComponent.collisionGroup != Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) ? this._physicsComponent.collisionGroup : Laya.Physics3DUtils.PHYSXDEFAULTMASKVALUE, (this._physicsComponent && this._physicsComponent.canCollideWith != Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) ? this._physicsComponent.canCollideWith : Laya.Physics3DUtils.PHYSXDEFAULTMASKVALUE);
                this._pxCollider && shape.addToActor(this._pxCollider);
            });
        }
    }

    exports.pxColliderType = void 0;
    (function (pxColliderType) {
        pxColliderType[pxColliderType["RigidbodyCollider"] = 0] = "RigidbodyCollider";
        pxColliderType[pxColliderType["CharactorCollider"] = 1] = "CharactorCollider";
        pxColliderType[pxColliderType["StaticCollider"] = 2] = "StaticCollider";
    })(exports.pxColliderType || (exports.pxColliderType = {}));
    exports.pxActorFlag = void 0;
    (function (pxActorFlag) {
        pxActorFlag[pxActorFlag["eVISUALIZATION"] = 1] = "eVISUALIZATION";
        pxActorFlag[pxActorFlag["eDISABLE_GRAVITY"] = 2] = "eDISABLE_GRAVITY";
        pxActorFlag[pxActorFlag["eSEND_SLEEP_NOTIFIES"] = 4] = "eSEND_SLEEP_NOTIFIES";
        pxActorFlag[pxActorFlag["eDISABLE_SIMULATION"] = 8] = "eDISABLE_SIMULATION";
    })(exports.pxActorFlag || (exports.pxActorFlag = {}));
    class pxCollider {
        constructor(manager) {
            this._type = exports.pxColliderType.StaticCollider;
            this._isSimulate = false;
            this._destroyed = false;
            this.inPhysicUpdateListIndex = -1;
            this._enableProcessCollisions = false;
            this._transformFlag = 2147483647;
            this._bounciness = 0.1;
            this._dynamicFriction = 0.1;
            this._staticFriction = 0.1;
            this._bounceCombine = Laya.PhysicsCombineMode.Average;
            this._frictionCombine = Laya.PhysicsCombineMode.Average;
            this._collisionGroup = Laya.Physics3DUtils.PHYSXDEFAULTMASKVALUE;
            this._canCollisionWith = Laya.Physics3DUtils.PHYSXDEFAULTMASKVALUE;
            this._physicsManager = manager;
            this._id = pxCollider._pxActorID++;
        }
        setfriction(value) {
            throw new Laya.NotImplementedError();
        }
        setRollingFriction(value) {
            throw new Laya.NotImplementedError();
        }
        setActorFlag(flag, value) {
            this._pxActor.setCustomFlag(flag, value);
        }
        getCapable(value) {
            return null;
        }
        setColliderShape(shape) {
            if (shape == this._shape)
                return;
            if (shape instanceof pxCompoundShape) {
                shape._pxCollider = this;
                shape.refreshShapes();
            }
            var lastColliderShape = this._shape;
            this._shape = shape;
            if (shape) {
                if (this._pxActor) {
                    if (lastColliderShape)
                        lastColliderShape.removeFromActor(this);
                    this._shape.addToActor(this);
                    let simulate = this._isSimulate;
                    simulate && this._physicsManager.removeCollider(this);
                    this._initColliderShapeByCollider();
                    if ((simulate || !lastColliderShape || (lastColliderShape && lastColliderShape._destroyed)) && this.componentEnable) {
                        this._physicsManager.addCollider(this);
                    }
                }
                else {
                    this._shape = null;
                }
            }
            else {
                if (this._isSimulate) {
                    this._physicsManager.removeCollider(this);
                }
            }
            lastColliderShape && lastColliderShape.destroy();
        }
        _initColliderShapeByCollider() {
            this.setBounceCombine(this._bounceCombine);
            this.setFrictionCombine(this._frictionCombine);
            this.setStaticFriction(this._staticFriction);
            this.setBounciness(this._bounciness);
            this.setDynamicFriction(this._dynamicFriction);
            this.setCollisionGroup(this._collisionGroup);
            this.setCanCollideWith(this._canCollisionWith);
        }
        destroy() {
            this._pxActor.release();
            this._destroyed = true;
        }
        setCollisionGroup(value) {
            if (value == Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
                value = Laya.Physics3DUtils.PHYSXDEFAULTMASKVALUE;
            }
            this._collisionGroup = value;
            this._shape.setSimulationFilterData(this._collisionGroup, this._canCollisionWith);
        }
        setCanCollideWith(value) {
            if (value == Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
                value = Laya.Physics3DUtils.PHYSXDEFAULTMASKVALUE;
            }
            this._canCollisionWith = value;
            this._shape.setSimulationFilterData(this._collisionGroup, this._canCollisionWith);
        }
        setEventFilter(events) {
            if (!this._shape)
                return;
            let flag = exports.partFlag.eCONTACT_DEFAULT | exports.partFlag.eTRIGGER_DEFAULT;
            for (let i = 0, j = events.length; i < j; i++) {
                let value = events[i];
                if (value == Laya.Event.TRIGGER_ENTER) {
                    flag = flag | exports.partFlag.eTRIGGER_DEFAULT | exports.partFlag.eNOTIFY_TOUCH_FOUND;
                }
                if (value == Laya.Event.TRIGGER_STAY) ;
                if (value == Laya.Event.TRIGGER_EXIT) {
                    flag = flag | exports.partFlag.eTRIGGER_DEFAULT | exports.partFlag.eNOTIFY_TOUCH_LOST;
                }
                if (value == Laya.Event.COLLISION_ENTER) {
                    flag = flag | exports.partFlag.eNOTIFY_TOUCH_PERSISTS | exports.partFlag.eNOTIFY_CONTACT_POINTS;
                }
                if (value == Laya.Event.COLLISION_STAY) {
                    flag = flag | exports.partFlag.eNOTIFY_TOUCH_PERSISTS;
                }
                if (value == Laya.Event.COLLISION_EXIT) {
                    flag = flag | exports.partFlag.eNOTIFY_TOUCH_PERSISTS | exports.partFlag.eNOTIFY_TOUCH_LOST;
                }
            }
            this._shape && this._shape.setEventFilterData(flag);
        }
        allowSleep(value) {
        }
        setOwner(node) {
            this.owner = node;
            this._transform = node.transform;
            this._initCollider();
            pxCollider._ActorPool.set(this._id, this);
            this._pxActor.setUUID(this._id);
            this.setActorFlag(exports.pxActorFlag.eSEND_SLEEP_NOTIFIES, true);
        }
        _initCollider() {
        }
        transformChanged(flag) {
            this._transformFlag = flag;
            if (this.inPhysicUpdateListIndex == -1 && !this._enableProcessCollisions) {
                this._physicsManager._physicsUpdateList.add(this);
            }
        }
        setWorldTransform(focus) {
            if (this.owner) {
                if (focus || this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDPOSITION) || this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDQUATERNION)) {
                    this._pxActor.setGlobalPose(this._transformTo(this.owner.transform.position, this.owner.transform.rotation), true);
                    this._setTransformFlag(Laya.Transform3D.TRANSFORM_WORLDPOSITION, false);
                    this._setTransformFlag(Laya.Transform3D.TRANSFORM_WORLDQUATERNION, false);
                }
                if (focus || this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDSCALE) && this._shape) {
                    this._shape && this._shape.setOffset(this._shape._offset);
                    this._setTransformFlag(Laya.Transform3D.TRANSFORM_WORLDSCALE, false);
                }
            }
        }
        setBounciness(value) {
            this._bounciness = value;
            this._shape && this._shape._pxMaterials[0].setBounciness(value);
        }
        setDynamicFriction(value) {
            this._dynamicFriction = value;
            this._shape && this._shape._pxMaterials[0].setDynamicFriction(value);
        }
        setStaticFriction(value) {
            this._staticFriction = value;
            this._shape && this._shape._pxMaterials[0].setStaticFriction(value);
        }
        setFrictionCombine(value) {
            this._frictionCombine = value;
            this._shape && this._shape._pxMaterials[0].setFrictionCombine(value);
        }
        setBounceCombine(value) {
            this._bounceCombine = value;
            this._shape && this._shape._pxMaterials[0].setBounceCombine(value);
        }
        _getTransformFlag(type) {
            return (this._transformFlag & type) != 0;
        }
        _setTransformFlag(type, value) {
            if (value)
                this._transformFlag |= type;
            else
                this._transformFlag &= ~type;
        }
        _transformTo(pos, rot) {
            const transform = pxCollider._tempTransform;
            pos.cloneTo(transform.translation);
            rot.normalize(transform.rotation);
            return transform;
        }
    }
    pxCollider._ActorPool = new Map();
    pxCollider._pxActorID = 0;
    pxCollider._tempTransform = { translation: new Laya.Vector3(), rotation: new Laya.Quaternion() };

    exports.CollisionDetectionMode = void 0;
    (function (CollisionDetectionMode) {
        CollisionDetectionMode[CollisionDetectionMode["Discrete"] = 0] = "Discrete";
        CollisionDetectionMode[CollisionDetectionMode["Continuous"] = 1] = "Continuous";
        CollisionDetectionMode[CollisionDetectionMode["ContinuousDynamic"] = 2] = "ContinuousDynamic";
        CollisionDetectionMode[CollisionDetectionMode["ContinuousSpeculative"] = 3] = "ContinuousSpeculative";
    })(exports.CollisionDetectionMode || (exports.CollisionDetectionMode = {}));
    exports.DynamicColliderConstraints = void 0;
    (function (DynamicColliderConstraints) {
        DynamicColliderConstraints[DynamicColliderConstraints["None"] = 0] = "None";
        DynamicColliderConstraints[DynamicColliderConstraints["FreezePositionX"] = 1] = "FreezePositionX";
        DynamicColliderConstraints[DynamicColliderConstraints["FreezePositionY"] = 2] = "FreezePositionY";
        DynamicColliderConstraints[DynamicColliderConstraints["FreezePositionZ"] = 4] = "FreezePositionZ";
        DynamicColliderConstraints[DynamicColliderConstraints["FreezeRotationX"] = 8] = "FreezeRotationX";
        DynamicColliderConstraints[DynamicColliderConstraints["FreezeRotationY"] = 16] = "FreezeRotationY";
        DynamicColliderConstraints[DynamicColliderConstraints["FreezeRotationZ"] = 32] = "FreezeRotationZ";
    })(exports.DynamicColliderConstraints || (exports.DynamicColliderConstraints = {}));
    class pxDynamicCollider extends pxCollider {
        static getStaticColliderCapable(value) {
            return pxDynamicCollider._dynamicCapableMap.get(value);
        }
        static initCapable() {
            this._dynamicCapableMap = new Map();
            this._dynamicCapableMap.set(Laya.EColliderCapable.Collider_AllowTrigger, true);
            this._dynamicCapableMap.set(Laya.EColliderCapable.Collider_CollisionGroup, true);
            this._dynamicCapableMap.set(Laya.EColliderCapable.Collider_Restitution, true);
            this._dynamicCapableMap.set(Laya.EColliderCapable.Collider_Friction, false);
            this._dynamicCapableMap.set(Laya.EColliderCapable.Collider_RollingFriction, false);
            this._dynamicCapableMap.set(Laya.EColliderCapable.Collider_DynamicFriction, true);
            this._dynamicCapableMap.set(Laya.EColliderCapable.Collider_StaticFriction, true);
            this._dynamicCapableMap.set(Laya.EColliderCapable.Collider_BounceCombine, true);
            this._dynamicCapableMap.set(Laya.EColliderCapable.Collider_FrictionCombine, true);
            this._dynamicCapableMap.set(Laya.EColliderCapable.Collider_EventFilter, true);
            this._dynamicCapableMap.set(Laya.EColliderCapable.Collider_CollisionDetectionMode, true);
            this._dynamicCapableMap.set(Laya.EColliderCapable.RigidBody_AllowSleep, true);
            this._dynamicCapableMap.set(Laya.EColliderCapable.RigidBody_Gravity, true);
            this._dynamicCapableMap.set(Laya.EColliderCapable.RigidBody_LinearDamp, true);
            this._dynamicCapableMap.set(Laya.EColliderCapable.RigidBody_AngularDamp, true);
            this._dynamicCapableMap.set(Laya.EColliderCapable.RigidBody_LinearVelocity, true);
            this._dynamicCapableMap.set(Laya.EColliderCapable.RigidBody_AngularVelocity, true);
            this._dynamicCapableMap.set(Laya.EColliderCapable.RigidBody_Mass, true);
            this._dynamicCapableMap.set(Laya.EColliderCapable.RigidBody_InertiaTensor, true);
            this._dynamicCapableMap.set(Laya.EColliderCapable.RigidBody_MassCenter, true);
            this._dynamicCapableMap.set(Laya.EColliderCapable.RigidBody_SleepThreshold, true);
            this._dynamicCapableMap.set(Laya.EColliderCapable.RigidBody_SleepAngularVelocity, false);
            this._dynamicCapableMap.set(Laya.EColliderCapable.RigidBody_SolverIterations, true);
            this._dynamicCapableMap.set(Laya.EColliderCapable.RigidBody_AllowDetectionMode, true);
            this._dynamicCapableMap.set(Laya.EColliderCapable.RigidBody_AllowKinematic, true);
            this._dynamicCapableMap.set(Laya.EColliderCapable.RigidBody_LinearFactor, true);
            this._dynamicCapableMap.set(Laya.EColliderCapable.RigidBody_AngularFactor, true);
            this._dynamicCapableMap.set(Laya.EColliderCapable.RigidBody_ApplyForce, true);
            this._dynamicCapableMap.set(Laya.EColliderCapable.RigidBody_ApplyTorque, true);
            this._dynamicCapableMap.set(Laya.EColliderCapable.RigidBody_ApplyImpulse, true);
            this._dynamicCapableMap.set(Laya.EColliderCapable.RigidBody_ApplyTorqueImpulse, true);
            this._dynamicCapableMap.set(Laya.EColliderCapable.RigidBody_WorldPosition, true);
            this._dynamicCapableMap.set(Laya.EColliderCapable.RigidBody_WorldOrientation, true);
        }
        constructor(manager) {
            super(manager);
            this.IsKinematic = false;
            this._mass = 1.0;
            this._linearDamping = 0.0;
            this._angularDamping = 0.0;
            this._linearVelocity = new Laya.Vector3();
            this._angularVelocity = new Laya.Vector3();
            this._centerOfMass = new Laya.Vector3(0, 0, 0);
            this._inertiaTensor = new Laya.Vector3(1, 1, 1);
            this._sleepThreshold = 5e-3;
            this._collisionDetectionMode = exports.CollisionDetectionMode.Discrete;
            this._solverIterations = 4.0;
            this._enableProcessCollisions = true;
            this._type = exports.pxColliderType.RigidbodyCollider;
            Laya.Physics3DStatInfo.addStatisticsInfo(Laya.EPhysicsStatisticsInfo.C_PhysicaDynamicRigidBody, 1);
        }
        getCapable(value) {
            return pxDynamicCollider.getStaticColliderCapable(value);
        }
        _initCollider() {
            this._pxActor = pxPhysicsCreateUtil._pxPhysics.createRigidDynamic(this._transformTo(new Laya.Vector3(), new Laya.Quaternion()));
        }
        _initColliderShapeByCollider() {
            super._initColliderShapeByCollider();
            this.setWorldTransform(true);
            this.setTrigger(this._isTrigger);
            this.setInertiaTensor(this._inertiaTensor);
            this.setMass(this._mass);
            this.setIsKinematic(this.IsKinematic);
            this.setAngularDamping(this._angularDamping);
            this.setAngularVelocity(this._angularVelocity);
            this.setLinearDamping(this._linearDamping);
            this.setLinearVelocity(this._linearVelocity);
            this.setCenterOfMass(this._centerOfMass);
            this.setCollisionDetectionMode(this._collisionDetectionMode);
            this.setSolverIterations(this._solverIterations);
            this.setSleepThreshold(this._sleepThreshold);
            this.setWorldPosition(this.owner.transform.position);
        }
        setWorldRotation(value) {
            const transform = this._pxActor.getGlobalPose();
            _tempTranslation$1.setValue(transform.translation.x, transform.translation.y, transform.translation.z);
            _tempRotation.setValue(value.x, value.y, value.z, value.w);
            this._pxActor.setGlobalPose(this._transformTo(_tempTranslation$1, _tempRotation), true);
        }
        setWorldPosition(value) {
            const transform = this._pxActor.getGlobalPose();
            _tempTranslation$1.setValue(value.x, value.y, value.z);
            _tempRotation.setValue(transform.rotation.x, transform.rotation.y, transform.rotation.z, transform.rotation.w);
            this._pxActor.setGlobalPose(this._transformTo(_tempTranslation$1, _tempRotation), true);
        }
        getWorldTransform() {
            const transform = this._pxActor.getGlobalPose();
            _tempTranslation$1.set(transform.translation.x, transform.translation.y, transform.translation.z);
            _tempRotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z, transform.rotation.w);
            this.owner.transform.position = _tempTranslation$1;
            this.owner.transform.rotation = _tempRotation;
        }
        setTrigger(value) {
            this._isTrigger = value;
            this._shape && this._shape.setIsTrigger(value);
        }
        setLinearDamping(value) {
            this._linearDamping = value;
            this._pxActor.setLinearDamping(value);
        }
        setAngularDamping(value) {
            this._angularDamping = value;
            this._pxActor.setAngularDamping(value);
        }
        setLinearVelocity(value) {
            this._linearVelocity = value;
            this._pxActor.setLinearVelocity(value, true);
        }
        getLinearVelocity() {
            let velocity = this._pxActor.getLinearVelocity();
            _tempTranslation$1.set(velocity.x, velocity.y, velocity.z);
            return _tempTranslation$1;
        }
        setAngularVelocity(value) {
            this._angularVelocity = value;
            this._pxActor.setAngularVelocity(value, true);
        }
        getAngularVelocity() {
            let angVelocity = this._pxActor.getAngularVelocity();
            _tempTranslation$1.set(angVelocity.x, angVelocity.y, angVelocity.z);
            this._angularVelocity.setValue(angVelocity.x, angVelocity.y, angVelocity.z);
            return _tempTranslation$1;
        }
        setMass(value) {
            value = Math.max(value, 1e-07);
            this._mass = value;
            this._pxActor.setMassAndUpdateInertia(value);
        }
        setCenterOfMass(value) {
            this._centerOfMass = value;
            this._pxActor.setCMassLocalPose(value);
        }
        setInertiaTensor(value) {
            this._pxActor.setMassSpaceInertiaTensor(value);
        }
        isSleeping() {
            return this._pxActor.isSleeping();
        }
        setSleepThreshold(value) {
            this._sleepThreshold = value;
            this._pxActor.setSleepThreshold(value);
        }
        setCollisionDetectionMode(value) {
            this._collisionDetectionMode = value;
            switch (value) {
                case exports.CollisionDetectionMode.Continuous:
                    this._pxActor.setRigidBodyFlag(pxPhysicsCreateUtil._physX.PxRigidBodyFlag.eENABLE_CCD, true);
                    break;
                case exports.CollisionDetectionMode.ContinuousDynamic:
                    this._pxActor.setRigidBodyFlag(pxPhysicsCreateUtil._physX.PxRigidBodyFlag.eENABLE_CCD_FRICTION, true);
                    break;
                case exports.CollisionDetectionMode.ContinuousSpeculative:
                    this._pxActor.setRigidBodyFlag(pxPhysicsCreateUtil._physX.PxRigidBodyFlag.eENABLE_SPECULATIVE_CCD, true);
                    break;
                case exports.CollisionDetectionMode.Discrete:
                    const physX = pxPhysicsCreateUtil._physX;
                    this._pxActor.setRigidBodyFlag(physX.PxRigidBodyFlag.eENABLE_CCD, false);
                    this._pxActor.setRigidBodyFlag(physX.PxRigidBodyFlag.eENABLE_CCD_FRICTION, false);
                    this._pxActor.setRigidBodyFlag(physX.PxRigidBodyFlag.eENABLE_SPECULATIVE_CCD, false);
                    break;
            }
        }
        setSolverIterations(value) {
            this._solverIterations = value;
            this._pxActor.setSolverIterationCounts(value, 1);
        }
        setIsKinematic(value) {
            this.IsKinematic = value;
            if (value) {
                this._enableProcessCollisions = false;
                if (this._isSimulate)
                    this._physicsManager._dynamicUpdateList.remove(this);
                this._pxActor.setRigidBodyFlag(pxPhysicsCreateUtil._physX.PxRigidBodyFlag.eKINEMATIC, true);
                Laya.Physics3DStatInfo.addStatisticsInfo(Laya.EPhysicsStatisticsInfo.C_PhysicaKinematicRigidBody, 1);
                Laya.Physics3DStatInfo.addStatisticsInfo(Laya.EPhysicsStatisticsInfo.C_PhysicaDynamicRigidBody, -1);
            }
            else {
                this._enableProcessCollisions = true;
                if (this._isSimulate && this.inPhysicUpdateListIndex == -1)
                    this._physicsManager._dynamicUpdateList.add(this);
                this._pxActor.setRigidBodyFlag(pxPhysicsCreateUtil._physX.PxRigidBodyFlag.eKINEMATIC, false);
            }
        }
        allowSleep(value) {
            if (this.IsKinematic)
                return;
            if (this._pxActor) {
                if (value) {
                    this.setSleepThreshold(this._sleepThreshold);
                    this._pxActor.setWakeCounter(0.4);
                }
                else {
                    this.setSleepThreshold(0.0);
                    this._pxActor.setWakeCounter(Number.MAX_VALUE);
                }
            }
        }
        setConstraints(linearFactor, angularFactor) {
            let constrainFlag = exports.DynamicColliderConstraints.None;
            linearFactor.x == 0 && (constrainFlag |= exports.DynamicColliderConstraints.FreezePositionX);
            linearFactor.y == 0 && (constrainFlag |= exports.DynamicColliderConstraints.FreezePositionY);
            linearFactor.z == 0 && (constrainFlag |= exports.DynamicColliderConstraints.FreezePositionZ);
            angularFactor.x == 0 && (constrainFlag |= exports.DynamicColliderConstraints.FreezeRotationX);
            angularFactor.y == 0 && (constrainFlag |= exports.DynamicColliderConstraints.FreezeRotationY);
            angularFactor.z == 0 && (constrainFlag |= exports.DynamicColliderConstraints.FreezeRotationZ);
            this._pxActor.setRigidDynamicLockFlags(constrainFlag);
        }
        addForce(force, mode, localOffset) {
            this._pxActor.addForce({ x: force.x, y: force.y, z: force.z });
        }
        addTorque(torque, mode) {
            this._pxActor.addTorque({ x: torque.x, y: torque.y, z: torque.z });
        }
        sleep() {
            return this._pxActor.putToSleep();
        }
        wakeUp() {
            return this._pxActor.wakeUp();
        }
        move(positionOrRotation, rotation) {
            if (rotation) {
                this._pxActor.setKinematicTarget(positionOrRotation, rotation);
                return;
            }
            this.getWorldTransform();
            if (positionOrRotation instanceof Laya.Vector3) {
                this._pxActor.setKinematicTarget(positionOrRotation, _tempRotation);
            }
            else {
                this._pxActor.setKinematicTarget(_tempTranslation$1, positionOrRotation);
            }
        }
        destroy() {
            if (this.IsKinematic) {
                Laya.Physics3DStatInfo.addStatisticsInfo(Laya.EPhysicsStatisticsInfo.C_PhysicaKinematicRigidBody, -1);
            }
            else {
                Laya.Physics3DStatInfo.addStatisticsInfo(Laya.EPhysicsStatisticsInfo.C_PhysicaDynamicRigidBody, -1);
            }
            super.destroy();
        }
    }
    const _tempRotation = new Laya.Quaternion();
    const _tempTranslation$1 = new Laya.Vector3();

    class pxStaticCollider extends pxCollider {
        static getStaticColliderCapable(value) {
            return pxStaticCollider._staticCapableMap.get(value);
        }
        static initCapable() {
            this._staticCapableMap = new Map();
            this._staticCapableMap.set(Laya.EColliderCapable.Collider_AllowTrigger, true);
            this._staticCapableMap.set(Laya.EColliderCapable.Collider_CollisionGroup, true);
            this._staticCapableMap.set(Laya.EColliderCapable.Collider_Friction, false);
            this._staticCapableMap.set(Laya.EColliderCapable.Collider_Restitution, true);
            this._staticCapableMap.set(Laya.EColliderCapable.Collider_RollingFriction, false);
            this._staticCapableMap.set(Laya.EColliderCapable.Collider_DynamicFriction, true);
            this._staticCapableMap.set(Laya.EColliderCapable.Collider_StaticFriction, true);
            this._staticCapableMap.set(Laya.EColliderCapable.Collider_BounceCombine, true);
            this._staticCapableMap.set(Laya.EColliderCapable.Collider_FrictionCombine, true);
            this._staticCapableMap.set(Laya.EColliderCapable.Collider_EventFilter, true);
            this._staticCapableMap.set(Laya.EColliderCapable.Collider_CollisionDetectionMode, true);
            this._staticCapableMap.set(Laya.EColliderCapable.RigidBody_AllowSleep, true);
        }
        constructor(manager) {
            super(manager);
            Laya.Physics3DStatInfo.addStatisticsInfo(Laya.EPhysicsStatisticsInfo.C_PhysicaStaticRigidBody, 1);
        }
        getCapable(value) {
            return pxStaticCollider.getStaticColliderCapable(value);
        }
        _initCollider() {
            this._pxActor = pxPhysicsCreateUtil._pxPhysics.createRigidStatic(this._transformTo(new Laya.Vector3(), new Laya.Quaternion()));
        }
        setTrigger(value) {
            this._isTrigger = value;
            this._shape && this._shape.setIsTrigger(value);
        }
        _initColliderShapeByCollider() {
            super._initColliderShapeByCollider();
            this.setWorldTransform(true);
            this.setTrigger(this._isTrigger);
        }
        destroy() {
            Laya.Physics3DStatInfo.addStatisticsInfo(Laya.EPhysicsStatisticsInfo.C_PhysicaStaticRigidBody, -1);
            super.destroy();
        }
    }

    exports.PxConstraintFlag = void 0;
    (function (PxConstraintFlag) {
        PxConstraintFlag[PxConstraintFlag["eBROKEN"] = 1] = "eBROKEN";
        PxConstraintFlag[PxConstraintFlag["ePROJECT_TO_ACTOR0"] = 2] = "ePROJECT_TO_ACTOR0";
        PxConstraintFlag[PxConstraintFlag["ePROJECT_TO_ACTOR1"] = 4] = "ePROJECT_TO_ACTOR1";
        PxConstraintFlag[PxConstraintFlag["ePROJECTION"] = 6] = "ePROJECTION";
        PxConstraintFlag[PxConstraintFlag["eCOLLISION_ENABLED"] = 8] = "eCOLLISION_ENABLED";
        PxConstraintFlag[PxConstraintFlag["eVISUALIZATION"] = 16] = "eVISUALIZATION";
        PxConstraintFlag[PxConstraintFlag["eDRIVE_LIMITS_ARE_FORCES"] = 32] = "eDRIVE_LIMITS_ARE_FORCES";
        PxConstraintFlag[PxConstraintFlag["eIMPROVED_SLERP"] = 128] = "eIMPROVED_SLERP";
        PxConstraintFlag[PxConstraintFlag["eDISABLE_PREPROCESSING"] = 256] = "eDISABLE_PREPROCESSING";
        PxConstraintFlag[PxConstraintFlag["eENABLE_EXTENDED_LIMITS"] = 512] = "eENABLE_EXTENDED_LIMITS";
        PxConstraintFlag[PxConstraintFlag["eGPU_COMPATIBLE"] = 1024] = "eGPU_COMPATIBLE";
        PxConstraintFlag[PxConstraintFlag["eALWAYS_UPDATE"] = 2048] = "eALWAYS_UPDATE";
        PxConstraintFlag[PxConstraintFlag["eDISABLE_CONSTRAINT"] = 4096] = "eDISABLE_CONSTRAINT";
    })(exports.PxConstraintFlag || (exports.PxConstraintFlag = {}));
    class pxJoint {
        constructor(manager) {
            this._breakForce = Number.MAX_VALUE;
            this._breakTorque = Number.MAX_VALUE;
            this._physicsManager = manager;
            this._id = pxJoint._pxJointID++;
            this._localPos = new Laya.Vector3();
            this._connectlocalPos = new Laya.Vector3();
            this._linearForce = new Laya.Vector3();
            this._angularForce = new Laya.Vector3();
            Laya.Physics3DStatInfo.addStatisticsInfo(Laya.EPhysicsStatisticsInfo.C_PhysicsJoint, 1);
        }
        isEnable(value) {
            this._pxJoint && this._pxJoint.setConstraintFlag(exports.PxConstraintFlag.eDISABLE_CONSTRAINT, !value);
        }
        isCollision(value) {
            this._pxJoint && this._pxJoint.setConstraintFlag(exports.PxConstraintFlag.eCOLLISION_ENABLED, value);
        }
        isPreprocessiong(value) {
            this._pxJoint && this._pxJoint.setConstraintFlag(exports.PxConstraintFlag.eDISABLE_PREPROCESSING, value);
        }
        _createJoint() {
        }
        destroy() {
            Laya.Physics3DStatInfo.addStatisticsInfo(Laya.EPhysicsStatisticsInfo.C_PhysicsJoint, -1);
        }
        setOwner(value) {
            this.owner = value;
            pxJoint._ActorPool.set(this._id, this);
            this._collider && this._connectCollider && this._createJoint();
        }
        _setActor() {
            if (this._pxJoint) {
                this._pxJoint.setActors(this._collider._pxActor || null, this._connectCollider._pxActor || null);
            }
            else {
                this._collider && this._connectCollider && this._createJoint();
            }
        }
        setCollider(owner) {
            if (owner == this._collider)
                return;
            this._collider = owner;
            this._setActor();
        }
        setConnectedCollider(owner) {
            if (owner == this._connectCollider)
                return;
            this._connectCollider = owner;
            this._setActor();
        }
        _setLocalPose(actor, position) {
            this._pxJoint && this._pxJoint.setLocalPose(actor, position, Laya.Quaternion.DEFAULT);
        }
        setLocalPos(value) {
            value && value.cloneTo(this._localPos);
            this._pxJoint && this._setLocalPose(0, this._localPos);
        }
        setConnectLocalPos(value) {
            value && value.cloneTo(this._connectlocalPos);
            this._setLocalPose(1, this._connectlocalPos);
        }
        setConnectedMassScale(value) {
            this._pxJoint && this._pxJoint.setInvMassScale0(1 / value);
        }
        setConnectedInertiaScale(value) {
            this._pxJoint && this._pxJoint.setInvInertiaScale0(1 / value);
        }
        setMassScale(value) {
            this._pxJoint && this._pxJoint.setInvMassScale1(1 / value);
        }
        setInertiaScale(value) {
            this._pxJoint && this._pxJoint.setInvInertiaScale1(1 / value);
        }
        setBreakForce(value) {
            this._breakForce = value;
            this._pxJoint && this._pxJoint.setBreakForce(this._breakForce, this._breakTorque);
        }
        setBreakTorque(value) {
            this._breakTorque = value;
            this._pxJoint && this._pxJoint.setBreakForce(this._breakForce, this._breakTorque);
        }
        getlinearForce() {
            const v3 = this._pxJoint.getlinearForce();
            this._linearForce.set(v3.x, v3.y, v3.z);
            return this._linearForce;
        }
        getAngularForce() {
            const v3 = this._pxJoint.getAngularForce();
            this._linearForce.set(v3.x, v3.y, v3.z);
            return this._linearForce;
        }
        isValid() {
            return this._pxJoint.isValid();
        }
        release() {
            if (this._pxJoint) {
                this._pxJoint.release();
                this._pxJoint = null;
            }
        }
    }
    pxJoint._ActorPool = new Map();
    pxJoint._pxJointID = 0;
    pxJoint._tempTransform0 = { translation: new Laya.Vector3(), rotation: new Laya.Quaternion() };
    pxJoint._tempTransform1 = { translation: new Laya.Vector3(), rotation: new Laya.Quaternion() };

    class pxFixedJoint extends pxJoint {
        _createJoint() {
            const transform = pxJoint._tempTransform0;
            this._localPos.cloneTo(transform.translation);
            const transform1 = pxJoint._tempTransform1;
            this._connectlocalPos.cloneTo(transform1.translation);
            this._pxJoint = pxPhysicsCreateUtil._pxPhysics.createFixedJoint(this._collider._pxActor, transform.translation, transform.rotation, this._connectCollider._pxActor, transform1.translation, transform1.rotation);
            this._pxJoint.setUUID(this._id);
        }
        destroy() {
            this._pxJoint && this._pxJoint.release();
            super.destroy();
        }
    }

    exports.PxD6JointDriveFlag = void 0;
    (function (PxD6JointDriveFlag) {
        PxD6JointDriveFlag[PxD6JointDriveFlag["eACCELERATION"] = 1] = "eACCELERATION";
    })(exports.PxD6JointDriveFlag || (exports.PxD6JointDriveFlag = {}));
    class pxD6Joint extends pxJoint {
        constructor() {
            super(...arguments);
            this._axis = new Laya.Vector3(1, 0, 0);
            this._SecondaryAxis = new Laya.Vector3(0, 1, 0);
            this._axisRotationQuaternion = new Laya.Quaternion();
        }
        _createJoint() {
            const transform = pxJoint._tempTransform0;
            this._localPos.cloneTo(transform.translation);
            const transform1 = pxJoint._tempTransform1;
            this._connectlocalPos.cloneTo(transform1.translation);
            this._pxJoint = pxPhysicsCreateUtil._pxPhysics.createD6Joint(this._collider._pxActor, transform.translation, transform.rotation, this._connectCollider._pxActor, transform1.translation, transform1.rotation);
            this._initAllConstrainInfo();
            this._pxJoint.setUUID(this._id);
        }
        _initAllConstrainInfo() {
            this.setAxis(this._axis, this._SecondaryAxis);
            this.setMotion(Laya.D6Axis.eFREE, Laya.D6MotionType.eX);
            this.setMotion(Laya.D6Axis.eFREE, Laya.D6MotionType.eY);
            this.setMotion(Laya.D6Axis.eFREE, Laya.D6MotionType.eZ);
            this.setMotion(Laya.D6Axis.eFREE, Laya.D6MotionType.eTWIST);
            this.setMotion(Laya.D6Axis.eFREE, Laya.D6MotionType.eSWING1);
            this.setMotion(Laya.D6Axis.eFREE, Laya.D6MotionType.eSWING2);
        }
        _setLocalPose(actor, position) {
            this._pxJoint && this._pxJoint.setLocalPose(actor, position, this._axisRotationQuaternion);
        }
        setAxis(axis, secendary) {
            this._axis = axis;
            this._SecondaryAxis = secendary;
            const xAxis = pxD6Joint.tempV3;
            const axisRotationQuaternion = this._axisRotationQuaternion;
            xAxis.set(1, 0, 0);
            axis = axis.normalize();
            const angle = Math.acos(Laya.Vector3.dot(xAxis, axis));
            Laya.Vector3.cross(xAxis, axis, xAxis);
            Laya.Quaternion.rotationAxisAngle(xAxis, angle, axisRotationQuaternion);
            this._setLocalPose(0, this._localPos);
        }
        setMotion(axis, motionType) {
            this._pxJoint && this._pxJoint.setMotion(motionType, axis);
        }
        setDistanceLimit(limit, bounceness, bounceThreshold, spring, damp) {
            this._pxJoint && this._pxJoint.setDistanceLimit(limit, bounceness, bounceThreshold, spring, damp);
        }
        setLinearLimit(linearAxis, upper, lower, bounceness, bounceThreshold, spring, damping) {
            this._pxJoint && this._pxJoint.setLinearLimit(linearAxis, lower, upper, bounceness, bounceThreshold, spring, damping);
        }
        setTwistLimit(upper, lower, bounceness, bounceThreshold, spring, damping) {
            this._pxJoint && this._pxJoint.setTwistLimit(lower, upper, bounceness, bounceThreshold, spring, damping);
        }
        setSwingLimit(yAngle, zAngle, bounceness, bounceThreshold, spring, damping) {
            this._pxJoint && this._pxJoint.setSwingLimit(yAngle, zAngle, bounceness, bounceThreshold, spring, damping);
        }
        setDrive(index, stiffness, damping, forceLimit) {
            let acceleration = exports.PxD6JointDriveFlag.eACCELERATION;
            this._pxJoint && this._pxJoint.setDrive(index, stiffness, damping, forceLimit, acceleration);
        }
        setDriveTransform(position, rotate) {
            this._pxJoint && this._pxJoint.setDrivePosition(position, rotate);
        }
        setDriveVelocity(position, angular) {
            this._pxJoint && this._pxJoint.setDriveVelocity(position, angular);
        }
        getTwistAngle() {
            return this._pxJoint.getTwistAngle();
        }
        getSwingYAngle() {
            return this._pxJoint.getSwingYAngle();
        }
        getSwingZAngle() {
            return this._pxJoint.getSwingZAngle();
        }
        destroy() {
            this._pxJoint && this._pxJoint.release();
            super.destroy();
        }
    }
    pxD6Joint.tempV3 = new Laya.Vector3();

    class pxDistanceJoint extends pxJoint {
        _createJoint() {
            const transform = pxJoint._tempTransform0;
            this._localPos.cloneTo(transform.translation);
            const transform1 = pxJoint._tempTransform1;
            this._connectlocalPos.cloneTo(transform1.translation);
            this._pxJoint = pxPhysicsCreateUtil._pxPhysics.createDistanceJoint(this._collider._pxActor, transform.translation, transform.rotation, this._connectCollider._pxActor, transform1.translation, transform1.rotation);
            this._pxJoint.setUUID(this._id);
            this._pxJoint.setDistanceJointFlag(2, true);
            this._pxJoint.setDistanceJointFlag(4, true);
            this._pxJoint.setDistanceJointFlag(8, true);
        }
        setMinDistance(distance) {
            this._pxJoint && this._pxJoint.setMinDistance(distance);
        }
        setMaxDistance(distance) {
            this._pxJoint && this._pxJoint.setMaxDistance(distance);
        }
        setConnectDistance(distance) {
            this._pxJoint && this._pxJoint.setConnectDistance(distance);
        }
        setTolerance(tolerance) {
            this._pxJoint && this._pxJoint.setTolerance(tolerance);
        }
        setStiffness(stiffness) {
            this._pxJoint && this._pxJoint.setStiffness(stiffness);
        }
        setDamping(damping) {
            this._pxJoint && this._pxJoint.setDamping(damping);
        }
        destroy() {
            this._pxJoint && this._pxJoint.release();
            super.destroy();
        }
    }

    exports.PxRevoluteJointFlag = void 0;
    (function (PxRevoluteJointFlag) {
        PxRevoluteJointFlag[PxRevoluteJointFlag["eLIMIT_ENABLED"] = 1] = "eLIMIT_ENABLED";
        PxRevoluteJointFlag[PxRevoluteJointFlag["eDRIVE_ENABLED"] = 2] = "eDRIVE_ENABLED";
        PxRevoluteJointFlag[PxRevoluteJointFlag["eDRIVE_FREESPIN"] = 4] = "eDRIVE_FREESPIN";
    })(exports.PxRevoluteJointFlag || (exports.PxRevoluteJointFlag = {}));
    class pxRevoluteJoint extends pxJoint {
        constructor() {
            super(...arguments);
            this._axisRotationQuaternion = new Laya.Quaternion();
            this._velocity = new Laya.Vector3();
            this._lowerLimit = -Math.PI / 2;
            this._uperLimit = Math.PI / 2;
            this._bouncenciness = 0;
            this._bouncenMinVelocity = 0;
            this._contactDistance = 0;
            this._enableLimit = false;
        }
        _createJoint() {
            const transform = pxJoint._tempTransform0;
            this._localPos.cloneTo(transform.translation);
            const transform1 = pxJoint._tempTransform1;
            this._connectlocalPos.cloneTo(transform1.translation);
            this._pxJoint = pxPhysicsCreateUtil._pxPhysics.createRevoluteJoint(this._collider._pxActor, transform.translation, transform.rotation, this._connectCollider._pxActor, transform1.translation, transform1.rotation);
            this._pxJoint.setUUID(this._id);
        }
        _setLocalPose(actor, position) {
            this._pxJoint && this._pxJoint.setLocalPose(actor, position, this._axisRotationQuaternion);
        }
        _setRevoluteJointFlag(flag, value) {
            this._pxJoint && this._pxJoint.setRevoluteJointFlag(flag, value);
        }
        _setLimit() {
            this._enableLimit && this._pxJoint && this._pxJoint.setHardLimit(this._lowerLimit, this._uperLimit, this._contactDistance);
        }
        setLowerLimit(lowerLimit) {
            if (this._lowerLimit == lowerLimit)
                return;
            this._lowerLimit = lowerLimit;
            this._setLimit();
        }
        setUpLimit(value) {
            if (this._uperLimit == value || !this._enableLimit)
                return;
            this._uperLimit = value;
            this._setLimit();
        }
        setBounceness(value) {
            if (this._bouncenciness == value)
                return;
            this._bouncenciness = value;
            this._setLimit();
        }
        setBouncenMinVelocity(value) {
            if (this._bouncenMinVelocity == value)
                return;
            this._bouncenMinVelocity = value;
            this._setLimit();
        }
        setContactDistance(value) {
            if (this._contactDistance == value)
                return;
            this._contactDistance = value;
            this._setLimit();
        }
        enableLimit(value) {
            this._enableLimit = value;
            this._setRevoluteJointFlag(exports.PxRevoluteJointFlag.eLIMIT_ENABLED, value);
            if (this._enableLimit)
                this._setLimit();
        }
        enableDrive(value) {
            this._setRevoluteJointFlag(exports.PxRevoluteJointFlag.eDRIVE_ENABLED, value);
        }
        enableFreeSpin(value) {
            this._setRevoluteJointFlag(exports.PxRevoluteJointFlag.eDRIVE_FREESPIN, value);
        }
        setAxis(value) {
            const xAxis = pxRevoluteJoint._xAxis;
            const axisRotationQuaternion = this._axisRotationQuaternion;
            xAxis.set(1, 0, 0);
            value = value.normalize();
            const angle = Math.acos(Laya.Vector3.dot(xAxis, value));
            Laya.Vector3.cross(xAxis, value, xAxis);
            Laya.Quaternion.rotationAxisAngle(xAxis, angle, axisRotationQuaternion);
            this._setLocalPose(0, this._localPos);
        }
        getAngle() {
            return this._pxJoint.getAngle();
        }
        getVelocity() {
            const velocity = this._velocity;
            const getVel = this._pxJoint.getVelocity();
            velocity.set(getVel.x, getVel.y, getVel.z);
            return velocity;
        }
        setDriveVelocity(velocity) {
            this._pxJoint && this._pxJoint.setDriveVelocity(velocity, true);
        }
        setDriveForceLimit(limit) {
            this._pxJoint && this._pxJoint.setDriveForceLimit(limit);
        }
        destroy() {
            this._pxJoint && this._pxJoint.release();
            super.destroy();
        }
    }
    pxRevoluteJoint._xAxis = new Laya.Vector3(1, 0, 0);

    class pxBoxColliderShape extends pxColliderShape {
        constructor() {
            super();
            this._size = new Laya.Vector3(0.5, 0.5, 0.5);
            this._pxGeometry = new pxPhysicsCreateUtil._physX.PxBoxGeometry(this._size.x / 2, this._size.y / 2, this._size.z / 2);
            this._createShape();
        }
        setSize(size) {
            const tempExtents = pxBoxColliderShape._tempHalfExtents;
            size.cloneTo(this._size);
            tempExtents.setValue(this._size.x * 0.5 * this._scale.x, this._size.y * 0.5 * this._scale.y, this._size.z * 0.5 * this._scale.z);
            this._pxGeometry.halfExtents = tempExtents;
            this._pxShape && this._pxShape.setGeometry(this._pxGeometry);
        }
        setOffset(position) {
            super.setOffset(position);
            this.setSize(this._size);
        }
        destroy() {
            super.destroy();
            this._size = null;
        }
    }
    pxBoxColliderShape._tempHalfExtents = new Laya.Vector3();

    var ColliderShapeUpAxis;
    (function (ColliderShapeUpAxis) {
        ColliderShapeUpAxis[ColliderShapeUpAxis["X"] = 0] = "X";
        ColliderShapeUpAxis[ColliderShapeUpAxis["Y"] = 1] = "Y";
        ColliderShapeUpAxis[ColliderShapeUpAxis["Z"] = 2] = "Z";
    })(ColliderShapeUpAxis || (ColliderShapeUpAxis = {}));
    class pxCapsuleColliderShape extends pxColliderShape {
        constructor() {
            super();
            this._radius = 0.25;
            this._halfHeight = 0.5;
            this._rotation = new Laya.Quaternion(0, 0, 0, 1);
            this._upAxis = ColliderShapeUpAxis.Y;
            this._pxGeometry = new pxPhysicsCreateUtil._physX.PxCapsuleGeometry(this._radius, this._halfHeight);
            this._createShape();
        }
        _setCapsuleRotation() {
            pxColliderShape.transform.rotation.setValue(this._rotation.x, this._rotation.y, this._rotation.z, this._rotation.w);
            this._pxShape.setLocalPose(pxColliderShape.transform);
        }
        addToActor(collider) {
            super.addToActor(collider);
            this._setCapsuleRotation();
        }
        setRadius(radius) {
            this._radius = radius;
            switch (this._upAxis) {
                case ColliderShapeUpAxis.X:
                    this._pxGeometry.radius = this._radius * Math.max(this._scale.y, this._scale.z);
                    break;
                case ColliderShapeUpAxis.Y:
                    this._pxGeometry.radius = this._radius * Math.max(this._scale.x, this._scale.z);
                    break;
                case ColliderShapeUpAxis.Z:
                    this._pxGeometry.radius = this._radius * Math.max(this._scale.x, this._scale.y);
                    break;
            }
            this._pxShape.setGeometry(this._pxGeometry);
        }
        setHeight(height) {
            this._halfHeight = (height - this._radius * 2) * 0.5;
            switch (this._upAxis) {
                case ColliderShapeUpAxis.X:
                    this._pxGeometry.halfHeight = this._halfHeight * this._scale.x;
                    break;
                case ColliderShapeUpAxis.Y:
                    this._pxGeometry.halfHeight = this._halfHeight * this._scale.y;
                    break;
                case ColliderShapeUpAxis.Z:
                    this._pxGeometry.halfHeight = this._halfHeight * this._scale.z;
                    break;
            }
            this._pxShape.setGeometry(this._pxGeometry);
        }
        setUpAxis(upAxis) {
            if (this._pxShape && this._upAxis == upAxis)
                return;
            this._upAxis = upAxis;
            this.setHeight((this._halfHeight + this._radius) * 2);
            this.setRadius(this._radius);
        }
        setOffset(position) {
            super.setOffset(position);
            this.setHeight((this._halfHeight + this._radius) * 2);
            this.setRadius(this._radius);
        }
        destroy() {
            super.destroy();
            this._radius = null;
            this._halfHeight = null;
            this._upAxis = null;
        }
    }

    exports.PxConvexFlag = void 0;
    (function (PxConvexFlag) {
        PxConvexFlag[PxConvexFlag["e16_BIT_INDICES"] = 1] = "e16_BIT_INDICES";
        PxConvexFlag[PxConvexFlag["eCOMPUTE_CONVEX"] = 2] = "eCOMPUTE_CONVEX";
        PxConvexFlag[PxConvexFlag["eCHECK_ZERO_AREA_TRIANGLES"] = 4] = "eCHECK_ZERO_AREA_TRIANGLES";
        PxConvexFlag[PxConvexFlag["eQUANTIZE_INPUT"] = 8] = "eQUANTIZE_INPUT";
        PxConvexFlag[PxConvexFlag["eDISABLE_MESH_VALIDATION"] = 16] = "eDISABLE_MESH_VALIDATION";
        PxConvexFlag[PxConvexFlag["ePLANE_SHIFTING"] = 32] = "ePLANE_SHIFTING";
        PxConvexFlag[PxConvexFlag["eFAST_INERTIA_COMPUTATION"] = 64] = "eFAST_INERTIA_COMPUTATION";
        PxConvexFlag[PxConvexFlag["eGPU_COMPATIBLE"] = 128] = "eGPU_COMPATIBLE";
        PxConvexFlag[PxConvexFlag["eSHIFT_VERTICES"] = 256] = "eSHIFT_VERTICES";
    })(exports.PxConvexFlag || (exports.PxConvexFlag = {}));
    exports.PxConvexMeshGeometryFlag = void 0;
    (function (PxConvexMeshGeometryFlag) {
        PxConvexMeshGeometryFlag[PxConvexMeshGeometryFlag["eTIGHT_BOUNDS"] = 1] = "eTIGHT_BOUNDS";
    })(exports.PxConvexMeshGeometryFlag || (exports.PxConvexMeshGeometryFlag = {}));
    exports.PxMeshGeometryFlag = void 0;
    (function (PxMeshGeometryFlag) {
        PxMeshGeometryFlag[PxMeshGeometryFlag["eTIGHT_BOUNDS"] = 1] = "eTIGHT_BOUNDS";
        PxMeshGeometryFlag[PxMeshGeometryFlag["eDOUBLE_SIDED"] = 2] = "eDOUBLE_SIDED";
    })(exports.PxMeshGeometryFlag || (exports.PxMeshGeometryFlag = {}));
    class pxMeshColliderShape extends pxColliderShape {
        constructor() {
            super();
            this._limitvertex = 255;
            this._convex = false;
            this._meshScale = new pxPhysicsCreateUtil._physX.PxMeshScale(Laya.Vector3.ONE, Laya.Quaternion.DEFAULT);
            this._id = pxColliderShape._pxShapeID++;
            this._pxMaterials[0] = new pxPhysicsMaterial();
        }
        _getMeshPosition() {
            let posArray = new Array();
            this._mesh.getPositions(posArray);
            if (this._convex && posArray.length > this._limitvertex) {
                console.warn("MeshColliderShape: The number of vertices exceeds the limit, please reduce the number of vertices.");
            }
            let vecpointer = new pxPhysicsCreateUtil._physX.PxVec3Vector();
            posArray.forEach((vec, index) => {
                vecpointer.push_back(vec);
            });
            return vecpointer;
        }
        _getIndices() {
            let indexCount = this._mesh.indexCount;
            let indices = this._mesh.getIndices();
            let traCount = indexCount / 3;
            let data = null;
            if (indices instanceof Uint32Array) {
                data = pxPhysicsCreateUtil.createUint32Array(indexCount);
            }
            else {
                data = pxPhysicsCreateUtil.createUint16Array(indexCount);
            }
            for (var i = 0; i < traCount; i++) {
                let index = i * 3;
                data.buffer[index] = indices[index];
                data.buffer[index + 1] = indices[index + 2];
                data.buffer[index + 2] = indices[index + 1];
            }
            return data;
        }
        _createConvexMeshGeometry() {
            if (!this._mesh)
                return;
            if (!this._mesh._convexMesh) {
                let vecpointer = this._getMeshPosition();
                this._mesh._convexMesh = pxPhysicsCreateUtil._physX.createConvexMeshFromBuffer(vecpointer, pxPhysicsCreateUtil._pxPhysics, this._limitvertex, pxPhysicsCreateUtil._tolerancesScale, exports.PxConvexFlag.eCOMPUTE_CONVEX);
                vecpointer.delete();
            }
            let flags = new pxPhysicsCreateUtil._physX.PxConvexMeshGeometryFlags(exports.PxConvexMeshGeometryFlag.eTIGHT_BOUNDS);
            this._pxGeometry = new pxPhysicsCreateUtil._physX.PxConvexMeshGeometry(this._mesh._convexMesh, this._meshScale, flags);
            if (this._pxShape && this._pxCollider)
                this._pxCollider._pxActor.detachShape(this._pxShape, true);
            else if (this._pxShape) {
                this._pxShape.release();
            }
            this._createShape();
        }
        _createTrianggleMeshGeometry() {
            if (!this._mesh)
                return;
            if (!this._mesh._triangleMesh) {
                let vecpointer = this._getMeshPosition();
                let indicesData = this._getIndices();
                this._mesh._triangleMesh = pxPhysicsCreateUtil._physX.createTriMesh(vecpointer, indicesData.ptr, this._mesh.indexCount, this._mesh.indexFormat == Laya.IndexFormat.UInt32 ? false : true, pxPhysicsCreateUtil._tolerancesScale, pxPhysicsCreateUtil._pxPhysics);
                vecpointer.delete();
                pxPhysicsCreateUtil.freeBuffer(indicesData);
            }
            let flags = new pxPhysicsCreateUtil._physX.PxMeshGeometryFlags(exports.PxMeshGeometryFlag.eTIGHT_BOUNDS);
            this._pxGeometry = new pxPhysicsCreateUtil._physX.PxTriangleMeshGeometry(this._mesh._triangleMesh, this._meshScale, flags);
            if (this._pxShape && this._pxCollider)
                this._pxCollider._pxActor.detachShape(this._pxShape, true);
            else if (this._pxShape) {
                this._pxShape.release();
            }
            this._createShape();
        }
        _createShape() {
            if (this._id == null) {
                this._id = pxColliderShape._pxShapeID++;
            }
            if (!this._pxMaterials[0]) {
                this._pxMaterials[0] = new pxPhysicsMaterial();
            }
            this._pxShape = pxPhysicsCreateUtil._pxPhysics.createShape(this._pxGeometry, this._pxMaterials[0]._pxMaterial, true, new pxPhysicsCreateUtil._physX.PxShapeFlags(this._shapeFlags));
            this._pxShape.setUUID(this._id);
            pxColliderShape._shapePool.set(this._id, this);
            this._reConfigShape();
        }
        _reConfigShape() {
            if (this._pxCollider) {
                this.setSimulationFilterData(this._pxCollider._collisionGroup, this._pxCollider._canCollisionWith);
                this.setOffset(this._offset);
                this._pxCollider._pxActor.attachShape(this._pxShape);
            }
        }
        _setScale(scale) {
            if (this._pxShape && scale.equal(this._scale))
                return;
            scale.cloneTo(this._scale);
            this._meshScale.scale = this._scale;
            if (this._convex)
                this._createConvexMeshGeometry();
            else
                this._createTrianggleMeshGeometry();
        }
        setOffset(position) {
            if (!this._pxCollider)
                return;
            position.cloneTo(this._offset);
            this._setScale(this._pxCollider.owner.transform.getWorldLossyScale());
            if (this._pxShape) {
                const transform = pxColliderShape.transform;
                if (this._pxCollider.owner)
                    Laya.Vector3.multiply(position, this._scale, transform.translation);
                this._pxShape.setLocalPose(transform);
            }
        }
        setPhysicsMeshFromMesh(value) {
            this._mesh = value;
            this._convex = false;
            this._createTrianggleMeshGeometry();
        }
        setConvexMesh(value) {
            this._mesh = value;
            this._convex = true;
            this._createConvexMeshGeometry();
        }
        setLimitVertex(limit) {
            this._limitvertex = limit;
            if (this._convex)
                this._createConvexMeshGeometry();
        }
    }

    class pxHeightFieldShape extends pxColliderShape {
        constructor() {
            super();
            this._numRows = 2;
            this._numCols = 2;
        }
        getHeightData() {
            this._minHeight = Number.MAX_VALUE;
            this._maxHeight = -Number.MAX_VALUE;
            this._heightData.forEach((value) => {
                this._maxHeight = Math.max(value, this._maxHeight);
                this._minHeight = Math.min(value, this._minHeight);
            });
            let deltaHeight = this._maxHeight - this._minHeight;
            let data = pxPhysicsCreateUtil.createFloat32Array(this._heightData.length);
            this._heightData.forEach((value, index) => {
                data.buffer[index] = (value - this._minHeight) / deltaHeight;
            });
            return data;
        }
        getFlagData() {
            let indexCount = this._numRows * this._numCols;
            let data = pxPhysicsCreateUtil.createUint8Array(indexCount);
            if (this._flag) {
                data.buffer.set(this._flag);
            }
            else {
                data.buffer.fill(0);
            }
            return data;
        }
        _createHeightField() {
            let heightdata = this.getHeightData();
            let flagdata = this.getFlagData();
            this._heightFiled = pxPhysicsCreateUtil._physX.createHeightField(this._numRows, this._numCols, heightdata.ptr, flagdata.ptr, pxPhysicsCreateUtil._allocator, pxPhysicsCreateUtil._tolerancesScale, pxPhysicsCreateUtil._pxPhysics);
            let heightScale = (this._scale.y * (this._maxHeight - this._minHeight)) / 32767;
            let flags = new pxPhysicsCreateUtil._physX.PxMeshGeometryFlags(exports.PxMeshGeometryFlag.eTIGHT_BOUNDS);
            this._pxGeometry = new pxPhysicsCreateUtil._physX.PxHeightFieldGeometry(this._heightFiled, flags, heightScale, this._scale.x, this._scale.z);
            this._pxShape && this._pxCollider._pxActor.detachShape(this._pxShape, true);
            this._createShape();
            pxPhysicsCreateUtil.freeBuffer(heightdata);
            pxPhysicsCreateUtil.freeBuffer(flagdata);
        }
        setHeightFieldData(numRows, numCols, heightData, flag, scale) {
            this._numRows = numRows;
            this._numCols = numCols;
            this._heightData = heightData;
            this._flag = flag;
            scale.cloneTo(this._scale);
            this._createHeightField();
        }
        getNbRows() {
            return this._heightFiled.getNbRows();
        }
        getNbColumns() {
            return this._heightFiled.getNbColumns();
        }
        getHeight(rows, cols) {
            return this._heightFiled.getHeight(rows, cols);
        }
    }

    class pxSphereColliderShape extends pxColliderShape {
        constructor() {
            super();
            this._radius = 0.5;
            this._pxGeometry = new pxPhysicsCreateUtil._physX.PxSphereGeometry(this._radius);
            this._createShape();
        }
        setRadius(radius) {
            this._radius = radius;
            var maxScale = Math.max(this._scale.x, Math.max(this._scale.y, this._scale.z));
            this._pxGeometry.radius = this._radius * maxScale;
            this._pxShape.setGeometry(this._pxGeometry);
        }
        setOffset(position) {
            super.setOffset(position);
            this.setRadius(this._radius);
        }
        destroy() {
            super.destroy();
            this._radius = null;
        }
    }

    exports.ControllerNonWalkableMode = void 0;
    (function (ControllerNonWalkableMode) {
        ControllerNonWalkableMode[ControllerNonWalkableMode["ePREVENT_CLIMBING"] = 0] = "ePREVENT_CLIMBING";
        ControllerNonWalkableMode[ControllerNonWalkableMode["ePREVENT_CLIMBING_AND_FORCE_SLIDING"] = 1] = "ePREVENT_CLIMBING_AND_FORCE_SLIDING";
    })(exports.ControllerNonWalkableMode || (exports.ControllerNonWalkableMode = {}));
    exports.ECharacterCollisionFlag = void 0;
    (function (ECharacterCollisionFlag) {
        ECharacterCollisionFlag[ECharacterCollisionFlag["eCOLLISION_SIDES"] = 1] = "eCOLLISION_SIDES";
        ECharacterCollisionFlag[ECharacterCollisionFlag["eCOLLISION_UP"] = 2] = "eCOLLISION_UP";
        ECharacterCollisionFlag[ECharacterCollisionFlag["eCOLLISION_DOWN"] = 4] = "eCOLLISION_DOWN";
    })(exports.ECharacterCollisionFlag || (exports.ECharacterCollisionFlag = {}));
    class pxCharactorCollider extends pxCollider {
        constructor(manager) {
            super(manager);
            this._radius = 0.5;
            this._height = 2;
            this._localOffset = new Laya.Vector3();
            this._upDirection = new Laya.Vector3(0, 1, 0);
            this._stepOffset = 0;
            this._slopeLimit = 0;
            this._contactOffset = 0;
            this._minDistance = 0;
            this._nonWalkableMode = exports.ControllerNonWalkableMode.ePREVENT_CLIMBING_AND_FORCE_SLIDING;
            this._gravity = new Laya.Vector3(0, -9.81, 0);
            this._characterCollisionFlags = 0;
            this._pushForce = 10;
            this._characterEvents = [];
            this._type = exports.pxColliderType.CharactorCollider;
            Laya.Physics3DStatInfo.addStatisticsInfo(Laya.EPhysicsStatisticsInfo.C_PhysicaCharacterController, 1);
        }
        setColliderShape(shape) {
            if (shape == this._shape)
                return;
            this._shape = shape;
            if (shape) {
                if (this._pxActor) {
                    if (this.componentEnable) {
                        this._physicsManager.addCollider(this);
                    }
                }
                else {
                    this._shape = null;
                }
            }
            else {
                if (this._isSimulate) {
                    this._physicsManager.removeCollider(this);
                }
            }
        }
        _getNodeScale() {
            return this.owner ? this.owner.transform.getWorldLossyScale() : Laya.Vector3.ONE;
        }
        _initCollider() {
            this._pxActor = pxPhysicsCreateUtil._pxPhysics.createRigidDynamic(this._transformTo(new Laya.Vector3(), new Laya.Quaternion()));
        }
        getCapable(value) {
            return pxCharactorCollider.getCharacterCapable(value);
        }
        static getCharacterCapable(value) {
            return pxCharactorCollider._characterCapableMap.get(value);
        }
        static initCapable() {
            this._characterCapableMap = new Map();
            this._characterCapableMap.set(Laya.ECharacterCapable.Charcater_Gravity, true);
            this._characterCapableMap.set(Laya.ECharacterCapable.Charcater_CollisionGroup, true);
            this._characterCapableMap.set(Laya.ECharacterCapable.Charcater_WorldPosition, true);
            this._characterCapableMap.set(Laya.ECharacterCapable.Charcater_Move, true);
            this._characterCapableMap.set(Laya.ECharacterCapable.Charcater_Jump, true);
            this._characterCapableMap.set(Laya.ECharacterCapable.Charcater_StepOffset, true);
            this._characterCapableMap.set(Laya.ECharacterCapable.Character_UpDirection, true);
            this._characterCapableMap.set(Laya.ECharacterCapable.Character_FallSpeed, true);
            this._characterCapableMap.set(Laya.ECharacterCapable.Character_SlopeLimit, true);
            this._characterCapableMap.set(Laya.ECharacterCapable.Character_PushForce, true);
            this._characterCapableMap.set(Laya.ECharacterCapable.Character_Radius, true);
            this._characterCapableMap.set(Laya.ECharacterCapable.Character_Height, true);
            this._characterCapableMap.set(Laya.ECharacterCapable.Character_offset, true);
            this._characterCapableMap.set(Laya.ECharacterCapable.Character_Skin, true);
            this._characterCapableMap.set(Laya.ECharacterCapable.Character_minDistance, true);
            this._characterCapableMap.set(Laya.ECharacterCapable.Character_EventFilter, true);
            this._characterCapableMap.set(Laya.ECharacterCapable.Character_SimulateGravity, true);
            this._characterCapableMap.set(Laya.ECharacterCapable.Character_IsOnGround, true);
        }
        _createController() {
            let desc;
            const pxPhysics = pxPhysicsCreateUtil._physX;
            desc = new pxPhysics.PxCapsuleControllerDesc();
            this._characterCollisionFlags = new pxPhysics.PxControllerCollisionFlags(exports.ECharacterCollisionFlag.eCOLLISION_DOWN);
            let scale = this._getNodeScale();
            desc.radius = this._radius * Math.max(scale.x, scale.z);
            desc.height = this._height * scale.y;
            desc.climbingMode = 1;
            desc.setreportCallBackBehavior();
            this._pxNullShape = this._pxNullShape ? this._pxNullShape : new pxCapsuleColliderShape();
            desc.setMaterial(this._pxNullShape._pxMaterials[0]._pxMaterial);
            this._pxNullShape._pxCollider = this;
            this._pxController = this._physicsManager._pxcontrollerManager.createController(desc);
            this._pxController.setShapeID(this._pxNullShape._id);
            this.setRadius(this._radius);
            this.setHeight(this._height * 2);
            this.setPosition(this.owner.transform.position);
            this.setStepOffset(this._stepOffset);
            this.setUpDirection(this._upDirection);
            this.setSlopeLimit(this._slopeLimit);
            this.setGravity(this._gravity);
            this.setPushForce(this._pushForce);
            this.setSkinWidth(this._contactOffset);
            this.setNonWalkableMode(this._nonWalkableMode);
            this.setEventFilter(this._characterEvents);
            this._setCharacterCollisonFlag(exports.ECharacterCollisionFlag.eCOLLISION_SIDES);
        }
        _setCharacterCollisonFlag(value) {
            this._pxController && this._pxController.isSetControllerCollisionFlag(this._characterCollisionFlags, value);
        }
        _releaseController() {
            if (this._pxController) {
                this._pxController.release();
                this._pxController = null;
            }
        }
        move(disp) {
            return this._pxController && this._pxController.move(disp, this._minDistance, 1 / 60);
        }
        jump(velocity) {
            return this._pxController && this._pxController.move(velocity, this._minDistance, 1 / 60);
        }
        isGrounded() {
            let flag = this._pxController && this._pxController.move(new Laya.Vector3(0, -0.1, 0), this._minDistance, 1 / 60);
            return (flag & exports.ECharacterCollisionFlag.eCOLLISION_DOWN) != 0;
        }
        setStepOffset(offset) {
            this._stepOffset = offset;
            this._pxController && this._pxController.setStepOffset(this._stepOffset);
        }
        setUpDirection(up) {
            up.cloneTo(this._upDirection);
            this._pxController && this._pxController.setUpDirection(up);
        }
        setSlopeLimit(value) {
            this._slopeLimit = value;
            this._pxController && this._pxController.setSlopeLimit((value / 180) * Math.PI);
        }
        setGravity(value) {
            value.cloneTo(this._gravity);
        }
        setPushForce(value) {
            this._pushForce = value;
            this._pxController && this._pxController.setPushForce(this._pushForce);
        }
        getWorldTransform() {
            const v3 = this._pxController.getPosition();
            _tempTranslation.set(v3.x + this._localOffset.x, v3.y - this._height + this._localOffset.y, v3.z + this._localOffset.z);
            this.owner.transform.position = _tempTranslation;
        }
        setSkinWidth(width) {
            this._contactOffset = width;
            this._pxController && this._pxController.setContactOffset(this._contactOffset);
        }
        destroy() {
            this._releaseController();
        }
        setPosition(value) {
            this._pxController && this._pxController.setPosition(value);
        }
        getPosition() {
            const v3 = this._pxController.getPosition();
            pxCharactorCollider.tempV3.set(v3.x, v3.y, v3.z);
            return pxCharactorCollider.tempV3;
        }
        setShapelocalOffset(value) {
            this._localOffset = value;
        }
        setHeight(value) {
            this._height = value * 0.5;
            let scale = this._getNodeScale();
            this._pxController && this._pxController.resize(this._height * scale.y);
        }
        setRadius(value) {
            this._radius = value;
            let scale = this._getNodeScale();
            this._pxController && this._pxController.setRadius(this._radius * Math.max(scale.x, scale.z));
        }
        setminDistance(value) {
            this._minDistance = value;
        }
        setNonWalkableMode(value) {
            this._nonWalkableMode = value;
            this._pxController && this._pxController.setNonWalkableMode(this._nonWalkableMode);
        }
        setEventFilter(events) {
            this._characterEvents = events;
            if (!this._pxController)
                return;
            let flag = exports.partFlag.eCONTACT_DEFAULT;
            for (let i = 0, j = events.length; i < j; i++) {
                let value = events[i];
                if (value == Laya.Event.COLLISION_ENTER) {
                    flag = flag | exports.partFlag.eNOTIFY_TOUCH_PERSISTS | exports.partFlag.eNOTIFY_CONTACT_POINTS;
                }
                if (value == Laya.Event.COLLISION_STAY) {
                    flag = flag | exports.partFlag.eNOTIFY_TOUCH_PERSISTS;
                }
                if (value == Laya.Event.COLLISION_EXIT) {
                    flag = flag | exports.partFlag.eNOTIFY_TOUCH_PERSISTS | exports.partFlag.eNOTIFY_TOUCH_LOST;
                }
            }
            this._pxController && this._pxController.setEventFilter(flag);
        }
        release() {
            if (this._pxController) {
                this._pxController.release();
                this._pxController = null;
            }
        }
    }
    pxCharactorCollider.tempV3 = new Laya.Vector3();
    const _tempTranslation = new Laya.Vector3();

    class pxPhysicsCreateUtil {
        initPhysicsCapable() {
            this._physicsEngineCapableMap = new Map();
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_Gravity, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_StaticCollider, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_DynamicCollider, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_CharacterCollider, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_BoxColliderShape, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_SphereColliderShape, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_CapsuleColliderShape, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_CylinderColliderShape, false);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_ConeColliderShape, false);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_MeshColliderShape, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.physics_heightFieldColliderShape, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_CompoundColliderShape, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_Joint, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_FixedJoint, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_SpringJoint, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_HingeJoint, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_D6Joint, true);
            this._physicsEngineCapableMap.set(Laya.EPhysicsCapable.Physics_CreateCorveMesh, true);
        }
        getPhysicsCapable(value) {
            return this._physicsEngineCapableMap.get(value);
        }
        initialize() {
            return window.PHYSX().then((PHYSX) => {
                this._init(PHYSX);
                console.log("PhysX loaded.");
                this.initPhysicsCapable();
                pxDynamicCollider.initCapable();
                pxStaticCollider.initCapable();
                pxCharactorCollider.initCapable();
                return Promise.resolve();
            });
        }
        _physxPVDSocketConnect(physX, pxFoundation) {
            var socket;
            var queue = [];
            const pvdTransport = physX.PxPvdTransport.implement({
                connect: function () {
                    let url = 'ws://127.0.0.1:' + pxPhysicsCreateUtil._PxPvdPort;
                    socket = new WebSocket(url, ['binary']);
                    socket.onopen = (e) => {
                        console.log('Connected to PhysX Debugger');
                        queue.forEach(data => socket.send(data));
                        queue = [];
                    };
                    socket.onclose = () => {
                    };
                    return true;
                },
                disconnect: function () {
                    console.log("Socket disconnect");
                },
                isConnected: function () {
                },
                write: function (inBytes, inLength) {
                    const data = physX.HEAPU8.slice(inBytes, inBytes + inLength);
                    if (socket.readyState === WebSocket.OPEN) {
                        if (queue.length) {
                            queue.forEach(data => socket.send(data));
                            queue.length = 0;
                        }
                        socket.send(data);
                    }
                    else {
                        queue.push(data);
                    }
                    return true;
                }
            });
            const gPvd = physX.PxCreatePvd(pxFoundation);
            physX.MyCreatepvdTransport(pvdTransport, gPvd);
            pxPhysicsCreateUtil._pvd = gPvd;
            pxPhysicsCreateUtil._PxPvdTransport = pvdTransport;
            return gPvd;
        }
        _init(physX) {
            const version = physX.PX_PHYSICS_VERSION;
            const defaultErrorCallback = new physX.PxDefaultErrorCallback();
            const allocator = new physX.PxDefaultAllocator();
            const pxFoundation = physX.PxCreateFoundation(version, allocator, defaultErrorCallback);
            pxPhysicsCreateUtil._tolerancesScale = new physX.PxTolerancesScale();
            let pxPhysics;
            if (pxPhysicsCreateUtil._physXPVD) {
                let gPvd = this._physxPVDSocketConnect(physX, pxFoundation);
                pxPhysics = physX.CreatePVDPhysics(pxFoundation, pxPhysicsCreateUtil._tolerancesScale, true, gPvd);
                physX.PxInitExtensions(pxPhysics, gPvd);
            }
            else {
                pxPhysics = physX.CreateDefaultPhysics(pxFoundation, pxPhysicsCreateUtil._tolerancesScale);
                physX.InitDefaultExtensions(pxPhysics);
            }
            pxPhysicsCreateUtil._physX = physX;
            pxPhysicsCreateUtil._pxFoundation = pxFoundation;
            pxPhysicsCreateUtil._pxPhysics = pxPhysics;
            pxPhysicsCreateUtil._allocator = allocator;
        }
        createPhysicsManger(physicsSettings) {
            return new pxPhysicsManager(physicsSettings);
        }
        createDynamicCollider(manager) {
            return new pxDynamicCollider(manager);
        }
        createStaticCollider(manager) {
            return new pxStaticCollider(manager);
        }
        createCharacterController(manager) {
            return new pxCharactorCollider(manager);
        }
        createFixedJoint(manager) {
            return new pxFixedJoint(manager);
        }
        createHingeJoint(manager) {
            return new pxRevoluteJoint(manager);
        }
        createSpringJoint(manager) {
            return new pxDistanceJoint(manager);
        }
        createD6Joint(manager) {
            return new pxD6Joint(manager);
        }
        createBoxColliderShape() {
            return new pxBoxColliderShape();
        }
        createSphereColliderShape() {
            return new pxSphereColliderShape();
        }
        createPlaneColliderShape() {
            return null;
        }
        createCapsuleColliderShape() {
            return new pxCapsuleColliderShape();
        }
        createMeshColliderShape() {
            return new pxMeshColliderShape();
        }
        createCylinderColliderShape() {
            return null;
        }
        createConeColliderShape() {
            return null;
        }
        createHeightFieldShape() {
            return new pxHeightFieldShape();
        }
        createCompoundShape() {
            return new pxCompoundShape();
        }
        createCorveMesh(mesh) {
            if (mesh._convexMesh == null) {
                return null;
            }
            if (mesh.__convexMesh == null) {
                let convexMesh = mesh._convexMesh;
                let vertices = convexMesh.getVertices();
                let vertexCount = vertices.size();
                var vertexDeclaration = Laya.VertexMesh.getVertexDeclaration("POSITION");
                var vertexFloatStride = vertexDeclaration.vertexStride / 4;
                var vertice = new Float32Array(vertexCount * vertexFloatStride);
                for (var i = 0; i < vertexCount; i++) {
                    let index = i * 3;
                    let data = vertices.get(i);
                    vertice[index] = data.x;
                    vertice[index + 1] = data.y;
                    vertice[index + 2] = data.z;
                }
                let indexs = convexMesh.getIndexBuffer();
                let polygons = convexMesh.getPolygons();
                let triangles = [];
                for (var i = 0, n = polygons.size(); i < n;) {
                    let nbTris = polygons.get(i) - 2;
                    let mIndexBase = polygons.get(i + 1);
                    let vref0 = indexs.get(mIndexBase);
                    for (var j = 0; j < nbTris; j++) {
                        let vref1 = indexs.get(mIndexBase + j + 1);
                        let vref2 = indexs.get(mIndexBase + j + 2);
                        triangles.push(vref0, vref1, vref2);
                    }
                    i += 2;
                }
                mesh.__convexMesh = Laya.PrimitiveMesh._createMesh(vertexDeclaration, vertice, new Uint16Array(triangles));
            }
            return mesh.__convexMesh;
        }
        static createFloat32Array(length) {
            let ptr = this._physX._malloc(4 * length);
            const buffer = new Float32Array(this._physX.HEAPF32.buffer, ptr, length);
            return { ptr: ptr, buffer: buffer };
        }
        static createUint32Array(length) {
            let ptr = this._physX._malloc(4 * length);
            const buffer = new Uint32Array(this._physX.HEAPU32.buffer, ptr, length);
            return { ptr: ptr, buffer: buffer };
        }
        static createUint16Array(length) {
            let ptr = this._physX._malloc(2 * length);
            const buffer = new Uint16Array(this._physX.HEAPU16.buffer, ptr, length);
            return { ptr: ptr, buffer: buffer };
        }
        static createUint8Array(length) {
            let ptr = this._physX._malloc(length);
            const buffer = new Uint8Array(this._physX.HEAPU8.buffer, ptr, length);
            return { ptr: ptr, buffer: buffer };
        }
        static freeBuffer(data) {
            this._physX._free(data.ptr);
        }
    }
    pxPhysicsCreateUtil._physXPVD = false;
    pxPhysicsCreateUtil._PxPvdPort = 5425;
    Laya.Laya3D.PhysicsCreateUtil = new pxPhysicsCreateUtil();

    class pxSphereJoint extends pxJoint {
    }

    exports.pxBoxColliderShape = pxBoxColliderShape;
    exports.pxCapsuleColliderShape = pxCapsuleColliderShape;
    exports.pxCharactorCollider = pxCharactorCollider;
    exports.pxCollider = pxCollider;
    exports.pxColliderShape = pxColliderShape;
    exports.pxCollisionTool = pxCollisionTool;
    exports.pxCompoundShape = pxCompoundShape;
    exports.pxD6Joint = pxD6Joint;
    exports.pxDistanceJoint = pxDistanceJoint;
    exports.pxDynamicCollider = pxDynamicCollider;
    exports.pxFixedJoint = pxFixedJoint;
    exports.pxHeightFieldShape = pxHeightFieldShape;
    exports.pxJoint = pxJoint;
    exports.pxMeshColliderShape = pxMeshColliderShape;
    exports.pxPhysicsCreateUtil = pxPhysicsCreateUtil;
    exports.pxPhysicsManager = pxPhysicsManager;
    exports.pxPhysicsMaterial = pxPhysicsMaterial;
    exports.pxRevoluteJoint = pxRevoluteJoint;
    exports.pxSphereColliderShape = pxSphereColliderShape;
    exports.pxSphereJoint = pxSphereJoint;
    exports.pxStaticCollider = pxStaticCollider;

})(window.Laya = window.Laya || {}, Laya);
//# sourceMappingURL=laya.physX.js.map

if (window.conch && window.physx) {
	window.PHYSX = function(initialMemory, interactive) {
	var fake = {};
	fake.then = (complete) => {
		return complete(window.physx);
	};
	return fake;
	};
}
else {
var PHYSX = (() => {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  if (typeof __filename !== 'undefined') _scriptDir = _scriptDir || __filename;
  return (
function(PHYSX) {
  PHYSX = PHYSX || {};

var Module=typeof PHYSX!=="undefined"?PHYSX:{};var objAssign=Object.assign;var readyPromiseResolve,readyPromiseReject;Module["ready"]=new Promise(function(resolve,reject){readyPromiseResolve=resolve;readyPromiseReject=reject});if(!Object.getOwnPropertyDescriptor(Module["ready"],"_main")){Object.defineProperty(Module["ready"],"_main",{configurable:true,get:function(){abort("You are getting _main on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js")}});Object.defineProperty(Module["ready"],"_main",{configurable:true,set:function(){abort("You are setting _main on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js")}})}if(!Object.getOwnPropertyDescriptor(Module["ready"],"___getTypeName")){Object.defineProperty(Module["ready"],"___getTypeName",{configurable:true,get:function(){abort("You are getting ___getTypeName on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js")}});Object.defineProperty(Module["ready"],"___getTypeName",{configurable:true,set:function(){abort("You are setting ___getTypeName on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js")}})}if(!Object.getOwnPropertyDescriptor(Module["ready"],"___embind_register_native_and_builtin_types")){Object.defineProperty(Module["ready"],"___embind_register_native_and_builtin_types",{configurable:true,get:function(){abort("You are getting ___embind_register_native_and_builtin_types on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js")}});Object.defineProperty(Module["ready"],"___embind_register_native_and_builtin_types",{configurable:true,set:function(){abort("You are setting ___embind_register_native_and_builtin_types on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js")}})}if(!Object.getOwnPropertyDescriptor(Module["ready"],"_fflush")){Object.defineProperty(Module["ready"],"_fflush",{configurable:true,get:function(){abort("You are getting _fflush on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js")}});Object.defineProperty(Module["ready"],"_fflush",{configurable:true,set:function(){abort("You are setting _fflush on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js")}})}if(!Object.getOwnPropertyDescriptor(Module["ready"],"onRuntimeInitialized")){Object.defineProperty(Module["ready"],"onRuntimeInitialized",{configurable:true,get:function(){abort("You are getting onRuntimeInitialized on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js")}});Object.defineProperty(Module["ready"],"onRuntimeInitialized",{configurable:true,set:function(){abort("You are setting onRuntimeInitialized on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js")}})}var moduleOverrides=objAssign({},Module);var arguments_=[];var thisProgram="./this.program";var quit_=(status,toThrow)=>{throw toThrow};var ENVIRONMENT_IS_WEB=typeof window==="object";var ENVIRONMENT_IS_WORKER=typeof importScripts==="function";var ENVIRONMENT_IS_NODE=typeof process==="object"&&typeof process.versions==="object"&&typeof process.versions.node==="string";var ENVIRONMENT_IS_SHELL=!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_NODE&&!ENVIRONMENT_IS_WORKER;if(Module["ENVIRONMENT"]){throw new Error("Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -s ENVIRONMENT=web or -s ENVIRONMENT=node)")}var scriptDirectory="";function locateFile(path){if(Module["locateFile"]){return Module["locateFile"](path,scriptDirectory)}return scriptDirectory+path}var read_,readAsync,readBinary,setWindowTitle;function logExceptionOnExit(e){if(e instanceof ExitStatus)return;let toLog=e;if(e&&typeof e==="object"&&e.stack){toLog=[e,e.stack]}err("exiting due to exception: "+toLog)}var fs;var nodePath;var requireNodeFS;if(ENVIRONMENT_IS_NODE){if(!(typeof process==="object"&&typeof require==="function"))throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");if(ENVIRONMENT_IS_WORKER){scriptDirectory=require("path").dirname(scriptDirectory)+"/"}else{scriptDirectory=__dirname+"/"}requireNodeFS=function(){if(!nodePath){fs=require("fs");nodePath=require("path")}};read_=function shell_read(filename,binary){requireNodeFS();filename=nodePath["normalize"](filename);return fs.readFileSync(filename,binary?null:"utf8")};readBinary=function readBinary(filename){var ret=read_(filename,true);if(!ret.buffer){ret=new Uint8Array(ret)}assert(ret.buffer);return ret};readAsync=function readAsync(filename,onload,onerror){requireNodeFS();filename=nodePath["normalize"](filename);fs.readFile(filename,function(err,data){if(err)onerror(err);else onload(data.buffer)})};if(process["argv"].length>1){thisProgram=process["argv"][1].replace(/\\/g,"/")}arguments_=process["argv"].slice(2);process["on"]("uncaughtException",function(ex){if(!(ex instanceof ExitStatus)){throw ex}});process["on"]("unhandledRejection",function(reason){throw reason});quit_=((status,toThrow)=>{if(keepRuntimeAlive()){process["exitCode"]=status;throw toThrow}logExceptionOnExit(toThrow);process["exit"](status)});Module["inspect"]=function(){return"[Emscripten Module object]"}}else if(ENVIRONMENT_IS_SHELL){if(typeof process==="object"&&typeof require==="function"||typeof window==="object"||typeof importScripts==="function")throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");if(typeof read!="undefined"){read_=function shell_read(f){return read(f)}}readBinary=function readBinary(f){let data;if(typeof readbuffer==="function"){return new Uint8Array(readbuffer(f))}data=read(f,"binary");assert(typeof data==="object");return data};readAsync=function readAsync(f,onload,onerror){setTimeout(()=>onload(readBinary(f)),0)};if(typeof scriptArgs!="undefined"){arguments_=scriptArgs}else if(typeof arguments!="undefined"){arguments_=arguments}if(typeof quit==="function"){quit_=((status,toThrow)=>{logExceptionOnExit(toThrow);quit(status)})}if(typeof print!=="undefined"){if(typeof console==="undefined")console={};console.log=print;console.warn=console.error=typeof printErr!=="undefined"?printErr:print}}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){if(ENVIRONMENT_IS_WORKER){scriptDirectory=self.location.href}else if(typeof document!=="undefined"&&document.currentScript){scriptDirectory=document.currentScript.src}if(_scriptDir){scriptDirectory=_scriptDir}if(scriptDirectory.indexOf("blob:")!==0){scriptDirectory=scriptDirectory.substr(0,scriptDirectory.replace(/[?#].*/,"").lastIndexOf("/")+1)}else{scriptDirectory=""}if(!(typeof window==="object"||typeof importScripts==="function"))throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");{read_=function(url){var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.send(null);return xhr.responseText};if(ENVIRONMENT_IS_WORKER){readBinary=function(url){var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.responseType="arraybuffer";xhr.send(null);return new Uint8Array(xhr.response)}}readAsync=function(url,onload,onerror){var xhr=new XMLHttpRequest;xhr.open("GET",url,true);xhr.responseType="arraybuffer";xhr.onload=function(){if(xhr.status==200||xhr.status==0&&xhr.response){onload(xhr.response);return}onerror()};xhr.onerror=onerror;xhr.send(null)}}setWindowTitle=(title=>document.title=title)}else{throw new Error("environment detection error")}var out=Module["print"]||console.log.bind(console);var err=Module["printErr"]||console.warn.bind(console);objAssign(Module,moduleOverrides);moduleOverrides=null;if(Module["arguments"])arguments_=Module["arguments"];if(!Object.getOwnPropertyDescriptor(Module,"arguments")){Object.defineProperty(Module,"arguments",{configurable:true,get:function(){abort("Module.arguments has been replaced with plain arguments_ (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)")}})}if(Module["thisProgram"])thisProgram=Module["thisProgram"];if(!Object.getOwnPropertyDescriptor(Module,"thisProgram")){Object.defineProperty(Module,"thisProgram",{configurable:true,get:function(){abort("Module.thisProgram has been replaced with plain thisProgram (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)")}})}if(Module["quit"])quit_=Module["quit"];if(!Object.getOwnPropertyDescriptor(Module,"quit")){Object.defineProperty(Module,"quit",{configurable:true,get:function(){abort("Module.quit has been replaced with plain quit_ (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)")}})}assert(typeof Module["memoryInitializerPrefixURL"]==="undefined","Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead");assert(typeof Module["pthreadMainPrefixURL"]==="undefined","Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead");assert(typeof Module["cdInitializerPrefixURL"]==="undefined","Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead");assert(typeof Module["filePackagePrefixURL"]==="undefined","Module.filePackagePrefixURL option was removed, use Module.locateFile instead");assert(typeof Module["read"]==="undefined","Module.read option was removed (modify read_ in JS)");assert(typeof Module["readAsync"]==="undefined","Module.readAsync option was removed (modify readAsync in JS)");assert(typeof Module["readBinary"]==="undefined","Module.readBinary option was removed (modify readBinary in JS)");assert(typeof Module["setWindowTitle"]==="undefined","Module.setWindowTitle option was removed (modify setWindowTitle in JS)");assert(typeof Module["TOTAL_MEMORY"]==="undefined","Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY");if(!Object.getOwnPropertyDescriptor(Module,"read")){Object.defineProperty(Module,"read",{configurable:true,get:function(){abort("Module.read has been replaced with plain read_ (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)")}})}if(!Object.getOwnPropertyDescriptor(Module,"readAsync")){Object.defineProperty(Module,"readAsync",{configurable:true,get:function(){abort("Module.readAsync has been replaced with plain readAsync (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)")}})}if(!Object.getOwnPropertyDescriptor(Module,"readBinary")){Object.defineProperty(Module,"readBinary",{configurable:true,get:function(){abort("Module.readBinary has been replaced with plain readBinary (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)")}})}if(!Object.getOwnPropertyDescriptor(Module,"setWindowTitle")){Object.defineProperty(Module,"setWindowTitle",{configurable:true,get:function(){abort("Module.setWindowTitle has been replaced with plain setWindowTitle (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)")}})}assert(!ENVIRONMENT_IS_SHELL,"shell environment detected but not enabled at build time.  Add 'shell' to `-s ENVIRONMENT` to enable.");var POINTER_SIZE=4;function warnOnce(text){if(!warnOnce.shown)warnOnce.shown={};if(!warnOnce.shown[text]){warnOnce.shown[text]=1;err(text)}}function convertJsFunctionToWasm(func,sig){if(typeof WebAssembly.Function==="function"){var typeNames={"i":"i32","j":"i64","f":"f32","d":"f64"};var type={parameters:[],results:sig[0]=="v"?[]:[typeNames[sig[0]]]};for(var i=1;i<sig.length;++i){type.parameters.push(typeNames[sig[i]])}return new WebAssembly.Function(type,func)}var typeSection=[1,0,1,96];var sigRet=sig.slice(0,1);var sigParam=sig.slice(1);var typeCodes={"i":127,"j":126,"f":125,"d":124};typeSection.push(sigParam.length);for(var i=0;i<sigParam.length;++i){typeSection.push(typeCodes[sigParam[i]])}if(sigRet=="v"){typeSection.push(0)}else{typeSection=typeSection.concat([1,typeCodes[sigRet]])}typeSection[1]=typeSection.length-2;var bytes=new Uint8Array([0,97,115,109,1,0,0,0].concat(typeSection,[2,7,1,1,101,1,102,0,0,7,5,1,1,102,0,0]));var module=new WebAssembly.Module(bytes);var instance=new WebAssembly.Instance(module,{"e":{"f":func}});var wrappedFunc=instance.exports["f"];return wrappedFunc}var freeTableIndexes=[];var functionsInTableMap;function getEmptyTableSlot(){if(freeTableIndexes.length){return freeTableIndexes.pop()}try{wasmTable.grow(1)}catch(err){if(!(err instanceof RangeError)){throw err}throw"Unable to grow wasm table. Set ALLOW_TABLE_GROWTH."}return wasmTable.length-1}function updateTableMap(offset,count){for(var i=offset;i<offset+count;i++){var item=getWasmTableEntry(i);if(item){functionsInTableMap.set(item,i)}}}var tempRet0=0;var setTempRet0=function(value){tempRet0=value};var wasmBinary;if(Module["wasmBinary"])wasmBinary=Module["wasmBinary"];if(!Object.getOwnPropertyDescriptor(Module,"wasmBinary")){Object.defineProperty(Module,"wasmBinary",{configurable:true,get:function(){abort("Module.wasmBinary has been replaced with plain wasmBinary (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)")}})}var noExitRuntime=Module["noExitRuntime"]||true;if(!Object.getOwnPropertyDescriptor(Module,"noExitRuntime")){Object.defineProperty(Module,"noExitRuntime",{configurable:true,get:function(){abort("Module.noExitRuntime has been replaced with plain noExitRuntime (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)")}})}if(typeof WebAssembly!=="object"){abort("no native wasm support detected")}var wasmMemory;var ABORT=false;var EXITSTATUS;function assert(condition,text){if(!condition){abort("Assertion failed"+(text?": "+text:""))}}function getCFunc(ident){var func=Module["_"+ident];assert(func,"Cannot call unknown function "+ident+", make sure it is exported");return func}function ccall(ident,returnType,argTypes,args,opts){var toC={"string":function(str){var ret=0;if(str!==null&&str!==undefined&&str!==0){var len=(str.length<<2)+1;ret=stackAlloc(len);stringToUTF8(str,ret,len)}return ret},"array":function(arr){var ret=stackAlloc(arr.length);writeArrayToMemory(arr,ret);return ret}};function convertReturnValue(ret){if(returnType==="string")return UTF8ToString(ret);if(returnType==="boolean")return Boolean(ret);return ret}var func=getCFunc(ident);var cArgs=[];var stack=0;assert(returnType!=="array",'Return type should not be "array".');if(args){for(var i=0;i<args.length;i++){var converter=toC[argTypes[i]];if(converter){if(stack===0)stack=stackSave();cArgs[i]=converter(args[i])}else{cArgs[i]=args[i]}}}var ret=func.apply(null,cArgs);function onDone(ret){if(stack!==0)stackRestore(stack);return convertReturnValue(ret)}ret=onDone(ret);return ret}var ALLOC_STACK=1;var UTF8Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf8"):undefined;function UTF8ArrayToString(heap,idx,maxBytesToRead){var endIdx=idx+maxBytesToRead;var endPtr=idx;while(heap[endPtr]&&!(endPtr>=endIdx))++endPtr;if(endPtr-idx>16&&heap.subarray&&UTF8Decoder){return UTF8Decoder.decode(heap.subarray(idx,endPtr))}else{var str="";while(idx<endPtr){var u0=heap[idx++];if(!(u0&128)){str+=String.fromCharCode(u0);continue}var u1=heap[idx++]&63;if((u0&224)==192){str+=String.fromCharCode((u0&31)<<6|u1);continue}var u2=heap[idx++]&63;if((u0&240)==224){u0=(u0&15)<<12|u1<<6|u2}else{if((u0&248)!=240)warnOnce("Invalid UTF-8 leading byte 0x"+u0.toString(16)+" encountered when deserializing a UTF-8 string in wasm memory to a JS string!");u0=(u0&7)<<18|u1<<12|u2<<6|heap[idx++]&63}if(u0<65536){str+=String.fromCharCode(u0)}else{var ch=u0-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}}}return str}function UTF8ToString(ptr,maxBytesToRead){return ptr?UTF8ArrayToString(HEAPU8,ptr,maxBytesToRead):""}function stringToUTF8Array(str,heap,outIdx,maxBytesToWrite){if(!(maxBytesToWrite>0))return 0;var startIdx=outIdx;var endIdx=outIdx+maxBytesToWrite-1;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343){var u1=str.charCodeAt(++i);u=65536+((u&1023)<<10)|u1&1023}if(u<=127){if(outIdx>=endIdx)break;heap[outIdx++]=u}else if(u<=2047){if(outIdx+1>=endIdx)break;heap[outIdx++]=192|u>>6;heap[outIdx++]=128|u&63}else if(u<=65535){if(outIdx+2>=endIdx)break;heap[outIdx++]=224|u>>12;heap[outIdx++]=128|u>>6&63;heap[outIdx++]=128|u&63}else{if(outIdx+3>=endIdx)break;if(u>1114111)warnOnce("Invalid Unicode code point 0x"+u.toString(16)+" encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).");heap[outIdx++]=240|u>>18;heap[outIdx++]=128|u>>12&63;heap[outIdx++]=128|u>>6&63;heap[outIdx++]=128|u&63}}heap[outIdx]=0;return outIdx-startIdx}function stringToUTF8(str,outPtr,maxBytesToWrite){assert(typeof maxBytesToWrite=="number","stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");return stringToUTF8Array(str,HEAPU8,outPtr,maxBytesToWrite)}function lengthBytesUTF8(str){var len=0;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343)u=65536+((u&1023)<<10)|str.charCodeAt(++i)&1023;if(u<=127)++len;else if(u<=2047)len+=2;else if(u<=65535)len+=3;else len+=4}return len}var UTF16Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf-16le"):undefined;function UTF16ToString(ptr,maxBytesToRead){assert(ptr%2==0,"Pointer passed to UTF16ToString must be aligned to two bytes!");var endPtr=ptr;var idx=endPtr>>1;var maxIdx=idx+maxBytesToRead/2;while(!(idx>=maxIdx)&&HEAPU16[idx])++idx;endPtr=idx<<1;if(endPtr-ptr>32&&UTF16Decoder){return UTF16Decoder.decode(HEAPU8.subarray(ptr,endPtr))}else{var str="";for(var i=0;!(i>=maxBytesToRead/2);++i){var codeUnit=HEAP16[ptr+i*2>>1];if(codeUnit==0)break;str+=String.fromCharCode(codeUnit)}return str}}function stringToUTF16(str,outPtr,maxBytesToWrite){assert(outPtr%2==0,"Pointer passed to stringToUTF16 must be aligned to two bytes!");assert(typeof maxBytesToWrite=="number","stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");if(maxBytesToWrite===undefined){maxBytesToWrite=2147483647}if(maxBytesToWrite<2)return 0;maxBytesToWrite-=2;var startPtr=outPtr;var numCharsToWrite=maxBytesToWrite<str.length*2?maxBytesToWrite/2:str.length;for(var i=0;i<numCharsToWrite;++i){var codeUnit=str.charCodeAt(i);HEAP16[outPtr>>1]=codeUnit;outPtr+=2}HEAP16[outPtr>>1]=0;return outPtr-startPtr}function lengthBytesUTF16(str){return str.length*2}function UTF32ToString(ptr,maxBytesToRead){assert(ptr%4==0,"Pointer passed to UTF32ToString must be aligned to four bytes!");var i=0;var str="";while(!(i>=maxBytesToRead/4)){var utf32=HEAP32[ptr+i*4>>2];if(utf32==0)break;++i;if(utf32>=65536){var ch=utf32-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}else{str+=String.fromCharCode(utf32)}}return str}function stringToUTF32(str,outPtr,maxBytesToWrite){assert(outPtr%4==0,"Pointer passed to stringToUTF32 must be aligned to four bytes!");assert(typeof maxBytesToWrite=="number","stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");if(maxBytesToWrite===undefined){maxBytesToWrite=2147483647}if(maxBytesToWrite<4)return 0;var startPtr=outPtr;var endPtr=startPtr+maxBytesToWrite-4;for(var i=0;i<str.length;++i){var codeUnit=str.charCodeAt(i);if(codeUnit>=55296&&codeUnit<=57343){var trailSurrogate=str.charCodeAt(++i);codeUnit=65536+((codeUnit&1023)<<10)|trailSurrogate&1023}HEAP32[outPtr>>2]=codeUnit;outPtr+=4;if(outPtr+4>endPtr)break}HEAP32[outPtr>>2]=0;return outPtr-startPtr}function lengthBytesUTF32(str){var len=0;for(var i=0;i<str.length;++i){var codeUnit=str.charCodeAt(i);if(codeUnit>=55296&&codeUnit<=57343)++i;len+=4}return len}function writeArrayToMemory(array,buffer){assert(array.length>=0,"writeArrayToMemory array must have a length (should be an array or typed array)");HEAP8.set(array,buffer)}function writeAsciiToMemory(str,buffer,dontAddNull){for(var i=0;i<str.length;++i){assert(str.charCodeAt(i)===(str.charCodeAt(i)&255));HEAP8[buffer++>>0]=str.charCodeAt(i)}if(!dontAddNull)HEAP8[buffer>>0]=0}function alignUp(x,multiple){if(x%multiple>0){x+=multiple-x%multiple}return x}var buffer,HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAPF64;function updateGlobalBufferAndViews(buf){buffer=buf;Module["HEAP8"]=HEAP8=new Int8Array(buf);Module["HEAP16"]=HEAP16=new Int16Array(buf);Module["HEAP32"]=HEAP32=new Int32Array(buf);Module["HEAPU8"]=HEAPU8=new Uint8Array(buf);Module["HEAPU16"]=HEAPU16=new Uint16Array(buf);Module["HEAPU32"]=HEAPU32=new Uint32Array(buf);Module["HEAPF32"]=HEAPF32=new Float32Array(buf);Module["HEAPF64"]=HEAPF64=new Float64Array(buf)}var TOTAL_STACK=5242880;if(Module["TOTAL_STACK"])assert(TOTAL_STACK===Module["TOTAL_STACK"],"the stack size can no longer be determined at runtime");var INITIAL_MEMORY=Module["INITIAL_MEMORY"]||16777216;if(!Object.getOwnPropertyDescriptor(Module,"INITIAL_MEMORY")){Object.defineProperty(Module,"INITIAL_MEMORY",{configurable:true,get:function(){abort("Module.INITIAL_MEMORY has been replaced with plain INITIAL_MEMORY (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)")}})}assert(INITIAL_MEMORY>=TOTAL_STACK,"INITIAL_MEMORY should be larger than TOTAL_STACK, was "+INITIAL_MEMORY+"! (TOTAL_STACK="+TOTAL_STACK+")");assert(typeof Int32Array!=="undefined"&&typeof Float64Array!=="undefined"&&Int32Array.prototype.subarray!==undefined&&Int32Array.prototype.set!==undefined,"JS engine does not provide full typed array support");assert(!Module["wasmMemory"],"Use of `wasmMemory` detected.  Use -s IMPORTED_MEMORY to define wasmMemory externally");assert(INITIAL_MEMORY==16777216,"Detected runtime INITIAL_MEMORY setting.  Use -s IMPORTED_MEMORY to define wasmMemory dynamically");var wasmTable;function writeStackCookie(){var max=_emscripten_stack_get_end();assert((max&3)==0);HEAP32[max+4>>2]=34821223;HEAP32[max+8>>2]=2310721022;HEAP32[0]=1668509029}function checkStackCookie(){if(ABORT)return;var max=_emscripten_stack_get_end();var cookie1=HEAPU32[max+4>>2];var cookie2=HEAPU32[max+8>>2];if(cookie1!=34821223||cookie2!=2310721022){abort("Stack overflow! Stack cookie has been overwritten, expected hex dwords 0x89BACDFE and 0x2135467, but received 0x"+cookie2.toString(16)+" 0x"+cookie1.toString(16))}if(HEAP32[0]!==1668509029)abort("Runtime error: The application has corrupted its heap memory area (address zero)!")}(function(){var h16=new Int16Array(1);var h8=new Int8Array(h16.buffer);h16[0]=25459;if(h8[0]!==115||h8[1]!==99)throw"Runtime error: expected the system to be little-endian! (Run with -s SUPPORT_BIG_ENDIAN=1 to bypass)"})();var __ATPRERUN__=[];var __ATINIT__=[];var __ATPOSTRUN__=[];var runtimeInitialized=false;var runtimeExited=false;var runtimeKeepaliveCounter=0;function keepRuntimeAlive(){return noExitRuntime||runtimeKeepaliveCounter>0}function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift())}}callRuntimeCallbacks(__ATPRERUN__)}function initRuntime(){checkStackCookie();assert(!runtimeInitialized);runtimeInitialized=true;callRuntimeCallbacks(__ATINIT__)}function exitRuntime(){checkStackCookie();runtimeExited=true}function postRun(){checkStackCookie();if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift())}}callRuntimeCallbacks(__ATPOSTRUN__)}function addOnPreRun(cb){__ATPRERUN__.unshift(cb)}function addOnInit(cb){__ATINIT__.unshift(cb)}function addOnPostRun(cb){__ATPOSTRUN__.unshift(cb)}assert(Math.imul,"This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");assert(Math.fround,"This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");assert(Math.clz32,"This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");assert(Math.trunc,"This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");var runDependencies=0;var runDependencyWatcher=null;var dependenciesFulfilled=null;var runDependencyTracking={};function addRunDependency(id){runDependencies++;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}if(id){assert(!runDependencyTracking[id]);runDependencyTracking[id]=1;if(runDependencyWatcher===null&&typeof setInterval!=="undefined"){runDependencyWatcher=setInterval(function(){if(ABORT){clearInterval(runDependencyWatcher);runDependencyWatcher=null;return}var shown=false;for(var dep in runDependencyTracking){if(!shown){shown=true;err("still waiting on run dependencies:")}err("dependency: "+dep)}if(shown){err("(end of list)")}},1e4)}}else{err("warning: run dependency added without ID")}}function removeRunDependency(id){runDependencies--;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}if(id){assert(runDependencyTracking[id]);delete runDependencyTracking[id]}else{err("warning: run dependency removed without ID")}if(runDependencies==0){if(runDependencyWatcher!==null){clearInterval(runDependencyWatcher);runDependencyWatcher=null}if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback()}}}Module["preloadedImages"]={};Module["preloadedAudios"]={};function abort(what){{if(Module["onAbort"]){Module["onAbort"](what)}}what="Aborted("+what+")";err(what);ABORT=true;EXITSTATUS=1;var e=new WebAssembly.RuntimeError(what);readyPromiseReject(e);throw e}var FS={error:function(){abort("Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with  -s FORCE_FILESYSTEM=1")},init:function(){FS.error()},createDataFile:function(){FS.error()},createPreloadedFile:function(){FS.error()},createLazyFile:function(){FS.error()},open:function(){FS.error()},mkdev:function(){FS.error()},registerDevice:function(){FS.error()},analyzePath:function(){FS.error()},loadFilesFromDB:function(){FS.error()},ErrnoError:function ErrnoError(){FS.error()}};Module["FS_createDataFile"]=FS.createDataFile;Module["FS_createPreloadedFile"]=FS.createPreloadedFile;var dataURIPrefix="data:application/octet-stream;base64,";function isDataURI(filename){return filename.startsWith(dataURIPrefix)}function isFileURI(filename){return filename.startsWith("file://")}function createExportWrapper(name,fixedasm){return function(){var displayName=name;var asm=fixedasm;if(!fixedasm){asm=Module["asm"]}assert(runtimeInitialized,"native function `"+displayName+"` called before runtime initialization");assert(!runtimeExited,"native function `"+displayName+"` called after runtime exit (use NO_EXIT_RUNTIME to keep it alive after main() exits)");if(!asm[name]){assert(asm[name],"exported native function `"+displayName+"` not found")}return asm[name].apply(null,arguments)}}var wasmBinaryFile;wasmBinaryFile="physx.release.wasm";if(!isDataURI(wasmBinaryFile)){wasmBinaryFile=locateFile(wasmBinaryFile)}function getBinary(file){try{if(file==wasmBinaryFile&&wasmBinary){return new Uint8Array(wasmBinary)}if(readBinary){return readBinary(file)}else{throw"both async and sync fetching of the wasm failed"}}catch(err){abort(err)}}function getBinaryPromise(){if(!wasmBinary&&(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER)){if(typeof fetch==="function"&&!isFileURI(wasmBinaryFile)){return fetch(wasmBinaryFile,{credentials:"same-origin"}).then(function(response){if(!response["ok"]){throw"failed to load wasm binary file at '"+wasmBinaryFile+"'"}return response["arrayBuffer"]()}).catch(function(){return getBinary(wasmBinaryFile)})}else{if(readAsync){return new Promise(function(resolve,reject){readAsync(wasmBinaryFile,function(response){resolve(new Uint8Array(response))},reject)})}}}return Promise.resolve().then(function(){return getBinary(wasmBinaryFile)})}function createWasm(){var info={"env":asmLibraryArg,"wasi_snapshot_preview1":asmLibraryArg};function receiveInstance(instance,module){var exports=instance.exports;Module["asm"]=exports;wasmMemory=Module["asm"]["memory"];assert(wasmMemory,"memory not found in wasm exports");updateGlobalBufferAndViews(wasmMemory.buffer);wasmTable=Module["asm"]["__indirect_function_table"];assert(wasmTable,"table not found in wasm exports");addOnInit(Module["asm"]["__wasm_call_ctors"]);removeRunDependency("wasm-instantiate")}addRunDependency("wasm-instantiate");var trueModule=Module;function receiveInstantiationResult(result){assert(Module===trueModule,"the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?");trueModule=null;receiveInstance(result["instance"])}function instantiateArrayBuffer(receiver){return getBinaryPromise().then(function(binary){return WebAssembly.instantiate(binary,info)}).then(function(instance){return instance}).then(receiver,function(reason){err("failed to asynchronously prepare wasm: "+reason);if(isFileURI(wasmBinaryFile)){err("warning: Loading from a file URI ("+wasmBinaryFile+") is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing")}abort(reason)})}function instantiateAsync(){if(!wasmBinary&&typeof WebAssembly.instantiateStreaming==="function"&&!isDataURI(wasmBinaryFile)&&!isFileURI(wasmBinaryFile)&&typeof fetch==="function"){return fetch(wasmBinaryFile,{credentials:"same-origin"}).then(function(response){var result=WebAssembly.instantiateStreaming(response,info);return result.then(receiveInstantiationResult,function(reason){err("wasm streaming compile failed: "+reason);err("falling back to ArrayBuffer instantiation");return instantiateArrayBuffer(receiveInstantiationResult)})})}else{return instantiateArrayBuffer(receiveInstantiationResult)}}if(Module["instantiateWasm"]){try{var exports=Module["instantiateWasm"](info,receiveInstance);return exports}catch(e){err("Module.instantiateWasm callback failed with error: "+e);return false}}instantiateAsync().catch(readyPromiseReject);return{}}var tempDouble;var tempI64;function callRuntimeCallbacks(callbacks){while(callbacks.length>0){var callback=callbacks.shift();if(typeof callback=="function"){callback(Module);continue}var func=callback.func;if(typeof func==="number"){if(callback.arg===undefined){getWasmTableEntry(func)()}else{getWasmTableEntry(func)(callback.arg)}}else{func(callback.arg===undefined?null:callback.arg)}}}function demangle(func){warnOnce("warning: build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling");return func}function demangleAll(text){var regex=/\b_Z[\w\d_]+/g;return text.replace(regex,function(x){var y=demangle(x);return x===y?x:y+" ["+x+"]"})}var wasmTableMirror=[];function getWasmTableEntry(funcPtr){var func=wasmTableMirror[funcPtr];if(!func){if(funcPtr>=wasmTableMirror.length)wasmTableMirror.length=funcPtr+1;wasmTableMirror[funcPtr]=func=wasmTable.get(funcPtr)}assert(wasmTable.get(funcPtr)==func,"JavaScript-side Wasm function table mirror is out of date!");return func}function jsStackTrace(){var error=new Error;if(!error.stack){try{throw new Error}catch(e){error=e}if(!error.stack){return"(no stack trace available)"}}return error.stack.toString()}function setWasmTableEntry(idx,func){wasmTable.set(idx,func);wasmTableMirror[idx]=func}var char_0=48;var char_9=57;function makeLegalFunctionName(name){if(undefined===name){return"_unknown"}name=name.replace(/[^a-zA-Z0-9_]/g,"$");var f=name.charCodeAt(0);if(f>=char_0&&f<=char_9){return"_"+name}else{return name}}function createNamedFunction(name,body){name=makeLegalFunctionName(name);return new Function("body","return function "+name+"() {\n"+'    "use strict";'+"    return body.apply(this, arguments);\n"+"};\n")(body)}var emval_handle_array=[{},{value:undefined},{value:null},{value:true},{value:false}];var emval_free_list=[];function extendError(baseErrorType,errorName){var errorClass=createNamedFunction(errorName,function(message){this.name=errorName;this.message=message;var stack=new Error(message).stack;if(stack!==undefined){this.stack=this.toString()+"\n"+stack.replace(/^Error(:[^\n]*)?\n/,"")}});errorClass.prototype=Object.create(baseErrorType.prototype);errorClass.prototype.constructor=errorClass;errorClass.prototype.toString=function(){if(this.message===undefined){return this.name}else{return this.name+": "+this.message}};return errorClass}var BindingError=undefined;function throwBindingError(message){throw new BindingError(message)}function count_emval_handles(){var count=0;for(var i=5;i<emval_handle_array.length;++i){if(emval_handle_array[i]!==undefined){++count}}return count}function get_first_emval(){for(var i=5;i<emval_handle_array.length;++i){if(emval_handle_array[i]!==undefined){return emval_handle_array[i]}}return null}function init_emval(){Module["count_emval_handles"]=count_emval_handles;Module["get_first_emval"]=get_first_emval}var Emval={toValue:function(handle){if(!handle){throwBindingError("Cannot use deleted val. handle = "+handle)}return emval_handle_array[handle].value},toHandle:function(value){switch(value){case undefined:{return 1}case null:{return 2}case true:{return 3}case false:{return 4}default:{var handle=emval_free_list.length?emval_free_list.pop():emval_handle_array.length;emval_handle_array[handle]={refcount:1,value:value};return handle}}}};var PureVirtualError=undefined;function embind_init_charCodes(){var codes=new Array(256);for(var i=0;i<256;++i){codes[i]=String.fromCharCode(i)}embind_charCodes=codes}var embind_charCodes=undefined;function readLatin1String(ptr){var ret="";var c=ptr;while(HEAPU8[c]){ret+=embind_charCodes[HEAPU8[c++]]}return ret}function getInheritedInstanceCount(){return Object.keys(registeredInstances).length}function getLiveInheritedInstances(){var rv=[];for(var k in registeredInstances){if(registeredInstances.hasOwnProperty(k)){rv.push(registeredInstances[k])}}return rv}var deletionQueue=[];function flushPendingDeletes(){while(deletionQueue.length){var obj=deletionQueue.pop();obj.$$.deleteScheduled=false;obj["delete"]()}}var delayFunction=undefined;function setDelayFunction(fn){delayFunction=fn;if(deletionQueue.length&&delayFunction){delayFunction(flushPendingDeletes)}}function init_embind(){Module["getInheritedInstanceCount"]=getInheritedInstanceCount;Module["getLiveInheritedInstances"]=getLiveInheritedInstances;Module["flushPendingDeletes"]=flushPendingDeletes;Module["setDelayFunction"]=setDelayFunction}var registeredInstances={};function getBasestPointer(class_,ptr){if(ptr===undefined){throwBindingError("ptr should not be undefined")}while(class_.baseClass){ptr=class_.upcast(ptr);class_=class_.baseClass}return ptr}function registerInheritedInstance(class_,ptr,instance){ptr=getBasestPointer(class_,ptr);if(registeredInstances.hasOwnProperty(ptr)){throwBindingError("Tried to register registered instance: "+ptr)}else{registeredInstances[ptr]=instance}}var registeredTypes={};function getTypeName(type){var ptr=___getTypeName(type);var rv=readLatin1String(ptr);_free(ptr);return rv}function requireRegisteredType(rawType,humanName){var impl=registeredTypes[rawType];if(undefined===impl){throwBindingError(humanName+" has unknown type "+getTypeName(rawType))}return impl}function unregisterInheritedInstance(class_,ptr){ptr=getBasestPointer(class_,ptr);if(registeredInstances.hasOwnProperty(ptr)){delete registeredInstances[ptr]}else{throwBindingError("Tried to unregister unregistered instance: "+ptr)}}function detachFinalizer(handle){}var finalizationGroup=false;function runDestructor($$){if($$.smartPtr){$$.smartPtrType.rawDestructor($$.smartPtr)}else{$$.ptrType.registeredClass.rawDestructor($$.ptr)}}function releaseClassHandle($$){$$.count.value-=1;var toDelete=0===$$.count.value;if(toDelete){runDestructor($$)}}function attachFinalizer(handle){if("undefined"===typeof FinalizationGroup){attachFinalizer=function(handle){return handle};return handle}finalizationGroup=new FinalizationGroup(function(iter){for(var result=iter.next();!result.done;result=iter.next()){var $$=result.value;if(!$$.ptr){console.warn("object already deleted: "+$$.ptr)}else{releaseClassHandle($$)}}});attachFinalizer=function(handle){finalizationGroup.register(handle,handle.$$,handle.$$);return handle};detachFinalizer=function(handle){finalizationGroup.unregister(handle.$$)};return attachFinalizer(handle)}function __embind_create_inheriting_constructor(constructorName,wrapperType,properties){constructorName=readLatin1String(constructorName);wrapperType=requireRegisteredType(wrapperType,"wrapper");properties=Emval.toValue(properties);var arraySlice=[].slice;var registeredClass=wrapperType.registeredClass;var wrapperPrototype=registeredClass.instancePrototype;var baseClass=registeredClass.baseClass;var baseClassPrototype=baseClass.instancePrototype;var baseConstructor=registeredClass.baseClass.constructor;var ctor=createNamedFunction(constructorName,function(){registeredClass.baseClass.pureVirtualFunctions.forEach(function(name){if(this[name]===baseClassPrototype[name]){throw new PureVirtualError("Pure virtual function "+name+" must be implemented in JavaScript")}}.bind(this));Object.defineProperty(this,"__parent",{value:wrapperPrototype});this["__construct"].apply(this,arraySlice.call(arguments))});wrapperPrototype["__construct"]=function __construct(){if(this===wrapperPrototype){throwBindingError("Pass correct 'this' to __construct")}var inner=baseConstructor["implement"].apply(undefined,[this].concat(arraySlice.call(arguments)));detachFinalizer(inner);var $$=inner.$$;inner["notifyOnDestruction"]();$$.preservePointerOnDelete=true;Object.defineProperties(this,{$$:{value:$$}});attachFinalizer(this);registerInheritedInstance(registeredClass,$$.ptr,this)};wrapperPrototype["__destruct"]=function __destruct(){if(this===wrapperPrototype){throwBindingError("Pass correct 'this' to __destruct")}detachFinalizer(this);unregisterInheritedInstance(registeredClass,this.$$.ptr)};ctor.prototype=Object.create(wrapperPrototype);for(var p in properties){ctor.prototype[p]=properties[p]}return Emval.toHandle(ctor)}var structRegistrations={};function runDestructors(destructors){while(destructors.length){var ptr=destructors.pop();var del=destructors.pop();del(ptr)}}function simpleReadValueFromPointer(pointer){return this["fromWireType"](HEAPU32[pointer>>2])}var awaitingDependencies={};var typeDependencies={};var InternalError=undefined;function throwInternalError(message){throw new InternalError(message)}function whenDependentTypesAreResolved(myTypes,dependentTypes,getTypeConverters){myTypes.forEach(function(type){typeDependencies[type]=dependentTypes});function onComplete(typeConverters){var myTypeConverters=getTypeConverters(typeConverters);if(myTypeConverters.length!==myTypes.length){throwInternalError("Mismatched type converter count")}for(var i=0;i<myTypes.length;++i){registerType(myTypes[i],myTypeConverters[i])}}var typeConverters=new Array(dependentTypes.length);var unregisteredTypes=[];var registered=0;dependentTypes.forEach(function(dt,i){if(registeredTypes.hasOwnProperty(dt)){typeConverters[i]=registeredTypes[dt]}else{unregisteredTypes.push(dt);if(!awaitingDependencies.hasOwnProperty(dt)){awaitingDependencies[dt]=[]}awaitingDependencies[dt].push(function(){typeConverters[i]=registeredTypes[dt];++registered;if(registered===unregisteredTypes.length){onComplete(typeConverters)}})}});if(0===unregisteredTypes.length){onComplete(typeConverters)}}function __embind_finalize_value_object(structType){var reg=structRegistrations[structType];delete structRegistrations[structType];var rawConstructor=reg.rawConstructor;var rawDestructor=reg.rawDestructor;var fieldRecords=reg.fields;var fieldTypes=fieldRecords.map(function(field){return field.getterReturnType}).concat(fieldRecords.map(function(field){return field.setterArgumentType}));whenDependentTypesAreResolved([structType],fieldTypes,function(fieldTypes){var fields={};fieldRecords.forEach(function(field,i){var fieldName=field.fieldName;var getterReturnType=fieldTypes[i];var getter=field.getter;var getterContext=field.getterContext;var setterArgumentType=fieldTypes[i+fieldRecords.length];var setter=field.setter;var setterContext=field.setterContext;fields[fieldName]={read:function(ptr){return getterReturnType["fromWireType"](getter(getterContext,ptr))},write:function(ptr,o){var destructors=[];setter(setterContext,ptr,setterArgumentType["toWireType"](destructors,o));runDestructors(destructors)}}});return[{name:reg.name,"fromWireType":function(ptr){var rv={};for(var i in fields){rv[i]=fields[i].read(ptr)}rawDestructor(ptr);return rv},"toWireType":function(destructors,o){for(var fieldName in fields){if(!(fieldName in o)){throw new TypeError('Missing field:  "'+fieldName+'"')}}var ptr=rawConstructor();for(fieldName in fields){fields[fieldName].write(ptr,o[fieldName])}if(destructors!==null){destructors.push(rawDestructor,ptr)}return ptr},"argPackAdvance":8,"readValueFromPointer":simpleReadValueFromPointer,destructorFunction:rawDestructor}]})}function __embind_register_bigint(primitiveType,name,size,minRange,maxRange){}function getShiftFromSize(size){switch(size){case 1:return 0;case 2:return 1;case 4:return 2;case 8:return 3;default:throw new TypeError("Unknown type size: "+size)}}function registerType(rawType,registeredInstance,options){options=options||{};if(!("argPackAdvance"in registeredInstance)){throw new TypeError("registerType registeredInstance requires argPackAdvance")}var name=registeredInstance.name;if(!rawType){throwBindingError('type "'+name+'" must have a positive integer typeid pointer')}if(registeredTypes.hasOwnProperty(rawType)){if(options.ignoreDuplicateRegistrations){return}else{throwBindingError("Cannot register type '"+name+"' twice")}}registeredTypes[rawType]=registeredInstance;delete typeDependencies[rawType];if(awaitingDependencies.hasOwnProperty(rawType)){var callbacks=awaitingDependencies[rawType];delete awaitingDependencies[rawType];callbacks.forEach(function(cb){cb()})}}function __embind_register_bool(rawType,name,size,trueValue,falseValue){var shift=getShiftFromSize(size);name=readLatin1String(name);registerType(rawType,{name:name,"fromWireType":function(wt){return!!wt},"toWireType":function(destructors,o){return o?trueValue:falseValue},"argPackAdvance":8,"readValueFromPointer":function(pointer){var heap;if(size===1){heap=HEAP8}else if(size===2){heap=HEAP16}else if(size===4){heap=HEAP32}else{throw new TypeError("Unknown boolean type size: "+name)}return this["fromWireType"](heap[pointer>>shift])},destructorFunction:null})}function ClassHandle_isAliasOf(other){if(!(this instanceof ClassHandle)){return false}if(!(other instanceof ClassHandle)){return false}var leftClass=this.$$.ptrType.registeredClass;var left=this.$$.ptr;var rightClass=other.$$.ptrType.registeredClass;var right=other.$$.ptr;while(leftClass.baseClass){left=leftClass.upcast(left);leftClass=leftClass.baseClass}while(rightClass.baseClass){right=rightClass.upcast(right);rightClass=rightClass.baseClass}return leftClass===rightClass&&left===right}function shallowCopyInternalPointer(o){return{count:o.count,deleteScheduled:o.deleteScheduled,preservePointerOnDelete:o.preservePointerOnDelete,ptr:o.ptr,ptrType:o.ptrType,smartPtr:o.smartPtr,smartPtrType:o.smartPtrType}}function throwInstanceAlreadyDeleted(obj){function getInstanceTypeName(handle){return handle.$$.ptrType.registeredClass.name}throwBindingError(getInstanceTypeName(obj)+" instance already deleted")}function ClassHandle_clone(){if(!this.$$.ptr){throwInstanceAlreadyDeleted(this)}if(this.$$.preservePointerOnDelete){this.$$.count.value+=1;return this}else{var clone=attachFinalizer(Object.create(Object.getPrototypeOf(this),{$$:{value:shallowCopyInternalPointer(this.$$)}}));clone.$$.count.value+=1;clone.$$.deleteScheduled=false;return clone}}function ClassHandle_delete(){if(!this.$$.ptr){throwInstanceAlreadyDeleted(this)}if(this.$$.deleteScheduled&&!this.$$.preservePointerOnDelete){throwBindingError("Object already scheduled for deletion")}detachFinalizer(this);releaseClassHandle(this.$$);if(!this.$$.preservePointerOnDelete){this.$$.smartPtr=undefined;this.$$.ptr=undefined}}function ClassHandle_isDeleted(){return!this.$$.ptr}function ClassHandle_deleteLater(){if(!this.$$.ptr){throwInstanceAlreadyDeleted(this)}if(this.$$.deleteScheduled&&!this.$$.preservePointerOnDelete){throwBindingError("Object already scheduled for deletion")}deletionQueue.push(this);if(deletionQueue.length===1&&delayFunction){delayFunction(flushPendingDeletes)}this.$$.deleteScheduled=true;return this}function init_ClassHandle(){ClassHandle.prototype["isAliasOf"]=ClassHandle_isAliasOf;ClassHandle.prototype["clone"]=ClassHandle_clone;ClassHandle.prototype["delete"]=ClassHandle_delete;ClassHandle.prototype["isDeleted"]=ClassHandle_isDeleted;ClassHandle.prototype["deleteLater"]=ClassHandle_deleteLater}function ClassHandle(){}var registeredPointers={};function ensureOverloadTable(proto,methodName,humanName){if(undefined===proto[methodName].overloadTable){var prevFunc=proto[methodName];proto[methodName]=function(){if(!proto[methodName].overloadTable.hasOwnProperty(arguments.length)){throwBindingError("Function '"+humanName+"' called with an invalid number of arguments ("+arguments.length+") - expects one of ("+proto[methodName].overloadTable+")!")}return proto[methodName].overloadTable[arguments.length].apply(this,arguments)};proto[methodName].overloadTable=[];proto[methodName].overloadTable[prevFunc.argCount]=prevFunc}}function exposePublicSymbol(name,value,numArguments){if(Module.hasOwnProperty(name)){if(undefined===numArguments||undefined!==Module[name].overloadTable&&undefined!==Module[name].overloadTable[numArguments]){throwBindingError("Cannot register public name '"+name+"' twice")}ensureOverloadTable(Module,name,name);if(Module.hasOwnProperty(numArguments)){throwBindingError("Cannot register multiple overloads of a function with the same number of arguments ("+numArguments+")!")}Module[name].overloadTable[numArguments]=value}else{Module[name]=value;if(undefined!==numArguments){Module[name].numArguments=numArguments}}}function RegisteredClass(name,constructor,instancePrototype,rawDestructor,baseClass,getActualType,upcast,downcast){this.name=name;this.constructor=constructor;this.instancePrototype=instancePrototype;this.rawDestructor=rawDestructor;this.baseClass=baseClass;this.getActualType=getActualType;this.upcast=upcast;this.downcast=downcast;this.pureVirtualFunctions=[]}function upcastPointer(ptr,ptrClass,desiredClass){while(ptrClass!==desiredClass){if(!ptrClass.upcast){throwBindingError("Expected null or instance of "+desiredClass.name+", got an instance of "+ptrClass.name)}ptr=ptrClass.upcast(ptr);ptrClass=ptrClass.baseClass}return ptr}function constNoSmartPtrRawPointerToWireType(destructors,handle){if(handle===null){if(this.isReference){throwBindingError("null is not a valid "+this.name)}return 0}if(!handle.$$){throwBindingError('Cannot pass "'+_embind_repr(handle)+'" as a '+this.name)}if(!handle.$$.ptr){throwBindingError("Cannot pass deleted object as a pointer of type "+this.name)}var handleClass=handle.$$.ptrType.registeredClass;var ptr=upcastPointer(handle.$$.ptr,handleClass,this.registeredClass);return ptr}function genericPointerToWireType(destructors,handle){var ptr;if(handle===null){if(this.isReference){throwBindingError("null is not a valid "+this.name)}if(this.isSmartPointer){ptr=this.rawConstructor();if(destructors!==null){destructors.push(this.rawDestructor,ptr)}return ptr}else{return 0}}if(!handle.$$){throwBindingError('Cannot pass "'+_embind_repr(handle)+'" as a '+this.name)}if(!handle.$$.ptr){throwBindingError("Cannot pass deleted object as a pointer of type "+this.name)}if(!this.isConst&&handle.$$.ptrType.isConst){throwBindingError("Cannot convert argument of type "+(handle.$$.smartPtrType?handle.$$.smartPtrType.name:handle.$$.ptrType.name)+" to parameter type "+this.name)}var handleClass=handle.$$.ptrType.registeredClass;ptr=upcastPointer(handle.$$.ptr,handleClass,this.registeredClass);if(this.isSmartPointer){if(undefined===handle.$$.smartPtr){throwBindingError("Passing raw pointer to smart pointer is illegal")}switch(this.sharingPolicy){case 0:if(handle.$$.smartPtrType===this){ptr=handle.$$.smartPtr}else{throwBindingError("Cannot convert argument of type "+(handle.$$.smartPtrType?handle.$$.smartPtrType.name:handle.$$.ptrType.name)+" to parameter type "+this.name)}break;case 1:ptr=handle.$$.smartPtr;break;case 2:if(handle.$$.smartPtrType===this){ptr=handle.$$.smartPtr}else{var clonedHandle=handle["clone"]();ptr=this.rawShare(ptr,Emval.toHandle(function(){clonedHandle["delete"]()}));if(destructors!==null){destructors.push(this.rawDestructor,ptr)}}break;default:throwBindingError("Unsupporting sharing policy")}}return ptr}function nonConstNoSmartPtrRawPointerToWireType(destructors,handle){if(handle===null){if(this.isReference){throwBindingError("null is not a valid "+this.name)}return 0}if(!handle.$$){throwBindingError('Cannot pass "'+_embind_repr(handle)+'" as a '+this.name)}if(!handle.$$.ptr){throwBindingError("Cannot pass deleted object as a pointer of type "+this.name)}if(handle.$$.ptrType.isConst){throwBindingError("Cannot convert argument of type "+handle.$$.ptrType.name+" to parameter type "+this.name)}var handleClass=handle.$$.ptrType.registeredClass;var ptr=upcastPointer(handle.$$.ptr,handleClass,this.registeredClass);return ptr}function RegisteredPointer_getPointee(ptr){if(this.rawGetPointee){ptr=this.rawGetPointee(ptr)}return ptr}function RegisteredPointer_destructor(ptr){if(this.rawDestructor){this.rawDestructor(ptr)}}function RegisteredPointer_deleteObject(handle){if(handle!==null){handle["delete"]()}}function downcastPointer(ptr,ptrClass,desiredClass){if(ptrClass===desiredClass){return ptr}if(undefined===desiredClass.baseClass){return null}var rv=downcastPointer(ptr,ptrClass,desiredClass.baseClass);if(rv===null){return null}return desiredClass.downcast(rv)}function getInheritedInstance(class_,ptr){ptr=getBasestPointer(class_,ptr);return registeredInstances[ptr]}function makeClassHandle(prototype,record){if(!record.ptrType||!record.ptr){throwInternalError("makeClassHandle requires ptr and ptrType")}var hasSmartPtrType=!!record.smartPtrType;var hasSmartPtr=!!record.smartPtr;if(hasSmartPtrType!==hasSmartPtr){throwInternalError("Both smartPtrType and smartPtr must be specified")}record.count={value:1};return attachFinalizer(Object.create(prototype,{$$:{value:record}}))}function RegisteredPointer_fromWireType(ptr){var rawPointer=this.getPointee(ptr);if(!rawPointer){this.destructor(ptr);return null}var registeredInstance=getInheritedInstance(this.registeredClass,rawPointer);if(undefined!==registeredInstance){if(0===registeredInstance.$$.count.value){registeredInstance.$$.ptr=rawPointer;registeredInstance.$$.smartPtr=ptr;return registeredInstance["clone"]()}else{var rv=registeredInstance["clone"]();this.destructor(ptr);return rv}}function makeDefaultHandle(){if(this.isSmartPointer){return makeClassHandle(this.registeredClass.instancePrototype,{ptrType:this.pointeeType,ptr:rawPointer,smartPtrType:this,smartPtr:ptr})}else{return makeClassHandle(this.registeredClass.instancePrototype,{ptrType:this,ptr:ptr})}}var actualType=this.registeredClass.getActualType(rawPointer);var registeredPointerRecord=registeredPointers[actualType];if(!registeredPointerRecord){return makeDefaultHandle.call(this)}var toType;if(this.isConst){toType=registeredPointerRecord.constPointerType}else{toType=registeredPointerRecord.pointerType}var dp=downcastPointer(rawPointer,this.registeredClass,toType.registeredClass);if(dp===null){return makeDefaultHandle.call(this)}if(this.isSmartPointer){return makeClassHandle(toType.registeredClass.instancePrototype,{ptrType:toType,ptr:dp,smartPtrType:this,smartPtr:ptr})}else{return makeClassHandle(toType.registeredClass.instancePrototype,{ptrType:toType,ptr:dp})}}function init_RegisteredPointer(){RegisteredPointer.prototype.getPointee=RegisteredPointer_getPointee;RegisteredPointer.prototype.destructor=RegisteredPointer_destructor;RegisteredPointer.prototype["argPackAdvance"]=8;RegisteredPointer.prototype["readValueFromPointer"]=simpleReadValueFromPointer;RegisteredPointer.prototype["deleteObject"]=RegisteredPointer_deleteObject;RegisteredPointer.prototype["fromWireType"]=RegisteredPointer_fromWireType}function RegisteredPointer(name,registeredClass,isReference,isConst,isSmartPointer,pointeeType,sharingPolicy,rawGetPointee,rawConstructor,rawShare,rawDestructor){this.name=name;this.registeredClass=registeredClass;this.isReference=isReference;this.isConst=isConst;this.isSmartPointer=isSmartPointer;this.pointeeType=pointeeType;this.sharingPolicy=sharingPolicy;this.rawGetPointee=rawGetPointee;this.rawConstructor=rawConstructor;this.rawShare=rawShare;this.rawDestructor=rawDestructor;if(!isSmartPointer&&registeredClass.baseClass===undefined){if(isConst){this["toWireType"]=constNoSmartPtrRawPointerToWireType;this.destructorFunction=null}else{this["toWireType"]=nonConstNoSmartPtrRawPointerToWireType;this.destructorFunction=null}}else{this["toWireType"]=genericPointerToWireType}}function replacePublicSymbol(name,value,numArguments){if(!Module.hasOwnProperty(name)){throwInternalError("Replacing nonexistant public symbol")}if(undefined!==Module[name].overloadTable&&undefined!==numArguments){Module[name].overloadTable[numArguments]=value}else{Module[name]=value;Module[name].argCount=numArguments}}function dynCallLegacy(sig,ptr,args){assert("dynCall_"+sig in Module,"bad function pointer type - no table for sig '"+sig+"'");if(args&&args.length){assert(args.length===sig.substring(1).replace(/j/g,"--").length)}else{assert(sig.length==1)}var f=Module["dynCall_"+sig];return args&&args.length?f.apply(null,[ptr].concat(args)):f.call(null,ptr)}function dynCall(sig,ptr,args){if(sig.includes("j")){return dynCallLegacy(sig,ptr,args)}assert(getWasmTableEntry(ptr),"missing table entry in dynCall: "+ptr);return getWasmTableEntry(ptr).apply(null,args)}function getDynCaller(sig,ptr){assert(sig.includes("j"),"getDynCaller should only be called with i64 sigs");var argCache=[];return function(){argCache.length=arguments.length;for(var i=0;i<arguments.length;i++){argCache[i]=arguments[i]}return dynCall(sig,ptr,argCache)}}function embind__requireFunction(signature,rawFunction){signature=readLatin1String(signature);function makeDynCaller(){if(signature.includes("j")){return getDynCaller(signature,rawFunction)}return getWasmTableEntry(rawFunction)}var fp=makeDynCaller();if(typeof fp!=="function"){throwBindingError("unknown function pointer with signature "+signature+": "+rawFunction)}return fp}var UnboundTypeError=undefined;function throwUnboundTypeError(message,types){var unboundTypes=[];var seen={};function visit(type){if(seen[type]){return}if(registeredTypes[type]){return}if(typeDependencies[type]){typeDependencies[type].forEach(visit);return}unboundTypes.push(type);seen[type]=true}types.forEach(visit);throw new UnboundTypeError(message+": "+unboundTypes.map(getTypeName).join([", "]))}function __embind_register_class(rawType,rawPointerType,rawConstPointerType,baseClassRawType,getActualTypeSignature,getActualType,upcastSignature,upcast,downcastSignature,downcast,name,destructorSignature,rawDestructor){name=readLatin1String(name);getActualType=embind__requireFunction(getActualTypeSignature,getActualType);if(upcast){upcast=embind__requireFunction(upcastSignature,upcast)}if(downcast){downcast=embind__requireFunction(downcastSignature,downcast)}rawDestructor=embind__requireFunction(destructorSignature,rawDestructor);var legalFunctionName=makeLegalFunctionName(name);exposePublicSymbol(legalFunctionName,function(){throwUnboundTypeError("Cannot construct "+name+" due to unbound types",[baseClassRawType])});whenDependentTypesAreResolved([rawType,rawPointerType,rawConstPointerType],baseClassRawType?[baseClassRawType]:[],function(base){base=base[0];var baseClass;var basePrototype;if(baseClassRawType){baseClass=base.registeredClass;basePrototype=baseClass.instancePrototype}else{basePrototype=ClassHandle.prototype}var constructor=createNamedFunction(legalFunctionName,function(){if(Object.getPrototypeOf(this)!==instancePrototype){throw new BindingError("Use 'new' to construct "+name)}if(undefined===registeredClass.constructor_body){throw new BindingError(name+" has no accessible constructor")}var body=registeredClass.constructor_body[arguments.length];if(undefined===body){throw new BindingError("Tried to invoke ctor of "+name+" with invalid number of parameters ("+arguments.length+") - expected ("+Object.keys(registeredClass.constructor_body).toString()+") parameters instead!")}return body.apply(this,arguments)});var instancePrototype=Object.create(basePrototype,{constructor:{value:constructor}});constructor.prototype=instancePrototype;var registeredClass=new RegisteredClass(name,constructor,instancePrototype,rawDestructor,baseClass,getActualType,upcast,downcast);var referenceConverter=new RegisteredPointer(name,registeredClass,true,false,false);var pointerConverter=new RegisteredPointer(name+"*",registeredClass,false,false,false);var constPointerConverter=new RegisteredPointer(name+" const*",registeredClass,false,true,false);registeredPointers[rawType]={pointerType:pointerConverter,constPointerType:constPointerConverter};replacePublicSymbol(legalFunctionName,constructor);return[referenceConverter,pointerConverter,constPointerConverter]})}function new_(constructor,argumentList){if(!(constructor instanceof Function)){throw new TypeError("new_ called with constructor type "+typeof constructor+" which is not a function")}var dummy=createNamedFunction(constructor.name||"unknownFunctionName",function(){});dummy.prototype=constructor.prototype;var obj=new dummy;var r=constructor.apply(obj,argumentList);return r instanceof Object?r:obj}function craftInvokerFunction(humanName,argTypes,classType,cppInvokerFunc,cppTargetFunc){var argCount=argTypes.length;if(argCount<2){throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!")}var isClassMethodFunc=argTypes[1]!==null&&classType!==null;var needsDestructorStack=false;for(var i=1;i<argTypes.length;++i){if(argTypes[i]!==null&&argTypes[i].destructorFunction===undefined){needsDestructorStack=true;break}}var returns=argTypes[0].name!=="void";var argsList="";var argsListWired="";for(var i=0;i<argCount-2;++i){argsList+=(i!==0?", ":"")+"arg"+i;argsListWired+=(i!==0?", ":"")+"arg"+i+"Wired"}var invokerFnBody="return function "+makeLegalFunctionName(humanName)+"("+argsList+") {\n"+"if (arguments.length !== "+(argCount-2)+") {\n"+"throwBindingError('function "+humanName+" called with ' + arguments.length + ' arguments, expected "+(argCount-2)+" args!');\n"+"}\n";if(needsDestructorStack){invokerFnBody+="var destructors = [];\n"}var dtorStack=needsDestructorStack?"destructors":"null";var args1=["throwBindingError","invoker","fn","runDestructors","retType","classParam"];var args2=[throwBindingError,cppInvokerFunc,cppTargetFunc,runDestructors,argTypes[0],argTypes[1]];if(isClassMethodFunc){invokerFnBody+="var thisWired = classParam.toWireType("+dtorStack+", this);\n"}for(var i=0;i<argCount-2;++i){invokerFnBody+="var arg"+i+"Wired = argType"+i+".toWireType("+dtorStack+", arg"+i+"); // "+argTypes[i+2].name+"\n";args1.push("argType"+i);args2.push(argTypes[i+2])}if(isClassMethodFunc){argsListWired="thisWired"+(argsListWired.length>0?", ":"")+argsListWired}invokerFnBody+=(returns?"var rv = ":"")+"invoker(fn"+(argsListWired.length>0?", ":"")+argsListWired+");\n";if(needsDestructorStack){invokerFnBody+="runDestructors(destructors);\n"}else{for(var i=isClassMethodFunc?1:2;i<argTypes.length;++i){var paramName=i===1?"thisWired":"arg"+(i-2)+"Wired";if(argTypes[i].destructorFunction!==null){invokerFnBody+=paramName+"_dtor("+paramName+"); // "+argTypes[i].name+"\n";args1.push(paramName+"_dtor");args2.push(argTypes[i].destructorFunction)}}}if(returns){invokerFnBody+="var ret = retType.fromWireType(rv);\n"+"return ret;\n"}else{}invokerFnBody+="}\n";args1.push(invokerFnBody);var invokerFunction=new_(Function,args1).apply(null,args2);return invokerFunction}function heap32VectorToArray(count,firstElement){var array=[];for(var i=0;i<count;i++){array.push(HEAP32[(firstElement>>2)+i])}return array}function __embind_register_class_class_function(rawClassType,methodName,argCount,rawArgTypesAddr,invokerSignature,rawInvoker,fn){var rawArgTypes=heap32VectorToArray(argCount,rawArgTypesAddr);methodName=readLatin1String(methodName);rawInvoker=embind__requireFunction(invokerSignature,rawInvoker);whenDependentTypesAreResolved([],[rawClassType],function(classType){classType=classType[0];var humanName=classType.name+"."+methodName;function unboundTypesHandler(){throwUnboundTypeError("Cannot call "+humanName+" due to unbound types",rawArgTypes)}if(methodName.startsWith("@@")){methodName=Symbol[methodName.substring(2)]}var proto=classType.registeredClass.constructor;if(undefined===proto[methodName]){unboundTypesHandler.argCount=argCount-1;proto[methodName]=unboundTypesHandler}else{ensureOverloadTable(proto,methodName,humanName);proto[methodName].overloadTable[argCount-1]=unboundTypesHandler}whenDependentTypesAreResolved([],rawArgTypes,function(argTypes){var invokerArgsArray=[argTypes[0],null].concat(argTypes.slice(1));var func=craftInvokerFunction(humanName,invokerArgsArray,null,rawInvoker,fn);if(undefined===proto[methodName].overloadTable){func.argCount=argCount-1;proto[methodName]=func}else{proto[methodName].overloadTable[argCount-1]=func}return[]});return[]})}function __embind_register_class_constructor(rawClassType,argCount,rawArgTypesAddr,invokerSignature,invoker,rawConstructor){assert(argCount>0);var rawArgTypes=heap32VectorToArray(argCount,rawArgTypesAddr);invoker=embind__requireFunction(invokerSignature,invoker);whenDependentTypesAreResolved([],[rawClassType],function(classType){classType=classType[0];var humanName="constructor "+classType.name;if(undefined===classType.registeredClass.constructor_body){classType.registeredClass.constructor_body=[]}if(undefined!==classType.registeredClass.constructor_body[argCount-1]){throw new BindingError("Cannot register multiple constructors with identical number of parameters ("+(argCount-1)+") for class '"+classType.name+"'! Overload resolution is currently only performed using the parameter count, not actual type info!")}classType.registeredClass.constructor_body[argCount-1]=function unboundTypeHandler(){throwUnboundTypeError("Cannot construct "+classType.name+" due to unbound types",rawArgTypes)};whenDependentTypesAreResolved([],rawArgTypes,function(argTypes){argTypes.splice(1,0,null);classType.registeredClass.constructor_body[argCount-1]=craftInvokerFunction(humanName,argTypes,null,invoker,rawConstructor);return[]});return[]})}function __embind_register_class_function(rawClassType,methodName,argCount,rawArgTypesAddr,invokerSignature,rawInvoker,context,isPureVirtual){var rawArgTypes=heap32VectorToArray(argCount,rawArgTypesAddr);methodName=readLatin1String(methodName);rawInvoker=embind__requireFunction(invokerSignature,rawInvoker);whenDependentTypesAreResolved([],[rawClassType],function(classType){classType=classType[0];var humanName=classType.name+"."+methodName;if(methodName.startsWith("@@")){methodName=Symbol[methodName.substring(2)]}if(isPureVirtual){classType.registeredClass.pureVirtualFunctions.push(methodName)}function unboundTypesHandler(){throwUnboundTypeError("Cannot call "+humanName+" due to unbound types",rawArgTypes)}var proto=classType.registeredClass.instancePrototype;var method=proto[methodName];if(undefined===method||undefined===method.overloadTable&&method.className!==classType.name&&method.argCount===argCount-2){unboundTypesHandler.argCount=argCount-2;unboundTypesHandler.className=classType.name;proto[methodName]=unboundTypesHandler}else{ensureOverloadTable(proto,methodName,humanName);proto[methodName].overloadTable[argCount-2]=unboundTypesHandler}whenDependentTypesAreResolved([],rawArgTypes,function(argTypes){var memberFunction=craftInvokerFunction(humanName,argTypes,classType,rawInvoker,context);if(undefined===proto[methodName].overloadTable){memberFunction.argCount=argCount-2;proto[methodName]=memberFunction}else{proto[methodName].overloadTable[argCount-2]=memberFunction}return[]});return[]})}function validateThis(this_,classType,humanName){if(!(this_ instanceof Object)){throwBindingError(humanName+' with invalid "this": '+this_)}if(!(this_ instanceof classType.registeredClass.constructor)){throwBindingError(humanName+' incompatible with "this" of type '+this_.constructor.name)}if(!this_.$$.ptr){throwBindingError("cannot call emscripten binding method "+humanName+" on deleted object")}return upcastPointer(this_.$$.ptr,this_.$$.ptrType.registeredClass,classType.registeredClass)}function __embind_register_class_property(classType,fieldName,getterReturnType,getterSignature,getter,getterContext,setterArgumentType,setterSignature,setter,setterContext){fieldName=readLatin1String(fieldName);getter=embind__requireFunction(getterSignature,getter);whenDependentTypesAreResolved([],[classType],function(classType){classType=classType[0];var humanName=classType.name+"."+fieldName;var desc={get:function(){throwUnboundTypeError("Cannot access "+humanName+" due to unbound types",[getterReturnType,setterArgumentType])},enumerable:true,configurable:true};if(setter){desc.set=function(){throwUnboundTypeError("Cannot access "+humanName+" due to unbound types",[getterReturnType,setterArgumentType])}}else{desc.set=function(v){throwBindingError(humanName+" is a read-only property")}}Object.defineProperty(classType.registeredClass.instancePrototype,fieldName,desc);whenDependentTypesAreResolved([],setter?[getterReturnType,setterArgumentType]:[getterReturnType],function(types){var getterReturnType=types[0];var desc={get:function(){var ptr=validateThis(this,classType,humanName+" getter");return getterReturnType["fromWireType"](getter(getterContext,ptr))},enumerable:true};if(setter){setter=embind__requireFunction(setterSignature,setter);var setterArgumentType=types[1];desc.set=function(v){var ptr=validateThis(this,classType,humanName+" setter");var destructors=[];setter(setterContext,ptr,setterArgumentType["toWireType"](destructors,v));runDestructors(destructors)}}Object.defineProperty(classType.registeredClass.instancePrototype,fieldName,desc);return[]});return[]})}function __embind_register_constant(name,type,value){name=readLatin1String(name);whenDependentTypesAreResolved([],[type],function(type){type=type[0];Module[name]=type["fromWireType"](value);return[]})}function __emval_decref(handle){if(handle>4&&0===--emval_handle_array[handle].refcount){emval_handle_array[handle]=undefined;emval_free_list.push(handle)}}function __embind_register_emval(rawType,name){name=readLatin1String(name);registerType(rawType,{name:name,"fromWireType":function(handle){var rv=Emval.toValue(handle);__emval_decref(handle);return rv},"toWireType":function(destructors,value){return Emval.toHandle(value)},"argPackAdvance":8,"readValueFromPointer":simpleReadValueFromPointer,destructorFunction:null})}function enumReadValueFromPointer(name,shift,signed){switch(shift){case 0:return function(pointer){var heap=signed?HEAP8:HEAPU8;return this["fromWireType"](heap[pointer])};case 1:return function(pointer){var heap=signed?HEAP16:HEAPU16;return this["fromWireType"](heap[pointer>>1])};case 2:return function(pointer){var heap=signed?HEAP32:HEAPU32;return this["fromWireType"](heap[pointer>>2])};default:throw new TypeError("Unknown integer type: "+name)}}function __embind_register_enum(rawType,name,size,isSigned){var shift=getShiftFromSize(size);name=readLatin1String(name);function ctor(){}ctor.values={};registerType(rawType,{name:name,constructor:ctor,"fromWireType":function(c){return this.constructor.values[c]},"toWireType":function(destructors,c){return c.value},"argPackAdvance":8,"readValueFromPointer":enumReadValueFromPointer(name,shift,isSigned),destructorFunction:null});exposePublicSymbol(name,ctor)}function __embind_register_enum_value(rawEnumType,name,enumValue){var enumType=requireRegisteredType(rawEnumType,"enum");name=readLatin1String(name);var Enum=enumType.constructor;var Value=Object.create(enumType.constructor.prototype,{value:{value:enumValue},constructor:{value:createNamedFunction(enumType.name+"_"+name,function(){})}});Enum.values[enumValue]=Value;Enum[name]=Value}function _embind_repr(v){if(v===null){return"null"}var t=typeof v;if(t==="object"||t==="array"||t==="function"){return v.toString()}else{return""+v}}function floatReadValueFromPointer(name,shift){switch(shift){case 2:return function(pointer){return this["fromWireType"](HEAPF32[pointer>>2])};case 3:return function(pointer){return this["fromWireType"](HEAPF64[pointer>>3])};default:throw new TypeError("Unknown float type: "+name)}}function __embind_register_float(rawType,name,size){var shift=getShiftFromSize(size);name=readLatin1String(name);registerType(rawType,{name:name,"fromWireType":function(value){return value},"toWireType":function(destructors,value){if(typeof value!=="number"&&typeof value!=="boolean"){throw new TypeError('Cannot convert "'+_embind_repr(value)+'" to '+this.name)}return value},"argPackAdvance":8,"readValueFromPointer":floatReadValueFromPointer(name,shift),destructorFunction:null})}function __embind_register_function(name,argCount,rawArgTypesAddr,signature,rawInvoker,fn){var argTypes=heap32VectorToArray(argCount,rawArgTypesAddr);name=readLatin1String(name);rawInvoker=embind__requireFunction(signature,rawInvoker);exposePublicSymbol(name,function(){throwUnboundTypeError("Cannot call "+name+" due to unbound types",argTypes)},argCount-1);whenDependentTypesAreResolved([],argTypes,function(argTypes){var invokerArgsArray=[argTypes[0],null].concat(argTypes.slice(1));replacePublicSymbol(name,craftInvokerFunction(name,invokerArgsArray,null,rawInvoker,fn),argCount-1);return[]})}function integerReadValueFromPointer(name,shift,signed){switch(shift){case 0:return signed?function readS8FromPointer(pointer){return HEAP8[pointer]}:function readU8FromPointer(pointer){return HEAPU8[pointer]};case 1:return signed?function readS16FromPointer(pointer){return HEAP16[pointer>>1]}:function readU16FromPointer(pointer){return HEAPU16[pointer>>1]};case 2:return signed?function readS32FromPointer(pointer){return HEAP32[pointer>>2]}:function readU32FromPointer(pointer){return HEAPU32[pointer>>2]};default:throw new TypeError("Unknown integer type: "+name)}}function __embind_register_integer(primitiveType,name,size,minRange,maxRange){name=readLatin1String(name);if(maxRange===-1){maxRange=4294967295}var shift=getShiftFromSize(size);var fromWireType=function(value){return value};if(minRange===0){var bitshift=32-8*size;fromWireType=function(value){return value<<bitshift>>>bitshift}}var isUnsignedType=name.includes("unsigned");var checkAssertions=function(value,toTypeName){if(typeof value!=="number"&&typeof value!=="boolean"){throw new TypeError('Cannot convert "'+_embind_repr(value)+'" to '+toTypeName)}if(value<minRange||value>maxRange){throw new TypeError('Passing a number "'+_embind_repr(value)+'" from JS side to C/C++ side to an argument of type "'+name+'", which is outside the valid range ['+minRange+", "+maxRange+"]!")}};var toWireType;if(isUnsignedType){toWireType=function(destructors,value){checkAssertions(value,this.name);return value>>>0}}else{toWireType=function(destructors,value){checkAssertions(value,this.name);return value}}registerType(primitiveType,{name:name,"fromWireType":fromWireType,"toWireType":toWireType,"argPackAdvance":8,"readValueFromPointer":integerReadValueFromPointer(name,shift,minRange!==0),destructorFunction:null})}function __embind_register_memory_view(rawType,dataTypeIndex,name){var typeMapping=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array];var TA=typeMapping[dataTypeIndex];function decodeMemoryView(handle){handle=handle>>2;var heap=HEAPU32;var size=heap[handle];var data=heap[handle+1];return new TA(buffer,data,size)}name=readLatin1String(name);registerType(rawType,{name:name,"fromWireType":decodeMemoryView,"argPackAdvance":8,"readValueFromPointer":decodeMemoryView},{ignoreDuplicateRegistrations:true})}function __embind_register_std_string(rawType,name){name=readLatin1String(name);var stdStringIsUTF8=name==="std::string";registerType(rawType,{name:name,"fromWireType":function(value){var length=HEAPU32[value>>2];var str;if(stdStringIsUTF8){var decodeStartPtr=value+4;for(var i=0;i<=length;++i){var currentBytePtr=value+4+i;if(i==length||HEAPU8[currentBytePtr]==0){var maxRead=currentBytePtr-decodeStartPtr;var stringSegment=UTF8ToString(decodeStartPtr,maxRead);if(str===undefined){str=stringSegment}else{str+=String.fromCharCode(0);str+=stringSegment}decodeStartPtr=currentBytePtr+1}}}else{var a=new Array(length);for(var i=0;i<length;++i){a[i]=String.fromCharCode(HEAPU8[value+4+i])}str=a.join("")}_free(value);return str},"toWireType":function(destructors,value){if(value instanceof ArrayBuffer){value=new Uint8Array(value)}var getLength;var valueIsOfTypeString=typeof value==="string";if(!(valueIsOfTypeString||value instanceof Uint8Array||value instanceof Uint8ClampedArray||value instanceof Int8Array)){throwBindingError("Cannot pass non-string to std::string")}if(stdStringIsUTF8&&valueIsOfTypeString){getLength=function(){return lengthBytesUTF8(value)}}else{getLength=function(){return value.length}}var length=getLength();var ptr=_malloc(4+length+1);HEAPU32[ptr>>2]=length;if(stdStringIsUTF8&&valueIsOfTypeString){stringToUTF8(value,ptr+4,length+1)}else{if(valueIsOfTypeString){for(var i=0;i<length;++i){var charCode=value.charCodeAt(i);if(charCode>255){_free(ptr);throwBindingError("String has UTF-16 code units that do not fit in 8 bits")}HEAPU8[ptr+4+i]=charCode}}else{for(var i=0;i<length;++i){HEAPU8[ptr+4+i]=value[i]}}}if(destructors!==null){destructors.push(_free,ptr)}return ptr},"argPackAdvance":8,"readValueFromPointer":simpleReadValueFromPointer,destructorFunction:function(ptr){_free(ptr)}})}function __embind_register_std_wstring(rawType,charSize,name){name=readLatin1String(name);var decodeString,encodeString,getHeap,lengthBytesUTF,shift;if(charSize===2){decodeString=UTF16ToString;encodeString=stringToUTF16;lengthBytesUTF=lengthBytesUTF16;getHeap=function(){return HEAPU16};shift=1}else if(charSize===4){decodeString=UTF32ToString;encodeString=stringToUTF32;lengthBytesUTF=lengthBytesUTF32;getHeap=function(){return HEAPU32};shift=2}registerType(rawType,{name:name,"fromWireType":function(value){var length=HEAPU32[value>>2];var HEAP=getHeap();var str;var decodeStartPtr=value+4;for(var i=0;i<=length;++i){var currentBytePtr=value+4+i*charSize;if(i==length||HEAP[currentBytePtr>>shift]==0){var maxReadBytes=currentBytePtr-decodeStartPtr;var stringSegment=decodeString(decodeStartPtr,maxReadBytes);if(str===undefined){str=stringSegment}else{str+=String.fromCharCode(0);str+=stringSegment}decodeStartPtr=currentBytePtr+charSize}}_free(value);return str},"toWireType":function(destructors,value){if(!(typeof value==="string")){throwBindingError("Cannot pass non-string to C++ string type "+name)}var length=lengthBytesUTF(value);var ptr=_malloc(4+length+charSize);HEAPU32[ptr>>2]=length>>shift;encodeString(value,ptr+4,length+charSize);if(destructors!==null){destructors.push(_free,ptr)}return ptr},"argPackAdvance":8,"readValueFromPointer":simpleReadValueFromPointer,destructorFunction:function(ptr){_free(ptr)}})}function __embind_register_value_object(rawType,name,constructorSignature,rawConstructor,destructorSignature,rawDestructor){structRegistrations[rawType]={name:readLatin1String(name),rawConstructor:embind__requireFunction(constructorSignature,rawConstructor),rawDestructor:embind__requireFunction(destructorSignature,rawDestructor),fields:[]}}function __embind_register_value_object_field(structType,fieldName,getterReturnType,getterSignature,getter,getterContext,setterArgumentType,setterSignature,setter,setterContext){structRegistrations[structType].fields.push({fieldName:readLatin1String(fieldName),getterReturnType:getterReturnType,getter:embind__requireFunction(getterSignature,getter),getterContext:getterContext,setterArgumentType:setterArgumentType,setter:embind__requireFunction(setterSignature,setter),setterContext:setterContext})}function __embind_register_void(rawType,name){name=readLatin1String(name);registerType(rawType,{isVoid:true,name:name,"argPackAdvance":0,"fromWireType":function(){return undefined},"toWireType":function(destructors,o){return undefined}})}var emval_symbols={};function getStringOrSymbol(address){var symbol=emval_symbols[address];if(symbol===undefined){return readLatin1String(address)}else{return symbol}}var emval_methodCallers=[];function __emval_call_void_method(caller,handle,methodName,args){caller=emval_methodCallers[caller];handle=Emval.toValue(handle);methodName=getStringOrSymbol(methodName);caller(handle,methodName,null,args)}function __emval_addMethodCaller(caller){var id=emval_methodCallers.length;emval_methodCallers.push(caller);return id}function __emval_lookupTypes(argCount,argTypes){var a=new Array(argCount);for(var i=0;i<argCount;++i){a[i]=requireRegisteredType(HEAP32[(argTypes>>2)+i],"parameter "+i)}return a}var emval_registeredMethods=[];function __emval_get_method_caller(argCount,argTypes){var types=__emval_lookupTypes(argCount,argTypes);var retType=types[0];var signatureName=retType.name+"_$"+types.slice(1).map(function(t){return t.name}).join("_")+"$";var returnId=emval_registeredMethods[signatureName];if(returnId!==undefined){return returnId}var params=["retType"];var args=[retType];var argsList="";for(var i=0;i<argCount-1;++i){argsList+=(i!==0?", ":"")+"arg"+i;params.push("argType"+i);args.push(types[1+i])}var functionName=makeLegalFunctionName("methodCaller_"+signatureName);var functionBody="return function "+functionName+"(handle, name, destructors, args) {\n";var offset=0;for(var i=0;i<argCount-1;++i){functionBody+="    var arg"+i+" = argType"+i+".readValueFromPointer(args"+(offset?"+"+offset:"")+");\n";offset+=types[i+1]["argPackAdvance"]}functionBody+="    var rv = handle[name]("+argsList+");\n";for(var i=0;i<argCount-1;++i){if(types[i+1]["deleteObject"]){functionBody+="    argType"+i+".deleteObject(arg"+i+");\n"}}if(!retType.isVoid){functionBody+="    return retType.toWireType(destructors, rv);\n"}functionBody+="};\n";params.push(functionBody);var invokerFunction=new_(Function,params).apply(null,args);returnId=__emval_addMethodCaller(invokerFunction);emval_registeredMethods[signatureName]=returnId;return returnId}function __emval_incref(handle){if(handle>4){emval_handle_array[handle].refcount+=1}}function __emval_take_value(type,argv){type=requireRegisteredType(type,"_emval_take_value");var v=type["readValueFromPointer"](argv);return Emval.toHandle(v)}function _abort(){abort("native code called abort()")}var _emscripten_get_now;if(ENVIRONMENT_IS_NODE){_emscripten_get_now=(()=>{var t=process["hrtime"]();return t[0]*1e3+t[1]/1e6})}else _emscripten_get_now=(()=>performance.now());function _emscripten_memcpy_big(dest,src,num){HEAPU8.copyWithin(dest,src,src+num)}function emscripten_realloc_buffer(size){try{wasmMemory.grow(size-buffer.byteLength+65535>>>16);updateGlobalBufferAndViews(wasmMemory.buffer);return 1}catch(e){err("emscripten_realloc_buffer: Attempted to grow heap from "+buffer.byteLength+" bytes to "+size+" bytes, but got error: "+e)}}function _emscripten_resize_heap(requestedSize){var oldSize=HEAPU8.length;requestedSize=requestedSize>>>0;assert(requestedSize>oldSize);var maxHeapSize=2147483648;if(requestedSize>maxHeapSize){err("Cannot enlarge memory, asked to go up to "+requestedSize+" bytes, but the limit is "+maxHeapSize+" bytes!");return false}for(var cutDown=1;cutDown<=4;cutDown*=2){var overGrownHeapSize=oldSize*(1+.2/cutDown);overGrownHeapSize=Math.min(overGrownHeapSize,requestedSize+100663296);var newSize=Math.min(maxHeapSize,alignUp(Math.max(requestedSize,overGrownHeapSize),65536));var replacement=emscripten_realloc_buffer(newSize);if(replacement){return true}}err("Failed to grow the heap from "+oldSize+" bytes to "+newSize+" bytes, not enough memory!");return false}function _exit(status){exit(status)}var SYSCALLS={mappings:{},buffers:[null,[],[]],printChar:function(stream,curr){var buffer=SYSCALLS.buffers[stream];assert(buffer);if(curr===0||curr===10){(stream===1?out:err)(UTF8ArrayToString(buffer,0));buffer.length=0}else{buffer.push(curr)}},varargs:undefined,get:function(){assert(SYSCALLS.varargs!=undefined);SYSCALLS.varargs+=4;var ret=HEAP32[SYSCALLS.varargs-4>>2];return ret},getStr:function(ptr){var ret=UTF8ToString(ptr);return ret},get64:function(low,high){if(low>=0)assert(high===0);else assert(high===-1);return low}};function _fd_close(fd){abort("it should not be possible to operate on streams when !SYSCALLS_REQUIRE_FILESYSTEM");return 0}function _fd_seek(fd,offset_low,offset_high,whence,newOffset){abort("it should not be possible to operate on streams when !SYSCALLS_REQUIRE_FILESYSTEM")}function flush_NO_FILESYSTEM(){if(typeof _fflush!=="undefined")_fflush(0);var buffers=SYSCALLS.buffers;if(buffers[1].length)SYSCALLS.printChar(1,10);if(buffers[2].length)SYSCALLS.printChar(2,10)}function _fd_write(fd,iov,iovcnt,pnum){var num=0;for(var i=0;i<iovcnt;i++){var ptr=HEAP32[iov>>2];var len=HEAP32[iov+4>>2];iov+=8;for(var j=0;j<len;j++){SYSCALLS.printChar(fd,HEAPU8[ptr+j])}num+=len}HEAP32[pnum>>2]=num;return 0}function _gettimeofday(ptr){var now=Date.now();HEAP32[ptr>>2]=now/1e3|0;HEAP32[ptr+4>>2]=now%1e3*1e3|0;return 0}function _setTempRet0(val){setTempRet0(val)}BindingError=Module["BindingError"]=extendError(Error,"BindingError");init_emval();PureVirtualError=Module["PureVirtualError"]=extendError(Error,"PureVirtualError");embind_init_charCodes();init_embind();InternalError=Module["InternalError"]=extendError(Error,"InternalError");init_ClassHandle();init_RegisteredPointer();UnboundTypeError=Module["UnboundTypeError"]=extendError(Error,"UnboundTypeError");var ASSERTIONS=true;var asmLibraryArg={"_embind_create_inheriting_constructor":__embind_create_inheriting_constructor,"_embind_finalize_value_object":__embind_finalize_value_object,"_embind_register_bigint":__embind_register_bigint,"_embind_register_bool":__embind_register_bool,"_embind_register_class":__embind_register_class,"_embind_register_class_class_function":__embind_register_class_class_function,"_embind_register_class_constructor":__embind_register_class_constructor,"_embind_register_class_function":__embind_register_class_function,"_embind_register_class_property":__embind_register_class_property,"_embind_register_constant":__embind_register_constant,"_embind_register_emval":__embind_register_emval,"_embind_register_enum":__embind_register_enum,"_embind_register_enum_value":__embind_register_enum_value,"_embind_register_float":__embind_register_float,"_embind_register_function":__embind_register_function,"_embind_register_integer":__embind_register_integer,"_embind_register_memory_view":__embind_register_memory_view,"_embind_register_std_string":__embind_register_std_string,"_embind_register_std_wstring":__embind_register_std_wstring,"_embind_register_value_object":__embind_register_value_object,"_embind_register_value_object_field":__embind_register_value_object_field,"_embind_register_void":__embind_register_void,"_emval_call_void_method":__emval_call_void_method,"_emval_decref":__emval_decref,"_emval_get_method_caller":__emval_get_method_caller,"_emval_incref":__emval_incref,"_emval_take_value":__emval_take_value,"abort":_abort,"emscripten_get_now":_emscripten_get_now,"emscripten_memcpy_big":_emscripten_memcpy_big,"emscripten_resize_heap":_emscripten_resize_heap,"exit":_exit,"fd_close":_fd_close,"fd_seek":_fd_seek,"fd_write":_fd_write,"gettimeofday":_gettimeofday,"setTempRet0":_setTempRet0};var asm=createWasm();var ___wasm_call_ctors=Module["___wasm_call_ctors"]=createExportWrapper("__wasm_call_ctors");var _malloc=Module["_malloc"]=createExportWrapper("malloc");var _free=Module["_free"]=createExportWrapper("free");var ___errno_location=Module["___errno_location"]=createExportWrapper("__errno_location");var ___getTypeName=Module["___getTypeName"]=createExportWrapper("__getTypeName");var ___embind_register_native_and_builtin_types=Module["___embind_register_native_and_builtin_types"]=createExportWrapper("__embind_register_native_and_builtin_types");var _fflush=Module["_fflush"]=createExportWrapper("fflush");var _htons=Module["_htons"]=createExportWrapper("htons");var _emscripten_main_thread_process_queued_calls=Module["_emscripten_main_thread_process_queued_calls"]=createExportWrapper("emscripten_main_thread_process_queued_calls");var _ntohs=Module["_ntohs"]=createExportWrapper("ntohs");var _emscripten_stack_init=Module["_emscripten_stack_init"]=function(){return(_emscripten_stack_init=Module["_emscripten_stack_init"]=Module["asm"]["emscripten_stack_init"]).apply(null,arguments)};var _emscripten_stack_get_free=Module["_emscripten_stack_get_free"]=function(){return(_emscripten_stack_get_free=Module["_emscripten_stack_get_free"]=Module["asm"]["emscripten_stack_get_free"]).apply(null,arguments)};var _emscripten_stack_get_end=Module["_emscripten_stack_get_end"]=function(){return(_emscripten_stack_get_end=Module["_emscripten_stack_get_end"]=Module["asm"]["emscripten_stack_get_end"]).apply(null,arguments)};var stackSave=Module["stackSave"]=createExportWrapper("stackSave");var stackRestore=Module["stackRestore"]=createExportWrapper("stackRestore");var stackAlloc=Module["stackAlloc"]=createExportWrapper("stackAlloc");var dynCall_iijii=Module["dynCall_iijii"]=createExportWrapper("dynCall_iijii");var dynCall_ji=Module["dynCall_ji"]=createExportWrapper("dynCall_ji");var dynCall_vifijiif=Module["dynCall_vifijiif"]=createExportWrapper("dynCall_vifijiif");var dynCall_jiji=Module["dynCall_jiji"]=createExportWrapper("dynCall_jiji");if(!Object.getOwnPropertyDescriptor(Module,"intArrayFromString"))Module["intArrayFromString"]=function(){abort("'intArrayFromString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"intArrayToString"))Module["intArrayToString"]=function(){abort("'intArrayToString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"ccall"))Module["ccall"]=function(){abort("'ccall' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"cwrap"))Module["cwrap"]=function(){abort("'cwrap' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"setValue"))Module["setValue"]=function(){abort("'setValue' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"getValue"))Module["getValue"]=function(){abort("'getValue' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"allocate"))Module["allocate"]=function(){abort("'allocate' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"UTF8ArrayToString"))Module["UTF8ArrayToString"]=function(){abort("'UTF8ArrayToString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"UTF8ToString"))Module["UTF8ToString"]=function(){abort("'UTF8ToString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"stringToUTF8Array"))Module["stringToUTF8Array"]=function(){abort("'stringToUTF8Array' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"stringToUTF8"))Module["stringToUTF8"]=function(){abort("'stringToUTF8' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"lengthBytesUTF8"))Module["lengthBytesUTF8"]=function(){abort("'lengthBytesUTF8' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"stackTrace"))Module["stackTrace"]=function(){abort("'stackTrace' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"addOnPreRun"))Module["addOnPreRun"]=function(){abort("'addOnPreRun' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"addOnInit"))Module["addOnInit"]=function(){abort("'addOnInit' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"addOnPreMain"))Module["addOnPreMain"]=function(){abort("'addOnPreMain' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"addOnExit"))Module["addOnExit"]=function(){abort("'addOnExit' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"addOnPostRun"))Module["addOnPostRun"]=function(){abort("'addOnPostRun' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"writeStringToMemory"))Module["writeStringToMemory"]=function(){abort("'writeStringToMemory' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"writeArrayToMemory"))Module["writeArrayToMemory"]=function(){abort("'writeArrayToMemory' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"writeAsciiToMemory"))Module["writeAsciiToMemory"]=function(){abort("'writeAsciiToMemory' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"addRunDependency"))Module["addRunDependency"]=function(){abort("'addRunDependency' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")};if(!Object.getOwnPropertyDescriptor(Module,"removeRunDependency"))Module["removeRunDependency"]=function(){abort("'removeRunDependency' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")};if(!Object.getOwnPropertyDescriptor(Module,"FS_createFolder"))Module["FS_createFolder"]=function(){abort("'FS_createFolder' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"FS_createPath"))Module["FS_createPath"]=function(){abort("'FS_createPath' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")};if(!Object.getOwnPropertyDescriptor(Module,"FS_createDataFile"))Module["FS_createDataFile"]=function(){abort("'FS_createDataFile' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")};if(!Object.getOwnPropertyDescriptor(Module,"FS_createPreloadedFile"))Module["FS_createPreloadedFile"]=function(){abort("'FS_createPreloadedFile' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")};if(!Object.getOwnPropertyDescriptor(Module,"FS_createLazyFile"))Module["FS_createLazyFile"]=function(){abort("'FS_createLazyFile' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")};if(!Object.getOwnPropertyDescriptor(Module,"FS_createLink"))Module["FS_createLink"]=function(){abort("'FS_createLink' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"FS_createDevice"))Module["FS_createDevice"]=function(){abort("'FS_createDevice' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")};if(!Object.getOwnPropertyDescriptor(Module,"FS_unlink"))Module["FS_unlink"]=function(){abort("'FS_unlink' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")};if(!Object.getOwnPropertyDescriptor(Module,"getLEB"))Module["getLEB"]=function(){abort("'getLEB' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"getFunctionTables"))Module["getFunctionTables"]=function(){abort("'getFunctionTables' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"alignFunctionTables"))Module["alignFunctionTables"]=function(){abort("'alignFunctionTables' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"registerFunctions"))Module["registerFunctions"]=function(){abort("'registerFunctions' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"addFunction"))Module["addFunction"]=function(){abort("'addFunction' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"removeFunction"))Module["removeFunction"]=function(){abort("'removeFunction' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"getFuncWrapper"))Module["getFuncWrapper"]=function(){abort("'getFuncWrapper' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"prettyPrint"))Module["prettyPrint"]=function(){abort("'prettyPrint' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"dynCall"))Module["dynCall"]=function(){abort("'dynCall' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"getCompilerSetting"))Module["getCompilerSetting"]=function(){abort("'getCompilerSetting' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"print"))Module["print"]=function(){abort("'print' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"printErr"))Module["printErr"]=function(){abort("'printErr' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"getTempRet0"))Module["getTempRet0"]=function(){abort("'getTempRet0' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"setTempRet0"))Module["setTempRet0"]=function(){abort("'setTempRet0' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"callMain"))Module["callMain"]=function(){abort("'callMain' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"abort"))Module["abort"]=function(){abort("'abort' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"keepRuntimeAlive"))Module["keepRuntimeAlive"]=function(){abort("'keepRuntimeAlive' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"zeroMemory"))Module["zeroMemory"]=function(){abort("'zeroMemory' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"stringToNewUTF8"))Module["stringToNewUTF8"]=function(){abort("'stringToNewUTF8' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"setFileTime"))Module["setFileTime"]=function(){abort("'setFileTime' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"emscripten_realloc_buffer"))Module["emscripten_realloc_buffer"]=function(){abort("'emscripten_realloc_buffer' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"ENV"))Module["ENV"]=function(){abort("'ENV' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"withStackSave"))Module["withStackSave"]=function(){abort("'withStackSave' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"ERRNO_CODES"))Module["ERRNO_CODES"]=function(){abort("'ERRNO_CODES' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"ERRNO_MESSAGES"))Module["ERRNO_MESSAGES"]=function(){abort("'ERRNO_MESSAGES' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"setErrNo"))Module["setErrNo"]=function(){abort("'setErrNo' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"inetPton4"))Module["inetPton4"]=function(){abort("'inetPton4' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"inetNtop4"))Module["inetNtop4"]=function(){abort("'inetNtop4' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"inetPton6"))Module["inetPton6"]=function(){abort("'inetPton6' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"inetNtop6"))Module["inetNtop6"]=function(){abort("'inetNtop6' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"readSockaddr"))Module["readSockaddr"]=function(){abort("'readSockaddr' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"writeSockaddr"))Module["writeSockaddr"]=function(){abort("'writeSockaddr' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"DNS"))Module["DNS"]=function(){abort("'DNS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"getHostByName"))Module["getHostByName"]=function(){abort("'getHostByName' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"GAI_ERRNO_MESSAGES"))Module["GAI_ERRNO_MESSAGES"]=function(){abort("'GAI_ERRNO_MESSAGES' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"Protocols"))Module["Protocols"]=function(){abort("'Protocols' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"Sockets"))Module["Sockets"]=function(){abort("'Sockets' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"getRandomDevice"))Module["getRandomDevice"]=function(){abort("'getRandomDevice' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"traverseStack"))Module["traverseStack"]=function(){abort("'traverseStack' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"convertFrameToPC"))Module["convertFrameToPC"]=function(){abort("'convertFrameToPC' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"UNWIND_CACHE"))Module["UNWIND_CACHE"]=function(){abort("'UNWIND_CACHE' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"saveInUnwindCache"))Module["saveInUnwindCache"]=function(){abort("'saveInUnwindCache' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"convertPCtoSourceLocation"))Module["convertPCtoSourceLocation"]=function(){abort("'convertPCtoSourceLocation' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"readAsmConstArgsArray"))Module["readAsmConstArgsArray"]=function(){abort("'readAsmConstArgsArray' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"readAsmConstArgs"))Module["readAsmConstArgs"]=function(){abort("'readAsmConstArgs' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"mainThreadEM_ASM"))Module["mainThreadEM_ASM"]=function(){abort("'mainThreadEM_ASM' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"jstoi_q"))Module["jstoi_q"]=function(){abort("'jstoi_q' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"jstoi_s"))Module["jstoi_s"]=function(){abort("'jstoi_s' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"getExecutableName"))Module["getExecutableName"]=function(){abort("'getExecutableName' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"listenOnce"))Module["listenOnce"]=function(){abort("'listenOnce' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"autoResumeAudioContext"))Module["autoResumeAudioContext"]=function(){abort("'autoResumeAudioContext' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"dynCallLegacy"))Module["dynCallLegacy"]=function(){abort("'dynCallLegacy' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"getDynCaller"))Module["getDynCaller"]=function(){abort("'getDynCaller' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"dynCall"))Module["dynCall"]=function(){abort("'dynCall' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"callRuntimeCallbacks"))Module["callRuntimeCallbacks"]=function(){abort("'callRuntimeCallbacks' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"wasmTableMirror"))Module["wasmTableMirror"]=function(){abort("'wasmTableMirror' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"setWasmTableEntry"))Module["setWasmTableEntry"]=function(){abort("'setWasmTableEntry' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"getWasmTableEntry"))Module["getWasmTableEntry"]=function(){abort("'getWasmTableEntry' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"handleException"))Module["handleException"]=function(){abort("'handleException' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"runtimeKeepalivePush"))Module["runtimeKeepalivePush"]=function(){abort("'runtimeKeepalivePush' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"runtimeKeepalivePop"))Module["runtimeKeepalivePop"]=function(){abort("'runtimeKeepalivePop' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"callUserCallback"))Module["callUserCallback"]=function(){abort("'callUserCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"maybeExit"))Module["maybeExit"]=function(){abort("'maybeExit' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"safeSetTimeout"))Module["safeSetTimeout"]=function(){abort("'safeSetTimeout' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"asmjsMangle"))Module["asmjsMangle"]=function(){abort("'asmjsMangle' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"asyncLoad"))Module["asyncLoad"]=function(){abort("'asyncLoad' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"alignMemory"))Module["alignMemory"]=function(){abort("'alignMemory' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"mmapAlloc"))Module["mmapAlloc"]=function(){abort("'mmapAlloc' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"reallyNegative"))Module["reallyNegative"]=function(){abort("'reallyNegative' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"unSign"))Module["unSign"]=function(){abort("'unSign' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"reSign"))Module["reSign"]=function(){abort("'reSign' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"formatString"))Module["formatString"]=function(){abort("'formatString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"PATH"))Module["PATH"]=function(){abort("'PATH' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"PATH_FS"))Module["PATH_FS"]=function(){abort("'PATH_FS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"SYSCALLS"))Module["SYSCALLS"]=function(){abort("'SYSCALLS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"syscallMmap2"))Module["syscallMmap2"]=function(){abort("'syscallMmap2' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"syscallMunmap"))Module["syscallMunmap"]=function(){abort("'syscallMunmap' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"getSocketFromFD"))Module["getSocketFromFD"]=function(){abort("'getSocketFromFD' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"getSocketAddress"))Module["getSocketAddress"]=function(){abort("'getSocketAddress' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"JSEvents"))Module["JSEvents"]=function(){abort("'JSEvents' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"registerKeyEventCallback"))Module["registerKeyEventCallback"]=function(){abort("'registerKeyEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"specialHTMLTargets"))Module["specialHTMLTargets"]=function(){abort("'specialHTMLTargets' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"maybeCStringToJsString"))Module["maybeCStringToJsString"]=function(){abort("'maybeCStringToJsString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"findEventTarget"))Module["findEventTarget"]=function(){abort("'findEventTarget' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"findCanvasEventTarget"))Module["findCanvasEventTarget"]=function(){abort("'findCanvasEventTarget' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"getBoundingClientRect"))Module["getBoundingClientRect"]=function(){abort("'getBoundingClientRect' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"fillMouseEventData"))Module["fillMouseEventData"]=function(){abort("'fillMouseEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"registerMouseEventCallback"))Module["registerMouseEventCallback"]=function(){abort("'registerMouseEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"registerWheelEventCallback"))Module["registerWheelEventCallback"]=function(){abort("'registerWheelEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"registerUiEventCallback"))Module["registerUiEventCallback"]=function(){abort("'registerUiEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"registerFocusEventCallback"))Module["registerFocusEventCallback"]=function(){abort("'registerFocusEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"fillDeviceOrientationEventData"))Module["fillDeviceOrientationEventData"]=function(){abort("'fillDeviceOrientationEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"registerDeviceOrientationEventCallback"))Module["registerDeviceOrientationEventCallback"]=function(){abort("'registerDeviceOrientationEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"fillDeviceMotionEventData"))Module["fillDeviceMotionEventData"]=function(){abort("'fillDeviceMotionEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"registerDeviceMotionEventCallback"))Module["registerDeviceMotionEventCallback"]=function(){abort("'registerDeviceMotionEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"screenOrientation"))Module["screenOrientation"]=function(){abort("'screenOrientation' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"fillOrientationChangeEventData"))Module["fillOrientationChangeEventData"]=function(){abort("'fillOrientationChangeEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"registerOrientationChangeEventCallback"))Module["registerOrientationChangeEventCallback"]=function(){abort("'registerOrientationChangeEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"fillFullscreenChangeEventData"))Module["fillFullscreenChangeEventData"]=function(){abort("'fillFullscreenChangeEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"registerFullscreenChangeEventCallback"))Module["registerFullscreenChangeEventCallback"]=function(){abort("'registerFullscreenChangeEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"registerRestoreOldStyle"))Module["registerRestoreOldStyle"]=function(){abort("'registerRestoreOldStyle' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"hideEverythingExceptGivenElement"))Module["hideEverythingExceptGivenElement"]=function(){abort("'hideEverythingExceptGivenElement' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"restoreHiddenElements"))Module["restoreHiddenElements"]=function(){abort("'restoreHiddenElements' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"setLetterbox"))Module["setLetterbox"]=function(){abort("'setLetterbox' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"currentFullscreenStrategy"))Module["currentFullscreenStrategy"]=function(){abort("'currentFullscreenStrategy' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"restoreOldWindowedStyle"))Module["restoreOldWindowedStyle"]=function(){abort("'restoreOldWindowedStyle' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"softFullscreenResizeWebGLRenderTarget"))Module["softFullscreenResizeWebGLRenderTarget"]=function(){abort("'softFullscreenResizeWebGLRenderTarget' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"doRequestFullscreen"))Module["doRequestFullscreen"]=function(){abort("'doRequestFullscreen' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"fillPointerlockChangeEventData"))Module["fillPointerlockChangeEventData"]=function(){abort("'fillPointerlockChangeEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"registerPointerlockChangeEventCallback"))Module["registerPointerlockChangeEventCallback"]=function(){abort("'registerPointerlockChangeEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"registerPointerlockErrorEventCallback"))Module["registerPointerlockErrorEventCallback"]=function(){abort("'registerPointerlockErrorEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"requestPointerLock"))Module["requestPointerLock"]=function(){abort("'requestPointerLock' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"fillVisibilityChangeEventData"))Module["fillVisibilityChangeEventData"]=function(){abort("'fillVisibilityChangeEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"registerVisibilityChangeEventCallback"))Module["registerVisibilityChangeEventCallback"]=function(){abort("'registerVisibilityChangeEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"registerTouchEventCallback"))Module["registerTouchEventCallback"]=function(){abort("'registerTouchEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"fillGamepadEventData"))Module["fillGamepadEventData"]=function(){abort("'fillGamepadEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"registerGamepadEventCallback"))Module["registerGamepadEventCallback"]=function(){abort("'registerGamepadEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"registerBeforeUnloadEventCallback"))Module["registerBeforeUnloadEventCallback"]=function(){abort("'registerBeforeUnloadEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"fillBatteryEventData"))Module["fillBatteryEventData"]=function(){abort("'fillBatteryEventData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"battery"))Module["battery"]=function(){abort("'battery' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"registerBatteryEventCallback"))Module["registerBatteryEventCallback"]=function(){abort("'registerBatteryEventCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"setCanvasElementSize"))Module["setCanvasElementSize"]=function(){abort("'setCanvasElementSize' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"getCanvasElementSize"))Module["getCanvasElementSize"]=function(){abort("'getCanvasElementSize' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"demangle"))Module["demangle"]=function(){abort("'demangle' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"demangleAll"))Module["demangleAll"]=function(){abort("'demangleAll' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"jsStackTrace"))Module["jsStackTrace"]=function(){abort("'jsStackTrace' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"stackTrace"))Module["stackTrace"]=function(){abort("'stackTrace' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"getEnvStrings"))Module["getEnvStrings"]=function(){abort("'getEnvStrings' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"checkWasiClock"))Module["checkWasiClock"]=function(){abort("'checkWasiClock' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"flush_NO_FILESYSTEM"))Module["flush_NO_FILESYSTEM"]=function(){abort("'flush_NO_FILESYSTEM' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"writeI53ToI64"))Module["writeI53ToI64"]=function(){abort("'writeI53ToI64' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"writeI53ToI64Clamped"))Module["writeI53ToI64Clamped"]=function(){abort("'writeI53ToI64Clamped' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"writeI53ToI64Signaling"))Module["writeI53ToI64Signaling"]=function(){abort("'writeI53ToI64Signaling' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"writeI53ToU64Clamped"))Module["writeI53ToU64Clamped"]=function(){abort("'writeI53ToU64Clamped' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"writeI53ToU64Signaling"))Module["writeI53ToU64Signaling"]=function(){abort("'writeI53ToU64Signaling' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"readI53FromI64"))Module["readI53FromI64"]=function(){abort("'readI53FromI64' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"readI53FromU64"))Module["readI53FromU64"]=function(){abort("'readI53FromU64' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"convertI32PairToI53"))Module["convertI32PairToI53"]=function(){abort("'convertI32PairToI53' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"convertU32PairToI53"))Module["convertU32PairToI53"]=function(){abort("'convertU32PairToI53' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"setImmediateWrapped"))Module["setImmediateWrapped"]=function(){abort("'setImmediateWrapped' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"clearImmediateWrapped"))Module["clearImmediateWrapped"]=function(){abort("'clearImmediateWrapped' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"polyfillSetImmediate"))Module["polyfillSetImmediate"]=function(){abort("'polyfillSetImmediate' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"Browser"))Module["Browser"]=function(){abort("'Browser' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"funcWrappers"))Module["funcWrappers"]=function(){abort("'funcWrappers' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"getFuncWrapper"))Module["getFuncWrapper"]=function(){abort("'getFuncWrapper' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"setMainLoop"))Module["setMainLoop"]=function(){abort("'setMainLoop' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"wget"))Module["wget"]=function(){abort("'wget' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"FS"))Module["FS"]=function(){abort("'FS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"MEMFS"))Module["MEMFS"]=function(){abort("'MEMFS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"TTY"))Module["TTY"]=function(){abort("'TTY' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"PIPEFS"))Module["PIPEFS"]=function(){abort("'PIPEFS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"SOCKFS"))Module["SOCKFS"]=function(){abort("'SOCKFS' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"_setNetworkCallback"))Module["_setNetworkCallback"]=function(){abort("'_setNetworkCallback' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"tempFixedLengthArray"))Module["tempFixedLengthArray"]=function(){abort("'tempFixedLengthArray' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"miniTempWebGLFloatBuffers"))Module["miniTempWebGLFloatBuffers"]=function(){abort("'miniTempWebGLFloatBuffers' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"heapObjectForWebGLType"))Module["heapObjectForWebGLType"]=function(){abort("'heapObjectForWebGLType' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"heapAccessShiftForWebGLHeap"))Module["heapAccessShiftForWebGLHeap"]=function(){abort("'heapAccessShiftForWebGLHeap' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"GL"))Module["GL"]=function(){abort("'GL' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"emscriptenWebGLGet"))Module["emscriptenWebGLGet"]=function(){abort("'emscriptenWebGLGet' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"computeUnpackAlignedImageSize"))Module["computeUnpackAlignedImageSize"]=function(){abort("'computeUnpackAlignedImageSize' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"emscriptenWebGLGetTexPixelData"))Module["emscriptenWebGLGetTexPixelData"]=function(){abort("'emscriptenWebGLGetTexPixelData' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"emscriptenWebGLGetUniform"))Module["emscriptenWebGLGetUniform"]=function(){abort("'emscriptenWebGLGetUniform' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"webglGetUniformLocation"))Module["webglGetUniformLocation"]=function(){abort("'webglGetUniformLocation' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"webglPrepareUniformLocationsBeforeFirstUse"))Module["webglPrepareUniformLocationsBeforeFirstUse"]=function(){abort("'webglPrepareUniformLocationsBeforeFirstUse' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"webglGetLeftBracePos"))Module["webglGetLeftBracePos"]=function(){abort("'webglGetLeftBracePos' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"emscriptenWebGLGetVertexAttrib"))Module["emscriptenWebGLGetVertexAttrib"]=function(){abort("'emscriptenWebGLGetVertexAttrib' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"writeGLArray"))Module["writeGLArray"]=function(){abort("'writeGLArray' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"AL"))Module["AL"]=function(){abort("'AL' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"SDL_unicode"))Module["SDL_unicode"]=function(){abort("'SDL_unicode' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"SDL_ttfContext"))Module["SDL_ttfContext"]=function(){abort("'SDL_ttfContext' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"SDL_audio"))Module["SDL_audio"]=function(){abort("'SDL_audio' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"SDL"))Module["SDL"]=function(){abort("'SDL' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"SDL_gfx"))Module["SDL_gfx"]=function(){abort("'SDL_gfx' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"GLUT"))Module["GLUT"]=function(){abort("'GLUT' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"EGL"))Module["EGL"]=function(){abort("'EGL' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"GLFW_Window"))Module["GLFW_Window"]=function(){abort("'GLFW_Window' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"GLFW"))Module["GLFW"]=function(){abort("'GLFW' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"GLEW"))Module["GLEW"]=function(){abort("'GLEW' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"IDBStore"))Module["IDBStore"]=function(){abort("'IDBStore' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"runAndAbortIfError"))Module["runAndAbortIfError"]=function(){abort("'runAndAbortIfError' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"emval_handle_array"))Module["emval_handle_array"]=function(){abort("'emval_handle_array' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"emval_free_list"))Module["emval_free_list"]=function(){abort("'emval_free_list' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"emval_symbols"))Module["emval_symbols"]=function(){abort("'emval_symbols' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"init_emval"))Module["init_emval"]=function(){abort("'init_emval' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"count_emval_handles"))Module["count_emval_handles"]=function(){abort("'count_emval_handles' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"get_first_emval"))Module["get_first_emval"]=function(){abort("'get_first_emval' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"getStringOrSymbol"))Module["getStringOrSymbol"]=function(){abort("'getStringOrSymbol' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"Emval"))Module["Emval"]=function(){abort("'Emval' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"emval_newers"))Module["emval_newers"]=function(){abort("'emval_newers' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"craftEmvalAllocator"))Module["craftEmvalAllocator"]=function(){abort("'craftEmvalAllocator' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"emval_get_global"))Module["emval_get_global"]=function(){abort("'emval_get_global' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"emval_methodCallers"))Module["emval_methodCallers"]=function(){abort("'emval_methodCallers' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"emval_registeredMethods"))Module["emval_registeredMethods"]=function(){abort("'emval_registeredMethods' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"InternalError"))Module["InternalError"]=function(){abort("'InternalError' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"BindingError"))Module["BindingError"]=function(){abort("'BindingError' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"UnboundTypeError"))Module["UnboundTypeError"]=function(){abort("'UnboundTypeError' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"PureVirtualError"))Module["PureVirtualError"]=function(){abort("'PureVirtualError' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"init_embind"))Module["init_embind"]=function(){abort("'init_embind' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"throwInternalError"))Module["throwInternalError"]=function(){abort("'throwInternalError' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"throwBindingError"))Module["throwBindingError"]=function(){abort("'throwBindingError' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"throwUnboundTypeError"))Module["throwUnboundTypeError"]=function(){abort("'throwUnboundTypeError' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"ensureOverloadTable"))Module["ensureOverloadTable"]=function(){abort("'ensureOverloadTable' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"exposePublicSymbol"))Module["exposePublicSymbol"]=function(){abort("'exposePublicSymbol' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"replacePublicSymbol"))Module["replacePublicSymbol"]=function(){abort("'replacePublicSymbol' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"extendError"))Module["extendError"]=function(){abort("'extendError' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"createNamedFunction"))Module["createNamedFunction"]=function(){abort("'createNamedFunction' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"registeredInstances"))Module["registeredInstances"]=function(){abort("'registeredInstances' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"getBasestPointer"))Module["getBasestPointer"]=function(){abort("'getBasestPointer' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"registerInheritedInstance"))Module["registerInheritedInstance"]=function(){abort("'registerInheritedInstance' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"unregisterInheritedInstance"))Module["unregisterInheritedInstance"]=function(){abort("'unregisterInheritedInstance' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"getInheritedInstance"))Module["getInheritedInstance"]=function(){abort("'getInheritedInstance' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"getInheritedInstanceCount"))Module["getInheritedInstanceCount"]=function(){abort("'getInheritedInstanceCount' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"getLiveInheritedInstances"))Module["getLiveInheritedInstances"]=function(){abort("'getLiveInheritedInstances' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"registeredTypes"))Module["registeredTypes"]=function(){abort("'registeredTypes' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"awaitingDependencies"))Module["awaitingDependencies"]=function(){abort("'awaitingDependencies' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"typeDependencies"))Module["typeDependencies"]=function(){abort("'typeDependencies' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"registeredPointers"))Module["registeredPointers"]=function(){abort("'registeredPointers' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"registerType"))Module["registerType"]=function(){abort("'registerType' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"whenDependentTypesAreResolved"))Module["whenDependentTypesAreResolved"]=function(){abort("'whenDependentTypesAreResolved' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"embind_charCodes"))Module["embind_charCodes"]=function(){abort("'embind_charCodes' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"embind_init_charCodes"))Module["embind_init_charCodes"]=function(){abort("'embind_init_charCodes' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"readLatin1String"))Module["readLatin1String"]=function(){abort("'readLatin1String' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"getTypeName"))Module["getTypeName"]=function(){abort("'getTypeName' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"heap32VectorToArray"))Module["heap32VectorToArray"]=function(){abort("'heap32VectorToArray' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"requireRegisteredType"))Module["requireRegisteredType"]=function(){abort("'requireRegisteredType' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"getShiftFromSize"))Module["getShiftFromSize"]=function(){abort("'getShiftFromSize' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"integerReadValueFromPointer"))Module["integerReadValueFromPointer"]=function(){abort("'integerReadValueFromPointer' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"enumReadValueFromPointer"))Module["enumReadValueFromPointer"]=function(){abort("'enumReadValueFromPointer' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"floatReadValueFromPointer"))Module["floatReadValueFromPointer"]=function(){abort("'floatReadValueFromPointer' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"simpleReadValueFromPointer"))Module["simpleReadValueFromPointer"]=function(){abort("'simpleReadValueFromPointer' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"runDestructors"))Module["runDestructors"]=function(){abort("'runDestructors' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"new_"))Module["new_"]=function(){abort("'new_' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"craftInvokerFunction"))Module["craftInvokerFunction"]=function(){abort("'craftInvokerFunction' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"embind__requireFunction"))Module["embind__requireFunction"]=function(){abort("'embind__requireFunction' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"tupleRegistrations"))Module["tupleRegistrations"]=function(){abort("'tupleRegistrations' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"structRegistrations"))Module["structRegistrations"]=function(){abort("'structRegistrations' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"genericPointerToWireType"))Module["genericPointerToWireType"]=function(){abort("'genericPointerToWireType' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"constNoSmartPtrRawPointerToWireType"))Module["constNoSmartPtrRawPointerToWireType"]=function(){abort("'constNoSmartPtrRawPointerToWireType' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"nonConstNoSmartPtrRawPointerToWireType"))Module["nonConstNoSmartPtrRawPointerToWireType"]=function(){abort("'nonConstNoSmartPtrRawPointerToWireType' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"init_RegisteredPointer"))Module["init_RegisteredPointer"]=function(){abort("'init_RegisteredPointer' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"RegisteredPointer"))Module["RegisteredPointer"]=function(){abort("'RegisteredPointer' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"RegisteredPointer_getPointee"))Module["RegisteredPointer_getPointee"]=function(){abort("'RegisteredPointer_getPointee' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"RegisteredPointer_destructor"))Module["RegisteredPointer_destructor"]=function(){abort("'RegisteredPointer_destructor' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"RegisteredPointer_deleteObject"))Module["RegisteredPointer_deleteObject"]=function(){abort("'RegisteredPointer_deleteObject' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"RegisteredPointer_fromWireType"))Module["RegisteredPointer_fromWireType"]=function(){abort("'RegisteredPointer_fromWireType' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"runDestructor"))Module["runDestructor"]=function(){abort("'runDestructor' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"releaseClassHandle"))Module["releaseClassHandle"]=function(){abort("'releaseClassHandle' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"finalizationGroup"))Module["finalizationGroup"]=function(){abort("'finalizationGroup' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"detachFinalizer_deps"))Module["detachFinalizer_deps"]=function(){abort("'detachFinalizer_deps' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"detachFinalizer"))Module["detachFinalizer"]=function(){abort("'detachFinalizer' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"attachFinalizer"))Module["attachFinalizer"]=function(){abort("'attachFinalizer' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"makeClassHandle"))Module["makeClassHandle"]=function(){abort("'makeClassHandle' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"init_ClassHandle"))Module["init_ClassHandle"]=function(){abort("'init_ClassHandle' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"ClassHandle"))Module["ClassHandle"]=function(){abort("'ClassHandle' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"ClassHandle_isAliasOf"))Module["ClassHandle_isAliasOf"]=function(){abort("'ClassHandle_isAliasOf' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"throwInstanceAlreadyDeleted"))Module["throwInstanceAlreadyDeleted"]=function(){abort("'throwInstanceAlreadyDeleted' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"ClassHandle_clone"))Module["ClassHandle_clone"]=function(){abort("'ClassHandle_clone' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"ClassHandle_delete"))Module["ClassHandle_delete"]=function(){abort("'ClassHandle_delete' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"deletionQueue"))Module["deletionQueue"]=function(){abort("'deletionQueue' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"ClassHandle_isDeleted"))Module["ClassHandle_isDeleted"]=function(){abort("'ClassHandle_isDeleted' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"ClassHandle_deleteLater"))Module["ClassHandle_deleteLater"]=function(){abort("'ClassHandle_deleteLater' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"flushPendingDeletes"))Module["flushPendingDeletes"]=function(){abort("'flushPendingDeletes' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"delayFunction"))Module["delayFunction"]=function(){abort("'delayFunction' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"setDelayFunction"))Module["setDelayFunction"]=function(){abort("'setDelayFunction' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"RegisteredClass"))Module["RegisteredClass"]=function(){abort("'RegisteredClass' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"shallowCopyInternalPointer"))Module["shallowCopyInternalPointer"]=function(){abort("'shallowCopyInternalPointer' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"downcastPointer"))Module["downcastPointer"]=function(){abort("'downcastPointer' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"upcastPointer"))Module["upcastPointer"]=function(){abort("'upcastPointer' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"validateThis"))Module["validateThis"]=function(){abort("'validateThis' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"char_0"))Module["char_0"]=function(){abort("'char_0' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"char_9"))Module["char_9"]=function(){abort("'char_9' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"makeLegalFunctionName"))Module["makeLegalFunctionName"]=function(){abort("'makeLegalFunctionName' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"warnOnce"))Module["warnOnce"]=function(){abort("'warnOnce' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"stackSave"))Module["stackSave"]=function(){abort("'stackSave' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"stackRestore"))Module["stackRestore"]=function(){abort("'stackRestore' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"stackAlloc"))Module["stackAlloc"]=function(){abort("'stackAlloc' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"AsciiToString"))Module["AsciiToString"]=function(){abort("'AsciiToString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"stringToAscii"))Module["stringToAscii"]=function(){abort("'stringToAscii' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"UTF16ToString"))Module["UTF16ToString"]=function(){abort("'UTF16ToString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"stringToUTF16"))Module["stringToUTF16"]=function(){abort("'stringToUTF16' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"lengthBytesUTF16"))Module["lengthBytesUTF16"]=function(){abort("'lengthBytesUTF16' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"UTF32ToString"))Module["UTF32ToString"]=function(){abort("'UTF32ToString' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"stringToUTF32"))Module["stringToUTF32"]=function(){abort("'stringToUTF32' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"lengthBytesUTF32"))Module["lengthBytesUTF32"]=function(){abort("'lengthBytesUTF32' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"allocateUTF8"))Module["allocateUTF8"]=function(){abort("'allocateUTF8' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};if(!Object.getOwnPropertyDescriptor(Module,"allocateUTF8OnStack"))Module["allocateUTF8OnStack"]=function(){abort("'allocateUTF8OnStack' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")};Module["writeStackCookie"]=writeStackCookie;Module["checkStackCookie"]=checkStackCookie;if(!Object.getOwnPropertyDescriptor(Module,"ALLOC_NORMAL"))Object.defineProperty(Module,"ALLOC_NORMAL",{configurable:true,get:function(){abort("'ALLOC_NORMAL' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")}});if(!Object.getOwnPropertyDescriptor(Module,"ALLOC_STACK"))Object.defineProperty(Module,"ALLOC_STACK",{configurable:true,get:function(){abort("'ALLOC_STACK' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)")}});var calledRun;function ExitStatus(status){this.name="ExitStatus";this.message="Program terminated with exit("+status+")";this.status=status}dependenciesFulfilled=function runCaller(){if(!calledRun)run();if(!calledRun)dependenciesFulfilled=runCaller};function stackCheckInit(){_emscripten_stack_init();writeStackCookie()}function run(args){args=args||arguments_;if(runDependencies>0){return}stackCheckInit();preRun();if(runDependencies>0){return}function doRun(){if(calledRun)return;calledRun=true;Module["calledRun"]=true;if(ABORT)return;initRuntime();readyPromiseResolve(Module);if(Module["onRuntimeInitialized"])Module["onRuntimeInitialized"]();assert(!Module["_main"],'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]');postRun()}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout(function(){setTimeout(function(){Module["setStatus"]("")},1);doRun()},1)}else{doRun()}checkStackCookie()}Module["run"]=run;function checkUnflushedContent(){var oldOut=out;var oldErr=err;var has=false;out=err=function(x){has=true};try{var flush=flush_NO_FILESYSTEM;if(flush)flush()}catch(e){}out=oldOut;err=oldErr;if(has){warnOnce("stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the FAQ), or make sure to emit a newline when you printf etc.");warnOnce("(this may also be due to not including full filesystem support - try building with -s FORCE_FILESYSTEM=1)")}}function exit(status,implicit){EXITSTATUS=status;checkUnflushedContent();if(keepRuntimeAlive()){if(!implicit){var msg="program exited (with status: "+status+"), but EXIT_RUNTIME is not set, so halting execution but not exiting the runtime or preventing further async execution (build with EXIT_RUNTIME=1, if you want a true shutdown)";readyPromiseReject(msg);err(msg)}}else{exitRuntime()}procExit(status)}function procExit(code){EXITSTATUS=code;if(!keepRuntimeAlive()){if(Module["onExit"])Module["onExit"](code);ABORT=true}quit_(code,new ExitStatus(code))}if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].pop()()}}run();


  return PHYSX.ready
}
);
})();
if (typeof exports === 'object' && typeof module === 'object')
  module.exports = PHYSX;
else if (typeof define === 'function' && define['amd'])
  define([], function() { return PHYSX; });
else if (typeof exports === 'object')
  exports["PHYSX"] = PHYSX;

window.PHYSX = Laya.WasmAdapter.create(PHYSX);
}