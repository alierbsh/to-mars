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
  public/assets/cape/region-clouds.webp 1536² RGBA cloud deck: Florida's afternoon cumulus fields,
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
    Image.fromarray(rgba, 'RGBA').resize((1536, 1536), Image.LANCZOS).save(f'{out_cape}/region-clouds.webp', 'WEBP', quality=75, method=6)

    # --- the globe: the Blue Marble as-is, and the water mask for its roughness
    Image.fromarray((bm * 255).astype(np.uint8)).save(f'{out_earth}/earth-day-4k.jpg', quality=85, optimize=True)
    if args.water:
        # roughness for the globe: water (white in the mask) smooth, land rough
        w = np.asarray(Image.open(args.water).convert('L')).astype(np.float32) / 255.0
        rg = (np.clip(1.0 - 0.72 * w, 0, 1) * 255).astype(np.uint8)
        Image.fromarray(np.stack([rg, rg, rg], axis=-1)).resize((2048, 1024), Image.LANCZOS).save(f'{out_earth}/earth-rough-4k.jpg', quality=70, optimize=True)
    print('done', flush=True)


# ============================================================================ the Cape itself
# The launch site at three scales, painted to read like satellite imagery: land cover from
# noise fields in metres (so every tier shows the same ground), shorelines roughened, beaches and
# dunes from the distance to the sea, mangrove along the lagoons, the Merritt Island refuge's
# mosquito impoundments, citrus rows, the towns' street grids, the roads, pads, runways and
# buildings of KSC and the Cape with their shadows. Water is left transparent (the live water
# surface shows through) except for a painted band of shallows along every shore.
# Geography: traced from public maps (±100–300 m); pad coordinates are the published ones.

def ll2m(pts):
    """[(lon, lat), …] → array of (x east, y north) metres"""
    a = np.asarray(pts, dtype=np.float64)
    x, y = forward(a[:, 0], a[:, 1])
    return np.stack([x, y], axis=-1)


# --- shorelines (lon, lat) --------------------------------------------------------------------
ATLANTIC_SHORE = [
    (-80.745, 28.960), (-80.712, 28.880), (-80.688, 28.800), (-80.668, 28.740), (-80.648, 28.700), (-80.628, 28.665),
    (-80.612, 28.640), (-80.604, 28.627), (-80.596, 28.618), (-80.590, 28.608), (-80.580, 28.596), (-80.570, 28.585),
    (-80.564, 28.575), (-80.563, 28.562), (-80.560, 28.548), (-80.556, 28.532), (-80.549, 28.515), (-80.542, 28.498),
    (-80.535, 28.482), (-80.531, 28.470), (-80.528, 28.460), (-80.530, 28.450), (-80.540, 28.438),
    (-80.556, 28.426), (-80.572, 28.416), (-80.586, 28.411), (-80.590, 28.404), (-80.596, 28.392), (-80.600, 28.372),
    (-80.603, 28.345), (-80.606, 28.315), (-80.609, 28.280), (-80.613, 28.240), (-80.617, 28.190), (-80.622, 28.130),
]
# the ocean: everything east of the shore
OCEAN = ATLANTIC_SHORE + [(-80.30, 28.13), (-80.30, 28.96)]

BANANA_RIVER = [
    (-80.662, 28.634), (-80.642, 28.624), (-80.628, 28.606), (-80.619, 28.585), (-80.611, 28.560), (-80.605, 28.535),
    (-80.603, 28.505), (-80.606, 28.475), (-80.613, 28.445), (-80.616, 28.420), (-80.624, 28.402), (-80.631, 28.372),
    (-80.640, 28.330), (-80.649, 28.290), (-80.658, 28.250), (-80.664, 28.200), (-80.667, 28.150),
    (-80.700, 28.150), (-80.699, 28.210), (-80.697, 28.260), (-80.693, 28.310), (-80.690, 28.360), (-80.689, 28.405),
    (-80.689, 28.450), (-80.686, 28.500), (-80.681, 28.545), (-80.672, 28.585), (-80.667, 28.612),
]
INDIAN_RIVER = [
    (-80.762, 28.800), (-80.757, 28.740), (-80.752, 28.680), (-80.747, 28.620), (-80.742, 28.560), (-80.737, 28.505),
    (-80.731, 28.450), (-80.726, 28.400), (-80.721, 28.350), (-80.720, 28.300), (-80.724, 28.250), (-80.729, 28.200),
    (-80.733, 28.130),
    (-80.785, 28.130), (-80.781, 28.200), (-80.783, 28.260), (-80.789, 28.320), (-80.794, 28.380), (-80.799, 28.440),
    (-80.801, 28.500), (-80.805, 28.560), (-80.805, 28.620), (-80.801, 28.680), (-80.806, 28.740), (-80.812, 28.800),
]
MOSQUITO_LAGOON = [
    (-80.748, 28.960), (-80.722, 28.900), (-80.700, 28.840), (-80.681, 28.780), (-80.670, 28.735), (-80.664, 28.700),
    (-80.672, 28.678), (-80.692, 28.668), (-80.716, 28.678), (-80.738, 28.700), (-80.752, 28.740), (-80.768, 28.790),
    (-80.782, 28.850), (-80.796, 28.910), (-80.804, 28.960),
]
# causeways and canals: (points, width m)
CAUSEWAYS = [
    ([(-80.808, 28.525), (-80.735, 28.522)], 70),  # NASA Causeway, Indian River
    ([(-80.684, 28.520), (-80.600, 28.520)], 70),  # NASA Causeway, Banana River
    ([(-80.805, 28.622), (-80.755, 28.626)], 50),  # Max Brewer Causeway
    ([(-80.792, 28.410), (-80.722, 28.410)], 60),  # Bennett Causeway (SR 528), Indian River
    ([(-80.692, 28.410), (-80.612, 28.412)], 60),  # SR 528 over the Banana River to the port
    ([(-80.792, 28.360), (-80.722, 28.360)], 50),  # SR 520, Indian River
    ([(-80.695, 28.354), (-80.628, 28.352)], 50),  # SR 520, Banana River
]
CANALS = [
    ([(-80.634, 28.577), (-80.641, 28.584), (-80.648, 28.590)], 70),  # the barge canal to the VAB turn basin
    ([(-80.586, 28.410), (-80.605, 28.410), (-80.625, 28.411)], 150),  # Port Canaveral entrance channel
    ([(-80.757, 28.737), (-80.746, 28.737)], 60),  # Haulover Canal
]
PORT_BASINS = [
    [(-80.612, 28.416), (-80.634, 28.416), (-80.634, 28.404), (-80.612, 28.404)],
]
TURN_BASIN = [[(-80.648, 28.594), (-80.641, 28.594), (-80.641, 28.586), (-80.648, 28.586)]]

# --- land cover regions --------------------------------------------------------------------
# the Merritt Island refuge impoundments (north of KSC)
IMPOUNDMENTS = [[(-80.760, 28.640), (-80.700, 28.640), (-80.665, 28.690), (-80.690, 28.740), (-80.740, 28.790), (-80.765, 28.760)]]
# salt marsh and wetlands
MARSH = [
    [(-80.740, 28.545), (-80.700, 28.560), (-80.690, 28.620), (-80.745, 28.615)],  # west Merritt Island marshes
    [(-80.685, 28.600), (-80.660, 28.620), (-80.640, 28.650), (-80.668, 28.655), (-80.690, 28.635)],  # north of the VAB
    [(-80.650, 28.605), (-80.640, 28.650), (-80.622, 28.648), (-80.634, 28.602)],  # north-west of 39B
]
# pine flatwoods
PINE = [
    [(-80.740, 28.420), (-80.700, 28.430), (-80.695, 28.500), (-80.738, 28.500)],  # central Merritt Island
    [(-80.800, 28.640), (-80.760, 28.640), (-80.760, 28.700), (-80.800, 28.720)],  # Titusville north
    [(-80.690, 28.560), (-80.665, 28.560), (-80.660, 28.600), (-80.690, 28.600)],
]
# citrus groves (remnants on Merritt Island)
GROVES = [
    [(-80.728, 28.455), (-80.708, 28.455), (-80.708, 28.480), (-80.728, 28.480)],
    [(-80.735, 28.500), (-80.712, 28.500), (-80.712, 28.520), (-80.735, 28.520)],
    [(-80.700, 28.470), (-80.690, 28.470), (-80.690, 28.495), (-80.700, 28.495)],
]
# towns: residential street grids (polygon, grid orientation degrees)
TOWNS = [
    ([(-80.835, 28.560), (-80.806, 28.560), (-80.806, 28.650), (-80.835, 28.650)], 0),  # Titusville
    ([(-80.835, 28.500), (-80.806, 28.500), (-80.806, 28.560), (-80.835, 28.555)], 0),  # Titusville south
    ([(-80.780, 28.360), (-80.740, 28.355), (-80.740, 28.440), (-80.780, 28.440)], 5),  # Merritt Island residential
    ([(-80.735, 28.300), (-80.700, 28.300), (-80.700, 28.400), (-80.735, 28.400)], 0),
    ([(-80.835, 28.300), (-80.790, 28.300), (-80.790, 28.400), (-80.835, 28.400)], 0),  # Cocoa / Rockledge
    ([(-80.614, 28.380), (-80.598, 28.390), (-80.604, 28.400), (-80.620, 28.395)], 10),  # Cape Canaveral city
    ([(-80.615, 28.300), (-80.603, 28.300), (-80.601, 28.380), (-80.615, 28.380)], 0),  # Cocoa Beach
    ([(-80.660, 28.290), (-80.640, 28.290), (-80.633, 28.350), (-80.655, 28.350)], 0),  # Merritt Island south (canals)
]
# KSC industrial area and the Cape's industrial zones (grey, big roofs, lots)
INDUSTRIAL = [
    [(-80.672, 28.515), (-80.648, 28.515), (-80.648, 28.535), (-80.672, 28.535)],  # KSC industrial area
    [(-80.690, 28.518), (-80.676, 28.518), (-80.676, 28.528), (-80.690, 28.528)],  # visitor complex
    [(-80.585, 28.465), (-80.560, 28.465), (-80.560, 28.495), (-80.585, 28.495)],  # CCSFS industrial area
    [(-80.600, 28.470), (-80.588, 28.470), (-80.588, 28.485), (-80.600, 28.485)],  # port/industry
]

# --- roads: (points lon/lat, width m, kind) ---------------------------------------------------
ROADS = [
    ([(-80.665, 28.480), (-80.665, 28.560), (-80.664, 28.620), (-80.662, 28.680), (-80.660, 28.730)], 16, 'asphalt'),  # Kennedy Parkway N
    ([(-80.808, 28.525), (-80.735, 28.522), (-80.684, 28.521), (-80.600, 28.520), (-80.575, 28.520)], 18, 'asphalt'),  # NASA Causeway / SR 405
    ([(-80.792, 28.410), (-80.612, 28.412)], 20, 'asphalt'),  # SR 528
    ([(-80.805, 28.622), (-80.755, 28.626)], 14, 'asphalt'),  # SR 406
    ([(-80.792, 28.360), (-80.628, 28.352)], 14, 'asphalt'),  # SR 520
    ([(-80.612, 28.520), (-80.614, 28.560), (-80.616, 28.590), (-80.614, 28.610), (-80.618, 28.635)], 14, 'asphalt'),  # Phillips Parkway
    ([(-80.566, 28.540), (-80.570, 28.562), (-80.574, 28.578), (-80.584, 28.596), (-80.594, 28.608), (-80.601, 28.619), (-80.609, 28.630), (-80.618, 28.644), (-80.634, 28.670), (-80.655, 28.705), (-80.675, 28.745)], 10, 'asphalt'),  # Beach Road, ~400 m behind the dunes
    ([(-80.575, 28.470), (-80.577, 28.500), (-80.579, 28.530), (-80.580, 28.560), (-80.583, 28.590)], 12, 'asphalt'),  # ICBM Road
    ([(-80.560, 28.470), (-80.575, 28.470)], 10, 'asphalt'),
    ([(-80.625, 28.400), (-80.590, 28.400)], 12, 'asphalt'),  # port road
    ([(-80.608, 28.300), (-80.606, 28.400)], 14, 'asphalt'),  # A1A Cocoa Beach
    ([(-80.700, 28.300), (-80.700, 28.440), (-80.705, 28.500), (-80.705, 28.520)], 14, 'asphalt'),  # Courtenay Parkway (SR 3) Merritt Island
    ([(-80.750, 28.300), (-80.748, 28.440)], 12, 'asphalt'),
    ([(-80.820, 28.300), (-80.822, 28.700)], 16, 'asphalt'),  # US 1
    ([(-80.665, 28.588), (-80.655, 28.588)], 12, 'asphalt'),  # Saturn Causeway to the VAB
    ([(-80.660, 28.580), (-80.640, 28.580), (-80.625, 28.586)], 10, 'asphalt'),
    ([(-80.700, 28.520), (-80.690, 28.521)], 12, 'asphalt'),
]
# the crawlerway: VAB → fork → 39A / 39B, two lanes of gravel
CRAWLERWAY = [
    [(-80.6500, 28.5880), (-80.6360, 28.5900), (-80.6240, 28.5960)],  # VAB to the fork
    [(-80.6240, 28.5960), (-80.6140, 28.6020), (-80.6070, 28.6075), (-80.6041, 28.6083)],  # to 39A
    [(-80.6240, 28.5960), (-80.6230, 28.6120), (-80.6215, 28.6230), (-80.6209, 28.6272)],  # to 39B
]
RUNWAYS = [
    ((-80.6946, 28.6149), 4572, 91, 330.0),  # Shuttle Landing Facility
    ((-80.5663, 28.4675), 3048, 60, 310.0),  # the Skid Strip
]
# pads: (lon, lat, apron radius m, shape, trench heading deg or None)
PADS = [
    ((-80.6041, 28.6083), 230, 'oct', None),  # 39A
    ((-80.6209, 28.6272), 230, 'oct', 0.0),  # 39B
    ((-80.5830, 28.5834), 130, 'circle', 0.0),  # SLC-41
    ((-80.5772, 28.5620), 130, 'circle', 0.0),  # SLC-40
    ((-80.5649, 28.5318), 120, 'circle', 90.0),  # SLC-37
    ((-80.5399, 28.4707), 150, 'rect', 0.0),  # LC-36
    ((-80.5612, 28.5218), 90, 'circle', None),  # LC-34
    ((-80.5470, 28.4910), 70, 'circle', None),  # LC-14
    ((-80.5540, 28.5070), 70, 'circle', None),  # LC-19
    ((-80.5570, 28.5120), 60, 'circle', None),  # LC-20
]
# buildings: (lon, lat, width m (E-W), depth m (N-S), height m, colour)
WHITE_ROOF = (0.80, 0.80, 0.77)
GREY_ROOF = (0.58, 0.58, 0.57)
BUILDINGS = [
    (-80.6511, 28.5859, 158, 218, 160, (0.86, 0.86, 0.84)),  # VAB
    (-80.6485, 28.5845, 150, 100, 24, WHITE_ROOF),  # LCC
    (-80.6580, 28.5265, 180, 60, 20, WHITE_ROOF),  # HQ
    (-80.6610, 28.5225, 260, 90, 22, WHITE_ROOF),  # O&C
    (-80.6530, 28.5290, 140, 140, 30, WHITE_ROOF),  # SSPF
    (-80.6560, 28.5330, 90, 70, 16, GREY_ROOF),
    (-80.6630, 28.5300, 70, 110, 14, GREY_ROOF),
    (-80.6480, 28.5240, 110, 60, 14, GREY_ROOF),
    (-80.6120, 28.6035, 95, 50, 20, WHITE_ROOF),  # HIF at 39A
    (-80.6235, 28.6250, 60, 40, 12, GREY_ROOF),
    (-80.5870, 28.5790, 90, 45, 18, WHITE_ROOF),  # HIF at 41
    (-80.5800, 28.5580, 90, 45, 18, WHITE_ROOF),  # HIF at 40
    (-80.5700, 28.5300, 60, 40, 15, GREY_ROOF),
    (-80.5440, 28.4740, 80, 40, 15, GREY_ROOF),
    (-80.6420, 28.5900, 40, 30, 10, GREY_ROOF),  # press site
    (-80.6840, 28.5230, 120, 70, 16, WHITE_ROOF),  # visitor complex
]
PARKING = [
    [(-80.6900, 28.5195), (-80.6780, 28.5195), (-80.6780, 28.5250), (-80.6900, 28.5250)],  # visitor complex lots
    [(-80.6550, 28.5820), (-80.6470, 28.5820), (-80.6470, 28.5840), (-80.6550, 28.5840)],  # VAB lots
    [(-80.6640, 28.5240), (-80.6600, 28.5240), (-80.6600, 28.5290), (-80.6640, 28.5290)],
]


class Painter:
    """a square tile in 39A-local metres (x east, y north), n px over ±half around (cx, cy)"""

    def __init__(self, n, half, cx=0.0, cy=0.0, seed=0):
        self.n = n
        self.half = half
        self.cx = cx
        self.cy = cy
        self.mpp = 2 * half / n
        i = (np.arange(n, dtype=np.float64) + 0.5) / n
        self.X, self.Y = np.meshgrid(cx + i * 2 * half - half, cy + half - i * 2 * half)
        self.X = self.X.astype(np.float32)
        self.Y = self.Y.astype(np.float32)
        self.rgb = np.zeros((n, n, 3), dtype=np.float32)
        self.alpha = np.ones((n, n), dtype=np.float32)
        self.water = None  # the water's own colour (for the live surface under the holes)

    # --- geometry → pixels
    def px(self, xy):
        """metres (N,2) → pixel coords (float)"""
        s = self.n / (2 * self.half)
        return np.stack([(xy[:, 0] - self.cx + self.half) * s, (self.cy + self.half - xy[:, 1]) * s], axis=-1)

    def poly_mask(self, polys_m, ss=None):
        """anti-aliased mask of polygons given in metres"""
        ss = ss or (2 if self.n <= 2048 else 1)  # the 4096 tiles are drawn at 1× to stay in memory
        N = self.n * ss
        m = np.zeros((N, N), dtype=np.uint8)
        for poly in polys_m:
            pts = np.round(self.px(np.asarray(poly, dtype=np.float64)) * ss * 16).astype(np.int32)
            cv2.fillPoly(m, [pts], 255, lineType=cv2.LINE_AA if ss == 1 else cv2.LINE_8, shift=4)
        if ss > 1:
            m = cv2.resize(m, (self.n, self.n), interpolation=cv2.INTER_AREA)
        return m.astype(np.float32) / 255.0

    def line_mask(self, lines_m, width_m, ss=None, cap_round=True):
        ss = ss or (2 if self.n <= 2048 else 1)
        N = self.n * ss
        m = np.zeros((N, N), dtype=np.uint8)
        wpx = max(1, int(round(width_m / self.mpp * ss)))
        for ln in lines_m:
            pts = np.round(self.px(np.asarray(ln, dtype=np.float64)) * ss * 16).astype(np.int32)
            cv2.polylines(m, [pts], False, 255, thickness=wpx, lineType=cv2.LINE_AA, shift=4)
        if ss > 1:
            m = cv2.resize(m, (self.n, self.n), interpolation=cv2.INTER_AREA)
        return m.astype(np.float32) / 255.0

    def rect_pts(self, cx, cy, w, h, deg=0.0):
        a = math.radians(deg)
        ux, uy = math.sin(a), math.cos(a)
        vx, vy = math.cos(a), -math.sin(a)
        return [(cx + ux * h / 2 + vx * w / 2, cy + uy * h / 2 + vy * w / 2), (cx + ux * h / 2 - vx * w / 2, cy + uy * h / 2 - vy * w / 2), (cx - ux * h / 2 - vx * w / 2, cy - uy * h / 2 - vy * w / 2), (cx - ux * h / 2 + vx * w / 2, cy - uy * h / 2 + vy * w / 2)]

    def rect_mask(self, cx, cy, w, h, deg=0.0, ss=None):
        """rotated rectangle in metres (centre, size, heading of the long axis from north)"""
        a = math.radians(deg)
        ux, uy = math.sin(a), math.cos(a)  # along the long axis
        vx, vy = math.cos(a), -math.sin(a)
        pts = [(cx + ux * h / 2 + vx * w / 2, cy + uy * h / 2 + vy * w / 2), (cx + ux * h / 2 - vx * w / 2, cy + uy * h / 2 - vy * w / 2), (cx - ux * h / 2 - vx * w / 2, cy - uy * h / 2 - vy * w / 2), (cx - ux * h / 2 + vx * w / 2, cy - uy * h / 2 + vy * w / 2)]
        return self.poly_mask([pts], ss)

    def dist_m(self, mask):
        """distance (m) from the nearest mask>0.5 pixel, for every pixel"""
        inv = (mask < 0.5).astype(np.uint8)
        return cv2.distanceTransform(inv, cv2.DIST_L2, 5).astype(np.float32) * self.mpp

    # --- noise in metres (consistent across tiles)
    def vnoise(self, cell, seed):
        """value noise on a lattice of `cell` metres, smooth interpolation"""
        gx = self.X / cell
        gy = self.Y / cell
        ix = np.floor(gx)
        iy = np.floor(gy)
        fx = gx - ix
        fy = gy - iy
        fx = fx * fx * (3 - 2 * fx)
        fy = fy * fy * (3 - 2 * fy)
        ix = ix.astype(np.int64)
        iy = iy.astype(np.int64)

        def h(ax, ay):
            v = (ax * 374761393 + ay * 668265263 + seed * 982451653) & 0xFFFFFFFF
            v = ((v ^ (v >> 13)) * 1274126177) & 0xFFFFFFFF
            v = v ^ (v >> 16)
            return (v & 0xFFFFFF).astype(np.float32) / 0xFFFFFF

        a = h(ix, iy)
        b = h(ix + 1, iy)
        c = h(ix, iy + 1)
        d = h(ix + 1, iy + 1)
        return (a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy).astype(np.float32)

    def fbm(self, cell, seed, octaves=4, gain=0.5):
        out = np.zeros((self.n, self.n), dtype=np.float32)
        amp = 1.0
        tot = 0.0
        for o in range(octaves):
            c = cell / (2 ** o)
            if c < self.mpp * 0.7:
                break
            out += amp * self.vnoise(c, seed + o * 17)
            tot += amp
            amp *= gain
        return out / max(tot, 1e-6)

    def worley(self, cell, seed):
        """cellular noise: distance to the nearest of jittered lattice points, and the second — both in metres"""
        gx = self.X / cell
        gy = self.Y / cell
        ix = np.floor(gx).astype(np.int64)
        iy = np.floor(gy).astype(np.int64)
        f1 = np.full((self.n, self.n), 1e9, dtype=np.float32)
        f2 = np.full((self.n, self.n), 1e9, dtype=np.float32)

        def h(ax, ay, k):
            v = (ax * 374761393 + ay * 668265263 + (seed + k) * 982451653) & 0xFFFFFFFF
            v = ((v ^ (v >> 13)) * 1274126177) & 0xFFFFFFFF
            v = v ^ (v >> 16)
            return (v & 0xFFFFFF).astype(np.float32) / 0xFFFFFF

        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                cx = ix + dx
                cy = iy + dy
                px = cx + h(cx, cy, 1)
                py = cy + h(cx, cy, 2)
                d = np.hypot(gx - px, gy - py)
                closer = d < f1
                f2 = np.where(closer, f1, np.minimum(f2, d))
                f1 = np.where(closer, d, f1)
        return f1 * cell, f2 * cell

    def warp(self, mask, amp, cell, seed):
        """roughen a mask's edges by displacing its sampling with fBm"""
        dx = (self.fbm(cell, seed, 3) - 0.5) * 2 * amp / self.mpp
        dy = (self.fbm(cell, seed + 101, 3) - 0.5) * 2 * amp / self.mpp
        i = np.arange(self.n, dtype=np.float32)
        mx, my = np.meshgrid(i, i)
        return cv2.remap(mask, (mx + dx).astype(np.float32), (my + dy).astype(np.float32), interpolation=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)

    # --- painting
    def fill(self, col, mask):
        m = mask[..., None]
        self.rgb = self.rgb * (1 - m) + np.asarray(col, dtype=np.float32) * m

    def fill_rgb(self, rgb, mask):
        m = mask[..., None]
        self.rgb = self.rgb * (1 - m) + rgb * m


def paint_cape(p: Painter, detail: str):
    """paint the launch site into the painter; detail 'cape' (12 m/px) | 'complex' (4 m/px) | 'pad' (1 m/px)"""
    n = p.n
    fine = detail != 'cape'
    print(f'  [{detail}] land cover …', flush=True)
    # ---- noise fields
    n_big = p.fbm(1200, 3, 4)  # 1.2 km mottling: wet/dry ground
    n_mid = p.fbm(260, 7, 4)  # scrub patches
    n_fine = p.fbm(45, 11, 4 if fine else 2)  # canopy clumps
    n_sand = p.fbm(140, 19, 3)
    grain = p.vnoise(max(p.mpp * 1.5, 3.0), 23)  # per-pixel grain

    # ---- the base: coastal scrub — a mottle of oak scrub, palmetto and open sand
    SCRUB_DARK = np.array([0.25, 0.31, 0.19], np.float32)
    SCRUB_LIGHT = np.array([0.43, 0.45, 0.30], np.float32)
    SAND = np.array([0.72, 0.68, 0.55], np.float32)
    PINE_C = np.array([0.19, 0.28, 0.17], np.float32)
    MARSH_C = np.array([0.46, 0.43, 0.29], np.float32)
    MARSH_G = np.array([0.36, 0.41, 0.25], np.float32)
    MANGROVE = np.array([0.16, 0.25, 0.16], np.float32)
    k = smoothstep(0.35, 0.7, n_mid * 0.6 + n_fine * 0.4)
    base = SCRUB_DARK * (1 - k)[..., None] + SCRUB_LIGHT * k[..., None]
    sandy = smoothstep(0.62, 0.78, n_sand * 0.7 + n_fine * 0.3)
    base = base * (1 - sandy)[..., None] + SAND * sandy[..., None]
    # wetter ground in the low mottles: darker, greener
    wet = smoothstep(0.52, 0.7, n_big)
    base = base * (1 - 0.5 * wet)[..., None] + MARSH_G * (0.5 * wet)[..., None]
    if fine:
        # individual scrub oaks and palmetto clumps: cellular blobs with sand between
        f1, _ = p.worley(11.0 if detail == 'pad' else 16.0, 29)
        canopy = smoothstep(5.5, 2.5, f1) * smoothstep(0.35, 0.55, n_mid * 0.5 + p.vnoise(30, 33) * 0.5)
        gap = (1 - canopy) * smoothstep(0.5, 0.75, n_fine)
        base = base * (1 - 0.6 * canopy)[..., None] + SCRUB_DARK * 0.85 * (0.6 * canopy)[..., None]
        base = base * (1 - 0.5 * gap)[..., None] + SAND * (0.5 * gap)[..., None]
    p.rgb = base.copy()

    # ---- regions
    pine = p.poly_mask([ll2m(q) for q in PINE])
    pine = p.warp(pine, 400, 900, 31)
    pk = pine * (0.55 + 0.45 * smoothstep(0.3, 0.7, n_fine))
    p.fill_rgb(PINE_C * (0.85 + 0.3 * n_fine)[..., None], pk)
    marsh = p.poly_mask([ll2m(q) for q in MARSH] + [ll2m(q) for q in IMPOUNDMENTS])
    marsh = p.warp(marsh, 500, 1200, 37)
    mc = MARSH_C * (0.8 + 0.4 * n_mid)[..., None]
    mc = mc * (1 - 0.6 * wet)[..., None] + MARSH_G * (0.6 * wet)[..., None]
    p.fill_rgb(mc, marsh)
    # pools in the marsh
    pool = smoothstep(0.6, 0.68, p.fbm(220, 41, 3)) * marsh
    p.fill((0.23, 0.29, 0.26), pool)
    # the refuge impoundments: cells with dikes, flooded interiors
    imp = p.poly_mask([ll2m(q) for q in IMPOUNDMENTS])
    if imp.max() > 0:
        f1, f2 = p.worley(650, 43)
        dike = smoothstep(18.0, 6.0, f2 - f1) * imp
        flooded = smoothstep(0.45, 0.6, p.fbm(500, 47, 3)) * imp
        p.fill((0.26, 0.30, 0.27), flooded * 0.85)
        p.fill((0.66, 0.60, 0.46), dike)
    # land-use parcels: cells with their own tint and sharp edges, firebreak lines on some edges
    f1, f2 = p.worley(1500, 101)
    cell_tint = p.vnoise(1500, 103)
    tint = (cell_tint - 0.5) * 0.14
    p.rgb = np.clip(p.rgb * (1 + tint)[..., None], 0, 1)
    p.rgb[..., 0] *= 1 + 0.25 * tint  # warmer cells drier, cooler cells wetter
    p.rgb[..., 2] *= 1 - 0.25 * tint
    firebreak = smoothstep(14.0, 5.0, f2 - f1) * smoothstep(0.55, 0.65, p.vnoise(1500, 107))
    p.fill_rgb(SAND * (0.9 + 0.2 * grain)[..., None], firebreak * 0.75)
    # ponds and borrow pits
    pf1, _ = p.worley(900, 109)
    pond = smoothstep(95.0, 60.0, pf1) * smoothstep(0.45, 0.6, p.vnoise(900, 111))
    p.fill((0.21, 0.28, 0.27), pond)
    # citrus rows
    groves = p.poly_mask([ll2m(q) for q in GROVES])
    if groves.max() > 0:
        rows = 0.5 + 0.5 * np.cos(p.Y / 7.5 * 2 * np.pi) if p.mpp < 5 else np.full((n, n), 0.5, np.float32)
        gc = np.array([0.22, 0.33, 0.17], np.float32) * (1 - rows)[..., None] + np.array([0.55, 0.50, 0.36], np.float32) * rows[..., None]
        p.fill_rgb(gc, groves)

    # ---- water: the ocean and the lagoons, roughened shorelines, causeways over them
    print(f'  [{detail}] water …', flush=True)
    ocean = p.poly_mask([ll2m(OCEAN)])
    lagoon = p.poly_mask([ll2m(BANANA_RIVER), ll2m(INDIAN_RIVER), ll2m(MOSQUITO_LAGOON)])
    ocean = p.warp(ocean, 60, 500, 53)
    lagoon = p.warp(lagoon, 120, 700, 59)
    lagoon = np.maximum(lagoon, p.poly_mask([ll2m(q) for q in PORT_BASINS] + [ll2m(q) for q in TURN_BASIN]))
    for pts, w in CANALS:
        lagoon = np.maximum(lagoon, p.line_mask([ll2m(pts)], w))
    for pts, w in CAUSEWAYS:
        cw = p.line_mask([ll2m(pts)], w)
        lagoon = lagoon * (1 - cw)
        ocean = ocean * (1 - cw)
    water = np.clip(ocean + lagoon, 0, 1)
    d_sea = p.dist_m(ocean)  # distance to the sea (on land)
    d_lag = p.dist_m(lagoon)
    # beach: wet sand at the water line, dry sand behind, dunes with sparse scrub
    wet_sand = smoothstep(45, 10, d_sea) * (1 - water)
    dry_sand = smoothstep(150, 60, d_sea) * (1 - water)
    dune = smoothstep(420, 160, d_sea) * (1 - water) * smoothstep(0.3, 0.6, n_fine)
    p.fill_rgb(np.array([0.60, 0.57, 0.47], np.float32) * (0.9 + 0.2 * grain)[..., None], dune * 0.6)
    p.fill_rgb(np.array([0.86, 0.82, 0.70], np.float32) * (0.92 + 0.12 * grain)[..., None], dry_sand)
    p.fill((0.66, 0.62, 0.52), wet_sand)
    # mangrove and marsh fringe along the lagoons
    fringe = smoothstep(90, 15, d_lag) * (1 - water) * (1 - dry_sand)
    p.fill_rgb(MANGROVE * (0.85 + 0.3 * n_fine)[..., None], fringe * 0.85)
    # water itself: painted shallows along every shore (opaque), open water transparent
    dw_sea = p.dist_m(1 - ocean)  # distance from the shore, inside the sea
    dw_lag = p.dist_m(1 - lagoon)
    surf = smoothstep(0, 25, dw_sea) * smoothstep(70, 30, dw_sea) * smoothstep(0.35, 0.6, p.fbm(60, 61, 3))
    shallow_sea = np.array([0.30, 0.52, 0.58], np.float32) * (1 - smoothstep(60, 320, dw_sea))[..., None] + np.array([0.11, 0.27, 0.44], np.float32) * smoothstep(60, 320, dw_sea)[..., None]
    bars = smoothstep(0.55, 0.7, p.fbm(160, 67, 3)) * smoothstep(0, 80, dw_sea) * smoothstep(500, 200, dw_sea)
    shallow_sea = shallow_sea * (1 - 0.35 * bars)[..., None] + np.array([0.45, 0.62, 0.62], np.float32) * (0.35 * bars)[..., None]
    p.fill_rgb(shallow_sea, ocean)
    p.fill((0.86, 0.88, 0.88), surf * ocean)
    lag_col = np.array([0.33, 0.43, 0.38], np.float32) * (1 - smoothstep(40, 220, dw_lag))[..., None] + np.array([0.21, 0.33, 0.33], np.float32) * smoothstep(40, 220, dw_lag)[..., None]
    lag_col = lag_col * (0.94 + 0.12 * p.fbm(300, 71, 3))[..., None]
    p.fill_rgb(lag_col, lagoon)
    # the water's colour for the live surface: the same shallows, deepening offshore
    p.water = shallow_sea * ocean[..., None] + lag_col * (1 - ocean)[..., None]
    # transparency: open water beyond the painted shallows (the live surface shows through)
    open_sea = smoothstep(150, 400, dw_sea) * ocean
    open_lag = smoothstep(120, 320, dw_lag) * lagoon
    p.alpha = np.clip(1 - np.maximum(open_sea, open_lag), 0, 1)

    # ---- towns and industry
    print(f'  [{detail}] towns, roads, pads …', flush=True)
    for poly, deg in TOWNS:
        tm = p.poly_mask([ll2m(poly)])
        if tm.max() == 0:
            continue
        tm = p.warp(tm, 250, 800, 73) * (1 - water)
        a = math.radians(deg)
        xr = p.X * math.cos(a) - p.Y * math.sin(a)
        yr = p.X * math.sin(a) + p.Y * math.cos(a)
        pitch = 120.0
        half_w = max(5.0, p.mpp * 0.8)
        street = np.maximum(smoothstep(half_w, half_w * 0.5, np.abs(np.mod(xr + pitch / 2, pitch) - pitch / 2)), smoothstep(half_w, half_w * 0.5, np.abs(np.mod(yr + pitch / 2, pitch) - pitch / 2)))
        art_w = max(11.0, p.mpp * 1.2)
        arterial = np.maximum(smoothstep(art_w, art_w * 0.5, np.abs(np.mod(xr + 360, 720) - 360)), smoothstep(art_w, art_w * 0.5, np.abs(np.mod(yr + 360, 720) - 360)))
        lots = p.vnoise(26, 79)
        roofs = smoothstep(0.52, 0.6, lots)
        trees = smoothstep(0.6, 0.72, p.vnoise(18, 81))
        block = np.array([0.46, 0.52, 0.31], np.float32) * (1 - roofs)[..., None] + np.array([0.70, 0.68, 0.64], np.float32) * roofs[..., None]
        block = block * (1 - 0.5 * trees)[..., None] + SCRUB_DARK * (0.5 * trees)[..., None]
        block = block * (0.9 + 0.2 * grain)[..., None]
        block = block * (1 - street)[..., None] + np.array([0.52, 0.52, 0.51], np.float32) * street[..., None]
        block = block * (1 - arterial)[..., None] + np.array([0.58, 0.58, 0.57], np.float32) * arterial[..., None]
        p.fill_rgb(block, tm * 0.94)
    ind = p.poly_mask([ll2m(q) for q in INDUSTRIAL])
    if ind.max() > 0:
        lots = p.vnoise(95, 83)
        roofs = smoothstep(0.5, 0.56, lots)
        lawn = smoothstep(0.55, 0.65, p.vnoise(140, 85)) * (1 - roofs)
        ic = np.array([0.50, 0.50, 0.48], np.float32) * (1 - roofs)[..., None] + np.array([0.76, 0.76, 0.74], np.float32) * roofs[..., None]
        ic = ic * (1 - lawn)[..., None] + np.array([0.42, 0.50, 0.30], np.float32) * lawn[..., None]
        p.fill_rgb(ic * (0.92 + 0.16 * grain)[..., None], ind * 0.92)
    park = p.poly_mask([ll2m(q) for q in PARKING])
    p.fill_rgb(np.array([0.46, 0.46, 0.45], np.float32) * (0.95 + 0.1 * grain)[..., None], park)

    # ---- roads, the crawlerway, runways
    for pts, w, kind in ROADS:
        m = p.line_mask([ll2m(pts)], w)
        p.fill((0.40, 0.40, 0.40), m * 0.95)
        if fine:
            p.fill((0.58, 0.56, 0.52), p.line_mask([ll2m(pts)], w + 8) * (1 - m) * 0.6)  # shoulders
    for seg in CRAWLERWAY:
        m = p.line_mask([ll2m(seg)], 40)
        p.fill_rgb(np.array([0.70, 0.66, 0.55], np.float32) * (0.95 + 0.1 * grain)[..., None], m)
        if fine:
            p.fill((0.52, 0.50, 0.44), p.line_mask([ll2m(seg)], 4) * 0.8)  # the grass median between the lanes
    for (lon, lat), L, W, hdg in RUNWAYS:
        c = ll2m([(lon, lat)])[0]
        p.fill((0.70, 0.70, 0.68), p.rect_mask(c[0], c[1], W, L, hdg))
        p.fill((0.60, 0.60, 0.58), p.rect_mask(c[0], c[1], W + 40, L + 600, hdg) * (1 - p.rect_mask(c[0], c[1], W, L, hdg)) * 0.5)
        if fine:
            p.fill((0.90, 0.90, 0.88), p.rect_mask(c[0], c[1], 1.0, L * 0.9, hdg))  # centreline
    # ---- pads: sandy apron surroundings, concrete apron, trench, perimeter road
    for (lon, lat), r, shape, trench in PADS:
        c = ll2m([(lon, lat)])[0]
        d = np.hypot(p.X - c[0], p.Y - c[1])
        if d.min() > p.half * 1.6:
            continue
        if shape == 'oct':
            ang = np.arctan2(p.Y - c[1], p.X - c[0])
            ro = r / np.cos((np.mod(ang + np.pi / 8, np.pi / 4)) - np.pi / 8)
            apron = smoothstep(ro + p.mpp, ro - p.mpp, d)
        elif shape == 'rect':
            apron = p.rect_mask(c[0], c[1], r * 1.6, r * 2.2, 0.0)
        else:
            apron = smoothstep(r + p.mpp, r - p.mpp, d)
        sandy_ring = smoothstep(r * 1.5 + 60, r * 1.5 - 40, d) * (1 - apron)
        p.fill_rgb(np.array([0.62, 0.60, 0.48], np.float32) * (0.9 + 0.2 * grain)[..., None], sandy_ring * 0.85)
        p.fill_rgb(np.array([0.70, 0.69, 0.66], np.float32) * (0.95 + 0.1 * grain)[..., None], apron)
        # perimeter road
        ring = smoothstep(6, 2, np.abs(d - r * 1.75)) if shape != 'rect' else np.zeros_like(d)
        p.fill((0.42, 0.42, 0.42), ring * 0.9)
        if trench is not None:
            p.fill((0.33, 0.33, 0.32), p.rect_mask(c[0], c[1], 22, r * 1.1, trench))
    # ---- buildings with their shadows (sun from the east-south-east, 50° up)
    sx, sy = -0.83, 0.55
    for lon, lat, w, h, hgt, col in BUILDINGS:
        c = ll2m([(lon, lat)])[0]
        if abs(c[0] - p.cx) > p.half + 300 or abs(c[1] - p.cy) > p.half + 300:
            continue
        L = hgt * 0.83
        # the shadow: the footprint swept along the sun's shadow direction = the hull of both ends
        pts = np.asarray(p.rect_pts(c[0], c[1], w, h) + p.rect_pts(c[0] + sx * L, c[1] + sy * L, w, h), dtype=np.float32)
        hull = cv2.convexHull(pts).reshape(-1, 2)
        shadow = p.poly_mask([hull])
        p.rgb *= (1 - 0.55 * shadow)[..., None]
        p.fill(col, p.rect_mask(c[0], c[1], w, h, 0.0))
    # ---- overall grain and a touch of saturation
    g = (0.96 + 0.08 * grain)[..., None]
    p.rgb = np.clip(p.rgb * g, 0, 1)
    lum = (p.rgb[..., 0] * 0.3 + p.rgb[..., 1] * 0.59 + p.rgb[..., 2] * 0.11)[..., None]
    p.rgb = np.clip((p.rgb - lum) * 1.08 + lum, 0, 1)


# pad-level ground markings in pad-local metres (x east, y north; the 3D scene's z = −y)
# slabs: (cx, cy, w, h, colour); circles: (cx, cy, r, colour); trench: (w, length) or None
CONCRETE = (0.72, 0.71, 0.66)
OLD_CONCRETE = (0.62, 0.61, 0.57)
STEEL_PLATE = (0.50, 0.51, 0.52)
SPHERE_PAD = (0.68, 0.68, 0.65)
PAD_SPECS = {
    'lc39a-starship': {
        'slabs': [(0, 0, 46, 46, CONCRETE), (0, 0, 28, 28, STEEL_PLATE), (-32, 0, 15, 15, STEEL_PLATE), (-150, 120, 70, 54, CONCRETE), (-32, 0, 50, 22, OLD_CONCRETE)],
        'circles': [(-210, -90, 8, CONCRETE), (-150, 120, 0, CONCRETE)],
        'trench': (18, 150, 0.0, 58),  # the Shuttle-era trench, east of the mount
        'tanks': [(-150, 120, 'vertical')],
    },
    'lc39a-fss': {
        'slabs': [(0, 0, 70, 70, CONCRETE), (-36, 8, 14, 14, OLD_CONCRETE), (220, 330, 60, 60, SPHERE_PAD), (220, -330, 60, 60, SPHERE_PAD)],
        'circles': [(-230, -70, 8, CONCRETE)],
        'trench': (18, 150, 0.0, 0),
        'tanks': [(220, 330, 'spheres'), (220, -330, 'spheres')],
    },
    'lc39a-lut': {
        'slabs': [(0, 0, 80, 80, CONCRETE), (-8, 0, 49, 41, OLD_CONCRETE), (220, 330, 60, 60, SPHERE_PAD), (220, -330, 60, 60, SPHERE_PAD)],
        'circles': [(-230, -70, 8, CONCRETE)],
        'trench': (18, 150, 0.0, 0),
        'tanks': [(220, 330, 'spheres'), (220, -330, 'spheres')],
    },
    'lc39b-ml': {
        'slabs': [(0, 0, 60, 150, CONCRETE), (0, 0, 48, 41, OLD_CONCRETE), (200, 330, 60, 60, SPHERE_PAD), (200, -330, 60, 60, SPHERE_PAD)],
        'circles': [(-240, 60, 8, CONCRETE)] + [(math.cos(i / 3 * 2 * math.pi + 0.5) * 210, -math.sin(i / 3 * 2 * math.pi + 0.5) * 210, 9, CONCRETE) for i in range(3)],
        'trench': (18, 150, 0.0, 0),
        'tanks': [(200, 330, 'spheres'), (200, -330, 'spheres')],
    },
    'lc36': {
        'slabs': [(0, 0, 90, 90, CONCRETE), (0, 0, 26, 26, OLD_CONCRETE), (180, 40, 40, 50, CONCRETE)],
        'circles': [(-90, -60, 6, CONCRETE), (90, 70, 6, CONCRETE), (-200, 120, 8, CONCRETE)],
        'trench': (14, 90, 0.0, 0),
        'tanks': [],
    },
    'slc37': {
        'slabs': [(0, 0, 80, 80, CONCRETE), (0, 0, 24, 24, OLD_CONCRETE), (-26, 0, 13, 13, OLD_CONCRETE), (200, 200, 50, 50, SPHERE_PAD)],
        'circles': [(math.cos(i / 4 * 2 * math.pi + 0.4) * 150, -math.sin(i / 4 * 2 * math.pi + 0.4) * 150, 7, CONCRETE) for i in range(4)] + [(-200, -120, 8, CONCRETE)],
        'trench': (16, 80, 0.0, 0),
        'tanks': [(200, 200, 'spheres')],
    },
}


def paint_pad_details(p: Painter, pad_id: str, origin):
    """the ground at the pad: slabs, the trench and deflector, tank-farm pads, expansion joints,
    scorch, the access road; `origin` is the pad centre in 39A-local metres"""
    spec = PAD_SPECS[pad_id]
    ox, oy = origin
    grain = p.vnoise(max(p.mpp * 1.5, 1.2), 91)
    # expansion joints on the apron (only legible at pad scale)
    if p.mpp < 2.5:
        d = np.hypot(p.X - ox, p.Y - oy)
        apron_r = 230 if pad_id.startswith('lc39') else 150 if pad_id == 'lc36' else 120
        inside = smoothstep(apron_r, apron_r - 3, d)
        jx = smoothstep(0.45, 0.2, np.abs(np.mod(p.X - ox, 7.5) - 3.75) - 3.75 + 0.45)
        jy = smoothstep(0.45, 0.2, np.abs(np.mod(p.Y - oy, 7.5) - 3.75) - 3.75 + 0.45)
        joints = np.maximum(jx, jy) * inside
        p.rgb *= (1 - 0.12 * joints)[..., None]
        # panel-to-panel tint differences
        panel = p.vnoise(7.5, 93)
        p.rgb *= (0.96 + 0.08 * panel * inside)[..., None]
    for cx, cy, w, h, col in spec['slabs']:
        p.fill_rgb(np.asarray(col, np.float32) * (0.95 + 0.1 * grain)[..., None], p.rect_mask(ox + cx, oy + cy, w, h, 0.0))
    for cx, cy, r, col in spec['circles']:
        if r <= 0:
            continue
        p.fill(col, smoothstep(r + p.mpp, r - p.mpp, np.hypot(p.X - ox - cx, p.Y - oy - cy)))
    if spec['trench']:
        w, L, hdg, offx = spec['trench']
        tm = p.rect_mask(ox + offx, oy, w, L, hdg)
        p.fill((0.30, 0.30, 0.30), tm)
        # the deflector's ridge and the scorched walls
        p.fill((0.20, 0.20, 0.20), p.rect_mask(ox + offx, oy, w * 0.5, L * 0.25, hdg) * 0.8)
    # scorch around the mount
    d0 = np.hypot(p.X - ox, p.Y - oy)
    scorch = smoothstep(70, 12, d0) * 0.55
    p.rgb *= (1 - scorch * (0.6 + 0.4 * p.fbm(9, 97, 3)))[..., None]
    # the access road from the perimeter ring to the apron (from the west), and the crawlerway ramp
    if pad_id.startswith('lc39'):
        p.fill((0.42, 0.42, 0.42), p.rect_mask(ox - 320, oy - 60, 10, 190, 90.0) * 0.9)
    else:
        p.fill((0.42, 0.42, 0.42), p.rect_mask(ox - 240, oy, 10, 200, 90.0) * 0.9)
    # drainage ditches along the perimeter at the fine scales
    if p.mpp < 5:
        ring_r = 230 * 1.75 if pad_id.startswith('lc39') else 150 * 1.75 if pad_id == 'lc36' else 120 * 1.75
        ditch = smoothstep(5, 2, np.abs(d0 - (ring_r + 14)))
        p.fill((0.30, 0.34, 0.26), ditch * 0.6)


def save_tile(p: Painter, path_rgb, path_alpha=None, quality=86, path_water=None):
    Image.fromarray((np.clip(p.rgb, 0, 1) * 255).astype(np.uint8)).save(path_rgb, quality=quality, optimize=True, subsampling=0)
    if path_alpha:
        Image.fromarray((np.clip(p.alpha, 0, 1) * 255).astype(np.uint8)).save(path_alpha, optimize=True)
    if path_water and p.water is not None:
        w = Image.fromarray((np.clip(p.water, 0, 1) * 255).astype(np.uint8))
        w.resize((min(2048, p.n), min(2048, p.n)), Image.LANCZOS).save(path_water, quality=80, optimize=True)


# the pads (lon, lat) and the Cape tile each one uses; tile centres in 39A-local metres
SITE_LL = {'lc39a': (-80.6041, 28.6083), 'lc39b': (-80.6209, 28.6272), 'slc37': (-80.5649, 28.5317), 'lc36': (-80.5431, 28.471)}
PAD_SITE_OF = {'lc39a-starship': 'lc39a', 'lc39b-ml': 'lc39b', 'lc39a-fss': 'lc39a', 'lc39a-lut': 'lc39a', 'lc36': 'lc36', 'slc37': 'slc37'}
CAPE_TILES = {'39': (-80.6041, 28.6083), 'ccsfs': (-80.5540, 28.5010)}
CAPE_TILE_OF = {'lc39a': '39', 'lc39b': '39', 'slc37': 'ccsfs', 'lc36': 'ccsfs'}


def paint_quadrants(n, half, cx, cy, detail, margin_m=1200.0):
    """paint a big tile as 2×2 overlapping quadrants (the noise is in metres, so they match; the
    overlap covers the distance-based features at the inner edges) and stitch them — a quarter of
    the memory of painting it whole"""
    q = n // 2
    mpp = 2 * half / n
    margin = int(math.ceil(margin_m / mpp))
    qhalf = (q + 2 * margin) * mpp / 2
    rgb = np.zeros((n, n, 3), dtype=np.float32)
    alpha = np.zeros((n, n), dtype=np.float32)
    water = np.zeros((n, n, 3), dtype=np.float32)
    for row in range(2):
        for col in range(2):
            # centre of this quadrant in metres (row 0 = north)
            qcx = cx + (col - 0.5) * q * mpp
            qcy = cy - (row - 0.5) * q * mpp
            print(f'  quadrant {row},{col} …', flush=True)
            p = Painter(q + 2 * margin, qhalf, qcx, qcy)
            paint_cape(p, detail)
            rgb[row * q:(row + 1) * q, col * q:(col + 1) * q] = p.rgb[margin:margin + q, margin:margin + q]
            alpha[row * q:(row + 1) * q, col * q:(col + 1) * q] = p.alpha[margin:margin + q, margin:margin + q]
            if p.water is not None:
                water[row * q:(row + 1) * q, col * q:(col + 1) * q] = p.water[margin:margin + q, margin:margin + q]
            del p
    out = Painter.__new__(Painter)
    out.n = n
    out.half = half
    out.cx = cx
    out.cy = cy
    out.mpp = mpp
    out.rgb = rgb
    out.alpha = alpha
    out.water = water
    return out


def cape(args):
    """the two ±24 km tiles (around LC-39 and around the Cape's own pads)"""
    out = 'public/assets/cape'
    os.makedirs(out, exist_ok=True)
    for key, (lon, lat) in CAPE_TILES.items():
        if args.only and args.only != key:
            continue
        c = ll2m([(lon, lat)])[0]
        print(f'cape tile {key} at {c.round(0)} …', flush=True)
        p = paint_quadrants(args.n, 24_000.0, float(c[0]), float(c[1]), 'cape')
        save_tile(p, f'{out}/cape-{key}.jpg', f'{out}/cape-{key}-alpha.png', path_water=f'{out}/cape-{key}-water.jpg')
    print('done', flush=True)


def complex_tiles(args):
    """±4 km around each launch site at 2048² (3.9 m/px)"""
    out = 'public/assets/cape'
    os.makedirs(out, exist_ok=True)
    for site, (lon, lat) in SITE_LL.items():
        if args.only and args.only != site:
            continue
        c = ll2m([(lon, lat)])[0]
        print(f'complex tile {site} …', flush=True)
        p = Painter(args.n, 4_000.0, float(c[0]), float(c[1]))
        paint_cape(p, 'complex')
        for pad_id, s in PAD_SITE_OF.items():
            if s == site:
                paint_pad_details(p, pad_id, (float(c[0]), float(c[1])))
                break
        save_tile(p, f'{out}/complex-{site}.jpg', f'{out}/complex-{site}-alpha.png')
    print('done', flush=True)


def pad_tiles(args):
    """±1 km around each pad at 2048² (1 m/px), one per pad layout"""
    out = 'public/assets/cape'
    os.makedirs(out, exist_ok=True)
    for pad_id, site in PAD_SITE_OF.items():
        if args.only and args.only != pad_id:
            continue
        lon, lat = SITE_LL[site]
        c = ll2m([(lon, lat)])[0]
        print(f'pad tile {pad_id} …', flush=True)
        p = Painter(args.n, 1_000.0, float(c[0]), float(c[1]))
        paint_cape(p, 'pad')
        paint_pad_details(p, pad_id, (float(c[0]), float(c[1])))
        save_tile(p, f'{out}/pad-{pad_id}.jpg', f'{out}/pad-{pad_id}-alpha.png')
    print('done', flush=True)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('what', choices=['region', 'cape', 'complex', 'pad'])
    ap.add_argument('--only')
    ap.add_argument('--ne')
    ap.add_argument('--bluemarble')
    ap.add_argument('--water')
    ap.add_argument('--n', type=int, default=4096)
    ap.add_argument('--preview')
    a = ap.parse_args()
    if a.what == 'region':
        region(a)
    elif a.what == 'cape':
        cape(a)
    elif a.what == 'complex':
        complex_tiles(a)
    elif a.what == 'pad':
        pad_tiles(a)
