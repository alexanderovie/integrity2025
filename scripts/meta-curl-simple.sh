#!/bin/bash
# Comandos curl simples - copia y pega directamente

# 1. Información del usuario
curl -G "https://graph.facebook.com/v21.0/me" -d "access_token=${META_MARKETING_API_TOKEN}"

# 2. Permisos
curl -G "https://graph.facebook.com/v21.0/me/permissions" -d "access_token=${META_MARKETING_API_TOKEN}"

# 3. Debug token
curl -G "https://graph.facebook.com/v21.0/debug_token" -d "input_token=${META_MARKETING_API_TOKEN}" -d "access_token=${META_MARKETING_API_TOKEN}"

# 4. Ad accounts
curl -G "https://graph.facebook.com/v21.0/me/adaccounts" -d "access_token=${META_MARKETING_API_TOKEN}"

# 5. Businesses
curl -G "https://graph.facebook.com/v21.0/me/businesses" -d "access_token=${META_MARKETING_API_TOKEN}"

# 6. Páginas
curl -G "https://graph.facebook.com/v21.0/me/accounts" -d "access_token=${META_MARKETING_API_TOKEN}"
