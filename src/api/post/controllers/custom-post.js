"use strict";
const formatter = require("../../../utils/response-formatter");

/**
 * Custom post controller
 */

module.exports = {
  async findBySlug(ctx) {
    const { slug } = ctx.params;
    const { query } = ctx;

    // Call the custom service with the slug
    const { post, relatedPosts, latestPosts } = await strapi
      .service("api::post.custom-post")
      .findBySlug(slug, query);

    if (!post) {
      return ctx.notFound("Post not found");
    }
    const formattedPost = formatter.formatPostResponse(post);
    const formattedRelatedPosts = relatedPosts.map((p) =>
      formatter.formatPostResponse(p)
    );

    const formattedLatestPosts = latestPosts.map((p) =>
      formatter.formatPostResponse(p)
    );

    // Return the sanitized data
    return {
      data: {
        post: formattedPost,
        relatedPosts: formattedRelatedPosts,
        latestPosts: formattedLatestPosts,
      },
    };
  },
};
