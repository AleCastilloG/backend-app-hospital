var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

/*******
 * Búsqueda por colección
 */
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    const { tabla, busqueda } = req.params;
    let regex = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;

        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;

        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;

        default:
            return res.status(400).json({
                ok: true,
                mensaje: 'Los tipos de búsqueda sólo son: usuarios, medicos y hospitales',
                error: {
                    message: 'Tipo de tabla/coleccion no válido'
                }
            });
    }

    /* Para que aparesca el nombre de forma dinámica de la tabla
    incluye ES6, propiedades de objeto computados o procesada
    [nombre_variable]  => el resultado de lo que tenga esa variable
    */
    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });

});

/*******
 * Búsqueda general
 */
app.get('/todo/:busqueda', (req, res, next) => {

    const { busqueda } = req.params;

    //expresion regular
    // /norte/i => i es para que no sea sensible de las mayúsculas y minúsculas
    var regex = new RegExp(busqueda, 'i');

    //varias búsquedas simultaneamente
    Promise.all(
        [
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ]
    ).then(respuestas => {

        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    });

});

function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email img')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email img')
            .populate('hospital')
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

// Búsqueda en 2 columnas (name, email) =>campos
function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role img')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;