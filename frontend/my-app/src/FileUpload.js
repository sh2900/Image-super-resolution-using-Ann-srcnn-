import React, { useState } from 'react';

function FileUpload() {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [processedImages, setProcessedImages] = useState([]); // To store processed image URLs

  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
  };

  const handleUpload = async () => {
    if (!selectedFiles) {
      alert('Please select files first!');
      return;
    }

    const formData = new FormData();
    for (const file of selectedFiles) {
      formData.append('images', file);
    }

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Files uploaded:', result);
        // Set the processed image URLs
        setProcessedImages(result.processed_images);
      } else {
        console.error('Failed to upload files');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Upload Files</h1>
      <input type="file" multiple onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>

      {/* Display the processed images */}
      <div style={{ marginTop: '20px' }}>
        {processedImages.length > 0 && (
          <div>
            <h3>Processed Images:</h3>
            {processedImages.map((imageUrl, index) => (
              <img key={index} src={imageUrl} alt={`Processed ${index}`} style={{ width: '200px', margin: '10px' }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUpload;
