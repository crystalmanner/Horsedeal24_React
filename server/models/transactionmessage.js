'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TransactionMessage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      TransactionMessage.belongsTo(models.File, {foreignKey: 'fileId', targetKey: 'id', as: 'file',});
    }
  };
  TransactionMessage.init({
    transactionUuid: DataTypes.STRING,
    fileId: DataTypes.INTEGER,
    messageUuid: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'TransactionMessage',
  });

  return TransactionMessage;
};
