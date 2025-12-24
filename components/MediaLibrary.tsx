
import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Image as ImageIcon, Check, Smile } from 'lucide-react';
import { dataManager } from '../services/dataManager';
import { StoredImage } from '../types';

interface MediaLibraryProps {
  onSelect?: (url: string) => void;
  selectionMode?: boolean;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({ onSelect, selectionMode = false }) => {
  const [images, setImages] = useState<StoredImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'general' | 'icon'>('general');

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    const imgs = await dataManager.getImages();
    setImages(imgs);
  };

  const compressImage = (file: File, type: 'general' | 'icon'): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          
          // Custom logic for Icons: very small size
          const MAX_WIDTH = type === 'icon' ? 64 : 800; 
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
          
          // Icons are usually PNG for transparency, but we use JPEG for generic content unless specifically PNG
          const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const dataUrl = canvas.toDataURL(mime, type === 'icon' ? 1.0 : 0.7);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'general' | 'icon') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const file = files[0];
      const base64 = await compressImage(file, type);
      
      const newImage: StoredImage = {
        id: Date.now().toString(),
        name: type === 'icon' ? `ICON_${file.name}` : file.name,
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

  // Helper to filter icons for special selection
  const filteredImages = images;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-900">Медиабиблиотека</h3>
        
        <div className="flex gap-2">
            <label className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors border border-slate-200 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                <Smile size={14} />
                Загрузить иконку (64px)
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => handleFileUpload(e, 'icon')} 
                    className="hidden" 
                    disabled={isUploading}
                />
            </label>

            <label className={`cursor-pointer flex items-center gap-2 px-4 py-2 bg-brand-yellow text-brand-dark font-bold rounded-lg hover:bg-brand-orange transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                <Upload size={18} />
                {isUploading ? 'Обработка...' : 'Загрузить фото'}
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => handleFileUpload(e, 'general')} 
                    className="hidden" 
                    disabled={isUploading}
                />
            </label>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto">
        {filteredImages.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
             <ImageIcon size={48} className="mb-4 opacity-50" />
             <p>Библиотека пуста</p>
             <p className="text-xs mt-2 text-center px-6">Загрузите иконки услуг или фотографии для кейсов и блога.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredImages.map(img => {
              const isIcon = img.name.startsWith('ICON_');
              return (
                <div 
                  key={img.id} 
                  className={`group relative rounded-lg overflow-hidden border border-slate-200 aspect-square cursor-pointer transition-all ${selectionMode ? 'hover:ring-4 hover:ring-brand-orange/30' : ''} ${isIcon ? 'bg-slate-50' : 'bg-white'}`}
                  onClick={() => selectionMode && onSelect && onSelect(img.data)}
                >
                  <img src={img.data} alt={img.name} className={`w-full h-full object-cover ${isIcon ? 'p-4 object-contain' : ''}`} />
                  
                  {isIcon && (
                      <div className="absolute top-1 left-1 bg-brand-orange text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase">Иконка</div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                     {selectionMode ? (
                       <div className="text-white font-bold flex items-center gap-1 text-sm bg-brand-orange px-3 py-1 rounded-full">
                          <Check size={16} /> Выбрать
                       </div>
                     ) : (
                       <p className="text-white text-[10px] text-center truncate w-full">{img.name.replace('ICON_', '')}</p>
                     )}
                     
                     {!selectionMode && (
                       <button 
                          onClick={(e) => handleDelete(e, img.id)}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                          title="Удалить"
                       >
                         <Trash2 size={16} />
                       </button>
                     )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <p className="text-[10px] text-slate-400 mt-4 text-center italic">
        Рекомендуется загружать прозрачные PNG для иконок услуг. Все файлы хранятся локально в IndexedDB браузера.
      </p>
    </div>
  );
};

export default MediaLibrary;
