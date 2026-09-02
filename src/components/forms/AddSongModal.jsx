import { useState } from 'react';
import { MOODS, MOOD_TAGS } from '../../moods';
import { extractYoutubeId } from '../../playlist';

export function AddSongModal({ isOpen, onClose, onAddSong }) {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    youtubeUrl: '',
    lyrics: '',
    mood: 'happy',
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const youtubeId = extractYoutubeId(formData.youtubeUrl);
    if (!youtubeId) {
      setError('Enlace de YouTube inválido. Usa formato: youtube.com/watch?v=... o youtu.be/...');
      return;
    }

    if (!formData.title.trim() || !formData.artist.trim()) {
      setError('El título y el artista son obligatorios.');
      return;
    }

    const song = {
      id: Date.now(),
      title: formData.title.trim(),
      artist: formData.artist.trim(),
      youtubeUrl: formData.youtubeUrl.trim(),
      youtubeId,
      lyrics: formData.lyrics?.trim() || null,
      tags: ['user-added', formData.mood, ...(MOOD_TAGS[formData.mood] || [])],
    };

    onAddSong(song);
    setFormData({ title: '', artist: '', youtubeUrl: '', lyrics: '', mood: 'happy' });
    setError('');
    onClose();
  };

  return (
    <section className="glass-panel rounded-3xl p-6 sm:p-8 md:p-10 mb-10 border border-white/80 shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-top-4 select-none">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl sm:text-3xl font-black text-foreground uppercase tracking-tight leading-tight">
            Nueva Canción
          </h3>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">
            Compartí algo especial en la playlist de mamá
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-2xl bg-muted/40 text-muted-foreground flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-all duration-300 active:scale-95"
          title="Cerrar formulario"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Enlace de YouTube
          </label>
          <input
            type="text"
            placeholder="https://www.youtube.com/watch?v=... o pega el link"
            value={formData.youtubeUrl}
            onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
            className="input-field text-sm sm:text-base"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Título de la Canción
            </label>
            <input
              type="text"
              placeholder="Ej: Bésame Mucho"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field text-sm sm:text-base"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Artista
            </label>
            <input
              type="text"
              placeholder="Ej: Luis Miguel"
              value={formData.artist}
              onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
              className="input-field text-sm sm:text-base"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            Letra de la Canción (Opcional)
          </label>
          <textarea
            placeholder="Escribe o pega la letra aquí..."
            value={formData.lyrics}
            onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
            rows={4}
            className="input-field resize-none text-sm sm:text-base custom-scrollbar"
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-3 block">
            Estado de Ánimo (Mood)
          </label>
          <div className="flex flex-wrap gap-2.5">
            {MOODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setFormData({ ...formData, mood: m.id })}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center gap-2 border ${
                  formData.mood === m.id
                    ? 'bg-primary text-primary-foreground border-primary glow-primary scale-105 shadow-md'
                    : 'glass-card text-muted-foreground border-border hover:border-primary/50'
                }`}
              >
                <span className="text-base">{m.emoji}</span> {m.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-2xl flex items-center gap-3 border border-destructive/20 animate-in fade-in">
            <span className="text-lg">⚠️</span>
            <p className="text-xs sm:text-sm font-black">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            className="flex-[2] py-4 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest hover:bg-primary/90 transition-all duration-300 shadow-md glow-primary active:scale-95 flex items-center justify-center gap-2 text-xs"
          >
            Confirmar y Agregar
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl border border-border glass-card text-muted-foreground font-black uppercase tracking-widest hover:bg-muted/40 transition-all duration-300 active:scale-95 text-xs"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}
