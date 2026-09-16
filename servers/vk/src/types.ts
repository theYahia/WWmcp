export interface WallPost {
  id: number;
  from_id: number;
  owner_id: number;
  date: number;
  text: string;
  comments?: { count: number };
  likes?: { count: number };
  reposts?: { count: number };
  views?: { count: number };
}

export interface WallResponse {
  count: number;
  items: WallPost[];
}

export interface VkUser {
  id: number;
  first_name: string;
  last_name: string;
  screen_name?: string;
  photo_200?: string;
  city?: { id: number; title: string };
  followers_count?: number;
}

export interface VkGroup {
  id: number;
  name: string;
  screen_name: string;
  type: string;
  members_count?: number;
  description?: string;
}

export interface NewsfeedSearchResult {
  count: number;
  items: WallPost[];
  total_count: number;
}

export interface VkFriend {
  id: number;
  first_name: string;
  last_name: string;
  nickname?: string;
  city?: { id: number; title: string };
  photo_200?: string;
}

export interface VkStatsDay {
  day: string;
  views?: number;
  visitors?: number;
  subscribed?: number;
  unsubscribed?: number;
}
