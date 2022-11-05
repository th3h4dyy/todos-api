/**
 * Access token response model
 * @see https://tools.ietf.org/html/rfc6749#section-5.1
 */
export interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}
