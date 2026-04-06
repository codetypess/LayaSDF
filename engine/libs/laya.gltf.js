(function (exports, Laya) {
    'use strict';

    var glTFMetallicRoughnessGLSL = "#if !defined(glTFMetallicRoughness_lib)\n    #define glTFMetallicRoughness_lib\n\n    #include \"ShadingFrag.glsl\";\n\n    #include \"PBRFrag.glsl\";\n\nstruct SurfaceInputs {\n    vec3 diffuseColor;\n    float alpha;\n    float alphaTest;\n    float metallic;\n    float roughness;\n    float occlusion;\n    vec3 emissionColor;\n    vec3 normalTS;\n    float specular;\n\n    // specular\n    float specularFactor;\n    vec3 specularColor;\n\n    #ifdef CLEARCOAT\n    float clearCoat;\n    float clearCoatRoughness;\n\t#ifdef CLEARCOAT_NORMAL\n    vec3 clearCoatNormalTS;\n\t#endif // CLEARCOAT_NORMAL\n    #endif // CLEARCOAT\n\n    #ifdef ANISOTROPIC\n    float anisotropy;\n    vec2 anisotropyDirection;\n    #endif // ANISOTROPIC\n\n    #ifdef IOR\n    float ior;\n    #endif // IOR\n\n    #ifdef IRIDESCENCE\n    float iridescence;\n    float iridescenceIor;\n    float iridescenceThickness;\n    #endif // IRIDESCENCE\n\n    #ifdef SHEEN\n    vec3 sheenColor;\n    float sheenRoughness;\n    #endif // SHEEN\n\n    #ifdef TRANSMISSION\n    float transmission;\n    #endif // TRANSMISSION\n\n    #ifdef THICKNESS\n    float thickness;\n    vec3 attenuationColor;\n    float attenuationDistance;\n    #endif // THICKNESS\n};\n\nvoid initSurface(inout Surface surface, const in SurfaceInputs inputs, const in PixelParams pixel)\n{\n    surface.alpha = inputs.alpha;\n\n    surface.normalTS = inputs.normalTS;\n\n    vec3 baseColor = inputs.diffuseColor;\n    float metallic = inputs.metallic;\n    float perceptualRoughness = inputs.roughness;\n\n    #ifdef IOR\n    float ior = inputs.ior;\n    surface.ior = ior;\n    vec3 f0 = vec3(dielectricIorToF0(ior));\n    #else // IOR\n    vec3 f0 = vec3(dielectricSpecularToF0(inputs.specular));\n    surface.ior = dielectricF0ToIor(f0.x);\n    #endif // IOR\n\n    // KHR_materials_specular\n    f0 *= inputs.specularFactor * inputs.specularColor;\n\n    surface.perceptualRoughness = max(perceptualRoughness, MIN_PERCEPTUAL_ROUGHNESS);\n    surface.roughness = surface.perceptualRoughness * surface.perceptualRoughness;\n    surface.diffuseColor = computeDiffuse(baseColor, metallic);\n    surface.f0 = computeF0(f0, baseColor, metallic);\n    surface.f90 = computeF90(surface.f0);\n\n    surface.occlusion = inputs.occlusion;\n\n    #ifdef EMISSION\n    surface.emissionColor = inputs.emissionColor;\n    #endif // EMISSION\n\n    #ifdef IRIDESCENCE\n    surface.iridescence = inputs.iridescence;\n    surface.iridescenceIor = inputs.iridescenceIor;\n    surface.iridescenceThickness = inputs.iridescenceThickness;\n    #endif // IRIDESCENCE\n\n    #ifdef SHEEN\n    surface.sheenColor = inputs.sheenColor;\n    surface.sheenPerceptualRoughness = max(inputs.sheenRoughness, MIN_PERCEPTUAL_ROUGHNESS);\n    surface.sheenRoughness = pow2(surface.sheenPerceptualRoughness);\n    #endif // SHEEN\n\n    #ifdef CLEARCOAT\n    surface.clearCoat = inputs.clearCoat;\n    surface.clearCoatPerceptualRoughness = clamp(inputs.clearCoatRoughness, MIN_PERCEPTUAL_ROUGHNESS, 1.0);\n    surface.clearCoatRoughness = surface.clearCoatPerceptualRoughness * surface.clearCoatPerceptualRoughness;\n\t#ifdef CLEARCOAT_NORMAL\n    surface.clearCoatNormalTS = inputs.clearCoatNormalTS;\n\t#endif // CLEARCOAT_NORMAL\n    #endif // CLEARCOAT\n\n    #ifdef ANISOTROPIC\n    surface.anisotropy = inputs.anisotropy;\n    surface.anisotropyDirection = inputs.anisotropyDirection;\n    #endif // ANISOTROPIC\n\n    #ifdef TRANSMISSION\n    surface.transmission = inputs.transmission;\n    #endif // TRANSMISSION\n\n    #ifdef THICKNESS\n    surface.thickness = inputs.thickness;\n    surface.attenuationColor = inputs.attenuationColor;\n    surface.attenuationDistance = inputs.attenuationDistance;\n    #endif // THICKNESS\n}\n\nvec4 glTFMetallicRoughness(const in SurfaceInputs inputs, in PixelParams pixel)\n{\n    #ifdef ALPHATEST\n    if (inputs.alpha < inputs.alphaTest)\n\t{\n\t    discard;\n\t}\n    #endif // ALPHATEST\n\n    Surface surface;\n    initSurface(surface, inputs, pixel);\n\n    PixelInfo info;\n    getPixelInfo(info, pixel, surface);\n\n    vec3 surfaceColor = vec3(0.0);\n    surfaceColor += PBRLighting(surface, info);\n\n    return vec4(surfaceColor, surface.alpha);\n}\n\n#endif // glTFMetallicRoughness_lib";

    var glTFPBRVS = "#define SHADER_NAME glTFPBRVS\n\n#include \"Math.glsl\";\n\n#include \"Scene.glsl\";\n#include \"SceneFogInput.glsl\";\n\n#include \"Camera.glsl\";\n#include \"Sprite3DVertex.glsl\";\n\n#include \"VertexCommon.glsl\";\n\n#include \"PBRVertex.glsl\";\n\nvoid main()\n{\n    Vertex vertex;\n    getVertexParams(vertex);\n\n    PixelParams pixel;\n    initPixelParams(pixel, vertex);\n\n    gl_Position = getPositionCS(pixel.positionWS);\n\n    gl_Position = remapPositionZ(gl_Position);\n\n#ifdef FOG\n    FogHandle(gl_Position.z);\n#endif\n}";

    var glTFPBRFS = "#define SHADER_NAME glTFPBRFS\n\n#include \"Color.glsl\";\n\n#include \"Scene.glsl\";\n#include \"SceneFog.glsl\";\n\n#include \"Camera.glsl\";\n#include \"Sprite3DFrag.glsl\";\n\n#include \"glTFMetallicRoughness.glsl\";\n\nvoid initSurfaceInputs(inout SurfaceInputs inputs, const in PixelParams pixel)\n{\n    vec2 uv = vec2(0.0);\n#ifdef UV\n    uv = pixel.uv0;\n#endif //\n\n    // render state\n    inputs.alphaTest = u_AlphaTestValue;\n\n    // surface\n    inputs.diffuseColor = u_BaseColorFactor.xyz;\n    inputs.alpha = u_BaseColorFactor.w;\n\n#ifdef COLOR\n    #ifdef ENABLEVERTEXCOLOR\n    inputs.diffuseColor *= pixel.vertexColor.xyz;\n    inputs.alpha *= pixel.vertexColor.a;\n    #endif // ENABLEVERTEXCOLOR\n#endif // COLOR\n\n#ifdef BASECOLORMAP\n    vec2 baseColorUV = uv;\n    #ifdef BASECOLORMAP_TRANSFORM\n    baseColorUV = (u_BaseColorMapTransform * vec3(baseColorUV, 1.0)).xy;\n    #endif // BASECOLORMAP_TRANSFORM\n    vec4 baseColorSampler = texture2D(u_BaseColorTexture, baseColorUV);\n    #ifdef Gamma_u_BaseColorTexture\n    baseColorSampler = gammaToLinear(baseColorSampler);\n    #endif // u_BaseColorTexture_Gamma\n    inputs.diffuseColor *= baseColorSampler.rgb;\n    inputs.alpha *= baseColorSampler.a;\n#endif // BASECOLORMAP\n\n    inputs.specular = u_Specular;\n\n    inputs.specularFactor = 1.0;\n    inputs.specularColor = vec3(1.0);\n\n    inputs.specularFactor = u_SpecularFactor;\n#ifdef SPECULARFACTORMAP\n    vec2 specularFactorUV = uv;\n    #ifdef SPECULARFACTORMAP_TRANSFORM\n    specularFactorUV = (u_SpecularFactorMapTransfrom * specularFactorUV).xy;\n    #endif // SPECULARFACTORMAP_TRANSFORM\n    vec4 specularFactorSampler = texture2D(u_SpecularFactorTexture, specularFactorUV);\n    inputs.specularFactor *= specularFactorSampler.a;\n#endif // SPECULARFACTORMAP\n\n    inputs.specularColor = u_SpecularColorFactor;\n#ifdef SPECULARCOLORMAP\n    vec2 specularColorUV = uv;\n    #ifdef SPECULARFACTORMAP_TRANSFORM\n    specularColorUV = (u_SpecularColorMapTransform * specularColorUV).xy;\n    #endif // SPECULARFACTORMAP_TRANSFORM\n    vec4 specularColorSampler = texture2D(u_SpecularColorTexture, specularColorUV);\n    #ifdef Gamma_u_SpecularColorTexture\n    specularColorSampler = gammaToLinear(specularColorSampler);\n    #endif // Gamma_u_SpecularColorTexture\n    inputs.specularColor *= specularColorSampler.rgb;\n#endif // SPECULARCOLORMAP\n\n    inputs.metallic = u_MetallicFactor;\n    float roughness = u_RoughnessFactor;\n#ifdef METALLICROUGHNESSMAP\n    vec2 metallicUV = uv;\n    #ifdef METALLICROUGHNESSMAP_TRANSFORM\n    metallicUV = (u_MetallicRoughnessMapTransform * vec3(metallicUV, 1.0)).xy;\n    #endif METALLICROUGHNESSMAP_TRANSFORM\n    vec4 metallicRoughnessSampler = texture2D(u_MetallicRoughnessTexture, metallicUV);\n    inputs.metallic *= metallicRoughnessSampler.b;\n    roughness *= metallicRoughnessSampler.g;\n#endif // METALLICROUGHNESSMAP\n    inputs.roughness = roughness;\n\n    float occlusion = 1.0;\n#ifdef OCCLUSIONMAP\n    vec2 occlusionUV = uv;\n    #ifdef OCCLUSIONMAP_TRANSFORM\n    occlusionUV = (u_OcclusionMapTransform * vec3(occlusionUV, 1.0)).xy;\n    #endif // OCCLUSIONMAP_TRANSFORM\n    vec4 occlusionSampler = texture2D(u_OcclusionTexture, occlusionUV);\n    #ifdef Gamma_u_OcclusionTexture\n    occlusionSampler = gammaToLinear(occlusionSampler);\n    #endif // Gamma_u_OcclusionTexture\n    occlusion = occlusionSampler.r;\n#endif // OCCLUSIONMAP\n    inputs.occlusion = (1.0 - u_OcclusionStrength) + occlusion * u_OcclusionStrength;\n\n    inputs.emissionColor = u_EmissionFactor * u_EmissionStrength;\n#ifdef EMISSIONMAP\n    vec2 emissionUV = uv;\n    #ifdef EMISSIONMAP_TRANSFORM\n    emissionUV = (u_EmissionMapTransform * vec3(emissionUV, 1.0)).xy;\n    #endif // EMISSIONMAP_TRANSFORM\n    vec4 emissionSampler = texture2D(u_EmissionTexture, emissionUV);\n    #ifdef Gamma_u_EmissionTexture\n    emissionSampler = gammaToLinear(emissionSampler);\n    #endif // Gamma_u_EmissionTexture\n    inputs.emissionColor *= emissionSampler.rgb;\n#endif // EMISSIONMAP\n\n    inputs.normalTS = vec3(0.0, 0.0, 1.0);\n#ifdef NORMALMAP\n    vec2 normalUV = uv;\n    #ifdef NORMALMAP_TRANSFORM\n    normalUV = (u_NormalMapTransform * vec3(normalUV, 1.0)).xy;\n    #endif // NORMALMAP_TRANSFORM\n    vec3 normalSampler = texture2D(u_NormalTexture, normalUV).xyz;\n    normalSampler = normalize(normalSampler * 2.0 - 1.0);\n    normalSampler.y *= -1.0;\n    inputs.normalTS = normalScale(normalSampler, u_NormalScale);\n#endif // NORMALMAP\n\n#ifdef IOR\n    inputs.ior = u_Ior;\n#endif // IOR\n\n#ifdef IRIDESCENCE\n    float iridescenceFactor = u_IridescenceFactor;\n    #ifdef IRIDESCENCEMAP\n    vec2 iridescenceUV = uv;\n\t#ifdef IRIDESCENCEMAP_TRANSFORM\n    iridescenceUV = (u_IridescenceMapTransform * vec3(iridescenceUV, 1.0)).xy;\n\t#endif // IRIDESCENCEMAP_TRANSFORM\n    vec4 iridescenceSampler = texture2D(u_IridescenceTexture, iridescenceUV);\n    iridescenceFactor *= iridescenceSampler.r;\n    #endif // IRIDESCENCEMAP\n    float iridescenceThickness = u_IridescenceThicknessMaximum;\n    #ifdef IRIDESCENCE_THICKNESSMAP\n    vec2 iridescenceThicknessUV = uv;\n\t#ifdef IRIDESCENCE_THICKNESSMAP_TRANSFORM\n    iridescenceThicknessUV = (u_IridescenceThicknessMapTransform, vec3(iridescenceThicknessUV, 1.0)).xy;\n\t#endif // IRIDESCENCE_THICKNESSMAP_TRANSFORM\n    vec4 iridescenceThicknessSampler = texture2D(u_IridescenceThicknessTexture, iridescenceThicknessUV);\n    iridescenceThickness = mix(u_IridescenceThicknessMinimum, u_IridescenceThicknessMaximum, iridescenceThicknessSampler.g);\n    #endif // IRIDESCENCE_THICKNESSMAP\n    inputs.iridescence = iridescenceFactor;\n    inputs.iridescenceIor = u_IridescenceIor;\n    inputs.iridescenceThickness = iridescenceThickness;\n#endif // IRIDESCENCE\n\n#ifdef SHEEN\n    vec3 sheenColor = u_SheenColorFactor;\n    #ifdef SHEENCOLORMAP\n    vec2 sheenColorUV = uv;\n\t#ifdef SHEENCOLORMAP_TRANSFORM\n    sheenColorUV = (u_SheenColorMapTransform * vec3(sheenColorUV, 1.0)).xy;\n\t#endif // SHEENCOLORMAP_TRANSFORM\n    vec4 sheenColorSampler = texture2D(u_SheenColorTexture, sheenColorUV);\n\t#ifdef Gamma_u_SheenColorFactor\n    sheenColorSampler = gammaToLinear(sheenColorSampler);\n\t#endif // Gamma_u_SheenColorFactor\n    sheenColor *= sheenColorSampler.rgb;\n    #endif // SHEENCOLORMAP\n\n    float sheenRoughness = u_SheenRoughness;\n    #ifdef SHEEN_ROUGHNESSMAP\n    vec2 sheenRoughnessUV = uv;\n\t#ifdef SHEEN_ROUGHNESSMAP_TRANSFORM\n    sheenRoughnessUV = (u_SheenRoughnessMapTransform * vec3(sheenRoughnessUV, 1.0)).xy;\n\t#endif // SHEEN_ROUGHNESSMAP_TRANSFORM\n    vec4 sheenRoughnessSampler = texture2D(u_SheenRoughnessTexture, sheenRoughnessUV);\n    sheenRoughness *= sheenRoughnessSampler.a;\n    #endif // SHEEN_ROUGHNESSMAP\n\n    inputs.sheenColor = sheenColor;\n    inputs.sheenRoughness = sheenRoughness;\n#endif // SHEEN\n\n#ifdef CLEARCOAT\n    inputs.clearCoat = u_ClearCoatFactor;\n    inputs.clearCoatRoughness = u_ClearCoatRoughness;\n\n    #ifdef CLEARCOATMAP\n    vec2 clearCoatUV = uv;\n\t#ifdef CLEARCOATMAP_TRANSFORM\n    clearCoatUV = (u_ClearCoatMapTransform * vec3(clearCoatUV, 1.0)).xy;\n\t#endif // CLEARCOATMAP_TRANSFORM\n    vec4 clearCoatSampler = texture2D(u_ClearCoatTexture, clearCoatUV);\n    inputs.clearCoat *= clearCoatSampler.r;\n    #endif // CLEARCOATMAP\n\n    #ifdef CLEARCOAT_ROUGHNESSMAP\n    vec2 clearCoatRoughnessUV = uv;\n\t#ifdef CLEARCOAT_ROUGHNESSMAP_TRANSFORM\n    clearCoatRoughnessUV = (u_ClearCoatRoughnessMapTransform * vec3(uv, 1.0)).xy;\n\t#endif // CLEARCOAT_ROUGHNESSMAP_TRANSFORM\n    vec4 clearcoatSampleRoughness = texture2D(u_ClearCoatRoughnessTexture, clearCoatRoughnessUV);\n    inputs.clearCoatRoughness *= clearcoatSampleRoughness.g;\n    #endif // CLEARCOAT_ROUGHNESSMAP\n\n    #ifdef CLEARCOAT_NORMAL\n    vec2 clearCoatNormalUV = uv;\n\t#ifdef CLEARCOAT_NORMALMAP_TRANSFORM\n    clearCoatNormalUV = (u_ClearCoatNormalMapTransform * vec3(clearCoatNormalUV, 1.0)).xy;\n\t#endif // CLEARCOAT_NORMALMAP_TRANSFORM\n    vec3 clearCoatNormalSampler = texture2D(u_ClearCoatNormalTexture, clearCoatNormalUV).rgb;\n    clearCoatNormalSampler = normalize(clearCoatNormalSampler * 2.0 - 1.0);\n    clearCoatNormalSampler.y *= -1.0;\n    // todo scale\n    inputs.clearCoatNormalTS = normalScale(clearCoatNormalSampler, u_ClearCoatNormalScale);\n    #endif // CLEARCOAT_NORMAL\n#endif // CLEARCOAT\n\n#ifdef ANISOTROPIC\n    inputs.anisotropy = u_AnisotropyStrength;\n    vec2 direction = vec2(1.0, 0.0);\n\n    #ifdef ANISOTROPYMAP\n    vec2 anisotropyUV = uv;\n\t#ifdef ANISOTROPYMAP_TRANSFORM\n    anisotropyUV = (u_AnisotropyMapTransform * vec3(anisotropyUV, 1.0)).xy;\n\t#endif // ANISOTROPYMAP_TRANSFORM\n    vec3 anisotropySampler = texture2D(u_AnisotropyTexture, anisotropyUV).rgb;\n\n    inputs.anisotropy *= anisotropySampler.b;\n    direction = anisotropySampler.xy * 2.0 - 1.0;\n    #endif // ANISOTROPYMAP\n\n    vec2 anisotropyRotation = vec2(cos(u_AnisotropyRotation), sin(u_AnisotropyRotation));\n    mat2 rotationMatrix = mat2(anisotropyRotation.x, anisotropyRotation.y, -anisotropyRotation.y, anisotropyRotation.x);\n    inputs.anisotropyDirection = rotationMatrix * direction;\n\n#endif // ANISOTROPIC\n\n#ifdef TRANSMISSION\n    float transmission = u_TransmissionFactor;\n    #ifdef TRANSMISSIONMAP\n    vec2 transmissionUV = uv;\n\t#ifdef TRANSMISSIONMAP_TRANSFORM\n    transmissionUV = (u_TransmissionMapTransform * vec3(transmissionUV, 1.0)).xy;\n\t#endif // TRANSMISSIONMAP_TRANSFORM\n    vec4 transmissionSampler = texture2D(u_TransmissionTexture, transmissionUV);\n    transmission *= transmissionSampler.r;\n    #endif // TRANSMISSIONMAP\n    inputs.transmission = transmission;\n#endif // TRANSMISSION\n\n#ifdef THICKNESS\n\n    float thicknessFactor = u_VolumeThicknessFactor;\n    float attenuationDistance = u_VolumeAttenuationDistance;\n    vec3 attenuationColor = u_VolumeAttenuationColor.xyz;\n\n    #ifdef THICKNESSMAP\n    vec2 thicknessUV = uv;\n\t#ifdef THICKNESSMAP_TRANSFORM\n    thicknessUV = (u_VoluemThicknessMapTransform * vec3(thicknessUV, 1.0)).xy;\n\t#endif // THICKNESSMAP_TRANSFORM\n    vec4 thicknessSampler = texture2D(u_VolumeThicknessTexture, thicknessUV);\n    thicknessFactor *= thicknessSampler.g;\n    #endif // THICKNESSMAP\n\n    inputs.thickness = thicknessFactor;\n    inputs.attenuationColor = attenuationColor;\n    inputs.attenuationDistance = attenuationDistance;\n\n#endif // THICKNESS\n}\n\nvoid main()\n{\n\n#ifndef DEBUG\n    PixelParams pixel;\n    getPixelParams(pixel);\n\n    SurfaceInputs inputs;\n    initSurfaceInputs(inputs, pixel);\n\n    vec4 surfaceColor = glTFMetallicRoughness(inputs, pixel);\n\n    #ifdef FOG\n    surfaceColor.rgb = sceneLitFog(surfaceColor.rgb);\n    #endif // FOG\n\n    gl_FragColor = surfaceColor;\n\n#else DEBUG\n    // // debug\n    PixelParams pixel;\n    getPixelParams(pixel);\n\n    SurfaceInputs inputs;\n    initSurfaceInputs(inputs, pixel);\n\n    Surface surface;\n    initSurface(surface, inputs, pixel);\n\n    PixelInfo info;\n    getPixelInfo(info, pixel, surface);\n\n    vec3 debug = vec3(0.0);\n\n    #ifdef Debug_ShadingNormal\n    debug = vec3(info.normalWS * 0.5 + 0.5);\n    #endif // Debug_ShadingNormal\n\n    #ifdef Debug_GeometryNormal\n    debug = vec3(info.vertexNormalWS * 0.5 + 0.5);\n    #endif // Debug_GeometryNormal\n\n    #ifdef Debug_GeometryTangent\n    debug = vec3(pixel.tangentWS * 0.5 + 0.5);\n    #endif // Debug_GeometryTangent\n\n    #ifdef Debug_GeometryBiTangent\n    debug = vec3(pixel.biNormalWS * 0.5 + 0.5);\n    #endif // Debug_GeometryBiTangent\n\n    #ifdef Debug_Roughness\n    debug = vec3(surface.perceptualRoughness);\n    #endif // Debug_Roughness\n\n    #ifdef Debug_Alpha\n    debug = vec3(surface.alpha);\n    #endif // Debug_Alpha\n\n    #ifdef Debug_Occlusion\n    debug = vec3(surface.occlusion);\n    #endif // Debug_Occlusion\n\n    #ifdef Debug_BaseColor\n    debug = surface.diffuseColor;\n    #endif // Debug_BaseColor\n\n    #ifdef Debug_Metallic\n    debug = vec3(inputs.metallic);\n    #endif // Debug_Metallic\n\n    #ifdef THICKNESS\n\t#ifdef Debug_VolumeThickness\n    debug = vec3(surface.thickness);\n\t#endif // Debug_VolumeThickness\n\n\t#ifdef Debug_Attenuation\n    {\n\tvec3 scaleLength = vec3(0.0);\n\tscaleLength.x = length(vec3(u_WorldMat[0].xyz));\n\tscaleLength.y = length(vec3(u_WorldMat[1].xyz));\n\tscaleLength.z = length(vec3(u_WorldMat[2].xyz));\n\n\tvec3 n = info.normalWS;\n\tvec3 r = -info.viewDir;\n\tfloat airIor = 1.0;\n\n\tfloat ior = surface.ior;\n\tfloat etaIR = airIor / ior;\n\tfloat etaRI = ior / airIor;\n\tvec3 refractionVector = normalize(refract(r, n, etaIR)) * surface.thickness * scaleLength;\n\n\tvec3 absorption = -log((surface.attenuationColor)) / (surface.attenuationDistance);\n\tdebug = exp(-absorption);\n    }\n\t#endif // Debug_Attenuation\n\n    #endif // THICKNESS\n\n    #ifdef TRANSMISSION\n\t#ifdef Debug_Transmission\n    vec3 E = getE(surface, info);\n    debug = transmissionIBL(surface, info, E);\n\t#endif // Debug_Transmission\n    #endif // TRANSMISSION\n\n    #ifdef Debug_IOR\n    debug = vec3(surface.ior - 1.0);\n    #endif // Debug_IOR\n\n    #ifdef Debug_SpecularFactor\n    debug = vec3(inputs.specularFactor);\n    #endif // Debug_SpecularFactor\n\n    #ifdef Debug_SpecularColor\n    debug = vec3(inputs.specularColor);\n    #endif // DebugSpecularColor\n\n    #ifdef Debug_f0\n    debug = vec3(surface.f0);\n    #endif // Debug_f0\n\n    #ifdef Debug_f90\n    debug = vec3(surface.f90);\n    #endif // Debug_f90\n\n    #ifdef Debug_FrontFace\n    if (gl_FrontFacing)\n\t{\n\t    debug = vec3(1.0, 0.0, 0.0);\n\t}\n    else\n\t{\n\t    debug = vec3(0.0, 1.0, 0.0);\n\t}\n    #endif // Debug_FrontFace\n\n    #ifdef Debug_SpecularAO\n    float specularAO = saturate(pow(info.NoV + surface.occlusion, exp2(-16.0 * surface.roughness - 1.0)) - 1.0 + surface.occlusion);\n\n    float diffAO = specularAO - surface.occlusion;\n\n    debug = vec3(abs(diffAO));\n\n    if (diffAO < 0.0)\n\t{\n\t    debug *= vec3(1.0, 0.0, 0.0);\n\t}\n    else\n\t{\n\t    debug *= vec3(0.0, 1.0, 0.0);\n\t}\n    #endif // Debug_SpecularAO\n\n    // // #ifdef CLEARCOAT\n    // //     // debug = vec3(info.iridescenceFresnel);\n    // //     #ifdef CLEARCOAT_NORMAL\n    // //     debug = vec3(surface.clearCoatNormalTS * 0.5 + 0.5);\n    // //     #endif // CLEARCOAT_NORMAL\n    // //     // debug = vec3(surface.clearCoatRoughness);\n    // //     // debug = vec3(surface.clearCoat);\n    // // #endif // CLEARCOAT\n\n    // debug = vec3(info.normalWS * 0.5 + 0.5);\n\n    // // #ifdef SHEEN\n    // //     // debug = vec3(inputs.sheenColor);\n    // //     // debug = vec3(inputs.sheenRoughness);\n    // //     debug = vec3(info.sheenScaling);\n    // // #endif // SHEEN\n\n    // // #ifdef IRIDESCENCE\n    // //     // debug = vec3(surface.iridescenceIor - 1.0);\n    // //     // debug = vec3(surface.iridescenceThickness / 1200.0);\n    // //     debug = vec3(info.iridescenceFresnel);\n    // // #endif // IRIDESCENCE\n\n    // // #ifdef TRANSMISSION\n    // //     debug = vec3(surface.transmission);\n    // // #endif // TRANSMISSION\n\n    debug = gammaToLinear(debug);\n    gl_FragColor = vec4(debug, 1.0);\n\n#endif // DEBUG\n}";

    var DepthVS = "#define SHADER_NAME glTFDepthVS\n\n#include \"DepthVertex.glsl\";\n\nvoid main()\n{\n    Vertex vertex;\n    getVertexParams(vertex);\n\n    mat4 worldMat = getWorldMatrix();\n    vec4 pos = (worldMat * vec4(vertex.positionOS, 1.0));\n    vec3 positionWS = pos.xyz / pos.w;\n\n    mat4 normalMat = transpose(inverse(worldMat));\n    vec3 normalWS = normalize((normalMat * vec4(vertex.normalOS, 0.0)).xyz);\n\n    vec4 positionCS = DepthPositionCS(positionWS, normalWS);\n    gl_Position = remapPositionZ(positionCS);\n}";

    var DephtFS = "#define SHADER_NAME glTFDepthFS\n\n#include \"DepthFrag.glsl\";\n\nvoid main()\n{\n    gl_FragColor = getDepthColor();\n}";

    var DepthNormalVS = "#define SHADER_NAME glTFPBRDepthNormalVS\n\n#include \"Math.glsl\";\n\n#include \"Camera.glsl\";\n\n#include \"Sprite3DVertex.glsl\";\n\n#include \"VertexCommon.glsl\";\n\n#include \"PBRVertex.glsl\";\n\nvarying vec4 v_PositionCS;\n\nvoid main()\n{\n    Vertex vertex;\n    getVertexParams(vertex);\n\n    PixelParams pixel;\n    initPixelParams(pixel, vertex);\n\n    sharePixelParams(pixel);\n\n    vec4 positionCS = getPositionCS(pixel.positionWS);\n    v_PositionCS = positionCS;\n    gl_Position = positionCS;\n    gl_Position = remapPositionZ(gl_Position);\n}";

    var DepthNormalFS = "#define SHADER_NAME glTFPBRDepthNormalFS\n\n#include \"Color.glsl\";\n\n#include \"Scene.glsl\";\n#include \"SceneFog.glsl\";\n\n#include \"Camera.glsl\";\n#include \"Sprite3DFrag.glsl\";\n\n#include \"ShadingFrag.glsl\";\n\n#include \"DepthNormalFrag.glsl\";\n\nvarying vec4 v_PositionCS;\n\nvoid main()\n{\n    PixelParams pixel;\n    getPixelParams(pixel);\n\n    vec3 normalWS = pixel.normalWS;\n\n#ifdef NORMALMAP\n    #ifdef UV\n\n    vec2 uv = pixel.uv0;\n\n    vec3 normalSampler = texture2D(u_NormalTexture, uv).xyz;\n    normalSampler = normalize(normalSampler * 2.0 - 1.0);\n    normalSampler.y *= -1.0;\n    vec3 normalTS = normalScale(normalSampler, u_NormalScale);\n    normalWS = normalize(pixel.TBN * normalTS);\n\n    #endif UV\n#endif // NORMALMAP\n\n    vec4 positionCS = v_PositionCS;\n\n    vec4 dephtNormal = encodeDepthNormal(positionCS, normalWS);\n\n    gl_FragColor = dephtNormal;\n}";

    class glTFShader {
        static init() {
            this.Define_BaseColorMap = Laya.Shader3D.getDefineByName("BASECOLORMAP");
            this.Define_BaseColorMapTransform = Laya.Shader3D.getDefineByName("BASECOLORMAP_TRANSFORM");
            this.Define_MetallicRoughnessMap = Laya.Shader3D.getDefineByName("METALLICROUGHNESSMAP");
            this.Define_MetallicRoughnessMapTransform = Laya.Shader3D.getDefineByName("METALLICROUGHNESSMAP_TRANSFORM");
            this.Define_NormalMap = Laya.Shader3D.getDefineByName("NORMALMAP");
            this.Define_NormalMapTransform = Laya.Shader3D.getDefineByName("NORMALMAP_TRANSFORM");
            this.Define_OcclusionMap = Laya.Shader3D.getDefineByName("OCCLUSIONMAP");
            this.Define_OcclusionMapTransform = Laya.Shader3D.getDefineByName("OCCLUSIONMAP_TRANSFORM");
            this.Define_EmissionMap = Laya.Shader3D.getDefineByName("EMISSIONMAP");
            this.Define_EmissionMapTransform = Laya.Shader3D.getDefineByName("EMISSIONMAP_TRANSFORM");
            this.Define_ClearCoatMap = Laya.Shader3D.getDefineByName("CLEARCOATMAP");
            this.Define_ClearCoatMapTransform = Laya.Shader3D.getDefineByName("CLEARCOATMAP_TRANSFORM");
            this.Define_ClearCoatRoughnessMap = Laya.Shader3D.getDefineByName("CLEARCOAT_ROUGHNESSMAP");
            this.Define_ClearCoatRoughnessMapTransform = Laya.Shader3D.getDefineByName("CLEARCOAT_ROUGHNESSMAP_TRANSFORM");
            this.Define_ClearCoatNormalMapTransform = Laya.Shader3D.getDefineByName("CLEARCOAT_NORMALMAP_TRANSFORM");
            this.Define_AnisotropyMap = Laya.Shader3D.getDefineByName("ANISOTROPYMAP");
            this.Define_AnisotropyMapTransform = Laya.Shader3D.getDefineByName("ANISOTROPYMAP_TRANSFORM");
            this.Define_IridescenceMap = Laya.Shader3D.getDefineByName("IRIDESCENCEMAP");
            this.Define_IridescenceMapTransform = Laya.Shader3D.getDefineByName("IRIDESCENCEMAP_TRANSFORM");
            this.Define_IridescenceThicknessMap = Laya.Shader3D.getDefineByName("IRIDESCENCE_THICKNESSMAP");
            this.Define_IridescenceThicknessMapTransform = Laya.Shader3D.getDefineByName("IRIDESCENCE_THICKNESSMAP_TRANSFORM");
            this.Define_SheenColorMap = Laya.Shader3D.getDefineByName("SHEENCOLORMAP");
            this.Define_SheenColorMapTransform = Laya.Shader3D.getDefineByName("SHEENCOLORMAP_TRANSFORM");
            this.Define_SheenRoughnessMap = Laya.Shader3D.getDefineByName("SHEEN_ROUGHNESSMAP");
            this.Define_SheenRoughnessMapTransform = Laya.Shader3D.getDefineByName("SHEEN_ROUGHNESSMAP_TRANSFORM");
            this.Define_TransmissionMap = Laya.Shader3D.getDefineByName("TRANSMISSIONMAP");
            this.Define_TransmissionMapTransform = Laya.Shader3D.getDefineByName("TRANSMISSIONMAP_TRANSFORM");
            this.Define_VolumeThicknessMap = Laya.Shader3D.getDefineByName("THICKNESSMAP");
            this.Define_VolumeThicknessMapTransform = Laya.Shader3D.getDefineByName("THICKNESSMAP_TRANSFORM");
            this.Define_SpecularFactorMap = Laya.Shader3D.getDefineByName("SPECULARFACTORMAP");
            this.Define_SpecularFactorMapTransform = Laya.Shader3D.getDefineByName("SPECULARFACTORMAP_TRANSFORM");
            this.Define_SpecularColorMap = Laya.Shader3D.getDefineByName("SPECULARCOLORMAP");
            this.Define_SpecularColorMapTransform = Laya.Shader3D.getDefineByName("SPECULARCOLORMAP_TRANSFORM");
            let shader = Laya.Shader3D.find(glTFShader.name);
            if (shader) {
                return;
            }
            Laya.Shader3D.addInclude("glTFMetallicRoughness.glsl", glTFMetallicRoughnessGLSL);
            let uniformMap = {
                "u_AlphaTestValue": Laya.ShaderDataType.Float,
                "u_BaseColorFactor": Laya.ShaderDataType.Vector4,
                "u_BaseColorTexture": Laya.ShaderDataType.Texture2D,
                "u_BaseColorMapTransform": Laya.ShaderDataType.Matrix3x3,
                "u_Specular": Laya.ShaderDataType.Float,
                "u_MetallicFactor": Laya.ShaderDataType.Float,
                "u_RoughnessFactor": Laya.ShaderDataType.Float,
                "u_MetallicRoughnessTexture": Laya.ShaderDataType.Texture2D,
                "u_MetallicRoughnessMapTransform": Laya.ShaderDataType.Matrix3x3,
                "u_NormalTexture": Laya.ShaderDataType.Texture2D,
                "u_NormalMapTransform": Laya.ShaderDataType.Matrix3x3,
                "u_NormalScale": Laya.ShaderDataType.Float,
                "u_OcclusionTexture": Laya.ShaderDataType.Texture2D,
                "u_OcclusionMapTransform": Laya.ShaderDataType.Matrix3x3,
                "u_OcclusionStrength": Laya.ShaderDataType.Float,
                "u_EmissionFactor": Laya.ShaderDataType.Vector3,
                "u_EmissionTexture": Laya.ShaderDataType.Texture2D,
                "u_EmissionMapTransform": Laya.ShaderDataType.Matrix3x3,
                "u_EmissionStrength": Laya.ShaderDataType.Float,
                "u_ClearCoatFactor": Laya.ShaderDataType.Float,
                "u_ClearCoatTexture": Laya.ShaderDataType.Texture2D,
                "u_ClearCoatMapTransform": Laya.ShaderDataType.Matrix3x3,
                "u_ClearCoatRoughness": Laya.ShaderDataType.Float,
                "u_ClearCoatRoughnessTexture": Laya.ShaderDataType.Texture2D,
                "u_ClearCoatRoughnessMapTransform": Laya.ShaderDataType.Matrix3x3,
                "u_ClearCoatNormalTexture": Laya.ShaderDataType.Texture2D,
                "u_ClearCoatNormalMapTransform": Laya.ShaderDataType.Matrix3x3,
                "u_ClearCoatNormalScale": Laya.ShaderDataType.Float,
                "u_AnisotropyStrength": Laya.ShaderDataType.Float,
                "u_AnisotropyRotation": Laya.ShaderDataType.Float,
                "u_AnisotropyTexture": Laya.ShaderDataType.Texture2D,
                "u_AnisotropyMapTransform": Laya.ShaderDataType.Matrix3x3,
                "u_Ior": Laya.ShaderDataType.Float,
                "u_IridescenceFactor": Laya.ShaderDataType.Float,
                "u_IridescenceTexture": Laya.ShaderDataType.Texture2D,
                "u_IridescenceMapTransform": Laya.ShaderDataType.Matrix3x3,
                "u_IridescenceIor": Laya.ShaderDataType.Float,
                "u_IridescenceThicknessMinimum": Laya.ShaderDataType.Float,
                "u_IridescenceThicknessMaximum": Laya.ShaderDataType.Float,
                "u_IridescenceThicknessTexture": Laya.ShaderDataType.Texture2D,
                "u_IridescenceThicknessMapTransform": Laya.ShaderDataType.Matrix3x3,
                "u_SheenColorFactor": Laya.ShaderDataType.Vector3,
                "u_SheenColorTexture": Laya.ShaderDataType.Texture2D,
                "u_SheenColorMapTransform": Laya.ShaderDataType.Matrix3x3,
                "u_SheenRoughness": Laya.ShaderDataType.Float,
                "u_SheenRoughnessTexture": Laya.ShaderDataType.Texture2D,
                "u_SheenRoughnessMapTransform": Laya.ShaderDataType.Matrix3x3,
                "u_TransmissionFactor": Laya.ShaderDataType.Float,
                "u_TransmissionTexture": Laya.ShaderDataType.Texture2D,
                "u_TransmissionMapTransform": Laya.ShaderDataType.Matrix3x3,
                "u_VolumeThicknessFactor": Laya.ShaderDataType.Float,
                "u_VolumeThicknessTexture": Laya.ShaderDataType.Texture2D,
                "u_VoluemThicknessMapTransform": Laya.ShaderDataType.Matrix3x3,
                "u_VolumeAttenuationDistance": Laya.ShaderDataType.Float,
                "u_VolumeAttenuationColor": Laya.ShaderDataType.Vector3,
                "u_SpecularFactor": Laya.ShaderDataType.Float,
                "u_SpecularFactorTexture": Laya.ShaderDataType.Texture2D,
                "u_SpecularFactorMapTransfrom": Laya.ShaderDataType.Matrix3x3,
                "u_SpecularColorFactor": Laya.ShaderDataType.Vector3,
                "u_SpecularColorTexture": Laya.ShaderDataType.Texture2D,
                "u_SpecularColorMapTransform": Laya.ShaderDataType.Matrix3x3,
            };
            let defaultValue = {
                "u_AlphaTestValue": 0.5,
                "u_BaseColorFactor": Laya.Vector4.ONE,
                "u_BaseColorMapTransform": Laya.Matrix3x3.DEFAULT,
                "u_Specular": 0.5,
                "u_MetallicFactor": 1.0,
                "u_RoughnessFactor": 1.0,
                "u_MetallicRoughnessMapTransform": Laya.Matrix3x3.DEFAULT,
                "u_NormalMapTransform": Laya.Matrix3x3.DEFAULT,
                "u_NormalScale": 1.0,
                "u_OcclusionMapTransform": Laya.Matrix3x3.DEFAULT,
                "u_OcclusionStrength": 1.0,
                "u_EmissionFactor": Laya.Vector3.ZERO,
                "u_EmissionMapTransform": Laya.Matrix3x3.DEFAULT,
                "u_EmissionStrength": 1.0,
                "u_SpecularFactor": 1.0,
                "u_SpecularFactorMapTransfrom": Laya.Matrix3x3.DEFAULT,
                "u_SpecularColorFactor": Laya.Vector3.ONE,
                "u_SpecularColorMapTransform": Laya.Matrix3x3.DEFAULT,
                "u_Ior": 1.5,
                "u_ClearCoatFactor": 0.0,
                "u_ClearCoatMapTransform": Laya.Matrix3x3.DEFAULT,
                "u_ClearCoatRoughness": 0.0,
                "u_ClearCoatRoughnessMapTransform": Laya.Matrix3x3.DEFAULT,
                "u_ClearCoatNormalMapTransform": Laya.Matrix3x3.DEFAULT,
                "u_ClearCoatNormalScale": 1.0,
                "u_AnisotropyStrength": 0.0,
                "u_AnisotropyRotation": 0.0,
                "u_AnisotropyMapTransform": Laya.Matrix3x3.DEFAULT,
                "u_IridescenceFactor": 0.0,
                "u_IridescenceMapTransform": Laya.Matrix3x3.DEFAULT,
                "u_IridescenceIor": 1.33,
                "u_IridescenceThicknessMinimum": 100,
                "u_IridescenceThicknessMaximum": 400,
                "u_IridescenceThicknessMapTransform": Laya.Matrix3x3.DEFAULT,
                "u_SheenColorFactor": Laya.Vector3.ZERO,
                "u_SheenColorMapTransform": Laya.Matrix3x3.DEFAULT,
                "u_SheenRoughness": 0.0,
                "u_SheenRoughnessMapTransform": Laya.Matrix3x3.DEFAULT,
                "u_TransmissionFactor": 0.0,
                "u_TransmissionMapTransform": Laya.Matrix3x3.DEFAULT,
            };
            shader = Laya.Shader3D.add("glTFPBR", true, true);
            shader.shaderType = Laya.ShaderFeatureType.D3;
            let subShader = new Laya.SubShader(Laya.SubShader.DefaultAttributeMap, uniformMap, defaultValue);
            shader.addSubShader(subShader);
            subShader.addShaderPass(glTFPBRVS, glTFPBRFS);
            subShader.addShaderPass(DepthVS, DephtFS, "ShadowCaster");
            subShader.addShaderPass(DepthNormalVS, DepthNormalFS, "DepthNormal");
        }
    }
    glTFShader.ShaderName = "glTFPBR";

    const maxSubBoneCount = 24;
    class glTFResource extends Laya.Prefab {
        static registerExtension(name, factory) {
            this._Extensions[name] = factory;
        }
        get data() {
            return this._data;
        }
        constructor() {
            super(3);
            this._buffers = {};
            this._textures = [];
            this._materials = [];
            this._meshes = {};
            this._extensions = new Map();
            this._pendingOps = [];
            this._scenes = [];
            this._nodes = [];
        }
        loadBinary(basePath, progress) {
            let data = this._data;
            if (data.buffers) {
                let promises = [];
                data.buffers.forEach((buffer, i) => {
                    if (Laya.Base64Tool.isBase64String(buffer.uri)) {
                        let bin = Laya.Base64Tool.decode(buffer.uri.replace(Laya.Base64Tool.reghead, ""));
                        this._buffers[i] = bin;
                    }
                    else {
                        let j = i;
                        promises.push(Laya.ILaya.loader.fetch(Laya.URL.join(basePath, buffer.uri), "arraybuffer", progress === null || progress === void 0 ? void 0 : progress.createCallback(0.2))
                            .then(bin => {
                            this._buffers[j] = bin;
                        }));
                    }
                });
                return Promise.all(promises);
            }
            else {
                return Promise.resolve();
            }
        }
        loadTextureFromInfo(info, sRGB, basePath, progress) {
            let data = this._data;
            let index = info.index;
            let tex = data.textures[index];
            let imgSource = tex.source;
            let glTFImg = data.images[imgSource];
            let samplerSource = tex.sampler;
            let glTFSampler = data.samplers ? data.samplers[samplerSource] : undefined;
            let constructParams = this.getTextureConstructParams(glTFImg, glTFSampler, sRGB);
            let propertyParams = this.getTexturePropertyParams(glTFSampler);
            if (glTFImg.bufferView != null) {
                let bufferView = data.bufferViews[glTFImg.bufferView];
                let buffer = this._buffers[bufferView.buffer];
                let byteOffset = bufferView.byteOffset || 0;
                let byteLength = bufferView.byteLength;
                let arraybuffer = buffer.slice(byteOffset, byteOffset + byteLength);
                return this.loadTextureFromBuffer(arraybuffer, glTFImg.mimeType, constructParams, propertyParams, progress).then(res => {
                    this._textures[index] = res;
                    this.addDep(res);
                    return res;
                });
            }
            else {
                return this.loadTexture(Laya.URL.join(basePath, glTFImg.uri), constructParams, propertyParams, progress).then(res => {
                    this._textures[index] = res;
                    this.addDep(res);
                    return res;
                });
            }
        }
        loadTextures(basePath, progress) {
            let data = this._data;
            let materials = data.materials;
            let textures = data.textures;
            let promises = [];
            if (materials && textures) {
                for (let glTFMaterial of data.materials) {
                    let pbrMetallicRoughness = glTFMaterial.pbrMetallicRoughness;
                    if (pbrMetallicRoughness) {
                        if (pbrMetallicRoughness.baseColorTexture) {
                            let sRGB = true;
                            let promise = this.loadTextureFromInfo(pbrMetallicRoughness.baseColorTexture, sRGB, basePath, progress);
                            promises.push(promise);
                        }
                        if (pbrMetallicRoughness.metallicRoughnessTexture) {
                            let sRGB = false;
                            let promise = this.loadTextureFromInfo(pbrMetallicRoughness.metallicRoughnessTexture, sRGB, basePath, progress);
                            promises.push(promise);
                        }
                    }
                    if (glTFMaterial.normalTexture) {
                        let sRGB = false;
                        let promise = this.loadTextureFromInfo(glTFMaterial.normalTexture, sRGB, basePath, progress);
                        promises.push(promise);
                    }
                    if (glTFMaterial.occlusionTexture) {
                        let sRGB = false;
                        let promise = this.loadTextureFromInfo(glTFMaterial.occlusionTexture, sRGB, basePath, progress);
                        promises.push(promise);
                    }
                    if (glTFMaterial.emissiveTexture) {
                        let sRGB = true;
                        let promise = this.loadTextureFromInfo(glTFMaterial.emissiveTexture, sRGB, basePath, progress);
                        promises.push(promise);
                    }
                }
            }
            this._extensions.forEach(extension => {
                if (extension.loadAdditionTextures) {
                    let promise = extension.loadAdditionTextures(basePath, progress);
                    promises.push(promise);
                }
            });
            return Promise.all(promises);
        }
        importMaterials() {
            return Promise.resolve().then(() => {
                let data = this._data;
                if (data.materials) {
                    data.materials.forEach((glTFMat, index) => {
                        let mat = this.createMaterial(glTFMat);
                        this._materials[index++] = mat;
                        this.addDep(mat);
                    });
                }
            });
        }
        importMeshes() {
            return Promise.resolve().then(() => {
                let data = this._data;
                if (data.meshes && data.nodes) {
                    data.nodes.forEach((glTFNode) => {
                        var _a;
                        if (glTFNode.mesh != null) {
                            let glTFMesh = this._data.meshes[glTFNode.mesh];
                            let glTFSkin = (_a = this._data.skins) === null || _a === void 0 ? void 0 : _a[glTFNode.skin];
                            let key = glTFNode.mesh + (glTFNode.skin != null ? ("_" + glTFNode.skin) : "");
                            let mesh = this._meshes[key];
                            if (!mesh) {
                                mesh = this.createMesh(glTFMesh, glTFSkin);
                                this._meshes[key] = mesh;
                                this.addDep(mesh);
                            }
                        }
                    });
                }
            });
        }
        _parse(data, createURL, progress) {
            var _a, _b;
            if (!data.asset || data.asset.version !== "2.0") {
                throw new Error("glTF version wrong!");
            }
            this._data = data;
            let basePath = Laya.URL.getPath(createURL);
            this._idCounter = {};
            (_a = data.extensionsUsed) === null || _a === void 0 ? void 0 : _a.forEach(value => {
                let extensionFactory = glTFResource._Extensions[value];
                if (!extensionFactory) {
                    console.warn(`glTF: unsupported used extension: ${value}`);
                }
                else {
                    this._extensions.set(value, extensionFactory(this));
                }
            });
            (_b = data.extensionsRequired) === null || _b === void 0 ? void 0 : _b.forEach(value => {
                let extensionFactory = glTFResource._Extensions[value];
                if (!extensionFactory) {
                    console.warn(`glTF: unsupported required extension: ${value}`);
                }
            });
            let promise = this.loadBinary(basePath, progress);
            promise = promise.then(() => {
                return this.loadTextures(basePath, progress);
            });
            promise = promise.then(() => {
                return this.importMeshes();
            });
            promise = promise.then(() => {
                return this.importMaterials();
            });
            return promise.then(() => {
                if (this._pendingOps.length > 0) {
                    return Promise.all(this._pendingOps).then(() => {
                        this._idCounter = null;
                    });
                }
                else {
                    this._idCounter = null;
                    return Promise.resolve();
                }
            });
        }
        _parseglb(data, createURL, progress) {
            var _a, _b, _c;
            let basePath = Laya.URL.getPath(createURL);
            this._idCounter = {};
            let byte = new Laya.Byte(data);
            let magic = byte.readUint32();
            if (magic != 0x46546C67) {
                throw new Error("glb fromat wrong!");
            }
            let version = byte.readUint32();
            if (version != 2) {
                throw new Error("glb version wrong!");
            }
            byte.readUint32();
            let firstChunkLength = byte.readUint32();
            let firstChunkType = byte.readUint32();
            if (firstChunkType != 0x4E4F534A) {
                throw new Error("glb json chunk data wrong!");
            }
            let firstChunkData = byte.readArrayBuffer(firstChunkLength);
            let texDecoder = new TextDecoder();
            let jsonStr = texDecoder.decode(firstChunkData);
            let glTFObj = JSON.parse(jsonStr);
            this._data = glTFObj;
            let chunkLength = byte.readUint32();
            let chunkType = byte.readUint32();
            if (chunkType != 0x004E4942) {
                throw new Error("glb bin chunk data wrong!");
            }
            let firstBuffer = (_a = glTFObj.buffers) === null || _a === void 0 ? void 0 : _a[0];
            firstBuffer.byteLength = firstBuffer.byteLength ? (Math.min(firstBuffer.byteLength, chunkLength)) : chunkLength;
            this._buffers[0] = byte.readArrayBuffer(firstBuffer.byteLength);
            (_b = glTFObj.extensionsUsed) === null || _b === void 0 ? void 0 : _b.forEach(value => {
                let extensionFactory = glTFResource._Extensions[value];
                if (!extensionFactory) {
                    console.warn(`glTF: unsupported used extension: ${value}`);
                }
                else {
                    this._extensions.set(value, extensionFactory(this));
                }
            });
            (_c = glTFObj.extensionsRequired) === null || _c === void 0 ? void 0 : _c.forEach(value => {
                let extensionFactory = glTFResource._Extensions[value];
                if (!extensionFactory) {
                    console.warn(`glTF: unsupported required extension: ${value}`);
                }
            });
            let promise = this.loadTextures(basePath, progress);
            promise = promise.then(() => {
                return this.importMeshes();
            });
            promise = promise.then(() => {
                return this.importMaterials();
            });
            return promise.then(() => {
                if (this._pendingOps.length > 0) {
                    return Promise.all(this._pendingOps).then(() => {
                        this._idCounter = null;
                    });
                }
                else {
                    this._idCounter = null;
                    return Promise.resolve();
                }
            });
        }
        create() {
            let data = this._data;
            this._scenes.length = 0;
            this._nodes.length = 0;
            this._idCounter = {};
            this.loadNodes(data.nodes);
            this.buildHierarchy(data.nodes);
            this.loadScenes(data.scenes);
            this.loadAnimations(data.animations);
            let defaultSceneIndex = (data.scene != undefined) ? data.scene : 0;
            let defaultScene = this._scenes[defaultSceneIndex];
            this._scenes.length = 0;
            this._nodes.length = 0;
            this._idCounter = null;
            return defaultScene;
        }
        loadTextureFromBuffer(buffer, mimeType, constructParams, propertyParams, progress) {
            let base64 = Laya.Base64Tool.encode(buffer);
            let url = `data:${mimeType};base64,${base64}`;
            return Laya.ILaya.loader.load({ url: url, constructParams: constructParams, propertyParams: propertyParams }, Laya.Loader.TEXTURE2D, progress === null || progress === void 0 ? void 0 : progress.createCallback());
        }
        loadTexture(url, constructParams, propertyParams, progress) {
            return Laya.ILaya.loader.load({ url: url, constructParams: constructParams, propertyParams: propertyParams }, Laya.Loader.TEXTURE2D, progress === null || progress === void 0 ? void 0 : progress.createCallback());
        }
        generateId(context) {
            let i = this._idCounter[context];
            if (i == null)
                i = 0;
            else
                i++;
            this._idCounter[context] = i;
            return i.toString();
        }
        getAccessorComponentsNum(type) {
            switch (type) {
                case "SCALAR": return 1;
                case "VEC2": return 2;
                case "VEC3": return 3;
                case "VEC4": return 4;
                case "MAT2": return 4;
                case "MAT3": return 9;
                case "MAT4": return 16;
                default: return 0;
            }
        }
        getAttributeNum(attriStr) {
            switch (attriStr) {
                case "POSITION": return 3;
                case "NORMAL": return 3;
                case "COLOR": return 4;
                case "UV": return 2;
                case "UV1": return 2;
                case "BLENDWEIGHT": return 4;
                case "BLENDINDICES": return 4;
                case "TANGENT": return 4;
                default: return 0;
            }
        }
        _getTypedArrayConstructor(componentType) {
            switch (componentType) {
                case 5120: return Int8Array;
                case 5121: return Uint8Array;
                case 5122: return Int16Array;
                case 5123: return Uint16Array;
                case 5125: return Uint32Array;
                case 5126: return Float32Array;
            }
        }
        _getAccessorDateByteStride(componentType) {
            switch (componentType) {
                case 5120: return 1;
                case 5121: return 1;
                case 5122: return 2;
                case 5123: return 2;
                case 5125: return 4;
                case 5126: return 4;
            }
        }
        getBufferFormBufferView(bufferView, byteOffset, accessorType, componentType, count) {
            let buffer = this._buffers[bufferView.buffer];
            const constructor = this._getTypedArrayConstructor(componentType);
            let componentCount = this.getAccessorComponentsNum(accessorType);
            let res;
            if (bufferView.byteStride) {
                let vertexStride = bufferView.byteStride;
                let dataByteStride = this._getAccessorDateByteStride(componentType);
                let dataStride = vertexStride / dataByteStride;
                let elementByteOffset = byteOffset || 0;
                let elementOffset = elementByteOffset / dataByteStride;
                let dataReader = new constructor(buffer, bufferView.byteOffset || 0, bufferView.byteLength / dataByteStride);
                res = new constructor(count);
                let resIndex = 0;
                for (let index = 0; index < count; index++) {
                    let componentOffset = index * dataStride;
                    for (let i = 0; i < componentCount; i++) {
                        res[resIndex++] = dataReader[componentOffset + elementOffset + i];
                    }
                }
            }
            else {
                let bufferOffset = (bufferView.byteOffset || 0) + (byteOffset || 0);
                res = new constructor(buffer, bufferOffset, count);
            }
            return res;
        }
        getBufferwithAccessorIndex(accessorIndex) {
            let accessor = this._data.accessors[accessorIndex];
            if (!accessor)
                return null;
            let count = accessor.count;
            let componentCount = this.getAccessorComponentsNum(accessor.type);
            let accessorDataCount = count * componentCount;
            let res;
            let bufferView = this._data.bufferViews[accessor.bufferView];
            if (bufferView) {
                res = this.getBufferFormBufferView(bufferView, accessor.byteOffset, accessor.type, accessor.componentType, accessorDataCount);
            }
            else {
                const constructor = this._getTypedArrayConstructor(accessor.componentType);
                res = new constructor(accessorDataCount).fill(0);
            }
            if (accessor.sparse) {
                let sparseCount = accessor.sparse.count;
                let sparseIndices = accessor.sparse.indices;
                let sparseIndicesBufferView = this._data.bufferViews[sparseIndices.bufferView];
                let sparseIndicesData = this.getBufferFormBufferView(sparseIndicesBufferView, sparseIndices.byteOffset, accessor.type, sparseIndices.componentType, sparseCount);
                let sparseValues = accessor.sparse.values;
                let sparseValuesBufferView = this._data.bufferViews[sparseValues.bufferView];
                let sparseValuesData = this.getBufferFormBufferView(sparseValuesBufferView, sparseValues.byteOffset, accessor.type, accessor.componentType, sparseCount * componentCount);
                for (let index = 0; index < sparseCount; index++) {
                    let i = sparseIndicesData[index];
                    for (let componentIndex = 0; componentIndex < componentCount; componentIndex++) {
                        res[i * componentCount + componentIndex] = sparseValuesData[index * componentCount + componentIndex];
                    }
                }
            }
            return res;
        }
        getTextureMipmap(glTFSampler) {
            if (glTFSampler)
                return glTFSampler.minFilter != 9729 &&
                    glTFSampler.minFilter != 9728;
            else
                return true;
        }
        getTextureFormat(glTFImage) {
            if (glTFImage.mimeType === "image/jpeg") {
                return 0;
            }
            else {
                return 1;
            }
        }
        getTextureFilterMode(glTFSampler) {
            if (!glTFSampler) {
                return 1;
            }
            if (glTFSampler.magFilter === 9728) {
                return 0;
            }
            else if (this.getTextureMipmap(glTFSampler)) {
                if (glTFSampler.minFilter === 9987)
                    return 2;
                return 1;
            }
            return 1;
        }
        getTextureWrapMode(mode) {
            mode = mode !== null && mode !== void 0 ? mode : 10497;
            switch (mode) {
                case 10497:
                    return Laya.WrapMode.Repeat;
                case 33071:
                    return Laya.WrapMode.Clamp;
                case 33648:
                    return Laya.WrapMode.Mirrored;
                default:
                    return Laya.WrapMode.Repeat;
            }
        }
        getTextureConstructParams(glTFImage, glTFSampler, sRGB) {
            let constructParams = [
                0,
                0,
                this.getTextureFormat(glTFImage),
                this.getTextureMipmap(glTFSampler),
                false,
                sRGB
            ];
            return constructParams;
        }
        getTexturePropertyParams(glTFSampler) {
            if (!glTFSampler) {
                return null;
            }
            let propertyParams = {
                filterMode: this.getTextureFilterMode(glTFSampler),
                wrapModeU: this.getTextureWrapMode(glTFSampler.wrapS),
                wrapModeV: this.getTextureWrapMode(glTFSampler.wrapT),
                anisoLevel: 1,
                hdrEncodeFormat: Laya.HDREncodeFormat.NONE
            };
            return propertyParams;
        }
        getTextureWithInfo(glTFTextureInfo) {
            if (glTFTextureInfo.texCoord) {
                console.warn("glTF Loader: non 0 uv channel unsupported.");
            }
            return this._textures[glTFTextureInfo.index];
        }
        getExtensionTextureInfo(info, extensionName) {
            let extension = this._extensions.get(extensionName);
            if (info.extensions && info.extensions[extensionName] && extension) {
                if (extension.loadExtensionTextureInfo) {
                    return extension.loadExtensionTextureInfo(info);
                }
            }
            else {
                return null;
            }
        }
        applyMaterialRenderState(glTFMaterial, material) {
            var _a;
            let renderMode = glTFMaterial.alphaMode || "OPAQUE";
            switch (renderMode) {
                case "OPAQUE": {
                    material.materialRenderMode = Laya.MaterialRenderMode.RENDERMODE_OPAQUE;
                    break;
                }
                case "BLEND": {
                    material.materialRenderMode = Laya.MaterialRenderMode.RENDERMODE_TRANSPARENT;
                    break;
                }
                case "MASK": {
                    material.materialRenderMode = Laya.MaterialRenderMode.RENDERMODE_CUTOUT;
                    break;
                }
            }
            material.alphaTestValue = (_a = glTFMaterial.alphaCutoff) !== null && _a !== void 0 ? _a : 0.5;
            if (glTFMaterial.doubleSided) {
                material.cull = Laya.RenderState.CULL_NONE;
            }
        }
        setMaterialTextureProperty(material, texInfo, name, define, transformName, transformDefine) {
            let tex = this.getTextureWithInfo(texInfo);
            material.setTexture(name, tex);
            if (define) {
                material.setDefine(define, true);
            }
            if (transformDefine) {
                let transformInfo = this.getExtensionTextureInfo(texInfo, "KHR_texture_transform");
                if (transformInfo) {
                    material.setDefine(transformDefine, true);
                    material.setMatrix3x3(transformName, transformInfo.transform);
                }
            }
        }
        applyDefaultMaterialProperties(glTFMaterial, material) {
            var _a, _b, _c, _d;
            let pbrMetallicRoughness = glTFMaterial.pbrMetallicRoughness;
            if (pbrMetallicRoughness) {
                if (pbrMetallicRoughness.baseColorFactor) {
                    let baseColorFactor = material.getVector4("u_BaseColorFactor");
                    baseColorFactor.fromArray(pbrMetallicRoughness.baseColorFactor);
                    material.setVector4("u_BaseColorFactor", baseColorFactor);
                }
                if (pbrMetallicRoughness.baseColorTexture) {
                    this.setMaterialTextureProperty(material, pbrMetallicRoughness.baseColorTexture, "u_BaseColorTexture", glTFShader.Define_BaseColorMap, "u_BaseColorMapTransform", glTFShader.Define_BaseColorMapTransform);
                }
                let metallicFactor = (_a = pbrMetallicRoughness.metallicFactor) !== null && _a !== void 0 ? _a : 1.0;
                material.setFloat("u_MetallicFactor", metallicFactor);
                let roughnessFactor = (_b = pbrMetallicRoughness.roughnessFactor) !== null && _b !== void 0 ? _b : 1.0;
                material.setFloat("u_RoughnessFactor", roughnessFactor);
                if (pbrMetallicRoughness.metallicRoughnessTexture) {
                    this.setMaterialTextureProperty(material, pbrMetallicRoughness.metallicRoughnessTexture, "u_MetallicRoughnessTexture", glTFShader.Define_MetallicRoughnessMap, "u_MetallicRoughnessMapTransform", glTFShader.Define_MetallicRoughnessMapTransform);
                }
            }
            if (glTFMaterial.normalTexture) {
                this.setMaterialTextureProperty(material, glTFMaterial.normalTexture, "u_NormalTexture", glTFShader.Define_NormalMap, "u_NormalMapTransform", glTFShader.Define_NormalMapTransform);
                let normalScale = (_c = glTFMaterial.normalTexture.scale) !== null && _c !== void 0 ? _c : 1.0;
                material.setFloat("u_NormalScale", normalScale);
            }
            if (glTFMaterial.occlusionTexture) {
                this.setMaterialTextureProperty(material, glTFMaterial.occlusionTexture, "u_OcclusionTexture", glTFShader.Define_OcclusionMap, "u_OcclusionMapTransform", glTFShader.Define_OcclusionMapTransform);
                let strength = (_d = glTFMaterial.occlusionTexture.strength) !== null && _d !== void 0 ? _d : 1.0;
                material.setFloat("u_OcclusionStrength", strength);
            }
            if (glTFMaterial.emissiveFactor) {
                let emissionFactor = material.getVector3("u_EmissionFactor");
                emissionFactor.fromArray(glTFMaterial.emissiveFactor);
                material.setVector3("u_EmissionFactor", emissionFactor);
                material.setDefine(Laya.PBRShaderLib.DEFINE_EMISSION, true);
            }
            if (glTFMaterial.emissiveTexture) {
                material.setDefine(Laya.PBRShaderLib.DEFINE_EMISSION, true);
                this.setMaterialTextureProperty(material, glTFMaterial.emissiveTexture, "u_EmissionTexture", glTFShader.Define_EmissionMap, "u_EmissionMapTransform", glTFShader.Define_EmissionMapTransform);
            }
            this.applyMaterialRenderState(glTFMaterial, material);
            return;
        }
        createDefaultMaterial(glTFMaterial) {
            let material = new Laya.Material();
            material.setShaderName(glTFShader.ShaderName);
            material.name = glTFMaterial.name ? glTFMaterial.name : "";
            this.applyDefaultMaterialProperties(glTFMaterial, material);
            return material;
        }
        createMaterial(glTFMaterial) {
            let mat = null;
            let propertiesExts = [];
            for (const key in glTFMaterial.extensions) {
                let extension = this._extensions.get(key);
                if (extension) {
                    if (extension.createMaterial) {
                        mat = extension.createMaterial(glTFMaterial);
                    }
                    if (extension.additionMaterialProperties) {
                        propertiesExts.push(extension);
                    }
                }
            }
            if (!mat) {
                mat = this.createDefaultMaterial(glTFMaterial);
            }
            propertiesExts.forEach(extension => {
                extension.additionMaterialProperties(glTFMaterial, mat);
            });
            return mat;
        }
        pickMeshMaterials(glTFMesh) {
            let materials = [];
            glTFMesh.primitives.forEach(primitive => {
                if (primitive.material != undefined) {
                    let material = this._materials[primitive.material];
                    materials.push(material);
                }
                else {
                    let material = new Laya.PBRStandardMaterial();
                    materials.push(material);
                    this._materials.push(material);
                    primitive.material = this._materials.indexOf(material);
                }
            });
            return materials;
        }
        loadScenes(glTFScenes) {
            if (!glTFScenes)
                return;
            glTFScenes.forEach((glTFScene, index) => {
                this._scenes[index] = this._loadScene(glTFScene);
            });
        }
        _loadScene(glTFScene) {
            return this._createSceneNode(glTFScene);
        }
        _createSceneNode(glTFScene) {
            let glTFSceneNode = new Laya.Sprite3D(glTFScene.name || "Scene");
            glTFScene.nodes.forEach(nodeIndex => {
                let sprite = this._nodes[nodeIndex];
                glTFSceneNode.addChild(sprite);
            });
            return glTFSceneNode;
        }
        applyTransform(glTFNode, sprite) {
            if (glTFNode.matrix) {
                let localMatrix = sprite.transform.localMatrix;
                localMatrix.elements.set(glTFNode.matrix);
                sprite.transform.localMatrix = localMatrix;
            }
            else {
                let localPosition = sprite.transform.localPosition;
                let localRotation = sprite.transform.localRotation;
                let localScale = sprite.transform.localScale;
                glTFNode.translation && localPosition.fromArray(glTFNode.translation);
                glTFNode.rotation && localRotation.fromArray(glTFNode.rotation);
                glTFNode.scale && localScale.fromArray(glTFNode.scale);
                sprite.transform.localPosition = localPosition;
                sprite.transform.localRotation = localRotation;
                sprite.transform.localScale = localScale;
            }
        }
        buildHierarchy(glTFNodes) {
            glTFNodes.forEach((glTFNode, index) => {
                let sprite = this._nodes[index];
                if (glTFNode.children) {
                    glTFNode.children.forEach((childIndex) => {
                        let child = this._nodes[childIndex];
                        sprite.addChild(child);
                    });
                }
            });
            glTFNodes.forEach((glTFNode, index) => {
                let sprite = this._nodes[index];
                if (glTFNode.skin != null) {
                    this.fixSkinnedSprite(glTFNode, sprite);
                }
            });
        }
        loadNodes(glTFNodes) {
            if (!glTFNodes)
                return;
            glTFNodes.forEach((glTFNode, index) => {
                this._nodes[index] = this.loadNode(glTFNode);
            });
        }
        loadNode(glTFNode) {
            return this.createSprite3D(glTFNode);
        }
        createSprite3D(glTFNode) {
            let sprite;
            if (glTFNode.skin != null) {
                sprite = this.createSkinnedMeshSprite3D(glTFNode);
                this.applyTransform(glTFNode, sprite);
            }
            else if (glTFNode.mesh != null) {
                sprite = this.createMeshSprite3D(glTFNode);
                this.applyTransform(glTFNode, sprite);
            }
            else {
                sprite = new Laya.Sprite3D(glTFNode.name);
                this.applyTransform(glTFNode, sprite);
            }
            let storeId = this.generateId("node");
            sprite.name = glTFNode.name || `node_${storeId}`;
            sprite._extra.storeId = "#" + storeId;
            return sprite;
        }
        createMeshSprite3D(glTFNode) {
            let glTFMesh = this._data.meshes[glTFNode.mesh];
            let mesh = this._meshes[glTFNode.mesh];
            let materials = this.pickMeshMaterials(glTFMesh);
            let sprite = new Laya.Sprite3D(glTFNode.name);
            let filter = sprite.addComponent(Laya.MeshFilter);
            let render = sprite.addComponent(Laya.MeshRenderer);
            filter.sharedMesh = mesh;
            render.sharedMaterials = materials;
            render.receiveShadow = true;
            render.castShadow = true;
            if (glTFMesh.weights) {
                glTFMesh.weights.forEach((weight, index) => {
                    let target = mesh.morphTargetData.getMorphChannelbyIndex(index);
                    render.setMorphChannelWeight(target.name, weight);
                });
            }
            return sprite;
        }
        createSkinnedMeshSprite3D(glTFNode) {
            let glTFMesh = this._data.meshes[glTFNode.mesh];
            let mesh = this._meshes[glTFNode.mesh + "_" + glTFNode.skin];
            let materials = this.pickMeshMaterials(glTFMesh);
            let sprite = new Laya.Sprite3D(glTFNode.name);
            let filter = sprite.addComponent(Laya.MeshFilter);
            let render = sprite.addComponent(Laya.SkinnedMeshRenderer);
            filter.sharedMesh = mesh;
            render.sharedMaterials = materials;
            render.receiveShadow = true;
            render.castShadow = true;
            if (glTFMesh.weights) {
                glTFMesh.weights.forEach((weight, index) => {
                    let target = mesh.morphTargetData.getMorphChannelbyIndex(index);
                    render.setMorphChannelWeight(target.name, weight);
                });
            }
            return sprite;
        }
        getArrributeBuffer(attributeAccessorIndex, layaDeclarStr, attributeMap, vertexDeclarArr) {
            let attributeBuffer = this.getBufferwithAccessorIndex(attributeAccessorIndex);
            if (!attributeBuffer)
                return null;
            vertexDeclarArr.push(layaDeclarStr);
            let res = attributeBuffer;
            attributeMap.set(layaDeclarStr, res);
            return res;
        }
        getIndexBuffer(attributeAccessorIndex, vertexCount) {
            let indexBuffer = this.getBufferwithAccessorIndex(attributeAccessorIndex);
            if (indexBuffer) {
                return new Uint32Array(indexBuffer).reverse();
            }
            else {
                let indices = new Uint32Array(vertexCount);
                for (let i = 0; i < vertexCount; i++) {
                    indices[i] = vertexCount - 1 - i;
                }
                return indices;
            }
        }
        calculateFlatNormal(positions, indexArray) {
            let normal = new Float32Array(positions.length);
            for (let index = 0; index < indexArray.length; index += 3) {
                let i0 = indexArray[index];
                let i1 = indexArray[index + 1];
                let i2 = indexArray[index + 2];
                let p0x = positions[i0 * 3];
                let p0y = positions[i0 * 3 + 1];
                let p0z = positions[i0 * 3 + 2];
                let p1x = positions[i1 * 3];
                let p1y = positions[i1 * 3 + 1];
                let p1z = positions[i1 * 3 + 2];
                let p2x = positions[i2 * 3];
                let p2y = positions[i2 * 3 + 1];
                let p2z = positions[i2 * 3 + 2];
                let x1 = p1x - p0x;
                let y1 = p1y - p0y;
                let z1 = p1z - p0z;
                let x2 = p2x - p0x;
                let y2 = p2y - p0y;
                let z2 = p2z - p0z;
                let yz = y1 * z2 - z1 * y2;
                let xz = z1 * x2 - x1 * z2;
                let xy = x1 * y2 - y1 * x2;
                let invPyth = -1.0 / (Math.sqrt((yz * yz) + (xz * xz) + (xy * xy)));
                let nx = yz * invPyth;
                let ny = xz * invPyth;
                let nz = xy * invPyth;
                normal[i0 * 3] = nx;
                normal[i1 * 3] = nx;
                normal[i2 * 3] = nx;
                normal[i0 * 3 + 1] = ny;
                normal[i1 * 3 + 1] = ny;
                normal[i2 * 3 + 1] = ny;
                normal[i0 * 3 + 2] = nz;
                normal[i1 * 3 + 2] = nz;
                normal[i2 * 3 + 2] = nz;
            }
            return normal;
        }
        parseMeshwithSubMeshData(subDatas, layaMesh) {
            let vertexCount = 0;
            let indexCount = 0;
            let vertexDecler = undefined;
            subDatas.forEach(subData => {
                vertexCount += subData.vertexCount;
                indexCount += subData.indices.length;
                vertexDecler = vertexDecler || subData.vertexDecler;
            });
            let vertexDeclaration = Laya.VertexMesh.getVertexDeclaration(vertexDecler, false);
            let vertexByteStride = vertexDeclaration.vertexStride;
            let vertexFloatStride = vertexByteStride / 4;
            let vertexArray = new Float32Array(vertexFloatStride * vertexCount);
            let indexArray;
            let ibFormat = Laya.IndexFormat.UInt32;
            if (vertexCount < 65536) {
                indexArray = new Uint16Array(indexCount);
                ibFormat = Laya.IndexFormat.UInt16;
            }
            else {
                indexArray = new Uint32Array(indexCount);
            }
            this.fillMeshBuffers(subDatas, vertexArray, indexArray, vertexFloatStride);
            this.generateMesh(vertexArray, indexArray, vertexDeclaration, ibFormat, subDatas, layaMesh);
        }
        fillMeshBuffers(subDatas, vertexArray, indexArray, vertexFloatStride) {
            let ibPosOffset = 0;
            let ibVertexOffset = 0;
            let vbPosOffset = 0;
            subDatas.forEach((subData) => {
                let iAOffset = ibPosOffset;
                let vertexCount = subData.vertexCount;
                let subIb = subData.indices;
                for (let index = 0; index < subIb.length; index++) {
                    indexArray[iAOffset + index] = subIb[index] + ibVertexOffset;
                }
                ibPosOffset += subIb.length;
                ibVertexOffset += vertexCount;
                const fillAttributeBuffer = (value, attriOffset, attriFloatCount = 0) => {
                    let startOffset = vbPosOffset + attriOffset;
                    for (let index = 0; index < vertexCount; index++) {
                        for (let ac = 0; ac < attriFloatCount; ac++) {
                            vertexArray[startOffset + index * vertexFloatStride + ac] = value[index * attriFloatCount + ac];
                        }
                    }
                };
                let attriOffset = 0;
                let attributeMap = subData.attributeMap;
                let position = attributeMap.get("POSITION");
                (position) && (fillAttributeBuffer(position, attriOffset, 3), attriOffset += 3);
                let normal = attributeMap.get("NORMAL");
                (normal) && (fillAttributeBuffer(normal, attriOffset, 3), attriOffset += 3);
                let color = attributeMap.get("COLOR");
                (color) && (fillAttributeBuffer(color, attriOffset, 4), attriOffset += 4);
                let uv = attributeMap.get("UV");
                (uv) && (fillAttributeBuffer(uv, attriOffset, 2), attriOffset += 2);
                let uv1 = attributeMap.get("UV1");
                (uv1) && (fillAttributeBuffer(uv1, attriOffset, 2), attriOffset += 2);
                let blendWeight = attributeMap.get("BLENDWEIGHT");
                (blendWeight) && (fillAttributeBuffer(blendWeight, attriOffset, 4), attriOffset += 4);
                let blendIndices = attributeMap.get("BLENDINDICES");
                if (blendIndices) {
                    let blendIndicesUint8 = new Uint8Array(blendIndices);
                    let blendIndicesFloat32 = new Float32Array(blendIndicesUint8.buffer);
                    fillAttributeBuffer(blendIndicesFloat32, attriOffset, 1), attriOffset += 1;
                }
                let tangent = attributeMap.get("TANGENT");
                (tangent) && (fillAttributeBuffer(tangent, attriOffset, 4), attriOffset += 4);
                vbPosOffset += vertexCount * vertexFloatStride;
            });
        }
        splitSubMeshByBonesCount(attributeMap, morphtargets, indexArray, boneIndicesList, subIndexStartArray, subIndexCountArray) {
            let start = 0;
            let subIndexSet = new Set();
            let boneIndexArray = attributeMap.get("BLENDINDICES");
            let vertexCount = boneIndexArray.length / 4;
            let resArray = new Float32Array(boneIndexArray.length);
            let flagArray = new Array(vertexCount).fill(false);
            for (let i = 0, n = indexArray.length; i < n; i += 3) {
                let triangleSet = new Set();
                for (let j = i; j < i + 3; j++) {
                    let ibIndex = indexArray[j];
                    let boneIndexOffset = ibIndex * 4;
                    for (let k = 0; k < 4; k++) {
                        triangleSet.add(boneIndexArray[boneIndexOffset + k]);
                    }
                }
                let tempSet = new Set([...subIndexSet, ...triangleSet]);
                if (tempSet.size > maxSubBoneCount) {
                    let count = i - start;
                    subIndexStartArray.push(start);
                    subIndexCountArray.push(count);
                    let curBoneList = Array.from(subIndexSet);
                    boneIndicesList.push(new Uint16Array(curBoneList));
                    start = i;
                    subIndexSet = new Set(triangleSet);
                }
                else {
                    subIndexSet = tempSet;
                }
                if (i == n - 3) {
                    let count = i - start + 3;
                    subIndexStartArray.push(start);
                    subIndexCountArray.push(count);
                    start = i;
                    let curBoneList = Array.from(subIndexSet);
                    boneIndicesList.push(new Uint16Array(curBoneList));
                }
            }
            let drawCount = boneIndicesList.length;
            let newAttributeMap = new Map();
            attributeMap.forEach((value, key) => {
                let array = new Array();
                newAttributeMap.set(key, array);
            });
            let newTargetMap = {};
            for (const key in morphtargets.targets) {
                let newMap = newTargetMap[key] = new Map();
                let target = morphtargets.targets[key];
                target.forEach((value, attri) => {
                    newMap.set(attri, new Array());
                });
            }
            let curMaxIndex = vertexCount - 1;
            for (let d = 0; d < drawCount; d++) {
                let k = subIndexStartArray[d];
                let l = subIndexCountArray[d];
                let bl = boneIndicesList[d];
                let batchFlag = new Array(vertexCount).fill(false);
                let batchMap = new Map();
                for (let area = 0; area < l; area++) {
                    let ci = indexArray[area + k];
                    let biStart = 4 * ci;
                    for (let cbi = biStart; cbi < biStart + 4; cbi++) {
                        let oldBoneIndex = boneIndexArray[cbi];
                        let newBoneIndex = bl.indexOf(oldBoneIndex);
                        newBoneIndex = newBoneIndex == -1 ? 0 : newBoneIndex;
                        if (flagArray[ci] && !batchFlag[ci]) {
                            newAttributeMap.get("BLENDINDICES").push(newBoneIndex);
                        }
                        else if (flagArray[ci] && batchFlag[ci]) ;
                        else {
                            resArray[cbi] = newBoneIndex;
                        }
                    }
                    if (!flagArray[ci] && !batchFlag[ci]) {
                        batchFlag[ci] = true;
                        batchMap.set(ci, ci);
                    }
                    else if (!flagArray[ci] && batchFlag[ci]) {
                        indexArray[area + k] = batchMap.get(ci);
                    }
                    else if (flagArray[ci] && !batchFlag[ci]) {
                        batchFlag[ci] = true;
                        curMaxIndex++;
                        batchMap.set(ci, curMaxIndex);
                        indexArray[area + k] = curMaxIndex;
                        newAttributeMap.forEach((value, key) => {
                            let attOffset = this.getAttributeNum(key);
                            let oldArray = attributeMap.get(key);
                            if (key !== "BLENDINDICES") {
                                for (let index = 0; index < attOffset; index++) {
                                    value.push(oldArray[index + ci * attOffset]);
                                }
                            }
                        });
                        for (const key in newTargetMap) {
                            let newMap = newTargetMap[key];
                            let oldMap = morphtargets.targets[key];
                            newMap.forEach((value, attri) => {
                                let attOffset = this.getAttributeNum(attri);
                                let oldArray = oldMap.get(attri);
                                for (let index = 0; index < attOffset; index++) {
                                    value.push(oldArray[index + ci * attOffset]);
                                }
                            });
                        }
                    }
                    else if (flagArray[ci] && batchFlag[ci]) {
                        indexArray[area + k] = batchMap.get(ci);
                    }
                }
                batchFlag.forEach((value, index) => {
                    flagArray[index] = value || flagArray[index];
                });
            }
            newAttributeMap.forEach((value, key) => {
                let oldFloatArray = attributeMap.get(key);
                if (key == "BLENDINDICES") {
                    oldFloatArray = resArray;
                }
                let newLength = oldFloatArray.length + value.length;
                let newFloatArray = new Float32Array(newLength);
                newFloatArray.set(oldFloatArray, 0);
                newFloatArray.set(value, oldFloatArray.length);
                attributeMap.set(key, newFloatArray);
            });
            for (const key in newTargetMap) {
                let newMap = newTargetMap[key];
                let oldMap = morphtargets.targets[key];
                newMap.forEach((value, attri) => {
                    let oldArray = oldMap.get(attri);
                    let newLength = value.length + oldArray.length;
                    let newFloatArray = new Float32Array(newLength);
                    newFloatArray.set(oldArray, 0);
                    newFloatArray.set(value, oldArray.length);
                    oldMap.set(attri, newFloatArray);
                });
            }
            boneIndexArray = null;
        }
        generateMesh(vertexArray, indexArray, vertexDeclaration, ibFormat, subDatas, layaMesh) {
            let vertexBuffer = Laya.Laya3DRender.renderOBJCreate.createVertexBuffer3D(vertexArray.byteLength, Laya.BufferUsage.Static, true);
            vertexBuffer.vertexDeclaration = vertexDeclaration;
            vertexBuffer.setData(vertexArray.buffer);
            let indexBuffer = Laya.Laya3DRender.renderOBJCreate.createIndexBuffer3D(ibFormat, indexArray.length, Laya.BufferUsage.Static, true);
            indexBuffer.setData(indexArray);
            layaMesh._indexFormat = ibFormat;
            layaMesh._indexBuffer = indexBuffer;
            layaMesh._vertexBuffer = vertexBuffer;
            layaMesh._setBuffer(vertexBuffer, indexBuffer);
            layaMesh._vertexCount = vertexBuffer._byteLength / vertexDeclaration.vertexStride;
            let reCalculateBounds = false;
            let min = new Laya.Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
            let max = new Laya.Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
            let subMeshOffset = 0;
            let subMeshCount = subDatas.length;
            let subMeshes = new Array(subMeshCount);
            for (let index = 0; index < subMeshCount; index++) {
                let subData = subDatas[index];
                let subMesh = new Laya.SubMesh(layaMesh);
                subMeshes[index] = subMesh;
                subMesh._vertexBuffer = vertexBuffer;
                subMesh._indexBuffer = indexBuffer;
                let subIndexStart = subMeshOffset;
                subMeshOffset += subData.indices.length;
                let subIndexCount = subData.indices.length;
                subMesh._setIndexRange(subIndexStart, subIndexCount, ibFormat);
                subMesh._boneIndicesList = subData.boneIndicesList;
                subMesh._subIndexBufferStart = subData.subIndexStartArray;
                subMesh._subIndexBufferCount = subData.subIndexCountArray;
                for (let subIndex = 0; subIndex < subMesh._subIndexBufferStart.length; subIndex++) {
                    subMesh._subIndexBufferStart[subIndex] += subIndexStart;
                }
                if (subData.boundMax && subData.boundMin) {
                    min.x = Math.min(subData.boundMin[0], min.x);
                    min.y = Math.min(subData.boundMin[1], min.y);
                    min.z = Math.min(subData.boundMin[2], min.z);
                    max.x = Math.max(subData.boundMax[0], max.x);
                    max.y = Math.max(subData.boundMax[1], max.y);
                    max.z = Math.max(subData.boundMax[2], max.z);
                }
                else {
                    reCalculateBounds = true;
                }
            }
            layaMesh._setSubMeshes(subMeshes);
            if (reCalculateBounds) {
                layaMesh.calculateBounds();
            }
            else {
                layaMesh.bounds.setMin(min);
                layaMesh.bounds.setMax(max);
            }
            let memorySize = vertexBuffer._byteLength + indexBuffer._byteLength;
            layaMesh._setCPUMemory(memorySize);
            layaMesh._setGPUMemory(memorySize);
        }
        applyglTFSkinData(mesh, subDatas, glTFSkin) {
            if (!glTFSkin)
                return;
            let joints = glTFSkin.joints;
            let inverseBindMatricesArray = new Float32Array(this.getBufferwithAccessorIndex(glTFSkin.inverseBindMatrices));
            let boneCount = joints.length;
            let boneNames = mesh._boneNames = [];
            joints.forEach(nodeIndex => {
                let node = this._data.nodes[nodeIndex];
                boneNames.push(node.name);
            });
            mesh._inverseBindPoses = [];
            mesh._inverseBindPosesBuffer = inverseBindMatricesArray.buffer;
            for (let index = 0; index < boneCount; index++) {
                let bindPosesArrayOffset = 16 * index;
                let matElement = inverseBindMatricesArray.slice(bindPosesArrayOffset, bindPosesArrayOffset + 16);
                mesh._inverseBindPoses[index] = new Laya.Matrix4x4(matElement[0], matElement[1], matElement[2], matElement[3], matElement[4], matElement[5], matElement[6], matElement[7], matElement[8], matElement[9], matElement[10], matElement[11], matElement[12], matElement[13], matElement[14], matElement[15], matElement);
            }
            let subCount = subDatas.length;
            let skinnedCache = mesh._skinnedMatrixCaches;
            skinnedCache.length = mesh._inverseBindPoses.length;
            for (let subIndex = 0; subIndex < subCount; subIndex++) {
                let submesh = mesh.getSubMesh(subIndex);
                let drawCount = submesh._subIndexBufferStart.length;
                for (let drawIndex = 0; drawIndex < drawCount; drawIndex++) {
                    let boneIndices = submesh._boneIndicesList[drawIndex];
                    for (let bni = 0; bni < boneIndices.length; bni++) {
                        let bn = boneIndices[bni];
                        skinnedCache[bn] || (skinnedCache[bn] = new Laya.skinnedMatrixCache(subIndex, drawIndex, bni));
                    }
                }
            }
            for (let index = 0; index < skinnedCache.length; index++) {
                if (!skinnedCache[index]) {
                    skinnedCache[index] = new Laya.skinnedMatrixCache(0, 0, 0);
                }
            }
        }
        applyMorphTarget(mesh, subDatas) {
            let hasPosition = false;
            let hasNormal = false;
            let hasTangent = false;
            subDatas.forEach(subData => {
                hasPosition = subData.morphtargets.position || hasPosition;
                hasNormal = subData.morphtargets.normal || hasNormal;
                hasTangent = subData.morphtargets.tangent || hasTangent;
            });
            if (!(hasPosition || hasTangent || hasTangent)) {
                return;
            }
            let vertexCount = mesh.vertexCount;
            let morphData = new Laya.MorphTargetData();
            morphData.vertexCount = vertexCount;
            let decStr = [];
            if (hasPosition)
                decStr.push("POSITION");
            if (hasNormal)
                decStr.push("NORMAL");
            if (hasTangent)
                decStr.push("TANGENT");
            let morphVertexDec = Laya.VertexMesh.getVertexDeclaration(decStr.toLocaleString());
            let targetVertexFloatStride = morphVertexDec.vertexStride / 4;
            morphData.vertexDec = morphVertexDec;
            let bounds = morphData.bounds;
            let min = bounds.getMin();
            let max = bounds.getMax();
            min.set(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
            max.set(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
            let subVertexOffset = 0;
            for (let index = 0; index < subDatas.length; index++) {
                let subData = subDatas[index];
                min.x = Math.min(min.x, subData.morphtargets.boundMin[0]);
                min.y = Math.min(min.y, subData.morphtargets.boundMin[1]);
                min.z = Math.min(min.z, subData.morphtargets.boundMin[2]);
                max.x = Math.max(max.x, subData.morphtargets.boundMax[0]);
                max.y = Math.max(max.y, subData.morphtargets.boundMax[1]);
                max.z = Math.max(max.z, subData.morphtargets.boundMax[2]);
                let targets = subData.morphtargets.targets;
                for (const targetName in targets) {
                    let channel = morphData.getMorphChannel(targetName);
                    if (!channel) {
                        channel = new Laya.MorphTargetChannel();
                        channel.name = targetName;
                        let target = new Laya.MorphTarget();
                        target.name = targetName;
                        target.data = new Float32Array(vertexCount * targetVertexFloatStride).fill(0);
                        channel.addTarget(target);
                        morphData.addMorphChannel(channel);
                    }
                    let target = channel.getTargetByIndex(0);
                    let morphMap = targets[targetName];
                    for (let vertexIndex = 0; vertexIndex < subData.vertexCount; vertexIndex++) {
                        let morphPosition = morphMap.get("POSITION");
                        if (morphPosition) {
                            let posElement = morphVertexDec.getVertexElementByUsage(Laya.VertexMesh.MESH_POSITION0);
                            let offset = posElement.offset / 4;
                            target.data[(vertexIndex + subVertexOffset) * targetVertexFloatStride + offset] = morphPosition[vertexIndex * 3];
                            target.data[(vertexIndex + subVertexOffset) * targetVertexFloatStride + offset + 1] = morphPosition[vertexIndex * 3 + 1];
                            target.data[(vertexIndex + subVertexOffset) * targetVertexFloatStride + offset + 2] = morphPosition[vertexIndex * 3 + 2];
                        }
                        let morphNormal = morphMap.get("NORMAL");
                        if (morphNormal) {
                            let normalElement = morphVertexDec.getVertexElementByUsage(Laya.VertexMesh.MESH_NORMAL0);
                            let offset = normalElement.offset / 4;
                            target.data[(vertexIndex + subVertexOffset) * targetVertexFloatStride + offset] = morphNormal[vertexIndex * 3];
                            target.data[(vertexIndex + subVertexOffset) * targetVertexFloatStride + offset + 1] = morphNormal[vertexIndex * 3 + 1];
                            target.data[(vertexIndex + subVertexOffset) * targetVertexFloatStride + offset + 2] = morphNormal[vertexIndex * 3 + 2];
                        }
                        let morphTangent = morphMap.get("TANGENT");
                        if (morphTangent) {
                            let tangentElement = morphVertexDec.getVertexElementByUsage(Laya.VertexMesh.MESH_TANGENT0);
                            let offset = tangentElement.offset / 4;
                            target.data[(vertexIndex + subVertexOffset) * targetVertexFloatStride + offset] = morphTangent[vertexIndex * 3];
                            target.data[(vertexIndex + subVertexOffset) * targetVertexFloatStride + offset + 1] = morphTangent[vertexIndex * 3 + 1];
                            target.data[(vertexIndex + subVertexOffset) * targetVertexFloatStride + offset + 2] = morphTangent[vertexIndex * 3 + 2];
                            target.data[(vertexIndex + subVertexOffset) * targetVertexFloatStride + offset + 3] = subData.attributeMap.get("TANGENT")[vertexIndex * 4 + 3];
                        }
                    }
                }
                subVertexOffset += subData.vertexCount;
            }
            bounds.setMin(min);
            bounds.setMax(max);
            mesh.morphTargetData = morphData;
            morphData.initData();
        }
        createMesh(glTFMesh, glTFSkin) {
            let layaMesh = new Laya.Mesh();
            let glTFMeshPrimitives = glTFMesh.primitives;
            let morphWeights = glTFMesh.weights;
            let boneCount = (glTFSkin) ? glTFSkin.joints.length : 0;
            let subDatas = [];
            glTFMeshPrimitives.forEach((glTFMeshPrimitive) => {
                var _a;
                let mode = glTFMeshPrimitive.mode;
                if (mode == undefined)
                    mode = 4;
                if (4 != mode) {
                    console.warn("glTF Loader: only support gl.TRIANGLES.");
                    debugger;
                }
                let vertexDeclarArr = [];
                let attributeMap = new Map();
                let attributes = glTFMeshPrimitive.attributes;
                let position = this.getArrributeBuffer(attributes.POSITION, "POSITION", attributeMap, vertexDeclarArr);
                let vertexCount = position.length / 3;
                let indexArray = this.getIndexBuffer(glTFMeshPrimitive.indices, vertexCount);
                let positionAccessor = this._data.accessors[attributes.POSITION];
                let normal = this.getArrributeBuffer(attributes.NORMAL, "NORMAL", attributeMap, vertexDeclarArr);
                if (!normal) {
                    normal = this.calculateFlatNormal(position, indexArray);
                    vertexDeclarArr.push("NORMAL");
                    attributeMap.set("NORMAL", normal);
                }
                this.getArrributeBuffer(attributes.COLOR_0, "COLOR", attributeMap, vertexDeclarArr);
                this.getArrributeBuffer(attributes.TEXCOORD_0, "UV", attributeMap, vertexDeclarArr);
                this.getArrributeBuffer(attributes.TEXCOORD_1, "UV1", attributeMap, vertexDeclarArr);
                this.getArrributeBuffer(attributes.WEIGHTS_0, "BLENDWEIGHT", attributeMap, vertexDeclarArr);
                this.getArrributeBuffer(attributes.JOINTS_0, "BLENDINDICES", attributeMap, vertexDeclarArr);
                let tangent;
                tangent = this.getArrributeBuffer(attributes.TANGENT, "TANGENT", attributeMap, vertexDeclarArr);
                if (tangent) {
                    for (let tangentIndex = 0; tangentIndex < tangent.length; tangentIndex += 4) {
                        tangent[tangentIndex + 3] *= -1;
                    }
                }
                let targets = glTFMeshPrimitive.targets;
                let morphtargets = { weights: morphWeights, position: false, normal: false, tangent: false, targets: {}, boundMin: [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE], boundMax: [-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE] };
                if (targets) {
                    let morphtargetMap;
                    let targetNames = ((_a = glTFMesh.extras) === null || _a === void 0 ? void 0 : _a.targetNames) || [];
                    morphtargetMap = morphtargets.targets;
                    targets.forEach((target, index) => {
                        let targetName = targetNames[index] || `target_${index}`;
                        let morph = new Map();
                        morphtargetMap[targetName] = morph;
                        let morphPosition = this.getBufferwithAccessorIndex(target.POSITION);
                        let morphNormal = this.getBufferwithAccessorIndex(target.NORMAL);
                        let morphTangent = this.getBufferwithAccessorIndex(target.TANGENT);
                        if (morphPosition) {
                            morph.set("POSITION", morphPosition);
                            morphtargets.position = true;
                            if (position) {
                                let vertexCount = position.length / 3;
                                for (let i = 0; i < vertexCount; i++) {
                                    let offset = i * 3;
                                    let morphX = position[offset] + morphPosition[offset];
                                    let morphY = position[offset + 1] + morphPosition[offset + 1];
                                    let morphZ = position[offset + 2] + morphPosition[offset + 2];
                                    morphtargets.boundMin[0] = Math.min(morphX, morphtargets.boundMin[0]);
                                    morphtargets.boundMin[1] = Math.min(morphY, morphtargets.boundMin[1]);
                                    morphtargets.boundMin[2] = Math.min(morphZ, morphtargets.boundMin[2]);
                                    morphtargets.boundMax[0] = Math.max(morphX, morphtargets.boundMax[0]);
                                    morphtargets.boundMax[1] = Math.max(morphY, morphtargets.boundMax[1]);
                                    morphtargets.boundMax[2] = Math.max(morphZ, morphtargets.boundMax[2]);
                                }
                            }
                        }
                        if (morphNormal) {
                            morph.set("NORMAL", morphNormal);
                            morphtargets.normal = true;
                        }
                        if (morphTangent) {
                            morph.set("TANGENT", morphTangent);
                            morphtargets.tangent = true;
                        }
                    });
                }
                let boneIndicesList = new Array();
                let subIndexStartArray = [];
                let subIndexCountArray = [];
                if (glTFSkin) {
                    if (boneCount > maxSubBoneCount) {
                        this.splitSubMeshByBonesCount(attributeMap, morphtargets, indexArray, boneIndicesList, subIndexStartArray, subIndexCountArray);
                        vertexCount = attributeMap.get("POSITION").length / 3;
                    }
                    else {
                        subIndexStartArray[0] = 0;
                        subIndexCountArray[0] = indexArray.length;
                        boneIndicesList[0] = new Uint16Array(boneCount);
                        for (let bi = 0; bi < boneCount; bi++) {
                            boneIndicesList[0][bi] = bi;
                        }
                    }
                }
                else {
                    subIndexStartArray[0] = 0;
                    subIndexCountArray[0] = indexArray.length;
                }
                let vertexDeclaration = vertexDeclarArr.toString();
                let subData = new PrimitiveSubMesh();
                subDatas.push(subData);
                subData.attributeMap = attributeMap;
                subData.boundMax = positionAccessor.max;
                subData.boundMin = positionAccessor.min;
                subData.morphtargets = morphtargets;
                subData.indices = indexArray;
                subData.vertexCount = vertexCount;
                subData.vertexDecler = vertexDeclaration;
                subData.boneIndicesList = boneIndicesList;
                subData.subIndexStartArray = subIndexStartArray;
                subData.subIndexCountArray = subIndexCountArray;
            });
            this.parseMeshwithSubMeshData(subDatas, layaMesh);
            this.applyglTFSkinData(layaMesh, subDatas, glTFSkin);
            this.applyMorphTarget(layaMesh, subDatas);
            return layaMesh;
        }
        calSkinnedSpriteLocalBounds(skinned) {
            let render = skinned.getComponent(Laya.SkinnedMeshRenderer);
            let mesh = skinned.getComponent(Laya.MeshFilter).sharedMesh;
            let rootBone = render.rootBone;
            let oriRootMatrix = rootBone.transform.worldMatrix;
            let invertRootMatrix = new Laya.Matrix4x4();
            oriRootMatrix.invert(invertRootMatrix);
            let indices = mesh.getIndices();
            let positions = [];
            let boneIndices = [];
            let boneWeights = [];
            mesh.getPositions(positions);
            mesh.getBoneIndices(boneIndices);
            mesh.getBoneWeights(boneWeights);
            let oriBoneIndeices = [];
            mesh._subMeshes.forEach((subMesh, index) => {
                let bonelists = subMesh._boneIndicesList;
                bonelists.forEach((bonelist, listIndex) => {
                    let start = subMesh._subIndexBufferStart[listIndex];
                    let count = subMesh._subIndexBufferCount[listIndex];
                    let endIndex = count + start;
                    for (let iindex = start; iindex < endIndex; iindex++) {
                        let ii = indices[iindex];
                        let boneIndex = boneIndices[ii];
                        let x = bonelist[boneIndex.x];
                        let y = bonelist[boneIndex.y];
                        let z = bonelist[boneIndex.z];
                        let w = bonelist[boneIndex.w];
                        oriBoneIndeices[ii] = new Laya.Vector4(x, y, z, w);
                    }
                });
            });
            let inverseBindPoses = mesh._inverseBindPoses;
            let bones = render.bones;
            let ubones = [];
            let tempMat = new Laya.Matrix4x4();
            bones.forEach((bone, index) => {
                ubones[index] = new Laya.Matrix4x4();
                Laya.Matrix4x4.multiply(invertRootMatrix, bone.transform.worldMatrix, tempMat);
                Laya.Matrix4x4.multiply(tempMat, inverseBindPoses[index], ubones[index]);
            });
            let skinTransform = new Laya.Matrix4x4;
            let resPos = new Laya.Vector3();
            let min = new Laya.Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
            let max = new Laya.Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
            for (let index = 0; index < positions.length; index++) {
                let pos = positions[index];
                let boneIndex = oriBoneIndeices[index];
                let boneWeight = boneWeights[index];
                if (!(boneIndex && boneWeight)) {
                    continue;
                }
                for (let ei = 0; ei < 16; ei++) {
                    skinTransform.elements[ei] = ubones[boneIndex.x].elements[ei] * boneWeight.x;
                    skinTransform.elements[ei] += ubones[boneIndex.y].elements[ei] * boneWeight.y;
                    skinTransform.elements[ei] += ubones[boneIndex.z].elements[ei] * boneWeight.z;
                    skinTransform.elements[ei] += ubones[boneIndex.w].elements[ei] * boneWeight.w;
                }
                Laya.Vector3.transformV3ToV3(pos, skinTransform, resPos);
                Laya.Vector3.min(min, resPos, min);
                Laya.Vector3.max(max, resPos, max);
            }
            positions = null;
            boneIndices = boneWeights = oriBoneIndeices = null;
            indices = null;
            ubones = null;
            render.localBounds.setMin(min);
            render.localBounds.setMax(max);
            render.localBounds = render.localBounds;
        }
        fixSkinnedSprite(glTFNode, skinned) {
            let skin = this._data.skins[glTFNode.skin];
            let skinnedMeshRenderer = skinned.getComponent(Laya.SkinnedMeshRenderer);
            skin.joints.forEach(nodeIndex => {
                let bone = this._nodes[nodeIndex];
                skinnedMeshRenderer.bones.push(bone);
            });
            if (skin.skeleton == undefined) {
                skin.skeleton = skin.joints[0];
            }
            skinnedMeshRenderer.rootBone = this._nodes[skin.skeleton];
            skinnedMeshRenderer.bones = skinnedMeshRenderer.bones;
            this.calSkinnedSpriteLocalBounds(skinned);
        }
        getAnimationRoot(channels) {
            const isContainNode = (nodeArr, findNodeIndex) => {
                if (!nodeArr)
                    return false;
                if (nodeArr.indexOf(findNodeIndex) == -1) {
                    for (let index = 0; index < nodeArr.length; index++) {
                        let glTFNode = this._data.nodes[nodeArr[index]];
                        if (isContainNode(glTFNode.children, findNodeIndex)) {
                            return true;
                        }
                    }
                }
                return true;
            };
            let target = channels[0].target;
            let spriteIndex = target.node;
            for (let index = 0; index < this._data.scenes.length; index++) {
                let glTFScene = this._data.scenes[index];
                if (isContainNode(glTFScene.nodes, spriteIndex)) {
                    return this._scenes[index];
                }
            }
            return null;
        }
        getAnimationPath(root, curSprite) {
            let paths = [];
            if (root == curSprite)
                return paths;
            let sprite = curSprite;
            while (sprite.parent != root) {
                sprite = sprite.parent;
                paths.push(sprite.name);
            }
            paths = paths.reverse();
            paths.push(curSprite.name);
            return paths;
        }
        loadAnimations(animations) {
            if (!animations)
                return;
            animations.forEach((animation, index) => {
                this.loadAnimation(animation);
            });
        }
        loadAnimation(animation) {
            return this.createAnimator(animation);
        }
        createAnimator(animation) {
            let channels = animation.channels;
            animation.samplers;
            let animatorRoot = this.getAnimationRoot(channels);
            if (!animatorRoot) {
                return null;
            }
            let animator = animatorRoot.getComponent(Laya.Animator);
            if (!animator) {
                animator = animatorRoot.addComponent(Laya.Animator);
                let animatorLayer = new Laya.AnimatorControllerLayer("AnimatorLayer");
                animator.addControllerLayer(animatorLayer);
                animatorLayer.defaultWeight = 1.0;
            }
            let clip = this.createAnimatorClip(animation, animatorRoot);
            let animatorLayer = animator.getControllerLayer();
            let animationName = clip.name;
            if (animatorLayer.getAnimatorState(animationName)) {
                animationName = clip.name = `${animationName}_${this.generateId(animationName)}`;
            }
            let animatorState = new Laya.AnimatorState();
            animatorState.name = animationName;
            animatorState.clip = clip;
            animatorLayer.addState(animatorState);
            animatorLayer.defaultState = animatorState;
            animatorLayer.playOnWake = true;
            return animator;
        }
        createAnimatorClip(animation, animatorRoot) {
            let clip = new Laya.AnimationClip();
            let duration = 0;
            let channels = animation.channels;
            let samplers = animation.samplers;
            let clipNodes = [];
            channels.forEach((channel, index) => {
                var _a;
                let target = channel.target;
                let sampler = samplers[channel.sampler];
                let targetPath = target.path;
                let timeBuffer = this.getBufferwithAccessorIndex(sampler.input);
                let outBuffer = this.getBufferwithAccessorIndex(sampler.output);
                let timeArray = new Float32Array(timeBuffer);
                let outArray = new Float32Array(outBuffer);
                let sprite = this._nodes[target.node];
                let animaPaths = this.getAnimationPath(animatorRoot, sprite);
                if (targetPath == "weights") {
                    let mesh = (_a = sprite.getComponent(Laya.MeshFilter)) === null || _a === void 0 ? void 0 : _a.sharedMesh;
                    if (mesh && mesh.morphTargetData) {
                        let ownerStr = sprite.getComponent(Laya.SkinnedMeshRenderer) ? "SkinnedMeshRenderer" : "MeshRenderer";
                        let morphData = mesh.morphTargetData;
                        let channelCount = morphData.channelCount;
                        if (outArray.length / timeArray.length == channelCount) {
                            for (let channelIndex = 0; channelIndex < channelCount; channelIndex++) {
                                let morphChannel = morphData.getMorphChannelbyIndex(channelIndex);
                                let channelName = morphChannel.name;
                                let clipNode = {};
                                clipNodes.push(clipNode);
                                clipNode.paths = animaPaths;
                                clipNode.interpolation = sampler.interpolation;
                                clipNode.timeArray = timeArray;
                                clipNode.valueArray = new Float32Array(timeArray.length);
                                for (let i = 0; i < timeArray.length; i++) {
                                    clipNode.valueArray[i] = outArray[i * channelCount + channelIndex];
                                }
                                clipNode.propertyOwner = ownerStr;
                                clipNode.propertise = [];
                                clipNode.propertise.push("morphTargetValues");
                                clipNode.propertise.push(channelName);
                                clipNode.propertyLength = clipNode.propertise.length;
                                clipNode.type = 0;
                                clipNode.callbackFunc = "_changeMorphTargetValue";
                                clipNode.callbackParams = [channelName];
                                clipNode.propertyChangePath = "morphTargetValues";
                                clipNode.duration = clipNode.timeArray[clipNode.timeArray.length - 1];
                                duration = Math.max(duration, clipNode.duration);
                            }
                        }
                    }
                }
                else {
                    let clipNode = {};
                    clipNodes.push(clipNode);
                    clipNode.timeArray = timeArray;
                    clipNode.valueArray = outArray;
                    let interpolation = sampler.interpolation;
                    clipNode.interpolation = interpolation;
                    clipNode.paths = animaPaths;
                    switch (targetPath) {
                        case "translation":
                            clipNode.propertyOwner = "transform";
                            clipNode.propertyLength = 1;
                            clipNode.propertise = [];
                            clipNode.propertise.push("localPosition");
                            clipNode.type = 1;
                            break;
                        case "rotation":
                            clipNode.propertyOwner = "transform";
                            clipNode.propertyLength = 1;
                            clipNode.propertise = [];
                            clipNode.propertise.push("localRotation");
                            clipNode.type = 2;
                            break;
                        case "scale":
                            clipNode.propertyOwner = "transform";
                            clipNode.propertyLength = 1;
                            clipNode.propertise = [];
                            clipNode.propertise.push("localScale");
                            clipNode.type = 3;
                            break;
                    }
                    clipNode.duration = clipNode.timeArray[clipNode.timeArray.length - 1];
                    duration = Math.max(duration, clipNode.duration);
                }
            });
            clip.name = animation.name ? animation.name : `Animation_${this.generateId("Animation")}`;
            clip._duration = duration;
            clip.islooping = true;
            clip._frameRate = 30;
            let nodeCount = clipNodes.length;
            let nodes = clip._nodes;
            nodes.count = nodeCount;
            let nodesMap = clip._nodesMap = {};
            let nodesDic = clip._nodesDic = {};
            for (let i = 0; i < nodeCount; i++) {
                let node = new Laya.KeyframeNode();
                let glTFClipNode = clipNodes[i];
                nodes.setNodeByIndex(i, node);
                node._indexInList = i;
                let type = node.type = glTFClipNode.type;
                let pathLength = glTFClipNode.paths.length;
                node._setOwnerPathCount(pathLength);
                let tempPath = glTFClipNode.paths;
                for (let j = 0; j < pathLength; j++) {
                    node._setOwnerPathByIndex(j, tempPath[j]);
                }
                let nodePath = node._joinOwnerPath("/");
                let mapArray = nodesMap[nodePath];
                (mapArray) || (nodesMap[nodePath] = mapArray = []);
                mapArray.push(node);
                node.propertyOwner = glTFClipNode.propertyOwner;
                let propertyLength = glTFClipNode.propertyLength;
                node._setPropertyCount(propertyLength);
                for (let j = 0; j < propertyLength; j++) {
                    node._setPropertyByIndex(j, glTFClipNode.propertise[j]);
                }
                let fullPath = nodePath + "." + node.propertyOwner + "." + node._joinProperty(".");
                nodesDic[fullPath] = fullPath;
                node.fullPath = fullPath;
                node.callbackFunData = glTFClipNode.callbackFunc;
                node.callParams = glTFClipNode.callbackParams;
                node.propertyChangePath = glTFClipNode.propertyChangePath;
                let keyframeCount = glTFClipNode.timeArray.length;
                for (let j = 0; j < keyframeCount; j++) {
                    switch (type) {
                        case 0:
                            let floatKeyFrame = new Laya.FloatKeyframe();
                            node._setKeyframeByIndex(j, floatKeyFrame);
                            floatKeyFrame.time = glTFClipNode.timeArray[j];
                            switch (glTFClipNode.interpolation) {
                                case "CUBICSPLINE":
                                    {
                                        floatKeyFrame.value = glTFClipNode.valueArray[3 * j + 1];
                                        floatKeyFrame.inTangent = glTFClipNode.valueArray[3 * j + 0];
                                        floatKeyFrame.outTangent = glTFClipNode.valueArray[3 * j + 2];
                                    }
                                    break;
                                case "STEP":
                                    floatKeyFrame.value = glTFClipNode.valueArray[j];
                                    floatKeyFrame.inTangent = Infinity;
                                    floatKeyFrame.outTangent = Infinity;
                                    break;
                                case "LINEAR":
                                default:
                                    {
                                        floatKeyFrame.value = glTFClipNode.valueArray[j];
                                        let lastI = j == 0 ? j : j - 1;
                                        let lastTime = glTFClipNode.timeArray[lastI];
                                        let lastValue = glTFClipNode.valueArray[lastI];
                                        let lastTimeDet = lastI == j ? 1 : (floatKeyFrame.time - lastTime);
                                        floatKeyFrame.inTangent = (floatKeyFrame.value - lastValue) / lastTimeDet;
                                        let nextI = j == keyframeCount - 1 ? j : j + 1;
                                        let nextTime = glTFClipNode.timeArray[nextI];
                                        let nextValue = glTFClipNode.valueArray[nextI];
                                        let nextTimeDet = nextI == j ? 1 : (nextTime - floatKeyFrame.time);
                                        floatKeyFrame.outTangent = (nextValue - floatKeyFrame.value) / nextTimeDet;
                                        if (lastI == j) {
                                            floatKeyFrame.inTangent = floatKeyFrame.outTangent;
                                        }
                                        if (nextI == j) {
                                            floatKeyFrame.outTangent = floatKeyFrame.inTangent;
                                        }
                                    }
                                    break;
                            }
                            break;
                        case 1:
                        case 3:
                        case 4:
                            let floatArrayKeyframe = new Laya.Vector3Keyframe();
                            node._setKeyframeByIndex(j, floatArrayKeyframe);
                            let startTimev3 = floatArrayKeyframe.time = glTFClipNode.timeArray[j];
                            let inTangent = floatArrayKeyframe.inTangent;
                            let outTangent = floatArrayKeyframe.outTangent;
                            let value = floatArrayKeyframe.value;
                            switch (glTFClipNode.interpolation) {
                                case "CUBICSPLINE":
                                    value.setValue(glTFClipNode.valueArray[9 * j + 3], glTFClipNode.valueArray[9 * j + 4], glTFClipNode.valueArray[9 * j + 5]);
                                    inTangent.setValue(glTFClipNode.valueArray[9 * j + 0], glTFClipNode.valueArray[9 * j + 1], glTFClipNode.valueArray[9 * j + 2]);
                                    outTangent.setValue(glTFClipNode.valueArray[9 * j + 6], glTFClipNode.valueArray[9 * j + 7], glTFClipNode.valueArray[9 * j + 8]);
                                    break;
                                case "STEP":
                                    value.setValue(glTFClipNode.valueArray[3 * j], glTFClipNode.valueArray[3 * j + 1], glTFClipNode.valueArray[3 * j + 2]);
                                    inTangent.setValue(Infinity, Infinity, Infinity);
                                    outTangent.setValue(Infinity, Infinity, Infinity);
                                    break;
                                case "LINEAR":
                                default:
                                    {
                                        value.setValue(glTFClipNode.valueArray[3 * j], glTFClipNode.valueArray[3 * j + 1], glTFClipNode.valueArray[3 * j + 2]);
                                        let lastI = j == 0 ? j : j - 1;
                                        let lastTime = glTFClipNode.timeArray[lastI];
                                        let lastX = glTFClipNode.valueArray[3 * lastI];
                                        let lastY = glTFClipNode.valueArray[3 * lastI + 1];
                                        let lastZ = glTFClipNode.valueArray[3 * lastI + 2];
                                        let lastTimeDet = lastI == j ? 1 : startTimev3 - lastTime;
                                        inTangent.x = (value.x - lastX) / lastTimeDet;
                                        inTangent.y = (value.y - lastY) / lastTimeDet;
                                        inTangent.z = (value.z - lastZ) / lastTimeDet;
                                        let nextI = j == keyframeCount - 1 ? j : j + 1;
                                        let nextTime = glTFClipNode.timeArray[nextI];
                                        let nextX = glTFClipNode.valueArray[3 * nextI];
                                        let nextY = glTFClipNode.valueArray[3 * nextI + 1];
                                        let nextZ = glTFClipNode.valueArray[3 * nextI + 2];
                                        let nestTimeDet = nextI == j ? 1 : nextTime - startTimev3;
                                        outTangent.x = (nextX - value.x) / nestTimeDet;
                                        outTangent.y = (nextY - value.y) / nestTimeDet;
                                        outTangent.z = (nextZ - value.z) / nestTimeDet;
                                        if (lastI == j) {
                                            outTangent.cloneTo(inTangent);
                                        }
                                        if (nextI == j) {
                                            inTangent.cloneTo(outTangent);
                                        }
                                    }
                                    break;
                            }
                            break;
                        case 2:
                            let quaternionKeyframe = new Laya.QuaternionKeyframe();
                            node._setKeyframeByIndex(j, quaternionKeyframe);
                            let startTimeQu = quaternionKeyframe.time = glTFClipNode.timeArray[j];
                            let inTangentQua = quaternionKeyframe.inTangent;
                            let outTangentQua = quaternionKeyframe.outTangent;
                            let valueQua = quaternionKeyframe.value;
                            switch (glTFClipNode.interpolation) {
                                case "CUBICSPLINE":
                                    valueQua.set(glTFClipNode.valueArray[12 * j + 4], glTFClipNode.valueArray[12 * j + 5], glTFClipNode.valueArray[12 * j + 6], glTFClipNode.valueArray[12 * j + 7]);
                                    inTangentQua.setValue(glTFClipNode.valueArray[12 * j + 0], glTFClipNode.valueArray[12 * j + 1], glTFClipNode.valueArray[12 * j + 2], glTFClipNode.valueArray[12 * j + 3]);
                                    outTangentQua.setValue(glTFClipNode.valueArray[12 * j + 8], glTFClipNode.valueArray[12 * j + 9], glTFClipNode.valueArray[12 * j + 10], glTFClipNode.valueArray[12 * j + 11]);
                                    break;
                                case "STEP":
                                    valueQua.set(glTFClipNode.valueArray[4 * j + 0], glTFClipNode.valueArray[4 * j + 1], glTFClipNode.valueArray[4 * j + 2], glTFClipNode.valueArray[4 * j + 3]);
                                    inTangentQua.setValue(Infinity, Infinity, Infinity, Infinity);
                                    outTangentQua.setValue(Infinity, Infinity, Infinity, Infinity);
                                    break;
                                case "LINEAR":
                                default:
                                    {
                                        valueQua.set(glTFClipNode.valueArray[4 * j + 0], glTFClipNode.valueArray[4 * j + 1], glTFClipNode.valueArray[4 * j + 2], glTFClipNode.valueArray[4 * j + 3]);
                                        let lastI = j == 0 ? j : j - 1;
                                        let lastTime = glTFClipNode.timeArray[lastI];
                                        let lastX = glTFClipNode.valueArray[4 * lastI];
                                        let lastY = glTFClipNode.valueArray[4 * lastI + 1];
                                        let lastZ = glTFClipNode.valueArray[4 * lastI + 2];
                                        let lastW = glTFClipNode.valueArray[4 * lastI + 3];
                                        let lastTimeDet = lastI == j ? 1 : startTimeQu - lastTime;
                                        inTangentQua.x = (valueQua.x - lastX) / lastTimeDet;
                                        inTangentQua.y = (valueQua.y - lastY) / lastTimeDet;
                                        inTangentQua.z = (valueQua.z - lastZ) / lastTimeDet;
                                        inTangentQua.w = (valueQua.w - lastW) / lastTimeDet;
                                        let nextI = j == keyframeCount - 1 ? j : j + 1;
                                        let nextTime = glTFClipNode.timeArray[nextI];
                                        let nextX = glTFClipNode.valueArray[4 * nextI];
                                        let nextY = glTFClipNode.valueArray[4 * nextI + 1];
                                        let nextZ = glTFClipNode.valueArray[4 * nextI + 2];
                                        let nextW = glTFClipNode.valueArray[4 * nextI + 3];
                                        if ((valueQua.x * nextX + valueQua.y * nextY + valueQua.z * nextZ + valueQua.w * nextW) < 0) {
                                            nextX *= -1;
                                            nextY *= -1;
                                            nextZ *= -1;
                                            nextW *= -1;
                                            glTFClipNode.valueArray[4 * nextI] = nextX;
                                            glTFClipNode.valueArray[4 * nextI + 1] = nextY;
                                            glTFClipNode.valueArray[4 * nextI + 2] = nextZ;
                                            glTFClipNode.valueArray[4 * nextI + 3] = nextW;
                                        }
                                        let nestTimeDet = nextI == j ? 1 : nextTime - startTimeQu;
                                        outTangentQua.x = (nextX - valueQua.x) / nestTimeDet;
                                        outTangentQua.y = (nextY - valueQua.y) / nestTimeDet;
                                        outTangentQua.z = (nextZ - valueQua.z) / nestTimeDet;
                                        outTangentQua.w = (nextW - valueQua.w) / nestTimeDet;
                                        if (lastI == j) {
                                            outTangentQua.cloneTo(inTangentQua);
                                        }
                                        if (nextI == j) {
                                            inTangentQua.cloneTo(outTangentQua);
                                        }
                                    }
                                    break;
                            }
                            break;
                    }
                }
            }
            clipNodes = null;
            return clip;
        }
    }
    glTFResource._Extensions = {};
    class PrimitiveSubMesh {
        constructor() {
        }
    }
    Laya.Laya.addInitCallback(() => glTFShader.init());

    const ExtensionName$a = "KHR_texture_transform";
    const translation = new Laya.Matrix3x3();
    const rotation = new Laya.Matrix3x3();
    const offset = new Laya.Vector2;
    const scale = new Laya.Vector2;
    class KHR_texture_transform {
        constructor(resource) {
            this.name = ExtensionName$a;
            this._resource = resource;
        }
        createTransform(extension) {
            var _a;
            offset.setValue(0, 0);
            if (extension.offset) {
                offset.fromArray(extension.offset);
            }
            Laya.Matrix3x3.createFromTranslation(offset, translation);
            let rot = (_a = extension.rotation) !== null && _a !== void 0 ? _a : 0;
            Laya.Matrix3x3.createFromRotation(-rot, rotation);
            scale.setValue(1, 1);
            if (extension.scale) {
                scale.fromArray(extension.scale);
            }
            let trans = new Laya.Matrix3x3();
            Laya.Matrix3x3.multiply(translation, rotation, trans);
            trans.scale(scale, trans);
            return trans;
        }
        loadExtensionTextureInfo(info) {
            var _a;
            let extension = (_a = info.extensions) === null || _a === void 0 ? void 0 : _a.KHR_texture_transform;
            let trans = this.createTransform(extension);
            let texCoord = extension.texCoord;
            return {
                transform: trans,
                texCoord: texCoord
            };
        }
    }
    glTFResource.registerExtension(ExtensionName$a, (resource) => new KHR_texture_transform(resource));

    const ExtensionName$9 = "KHR_materials_anisotropy";
    class KHR_materials_anisotropy {
        constructor(resource) {
            this.name = ExtensionName$9;
            this._resource = resource;
        }
        loadAdditionTextures(basePath, progress) {
            let materials = this._resource.data.materials;
            let textures = this._resource.data.textures;
            if (materials && textures) {
                let promises = [];
                materials.forEach(material => {
                    var _a;
                    let extension = (_a = material.extensions) === null || _a === void 0 ? void 0 : _a.KHR_materials_anisotropy;
                    if (extension) {
                        if (extension.anisotropyTexture) {
                            let promise = this._resource.loadTextureFromInfo(extension.anisotropyTexture, false, basePath, progress);
                            promises.push(promise);
                        }
                    }
                });
                return Promise.all(promises);
            }
            else {
                return Promise.resolve();
            }
        }
        additionMaterialProperties(glTFMaterial, material) {
            var _a, _b;
            let extension = glTFMaterial.extensions.KHR_materials_anisotropy;
            let anisotropy = (_a = extension.anisotropyStrength) !== null && _a !== void 0 ? _a : 0.0;
            let rotation = (_b = extension.anisotropyRotation) !== null && _b !== void 0 ? _b : 0.0;
            material.setDefine(Laya.PBRShaderLib.DEFINE_ANISOTROPY, true);
            material.setFloat("u_AnisotropyStrength", anisotropy);
            material.setFloat("u_AnisotropyRotation", rotation);
            if (extension.anisotropyTexture) {
                let tex = this._resource.getTextureWithInfo(extension.anisotropyTexture);
                material.setTexture("u_AnisotropyTexture", tex);
                material.setDefine(glTFShader.Define_AnisotropyMap, true);
            }
        }
    }
    glTFResource.registerExtension(ExtensionName$9, (resource) => new KHR_materials_anisotropy(resource));

    const ExtensionName$8 = "KHR_materials_clearcoat";
    class KHR_materials_clearcoat {
        constructor(resource) {
            this.name = ExtensionName$8;
            this._resource = resource;
        }
        loadAdditionTextures(basePath, progress) {
            let materials = this._resource.data.materials;
            let textures = this._resource.data.textures;
            if (materials && textures) {
                let promises = [];
                materials.forEach(material => {
                    var _a;
                    let extension = (_a = material.extensions) === null || _a === void 0 ? void 0 : _a.KHR_materials_clearcoat;
                    if (extension) {
                        if (extension.clearcoatTexture) {
                            let promise = this._resource.loadTextureFromInfo(extension.clearcoatTexture, false, basePath, progress);
                            promises.push(promise);
                        }
                        if (extension.clearcoatRoughnessTexture) {
                            let promise = this._resource.loadTextureFromInfo(extension.clearcoatRoughnessTexture, false, basePath, progress);
                            promises.push(promise);
                        }
                        if (extension.clearcoatNormalTexture) {
                            let promise = this._resource.loadTextureFromInfo(extension.clearcoatNormalTexture, false, basePath, progress);
                            promises.push(promise);
                        }
                    }
                });
                return Promise.all(promises);
            }
            else {
                return Promise.resolve();
            }
        }
        additionMaterialProperties(glTFMaterial, material) {
            var _a, _b, _c;
            let extension = glTFMaterial.extensions.KHR_materials_clearcoat;
            let clearCoat = (_a = extension.clearcoatFactor) !== null && _a !== void 0 ? _a : 0.0;
            let clearCoatRoughness = (_b = extension.clearcoatRoughnessFactor) !== null && _b !== void 0 ? _b : 0.0;
            material.setDefine(Laya.PBRShaderLib.DEFINE_CLEARCOAT, true);
            material.setFloat("u_ClearCoatFactor", clearCoat);
            if (extension.clearcoatTexture) {
                this._resource.setMaterialTextureProperty(material, extension.clearcoatTexture, "u_ClearCoatTexture", glTFShader.Define_ClearCoatMap, "u_ClearCoatMapTransform", glTFShader.Define_ClearCoatMapTransform);
            }
            material.setFloat("u_ClearCoatRoughness", clearCoatRoughness);
            if (extension.clearcoatRoughnessTexture) {
                this._resource.setMaterialTextureProperty(material, extension.clearcoatRoughnessTexture, "u_ClearCoatRoughnessTexture", glTFShader.Define_ClearCoatRoughnessMap, "u_ClearCoatRoughnessMapTransform", glTFShader.Define_ClearCoatRoughnessMapTransform);
            }
            if (extension.clearcoatNormalTexture) {
                material.setDefine(Laya.PBRShaderLib.DEFINE_CLEARCOAT_NORMAL, true);
                this._resource.setMaterialTextureProperty(material, extension.clearcoatNormalTexture, "u_ClearCoatNormalTexture", null, "u_ClearCoatNormalMapTransform", glTFShader.Define_ClearCoatNormalMapTransform);
                let scale = (_c = extension.clearcoatNormalTexture.scale) !== null && _c !== void 0 ? _c : 1.0;
                material.setFloat("u_ClearCoatNormalScale", scale);
            }
        }
    }
    glTFResource.registerExtension(ExtensionName$8, (resource) => new KHR_materials_clearcoat(resource));

    const ExtensionName$7 = "KHR_materials_emissive_strength";
    class KHR_materials_emissive_strength {
        constructor(resource) {
            this.name = ExtensionName$7;
            this._resource = resource;
        }
        additionMaterialProperties(glTFMaterial, material) {
            var _a;
            let extension = glTFMaterial.extensions.KHR_materials_emissive_strength;
            let emissionStrength = (_a = extension.emissiveStrength) !== null && _a !== void 0 ? _a : 1.0;
            material.setFloat("u_EmissionStrength", emissionStrength);
        }
    }
    glTFResource.registerExtension(ExtensionName$7, (resource) => new KHR_materials_emissive_strength(resource));

    const ExtensionName$6 = "KHR_materials_ior";
    class KHR_materials_ior {
        constructor(resource) {
            this.name = ExtensionName$6;
            this._resource = resource;
        }
        additionMaterialProperties(glTFMaterial, material) {
            var _a;
            let extension = glTFMaterial.extensions.KHR_materials_ior;
            let ior = (_a = extension.ior) !== null && _a !== void 0 ? _a : 1.5;
            material.setDefine(Laya.PBRShaderLib.DEFINE_IOR, true);
            material.setFloat("u_Ior", ior);
        }
    }
    glTFResource.registerExtension(ExtensionName$6, (resource) => new KHR_materials_ior(resource));

    const ExtensionName$5 = "KHR_materials_iridescence";
    class KHR_materials_iridescence {
        constructor(resource) {
            this.name = ExtensionName$5;
            this._resource = resource;
        }
        loadAdditionTextures(basePath, progress) {
            let materials = this._resource.data.materials;
            let textures = this._resource.data.textures;
            if (materials && textures) {
                let promises = [];
                materials.forEach(material => {
                    var _a;
                    let extension = (_a = material.extensions) === null || _a === void 0 ? void 0 : _a.KHR_materials_iridescence;
                    if (extension) {
                        if (extension.iridescenceTexture) {
                            let promise = this._resource.loadTextureFromInfo(extension.iridescenceTexture, false, basePath, progress);
                            promises.push(promise);
                        }
                        if (extension.iridescenceThicknessTexture) {
                            let promise = this._resource.loadTextureFromInfo(extension.iridescenceThicknessTexture, false, basePath, progress);
                            promises.push(promise);
                        }
                    }
                });
                return Promise.all(promises);
            }
            else {
                return Promise.resolve();
            }
        }
        additionMaterialProperties(glTFMaterial, material) {
            var _a, _b, _c, _d;
            let extension = glTFMaterial.extensions.KHR_materials_iridescence;
            let factor = (_a = extension.iridescenceFactor) !== null && _a !== void 0 ? _a : 0.0;
            let ior = (_b = extension.iridescenceIor) !== null && _b !== void 0 ? _b : 1.3;
            let thicknessMin = (_c = extension.iridescenceThicknessMinimum) !== null && _c !== void 0 ? _c : 100;
            let thicknessMax = (_d = extension.iridescenceThicknessMaximum) !== null && _d !== void 0 ? _d : 400;
            material.setDefine(Laya.PBRShaderLib.DEFINE_IRIDESCENCE, true);
            material.setFloat("u_IridescenceFactor", factor);
            material.setFloat("u_IridescenceIor", ior);
            material.setFloat("u_IridescenceThicknessMinimum", thicknessMin);
            material.setFloat("u_IridescenceThicknessMaximum", thicknessMax);
            if (extension.iridescenceTexture) {
                this._resource.setMaterialTextureProperty(material, extension.iridescenceTexture, "u_IridescenceTexture", glTFShader.Define_IridescenceMap, "u_IridescenceMapTransform", glTFShader.Define_IridescenceMapTransform);
            }
            if (extension.iridescenceThicknessTexture) {
                this._resource.setMaterialTextureProperty(material, extension.iridescenceThicknessTexture, "u_IridescenceThicknessTexture", glTFShader.Define_IridescenceThicknessMap, "u_IridescenceThicknessMapTransform", glTFShader.Define_IridescenceThicknessMapTransform);
            }
        }
    }
    glTFResource.registerExtension(ExtensionName$5, (resource) => new KHR_materials_iridescence(resource));

    const ExtensionName$4 = "KHR_materials_sheen";
    class KHR_materials_sheen {
        constructor(resource) {
            this.name = ExtensionName$4;
            this._resource = resource;
        }
        loadAdditionTextures(basePath, progress) {
            let materials = this._resource.data.materials;
            let textures = this._resource.data.textures;
            if (materials && textures) {
                let promises = [];
                materials.forEach(material => {
                    var _a;
                    let extension = (_a = material.extensions) === null || _a === void 0 ? void 0 : _a.KHR_materials_sheen;
                    if (extension) {
                        if (extension.sheenColorTexture) {
                            let sRGB = false;
                            let promise = this._resource.loadTextureFromInfo(extension.sheenColorTexture, sRGB, basePath, progress);
                            promises.push(promise);
                        }
                        if (extension.sheenRoughnessTexture) {
                            let sRGB = false;
                            let promise = this._resource.loadTextureFromInfo(extension.sheenRoughnessTexture, sRGB, basePath, progress);
                            promises.push(promise);
                        }
                    }
                });
                return Promise.all(promises);
            }
            else {
                return Promise.resolve();
            }
        }
        additionMaterialProperties(glTFMaterial, material) {
            var _a;
            let extension = glTFMaterial.extensions.KHR_materials_sheen;
            material.setDefine(Laya.PBRShaderLib.DEFINE_SHEEN, true);
            let sheenColorFactor = new Laya.Vector3(0, 0, 0);
            if (extension.sheenColorFactor) {
                sheenColorFactor.fromArray(extension.sheenColorFactor);
            }
            let sheenRoughnessFactor = (_a = extension.sheenRoughnessFactor) !== null && _a !== void 0 ? _a : 0.0;
            material.setVector3("u_SheenColorFactor", sheenColorFactor);
            material.setFloat("u_SheenRoughness", sheenRoughnessFactor);
            if (extension.sheenColorTexture) {
                this._resource.setMaterialTextureProperty(material, extension.sheenColorTexture, "u_SheenColorTexture", glTFShader.Define_SheenColorMap, "u_SheenColorMapTransform", glTFShader.Define_SheenColorMapTransform);
            }
            if (extension.sheenRoughnessTexture) {
                this._resource.setMaterialTextureProperty(material, extension.sheenRoughnessTexture, "u_SheenRoughnessTexture", glTFShader.Define_SheenRoughnessMap, "u_SheenRoughnessMapTransform", glTFShader.Define_SheenRoughnessMapTransform);
            }
        }
    }
    glTFResource.registerExtension(ExtensionName$4, (resource) => new KHR_materials_sheen(resource));

    const ExtensionName$3 = "KHR_materials_transmission";
    class KHR_materials_transmission {
        constructor(resource) {
            this.name = ExtensionName$3;
            this._resource = resource;
        }
        loadAdditionTextures(basePath, progress) {
            let materials = this._resource.data.materials;
            let textures = this._resource.data.textures;
            if (materials && textures) {
                let promises = [];
                materials.forEach(material => {
                    var _a;
                    let extension = (_a = material.extensions) === null || _a === void 0 ? void 0 : _a.KHR_materials_transmission;
                    if (extension) {
                        if (extension.transmissionTexture) {
                            let sRGB = false;
                            let promise = this._resource.loadTextureFromInfo(extension.transmissionTexture, sRGB, basePath, progress);
                            promises.push(promise);
                        }
                    }
                });
                return Promise.all(promises);
            }
            else {
                return Promise.resolve();
            }
        }
        additionMaterialProperties(glTFMaterial, material) {
            var _a;
            let extension = glTFMaterial.extensions.KHR_materials_transmission;
            let transmissionFactor = (_a = extension.transmissionFactor) !== null && _a !== void 0 ? _a : 0.0;
            material.materialRenderMode = Laya.MaterialRenderMode.RENDERMODE_CUSTOME;
            material.renderQueue = 3000;
            material.setDefine(Laya.PBRShaderLib.DEFINE_TRANSMISSION, true);
            material.setFloat("u_TransmissionFactor", transmissionFactor);
            if (extension.transmissionTexture) {
                this._resource.setMaterialTextureProperty(material, extension.transmissionTexture, "u_TransmissionTexture", glTFShader.Define_TransmissionMap, "u_TransmissionMapTransform", glTFShader.Define_TransmissionMapTransform);
            }
        }
    }
    glTFResource.registerExtension(ExtensionName$3, (resource) => new KHR_materials_transmission(resource));

    const ExtensionName$2 = "KHR_materials_volume";
    class KHR_materials_volume {
        constructor(resource) {
            this.name = ExtensionName$2;
            this._resource = resource;
        }
        loadAdditionTextures(basePath, progress) {
            let materials = this._resource.data.materials;
            let textures = this._resource.data.textures;
            if (materials && textures) {
                let promises = [];
                materials.forEach(material => {
                    var _a;
                    let extension = (_a = material.extensions) === null || _a === void 0 ? void 0 : _a.KHR_materials_volume;
                    if (extension) {
                        if (extension.thicknessTexture) {
                            let sRGB = false;
                            let promise = this._resource.loadTextureFromInfo(extension.thicknessTexture, sRGB, basePath, progress);
                            promises.push(promise);
                        }
                    }
                });
                return Promise.all(promises);
            }
            else {
                return Promise.resolve();
            }
        }
        additionMaterialProperties(glTFMaterial, material) {
            var _a, _b;
            let extension = glTFMaterial.extensions.KHR_materials_volume;
            material.setDefine(Laya.PBRShaderLib.DEFINE_THICKNESS, true);
            let thicknessFactor = (_a = extension.thicknessFactor) !== null && _a !== void 0 ? _a : 0.0;
            let attenuationDistance = (_b = extension.attenuationDistance) !== null && _b !== void 0 ? _b : 65504.0;
            material.setFloat("u_VolumeThicknessFactor", thicknessFactor);
            material.setFloat("u_VolumeAttenuationDistance", attenuationDistance);
            let attenuationColor = new Laya.Vector3(1, 1, 1);
            if (extension.attenuationColor) {
                attenuationColor.fromArray(extension.attenuationColor);
            }
            material.setVector3("u_VolumeAttenuationColor", attenuationColor);
            if (extension.thicknessTexture) {
                this._resource.setMaterialTextureProperty(material, extension.thicknessTexture, "u_VolumeThicknessTexture", glTFShader.Define_VolumeThicknessMap, "u_VoluemThicknessMapTransform", glTFShader.Define_VolumeThicknessMapTransform);
            }
        }
    }
    glTFResource.registerExtension(ExtensionName$2, (resource) => new KHR_materials_volume(resource));

    const ExtensionName$1 = "KHR_materials_specular";
    class KHR_materials_specular {
        constructor(resource) {
            this.name = ExtensionName$1;
            this._resource = resource;
        }
        loadAdditionTextures(basePath, progress) {
            let promises = [];
            let materials = this._resource.data.materials;
            let textures = this._resource.data.textures;
            if (materials && textures) {
                materials.forEach(material => {
                    var _a;
                    let extension = (_a = material.extensions) === null || _a === void 0 ? void 0 : _a.KHR_materials_specular;
                    if (extension) {
                        if (extension.specularTexture) {
                            let sRGB = false;
                            let promise = this._resource.loadTextureFromInfo(extension.specularTexture, sRGB, basePath, progress);
                            promises.push(promise);
                        }
                        if (extension.specularColorTexture) {
                            let sRGB = true;
                            let promise = this._resource.loadTextureFromInfo(extension.specularColorTexture, sRGB, basePath, progress);
                            promises.push(promise);
                        }
                    }
                });
            }
            return Promise.all(promises);
        }
        additionMaterialProperties(glTFMaterial, material) {
            var _a;
            let extension = glTFMaterial.extensions.KHR_materials_specular;
            let specularFactor = (_a = extension.specularFactor) !== null && _a !== void 0 ? _a : 1.0;
            let specularColorFactor = new Laya.Vector3(1.0, 1.0, 1.0);
            if (extension.specularColorFactor) {
                specularColorFactor.fromArray(extension.specularColorFactor);
            }
            material.setDefine(Laya.Shader3D.getDefineByName("SPECULAR"), true);
            material.setFloat("u_SpecularFactor", specularFactor);
            material.setVector3("u_SpecularColorFactor", specularColorFactor);
            if (extension.specularTexture) {
                this._resource.setMaterialTextureProperty(material, extension.specularTexture, "u_SpecularFactorTexture", glTFShader.Define_SpecularFactorMap, "u_SpecularFactorMapTransfrom", glTFShader.Define_SpecularFactorMapTransform);
            }
            if (extension.specularColorTexture) {
                this._resource.setMaterialTextureProperty(material, extension.specularColorTexture, "u_SpecularColorTexture", glTFShader.Define_SpecularColorMap, "u_SpecularColorMapTransform", glTFShader.Define_SpecularColorMapTransform);
            }
        }
    }
    glTFResource.registerExtension(ExtensionName$1, (resource) => new KHR_materials_specular(resource));

    const ExtensionName = "KHR_materials_unlit";
    class KHR_materials_unlit {
        constructor(resource) {
            this.name = ExtensionName;
            this._resource = resource;
        }
        createMaterial(glTFMaterial) {
            let unlit = new Laya.UnlitMaterial();
            let pbrMetallicRoughness = glTFMaterial.pbrMetallicRoughness;
            if (pbrMetallicRoughness) {
                if (pbrMetallicRoughness.baseColorFactor) {
                    let color = unlit.albedoColor;
                    color.fromArray(pbrMetallicRoughness.baseColorFactor);
                    color.toGamma(color);
                    unlit.albedoColor = color;
                }
                if (pbrMetallicRoughness.baseColorTexture) {
                    unlit.albedoTexture = this._resource.getTextureWithInfo(pbrMetallicRoughness.baseColorTexture);
                }
            }
            this._resource.applyMaterialRenderState(glTFMaterial, unlit);
            return unlit;
        }
    }
    glTFResource.registerExtension(ExtensionName, (resource) => new KHR_materials_unlit(resource));

    class glTFLoader {
        load(task) {
            return task.loader.fetch(task.url, "json", task.progress.createCallback(0.5), task.options).then((data) => {
                let glTF = new glTFResource();
                return glTF._parse(data, task.url, task.progress).then(() => glTF);
            });
        }
    }
    Laya.Loader.registerLoader(["gltf"], glTFLoader);
    class glbLoader {
        load(task) {
            return task.loader.fetch(task.url, "arraybuffer", task.progress.createCallback(0.5), task.options).then((data) => {
                let glTF = new glTFResource();
                return glTF._parseglb(data, task.url, task.progress).then(() => glTF);
            });
        }
    }
    Laya.Loader.registerLoader(["glb"], glbLoader);

    exports.KHR_materials_anisotropy = KHR_materials_anisotropy;
    exports.KHR_materials_clearcoat = KHR_materials_clearcoat;
    exports.KHR_materials_emissive_strength = KHR_materials_emissive_strength;
    exports.KHR_materials_ior = KHR_materials_ior;
    exports.KHR_materials_iridescence = KHR_materials_iridescence;
    exports.KHR_materials_sheen = KHR_materials_sheen;
    exports.KHR_materials_specular = KHR_materials_specular;
    exports.KHR_materials_transmission = KHR_materials_transmission;
    exports.KHR_materials_unlit = KHR_materials_unlit;
    exports.KHR_materials_volume = KHR_materials_volume;
    exports.KHR_texture_transform = KHR_texture_transform;
    exports.glTFResource = glTFResource;
    exports.glTFShader = glTFShader;

})(window.Laya = window.Laya || {}, Laya);
//# sourceMappingURL=laya.gltf.js.map
