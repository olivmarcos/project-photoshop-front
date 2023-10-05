interface ImageProps {
  fileUrl: string,
  altText: string
}

function Image({ fileUrl, altText }: ImageProps) {
  return <img src={fileUrl} alt={altText} />
}

export default Image;