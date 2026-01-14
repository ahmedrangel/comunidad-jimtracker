<script setup lang="ts">
// import countries from "~/assets/json/countries.json";
// import type { SelectMenuItem } from "@nuxt/ui";

const { user, clear } = useUserSession();

const model = defineModel<Pick<JimUser, "country" | "bio">>({ required: true });

const form = useFormState({
  // country: model.value.country || "",
  bio: model.value.bio || ""
});

/*
const countriesMenu = countries.map(country => ({
  label: country.name,
  value: country.emoji
})) satisfies SelectMenuItem[];
*/

const isEditing = ref(false);
const isDeleting = ref(false);

const emits = defineEmits<{
  edit: [];
}>();

const editProfile = async () => {
  if (!user.value) return;

  isEditing.value = true;
  $fetch(`/api/users/${user.value.twitchLogin}`, {
    method: "PATCH",
    body: form.value
  }).then(() => {
    model.value.bio = form.value.bio;
    // model.value.country = form.value.country;
    if (user.value) {
      user.value.bio = form.value.bio;
      // user.value.country = form.value.country;
    }
    useCachedData("riot-accounts", () => undefined);
    emits("edit");
  }).catch(() => {}).finally(() => {
    isEditing.value = false;
  });
};

const deleteAccount = async () => {
  if (!user.value || !confirm("¿Estás seguro de que deseas eliminar tu cuenta de la comunidad? Se eliminarán todas las cuentas de Riot vinculadas a esta cuenta. Esta acción no se puede deshacer.")) return;

  isDeleting.value = true;
  $fetch(`/api/users/${user.value.twitchLogin}`, {
    method: "DELETE"
  }).then(() => {
    clear();
    navigateTo("/");
  }).catch(() => {}).finally(() => {
    isDeleting.value = false;
  });
};
</script>

<template>
  <form v-if="user" class="space-y-2" @submit.prevent="editProfile">
    <h3 class="font-semibold">Información</h3>
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
    <UFormField help="Escribe un mensaje que se mostrará públicamente en la tabla de la comunidad y en tu perfil.">
      <UTextarea
        v-model.trim="form.bio"
        class="w-full"
        placeholder="Escribe algo..."
        icon="lucide:message-square-more"
        autoresize
      />
    </UFormField>
    <UButton type="submit" label="Guardar cambios" variant="subtle" :loading="isEditing" :disabled="isEditing" block />
    <USeparator />
    <h3 class="font-semibold">Avanzado</h3>
    <UButton label="Eliminar cuenta" color="error" variant="subtle" :loading="isDeleting" :disabled="isDeleting" block @click="deleteAccount" />
  </form>
</template>
