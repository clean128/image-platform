import React from 'react';
import { Button, Card, CardBody, CardFooter, Divider, Input } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useImages } from '../../hooks/use-images';
import { ImageGrid } from '../../components/image-grid';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { images, loading, error, fetchImages } = useImages();
  const [searchTerm, setSearchTerm] = React.useState('');
  
  React.useEffect(() => {
    fetchImages();
  }, []);
  
  const filteredImages = React.useMemo(() => {
    if (!searchTerm) return images;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return images.filter(
      image => 
        image.title.toLowerCase().includes(lowerSearchTerm) ||
        image.description.toLowerCase().includes(lowerSearchTerm) ||
        image.category.toLowerCase().includes(lowerSearchTerm) ||
        image.tags.some(tag => tag.text.toLowerCase().includes(lowerSearchTerm))
    );
  }, [images, searchTerm]);
  
  return (
    <div>
      <section className="py-12 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">{t('home.title')}</h1>
        <p className="text-xl text-default-600 max-w-2xl mx-auto mb-8">
          {t('home.subtitle')}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button 
            as={RouterLink} 
            to="/register" 
            color="primary" 
            size="lg"
            startContent={<Icon icon="lucide:user-plus" />}
          >
            {t('home.getStarted')}
          </Button>
          <Button 
            as={RouterLink} 
            to="/login" 
            variant="flat" 
            size="lg"
            startContent={<Icon icon="lucide:log-in" />}
          >
            {t('home.login')}
          </Button>
        </div>
      </section>
      
      <Divider className="my-8" />
      
      <section className="py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-2xl font-semibold">{t('home.recentImages')}</h2>
          <Input
            placeholder={t('home.searchImages')}
            value={searchTerm}
            onValueChange={setSearchTerm}
            startContent={<Icon icon="lucide:search" />}
            className="max-w-xs"
          />
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <Card>
            <CardBody>
              <div className="text-center text-danger">
                <Icon icon="lucide:alert-circle" width={48} height={48} className="mx-auto mb-4" />
                <p>{error}</p>
              </div>
            </CardBody>
          </Card>
        ) : filteredImages.length === 0 ? (
          <Card>
            <CardBody>
              <div className="text-center text-default-500">
                <Icon icon="lucide:image-off" width={48} height={48} className="mx-auto mb-4" />
                <p>{t('home.noImagesFound')}</p>
              </div>
            </CardBody>
          </Card>
        ) : (
          <ImageGrid images={filteredImages} />
        )}
      </section>
      
      <Divider className="my-8" />
      
      <section className="py-8">
        <h2 className="text-2xl font-semibold mb-8 text-center">{t('home.features')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardBody className="text-center">
              <Icon icon="lucide:upload-cloud" width={48} height={48} className="mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">{t('home.featureUploadTitle')}</h3>
              <p className="text-default-600">{t('home.featureUploadDescription')}</p>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="text-center">
              <Icon icon="lucide:tag" width={48} height={48} className="mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">{t('home.featureTagTitle')}</h3>
              <p className="text-default-600">{t('home.featureTagDescription')}</p>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="text-center">
              <Icon icon="lucide:share-2" width={48} height={48} className="mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">{t('home.featureShareTitle')}</h3>
              <p className="text-default-600">{t('home.featureShareDescription')}</p>
            </CardBody>
          </Card>
        </div>
      </section>
      
      <Divider className="my-8" />
      
      <section className="py-8">
        <Card className="bg-primary text-white">
          <CardBody className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">{t('home.ctaTitle')}</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">{t('home.ctaDescription')}</p>
            <Button 
              as={RouterLink} 
              to="/register" 
              size="lg" 
              color="default"
              variant="solid"
              className="font-semibold"
            >
              {t('home.ctaButton')}
            </Button>
          </CardBody>
        </Card>
      </section>
    </div>
  );
};

export default HomePage;