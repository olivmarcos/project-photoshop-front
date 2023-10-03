import { ChangeEvent, FormEvent, useState } from "react";
import ImageUpload from "../components/ImageUpload";
import { applyFilter, generateHistogram, uploadFile } from "../services/http";
import DisplayArea from "../components/DisplayArea";
import Image from "../components/Image";
import Modal from "../components/Modal";

function Editor() {
  const [filterToApply, setFilterToApply] = useState<string>('default');
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [auxFileUrl, setAuxFileUrl] = useState<string | null>(null);
  const [alteredFileUrl, setAlteredFileUrl] = useState<string | null>(null);
  const [scaleFactor, setScaleFactor] = useState<number>(2);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [gamma, setGamma] = useState<number>(1);
  const [aValue, setAValue] = useState(0);
  const [bValue, setBValue] = useState(0);
  const [histogramFileUrl, setHistogramFileUrl] = useState<string | null>(null);

  const resetForm = () => {
    setOriginalFile(null);
    setUploadedFileName(null);
    setAlteredFileUrl(null);
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


  const handleOnChangeFilter = async (event: ChangeEvent<HTMLSelectElement>) => {
    const filterToApply = event.target.value;
    if (!filterToApply) {
      return;
    }
    setFilterToApply(filterToApply);
  }

  const handleOriginalFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) {
      return;
    }

    const selectedFile: File = fileList[0];
    const uploadedFile = await uploadFile(selectedFile);

    if (!uploadedFile) {
      return;
    }

    setOriginalFile(selectedFile);
    setUploadedFileName(uploadedFile);

    if (['nearest-neighbor-resampling', 'bilinear-interpolation-resampling'].includes(filterToApply) && scaleFactor === 4) {
      openModal();
    }
  }

  const getOriginalFileUrl = () => {
    if (!originalFile) {
      return null;
    }

    return URL.createObjectURL(originalFile);
  }

  const handleAuxFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) {
      return;
    }

    const selectedFile: File = fileList[0];
    const uploadedFilePath = await uploadFile(selectedFile);
    if (!uploadedFilePath) {
      return;
    }
    setAuxFileUrl(uploadedFilePath);
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

  const handleOnSubmitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!filterToApply || !uploadedFileName) {
      return;
    }

    const alteredFileName = await applyFilter(filterToApply, uploadedFileName, '', gamma, aValue, bValue, scaleFactor);

    if (!alteredFileName) {
      return;
    }

    setAlteredFileUrl(alteredFileName);
    if (['nearest-neighbor-resampling', 'bilinear-interpolation-resampling'].includes(filterToApply) && scaleFactor === 4) {
      openModal();
    }
  }

  const handleHistogram = async () => {
    if (!uploadedFileName) {
      return;
    }

    const histogramfilePath = await generateHistogram(uploadedFileName);

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
                  disabled={!getOriginalFileUrl()}
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
            className={`text-rose-400 py-2 rounded-lg border border-solid border-rose-400 hover:bg-rose-400 hover:text-white ${getOriginalFileUrl() ? '' : 'hidden'}`}
            onClick={handleHistogram}
          >
            Obter histograma
          </button>

          <div className="w-full flex items-center justify-end">
            <button
              className={`py-2 px-4 rounded-lg text-white ${getOriginalFileUrl() ? 'bg-rose-400' : 'bg-gray-400'}`}
              type="submit"
              disabled={!getOriginalFileUrl()}
            >
              Apply filter
            </button>
          </div>
        </form>

        <div className="flex items-center justify-center gap-4 col-span-5 border-dashed border-2 border-rose-400">
          <ImageUpload fileUrl={getOriginalFileUrl()} handleSelectedFile={handleOriginalFile}></ImageUpload>

          {filterToApply === 'add-two-images' && (
            <ImageUpload fileUrl={auxFileUrl} handleSelectedFile={handleAuxFile}></ImageUpload>
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