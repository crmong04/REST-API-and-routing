const http = require('http');
const fs = require('fs');

const users = {};

http.createServer((req,res) =>{
    if(req.method ==='GET') {
        if(req.url === '/'){
            return fs.readFile('./restFront.html',(err,data) => {
                if(err){
                    throw err;
                }
                res.end(data);
            });
        } else if(req.url === '/about'){
            return fs.readFile('./about.html', (err,data) => {
                if(err){
                    throw err;
                }
                res.end(data);
            });
        } else if(req.url === '/users'){
            return res.end(JSON.stringify(users));
        }
        return fs.readFile(`.${req.url}`,(err,data) => {
            if(err){
                res.writeHead(404,'NOT FOUND');
                return res.end('NOT FOUND');
            }
            return res.end(data);
        });
    }else if(req.method === 'POST'){
        if(req.url === '/users'){
            let body = '';
            req.on('data', (data) => {
                body += data;
            });
            return req.on('end',() => {
                console.log('POST 본문(Body):',body);
                const {name} = JSON.parse(body);
                const id = +new Date();
                users[id] = name;
                res.writeHead(201);
                res.end('등록 성공');
            });
        }
    } else if (req.method === 'PUT'){
        if(req.url.startsWith('/users/')){
            const key = req.url.split('/')[2];
            let body = '';
            req.on('data',(data) => {
                body += data;
            });
            return req.on('end', () => {
                console.log('PUT 본문(Body):',body);
                users[key] = JSON.parse(body).name;
                return res.end(JSON.stringify(users));
            });
        }
    }else if (req.method === 'DELETE') {
        if(req.url.startsWith('/users/')) {
            const key = req.url.split('/')[2];
            delete users[key];
            return res.end(JSON.stringify(users));
        }
    }
    res.writeHead(404,'NOT FOUND');
    return res.end('NOT FOUND');
})
    .listen(8085, () => {
        console.log('8085번 포트에서 서버 대기 중입니다');
    });

//요청이 어떤 메서드를 사용했는지 req.method로 알 수 있다 
//req.method를 기준으로 if문 처리
//1. GET메서드에서 /,/about 요청 주소는 페이지를 요청 하는 것이므로 HTML 파일을 읽어서 전송한다.
// AJAX요청을 처리하는 /users에서는 users 데이터를 전송한다. JSON 형식으로 보내기 위해 JSON.stringify를 해주었다
//그 외의 GET요청은 CSS 나 JS파일을 요청하는 것이므로 찾아서 보내주고, 없다면 404 NOT FOUND에러를 응답
//2.POST와 PUT 메서드는 크라이언트로부터 데이터를 받으므로 특별한 처리가 필요
//  req.on('data', 콜백)과 req.on('end',콜백) 부분으로 readStream이다
// readStream으로 요청과 같이 들어오는 요청 본문을 받을 수 있다 
// 문자열 이므로 JSON으로 만드는 JSON.parse 과정이 한 번 필요
//3. DELETE 메서드로 요청이 오면 주소에 들어 있는 키에 해당한느 사용자를 제거
//4. 해당하는 주소가 없을 경우 404 NOT FOUND 에러를 응답