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
import { VNode } from 'vue';
import type { TreeNode, TreeContext, Position, TreeExposedMethods, EmitEventArgs } from './types';

const props = defineProps<{
  data: TreeNode[];
  treeData: TreeNode[];
  multiple?: boolean;
  draggable?: boolean;
  dragAfterExpanded?: boolean;
  halfcheck?: boolean;
  scoped?: boolean;
  canDeleteRoot?: boolean;
  tpl?: (node: TreeNode, ctx: { level: number; index: number }, parent: TreeNode | null, index: number, props: any) => VNode;
  maxLevel?: number;
  topMustExpand?: boolean;
  allowGetParentNode?: boolean;
}>();

const emit = defineEmits<{
  (e: 'node-check', node: TreeNode, checked: boolean, position: Position): void;
  (e: 'node-expand', node: TreeNode, expanded: boolean, position: Position): void;
  (e: 'async-load-nodes', node: TreeNode): void;
  (e: 'node-mouse-over', node: TreeNode, index: number, parent: TreeNode | null): void;
  (e: 'node-drop', draggedNode: TreeNode, targetNode: TreeNode | null, targetIndex: number, targetParent: TreeNode | null): void;
  (e: 'drag-start', node: TreeNode): void;
}>();

const treeMixins = useTreeMixins();
const { getDragNode, cleanDragNode } = treeMixins;

// Definimos treeData como un ref para que getCheckedNodes y getSelectedNodes funcionen
const treeData = ref<TreeNode[]>(props.data);


watch(
  () => props.data,
  (newVal) => {
    treeData.value = newVal;
  },
  { immediate: true }
);

function init() {
  const w = watch(
    () => treeData.value,
    (val) => {
      initNode(val, null, 0, '');
      w();
    },
    { deep: true, immediate: true }
  );
}

function initNode(nodes: TreeNode[], parent: TreeNode | null, level: number, path: string) {
  nodes.forEach((node, index) => {
    node.parent = parent;
    node.level = level;
    node.path = path ? `${path}-${index}` : `${index}`;
    if (node.children) {
      initNode(node.children, node, level + 1, node.path);
    }
  });
}

function setAttr(node: TreeNode, attr: keyof TreeNode, val: any) {
  node[attr] = val;
}

const isLeaf = (node: TreeNode) => {
  return !(node.children && node.children.length);
};

const childChecked = (node: TreeNode, checked: boolean, halfcheck: boolean) => {
  if (node.children?.length) {
    node.children.forEach((child: TreeNode) => {
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

const parentChecked = (node: TreeNode | null | undefined, checked: boolean, halfcheck: boolean) => {
  if (!node) return false;
  let checkedCount = 0;
  node.children?.forEach((child: TreeNode) => {
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
      const [, node, checked, position] = args as ['node-check', TreeNode, boolean, Position];
      emit('node-check', node, checked, position);
      break;
    }
    case 'node-expand': {
      const [, node, expanded, position] = args as ['node-expand', TreeNode, boolean, Position];
      emit('node-expand', node, expanded, position);
      break;
    }
    case 'async-load-nodes': {
      const [, node] = args as ['async-load-nodes', TreeNode];
      emit('async-load-nodes', node);
      break;
    }
    case 'node-mouse-over': {
      const [, node, index, parent] = args as ['node-mouse-over', TreeNode, number, TreeNode | null];
      emit('node-mouse-over', node, index, parent);
      break;
    }
    case 'node-drop': {
      const [, ev, targetNode, targetIndex, targetParent] = args as ['node-drop', DragEvent, TreeNode, number, TreeNode | null];
      console.log('Tree.vue emitEventToTree node-drop:', { targetNode: targetNode?.title || 'none', targetIndex, targetParent: targetParent?.title || 'none' });
      const guid = ev.dataTransfer?.getData('guid');
      if (!guid) {
        console.log('Tree.vue node-drop: No GUID found in dataTransfer');
        return;
      }
      const dragInfo = getDragNode(guid);
      if (dragInfo) {
        const draggedNode = dragInfo.node;
        console.log('Tree.vue emitting node-drop:', { draggedNode: draggedNode.title, targetNode: targetNode?.title || 'none', targetIndex, targetParent: targetParent?.title || 'none' });
        emit('node-drop', draggedNode, targetNode, targetIndex, targetParent);
      } else {
        console.log('Tree.vue node-drop: dragInfo not found for GUID:', guid);
      }
      break;
    }
    case 'drag-start': {
      const [, node] = args as ['drag-start', TreeNode];
      console.log('Tree.vue emitting drag-start:', node.title);
      emit('drag-start', node);
      break;
    }
    default:
      console.warn(`Evento no manejado: ${event}`);
  }
}

const nodeSelected = (node: TreeNode, position: Position) => {
  if (node.selDisabled) return;
  if (props.multiple) {
    node.selected = !node.selected;
  } else {
    node.selected = true;
  }
  emit('node-mouse-over', node, position.index, null);
};

const childCheckedHandle = (node: TreeNode, checked: boolean) => {
  childChecked(node, checked, props.halfcheck || false);
};

const findNode = (nodes: TreeNode[], title: string): TreeNode | null => {
  for (const node of nodes) {
    if (node.title === title) return node;
    if (node.children) {
      const found = findNode(node.children, title);
      if (found) return found;
    }
  }
  return null;
};

const addNode = (node: TreeNode, newNode: TreeNode) => {
  if (!node.children) {
    node.children = [];
  }
  node.children.push(newNode);
  setAttr(node, 'expanded', true);
};

const addNodes = (node: TreeNode, newNodes: (TreeNode | string)[]) => {
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

const delNode = (node: TreeNode, parent: TreeNode | null, index: number) => {
  if (parent && parent.children) {
    parent.children.splice(index, 1);
  } else if (props.canDeleteRoot) {
    props.data.splice(index, 1);
  }
};

const searchNodes = (keyword: string) => {
  const search = (nodes: TreeNode[]) => {
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

const getCheckedNodes = (leafOnly: boolean, includeHalfChecked: boolean): TreeNode[] => {
  const checkedNodes: TreeNode[] = [];

  function traverse(nodes: TreeNode[]) {
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

const getSelectedNodes = (leafOnly: boolean, includeHalfChecked: boolean): TreeNode[] => {
  const selectedNodes: TreeNode[] = [];

  function traverse(nodes: TreeNode[]) {
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

const setNodeAttr = (node: TreeNode, attr: keyof TreeNode, val: any) => {
  node[attr] = val;
};

const getNodes = (condition?: (node: TreeNode) => boolean): TreeNode[] => {
  const result: TreeNode[] = [];

  function traverse(nodes: TreeNode[]) {
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

function moveNode(draggedNode: TreeNode, targetNode: TreeNode | null, targetIndex: number, targetParent: TreeNode | null) {
  console.log('Moving node:', draggedNode.title, 'to target:', targetNode?.title || 'none', 'at index:', targetIndex, 'with parent:', targetParent?.title);
  const removeFromParent = (nodes: TreeNode[], nodeToRemove: TreeNode): boolean => {
    const index = nodes.findIndex((n) => n === nodeToRemove);
    if (index !== -1) {
      nodes.splice(index, 1);
      console.log('Removed node from original position:', nodeToRemove.title);
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

  removeFromParent(treeData.value, draggedNode);

  if (targetParent) {
    if (!targetParent.children) {
      targetParent.children = [];
    }
    targetParent.children.splice(targetIndex, 0, draggedNode);
    draggedNode.parent = targetParent;
    console.log('Inserted node into new parent:', targetParent.title, 'at index:', targetIndex);
  } else if (targetNode === null) {
    treeData.value.splice(targetIndex, 0, draggedNode);
    draggedNode.parent = null;
    console.log('Inserted node as root at index:', targetIndex);
  } else {
    if (!targetNode.children) {
      targetNode.children = [];
    }
    targetNode.children.splice(targetIndex, 0, draggedNode);
    draggedNode.parent = targetNode;
    console.log('Inserted node into target:', targetNode.title, 'at index:', targetIndex);
  }

  // Forzar actualización reactiva
  treeData.value = [...treeData.value];
  console.log('Tree after move:', treeData.value);
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
    const initTreeData = (nodes: TreeNode[]) => {
      nodes.forEach((node) => {
        if (node.children?.length) {
          node.children.forEach((child: TreeNode, index: number) => {
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

<style src="./tree.css"></style>