
import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Image as ImageIcon, Check } from 'lucide-react';
import { dataManager } from '../services/dataManager';
import { StoredImage } from '../types';

interface MediaLibraryProps {
  onSelect?: (url: string) => void;
  selectionMode?: boolean;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({ onSelect, selectionMode = false }) => {
  const [images, setImages] = useState<StoredImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    const imgs = await dataManager.getImages();
    setImages(imgs);
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; // Limit width to save space
          const scaleSize = MAX_WIDTH / img.width;
          
          let width = img.width;
          let height = img.height;

          if (scaleSize < 1) {
             width = MAX_WIDTH;
             height = img.height * scaleSize;
          }

          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const file = files[0];
      const base64 = await compressImage(file);
      
      const newImage: StoredImage = {
        id: Date.now().toString(),
        name: file.name,
        data: base64,
        date: new Date().toISOString()
      };

      await dataManager.saveImage(newImage);
      loadImages();
    } catch (error) {
      console.error("Upload failed", error);
      alert("Ошибка при загрузке изображения");
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Удалить изображение?')) {
      await dataManager.deleteImage(id);
      loadImages();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-900">Медиабиблиотека</h3>
        <label className={`cursor-pointer flex items-center gap-2 px-4 py-2 bg-brand-yellow text-brand-dark font-bold rounded-lg hover:bg-brand-orange transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <Upload size={18} />
          {isUploading ? 'Сжатие...' : 'Загрузить фото'}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileUpload} 
            className="hidden" 
            disabled={isUploading}
          />
        </label>
      </div>

      <div className="flex-grow overflow-y-auto">
        {images.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
             <ImageIcon size={48} className="mb-4 opacity-50" />
             <p>Нет загруженных изображений</p>
             <p className="text-xs mt-2">Макс. размер 800px (автосжатие)</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map(img => (
              <div 
                key={img.id} 
                className={`group relative rounded-lg overflow-hidden border border-slate-200 aspect-square cursor-pointer ${selectionMode ? 'hover:ring-2 hover:ring-brand-orange' : ''}`}
                onClick={() => selectionMode && onSelect && onSelect(img.data)}
              >
                <img src={img.data} alt={img.name} className="w-full h-full object-cover" />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                   {selectionMode ? (
                     <div className="text-white font-bold flex items-center gap-1">
                        <Check size={20} /> Выбрать
                     </div>
                   ) : (
                     <p className="text-white text-xs px-2 text-center truncate w-full">{img.name}</p>
                   )}
                   
                   {!selectionMode && (
                     <button 
                        onClick={(e) => handleDelete(e, img.id)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Удалить"
                     >
                       <Trash2 size={16} />
                     </button>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-slate-400 mt-4 text-center">
        Изображения хранятся в браузере. Очистка кэша удалит их. Максимум 50 фото.
      </p>
    </div>
  );
};

export default MediaLibrary;
