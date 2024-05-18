import cv2
import numpy as np

# Load the SGI file
image = cv2.imread('output.bmp', cv2.IMREAD_UNCHANGED)

# Check if the image was loaded successfully
if image is None:
    print("Error: Unable to load the image.")
else:
   # Check if the image has an alpha channel
    if image.shape[2] == 4:
        # Split the image into RGBA channels
        b, g, r, a = cv2.split(image)
        
        # Save each channel as a separate image
        cv2.imwrite('red_channel.png', r)
        cv2.imwrite('green_channel.png', g)
        cv2.imwrite('blue_channel.png', b)
        cv2.imwrite('alpha_channel.png', a)
    else:
        # Split the image into RGBA channels
        b, g, r = cv2.split(image)
        
        # Save each channel as a separate image
        cv2.imwrite('red_channel.png', r)
        cv2.imwrite('green_channel.png', g)
        cv2.imwrite('blue_channel.png', b)
        print("Image does not have an alpha channel.")