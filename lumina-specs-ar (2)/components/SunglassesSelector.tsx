import React from 'react';
import { SUNGLASSES_STYLES } from '../constants';
import { SunglassesStyle } from '../types';

interface SunglassesSelectorProps {
  selectedId: string | null;
  onSelect: (style: SunglassesStyle) => void;
}

const SunglassesSelector: React.FC<SunglassesSelectorProps> = ({ selectedId, onSelect }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h3 className="text-xl font-light text-center mb-6 text-neutral-400 uppercase tracking-widest">Select Your Style</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {SUNGLASSES_STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => onSelect(style)}
            className={`
              group relative flex flex-col items-center justify-between p-6 rounded-xl border transition-all duration-300
              ${selectedId === style.id 
                ? 'border-white bg-neutral-900 shadow-[0_0_20px_rgba(255,255,255,0.1)] scale-105 z-10' 
                : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-600 hover:bg-neutral-800'
              }
            `}
          >
            {/* Abstract Icon Representation */}
            <div className="h-16 w-full flex items-center justify-center mb-4">
              <div className={`w-16 h-8 ${style.iconClass} opacity-80 group-hover:opacity-100 transition-opacity shadow-lg`}></div>
            </div>

            <div className="text-center">
              <h4 className={`text-sm font-bold uppercase tracking-wide mb-1 ${selectedId === style.id ? 'text-white' : 'text-neutral-300'}`}>
                {style.name}
              </h4>
              <p className="text-xs text-neutral-500 line-clamp-2">
                {style.description}
              </p>
            </div>
            
            {selectedId === style.id && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SunglassesSelector;
