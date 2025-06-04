import React from 'react';
import { Card, CardBody, CardHeader, CardFooter, Input, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Divider } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { addDays, format } from 'date-fns';

interface UploadFormProps {
  onUpload: (formData: FormData) => Promise<void>;
  loading: boolean;
}

export const UploadForm: React.FC<UploadFormProps> = ({ onUpload, loading }) => {
  const { t } = useTranslation();
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [expirationDays, setExpirationDays] = React.useState(14); // Default to 2 weeks
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const categories = [
    'electronics',
    'clothing',
    'furniture',
    'food',
    'beauty',
    'sports',
    'toys',
    'books',
    'other'
  ];
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(t('images.fileTooLarge'));
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      alert(t('images.invalidFileType'));
      return;
    }
    
    setSelectedFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !title || !category) {
      alert(t('images.fillRequiredFields'));
      return;
    }
    
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('expiresAt', addDays(new Date(), expirationDays).toISOString());
    
    try {
      await onUpload(formData);
      
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    // Check file size and type as above
    if (file.size > 5 * 1024 * 1024) {
      alert(t('images.fileTooLarge'));
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      alert(t('images.invalidFileType'));
      return;
    }
    
    setSelectedFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <h2 className="text-xl font-semibold">{t('images.uploadNewImage')}</h2>
      </CardHeader>
      <Divider />
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            className="border-2 border-dashed border-default-300 rounded-lg p-6 text-center cursor-pointer hover:bg-default-50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-md"
                />
                <Button
                  isIconOnly
                  size="sm"
                  color="danger"
                  variant="flat"
                  className="absolute top-2 right-2"
                  onPress={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  <Icon icon="lucide:x" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Icon icon="lucide:upload-cloud" className="text-default-400" width={48} height={48} />
                <p className="mt-2 text-default-600">{t('images.dragAndDrop')}</p>
                <p className="text-tiny text-default-400 mt-1">{t('images.maxFileSize')}</p>
              </div>
            )}
          </div>
          
          <Input
            label={t('images.title')}
            placeholder={t('images.enterTitle')}
            value={title}
            onValueChange={setTitle}
            isRequired
          />
          
          <Input
            label={t('images.description')}
            placeholder={t('images.enterDescription')}
            value={description}
            onValueChange={setDescription}
          />
          
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                className="w-full justify-start"
                endContent={<Icon icon="lucide:chevron-down" width={16} />}
              >
                {category ? t(`categories.${category}`) : t('images.selectCategory')}
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Categories">
              {categories.map((cat) => (
                <DropdownItem
                  key={cat}
                  onPress={() => setCategory(cat)}
                >
                  {t(`categories.${cat}`)}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          
          <div>
            <p className="text-small mb-1">{t('images.expirationDate')}</p>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="14"
                value={expirationDays}
                onChange={(e) => setExpirationDays(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-small text-default-600 min-w-[100px]">
                {expirationDays} {t('images.days')} ({format(addDays(new Date(), expirationDays), 'MMM d, yyyy')})
              </span>
            </div>
          </div>
        </form>
      </CardBody>
      <Divider />
      <CardFooter>
        <Button
          color="primary"
          onPress={handleSubmit}
          isLoading={loading}
          isDisabled={!selectedFile || !title || !category || loading}
          className="w-full"
        >
          {t('images.upload')}
        </Button>
      </CardFooter>
    </Card>
  );
};