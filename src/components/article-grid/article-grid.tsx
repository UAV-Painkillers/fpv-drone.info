import { Resource, Slot, component$, useResource$ } from "@builder.io/qwik";
import styles from "./article-grid.module.css";
import classnames from "classnames";
import { Card, CardVariant } from "../card/card";
import { getAllContent } from "@builder.io/sdk-qwik";

enum ArticleRowVariant {
  one = "one",
  two = "two",
}

interface ArticleRowProps {
  variant: ArticleRowVariant;
}
const ArticleRow = component$((props: ArticleRowProps) => {
  return (
    <div
      class={classnames(
        styles.gridRow,
        props.variant === ArticleRowVariant.one
          ? styles.variantOne
          : styles.variantTwo,
      )}
    >
      <Slot />
    </div>
  );
});

interface Props {
  articleType: string;
}

interface Article {
  id: string;
  data: {
    title: string;
    description: string;
    previewImage: string;
    url: string;
  };
}

export const ArticleGrid = component$((props: Props) => {
  const matchingArticles = useResource$(() =>
    getAllContent({
      model: "article",
      apiKey: import.meta.env.PUBLIC_BUILDER_API_KEY,
      query: {
        data: {
          articleType: props.articleType,
        },
      },
    }).then((articles) => {
      const rows: Array<Article[]> = [];

      (articles as {results: Article[]}).results.forEach((article, index) => {
        if (index % 3 === 0) {
          rows.push([]);
        }
        rows[rows.length - 1].push(article);
      });

      return rows;
    }),
  );

  return (
    <Resource
      value={matchingArticles}
      onPending={() => <>Loading...</>}
      onRejected={(error) => <>Error: {error.message}</>}
      onResolved={(rows) => (
        <div class={styles.grid}>
          {(rows as Array<Article[]>).map((row, rowIndex) => (
            <ArticleRow
              key={`row-${rowIndex}`}
              variant={
                rowIndex % 2 === 0
                  ? ArticleRowVariant.one
                  : ArticleRowVariant.two
              }
            >
              {row.map((article, articleIndex) => {
                let variant = CardVariant.small;

                if (rowIndex % 2 === 0 && articleIndex === 0) {
                  variant = CardVariant.large;
                }

                if (rowIndex % 2 !== 0 && articleIndex === 2) {
                  variant = CardVariant.large;
                }

                return (
                  <Card
                    key={`article-${article.id}`}
                    variant={variant}
                    title={article.data.title}
                    headerImageUrl={article.data.previewImage}
                    description={article.data.description}
                    href={article.data.url}
                  />
                );
              })}
            </ArticleRow>
          ))}
        </div>
      )}
    />
  );
});
