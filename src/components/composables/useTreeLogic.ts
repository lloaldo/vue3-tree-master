// src/components/composables/useTreeLogic.ts
import { ref } from 'vue';
import type { TreeNode } from '../types';

export function useTreeLogic() {
  const expandedNodes = ref<Set<string | number>>(new Set());

  function toggleNode(node: TreeNode) {
    if (expandedNodes.value.has(node.id)) {
      expandedNodes.value.delete(node.id);
    } else {
      expandedNodes.value.add(node.id);
    }
  }

  return { expandedNodes, toggleNode };
}