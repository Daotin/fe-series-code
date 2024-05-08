var net = require('net');
var images = require("images");
var parser = require('./parser');
var render = require('./render');

class Request {
    constructor(option) {
        this.method = option.method || 'GET';
        this.host = option.host;
        this.port = option.port || '80';
        this.path = option.path || '/';
        this.body = option.body || {};
        this.headers = option.headers || {};

        if (!this.headers['Content-Type']) {
            this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        if (this.headers['Content-Type'] === 'application/json') {
            this.bodyText = JSON.stringify(this.body);
        } else if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
            this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&')
        }

        this.headers['Content-Length'] = this.bodyText.length;
    }

    // 把请求发送到node服务器server.js
    send(connection) {
        return new Promise((resolve, reject) => {
            // 创建一个处理响应数据的类ResponseParser
            const parser = new ResponseParser;
            
            // 判断当前使用有TCP连接，如果有直接发送，如果没有新创建一个连接
            if (connection) {
                // 由于HTTP协议是文本型协议，所有传输的内容均为字符串
                connection.write(this.reqDatatoString());
            } else {
                connection = net.createConnection({
                    host: this.host,
                    port: this.port
                }, () => {
                    console.log(this.reqDatatoString());
                    connection.write(this.reqDatatoString());
                });
            }

            // 如果服务器有返回消息，会触发data事件
            connection.on('data', (data) => {
                // 下面是拿到data的示例内容：
                /*
                    HTTP/1.1 200 OK
                    Content-Type: text/html
                    Date: Wed, 14 Apr 2021 15:13:17 GMT
                    Connection: keep-alive
                    Keep-Alive: timeout=5
                    Transfer-Encoding: chunked

                    c
                    Hello World

                    0
                */
                // console.log(data.toString());
                parser.receive(data.toString());

                // parser处理字符串完成
                if (parser.isFinished) {
                    resolve(parser.response);
                    connection.end();
                }
            });

            connection.on('error', (err) => {
                reject(err)
                connection.end();
            });
        });
    }

    reqDatatoString() {
        return `${this.method} ${this.path} HTTP/1.1\r\n${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}\r\n\r\n${this.bodyText}`;
    }
}

/**
 * 处理响应数据的类，把收到的断断续续的数据，整合成一个完整的数据包
 */
class ResponseParser {
    constructor() {
        /**
         * 使用常量表示接收到响应数据的进度状态
         * 换行时\r\n
         * 接收到\r进入下一状态，\n也是一样
         */
        this.WAITING_STATUS_LINE = 0; // 处在等待状态行状态（接收到\r进入WAITING_STATUS_LINE_END状态）
        this.WAITING_STATUS_LINE_END = 1; // 接收到状态行后面的\r,处在等待\n状态 （接收到\n进入WAITING_HEADER_NAME状态)

        this.WAITING_HEADER_NAME = 2; // 等待响应头key
        this.WAITING_HEADER_SPACE = 3; // 等待响应头key和value中间的空格
        this.WAITING_HEADER_VALUE = 4; // 等待响应头value
        this.WAITING_HEADER_END = 5; // 等待响应头部分接收完毕
        this.WAITING_HEADER_BLOCK_END = 6; //等待响应头与响应正文中间的空行

        this.WAITING_BODY = 7; // 等待响应正文部分

        // 转换后的存放响应数据
        this.current = this.WAITING_STATUS_LINE;
        this.statusLine = '';
        this.headers = {};
        this.headerName = '';
        this.headerValue = '';
    }
    get isFinished() {
        return this.bodyParser && this.bodyParser.isFinished;
    }
    get response() {
        this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/);
        return {
            statusCode: RegExp.$1,
            statusText: RegExp.$2,
            headers: this.headers,
            body: this.bodyParser.content
        }
    }
    receive(string) {
        for (let i = 0; i < string.length; i++) {
            this.receiveChar(string[i]);
        }
        // console.log('-->', this.statusLine);
        // console.log('-->', this.headers);
    }
    // 使用状态机处理
    receiveChar(char) {
        if (this.current === this.WAITING_STATUS_LINE) {
            if (char === '\r') {
                this.current = this.WAITING_STATUS_LINE_END;
            } else {
                this.statusLine += char;
            }
        } else if (this.current === this.WAITING_STATUS_LINE_END) {
            if (char === '\n') {
                this.current = this.WAITING_HEADER_NAME;
            }
        } else if (this.current === this.WAITING_HEADER_NAME) {
            if (char === ':') {
                this.current = this.WAITING_HEADER_SPACE;
            } else if (char === '\r') { // 遇到空行
                this.current = this.WAITING_HEADER_BLOCK_END;
                // 判断响应数据body的类型（这里是chunked格式的body，还会有其他格式的body，这里node默认为chunked格式，至于其他格式暂不处理）
                if (this.headers['Transfer-Encoding'] === 'chunked') {
                    this.bodyParser = new ThunkedBodyParser();
                }
            } else {
                this.headerName += char;
            }
            
        } else if (this.current === this.WAITING_HEADER_SPACE) {
            if (char === ' ') {
                this.current = this.WAITING_HEADER_VALUE;
            }
        } else if (this.current === this.WAITING_HEADER_VALUE) {
            if (char === '\r') {
                this.current = this.WAITING_HEADER_END;
                this.headers[this.headerName] = this.headerValue;
                this.headerName = '';
                this.headerValue = '';
            } else {
                this.headerValue += char;
            }
        } else if (this.current === this.WAITING_HEADER_END) {
            if (char === '\n') {
                this.current = this.WAITING_HEADER_NAME;
            }
        } else if (this.current === this.WAITING_HEADER_BLOCK_END) {
            if (char === '\n') {
                this.current = this.WAITING_BODY;
            }
        } else if (this.current === this.WAITING_BODY) {
            this.bodyParser.receiveChar(char);
        }
    }
}

class ThunkedBodyParser {
    constructor() {
        /** body数据格式如下：
         * 第一行为数据长度，16进制的
         * 第二行开始为数据内容。
         * 当数据长度为0时，body结束。
         * 
           c
           Hello World

           0
         */
        this.WAITING_LENGTH = 0;      // 等待数据长度
        this.WAITING_LENGTH_END = 1;

        this.WAITING_CHUNK = 2;   // 等到body正文

        this.WAITING_NEW_LINE = 3;  // 新的body数据
        this.WAITING_NEW_LINE_END = 4;

        this.current = this.WAITING_LENGTH;
        this.length = 0;
        this.content = '';
        this.isFinished = false;
    }

    receiveChar(char) {
        // 当isFinished被设置为true的时候，实际上后面还要三个字符 \n \r \n，这三个字符可以不用处理直接return掉
        if (this.isFinished) {
            return;
        }
        if (this.current === this.WAITING_LENGTH) {
            if (char === '\r') {
                if (this.length === 0) {
                    this.isFinished = true;
                    return;
                } else {
                    this.current = this.WAITING_LENGTH_END;
                }
            } else {
                this.length *= 16;
                this.length += parseInt(char, 16);
            }
        } else if (this.current === this.WAITING_LENGTH_END) {
            if (char === '\n') {
                this.current = this.WAITING_CHUNK;
            }
        } else if (this.current === this.WAITING_CHUNK) {
            this.content += char;
            this.length--;
            if (this.length === 0) {
                this.current = this.WAITING_NEW_LINE;
            }
        } else if (this.current === this.WAITING_NEW_LINE) {
            if (char === '\r') {
                this.current = this.WAITING_NEW_LINE_END;
            }
        } else if (this.current === this.WAITING_NEW_LINE_END) {
            if (char === '\n') {
                this.current = this.WAITING_LENGTH;
            }
        }
    }
}

void async function () {
    let request = new Request({
        method: 'POST',
        host: '127.0.0.1',
        port: '8081',
        path: '/',
        headers: {
            ['X-Foo2']: 'customed'
        },
        body: {
            name: 'Daotin',
            age: '18'
        }
    });

    let response = await request.send();

    console.log('response:', response);
    
    let dom = parser.parseHTML(response.body);

    let viewport = images(500, 300);
    
    render(viewport, dom);

    viewport.save('viewport.jpg');
}();