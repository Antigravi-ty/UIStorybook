import React from 'react';
import { VStack } from '../../../layout/VStack';
import { SettingSliderRow } from '../components/SettingSliderRow';

export interface CameraTabProps {
  fov: number;
  onChangeFov: (val: number) => void;
  cameraDistance: number;
  onChangeCameraDistance: (val: number) => void;
  cameraHeight: number;
  onChangeCameraHeight: (val: number) => void;
  cameraAngle: number;
  onChangeCameraAngle: (val: number) => void;
  cameraStiffness: number;
  onChangeCameraStiffness: (val: number) => void;
  onHover: (desc: string) => void;
  onLeave: () => void;
  isLight?: boolean;
}

export const CameraTab: React.FC<CameraTabProps> = ({
  fov,
  onChangeFov,
  cameraDistance,
  onChangeCameraDistance,
  cameraHeight,
  onChangeCameraHeight,
  cameraAngle,
  onChangeCameraAngle,
  cameraStiffness,
  onChangeCameraStiffness,
  onHover,
  onLeave,
  isLight = false,
}) => {
  return (
    <VStack gap="lg" isLight={isLight}>
      <SettingSliderRow
        label="Field of View"
        value={fov}
        min={60}
        max={120}
        step={1}
        unit="°"
        onChange={onChangeFov}
        onHover={() => onHover('Adjusts horizontal field of view angle in degrees.')}
        onLeave={onLeave}
        isLight={isLight}
      />

      <SettingSliderRow
        label="Distance"
        value={cameraDistance}
        min={200}
        max={400}
        step={10}
        unit="uu"
        onChange={onChangeCameraDistance}
        onHover={() => onHover('Sets the distance between the tracking camera and vehicle body.')}
        onLeave={onLeave}
        isLight={isLight}
      />

      <SettingSliderRow
        label="Height"
        value={cameraHeight}
        min={60}
        max={180}
        step={5}
        unit="uu"
        onChange={onChangeCameraHeight}
        onHover={() => onHover('Controls the vertical height of the camera above vehicle.')}
        onLeave={onLeave}
        isLight={isLight}
      />

      <SettingSliderRow
        label="Angle"
        value={cameraAngle}
        min={-15}
        max={0}
        step={1}
        unit="°"
        onChange={onChangeCameraAngle}
        onHover={() => onHover('Downward pitch angle pointing toward vehicle.')}
        onLeave={onLeave}
        isLight={isLight}
      />

      <SettingSliderRow
        label="Stiffness"
        value={cameraStiffness}
        min={0}
        max={1}
        step={0.05}
        onChange={onChangeCameraStiffness}
        onHover={() => onHover('Rigidity with which the camera follows vehicle orientation.')}
        onLeave={onLeave}
        isLight={isLight}
      />
    </VStack>
  );
};
