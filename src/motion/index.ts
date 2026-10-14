/**
 * L4. Motion & Transitions (动效与转场引擎)
 * Dedicated container morphing, sequenced transition state machines, and modal shells.
 * Strict rule: Depends only on L0–L3. Zero L5–L7 dependencies.
 */
export * from '../navigation/transitions';
export * from '../navigation/MorphingShell';
export * from '../navigation/MenuStack';
export {
  UI_EASING,
  type ContainerTransitionMode,
  type FluidMorphConfig,
  type SequencedStepConfig,
  type ContainerTransitionParams,
} from '../tokens/easing';
