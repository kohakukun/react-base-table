import React from 'react';

import { renderElement } from './utils';

export interface TableHeaderRowProps {
  isScrolling: boolean;
  className: string;
  style: object,
  columns: object[],
  headerIndex: number;
  cellRenderer: Function;
  headerRenderer: Function | React.ReactNode;
  expandColumnKey: string;
  expandIcon: React.ElementType;
  tagName: React.ElementType;
};


/**
 * HeaderRow component for BaseTable
 */
const TableHeaderRow: React.FunctionComponent<TableHeaderRowProps> = ({
  className,
  style,
  columns,
  headerIndex,
  cellRenderer,
  headerRenderer,
  expandColumnKey,
  expandIcon: ExpandIcon,
  tagName: Tag,
  ...rest
}) => {
  let cells = columns.map((column, columnIndex) =>
    cellRenderer({
      columns,
      column,
      columnIndex,
      headerIndex,
      expandIcon: column.key === expandColumnKey && <ExpandIcon />,
    })
  );

  if (headerRenderer) {
    cells = renderElement(headerRenderer, { cells, columns, headerIndex });
  }

  return (
    <Tag {...rest} className={className} style={style}>
      {cells}
    </Tag>
  );
};

TableHeaderRow.defaultProps = {
  tagName: 'div',
};

export default TableHeaderRow;
