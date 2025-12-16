import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  AlertTriangle, 
  Phone, 
  Package, 
  MapPin,
  Info,
  Shield,
  Waves,
  Wind,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const getInfoCards = (t: any) => [
  {
    id: 1,
    title: t('infoCards.floodSafety.title'),
    category: t('infoCards.floodSafety.category'),
    icon: Waves,
    color: '#dcfce7', // green-100
    textColor: 'text-black',
    content: t('infoCards.floodSafety.content'),
    action: t('infoCards.floodSafety.action'),
    expandedContent: {
      description: t('infoCards.floodSafety.description'),
      keySteps: t('infoCards.floodSafety.keySteps', { returnObjects: true }),
      warningSigns: t('infoCards.floodSafety.warningSigns', { returnObjects: true }),
      emergencyNumbers: t('infoCards.floodSafety.emergencyNumbers', { returnObjects: true })
    }
  },
  {
    id: 2,
    title: t('infoCards.emergencyContacts.title'),
    category: t('infoCards.emergencyContacts.category'),
    icon: Phone,
    color: '#fecaca', // rose-100
    textColor: 'text-black',
    content: t('infoCards.emergencyContacts.content'),
    action: t('infoCards.emergencyContacts.action'),
    expandedContent: {
      description: t('infoCards.emergencyContacts.description'),
      emergencyNumbers: t('infoCards.emergencyContacts.emergencyNumbers', { returnObjects: true }),
      tips: t('infoCards.emergencyContacts.tips', { returnObjects: true })
    }
  },
  {
    id: 3,
    title: t('infoCards.emergencyKit.title'),
    category: t('infoCards.emergencyKit.category'),
    icon: Package,
    color: '#dbeafe', // blue-100
    textColor: 'text-black',
    content: t('infoCards.emergencyKit.content'),
    action: t('infoCards.emergencyKit.action'),
    expandedContent: {
      description: t('infoCards.emergencyKit.description'),
      essentials: t('infoCards.emergencyKit.essentials', { returnObjects: true }),
      additionalTips: t('infoCards.emergencyKit.additionalTips', { returnObjects: true })
    }
  },
  {
    id: 4,
    title: t('infoCards.evacuationRoutes.title'),
    category: t('infoCards.evacuationRoutes.category'),
    icon: MapPin,
    color: '#e9d5ff', // purple-100
    textColor: 'text-black',
    content: t('infoCards.evacuationRoutes.content'),
    action: t('infoCards.evacuationRoutes.action'),
    expandedContent: {
      description: t('infoCards.evacuationRoutes.description'),
      planningSteps: t('infoCards.evacuationRoutes.planningSteps', { returnObjects: true }),
      evacuationCenters: t('infoCards.evacuationRoutes.evacuationCenters', { returnObjects: true }),
      importantNotes: t('infoCards.evacuationRoutes.importantNotes', { returnObjects: true })
    }
  }
];

const getCategoryBadgeColor = (category: string) => {
  switch (category) {
    case 'ALERT':
    case 'अलर्ट':
    case 'எச்சரிக்கை': return 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400';
    case 'INFO':
    case 'जानकारी':
    case 'தகவல்': return 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400';
    case 'SAFETY':
    case 'सुरक्षा':
    case 'பாதுகாப்பு': return 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-950/20 dark:text-gray-400';
  }
};

export function InfoCards() {
  const { t } = useTranslation();
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  
  const infoCards = getInfoCards(t);

  const toggleExpanded = (cardId: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const renderExpandedContent = (card: any) => {
    if (!card.expandedContent) return null;

    const { expandedContent } = card;
    const isExpanded = expandedCards.has(card.id);

    if (!isExpanded) return null;

    return (
      <div className="mt-4 pt-4 border-t border-white/20 animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-4">
            {/* Description */}
            <p className="text-sm leading-relaxed text-black">
              {expandedContent.description}
            </p>

            {/* Key Steps */}
            {expandedContent.keySteps && (
              <div>
                <h4 className="text-sm font-semibold mb-2 opacity-95">Key Steps:</h4>
                <ul className="space-y-1">
                  {expandedContent.keySteps.map((step: string, index: number) => (
                    <li key={index} className="text-sm opacity-90 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warning Signs */}
            {expandedContent.warningSigns && (
              <div>
                <h4 className="text-sm font-semibold mb-2 opacity-95">Warning Signs:</h4>
                <ul className="space-y-1">
                  {expandedContent.warningSigns.map((sign: string, index: number) => (
                    <li key={index} className="text-sm opacity-90 flex items-start">
                      <span className="mr-2">⚠️</span>
                      <span>{sign}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Emergency Numbers */}
            {expandedContent.emergencyNumbers && (
              <div>
                <h4 className="text-sm font-semibold mb-2 opacity-95">Emergency Numbers:</h4>
                <div className="space-y-2">
                  {expandedContent.emergencyNumbers.map((contact: any, index: number) => (
                    <div key={index} className="text-sm opacity-90">
                      {typeof contact === 'string' ? (
                        <span>{contact}</span>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{contact.name}</span>
                          <span className="font-mono">{contact.number}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Essentials (for Emergency Kit) */}
            {expandedContent.essentials && (
              <div>
                <h4 className="text-sm font-semibold mb-2 opacity-95">Emergency Kit Essentials:</h4>
                <div className="space-y-3">
                  {expandedContent.essentials.map((category: any, index: number) => (
                    <div key={index}>
                      <h5 className="text-sm font-medium opacity-95 mb-1">{category.category}:</h5>
                      <ul className="space-y-1 ml-2">
                        {category.items.map((item: string, itemIndex: number) => (
                          <li key={itemIndex} className="text-sm opacity-90 flex items-start">
                            <span className="mr-2">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evacuation Centers */}
            {expandedContent.evacuationCenters && (
              <div>
                <h4 className="text-sm font-semibold mb-2 opacity-95">Evacuation Centers:</h4>
                <div className="space-y-2">
                  {expandedContent.evacuationCenters.map((center: any, index: number) => (
                    <div key={index} className="text-sm opacity-90 bg-white/10 p-2 rounded">
                      <div className="font-medium">{center.name}</div>
                      <div className="text-xs opacity-75">{center.address}</div>
                      <div className="text-xs opacity-75">Distance: {center.distance} | Capacity: {center.capacity}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Before/During/After sections (for Cyclone) */}
            {expandedContent.beforeCyclone && (
              <div>
                <h4 className="text-sm font-semibold mb-2 opacity-95">Before Cyclone:</h4>
                <ul className="space-y-1">
                  {expandedContent.beforeCyclone.map((item: string, index: number) => (
                    <li key={index} className="text-sm opacity-90 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {expandedContent.duringCyclone && (
              <div>
                <h4 className="text-sm font-semibold mb-2 opacity-95">During Cyclone:</h4>
                <ul className="space-y-1">
                  {expandedContent.duringCyclone.map((item: string, index: number) => (
                    <li key={index} className="text-sm opacity-90 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {expandedContent.afterCyclone && (
              <div>
                <h4 className="text-sm font-semibold mb-2 opacity-95">After Cyclone:</h4>
                <ul className="space-y-1">
                  {expandedContent.afterCyclone.map((item: string, index: number) => (
                    <li key={index} className="text-sm opacity-90 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Natural Warning Signs (for Tsunami) */}
            {expandedContent.naturalWarningSigns && (
              <div>
                <h4 className="text-sm font-semibold mb-2 opacity-95">Natural Warning Signs:</h4>
                <ul className="space-y-1">
                  {expandedContent.naturalWarningSigns.map((sign: string, index: number) => (
                    <li key={index} className="text-sm opacity-90 flex items-start">
                      <span className="mr-2">🌊</span>
                      <span>{sign}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Official Warnings (for Tsunami) */}
            {expandedContent.officialWarnings && (
              <div>
                <h4 className="text-sm font-semibold mb-2 opacity-95">Official Warnings:</h4>
                <ul className="space-y-1">
                  {expandedContent.officialWarnings.map((warning: string, index: number) => (
                    <li key={index} className="text-sm opacity-90 flex items-start">
                      <span className="mr-2">📢</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Immediate Actions (for Tsunami) */}
            {expandedContent.immediateActions && (
              <div>
                <h4 className="text-sm font-semibold mb-2 opacity-95">Immediate Actions:</h4>
                <ul className="space-y-1">
                  {expandedContent.immediateActions.map((action: string, index: number) => (
                    <li key={index} className="text-sm opacity-90 flex items-start">
                      <span className="mr-2">⚡</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Safety Tips */}
            {expandedContent.safetyTips && (
              <div>
                <h4 className="text-sm font-semibold mb-2 opacity-95">Safety Tips:</h4>
                <ul className="space-y-1">
                  {expandedContent.safetyTips.map((tip: string, index: number) => (
                    <li key={index} className="text-sm opacity-90 flex items-start">
                      <span className="mr-2">💡</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Additional Tips */}
            {expandedContent.additionalTips && (
              <div>
                <h4 className="text-sm font-semibold mb-2 opacity-95">Additional Tips:</h4>
                <ul className="space-y-1">
                  {expandedContent.additionalTips.map((tip: string, index: number) => (
                    <li key={index} className="text-sm opacity-90 flex items-start">
                      <span className="mr-2">💡</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tips (for Emergency Contacts) */}
            {expandedContent.tips && (
              <div>
                <h4 className="text-sm font-semibold mb-2 opacity-95">Tips:</h4>
                <ul className="space-y-1">
                  {expandedContent.tips.map((tip: string, index: number) => (
                    <li key={index} className="text-sm opacity-90 flex items-start">
                      <span className="mr-2">💡</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Important Notes */}
            {expandedContent.importantNotes && (
              <div>
                <h4 className="text-sm font-semibold mb-2 opacity-95">Important Notes:</h4>
                <ul className="space-y-1">
                  {expandedContent.importantNotes.map((note: string, index: number) => (
                    <li key={index} className="text-sm opacity-90 flex items-start">
                      <span className="mr-2">📝</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Planning Steps (for Evacuation Routes) */}
            {expandedContent.planningSteps && (
              <div>
                <h4 className="text-sm font-semibold mb-2 opacity-95">Planning Steps:</h4>
                <ul className="space-y-1">
                  {expandedContent.planningSteps.map((step: string, index: number) => (
                    <li key={index} className="text-sm opacity-90 flex items-start">
                      <span className="mr-2">📋</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('dashboard.safetyInformation', 'Safety Information')}</h3>
        <Button variant="outline" size="sm">
          {t('common.viewAll', 'View All')}
        </Button>
      </div>
      
      <div className="space-y-3">
        {infoCards.map((card) => {
          const Icon = card.icon;
          const isExpanded = expandedCards.has(card.id);
          return (
            <Card 
              key={card.id} 
              className={`border-0 ${card.textColor} hover:shadow-lg transition-all duration-200`}
              style={{ backgroundColor: card.color }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-5 h-5 ${card.textColor}`} />
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  </div>
                  <Badge className={getCategoryBadgeColor(card.category)}>
                    {card.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm mb-3 leading-relaxed text-black">
                  {card.content}
                </p>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="bg-black/10 hover:bg-black/20 border-black/20 text-black font-medium"
                  onClick={() => toggleExpanded(card.id)}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" />
                      {t('common.less', 'Show Less')}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      {card.action}
                    </>
                  )}
                </Button>
                {renderExpandedContent(card)}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <Card 
        className="backdrop-blur-md border-purple-200/60 dark:border-purple-700/40 hover:shadow-md transition-all duration-200 mt-6"
        style={{ backgroundColor: '#faf5ff' }} // purple-50
      >
        <CardHeader>
          <CardTitle className="text-sm text-black dark:text-purple-200">{t('dashboard.todaysSummary', 'Today\'s Summary')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.activeAlerts', 'Active Alerts')}</span>
            <Badge variant="destructive">5</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.newReports', 'New Reports')}</span>
            <Badge variant="secondary">23</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.responseTeams', 'Response Teams')}</span>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400">8 {t('common.active', 'Active')}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}