'use strict';

let request = require('request'),
    cheerio = require('cheerio'),
    _ = require('lodash');

let uri_padrao = {
    uri: 'http://www.e-saude.iasep.pa.gov.br/segurado_iasep/?do=PortalSegurado.verificaSegurado',
    method: 'POST',
    headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:49.0) Gecko/20100101 Firefox/49.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,en-US;q=0.7,en;q=0.3',
        'Content-Type': 'application/x-www-form-urlencoded',
        'DNT': '1'
    },
    followAllRedirects: true,
    gzip: true,
    jar: true,
    encoding: 'binary'
};

let format_string = (string) => {
    return _.camelCase(string.normalize('NFD').replace(/[\u0300-\u036f]/g, ""));
}

let getCookie = async (cpf, adesao) => {
    let uri = { ... uri_padrao };
    uri.form = {
        'txtCpf': `${cpf}`,
        'txtTermoAdesao': `${adesao}`,
        'do': 'PortalSegurado.verificaSegurado'
    };

    let cookie = await new Promise ((resolve, reject) => {
        request(uri, (err, response, body) => {
            err && console.error(err) && reject(err);

            let cookie = response.req._headers.cookie;
            
            resolve(cookie);
        })
    });

    return cookie;
};

let getCota = async (cookie, format='json') => {
    let uri = { ... uri_padrao };
    let cota;
    uri.form = {
        'do': 'PortalSegurado.extrato'
    };

    uri.method = 'GET';

    uri.headers['Cookie'] = cookie;

    uri.uri = 'http://www.e-saude.iasep.pa.gov.br/segurado_iasep/?do=PortalSegurado.extrato';

    switch (format) {
        case 'text':
            cota = await new Promise((resolve, reject) => {
                request(uri, (err, response, body) => {
                    err && console.error(err) && reject(err);
        
                    let $ = cheerio.load(body);
            
                    if (!($('table').length)) {
                        resolve({success: false, error: "Credenciais incorretas."});
                    } else {
                        let words = [], msg = '';
            
                        $('tr').each(function() {
                            words.push({
                                texto: $(this).text()
                            });
                        });
        
                        let array_infos = {};
                        let obj_cotas = {};
            
                        for (let i=1; i<words.length; i++) {
                            array_infos[i] = (words[i].texto.split(/\n/).filter((e) => {
                                return e.trim().length > 0;
                            })).map(Function.prototype.call, String.prototype.trim);
            
                            msg += array_infos[i][0] + ':' + '\n\t'
                                + 'Qtd. Contratual -> ' + array_infos[i][1] + '\n\t'
                                + 'Qtd. Utilizada -> ' + array_infos[i][2] + '\n\t'
                                + 'Qtd. Estornada -> ' + array_infos[i][3] + '\n\t'
                                + 'Qtd. Disponível -> ' + array_infos[i][4] + '\n\n';
                        }
            
                        msg = $(".form_description h3").text() + '\n\n'
                            + $(".form_description p").text() + '\n\n' + msg;
        
                        resolve({success: true, data: msg});
                    }
                });
            });
            break;
        case 'json':
            cota = await new Promise ((resolve, reject) => {
                request(uri, (err, response, body) => {
                    err && console.error(err) && reject(err);
        
                    let $ = cheerio.load(body);
        
                    if (!($('table').length)) {
                        resolve({success: false, error: "Credenciais incorretas."});
                    } else {
                        let words = [], msg = '';
        
                        $('tr').each(function() {
                            words.push({
                                texto: $(this).text()
                            });
                        });
        
                        let array_infos = {};
                        let obj_cotas = {};
        
                        obj_cotas['saudacao'] = $(".form_description h3").text();
        
                        for (let i=1; i<words.length; i++) {
                            array_infos[i] = (words[i].texto.split(/\n/).filter((e) => {
                                return e.trim().length > 0;
                            })).map(Function.prototype.call, String.prototype.trim);
        
                            obj_cotas[format_string(array_infos[i][0])] = {
                                qtd_contratual: array_infos[i][1],
                                qtd_utilizada: array_infos[i][2],
                                qtd_estornada: array_infos[i][3],
                                qtd_disponivel: array_infos[i][4]
                            }
                        }
        
                        resolve({success: true, data: obj_cotas});
                    }
                });
            });
            break;
        default:
            break;
    }

    return cota;
};

// get 'cota'
exports.get_cota = async (req, res) => {
    let {
        cpf,
        adesao,
        format
    } = req.query;

    let cookie = await getCookie(cpf, adesao);
    let cota = await getCota(cookie, format);

    cota.success && res.json({success: true, data: cota.data});
    !cota.success && res.json({success: false, error: cota.error});

    cota = cookie = cpf = adesao = undefined;
};
