import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type {
  Brand,
  Category,
  EquipmentModel,
  Listing,
  ListingCreate,
  ListingFilters,
  ListingShort,
  PhotoUpload,
  Tag,
  User,
  UserUpdate,
} from '../lib/types';

const buildListingQuery = (filters: ListingFilters) => {
  const params = new URLSearchParams();

  if (filters.category_id) params.append('category_id', String(filters.category_id));
  if (filters.brand_id) params.append('brand_id', String(filters.brand_id));
  if (filters.equipment_model_id) params.append('equipment_model_id', String(filters.equipment_model_id));
  if (filters.min_price) params.append('min_price', String(filters.min_price));
  if (filters.max_price) params.append('max_price', String(filters.max_price));
  if (filters.condition) params.append('condition', filters.condition);
  if (filters.city) params.append('city', filters.city);
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.size) params.append('size', String(filters.size));
  filters.tag_ids?.forEach((id) => params.append('tag_ids', String(id)));

  const query = params.toString();
  return query ? `?${query}` : '';
};

export function useListings(filters: ListingFilters = {}, refreshKey = 0) {
  const [listings, setListings] = useState<ListingShort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const query = buildListingQuery(filters);

  const fetchListings = useCallback(async () => {
    void refreshKey;
    try {
      setLoading(true);
      const response = await api.get<ListingShort[]>(`/listings${query}`);
      setListings(response);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load listings');
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [query, refreshKey]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return { listings, loading, error, refetch: fetchListings };
}

export function useListing(id: number | null) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListing = useCallback(async () => {
    if (!id) {
      setListing(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.get<Listing>(`/listings/${id}`);
      setListing(response);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load listing');
      setListing(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  return { listing, loading, error, refetch: fetchListing, setListing };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setCategories(await api.get<Category[]>('/categories'));
      setError(null);
    } catch (err) {
      setCategories([]);
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
}

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      setTags(await api.get<Tag[]>('/tags'));
      setError(null);
    } catch (err) {
      setTags([]);
      setError(err instanceof Error ? err.message : 'Failed to load tags');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return { tags, loading, error, refetch: fetchTags };
}

export function useBrands(search = '') {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      const query = params.toString();
      setBrands(await api.get<Brand[]>(`/brands${query ? `?${query}` : ''}`));
      setError(null);
    } catch (err) {
      setBrands([]);
      setError(err instanceof Error ? err.message : 'Failed to load brands');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return { brands, loading, error, refetch: fetchBrands };
}

interface EquipmentModelFilters {
  category_id?: number;
  brand_id?: number;
  search?: string;
  limit?: number;
  enabled?: boolean;
}

export function useEquipmentModels(filters: EquipmentModelFilters = {}) {
  const {
    category_id,
    brand_id,
    search = '',
    limit = 200,
    enabled = true,
  } = filters;
  const [equipmentModels, setEquipmentModels] = useState<EquipmentModel[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setEquipmentModels([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchEquipmentModels = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (category_id) params.append('category_id', String(category_id));
        if (brand_id) params.append('brand_id', String(brand_id));
        if (search.trim()) params.append('search', search.trim());
        params.append('limit', String(limit));

        const response = await api.get<EquipmentModel[]>(`/equipment-models?${params.toString()}`);
        setEquipmentModels(response);
        setError(null);
      } catch (err) {
        setEquipmentModels([]);
        setError(err instanceof Error ? err.message : 'Failed to load equipment models');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipmentModels();
  }, [brand_id, category_id, enabled, limit, search]);

  return { equipmentModels, loading, error };
}

export function useMe(refreshKey = 0) {
  const [me, setMe] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMe = useCallback(async () => {
    void refreshKey;
    try {
      setLoading(true);
      setMe(await api.get<User>('/users/me'));
      setError(null);
    } catch (err) {
      setMe(null);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [refreshKey]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return { me, loading, error, refetch: fetchMe };
}

export function useUpdateMe() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateMe = async (data: UserUpdate) => {
    try {
      setLoading(true);
      setError(null);
      return await api.patch<User>('/users/me', data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateMe, loading, error };
}

export function useMyListings(enabled = true, refreshKey = 0) {
  const [listings, setListings] = useState<ListingShort[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchMyListings = useCallback(async () => {
    void refreshKey;
    if (!enabled) {
      setListings([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setListings(await api.get<ListingShort[]>('/users/me/listings'));
      setError(null);
    } catch (err) {
      setListings([]);
      setError(err instanceof Error ? err.message : 'Failed to load profile listings');
    } finally {
      setLoading(false);
    }
  }, [enabled, refreshKey]);

  useEffect(() => {
    fetchMyListings();
  }, [fetchMyListings]);

  return { listings, loading, error, refetch: fetchMyListings };
}

export function useCreateListing() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createListing = async (data: ListingCreate) => {
    try {
      setLoading(true);
      setError(null);
      return await api.post<Listing>('/listings', data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create listing';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createListing, loading, error };
}

export function useUploadListingPhoto() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadPhoto = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', file);
      return await api.upload<PhotoUpload>('/listings/photos/upload', formData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload photo';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { uploadPhoto, loading, error };
}

export function useToggleFavorite() {
  const [loading, setLoading] = useState(false);

  const addFavorite = async (listingId: number) => {
    setLoading(true);
    try {
      await api.post(`/listings/${listingId}/favorite`);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (listingId: number) => {
    setLoading(true);
    try {
      await api.delete(`/listings/${listingId}/favorite`);
    } finally {
      setLoading(false);
    }
  };

  return { addFavorite, removeFavorite, loading };
}

export function useFavorites(enabled = true, refreshKey = 0) {
  const [favorites, setFavorites] = useState<ListingShort[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    void refreshKey;
    if (!enabled) {
      setFavorites([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setFavorites(await api.get<ListingShort[]>('/users/me/favorites'));
      setError(null);
    } catch (err) {
      setFavorites([]);
      setError(err instanceof Error ? err.message : 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  }, [enabled, refreshKey]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return { favorites, loading, error, refetch: fetchFavorites };
}
