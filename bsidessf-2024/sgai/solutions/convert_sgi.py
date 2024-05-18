from PIL import Image

# Open the SGI file
sgi_image = Image.open('sgai/sgai.sgi')
sgi_image.show()

# Save it as bmp format
sgi_image.save('output.bmp', format='BMP')
