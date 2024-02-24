import type { IntrinsicElements } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";
import SearchIcon from "./search.svg?jsx";
import styles from "./search.module.css";
import classNames from "classnames";

export const Search = component$<IntrinsicElements["button"]>((props) => {
  return (
    <>
      <button {...props} class={classNames(styles.button, props.class)}>
        <SearchIcon class={styles.searchIcon} />
      </button>
      <dialog>
        <form>
          <input type="search" />
        </form>
      </dialog>
    </>
  );
});
