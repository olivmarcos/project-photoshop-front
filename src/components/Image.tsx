import { ImgHTMLAttributes } from "react";

type ImageProps = ImgHTMLAttributes<HTMLImageElement>

export function Image({ ...props }: ImageProps) {
  return <img { ...props } />
}
