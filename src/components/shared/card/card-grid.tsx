import { Slot, component$ } from "@builder.io/qwik";
import type { CardProps } from "./card";
import { Card, CardVariant } from "./card";
import classnames from "classnames";
import styles from "./card-grid.module.css";

export enum CardGridRowVariant {
  one = "one",
  two = "two",
}

interface CardGridRowProps {
  variant: CardGridRowVariant;
}
export const CardGridRow = component$((props: CardGridRowProps) => {
  return (
    <div
      class={classnames(
        styles.gridRow,
        props.variant === CardGridRowVariant.one
          ? styles.variantOne
          : styles.variantTwo,
      )}
    >
      <Slot />
    </div>
  );
});

export interface CardGridProps {
  rows: Array<
    Array<Omit<CardProps, "variant"> & Partial<Pick<CardProps, "variant">>>
  >;
}
export const CardGrid = component$((props: CardGridProps) => {
  return (
    <div class={styles.grid}>
      <Slot name="title" />

      {props.rows.map((row, rowIndex) => (
        <CardGridRow
          key={`row-${rowIndex}`}
          variant={
            rowIndex % 2 === 0 ? CardGridRowVariant.one : CardGridRowVariant.two
          }
        >
          {row.map((card, cardIndex) => {
            let variant = CardVariant.small;

            if (rowIndex % 2 === 0 && cardIndex === 0) {
              variant = CardVariant.large;
            }

            if (rowIndex % 2 !== 0 && cardIndex === 2) {
              variant = CardVariant.large;
            }

            return (
              <Card key={`card-${cardIndex}`} variant={variant} {...card} />
            );
          })}
        </CardGridRow>
      ))}
    </div>
  );
});
