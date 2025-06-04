import React from 'react';
import { useApi } from './use-api';
import { addToast } from '@heroui/react';
import { useTranslation } from 'react-i18next';

export interface ImageTag {
  id: string;
  x: number;
  y: number;
  text: string;
  link: string;
}

export interface Image {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  description: string;
  category: string;
  tags: ImageTag[];
  createdAt: string;
  expiresAt: string;
  userId: string;
  username: string;
}

export const useImages = () => {
  const api = useApi();
  const { t } = useTranslation();
  const [images, setImages] = React.useState<Image[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  const fetchImages = async (username?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = username ? `/images/user/${username}` : '/images';
      const response = await api.get(endpoint);
      
      setImages(response.data);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError(t('errors.failedToLoadImages'));
      addToast({
        title: t('errors.error'),
        description: t('errors.failedToLoadImages'),
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const uploadImage = async (formData: FormData) => {
    try {
      setLoading(true);
      const response = await api.post('/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      addToast({
        title: t('images.uploadSuccess'),
        description: t('images.imageUploadedSuccessfully'),
        color: 'success'
      });
      
      return response.data;
    } catch (err: any) {
      console.error('Error uploading image:', err);
      const errorMessage = err.response?.data?.message || t('errors.uploadFailed');
      
      addToast({
        title: t('errors.uploadFailed'),
        description: errorMessage,
        color: 'danger'
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const deleteImage = async (imageId: string) => {
    try {
      setLoading(true);
      await api.delete(`/images/${imageId}`);
      
      // Update local state
      setImages(images.filter(img => img.id !== imageId));
      
      addToast({
        title: t('images.deleteSuccess'),
        description: t('images.imageDeletedSuccessfully'),
        color: 'success'
      });
    } catch (err) {
      console.error('Error deleting image:', err);
      
      addToast({
        title: t('errors.deleteFailed'),
        description: t('errors.failedToDeleteImage'),
        color: 'danger'
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const addTag = async (imageId: string, tag: Omit<ImageTag, 'id'>) => {
    try {
      setLoading(true);
      const response = await api.post(`/images/${imageId}/tags`, tag);
      
      // Update local state
      setImages(images.map(img => {
        if (img.id === imageId) {
          return {
            ...img,
            tags: [...img.tags, response.data]
          };
        }
        return img;
      }));
      
      addToast({
        title: t('images.tagAdded'),
        description: t('images.tagAddedSuccessfully'),
        color: 'success'
      });
      
      return response.data;
    } catch (err) {
      console.error('Error adding tag:', err);
      
      addToast({
        title: t('errors.tagFailed'),
        description: t('errors.failedToAddTag'),
        color: 'danger'
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const updateTag = async (imageId: string, tagId: string, tagData: Partial<Omit<ImageTag, 'id'>>) => {
    try {
      setLoading(true);
      const response = await api.put(`/images/${imageId}/tags/${tagId}`, tagData);
      
      // Update local state
      setImages(images.map(img => {
        if (img.id === imageId) {
          return {
            ...img,
            tags: img.tags.map(tag => {
              if (tag.id === tagId) {
                return { ...tag, ...response.data };
              }
              return tag;
            })
          };
        }
        return img;
      }));
      
      addToast({
        title: t('images.tagUpdated'),
        description: t('images.tagUpdatedSuccessfully'),
        color: 'success'
      });
      
      return response.data;
    } catch (err) {
      console.error('Error updating tag:', err);
      
      addToast({
        title: t('errors.updateFailed'),
        description: t('errors.failedToUpdateTag'),
        color: 'danger'
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const deleteTag = async (imageId: string, tagId: string) => {
    try {
      setLoading(true);
      await api.delete(`/images/${imageId}/tags/${tagId}`);
      
      // Update local state
      setImages(images.map(img => {
        if (img.id === imageId) {
          return {
            ...img,
            tags: img.tags.filter(tag => tag.id !== tagId)
          };
        }
        return img;
      }));
      
      addToast({
        title: t('images.tagDeleted'),
        description: t('images.tagDeletedSuccessfully'),
        color: 'success'
      });
    } catch (err) {
      console.error('Error deleting tag:', err);
      
      addToast({
        title: t('errors.deleteFailed'),
        description: t('errors.failedToDeleteTag'),
        color: 'danger'
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    images,
    loading,
    error,
    fetchImages,
    uploadImage,
    deleteImage,
    addTag,
    updateTag,
    deleteTag
  };
};
