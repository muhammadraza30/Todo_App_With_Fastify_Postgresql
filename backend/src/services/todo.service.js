const client = require('../db/db');

async function getTodos() {
  try {
    const { rows } = await client.query('SELECT * FROM todos ORDER BY id ASC');
    console.log('Fetched todos:', rows);
    return rows;
  } catch (err) {
    console.error('Error fetching todos:', err);
    throw err;
  }
}

async function addTodo(title) {
  const { rows } = await client.query(
    'INSERT INTO todos (title, completed) VALUES ($1, $2) RETURNING *',
    [title, false]
  );
  return rows[0];
}

async function updateTodo(id, completed, title) {
  try {
    const fields = [];
    const values = [];
    let i = 1;

    if (completed !== undefined) {
      fields.push(`completed = $${i++}`);
      values.push(completed);
    }

    if (title !== undefined) {
      fields.push(`title = $${i++}`);
      values.push(title);
    }

    if (fields.length === 0) return null;

    values.push(id);

    const query = `UPDATE todos SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`;
    const { rows } = await client.query(query, values);
    return rows[0];
  } catch (err) {
    console.error('Error updating todo:', err);
    throw err;
  }
}


async function deleteTodo(id) {
  await client.query('DELETE FROM todos WHERE id = $1', [id]);
}

module.exports = {
  getTodos,
  addTodo,
  updateTodo,
  deleteTodo
};
