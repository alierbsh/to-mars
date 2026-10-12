"""Build the Earth textures for the orbit scene from NASA-3D-Resources (public domain).

  python3 -I scripts/earth-assets.py <Earth (A).jpg> <Hipparcos Star Map.jpg>

Earth (A) is a physical relief map (bathymetry shading, bright land colours). From orbit the sea
is a deep, nearly uniform blue and the land is muted, so: flatten the ocean to deep blue keeping a
trace of the shelf shading, desaturate and darken the land, and write a roughness map (sea smooth,
land rough) for the specular sun glint. Clouds are procedural: domain-warped fBm with an ITCZ band
and mid-latitude swirl, written as an alpha PNG. The star map is downsampled for a sky sphere.
"""
import sys
import numpy as np
from PIL import Image

earth_src, stars_src = sys.argv[1], sys.argv[2]
out = 'public/assets/earth'
import os
os.makedirs(out, exist_ok=True)

# --- day map ------------------------------------------------------------------------------
im = np.asarray(Image.open(earth_src).convert('RGB')).astype(np.float32) / 255
r, g, b = im[..., 0], im[..., 1], im[..., 2]
lum = 0.3 * r + 0.59 * g + 0.11 * b
ocean = (b > g * 1.08) & (b > r * 1.3)
ice = (lum > 0.82) & (np.abs(r - b) < 0.12)
H, W = lum.shape
lat_px = np.linspace(90, -90, H, dtype=np.float32)[:, None]
lon_px = np.linspace(-180, 180, W, dtype=np.float32)[None, :]
# the relief map paints Antarctica and Greenland as brown rock: they are ice sheets
ice = ice | ((lat_px < -63) & ~ocean) | ((lat_px > 60) & (lon_px > -75) & (lon_px < -12) & ~ocean)
# deep blue sea with a hint of the shelf shading; land muted; ice bright but cool
sea = np.stack([0.035 + 0.05 * lum, 0.10 + 0.10 * lum, 0.28 + 0.16 * lum], axis=-1)
grey = lum[..., None]
land = im * 0.55 + grey * 0.28  # desaturate (towards luminance) and darken
day = np.where(ocean[..., None], sea, land)
icecol = np.stack([0.86 + 0.1 * lum, 0.88 + 0.1 * lum, 0.92 + 0.08 * lum], axis=-1)
day = np.where(ice[..., None], np.clip(icecol, 0, 1), day)
Image.fromarray((np.clip(day, 0, 1) * 255).astype(np.uint8)).resize((2048, 1024), Image.LANCZOS).save(f'{out}/earth-day.jpg', quality=84, optimize=True)

# --- roughness map: G channel = roughness ---------------------------------------------------
rough = np.where(ocean, 0.32, 0.95)
rough = np.where(ice, 0.6, rough)
Image.fromarray((rough * 255).astype(np.uint8)).resize((1024, 512), Image.BILINEAR).save(f'{out}/earth-rough.jpg', quality=70)

# --- clouds -----------------------------------------------------------------------------------
def noise(shape, seed, scale):
    rng = np.random.default_rng(seed)
    small = rng.random((shape[0] // scale + 2, shape[1] // scale + 2)).astype(np.float32)
    big = np.asarray(Image.fromarray((small * 255).astype(np.uint8)).resize((shape[1] + 2 * scale, shape[0] + 2 * scale), Image.BICUBIC)).astype(np.float32) / 255
    return big[:shape[0], :shape[1]]

def fbm(shape, seed, base, octaves=6, gain=0.52):
    acc = np.zeros(shape, np.float32)
    amp, norm, sc = 1.0, 0.0, base
    for i in range(octaves):
        acc += amp * noise(shape, seed + i * 7, max(2, sc))
        norm += amp
        amp *= gain
        sc //= 2
    return acc / norm

CH, CW = 1024, 2048
lat = np.linspace(90, -90, CH, dtype=np.float32)[:, None]
warp_x = fbm((CH, CW), 11, 256, 4)
warp_y = fbm((CH, CW), 23, 256, 4)
# domain warp: sample the base field at offset coordinates (swirls)
yy, xx = np.mgrid[0:CH, 0:CW]
sx = (xx * 0.7 + (warp_x - 0.5) * 320).astype(int) % CW  # stretched along longitude, swirled
sy = np.clip((yy + (warp_y - 0.5) * 180).astype(int), 0, CH - 1)
base = fbm((CH, CW), 5, 128, 6)[sy, sx]
fine = fbm((CH, CW), 41, 24, 4)[sy, sx]
field = 0.68 * base + 0.32 * fine
# latitude structure: ITCZ band near 5°N, storm tracks at ±50°, clearer subtropics at ±25°
belt = 0.10 * np.exp(-((lat - 6) / 7) ** 2) + 0.07 * np.exp(-((lat - 50) / 14) ** 2) + 0.07 * np.exp(-((lat + 52) / 14) ** 2) - 0.08 * np.exp(-((lat - 24) / 9) ** 2) - 0.08 * np.exp(-((lat + 26) / 9) ** 2)
field = field + belt
alpha = np.clip((field - 0.52) / 0.2, 0, 1) ** 1.3
alpha = alpha * 0.92
rgba = np.zeros((CH, CW, 4), np.uint8)
rgba[..., :3] = 255
rgba[..., 3] = (alpha * 255).astype(np.uint8)
Image.fromarray(rgba, 'RGBA').save(f'{out}/earth-clouds.png', optimize=True)
print('cloud cover', float(alpha.mean()))

# --- stars ------------------------------------------------------------------------------------
st = Image.open(stars_src).convert('RGB')
st.resize((2048, 1024), Image.LANCZOS).save(f'{out}/stars.jpg', quality=80, optimize=True)
print('ok')
