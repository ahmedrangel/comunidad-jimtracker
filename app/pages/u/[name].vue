<script setup lang="ts">
const { name } = useRoute("u-name").params;

const { data: userInfo } = await useFetch(`/api/users/${name}`, {
  key: `user:${name}`,
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key]
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

const isModalOpen = ref(false);
const isLoading = ref(false);
const isUpdating = ref(false);

const form = useFormState({
  gameName: "",
  tagLine: "",
  region: "",
  iconVerificationId: getRandomIconId()
});

const addAccount = async () => {
  if (!loggedIn.value || !user.value) return;
  isLoading.value = true;
  $fetch(`/api/users/${name}/riot-accounts`, {
    method: "POST",
    body: {
      gameName: form.value.gameName,
      tagLine: form.value.tagLine,
      region: form.value.region,
      iconVerificationId: form.value.iconVerificationId
    }
  }).then((response) => {
    riotAccounts.value.push(response);
    isModalOpen.value = false;
    form.reset();
    toast.add({
      title: "Éxito",
      description: "Cuenta de Riot agregada correctamente.",
      color: "success"
    });
  }).catch((err) => {
    toast.add({
      title: "Error",
      description: err.data?.message || "Ocurrió un error al agregar la cuenta de Riot.",
      color: "error"
    });
  }).finally(() => {
    isLoading.value = false;
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

const updateCooldown = import.meta.dev ? 0 : 120; // segundos
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
});
onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<template>
  <main v-if="userInfo">
    <div class="flex items-center gap-2 mb-2">
      <span class="font-bold text-3xl">{{ userInfo.twitchDisplay }}</span>
      <Twemoji v-if="userInfo.country" :emoji="userInfo.country" png size="2em" />
    </div>
    <div class="grid lg:grid-cols-5 lg:grid-rows-2 md:grid-cols-3 md:grid-rows-1 gap-4">
      <div class="row-span-2 flex flex-col gap-1">
        <img v-if="userInfo.twitchProfileImage" :src="userInfo.twitchProfileImage" alt="Avatar" class="w-full rounded-sm mx-auto max-w-75">
        <div v-if="userInfo.badges" class="flex items-center gap-2 text-lg">
          <!-- TODO: Badges -->
        </div>
        <div v-if="userInfo.bio" class="p-3 bg-neutral-500/10 rounded-sm border border-white/10">
          {{ userInfo.bio }}
        </div>
        <UButton class="w-full py-4 flex items-center gap-2" variant="subtle" color="info" :loading="isUpdating" :disabled="!canUpdate || isUpdating" @click="updateProfile">
          <Icon v-if="!isUpdating" name="lucide:refresh-cw" class="w-5 h-5" />
          <span v-if="canUpdate">{{ isUpdating ? "Actualizando..." : "Actualizar" }}</span>
          <span v-else>Disponible en <ClientOnly>{{ secondsToAvailable }}s</ClientOnly></span>
        </UButton>
      </div>
      <div class="lg:col-span-4 md:col-span-2 grid lg:grid-cols-2 gap-4">
        <template v-if="riotAccounts.length">
          <div v-for="account in riotAccounts" :key="account.puuid" class="relative overflow-hidden rounded-sm border border-accented p-4 flex flex-col justify-center gap-2 bg-black/20">
            <div class="flex items-center justify-center gap-2 text-xl">
              <img v-if="account.profileIcon !== null" :src="getIconURL(account.profileIcon)" class="w-10 h-10 rounded-full border border-white/10 shadow-lg shadow-black/20" :alt="`Icono de perfil de ${account.gameName}`">
              <span class="font-semibold">{{ account.gameName }}</span>
              <span class="text-neutral-400">#{{ account.tagLine }}</span>
              <span class="text-xs bg-black/50 border border-white/10 px-2 py-1">{{ getRegionLabel(account.region) }}</span>
            </div>
            <div v-if="isOwner" class="absolute top-2 right-2 text-xs text-white rounded">
              <div class="flex items-center gap-1">
                <UDropdownMenu :items="[
                  {
                    label: 'Eliminar',
                    onSelect() {
                      removeAccount(account.puuid);
                    },
                  },
                ]"
                >
                  <UButton icon="i-lucide-ellipsis-vertical" variant="ghost" color="neutral" />
                </UDropdownMenu>
              </div>
            </div>
            <div class="flex flex-col items-center gap-2">
              <div class="flex items-center gap-1">
                <img :src="`/images/lol/${account.tier?.toLowerCase() || 'unranked'}.png`" class="w-12 h-12 md:w-12 md:h-12 max-w-fit" :title="account.tier || 'Unranked'">
                <span v-if="account.division" class="font-semibold text-xl">{{ account.division }} · {{ account.lp }} LP</span>
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
        <div v-if="isOwner" class="relative overflow-hidden rounded-sm border border-dashed border-accented flex items-center justify-center h-full">
          <UModal v-model:open="isModalOpen" title="Agregar Riot Account">
            <template #body>
              <UForm @submit.prevent="addAccount">
                <div class="flex flex-col gap-4">
                  <UFieldGroup class="w-full">
                    <UInput v-model.trim="form.gameName" label="gameName" placeholder="Nombre" :ui="{ root: 'w-full' }" required />
                    <UBadge color="neutral" variant="outline" label="#" />
                    <UInput v-model.trim="form.tagLine" label="tagLine" placeholder="Tag" :ui="{ root: 'w-full' }" required />
                  </UFieldGroup>
                  <USelect
                    v-model="form.region"
                    label="region"
                    class="w-full"
                    placeholder="Región"
                    :items="regionMap"
                    required
                  />
                  <span class="text-sm text-white">
                    Para verificar la propiedad de la cuenta, por favor coloca el siguiente icono temporalmente y luego haz clic en "Agregar".
                  </span>
                  <img :src="getIconURL(form.iconVerificationId)" alt="Icono de Verificación" class="w-20 h-20 rounded-full border border-white/10 shadow-lg shadow-black/20 mx-auto">
                  <div class="flex justify-end gap-2">
                    <UButton type="submit" label="Agregar" variant="subtle" :loading="isLoading" />
                    <UButton label="Cancelar" color="neutral" variant="subtle" @click="isModalOpen = false" />
                  </div>
                </div>
              </UForm>
            </template>
            <UButton variant="soft" class="w-full h-full flex flex-col items-center justify-center opacity-75 p-4" @click="isModalOpen = true">
              <span>Agregar Riot Account</span>
              <Icon name="lucide:plus" class="w-8 h-8" />
            </UButton>
          </UModal>
        </div>
      </div>
    </div>
  </main>
</template>
