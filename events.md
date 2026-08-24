# Socket.IO Event Contract

Rule: any change to this file needs all team members to agree.
Every event name and payload shape below is the source of truth —
do not change a payload without updating this file first.

Room naming: `board:<boardId>` (e.g. `board:123`)

---

## Client → Server

### `board:join`
Join a board room and receive current state + presence.
```json
{ "boardId": "123", "userId": "u1", "userName": "Ali" }
```

### `board:leave`
Leave a board room.
```json
{ "boardId": "123" }
```

### `board:resync`
Ask the server for the full latest state (used after reconnect).
```json
{ "boardId": "123" }
```

### `card:create`
```json
{
  "operationId": "uuid-generated-by-client",
  "boardId": "123",
  "columnId": "todo",
  "title": "New card",
  "description": ""
}
```

### `card:update`
Client must send the version it last saw. Server rejects if stale.
```json
{
  "operationId": "uuid",
  "boardId": "123",
  "cardId": "c1",
  "version": 5,
  "changes": { "title": "New title" }
}
```

### `card:delete`
```json
{
  "operationId": "uuid",
  "boardId": "123",
  "cardId": "c1",
  "version": 5
}
```

### `card:move`
```json
{
  "operationId": "uuid",
  "boardId": "123",
  "cardId": "c1",
  "version": 5,
  "fromColumn": "todo",
  "toColumn": "inprogress",
  "position": 0
}
```

### `card:editing:start` / `card:editing:stop`
```json
{ "boardId": "123", "cardId": "c1", "userId": "u1", "userName": "Ali" }
```

---

## Server → Client

### `board:state`
Sent on `board:join` and `board:resync`. Full snapshot — replace local state entirely.
```json
{
  "boardId": "123",
  "columns": ["todo", "inprogress", "done"],
  "cards": [ { "id": "c1", "title": "...", "columnId": "todo", "position": 0, "version": 3 } ],
  "onlineUsers": [ { "userId": "u1", "userName": "Ali" } ]
}
```

### `card:created` / `card:updated` / `card:deleted` / `card:moved`
Broadcast to everyone in the room (including sender, so sender's optimistic
update gets reconciled with the real server value/version).
```json
{ "operationId": "uuid-or-null-if-not-from-this-client", "card": { "...": "full updated card" } }
```
(`card:deleted` sends `{ "operationId": "...", "cardId": "c1" }` instead of `card`.)

### `presence:update`
Sent whenever someone joins/leaves a board.
```json
{ "boardId": "123", "onlineUsers": [ { "userId": "u1", "userName": "Ali" } ] }
```

### `card:editing`
```json
{ "cardId": "c1", "editingUsers": [ { "userId": "u1", "userName": "Ali" } ] }
```

### `operation:rejected`
Sent ONLY to the client whose operation failed. Frontend uses this to roll
back its optimistic UI change.
```json
{
  "operationId": "uuid",
  "reason": "VERSION_CONFLICT",
  "message": "Card was changed by someone else",
  "latestCard": { "...": "current server version, or null if deleted" }
}
```
Possible `reason` values: `VERSION_CONFLICT`, `CARD_NOT_FOUND`, `INVALID_PAYLOAD`.
