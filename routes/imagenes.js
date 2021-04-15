var express = require('express');
var app = express();

const path = require('path');
const fs = require('fs');

app.get('/:tipo/:img', (req, res, next) => {

    const { tipo, img } = req.params;

    var pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`);

    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);

    } else {
        var pathNoImagen = path.resolve(__dirname, `../assets/no-img.jpg`);
        res.sendFile(pathNoImagen);
    }

    // res.status(200).json({
    //     ok: true,
    //     mensaje: 'Peticion realizada correctamente'
    // });
});

module.exports = app;