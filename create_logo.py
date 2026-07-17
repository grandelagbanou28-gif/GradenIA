from PIL import Image, ImageDraw, ImageFont
import math

SIZE = 1024
img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

bg_color = (16, 163, 127)
draw.rounded_rectangle([0, 0, SIZE, SIZE], radius=200, fill=bg_color)

center = SIZE // 2

points = []
for i in range(8):
    angle = math.radians(45 * i - 90)
    x = center + 280 * math.cos(angle)
    y = center + 280 * math.sin(angle)
    points.append((x, y))

inner_points = []
for i in range(8):
    angle = math.radians(45 * i - 90 + 22.5)
    x = center + 180 * math.cos(angle)
    y = center + 180 * math.sin(angle)
    inner_points.append((x, y))

star = []
for i in range(8):
    star.append(points[i])
    star.append(inner_points[i])

draw.polygon(star, fill=(255, 255, 255))

draw.ellipse([center - 90, center - 90, center + 90, center + 90], fill=bg_color)
draw.ellipse([center - 55, center - 55, center + 55, center + 55], fill=(255, 255, 255))

try:
    font_large = ImageFont.truetype("arial.ttf", 140)
    font_small = ImageFont.truetype("arial.ttf", 80)
except:
    try:
        font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 140)
        font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 80)
    except:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()

text_img = Image.new('RGBA', (SIZE, 400), (0, 0, 0, 0))
text_draw = ImageDraw.Draw(text_img)

text1 = "Graden"
text2 = "IA"

bbox1 = text_draw.textbbox((0, 0), text1, font=font_large)
w1 = bbox1[2] - bbox1[0]
text_draw.text(((SIZE - w1) // 2, 20), text1, fill=(255, 255, 255), font=font_large)

bbox2 = text_draw.textbbox((0, 0), text2, font=font_small)
w2 = bbox2[2] - bbox2[0]
text_draw.text(((SIZE - w2) // 2, 180), text2, fill=(200, 240, 230), font=font_small)

img.paste(text_img, (0, SIZE - 380), text_img)

img.save("logo.png", "PNG")
print("Logo créé : logo.png")
