import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Plus, Save, GraduationCap, ChevronDown, ChevronRight, Lock, AlertTriangle, Trash2, Award } from 'lucide-react';
import Toast from '../components/Toast';
import LoadingScreen from '../components/LoadingScreen';
import BackButton from '../components/BackButton';
import HomeButton from '../components/HomeButton';
import SearchableSelect from '../components/SearchableSelect';
import ProfessionSelector from '../components/ProfessionSelector';
import { useGeoref } from '../hooks/useGeoref';
import { BACKEND_URL } from '../config';
import { exchangeOAuthCode, saveAuthData } from '../utils/authUtils';
import ProfessionalFaqModal from '../components/ProfessionalFaqModal';

const CABA_ID = '02';

function EditCV() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [cv, setCv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingWorkIds, setSavingWorkIds] = useState(new Set());
  const [deletingWorkIds, setDeletingWorkIds] = useState(new Set());
  const [savingEducationIds, setSavingEducationIds] = useState(new Set());
  const [deletingEducationIds, setDeletingEducationIds] = useState(new Set());

  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [professionType, setProfessionType] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [savingProfession, setSavingProfession] = useState(false);
  const [freelanceJobs, setFreelanceJobs] = useState([]);
  const [employeeJobs, setEmployeeJobs] = useState([]);
  const [education, setEducation] = useState([]);

  const [zones, setZones] = useState([]);
  const [savingZone, setSavingZone] = useState(false);
  const [deletingZoneId, setDeletingZoneId] = useState(null);
  const [zonaProvincia, setZonaProvincia] = useState('');
  const [zonaProvinciaId, setZonaProvinciaId] = useState('');
  const [zonaSeleccionada, setZonaSeleccionada] = useState('');

  const [expandedFreelance, setExpandedFreelance] = useState(null);
  const [expandedEmployee, setExpandedEmployee] = useState(null);
  const [expandedEducation, setExpandedEducation] = useState(null);

  const [deleteModal, setDeleteModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [showFaq, setShowFaq] = useState(false);

  const { provincias, segundoNivel, loadingProvincias, loadingSegundoNivel, fetchSegundoNivel, getSegundoNivelLabel } = useGeoref();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      window.history.replaceState({}, document.title, window.location.pathname);
      exchangeOAuthCode(code).then((data) => {
        if (!data) {
          navigate('/professional-login');
          return;
        }
        saveAuthData('PROFESSIONAL', data.token, {
          id: data.id,
          email: data.email,
          name: data.name,
          termsAccepted: data.data?.termsAccepted ?? false
        });
        if (!data.data?.termsAccepted) {
          navigate('/accept-terms', { replace: true });
        }
      });
    }
  }, []);

  useEffect(() => { loadCV(); }, []);

  const loadCV = async () => {
    try {
      let professional;
      try {
        professional = JSON.parse(localStorage.getItem('professional'));
        if (!professional) { navigate('/professional-login'); return; }
      } catch {
        localStorage.removeItem('professional');
        navigate('/professional-login');
        return;
      }

      setProfessionType(professional.professionType || '');
      setProfessionalTitle(professional.professionalTitle || '');

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/cv/me/full`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCv({ id: data.id });
        setDescription(data.description || '');
        setSkills(data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : []);
        setZones(data.zones || []);

        const allJobs = (data.workExperiences || []).map(exp => ({
          workHistoryId: exp.workHistoryId,
          company: exp.businessName || '',
          position: exp.position || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          currentlyWorking: exp.isActive || false,
          isFreelance: exp.isFreelance === true,
          description: exp.description || '',
          referenceName: exp.referenceContact || '',
          referencePhone: exp.referencePhone || '',
          hasRatings: exp.totalRatings > 0,
          totalRatings: exp.totalRatings || 0
        }));

        setFreelanceJobs(allJobs.filter(job => job.isFreelance));
        setEmployeeJobs(allJobs.filter(job => !job.isFreelance));
        setEducation(data.education || []);
      } else {
        throw new Error('No se pudo cargar el CV');
      }
    } catch {
      setToast({ type: 'error', message: 'Error al cargar CV' });
    } finally {
      setLoading(false);
    }
  };

  const countActiveJobs = () =>
    [...freelanceJobs, ...employeeJobs].filter(job => job.currentlyWorking).length;

  const getWorkKey = (job, index, prefix) =>
    job.workHistoryId ? `id-${job.workHistoryId}` : `new-${prefix}-${index}`;

  const getEduKey = (edu, index) =>
    edu.id ? `id-${edu.id}` : `new-edu-${index}`;

  const handleAddZone = async () => {
    if (!zonaProvinciaId || !zonaSeleccionada) {
      setToast({ type: 'error', message: 'Seleccioná provincia y zona' });
      return;
    }
    setSavingZone(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/cv/${cv.id}/zones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ provincia: zonaProvincia, zona: zonaSeleccionada })
      });
      const data = await response.json();
      if (response.ok) {
        setZones(prev => [...prev, data]);
        setZonaSeleccionada('');
        setToast({ type: 'success', message: 'Zona agregada correctamente' });
      } else {
        setToast({ type: 'error', message: data.error || 'Error al agregar zona' });
      }
    } catch {
      setToast({ type: 'error', message: 'Error de conexión' });
    } finally {
      setSavingZone(false);
    }
  };

  const handleDeleteZone = async (zoneId) => {
    setDeletingZoneId(zoneId);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/cv/${cv.id}/zones/${zoneId}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setZones(prev => prev.filter(z => z.id !== zoneId));
        setToast({ type: 'success', message: 'Zona eliminada' });
      } else {
        setToast({ type: 'error', message: 'Error al eliminar zona' });
      }
    } catch {
      setToast({ type: 'error', message: 'Error de conexión' });
    } finally {
      setDeletingZoneId(null);
    }
  };

  const handleSaveWorkExperience = async (job, isFreelance, index) => {
    if (!cv?.id) { setToast({ type: 'error', message: 'Error: CV no inicializado' }); return; }
    if (!job.position?.trim()) { setToast({ type: 'error', message: 'El puesto es obligatorio' }); return; }
    if (job.startDate && job.endDate && !job.currentlyWorking) {
      if (new Date(job.endDate) < new Date(job.startDate)) {
        setToast({ type: 'error', message: 'La fecha de finalización no puede ser anterior a la de inicio' });
        return;
      }
    }

    const key = getWorkKey(job, index, isFreelance ? 'fl' : 'emp');
    setSavingWorkIds(prev => new Set(prev).add(key));
    try {
      const token = localStorage.getItem('authToken');
      const payload = {
        businessId: job.workHistoryId || null,
        businessName: job.company || '',
        position: job.position,
        startDate: job.startDate,
        endDate: job.endDate,
        isActive: job.currentlyWorking,
        isFreelance,
        description: job.description,
        referenceContact: job.referenceName || '',
        referencePhone: job.referencePhone || ''
      };

      const response = await fetch(`${BACKEND_URL}/api/cv/${cv.id}/work-experience`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const updatedJob = { ...job, workHistoryId: data.workHistoryId, hasRatings: data.totalRatings > 0, totalRatings: data.totalRatings || 0 };
        if (isFreelance) {
          setFreelanceJobs(prev => { const u = [...prev]; u[index] = updatedJob; return u; });
          setExpandedFreelance(null);
        } else {
          setEmployeeJobs(prev => { const u = [...prev]; u[index] = updatedJob; return u; });
          setExpandedEmployee(null);
        }
        setToast({ type: 'success', message: 'Experiencia guardada correctamente' });
      } else {
        const errorData = await response.json();
        setToast({ type: 'error', message: errorData.error || 'Error al guardar' });
      }
    } catch {
      setToast({ type: 'error', message: 'Error de conexión al guardar' });
    } finally {
      setSavingWorkIds(prev => { const s = new Set(prev); s.delete(key); return s; });
    }
  };

  const handleSaveEducation = async (edu, index) => {
    if (!cv?.id) { setToast({ type: 'error', message: 'Error: CV no inicializado' }); return; }
    if (!edu.institution?.trim() && !edu.degree?.trim()) {
      setToast({ type: 'error', message: 'Debe ingresar al menos la institución o el título' }); return;
    }

    const key = getEduKey(edu, index);
    setSavingEducationIds(prev => new Set(prev).add(key));
    try {
      const token = localStorage.getItem('authToken');
      const payload = {
        id: edu.id || null,
        institution: edu.institution || '',
        degree: edu.degree || '',
        startDate: edu.startDate || null,
        endDate: edu.endDate || null,
        currentlyStudying: edu.currentlyStudying || false,
        description: edu.description || ''
      };

      const response = await fetch(`${BACKEND_URL}/api/cv/${cv.id}/education`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setToast({ type: 'success', message: 'Ítem guardado correctamente' });
        await loadCV();
        setExpandedEducation(null);
      } else {
        const errorData = await response.json();
        setToast({ type: 'error', message: errorData.error || 'Error al guardar' });
      }
    } catch {
      setToast({ type: 'error', message: 'Error de conexión al guardar' });
    } finally {
      setSavingEducationIds(prev => { const s = new Set(prev); s.delete(key); return s; });
    }
  };

  const handleDeleteWorkExperience = async (job, isFreelance, index) => {
    if (!job.workHistoryId) {
      if (isFreelance) removeFreelanceJob(index);
      else removeEmployeeJob(index);
      return;
    }
    const id = job.workHistoryId;
    setDeletingWorkIds(prev => new Set(prev).add(id));
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/cv/${cv.id}/work-experience/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setToast({ type: 'success', message: 'Trabajo eliminado correctamente' });
        await loadCV();
        if (isFreelance) setExpandedFreelance(null);
        else setExpandedEmployee(null);
      } else {
        const e = await response.json();
        setToast({ type: 'error', message: e.error || 'Error al eliminar' });
      }
    } catch {
      setToast({ type: 'error', message: 'Error de conexión al eliminar' });
    } finally {
      setDeletingWorkIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  const handleDeleteEducation = async (edu, index) => {
    if (!edu.id) { removeEducation(index); return; }
    const id = edu.id;
    setDeletingEducationIds(prev => new Set(prev).add(id));
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/cv/${cv.id}/education/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setToast({ type: 'success', message: 'Ítem eliminado correctamente' });
        await loadCV();
        setExpandedEducation(null);
      } else {
        const e = await response.json();
        setToast({ type: 'error', message: e.error || 'Error al eliminar' });
      }
    } catch {
      setToast({ type: 'error', message: 'Error de conexión al eliminar' });
    } finally {
      setDeletingEducationIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  const handleSave = async () => {
    if (!cv?.id) { setToast({ type: 'error', message: 'Error: CV no inicializado' }); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/cv/${cv.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ description, skills: skills.join(',') })
      });
      if (response.ok) {
        setToast({ type: 'success', message: 'CV actualizado correctamente' });
        setTimeout(() => navigate('/cv-view'), 1000);
      } else {
        const e = await response.json();
        setToast({ type: 'error', message: e.error || e.message || 'Error al guardar CV' });
      }
    } catch {
      setToast({ type: 'error', message: 'Error de conexión al guardar CV' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfession = async () => {
    if (!professionType) {
      setToast({ type: 'error', message: 'Por favor seleccioná tu tipo de profesión' });
      return;
    }
    setSavingProfession(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ professionalTitle, professionType })
      });
      if (response.ok) {
        const updatedData = await response.json();
        setProfessionType(updatedData.professionType || '');
        setProfessionalTitle(updatedData.professionalTitle || '');
        const stored = JSON.parse(localStorage.getItem('professional') || '{}');
        localStorage.setItem('professional', JSON.stringify({ ...stored, professionType: updatedData.professionType, professionalTitle: updatedData.professionalTitle }));
        setToast({ type: 'success', message: 'Información profesional guardada' });
      } else {
        const e = await response.json();
        setToast({ type: 'error', message: e.error || 'Error al guardar' });
      }
    } catch {
      setToast({ type: 'error', message: 'Error de conexión' });
    } finally {
      setSavingProfession(false);
    }
  };

  const addFreelanceJob = () => {
    setFreelanceJobs(prev => [...prev, { company: '', position: '', startDate: '', endDate: '', currentlyWorking: false, isFreelance: true, description: '', referenceName: '', referencePhone: '', hasRatings: false, totalRatings: 0 }]);
    setExpandedFreelance(freelanceJobs.length);
  };

  const updateFreelanceJob = (index, field, value) => {
    setFreelanceJobs(prev => {
      const updated = [...prev];
      if (field === 'currentlyWorking' && value === true) {
        if (countActiveJobs() >= 3 && !updated[index].currentlyWorking) {
          setToast({ type: 'warning', message: 'Ya tenés 3 trabajos activos. Desactivá uno para agregar otro.' });
          return prev;
        }
        updated[index] = { ...updated[index], currentlyWorking: true, endDate: '' };
        return updated;
      }
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const confirmDeleteFreelanceJob = (index) =>
    setDeleteModal({ type: 'freelance', index, title: '¿Eliminar trabajo autónomo?', message: 'Esta acción no se puede deshacer.' });

  const removeFreelanceJob = (index) => {
    setFreelanceJobs(prev => prev.filter((_, i) => i !== index));
    setDeleteModal(null);
    setExpandedFreelance(null);
  };

  const addEmployeeJob = () => {
    setEmployeeJobs(prev => [...prev, { company: '', position: '', startDate: '', endDate: '', currentlyWorking: false, isFreelance: false, description: '', referenceName: '', referencePhone: '', hasRatings: false, totalRatings: 0 }]);
    setExpandedEmployee(employeeJobs.length);
  };

  const updateEmployeeJob = (index, field, value) => {
    setEmployeeJobs(prev => {
      const updated = [...prev];
      if (field === 'currentlyWorking' && value === true) {
        if (countActiveJobs() >= 3 && !updated[index].currentlyWorking) {
          setToast({ type: 'warning', message: 'Ya tenés 3 trabajos activos. Desactivá uno para agregar otro.' });
          return prev;
        }
        updated[index] = { ...updated[index], currentlyWorking: true, endDate: '' };
        return updated;
      }
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const confirmDeleteEmployeeJob = (index) =>
    setDeleteModal({ type: 'employee', index, title: '¿Eliminar trabajo?', message: 'Esta acción no se puede deshacer.' });

  const removeEmployeeJob = (index) => {
    setEmployeeJobs(prev => prev.filter((_, i) => i !== index));
    setDeleteModal(null);
    setExpandedEmployee(null);
  };

  const addEducation = () => {
    setEducation(prev => [...prev, { institution: '', degree: '', startDate: '', endDate: '', currentlyStudying: false, description: '' }]);
    setExpandedEducation(education.length);
  };

  const updateEducation = (index, field, value) => {
    setEducation(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === 'currentlyStudying' && value === true) updated[index].endDate = '';
      return updated;
    });
  };

  const confirmDeleteEducation = (index) =>
    setDeleteModal({ type: 'education', index, title: '¿Eliminar ítem?', message: 'Esta acción no se puede deshacer.' });

  const removeEducation = (index) => {
    setEducation(prev => prev.filter((_, i) => i !== index));
    setDeleteModal(null);
    setExpandedEducation(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteModal) return;
    const { type, index } = deleteModal;
    if (type === 'freelance') handleDeleteWorkExperience(freelanceJobs[index], true, index);
    else if (type === 'employee') handleDeleteWorkExperience(employeeJobs[index], false, index);
    else if (type === 'education') handleDeleteEducation(education[index], index);
    setDeleteModal(null);
  };

  const renderWorkForm = (job, index, isFreelance) => {
    const key = getWorkKey(job, index, isFreelance ? 'fl' : 'emp');
    const isSaving = savingWorkIds.has(key);
    const isDeleting = job.workHistoryId ? deletingWorkIds.has(job.workHistoryId) : false;
    const expanded = isFreelance ? expandedFreelance : expandedEmployee;
    const setExpanded = isFreelance ? setExpandedFreelance : setExpandedEmployee;
    const updateJob = isFreelance ? updateFreelanceJob : updateEmployeeJob;
    const confirmDelete = isFreelance ? confirmDeleteFreelanceJob : confirmDeleteEmployeeJob;

    return (
      <div key={`${isFreelance ? 'fl' : 'emp'}-${index}`} className="border-2 border-gray-200 rounded-xl overflow-hidden">
        <div onClick={() => setExpanded(expanded === index ? null : index)} className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            {expanded === index ? <ChevronDown className="w-5 h-5 text-purple-600" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
            <div>
              <p className="font-semibold text-gray-800 text-base">{job.position || 'Sin título'} {job.company && `- ${job.company}`}</p>
              <p className="text-sm text-gray-500">
                {job.currentlyWorking ? 'Actual' : job.endDate ? 'Finalizado' : 'Sin fechas'}
                {job.hasRatings && ` • ${job.totalRatings} calificación${job.totalRatings !== 1 ? 'es' : ''}`}
              </p>
            </div>
          </div>
        </div>

        {expanded === index && (
          <div className="p-4 pt-0 border-t border-gray-100">
            {job.hasRatings && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3 flex items-start gap-2">
                <Lock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-orange-800 mb-1">Campos bloqueados</p>
                  <p className="text-orange-700">Este trabajo ya tiene calificaciones asociadas. El puesto y la empresa no se pueden modificar.</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <input type="text" placeholder={isFreelance ? "Título profesional" : "Empresa"} value={isFreelance ? job.position : job.company}
                onChange={(e) => updateJob(index, isFreelance ? 'position' : 'company', e.target.value)}
                disabled={job.hasRatings} className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed text-base" />
              <input type="text" placeholder={isFreelance ? "Autónomo" : "Puesto"} value={isFreelance ? job.company : job.position}
                onChange={(e) => updateJob(index, isFreelance ? 'company' : 'position', e.target.value)}
                disabled={job.hasRatings} className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed text-base" />
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">Fecha de inicio</label>
                <input type="date" value={job.startDate} onChange={(e) => updateJob(index, 'startDate', e.target.value)} max={new Date().toISOString().split('T')[0]} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none text-base" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-600 ml-1">Fecha de finalización</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={job.currentlyWorking}
                      onChange={(e) => updateJob(index, 'currentlyWorking', e.target.checked)}
                      disabled={countActiveJobs() >= 3 && !job.currentlyWorking}
                      className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 rounded-full relative transition-colors duration-200 peer-checked:bg-purple-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                    <span className="text-sm text-gray-500 peer-disabled:opacity-50">Aún trabajo aquí</span>
                  </label>
                </div>
                {job.currentlyWorking ? (
                  <div className="w-full border-2 border-purple-200 bg-purple-50 rounded-xl px-3 py-2 text-purple-700 font-medium text-base">
                    Sin finalizar
                  </div>
                ) : (
                  <input type="date" value={job.endDate} onChange={(e) => updateJob(index, 'endDate', e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none text-base" />
                )}
              </div>
            </div>
            <textarea placeholder="Descripción" value={job.description} onChange={(e) => updateJob(index, 'description', e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 mb-3 focus:border-purple-500 focus:outline-none text-base" rows="3" />
            {!isFreelance && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <input type="text" placeholder={job.company ? `Nombre de referencia en ${job.company} (opcional)` : 'Nombre de referencia (opcional)'} value={job.referenceName} onChange={(e) => updateJob(index, 'referenceName', e.target.value)} className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none text-base" />
                <input type="tel" placeholder={job.company ? `Teléfono de referencia en ${job.company} (opcional)` : 'Teléfono de referencia (opcional)'} value={job.referencePhone} onChange={(e) => updateJob(index, 'referencePhone', e.target.value)} className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none text-base" />
              </div>
            )}
            <button onClick={() => handleSaveWorkExperience(job, isFreelance, index)} disabled={isSaving}
              className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50 hover:scale-105 transition-all flex items-center justify-center mb-2 text-base">
              {isSaving ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Guardando...</> : <><Save className="w-5 h-5 mr-2" />Guardar trabajo</>}
            </button>
            <button onClick={() => confirmDelete(index)} disabled={isDeleting}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50 hover:scale-105 transition-all flex items-center justify-center text-base">
              {isDeleting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Eliminando...</> : <><Trash2 className="w-5 h-5 mr-2" />Eliminar trabajo</>}
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn pb-24">
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 pt-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <BackButton to="/cv-view" />
          <div className="text-center">
            <h1 className="text-3xl roboto-light text-white mb-2 mt-2 animate-slideUp">Editar CV</h1>
            <p className="text-white/90 text-lg animate-slideUp delay-100">Agregá tu experiencia laboral y educativa</p>
            <button
              onClick={() => setShowFaq(true)}
              className="mt-3 text-white/80 hover:text-white text-sm underline underline-offset-2 transition-colors"
            >
              ¿Tenés dudas? Ver preguntas frecuentes
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 pb-8">

        {/* SOBRE MÍ */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp">
          <h2 className="text-2xl roboto-light text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">👤</span>Sobre mí
          </h2>
          <textarea placeholder="Escribí una breve descripción sobre vos, tus habilidades y experiencia..."
            value={description} onChange={(e) => setDescription(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:outline-none text-base" rows="4" />
        </div>

        {/* APTITUDES / HABILIDADES */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp">
          <h2 className="text-2xl roboto-light text-gray-800 mb-1 flex items-center">
            <span className="text-2xl mr-2">🏷️</span>Aptitudes y habilidades
          </h2>
          <p className="text-sm text-gray-500 mb-4">Agregá tus habilidades como etiquetas. Se mostrarán en tu CV.</p>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
                  e.preventDefault();
                  const tag = skillInput.trim().replace(/,$/, '');
                  if (tag && !skills.includes(tag)) setSkills(prev => [...prev, tag]);
                  setSkillInput('');
                }
              }}
              placeholder="Ej: Excel, Inglés B2, Liderazgo..."
              className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none text-base"
              maxLength={50}
            />
            <button
              type="button"
              onClick={() => {
                const tag = skillInput.trim().replace(/,$/, '');
                if (tag && !skills.includes(tag)) setSkills(prev => [...prev, tag]);
                setSkillInput('');
              }}
              disabled={!skillInput.trim()}
              className="bg-purple-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-purple-700 transition-all disabled:opacity-40 text-base"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {skills.length === 0
            ? <p className="text-gray-400 text-sm text-center py-2">No hay aptitudes agregadas</p>
            : (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 text-purple-800 text-sm font-medium px-3 py-1.5 rounded-full">
                    <span>{skill}</span>
                    <button type="button" onClick={() => setSkills(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-purple-400 hover:text-red-500 transition-colors text-base leading-none">×</button>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* INFORMACIÓN PROFESIONAL */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp">
          <h2 className="text-2xl roboto-light text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">💼</span>Información profesional
          </h2>
          <div className="mb-4">
            <ProfessionSelector
              value={professionType}
              onChange={(val) => setProfessionType(val)}
              required
              focusColor="purple"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2 flex items-center text-base">
              <Award className="w-5 h-5 mr-2 text-purple-600" />Título Profesional
            </label>
            <input
              type="text"
              value={professionalTitle}
              onChange={(e) => setProfessionalTitle(e.target.value)}
              placeholder="Ej: Mesero Senior, Electricista Matriculado..."
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-purple-500 focus:outline-none transition-all text-base"
              maxLength="100"
            />
          </div>
          <button onClick={handleSaveProfession} disabled={savingProfession}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-2xl shadow-lg disabled:opacity-50 hover:scale-105 transition-all flex items-center justify-center text-base">
            {savingProfession ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Guardando...</> : <><Save className="w-5 h-5 mr-2" />Guardar información profesional</>}
          </button>
        </div>

        {/* ZONAS DE TRABAJO */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp">
          <h2 className="text-2xl roboto-light text-gray-800 mb-2 flex items-center">
            <span className="text-2xl mr-2">📍</span>Zonas de trabajo
          </h2>
          <p className="text-sm text-gray-500 mb-4">Indicá en qué zonas ofrecés tus servicios. Podés agregar más de una.</p>

          <div className="mb-3">
            <label className="block text-gray-700 font-semibold mb-2 text-sm">Provincia</label>
            <select value={zonaProvinciaId} onChange={(e) => {
              const id = e.target.value;
              const prov = provincias.find(p => p.id === id);
              setZonaProvinciaId(id);
              setZonaProvincia(prov?.nombre || '');
              setZonaSeleccionada('');
              fetchSegundoNivel(id);
            }} disabled={loadingProvincias}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none text-base disabled:opacity-50">
              <option value="">{loadingProvincias ? 'Cargando...' : 'Seleccioná una provincia'}</option>
              {provincias.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          {zonaProvinciaId && (
            <div className="mb-3">
              <label className="block text-gray-700 font-semibold mb-2 text-sm">{getSegundoNivelLabel(zonaProvinciaId)}</label>
              <SearchableSelect
                options={
                  zonaProvinciaId === CABA_ID
                    ? [{ nombre: 'Todos los barrios' }, ...segundoNivel]
                    : segundoNivel
                }
                value={zonaSeleccionada}
                onChange={setZonaSeleccionada}
                placeholder={`Seleccioná un ${getSegundoNivelLabel(zonaProvinciaId).toLowerCase()}`}
                searchPlaceholder={`Buscar ${getSegundoNivelLabel(zonaProvinciaId).toLowerCase()}...`}
                loading={loadingSegundoNivel}
                focusColor="purple"
              />
            </div>
          )}

          <button type="button" onClick={handleAddZone} disabled={savingZone || !zonaProvinciaId || !zonaSeleccionada}
            className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50 hover:scale-105 transition-all flex items-center justify-center mb-4 text-base">
            {savingZone ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Agregando...</> : <><Plus className="w-5 h-5 mr-2" />Agregar zona</>}
          </button>

          {zones.length === 0
            ? <p className="text-gray-400 text-sm text-center py-2">No hay zonas de trabajo agregadas</p>
            : (
              <div className="flex flex-wrap gap-2">
                {zones.map(zone => (
                  <div key={zone.id} className="flex items-center gap-2 bg-purple-50 border border-purple-200 text-purple-800 text-sm font-medium px-3 py-1.5 rounded-full">
                    <span>{zone.zona}, {zone.provincia}</span>
                    <button type="button" onClick={() => handleDeleteZone(zone.id)} disabled={deletingZoneId === zone.id}
                      className="text-purple-400 hover:text-red-500 transition-colors">
                      {deletingZoneId === zone.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <span className="text-base leading-none">×</span>}
                    </button>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* BANNERS */}
        {countActiveJobs() === 0 && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 shadow-lg mb-4 animate-slideUp">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base roboto-light text-orange-900 mb-1">⚠️ No podés recibir calificaciones todavía</h3>
                <p className="text-sm text-orange-800">Para que los clientes puedan calificarte, necesitás tener al menos un trabajo activo en tu CV. Agregalo desde Mi CV → Editar CV</p>
              </div>
            </div>
          </div>
        )}
        {countActiveJobs() >= 3 && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 shadow-lg mb-4 animate-slideUp">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base roboto-light text-blue-900 mb-1">ℹ️ Límite de trabajos activos alcanzado</h3>
                <p className="text-sm text-blue-800">Ya tenés 3 trabajos activos. Desactivá uno para agregar otro.</p>
              </div>
            </div>
          </div>
        )}

        {/* TRABAJO AUTÓNOMO */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl roboto-light text-gray-800 flex items-center">
              <span className="text-2xl mr-2">💼</span>Trabajo Autónomo / Freelance
            </h2>
            <button onClick={addFreelanceJob} className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-all hover:scale-110">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {freelanceJobs.length === 0
            ? <p className="text-gray-500 text-center py-4">No hay trabajos autónomos agregados</p>
            : <div className="space-y-2">{freelanceJobs.map((job, index) => renderWorkForm(job, index, true))}</div>
          }
        </div>

        {/* TRABAJO EN RELACIÓN DE DEPENDENCIA */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl roboto-light text-gray-800 flex items-center">
              <span className="text-2xl mr-2">🏢</span>Trabajo en Relación de Dependencia
            </h2>
            <button onClick={addEmployeeJob} className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-all hover:scale-110">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {employeeJobs.length === 0
            ? <p className="text-gray-500 text-center py-4">No hay trabajos en relación de dependencia agregados</p>
            : <div className="space-y-2">{employeeJobs.map((job, index) => renderWorkForm(job, index, false))}</div>
          }
        </div>

        {/* EDUCACIÓN */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-slideUp delay-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl roboto-light text-gray-800 flex items-center">
              <GraduationCap className="w-6 h-6 mr-2 text-purple-600" />Educación y capacitaciones
            </h2>
            <button onClick={addEducation} className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-all hover:scale-110">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {education.length === 0
            ? <p className="text-gray-500 text-center py-4">No hay experiencia educativa agregada</p>
            : (
              <div className="space-y-2">
                {education.map((edu, index) => {
                  const key = getEduKey(edu, index);
                  const isSaving = savingEducationIds.has(key);
                  const isDeleting = edu.id ? deletingEducationIds.has(edu.id) : false;
                  return (
                    <div key={`edu-${index}`} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                      <div onClick={() => setExpandedEducation(expandedEducation === index ? null : index)} className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          {expandedEducation === index ? <ChevronDown className="w-5 h-5 text-purple-600" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                          <div>
                            <p className="font-semibold text-gray-800 text-base">{edu.degree || 'Sin título'} {edu.institution && `- ${edu.institution}`}</p>
                            <p className="text-sm text-gray-500">{edu.currentlyStudying ? 'En curso' : edu.endDate ? 'Finalizado' : 'Sin fechas'}</p>
                          </div>
                        </div>
                      </div>
                      {expandedEducation === index && (
                        <div className="p-4 pt-0 border-t border-gray-100">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <input type="text" placeholder="Institución" value={edu.institution} onChange={(e) => updateEducation(index, 'institution', e.target.value)} className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none text-base" />
                            <input type="text" placeholder="Título/Grado" value={edu.degree} onChange={(e) => updateEducation(index, 'degree', e.target.value)} className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none text-base" />
                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">Fecha de inicio</label>
                              <input type="date" value={edu.startDate} onChange={(e) => updateEducation(index, 'startDate', e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none text-base" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">Fecha de finalización</label>
                              <input type="date" value={edu.endDate} onChange={(e) => updateEducation(index, 'endDate', e.target.value)} disabled={edu.currentlyStudying} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed text-base" />
                            </div>
                          </div>
                          <div className="mb-3">
                            <label className="flex items-center cursor-pointer">
                              <input type="checkbox" checked={edu.currentlyStudying} onChange={(e) => updateEducation(index, 'currentlyStudying', e.target.checked)} className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                              <span className="ml-2 text-base text-gray-700">Actualmente estudio aquí</span>
                            </label>
                          </div>
                          <textarea placeholder="Descripción" value={edu.description} onChange={(e) => updateEducation(index, 'description', e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 mb-3 focus:border-purple-500 focus:outline-none text-base" rows="2" />
                          <button onClick={() => handleSaveEducation(edu, index)} disabled={isSaving}
                            className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50 hover:scale-105 transition-all flex items-center justify-center mb-2 text-base">
                            {isSaving ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Guardando...</> : <><Save className="w-5 h-5 mr-2" />Guardar ítem</>}
                          </button>
                          <button onClick={() => confirmDeleteEducation(index)} disabled={isDeleting}
                            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50 hover:scale-105 transition-all flex items-center justify-center text-base">
                            {isDeleting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Eliminando...</> : <><Trash2 className="w-5 h-5 mr-2" />Eliminar ítem</>}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
        </div>

        {/* GUARDAR TODO */}
        <button onClick={handleSave} disabled={saving}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-50 hover:scale-105 transition-all flex items-center justify-center mb-4 text-lg">
          {saving ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Guardando...</> : <><Save className="w-5 h-5 mr-2" />Confirmar y guardar todo el CV</>}
        </button>
      </div>

      <HomeButton />

      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 animate-scaleIn">
            <h2 className="text-2xl roboto-light text-gray-800 mb-4">{deleteModal.title}</h2>
            <p className="text-gray-600 mb-6 text-base">{deleteModal.message}</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteModal(null)} className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-2xl hover:bg-gray-300 transition-all text-base">Cancelar</button>
              <button onClick={handleConfirmDelete} className="flex-1 bg-red-500 text-white font-bold py-3 rounded-2xl hover:bg-red-600 transition-all text-base">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showFaq && <ProfessionalFaqModal onClose={() => setShowFaq(false)} />}
    </div>
  );
}

export default EditCV;