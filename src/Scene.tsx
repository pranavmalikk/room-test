import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useThree, extend, ReactThreeFiber, useFrame } from '@react-three/fiber';
import { OrbitControls } from "@react-three/drei";
import { useControls } from 'leva';
import { Perf } from 'r3f-perf';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { TextureLoader, Texture, MeshPhysicalMaterial, MeshStandardMaterial, Mesh, 
  Group, CubeTextureLoader, EquirectangularReflectionMapping, Object3D } from 'three';
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
import { group } from 'console';

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

interface ConstructionGroupProps {
  groupConstruction: Group;
  envMapIntensity: number;
}

const ConstructionGroup: React.FC<ConstructionGroupProps> = ({ groupConstruction, envMapIntensity }) => {
  const { scene } = useThree();

  useEffect(() => {
    groupConstruction.traverse((child) => {
      if (child instanceof Mesh && child.material instanceof MeshStandardMaterial) {
        child.material.envMapIntensity = envMapIntensity;
        child.material.needsUpdate = true;
      }
    });

    scene.traverse((child) => {
      if (child instanceof Mesh && child.material instanceof MeshStandardMaterial) {
        child.material.envMapIntensity = envMapIntensity;
        child.material.needsUpdate = true;
      }
    });
  }, [groupConstruction, envMapIntensity, scene]);

  return <primitive object={groupConstruction} />;
};

const Scene = () => {
  const { performance } = useControls('Monitoring', {
    performance: false,
  });

  const { scene, camera, size } = useThree();
  const [envMapIntensity, setEnvMapIntensity] = useState(1);
  const { floorXLength, floorZLength, wallHeight, wallThickness, roundRadius, roundSegments, ny } = floorAndWalls;
  const { groupConstruction, groupConstructionBoxHelper } = useMemo(
    () => createFloorAndWalls(envMapIntensity),
    [envMapIntensity]
  );

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

  //models
  // const couch = "/17988333-b8c0-4a0a-8576-506ad93270db/model-transformed.glb";
  const lightFixture = "/lightfixture/model-transformed.glb"
  const bed = "/bed/model-transformed.glb"
  const cabinet = "/cabinet/model-transformed.glb"
  const chair = "/chair/model-transformed.glb" 
  const pillow = "/pillow/model-transformed.glb"
  const couch = "/sofa/model-transformed.glb"
  const cloth = "/cloth/model-transformed.glb"
  const table = "/table/model-transformed.glb"
  const plush = "/plush/model-transformed.glb"
  const stool_chair = "/stool_chair/model-transformed.glb"
  const table_stand = "/table_stand/model-transformed.glb"

  //textures
  const painted_metal = "/acg_painted_metal_012";
  const fabrics_084 = "/tc_fabrics_084"
  const st_fabrics_063_005 = "/st_fabric_063_005"
  const old_wood_0426 = "/old_wood_0426"
  const organic_wood = "/organic_wood_0033"
  const cotton_fabric = "/cotton_fabric_0335_pw"
  const cotton_fabric_2 = "/cotton_fabric_2"
  const blue_leather = "/ms_leather_005"


  const [couchModel, setCouchModel] = useState<Group | null>(null);
  const [tableModel, setTableModel] = useState<Group | null>(null);
  const [pillowModel, setPillowModel] = useState<Group[]>([]);
  const [chairModel, setChairModel] = useState<Group[]>([]);
  const [bedModel, setBedModel] = useState<Group | null>(null);
  const [cabinetModel, setCabinetModel] = useState<Group | null>(null);
  const [plushModel, setPlushModel] = useState<Group | null>(null);
  const [stoolChairModel, setStoolChairModel] = useState<Group[]>([]);
  const [tableStandModel, setTableStandModel] = useState<Group | null>(null);


  const gl = useThree(({ gl }) => gl);

  useEffect(() => {
    if (couchModel && tableModel && pillowModel.length > 0 && bedModel && cabinetModel &&
       plushModel && stoolChairModel.length > 0 && tableStandModel) {
      groupConstruction.add(couchModel);
      groupConstruction.add(tableModel);
      groupConstruction.add(bedModel);
      groupConstruction.add(cabinetModel);
      groupConstruction.add(plushModel);
      groupConstruction.add(tableStandModel);
      stoolChairModel.forEach((stool) => {
        groupConstruction.add(stool);
      });
      pillowModel.forEach((pillow) => {
        groupConstruction.add(pillow);
      });
      chairModel.forEach((chair) => {
        groupConstruction.add(chair);
      });
    }
  }, [couchModel, tableModel, pillowModel, chairModel, bedModel, cabinetModel, 
    plushModel, stoolChairModel, tableStandModel, groupConstruction]);

  const fabrics_084_texture = {
    baseColor: `${fabrics_084}/basecolor.png`,
    diffuseMap: `${fabrics_084}/diffuse.png`,
    displacementMap: `${fabrics_084}/displacement.png`,
    heightMap: `${fabrics_084}/height.png`,
    metallicMap: `${fabrics_084}/metallic.png`,
    normalMap: `${fabrics_084}/normal.png`,
    opacityMap: `${fabrics_084}/opacity.png`,
    roughnessMap: `${fabrics_084}/roughness.png`,
    specularMap: `${fabrics_084}/specular.png`,
  };

  const st_fabrics_063_005_texture = {
    baseColor: `${st_fabrics_063_005}/basecolor.png`,
    diffuseMap: `${st_fabrics_063_005}/diffuse.png`,
    displacementMap: `${st_fabrics_063_005}/displacement.png`,
    heightMap: `${st_fabrics_063_005}/height.png`,
    metallicMap: `${st_fabrics_063_005}/metallic.png`,
    normalMap: `${st_fabrics_063_005}/normal.png`,
    opacityMap: `${st_fabrics_063_005}/opacity.png`,
    roughnessMap: `${st_fabrics_063_005}/roughness.png`,
    specularMap: `${st_fabrics_063_005}/specular.png`,
  };

  const old_wood_0426_texture = {
    baseColor: `${old_wood_0426}/basecolor.png`,
    diffuseMap: `${old_wood_0426}/diffuse.png`,
    displacementMap: `${old_wood_0426}/displacement.png`,
    heightMap: `${old_wood_0426}/height.png`,
    metallicMap: `${old_wood_0426}/metallic.png`,
    normalMap: `${old_wood_0426}/normal.png`,
    opacityMap: `${old_wood_0426}/opacity.png`,
    roughnessMap: `${old_wood_0426}/roughness.png`,
    specularMap: `${old_wood_0426}/specular.png`,
  };

  const organic_wood_texture = {
    baseColor: `${organic_wood}/basecolor.png`,
    diffuseMap: `${organic_wood}/diffuse.png`,
    displacementMap: `${organic_wood}/displacement.png`,
    heightMap: `${organic_wood}/height.png`,
    metallicMap: `${organic_wood}/metallic.png`,
    normalMap: `${organic_wood}/normal.png`,
    opacityMap: `${organic_wood}/opacity.png`,
    roughnessMap: `${organic_wood}/roughness.png`,
    specularMap: `${organic_wood}/specular.png`,
  };

  const cotton_fabric_texture = {
    baseColor: `${cotton_fabric}/basecolor.png`,
    diffuseMap: `${cotton_fabric}/diffuse.png`,
    displacementMap: `${cotton_fabric}/displacement.png`,
    heightMap: `${cotton_fabric}/height.png`,
    metallicMap: `${cotton_fabric}/metallic.png`,
    normalMap: `${cotton_fabric}/normal.png`,
    opacityMap: `${cotton_fabric}/opacity.png`,
    roughnessMap: `${cotton_fabric}/roughness.png`,
    specularMap: `${cotton_fabric}/specular.png`,
  };

  const cotton_fabric_2_texture = {
    baseColor: `${cotton_fabric_2}/basecolor.png`,
    diffuseMap: `${cotton_fabric_2}/diffuse.png`,
    displacementMap: `${cotton_fabric_2}/displacement.png`,
    heightMap: `${cotton_fabric_2}/height.png`,
    metallicMap: `${cotton_fabric_2}/metallic.png`,
    normalMap: `${cotton_fabric_2}/normal.png`,
    opacityMap: `${cotton_fabric_2}/opacity.png`,
    roughnessMap: `${cotton_fabric_2}/roughness.png`,
    specularMap: `${cotton_fabric_2}/specular.png`,
  };

  const blue_leather_texture = {
    baseColor: `${blue_leather}/basecolor.png`,
    diffuseMap: `${blue_leather}/diffuse.png`,
    displacementMap: `${blue_leather}/displacement.png`,
    heightMap: `${blue_leather}/height.png`,
    metallicMap: `${blue_leather}/metallic.png`,
    normalMap: `${blue_leather}/normal.png`,
    opacityMap: `${blue_leather}/opacity.png`,
    roughnessMap: `${blue_leather}/roughness.png`,
    specularMap: `${blue_leather}/specular.png`,
  };

  useEffect(() => {
    const textureLoader = new TextureLoader();

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
            map: textureLoader.load(fabrics_084_texture.baseColor),
            normalMap: textureLoader.load(fabrics_084_texture.normalMap),
            roughnessMap: textureLoader.load(fabrics_084_texture.roughnessMap),
            metalnessMap: textureLoader.load(fabrics_084_texture.metallicMap),
            alphaMap: textureLoader.load(fabrics_084_texture.opacityMap),
            transparent: true,
            clearcoat: 0.5,
            clearcoatRoughness: 0.5,
          });
          obj.rotation.y = -Math.PI / 2;
        }        
      });
      gltf.scene.position.set(floorXLength / 2 + 10, 0.01, floorZLength / 2 - 5);
      gltf.scene.scale.set(4, 4, 4);
      gltf.scene.receiveShadow = true;
      gltf.scene.castShadow = true;
      setCouchModel(gltf.scene);
    }, undefined, (error) => {
      console.error(error);
    });

    loader.load(bed, (gltf) => {
      gltf.scene.traverse((obj) => {
        if (obj instanceof Mesh) {
          obj.material = new MeshPhysicalMaterial({
            map: textureLoader.load(cotton_fabric_texture.baseColor),
            normalMap: textureLoader.load(cotton_fabric_texture.normalMap),
            roughnessMap: textureLoader.load(cotton_fabric_texture.roughnessMap),
            metalnessMap: textureLoader.load(cotton_fabric_texture.metallicMap),
            alphaMap: textureLoader.load(cotton_fabric_texture.opacityMap),
            transparent: true,
            clearcoat: 0.5,
            clearcoatRoughness: 0.5,
          });
          obj.rotation.y = Math.PI/2;
        }        
      });
      gltf.scene.position.set(floorXLength / 2 - 10 , 0.01, floorZLength / 2 + 8);
      gltf.scene.scale.set(4, 4, 4);
      gltf.scene.receiveShadow = true;
      gltf.scene.castShadow = true;
      setBedModel(gltf.scene);
    }, undefined, (error) => {
      console.error(error);
    });

    loader.load(cabinet, (gltf) => {
      gltf.scene.traverse((obj) => {
        if (obj instanceof Mesh) {
          obj.material = new MeshPhysicalMaterial({
            map: textureLoader.load(old_wood_0426_texture.baseColor),
            normalMap: textureLoader.load(old_wood_0426_texture.normalMap),
            roughnessMap: textureLoader.load(old_wood_0426_texture.roughnessMap),
            metalnessMap: textureLoader.load(old_wood_0426_texture.metallicMap),
            alphaMap: textureLoader.load(old_wood_0426_texture.opacityMap),
            transparent: true,
            clearcoat: 0.5,
            clearcoatRoughness: 0.5,
          });
          obj.rotation.y = Math.PI;
        }        
      });
      gltf.scene.position.set(floorXLength / 2 - 10, 2, floorZLength / 2 + 12);
      gltf.scene.scale.set(4, 4, 4);
      gltf.scene.receiveShadow = true;
      gltf.scene.castShadow = true;
      setCabinetModel(gltf.scene);
    }, undefined, (error) => {
      console.error(error);
    });

    loader.load(plush, (gltf) => {
      gltf.scene.traverse((obj) => {
        if (obj instanceof Mesh) {
          obj.material = new MeshPhysicalMaterial({
            map: textureLoader.load(cotton_fabric_2_texture.baseColor),
            normalMap: textureLoader.load(cotton_fabric_2_texture.normalMap),
            roughnessMap: textureLoader.load(cotton_fabric_2_texture.roughnessMap),
            metalnessMap: textureLoader.load(cotton_fabric_2_texture.metallicMap),
            alphaMap: textureLoader.load(cotton_fabric_2_texture.opacityMap),
            transparent: true,
            clearcoat: 0.5,
            clearcoatRoughness: 0.5,
          });
          obj.rotation.y = Math.PI;
        }        
      });
      gltf.scene.position.set(floorXLength / 2 + 10, 0.01, floorZLength / 2 + 8);
      gltf.scene.scale.set(4, 4, 4);
      gltf.scene.receiveShadow = true;
      gltf.scene.castShadow = true;
      setPlushModel(gltf.scene);
    }, undefined, (error) => {
      console.error(error);
    });

    loader.load(pillow, (gltf) => {
      const pillow1 = gltf.scene.clone();
      const pillow2 = gltf.scene.clone();
      const pillow3 = gltf.scene.clone();
    
      const applyPillowMaterial = (obj: Object3D) => {
        if (obj instanceof Mesh) {
          obj.material = new MeshPhysicalMaterial({
            map: textureLoader.load(st_fabrics_063_005_texture.baseColor),
            normalMap: textureLoader.load(st_fabrics_063_005_texture.normalMap),
            roughnessMap: textureLoader.load(st_fabrics_063_005_texture.roughnessMap),
            metalnessMap: textureLoader.load(st_fabrics_063_005_texture.metallicMap),
            alphaMap: textureLoader.load(st_fabrics_063_005_texture.opacityMap),
            transparent: true,
            clearcoat: 0.5,
            clearcoatRoughness: 0.5,
          });
        }
      };
    
      //first one
      pillow1.traverse(applyPillowMaterial);
      pillow1.position.set(floorXLength / 2 + 10, 1.8, floorZLength / 2 - 4.35);
      pillow1.scale.set(0.9, 0.9, 0.9);
      pillow1.rotation.y = -Math.PI / 2;
      pillow1.receiveShadow = true;
      pillow1.castShadow = true;
    
      //midle one
      pillow2.traverse(applyPillowMaterial);
      pillow2.position.set(floorXLength / 2 + 10, 1.8, floorZLength / 2 - 5.2);
      pillow2.scale.set(0.9, 0.9, 0.9);
      pillow2.rotation.y = Math.PI / 2;
      pillow2.receiveShadow = true;
      pillow2.castShadow = true;
    
      pillow3.traverse(applyPillowMaterial);
      pillow3.position.set(floorXLength / 2 + 10, 1.8, floorZLength / 2 - 5.2);
      pillow3.scale.set(0.9, 0.9, 0.9);
      pillow3.rotation.y = -Math.PI / 2;
      pillow3.receiveShadow = true;
      pillow3.castShadow = true;
    
      setPillowModel([pillow1, pillow2, pillow3]);
    }, undefined, (error) => {
      console.error(error);
    });

    loader.load(chair, (gltf) => {
      const chair1 = gltf.scene.clone();
      const chair2 = gltf.scene.clone();
      const chair3 = gltf.scene.clone();
      const chair4 = gltf.scene.clone();
    
      const applyChairMaterial = (obj: Object3D) => {
        if (obj instanceof Mesh) {
          obj.material = new MeshPhysicalMaterial({
            map: textureLoader.load(organic_wood_texture.baseColor),
            normalMap: textureLoader.load(organic_wood_texture.normalMap),
            roughnessMap: textureLoader.load(organic_wood_texture.roughnessMap),
            metalnessMap: textureLoader.load(organic_wood_texture.metallicMap),
            alphaMap: textureLoader.load(organic_wood_texture.opacityMap),
            transparent: true,
            clearcoat: 0.5,
            clearcoatRoughness: 0.5,
          });
        }
      };
    
      // Chair 1 window side left
      chair1.traverse(applyChairMaterial);
      chair1.position.set(floorXLength / 2 - 2.5, .8, floorZLength / 2 - 5.25);
      chair1.scale.set(2.5, 2.5, 2.5);
      chair1.rotation.y = 0;
      chair1.receiveShadow = true;
      chair1.castShadow = true;
    
      // Chair 2 window right side
      chair2.traverse(applyChairMaterial);
      chair2.position.set(floorXLength / 2 - 5, .8, floorZLength / 2 - 5.25);
      chair2.scale.set(2.5, 2.5, 2.5);
      chair2.rotation.y = 0;
      chair2.receiveShadow = true;
      chair2.castShadow = true;
    
      // Chair 3 right side
      chair3.traverse(applyChairMaterial);
      chair3.position.set(floorXLength / 2 - 5, .8, floorZLength / 2 - 4.75);
      chair3.scale.set(2.5, 2.5, 2.5);
      chair3.rotation.y = Math.PI;
      chair3.receiveShadow = true;
      chair3.castShadow = true;
    
      // Chair 4 left side
      chair4.traverse(applyChairMaterial);
      chair4.position.set(floorXLength / 2 - 7.5, .8, floorZLength / 2 - 4.75);
      chair4.scale.set(2.5, 2.5, 2.5);
      chair4.rotation.y = Math.PI;
      chair4.receiveShadow = true;
      chair4.castShadow = true;
    
      setChairModel([chair1, chair2, chair3, chair4]);
    }, undefined, (error) => {
      console.error(error);
    });

    loader.load(stool_chair, (gltf) => {
      const stool1 = gltf.scene.clone();
      const stool2 = gltf.scene.clone();
    
      const applyStoolMaterial = (obj: Object3D) => {
        if (obj instanceof Mesh) {
          obj.material = new MeshPhysicalMaterial({
            map: textureLoader.load(blue_leather_texture.baseColor),
            normalMap: textureLoader.load(blue_leather_texture.normalMap),
            roughnessMap: textureLoader.load(blue_leather_texture.roughnessMap),
            metalnessMap: textureLoader.load(blue_leather_texture.metallicMap),
            alphaMap: textureLoader.load(blue_leather_texture.opacityMap),
            transparent: true,
            clearcoat: 0.5,
            clearcoatRoughness: 0.5,
          });
        }
      };
    
      // Stool 1
      stool1.traverse(applyStoolMaterial);
      stool1.position.set(floorXLength / 2 + 17, 1.5, floorZLength / 2 - 5.25);
      stool1.scale.set(2.5, 2.5, 2.5);
      stool1.rotation.y = 0;
      stool1.receiveShadow = true;
      stool1.castShadow = true;
    
      // Stool 2
      stool2.traverse(applyStoolMaterial);
      stool2.position.set(floorXLength / 2 + 17, 1.5, floorZLength / 2 - 2.25);
      stool2.scale.set(2.5, 2.5, 2.5);
      stool2.rotation.y = 0;
      stool2.receiveShadow = true;
      stool2.castShadow = true;
    
      setStoolChairModel([stool1, stool2]);
    }, undefined, (error) => {
      console.error(error);
    });

    loader.load(table_stand, (gltf) => {
      gltf.scene.traverse((obj) => {
        if (obj instanceof Mesh) {
          obj.material = new MeshPhysicalMaterial({
            map: textureLoader.load(old_wood_0426_texture.baseColor),
            normalMap: textureLoader.load(old_wood_0426_texture.normalMap),
            roughnessMap: textureLoader.load(old_wood_0426_texture.roughnessMap),
            metalnessMap: textureLoader.load(old_wood_0426_texture.metallicMap),
            alphaMap: textureLoader.load(old_wood_0426_texture.opacityMap),
            transparent: true,
            clearcoat: 0.5,
            clearcoatRoughness: 0.5,
          });
          obj.rotation.y = Math.PI/2;
        }        
      });
      gltf.scene.position.set(floorXLength / 2 + 18, 1, floorZLength / 2 - 6);
      gltf.scene.scale.set(4, 4, 4);
      gltf.scene.receiveShadow = true;
      gltf.scene.castShadow = true;
      setTableStandModel(gltf.scene);
    }, undefined, (error) => {
      console.error(error);
    });

    loader.load(table, (gltf) => {
      gltf.scene.traverse((obj) => {
        if (obj instanceof Mesh) {
          obj.material = new MeshPhysicalMaterial({
            map: textureLoader.load(old_wood_0426_texture.baseColor),
            normalMap: textureLoader.load(old_wood_0426_texture.normalMap),
            roughnessMap: textureLoader.load(old_wood_0426_texture.roughnessMap),
            metalnessMap: textureLoader.load(old_wood_0426_texture.metallicMap),
            alphaMap: textureLoader.load(old_wood_0426_texture.opacityMap),
            transparent: true,
            clearcoat: 0.5,
            clearcoatRoughness: 0.5,
          });
        }        
      });
      gltf.scene.position.set(floorXLength / 2 - 5, 0.01, floorZLength / 2 - 5);
      gltf.scene.scale.set(3.5, 3.5, 3.5);
      gltf.scene.receiveShadow = true;
      gltf.scene.castShadow = true;
      setTableModel(gltf.scene);
    }, undefined, (error) => {
      console.error(error);
    });
  }, [scene]);

  

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
      {groupConstruction && (
        <ConstructionGroup
          groupConstruction={groupConstruction}
          envMapIntensity={envMapIntensity}
        />
      )}
      {performance && <Perf position="top-left" />}
      <OrbitControls makeDefault />
    </>
  );
};
            
export { Scene };