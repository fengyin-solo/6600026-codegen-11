<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import type { AlignmentResult } from '../types';

const props = withDefaults(defineProps<{
  result: AlignmentResult | null;
  title?: string;
  showRemove?: boolean;
  showEmptyState?: boolean;
}>(), {
  title: '',
  showRemove: false,
  showEmptyState: true
});

const emit = defineEmits<{
  (e: 'remove'): void;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const scrollContainer = ref<HTMLDivElement | null>(null);

const BASE_COLORS: Record<string, string> = {
  A: '#22c55e',
  T: '#ef4444',
  G: '#3b82f6',
  C: '#eab308',
  '-': '#4b5563'
};

function drawAlignment() {
  const canvas = canvasRef.value;
  if (!canvas || !props.result) return;

  const { aligned1, aligned2 } = props.result;
  const len = aligned1.length;
  const cellWidth = 12;
  const cellHeight = 22;
  const padding = 10;
  const width = Math.max(len * cellWidth + padding * 2, 600);
  const height = 100;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, width, height);

  ctx.font = '11px monospace';
  ctx.textAlign = 'center';

  const y1 = 20;
  for (let i = 0; i < len; i++) {
    const x = padding + i * cellWidth;
    const base = aligned1[i];
    ctx.fillStyle = BASE_COLORS[base] || '#4b5563';
    ctx.fillRect(x, y1 - 8, cellWidth - 1, cellHeight);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(base, x + cellWidth / 2, y1 + 6);
  }

  const yMid = 50;
  ctx.font = '10px monospace';
  for (let i = 0; i < len; i++) {
    const x = padding + i * cellWidth;
    const c1 = aligned1[i];
    const c2 = aligned2[i];
    if (c1 === '-' || c2 === '-') {
      ctx.fillStyle = '#6b7280';
      ctx.fillText(' ', x + cellWidth / 2, yMid + 4);
    } else if (c1 === c2) {
      ctx.fillStyle = '#22c55e';
      ctx.fillText('|', x + cellWidth / 2, yMid + 4);
    } else {
      ctx.fillStyle = '#ef4444';
      ctx.fillText('X', x + cellWidth / 2, yMid + 4);
    }
  }

  const y2 = 65;
  for (let i = 0; i < len; i++) {
    const x = padding + i * cellWidth;
    const base = aligned2[i];
    ctx.fillStyle = BASE_COLORS[base] || '#4b5563';
    ctx.fillRect(x, y2 - 8, cellWidth - 1, cellHeight);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(base, x + cellWidth / 2, y2 + 6);
  }
}

onMounted(() => {
  drawAlignment();
});

watch(() => props.result, () => {
  nextTick(() => drawAlignment());
}, { deep: true });
</script>

<template>
  <div class="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
    <div v-if="result" class="space-y-2">
      <div v-if="title || showRemove" class="flex items-center justify-between px-3 py-1.5 bg-gray-800 border-b border-gray-700">
        <div class="text-xs font-medium text-cyan-400 truncate flex-1 mr-2">{{ title }}</div>
        <button
          v-if="showRemove"
          @click="emit('remove')"
          class="text-gray-500 hover:text-red-400 transition-colors text-xs px-1.5 py-0.5 rounded hover:bg-gray-700"
          title="移除此比对"
        >
          ✕
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-1.5 bg-gray-850 text-xs" style="background-color: #1a2234;">
        <span class="text-gray-400">算法: <span class="text-cyan-400">{{ result.algorithm }}</span></span>
        <span class="text-gray-400">得分: <span class="text-yellow-400 font-bold">{{ result.score }}</span></span>
        <span class="text-gray-400">一致性: <span class="text-green-400 font-bold">{{ result.identity }}%</span></span>
        <span class="text-gray-400">缺口: <span class="text-red-400">{{ result.gaps }}</span></span>
        <span class="text-gray-400">长度: <span class="text-purple-400">{{ result.aligned1.length }} bp</span></span>
      </div>

      <div class="flex flex-wrap items-center gap-3 px-3 text-xs text-gray-500">
        <span class="flex items-center gap-1"><span class="inline-block w-3 h-3 rounded" style="background:#22c55e"></span> A</span>
        <span class="flex items-center gap-1"><span class="inline-block w-3 h-3 rounded" style="background:#ef4444"></span> T</span>
        <span class="flex items-center gap-1"><span class="inline-block w-3 h-3 rounded" style="background:#3b82f6"></span> G</span>
        <span class="flex items-center gap-1"><span class="inline-block w-3 h-3 rounded" style="background:#eab308"></span> C</span>
        <span class="flex items-center gap-1"><span class="inline-block w-3 h-3 rounded" style="background:#4b5563"></span> Gap</span>
        <span class="ml-1 text-green-500">| 匹配</span>
        <span class="text-red-500">X 错配</span>
      </div>

      <div ref="scrollContainer" class="overflow-x-auto px-3 pb-2">
        <canvas ref="canvasRef" class="block"></canvas>
      </div>
    </div>

    <div v-else-if="showEmptyState" class="flex items-center justify-center py-12 text-gray-600 text-sm">
      请选择两个序列并运行比对以查看结果
    </div>
  </div>
</template>
