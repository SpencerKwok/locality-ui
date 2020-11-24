export interface PostMethods {
  Notification: {
    request: NotificationRequest;
    response: NotificationResponse;
  };
}

export interface NotificationRequest {
  title: string;
  description: string;
}

export interface NotificationResponse {}
