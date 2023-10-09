
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import ImageUploader from "../components/ImageUploader";
import { applyFilter, uploadFile } from "../services/http";
import { Image } from "../components/Image";
import Modal from "../components/Modal";
import ImageInformation from "../components/ImageInformation";

const BASE_URL = 'http://127.0.0.1:5000/api/v1';

function Editor() {
  const [firstFileName, setFirstFileName] = useState<string | null>(null);
  const [firstFileUrl, setFirstFileUrl] = useState<string | null>(null);
  const [secondFileName, setSecondFileName] = useState<string | null>(null);
  const [secondFileUrl, setSecondFileUrl] = useState<string | null>(null);
  const [alteredFileName, setAlteredFileName] = useState<string | null>(null);
  const [alteredFileUrl, setAlteredFileUrl] = useState<string | null>(null);

  const [filterToApply, setFilterToApply] = useState<string>('none');
  const [scaleFactor, setScaleFactor] = useState<number>(2);
  const [gamma, setGamma] = useState<number>(1);
  const [mergePercentage, setMergePercentage] = useState<number>(0);
  const [aValue, setAValue] = useState<number | null>(null);
  const [bValue, setBValue] = useState<number | null>(null);
  const [hiperboost, setHiperboost] = useState<boolean>(false);
  const [sobel, setSobel] = useState<boolean>(false);
  const [maskSize, setMaskSize] = useState<number>(3);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const shouldDisableApplyFilterButton = () => {
    if (!firstFileUrl) {
      return true;
    }
    
    if (firstFileUrl && filterToApply === 'none') {
      return true;
    }

    if (['compression', 'expansion'].includes(filterToApply) && (aValue === null || bValue === null)) {
      return true;
    }

    if (filterToApply === 'add-two-images' && !secondFileUrl) {
      return true;
    }

    return false;
  }

  const resetForm = () => {
    setFirstFileName(null);
    setFirstFileUrl(null);
    setSecondFileName(null);
    setSecondFileUrl(null);
    setAlteredFileName(null);
    setAlteredFileUrl(null);
    setGamma(1);
    setMergePercentage(0);
    setFilterToApply('none');
    setAValue(null);
    setBValue(null);
    setScaleFactor(2);
    setHiperboost(false);
    setSobel(false);
    setMaskSize(3);
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
    
    setFirstFileUrl(`${BASE_URL}/images/uploaded/${firstFileName}`);
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
    setSecondFileUrl(`${BASE_URL}/images/uploaded/${secondFileName}?_cache=${Date.now()}`);
  }, [secondFileName]);

  const handleAValue = async (event: ChangeEvent<HTMLInputElement>) => {
    const inputedAValue = event.target.value;
    if (!inputedAValue) {
      return;
    }
    setAValue(parseFloat(inputedAValue));
  }

  const handleBValue = async (event: ChangeEvent<HTMLInputElement>) => {
    const inputedBValue = event.target.value;
    if (!inputedBValue) {
      return;
    }
    setBValue(parseFloat(inputedBValue));
  }

  const handleOnChangeScaleFactor = async (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedScale = event.target.value;
    if (!selectedScale) {
      return;
    }
    setScaleFactor(parseInt(selectedScale));
  };

  const handleOnSubmitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!filterToApply || !firstFileName) {
      return;
    }

    const filteredfileName = await applyFilter(
      filterToApply,
      firstFileName,
      secondFileName,
      gamma,
      aValue,
      bValue,
      scaleFactor,
      mergePercentage,
      hiperboost,
      sobel,
      maskSize
    );

    if (!filteredfileName) {
      return;
    }

    setAlteredFileName(filteredfileName);

    if (['nearest-neighbor-resampling', 'bilinear-interpolation-resampling'].includes(filterToApply) && scaleFactor === 4) {
      openModal();
    }
  }

  useEffect(() => {
    setAlteredFileUrl(`${BASE_URL}/images/filtered/${alteredFileName}?_cache=${Date.now()}`)
  }, [alteredFileName]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    setAlteredFileName(null);
    setAlteredFileUrl(null);
  }, [filterToApply, aValue, bValue, mergePercentage, sobel, hiperboost, scaleFactor, gamma, maskSize]);

  return (
    <div className="w-full h-full flex flex-col items-center gap-4">
      <div className="bg-rose-400 text-white flex items-center justify-between w-full h-16 px-6 rounded-md shadow-md">
        <span className="font-bold">PDI - Project Photoshop</span>
      </div>

      <div className="w-full flex items-center justify-end pr-10">
        <div>
          <span className="font-bold cursor-pointer drop-shadow-lg" onClick={resetForm}>limpar tudo</span>
        </div>
      </div>
      <div className="grid grid-cols-6 gap-6 h-5/6">
        <form action="" className="bg-white p-6 flex flex-col justify-between rounded-lg shadow-lg" onSubmit={handleOnSubmitForm}>
          <div className="flex flex-col gap-4 h-3/4">
          <h1 className="font-bold">Filtros</h1>
            <select
              className="py-3 px-4 border border-solid border-rose-400 rounded-lg"
              name="filters"
              id="filters"
              value={filterToApply}
              onChange={handleOnChangeFilter}
              disabled={!firstFileUrl}
            >
              <option value="none" disabled hidden>Escolha</option>
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
              <option value="mean">Média</option>
              <option value="median">Mediana</option>
              <option value="mode">Moda</option>
              <option value="laplace">Laplace</option>
              <option value="prewitt_sobel">Prewitt</option>
              <option value="min">Min</option>
              <option value="max">Max</option>
            </select>

            {['mean', 'median', 'mode'].includes(filterToApply) && (
              <select
                name="masks"
                id="masks"
                className="py-3 px-4 border border-solid border-rose-400 rounded-lg"
                defaultValue={'none'}
                onChange={e => setMaskSize(parseInt(e.target.value))}
              >
                <option value="3">3x3</option>
                <option value="5">5x5</option>
                <option value="9">9x9</option>
                <option value="11">11x11</option>
              </select>
            )}

            {filterToApply === 'prewitt_sobel' && (
              <div className="flex items-center gap-2">
                <label className="font-bold drop-shadow-lg" htmlFor="sobel">Adicionar sobel</label>
                <input id="sobel" type="checkbox" className="accent-rose-400" onChange={e => setSobel(e.target.checked)} />
              </div>
            )}

            {filterToApply === 'laplace' && (
              <div className="flex items-center gap-2">
                <label className="font-bold drop-shadow-lg" htmlFor="hiperBosst">Adicionar hiperboost</label>
                <input id="hiperBosst" type="checkbox" className="accent-rose-400" onChange={e => setHiperboost(e.target.checked)} />
              </div>
            )}

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
                    min={0.01}
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
                  <p className="font-bold">{mergePercentage}%</p>
                  <input
                    className="w-full accent-rose-400"
                    id="mergePercentage"
                    value={mergePercentage}
                    onChange={e => setMergePercentage(parseInt(e.target.value))}
                    disabled={!secondFileUrl}
                    type="range"
                    min={0}
                    max={100}
                  />
                  <p className="font-bold">{Math.abs(mergePercentage - 100)}%</p>
                </div>
              </div>
            )}

            {['expansion', 'compression'].includes(filterToApply) && (
              <div>
                <div className="flex flex-col gap-2">
                  <span className="font-bold drop-shadow-lg">{filterToApply === 'expansion' ? 'g = a*r + b' : 'g = r / a – b'}</span>
                  <input
                    className="border border-solid border-black rounded-lg px-2"
                    type="number"
                    name="a"
                    id="a"
                    placeholder="A"
                    step="0.1"
                    min='0'
                    max="10"
                    onChange={handleAValue}
                  />
                  <input
                    className="border border-solid border-black rounded-lg px-2"
                    type="number"
                    name="b"
                    id="b"
                    placeholder="B"
                    min='-50'
                    max="50"
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
                <option value="2" disabled hidden>Escalas</option>
                <option value="2">512x512</option>
                <option value="4">1024x1024</option>
              </select>
            )}
          </div>

          <div className="w-full flex items-center justify-end">
            <button
              className={`py-2 px-4 rounded-lg text-white ${shouldDisableApplyFilterButton() ? 'bg-gray-400' : 'bg-rose-400'}`}
              type="submit"
              disabled={shouldDisableApplyFilterButton()}
            >
              Aplicar
            </button>
          </div>
        </form>

        <div className="flex items-center justify-center gap-4 col-span-5 border-dashed border-2 border-rose-400">
          <ImageUploader fileName={firstFileName || ''} fileUrl={firstFileUrl} handleSelectedFile={handleFirstFileChange}></ImageUploader>

          {filterToApply === 'add-two-images' && (
            <ImageUploader fileName={secondFileName || ''} fileUrl={secondFileUrl} handleSelectedFile={handleSecondFile}></ImageUploader>
          )}

          {alteredFileUrl && alteredFileName && scaleFactor !== 4 && (
            <div className="min-w-[256px] min-h-[256px] p-2 flex items-center justify-center border-dashed border border-rose-400 rounded-md">
              <ImageInformation context="filtered">
                <Image id={alteredFileName} src={alteredFileUrl} alt={'altered image'}></Image>
              </ImageInformation>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {alteredFileUrl && (
          <div>
            <img src={alteredFileUrl} alt="filteredImage" />
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Editor;
