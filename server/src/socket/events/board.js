const presence = require("../presence");
const { roomName } = require("./card");

function registerBoardEvents(io, socket, services) {
  // remember what this socket has joined so we can clean up on disconnect
  socket.data.boardId = null;
  socket.data.user = null;

  socket.on("board:join", (payload = {}) => {
    const { boardId, userId, userName } = payload;
    if (!boardId) return;

    socket.join(roomName(boardId));
    socket.data.boardId = boardId;
    socket.data.user = { userId, userName };

    const onlineUsers = presence.join(boardId, socket.id, { userId, userName });
    const state = services.getBoardState(boardId);

    socket.emit("board:state", { ...state, onlineUsers });
    socket.to(roomName(boardId)).emit("presence:update", { boardId, onlineUsers });
  });

  socket.on("board:leave", (payload = {}) => {
    const boardId = payload.boardId || socket.data.boardId;
    if (!boardId) return;
    leaveBoard(io, socket, boardId);
  });

  socket.on("board:resync", (payload = {}) => {
    const boardId = payload.boardId || socket.data.boardId;
    if (!boardId) return;
    const state = services.getBoardState(boardId);
    const onlineUsers = presence.listOnline(boardId);
    socket.emit("board:state", { ...state, onlineUsers });
  });

  socket.on("card:editing:start", (payload = {}) => {
    const { boardId, cardId, userId, userName } = payload;
    const editingUsers = presence.startEditing(cardId, socket.id, { userId, userName });
    io.to(roomName(boardId)).emit("card:editing", { cardId, editingUsers });
  });

  socket.on("card:editing:stop", (payload = {}) => {
    const { boardId, cardId } = payload;
    const editingUsers = presence.stopEditing(cardId, socket.id);
    io.to(roomName(boardId)).emit("card:editing", { cardId, editingUsers });
  });

  socket.on("disconnect", () => {
    const { affectedBoards, affectedCards } = presence.cleanupSocket(socket.id);
    for (const boardId of affectedBoards) {
      const onlineUsers = presence.listOnline(boardId);
      io.to(roomName(boardId)).emit("presence:update", { boardId, onlineUsers });
    }
    for (const cardId of affectedCards) {
      const editingUsers = presence.listEditing(cardId);
      io.emit("card:editing", { cardId, editingUsers });
    }
  });
}

function leaveBoard(io, socket, boardId) {
  socket.leave(roomName(boardId));
  const onlineUsers = presence.leave(boardId, socket.id);
  io.to(roomName(boardId)).emit("presence:update", { boardId, onlineUsers });
  socket.data.boardId = null;
}

module.exports = { registerBoardEvents };
