#!/bin/bash

echo "🎨 Actualizando UI..."

# Lista de archivos a modificar
FILES=(
  "src/pages/MyProfile.jsx"
  "src/pages/EditProfileProfessional.jsx"
  "src/pages/EditProfile.jsx"
  "src/pages/EditCV.jsx"
  "src/pages/Stats.jsx"
  "src/pages/ProfessionalDashboard.jsx"
  "src/pages/ClientDashboard.jsx"
)

# Paso 1: Agregar import de Home icon si no existe
echo "📦 Agregando imports de Home..."
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    # Verificar si ya tiene Home en los imports
    if ! grep -q "Home" "$file"; then
      # Agregar Home al import de lucide-react
      sed -i '' "s/} from 'lucide-react';/, Home } from 'lucide-react';/g" "$file"
    fi
  fi
done

# Paso 2: Cambiar textos "Cargando..." a font-light
echo "✏️ Cambiando font weight a light..."
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    sed -i '' 's/text-white text-xl">Cargando/text-white text-xl font-light">Cargando/g' "$file"
    sed -i '' 's/text-white text-xl">Cargando perfil/text-white text-xl font-light">Cargando perfil/g' "$file"
  fi
done

echo "✅ Cambios completados"
