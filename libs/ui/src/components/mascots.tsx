import type { ImgHTMLAttributes } from 'react';
import froggo from '../assets/languages_froggo_cropped.webp';
import logoDark from '../assets/logo_dark.webp';
import logo from '../assets/logo.webp';
import coin from '../assets/racoon_coin_cropped.webp';
import directionFilter from '../assets/racoon_direction_cropped_filter.webp';
import directionPid from '../assets/racoon_direction_cropped_pid.webp';
import directionRates from '../assets/racoon_direction_cropped_rates.webp';
import direction from '../assets/racoon_direction_cropped.webp';
import fireError from '../assets/racoon_fire_error.webp';
import friends from '../assets/racoon_friends_cropped.webp';
import pablo from '../assets/racoon_magician_pablo_noob_cropped.webp';
import processing from '../assets/racoon_processing-cropped.webp';
import chichi from '../assets/racoon_scientist_chichi_pro_cropped.webp';

/**
 * Typed catalog of the raccoon mascot artwork (and froggo, the language
 * frog). Pablo the magician guides beginners, Chichi the scientist owns
 * the pro tools.
 */
export const MASCOTS = {
  logo,
  logoDark,
  pablo,
  chichi,
  direction,
  directionPid,
  directionFilter,
  directionRates,
  friends,
  coin,
  froggo,
  processing,
  fireError,
} as const;

export type MascotName = keyof typeof MASCOTS;

export interface MascotImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  name: MascotName;
}

export function MascotImage({ name, alt = '', ...rest }: MascotImageProps) {
  return <img src={MASCOTS[name]} alt={alt} loading="lazy" {...rest} />;
}
