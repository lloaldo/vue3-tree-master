<!-- src/components/tree.vue -->
<script setup lang="ts">
import { computed, ref, provide } from 'vue';
import TreeUl from './TreeUl.vue';
import type { TreeNode, TreeContext } from './types';

// Props con tipos
const props = defineProps<{
  data: TreeNode[];
  multiple?: boolean;
  halfcheck?: boolean;
  canDeleteRoot?: boolean;
  maxLevel?: number;
  topMustExpand?: boolean;
  allowGetParentNode?: boolean;
  radio?: boolean;
  selectAlone?: boolean;
  allowCheckedChildrenOfDisabledChild?: boolean;
}>();

// Valores por defecto
const defaultValues = {
  visible: true,
};

// Estado
const radioNode = ref<TreeNode | null>(null);

// Emits
const emit = defineEmits<{
  (e: 'node-mouse-over', ...args: any[]): void;
  (e: 'node-check', ...args: any[]): void;
  (e: 'drag-node-end', ...args: any[]): void;
  (e: 'del-node', ...args: any[]): void;
  (e: 'node-click', node: TreeNode, selected: boolean, position: any): void;
  (e: 'node-select', node: TreeNode, selected: boolean, position: any): void;
  (e: 'async-load-nodes', ...args: any[]): void;
  (e: 'node-expand', ...args: any[]): void;
}>();

// Computed: Combinar props y attrs
const childBind = computed(() => ({
  data: props.data,
  multiple: props.multiple,
  halfcheck: props.halfcheck,
  canDeleteRoot: props.canDeleteRoot,
  maxLevel: props.maxLevel,
  topMustExpand: props.topMustExpand,
  allowGetParentNode: props.allowGetParentNode,
  radio: props.radio,
  selectAlone: props.selectAlone,
  allowCheckedChildrenOfDisabledChild: props.allowCheckedChildrenOfDisabledChild,
}));

defineExpose({
  setNodeAttr,
  nodeSelected,
  addNode,
  addNodes,
  delNode,
  getNodes,
  getSelectedNodes,
  getCheckedNodes,
  searchNodes,
});

// Métodos externos
function setNodeAttr(node: TreeNode, attr: string, val: any = true) {
  if (!node || !attr) return;
  setAttr(node, attr, val);
}

function addNode(parent: TreeNode | null, newNode: TreeNode | string) {
  if (!parent) return;
  parent.expanded = true;
  let addnode: TreeNode;
  const newNodeType = typeof newNode;
  if (newNodeType === 'undefined') {
    throw new ReferenceError('newNode is required but undefined');
  } else if (newNodeType === 'string') {
    addnode = { title: newNode as string };
  } else if (newNodeType === 'object') {
    if (!(newNode as TreeNode).title) {
      throw new ReferenceError('the title property is missed');
    } else {
      addnode = newNode as TreeNode;
    }
  } else {
    throw new ReferenceError(`newNode type error, not allowed ${newNodeType}`);
  }
  const { halfcheck, checked } = parent;
  addnode = { ...addnode, checked: !halfcheck && checked };
  if (isLeaf(parent)) {
    parent.children = [addnode];
  } else {
    parent.children!.push(addnode);
  }
}

function addNodes(parent: TreeNode | null, children: (TreeNode | string)[]) {
  if (!parent) return;
  for (const child of children) {
    addNode(parent, child);
  }
}

function delNode(node: TreeNode, parent: TreeNode | null, index: number) {
  if (parent === null) {
    if (props.canDeleteRoot) {
      props.data.splice(index, 1);
    } else {
      throw new ReferenceError("the root element can't deleted!");
    }
  } else {
    parent.children!.splice(index, 1);
  }
  emitEventToParent('del-node', { parentNode: parent, delNode: node });
}

function getNodes(opt: Record<string, any> = {}, data: TreeNode[] = props.data, isOriginal = false, ignoreInvisibleNode = false): TreeNode[] {
  const optArr = Object.entries(opt);
  const hasOpt = optArr.length > 0;
  return _getNodes(optArr, hasOpt, data, isOriginal, ignoreInvisibleNode);
}

function _getNodes(
  opt: [string, any][],
  hasOpt: boolean,
  data: TreeNode[],
  isOriginal: boolean,
  ignoreInvisibleNode: boolean,
  res: TreeNode[] = []
): TreeNode[] {
  const _pushNode = (arr: TreeNode[], node: TreeNode, isOrg: boolean) => {
    if (isOrg) {
      arr.push(node);
    } else {
      const n = { ...node };
      Reflect.deleteProperty(n, 'hasExpanded');
      Reflect.deleteProperty(n, 'children');
      Reflect.deleteProperty(n, 'parent');
      arr.push(n);
    }
  };
  const pushNode = (node: TreeNode) => _pushNode(res, node, isOriginal);
  const _isMatchedNode = (node: TreeNode, condition: [string, any][]) => {
    let matched = true;
    for (const [attr, val] of condition) {
      const nodeVal = node[attr] ?? defaultValues[attr] ?? false;
      matched = nodeVal === val;
      if (!matched) break;
    }
    return matched;
  };
  const isMatchedNode = (node: TreeNode) => _isMatchedNode(node, opt);

  for (const node of data) {
    const { children, visible = true } = node;
    if (ignoreInvisibleNode && !visible) continue;
    if (hasOpt) {
      if (isMatchedNode(node)) pushNode(node);
    } else {
      pushNode(node);
    }
    if (children && children.length) {
      _getNodes(opt, hasOpt, children, isOriginal, ignoreInvisibleNode, res);
    }
  }
  return res;
}

function getSelectedNodes(isOriginal: boolean, ignoreInvisibleNode = false): TreeNode[] {
  return getNodes({ selected: true }, props.data, isOriginal, ignoreInvisibleNode);
}

function getCheckedNodes(isOriginal: boolean, ignoreInvisibleNode = false): TreeNode[] {
  return getNodes({ checked: true }, props.data, isOriginal, ignoreInvisibleNode);
}

function searchNodes(filter: string | ((node: TreeNode) => boolean), data: TreeNode[] = props.data) {
  if (!filter || (typeof filter === 'string' && filter.trim() === '')) {
    data.forEach((node) => _modifyAllNode(node));
    return;
  }
  const filterFn = typeof filter === 'function' ? filter : ({ title = '' }) => title.includes(filter);
  const searchRes = Array.from({ length: data.length }, () => [] as number[][]);
  data.forEach((node, index) => {
    const matched = searchRes[index];
    _searchNodes(filterFn, node, index, matched);
    if (matched.length > 0) {
      matched.sort((x, y) => x.length - y.length);
      const attrs = ['visible', 'expanded'];
      if (matched.some((x) => x.length === 1)) {
        attrs.push('searched');
      }
      setAttrs(node, attrs);
      _showSearchNodes(node, matched.map((x) => x.slice(1)).filter((x) => x.length));
    } else {
      setAttr(node, 'visible', false);
    }
  });
}

function _searchNodes(filterFn: (node: TreeNode) => boolean, node: TreeNode, index: number, matched: number[][], path: number[] = []) {
  const isMatched = filterFn(node);
  path = [...path, index];
  if (isMatched) {
    matched.push(path);
  }
  const { children } = node;
  if (children && children.length) {
    for (const [i, child] of children.entries()) {
      _searchNodes(filterFn, child, i, matched, path);
    }
  }
}

function _showSearchNodes(node: TreeNode, matched: number[][]) {
  matched = matched.map((path) => [...path]);
  const dedupe = (arr: number[]) => [...new Set(arr)];
  let isSame = true;
  while (isSame && matched.length > 0) {
    const { children = [] } = node;
    const newMatched: number[][] = [];
    const searchedPaths = matched.filter((x) => {
      const len = x.length;
      if (len > 1) {
        newMatched.push(x);
      }
      return len === 1;
    });
    searchedPaths.forEach((path) => {
      setAttrs(children[path[0]], ['visible', 'expanded', 'searched']);
    });
    const samePaths = dedupe(matched.map((item) => item[0]));
    const len = samePaths.length;
    if (len !== children.length) {
      children.forEach((childNode, i) => {
        if (!samePaths.includes(i)) {
          setAttr(childNode, 'visible', false);
        }
      });
    }
    if (newMatched.length > 0) {
      if (len === 1) {
        matched = newMatched.map((x) => x.slice(1));
        node = children[samePaths[0]];
        setAttrs(node, ['visible', 'expanded']);
      } else {
        samePaths.forEach((pathIndex) => {
          const childNode = children[pathIndex];
          setAttrs(childNode, ['visible', 'expanded']);
          _showSearchNodes(
            childNode,
            matched
              .filter((x) => x[0] === pathIndex && x.length > 1)
              .map((x) => x.slice(1))
          );
        });
        isSame = false;
      }
    } else {
      isSame = false;
    }
  }
}

function _modifyAllNode(node: TreeNode, attrsObj = { visible: true, searched: false }) {
  for (const [key, val] of Object.entries(attrsObj)) {
    setAttr(node, key, val);
  }
  const { children } = node;
  if (children && children.length > 0) {
    children.forEach((child) => _modifyAllNode(child, attrsObj));
  }
}

// Métodos compartidos mediante provide/inject
function isLeaf(node: TreeNode): boolean {
  return !(node.children && node.children.length);
}

function childCheckedHandle(node: TreeNode, checked: boolean, halfcheck = false) {
  const { children } = node;
  if (children && children.length) {
    children.forEach((child) => {
      if (!child.chkDisabled) {
        child.checked = checked;
        if (halfcheck) {
          child.halfcheck = false;
        }
        child.parentCheckedToChildren = true;
      }
      if (props.allowCheckedChildrenOfDisabledChild) {
        childCheckedHandle(child, checked, halfcheck);
      }
    });
  }
}

function parentCheckedHandle(node: TreeNode | null, checked: boolean, halfcheck = false): boolean {
  if (!node || node.chkDisabled) return false;
  let someBortherNodeChecked = checked;
  let allBortherNodeChecked = checked;
  const childNodes = node.children || [];
  if (checked) {
    allBortherNodeChecked = childNodes.every((child) => child.checked);
  } else {
    someBortherNodeChecked = childNodes.some(({ checked, halfcheck: itemHalfCheck }) =>
      checked || (halfcheck && itemHalfCheck)
    );
  }
  if (halfcheck) {
    const nodeHalfcheck = checked ? !allBortherNodeChecked : someBortherNodeChecked;
    const oldHalfCheck = node.halfcheck ?? false;
    if (oldHalfCheck !== nodeHalfcheck) {
      node.halfcheck = nodeHalfcheck;
    } else if (nodeHalfcheck) {
      return false;
    }
    node.checked = allBortherNodeChecked;
  } else {
    node.checked = allBortherNodeChecked;
  }
  return true;
}

function emitEventToParent(eventName: string, ...args: any[]) {
  if (!eventName) return;
  const validEvents = [
    'node-mouse-over',
    'node-check',
    'drag-node-end',
    'del-node',
    'node-click',
    'node-select',
    'async-load-nodes',
    'node-expand',
  ];
  if (validEvents.includes(eventName)) {
    emit(eventName as any, ...args);
  } else {
    throw new ReferenceError(`the event of ${eventName} is not effective`);
  }
}

function setAttr(node: TreeNode, attr: string, val: any = true) {
  const defVal = node[attr] ?? defaultValues[attr] ?? false;
  if (defVal !== val) {
    node[attr] = val;
  }
}

function setAttrs(node: TreeNode, attrs: string[], val: any = true) {
  attrs.forEach((attr) => setAttr(node, attr, val));
}

function nodeSelected(node: TreeNode, position: any) {
  const selected = !node.selected;
  const changeCheck = props.multiple && !props.selectAlone;
  if (changeCheck) {
    node.checked = selected;
  }
  if (props.radio) {
    updateRadioNode(node, selected);
  }
  node.selected = selected;
  if (changeCheck) {
    childCheckedHandle(node, selected, props.halfcheck);
  }
  emitEventToParent('node-click', node, selected, position);
  emitEventToParent('node-select', node, selected, position);
}

function updateRadioNode(node: TreeNode, selected: boolean) {
  if (!selected) return;
  const previousNode = radioNode.value;
  if (previousNode) {
    setAttr(previousNode, 'selected', !selected);
  }
  radioNode.value = node;
}

// Provide: Inyectar métodos y datos para los subcomponentes
provide<TreeContext>('treeContext', {
  isLeaf,
  childChecked: childCheckedHandle,
  parentChecked: parentCheckedHandle,
  emitEventToTree: emitEventToParent,
  nodeSelected,
  setAttr,
});
</script>

<template>
  <div class="halo-tree">
    <TreeUl v-bind="childBind" />
  </div>
</template>

<style src="./tree.css"></style>