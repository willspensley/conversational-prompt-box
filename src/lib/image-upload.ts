
// Utility functions for handling image uploads

/**
 * Opens a file selection dialog for images
 * @returns Promise with array of selected files
 */
export const selectImagesFromDevice = (): Promise<File[]> => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';
    
    input.onchange = () => {
      const files = Array.from(input.files || []);
      resolve(files);
    };
    
    input.click();
  });
};

/**
 * Opens the device camera for taking photos
 * @returns Promise with array of captured photos as Files
 */
export const takePhotosFromCamera = (): Promise<File[]> => {
  return new Promise((resolve, reject) => {
    // Check if MediaDevices is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      reject(new Error('Camera not supported on this device or browser'));
      return;
    }
    
    // Create elements for camera capture
    const videoElement = document.createElement('video');
    const canvasElement = document.createElement('canvas');
    const containerDiv = document.createElement('div');
    const captureButton = document.createElement('button');
    const closeButton = document.createElement('button');
    const doneButton = document.createElement('button');
    
    // Configure container
    containerDiv.style.position = 'fixed';
    containerDiv.style.top = '0';
    containerDiv.style.left = '0';
    containerDiv.style.width = '100%';
    containerDiv.style.height = '100%';
    containerDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    containerDiv.style.zIndex = '9999';
    containerDiv.style.display = 'flex';
    containerDiv.style.flexDirection = 'column';
    containerDiv.style.alignItems = 'center';
    containerDiv.style.justifyContent = 'center';
    
    // Configure video
    videoElement.style.maxWidth = '100%';
    videoElement.style.maxHeight = '70vh';
    videoElement.autoplay = true;
    
    // Configure buttons
    captureButton.textContent = 'Take Photo';
    captureButton.style.margin = '10px';
    captureButton.style.padding = '10px 20px';
    captureButton.style.backgroundColor = '#ffffff';
    captureButton.style.border = 'none';
    captureButton.style.borderRadius = '4px';
    captureButton.style.cursor = 'pointer';
    
    closeButton.textContent = 'Cancel';
    closeButton.style.margin = '10px';
    closeButton.style.padding = '10px 20px';
    closeButton.style.backgroundColor = '#ff4444';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    
    doneButton.textContent = 'Done (0)';
    doneButton.style.margin = '10px';
    doneButton.style.padding = '10px 20px';
    doneButton.style.backgroundColor = '#44ff44';
    doneButton.style.color = 'black';
    doneButton.style.border = 'none';
    doneButton.style.borderRadius = '4px';
    doneButton.style.cursor = 'pointer';
    
    // Thumbnail container
    const thumbnailContainer = document.createElement('div');
    thumbnailContainer.style.display = 'flex';
    thumbnailContainer.style.flexWrap = 'wrap';
    thumbnailContainer.style.justifyContent = 'center';
    thumbnailContainer.style.margin = '10px';
    thumbnailContainer.style.maxHeight = '100px';
    thumbnailContainer.style.overflowY = 'auto';
    
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.width = '100%';
    
    // Add elements to DOM
    buttonContainer.appendChild(closeButton);
    buttonContainer.appendChild(captureButton);
    buttonContainer.appendChild(doneButton);
    containerDiv.appendChild(videoElement);
    containerDiv.appendChild(thumbnailContainer);
    containerDiv.appendChild(buttonContainer);
    document.body.appendChild(containerDiv);
    
    const capturedPhotos: File[] = [];
    
    // Start camera
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        videoElement.srcObject = stream;
        
        // Capture photo
        captureButton.onclick = () => {
          // Set canvas dimensions to match video
          canvasElement.width = videoElement.videoWidth;
          canvasElement.height = videoElement.videoHeight;
          
          // Draw video frame to canvas
          const ctx = canvasElement.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
            
            // Convert to file
            canvasElement.toBlob((blob) => {
              if (blob) {
                const timestamp = new Date().toISOString();
                const file = new File([blob], `camera-photo-${timestamp}.jpg`, { type: 'image/jpeg' });
                capturedPhotos.push(file);
                
                // Update done button text
                doneButton.textContent = `Done (${capturedPhotos.length})`;
                
                // Create thumbnail
                const thumbnail = document.createElement('img');
                thumbnail.src = URL.createObjectURL(blob);
                thumbnail.style.width = '60px';
                thumbnail.style.height = '60px';
                thumbnail.style.objectFit = 'cover';
                thumbnail.style.margin = '5px';
                thumbnail.style.border = '2px solid white';
                thumbnailContainer.appendChild(thumbnail);
              }
            }, 'image/jpeg', 0.8);
          }
        };
        
        // Close camera
        const cleanup = () => {
          // Stop all video streams
          const stream = videoElement.srcObject as MediaStream;
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          
          // Remove elements
          document.body.removeChild(containerDiv);
        };
        
        closeButton.onclick = () => {
          cleanup();
          resolve([]);
        };
        
        doneButton.onclick = () => {
          cleanup();
          resolve(capturedPhotos);
        };
      })
      .catch((error) => {
        document.body.removeChild(containerDiv);
        reject(error);
      });
  });
};

/**
 * Converts a File to a data URL
 */
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
