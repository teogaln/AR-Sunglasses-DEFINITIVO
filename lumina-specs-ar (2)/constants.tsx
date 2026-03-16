import React from 'react';
import { SunglassesStyle } from './types';

export const SUNGLASSES_STYLES: SunglassesStyle[] = [
  {
    id: 'aviator-classic',
    name: 'Aviator Classic',
    description: 'Timeless pilot shape with gold frames and dark green lenses.',
    prompt: 'classic gold-rimmed aviator sunglasses with dark green lenses',
    iconClass: 'rounded-b-full border-t-4 border-yellow-500 bg-green-900',
  },
  {
    id: 'wayfarer-black',
    name: 'Urban Wayfarer',
    description: 'Bold acetate frames in matte black. The modern standard.',
    prompt: 'matte black wayfarer sunglasses with black lenses',
    iconClass: 'rounded-sm bg-neutral-800',
  },
  {
    id: 'round-retro',
    name: 'Retro Round',
    description: 'Vintage-inspired circular metal frames with blue tint.',
    prompt: 'circular metal frame sunglasses with blue tinted lenses',
    iconClass: 'rounded-full border-2 border-slate-300 bg-blue-900',
  },
  {
    id: 'cat-eye-chic',
    name: 'Cat Eye Chic',
    description: 'Sharp angles and oversized frames for a dramatic look.',
    prompt: 'oversized tortoise-shell cat-eye sunglasses',
    iconClass: 'rounded-tl-2xl rounded-tr-2xl rounded-bl-md rounded-br-md bg-amber-900',
  },
  {
    id: 'sport-wrap',
    name: 'Velocity Sport',
    description: 'Aerodynamic wrap-around frames for high performance.',
    prompt: 'futuristic reflective sport wrap-around sunglasses',
    iconClass: 'rounded-full w-full h-4 bg-gradient-to-r from-orange-500 to-red-600',
  },
  {
    id: 'cyber-visor',
    name: 'Cyber Visor',
    description: 'A single shield lens straight from the future.',
    prompt: 'futuristic cyberpunk visor sunglasses with neon accents',
    iconClass: 'rounded-none border-t-2 border-cyan-400 bg-black',
  },
];
