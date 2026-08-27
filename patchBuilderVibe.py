import codecs

with codecs.open('src/pages/Builder.jsx', 'r', 'utf-8') as f:
    text = f.read()

# 1. Update root container
text = text.replace(
    "<div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-builder)' }}>",
    '<div className="app-container">'
)

# 2. Update sidebar to remove inline styles that override the Vibe Design
text = text.replace(
    '<aside className="sidebar" style={{ display: \'flex\', flexDirection: \'column\' }}>',
    '<aside className="sidebar">'
)
# Update the title inside sidebar
text = text.replace(
    '<h2 style={{ letterSpacing: \'-0.02em\', display: \'flex\', alignItems: \'center\', gap: 10 }}>',
    '<h2>'
)

# 3. Update activeTab fields styling
text = text.replace(
    "<div style={{ display: 'flex', flexDirection: 'column' }}>",
    '<div className="animate-fade-up">'
)
# 4. Remove inline styles from tabs wrapper if any, but it is just <div className="tabs">

# 5. Fix field collapsing bug!
# The bug is that we use expandedFields[field.id] === true. But we want it to be false if collapsed, and true if expanded, 
# defaulting to collapsed. Since missing keys are undefined, `!== false` means undefined is expanded. 
# We actually just want `expandedFields[field.id] === true`.
# Wait, if `expandedFields[field.id] === true`, it is collapsed by default!
# Then why wasn't it collapsed on Vercel? Because the deployed version had `!== false` from before.
# Since we restored the file, let's make absolutely sure it is `expandedFields[field.id] === true`.

text = text.replace(
    "{expandedFields[field.id] !== false && (",
    "{expandedFields[field.id] === true && ("
)
text = text.replace(
    "{expandedFields[field.id] !== false ? <ChevronDown size={16} /> : <ChevronRight size={16} />}",
    "{expandedFields[field.id] === true ? <ChevronDown size={16} /> : <ChevronRight size={16} />}"
)

# 6. Make field card title prettier
text = text.replace(
    '<div style={{ display: \'flex\', flexDirection: \'column\', gap: 2 }}>',
    '<div style={{ display: \'flex\', flexDirection: \'column\', gap: 4 }}>'
)

# 7. Update the Editor Canvas background
text = text.replace(
    '<div className="editor-canvas" style={{ flex: 1, backgroundColor: \'var(--bg-builder)\', padding: 0, display: \'flex\', flexDirection: \'column\', overflow: \'hidden\' }}>',
    '<div className="editor-canvas" style={{ flex: 1, padding: 0, display: \'flex\', flexDirection: \'column\', overflow: \'hidden\' }}>'
)
text = text.replace(
    '<div className="editor-canvas" style={{ flex: 1, backgroundColor: \'#f8fafc\', padding: 0, display: \'flex\', flexDirection: \'column\', overflow: \'hidden\' }}>',
    '<div className="editor-canvas" style={{ flex: 1, padding: 0, display: \'flex\', flexDirection: \'column\', overflow: \'hidden\' }}>'
)

with codecs.open('src/pages/Builder.jsx', 'w', 'utf-8') as fw:
    fw.write(text)

print("Builder patched successfully")
