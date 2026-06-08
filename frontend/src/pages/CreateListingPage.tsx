import React, { useEffect, useMemo, useState } from 'react';
import { Check, ImagePlus, Loader2, Upload, Tag } from 'lucide-react';
import { Header } from '../components/layout';
import { useBrands, useCategories, useCreateListing, useEquipmentModels, useTags, useUploadListingPhoto } from '../hooks';
import type { ListingCondition } from '../lib/types';
import { hapticImpact, hapticNotification } from '../lib/telegram';
import { flattenCategories, getCategoryDisplayName } from '../lib/catalog';

interface CreateListingPageProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const conditions: Array<{ value: ListingCondition; label: string; description: string }> = [
  { value: 'new', label: 'Новое', description: 'Не использовалось' },
  { value: 'like_new', label: 'Как новое', description: 'Почти без следов' },
  { value: 'good', label: 'Хорошее', description: 'Небольшие следы' },
  { value: 'fair', label: 'Б/у', description: 'Видимый износ' },
];

type PhotoStatus = 'idle' | 'loading' | 'loaded' | 'error';

const isHttpUrl = (value: string) => {
  if (value.startsWith('/uploads/')) return true;
  try {
    const url = new URL(value);
    return (url.protocol === 'http:' || url.protocol === 'https:') && Boolean(url.hostname);
  } catch {
    return false;
  }
};

export const CreateListingPage: React.FC<CreateListingPageProps> = ({ onClose, onSuccess }) => {
  const { categories, error: categoriesError } = useCategories();
  const { brands, loading: brandsLoading, error: brandsError } = useBrands();
  const { tags, error: tagsError } = useTags();
  const { createListing, loading, error } = useCreateListing();
  const { uploadPhoto, loading: photoUploading, error: uploadError } = useUploadListingPhoto();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<ListingCondition>('good');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [brandId, setBrandId] = useState<number | ''>('');
  const [equipmentModelId, setEquipmentModelId] = useState<number | ''>('');
  const [manualModelName, setManualModelName] = useState('');
  const [city, setCity] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoStatus, setPhotoStatus] = useState<PhotoStatus>('idle');
  const [photoFileName, setPhotoFileName] = useState('');
  const [tagIds, setTagIds] = useState<number[]>([]);

  const categoryOptions = useMemo(() => flattenCategories(categories), [categories]);
  const selectedCategory = useMemo(() => categoryOptions.find((category) => category.id === categoryId), [categoryOptions, categoryId]);
  const { equipmentModels, loading: modelsLoading, error: modelsError } = useEquipmentModels({
    category_id: categoryId || undefined,
    brand_id: brandId || undefined,
    enabled: Boolean(categoryId || brandId),
  });
  const selectedEquipmentModel = useMemo(() => equipmentModels.find((model) => model.id === equipmentModelId), [equipmentModels, equipmentModelId]);
  const selectedBrand = useMemo(() => brands.find((brand) => brand.id === brandId), [brands, brandId]);
  const hasModelChoice = Boolean(equipmentModelId || manualModelName.trim().length >= 2);
  const normalizedPhotoUrl = photoUrl.trim();
  const photoUrlValid = !normalizedPhotoUrl || isHttpUrl(normalizedPhotoUrl);
  const photoReady = !normalizedPhotoUrl || (photoUrlValid && photoStatus === 'loaded');
  const catalogError = categoriesError || brandsError || modelsError || tagsError;
  const canSubmit = Boolean(
    title.trim().length >= 3 &&
    description.trim().length >= 10 &&
    Number(price) > 0 &&
    categoryId &&
    hasModelChoice &&
    city.trim().length > 1 &&
    photoReady &&
    !photoUploading
  );

  useEffect(() => {
    if (equipmentModelId && !equipmentModels.some((model) => model.id === equipmentModelId)) setEquipmentModelId('');
  }, [equipmentModelId, equipmentModels]);

  const toggleTag = (tagId: number) => {
    hapticImpact('light');
    setTagIds((current) => current.includes(tagId) ? current.filter((id) => id !== tagId) : [...current, tagId]);
  };

  const handlePhotoFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoFileName(file.name);
    setPhotoStatus('loading');
    try {
      const uploaded = await uploadPhoto(file);
      setPhotoUrl(uploaded.url);
    } catch {
      setPhotoStatus('error');
      hapticNotification('error');
    } finally {
      event.target.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || !categoryId) return;
    const normalizedManualModel = manualModelName.trim();
    try {
      await createListing({
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        condition,
        category_id: categoryId,
        brand_id: brandId || undefined,
        equipment_model_id: equipmentModelId || undefined,
        model_name: !equipmentModelId && normalizedManualModel ? normalizedManualModel : undefined,
        city: city.trim(),
        tag_ids: tagIds,
        photo_urls: normalizedPhotoUrl ? [normalizedPhotoUrl] : [],
      });
      hapticNotification('success');
      onSuccess?.();
    } catch {
      hapticNotification('error');
    }
  };

  return (
    <div className="flex h-full flex-col bg-app">
      <Header title="Новое объявление" showBack onBack={onClose} />

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <main className="mx-auto min-h-full w-full max-w-[680px] border-x border-separator bg-white px-4 pb-24 pt-4 sm:px-5">
          <div className="mb-4 flex gap-1">
            <span className="h-0.5 flex-1 rounded bg-[var(--accent)]" />
            <span className="h-0.5 flex-1 rounded bg-[var(--accent)] opacity-50" />
            <span className="h-0.5 flex-1 rounded bg-[var(--surface-strong)]" />
            <span className="h-0.5 flex-1 rounded bg-[var(--surface-strong)]" />
          </div>
          <p className="section-label mb-4">Фото, каталог и описание</p>

          <div className="mb-4">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Предпросмотр"
                onLoad={() => setPhotoStatus('loaded')}
                onError={() => setPhotoStatus('error')}
                className="mb-3 aspect-[16/10] max-h-64 w-full rounded-lg border border-separator bg-secondary object-cover"
              />
            ) : (
              <label className="mb-3 flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border-strong)] bg-secondary text-center">
                <ImagePlus className="mb-2 h-7 w-7 text-muted" />
                <strong className="text-[13px] font-medium">Добавить фото</strong>
                <span className="mt-1 text-[10px] text-muted">выберите файл или вставьте ссылку ниже</span>
                <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoFileChange} />
              </label>
            )}
            {photoUrl && (
              <label className="btn-secondary mb-2 flex cursor-pointer items-center justify-center gap-2 py-2.5">
                <Upload className="h-4 w-4" />
                Заменить фото файлом
                <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoFileChange} />
              </label>
            )}
            <input
              type="text"
              placeholder="https://... или /uploads/..."
              value={photoUrl}
              onChange={(event) => {
                setPhotoUrl(event.target.value);
                setPhotoFileName('');
                setPhotoStatus(event.target.value.trim() ? 'loading' : 'idle');
              }}
              className="input-field"
            />
            {photoFileName && <span className="mt-1 block text-[10px] text-muted">Файл: {photoFileName}</span>}
            {normalizedPhotoUrl && !photoUrlValid && <span className="mt-1 block text-[10px] text-red-600">Укажите ссылку http(s) или загрузите файл</span>}
            {(photoUploading || (photoUrlValid && photoStatus === 'loading')) && <span className="mt-1 block text-[10px] text-muted">{photoUploading ? 'Загружаем фото...' : 'Проверяем изображение...'}</span>}
            {photoStatus === 'error' && <span className="mt-1 block text-[10px] text-red-600">Изображение по этой ссылке не загрузилось</span>}
            {photoStatus === 'loaded' && <span className="mt-1 block text-[10px] text-accent">Фото готово к публикации</span>}
            {uploadError && <span className="mt-1 block text-[10px] text-red-600">{uploadError}</span>}
          </div>

          <div className="space-y-3.5">
            {catalogError && <p className="rounded-md border border-red-100 bg-red-50 p-3 text-[12px] text-red-700">Не удалось полностью загрузить каталог: {catalogError}</p>}
            <label className="block">
              <span className="section-label mb-1.5 block">Название товара</span>
              <input type="text" placeholder="Korg Minilogue XD" value={title} onChange={(event) => setTitle(event.target.value)} className="input-field" maxLength={160} />
            </label>

            <label className="block">
              <span className="section-label mb-1.5 block">Категория</span>
              <select
                value={categoryId}
                onChange={(event) => {
                  setCategoryId(event.target.value ? Number(event.target.value) : '');
                  setEquipmentModelId('');
                }}
                className="input-field"
              >
                <option value="">Выберите категорию</option>
                {categoryOptions.map((category) => <option key={category.id} value={category.id}>{`${'  '.repeat(category.depth)}${getCategoryDisplayName(category.name)}`}</option>)}
              </select>
              {selectedCategory && <span className="mt-1 block text-[10px] text-muted">{selectedCategory.path}</span>}
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              <label className="block">
                <span className="section-label mb-1.5 block">Бренд</span>
                <select
                  value={brandId}
                  onChange={(event) => {
                    setBrandId(event.target.value ? Number(event.target.value) : '');
                    setEquipmentModelId('');
                  }}
                  className="input-field"
                >
                  <option value="">{brandsLoading ? 'Загрузка...' : 'Любой бренд'}</option>
                  {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="section-label mb-1.5 block">Модель</span>
                <select
                  value={equipmentModelId}
                  onChange={(event) => {
                    const nextModelId = event.target.value ? Number(event.target.value) : '';
                    setEquipmentModelId(nextModelId);
                    const nextModel = equipmentModels.find((model) => model.id === nextModelId);
                    if (nextModel) {
                      setBrandId(nextModel.brand_id);
                      setCategoryId(nextModel.category_id);
                      setManualModelName('');
                    }
                  }}
                  className="input-field"
                >
                  <option value="">{modelsLoading ? 'Загрузка...' : 'Из каталога'}</option>
                  {equipmentModels.map((model) => <option key={model.id} value={model.id}>{model.brand.name} {model.name}</option>)}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="section-label mb-1.5 block">Название модели вручную</span>
              <input
                type="text"
                placeholder={selectedEquipmentModel ? `${selectedEquipmentModel.brand.name} ${selectedEquipmentModel.name}` : selectedBrand ? `${selectedBrand.name} модель` : 'Модель'}
                value={manualModelName}
                onChange={(event) => {
                  setManualModelName(event.target.value);
                  if (event.target.value.trim()) setEquipmentModelId('');
                }}
                className="input-field"
                maxLength={180}
              />
            </label>

            <section>
              <h2 className="section-label mb-2">Состояние</h2>
              <div className="grid grid-cols-2 gap-2">
                {conditions.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => {
                      setCondition(item.value);
                      hapticImpact('light');
                    }}
                    className={`rounded-md border p-2.5 text-left ${condition === item.value ? 'border-[#fdba74] bg-accent-soft' : 'border-separator bg-white'}`}
                  >
                    <span className={`block text-[10px] font-medium uppercase tracking-[0.06em] ${condition === item.value ? 'text-accent' : 'text-secondary'}`} style={{ fontFamily: 'var(--font-mono)' }}>{item.label}</span>
                    <span className="mt-1 block text-[10px] text-muted">{item.description}</span>
                  </button>
                ))}
              </div>
            </section>

            <label className="block">
              <span className="section-label mb-1.5 block">Описание</span>
              <textarea placeholder="Расскажите о товаре, причине продажи и комплектации..." value={description} onChange={(event) => setDescription(event.target.value)} className="input-field min-h-24 resize-none leading-6" maxLength={1200} />
              <span className="mt-1 block text-[10px] text-muted">{description.length}/1200</span>
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              <label className="block">
                <span className="section-label mb-1.5 block">Цена</span>
                <input type="number" placeholder="0 ₽" value={price} onChange={(event) => setPrice(event.target.value)} className="input-field text-lg font-semibold text-accent" min="1" style={{ fontFamily: 'var(--font-mono)' }} />
              </label>
              <label className="block">
                <span className="section-label mb-1.5 block">Город</span>
                <input type="text" placeholder="Москва" value={city} onChange={(event) => setCity(event.target.value)} className="input-field" />
              </label>
            </div>

            {tags.length > 0 && (
              <section>
                <h2 className="section-label mb-2 flex items-center gap-1.5"><Tag className="h-3 w-3" />Теги</h2>
                <div className="flex flex-wrap gap-2">
                  {tags.map((item) => {
                    const active = tagIds.includes(item.id);
                    return (
                      <button key={item.id} onClick={() => toggleTag(item.id)} className={`filter-chip ${active ? 'filter-chip-active' : ''}`}>
                        {active && <Check className="mr-1 inline h-3 w-3" />}{item.name}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {(error || uploadError) && <p className="rounded-md border border-red-100 bg-red-50 p-3 text-[12px] text-red-700">{error || uploadError}</p>}
          </div>
        </main>
      </div>

      <div className="border-t border-separator bg-white/95 px-4 py-3 backdrop-blur-xl" style={{ paddingBottom: 'calc(var(--safe-area-inset-bottom) + 12px)' }}>
        <div className="mx-auto max-w-[680px]">
          <button onClick={handleSubmit} disabled={!canSubmit || loading || photoUploading} className="btn-primary flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-40">
            {(loading || photoUploading) && <Loader2 className="h-4 w-4 animate-spin" />}{photoUploading ? 'Загрузка фото...' : 'Опубликовать объявление'}
          </button>
        </div>
      </div>
    </div>
  );
};
