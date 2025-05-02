<template>
  <span
    :innerHTML="node.title"
    :title="node.title"
    :class="titleClass"
    style="user-select: none"
    @mouseover="handleMouseOver"
    @click="handleClick"
  ></span>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import type { TreeNode, TreeContext } from './types';

// Props con tipos
const props = defineProps<{
  node: TreeNode;
  parent?: TreeNode | null;
  tpl?: (node: TreeNode, ctx: any, parent: TreeNode | null, index: number, props: any) => any;
  index: number;
  nodeMouseOver: (node: TreeNode, index: number, parent: TreeNode | null) => void;
  level: number;
}>();

// Inject: Obtener funciones del contexto
const treeContext = inject<TreeContext>('treeContext', {
  isLeaf: () => false,
  childChecked: () => {},
  parentChecked: () => false,
  emitEventToTree: () => {},
  nodeSelected: () => {},
  setAttr: () => {},
});
const { nodeSelected } = treeContext;

// Computed: Clases dinámicas
const titleClass = computed(() => {
  const { selected, selDisabled = false, searched } = props.node;
  let classes = selDisabled ? 'node-title-disabled' : selected ? 'node-title node-selected' : 'node-title';
  if (searched) classes += ' node-searched';
  return classes;
});

// Métodos
const handleMouseOver = () => {
  props.nodeMouseOver(props.node, props.index, props.parent ?? null); // Aseguramos que parent sea TreeNode | null
};

const handleClick = () => {
  if (props.node.selDisabled) return;
  nodeSelected(props.node, { level: props.level, index: props.index });
};

// Si hay una función tpl, renderizarla
// Nota: Esto se maneja en el componente padre (TreeLi.vue) ya que Vue 3 no permite renderizado condicional de templates fácilmente.
// Por ahora, asumimos que tpl no está definido y usamos el span por defecto.
</script>

<style scoped>
.node-title {
  padding: 2px 5px;
  cursor: pointer;
}

.node-title-disabled {
  color: #999;
  cursor: not-allowed;
}

.node-selected {
  background-color: #e0e0e0;
}

.node-searched {
  background-color: #ffeb3b;
}
</style>