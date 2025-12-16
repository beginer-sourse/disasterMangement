import React from 'react';
import { 
  Users, 
  User, 
  Settings, 
  LogOut, 
  Moon, 
  Sun,
  Plus,
  HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useTheme } from './theme-provider';
import { useAuth } from '../contexts/AuthContext';
import { NotificationDropdown } from './notification-dropdown';
import { LanguageSelector } from './language-selector';
import { SimpleLanguageSelector } from './simple-language-selector';
import { WorkingLanguageSelector } from './working-language-selector';

interface NavigationProps {
  onReportClick: () => void;
  onLoginClick: () => void;
}

export function Navigation({ onReportClick, onLoginClick }: NavigationProps) {
  const { theme, setTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();


  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-sky-50/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
              Jalsaathi
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-300 -mt-1">{t('navigation.communitySafety')}</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
            {t('navigation.dashboard')}
          </a>
          <a href="#/map" className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
            {t('navigation.liveMap')}
          </a>
          <a href="#/disaster-info" className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
            {t('navigation.disasterInfo')}
          </a>
          <a href="#/faq" className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center space-x-1">
            <HelpCircle className="w-4 h-4" />
            <span>{t('navigation.faq')}</span>
          </a>
          <a href="#/profile" className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
            {t('navigation.profile')}
          </a>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Report Button - Only show if authenticated */}
          {isAuthenticated && (
            <Button 
              onClick={onReportClick}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('navigation.reportDisaster')}
            </Button>
          )}

          {/* Notifications - Only show if authenticated */}
          {isAuthenticated && <NotificationDropdown />}

          {/* Language Selector */}
          <WorkingLanguageSelector />

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </Button>

          {/* Profile Avatar or Login Button */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                className="relative h-8 w-8 rounded-full hover:bg-sky-100 dark:hover:bg-gray-800"
              onClick={() => navigate('/profile')}
                title={t('navigation.goToProfile')}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar || "/avatars/user.png"} alt={t('navigation.user')} />
                  <AvatarFallback>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title={t('navigation.logout')}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button 
              onClick={onLoginClick}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {t('navigation.login')}
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}