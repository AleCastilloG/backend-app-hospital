var express = require('express');
var app = express();

var mdAutenticacion = require('../middlewares/autenticacion');

var Hospital = require('../models/hospital');

/**
 * Obtener todos los hospitales
 */
app.get('/', (req, res, next) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email') //populate =>para traer todos los datos de la relación en este caso el de usuario, el segundo es los campos que quieres traer de la relación
        .exec()
        .then(hospitales => {

            Hospital.count({}, (err, conteo) => {

                res.status(200).json({
                    ok: true,
                    hospitales,
                    total: conteo
                });

            });

        }).catch(err => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospitales'
                });
            }
        });
});


/**
 * Obtener Hospital por ID
 */
app.get('/:id', (req, res, next) => {
    let { id } = req.params;

    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec().then(hospital => {

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + ' no existe',
                    errors: {
                        message: 'No existe un hospital'
                    }
                });
            }

            res.status(200).json({
                ok: true,
                hospital
            });

        }).catch(err => {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        });
});

/**
 * Actualizar hospital
 */
app.put('/:id', mdAutenticacion.verificaToken, (req, res, next) => {
    const { id } = req.params;
    const { nombre } = req.body;

    Hospital.findById(id).then(hospitalFind => {

        hospitalFind.nombre = nombre;
        hospitalFind.usuario = req.usuario._id;

        hospitalFind.save().then(hospitalUpdate => {

            res.status(200).json({
                ok: true,
                hospital: hospitalUpdate
            });

        }).catch(err => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }
        });

    }).catch(err => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: `El Hospital con el id ${id} no existe`,
                errors: err
            });
        }
    });
});


/**
 * Crear un hospital
 */
app.post('/', mdAutenticacion.verificaToken, (req, res, next) => {

    const { nombre } = req.body;

    const hospital = new Hospital({ nombre, usuario: req.usuario._id });

    hospital.save().then(hospitalGuardado => {

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });

    }).catch(err => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }
    });

});

/**
 * Borrar un hospital por el id
 */
app.delete('/:id', mdAutenticacion.verificaToken, (req, res, next) => {

    const { id } = req.params;

    Hospital.findByIdAndRemove(id).then(hospitalBorrado => {

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                message: 'No existe un hospital con ese id',
                errors: {
                    message: `No existe el hospital con el id ${id}`
                }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
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