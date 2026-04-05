import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import LoadingScreen from '../components/LoadingScreen';
import SharePdfModal from '../components/SharePdfModal';
import { BACKEND_URL } from '../config';

// ─── Thumbnails CSS de cada layout ────────────────────────────────────────────

function ThumbnailClasico() {
  return (
    <div className="w-full h-full flex rounded overflow-hidden border border-gray-200">
      <div className="w-1/3 bg-slate-100 flex flex-col items-center pt-3 px-1.5 gap-1.5">
        <div className="w-7 h-7 rounded-full bg-indigo-300" />
        <div className="w-full space-y-1 mt-1">
          <div className="h-1 bg-gray-300 rounded" />
          <div className="h-1 bg-gray-200 rounded w-3/4" />
          <div className="h-1 bg-gray-200 rounded w-2/3" />
        </div>
        <div className="w-full mt-1 space-y-1">
          <div className="h-1 bg-indigo-200 rounded" />
          <div className="h-1 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
      <div className="flex-1 bg-white p-2 space-y-2">
        <div className="h-2 bg-gray-700 rounded w-3/4" />
        <div className="h-1.5 bg-indigo-400 rounded w-1/2" />
        <div className="space-y-1 mt-1">
          <div className="h-1 bg-gray-200 rounded" />
          <div className="h-1 bg-gray-200 rounded w-5/6" />
          <div className="h-1 bg-gray-200 rounded w-4/5" />
        </div>
        <div className="h-1.5 bg-gray-700 rounded w-1/2 mt-1" />
        <div className="space-y-1">
          <div className="h-1 bg-gray-200 rounded w-5/6" />
          <div className="h-1 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

function ThumbnailMinimalista() {
  return (
    <div className="w-full h-full bg-white rounded border border-gray-200 p-3 space-y-2">
      <div className="h-2.5 bg-gray-700 rounded w-3/4" />
      <div className="h-1.5 bg-indigo-400 rounded w-1/2" />
      <div className="h-px bg-indigo-300 rounded" />
      <div className="space-y-1 pt-1">
        <div className="h-1 bg-gray-200 rounded" />
        <div className="h-1 bg-gray-200 rounded w-5/6" />
        <div className="h-1 bg-gray-200 rounded w-4/5" />
      </div>
      <div className="h-1.5 bg-gray-400 rounded w-2/5 mt-1" />
      <div className="space-y-1">
        <div className="h-1 bg-gray-200 rounded w-5/6" />
        <div className="h-1 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  );
}

function ThumbnailEjecutivo() {
  return (
    <div className="w-full h-full rounded border border-gray-200 overflow-hidden">
      <div className="bg-slate-800 px-2 py-2 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-slate-500 flex-shrink-0" />
        <div className="flex-1 space-y-1">
          <div className="h-1.5 bg-white rounded w-14" />
          <div className="h-1 bg-slate-400 rounded w-10" />
        </div>
      </div>
      <div className="h-1 bg-indigo-500" />
      <div className="bg-white p-2 space-y-1.5">
        <div className="h-1.5 bg-gray-700 rounded w-1/2" />
        <div className="space-y-1">
          <div className="h-1 bg-gray-200 rounded" />
          <div className="h-1 bg-gray-200 rounded w-5/6" />
          <div className="h-1 bg-gray-200 rounded w-4/5" />
        </div>
        <div className="h-1.5 bg-gray-700 rounded w-2/5 mt-1" />
        <div className="space-y-1">
          <div className="h-1 bg-gray-200 rounded w-5/6" />
          <div className="h-1 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

const LAYOUTS = [
  { id: 'clasico',      name: 'Clásico',      desc: 'Sidebar con foto y datos de contacto', Thumb: ThumbnailClasico },
  { id: 'minimalista',  name: 'Minimalista',   desc: 'Columna única, limpio y moderno',       Thumb: ThumbnailMinimalista },
  { id: 'ejecutivo',    name: 'Ejecutivo',     desc: 'Header oscuro con banda de color',      Thumb: ThumbnailEjecutivo },
];

// ─── Componente principal ──────────────────────────────────────────────────────

function GenerarCvPdf() {
  const navigate = useNavigate();
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLayout, setSelectedLayout] = useState('clasico');
  const [includeDescription, setIncludeDescription] = useState(true);
  const [includeSkills, setIncludeSkills] = useState(true);
  const [selectedWorkIds, setSelectedWorkIds] = useState([]);
  const [selectedEducationIds, setSelectedEducationIds] = useState([]);
  const [selectedCertIds, setSelectedCertIds] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePdfBlob, setSharePdfBlob] = useState(null);

  useEffect(() => {
    loadCvData();
  }, []);

  const loadCvData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/cv/me/full`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setCvData(data);
      // Seleccionar todos por defecto
      setSelectedWorkIds((data.workExperiences || []).map(w => w.workHistoryId));
      setSelectedEducationIds((data.education || []).map(e => e.id));
      setSelectedCertIds((data.certifications || []).map(c => c.id));
    } catch {
      navigate('/cv-view');
    } finally {
      setLoading(false);
    }
  };

  const toggleId = (id, list, setList) => {
    setList(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const isAllSelected =
    (!cvData?.description || includeDescription) &&
    (!cvData?.skills || includeSkills) &&
    selectedWorkIds.length === (cvData?.workExperiences || []).length &&
    selectedEducationIds.length === (cvData?.education || []).length &&
    selectedCertIds.length === (cvData?.certifications || []).length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setIncludeDescription(false);
      setIncludeSkills(false);
      setSelectedWorkIds([]);
      setSelectedEducationIds([]);
      setSelectedCertIds([]);
    } else {
      setIncludeDescription(true);
      setIncludeSkills(true);
      setSelectedWorkIds((cvData?.workExperiences || []).map(w => w.workHistoryId));
      setSelectedEducationIds((cvData?.education || []).map(e => e.id));
      setSelectedCertIds((cvData?.certifications || []).map(c => c.id));
    }
  };

  const handlePreview = (layoutId) => {
    navigate(`/preview-pdf?layout=${layoutId}`);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('authToken');
      const professional = (() => { try { return JSON.parse(localStorage.getItem('professional')); } catch { return null; } })();

      const body = {
        layout: selectedLayout,
        includeDescription,
        includeSkills,
        workHistoryIds: selectedWorkIds,
        educationIds: selectedEducationIds,
        certificationIds: selectedCertIds,
      };

      const response = await fetch(`${BACKEND_URL}/api/cv/${professional?.id}/generate-pdf`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error();

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CV_${professional?.name || 'Profesional'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      alert('Hubo un error al generar el PDF. Intentá de nuevo.');
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const token = localStorage.getItem('authToken');
      const professional = (() => { try { return JSON.parse(localStorage.getItem('professional')); } catch { return null; } })();

      const body = {
        layout: selectedLayout,
        includeDescription,
        includeSkills,
        workHistoryIds: selectedWorkIds,
        educationIds: selectedEducationIds,
        certificationIds: selectedCertIds,
      };

      const response = await fetch(`${BACKEND_URL}/api/cv/${professional?.id}/generate-pdf`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error();

      const blob = await response.blob();
      setSharePdfBlob(blob);
      setShowShareModal(true);
    } catch {
      alert('Hubo un error al generar el PDF. Intentá de nuevo.');
    } finally {
      setSharing(false);
    }
  };

  if (loading) return <LoadingScreen message="Cargando tu CV..." />;

  const hasContent =
    selectedWorkIds.length > 0 ||
    selectedEducationIds.length > 0 ||
    selectedCertIds.length > 0 ||
    (includeDescription && cvData?.description) ||
    (includeSkills && cvData?.skills);

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 pt-6 pb-8">
        <div className="max-w-lg mx-auto">
          <BackButton to="/cv-view" />
          <h1 className="text-2xl roboto-light text-white mt-4">Generar CV para imprimir</h1>
          <p className="text-white/80 text-sm mt-1">Elegí el diseño y el contenido que querés incluir</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">

        {/* ── Selector de layout ── */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Elegí el diseño</h2>
          <div className="grid grid-cols-3 gap-3">
            {LAYOUTS.map(({ id, name, desc, Thumb }) => (
              <div key={id} className="flex flex-col gap-2">
                <button
                  onClick={() => setSelectedLayout(id)}
                  className={`rounded-xl overflow-hidden border-2 transition-all aspect-[3/4] ${
                    selectedLayout === id
                      ? 'border-indigo-500 shadow-md shadow-indigo-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Thumb />
                </button>
                <p className={`text-xs font-semibold text-center ${selectedLayout === id ? 'text-indigo-600' : 'text-gray-500'}`}>
                  {name}
                </p>
                <button
                  onClick={() => { setSelectedLayout(id); handlePreview(id); }}
                  className="text-xs text-indigo-500 underline text-center leading-tight"
                >
                  Vista previa
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Contenido a incluir ── */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Seleccioná el contenido que querés en el PDF</h2>
          <div className="space-y-1">

            {/* Seleccionar todos */}
            <CheckRow
              label="Seleccionar todos"
              checked={isAllSelected}
              onChange={handleSelectAll}
              bold
            />
            <div className="border-b border-gray-200 mb-2" />

            {/* Descripción */}
            {cvData?.description && (
              <CheckRow
                label="Descripción / Sobre mí"
                checked={includeDescription}
                onChange={() => setIncludeDescription(v => !v)}
              />
            )}

            {/* Skills */}
            {cvData?.skills && (
              <CheckRow
                label="Aptitudes y habilidades"
                checked={includeSkills}
                onChange={() => setIncludeSkills(v => !v)}
              />
            )}

            {/* Experiencias laborales */}
            {(cvData?.workExperiences || []).length > 0 && (
              <>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-3 pb-1">
                  Experiencia laboral
                </p>
                {cvData.workExperiences.map(w => (
                  <CheckRow
                    key={w.workHistoryId}
                    label={`${w.position}${w.businessName ? ` — ${w.businessName}` : ''}`}
                    sublabel={w.isActive ? 'Actual' : null}
                    checked={selectedWorkIds.includes(w.workHistoryId)}
                    onChange={() => toggleId(w.workHistoryId, selectedWorkIds, setSelectedWorkIds)}
                  />
                ))}
              </>
            )}

            {/* Educación */}
            {(cvData?.education || []).length > 0 && (
              <>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-3 pb-1">
                  Educación y capacitaciones
                </p>
                {cvData.education.map(e => (
                  <CheckRow
                    key={e.id}
                    label={e.degree || e.institution}
                    sublabel={e.degree ? e.institution : null}
                    checked={selectedEducationIds.includes(e.id)}
                    onChange={() => toggleId(e.id, selectedEducationIds, setSelectedEducationIds)}
                  />
                ))}
              </>
            )}

            {/* Certificaciones */}
            {(cvData?.certifications || []).length > 0 && (
              <>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-3 pb-1">
                  Certificaciones
                </p>
                {cvData.certifications.map(c => (
                  <CheckRow
                    key={c.id}
                    label={c.name}
                    sublabel={c.issuer || null}
                    checked={selectedCertIds.includes(c.id)}
                    onChange={() => toggleId(c.id, selectedCertIds, setSelectedCertIds)}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Botones sticky ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 shadow-lg">
        <div className="max-w-lg mx-auto space-y-2">
          <button
            onClick={handleGenerate}
            disabled={generating || sharing || !hasContent}
            className={`w-full py-4 rounded-2xl font-semibold text-white text-base transition-all ${
              generating || sharing || !hasContent
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 active:scale-95'
            }`}
          >
            {generating ? 'Generando PDF...' : 'Guardar el PDF de tu CV'}
          </button>
          <button
            onClick={handleShare}
            disabled={generating || sharing || !hasContent}
            className={`w-full py-4 rounded-2xl font-semibold text-base transition-all border-2 ${
              generating || sharing || !hasContent
                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                : 'border-indigo-400 text-indigo-600 hover:bg-indigo-50 active:scale-95'
            }`}
          >
            {sharing ? 'Preparando...' : 'Compartir el PDF de tu CV'}
          </button>
          {!hasContent && (
            <p className="text-center text-xs text-gray-400 mt-1">Seleccioná al menos un elemento</p>
          )}
        </div>
      </div>

      {showShareModal && (
        <SharePdfModal
          pdfBlob={sharePdfBlob}
          professionalName={(() => { try { return JSON.parse(localStorage.getItem('professional'))?.name; } catch { return null; } })()}
          professionalId={(() => { try { return JSON.parse(localStorage.getItem('professional'))?.publicSlug; } catch { return null; } })()}
          onClose={() => { setShowShareModal(false); setSharePdfBlob(null); }}
        />
      )}

    </div>
  );
}

// ─── Sub-componente CheckRow ───────────────────────────────────────────────────

function CheckRow({ label, sublabel, checked, onChange, bold = false }) {
  return (
    <label className="flex items-start gap-3 py-3 border-b border-gray-50 cursor-pointer active:bg-gray-50 rounded-lg px-1 transition-colors">
      <div className="flex-shrink-0 mt-0.5">
        <div
          onClick={onChange}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            checked ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'
          }`}
        >
          {checked && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0" onClick={onChange}>
        <p className={`text-sm leading-snug ${bold ? 'font-semibold text-gray-900' : 'text-gray-800'}`}>{label}</p>
        {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
    </label>
  );
}

export default GenerarCvPdf;
