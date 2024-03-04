const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const apiRoutes = require('./api/apiUsuario');
const cors = require('cors');
const app = express();
require('dotenv').config();



// Configura CORS
app.use(cors());
app.use(express.json());

app.use(function(req,res,next){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-Width, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  next();

});

app.use(bodyParser.json({ limit: '50mb' })); // Ajusta el límite según tus necesidades

app.use('/api', apiRoutes);
app.use('/uploads', express.static('uploads'));

const port = process.env.PORT || 8080;

if (process.env.ENVIRONMENT === 'development') {
  exports.handler = serverless(app);
} else {
  app.listen(port, () => {
    console.log(`Servidor Express en funcionamiento en el puerto ${port}.`);
  });
}


// const PORT = 3000;
// app.listen(PORT, () => {
//   console.log(`Servidor Express en funcionamiento en el puerto ${PORT}`);
// })

//}