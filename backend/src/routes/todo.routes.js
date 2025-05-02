const todoService = require('../services/todo.service');

async function routes(fastify, options) {
  // GET all todos for a user
  fastify.get('/', async (request, reply) => {
    const { email } = request.query;

    if (!email) {
      return reply.status(400).send({ error: 'Email is required' });
    }

    try {
      const todos = await todoService.getTodos(email);
      reply.send(todos);
    } catch (err) {
      reply.status(500).send({ error: 'Failed to fetch todos' });
    }
  });

  // POST a new todo for a user
  fastify.post('/', async (request, reply) => {
    const { email, title } = request.body;

    if (!email || !title) {
      return reply.status(400).send({ error: 'Email and title are required' });
    }

    try {
      const newTodo = await todoService.addTodo(email, title);
      reply.status(201).send(newTodo);
    } catch (err) {
      console.error('Add Todo Error:', err);
      reply.status(500).send({ error: 'Failed to add todo' });
    }
  });

  // PUT update todo completion status or title
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params;
    const { email, completed, title } = request.body;

    if (!email) {
      return reply.status(400).send({ error: 'Email is required' });
    }

    if (completed === undefined && title === undefined) {
      return reply.status(400).send({ error: 'Either completed or title must be provided' });
    }

    try {
      const updated = await todoService.updateTodo(email, id, completed, title);
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
    const { email } = request.body;

    if (!email) {
      return reply.status(400).send({ error: 'Email is required' });
    }

    try {
      const user = await todoService.deleteTodo(email, id);
      if (!user) {
        return reply.status(404).send({ error: 'Todo not found' });
      }
      reply.send({ success: true });
    } catch (err) {
      console.error('Delete Todo Error:', err);
      reply.status(500).send({ error: 'Failed to delete todo' });
    }
  });
  // PUT all todos to completed = true
  fastify.put('/mark-all', async (request, reply) => {
    const { email } = request.body;

    if (!email) {
      return reply.status(400).send({ error: 'Email is required' });
    }

    try {
      const updated = await todoService.markAllCompleted(email);
      reply.send({ message: 'All todos marked as completed', updated });
    } catch (err) {
      console.error('Mark All Error:', err);
      reply.status(500).send({ error: 'Failed to mark all todos' });
    }
  });
  // DELETE entire user account
  fastify.delete('/user', async (request, reply) => {
    const { email } = request.body;

    if (!email) {
      return reply.status(400).send({ error: 'Email is required' });
    }

    try {
      const deleted = await todoService.deleteUserAccount(email);
      if (!deleted) {
        return reply.status(404).send({ error: 'User not found' });
      }
      reply.send({ message: 'User account deleted' });
    } catch (err) {
      console.error('Delete User Error:', err);
      reply.status(500).send({ error: 'Failed to delete user account' });
    }
  });


}
module.exports = routes;
