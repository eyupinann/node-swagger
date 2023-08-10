'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Page extends Model {

    static associate(models) {
      // define association here
    }
  }
  Page.init({
    title: DataTypes.STRING,
    text: DataTypes.STRING,
    image: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Page',
  });
  return Page;
};
