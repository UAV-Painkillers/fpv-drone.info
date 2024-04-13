import type { IntrinsicElements } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";

export type TableData = Array<{
  __isHeadline__?: boolean | undefined;
  [key: string]: string | number | boolean | undefined;
}>;

export type TableColumns = Array<{ key: string; label: string }>;

interface TableProps {
  showColumnHeaders?: boolean;
  columns: TableColumns;
  data: TableData;
}

export const Table = component$<TableProps & IntrinsicElements["table"]>(
  (_props) => {
    const { showColumnHeaders, columns, data, ...tableProps } = _props;

    function parseValue(value: string | number | boolean | undefined) {
      if (typeof value === "boolean") {
        return value ? "Yes" : "No";
      }

      typeof value === "undefined" ? "N/A" : value;
      typeof value === "object" ? JSON.stringify(value) : value;

      return value;
    }

    return (
      <table {...tableProps}>
        {showColumnHeaders && (
          <thead>
            <th>Specification</th>
            <th>Value</th>
          </thead>
        )}
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {columns.map((column, columnIndex) => (
                <>
                  {row[column.key] &&
                    (row.__isHeadline__ ? (
                      <th key={`cell-${columnIndex}`} colSpan={2}>
                        {parseValue(row[column.key])}
                      </th>
                    ) : (
                      <td key={`cell-${columnIndex}`}>
                        {parseValue(row[column.key])}
                      </td>
                    ))}
                </>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
);
