import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function skillMyTasks(server: McpServer): void {
  server.prompt(
    "skill-my-tasks",
    "Мои задачи на сегодня — показывает список задач с дедлайном сегодня или просроченных.",
    async () => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: [
              "Используй инструмент get_tasks чтобы получить все задачи.",
              "Из полученного списка отфильтруй только те задачи, у которых:",
              "1. endDate равна сегодняшней дате или уже прошла (просроченные)",
              "2. Задача не в статусе 'Завершена' / 'Закрыта'",
              "",
              "Выведи результат в формате:",
              "Мои задачи на сегодня:",
              "- [ID] Название задачи | Проект: ... | Дедлайн: ... | Статус: ...",
              "",
              "Если просроченных задач нет, скажи: 'Все задачи в порядке, просроченных нет!'",
            ].join("\n"),
          },
        },
      ],
    }),
  );
}

export function skillCreateTask(server: McpServer): void {
  server.prompt(
    "skill-create-task",
    "Создай задачу в проекте — помощник для создания задачи с выбором проекта и исполнителя.",
    {
      description: z.string().describe("Краткое описание задачи, например: 'Подготовить отчёт за март'"),
    },
    async ({ description }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: [
              `Пользователь хочет создать задачу: "${description}"`,
              "",
              "Шаги:",
              "1. Используй get_projects чтобы получить список проектов",
              "2. Покажи пользователю список проектов и спроси, в какой проект добавить задачу",
              "3. После выбора проекта, используй create_task с:",
              `   - name: краткое название из описания`,
              `   - description: полное описание`,
              "   - projectId: ID выбранного проекта",
              "4. Подтверди создание задачи и покажи её ID",
            ].join("\n"),
          },
        },
      ],
    }),
  );
}
