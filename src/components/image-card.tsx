import React from 'react';
import { Card, CardBody, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { Image, ImageTag } from '../hooks/use-images';
import { format } from 'date-fns';
import { useAuth } from '../hooks/use-auth';

interface ImageCardProps {
  image: Image;
  onDelete?: (imageId: string) => void;
  onAddTag?: (imageId: string, tag: Omit<ImageTag, 'id'>) => void;
  onUpdateTag?: (imageId: string, tagId: string, tag: Partial<Omit<ImageTag, 'id'>>) => void;
  onDeleteTag?: (imageId: string, tagId: string) => void;
  isOwner?: boolean;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  image,
  onDelete,
  onAddTag,
  onUpdateTag,
  onDeleteTag,
  isOwner = false
}) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const { isOpen: isTagModalOpen, onOpen: onTagModalOpen, onOpenChange: onTagModalOpenChange, onClose: onTagModalClose } = useDisclosure();
  const [selectedPosition, setSelectedPosition] = React.useState<{ x: number, y: number } | null>(null);
  const [selectedTag, setSelectedTag] = React.useState<ImageTag | null>(null);
  const [tagText, setTagText] = React.useState('');
  const [tagLink, setTagLink] = React.useState('');
  const imageRef = React.useRef<HTMLImageElement>(null);
  const { user } = useAuth();
  
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isOwner || !onAddTag) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    setSelectedPosition({ x, y });
    setTagText('');
    setTagLink('');
    onTagModalOpen();
  };
  
  const handleAddTag = () => {
    if (!selectedPosition || !onAddTag) return;
    
    onAddTag(image.id, {
      x: selectedPosition.x,
      y: selectedPosition.y,
      text: tagText,
      link: tagLink
    });
    
    onTagModalClose();
  };
  
  const handleEditTag = (tag: ImageTag) => {
    setSelectedTag(tag);
    setTagText(tag.text);
    setTagLink(tag.link);
    onTagModalOpen();
  };
  
  const handleUpdateTag = () => {
    if (!selectedTag || !onUpdateTag) return;
    
    onUpdateTag(image.id, selectedTag.id, {
      text: tagText,
      link: tagLink
    });
    
    onTagModalClose();
  };
  
  const handleDeleteTag = (tagId: string) => {
    if (!onDeleteTag) return;
    onDeleteTag(image.id, tagId);
  };
  
  const daysUntilExpiration = () => {
    const expirationDate = new Date(image.expiresAt);
    const today = new Date();
    const diffTime = expirationDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  return (
    <>
      <Card className="overflow-visible">
        <CardBody className="p-0 overflow-visible">
          <div className="relative image-container">
            <img
              ref={imageRef}
              src={image.url}
              alt={image.title}
              className="w-full h-full object-cover"
              onClick={handleImageClick}
              style={{ cursor: isOwner ? 'crosshair' : 'pointer' }}
            />
            
            {/* Display tags */}
            {image.tags.map((tag) => (
              <div
                key={tag.id}
                className="image-tag"
                style={{
                  left: `${tag.x * 100}%`,
                  top: `${tag.y * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isOwner) {
                    handleEditTag(tag);
                  } else if (tag.link) {
                    window.open(tag.link, '_blank');
                  }
                }}
              >
                {tag.text}
              </div>
            ))}
            
            {/* Expiration badge */}
            {daysUntilExpiration() <= 3 && (
              <div className="absolute top-2 right-2 bg-danger text-white px-2 py-1 rounded-md text-xs">
                {t('images.expiresIn', { days: daysUntilExpiration() })}
              </div>
            )}
            
            {/* Category badge */}
            <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded-md text-xs">
              {image.category}
            </div>
          </div>
          
          <div className="p-3">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-semibold">{image.title}</h3>
              
              {isOwner && onDelete && (
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="danger"
                  onPress={onOpen}
                >
                  <Icon icon="lucide:trash-2" width={16} />
                </Button>
              )}
            </div>
            
            <p className="text-small text-default-500 mt-1">
              {t('images.uploadedOn', { date: format(new Date(image.createdAt), 'MMM d, yyyy') })}
            </p>
            
            <p className="text-small text-default-500">
              {t('images.expiresOn', { date: format(new Date(image.expiresAt), 'MMM d, yyyy') })}
            </p>
            
            {image.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {image.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-tiny bg-default-100 px-2 py-1 rounded-full"
                  >
                    {tag.text}
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
      
      {/* Delete confirmation modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{t('images.confirmDelete')}</ModalHeader>
              <ModalBody>
                <p>{t('images.deleteConfirmation')}</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  {t('common.cancel')}
                </Button>
                <Button 
                  color="danger" 
                  onPress={() => {
                    onDelete?.(image.id);
                    onClose();
                  }}
                >
                  {t('common.delete')}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      
      {/* Tag modal */}
      <Modal isOpen={isTagModalOpen} onOpenChange={onTagModalOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {selectedTag ? t('images.editTag') : t('images.addTag')}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label={t('images.tagText')}
                    placeholder={t('images.enterTagText')}
                    value={tagText}
                    onValueChange={setTagText}
                  />
                  <Input
                    label={t('images.tagLink')}
                    placeholder={t('images.enterTagLink')}
                    value={tagLink}
                    onValueChange={setTagLink}
                  />
                </div>
                
                {selectedTag && (
                  <Button 
                    color="danger" 
                    variant="flat" 
                    className="mt-4 w-full"
                    onPress={() => {
                      handleDeleteTag(selectedTag.id);
                      onClose();
                    }}
                  >
                    {t('common.delete')}
                  </Button>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  {t('common.cancel')}
                </Button>
                <Button 
                  color="primary" 
                  onPress={selectedTag ? handleUpdateTag : handleAddTag}
                >
                  {selectedTag ? t('common.update') : t('common.add')}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};