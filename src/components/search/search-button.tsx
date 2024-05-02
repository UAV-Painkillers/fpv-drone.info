import type { IntrinsicElements } from "@builder.io/qwik";
import { component$, useSignal, $ } from "@builder.io/qwik";
import SearchIcon from "./search-icon.svg?jsx";
import styles from "./search.module.css";
import classNames from "classnames";
import { SearchDialog } from "./search-dialog";

export const SearchButton = component$<IntrinsicElements["button"]>((props) => {
  const showDialog = useSignal(false);

  const handleSearchClick = $(() => {
    showDialog.value = true;
  });

  return (
    <>
      <button
        {...props}
        class={classNames(styles.button, props.class)}
        onClick$={handleSearchClick}
        aria-label="Open Search Button"
      >
        <SearchIcon class={styles.searchIcon} />
      </button>

      <SearchDialog
        isOpen={showDialog.value}
        onClose={$(() => (showDialog.value = false))}
      />
    </>
  );
});
