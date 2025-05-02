document.addEventListener('DOMContentLoaded', () => {
  const userForm = document.getElementById('user-form');
  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');
  const apiUrl = 'http://localhost:3000/todos';

  let userEmail = '';
  let userName = '';

  // Show error messages
  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
  }

  // Fetch todos based on email
  async function fetchTodos() {
    try {
      if (!userEmail) {
        showError('Please provide your email.');
        return;
      }
      const response = await fetch(`${apiUrl}?email=${userEmail}`);
      if (!response.ok) throw await response.json();
      const todos = await response.json();
      renderTodos(todos);
    } catch (err) {
      showError(err.error || 'Could not fetch todos');
    }
  }

  // Add new todo
  async function addTodo(title) {
    try {
      if (!userEmail) {
        showError('Please provide your email.');
        return;
      }
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, title })
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
        body: JSON.stringify({ completed: !currentStatus, email: userEmail })
      });
      if (!response.ok) throw await response.json();
      fetchTodos();
    } catch (err) {
      showError(err.error || 'Failed to update todo');
    }
  }

  async function updateTodoTitle(id, newTitle) {
    try {
      const response = await fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, email: userEmail })
      });
      if (!response.ok) throw await response.json();
      fetchTodos();
    } catch (err) {
      showError(err.error || 'Failed to update title');
    }
  }

  async function deleteTodo(id) {
    try {
      const response = await fetch(`${apiUrl}/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });
      if (!response.ok) throw await response.json();
      fetchTodos();
    } catch (err) {
      showError(err.error || 'Failed to delete todo');
    }
  }


  // Render todos in the list
  function renderTodos(todos) {
    todoList.innerHTML = '';
    todos.forEach(todo => {
      const li = document.createElement('li');
      li.className = todo.completed ? 'completed' : '';
      li.dataset.id = todo._id;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = todo.completed;
      checkbox.addEventListener('change', () => toggleTodo(todo._id, todo.completed));

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
          updateTodoTitle(todo._id, newTitle.trim());
        }
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => deleteTodo(todo._id));

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(editBtn);
      li.appendChild(deleteBtn);
      todoList.appendChild(li);
    });
  }


  // Mark all todos as completed
  async function markAllAsCompleted() {
    try {
      if (!userEmail) {
        showError('Please provide your email.');
        return;
      }
      const response = await fetch(`${apiUrl}/mark-all`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });
      if (!response.ok) throw await response.json();
      fetchTodos();
    } catch (err) {
      showError(err.error || 'Failed to mark all todos');
    }
  }

  // Handle user form submission
  userForm.addEventListener('submit', (e) => {
    e.preventDefault();
    userEmail = document.getElementById('user-email').value.trim();

    if (userEmail) {
      userForm.style.display = 'none';
      document.getElementById('user-email-display').textContent = userEmail;
      document.getElementById('user-info').style.display = 'block';
      fetchTodos();
    } else {
      showError('Please provide your email');
    }

  });

  // Handle todo form submission
  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = todoInput.value.trim();
    if (title) addTodo(title);
  });

  document.getElementById('switch-user').addEventListener('click', () => {
    userEmail = '';
    document.getElementById('user-form').style.display = 'block';
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('user-email').value = '';
    todoList.innerHTML = ''; // Clear the todo list
  });
  document.getElementById('delete-account').addEventListener('click', async () => {
    if (!userEmail) {
      showError('No user logged in.');
      return;
    }

    const confirmDelete = confirm('Are you sure you want to delete your account and all associated todos?');

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${apiUrl}/user`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });

      if (!response.ok) throw await response.json();

      // Clear state and UI
      userEmail = '';
      document.getElementById('user-form').style.display = 'block';
      document.getElementById('user-info').style.display = 'none';
      document.getElementById('user-email').value = '';
      todoList.innerHTML = '';
      showError('Account deleted successfully.');
    } catch (err) {
      showError(err.error || 'Failed to delete account');
    }
  });

  // Event listener for marking all todos as completed
  document.getElementById('mark-all').addEventListener('click', markAllAsCompleted);

});
