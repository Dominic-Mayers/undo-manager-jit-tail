# undo-manager-jit-tail
[![npm version](https://img.shields.io/npm/v/@dominic.mayers/undo-manager-jit-tail)](https://www.npmjs.com/package/@dominic.mayers/undo-manager-jit-tail)

A history manager for applications where frequent small changes should not
create a large number of undo checkpoints.

It groups multiple minor changes into a single checkpoint **just before an undo occurs**,
keeping history clean and meaningful.

---

## 🚀 Live Demo

👉 **Hello World demo:** https://dominic-mayers.github.io/undo-manager-jit-tail/hello-world-demo.html

---

👉 **Full demo:** https://dominic-mayers.github.io/undo-manager-jit-tail/

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
npm install @dominic.mayers/undo-manager-jit-tail
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
} from "@dominic.mayers/undo-manager-jit-tail";
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

## ⚡ Minimal Example

This module manages **history checkpoints**, not application state itself.

A payload is an application-defined value (most commonly a function)
that represents how to undo or redo a change.

The application defines the payloads stored in history and executes
the payload returned by `undoHist()` or `redoHist()`.

Here is the simplest possible usage:


```js
import {
  initHist,
  executeHist,
  undoHist,
  redoHist
} from "@dominic.mayers/undo-manager-jit-tail";

let value = 0;

function setValue(next) {
  value = next;
  console.log("value =", value);
}

initHist();

// Declare a checkpoint for 0 → 1
executeHist(
  () => setValue(0), // undo payload
  () => setValue(1)  // redo payload
);

// Apply the change in the application
setValue(1);

// Ask history for the undo payload, then execute it
undoHist()?.(); // value = 0

// Ask history for the redo payload, then execute it
redoHist()?.(); // value = 1
```

---

### 🧪 Try it in the browser console

You can run the same example directly in the browser:

1. Open a blank page (`about:blank`)
2. Replace the import line with:

```js
const {
  initHist,
  executeHist,
  undoHist,
  redoHist
} = await import("https://esm.sh/@dominic.mayers/undo-manager-jit-tail@0.1.3");
```

3. Run the rest of the example unchanged

---

### 💡 Notes

* `executeHist(undo, redo)` stores application-defined payloads
* `undoHist()` / `redoHist()` return payloads — they do not execute them
* Payloads are application-defined (functions, snapshots, commands, etc.)

---

## 🧩 Synchronization Model

The module maintains a **synchronization flag**:

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

### 📊 Conceptual Model

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

When you create a checkpoint at tail, that tail might be removed and the index
decremented. In that case, the tail checkpoint is not the valid semantic checkpoint
relative to the new checkpoint being created. You do not need to handle that
manually: it is already taken into account by getIncomingForwardCommand(),
getOutgoingBackwardCommand() and the other semantic getters.

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

