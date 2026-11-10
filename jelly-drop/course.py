"""Jelly Drop — "0% vs 100% soft" physics test, built and rendered from code in Blender 4.2 (Eevee).
   blender -b -P course.py -- <mode: rigid|soft> <out_dir> [--bake-only] [--scale 50] [--first N --last M]
One course: a glossy coral ball dropped into a gold funnel whose neck is narrower than the ball, above a clay pedestal, in a
pale-teal studio sweep. 'rigid' = rigid-body ball (it jams in the neck); 'soft' = cloth with internal pressure (it squeezes
through and splats). Writes <out_dir>/track.json (ball centre + speed per frame, for the sound design) and frames ####.webp."""
import bpy, bmesh, math, json, os, sys
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
MODE, OUT = argv[0], os.path.abspath(argv[1]); BAKE_ONLY = '--bake-only' in argv
def opt(k, d): return int(argv[argv.index(k) + 1]) if k in argv else d
SCALE, FPS, NF = opt('--scale', 100), 30, opt('--frames', 150)
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
bg = sc.world.node_tree.nodes['Background']; bg.inputs[0].default_value = hexc('#cfe9e4'); bg.inputs[1].default_value = .35

def mat(name, col, rough=.5, metal=0., coat=0., sss=0., noise=0.):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = hexc(col); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    try: b.inputs['Coat Weight'].default_value = coat; b.inputs['Subsurface Weight'].default_value = sss
    except Exception: pass
    if noise:                                                      # a fine clay grain: noise → bump
        tn = nt.nodes.new('ShaderNodeTexNoise'); tn.inputs['Scale'].default_value = 60; bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = noise
        nt.links.new(tn.outputs['Fac'], bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m
M_BACK = mat('backdrop', '#bfe3dc', .8); M_CLAY = mat('clay', '#f1e6d6', .7, noise=.12); M_GOLD = mat('gold', '#ffc66b', .22, 1.)
M_BALL = mat('jelly', '#ff5a5f', .12, 0., coat=1., sss=.25)

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

# clay pedestal (bevelled) with a thin gold inlay line, and the gold funnel on two rods
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, .6)); ped = bpy.context.object; ped.scale = (2.6, 1.8, 1.2); ped.name = 'Pedestal'
bv = ped.modifiers.new('bv', 'BEVEL'); bv.width = .03; bv.segments = 3; ped.data.materials.append(M_CLAY)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 1.08)); inl = bpy.context.object; inl.scale = (2.62, 1.82, .025); inl.data.materials.append(M_GOLD)
NECK = float(os.environ.get('NECK', .26))
fun = lathe('Funnel', [(1.05, 3.12), (.95, 3.06), (.62, 2.9), (NECK, 2.66), (NECK, 2.38)]); fun.data.materials.append(M_GOLD)
sol = fun.modifiers.new('wall', 'SOLIDIFY'); sol.thickness = .045; sol.offset = 1
for p in fun.data.polygons: p.use_smooth = True
for sgn in (-1, 1):
    bpy.ops.mesh.primitive_cylinder_add(radius=.035, depth=1.6, location=(sgn * 1.55, 0, 3.2), rotation=(0, math.pi / 2, 0)); bpy.context.object.data.materials.append(M_GOLD)
    bpy.ops.mesh.primitive_cube_add(size=.5, location=(sgn * 2.45, 0, 3.2)); b = bpy.context.object; b.scale = (1, 1, .9); bb = b.modifiers.new('bv', 'BEVEL'); bb.width = .02; bb.segments = 3; b.data.materials.append(M_CLAY)

# the ball
R = .32; START = Vector((float(os.environ.get('SX', .15)), 0, 4.4))
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=4 if MODE == 'soft' else 5, radius=R, location=START); ball = bpy.context.object; ball.name = 'Ball'
bpy.ops.object.shade_smooth(); ball.data.materials.append(M_BALL)

# physics
if MODE == 'rigid':
    bpy.ops.rigidbody.world_add(); rw = sc.rigidbody_world; rw.substeps_per_frame = 20; rw.solver_iterations = 20; rw.point_cache.frame_start, rw.point_cache.frame_end = 1, NF
    for ob, typ, shape in ((ball, 'ACTIVE', 'SPHERE'), (fun, 'PASSIVE', 'MESH'), (ped, 'PASSIVE', 'BOX'), (sweep, 'PASSIVE', 'MESH')):
        bpy.context.view_layer.objects.active = ob; ob.select_set(True); bpy.ops.rigidbody.object_add(); ob.rigid_body.type = typ; ob.rigid_body.collision_shape = shape
        ob.rigid_body.friction = .5; ob.rigid_body.restitution = .35 if ob is ball else .4; ob.rigid_body.collision_margin = .005; ob.select_set(False)
    ball.rigid_body.mass = .4; ball.rigid_body.linear_damping = .02; ball.rigid_body.angular_damping = .05
else:
    for ob in (fun, ped, sweep):
        c = ob.modifiers.new('col', 'COLLISION'); ob.collision.thickness_outer = .02; ob.collision.cloth_friction = float(os.environ.get('FRIC', .4)) if ob is fun else 8; ob.collision.damping = .2 if ob is fun else .6
    cl = ball.modifiers.new('cloth', 'CLOTH'); s = cl.settings; cs = cl.collision_settings
    s.quality = 10; s.mass = float(os.environ.get('MASS', 1.0)); s.air_damping = .3
    s.tension_stiffness = s.compression_stiffness = s.shear_stiffness = float(os.environ.get('STIFF', 2)); s.bending_stiffness = .2
    s.tension_damping = s.compression_damping = s.shear_damping = 4
    s.use_pressure = True; s.uniform_pressure_force = float(os.environ.get('PRESS', 1.2)); s.pressure_factor = float(os.environ.get('PFAC', 1))
    s.use_internal_springs = False
    P2, PF = float(os.environ.get('PRESS2', 4)), int(os.environ.get('PFRAME', 34))     # re-inflate after the squeeze
    s.uniform_pressure_force = float(os.environ.get('PRESS', 1.2)); s.keyframe_insert('uniform_pressure_force', frame=PF)
    s.uniform_pressure_force = P2; s.keyframe_insert('uniform_pressure_force', frame=PF + 12)
    s.pressure_factor = float(os.environ.get('PFAC', 1)); s.keyframe_insert('pressure_factor', frame=PF)
    s.pressure_factor = float(os.environ.get('PFAC2', 8)); s.keyframe_insert('pressure_factor', frame=PF + 30)
    cs.collision_quality = 5; cs.distance_min = .008; cs.use_self_collision = False
    cl.point_cache.frame_start, cl.point_cache.frame_end = 1, NF
    sm = ball.modifiers.new('smooth', 'SMOOTH'); sm.factor = .8; sm.iterations = 6
    ss_ = ball.modifiers.new('sub', 'SUBSURF'); ss_.levels = ss_.render_levels = 1

# lights and camera
def area(name, loc, energy, size, col='#ffffff'):
    L = bpy.data.lights.new(name, 'AREA'); L.energy = energy; L.size = size; L.color = hexc(col)[:3]; o = link(bpy.data.objects.new(name, L)); o.location = loc
    o.rotation_euler = (Vector((0, 0, 2.2)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler(); return o
area('key', (-3.5, -4.5, 6.5), 900, 4); area('fill', (4.5, -3.5, 3.5), 300, 5, '#e8fff8'); area('rim', (2.5, 3.5, 6), 500, 3, '#fff1dc')
cam = link(bpy.data.objects.new('Cam', bpy.data.cameras.new('Cam'))); sc.camera = cam; cam.data.lens = 44; cam.data.sensor_fit = 'VERTICAL'
cam.location = (0, -8.4, 5.6); cam.rotation_euler = (Vector((0, 0, 2.2)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
try: cam.data.dof.use_dof = True; cam.data.dof.focus_distance = 9.0; cam.data.dof.aperture_fstop = 5.6
except Exception: pass

# simulate (frame by frame, in order) and record the ball's centre for timing and sound
dg = bpy.context.evaluated_depsgraph_get(); track = []
for f in range(1, NF + 1):
    sc.frame_set(f); dg = bpy.context.evaluated_depsgraph_get(); ev = ball.evaluated_get(dg)
    if MODE == 'rigid': c = ev.matrix_world.translation.copy(); squash = 1.
    else:
        vs = [ev.matrix_world @ v.co for v in ev.data.vertices]; c = sum(vs, Vector()) / len(vs); zs = [v.z for v in vs]; xs = [v.x for v in vs]; squash = (max(zs) - min(zs)) / (max(xs) - min(xs) + 1e-6)
    track.append({'f': f, 'x': round(c.x, 4), 'y': round(c.y, 4), 'z': round(c.z, 4), 'squash': round(squash, 3)})
json.dump({'mode': MODE, 'fps': FPS, 'neck': NECK, 'radius': R, 'track': track}, open(os.path.join(OUT, 'track.json'), 'w'))
print('TRACK', MODE, [(t['f'], t['z'], t['squash']) for t in track[::10]], flush=True)
if BAKE_ONLY: sys.exit(0)
for f in range(F0, F1 + 1):
    sc.frame_set(f); sc.render.filepath = os.path.join(OUT, f'{f:04d}'); bpy.ops.render.render(write_still=True)
    if f % 15 == 0: print('frame', f, flush=True)
print('done', MODE)
