"""Original Pixel 9 Pro XL-inspired mockup. Run in a separate Blender process.

blender --background --factory-startup --python scripts/render-pixel-preview.py
The runtime uses transparent stills, not WebGL. No third-party mesh or texture.
"""
import bpy
import math
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "device"
SOURCE = ROOT / "assets" / "device"
OUT.mkdir(parents=True, exist_ok=True)
SOURCE.mkdir(parents=True, exist_ok=True)

# This script is only used with --factory-startup in a new background process.
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"
scene.unit_settings.scale_length = 0.01

def material(name, color, metallic=0, roughness=0.3):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    node = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    node.inputs["Base Color"].default_value = (*color, 1)
    node.inputs["Metallic"].default_value = metallic
    node.inputs["Roughness"].default_value = roughness
    return mat

metal = material("Polished warm titanium", (0.43, 0.40, 0.35), 0.94, 0.23)
bright = material("Machined edge", (0.77, 0.74, 0.66), 0.91, 0.2)
glass = material("Obsidian front glass", (0.007, 0.009, 0.008), 0.15, 0.18)
porcelain = material("Warm porcelain back", (0.78, 0.75, 0.67), 0.12, 0.34)
screen_mat = material("Lextli paper display", (1.0, 0.947, 0.854), 0, 1)
screen_shader = next(n for n in screen_mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
screen_shader.inputs["Emission Color"].default_value = (1.0, 0.947, 0.854, 1)
screen_shader.inputs["Emission Strength"].default_value = 0.8
lens_mat = material("Optical blue glass", (0.025, 0.044, 0.067), 0.78, 0.12)
flash = material("Flash diffuser", (0.95, 0.91, 0.77), 0, 0.25)
antenna = material("Antenna inserts", (0.25, 0.24, 0.22), 0, 0.5)

device = bpy.data.objects.new("Pixel-inspired handset - original model", None)
scene.collection.objects.link(device)

def rounded_points(w, h, r, n=16):
    pts = []
    for cx, cy, start in [(w/2-r,h/2-r,0),(-w/2+r,h/2-r,90),(-w/2+r,-h/2+r,180),(w/2-r,-h/2+r,270)]:
        for i in range(n+1):
            a = math.radians(start+i*90/n)
            pts.append((cx+r*math.cos(a),cy+r*math.sin(a)))
    return pts

def slab(name, w, h, depth, r, z, mat, x=0, y=0, bevel=0.025):
    pts = rounded_points(w,h,r)
    count=len(pts)
    verts=[(px+x,py+y,z-depth/2) for px,py in pts]+[(px+x,py+y,z+depth/2) for px,py in pts]
    faces=[tuple(reversed(range(count))),tuple(range(count,count*2))]
    faces += [(i,(i+1)%count,(i+1)%count+count,i+count) for i in range(count)]
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(verts,[],faces)
    mesh.update()
    obj=bpy.data.objects.new(name,mesh)
    scene.collection.objects.link(obj)
    obj.parent=device
    obj.data.materials.append(mat)
    if bevel:
        mod=obj.modifiers.new("Soft machined rim","BEVEL")
        mod.width=bevel
        mod.segments=3
        obj.modifiers.new("Weighted surface normals","WEIGHTED_NORMAL")
    return obj

# Physical dimensions 76.6 x 162.8 x 8.5 mm. Camera island excluded from depth.
slab("Aluminum perimeter",7.66,16.28,.85,1.10,0,metal,bevel=.065)
slab("Front chamfer",7.59,16.21,.09,1.065,.415,bright,bevel=.025)
slab("Front glass bezel",7.49,16.11,.055,1.015,.475,glass,bevel=.018)
slab("Display",7.18,15.80,.012,.88,.512,screen_mat,bevel=.008)
slab("Rear porcelain",7.48,16.10,.08,1.015,-.43,porcelain,bevel=.028)

# Side buttons and subtly recessed antenna breaks.
slab("Power button",.12,1.18,.30,.05,0,bright,x=3.84,y=3.75,bevel=.025)
slab("Volume rocker",.12,2.05,.30,.05,0,bright,x=3.84,y=1.75,bevel=.025)
for x in [-3.81,3.81]:
    for y in [-6.35,6.35]:
        slab("Antenna break",.045,.06,.65,.012,0,antenna,x=x,y=y,bevel=.006)

def circle(name,r,depth,x,y,z,mat):
    bpy.ops.mesh.primitive_cylinder_add(vertices=64,radius=r,depth=depth,location=(x,y,z))
    obj=bpy.context.object
    obj.name=name
    obj.parent=device
    obj.data.materials.append(mat)
    bevel=obj.modifiers.new("Lens edge","BEVEL")
    bevel.width=.015
    bevel.segments=3
    obj.modifiers.new("Lens normals","WEIGHTED_NORMAL")
    return obj

circle("Centered front camera",.13,.022,0,7.32,.54,glass)
circle("Front camera glass",.071,.009,0,7.32,.555,lens_mat)
slab("Earpiece",.62,.025,.015,.012,.54,glass,y=7.96,bevel=.002)

# The recognizable floating capsule of the Pro XL camera assembly.
slab("Rear camera island",6.55,2.55,.49,1.20,-.70,bright,y=5.12,bevel=.06)
slab("Rear camera inset",4.88,1.84,.035,.90,-.97,glass,x=.53,y=5.12,bevel=.018)
for index,x in enumerate([-2.05,-.55,.95]):
    x = -x
    circle("Lens rim %d"%index,.56,.045,x,5.12,-1.005,metal)
    circle("Lens glass %d"%index,.46,.053,x,5.12,-1.03,lens_mat)
    circle("Lens pupil %d"%index,.255,.058,x,5.12,-1.052,glass)
    circle("Lens reflection %d"%index,.09,.06,x-.11,5.25,-1.06,lens_mat)
circle("Rear flash",.255,.04,-2.40,5.62,-.98,flash)
circle("Temperature sensor",.155,.04,-2.40,4.80,-.98,glass)

world=bpy.data.worlds.new("Studio")
world.use_nodes=True
next(n for n in world.node_tree.nodes if n.type=="BACKGROUND").inputs["Color"].default_value=(0.3,0.3,0.3,1)
scene.world=world

def area(name,loc,energy,size,shape=None,size_y=None):
    data=bpy.data.lights.new(name,"AREA")
    data.energy=energy
    data.shape="RECTANGLE" if shape else "DISK"
    data.size=size
    if size_y: data.size_y=size_y
    obj=bpy.data.objects.new(name,data)
    scene.collection.objects.link(obj)
    obj.location=loc
    obj.rotation_euler=(Vector((0,0,0))-obj.location).to_track_quat('-Z','Y').to_euler()

area("Large softbox",(-8,7,12),1700,10)
area("Right strip",(8,1,6),1800,2,True,15)
area("Top rim",(-2,12,4),1200,7)
area("Left reflection",(-7,-2,3),900,1,True,12)

camera_data=bpy.data.cameras.new("Orthographic product camera")
camera=bpy.data.objects.new("Orthographic product camera",camera_data)
scene.collection.objects.link(camera)
camera.location=(0,0,30)
camera.rotation_euler=(0,0,0)
camera_data.type="ORTHO"
camera_data.ortho_scale=17.5
scene.camera=camera
scene.render.engine="CYCLES"
scene.cycles.samples=48
scene.cycles.use_denoising=True
scene.render.resolution_x=840
scene.render.resolution_y=1760
scene.render.resolution_percentage=100
scene.render.film_transparent=True
scene.render.image_settings.file_format="PNG"
scene.render.image_settings.color_mode="RGBA"
scene.view_settings.view_transform="AgX"
scene.render.filepath=str(OUT/"pixel-front.png")
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE/"pixel-9-pro-xl-inspired.blend"))
bpy.ops.render.render(write_still=True)

# Render the back as a separate static layer; the browser never loads a 3D engine.
device.rotation_euler=(0,math.radians(166),math.radians(8))
camera_data.ortho_scale=21.5
scene.render.filepath=str(OUT/"pixel-back.png")
bpy.ops.render.render(write_still=True)
print("LEXTLI_DEVICE_RENDERED")
