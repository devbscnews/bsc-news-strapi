module.exports = {
  formatVideoResponse(video) {
    if (!video) return null;

    const formatted = {
      id: video.id,
      attributes: {
        ...video,
        id: undefined,
      },
    };

    const relations = [
      "tags",
      "categories",
      "customThumbnail",
      "relatedVideos",
    ];

    relations.forEach((relation) => {
      const value = video[relation];

      if (value) {
        // Array relation
        if (Array.isArray(value)) {
          formatted.attributes[relation] = {
            data: value.map((item) => ({
              id: item.id,
              attributes: this.removeId(item),
            })),
          };
        }

        // Single relation (example: customThumbnail)
        else if (value.id) {
          formatted.attributes[relation] = {
            data: {
              id: value.id,
              attributes: this.removeId(value),
            },
          };
        }
      } else {
        formatted.attributes[relation] = { data: null };
      }
    });

    return formatted;
  },

  removeId(obj) {
    if (!obj) return null;
    const { id, ...rest } = obj;
    return rest;
  },
};
