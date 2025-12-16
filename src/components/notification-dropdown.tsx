import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Trash2, AlertCircle, ThumbsUp, ThumbsDown, MessageCircle, ShieldCheck, ShieldX, Eye, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { ScrollArea } from './ui/scroll-area';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'REPORT_VERIFIED':
      return <ShieldCheck className="w-4 h-4 text-green-500" />;
    case 'REPORT_REJECTED':
      return <ShieldX className="w-4 h-4 text-red-500" />;
    case 'REPORT_LIKED':
      return <ThumbsUp className="w-4 h-4 text-blue-500" />;
    case 'REPORT_DISLIKED':
      return <ThumbsDown className="w-4 h-4 text-orange-500" />;
    case 'COMMENT_ADDED':
      return <MessageCircle className="w-4 h-4 text-purple-500" />;
    default:
      return <AlertCircle className="w-4 h-4 text-gray-500" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'REPORT_VERIFIED':
      return 'border-l-green-500 bg-white dark:bg-gray-900';
    case 'REPORT_REJECTED':
      return 'border-l-red-500 bg-white dark:bg-gray-900';
    case 'REPORT_LIKED':
      return 'border-l-blue-500 bg-white dark:bg-gray-900';
    case 'REPORT_DISLIKED':
      return 'border-l-orange-500 bg-white dark:bg-gray-900';
    case 'COMMENT_ADDED':
      return 'border-l-purple-500 bg-white dark:bg-gray-900';
    default:
      return 'border-l-gray-500 bg-white dark:bg-gray-900';
  }
};

interface NotificationItemProps {
  notification: any;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetails: (notification: any) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead, onDelete, onViewDetails }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onViewDetails(notification);
  };

  return (
    <div
      className={`p-3 border-l-4 ${getNotificationColor(notification.type)} hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer hover:shadow-md border-b border-gray-200 dark:border-gray-700`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={`text-sm font-semibold ${!notification.isRead ? 'text-gray-900 dark:text-gray-100' : 'text-gray-800 dark:text-gray-400'}`}>
              {notification.title}
            </h4>
            <div className="flex items-center space-x-1">
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onMarkAsRead(notification._id)}
                  title="Mark as read"
                >
                  <Check className="w-3 h-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onDelete(notification._id)}
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <p className={`text-sm mt-1 ${!notification.isRead ? 'text-gray-900 dark:text-gray-300' : 'text-gray-800 dark:text-gray-400'}`}>
            {notification.message && notification.message.length > 100 
              ? `${notification.message.substring(0, 100)}...` 
              : (notification.message || 'No message content')
            }
          </p>
          <div className="flex items-center mt-2">
            <span className="text-xs text-blue-500 dark:text-blue-400 font-medium flex items-center">
              <Eye className="w-3 h-3 mr-1" />
              Click to read full message
            </span>
          </div>
          <p className="text-xs text-gray-700 dark:text-gray-500 mt-1 font-medium">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>
        {!notification.isRead && (
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export const NotificationDropdown: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    error,
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    fetchNotifications 
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debug logging
  console.log('NotificationDropdown render - isOpen:', isOpen, 'notifications:', notifications.length, 'unreadCount:', unreadCount);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleViewDetails = (notification: any) => {
    setSelectedNotification(notification);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedNotification(null);
  };

  const handleOpenChange = (open: boolean) => {
    console.log('Dropdown open change:', open);
    setIsOpen(open);
    if (open) {
      console.log('Fetching notifications...');
      fetchNotifications();
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          onClick={() => {
            console.log('Notification button clicked');
            setIsOpen(!isOpen);
            if (!isOpen) {
              fetchNotifications();
            }
          }}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-xs text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
        
        {isOpen && (
          <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[9999]">
            <div className="p-4 pb-3 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Notifications</h3>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={handleMarkAllAsRead}
                  >
                    <CheckCheck className="w-3 h-3 mr-1" />
                    Mark all read
                  </Button>
                )}
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700"></div>
            <div className="max-h-96 overflow-y-auto">
              {error ? (
                <div className="p-4 text-center text-sm text-red-500">
                  Error: {error}
                </div>
              ) : isLoading ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  No notifications yet
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div key={notification._id} className="group">
                      <NotificationItem
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                        onViewDetails={handleViewDetails}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            {notifications.length > 0 && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700"></div>
                <div className="p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      // You could implement a "View All Notifications" page here
                      console.log('View all notifications');
                    }}
                  >
                    View all notifications
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

    {/* Notification Detail Modal */}
    {isDetailModalOpen && selectedNotification && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notification Details</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseDetailModal}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                {getNotificationIcon(selectedNotification.type)}
                <h4 className="font-medium text-black dark:text-gray-100">
                  {selectedNotification.title}
                </h4>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-400">
                {formatDistanceToNow(new Date(selectedNotification.createdAt), { addSuffix: true })}
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-800 dark:text-gray-300 leading-relaxed">
                {selectedNotification.message || 'No message content available'}
              </p>
            </div>
            
            {selectedNotification.relatedReport && (
              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Related Report
                </h5>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {selectedNotification.relatedReport.title}
                </p>
              </div>
            )}
            
            <div className="flex justify-between pt-4 border-t">
              <div className="flex space-x-2">
                {!selectedNotification.isRead && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleMarkAsRead(selectedNotification._id);
                      handleCloseDetailModal();
                    }}
                  >
                    Mark as Read
                  </Button>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCloseDetailModal}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
