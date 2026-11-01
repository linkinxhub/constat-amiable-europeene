"""One-page fictional deliverable only. Does not change the application's PDF exports."""
import base64, io, json, re, sys
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from pypdf import PdfReader

root = Path(__file__).resolve().parents[2]
state = json.loads((root/'docs/recette-deux-agents-20261023/manual-state.json').read_text())
assert state['testOnly'] is True and state['productionAuth'] is False
r = state['report']
out = Path(sys.argv[1]).resolve()
out.parent.mkdir(parents=True, exist_ok=True)
pdfmetrics.registerFont(TTFont('Accordia', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
W, H = 595.28, 841.89
sx, sy = W/1085, H/1536
c = canvas.Canvas(str(out), pagesize=(W,H))
c.setTitle('Constat fictif A et B - une page')
c.setAuthor('Accordia')
c.setSubject('Exemplaire de test, sans signature personnelle ni valeur de déclaration réelle')
encoded = re.search(r"referenceImage\s*=\s*['\"]([^'\"]+)['\"]", (root/'server/reference-image.ts').read_text()).group(1)
c.drawImage(ImageReader(io.BytesIO(base64.b64decode(encoded))),0,0,W,H)
# Clear the dotted writing lines only inside the long location value area.
c.setFillColorRGB(1,1,1)
c.rect(458*sx,H-110*sy,162*sx,45*sy,fill=1,stroke=0)
c.rect(700*sx,H-58*sy,105*sx,17*sy,fill=1,stroke=0)
c.setFillColorRGB(.1,.1,.1);c.setFont('Accordia',5.5)
c.drawRightString(802*sx,H-55*sy,'Feuillet 1/1')
values = []
def fill(value, x, y, width, height=19, missing=False):
    text = re.sub(r'\s+', ' ', str(value or '')).strip()
    if not text and not missing: return
    text = text or 'Non renseigné'
    def wrap(size):
        lines, row = [], ''
        for word in text.split():
            candidate = (row+' '+word).strip()
            if pdfmetrics.stringWidth(candidate,'Accordia',size) <= width*sx:
                row = candidate
            else:
                if row: lines.append(row)
                row = ''
                for ch in word:
                    if row and pdfmetrics.stringWidth(row+ch,'Accordia',size)>width*sx:
                        lines.append(row);row=''
                    row += ch
        if row: lines.append(row)
        return lines
    for step in range(32,-1,-1):
        size = 5.5+step*.125
        lines = wrap(size)
        if len(lines)*(size+.5) <= height*sy: break
    else: raise ValueError('Field cannot fit without truncation: '+text)
    c.setFont('Accordia',size)
    c.setFillColorRGB(.03,.05,.09)
    for i,line in enumerate(lines): c.drawString(x*sx,H-y*sy-size-i*(size+.5),line)
    values.append(text)
def check(x,y): fill('X',x,y,15,22)
fill(r['date'],60,86,145);fill(r['time'],224,86,60);fill(r['country'],330,94,75)
fill(r['place']+' · '+r['city'],460,66,158,43)
check(782 if r['injured']=='yes' else 690,85)
check(174 if r['otherVehiclesDamage']=='yes' else 77,160)
check(337 if r['otherObjectsDamage']=='yes' else 249,160)
fill(r['witnesses'],405,136,640,46)
for i,v in enumerate(r['vehicles']):
    dx=i*665;e=v['extra']
    for val,x,y,w in [(v['policyholder'],84,264,300),(e.get('policyholderFirstName'),94,287,290),(e.get('policyholderAddress'),96,310,288),(e.get('policyholderPostcode'),122,333,79),(e.get('policyholderCountry'),240,333,142),(e.get('policyholderPhone'),124,356,259),
        (v['model'],45,449,162),(v['plate'],45,490,162),(e.get('registrationCountry'),45,530,162),(e.get('trailerPlate'),226,490,158),(e.get('trailerCountry'),226,530,158),
        (v['insurer'],82,588,300),(v['policy'],130,610,254),(e.get('greenCard'),142,632,242),(e.get('insuranceFrom'),174,674,95),(e.get('insuranceUntil'),302,674,82),(e.get('agency'),84,717,300),(e.get('agencyPhone'),120,781,264),
        (v['driver'],90,889,294),(e.get('driverFirstName'),100,912,284),(e.get('driverBirthDate'),157,934,227),(v['address'],101,956,283),(e.get('driverPostcode'),65,978,135),(e.get('driverCountry'),238,978,146),(' / '.join(filter(None,[e.get('driverPhone'),v['email']])),125,1001,259),(e.get('licenceNumber'),162,1023,222),(e.get('licenceCategory'),144,1046,240),(e.get('licenceUntil'),182,1069,202)]:
        # Missing optional values remain unasserted. Essential missing identity/contact
        # and insurance fields are explicitly marked rather than fabricated.
        needed = y in [264,588,610,674,889,912,934,956,978,1001,1023,1046,1069]
        fill(val,x+dx,y,w,missing=needed)
    fill(e.get('agencyAddress'),106+dx,739,277,37)
    x=43 if i==0 else 875
    fill(e.get('impact'),x,1156,168,24,missing=True)
    fill(v['damage'],x,1338,173,54)
    fill(v['observations'],44 if i==0 else 744,1426,308 if i==0 else 305,67)
    ys=[292,314,358,389,440,477,521,565,624,667,698,730,761,792,818,876,920]
    for k in v['standardCircumstances']: check(412 if i==0 else 669,ys[k])
    fill(str(len(v['standardCircumstances'])),412 if i==0 else 669,973,15)
    c.drawImage(str(root/'tests/fixtures/signature-test.png'),(391 if i==0 else 570)*sx,H-1490*sy,width=140*sx,height=45*sy,preserveAspectRatio=True,mask='auto')
# Keep the actual constat page, with no duplicate account or annex pages.
c.setFillColorRGB(1,1,1);c.rect(380*sx,H-1519*sy,340*sx,21*sy,fill=1,stroke=0)
fill('EXEMPLE FICTIF - signatures de test',385,1502,330,19)
fill('1 / 1 - Non renseigné : valeur absente du scénario de test.',39,1519,995,16)
c.showPage();c.save()
reader=PdfReader(str(out));assert len(reader.pages)==1
actual=re.sub(r'\s+',' ',reader.pages[0].extract_text())
for expected in values: assert expected in actual, expected
assert 'annexe' not in actual.lower()
assert reader.get_fields() is None
print(json.dumps({'path':str(out),'pages':1,'allDrawnValuesVerified':len(values),'testOnly':True,'applicationChanged':False},ensure_ascii=False))
