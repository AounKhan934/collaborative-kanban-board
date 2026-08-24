# Socket Event Contract

## Client → Server

### board:join

Purpose:
Join a board room.

Payload:

{
  "boardId": "board-123"
}

Server response:

board:state

---

### card:create

Payload:

{
  "boardId": "board-123",
  "columnId": "column-1",
  "title": "Build login",
  "description": "Create login page"
}

---

### card:update

Payload:

{
  "boardId": "board-123",
  "cardId": "card-123",
  "title": "Updated title",
  "description": "Updated description",
  "version": 3
}

---

### card:move

Payload:

{
  "boardId": "board-123",
  "cardId": "card-123",
  "fromColumnId": "todo",
  "toColumnId": "done",
  "position": 2,
  "version": 4
}

---

### card:delete

Payload:

{
  "boardId": "board-123",
  "cardId": "card-123",
  "version": 5
}

---

### card:editing:start

Payload:

{
  "boardId": "board-123",
  "cardId": "card-123"
}

---

### card:editing:stop

Payload:

{
  "boardId": "board-123",
  "cardId": "card-123"
}

---

## Server → Client

### board:state

{
  "board": {},
  "columns": [],
  "cards": [],
  "version": 12
}

---

### card:created

{
  "card": {},
  "operationId": "..."
}

---

### card:updated

{
  "card": {},
  "operationId": "...",
  "version": 13
}

---

### card:moved

{
  "cardId": "...",
  "columnId": "...",
  "position": 3,
  "version": 14
}

---

### card:deleted

{
  "cardId": "...",
  "version": 15
}

---

### presence:update

{
  "users": []
}

---

### card:editing

{
  "cardId": "...",
  "userId": "...",
  "userName": "..."
}

---

### operation:rejected

{
  "operationId": "...",
  "reason": "VERSION_CONFLICT"
}

---

### board:resync

{
  "boardId": "..."
}
