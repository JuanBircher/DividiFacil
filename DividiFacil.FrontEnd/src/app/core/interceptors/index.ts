import { authInterceptor } from './auth.interceptor';
import { refreshTokenInterceptor } from './refresh-token.interceptor';

export const httpInterceptors = [authInterceptor, refreshTokenInterceptor];
