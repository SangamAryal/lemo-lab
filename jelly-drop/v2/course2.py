"""Jelly Drop v2 — five rounds (0/25/50/75/100% soft) on a longer course, built and rendered from code in Blender 4.2 (Eevee).
   blender -b -P course2.py -- <softness 0|25|50|75|100> <out_dir> [--bake-only] [--scale 75] [--first N --last M]
One course: a glossy coral ball dropped into a gold funnel whose neck is narrower than the ball, above a clay pedestal, in a
pale-teal studio sweep. 'rigid' = rigid-body ball (it jams in the neck); 'soft' = cloth with internal pressure (it squeezes
through and splats). Writes <out_dir>/track.json (ball centre + speed per frame, for the sound design) and frames ####.webp."""
import bpy, bmesh, math, json, os, sys
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
LEVEL = int(argv[0]); MODE = 'rigid' if LEVEL == 0 else 'soft'; OUT = os.path.abspath(argv[1]); BAKE_ONLY = '--bake-only' in argv
def opt(k, d): return int(argv[argv.index(k) + 1]) if k in argv else d
SCALE, FPS, NF = opt('--scale', 100), 30, opt('--frames', 280)
F0, F1 = opt('--first', 1), opt('--last', NF)
os.makedirs(OUT, exist_ok=True)

def hexc(h): h = h.lstrip('#'); return [((int(h[i:i + 2], 16) / 255) / 12.92) if int(h[i:i + 2], 16) / 255 <= .04045 else (((int(h[i:i + 2], 16) / 255) + .055) / 1.055) ** 2.4 for i in (0, 2, 4)] + [1]

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'BLENDER_EEVEE_NEXT'; sc.render.fps = FPS; sc.frame_start, sc.frame_end = 1, NF
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = 1080, 1920, SCALE
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'
ee = sc.eevee
for k, v in (('taa_render_samples', 32), ('use_raytracing', True), ('use_shadows', True), ('shadow_ray_count', 2), ('shadow_step_count', 8)):
    try: setattr(ee, k, v)
    except Exception: pass
try: ee.ray_tracing_options.resolution_scale = '2'
except Exception: pass
sc.render.image_settings.file_format = 'WEBP'; sc.render.image_settings.quality = 90
sc.world = bpy.data.worlds.new('W'); sc.world.use_nodes = True
bg = sc.world.node_tree.nodes['Background']; bg.inputs[0].default_value = hexc('#f6dcc8'); bg.inputs[1].default_value = .35

def mat(name, col, rough=.5, metal=0., coat=0., sss=0., noise=0.):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = hexc(col); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    try: b.inputs['Coat Weight'].default_value = coat; b.inputs['Subsurface Weight'].default_value = sss
    except Exception: pass
    if noise:                                                      # a fine clay grain: noise → bump
        tn = nt.nodes.new('ShaderNodeTexNoise'); tn.inputs['Scale'].default_value = 60; bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = noise
        nt.links.new(tn.outputs['Fac'], bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m
M_BACK = mat('backdrop', '#f3d3bd', .8); M_CLAY = mat('terracotta', '#d9826a', .65, noise=.15); M_GOLD = mat('gold', '#ffc66b', .22, 1.)
M_CER = mat('ceramic', '#fbf7f2', .18, coat=.6)
M_BALL = mat('grape', '#8b5cf6', .1, 0., coat=1., sss=.35)

def link(ob): sc.collection.objects.link(ob); return ob
def lathe(name, prof, seg=96):                                     # revolve a (r, z) profile around Z
    me = bpy.data.meshes.new(name); bm = bmesh.new(); rings = []
    for (r, z) in prof: rings.append([bm.verts.new((r * math.cos(2 * math.pi * i / seg), r * math.sin(2 * math.pi * i / seg), z)) for i in range(seg)])
    for a, b in zip(rings, rings[1:]):
        for i in range(seg): j = (i + 1) % seg; bm.faces.new((a[i], a[j], b[j], b[i]))
    bm.to_mesh(me); bm.free(); return link(bpy.data.objects.new(name, me))

# studio sweep: floor that curves up into the back wall
me = bpy.data.meshes.new('sweep'); bm = bmesh.new(); prof = [(y, 0) for y in (-8, -1)] + [(-1 + 3 * math.sin(a), 3 - 3 * math.cos(a)) for a in [i / 12 * math.pi / 2 for i in range(1, 13)]] + [(2, 12)]
cols = [[bm.verts.new((x, -y if False else y, z)) for (y, z) in prof] for x in (-8, 8)]
for i in range(len(prof) - 1): bm.faces.new((cols[0][i], cols[1][i], cols[1][i + 1], cols[0][i + 1]))
bm.to_mesh(me); bm.free(); sweep = link(bpy.data.objects.new('Sweep', me)); sweep.data.materials.append(M_BACK); sweep.location.y = 1.2
for p in sweep.data.polygons: p.use_smooth = True

# terracotta pedestal with a gold inlay, a slowly spinning gold turntable on top, the gold funnel on two rods
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, .6)); ped = bpy.context.object; ped.scale = (2.6, 1.8, 1.2); ped.name = 'Pedestal'
bv = ped.modifiers.new('bv', 'BEVEL'); bv.width = .03; bv.segments = 3; ped.data.materials.append(M_CLAY)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 1.0)); inl = bpy.context.object; inl.scale = (2.62, 1.82, .025); inl.data.materials.append(M_GOLD)
bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=1.0, depth=.08, location=(0, 0, 1.24)); tt_ = bpy.context.object; tt_.name = 'Turntable'; tt_.data.materials.append(M_GOLD)
tb = tt_.modifiers.new('bv', 'BEVEL'); tb.width = .02; tb.segments = 2
for i in range(8):
    a_ = i / 8 * math.pi; bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 1.285), rotation=(0, 0, a_)); r_ = bpy.context.object; r_.scale = (1.9, .025, .01); r_.data.materials.append(M_CER); r_.parent = tt_; r_.location = (0, 0, .045)
tt_.rotation_euler = (0, 0, 0); tt_.keyframe_insert('rotation_euler', frame=1); tt_.rotation_euler = (0, 0, -2 * math.pi * NF / 240); tt_.keyframe_insert('rotation_euler', frame=NF)
for fc in tt_.animation_data.action.fcurves:
    for k in fc.keyframe_points: k.interpolation = 'LINEAR'
NECK = float(os.environ.get('NECK', .22))
fun = lathe('Funnel', [(1.05, 3.12), (.95, 3.06), (.62, 2.9), (NECK, 2.66), (NECK, 2.38)]); fun.data.materials.append(M_GOLD)
sol = fun.modifiers.new('wall', 'SOLIDIFY'); sol.thickness = .045; sol.offset = 1
for p in fun.data.polygons: p.use_smooth = True
for sgn in (-1, 1):
    bpy.ops.mesh.primitive_cylinder_add(radius=.035, depth=1.6, location=(sgn * 1.55, 0, 3.2), rotation=(0, math.pi / 2, 0)); bpy.context.object.data.materials.append(M_GOLD)
    bpy.ops.mesh.primitive_cube_add(size=.5, location=(sgn * 2.45, 0, 3.2)); b_ = bpy.context.object; b_.scale = (1, 1, .9); bb = b_.modifiers.new('bv', 'BEVEL'); bb.width = .02; bb.segments = 3; b_.data.materials.append(M_CLAY)

# two glossy ceramic ramps in a zig-zag (gold edge strips), each held by a gold rod from the back wall
RAILS = []
def ramp(name, loc, ang, length=1.9):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=(0, ang, 0)); r = bpy.context.object; r.name = name; r.scale = (length, .9, .08)
    rb = r.modifiers.new('bv', 'BEVEL'); rb.width = .02; rb.segments = 3; r.data.materials.append(M_CER)
    for sy in (-1, 1):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(loc[0], loc[1] + sy * .47, loc[2] + .1), rotation=(0, ang, 0)); e = bpy.context.object; e.scale = (length, .04, .1); e.data.materials.append(M_GOLD)
    bpy.ops.mesh.primitive_cylinder_add(radius=.03, depth=1.2, location=(loc[0], .9, loc[2]), rotation=(math.pi / 2, 0, 0)); bpy.context.object.data.materials.append(M_GOLD)
    return r
RA = float(os.environ.get('RA', .36))
ramp1 = ramp('Ramp1', (-1.15, 0, 5.25), RA); ramp2 = ramp('Ramp2', (.95, 0, 4.15), -RA, 1.7)

# the gummy: a rounded grape-jelly cube
G = .56; START = Vector((float(os.environ.get('SX', -1.75)), 0, 6.05))
bpy.ops.mesh.primitive_cube_add(size=G, location=START); ball = bpy.context.object; ball.name = 'Gummy'
gb = ball.modifiers.new('bv', 'BEVEL'); gb.width = .12; gb.segments = 4; gs = ball.modifiers.new('sub', 'SUBSURF'); gs.levels = 1 if MODE == 'soft' else 2
bpy.ops.object.modifier_apply(modifier='bv'); bpy.ops.object.modifier_apply(modifier='sub')
bpy.ops.object.shade_smooth(); ball.data.materials.append(M_BALL)
R = G / 2

# physics: softness level → stiffness and the pressure it squeezes at
LV = {25: (500, 30), 50: (14, 4), 75: (5, 2), 100: (2, 1.2)}
FR = {25: 3, 50: 2.5, 75: 1, 100: 0}                               # how hard the funnel grips each jelly
RAMPS = (ramp1, ramp2, *RAILS)
# the ramps are ridden as a firm rigid body in every round (cloth will not slide reliably); in the soft rounds the gummy switches
# to a pressurised cloth jelly at PIN, once it has settled into the funnel, where the softness decides whether it gets through
bpy.ops.rigidbody.world_add(); rw = sc.rigidbody_world; rw.substeps_per_frame = 20; rw.solver_iterations = 20; rw.point_cache.frame_start, rw.point_cache.frame_end = 1, NF
for ob, typ, shape in ((ball, 'ACTIVE', 'CONVEX_HULL'), (fun, 'PASSIVE', 'MESH'), (ped, 'PASSIVE', 'BOX'), (sweep, 'PASSIVE', 'MESH'), (ramp1, 'PASSIVE', 'BOX'), (ramp2, 'PASSIVE', 'BOX'), (tt_, 'PASSIVE', 'CYLINDER'), *[(e, 'PASSIVE', 'BOX') for e in RAILS]):
    bpy.context.view_layer.objects.active = ob; ob.select_set(True); bpy.ops.rigidbody.object_add(); ob.rigid_body.type = typ; ob.rigid_body.collision_shape = shape
    ob.rigid_body.friction = .25 if ob in RAMPS else .5; ob.rigid_body.restitution = .3; ob.rigid_body.collision_margin = .005; ob.select_set(False)
    if ob is tt_: ob.rigid_body.kinematic = True
ball.rigid_body.mass = .4; ball.rigid_body.linear_damping = .02; ball.rigid_body.angular_damping = .1
PIN, jel = 10 ** 6, None
if MODE == 'soft':
    prev = None
    for f in range(1, NF + 1):                                       # find when the rigid gummy has settled in the funnel
        sc.frame_set(f); m = ball.evaluated_get(bpy.context.evaluated_depsgraph_get()).matrix_world.copy(); p = m.translation
        if prev is not None and abs(p.x) < .6 and p.z < 3.3 and (p - prev).length < .012: PIN, MPIN = f, m; break
        prev = p.copy()
    PIN = int(os.environ.get('PIN', PIN)); print('PIN', PIN, flush=True)
    jel = bpy.data.objects.new('Jelly', ball.data.copy()); link(jel); jel.matrix_world = MPIN
    for ob, show in ((ball, (1, PIN - 1)), (jel, (PIN, NF))):        # swap visibility at PIN
        for f in (1, PIN - 1, PIN, NF):
            ob.hide_render = ob.hide_viewport = not (show[0] <= f <= show[1]); ob.keyframe_insert('hide_render', frame=f); ob.keyframe_insert('hide_viewport', frame=f)
    st, pr_ = LV[LEVEL]
    for ob in (fun, ped, sweep, ramp1, ramp2, tt_):
        ob.modifiers.new('col', 'COLLISION'); ob.collision.thickness_outer = .02
        ob.collision.cloth_friction = float(os.environ.get('FRIC', FR[LEVEL])) if ob is fun else 8; ob.collision.damping = .2 if ob is fun else .6
    cl = jel.modifiers.new('cloth', 'CLOTH'); s = cl.settings; cs = cl.collision_settings
    s.quality = 10; s.mass = float(os.environ.get('MASS', 1.0)); s.air_damping = .3; s.bending_stiffness = .2 + st * .05
    s.tension_damping = s.compression_damping = s.shear_damping = 4; s.use_pressure = True; s.use_internal_springs = False
    P1, P2 = float(os.environ.get('PRESS', pr_)), float(os.environ.get('PRESS2', max(4, pr_))); PF = int(os.environ.get('PFRAME', 10 ** 6)); SL = float(os.environ.get('STIFF', st))
    def key(f, p, fac, k):
        if 1 <= f <= NF:
            s.uniform_pressure_force = p; s.pressure_factor = fac; s.tension_stiffness = s.compression_stiffness = s.shear_stiffness = k
            for prop in ('uniform_pressure_force', 'pressure_factor', 'tension_stiffness', 'compression_stiffness', 'shear_stiffness'): s.keyframe_insert(prop, frame=f)
    key(PIN, 5, 6, 60); key(PIN + 8, P1, 1, SL)                      # it arrives firm, then relaxes to its softness
    if PF < NF: key(PF, P1, 1, SL); key(PF + 12, P2, 3, SL); key(PF + 30, P2, float(os.environ.get('PFAC2', 8)), SL)
    cs.collision_quality = 5; cs.distance_min = .008; cs.use_self_collision = False; cs.friction = float(os.environ.get('CFRIC', .5))
    cl.point_cache.frame_start, cl.point_cache.frame_end = PIN, NF
    sm = jel.modifiers.new('smooth', 'SMOOTH'); sm.factor = .5; sm.iterations = 4
    ss_ = jel.modifiers.new('sub', 'SUBSURF'); ss_.levels = ss_.render_levels = 1
    jel.data.materials.clear(); jel.data.materials.append(M_BALL)

# lights and camera
def area(name, loc, energy, size, col='#ffffff'):
    L = bpy.data.lights.new(name, 'AREA'); L.energy = energy; L.size = size; L.color = hexc(col)[:3]; o = link(bpy.data.objects.new(name, L)); o.location = loc
    o.rotation_euler = (Vector((0, 0, 3.2)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler(); return o
area('key', (-4, -5, 8), 1300, 5); area('fill', (5, -4, 4), 420, 6, '#fff3ea'); area('rim', (2.5, 3.5, 7.5), 650, 4, '#ffe6d0')
cam = link(bpy.data.objects.new('Cam', bpy.data.cameras.new('Cam'))); sc.camera = cam; cam.data.lens = 30; cam.data.sensor_fit = 'VERTICAL'
cam.location = (0, -10.0, 7.6); cam.rotation_euler = (Vector((0, 0, 3.3)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
try: cam.data.dof.use_dof = True; cam.data.dof.focus_distance = 11.0; cam.data.dof.aperture_fstop = 5.6
except Exception: pass

# simulate (frame by frame, in order) and record the ball's centre for timing and sound
dg = bpy.context.evaluated_depsgraph_get(); track = []
for f in range(1, NF + 1):
    sc.frame_set(f); dg = bpy.context.evaluated_depsgraph_get(); ev = (jel if f >= PIN else ball).evaluated_get(dg)
    if f < PIN: c = ev.matrix_world.translation.copy(); squash = 1.
    else:
        vs = [ev.matrix_world @ v.co for v in ev.data.vertices]; c = sum(vs, Vector()) / len(vs); zs = [v.z for v in vs]; xs = [v.x for v in vs]; squash = (max(zs) - min(zs)) / (max(xs) - min(xs) + 1e-6)
    track.append({'f': f, 'x': round(c.x, 4), 'y': round(c.y, 4), 'z': round(c.z, 4), 'squash': round(squash, 3)})
json.dump({'mode': MODE, 'level': LEVEL, 'pin': PIN if PIN < 10 ** 6 else None, 'fps': FPS, 'neck': NECK, 'radius': R, 'track': track}, open(os.path.join(OUT, 'track.json'), 'w'))
print('TRACK', MODE, [(t['f'], t['z'], t['squash']) for t in track[::10]], flush=True)
if BAKE_ONLY: sys.exit(0)
for f in range(F0, F1 + 1):
    sc.frame_set(f); sc.render.filepath = os.path.join(OUT, f'{f:04d}'); bpy.ops.render.render(write_still=True)
    if f % 15 == 0: print('frame', f, flush=True)
print('done', MODE)
