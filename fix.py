import codecs

with codecs.open('src/index.css', 'r', 'utf-8') as f:
    content = f.read()

# Fix spacing if corrupted
if '. d a s h b o a r d' in content:
    print('Found spaced string, stripping')
    
idx = content.find('.public-form-btn:hover')
if idx != -1:
    idx_end = content.find('}', idx)
    keep = content[:idx_end+1]
    
    append_css = """

/* Dashboard Redesign Classes */
.dashboard-bg {
  background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
  position: relative;
}

.dashboard-bg::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(circle at 10% 20%, rgba(2, 132, 199, 0.05) 0%, transparent 40%),
              radial-gradient(circle at 90% 80%, rgba(99, 102, 241, 0.05) 0%, transparent 40%);
  pointer-events: none;
}

.dashboard-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  padding: 28px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  animation: fadeUp 0.5s ease backwards;
}

.dashboard-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.1), 0 4px 8px -4px rgba(0, 0, 0, 0.06);
  border-color: rgba(2, 132, 199, 0.3);
}

.dashboard-card::after {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--accent-color), #6366f1);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.dashboard-card:hover::after {
  opacity: 1;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.glass-header {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
  position: sticky;
  top: 0;
  z-index: 20;
  padding: 24px 48px;
  margin: -48px -48px 40px -48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
"""
    
    with codecs.open('src/index.css', 'w', 'utf-8') as fw:
        fw.write(keep + append_css)
    print("Fixed!")
else:
    print("Could not find anchor")
