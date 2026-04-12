import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Briefcase, Lightbulb, Loader2, Check, X } from 'lucide-react';
import { suggestProfession } from '../services/api';
import { BACKEND_URL } from '../config';

/**
 * Props:
 * - value: string con el code de la profesión (ej: 'ELECTRICIAN') — single mode
 * - onChange: función que recibe el code seleccionado — single mode
 * - multiple: boolean — enables multi-select mode
 * - values: string[] — selected codes in multi mode
 * - required: boolean
 * - focusColor: "purple" | "blue" | "green"
 * - placeholder: string
 * - professionalName: string
 */
function ProfessionSelector({
  value = '',
  onChange,
  multiple = false,
  values = [],
  required = false,
  focusColor = 'purple',
  placeholder = 'Seleccioná una profesión',
  professionalName = '',
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestionText, setSuggestionText] = useState('');
  const [suggestionStatus, setSuggestionStatus] = useState(null);
  const [professions, setProfessions] = useState([]);
  const [loadingProfessions, setLoadingProfessions] = useState(false);
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  const accentBg = { purple: 'bg-purple-50', blue: 'bg-blue-50', green: 'bg-green-50' }[focusColor] || 'bg-purple-50';
  const accentText = { purple: 'text-purple-600', blue: 'text-blue-600', green: 'text-green-600' }[focusColor] || 'text-purple-600';
  const accentBorder = { purple: 'border-purple-500', blue: 'border-blue-500', green: 'border-green-500' }[focusColor] || 'border-purple-500';
  const focusBorder = { purple: 'focus:border-purple-500', blue: 'focus:border-blue-500', green: 'focus:border-green-500' }[focusColor] || 'focus:border-purple-500';
  const accentCheck = { purple: 'bg-purple-600', blue: 'bg-blue-600', green: 'bg-green-600' }[focusColor] || 'bg-purple-600';

  useEffect(() => {
    const load = async () => {
      setLoadingProfessions(true);
      try {
        const res = await fetch(BACKEND_URL + '/api/professions');
        if (res.ok) setProfessions(await res.json());
      } catch { /* silent */ } finally {
        setLoadingProfessions(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  const handleSelect = (profCode) => {
    if (multiple) {
      const updated = values.includes(profCode)
        ? values.filter(v => v !== profCode)
        : [...values, profCode];
      onChange(updated);
      // keep dropdown open
    } else {
      onChange(profCode);
      setOpen(false);
      setSearch('');
    }
  };

  const handleRemoveTag = (e, profCode) => {
    e.stopPropagation();
    onChange(values.filter(v => v !== profCode));
  };

  const handleToggle = () => {
    setOpen(prev => !prev);
    setSearch('');
    setShowSuggestion(false);
    setSuggestionText('');
    setSuggestionStatus(null);
  };

  const handleSuggest = async () => {
    if (!suggestionText.trim()) return;
    setSuggestionStatus('sending');
    try {
      await suggestProfession(suggestionText.trim(), professionalName);
      setSuggestionStatus('sent');
      setSuggestionText('');
    } catch {
      setSuggestionStatus('error');
    }
  };

  const filtered = search.trim()
    ? professions.filter(p => p.displayName.toLowerCase().includes(search.toLowerCase()))
    : professions;

  // Group by category
  const grouped = filtered.reduce((acc, p) => {
    const cat = p.category || 'Otras';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});
  const categories = Object.keys(grouped).sort((a, b) =>
    a === 'Otras' ? 1 : b === 'Otras' ? -1 : a.localeCompare(b, 'es')
  );

  const selectedLabel = !multiple && value
    ? (professions.find(p => p.code === value)?.displayName || value)
    : '';

  const selectedLabels = multiple
    ? values.map(v => professions.find(p => p.code === v)?.displayName || v)
    : [];

  const hasSelection = multiple ? values.length > 0 : !!selectedLabel;

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-gray-700 font-semibold mb-2 flex items-center text-base">
        <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
        Elegí tu profesión (puede ser más de una) {required && '*'}
      </label>

      <button
        type="button"
        onClick={handleToggle}
        className={`w-full border-2 rounded-2xl px-4 py-3 text-left transition-all text-base flex items-center justify-between bg-white min-h-[52px]
          ${open ? accentBorder : 'border-gray-200 hover:border-gray-300'}
          ${hasSelection ? 'text-gray-800' : 'text-gray-400'}`}
      >
        {multiple ? (
          <span className="flex flex-wrap gap-1.5 flex-1 min-w-0">
            {selectedLabels.length > 0 ? selectedLabels.map((label, i) => (
              <span key={values[i]} className={`inline-flex items-center gap-1 text-sm px-2.5 py-0.5 rounded-full font-medium ${accentBg} ${accentText}`}>
                {label}
                <button
                  type="button"
                  onClick={(e) => handleRemoveTag(e, values[i])}
                  className="ml-0.5 rounded-full hover:opacity-70"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </span>
        ) : (
          <span className="truncate">{selectedLabel || placeholder}</span>
        )}
        {loadingProfessions
          ? <Loader2 className="w-4 h-4 text-gray-400 flex-shrink-0 animate-spin ml-2" />
          : <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 ml-2 transition-transform ${open ? 'rotate-180' : ''}`} />
        }
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar profesión..."
                className={`w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none ${focusBorder} transition-all`}
              />
            </div>
          </div>

          <ul className="max-h-72 overflow-y-auto">
            {loadingProfessions ? (
              <li className="px-4 py-6 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </li>
            ) : categories.length > 0 ? (
              categories.map(cat => (
                <li key={cat}>
                  {(categories.length > 1 || search.trim()) && (
                    <div className="px-4 pt-2.5 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wide">
                      {cat}
                    </div>
                  )}
                  {grouped[cat].map(prof => {
                    const isSelected = multiple ? values.includes(prof.code) : prof.code === value;
                    return (
                      <div
                        key={prof.code}
                        onClick={() => handleSelect(prof.code)}
                        className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between
                          ${categories.length > 1 ? 'pl-5' : ''}
                          ${isSelected
                            ? `${accentBg} ${accentText} font-semibold`
                            : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <span>{prof.displayName}</span>
                        {multiple && isSelected && (
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${accentCheck}`}>
                            <Check className="w-2.5 h-2.5 text-white" />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </li>
              ))
            ) : (
              <li className="px-4 py-4 text-sm text-gray-400 text-center">
                No se encontraron resultados
              </li>
            )}
          </ul>

          <div className="border-t border-gray-100">
            {!showSuggestion ? (
              <button
                type="button"
                onClick={() => { setShowSuggestion(true); setSuggestionStatus(null); }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-purple-600 hover:bg-purple-50 transition-colors"
              >
                <Lightbulb className="w-4 h-4 flex-shrink-0" />
                ¿No está tu profesión? Sugerila
              </button>
            ) : (
              <div className="px-4 py-3">
                {suggestionStatus === 'sent' ? (
                  <p className="text-sm text-green-600 font-medium text-center py-1">¡Gracias! La revisamos pronto.</p>
                ) : (
                  <>
                    <p className="text-xs text-gray-500 mb-2">¿Qué profesión falta?</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={suggestionText}
                        onChange={(e) => setSuggestionText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSuggest()}
                        placeholder="Ej: Fotógrafo"
                        maxLength={100}
                        className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400"
                      />
                      <button
                        type="button"
                        onClick={handleSuggest}
                        disabled={suggestionStatus === 'sending' || !suggestionText.trim()}
                        className="px-3 py-2 bg-purple-600 text-white text-sm rounded-lg disabled:opacity-50 active:bg-purple-700 transition-colors"
                      >
                        {suggestionStatus === 'sending' ? '...' : 'Enviar'}
                      </button>
                    </div>
                    {suggestionStatus === 'error' && (
                      <p className="text-xs text-red-500 mt-1">No se pudo enviar, intentá de nuevo.</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfessionSelector;
