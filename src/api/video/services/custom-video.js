"use strict";

module.exports = {
  async findBySlug(slug, query = {}) {
    const defaultPopulate = {
      tags: true,
      categories: true,
      relatedVideos: true,
      customThumbnail: { fields: ["url"] },
      statistics: true,
    };

    const entities = await strapi.entityService.findMany("api::video.video", {
      filters: { slug },
      populate: defaultPopulate,
    });

    if (!entities || entities.length === 0) {
      return { video: null, relatedVideos: [], latestVideos: [] };
    }

    const video = entities[0];

    // ❗MAIN CHANGE: smarter related videos
    const relatedVideos = await this.getSmartRelatedVideos(video, 8);

    const latestVideos = await this.findLatestVideos(video, 8);

    return { video, relatedVideos, latestVideos };
  },

  /**
   * SMART RELATED VIDEO FLOW
   */
  async getSmartRelatedVideos(video, limit = 8) {
    // 1. Try YouTube tags
    let results = await this.findRelatedByYouTubeTags(video, limit);
    if (results.length > 0) return results;

    // 2. Try Manual Tags
    results = await this.findRelatedByManualTags(video, limit);
    if (results.length > 0) return results;

    // 3. Fallback: latest (excluding this)
    results = await this.findLatestVideos(video, limit);
    if (results.length > 0) return results;

    // 4. Final fallback: ANY videos except this one
    return await strapi.entityService.findMany("api::video.video", {
      filters: { id: { $ne: video.id }, isShort: { $eq: false } },
      limit,
      sort: { publishedTime: "desc" },
      populate: { customThumbnail: { fields: ["url"] } },
    });
  },

  /**
   * RELATED BY YOUTUBE TAGS
   */
  async findRelatedByYouTubeTags(video, limit = 8) {
    const youtubeTags = video.youtubeTags || [];

    if (!youtubeTags.length) return [];

    return await strapi.entityService.findMany("api::video.video", {
      filters: {
        isShort: { $eq: false },
        id: { $ne: video.id },
        youtubeTags: {
          $containsi: youtubeTags, // <-- MATCH ANY ITEM INSIDE ARRAY
        },
      },
      limit,
      sort: { publishedTime: "desc" },
      populate: { customThumbnail: { fields: ["url"] } },
    });
  },

  /**
   * RELATED BY MANUAL TAGS (Relation)
   */
  async findRelatedByManualTags(video, limit = 8) {
    if (!video.tags || video.tags.length === 0) return [];

    const tagIds = video.tags.map((t) => t.id);

    return await strapi.entityService.findMany("api::video.video", {
      filters: {
        id: { $ne: video.id },
        tags: { id: { $in: tagIds } },
        isShort: { $eq: false },
      },
      limit,
      sort: { publishedTime: "desc" },
      populate: { customThumbnail: { fields: ["url"] } },
    });
  },

  /**
   * LATEST VIDEOS (exclude current)
   */
  async findLatestVideos(video, limit = 8) {
    return await strapi.entityService.findMany("api::video.video", {
      filters: { id: { $ne: video.id }, isShort: { $eq: true } },
      limit,
      sort: { publishedTime: "desc" },
      populate: { customThumbnail: { fields: ["url"] } },
    });
  },
};
