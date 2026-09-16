export interface JivoChat {
  chat_id: string;
  status: string;
  client_name?: string;
  created_at?: string;
  agent_id?: string;
  channel_id?: string;
  last_message?: string;
}

export interface JivoAgent {
  agent_id: string;
  name: string;
  email?: string;
  status?: string;
  role?: string;
}

export interface JivoVisitor {
  visitor_id: string;
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  last_seen?: string;
}

export interface JivoContact {
  contact_id: string;
  name?: string;
  email?: string;
  phone?: string;
  description?: string;
  created_at?: string;
}

export interface JivoMessage {
  message_id: string;
  chat_id: string;
  type: string;
  body: string;
  created_at: string;
  agent_id?: string;
}

export interface JivoWebhook {
  webhook_id: string;
  url: string;
  event: string;
  status?: string;
}
