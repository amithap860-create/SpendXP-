
import data from '../app/lib/placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;

export const getPlaceholderById = (id: string) => {
  return PlaceHolderImages.find(img => img.id === id);
};
