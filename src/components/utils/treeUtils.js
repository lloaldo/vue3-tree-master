// Mueve un nodo en el árbol durante un evento de drag-and-drop
export function handleNodeDrop({ draggedNode, targetNode, targetIndex, targetParent }, treeData) {
    console.log('treeUtils.handleNodeDrop:', {
        draggedNode: draggedNode.title,
        targetNode: targetNode?.title || 'none',
        targetIndex,
        targetParent: targetParent?.title || 'none',
    });
    // Eliminar el nodo de su posición original
    const removeFromParent = (nodes, nodeToRemove) => {
        const index = nodes.findIndex((n) => n.id === nodeToRemove.id);
        if (index !== -1) {
            nodes.splice(index, 1);
            console.log('treeUtils: Removed node from original position:', nodeToRemove.title);
            return true;
        }
        for (const node of nodes) {
            if (node.children) {
                if (removeFromParent(node.children, nodeToRemove)) {
                    return true;
                }
            }
        }
        return false;
    };
    const removed = removeFromParent(treeData, draggedNode);
    if (!removed) {
        console.warn('treeUtils: Node not found in original position:', draggedNode.title);
        return;
    }
    // Insertar el nodo en la nueva posición
    if (targetParent) {
        if (!targetParent.children) {
            targetParent.children = [];
        }
        targetParent.children.splice(targetIndex, 0, draggedNode);
        draggedNode.parent = targetParent;
        console.log('treeUtils: Inserted node into new parent:', targetParent.title, 'at index:', targetIndex);
    }
    else if (targetNode === null) {
        treeData.splice(targetIndex, 0, draggedNode);
        draggedNode.parent = null;
        console.log('treeUtils: Inserted node as root at index:', targetIndex);
    }
    else {
        if (!targetNode.children) {
            targetNode.children = [];
        }
        targetNode.children.splice(targetIndex, 0, draggedNode);
        draggedNode.parent = targetNode;
        console.log('treeUtils: Inserted node into target:', targetNode.title, 'at index:', targetIndex);
    }
    console.log('treeUtils: treeData after move:', {
        nodes: treeData.map((node) => ({
            id: node.id,
            title: node.title,
            children: node.children?.map((child) => ({
                id: child.id,
                title: child.title,
                children: child.children?.map((grandchild) => ({
                    id: grandchild.id,
                    title: grandchild.title,
                })),
            })),
        })),
    });
}
//# sourceMappingURL=treeUtils.js.map