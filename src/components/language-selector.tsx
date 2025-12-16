import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showLabel?: boolean;
}

const languages = [
  { 
    code: 'en', 
    name: 'English', 
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false
  },
  { 
    code: 'hi', 
    name: 'Hindi', 
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    rtl: false
  },
  { 
    code: 'ta', 
    name: 'Tamil', 
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    rtl: false
  }
];

export function LanguageSelector({ 
  className = '', 
  variant = 'outline', 
  size = 'sm',
  showLabel = true 
}: LanguageSelectorProps) {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (languageCode: string) => {
    console.log('Changing language to:', languageCode);
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
    
    // Show a brief success message
    const event = new CustomEvent('languageChanged', { 
      detail: { language: languageCode } 
    });
    window.dispatchEvent(event);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant}
          size={size}
          className={`
            flex items-center gap-2 transition-all duration-200 
            hover:scale-105 active:scale-95
            ${className}
          `}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            {showLabel && (
              <span className="hidden sm:inline font-medium">
                {currentLanguage.flag} {currentLanguage.nativeName}
              </span>
            )}
            {!showLabel && (
              <span className="text-lg">
                {currentLanguage.flag}
              </span>
            )}
          </div>
          <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 p-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-xl"
      >
        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {t('common.language') || 'Language'}
        </div>
        <DropdownMenuSeparator className="my-1" />
        {languages.map((language, index) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`
              flex items-center gap-3 cursor-pointer rounded-md px-3 py-2.5
              transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-950/20
              ${i18n.language === language.code 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                : 'text-gray-700 dark:text-gray-300'
              }
            `}
          >
            <div className="flex items-center gap-3 flex-1">
              <span className="text-xl">{language.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium text-sm">{language.nativeName}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {language.name}
                </span>
              </div>
            </div>
            {i18n.language === language.code && (
              <div className="flex items-center gap-1">
                <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  {t('common.current') || 'Current'}
                </Badge>
              </div>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="my-1" />
        <div className="px-2 py-1.5 text-xs text-gray-400 dark:text-gray-500 text-center">
          {t('common.languageNote') || 'Language preference is saved locally'}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}