import { ChangeEvent, FormEvent, useRef, useState } from "react";
import Modal from "./Modal";

const BASE_URL = 'http://127.0.0.1:5000/api/v1';

function ImageUploader() {
  const [fileUrl, setFileurl] = useState('');
  const [secondFileUrl, setSecondFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [secondFileName, setSecondFileName] = useState('');
  const [alteredFileUrl, setAlteredFileUrl] = useState('');
  const [gamma, setGamma] = useState(1);
  const [filterToApply, setFilterToApply] = useState('default');
  const [aValue, setAValue] = useState(0);
  const [bValue, setBValue] = useState(0);
  const [scaleFactor, setScaleFactor] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const secondFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [histogramFileUrl, setHistogramFileUrl] = useState('');

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const cleanForm = () => {
    setFileurl('');
    setSecondFileUrl('');
    setFileName('');
    setSecondFileName('');
    setAlteredFileUrl('');
    setGamma(1);
    setFilterToApply('default');
    setAValue(0);
    setBValue(0);
    setScaleFactor(0);
    setHistogramFileUrl('');
    clearInputFiles();
  }

  const clearInputFiles = () => {
    const fileInputs = document.querySelectorAll<HTMLInputElement>('input[type="file"]');
    fileInputs.forEach(file => file.value = '')
  }

  const handleOnClick = () => {
    if (!fileInputRef.current) {
      return;
    }
    fileInputRef?.current.click();
  }

  const handleOnClickSecondFile = () => {
    if (!secondFileInputRef.current) {
      return;
    }
    secondFileInputRef?.current.click();
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

  const handleSelectedSecondFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;

    if (!fileList) {
      return;
    }

    const selectedFile: File = fileList[0];
    const uploadedFileName = await uploadFile(selectedFile);
    setSecondFileName(uploadedFileName);
    setSecondFileUrl(`${BASE_URL}/uploads/${uploadedFileName}`);
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

    if (!filterToApply) {
      return;
    }

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

  const handleOnChangeScaleFactor = async (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedScale = event.target.value;
    if (!selectedScale) {
      return;
    }
    setScaleFactor(parseInt(selectedScale));
  }

  const handleGeneratedHistogram = (fileName: string) => {
    setHistogramFileUrl(`${BASE_URL}/histogram/${fileName}`)
  }

  const applyFilter = async (filterToApply: string) => {
    const body = {
      filterToApply,
      fileName,
      secondFileName,
      gamma,
      aValue,
      bValue,
      scaleFactor
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
      if (['nearest-neighbor-resampling', 'bilinear-interpolation-resampling'].includes(filterToApply) && scaleFactor === 4) {
        openModal();
      }
      return file_name;
    } catch (error) {
      console.error('Erro applying filter', error);
    }
  };

  const generateHistogram = async () => {
    const body = {
      fileName
    }

    try {
      const response = await fetch(`${BASE_URL}/histogram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      })
      const { data } = await response.json();
      handleGeneratedHistogram(data.fileName)
      openModal()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <div className="w-full flex items-center justify-end pr-10">
        <div>
          <span className="font-bold cursor-pointer drop-shadow-lg" onClick={cleanForm}>limpar tudo</span>
        </div>
      </div>
      <div className="grid grid-cols-6 gap-6 h-5/6">
        <form action="" className="bg-white p-6 flex flex-col justify-between rounded-lg shadow-lg" onSubmit={handleOnSubmitForm}>
          <div className="flex flex-col gap-4 h-3/4">
            <select
              className="py-3 px-4 border border-solid border-rose-400 rounded-lg"
              name="filters"
              id="filters"
              value={filterToApply}
              disabled={!fileUrl}
              onChange={handleOnChangeFilter}
            >
              <option value="default" disabled hidden>Filtros</option>
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
              <option value="add-two-images">Soma de 2 imagens</option>
              <option value="nearest-neighbor-resampling">Ampliação com replicação de pixels</option>
              <option value="bilinear-interpolation-resampling">Ampliação com interpolação bilinear</option>
            </select>

            {['logarithm', 'inverse-logarithm', 'power', 'root'].includes(filterToApply) && (
              <div className="flex items-center justify-center gap-4 w-40">
                <label htmlFor="gamma">Gamma</label>
                <input
                  className="border border-solid border-red-500 w-full bg-black"
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
            )}

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

            {['nearest-neighbor-resampling', 'bilinear-interpolation-resampling'].includes(filterToApply) && (
              <select
                name="scales"
                id="scales"
                className="py-3 px-4 border border-solid border-rose-400 rounded-lg"
                defaultValue={'none'}
                onChange={handleOnChangeScaleFactor}
              >
                <option value="none" disabled hidden>Escalas</option>
                <option value="2">512x512</option>
                <option value="4">1024x1024</option>
              </select>
            )}
          </div>

          <button
            type="button"
            id="getHistogram"
            className={`text-rose-400 py-2 rounded-lg border border-solid border-rose-400 hover:bg-rose-400 hover:text-white ${fileUrl ? '' : 'hidden'}`}
            onClick={generateHistogram}
          >
            Obter histograma
          </button>

          <div className="w-full flex items-center justify-end">
            <button
              className={`py-2 px-4 rounded-lg text-white ${fileUrl ? 'bg-rose-400' : 'bg-gray-400'}`}
              type="submit"
              disabled={!fileUrl}
            >
              Apply filter
            </button>
          </div>
        </form>

        <div className="flex items-center justify-center gap-4 col-span-5 border-dashed border-2 border-rose-400">
          <div
            className={`min-w-[256px] min-h-[256px] flex items-center justify-center border-dashed border border-rose-400 rounded-md ${fileUrl ? 'pointer-events-none p-2' : 'cursor-pointer'}`}
            onClick={handleOnClick}
          >
            {!fileUrl && (
              <span className="drop-shadow-lg">Selecione uma imagem</span>
            )}

            {fileUrl && (
              <img src={fileUrl} alt="originalImage" />
            )}
          </div>

          {filterToApply === 'add-two-images' && (
            <div
              className={`min-w-[256px] min-h-[256px] flex items-center justify-center border-dashed border border-gray-400 rounded-md ${secondFileUrl ? 'pointer-events-none p-2' : 'cursor-pointer'}`}
              onClick={handleOnClickSecondFile}
            >
              {!secondFileUrl && (
                <span className="drop-shadow-lg">Selecione uma imagem</span>
              )}

              {secondFileUrl && (
                <img src={secondFileUrl} alt="originalImage" />
              )}
            </div>
          )}

          {alteredFileUrl && scaleFactor !== 4 && (
            <div className={`min-w-[256px] min-h-[256px] flex items-center justify-center border-dashed border border-gray-400 rounded-md ${alteredFileUrl ? 'p-2' : ''}`}>
              <img src={alteredFileUrl} alt="filteredImage" />
            </div>
          )}
        </div>
      </div>

      <input
        id="originalFile"
        className="hidden"
        ref={fileInputRef}
        type="file"
        accept=".jpg, .jpeg, .png, .bmp"
        onChange={handleSelectedFile} />

      <input
        id="secondOriginalFile"
        className="hidden"
        ref={secondFileInputRef}
        type="file"
        accept=".jpg, .jpeg, .png, .bmp"
        onChange={handleSelectedSecondFile} />

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {alteredFileUrl && (
          <div>
            <img src={alteredFileUrl} alt="filteredImage" />
          </div>
        )}

        {histogramFileUrl && (
          <div>
            <img src={histogramFileUrl} alt="histogram" />
          </div>
        )}
      </Modal>
    </>
  );
}

export default ImageUploader;