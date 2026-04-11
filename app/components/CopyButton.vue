<script setup lang="ts">
import { useClipboard } from "@vueuse/core";

defineProps<{
  value: string;
  size?: "md" | "xs" | "sm" | "lg" | "xl";
  tooltipSide?: "top" | "right" | "bottom" | "left";
}>();

const { copy, copied } = useClipboard();

const emit = defineEmits<{
  copy: [];
}>();

watch(copied, (bool) => {
  if (!bool) return;
  emit("copy");
});

const tablePopover = useTablePopover();
</script>

<template>
  <UButton
    :size="size || 'xs'"
    :color="copied ? 'success' : 'neutral'"
    variant="link"
    :icon="copied ? 'lucide:copy-check' : 'lucide:copy'"
    aria-label="Copy to clipboard"
    @click="copy(value)"
    v-on="tablePopover.handlers('Copiar')"
  />
</template>
