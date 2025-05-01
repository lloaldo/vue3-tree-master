<template>
  <Transition
    name="expand"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @leave="onLeave"
    @after-leave="onAfterLeave"
  >
    <slot></slot>
  </Transition>
</template>

<script setup lang="ts">
const onEnter = (el: Element) => {
  const htmlEl = el as HTMLElement;
  htmlEl.style.height = 'auto';
  const height = getComputedStyle(htmlEl).height;
  htmlEl.style.height = '0px';
  htmlEl.offsetHeight;
  htmlEl.style.height = height;
};

const onAfterEnter = (el: Element) => {
  const htmlEl = el as HTMLElement;
  htmlEl.style.height = 'auto';
};

const onLeave = (el: Element) => {
  const htmlEl = el as HTMLElement;
  htmlEl.style.height = getComputedStyle(htmlEl).height;
  htmlEl.offsetHeight;
  htmlEl.style.height = '0px';
};

const onAfterLeave = (el: Element) => {
  const htmlEl = el as HTMLElement;
  htmlEl.style.height = '';
};
</script>

<style scoped>
.collapse-enter-active,
.collapse-leave-active {
  transition: height 0.3s ease;
}
</style>