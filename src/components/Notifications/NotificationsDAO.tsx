import { PostRpcClient } from "../../common/rpc/RpcClient";
import {
  NotificationRequest,
  NotificationResponse,
} from "../../common/rpc/Schema";

let instance: NotificationsDAO;
export default class NotificationsDAO {
  static getInstance() {
    if (instance) {
      return instance;
    }

    instance = new NotificationsDAO(new PostRpcClient());
    return instance;
  }

  constructor(private rpc: PostRpcClient) {}

  async sendNotification(
    notificationRequest: NotificationRequest
  ): Promise<NotificationResponse> {
    return await this.rpc.call(
      "Notification",
      notificationRequest,
      "/notification"
    );
  }
}
