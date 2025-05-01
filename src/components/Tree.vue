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
      :top-must-expand="topMustExpand"
      :allow-get-parent-node="allowGetParentNode"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, provide, watch } from 'vue';
import TreeUl from './TreeUl.vue';
import { VNode } from 'vue';
import type { TreeNode, TreeContext, Position, TreeExposedMethods } from './types';

const props = defineProps<{
  data: TreeNode[];
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
  (e: 'node-mouse-over', node: TreeNode, index: number, parent: TreeNode | null): void;
  (e: 'async-load-nodes', node: TreeNode): void;
}>();

const setAttr = (node: TreeNode, attr: keyof TreeNode, val: any) => {
  node[attr] = val;
};

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

const emitEventToTree = (event: string, ...args: any[]) => {
  emit(event as any, ...args);
};

const nodeSelected = (node: TreeNode, position: Position) => {
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