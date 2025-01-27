import sys
import os
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
import numpy as np

class SuperResolutionModel(nn.Module):
    def __init__(self, num_channels=3):
        super(SuperResolutionModel, self).__init__()
        self.conv1 = nn.Conv2d(num_channels, 64, kernel_size=5, padding=2)
        self.conv2 = nn.Conv2d(64, 32, kernel_size=3, padding=1)
        self.conv3 = nn.Conv2d(32, num_channels, kernel_size=3, padding=1)
        self.relu = nn.ReLU()

    def forward(self, x):
        x = self.relu(self.conv1(x))
        x = self.relu(self.conv2(x))
        x = self.conv3(x)
        x = F.interpolate(x, scale_factor=4, mode='bicubic', align_corners=False)
        return x

def process_image(input_path, output_path):
    try:
        print(f"Processing image: {input_path}")
        print(f"Output path: {output_path}")
        
        # Check if input file exists
        if not os.path.exists(input_path):
            print(f"Error: Input file does not exist: {input_path}")
            return False

        # Load and prepare image
        image = Image.open(input_path).convert('RGB')
        print(f"Image loaded successfully, size: {image.size}")
        
        # Resize to processing size (64x64)
        lr_size = (64, 64)
        image = image.resize(lr_size, Image.BICUBIC)
        print("Image resized successfully")
        
        # Convert to numpy array and normalize
        image_np = np.array(image)
        image_normalized = (image_np / 255.0 - 0.5) / 0.5
        
        # Convert to tensor
        image_tensor = torch.FloatTensor(image_normalized).permute(2, 0, 1).unsqueeze(0)
        print("Image converted to tensor successfully")
        
        # Load model
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Using device: {device}")
        
        model = SuperResolutionModel()
        model_path = 'srcnn_model.pth'
        
        if not os.path.exists(model_path):
            print(f"Error: Model file not found: {model_path}")
            return False
            
        print(f"Loading model from: {os.path.abspath(model_path)}")
        model.load_state_dict(torch.load(model_path, map_location=device))
        model.to(device)
        model.eval()
        print("Model loaded successfully")
        
        # Process image
        with torch.no_grad():
            image_tensor = image_tensor.to(device)
            output = model(image_tensor)
            print("Image processed successfully")
            
        # Convert back to image
        output = output.cpu().squeeze(0).permute(1, 2, 0).numpy()
        output = (output * 0.5 + 0.5).clip(0, 1)
        output = (output * 255).astype(np.uint8)
        
        # Save result
        output_image = Image.fromarray(output)
        output_image.save(output_path)
        print(f"Output image saved successfully to: {output_path}")
        
        return True
        
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python srcnn_inference.py input_path output_path")
        sys.exit(1)
        
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    
    success = process_image(input_path, output_path)
    sys.exit(0 if success else 1) 