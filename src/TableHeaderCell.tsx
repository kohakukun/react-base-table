import React from 'react';

export interface TableHeaderCellProps {
  className?: string,
  column?: {title: string},
  columnIndex?: number,
};

/**
 * HeaderCell component for BaseTable
 */
const TableHeaderCell: React.FunctionComponent<TableHeaderCellProps> = ({ className, column, columnIndex }) => 
  (<div className={className}>{column.title}</div>);


export default TableHeaderCell;
