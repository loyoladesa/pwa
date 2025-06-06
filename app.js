// Classe para gerenciar as tarefas
class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.init();
    }

    init() {
        // Elementos DOM
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.todoCount = document.getElementById('todoCount');
        this.clearBtn = document.getElementById('clearCompleted');
        this.offlineIndicator = document.getElementById('offlineIndicator');

        // Event Listeners
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        this.clearBtn.addEventListener('click', () => this.clearCompleted());

        // Verificar status online/offline
        window.addEventListener('online', () => this.updateOnlineStatus());
        window.addEventListener('offline', () => this.updateOnlineStatus());

        // Registrar Service Worker
        this.registerServiceWorker();

        // Renderizar tarefas existentes
        this.render();
        this.updateOnlineStatus();
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('sw.js');
                console.log('Service Worker registrado:', registration);
            } catch (error) {
                console.error('Erro ao registrar Service Worker:', error);
            }
        }
    }

    updateOnlineStatus() {
        if (navigator.onLine) {
            this.offlineIndicator.classList.remove('show');
        } else {
            this.offlineIndicator.classList.add('show');
        }
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.todoInput.value = '';
        this.render();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.render();
    }

    clearCompleted() {
        this.todos = this.todos.filter(t => !t.completed);
        this.saveTodos();
        this.render();
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    render() {
        // Limpar lista
        this.todoList.innerHTML = '';

        // Renderizar cada tarefa
        this.todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = 'todo-item';
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    onchange="app.toggleTodo(${todo.id})"
                >
                <span class="todo-text ${todo.completed ? 'completed' : ''}">
                    ${this.escapeHtml(todo.text)}
                </span>
                <button 
                    class="delete-btn" 
                    onclick="app.deleteTodo(${todo.id})"
                >
                    🗑️ Excluir
                </button>
            `;
            this.todoList.appendChild(li);
        });

        // Atualizar contador
        const count = this.todos.length;
        this.todoCount.textContent = `${count} ${count === 1 ? 'tarefa' : 'tarefas'}`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inicializar aplicação
const app = new TodoApp();