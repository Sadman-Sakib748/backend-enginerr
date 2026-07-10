// config/bkash.ts (FIXED - Mock Mode)
import axios, { AxiosError } from 'axios';
import { logger } from '../utils/logger';

interface BkashToken {
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

interface BkashTokenResponse {
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  statusCode?: string;
  statusMessage?: string;
}

let bkashToken: BkashToken | null = null;
let tokenExpiry: Date | null = null;
let isMockMode = false;

export const getBkashConfig = () => {
  const appKey = process.env.BKASH_APP_KEY;
  const appSecret = process.env.BKASH_APP_SECRET;
  const baseURL = process.env.BKASH_BASE_URL;
  
  if (!appKey || !appSecret || !baseURL) {
    logger.warn('⚠️ bKash credentials not configured. Using mock mode.');
    isMockMode = true;
    return { appKey: 'mock_key', appSecret: 'mock_secret', baseURL: 'https://mock.bkash.com' };
  }
  
  return { appKey, appSecret, baseURL };
};

export const getBkashToken = async (): Promise<string> => {
  // ✅ Mock Mode
  if (isMockMode) {
    logger.info('ℹ️ bKash mock token generated');
    return 'mock_token_123456789';
  }

  if (bkashToken && tokenExpiry && new Date() < tokenExpiry) {
    return bkashToken.id_token;
  }

  try {
    const { appKey, appSecret, baseURL } = getBkashConfig();
    
    const response = await axios.post<BkashTokenResponse>(
      `${baseURL}/tokenized/checkout/token/grant`,
      {
        app_key: appKey,
        app_secret: appSecret,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    if (response.data.statusCode && response.data.statusCode !== '0000') {
      throw new Error(`bKash token error: ${response.data.statusMessage}`);
    }

    bkashToken = {
      id_token: response.data.id_token,
      token_type: response.data.token_type,
      expires_in: response.data.expires_in,
      refresh_token: response.data.refresh_token,
    };
    
    tokenExpiry = new Date(Date.now() + (bkashToken.expires_in - 60) * 1000);
    
    logger.info('✅ bKash token obtained successfully');
    return bkashToken.id_token;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to get bKash token:', error);
    logger.warn('⚠️ Falling back to mock token');
    return 'mock_token_123456789';
  }
};

export const clearBkashToken = (): void => {
  bkashToken = null;
  tokenExpiry = null;
  logger.info('bKash token cleared');
};

export const isBkashMockMode = (): boolean => isMockMode;