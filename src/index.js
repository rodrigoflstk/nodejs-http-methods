const express = require('express');
const cors = require('cors');

const app = express();
const users = [];
const { v4: uuidv4 } = require('uuid')

app.use(cors());
app.use(express.json());

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users
   .find(user => user.username == username)

  if(!user) {
    return response
     .status(404)
     .json({error: "User not found!"})
  }

  request.user = user;

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.find(user =>
    user.username == username
  );

  if(userExists) {
    return response
     .status(400)
     .json({error: "Username already exists!"});
  }

  const user = {id: uuidv4(), name, username, todos: []}
  
  users.push(user);

  return response
    .status(201)
    .json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodos = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date("2022-05-23")}

  user
   .todos
   .push(newTodos)

  return response
   .status(201)
   .json(newTodos)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id == id);

  if(!todo) {
    return response.status(404).json({error: "You are trying to update a non-existent TODO "})
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(200).json(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params

  const todo = user.todos.find(todo => todo.id == id);

  if(!todo) {
    return response.status(404).json({error: "You are trying to update a non-existent TODO"});
  }

  todo.done = true;

  return response.status(200).json(todo);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  
  const todo = user.todos.find(todo => todo.id == id);

  if(!todo) {
    return response.status(404).json({error: "You are trying to delete a non-existent TODO"});
  }

  user.todos.splice(todo, 1);

  return response.status(204).json(todo);
});

module.exports = app;