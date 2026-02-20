const express = require("express");
const rateLimit = require("express-rate-limit");

const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: "Too many requests, please try again." },
});

app.use(cors());
app.use(express.json());
app.use(limiter);

let todos = [];
let nextId = 1;

function findTodoIndexById(id) {
  return todos.findIndex((t) => t.id === id);
}

app.get("/todos", (req, res) => {
    try{
        return res.status(200).json(todos);
    }catch(error){
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

app.post("/todos", (req, res) => {
    try{
        const body = req.body;

        const items = Array.isArray(body) ? body : [body];

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Request body is required" });
        }

        const createdTodos = [];

        for (const item of items){
            if (!item || typeof item !== "object" || Array.isArray(item)) {
                return res.status(400).json({ message: "must is object" });
            }

            const { title, completed } = item;
            if (!title || typeof title !== "string" || title.trim().length === 0) {
                return res.status(400).json({ message: "title is required" });
            }

            if (completed !== undefined && typeof completed !== "boolean") {
                return res.status(400).json({ message: "completed must be boolean" });
            }

            const newTodo = {
                id: nextId++,
                title: title.trim(),
                completed: completed ?? false,
            };

            todos.push(newTodo);
            createdTodos.push(newTodo);
        }

        const isBatch = Array.isArray(body);

        let results;
        if (isBatch) {
            results = createdTodos;
        } else {
            results = createdTodos[0];
        }

        return res.status(201).json(results);
    }catch(error){
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

app.put("/todos/:id", (req, res) => {
    try{
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ message: "id must be a number" });
        }

        const idx = findTodoIndexById(id);
        if (idx === -1) {
            return res.status(404).json({ message: "Todo not found" });
        }

        const { title, completed } = req.body;

        if (title !== undefined) {
            if (typeof title !== "string" || title.trim().length === 0) {
                return res.status(400).json({ message: "title must be a non-empty string" });
            }
            todos[idx].title = title.trim();
        }

        if (completed !== undefined) {
            if (typeof completed !== "boolean") {
                return res.status(400).json({ message: "completed must be boolean" });
            }
            todos[idx].completed = completed;
        }
        return res.status(200).json(todos[idx]);
    }catch(error){
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

app.delete("/todos/:id", (req, res) => {
    try{
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ message: "id must be a number" });
        }

        const idx = findTodoIndexById(id);
        if (idx === -1) {
            return res.status(404).json({ message: "Todo not found" });
        }

        const deleted = todos.splice(idx, 1)[0];

        return res.status(200).json({ message: "Deleted", deleted });
    }catch(error){
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

app.get("/todos/:id", (req, res) => {
    try{
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({ message: "id must be a number" });
        }

        const todo = todos.find((t) => t.id === id);

        if (!todo) {
            return res.status(404).json({ message: "Todo not found" });
        }

        return res.status(200).json(todo);
    }catch(error){
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

app.listen(port, () => {
    console.log("Starting node.js at port " + port);
});