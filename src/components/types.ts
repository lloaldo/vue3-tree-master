// Interfaz para la estructura de un nodo en el árbol
export interface TreeNode {
  title?: string; // Título del nodo
  expanded?: boolean; // Indica si el nodo está expandido
  hasExpanded?: boolean; // Indica si el nodo alguna vez se ha expandido
  checked?: boolean; // Indica si el nodo está marcado (checkbox)
  halfcheck?: boolean; // Indica si el nodo está en estado de "medio marcado"
  selected?: boolean; // Indica si el nodo está seleccionado
  visible?: boolean; // Indica si el nodo es visible
  async?: boolean; // Indica si el nodo carga hijos de forma asíncrona
  loading?: boolean; // Indica si el nodo está en estado de carga
  chkDisabled?: boolean; // Deshabilita el checkbox del nodo
  nocheck?: boolean; // Indica si el nodo no debe mostrar un checkbox
  parentCheckedToChildren?: boolean; // Indica si el estado checked viene del padre
  searched?: boolean; // Indica si el nodo coincide con una búsqueda
  children?: TreeNode[]; // Lista de nodos hijos
  parent?: TreeNode | null; // Referencia al nodo padre
  level?: number; // Nivel del nodo en el árbol
  path?: string; // Ruta del nodo en el árbol (por ejemplo, "0-1")
}

// Interfaz para el contexto del árbol, que contiene funciones compartidas
export interface TreeContext {
  isLeaf: (node: TreeNode) => boolean; // Determina si un nodo es hoja
  childChecked: (node: TreeNode, checked: boolean, halfcheck: boolean) => void; // Propaga el estado checked a los hijos
  parentChecked: (node: TreeNode | null | undefined, checked: boolean, halfcheck: boolean) => boolean; // Propaga el estado checked al padre
  emitEventToTree: (event: string, ...args: any[]) => void; // Emite eventos al árbol
  nodeSelected: (node: TreeNode, position: Position) => void; // Maneja la selección de un nodo
  setAttr: (node: TreeNode, attr: keyof TreeNode, val: any) => void; // Establece un atributo en un nodo
}

// Interfaz para la posición de un nodo en el árbol
export interface Position {
  level: number; // Nivel del nodo
  index: number; // Índice del nodo en su nivel
}

export interface TreeExposedMethods {
  setNodeAttr(node: TreeNode, attr: string, val: any): void;
  nodeSelected(node: TreeNode, position: { level: number; index: number }): void;
  addNode(parent: TreeNode | null, newNode: TreeNode | string): void; // Agrega un nodo
  addNodes(parent: TreeNode | null, children: (TreeNode | string)[]): void; // Agrega múltiples nodos
  delNode(node: TreeNode, parent: TreeNode | null, index: number): void;  // Elimina un nodo
  getNodes(opt?: Record<string, any>, data?: TreeNode[], isOriginal?: boolean, ignoreInvisibleNode?: boolean): TreeNode[];
  getSelectedNodes(isOriginal: boolean, ignoreInvisibleNode?: boolean): TreeNode[];
  getCheckedNodes(isOriginal: boolean, ignoreInvisibleNode?: boolean): TreeNode[];
  searchNodes(filter: string | ((node: TreeNode) => boolean), data?: TreeNode[]): void; // Busca nodos por palabra clave
  childCheckedHandle(node: TreeNode, checked: boolean, halfcheck?: boolean): void;  // Maneja el estado checked de los hijos
}