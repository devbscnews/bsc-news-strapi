module.exports = ({ env }) => [
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "https:"],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "https://storage.bsc.news", // added this line
            "https://radiant-flame-44830ef920.fra1.digitaloceanspaces.com",
            "https://radiant-flame-44830ef920.nyc3.digitaloceanspaces.com",
            "https://radiant-flame-44830ef920.media.strapiapp.com", // added this line
            "*.strapi.io",
            "market-assets.strapi.io",
            env("CF_PUBLIC_ACCESS_URL")
              ? env("CF_PUBLIC_ACCESS_URL").replace(/^https?:\/\//, "")
              : "",
          ],
          "media-src": [
            "'self'",
            "data:",
            "blob:",
            "market-assets.strapi.io",
            env("CF_PUBLIC_ACCESS_URL")
              ? env("CF_PUBLIC_ACCESS_URL").replace(/^https?:\/\//, "")
              : "",

            // `https://${env("AWS_BUCKET")}.s3.${env(
            //   "AWS_REGION"
            // )}.amazonaws.com`,
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },

  "strapi::cors",
  "strapi::poweredBy",
  "strapi::logger",
  "strapi::query",
  {
    name: "strapi::body",
    config: {
      formLimit: "256mb", // modify form body
      jsonLimit: "256mb", // modify JSON body
      textLimit: "256mb", // modify text body
      formidable: {
        maxFileSize: 200 * 1024 * 1024, // multipart data, modify here limit of uploaded file size
      },
    },
  },
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
  // "global::cache-headers",
];
