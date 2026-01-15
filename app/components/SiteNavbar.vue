<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const { loggedIn, user, clear, openInPopup } = useUserSession();

watch(loggedIn, (value) => {
  if (!value || !user.value?.twitchLogin) return;
  navigateTo(`/u/${user.value.twitchLogin}`);
});

const pages = computed<NavigationMenuItem[]>(() => {
  const initial: NavigationMenuItem[] = [
    {
      label: "Inicio",
      to: "/"
    }
  ];

  if (loggedIn.value && user.value) {
    initial.push({
      label: user.value.twitchDisplay,
      to: `/u/${user.value.twitchLogin}`,
      avatar: user.value.twitchProfileImage ? {
        src: user.value.twitchProfileImage
      } : undefined
    });

    initial.push({
      label: "Salir",
      onClick: () => clear(),
      icon: "lucide:log-out"
    });
  }
  else {
    initial.push(
      {
        label: "Unirse",
        icon: "simple-icons:twitch",
        ui: {
          linkLeadingIcon: "text-white",
          link: "text-white before:bg-violet-800 hover:before:bg-violet-700"
        },
        onSelect: () => openInPopup("/auth/twitch")
      }
    );
  }

  return initial;
});
</script>

<template>
  <UHeader
    title=""
    class="top-0 py-1 z-50 border-0 backdrop-blur-sm border-b border-default bg-elevated/50"
    :ui="{ center: 'flex' }"
    :toggle="false"
  >
    <UNavigationMenu
      :items="pages"
      color="neutral"
      :ui="{
        list: 'gap-2',
        link: 'text-md hover:before:bg-accented/50 data-active:before:bg-accented/75',
      }"
    />
  </UHeader>
</template>
