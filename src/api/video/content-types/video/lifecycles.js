require("dotenv").config();

const YT_API_KEY = process.env.YOUTUBE_API_KEY;

// --- YouTube Fetcher ---
async function fetchYouTubeMeta(videoId) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${YT_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.items || data.items.length === 0) {
    console.log("No YouTube data found for:", videoId);
    return null;
  }

  const item = data.items[0];

  const snippet = item.snippet;
  const details = item.contentDetails;
  const stats = item.statistics;

  // YouTube duration "PT10M30S" → convert to seconds
  const durationISO = details.duration;
  const isShort = convertIsoToSeconds(durationISO) <= 60;

  return {
    title: snippet.title,
    description: snippet.description,
    publishedTime: snippet.publishedAt,
    duration: durationISO,
    thumbnail: snippet.thumbnails.maxres?.url || snippet.thumbnails.high?.url,

    isShort,
    statistics: {
      views: stats.viewCount,
      likes: stats.likeCount,
      comments: stats.commentCount,
    },
    youtubeTags: snippet.tags || [],
  };
}

// Convert ISO (PT10M30S) into seconds
function convertIsoToSeconds(iso) {
  const match = iso.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const h = parseInt(match[1]) || 0;
  const m = parseInt(match[2]) || 0;
  const s = parseInt(match[3]) || 0;
  return h * 3600 + m * 60 + s;
}

// Slug generator
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;

    if (!data.videoId) return;

    // Only fetch if not synced
    if (!data.isSynced) {
      const meta = await fetchYouTubeMeta(data.videoId);
      if (meta) {
        data.title = data.title || meta.title;
        data.description = data.description || meta.description;

        data.publishedTime = meta.publishedTime;
        data.duration = meta.duration;
        data.thumbnail = meta.thumbnail;
        data.isShort = meta.isShort;
        data.statistics = meta.statistics;
        data.youtubeTags = meta.youtubeTags || [];

        data.slug = slugify(data.customTitle || meta.title);

        data.isSynced = true;
        data.syncedAt = new Date();
      }
    }
  },

  async afterCreate(event) {
    const { result } = event;
    console.log("Video Created:", result.slug);
  },

  async beforeUpdate(event) {
    const { data, where } = event.params;

    // Fetch existing record
    const existing = await strapi.entityService.findOne(
      "api::video.video",
      where.id
    );

    // If user changed videoId, re-sync
    const videoIdChanged = data.videoId && data.videoId !== existing.videoId;

    // If override fields changed, don't re-sync
    const forceResync = videoIdChanged || data.isSynced === false;

    if (forceResync && data.videoId) {
      const meta = await fetchYouTubeMeta(data.videoId);
      if (meta) {
        console.log(meta);
        data.title = data.title || meta.title;
        data.description = data.description || meta.description;
        data.publishedTime = meta.publishedTime;
        data.duration = meta.duration;
        data.thumbnail = meta.thumbnail;
        data.isShort = meta.isShort;
        data.statistics = meta.statistics;
        data.youtubeTags = meta.youtubeTags || [];

        data.slug = slugify(data.customTitle || meta.title);

        data.isSynced = true;
        data.syncedAt = new Date();
      }
    }
  },

  async afterUpdate(event) {
    const { result } = event;

    console.log("Video Updated:", result.slug);
  },

  async afterDelete(event) {
    const { result } = event;

    console.log("Video Deleted:", result.slug);
  },
};
