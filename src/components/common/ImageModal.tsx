import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ZoomIn, ZoomOut, Download, Printer, RotateCcw } from 'lucide-react';

export const ImageModal: React.FC = () => {
  const { imageModal, closeImageModal } = useApp();
  const [scale, setScale] = useState(1);

  if (!imageModal.isOpen) return null;

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const handleResetZoom = () => setScale(1);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageModal.imageUrl;
    a.download = `receipt-${imageModal.date || 'doc'}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <title>${imageModal.title || 'إيصال مالي'}</title>
          <style>
            body { margin: 20px; font-family: sans-serif; text-align: center; }
            img { max-width: 95%; max-height: 85vh; object-fit: contain; }
            .meta { margin-bottom: 20px; font-size: 16px; color: #333; }
          </style>
        </head>
        <body>
          <div class="meta">
            <h2>${imageModal.title || 'مستند مالي'}</h2>
            <p>${imageModal.date ? `التاريخ: ${imageModal.date}` : ''} ${imageModal.amount ? `| المبلغ: ${imageModal.amount}` : ''}</p>
          </div>
          <img src="${imageModal.imageUrl}" />
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
        </html>
      `);
      printWin.document.close();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="relative flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex flex-col">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{imageModal.title || 'عرض الإيصال / الفاتورة'}</span>
              {imageModal.amount && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  {imageModal.amount}
                </span>
              )}
            </h3>
            {imageModal.date && <span className="text-xs text-slate-400 mt-0.5">{imageModal.date}</span>}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleZoomIn}
              title="تكبير"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              title="تصغير"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              title="إعادة ضبط"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span>100%</span>
            </button>
            <div className="w-px h-5 bg-slate-700 mx-1" />
            <button
              onClick={handleDownload}
              title="تحميل الصورة"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              title="طباعة"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={closeImageModal}
              title="إغلاق"
              className="p-2 text-slate-400 hover:text-white hover:bg-rose-600/30 rounded-lg transition-colors mr-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-[350px] bg-slate-950/80">
          <div
            style={{ transform: `scale(${scale})`, transition: 'transform 0.15s ease-out' }}
            className="origin-center max-w-full"
          >
            <img
              src={imageModal.imageUrl}
              alt={imageModal.title || 'إثبات مالي'}
              className="max-h-[70vh] w-auto object-contain rounded-lg shadow-lg border border-slate-800"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
