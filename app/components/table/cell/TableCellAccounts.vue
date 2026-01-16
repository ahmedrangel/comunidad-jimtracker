<script setup lang="ts">
defineProps<{
  row: any;
}>();
</script>

<template>
  <div class="flex flex-col items-start gap-0.5">
    <div class="flex items-center gap-1">
      <Icon name="simple-icons:riotgames" class="w-5 h-5 text-red-500" mode="css" />
      <div class="flex items-center gap-2">
        <NuxtLink
          :to="`https://op.gg/es/lol/summoners/${getRegionLabel(row.original.region)}/${row.original.gameName}-${row.original.tagLine}`"
          target="_blank"
          class="font-semibold hover:underline"
        >
          <span>{{ row.original.gameName }} <span class="font-normal text-muted">#{{ row.original.tagLine }}</span></span>
        </NuxtLink>
        <Twemoji
          class="max-w-fit"
          :emoji="row.original.user.country"
          :title="getCountryName(row.original.user.country)"
          png
          size="1.5em"
        />
        <Icon
          v-if="row.original.user.bio"
          name="lucide:message-square-more"
          size="1.3em"
          mode="css"
          :title="row.original.user.bio"
        />
      </div>
    </div>
    <div class="flex items-center gap-1">
      <img v-if="row.original.user.twitchProfileImage" :src="row.original.user.twitchProfileImage" class="w-5 h-5 rounded-sm" :alt="row.original.user.twitchDisplay">
      <NuxtLink :to="`/u/${row.original.user.twitchLogin}`" class="hover:underline">
        <span class="text-xs text-muted font-semibold">{{ row.original.user.twitchDisplay }}</span>
      </NuxtLink>
    </div>
  </div>
</template>
