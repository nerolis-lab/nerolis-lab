import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { AbstractDAO, DBWithVersionedIdSchema } from '@src/database/dao/abstract-dao.js';
import { NotificationType } from 'sleepapi-common';

export const NotificationTypeSchema = Type.Union([
  Type.Literal(NotificationType.FriendRequest),
  Type.Literal(NotificationType.News)
]);

const DBNotificationSchema = Type.Composite([
  DBWithVersionedIdSchema,
  Type.Object({
    fk_sender_id: Type.Number(),
    fk_receiver_id: Type.Number(),

    template: NotificationTypeSchema,
    vfk_content_id: Type.Optional(Type.Number()),

    updated_at: Type.Optional(Type.Date()),
    created_at: Type.Optional(Type.Date()),
    external_id: Type.String({ minLength: 36, maxLength: 36 })
  })
]);
export type DBNotification = Static<typeof DBNotificationSchema>;

class NotificationDAOImpl extends AbstractDAO<typeof DBNotificationSchema> {
  public tableName = 'notification';
  public schema = DBNotificationSchema;
}

export const NotificationDAO = new NotificationDAOImpl();
