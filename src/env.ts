export const envs = {
    API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
    SECRET_KEY: process.env.NEXT_PUBLIC_SECRET_KEY,
    SITE_URL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
}