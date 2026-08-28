export interface MangoCall {
  call_id: string;
  from: string;
  to: string;
  start_time: number;
  duration?: number;
  status?: string;
}

export interface MangoUser {
  user_id: string;
  name: string;
  extension?: string;
  email?: string;
  department?: string;
}
