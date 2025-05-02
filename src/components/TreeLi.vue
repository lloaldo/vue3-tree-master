<template>
  <li v-if="itemVisible" :class="liClass">
    <div class="tree-node-el" :draggable="draggable" @dragstart="drag(item, $event)">
      <span
        v-if="showExpand"
        class="tree-expand"
        :class="item.expanded ? 'tree-open' : 'tree-close'"
        @click="expandNode(item)"
      ></span>
      <span
        v-if="props.multiple && !item.nocheck"
        class="inputCheck"
        :class="spanInputClass"
      >
        <input
          :disabled="item.chkDisabled"
          :class="['check', item.chkDisabled ? 'chkDisabled' : '']"
          v-if="props.multiple"
          type="checkbox"
          :checked="checkboxChecked"
          @change="changeNodeCheckStatus(item, $event)"
        />
      </span>
      <Loading :visible="item.loading && item.expanded" />
      <component
        :is="renderComponent"
        :node="item"
        :parent="props.parent ?? null"
        :index="index"
        :tpl="tpl"
        :node-mouse-over="nodeMouseOver"
        :level="props.level ?? defaultProps.level"
      />
    </div>
    <template v-if="showNextUl">
      <TreeUl
        v-show="item.expanded"
        :drag-after-expanded="dragAfterExpanded"
        :draggable="draggable"
        :tpl="tpl"
        :data="item.children ?? []"
        :halfcheck="halfcheck"
        :scoped="scoped"
        :parent="item"
        :can-delete-root="canDeleteRoot"
        :multiple="multiple"
        :level="(props.level ?? defaultProps.level) + 1"
        :max-level="maxLevel"
        :top-must-expand="topMustExpand"
        :allow-get-parent-node="allowGetParentNode"
      />
    </template>
  </li>
</template>

<script setup lang="ts">
import { computed, inject, watch, defineComponent, VNode, onMounted } from 'vue';
import TreeUl from './TreeUl.vue';
import Render from './Render.vue';
import Loading from './Loading.vue';
import { useTreeMixins } from './composables/useTreeMixins';
import type { TreeNode, TreeContext } from './types';

// Props con tipos
const props = defineProps<{
  item: TreeNode;
  index?: number;
  dataLength?: number;
  parent?: TreeNode | null;
  multiple?: boolean;
  draggable?: boolean;
  dragAfterExpanded?: boolean;
  halfcheck?: boolean;
  scoped?: boolean;
  canDeleteRoot?: boolean;
  tpl?: (node: TreeNode, ctx: { level: number; index: number }, parent: TreeNode | null, index: number, props: any) => VNode;
  maxLevel?: number;
  level?: number;
  topMustExpand?: boolean;
  allowGetParentNode?: boolean;
}>();

// Valores por defecto
const defaultProps = {
  index: 0,
  dataLength: 0,
  multiple: false,
  draggable: false,
  dragAfterExpanded: true,
  halfcheck: false,
  scoped: false,
  canDeleteRoot: false,
  level: 0,
  maxLevel: 10,
  topMustExpand: false,
  allowGetParentNode: false,
};

// Inject: Obtener funciones del contexto
const treeContext = inject<TreeContext>('treeContext', {
  isLeaf: () => false,
  childChecked: () => {},
  parentChecked: () => false,
  emitEventToTree: () => {},
  nodeSelected: () => {},
  setAttr: () => {},
});
const { isLeaf, childChecked, parentChecked, nodeSelected, emitEventToTree, setAttr } = treeContext;

// Mixins como composable
const { guid, setDragNode } = useTreeMixins();

// Computed
const itemVisible = computed(() => props.item.visible ?? true);

const hasExpanded = computed(() => {
  const { hasExpanded = false, expanded = false } = props.item;
  return itemVisible.value && (expanded || hasExpanded);
});

const liClass = computed(() => {
  const index = props.index ?? defaultProps.index;
  if (props.parent) {
    return { leaf: isLeaf(props.item) };
  }
  return {
    'first-node': index === 0,
    'only-node': (props.dataLength ?? defaultProps.dataLength) === 1,
    'second-node': index === 1,
  };
});

const hasChildren = computed(() => (props.item.children && props.item.children.length > 0) || false);

const showExpand = computed(() => {
  const isShow = !props.parent ? (props.topMustExpand ?? defaultProps.topMustExpand) : false;
  return isShow || hasChildren.value || props.item.async;
});

const showNextUl = computed(() =>
  !isLeaf(props.item) &&
  (props.maxLevel ?? defaultProps.maxLevel) > (props.level ?? defaultProps.level)
);

const position = computed(() => ({
  level: props.level ?? defaultProps.level,
  index: props.index ?? defaultProps.index,
}));

const checkboxChecked = computed(() => props.item.checked || props.item.halfcheck);

const spanInputClass = computed(() =>
  props.item.checked ? 'box-checked' : props.item.halfcheck ? 'box-halfchecked' : 'box-unchecked'
);

// Renderizado condicional con tpl
const renderComponent = computed(() => {
  if (props.tpl) {
    return defineComponent({
      props: ['node', 'parent', 'index', 'tpl', 'nodeMouseOver', 'level'],
      render(this: { level: number; index: number }) {
        return props.tpl!(
          props.item,
          { level: this.level, index: this.index },
          props.parent ?? null,
          props.index ?? defaultProps.index,
          props
        );
      },
    });
  }
  return Render;
});

// Watchers
watch(
  () => props.item.checked,
  () => {
    if (!(props.scoped ?? defaultProps.scoped)) {
      checkedChange();
    }
  },
  { immediate: true }
);

watch(
  () => props.item.halfcheck,
  () => {
    checkedChange();
  },
  { immediate: true }
);

// Métodos
function drag(node: TreeNode, ev: DragEvent) {
  const guidValue = guid();
  setDragNode(guidValue, node, props.parent ?? null);
  ev.dataTransfer?.setData('guid', guidValue);
}

function expandNode(node: TreeNode) {
  const expended = !node.expanded;
  setAttr(node, 'expanded', expended);
  setAttr(node, 'hasExpanded', true);
  if (node.async && !node.children) {
    emitEventToTree('async-load-nodes', node);
  }
  emitEventToTree('node-expand', node, expended, position.value);
}

function nodeCheck(node: TreeNode, checked: boolean) {
  node.checked = checked;
  if (!(props.scoped ?? defaultProps.scoped)) {
    const halfcheck = props.halfcheck ?? defaultProps.halfcheck;
    if (halfcheck) {
      node.halfcheck = false;
    }
    childChecked(node, checked, halfcheck);
  }
}

function nodeMouseOver(node: TreeNode, index: number, parent: TreeNode | null) {
  emitEventToTree('node-mouse-over', node, index, parent);
}

function changeNodeCheckStatus(node: TreeNode, ev: Event) {
  const checked = (ev.target as HTMLInputElement).checked;
  nodeCheck(node, checked);
  emitEventToTree('node-check', node, checked, position.value);
}

function theParentChecked(checked: boolean, halfcheck: boolean) {
  const parentNode = props.parent;
  parentChecked(parentNode, checked, halfcheck);
}

function checkedChange() {
  const { checked = false, parentCheckedToChildren = false } = props.item;
  if (!(props.scoped ?? defaultProps.scoped) || !parentCheckedToChildren) {
    theParentChecked(checked, props.halfcheck ?? defaultProps.halfcheck);
  }
  if (parentCheckedToChildren) {
    delete props.item.parentCheckedToChildren;
  }
}
</script>
