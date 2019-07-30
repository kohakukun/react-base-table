import React from 'react';
import {IColumnProps} from './Column';

import { noop, addClassName, removeClassName } from './utils';

const INVALID_VALUE: null = null;

// copied from https://github.com/mzabriskie/react-draggable/blob/master/lib/utils/domFns.js
export function addUserSelectStyles(doc: Document) {
  if (!doc) return;
  let styleEl = doc.getElementById('react-draggable-style-el') as IHTMLElementExtended;
  if (!styleEl) {
    styleEl = doc.createElement('style');
    styleEl.type = 'text/css';
    styleEl.id = 'react-draggable-style-el';
    styleEl.innerHTML = '.react-draggable-transparent-selection *::-moz-selection {background: transparent;}\n';
    styleEl.innerHTML += '.react-draggable-transparent-selection *::selection {background: transparent;}\n';
    doc.getElementsByTagName('head')[0].appendChild(styleEl);
  }
  if (doc.body) addClassName(doc.body, 'react-draggable-transparent-selection');
}

export function removeUserSelectStyles(doc: Document) {
  try {
    if (doc && doc.body) removeClassName(doc.body, 'react-draggable-transparent-selection');
    if ((doc as any).selection) {
      (doc as any).selection.empty();
    } else {
      window.getSelection().removeAllRanges(); // remove selection caused by scroll
    }
  } catch (e) {
    // probably IE
  }
}

/**
 * ColumnResizer for BaseTable
 */
class ColumnResizer extends React.PureComponent<IColumnResizerProps> {
  private isDragging = false;
  private lastX: number | typeof INVALID_VALUE = INVALID_VALUE;
  private width = 0;
  private handleRef: HTMLDivElement;

  public componentWillMount() {
    if (this.handleRef) {
      const { ownerDocument } = this.handleRef;
      ownerDocument.removeEventListener('mousemove', this._handleMouseMove);
      ownerDocument.addEventListener('mouseup', this._handleMouseUp);
      removeUserSelectStyles(ownerDocument);
    }
  }

  public render() {
    const { style, column, onResizeStart, onResize, onResizeStop, minWidth, ...rest } = this.props;

    return (
      <div
        {...rest}
        ref={this._setHandleRef}
        onClick={this._handleClick}
        onMouseDown={this._handleMouseDown}
        onMouseUp={this._handleMouseUp}
        style={{
          userSelect: 'none',
          touchAction: 'none',
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          cursor: 'col-resize',
          ...style,
        }}
      />
    );
  }

  private _setHandleRef = (ref: HTMLDivElement) => {
    this.handleRef = ref;
  }

  private _handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
  }

  private _handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (typeof e.button === 'number' && e.button !== 0) return;

    this.isDragging = true;
    this.lastX = INVALID_VALUE;
    this.width = this.props.column.width;
    this.props.onResizeStart(this.props.column);

    const { ownerDocument } = this.handleRef;
    addUserSelectStyles(ownerDocument);
    ownerDocument.addEventListener('mousemove', this._handleMouseMove);
    ownerDocument.addEventListener('mouseup', this._handleMouseUp);
  }

  private _handleMouseUp = () => {
    if (!this.isDragging) return;
    this.isDragging = false;

    this.props.onResizeStop(this.props.column);

    const { ownerDocument } = this.handleRef;
    removeUserSelectStyles(ownerDocument);
    ownerDocument.removeEventListener('mousemove', this._handleMouseMove);
    ownerDocument.addEventListener('mouseup', this._handleMouseUp);
  }

  private _handleMouseMove = (e: MouseEvent) => {
    const { offsetParent } = this.handleRef;
    const offsetParentRect = offsetParent.getBoundingClientRect();
    const x = e.clientX + offsetParent.scrollLeft - offsetParentRect.left;

    if (this.lastX === INVALID_VALUE) {
      this.lastX = x;
      return;
    }

    const { column, minWidth: MIN_WIDTH } = this.props;
    const { width, maxWidth, minWidth = MIN_WIDTH } = column;
    const movedX = x - this.lastX;
    if (!movedX) return;

    this.width = this.width + movedX;
    this.lastX = x;

    let newWidth = this.width;
    if (maxWidth && newWidth > maxWidth) {
      newWidth = maxWidth;
    } else if (newWidth < minWidth) {
      newWidth = minWidth;
    }

    if (newWidth === width) return;
    let onResizeParam = {column, newWidth}
    this.props.onResize(onResizeParam);
  }

  public static defaultProps = {
    onResizeStart: noop,
    onResize: noop,
    onResizeStop: noop,
    minWidth: 30,
  }
}

interface IHTMLElementExtended extends HTMLElement {
  type?: string
};

type IColumnResizerCallBack<T> = (in_obj: T) => any;
export interface IOnResizeStartCBParam {
  column? : IColumnProps;
  key?: string | number;
}
export interface IColumnResizerProps {
  /**
   * Custom style for the drag handler
   */
  style?: React.CSSProperties;
  /**
   * The column object to be dragged
   */
  column?: IColumnProps;
  /**
   * A callback function when resizing started
   * The callback is of the shape of `(column) => *`
   */
  onResizeStart?: IColumnResizerCallBack<IOnResizeStartCBParam>;

  /**
   * A callback function when resizing the column
   * The callback is of the shape of `(column, width) => *`
   */
  onResize?: IColumnResizerCallBack<IOnResizeCBParam>
  /**
   * A callback function when resizing stopped
   * The callback is of the shape of `(column) => *`
   */
  onResizeStop?: (column: IColumnProps) => any;
  /**
   * Minimum width of the column could be resized to if the column's `minWidth` is not set
   */
  minWidth?: number;
};

export interface IOnResizeCBParam {
  key?: string | null;
  width?: number;
  newWidth?: number;
}
export default ColumnResizer;
