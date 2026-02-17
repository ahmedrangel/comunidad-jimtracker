import { SITE } from "../shared/utils/site";
import icons from "./icons";

export default defineNuxtConfig({
  modules: [
    "@nuxt/ui",
    "@nuxt/eslint",
    "@nuxt/icon",
    "@nuxtjs/sitemap",
    "@nuxthub/core",
    "nuxt-auth-utils",
    "nuxt-twemoji"
  ],

  $production: {
    nitro: {
      preset: "cloudflare-module"
    }
  },

  devtools: { enabled: true },

  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      title: SITE.title,
      htmlAttrs: {
        lang: "es"
      },
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "shortcut icon", href: "/favicon.ico" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
        { rel: "icon", type: "image/png", sizes: "512x512", href: "/web-app-manifest-512x512.png" },
        { rel: "icon", type: "image/png", sizes: "192x192", href: "/web-app-manifest-192x192.png" },
        { rel: "icon", type: "image/png", sizes: "96x96", href: "/favicon-96x96.png" },
        { rel: "manifest", href: "/site.webmanifest" },
        { rel: "preconnect", href: "https://cdn.communitydragon.org" },
        { rel: "preconnect", href: "https://static-cdn.jtvnw.net" },
        { rel: "preconnect", href: SITE.cdn },
        { rel: "preconnect", href: "https://cdn.jsdelivr.net" }
      ],
      meta: [
        { name: "robots", content: "index, follow" },
        { name: "apple-mobile-web-app-title", content: SITE.name },
        { name: "apple-mobile-web-app-capable", content: SITE.name },
        { name: "application-name", content: SITE.name },
        { property: "og:site_name", content: SITE.name }
      ]
    }
  },

  css: [
    "~/assets/css/main.css",
    "~/assets/scss/app.scss"
  ],

  site: { url: SITE.host },

  colorMode: {
    preference: "dark",
    fallback: "dark"
  },

  ui: {
    colorMode: true,
    fonts: false,
    theme: {
      colors: ["primary", "success", "info", "error"]
    }
  },

  runtimeConfig: {
    session: {
      password: "",
      maxAge: 60 * 60 * 24 * 30 // 30 days
    },
    oauth: {
      riotgames: {
        apiKey: ""
      }
    }
  },

  routeRules: {
    "/api/_nuxt_icon/**": { cache: { maxAge: 1.577e+7 } }
  },

  features: {
    inlineStyles: false
  },

  experimental: {
    typedPages: true
  },

  compatibilityDate: "2026-01-10",

  nitro: {
    prerender: {
      autoSubfolderIndex: false,
      crawlLinks: false,
      routes: ["/sitemap.xml"]
    },
    cloudflare: {
      pages: {
        routes: {
          exclude: ["/images/*"]
        }
      }
    },
    experimental: {
      tasks: true
    },
    scheduledTasks: {
      "*/30 * * * *": ["updateLeagueData"],
      "0 0 * * *": ["updateTwitchData"]
    }
  },

  hub: {
    db: {
      dialect: "sqlite",
      casing: "snake_case"
    },
    cache: true
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ["color-functions", "import", "global-builtin"]
        }
      }
    }
  },

  eslint: {
    config: {
      autoInit: false,
      stylistic: true
    }
  },

  icon: {
    mode: "svg",
    provider: "none",
    clientBundle: { icons },
    customCollections: [
      { prefix: "lol", dir: "./app/assets/icons/lol" }
    ]
  },

  sitemap: {
    discoverImages: false,
    zeroRuntime: true,
    urls: [
      { loc: "/", priority: 1 }
    ],
    defaults: { priority: 0.8, lastmod: new Date().toISOString() },
    xslColumns: [
      { label: "URL", width: "65%" },
      { label: "Priority", select: "sitemap:priority", width: "12.5%" },
      { label: "Last Modified", select: "sitemap:lastmod", width: "35%" }
    ]
  },

  twemoji: {
    mode: "png"
  }
});
