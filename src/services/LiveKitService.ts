export interface TokenResponse {
  token: string;
  room_name: string;
  participant_identity: string;
}

export class LiveKitService {
  private static readonly API_URL = 'https://dev-chatbot-api.amalsocial.com/api/livekit/token';

  static async getToken(): Promise<TokenResponse> {
    try {
      const response = await fetch(this.API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TokenResponse = await response.json();

      if (!data.token || !data.room_name || !data.participant_identity) {
        throw new Error('Invalid response format from token API');
      }

      return data;
    } catch (error) {
      console.error('Error fetching LiveKit token:', error);
      throw new Error('Failed to get LiveKit token');
    }
  }

  static parseJWT(token: string) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      // React Native polyfill for atob
      const base64Decode = (str: string): string => {
        return Buffer.from(str, 'base64').toString('binary');
      };
      const jsonPayload = decodeURIComponent(
        base64Decode(base64)
          .split('')
          .map((c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT token:', error);
      return null;
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = this.parseJWT(token);
      if (!payload || !payload.exp) return true;

      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  static async refreshTokenIfNeeded(currentToken: string): Promise<TokenResponse | null> {
    if (this.isTokenExpired(currentToken)) {
      try {
        return await this.getToken();
      } catch (error) {
        console.error('Error refreshing token:', error);
        return null;
      }
    }
    return null;
  }
}