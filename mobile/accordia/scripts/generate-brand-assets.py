"""Rasterize the existing website's Lucide ShieldCheck mark; ISC notice included.
Requires Pillow/CairoSVG. This is not a newly invented official logo.
"""
from pathlib import Path
import json
import cairosvg
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
root = Path(__file__).resolve().parents[1]
paths = ['M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z', 'm9 12 2 2 4-4']
svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + ''.join('<path d="'+p+'"/>' for p in paths) + '</svg>'
mark = Image.open(BytesIO(cairosvg.svg2png(bytestring=svg.encode(), output_width=768, output_height=768))).convert('RGBA')
mark.save(root/'assets/brand/shield-white.png')
icon = Image.new('RGB',(1024,1024),'#064cec'); scaled=mark.resize((620,620));icon.paste(scaled,(202,202),scaled)
for name,size in [('mdpi',48),('hdpi',72),('xhdpi',96),('xxhdpi',144),('xxxhdpi',192)]:
 p=root/f'android/app/src/main/res/mipmap-{name}/ic_launcher.png';p.parent.mkdir(parents=True,exist_ok=True);icon.resize((size,size)).save(p)
contents=json.loads((root/'ios/Runner/Assets.xcassets/AppIcon.appiconset/Contents.json').read_text())
for item in contents['images']:
 if 'filename' not in item:continue
 size=round(float(item['size'].split('x')[0])*float(item['scale'].replace('x','')))
 icon.resize((size,size)).save(root/'ios/Runner/Assets.xcassets/AppIcon.appiconset'/item['filename'])
fontpath='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
for scale in [1,2,3]:
 image=Image.new('RGBA',(240*scale,180*scale),(0,0,0,0)); logo=mark.resize((88*scale,88*scale));image.paste(logo,(76*scale,6*scale),logo)
 draw=ImageDraw.Draw(image);font=ImageFont.truetype(fontpath,30*scale);draw.text((120*scale,112*scale),'Accordia',font=font,fill='white',anchor='mt')
 image.save(root/f'ios/Runner/Assets.xcassets/LaunchImage.imageset/LaunchImage{"@"+str(scale)+"x" if scale>1 else ""}.png')
