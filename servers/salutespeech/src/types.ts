export interface OAuthTokenResponse {
  access_token: string;
  /** Unix timestamp in milliseconds at which the token expires. */
  expires_at: number;
}
