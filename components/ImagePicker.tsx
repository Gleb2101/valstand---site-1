
import React, { useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import MediaLibrary from './MediaLibrary';

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

const ImagePicker: React.FC<ImagePickerProps> = ({ value, onChange, label = "Изображение" }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (url: string) => {
    onChange(url);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm text-slate-500">{label}</label>
      
      <div className="flex gap-4 items-start">
        {/* Preview */}
        <div className="w-32 h-32 bg-slate-100 border border-slate-300 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 relative group">
          {value ? (
            <>
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
              <button 
                type="button"
                onClick={() => onChange('')}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </>
          ) : (
            <ImageIcon className="text-slate-400" size={32} />
          )}
        </div>

        <div className="flex-grow space-y-2">
          <div className="flex gap-2">
            <input 
               type="text" 
               className="w-full p-2 rounded bg-slate-50 border border-slate-300 text-sm"
               placeholder="URL или выберите из библиотеки"
               value={value}
               onChange={(e) => onChange(e.target.value)}
            />
          </div>
          <button 
            type="button"
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded hover:bg-slate-300 text-sm flex items-center gap-2"
          >
            <ImageIcon size={16} />
            Выбрать из библиотеки
          </button>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden relative">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                 <h3 className="font-bold text-lg">Выберите изображение</h3>
                 <button 
                   type="button" 
                   onClick={() => setIsOpen(false)}
                   className="p-2 hover:bg-slate-100 rounded-full"
                 >
                   <X size={20} />
                 </button>
              </div>
              <div className="flex-grow overflow-hidden p-4 bg-slate-50">
                 <MediaLibrary selectionMode onSelect={handleSelect} />
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ImagePicker;
