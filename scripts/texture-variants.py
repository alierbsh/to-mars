"""Half-size variants of the big ground and Earth maps for the low graphics tier, plus the
one-off downsizing of maps that never needed their full size (the Cape's alpha and water maps).

  python3 -I scripts/texture-variants.py

Writes `<name>-half.<ext>` next to each source in public/assets/cape and public/assets/earth
(JPEG q84, PNG, WebP q82). The site picks the variant by tier (`src/scene/quality.ts: texName`).
"""
import os
import sys

from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets')
DIRS = ['cape', 'earth']
SKIP: set[str] = set()
# maps whose shipped size is cut (w) before the half variants are made: the alpha masks and the
# water colour never needed the colour map's resolution
CAP = {'cape-': {'-alpha.png': 2048, '-water.jpg': 1024}, 'complex-': {'-alpha.png': 1024}, 'pad-': {'-alpha.png': 1024}}


def save(im, path):
    ext = os.path.splitext(path)[1].lower()
    if ext in ('.jpg', '.jpeg'):
        im.convert('RGB').save(path, quality=84, optimize=True, progressive=True)
    elif ext == '.png':
        im.save(path, optimize=True)
    elif ext == '.webp':
        im.save(path, quality=82, method=6)


def main():
    for d in DIRS:
        folder = os.path.join(ROOT, d)
        for f in sorted(os.listdir(folder)):
            if f in SKIP or '-half.' in f:
                continue
            p = os.path.join(folder, f)
            base, ext = os.path.splitext(f)
            try:
                im = Image.open(p)
            except Exception:
                continue
            im.load()
            # cap the shipped size of the masks
            for prefix, caps in CAP.items():
                if not f.startswith(prefix):
                    continue
                for suffix, size in caps.items():
                    if f.endswith(suffix) and im.size[0] > size:
                        im = im.resize((size, size * im.size[1] // im.size[0]), Image.LANCZOS)
                        save(im, p)
                        print('capped', f, im.size)
            half = im.resize((max(1, im.size[0] // 2), max(1, im.size[1] // 2)), Image.LANCZOS)
            out = os.path.join(folder, f'{base}-half{ext}')
            save(half, out)
            print('half', out.split('/public/')[-1], half.size, f'{os.path.getsize(out) // 1024} KB')


if __name__ == '__main__':
    main()
