
var Recast = (() => {
  var _scriptName = (document.currentScript && document.currentScript.src) ? document.currentScript.src : undefined;
  if (typeof __filename != 'undefined') scriptName = _scriptName || __filename;
  return (
function(moduleArg = {}) {
  var moduleRtn;

var Module=moduleArg;var readyPromiseResolve,readyPromiseReject;var readyPromise=new Promise((resolve,reject)=>{readyPromiseResolve=resolve;readyPromiseReject=reject});var ENVIRONMENT_IS_WEB=typeof window=="object";var ENVIRONMENT_IS_WORKER=typeof importScripts=="function";var ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string";if(ENVIRONMENT_IS_NODE){}var moduleOverrides=Object.assign({},Module);var arguments_=[];var thisProgram="./this.program";var quit_=(status,toThrow)=>{throw toThrow};var scriptDirectory="";function locateFile(path){if(Module["locateFile"]){return Module["locateFile"](path,scriptDirectory)}return scriptDirectory+path}var readAsync,readBinary;if(ENVIRONMENT_IS_NODE){var fs=require("fs");var nodePath=require("path");scriptDirectory=__dirname+"/";readBinary=filename=>{filename=isFileURI(filename)?new URL(filename):nodePath.normalize(filename);var ret=fs.readFileSync(filename);return ret};readAsync=(filename,binary=true)=>{filename=isFileURI(filename)?new URL(filename):nodePath.normalize(filename);return new Promise((resolve,reject)=>{fs.readFile(filename,binary?undefined:"utf8",(err,data)=>{if(err)reject(err);else resolve(binary?data.buffer:data)})})};if(!Module["thisProgram"]&&process.argv.length>1){thisProgram=process.argv[1].replace(/\\/g,"/")}arguments_=process.argv.slice(2);quit_=(status,toThrow)=>{process.exitCode=status;throw toThrow}}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){if(ENVIRONMENT_IS_WORKER){scriptDirectory=self.location.href}else if(typeof document!="undefined"&&document.currentScript){scriptDirectory=document.currentScript.src}if(_scriptName){scriptDirectory=_scriptName}if(scriptDirectory.startsWith("blob:")){scriptDirectory=""}else{scriptDirectory=scriptDirectory.substr(0,scriptDirectory.replace(/[?#].*/,"").lastIndexOf("/")+1)}{if(ENVIRONMENT_IS_WORKER){readBinary=url=>{var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.responseType="arraybuffer";xhr.send(null);return new Uint8Array(xhr.response)}}readAsync=url=>{if(isFileURI(url)){return new Promise((reject,resolve)=>{var xhr=new XMLHttpRequest;xhr.open("GET",url,true);xhr.responseType="arraybuffer";xhr.onload=()=>{if(xhr.status==200||xhr.status==0&&xhr.response){resolve(xhr.response)}reject(xhr.status)};xhr.onerror=reject;xhr.send(null)})}return fetch(url,{credentials:"same-origin"}).then(response=>{if(response.ok){return response.arrayBuffer()}return Promise.reject(new Error(response.status+" : "+response.url))})}}}else{}var out=Module["print"]||console.log.bind(console);var err=Module["printErr"]||console.error.bind(console);Object.assign(Module,moduleOverrides);moduleOverrides=null;if(Module["arguments"])arguments_=Module["arguments"];if(Module["thisProgram"])thisProgram=Module["thisProgram"];if(Module["quit"])quit_=Module["quit"];var wasmBinary;if(Module["wasmBinary"])wasmBinary=Module["wasmBinary"];var wasmMemory;var ABORT=false;var EXITSTATUS;var HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAPF64;function updateMemoryViews(){var b=wasmMemory.buffer;Module["HEAP8"]=HEAP8=new Int8Array(b);Module["HEAP16"]=HEAP16=new Int16Array(b);Module["HEAPU8"]=HEAPU8=new Uint8Array(b);Module["HEAPU16"]=HEAPU16=new Uint16Array(b);Module["HEAP32"]=HEAP32=new Int32Array(b);Module["HEAPU32"]=HEAPU32=new Uint32Array(b);Module["HEAPF32"]=HEAPF32=new Float32Array(b);Module["HEAPF64"]=HEAPF64=new Float64Array(b)}var __ATPRERUN__=[];var __ATINIT__=[];var __ATPOSTRUN__=[];var runtimeInitialized=false;function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift())}}callRuntimeCallbacks(__ATPRERUN__)}function initRuntime(){runtimeInitialized=true;callRuntimeCallbacks(__ATINIT__)}function postRun(){if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift())}}callRuntimeCallbacks(__ATPOSTRUN__)}function addOnPreRun(cb){__ATPRERUN__.unshift(cb)}function addOnInit(cb){__ATINIT__.unshift(cb)}function addOnPostRun(cb){__ATPOSTRUN__.unshift(cb)}var runDependencies=0;var runDependencyWatcher=null;var dependenciesFulfilled=null;function addRunDependency(id){runDependencies++;Module["monitorRunDependencies"]?Module["monitorRunDependencies"](runDependencies):null}function removeRunDependency(id){runDependencies--;Module["monitorRunDependencies"]?Module["monitorRunDependencies"](runDependencies):null;if(runDependencies==0){if(runDependencyWatcher!==null){clearInterval(runDependencyWatcher);runDependencyWatcher=null}if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback()}}}function abort(what){Module["onAbort"]?Module["onAbort"](what):null;what="Aborted("+what+")";err(what);ABORT=true;EXITSTATUS=1;what+=". Build with -sASSERTIONS for more info.";var e=new WebAssembly.RuntimeError(what);readyPromiseReject(e);throw e}var dataURIPrefix="data:application/octet-stream;base64,";var isDataURI=filename=>filename.startsWith(dataURIPrefix);var isFileURI=filename=>filename.startsWith("file://");function findWasmBinary(){var f="recast-navigation-wasm.wasm";if(!isDataURI(f)){return locateFile(f)}return f}var wasmBinaryFile;function getBinarySync(file){if(file==wasmBinaryFile&&wasmBinary){return new Uint8Array(wasmBinary)}if(readBinary){return readBinary(file)}throw"both async and sync fetching of the wasm failed"}function getBinaryPromise(binaryFile){if(!wasmBinary){return readAsync(binaryFile).then(response=>new Uint8Array(response),()=>getBinarySync(binaryFile))}return Promise.resolve().then(()=>getBinarySync(binaryFile))}function instantiateArrayBuffer(binaryFile,imports,receiver){return getBinaryPromise(binaryFile).then(binary=>WebAssembly.instantiate(binary,imports)).then(receiver,reason=>{err(`failed to asynchronously prepare wasm: ${reason}`);abort(reason)})}function instantiateAsync(binary,binaryFile,imports,callback){if(!binary&&typeof WebAssembly.instantiateStreaming=="function"&&!isDataURI(binaryFile)&&!isFileURI(binaryFile)&&!ENVIRONMENT_IS_NODE&&typeof fetch=="function"){return fetch(binaryFile,{credentials:"same-origin"}).then(response=>{var result=WebAssembly.instantiateStreaming(response,imports);return result.then(callback,function(reason){err(`wasm streaming compile failed: ${reason}`);err("falling back to ArrayBuffer instantiation");return instantiateArrayBuffer(binaryFile,imports,callback)})})}return instantiateArrayBuffer(binaryFile,imports,callback)}function getWasmImports(){return{a:wasmImports}}function createWasm(){var info=getWasmImports();function receiveInstance(instance,module){wasmExports=instance.exports;wasmMemory=wasmExports["M"];updateMemoryViews();wasmTable=wasmExports["P"];addOnInit(wasmExports["N"]);removeRunDependency("wasm-instantiate");return wasmExports}addRunDependency("wasm-instantiate");function receiveInstantiationResult(result){receiveInstance(result["instance"])}if(Module["instantiateWasm"]){try{return Module["instantiateWasm"](info,receiveInstance)}catch(e){err(`Module.instantiateWasm callback failed with error: ${e}`);readyPromiseReject(e)}}if(!wasmBinaryFile)wasmBinaryFile=findWasmBinary();instantiateAsync(wasmBinary,wasmBinaryFile,info,receiveInstantiationResult).catch(readyPromiseReject);return{}}var callRuntimeCallbacks=callbacks=>{while(callbacks.length>0){callbacks.shift()(Module)}};var noExitRuntime=Module["noExitRuntime"]||true;class ExceptionInfo{constructor(excPtr){this.excPtr=excPtr;this.ptr=excPtr-24}set_type(type){HEAPU32[this.ptr+4>>2]=type}get_type(){return HEAPU32[this.ptr+4>>2]}set_destructor(destructor){HEAPU32[this.ptr+8>>2]=destructor}get_destructor(){return HEAPU32[this.ptr+8>>2]}set_caught(caught){caught=caught?1:0;HEAP8[this.ptr+12]=caught}get_caught(){return HEAP8[this.ptr+12]!=0}set_rethrown(rethrown){rethrown=rethrown?1:0;HEAP8[this.ptr+13]=rethrown}get_rethrown(){return HEAP8[this.ptr+13]!=0}init(type,destructor){this.set_adjusted_ptr(0);this.set_type(type);this.set_destructor(destructor)}set_adjusted_ptr(adjustedPtr){HEAPU32[this.ptr+16>>2]=adjustedPtr}get_adjusted_ptr(){return HEAPU32[this.ptr+16>>2]}get_exception_ptr(){var isPointer=___cxa_is_pointer_type(this.get_type());if(isPointer){return HEAPU32[this.excPtr>>2]}var adjusted=this.get_adjusted_ptr();if(adjusted!==0)return adjusted;return this.excPtr}}var exceptionLast=0;var uncaughtExceptionCount=0;var ___cxa_throw=(ptr,type,destructor)=>{var info=new ExceptionInfo(ptr);info.init(type,destructor);exceptionLast=ptr;uncaughtExceptionCount++;throw exceptionLast};var __abort_js=()=>{abort("")};var tupleRegistrations={};var runDestructors=destructors=>{while(destructors.length){var ptr=destructors.pop();var del=destructors.pop();del(ptr)}};function readPointer(pointer){return this["fromWireType"](HEAPU32[pointer>>2])}var awaitingDependencies={};var registeredTypes={};var typeDependencies={};var InternalError;var throwInternalError=message=>{throw new InternalError(message)};var whenDependentTypesAreResolved=(myTypes,dependentTypes,getTypeConverters)=>{myTypes.forEach(function(type){typeDependencies[type]=dependentTypes});function onComplete(typeConverters){var myTypeConverters=getTypeConverters(typeConverters);if(myTypeConverters.length!==myTypes.length){throwInternalError("Mismatched type converter count")}for(var i=0;i<myTypes.length;++i){registerType(myTypes[i],myTypeConverters[i])}}var typeConverters=new Array(dependentTypes.length);var unregisteredTypes=[];var registered=0;dependentTypes.forEach((dt,i)=>{if(registeredTypes.hasOwnProperty(dt)){typeConverters[i]=registeredTypes[dt]}else{unregisteredTypes.push(dt);if(!awaitingDependencies.hasOwnProperty(dt)){awaitingDependencies[dt]=[]}awaitingDependencies[dt].push(()=>{typeConverters[i]=registeredTypes[dt];++registered;if(registered===unregisteredTypes.length){onComplete(typeConverters)}})}});if(0===unregisteredTypes.length){onComplete(typeConverters)}};var __embind_finalize_value_array=rawTupleType=>{var reg=tupleRegistrations[rawTupleType];delete tupleRegistrations[rawTupleType];var elements=reg.elements;var elementsLength=elements.length;var elementTypes=elements.map(elt=>elt.getterReturnType).concat(elements.map(elt=>elt.setterArgumentType));var rawConstructor=reg.rawConstructor;var rawDestructor=reg.rawDestructor;whenDependentTypesAreResolved([rawTupleType],elementTypes,elementTypes=>{elements.forEach((elt,i)=>{var getterReturnType=elementTypes[i];var getter=elt.getter;var getterContext=elt.getterContext;var setterArgumentType=elementTypes[i+elementsLength];var setter=elt.setter;var setterContext=elt.setterContext;elt.read=ptr=>getterReturnType["fromWireType"](getter(getterContext,ptr));elt.write=(ptr,o)=>{var destructors=[];setter(setterContext,ptr,setterArgumentType["toWireType"](destructors,o));runDestructors(destructors)}});return[{name:reg.name,fromWireType:ptr=>{var rv=new Array(elementsLength);for(var i=0;i<elementsLength;++i){rv[i]=elements[i].read(ptr)}rawDestructor(ptr);return rv},toWireType:(destructors,o)=>{if(elementsLength!==o.length){throw new TypeError(`Incorrect number of tuple elements for ${reg.name}: expected=${elementsLength}, actual=${o.length}`)}var ptr=rawConstructor();for(var i=0;i<elementsLength;++i){elements[i].write(ptr,o[i])}if(destructors!==null){destructors.push(rawDestructor,ptr)}return ptr},argPackAdvance:GenericWireTypeSize,readValueFromPointer:readPointer,destructorFunction:rawDestructor}]})};var structRegistrations={};var __embind_finalize_value_object=structType=>{var reg=structRegistrations[structType];delete structRegistrations[structType];var rawConstructor=reg.rawConstructor;var rawDestructor=reg.rawDestructor;var fieldRecords=reg.fields;var fieldTypes=fieldRecords.map(field=>field.getterReturnType).concat(fieldRecords.map(field=>field.setterArgumentType));whenDependentTypesAreResolved([structType],fieldTypes,fieldTypes=>{var fields={};fieldRecords.forEach((field,i)=>{var fieldName=field.fieldName;var getterReturnType=fieldTypes[i];var getter=field.getter;var getterContext=field.getterContext;var setterArgumentType=fieldTypes[i+fieldRecords.length];var setter=field.setter;var setterContext=field.setterContext;fields[fieldName]={read:ptr=>getterReturnType["fromWireType"](getter(getterContext,ptr)),write:(ptr,o)=>{var destructors=[];setter(setterContext,ptr,setterArgumentType["toWireType"](destructors,o));runDestructors(destructors)}}});return[{name:reg.name,fromWireType:ptr=>{var rv={};for(var i in fields){rv[i]=fields[i].read(ptr)}rawDestructor(ptr);return rv},toWireType:(destructors,o)=>{for(var fieldName in fields){if(!(fieldName in o)){throw new TypeError(`Missing field: "${fieldName}"`)}}var ptr=rawConstructor();for(fieldName in fields){fields[fieldName].write(ptr,o[fieldName])}if(destructors!==null){destructors.push(rawDestructor,ptr)}return ptr},argPackAdvance:GenericWireTypeSize,readValueFromPointer:readPointer,destructorFunction:rawDestructor}]})};var __embind_register_bigint=(primitiveType,name,size,minRange,maxRange)=>{};var embind_init_charCodes=()=>{var codes=new Array(256);for(var i=0;i<256;++i){codes[i]=String.fromCharCode(i)}embind_charCodes=codes};var embind_charCodes;var readLatin1String=ptr=>{var ret="";var c=ptr;while(HEAPU8[c]){ret+=embind_charCodes[HEAPU8[c++]]}return ret};var BindingError;var throwBindingError=message=>{throw new BindingError(message)};function sharedRegisterType(rawType,registeredInstance,options={}){var name=registeredInstance.name;if(!rawType){throwBindingError(`type "${name}" must have a positive integer typeid pointer`)}if(registeredTypes.hasOwnProperty(rawType)){if(options.ignoreDuplicateRegistrations){return}else{throwBindingError(`Cannot register type '${name}' twice`)}}registeredTypes[rawType]=registeredInstance;delete typeDependencies[rawType];if(awaitingDependencies.hasOwnProperty(rawType)){var callbacks=awaitingDependencies[rawType];delete awaitingDependencies[rawType];callbacks.forEach(cb=>cb())}}function registerType(rawType,registeredInstance,options={}){if(!("argPackAdvance"in registeredInstance)){throw new TypeError("registerType registeredInstance requires argPackAdvance")}return sharedRegisterType(rawType,registeredInstance,options)}var GenericWireTypeSize=8;var __embind_register_bool=(rawType,name,trueValue,falseValue)=>{name=readLatin1String(name);registerType(rawType,{name:name,fromWireType:function(wt){return!!wt},toWireType:function(destructors,o){return o?trueValue:falseValue},argPackAdvance:GenericWireTypeSize,readValueFromPointer:function(pointer){return this["fromWireType"](HEAPU8[pointer])},destructorFunction:null})};var shallowCopyInternalPointer=o=>({count:o.count,deleteScheduled:o.deleteScheduled,preservePointerOnDelete:o.preservePointerOnDelete,ptr:o.ptr,ptrType:o.ptrType,smartPtr:o.smartPtr,smartPtrType:o.smartPtrType});var throwInstanceAlreadyDeleted=obj=>{function getInstanceTypeName(handle){return handle.$$.ptrType.registeredClass.name}throwBindingError(getInstanceTypeName(obj)+" instance already deleted")};var finalizationRegistry=false;var detachFinalizer=handle=>{};var runDestructor=$$=>{if($$.smartPtr){$$.smartPtrType.rawDestructor($$.smartPtr)}else{$$.ptrType.registeredClass.rawDestructor($$.ptr)}};var releaseClassHandle=$$=>{$$.count.value-=1;var toDelete=0===$$.count.value;if(toDelete){runDestructor($$)}};var downcastPointer=(ptr,ptrClass,desiredClass)=>{if(ptrClass===desiredClass){return ptr}if(undefined===desiredClass.baseClass){return null}var rv=downcastPointer(ptr,ptrClass,desiredClass.baseClass);if(rv===null){return null}return desiredClass.downcast(rv)};var registeredPointers={};var getInheritedInstanceCount=()=>Object.keys(registeredInstances).length;var getLiveInheritedInstances=()=>{var rv=[];for(var k in registeredInstances){if(registeredInstances.hasOwnProperty(k)){rv.push(registeredInstances[k])}}return rv};var deletionQueue=[];var flushPendingDeletes=()=>{while(deletionQueue.length){var obj=deletionQueue.pop();obj.$$.deleteScheduled=false;obj["delete"]()}};var delayFunction;var setDelayFunction=fn=>{delayFunction=fn;if(deletionQueue.length&&delayFunction){delayFunction(flushPendingDeletes)}};var init_embind=()=>{Module["getInheritedInstanceCount"]=getInheritedInstanceCount;Module["getLiveInheritedInstances"]=getLiveInheritedInstances;Module["flushPendingDeletes"]=flushPendingDeletes;Module["setDelayFunction"]=setDelayFunction};var registeredInstances={};var getBasestPointer=(class_,ptr)=>{if(ptr===undefined){throwBindingError("ptr should not be undefined")}while(class_.baseClass){ptr=class_.upcast(ptr);class_=class_.baseClass}return ptr};var getInheritedInstance=(class_,ptr)=>{ptr=getBasestPointer(class_,ptr);return registeredInstances[ptr]};var makeClassHandle=(prototype,record)=>{if(!record.ptrType||!record.ptr){throwInternalError("makeClassHandle requires ptr and ptrType")}var hasSmartPtrType=!!record.smartPtrType;var hasSmartPtr=!!record.smartPtr;if(hasSmartPtrType!==hasSmartPtr){throwInternalError("Both smartPtrType and smartPtr must be specified")}record.count={value:1};return attachFinalizer(Object.create(prototype,{$$:{value:record,writable:true}}))};function RegisteredPointer_fromWireType(ptr){var rawPointer=this.getPointee(ptr);if(!rawPointer){this.destructor(ptr);return null}var registeredInstance=getInheritedInstance(this.registeredClass,rawPointer);if(undefined!==registeredInstance){if(0===registeredInstance.$$.count.value){registeredInstance.$$.ptr=rawPointer;registeredInstance.$$.smartPtr=ptr;return registeredInstance["clone"]()}else{var rv=registeredInstance["clone"]();this.destructor(ptr);return rv}}function makeDefaultHandle(){if(this.isSmartPointer){return makeClassHandle(this.registeredClass.instancePrototype,{ptrType:this.pointeeType,ptr:rawPointer,smartPtrType:this,smartPtr:ptr})}else{return makeClassHandle(this.registeredClass.instancePrototype,{ptrType:this,ptr:ptr})}}var actualType=this.registeredClass.getActualType(rawPointer);var registeredPointerRecord=registeredPointers[actualType];if(!registeredPointerRecord){return makeDefaultHandle.call(this)}var toType;if(this.isConst){toType=registeredPointerRecord.constPointerType}else{toType=registeredPointerRecord.pointerType}var dp=downcastPointer(rawPointer,this.registeredClass,toType.registeredClass);if(dp===null){return makeDefaultHandle.call(this)}if(this.isSmartPointer){return makeClassHandle(toType.registeredClass.instancePrototype,{ptrType:toType,ptr:dp,smartPtrType:this,smartPtr:ptr})}else{return makeClassHandle(toType.registeredClass.instancePrototype,{ptrType:toType,ptr:dp})}}var attachFinalizer=handle=>{if("undefined"===typeof FinalizationRegistry){attachFinalizer=handle=>handle;return handle}finalizationRegistry=new FinalizationRegistry(info=>{releaseClassHandle(info.$$)});attachFinalizer=handle=>{var $$=handle.$$;var hasSmartPtr=!!$$.smartPtr;if(hasSmartPtr){var info={$$:$$};finalizationRegistry.register(handle,info,handle)}return handle};detachFinalizer=handle=>finalizationRegistry.unregister(handle);return attachFinalizer(handle)};var init_ClassHandle=()=>{Object.assign(ClassHandle.prototype,{isAliasOf(other){if(!(this instanceof ClassHandle)){return false}if(!(other instanceof ClassHandle)){return false}var leftClass=this.$$.ptrType.registeredClass;var left=this.$$.ptr;other.$$=other.$$;var rightClass=other.$$.ptrType.registeredClass;var right=other.$$.ptr;while(leftClass.baseClass){left=leftClass.upcast(left);leftClass=leftClass.baseClass}while(rightClass.baseClass){right=rightClass.upcast(right);rightClass=rightClass.baseClass}return leftClass===rightClass&&left===right},clone(){if(!this.$$.ptr){throwInstanceAlreadyDeleted(this)}if(this.$$.preservePointerOnDelete){this.$$.count.value+=1;return this}else{var clone=attachFinalizer(Object.create(Object.getPrototypeOf(this),{$$:{value:shallowCopyInternalPointer(this.$$)}}));clone.$$.count.value+=1;clone.$$.deleteScheduled=false;return clone}},delete(){if(!this.$$.ptr){throwInstanceAlreadyDeleted(this)}if(this.$$.deleteScheduled&&!this.$$.preservePointerOnDelete){throwBindingError("Object already scheduled for deletion")}detachFinalizer(this);releaseClassHandle(this.$$);if(!this.$$.preservePointerOnDelete){this.$$.smartPtr=undefined;this.$$.ptr=undefined}},isDeleted(){return!this.$$.ptr},deleteLater(){if(!this.$$.ptr){throwInstanceAlreadyDeleted(this)}if(this.$$.deleteScheduled&&!this.$$.preservePointerOnDelete){throwBindingError("Object already scheduled for deletion")}deletionQueue.push(this);if(deletionQueue.length===1&&delayFunction){delayFunction(flushPendingDeletes)}this.$$.deleteScheduled=true;return this}})};function ClassHandle(){}var createNamedFunction=(name,body)=>Object.defineProperty(body,"name",{value:name});var ensureOverloadTable=(proto,methodName,humanName)=>{if(undefined===proto[methodName].overloadTable){var prevFunc=proto[methodName];proto[methodName]=function(...args){if(!proto[methodName].overloadTable.hasOwnProperty(args.length)){throwBindingError(`Function '${humanName}' called with an invalid number of arguments (${args.length}) - expects one of (${proto[methodName].overloadTable})!`)}return proto[methodName].overloadTable[args.length].apply(this,args)};proto[methodName].overloadTable=[];proto[methodName].overloadTable[prevFunc.argCount]=prevFunc}};var exposePublicSymbol=(name,value,numArguments)=>{if(Module.hasOwnProperty(name)){if(undefined===numArguments||undefined!==Module[name].overloadTable&&undefined!==Module[name].overloadTable[numArguments]){throwBindingError(`Cannot register public name '${name}' twice`)}ensureOverloadTable(Module,name,name);if(Module.hasOwnProperty(numArguments)){throwBindingError(`Cannot register multiple overloads of a function with the same number of arguments (${numArguments})!`)}Module[name].overloadTable[numArguments]=value}else{Module[name]=value;if(undefined!==numArguments){Module[name].numArguments=numArguments}}};var char_0=48;var char_9=57;var makeLegalFunctionName=name=>{if(undefined===name){return"_unknown"}name=name.replace(/[^a-zA-Z0-9_]/g,"$");var f=name.charCodeAt(0);if(f>=char_0&&f<=char_9){return`_${name}`}return name};function RegisteredClass(name,constructor,instancePrototype,rawDestructor,baseClass,getActualType,upcast,downcast){this.name=name;this.constructor=constructor;this.instancePrototype=instancePrototype;this.rawDestructor=rawDestructor;this.baseClass=baseClass;this.getActualType=getActualType;this.upcast=upcast;this.downcast=downcast;this.pureVirtualFunctions=[]}var upcastPointer=(ptr,ptrClass,desiredClass)=>{while(ptrClass!==desiredClass){if(!ptrClass.upcast){throwBindingError(`Expected null or instance of ${desiredClass.name}, got an instance of ${ptrClass.name}`)}ptr=ptrClass.upcast(ptr);ptrClass=ptrClass.baseClass}return ptr};function constNoSmartPtrRawPointerToWireType(destructors,handle){if(handle===null){if(this.isReference){throwBindingError(`null is not a valid ${this.name}`)}return 0}if(!handle.$$){throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`)}if(!handle.$$.ptr){throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`)}var handleClass=handle.$$.ptrType.registeredClass;var ptr=upcastPointer(handle.$$.ptr,handleClass,this.registeredClass);return ptr}function genericPointerToWireType(destructors,handle){var ptr;if(handle===null){if(this.isReference){throwBindingError(`null is not a valid ${this.name}`)}if(this.isSmartPointer){ptr=this.rawConstructor();if(destructors!==null){destructors.push(this.rawDestructor,ptr)}return ptr}else{return 0}}if(!handle||!handle.$$){throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`)}if(!handle.$$.ptr){throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`)}if(!this.isConst&&handle.$$.ptrType.isConst){throwBindingError(`Cannot convert argument of type ${handle.$$.smartPtrType?handle.$$.smartPtrType.name:handle.$$.ptrType.name} to parameter type ${this.name}`)}var handleClass=handle.$$.ptrType.registeredClass;ptr=upcastPointer(handle.$$.ptr,handleClass,this.registeredClass);if(this.isSmartPointer){if(undefined===handle.$$.smartPtr){throwBindingError("Passing raw pointer to smart pointer is illegal")}switch(this.sharingPolicy){case 0:if(handle.$$.smartPtrType===this){ptr=handle.$$.smartPtr}else{throwBindingError(`Cannot convert argument of type ${handle.$$.smartPtrType?handle.$$.smartPtrType.name:handle.$$.ptrType.name} to parameter type ${this.name}`)}break;case 1:ptr=handle.$$.smartPtr;break;case 2:if(handle.$$.smartPtrType===this){ptr=handle.$$.smartPtr}else{var clonedHandle=handle["clone"]();ptr=this.rawShare(ptr,Emval.toHandle(()=>clonedHandle["delete"]()));if(destructors!==null){destructors.push(this.rawDestructor,ptr)}}break;default:throwBindingError("Unsupporting sharing policy")}}return ptr}function nonConstNoSmartPtrRawPointerToWireType(destructors,handle){if(handle===null){if(this.isReference){throwBindingError(`null is not a valid ${this.name}`)}return 0}if(!handle.$$){throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`)}if(!handle.$$.ptr){throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`)}if(handle.$$.ptrType.isConst){throwBindingError(`Cannot convert argument of type ${handle.$$.ptrType.name} to parameter type ${this.name}`)}var handleClass=handle.$$.ptrType.registeredClass;var ptr=upcastPointer(handle.$$.ptr,handleClass,this.registeredClass);return ptr}var init_RegisteredPointer=()=>{Object.assign(RegisteredPointer.prototype,{getPointee(ptr){if(this.rawGetPointee){ptr=this.rawGetPointee(ptr)}return ptr},destructor(ptr){this.rawDestructor?this.rawDestructor(ptr):null},argPackAdvance:GenericWireTypeSize,readValueFromPointer:readPointer,fromWireType:RegisteredPointer_fromWireType})};function RegisteredPointer(name,registeredClass,isReference,isConst,isSmartPointer,pointeeType,sharingPolicy,rawGetPointee,rawConstructor,rawShare,rawDestructor){this.name=name;this.registeredClass=registeredClass;this.isReference=isReference;this.isConst=isConst;this.isSmartPointer=isSmartPointer;this.pointeeType=pointeeType;this.sharingPolicy=sharingPolicy;this.rawGetPointee=rawGetPointee;this.rawConstructor=rawConstructor;this.rawShare=rawShare;this.rawDestructor=rawDestructor;if(!isSmartPointer&&registeredClass.baseClass===undefined){if(isConst){this["toWireType"]=constNoSmartPtrRawPointerToWireType;this.destructorFunction=null}else{this["toWireType"]=nonConstNoSmartPtrRawPointerToWireType;this.destructorFunction=null}}else{this["toWireType"]=genericPointerToWireType}}var replacePublicSymbol=(name,value,numArguments)=>{if(!Module.hasOwnProperty(name)){throwInternalError("Replacing nonexistent public symbol")}if(undefined!==Module[name].overloadTable&&undefined!==numArguments){Module[name].overloadTable[numArguments]=value}else{Module[name]=value;Module[name].argCount=numArguments}};var dynCallLegacy=(sig,ptr,args)=>{sig=sig.replace(/p/g,"i");var f=Module["dynCall_"+sig];return f(ptr,...args)};var wasmTableMirror=[];var wasmTable;var getWasmTableEntry=funcPtr=>{var func=wasmTableMirror[funcPtr];if(!func){if(funcPtr>=wasmTableMirror.length)wasmTableMirror.length=funcPtr+1;wasmTableMirror[funcPtr]=func=wasmTable.get(funcPtr)}return func};var dynCall=(sig,ptr,args=[])=>{if(sig.includes("j")){return dynCallLegacy(sig,ptr,args)}var rtn=getWasmTableEntry(ptr)(...args);return rtn};var getDynCaller=(sig,ptr)=>(...args)=>dynCall(sig,ptr,args);var embind__requireFunction=(signature,rawFunction)=>{signature=readLatin1String(signature);function makeDynCaller(){if(signature.includes("j")){return getDynCaller(signature,rawFunction)}return getWasmTableEntry(rawFunction)}var fp=makeDynCaller();if(typeof fp!="function"){throwBindingError(`unknown function pointer with signature ${signature}: ${rawFunction}`)}return fp};var extendError=(baseErrorType,errorName)=>{var errorClass=createNamedFunction(errorName,function(message){this.name=errorName;this.message=message;var stack=new Error(message).stack;if(stack!==undefined){this.stack=this.toString()+"\n"+stack.replace(/^Error(:[^\n]*)?\n/,"")}});errorClass.prototype=Object.create(baseErrorType.prototype);errorClass.prototype.constructor=errorClass;errorClass.prototype.toString=function(){if(this.message===undefined){return this.name}else{return`${this.name}: ${this.message}`}};return errorClass};var UnboundTypeError;var getTypeName=type=>{var ptr=___getTypeName(type);var rv=readLatin1String(ptr);_free(ptr);return rv};var throwUnboundTypeError=(message,types)=>{var unboundTypes=[];var seen={};function visit(type){if(seen[type]){return}if(registeredTypes[type]){return}if(typeDependencies[type]){typeDependencies[type].forEach(visit);return}unboundTypes.push(type);seen[type]=true}types.forEach(visit);throw new UnboundTypeError(`${message}: `+unboundTypes.map(getTypeName).join([", "]))};var __embind_register_class=(rawType,rawPointerType,rawConstPointerType,baseClassRawType,getActualTypeSignature,getActualType,upcastSignature,upcast,downcastSignature,downcast,name,destructorSignature,rawDestructor)=>{name=readLatin1String(name);getActualType=embind__requireFunction(getActualTypeSignature,getActualType);upcast?upcast=embind__requireFunction(upcastSignature,upcast):upcast=null;downcast?downcast=embind__requireFunction(downcastSignature,downcast):downcast=null;rawDestructor=embind__requireFunction(destructorSignature,rawDestructor);var legalFunctionName=makeLegalFunctionName(name);exposePublicSymbol(legalFunctionName,function(){throwUnboundTypeError(`Cannot construct ${name} due to unbound types`,[baseClassRawType])});whenDependentTypesAreResolved([rawType,rawPointerType,rawConstPointerType],baseClassRawType?[baseClassRawType]:[],base=>{base=base[0];var baseClass;var basePrototype;if(baseClassRawType){baseClass=base.registeredClass;basePrototype=baseClass.instancePrototype}else{basePrototype=ClassHandle.prototype}var constructor=createNamedFunction(name,function(...args){if(Object.getPrototypeOf(this)!==instancePrototype){throw new BindingError("Use 'new' to construct "+name)}if(undefined===registeredClass.constructor_body){throw new BindingError(name+" has no accessible constructor")}var body=registeredClass.constructor_body[args.length];if(undefined===body){throw new BindingError(`Tried to invoke ctor of ${name} with invalid number of parameters (${args.length}) - expected (${Object.keys(registeredClass.constructor_body).toString()}) parameters instead!`)}return body.apply(this,args)});var instancePrototype=Object.create(basePrototype,{constructor:{value:constructor}});constructor.prototype=instancePrototype;var registeredClass=new RegisteredClass(name,constructor,instancePrototype,rawDestructor,baseClass,getActualType,upcast,downcast);if(registeredClass.baseClass){registeredClass.baseClass.__derivedClasses=registeredClass.baseClass.__derivedClasses||[];registeredClass.baseClass.__derivedClasses.push(registeredClass)}var referenceConverter=new RegisteredPointer(name,registeredClass,true,false,false);var pointerConverter=new RegisteredPointer(name+"*",registeredClass,false,false,false);var constPointerConverter=new RegisteredPointer(name+" const*",registeredClass,false,true,false);registeredPointers[rawType]={pointerType:pointerConverter,constPointerType:constPointerConverter};replacePublicSymbol(legalFunctionName,constructor);return[referenceConverter,pointerConverter,constPointerConverter]})};var heap32VectorToArray=(count,firstElement)=>{var array=[];for(var i=0;i<count;i++){array.push(HEAPU32[firstElement+i*4>>2])}return array};function usesDestructorStack(argTypes){for(var i=1;i<argTypes.length;++i){if(argTypes[i]!==null&&argTypes[i].destructorFunction===undefined){return true}}return false}function craftInvokerFunction(humanName,argTypes,classType,cppInvokerFunc,cppTargetFunc,isAsync){var argCount=argTypes.length;if(argCount<2){throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!")}var isClassMethodFunc=argTypes[1]!==null&&classType!==null;var needsDestructorStack=usesDestructorStack(argTypes);var returns=argTypes[0].name!=="void";var expectedArgCount=argCount-2;var argsWired=new Array(expectedArgCount);var invokerFuncArgs=[];var destructors=[];var invokerFn=function(...args){if(args.length!==expectedArgCount){throwBindingError(`function ${humanName} called with ${args.length} arguments, expected ${expectedArgCount}`)}destructors.length=0;var thisWired;invokerFuncArgs.length=isClassMethodFunc?2:1;invokerFuncArgs[0]=cppTargetFunc;if(isClassMethodFunc){thisWired=argTypes[1]["toWireType"](destructors,this);invokerFuncArgs[1]=thisWired}for(var i=0;i<expectedArgCount;++i){argsWired[i]=argTypes[i+2]["toWireType"](destructors,args[i]);invokerFuncArgs.push(argsWired[i])}var rv=cppInvokerFunc(...invokerFuncArgs);function onDone(rv){if(needsDestructorStack){runDestructors(destructors)}else{for(var i=isClassMethodFunc?1:2;i<argTypes.length;i++){var param=i===1?thisWired:argsWired[i-2];if(argTypes[i].destructorFunction!==null){argTypes[i].destructorFunction(param)}}}if(returns){return argTypes[0]["fromWireType"](rv)}}return onDone(rv)};return createNamedFunction(humanName,invokerFn)}var __embind_register_class_constructor=(rawClassType,argCount,rawArgTypesAddr,invokerSignature,invoker,rawConstructor)=>{var rawArgTypes=heap32VectorToArray(argCount,rawArgTypesAddr);invoker=embind__requireFunction(invokerSignature,invoker);whenDependentTypesAreResolved([],[rawClassType],classType=>{classType=classType[0];var humanName=`constructor ${classType.name}`;if(undefined===classType.registeredClass.constructor_body){classType.registeredClass.constructor_body=[]}if(undefined!==classType.registeredClass.constructor_body[argCount-1]){throw new BindingError(`Cannot register multiple constructors with identical number of parameters (${argCount-1}) for class '${classType.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`)}classType.registeredClass.constructor_body[argCount-1]=()=>{throwUnboundTypeError(`Cannot construct ${classType.name} due to unbound types`,rawArgTypes)};whenDependentTypesAreResolved([],rawArgTypes,argTypes=>{argTypes.splice(1,0,null);classType.registeredClass.constructor_body[argCount-1]=craftInvokerFunction(humanName,argTypes,null,invoker,rawConstructor);return[]});return[]})};var getFunctionName=signature=>{signature=signature.trim();const argsIndex=signature.indexOf("(");if(argsIndex!==-1){return signature.substr(0,argsIndex)}else{return signature}};var __embind_register_class_function=(rawClassType,methodName,argCount,rawArgTypesAddr,invokerSignature,rawInvoker,context,isPureVirtual,isAsync)=>{var rawArgTypes=heap32VectorToArray(argCount,rawArgTypesAddr);methodName=readLatin1String(methodName);methodName=getFunctionName(methodName);rawInvoker=embind__requireFunction(invokerSignature,rawInvoker);whenDependentTypesAreResolved([],[rawClassType],classType=>{classType=classType[0];var humanName=`${classType.name}.${methodName}`;if(methodName.startsWith("@@")){methodName=Symbol[methodName.substring(2)]}if(isPureVirtual){classType.registeredClass.pureVirtualFunctions.push(methodName)}function unboundTypesHandler(){throwUnboundTypeError(`Cannot call ${humanName} due to unbound types`,rawArgTypes)}var proto=classType.registeredClass.instancePrototype;var method=proto[methodName];if(undefined===method||undefined===method.overloadTable&&method.className!==classType.name&&method.argCount===argCount-2){unboundTypesHandler.argCount=argCount-2;unboundTypesHandler.className=classType.name;proto[methodName]=unboundTypesHandler}else{ensureOverloadTable(proto,methodName,humanName);proto[methodName].overloadTable[argCount-2]=unboundTypesHandler}whenDependentTypesAreResolved([],rawArgTypes,argTypes=>{var memberFunction=craftInvokerFunction(humanName,argTypes,classType,rawInvoker,context,isAsync);if(undefined===proto[methodName].overloadTable){memberFunction.argCount=argCount-2;proto[methodName]=memberFunction}else{proto[methodName].overloadTable[argCount-2]=memberFunction}return[]});return[]})};var validateThis=(this_,classType,humanName)=>{if(!(this_ instanceof Object)){throwBindingError(`${humanName} with invalid "this": ${this_}`)}if(!(this_ instanceof classType.registeredClass.constructor)){throwBindingError(`${humanName} incompatible with "this" of type ${this_.constructor.name}`)}if(!this_.$$.ptr){throwBindingError(`cannot call emscripten binding method ${humanName} on deleted object`)}return upcastPointer(this_.$$.ptr,this_.$$.ptrType.registeredClass,classType.registeredClass)};var __embind_register_class_property=(classType,fieldName,getterReturnType,getterSignature,getter,getterContext,setterArgumentType,setterSignature,setter,setterContext)=>{fieldName=readLatin1String(fieldName);getter=embind__requireFunction(getterSignature,getter);whenDependentTypesAreResolved([],[classType],classType=>{classType=classType[0];var humanName=`${classType.name}.${fieldName}`;var desc={get(){throwUnboundTypeError(`Cannot access ${humanName} due to unbound types`,[getterReturnType,setterArgumentType])},enumerable:true,configurable:true};if(setter){desc.set=()=>throwUnboundTypeError(`Cannot access ${humanName} due to unbound types`,[getterReturnType,setterArgumentType])}else{desc.set=v=>throwBindingError(humanName+" is a read-only property")}Object.defineProperty(classType.registeredClass.instancePrototype,fieldName,desc);whenDependentTypesAreResolved([],setter?[getterReturnType,setterArgumentType]:[getterReturnType],types=>{var getterReturnType=types[0];var desc={get(){var ptr=validateThis(this,classType,humanName+" getter");return getterReturnType["fromWireType"](getter(getterContext,ptr))},enumerable:true};if(setter){setter=embind__requireFunction(setterSignature,setter);var setterArgumentType=types[1];desc.set=function(v){var ptr=validateThis(this,classType,humanName+" setter");var destructors=[];setter(setterContext,ptr,setterArgumentType["toWireType"](destructors,v));runDestructors(destructors)}}Object.defineProperty(classType.registeredClass.instancePrototype,fieldName,desc);return[]});return[]})};var emval_freelist=[];var emval_handles=[];var __emval_decref=handle=>{if(handle>9&&0===--emval_handles[handle+1]){emval_handles[handle]=undefined;emval_freelist.push(handle)}};var count_emval_handles=()=>emval_handles.length/2-5-emval_freelist.length;var init_emval=()=>{emval_handles.push(0,1,undefined,1,null,1,true,1,false,1);Module["count_emval_handles"]=count_emval_handles};var Emval={toValue:handle=>{if(!handle){throwBindingError("Cannot use deleted val. handle = "+handle)}return emval_handles[handle]},toHandle:value=>{switch(value){case undefined:return 2;case null:return 4;case true:return 6;case false:return 8;default:{const handle=emval_freelist.pop()||emval_handles.length;emval_handles[handle]=value;emval_handles[handle+1]=1;return handle}}}};var EmValType={name:"emscripten::val",fromWireType:handle=>{var rv=Emval.toValue(handle);__emval_decref(handle);return rv},toWireType:(destructors,value)=>Emval.toHandle(value),argPackAdvance:GenericWireTypeSize,readValueFromPointer:readPointer,destructorFunction:null};var __embind_register_emval=rawType=>registerType(rawType,EmValType);var enumReadValueFromPointer=(name,width,signed)=>{switch(width){case 1:return signed?function(pointer){return this["fromWireType"](HEAP8[pointer])}:function(pointer){return this["fromWireType"](HEAPU8[pointer])};case 2:return signed?function(pointer){return this["fromWireType"](HEAP16[pointer>>1])}:function(pointer){return this["fromWireType"](HEAPU16[pointer>>1])};case 4:return signed?function(pointer){return this["fromWireType"](HEAP32[pointer>>2])}:function(pointer){return this["fromWireType"](HEAPU32[pointer>>2])};default:throw new TypeError(`invalid integer width (${width}): ${name}`)}};var __embind_register_enum=(rawType,name,size,isSigned)=>{name=readLatin1String(name);function ctor(){}ctor.values={};registerType(rawType,{name:name,constructor:ctor,fromWireType:function(c){return this.constructor.values[c]},toWireType:(destructors,c)=>c.value,argPackAdvance:GenericWireTypeSize,readValueFromPointer:enumReadValueFromPointer(name,size,isSigned),destructorFunction:null});exposePublicSymbol(name,ctor)};var requireRegisteredType=(rawType,humanName)=>{var impl=registeredTypes[rawType];if(undefined===impl){throwBindingError(`${humanName} has unknown type ${getTypeName(rawType)}`)}return impl};var __embind_register_enum_value=(rawEnumType,name,enumValue)=>{var enumType=requireRegisteredType(rawEnumType,"enum");name=readLatin1String(name);var Enum=enumType.constructor;var Value=Object.create(enumType.constructor.prototype,{value:{value:enumValue},constructor:{value:createNamedFunction(`${enumType.name}_${name}`,function(){})}});Enum.values[enumValue]=Value;Enum[name]=Value};var embindRepr=v=>{if(v===null){return"null"}var t=typeof v;if(t==="object"||t==="array"||t==="function"){return v.toString()}else{return""+v}};var floatReadValueFromPointer=(name,width)=>{switch(width){case 4:return function(pointer){return this["fromWireType"](HEAPF32[pointer>>2])};case 8:return function(pointer){return this["fromWireType"](HEAPF64[pointer>>3])};default:throw new TypeError(`invalid float width (${width}): ${name}`)}};var __embind_register_float=(rawType,name,size)=>{name=readLatin1String(name);registerType(rawType,{name:name,fromWireType:value=>value,toWireType:(destructors,value)=>value,argPackAdvance:GenericWireTypeSize,readValueFromPointer:floatReadValueFromPointer(name,size),destructorFunction:null})};var __embind_register_function=(name,argCount,rawArgTypesAddr,signature,rawInvoker,fn,isAsync)=>{var argTypes=heap32VectorToArray(argCount,rawArgTypesAddr);name=readLatin1String(name);name=getFunctionName(name);rawInvoker=embind__requireFunction(signature,rawInvoker);exposePublicSymbol(name,function(){throwUnboundTypeError(`Cannot call ${name} due to unbound types`,argTypes)},argCount-1);whenDependentTypesAreResolved([],argTypes,argTypes=>{var invokerArgsArray=[argTypes[0],null].concat(argTypes.slice(1));replacePublicSymbol(name,craftInvokerFunction(name,invokerArgsArray,null,rawInvoker,fn,isAsync),argCount-1);return[]})};var integerReadValueFromPointer=(name,width,signed)=>{switch(width){case 1:return signed?pointer=>HEAP8[pointer]:pointer=>HEAPU8[pointer];case 2:return signed?pointer=>HEAP16[pointer>>1]:pointer=>HEAPU16[pointer>>1];case 4:return signed?pointer=>HEAP32[pointer>>2]:pointer=>HEAPU32[pointer>>2];default:throw new TypeError(`invalid integer width (${width}): ${name}`)}};var __embind_register_integer=(primitiveType,name,size,minRange,maxRange)=>{name=readLatin1String(name);if(maxRange===-1){maxRange=4294967295}var fromWireType=value=>value;if(minRange===0){var bitshift=32-8*size;fromWireType=value=>value<<bitshift>>>bitshift}var isUnsignedType=name.includes("unsigned");var checkAssertions=(value,toTypeName)=>{};var toWireType;if(isUnsignedType){toWireType=function(destructors,value){checkAssertions(value,this.name);return value>>>0}}else{toWireType=function(destructors,value){checkAssertions(value,this.name);return value}}registerType(primitiveType,{name:name,fromWireType:fromWireType,toWireType:toWireType,argPackAdvance:GenericWireTypeSize,readValueFromPointer:integerReadValueFromPointer(name,size,minRange!==0),destructorFunction:null})};var __embind_register_memory_view=(rawType,dataTypeIndex,name)=>{var typeMapping=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array];var TA=typeMapping[dataTypeIndex];function decodeMemoryView(handle){var size=HEAPU32[handle>>2];var data=HEAPU32[handle+4>>2];return new TA(HEAP8.buffer,data,size)}name=readLatin1String(name);registerType(rawType,{name:name,fromWireType:decodeMemoryView,argPackAdvance:GenericWireTypeSize,readValueFromPointer:decodeMemoryView},{ignoreDuplicateRegistrations:true})};var stringToUTF8Array=(str,heap,outIdx,maxBytesToWrite)=>{if(!(maxBytesToWrite>0))return 0;var startIdx=outIdx;var endIdx=outIdx+maxBytesToWrite-1;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343){var u1=str.charCodeAt(++i);u=65536+((u&1023)<<10)|u1&1023}if(u<=127){if(outIdx>=endIdx)break;heap[outIdx++]=u}else if(u<=2047){if(outIdx+1>=endIdx)break;heap[outIdx++]=192|u>>6;heap[outIdx++]=128|u&63}else if(u<=65535){if(outIdx+2>=endIdx)break;heap[outIdx++]=224|u>>12;heap[outIdx++]=128|u>>6&63;heap[outIdx++]=128|u&63}else{if(outIdx+3>=endIdx)break;heap[outIdx++]=240|u>>18;heap[outIdx++]=128|u>>12&63;heap[outIdx++]=128|u>>6&63;heap[outIdx++]=128|u&63}}heap[outIdx]=0;return outIdx-startIdx};var stringToUTF8=(str,outPtr,maxBytesToWrite)=>stringToUTF8Array(str,HEAPU8,outPtr,maxBytesToWrite);var lengthBytesUTF8=str=>{var len=0;for(var i=0;i<str.length;++i){var c=str.charCodeAt(i);if(c<=127){len++}else if(c<=2047){len+=2}else if(c>=55296&&c<=57343){len+=4;++i}else{len+=3}}return len};var UTF8Decoder=typeof TextDecoder!="undefined"?new TextDecoder:undefined;var UTF8ArrayToString=(heapOrArray,idx,maxBytesToRead)=>{var endIdx=idx+maxBytesToRead;var endPtr=idx;while(heapOrArray[endPtr]&&!(endPtr>=endIdx))++endPtr;if(endPtr-idx>16&&heapOrArray.buffer&&UTF8Decoder){return UTF8Decoder.decode(heapOrArray.subarray(idx,endPtr))}var str="";while(idx<endPtr){var u0=heapOrArray[idx++];if(!(u0&128)){str+=String.fromCharCode(u0);continue}var u1=heapOrArray[idx++]&63;if((u0&224)==192){str+=String.fromCharCode((u0&31)<<6|u1);continue}var u2=heapOrArray[idx++]&63;if((u0&240)==224){u0=(u0&15)<<12|u1<<6|u2}else{u0=(u0&7)<<18|u1<<12|u2<<6|heapOrArray[idx++]&63}if(u0<65536){str+=String.fromCharCode(u0)}else{var ch=u0-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}}return str};var UTF8ToString=(ptr,maxBytesToRead)=>ptr?UTF8ArrayToString(HEAPU8,ptr,maxBytesToRead):"";var __embind_register_std_string=(rawType,name)=>{name=readLatin1String(name);var stdStringIsUTF8=name==="std::string";registerType(rawType,{name:name,fromWireType(value){var length=HEAPU32[value>>2];var payload=value+4;var str;if(stdStringIsUTF8){var decodeStartPtr=payload;for(var i=0;i<=length;++i){var currentBytePtr=payload+i;if(i==length||HEAPU8[currentBytePtr]==0){var maxRead=currentBytePtr-decodeStartPtr;var stringSegment=UTF8ToString(decodeStartPtr,maxRead);if(str===undefined){str=stringSegment}else{str+=String.fromCharCode(0);str+=stringSegment}decodeStartPtr=currentBytePtr+1}}}else{var a=new Array(length);for(var i=0;i<length;++i){a[i]=String.fromCharCode(HEAPU8[payload+i])}str=a.join("")}_free(value);return str},toWireType(destructors,value){if(value instanceof ArrayBuffer){value=new Uint8Array(value)}var length;var valueIsOfTypeString=typeof value=="string";if(!(valueIsOfTypeString||value instanceof Uint8Array||value instanceof Uint8ClampedArray||value instanceof Int8Array)){throwBindingError("Cannot pass non-string to std::string")}if(stdStringIsUTF8&&valueIsOfTypeString){length=lengthBytesUTF8(value)}else{length=value.length}var base=_malloc(4+length+1);var ptr=base+4;HEAPU32[base>>2]=length;if(stdStringIsUTF8&&valueIsOfTypeString){stringToUTF8(value,ptr,length+1)}else{if(valueIsOfTypeString){for(var i=0;i<length;++i){var charCode=value.charCodeAt(i);if(charCode>255){_free(ptr);throwBindingError("String has UTF-16 code units that do not fit in 8 bits")}HEAPU8[ptr+i]=charCode}}else{for(var i=0;i<length;++i){HEAPU8[ptr+i]=value[i]}}}if(destructors!==null){destructors.push(_free,base)}return base},argPackAdvance:GenericWireTypeSize,readValueFromPointer:readPointer,destructorFunction(ptr){_free(ptr)}})};var UTF16Decoder=typeof TextDecoder!="undefined"?new TextDecoder("utf-16le"):undefined;var UTF16ToString=(ptr,maxBytesToRead)=>{var endPtr=ptr;var idx=endPtr>>1;var maxIdx=idx+maxBytesToRead/2;while(!(idx>=maxIdx)&&HEAPU16[idx])++idx;endPtr=idx<<1;if(endPtr-ptr>32&&UTF16Decoder)return UTF16Decoder.decode(HEAPU8.subarray(ptr,endPtr));var str="";for(var i=0;!(i>=maxBytesToRead/2);++i){var codeUnit=HEAP16[ptr+i*2>>1];if(codeUnit==0)break;str+=String.fromCharCode(codeUnit)}return str};var stringToUTF16=(str,outPtr,maxBytesToWrite)=>{if(maxBytesToWrite)maxBytesToWrite=2147483647;if(maxBytesToWrite<2)return 0;maxBytesToWrite-=2;var startPtr=outPtr;var numCharsToWrite=maxBytesToWrite<str.length*2?maxBytesToWrite/2:str.length;for(var i=0;i<numCharsToWrite;++i){var codeUnit=str.charCodeAt(i);HEAP16[outPtr>>1]=codeUnit;outPtr+=2}HEAP16[outPtr>>1]=0;return outPtr-startPtr};var lengthBytesUTF16=str=>str.length*2;var UTF32ToString=(ptr,maxBytesToRead)=>{var i=0;var str="";while(!(i>=maxBytesToRead/4)){var utf32=HEAP32[ptr+i*4>>2];if(utf32==0)break;++i;if(utf32>=65536){var ch=utf32-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}else{str+=String.fromCharCode(utf32)}}return str};var stringToUTF32=(str,outPtr,maxBytesToWrite)=>{if(maxBytesToWrite)maxBytesToWrite=2147483647;if(maxBytesToWrite<4)return 0;var startPtr=outPtr;var endPtr=startPtr+maxBytesToWrite-4;for(var i=0;i<str.length;++i){var codeUnit=str.charCodeAt(i);if(codeUnit>=55296&&codeUnit<=57343){var trailSurrogate=str.charCodeAt(++i);codeUnit=65536+((codeUnit&1023)<<10)|trailSurrogate&1023}HEAP32[outPtr>>2]=codeUnit;outPtr+=4;if(outPtr+4>endPtr)break}HEAP32[outPtr>>2]=0;return outPtr-startPtr};var lengthBytesUTF32=str=>{var len=0;for(var i=0;i<str.length;++i){var codeUnit=str.charCodeAt(i);if(codeUnit>=55296&&codeUnit<=57343)++i;len+=4}return len};var __embind_register_std_wstring=(rawType,charSize,name)=>{name=readLatin1String(name);var decodeString,encodeString,readCharAt,lengthBytesUTF;if(charSize===2){decodeString=UTF16ToString;encodeString=stringToUTF16;lengthBytesUTF=lengthBytesUTF16;readCharAt=pointer=>HEAPU16[pointer>>1]}else if(charSize===4){decodeString=UTF32ToString;encodeString=stringToUTF32;lengthBytesUTF=lengthBytesUTF32;readCharAt=pointer=>HEAPU32[pointer>>2]}registerType(rawType,{name:name,fromWireType:value=>{var length=HEAPU32[value>>2];var str;var decodeStartPtr=value+4;for(var i=0;i<=length;++i){var currentBytePtr=value+4+i*charSize;if(i==length||readCharAt(currentBytePtr)==0){var maxReadBytes=currentBytePtr-decodeStartPtr;var stringSegment=decodeString(decodeStartPtr,maxReadBytes);if(str===undefined){str=stringSegment}else{str+=String.fromCharCode(0);str+=stringSegment}decodeStartPtr=currentBytePtr+charSize}}_free(value);return str},toWireType:(destructors,value)=>{if(!(typeof value=="string")){throwBindingError(`Cannot pass non-string to C++ string type ${name}`)}var length=lengthBytesUTF(value);var ptr=_malloc(4+length+charSize);HEAPU32[ptr>>2]=length/charSize;encodeString(value,ptr+4,length+charSize);if(destructors!==null){destructors.push(_free,ptr)}return ptr},argPackAdvance:GenericWireTypeSize,readValueFromPointer:readPointer,destructorFunction(ptr){_free(ptr)}})};var __embind_register_value_array=(rawType,name,constructorSignature,rawConstructor,destructorSignature,rawDestructor)=>{tupleRegistrations[rawType]={name:readLatin1String(name),rawConstructor:embind__requireFunction(constructorSignature,rawConstructor),rawDestructor:embind__requireFunction(destructorSignature,rawDestructor),elements:[]}};var __embind_register_value_array_element=(rawTupleType,getterReturnType,getterSignature,getter,getterContext,setterArgumentType,setterSignature,setter,setterContext)=>{tupleRegistrations[rawTupleType].elements.push({getterReturnType:getterReturnType,getter:embind__requireFunction(getterSignature,getter),getterContext:getterContext,setterArgumentType:setterArgumentType,setter:embind__requireFunction(setterSignature,setter),setterContext:setterContext})};var __embind_register_value_object=(rawType,name,constructorSignature,rawConstructor,destructorSignature,rawDestructor)=>{structRegistrations[rawType]={name:readLatin1String(name),rawConstructor:embind__requireFunction(constructorSignature,rawConstructor),rawDestructor:embind__requireFunction(destructorSignature,rawDestructor),fields:[]}};var __embind_register_value_object_field=(structType,fieldName,getterReturnType,getterSignature,getter,getterContext,setterArgumentType,setterSignature,setter,setterContext)=>{structRegistrations[structType].fields.push({fieldName:readLatin1String(fieldName),getterReturnType:getterReturnType,getter:embind__requireFunction(getterSignature,getter),getterContext:getterContext,setterArgumentType:setterArgumentType,setter:embind__requireFunction(setterSignature,setter),setterContext:setterContext})};var __embind_register_void=(rawType,name)=>{name=readLatin1String(name);registerType(rawType,{isVoid:true,name:name,argPackAdvance:0,fromWireType:()=>undefined,toWireType:(destructors,o)=>undefined})};var __emscripten_memcpy_js=(dest,src,num)=>HEAPU8.copyWithin(dest,src,src+num);var emval_returnValue=(returnType,destructorsRef,handle)=>{var destructors=[];var result=returnType["toWireType"](destructors,handle);if(destructors.length){HEAPU32[destructorsRef>>2]=Emval.toHandle(destructors)}return result};var __emval_as=(handle,returnType,destructorsRef)=>{handle=Emval.toValue(handle);returnType=requireRegisteredType(returnType,"emval::as");return emval_returnValue(returnType,destructorsRef,handle)};var emval_symbols={};var getStringOrSymbol=address=>{var symbol=emval_symbols[address];if(symbol===undefined){return readLatin1String(address)}return symbol};var emval_methodCallers=[];var __emval_call_method=(caller,objHandle,methodName,destructorsRef,args)=>{caller=emval_methodCallers[caller];objHandle=Emval.toValue(objHandle);methodName=getStringOrSymbol(methodName);return caller(objHandle,objHandle[methodName],destructorsRef,args)};var emval_addMethodCaller=caller=>{var id=emval_methodCallers.length;emval_methodCallers.push(caller);return id};var emval_lookupTypes=(argCount,argTypes)=>{var a=new Array(argCount);for(var i=0;i<argCount;++i){a[i]=requireRegisteredType(HEAPU32[argTypes+i*4>>2],"parameter "+i)}return a};var reflectConstruct=Reflect.construct;var __emval_get_method_caller=(argCount,argTypes,kind)=>{var types=emval_lookupTypes(argCount,argTypes);var retType=types.shift();argCount--;var argN=new Array(argCount);var invokerFunction=(obj,func,destructorsRef,args)=>{var offset=0;for(var i=0;i<argCount;++i){argN[i]=types[i]["readValueFromPointer"](args+offset);offset+=types[i]["argPackAdvance"]}var rv=kind===1?reflectConstruct(func,argN):func.apply(obj,argN);return emval_returnValue(retType,destructorsRef,rv)};var functionName=`methodCaller<(${types.map(t=>t.name).join(", ")}) => ${retType.name}>`;return emval_addMethodCaller(createNamedFunction(functionName,invokerFunction))};var __emval_get_property=(handle,key)=>{handle=Emval.toValue(handle);key=Emval.toValue(key);return Emval.toHandle(handle[key])};var __emval_incref=handle=>{if(handle>9){emval_handles[handle+1]+=1}};var __emval_new_array_from_memory_view=view=>{view=Emval.toValue(view);var a=new Array(view.length);for(var i=0;i<view.length;i++)a[i]=view[i];return Emval.toHandle(a)};var __emval_new_cstring=v=>Emval.toHandle(getStringOrSymbol(v));var __emval_new_object=()=>Emval.toHandle({});var __emval_run_destructors=handle=>{var destructors=Emval.toValue(handle);runDestructors(destructors);__emval_decref(handle)};var __emval_set_property=(handle,key,value)=>{handle=Emval.toValue(handle);key=Emval.toValue(key);value=Emval.toValue(value);handle[key]=value};var __emval_take_value=(type,arg)=>{type=requireRegisteredType(type,"_emval_take_value");var v=type["readValueFromPointer"](arg);return Emval.toHandle(v)};var getHeapMax=()=>2147483648;var growMemory=size=>{var b=wasmMemory.buffer;var pages=(size-b.byteLength+65535)/65536;try{wasmMemory.grow(pages);updateMemoryViews();return 1}catch(e){}};var _emscripten_resize_heap=requestedSize=>{var oldSize=HEAPU8.length;requestedSize>>>=0;var maxHeapSize=getHeapMax();if(requestedSize>maxHeapSize){return false}var alignUp=(x,multiple)=>x+(multiple-x%multiple)%multiple;for(var cutDown=1;cutDown<=4;cutDown*=2){var overGrownHeapSize=oldSize*(1+.2/cutDown);overGrownHeapSize=Math.min(overGrownHeapSize,requestedSize+100663296);var newSize=Math.min(maxHeapSize,alignUp(Math.max(requestedSize,overGrownHeapSize),65536));var replacement=growMemory(newSize);if(replacement){return true}}return false};InternalError=Module["InternalError"]=class InternalError extends Error{constructor(message){super(message);this.name="InternalError"}};embind_init_charCodes();BindingError=Module["BindingError"]=class BindingError extends Error{constructor(message){super(message);this.name="BindingError"}};init_ClassHandle();init_embind();init_RegisteredPointer();UnboundTypeError=Module["UnboundTypeError"]=extendError(Error,"UnboundTypeError");init_emval();var wasmImports={B:___cxa_throw,E:__abort_js,L:__embind_finalize_value_array,u:__embind_finalize_value_object,D:__embind_register_bigint,I:__embind_register_bool,i:__embind_register_class,k:__embind_register_class_constructor,b:__embind_register_class_function,c:__embind_register_class_property,H:__embind_register_emval,K:__embind_register_enum,y:__embind_register_enum_value,A:__embind_register_float,m:__embind_register_function,n:__embind_register_integer,h:__embind_register_memory_view,z:__embind_register_std_string,x:__embind_register_std_wstring,C:__embind_register_value_array,w:__embind_register_value_array_element,v:__embind_register_value_object,f:__embind_register_value_object_field,J:__embind_register_void,G:__emscripten_memcpy_js,o:__emval_as,s:__emval_call_method,a:__emval_decref,t:__emval_get_method_caller,p:__emval_get_property,j:__emval_incref,q:__emval_new_array_from_memory_view,e:__emval_new_cstring,r:__emval_new_object,l:__emval_run_destructors,g:__emval_set_property,d:__emval_take_value,F:_emscripten_resize_heap};var wasmExports=createWasm();var ___wasm_call_ctors=()=>(___wasm_call_ctors=wasmExports["N"])();var ___getTypeName=a0=>(___getTypeName=wasmExports["O"])(a0);var _malloc=Module["_malloc"]=a0=>(_malloc=Module["_malloc"]=wasmExports["Q"])(a0);var _free=Module["_free"]=a0=>(_free=Module["_free"]=wasmExports["R"])(a0);var ___cxa_is_pointer_type=a0=>(___cxa_is_pointer_type=wasmExports["S"])(a0);var calledRun;dependenciesFulfilled=function runCaller(){if(!calledRun)run();if(!calledRun)dependenciesFulfilled=runCaller};function run(){if(runDependencies>0){return}preRun();if(runDependencies>0){return}function doRun(){if(calledRun)return;calledRun=true;Module["calledRun"]=true;if(ABORT)return;initRuntime();readyPromiseResolve(Module);Module["onRuntimeInitialized"]?Module["onRuntimeInitialized"]():null;postRun()}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout(function(){setTimeout(function(){Module["setStatus"]("")},1);doRun()},1)}else{doRun()}}if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].pop()()}}run();moduleRtn=readyPromise;


  return moduleRtn;
}
);
})();
if (typeof exports === 'object' && typeof module === 'object')
  module.exports = Recast;
else if (typeof define === 'function' && define['amd'])
  define([], () => Recast);

window.Recast = Laya.WasmAdapter.create(Recast, "recast-navigation-wasm.wasm");

(function (exports, Laya) {
    'use strict';

    class AreaMask {
        get excludeflag() {
            return this._excludeflag;
        }
        get flag() {
            return this._flags;
        }
        set flag(value) {
            this._flags = value;
            this._calculFlagVale();
        }
        constructor() {
            this._flags = 7;
        }
        _setAreaMap(areaFlagMap) {
            this._areaFlagMap = areaFlagMap;
            this._calculFlagVale();
        }
        _calculFlagVale() {
            if (!this._areaFlagMap)
                return;
            let flag = 0;
            let excludeflag = 0;
            this._areaFlagMap.forEach((value, key) => {
                if (this._flags & value.flag) {
                    flag = flag | value.flag;
                }
                else {
                    excludeflag = excludeflag | value.flag;
                }
            });
            this._flags = flag;
            this._excludeflag = excludeflag;
        }
    }

    class NavigationPathData {
        get pos() {
            return this._pos;
        }
        get flag() {
            return this._flag;
        }
        constructor() {
            this._flag = 0;
            this._pos = new Laya.Vector3();
        }
    }

    const tempVector3 = new Laya.Vector3();
    const tempVector31 = new Laya.Vector3();
    class NavigationUtils {
        static _setDatastoArray(fllowPath, index, data, flag) {
            let navData = fllowPath[index] ? fllowPath[index] : new NavigationPathData();
            navData.pos.fromArray(data);
            navData._flag = flag;
            fllowPath[index] = navData;
        }
        static inRange(v1, v2, radius, height, offIndex) {
            const dx = v2[0] - v1[offIndex];
            const dy = v2[1] - v1[offIndex + 1];
            const dz = v2[2] - v1[offIndex + 2];
            return (dx * dx + dz * dz) < radius * radius && Math.abs(dy) < height;
        }
        static isFlags(data, flag) {
            return data & flag.value;
        }
        static addVector3ToArray(vec1, vec2, scale) {
            let dest = [];
            dest[0] = vec1.x + vec2.x * scale;
            dest[1] = vec1.y + vec2.y * scale;
            dest[2] = vec1.z + vec2.z * scale;
            return dest;
        }
        static getSteerTarget(navMesh, startRef, endRef, minTargetDist, paths, pathSize, out) {
            const navQuery = navMesh.navQuery;
            let data = navQuery.findStraightPath(startRef, endRef, paths, pathSize, 3);
            let steerPath = data.steerPath;
            let steerPathFlags = data.steerPathFlags;
            let steerPathPolys = data.steerPathPolys;
            let nsteerPath = data.nsteerPath;
            if (!nsteerPath) {
                return null;
            }
            let ns = 0;
            while (ns < nsteerPath) {
                if (this.isFlags(steerPathFlags[ns], this._recast.dtStraightPathFlags.DT_STRAIGHTPATH_OFFMESH_CONNECTION) ||
                    !this.inRange(steerPath, startRef, minTargetDist, 1000, ns * 3))
                    break;
                ns++;
            }
            if (ns >= nsteerPath)
                return null;
            out.fromArray(steerPath, ns * 3);
            return {
                steerPosFlag: steerPathFlags[ns],
                steerPosRef: steerPathPolys[ns]
            };
        }
        static dtMergeCorridorStartMoved(path, npath, maxPath, visited, nvisited) {
            let furthestPath = -1;
            let furthestVisited = -1;
            for (var i = npath - 1; i >= 0; i--) {
                let found = false;
                for (let j = nvisited - 1; j >= 0; --j) {
                    if (path[i] == visited[j]) {
                        furthestPath = i;
                        furthestVisited = j;
                        found = true;
                    }
                }
                if (found)
                    break;
            }
            if (furthestPath == -1 || furthestVisited == -1)
                return npath;
            const req = nvisited - furthestVisited;
            const orig = Math.min(furthestPath + 1, npath);
            let size = Math.max(0, npath - orig);
            if (req + size > maxPath)
                size = maxPath - req;
            for (let i = 0; i < req; ++i)
                path[i] = visited[(nvisited - 1) - i];
            return req + size;
        }
        static findFllowPath(navMesh, filter, startPos, endPos, steplength, minTarget, fllowPath) {
            const navQuery = navMesh.navQuery;
            const namesh = navMesh.navMesh;
            const startRef = navQuery.findNearestPoly(startPos.toArray(), navMesh.extents, filter);
            const endRef = navQuery.findNearestPoly(endPos.toArray(), navMesh.extents, filter);
            let pathdata = navQuery.findPath(startRef, endRef, filter, NavigationUtils.MAX_POLYS);
            let polys = pathdata.polys;
            let m_npolys = polys.length;
            let m_nsmoothPath = 0;
            let steerPos = new Laya.Vector3();
            let help1 = new Laya.Vector3();
            let help2 = new Laya.Vector3();
            if (polys.length > 0) {
                let npolys = m_npolys;
                let iterPos = navQuery.closestPointOnPolyByRefPointData(startRef);
                let targetPos = navQuery.closestPointOnPoly(polys[npolys - 1], endRef.data);
                this._setDatastoArray(fllowPath, m_nsmoothPath, iterPos, this._recast.dtStraightPathFlags.DT_STRAIGHTPATH_START.value);
                m_nsmoothPath++;
                while (npolys && m_nsmoothPath < NavigationUtils.MAX_SMOOTH) {
                    let steerData = this.getSteerTarget(navMesh, iterPos, targetPos, minTarget, polys, npolys, steerPos);
                    if (steerData == null) {
                        break;
                    }
                    help1.fromArray(iterPos);
                    let steerPosFlag = steerData.steerPosFlag;
                    let steerPosRef = steerData.steerPosRef;
                    let endOfPath = this.isFlags(steerPosFlag, this._recast.dtStraightPathFlags.DT_STRAIGHTPATH_END) ? true : false;
                    let offMeshConnection = this.isFlags(steerPosFlag, this._recast.dtStraightPathFlags.DT_STRAIGHTPATH_OFFMESH_CONNECTION) ? true : false;
                    Laya.Vector3.subtract(steerPos, help1, help2);
                    let len = help2.length();
                    if ((endOfPath || offMeshConnection) && len < steplength)
                        len = 1;
                    else
                        len = steplength / len;
                    let moveTgt = this.addVector3ToArray(help1, help2, len);
                    let surfacedata = navQuery.moveAlongSurface(polys[0], iterPos, moveTgt, filter, 16);
                    let result = surfacedata.resultPos;
                    let visited = surfacedata.visited;
                    polys = this._recast.mergeCorridorStartMoved(polys, NavigationUtils.MAX_POLYS, Array.from(visited));
                    polys = this._recast.fixupShortcuts(polys, navQuery);
                    npolys = polys.length;
                    let heightData = navQuery.getPolyHeight(polys[0], result);
                    result[1] = heightData.height;
                    iterPos = result;
                    let isRange = this.inRange(iterPos, steerPos.toArray(), minTarget, 1.0, 0);
                    if (endOfPath && isRange) {
                        iterPos = targetPos;
                        if (m_nsmoothPath < NavigationUtils.MAX_SMOOTH) {
                            this._setDatastoArray(fllowPath, m_nsmoothPath, iterPos, this._recast.dtStraightPathFlags.DT_STRAIGHTPATH_END.value);
                            m_nsmoothPath++;
                        }
                        break;
                    }
                    else if (offMeshConnection && isRange) {
                        let startPos = [0, 0, 0];
                        let endPos = [0, 0, 0];
                        let prevRef = 0, polyRef = polys[0];
                        let npos = 0;
                        while (npos < npolys && polyRef != steerPosRef) {
                            prevRef = polyRef;
                            polyRef = polys[npos];
                            npos++;
                        }
                        for (let i = npos; i < npolys; ++i) {
                            polys[i - npos] = polys[i];
                        }
                        npolys -= npos;
                        let status = namesh.getOffMeshConnectionPolyEndPoints(prevRef, polyRef, startPos, endPos);
                        if (this.statusSucceed(status)) {
                            if (m_nsmoothPath < NavigationUtils.MAX_SMOOTH) {
                                this._setDatastoArray(fllowPath, m_nsmoothPath, startPos, steerPosFlag);
                                m_nsmoothPath++;
                                if (m_nsmoothPath & 1) {
                                    this._setDatastoArray(fllowPath, m_nsmoothPath, startPos, steerPosFlag);
                                    m_nsmoothPath++;
                                }
                            }
                            iterPos = endPos;
                            heightData = navQuery.getPolyHeight(polys[0], iterPos);
                            iterPos[1] = heightData.height;
                        }
                    }
                    if (m_nsmoothPath < NavigationUtils.MAX_SMOOTH) {
                        this._setDatastoArray(fllowPath, m_nsmoothPath, iterPos, steerPosFlag);
                        m_nsmoothPath++;
                    }
                }
            }
            fllowPath.length = m_nsmoothPath;
        }
        static getTitleData(title, vbDatas, center, ibs) {
            let header = title.getheader();
            if (!header)
                return null;
            const vboff = vbDatas.length / 6;
            let tvertCount = header.vertCount;
            let tailTris = title.getdetailTris();
            for (var i = 0; i < header.polyCount; i++) {
                let p = title.getPolys(i);
                let vertCount = p.vertCount;
                let pverts = p.getVerts();
                let pd = title.getPolyDetail(i);
                let triCount = pd.triCount;
                for (var j = 0; j < triCount; j++) {
                    let index = (pd.triBase + j) * 4;
                    for (var k = 0; k < 3; k++) {
                        const kvalue = tailTris[index + NavigationUtils.TitleMeshIbOff[k]];
                        if (kvalue < vertCount) {
                            ibs.push(pverts[kvalue] + vboff);
                        }
                        else {
                            ibs.push(pd.vertBase + kvalue - vertCount + vboff + tvertCount);
                        }
                    }
                }
            }
            let verts = title.getVerts();
            for (var i = 0, n = verts.length; i < n; i += 3) {
                vbDatas.push(verts[i] - center.x);
                vbDatas.push(verts[i + 1] - center.y);
                vbDatas.push(verts[i + 2] - center.z);
                vbDatas.push(0, 0, 0);
            }
            verts = title.getdetailVerts();
            for (var i = 0, n = verts.length; i < n; i += 3) {
                vbDatas.push(verts[i] - center.x);
                vbDatas.push(verts[i + 1] - center.y);
                vbDatas.push(verts[i + 2] - center.z);
                vbDatas.push(0, 0, 0);
            }
        }
        static creageDebugMesh(navMesh, mesh) {
            let m_navMesh = navMesh.navMesh;
            let tileCount = m_navMesh.getMaxTiles();
            Laya.Vector3.lerp(navMesh.navTileGrid.boundMax, navMesh.navTileGrid.boundMin, 0.5, tempVector3);
            let poses = [];
            let indexs = [];
            for (var i = 0; i < tileCount; i++) {
                this.getTitleData(m_navMesh.getTile(i), poses, tempVector3, indexs);
            }
            let vertexDeclaration = Laya.VertexMesh.getVertexDeclaration("POSITION,NORMAL");
            let vb = new Float32Array(poses);
            let ib = new Uint16Array(indexs);
            if (mesh == null) {
                mesh = Laya.PrimitiveMesh._createMesh(vertexDeclaration, vb, ib);
            }
            else {
                this.resetMesh(mesh, vertexDeclaration, vb, ib);
            }
            Laya.Vector3.subtract(navMesh.navTileGrid.boundMax, tempVector3, mesh.bounds.max);
            Laya.Vector3.subtract(navMesh.navTileGrid.boundMin, tempVector3, mesh.bounds.min);
            return mesh;
        }
        static resetMesh(mesh, vertexDeclaration, vertices, indices) {
            var vertexBuffer = Laya.Laya3DRender.renderOBJCreate.createVertexBuffer3D(vertices.length * 4, Laya.BufferUsage.Static, true);
            vertexBuffer.vertexDeclaration = vertexDeclaration;
            vertexBuffer.setData(vertices.buffer);
            mesh._vertexBuffer = vertexBuffer;
            mesh._vertexCount = vertexBuffer._byteLength / vertexDeclaration.vertexStride;
            var indexBuffer = Laya.Laya3DRender.renderOBJCreate.createIndexBuffer3D(Laya.IndexFormat.UInt16, indices.length, Laya.BufferUsage.Static, true);
            indexBuffer.setData(indices);
            mesh._indexBuffer = indexBuffer;
            mesh._setBuffer(vertexBuffer, indexBuffer);
            let subMesh = mesh.getSubMesh(0);
            subMesh._vertexBuffer = vertexBuffer;
            subMesh._indexBuffer = indexBuffer;
            subMesh._setIndexRange(0, indexBuffer.indexCount);
            var subIndexBufferStart = subMesh._subIndexBufferStart;
            var subIndexBufferCount = subMesh._subIndexBufferCount;
            var boneIndicesList = subMesh._boneIndicesList;
            subIndexBufferStart.length = 1;
            subIndexBufferCount.length = 1;
            boneIndicesList.length = 1;
            subIndexBufferStart[0] = 0;
            subIndexBufferCount[0] = indexBuffer.indexCount;
            var memorySize = vertexBuffer._byteLength + indexBuffer._byteLength;
            mesh._setCPUMemory(memorySize);
            mesh._setGPUMemory(memorySize);
        }
        static transfromBound(mat, min, max, outMin, outMax) {
            let center = tempVector3;
            let extent = tempVector31;
            Laya.Vector3.lerp(max, min, 0.5, center);
            Laya.Vector3.subtract(max, min, extent);
            Laya.Vector3.scale(extent, 0.5, extent);
            Laya.Vector3.transformCoordinate(center, mat, center);
            NavigationUtils._rotateExtents(extent, mat, extent);
            Laya.Vector3.subtract(center, extent, outMin);
            Laya.Vector3.add(center, extent, outMax);
        }
        static _rotateExtents(extents, rotation, out) {
            var extentsX = extents.x;
            var extentsY = extents.y;
            var extentsZ = extents.z;
            var matE = rotation.elements;
            out.x = Math.abs(matE[0] * extentsX) + Math.abs(matE[4] * extentsY) + Math.abs(matE[8] * extentsZ);
            out.y = Math.abs(matE[1] * extentsX) + Math.abs(matE[5] * extentsY) + Math.abs(matE[9] * extentsZ);
            out.z = Math.abs(matE[2] * extentsX) + Math.abs(matE[6] * extentsY) + Math.abs(matE[10] * extentsZ);
        }
        static boundContainPoint(min, max, point) {
            return point.x >= min.x && point.x <= max.x && point.y >= min.y && point.y <= max.y && point.z >= min.z && point.z <= max.z;
        }
        static initialize(Recast) {
            NavigationUtils._recast = Recast;
            NavigationUtils._dtCrowdAgentParams = new Recast.dtCrowdAgentParams();
            NavigationUtils._TemprefPoint = {};
            NavigationUtils._TemprefPoint1 = {};
        }
        static createNavMesh() {
            return new this._recast.dtNavMesh();
        }
        static createNavMeshQuery() {
            return new this._recast.dtNavMeshQuery();
        }
        static createRefPointData() {
            return new this._recast.dtRefPointData();
        }
        static createMeshOffLink() {
            return new this._recast.dtOffMeshConnection();
        }
        static createConvexVolume() {
            return new this._recast.dtConvexVolume();
        }
        static createQueryFilter() {
            return new this._recast.dtQueryFilter();
        }
        static createCrowd() {
            return new this._recast.dtCrowd();
        }
        static createdtNavTileData() {
            return new this._recast.dtNavTileData();
        }
        static createdtNavTileCache() {
            return new this._recast.dtNavTileCache();
        }
        static getCrowdAgentParams() {
            return this._dtCrowdAgentParams;
        }
        static freeNavMeshQuery(data) {
            this._recast.dtFreeNavMeshQuery(data);
        }
        static freeNavMesh(data) {
            this._recast.dtFreeNavMesh(data);
        }
        static freeCrowd(data) {
            this._recast.dtFreeCrowd(data);
        }
        static free(data) {
            this._recast.dtFree(data);
        }
        static freeLayaData(data) {
            this._recast._free(data);
        }
        static statusSucceed(status) {
            return this._recast.dtStatusSucceed(status);
        }
    }
    NavigationUtils.MAX_SMOOTH = 2048;
    NavigationUtils.MAX_POLYS = 256;
    NavigationUtils.TitleMeshIbOff = [0, 2, 1];

    const readNavTileCache = function (byte, navData) {
        navData._dirtyFlag = byte.getFloat32();
        const min = navData._boundMin;
        min.x = byte.getFloat32();
        min.y = byte.getFloat32();
        min.z = byte.getFloat32();
        const max = navData._boundMax;
        max.x = byte.getFloat32();
        max.y = byte.getFloat32();
        max.z = byte.getFloat32();
        let navCount = byte.readUint16();
        for (var i = 0; i < navCount; i++) {
            let nav = navData._oriTiles[i] = new NavTileCache();
            const min = nav._boundMin;
            min.x = byte.getFloat32();
            min.y = byte.getFloat32();
            min.z = byte.getFloat32();
            const max = nav._boundMax;
            max.x = byte.getFloat32();
            max.y = byte.getFloat32();
            max.z = byte.getFloat32();
            nav.x = byte.readUint16();
            nav.y = byte.readUint16();
            let vertStart = byte.readUint32();
            let vertCount = byte.readUint32();
            let indexStart = byte.readUint32();
            let indexCount = byte.readUint32();
            let flagStart = byte.readUint32();
            let flagCount = byte.readUint32();
            byte.pos = vertStart;
            nav.triVertex = new Float32Array(byte.readArrayBuffer(vertCount));
            byte.pos = indexStart;
            nav.triIndex = new Uint32Array(byte.readArrayBuffer(indexCount));
            byte.pos = flagStart;
            nav.triFlag = new Uint8Array(byte.readArrayBuffer(flagCount));
        }
    };
    class NavTileCache {
        constructor() {
            this._bindData = NavigationUtils.createdtNavTileData();
            this._boundMax = new Laya.Vector3();
            this._boundMin = new Laya.Vector3();
            this.x = this.y = 0;
        }
        set triVertex(data) {
            this._triVertex = data;
            this._bindData.setTriVertex(data);
        }
        get triVertex() {
            return this._triVertex;
        }
        set triIndex(data) {
            this._triIndex = data;
            this._bindData.setTriIndex(data);
        }
        get triIndex() {
            return this._triIndex;
        }
        set triFlag(data) {
            this._triFlag = data;
            this._bindData.setTriFlag(data);
        }
        get triFlag() {
            return this._triFlag;
        }
        get boundMin() {
            return this._boundMin;
        }
        get boundMax() {
            return this._boundMax;
        }
        get bindData() {
            return this._bindData;
        }
        destroy() {
            if (this._bindData) {
                NavigationUtils.free(this._bindData);
                this._bindData = null;
            }
        }
    }
    class NavTileData {
        constructor(res) {
            this._dirtyFlag = 0;
            this._boundMax = new Laya.Vector3();
            this._boundMin = new Laya.Vector3();
            this._res = res;
            this._oriTiles = [];
            this._parse();
        }
        _parse() {
            var readData = new Laya.Byte(this._res.data);
            readData.pos = 0;
            var version = readData.readUTFString();
            switch (version) {
                case "LAYANAV:0101":
                    readNavTileCache(readData, this);
                    break;
            }
        }
        get dirtyFlag() {
            return this._dirtyFlag;
        }
        getNavData(index) {
            return this._oriTiles[index];
        }
        get length() {
            return this._oriTiles.length;
        }
    }

    class NavMeshGrid {
        get tileWidth() {
            return this._config.tileSize * this._config.cellSize;
        }
        constructor(config, min, max) {
            this._boundsMin = new Laya.Vector3();
            this._boundsMax = new Laya.Vector3();
            this._bordWidth = 0;
            this._config = config;
            this._boundsMin = min;
            this._boundsMax = max;
            this._tileSize = new Laya.Vector2();
            this._cellSize = new Laya.Vector2();
            this._updateBound();
        }
        _updateBound() {
            this._bordWidth = this._config.cellSize * 3;
            let max = this._boundsMax;
            let min = this._boundsMin;
            const tileWidth = this._config.cellSize * this._config.tileSize;
            this._tileSize.x = Math.ceil((max.x - min.x) / tileWidth);
            this._tileSize.y = Math.ceil((max.z - min.z) / tileWidth);
            const cellSize = this._config.cellSize;
            this._cellSize.x = Math.ceil((max.x - min.x) / cellSize);
            this._cellSize.x = Math.ceil((max.z - min.z) / cellSize);
        }
        refeachConfig(tile) {
            tile._boundMin.cloneTo(this._boundsMin);
            tile._boundMax.cloneTo(this._boundsMax);
            this._updateBound();
        }
        getBoundTileIndex(min, max, isbord = false) {
            let pMinx = min.x;
            let pMinz = min.z;
            let pMaxx = max.x;
            let pMaxz = max.z;
            if (isbord) {
                pMinx -= this._bordWidth;
                pMinz -= this._bordWidth;
                pMaxx += this._bordWidth;
                pMaxz += this._bordWidth;
            }
            let lists = [];
            let minIx = Math.max(0, this.getTileXIndex(pMinx));
            let maxIx = Math.min(this._tileSize.x - 1, this.getTileXIndex(pMaxx));
            let minIz = Math.max(0, this.getTileZIndex(pMinz));
            let maxIz = Math.min(this._tileSize.y - 1, this.getTileZIndex(pMaxz));
            for (var z = minIz; z <= maxIz; z++) {
                for (var x = minIx; x <= maxIx; x++) {
                    lists.push(z * this._tileSize.x + x);
                }
            }
            return lists;
        }
        get boundMin() {
            return this._boundsMin;
        }
        get boundMax() {
            return this._boundsMax;
        }
        get config() {
            return this._config;
        }
        getTileIndexByPos(x, z) {
            return this.getTileIndex(this.getTileXIndex(x), this.getTileZIndex(z));
        }
        getTileIndex(xIndex, zIndex) {
            if (zIndex < 0 || zIndex >= this._tileSize.y) {
                return -1;
            }
            if (xIndex < 0 || xIndex >= this._tileSize.x) {
                return -1;
            }
            return zIndex * (this._tileSize.x) + xIndex;
        }
        getTileXIndex(value) {
            return this._getLeftValue(value - this._boundsMin.x);
        }
        getTileZIndex(value) {
            return this._getLeftValue(value - this._boundsMin.z);
        }
        _getLeftValue(value) {
            return Math.floor(value / this.tileWidth);
        }
        getMaxtiles() {
            return this.maxXTileCount * this.maxZTileCount;
        }
        get maxXTileCount() {
            return this._tileSize.x;
        }
        get maxZTileCount() {
            return this._tileSize.y;
        }
        get maxXCellCount() {
            return this._cellSize.x;
        }
        get maxZCellCount() {
            return this._cellSize.y;
        }
    }

    class TitleConfig {
        constructor() {
            this.tx = 0;
            this.ty = 0;
            this.maxSimplificationError = 1.3;
            this.bmin = [0, 0, 0];
            this.bmax = [0, 0, 0];
        }
        setOff(tx, ty) {
            this.tx = tx;
            this.ty = ty;
        }
        setMin(value) {
            this.bmin[0] = value.x;
            this.bmin[1] = value.y;
            this.bmin[2] = value.z;
        }
        setMax(value) {
            this.bmax[0] = value.x;
            this.bmax[1] = value.y;
            this.bmax[2] = value.z;
        }
        setAgent(height, radius, maxClimb) {
            this.agentHeight = height;
            this.agentRadius = radius;
            this.agentMaxClimb = maxClimb;
        }
        setMaxEdgeLen(value) {
            this.maxEdgeLen = Math.ceil(value);
        }
    }

    const CROW_MAX_FILTER = 16;
    class NavMesh {
        get min() {
            return this._grid.boundMin;
        }
        get max() {
            return this._grid.boundMax;
        }
        get extents() {
            return this._extents;
        }
        get navMesh() {
            return this._navMesh;
        }
        get navQuery() {
            return this._navQuery;
        }
        get crowd() {
            return this._crowd;
        }
        get navTileGrid() {
            return this._grid;
        }
        constructor(config, min, max, manager) {
            this._extents = [2, 4, 2];
            this._maxAgents = 128;
            this._manager = manager;
            this._grid = new NavMeshGrid(config, min, max);
            this._titileConfig = new TitleConfig();
            this._navcreateedTileMaps = new Set();
            this._delayCreates = new Map();
            this._fiterMap = new Map();
            this._meshlinkOffList = new Laya.SingletonList();
            this._meshlinkoffIdLists = [];
            this._meshVolumeList = new Laya.SingletonList();
            this._meshVolumeIdLists = [];
            this._creatNavMesh();
            this._navMeshInit();
        }
        _creatNavMesh() {
            this._navMesh = NavigationUtils.createNavMesh();
            this._navQuery = NavigationUtils.createNavMeshQuery();
            this._crowd = NavigationUtils.createCrowd();
            this._navMeshLink = NavigationUtils.createMeshOffLink();
            this._navConvexVolume = NavigationUtils.createConvexVolume();
            this._navConvexVolume.setIs3D(true);
        }
        _navMeshInit() {
            let config = this._grid.config;
            let min = this._grid.boundMin;
            let max = this._grid.boundMax;
            this._navMesh.init(min.toArray(), max.toArray(), config.cellSize, config.tileSize);
            this._navQuery.init(this._navMesh, 2048);
            this._crowd.init(this._maxAgents, config.agentRadius, this.navMesh);
            let areaFlagMap = this._manager._areaFlagMap;
            for (var i = 0; i < CROW_MAX_FILTER; i++) {
                let filer = this._crowd.getFilter(i);
                areaFlagMap.forEach((value) => {
                    filer.setAreaCost(value.flag, value.cost);
                });
            }
            let fiter = this._defatfilter = this._crowd.getFilter(0);
            fiter.setIncludeFlags(this._manager._deflatAllMask.flag);
            fiter.queryFilterType = 0;
            this._fiterMap.set(0, fiter);
        }
        _getFilter(areaMask) {
            let excludeflag = areaMask.excludeflag;
            if (this._fiterMap.has(excludeflag)) {
                return this._fiterMap.get(excludeflag);
            }
            let size = this._fiterMap.size;
            if (size >= CROW_MAX_FILTER) {
                console.error("Not max " + CROW_MAX_FILTER + ".");
                return null;
            }
            let fiter = this._crowd.getFilter(size);
            fiter.setIncludeFlags(this._manager._deflatAllMask.flag);
            fiter.setExcludeFlags(excludeflag);
            fiter.queryFilterType = size;
            this._fiterMap.set(excludeflag, fiter);
            return fiter;
        }
        _createAgents(agent) {
            agent._filter = this._getFilter(agent._areaMask);
            const pos = agent.owner.transform.position;
            let params = NavigationUtils.getCrowdAgentParams();
            const radius = agent._getradius();
            params.radius = radius;
            params.collisionQueryRange = radius * 12;
            params.pathOptimizationRange = radius * 30;
            params.height = agent._getheight();
            params.maxAcceleration = agent.maxAcceleration;
            params.maxSpeed = agent.speed;
            params.obstacleAvoidanceType = agent.quality;
            params.separationWeight = agent.priority;
            params.queryFilterType = agent._filter.queryFilterType;
            params.updateFlags = agent._getUpdateFlags();
            let refPoint = this._navQuery.findNearestPoly(pos.toArray(), this._extents, agent._filter);
            agent._agentId = this._crowd.addAgent(refPoint.data, params);
            agent._crowAgent = this._crowd.getAgent(agent._agentId);
        }
        addAgent(agent) {
            let pos = agent.owner.transform.position;
            let tileIndex = this._grid.getTileIndexByPos(pos.x, pos.z);
            if (this._navcreateedTileMaps.has(tileIndex)) {
                this._createAgents(agent);
            }
            else {
                if (!this._delayCreates.has(tileIndex)) {
                    this._delayCreates.set(tileIndex, []);
                }
                this._delayCreates.get(tileIndex).push(agent);
            }
        }
        removeAgent(agent) {
            this._crowd.removeAgent(agent._agentId);
            agent._agentId = null;
            agent._crowAgent = null;
        }
        raycastNavMesh(ray, outPos) {
            return false;
        }
        addNavMeshLink(link) {
            if (this._meshlinkOffList.indexof(link) >= 0)
                return;
            this._meshlinkOffList.add(link);
            let index = this._meshlinkOffList.length - 1;
            let area = this._manager.getArea(link.areaFlag);
            let pos = link._start.toArray();
            pos[1] += this._grid.config.cellHeight;
            this._meshlinkoffIdLists[index] = this._navMeshLink.addOffMeshConnection(index, pos, link._end.toArray(), link.width, link.bidirectional ? 1 : 0, area.index);
        }
        removeNavMeshLink(link) {
            let index = this._meshlinkOffList.indexof(link);
            if (index < 0)
                return;
            this._navMeshLink.deleteOffMeshConnection(index);
            this._meshlinkOffList.remove(link);
            this._meshlinkoffIdLists[index] = this._meshlinkoffIdLists[this._meshlinkOffList.length];
        }
        addCovexVoume(volume) {
            if (this._meshVolumeList.indexof(volume) >= 0)
                return;
            this._meshVolumeList.add(volume);
            let index = this._meshVolumeList.length - 1;
            let areaType = this._manager.getArea(volume.areaFlag).index;
            this._navConvexVolume.addCovexVoume(index, volume._datas, 0, 0, areaType);
            this._meshVolumeIdLists[this._meshVolumeList.length - 1] = index;
        }
        updateCovexVoume(volume) {
            let index = this._meshVolumeList.indexof(volume);
            if (index < 0)
                return;
            let areaType = this._manager.getArea(volume.areaFlag).index;
            this._navConvexVolume.addCovexVoume(index, volume._datas, 0, 0, areaType);
        }
        deleteCovexVoume(volume) {
            let index = this._meshVolumeList.indexof(volume);
            if (index < 0)
                return;
            this._navConvexVolume.deleteCovexVoume(index);
            this._meshVolumeList.remove(volume);
            this._meshVolumeIdLists[index] = this._meshVolumeIdLists[this._meshVolumeList.length];
        }
        getPolyFlags(pos, fiter = null) {
            const posRef = this.findNearestPoly(pos, fiter);
            return this._navMesh.getPolyFlags(posRef.polyRef);
        }
        getPolyArea(pos, fiter = null) {
            const posRef = this.findNearestPoly(pos, fiter);
            return this._navMesh.getPolyArea(posRef.polyRef);
        }
        findNearestPoly(pos, fiter = null) {
            if (!fiter)
                fiter = this._defatfilter;
            return this._navQuery.findNearestPoly(pos.toArray(), this.extents, fiter);
        }
        findFllowPath(agent, fllowPaths) {
            let pos = agent.owner.transform.position;
            let tileIndex = this._grid.getTileIndexByPos(pos.x, pos.z);
            if (this._navcreateedTileMaps.has(tileIndex)) {
                NavigationUtils.findFllowPath(this, agent._filter, agent.owner.transform.position, agent.destination, 0.1, 0.01, fllowPaths);
                return true;
            }
            else {
                return false;
            }
        }
        findDistanceToWall(agent) {
            let filter = agent._filter;
            let pos = agent.owner.transform.position;
            let posref = this._navQuery.findNearestPoly(pos.toArray(), this.extents, filter);
            let data = this._navQuery.findDistanceToWall(posref, filter, 100);
            if (NavigationUtils.statusSucceed(data.Status))
                return data;
            else
                return null;
        }
        requestMoveTarget(agent, destination) {
            let pos = agent.owner.transform.position;
            let tileIndex = this._grid.getTileIndexByPos(pos.x, pos.z);
            if (this._navcreateedTileMaps.has(tileIndex)) {
                let refPoint = this._navQuery.findNearestPoly(destination.toArray(), this._extents, agent._filter);
                this.crowd.requestMoveTarget(agent._agentId, refPoint);
                return true;
            }
            else {
                return false;
            }
        }
        _addTile(tileX, tileY, binds, min, max, partitionType) {
            if (binds.length <= 0)
                return;
            const config = this._grid.config;
            this._titileConfig.partitionType = partitionType;
            this._titileConfig.maxSimplificationError = 0.9;
            this._titileConfig.setMaxEdgeLen(12 / config.cellSize);
            this._titileConfig.setAgent(config.agentHeight, config.agentRadius, config.agentMaxClimb);
            this._titileConfig.setOff(tileX, tileY);
            this._titileConfig.setMin(min);
            this._titileConfig.setMax(max);
            this.removeTile(tileX, tileY);
            let ptrs = [];
            binds.forEach((value) => {
                ptrs.push(value.$$.ptr);
            });
            this._navMesh.addTile(config, this._titileConfig, ptrs, this._navMeshLink, this._navConvexVolume);
            this._navcreateedTileMaps.add(this._grid.getTileIndex(tileX, tileY));
            let tileIndex = this._grid.getTileIndex(tileX, tileY);
            if (this._delayCreates.has(tileIndex)) {
                const delaylists = this._delayCreates.get(tileIndex);
                delaylists.forEach((nav) => {
                    this._createAgents(nav);
                });
                this._delayCreates.delete(tileIndex);
            }
            if (this._debugMesh) {
                NavigationUtils.creageDebugMesh(this, this._debugMesh);
            }
        }
        removeTile(tileX, tileY) {
            this._navMesh.removeTile(tileX, tileY);
            this._navcreateedTileMaps.delete(this._grid.getTileIndex(tileX, tileY));
        }
        buildDebugMesh() {
            this._debugMesh = NavigationUtils.creageDebugMesh(this, null);
            return this._debugMesh;
        }
        destroy() {
            if (this._navMesh) {
                NavigationUtils.freeNavMesh(this._navMesh);
                this._navMesh = null;
            }
            if (this._navQuery) {
                NavigationUtils.freeNavMeshQuery(this._navQuery);
                this._navQuery = null;
            }
            if (this._navMeshLink) {
                NavigationUtils.free(this._navMeshLink);
                this._navMeshLink = null;
            }
            if (this._navConvexVolume) {
                NavigationUtils.free(this._navConvexVolume);
                this._navConvexVolume = null;
            }
            if (this._crowd) {
                NavigationUtils.freeCrowd(this._crowd);
                this._crowd = null;
            }
        }
    }

    exports.PartitionType = void 0;
    (function (PartitionType) {
        PartitionType[PartitionType["PARTITION_WATERSHED"] = 0] = "PARTITION_WATERSHED";
        PartitionType[PartitionType["PARTITION_MONOTONE"] = 1] = "PARTITION_MONOTONE";
        PartitionType[PartitionType["PARTITION_LAYERS"] = 2] = "PARTITION_LAYERS";
    })(exports.PartitionType || (exports.PartitionType = {}));
    class NavMeshSurface extends Laya.Component {
        static findNavMeshSurface(surfaces, sprite, agentFlags) {
            let array = sprite.getComponents(NavMeshSurface);
            if (array && array.length > 0) {
                array.forEach(element => {
                    (agentFlags.indexOf(element.agentType) >= 0) && surfaces.push(element);
                });
            }
            let parat = sprite.parent;
            if (parat && (parat instanceof Laya.Sprite3D)) {
                NavMeshSurface.findNavMeshSurface(surfaces, parat, agentFlags);
            }
        }
        ;
        set agentType(value) {
            this._agentType = value;
        }
        get agentType() {
            return this._agentType;
        }
        set areaFlag(value) {
            this._areaFlags = value;
        }
        get areaFlag() {
            return this._areaFlags;
        }
        set asyn(value) {
            this._needAsyn = value;
        }
        get asyn() {
            return this._needAsyn;
        }
        set partitionType(value) {
            this._partitionType = value;
        }
        get partitionType() {
            return this._partitionType;
        }
        get boundMin() { return this._boundMin; }
        get boundMax() { return this._boundMax; }
        set datas(value) {
            this._featureCache.clear();
            if (value) {
                this._oriTiles = new NavTileData(value);
                if (this._navMesh) {
                    this._navMesh.navTileGrid.refeachConfig(this._oriTiles);
                    this._navMesh._navMeshInit();
                }
                for (var i = 0, n = this._oriTiles.length; i < n; i++) {
                    if (!this._bindDatas.has(i))
                        this._bindDatas.set(i, NavigationUtils.createdtNavTileCache());
                    this._bindDatas.get(i).init(this._oriTiles.getNavData(i).bindData);
                    this._buildTileList.add(i);
                }
            }
            else {
                this._oriTiles = null;
                this._cleanBindData();
            }
        }
        get datas() {
            if (!this._oriTiles)
                return null;
            return this._oriTiles._res;
        }
        get navMesh() {
            return this._navMesh;
        }
        constructor() {
            super();
            this._agentType = NavigationManager.defaltAgentName;
            this._areaFlags = NavigationManager.defaltWalk;
            this._boundMin = new Laya.Vector3();
            this._boundMax = new Laya.Vector3();
            this._needAsyn = false;
            this._singleton = false;
            this._buildTileList = new Laya.SingletonList();
            this._featureCache = new Map();
            this._boundMax = new Laya.Vector3();
            this._boundMin = new Laya.Vector3();
            this._bindDatas = new Map();
            this._partitionType = exports.PartitionType.PARTITION_WATERSHED;
        }
        _onEnable() {
            let manager = this.owner.scene.getComponentElementManager("navMesh");
            if (!this._navMesh) {
                this._navMesh = new NavMesh(manager.getNavConfig(this._agentType), this._boundMin, this._boundMax, manager);
                if (this._oriTiles) {
                    this._navMesh.navTileGrid.refeachConfig(this._oriTiles);
                    this._navMesh._navMeshInit();
                }
            }
            manager.regNavMeshSurface(this);
        }
        _onDisable() {
            let manager = this.owner.scene.getComponentElementManager("navMesh");
            manager.removeNavMeshSurface(this);
        }
        _onDestroy() {
            this.cleanAllTile();
            if (this._oriTiles)
                this._oriTiles = null;
        }
        _cloneTo(dest) {
            dest._agentType = this._agentType;
            dest._areaFlags = this._areaFlags;
            dest._partitionType = this._partitionType;
            super._cloneTo(dest);
        }
        _addModifileNavMesh(navModifile) {
            let indexs = this.navMesh.navTileGrid.getBoundTileIndex(navModifile.boundMin, navModifile.boundMax, true);
            indexs.forEach((index) => {
                let cacheFeature = this._featureCache.get(index);
                if (!cacheFeature) {
                    cacheFeature = new Laya.SingletonList();
                    this._featureCache.set(index, cacheFeature);
                }
                if (cacheFeature.indexof(navModifile) < 0) {
                    cacheFeature.add(navModifile);
                    if (this._buildTileList.indexof(index) < 0)
                        this._buildTileList.add(index);
                }
            });
        }
        _removeModifileNavMesh(navModifile) {
            let indexs = this.navMesh.navTileGrid.getBoundTileIndex(navModifile.boundMin, navModifile.boundMax, true);
            indexs.forEach((index) => {
                let cacheFeature = this._featureCache.get(index);
                if (!cacheFeature) {
                    return;
                }
                if (cacheFeature.indexof(navModifile) >= 0) {
                    cacheFeature.remove(navModifile);
                    if (this._buildTileList.indexof(index) < 0)
                        this._buildTileList.add(index);
                }
            });
        }
        _addMeshLink(meshLink) {
            this._navMesh.addNavMeshLink(meshLink);
        }
        _removeMeshLink(meshLink) {
            this._navMesh.removeNavMeshLink(meshLink);
        }
        _addCovexVoume(volume) {
            this._navMesh.addCovexVoume(volume);
        }
        _updateCovexVoume(volume) {
            this._navMesh.updateCovexVoume(volume);
        }
        _removeCovexVoume(volume) {
            this._navMesh.deleteCovexVoume(volume);
        }
        _cleanBindData() {
            this._bindDatas.forEach((value) => {
                NavigationUtils.freeLayaData(value);
            });
            this._bindDatas.clear();
        }
        _updateFinalTileMesh(tileIndex) {
            let oritile = this._oriTiles.getNavData(tileIndex);
            var binds = [this._bindDatas.get(tileIndex)];
            var featureCache = this._featureCache.get(tileIndex);
            if (featureCache) {
                for (var i = 0, n = featureCache.length; i < n; i++) {
                    binds.push(featureCache.elements[i].dtNavTileCache);
                }
            }
            this._navMesh._addTile(oritile.x, oritile.y, binds, oritile.boundMin, oritile.boundMax, this._partitionType);
        }
        _buildOneTileMesh() {
            if (this._buildTileList.length <= 0)
                return;
            let tileIndex = this._buildTileList.elements[this._buildTileList.length - 1];
            this._updateFinalTileMesh(tileIndex);
            this._buildTileList.length--;
        }
        _buildAllTileMesh() {
            while (this._buildTileList.length > 0) {
                this._buildOneTileMesh();
            }
        }
        _updata(dt) {
            if (this._needAsyn) {
                this._buildOneTileMesh();
            }
            else {
                this._buildAllTileMesh();
            }
            this.navMesh.crowd.update(dt);
        }
        cleanAllTile() {
            for (var i = 0, n = this._oriTiles.length; i < n; i++) {
                let tile = this._oriTiles.getNavData(i);
                this._navMesh.removeTile(tile.x, tile.y);
            }
        }
        rebuildTile(pos) {
            let index = this._navMesh.navTileGrid.getTileIndexByPos(pos.x, pos.z);
            this._buildTileList.add(index);
            this._buildOneTileMesh();
        }
    }

    class NavModifleBase extends Laya.Component {
        get dtNavTileCache() {
            return this._dtNavTileCache;
        }
        get boundMin() {
            return this._boundMin;
        }
        get boundMax() {
            return this._boundMax;
        }
        set agentType(value) {
            this._agentType = value;
        }
        get agentType() {
            return this._agentType;
        }
        set areaFlag(value) {
            this._areaFlags = value;
            if (this._navManager) {
                let area = this._navManager.getArea(value);
                if (area)
                    this._dtNavTileCache.setFlag(area.flag);
            }
        }
        get areaFlag() {
            return this._areaFlags;
        }
        constructor() {
            super();
            this._boundMin = new Laya.Vector3();
            this._boundMax = new Laya.Vector3();
            this._agentType = NavigationManager.defaltAgentName;
            this._areaFlags = NavigationManager.defaltUnWalk;
            this._boundMax = new Laya.Vector3();
            this._boundMin = new Laya.Vector3();
            this._dtNavTileCache = NavigationUtils.createdtNavTileCache();
        }
        _onWorldMatNeedChange() {
            if (this._surface == null)
                return;
            this._surface.forEach(element => {
                element._removeModifileNavMesh(this);
            });
            this._refeashTranfrom(this.owner.transform.worldMatrix, this._boundMin, this._boundMax);
            this._surface.forEach(element => {
                element._addModifileNavMesh(this);
            });
        }
        _refeashTranfrom(mat, min, max) {
        }
        _onEnable() {
            this._navManager = this.owner.scene.getComponentElementManager("navMesh");
            let area = this._navManager.getArea(this._areaFlags);
            if (area)
                this._dtNavTileCache.setFlag(area.flag);
            this._surface = new Array();
            NavMeshSurface.findNavMeshSurface(this._surface, this.owner, [this._agentType]);
            this._onWorldMatNeedChange();
            this.owner.transform.on(Laya.Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange);
        }
        _onDisable() {
            if (this._surface) {
                this._surface.forEach(element => {
                    element._removeModifileNavMesh(this);
                });
                this._surface = null;
            }
        }
        _onDestroy() {
            NavigationUtils.free(this._dtNavTileCache);
        }
        _cloneTo(dest) {
            dest._agentType = this._agentType;
            dest._areaFlags = this._areaFlags;
            this._boundMax.cloneTo(dest._boundMax);
            this._boundMin.cloneTo(dest._boundMin);
            super._cloneTo(dest);
        }
    }

    exports.NavObstaclesMeshType = void 0;
    (function (NavObstaclesMeshType) {
        NavObstaclesMeshType[NavObstaclesMeshType["BOX"] = 0] = "BOX";
        NavObstaclesMeshType[NavObstaclesMeshType["CAPSULE"] = 1] = "CAPSULE";
        NavObstaclesMeshType[NavObstaclesMeshType["Num"] = 2] = "Num";
    })(exports.NavObstaclesMeshType || (exports.NavObstaclesMeshType = {}));
    let createObstacleData = function (slices, radiusOff = 0, radius = 1) {
        let vertexs = new Float32Array(slices * 6);
        const triCount = (slices - 1) * 4;
        let flags = new Uint8Array(triCount);
        flags.fill(1);
        let ibs = [];
        for (var i = 0; i < slices; i++) {
            if (i >= 1) {
                let index = 2 * i;
                ibs.push(index - 2, index + 1, index);
                ibs.push(index - 1, index + 1, index - 2);
                if (i >= 2) {
                    ibs.push(0, index - 2, index);
                    ibs.push(index - 1, 1, index + 1);
                }
            }
        }
        let endIndex = slices * 2;
        ibs.push(endIndex - 2, 1, 0);
        ibs.push(endIndex - 1, 1, endIndex - 2);
        var sliceAngle = (Math.PI * 2.0) / slices;
        for (var i = 0; i < slices; i++) {
            let triIndex = i * 6;
            vertexs[triIndex] = vertexs[triIndex + 3] = radius * Math.cos(sliceAngle * i + radiusOff);
            vertexs[triIndex + 2] = vertexs[triIndex + 5] = radius * Math.sin(sliceAngle * i + radiusOff);
            vertexs[triIndex + 1] = radius;
            vertexs[triIndex + 4] = -radius;
        }
        let tileData = new NavTileCache();
        tileData.triVertex = vertexs;
        tileData.triIndex = new Uint32Array(ibs);
        tileData.triFlag = flags;
        return tileData;
    };
    class NavMeshObstacles extends NavModifleBase {
        static _init_() {
            this._mapDatas = new Map();
            this._mapDatas.set(exports.NavObstaclesMeshType.BOX, createObstacleData(4, Math.PI / 4, 1 / Math.sqrt(2)));
            this._mapDatas.set(exports.NavObstaclesMeshType.CAPSULE, createObstacleData(16, 0));
            this._defaltMin = new Laya.Vector3(-0.5, -0.5, -0.5);
            this._defaltMax = new Laya.Vector3(0.5, 0.5, 0.5);
        }
        get meshType() {
            return this._meshType;
        }
        set meshType(value) {
            if (this._meshType == value)
                return;
            this._meshType = value;
            this._dtNavTileCache.init(NavMeshObstacles._mapDatas.get(this._meshType).bindData);
            if (this._enabled)
                this._onWorldMatNeedChange();
        }
        get center() {
            return this._center;
        }
        set center(value) {
            value.cloneTo(this._center);
            if (this._enabled)
                this._onWorldMatNeedChange();
        }
        get size() {
            return this._size;
        }
        set size(value) {
            value.cloneTo(this.size);
            if (this._enabled && this._meshType == exports.NavObstaclesMeshType.BOX) {
                this._onWorldMatNeedChange();
            }
        }
        get height() {
            return this._height;
        }
        set height(value) {
            this._height = value;
            if (this._enabled && this._meshType == exports.NavObstaclesMeshType.CAPSULE) {
                this._onWorldMatNeedChange();
            }
        }
        get radius() {
            return this._radius;
        }
        set radius(value) {
            this._radius = value;
            if (this._enabled && this._meshType == exports.NavObstaclesMeshType.CAPSULE) {
                this._onWorldMatNeedChange();
            }
        }
        constructor() {
            super();
            this._meshType = exports.NavObstaclesMeshType.BOX;
            this._center = new Laya.Vector3(0, 0, 0);
            this._size = new Laya.Vector3(1, 1, 1);
            this._height = 1;
            this._radius = 0.5;
            this._localMat = new Laya.Matrix4x4();
        }
        _onEnable() {
            this._navManager = this.owner.scene.getComponentElementManager("navMesh");
            this._dtNavTileCache.init(NavMeshObstacles._mapDatas.get(this._meshType).bindData);
            super._onEnable();
        }
        _refeashTranfrom(mat, min, max) {
            if (this._meshType == exports.NavObstaclesMeshType.BOX) {
                Laya.Matrix4x4.createAffineTransformation(this._center, Laya.Quaternion.DEFAULT, this._size, this._localMat);
            }
            else {
                _tempVec3.setValue(this.radius, this.height, this.radius);
                Laya.Matrix4x4.createAffineTransformation(this._center, Laya.Quaternion.DEFAULT, _tempVec3, this._localMat);
            }
            Laya.Matrix4x4.multiply(mat, this._localMat, this._localMat);
            NavigationUtils.transfromBound(this._localMat, NavMeshObstacles._defaltMin, NavMeshObstacles._defaltMax, min, max);
            this._dtNavTileCache.transfromData(this._localMat.elements);
        }
        _cloneTo(dest) {
            this._center.cloneTo(dest.center);
            dest._meshType = this._meshType;
            this.size.cloneTo(dest.size);
            dest.radius = this.radius;
            dest.height = this.height;
            super._cloneTo(dest);
        }
    }
    const _tempVec3 = new Laya.Vector3();

    class RecastConfig {
        set cellSize(value) {
            this._cellSize = value;
            this._dirtyFlag++;
        }
        get cellSize() {
            return this._cellSize;
        }
        constructor() {
            this._dirtyFlag = 0;
            this._cellSize = 0.2;
            this.cellHeight = 0.3;
            this.agentMaxSlope = 45;
            this.agentHeight = 2;
            this.agentMaxClimb = 0.3;
            this.agentRadius = 0.2;
            this.tileSize = 32;
        }
        clone() {
            let data = new RecastConfig();
            this.cloneTo(data);
            return data;
        }
        cloneTo(destObject) {
            destObject.agentName = this.agentName;
            destObject.cellSize = this.cellSize;
            destObject.cellHeight = this.cellHeight;
            destObject.agentMaxSlope = this.agentMaxSlope;
            destObject.agentHeight = this.agentHeight;
            destObject.agentMaxClimb = this.agentMaxClimb;
            destObject.agentRadius = this.agentRadius;
            destObject.tileSize = this.tileSize;
        }
    }

    class NavAreaFlag {
        get flag() {
            return 1 << this.index;
        }
    }
    class NavigationManager {
        static initialize() {
            return window.Recast().then((Recast) => {
                NavigationUtils.initialize(Recast);
                NavMeshObstacles._init_();
                return Promise.resolve();
            });
        }
        constructor() {
            this._navConfigMap = new Map();
            this._areaFlagMap = new Map();
            this._naveMeshMaps = new Map();
            this._naveMeshLinkMaps = new Map();
            this.name = NavigationManager.managerName;
            this._deflatAllMask = new AreaMask();
            this._init();
        }
        _init() {
            let config = new RecastConfig();
            config.agentName = NavigationManager.defaltAgentName;
            this.regNavConfig(config);
            let area = new NavAreaFlag();
            area.name = NavigationManager.defaltUnWalk;
            area.cost = 1;
            area.index = 0;
            this.regArea(area);
            area = new NavAreaFlag();
            area.name = NavigationManager.defaltWalk;
            area.cost = 1;
            area.index = 1;
            this.regArea(area);
            area = new NavAreaFlag();
            area.name = NavigationManager.defaltJump;
            area.cost = 1;
            area.index = 2;
            this.regArea(area);
            this._deflatAllMask._setAreaMap(this._areaFlagMap);
            this._deflatAllMask.flag = 3;
        }
        _getLinkIdByNavMeshSurfaces(a, b) {
            if (a.id < b.id) {
                return a.id + "_" + b.id;
            }
            else {
                return b.id + "_" + a.id;
            }
        }
        Init(data) {
            if (!data)
                return;
            const agents = data.agents;
            if (agents) {
                for (var i = 0, n = agents.length; i < n; i++) {
                    let agent = agents[i];
                    let config = this.getNavConfig(agent.agentName);
                    if (!config) {
                        config = new RecastConfig();
                        config.agentName = agent.agentName;
                        this.regNavConfig(config);
                    }
                    config.cellSize = agent.cellSize;
                    config.cellHeight = agent.cellHeight;
                    config.agentMaxSlope = agent.agentMaxSlope;
                    config.agentHeight = agent.agentHeight;
                    config.agentRadius = agent.agentRadius;
                    config.agentMaxClimb = agent.agentMaxClimb;
                    config.tileSize = agent.tileSize;
                }
            }
            const areas = data.areas;
            if (areas) {
                for (var i = 0, n = areas.length; i < n; i++) {
                    let area = this.getArea(areas[i].name);
                    if (!area) {
                        area = new NavAreaFlag();
                        area.name = areas[i].name;
                        this.regArea(area);
                    }
                    area.index = areas[i].index;
                    area.cost = areas[i].cost;
                }
                let flag = 0;
                this._areaFlagMap.forEach((value, key) => {
                    flag = flag | value.flag;
                });
                this._deflatAllMask.flag = flag;
            }
        }
        update(dt) {
            let delta = Math.min(dt, 0.3);
            this._naveMeshMaps.forEach((lists) => {
                for (var i = 0, n = lists.length; i < n; i++) {
                    lists.elements[i]._updata(delta);
                }
            });
        }
        regNavConfig(config) {
            this._navConfigMap.set(config.agentName, config);
        }
        getNavConfig(type) {
            return this._navConfigMap.get(type);
        }
        regArea(area) {
            this._areaFlagMap.set(area.name, area);
        }
        getArea(type) {
            return this._areaFlagMap.get(type);
        }
        getAreaFlagMap() {
            return this._areaFlagMap;
        }
        regNavMeshLink(start, end, link) {
            if (start == end)
                return;
            if (start.agentType != end.agentType)
                return;
            let key = this._getLinkIdByNavMeshSurfaces(start, end);
            if (!this._naveMeshLinkMaps.has(key)) {
                this._naveMeshLinkMaps.set(key, Array());
            }
            this._naveMeshLinkMaps.get(key).push(link);
        }
        getNavMeshLink(from, to) {
            let key = this._getLinkIdByNavMeshSurfaces(from, to);
            if (!this._naveMeshLinkMaps.has(key)) {
                return null;
            }
            return this._naveMeshLinkMaps.get(key);
        }
        regNavMeshSurface(nav) {
            if (!nav) {
                console.error("cannot regist empyt NavMeshSurface.");
                return;
            }
            const agentType = nav.agentType;
            let surfaces = this._naveMeshMaps.get(agentType);
            if (surfaces == null) {
                surfaces = new Laya.SingletonList();
                this._naveMeshMaps.set(agentType, surfaces);
            }
            surfaces.add(nav);
        }
        removeNavMeshSurface(nav) {
            if (!nav) {
                console.error("cannot remove empyt NavMeshSurface.");
                return;
            }
            const agentType = nav.agentType;
            let surfaces = this._naveMeshMaps.get(agentType);
            if (surfaces == null) {
                return;
            }
            surfaces.remove(nav);
        }
        getNavMeshSurface(pos, agentType) {
            if (!this._naveMeshMaps.has(agentType))
                return null;
            let surfaces = this._naveMeshMaps.get(agentType);
            for (var i = 0, n = surfaces.length; i < n; i++) {
                if (NavigationUtils.boundContainPoint(surfaces.elements[i].boundMin, surfaces.elements[i].boundMax, pos)) {
                    return surfaces.elements[i];
                }
            }
            return null;
        }
        getNavMeshSurfaces(pos) {
            var surfaces = [];
            this._naveMeshMaps.forEach((datas) => {
                for (var i = 0, n = datas.length; i < n; i++) {
                    if (NavigationUtils.boundContainPoint(datas.elements[i].boundMin, datas.elements[i].boundMax, pos)) {
                        surfaces.push(datas.elements[i]);
                    }
                }
            });
            return surfaces;
        }
    }
    NavigationManager.managerName = "navMesh";
    NavigationManager.defaltAgentName = "humanoid";
    NavigationManager.defaltUnWalk = "unwalk";
    NavigationManager.defaltWalk = "walk";
    NavigationManager.defaltJump = "jump";
    Laya.Scene3D.regManager(NavigationManager.managerName, NavigationManager);
    Laya.Laya.addBeforeInitCallback(NavigationManager.initialize);

    class NavAgentLinkAnim {
        constructor() {
            this._startPos = new Laya.Vector3();
            this._endPos = new Laya.Vector3();
            this._initPos = new Laya.Vector3();
            this._active = false;
        }
        _clearn() {
            this._active = false;
            this._isStart = false;
            this._runTime = 0;
        }
        _setStartPos(value) {
            value.cloneTo(this._startPos);
        }
        _getSartPos() {
            return this._startPos;
        }
        _setEndPos(value) {
            value.cloneTo(this._endPos);
        }
        _getEndPos() {
            return this._endPos;
        }
        _nearerStartPos(value) {
            return Laya.Vector3.distance(this._startPos, value) < 0.2;
        }
        _nearerEndPos(value) {
            return Laya.Vector3.distance(this._endPos, value) < 0.1;
        }
        _start(maxSpeed, postions) {
            this._isStart = true;
            this._runTime = 0;
            this._totalTime = Laya.Vector3.distance(this._startPos, this._endPos) / maxSpeed;
            postions.cloneTo(this._initPos);
        }
        _update(position, dir) {
            if (!this._isStart)
                return;
            this._runTime += Laya.Laya.timer.delta * 0.001;
            const ta = this._totalTime * 0.05;
            if (this._runTime < ta) {
                const t = this._tween(this._runTime, 0, ta);
                Laya.Vector3.lerp(this._initPos, this._startPos, t, position);
            }
            else {
                const t = this._tween(this._runTime, ta, this._totalTime);
                Laya.Vector3.lerp(this._startPos, this._endPos, t, position);
            }
            Laya.Vector3.subtract(this._endPos, this._startPos, dir);
            dir.y = 0;
            Laya.Vector3.normalize(dir, dir);
        }
        _tween(t, t0, t1) {
            let value = (t - t0) / (t1 - t0);
            return Math.max(Math.min(1, value), 0);
        }
    }

    var UpdateFlags;
    (function (UpdateFlags) {
        UpdateFlags[UpdateFlags["DT_CROWD_ANTICIPATE_TURNS"] = 1] = "DT_CROWD_ANTICIPATE_TURNS";
        UpdateFlags[UpdateFlags["DT_CROWD_OBSTACLE_AVOIDANCE"] = 2] = "DT_CROWD_OBSTACLE_AVOIDANCE";
        UpdateFlags[UpdateFlags["DT_CROWD_SEPARATION"] = 4] = "DT_CROWD_SEPARATION";
        UpdateFlags[UpdateFlags["DT_CROWD_OPTIMIZE_VIS"] = 8] = "DT_CROWD_OPTIMIZE_VIS";
        UpdateFlags[UpdateFlags["DT_CROWD_OPTIMIZE_TOPO"] = 16] = "DT_CROWD_OPTIMIZE_TOPO";
    })(UpdateFlags || (UpdateFlags = {}));
    var CrowdAgentState;
    (function (CrowdAgentState) {
        CrowdAgentState[CrowdAgentState["DT_CROWDAGENT_STATE_INVALID"] = 0] = "DT_CROWDAGENT_STATE_INVALID";
        CrowdAgentState[CrowdAgentState["DT_CROWDAGENT_STATE_WALKING"] = 1] = "DT_CROWDAGENT_STATE_WALKING";
        CrowdAgentState[CrowdAgentState["DT_CROWDAGENT_STATE_OFFMESH"] = 2] = "DT_CROWDAGENT_STATE_OFFMESH";
    })(CrowdAgentState || (CrowdAgentState = {}));
    exports.ObstacleAvoidanceType = void 0;
    (function (ObstacleAvoidanceType) {
        ObstacleAvoidanceType[ObstacleAvoidanceType["NoObstacle"] = 0] = "NoObstacle";
        ObstacleAvoidanceType[ObstacleAvoidanceType["LowQuality"] = 1] = "LowQuality";
        ObstacleAvoidanceType[ObstacleAvoidanceType["MedQuality"] = 2] = "MedQuality";
        ObstacleAvoidanceType[ObstacleAvoidanceType["GoodQuality"] = 3] = "GoodQuality";
        ObstacleAvoidanceType[ObstacleAvoidanceType["HighQuality"] = 4] = "HighQuality";
    })(exports.ObstacleAvoidanceType || (exports.ObstacleAvoidanceType = {}));
    class NavAgent extends Laya.Component {
        set radius(value) {
            this._radius = value;
            if (this._crowAgent) {
                let params = this._crowAgent.getparams();
                const radius = this._getradius();
                params.radius = radius;
                params.collisionQueryRange = radius * 12;
                params.pathOptimizationRange = radius * 30;
            }
        }
        get radius() {
            return this._radius;
        }
        set height(value) {
            this._height = value;
            if (this._crowAgent) {
                this._crowAgent.getparams().height = this._getheight();
            }
        }
        get height() {
            return this._height;
        }
        set speed(value) {
            this._speed = value;
            if (this._crowAgent) {
                this._crowAgent.getparams().maxSpeed = this._speed;
            }
        }
        get speed() {
            return this._speed;
        }
        set maxAcceleration(value) {
            this._maxAcceleration = value;
            if (this._crowAgent) {
                this._crowAgent.getparams().maxAcceleration = this._speed;
            }
        }
        get maxAcceleration() {
            return this._maxAcceleration;
        }
        set angularSpeed(value) {
            this._angularSpeed = value;
        }
        get angularSpeed() {
            return this._angularSpeed;
        }
        set baseOffset(value) {
            this._baseOffset = value;
        }
        get baseOffset() {
            return this._baseOffset;
        }
        set quality(value) {
            if (this._quality == value)
                return;
            this._quality = value;
            if (this._crowAgent) {
                let params = this._crowAgent.getparams();
                params.updateFlags = this._getUpdateFlags();
                params.obstacleAvoidanceType = this._quality;
            }
        }
        get quality() {
            return this._quality;
        }
        set priority(value) {
            if (this._priority == value)
                return;
            this._priority = value;
            if (this._crowAgent) {
                let params = this._crowAgent.getparams();
                params.updateFlags = this._getUpdateFlags();
                params.separationWeight = this._priority;
            }
        }
        get priority() {
            return this._priority;
        }
        get isOnNavMesh() {
            return this._crowAgent != null;
        }
        get isOnOffMeshLink() {
            if (!this.isOnNavMesh)
                return false;
            return this._crowAgent.state == CrowdAgentState.DT_CROWDAGENT_STATE_OFFMESH;
        }
        set destination(value) {
            value.cloneTo(this._destination);
            if (!this._navManager)
                return;
            if (this._currentNaveSurface == null || !this._currentNaveSurface.enabled)
                return;
            let targetSurface = this._navManager.getNavMeshSurface(value, this._agentType);
            if (targetSurface == this._currentNaveSurface) {
                this._currentNaveSurface.navMesh.requestMoveTarget(this, this._destination);
                return;
            }
            let linkes = this._navManager.getNavMeshLink(this._currentNaveSurface, targetSurface);
            if (linkes == null)
                return;
            let link = null;
            let distance = Number.MAX_VALUE;
            let isstart;
            linkes.forEach((value) => {
                if (value._startNavSurfaces.indexOf(this._currentNaveSurface) >= 0) {
                    let dis = value._getdistance();
                    if (dis < distance) {
                        dis = distance;
                        link = value;
                        isstart = true;
                    }
                }
                else if (value._endNavSurfaces.indexOf(this._currentNaveSurface) >= 0 && value.bidirectional) {
                    let dis = value._getdistance();
                    if (dis < distance) {
                        dis = distance;
                        link = value;
                        isstart = false;
                    }
                }
            });
            if (link == null) {
                return;
            }
            this._navAgentLinkAnim.targetSurface = targetSurface;
            this._navAgentLinkAnim._active = true;
            if (isstart) {
                this._navAgentLinkAnim._setStartPos(link._start);
                this._navAgentLinkAnim._setEndPos(link._end);
            }
            else {
                this._navAgentLinkAnim._setStartPos(link._end);
                this._navAgentLinkAnim._setEndPos(link._start);
            }
            let refPoint = this._currentNaveSurface.navMesh.findNearestPoly(this._navAgentLinkAnim._getSartPos());
            this._navAgentLinkAnim._getSartPos().fromArray(refPoint.data);
            this._currentNaveSurface.navMesh.requestMoveTarget(this, this._navAgentLinkAnim._getSartPos());
        }
        get destination() {
            return this._destination;
        }
        set agentType(value) {
            if (value == this._agentType)
                return;
            this._agentType = value;
            if (this._crowAgent) {
                this._removeAgent();
                this._addAgent();
            }
        }
        get agentType() {
            return this._agentType;
        }
        set areaMask(value) {
            this._areaMask.flag = value;
        }
        get areaMask() {
            return this._areaMask.flag;
        }
        constructor() {
            super();
            this._agentType = NavigationManager.defaltAgentName;
            this._speed = 3.5;
            this._maxAcceleration = 10;
            this._angularSpeed = 120;
            this._radius = 0.5;
            this._height = 2;
            this._quality = exports.ObstacleAvoidanceType.MedQuality;
            this._priority = 0;
            this._destination = new Laya.Vector3();
            this._baseOffset = 1;
            this._navAgentLinkAnim = new NavAgentLinkAnim();
            this._areaMask = new AreaMask();
            this._curentSpeed = new Laya.Vector3();
        }
        _onEnable() {
            super._onEnable();
            this._fllowPath = [];
            let manager = this._navManager = this.owner.scene.getComponentElementManager(NavigationManager.managerName);
            this._areaMask._setAreaMap(manager.getAreaFlagMap());
            this._addAgent();
        }
        _addAgent() {
            let manager = this._navManager = this.owner.scene.getComponentElementManager(NavigationManager.managerName);
            let pos = this.owner.transform.position;
            let surface = manager.getNavMeshSurface(pos, this._agentType);
            if (surface == null) {
                console.error("not get the NavMeshSurface in this position.");
                return;
            }
            this._currentNaveSurface = surface;
            this._currentNaveSurface.navMesh.addAgent(this);
        }
        _removeAgent() {
            if (this._currentNaveSurface == null || this._agentId == null || this._crowAgent == null)
                return;
            this._currentNaveSurface.navMesh.removeAgent(this);
            this._currentNaveSurface = null;
        }
        _getheight() {
            let scale = this.owner.transform.getWorldLossyScale();
            return this._height * scale.y;
        }
        _getradius() {
            let scale = this.owner.transform.getWorldLossyScale();
            return this._radius * Math.max(scale.x, scale.y);
        }
        _getUpdateFlags() {
            let updateFlags = UpdateFlags.DT_CROWD_ANTICIPATE_TURNS | UpdateFlags.DT_CROWD_OPTIMIZE_VIS | UpdateFlags.DT_CROWD_OPTIMIZE_TOPO;
            if (this._quality > 0) {
                updateFlags |= UpdateFlags.DT_CROWD_OBSTACLE_AVOIDANCE;
            }
            if (this._priority > 0) {
                updateFlags |= UpdateFlags.DT_CROWD_SEPARATION;
            }
            return updateFlags;
        }
        _onDestroy() {
            super._onDestroy();
            this._removeAgent();
        }
        onUpdate() {
            if (this._crowAgent == null && !this._navAgentLinkAnim._active)
                return;
            let transform = this.owner.transform;
            const position = HelpTemp;
            const dir = HelpTemp1;
            if (this._crowAgent) {
                this._crowAgent.getCurPos(position);
                let isNearerStart = false;
                if (this._navAgentLinkAnim._active) {
                    isNearerStart = this._navAgentLinkAnim._nearerStartPos(position);
                }
                this._crowAgent.getCurDir(dir);
                if (isNearerStart) {
                    this._removeAgent();
                    this._navAgentLinkAnim._start(this._speed, position);
                }
                dir.cloneTo(this._curentSpeed);
            }
            else {
                this._navAgentLinkAnim._update(position, dir);
                if (this._navAgentLinkAnim._nearerEndPos(position)) {
                    this._addAgent();
                    this._navAgentLinkAnim._clearn();
                    this.destination = this._destination;
                }
            }
            position.y += this._baseOffset;
            transform.position = position;
            if (Laya.MathUtils3D.isZero(dir.length())) {
                return;
            }
            transform.getUp(HelpTemp2);
            Laya.Vector3.normalize(dir, dir);
            Laya.Quaternion.rotationLookAt(dir, HelpTemp2, TempQuaternion);
            transform.rotation = TempQuaternion;
        }
        isStop() {
            return Laya.MathUtils3D.isZero(this._curentSpeed.length());
        }
        getCurrentPath() {
            if (!this._currentNaveSurface) {
                this._fllowPath.length = 0;
            }
            else {
                this._currentNaveSurface.navMesh.findFllowPath(this, this._fllowPath);
            }
            return this._fllowPath;
        }
        setPosition(pos) {
            this.owner.transform.position = pos;
            if (this.enabled) {
                this._removeAgent();
                this._addAgent();
            }
        }
        findDistanceToWall() {
            if (this._crowAgent) {
                return this._currentNaveSurface.navMesh.findDistanceToWall(this);
            }
            else {
                return null;
            }
        }
        _cloneTo(dest) {
            dest.agentType = this.agentType;
            dest.speed = this._speed;
            dest.angularSpeed = this.angularSpeed;
            dest.radius = this.radius;
            dest.height = this.height;
            dest.areaMask = this.areaMask;
            dest.quality = this.quality;
            dest.priority = this.priority;
            dest.maxAcceleration = this.maxAcceleration;
            super._cloneTo(dest);
        }
    }
    const HelpTemp = new Laya.Vector3();
    const HelpTemp1 = new Laya.Vector3();
    const HelpTemp2 = new Laya.Vector3();
    const TempQuaternion = new Laya.Quaternion();

    const tempVec3 = new Laya.Vector3();
    const tempVec31 = new Laya.Vector3();
    class NavMeshModifierVolume extends Laya.Component {
        get center() {
            return this._center;
        }
        set center(value) {
            value.cloneTo(this._center);
        }
        get size() {
            return this._size;
        }
        set size(value) {
            value.cloneTo(this._size);
        }
        set agentType(value) {
            this._agentType = value;
        }
        get agentType() {
            return this._agentType;
        }
        set areaFlag(value) {
            this._areaFlags = value;
        }
        get areaFlag() {
            return this._areaFlags;
        }
        constructor() {
            super();
            this._transfrom = new Laya.Matrix4x4();
            this._center = new Laya.Vector3();
            this._size = new Laya.Vector3(1, 1, 1);
            this._agentType = NavigationManager.defaltAgentName;
            this._areaFlags = NavigationManager.defaltUnWalk;
            this._datas = new Float32Array(22);
        }
        _onWorldMatNeedChange() {
            Laya.Vector3.scale(this._size, 0.5, tempVec3);
            Laya.Matrix4x4.createAffineTransformation(this._center, Laya.Quaternion.DEFAULT, tempVec3, this._transfrom);
            Laya.Matrix4x4.multiply(this.owner.transform.worldMatrix, this._transfrom, this._transfrom);
            let min = tempVec3;
            let max = tempVec31;
            min.setValue(-1, -1, -1);
            max.setValue(1, 1, 1);
            NavigationUtils.transfromBound(this._transfrom, min, max, min, max);
            this._datas[0] = min.x;
            this._datas[1] = min.y;
            this._datas[2] = min.z;
            this._datas[3] = max.x;
            this._datas[4] = max.y;
            this._datas[5] = max.z;
            this._transfrom.invert(this._transfrom);
            this._datas.set(this._transfrom.elements, 6);
            this._surface.forEach(element => {
                element._updateCovexVoume(this);
            });
        }
        _onEnable() {
            this._surface = new Array();
            NavMeshSurface.findNavMeshSurface(this._surface, this.owner, [this._agentType]);
            this._surface.forEach(element => {
                element._addCovexVoume(this);
            });
            this._onWorldMatNeedChange();
            this.owner.transform.on(Laya.Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange);
        }
        _onDisable() {
            if (this._surface) {
                this._surface.forEach(element => {
                    element._addCovexVoume(this);
                });
                this._surface = null;
            }
        }
        _cloneTo(dest) {
            this._size.cloneTo(dest._size);
            this._center.cloneTo(dest._center);
            dest._agentType = this._agentType;
            dest._areaFlags = this._areaFlags;
            super._cloneTo(dest);
        }
    }

    class NavMeshModifileSurface extends NavModifleBase {
        constructor() {
            super();
        }
        set datas(value) {
            this._oriTiles = new NavTileData(value);
            this._oriNavTileCache = this._oriTiles.getNavData(0);
            this._dtNavTileCache.init(this._oriNavTileCache.bindData);
        }
        get datas() {
            if (!this._oriTiles)
                return null;
            else
                return this._oriTiles._res;
        }
        _refeashTranfrom(mat, min, max) {
            if (this._oriNavTileCache == null)
                return;
            NavigationUtils.transfromBound(mat, this._oriNavTileCache.boundMin, this._oriNavTileCache.boundMax, min, max);
            this._dtNavTileCache.transfromData(mat.elements);
        }
        _onEnable() {
            if (!this.datas)
                return;
            super._onEnable();
        }
        _cloneTo(dest) {
            dest.datas = this._oriTiles._res;
            super._cloneTo(dest);
        }
    }

    class NavMeshLink extends Laya.Component {
        set start(value) {
            value.cloneTo(this._localstart);
        }
        get start() {
            return this._localstart;
        }
        set end(value) {
            value.cloneTo(this._localend);
        }
        get end() {
            return this._localend;
        }
        set width(value) {
            if (value == this._width)
                return;
            this._width = value;
        }
        get width() {
            return this._width;
        }
        set areaFlag(value) {
            this._areaFlag = value;
        }
        get areaFlag() {
            return this._areaFlag;
        }
        set agentType(value) {
            this._agentType = value;
        }
        get agentType() {
            return this._agentType;
        }
        set bidirectional(value) {
            this._bidirectional = value;
        }
        get bidirectional() {
            return this._bidirectional;
        }
        constructor() {
            super();
            this._start = new Laya.Vector3();
            this._end = new Laya.Vector3();
            this._localstart = new Laya.Vector3(-1, 0, 0);
            this._localend = new Laya.Vector3(1, 0, 0);
            this._surfaces = [];
            this._startNavSurfaces = [];
            this._endNavSurfaces = [];
            this._width = 1;
            this._bidirectional = true;
            this._areaFlag = NavigationManager.defaltJump;
            this._agentType = NavigationManager.defaltAgentName;
            this._singleton = false;
        }
        _onWorldMatNeedChange() {
            const mat = this.owner.transform.worldMatrix;
            Laya.Vector3.transformCoordinate(this._localstart, mat, this._start);
            Laya.Vector3.transformCoordinate(this._localend, mat, this._end);
        }
        _onEnable() {
            super._onEnable();
            this._onWorldMatNeedChange();
            let manager = this.owner.scene.getComponentElementManager(NavigationManager.managerName);
            var starts = manager.getNavMeshSurfaces(this._start);
            var ends = manager.getNavMeshSurfaces(this._end);
            for (var i = starts.length - 1; i >= 0; i--) {
                let surface = starts[i];
                let index = ends.indexOf(surface);
                if (index < 0) {
                    continue;
                }
                ends.splice(index, 1);
                starts.splice(i);
                surface._addMeshLink(this);
                this._surfaces.push(surface);
            }
            if (ends.length > 0 && starts.length > 0) {
                starts.forEach((value) => {
                    this._startNavSurfaces.push(value);
                });
                ends.forEach((value) => {
                    this._endNavSurfaces.push(value);
                });
                for (var i = 0, n = starts.length; i < n; i++) {
                    for (var j = 0, k = ends.length; j < k; j++) {
                        manager.regNavMeshLink(starts[i], ends[j], this);
                    }
                }
            }
        }
        _onDestroy() {
            super._onDestroy();
            for (var i = this._surfaces.length - 1; i >= 0; i--) {
                this._surfaces[i]._removeMeshLink(this);
            }
            this._surfaces = null;
        }
        _getdistance() {
            return Laya.Vector3.distance(this.start, this._end);
        }
        _cloneTo(dest) {
            this._localstart.cloneTo(dest._localstart);
            this._localend.cloneTo(dest._localend);
            dest._agentType = this._agentType;
            dest._areaFlag = this.areaFlag;
            dest._bidirectional = this._bidirectional;
            super._cloneTo(dest);
        }
    }

    let c = Laya.ClassUtils.regClass;
    c("NavAgent", NavAgent);
    c("NavigationUtils", NavigationUtils);
    c("NavMeshSurface", NavMeshSurface);
    c("NavigationManager", NavigationManager);
    c("NavMesh", NavMesh);
    c("NavMeshGrid", NavMeshGrid);
    c("RecastConfig", RecastConfig);
    c("NavMeshSurface", NavMeshSurface);
    c("NavMeshModifileSurface", NavMeshModifileSurface);
    c("NavMeshLink", NavMeshLink);
    c("NavMeshObstacles", NavMeshObstacles);
    c("AreaMask", AreaMask);
    c("NavMeshModifierVolume", NavMeshModifierVolume);

    exports.AreaMask = AreaMask;
    exports.NavAgent = NavAgent;
    exports.NavAgentLinkAnim = NavAgentLinkAnim;
    exports.NavAreaFlag = NavAreaFlag;
    exports.NavMesh = NavMesh;
    exports.NavMeshGrid = NavMeshGrid;
    exports.NavMeshLink = NavMeshLink;
    exports.NavMeshModifierVolume = NavMeshModifierVolume;
    exports.NavMeshModifileSurface = NavMeshModifileSurface;
    exports.NavMeshObstacles = NavMeshObstacles;
    exports.NavMeshSurface = NavMeshSurface;
    exports.NavModifleBase = NavModifleBase;
    exports.NavTileCache = NavTileCache;
    exports.NavTileData = NavTileData;
    exports.NavigationManager = NavigationManager;
    exports.NavigationPathData = NavigationPathData;
    exports.NavigationUtils = NavigationUtils;
    exports.RecastConfig = RecastConfig;
    exports.TitleConfig = TitleConfig;

})(window.Laya = window.Laya || {}, Laya);
//# sourceMappingURL=laya.navMesh.js.map
