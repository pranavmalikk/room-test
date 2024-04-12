// import React, { useRef, useEffect, useState, useCallback } from 'react';
// import { useThree, extend, ReactThreeFiber, useFrame } from '@react-three/fiber';
// import { OrbitControls } from "@react-three/drei";
// import { useControls } from 'leva';
// import { Perf } from 'r3f-perf';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
// import { TextureLoader, Texture, MeshPhysicalMaterial, MeshStandardMaterial, Mesh, 
//   Group, CubeTextureLoader, EquirectangularReflectionMapping } from 'three';
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
// import { debounce } from 'lodash';
// import { createFloorAndWalls } from './objectFloorAndWalls';
// import { floorAndWalls } from './objectConstant';

// // @ts-ignore
// import { SSGIEffect, HBAOEffect, MotionBlurEffect, TRAAEffect, VelocityDepthNormalPass } from 'realism-effects';
// import {
//   EffectComposer as PostEffectsComposer,
//   EffectPass as PostEffectPass,
//   RenderPass as PostRenderPass,
//   SMAAEffect,
//   SMAAPreset,
//   EdgeDetectionMode,
//   PredicationMode,
// } from 'postprocessing';

// extend({
//   PostRenderPass,
//   PostEffectPass,
//   SSGIEffect,
//   HBAOEffect,
//   MotionBlurEffect,
//   TRAAEffect,
//   VelocityDepthNormalPass,
//   // SharpnessEffect,
//   PostEffectsComposer,
// });

// declare module '@react-three/fiber' {
//   interface ThreeElements {
//     velocityDepthNormalPass: ReactThreeFiber.Node<VelocityDepthNormalPass, typeof VelocityDepthNormalPass>;
//     sSGIEffect: ReactThreeFiber.Node<SSGIEffect, typeof SSGIEffect>;
//     hBAOEffect: ReactThreeFiber.Node<HBAOEffect, typeof HBAOEffect>;
//     motionBlurEffect: ReactThreeFiber.Node<MotionBlurEffect, typeof MotionBlurEffect>;
//     tRAAEffect: ReactThreeFiber.Node<TRAAEffect, typeof TRAAEffect>;
//     // sharpnessEffect: ReactThreeFiber.Node<SharpnessEffect, typeof SharpnessEffect>;
//     postEffectsComposer: ReactThreeFiber.Node<PostEffectsComposer, typeof PostEffectsComposer>;
//     postRenderPass: ReactThreeFiber.Node<PostRenderPass, typeof PostRenderPass>;
//     postEffectPass: ReactThreeFiber.Node<PostEffectPass, typeof PostEffectPass>;
//   }
// }

// const Scene = () => {
//   const { performance } = useControls('Monitoring', {
//     performance: false,
//   });

//   const { scene, camera, size } = useThree();
//   const [envMapIntensity, setEnvMapIntensity] = useState(1);
//   const { floorXLength, floorZLength, wallHeight, wallThickness, roundRadius, roundSegments, ny } = floorAndWalls;
//   const { groupConstruction, groupConstructionBoxHelper } = createFloorAndWalls(envMapIntensity);

//   useEffect(() => {
//     scene.backgroundBlurriness = 0;
//     scene.backgroundIntensity = 1;
//   }, [scene]);

//   useControls('Environment', {
//     envMapIntensity: {
//       value: envMapIntensity,
//       min: 0,
//       max: 3,
//       step: 0.001,
//       onChange: (value) => {
//         setEnvMapIntensity(value);
//         updateAllMaterials();
//       },
//     },
//     backgroundBlurriness: {
//       value: scene.backgroundBlurriness,
//       min: 0,
//       max: 0.2,
//       step: 0.001,
//       onChange: (value) => {
//         scene.backgroundBlurriness = value;
//       },
//     },
//     backgroundIntensity: {
//       value: scene.backgroundIntensity,
//       min: 0,
//       max: 5,
//       step: 0.001,
//       onChange: (value) => {
//         scene.backgroundIntensity = value;
//       },
//     },
//   });

//   const couch = "/17988333-b8c0-4a0a-8576-506ad93270db/model-transformed.glb";
//   const lightFixture = "/16897720-b5f1-44e1-9ac9-e7d06c484684/model-transformed.glb"
//   const painted_metal = "/acg_painted_metal_012";

//   const [couchModel, setCouchModel] = useState<Group | null>(null);
//   const [lightFixtureModel, setLightFixtureModel] = useState<Group | null>(null);

//   const [modelsLoaded, setModelsLoaded] = useState(false);
//   const [couchLoaded, setCouchLoaded] = useState(false);
//   const [lightFixtureLoaded, setLightFixtureLoaded] = useState(false);


//   const gl = useThree(({ gl }) => gl);

//   // useEffect(() => {
//   //   if (couchLoaded && lightFixtureLoaded) {
//   //     setModelsLoaded(true);
//   //   }
//   // }, [couchLoaded, lightFixtureLoaded]);

//   useEffect(() => {
//   if (couchModel && lightFixtureModel) {
//     groupConstruction.add(couchModel);
//     groupConstruction.add(lightFixtureModel);
//   }
// }, [couchModel, lightFixtureModel, groupConstruction]);

//   const texturePaths = {
//     baseColor: `${painted_metal}/basecolor.png`,
//     diffuseMap: `${painted_metal}/diffuse.png`,
//     displacementMap: `${painted_metal}/displacement.png`,
//     heightMap: `${painted_metal}/height.png`,
//     metallicMap: `${painted_metal}/metallic.png`,
//     normalMap: `${painted_metal}/normal.png`,
//     opacityMap: `${painted_metal}/opacity.png`,
//     roughnessMap: `${painted_metal}/roughness.png`,
//     specularMap: `${painted_metal}/specular.png`,
//   };

//   useEffect(() => {
//     const textureLoader = new TextureLoader();
//     const textures = {
//       baseColor: textureLoader.load(texturePaths.baseColor),
//       diffuseMap: textureLoader.load(texturePaths.diffuseMap),
//       displacementMap: textureLoader.load(texturePaths.displacementMap),
//       heightMap: textureLoader.load(texturePaths.heightMap),
//       metallicMap: textureLoader.load(texturePaths.metallicMap),
//       normalMap: textureLoader.load(texturePaths.normalMap),
//       opacityMap: textureLoader.load(texturePaths.opacityMap),
//       roughnessMap: textureLoader.load(texturePaths.roughnessMap),
//       specularMap: textureLoader.load(texturePaths.specularMap),
//     };

//     const loader = new GLTFLoader();

//     const dracoLoader = new DRACOLoader();
//     dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
//     loader.setDRACOLoader(dracoLoader);

//     const rgbeLoader = new RGBELoader();
//     rgbeLoader.load('/img/metro_noord_4k.hdr', (texture) => {
//       texture.mapping = EquirectangularReflectionMapping;
//       scene.background = texture;
//       scene.environment = texture;
//     });
    
//     loader.load(couch, (gltf) => {
//       gltf.scene.traverse((obj) => {
//         if (obj instanceof Mesh) {
//           obj.material = new MeshPhysicalMaterial({
//             map: textureLoader.load(texturePaths.baseColor),
//             normalMap: textureLoader.load(texturePaths.normalMap),
//             roughnessMap: textureLoader.load(texturePaths.roughnessMap),
//             metalnessMap: textureLoader.load(texturePaths.metallicMap),
//             alphaMap: textureLoader.load(texturePaths.opacityMap),
//             transparent: true,
//             clearcoat: 0.5,
//             clearcoatRoughness: 0.5,
//           });
//           obj.rotation.y = -Math.PI / 2;
//         }        
//       });
//       gltf.scene.position.set(floorXLength / 2 + 10, 0.01, floorZLength / 2 - 5);
//       gltf.scene.scale.set(3, 3, 3);
//       gltf.scene.receiveShadow = true;
//       gltf.scene.castShadow = true;
//       setCouchModel(gltf.scene);
//     }, undefined, (error) => {
//       console.error(error);
//     });

//     loader.load(lightFixture, (gltf) => {
//       gltf.scene.traverse((obj) => {
//         if (obj instanceof Mesh) {
//           obj.material = new MeshPhysicalMaterial({
//             map: textureLoader.load(texturePaths.baseColor),
//             normalMap: textureLoader.load(texturePaths.normalMap),
//             roughnessMap: textureLoader.load(texturePaths.roughnessMap),
//             metalnessMap: textureLoader.load(texturePaths.metallicMap),
//             alphaMap: textureLoader.load(texturePaths.opacityMap),
//             transparent: true,
//             clearcoat: 0.5,
//             clearcoatRoughness: 0.5,
//           });
//         }        
//       });
//       gltf.scene.position.set(floorXLength / 2 - 5, 0.01, floorZLength / 2 - 5);
//       gltf.scene.scale.set(3, 3, 3);
//       gltf.scene.receiveShadow = true;
//       gltf.scene.castShadow = true;
//       setLightFixtureModel(gltf.scene);
//     }, undefined, (error) => {
//       console.error(error);
//     });
//   }, [scene]);

//   useEffect(() => {
//     updateAllMaterials();
//   }, [envMapIntensity]);

//   const updateAllMaterials = () => {
//     scene.traverse((child) => {
//       if (child instanceof Mesh && child.material instanceof MeshStandardMaterial) {
//         child.material.envMapIntensity = envMapIntensity;
//         child.material.needsUpdate = true;
//       }
//     });
  
//     groupConstruction.traverse((child) => {
//       if (child instanceof Mesh && child.material instanceof MeshStandardMaterial) {
//         child.material.envMapIntensity = envMapIntensity;
//         child.material.needsUpdate = true;
//       }
//     });
//   };

//   const composerRef = useRef<PostEffectsComposer>(null!);
//   const velocityDepthNormalPassRef = useRef(null!);

//   useEffect(() => {
//     if (composerRef.current) {
//       composerRef.current.setSize(size.width, size.height);
//     }
//   }, [size]);

//   useFrame((_, delta) => {
//     composerRef.current && composerRef.current.render(delta);
//   }, 2);

//   useFrame(({ scene, camera, gl }) => {
//     gl.render(scene, camera);
//   }, 1);

//   const ssgiParams = useControls('SSGI', {
//     distance: { value: 5.980000000000011, min: 0.001, max: 50, step: 0.01 },
//     thickness: { value: 2.829999999999997, min: 0, max: 10, step: 0.01 },
//     envBlur: { value: 0, min: 0, max: 1, step: 0.01 },
//     importanceSampling: true,
//     denoiseIterations: { value: 1, min: 0, max: 5, step: 1 },
//     radius: { value: 11, min: 0, max: 32, step: 1 },
//     phi: { value: 0.875, min: 0, max: 1, step: 0.001 },
//     depthPhi: { value: 23.37, min: 0, max: 50, step: 0.001 },
//     normalPhi: { value: 26.087, min: 0, max: 100, step: 0.001 },
//     roughnessPhi: { value: 18.477999999999998, min: 0, max: 100, step: 0.001 },
//     lumaPhi: { value: 20.651999999999997, min: 0, max: 50, step: 0.001 },
//     specularPhi: { value: 7.099999999999999, min: 0, max: 10, step: 0.1 },
//     steps: { value: 10, min: 0, max: 256, step: 1 },
//     refineSteps: { value: 2, min: 0, max: 16, step: 1 },
//     resolutionScale: { value: 0.5, min: 0.1, max: 1, step: 0.1 },
//     missedRays: false,
//   });

//   return (
//     <>
//       {groupConstruction && <primitive object={groupConstruction} />}
//       {performance && <Perf position="top-left" />}
//       <OrbitControls makeDefault />
//       <postEffectsComposer ref={composerRef} args={[gl]}>
//         <postRenderPass args={[scene, camera]} attach={(parent, self) => parent.addPass(self)} />
//         <velocityDepthNormalPass
//           ref={velocityDepthNormalPassRef}
//           args={[scene, camera]}
//           attach={(parent, self) => parent.addPass(self)}
//         />
//         {/* {velocityDepthNormalPassRef.current && composerRef.current && (
//           <postEffectPass
//             args={[
//               camera,
//               new SSGIEffect(scene, camera, velocityDepthNormalPassRef.current, {
//                 //composerRef.current, 
//                 // ...ssgiParams,
//                 // velocityDepthNormalPass: velocityDepthNormalPassRef.current,
//               }),
//             ]}
//             attach={(parent, self) => parent.addPass(self)}
//           />
//         )} */}
//         {velocityDepthNormalPassRef.current && composerRef.current && (
//           <postEffectPass
//             args={[
//               camera,
//               new HBAOEffect(composerRef.current, camera, scene),
//               new MotionBlurEffect(velocityDepthNormalPassRef.current),
//               // new SharpnessEffect(0.5),
//               new TRAAEffect(scene, camera, velocityDepthNormalPassRef.current),
//               (() => {
//                 const effect = new SMAAEffect({
//                   preset: SMAAPreset.MEDIUM,
//                   edgeDetectionMode: EdgeDetectionMode.COLOR,
//                   predicationMode: PredicationMode.DEPTH,
//                 });
//                 if (effect.edgeDetectionMaterial) {
//                   const edgeDetectionMaterial = effect.edgeDetectionMaterial;
//                   edgeDetectionMaterial.edgeDetectionThreshold = 0.02;
//                   edgeDetectionMaterial.predicationThreshold = 0.002;
//                   edgeDetectionMaterial.predicationScale = 1;
//                 }
//                 return effect;
//               })(),
//             ]}
//             attach={(parent, self) => {
//               parent.addPass(self);
//               return () => {
//               };
//             }}
//           />
//         )}
//       </postEffectsComposer>
//     </>
//   );
// };
            
// export { Scene };



import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useThree, extend, ReactThreeFiber, useFrame } from '@react-three/fiber';
import { OrbitControls } from "@react-three/drei";
import { useControls } from 'leva';
import { Perf } from 'r3f-perf';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { TextureLoader, Texture, MeshPhysicalMaterial, MeshStandardMaterial, Mesh, 
  Group, CubeTextureLoader, EquirectangularReflectionMapping } from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { debounce } from 'lodash';
import { createFloorAndWalls } from './objectFloorAndWalls';
import { floorAndWalls } from './objectConstant';

// @ts-ignore
import { SSGIEffect, HBAOEffect, MotionBlurEffect, TRAAEffect, VelocityDepthNormalPass } from 'realism-effects';
import {
  EffectComposer as PostEffectsComposer,
  EffectPass as PostEffectPass,
  RenderPass as PostRenderPass,
  SMAAEffect,
  SMAAPreset,
  EdgeDetectionMode,
  PredicationMode,
} from 'postprocessing';

extend({
  PostRenderPass,
  PostEffectPass,
  SSGIEffect,
  HBAOEffect,
  MotionBlurEffect,
  TRAAEffect,
  VelocityDepthNormalPass,
  // SharpnessEffect,
  PostEffectsComposer,
});

declare module '@react-three/fiber' {
  interface ThreeElements {
    velocityDepthNormalPass: ReactThreeFiber.Node<VelocityDepthNormalPass, typeof VelocityDepthNormalPass>;
    sSGIEffect: ReactThreeFiber.Node<SSGIEffect, typeof SSGIEffect>;
    hBAOEffect: ReactThreeFiber.Node<HBAOEffect, typeof HBAOEffect>;
    motionBlurEffect: ReactThreeFiber.Node<MotionBlurEffect, typeof MotionBlurEffect>;
    tRAAEffect: ReactThreeFiber.Node<TRAAEffect, typeof TRAAEffect>;
    // sharpnessEffect: ReactThreeFiber.Node<SharpnessEffect, typeof SharpnessEffect>;
    postEffectsComposer: ReactThreeFiber.Node<PostEffectsComposer, typeof PostEffectsComposer>;
    postRenderPass: ReactThreeFiber.Node<PostRenderPass, typeof PostRenderPass>;
    postEffectPass: ReactThreeFiber.Node<PostEffectPass, typeof PostEffectPass>;
  }
}

const Scene = () => {
  const { performance } = useControls('Monitoring', {
    performance: false,
  });

  const { scene, camera, size } = useThree();
  const [envMapIntensity, setEnvMapIntensity] = useState(1);
  const { floorXLength, floorZLength, wallHeight, wallThickness, roundRadius, roundSegments, ny } = floorAndWalls;
  const { groupConstruction, groupConstructionBoxHelper } = createFloorAndWalls(envMapIntensity);

  useEffect(() => {
    scene.backgroundBlurriness = 0;
    scene.backgroundIntensity = 1;
  }, [scene]);

  useControls('Environment', {
    envMapIntensity: {
      value: envMapIntensity,
      min: 0,
      max: 3,
      step: 0.001,
      onChange: (value) => {
        setEnvMapIntensity(value);
        updateAllMaterials();
      },
    },
    backgroundBlurriness: {
      value: scene.backgroundBlurriness,
      min: 0,
      max: 0.2,
      step: 0.001,
      onChange: (value) => {
        scene.backgroundBlurriness = value;
      },
    },
    backgroundIntensity: {
      value: scene.backgroundIntensity,
      min: 0,
      max: 5,
      step: 0.001,
      onChange: (value) => {
        scene.backgroundIntensity = value;
      },
    },
  });

  const couch = "/17988333-b8c0-4a0a-8576-506ad93270db/model-transformed.glb";
  const lightFixture = "/16897720-b5f1-44e1-9ac9-e7d06c484684/model-transformed.glb"
  const painted_metal = "/acg_painted_metal_012";

  const [couchModel, setCouchModel] = useState<Group | null>(null);
  const [lightFixtureModel, setLightFixtureModel] = useState<Group | null>(null);

  // const [modelsLoaded, setModelsLoaded] = useState(false);
  // const [couchLoaded, setCouchLoaded] = useState(false);
  // const [lightFixtureLoaded, setLightFixtureLoaded] = useState(false);


  const gl = useThree(({ gl }) => gl);

  useEffect(() => {
    if (couchModel && lightFixtureModel) {
      groupConstruction.add(couchModel);
      groupConstruction.add(lightFixtureModel);
    }
  }, [couchModel, lightFixtureModel, groupConstruction]);

  const texturePaths = {
    baseColor: `${painted_metal}/basecolor.png`,
    diffuseMap: `${painted_metal}/diffuse.png`,
    displacementMap: `${painted_metal}/displacement.png`,
    heightMap: `${painted_metal}/height.png`,
    metallicMap: `${painted_metal}/metallic.png`,
    normalMap: `${painted_metal}/normal.png`,
    opacityMap: `${painted_metal}/opacity.png`,
    roughnessMap: `${painted_metal}/roughness.png`,
    specularMap: `${painted_metal}/specular.png`,
  };

  useEffect(() => {
    const textureLoader = new TextureLoader();
    const textures = {
      baseColor: textureLoader.load(texturePaths.baseColor),
      diffuseMap: textureLoader.load(texturePaths.diffuseMap),
      displacementMap: textureLoader.load(texturePaths.displacementMap),
      heightMap: textureLoader.load(texturePaths.heightMap),
      metallicMap: textureLoader.load(texturePaths.metallicMap),
      normalMap: textureLoader.load(texturePaths.normalMap),
      opacityMap: textureLoader.load(texturePaths.opacityMap),
      roughnessMap: textureLoader.load(texturePaths.roughnessMap),
      specularMap: textureLoader.load(texturePaths.specularMap),
    };

    const loader = new GLTFLoader();

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    loader.setDRACOLoader(dracoLoader);

    const rgbeLoader = new RGBELoader();
    rgbeLoader.load('/img/metro_noord_4k.hdr', (texture) => {
      texture.mapping = EquirectangularReflectionMapping;
      scene.background = texture;
      scene.environment = texture;
    });
    
    loader.load(couch, (gltf) => {
      gltf.scene.traverse((obj) => {
        if (obj instanceof Mesh) {
          obj.material = new MeshPhysicalMaterial({
            map: textureLoader.load(texturePaths.baseColor),
            normalMap: textureLoader.load(texturePaths.normalMap),
            roughnessMap: textureLoader.load(texturePaths.roughnessMap),
            metalnessMap: textureLoader.load(texturePaths.metallicMap),
            alphaMap: textureLoader.load(texturePaths.opacityMap),
            transparent: true,
            clearcoat: 0.5,
            clearcoatRoughness: 0.5,
          });
          obj.rotation.y = -Math.PI / 2;
        }        
      });
      gltf.scene.position.set(floorXLength / 2 + 10, 0.01, floorZLength / 2 - 5);
      gltf.scene.scale.set(5, 5, 5);
      gltf.scene.receiveShadow = true;
      gltf.scene.castShadow = true;
      setCouchModel(gltf.scene);
    }, undefined, (error) => {
      console.error(error);
    });

    loader.load(lightFixture, (gltf) => {
      gltf.scene.traverse((obj) => {
        if (obj instanceof Mesh) {
          obj.material = new MeshPhysicalMaterial({
            map: textureLoader.load(texturePaths.baseColor),
            normalMap: textureLoader.load(texturePaths.normalMap),
            roughnessMap: textureLoader.load(texturePaths.roughnessMap),
            metalnessMap: textureLoader.load(texturePaths.metallicMap),
            alphaMap: textureLoader.load(texturePaths.opacityMap),
            transparent: true,
            clearcoat: 0.5,
            clearcoatRoughness: 0.5,
          });
        }        
      });
      gltf.scene.position.set(floorXLength / 2 - 5, 0.01, floorZLength / 2 - 5);
      gltf.scene.scale.set(5, 5, 5);
      gltf.scene.receiveShadow = true;
      gltf.scene.castShadow = true;
      setLightFixtureModel(gltf.scene);
    }, undefined, (error) => {
      console.error(error);
    });
  }, [scene]);

  useEffect(() => {
    updateAllMaterials();
  }, [envMapIntensity]);

  const updateAllMaterials = () => {
    scene.traverse((child) => {
      if (child instanceof Mesh && child.material instanceof MeshStandardMaterial) {
        child.material.envMapIntensity = envMapIntensity;
        child.material.needsUpdate = true;
      }
    });
  
    groupConstruction.traverse((child) => {
      if (child instanceof Mesh && child.material instanceof MeshStandardMaterial) {
        child.material.envMapIntensity = envMapIntensity;
        child.material.needsUpdate = true;
      }
    });
  };

  // const composerRef = useRef<PostEffectsComposer | null>(null);
  // const velocityDepthNormalPassRef = useRef<VelocityDepthNormalPass | null>(null);
  // const gl = useThree((state) => state.gl);

  // useEffect(() => {
  //   const composer = new PostEffectsComposer(gl, { multisampling: 0 });
  //   composerRef.current = composer;

    // const config = {
    //   importanceSampling: true,
    //   steps: 10,
    //   refineSteps: 2,
    //   resolutionScale: 0.5,
    //   missedRays: false,
    //   distance: 5.980000000000011,
    //   thickness: 2.829999999999997,
    //   envBlur: 0,
    //   denoiseIterations: 1,
    //   radius: 11,
    //   phi: 0.875,
    //   depthPhi: 23.37,
    //   normalPhi: 26.087,
    //   roughnessPhi: 18.477999999999998,
    //   lumaPhi: 20.651999999999997,
    //   specularPhi: 7.099999999999999,
    // };

    // const renderPass = new PostRenderPass(scene, camera);
    // const velocityDepthNormalPass = new VelocityDepthNormalPass(scene, camera);
    // velocityDepthNormalPassRef.current = velocityDepthNormalPass;

    // composer.addPass(renderPass);
    // composer.addPass(velocityDepthNormalPass);
    // composer.addPass(new PostEffectPass(camera, new SSGIEffect(scene, camera, velocityDepthNormalPass, config)));
    // composer.addPass(new PostEffectPass(camera, new HBAOEffect(composer, camera, scene)));
    // composer.addPass(new PostEffectPass(camera, new MotionBlurEffect(velocityDepthNormalPass)));
    // composer.addPass(new PostEffectPass(camera, new TRAAEffect(scene, camera, velocityDepthNormalPass)));
  //   composer.addPass(
  //     new PostEffectPass(
  //       camera,
  //       (() => {
  //         const effect = new SMAAEffect({
  //           preset: SMAAPreset.MEDIUM,
  //           edgeDetectionMode: EdgeDetectionMode.COLOR,
  //           predicationMode: PredicationMode.DEPTH,
  //         });
  //         if (effect.edgeDetectionMaterial) {
  //           const edgeDetectionMaterial = effect.edgeDetectionMaterial;
  //           edgeDetectionMaterial.edgeDetectionThreshold = 0.02;
  //           edgeDetectionMaterial.predicationThreshold = 0.002;
  //           edgeDetectionMaterial.predicationScale = 1;
  //         }
  //         return effect;
  //       })()
  //     )
  //   );

  //   return () => {
  //     composerRef.current?.dispose();
  //   };
  // }, [gl, scene, camera]);

  // useEffect(() => {
  //   composerRef.current?.setSize(size.width, size.height);
  // }, [size]);

  // useFrame((_, delta) => {
  //   composerRef.current?.render(delta);
  // }, 1);

  return (
    <>
      {groupConstruction && <primitive object={groupConstruction} />}
      {performance && <Perf position="top-left" />}
      <OrbitControls makeDefault />
    </>
  );
};
            
export { Scene };