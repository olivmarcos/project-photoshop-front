import { ReactNode } from "react";

interface ModalProps {
  children?: ReactNode
  isOpen: boolean,
  onClose: () => void;
}

function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-5/6 h-5/6 overflow-auto flex items-center justify-center">
        <button
          className="absolute top-11 right-32 text-white hover:text-gray-700"
          onClick={onClose}
        >
          X
        </button>
        {children}
      </div>
    </div>
  );
}

export default Modal;