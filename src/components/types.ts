// src/components/types.ts
export interface TreeNode {
  id?: string | number;
  title?: string;
  label?: string;
  children?: TreeNode[];
  checked?: boolean;
  halfcheck?: boolean;
  selected?: boolean;
  expanded?: boolean;
  visible?: boolean;
  searched?: boolean;
  chkDisabled?: boolean;
  parentCheckedToChildren?: boolean;
  parent?: TreeNode | null | (() => TreeNode | null);
  loading?: boolean;
  async?: boolean;
  nocheck?: boolean;
  hasExpanded?: boolean;
  selDisabled?: boolean;
  [key: string]: any;
}

export interface TreeContext {
  isLeaf: (node: TreeNode) => boolean;
  childChecked: (node: TreeNode, checked: boolean, halfcheck?: boolean) => void;
  parentChecked: (node: TreeNode | null, checked: boolean, halfcheck?: boolean) => boolean;
  emitEventToTree: (eventName: string, ...args: any[]) => void;
  nodeSelected: (node: TreeNode, position: any) => void;
  setAttr: (node: TreeNode, attr: string, val?: any) => void;
}