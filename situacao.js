const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;

let browserInstance;
let pageInstance;

(async () => {
    browserInstance = await puppeteer.launch({
        headless: false
    });
    pageInstance = await browserInstance.newPage();
     pageInstance.goto('https://www.situacao-cadastral.com/');
})();

app.get('/consulta-cpf/:cpf', async (req, res) => {
    const cpf = req.params.cpf;

    try {
        const nome = await consultaCPF(cpf);
        res.json({ nome });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao consultar CPF' });
    }
});

app.get('/', async (req, res) => {
    res.json("Ola mundo");
});

const consultaCPF = async (cpf) => {

    await pageInstance.type('input[name="doc"]', cpf);
    await pageInstance.keyboard.press('Enter');
    await pageInstance.waitForSelector('#atencao');
    await pageInstance.waitForSelector('span.dados.nome');
    const nome = await pageInstance.$eval('span.dados.nome', span => span.textContent.trim());

    await pageInstance.waitForSelector('#btnVoltar', { visible: true, timeout: 10000 }); // Espera até 5 segundos e verifica se o elemento está visível

    // Clique no botão de envio após resolver o hCaptcha
    await pageInstance.click('#btnVoltar');

    return nome;
};

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
