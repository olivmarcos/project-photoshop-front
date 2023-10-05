import { ChangeEvent, useRef } from "react";
import DisplayArea from "./DisplayArea";
import Image from "./Image";

interface ImageUploaderProps {
  fileUrl: string | null;
  handleSelectedFile: (event: ChangeEvent<HTMLInputElement>) => void;
}

function ImageUploader({ fileUrl, handleSelectedFile }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOnClick = () => {
    if (!fileInputRef.current) {
      return;
    }
    fileInputRef?.current.click();
  }
  return (
    <>
      <DisplayArea fileUrl={fileUrl} handleOnClick={handleOnClick}>
        {!fileUrl && <span className="drop-shadow-lg">Selecione uma imagem</span>}
        {fileUrl && <Image src={fileUrl} alt={'original image'}></Image>}

      </DisplayArea>

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
