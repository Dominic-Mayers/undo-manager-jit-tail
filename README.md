Here is the updated **README.md**, corrected and ready to paste:

---

# undo-manager-jit-tail

A history manager that groups minor changes into a single checkpoint just in time, avoiding checkpoint spam while preserving undoability.

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
  undoManager,
  getIncomingForwardCommand
} from 'undo-manager-jit-tail';
```

### Main functions

* `initHist(command)` → initialize history
* `executeHist(command)` → apply a command and create a checkpoint
* `undoHist()` / `redoHist()` → navigate history
* `unSyncHist()` → mark state as modified outside history
* `isSyncHist()` → check synchronization state
* `atTail()` → check if at tail position

---

## ⚡ Minimal Example

```js
initHist(initialCommand);

executeHist(commandA);

// minor changes outside history
unSyncHist();

// this will create a tail checkpoint if needed
undoHist();
```

---

## 🧠 Core Idea

The module distinguishes between:

* **major changes** → stored as checkpoints
* **minor changes** → accumulated outside history

Instead of creating a checkpoint for every minor change, the module:

* accumulates minor changes
* creates **one checkpoint just in time** when an undo occurs

This preserves undoability while keeping history compact.

---

## 🔁 Checkpoint Economy

The module implements a **two-stage checkpoint economy**:

### 1. Just-in-time checkpointing

Minor changes are grouped into a single checkpoint only when needed (typically on undo).

### 2. Tail normalization (optional)

Only one meaningful tail checkpoint is kept:

* past tails can be removed (ephemeral mode)
* or preserved (persistent mode)

---

## 🔀 Tail Modes

### Persistent tails

* every generated tail checkpoint remains in history
* history contains all previously created tail checkpoints

### Ephemeral tails

* only the current tail is kept
* past tails are normalized away
* history remains compact

---

## 📊 Conceptual Model

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

* `getCurrentCommand()`
* `getPreviousCommand()`

to construct appropriate checkpoint commands.

---

## 🧠 Key Insight

The module does **not** aim to track every change.

Instead, it ensures that:

> minor changes are preserved when they matter, not when they happen

This results in:

* fewer checkpoints
* clearer history
* preserved undo semantics

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

