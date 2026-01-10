<script setup lang="ts">
const { params } = useRoute("u-name");
const { name } = params;

const { data: data } = await useFetch(`/api/user/${name}`);
const { user, loggedIn } = useUserSession();

if (!data.value) {
  throw createError({ status: 404, message: "Usuario no encontrado", fatal: true });
}

const modalOpen = ref(false);
const form = reactive({
  gameName: "",
  tagLine: "",
  region: ""
});

const addAccount = async () => {
  if (!loggedIn.value || !user.value) return;
  const response = await $fetch(`/api/user/${user.value.twitchId}/riotAccount`, {
    method: "POST",
    body: {
      gameName: form.gameName,
      tagLine: form.tagLine,
      region: form.region
    }
  }).catch(() => null);
  if (response) modalOpen.value = false;
};

console.info(data.value);
</script>

<template>
  <main v-if="data?.user">
    <div class="flex items-center gap-2 mb-2">
      <span class="font-bold text-3xl">{{ data.user.twitchDisplay }}</span>
      <Twemoji v-if="data.user.country" :emoji="data.user.country" png size="2em" />
    </div>
    <div class="grid sm:grid-flow-col lg:grid-rows-24 md:grid-rows-4 sm:grid-rows-4 gap-4">
      <div class="lg:row-span-24 md:row-span-4 sm:row-span-4 flex flex-col gap-1">
        <img v-if="data.user.twitchProfileImage" :src="data.user.twitchProfileImage" alt="Avatar" class="w-full rounded-sm mx-auto">
        <div v-if="data.user.badges" class="flex items-center gap-2 text-lg">
          <!-- TODO: Badges -->
        </div>
        <div v-if="data.user.bio" class="p-3 bg-neutral-500/10 rounded-sm border border-white/10">
          {{ data.user.bio }}
        </div>
      </div>
      <div class="lg:col-span-23 md:col-span-3 sm:col-span-24 grid lg:grid-cols-2 gap-4">
        <template v-if="data.riotAccounts?.length">
          <div v-for="account in data.riotAccounts" :key="account.puuid" class="p-2 relative overflow-hidden rounded-sm border border-accented px-4 flex flex-col justify-center gap-2">
            <div class="flex items-center justify-center gap-2">
              <img :src="`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${account.profileIcon}.jpg`" class="w-10 h-10 rounded-full border border-white/10 shadow-lg shadow-black/20" :alt="`Icono de perfil de ${account.gameName}`">
              <span class="font-semibold text-lg">{{ account.gameName }}</span>
              <span class="text-neutral-400">#{{ account.tagLine }}</span>
            </div>
            <div class="absolute top-2 right-2 bg-black/50 text-xs text-white rounded px-2 py-1">
              {{ regionMap.find(r => r.value === account.region)?.label }}
            </div>
            <div class="flex flex-col items-center gap-2">
              <div class="flex items-center gap-1">
                <img :src="`/images/lol/${account.tier?.toLowerCase() || 'unranked'}.png`" class="w-12 h-12 md:w-12 md:h-12 max-w-fit" :title="account.tier || 'Unranked'">
                <span v-if="account.division" class="font-semibold text-xl">{{ account.division }} · {{ account.lp }} LP</span>
              </div>
              <div v-if="account.wins || account.losses" class="text-sm text-neutral-400">{{ account.wins }}W · {{ account.losses }}L</div>
              <span v-if="account.wins || account.losses" class="text-sm text-neutral-400">
                {{
                  account.wins && account.losses
                    ? ((account.wins / (account.wins + account.losses)) * 100).toFixed(2) + '% WR'
                    : '0% WR'
                }}
              </span>
            </div>
          </div>
        </template>
        <div v-if="loggedIn" class="relative overflow-hidden rounded-sm border border-dashed border-accented opacity-75 px-4 flex items-center justify-center h-48">
          <UModal v-model:open="modalOpen" title="Agregar Riot Account">
            <template #body>
              <div class="flex flex-col gap-4">
                <UFieldGroup class="w-full">
                  <UInput v-model="form.gameName" label="gameName" placeholder="Nombre" :ui="{ root: 'w-full' }" />
                  <UBadge color="neutral" variant="outline" label="#" />
                  <UInput v-model="form.tagLine" label="tagLine" placeholder="Tag" :ui="{ root: 'w-full' }" />
                </UFieldGroup>
                <USelect
                  v-model="form.region"
                  label="region"
                  class="w-full"
                  placeholder="Región"
                  trailing-icon="lucide:chevron-down"
                  :items="regionMap"
                />
                <div class="flex justify-end gap-2">
                  <UButton label="Agregar" @click="addAccount" />
                  <UButton label="Cancelar" color="neutral" @click="modalOpen = false" />
                </div>
              </div>
            </template>
            <UButton variant="subtle" @click="modalOpen = true">
              +
            </UButton>
          </UModal>
        </div>
      </div>
    </div>
  </main>
</template>
