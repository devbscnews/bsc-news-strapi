"use strict";

/**
 * Custom post router
 */

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/posts/slug/:slug",
      handler: "api::post.custom-post.findBySlug",
      config: {
        auth: false,
      },
    },
  ],
};
