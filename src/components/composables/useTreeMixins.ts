import { ref } from 'vue';
import type { TreeNode } from '../types';

// Estado global único para dragNodes
const dragNodes = ref<Map<string, { node: TreeNode; parent: TreeNode | null }>>(new Map());

export const useTreeMixins = (() => {
  let instance: ReturnType<typeof createMixins>;

  function createMixins() {
    const guid = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };

    const setDragNode = (guid: string, node: TreeNode, parent: TreeNode | null) => {
      dragNodes.value.set(guid, { node, parent });
    };

    const getDragNode = (guid: string) => {
      const dragInfo = dragNodes.value.get(guid) || null;
      return dragInfo;
    };

    const cleanDragNode = (guid: string) => {
      dragNodes.value.delete(guid);
    };

    return {
      guid,
      setDragNode,
      getDragNode,
      cleanDragNode,
    };
  }

  return () => {
    if (!instance) {
      instance = createMixins();
    }
    return instance;
  };
})();