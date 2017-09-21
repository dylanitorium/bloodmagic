/**
 * Main function handler
 * @param app
 */
module.exports = (app) => (
  (req, res) => {
    // Required to use an express app with firebase cloud function handler
    req.url = !req.path ? `/${req.url}` : req.url;
    return app(req, res)
  }
);