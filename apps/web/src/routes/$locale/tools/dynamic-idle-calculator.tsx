import { useT } from '@fpv/i18n';
import { Callout, Card } from '@fpv/ui';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/$locale/tools/dynamic-idle-calculator')({
  component: DynamicIdleCalculatorPage,
});

// Same formula as the original tool: target idle RPM = 15000 / propDiameter;
// Betaflight's dyn_idle setting is expressed in hundreds of RPM.
function calculateDynIdle(propDiameterInches: number): number {
  return Math.round(15000 / propDiameterInches / 100);
}

function DynamicIdleCalculatorPage() {
  const t = useT();
  const [propSize, setPropSize] = useState('5');
  const parsed = Number.parseFloat(propSize.replace(',', '.'));
  const valid = Number.isFinite(parsed) && parsed > 0;

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-extrabold">{t.idleCalculator.title}</h1>
      <p className="mt-1 text-ink-muted">{t.idleCalculator.description}</p>

      <Card className="mt-6 max-w-md">
        <label className="block text-sm font-semibold" htmlFor="prop-size">
          {t.idleCalculator.propSizeLabel}
        </label>
        <input
          id="prop-size"
          type="number"
          inputMode="decimal"
          min="1"
          max="15"
          step="0.5"
          value={propSize}
          onChange={(e) => setPropSize(e.target.value)}
          className="mt-2 h-11 w-full rounded-(--radius-control) border border-line bg-surface px-3 focus:border-brand-green focus:outline-none"
        />
        <p className="mt-4 text-sm font-semibold">{t.idleCalculator.resultLabel}</p>
        <p className="text-3xl font-extrabold text-gradient">
          {valid ? calculateDynIdle(parsed) : '—'}
        </p>
        {valid ? (
          <Callout tone="tldr" className="mt-4 mb-0">
            {t.idleCalculator.hint}
          </Callout>
        ) : null}
      </Card>
    </div>
  );
}
