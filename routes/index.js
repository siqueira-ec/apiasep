// importação dos módulos
let express = require('express'),
    router = express.Router();

// redireciona as requisições para a rota principal
router.get('/', (req, res) => {
    res.json({success: true, data: "Servidor online."});
});

// encaminha tráfego pra rota /iasep
router.use('/iasep', (req, res, next) => {
    next();
}, require('./cota'));

// exporta router
module.exports = router;