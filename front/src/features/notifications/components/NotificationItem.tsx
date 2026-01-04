import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Bell, CheckCircle, DangerTriangle, Info, XCircle } from '@mynaui/icons-react';
import { Text } from '@/shared/components/ui/Typography';
import type { Notification } from '../types';

interface NotificationItemProps {
 notification: Notification;
 onRead: (id: number) => void;
}

const getIcon = (type: string) => {
 switch (type) {
  case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-green-500" />;
  case 'WARNING': return <DangerTriangle className="w-5 h-5 text-amber-500" />;
  case 'ERROR': return <XCircle className="w-5 h-5 text-red-500" />;
  case 'INFO': return <Info className="w-5 h-5 text-blue-500" />;
  default: return <Bell className="w-5 h-5 text-primary" />;
 }
};

export const NotificationItem = ({ notification, onRead }: NotificationItemProps) => {
 return (
  <div
   className={`p-4 border-b border-border hover:bg-bg-secondary/50 transition-colors cursor-pointer flex gap-3 ${!notification.isRead ? 'bg-primary/5' : ''}`}
   onClick={() => !notification.isRead && onRead(notification.id)}
  >
   <div className="shrink-0 mt-1">
    {getIcon(notification.type)}
   </div>
   <div className="flex-1 min-w-0">
    <div className="flex justify-between items-start gap-2">
     <Text className={`text-sm ${!notification.isRead ? 'font-semibold text-text-primary' : 'font-medium text-text-secondary'}`}>
      {notification.title}
     </Text>
     <Text variant="caption" className="text-placeholder whitespace-nowrap shrink-0">
      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: fr })}
     </Text>
    </div>
    <Text variant="caption" className="text-text-secondary line-clamp-2 mt-0.5">
     {notification.message}
    </Text>
   </div>
   {!notification.isRead && (
    <div className="shrink-0 self-center">
     <div className="w-2 h-2 rounded-full bg-primary" />
    </div>
   )}
  </div>
 );
};
