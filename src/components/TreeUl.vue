<template>
  <ul class="tree-ul" :class="{ 'tree-root': !parent }">
    <TreeLi
      v-for="(item, index) in data"
      :key="item.id"
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
      @dragover.stop="dragover"
      @drop.stop="drop($event, item, index)"
    />
  </ul>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue';
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
const { emitEventToTree, setAttr } = treeContext;

// Mixins como composable
const { getDragNode, cleanDragNode } = useTreeMixins();

// Estado para manejar la posición del drag-and-drop
const dropPosition = ref<'before' | 'after' | 'inside' | null>(null);

// Métodos
function dragover(ev: DragEvent) {
  ev.preventDefault();
  ev.stopPropagation();
  const target = ev.target as HTMLElement;
  const rect = target.getBoundingClientRect();
  const y = ev.clientY - rect.top;
  const height = rect.height;
  if (y < height / 3) {
    dropPosition.value = 'before';
  } else if (y > (2 * height) / 3) {
    dropPosition.value = 'after';
  } else {
    dropPosition.value = 'inside';
  }
}

function drop(ev: DragEvent, targetNode: TreeNode | null, targetIndex: number) {
  if (!(ev instanceof DragEvent)) {
    return;
  }

  ev.preventDefault();
  ev.stopPropagation();

  const guid = ev.dataTransfer?.getData('guid');
  if (!guid) {
    return;
  }

  const dragInfo = getDragNode(guid);
  if (!dragInfo) {
    return;
  }

  let adjustedIndex = targetIndex;
  let adjustedParent = props.parent ?? null;

  if (targetNode) {
    if (dropPosition.value === 'inside') {
      adjustedParent = targetNode;
      adjustedIndex = targetNode.children ? targetNode.children.length : 0;
      const dragAfterExpanded = props.dragAfterExpanded ?? true;
      if (dragAfterExpanded && !targetNode.expanded) {
        setAttr(targetNode, 'expanded', true);
      }
    } else if (dropPosition.value === 'before') {
    } else if (dropPosition.value === 'after') {
      adjustedIndex += 1;
    }
  } else {
  }

  // Ajustar targetNode para evitar el error de TypeScript
  const safeTargetNode: TreeNode = targetNode || ({} as TreeNode); // Solución temporal
  emitEventToTree('node-drop', ev, safeTargetNode, adjustedIndex, adjustedParent);

  cleanDragNode(guid);

  dropPosition.value = null;
}
</script>

<style scoped>
.tree-ul {
  padding-left: 20px;
  margin: 0;
  list-style: none;
}

.tree-root {
  padding-left: 0;
}

.drop-target {
  position: relative;
}

.drop-target:hover {
  background-color: #f0f0f0;
}
</style>