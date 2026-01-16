<script setup lang="ts">
defineProps<{
  row: any;
}>();
</script>

<template>
  <RoleSelector :data="row.original" />
</template>
