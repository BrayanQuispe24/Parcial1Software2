import React from 'react';
import type { User } from '../../../context/AuthContext';

interface ConfirmEnableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: User | null;
  submitting?: boolean;
}

export const ConfirmEnableModal: React.FC<ConfirmEnableModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  user,
  submitting = false,
}) => {
  if (!isOpen || !user) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🛡️</span>
            <h3 className="font-bold text-sm tracking-tight">
              Confirmar Habilitación de Cuenta
            </h3>
          </div>
          <button
            className="text-emerald-100 hover:text-white bg-emerald-800/60 hover:bg-emerald-800 p-1.5 rounded-lg text-xs transition"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            ¿Confirmas la habilitación de acceso a la plataforma para la cuenta de Pentester seleccionada?
          </p>

          {/* User Detail Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">
                {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.username}
              </span>
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                #{user.id}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px] truncate">
              <span>✉️</span>
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
              <span className="text-slate-400">Usuario:</span>
              <span className="font-semibold text-slate-700">@{user.username}</span>
            </div>
          </div>

          {/* Email Info Alert */}
          <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-900 text-[11px] flex items-start gap-2.5">
            <span className="text-base shrink-0 mt-0.5">📩</span>
            <div className="leading-snug">
              <span className="font-bold block text-emerald-950 mb-0.5">Envío de Correo Automático</span>
              Se enviará un correo electrónico notificando la activación de la cuenta junto con los Términos y Condiciones del servicio.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold px-4 py-2 rounded-lg text-xs transition"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={submitting}
              className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-lg text-xs transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              onClick={onConfirm}
            >
              {submitting ? '⏳ Habilitando...' : '✓ Habilitar Cuenta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
