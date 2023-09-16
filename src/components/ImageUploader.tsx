import { ChangeEvent, FormEvent, useState } from "react";

function ImageUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [uploadedFileUrl, setUploadedFileUrl] = useState('')
  const [fileUrl, setFileurl] = useState('')

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;

    if (!fileList) {
      console.log('ue')
      return;
    }

    const uploadedFile: File = fileList[0];
    setFile(uploadedFile);
    setFileName(uploadedFile.name);
    setFileurl(URL.createObjectURL(uploadedFile))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file, fileName);
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/v1/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setUploadedFileUrl(`http://127.0.0.1:5000${data.image_url}`);
      console.log(uploadedFileUrl);
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

      <div>
      {fileUrl && (
        <img src={fileUrl} alt="Uploaded" />
      )}
      </div>
    </>
  );
}

export default ImageUploader;