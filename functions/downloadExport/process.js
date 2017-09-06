module.exports = (firebaseApp) => (
  (request, response) => {
    const {
      artifact: {
        metadata: {
          name,
          size,
        },

      },
    } = request;

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
