
import data from '../app/lib/placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;

const placeholders: Record<string, {
  imageUrl: string;
  description: string;
  imageHint: string;
}> = {
  'avatar-1': {
    imageUrl: 'https://placehold.co/40x40/E1F5EE/0F6E56',
    description: 'Student avatar 1',
    imageHint: 'student avatar',
  },
  'avatar-2': {
    imageUrl: 'https://placehold.co/40x40/E6F1FB/185FA5',
    description: 'Student avatar 2',
    imageHint: 'student avatar',
  },
  'avatar-3': {
    imageUrl: 'https://placehold.co/40x40/FAEEDA/854F0B',
    description: 'Student avatar 3',
    imageHint: 'student avatar',
  },
  'avatar-4': {
    imageUrl: 'https://placehold.co/40x40/FAECE7/993C1D',
    description: 'Student avatar 4',
    imageHint: 'student avatar',
  },
};

export const getPlaceholderById = (id: string): ImagePlaceholder | undefined => {
  const fromJson = PlaceHolderImages.find((img) => img.id === id);
  if (fromJson) {
    return fromJson;
  }
  const fallback = placeholders[id];
  if (fallback) {
    return {
      id,
      imageUrl: fallback.imageUrl,
      description: fallback.description,
      imageHint: fallback.imageHint,
    };
  }
  return undefined;
};
