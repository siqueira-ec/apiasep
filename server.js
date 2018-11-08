// importação dos módulos a serem utilizados
const express = require("express"),
    bodyParser = require("body-parser"),
    app = express(),
    swaggerUi = require('swagger-ui-express'),
    swaggerDocument = require('./swagger.json');

// json identado com 0 espaços
app.set('json spaces', 0);

// ativando e configurando middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// importa rotas do Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// importa rotas do sistema
app.use(require('./routes'));

// pega erro 404 e trata
app.use((req, res, next) => {
    let err = new Error('Página não encontrada.');
    err.status = 404;
    next(err);
});

// configura o servidor para iniciar na porta designada pela máquina
// porta padrão é a :3000
let server = app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor da API iniciado na porta: %s", server.address().port);
});