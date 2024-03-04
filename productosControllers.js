//const db = require("../Server/db");
const { getConnection } = require("../Server/db");

const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//const bcrypt = require('bcrypt');
const multer = require('multer');
const storage = multer.memoryStorage();


//const newRole = require('../Models/userModel');

/*
const getProductos = async (req, res) => {
  try {
    const productos = await db.query('SELECT * FROM productos');

    productos.forEach(producto => {
      // Supongamos que producto.imagen es un objeto Buffer obtenido de la base de datos
      producto.Imagen = 'data:Image/jpeg;base64,' + producto.Imagen.toString('base64');
    });

    res.json(productos);
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
};
*/

let db;
const getProductos = async (req, res) => {
  try {
    db = await getConnection();
    const roles = await db.query('SELECT * FROM productos');
    res.json(roles);
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
};

const getCuentaCotizaciones = async (req, res) => {
  try {
    db = await getConnection();
    const roles = await db.query('SELECT * FROM cotizacion');
    res.json(roles);
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
};

const getProductosDesecante = async (req, res) => {
  try {
    db = await getConnection();
    const roles = await db.query("SELECT categoria.NombreCategoria, productos.NumArticulo, productos.Descripcion, productos.Unidad_Medida, productos.Imagen, productos.Costo, categoria.CodigoClasificacion FROM categoria INNER JOIN productos ON categoria.CodigoClasificacion=productos.Categoria_CodigoClasificacion and categoria.CodigoClasificacion='DES';");
    res.json(roles);
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
};
const getProductosHotmelt = async (req, res) => {
  try {
    db = await getConnection();
    const roles = await db.query("SELECT categoria.NombreCategoria, productos.NumArticulo, productos.Descripcion, productos.Unidad_Medida, productos.Imagen, productos.Costo, categoria.CodigoClasificacion FROM categoria INNER JOIN productos ON categoria.CodigoClasificacion=productos.Categoria_CodigoClasificacion and categoria.CodigoClasificacion='HOT';");
    res.json(roles);
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
};
const getProductosLiquidos = async (req, res) => {
  try {
    db = await getConnection();
    const roles = await db.query("SELECT categoria.NombreCategoria, productos.NumArticulo, productos.Descripcion, productos.Unidad_Medida, productos.Imagen, productos.Costo, categoria.CodigoClasificacion FROM categoria INNER JOIN productos ON categoria.CodigoClasificacion=productos.Categoria_CodigoClasificacion and categoria.CodigoClasificacion='LIQ';");
    res.json(roles);
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
};
const getProductosPlastisol = async (req, res) => {
  try {
    db = await getConnection();
    const roles = await db.query("SELECT categoria.NombreCategoria, productos.NumArticulo, productos.Descripcion, productos.Unidad_Medida, productos.Imagen, productos.Costo, categoria.CodigoClasificacion FROM categoria INNER JOIN productos ON categoria.CodigoClasificacion=productos.Categoria_CodigoClasificacion and categoria.CodigoClasificacion='PLA';");
    res.json(roles);
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
};

const getProductosVCI = async (req, res) => {
  try {
    db = await getConnection();
    const roles = await db.query("SELECT categoria.NombreCategoria, productos.NumArticulo, productos.Descripcion, productos.Unidad_Medida, productos.Imagen, productos.Costo, categoria.CodigoClasificacion FROM categoria INNER JOIN productos ON categoria.CodigoClasificacion=productos.Categoria_CodigoClasificacion and categoria.CodigoClasificacion='VCI';");
    res.json(roles);
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
};



const Imagen = async (req, res) => {
  const imageId = req.params.id;
  db = await getConnection();
  //console.log(imageId);
  try {
    const result = await db.query('SELECT Imagen FROM productos WHERE NumArticulo = ?', [imageId]);
    console.log(result);
    if (result.length > 0) { 
      res.contentType('Image/png'); // Cambia esto según el tipo de imagen
      res.end(result[0].Imagen, 'binary');
      //console.log("entra");
    } else {
      res.status(404).send('Imagen no encontrada');
    }
  } catch (err) {
    throw err;
    console.log(err);
  }
}


const ventaguiadaD = async (req, res) => {
   const valoresBusqueda = req.body.opcionesSeleccionadas;

  if (!valoresBusqueda || valoresBusqueda.length === 0) {
    return res.status(400).json({ error: 'No se proporcionaron valores de búsqueda.' });
  }

  // Construye la consulta SQL dinámica con un número variable de valores de búsqueda
  const placeholders = valoresBusqueda.map(() => 'Descripcion LIKE ?').join(' AND ');
  const consulta = `SELECT * FROM productos INNER JOIN categoria ON categoria.CodigoClasificacion = productos.Categoria_CodigoClasificacion
  WHERE categoria.CodigoClasificacion = 'DES' AND (${placeholders})
  `;

  // Construye un arreglo de valores de búsqueda con los comodines %
  const valoresConsulta = valoresBusqueda.map((valor) => `%${valor}%`);

  db = await getConnection();
  db.query(consulta, valoresConsulta, (err, resultados) => {
    if (err) {
      console.error('Error en la consulta SQL: ' + err);
      res.status(500).json({ error: 'Error en la consulta SQL' });
    } else {
      res.status(200).json(resultados);
    }
  });
}

const ventaguiadaL = async (req, res) => {
  const valoresBusqueda = req.body.opcionesSeleccionadas;

 if (!valoresBusqueda || valoresBusqueda.length === 0) {
   return res.status(400).json({ error: 'No se proporcionaron valores de búsqueda.' });
 }

 // Construye la consulta SQL dinámica con un número variable de valores de búsqueda
 const placeholders = valoresBusqueda.map(() => 'Descripcion LIKE ?').join(' AND ');
 const consulta = `SELECT * FROM productos INNER JOIN categoria ON categoria.CodigoClasificacion = productos.Categoria_CodigoClasificacion
 WHERE categoria.CodigoClasificacion = 'LIQ' AND (${placeholders})
 `;
 //console.log(consulta);

 // Construye un arreglo de valores de búsqueda con los comodines %
 const valoresConsulta = valoresBusqueda.map((valor) => `%${valor}%`);
 db = await getConnection();
 // Ejecuta la consulta
 db.query(consulta, valoresConsulta, (err, resultados) => {
   if (err) {
     console.error('Error en la consulta SQL: ' + err);
     res.status(500).json({ error: 'Error en la consulta SQL' });
   } else {
     res.status(200).json(resultados);
   }
 });
}

const ventaguiadaH = async (req, res) => {
  const valoresBusqueda = req.body.opcionesSeleccionadas;

 if (!valoresBusqueda || valoresBusqueda.length === 0) {
   return res.status(400).json({ error: 'No se proporcionaron valores de búsqueda.' });
 }

 // Construye la consulta SQL dinámica con un número variable de valores de búsqueda
 const placeholders = valoresBusqueda.map(() => 'Descripcion LIKE ?').join(' AND ');
 const consulta = `SELECT * FROM productos INNER JOIN categoria ON categoria.CodigoClasificacion = productos.Categoria_CodigoClasificacion
 WHERE categoria.CodigoClasificacion = 'HOT' AND (${placeholders})
 `;
 //console.log(consulta);

 // Construye un arreglo de valores de búsqueda con los comodines %
 const valoresConsulta = valoresBusqueda.map((valor) => `%${valor}%`);
 db = await getConnection();
 // Ejecuta la consulta
 db.query(consulta, valoresConsulta, (err, resultados) => {
   if (err) {
     console.error('Error en la consulta SQL: ' + err);
     res.status(500).json({ error: 'Error en la consulta SQL' });
   } else {
     res.status(200).json(resultados);
   }
 });
}

const ventaguiadaP = async (req, res) => {
  const valoresBusqueda = req.body.opcionesSeleccionadas;

 if (!valoresBusqueda || valoresBusqueda.length === 0) {
   return res.status(400).json({ error: 'No se proporcionaron valores de búsqueda.' });
 }

 // Construye la consulta SQL dinámica con un número variable de valores de búsqueda
 const placeholders = valoresBusqueda.map(() => 'Descripcion LIKE ?').join(' AND ');
 const consulta = `SELECT * FROM productos INNER JOIN categoria ON categoria.CodigoClasificacion = productos.Categoria_CodigoClasificacion
 WHERE categoria.CodigoClasificacion = 'PLA' AND (${placeholders})
 `;
 //console.log(consulta);

 // Construye un arreglo de valores de búsqueda con los comodines %
 const valoresConsulta = valoresBusqueda.map((valor) => `%${valor}%`);
 db = await getConnection();
 // Ejecuta la consulta
 db.query(consulta, valoresConsulta, (err, resultados) => {
   if (err) {
     console.error('Error en la consulta SQL: ' + err);
     res.status(500).json({ error: 'Error en la consulta SQL' });
   } else {
     res.status(200).json(resultados);
   }
 });
}

const ventaguiadaV = async (req, res) => {
  const valoresBusqueda = req.body.opcionesSeleccionadas;

 if (!valoresBusqueda || valoresBusqueda.length === 0) {
   return res.status(400).json({ error: 'No se proporcionaron valores de búsqueda.' });
 }

 // Construye la consulta SQL dinámica con un número variable de valores de búsqueda
 const placeholders = valoresBusqueda.map(() => 'Descripcion LIKE ?').join(' AND ');
 const consulta = `SELECT * FROM productos INNER JOIN categoria ON categoria.CodigoClasificacion = productos.Categoria_CodigoClasificacion
 WHERE categoria.CodigoClasificacion = 'VCI' AND (${placeholders})
 `;
 //console.log(consulta);

 // Construye un arreglo de valores de búsqueda con los comodines %
 const valoresConsulta = valoresBusqueda.map((valor) => `%${valor}%`);
 db = await getConnection();
 // Ejecuta la consulta
 db.query(consulta, valoresConsulta, (err, resultados) => {
   if (err) {
     console.error('Error en la consulta SQL: ' + err);
     res.status(500).json({ error: 'Error en la consulta SQL' });
   } else {
     res.status(200).json(resultados);
   }
 });
}


/*

const login = async (req, res) => {
  const { Clave_usuario, Password, Rol } = req.body;

  try {
    // Buscar el usuario por su clave de usuario
    const sql = 'SELECT Clave_usuario, password, Rol FROM roles WHERE Clave_usuario = ?';
    const [user] = await db.query(sql, [Clave_usuario]);

    if (!user) {
      //console.log(Clave_usuario);
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

    const token = jwt.sign({ userId: user.id }, 'secretKey', { expiresIn: '1h' });
    res.json({ message: 'Inicio de sesión exitoso', token, Rol:user.Rol });
  } 

  catch (error) {
    console.error('Error en el inicio de sesión:', error);
    res.status(500).json({ error: 'Error en el inicio de sesión' });
  }
};



const insertRole = async (req, res) => {
  const {Clave_usuario, Nombre, ApellidoP, ApellidoM, Rol, email, Status, Password } = req.body;

  try {
    // Generar un hash de la contraseña
    const hashedPassword = await bcrypt.hash(Password, 10);
    const sql = 'INSERT INTO roles (Clave_usuario, Nombre, ApellidoP, ApellidoM, Rol, email, Status, Password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [Clave_usuario, Nombre, ApellidoP, ApellidoM, Rol, email, Status, hashedPassword];
    //console.log(values);
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error al insertar datos:', err);
        return res.status(500).json({ error: 'Error al insertar datos' });
      }
      //console.log('Datos insertados:', result);
      res.json({ message: 'Datos insertados exitosamente' });
    });
  } catch (error) {
    console.error('Error al generar hash de contraseña:', error);
    res.status(500).json({ error: 'Error al generar hash de contraseña' });
  }
};

const deleteRole = async (req, res) => {
  const roleId = req.params.id; // Obtener el ID del parámetro de la URL

  try {
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
  const { Clave_usuario, Nombre, ApellidoP, ApellidoM, Rol, email, Status, Password } = req.body;

  try {
    // Generar un nuevo hash de la contraseña
    const hashedPassword = await bcrypt.hash(Password, 10);

    const sql = `UPDATE roles SET Nombre = ?, ApellidoP = ?, ApellidoM = ?, Rol = ?, email = ?, Status = ?, Password = ? WHERE Clave_usuario = ?`;
    const values = [Nombre, ApellidoP, ApellidoM, Rol, email, Status, hashedPassword, Clave_usuario];

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
};

*/

const getCategorias = async (req, res) => {
  try {
    db = await getConnection();
    const roles = await db.query('SELECT * FROM categoria');
    res.json(roles);
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
};

/*
const insertProducto = async (req, res) => {
  const { NumArticulo, Descripcion, Codigo_barras, Fabricante, Unidad_medida, Imagen, Categoria_CodigoClasificacion, Costo} = req.body;

  // Consulta para verificar si el producto ya existe por NumArticulo
  const queryBuscar = 'SELECT COUNT(*) AS count FROM productos WHERE NumArticulo = ?';
  const articulo = [NumArticulo];

  db.query(queryBuscar, articulo, (err, result) => {
    if (err) {
      console.error('Error al verificar existencia del producto por NumArticulo', err);
      return res.status(500).json({ error: 'Error al verificar existencia del producto por NumArticulo' });
    }

    const existingCount = result[0].count;

    if (existingCount > 0) {
      // El producto ya existe por NumArticulo, enviar mensaje de error
      return res.json({ error: 'El producto con este NumArticulo ya existe', message: 'El producto con este NumArticulo ya existe' });
    }

    // El producto no existe, realizar la inserción
    const insertQuery = 'INSERT INTO productos ( NumArticulo, Descripcion, Codigo_barras, Fabricante, Unidad_medida, Categoria_CodigoClasificacion, Costo) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const insertValues = [ NumArticulo, Descripcion, Codigo_barras, Fabricante, Unidad_medida, Categoria_CodigoClasificacion, Costo];

    db.query(insertQuery, insertValues, (err, result) => {
      if (err) {
        console.error('Error al insertar datos del producto', err);
        return res.json({ error: 'Error al insertar datos del producto' });
      }

      //console.log('Datos del producto insertados:', result);
      res.json({ message: 'Datos del producto insertados exitosamente' });
    });
  });
};*/


const insertProducto = async (req, res) => {
    const { NumArticulo, Descripcion, Codigo_barras, Fabricante, Unidad_medida, Categoria_CodigoClasificacion, Costo } = req.body;
    let imagen = null;
    if (req.file) {
    if (req.file.buffer) {
      imagen = req.file.buffer;
    } else {
      return res.status(400).send('El archivo no tiene contenido válido');
    }
  }
    
    
    //const imagen = req.file.buffer;
    //console.log(imagen);

    // Consulta para verificar si el producto ya existe por NumArticulo
    const queryBuscar = 'SELECT COUNT(*) AS count FROM productos WHERE NumArticulo = ?';
    const articulo = [NumArticulo];
    db = await getConnection();
    db.query(queryBuscar, articulo, (err, result) => {
      if (err) {
        console.error('Error al verificar existencia del producto por NumArticulo', err);
        return res.status(500).json({ error: 'Error al verificar existencia del producto por NumArticulo' });
      }

      const existingCount = result[0].count;

      if (existingCount > 0) {
        // El producto ya existe por NumArticulo, enviar mensaje de error
        return res.json({ error: 'El producto con este NumArticulo ya existe', message: 'El producto con este NumArticulo ya existe' });
      }

      // El producto no existe, realizar la inserción
      const insertQuery = 'INSERT INTO productos (NumArticulo, Descripcion, Codigo_barras, Fabricante, Unidad_medida, Categoria_CodigoClasificacion, Costo, Imagen) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
      const insertValues = [NumArticulo, Descripcion, Codigo_barras, Fabricante, Unidad_medida, Categoria_CodigoClasificacion, Costo, imagen];

      db.query(insertQuery, insertValues, (err, result) => {
        if (err) {
          console.error('Error al insertar datos del producto', err);
          return res.json({ error: 'Error al insertar datos del producto' });
        }

        //console.log('Datos del producto insertados:', result);
        res.json({ message: 'Datos del producto insertados exitosamente' });
      });
    });
  }



module.exports = {
    getProductos,
    Imagen,
    getProductosDesecante,
    getProductosHotmelt,
    getProductosLiquidos,
    getProductosPlastisol,
    getProductosVCI,
    getCuentaCotizaciones,
    ventaguiadaD,
    ventaguiadaL,
    ventaguiadaH,
    ventaguiadaP,
    ventaguiadaV,
    getCategorias,
    insertProducto
};

