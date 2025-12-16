import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  AlertTriangle, 
  Users, 
  MapPin, 
  Shield, 
  FileText, 
  Camera, 
  MessageSquare,
  BarChart3,
  Settings,
  Globe,
  Phone,
  Mail,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

interface FAQItemProps {
  question: string;
  answer: string | React.ReactNode;
  icon?: React.ReactNode;
  category?: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, icon, category }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="mb-4">
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {icon && <div className="text-blue-600 dark:text-blue-400">{icon}</div>}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {question}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            {category && (
              <Badge variant="secondary" className="text-xs">
                {category}
              </Badge>
            )}
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="pt-0">
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {answer}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// FAQ data will be generated dynamically using translations

export function FAQ() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Generate FAQ data dynamically from translations
  const faqData: FAQItemProps[] = [
    {
      question: t('faq.questions.whatIsJalsaathi'),
      answer: t('faq.questions.whatIsJalsaathiAnswer'),
      icon: <HelpCircle className="w-5 h-5" />,
      category: "general"
    },
    {
      question: t('faq.questions.disasterTypes'),
      answer: (
        <div>
          <p className="mb-3">{t('faq.questions.disasterTypesAnswer')}</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(t('faq.disasterTypes', { returnObjects: true })).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>{value as string}</span>
              </div>
            ))}
          </div>
        </div>
      ),
      icon: <AlertTriangle className="w-5 h-5" />,
      category: "reporting"
    },
    {
      question: t('faq.questions.severityLevels'),
      answer: (
        <div>
          <p className="mb-3">{t('faq.questions.severityLevelsAnswer')}</p>
          <div className="space-y-2">
            {Object.entries(t('faq.severity', { returnObjects: true })).map(([key, value], index) => {
              if (key.includes('Desc')) return null;
              const colors = ['bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-red-600'];
              const descKey = key + 'Desc';
              const description = t(`faq.severity.${descKey}`);
              return (
                <div key={key} className="flex items-center space-x-3">
                  <div className={`w-4 h-4 ${colors[index]} rounded`}></div>
                  <span className="font-medium">{value as string}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{description}</span>
                </div>
              );
            })}
          </div>
        </div>
      ),
      icon: <AlertTriangle className="w-5 h-5" />,
      category: "reporting"
    },
    {
      question: t('faq.questions.createAccount'),
      answer: (
        <div>
          <p className="mb-3">{t('faq.questions.createAccountAnswer')}</p>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>{t('faq.steps.step1')}</li>
            <li>{t('faq.steps.step2')}</li>
            <li>{t('faq.steps.step3')}
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>{t('faq.formFields.fullName')}</li>
                <li>{t('faq.formFields.emailAddress')}</li>
                <li>{t('faq.formFields.password')}</li>
                <li>{t('faq.formFields.phoneNumber')}</li>
              </ul>
            </li>
            <li>{t('faq.steps.step4')}</li>
            <li>{t('faq.steps.step5')}</li>
          </ol>
        </div>
      ),
      icon: <Users className="w-5 h-5" />,
      category: "account"
    },
    {
      question: t('faq.questions.submitReport'),
      answer: (
        <div>
          <p className="mb-3">{t('faq.questions.submitReportAnswer')}</p>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>{t('faq.steps.reportStep1')}</li>
            <li>{t('faq.steps.reportStep2')}</li>
            <li>{t('faq.steps.reportStep3')}
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>{t('faq.formFields.reportTitle')}</li>
                <li>{t('faq.formFields.disasterType')}</li>
                <li>{t('faq.formFields.severityLevel')}</li>
                <li>{t('faq.formFields.detailedDescription')}</li>
                <li>{t('faq.formFields.location')}</li>
                <li>{t('faq.formFields.coordinates')}</li>
                <li>{t('faq.formFields.mediaUpload')}</li>
              </ul>
            </li>
            <li>{t('faq.steps.reportStep4')}</li>
            <li>{t('faq.steps.reportStep5')}</li>
          </ol>
        </div>
      ),
      icon: <FileText className="w-5 h-5" />,
      category: "reporting"
    },
    {
      question: t('faq.questions.mediaFiles'),
      answer: (
        <div>
          <p className="mb-3">{t('faq.questions.mediaFilesAnswer')}</p>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium mb-2">{t('faq.mediaFormats.supportedImageFormats')}</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">JPEG</Badge>
                <Badge variant="outline">PNG</Badge>
                <Badge variant="outline">WebP</Badge>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">{t('faq.mediaFormats.supportedVideoFormats')}</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">MP4</Badge>
                <Badge variant="outline">MOV</Badge>
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <strong>{t('faq.mediaFormats.fileSizeLimit')}</strong> {t('faq.mediaFormats.maxFileSize')}
            </div>
          </div>
        </div>
      ),
      icon: <Camera className="w-5 h-5" />,
      category: "reporting"
    },
    {
      question: t('faq.questions.verificationProcess'),
      answer: (
        <div>
          <p className="mb-3">{t('faq.questions.verificationProcessAnswer')}</p>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h4 className="font-medium">{t('faq.verificationSteps.pending')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('faq.verificationSteps.pendingDesc')}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Shield className="w-3 h-3 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium">{t('faq.verificationSteps.verified')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('faq.verificationSteps.verifiedDesc')}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h4 className="font-medium">{t('faq.verificationSteps.rejected')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('faq.verificationSteps.rejectedDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      ),
      icon: <Shield className="w-5 h-5" />,
      category: "reporting"
    },
    {
      question: t('faq.questions.canComment'),
      answer: t('faq.questions.canCommentAnswer'),
      icon: <MessageSquare className="w-5 h-5" />,
      category: "community"
    },
    {
      question: t('faq.questions.howToVote'),
      answer: t('faq.questions.howToVoteAnswer'),
      icon: <MessageSquare className="w-5 h-5" />,
      category: "community"
    },
    {
      question: t('faq.questions.interactiveMap'),
      answer: t('faq.questions.interactiveMapAnswer'),
      icon: <MapPin className="w-5 h-5" />,
      category: "features"
    },
    {
      question: t('faq.questions.whatAnalytics'),
      answer: (
        <div>
          <p className="mb-3">{t('faq.questions.whatAnalyticsAnswer')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">{t('faq.analyticsCategories.reportAnalytics')}</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                {(t('faq.analyticsCategories.reportAnalyticsItems', { returnObjects: true }) as string[]).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">{t('faq.analyticsCategories.userAnalytics')}</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                {(t('faq.analyticsCategories.userAnalyticsItems', { returnObjects: true }) as string[]).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ),
      icon: <BarChart3 className="w-5 h-5" />,
      category: "features"
    },
    {
      question: t('faq.questions.adminFeatures'),
      answer: (
        <div>
          <p className="mb-3">{t('faq.questions.adminFeaturesAnswer')}</p>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium mb-2">{t('faq.adminCategories.reportManagement')}</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {(t('faq.adminCategories.reportManagementItems', { returnObjects: true }) as string[]).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">{t('faq.adminCategories.userManagement')}</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {(t('faq.adminCategories.userManagementItems', { returnObjects: true }) as string[]).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">{t('faq.adminCategories.analyticsDashboard')}</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {(t('faq.adminCategories.analyticsDashboardItems', { returnObjects: true }) as string[]).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ),
      icon: <Settings className="w-5 h-5" />,
      category: "admin"
    },
    {
      question: t('faq.questions.realTimeNotifications'),
      answer: t('faq.questions.realTimeNotificationsAnswer'),
      icon: <Globe className="w-5 h-5" />,
      category: "features"
    },
    {
      question: t('faq.questions.dataSecurity'),
      answer: (
        <div>
          <p className="mb-3">{t('faq.questions.dataSecurityAnswer')}</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {(t('faq.securityMeasures', { returnObjects: true }) as string[]).map((measure, index) => (
              <li key={index}><strong>{measure.split(':')[0]}:</strong> {measure.split(':')[1]}</li>
            ))}
          </ul>
        </div>
      ),
      icon: <Shield className="w-5 h-5" />,
      category: "security"
    },
    {
      question: t('faq.questions.editDeleteReports'),
      answer: t('faq.questions.editDeleteReportsAnswer'),
      icon: <FileText className="w-5 h-5" />,
      category: "account"
    },
    {
      question: t('faq.questions.contactSupport'),
      answer: (
        <div>
          <p className="mb-3">{t('faq.questions.contactSupportAnswer')}</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <span>{t('faq.contact.email')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-blue-600" />
              <span>{t('faq.contact.phone')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>{t('faq.contact.website')}</span>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {t('faq.contact.responseTime')}
          </p>
        </div>
      ),
      icon: <Phone className="w-5 h-5" />,
      category: "support"
    },
    {
      question: t('faq.questions.mobileDevices'),
      answer: t('faq.questions.mobileDevicesAnswer'),
      icon: <Globe className="w-5 h-5" />,
      category: "technical"
    },
    {
      question: t('faq.questions.supportedBrowsers'),
      answer: t('faq.questions.supportedBrowsersAnswer'),
      icon: <Globe className="w-5 h-5" />,
      category: "technical"
    }
  ];

  const categories = [
    { name: "all", count: faqData.length, label: t('faq.all') },
    { name: "general", count: faqData.filter(item => item.category === "general").length, label: t('faq.general') },
    { name: "account", count: faqData.filter(item => item.category === "account").length, label: t('faq.account') },
    { name: "reporting", count: faqData.filter(item => item.category === "reporting").length, label: t('faq.reporting') },
    { name: "community", count: faqData.filter(item => item.category === "community").length, label: t('faq.community') },
    { name: "features", count: faqData.filter(item => item.category === "features").length, label: t('faq.features') },
    { name: "admin", count: faqData.filter(item => item.category === "admin").length, label: t('faq.admin') },
    { name: "security", count: faqData.filter(item => item.category === "security").length, label: t('faq.security') },
    { name: "support", count: faqData.filter(item => item.category === "support").length, label: t('faq.support') },
    { name: "technical", count: faqData.filter(item => item.category === "technical").length, label: t('faq.technical') }
  ];

  const filteredFAQs = faqData.filter(item => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof item.answer === 'string' && item.answer.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('faq.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t('faq.subtitle')}
          </p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('faq.searchFaq')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <HelpCircle className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                </div>
              </div>
              
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.name}
                    variant={selectedCategory === category.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.name)}
                    className="text-xs"
                  >
                    {category.label} ({category.count})
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                icon={faq.icon}
                category={faq.category}
              />
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('faq.noResults')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('postFeed.tryAdjustingSearch')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contact Section */}
        <Card className="mt-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('faq.stillHaveQuestions')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('faq.questions.contactSupportAnswer')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Mail className="w-4 h-4 mr-2" />
                  {t('faq.contactSupport')}
                </Button>
                <Button variant="outline">
                  <Phone className="w-4 h-4 mr-2" />
                  {t('disasterInfo.emergencyContacts.callNow')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
