import { ref } from 'vue';
// Estado global único para dragNodes
const dragNodes = ref(new Map());
export const useTreeMixins = (() => {
    let instance;
    function createMixins() {
        const guid = () => {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = (Math.random() * 16) | 0;
                const v = c === 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            });
        };
        const setDragNode = (guid, node, parent) => {
            console.log('useTreeMixins setDragNode: Storing GUID:', guid, 'for node:', node.title);
            dragNodes.value.set(guid, { node, parent });
        };
        const getDragNode = (guid) => {
            const dragInfo = dragNodes.value.get(guid) || null;
            console.log('useTreeMixins getDragNode: Retrieving GUID:', guid, 'found:', dragInfo ? dragInfo.node.title : 'not found');
            return dragInfo;
        };
        const cleanDragNode = (guid) => {
            console.log('useTreeMixins cleanDragNode: Removing GUID:', guid);
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
//# sourceMappingURL=useTreeMixins.js.map