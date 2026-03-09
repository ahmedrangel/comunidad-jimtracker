<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession();
if (loggedIn && user && !user.value?.lastLoggedInAt) {
  clear();
}
</script>

<template>
  <div>
    <NuxtLoadingIndicator :throttle="0" />
    <UApp>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UApp>
  </div>
</template>
