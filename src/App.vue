<template>
  <div>
    <div class="tree3">
      <input
        class="tree-search-input"
        type="text"
        v-model="searchword"
        placeholder="search..."
      />
      <button class="tree-search-btn" type="button" @click="search">search</button>
      <Tree
        ref="tree1"
        :can-delete-root="true"
        :data="treeData1"
        :draggable="true"
        :tpl="tpl"
        :halfcheck="true"
        :multiple="true"
        @node-drop="handleNodeDrop"
      />
    </div>
    <div class="tree3">
      <Tree
        ref="tree2"
        :can-delete-root="true"
        :data="treeData2"
        :draggable="true"
        :multiple="false"
        @node-check="nodechecked"
        @async-load-nodes="asyncLoad2"
      />
    </div>
    <div class="tree3">
      <SelectTree
        :data="treeData3"
        v-model="initSelected"
        :multiple="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted, VNode, reactive } from 'vue';
import Tree from './components/Tree.vue';
import SelectTree from './components/SelectTree.vue';
import type { TreeNode, TreeExposedMethods } from './components/types';

// Datos reactivos
const searchword = ref<string>('');
const initSelected = ref<string[]>(['node 1-1']);

const treeData1 = reactive<TreeNode[]>([
  {
    id: 'node1',
    title: 'node1',
    expanded: true,
    children: [
      {
        id: 'node1-1',
        title: 'node 1-1',
        expanded: true,
        children: [
          { id: 'node1-1-1', title: 'node 1-1-1' },
          { id: 'node1-1-2', title: 'node 1-1-2' },
          { id: 'node1-1-3', title: 'node 1-1-3' },
        ],
      },
      {
        id: 'node1-2',
        title: 'node 1-2',
        children: [
          { id: 'node1-2-1', title: 'node 1-2-1' },
          { id: 'node1-2-2', title: 'node 1-2-2' },
        ],
      },
    ],
  },
]);

const treeData2 = reactive<TreeNode[]>([
  {
    id: 'node2',
    title: 'node1',
    expanded: false,
    async: true,
  },
]);

const treeData3 = reactive<TreeNode[]>([
  {
    id: 'node1',
    title: 'node1',
    expanded: true,
    children: [
      {
        id: 'node1-1',
        title: 'node 1-1',
        expanded: true,
        children: [
          { id: 'node1-1-1', title: 'node 1-1-1' },
          { id: 'node1-1-2', title: 'node 1-1-2' },
          { id: 'node1-1-3', title: 'node 1-1-3' },
        ],
      },
      { id: 'node1-2', title: 'node 1-2' },
    ],
  },
]);

// Referencias a los componentes
const tree1 = ref<TreeExposedMethods | null>(null);
const tree2 = ref<TreeExposedMethods | null>(null);

// Inicializar visibilidad y estado de expansión de los nodos
const initializeTree = (nodes: TreeNode[]) => {
  for (const node of nodes) {
    node.visible = true;
    if (node.expanded) {
      node.hasExpanded = true;
    }
    if (node.children) {
      initializeTree(node.children);
    }
  }
};

onMounted(() => {
  initializeTree(treeData1);
  initializeTree(treeData2);
  initializeTree(treeData3);
});

// Métodos
const nodechecked = (node: TreeNode, checked: boolean) => {
  alert(`That a node-check event ... ${node.title} ${checked}`);
};

const tpl = (node: TreeNode, ctx: { level: number; index: number }, parent: TreeNode | null, index: number): VNode => {
  const titleClass = node.selected
    ? 'node-title node-selected'
    : 'node-title' + (node.searched ? ' node-searched' : '');
  const nodeContent = h('span', [
    h(
      'button',
      {
        class: 'treebtn1',
        onClick: () => tree1.value?.addNode(node, { title: 'sync node' }),
      },
      '+'
    ),
    h(
      'span',
      {
        class: titleClass,
        onClick: () => tree1.value?.nodeSelected(node, { level: ctx.level, index }),
      },
      node.title ?? 'Sin título'
    ),
    h(
      'button',
      {
        class: 'treebtn2',
        onClick: () => asyncLoad1(node),
      },
      'async'
    ),
    h(
      'button',
      {
        class: 'treebtn3',
        onClick: () => tree1.value?.delNode(node, parent, index),
      },
      'delete'
    ),
  ]);
  return nodeContent;
};

const asyncLoad1 = async (node: TreeNode) => {
  const { checked = false } = node;
  node.loading = true;
  const newNodes = await new Promise<string[]>((resolve) =>
    setTimeout(() => resolve(['async node1', 'async node2']), 2000)
  );
  tree1.value?.addNodes(node, newNodes);
  node.loading = false;
  if (checked) {
    tree1.value?.childCheckedHandle(node, checked);
  }
};

const asyncLoad2 = async (node: TreeNode) => {
  const { checked = false } = node;
  node.loading = true;
  const newNodes = await new Promise<TreeNode[]>((resolve) =>
    setTimeout(() =>
      resolve([
        { title: 'test1', async: true },
        { title: 'test2', async: true },
        { title: 'test3' },
      ]),
      2000
    )
  );
  node.loading = false;
  tree2.value?.addNodes(node, newNodes);
  if (checked) {
    tree2.value?.childCheckedHandle(node, checked);
  }
};

const search = () => {
  tree1.value?.searchNodes(searchword.value);
};

const handleNodeDrop = (
  draggedNode: TreeNode,
  targetNode: TreeNode | null,
  targetIndex: number,
  targetParent: TreeNode | null
) => {
  console.log('App.vue handleNodeDrop:', {
    draggedNode: draggedNode.title,
    targetNode: targetNode?.title || 'none',
    targetIndex,
    targetParent: targetParent?.title || 'none',
  });

  const removeFromParent = (nodes: TreeNode[], nodeToRemove: TreeNode): boolean => {
    const index = nodes.findIndex((n) => n.id === nodeToRemove.id);
    if (index !== -1) {
      nodes.splice(index, 1);
      console.log('App.vue removed node from original position:', nodeToRemove.title);
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

  const removed = removeFromParent(treeData1, draggedNode);
  if (!removed) {
    console.warn('App.vue: Node not found in original position:', draggedNode.title);
    return;
  }

  if (targetParent) {
    if (!targetParent.children) {
      targetParent.children = [];
    }
    targetParent.children.splice(targetIndex, 0, draggedNode);
    draggedNode.parent = targetParent;
    console.log('App.vue inserted node into new parent:', targetParent.title, 'at index:', targetIndex);
  } else if (targetNode === null) {
    treeData1.splice(targetIndex, 0, draggedNode);
    draggedNode.parent = null;
    console.log('App.vue inserted node as root at index:', targetIndex);
  } else {
    if (!targetNode.children) {
      targetNode.children = [];
    }
    targetNode.children.splice(targetIndex, 0, draggedNode);
    draggedNode.parent = targetNode;
    console.log('App.vue inserted node into target:', targetNode.title, 'at index:', targetIndex);
  }

  console.log('App.vue treeData1 after move:', {
    nodes: treeData1.map((node) => ({
      id: node.id,
      title: node.title,
      children: node.children?.map((child) => ({
        id: child.id,
        title: child.title,
        children: child.children?.map((grandchild) => ({
          id: grandchild.id,
          title: grandchild.title,
        })),
      })),
    })),
  });
};

</script>

<style scoped>
.tree3 {
  float: left;
  width: 33%;
  padding: 10px;
  box-sizing: border-box;
  border: 1px dotted #ccccdd;
  overflow: auto;
  height: 800px;
}

.treebtn1 {
  background-color: transparent;
  border: 1px solid #ccc;
  padding: 1px 3px;
  border-radius: 5px;
  margin-right: 5px;
  color: rgb(148, 147, 147);
}

.treebtn2 {
  background-color: transparent;
  border: 1px solid #ccc;
  padding: 3px 5px;
  border-radius: 5px;
  margin-left: 5px;
  color: rgb(97, 97, 97);
}

.treebtn3 {
  background-color: transparent;
  border: 1px solid #ccc;
  padding: 3px 5px;
  border-radius: 5px;
  margin-left: 5px;
  color: rgb(63, 63, 63);
}

.tree-search-input {
  width: 70%;
  padding: 6px 8px;
  outline: none;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.tree-search-btn {
  width: 25%;
  padding: 6px 8px;
  outline: none;
  border-radius: 6px;
  background-color: rgb(218, 218, 218);
  border: 1px solid rgb(226, 225, 225);
  color: rgb(117, 117, 117);
}

/* Forzar visibilidad */
.halo-tree,
.halo-tree ul,
.halo-tree li,
.tree-node-el,
.node-title {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  height: auto !important;
}
</style>