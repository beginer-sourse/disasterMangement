import React, { useState } from 'react';
import { 
  Upload, 
  MapPin, 
  AlertTriangle, 
  Camera, 
  FileText,
  Loader2,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { reportsAPI } from '../services/api';

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportModal({ open, onOpenChange }: ReportModalProps) {
  const { t } = useTranslation();
  const { token } = useAuth();

  const disasterTypes = [
    { value: 'Flood', label: t('faq.disasterTypes.flood') },
    { value: 'Cyclone', label: t('faq.disasterTypes.cyclone') },
    { value: 'Tsunami', label: t('faq.disasterTypes.tsunami') },
    { value: 'Oil Spill', label: t('faq.disasterTypes.oilSpill') },
    { value: 'Coastal Erosion', label: t('faq.disasterTypes.coastalErosion') },
    { value: 'High Waves', label: t('faq.disasterTypes.highWaves') },
    { value: 'Storm Surge', label: t('faq.disasterTypes.stormSurge') },
    { value: 'Water Pollution', label: t('faq.disasterTypes.waterPollution') },
    { value: 'Marine Debris', label: t('faq.disasterTypes.marineDebris') },
    { value: 'Other', label: t('faq.disasterTypes.other') }
  ];

  const severityLevels = [
    { value: 'LOW', label: t('faq.severity.low'), color: 'bg-green-500' },
    { value: 'MEDIUM', label: t('faq.severity.medium'), color: 'bg-yellow-500' },
    { value: 'HIGH', label: t('faq.severity.high'), color: 'bg-red-500' },
    { value: 'CRITICAL', label: t('faq.severity.critical'), color: 'bg-red-500' }
  ];
  const [formData, setFormData] = useState({
    title: '',
    disasterType: '',
    severity: '',
    description: '',
    location: '',
    latitude: '',
    longitude: '',
    media: null as File | null
  });
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error(t('reportModal.validation.fileSizeLimit'));
      return;
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      toast.error(t('reportModal.validation.invalidFileType'));
      return;
    }

    setFormData(prev => ({ ...prev, media: file }));
    toast.success(`${file.name} uploaded successfully`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({ 
            ...prev, 
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6)
          }));
          toast.success(t('reportModal.validation.locationCaptured'));
        },
        (error) => {
          toast.error(t('reportModal.validation.locationError'));
        }
      );
    } else {
      toast.error(t('reportModal.validation.geolocationNotSupported'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.title || !formData.disasterType || !formData.severity || !formData.description) {
      toast.error(t('reportModal.validation.fillRequiredFields'));
      setLoading(false);
      return;
    }

    // Validate location
    if (!formData.location.trim()) {
      toast.error(t('reportModal.validation.enterLocation'));
      setLoading(false);
      return;
    }

    // Validate coordinates
    if (!formData.latitude || !formData.longitude) {
      toast.error(t('reportModal.validation.provideCoordinates'));
      setLoading(false);
      return;
    }

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    if (isNaN(lat) || isNaN(lng)) {
      toast.error(t('reportModal.validation.validCoordinates'));
      setLoading(false);
      return;
    }

    // Validate coordinates are within India boundaries
    if (lat < 6 || lat > 37 || lng < 68 || lng > 97) {
      toast.error(t('reportModal.validation.coordinatesWithinIndia'));
      setLoading(false);
      return;
    }

    if (!token) {
      toast.error(t('reportModal.validation.loginRequired'));
      setLoading(false);
      return;
    }

    console.log('Form data being submitted:', formData);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('disasterType', formData.disasterType);
      submitData.append('severity', formData.severity);
      submitData.append('description', formData.description);
      submitData.append('location', formData.location);
      
      if (formData.latitude && formData.longitude) {
        // Validate and send coordinates
        const lat = parseFloat(formData.latitude);
        const lng = parseFloat(formData.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          submitData.append('coordinates[latitude]', lat.toString());
          submitData.append('coordinates[longitude]', lng.toString());
        }
      }
      
      if (formData.media) {
        submitData.append('media', formData.media);
      }

      // Debug: Log the form data being sent
      console.log('Form data being sent:');
      for (let [key, value] of submitData.entries()) {
        console.log(key, value);
      }

      const response = await reportsAPI.createReport(token, submitData);
      
      if (response.success) {
        toast.success(t('reportModal.validation.reportSubmittedSuccess'));
        
        // Reset form
        setFormData({
          title: '', disasterType: '', severity: '',
          description: '', location: '', latitude: '', longitude: '', media: null
        });
        
        onOpenChange(false);
      } else {
        toast.error(response.message || t('reportModal.validation.reportSubmitError'));
      }
    } catch (error) {
      console.error('Report submission error:', error);
      toast.error(`${t('reportModal.validation.reportSubmitError')}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>{t('reportModal.title')}</span>
          </DialogTitle>
          <DialogDescription>
            {t('reportModal.subtitle')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Disaster Information */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300">{t('reportModal.disasterInformation')}</h3>
              
              <div>
                <Label htmlFor="title">{t('reportModal.reportTitle')}</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder={t('reportModal.reportTitlePlaceholder')}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="disasterType">{t('reportModal.disasterType')}</Label>
                  <Select value={formData.disasterType} onValueChange={(value) => handleInputChange('disasterType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('reportModal.selectDisasterType')} />
                    </SelectTrigger>
                    <SelectContent>
                      {disasterTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="severity">{t('reportModal.severityLevel')}</Label>
                  <Select value={formData.severity} onValueChange={(value) => handleInputChange('severity', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('reportModal.selectSeverity')} />
                    </SelectTrigger>
                    <SelectContent>
                      {severityLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${level.color}`}></div>
                            <span>{level.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">{t('reportModal.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('reportModal.descriptionPlaceholder')}
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300">{t('reportModal.locationInformation')}</h3>
              
              <div>
                <Label htmlFor="location">{t('reportModal.locationAddress')}</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder={t('reportModal.locationPlaceholder')}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">{t('reportModal.gpsCoordinates')}</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={getCurrentLocation}
                    className="text-xs bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                  >
                    <MapPin className="w-3 h-3 mr-1" />
                    {t('reportModal.getCurrentLocation')}
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="latitude" className="text-xs text-gray-600 dark:text-gray-400">
                      {t('reportModal.latitude')}
                    </Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => handleInputChange('latitude', e.target.value)}
                      placeholder={t('reportModal.latitudePlaceholder')}
                      className="text-sm"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude" className="text-xs text-gray-600 dark:text-gray-400">
                      {t('reportModal.longitude')}
                    </Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => handleInputChange('longitude', e.target.value)}
                      placeholder={t('reportModal.longitudePlaceholder')}
                      className="text-sm"
                      required
                    />
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>{t('common.required')}:</strong> {t('reportModal.coordinatesNote')}
                  <br />
                  <strong>{t('common.note')}:</strong> {t('reportModal.coordinatesBoundaryNote')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Media Upload */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300">{t('reportModal.mediaUpload')}</h3>
              
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
              >
                {formData.media ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center space-x-2">
                      {formData.media.type.startsWith('image/') ? (
                        <Camera className="w-8 h-8 text-green-500" />
                      ) : (
                        <FileText className="w-8 h-8 text-green-500" />
                      )}
                      <div>
                        <p className="font-medium">{formData.media.name}</p>
                        <p className="text-sm text-gray-500">
                          {(formData.media.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, media: null }))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-12 h-12 mx-auto text-gray-400" />
                    <div>
                      <p className="text-lg font-medium">{t('reportModal.dropFilesHere')}</p>
                      <p className="text-sm text-gray-500">
                        {t('reportModal.supportedFormats')}
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      id="file-upload"
                      accept="image/*,video/*"
                      onChange={handleFileInput}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      {t('reportModal.chooseFile')}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t('reportModal.cancel')}
            </Button>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('reportModal.submitting')}
                </>
              ) : (
                t('reportModal.submitReport')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}