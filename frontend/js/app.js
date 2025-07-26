const authContainer = document.getElementById('auth-container');
const taskContainer = document.getElementById('task-container');
const authForm = document.getElementById('auth-form');
const taskForm = document.getElementById('task-form');
const authTitle = document.getElementById('auth-title');
const switchLink = document.getElementById('switch-link');
const authSwitch = document.getElementById('auth-switch');
const taskList = document.getElementById('task-list');
const logoutBtn = document.getElementById('logout');
let isRegister = true;

const API_URL = 'https://task-manager-n4lt.onrender.com';

if (localStorage.getItem('token')) {
  showTaskManager();
} else {
  showAuth();
}

switchLink.addEventListener('click', (e) => {
  e.preventDefault();
  isRegister = !isRegister;
  authTitle.textContent = isRegister ? 'Register' : 'Login';
  switchLink.textContent = isRegister ? 'Login' : 'Register';
  authSwitch.textContent = isRegister ? 'Already have an account? ' : 'Need an account? ';
});

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const endpoint = isRegister ? '/auth/register' : '/auth/login';
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.token);
      showTaskManager();
      loadTasks();
    } else {
      alert(data.message);
    }
  } catch (error) {
    alert('Error connecting to server');
  }
});

taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('task-title').value;
  const description = document.getElementById('task-description').value;

  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ title, description }),
    });
    if (response.ok) {
      loadTasks();
      taskForm.reset();
    } else {
      alert('Failed to add task');
    }
  } catch (error) {
    alert('Error connecting to server');
  }
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  showAuth();
});

async function loadTasks() {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const tasks = await response.json();
    taskList.innerHTML = '';
    tasks.forEach(task => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div>
          <strong>${task.title}</strong>
          <p>${task.description || ''}</p>
        </div>
        <div class="task-actions">
          <button onclick="editTask('${task._id}', '${task.title}', '${task.description || ''}')">Edit</button>
          <button onclick="deleteTask('${task._id}')">Delete</button>
        </div>
      `;
      taskList.appendChild(li);
    });
  } catch (error) {
    alert('Error loading tasks');
  }
}

async function editTask(id, title, description) {
  const newTitle = prompt('Enter new title:', title);
  const newDescription = prompt('Enter new description:', description);
  if (newTitle) {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ title: newTitle, description: newDescription }),
      });
      if (response.ok) {
        loadTasks();
      } else {
        alert('Failed to update task');
      }
    } catch (error) {
      alert('Error connecting to server');
    }
  }
}

async function deleteTask(id) {
  console.log('Attempting to delete task with ID:', id);
  if (confirm('Are you sure you want to delete this task?')) {
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token);
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('Response status:', response.status);
      if (response.ok) {
        console.log('Task deleted successfully');
        loadTasks();
      } else {
        const errorText = await response.text();
        console.error('Failed to delete task. Status:', response.status, 'Message:', errorText);
        alert('Failed to delete task: ' + errorText || 'Unknown error');
      }
    } catch (error) {
      console.error('Error connecting to server:', error);
      alert('Error connecting to server: ' + error.message);
    }
  }
}

function showAuth() {
  authContainer.style.display = 'block';
  taskContainer.style.display = 'none';
}

function showTaskManager() {
  authContainer.style.display = 'none';
  taskContainer.style.display = 'block';
} 