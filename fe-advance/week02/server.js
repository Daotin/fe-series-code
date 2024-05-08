const http = require('http');

const server = http.createServer((req, res) => {
    let body = [];

    req.on('error', (err) => {
        console.error(err);
    }).on('data', (chunk) => {
        body.push(chunk.toString());
    }).on('end', () => {
        body = body.join();
        console.log('request body:', body); //name=Daotin&age=18
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>Document</title>
        <style>
            body div span{
                color: red;
                width: 10px
            }
            #box span{
                color: green;
                width: 20px;
            }
        </style>
    </head>
    <body>
        <div id="box">
            <input />
            <input class='ipt' />    
            <p attr=abc ><span>Hello World</span></p>
        </div>
    </body>
</html>
        `);
    });
});

server.listen(8081);

console.info('--- server start! ---');