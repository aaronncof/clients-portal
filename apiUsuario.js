const express = require('express');
const roleController = require('../controllers/userController');
const coti=require('../controllers/cotizacionController')
const productos= require('../controllers/productosControllers')
const cliente=require('../controllers/clientesCotroller')
const router = express.Router();
const token = require('../middlewares/verifyToken')
const multer = require('multer');
const path = require('path');
const upload3 = multer();

const storage2 = multer.memoryStorage();
const upload2 = multer({ storage: storage2 });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Define la carpeta de destino para guardar los archivos
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Define cómo se nombrarán los archivos en el servidor
        // Puedes usar información de la solicitud (req) para personalizar el nombre
        const timestamp = Date.now();
        const ext = file.originalname.split('.').pop(); // Obtiene la extensión del archivo
        const fileExtension = path.extname(file.originalname);
        const newFileName = `img${fileExtension}`;

        cb(null, `${timestamp}.${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedFileTypes = ['.png', '.jpg', '.jpeg', '.webp'];
    if (allowedFileTypes.includes(path.extname(file.originalname).toLowerCase())) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido'));
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024
    },
});


//usuario
router.post('/login', roleController.login);
router.get('/roles', token.verifyToken,  roleController.getAllRoles);
router.post('/nuevoRol', token.verifyToken,  upload.single('imagen'), roleController.insertRole);
router.delete('/delete/rol/:id', token.verifyToken, roleController.deleteRole);
router.put('/update/rol/:id',token.verifyToken,  upload.single('imagen'), roleController.updateRole);
router.get('/get/usuario/:usuario', token.verifyToken, roleController.BusquedaUsuario);



//obtener vendedores y gerentes para cotizacion
router.get('/vendedores', token.verifyToken, coti.getVendedores);
router.get('/gerentes', token.verifyToken, coti.getGerentes);
router.get('/clientes', token.verifyToken, coti.getClientes);


//conteo de clientes, productos y cotizaciones, cotizaciones a aprobar para menu
router.get('/contar/clientes', token.verifyToken, coti.getClientesC);
router.get('/contar/productos', token.verifyToken, coti.getProductosC);
router.get('/contar/cotizaciones', token.verifyToken, coti.getCotizacionesC);
router.get('/contar/cotizaciones-aprobar', token.verifyToken, coti.getCotizacionesAprobarC);


//obtener todos los productos
router.get('/productos',token.verifyToken, productos.getProductos);
router.get('/getImage',token.verifyToken, productos.Imagen);
router.get('/productoD', token.verifyToken, productos.getProductosDesecante);
router.get('/productoH',token.verifyToken,  productos.getProductosHotmelt);
router.get('/productoL', token.verifyToken, productos.getProductosLiquidos);
router.get('/productoP', token.verifyToken, productos.getProductosPlastisol);
router.get('/productoV',  token.verifyToken, productos.getProductosVCI);
router.get('/getImage/:id',  productos.Imagen);

router.post('/nuevo-producto',token.verifyToken, upload3.single('imagen'), productos.insertProducto);



//insertar cotizacion aprobada y para aprobar
router.post('/nuevo/ProdutoYcotizacion', token.verifyToken, coti.insertCotizacionYProductos);
//para aprobar
router.post('/enviar/aprobacion', token.verifyToken,  coti.EnviarAprobacion);

//obtener todas la cotizaciones
router.get('/cotizaciones', token.verifyToken, coti.getCotizaciones);
//obtener datos de la cotizacion a aprobar
router.get('/cotizaciones-aprobar/:clave', token.verifyToken, coti.getCotizacionesAprobar);
router.get('/Datos-cotizacion-aprobar/:id', token.verifyToken, coti.getDatosCotiAprobar);
router.get('/productos-cotizacion-aprobar/:id', token.verifyToken, coti.getProductosCotiAprobar);

router.get('/cotizacion-usuario/:id', token.verifyToken, coti.getCotizacionesPorUsuario);



//cambiar estatus de cotizacion a aprobada
router.put('/aprobacion', token.verifyToken, coti.updateStatusCotiA);
//cambiar estatus de cotizacion a rechazada
router.put('/cotizacion/rechazada', token.verifyToken, coti.updateStatusCotiR);

router.get('/contar/cotizaciones', token.verifyToken, productos.getCuentaCotizaciones);


//obtener venta guiada 
router.post('/venta/guiada/desecantes', token.verifyToken, productos.ventaguiadaD)
router.post('/venta/guiada/liquidos', token.verifyToken, productos.ventaguiadaL)
router.post('/venta/guiada/hotmelt', token.verifyToken, productos.ventaguiadaH)
router.post('/venta/guiada/plastisol', token.verifyToken, productos.ventaguiadaP)
router.post('/venta/guiada/vci', token.verifyToken, productos.ventaguiadaV)

//gestion de cliente
router.post('/nuevo-cliente', token.verifyToken, cliente.insertCliente)
router.get('/todos-clientes',  token.verifyToken, cliente.getAllClientes);
router.delete('/delete/cliente/:id', token.verifyToken, cliente.deleteCliente);
router.put('/update/cliente/:id', token.verifyToken, cliente.updateCliente);

router.get('/get/cliente/:razon', token.verifyToken, cliente.BusquedaCliente);


//token
router.get('/token', token.verifyToken );

router.post('/api/upload', upload2.single('file'), coti.actualizarCostoDeProductos );

router.get('/categorias', token.verifyToken, productos.getCategorias);




module.exports = router;