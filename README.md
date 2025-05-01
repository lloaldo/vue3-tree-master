# Vue3-Tree a Vue 3 Tree Component Library

Vue3-Tree is a Vue 3 component library designed to create interactive tree structures with support for asynchronous node loading, multiple selection, search, drag-and-drop, and more. This component is ideal for applications that need to display hierarchical data dynamically and with customization options.

## Key Features

- **Asynchronous Node Loading**: Load child nodes asynchronously with an animated loading indicator.
- **Multiple Selection**: Supports checkboxes for multiple selection with intermediate states (halfcheck).
- **Node Search**: Filter nodes based on a search term.
- **Drag and Drop**: Reorder nodes using drag-and-drop.
- **Animated Transitions**: Includes transitions for expanding/collapsing nodes.
- **Customization**: Custom node rendering via a template function (`tpl`).
- **Maximum Level Support**: Limit the depth of the tree.
- **Vue 3 Compatibility**: Built with the Composition API.

## Installation

### Prerequisites

- Node.js (version 16 or higher)
- Vue 3
- pnpm (or npm/yarn as an alternative)

### Steps

1. **Clone the Repository** (if using a repository):

   ```bash
   git clone <repository-url>
   cd vue3-tree-master
   ```

2. **Install Dependencies**:

   Use pnpm (recommended) to install dependencies:

   ```bash
   pnpm install
   ```

   Alternatively, with npm:

   ```bash
   npm install
   ```

3. **Run the Project**:

   Start the development server:

   ```bash
   pnpm dev
   ```

   Or with npm:

   ```bash
   npm run dev
   ```

   This will launch the application at `http://localhost:5173` (or the configured port).

## Usage

Vue3-Tree provides several components to create interactive tree structures. Below, we describe how to use the main `Tree.vue` component and its features.

### Basic Example

Create a simple tree with static nodes:

```vue
<!-- App.vue -->
<template>
  <div>
    <Tree :data="treeData" />
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import Tree from './components/Tree.vue';
import type { TreeNode } from './components/types';

const treeData = reactive<TreeNode[]>([
  {
    title: 'Node 1',
    expanded: true,
    children: [
      { title: 'Node 1-1' },
      { title: 'Node 1-2' },
    ],
  },
  {
    title: 'Node 2',
  },
]);
</script>
```

This will render a tree with two main nodes: `Node 1` (expanded, with two children) and `Node 2`.

### Asynchronous Node Loading

Vue-Tree supports asynchronous loading of nodes. To enable it, define a node with the `async: true` property and handle the `async-load-nodes` event.

```vue
<!-- App.vue -->
<template>
  <div>
    <Tree
      :data="treeData"
      @async-load-nodes="asyncLoad"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import Tree from './components/Tree.vue';
import type { TreeNode } from './components/types';

const treeData = reactive<TreeNode[]>([
  {
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
        { title: 'Child 1', loading: false, expanded: false },
        { title: 'Child 2', loading: false, expanded: false },
      ]),
      2000
    )
  );
  node.children = newNodes;
  node.loading = false;
};
</script>
```

- **Loading Indicator**: While `node.loading` is `true`, an animated SVG loading indicator will be displayed next to the node.

### Multiple Selection

Enable multiple selection with checkboxes using the `multiple` prop:

```vue
<Tree
  :data="treeData"
  :multiple="true"
  :halfcheck="true"
  @node-check="onNodeCheck"
/>
```

```typescript
const onNodeCheck = (node: TreeNode, checked: boolean) => {
  console.log(`Node ${node.title} checked: ${checked}`);
};
```

- `multiple`: Enables checkboxes for multiple selection.
- `halfcheck`: Allows intermediate states (when some children are selected).
- `@node-check`: Event emitted when a node's selection state changes.

### Node Search

Add a search field to filter nodes:

```vue
<template>
  <div>
    <input
      type="text"
      v-model="searchword"
      placeholder="Search..."
      @input="search"
    />
    <Tree ref="tree" :data="treeData" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import Tree from './components/Tree.vue';
import type { TreeNode, TreeExposedMethods } from './components/types';

const searchword = ref<string>('');
const tree = ref<TreeExposedMethods | null>(null);

const treeData = reactive<TreeNode[]>([
  { title: 'Node 1', children: [{ title: 'Node 1-1' }] },
  { title: 'Node 2' },
]);

const search = () => {
  tree.value?.searchNodes(searchword.value);
};
</script>
```

- `searchNodes`: Method exposed by `Tree` to search for nodes matching the input term.

### Node Customization

Customize the appearance of nodes using the `tpl` prop:

```vue
<template>
  <div>
    <Tree :data="treeData" :tpl="customTemplate" />
  </div>
</template>

<script setup lang="ts">
import { reactive, h, type VNode } from 'vue';
import Tree from './components/Tree.vue';
import type { TreeNode } from './components/types';

const treeData = reactive<TreeNode[]>([
  { title: 'Node 1', children: [{ title: 'Node 1-1' }] },
]);

const customTemplate = (node: TreeNode): VNode => {
  return h('span', { style: { color: 'blue' } }, node.title);
};
</script>
```

- `tpl`: A function that takes the node and returns a customized `VNode`.

## API

### `Tree` Props

| Prop                | Type                                                                 | Description                                                                 | Default     |
|---------------------|----------------------------------------------------------------------|-----------------------------------------------------------------------------|-------------|
| `data`              | `TreeNode[]`                                                        | Tree data (nodes).                                                         | `[]`        |
| `multiple`          | `boolean`                                                           | Enables multiple selection with checkboxes.                                | `false`     |
| `halfcheck`         | `boolean`                                                           | Enables intermediate states for checkboxes.                                | `false`     |
| `draggable`         | `boolean`                                                           | Enables drag-and-drop for nodes.                                           | `false`     |
| `dragAfterExpanded` | `boolean`                                                           | Allows dragging after expanding a node.                                    | `true`      |
| `tpl`               | `(node: TreeNode, ctx: { level: number; index: number }, parent: TreeNode | null, index: number, props: any) => VNode` | Function to render custom nodes. | `undefined` |
| `maxLevel`          | `number`                                                            | Maximum depth of the tree.                                                 | `10`        |
| `topMustExpand`     | `boolean`                                                           | Forces top-level nodes to expand.                                          | `false`     |
| `canDeleteRoot`     | `boolean`                                                           | Allows deleting root nodes.                                                | `false`     |

### `Tree` Events

| Event             | Parameters                                  | Description                                          |
|-------------------|---------------------------------------------|------------------------------------------------------|
| `node-check`      | `(node: TreeNode, checked: boolean)`        | Emitted when a checkbox state changes.               |
| `node-expand`     | `(node: TreeNode, expanded: boolean)`       | Emitted when a node is expanded or collapsed.        |
| `async-load-nodes`| `(node: TreeNode)`                          | Emitted when a node with `async: true` is expanded.  |

### `Tree` Exposed Methods

| Method         | Description                              |
|----------------|------------------------------------------|
| `addNode`      | Adds a new node.                         |
| `addNodes`     | Adds multiple nodes.                     |
| `delNode`      | Deletes a node.                          |
| `searchNodes`  | Searches for nodes by a keyword.         |
| `nodeSelected` | Selects a node.                          |

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/new-feature`).
3. Make your changes and commit (`git commit -m 'Add new feature'`).
4. Push to your branch (`git push origin feature/new-feature`).
5. Create a Pull Request.

## License

HaloTree is licensed under the MIT License. See the `LICENSE` file for details.