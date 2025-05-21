# vue3-tree-master: A Vue 3 Tree Component Library

vue3-tree-master is a Vue 3 component library designed to create interactive tree structures with support for asynchronous node loading, multiple selection, search, drag-and-drop, and customization. It is ideal for applications requiring dynamic, hierarchical data display with TypeScript support.

## Key Features

- **Asynchronous Node Loading**: Load child nodes asynchronously with an animated SVG indicator.
- **Multiple Selection**: Supports checkboxes for multiple selection with intermediate states (halfcheck).
- **Node Search**: Filter nodes based on a search term.
- **Drag and Drop**: Reorder or restructure nodes using drag-and-drop.
- **Node Click Handling**: Select nodes with a click and handle selection changes via events.
- **Customization**: Render custom nodes via a template function (`tpl`).
- **Maximum Level Support**: Limit the depth of the tree.
- **Dark Mode Support**: Toggle between light and dark themes for improved accessibility and user experience.
- **TypeScript Support**: Fully typed with TypeScript for robust development.
- **Vue 3 Compatibility**: Built with the Composition API.
- **Animated Transitions**: Smooth expand/collapse animations for nodes (implemented via `CollapseTransition.vue`).

## Installation

### Prerequisites

- Node.js (version 16 or higher)
- Vue 3
- pnpm (recommended) or npm/yarn

### Steps

1. **Install via npm** (once published):

   ```bash
   npm install vue3-tree-master-master
   ```

   Alternatively, clone the repository for development:

   ```bash
   git clone <repository-url>
   cd vue3-tree-master
   ```

2. **Install Dependencies**:

   ```bash
   pnpm install
   ```

   Or with npm:

   ```bash
   npm install
   ```

3. **Run the Development Server**:

   ```bash
   pnpm dev
   ```

   Or with npm:

   ```bash
   npm run dev
   ```

   The application will be available at the configured port.

## Usage

vue3-tree-master provides components to create interactive tree structures. The main component is `Tree.vue`, which supports various features for dynamic trees. Below are examples demonstrating key functionalities.

### Basic Example

Create a simple tree with static nodes and optional dark mode:

```vue
<!-- App.vue -->
<template>
  <div>
    <Tree :data="treeData" :darkMode="isDarkMode" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import Tree from 'vue3-tree-master';
import type { TreeNode } from 'vue3-tree-master';

const isDarkMode = ref<boolean>(false);

const treeData = reactive<TreeNode[]>([
  {
    id: '1',
    title: 'Node 1',
    expanded: true,
    children: [
      { id: '1-1', title: 'Node 1-1' },
      { id: '1-2', title: 'Node 1-2' },
    ],
  },
  {
    id: '2',
    title: 'Node 2',
  },
]);
</script>
```

This renders a tree with `Node 1` (expanded, with two children) and `Node 2`. Set `darkMode` to `true` to enable the dark theme.

### Handling Node Clicks

Handle node selection with the `node-click` event to perform actions when a node is clicked:

```vue
<!-- App.vue -->
<template>
  <div>
    <Tree :data="treeData" :darkMode="isDarkMode" @node-click="handleNodeClick" />
    <p v-if="lastClickedNode">Last clicked node: {{ lastClickedNode }}</p>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import Tree from 'vue3-tree-master';
import type { TreeNode } from 'vue3-tree-master';

const isDarkMode = ref<boolean>(false);

const treeData = reactive<TreeNode[]>([
  {
    id: '1',
    title: 'Node 1',
    children: [
      { id: '1-1', title: 'Node 1-1' },
      { id: '1-2', title: 'Node 1-2' },
    ],
  },
  { id: '2', title: 'Node 2' },
]);

const lastClickedNode = ref<string | null>(null);

const handleNodeClick = (node: TreeNode, selected: boolean) => {
  lastClickedNode.value = node.title;
  console.log(`Node clicked: ${node.title}, selected: ${selected}`);
};
</script>
```

- `@node-click`: Emitted when a node is clicked, providing the node and its selection state.
- In single-selection mode (`multiple: false`), clicking a node deselects others. In multiple-selection mode (`multiple: true`), nodes toggle their selection state.

### Dark Mode Support

Toggle between light and dark themes using the `darkMode` prop. The component applies a `.dark-mode` class internally to switch styles, ensuring compatibility with other libraries by using scoped styles.

```vue
<!-- App.vue -->
<template>
  <div>
    <button @click="toggleDarkMode">Toggle Dark Mode</button>
    <Tree :data="treeData" :darkMode="isDarkMode" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import Tree from 'vue3-tree-master';
import type { TreeNode } from 'vue3-tree-master';

const isDarkMode = ref<boolean>(false);

const treeData = reactive<TreeNode[]>([
  {
    id: '1',
    title: 'Node 1',
    expanded: true,
    children: [
      { id: '1-1', title: 'Node 1-1' },
      { id: '1-2', title: 'Node 1-2' },
    ],
  },
  { id: '2', title: 'Node 2' },
]);

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
};
</script>
```

- **Light Mode**: Uses light backgrounds (e.g., white) and dark text for better readability in bright environments.
- **Dark Mode**: Switches to dark backgrounds (e.g., dark gray) and light text for reduced eye strain in low-light conditions.
- Styles are scoped to avoid conflicts with other CSS frameworks or libraries.

### Asynchronous Node Loading

Enable asynchronous node loading with the `async` property and handle the `async-load-nodes` event. An animated SVG indicator (implemented in `Loading.vue`) is displayed when `node.loading` is `true`.

```vue
<template>
  <div>
    <Tree :data="treeData" :darkMode="isDarkMode" @async-load-nodes="asyncLoad" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import Tree from 'vue3-tree-master';
import type { TreeNode } from 'vue3-tree-master';

const isDarkMode = ref<boolean>(false);

const treeData = reactive<TreeNode[]>([
  {
    id: '1',
    title: 'Node 1',
    expanded: false,
    async: true,
    loading: false,
  },
]);

const asyncLoad = async (node: TreeNode) => {
  node.loading = true;
  const newNodes = await new Promise<TreeNode[]>((resolve) =>
    setTimeout(() =>
      resolve([
        { id: '1-1', title: 'Child 1', loading: false, expanded: false },
        { id: '1-2', title: 'Child 2', loading: false, expanded: false },
      ]),
      2000
    )
  );
  node.children = newNodes;
  node.loading = false;
};
</script>
```

- **Loading Indicator**: The `Loading.vue` component displays an animated SVG with rotating circles when `node.loading` is `true`. Customize its styles by overriding the CSS in `Loading.vue` (e.g., change colors or size).

### Multiple Selection

Enable checkboxes for multiple selection:

```vue
<template>
  <div>
    <Tree
      :data="treeData"
      :multiple="true"
      :halfcheck="true"
      :darkMode="isDarkMode"
      @node-check="onNodeCheck"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import Tree from 'vue3-tree-master';
import type { TreeNode } from 'vue3-tree-master';

const isDarkMode = ref<boolean>(false);

const treeData = reactive<TreeNode[]>([
  { id: '1', title: 'Node 1', children: [{ id: '1-1', title: 'Node 1-1' }] },
  { id: '2', title: 'Node 2' },
]);

const onNodeCheck = (node: TreeNode, checked: boolean) => {
  console.log(`Node ${node.title} checked: ${checked}`);
};
</script>
```

- `multiple`: Enables checkboxes.
- `halfcheck`: Supports intermediate checkbox states.
- `@node-check`: Emitted when a checkbox state changes.

### Drag and Drop

Enable drag-and-drop to reorder nodes:

```vue
<template>
  <div>
    <Tree
      :data="treeData"
      :draggable="true"
      :drag-after-expanded="true"
      :darkMode="isDarkMode"
      @node-drop="onNodeDrop"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import Tree from 'vue3-tree-master';
import type { TreeNode } from 'vue3-tree-master';

const isDarkMode = ref<boolean>(false);

const treeData = reactive<TreeNode[]>([
  { id: '1', title: 'Node 1', children: [{ id: '1-1', title: 'Node 1-1' }] },
  { id: '2', title: 'Node 2' },
]);

const onNodeDrop = (draggedNode: TreeNode, targetNode: TreeNode | null, targetIndex: number, targetParent: TreeNode | null) => {
  console.log(`Dropped ${draggedNode.title} at index ${targetIndex}`);
};
</script>
```

- `draggable`: Enables drag-and-drop.
- `drag-after-expanded`: Expands the target node when dropped inside.
- `@node-drop`: Emitted when a node is dropped.

### Node Search

Filter nodes with a search input:

```vue
<template>
  <div>
    <input
      type="text"
      v-model="searchTerm"
      placeholder="Search..."
      @input="search"
    />
    <Tree ref="tree" :data="treeData" :darkMode="isDarkMode" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import Tree from 'vue3-tree-master';
import type { TreeNode, TreeExposedMethods } from 'vue3-tree-master';

const isDarkMode = ref<boolean>(false);
const searchTerm = ref<string>('');
const tree = ref<TreeExposedMethods | null>(null);

const treeData = reactive<TreeNode[]>([
  { id: '1', title: 'Node 1', children: [{ id: '1-1', title: 'Node 1-1' }] },
  { id: '2', title: 'Node 2' },
]);

const search = () => {
  tree.value?.searchNodes(searchTerm.value);
};
</script>
```

- `searchNodes`: Exposed method to filter nodes by a keyword.

### Node Customization

Customize node rendering with the `tpl` prop:

```vue
<template>
  <div>
    <Tree :data="treeData" :tpl="customTemplate" :darkMode="isDarkMode" />
  </div>
</template>

<script setup lang="ts">
import { reactive, h, ref, type VNode } from 'vue';
import Tree from 'vue3-tree-master';
import type { TreeNode } from 'vue3-tree-master';

const isDarkMode = ref<boolean>(false);

const treeData = reactive<TreeNode[]>([
  { id: '1', title: 'Node 1', children: [{ id: '1-1', title: 'Node 1-1' }] },
]);

const customTemplate = (node: TreeNode, ctx: { level: number; index: number }): VNode => {
  return h('span', { style: { color: isDarkMode.value ? 'lightblue' : 'blue' } }, node.title);
};
</script>
```

- `tpl`: Function to render custom nodes as `VNode`.

## API

### `Tree` Props

| Prop                  | Type                                                                 | Description                                                                 | Default      |
|-----------------------|----------------------------------------------------------------------|-----------------------------------------------------------------------------|--------------|
| `data`                | `TreeNode[]`                                                        | Array of tree nodes (required).                                            | None         |
| `multiple`            | `boolean`                                                           | Enables checkboxes for multiple selection.                                 | `false`      |
| `halfcheck`           | `boolean`                                                           | Enables intermediate states for checkboxes.                                | `false`      |
| `draggable`           | `boolean`                                                           | Enables drag-and-drop for nodes.                                          | `false`      |
| `dragAfterExpanded`   | `boolean`                                                           | Expands target node when dropped inside.                                  | `true`       |
| `scoped`              | `boolean`                                                           | Limits checkbox state propagation to scoped nodes.                        | `false`      |
| `canDeleteRoot`       | `boolean`                                                           | Allows deleting root nodes.                                               | `false`      |
| `tpl`                 | `(node: TreeNode, ctx: { level: number; index: number }, parent: TreeNode | null, index: number, props: any) => VNode` | Custom node rendering function. | None         |
| `maxLevel`            | `number`                                                            | Maximum depth of the tree.                                                | `10`         |
| `topMustExpand`       | `boolean`                                                           | Forces top-level nodes to expand.                                         | `false`      |
| `allowGetParentNode`  | `boolean`                                                           | Allows accessing parent node references.                                  | `false`      |
| `level`               | `number`                                                            | Current level of the tree (internal use).                                 | `0`          |
| `darkMode`            | `boolean`                                                           | Enables dark theme with dark backgrounds and light text.                  | `false`      |

### `Tree` Events

| Event              | Parameters                                                                 | Description                                          |
|--------------------|---------------------------------------------------------------------------|------------------------------------------------------|
| `node-check`       | `(node: TreeNode, checked: boolean, position: Position)`                  | Emitted when a checkbox state changes.               |
| `node-expand`      | `(node: TreeNode, expanded: boolean, position: Position)`                 | Emitted when a node is expanded or collapsed.        |
| `node-click`       | `(node: TreeNode, selected: boolean)`                                    | Emitted when a node is clicked, indicating its selection state. |
| `async-load-nodes` | `(node: TreeNode)`                                                       | Emitted when a node with `async: true` is expanded.  |
| `node-mouse-over`  | `(node: TreeNode, index: number, parent: TreeNode | null)`                | Emitted when hovering over a node.                   |
| `node-drop`        | `(draggedNode: TreeNode, targetNode: TreeNode | null, targetIndex: number, targetParent: TreeNode | null)` | Emitted when a node is dropped. |
| `drag-start`       | `(node: TreeNode)`                                                       | Emitted when a node drag starts.                     |

### `Tree` Exposed Methods

| Method              | Parameters                                                                 | Description                                          |
|---------------------|---------------------------------------------------------------------------|------------------------------------------------------|
| `addNode`           | `(node: TreeNode, newNode: TreeNode)`                                     | Adds a single node to the tree.                     |
| `addNodes`          | `(node: TreeNode, newNodes: (TreeNode | string)[])`                       | Adds multiple nodes to the tree.                    |
| `delNode`           | `(node: TreeNode, parent: TreeNode | null, index: number)`                 | Deletes a node from the tree.                       |
| `searchNodes`       | `(keyword: string)`                                                       | Searches for nodes matching the keyword.            |
| `nodeSelected`      | `(node: TreeNode, position: Position)`                                    | Selects a node programmatically.                    |
| `childCheckedHandle`| `(node: TreeNode, checked: boolean)`                                      | Handles child node checkbox state changes.          |
| `findNode`          | `(nodes: TreeNode[], title: string): TreeNode | null`                     | Finds a node by title.                              |
| `getCheckedNodes`   | `(leafOnly: boolean, includeHalfChecked: boolean): TreeNode[]`            | Returns checked nodes.                              |
| `getSelectedNodes`  | `(leafOnly: boolean, includeHalfChecked: boolean): TreeNode[]`            | Returns selected nodes.                             |
| `setNodeAttr`       | `(node: TreeNode, attr: keyof TreeNode, val: any)`                        | Sets a node attribute.                              |
| `getNodes`          | `(condition?: (node: TreeNode) => boolean): TreeNode[]`                   | Returns nodes matching a condition.                 |

## Contributing

1. Fork the repository: `<repository-url>`.
2. Create a feature branch: `git checkout -b feature/new-feature`.
3. Make changes and commit: `git commit -m 'Add new feature'`.
4. Push to your branch: `git push origin feature/new-feature`.
5. Create a Pull Request.

**Requirements**:
- Follow the coding style (use ESLint and Prettier).
- Add unit tests for new features (using Vitest).
- Update documentation if needed.

Report issues at `<repository-url>/issues`.

## License

vue3-tree-master is licensed under the MIT License. See the `LICENSE` file for details.