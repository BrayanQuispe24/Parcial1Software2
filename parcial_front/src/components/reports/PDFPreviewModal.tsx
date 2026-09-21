import React, { useEffect } from 'react';
import { usePDF, PDFDownloadLink } from '@react-pdf/renderer';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: React.ReactElement<any>;
  title?: string;
  fileName?: string;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  document,
  title = 'Vista Previa del Reporte PDF',
  fileName = 'reporte_seguridad_ia.pdf',
}) => {
  const [instance, updateInstance] = usePDF({ document });

  useEffect(() => {
    if (isOpen && document) {
      updateInstance(document);
    }
  }, [isOpen, document]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-6xl h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header Modal */}
        <div className="px-6 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-purple-400 font-bold text-sm">👁️ Visor Interactivo PDF</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300 font-medium truncate max-w-md">{title}</span>
          </div>

          <div className="flex items-center gap-3">
            {instance.url ? (
              <a
                href={instance.url}
                download={fileName}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition shadow-xs flex items-center gap-1.5"
              >
                <span>📥</span> Descargar PDF
              </a>
            ) : (
              <PDFDownloadLink
                document={document}
                fileName={fileName}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition shadow-xs flex items-center gap-1.5"
              >
                {({ loading }) => (loading ? '⏳ Preparando...' : '📥 Descargar PDF')}
              </PDFDownloadLink>
            )}

            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition p-1.5 rounded-lg font-bold text-xs"
              title="Cerrar vista previa (Esc)"
            >
              ✕ Cerrar
            </button>
          </div>
        </div>

        {/* Visor PDF Nativo mediante iframe Blob URL */}
        <div className="flex-1 bg-slate-950 p-2 overflow-hidden flex flex-col items-center justify-center">
          {instance.loading || !instance.url ? (
            <div className="flex flex-col items-center justify-center gap-3 text-slate-400 py-20">
              <div className="w-9 h-9 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-semibold tracking-wide">Compilando vista previa nativa sin congelamiento...</p>
            </div>
          ) : (
            <iframe
              src={instance.url}
              title={title}
              className="w-full h-full rounded-xl border border-slate-800 shadow-inner bg-slate-900"
            />
          )}
        </div>
      </div>
    </div>
  );
};
