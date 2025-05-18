<template>
  <div class="halo-tree">
    <TreeUl
      :data="data"
      :multiple="multiple"
      :draggable="draggable"
      :drag-after-expanded="dragAfterExpanded"
      :halfcheck="halfcheck"
      :scoped="scoped"
      :can-delete-root="canDeleteRoot"
      :tpl="tpl"
      :max-level="maxLevel"
      :level="0"
      :topMustExpand="topMustExpand"
      :allow-get-parent-node="allowGetParentNode"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, provide, watch } from 'vue';
import TreeUl from './TreeUl.vue';
import { useTreeMixins } from './composables/useTreeMixins';
import { useTreeLogic } from './composables/useTreeLogic';
import { VNode } from 'vue';
import type { TreeViewNode, TreeContext, Position, TreeExposedMethods, EmitEventArgs } from '@/types';

const props = defineProps<{
  data: TreeViewNode[];
  multiple?: boolean;
  draggable?: boolean;
  dragAfterExpanded?: boolean;
  halfcheck?: boolean;
  scoped?: boolean;
  canDeleteRoot?: boolean;
  tpl?: (node: TreeViewNode, ctx: { level: number; index: number }, parent: TreeViewNode | null, index: number, props: any) => VNode;
  maxLevel?: number;
  topMustExpand?: boolean;
  allowGetParentNode?: boolean;
}>();

const emit = defineEmits<{
  (e: 'node-check', node: TreeViewNode, checked: boolean, position: Position): void;
  (e: 'node-expand', node: TreeViewNode, expanded: boolean, position: Position): void;
  (e: 'async-load-nodes', node: TreeViewNode): void;
  (e: 'node-mouse-over', node: TreeViewNode, index: number, parent: TreeViewNode | null): void;
  (e: 'node-drop', draggedNode: TreeViewNode, targetNode: TreeViewNode | null, targetIndex: number, targetParent: TreeViewNode | null): void;
  (e: 'drag-start', node: TreeViewNode): void;
  (e: 'node-click', node: TreeViewNode, selected: boolean): void; 
}>();

const treeMixins = useTreeMixins();
const { getDragNode, cleanDragNode } = treeMixins;
const { expandedNodes, toggleNode } = useTreeLogic();

// Definimos treeData como un ref para que getCheckedNodes y getSelectedNodes funcionen
const treeData = ref<TreeViewNode[]>(props.data);

watch(
  () => props.data,
  (newVal) => {
    treeData.value = [...newVal]; // Copia superficial para garantizar reactividad
  },
  { immediate: true, deep: true }
);

function init() {
  const w = watch(
    () => treeData.value,
    (val) => {
      initNode(val, null, 0, '');
      // Inicializar estado de expansión basado en treeData
      val.forEach((node) => {
        if (node.expanded && node.id !== undefined) {
          expandedNodes.value.add(node.id);
        }
      });
      w();
    },
    { deep: true, immediate: true }
  );
}

function initNode(nodes: TreeViewNode[], parent: TreeViewNode | null, level: number, path: string) {
  nodes.forEach((node, index) => {
    node.parent = parent;
    node.level = level;
    node.path = path ? `${path}-${index}` : `${index}`;
    if (node.children) {
      initNode(node.children, node, level + 1, node.path);
    }
  });
}

function setAttr(node: TreeViewNode, attr: keyof TreeViewNode, val: any) {
  node[attr] = val;
  // Sincronizar estado de expansión con useTreeLogic
  if (attr === 'expanded' && node.id !== undefined) {
    if (val) {
      expandedNodes.value.add(node.id);
    } else {
      expandedNodes.value.delete(node.id);
    }
  }
}

const isLeaf = (node: TreeViewNode) => {
  return !(node.children && node.children.length);
};

const childChecked = (node: TreeViewNode, checked: boolean, halfcheck: boolean) => {
  if (node.children?.length) {
    node.children.forEach((child: TreeViewNode) => {
      if (!child.chkDisabled) {
        child.checked = checked;
        child.parentCheckedToChildren = true;
        if (halfcheck) {
          child.halfcheck = false;
        }
        childChecked(child, checked, halfcheck);
      }
    });
  }
};

const parentChecked = (node: TreeViewNode | null | undefined, checked: boolean, halfcheck: boolean) => {
  if (!node) return false;
  let checkedCount = 0;
  node.children?.forEach((child: TreeViewNode) => {
    if (child.checked) {
      checkedCount++;
    }
  });
  if (checkedCount === 0) {
    node.checked = checked;
    if (halfcheck) {
      node.halfcheck = false;
    }
  } else if (checkedCount === node.children?.length) {
    node.checked = checked;
    if (halfcheck) {
      node.halfcheck = false;
    }
  } else {
    node.checked = false;
    if (halfcheck) {
      node.halfcheck = true;
    }
  }
  return parentChecked(node.parent, checked, halfcheck);
};

function emitEventToTree(...args: EmitEventArgs) {
  const event = args[0];
  switch (event) {
    case 'node-check': {
      const [, node, checked, position] = args as ['node-check', TreeViewNode, boolean, Position];
      emit('node-check', node, checked, position);
      break;
    }
    case 'node-expand': {
      const [, node, expanded, position] = args as ['node-expand', TreeViewNode, boolean, Position];
      emit('node-expand', node, expanded, position);
      break;
    }
    case 'async-load-nodes': {
      const [, node] = args as ['async-load-nodes', TreeViewNode];
      emit('async-load-nodes', node);
      break;
    }
    case 'node-mouse-over': {
      const [, node, index, parent] = args as ['node-mouse-over', TreeViewNode, number, TreeViewNode | null];
      emit('node-mouse-over', node, index, parent);
      break;
    }
    case 'node-drop': {
      const [, ev, targetNode, targetIndex, targetParent] = args as ['node-drop', DragEvent, TreeViewNode, number, TreeViewNode | null];
      const guid = ev.dataTransfer?.getData('guid');
      if (!guid) {
        // Tree.vue node-drop: No GUID found in dataTransfer
        return;
      }
      const dragInfo = getDragNode(guid);
      if (dragInfo) {
        const draggedNode = dragInfo.node;
        // Mover el nodo dentro de la estructura del árbol
        moveNode(draggedNode, targetNode, targetIndex, targetParent);
        // Emitir el evento para notificar a los consumidores
        emit('node-drop', draggedNode, targetNode, targetIndex, targetParent);
      } else {
      }
      cleanDragNode(guid);
      break;
    }
    case 'drag-start': {
      const [, node] = args as ['drag-start', TreeViewNode];
      emit('drag-start', node);
      break;
    }
    default:
      console.warn(`Evento no manejado: ${event}`);
  }
}

// const nodeSelected = (node: TreeViewNode, position: Position) => {
//   if (node.selDisabled) return;
//   if (props.multiple) {
//     node.selected = !node.selected;
//   } else {
//     node.selected = true;
//   }
//   emit('node-mouse-over', node, position.index, null);
// };
const nodeSelected = (node: TreeViewNode, position: Position) => {
  if (node.selDisabled) return;
  if (props.multiple) {
    node.selected = !node.selected;
  } else {
    // Desmarcar otros nodos si no es modo múltiple
    treeData.value.forEach((n) => traverse(n, node));
    node.selected = true;
  }
  emit('node-click', node, node.selected); // Emitir evento node-click
};

function traverse(node: TreeViewNode, selectedNode: TreeViewNode) {
  if (node !== selectedNode) {
    node.selected = false;
  }
  if (node.children) {
    node.children.forEach((child) => traverse(child, selectedNode));
  }
}

const childCheckedHandle = (node: TreeViewNode, checked: boolean) => {
  childChecked(node, checked, props.halfcheck || false);
};

const findNode = (nodes: TreeViewNode[], title: string): TreeViewNode | null => {
  for (const node of nodes) {
    if (node.title === title) return node;
    if (node.children) {
      const found = findNode(node.children, title);
      if (found) return found;
    }
  }
  return null;
};

const addNode = (node: TreeViewNode, newNode: TreeViewNode) => {
  if (!node.children) {
    node.children = [];
  }
  node.children.push(newNode);
  setAttr(node, 'expanded', true);
};

const addNodes = (node: TreeViewNode, newNodes: (TreeViewNode | string)[]) => {
  if (!node.children) {
    node.children = [];
  }
  newNodes.forEach((item) => {
    if (typeof item === 'string') {
      node.children!.push({ title: item });
    } else {
      node.children!.push(item);
    }
  });
  setAttr(node, 'expanded', true);
};

const delNode = (node: TreeViewNode, parent: TreeViewNode | null, index: number) => {
  if (parent && parent.children) {
    parent.children.splice(index, 1);
  } else if (props.canDeleteRoot) {
    props.data.splice(index, 1);
  }
};

const searchNodes = (keyword: string) => {
  const search = (nodes: TreeViewNode[]) => {
    nodes.forEach((node) => {
      const title = node.title || '';
      node.searched = title.includes(keyword);
      if (node.children) {
        search(node.children);
      }
    });
  };
  search(props.data);
};

const getCheckedNodes = (leafOnly: boolean, includeHalfChecked: boolean): TreeViewNode[] => {
  const checkedNodes: TreeViewNode[] = [];

  function traverse(nodes: TreeViewNode[]) {
    for (const node of nodes) {
      const isLeafNode = !node.children?.length;
      const shouldInclude =
        (node.checked || (includeHalfChecked && node.halfcheck)) &&
        (!leafOnly || (leafOnly && isLeafNode));
      if (shouldInclude) {
        checkedNodes.push(node);
      }
      if (node.children) {
        traverse(node.children);
      }
    }
  }

  traverse(treeData.value);
  return checkedNodes;
};

const getSelectedNodes = (leafOnly: boolean, includeHalfChecked: boolean): TreeViewNode[] => {
  const selectedNodes: TreeViewNode[] = [];

  function traverse(nodes: TreeViewNode[]) {
    for (const node of nodes) {
      const isLeafNode = !node.children?.length;
      const shouldInclude =
        (node.selected || (includeHalfChecked && node.halfcheck)) &&
        (!leafOnly || (leafOnly && isLeafNode));
      if (shouldInclude) {
        selectedNodes.push(node);
      }
      if (node.children) {
        traverse(node.children);
      }
    }
  }

  traverse(treeData.value);
  return selectedNodes;
};

const setNodeAttr = (node: TreeViewNode, attr: keyof TreeViewNode, val: any) => {
  node[attr] = val;
};

const getNodes = (condition?: (node: TreeViewNode) => boolean): TreeViewNode[] => {
  const result: TreeViewNode[] = [];

  function traverse(nodes: TreeViewNode[]) {
    for (const node of nodes) {
      if (!condition || condition(node)) {
        result.push(node);
      }
      if (node.children) {
        traverse(node.children);
      }
    }
  }

  traverse(treeData.value);
  return result;
};

function moveNode(draggedNode: TreeViewNode, targetNode: TreeViewNode | null, targetIndex: number, targetParent: TreeViewNode | null) {

  // Validar que el nodo arrastrado tenga un identificador válido
  if (!draggedNode.id && !draggedNode.title) {
    console.warn('Tree.vue: Dragged node lacks id and title, cannot move:', draggedNode);
    return;
  }

  // Función para eliminar el nodo de su posición original
  const removeFromParent = (nodes: TreeViewNode[], nodeToRemove: TreeViewNode): boolean => {
    const index = nodes.findIndex((n) => 
      (nodeToRemove.id && n.id === nodeToRemove.id) || 
      (nodeToRemove.title && n.title === nodeToRemove.title)
    );
    if (index !== -1) {
      nodes.splice(index, 1);
      return true;
    }
    for (const node of nodes) {
      if (node.children) {
        if (removeFromParent(node.children, nodeToRemove)) {
          return true;
        }
      }
    }
    return false;
  };

  // Eliminar el nodo arrastrado de su posición original
  const removed = removeFromParent(treeData.value, draggedNode);
  if (!removed) {
    console.warn('Tree.vue: Node not found in original position:', draggedNode.title || draggedNode.id);
    return;
  }

  // Insertar el nodo en la nueva posición
  if (targetParent) {
    if (!targetParent.children) {
      targetParent.children = [];
    }
    targetParent.children.splice(targetIndex, 0, draggedNode);
    draggedNode.parent = targetParent;
    // Expandir el nodo padre si está en la posición "inside"
    if (props.dragAfterExpanded && targetParent.id !== undefined) {
      toggleNode(targetParent);
      setAttr(targetParent, 'expanded', true);
    }
  } else if (targetNode === null) {
    treeData.value.splice(targetIndex, 0, draggedNode);
    draggedNode.parent = null;
  } else {
    if (!targetNode.children) {
      targetNode.children = [];
    }
    targetNode.children.splice(targetIndex, 0, draggedNode);
    draggedNode.parent = targetNode;
    // Expandir el nodo objetivo si está en la posición "inside"
    if (props.dragAfterExpanded && targetNode.id !== undefined) {
      toggleNode(targetNode);
      setAttr(targetNode, 'expanded', true);
    }
  }

  // Forzar actualización reactiva
  treeData.value = [...treeData.value];
}

const treeContext: TreeContext = {
  isLeaf,
  childChecked,
  parentChecked,
  emitEventToTree,
  nodeSelected,
  setAttr,
};

provide('treeContext', treeContext);

const methods: TreeExposedMethods = {
  childCheckedHandle,
  findNode,
  addNode,
  addNodes,
  delNode,
  searchNodes,
  nodeSelected,
  getCheckedNodes,
  getSelectedNodes,
  setNodeAttr,
  getNodes,
};

defineExpose(methods);

watch(
  () => props.data,
  () => {
    const initTreeData = (nodes: TreeViewNode[]) => {
      nodes.forEach((node) => {
        if (node.children?.length) {
          node.children.forEach((child: TreeViewNode, index: number) => {
            child.parent = node;
            child.level = (node.level || 0) + 1;
            child.path = `${node.path || '0'}-${index}`;
            initTreeData([child]);
          });
        }
      });
    };
    initTreeData(props.data);
  },
  { immediate: true }
);
</script>

<!-- <style src="./tree.css"></style> -->