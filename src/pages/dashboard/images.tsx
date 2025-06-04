// New images page component
import React from 'react';
import { Card, CardBody, CardHeader, Divider, Input, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Pagination } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useImages } from '../../hooks/use-images';
import { ImageGrid } from '../../components/image-grid';

const ImagesPage: React.FC = () => {
  const { t } = useTranslation();
  const { images, loading, error, fetchImages, deleteImage, addTag, updateTag, deleteTag } = useImages();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [category, setCategory] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState<'newest' | 'oldest' | 'expiring'>('newest');
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 9;
  
  React.useEffect(() => {
    fetchImages();
  }, []);
  
  const categories = React.useMemo(() => {
    const uniqueCategories = new Set(images.map(img => img.category));
    return Array.from(uniqueCategories);
  }, [images]);
  
  const filteredImages = React.useMemo(() => {
    let filtered = [...images];
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        image => 
          image.title.toLowerCase().includes(lowerSearchTerm) ||
          image.description.toLowerCase().includes(lowerSearchTerm) ||
          image.tags.some(tag => tag.text.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    // Apply category filter
    if (category) {
      filtered = filtered.filter(image => image.category === category);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'expiring':
        filtered.sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());
        break;
    }
    
    return filtered;
  }, [images, searchTerm, category, sortBy]);
  
  // Pagination
  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
  const paginatedImages = filteredImages.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  
  const handleDeleteImage = async (imageId: string) => {
    await deleteImage(imageId);
    fetchImages(); // Refresh the list
  };
  
  const handleAddTag = async (imageId: string, tag: Omit<ImageTag, 'id'>) => {
    await addTag(imageId, tag);
  };
  
  const handleUpdateTag = async (imageId: string, tagId: string, tag: Partial<Omit<ImageTag, 'id'>>) => {
    await updateTag(imageId, tagId, tag);
  };
  
  const handleDeleteTag = async (imageId: string, tagId: string) => {
    await deleteTag(imageId, tagId);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">{t('images.myImages')}</h1>
        
        <Button
          as={RouterLink}
          to="/dashboard/upload"
          color="primary"
          startContent={<Icon icon="lucide:upload" />}
        >
          {t('images.uploadNewImage')}
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">{t('images.filterAndSort')}</h2>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder={t('images.searchImages')}
              value={searchTerm}
              onValueChange={setSearchTerm}
              startContent={<Icon icon="lucide:search" />}
            />
            
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  className="w-full justify-start"
                  endContent={<Icon icon="lucide:chevron-down" width={16} />}
                >
                  {category ? t(`categories.${category}`) : t('images.allCategories')}
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Categories">
                <DropdownItem
                  key="all"
                  onPress={() => setCategory(null)}
                >
                  {t('images.allCategories')}
                </DropdownItem>
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
            
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  className="w-full justify-start"
                  endContent={<Icon icon="lucide:chevron-down" width={16} />}
                >
                  {t(`images.sortBy.${sortBy}`)}
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Sort by">
                <DropdownItem
                  key="newest"
                  onPress={() => setSortBy('newest')}
                >
                  {t('images.sortBy.newest')}
                </DropdownItem>
                <DropdownItem
                  key="oldest"
                  onPress={() => setSortBy('oldest')}
                >
                  {t('images.sortBy.oldest')}
                </DropdownItem>
                <DropdownItem
                  key="expiring"
                  onPress={() => setSortBy('expiring')}
                >
                  {t('images.sortBy.expiring')}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </CardBody>
      </Card>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <Card>
          <CardBody>
            <div className="text-center text-danger py-8">
              <Icon icon="lucide:alert-circle" width={32} height={32} className="mx-auto mb-2" />
              <p>{error}</p>
              <Button
                color="primary"
                variant="flat"
                className="mt-4"
                onPress={() => fetchImages()}
              >
                {t('common.retry')}
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : filteredImages.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-8">
              <Icon icon="lucide:image-off" width={32} height={32} className="mx-auto mb-2 text-default-400" />
              <p className="text-default-500">
                {searchTerm || category
                  ? t('images.noImagesMatchingFilters')
                  : t('images.noImagesYet')}
              </p>
              {!searchTerm && !category && (
                <Button
                  as={RouterLink}
                  to="/dashboard/upload"
                  color="primary"
                  variant="flat"
                  className="mt-4"
                >
                  {t('images.uploadYourFirstImage')}
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          <ImageGrid
            images={paginatedImages}
            onDelete={handleDeleteImage}
            onAddTag={handleAddTag}
            onUpdateTag={handleUpdateTag}
            onDeleteTag={handleDeleteTag}
          />
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                total={totalPages}
                page={page}
                onChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ImagesPage;