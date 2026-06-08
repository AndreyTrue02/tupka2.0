import React, { useEffect, useMemo, useState } from 'react';
import { Edit3, Link as LinkIcon, Loader2, Plus, RefreshCw, Save, Star, X } from 'lucide-react';
import { Screen } from '../components/layout';
import { ListingListItem } from '../components/marketplace';
import { EmptyFavorites, EmptyProfileListings, ProfileSkeleton } from '../components/ui';
import { useFavorites, useMe, useMyListings, useUpdateMe } from '../hooks';
import { getCategoryDisplayName, getCityDisplayName } from '../lib/catalog';

interface ProfilePageProps {
  onCreateListing: () => void;
  onListingClick: (listingId: number) => void;
  refreshKey?: number;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onCreateListing, onListingClick, refreshKey = 0 }) => {
  const { me, loading: meLoading, error: meError, refetch: refetchMe } = useMe(refreshKey);
  const { updateMe, loading: savingProfile, error: profileSaveError } = useUpdateMe();
  const profileReady = Boolean(me) && !meLoading && !meError;
  const { listings, loading: listingsLoading, error: listingsError, refetch: refetchListings } = useMyListings(profileReady, refreshKey);
  const { favorites, loading: favoritesLoading, error: favoritesError, refetch: refetchFavorites } = useFavorites(profileReady, refreshKey);

  const stats = useMemo(() => ({
    listings: listings.length,
    favorites: favorites.length,
    views: listings.reduce((sum, listing) => sum + listing.views_count, 0),
  }), [favorites.length, listings]);
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    username: '',
    city: '',
    bio: '',
    music_projects: '',
    project_links: '',
  });

  useEffect(() => {
    if (!me || editing) return;
    setProfileForm({
      first_name: me.first_name || '',
      username: me.username || '',
      city: me.city || '',
      bio: me.bio || '',
      music_projects: me.music_projects || '',
      project_links: me.project_links || '',
    });
  }, [editing, me]);

  const updateProfileField = (field: keyof typeof profileForm, value: string) => {
    setProfileForm((current) => ({ ...current, [field]: value }));
  };

  const handleSaveProfile = async () => {
    await updateMe(profileForm);
    await refetchMe();
    setEditing(false);
  };

  if (meLoading) {
    return <Screen withTabBar><div className="mx-auto max-w-[760px] p-4"><ProfileSkeleton /></div></Screen>;
  }

  if (meError || !me) {
    return (
      <Screen withTabBar>
        <div className="flex min-h-full items-center justify-center px-6 text-center">
          <div>
            <h1 className="mb-2 text-lg font-semibold">Не удалось загрузить профиль</h1>
            <p className="mb-4 text-sm text-secondary">{meError || 'Профиль недоступен'}</p>
            <button onClick={refetchMe} className="btn-secondary inline-flex w-auto items-center gap-2">
              <RefreshCw className="h-4 w-4" />Повторить
            </button>
          </div>
        </div>
      </Screen>
    );
  }

  const username = me?.username || 'demo_seller';
  const displayName = me?.first_name || username;

  return (
    <Screen withTabBar className="bg-white">
      <div className="mx-auto min-h-full w-full max-w-[760px] border-x border-separator bg-white">
        <section className="border-b border-separator px-5 pt-5 safe-area-top">
          <div className="mb-3 flex items-start gap-3.5">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl border border-separator bg-accent-soft text-lg font-semibold text-accent" style={{ fontFamily: 'var(--font-mono)' }}>
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h1 className="truncate text-[17px] font-semibold">{displayName}</h1>
                <button onClick={() => setEditing((current) => !current)} className="icon-button h-8 w-8" aria-label={editing ? 'Закрыть редактирование' : 'Редактировать профиль'}>
                  {editing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1 text-[10px] text-secondary" style={{ fontFamily: 'var(--font-mono)' }}>
                @{username} · {getCityDisplayName(me?.city)}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="filter-chip cursor-default py-1">Электроника</span>
                <span className="filter-chip cursor-default py-1">Синтезаторы</span>
                <span className="filter-chip cursor-default py-1">Студия</span>
              </div>
            </div>
          </div>

          {me.bio && !editing && <p className="mb-3 text-[12px] leading-5 text-secondary">{me.bio}</p>}
          {me.music_projects && !editing && (
            <div className="mb-3 rounded-md border border-separator bg-secondary p-3">
              <span className="section-label mb-1.5 block">Музыкальные проекты</span>
              <p className="whitespace-pre-wrap text-[12px] leading-5">{me.music_projects}</p>
            </div>
          )}
          {me.project_links && !editing && (
            <div className="mb-3 flex flex-wrap gap-2">
              {me.project_links.split('\n').map((link) => link.trim()).filter(Boolean).map((link) => (
                <a key={link} href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noreferrer" className="filter-chip inline-flex items-center gap-1 normal-case">
                  <LinkIcon className="h-3 w-3" />{link.replace(/^https?:\/\//, '')}
                </a>
              ))}
            </div>
          )}

          {editing && (
            <div className="mb-4 rounded-lg border border-separator bg-white p-3">
              <div className="grid grid-cols-2 gap-2.5">
                <label className="block">
                  <span className="section-label mb-1 block">Имя</span>
                  <input value={profileForm.first_name} onChange={(event) => updateProfileField('first_name', event.target.value)} className="input-field py-2.5" placeholder="Demo" />
                </label>
                <label className="block">
                  <span className="section-label mb-1 block">Город</span>
                  <input value={profileForm.city} onChange={(event) => updateProfileField('city', event.target.value)} className="input-field py-2.5" placeholder="Москва" />
                </label>
              </div>
              <label className="mt-2.5 block">
                <span className="section-label mb-1 block">Telegram username</span>
                <input value={profileForm.username} onChange={(event) => updateProfileField('username', event.target.value.replace(/^@/, ''))} className="input-field py-2.5" placeholder="username" />
              </label>
              <label className="mt-2.5 block">
                <span className="section-label mb-1 block">О себе</span>
                <textarea value={profileForm.bio} onChange={(event) => updateProfileField('bio', event.target.value)} className="input-field min-h-20 resize-none py-2.5" placeholder="Что продаёте, чем занимаетесь, где можно встретиться" />
              </label>
              <label className="mt-2.5 block">
                <span className="section-label mb-1 block">Музыкальные проекты</span>
                <textarea value={profileForm.music_projects} onChange={(event) => updateProfileField('music_projects', event.target.value)} className="input-field min-h-20 resize-none py-2.5" placeholder="Проекты, лайвы, студия, жанры" />
              </label>
              <label className="mt-2.5 block">
                <span className="section-label mb-1 block">Ссылки</span>
                <textarea value={profileForm.project_links} onChange={(event) => updateProfileField('project_links', event.target.value)} className="input-field min-h-16 resize-none py-2.5" placeholder="soundcloud.com/...\ninstagram.com/..." />
              </label>
              {profileSaveError && <p className="mt-2 rounded-md border border-red-100 bg-red-50 p-2 text-[11px] text-red-700">{profileSaveError}</p>}
              <button onClick={handleSaveProfile} disabled={savingProfile} className="btn-primary mt-3 flex items-center justify-center gap-2 py-3 disabled:opacity-50">
                {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Сохранить профиль
              </button>
            </div>
          )}

          <div className="grid grid-cols-4 border-t border-separator">
            {[
              [me?.rating.toFixed(1) || '5.0', 'Рейтинг', true],
              [stats.listings, 'Объявл.', false],
              [me?.deals_count || 0, 'Продано', false],
              [stats.views, 'Просмотры', false],
            ].map(([value, label, accent], index) => (
              <div key={label as string} className={`py-3 text-center ${index < 3 ? 'border-r border-separator' : ''}`}>
                <div className={`text-[16px] font-semibold ${accent ? 'text-accent' : ''}`} style={{ fontFamily: 'var(--font-mono)' }}>
                  {accent && <Star className="mr-1 inline h-3 w-3 fill-current" />}{value}
                </div>
                <div className="mt-1 text-[8px] font-medium uppercase tracking-[0.1em] text-muted" style={{ fontFamily: 'var(--font-mono)' }}>{label}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="px-4 pb-8 pt-3">
          <button onClick={onCreateListing} className="btn-primary mb-4 flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" />Новое объявление
          </button>

          <div className="section-divider mb-1"><span className="section-label">Активные объявления</span></div>
          {listingsLoading ? (
            <ProfileSkeleton />
          ) : listingsError ? (
            <div className="py-5 text-center">
              <p className="mb-2 text-[12px] text-secondary">{listingsError}</p>
              <button onClick={refetchListings} className="text-[10px] font-medium uppercase tracking-[0.1em] text-accent">Повторить</button>
            </div>
          ) : listings.length === 0 ? (
            <EmptyProfileListings />
          ) : (
            listings.map((listing, index) => (
              <ListingListItem key={listing.id} listing={{ ...listing, category: listing.category ? { ...listing.category, name: getCategoryDisplayName(listing.category.name) } : null }} index={index} onClick={() => onListingClick(listing.id)} />
            ))
          )}

          <div className="section-divider mb-1 mt-4"><span className="section-label">Избранное</span></div>
          {favoritesLoading ? (
            <ProfileSkeleton />
          ) : favoritesError ? (
            <div className="py-5 text-center">
              <p className="mb-2 text-[12px] text-secondary">{favoritesError}</p>
              <button onClick={refetchFavorites} className="text-[10px] font-medium uppercase tracking-[0.1em] text-accent">Повторить</button>
            </div>
          ) : favorites.length === 0 ? (
            <EmptyFavorites />
          ) : (
            favorites.map((listing, index) => (
              <ListingListItem key={listing.id} listing={{ ...listing, category: listing.category ? { ...listing.category, name: getCategoryDisplayName(listing.category.name) } : null }} index={index} statusLabel="Сохранено" onClick={() => onListingClick(listing.id)} />
            ))
          )}
        </div>
      </div>
    </Screen>
  );
};
