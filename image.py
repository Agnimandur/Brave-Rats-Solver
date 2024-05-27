import PIL
from PIL import Image
import os, sys
path = "src/images/"
dirs = os.listdir( path )
def resize(x):
    for item in dirs:
        img = Image.open(path + item)
        newSize = (int(img.size[0]*x),int(img.size[1]*x))
        img = img.resize(newSize)
        img.save(path + item)