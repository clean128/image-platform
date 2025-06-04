// New gallery page component
import React from 'react';
import { Card, CardBody, Input, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Pagination } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useImages } from '../../hooks/use-images';
import { useApi } from '../../hooks/use-api';
import { ImageGrid } from '../../components/image-grid';

interface UserProfile {
  username: string;
  fullName: string;
  bio: string;
  website: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
  };
}

const UserGalleryPage: React.FC = () => {
  const { t } = useTranslation();
  const { username } = useParams<{ username: string }>();
  const { images, loading, error, fetchImages } = useImages();
  const api = useApi();
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [category, setCategory] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 9;
  
  React.useEffect(() => {
    if (username) {
      fetchImages(username);
      fetchUserProfile(username);
    }
  }, [username]);
  
  const fetchUserProfile = async (username: string) => {
    try {
      setProfileLoading(true);
      const response = await api.get(`/users/profile/${username}`);
      setUserProfile(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };
  
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
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    
    return filtered;
  }, [images, searchTerm, category, sortBy]);
  
  // Pagination
  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
  const paginatedImages = filteredImages.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  
  return (
    <div className="space-y-6">
      {profileLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : !userProfile ? (
        <Card>
          <CardBody>
            <div className="text-center py-8">
              <Icon icon="lucide:user-x" width={48} height={48} className="mx-auto mb-4 text-danger" />
              <h2 className="text-xl font-semibold mb-2">{t('gallery.userNotFound')}</h2>
              <p className="text-default-600">
                {t('gallery.userNotFoundMessage', { username })}
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">
                {userProfile.fullName || userProfile.username}
              </h1>
              <p className="text-default-600">@{userProfile.username}</p>
            </div>
            
            {userProfile.socialLinks && (
              <div className="flex gap-3">
                {userProfile.socialLinks.facebook && (
                  <Button
                    as="a"
                    href={userProfile.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    isIconOnly
                    variant="flat"
                    aria-label="Facebook"
                  >
                    <Icon icon="logos:facebook" width={20} height={20} />
                  </Button>
                )}
                {userProfile.socialLinks.twitter && (
                  <Button
                    as="a"
                    href={userProfile.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    isIconOnly
                    variant="flat"
                    aria-label="Twitter"
                  >
                    <Icon icon="logos:twitter" width={20} height={20} />
                  </Button>
                )}
                {userProfile.socialLinks.instagram && (
                  <Button
                    as="a"
                    href={userProfile.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    isIconOnly
                    variant="flat"
                    aria-label="Instagram"
                  >
                    <Icon icon="logos:instagram-icon" width={20} height={20} />
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {userProfile.bio && (
            <p className="text-default-600">
              {userProfile.bio}
            </p>
          )}
          
          {userProfile.website && (
            <p>
              <a 
                href={userProfile.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary flex items-center gap-1"
              >
                <Icon icon="lucide:globe" width={16} height={16} />
                {userProfile.website}
              </a>
            </p>
          )}
          
          <Card>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder={t('gallery.searchImages')}
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
                      {category ? t(`categories.${category}`) : t('gallery.allCategories')}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Categories">
                    <DropdownItem
                      key="all"
                      onPress={() => setCategory(null)}
                    >
                      {t('gallery.allCategories')}
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
                      {t(`gallery.sortBy.${sortBy}`)}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Sort by">
                    <DropdownItem
                      key="newest"
                      onPress={() => setSortBy('newest')}
                    >
                      {t('gallery.sortBy.newest')}
                    </DropdownItem>
                    <DropdownItem
                      key="oldest"
                      onPress={() => setSortBy('oldest')}
                    >
                      {t('gallery.sortBy.oldest')}
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
                    onPress={() => fetchImages(username)}
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
                      ? t('gallery.noImagesMatchingFilters')
                      : t('gallery.noImagesYet')}
                  </p>
                </div>
              </CardBody>
            </Card>
          ) : (
            <>
              <ImageGrid images={paginatedImages} />
              
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
        </>
      )}
    </div>
  );
};

export default UserGalleryPage;