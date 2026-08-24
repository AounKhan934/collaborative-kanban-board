const { Server } = require("socket.io");
const { registerCardEvents } = require("./events/card");
const { registerBoardEvents } = require("./events/board");

function createSocketServer(httpServer, services) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // tighten this once the real client origin is known
    },
  });

  io.on("connection", (socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    registerBoardEvents(io, socket, services);
    registerCardEvents(io, socket, services);

    socket.on("disconnect", (reason) => {
      console.log(`[socket] disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}

module.exports = { createSocketServer };
