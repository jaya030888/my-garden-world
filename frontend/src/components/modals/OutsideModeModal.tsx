import React from 'react';
import { useGarden } from '../../context/GardenContext';
import { DailyNatureExerciseModal } from './DailyNatureExerciseModal';

export const OutsideModeModal: React.FC = () => {
  const { isOutsideModeActive, stopOutsideMode } = useGarden();

  if (!isOutsideModeActive) return null;

  return (
    <DailyNatureExerciseModal
      isOpen={isOutsideModeActive}
      onClose={stopOutsideMode}
    />
  );
};
