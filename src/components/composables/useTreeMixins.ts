import { ref } from 'vue';
import type { TreeNode } from '../types';

export function useTreeMixins() {
  console.log('useTreeMixins ejecutado'); // Depuración: Confirmar ejecución
  const dragNodes = ref<Map<string, { node: TreeNode; parent: TreeNode | null }>>(new Map());

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
    return dragNodes.value.get(guid) || null;
  };

  const cleanDragNode = (guid: string) => {
    dragNodes.value.delete(guid);
  };

  const result = {
    guid,
    setDragNode,
    getDragNode,
    cleanDragNode,
  };
  console.log('useTreeMixins result:', result); // Depuración: Mostrar resultado
  return result;
}