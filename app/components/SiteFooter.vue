<template>
  <UFooter class="w-full">
    <template #left>
      <p class="text-muted text-sm">{{ SITE.name }} © {{ new Date().getFullYear() }}</p>
    </template>
    <span class="text-sm">
      <NuxtLink :to="SITE.github.repository" target="_blank" class="text-blue-300 font-semibold hover:underline">Creado</NuxtLink>
      con ❤️ por
      <NuxtLink :to="SITE.github.authors.ahmed.url" target="_blank" class="text-emerald-300 font-semibold hover:underline">
        {{ SITE.github.authors.ahmed.name }}
      </NuxtLink>
      y
      <NuxtLink :to="SITE.github.authors.yizack.url" target="_blank" class="text-yellow-300 font-semibold hover:underline">
        {{ SITE.github.authors.yizack.name }}
      </NuxtLink>
    </span>
    <template #right>
      <NuxtLink :to="SITE.github.repository" target="_blank" class="hover:text-white">
        <Icon name="simple-icons:github" class="w-8 h-8" />
      </NuxtLink>
    </template>
  </UFooter>
</template>
