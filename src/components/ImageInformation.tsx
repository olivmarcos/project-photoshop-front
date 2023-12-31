import React, { HTMLAttributes, ReactNode, useEffect, useState } from "react";
import { equalizeImage, generateHistogram } from "../services/http";
import { Image as ImageComponent } from "./Image";
import Modal from "./Modal";

interface MyDivProps extends HTMLAttributes<HTMLDivElement> {
  context?: string;
  children?: ReactNode;
}

function ImageInformation({ children, context, ...props }: MyDivProps) {
  const [pixelValue, setPixelValue] = useState<number | null>(null);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const [imageId, setImageId] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [histogramFileUrl, setHistogramFileUrl] = useState<string | null>(null);
  const [equalizedFileHistogramUrl, setEqualizedFileHistogramUrl] = useState<string | null>(null);
  const [equalizedFileUrl, setEqualizedFileUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && 'src' in child.props) {
        setImageUrl(child.props.src);
        setImageId(child.props.id);
      }
    });
  }, [children]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMouseHover = (e: any) => {
    if (!imageUrl) {
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.src = imageUrl;
    image.id = imageId

    if (!ctx) {
      return;
    }

    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);

      const x = e.nativeEvent.offsetX;
      const y = e.nativeEvent.offsetY;

      const pixelData = ctx.getImageData(x, y, 1, 1).data;
      const pixelValue = pixelData[0];
      // const rgb = `R: ${pixelData[0]}, G: ${pixelData[1]}, B: ${pixelData[2]}`;
      const coordinates = { x, y };

      setPixelValue(pixelValue);
      setCoordinates({ x: coordinates.x, y: coordinates.y });
    };
  }

  const getFileLocationByContext = () => {
    let location = 'equalized_images';

    if (context === 'filtered') {
      location = 'filtered_images';
    }

    if (context === 'upload') {
      location = 'uploaded_images';
    }

    return location;
  }

  const handleOnClikGenerateHistogram = async () => {
    setHistogramFileUrl(null);
    if (!imageId) {
      return;
    }

    const location = getFileLocationByContext();
    const histogramfilePath = await generateHistogram(imageId, location);

    if (!histogramfilePath) {
      return;
    }

    setHistogramFileUrl(histogramfilePath);
    openModal();
  }

  const handleEqualizeImage = async () => {
    if (!imageId) {
      return;
    }

    let location = getFileLocationByContext();
    const equalizedImageName = await equalizeImage(imageId, location);

    if (!equalizedImageName) {
      return;
    }

    context = 'equalize';
    location = getFileLocationByContext();

    setEqualizedFileUrl(`${import.meta.env.VITE_API_BASE_URL}/images/equalized/${equalizedImageName}?_cache=${Date.now()}`);

    const equalizedImageHistogram = await generateHistogram(equalizedImageName, location);

    if (!equalizedImageHistogram) {
      return;
    }

    setEqualizedFileHistogramUrl(equalizedImageHistogram);
  }

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setHistogramFileUrl(null);
    setEqualizedFileUrl(null);
    setEqualizedFileHistogramUrl(null);
  };

  return (
    <>
      <div className="flex flex-col relative">
        <span className="font-bold absolute -top-10 left-0 bg-transparent drop-shadow-lg">({coordinates.x},{coordinates.y}) = {pixelValue}</span>
        <div {...props} onMouseMove={handleMouseHover}>
          {children}
        </div>
        <button
          onClick={handleOnClikGenerateHistogram}
          className="px-3 border border-solid border-rose-400 text-rose-400 hover:bg-rose-400 hover:text-white absolute top-[108%]">
          Gerar histograma
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {histogramFileUrl && imageUrl && (
          <div className={`w-full h-full flex flex-col items-center gap-6 ${equalizedFileUrl && equalizedFileHistogramUrl ? 'mt-36' : ''}`}>
            <div className="flex gap-2 items-center justify-center">
              <div>
                <ImageComponent src={imageUrl} alt={imageId}></ImageComponent>
              </div>
              <div>
                <ImageComponent src={histogramFileUrl} alt={'image histogram'}></ImageComponent>
              </div>
            </div>

            <button className={`px-3 border border-solid border-rose-400 text-rose-400 hover:bg-rose-400 hover:text-white ${equalizedFileUrl && equalizedFileHistogramUrl ? 'invisible' : ''}`}
              onClick={handleEqualizeImage}>
              Equalizar imagem
            </button>

            {equalizedFileUrl && equalizedFileHistogramUrl && (
              <div>
                <hr className="border border-solid border-gray-200" />
                <div className="flex gap-2 items-center justify-center">
                  <div>
                    <ImageComponent src={equalizedFileUrl} alt='equalized image'></ImageComponent>
                  </div>
                  <div>
                    <ImageComponent src={equalizedFileHistogramUrl} alt={'equalized image histogram'}></ImageComponent>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>

  );
}

export default ImageInformation;
