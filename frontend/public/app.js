document.addEventListener('DOMContentLoaded', () => {
  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');
  const apiUrl = 'http://localhost:3000/todos';

  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
  }

  async function fetchTodos() {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw await response.json();
      const todos = await response.json();
      renderTodos(todos);
    } catch (err) {
      showError(err.error || 'Could not fetch todos');
    }
  }

  async function addTodo(title) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      if (!response.ok) throw await response.json();
      todoInput.value = '';
      fetchTodos();
    } catch (err) {
      showError(err.error || 'Failed to add todo');
    }
  }

  async function toggleTodo(id, currentStatus) {
    try {
      const response = await fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus })
      });
      if (!response.ok) throw await response.json();
      fetchTodos();
    } catch (err) {
      showError(err.error || 'Failed to update todo');
    }
  }

  async function deleteTodo(id) {
    try {
      const response = await fetch(`${apiUrl}/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw await response.json();
      fetchTodos();
    } catch (err) {
      showError(err.error || 'Failed to delete todo');
    }
  }

  function renderTodos(todos) {
    todoList.innerHTML = '';
    todos.forEach(todo => {
      const li = document.createElement('li');
      li.className = todo.completed ? 'completed' : '';
      li.dataset.id = todo.id;
  
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = todo.completed;
      checkbox.addEventListener('change', () => toggleTodo(todo.id, todo.completed));
  
      const span = document.createElement('span');
      span.textContent = todo.title;
      span.style.marginLeft = '10px';
      span.style.flexGrow = '1';
  
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.style.marginRight = '10px';
      editBtn.addEventListener('click', () => {
        const newTitle = prompt('Edit todo:', todo.title);
        if (newTitle && newTitle.trim()) {
          updateTodoTitle(todo.id, newTitle.trim());
        }
      });
  
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
  
      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(editBtn);
      li.appendChild(deleteBtn);
      todoList.appendChild(li);
    });
  }
  
  async function updateTodoTitle(id, newTitle) {
  try {
    const response = await fetch(`${apiUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle })
    });
    if (!response.ok) throw await response.json();
    fetchTodos();
  } catch (err) {
    showError(err.error || 'Failed to update title');
  }
}


  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = todoInput.value.trim();
    if (title) addTodo(title);
  });

  fetchTodos();
});
