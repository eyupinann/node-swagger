const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');
const dbConfig = require('./server');
const { verifyToken } = require('./auth');
const usersRouter = require('./app');
const loginRouter = require('./login');
const  pageRouter = require('./controller/page.js');
const  testRouter = require('./controller/test');
const  pushRouter = require('./controller/push');
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_output.json')
const app = express();
const server = createServer(app);
const cors = require('cors');
const {Page} = require("./models");
const PageResource = require("./resource/PageResource");
const io = new Server(server);


const pool = new Pool(dbConfig);

app.use(cors());
app.use(express.json());


app.use('/pages', pageRouter);
app.use('/tests', testRouter);
app.use('/users', usersRouter);
app.use('/login' ,loginRouter);
app.use('/push', pushRouter);

app.use('/images/uploads', express.static('images/uploads'));

app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))





io.on('connection', (socket) => {
    console.log('Yeni bir soket bağlantısı oluşturuldu.');
    sendUsers();
    sendPages();

    socket.on('disconnect', () => {
        console.log('Soket bağlantısı kapandı.');
    });
});

const sendUsers = () => {
    pool.query('SELECT * FROM users', (err, result) => {
        if (err) {
            console.error('Kullanıcıları getirirken hata oluştu:', err);
        } else {
            const users = result.rows;
            io.emit('users', users);
        }
    });
};

const sendPages = () => {
    Page.findAll()
        .then((pages) => {
            const pageData = pages.map((page) => new PageResource(page));
            io.emit('pages', pageData);
        })
        .catch((error) => {
            console.error('Sayfaları getirirken hata oluştu:', error);;
        });
}

setInterval(sendUsers,100);
setInterval(sendPages,100);

server.listen(3000, () => {
    console.log('Socket.io server çalışıyor, port: 3000');
});
