const todoService = require('../services/todo.service');

async function routes(fastify, options) {
  // GET all todos
  fastify.get('/', async (request, reply) => {
    try {
      const todos = await todoService.getTodos();
      reply.send(todos);
    } catch (err) {
      reply.status(500).send({ error: 'Failed to fetch todos' });
    }
  });

  // POST a new todo
  fastify.post('/', async (request, reply) => {
    const { title } = request.body;

    if (!title || typeof title !== 'string') {
      return reply.status(400).send({ error: 'Title is required and must be a string' });
    }

    try {
      const newTodo = await todoService.addTodo(title);
      reply.status(201).send(newTodo);
    } catch (err) {
      console.error('Add Todo Error:', err);
      reply.status(500).send({ error: 'Failed to add todo' });
    }
  });

  // PUT update todo completion status
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params;
    const { completed, title } = request.body;
  
    if (completed === undefined && title === undefined) {
      return reply.status(400).send({ error: 'Either completed or title must be provided' });
    }
  
    try {
      const updated = await todoService.updateTodo(id, completed, title);
      if (!updated) {
        return reply.status(404).send({ error: 'Todo not found' });
      }
      reply.send(updated);
    } catch (err) {
      console.error('Update Todo Error:', err);
      reply.status(500).send({ error: 'Failed to update todo' });
    }
  });

  // DELETE a todo
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      await todoService.deleteTodo(id);
      reply.send({ success: true });
    } catch (err) {
      console.error('Delete Todo Error:', err);
      reply.status(500).send({ error: 'Failed to delete todo' });
    }
  });
}

module.exports = routes;
