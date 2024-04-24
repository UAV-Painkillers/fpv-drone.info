import type { IntrinsicElements } from "@builder.io/qwik";
import { component$, useComputed$ } from "@builder.io/qwik";
import type { CMSRegisteredComponent } from "../cms-registered-component";
import { StoryBlokComponent } from "../storyblok/component";
import styles from "./columns.module.css";
import { storyblokEditable } from "@storyblok/js";

interface ColumnsProps {
  columns: Array<any>;
  rowMinLength?: number;
}
export const Columns = component$(
  (props: ColumnsProps & IntrinsicElements["div"]) => {
    const { columns, ...divProps } = props;

    const columnsWithGaps = useComputed$(() => {
      const allColumns = columns;
      if (props.rowMinLength && allColumns.length < props.rowMinLength) {
        const gaps = props.rowMinLength - allColumns.length;
        for (let i = 0; i < gaps; i++) {
          allColumns.push(null);
        }
      }
      return allColumns;
    });

    return (
      <div {...divProps} class={styles.row}>
        {columnsWithGaps.value.map((Column, index) => (
          <div key={index} class={styles.column}>
            {Column}
          </div>
        ))}
      </div>
    );
  },
);

export const ColumnsRegistryDefinition: CMSRegisteredComponent = {
  name: "Columns",
  component: component$((story: any) => {
    const columns = useComputed$(() => {
      return story.columns.map((column: any, index: number) => (
        <StoryBlokComponent key={index} blok={column} />
      ));
    });

    return (
      <Columns
        columns={columns.value}
        rowMinLength={story.rowMinLength}
        {...storyblokEditable(story)}
      />
    );
  }),
};
