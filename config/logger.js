const morgan = require("morgan");

module.exports = function (app) {
  if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
  }
};
