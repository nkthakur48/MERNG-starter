const postResolvers = require("./posts");
const userResolvers = require("./users");
const commentsResolvers = require("./comments");

module.exports = {
  Post: {
    likeCount(parent) {
      return parent.likes.length;
    },
    commentCount(parent) {
      return parent.comments.length;
    }
  },
  Query: {
    ...postResolvers.Query
  },
  Mutation: {
    ...postResolvers.Mutation,
    ...userResolvers.Mutation,
    ...commentsResolvers.Mutation
  },
  Subscription: {
    ...postResolvers.Subscription
  }
};
