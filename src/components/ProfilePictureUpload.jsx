import { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { BACKEND_URL } from '../config';
import CropModal from './CropModal';

function ProfilePictureUpload({ currentPhoto, userName, onUploadSuccess }) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentPhoto || null);
    const [error, setError] = useState(null);
    const [cropSrc, setCropSrc] = useState(null); // imagen original para el modal

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError('Solo se permiten imágenes JPG, PNG o WEBP');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('La imagen no puede superar los 5MB');
            return;
        }

        setError(null);

        // Abrir modal de crop con la imagen original
        const localUrl = URL.createObjectURL(file);
        setCropSrc(localUrl);
    };

    const handleCropConfirm = async (croppedBlob) => {
        setCropSrc(null);
        setUploading(true);

        // Mostrar preview local inmediatamente
        const localPreview = URL.createObjectURL(croppedBlob);
        setPreview(localPreview);

        try {
            const token = localStorage.getItem('authToken');

            // Paso 1: Firma
            const signResponse = await fetch(`${BACKEND_URL}/api/users/photo/sign`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!signResponse.ok) throw new Error(`Error al obtener firma: ${signResponse.status}`);
            const signData = await signResponse.json();

            // Paso 2: Subir blob recortado a Cloudinary
            const formData = new FormData();
            formData.append('file', croppedBlob, 'avatar.jpg');
            formData.append('api_key', signData.api_key);
            formData.append('timestamp', signData.timestamp);
            formData.append('signature', signData.signature);
            formData.append('public_id', signData.public_id);
            formData.append('overwrite', 'true');

            const cloudinaryResponse = await fetch(signData.upload_url, {
                method: 'POST',
                body: formData
            });
            if (!cloudinaryResponse.ok) throw new Error(`Error al subir imagen: ${cloudinaryResponse.status}`);
            const cloudinaryData = await cloudinaryResponse.json();

            // Paso 3: Confirmar al backend
            const confirmResponse = await fetch(`${BACKEND_URL}/api/users/photo`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ publicId: cloudinaryData.public_id })
            });

            const confirmData = await confirmResponse.json();
            if (!confirmResponse.ok) throw new Error(`Error al confirmar foto: ${confirmData.error || confirmResponse.status}`);

            const profilePicture = confirmData.profilePicture;
            if (!profilePicture) throw new Error('El backend no devolvió la URL de la foto');

            onUploadSuccess(`${profilePicture}?t=${Date.now()}`);

        } catch (err) {
            console.error('❌ Error en upload:', err);
            setError(err.message || 'Error al subir la foto');
            setPreview(currentPhoto || null);
        } finally {
            setUploading(false);
        }
    };

    const handleCropCancel = () => {
        setCropSrc(null);
    };

    const initials = userName
        ? userName.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    return (
        <>
            {cropSrc && (
                <CropModal
                    imageSrc={cropSrc}
                    onConfirm={handleCropConfirm}
                    onCancel={handleCropCancel}
                />
            )}

            <div className="flex flex-col items-center">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-lg border-4 border-white">
                        {preview ? (
                            <img
                                src={preview}
                                alt="Foto de perfil"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-3xl font-bold text-teal-600">{initials}</span>
                        )}
                    </div>

                    <label className={`absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shadow-md transition-all
                        ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600'}`}>
                        {uploading
                            ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                            : <Camera className="w-4 h-4 text-white" />
                        }
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                    </label>
                </div>

                {error && (
                    <p className="text-red-500 text-xs mt-2 text-center">{error}</p>
                )}

                {uploading && (
                    <p className="text-white/80 text-xs mt-2">Subiendo foto...</p>
                )}
            </div>
        </>
    );
}

export default ProfilePictureUpload;