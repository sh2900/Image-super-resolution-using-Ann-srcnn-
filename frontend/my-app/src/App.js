import React, { useState } from 'react';
import './App.css';

function App() {
  const [showMain, setShowMain] = useState(false);
  const [images, setImages] = useState([]);
  const [originalImages, setOriginalImages] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      setError('Please select files to upload.');
      return;
    }

    setIsLoading(true);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const invalidFiles = Array.from(files).filter(file => !allowedTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setError('Please upload only JPEG or PNG images.');
      setIsLoading(false);
      return;
    }

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('image', file);

        console.log('Sending request to server...');
        const response = await fetch('http://localhost:5000/srcnn', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received data from server:', data);

        if (data.processed) {
          console.log('Adding processed image URL:', data.processed);
          setImages(prevImages => [...prevImages, data.processed]);
          setOriginalImages(prevOriginalImages => [...prevOriginalImages, data.original]);
        }
      }

      console.log('Setting processed images:', images);
      setError('');
    } catch (err) {
      console.error('Upload error:', err);
      setError('Error uploading files: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showMain) {
    return (
      <div className="cover-page">
        <div className="cover-content">
          <h1>Image Super Resolution</h1>
          <h2>Enhance Image Quality Using Deep Learning</h2>
          <p>Transform your low-resolution images into high-quality, detailed pictures using advanced AI technology.</p>
          <button className="enter-button" onClick={() => setShowMain(true)}>
            Get Started
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Super Resolution Using SRCNN</h1>
        <p>Upload your image to enhance its resolution using SRCNN</p>
      </header>

      <div className="upload-section">
        <div className="file-info">
          <h3>Supported File Types:</h3>
          <ul>
            <li>JPEG (.jpg, .jpeg)</li>
            <li>PNG (.png)</li>
            <li>WebP (.webp)</li>
          </ul>
          <p>Maximum file size: 10MB</p>
        </div>
        
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          multiple
        />
        <i class="bi bi-upload"></i>
        {isLoading && <p className="processing">Processing...</p>}
        {error && <p className="error">{error}</p>}
      </div>

      <div className="images-container">
        {originalImages.map((originalImage, index) => (
          <div key={index} className="image-comparison">
            <div className="image-box">
              <h3>Low Resolution Image</h3>
              <div className="image-wrapper">
                <img
                  src={images[index]}
                  alt="Original"
                  className="comparison-image"
                />
              </div>
            </div>

            <div className="image-box">
              <h3>Super Resolution Image</h3>
              <div className="image-wrapper">
                <img
                  src={originalImage}
                  alt="Super Resolution"
                  className="comparison-image"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
