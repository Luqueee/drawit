const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
const disallowedPaths = [];

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://drawit.place",
  generateRobotsTxt: true,
  sitemapSize: 7000,
  // generateIndexSitemap: true,
  priority: 0.8,
  sitemapSize: 5000,
  generateRobotsTxt: true,
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
};
