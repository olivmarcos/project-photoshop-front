import React, { HTMLAttributes, ReactNode, useState } from "react";

interface MyDivProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

function ImageInformation({ children, ...props }: MyDivProps) {
  const [pixelValue, setPixelValue] = useState<number | null>(null);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMouseHover = (e: any) => {
    let foundSrc = '';

    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && 'src' in child.props) {
        foundSrc = child.props.src;
      }
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.src = foundSrc;

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

  return (
    <div className="flex flex-col relative">
      <span className="font-bold absolute -top-10 left-0 bg-transparent drop-shadow-lg">({coordinates.x},{coordinates.y}) = {pixelValue}</span>
      <div {...props} onMouseMove={handleMouseHover}>
        {children}
      </div>
    </div>
  );
}

export default ImageInformation;
