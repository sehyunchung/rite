// Import design system colors
const { themes } = require('@rite/ui/design-tokens');

// Use Josh Comeau dark theme as default
const defaultTheme = themes.joshComeau;

export default {
  expo: {
    name: "RITE",
    slug: "rite",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "mobile",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.rite.mobile",
      infoPlist: {
        CFBundleURLTypes: [
          {
            CFBundleURLName: "google-oauth",
            CFBundleURLSchemes: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_IOS
              ? [`com.googleusercontent.apps.${process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_IOS.split('-')[0]}-${process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_IOS.split('-')[1]}`]
              : []
          },
          {
            CFBundleURLName: "expo-auth-session",
            CFBundleURLSchemes: ["mobile"]
          }
        ],
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.rite.mobile",
      intentFilters: [
        {
          action: "VIEW",
          category: ["BROWSABLE", "DEFAULT"],
          data: {
            scheme: "mobile"
          }
        },
        {
          action: "VIEW", 
          category: ["BROWSABLE", "DEFAULT"],
          data: {
            scheme: "com.rite.mobile"
          }
        }
      ]
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
      name: "RITE",
      shortName: "RITE",
      description: "DJ event management platform",
      lang: "en",
      themeColor: defaultTheme.brand.primary,
      backgroundColor: defaultTheme.neutral[800],
      display: "standalone",
      scope: "/",
      startUrl: "/",
      orientation: "portrait",
      preferRelatedApplications: false
    },
    plugins: [
      "expo-router",
      "expo-dev-client",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ],
      "expo-secure-store"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {},
      eas: {
        projectId: "379317da-ce13-44d9-a022-acdf0db9c403"
      },
      convexUrl: "https://agreeable-crayfish-565.convex.cloud"
    },
    owner: "sehyun_chung"
  }
};