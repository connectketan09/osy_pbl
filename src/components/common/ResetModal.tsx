import React from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-atmos-border rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-atmos-warningBg border border-[#F2E5D0] flex items-center justify-center text-atmos-warning">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-atmos-primary">
              Restore Demonstration State?
            </h3>
            <p className="text-xs text-atmos-secondary">
              Deterministic reset for viva & report demonstrations
            </p>
          </div>
        </div>

        <p className="text-xs text-atmos-secondary leading-relaxed mb-5">
          This action will reset all simulated modules to their baseline initial states:
          restoring the 4 sample bank accounts, initial process table (CO2), 5 memory partitions (CO4),
          Banker&apos;s allocation matrices (CO3), and the 4 virtual indexed disk transaction logs (CO5).
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-atmos-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-atmos-secondary hover:text-atmos-primary hover:bg-atmos-highlight rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-xs font-medium text-white bg-atmos-accent hover:bg-atmos-accentHover rounded flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restore Initial State
          </button>
        </div>
      </div>
    </div>
  );
};
