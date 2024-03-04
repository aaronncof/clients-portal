//const db = require("../Server/db");
const { getConnection } = require("../Server/db");

const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//const bcrypt = require('bcrypt');


//const newRole = require('../Models/userModel');

let db;
const getAllClientes = async (req, res) => {
  try {
    db = await getConnection();
    const roles = await db.query('SELECT * FROM clientes');
    res.json(roles);
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
};


const BusquedaCliente = async (req, res) => {
  try {
    db = await getConnection();
    const buscarRazonS = req.params.razon;
    //console.log(buscarRazonS);
    const query = 'SELECT * FROM clientes WHERE Razon_Social LIKE ?';
    const values = [`%${buscarRazonS}%`]; // Agrega comodines % para buscar coincidencias parciales

    const clientes = await db.query(query, values);
    res.json(clientes);
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
};


/*
const insertCliente = async (req, res) => {
  const {ID_cliente, Razon_Social, RFC, Domicilio_Fiscal, email, telefono_empresarial } = req.body;

    const sql = 'INSERT INTO clientes (ID_cliente, Razon_Social, RFC, Domicilio_Fiscal, email, telefono_empresarial ) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [ID_cliente, Razon_Social, RFC, Domicilio_Fiscal, email, telefono_empresarial ];
    //console.log(values);
    db.query(sql, values, (err, result) => {
    if (err) {
        console.error('Error al insertar datos', err);
        return res.status(500).json({ error: 'Error al insertar datos' });
    }
      //console.log('Datos insertados:', result);
      res.json({ message: 'Datos insertados exitosamente' });
    });
 
};
*/


const insertCliente = async (req, res) => {
  const { ID_cliente, Razon_Social, RFC, Domicilio_Fiscal, email, telefono_empresarial } = req.body;

  // Consulta para verificar si el cliente ya existe por ID_cliente
  const checkIDExistenceQuery = 'SELECT COUNT(*) AS count FROM clientes WHERE ID_cliente = ?';
  const checkIDExistenceValues = [ID_cliente];

  // Consulta para verificar si el cliente ya existe por RFC
  const checkRFCExistenceQuery = 'SELECT COUNT(*) AS count FROM clientes WHERE RFC = ?';
  const checkRFCExistenceValues = [RFC];
  db = await getConnection();
  db.query(checkIDExistenceQuery, checkIDExistenceValues, (err, resultID) => {
    if (err) {
      console.error('Error al verificar existencia del cliente por ID_cliente', err);
      return res.status(500).json({ error: 'Error al verificar existencia del cliente por ID_cliente' });
    }

    const existingIDCount = resultID[0].count;
    db.query(checkRFCExistenceQuery, checkRFCExistenceValues, (err, resultRFC) => {
      if (err) {
        console.error('Error al verificar existencia del cliente por RFC', err);
        return res.json({ error: 'Error al verificar existencia del cliente por RFC' });
      }

      const existingRFCCount = resultRFC[0].count;

      if (existingIDCount > 0) {
        // El cliente ya existe por ID_cliente, enviar mensaje de error
        return res.json({ error: 'El usuario con este ID_cliente ya existe', message:'El usuario con este ID_cliente ya existe' });
      }

      if(RFC){
      if (existingRFCCount > 0) {
        // El cliente ya existe por RFC, enviar mensaje de error
        return res.json({ error: 'El usuario con este RFC ya existe', message:'El usuario con este RFC ya existe' });
      }}

      // El cliente no existe, realizar la inserción
      const insertQuery = 'INSERT INTO clientes (ID_cliente, Razon_Social, RFC, Domicilio_Fiscal, email, telefono_empresarial) VALUES (?, ?, ?, ?, ?, ?)';
      const insertValues = [ID_cliente, Razon_Social, RFC, Domicilio_Fiscal, email, telefono_empresarial];

      db.query(insertQuery, insertValues, (err, result) => {
        if (err) {
          console.error('Error al insertar datos', err);
          return res.json({ error: 'Error al insertar datos' });
        }

        //console.log('Datos insertados:', result);
        res.json({ message: 'Datos insertados exitosamente' });
      });
    });
  });
};



const deleteCliente = async (req, res) => {
  const roleId = req.params.id; // Obtener el ID del parámetro de la URL

  try {
    db = await getConnection();
    const sql = 'DELETE FROM clientes WHERE ID_Cliente = ?';
    const result = await db.query(sql, [roleId]);
    //console.log("resultado",result);
    //console.log('Registro eliminado exitosamente');
    res.json({ message: 'Registro eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar el registro:', error);
    res.status(500).json({ error: 'Error al eliminar el registro' });
  }
};


const updateCliente = async (req, res) => {
  const {ID_Cliente, Razon_Social, RFC, Domicilio_Fiscal, email, telefono_empresarial} = req.body;
    // Generar un nuevo hash de la contraseña
    db = await getConnection();
    const sql = `UPDATE clientes SET Razon_Social = ?, RFC = ?, Domicilio_Fiscal = ?, email = ?, telefono_empresarial = ? WHERE ID_Cliente = ?`;
    const values = [Razon_Social, RFC, Domicilio_Fiscal, email, telefono_empresarial, ID_Cliente];
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error al actualizar datos:', err);
        return res.status(500).json({ error: 'Error al actualizar datos' });
      }
      //console.log('Datos actualizados:', result);
      //console.log(values);
      res.json({ message: 'Datos actualizados exitosamente' });
    });
};






module.exports = {
  getAllClientes,
  insertCliente,
  deleteCliente,
  updateCliente,
  BusquedaCliente
};

