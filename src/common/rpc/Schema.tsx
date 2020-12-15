export interface PostMethods {
  Notification: {
    request: NotificationRequest;
    response: NotificationResponse;
  };
  Login: {
    request: LoginRequest;
    response: LoginResponse;
  };
}

export interface NotificationRequest {
  title: string;
  description: string;
}

export interface LoginRequest {
  usernameField: string;
  passwordField: string;
}

export interface NotificationResponse {}
export interface LoginResponse {
  message: string;
}
