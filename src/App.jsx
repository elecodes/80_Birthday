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

  const filteredPlaylist = playlist.filter(song => {
    const term = searchTerm.toLowerCase();
    if (searchType === 'title') return song.title.toLowerCase().includes(term);
    if (searchType === 'artist') return song.artist.toLowerCase().includes(term);
    return song.title.toLowerCase().includes(term) || song.artist.toLowerCase().includes(term);
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdfbf7] via-[#fdf2f4] to-[#fef9e7]">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-medium text-rose-900 tracking-tight" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            Felices
          </h1>
          <p className="mt-2 text-rose-700/70 text-sm md:text-base tracking-[0.2em] uppercase font-bold">
            Playlist de Cumpleaños
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
            className={`flex-1 px-6 py-4 rounded-[2rem] transition-all duration-500 flex items-center justify-center gap-3 uppercase border-2 group active:scale-95 text-[11px] font-black tracking-[0.15em] shadow-xl ${
              showMoodPicker
                ? 'bg-rose-900 text-white border-rose-900 shadow-rose-900/20'
                : 'bg-white text-rose-500 border-rose-100/50 shadow-rose-100/20 hover:bg-rose-500 hover:text-white hover:shadow-rose-200/40'
            }`}
          >
            <svg style={{ width: '18px', height: '18px' }} className={`transition-transform duration-700 ${showMoodPicker ? 'rotate-180' : 'group-hover:rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            {showMoodPicker ? 'CERRAR' : 'MEZCLAR SMART'}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const nextState = !showAddForm;
              setShowAddForm(nextState);
              if (nextState) { setShowDropdown(false); setShowMoodPicker(false); }
            }}
            className={`flex-1 px-6 py-4 rounded-[2rem] transition-all duration-500 shadow-xl uppercase flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 text-[11px] font-black tracking-[0.15em] border-2 ${
              showAddForm 
                ? 'bg-rose-900 text-white border-rose-900 shadow-rose-900/20' 
                : 'bg-gradient-to-r from-rose-500 to-rose-600 text-white border-transparent shadow-rose-200/50'
            }`}
          >
            <span className={`text-xl leading-none mb-0.5 transition-transform duration-500 ${showAddForm ? 'rotate-45' : ''}`}>+</span> 
            {showAddForm ? 'CERRAR' : 'AGREGAR CANCIÓN'}
          </button>
        </div>

        {/* Mood Picker for Shuffle */}
        {showMoodPicker && (
          <section className="bg-white/98 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(158,42,79,0.25)] p-6 md:p-8 mb-8 border border-rose-100 relative z-[65]">
            <div className="mb-5">
              <h3 className="text-xl font-medium text-rose-900" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                ¿Qué mood querés?
              </h3>
              <p className="text-xs text-rose-400 font-bold uppercase tracking-widest mt-1">Elegí 1 o 2 moods para mezclar</p>
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
                    className={`px-5 py-3.5 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center gap-2.5 border-2 ${
                      isSelected
                        ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-200/50 scale-105'
                        : 'bg-white text-rose-400 border-rose-50 hover:border-rose-200 hover:bg-rose-50/50'
                    }`}
                  >
                    <span className="text-lg">{m.emoji}</span>
                    <span>{m.label}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-300'
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
                className={`flex-[2] py-4 rounded-2xl font-black uppercase tracking-widest transition-all duration-500 active:scale-95 flex items-center justify-center gap-3 text-[11px] ${
                  selectedShuffleMoods.length > 0
                    ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-2xl shadow-rose-200/60 hover:from-rose-600 hover:to-rose-700'
                    : 'bg-rose-100 text-rose-300 cursor-not-allowed'
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
                className="flex-1 py-4 rounded-2xl border-2 border-rose-100 text-rose-400 font-black uppercase tracking-widest hover:bg-rose-50 transition-all duration-300 active:scale-95 text-[11px]"
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
            className="bg-white/98 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(158,42,79,0.25)] p-6 md:p-10 mb-10 border border-rose-100 animate-in fade-in slide-in-from-top-6 duration-700 z-[80] relative"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-3xl font-medium text-rose-900 leading-tight" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                  Nueva Canción
                </h3>
                <p className="text-xs text-rose-400 font-bold uppercase tracking-widest mt-1">Comparte algo especial</p>
              </div>
              <button 
                onClick={() => setShowAddForm(false)}
                className="w-12 h-12 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center hover:bg-rose-100 transition-all hover:rotate-90 duration-300 shadow-inner"
              >
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddSong} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-300"></span>
                  Enlace de YouTube
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=... o pega el link"
                  value={newSong.youtubeUrl}
                  onChange={(e) => setNewSong({ ...newSong, youtubeUrl: e.target.value })}
                  className="w-full px-6 py-5 rounded-2xl border-2 border-rose-50 bg-rose-50/30 text-rose-900 placeholder-rose-200 focus:outline-none focus:border-rose-300 focus:bg-white transition-all duration-300 text-base shadow-inner"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-300"></span>
                    Título
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Bésame Mucho"
                    value={newSong.title}
                    onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                    className="w-full px-6 py-5 rounded-2xl border-2 border-rose-50 bg-rose-50/30 text-rose-900 placeholder-rose-200 focus:outline-none focus:border-rose-300 focus:bg-white transition-all duration-300 text-base shadow-inner"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-300"></span>
                    Artista
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Luis Miguel"
                    value={newSong.artist}
                    onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
                    className="w-full px-6 py-5 rounded-2xl border-2 border-rose-50 bg-rose-50/30 text-rose-900 placeholder-rose-200 focus:outline-none focus:border-rose-300 focus:bg-white transition-all duration-300 text-base shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-300"></span>
                  Letra (Opcional)
                </label>
                <textarea
                  placeholder="Escribe la letra aquí..."
                  value={newSong.lyrics || ''}
                  onChange={(e) => setNewSong({ ...newSong, lyrics: e.target.value })}
                  rows={4}
                  className="w-full px-6 py-5 rounded-2xl border-2 border-rose-50 bg-rose-50/30 text-rose-900 placeholder-rose-200 focus:outline-none focus:border-rose-300 focus:bg-white transition-all duration-300 resize-none text-base shadow-inner"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-4 block">Estado de Ánimo</label>
                <div className="flex flex-wrap gap-3 p-1">
                  {MOODS.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setNewSong({ ...newSong, mood: m.id })}
                      className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center gap-2 border-2 ${
                        newSong.mood === m.id
                          ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-200/50 scale-105'
                          : 'bg-white text-rose-400 border-rose-50 hover:border-rose-100 hover:bg-rose-50/30'
                      }`}
                    >
                      <span className="text-lg">{m.emoji}</span> {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl flex items-center gap-3 border border-rose-100 animate-bounce">
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-bold">{error}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-[2] py-5 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-black uppercase tracking-widest hover:from-rose-600 hover:to-rose-700 transition-all duration-500 shadow-2xl shadow-rose-200/60 active:scale-95 flex items-center justify-center gap-3"
                >
                  Confirmar y Agregar
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setError(''); setNewSong({ title: '', artist: '', youtubeUrl: '', lyrics: '', mood: 'happy' }); }}
                  className="flex-1 py-5 rounded-2xl border-2 border-rose-100 text-rose-300 font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-400 transition-all duration-300 active:scale-95"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Playlist Dropdown */}
        <div className="relative mb-12">
          <button
            onClick={() => {
              setShowDropdown(!showDropdown);
              if (!showDropdown) setShowAddForm(false);
            }}
            className={`w-full p-5 md:p-8 rounded-[2.5rem] transition-all duration-500 flex items-center justify-between border-2 group relative z-10 ${
              showDropdown 
                ? 'bg-white border-rose-200 shadow-2xl scale-[1.01]' 
                : 'bg-white/60 border-white/80 hover:bg-white/80 hover:border-rose-100 shadow-xl'
            }`}
          >
            <div className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${showDropdown ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-rose-50 text-rose-400 group-hover:bg-rose-100'}`}>
                <svg style={{ width: '28px', height: '28px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-[11px] font-black text-rose-300 uppercase tracking-[0.2em] leading-none mb-2">Colección de Música</p>
                <div className="flex items-center gap-3">
                  <p className="text-2xl font-bold text-rose-900 leading-none">{playlist.length}</p>
                  <span className="text-rose-400/50 font-medium tracking-wide">canciones disponibles</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase transition-opacity duration-500 ${showDropdown ? 'opacity-0' : 'bg-rose-100/50 text-rose-500'}`}>Ver Todo</span>
              <svg style={{ width: '24px', height: '24px' }} className={`text-rose-200 transition-transform duration-700 ${showDropdown ? 'rotate-180 text-rose-400' : 'group-hover:translate-y-1'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-4 z-50 bg-white/98 backdrop-blur-3xl rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(158,42,79,0.2)] border border-rose-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-500">

              {/* Active Mood Filter Banner — sticky top */}
              {moodMatchedIds.size > 0 && (
                <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 bg-gradient-to-r from-rose-500 to-rose-400 text-white rounded-t-[3rem]">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xl">
                      {activeMoodEmojis.map((emoji, i) => (
                        <span key={i}>{emoji}</span>
                      ))}
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest opacity-90">
                      {moodMatchedIds.size} canciones · Mood Mix
                    </span>
                  </div>
                  <button
                    onClick={() => { setMoodMatchedIds(new Set()); setActiveMoodEmojis([]); }}
                    className="text-[10px] font-black uppercase tracking-widest bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-full transition-all"
                  >
                    ✕ Limpiar
                  </button>
                </div>
              )}

              {/* Search and Filters */}
              <div className="p-6 border-b border-rose-50 bg-white">
                <div className="flex gap-2 mb-5 overflow-x-auto pb-1 no-scrollbar">
                  <button 
                    onClick={() => setSearchType('both')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest transition-all shrink-0 ${searchType === 'both' ? 'bg-rose-100 text-rose-600' : 'bg-rose-50/50 text-rose-300 hover:bg-rose-50'}`}
                  >TODO</button>
                  <button 
                    onClick={() => setSearchType('title')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest transition-all shrink-0 ${searchType === 'title' ? 'bg-rose-100 text-rose-600' : 'bg-rose-50/50 text-rose-300 hover:bg-rose-50'}`}
                  >TÍTULO</button>
                  <button 
                    onClick={() => setSearchType('artist')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest transition-all shrink-0 ${searchType === 'artist' ? 'bg-rose-100 text-rose-600' : 'bg-rose-50/50 text-rose-300 hover:bg-rose-50'}`}
                  >AUTOR</button>
                </div>
                <div className="relative group">
                  <input
                    type="text"
                    placeholder={`Buscar ${searchType === 'title' ? 'por título' : searchType === 'artist' ? 'por autor' : 'canción o autor'}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-rose-50 bg-rose-50/30 text-rose-900 placeholder-rose-200 focus:outline-none focus:border-rose-200 focus:bg-white transition-all shadow-inner text-base"
                  />
                  <svg style={{ width: '20px', height: '20px' }} className="absolute left-4 top-4 text-rose-200 group-focus-within:text-rose-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-4 top-4 p-1 rounded-full hover:bg-rose-100 text-rose-300 transition-colors"
                    >
                      <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Song List */}
              <div className="max-h-[500px] overflow-y-auto bg-white custom-scrollbar">
                {filteredPlaylist.length > 0 ? (
                  <div className="divide-y divide-rose-50/50">
                    {filteredPlaylist.map((song) => {
                      const actualIndex = playlist.findIndex(s => s.id === song.id);
                      const isActive = actualIndex === currentIndex;
                      const isMoodMatch = moodMatchedIds.has(song.id);
                      
                      return (
                        <button
                          onClick={() => handleSongClick(actualIndex)}
                          className={`w-full text-left px-8 py-6 transition-all duration-500 flex items-center gap-8 group cursor-pointer relative ${
                            isActive ? 'bg-rose-50/80' : isMoodMatch ? 'bg-gradient-to-r from-rose-50/60 via-white to-white hover:from-rose-50 hover:via-rose-50/30' : 'hover:bg-rose-50/40'
                          }`}
                        >
                          {/* Mood match accent bar */}
                          {isMoodMatch && (
                            <div className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-rose-400 to-rose-300 opacity-80" />
                          )}
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-sm font-black shadow-md transition-all duration-500 ${
                            isActive ? 'bg-rose-500 text-white scale-110 rotate-3 shadow-rose-200' : 'bg-rose-50 text-rose-300 group-hover:scale-105 group-hover:rotate-2'
                          }`}>
                            {isActive ? (
                              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            ) : (
                              actualIndex + 1
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0 space-y-1">
                            <h4 className={`text-base font-bold truncate transition-colors duration-300 ${
                              isActive ? 'text-rose-600' : 'text-rose-900 group-hover:text-rose-600'
                            }`}>
                              {song.title}
                            </h4>
                            <p className={`text-[12px] font-medium truncate transition-colors duration-300 ${
                              isActive ? 'text-rose-400' : 'text-rose-400/50'
                            }`}>
                              {song.artist}
                            </p>
                          </div>

                          {songErrors.has(song.youtubeId) && (
                            <div className="shrink-0 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100 flex items-center gap-1">
                              <span className="w-2 h-2 bg-rose-600 rounded-full animate-pulse" />
                              RESTRINGIDA
                            </div>
                          )}

                          {isActive && (
                            <div className="flex gap-1 items-end h-5 shrink-0 ml-auto">
                              <div className="w-1 bg-rose-500 animate-music-bar-1 h-3 rounded-full" />
                              <div className="w-1 bg-rose-500 animate-music-bar-2 h-4 rounded-full" />
                              <div className="w-1 bg-rose-500 animate-music-bar-3 h-3.5 rounded-full" />
                            </div>
                          )}

                          {!isActive && (
                            <div className="shrink-0 flex items-center gap-4">
                              {isMoodMatch && activeMoodEmojis.length > 0 ? (
                                <span className="text-[10px] px-4 py-2 bg-rose-500 text-white rounded-[1rem] font-black border border-rose-400 flex items-center gap-2 shadow-lg shadow-rose-200/50 uppercase tracking-wider">
                                  <span className="text-sm">{activeMoodEmojis.join('')}</span>
                                  <span>MOOD</span>
                                </span>
                              ) : (
                                (() => {
                                  const moodId = getSongMood(song);
                                  const moodInfo = MOODS.find(m => m.id === moodId) || MOODS[0];
                                  return (
                                    <span className="text-[10px] px-4 py-2 bg-white text-rose-500 rounded-[1rem] font-black border border-rose-100 flex items-center gap-2 shadow-sm uppercase tracking-wider transition-all group-hover:scale-105 group-hover:border-rose-200">
                                      <span className="text-sm">{moodInfo.emoji}</span>
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
                                className="p-3 text-rose-200 hover:text-rose-600 transition-all rounded-2xl hover:bg-rose-50 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0"
                              >
                                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-24 text-center">
                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-200">
                      <svg style={{ width: '32px', height: '32px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-rose-400 font-medium italic">No se encontraron resultados</p>
                    <button onClick={() => setSearchTerm('')} className="text-sm text-rose-600 font-bold uppercase tracking-widest mt-4 hover:text-rose-700 transition-colors">Limpiar búsqueda</button>
                  </div>
                )}
              </div>
            </div>

          )}
        </div>

        <section className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl shadow-rose-100/50 p-4 md:p-6 mb-8">
          <div className="aspect-video rounded-2xl overflow-hidden bg-rose-900/5">
            <div id="youtube-player" className="w-full h-full" />
          </div>

          <div className="text-center mt-6">
            <h2 className="text-2xl md:text-3xl font-medium text-rose-900 leading-tight" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
              {currentSong.title}
            </h2>
            <p className="mt-1 text-rose-700/60 text-base md:text-lg">
              {currentSong.artist}
            </p>
          </div>

          <div className="flex justify-center items-center gap-6 mt-8">
            <button
              onClick={() => {
                setShowMoodPicker(true);
                setShowAddForm(false);
                setShowDropdown(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-12 h-12 rounded-full bg-white text-rose-500 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 border border-rose-100 group"
              title="Smart Shuffle por mood"
              aria-label="Smart Shuffle"
            >
              <svg style={{ width: '24px', height: '24px' }} className="group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>

            <button
              onClick={goToPrevious}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-300/50 hover:shadow-xl hover:shadow-rose-300/60 hover:scale-105 transition-all duration-300"
              aria-label="Previous song"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
              </svg>
            </button>

            <button
              onClick={goToNext}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-300/50 hover:shadow-xl hover:shadow-rose-300/60 hover:scale-105 transition-all duration-300"
              aria-label="Next song"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowAddForm(true);
                setShowDropdown(false);
              }}
              className="w-12 h-12 rounded-full bg-white text-rose-500 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 border border-rose-100 group"
              title="Add New Song"
              aria-label="Add Song"
            >
              <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>

          {currentSong.lyrics && (
            <div className="mt-6 text-center">
              <div className="bg-gradient-to-b from-rose-50 to-gold-30 rounded-2xl p-4 max-h-48 overflow-y-auto">
                <p className="text-rose-800 leading-relaxed whitespace-pre-line text-lg font-medium">
                  {currentSong.lyrics}
                </p>
              </div>
            </div>
          )}
        </section>


        <footer className="mt-8 text-center text-rose-700/50 text-sm">
          <div className="flex justify-center gap-4 mb-2">
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(playlist, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'birthday-playlist.json';
                a.click();
              }}
              className="underline hover:no-underline text-xs opacity-50 hover:opacity-100"
            >
              Export
            </button>
            <button
              onClick={() => {
                if (confirm('Reset to default playlist? Your songs will be lost.')) {
                  setPlaylist(initialPlaylist);
                  setCurrentIndex(0);
                }
              }}
              className="underline hover:no-underline text-xs opacity-50 hover:opacity-100"
            >
              Reset
            </button>
          </div>
          <p>con ❤️ para Mam</p>
        </footer>
      </div>
    </div>
  );
}

export default App;