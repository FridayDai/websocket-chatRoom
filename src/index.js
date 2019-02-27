/**
 * Created by yi.dai on 2019/2/26.
 */
// https://github.com/websockets/ws
const WebSocket = require('ws');

const wss = new WebSocket.Server({
  port: 65534,
  perMessageDeflate: {
    zlibDeflateOptions: {
      // See zlib defaults.
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    serverMaxWindowBits: 10, // Defaults to negotiated value.
    // Below options specified as default values.
    concurrencyLimit: 10, // Limits zlib concurrency for perf.
    threshold: 1024 // Size (in bytes) below which messages
    // should not be compressed.
  }
});

const msg = {
  'ts': '',
  'ip': '',
  'data': ''
};

wss.on('connection', function connection(ws, req) {
  const ip = req.connection.remoteAddress;

  ws.on('message', function incoming(message) {
    console.log(new Date().toLocaleString() + ' received: %s', message);
    wss.clients.forEach(function (client) {
      // client !== ws &&
      if(client.readyState === WebSocket.OPEN) {
        Object.assign(msg, {'ts': new Date().getTime(), 'ip': ip, 'data': message});

        try {
          client.send(JSON.stringify(msg), function ack(error) {
            if(error) {
              console.error('send [%s] error', JSON.stringify(msg));
              console.error(error);
            } else {
              console.log('send [%s] success', JSON.stringify(msg));
            }
          });
        } catch (e) {
          console.error('Uncaught Exception: ' + e);
        }
      }
    });
  });

  ws.send(JSON.stringify({'ts': new Date().getTime(), 'ip': ip, 'data': ''}));
});

console.log('websocket server is running...');