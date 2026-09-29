import React from 'react';
import type { User } from '../../../context/AuthContext';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: User | null;
  submitting?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
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
        <div className="bg-gradient-to-r from-red-800 to-red-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">⚠️</span>
            <h3 className="font-bold text-sm tracking-tight">
              Confirmar Eliminación de Usuario
            </h3>
          </div>
          <button
            className="text-red-100 hover:text-white bg-red-800/60 hover:bg-red-800 p-1.5 rounded-lg text-xs transition"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            ¿Estás seguro de que deseas eliminar permanentemente a este usuario? Esta acción no se puede deshacer.
          </p>

          {/* User Detail Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">
                {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.username}
              </span>
              <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
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
              className="bg-red-700 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg text-xs transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              onClick={onConfirm}
            >
              {submitting ? '⏳ Eliminando...' : '🗑️ Eliminar Usuario'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
