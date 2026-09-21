// Centraliza as chamadas de API num único lugar — componentes não fazem fetch diretamente.
// Isso facilita trocar a URL base, adicionar tratamento de erro comum, ou trocar por outra lib depois.

export type Task = {
  id: number;
  text: string;
  done: boolean;
};

const BASE_URL = '/api/tasks'; // passa pelo proxy do vite.config.ts em dev

export async function fetchTasks(): Promise<Task[]> {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error('Falha ao buscar tarefas');
  return res.json();
}

export async function createTask(text: string): Promise<Task> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!res.ok) throw new Error('Falha ao criar tarefa');
  return res.json();
}

export async function toggleTask(id: number): Promise<Task> {
  const res = await fetch(`${BASE_URL}/${id}`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Falha ao atualizar tarefa');
  return res.json();
}

export async function deleteTask(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Falha ao remover tarefa');
}
