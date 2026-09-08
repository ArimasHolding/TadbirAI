import markdown
import sys
import re

def render_md_to_html(md_path, html_path):
    with open(md_path, 'r', encoding='utf-8') as f:
        text = f.read()
    
    # Normalize line endings to Unix style
    text = text.replace('\r\n', '\n')
    
    # Store mermaid blocks and replace with placeholders
    mermaid_blocks = []
    def extract_mermaid(match):
        code = match.group(1).strip()
        placeholder = f"MYMERMAIDPLACEHOLDER{len(mermaid_blocks)}END"
        mermaid_blocks.append(code)
        return placeholder

    # Match ```mermaid ... ``` regardless of CRLF or LF
    text = re.sub(r'```mermaid\s*\n(.*?)\n```', extract_mermaid, text, flags=re.DOTALL)
    
    # Convert markdown to HTML using python-markdown 'extra' extension bundle
    html_content = markdown.markdown(text, extensions=['extra', 'toc'])
    
    # Re-insert mermaid blocks with raw unescaped syntax so Mermaid JS parses it cleanly
    for i, code in enumerate(mermaid_blocks):
        placeholder = f"MYMERMAIDPLACEHOLDER{i}END"
        mermaid_html = f'<div class="mermaid-container"><pre class="mermaid">\n{code}\n</pre></div>'
        
        # Check if markdown wrapped the placeholder in <p>...</p>
        p_placeholder = f"<p>{placeholder}</p>"
        if p_placeholder in html_content:
            html_content = html_content.replace(p_placeholder, mermaid_html)
        else:
            html_content = html_content.replace(placeholder, mermaid_html)
            
    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Software Architecture & Design (SAD / SDD) - Tadbir AI</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <script type="module">
      import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
      mermaid.initialize({{
        startOnLoad: true,
        theme: 'neutral',
        securityLevel: 'loose',
        flowchart: {{ htmlLabels: true, useMaxWidth: true }},
        themeVariables: {{
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          primaryColor: '#6366f1',
          primaryTextColor: '#1e293b',
          primaryBorderColor: '#cbd5e1',
          lineColor: '#64748b',
          secondaryColor: '#f1f5f9',
          tertiaryColor: '#ffffff'
        }}
      }});
    </script>
    <style>
        :root {{
            --primary: #4f46e5;
            --primary-dark: #4338ca;
            --bg-main: #f8fafc;
            --bg-card: #ffffff;
            --text-main: #0f172a;
            --text-muted: #475569;
            --border-color: #e2e8f0;
            --code-bg: #1e293b;
        }}

        * {{
            box-sizing: border-box;
        }}

        body {{
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.7;
            color: var(--text-main);
            background-color: var(--bg-main);
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }}

        .page-header {{
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%);
            color: #ffffff;
            padding: 48px 24px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            margin-bottom: 40px;
            box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.25);
        }}

        .header-content {{
            max-width: 1080px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
        }}

        .header-title {{
            font-size: 1.1rem;
            font-weight: 700;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            color: #818cf8;
            margin-bottom: 6px;
        }}

        .header-main {{
            font-size: 2.2rem;
            font-weight: 800;
            margin: 0;
            color: #ffffff;
            line-height: 1.2;
        }}

        .header-badge {{
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(99, 102, 241, 0.2);
            border: 1px solid rgba(165, 180, 252, 0.3);
            padding: 6px 14px;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 600;
            color: #c7d2fe;
        }}

        .container {{
            max-width: 1080px;
            margin: 0 auto;
            padding: 0 24px 80px 24px;
        }}

        .content-card {{
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 48px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
        }}

        h1 {{
            font-size: 2.25rem;
            font-weight: 800;
            color: #0f172a;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 12px;
            margin-top: 0;
            margin-bottom: 24px;
            letter-spacing: -0.025em;
        }}

        h2 {{
            font-size: 1.65rem;
            font-weight: 700;
            color: #1e1b4b;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 8px;
            margin-top: 40px;
            margin-bottom: 20px;
            letter-spacing: -0.015em;
        }}

        h3 {{
            font-size: 1.3rem;
            font-weight: 700;
            color: #312e81;
            margin-top: 32px;
            margin-bottom: 14px;
        }}

        h4 {{
            font-size: 1.1rem;
            font-weight: 600;
            color: #475569;
            margin-top: 24px;
            margin-bottom: 10px;
        }}

        p {{
            margin-bottom: 1.25rem;
            color: #334155;
            font-size: 1.025rem;
        }}

        hr {{
            border: none;
            border-top: 1px solid var(--border-color);
            margin: 36px 0;
        }}

        table {{
            border-collapse: separate;
            border-spacing: 0;
            width: 100%;
            margin: 28px 0;
            font-size: 0.95rem;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid var(--border-color);
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
        }}

        th, td {{
            padding: 12px 18px;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
            border-right: 1px solid var(--border-color);
        }}

        th:last-child, td:last-child {{
            border-right: none;
        }}

        tr:last-child td {{
            border-bottom: none;
        }}

        th {{
            background-color: #f1f5f9;
            color: #1e293b;
            font-weight: 700;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }}

        tr:nth-child(even) {{
            background-color: #f8fafc;
        }}

        tr:hover {{
            background-color: #f1f5f9;
        }}

        code {{
            background-color: #f1f5f9;
            color: #4338ca;
            padding: 0.25em 0.5em;
            border-radius: 6px;
            font-family: 'JetBrains Mono', Consolas, monospace;
            font-size: 0.875em;
            border: 1px solid #e2e8f0;
            font-weight: 500;
        }}

        pre {{
            background-color: var(--code-bg);
            color: #f8fafc;
            padding: 20px;
            overflow-x: auto;
            border-radius: 12px;
            font-family: 'JetBrains Mono', Consolas, monospace;
            font-size: 0.9em;
            line-height: 1.6;
            margin: 24px 0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }}

        pre code {{
            background-color: transparent;
            color: inherit;
            padding: 0;
            border-radius: 0;
            border: none;
        }}

        .mermaid-container {{
            background: #ffffff;
            border: 1px solid #cbd5e1;
            border-radius: 12px;
            padding: 24px 16px;
            margin: 28px 0;
            overflow-x: auto;
            display: flex;
            justify-content: center;
            box-shadow: 0 2px 4px 0 rgba(0,0,0,0.02);
        }}

        pre.mermaid {{
            background-color: transparent;
            border: none;
            padding: 0;
            margin: 0;
            box-shadow: none;
            color: #1e293b;
            text-align: center;
            width: 100%;
        }}

        ul, ol {{
            padding-left: 24px;
            margin-bottom: 20px;
            color: #334155;
        }}

        li {{
            margin-bottom: 8px;
        }}

        strong {{
            color: #0f172a;
        }}

        .page-break {{
            page-break-after: always;
            height: 1px;
            margin: 40px 0;
        }}

        .btn-print {{
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #4f46e5;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 9999px;
            font-weight: 700;
            font-size: 0.9rem;
            cursor: pointer;
            box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.4);
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s ease;
            z-index: 1000;
        }}

        .btn-print:hover {{
            background: #4338ca;
            transform: translateY(-2px);
            box-shadow: 0 14px 24px -5px rgba(79, 70, 229, 0.5);
        }}

        @media print {{
            body {{
                background: white;
                color: black;
            }}
            .page-header, .btn-print {{
                display: none;
            }}
            .container {{
                max-width: 100%;
                padding: 0;
            }}
            .content-card {{
                border: none;
                box-shadow: none;
                padding: 0;
            }}
            .mermaid-container {{
                page-break-inside: avoid;
                border: 1px solid #ccc;
            }}
            h2, h3 {{
                page-break-after: avoid;
            }}
        }}
    </style>
</head>
<body>

    <header class="page-header">
        <div class="header-content">
            <div>
                <div class="header-title">Software Architecture & Detailed Design (SAD & SDD)</div>
                <h1 class="header-main">Tadbir AI Platform</h1>
            </div>
            <div class="header-badge">
                <span>Version 2.5.0</span>
                <span>•</span>
                <span>RBAC & Architecture Edition</span>
            </div>
        </div>
    </header>

    <main class="container">
        <article class="content-card">
            {html_content}
        </article>
    </main>

    <button class="btn-print" onclick="window.print()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        <span>Print PDF / Save Document</span>
    </button>

</body>
</html>"""

    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(full_html)
    print(f"SAD_and_SDD.html successfully rendered with {len(mermaid_blocks)} mermaid diagrams.")

if __name__ == "__main__":
    render_md_to_html("SAD_and_SDD.md", "SAD_and_SDD.html")
