require("dotenv").config({ path: "./.env" });

module.exports = {
  apps: [
    {
      name: "RPLACE-WEB",
      exec_mode: "cluster",
      instances: "max", // Or a number of instances
      script: "node_modules/next/dist/bin/next",
      args: "start",
      autorestart: true,

      env_prod: {
        APP_ENV: "prod", // APP_ENV=prod
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        AUTH_SECRET: process.env.AUTH_SECRET,
        AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
        AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
        SITE_URL: process.env.SITE_URL,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
        AUTH_REDIRECT_PROXY_URL: process.env.AUTH_REDIRECT_PROXY_URL,
      },
    },
  ],
};
