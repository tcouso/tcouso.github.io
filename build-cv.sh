#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

chrome=""
for candidate in google-chrome google-chrome-stable chromium chromium-browser; do
  if command -v "$candidate" >/dev/null 2>&1; then
    chrome="$candidate"
    break
  fi
done

if [ -z "$chrome" ]; then
  echo "No Chrome/Chromium binary found; cannot render cv.pdf." >&2
  exit 1
fi

"$chrome" --headless --disable-gpu --no-sandbox --no-pdf-header-footer \
  --print-to-pdf=cv.pdf cv.html

python3 - <<'PY'
import re
with open('cv.pdf', 'rb') as f:
    pdf = f.read()
# Chrome stamps CreationDate/ModDate on every render; a fixed-width replacement
# keeps xref offsets valid and makes identical input produce identical bytes.
pdf = re.sub(rb"D:\d{14}[+-]\d{2}'\d{2}'", b"D:19700101000000+00'00'", pdf)
with open('cv.pdf', 'wb') as f:
    f.write(pdf)
PY

echo "cv.pdf rebuilt"
