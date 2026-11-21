"""Generate js/data.js (LETTERS, CATS) and js/precache.js from tools/*.json and images."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
letters = json.load(open(os.path.join(ROOT, "tools", "letters20.json"), encoding="utf-8"))["letters"]
cats = json.load(open(os.path.join(ROOT, "tools", "words.json"), encoding="utf-8"))["categories"]
with open(os.path.join(ROOT, "js", "data.js"), "w", encoding="utf-8") as f:
    f.write("window.LETTERS = " + json.dumps(letters, ensure_ascii=False) + ";\n")
    f.write("window.CATS = " + json.dumps(cats, ensure_ascii=False) + ";\n")
files = ["./", "index.html", "css/styles.css", "js/data.js", "js/app.js",
         "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"]
wd = os.path.join(ROOT, "images", "words")
if os.path.isdir(wd):
    files += ["images/words/" + n for n in sorted(os.listdir(wd)) if n.endswith(".svg")]
with open(os.path.join(ROOT, "js", "precache.js"), "w", encoding="utf-8") as f:
    f.write("self.PRECACHE = " + json.dumps(files) + ";\n")
print("letters", len(letters), "| cats", len(cats), "| precache", len(files))
