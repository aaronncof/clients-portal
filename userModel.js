'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserModel = sequelize.define('user', {
    clave: DataTypes.STRING,
    nombre: DataTypes.STRING,
    ApellidoP: DataTypes.STRING,
    ApellidoM: DataTypes.STRING,
    Rol: DataTypes.STRING,
    email: DataTypes.STRING,
    Status: DataTypes.BOOLEAN
  });

  return UserModel;
};
