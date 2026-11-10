"""Blender test for "What If Earth Had Rings?" — builds the opening (about 15 s) in 3D and renders it with Eevee.
   blender -b -P scene.py -- <frames_dir> [first last]
Blender draws only the 3D world (Earth, its ring, the orbiting rocks, the habitable zone, Earth's orbit) on a transparent
background, with toon (cel) shading: Shader-to-RGB through a two-step colour ramp, plus an inked outline (an inverted hull).
The page (main.js) then lays it over our 2D parallax stars and adds the 2D Sun and Earth's face (from proj.json, the per-frame
screen positions this script writes), the titles and the captions. The camera move matches the 2.5D test."""
import bpy, bmesh, math, json, os, sys
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.abspath(argv[0] if argv else 'frames'); F0 = int(argv[1]) if len(argv) > 1 else 0
FPS, DUR, W, H = 24, 14.95, 1080, 1920
NF = int(DUR * FPS); F1 = int(argv[2]) if len(argv) > 2 else NF - 1
T = {'spot': 4.687, 'newW': 7.047, 'earth3': 10.352}

def clamp(x, a=0., b=1.): return max(a, min(b, x))
def seg(t, a, b): return clamp((t - a) / (b - a))
def ss(x): return x * x * (3 - 2 * x)
def eio(x): return 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2
def lerp(a, b, k): return a + (b - a) * k
def hexc(h, a=1.): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)) + (a,)
def lin(c): return tuple(((x / 12.92) if x <= .04045 else ((x + .055) / 1.055) ** 2.4) if i < 3 else x for i, x in enumerate(c))

# ───────── fresh scene, Eevee, transparent film, standard view transform (so our flat colours stay flat)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = W, H, 100
sc.render.fps = FPS; sc.render.film_transparent = True
sc.view_settings.view_transform = 'Standard'; sc.view_settings.look = 'None'
try: sc.eevee.taa_render_samples = 16
except Exception: pass
sc.render.image_settings.file_format = 'WEBP'; sc.render.image_settings.color_mode = 'RGBA'; sc.render.image_settings.quality = 92
sc.world = bpy.data.worlds.new('W'); sc.world.use_nodes = True; sc.world.node_tree.nodes['Background'].inputs[1].default_value = 0

# ───────── toon material: (lit colour) → Shader-to-RGB → constant ramp (shadow tone | lit tone) → emission
def toon(name, base_node_fn, shadow=.62, alpha_fn=None, backface=False):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; L = nt.links; N.clear()
    out = N.new('ShaderNodeOutputMaterial'); diff = N.new('ShaderNodeBsdfDiffuse'); s2r = N.new('ShaderNodeShaderToRGB')
    ramp = N.new('ShaderNodeValToRGB'); ramp.color_ramp.interpolation = 'CONSTANT'
    ramp.color_ramp.elements[0].position = 0; ramp.color_ramp.elements[0].color = (shadow, shadow, shadow, 1)
    ramp.color_ramp.elements[1].position = .12; ramp.color_ramp.elements[1].color = (1, 1, 1, 1)
    L.new(diff.outputs[0], s2r.inputs[0]); L.new(s2r.outputs[0], ramp.inputs[0])
    col = base_node_fn(N, L)                                       # an output socket with the flat base colour
    mixm = N.new('ShaderNodeMix'); mixm.data_type = 'RGBA'; mixm.blend_type = 'MULTIPLY'; mixm.inputs[0].default_value = 1
    L.new(col, mixm.inputs[6]); L.new(ramp.outputs[0], mixm.inputs[7])
    em = N.new('ShaderNodeEmission'); L.new(mixm.outputs[2], em.inputs[0])
    if alpha_fn:
        tr = N.new('ShaderNodeBsdfTransparent'); mx = N.new('ShaderNodeMixShader'); L.new(alpha_fn(N, L), mx.inputs[0]); L.new(tr.outputs[0], mx.inputs[1]); L.new(em.outputs[0], mx.inputs[2]); L.new(mx.outputs[0], out.inputs[0])
        for attr, val in (('blend_method', 'HASHED'), ('surface_render_method', 'DITHERED')):
            try: setattr(m, attr, val)
            except Exception: pass
    else: L.new(em.outputs[0], out.inputs[0])
    m.use_backface_culling = backface
    return m

def flat(hexcol):
    def f(N, L): r = N.new('ShaderNodeRGB'); r.outputs[0].default_value = lin(hexc(hexcol)); return r.outputs[0]
    return f

# Earth: ocean + noise continents + polar caps (procedural, object space)
def earth_col(N, L):
    tc = N.new('ShaderNodeTexCoord'); nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 1.6; nz.inputs['Detail'].default_value = 2
    try: nz.inputs['Roughness'].default_value = .45
    except Exception: pass
    L.new(tc.outputs['Object'], nz.inputs['Vector'])
    rp = N.new('ShaderNodeValToRGB'); rp.color_ramp.interpolation = 'CONSTANT'
    rp.color_ramp.elements[0].position = 0; rp.color_ramp.elements[0].color = lin(hexc('#3d8be8'))
    rp.color_ramp.elements[1].position = .56; rp.color_ramp.elements[1].color = lin(hexc('#5fcf7a'))
    L.new(nz.outputs['Fac'], rp.inputs[0])
    sep = N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['Object'], sep.inputs[0]); ab = N.new('ShaderNodeMath'); ab.operation = 'ABSOLUTE'; L.new(sep.outputs[2], ab.inputs[0])
    cap = N.new('ShaderNodeMath'); cap.operation = 'GREATER_THAN'; cap.inputs[1].default_value = .9; L.new(ab.outputs[0], cap.inputs[0])
    mx = N.new('ShaderNodeMix'); mx.data_type = 'RGBA'; L.new(cap.outputs[0], mx.inputs[0]); L.new(rp.outputs[0], mx.inputs[6]); mx.inputs[7].default_value = (1, 1, 1, 1)
    return mx.outputs[2]

# ring: radial bands (by distance from the centre in object space) with per-band colour and opacity
BANDS = [(1.45, '#9a93a8', .55), (1.62, '#000000', 0), (1.68, '#c4bdd0', .9), (1.98, '#5d5670', .3), (2.05, '#aaa2ba', .8), (2.32, '#78708a', .45), (2.45, '#000000', 0)]
def ring_dist(N, L):
    tc = N.new('ShaderNodeTexCoord'); vl = N.new('ShaderNodeVectorMath'); vl.operation = 'LENGTH'; L.new(tc.outputs['Object'], vl.inputs[0]); return vl.outputs['Value']
def band_ramp(N, L, alpha):
    rp = N.new('ShaderNodeValToRGB'); rp.color_ramp.interpolation = 'CONSTANT'; e = rp.color_ramp.elements
    while len(e) < len(BANDS): e.new(0)
    for el, (r, c, a) in zip(e, BANDS): el.position = (r - 1.4) / 1.1; el.color = (a, a, a, 1) if alpha else lin(hexc(c))
    mp = N.new('ShaderNodeMapRange'); mp.inputs[1].default_value = 1.4; mp.inputs[2].default_value = 2.5; L.new(ring_dist(N, L), mp.inputs[0]); L.new(mp.outputs[0], rp.inputs[0])
    return rp.outputs[0]

INK = bpy.data.materials.new('ink'); INK.use_nodes = True; INK.node_tree.nodes.clear()
o_ = INK.node_tree.nodes.new('ShaderNodeOutputMaterial'); e_ = INK.node_tree.nodes.new('ShaderNodeEmission'); e_.inputs[0].default_value = lin(hexc('#17163f')); INK.node_tree.links.new(e_.outputs[0], o_.inputs[0]); INK.use_backface_culling = True

# ───────── objects. Blender is Z-up: the orbital plane is XY; the Sun sits at the origin, Earth at (12, 0, 0)
E = Vector((12, 0, 0))
bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=64, radius=1, location=E); earth = bpy.context.object; earth.name = 'Earth'
bpy.ops.object.shade_smooth()
earth.data.materials.append(toon('earth', earth_col)); earth.data.materials.append(INK)
sol = earth.modifiers.new('ink', 'SOLIDIFY'); sol.thickness = -.035; sol.use_flip_normals = True; sol.material_offset = 1; sol.use_rim = False

def annulus(name, r0, r1, n=256, loc=(0, 0, 0)):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); vi, vo = [], []
    for i in range(n): a = i / n * 2 * math.pi; vi.append(bm.verts.new((r0 * math.cos(a), r0 * math.sin(a), 0))); vo.append(bm.verts.new((r1 * math.cos(a), r1 * math.sin(a), 0)))
    for i in range(n): j = (i + 1) % n; bm.faces.new((vi[i], vo[i], vo[j], vi[j]))
    bm.to_mesh(me); bm.free(); ob = bpy.data.objects.new(name, me); ob.location = loc; sc.collection.objects.link(ob); return ob

TILT = .38
ringpivot = bpy.data.objects.new('ringpivot', None); ringpivot.location = E; ringpivot.rotation_euler = (0, -TILT, 0); sc.collection.objects.link(ringpivot)
ring = annulus('Ring', 1.45, 2.45); ring.parent = ringpivot
ring.data.materials.append(toon('ring', lambda N, L: band_ramp(N, L, False), shadow=.45, alpha_fn=lambda N, L: band_ramp(N, L, True)))

# orbiting rocks: one mesh of small icospheres scattered in the ring (it spins as a whole)
import random; random.seed(9)
me = bpy.data.meshes.new('rocks'); bm = bmesh.new()
for i in range(420):
    a = random.random() * 2 * math.pi; r = 1.45 + random.random(); s = .012 + random.random() ** 2 * .045
    m = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=s)
    bmesh.ops.translate(bm, verts=m['verts'], vec=(r * math.cos(a), r * math.sin(a), (random.random() - .5) * .05))
bm.to_mesh(me); bm.free(); rocks = bpy.data.objects.new('Rocks', me); sc.collection.objects.link(rocks); rocks.parent = ringpivot
rocks.data.materials.append(toon('rock', flat('#b2abbe'), shadow=.5))

# the habitable zone and Earth's orbit (flat, unlit, translucent; their opacity is keyed per frame)
def glass(name, hexcol):
    m = bpy.data.materials.new(name); m.use_nodes = True; N = m.node_tree.nodes; L = m.node_tree.links; N.clear()
    out = N.new('ShaderNodeOutputMaterial'); em = N.new('ShaderNodeEmission'); em.inputs[0].default_value = lin(hexc(hexcol)); tr = N.new('ShaderNodeBsdfTransparent'); mx = N.new('ShaderNodeMixShader'); mx.name = 'mix'
    mx.inputs[0].default_value = 0; L.new(tr.outputs[0], mx.inputs[1]); L.new(em.outputs[0], mx.inputs[2]); L.new(mx.outputs[0], out.inputs[0])
    for attr, val in (('blend_method', 'BLEND'), ('surface_render_method', 'BLENDED')):
        try: setattr(m, attr, val)
        except Exception: pass
    try: m.shadow_method = 'NONE'
    except Exception: pass
    return m
hz = annulus('HZ', 10.2, 13.8, 256); hzm = glass('hz', '#5fcf7a'); hz.data.materials.append(hzm)
orb = annulus('Orbit', 11.96, 12.04, 512); orm = glass('orbit', '#ffffff'); orb.data.materials.append(orm)
for ob in (hz, orb):
    try: ob.visible_shadow = False
    except Exception: pass

# light from the Sun (hard edged), plus a little fill so the shadow side keeps its colour
sun = bpy.data.lights.new('sun', 'SUN'); sun.energy = 4; sun.angle = math.radians(.5); sunob = bpy.data.objects.new('Sun', sun); sc.collection.objects.link(sunob)
sunob.rotation_euler = Vector((1, 0, 0)).to_track_quat('-Z', 'Y').to_euler()   # shines along +X (from the Sun toward Earth)
try: sun.use_shadow = True
except Exception: pass

# ───────── camera: orbit → crane up over the Sun → swoop back (same parameters as the 2.5D test, mapped to Z-up)
cam = bpy.data.objects.new('Cam', bpy.data.cameras.new('Cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.sensor_fit = 'VERTICAL'; cam.data.angle = math.radians(40); cam.data.clip_end = 500
def our2b(v): return Vector((v[0], -v[2], v[1]))                 # our (x, y-up, z) → Blender (x, -z, z-up)
def camp(t):
    tgtE = (12, .25, 0)
    A = (tgtE, 11.5, lerp(-.75, -.35, t / 4), lerp(.12, .2, t / 4))
    B = ((7.6, 0, 0), 31, math.pi / 2 - .12, 1.02)
    C = (tgtE, lerp(10.5, 9.2, ss(seg(t, 9, DUR))), lerp(-.25, .2, seg(t, 8.6, DUR)), .2)
    k1, k2 = eio(seg(t, 3.4, 6.2)), eio(seg(t, 8.3, 10.2))
    def m(a, b, k): return (tuple(lerp(a[0][i], b[0][i], k) for i in range(3)), lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k))
    c = m(m(A, B, k1), C, k2) if k2 > 0 else m(A, B, k1)
    tg, d, az, el = c; pos = (tg[0] + d * math.cos(el) * math.sin(az), tg[1] + d * math.sin(el), tg[2] + d * math.cos(el) * math.cos(az))
    return our2b(pos), our2b(tg), az, el

proj = []
for f in range(NF):
    t = f / FPS; sc.frame_set(f)
    p, tg, az, el = camp(t); cam.location = p; cam.rotation_euler = (tg - p).to_track_quat('-Z', 'Y').to_euler()
    earth.rotation_euler = (0, 0, t * .35); rocks.rotation_euler = (0, 0, t * .08); ring.rotation_euler = (0, 0, t * .05)
    zone = ss(seg(t, max(T['spot'], 5.4) - .5, max(T['spot'], 5.4) + .4)) * (1 - ss(seg(t, 8.4, 9.6)))
    orbk = ss(seg(t, 3.8, 5.2)) * (1 - ss(seg(t, 8.4, 9.6)))
    hzm.node_tree.nodes['mix'].inputs[0].default_value = .26 * zone; orm.node_tree.nodes['mix'].inputs[0].default_value = .4 * orbk
    for ob in (cam, earth, rocks, ring): ob.keyframe_insert('location') if ob is cam else None; ob.keyframe_insert('rotation_euler')
    hzm.node_tree.nodes['mix'].inputs[0].keyframe_insert('default_value', frame=f); orm.node_tree.nodes['mix'].inputs[0].keyframe_insert('default_value', frame=f)
    bpy.context.view_layer.update()
    def sp(v):                                                     # world → pixels (y down) + pixels per world unit at that depth
        c = world_to_camera_view(sc, cam, v); c2 = world_to_camera_view(sc, cam, v + cam.matrix_world.to_quaternion() @ Vector((0, 1, 0)))
        return [c.x * W, (1 - c.y) * H, abs((c2.y - c.y) * H), c.z]
    proj.append({'earth': sp(E), 'sun': sp(Vector((0, 0, 0))), 'az': az, 'el': el})
json.dump({'fps': FPS, 'frames': proj}, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'proj.json'), 'w'))

os.makedirs(OUT, exist_ok=True)
for f in range(F0, F1 + 1):
    sc.frame_set(f); sc.render.filepath = os.path.join(OUT, f'{f:04d}'); bpy.ops.render.render(write_still=True)
    if f % 24 == 0: print('frame', f, flush=True)
print('done', F0, F1)
