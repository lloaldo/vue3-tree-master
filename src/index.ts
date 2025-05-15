// /src/index.ts
import { App, Plugin } from 'vue';
import TreeView from './components/TreeView.vue';
import SelectTree from './components/SelectTree.vue';
import { TreeViewNode, Position, EmitEventArgs, TreeContext, TreeExposedMethods } from './types/index';

const VueTree: Plugin = {
  install(app: App) {
    app.component('TreeView', TreeView);
    app.component('SelectTree', SelectTree);
  }
};

export { TreeView, SelectTree, VueTree as default };
export type { TreeViewNode, Position, EmitEventArgs, TreeContext, TreeExposedMethods };