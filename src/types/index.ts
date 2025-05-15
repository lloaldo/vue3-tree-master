// Interfaz para la estructura de un nodo en el árbol
export interface TreeViewNode {
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
  children?: TreeViewNode[];
  parent?: TreeViewNode | null;
  level?: number;
  path?: string;
}

// Interfaz para el contexto del árbol, que contiene funciones compartidas

// Interfaz para la posición de un nodo en el árbol
export interface Position {
  level: number; // Nivel del nodo
  index: number; // Índice del nodo en su nivel
}

// Tipos de argumentos para los eventos emitidos
export type EmitEventArgs =
  | ['node-check', TreeViewNode, boolean, Position]
  | ['node-expand', TreeViewNode, boolean, Position]
  | ['async-load-nodes', TreeViewNode]
  | ['node-mouse-over', TreeViewNode, number, TreeViewNode | null]
  | ['node-drop', DragEvent, TreeViewNode, number, TreeViewNode | null]
  | ['drag-start', TreeViewNode];
  
export interface TreeContext {
  isLeaf: (node: TreeViewNode) => boolean; // Determina si un nodo es hoja
  childChecked: (node: TreeViewNode, checked: boolean, halfcheck: boolean) => void; // Propaga el estado checked a los hijos
  parentChecked: (node: TreeViewNode | null | undefined, checked: boolean, halfcheck: boolean) => boolean; // Propaga el estado checked al padre
  emitEventToTree: (...args: EmitEventArgs) => void; // Emite eventos al árbol
  nodeSelected: (node: TreeViewNode, position: Position) => void; // Maneja la selección de un nodo
  setAttr: (node: TreeViewNode, attr: keyof TreeViewNode, val: any) => void; // Establece un atributo en un nodo
}

export interface TreeExposedMethods {
  childCheckedHandle: (node: TreeViewNode, checked: boolean) => void;
  findNode: (nodes: TreeViewNode[], title: string) => TreeViewNode | null;
  addNode: (node: TreeViewNode, newNode: TreeViewNode) => void;
  addNodes: (node: TreeViewNode, newNodes: (TreeViewNode | string)[]) => void;
  delNode: (node: TreeViewNode, parent: TreeViewNode | null, index: number) => void;
  searchNodes: (keyword: string) => void;
  nodeSelected: (node: TreeViewNode, position: Position) => void;
  getCheckedNodes: (leafOnly: boolean, includeHalfChecked: boolean) => TreeViewNode[];
  getSelectedNodes: (leafOnly: boolean, includeHalfChecked: boolean) => TreeViewNode[];
  setNodeAttr: (node: TreeViewNode, attr: keyof TreeViewNode, val: any) => void;
  getNodes: (condition?: (node: TreeViewNode) => boolean) => TreeViewNode[];
}