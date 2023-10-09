const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file, file.name);

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/images/upload`, {
      method: 'POST',
      body: formData,
    });

    const { data } = await response.json();
    return data.fileName;

  } catch (error) {
    console.error('Error uploading image:', error);
  }
};

const applyFilter = async (
  filterToApply: string,
  fileName: string,
  secondFileName: string | null,
  gamma?: number,
  aValue?: number | null,
  bValue?: number | null,
  scaleFactor?: number,
  mergePercentage?: number,
  hiperboost?: boolean,
  sobel?: boolean,
  maskSize?: number | '',
) => {
  const body = {
    filterToApply,
    fileName,
    ...(secondFileName && { secondFileName }),
    ...(gamma !== undefined && { gamma }),
    ...(aValue !== undefined && { aValue }),
    ...(bValue !== undefined && { bValue }),
    ...(scaleFactor !== undefined && { scaleFactor }),
    ...(mergePercentage !== undefined && { mergePercentage }),
    ...(hiperboost !== undefined && { hiperboost }),
    ...(sobel !== undefined && { sobel }),
    ...(maskSize !== undefined && { maskSize }),
  };
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/images/filter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const { data } = await response.json();
    return data.fileName;
  } catch (error) {
    console.error('Erro applying filter', error);
  }
};

const generateHistogram = async (fileName: string, from: string = 'uploaded_images') => {
  const body = {
    fileName,
    from
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/images/histogram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
    const { data } = await response.json();
    return `${import.meta.env.VITE_API_BASE_URL}/images/histogram/${data.fileName}?_cache=${Date.now()}`
  } catch (error) {
    console.log(error)
  }
};

const equalizeImage = async (fileName: string,  from: string = 'uploaded_images') => {
  const body = {
    fileName,
    from
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/images/equalize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
    const { data } = await response.json();
    
    return data.fileName
  } catch (error) {
    console.log(error)
  }
};


export {
  uploadFile,
  applyFilter,
  generateHistogram,
  equalizeImage
}