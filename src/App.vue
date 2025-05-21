<template>
  <div :class="{ 'dark-mode': isDarkMode }">
    <div class="theme-toggle">
      <button class="theme-btn" @click="toggleDarkMode">
        {{ isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro' }}
      </button>
    </div>
    <div class="tree3">
      <input
        class="tree-search-input"
        type="text"
        v-model="searchword"
        placeholder="buscar..."
      />
      <button class="tree-search-btn" type="button" @click="search">Buscar</button>
      <TreeView
        ref="tree1"
        :can-delete-root="true"
        :data="treeData1"
        :draggable="true"
        :tpl="tpl"
        :halfcheck="true"
        :multiple="true"
        :darkMode="isDarkMode"
        @node-click="handleNodeClick"
      />
    </div>
    <div class="tree3">
      <TreeView
        ref="tree2"
        :can-delete-root="true"
        :data="treeData2"
        :draggable="true"
        :multiple="false"
        :darkMode="isDarkMode"
        @node-check="nodechecked"
        @async-load-nodes="asyncLoad2"
      />
    </div>
    <div class="tree3">
      <SelectTree
        :data="treeData3"
        v-model="initSelected"
        :multiple="true"
        :draggable="true"
        :darkMode="isDarkMode"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted, VNode, reactive } from 'vue';
import TreeView from './components/TreeView.vue';
import SelectTree from './components/SelectTree.vue';
import type { TreeViewNode, TreeExposedMethods } from '@/types';

// Datos reactivos
const searchword = ref<string>('');
const initSelected = ref<string[]>(['node 1-1']);
const isDarkMode = ref<boolean>(false); // Estado para modo oscuro

const treeData1 = reactive<TreeViewNode[]>([
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

const treeData2 = reactive<TreeViewNode[]>([
  {
    id: 'node2',
    title: 'node1',
    expanded: false,
    async: true,
  },
]);

const treeData3 = reactive<TreeViewNode[]>([
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
const initializeTree = (nodes: TreeViewNode[]) => {
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
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
};

const nodechecked = (node: TreeViewNode, checked: boolean) => {
  alert(`Evento de node-check: ${node.title} ${checked}`);
};

const tpl = (node: TreeViewNode, ctx: { level: number; index: number }, parent: TreeViewNode | null, index: number): VNode => {
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

const asyncLoad1 = async (node: TreeViewNode) => {
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

const asyncLoad2 = async (node: TreeViewNode) => {
  const { checked = false } = node;
  node.loading = true;
  const newNodes = await new Promise<TreeViewNode[]>((resolve) =>
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

const handleNodeClick = (node: TreeViewNode, selected: boolean) => {
  alert(`Clic en nodo: ${node.title} ${selected}`);
};
</script>

<style scoped>
/* Estilos base (Modo Claro) */
.theme-toggle {
  margin-bottom: 10px;
}

.theme-btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: #f5f5f5;
  color: #333;
  cursor: pointer;
}

.theme-btn:hover {
  background-color: #e0e0e0;
}

.tree3 {
  float: left;
  width: 33%;
  padding: 10px;
  box-sizing: border-box;
  border: 1px dotted #ccccdd;
  overflow: auto;
  height: 800px;
  background-color: #fff; /* Fondo blanco para modo claro */
}

.treebtn1,
.treebtn2,
.treebtn3 {
  background-color: transparent;
  border: 1px solid #ccc;
  padding: 1px 3px;
  border-radius: 5px;
  margin-right: 5px;
  color: #666;
}

.treebtn2 {
  padding: 3px 5px;
  margin-left: 5px;
}

.treebtn3 {
  padding: 3px 5px;
  margin-left: 5px;
}

.tree-search-input {
  width: 70%;
  padding: 6px 8px;
  outline: none;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: #fff; /* Fondo blanco */
  color: #333; /* Texto oscuro */
}

.tree-search-input:focus {
  border: 1px solid #4caf50;
  box-shadow: 0 2px 2px rgba(76, 175, 80, 0.2);
}

.tree-search-btn {
  width: 25%;
  padding: 6px 8px;
  outline: none;
  border-radius: 6px;
  background-color: #dadada;
  border: 1px solid #e2e1e1;
  color: #333;
  cursor: pointer;
}

.tree-search-btn:hover {
  background-color: #ccc;
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

/* Estilos para Modo Oscuro */
.dark-mode .theme-btn {
  border: 1px solid #888;
  background-color: #444;
  color: #e0e0e0;
}

.dark-mode .theme-btn:hover {
  background-color: #555;
}

.dark-mode .tree3 {
  border: 1px dotted #666;
  background-color: #2a2a2a; /* Fondo oscuro */
}

.dark-mode .treebtn1,
.dark-mode .treebtn2,
.dark-mode .treebtn3 {
  border: 1px solid #888;
  color: #e0e0e0;
}

.dark-mode .tree-search-input {
  border: 1px solid #888;
  background-color: #333;
  color: #e0e0e0;
}

.dark-mode .tree-search-input:focus {
  border: 1px solid #4caf50;
  box-shadow: 0 2px 2px rgba(76, 175, 80, 0.2);
}

.dark-mode .tree-search-btn {
  background-color: #444;
  border: 1px solid #666;
  color: #e0e0e0;
}

.dark-mode .tree-search-btn:hover {
  background-color: #555;
}
</style>