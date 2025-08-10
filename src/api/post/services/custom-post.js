"use strict";

/**
 * Custom post service
 */

module.exports = {
  async findBySlug(slug, query = {}) {
    // Default populate configuration
    const defaultPopulate = {
      MainImage: { populate: "url" },
      Category: true,
      ChainTag: {
        // fields: ["Logo", "Name"],
        populate: {
          Logo: { fields: ["url"] },
        },
      },
      MainTag: true,
      Tags: true,
      Author: {
        // fields: ["Picture", "Name", "Bio"],
        populate: {
          Picture: { fields: ["url"] },
        },
      },
      FAQ: {
        populate: {
          FaqItem: { fields: ["Question", "Answer"] },
        },
      },
      seo: {
        // fields: ["metaTitle", "metaDescription"],
        populate: {
          shareImage: { fields: ["url"] },
        },
      },
    };

    // Find the post with the given slug
    const entities = await strapi.entityService.findMany("api::post.post", {
      filters: { Slug: slug },
      populate: defaultPopulate,
    });

    // Return 404 if no post found
    if (!entities || entities.length === 0) {
      return { post: null, relatedPosts: [] };
    }

    // Get the post
    const post = entities[0];

    // Get 5 related posts based on tags
    const relatedPosts = await this.findRelatedPosts(post, 5);
    const latestPosts = await this.findLatestPosts(post, 5);

    // Return the post and related posts
    return {
      post,
      relatedPosts,
      latestPosts,
    };
  },

  async findRelatedPosts(post, limit = 5) {
    // If no tags, return empty array
    if (!post.Tags || post.Tags.length === 0) {
      return [];
    }

    // Get the tag IDs
    const tagIds = post.Tags.map((tag) => tag.id);

    // Find related posts
    const relatedPosts = await strapi.entityService.findMany("api::post.post", {
      filters: {
        id: { $ne: post.id }, // Exclude current post
        Tags: { id: { $in: tagIds } },
      },
      fields: [
        "id",
        "Name",
        "Slug",
        "PostSummary",
        "ReadingTime",
        "EditorsChoice",
        "Biography",
        "PublishDate",
        "Trending",

        // PostBody is intentionally omitted
      ],
      populate: {
        MainImage: { populate: "url" },
        Category: true,
        MainTag: true,
        ChainTag: true,
        Author: true,
        Tags: true,
      },
      sort: { PublishDate: "desc" },
      limit,
    });

    return relatedPosts;
  },

  async findLatestPosts(post, limit = 5) {
    // Get the tag IDs

    // Find related posts
    const latestPosts = await strapi.entityService.findMany("api::post.post", {
      filters: {
        // id: { $ne: post.id }, // Exclude current post
        ChainTag: { Slug: { $in: ["news"] } },
      },
      fields: [
        "id",
        "Name",
        "Slug",
        "PostSummary",
        "ReadingTime",
        "EditorsChoice",
        "Biography",
        "PublishDate",
        "Trending",

        // PostBody is intentionally omitted
      ],
      populate: {
        MainImage: { populate: "url" },
        Category: true,
        MainTag: true,
        Author: true,
        ChainTag: true,
        Tags: true,
      },
      sort: { PublishDate: "desc" },
      limit,
    });

    return latestPosts;
  },
};
