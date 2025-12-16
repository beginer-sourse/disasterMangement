import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (language: string) => void;
  availableLanguages: { code: string; name: string; nativeName: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const availableLanguages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' }
  ];

  const changeLanguage = (language: string) => {
    console.log('LanguageContext: Changing language to:', language);
    console.log('LanguageContext: Current language before change:', currentLanguage);
    
    i18n.changeLanguage(language).then(() => {
      console.log('LanguageContext: i18n.changeLanguage completed');
      setCurrentLanguage(language);
      localStorage.setItem('selectedLanguage', language);
      console.log('LanguageContext: Language changed successfully to:', language);
    }).catch((error) => {
      console.error('LanguageContext: Error changing language:', error);
    });
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage && availableLanguages.some(lang => lang.code === savedLanguage)) {
      i18n.changeLanguage(savedLanguage);
      setCurrentLanguage(savedLanguage);
    }
  }, [i18n]);

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      console.log('LanguageContext: i18n languageChanged event triggered:', lng);
      setCurrentLanguage(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const value = {
    currentLanguage,
    changeLanguage,
    availableLanguages
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
