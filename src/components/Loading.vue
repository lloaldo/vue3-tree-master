<template>
  <svg viewBox="0 0 120 120" version="1.1" v-if="visible">
    <g id="circle" class="g-circles g-circles--v3">
      <circle id="12" transform="translate(35, 16.698730) rotate(-30) translate(-35, -16.698730)" cx="35" cy="16.6987298" r="10"></circle>
      <circle id="11" transform="translate(16.698730, 35) rotate(-60) translate(-16.698730, -35)" cx="16.6987298" cy="35" r="10"></circle>
      <circle id="10" transform="translate(10, 60) rotate(-90) translate(-10, -60)" cx="10" cy="60" r="10"></circle>
      <circle id="9" transform="translate(16.698730, 85) rotate(-120) translate(-16.698730, -85)" cx="16.6987298" cy="85" r="10"></circle>
      <circle id="8" transform="translate(35, 103.301270) rotate(-150) translate(-35, -103.301270)" cx="35" cy="103.30127" r="10"></circle>
      <circle id="7" cx="60" cy="110" r="10"></circle>
      <circle id="6" transform="translate(85, 103.301270) rotate(-30) translate(-85, -103.301270)" cx="85" cy="103.30127" r="10"></circle>
      <circle id="5" transform="translate(103.301270, 85) rotate(-60) translate(-103.301270, -85)" cx="103.30127" cy="85" r="10"></circle>
      <circle id="4" transform="translate(110, 60) rotate(-90) translate(-110, -60)" cx="110" cy="60" r="10"></circle>
      <circle id="3" transform="translate(103.301270, 35) rotate(-120) translate(-103.301270, -35)" cx="103.30127" cy="35" r="10"></circle>
      <circle id="2" transform="translate(85, 16.698730) rotate(-150) translate(-85, -16.698730)" cx="85" cy="16.6987298" r="10"></circle>
      <circle id="1" cx="60" cy="10" r="10"></circle>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

defineProps<{
  visible?: boolean;
}>();
</script>

<style scoped>
svg {
  height: 14px;
  width: 14px;
  overflow: visible;
  line-height: 14px;
  margin-left: 5px;
  vertical-align: middle;
  display: inline-block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

circle {
  fill: dodgerblue;
  fill-opacity: 0;
  -webkit-animation: opacity 1.2s linear infinite;
  animation: opacity 1.2s linear infinite;
}

circle:nth-child(12n + 1) {
  -webkit-animation-delay: -0.1s;
  animation-delay: -0.1s;
}

circle:nth-child(12n + 2) {
  -webkit-animation-delay: -0.2s;
  animation-delay: -0.2s;
}

circle:nth-child(12n + 3) {
  -webkit-animation-delay: -0.3s;
  animation-delay: -0.3s;
}

circle:nth-child(12n + 4) {
  -webkit-animation-delay: -0.4s;
  animation-delay: -0.4s;
}

circle:nth-child(12n + 5) {
  -webkit-animation-delay: -0.5s;
  animation-delay: -0.5s;
}

circle:nth-child(12n + 6) {
  -webkit-animation-delay: -0.6s;
  animation-delay: -0.6s;
}

circle:nth-child(12n + 7) {
  -webkit-animation-delay: -0.7s;
  animation-delay: -0.7s;
}

circle:nth-child(12n + 8) {
  -webkit-animation-delay: -0.8s;
  animation-delay: -0.8s;
}

circle:nth-child(12n + 9) {
  -webkit-animation-delay: -0.9s;
  animation-delay: -0.9s;
}

circle:nth-child(12n + 10) {
  -webkit-animation-delay: -1s;
  animation-delay: -1s;
}

circle:nth-child(12n + 11) {
  -webkit-animation-delay: -1.1s;
  animation-delay: -1.1s;
}

circle:nth-child(12n + 12) {
  -webkit-animation-delay: -1.2s;
  animation-delay: -1.2s;
}

.g-circles--v3 circle {
  fill-opacity: 1;
  -webkit-animation-name: opacity, colors;
  animation-name: opacity, colors;
}

@-webkit-keyframes opacity {
  3% {
    fill-opacity: 1;
  }
  75% {
    fill-opacity: 0;
  }
}

@keyframes opacity {
  3% {
    fill-opacity: 1;
  }
  75% {
    fill-opacity: 0;
  }
}

@-webkit-keyframes colors {
  0% {
    fill: yellowgreen;
  }
  10% {
    fill: gold;
  }
  75% {
    fill: crimson;
  }
}

@keyframes colors {
  0% {
    fill: yellowgreen;
  }
  10% {
    fill: gold;
  }
  75% {
    fill: crimson;
  }
}
</style>