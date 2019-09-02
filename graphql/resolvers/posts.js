const { AuthenticationError, UserInputError } = require("apollo-server");
const Post = require("../../models/Post");
const checkAuth = require("../../util/checkAuth");

module.exports = {
  Query: {
    async getPosts() {
      try {
        const posts = await Post.find().sort({ createdAt: -1 });
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getPost(_, { postId }) {
      try {
        const post = await Post.findById(postId);
        if (post) {
          return post;
        } else {
          throw new Error("Post not found");
        }
      } catch (err) {
        throw new Error("Something went wrong");
      }
    }
  },
  Mutation: {
    async createPost(_, { body }, context) {
      const user = checkAuth(context);
      const newPost = new Post({
        body,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString()
      });
      const post = await newPost.save();
      context.pubsub.publish("NEW_POST", {
        newPost: post
      });
      return post;
    },
    async deletePost(_, { postId }, context) {
      const user = checkAuth(context);
      try {
        const post = await Post.findById(postId);
        if (user.username === post.username) {
          await post.delete();
          return "Post deleted Successfully";
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async likePost(_, { postId }, context) {
      const user = checkAuth(context);
      const post = await Post.findById(postId);
      debugger;
      if (post) {
        if (post.likes.find(like => like.username === user.username)) {
          // Post already liked
          post.likes = post.likes.filter(
            like => like.username !== user.username
          );
        } else {
          // Post not liked
          post.likes.push({
            username: user.username,
            createdAt: new Date().toISOString()
          });
        }
        await post.save();
        return post;
      } else {
        throw new UserInputError("Post not found");
      }
    }
  },
  Subscription: {
    newPost: {
      subscribe(_, __, { pubsub }) {
        return pubsub.asyncIterator("NEW_POST");
      }
    }
  }
};
