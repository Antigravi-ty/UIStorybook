import React from 'react';

export interface ExtraTabProps {
  onHover: (desc: string) => void;
  onLeave: () => void;
  isLight?: boolean;
}

export const ExtraTab: React.FC<ExtraTabProps> = ({
  onHover,
  onLeave,
  isLight = false,
}) => {
  return (
    <div
      onMouseEnter={() => onHover('Contains match replay auto-saving and extended telemetry logging.')}
      onMouseLeave={onLeave}
      className="flex flex-col gap-3"
    >
      <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
        isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-850 border-neutral-700/80'
      }`}>
        <span className="font-bold block mb-1">Extra Features:</span>
        <span className="text-neutral-400">Match replay auto-saving and extended telemetry logging placeholder.</span>
      </div>
    </div>
  );
};
