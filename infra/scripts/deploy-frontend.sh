#!/bin/bash

echo "fazendo build do front end"
cd C:/plataforma-tcc/front-end || exit 1
npm install
npm run build

echo "subindo atualizações pro bucket s3"
aws s3 sync build/ s3://www.plataforma-tcc.com --delete

echo "invalidando cache do cloudfront"
aws cloudfront create-invalidation \
  --distribution-id SEU_DISTRIBUTION_ID \
  --paths "/*"

echo "Deploy do frontend realizado com sucesso"
