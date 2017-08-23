module.exports = (admin) => (
  (req, res, next) => {
    const {
      body: {
        configuration
      }
    } = req;

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
