const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
const disallowedPaths = [];

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: baseUrl,
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: "weekly",
  priority: 0.7,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: disallowedPaths,
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/images/*"],
      },
    ],
    // additionalSitemaps: [`${baseUrl}/sitemap.xml`],
    sitemap: `${baseUrl}/sitemap.xml`,
  },
  exclude: disallowedPaths,
};
