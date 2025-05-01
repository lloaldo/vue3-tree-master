// src/components/types.ts
export interface TreeNode {
  title?: string;
  expanded?: boolean;
  hasExpanded?: boolean;
  checked?: boolean;
  halfcheck?: boolean;
  visible?: boolean;
  searched?: boolean;
  selected?: boolean;
  async?: boolean;
  loading?: boolean;
  nocheck?: boolean;
  chkDisabled?: boolean;
  parentCheckedToChildren?: boolean;
  children?: TreeNode[];
  id?: string | number;
  parent?: TreeNode;
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

export interface TreeExposedMethods {
  setNodeAttr(node: TreeNode, attr: string, val: any): void;
  nodeSelected(node: TreeNode, position: { level: number; index: number }): void;
  addNode(parent: TreeNode | null, newNode: TreeNode | string): void;
  addNodes(parent: TreeNode | null, children: (TreeNode | string)[]): void;
  delNode(node: TreeNode, parent: TreeNode | null, index: number): void;
  getNodes(opt?: Record<string, any>, data?: TreeNode[], isOriginal?: boolean, ignoreInvisibleNode?: boolean): TreeNode[];
  getSelectedNodes(isOriginal: boolean, ignoreInvisibleNode?: boolean): TreeNode[];
  getCheckedNodes(isOriginal: boolean, ignoreInvisibleNode?: boolean): TreeNode[];
  searchNodes(filter: string | ((node: TreeNode) => boolean), data?: TreeNode[]): void;
  childCheckedHandle(node: TreeNode, checked: boolean, halfcheck?: boolean): void;
}