var express = require('express');
var app = express();

var mdAutenticacion = require('../middlewares/autenticacion');

var Medico = require('../models/medico');

/**
 * Obtener todos los medicos
 */
app.get('/', (req, res, next) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec()
        .then(medicos => {

            Medico.count({}, (err, conteo) => {

                res.status(200).json({
                    ok: true,
                    medicos,
                    total: conteo
                });

            });

        }).catch(err => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos'
                });
            }
        });
});

/**
 * Obtener Medico
 */
app.get('/:id', (req, res, next) => {
    const { id } = req.params;

    Medico.findById(id)
        .populate('usuario', 'nombre email img')
        .populate('hospital')
        .exec().then(medicoFind => {

            if (!medicoFind) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `El Medico con el id ${id} no existe`,
                    errors: {
                        message: 'No existe un médico con ese ID'
                    }
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoFind
            });

        })
        .catch(err => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar médico',
                    errors: err
                });
            }
        });
});

/**
 * Actualizar medico
 */
app.put('/:id', mdAutenticacion.verificaToken, (req, res, next) => {
    const { id } = req.params;
    const { nombre, hospital } = req.body;

    Medico.findById(id).then(medicoFind => {

        medicoFind.nombre = nombre;
        medicoFind.usuario = req.usuario._id;
        medicoFind.hospital = hospital;

        medicoFind.save().then(medicoUpdate => {
            res.status(200).json({
                ok: true,
                medico: medicoUpdate
            });

        }).catch(err => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }
        });

    }).catch(err => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: `El Medico con el id ${id} no existe`,
                errors: err
            });
        }
    });
});

/**
 * Crear un medico
 */
app.post('/', mdAutenticacion.verificaToken, (req, res, next) => {

    const { nombre, hospital } = req.body;

    const medico = new Medico({ nombre, usuario: req.usuario._id, hospital });

    medico.save().then(medicoGuardado => {

        res.status(200).json({
            ok: true,
            medico: medicoGuardado
        });

    }).catch(err => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear médico',
                errors: err
            });
        }
    });
});

/**
 * Borrar un médico por el id
 */
app.delete('/:id', mdAutenticacion.verificaToken, (req, res, next) => {

    const { id } = req.params;

    Medico.findByIdAndRemove(id).then(medicoBorrado => {

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                errors: {
                    message: `No existe el médico con el id ${id}`
                }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    }).catch(err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar médico',
                errors: err
            });
        }
    });
});


module.exports = app;