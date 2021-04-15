var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs'); //para eliminar archivos, viene ya integrado(file system)

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());


/**
 * tipo => usuarios | hospitales | medicos
 * id => id del usuario(tipo) que quiero actualizar
 */
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de colección
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            errors: {
                message: 'Tipo de colección no es válida'
            }
        });
    }

    if (!req.files) {

        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: {
                message: 'Debe de seleccionar una imagen'
            }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Sólo estas extensiones aceptamos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no válida',
            errors: {
                message: 'Las extensiones válidas son ' + extensionesValidas.join(', ')
            }
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${id}-${ new Date().getMilliseconds() }.${extensionArchivo}`;

    // Mover el archivo del temporal a un path
    var path = `./uploads/${ tipo }/${nombreArchivo}`;
    archivo.mv(path, err => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

    });

});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id).then(usuarioFind => {

            const pathViejo = './uploads/usuarios/' + usuarioFind.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuarioFind.img = nombreArchivo;
            usuarioFind.save().then(usuarioUpdate => {

                usuarioUpdate.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioUpdate
                });

            }).catch(err => {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al guardar usuario',
                    errors: err
                });
            });

        }).catch(err => {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        });
    }

    if (tipo === 'medicos') {

        Medico.findById(id).then(medicoFind => {
            const pathViejo = './uploads/medicos/' + medicoFind.img;

            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            medicoFind.img = nombreArchivo;
            medicoFind.save().then(medicoUpdate => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de médico actualizada',
                    medico: medicoUpdate
                });

            }).catch(err => {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al guardar médico',
                    errors: err
                });
            });

        }).catch(err => {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar médico',
                errors: err
            });
        });
    }

    if (tipo === 'hospitales') {

        Hospital.findById(id).then(hospitalFind => {
            const pathViejo = './uploads/hospitales/' + hospitalFind.img;

            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            hospitalFind.img = nombreArchivo;
            hospitalFind.save().then(hospitalUpdate => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalUpdate
                });

            }).catch(err => {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al guardar hospital',
                    errors: err
                });
            });

        }).catch(err => {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        });
    }
}

module.exports = app;