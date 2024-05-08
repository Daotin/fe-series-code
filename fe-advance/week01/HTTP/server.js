const http = require('http');

const server = http.createServer((req, res) => {
    let body = [];

    req.on('error', (err) => {
        console.error(err);
    }).on('data', (chunk) => {
        console.log('chunk--->',chunk);
        body.push(chunk.toString());
    }).on('end', () => {
        // body = Buffer.concat(body).toString();
        // body = Buffer.concat(Buffer.from(body)).toString();
        body = body.join();
        console.log('body:', body); //name=Daotin&age=18
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('Hello World\n');
    });
});

server.listen(8080);

console.info('--- server start! ---');