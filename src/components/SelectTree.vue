<template>
  <div class="tree-container" :class="{ 'dark-mode': props.darkMode }">
    <div class="tag-box-container">
      <div class="tag-box" ref="txtbox" @click="open = !open" @mouseleave="leaveTextTag">
        <div class="tag blank" v-show="!selectedItems.length">{{ pleasechoosetext }}</div>
        <div
          class="tag"
          @click.stop="tagClick($event)"
          ref="txttag"
          v-for="(node, idx) in selectedItems"
          :key="idx"
        >
          {{ node }}
          <span class="rmNode" @click.stop="rmNode(node)">x</span>
        </div>
      </div>
    </div>
    <transition name="fade">
      <div class="tree-box" v-show="open">
        <input
          class="search-input"
          v-model="searchword"
          v-show="searchable"
          @keyup.enter="searchNodes"
          type="text"
          :placeholder="searchtext"
        />
        <Tree
          ref="dropTree"
          v-bind="vTreeObj"
          :data="treeData"
          :drag-after-expanded="dragAfterExpanded"
          :draggable="draggable"
          :tpl="tpl"
          :multiple="multiple"
          @drop-tree-node-checked="nodeCheckStatusChange"
          @async-load-nodes="handleAsyncLoadNodes"
          @node-expanded="handleNodeExpanded"
          @node-click="nodeClick"
          @node-check="nodeClick"
          @drag-node-end="handleDragNodeEnd"
          @node-drop="handleNodeDrop"
          @drag-start="handleDragStart"
        />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, reactive } from 'vue';
import Tree from './TreeView.vue';
import type { TreeViewNode, Position } from '@/types';

// Props
const props = defineProps<{
  modelValue?: string[];
  searchable?: boolean;
  pleasechoosetext?: string;
  searchtext?: string;
  data: TreeViewNode[];
  parent?: TreeViewNode | null;
  multiple?: boolean;
  draggable?: boolean;
  dragAfterExpanded?: boolean;
  tpl?: (node: TreeViewNode, ctx: any, parent: TreeViewNode | null, index: number, props: any) => any;
  searchFilter?: (node: TreeViewNode) => boolean;
  darkMode?: boolean;
}>();

// Valores por defecto
const defaultProps = {
  searchable: true,
  pleasechoosetext: 'please choose...',
  searchtext: 'search...',
  multiple: false,
  draggable: false,
  dragAfterExpanded: true,
  darkMode: false,
};

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
  (e: 'async-load-nodes', node: TreeViewNode): void;
  (e: 'node-click', node: TreeViewNode, selected: boolean): void;
  (e: 'drop-tree-node-checked', node: TreeViewNode, checked: boolean): void;
  (e: 'node-expanded', node: TreeViewNode, expanded: boolean, position: Position): void;
  (e: 'drag-node-end', dragNode: TreeViewNode, targetNode: TreeViewNode, parentNode: TreeViewNode | null, event: DragEvent): void;
  (e: 'node-drop', draggedNode: TreeViewNode, targetNode: TreeViewNode | null, targetIndex: number, targetParent: TreeViewNode | null): void;
  (e: 'drag-start', node: TreeViewNode): void;
}>();

// Datos reactivos
const searchword = ref<string>('');
const open = ref<boolean>(false);
const selectedItems = ref<string[]>(props.modelValue ?? []);
const treeData = reactive<TreeViewNode[]>([...props.data]);

// Referencias
const txtbox = ref<HTMLElement | null>(null);
const txttag = ref<HTMLElement[] | null>(null);
const dropTree = ref<InstanceType<typeof Tree> | null>(null);

// Computed
const vTreeObj = computed(() => ({
  searchable: props.searchable ?? defaultProps.searchable,
  pleasechoosetext: props.pleasechoosetext ?? defaultProps.pleasechoosetext,
  searchtext: props.searchtext ?? defaultProps.searchtext,
  parent: props.parent,
  multiple: props.multiple ?? defaultProps.multiple,
  draggable: props.draggable ?? defaultProps.draggable,
  dragAfterExpanded: props.dragAfterExpanded ?? defaultProps.dragAfterExpanded,
  darkMode: props.darkMode ?? defaultProps.darkMode,
}));


// Watch: Actualizar treeData cuando cambie props.data
watch(
  () => props.data,
  (newData) => {
    // Reemplazar contenido reactivamente
    treeData.splice(0, treeData.length, ...newData.map((node) => ({ ...node })));
  },
  { immediate: true, deep: true }
);


// Watch: Actualizar el v-model cuando cambian los ítems seleccionados
watch(selectedItems, (newValue) => {
  emit('update:modelValue', newValue);
});

// Mounted
onMounted(() => {
  selectedItems.value = props.modelValue ?? [];
  initTreeStatus(treeData);
});

// Métodos
const handleAsyncLoadNodes = (node: TreeViewNode) => {
  if (node.async && !node.children) {
    emit('async-load-nodes', node);
  }
};

const handleNodeExpanded = (node: TreeViewNode, expanded: boolean, position: Position) => {
  emit('node-expanded', node, expanded, position);
};

const handleDragNodeEnd = (dragNode: TreeViewNode, targetNode: TreeViewNode, parentNode: TreeViewNode | null, event: DragEvent) => {
  open.value = true;
  emit('drag-node-end', dragNode, targetNode, parentNode, event);
};

const handleDragStart = (node: TreeViewNode) => {
  open.value = true;
};

const handleNodeDrop = (draggedNode: TreeViewNode, targetNode: TreeViewNode | null, targetIndex: number, targetParent: TreeViewNode | null) => {
  open.value = true;
  emit('node-drop', draggedNode, targetNode, targetIndex, targetParent);
};


const nodeClick = (node: TreeViewNode, selected: boolean) => {
  getNewSelectedNodes();
  emit('node-click', node, selected);
};

const getSelectedAndCheckedNodes = (): TreeViewNode[] => {
  let checkedNode: TreeViewNode[] = [];
  if (props.multiple ?? defaultProps.multiple) {
    checkedNode = dropTree.value?.getCheckedNodes(true, false) ?? [];
  }
  const selectedNode = dropTree.value?.getSelectedNodes(true, false) ?? [];
  return [...new Set([...selectedNode, ...checkedNode])];
};

const getNewSelectedNodes = () => {
  selectedItems.value = getSelectedAndCheckedNodes().map((x) => x.title ?? '');
};

const rmNode = (text: string, eventFromNode = false) => {
  if (!eventFromNode) {
    const node = getSelectedAndCheckedNodes().find((x) => x.title === text);
    if (node) {
      node.selected = false;
      node.checked = false;
    }
  }
  getNewSelectedNodes();
};

const nodeCheckStatusChange = (node: TreeViewNode, checked: boolean) => {
  const TreeViewNodes = dropTree.value?.getCheckedNodes(true, false) ?? [];
  if (!TreeViewNodes.length) {
    selectedItems.value = [];
  } else {
    selectedItems.value = TreeViewNodes.map((node) => node.title ?? '');
  }
  emit('drop-tree-node-checked', node, checked);
};

const searchNodes = () => {
  const filter = searchword.value;
  if (dropTree.value && filter) {
    dropTree.value.searchNodes(filter);
  }
};

const tagClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  const l = target.offsetLeft - 5;
  if (txtbox.value) {
    txtbox.value.style.transition = 'transform .3s linear';
    txtbox.value.style.transform = `translateX(-${l}px)`;
  }
};

const leaveTextTag = () => {
  if (txtbox.value) {
    txtbox.value.style.transition = 'transform 0.4s';
    txtbox.value.style.transform = 'translateX(0)';
  }
};

const initTreeStatus = (data: TreeViewNode[]) => {
  for (const node of data) {
    if ((props.modelValue ?? []).findIndex((text) => text === node.title) > -1) {
      node.selected = true;
      node.checked = true;
    }
    if (node.children && node.children.length) {
      initTreeStatus(node.children);
    }
  }
};
</script>

<style scoped>
.tree-container {
  position: relative;
  width: 90%;
  height: 36px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #fff; /* Fondo blanco para modo claro */
}

.tag-box-container {
  position: relative;
  width: 100%;
  height: 36px;
  overflow: hidden;
}

.tag-box {
  width: 2000%;
  height: 36px;
}

.tree-box {
  margin-top: 3px;
  border-radius: 6px;
  border: 1px solid #ccc;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2); /* Sombra más clara para modo claro */
  background-color: #fff; /* Fondo blanco */
}

.tree-box ul {
  margin-left: 0;
  -webkit-padding-start: 10px;
}

.search-input {
  width: 96%;
  height: 30px;
  box-sizing: border-box;
  margin: 5px auto 0;
  border: 1px solid #ccc;
  font-size: 14px;
  text-indent: 1em;
  border-radius: 6px;
  outline: none;
  background-color: #fff; /* Fondo blanco para input de búsqueda */
  color: #333; /* Texto oscuro */
}

.search-input:focus {
  border: 1px solid #4caf50;
  box-shadow: 0 2px 2px rgba(76, 175, 80, 0.2);
}

.tag {
  float: left;
  position: relative;
  min-width: 50px;
  height: 26px;
  margin: 4px;
  padding: 0 10px;
  line-height: 26px;
  text-align: center;
  border-radius: 6px;
  background-color: #f5f5f5; /* Fondo gris claro para etiquetas */
  border: 1px solid #ccc;
  user-select: none;
  cursor: default;
  transition: padding 0.3s;
  color: #333; /* Texto oscuro */
}

.tag .rmNode {
  display: none;
}

.tag:hover {
  padding-right: 25px;
}

.tag:hover > .rmNode {
  display: block !important;
}

.blank {
  background-color: #fff;
  border: 0;
  color: #666; /* Texto gris para marcador de posición */
}

.rmNode {
  position: absolute;
  right: 5px;
  top: 5px;
  width: 15px;
  height: 15px;
  line-height: 15px;
  font-size: 12px;
  background-color: #ccc;
  color: #333;
  border-radius: 50%;
  cursor: pointer;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
  transform: translateY(-10px);
}

/* Estilos para Modo Oscuro */
.tree-container.dark-mode {
  border: 1px solid #666;
  background-color: #2a2a2a; /* Fondo oscuro */
}

.tree-container.dark-mode .tree-box {
  border: 1px solid #666;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.4); /* Sombra más oscura */
  background-color: #2a2a2a; /* Fondo oscuro */
}

.tree-container.dark-mode .search-input {
  border: 1px solid #888;
  background-color: #333; /* Fondo oscuro para input de búsqueda */
  color: #e0e0e0; /* Texto claro */
}

.tree-container.dark-mode .search-input:focus {
  border: 1px solid #4caf50;
  box-shadow: 0 2px 2px rgba(76, 175, 80, 0.2);
}

.tree-container.dark-mode .tag {
  background-color: #444; /* Fondo más oscuro para etiquetas */
  border: 1px solid #888;
  color: #e0e0e0; /* Texto claro */
}

.tree-container.dark-mode .blank {
  background-color: #2a2a2a;
  color: #999; /* Texto gris para marcador de posición */
}

.tree-container.dark-mode .rmNode {
  background-color: #b3b3b3;
  color: #ececec;
}
</style>