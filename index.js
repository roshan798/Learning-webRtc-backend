const { Server } = require('socket.io');
const express = require('express')
const app = express();
const PORT = process.env.PORT || 8000;
app.get('/', (req, res) => {
  res.send(`Server is runnig at ${PORT}`);
})
app.listen(PORT, () => {
  console.log("Server is running at port => ", PORT);
})

const io = new Server(PORT, {
  cors: true
});

const EmailtoSocketIdMap = new Map();
const SocketIdtoEmailMap = new Map();

io.on('connection', (socket) => {

  socket.on("room:join", (data) => {
    const { email, room } = data;
    EmailtoSocketIdMap.set(email, socket.id);
    SocketIdtoEmailMap.set(socket.id, email);
    io.to(room).emit("user:joined", {
      email,
      id: socket.id
    });
    socket.join(room);
    io.to(socket.id).emit('room:join', data);
  });

  socket.on('user:call', ({ to, offer }) => {
    io.to(to).emit('incomming:call', { from: socket.id, offer });
  });

  socket.on('call:accepted', ({ to, ans }) => {
    io.to(to).emit('call:accepted', { from: socket.id, ans });
  });

  socket.on('peer:nego:needed', ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on('peer:nego:done', ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});
