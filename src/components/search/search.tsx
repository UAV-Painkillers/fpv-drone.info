import { component$ } from "@builder.io/qwik";
import SearchIcon from "./search.svg?jsx";
import styles from "./search.module.css";

export const Search = component$(() => {
  return (
    <>
      <button class={styles.button}>
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
