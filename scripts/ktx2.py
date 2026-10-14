"""KTX2 (Basis Universal, ETC1S) versions of the ground and Earth maps, next to their sources.

  python3 -I scripts/ktx2.py [--basisu /path/to/basisu] [--only <substring>] [--jobs 2]

Why: a JPEG is decompressed to 32 bits per texel on the GPU (a 4096² map with its mipmaps is
~85 MB of video memory); an ETC1S KTX2 file is transcoded in the browser to whatever block
format the GPU reads natively — ETC2 on phones, BC1/BC7 on desktops, ASTC where that is all
there is — and stays at 4–8 bits per texel. At quality 255 the files come out no bigger than
the JPEGs (the 4096² Cape tile: 1.9 MB vs 2.2 MB) and include the mipmap chain.

Every .jpg/.png/.webp in public/assets/cape and public/assets/earth (full and -half) gets a
.ktx2 sibling. Masks (-alpha) and roughness maps are encoded linear; RGBA sources keep alpha.
Images are flipped vertically on the way in (-y_flip): compressed textures cannot be flipped at
upload, and the meshes' UVs expect the TextureLoader orientation.

Build basisu from https://github.com/BinomialLLC/basis_universal (cmake -G Ninja .. && ninja basisu).
The originals stay in public/ as the fallback the loader uses if KTX2 cannot be read.
"""
import argparse
import os
import subprocess
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor

from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'assets')
DIRS = ['cape', 'earth']
EXTS = ('.jpg', '.png', '.webp')


def linear(name: str) -> bool:
    return '-alpha' in name or '-rough' in name


def encode(basisu: str, src: str) -> str:
    base, _ = os.path.splitext(src)
    out = base + '.ktx2'
    im = Image.open(src)
    has_alpha = im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info)
    im = im.convert('RGBA' if has_alpha else 'RGB')
    with tempfile.TemporaryDirectory() as tmp:
        png = os.path.join(tmp, 'in.png')
        im.save(png)
        cmd = [basisu, '-ktx2', '-mipmap', '-y_flip', '-q', '255', '-comp_level', '2', '-file', png, '-output_file', out]
        if linear(os.path.basename(src)):
            cmd.insert(1, '-linear')
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode != 0 or not os.path.exists(out):
            raise RuntimeError(f'{src}: {r.stdout[-400:]} {r.stderr[-400:]}')
    return f'{os.path.relpath(out, ROOT)}  {im.size[0]}x{im.size[1]}{" rgba" if has_alpha else ""}  {os.path.getsize(src) // 1024} KB -> {os.path.getsize(out) // 1024} KB'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--basisu', default=os.environ.get('BASISU', 'basisu'))
    ap.add_argument('--only')
    ap.add_argument('--jobs', type=int, default=2)
    a = ap.parse_args()
    files = []
    for d in DIRS:
        folder = os.path.join(ROOT, d)
        for f in sorted(os.listdir(folder)):
            if f.endswith(EXTS) and (not a.only or a.only in f):
                files.append(os.path.join(folder, f))
    with ThreadPoolExecutor(max_workers=a.jobs) as ex:
        for line in ex.map(lambda p: encode(a.basisu, p), files):
            print(line, flush=True)


if __name__ == '__main__':
    sys.exit(main())
