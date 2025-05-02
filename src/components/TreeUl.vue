<template>
  <ul class="tree-ul" :class="{ 'tree-root': !parent }">
    <TreeLi
      v-for="(item, index) in data"
      :key="item.id ?? index"
      @drop.stop="drop(item, $event)"
      @dragover.stop="dragover"
      :item="item"
      :index="index"
      :data-length="data.length"
      :parent="parent"
      :multiple="multiple"
      :draggable="draggable"
      :drag-after-expanded="dragAfterExpanded"
      :halfcheck="halfcheck"
      :scoped="scoped"
      :can-delete-root="canDeleteRoot"
      :tpl="tpl"
      :max-level="maxLevel"
      :level="(props.level ?? defaultProps.level) + 1"
      :top-must-expand="topMustExpand"
      :allow-get-parent-node="allowGetParentNode"
    />
  </ul>
</template>

<script setup lang="ts">
import { inject, onMounted } from 'vue';
import TreeLi from './TreeLi.vue';
import { useTreeMixins } from './composables/useTreeMixins';
import type { TreeNode, TreeContext } from './types';

// Props con tipos
const props = defineProps<{
  data: TreeNode[];
  parent?: TreeNode | null;
  multiple?: boolean;
  draggable?: boolean;
  dragAfterExpanded?: boolean;
  halfcheck?: boolean;
  scoped?: boolean;
  canDeleteRoot?: boolean;
  tpl?: (node: TreeNode, ctx: any, parent: TreeNode | null, index: number, props: any) => any;
  maxLevel?: number;
  level?: number;
  topMustExpand?: boolean;
  allowGetParentNode?: boolean;
}>();

// Valores por defecto
const defaultProps = {
  level: 0,
};

// Inject: Obtener funciones del contexto
const treeContext = inject<TreeContext>('treeContext', {
  isLeaf: () => false,
  childChecked: () => {},
  parentChecked: () => false,
  emitEventToTree: () => {},
  nodeSelected: () => {},
  setAttr: () => {},
});
const { emitEventToTree } = treeContext;

// Mixins como composable
const { getDragNode } = useTreeMixins();

// Métodos
function dragover(ev: DragEvent) {
  ev.preventDefault();
  ev.stopPropagation();
}

function drop(targetNode: TreeNode, ev: DragEvent) {
  const guid = ev.dataTransfer?.getData('guid');
  if (!guid) return; // Salir si guid es null o undefined
  const { node, parent } = getDragNode(guid) || {};
  ev.preventDefault();
  ev.stopPropagation();
  if (!node || !parent) return;
  const dragAfterExpanded = props.dragAfterExpanded ?? true;
  if (dragAfterExpanded) {
    targetNode.expanded = true;
  }
  emitEventToTree('drag-node-end', { dragNode: node, targetNode, parentNode: parent, event: ev });
}
</script>

<style scoped>
.tree-ul {
  padding-left: 20px;
}

.tree-root {
  padding-left: 0;
}
</style>