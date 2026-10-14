"""The night lights and the real cloud cover for the Earth seen from orbit.

  python3 -I scripts/orbit-earth-assets.py <earth-night.jpg> <clouds.png>

Both come with the `three-globe` npm package (example/img/earth-night.jpg, example/clouds/clouds.png):
  - earth-night.jpg: NASA Earth at Night (Black Marble, public domain), 4096 x 2048 — drawn as
    neutral grey lights over a stylised blue-cyan planet;
  - clouds.png: NASA Blue Marble cloud cover (public domain, via turban/webgl-earth's
    fair_clouds_4k.png), 4096 x 2048, the cover in the alpha channel.

Writes to public/assets/earth:
  earth-night-4k.jpg            the city lights alone, as a grey level (the shader tints them)
  earth-clouds-4k-alpha.jpg     the cloud cover as a grey level (an alphaMap: three reads G)
and their -half variants for the low tier. Then: python3 -I scripts/ktx2.py --only earth-night
and --only earth-clouds-4k (the cover is encoded linear, being an -alpha map).
"""
import os
import sys

import numpy as np
from PIL import Image

night_src, clouds_src = sys.argv[1], sys.argv[2]
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'assets', 'earth')


def save(im: Image.Image, name: str) -> None:
    path = os.path.join(out, name)
    im.save(path, quality=86, optimize=True, progressive=True)
    base, ext = os.path.splitext(path)
    im.resize((im.width // 2, im.height // 2), Image.LANCZOS).save(f'{base}-half{ext}', quality=84, optimize=True, progressive=True)
    print(name, im.size, os.path.getsize(path) // 1024, 'KB')


# --- the lights: the map's planet is blue to cyan (red under 0.1, 0.13 at the 99.9th percentile),
# its cities neutral grey (red ≈ blue, 0.27–0.5): the red channel above the planet's floor, where
# the pixel is not blue, is the light ------------------------------------------------------------
n = np.asarray(Image.open(night_src).convert('RGB')).astype(np.float32) / 255
r, b = n[..., 0], n[..., 2]
light = np.clip((r - 0.09) / (0.47 - 0.09), 0, 1) * np.clip((r / np.maximum(b, 1e-3) - 0.45) / 0.4, 0, 1)
save(Image.fromarray((light * 255).astype(np.uint8), 'L'), 'earth-night-4k.jpg')
print('lit fraction', float((light > 0.05).mean()))

# --- the clouds: the cover, as it is (the shader shapes it) -------------------------------------
c = np.asarray(Image.open(clouds_src).convert('RGBA'))[..., 3]
save(Image.fromarray(c, 'L'), 'earth-clouds-4k-alpha.jpg')
print('mean cover', float(c.mean()) / 255)
