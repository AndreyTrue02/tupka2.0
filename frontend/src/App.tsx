import { useState, useEffect } from 'react';
import { TabBar } from './components/layout';
import {
  FeedPage,
  SearchPage,
  ListingDetailPage,
  CreateListingPage,
  ProfilePage,
} from './pages';
import { SplashScreen } from './components/ui';
import { api } from './lib/api';
import { initTelegram, setBackButton, hideBackButton } from './lib/telegram';
import { useTheme } from './hooks';

type MainTab = 'feed' | 'search' | 'profile';
type ModalView = 'create-listing' | 'listing-detail' | null;

interface AppState {
  activeTab: MainTab;
  modal: ModalView;
  selectedListingId: number | null;
}

function App() {
  useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [dataVersion, setDataVersion] = useState(0);
  const [state, setState] = useState<AppState>({
    activeTab: 'feed',
    modal: null,
    selectedListingId: null,
  });
  useEffect(() => {
    const tg = initTelegram();

    if (tg?.initData) {
      api.setInitData(tg.initData);
    } else if (import.meta.env.DEV) {
      api.setInitData('mock');
    }
  }, []);

  useEffect(() => {
    if (state.modal) {
      setBackButton(() => closeModal());
    } else {
      hideBackButton();
    }
  }, [state.modal]);

  const closeModal = () => {
    setState(prev => ({
      ...prev,
      modal: null,
      selectedListingId: null,
    }));
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'create') {
      setState(prev => ({ ...prev, modal: 'create-listing' }));
    } else {
      setState(prev => ({
        ...prev,
        activeTab: tab as MainTab,
        modal: null,
        selectedListingId: null,
      }));
    }
  };

  const handleListingClick = (listingId: number) => {
    setState(prev => ({
      ...prev,
      selectedListingId: listingId,
      modal: 'listing-detail',
    }));
  };

  const handleCreateSuccess = () => {
    setDataVersion((current) => current + 1);
    setState((prev) => ({
      ...prev,
      activeTab: 'feed',
      modal: null,
      selectedListingId: null,
    }));
  };

  const renderMainContent = () => {
    switch (state.activeTab) {
      case 'feed':
        return (
          <FeedPage
            onListingClick={handleListingClick}
            onSearchClick={() => setState(prev => ({ ...prev, activeTab: 'search' }))}
            refreshKey={dataVersion}
          />
        );
      case 'search':
        return <SearchPage onListingClick={handleListingClick} />;
      case 'profile':
        return (
          <ProfilePage
            onCreateListing={() => setState(prev => ({ ...prev, modal: 'create-listing' }))}
            onListingClick={handleListingClick}
            refreshKey={dataVersion}
          />
        );
      default:
        return (
          <FeedPage
            onListingClick={handleListingClick}
            onSearchClick={() => setState(prev => ({ ...prev, activeTab: 'search' }))}
            refreshKey={dataVersion}
          />
        );
    }
  };

  const renderModal = () => {
    switch (state.modal) {
      case 'create-listing':
        return (
          <CreateListingPage
            onClose={closeModal}
            onSuccess={handleCreateSuccess}
          />
        );

      case 'listing-detail':
        return (
          <ListingDetailPage
            listingId={state.selectedListingId}
            onBack={closeModal}
          />
        );

      default:
        return null;
    }
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="app-shell">
      <div className="flex-1 overflow-hidden">
        {renderMainContent()}
      </div>

      <TabBar
        activeTab={state.modal === 'create-listing' ? 'create' : state.activeTab}
        onChange={handleTabChange}
      />

      {state.modal && (
        <div
          className="fixed inset-x-0 top-0 z-40 bg-app animate-slideUp"
          style={{ bottom: 'calc(64px + var(--safe-area-inset-bottom))' }}
        >
          {renderModal()}
        </div>
      )}
    </div>
  );
}

export default App;
