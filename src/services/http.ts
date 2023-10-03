const BASE_URL = 'http://127.0.0.1:5000/api/v1';

const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file, file.name);

  try {
    const response = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    const { file_name } = await response.json();
    return file_name;

  } catch (error) {
    console.error('Error uploading image:', error);
  }
};

const applyFilter = async (
  filterToApply: string,
  fileName: string,
  secondFileName?: string,
  gamma?: number,
  aValue?: number,
  bValue?: number,
  scaleFactor?: number
) => {
  const body = {
    filterToApply,
    fileName,
    ...(secondFileName && { secondFileName }),
    ...(gamma !== undefined && { gamma }),
    ...(aValue !== undefined && { aValue }),
    ...(bValue !== undefined && { bValue }),
    ...(scaleFactor !== undefined && { scaleFactor }),
  };

  try {
    const response = await fetch(`${BASE_URL}/filter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const { file_name } = await response.json();
    return `${BASE_URL}/altered/${file_name}`
  } catch (error) {
    console.error('Erro applying filter', error);
  }
};

const generateHistogram = async (fileName: string) => {
  const body = {
    fileName
  }

  try {
    const response = await fetch(`${BASE_URL}/histogram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
    const { data } = await response.json();
    return `${BASE_URL}/histogram/${data.fileName}`
  } catch (error) {
    console.log(error)
  }
};

export {
  uploadFile,
  applyFilter,
  generateHistogram
}