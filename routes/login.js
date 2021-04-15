var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

var mdAutenticacion = require('../middlewares/autenticacion');

/**
 * Renovar el TOKEN
 */
app.get('/renuevatoken', mdAutenticacion.verificaToken, (req, res, next) => {

    // Generar un nuevo token
    var token = jwt.sign({ usuario: req.usuario }, SEED, { expiresIn: 14400 });

    res.status(200).json({
        ok: true,
        // usuario: req.usuario,
        token: token
    });
});

/**
 * Autenticación Google
 */
async function verify(token) {

    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    /*jshint sub:true*/
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}

app.post('/google', async(req, res, next) => {

    var token = req.body.token || 'XXX';

    var googleUser = await verify(token).catch(err => {
        return res.status(403).json({
            ok: false,
            mensaje: 'Token no válido'
        });
    });

    Usuario.findOne({ email: googleUser.email }).then(usuarioDB => {

        if (usuarioDB) {

            if (usuarioDB.google === false) {

                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticación normal'
                });

            } else {
                usuarioDB.password = ':)';

                const token = jwt.sign({ usuario: usuarioDB }, SEED, {
                    expiresIn: 14400 // 4horas
                });

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                    menu: obtenerMenu(usuarioDB.role)
                });
            }
        } else {
            // El usuario no existe por correo .. hay que crearlo
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save().then(usuarioDB => {

                const token = jwt.sign({ usuario: usuarioDB }, SEED, {
                    expiresIn: 14400 // 4horas
                });

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                    menu: obtenerMenu(usuarioDB.role)
                });

            }).catch(error => {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al guardar usuario',
                    errors: error
                });
            });
        }

    }).catch(err => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
    });

    // return res.status(200).json({
    //     ok: true,
    //     mesanje: 'OK!!',
    //     googleUser
    // });
});


/**
 * Autenticación Normal
 */
app.post('/', (req, res, next) => {

    const { email, password } = req.body;

    Usuario.findOne({ email: email }).then(usuarioDB => {

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: {
                    message: 'Credenciales incorrectas - email',
                }
            });
        }

        if (!bcrypt.compareSync(password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: {
                    message: 'Credenciales incorrectas - password'
                }
            });
        }

        // Crear un token!!!
        usuarioDB.password = ':)';

        const token = jwt.sign({ usuario: usuarioDB }, SEED, {
            expiresIn: 14400 // 4horas
        });

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id,
            menu: obtenerMenu(usuarioDB.role)
        });

    }).catch(err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
    });

});


function obtenerMenu(ROLE) {

    // puedes hacer un query, para mejor rendimiento
    var menu = [{
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'ProgressBar', url: '/progress' },
                { titulo: 'Gráficas', url: '/graficas1' },
                { titulo: 'Promesas', url: '/promesas' },
                { titulo: 'RxJs', url: '/rxjs' }
            ]
        },
        {
            titulo: 'Mantenimientos',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                // { titulo: 'Usuarios', url: '/usuarios'},
                { titulo: 'Hospitales', url: '/hospitales' },
                { titulo: 'Médicos', url: '/medicos' }
            ]
        }
    ];

    if (ROLE === 'ADMIN_ROLE') {

        menu[1].submenu.unshift({
            titulo: 'Usuarios',
            url: '/usuarios'
        });
    }

    return menu;
}

module.exports = app;