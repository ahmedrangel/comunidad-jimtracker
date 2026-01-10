<script setup lang="ts">
const { user, loggedIn, clear } = useUserSession();
</script>

<template>
  <div id="layout">
    <nav class="flex items-center rounded justify-center bg-white/3 backdrop-blur px-3 py-2 border border-white/5 shadow-lg shadow-black/20 gap-2">
      <NuxtLink to="/" class="nav-link border border-white/0 font-semibold px-3 py-1 rounded hover:bg-white/5 hover:backdrop-blur transition-colors duration-200">Inicio</NuxtLink>
      <NuxtLink v-if="loggedIn" :to="`/u/${user?.twitchLogin}`" class="nav-link border border-white/0 font-semibold px-3 py-1 rounded hover:bg-white/5 hover:backdrop-blur transition-colors duration-200">{{ user?.twitchDisplay }}</NuxtLink>
      <button v-if="loggedIn" class="nav-link border border-white/0 font-semibold px-3 py-1 rounded hover:bg-white/5 hover:backdrop-blur transition-colors duration-200" @click="clear">Salir</button>
      <NuxtLink v-else to="/auth/twitch" class="nav-link border border-white/0 font-semibold px-3 py-1 rounded hover:bg-white/5 hover:backdrop-blur transition-colors duration-200" external>Unirse</NuxtLink>
    </nav>
    <div class="lg:container mx-auto py-5 px-2">
      <slot />
      <footer class="text-center text-sm text-slate-300 pt-5">
        <span>
          <NuxtLink href="https://github.com/ahmedrangel/jimtracker" target="_blank" external class="text-emerald-300 font-semibold hover:underline">Creado</NuxtLink>
          con ❤️ por
          <NuxtLink href="https://github.com/ahmedrangel" target="_blank" external class="text-emerald-300 font-semibold hover:underline">Ahmed Rangel</NuxtLink>
        </span>
      </footer>
    </div>
  </div>
</template>
