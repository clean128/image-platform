// New upload page component
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useImages } from '../../hooks/use-images';
import { UploadForm } from '../../components/upload-form';
import { useHistory } from 'react-router-dom';
import { addToast } from '@heroui/react';

const UploadPage: React.FC = () => {
  const { t } = useTranslation();
  const { uploadImage, loading } = useImages();
  const history = useHistory();
  
  const handleUpload = async (formData: FormData) => {
    try {
      await uploadImage(formData);
      
      // Redirect to images page after successful upload
      history.push('/dashboard/images');
    } catch (error) {
      console.error('Upload error:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('images.uploadNewImage')}</h1>
      <p className="text-default-600">
        {t('images.uploadDescription')}
      </p>
      
      <UploadForm onUpload={handleUpload} loading={loading} />
    </div>
  );
};

export default UploadPage;