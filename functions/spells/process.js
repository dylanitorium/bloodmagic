const MysqlExporter  = require('../api/MysqlExporter');

const types = {
  mysql: (admin, configuration) => {
    const exporter = new MysqlExporter(admin, configuration);
    return exporter.export();
  },
};

module.exports = (admin) => (
  (req, res) => {
    const { configExportType } = req.configuration;
    const process = types[configExportType];
    process(admin, req.configuration)
      .then(() => {
        res.status(200).json({ });
      })
      .catch((error) => {
        res.status(500).json(error);
      });
  }
);