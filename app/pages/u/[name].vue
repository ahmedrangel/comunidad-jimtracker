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
  $fetch<{ isFollowing: boolean }>(`/api/users/${name}/verify-follow`).catch((e) => {
    toast.add({
      avatar: toastImage,
      orientation: "horizontal",
      description: e.message || "Ha ocurrido un error.",
      color: "error"
    });
    return null;
  }).then(async (response) => {
    if (!response?.isFollowing) {
      toast.add({
        avatar: toastImage,
        orientation: "horizontal",
        description: "Debes seguir a JimRsng en Twitch para agregar una cuenta.",
        color: "error"
      });
      return;
    }

    await navigateTo("/auth/riot", { external: true });
  }).catch(() => {
    verifying.value = false;
  });
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
    method: "POST"
  }).then((response) => {
    userInfo.value = response.user;
    useCachedData(`user:${name}`, () => userInfo.value);
    riotAccounts.value = response.riotAccounts;
    const riotAccountLogs = useCachedData<JimRiotAccountLog[]>(`user:${name}:riot-accounts:logs`);
    riotAccountLogs.push(...response.newRiotAccountLogs);
    toast.add({
      avatar: toastImage,
      orientation: "horizontal",
      description: "La información de tu perfil ha sido actualizada.",
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
      avatar: toastImage,
      orientation: "horizontal",
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
    <div class="grid lg:grid-cols-5 lg:grid-rows-[auto_1fr] md:grid-cols-3 gap-4">
      <div class="row-span-2 flex flex-col gap-1 md:sticky md:top-21 md:self-start">
        <div class="flex items-center md:justify-start justify-center gap-2 mb-1">
          <span class="font-bold text-3xl">{{ userInfo.twitchDisplay }}</span>
          <UPopover v-if="userInfo.country" mode="hover" :content="{ side: 'top' }" arrow>
            <UButton variant="link" class="p-0">
              <Twemoji :emoji="userInfo.country" size="2rem" :alt="getCountryName(userInfo.country)" />
            </UButton>
            <template #content>
              {{ getCountryName(userInfo.country) }}
            </template>
          </UPopover>
        </div>
        <img v-if="userInfo.twitchProfileImage" :src="userInfo.twitchProfileImage" alt="Avatar" class="w-full rounded-sm mx-auto max-w-75">
        <div v-if="userInfo.badges" class="flex items-center gap-2 text-lg">
          <!-- TODO: Badges -->
        </div>
        <div v-if="userInfo.bio" class="p-3 pt-9 rounded-sm border border-accented whitespace-pre-wrap relative border-s-elevated border-s-3">
          <div class="bg-elevated absolute top-0 start-0 w-[70%] xl:w-[50%] px-2 py-1 rounded-b-3xl rounded-bl-none flex items-center gap-2">
            <Icon name="lucide:message-square-more" />
            <span class="font-semibold uppercase text-xs">Mensaje</span>
          </div>
          <span>{{ userInfo.bio }}</span>
        </div>
        <UserEditProfile v-if="isOwner" v-model="userInfo" />
        <UButton class="w-full py-4 flex items-center gap-2" variant="subtle" color="info" :loading="isUpdating" :disabled="!canUpdate || isUpdating" @click="updateProfile">
          <Icon v-if="!isUpdating" name="lucide:refresh-cw" class="w-5 h-5" />
          <span v-if="canUpdate">{{ isUpdating ? "Actualizando..." : "Actualizar" }}</span>
          <span v-else>Disponible en <ClientOnly>{{ secondsToAvailable }}s</ClientOnly></span>
        </UButton>
      </div>
      <div class="lg:col-span-4 md:col-span-2 space-y-4 md:mt-11">
        <div class="flex items-center gap-2 md:absolute top-2 end-0 justify-end">
          <Icon name="simple-icons:riotgames" class="text-red-500" />
          <span>{{ riotAccounts.length }} / {{ maxAccounts }}</span>
        </div>
        <div class="grid lg:grid-cols-2 gap-4">
          <template v-if="riotAccounts.length">
            <div v-for="account in riotAccounts" :key="account.puuid" class="relative rounded-md border-2 border-accented p-4 flex flex-col justify-center gap-2 dark:bg-black/20">
              <div class="flex items-center justify-center gap-2 text-xl flex-wrap">
                <img
                  v-if="account.profileIcon !== null"
                  :src="getIconURL(account.profileIcon)"
                  class="w-10 h-10 rounded-full border border-default shadow-lg shadow-black/20"
                  :alt="`Icono de perfil de ${account.gameName}`"
                >
                <NuxtLink
                  :to="`https://op.gg/es/lol/summoners/${getRegionLabel(account.region)}/${account.gameName}-${account.tagLine}`"
                  target="_blank"
                  class="font-semibold hover:underline"
                >
                  <span>{{ account.gameName }} <span class="font-normal text-muted">#{{ account.tagLine }}</span></span>
                </NuxtLink>
                <RegionBadge :region="account.region" size="md" />
              </div>
              <div v-if="isOwner" class="absolute top-2 right-2 text-xs rounded">
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
                  <UPopover mode="hover" :content="{ side: 'top' }" arrow>
                    <UButton variant="link" class="p-0">
                      <img
                        :src="getTierImage(account.tier)"
                        class="w-12 h-12 max-w-fit"
                        :alt="getTierLabel(account.tier)"
                      >
                    </UButton>
                    <template #content>
                      {{ getTierLabel(account.tier) }}
                    </template>
                  </UPopover>
                  <span v-if="account.division" class="font-semibold text-xl">
                    <template v-if="!isApexTier(account.tier)">
                      <span>{{ account.division }}</span>
                      <span> · </span>
                    </template>
                    <span>{{ account.lp }} LP</span>
                  </span>
                </div>
                <div v-if="account.wins || account.losses" class="text-sm text-muted font-semibold">
                  <span class="dark:text-blue-400 light:text-blue-500">{{ account.wins }}</span>V ·
                  <span class="dark:text-rose-400 light:text-rose-500">{{ account.losses }}</span>D
                  <span class="text-default">({{ (account.wins || 0) + (account.losses || 0) }}</span>)
                </div>
                <span v-if="account.wins || account.losses" class="text-base font-semibold">
                  {{ (((account.wins || 0) / ((account.wins || 0) + (account.losses || 0))) * 100).toFixed(2) + '% WR' }}
                </span>
              </div>
              <div class="mt-2">
                <RoleSelector :data="{ ...account, user: userInfo }" />
              </div>
            </div>
          </template>
          <UButton v-if="isOwner && riotAccounts.length < maxAccounts" variant="soft" class="bg-muted border-2 border-dashed border-accented p-6 flex flex-col items-center justify-center text-center h-full hover:border-primary transition-colors group" @click="addRiotAccount">
            <div v-if="!verifying" class="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-[1.1] transition-transform">
              <Icon name="lucide:plus" class="w-8 h-8" />
            </div>
            <div v-else class="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 animate-spin">
              <Icon name="lucide:loader-circle" class="w-8 h-8" />
            </div>
            <span class="font-medium">Agregar Riot Account</span>
          </UButton>
        </div>
        <UserRiotAccountLogs :accounts="riotAccounts" :name="name" />
      </div>
    </div>
  </main>
</template>
