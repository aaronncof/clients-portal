
const mysql = require('mysql2');
const { promisify } = require('util');
require('dotenv').config()

const getConnection = () =>{
    const db = mysql.createConnection({ 
      //port: process.env.DB_PORT,
      host: process.env.HOST,
      user: process.env.USER,
      password: process.env.PASSWORD,
      database: process.env.DATABASE
    });

    db.connect(err => {
      if (err) {
        console.error('Error de conexión a la base de datos:', err);
        return;
      }
      console.log('Conexión exitosa a la base de datos');
    });
    db.query = promisify(db.query);
  return db
  }

module.exports.getConnection = getConnection;

/*
const mysql = require('mysql');
const { promisify } = require('util');
require('dotenv').config();

// Configuración de la conexión a la base de datos
const db = mysql.createConnection({ 
  port: process.env.DB_PORT,
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  multipleStatements: true, // Permite ejecutar múltiples declaraciones en una sola llamada a query
  connectTimeout: 10000, // Tiempo máximo para intentar la conexión (en milisegundos)
});

// Función para manejar la reconexión
const handleDisconnect = () => {
  db.on('error', (err) => {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('Se perdió la conexión con la base de datos. Intentando reconectar...');
      handleDisconnect();
    } else {
      throw err;
    }
  });

  db.connect((err) => {
    if (err) {
      console.error('Error de conexión a la base de datos:', err);
      setTimeout(handleDisconnect, 2000); // Intenta la reconexión después de 2 segundos
    } else {
      console.log('Conexión exitosa a la base de datos');
    }
  });
};

// Llama a la función para manejar la desconexión
handleDisconnect();

// Convierte la función query a una función de promesa
db.query = promisify(db.query);

module.exports = db;
*/