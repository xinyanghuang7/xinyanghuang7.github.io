from pathlib import Path
from bs4 import BeautifulSoup

for rel in ['posts/2026/04/30.html','posts/2026/05/01.html','posts/2026/05/02.html','posts/2026/05/03.html']:
    p = Path(rel)
    s = p.read_text(encoding='utf-8', errors='replace')
    soup = BeautifulSoup(s, 'html.parser')
    text = soup.get_text('\n', strip=True)
    body = soup.body
    selectors = '.holding-news-card,.action-card,.creator-card,.decision-status-card,.scenario-matrix,.news-grade-board,.pm-dashboard-shell,.method-scoreboard,.source-ledger-item,.five-plus-card,.scoreboard-grid,.source-audit-grid'
    print(f'\n--- {rel}')
    print('bodyClass=', body.get('class') if body else None)
    print('chars=', len(text))
    print('paragraphs=', len(soup.find_all('p')))
    print('listItems=', len(soup.find_all('li')))
    print('h2=', len(soup.find_all('h2')))
    print('tables=', len(soup.find_all('table')))
    print('richBlocks=', len(soup.select(selectors)))
    print('sections=', len(soup.find_all('section')))
    print('replacementChars=', s.count('�'))
