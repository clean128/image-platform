import React from 'react';
import { Image, ImageTag } from '../hooks/use-images';
import { ImageCard } from './image-card';
import { useAuth } from '../hooks/use-auth';

interface ImageGridProps {
  images: Image[];
  onDelete?: (imageId: string) => void;
  onAddTag?: (imageId: string, tag: Omit<ImageTag, 'id'>) => void;
  onUpdateTag?: (imageId: string, tagId: string, tag: Partial<Omit<ImageTag, 'id'>>) => void;
  onDeleteTag?: (imageId: string, tagId: string) => void;
}

export const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  onDelete,
  onAddTag,
  onUpdateTag,
  onDeleteTag
}) => {
  const { user } = useAuth();
  
  return (
    <div className="image-grid">
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          onDelete={onDelete}
          onAddTag={onAddTag}
          onUpdateTag={onUpdateTag}
          onDeleteTag={onDeleteTag}
          isOwner={user?.id === image.userId}
        />
      ))}
    </div>
  );
};