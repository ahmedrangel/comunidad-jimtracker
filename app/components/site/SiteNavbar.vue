<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from "@nuxt/ui";

const { loggedIn, user, clear, openInPopup } = useUserSession();

watch(loggedIn, (value) => {
  if (!value || !user.value?.twitchLogin) return;
  navigateTo(`/u/${user.value.twitchLogin}`);
});

const pages: NavigationMenuItem[] = [
  {
    label: "Tabla",
    to: "/"
  },
  {
    label: "JimTracker",
    to: "https://" + SITE.rootDomain
  }
];

const userMenu: DropdownMenuItem[][] = [
  [
    {
      label: "Perfil",
      icon: "lucide:user",
      to: `/u/${user.value?.twitchLogin}`
    }
  ],
  [
    {
      label: "Salir",
      icon: "lucide:log-out",
      color: "error",
      onSelect: clear
    }
  ]
];
</script>

<template>
  <UHeader
    class="top-0 py-1 z-50 border-0 backdrop-blur-sm border-b border-default bg-elevated/50"
    toggle-side="left"
  >
    <UNavigationMenu
      :items="pages"
      color="neutral"
      :ui="{
        list: 'gap-2',
        link: 'text-md hover:before:bg-accented/50 data-active:before:bg-accented/75',
      }"
    />

    <template #title>
      <div class="flex items-center gap-2">
        <img :src="SITE.logo" :alt="SITE.name" class="h-8 w-auto">
        <h1>Comunidad</h1>
      </div>
    </template>

    <template #right>
      <UDropdownMenu v-if="user" :items="userMenu" :content="{ align: 'end', side: 'bottom', sideOffset: 8 }">
        <UButton
          :label="user.twitchDisplay"
          trailing-icon="lucide:chevron-down"
          variant="soft"
          color="neutral"
          :ui="{
            base: 'text-md hover:bg-accented/50 data-active:bg-accented/75',
          }"
        >
          <template #leading>
            <UAvatar v-if="user.twitchProfileImage" :src="user.twitchProfileImage" :alt="user.twitchDisplay" size="2xs" />
            <UAvatar v-else :alt="user.twitchDisplay" size="2xs" class="bg-accented" />
          </template>
        </UButton>
      </UDropdownMenu>
      <UButton
        v-else
        label="Unirse"
        icon="simple-icons:twitch"
        variant="soft"
        color="neutral"
        :ui="{
          leadingIcon: 'text-white',
          base: 'text-md bg-violet-800 hover:bg-violet-700',
        }"
        @click="openInPopup('/auth/twitch')"
      />
    </template>

    <template #body>
      <UNavigationMenu :items="pages" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>
