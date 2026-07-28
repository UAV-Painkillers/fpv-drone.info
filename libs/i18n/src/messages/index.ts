import type { Locale } from '../locales';
import { de } from './de';
import { en, type Messages } from './en';
import { es } from './es';
import { fr } from './fr';
import { pl } from './pl';

export type { Messages };

export const MESSAGES: Record<Locale, Messages> = { en, de, es, fr, pl };
