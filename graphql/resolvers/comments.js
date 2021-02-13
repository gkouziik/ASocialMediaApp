const { UserInputError, AuthenticationError } = require('apollo-server');
const Post = require('../../models/Posts');
const checkAuth = require('../../utils/check-auth');

module.exports = {
  Mutation: {
    // eslint-disable-next-line no-undef
    createComment: async (_, { postId, body }, context) => {
      try {
        const { username } = checkAuth(context);
        if (body.trim() === '') {
          throw new UserInputError('Comment empty', {
            errors: {
              body: 'Comment body must not be empty',
            },
          });
        }
        const post = await Post.findById(postId);
        if (post) {
          post.comments.unshift({
            body,
            username,
            createdAt: new Date().toISOString(),
          });

          await post.save();
          return post;
        }
        throw new UserInputError('Post not found');
      } catch (error) {
        throw new Error(error);
      }
    },
    // eslint-disable-next-line no-unused-vars
    // eslint-disable-next-line consistent-return
    deleteComment: async (_, { postId, commentId }, context) => {
      const username = checkAuth(context);
      const post = await Post.findById(postId);
      if (post) {
        const commentIndex = post.comments.findIndex((c) => c.id === commentId);
        if (post.comments[commentIndex].username === username) {
          post.comments.splice(commentIndex, 1);
          await post.save();
          return post;
        }
        throw new AuthenticationError('Action not allowed');
      }
    },
  },
};
