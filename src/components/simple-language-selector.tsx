import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from './ui/button';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' }
];

export function SimpleLanguageSelector() {
  const { i18n, t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentLanguage = languages[currentIndex];

  const cycleLanguage = () => {
    const nextIndex = (currentIndex + 1) % languages.length;
    setCurrentIndex(nextIndex);
    const nextLanguage = languages[nextIndex];
    console.log('Changing language to:', nextLanguage.code);
    console.log('Current i18n language before change:', i18n.language);
    i18n.changeLanguage(nextLanguage.code);
    console.log('Current i18n language after change:', i18n.language);
    console.log('Translation test - navigation.dashboard:', t('navigation.dashboard'));
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={cycleLanguage}
      className="flex items-center gap-2"
    >
      <Globe className="h-4 w-4" />
      <span className="hidden sm:inline">
        {currentLanguage.flag} {currentLanguage.name}
      </span>
      <span className="sm:hidden">
        {currentLanguage.flag}
      </span>
    </Button>
  );
}
