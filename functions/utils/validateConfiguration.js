/**
 * Validate that the user owns this configuration
 * @param admin
 */
module.exports = (admin) => (
  (req, res, next) => {
    let {
      body: {
        configuration
      }
    } = req;

    if (!configuration) {
      configuration = req.query.configuration;
    }

    admin.database()
      .ref(`configurations/${configuration}`)
      .once('value')
      .then((snapshot) => {
        const data = snapshot.val();
        const { user } = data;
        if (!user === req.user.uid) {
          res.status(403).send('Unauthorised');
          return;
        }
        req.configuration = data;
        next();
      })
      .catch(console.error);
  }
);
