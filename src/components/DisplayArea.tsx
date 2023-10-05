import { ReactNode } from "react";

interface DisplayAreaProps {
  fileUrl: string | null;
  children?: ReactNode;
  handleOnClick?: () => void;
}

function DisplayArea({ fileUrl, children, handleOnClick }: DisplayAreaProps) {
  return (
    <>
      <div
        className={`min-w-[256px] min-h-[256px] flex items-center justify-center border-dashed border border-rose-400 rounded-md ${fileUrl ? 'pointer-events-none p-2' : 'cursor-pointer'
          }`}
        onClick={handleOnClick}
      >
        {children}
      </div>
    </>
  )
}

export default DisplayArea;