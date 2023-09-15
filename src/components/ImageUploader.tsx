import { ChangeEvent, FormEvent, useState } from "react";

function ImageUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;

    if (!fileList) {
      console.log('ue')
      return;
    }

    const uploadedFile: File = fileList[0];
    setFile(uploadedFile);
    setFileName(uploadedFile.name);
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);
    
    try {
      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData,
      });

      console.log(response);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <br />
        <br />
        <button type="submit">Upload Image</button>
      </form>
    </>
  );
}

export default ImageUploader;