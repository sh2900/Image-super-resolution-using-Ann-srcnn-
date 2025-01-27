try:
    import torch
    print("PyTorch version:", torch.__version__)
except ImportError:
    print("PyTorch is not installed")

try:
    import torchvision
    print("Torchvision version:", torchvision.__version__)
except ImportError:
    print("Torchvision is not installed")

try:
    from PIL import Image
    print("Pillow version:", Image.__version__)
except ImportError:
    print("Pillow is not installed")

try:
    import numpy as np
    print("NumPy version:", np.__version__)
except ImportError:
    print("NumPy is not installed")

print("Test complete!")
