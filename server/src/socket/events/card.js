function roomName(boardId) {
  return `board:${boardId}`;
}

function registerCardEvents(io, socket, services) {
  socket.on("card:create", (payload = {}) => {
    const { operationId, boardId, columnId, title, description } = payload;
    if (!boardId || !columnId) {
      socket.emit("operation:rejected", {
        operationId,
        reason: "INVALID_PAYLOAD",
        message: "boardId and columnId are required",
        latestCard: null,
      });
      return;
    }
    const card = services.createCard(boardId, { columnId, title, description });
    io.to(roomName(boardId)).emit("card:created", { operationId, card });
  });

  socket.on("card:update", (payload = {}) => {
    const { operationId, boardId, cardId, version, changes } = payload;
    const result = services.updateCard(boardId, cardId, version, changes || {});
    handleWriteResult(io, socket, roomName(boardId), "card:updated", operationId, result);
  });

  socket.on("card:delete", (payload = {}) => {
    const { operationId, boardId, cardId, version } = payload;
    const result = services.deleteCard(boardId, cardId, version);
    if (result.error) {
      socket.emit("operation:rejected", {
        operationId,
        reason: result.error,
        message: describeError(result.error),
        latestCard: result.latestCard || null,
      });
      return;
    }
    io.to(roomName(boardId)).emit("card:deleted", { operationId, cardId });
  });

  socket.on("card:move", (payload = {}) => {
    const { operationId, boardId, cardId, version, fromColumn, toColumn, position } = payload;
    const result = services.moveCard(boardId, cardId, version, { fromColumn, toColumn, position });
    handleWriteResult(io, socket, roomName(boardId), "card:moved", operationId, result);
  });
}

function handleWriteResult(io, socket, room, successEvent, operationId, result) {
  if (result.error) {
    socket.emit("operation:rejected", {
      operationId,
      reason: result.error,
      message: describeError(result.error),
      latestCard: result.latestCard || null,
    });
    return;
  }
  io.to(room).emit(successEvent, { operationId, card: result.card });
}

function describeError(code) {
  if (code === "VERSION_CONFLICT") return "Card was changed by someone else — refresh and retry";
  if (code === "CARD_NOT_FOUND") return "Card no longer exists (it may have been deleted)";
  return "Invalid request";
}

module.exports = { registerCardEvents, roomName };
