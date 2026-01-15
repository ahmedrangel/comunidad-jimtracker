<script setup lang="ts">
const { name } = useRoute("u-name").params;
const { error } = useRoute("u-name").query;

const { data: userInfo } = await useFetch(`/api/users/${name}`, {
  key: `user:${name}`,
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key],
  deep: true
});

const { user, loggedIn } = useUserSession();

const isOwner = computed(() => loggedIn.value && user.value?.twitchLogin.toLowerCase() === name.toLowerCase());

if (!userInfo.value) {
  throw createError({ status: ErrorCode.NOT_FOUND, message: "Usuario no encontrado" });
}

const { data: riotAccounts } = await useFetch(`/api/users/${name}/riot-accounts`, {
  key: `user:${name}:riot-accounts`,
  default: () => [] as JimRiotAccount[],
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key],
  deep: true
});

const toast = useToast();
const isUpdating = ref(false);
const verifying = ref(false);
const maxAccounts = 4;

const addRiotAccount = async () => {
  verifying.value = true;
  const verifyFollow = await $fetch<{ isFollowing: boolean }>(`/api/users/${name}/verify-follow`).catch((e) => {
    toast.add({
      title: "Error",
      description: e.message || "Ha ocurrido un error.",
      color: "error"
    });
    return null;
  }).finally(() => verifying.value = false);

  if (!verifyFollow) return;

  if (!verifyFollow.isFollowing) {
    toast.add({
      title: "Error",
      description: "Debes seguir a JimRsng en Twitch para agregar una cuenta.",
      color: "error"
    });
    return;
  }

  navigateTo("/auth/riot", { external: true });
};

const removeAccount = async (puuid: string) => {
  if (!loggedIn.value || !user.value) return;
  if (!confirm("¿Estás seguro de que deseas eliminar esta cuenta?")) return;

  $fetch(`/api/users/${name}/riot-accounts/${puuid}`, {
    method: "DELETE"
  }).catch(() => {});

  riotAccounts.value = riotAccounts.value.filter(acc => acc.puuid !== puuid);
};

const updateProfile = async () => {
  isUpdating.value = true;
  $fetch(`/api/users/${name}/update`, {
    method: "POST",
    body: {
      riotAccounts: riotAccounts.value.map(account => ({
        puuid: account.puuid,
        region: account.region
      }))
    }
  }).then((response) => {
    userInfo.value = response.user;
    useCachedData(`user:${name}`, () => userInfo.value);
    riotAccounts.value = response.riotAccounts;
    toast.add({
      title: "Éxito",
      description: "Perfil actualizado correctamente.",
      color: "success"
    });
  }).catch(() => {}).finally(() => {
    isUpdating.value = false;
  });
};

const updateCooldown = import.meta.dev ? 10 : 300; // segundos (5 minutos)
const now = ref(Date.now());
let intervalId: number | undefined;

const lastUpdate = computed(() => userInfo.value?.updatedAt ? new Date(userInfo.value.updatedAt).getTime() : 0);
const secondsSinceUpdate = computed(() => Math.floor((now.value - lastUpdate.value) / 1000));
const canUpdate = computed(() => secondsSinceUpdate.value >= updateCooldown);
const secondsToAvailable = computed(() => Math.max(0, updateCooldown - secondsSinceUpdate.value));

watch(riotAccounts, () => {
  useCachedData(`user:${name}:riot-accounts`, () => riotAccounts.value);
  useCachedData("riot-accounts", () => undefined); // invalidate leaderboard table cache
}, { deep: true });

onMounted(() => {
  intervalId = window.setInterval(() => {
    now.value = Date.now();
  }, 500);

  if (canUpdate.value && !isUpdating.value) {
    updateProfile();
  }

  if (error) {
    toast.add({
      title: "Error",
      description: getErrorMessage(String(error)),
      color: "error"
    });
    // Remove error query from URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});
onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<template>
  <main v-if="userInfo" class="relative">
    <div class="flex items-center md:justify-start justify-center gap-2 mb-2">
      <span class="font-bold text-3xl">{{ userInfo.twitchDisplay }}</span>
      <UPopover v-if="userInfo.country" :ui="{ arrow: 'fill-current', content: 'py-2 px-3' }" mode="hover" arrow>
        <UButton variant="link" class="p-0">
          <Twemoji :emoji="userInfo.country" png size="2rem" :alt="getCountryName(userInfo.country)" />
        </UButton>
        <template #content>
          {{ getCountryName(userInfo.country) }}
        </template>
      </UPopover>
    </div>
    <div class="grid lg:grid-cols-5 lg:grid-rows-2 md:grid-cols-3 md:grid-rows-1 gap-4">
      <div class="row-span-2 flex flex-col gap-1">
        <img v-if="userInfo.twitchProfileImage" :src="userInfo.twitchProfileImage" alt="Avatar" class="w-full rounded-sm mx-auto max-w-75">
        <div v-if="userInfo.badges" class="flex items-center gap-2 text-lg">
          <!-- TODO: Badges -->
        </div>
        <div v-if="userInfo.bio" class="p-3 pt-9 rounded-sm border border-accented whitespace-pre-wrap relative border-s-elevated border-s-3">
          <div class="bg-elevated absolute top-0 start-0 w-[70%] xl:w-[50%] px-2 py-1 rounded-b-3xl rounded-bl-none flex items-center gap-2">
            <Icon name="lucide:message-square-more" />
            <span class="font-semibold uppercase text-xs">Mensaje</span>
          </div>
          {{ userInfo.bio }}
        </div>
        <UModal v-if="isOwner" title="Editar Perfil">
          <UButton label="Editar perfil" icon="lucide:pencil" variant="subtle" class="py-4" />
          <template #body="{ close }">
            <EditProfile v-model="userInfo" @edit="close" />
          </template>
        </UModal>
        <UButton class="w-full py-4 flex items-center gap-2" variant="subtle" color="info" :loading="isUpdating" :disabled="!canUpdate || isUpdating" @click="updateProfile">
          <Icon v-if="!isUpdating" name="lucide:refresh-cw" class="w-5 h-5" />
          <span v-if="canUpdate">{{ isUpdating ? "Actualizando..." : "Actualizar" }}</span>
          <span v-else>Disponible en <ClientOnly>{{ secondsToAvailable }}s</ClientOnly></span>
        </UButton>
      </div>
      <div class="flex items-center gap-2 md:absolute top-2 end-0 justify-end">
        <Icon name="simple-icons:riotgames" class="text-red-500" />
        <span>{{ riotAccounts.length }} / {{ maxAccounts }}</span>
      </div>
      <div class="lg:col-span-4 md:col-span-2 grid lg:grid-cols-2 gap-4">
        <template v-if="riotAccounts.length">
          <div v-for="account in riotAccounts" :key="account.puuid" class="relative rounded-md border-2 border-accented p-4 flex flex-col justify-center gap-2 bg-black/20">
            <div class="flex items-center justify-center gap-2 text-xl flex-wrap">
              <img v-if="account.profileIcon !== null" :src="getIconURL(account.profileIcon)" class="w-10 h-10 rounded-full border border-default shadow-lg shadow-black/20" :alt="`Icono de perfil de ${account.gameName}`">
              <span class="font-semibold">{{ account.gameName }}</span>
              <span class="text-muted">#{{ account.tagLine }}</span>
              <RegionBadge :region="account.region" size="md" />
            </div>
            <div v-if="isOwner" class="absolute top-2 right-2 text-xs text-white rounded">
              <div class="flex items-center gap-1">
                <UDropdownMenu :items="[
                  {
                    label: 'Eliminar',
                    color: 'error',
                    icon: 'lucide:trash',
                    onSelect: () => removeAccount(account.puuid),
                  },
                ]"
                >
                  <UButton icon="lucide:ellipsis-vertical" variant="ghost" color="neutral" />
                </UDropdownMenu>
              </div>
            </div>
            <div class="flex flex-col items-center gap-2">
              <div class="flex items-center gap-1">
                <UPopover :ui="{ arrow: 'fill-current', content: 'py-2 px-3' }" mode="hover" arrow>
                  <UButton variant="link" class="p-0">
                    <img
                      :src="`/images/lol/${account.tier?.toLowerCase() || 'unranked'}.png`"
                      class="w-12 h-12 md:w-12 md:h-12 max-w-fit"
                      :alt="account.tier || 'UNRANKED'"
                    >
                  </UButton>
                  <template #content>
                    {{ account.tier || 'UNRANKED' }}
                  </template>
                </UPopover>
                <span v-if="account.division" class="font-semibold text-xl"><span v-if="account.tier && !['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(account.tier)">{{ account.division }} · </span>{{ account.lp }} LP</span>
              </div>
              <div v-if="account.wins || account.losses" class="text-sm text-neutral-400 font-semibold"><span class="text-blue-400">{{ account.wins }}</span>V · <span class="text-rose-400">{{ account.losses }}</span>D (<span class="text-white">{{ (account.wins || 0) + (account.losses || 0) }}</span>)</div>
              <span v-if="account.wins || account.losses" class="text-base font-semibold text-white">
                {{
                  account.wins && account.losses
                    ? ((account.wins / (account.wins + account.losses)) * 100).toFixed(2) + '% WR'
                    : 'N/A'
                }}
              </span>
            </div>
          </div>
        </template>
        <UButton v-if="isOwner && riotAccounts.length < maxAccounts" variant="soft" class="light:bg-default dark:bg-muted border-2 border-dashed border-accented p-6 flex flex-col items-center justify-center text-center h-full hover:border-primary transition-colors group" @click="addRiotAccount">
          <div v-if="!verifying" class="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-[1.1] transition-transform">
            <Icon name="lucide:plus" class="w-8 h-8" />
          </div>
          <div v-else class="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 animate-spin">
            <Icon name="lucide:loader-circle" class="w-8 h-8" />
          </div>
          <span class="font-medium">Agregar Riot Account</span>
        </UButton>
      </div>
    </div>
  </main>
</template>
