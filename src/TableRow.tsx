import React from 'react';
import { renderElement } from './utils';
import { IRowRendererCBParam, IRenderExpandIcon, IOnRowHover, IOnRowExpandCBParam } from './BaseTable';
import { ICellRendererCBParam } from './Column';

type handlerArgs = { rowData: any, rowIndex: number, rowKey: string | number, event: Event };
export type handlerCollection = {[key: string]: (args: handlerArgs) => void};
type ITableRowCB<T, S> = (in_obj: T) => S;

export interface ITableRowProps {
  isScrolling: boolean;
  className: string;
  style: React.CSSProperties;
  columns: any [];
  rowData: any;
  rowIndex: number;
  rowKey: number;
  expandColumnKey: string;
  depth?: number;
  rowEventHandlers?: handlerCollection;
  rowRenderer: ITableRowCB<IRowRendererCBParam, React.ReactElement>;
  cellRenderer: ITableRowCB<ICellRendererCBParam, React.ElementType>;
  expandIconRenderer: ITableRowCB<IRenderExpandIcon, React.ReactNode>;
  onRowHover: ITableRowCB<IOnRowHover, void>;
  onRowExpand: ITableRowCB<IOnRowExpandCBParam, any>;
  tagName: React.ElementType;
};

/**
 * Row component for BaseTable
 */
class TableRow extends React.PureComponent<ITableRowProps> {
  public render() {
    /* eslint-disable no-unused-vars */
    const {
      isScrolling,
      className,
      style,
      columns,
      rowIndex,
      rowData,
      expandColumnKey,
      depth,
      rowEventHandlers,
      rowRenderer,
      cellRenderer,
      expandIconRenderer,
      tagName: Tag,
      // omit the following from rest
      rowKey,
      onRowHover,
      onRowExpand,
      ...rest
    } = this.props;
    /* eslint-enable no-unused-vars */

    const expandIcon = expandIconRenderer({ rowData, rowIndex, depth, onExpand: this.handleExpand });
    let cells = columns.map((column, columnIndex) =>
      cellRenderer({
        isScrolling,
        columns,
        column,
        columnIndex,
        rowData,
        rowIndex,
        expandIcon: column.key === expandColumnKey && expandIcon,
      })
    );

    if (rowRenderer) {
      cells = renderElement(rowRenderer, { isScrolling, cells, columns, rowData, rowIndex, depth });
    }

    const eventHandlers = this.getEventHandlers(rowEventHandlers);

    return (
      <Tag {...rest} className={className} style={style} {...eventHandlers}>
        {cells}
      </Tag>
    );
  }

  private handleExpand = (expanded: string[]) => {
    const { onRowExpand, rowData, rowIndex, rowKey } = this.props;
    onRowExpand && onRowExpand({ expanded, rowData, rowIndex, rowKey });
  }

  private getEventHandlers = (handlers: handlerCollection = {}) => {
    const { rowData, rowIndex, rowKey, onRowHover } = this.props;
    const eventHandlers: {[key:string]: (event:Event) =>  void} = {};
    Object.keys(handlers).forEach(eventKey => {
      const callback = handlers[eventKey];
      if (typeof callback === 'function') {
        eventHandlers[eventKey] = event => {
          callback({ rowData, rowIndex, rowKey, event });
        };
      }
    });

    if (onRowHover) {
      const mouseEnterHandler = eventHandlers['onMouseEnter'];
      eventHandlers['onMouseEnter'] = event => {
        onRowHover({
          hovered: true,
          rowData,
          rowIndex,
          rowKey,
          event,
        });
        mouseEnterHandler && mouseEnterHandler(event);
      };

      const mouseLeaveHandler = eventHandlers['onMouseLeave'];
      eventHandlers['onMouseLeave'] = event => {
        onRowHover({
          hovered: false,
          rowData,
          rowIndex,
          rowKey,
          event,
        });
        mouseLeaveHandler && mouseLeaveHandler(event);
      };
    }

    return eventHandlers;
  }
  public static defaultProps = {
    tagName: 'div',
  };
}


export default TableRow;
