import os, base64
from playwright.sync_api import sync_playwright

project_dir = os.path.expanduser("~/campus-event-manager")
desktop_dir = os.path.expanduser("~/Desktop")
downloads_dir = os.path.expanduser("~/Downloads")
pdf_output_path = os.path.join(desktop_dir, "Chamakura_Akhil_Reddy_Technical_Report_Final.pdf")

os.makedirs(project_dir, exist_ok=True)

def find_image(keywords):
    for d in [downloads_dir, desktop_dir, r"C:\Users\bhara\OneDrive\Pictures\images"]:
        if os.path.exists(d):
            for file in os.listdir(d):
                if file.lower().endswith('.png'):
                    for kw in keywords:
                        if kw in file:
                            return os.path.join(d, file)
    return ""

img_map = {
    'dash': find_image(['42934']),
    'usr':  find_image(['42956']),
    'ana':  find_image(['43005']),
    'det1': find_image(['43035']),
    'det2': find_image(['44447']),
    'evt':  find_image(['44454'])
}

encoded = {}
for k, path in img_map.items():
    if path and os.path.exists(path):
        with open(path, 'rb') as f:
            encoded[k] = f"data:image/png;base64,{base64.b64encode(f.read()).decode('utf-8')}"
    else:
        encoded[k] = ""

html_parts = [
"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
    @page { size: letter; margin: 15mm; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 9.5pt; color: #1e293b; line-height: 1.45; margin: 0; padding: 0; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 12px; }
    .title { font-size: 16pt; font-weight: bold; color: #0f172a; margin-bottom: 2px; }
    .subtitle { font-size: 10pt; color: #475569; }
    .meta-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 10px 14px; margin-bottom: 16px; }
    .meta-table { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
    .meta-table td { padding: 3px 0; }
    h2 { font-size: 11pt; font-weight: bold; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin-top: 18px; text-transform: uppercase; letter-spacing: 0.5px; page-break-after: avoid; }
    h3 { font-size: 9.5pt; font-weight: bold; color: #334155; margin-top: 12px; margin-bottom: 4px; page-break-after: avoid; }
    p { margin-top: 0; margin-bottom: 8px; text-align: justify; }
    .fig-box { text-align: center; margin: 12px 0 16px 0; page-break-inside: avoid; }
    .fig-box img { width: 100%; max-width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .caption { font-size: 8pt; color: #475569; font-style: italic; margin-top: 4px; }
    .code-block { background-color: #f1f5f9; border-left: 3px solid #0f172a; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; font-family: 'Courier New', Courier, monospace; font-size: 8pt; padding: 8px 10px; margin: 6px 0 10px 0; white-space: pre-wrap; word-break: break-all; color: #0f172a; line-height: 1.35; page-break-inside: avoid; }
    table.data-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 8.5pt; page-break-inside: avoid; }
    table.data-table th { background: #0f172a; color: white; padding: 6px 8px; text-align: left; border: 1px solid #0f172a; }
    table.data-table td { border: 1px solid #e2e8f0; padding: 6px 8px; vertical-align: top; }
    table.data-table tr:nth-child(even) td { background-color: #f8fafc; }
</style>
</head>
<body>
    <div class="header">
        <div class="title">Campus Event Management System</div>
        <div class="subtitle">Technical Architecture & Database Aggregation Report</div>
    </div>
    <div class="meta-box">
        <table class="meta-table">
            <tr><td style="width: 15%;"><b>Student Author:</b></td><td style="width: 35%;">Chamakura Akhil Reddy</td><td style="width: 15%;"><b>Date:</b></td><td style="width: 35%;">September 10, 2026</td></tr>
            <tr><td><b>Repository:</b></td><td colspan="3"><code style="font-size: 8pt; background: #e2e8f0; padding: 1px 4px; border-radius: 3px;">https://github.com/akhill-reddy/campus-event-manager</code></td></tr>
            <tr><td><b>Tech Stack:</b></td><td colspan="3">Node.js, Express.js, MongoDB Atlas, EJS, Bootstrap 5</td></tr>
        </table>
    </div>
    <h2>1. Executive Summary & System Architecture</h2>
    <p>The <b>Campus Event Manager</b> is a multi-tier full-stack application built to streamline university event scheduling, participant tracking, and real-time database aggregations using Node.js, Express, and MongoDB Atlas.</p>
    <table class="data-table">
        <tr><th style="width: 20%;">Layer</th><th style="width: 25%;">Technology</th><th>Implementation Details</th></tr>
        <tr><td>Backend Runtime</td><td>Node.js / Express.js</td><td>Handles REST routing, middleware request validation, and dynamic view rendering.</td></tr>
        <tr><td>Database Store</td><td>MongoDB Atlas / Mongoose</td><td>Document persistence store managing relational references and embedded participant arrays.</td></tr>
        <tr><td>Presentation</td><td>EJS & Bootstrap 5</td><td>Server-side templating providing responsive layouts and component styling.</td></tr>
        <tr><td>Analytics Engine</td><td>MongoDB Aggregations</td><td>Processes multi-stage pipeline operations ($unwind, $group, $lookup, $project).</td></tr>
    </table>
    <h2>2. System User Interfaces & Modules</h2>
    <h3>2.1 Main Operations Dashboard</h3>
    <div class="fig-box"><img src=""" + encoded.get('dash', '') + """"><div class="caption">Figure 1: Main Platform Dashboard showing live operational counters and popular event metrics.</div></div>
    <h3>2.2 Events Catalog & Management</h3>
    <div class="fig-box"><img src=""" + encoded.get('evt', '') + """"><div class="caption">Figure 2: Events Catalog displaying active workshop cards, categories, and capacity indicators.</div></div>
    <h3>2.3 Event Details & Participant Registration</h3>
    <div class="fig-box"><img src=""" + encoded.get('det1', '') + """"><div class="caption">Figure 3: Event Detail metadata view featuring venue details and administrative controls.</div></div>
    <div class="fig-box"><img src=""" + encoded.get('det2', '') + """"><div class="caption">Figure 4: Participant registration interface and active attendee roster management table.</div></div>
    <h3>2.4 User Directory & Role Management</h3>
    <div class="fig-box"><img src=""" + encoded.get('usr', '') + """"><div class="caption">Figure 5: User Directory table with role badges, department mappings, and history tracking links.</div></div>
    <h2>3. MongoDB Aggregation Pipelines & Analytics</h2>
    <h3>3.1 Analytics & Reporting Interface</h3>
    <div class="fig-box"><img src=""" + encoded.get('ana', '') + """"><div class="caption">Figure 6: Analytics Dashboard displaying category metrics, popularity rankings, and inactive user tracking.</div></div>
    <p><b>Pipeline 1: Total Registrations by Category</b></p>
    <div class="code-block">db.events.aggregate([
  { $unwind: "$registrations" },
  { $group: { _id: "$category", totalEvents: { $addToSet: "$_id" }, confirmedRegistrations: { $sum: 1 } } },
  { $project: { category: "$_id", eventsCount: { $size: "$totalEvents" }, confirmedRegistrations: 1, _id: 0 } },
  { $sort: { confirmedRegistrations: -1 } }
]);</div>
    <p><b>Pipeline 2: Top 5 Events by Occupancy Rate</b></p>
    <div class="code-block">db.events.aggregate([
  { $project: { title: 1, category: 1, capacity: 1, registrationsCount: { $size: { $ifNull: ["$registrations", []] } }, occupancyRate: { $multiply: [ { $divide: [ { $size: { $ifNull: ["$registrations", []] } }, "$capacity" ] }, 100 ] } } },
  { $sort: { occupancyRate: -1 } },
  { $limit: 5 }
]);</div>
    <p><b>Pipeline 3: Inactive Users Query ($lookup)</b></p>
    <div class="code-block">db.users.aggregate([
  { $lookup: { from: "events", localField: "_id", foreignField: "registrations.userId", as: "userEvents" } },
  { $match: { userEvents: { $size: 0 } } },
  { $project: { firstName: 1, lastName: 1, email: 1, role: 1 } }
]);</div>
    <h2>4. Project Verification</h2>
    <table class="data-table">
        <tr><td style="width: 30%;"><b>Developer</b></td><td>Chamakura Akhil Reddy</td></tr>
        <tr><td><b>Repository Link</b></td><td>https://github.com/akhill-reddy/campus-event-manager</td></tr>
        <tr><td><b>Status</b></td><td>Fully Operational & Verified</td></tr>
    </table>
</body>
</html>
"""
]

html_content = "".join(html_parts)
html_path = os.path.join(project_dir, "render.html")
with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto(f"file:///{html_path.replace('\\', '/')}")
    page.pdf(path=pdf_output_path, format="Letter", print_background=True, margin={"top": "15mm", "bottom": "15mm", "left": "15mm", "right": "15mm"})
    browser.close()

print(f"SUCCESS: {pdf_output_path}")
