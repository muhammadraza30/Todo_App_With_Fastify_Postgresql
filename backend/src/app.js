const path = require('path');
const fastify = require('fastify')({ logger: true });
const todoRoutes = require('./routes/todo.routes');

// ✅ Enable CORS
fastify.register(require('@fastify/cors'), { 
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
});

// ✅ Manually parse JSON bodies (Fastify doesn't do this automatically)
fastify.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
  try {
    const parsed = JSON.parse(body);
    done(null, parsed);
  } catch (err) {
    done(err, undefined);
  }
});

// ✅ Serve static frontend files (adjust if needed)
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, '../../frontend/public'),
  prefix: '/', // Serves index.html at localhost:3000/
});

// ✅ Register backend routes
fastify.register(todoRoutes, { prefix: '/todos' }); // Backend endpoints at /todos

// ✅ Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    fastify.log.info(`🚀 Server listening on http://localhost:3000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
