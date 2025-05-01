import { ref } from 'vue';
export function useTreeMixins() {
    const dragNodes = ref(new Map());
    function guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
    function setDragNode(guid, node, parent) {
        dragNodes.value.set(guid, { node, parent });
    }
    function getDragNode(guid) {
        return dragNodes.value.get(guid) ?? { node: {}, parent: null };
    }
    function hasInGenerations(dragNode, targetNode) {
        let current = targetNode;
        while (current) {
            if (current === dragNode)
                return true;
            current = current.parent ? (typeof current.parent === 'function' ? current.parent() : current.parent) : undefined;
        }
        return false;
    }
    return { guid, setDragNode, getDragNode, hasInGenerations };
}
//# sourceMappingURL=useTreeMixins.js.map