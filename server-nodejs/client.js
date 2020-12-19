var kafka = require('kafka-node');
const io = require('socket.io-client');
const server = require('http').createServer();
const ioServer = require('socket.io')(server);

ioServer.on('connection', (socketServer) => {
    console.log("--------> connect");
    socketServer.on('topic', data => {
        console.log("Get event");
        ioServer.emit('topic', data)
        console.log(data);
    });
    socketServer.on('disconnect', () => { /* … */ });
});
server.listen(5001);

socket = io('http://localhost:5001')
socket.on('topic',data => {
    console.log('node client receive topic',data)
})
var Consumer = kafka.Consumer,
    client = new kafka.KafkaClient({
        kafkaHost: "171.234.204.128:9092"
    }),
    consumer = new Consumer(
        client, [{ topic: 'RESULTS', partition: 0 }], { autoCommit: true });
        consumer.setMaxListeners(11);
consumer.on('message', function (message) {
    var data = message.value;

    socket.emit('topic', data)
});
consumer.on('error', function (err) {
    console.log('Error:', err);
});

