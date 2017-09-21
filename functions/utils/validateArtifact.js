/**
 * Validate that the user owns this configuration
 * @param admin
 */
module.exports = (admin) => (
  (req, res, next) => {
    let {
      body: {
        artifact,
      },
    } = req;

    if (!artifact) {
      artifact = req.query.artifact;
    }

    admin.database()
      .ref(`artifacts/${artifact}`)
      .once('value')
      .then((snapshot) => {
        const data = snapshot.val();
        const { user } = data;
        if (!user === req.user.uid) {
          res.status(403).send('Unauthorised');
          return;
        }
        req.artifact = data;
        next();
      })
      .catch(console.error);
  }
);
