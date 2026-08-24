// Tracks, per board: who is currently online, and who is editing which card.
// Kept in memory, keyed by boardId.

const onlineByBoard = new Map(); // boardId -> Map(socketId -> {userId, userName})
const editingByCard = new Map(); // cardId -> Map(socketId -> {userId, userName})

function join(boardId, socketId, user) {
  if (!onlineByBoard.has(boardId)) onlineByBoard.set(boardId, new Map());
  onlineByBoard.get(boardId).set(socketId, user);
  return listOnline(boardId);
}

function leave(boardId, socketId) {
  if (onlineByBoard.has(boardId)) {
    onlineByBoard.get(boardId).delete(socketId);
  }
  return listOnline(boardId);
}

function listOnline(boardId) {
  const map = onlineByBoard.get(boardId);
  if (!map) return [];
  return Array.from(map.values());
}

function startEditing(cardId, socketId, user) {
  if (!editingByCard.has(cardId)) editingByCard.set(cardId, new Map());
  editingByCard.get(cardId).set(socketId, user);
  return listEditing(cardId);
}

function stopEditing(cardId, socketId) {
  if (editingByCard.has(cardId)) {
    editingByCard.get(cardId).delete(socketId);
  }
  return listEditing(cardId);
}

function listEditing(cardId) {
  const map = editingByCard.get(cardId);
  if (!map) return [];
  return Array.from(map.values());
}

// Called on disconnect: clean this socket out of every board/card it touched.
function cleanupSocket(socketId) {
  const affectedBoards = [];
  for (const [boardId, map] of onlineByBoard.entries()) {
    if (map.has(socketId)) {
      map.delete(socketId);
      affectedBoards.push(boardId);
    }
  }
  const affectedCards = [];
  for (const [cardId, map] of editingByCard.entries()) {
    if (map.has(socketId)) {
      map.delete(socketId);
      affectedCards.push(cardId);
    }
  }
  return { affectedBoards, affectedCards };
}

module.exports = {
  join,
  leave,
  listOnline,
  startEditing,
  stopEditing,
  listEditing,
  cleanupSocket,
};
