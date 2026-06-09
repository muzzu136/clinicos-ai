import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// requiresAuth: false — we handle auth ourselves in AuthContext
// Setting true causes the SDK to redirect to login on ANY failed API call,
// which is what was causing the infinite redirect loop on clinicosai.org
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl
});
