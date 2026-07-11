import PyPDF2
import fitz # PyMuPDF
import os

pdf_path = r"C:\Users\ibrad\Downloads\2025.08.28 CI40025-ARC-FL-ZZ-DR-ARC-Milestone 14.pdf"
dest_pdf = r"C:\Users\ibrad\OneDrive\Desktop\portfolios\portfolio #2\projects\belhar-regional-hospital\floorplans\6 - Master Plan - Level Roof.pdf"
dest_webp = r"C:\Users\ibrad\OneDrive\Desktop\portfolios\portfolio #2\projects\belhar-regional-hospital\media\belhar-context-960.webp"

# 1. Extract page 2 (index 1) and save to floorplans
reader = PyPDF2.PdfReader(pdf_path)
print(f"Total pages in Milestone 14: {len(reader.pages)}")

page2 = reader.pages[1]
writer = PyPDF2.PdfWriter()
writer.add_page(page2)

with open(dest_pdf, "wb") as f_out:
    writer.write(f_out)
print(f"Saved extracted page 2 as PDF: {dest_pdf}")

# 2. Render page 2 to WebP image for the cover image
doc = fitz.open(pdf_path)
page = doc.load_page(1) # load page index 1

# Render at a higher resolution (e.g. 2.0x zoom) for clarity, then resize/save
# We can use matrix zoom to render a clean image
zoom = 2.0
mat = fitz.Matrix(zoom, zoom)
pix = page.get_pixmap(matrix=mat)

# Convert to PIL Image and save as WebP
from PIL import Image
img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

# We want to make sure it is saved with a width of 960px or similar to fit the design,
# but the user said: "convert them to webp files without cropping them. use this plan as the cover image"
# Let's save it directly to the media/belhar-context-960.webp path
img.save(dest_webp, "WEBP", quality=85)
print(f"Rendered and saved page 2 as WebP cover image: {dest_webp} ({pix.width}x{pix.height})")
