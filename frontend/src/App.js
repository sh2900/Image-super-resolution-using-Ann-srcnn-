import React, { useState, useEffect } from 'react';

function App() {
  useEffect(() => {
    document.title = "Image Superresolution App";
  }, []);

  const [originalImages, setOriginalImages] = useState([]);
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      setError('Please select files to upload.');
      return;
    }

    setIsLoading(true);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const invalidFiles = Array.from(files).filter(file => !allowedTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setError('Please upload only JPEG, PNG, JPG, or WebP images.');
      setIsLoading(false);
      return;
    }

    setOriginalImages(Array.from(files).map(file => URL.createObjectURL(file)));

    try {
      const processedImages = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('image', file);

        console.log('Sending request to server...');
        const response = await fetch('http://localhost:5000/srcnn', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Server response:', data);

        if (data.processed) {
          processedImages.push(data.processed);
        }
      }

      if (processedImages.length > 0) {
        console.log('Setting processed images:', processedImages);
        setImages(processedImages);
      } else {
        console.error('No processed images in response');
        setError('No processed images received from server');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Error uploading files: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', textAlign: 'center', marginTop: '50px' }}>
      <h1>Image Superresolution App</h1>
      <input
        type="file"
        accept="image/jpeg, image/png, image/jpg, image/webp"
        multiple
        onChange={handleUpload}
        style={{ marginBottom: '20px' }}
      />
      <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
        Accepted formats: JPEG, PNG, JPG, WebP
      </p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {isLoading && <p style={{ color: "blue" }}>Processing images, please wait...</p>}

      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
        {originalImages.map((originalImage, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            gap: '20px', 
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '10px',
            margin: '10px 0'
          }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ color: '#666', marginBottom: '10px' }}>Low Resolution Image</h3>
              <img
                src={originalImage}
                alt={`Original ${index}`}
                style={{ 
                  width: '300px', 
                  height: 'auto', 
                  borderRadius: '10px', 
                  border: '2px solid #6200ea' 
                }}
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <h3 style={{ color: '#666', marginBottom: '10px' }}>Super Resolution Image</h3>
              {images[index] && (
                <img
                  src={images[index]}
                  alt={`Processed ${index}`}
                  style={{ 
                    width: '300px', 
                    height: 'auto', 
                    borderRadius: '10px', 
                    border: '2px solid #6200ea' 
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
