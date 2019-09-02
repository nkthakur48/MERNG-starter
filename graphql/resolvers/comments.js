const { UserInputError, AuthenticationError } = require("apollo-server");
const Post = require("../../models/Post");
const checkAuth = require("../../util/checkAuth");
const { validateCreateCommentInput } = require("../../util/validators");

module.exports = {
  Mutation: {
    async createComment(_, { postId, body }, context) {
      const user = checkAuth(context);
      const { valid, errors } = validateCreateCommentInput(body);
      if (!valid) {
        throw new UserInputError(errors);
      }
      const post = await Post.findById(postId);
      if (post) {
        post.comments.unshift({
          body,
          username: user.username,
          createdAt: new Date().toISOString()
        });
        await post.save();
        return post;
      } else {
        throw new UserInputError("Post not found");
      }
    },
    async deleteComment(_, { postId, commentId }, context) {
      const user = checkAuth(context);
      const post = await Post.findById(postId);
      if (post) {
        const comment = post.comments.filter(
          comment => comment.id === commentId
        );
        if (comment.length > 0) {
          if (comment[0].username === user.username) {
            post.comments = post.comments.filter(
              comment => comment.id !== commentId
            );
            await post.save();
            return post;
          } else {
            throw new AuthenticationError("Operation not permitted");
          }
        } else {
          throw new UserInputError("Comment not found");
        }
      } else {
        throw new UserInputError("Post not found");
      }
    }
  }
};
