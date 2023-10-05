import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import ImageUploader from "../components/ImageUploader";
import { applyFilter, generateHistogram, uploadFile } from "../services/http";
import DisplayArea from "../components/DisplayArea";
import Image from "../components/Image";
import Modal from "../components/Modal";

const BASE_URL = 'http://127.0.0.1:5000/api/v1';

function Editor() {
  const [firstFileName, setFirstFileName] = useState<string | null>(null);
  const [firstFileUrl, setFirstFileUrl] = useState<string | null>(null);
  const [secondFileName, setSecondFileName] = useState<string | null>(null);
  const [secondFileUrl, setSecondFileUrl] = useState<string | null>(null);
  const [alteredFileUrl, setAlteredFileUrl] = useState<string | null>(null);
  const [histogramFileUrl, setHistogramFileUrl] = useState<string | null>(null);

  const [filterToApply, setFilterToApply] = useState<string>('default');
  const [scaleFactor, setScaleFactor] = useState<number>(2);
  const [gamma, setGamma] = useState<number>(1);
  const [mergePercentage, setMergePercentage] = useState<number>(0);
  const [aValue, setAValue] = useState(0);
  const [bValue, setBValue] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const resetForm = () => {
    setFirstFileName(null);
    setFirstFileUrl(null);
    setSecondFileName(null);
    setSecondFileUrl(null);
    setAlteredFileUrl(null);
    setGamma(1);
    setMergePercentage(0);
    setFilterToApply('default');
    setAValue(0);
    setBValue(0);
    setScaleFactor(0);
    setHistogramFileUrl(null);
    clearInputFiles();
  };

  const clearInputFiles = () => {
    const fileInputs = document.querySelectorAll<HTMLInputElement>('input[type="file"]');
    fileInputs.forEach(file => file.value = '')
  };

  const handleOnChangeFilter = async (event: ChangeEvent<HTMLSelectElement>) => {
    const filterToApply = event.target.value;
    if (!filterToApply) {
      return;
    }
    setFilterToApply(filterToApply);
  };

  const handleFirstFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) {
      return;
    }

    const selectedFile: File = fileList[0];
    const uploadedFileName = await uploadFile(selectedFile);

    if (!uploadedFileName) {
      return;
    }

    setFirstFileName(uploadedFileName);

    if (['nearest-neighbor-resampling', 'bilinear-interpolation-resampling'].includes(filterToApply) && scaleFactor === 4) {
      openModal();
    }
  }

  useEffect(() => {
    if (!firstFileName) {
      return;
    }
    setFirstFileUrl(`${BASE_URL}/uploads/${firstFileName}`);
  }, [firstFileName]);

  const handleSecondFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) {
      return;
    }

    const selectedFile: File = fileList[0];
    const uploadedFileName = await uploadFile(selectedFile);

    if (!uploadedFileName) {
      return;
    }

    setSecondFileName(uploadedFileName);
  }

  useEffect(() => {
    if (!secondFileName) {
      return;
    }
    setSecondFileUrl(`${BASE_URL}/uploads/${secondFileName}`);
  }, [secondFileName]);

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

  const handleOnSubmitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!filterToApply || !firstFileName) {
      return;
    }

    const alteredFileUrl = await applyFilter(
      filterToApply,
      firstFileName,
      secondFileName,
      gamma,
      aValue,
      bValue,
      scaleFactor,
      mergePercentage
    );

    if (!alteredFileUrl) {
      return;
    }

    setAlteredFileUrl(alteredFileUrl);

    if (['nearest-neighbor-resampling', 'bilinear-interpolation-resampling'].includes(filterToApply) && scaleFactor === 4) {
      openModal();
    }
  }

  const handleHistogram = async () => {
    if (!firstFileName) {
      return;
    }

    const histogramfilePath = await generateHistogram(firstFileName);

    if (!histogramfilePath) {
      return;
    }

    setHistogramFileUrl(histogramfilePath);
    openModal();
  }

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="w-full h-full flex flex-col items-center gap-4">
      <div className="bg-rose-400 text-white flex items-center justify-between w-full h-16 px-6 rounded-md shadow-md">
        <span className="font-bold">PDI - Project Photoshop</span>
        {/* <span>Download images</span> */}
      </div>

      <div className="w-full flex items-center justify-end pr-10">
        <div>
          <span className="font-bold cursor-pointer drop-shadow-lg" onClick={resetForm}>limpar tudo</span>
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
              onChange={handleOnChangeFilter}
              disabled={!firstFileUrl}
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
              <div className="flex flex-col">
              <label htmlFor="gamma">Gamma</label>
                <div className="flex items-center justify-center gap-2">
                  <input
                    className="w-full accent-rose-400"
                    id="gamma"
                    value={gamma}
                    onChange={e => setGamma(parseFloat(e.target.value))}
                    disabled={!firstFileUrl}
                    type="range"
                    step={0.01}
                    min={0}
                    max={5}
                  />
                  <p className="font-bold">{gamma}</p>
                </div>
              </div>
            )}

            {filterToApply === 'add-two-images' && (
              <div className="flex flex-col">
                <label htmlFor="gamma">Porcentagem</label>
                <div className="flex items-center justify-center gap-2">
                  <input
                    className="w-full accent-rose-400"
                    id="gamma"
                    value={mergePercentage}
                    onChange={e => setMergePercentage(parseInt(e.target.value))}
                    disabled={!secondFileUrl}
                    type="range"
                    min={0}
                    max={100}
                  />
                  <p className="font-bold">{mergePercentage}%</p>
                </div>
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
            className={`text-rose-400 py-2 rounded-lg border border-solid border-rose-400 hover:bg-rose-400 hover:text-white ${firstFileUrl ? '' : 'hidden'}`}
            onClick={handleHistogram}
          >
            Obter histograma
          </button>

          <div className="w-full flex items-center justify-end">
            <button
              className={`py-2 px-4 rounded-lg text-white ${firstFileUrl ? 'bg-rose-400' : 'bg-gray-400'}`}
              type="submit"
              disabled={!firstFileUrl}
            >
              Apply filter
            </button>
          </div>
        </form>

        <div className="flex items-center justify-center gap-4 col-span-5 border-dashed border-2 border-rose-400">
          <ImageUploader fileUrl={firstFileUrl} handleSelectedFile={handleFirstFileChange}></ImageUploader>

          {filterToApply === 'add-two-images' && (
            <ImageUploader fileUrl={secondFileUrl} handleSelectedFile={handleSecondFile}></ImageUploader>
          )}

          {alteredFileUrl && scaleFactor !== 4 && (
            <DisplayArea fileUrl={alteredFileUrl}>
              <Image fileUrl={alteredFileUrl} altText={'altered image'}></Image>
            </DisplayArea>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {alteredFileUrl && (
          <div>
            <img src={alteredFileUrl} alt="filteredImage" />
          </div>
        )}

        {histogramFileUrl && (
          <div>
            <Image fileUrl={histogramFileUrl} altText={'image histogram'}></Image>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Editor;