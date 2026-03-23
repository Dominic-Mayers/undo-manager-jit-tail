# undo-manager-jit-tail

A history manager that groups minor changes into a single checkpoint just in time, avoiding the creation of too many checkpoints.

---

## 🚀 Live Demo

👉 [https://dominic-mayers.github.io/undo-manager-jit-tail/](https://dominic-mayers.github.io/undo-manager-jit-tail/)

The demo is the best way to understand the module.

Try this:

1. Perform several small changes
2. Press **Undo**
3. Observe that a **single checkpoint is created** for all previous minor changes

The demo also allows switching between:

* **Persistent tails**
* **Ephemeral tails**

---

## 📦 Installation

```bash
npm install undo-manager-jit-tail
```

---

## ⚡ API Overview

```js
import {
  initHist,
  executeHist,
  undoHist,
  redoHist,
  canUndoHist,
  canRedoHist,
  unSyncHist,
  isSyncHist,
  atTail,
  getTailMode,
  getIncomingForwardCommand,
  getOutgoingBackwardCommand,
  getIncomingBackwardCommand,
  getOutgoingForwardCommand,
  getCurrentCommand,
  getPreviousCommand,
  logStateHist,
  undoManager
} from "undo-manager-jit-tail";
```

### Main functions
* `initHist(initialRedoCmd?, tailMode?)` → initialize history
* `executeHist(undo, redo)` → create a checkpoint using (undo, redo).
* `undoHist({initTail})` → navigate history + create tail checkpoint using initTail
* `redoHist()` → navigate history
* `unSyncHist()` → mark history as unsynchronized 
* `isSyncHist()` → check synchronization state
* `atTail()` → check if at tail position

---

## 🧠 Core Idea

The module distinguishes between:

* **major changes** → stored as checkpoints
* **minor changes** → accumulated outside history

Instead of creating a checkpoint for every minor change, the module:

* accumulates minor changes
* creates **one checkpoint just in time** when an undo occurs

This preserves some undoability while keeping history compact.

---

## 🔁 Checkpoint Economy

The module helps to reduce the number of checkpoints in two ways:

### 1. Just-in-time checkpointing

Minor changes are grouped into a single checkpoint only when needed (typically on undo).

### 2. Tail normalization (optional)

* Past tails are removed (ephemeral mode). Only one tail checkpoint is kept.

* Past tails are preserved (persistent mode).

---

## 🧩 Synchronization Model

The module maintains a **sync flag**:

* `sync = true` → visible state matches history
* `sync = false` → state has diverged (minor changes)

The application must explicitly declare desynchronization:

```js
unSyncHist();
```

Synchronization is restored by:

* `initHist`
* `executeHist`
* `undoHist`
* `redoHist`

---

## ⚙️ Role of the Application

The module does not manage application state directly.

The application is responsible for:

* defining commands
* executing them
* deciding when to call `unSyncHist()`

Advanced usage may require understanding:

* `getIncomingForwardCommand()`
* `getOutgoingBackwardCommand()`
* `getIncomingBackwardCommand()`
* `getOutgoingForwardCommand()`

to construct appropriate checkpoint commands.

---

## 📊 Conceptual Model

These getters are defined relative to the current semantic checkpoint, 
not necessarily the raw checkpoint at the current history index.

```
 Incoming forward                      Outgoing forward
 aka: Incoming redo   ┌─────────────┐  aka: Outgoing redo
────────────────────► │ Current /   │ ──────────────────►
                      │ normalised  │
◄──────────────────── │ checkpoint  │ ◄──────────────────
 Outgoing backward    └─────────────┘  Incoming backward
 aka: Outgoing undo                    aka: Incoming undo
```
---

When a checkpoint is created, the SPA is still at the previous checkpoint.
So the checkpoint pair being constructed is for the next checkpoint.

A common situation is that the incoming-forward command of the current
checkpoint is also the outgoing-backward command, that is, the undo command,
of the checkpoint being created.

If the current checkpoint must be normalized, the raw checkpoint at the current
history index is not the valid semantic checkpoint relative to the checkpoint
being created. You do not need to handle that manually: it is already taken
into account by getIncomingForwardCommand(), getOutgoingBackwardCommand(),
and the other semantic getters.

---

## 🔮 Future Work

### Tail creation before major operations

Currently:

* tail checkpoints are created only before undo

Possible extension:

* also create a tail checkpoint before major operations

This would:

* preserve minor changes across major boundaries
* improve recoverability of intermediate states

This behavior could be exposed as an optional mode.

---

## 📄 License

ISC

