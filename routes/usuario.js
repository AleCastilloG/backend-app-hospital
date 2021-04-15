var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');

/**
 * Obtener todos los usuarios
 */
app.get('/', (req, res, next) => {

    let desde = req.query.desde || 0; //parámetro
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role google')
        .skip(desde)
        .limit(5)
        .exec()
        .then(usuarios => {

            Usuario.count({}, (err, conteo) => {

                res.status(200).json({
                    ok: true,
                    usuarios,
                    total: conteo
                });

            });

        }).catch(err => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuario',
                    errors: err
                });
            }
        });
});


/**
 * Actualizar usuario
 */
app.put('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaADMIN_o_MismoUsuario], (req, res, next) => {
    const { id } = req.params;
    const { nombre, email, role } = req.body;

    Usuario.findById(id).then(usuario => {

        usuario.nombre = nombre;
        usuario.email = email;
        usuario.role = role;

        usuario.save().then(usuarioActualizado => {

            usuarioActualizado.password = ':)';
            res.status(200).json({
                ok: true,
                usuario: usuarioActualizado
            });

        }).catch(err => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: ' Error al actualizar usuario',
                    errors: err
                });
            }
        });

    }).catch(err => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: `El usuario con el id ${id} no existe`,
                errors: err
            });
        }
    });
});

/**
 * Crear un nuevo usuario
 */
app.post('/', (req, res, next) => {

    const { nombre, email, password, img, role } = req.body;

    const usuario = new Usuario({ nombre, email, password: bcrypt.hashSync(password, 10), img, role });

    usuario.save().then(usuarioGuardado => {
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    }).catch(error => {
        if (error) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: error
            });
        }
    });
});

/**
 * Borrar un usuario por el id
 */
app.delete('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaADMIN_ROLE], (req, res, next) => {
    const { id } = req.params;

    Usuario.findByIdAndRemove(id).then(usuarioBorrado => {

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                errors: {
                    message: `No existe un usuario con el id ${id}`
                }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    }).catch(err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }
    });
});

module.exports = app;