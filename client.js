
const { io } = require("socket.io-client");
const socket = io('http://192.168.1.5:3000', {
    withCredentials: true,
});

socket.on('connect', () => {
    console.log('Soket bağlandı.');

    // Sunucuya bir mesaj gönderelim
    socket.emit('message', 'Merhaba, sunucu!');
});

socket.on('message', (data) => {
    console.log('Alınan mesaj:', data);
});
