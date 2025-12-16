import React from 'react';
import { MapPin, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useTranslation } from 'react-i18next';

interface StateFilterProps {
  selectedState: string;
  onStateChange: (state: string) => void;
  collapsed: boolean;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export function StateFilter({ selectedState, onStateChange, collapsed }: StateFilterProps) {
  const { t } = useTranslation();

  const handleStateChange = (value: string) => {
    onStateChange(value === 'all' ? '' : value);
  };

  const clearFilter = () => {
    onStateChange('');
  };

  if (collapsed) {
    return (
      <div className="px-3 py-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onStateChange(selectedState ? '' : 'Maharashtra')} // Toggle between no filter and Maharashtra
          className="w-8 h-8"
          title={selectedState ? `Filtered by: ${selectedState}` : 'Filter by state'}
        >
          <MapPin className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="px-3 py-2 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
          <MapPin className="h-4 w-4 mr-2" />
          {t('filters.state')}
        </h3>
        {selectedState && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilter}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      <Select value={selectedState || 'all'} onValueChange={handleStateChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t('filters.selectState')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('filters.allStates')}</SelectItem>
          {INDIAN_STATES.map((state) => (
            <SelectItem key={state} value={state}>
              {state}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedState && (
        <div className="flex items-center justify-center">
          <Badge variant="secondary" className="text-xs">
            {selectedState}
          </Badge>
        </div>
      )}
    </div>
  );
}
