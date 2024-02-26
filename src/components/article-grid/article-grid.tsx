import {
  Resource,
  Slot,
  component$,
  useResource$,
  useSignal,
} from "@builder.io/qwik";
import styles from "./article-grid.module.css";
import classnames from "classnames";
import { Card, CardVariant } from "../card/card";
import type { RegisteredComponent} from "@builder.io/sdk-qwik";
import { getAllContent } from "@builder.io/sdk-qwik";
import { Link } from "@builder.io/qwik-city";
import classNames from "classnames";

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
          : styles.variantTwo
      )}
    >
      <Slot />
    </div>
  );
});

interface ArticleGridProps {
  articleType: string;
  title?: string;
  hideTitleIfEmpty?: boolean;
  href?: string;
}

interface Article {
  id: string;
  data: {
    content: {
      title: string;
      description: string;
    };
    previewImage: string;
    url: string;
  };
}

const LoadingState = component$(() => {
  return (
    <ArticleRow variant={ArticleRowVariant.one}>
      <Card title="" variant={CardVariant.large} isLoading />
      <Card title="" variant={CardVariant.small} isLoading />
      <Card title="" variant={CardVariant.small} isLoading />
    </ArticleRow>
  );
});

export const ArticleGrid = component$((props: ArticleGridProps) => {
  const showTitle = useSignal(!!props.title);
  const hideTitleIfEmpty = props.hideTitleIfEmpty ?? false;

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
      const typedArticles = articles as { results: Article[] } | undefined;
      if (typedArticles?.results.length === 0 && hideTitleIfEmpty) {
        showTitle.value = false;
      }

      const rows: Array<Article[]> = [];

      typedArticles?.results.forEach((article, index) => {
        if (index % 3 === 0) {
          rows.push([]);
        }
        rows[rows.length - 1].push(article);
      });

      return rows;
    })
  );

  return (
    <div class={styles.grid}>
      {showTitle.value &&
        (props.href ? (
          <Link class={classNames("anchor", styles.title)} href={props.href}>
            {props.title}
          </Link>
        ) : (
          <span class={styles.title}>{props.title}</span>
        ))}
      <Resource
        value={matchingArticles}
        onPending={() => <LoadingState />}
        onRejected={(error) => <>Error: {error.message}</>}
        onResolved={(rows) => (
          <>
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
                      title={article.data.content.title}
                      headerImageSrc={article.data.previewImage}
                      description={article.data.content.description}
                      href={article.data.url}
                    />
                  );
                })}
              </ArticleRow>
            ))}
          </>
        )}
      />
    </div>
  );
});


export const ArticleGridRegistryDefinition: RegisteredComponent = {
  component: ArticleGrid,
  name: "ArticleGrid",
  inputs: [
    {
      name: "articleType",
      friendlyName: 'Type',
      type: "string",
      required: true,
    },
    {
      name: "title",
      friendlyName: 'Title',
      type: "string",
      required: false,
    },
    {
      name: "hideTitleIfEmpty",
      friendlyName: 'Hide if title is empty?',
      type: "boolean",
      required: false,
    },
    {
      name: "href",
      friendlyName: 'href',
      type: "string",
      required: false,
    },
  ],
},