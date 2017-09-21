/**
 * Gets the user from the token
 * @param admin
 */
module.exports = (admin) => (
  (req, res, next) => {
    let {
      body: {
        token
      }
    } = req;

    if (!token) {
      token = req.query.token;
    }

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
