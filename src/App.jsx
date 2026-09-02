import { useState, useEffect, useRef } from 'react';
import { initialPlaylist, getYoutubeEmbedUrl, extractYoutubeId } from './playlist';
import { MOODS, MOOD_TAGS, getSongMood } from './moods';

function App() {
  const [playlist, setPlaylist] = useState(initialPlaylist);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [selectedShuffleMoods, setSelectedShuffleMoods] = useState([]);
  const [moodMatchedIds, setMoodMatchedIds] = useState(new Set());
  const [activeMoodEmojis, setActiveMoodEmojis] = useState([]);
  const [newSong, setNewSong] = useState({ title: '', artist: '', youtubeUrl: '', lyrics: '', mood: 'happy' });
  const [error, setError] = useState('');
  const [player, setPlayer] = useState(null);
  const [songErrors, setSongErrors] = useState(new Set());
  const addFormRef = useRef(null);
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(0);

  // Initialize YouTube API
  useEffect(() => {
    // Load the API script if it hasn't been loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Set up the global callback
    window.onYouTubeIframeAPIReady = () => {
      createPlayer();
    };

    // If API is already loaded, just create the player
    if (window.YT && window.YT.Player) {
      createPlayer();
    }

    return () => {
      if (player) player.destroy();
    };
  }, []);

  // Scroll to form when it opens
  useEffect(() => {
    if (showAddForm && addFormRef.current) {
      addFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showAddForm]);

  const currentSong = playlist[currentIndex] || playlist[0] || { title: 'Cargando...', artist: '', youtubeId: '' };

  const createPlayer = () => {
    const onError = (event) => {
      console.error('YouTube Player Error:', event.data);
      // Error 101/150 means video cannot be played in embedded player
      if (event.data === 150 || event.data === 101) {
        setSongErrors(prev => new Set([...prev, currentSong.youtubeId]));
        // Auto skip after a delay?
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
        modestbranding: 1
      },
      events: {
        onStateChange: (event) => {
          // event.data === 0 means the video ended
          if (event.data === 0) {
            goToNext();
          }
        },
        onError,
        onReady: (event) => {
          setPlayer(event.target);
        }
      }
    });
    setPlayer(newPlayer);
  };

  // Update player when song changes
  useEffect(() => {
    if (player && player.loadVideoById && currentSong?.youtubeId) {
      player.loadVideoById(currentSong.youtubeId);
    }
  }, [currentIndex, playlist, player]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? playlist.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === playlist.length - 1 ? 0 : prev + 1));
  };

  const handleSongClick = (index) => {
    setCurrentIndex(index);
    setShowDropdown(false);
  };

  const toggleShuffleMood = (moodId) => {
    setSelectedShuffleMoods(prev => {
      if (prev.includes(moodId)) return prev.filter(m => m !== moodId);
      if (prev.length >= 2) return [prev[1], moodId]; // Replace oldest
      return [...prev, moodId];
    });
  };

  const handleSmartShuffle = (moodFilter = []) => {
    console.log('Iniciando Smart Shuffle...', moodFilter.length ? `Moods: ${moodFilter}` : 'All songs');
    
    // Separate songs by mood match if filters are active
    let primary, secondary;
    if (moodFilter.length > 0) {
      const filterTags = moodFilter.flatMap(m => MOOD_TAGS[m] || []);
      primary = playlist.filter(s => s.tags?.some(t => filterTags.includes(t)));
      secondary = playlist.filter(s => !s.tags?.some(t => filterTags.includes(t)));
    } else {
      primary = [...playlist];
      secondary = [];
    }

    // Greedy similarity shuffle for primary group
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
          const overlap = remaining[i].tags?.filter(t => current.tags?.includes(t)).length || 0;
          const score = overlap + (Math.random() * 0.5);
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
    
    // Track which songs matched the mood filter
    if (moodFilter.length > 0) {
      setMoodMatchedIds(new Set(primary.map(s => s.id)));
      setActiveMoodEmojis(moodFilter.map(id => MOODS.find(m => m.id === id)?.emoji).filter(Boolean));
    } else {
      setMoodMatchedIds(new Set());
      setActiveMoodEmojis([]);
    }
    
    console.log(`Playlist: ${shuffledPrimary.length} matching + ${shuffledSecondary.length} rest`);
    setPlaylist(finalPlaylist);
    setCurrentIndex(0);
    setShowDropdown(false);
    setShowMoodPicker(false);
    setSelectedShuffleMoods([]);
  };

  const handleAddSong = (e) => {
    e.preventDefault();
    setError('');

    const youtubeId = extractYoutubeId(newSong.youtubeUrl);
    if (!youtubeId) {
      setError('Invalid YouTube URL. Use format: youtube.com/watch?v=xxx or youtu.be/xxx');
      return;
    }

    if (!newSong.title.trim() || !newSong.artist.trim()) {
      setError('Title and Artist are required');
      return;
    }

    const song = {
      id: Date.now(),
      title: newSong.title.trim(),
      artist: newSong.artist.trim(),
      youtubeUrl: newSong.youtubeUrl,
      youtubeId,
      lyrics: newSong.lyrics?.trim() || null,
      tags: ["user-added", newSong.mood, ...(MOOD_TAGS[newSong.mood] || [])]
    };

    console.log('Adding song:', song);
    setPlaylist((prev) => {
      const updated = [...prev, song];
      setCurrentIndex(updated.length - 1);
      return updated;
    });
    setNewSong({ title: '', artist: '', youtubeUrl: '', lyrics: '', mood: 'happy' });
    setShowAddForm(false);
  };

  const handleDelete = (index, e) => {
    e.stopPropagation();
    if (playlist.length <= 1) return;

    const newPlaylist = playlist.filter((_, i) => i !== index);
    setPlaylist(newPlaylist);

    if (currentIndex >= newPlaylist.length) {
      setCurrentIndex(newPlaylist.length - 1);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('both'); // 'title', 'artist', 'both'

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, searchType, playlist]);

  const filteredPlaylist = playlist.filter(song => {
    const term = searchTerm.toLowerCase();
    if (searchType === 'title') return song.title.toLowerCase().includes(term);
    if (searchType === 'artist') return song.artist.toLowerCase().includes(term);
    return song.title.toLowerCase().includes(term) || song.artist.toLowerCase().includes(term);
  });

  const totalPages = Math.ceil(filteredPlaylist.length / ITEMS_PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(0, totalPages - 1));
  const paginatedSongs = filteredPlaylist.slice(safePage * ITEMS_PER_PAGE, (safePage + 1) * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background glows for glassmorphic depth */}
      <div className="ambient-bg-glow w-96 h-96 bg-primary/20 -top-20 -left-20 animate-soft-float" />
      <div className="ambient-bg-glow w-96 h-96 bg-secondary/20 top-1/3 -right-20 animate-soft-float" style={{ animationDelay: '-2s' }} />
      <div className="ambient-bg-glow w-80 h-80 bg-accent/20 bottom-10 left-10 animate-soft-float" style={{ animationDelay: '-1s' }} />

      <div className="max-w-5xl mx-auto px-4 py-8 md:py-16 relative z-10">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-extrabold uppercase tracking-widest mb-4 shadow-sm backdrop-blur-md">
            <span>🎉</span> Special Edition Player
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-8xl font-black tracking-tight uppercase bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent drop-shadow-sm">
            Felices
          </h1>
          <p className="mt-3 text-muted-foreground text-sm md:text-base tracking-[0.25em] uppercase font-black opacity-90 flex items-center justify-center gap-2">
            <span className="w-8 h-[2px] bg-primary/40 rounded-full inline-block"></span>
            Playlist de Cumpleaños
            <span className="w-8 h-[2px] bg-primary/40 rounded-full inline-block"></span>
          </p>
        </header>

        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 relative z-[70]">
          <button
            type="button"
            onClick={() => {
              const next = !showMoodPicker;
              setShowMoodPicker(next);
              if (next) { setShowAddForm(false); setShowDropdown(false); }
            }}
            className={`flex-1 px-6 py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 uppercase border group active:scale-95 text-[11px] font-black tracking-[0.18em] shadow-md backdrop-blur-md ${
              showMoodPicker
                ? 'bg-primary text-primary-foreground border-primary glow-primary'
                : 'glass-card text-foreground border-border/80 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:glow-primary'
            }`}
          >
            <svg style={{ width: '18px', height: '18px' }} className={`transition-transform duration-500 ${showMoodPicker ? 'rotate-180' : 'group-hover:rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            {showMoodPicker ? 'CERRAR MOODS' : 'MEZCLAR SMART'}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const nextState = !showAddForm;
              setShowAddForm(nextState);
              if (nextState) { setShowDropdown(false); setShowMoodPicker(false); }
            }}
            className={`flex-1 px-6 py-4 rounded-2xl transition-all duration-300 shadow-md uppercase flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 text-[11px] font-black tracking-[0.18em] border backdrop-blur-md ${
              showAddForm 
                ? 'bg-primary text-primary-foreground border-primary glow-primary' 
                : 'bg-primary text-primary-foreground border-transparent hover:bg-primary/90 glow-primary'
            }`}
          >
            <span className={`text-xl leading-none mb-0.5 transition-transform duration-500 ${showAddForm ? 'rotate-45' : ''}`}>+</span> 
            {showAddForm ? 'CERRAR FORM' : 'AGREGAR CANCIÓN'}
          </button>
        </div>

        {/* Mood Picker for Shuffle */}
        {showMoodPicker && (
          <section className="glass-panel rounded-3xl p-6 md:p-8 mb-8 border border-white/60 shadow-xl transition-all duration-500 animate-in fade-in slide-in-from-top-4">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-foreground uppercase tracking-wide">
                  ¿Qué mood querés?
                </h3>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Elegí 1 o 2 moods para personalizar el orden</p>
              </div>
              <span className="text-xs font-black px-3 py-1 bg-primary/10 text-primary rounded-full">
                {selectedShuffleMoods.length}/2 elegidos
              </span>
            </div>
            <div className="flex flex-wrap gap-3 mb-6">
              {MOODS.map(m => {
                const isSelected = selectedShuffleMoods.includes(m.id);
                const matchCount = playlist.filter(s => s.tags?.some(t => (MOOD_TAGS[m.id] || []).includes(t))).length;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleShuffleMood(m.id)}
                    className={`px-5 py-3.5 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center gap-2.5 border ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-md glow-primary scale-105'
                        : 'glass-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                    }`}
                  >
                    <span className="text-xl">{m.emoji}</span>
                    <span>{m.label}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted/50 text-muted-foreground'
                    }`}>{matchCount}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => handleSmartShuffle(selectedShuffleMoods)}
                disabled={selectedShuffleMoods.length === 0}
                className={`flex-[2] py-4 rounded-xl font-black uppercase tracking-widest transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 text-[11px] ${
                  selectedShuffleMoods.length > 0
                    ? 'bg-primary text-primary-foreground shadow-md glow-primary hover:bg-primary/90'
                    : 'bg-muted/40 text-muted-foreground/50 cursor-not-allowed border border-border/50'
                }`}
              >
                <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Mezclar {selectedShuffleMoods.map(id => MOODS.find(m => m.id === id)?.emoji).join(' ')}
              </button>
              <button
                type="button"
                onClick={() => handleSmartShuffle([])}
                className="flex-1 py-4 rounded-xl border border-border glass-card text-foreground font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all duration-300 active:scale-95 text-[11px]"
              >
                Mezclar Todo
              </button>
            </div>
          </section>
        )}

        {/* Add Song Form - High visibility modal style */}
        {showAddForm && (
          <section 
            ref={addFormRef}
            className="glass-panel rounded-3xl p-6 md:p-10 mb-10 border border-white/60 shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-top-4"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-3xl font-black text-foreground uppercase tracking-tight leading-tight">
                  Nueva Canción
                </h3>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Comparte algo especial con la playlist</p>
              </div>
              <button 
                onClick={() => setShowAddForm(false)}
                className="w-11 h-11 rounded-2xl bg-muted/40 text-muted-foreground flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-all hover:rotate-90 duration-300"
              >
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddSong} className="space-y-6">
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  Enlace de YouTube
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=... o pega el link"
                  value={newSong.youtubeUrl}
                  onChange={(e) => setNewSong({ ...newSong, youtubeUrl: e.target.value })}
                  className="input-field text-base"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    Título
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Bésame Mucho"
                    value={newSong.title}
                    onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                    className="input-field text-base"
                    required
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    Artista
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Luis Miguel"
                    value={newSong.artist}
                    onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
                    className="input-field text-base"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  Letra (Opcional)
                </label>
                <textarea
                  placeholder="Escribe o pega la letra aquí..."
                  value={newSong.lyrics || ''}
                  onChange={(e) => setNewSong({ ...newSong, lyrics: e.target.value })}
                  rows={4}
                  className="input-field resize-none text-base"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-3 block">Estado de Ánimo</label>
                <div className="flex flex-wrap gap-2.5 p-1">
                  {MOODS.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setNewSong({ ...newSong, mood: m.id })}
                      className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center gap-2 border ${
                        newSong.mood === m.id
                          ? 'bg-primary text-primary-foreground border-primary glow-primary scale-105'
                          : 'glass-card text-muted-foreground border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="text-lg">{m.emoji}</span> {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-2xl flex items-center gap-3 border border-destructive/20 animate-in fade-in">
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-black">{error}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  type="submit"
                  className="flex-[2] py-4 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest hover:bg-primary/90 transition-all duration-300 shadow-md glow-primary active:scale-95 flex items-center justify-center gap-3 text-xs"
                >
                  Confirmar y Agregar
                  <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setError(''); setNewSong({ title: '', artist: '', youtubeUrl: '', lyrics: '', mood: 'happy' }); }}
                  className="flex-1 py-4 rounded-2xl border border-border glass-card text-muted-foreground font-black uppercase tracking-widest hover:bg-muted/40 transition-all duration-300 active:scale-95 text-xs"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Playlist Dropdown / Drawer */}
        <div className="relative mb-12">
          <button
            onClick={() => {
              setShowDropdown(!showDropdown);
              if (!showDropdown) setShowAddForm(false);
            }}
            className={`w-full p-6 md:p-8 rounded-3xl transition-all duration-500 flex items-center justify-between border group relative z-10 ${
              showDropdown 
                ? 'glass-panel border-primary shadow-xl glow-primary' 
                : 'glass-panel border-white/60 hover:border-primary/50 shadow-md hover:shadow-xl'
            }`}
          >
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${showDropdown ? 'bg-primary text-primary-foreground glow-primary' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'}`}>
                <svg style={{ width: '26px', height: '26px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.25em] leading-none mb-1.5">Colección de Música</p>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-black text-foreground leading-none">{playlist.length}</p>
                  <span className="text-muted-foreground/70 text-xs font-bold tracking-wide">canciones cargadas</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-500 ${showDropdown ? 'opacity-0' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                Explorar
              </span>
              <svg style={{ width: '24px', height: '24px' }} className={`text-muted-foreground transition-transform duration-500 ${showDropdown ? 'rotate-180 text-primary' : 'group-hover:translate-y-1'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-4 z-50 glass-panel rounded-3xl shadow-2xl border border-white/80 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-300">

              {/* Active Mood Filter Banner — sticky top */}
              {moodMatchedIds.size > 0 && (
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 md:px-8 py-3.5 bg-primary text-primary-foreground shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xl">
                      {activeMoodEmojis.map((emoji, i) => (
                        <span key={i}>{emoji}</span>
                      ))}
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest opacity-95">
                      {moodMatchedIds.size} canciones · Mood Mix Activo
                    </span>
                  </div>
                  <button
                    onClick={() => { setMoodMatchedIds(new Set()); setActiveMoodEmojis([]); }}
                    className="text-[10px] font-black uppercase tracking-widest bg-primary-foreground/20 hover:bg-primary-foreground/30 px-3.5 py-1.5 rounded-xl transition-all"
                  >
                    ✕ Limpiar
                  </button>
                </div>
              )}

              {/* Search and Filters */}
              <div className="p-6 md:p-8 border-b border-border/60 bg-white/40">
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
                  <button 
                    onClick={() => setSearchType('both')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all shrink-0 ${searchType === 'both' ? 'bg-primary text-primary-foreground shadow-sm glow-primary' : 'bg-muted/40 text-muted-foreground hover:bg-muted/70'}`}
                  >TODO</button>
                  <button 
                    onClick={() => setSearchType('title')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all shrink-0 ${searchType === 'title' ? 'bg-primary text-primary-foreground shadow-sm glow-primary' : 'bg-muted/40 text-muted-foreground hover:bg-muted/70'}`}
                  >TÍTULO</button>
                  <button 
                    onClick={() => setSearchType('artist')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all shrink-0 ${searchType === 'artist' ? 'bg-primary text-primary-foreground shadow-sm glow-primary' : 'bg-muted/40 text-muted-foreground hover:bg-muted/70'}`}
                  >ARTISTA</button>
                </div>
                <div className="relative group">
                  <input
                    type="text"
                    placeholder={`Buscar ${searchType === 'title' ? 'por título' : searchType === 'artist' ? 'por artista' : 'canción o artista'}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-12 pr-12 text-base"
                  />
                  <svg style={{ width: '20px', height: '20px' }} className="absolute left-4 top-4 text-muted-foreground group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-4 top-3.5 p-1.5 rounded-xl hover:bg-muted/50 text-muted-foreground transition-colors"
                    >
                      <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Song List */}
              <div className="max-h-[460px] overflow-y-auto divide-y divide-border/40">
                {filteredPlaylist.length > 0 ? (
                  <div>
                    {paginatedSongs.map((song) => {
                      const actualIndex = playlist.findIndex(s => s.id === song.id);
                      const isActive = actualIndex === currentIndex;
                      const isMoodMatch = moodMatchedIds.has(song.id);
                      
                      return (
                        <div
                          key={song.id || actualIndex}
                          onClick={() => handleSongClick(actualIndex)}
                          className={`w-full text-left px-6 md:px-8 py-4 transition-all duration-300 flex items-center gap-4 md:gap-6 group cursor-pointer relative ${
                            isActive ? 'bg-primary/10' : isMoodMatch ? 'bg-gradient-to-r from-primary/10 via-white/50 to-white/30 hover:from-primary/15' : 'hover:bg-muted/40'
                          }`}
                        >
                          {/* Mood match accent bar */}
                          {isMoodMatch && (
                            <div className="absolute left-0 top-2 bottom-2 w-1.5 rounded-r-full bg-primary shadow-sm" />
                          )}
                          
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-xs font-black transition-all duration-300 ${
                            isActive ? 'bg-primary text-primary-foreground scale-105 shadow-md glow-primary' : 'bg-muted/40 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
                          }`}>
                            {isActive ? (
                              <svg className="w-5 h-5 fill-current animate-pulse" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            ) : (
                              actualIndex + 1
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <h4 className={`text-base font-bold truncate transition-colors duration-200 ${
                              isActive ? 'text-primary' : 'text-foreground group-hover:text-primary'
                            }`}>
                              {song.title}
                            </h4>
                            <p className={`text-xs font-medium truncate ${
                              isActive ? 'text-primary/70' : 'text-muted-foreground'
                            }`}>
                              {song.artist}
                            </p>
                          </div>

                          {songErrors.has(song.youtubeId) && (
                            <div className="shrink-0 text-[10px] font-black text-destructive bg-destructive/10 px-2.5 py-1 rounded-full border border-destructive/20 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-destructive rounded-full animate-ping" />
                              RESTRINGIDA
                            </div>
                          )}

                          {isActive && (
                            <div className="flex gap-1 items-end h-5 shrink-0 ml-auto">
                              <div className="w-1 bg-primary animate-music-bar-1 h-3 rounded-full" />
                              <div className="w-1 bg-primary animate-music-bar-2 h-4 rounded-full" />
                              <div className="w-1 bg-primary animate-music-bar-3 h-3.5 rounded-full" />
                            </div>
                          )}

                          {!isActive && (
                            <div className="shrink-0 flex items-center gap-3">
                              {isMoodMatch && activeMoodEmojis.length > 0 ? (
                                <span className="text-[10px] px-3 py-1.5 bg-secondary/15 text-secondary rounded-xl font-black border border-secondary/30 flex items-center gap-1.5 uppercase tracking-wider">
                                  <span className="text-xs">{activeMoodEmojis.join('')}</span>
                                  <span>MOOD</span>
                                </span>
                              ) : (
                                (() => {
                                  const moodId = getSongMood(song);
                                  const moodInfo = MOODS.find(m => m.id === moodId) || MOODS[0];
                                  return (
                                    <span className="text-[10px] px-3 py-1.5 bg-muted/40 text-muted-foreground rounded-xl font-black border border-border/60 flex items-center gap-1.5 uppercase tracking-wider transition-all group-hover:border-primary/40 group-hover:text-foreground">
                                      <span className="text-xs">{moodInfo.emoji}</span>
                                      <span>{moodInfo.label}</span>
                                    </span>
                                  );
                                })()
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(actualIndex, e);
                                }}
                                className="p-2.5 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all rounded-xl opacity-0 group-hover:opacity-100"
                                title="Eliminar canción"
                              >
                                <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <div className="w-16 h-16 bg-muted/40 rounded-2xl flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                      <svg style={{ width: '28px', height: '28px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-muted-foreground font-bold">No se encontraron resultados</p>
                    <button onClick={() => setSearchTerm('')} className="text-xs text-primary font-black uppercase tracking-widest mt-3 hover:underline">Limpiar búsqueda</button>
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 md:px-8 py-4 bg-white/40 border-t border-border/60">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={safePage === 0}
                    className={`px-3.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                      safePage === 0
                        ? 'text-muted-foreground/30 cursor-not-allowed'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    ← Anterior
                  </button>

                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${
                          i === safePage
                            ? 'bg-primary text-primary-foreground shadow-sm glow-primary'
                            : 'text-muted-foreground hover:bg-muted/40'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={safePage === totalPages - 1}
                    className={`px-3.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                      safePage === totalPages - 1
                        ? 'text-muted-foreground/30 cursor-not-allowed'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Player Section */}
        <section className="glass-panel rounded-3xl p-6 md:p-10 mb-10 border border-white/80 shadow-2xl relative overflow-hidden">
          <div className="aspect-video rounded-2xl overflow-hidden bg-black/80 shadow-xl border border-white/20 relative group">
            <div id="youtube-player" className="w-full h-full" />
          </div>

          <div className="text-center mt-8">
            <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight leading-tight">
              {currentSong.title}
            </h2>
            <p className="mt-2 text-muted-foreground text-lg md:text-xl font-semibold flex items-center justify-center gap-2">
              <span>{currentSong.artist}</span>
            </p>
          </div>

          {/* Controls Bar */}
          <div className="flex justify-center items-center gap-5 md:gap-7 mt-8">
            <button
              onClick={() => {
                setShowMoodPicker(true);
                setShowAddForm(false);
                setShowDropdown(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-13 h-13 rounded-2xl glass-card text-muted-foreground flex items-center justify-center shadow-md hover:shadow-xl hover:scale-110 hover:text-primary hover:border-primary/50 transition-all duration-300 group"
              title="Smart Shuffle por mood"
              aria-label="Smart Shuffle"
            >
              <svg style={{ width: '22px', height: '22px' }} className="group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>

            <button
              onClick={goToPrevious}
              className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg glow-primary hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300"
              aria-label="Previous song"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
              </svg>
            </button>

            <button
              onClick={goToNext}
              className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg glow-primary hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300"
              aria-label="Next song"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowAddForm(true);
                setShowDropdown(false);
              }}
              className="w-13 h-13 rounded-2xl glass-card text-muted-foreground flex items-center justify-center shadow-md hover:shadow-xl hover:scale-110 hover:text-primary hover:border-primary/50 transition-all duration-300 group"
              title="Agregar Nueva Canción"
              aria-label="Add Song"
            >
              <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>

          {currentSong.lyrics && (
            <div className="mt-8 text-center animate-in fade-in duration-500">
              <div className="glass-card rounded-2xl p-6 max-h-56 overflow-y-auto border border-white/60 shadow-inner">
                <p className="text-foreground/90 leading-relaxed whitespace-pre-line text-lg font-medium font-sans">
                  {currentSong.lyrics}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center text-muted-foreground text-xs space-y-3">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(playlist, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'birthday-playlist.json';
                a.click();
              }}
              className="px-4 py-2 rounded-xl glass-card text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all font-bold uppercase tracking-wider"
            >
              Exportar JSON
            </button>
            <button
              onClick={() => {
                if (confirm('¿Restablecer la playlist original? Tus canciones agregadas se perderán.')) {
                  setPlaylist(initialPlaylist);
                  setCurrentIndex(0);
                }
              }}
              className="px-4 py-2 rounded-xl glass-card text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all font-bold uppercase tracking-wider"
            >
              Restablecer
            </button>
          </div>
          <p className="font-bold opacity-80 pt-2 flex items-center justify-center gap-1">
            con <span className="text-primary text-sm inline-block animate-pulse">❤️</span> para Mam
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;