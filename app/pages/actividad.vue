<script setup lang="ts">
const limit = 20;
const page = ref(1);

const { data: logs } = await useFetch("/api/riot-accounts/logs", {
  key: "riot-accounts:logs",
  query: { page: 1, limit },
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key],
  default: () => [] as JimRiotAccountLog[],
  deep: true
});

const { data: riotAccounts } = await useFetch("/api/riot-accounts", {
  key: "riot-accounts",
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key],
  default: () => [] as JimTableData[]
});

const hasMore = ref(true);
const isLoading = ref(false);

const riotAccountMap = computed(() => {
  const map = new Map<string, JimTableData>();
  riotAccounts.value.forEach((item) => {
    map.set(item.puuid, item);
  });
  return map;
});

const enrichedLogs = computed(() => {
  return logs.value.map(log => ({
    ...log,
    account: riotAccountMap.value.get(log.puuid)
  }));
});

const isRankUp = (logData: JimRiotAccountLogData) => {
  const oldValue = eloToValue(logData.old.tier, logData.old.division, logData.old.lp);
  const newValue = eloToValue(logData.new.tier, logData.new.division, logData.new.lp);
  return newValue > oldValue;
};

const loadMore = async () => {
  if (isLoading.value || !hasMore.value) return;

  isLoading.value = true;
  page.value++;

  $fetch("/api/riot-accounts/logs", {
    query: { page: page.value, limit }
  }).then((newLogs) => {
    if (newLogs.length < limit) {
      hasMore.value = false;
    }

    if (newLogs.length > 0) {
      logs.value.push(...newLogs);
    }
  }).catch(() => {}).finally(() => {
    isLoading.value = false;
  });
};

if (logs.value.length < limit) {
  hasMore.value = false;
}

onUnmounted(() => {
  useCachedData("riot-accounts:logs", () => logs.value.slice(0, limit));
});
</script>

<template>
  <main class="flex justify-center">
    <div class="max-w-3xl w-full space-y-4">
      <div v-if="logs.length === 0" class="text-center py-12 text-muted">
        <p>No hay actividad reciente</p>
      </div>

      <div v-else class="flex flex-col gap-3">
        <div
          v-for="log of enrichedLogs"
          :key="log.id"
          class="p-4 rounded-lg border transition-colors space-y-2"
          :class="isRankUp(log.data)
            ? 'dark:border-blue-400/50 light:border-blue-500/50 dark:bg-blue-400/5 light:bg-blue-500/5'
            : 'dark:border-rose-400/50 light:border-rose-500/50 dark:bg-rose-400/5 light:bg-rose-500/5'
          "
        >
          <div class="flex justify-between items-center gap-2">
            <div class="flex items-center gap-2">
              <Icon
                :name="isRankUp(log.data) ? 'lucide:trending-up' : 'lucide:trending-down'"
                size="1.25rem"
                :class="isRankUp(log.data) ? 'dark:text-blue-400 light:text-blue-500' : 'dark:text-rose-400 light:text-rose-500'"
              />
              <NuxtLink
                v-if="log.account"
                :to="`/u/${log.account.user.twitchLogin}`"
                class="flex items-center gap-2 hover:underline group"
              >
                <img
                  v-if="log.account.user.twitchProfileImage"
                  :src="log.account.user.twitchProfileImage.replace('300x300', '50x50')"
                  class="w-6 h-6 rounded-sm border-2 border-accented"
                  :alt="log.account.user.twitchLogin"
                >
                <span class="font-semibold group-hover:text-highlighted transition-colors">
                  {{ log.account.user.twitchDisplay }}
                </span>
                <UPopover v-if="log.account.user.country" mode="hover" :content="{ side: 'top' }" arrow>
                  <UButton variant="link" class="p-0">
                    <Twemoji :emoji="log.account.user.country" size="1.4rem" :alt="getCountryName(log.account.user.country)" />
                  </UButton>
                  <template #content>
                    {{ getCountryName(log.account.user.country) }}
                  </template>
                </UPopover>
              </NuxtLink>
            </div>
            <UPopover mode="hover" :content="{ side: 'top' }" arrow>
              <UButton variant="link" color="neutral" class="text-sm text-muted p-0">
                {{ useTimeAgoIntl(log.createdAt, { locale: "es", relativeTimeFormatOptions: { style: "long" } }) }}
              </UButton>
              <template #content>
                <NuxtTime
                  :datetime="log.createdAt"
                  year="numeric"
                  month="short"
                  day="numeric"
                  hour="2-digit"
                  minute="2-digit"
                />
              </template>
            </UPopover>
          </div>

          <div class="flex flex-col items-center justify-between bg-inverted/5 p-3 rounded-md text-sm">
            <div class="flex items-center gap-2 flex-wrap">
              <span v-if="log.account" class="flex items-center gap-2">
                <img
                  v-if="log.account.profileIcon"
                  :src="getIconURL(log.account.profileIcon)"
                  class="w-8 h-8 rounded-full border border-default shadow-lg shadow-black/20"
                  :alt="log.account.gameName"
                >
                <span>
                  <span class="font-semibold">{{ log.account.gameName }}</span>
                  <span class="text-muted"> #{{ log.account.tagLine }}</span>
                </span>
                <RegionBadge :region="log.account.region" size="md" />
              </span>
            </div>

            <div class="flex items-center gap-2">
              <div class="flex items-center gap-2">
                <UPopover mode="hover" :content="{ side: 'top' }" arrow>
                  <UButton variant="link" class="p-0">
                    <img
                      :src="getTierImage(log.data.old.tier)"
                      class="w-10 h-10"
                      :alt="getTierLabel(log.data.old.tier)"
                    >
                  </UButton>
                  <template #content>
                    {{ getTierLabel(log.data.old.tier) }}
                  </template>
                </UPopover>
                <span class="font-semibold">
                  <span>{{ getTierLabel(log.data.old.tier) }}</span>
                  <span v-if="!isApexTier(log.data.old.tier)">&nbsp;{{ log.data.old.division }}</span>
                </span>
              </div>

              <Icon
                name="lucide:arrow-right"
                class="text-muted"
              />

              <div class="flex items-center gap-2">
                <UPopover mode="hover" :content="{ side: 'top' }" arrow>
                  <UButton variant="link" class="p-0">
                    <img
                      :src="getTierImage(log.data.new.tier)"
                      class="w-10 h-10"
                      :alt="getTierLabel(log.data.new.tier)"
                    >
                  </UButton>
                  <template #content>
                    {{ getTierLabel(log.data.new.tier) }}
                  </template>
                </UPopover>
                <span class="font-semibold">
                  <span>{{ getTierLabel(log.data.new.tier) }}</span>
                  <span v-if="!isApexTier(log.data.new.tier)">&nbsp;{{ log.data.new.division }}</span>
                </span>
              </div>
            </div>
          </div>

          <!-- TODO: Reactions
          <div class="flex items-center gap-2 pt-3 border-t border-accented/50">
            <UButton
              variant="ghost"
              color="neutral"
              size="xs"
              class="text-muted hover:text-default"
              disabled
            >
              <Icon name="lucide:smile-plus" class="w-4 h-4" />
              <span class="text-xs">Reaccionar</span>
            </UButton>
          </div>
           -->
        </div>
      </div>

      <div v-if="hasMore" class="flex justify-center">
        <UButton
          variant="soft"
          color="neutral"
          :loading="isLoading"
          :disabled="isLoading"
          trailing-icon="lucide:chevron-down"
          class="w-full sm:w-auto justify-center"
          :label="isLoading ? 'Cargando...' : 'Mostrar más'"
          @click="loadMore"
        />
      </div>

      <div v-else-if="logs.length > 0" class="text-center py-4 text-muted text-sm">No hay más actividad para mostrar</div>
    </div>
  </main>
</template>
