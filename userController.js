//const db = require("../Server/db");
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('@hapi/joi');
const multer = require('multer');
const { getConnection } = require("../Server/db");



const schemaRegister = Joi.object({
    Clave_usuario: Joi.string().min(6).max(255).required(),
    email: Joi.string().min(6).max(255).required().email(),
    Password: Joi.string().min(8).max(1024).required(),
})

let db
const getAllRoles = async (req, res) => {
  try {
    db = await getConnection();
    const roles = await db.query('SELECT Clave_usuario, Nombre, ApellidoP, ApellidoM, Rol, email, Status, Telefono, imagen FROM roles');
    res.json(roles);
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
};


const login = async (req, res) => {
  const { Clave_usuario, Password, Rol,Nombre } = req.body;
  console.log(Clave_usuario);
  try {
  // Buscar el usuario por su clave de usuario
    db = await getConnection();
    const sql = 'SELECT Clave_usuario, Nombre, email, password, Rol FROM roles WHERE email = ?';
    const [user] = await db.query(sql, [Clave_usuario]);

    if (!user) {
      ////console.log(Clave_usuario);
      return res.status(401).json({ message: 'No existe usuario'
     });
    }

    const isMatch = await bcrypt.compare(Password, user.password);

    if (!isMatch) {
      //console.log(Password, user.password);
      return res.status(401).json({
        message: 'Contraseña incorrecta',
        usurio:user.Clave_usuario,
        Password: Password,
        storedPassword: user.password
      });
    }
    
    const token = jwt.sign({ userId:user.Clave_usuario, rol:user.Rol, email:user.email }, process.env.token_secret, { expiresIn: '5h' });
    res.json({ message: 'Inicio de sesión exitoso', token, Rol:user.Rol, Clave_usuario:user.Clave_usuario, Nombre:user.Nombre });
  } 
  catch (error) {
    console.error('Error en el inicio de sesión:', error);
    res.status(500).json({ error: 'Error en el inicio de sesión' });
  }
};




const insertRole = async (req, res) => {
  const { Clave_usuario, Nombre, ApellidoP, ApellidoM,Rol, email, Status, Password, Telefono } = req.body;
  //const imagen = req.file.path; // Debes asegurarte de que el nombre 'imagen' coincida con el nombre del campo en el formulario
  const imagen = req.file ? req.file.path : null; // Utiliza null o un valor predeterminado en caso de que no se proporcione una imagen

  if (Password.length < 8) {
    return res.json({ error: true, mensaje: "Debes ingresar correctamente los datos solicitados" });
  }

  try {
    db = await getConnection();
    // Validar si el correo electrónico ya está registrado
    const emailQuery = 'SELECT * FROM roles WHERE email = ?';
    //console.log('Imagen cargada:', imagen);

    db.query(emailQuery, [email], async (emailErr, emailRows) => {
      if (emailErr) {
        console.error('Error al buscar correo electrónico en la base de datos:', emailErr);
        return res.status(500).json({ error: 'Error al buscar correo electrónico en la base de datos' });
      }
      if (emailRows.length > 0) {
        return res.json({ error: true, mensaje: "El correo electrónico ya se encuentra registrado" });
      } else {
        // Validar si el nombre de usuario ya está registrado
        const usernameQuery = 'SELECT * FROM roles WHERE Clave_usuario = ?';
        db.query(usernameQuery, [Clave_usuario], async (usernameErr, usernameRows) => {
          if (usernameErr) {
            console.error('Error al buscar usuario en la base de datos:', usernameErr);
            return res.status(500).json({ error: 'Error al buscar usuario en la base de datos' });
          }
          if (usernameRows.length > 0) {
            return res.json({ error: true, mensaje: "El usuario ya se encuentra registrado" });
          } else {
            // Generar un hash de la contraseña
            const hashedPassword = await bcrypt.hash(Password, 10);

            // Insertar los datos en la base de datos
            const sql = 'INSERT INTO roles (Clave_usuario, Nombre, ApellidoP, ApellidoM, Rol, email, Status, Password, Telefono, imagen) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const values = [Clave_usuario, Nombre, ApellidoP, ApellidoM, Rol, email, Status, hashedPassword, Telefono, imagen];
            //console.log(values);
            db.query(sql, values, (insertErr, result) => {
              if (insertErr) {
                console.error('Error al insertar datos:', insertErr);
                return res.status(500).json({ error: 'Error al insertar datos' });
              }
              res.json({ message: 'Datos insertados exitosamente' });
            });
          }
        });
      }
    });
  } catch (error) {
    console.error('Error al generar hash de contraseña o realizar la validación:', error);
    res.status(500).json({ error: 'Error al generar hash de contraseña o realizar la validación' });
  }
};


const deleteRole = async (req, res) => {
  const roleId = req.params.id; // Obtener el ID del parámetro de la URL

  try {
    db = await getConnection();
    const sql = 'DELETE FROM roles WHERE Clave_usuario = ?';
    const result = await db.query(sql, [roleId]);
    //console.log("resultado",result);
    //console.log('Registro eliminado exitosamente');
    res.json({ message: 'Registro eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar el registro:', error);
    res.status(500).json({ error: 'Error al eliminar el registro' });
  }
};


const updateRole = async (req, res) => {
  const { Clave_usuario, Nombre, ApellidoP, ApellidoM, Rol, email, Status, Password, Telefono } = req.body;
  let imagen = null; 
  if (req.file) {
    imagen = req.file.path;
  } else {
    imagen = req.body.imagen; 
  }
 
  if (Password=='') {
    //console.log("ENTRO A PASSWORD VACIA");
    try {
      db = await getConnection();
      // Generar un nuevo hash de la contraseña
      const sql = `UPDATE roles SET Nombre = ?, ApellidoP = ?, ApellidoM = ?, Rol = ?, email = ?, Status = ?, Telefono = ?, imagen = ? WHERE Clave_usuario = ?`;
      const values = [Nombre, ApellidoP, ApellidoM, Rol, email, Status, Telefono, imagen, Clave_usuario];
  
      db.query(sql, values, (err, result) => {
        if (err) {
          console.error('Error al actualizar datos:', err);
          return res.status(500).json({ error: 'Error al actualizar datos' });
        }
        //console.log('Datos actualizados:', result);
        res.json({ message: 'Datos actualizados exitosamente' });
      });
    } catch (error) {
      console.error('Error al generar hash de contraseña:', error);
      res.status(500).json({ error: 'Error al generar hash de contraseña' });
      }
  } 

  else {
    //console.log("ENTRO A LA QUE TIENE PASSWORD");
    if (Password.length < 8) {
      return res.json({ error: true, mensaje: "Debes ingresar correctamente los datos solicitados" });
    }
  try {
    // Generar un nuevo hash de la contraseña
    const hashedPassword = await bcrypt.hash(Password, 10);
    const sql = `UPDATE roles SET Nombre = ?, ApellidoP = ?, ApellidoM = ?, Rol = ?, email = ?, Status = ?, Password = ?, Telefono = ?, imagen = ? WHERE Clave_usuario = ?`;
    const values = [Nombre, ApellidoP, ApellidoM, Rol, email, Status, hashedPassword, Telefono, imagen, Clave_usuario];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error al actualizar datos:', err);
        return res.status(500).json({ error: 'Error al actualizar datos' });
      }
      //console.log('Datos actualizados:', result);
      res.json({ message: 'Datos actualizados exitosamente' });
    });
  } catch (error) {
    console.error('Error al generar hash de contraseña:', error);
    res.status(500).json({ error: 'Error al generar hash de contraseña' });
    }
  }
}

const BusquedaUsuario = async (req, res) => {
  try {
    db = await getConnection();
    const buscarUsuario = req.params.usuario;
    //console.log(buscarUsuario);
    const query = 'SELECT * FROM roles WHERE Nombre LIKE ?';
    const values = [`%${buscarUsuario}%`]; // Agrega comodines % para buscar coincidencias parciales

    const clientes = await db.query(query, values);
    res.json(clientes);
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
};





module.exports = {
  getAllRoles,
  login,
  insertRole,
  deleteRole,
  updateRole,
  BusquedaUsuario
};

