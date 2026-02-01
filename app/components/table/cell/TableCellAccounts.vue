<script setup lang="ts">
const props = defineProps<{
  data: JimTableData;
  chatters: string[];
}>();

const tablePopover = useTablePopover();

const isOnlineChatter = computed(() => {
  return props.chatters.includes(props.data.user.twitchId);
});
</script>

<template>
  <div class="flex flex-col items-start gap-0.5">
    <div class="flex items-center gap-1">
      <Icon name="simple-icons:riotgames" class="w-5 h-5 text-red-500" mode="css" />
      <div class="flex items-center gap-2">
        <NuxtLink
          :to="`https://op.gg/es/lol/summoners/${getRegionLabel(data.region)}/${data.gameName}-${data.tagLine}`"
          target="_blank"
          class="font-semibold hover:underline"
        >
          <span>{{ data.gameName }} <span class="font-normal text-muted">#{{ data.tagLine }}</span></span>
        </NuxtLink>
        <Twemoji
          v-if="data.user.country"
          class="max-w-fit"
          :emoji="data.user.country"
          :alt="getCountryName(data.user.country)"
          size="1.5em"
          v-on="tablePopover.handlers(getCountryName(data.user.country))"
        />
        <Icon
          v-if="data.user.bio"
          name="lucide:message-square-more"
          size="1.3em"
          mode="css"
          :alt="data.user.bio"
          v-on="tablePopover.handlers(data.user.bio)"
        />
      </div>
    </div>
    <div class="flex items-center gap-1">
      <img v-if="data.user.twitchProfileImage" :src="data.user.twitchProfileImage.replace('300x300', '50x50')" class="w-5 h-5 rounded-sm" :alt="data.user.twitchDisplay">
      <NuxtLink :to="`/u/${data.user.twitchLogin}`" class="hover:underline flex items-center gap-1">
        <span class="text-xs text-muted font-semibold">{{ data.user.twitchDisplay }}</span>
      </NuxtLink>
      <Icon
        v-if="isOnlineChatter"
        name="tabler:circle-filled"
        class="text-lime-400 animate-pulse"
        size="0.75rem"
        mode="css"
        :alt="'En el chat'"
        v-on="tablePopover.handlers('En el chat')"
      />
    </div>
  </div>
</template>
