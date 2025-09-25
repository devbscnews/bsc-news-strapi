"use strict";

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    await next();

    // Set cache headers for API routes
    if (ctx.request.url.startsWith("/api/")) {
      ctx.set("Cache-Control", "public, max-age=600"); // 3 hours
      ctx.set("Vary", "Accept-Encoding");
    }
  };
};
