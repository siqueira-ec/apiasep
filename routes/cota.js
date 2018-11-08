// importação dos módulos
let express = require('express'),
    router = express.Router();
   
// importação dos helpers
let cota_helper = require('../helpers/cotaHelper');

// POST request para gravar novo 'game' (CREATE)
router.get('/:query?', cota_helper.get_cota);

// exporta router
module.exports = router;