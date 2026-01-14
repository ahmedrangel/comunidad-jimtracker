<script setup lang="ts">
// import countries from "~/assets/json/countries.json";
// import type { SelectMenuItem } from "@nuxt/ui";

const { user } = useUserSession();

const model = defineModel<Pick<JimUser, "country" | "bio">>({ required: true });

const form = useFormState({
  country: model.value.country || "",
  bio: model.value.bio || ""
});

/*
const countriesMenu = countries.map(country => ({
  label: country.name,
  value: country.emoji
})) satisfies SelectMenuItem[];
*/

const isLoading = ref(false);
const emits = defineEmits<{
  edit: [];
}>();

const editProfile = async () => {
  if (!user.value) return;

  isLoading.value = true;
  $fetch(`/api/users/${user.value.twitchLogin}`, {
    method: "PATCH",
    body: form.value
  }).then(() => {
    model.value.bio = form.value.bio;
    model.value.country = form.value.country;
    if (user.value) {
      user.value.bio = form.value.bio;
      user.value.country = form.value.country;
    }
    useCachedData("riot-accounts", () => undefined);
    emits("edit");
  }).catch(() => {}).finally(() => {
    isLoading.value = false;
  });
};
</script>

<template>
  <form v-if="user" class="space-y-2" @submit.prevent="editProfile">
    <InputFloating id="user" v-model="user.twitchDisplay" placeholder="User" disabled />
    <!--
    <USelectMenu id="country" v-model="form.country" :items="countriesMenu" value-key="value" placeholder="País" icon="lucide:search" size="xl" class="w-full" clear>
      <template #leading="{ modelValue }">
        <Twemoji v-if="modelValue" :emoji="modelValue" size="1.5rem" png />
      </template>
      <template #item-leading="{ item }">
        <Twemoji v-if="item" :emoji="item.value" size="1.5rem" png />
      </template>
    </USelectMenu>
    -->
    <UTextarea v-model="form.bio" class="w-full" placeholder="Escribe algo sobre ti..." />
    <UButton type="submit" label="Guardar cambios" block :loading="isLoading" :disabled="isLoading" />
  </form>
</template>
