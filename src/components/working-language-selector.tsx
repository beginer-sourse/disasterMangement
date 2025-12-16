import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' }
];

export function WorkingLanguageSelector() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (languageCode: string) => {
    console.log('Changing language to:', languageCode);
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 
          transition-all duration-200 
          hover:bg-blue-50 hover:border-blue-300 hover:shadow-md
          dark:hover:bg-blue-950/20 dark:hover:border-blue-600
          ${isOpen ? 'bg-blue-50 border-blue-300 shadow-md dark:bg-blue-950/20 dark:border-blue-600' : ''}
          group
        `}
      >
        <Globe className={`h-4 w-4 transition-colors ${isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
        <span className="hidden sm:inline font-medium">
          {currentLanguage.flag} {currentLanguage.name}
        </span>
        <span className="sm:hidden text-lg">
          {currentLanguage.flag}
        </span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="py-1">
            {languages.map((language, index) => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-sm text-left
                  transition-all duration-150
                  hover:bg-blue-50 dark:hover:bg-blue-950/20
                  ${i18n.language === language.code ? 'bg-blue-50 dark:bg-blue-950/20 border-r-2 border-blue-500' : ''}
                  ${index === 0 ? 'rounded-t-lg' : ''}
                  ${index === languages.length - 1 ? 'rounded-b-lg' : ''}
                `}
              >
                <span className="text-xl">{language.flag}</span>
                <span className="flex-1 font-medium">{language.name}</span>
                {i18n.language === language.code && (
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {t('common.current') || 'Current'}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
