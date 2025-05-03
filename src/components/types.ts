// Interfaz para la estructura de un nodo en el árbol
export interface TreeNode {
  title?: string;
  id?: string | number;
  expanded?: boolean;
  hasExpanded?: boolean;
  checked?: boolean;
  halfcheck?: boolean;
  selected?: boolean;
  visible?: boolean;
  async?: boolean;
  loading?: boolean;
  chkDisabled?: boolean;
  nocheck?: boolean;
  parentCheckedToChildren?: boolean;
  searched?: boolean;
  selDisabled?: boolean; // Nueva propiedad para deshabilitar la selección
  children?: TreeNode[];
  parent?: TreeNode | null;
  level?: number;
  path?: string;
}

// Interfaz para el contexto del árbol, que contiene funciones compartidas
export interface TreeContext {
  isLeaf: (node: TreeNode) => boolean; // Determina si un nodo es hoja
  childChecked: (node: TreeNode, checked: boolean, halfcheck: boolean) => void; // Propaga el estado checked a los hijos
  parentChecked: (node: TreeNode | null | undefined, checked: boolean, halfcheck: boolean) => boolean; // Propaga el estado checked al padre
  emitEventToTree: (...args: EmitEventArgs) => void; // Emite eventos al árbol
  nodeSelected: (node: TreeNode, position: Position) => void; // Maneja la selección de un nodo
  setAttr: (node: TreeNode, attr: keyof TreeNode, val: any) => void; // Establece un atributo en un nodo
}

// Interfaz para la posición de un nodo en el árbol
export interface Position {
  level: number; // Nivel del nodo
  index: number; // Índice del nodo en su nivel
}

// Tipos de argumentos para los eventos emitidos
export type EmitEventArgs =
  | ['node-check', TreeNode, boolean, Position]
  | ['node-expand', TreeNode, boolean, Position]
  | ['async-load-nodes', TreeNode]
  | ['node-mouse-over', TreeNode, number, TreeNode | null]
  | ['node-drop', DragEvent, TreeNode, number, TreeNode | null]
  | ['drag-node-end', { dragNode: TreeNode; targetNode: TreeNode; parentNode: TreeNode | null; event: DragEvent }];

export interface TreeExposedMethods {
  childCheckedHandle: (node: TreeNode, checked: boolean) => void;
  findNode: (nodes: TreeNode[], title: string) => TreeNode | null;
  addNode: (node: TreeNode, newNode: TreeNode) => void;
  addNodes: (node: TreeNode, newNodes: (TreeNode | string)[]) => void;
  delNode: (node: TreeNode, parent: TreeNode | null, index: number) => void;
  searchNodes: (keyword: string) => void;
  nodeSelected: (node: TreeNode, position: Position) => void;
  getCheckedNodes: (leafOnly: boolean, includeHalfChecked: boolean) => TreeNode[];
  getSelectedNodes: (leafOnly: boolean, includeHalfChecked: boolean) => TreeNode[];
  setNodeAttr: (node: TreeNode, attr: keyof TreeNode, val: any) => void;
  getNodes: (condition?: (node: TreeNode) => boolean) => TreeNode[];
  moveNode: (draggedNode: TreeNode, targetNode: TreeNode, targetIndex: number, targetParent: TreeNode | null) => void;
}