import type { Category, ListingShort } from './types';

export interface FlatCategory extends Category {
  depth: number;
  path: string;
}

const categoryLabels: Record<string, string> = {
  'Audio Interfaces': 'Аудиоинтерфейсы',
  'Drum Machines': 'Драм-машины',
  'Effects and Pedals': 'Эффекты и педали',
  'Time-based Effects': 'Пространственные эффекты',
  'Reverb Effects': 'Ревербераторы',
  'Delay Effects': 'Дилеи',
  'Modulation Effects': 'Модуляционные эффекты',
  'Drive and Dynamics': 'Драйв и динамика',
  Grooveboxes: 'Грувбоксы',
  Sequencers: 'Секвенсоры',
  'DJ Equipment': 'DJ-оборудование',
  'DJ Controllers': 'DJ-контроллеры',
  Turntables: 'Проигрыватели',
  'MIDI Controllers': 'MIDI-контроллеры',
  Other: 'Другое',
  Samplers: 'Сэмплеры',
  'Studio Gear': 'Студия',
  'Studio Monitors': 'Студийные мониторы',
  Mixers: 'Микшеры',
  Microphones: 'Микрофоны',
  'Preamps and Channel Strips': 'Преампы и канальные полосы',
  Synthesizers: 'Синтезаторы',
  'Analog Synthesizers': 'Аналоговые синтезаторы',
  'Digital Synthesizers': 'Цифровые синтезаторы',
  'Modular Synthesizers': 'Модульные синтезаторы',
};

export const getCategoryDisplayName = (name: string) => categoryLabels[name] || name;

const cityLabels: Record<string, string> = {
  Moscow: 'Москва',
  'Saint Petersburg': 'Санкт-Петербург',
  Kazan: 'Казань',
};

export const getCityDisplayName = (name: string | null | undefined) =>
  name ? cityLabels[name] || name : 'Удалённо';

export const flattenCategories = (
  categories: Category[],
  depth = 0,
  parentPath = ''
): FlatCategory[] =>
  categories.flatMap((category) => {
    const displayName = getCategoryDisplayName(category.name);
    const path = parentPath ? `${parentPath} / ${displayName}` : displayName;
    return [
      { ...category, depth, path },
      ...flattenCategories(category.children || [], depth + 1, path),
    ];
  });

export const getCatalogLabel = (listing: ListingShort) => {
  const brandName = listing.equipment_model?.brand?.name || listing.brand?.name || '';
  const modelName = listing.equipment_model?.name || listing.model_name || '';

  if (brandName && modelName) return `${brandName} ${modelName}`;
  return modelName || brandName || '';
};
