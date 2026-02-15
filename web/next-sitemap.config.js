/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: "https://hostelgh.vercel.app", // change to https://hostelgh.com later
    generateRobotsTxt: true,
    sitemapSize: 5000,
    exclude: ["/admin/*", "/owner/*", "/tenant/*", "/account/*"],
    robotsTxtOptions: {
        policies: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin", "/owner", "/tenant", "/account"],
            },
        ],
    },
};
