"""Prepare display-size WebPs and existing progress-reveal ghost variants."""
from pathlib import Path
from PIL import Image, ImageOps

source = Path(__file__).resolve().parent
for name in ('back-garden', 'spare-room'):
    image = Image.open(source / f'{name}.png').convert('RGBA')
    image.thumbnail((720, 720), Image.Resampling.LANCZOS)
    target = source.parent / 'public' / 'art'
    image.save(target / f'{name}.webp', quality=90)
    ghost = ImageOps.grayscale(image).convert('RGBA')
    ghost.putalpha(image.getchannel('A').point(lambda a: round(a * .3)))
    ghost.save(target / f'{name}-ghost.webp', quality=90)
