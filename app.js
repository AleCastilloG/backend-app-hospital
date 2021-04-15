// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// case sensitive ->distingue mayúsculas y minúsculas

// Inicializar variables
var app = express();

// CORS
app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept'
	);
	res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
	next();
});

// Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Conexión a la base de datos
// Base de dato local => mongodb://localhost/hospitalDB
mongoose
	.connect(
		'mongodb+srv://alexander:22desetiembre@cluster0.1uktr.mongodb.net/hospitalDB',
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
		}
	)
	.then((res) => {
		console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
	})
	.catch((error) => {
		console.log(error);
		if (err) throw err;
	});

// Importar Rutas
var appRoutes = require('./routes/app');
var usuariosRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');

// Escuchar peticiones
app.listen(process.env.PORT || 3000, () => {
	console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});

// Server index config - solo para comprobar que las imagenes estan públicas
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'));
// app.use('/uploads', serveIndex(__dirname + '/uploads'));

// Escuchar peticiones
app.use('/usuario', usuariosRoutes);
app.use('/login', loginRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/', appRoutes);
