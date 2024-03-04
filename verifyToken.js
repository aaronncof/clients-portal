const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Acceso denegado, token no proporcionado' });
  }

  const token = authHeader.replace('Bearer ', ''); // Eliminar 'Bearer ' del encabezado
  //console.log(token);
  try {
    const decoded = jwt.verify(token, process.env.token_secret);
    //console.log('Token Decoded:', decoded);

    req.user = decoded;
    next();
  } catch (error) {
    //console.error('Error Verifying Token:', error);
    res.status(401).json({ message: 'Token no válido' });
  }
};

module.exports = {
  verifyToken,
};
