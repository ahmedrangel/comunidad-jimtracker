<template>
  <div id="layout" class="flex flex-col min-h-screen">
    <SiteNavbar />
    <div class="lg:container mx-auto py-5 px-2 grow max-w-screen">
      <slot />
    </div>
    <footer class="flex flex-col items-center justify-center text-sm text-toned py-5 gap-4 border-t border-default">
      <span>
        <NuxtLink href="https://github.com/ahmedrangel/comunidad-jimtracker" target="_blank" class="text-blue-300 font-semibold hover:underline">Creado</NuxtLink>
        con ❤️ por
        <NuxtLink href="https://github.com/ahmedrangel" target="_blank" class="text-emerald-300 font-semibold hover:underline">Ahmed</NuxtLink>
        y
        <NuxtLink href="https://github.com/yizack" target="_blank" class="text-yellow-300 font-semibold hover:underline">Yizack</NuxtLink>
      </span>
      <NuxtLink href="https://github.com/ahmedrangel/comunidad-jimtracker" target="_blank" class="hover:text-white">
        <Icon name="simple-icons:github" class="w-8 h-8" />
      </NuxtLink>
    </footer>
  </div>
</template>
