import type { ToolComponents } from '@fpv/content';
import { BlackboxAnalyzer } from './blackbox-analyzer';
import { DynamicIdleCalculator } from './dynamic-idle-calculator';

/** Interactive widgets injected into migrated MDX content. */
export const MDX_TOOLS: ToolComponents = {
  BlackboxAnalyzer,
  DynamicIdleCalculator,
};
