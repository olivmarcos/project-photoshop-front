import { ChangeEvent, useRef } from "react";
import { Image } from "./Image";
import ImageInformation from "./ImageInformation";

interface ImageUploaderProps {
  fileUrl: string | null;
  fileName: string;
  handleSelectedFile: (event: ChangeEvent<HTMLInputElement>) => void;
}

function ImageUploader({ fileUrl, fileName, handleSelectedFile }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOnClick = () => {
    if (!fileInputRef.current || fileUrl) {
      return;
    }
    fileInputRef?.current.click();
  }

  return (
    <>
      <div
        className={
          `min-w-[256px] min-h-[256px] flex items-center justify-center border-dashed border border-rose-400 rounded-md ${fileName ? 'p-2' : 'cursor-pointer'}`
        }
        onClick={handleOnClick}>
        {!fileUrl && <span className="drop-shadow-lg">Selecione uma imagem</span>}
        {fileUrl && 
          <ImageInformation context="upload">
            <Image id={fileName} src={fileUrl} alt={fileName}></Image>
          </ImageInformation>
        }
      </div>

      <input
        id="originalFile"
        className="hidden"
        type="file"
        accept=".jpg, .jpeg, .png, .bmp"
        ref={fileInputRef}
        onChange={handleSelectedFile}
      />
    </>
  );
}
export default ImageUploader;
