// src/components/ProfilePictureUpload.jsx
import { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { BACKEND_URL } from '../config';

function ProfilePictureUpload({ currentPhoto, userName, onUploadSuccess }) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentPhoto || null);
    const [error, setError] = useState(null);

    const handleFileChange = async (e) => {
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
        setUploading(true);

        const localPreview = URL.createObjectURL(file);
        setPreview(localPreview);

        try {
            const token = localStorage.getItem('authToken');
            console.log('🔑 Token:', token ? token.substring(0, 30) + '...' : 'NULL');

            // Paso 1: Firma
            const signResponse = await fetch(`${BACKEND_URL}/api/users/photo/sign`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('📝 Sign status:', signResponse.status);
            if (!signResponse.ok) throw new Error(`Error firma: ${signResponse.status}`);
            const signData = await signResponse.json();
            console.log('📝 Sign data:', signData);

            // Paso 2: Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', signData.api_key);
            formData.append('timestamp', signData.timestamp);
            formData.append('signature', signData.signature);
            formData.append('public_id', signData.public_id);
            formData.append('folder', signData.folder);
            formData.append('overwrite', 'true');

            console.log('☁️ Subiendo a Cloudinary:', signData.upload_url);
            const cloudinaryResponse = await fetch(signData.upload_url, {
                method: 'POST',
                body: formData
            });
            console.log('☁️ Cloudinary status:', cloudinaryResponse.status);
            if (!cloudinaryResponse.ok) throw new Error(`Error Cloudinary: ${cloudinaryResponse.status}`);
            const cloudinaryData = await cloudinaryResponse.json();
            console.log('☁️ Cloudinary data:', cloudinaryData);
            console.log('☁️ public_id recibido:', cloudinaryData.public_id);
            console.log('☁️ secure_url recibido:', cloudinaryData.secure_url);

            // Paso 3: Confirmar al backend
            const confirmBody = { publicId: cloudinaryData.public_id };
            console.log('✅ Confirmando al backend:', confirmBody);
            const confirmResponse = await fetch(`${BACKEND_URL}/api/users/photo`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(confirmBody)
            });
            console.log('✅ Confirm status:', confirmResponse.status);
            const confirmData = await confirmResponse.json();
            console.log('✅ Confirm response body:', confirmData);
            if (!confirmResponse.ok) throw new Error(`Error confirmar: ${confirmResponse.status} - ${JSON.stringify(confirmData)}`);

            // Paso 4: Obtener perfil actualizado
            const userType = localStorage.getItem('userType');
            console.log('👤 userType en localStorage:', userType);
            const meEndpoint = userType === 'PROFESSIONAL'
                ? `${BACKEND_URL}/api/auth/me`
                : `${BACKEND_URL}/api/auth/me/client`;
            console.log('👤 Llamando a:', meEndpoint);

            const meResponse = await fetch(meEndpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('👤 Me status:', meResponse.status);
            const userData = await meResponse.json();
            console.log('👤 Me data:', userData);
            console.log('🖼️ profilePicture en respuesta:', userData.profilePicture);

            if (!meResponse.ok) throw new Error(`Error perfil: ${meResponse.status}`);

            onUploadSuccess(userData.profilePicture);
            console.log('🎉 onUploadSuccess llamado con:', userData.profilePicture);

        } catch (err) {
            console.error('❌ Error en upload:', err);
            setError(err.message || 'Error al subir la foto');
            setPreview(currentPhoto || null);
        } finally {
            setUploading(false);
        }
    };

    const initials = userName
        ? userName.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    return (
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
    );
}

export default ProfilePictureUpload;