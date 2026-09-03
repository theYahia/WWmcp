// Prompt ("skill") definitions, kept separate so their contract (which tools
// and filters they steer the model toward) can be unit-tested.

export interface PromptDef {
  name: string;
  description: string;
  text: string;
}

export const MY_TASKS_TODAY: PromptDef = {
  name: "my-tasks-today",
  description: "Мои задачи на сегодня — your tasks due today or overdue",
  text:
    "Сначала вызови get_current_user, чтобы узнать мой employee id. Если он недоступен " +
    "(experimental endpoint вернул ошибку) — попроси меня указать мой employee id (его можно " +
    "найти через get_employees). Затем вызови get_tasks с filter_responsible_id=<мой id> и " +
    "подходящим filter_status, чтобы получить именно МОИ активные задачи. Покажи список с " +
    "дедлайнами, отсортируй по срочности, просроченные пометь. Формат: компактная таблица с " +
    "колонками Задача, Дедлайн, Статус, Приоритет.",
};

export const CREATE_DEAL_WIZARD: PromptDef = {
  name: "create-deal-wizard",
  description: "Создай сделку — guided deal creation wizard",
  text:
    "Помоги создать новую сделку в Мегаплане. Сначала вызови get_deal_programs и покажи мне " +
    "список доступных программ (pipelines) с их id, чтобы я выбрал нужную. Затем спроси: " +
    "1) Название сделки, 2) Ответственный (опционально — найди через get_employees), 3) Сумма и " +
    "валюта (опционально), 4) Контакт/клиент и его тип human/company (опционально — найди через " +
    "list_clients), 5) Описание (опционально). После сбора данных вызови create_deal.",
};
