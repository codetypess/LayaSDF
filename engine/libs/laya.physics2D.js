(function (exports, Laya) {
    'use strict';

    exports.PhysicsShape = void 0;
    (function (PhysicsShape) {
        PhysicsShape[PhysicsShape["BoxShape"] = 0] = "BoxShape";
        PhysicsShape[PhysicsShape["CircleShape"] = 1] = "CircleShape";
        PhysicsShape[PhysicsShape["PolygonShape"] = 2] = "PolygonShape";
        PhysicsShape[PhysicsShape["ChainShape"] = 3] = "ChainShape";
        PhysicsShape[PhysicsShape["EdgeShape"] = 4] = "EdgeShape";
    })(exports.PhysicsShape || (exports.PhysicsShape = {}));
    class FixtureBox2DDef {
    }

    class Physics2DOption {
    }
    Physics2DOption.allowSleeping = false;
    Physics2DOption.gravity = { x: 0, y: 9.8 };
    Physics2DOption.customUpdate = false;
    Physics2DOption.velocityIterations = 8;
    Physics2DOption.positionIterations = 3;
    Physics2DOption.pixelRatio = 50;
    Physics2DOption.debugDraw = true;
    Physics2DOption.drawShape = true;
    Physics2DOption.drawJoint = true;
    Physics2DOption.drawAABB = false;
    Physics2DOption.drawCenterOfMass = false;

    class Physics2D extends Laya.EventDispatcher {
        constructor() {
            super(...arguments);
            this._eventList = [];
        }
        static get I() {
            return Physics2D._I || (Physics2D._I = new Physics2D());
        }
        set enableDebugDraw(enable) {
            if (enable) {
                this._factory.createDebugDraw(this._factory.drawFlags_shapeBit);
            }
            else {
                this._factory.removeDebugDraw();
            }
        }
        set drawShape(enable) {
            let flag = this._factory.drawFlags_shapeBit;
            if (enable) {
                this._factory.appendFlags(flag);
            }
            else {
                this._factory.clearFlags(flag);
            }
        }
        set drawJoint(enable) {
            let flag = this._factory.drawFlags_jointBit;
            if (enable) {
                this._factory.appendFlags(flag);
            }
            else {
                this._factory.clearFlags(flag);
            }
        }
        set drawAABB(enable) {
            let flag = this._factory.drawFlags_aabbBit;
            if (enable) {
                this._factory.appendFlags(flag);
            }
            else {
                this._factory.clearFlags(flag);
            }
        }
        set drawPair(enable) {
            let flag = this._factory.drawFlags_pairBit;
            if (enable) {
                this._factory.appendFlags(flag);
            }
            else {
                this._factory.clearFlags(flag);
            }
        }
        set drawCenterOfMass(enable) {
            let flag = this._factory.drawFlags_centerOfMassBit;
            if (enable) {
                this._factory.appendFlags(flag);
            }
            else {
                this._factory.clearFlags(flag);
            }
        }
        get allowSleeping() {
            return this._factory.allowSleeping;
        }
        set allowSleeping(value) {
            this._factory.allowSleeping = value;
        }
        get gravity() {
            return this._factory.gravity;
        }
        set gravity(value) {
            this._factory.gravity = value;
        }
        get worldRoot() {
            return this._worldRoot || Laya.ILaya.stage;
        }
        set worldRoot(value) {
            this._worldRoot = value;
            if (value) {
                var p = value.localToGlobal(Laya.Point.TEMP.setTo(0, 0));
                this._factory.shiftOrigin(-p.x, -p.y);
            }
        }
        get bodyCount() {
            return this._factory.bodyCount;
        }
        get contactCount() {
            return this._factory.contactCount;
        }
        get jointCount() {
            return this._factory.jointCount;
        }
        _addRigidBody(body) {
            this._rigiBodyList.add(body);
        }
        _removeRigidBody(body) {
            this._rigiBodyList.remove(body);
        }
        _updataRigidBodyAttribute(body) {
            this._updataattributeLists.add(body);
        }
        _removeRigidBodyAttribute(body) {
            this._updataattributeLists.remove(body);
        }
        _update() {
            for (var i = 0, n = this._updataattributeLists.length; i < n; i++) {
                this._updataattributeLists.elements[i]._updatePhysicsAttribute();
            }
            this._updataattributeLists.clear();
            var delta = Math.min(Laya.ILaya.timer.delta / 1000, 0.033);
            this._factory.update(delta);
            this._updatePhysicsTransformToRender();
            var len = this._eventList.length;
            if (len > 0) {
                for (var i = 0; i < len; i += 2) {
                    this._factory.sendEvent(this._eventList[i], this._eventList[i + 1]);
                }
                this._eventList.length = 0;
            }
        }
        _updatePhysicsTransformToRender() {
            for (var i = 0, n = this._rigiBodyList.length; i < n; i++) {
                this._rigiBodyList.elements[i]._updatePhysicsTransformToRender();
            }
        }
        enable() {
            if (this._factory) {
                if (Laya.PlayerConfig.physics2D != null)
                    Object.assign(Physics2DOption, Laya.PlayerConfig.physics2D);
                return this._factory.initialize().then(() => {
                    this.start();
                    return Promise.resolve();
                });
            }
            else
                return Promise.resolve();
        }
        start() {
            if (!this._enabled) {
                this._enabled = true;
                this._factory.start();
                this.allowSleeping = Physics2DOption.allowSleeping;
                this._emptyBody = this._factory.createBody(null);
            }
            else {
                Laya.ILaya.physicsTimer.clear(this, this._update);
            }
            if (Physics2DOption.debugDraw) {
                this.enableDebugDraw = true;
                this.drawShape = Physics2DOption.drawShape;
                this.drawJoint = Physics2DOption.drawJoint;
                this.drawAABB = Physics2DOption.drawAABB;
                this.drawCenterOfMass = Physics2DOption.drawCenterOfMass;
            }
            else {
                this.enableDebugDraw = false;
            }
            if (!this._rigiBodyList)
                this._rigiBodyList = new Laya.SingletonList();
            else
                this._rigiBodyList.clear();
            if (!this._updataattributeLists)
                this._updataattributeLists = new Laya.SingletonList();
            else
                this._updataattributeLists.clear();
            if (!Physics2DOption.customUpdate && Laya.LayaEnv.isPlaying)
                Laya.ILaya.physicsTimer.frameLoop(1, this, this._update);
        }
        destroyWorld() {
            this._enabled = false;
            this._factory.destroyWorld();
            Laya.ILaya.physicsTimer.clear(this, this._update);
        }
        stop() {
            this._rigiBodyList.clear();
            this._updataattributeLists.clear();
            Laya.ILaya.physicsTimer.clear(this, this._update);
        }
        getBodyCount() {
            return this._factory.bodyCount;
        }
        getContactCount() {
            return this._factory.contactCount;
        }
        getJointCount() {
            return this._factory.jointCount;
        }
        updatePhysicsByWorldRoot() {
            if (!!this.worldRoot) {
                var p = this.worldRoot.localToGlobal(Laya.Point.TEMP.setTo(0, 0));
                this._factory.shiftOrigin(-p.x, -p.y);
            }
        }
    }
    Laya.Laya.addInitCallback(() => Physics2D.I.enable());

    class RigidBody2DInfo {
        constructor() {
            this.position = new Laya.Vector2();
            this.linearVelocity = new Laya.Vector2();
        }
    }

    class RigidBody extends Laya.Component {
        constructor() {
            super(...arguments);
            this._type = "dynamic";
            this._allowSleep = true;
            this._angularVelocity = 0;
            this._angularDamping = 0;
            this._linearVelocity = { x: 0, y: 0 };
            this._linearDamping = 0;
            this._bullet = false;
            this._allowRotation = true;
            this._gravityScale = 1;
            this.group = 0;
            this.category = 1;
            this.mask = -1;
            this.label = "RigidBody";
            this._useAutoMass = true;
            this._mass = 1;
            this._centerofMass = { x: 0.5, y: 0.5 };
            this._inertia = 10;
        }
        get useAutoMass() {
            return this._useAutoMass;
        }
        set useAutoMass(value) {
            this._useAutoMass = value;
            this._needrefeshShape();
        }
        get mass() {
            let mass;
            if (this._useAutoMass) {
                mass = this.getMass();
            }
            else {
                mass = this._mass;
            }
            return mass;
        }
        set mass(value) {
            this._mass = value;
            if (!this._useAutoMass) {
                this._needrefeshShape();
            }
        }
        get centerOfMass() {
            let center;
            if (this._useAutoMass) {
                center = this.getCenter();
            }
            else {
                center = this._centerofMass;
            }
            return center;
        }
        set centerOfMass(value) {
            if (!this._useAutoMass) {
                this._centerofMass = value;
                this._needrefeshShape();
            }
        }
        get inertia() {
            let inertia;
            if (this._useAutoMass) {
                inertia = this.getInertia();
            }
            else {
                inertia = this._inertia;
            }
            return inertia;
        }
        set inertia(value) {
            if (!this._useAutoMass) {
                this._inertia = value;
                this._needrefeshShape();
            }
        }
        get body() {
            if (!this._body)
                this._onAwake();
            return this._body;
        }
        get type() {
            return this._type;
        }
        set type(value) {
            this._type = value;
            this._updateBodyType();
        }
        get gravityScale() {
            return this._gravityScale;
        }
        set gravityScale(value) {
            this._gravityScale = value;
            if (this._body)
                Physics2D.I._factory.set_rigidBody_gravityScale(this._body, value);
        }
        get allowRotation() {
            return this._allowRotation;
        }
        set allowRotation(value) {
            this._allowRotation = value;
            if (this._body)
                Physics2D.I._factory.set_rigidBody_allowRotation(this._body, !value);
        }
        get allowSleep() {
            return this._allowSleep;
        }
        set allowSleep(value) {
            this._allowSleep = value;
            if (this._body)
                Physics2D.I._factory.set_rigidBody_allowSleep(this._body, value);
        }
        get angularDamping() {
            return this._angularDamping;
        }
        set angularDamping(value) {
            this._angularDamping = value;
            if (this._body)
                Physics2D.I._factory.set_rigidBody_angularDamping(this._body, value);
        }
        get angularVelocity() {
            if (this._body)
                return Physics2D.I._factory.get_rigidBody_angularVelocity(this._body);
            return this._angularVelocity;
        }
        set angularVelocity(value) {
            this._angularVelocity = value;
            if (this._type == "static") {
                return;
            }
            if (this._body)
                Physics2D.I._factory.set_rigidBody_angularVelocity(this.body, value);
        }
        get linearDamping() {
            return this._linearDamping;
        }
        set linearDamping(value) {
            this._linearDamping = value;
            if (this._body)
                Physics2D.I._factory.set_rigidBody_linearDamping(this._body, value);
        }
        get linearVelocity() {
            if (this._body) {
                var vec = Physics2D.I._factory.get_rigidBody_linearVelocity(this._body);
                return { x: vec.x, y: vec.y };
            }
            return this._linearVelocity;
        }
        set linearVelocity(value) {
            if (!value)
                return;
            if (value instanceof Array) {
                value = { x: value[0], y: value[1] };
            }
            this._linearVelocity = value;
            if (this._type == "static") {
                return;
            }
            if (this._body)
                Physics2D.I._factory.set_rigidBody_linearVelocity(this._body, value);
        }
        get bullet() {
            return this._bullet;
        }
        set bullet(value) {
            this._bullet = value;
            if (this._body)
                Physics2D.I._factory.set_rigidBody_bullet(this._body, value);
        }
        _createBody() {
            if (this._body || !this.owner)
                return;
            let factory = Physics2D.I._factory;
            var sp = this.owner;
            var defRigidBodyDef = new RigidBody2DInfo();
            defRigidBodyDef.position.setValue(sp.globalPosX, sp.globalPosY);
            defRigidBodyDef.angle = Laya.Utils.toRadian(sp.globalRotation);
            defRigidBodyDef.allowSleep = this._allowSleep;
            defRigidBodyDef.angularDamping = this._angularDamping;
            defRigidBodyDef.bullet = this._bullet;
            defRigidBodyDef.fixedRotation = !this._allowRotation;
            defRigidBodyDef.gravityScale = this._gravityScale;
            defRigidBodyDef.linearDamping = this._linearDamping;
            defRigidBodyDef.group = this.group;
            var obj = this._linearVelocity;
            defRigidBodyDef.type = this._type;
            if (this._type == "static") {
                defRigidBodyDef.angularVelocity = 0;
                defRigidBodyDef.linearVelocity.setValue(0, 0);
            }
            else {
                defRigidBodyDef.angularVelocity = this._angularVelocity;
                if (obj && obj.x != 0 || obj.y != 0) {
                    defRigidBodyDef.linearVelocity.setValue(obj.x, obj.y);
                }
            }
            this._body = factory.rigidBodyDef_Create(defRigidBodyDef);
            this._needrefeshShape();
        }
        _updateBodyType() {
            if (!this._body)
                return;
            Physics2D.I._factory.set_rigidBody_type(this.body, this._type);
            if (this.type == "static") {
                Physics2D.I._removeRigidBody(this);
            }
            else {
                Physics2D.I._addRigidBody(this);
            }
        }
        _onAwake() {
            this.owner.cacheGlobal = true;
            this._createBody();
            this.owner.on("GlobaChange", this, this._globalChangeHandler);
        }
        _globalChangeHandler(flag) {
            if (flag & RigidBody.changeFlag)
                this._needrefeshShape();
        }
        _onEnable() {
            this.owner.cacheGlobal = true;
            Physics2D.I._factory.set_RigibBody_Enable(this._body, true);
            this._updateBodyType();
            this.owner.on("GlobaChange", this, this._globalChangeHandler);
        }
        _needrefeshShape() {
            Physics2D.I._updataRigidBodyAttribute(this);
        }
        _updatePhysicsAttribute() {
            var factory = Physics2D.I._factory;
            var sp = this.owner;
            factory.set_RigibBody_Transform(this._body, sp.globalPosX, sp.globalPosY, Laya.Utils.toRadian(this.owner.globalRotation));
            var comps = this.owner.getComponents(ColliderBase);
            if (comps) {
                for (var i = 0, n = comps.length; i < n; i++) {
                    var collider = comps[i];
                    collider.rigidBody = this;
                    collider._refresh();
                }
                if (this._useAutoMass) {
                    factory.retSet_rigidBody_MassData(this._body);
                }
                else {
                    factory.set_rigidbody_Mass(this._body, this._mass, this._centerofMass, this._inertia);
                }
                factory.set_rigidbody_Awake(this._body, true);
                this.angularVelocity = this._angularVelocity;
                this.linearVelocity = this._linearVelocity;
                this.owner.event("shapeChange");
            }
        }
        _updatePhysicsTransformToRender() {
            if (this.type == "static") {
                return;
            }
            var factory = Physics2D.I._factory;
            if (Physics2D.I._factory.get_rigidBody_IsAwake(this._body)) {
                var pos = Laya.Vector2.TempVector2;
                factory.get_RigidBody_Position(this.body, pos);
                var sp = this.owner;
                sp.setGlobalPos(pos.x, pos.y);
                sp.globalRotation = Laya.Utils.toAngle(factory.get_RigidBody_Angle(this.body));
            }
        }
        _onDisable() {
            Physics2D.I._removeRigidBody(this);
            Physics2D.I._removeRigidBodyAttribute(this);
            this.owner.off("GlobaChange", this, this._globalChangeHandler);
            Physics2D.I._factory.set_RigibBody_Enable(this._body, false);
        }
        _onDestroy() {
            Physics2D.I._removeRigidBody(this);
            Physics2D.I._removeRigidBodyAttribute(this);
            this.owner.off("GlobaChange", this, this._globalChangeHandler);
            this._body && Physics2D.I._factory.removeBody(this._body);
            this._body = null;
        }
        _getOriBody() {
            return this._body;
        }
        getBody() {
            if (!this._body)
                this._onAwake();
            return this._body;
        }
        applyForce(position, force) {
            if (!this._body)
                this._onAwake();
            Physics2D.I._factory.rigidBody_applyForce(this._body, force, position);
        }
        applyForceToCenter(force) {
            if (!this._body)
                this._onAwake();
            Physics2D.I._factory.rigidBody_applyForceToCenter(this._body, force);
        }
        applyLinearImpulse(position, impulse) {
            if (!this._body)
                this._onAwake();
            Physics2D.I._factory.rigidbody_ApplyLinearImpulse(this._body, impulse, position);
        }
        applyLinearImpulseToCenter(impulse) {
            if (!this._body)
                this._onAwake();
            Physics2D.I._factory.rigidbody_ApplyLinearImpulseToCenter(this._body, impulse);
        }
        applyTorque(torque) {
            if (!this._body)
                this._onAwake();
            Physics2D.I._factory.rigidbody_applyTorque(this._body, torque);
        }
        setVelocity(velocity) {
            if (!this._body)
                this._onAwake();
            this._linearVelocity = velocity;
            Physics2D.I._factory.set_rigidBody_linearVelocity(this._body, velocity);
        }
        setAngle(value) {
            if (!this._body)
                this._onAwake();
            var factory = Physics2D.I._factory;
            var sp = this.owner;
            factory.set_RigibBody_Transform(this._body, sp.globalPosX, sp.globalPosY, value);
            factory.set_rigidbody_Awake(this._body, true);
        }
        getMass() {
            return this._body ? Physics2D.I._factory.get_rigidbody_Mass(this._body) : 0;
        }
        getCenter() {
            if (!this._body)
                this._onAwake();
            return Physics2D.I._factory.get_rigidBody_Center(this._body);
        }
        getInertia() {
            if (!this._body)
                this._onAwake();
            return Physics2D.I._factory.get_rigidbody_Inertia(this._body);
        }
        getWorldCenter() {
            if (!this._body)
                this._onAwake();
            return Physics2D.I._factory.get_rigidBody_WorldCenter(this._body);
        }
        getWorldPoint(x, y) {
            return this.owner._getGlobalCacheLocalToGlobal(x, y);
        }
        getLocalPoint(x, y) {
            return this.owner._getGlobalCacheGlobalToLocal(x, y);
        }
    }
    RigidBody.changeFlag = Laya.Sprite.Sprite_GlobalDeltaFlage_Position_X | Laya.Sprite.Sprite_GlobalDeltaFlage_Position_Y | Laya.Sprite.Sprite_GlobalDeltaFlage_Rotation | Laya.Sprite.Sprite_GlobalDeltaFlage_Scale_X | Laya.Sprite.Sprite_GlobalDeltaFlage_Scale_Y;

    class ColliderBase extends Laya.Component {
        get scaleX() {
            return this.owner.globalScaleX;
        }
        get scaleY() {
            return this.owner.globalScaleY;
        }
        get pivotoffx() {
            return this._x - this.owner.pivotX;
        }
        get pivotoffy() {
            return this._y - this.owner.pivotY;
        }
        get x() {
            return this._x;
        }
        set x(value) {
            if (this._x == value)
                return;
            this._x = value;
            this._needupdataShapeAttribute();
        }
        get y() {
            return this._y;
        }
        set y(value) {
            if (this._y == value)
                return;
            this._y = value;
            this._needupdataShapeAttribute();
        }
        get isSensor() {
            return this._isSensor;
        }
        set isSensor(value) {
            if (this._isSensor == value)
                return;
            this._isSensor = value;
            this._needupdataShapeAttribute();
        }
        get density() {
            return this._density;
        }
        set density(value) {
            if (this._density == value)
                return;
            this._density = value;
            this._needupdataShapeAttribute();
        }
        get friction() {
            return this._friction;
        }
        set friction(value) {
            if (this._friction == value)
                return;
            this._friction = value;
            this._needupdataShapeAttribute();
        }
        get restitution() {
            return this._restitution;
        }
        set restitution(value) {
            if (this._restitution == value)
                return;
            this._restitution = value;
            this._needupdataShapeAttribute();
        }
        constructor() {
            super();
            this._isSensor = false;
            this._density = 10;
            this._friction = 0.2;
            this._restitution = 0;
            this._x = 0;
            this._y = 0;
            this._singleton = false;
        }
        _setShapeData(shape) {
            throw ("ColliderBase: must override it.");
        }
        _createfixture() {
            let factory = Physics2D.I._factory;
            var body = this.rigidBody.body;
            var def = ColliderBase.TempDef;
            def.density = this.density;
            def.friction = this.friction;
            def.isSensor = this.isSensor;
            def.restitution = this.restitution;
            def.shape = this._physicShape;
            let fixtureDef = factory.createFixtureDef(def);
            this._setShapeData(fixtureDef._shape);
            this._fixture = factory.createfixture(body, fixtureDef);
        }
        resetFixtureData() {
            var def = ColliderBase.TempDef;
            def.density = this.density;
            def.friction = this.friction;
            def.isSensor = this.isSensor;
            def.restitution = this.restitution;
            Physics2D.I._factory.resetFixtureData(this._fixture, def);
            this._setShapeData(this._fixture.shape);
        }
        _onEnable() {
            if (this.owner.getComponent(RigidBody)) {
                this.rigidBody = this.owner.getComponent(RigidBody);
                this._needupdataShapeAttribute();
            }
        }
        _onAwake() {
            if (this.owner.getComponent(RigidBody)) {
                this.rigidBody = this.owner.getComponent(RigidBody);
                this._needupdataShapeAttribute();
            }
        }
        _needupdataShapeAttribute() {
            if (!this.rigidBody) {
                return;
            }
            this.rigidBody._needrefeshShape();
        }
        _refresh() {
            if (!this.enabled) {
                return;
            }
            let factory = Physics2D.I._factory;
            if (!this._fixture)
                this._createfixture();
            else
                this.resetFixtureData();
            factory.set_fixtureDef_GroupIndex(this._fixture, this.rigidBody.group);
            factory.set_fixtureDef_CategoryBits(this._fixture, this.rigidBody.category);
            factory.set_fixtureDef_maskBits(this._fixture, this.rigidBody.mask);
            factory.set_fixture_collider(this._fixture, this);
        }
        _onDisable() {
            let factory = Physics2D.I._factory;
            if (this._fixture && this.rigidBody._getOriBody()) {
                factory.rigidBody_DestroyFixture(this.rigidBody.body, this._fixture);
            }
            this._fixture = null;
            this.rigidBody = null;
        }
    }
    ColliderBase.TempDef = new FixtureBox2DDef();

    class BoxCollider extends ColliderBase {
        get width() {
            return this._width;
        }
        set width(value) {
            if (value <= 0)
                throw "BoxCollider size cannot be less than 0";
            if (this._width == value)
                return;
            this._width = value;
            this._needupdataShapeAttribute();
        }
        get height() {
            return this._height;
        }
        set height(value) {
            if (value <= 0)
                throw "BoxCollider size cannot be less than 0";
            if (this._height == value)
                return;
            this._height = value;
            this._needupdataShapeAttribute();
        }
        constructor() {
            super();
            this._width = 100;
            this._height = 100;
            this._physicShape = exports.PhysicsShape.BoxShape;
        }
        _setShapeData(shape) {
            let helfW = this._width * 0.5;
            let helfH = this._height * 0.5;
            var center = {
                x: helfW + this.pivotoffx,
                y: helfH + this.pivotoffy
            };
            Physics2D.I._factory.set_collider_SetAsBox(shape, helfW, helfH, center, Math.abs(this.scaleX), Math.abs(this.scaleY));
        }
    }

    class ChainCollider extends ColliderBase {
        get points() {
            return this._points;
        }
        set points(value) {
            if (!value)
                throw "ChainCollider points cannot be empty";
            this._points = value;
            var arr = this._points.split(",");
            let length = arr.length;
            this._datas = [];
            for (var i = 0, n = length; i < n; i++) {
                this._datas.push(parseInt(arr[i]));
            }
            this._needupdataShapeAttribute();
        }
        get datas() {
            return this._datas;
        }
        set datas(value) {
            if (!value)
                throw "ChainCollider datas cannot be empty";
            this._datas = value;
            this._needupdataShapeAttribute();
        }
        get loop() {
            return this._loop;
        }
        set loop(value) {
            if (this._loop == value)
                return;
            this._loop = value;
            this._needupdataShapeAttribute();
        }
        constructor() {
            super();
            this._points = "0,0,100,0";
            this._datas = [];
            this._loop = false;
            this._physicShape = exports.PhysicsShape.ChainShape;
        }
        _setShapeData(shape) {
            var len = this._datas.length;
            if (len % 2 == 1)
                throw "ChainCollider datas lenth must a multiplier of 2";
            Physics2D.I._factory.set_ChainShape_data(shape, this.pivotoffx, this.pivotoffy, this._datas, this._loop, this.scaleX, this.scaleY);
        }
        onAdded() {
            super.onAdded();
            if (this._datas.length == 0) {
                let sp = this.owner;
                this._datas.push(0, 0, sp.width, 0, 0, sp.height, sp.width, sp.height);
            }
        }
    }

    class CircleCollider extends ColliderBase {
        get radius() {
            return this._radius;
        }
        set radius(value) {
            if (value <= 0)
                throw "CircleCollider radius cannot be less than 0";
            if (this._radius == value)
                return;
            this._radius = value;
            this._needupdataShapeAttribute();
        }
        constructor() {
            super();
            this._radius = 50;
            this._physicShape = exports.PhysicsShape.CircleShape;
        }
        _setShapeData(shape) {
            var scale = Math.max(Math.abs(this.scaleX), Math.abs(this.scaleY));
            let radius = this.radius;
            Physics2D.I._factory.set_CircleShape_radius(shape, radius, scale);
            Physics2D.I._factory.set_CircleShape_pos(shape, this.x, this.y, scale);
        }
    }

    class EdgeCollider extends ColliderBase {
        get points() {
            return this._points;
        }
        set points(value) {
            if (!value)
                throw "EdgeCollider points cannot be empty";
            this._points = value;
            var arr = this._points.split(",");
            let length = arr.length;
            this._datas = [];
            for (var i = 0, n = length; i < n; i++) {
                this._datas.push(parseInt(arr[i]));
            }
            this._needupdataShapeAttribute();
        }
        get datas() {
            return this._datas;
        }
        set datas(value) {
            if (!value)
                throw "EdgeCollider points cannot be empty";
            this._datas = value;
            this._needupdataShapeAttribute();
        }
        constructor() {
            super();
            this._points = "0,0,100,0";
            this._datas = [0, 0, 100, 0];
            this._physicShape = exports.PhysicsShape.EdgeShape;
        }
        _setShapeData(shape) {
            var len = this._datas.length;
            if (len % 2 == 1)
                throw "EdgeCollider points lenth must a multiplier of 2";
            Physics2D.I._factory.set_EdgeShape_data(shape, this.pivotoffx, this.pivotoffy, this._datas, this.scaleX, this.scaleY);
        }
    }

    class JointBase extends Laya.Component {
        get joint() {
            if (!this._joint)
                this._createJoint();
            return this._joint;
        }
        constructor() {
            super();
            this._factory = Physics2D.I._factory;
            this._singleton = false;
        }
        getBodyAnchor(body, anchorx, anchory) {
            Laya.Point.TEMP.setTo(anchorx, anchory);
            let node = body.owner;
            if (node) {
                if (node.transform) {
                    node.transform.transformPointN(Laya.Point.TEMP);
                }
                else {
                    Laya.Point.TEMP.x *= node.scaleX;
                    Laya.Point.TEMP.y *= node.scaleY;
                }
            }
            return Laya.Point.TEMP;
        }
        _onEnable() {
            this._createJoint();
        }
        _onAwake() {
        }
        _createJoint() {
        }
        _onDisable() {
            if (this._joint && this._factory.getJoint_userData(this._joint) && !this._factory.getJoint_userData_destroy(this._joint)) {
                Physics2D.I._factory.removeJoint(this._joint);
            }
            this._joint = null;
        }
    }

    class physics2D_DistancJointDef {
        constructor() {
            this.localAnchorA = new Laya.Vector2();
            this.localAnchorB = new Laya.Vector2();
        }
    }
    class physics2D_GearJointDef {
    }
    class physics2D_MotorJointDef {
        constructor() {
            this.linearOffset = new Laya.Vector2();
        }
    }
    class physics2D_MouseJointJointDef {
        constructor() {
            this.target = new Laya.Vector2();
        }
    }
    class physics2D_PrismaticJointDef {
        constructor() {
            this.anchor = new Laya.Vector2();
            this.axis = new Laya.Vector2();
        }
    }
    class physics2D_PulleyJointDef {
        constructor() {
            this.groundAnchorA = new Laya.Vector2();
            this.groundAnchorB = new Laya.Vector2();
            this.localAnchorA = new Laya.Vector2();
            this.localAnchorB = new Laya.Vector2();
        }
    }
    class physics2D_RevoluteJointDef {
        constructor() {
            this.anchor = new Laya.Vector2();
        }
    }
    class physics2D_WeldJointDef {
        constructor() {
            this.anchor = new Laya.Vector2();
        }
    }
    class physics2D_WheelJointDef {
        constructor() {
            this.anchor = new Laya.Vector2();
            this.axis = new Laya.Vector2();
        }
    }

    class DistanceJoint extends JointBase {
        constructor() {
            super(...arguments);
            this._length = 0;
            this._maxLength = -1;
            this._minLength = -1;
            this._frequency = 1;
            this._dampingRatio = 0;
            this.selfAnchor = [0, 0];
            this.otherAnchor = [0, 0];
            this.collideConnected = false;
        }
        get length() {
            return this._length;
        }
        set length(value) {
            this._length = value;
            if (this._joint)
                this._factory.set_DistanceJoint_length(this._joint, value);
        }
        get minLength() {
            return this._minLength;
        }
        set minLength(value) {
            this._minLength = value;
            if (this._joint)
                this._factory.set_DistanceJoint_MinLength(this._joint, value);
        }
        get maxLength() {
            return this._maxLength;
        }
        set maxLength(value) {
            this._maxLength = value;
            if (this._joint)
                this._factory.set_DistanceJoint_MaxLength(this._joint, value);
        }
        get frequency() {
            return this._frequency;
        }
        set frequency(value) {
            this._frequency = value;
            if (this._joint) {
                this._factory.set_DistanceJointStiffnessDamping(this._joint, this._frequency, this._dampingRatio);
            }
        }
        get damping() {
            return this._dampingRatio;
        }
        set damping(value) {
            this._dampingRatio = value;
            if (this._joint) {
                this._factory.set_DistanceJointStiffnessDamping(this._joint, this._frequency, this._dampingRatio);
            }
        }
        get jointLength() {
            if (this._joint) {
                return this._factory.phyToLayaValue(this.joint.GetLength());
            }
            else {
                return 0;
            }
        }
        _createJoint() {
            if (!this._joint) {
                let node = this.owner;
                this.selfBody = this.selfBody || node.getComponent(RigidBody);
                if (!this.selfBody)
                    throw "selfBody can not be empty";
                let point = this.getBodyAnchor(this.selfBody, this.selfAnchor[0], this.selfAnchor[1]);
                var def = DistanceJoint._temp || (DistanceJoint._temp = new physics2D_DistancJointDef());
                def.bodyB = this.selfBody.getBody();
                def.localAnchorB.setValue(point.x, point.y);
                this.selfBody.owner.on("shapeChange", this, this._refeahJoint);
                if (this.otherBody) {
                    def.bodyA = this.otherBody.getBody();
                    point = this.getBodyAnchor(this.otherBody, this.otherAnchor[0], this.otherAnchor[1]);
                    def.localAnchorA.setValue(point.x, point.y);
                    this.otherBody.owner.on("shapeChange", this, this._refeahJoint);
                }
                else {
                    def.bodyA = Physics2D.I._emptyBody;
                    def.localAnchorA.setValue(this.otherAnchor[0], this.otherAnchor[1]);
                }
                def.dampingRatio = this._dampingRatio;
                def.frequency = this._frequency;
                def.collideConnected = this.collideConnected;
                def.length = this._length;
                def.maxLength = this._maxLength;
                def.minLength = this._minLength;
                this._joint = this._factory.createDistanceJoint(def);
            }
        }
        _refeahJoint() {
            if (this._joint) {
                this._factory.set_DistanceJointStiffnessDamping(this._joint, this._frequency, this._dampingRatio);
            }
        }
        onDestroy() {
            super.onDestroy();
            this.selfBody.owner.off("shapeChange", this._refeahJoint);
            if (this.otherBody)
                this.otherBody.owner.off("shapeChange", this._refeahJoint);
        }
    }

    class RevoluteJoint extends JointBase {
        constructor() {
            super(...arguments);
            this._enableMotor = false;
            this._motorSpeed = 0;
            this._maxMotorTorque = 10000;
            this._enableLimit = false;
            this._lowerAngle = 0;
            this._upperAngle = 0;
            this.anchor = [0, 0];
            this.collideConnected = false;
        }
        get enableMotor() {
            return this._enableMotor;
        }
        set enableMotor(value) {
            this._enableMotor = value;
            if (this._joint)
                this._factory.set_Joint_EnableMotor(this._joint, value);
        }
        get motorSpeed() {
            return this._motorSpeed;
        }
        set motorSpeed(value) {
            this._motorSpeed = value;
            if (this._joint)
                this._factory.set_Joint_SetMotorSpeed(this._joint, value);
        }
        get maxMotorTorque() {
            return this._maxMotorTorque;
        }
        set maxMotorTorque(value) {
            this._maxMotorTorque = value;
            if (this._joint)
                this._factory.set_Joint_SetMaxMotorTorque(this._joint, value);
        }
        get enableLimit() {
            return this._enableLimit;
        }
        set enableLimit(value) {
            this._enableLimit = value;
            if (this._joint)
                this._factory.set_Joint_EnableLimit(this._joint, value);
        }
        get lowerAngle() {
            return this._lowerAngle;
        }
        set lowerAngle(value) {
            this._lowerAngle = value;
            if (this._joint)
                this._factory.set_Joint_SetLimits(this._joint, Laya.Utils.toRadian(value), Laya.Utils.toRadian(this._upperAngle));
        }
        get upperAngle() {
            return this._upperAngle;
        }
        set upperAngle(value) {
            this._upperAngle = value;
            if (this._joint)
                this._factory.set_Joint_SetLimits(this._joint, Laya.Utils.toRadian(this._lowerAngle), Laya.Utils.toRadian(value));
        }
        _createJoint() {
            if (!this._joint) {
                this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
                if (!this.selfBody)
                    throw "selfBody can not be empty";
                var def = RevoluteJoint._temp || (RevoluteJoint._temp = new physics2D_RevoluteJointDef());
                def.bodyB = this.selfBody.getBody();
                def.bodyA = this.otherBody ? this.otherBody.getBody() : Physics2D.I._emptyBody;
                let global = this.selfBody.getWorldPoint(this.anchor[0], this.anchor[1]);
                def.anchor.setValue(global.x, global.y);
                def.enableMotor = this._enableMotor;
                def.motorSpeed = this._motorSpeed;
                def.maxMotorTorque = this._maxMotorTorque;
                def.enableLimit = this._enableLimit;
                def.lowerAngle = Laya.Utils.toRadian(this._lowerAngle);
                def.upperAngle = Laya.Utils.toRadian(this._upperAngle);
                def.collideConnected = this.collideConnected;
                this._joint = this._factory.create_RevoluteJoint(def);
            }
        }
    }

    class PrismaticJoint extends JointBase {
        constructor() {
            super(...arguments);
            this._enableMotor = false;
            this._motorSpeed = 0;
            this._maxMotorForce = 10000;
            this._enableLimit = false;
            this._lowerTranslation = 0;
            this._upperTranslation = 0;
            this._axis = [1, 0];
            this.anchor = [0, 0];
            this.angle = 0;
            this.collideConnected = false;
        }
        get enableMotor() {
            return this._enableMotor;
        }
        set enableMotor(value) {
            this._enableMotor = value;
            if (this._joint)
                this._factory.set_Joint_EnableMotor(this._joint, value);
        }
        get motorSpeed() {
            return this._motorSpeed;
        }
        set motorSpeed(value) {
            this._motorSpeed = value;
            if (this._joint)
                this._factory.set_Joint_SetMotorSpeed(this._joint, value);
        }
        get maxMotorForce() {
            return this._maxMotorForce;
        }
        set maxMotorForce(value) {
            this._maxMotorForce = value;
            if (this._joint)
                this._factory.set_Joint_SetMaxMotorTorque(this._joint, value);
        }
        get enableLimit() {
            return this._enableLimit;
        }
        set enableLimit(value) {
            this._enableLimit = value;
            if (this._joint)
                this._factory.set_Joint_EnableLimit(this._joint, value);
        }
        get lowerTranslation() {
            return this._lowerTranslation;
        }
        set lowerTranslation(value) {
            this._lowerTranslation = value;
            if (this._joint)
                this._factory.set_Joint_SetLimits(this._joint, value, this._upperTranslation);
        }
        get upperTranslation() {
            return this._upperTranslation;
        }
        set upperTranslation(value) {
            this._upperTranslation = value;
            if (this._joint)
                this._factory.set_Joint_SetLimits(this._joint, this._lowerTranslation, value);
        }
        get axis() {
            return this._axis;
        }
        set axis(value) {
            this._axis = value;
            this.angle = Laya.Utils.toAngle(Math.atan2(value[1], value[0]));
        }
        _createJoint() {
            if (!this._joint) {
                this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
                if (!this.selfBody)
                    throw "selfBody can not be empty";
                var def = PrismaticJoint._temp || (PrismaticJoint._temp = new physics2D_PrismaticJointDef());
                def.bodyB = this.selfBody.getBody();
                def.bodyA = this.otherBody ? this.otherBody.getBody() : Physics2D.I._emptyBody;
                let p = this.selfBody.getWorldPoint(this.anchor[0], this.anchor[1]);
                def.anchor.setValue(p.x, p.y);
                let radian = Laya.Utils.toRadian(this.angle);
                def.axis.setValue(Math.cos(radian), Math.sin(radian));
                def.enableMotor = this._enableMotor;
                def.motorSpeed = this._motorSpeed;
                def.maxMotorForce = this._maxMotorForce;
                def.enableLimit = this._enableLimit;
                def.lowerTranslation = this._lowerTranslation;
                def.upperTranslation = this._upperTranslation;
                def.collideConnected = this.collideConnected;
                this._joint = this._factory.create_PrismaticJoint(def);
            }
        }
    }

    class GearJoint extends JointBase {
        constructor() {
            super(...arguments);
            this._ratio = 1;
            this.collideConnected = false;
        }
        set joint1(value) {
            if (value instanceof RevoluteJoint || value instanceof PrismaticJoint) {
                this._joint1 = value;
            }
            else {
                console.warn("joint1 must be a RevoluteJoint or PrismaticJoint");
                this._joint1 = null;
            }
        }
        get joint1() {
            return this._joint1;
        }
        set joint2(value) {
            if (value instanceof RevoluteJoint || value instanceof PrismaticJoint) {
                this._joint2 = value;
            }
            else {
                console.warn("joint2 must be a RevoluteJoint or PrismaticJoint");
                this._joint2 = null;
            }
        }
        get joint2() {
            return this._joint2;
        }
        get ratio() {
            return this._ratio;
        }
        set ratio(value) {
            this._ratio = value;
            if (this._joint)
                this._factory.set_GearJoint_SetRatio(this._joint, value);
        }
        _createJoint() {
            if (!this._joint) {
                if (!this.joint1)
                    throw "Joint1 can not be empty";
                if (!this.joint2)
                    throw "Joint2 can not be empty";
                var def = GearJoint._temp || (GearJoint._temp = new physics2D_GearJointDef());
                def.bodyA = this.joint1.owner.getComponent(RigidBody).getBody();
                def.bodyB = this.joint2.owner.getComponent(RigidBody).getBody();
                def.joint1 = this.joint1.joint;
                def.joint2 = this.joint2.joint;
                def.ratio = -this._ratio;
                def.collideConnected = this.collideConnected;
                this._joint = this._factory.create_GearJoint(def);
            }
        }
    }

    class MotorJoint extends JointBase {
        constructor() {
            super(...arguments);
            this._linearOffset = [0, 0];
            this._angularOffset = 0;
            this._maxForce = 1000;
            this._maxTorque = 1000;
            this._correctionFactor = 0.3;
            this.collideConnected = false;
        }
        get linearOffset() {
            return this._linearOffset;
        }
        set linearOffset(value) {
            this._linearOffset = value;
            if (this._joint) {
                this._factory.set_MotorJoint_linearOffset(this._joint, value[0], value[1]);
            }
        }
        get angularOffset() {
            return this._angularOffset;
        }
        set angularOffset(value) {
            this._angularOffset = value;
            if (this._joint)
                this._factory.set_MotorJoint_SetAngularOffset(this._joint, Laya.Utils.toRadian(-value));
        }
        get maxForce() {
            return this._maxForce;
        }
        set maxForce(value) {
            this._maxForce = value;
            if (this._joint)
                this._factory.set_MotorJoint_SetMaxForce(this._joint, value);
        }
        get maxTorque() {
            return this._maxTorque;
        }
        set maxTorque(value) {
            this._maxTorque = value;
            if (this._joint)
                this._factory.set_MotorJoint_SetMaxTorque(this._joint, value);
        }
        get correctionFactor() {
            return this._correctionFactor;
        }
        set correctionFactor(value) {
            this._correctionFactor = value;
            if (this._joint)
                this._factory.set_MotorJoint_SetCorrectionFactor(this._joint, value);
        }
        _createJoint() {
            if (!this._joint) {
                if (!this.otherBody)
                    throw "otherBody can not be empty";
                this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
                if (!this.selfBody)
                    throw "selfBody can not be empty";
                var def = MotorJoint._temp || (MotorJoint._temp = new physics2D_MotorJointDef());
                def.bodyA = this.selfBody.getBody();
                def.bodyB = this.otherBody.getBody();
                def.linearOffset.setValue(this._linearOffset[0], this._linearOffset[1]);
                def.angularOffset = Laya.Utils.toRadian(-this._angularOffset);
                def.maxForce = this._maxForce;
                def.maxTorque = this._maxTorque;
                def.correctionFactor = this._correctionFactor;
                def.collideConnected = this.collideConnected;
                this._joint = this._factory.create_MotorJoint(def);
            }
        }
    }

    class MouseJoint extends JointBase {
        constructor() {
            super(...arguments);
            this._maxForce = 1000;
            this._frequency = 5;
            this._dampingRatio = 0.7;
        }
        get maxForce() {
            return this._maxForce;
        }
        set maxForce(value) {
            this._maxForce = value;
            if (this._joint)
                this._factory.set_MotorJoint_SetMaxForce(this._joint, value);
        }
        get frequency() {
            return this._frequency;
        }
        set frequency(value) {
            this._frequency = value;
            if (this._joint) {
                this._factory.set_MouseJoint_frequencyAndDampingRatio(this._joint, this._frequency, this._dampingRatio);
            }
        }
        get damping() {
            return this._dampingRatio;
        }
        set damping(value) {
            this._dampingRatio = value;
            if (this._joint) {
                this._factory.set_MouseJoint_frequencyAndDampingRatio(this._joint, this._frequency, this._dampingRatio);
            }
        }
        _onEnable() {
            this.owner.mouseEnabled = true;
            this.owner.on(Laya.Event.MOUSE_DOWN, this, this._onMouseDown);
        }
        _createJoint() {
            if (!this._joint) {
                this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
                if (!this.selfBody)
                    throw "selfBody can not be empty";
                var def = MouseJoint._temp || (MouseJoint._temp = new physics2D_MouseJointJointDef());
                if (this.anchor) {
                    var anchorPos = this.selfBody.owner.localToGlobal(Laya.Point.TEMP.setTo(this.anchor[0], this.anchor[1]), false, Physics2D.I.worldRoot);
                }
                else {
                    anchorPos = Physics2D.I.worldRoot.globalToLocal(Laya.Point.TEMP.setTo(Laya.ILaya.stage.mouseX, Laya.ILaya.stage.mouseY));
                }
                def.bodyA = Physics2D.I._emptyBody;
                def.bodyB = this.selfBody.getBody();
                def.target.setValue(anchorPos.x, anchorPos.y);
                def.maxForce = this._maxForce;
                def.dampingRatio = this._dampingRatio;
                def.frequency = this._frequency;
                this._factory.set_rigidbody_Awake(def.bodyB, true);
                this._joint = this._factory.create_MouseJoint(def);
            }
        }
        _onMouseDown() {
            this._createJoint();
            Laya.ILaya.stage.on(Laya.Event.MOUSE_MOVE, this, this._onMouseMove);
            Laya.ILaya.stage.once(Laya.Event.MOUSE_UP, this, this._onStageMouseUp);
            Laya.ILaya.stage.once(Laya.Event.MOUSE_OUT, this, this._onStageMouseUp);
        }
        _onStageMouseUp() {
            Laya.ILaya.stage.off(Laya.Event.MOUSE_MOVE, this, this._onMouseMove);
            Laya.ILaya.stage.off(Laya.Event.MOUSE_UP, this, this._onStageMouseUp);
            Laya.ILaya.stage.off(Laya.Event.MOUSE_OUT, this, this._onStageMouseUp);
            this._factory.removeJoint(this._joint);
            this._joint = null;
        }
        _onMouseMove() {
            if (this._joint)
                this._factory.set_MouseJoint_target(this._joint, Physics2D.I.worldRoot.mouseX, Physics2D.I.worldRoot.mouseY);
        }
        _onDisable() {
            super._onDisable();
            this.owner.off(Laya.Event.MOUSE_DOWN, this, this._onMouseDown);
        }
    }

    class PulleyJoint extends JointBase {
        constructor() {
            super(...arguments);
            this.selfAnchor = [0, 0];
            this.otherAnchor = [0, 0];
            this.selfGroundPoint = [0, -100];
            this.otherGroundPoint = [0, -100];
            this.ratio = 1;
            this.collideConnected = false;
        }
        _createJoint() {
            if (!this._joint) {
                if (!this.otherBody)
                    throw "otherBody can not be empty";
                this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
                if (!this.selfBody)
                    throw "selfBody can not be empty";
                var def = PulleyJoint._temp || (PulleyJoint._temp = new physics2D_PulleyJointDef);
                def.bodyA = this.otherBody.getBody();
                def.bodyB = this.selfBody.getBody();
                var posA = this.otherBody.getWorldPoint(this.otherAnchor[0], this.otherAnchor[1]);
                def.localAnchorA.setValue(posA.x, posA.y);
                var posB = this.selfBody.getWorldPoint(this.selfAnchor[0], this.selfAnchor[1]);
                def.localAnchorB.setValue(posB.x, posB.y);
                var groundA = this.otherBody.getWorldPoint(this.otherGroundPoint[0], this.otherGroundPoint[1]);
                def.groundAnchorA.setValue(groundA.x, groundA.y);
                var groundB = this.selfBody.getWorldPoint(this.selfGroundPoint[0], this.selfGroundPoint[1]);
                def.groundAnchorB.setValue(groundB.x, groundB.y);
                def.ratio = this.ratio;
                def.collideConnected = this.collideConnected;
                this._joint = Physics2D.I._factory.create_PulleyJoint(def);
            }
        }
    }

    class WeldJoint extends JointBase {
        constructor() {
            super(...arguments);
            this._frequency = 5;
            this._dampingRatio = 0.7;
            this.anchor = [0, 0];
            this.collideConnected = false;
        }
        get frequency() {
            return this._frequency;
        }
        set frequency(value) {
            this._frequency = value;
            if (this._joint) {
                this._factory.set_Joint_frequencyAndDampingRatio(this._joint, this._frequency, this._dampingRatio, false);
            }
        }
        get damping() {
            return this._dampingRatio;
        }
        set damping(value) {
            this._dampingRatio = value;
            if (this._joint) {
                this._factory.set_Joint_frequencyAndDampingRatio(this._joint, this._frequency, this._dampingRatio, true);
            }
        }
        _createJoint() {
            if (!this._joint) {
                if (!this.otherBody)
                    throw "otherBody can not be empty";
                this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
                if (!this.selfBody)
                    throw "selfBody can not be empty";
                var def = WeldJoint._temp || (WeldJoint._temp = new physics2D_WeldJointDef());
                var anchorPos = this.selfBody.getWorldPoint(this.anchor[0], this.anchor[1]);
                def.bodyA = this.otherBody.getBody();
                def.bodyB = this.selfBody.getBody();
                def.anchor.setValue(anchorPos.x, anchorPos.y);
                def.frequency = this._frequency;
                def.dampingRatio = this._dampingRatio;
                def.collideConnected = this.collideConnected;
                this._joint = this._factory.create_WeldJoint(def);
            }
        }
    }

    class WheelJoint extends JointBase {
        constructor() {
            super(...arguments);
            this._frequency = 1;
            this._dampingRatio = 0.7;
            this._enableMotor = false;
            this._motorSpeed = 0;
            this._maxMotorTorque = 10000;
            this._enableLimit = true;
            this._lowerTranslation = 0;
            this._upperTranslation = 0;
            this.anchor = [0, 0];
            this.collideConnected = false;
            this._axis = [0, 1];
            this.angle = 90;
        }
        get frequency() {
            return this._frequency;
        }
        set frequency(value) {
            this._frequency = value;
            if (this._joint) {
                this._factory.set_Joint_frequencyAndDampingRatio(this._joint, this._frequency, this._dampingRatio, false);
            }
        }
        get damping() {
            return this._dampingRatio;
        }
        set damping(value) {
            this._dampingRatio = value;
            if (this._joint) {
                this._factory.set_Joint_frequencyAndDampingRatio(this._joint, this._frequency, this._dampingRatio, true);
            }
        }
        get enableMotor() {
            return this._enableMotor;
        }
        set enableMotor(value) {
            this._enableMotor = value;
            if (this._joint)
                this._factory.set_Joint_EnableMotor(this._joint, value);
        }
        get motorSpeed() {
            return this._motorSpeed;
        }
        set motorSpeed(value) {
            this._motorSpeed = value;
            if (this._joint)
                this._factory.set_Joint_SetMotorSpeed(this._joint, value);
        }
        get maxMotorTorque() {
            return this._maxMotorTorque;
        }
        set maxMotorTorque(value) {
            this._maxMotorTorque = value;
            if (this._joint)
                this._factory.set_Joint_SetMaxMotorTorque(this._joint, value);
        }
        get enableLimit() {
            return this._enableLimit;
        }
        set enableLimit(value) {
            this._enableLimit = value;
            if (this._joint)
                this._factory.set_Joint_EnableLimit(this._joint, value);
        }
        get lowerTranslation() {
            return this._lowerTranslation;
        }
        set lowerTranslation(value) {
            this._lowerTranslation = value;
            if (this._joint)
                this._factory.set_Joint_SetLimits(this._joint, value, this._upperTranslation);
        }
        get upperTranslation() {
            return this._upperTranslation;
        }
        set upperTranslation(value) {
            this._upperTranslation = value;
            if (this._joint)
                this._factory.set_Joint_SetLimits(this._joint, this._lowerTranslation, value);
        }
        get axis() {
            return this._axis;
        }
        set axis(value) {
            this._axis = value;
            this.angle = Laya.Utils.toAngle(Math.atan2(value[1], value[0]));
        }
        _createJoint() {
            if (!this._joint) {
                if (!this.otherBody)
                    throw "otherBody can not be empty";
                this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
                if (!this.selfBody)
                    throw "selfBody can not be empty";
                var def = WheelJoint._temp || (WheelJoint._temp = new physics2D_WheelJointDef());
                var anchorPos = this.selfBody.getWorldPoint(this.anchor[0], this.anchor[1]);
                def.anchor.setValue(anchorPos.x, anchorPos.y);
                let radian = Laya.Utils.toRadian(this.angle);
                def.axis.setValue(Math.cos(radian), Math.sin(radian));
                def.bodyA = this.otherBody.getBody();
                def.bodyB = this.selfBody.getBody();
                def.enableMotor = this._enableMotor;
                def.motorSpeed = this._motorSpeed;
                def.maxMotorTorque = this._maxMotorTorque;
                def.collideConnected = this.collideConnected;
                def.enableLimit = this._enableLimit;
                def.lowerTranslation = this._lowerTranslation;
                def.upperTranslation = this._upperTranslation;
                def.frequency = this._frequency;
                def.dampingRatio = this._dampingRatio;
                this._joint = this._factory.create_WheelJoint(def);
            }
        }
    }

    class Physics2DDebugDraw extends Laya.Sprite {
        get mG() {
            return this._mG;
        }
        get textG() {
            return this._textG;
        }
        get lineWidth() {
            return this._lineWidth;
        }
        get camera() {
            return this._camera;
        }
        constructor(factory) {
            super();
            this._factory = factory;
            this.DrawString_color = "#E69999";
            this.Red = "#ff0000";
            this.Green = "#00ff00";
            this._camera = {};
            this._camera.m_center = new Laya.Vector2(0, 0);
            this._camera.m_extent = 25;
            this._camera.m_zoom = 1;
            this._camera.m_width = 1280;
            this._camera.m_height = 800;
            this._mG = new Laya.Graphics();
            this.graphics = this._mG;
            this._textSp = new Laya.Sprite();
            this._textG = this._textSp.graphics;
            this.addChild(this._textSp);
        }
        _renderToGraphic() {
            if (this._factory.world) {
                this._textG.clear();
                this._mG.clear();
                this._mG.save();
                this._mG.scale(this._factory.PIXEL_RATIO, this._factory.PIXEL_RATIO);
                this._lineWidth = this._factory.layaToPhyValue(1);
                if (this._factory.world.DebugDraw)
                    this._factory.world.DebugDraw();
                else
                    this._factory.world.DrawDebugData();
                this._mG.restore();
            }
        }
        render(ctx, x, y) {
            if (!Laya.LayaEnv.isPlaying)
                return;
            this._renderToGraphic();
            super.render(ctx, x, y);
        }
        PushTransform(tx, ty, angle) {
            this._mG.save();
            this._mG.translate(tx, ty);
            this._mG.rotate(angle);
        }
        PopTransform() {
            this._mG.restore();
        }
    }

    class PolygonCollider extends ColliderBase {
        get points() {
            return this._points;
        }
        set points(value) {
            if (!value)
                throw "PolygonCollider points cannot be empty";
            this._points = value;
            var arr = this._points.split(",");
            let length = arr.length;
            this._datas = [];
            for (var i = 0, n = length; i < n; i++) {
                this._datas.push(parseInt(arr[i]));
            }
            this._needupdataShapeAttribute();
        }
        get datas() {
            return this._datas;
        }
        set datas(value) {
            if (!value)
                throw "PolygonCollider points cannot be empty";
            this._datas = value;
            this._needupdataShapeAttribute();
        }
        constructor() {
            super();
            this._points = "50,0,100,100,0,100";
            this._datas = [50, 0, 100, 100, 0, 100];
            this._physicShape = exports.PhysicsShape.PolygonShape;
        }
        _setShapeData(shape) {
            var len = this.datas.length;
            if (len < 6)
                throw "PolygonCollider points must be greater than 3";
            if (len % 2 == 1)
                throw "PolygonCollider points lenth must a multiplier of 2";
            Physics2D.I._factory.set_PolygonShape_data(shape, this.pivotoffx, this.pivotoffy, this.datas, this.scaleX, this.scaleY);
        }
    }

    let c = Laya.ClassUtils.regClass;
    c("Physics2D", Physics2D);
    c("Physics2DDebugDraw", Physics2DDebugDraw);
    c("ColliderBase", ColliderBase);
    c("BoxCollider", BoxCollider);
    c("ChainCollider", ChainCollider);
    c("CircleCollider", CircleCollider);
    c("EdgeCollider", EdgeCollider);
    c("PolygonCollider", PolygonCollider);
    c("RigidBody", RigidBody);
    c("JointBase", JointBase);
    c("DistanceJoint", DistanceJoint);
    c("GearJoint", GearJoint);
    c("MotorJoint", MotorJoint);
    c("MouseJoint", MouseJoint);
    c("PrismaticJoint", PrismaticJoint);
    c("PulleyJoint", PulleyJoint);
    c("RevoluteJoint", RevoluteJoint);
    c("WeldJoint", WeldJoint);
    c("WheelJoint", WheelJoint);

    exports.BoxCollider = BoxCollider;
    exports.ChainCollider = ChainCollider;
    exports.CircleCollider = CircleCollider;
    exports.ColliderBase = ColliderBase;
    exports.DistanceJoint = DistanceJoint;
    exports.EdgeCollider = EdgeCollider;
    exports.FixtureBox2DDef = FixtureBox2DDef;
    exports.GearJoint = GearJoint;
    exports.JointBase = JointBase;
    exports.MotorJoint = MotorJoint;
    exports.MouseJoint = MouseJoint;
    exports.Physics2D = Physics2D;
    exports.Physics2DDebugDraw = Physics2DDebugDraw;
    exports.Physics2DOption = Physics2DOption;
    exports.PolygonCollider = PolygonCollider;
    exports.PrismaticJoint = PrismaticJoint;
    exports.PulleyJoint = PulleyJoint;
    exports.RevoluteJoint = RevoluteJoint;
    exports.RigidBody = RigidBody;
    exports.RigidBody2DInfo = RigidBody2DInfo;
    exports.WeldJoint = WeldJoint;
    exports.WheelJoint = WheelJoint;
    exports.physics2D_DistancJointDef = physics2D_DistancJointDef;
    exports.physics2D_GearJointDef = physics2D_GearJointDef;
    exports.physics2D_MotorJointDef = physics2D_MotorJointDef;
    exports.physics2D_MouseJointJointDef = physics2D_MouseJointJointDef;
    exports.physics2D_PrismaticJointDef = physics2D_PrismaticJointDef;
    exports.physics2D_PulleyJointDef = physics2D_PulleyJointDef;
    exports.physics2D_RevoluteJointDef = physics2D_RevoluteJointDef;
    exports.physics2D_WeldJointDef = physics2D_WeldJointDef;
    exports.physics2D_WheelJointDef = physics2D_WheelJointDef;

})(window.Laya = window.Laya || {}, Laya);
//# sourceMappingURL=laya.physics2D.js.map
