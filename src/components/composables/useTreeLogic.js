import { ref } from 'vue';
export function useTreeLogic() {
    const expandedNodes = ref(new Set());
    function toggleNode(node) {
        if (node.id === undefined)
            return; // Salir si id es undefined
        if (expandedNodes.value.has(node.id)) {
            expandedNodes.value.delete(node.id);
        }
        else {
            expandedNodes.value.add(node.id);
        }
    }
    return { expandedNodes, toggleNode };
}
//# sourceMappingURL=useTreeLogic.js.map