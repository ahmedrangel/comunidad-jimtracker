<script setup lang="ts">
const props = defineProps<{
  data: any;
}>();

const { user } = useUserSession();

const modalRole1 = ref(false);
const modalRole2 = ref(false);

const selectedRole1 = ref<string | null>(props.data.role1 || null);
const selectedRole2 = ref<string | null>(props.data.role2 || null);

const isOwner = computed(() => {
  return user?.value?.twitchId === props.data.user.twitchId;
});

const selectRole = async (event: { role: string | null, slot: 1 | 2 }) => {
  const { role, slot } = event;
  if ((slot === 1 && role === selectedRole1.value) || (slot === 2 && role === selectedRole2.value)) {
    modalRole1.value = false;
    modalRole2.value = false;
    return;
  }
  if (slot === 1) {
    if (role && role === selectedRole2.value) {
      selectedRole2.value = selectedRole1.value || null;
    }
    selectedRole1.value = role;
  }
  else {
    if (role && role === selectedRole1.value) {
      selectedRole1.value = selectedRole2.value || null;
    }
    selectedRole2.value = role;
  }
  if (role === "fill") {
    selectedRole1.value = "fill";
    selectedRole2.value = null;
  }

  modalRole1.value = false;
  modalRole2.value = false;

  await $fetch(`/api/users/${props.data.user.twitchLogin}/riot-accounts/${props.data.puuid}`, {
    method: "PATCH",
    body: {
      puuid: props.data.puuid,
      role1: selectedRole1.value,
      role2: selectedRole2.value
    }
  });
};

const handleModalOwnerUpdate = () => {
  if (!isOwner.value) {
    modalRole1.value = false;
    modalRole2.value = false;
  }
};
</script>

<template>
  <div class="flex items-center justify-center gap-1">
    <UPopover v-if="isOwner" v-model:open="modalRole1" arrow @update:open="handleModalOwnerUpdate">
      <div v-if="selectedRole1 || isOwner" class="*:flex rounded-full" :class="{ 'border p-1 border-neutral-200/20 hover:bg-neutral-500/20': isOwner, 'border-neutral-200/0': !isOwner }">
        <span v-if="selectedRole1" :title="selectedRole1">
          <Icon :name="`lol:${selectedRole1}`" class="w-6.5 h-6.5" mode="css" />
        </span>
        <span v-else-if="!selectedRole1 && isOwner" title="Seleccionar rol primario">
          <Icon name="lucide:plus" class="w-6.5 h-6.5" mode="css" />
        </span>
      </div>
      <template #content>
        <RoleMenu :selected-slot="1" :selected-role="selectedRole1" @update:role="selectRole" />
      </template>
    </UPopover>
    <div v-else>
      <div v-if="selectedRole1 || isOwner" class="*:flex rounded-full" :class="{ 'border p-1 border-neutral-200/20 hover:bg-neutral-500/20': isOwner, 'border-neutral-200/0': !isOwner }">
        <span v-if="selectedRole1" :title="selectedRole1">
          <Icon :name="`lol:${selectedRole1}`" class="w-6.5 h-6.5" mode="css" />
        </span>
        <span v-else-if="!selectedRole1 && isOwner" title="Seleccionar rol primario">
          <Icon name="lucide:plus" class="w-6.5 h-6.5" mode="css" />
        </span>
      </div>
    </div>
    <UPopover v-if="isOwner && selectedRole1 !== 'fill' && (selectedRole2 || isOwner)" v-model:open="modalRole2" arrow @update:open="handleModalOwnerUpdate">
      <div class="*:flex rounded-full" :class="{ 'border p-1 border-neutral-200/20 hover:bg-neutral-500/20': isOwner, 'border-neutral-200/0': !isOwner }">
        <span v-if="selectedRole2" :title="selectedRole2">
          <Icon :name="`lol:${selectedRole2}`" class="w-6.5 h-6.5" mode="css" />
        </span>
        <span v-else-if="!selectedRole2 && isOwner" title="Seleccionar rol secundario">
          <Icon name="lucide:plus" class="w-6.5 h-6.5" mode="css" />
        </span>
      </div>
      <template #content>
        <RoleMenu :selected-slot="2" :selected-role="selectedRole2" @update:role="selectRole" />
      </template>
    </UPopover>
    <div v-else>
      <div v-if="selectedRole2" class="*:flex rounded-full" :class="{ 'border p-1 border-neutral-200/20 hover:bg-neutral-500/20': isOwner, 'border-neutral-200/0': !isOwner }">
        <span v-if="selectedRole2" :title="selectedRole2">
          <Icon :name="`lol:${selectedRole2}`" class="w-6.5 h-6.5" mode="css" />
        </span>
        <span v-else-if="!selectedRole2 && isOwner" title="Seleccionar rol secundario">
          <Icon name="lucide:plus" class="w-6.5 h-6.5" mode="css" />
        </span>
      </div>
    </div>
  </div>
</template>
