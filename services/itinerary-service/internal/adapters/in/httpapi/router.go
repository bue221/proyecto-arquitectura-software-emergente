package httpapi

import "net/http"

func NewRouter(h Handlers, openAPI []byte) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", h.Health)
	mux.HandleFunc("GET /api/v1/itineraries", h.List)
	mux.HandleFunc("POST /api/v1/itineraries", h.Create)
	mux.HandleFunc("GET /api/v1/itineraries/{id}", h.Get)
	mux.HandleFunc("PUT /api/v1/itineraries/{id}", h.Update)
	mux.HandleFunc("DELETE /api/v1/itineraries/{id}", h.Delete)

	mux.HandleFunc("GET /openapi.yaml", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/yaml")
		_, _ = w.Write(openAPI)
	})
	mux.HandleFunc("GET /swagger", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		_, _ = w.Write([]byte(swaggerHTML))
	})

	var handler http.Handler = mux
	handler = TraceMiddleware(handler)
	handler = CORSMiddleware(handler)
	return handler
}

const swaggerHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Itinerary Service API</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>
  window.ui = SwaggerUIBundle({ url: '/openapi.yaml', dom_id: '#swagger-ui' });
</script>
</body>
</html>`
