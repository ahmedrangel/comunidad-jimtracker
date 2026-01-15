<template>
  <div id="layout" class="flex flex-col min-h-screen items-center *:w-full">
    <SiteNavbar />
    <div class="lg:container py-5 px-2 grow max-w-screen">
      <slot />
    </div>
    <SiteFooter />
  </div>
</template>
