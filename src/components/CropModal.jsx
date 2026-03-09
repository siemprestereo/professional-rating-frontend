import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/getCroppedImg';

function CropModal({ imageSrc, onConfirm, onCancel }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [processing, setProcessing] = useState(false);

    const onCropComplete = useCallback((_, croppedPixels) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleConfirm = async () => {
        setProcessing(true);
        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            onConfirm(croppedBlob);
        } catch (err) {
            console.error('Error al recortar:', err);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-white rounded-2xl w-[90vw] max-w-sm overflow-hidden shadow-2xl">
                <div className="p-4 border-b">
                    <h3 className="text-center font-semibold text-gray-800">Ajustá tu foto</h3>
                    <p className="text-center text-xs text-gray-500 mt-1">
                        Mové y hacé zoom para centrar tu cara
                    </p>
                </div>

                {/* Área de crop */}
                <div className="relative w-full h-72 bg-gray-900">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>

                {/* Zoom slider */}
                <div className="px-6 py-3">
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.01}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full accent-teal-500"
                    />
                </div>

                {/* Botones */}
                <div className="flex gap-3 px-4 pb-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={processing}
                        className="flex-1 py-3 rounded-xl bg-teal-500 text-white font-medium hover:bg-teal-600 transition-colors disabled:opacity-50"
                    >
                        {processing ? 'Procesando...' : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CropModal;