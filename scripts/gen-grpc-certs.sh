#!/usr/bin/env bash
# Generate local-only CA + server/client certs for Airport↔Itinerary gRPC mTLS demos.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${ROOT}/infra/certs/grpc"
mkdir -p "$OUT"
cd "$OUT"

openssl req -x509 -newkey rsa:2048 -nodes -keyout ca.key -out ca.crt -days 825 \
  -subj "/CN=RutaCO Local CA"

openssl req -newkey rsa:2048 -nodes -keyout server.key -out server.csr \
  -subj "/CN=airport-service"
cat > server.ext <<'EXT'
subjectAltName = DNS:airport-service,DNS:localhost,IP:127.0.0.1
extendedKeyUsage = serverAuth
EXT
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
  -out server.crt -days 825 -extfile server.ext

openssl req -newkey rsa:2048 -nodes -keyout client.key -out client.csr \
  -subj "/CN=itinerary-service"
cat > client.ext <<'EXT'
extendedKeyUsage = clientAuth
EXT
openssl x509 -req -in client.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
  -out client.crt -days 825 -extfile client.ext

rm -f server.csr client.csr server.ext client.ext ca.srl
chmod 644 ca.crt server.crt client.crt
chmod 600 ca.key server.key client.key
echo "Wrote mTLS materials under ${OUT}"
