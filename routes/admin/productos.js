var express = require('express');
var router = express.Router();
var productosModel = require('../../models/productosModel');
var util = require('util');
var cloudinary = require('cloudinary').v2;
const uploader = util.promisify(cloudinary.uploader.upload);
const destroy = util.promisify(cloudinary.uploader.destroy);


router.get('/', async function (req, res, next) {

    var productos = await productosModel.getProductos();

    productos = productos.map(producto => {
        if (producto.img_id) {
            const imagen = cloudinary.image(producto.img_id, {
                width: 50,
                height: 50,
                crop: 'fill'
            });
            return {
                ...producto, //titulo, sub y cuerpo
                imagen  //imagen
            }
        } else {
            return {
                ...producto, //titulo, sub y cuerpo
                imagen: ''  //nada
            }
        }
    });

    res.render('admin/productos', {
        layout: 'admin/layout',
        persona: req.session.nombre,
        productos
    });
});

/* para eliminar productos */

router.get('/eliminar/:id', async (req, res, next) => {
    const id = req.params.id;

    let producto = await productosModel.getProductoById(id);
    if (producto.img_id) {
        await (destroy(producto.img_id));
    }

    
    await productosModel.deleteProductosById(id);
    res.redirect('/admin/productos')
}); /*cierra eliminar*/

// diseño de la pagina agregar//

router.get('/agregar', (req, res, next) => {
    res.render('admin/agregar', {
        layout: 'admin/layout'
    });
}); //cierra get agregar

//insertar productos 

router.post('/agregar', async (req, res, next) => {
    try {

        var img_id = '';
        if (req.files && Object.keys(req.files).length > 0) {
            imagen = req.files.imagen,
                img_id = (await uploader(imagen.tempFilePath)).public_id
        }

        if (req.body.titulo != "" && req.body.subtitulo != "" && req.body.cuerpo != "") {
            await productosModel.insertProductos({
                ...req.body,
                img_id
            });
            res.redirect('/admin/productos')
        } else {
            res.render('admin/agregar', {
                layout: 'admin/layout',
                error: true,
                message: '*Todos los campos son requeridos'
            })
        }
    } catch (error) {
        console.log(error)
        res.render('/admin/agregar', {
            layout: 'admin/layout',
            error: true,
            message: 'No se cargo el producto'
        })
    }
})

/* diseño de modificar*/

router.get('/modificar/:id', async (req, res, next) => {
    var id = req.params.id;
    var producto = await productosModel.getProductoById(id);
    res.render('admin/modificar', {
        layout: 'admin/layout',
        producto
    });
});  //cierro get modificar

// actualizacion del producto

router.post('/modificar', async (req, res, next) => {
    try {
        let img_id = req.body.img_original;
        let borrar_img_vieja = false;

        if (req.body.img_delete === "1") {
            img_id = null;
            borrar_img_vieja = true;
        } else {
            if (req.files && Object.keys(req.files).length > 0) {
                imagen = req.files.imagen;
                img_id = (await uploader(imagen.tempFilePath)).public_id;
            }
        }
        if (borrar_img_vieja && req.body.img_original) {
            await (destroy(req.body.img_original));
        }

        var obj = {
            titulo: req.body.titulo,
            subtitulo: req.body.subtitulo,
            cuerpo: req.body.cuerpo,
            img_id
        }

        console.log(obj)
        await productosModel.modificarProductoById(obj, req.body.id);
        res.redirect('/admin/productos');
    } catch (error) {
        console.log(error)
        res.render('admin/modificar', {
            layout: 'admin/layout',
            error: true,
            message: 'No se modifico el producto'

        })
    }
});
// cierro el post modificar

module.exports = router;