<template>
  <div id="layout" class="flex flex-col min-h-screen items-center">
    <SiteNavbar />
    <div class="lg:container py-5 px-2 grow max-w-screen w-full">
      <slot />
    </div>
    <SiteFooter />
  </div>
</template>
