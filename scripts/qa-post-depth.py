from pathlib import Path
from bs4 import BeautifulSoup
import sys

MIN_CHARS = 9000
MIN_PARAGRAPHS = 35
MIN_H2 = 7
MIN_TABLES = 1
REQUIRED_IDS = ['pm-dashboard', 'facts', 'holdings', 'risks', 'action-map', 'sources']
THIN_PHRASES = ['继续观察', '逻辑不变', '注意风险', '保持耐心']

paths = sys.argv[1:] or ['posts/2026/05/03.html']
issues = []
results = []

for rel in paths:
    p = Path(rel)
    s = p.read_text(encoding='utf-8', errors='replace')
    soup = BeautifulSoup(s, 'html.parser')
    text = soup.get_text('\n', strip=True)
    ps = soup.find_all('p')
    h2 = soup.find_all('h2')
    tables = soup.find_all('table')
    body = soup.body
    ids = {tag.get('id') for tag in soup.find_all(id=True)}
    paragraphs_long = [p.get_text(' ', strip=True) for p in ps if len(p.get_text('', strip=True)) >= 90]
    thin_phrase_count = sum(text.count(x) for x in THIN_PHRASES)
    row = {
        'path': rel,
        'chars': len(text),
        'paragraphs': len(ps),
        'longParagraphs': len(paragraphs_long),
        'h2': len(h2),
        'tables': len(tables),
        'sections': len(soup.find_all('section')),
        'replacementChars': s.count('�'),
        'bodyClass': body.get('class') if body else [],
        'thinPhraseCount': thin_phrase_count,
    }
    results.append(row)
    if len(text) < MIN_CHARS:
        issues.append(f'{rel}: body too thin ({len(text)} chars < {MIN_CHARS})')
    if len(ps) < MIN_PARAGRAPHS:
        issues.append(f'{rel}: too few paragraphs ({len(ps)} < {MIN_PARAGRAPHS})')
    if len(paragraphs_long) < 20:
        issues.append(f'{rel}: too few substantive paragraphs ({len(paragraphs_long)} < 20)')
    if len(h2) < MIN_H2:
        issues.append(f'{rel}: too few major sections ({len(h2)} < {MIN_H2})')
    if len(tables) < MIN_TABLES:
        issues.append(f'{rel}: missing at least one evidence/action table')
    if s.count('�'):
        issues.append(f'{rel}: contains replacement chars')
    for rid in REQUIRED_IDS:
        if rid not in ids:
            issues.append(f'{rel}: missing required section id #{rid}')
    # For markdown-first articles, short slogan phrases are allowed only if surrounded by long explanations.
    if thin_phrase_count >= 8 and len(paragraphs_long) < 30:
        issues.append(f'{rel}: repeated thin phrases without enough explanatory paragraphs')

print({'issues': issues, 'results': results})
if issues:
    raise SystemExit(1)
