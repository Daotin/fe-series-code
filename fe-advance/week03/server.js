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
                #box {
                    width: 500px;
                    height: 300px; 
                    display: flex;
                    background-color: rgb(255,255,0);
                }
                #box .c1 {
                    width: 100px;
                    height: 100px;
                    background-color: rgb(255,0,0);
                }
                #box .c2 {
                    width: 100px;
                    height: 100px;
                    background-color: rgb(0,255,0);
                }
                #box .c3 {
                    flex: 1;
                    background-color: rgb(0,0,255);
                }
             </style>
        </head>
        <body>
            <div id="box">
                <div class="c1"></div>
                <div class="c2"></div>
                <div class="c3"></div>
            </div>
        </body>
    </html>
        `);
    });
});

server.listen(8081);

console.info('--- server start! ---');