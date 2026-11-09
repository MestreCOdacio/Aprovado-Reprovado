const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
    // Utiliza a API moderna de URL do Node.js
    const baseURL = `http://${req.headers.host}`;
    const reqUrl = new URL(req.url, baseURL);

    // Verifica se a rota acessada é /media
    if (reqUrl.pathname === '/media') {
        // Extrai os parâmetros da URL e converte para número
        const p1 = parseFloat(reqUrl.searchParams.get('p1'));
        const p2 = parseFloat(reqUrl.searchParams.get('p2'));

        // Validação básica para garantir que as notas foram passadas corretamente
        if (isNaN(p1) || isNaN(p2)) {
            res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end('Erro: Parâmetros p1 e p2 inválidos ou ausentes. Exemplo: /media?p1=7.5&p2=5.0');
        }

        // Regras de negócio
        const media = (p1 + p2) / 2;
        const aprovado = media >= 6.0;
        
        // Definição do arquivo e da string de situação baseados na média
        const nomeArquivo = aprovado ? 'aprovado.html' : 'reprovado.html';
        const situacao = aprovado ? 'APROVADO' : 'REPROVADO';
        
        // Caminho absoluto para a pasta public
        const filePath = path.join(__dirname, 'public', nomeArquivo);

        // Leitura do arquivo HTML correspondente
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                return res.end('Erro interno do servidor ao carregar a página HTML.');
            }

            // Injeção de dependências: Substitui os marcadores do HTML pelos valores dinâmicos
            const htmlModificado = data
                .replace('{{p1}}', p1.toFixed(1))
                .replace('{{p2}}', p2.toFixed(1))
                .replace('{{media}}', media.toFixed(1))
                .replace('{{situacao}}', situacao);

            // Responde com o HTML processado
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(htmlModificado);
        });
    } else {
        // Tratamento para qualquer outra rota (404)
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Página não encontrada. Acesse http://localhost:3000/media?p1=7.5&p2=5.0');
    }
});

server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Teste Aprovado: http://localhost:${PORT}/media?p1=7.5&p2=5.0`);
    console.log(`Teste Reprovado: http://localhost:${PORT}/media?p1=4.0&p2=5.0`);
});