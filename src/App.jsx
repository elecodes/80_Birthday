import { useState, useEffect } from 'react';
import { initialPlaylist } from './playlist';
import { MOODS, MOOD_TAGS } from './moods';

// Modular UI Components
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { PlayerHero } from './components/player/PlayerHero';
import { MoodFilterSection } from './components/mood/MoodFilterSection';
import { PlaylistDrawer } from './components/playlist/PlaylistDrawer';
import { AddSongModal } from './components/forms/AddSongModal';

function App() {
  const [playlist, setPlaylist] = useState(initialPlaylist);
  const [currentIndex, setCurrentIndex] = useState(0);

  // UI Drawer / Modal toggles
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);

  // Mood filter & smart shuffle state
  const [selectedShuffleMoods, setSelectedShuffleMoods] = useState([]);
  const [moodMatchedIds, setMoodMatchedIds] = useState(new Set());
  const [activeMoodEmojis, setActiveMoodEmojis] = useState([]);

  // YouTube player state
  const [player, setPlayer] = useState(null);
  const [songErrors, setSongErrors] = useState(new Set());

  const currentSong = playlist[currentIndex] || playlist[0] || {
    title: 'Cargando...',
    artist: '',
    youtubeId: '',
  };

  // Playback navigation
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? playlist.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === playlist.length - 1 ? 0 : prev + 1));
  };

  const handleSelectSong = (index) => {
    setCurrentIndex(index);
    setShowDropdown(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // YouTube API initialization
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const createPlayer = () => {
      const onError = (event) => {
        console.error('YouTube Player Error:', event.data);
        if (event.data === 150 || event.data === 101) {
          setSongErrors((prev) => new Set([...prev, currentSong.youtubeId]));
          setTimeout(goToNext, 3000);
        }
      };

      const newPlayer = new window.YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: currentSong.youtubeId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          rel: 0,
          showinfo: 0,
          modestbranding: 1,
        },
        events: {
          onStateChange: (event) => {
            if (event.data === 0) {
              goToNext();
            }
          },
          onError,
          onReady: (event) => {
            setPlayer(event.target);
          },
        },
      });
      setPlayer(newPlayer);
    };

    window.onYouTubeIframeAPIReady = () => {
      createPlayer();
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    }

    return () => {
      if (player && player.destroy) player.destroy();
    };
  }, []);

  // Update video when current song or playlist changes
  useEffect(() => {
    if (player && player.loadVideoById && currentSong?.youtubeId) {
      player.loadVideoById(currentSong.youtubeId);
    }
  }, [currentIndex, playlist, player]);

  // Mood filter selection handler
  const toggleShuffleMood = (moodId) => {
    setSelectedShuffleMoods((prev) => {
      if (prev.includes(moodId)) return prev.filter((m) => m !== moodId);
      if (prev.length >= 2) return [prev[1], moodId];
      return [...prev, moodId];
    });
  };

  // Smart shuffle algorithm (greedy similarity by tags)
  const handleSmartShuffle = (moodFilter = []) => {
    let primary, secondary;
    if (moodFilter.length > 0) {
      const filterTags = moodFilter.flatMap((m) => MOOD_TAGS[m] || []);
      primary = playlist.filter((s) => s.tags?.some((t) => filterTags.includes(t)));
      secondary = playlist.filter((s) => !s.tags?.some((t) => filterTags.includes(t)));
    } else {
      primary = [...playlist];
      secondary = [];
    }

    const greedyShuffle = (songs) => {
      if (songs.length === 0) return [];
      const remaining = [...songs];
      const shuffled = [];

      const randomIndex = Math.floor(Math.random() * remaining.length);
      let current = remaining.splice(randomIndex, 1)[0];
      shuffled.push(current);

      while (remaining.length > 0) {
        let bestIndex = 0;
        let maxOverlap = -1;

        for (let i = 0; i < remaining.length; i++) {
          const overlap =
            remaining[i].tags?.filter((t) => current.tags?.includes(t)).length || 0;
          const score = overlap + Math.random() * 0.5;
          if (score > maxOverlap) {
            maxOverlap = score;
            bestIndex = i;
          }
        }

        current = remaining.splice(bestIndex, 1)[0];
        shuffled.push(current);
      }
      return shuffled;
    };

    const shuffledPrimary = greedyShuffle(primary);
    const shuffledSecondary = greedyShuffle(secondary);
    const finalPlaylist = [...shuffledPrimary, ...shuffledSecondary];

    if (moodFilter.length > 0) {
      setMoodMatchedIds(new Set(primary.map((s) => s.id)));
      setActiveMoodEmojis(
        moodFilter.map((id) => MOODS.find((m) => m.id === id)?.emoji).filter(Boolean)
      );
    } else {
      setMoodMatchedIds(new Set());
      setActiveMoodEmojis([]);
    }

    setPlaylist(finalPlaylist);
    setCurrentIndex(0);
    setShowDropdown(false);
    setShowMoodPicker(false);
    setSelectedShuffleMoods([]);
  };

  const handleAddSong = (newSong) => {
    setPlaylist((prev) => {
      const updated = [...prev, newSong];
      setCurrentIndex(updated.length - 1);
      return updated;
    });
    setShowAddForm(false);
  };

  const handleDeleteSong = (index) => {
    if (playlist.length <= 1) return;
    const newPlaylist = playlist.filter((_, i) => i !== index);
    setPlaylist(newPlaylist);
    if (currentIndex >= newPlaylist.length) {
      setCurrentIndex(newPlaylist.length - 1);
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(playlist, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'birthday-playlist.json';
    a.click();
  };

  const handleResetPlaylist = () => {
    if (confirm('¿Restablecer la playlist original? Tus canciones agregadas se perderán.')) {
      setPlaylist(initialPlaylist);
      setCurrentIndex(0);
      setMoodMatchedIds(new Set());
      setActiveMoodEmojis([]);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Dynamic Ambient Background Glows */}
      <div className="ambient-bg-glow w-96 h-96 bg-primary/20 -top-20 -left-20 animate-soft-float" />
      <div
        className="ambient-bg-glow w-96 h-96 bg-secondary/20 top-1/3 -right-20 animate-soft-float"
        style={{ animationDelay: '-2s' }}
      />
      <div
        className="ambient-bg-glow w-80 h-80 bg-accent/20 bottom-10 left-10 animate-soft-float"
        style={{ animationDelay: '-1s' }}
      />

      <div className="max-w-5xl mx-auto px-4 py-8 md:py-16 relative z-10">
        {/* Festive Header */}
        <Header />

        {/* Top Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 relative z-[60]">
          <button
            type="button"
            onClick={() => {
              const next = !showMoodPicker;
              setShowMoodPicker(next);
              if (next) {
                setShowAddForm(false);
                setShowDropdown(false);
              }
            }}
            className={`flex-1 px-6 py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 uppercase border group active:scale-95 text-[11px] font-black tracking-[0.18em] shadow-md backdrop-blur-md ${
              showMoodPicker
                ? 'bg-primary text-primary-foreground border-primary glow-primary'
                : 'glass-card text-foreground border-border/80 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:glow-primary'
            }`}
          >
            <svg
              className={`w-5 h-5 transition-transform duration-500 ${
                showMoodPicker ? 'rotate-180' : 'group-hover:rotate-180'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            {showMoodPicker ? 'Cerrar Moods' : 'Mezclar Smart'}
          </button>

          <button
            type="button"
            onClick={() => {
              const next = !showAddForm;
              setShowAddForm(next);
              if (next) {
                setShowDropdown(false);
                setShowMoodPicker(false);
              }
            }}
            className={`flex-1 px-6 py-4 rounded-2xl transition-all duration-300 shadow-md uppercase flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 text-[11px] font-black tracking-[0.18em] border backdrop-blur-md ${
              showAddForm
                ? 'bg-primary text-primary-foreground border-primary glow-primary'
                : 'bg-primary text-primary-foreground border-transparent hover:bg-primary/90 glow-primary'
            }`}
          >
            <span
              className={`text-xl leading-none mb-0.5 transition-transform duration-500 ${
                showAddForm ? 'rotate-45' : ''
              }`}
            >
              +
            </span>
            {showAddForm ? 'Cerrar Formulario' : 'Agregar Canción'}
          </button>
        </div>

        {/* Mood Selection for Smart Shuffle */}
        {showMoodPicker && (
          <MoodFilterSection
            playlist={playlist}
            selectedMoods={selectedShuffleMoods}
            onToggleMood={toggleShuffleMood}
            onSmartShuffle={handleSmartShuffle}
            onShuffleAll={() => handleSmartShuffle([])}
            onClose={() => setShowMoodPicker(false)}
          />
        )}

        {/* Add Song Form Modal */}
        <AddSongModal
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onAddSong={handleAddSong}
        />

        {/* Playlist Collection Drawer */}
        <PlaylistDrawer
          playlist={playlist}
          currentIndex={currentIndex}
          isOpen={showDropdown}
          onToggle={() => {
            setShowDropdown(!showDropdown);
            if (!showDropdown) {
              setShowAddForm(false);
              setShowMoodPicker(false);
            }
          }}
          onSelectSong={handleSelectSong}
          onDeleteSong={handleDeleteSong}
          moodMatchedIds={moodMatchedIds}
          activeMoodEmojis={activeMoodEmojis}
          onClearMoodFilter={() => {
            setMoodMatchedIds(new Set());
            setActiveMoodEmojis([]);
          }}
          songErrors={songErrors}
        />

        {/* Spotlight Video & Controls Section */}
        <PlayerHero
          currentSong={currentSong}
          currentIndex={currentIndex}
          totalSongs={playlist.length}
          onPrevious={goToPrevious}
          onNext={goToNext}
          onOpenShuffle={() => {
            setShowMoodPicker(true);
            setShowAddForm(false);
            setShowDropdown(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenAddSong={() => {
            setShowAddForm(true);
            setShowDropdown(false);
            setShowMoodPicker(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          isRestricted={songErrors.has(currentSong.youtubeId)}
        />

        {/* Tribute Footer */}
        <Footer
          onExportJson={handleExportJson}
          onResetPlaylist={handleResetPlaylist}
        />
      </div>
    </div>
  );
}

export default App;