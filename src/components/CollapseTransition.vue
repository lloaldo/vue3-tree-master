<template>
  <transition
    name="collapse"
    @before-enter="beforeEnter"
    @enter="enter"
    @after-enter="afterEnter"
    @before-leave="beforeLeave"
    @leave="leave"
    @after-leave="afterLeave"
  >
    <slot />
  </transition>
</template>

<script setup lang="ts">
const beforeEnter = (el: HTMLElement) => {
  el.style.height = '0';
  el.style.overflow = 'hidden';
};

const enter = (el: HTMLElement) => {
  el.style.height = `${el.scrollHeight}px`;
};

const afterEnter = (el: HTMLElement) => {
  el.style.height = '';
  el.style.overflow = '';
};

const beforeLeave = (el: HTMLElement) => {
  el.style.height = `${el.scrollHeight}px`;
  el.style.overflow = 'hidden';
};

const leave = (el: HTMLElement) => {
  el.style.height = '0';
};

const afterLeave = (el: HTMLElement) => {
  el.style.height = '';
  el.style.overflow = '';
};
</script>

<style scoped>
.collapse-enter-active,
.collapse-leave-active {
  transition: height 0.3s ease;
}
</style>