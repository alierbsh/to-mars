"""Build the ground textures for the launch site, offline, from public-domain data.

  python3 -I scripts/cape-assets.py region --ne <dir with Natural Earth 10m geojson> --bluemarble <earth-blue-marble.jpg> [--water <water_4k.png>]

Everything is drawn in the azimuthal-equidistant projection centred on LC-39A, which is exactly
the parametrisation `capGeometry` uses for the spherical caps (local x east, z south, metres of
arc), so the textures land on the geometry without distortion.

`region` — the 2000 km tile under the Cape tiles for the view from altitude:
  public/assets/cape/region.jpg        4096² colour: NASA Blue Marble (via three-globe, 4k) as the
                                        base colour, sharpened with Natural Earth 10m vectors —
                                        coast, islands, lakes, rivers, the 200 m shelf, reefs,
                                        urban areas, major roads — plus land-cover grain.
  public/assets/cape/region-rough.jpg  1024² roughness (sea smooth → sun glint, land rough)
  public/assets/cape/region-clouds.png 2048² RGBA cloud deck: Florida's afternoon cumulus fields,
                                        sea-breeze lines, a few cumulonimbus, trade cumulus at sea
  public/assets/earth/earth-day-4k.jpg the Blue Marble itself for the globe under the tile
  public/assets/earth/earth-rough-4k.jpg roughness for the globe (water smooth, from the water mask)

Sources: NASA Blue Marble Next Generation (public domain; the 4096×2048 copy shipped with
three-globe), Natural Earth (public domain).
"""
import argparse
import json
import math
import os
import sys

import cv2
import numpy as np
from PIL import Image

R = 6_371_000.0
LAT0, LON0 = 28.6083, -80.6041  # LC-39A


# ------------------------------------------------------------------ projection
def forward(lon, lat):
    """lon/lat (deg, arrays) → x east, y north (m), azimuthal equidistant about LC-39A"""
    p0 = math.radians(LAT0)
    l0 = math.radians(LON0)
    p = np.radians(lat)
    dl = np.radians(lon) - l0
    cosc = np.sin(p0) * np.sin(p) + np.cos(p0) * np.cos(p) * np.cos(dl)
    c = np.arccos(np.clip(cosc, -1, 1))
    k = np.where(c > 1e-9, c / np.maximum(np.sin(c), 1e-12), 1.0)
    x = R * k * np.cos(p) * np.sin(dl)
    y = R * k * (np.cos(p0) * np.sin(p) - np.sin(p0) * np.cos(p) * np.cos(dl))
    return x, y


def inverse(x, y):
    """x east, y north (m) → lon, lat (deg)"""
    p0 = math.radians(LAT0)
    l0 = math.radians(LON0)
    rho = np.hypot(x, y)
    c = rho / R
    sinc = np.sin(c)
    cosc = np.cos(c)
    safe = np.where(rho > 1e-9, rho, 1.0)
    lat = np.arcsin(np.clip(cosc * np.sin(p0) + (y * sinc * np.cos(p0)) / safe, -1, 1))
    lon = l0 + np.arctan2(x * sinc, safe * np.cos(p0) * cosc - y * np.sin(p0) * sinc)
    lat = np.where(rho > 1e-9, lat, p0)
    lon = np.where(rho > 1e-9, lon, l0)
    return np.degrees(lon), np.degrees(lat)


class Frame:
    """a square tile of ±half metres drawn at n px"""

    def __init__(self, n, half, ss=1):
        self.n = n
        self.half = half
        self.ss = ss  # supersampling for vector rasterisation

    def px(self, x, y):
        """metres → pixel coords (float), supersampled"""
        s = self.n * self.ss / (2 * self.half)
        return (x + self.half) * s, (self.half - y) * s

    def grid(self):
        """pixel-centre x (east) and y (north) in metres"""
        i = (np.arange(self.n, dtype=np.float64) + 0.5) / self.n
        x = i * 2 * self.half - self.half
        y = self.half - i * 2 * self.half
        return np.meshgrid(x, y)


# ------------------------------------------------------------------ geojson helpers
def load(ne, name, bbox):
    """features of a Natural Earth layer whose bbox touches `bbox` (lon0, lat0, lon1, lat1)"""
    path = os.path.join(ne, f'{name}.geojson')
    with open(path) as f:
        g = json.load(f)
    out = []
    for ft in g['features']:
        geom = ft.get('geometry')
        if not geom:
            continue
        t = geom['type']
        c = geom['coordinates']
        polys = []
        lines = []
        if t == 'Polygon':
            polys = [c]
        elif t == 'MultiPolygon':
            polys = c
        elif t == 'LineString':
            lines = [c]
        elif t == 'MultiLineString':
            lines = c
        else:
            continue
        keep_p = []
        for poly in polys:
            ring = np.asarray(poly[0], dtype=np.float64)
            if ring[:, 0].max() < bbox[0] or ring[:, 0].min() > bbox[2] or ring[:, 1].max() < bbox[1] or ring[:, 1].min() > bbox[3]:
                continue
            keep_p.append([np.asarray(r, dtype=np.float64) for r in poly])
        keep_l = []
        for ln in lines:
            a = np.asarray(ln, dtype=np.float64)
            if a[:, 0].max() < bbox[0] or a[:, 0].min() > bbox[2] or a[:, 1].max() < bbox[1] or a[:, 1].min() > bbox[3]:
                continue
            keep_l.append(a)
        if keep_p or keep_l:
            out.append({'props': ft.get('properties', {}), 'polys': keep_p, 'lines': keep_l})
    return out


def clip_ring(ring, bbox):
    """drop vertices far outside the bbox (keeps the polygon closed enough for filling)"""
    return ring


def raster_polys(frame, feats, value=1.0, dtype=np.float32):
    """fill polygons (outer rings minus holes) into a float mask at the frame's full resolution
    (supersampled then box-filtered → anti-aliased)"""
    N = frame.n * frame.ss
    m = np.zeros((N, N), dtype=np.uint8)
    for ft in feats:
        for poly in ft['polys']:
            outer = poly[0]
            x, y = forward(outer[:, 0], outer[:, 1])
            px, py = frame.px(x, y)
            pts = np.stack([px, py], axis=-1)
            pts = np.round(pts * 16).astype(np.int32)  # fixed point, 4 fractional bits
            cv2.fillPoly(m, [pts], 255, lineType=cv2.LINE_8, shift=4)
            for hole in poly[1:]:
                x, y = forward(hole[:, 0], hole[:, 1])
                px, py = frame.px(x, y)
                pts = np.round(np.stack([px, py], axis=-1) * 16).astype(np.int32)
                cv2.fillPoly(m, [pts], 0, lineType=cv2.LINE_8, shift=4)
    if frame.ss > 1:
        m = cv2.resize(m, (frame.n, frame.n), interpolation=cv2.INTER_AREA)
    return (m.astype(dtype) / 255.0) * value


def raster_lines(frame, feats, width_px=1.0, filt=None):
    N = frame.n * frame.ss
    m = np.zeros((N, N), dtype=np.uint8)
    for ft in feats:
        if filt and not filt(ft['props']):
            continue
        w = width_px(ft['props']) if callable(width_px) else width_px
        for ln in ft['lines']:
            x, y = forward(ln[:, 0], ln[:, 1])
            px, py = frame.px(x, y)
            pts = np.round(np.stack([px, py], axis=-1) * 16).astype(np.int32)
            cv2.polylines(m, [pts], False, 255, thickness=max(1, int(round(w * frame.ss))), lineType=cv2.LINE_AA, shift=4)
        # polygons' outlines too (coastline comes as lines; land as polygons)
    if frame.ss > 1:
        m = cv2.resize(m, (frame.n, frame.n), interpolation=cv2.INTER_AREA)
    return m.astype(np.float32) / 255.0


# ------------------------------------------------------------------ noise
def _hash(ix, iy, seed):
    h = (ix * 374761393 + iy * 668265263 + seed * 982451653) & 0xFFFFFFFF
    h = (h ^ (h >> 13)) * 1274126177 & 0xFFFFFFFF
    h = h ^ (h >> 16)
    return (h & 0xFFFFFF).astype(np.float64) / 0xFFFFFF


def value_noise(n, scale, seed, m=None):
    """smooth value noise on an n×n grid; `scale` = feature size in px. Computed on a coarse
    lattice and bicubically upsampled (fast)."""
    m = m or n
    cells = max(2, int(math.ceil(n / scale)) + 2)
    ix, iy = np.meshgrid(np.arange(cells), np.arange(cells))
    lattice = _hash(ix.astype(np.int64), iy.astype(np.int64), seed).astype(np.float32)
    big = cv2.resize(lattice, (int(cells * scale), int(cells * scale)), interpolation=cv2.INTER_CUBIC)
    return big[:n, :n]


def fbm(n, scale, seed, octaves=4, gain=0.5):
    out = np.zeros((n, n), dtype=np.float32)
    amp = 1.0
    tot = 0.0
    for o in range(octaves):
        out += amp * value_noise(n, max(2.0, scale / (2 ** o)), seed + o * 17)
        tot += amp
        amp *= gain
    return out / tot


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


# ------------------------------------------------------------------ region tile
def region(args):
    out_cape = 'public/assets/cape'
    out_earth = 'public/assets/earth'
    os.makedirs(out_cape, exist_ok=True)
    os.makedirs(out_earth, exist_ok=True)
    n = 4096
    half = 1_000_000.0
    fr = Frame(n, half, ss=2)
    bbox = (-93.0, 17.0, -68.0, 40.0)

    print('blue marble …', flush=True)
    bm = np.asarray(Image.open(args.bluemarble).convert('RGB')).astype(np.float32) / 255.0
    H, W = bm.shape[:2]
    X, Y = fr.grid()
    lon, lat = inverse(X, Y)
    mapx = ((lon + 180.0) / 360.0 * W - 0.5).astype(np.float32)
    mapy = ((90.0 - lat) / 180.0 * H - 0.5).astype(np.float32)
    base = cv2.remap(bm, mapx, mapy, interpolation=cv2.INTER_CUBIC, borderMode=cv2.BORDER_WRAP)
    del mapx, mapy

    print('vectors …', flush=True)
    land_f = load(args.ne, 'ne_10m_land', bbox) + load(args.ne, 'ne_10m_minor_islands', bbox)
    lakes_f = load(args.ne, 'ne_10m_lakes', bbox) + load(args.ne, 'ne_10m_lakes_north_america', bbox)
    deep200_f = load(args.ne, 'ne_10m_bathymetry_K_200', bbox)
    deep1000_f = load(args.ne, 'ne_10m_bathymetry_J_1000', bbox)
    urban_f = load(args.ne, 'ne_10m_urban_areas', bbox)
    rivers_f = load(args.ne, 'ne_10m_rivers_north_america', bbox) + load(args.ne, 'ne_10m_rivers_lake_centerlines', bbox)
    roads_f = load(args.ne, 'ne_10m_roads', bbox)
    reefs_f = load(args.ne, 'ne_10m_reefs', bbox)
    coast_f = load(args.ne, 'ne_10m_coastline', bbox)

    print('rasterising …', flush=True)
    land = raster_polys(fr, land_f)
    lakes = raster_polys(fr, lakes_f)
    land = np.clip(land - lakes, 0, 1)
    deep200 = raster_polys(fr, deep200_f)
    deep1000 = raster_polys(fr, deep1000_f)
    urban = raster_polys(fr, urban_f)
    rivers = raster_lines(fr, rivers_f, width_px=lambda p: 1.0 if (p.get('scalerank') or 9) > 5 else 1.6)
    roads = raster_lines(fr, roads_f, width_px=1.0, filt=lambda p: (p.get('type') or '') in ('Major Highway', 'Beltway'))
    reefs = raster_lines(fr, reefs_f, width_px=1.4)
    coast = raster_lines(fr, coast_f, width_px=1.2)
    sea = np.clip(1 - land - lakes, 0, 1)
    shelf = cv2.GaussianBlur(sea * (1 - deep200), (0, 0), 6)  # shallower than 200 m, feathered
    slope = cv2.GaussianBlur(sea * deep200 * (1 - deep1000), (0, 0), 10)  # 200–1000 m

    # --- colour fields: Blue Marble colours pulled apart into a land field and a sea field so
    # the 4k map's blurred coast does not bleed across the sharp vector coast
    print('colour fields …', flush=True)
    from scipy import ndimage

    def fill_from(valid, img):
        """every pixel takes the colour of the nearest `valid` pixel"""
        dist, (iy, ix) = ndimage.distance_transform_edt(~valid, return_indices=True)
        return img[iy, ix]

    r, g, b = base[..., 0], base[..., 1], base[..., 2]
    bm_water = (b > g * 1.02) & (b > r * 1.25)
    k = np.ones((7, 7), np.uint8)
    land_core = (land > 0.5) & ~cv2.dilate(bm_water.astype(np.uint8), k).astype(bool)
    sea_core = (sea > 0.5) & bm_water & ~cv2.dilate((land > 0.5).astype(np.uint8), k).astype(bool)
    if land_core.sum() < 100:
        land_core = land > 0.5
    if sea_core.sum() < 100:
        sea_core = sea > 0.5
    land_col = fill_from(land_core, base)
    sea_col = fill_from(sea_core, base)
    land_col = cv2.GaussianBlur(land_col, (0, 0), 1.5)
    sea_col = cv2.GaussianBlur(sea_col, (0, 0), 2.5)

    # --- land cover grain: three scales of brightness, a hue drift, farmland blocks where the
    # Blue Marble reads pale/yellow-green (central Florida, the Everglades Agricultural Area)
    print('land cover …', flush=True)
    n1 = fbm(n, 90, 11, 5)  # ~45 km features
    n2 = fbm(n, 18, 23, 4)  # ~9 km
    n3 = fbm(n, 5, 37, 3)  # ~2.5 km
    grain = (n1 - 0.5) * 0.16 + (n2 - 0.5) * 0.14 + (n3 - 0.5) * 0.10
    hue = (fbm(n, 40, 51, 3) - 0.5)
    lc = land_col.copy()
    # the Blue Marble is dark and muddy over the south-east: lift it and let the greens breathe
    lum = (lc[..., 0] * 0.3 + lc[..., 1] * 0.59 + lc[..., 2] * 0.11)[..., None]
    lc = np.clip((lc - lum) * 1.35 + lum, 0, 1) ** 0.88 * 1.12
    lc *= (1 + grain)[..., None]
    lc[..., 0] += hue * 0.05
    lc[..., 1] += hue * 0.03
    lc[..., 2] -= hue * 0.04
    # farmland: blocky value noise snapped to a 2 km lattice, weighted by paleness
    pale = smoothstep(0.30, 0.46, land_col[..., 0] + land_col[..., 1] * 0.3)
    fields = value_noise(n, 2.2, 61)
    fields = np.floor(fields * 5) / 5 - 0.4
    fields = cv2.GaussianBlur(fields, (0, 0), 0.6)
    lc += (fields * 0.09 * pale)[..., None] * np.array([1.0, 0.9, 0.6], dtype=np.float32)
    # wetlands (Everglades, the Big Cypress, the St Johns marshes): the darker, browner Blue
    # Marble greens get a sawgrass tint and a streaky texture
    dark = smoothstep(0.34, 0.22, land_col[..., 1]) * smoothstep(0.08, 0.02, land_col[..., 1] - land_col[..., 0])
    streak = fbm(n, 30, 71, 3)
    lc += (dark * (streak - 0.5) * 0.08)[..., None] * np.array([0.9, 0.8, 0.5], dtype=np.float32)
    # urban: concrete grey with a fine block texture
    uc = np.array([0.52, 0.50, 0.47], dtype=np.float32)
    city = value_noise(n, 1.6, 83)
    lc = lc * (1 - 0.55 * urban[..., None]) + (uc * (0.85 + 0.3 * city)[..., None]) * (0.55 * urban[..., None])

    # --- sea: Blue Marble blues, a little grain, the shelf tinted; reefs bright
    print('sea …', flush=True)
    sc = sea_col.copy()
    sg = fbm(n, 60, 91, 3)
    sc *= (1 + (sg - 0.5) * 0.08)[..., None]
    turq = np.array([0.22, 0.56, 0.62], dtype=np.float32)
    sc = sc * (1 - 0.10 * shelf[..., None]) + turq * (0.10 * shelf[..., None])
    sc = sc * (1 - 0.04 * slope[..., None]) + np.array([0.08, 0.22, 0.42], dtype=np.float32) * (0.04 * slope[..., None])
    reef_c = np.array([0.55, 0.82, 0.80], dtype=np.float32)
    sc = sc * (1 - 0.6 * reefs[..., None]) + reef_c * (0.6 * reefs[..., None])
    # lakes: Okeechobee and the big ones brown-green, the rest dark teal
    lake_c = np.array([0.10, 0.20, 0.28], dtype=np.float32)
    lc_lake = lake_c * (1 + (sg - 0.5) * 0.1)[..., None]
    big_lake = raster_polys(fr, [f for f in lakes_f if (f['props'].get('name') or '') in ('Lake Okeechobee', 'Okeechobee', 'Lake Kissimmee', 'Lake George')])
    okee = np.array([0.26, 0.33, 0.24], dtype=np.float32)
    lc_lake = lc_lake * (1 - big_lake[..., None]) + okee * big_lake[..., None]

    print('compositing …', flush=True)
    img = lc * land[..., None] + sc * sea[..., None] + lc_lake * lakes[..., None]
    # rivers and roads
    riv_c = np.array([0.10, 0.19, 0.22], dtype=np.float32)
    rivers_on_land = rivers * land
    img = img * (1 - 0.55 * rivers_on_land[..., None]) + riv_c * (0.55 * rivers_on_land[..., None])
    road_c = np.array([0.62, 0.60, 0.56], dtype=np.float32)
    roads_on_land = roads * land
    img = img * (1 - 0.16 * roads_on_land[..., None]) + road_c * (0.16 * roads_on_land[..., None])
    # the beaches: a pale line along the coast, strongest on the Atlantic side of Florida
    sand = np.array([0.80, 0.76, 0.66], dtype=np.float32)
    img = img * (1 - 0.45 * coast[..., None]) + sand * (0.45 * coast[..., None])
    # a faint overall grain so flat colour does not read as paint
    fine = value_noise(n, 1.0, 101)
    img *= (0.97 + 0.06 * fine)[..., None]
    img = np.clip(img, 0, 1)
    Image.fromarray((img * 255).astype(np.uint8)).save(f'{out_cape}/region.jpg', quality=88, optimize=True, subsampling=0)

    # --- roughness: sea 0.28, lakes 0.35, land 0.95 (G channel)
    rough = (0.95 * land + 0.28 * sea + 0.35 * lakes).astype(np.float32)
    rough_s = cv2.resize(rough, (1024, 1024), interpolation=cv2.INTER_AREA)
    rr = (np.clip(rough_s, 0, 1) * 255).astype(np.uint8)
    Image.fromarray(np.stack([rr, rr, rr], axis=-1)).save(f'{out_cape}/region-rough.jpg', quality=80, optimize=True)

    # --- clouds
    print('clouds …', flush=True)
    cn = 2048
    cf = Frame(cn, half)
    land_c = cv2.resize(land, (cn, cn), interpolation=cv2.INTER_AREA)
    CX, CY = cf.grid()
    dist_pad = np.hypot(CX, CY)
    # sea-breeze fronts: lines of cumulus 25–45 km inland of each coast → inland distance
    inland = ndimage.distance_transform_edt(land_c > 0.5) * (2 * half / cn)  # metres from the coast, inside land
    front = np.exp(-((inland - 32_000) / 14_000) ** 2)
    # popcorn cumulus over land in the afternoon: small puffs, dense
    pop = fbm(cn, 6, 201, 3)
    pop2 = value_noise(cn, 2.6, 211)
    puff = smoothstep(0.56, 0.72, pop * 0.55 + pop2 * 0.45 + 0.12 * front)
    # larger convective clusters inland (cumulonimbus with anvils), sparse
    big = fbm(cn, 70, 221, 4)
    cell = smoothstep(0.62, 0.78, big) * smoothstep(0.0, 1.0, fbm(cn, 14, 231, 3))
    anvil = cv2.GaussianBlur(smoothstep(0.66, 0.78, big), (0, 0), 6) * 0.55
    # trade cumulus at sea: sparse small puffs in rows (wind from the east-south-east)
    rows = fbm(cn, 9, 241, 3)
    marine = smoothstep(0.64, 0.74, rows) * smoothstep(0.45, 0.6, fbm(cn, 120, 251, 3))
    # keep the launch area clear (the commit criteria): fade clouds within 60 km of the pad
    clear = smoothstep(40_000, 110_000, dist_pad)
    alpha = np.clip(puff * 0.9 * land_c + (cell + anvil) * land_c + marine * (1 - land_c) * 0.8, 0, 1) * clear
    # a thin cirrus veil in the north-west, drifting
    cirrus = smoothstep(0.55, 0.9, fbm(cn, 160, 261, 5)) * 0.35 * smoothstep(-200_000, 600_000, -CX - CY)
    alpha = np.clip(alpha + cirrus * (1 - alpha), 0, 1)
    # shading: tops lit from the sun (east-south-east, high); bases in the shadow of the mass
    height = cv2.GaussianBlur(alpha, (0, 0), 1.2)
    gy, gx = np.gradient(height)
    lit = np.clip(0.72 + (gx * 0.6 + gy * 0.8) * 30.0, 0.45, 1.05)
    col = np.clip(lit, 0, 1)
    rgba = np.zeros((cn, cn, 4), dtype=np.uint8)
    rgba[..., 0] = (col * 255).astype(np.uint8)
    rgba[..., 1] = (np.clip(col * 1.0, 0, 1) * 255).astype(np.uint8)
    rgba[..., 2] = (np.clip(col * 1.02, 0, 1) * 255).astype(np.uint8)
    rgba[..., 3] = (alpha * 255).astype(np.uint8)
    Image.fromarray(rgba, 'RGBA').save(f'{out_cape}/region-clouds.png', optimize=True)

    # --- the globe: the Blue Marble as-is, and the water mask for its roughness
    Image.fromarray((bm * 255).astype(np.uint8)).save(f'{out_earth}/earth-day-4k.jpg', quality=85, optimize=True)
    if args.water:
        # roughness for the globe: water (white in the mask) smooth, land rough
        w = np.asarray(Image.open(args.water).convert('L')).astype(np.float32) / 255.0
        rg = (np.clip(1.0 - 0.72 * w, 0, 1) * 255).astype(np.uint8)
        Image.fromarray(np.stack([rg, rg, rg], axis=-1)).resize((2048, 1024), Image.LANCZOS).save(f'{out_earth}/earth-rough-4k.jpg', quality=70, optimize=True)
    print('done', flush=True)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('what', choices=['region'])
    ap.add_argument('--ne', required=True)
    ap.add_argument('--bluemarble', required=True)
    ap.add_argument('--water')
    a = ap.parse_args()
    if a.what == 'region':
        region(a)
