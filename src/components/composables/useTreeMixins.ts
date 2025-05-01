import { ref } from 'vue';
import type { TreeNode } from '../types';

export function useTreeMixins() {
  const dragNodes = ref<Map<string, { node: TreeNode; parent: TreeNode | null }>>(new Map());

  function guid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function setDragNode(guid: string, node: TreeNode, parent: TreeNode | null) {
    dragNodes.value.set(guid, { node, parent });
  }

  function getDragNode(guid: string): { node: TreeNode; parent: TreeNode | null } {
    return dragNodes.value.get(guid) ?? { node: {} as TreeNode, parent: null };
  }

  function hasInGenerations(dragNode: TreeNode, targetNode: TreeNode): boolean {
    let current: TreeNode | undefined = targetNode;
    while (current) {
      if (current === dragNode) return true;
      current = current.parent ? (typeof current.parent === 'function' ? current.parent() : current.parent) : undefined;
    }
    return false;
  }

  return { guid, setDragNode, getDragNode, hasInGenerations };
}