export interface AuthRequest {
  email: string;
  password: string;
}

export interface SignupRequest extends AuthRequest {
  confirmPassword: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
  };
}

export interface TokenPayload {
  sub: string; // ユーザーID
  email: string;
  iat: number; // 発行時刻
  exp: number; // 有効期限
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  email: string;
  code: string;
  newPassword: string;
}