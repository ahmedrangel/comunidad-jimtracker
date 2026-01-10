<script setup lang="ts">
const { user, loggedIn, clear } = useUserSession();
</script>

<template>
  <div id="layout">
    <nav class="flex items-center rounded justify-center bg-white/3 backdrop-blur px-3 py-2 border border-white/5 shadow-lg shadow-black/20 gap-2">
      <NuxtLink to="/" class="nav-link border border-white/0 font-semibold px-3 py-1 rounded hover:bg-white/5 hover:backdrop-blur transition-colors duration-200">Inicio</NuxtLink>
      <NuxtLink v-if="loggedIn" :to="`/u/${user?.twitchLogin}`" class="nav-link border border-white/0 font-semibold px-3 py-1 rounded hover:bg-white/5 hover:backdrop-blur transition-colors duration-200 flex items-center gap-2">
        <img v-if="user?.twitchProfileImage" :src="user?.twitchProfileImage" alt="Avatar" class="w-6 h-6 rounded-full border border-white/10 shadow-lg shadow-black/20">
        <span>{{ user?.twitchDisplay }}</span>
      </NuxtLink>
      <button v-if="loggedIn" class="nav-link border border-white/0 font-semibold px-3 py-1 rounded hover:bg-white/5 hover:backdrop-blur transition-colors duration-200 flex items-center gap-2" @click="clear">
        <Icon name="lucide:log-out" class="w-6 h-6" />
        <span>Salir</span>
      </button>
      <NuxtLink v-else to="/auth/twitch" class="nav-link border border-white/0 font-semibold px-3 py-1 rounded hover:bg-violet-700 hover:backdrop-blur transition-colors duration-200 flex items-center gap-2 bg-violet-800" external>
        <Icon name="simple-icons:twitch" class="w-5 h-5" />
        <span>Unirse</span>
      </NuxtLink>
    </nav>
    <div class="lg:container mx-auto py-5 px-2">
      <slot />
      <footer class="text-center text-sm text-slate-300 pt-5">
        <span>
          <NuxtLink href="https://github.com/ahmedrangel/comunidad-jimtracker" target="_blank" external class="text-blue-300 font-semibold hover:underline">Creado</NuxtLink>
          con ❤️ por
          <NuxtLink href="https://github.com/ahmedrangel" target="_blank" external class="text-emerald-300 font-semibold hover:underline">Ahmed</NuxtLink>
          y
          <NuxtLink href="https://github.com/yizack" target="_blank" external class="text-yellow-300 font-semibold hover:underline">Yizack</NuxtLink>
        </span>
      </footer>
    </div>
  </div>
</template>
