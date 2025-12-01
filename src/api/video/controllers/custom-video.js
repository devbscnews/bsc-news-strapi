"use strict";
const formatter = require("../../../utils/video-response-formatter");

module.exports = {
  async findBySlug(ctx) {
    const { slug } = ctx.params;

    const { video, relatedVideos, latestVideos } = await strapi
      .service("api::video.custom-video")
      .findBySlug(slug);

    if (!video) return ctx.notFound("Video not found");

    return {
      data: {
        video: formatter.formatVideoResponse(video),

        relatedVideos: relatedVideos.map((v) =>
          formatter.formatVideoResponse(v)
        ),

        latestVideos: latestVideos.map((v) => formatter.formatVideoResponse(v)),
      },
    };
  },
};
