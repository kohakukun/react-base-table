import React from 'react';
import { toString } from './utils';

export interface TableCellProps {
  className: string,
  cellData: any,
  column: object,
  columnIndex: number,
  rowData: object,
  rowIndex: number,
}

/**
 * Cell component for BaseTable
 */
const TableCell: React.FunctionComponent<React.HTMLProps<HTMLDivElement> & TableCellProps> =
({ className, cellData, column, columnIndex, rowData, rowIndex }) => (
  <div className={className}>{React.isValidElement(cellData) ? cellData : toString(cellData)}</div>
);


export default TableCell;
