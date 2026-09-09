"""Import original media without modifying it. Run from site/; needs Pillow, ExifTool, FFmpeg."""
from pathlib import Path
from PIL import Image, ImageOps, ImageCms
import json, subprocess, os, re, hashlib, zipfile, xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'personal_interests_files'
RESEARCH=ROOT/'research_files'
DATA=ROOT/'content/site.json'
METADATA=ROOT/'content/media-metadata.json'
W='{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
IMAGE_TYPES=['.jpg','.jpeg','.png','.webp','.tif','.tiff','.bmp','.gif']
def images_in(folder):
 return sorted([f for f in folder.iterdir() if f.suffix.lower() in IMAGE_TYPES],key=lambda f:f.name.lower())
def import_research_art(f,entry):
 # Research covers are logos and icons, so alpha is kept and the frame is never cropped.
 token=hashlib.sha256(str(f.relative_to(RESEARCH)).encode()).hexdigest()[:8]
 dest=ROOT/'public/media/research'/f'{entry["id"]}-{token}.webp';dest.parent.mkdir(parents=True,exist_ok=True)
 with Image.open(f) as source:
  im=ImageOps.exif_transpose(source).convert('RGBA')
  im.thumbnail((900,900),Image.Resampling.LANCZOS)
  if not dest.exists() or dest.stat().st_mtime < changed_at(f):im.save(dest,'WEBP',quality=90,method=4)
 return f'/media/research/{dest.name}'
def dedupe(files):
 kept={}
 for f in sorted(files,key=lambda f:(bool(re.search(r'( \d+| copy( \d+)?)$',f.stem)),len(f.name),f.name.lower())):
  digest=hashlib.sha256(f.read_bytes()).hexdigest()
  if digest in kept: print(f'Skipped duplicate {f.name} (same file as {kept[digest].name})',flush=True)
  else: kept[digest]=f
 return sorted(kept.values(),key=lambda f:f.name.lower())
def changed_at(f):
 # Renaming a file leaves mtime alone but bumps ctime, and video outputs keep fixed names, so watch both.
 info=f.stat();return max(info.st_mtime,info.st_ctime)
def save_json(path, data):
 path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
def extract_metadata():
 tool=os.environ.get('EXIFTOOL_BIN','exiftool')
 extensions=[arg for suffix in IMAGE_TYPES for arg in ('-ext',suffix[1:])]
 result=subprocess.check_output([tool,'-json','-G1','-a','-s','-r']+extensions+[str(SOURCE/'Photography'),str(SOURCE/'Powerlifting'),str(SOURCE/'Fiction'),str(SOURCE/'Sewing')])
 METADATA.write_bytes(result)
def pick(meta,*names):
 for name in names:
  for key,val in meta.items():
   if key.split(':')[-1]==name and val not in ('',None): return str(val)
 return ''
def import_image(args):
 f,project,old,metadata=args
 relative=str(f.relative_to(SOURCE));slug=project['slug'];token=hashlib.sha256(relative.encode()).hexdigest()[:8]
 stem=re.sub(r'[^a-zA-Z0-9-]+','-',f.stem).strip('-').lower()
 filename=f'{stem}-{token}.webp'; dest=ROOT/'public/media'/slug/filename;dest.parent.mkdir(parents=True,exist_ok=True)
 with Image.open(f) as source:
  im=ImageOps.exif_transpose(source)
  if source.info.get('icc_profile'):
   try:
    import io
    im=ImageCms.profileToProfile(im,ImageCms.ImageCmsProfile(io.BytesIO(source.info['icc_profile'])),ImageCms.createProfile('sRGB'),outputMode='RGB')
   except Exception: im=im.convert('RGB')
  else: im=im.convert('RGB')
  original_size=im.size;im.thumbnail((1800,1800),Image.Resampling.LANCZOS)
  if not dest.exists() or dest.stat().st_mtime < changed_at(f):im.save(dest,'WEBP',quality=85,method=4)
  width,height=im.size
 m=metadata.get(str(f.resolve()),{})
 camera=' '.join(dict.fromkeys(x for x in [pick(m,'Make'),pick(m,'Model')] if x))
 location=', '.join(dict.fromkeys(pick(m,x) for x in ['Location','City','State','Country'] if pick(m,x)))
 # Every extracted tag is retained in media-metadata.json. Caption details focus on embedded descriptive/capture data.
 wanted=['DateTimeOriginal','CreateDate','OffsetTimeOriginal','Make','Model','LensModel','LensID','FocalLength','FocalLengthIn35mmFormat','FNumber','ExposureTime','ISO','ExposureProgram','ExposureCompensation','MeteringMode','Flash','WhiteBalance','ImageWidth','ImageHeight','Orientation','ColorSpace','ColorMode','Artist','Creator','Copyright','Title','Description','ImageDescription','Subject','Keywords','City','State','Country','GPSPosition','GPSLatitude','GPSLongitude','GPSAltitude','Software']
 details={name:pick(m,name) for name in wanted if pick(m,name)}
 photo=dict(src=f'/media/{slug}/{filename}',source=relative,filename=f.name,alt=f'{project["title"]} — {f.name}',location=location,camera=camera,lens=pick(m,'LensModel','LensID'),focalLength=pick(m,'FocalLength'),aperture=('f/'+pick(m,'FNumber')) if pick(m,'FNumber') else '',shutterSpeed=pick(m,'ExposureTime'),iso=pick(m,'ISO'),caption='',width=width,height=height,originalWidth=original_size[0],originalHeight=original_size[1],metadata=details)
 # Preserve user-authored captions/alt text/location across imports, plus assumed camera/lens where nothing is embedded.
 previous=next((p for p in old if p.get('source')==relative),{})
 for key in ['caption','alt','location','date']:
  if previous.get(key):photo[key]=previous[key]
 for key in ['camera','lens']:
  if previous.get(key) and not photo[key]:photo[key]=previous[key]
 return photo

def import_video(args):
 f,slug,name=args;dest=ROOT/'public/media'/slug/(name+'.mp4');dest.parent.mkdir(parents=True,exist_ok=True)
 if not dest.exists() or dest.stat().st_mtime < changed_at(f):
  subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(f),'-map','0:v:0','-map','0:a:0?','-vf','scale=1280:720:force_original_aspect_ratio=decrease:force_divisible_by=2','-c:v','libx264','-preset','fast','-crf','23','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-movflags','+faststart',str(dest)],check=True)
 poster=dest.with_suffix('.jpg')
 if not poster.exists() or poster.stat().st_mtime<dest.stat().st_mtime:
  subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-ss','0.5','-i',str(dest),'-frames:v','1',str(poster)],check=True)
 return {'src':f'/media/{slug}/{dest.name}','poster':f'/media/{slug}/{poster.name}'}
def tagval(parent,name,attr='val',default=''):
 e=parent.find(W+name) if parent is not None else None
 return e.get(W+attr,default) if e is not None else default
def enabled(props,name):
 e=props.find(W+name) if props is not None else None
 return e is not None and e.get(W+'val','1') not in ['0','false','off','none']
def import_story(f,slug):
 with zipfile.ZipFile(f) as z:root=ET.fromstring(z.read('word/document.xml'))
 paragraphs=[]
 for p in root.findall('.//'+W+'body/'+W+'p'):
  prop=p.find(W+'pPr');style={}
  align=tagval(prop,'jc');
  if align in ['left','center','right','both']:style['textAlign']='justify' if align=='both' else align
  for xmlkey,csskey in [('firstLine','textIndent'),('left','marginLeft'),('right','marginRight')]:
   value=tagval(prop,'ind',xmlkey)
   if value and float(value):style[csskey]=f'{float(value)/240:g}em'
  runs=[]
  for r in p.findall('.//'+W+'r'):
   rp=r.find(W+'rPr');text=''.join((e.text or '') if e.tag==W+'t' else '\n' if e.tag==W+'br' else '\t' if e.tag==W+'tab' else '' for e in r)
   if not text:continue
   rs={}
   if enabled(rp,'i'):rs['fontStyle']='italic'
   if enabled(rp,'b'):rs['fontWeight']='bold'
   if enabled(rp,'smallCaps'):rs['fontVariant']='small-caps'
   decoration=[]
   if enabled(rp,'u'):decoration.append('underline')
   if enabled(rp,'strike'):decoration.append('line-through')
   if decoration:rs['textDecoration']=' '.join(decoration)
   font=tagval(rp,'rFonts','ascii')
   if font:rs['fontFamily']=font
   size=tagval(rp,'sz')
   if size:rs['fontSize']=f'{float(size)/24:g}em'
   color=tagval(rp,'color')
   if re.fullmatch('[0-9a-fA-F]{6}',color):rs['color']='#'+color
   runs.append({'text':text,'style':rs})
  paragraphs.append({'style':style,'runs':runs})
 head,body=paragraphs[:2],paragraphs[2:]
 cleaned=[]
 for para in body:
  text=''.join(r['text'] for r in para['runs'])
  if '~' in text:
   # A row of tildes is a scene break in the manuscript; render it as a rule instead.
   cleaned.append({'style':{},'runs':[],'divider':True})
   runs=[dict(r,text=r['text'].replace('~','').lstrip()) for r in para['runs']]
   para={'style':para['style'],'runs':[r for r in runs if r['text']]}
   if not para['runs']:continue
  previous=cleaned[-1] if cleaned else None
  tail=''.join(r['text'] for r in previous['runs']) if previous and not previous.get('divider') else ''
  # A page break in the manuscript splits a sentence across two paragraphs; stitch those halves back together.
  if tail.rstrip() and tail.rstrip()[-1] not in '.?!"”’…' and para['runs']:
   if not tail[-1:].isspace() and not para['runs'][0]['text'][:1].isspace():previous['runs'][-1]['text']+=' '
   previous['runs'].extend(para['runs'])
   continue
  cleaned.append(para)
 paragraphs=head+cleaned
 story={'source':str(f.relative_to(SOURCE)),'paragraphs':paragraphs}
 save_json(ROOT/'content/stories'/f'{slug}.json',story)
 print(f'Imported {f.name}: {len(paragraphs)} paragraphs, {sum(len(r["text"].split()) for p in paragraphs for r in p["runs"])} words',flush=True)
 return str(f.relative_to(SOURCE))

def main():
 site=json.loads(DATA.read_text());projects=site['projects']
 if not any(p['slug']=='2024-selects' for p in projects):
  new=next(p for p in projects if p['slug']=='2025-selects').copy();new.update(slug='2024-selects',title='2024 Selects',year=2024,date='2024-12',photos=[],cover='',videoUrl='',videoFirst=False);projects.append(new)
 for p in projects:
  p.setdefault('location','');p.setdefault('recap','');p.setdefault('storySource','')
  if p['slug']=='2025-selects':p.update(videoUrl='https://www.youtube.com/watch?v=mrQyYNmfqy0',videoFirst=True)
 if os.environ.get('REUSE_METADATA')!='1':extract_metadata()
 metadata={str(Path(m['SourceFile']).resolve()):m for m in json.loads(METADATA.read_text())}
 power={
  'collegiate-nationals-2026':('Salt Lake City, UT',[(255,562),(157.5,347),(280,617)],'14th place · 692.5 kg / 1526.7 lbs total · 93 kg / 205 lbs weight class.'),
  'high-school-nationals-2025':('Milwaukee, WI',[(227.5,501),(142.5,314),(255,562)],'5th place · 625 kg / 1378 lbs total · 83 kg / 183 lbs weight class.'),
  'raw-nationals-2024':('Salt Lake City, UT',[(240,529),(145,320),(260,573)],'1st place · 645 kg / 1422 lbs total · 90 kg / 198 lbs weight class · Ages 16–17.')}
 for p in projects:
  folder=SOURCE/p['category']/p['title']
  if p['category']=='Fiction':
   # Each story keeps its manuscript, and optionally a cover image, in its own folder.
   f=next((c for c in [folder/f'{p["title"]}.docx',SOURCE/'Fiction'/f'{p["title"]}.docx'] if c.exists()),None)
   if f:p['storySource']=import_story(f,p['slug'])
   art=[c for c in (images_in(folder) if folder.exists() else []) if c.stem.lower().startswith('cover')]
   if art:p['cover']=import_image((art[0],p,p['photos'],metadata))['src']
   continue
  if not folder.exists():continue
  files=dedupe(images_in(folder))
  with ThreadPoolExecutor(max_workers=4) as executor:p['photos']=list(executor.map(import_image,[(f,p,p['photos'],metadata) for f in files]))
  # A source file named cover.* is the deliberate cover; otherwise keep a still-valid one, else the first frame.
  named=next((ph['src'] for ph in p['photos'] if ph['filename'].lower().startswith('cover')),'')
  if not named and p['cover'] not in [ph['src'] for ph in p['photos']]:p['cover']=''
  if named or not p['cover']:p['cover']=named or (p['photos'][0]['src'] if p['photos'] else '')
  print(f'Imported {p["title"]}: {len(p["photos"])} images',flush=True)
  if p['slug'] in power:
   loc,lifts,recap=power[p['slug']];p.update(location=loc,recap=recap,reflections='')
   args=[(folder/(name+'.mov'),p['slug'],slug) for name,slug in [('Squat','squat'),('Bench Press','bench-press'),('Deadlift','deadlift')]]
   with ThreadPoolExecutor(max_workers=2) as executor:videos=list(executor.map(import_video,args))
   p['results']=[{'lift':name,'kg':kg,'lbs':lbs,'result':f'{kg:g} kg / {lbs:g} lbs','video':video['src'],'poster':video['poster']} for name,(kg,lbs),video in zip(['Squat','Bench Press','Deadlift'],lifts,videos)]
   print(f'Prepared {p["title"]}: three H.264 MP4 videos',flush=True)
 for entry in site['research']:
  folder=next((d for d in sorted(RESEARCH.iterdir()) if d.is_dir() and d.name.lower()==entry['title'].lower()),None) if RESEARCH.exists() else None
  art=next((c for c in images_in(folder) if c.stem.lower().startswith('cover')),None) if folder else None
  if art:entry['image']=import_research_art(art,entry);print(f'Imported research cover for {entry["title"]}',flush=True)
 save_json(DATA,site)
 # A caption worksheet references every imported photo, without fabricating locations or prose.
 lines=['# Photography captions','', 'For each image, supply a short blurb and location where missing. Keep the source filename as the identifier.','']
 for p in sorted([p for p in projects if p['category']=='Photography'],key=lambda p:p['date'],reverse=True):
  lines.extend([f'## {p["title"]}',''])
  for i,photo in enumerate(p['photos'],1):
   lines.extend([f'### {i:03d} — {photo["filename"]}',f'- File: `{photo["source"]}`',f'- Preview: [image](../public{photo["src"]})',f'- Location: {photo["location"] or "Pending"}',f'- Settings: {" · ".join(photo[k] for k in ["camera","lens","focalLength","aperture","shutterSpeed","iso"] if photo[k]) or "Not embedded"}',f'- Blurb: {photo["caption"] or "Pending"}',''])
 (ROOT/'content/photography-captions.md').write_text('\n'.join(lines))
 print('Import complete. Originals unchanged. Caption worksheet: content/photography-captions.md',flush=True)
if __name__=='__main__':main()
