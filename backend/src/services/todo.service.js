const { getDB } = require('../db/db');
const { ObjectId } = require('mongodb');

async function getTodos(userEmail) {
  const db = getDB();
  const usersCollection = db.collection('users');
  
  const user = await usersCollection.findOne({ email: userEmail });
  return user ? user.todos || [] : [];
}

async function addTodo(userEmail, title) {
  const db = getDB();
  const usersCollection = db.collection('users');
  
  const newTodo = { _id: new ObjectId(), title, completed: false };

  const user = await usersCollection.findOne({ email: userEmail });

  if (!user) {
    await usersCollection.insertOne({
      email: userEmail,
      name: '', // You can add name on signup
      todos: [newTodo]
    });
  } else {
    await usersCollection.updateOne(
      { email: userEmail },
      { $push: { todos: newTodo } }
    );
  }

  return newTodo;
}

async function updateTodo(userEmail, todoId, completed, title) {
  const db = getDB();
  const usersCollection = db.collection('users');

  const user = await usersCollection.findOne({ email: userEmail });
  if (!user) return null;

  const todos = user.todos.map(todo => {
    if (todo._id.toString() === todoId) {
      return {
        ...todo,
        ...(completed !== undefined ? { completed } : {}),
        ...(title !== undefined ? { title } : {})
      };
    }
    return todo;
  });

  await usersCollection.updateOne(
    { email: userEmail },
    { $set: { todos } }
  );

  return todos.find(todo => todo._id.toString() === todoId);
}

async function markAllCompleted(userEmail) {
  const db = getDB();
  const usersCollection = db.collection('users');

  const user = await usersCollection.findOne({ email: userEmail });
  if (!user) return 0;

  const updatedTodos = user.todos.map(todo => ({
    ...todo,
    completed: true
  }));

  await usersCollection.updateOne(
    { email: userEmail },
    { $set: { todos: updatedTodos } }
  );

  return updatedTodos.length;
}

async function deleteTodo(userEmail, todoId) {
  const db = getDB();
  const usersCollection = db.collection('users');

  const user = await usersCollection.findOne({ email: userEmail });
  if (!user) return null;

  const existingTodo = user.todos.find(todo => todo._id.toString() === todoId);
  if (!existingTodo) return null;

  const updatedTodos = user.todos.filter(todo => todo._id.toString() !== todoId);

  await usersCollection.updateOne(
    { email: userEmail },
    { $set: { todos: updatedTodos } }
  );

  return true;
}
async function deleteUserAccount(email) {
  const db = getDB();
  const usersCollection = db.collection('users');
  
  const user = await usersCollection.findOne({ email });
  if (!user) return null;

  await usersCollection.deleteOne({ email });
  return true;
}


module.exports = {
  getTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  markAllCompleted,
  deleteUserAccount
};
