"use strict";

/**
 * Custom video router
 */

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/videos/slug/:slug",
      handler: "api::video.custom-video.findBySlug",
      config: {
        auth: false,
      },
    },
  ],
};
