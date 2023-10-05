import { ImgHTMLAttributes } from "react";

export type ImageProps = ImgHTMLAttributes<HTMLImageElement>

function Image({ ...props }: ImageProps) {
  return <img { ...props } />
}

export default Image; 