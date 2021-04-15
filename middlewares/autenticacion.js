var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

/**
 * Verificar Token
 */

exports.verificaToken = function(req, res, next) {

    const token = req.query.token;

    //example localhost:3000/usuario?token=coloca-tu-token
    //decoded => es el usuario decodificado
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();
        // res.status(200).json({
        //     ok: true,
        //     decoded: decoded
        // });
    });
};


/**
 * Verificar ADMIN
 */

exports.verificaADMIN_ROLE = function(req, res, next) {

    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador',
            errors: {
                message: 'No es administrador, no puede hacer eso'
            }
        });
    }
};

/**
 * Verificar ADMIN o Mismo Usuario
 */

exports.verificaADMIN_o_MismoUsuario = function(req, res, next) {

    var usuario = req.usuario;
    // solo sera utilizando en la actualización del usuario
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador ni es el mismo usuarios',
            errors: {
                message: 'No es administrador, no puede hacer eso'
            }
        });
    }
};