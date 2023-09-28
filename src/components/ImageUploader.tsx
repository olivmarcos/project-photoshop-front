import { ChangeEvent, FormEvent, useRef, useState } from "react";

const BASE_URL = 'http://127.0.0.1:5000/api/v1';

function ImageUploader() {
  const [fileUrl, setFileurl] = useState('');
  const [fileName, setFileName] = useState('');
  const [alteredFileUrl, setAlteredFileUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [gamma, setGamma] = useState(1);
  const [filterToApply, setFilterToApply] = useState('');
  const [aValue, setAValue] = useState(0);
  const [bValue, setBValue] = useState(0);

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

  const handleAValue = async (event: ChangeEvent<HTMLInputElement>) => {
    const inputedAValue = event.target.value;
    if (!inputedAValue) {
      return;
    }
    setAValue(parseInt(inputedAValue));
  }

  const handleBValue = async (event: ChangeEvent<HTMLInputElement>) => {
    const inputedBValue = event.target.value;
    if (!inputedBValue) {
      return;
    }
    setBValue(parseInt(inputedBValue));
  }

  const applyFilter = async (filterToApply: string) => {
    const body = {
      filterToApply,
      fileName,
      gamma,
      aValue,
      bValue
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
      <div className="flex gap-4 h-screen">
        <form action="" className=" bg-white px-6 py-6 rounded-md mb-8 shadow-xl h-5/6" onSubmit={handleOnSubmitForm}>
          <div className="flex flex-col gap-4 mb-6">
            <select
              className="py-3 px-4 border border-solid border-black rounded-lg"
              name="filters"
              id="filters"
              defaultValue={'default'}
              disabled={!fileUrl}
              onChange={handleOnChangeFilter}
            >
              <option value="default">Filtros</option>
              <option value="negative">Negativo</option>
              <option value="logarithm">Logaritmo</option>
              <option value="inverse-logarithm">Logaritmo inverso</option>
              <option value="power">Potência</option>
              <option value="root">Raíz</option>
              <option value="rotation-ninety-degree">Rotação 90º horário</option>
              <option value="rotation-counterclockwise-ninety-degree">Rotação 90º anti-horário</option>
              <option value="rotation-one-hundred-eighty">Rotação 180º</option>
              <option value="expansion">Expansão</option>
              <option value="compression">Compressão</option>
            </select>

            <div className="flex items-center justify-center gap-4 w-40">
              <label htmlFor="gamma">Gamma</label>
              <input
                className="border border-solid border-red-500 w-full"
                id="gamma"
                value={gamma}
                onChange={e => setGamma(parseInt(e.target.value))}
                disabled={!fileUrl}
                type="range"
                min={1}
                max={200}
              />
              <p className="font-bold">{gamma}</p>
            </div>

            {['expansion', 'compression'].includes(filterToApply) && (
              <div>
                <hr className="border border-solid border-gray-400 mb-6" />
                <div className="flex flex-col gap-2">
                  <input
                    className="border border-solid border-black rounded-lg px-2"
                    type="number"
                    name="a"
                    id="a"
                    placeholder="A"
                    value={aValue}
                    onChange={handleAValue}
                  />
                  <input
                    className="border border-solid border-black rounded-lg px-2"
                    type="number"
                    name="b"
                    id="b"
                    placeholder="B"
                    value={bValue}
                    onChange={handleBValue}
                  />
                </div>
              </div>
            )}
          </div>
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

        <div className="flex items-center justify-center gap-4 h-5/6">
          <div className="p-4 shadow-2xl w-[500px] h-[600px] flex items-center justify-center">
            {!fileUrl && (
              <button className="py-3 px-3 bg-black text-white rounded-md" onClick={handleOnClick}>Selecione uma imagem</button>
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