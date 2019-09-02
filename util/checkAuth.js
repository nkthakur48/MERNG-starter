const jwt = require("jsonwebtoken");
const { AuthenticationError } = require("apollo-server");
const { SECRET_KEY } = require("../config");
module.exports = context => {
  // Context = {...headers}
  const authHeader = context.req.headers.authorization;
  if (authHeader) {
    // Bearer ...
    const token = authHeader.split("Bearer ")[1];
    if (token) {
      try {
        const user = jwt.verify(token, SECRET_KEY);
        return user;
      } catch (err) {
        throw new AuthenticationError("Invalid/Expired Token");
      }
    } else {
      throw new Error(`Authentication Token must be "Bearer [token]"`);
    }
  } else {
    throw new Error("Authorization header must be provided");
  }
};
