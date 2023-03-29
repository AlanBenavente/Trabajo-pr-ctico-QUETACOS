var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var productosModel = require('../models/productosModel');
var cloudinary = require('cloudinary').v2;

/* GET home page. */
router.get('/', async function (req, res, next) {
  var productos = await productosModel.getProductos();

  productos = productos.splice(0, 5);
  productos = productos.map(producto => {
    if (producto.img_id) {
      const imagen = cloudinary.url(producto.img_id, {
        width: 460,
        crop: 'fill'
      });
      return {
        ...producto,
        imagen
      }
    } else {
      return {
        ...producto,
        imagen: '/images/noimage.jpg'
      }
    }
  });
  res.render('index', {
    productos
  });
});

router.post('/', async (req, res, next) => {

  console.log(req.body)

  var nombre = req.body.nombre;
  var apellido = req.body.apellido;
  var email = req.body.email;
  var celular = req.body.celular;
  var mensaje = req.body.mensaje;

  var obj = {
    to: 'alanbenavente02@gmail.com',
    subject: 'Contacto desde la web que tacos',
    html: nombre + " " + apellido + " se contacto a través de la web y quiere mas información a este correo: " + email + ". Ademas, hizo el siguiente comentario: " + mensaje + ". Su celular es " + celular
  } // se cierra var obj

  var transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  }) // cierra transporter

  var info = await transporter.sendMail(obj);

  res.render('index', {
    message: 'Mensaje enviado correctamente',
  });

})   // cierra la peticion del POST






module.exports = router;