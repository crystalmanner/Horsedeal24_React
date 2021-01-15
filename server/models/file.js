'use strict';
const {
  Model,
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class File extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      File.hasOne(models.TransactionMessage, {
        foreignKey: 'id',
        targetKey: 'fileId',
        as: 'transactionMessage',
      });
    }
  };
  File.init({
    name: DataTypes.STRING,
    fileName: DataTypes.STRING,
    mimeType: DataTypes.STRING,
    disk: DataTypes.STRING,
    size: DataTypes.INTEGER,
    path: DataTypes.STRING,
    url: {
      type: DataTypes.VIRTUAL,
      get() {
        const host = process.env.S3_URL;

        return host + '/' + this.path;
      },
    },
  }, {
    sequelize,
    modelName: 'File',
  });
  return File;
};
