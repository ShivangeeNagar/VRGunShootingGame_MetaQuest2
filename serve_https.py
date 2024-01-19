import http.server
import ssl

server_address = ('localhost', 8080)
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)

httpd.socket = ssl.wrap_socket(httpd.socket,
                               server_side=True,
                               certfile='cert.pem',
                               keyfile='key.pem',
                               ssl_version=ssl.PROTOCOL_TLS)

print("Serving at https://localhost:8080")
httpd.serve_forever()
