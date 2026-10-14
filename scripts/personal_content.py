"""Content mapping from the original personal site into the Film B shell."""
from bs4 import BeautifulSoup
from copy import deepcopy


def apply_personal_content(soup, root):
    original = BeautifulSoup((root / 'scripts/reference/personal-home.html').read_text(), 'html.parser')
    writing = BeautifulSoup((root / 'writing-archive.html').read_text(), 'html.parser')
    adoption = BeautifulSoup((root / 'department-adoption.html').read_text(), 'html.parser')
    cards = original.select('#work .cell')
    sections = soup.select('.ns-step.ns-svc')
    aliases = ['manager-brief', 'work', 'workflow', 'authority', 'translation', 'signals', 'recovery', 'writing', 'adoption']
    labels = ['Brief', 'Use cases', 'Workflow', 'Authority', 'Translation', 'Signals', 'Recovery', 'Writing', 'Adoption']
    titles = ['The 90-second manager brief'] + [c.h3.get_text() for c in cards] + ['Writing archive', 'Department adoption map']
    bodies = [original.select_one('#manager-brief .lead').get_text()] + [c.p.get_text() for c in cards] + [writing.select_one('.hero').select_one('p').get_text(), 'Six operating layers, an autonomy ladder, a control scorecard and a 90-day rollout for accountable AI adoption.']
    overview = original.select_one('#manager-brief h2').get_text()
    for index, section in enumerate(sections):
        copy = section.select_one('.ns-copy')
        section['data-label'] = labels[index]
        section.insert(0, soup.new_tag('span', id=aliases[index], attrs={'class': 'po-anchor'}))
        section.select_one('.ns-meta').string = 'Ali Osman Ozen · ' + labels[index]
        section.select_one('.ns-name').string = 'Manager brief' if index == 0 else ('Management question ' + str(index) + ' / 6' if index < 7 else labels[index])
        section.select_one('h2 .line').string = overview if index == 0 else titles[index]
        section.select_one('.ns-body').string = bodies[index]
        if index == 1:
            section.select_one('.ns-name').string = original.select_one('#work h2').get_text()
        for block in copy.select('.ns-card, .ns-trace, .ns-plain, .ns-not'):
            block.decompose()
        more = section.select_one('.ns-more')
        if index == 0:
            extra = deepcopy(original.select_one('.brief-cards'))
            extra['class'] = ['po-brief-cards']
            more.insert_before(extra)
        if index == 7:
            extra = soup.new_tag('div', attrs={'class': 'po-writing-list'})
            for entry in writing.select('.writing-entry')[:3]:
                link = soup.new_tag('a', href='writing-archive.html#' + entry['id'])
                link.string = entry['data-title']
                extra.append(link)
            more.insert_before(extra)
            more.clear()
            more.append(BeautifulSoup('<a class="le-button" href="https://ozen.aequai.com/">Read the blog ↗</a> <a class="ns-link" href="writing-archive.html">Browse the writing archive →</a>', 'html.parser'))
            p = soup.new_tag('p', attrs={'class': 'po-note'})
            p.string = 'Daily Signal · Signal vs. Noise · Full post bodies and canonical source links are pending in the existing archive.'
            more.insert_before(p)
        if index == 8:
            more.clear()
            more.append(BeautifulSoup('<a class="le-button" href="department-adoption.html">Explore the department map →</a>', 'html.parser'))
            more.insert_before(BeautifulSoup('<p class="po-note">Leadership · Revenue · Operations · Finance · Trust · Product / Engineering / Data</p>', 'html.parser'))
    for link, label, title in zip(soup.select('#ns-nl a'), labels, titles):
        link.span.string = label
        link['title'] = title

    # Keep the original interactive diagrams, proof lenses and agent composer.
    extensions = soup.new_tag('div', attrs={'class': 'po-content'})
    definitions = deepcopy(original.body.find('svg'))
    extensions.append(definitions)
    model = deepcopy(original.select_one('#model'))
    for block in [model, deepcopy(original.select_one('#diagrams')), deepcopy(original.select_one('#selected')), deepcopy(original.select_one('#ask-ai'))]:
        for el in block.select('[data-reveal]'):
            del el['data-reveal']
        for cmd in block.select('.cmd'):
            cmd.string = {'model': '01 / Control model', 'diagrams': '02 / Interactive diagrams', 'selected': '03 / Proof-of-work lenses', 'ask-ai': '04 / AI prompt composer'}[block['id']]
        extensions.append(block)
    # Existing outcome wording is a proposed lens, not a measured client result.
    for el in extensions.select('#selected dt'):
        if el.get_text() == 'Outcome':
            el.string = 'Intended outcome'
    for el in extensions.select('.display-card em'):
        el.decompose()
    extensions.select_one('#ask-ai .ai-chat-copy p').string = 'Prepare a question through the adoption, writing and workflow lens. Copy the prompt, then open your chosen AI tool. This site has no connected model.'
    extensions.select_one('[data-chat-send]').string = 'Copy prompt'
    extensions.select_one('#aiChatInput')['aria-label'] = 'Your AI adoption question'
    soup.select_one('#e-footer').insert_before(extensions)
    soup.body['data-personal-home'] = ''
    css = soup.new_tag('link', rel='stylesheet', href='assets/personal-content.css')
    soup.head.append(css)
    css = soup.new_tag('link', rel='stylesheet', href='assets/adoption-gap-diagram.css')
    soup.head.append(css)
    for src, module in [('assets/personal-content.js', False), ('assets/personal-model.js', False), ('assets/adoption-gap-diagram.js', True)]:
        tag = soup.new_tag('script', src=src)
        if module:
            tag['type'] = 'module'
        else:
            tag['defer'] = ''
        soup.body.append(tag)

    hero_body = original.select_one('.hero .sub').get_text()
    for el in soup.select('.fbh-lede'):
        el.string = hero_body
    for container in soup.select('#fbh-hero, .fbh-nojs'):
        audience = soup.new_tag('p', attrs={'class': 'po-audience'})
        audience.string = original.select_one('.audience-line').get_text()
        container.select_one('.le-title').insert_before(audience)
    for el in soup.select('#fbh-hero .le-button--primary, .fbh-nojs .le-button--primary'):
        el['href'] = '#manager-brief'
        for text in list(el.find_all(string=True, recursive=False)):
            text.replace_with('See the 90-second brief ')
    # Update links in the menus and footer to the real personal site sections.
    panel = soup.select_one('#lv-menu-services .mn-main')
    panel.clear()
    for start in range(0, 9, 3):
        group = soup.new_tag('div', attrs={'class': 'mn-group'})
        for i in range(start, start + 3):
            a = soup.new_tag('a', href='#' + aliases[i], attrs={'class': 'mn-item'})
            title = soup.new_tag('span', attrs={'class': 'mn-t'})
            title.string = labels[i]
            a.append(title)
            desc = soup.new_tag('span', attrs={'class': 'mn-d'})
            desc.string = titles[i]
            a.append(desc)
            group.append(a)
        panel.append(group)
    for nav in soup.select('#lv-menu-learn .mn-main, #lv-menu-solutions .mn-main'):
        nav.clear()
        nav.append(BeautifulSoup('<div class="mn-group"><a class="mn-item" href="#model"><span class="mn-t">Control model</span></a><a class="mn-item" href="#diagrams"><span class="mn-t">Interactive diagrams</span></a><a class="mn-item" href="#selected"><span class="mn-t">Proof-of-work lenses</span></a></div><div class="mn-group"><a class="mn-item" href="writing-archive.html"><span class="mn-t">Writing archive</span></a><a class="mn-item" href="https://ozen.aequai.com/"><span class="mn-t">Personal blog ↗</span></a><a class="mn-item" href="department-adoption.html"><span class="mn-t">Department adoption</span></a><a class="mn-item" href="#ask-ai"><span class="mn-t">AI prompt composer</span></a></div>', 'html.parser'))
    footer_nav = soup.select_one('.fbf-nav')
    footer_nav.clear()
    footer_nav.append(BeautifulSoup('<div class="fbf-col"><p class="fbf-k">Approach</p><ul><li><a href="#manager-brief">90-second brief</a></li><li><a href="#work">Six management questions</a></li><li><a href="#model">Control model</a></li></ul></div><div class="fbf-col"><p class="fbf-k">Explore</p><ul><li><a href="#diagrams">Interactive diagrams</a></li><li><a href="#selected">Proof-of-work lenses</a></li><li><a href="#ask-ai">AI prompt composer</a></li></ul></div><div class="fbf-col"><p class="fbf-k">Writing</p><ul><li><a href="https://ozen.aequai.com/">Personal blog ↗</a></li><li><a href="writing-archive.html">Daily Signal / Signal vs. Noise</a></li><li><a href="department-adoption.html">Department adoption map</a></li></ul></div><div class="fbf-col"><p class="fbf-k">Elsewhere</p><ul><li><a href="https://linkedin.com/in/0xozen">LinkedIn</a></li><li><a href="https://github.com/0xOzen">GitHub</a></li><li><a href="mailto:ali.ozen@rwth-aachen.de">Email</a></li></ul></div>', 'html.parser'))

    # Film B's structure and particle paths stay intact; its narration follows
    # the original six management questions and the personal operating model.
    replacements = {
        'Product identity': 'Signal identity', 'Product master': 'Writing archive',
        'Batch and lot': 'Date and issue', 'Material composition': 'Operating lens',
        'Supplier declaration \\xB7 14 months old': 'Daily Signal / Signal vs. Noise',
        'Recycled content': 'Full post body', 'Gap \\xB7 supplier': 'Source pending',
        'Carbon footprint': 'Canonical source', 'Question \\xB7 expert decides': 'Link pending',
        'FIG. S8': 'ARCHIVE', 'one product': 'writing evidence',
        '["Database","Database","who can read and change"]': '["Suggest","Suggest","summarise, draft, analyse"]',
        '["Signed document","Signed doc","who agreed to what"]': '["Prepare","Prepare","a next action for review"]',
        '["Audit log","Audit log","what happened \\xB7 enough"]': '["Modify","Modify","change within a boundary"]',
        '["Hash + timestamp","Hash + time","not needed here"]': '["Trigger","Trigger","route with approval"]',
        '["Token","Token","only if still needed"]': '["Commit","Commit","explicit human authority"]',
    }
    for script in soup.select('script'):
        if script.string and len(script.string) > 10000:
            text = str(script.string)
            for old, new in replacements.items():
                text = text.replace(old, new)
            script.string = text
