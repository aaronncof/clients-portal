//const db = require("../Server/db");
const { getConnection } = require("../Server/db");

const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const XLSX = require('xlsx');


// Configurar el transportador de correo

let db;
//OBTENER LISTA DE VENDEDORES
const getVendedores = async (req, res) => {
  try {
    db = await getConnection();
    const roles = await db.query('SELECT Clave_usuario, Nombre FROM roles where Rol= "Vendedor" and Status=1');
    res.json(roles);
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
};

//OBTENER LISTA DE CLIENTES
const getClientes = async (req, res) => {
  try {
    db = await getConnection();
    const roles = await db.query('SELECT ID_Cliente, Razon_Social FROM clientes');
    res.json(roles);
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
};

//OBTENER LA CUENTA DE CLIENTES QUE EXISTEN
const getClientesC = async (req, res) => {
  try {
    db = await getConnection();
    const roles = await db.query('select count(*) from clientes');
    res.json(roles);
    //console.log(roles);
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
};

//OBTENER LA CUENTA DE PRODUCTOS QUE EXISTE
const getProductosC = async (req, res) => {
  try {
    db = await getConnection();
    const roles = await db.query('select count(*) from productos');
    res.json(roles);
    //console.log(roles);
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
};

//OBTENER LA CUENTA DE COTIZACIONES QUE EXISTE
const getCotizacionesC = async (req, res) => {
  try {
    db = await getConnection();
    const roles = await db.query('select count(*) from cotizacion');
    res.json(roles);
    //console.log(roles);
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
};

//OBTENER LA CUENTA DE COTIZACIONES A APROBAR QUE EXISTE
const getCotizacionesAprobarC = async (req, res) => {
  try {
    db = await getConnection();
    const roles = await db.query('select count(*) from cotizacion');
    res.json(roles);
    //console.log(roles);
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
};


//INSERTAR COTIZACION SIN APROBACION
const insertCotizacionYProductos = async (req, res) => {
  const { FechaEmision, FechaExpiracion, Clientes_ID_Cliente, Usuario_Clave_usuario, Comentarios, Total, Status, Productos } = req.body; // Asegúrate de incluir los productos en la solicitud
  console.log("datos", req.body);
  try {
    db = await getConnection();
    await db.beginTransaction(); // Iniciar la transacción
    const insertCotizacionSQL = 'INSERT INTO cotizacion (FechaEmision, FechaExpiracion, Clientes_ID_Cliente, Usuario_Clave_usuario, Comentarios, Total, Status) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const cotizacionValues = [FechaEmision, FechaExpiracion, Clientes_ID_Cliente, Usuario_Clave_usuario, Comentarios, Total, Status ];
    // Insertar la cotización
    const cotizacionInsertResult = await db.query(insertCotizacionSQL, cotizacionValues);
    const cotizacionId = cotizacionInsertResult.insertId;
    // Insertar los productos relacionados con la cotización
    for (const producto of Productos) {
      const insertProductoSQL = 'INSERT INTO productos_cotizacion (Productos_NumArticulo, Cotizacion_NumCotizacion, Cantidad, Flete, Precio, VA, Desct, PrecioUnitario, PrecioTotal,Margen, Unidad_Medida) VALUES (?, ?,?,?,?,?,?,?,?,?,?)';
      const productoValues = [producto.Productos_NumArticulo, cotizacionId, producto.Cantidad,producto.Flete, producto.Costo, producto.VA, producto.Desct, producto.PrecioUnitario, producto.PrecioTotal, producto.Margen, producto.Unidad_Medida];
      await db.query(insertProductoSQL, productoValues);
    }

    await db.commit();
    const getCotizacionSQL = 'SELECT * FROM cotizacion WHERE NumCotizacion = ?';
    const cotizacionValues2 = [cotizacionId];
    const cotizacionResult = await db.query(getCotizacionSQL, cotizacionValues2);
    const cotizacion = cotizacionResult[0];
    // Obtén los productos relacionados con la cotización
    const getProductosSQL = 'SELECT *, productos.Descripcion FROM productos_cotizacion INNER JOIN productos ON productos.NumArticulo = productos_cotizacion.Productos_NumArticulo WHERE Cotizacion_NumCotizacion = ?';
    const productosValues = [cotizacionId];
    const productosResult = await db.query(getProductosSQL, productosValues);
    const productos = productosResult;
    // Obtén la Razón Social del cliente
    const getClienteSQL = 'SELECT Razon_Social FROM clientes WHERE ID_Cliente = ?';
    const clienteValues = [Clientes_ID_Cliente];
    const clienteResult = await db.query(getClienteSQL, clienteValues);
    const razonSocialCliente = clienteResult[0].Razon_Social;


    const getDatosU = 'SELECT * FROM roles WHERE Clave_usuario = ?';
    const datosU = await db.query(getDatosU, Usuario_Clave_usuario);
 
    // Envía los datos de la cotización y los productos en la respuesta
    //res.json({ message: 'Datos insertados exitosamente', cotizacion, productos, datosU });
    res.json({ message: 'Datos insertados exitosamente', cotizacion, razonSocialCliente, productos, datosU });
  } catch (error) {
    console.error('Error al insertar datos:', error);
    await db.rollback(); // Si ocurre un error, deshacer la transacción

    res.status(500).json({ error: 'Error al insertar datos' });
  } finally {
  }
};




// OBTENER TODAS LA COTIZACIONES
const getCotizaciones = async (req, res) => {
  try {
    db = await getConnection();
    const roles = await db.query('SELECT cotizacion.NumCotizacion, cotizacion.FechaEmision, cotizacion.FechaExpiracion, cotizacion.Total, cotizacion.Status,  clientes.Razon_Social, roles.Nombre FROM cotizacion INNER JOIN clientes ON clientes.ID_Cliente=cotizacion.Clientes_ID_Cliente INNER JOIN roles ON cotizacion.Usuario_Clave_usuario=roles.Clave_usuario;');
    res.json(roles);
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
};

/*
const getCotizacionesAprobar = async (req, res) => {
  try {
    const roles = await db.query('SELECT cotizacion.NumCotizacion, cotizacion.FechaEmision, cotizacion.FechaExpiracion, cotizacion.Total, cotizacion.Status, clientes.Razon_Social, roles.Nombre FROM cotizacion INNER JOIN clientes ON clientes.ID_Cliente=cotizacion.Clientes_ID_Cliente INNER JOIN roles ON cotizacion.Usuario_Clave_usuario=roles.Clave_usuario WHERE cotizacion.Status="Revisar";');
    res.json(roles);
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
};
*/


// OBTENER LAS COTIZACIONES A APROBAR 
const getCotizacionesAprobar = async (req, res) => {
  const {clave} = req.params; 
  //console.log(clave);
  try {
    db = await getConnection();
    const sql = 'SELECT cotizacion.NumCotizacion, cotizacion.FechaEmision, cotizacion.FechaExpiracion, cotizacion.Total, cotizacion.Status, clientes.Razon_Social, roles.Nombre, aprobacionesc.Aprobador,  aprobacionesc.Comentarios FROM cotizacion INNER JOIN clientes ON cotizacion.Clientes_ID_Cliente = clientes.ID_Cliente INNER JOIN roles ON cotizacion.Usuario_Clave_usuario = roles.Clave_usuario INNER JOIN aprobacionesc ON cotizacion.NumCotizacion = aprobacionesc.NumCotizacion where cotizacion.Status = "Revisar" and aprobacionesc.Aprobador = ?';
    const result = await db.query(sql, [clave]);
    res.json(result);
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
};



//OBTENER LOS DATOS DE LA COTIZACION CON SUS DATOS QUE SE APROBARA
const getDatosCotiAprobar = async (req, res) => {
  const NumCotizacion = req.params.id; // Obtener el ID del parámetro de la URL

  try {
    db = await getConnection();
    const sql = 'SELECT cotizacion.NumCotizacion, cotizacion.FechaEmision, clientes.Razon_Social, roles.Nombre, roles.Clave_usuario, roles.ApellidoP, roles.Rol, roles.email, roles.Telefono, roles.imagen, cotizacion.FechaExpiracion, cotizacion.Total, cotizacion.Clientes_ID_Cliente, cotizacion.Clientes_ID_Cliente, cotizacion.Usuario_Clave_usuario, cotizacion.Comentarios, cotizacion.Status FROM cotizacion INNER JOIN clientes ON clientes.ID_Cliente=cotizacion.Clientes_ID_Cliente INNER JOIN roles ON roles.Clave_usuario=cotizacion.Usuario_Clave_usuario WHERE cotizacion.NumCotizacion = ?;';
    const result = await db.query(sql, NumCotizacion);
    //console.log(result);
    res.json(result);
  } 
  catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
};


//OBTENER LOS DATOS DE LOS PRODUCTOS DE LA COTIZACION QUE SE APROBARA
const getProductosCotiAprobar = async (req, res) => {
  const NumCotizacion = req.params.id; // Obtener el ID del parámetro de la URL

  try {
    db = await getConnection();
    const sql = 'SELECT productos_cotizacion.Cantidad, productos.Descripcion , productos_cotizacion.Flete, productos_cotizacion.Precio, productos_cotizacion.VA, productos_cotizacion.Desct, productos_cotizacion.PrecioUnitario, productos_cotizacion.PrecioTotal, productos_cotizacion.Margen, productos.Descripcion, productos.Unidad_Medida, productos_cotizacion.Productos_NumArticulo FROM productos_cotizacion INNER JOIN productos on productos_cotizacion.Productos_NumArticulo=productos.NumArticulo WHERE productos_cotizacion.Cotizacion_NumCotizacion = ?;';
    const result = await db.query(sql, [NumCotizacion]);
    //console.log(result);
    res.json(result);
  } 
  catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
};


//ACTUALIZAR EL ESTATUS DE LA COTIZACION CUANDO SEA APROBADA Y ENVIAR GMAIL
const updateStatusCotiA = async (req, res) => {
  const { id, Usuario } = req.body;
  //console.log(id, Usuario);

  try {
    db = await getConnection();
    // Actualiza el estado de la cotización en la base de datos
    const sql = 'UPDATE cotizacion SET Status = "Aprobada" WHERE NumCotizacion = ?';
    const result = await db.query(sql, id);
    //console.log('Registro actualizado exitosamente');

    // Consulta la dirección de correo electrónico del usuario
    const getUserEmailQuery = 'SELECT email FROM roles WHERE Clave_usuario = ?';
    const userResult = await db.query(getUserEmailQuery, Usuario);
    const userEmail = userResult[0].email;
    //console.log(userEmail);

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'abcdefg@gmail.com', // Tu dirección de correo
        pass: process.env.pass
            }
    });

    const mailOptions = {
      from: 'abcdefgh@gmail.com',
      to: userEmail,
      subject: 'Cotización Aprobada',
      text:`Tu cotización con numero ${id} ha sido revisada y APROBADA con éxito.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error al enviar el correo electrónico:', error);
        res.status(500).json({ error: 'Error al enviar el correo electrónico' });
      } else {
        //console.log('Correo electrónico enviado:', info.response);
        res.json({ message: 'Registro editado exitosamente y correo electrónico enviado' });
      }
    });
  } catch (error) {
    console.error('Error al actualizar el registro:', error);
    res.status(500).json({ error: 'Error al editar el registro' });
  }
};



//ACTUALIZAR EL ESTATUS DE LA COTIZACION CUANDO SEA RECHAZADA Y ENVIAR CORREO
const updateStatusCotiR = async (req, res) => {
  const { id, Usuario } = req.body;
  //console.log(id, Usuario);

  try {
    db = await getConnection();
    const sql = 'UPDATE cotizacion SET Status = "Rechazada" WHERE NumCotizacion = ?';
    const result = await db.query(sql, id);
    //console.log('Registro actualizado exitosamente');

    // Consulta la dirección de correo electrónico del usuario
    const getUserEmailQuery = 'SELECT email FROM roles WHERE Clave_usuario = ?';
    const userResult = await db.query(getUserEmailQuery, Usuario);
    const userEmail = userResult[0].email;
    //console.log(userEmail);
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'abcdefg@gmail.com', // Tu dirección de correo
        pass: process.env.pass
            }
    });

    const mailOptions = {
      from: 'abcdefgh@gmail.com',
      to: userEmail,
      subject: 'Cotización Rechazada',
      text:`Tu cotización con numero ${id} ha sido revisada y RECHAZADA`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error al enviar el correo electrónico:', error);
        res.status(500).json({ error: 'Error al enviar el correo electrónico' });
      } else {
        //console.log('Correo electrónico enviado:', info.response);
        res.json({ message: 'Registro editado exitosamente y correo electrónico enviado' });
      }
    });
  } catch (error) {
    console.error('Error al actualizar el registro:', error);
    res.status(500).json({ error: 'Error al editar el registro' });
  }
};




//OBTENER LA LISTA DE LOS GERENTES
const getGerentes= async (req, res) => {
  try {
    db = await getConnection();
    const roles = await db.query('SELECT Clave_usuario, Nombre, email FROM roles where Rol= "Gerente de ventas"');
    res.json(roles);
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
};


/*
//INSERTAR COTIZACION Y ENVIAR LA APROBACION A GERENTE DE VENTAS
const EnviarAprobacion = async (req, res) => {
  const { Aprobador, RealizadorCotizacion, FechaEmision, FechaExpiracion, Clientes_ID_Cliente, Usuario_Clave_usuario, Comentarios, Total, Status, Comentarios2, Productos } = req.body;
  try {
    await db.beginTransaction(); // Iniciar la transacción
  
    const insertCotizacionSQL = 'INSERT INTO cotizacion (FechaEmision, FechaExpiracion, Clientes_ID_Cliente, Usuario_Clave_usuario, Comentarios, Total, Status) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const cotizacionValues = [FechaEmision, FechaExpiracion, Clientes_ID_Cliente, Usuario_Clave_usuario, Comentarios, Total, Status ];

    const cotizacionInsertResult = await db.query(insertCotizacionSQL, cotizacionValues);
    const cotizacionId = cotizacionInsertResult.insertId;

    // Insertar los productos relacionados con la cotización
    for (const producto of Productos) {
      const insertProductoSQL = 'INSERT INTO productos_cotizacion (Productos_NumArticulo, Cotizacion_NumCotizacion, Cantidad, Flete, Precio, VA, Desct,PrecioUnitario, PrecioTotal,Margen) VALUES (?, ?,?,?,?,?,?,?,?,?)';
      const productoValues = [producto.Productos_NumArticulo, cotizacionId, producto.Cantidad,producto.Flete, producto.Precio, producto.VA, producto.Desct, producto.PrecioUnitario, producto.PrecioTotal, producto.Margen];
      await db.query(insertProductoSQL, productoValues);
    }

    const sql = 'INSERT INTO aprobacionesC (Aprobador, RealizadorCotizacion, Comentarios, NumCotizacion) VALUES (?, ?, ?, ?)';
    const values = [Aprobador, RealizadorCotizacion, Comentarios2, cotizacionId];
    await db.query(sql, values);

    await db.commit();

    res.json({ message: 'Datos insertados exitosamente', cotizacionId });
  } catch (error) {
    console.error('Error al insertar datos:', error);
    await db.rollback(); // Si ocurre un error, deshacer la transacción
    res.status(500).json({ error: 'Error al insertar datos' });
  } finally {
  }
};

*/


const EnviarAprobacion = async (req, res) => {
  const { Aprobador, RealizadorCotizacion, FechaEmision, FechaExpiracion, Clientes_ID_Cliente, Usuario_Clave_usuario, Comentarios, Total, Status, Comentarios2, Productos } = req.body;
  
  try {
    db = await getConnection();
    await db.beginTransaction(); // Iniciar la transacción
     // Realiza una consulta para obtener el correo del aprobador utilizando la clave de usuario
     const consultaCorreoAprobadorSQL = 'SELECT email FROM roles WHERE Clave_usuario = ?';
     const [resultadoConsulta] = await db.query(consultaCorreoAprobadorSQL, [Aprobador]);
 
     if (resultadoConsulta.length === 0) {
       // Manejar el caso en el que no se encuentra el correo del aprobador
       throw new Error('Correo del aprobador no encontrado');
     }
     //console.log(resultadoConsulta.email);
     const correoAprobador = resultadoConsulta.email;

    const insertCotizacionSQL = 'INSERT INTO cotizacion (FechaEmision, FechaExpiracion, Clientes_ID_Cliente, Usuario_Clave_usuario, Comentarios, Total, Status) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const cotizacionValues = [FechaEmision, FechaExpiracion, Clientes_ID_Cliente, Usuario_Clave_usuario, Comentarios, Total, Status ];

    const cotizacionInsertResult = await db.query(insertCotizacionSQL, cotizacionValues);
    const cotizacionId = cotizacionInsertResult.insertId;

    // Insertar los productos relacionados con la cotización
    for (const producto of Productos) {
      const insertProductoSQL = 'INSERT INTO productos_cotizacion (Productos_NumArticulo, Cotizacion_NumCotizacion, Cantidad, Flete, Precio, VA, Desct,PrecioUnitario, PrecioTotal,Margen) VALUES (?, ?,?,?,?,?,?,?,?,?)';
      const productoValues = [producto.Productos_NumArticulo, cotizacionId, producto.Cantidad,producto.Flete, producto.Costo, producto.VA, producto.Desct, producto.PrecioUnitario, producto.PrecioTotal, producto.Margen];
      await db.query(insertProductoSQL, productoValues);
    }
    
    const sql = 'INSERT INTO aprobacionesC (Aprobador, RealizadorCotizacion, Comentarios, NumCotizacion) VALUES (?, ?, ?, ?)';
    const values = [Aprobador, RealizadorCotizacion, Comentarios2, cotizacionId];
    await db.query(sql, values);

    await db.commit();
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'abcdefg@gmail.com', // Tu dirección de correo
        pass: process.env.pass
            }
    });

    const mailOptions = {
      from: 'CPQ PARAUTOS',
      to:  correoAprobador, 
      subject: 'Nueva cotización para aprobación',
      text:`Tienes una nueva cotización con numero ${cotizacionId} para revisar y aprobar de ${RealizadorCotizacion}
      Comentarios: ${Comentarios2}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Datos insertados exitosamente', cotizacionId });
  } catch (error) {
    console.error('Error al insertar datos:', error);
    await db.rollback(); // Si ocurre un error, deshacer la transacción
    res.status(500).json({ error: 'Error al insertar datos' });
  } finally {
  }
};


const getCotizacionesPorUsuario = async (req, res) => {
  const Clave_usuario = req.params.id; // Obtener el ID del parámetro de la URL
  try {
    db = await getConnection();
    const sql= 'SELECT cotizacion.NumCotizacion, cotizacion.FechaEmision, cotizacion.FechaExpiracion, cotizacion.Total, cotizacion.Status,  clientes.Razon_Social, roles.Nombre FROM cotizacion INNER JOIN clientes ON clientes.ID_Cliente=cotizacion.Clientes_ID_Cliente INNER JOIN roles ON cotizacion.Usuario_Clave_usuario=roles.Clave_usuario WHERE roles.Clave_usuario= ?;';
    const result = await db.query(sql, [Clave_usuario]);
    //console.log(result);
    res.json(result);
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
};


const actualizarCostoDeProductos = async (req, res) => {
  try {
    
    const fileBuffer = req.file.buffer;
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { raw: false});
    //console.log(jsonData);
    const updateQuery = 'UPDATE productos SET Costo = ? WHERE NumArticulo = ?;';

    for (const row of jsonData) {
      const values = [row.Costo, row.NumArticulo];
      //console.log(values);
      await db.query(updateQuery, values);
    }

    res.status(200).json({ message: 'Costo de productos actualizado correctamente' });
  } catch (error) {
    console.error('Error en la carga y procesamiento del archivo:', error);
    res.status(500).json({ error: 'Error en la carga y procesamiento del archivo' });
  }
};




module.exports = {
  getVendedores,
  getClientes,
  getClientesC,
  getProductosC,
  insertCotizacionYProductos,
  getCotizaciones,
  getCotizacionesAprobar,
  getDatosCotiAprobar,
  getProductosCotiAprobar,
  updateStatusCotiA,
  updateStatusCotiR,
  getGerentes,
  EnviarAprobacion,
  getCotizacionesC,
  getCotizacionesAprobarC,
  getCotizacionesPorUsuario,
  actualizarCostoDeProductos 

};

