import type { QRL } from "@builder.io/qwik";
import { useSignal, useVisibleTask$ } from "@builder.io/qwik";

interface Props {
  onFileDrop: QRL<(file?: File) => void>;
}
export function useFileDrop(props: Props) {
  const isDroppingFile = useSignal(false);

  /**
   * Handle file drop
   */
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    window.addEventListener("dragover", (e) => {
      e.preventDefault();
      isDroppingFile.value = true;
    });

    window.addEventListener("dragleave", (e) => {
      e.preventDefault();
      isDroppingFile.value = false;
    });

    window.addEventListener("drop", (e) => {
      e.preventDefault();
      isDroppingFile.value = false;
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      props.onFileDrop(e.dataTransfer?.files?.[0]);
    });
  });

  return isDroppingFile;
}
