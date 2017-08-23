/**
 * Gets the user from the token
 * @param admin
 */
module.exports = (admin) => (
  (req, res, next) => {
    const {
      body: {
        token
      }
    } = req;

    admin.auth()
      .verifyIdToken(token)
      .then(user => {
        req.user = user;
        next();
      })
      .catch((error) => {
        console.log(error);
        res.status(403).send('Unauthorized');
      });
  }
);