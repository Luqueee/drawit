/** @type {import('next-sitemap').IConfig} */
export default {
  siteUrl: "https://drawit.place",
  generateRobotsTxt: true,
  sitemapSize: 5000, // Fixed duplicate property
  generateIndexSitemap: true, // Enable sitemap index generation
  priority: 0.8,
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/" }],
  },
  transform: async (config, path) => {
    let priority = config.priority;
    let changefreq = config.changefreq;
    // Set higher priority for home and team pages
    if (path === "/") {
      priority = 1.0; // Highest priority for the homepage
      changefreq = "hourly"; // Change frequency for the homepage, hourly is just an example consult the sitemap documentation or your SEO expert
    }

    return {
      loc: path, // => this will be exported as http(s)://<config.siteUrl>/<path>
      changefreq: config.changefreq,
      priority: priority, // Dynamic priority based on the page
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    };
  },
  additionalPaths: async (config) => {
    const result = [];

    result.push({ loc: "/" });

    return result;
  },
};
