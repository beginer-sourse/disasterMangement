import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Waves, 
  Wind, 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Clock,
  Shield,
  Package,
  BookOpen,
  Download,
  Search,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';

const getDisasterTypes = (t: any) => [
  {
    id: 'tsunami',
    name: t('disasterInfo.disasterTypes.tsunami.name'),
    icon: Waves,
    color: 'from-blue-500 to-cyan-500',
    description: t('disasterInfo.disasterTypes.tsunami.description'),
    warningSigns: t('disasterInfo.disasterTypes.tsunami.warningSignsList', { returnObjects: true }),
    safetyTips: t('disasterInfo.disasterTypes.tsunami.safetyTipsList', { returnObjects: true }),
    emergencyContacts: [
      { name: t('disasterInfo.emergencyContacts.nationalEmergency'), number: '112' },
      { name: t('disasterInfo.emergencyContacts.coastGuard'), number: '1554' },
      { name: t('disasterInfo.emergencyContacts.disasterManagement'), number: '1078' }
    ]
  },
  {
    id: 'cyclone',
    name: t('disasterInfo.disasterTypes.cyclone.name'),
    icon: Wind,
    color: 'from-purple-500 to-pink-500',
    description: t('disasterInfo.disasterTypes.cyclone.description'),
    warningSigns: t('disasterInfo.disasterTypes.cyclone.warningSignsList', { returnObjects: true }),
    safetyTips: t('disasterInfo.disasterTypes.cyclone.safetyTipsList', { returnObjects: true }),
    emergencyContacts: [
      { name: t('disasterInfo.emergencyContacts.nationalEmergency'), number: '112' },
      { name: t('disasterInfo.emergencyContacts.contacts.meteorological'), number: '1541' },
      { name: t('disasterInfo.emergencyContacts.contacts.police'), number: '100' }
    ]
  },
  {
    id: 'flood',
    name: t('disasterInfo.disasterTypes.flood.name'),
    icon: Waves,
    color: 'from-teal-500 to-blue-500',
    description: t('disasterInfo.disasterTypes.flood.description'),
    warningSigns: t('disasterInfo.disasterTypes.flood.warningSignsList', { returnObjects: true }),
    safetyTips: t('disasterInfo.disasterTypes.flood.safetyTipsList', { returnObjects: true }),
    emergencyContacts: [
      { name: t('disasterInfo.emergencyContacts.nationalEmergency'), number: '112' },
      { name: t('disasterInfo.emergencyContacts.contacts.fireRescue'), number: '101' },
      { name: t('disasterInfo.emergencyContacts.contacts.medical'), number: '108' }
    ]
  },
  {
    id: 'oil-spill',
    name: t('disasterInfo.disasterTypes.oilSpill.name'),
    icon: AlertTriangle,
    color: 'from-red-500 to-orange-500',
    description: t('disasterInfo.disasterTypes.oilSpill.description'),
    warningSigns: t('disasterInfo.disasterTypes.oilSpill.warningSignsList', { returnObjects: true }),
    safetyTips: t('disasterInfo.disasterTypes.oilSpill.safetyTipsList', { returnObjects: true }),
    emergencyContacts: [
      { name: t('disasterInfo.emergencyContacts.coastGuard'), number: '1554' },
      { name: t('disasterInfo.emergencyContacts.contacts.pollutionControl'), number: '1800-11-0000' },
      { name: t('disasterInfo.emergencyContacts.contacts.medical'), number: '108' }
    ]
  }
];

const getEmergencyKit = (t: any) => [
  { category: t('disasterInfo.emergencyKit.categories.waterFood'), items: t('disasterInfo.emergencyKit.items.waterFood', { returnObjects: true }) },
  { category: t('disasterInfo.emergencyKit.categories.safetyTools'), items: t('disasterInfo.emergencyKit.items.safetyTools', { returnObjects: true }) },
  { category: t('disasterInfo.emergencyKit.categories.personalItems'), items: t('disasterInfo.emergencyKit.items.personalItems', { returnObjects: true }) },
  { category: t('disasterInfo.emergencyKit.categories.clothing'), items: t('disasterInfo.emergencyKit.items.clothing', { returnObjects: true }) }
];

const evacuationCenters = [
  { name: 'Mumbai Central Evacuation Center', address: 'Oval Maidan, Mumbai', capacity: '5000 people', distance: '2.3 km' },
  { name: 'Goa Emergency Shelter', address: 'Panaji Community Hall, Goa', capacity: '2000 people', distance: '5.7 km' },
  { name: 'Chennai Coastal Relief Center', address: 'Marina Beach Complex, Chennai', capacity: '3000 people', distance: '1.8 km' },
  { name: 'Kochi Safety Zone', address: 'Marine Drive Stadium, Kochi', capacity: '2500 people', distance: '4.2 km' }
];

export function DisasterInfo() {
  const { t } = useTranslation();
  const [selectedDisaster, setSelectedDisaster] = useState('tsunami');
  const [searchQuery, setSearchQuery] = useState('');

  const disasterTypes = getDisasterTypes(t);
  const emergencyKit = getEmergencyKit(t);
  const currentDisaster = disasterTypes.find(d => d.id === selectedDisaster);
  const Icon = currentDisaster?.icon || Waves;

  const filteredCenters = evacuationCenters.filter(center =>
    center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    center.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            {t('disasterInfo.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {t('disasterInfo.subtitle')}
          </p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 text-white">
          <Download className="w-4 h-4 mr-2" />
          {t('disasterInfo.downloadGuide')}
        </Button>
      </div>

      <Tabs defaultValue="disaster-types" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="disaster-types">{t('disasterInfo.tabs.disasterTypes')}</TabsTrigger>
          <TabsTrigger value="emergency-kit">{t('disasterInfo.tabs.emergencyKit')}</TabsTrigger>
          <TabsTrigger value="evacuation">{t('disasterInfo.tabs.evacuation')}</TabsTrigger>
          <TabsTrigger value="contacts">{t('disasterInfo.tabs.contacts')}</TabsTrigger>
        </TabsList>

        <TabsContent value="disaster-types" className="space-y-6">
          {/* Disaster Type Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {disasterTypes.map((disaster) => {
              const DisasterIcon = disaster.icon;
              return (
                <Card 
                  key={disaster.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedDisaster === disaster.id 
                      ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-950/20' 
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => setSelectedDisaster(disaster.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br ${disaster.color} flex items-center justify-center`}>
                      <DisasterIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm">{disaster.name}</h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Selected Disaster Information */}
          {currentDisaster && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Info */}
              <Card className="lg:col-span-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${currentDisaster.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span>{currentDisaster.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">{t('disasterInfo.disasterTypes.whatIs', { disaster: currentDisaster.name })}</h4>
                    <p className="text-gray-600 dark:text-gray-400">{currentDisaster.description}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span>{t('disasterInfo.disasterTypes.warningSigns')}</span>
                    </h4>
                    <ul className="space-y-2">
                      {currentDisaster.warningSigns.map((sign, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{sign}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>{t('disasterInfo.disasterTypes.safetyTips')}</span>
                    </h4>
                    <ul className="space-y-2">
                      {currentDisaster.safetyTips.map((tip, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contacts */}
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Phone className="w-5 h-5 text-red-500" />
                    <span>{t('disasterInfo.emergencyContacts.additionalContacts')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentDisaster.emergencyContacts.map((contact, index) => (
                    <div key={index} className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{contact.name}</p>
                          <p className="text-lg font-bold text-red-600">{contact.number}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Phone className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 text-center">
                      {t('disasterInfo.emergencyContacts.saveNumbers')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="emergency-kit" className="space-y-6">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-500" />
                <span>{t('disasterInfo.emergencyKit.title')}</span>
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                {t('disasterInfo.emergencyKit.subtitle')}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {emergencyKit.map((category, index) => (
                  <div key={index} className="space-y-3">
                    <h3 className="font-semibold text-lg flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">{index + 1}</span>
                      </div>
                      <span>{category.category}</span>
                    </h3>
                    <ul className="space-y-2">
                      {category.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">{t('disasterInfo.emergencyKit.importantReminder')}</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      {t('disasterInfo.emergencyKit.reminderText')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evacuation" className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={t('disasterInfo.evacuation.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Evacuation Centers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCenters.map((center, index) => (
              <Card key={index} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{center.name}</h3>
                        <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <MapPin className="w-4 h-4" />
                          <span>{center.address}</span>
                        </div>
                      </div>
                      <Badge variant="secondary">{center.distance}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                        <Shield className="w-4 h-4" />
                        <span>{t('disasterInfo.evacuation.capacity')}: {center.capacity}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <MapPin className="w-4 h-4 mr-2" />
                        {t('disasterInfo.evacuation.getDirections')}
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Phone className="w-4 h-4 mr-2" />
                        {t('disasterInfo.evacuation.contact')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200">{t('disasterInfo.evacuation.evacuationTips')}</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 mt-1 space-y-1">
                    {t('disasterInfo.evacuation.tips', { returnObjects: true }).map((tip: string, index: number) => (
                      <li key={index}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* National Emergency Services */}
            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="w-5 h-5" />
                  <span>{t('disasterInfo.emergencyContacts.nationalEmergency')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">112</div>
                  <p className="text-sm opacity-90">{t('disasterInfo.emergencyContacts.singleEmergencyNumber')}</p>
                </div>
                <Button variant="secondary" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  {t('disasterInfo.emergencyContacts.callNow')}
                </Button>
              </CardContent>
            </Card>

            {/* Coast Guard */}
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Waves className="w-5 h-5" />
                  <span>{t('disasterInfo.emergencyContacts.coastGuard')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">1554</div>
                  <p className="text-sm opacity-90">{t('disasterInfo.emergencyContacts.marineEmergencies')}</p>
                </div>
                <Button variant="secondary" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  {t('disasterInfo.emergencyContacts.callNow')}
                </Button>
              </CardContent>
            </Card>

            {/* Disaster Management */}
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>{t('disasterInfo.emergencyContacts.disasterManagement')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">1078</div>
                  <p className="text-sm opacity-90">{t('disasterInfo.emergencyContacts.disasterResponse')}</p>
                </div>
                <Button variant="secondary" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  {t('disasterInfo.emergencyContacts.callNow')}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Additional Contacts */}
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle>{t('disasterInfo.emergencyContacts.additionalContacts')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: t('disasterInfo.emergencyContacts.contacts.fireRescue'), number: '101', description: t('disasterInfo.emergencyContacts.descriptions.fireRescue') },
                  { name: t('disasterInfo.emergencyContacts.contacts.police'), number: '100', description: t('disasterInfo.emergencyContacts.descriptions.police') },
                  { name: t('disasterInfo.emergencyContacts.contacts.medical'), number: '108', description: t('disasterInfo.emergencyContacts.descriptions.medical') },
                  { name: t('disasterInfo.emergencyContacts.contacts.pollutionControl'), number: '1800-11-0000', description: t('disasterInfo.emergencyContacts.descriptions.pollutionControl') },
                  { name: t('disasterInfo.emergencyContacts.contacts.meteorological'), number: '1541', description: t('disasterInfo.emergencyContacts.descriptions.meteorological') },
                  { name: t('disasterInfo.emergencyContacts.contacts.highways'), number: '1033', description: t('disasterInfo.emergencyContacts.descriptions.highways') }
                ].map((contact, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">{contact.name}</h4>
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-lg font-bold text-red-600 mb-1">{contact.number}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{contact.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}