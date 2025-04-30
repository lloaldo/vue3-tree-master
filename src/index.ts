import { App, Plugin } from 'vue';
import Tree from './components/Tree.vue';
import SelectTree from './components/SelectTree.vue';

const VueTree: Plugin = {
  install(app: App) {
    app.component('Tree', Tree);
    app.component('SelectTree', SelectTree);
  }
};

export default VueTree;
export { Tree, SelectTree };;