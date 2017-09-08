const updateUserCount = (user, firebase) => {
  const ref = firebase.database().ref(`users/${user.uid}`)
  return new Promise((resolve, reject) => {
    ref.once('value', (snapshot) => {
      let {
        downloadCount
      } = snapshot.val();

      if (!downloadCount) {
        downloadCount = 0;
      }

      downloadCount++;

      ref.update({
        downloadCount
      }, resolve);
    });
  })
};

module.exports = (firebaseApp) => (
  (request, response) => {
    const {
      artifact: {
        metadata: {
          name,
          size,
        },
      },
      user,
    } = request;

    updateUserCount(user, firebaseApp)
      .catch((error) => {
        response.status(500).end();
      });

    const readStream = firebaseApp.storage().bucket().file(name).createReadStream();

    const downloadName = name.split('/').pop();

    response.setHeader('Content-disposition', 'attachment; filename=' + downloadName);
    response.setHeader('Content-length', size);

    readStream
      .on('error', () => {
        response.status(500).end();
      })
      .on('finish', () => {
        response.status(200).end();
      });

    readStream.pipe(response);
  }
);
