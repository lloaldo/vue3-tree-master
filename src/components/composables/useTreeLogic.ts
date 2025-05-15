import { ref } from 'vue';
import type { TreeViewNode } from '@/types';

export function useTreeLogic() {
  const expandedNodes = ref<Set<string | number>>(new Set());

  function toggleNode(node: TreeViewNode) {
    if (node.id === undefined) return; // Salir si id es undefined
    if (expandedNodes.value.has(node.id)) {
      expandedNodes.value.delete(node.id);
    } else {
      expandedNodes.value.add(node.id);
    }
  }

  return { expandedNodes, toggleNode };
}