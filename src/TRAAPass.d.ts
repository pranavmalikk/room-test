import { ReactThreeFiber, PostEffectPass, VelocityDepthNormalPass } from '@react-three/fiber';

declare module '@react-three/fiber' {
  interface ThreeElements {
    TRAAPass: ReactThreeFiber.Node<PostEffectPass, typeof PostEffectPass> & {
      args?: [any, any, VelocityDepthNormalPass];
    };
  }
}