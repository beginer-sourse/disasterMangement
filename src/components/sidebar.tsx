import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  User, 
  Shield, 
  Info, 
  FileText, 
  BarChart3,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from './ui/utils';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { StateFilter } from './state-filter';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  selectedState: string;
  onStateChange: (state: string) => void;
}

export function Sidebar({ collapsed, onToggle, selectedState, onStateChange }: SidebarProps) {
  const { t } = useTranslation();

  const navigation = [
    {
      name: t('navigation.dashboard'),
      href: '#/dashboard',
      icon: LayoutDashboard,
      current: true,
    },
    {
      name: t('navigation.reports'),
      href: '#/reports',
      icon: FileText,
      current: false,
    },
    {
      name: t('navigation.analytics'),
      href: '#/analytics',
      icon: BarChart3,
      current: false,
    },
    {
      name: t('navigation.map'),
      href: '#/map',
      icon: Map,
      current: false,
    },
    {
      name: t('navigation.profile'),
      href: '#/profile',
      icon: User,
      current: false,
    },
    {
      name: t('navigation.faq'),
      href: '#/faq',
      icon: HelpCircle,
      current: false,
    },
    {
      name: t('navigation.admin'),
      href: '#/admin',
      icon: Shield,
      current: false,
      badge: t('navigation.admin'),
    },
  ];
  return (
    <div
      className={cn(
        'fixed left-0 top-16 bottom-0 z-40 bg-sky-200 dark:bg-gray-700 border-r-2 border-sky-300 dark:border-gray-600 shadow-lg transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Toggle Button */}
      <div className="flex justify-end p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* State Filter */}
      <StateFilter 
        selectedState={selectedState}
        onStateChange={onStateChange}
        collapsed={collapsed}
      />

      {/* Navigation */}
      <nav className="px-3 pb-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <a
                  href={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    item.current
                      ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-sky-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  <Icon
                    className={cn(
                      'flex-shrink-0 h-5 w-5',
                      item.current
                        ? 'text-red-500'
                        : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                    )}
                  />
                  {!collapsed && (
                    <>
                      <span className="ml-3 flex-1">{item.name}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Info Section */}
      {!collapsed && (
        <div className="px-3 mt-8">
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Emergency Tip
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  In case of tsunami, move to higher ground immediately. Don't wait for official warnings.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}