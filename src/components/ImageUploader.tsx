import { ChangeEvent, FormEvent, useRef, useState } from "react";

const BASE_URL = 'http://127.0.0.1:5000/api/v1';

function ImageUploader() {
  const [fileUrl, setFileurl] = useState('');
  const [fileName, setFileName] = useState('');
  const [alteredFileUrl, setAlteredFileUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [gamma, setGamma] = useState(1);
  const [filterToApply, setFilterToApply] = useState('');

  const handleOnClick = () => {
    if (!fileInputRef.current) {
      return;
    }
    fileInputRef?.current.click();
  }

  const handleSelectedFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;

    if (!fileList) {
      return;
    }

    const selectedFile: File = fileList[0];
    const uploadedFileName = await uploadFile(selectedFile);
    setFileName(uploadedFileName);
    setFileurl(`${BASE_URL}/uploads/${uploadedFileName}`);
  }

  const uploadFile = async (file: File) => {
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file, file.name);

    try {
      const response = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      const { file_name } = await response.json();
      return file_name;
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }

  const handleOnChangeFilter = async (event: ChangeEvent<HTMLSelectElement>) => {
    const filterToApply = event.target.value;
    if (!filterToApply) {
      return;
    }
    setFilterToApply(filterToApply);
  }

  const handleOnSubmitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const alteredFileName = await applyFilter(filterToApply);
    setAlteredFileUrl(`${BASE_URL}/altered/${alteredFileName}`);
  }

  const applyFilter = async (filterToApply: string) => {
    const body = {
      filterToApply,
      fileName,
      gamma
    }

    try {
      const response = await fetch(`${BASE_URL}/filter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });
      const { file_name } = await response.json();
      return file_name;
    } catch (error) {
      console.error('Erro applying filter', error);
    }
  };

  return (
    <>
      <div className="">
        <form action="" className="flex flex-col gap-4" onSubmit={handleOnSubmitForm}>
          <div className="flex gap-4">
            <select className="py-3 px-10" name="filters" id="filters" defaultValue={'default'} disabled={!fileUrl} onChange={handleOnChangeFilter}>
              <option value="default">Filtros</option>
              <option value="negative">Negativo</option>
              <option value="logarithm">Logaritmo</option>
              <option value="inverse-logarithm">Logaritmo inverso</option>
              <option value="power">Potência</option>
              <option value="root">Raíz</option>
            </select>
          </div>

          <input
            className="border border-solid border-red-500 w-16 px-2 py-1"
            id="number"
            value={gamma}
            onChange={e => setGamma(parseInt(e.target.value))}
            disabled={!fileUrl}
            type="number"
            min={1}
            max={200}
          />

          <div>
            <button
              className="bg-black text-white py-2 px-4 rounded-md"
              type="submit"
              disabled={!fileUrl} 
              >
              Apply filter
            </button>
          </div>
        </form>

        <div className="flex items-center justify-center gap-4">
          <div className="p-4 shadow-2xl w-[500px] h-[600px] flex items-center justify-center">
            {!fileUrl && (
              <button className="py-3 px-2 bg-black text-white rounded-md" onClick={handleOnClick}>Selecione uma imagem</button>
            )}
            {fileUrl && (
              <img className="w-full h-full" src={fileUrl} alt="originalImage" />
            )}
          </div>

          <div className="w-[500px] h-[600px] p-4 shadow-2xl">
            {alteredFileUrl && (
              <img className="w-full h-full" src={alteredFileUrl} alt="filteredImage" />
            )}
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept=".jpg, .jpeg, .png, .bmp" onChange={handleSelectedFile} style={{ display: "none" }} />
    </>
  );
}

export default ImageUploader;