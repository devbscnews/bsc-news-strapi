// utils/response-formatter.js
module.exports = {
  formatPostResponse(post) {
    if (!post) return null;

    // Transform main post
    const formatted = {
      id: post.id,
      attributes: {
        ...post,
        id: undefined, // Remove duplicate id
      },
    };

    // Transform relations to Strapi's default format
    const relations = [
      "MainImage",
      "Category",
      "ChainTag",
      "MainTag",
      "Tags",
      "Author",
    ];

    relations.forEach((relation) => {
      if (post[relation]) {
        if (Array.isArray(post[relation])) {
          formatted.attributes[relation] = {
            data: post[relation].map((item) => ({
              id: item.id,
              attributes: this.removeId(item),
            })),
          };
        } else {
          formatted.attributes[relation] = {
            data: {
              id: post[relation].id,
              attributes: this.removeId(post[relation]),
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
    const { id, ...rest } = obj;
    return rest;
  },
};
