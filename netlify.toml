# =========================================================
# SECURITY HEADERS
# WEBSITE DKM NURUL HUDA
# =========================================================

[[headers]]
for = "/*"

[headers.values]

# Mencegah website dimasukkan ke iframe website lain
X-Frame-Options = "DENY"

# Mencegah browser menebak tipe file
X-Content-Type-Options = "nosniff"

# Mengontrol informasi halaman yang dikirim sebagai referrer
Referrer-Policy = "strict-origin-when-cross-origin"

# Membatasi fitur browser yang tidak diperlukan
Permissions-Policy = "camera=(), microphone=(), geolocation=()"

# Memaksa HTTPS
Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"

# Mencegah halaman digunakan sebagai frame
Content-Security-Policy = "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https:; connect-src 'self' https://script.google.com https://script.googleusercontent.com; font-src 'self' https://cdn.jsdelivr.net; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
