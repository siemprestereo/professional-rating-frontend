import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RatingDetailModal from '../components/RatingDetailModal';
import BackButton from '../components/BackButton';
import HomeButton from '../components/HomeButton';
import { BACKEND_URL } from '../config';
import { Star, Loader2 } from 'lucide-react';

function RatingsHistory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workHistoryIdFilter = searchParams.get('workHistoryId');

  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState(null);

  const headerData = useMemo(() => {
    if (!workHistoryIdFilter || ratings.length === 0) return null;
    return {
      position: ratings[0].workplacePosition,
      businessName: ratings[0].businessName || ratings[0].workplaceName,
    };
  }, [ratings, workHistoryIdFilter]);

  useEffect(() => {
    loadRatings();
  }, [workHistoryIdFilter]);

  const loadRatings = async () => {
    const token = localStorage.getItem('authToken');

    if (workHistoryIdFilter) {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/ratings/work-history/${workHistoryIdFilter}`,
          { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }
        );
        if (response.ok) {
          setRatings(await response.json());
        } else {
          throw new Error('Error al cargar calificaciones');
        }
      } catch (error) {
        console.error('Error loading public ratings:', error);
        setRatings([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!token) { navigate('/professional-login'); return; }

    try {
      const raw = localStorage.getItem('professional');
      if (!raw) { navigate('/professional-login'); return; }

      let professional;
      try {
        professional = JSON.parse(raw);
      } catch {
        localStorage.removeItem('professional');
        navigate('/professional-login');
        return;
      }

      const response = await fetch(
        `${BACKEND_URL}/api/ratings/professional/${professional.id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        setRatings(await response.json());
      } else {
        throw new Error('Error al cargar calificaciones');
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
      setRatings([]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (score) =>
    [...Array(5)].map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
    ));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 animate-fadeIn">
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 py-6">
        <div className="flex items-center gap-3">
          <BackButton />
          <div className="flex-1">
            {workHistoryIdFilter && headerData ? (
              <>
                <p className="text-xs text-white/80 font-semibold uppercase tracking-wide mb-1">Calificaciones</p>
                <p className="text-2xl font-bold text-white">{headerData.position}</p>
                <p className="text-base text-white/90">{headerData.businessName}</p>
                <p className="text-sm text-white/80 font-semibold mt-1">
                  {ratings.length} {ratings.length === 1 ? 'calificación' : 'calificaciones'}
                </p>
              </>
            ) : (
              <>
                <p className="text-xs text-white/80 font-semibold uppercase tracking-wide mb-1">Historial</p>
                <p className="text-2xl roboto-light text-white">Calificaciones</p>
                <p className="text-sm text-white/80 font-semibold mt-1">
                  {ratings.length} {ratings.length === 1 ? 'calificación' : 'calificaciones'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {ratings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center animate-slideUp">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {workHistoryIdFilter ? 'Sin calificaciones aún' : 'Sin calificaciones'}
            </h3>
            <p className="text-gray-500">
              {workHistoryIdFilter ? 'No hay calificaciones para este trabajo' : 'Aún no tenés calificaciones'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {ratings.map((rating, index) => (
              <div
                key={rating.id}
                onClick={() => setSelectedRating(rating)}
                className="bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all cursor-pointer animate-slideUp"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">{renderStars(rating.score)}</div>
                  <span className="text-xs text-gray-500">
                    {new Date(rating.createdAt).toLocaleDateString('es-AR')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 break-words">
                      {rating.clientName?.trim() || 'Anónimo'}
                    </p>
                    {!workHistoryIdFilter && (
                      <p className="text-xs text-gray-500 break-words">
                        {rating.businessName} • {rating.workplacePosition}
                      </p>
                    )}
                  </div>
                  {rating.comment && (
                    <span className="text-xs text-purple-600 font-semibold ml-2 flex-shrink-0">Ver más →</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <HomeButton />

      {selectedRating && (
        <RatingDetailModal
          rating={selectedRating}
          onClose={() => setSelectedRating(null)}
          renderStars={renderStars}
          canReport={!workHistoryIdFilter}
        />
      )}
    </div>
  );
}

export default RatingsHistory;