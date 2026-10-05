# node_rest_demo

[![CI](https://github.com/bsvdoom/node_rest_demo/actions/workflows/ci.yml/badge.svg)](https://github.com/bsvdoom/node_rest_demo/actions/workflows/ci.yml)

Kis REST API JWT-alapú felhasználókezeléssel és kapcsolatfelvételi űrlappal. A projekt kód async/await-et, Express 5-öt, Mongoose 9-et, központi JSON hibakezelést és Docker Compose-alapú futtatást használ.

## Technológiai stack

- Node.js 24.20.0, Debian Bookworm slim image, nem root felhasználó
- Express 5.2.1 és express-validator 7.3.2
- MongoDB 8.0.29 és Mongoose 9.9.4
- jsonwebtoken 9.0.3, bcryptjs 3.0.3
- Nodemailer 10.0.0
- Helmet, CORS és express-rate-limit
- Docker Compose és a beépített `node:test` tesztfuttató

A Node és Mongo image pontos taggel és multi-platform digesttel van rögzítve a Docker-konfigurációban.

## Előfeltételek

- Docker Engine
- Docker Compose v2 (`docker compose`)
- OpenSSL a lokális tesztsecretek generálásához

Helyi Node.js vagy MongoDB telepítés nem szükséges.

## Docker Compose quick start

1. Hozd létre a konfigurációt és a secret fájlokat a példákból:

   ```sh
   cp .env.example .env
   for source in secrets/*.example; do cp "$source" "${source%.example}"; done
   ```

2. Hozd létre a secreteket anélkül, hogy az értékük a terminálra kerülne:

```sh
openssl rand -hex 24 > secrets/mongo_root_username
openssl rand -hex 32 > secrets/mongo_root_password
openssl rand -hex 32 > secrets/mongo_app_password
openssl rand -hex 64 > secrets/jwt_secret
openssl rand -hex 32 > secrets/smtp_password
openssl rand -hex 32 > secrets/admin_password
chmod 0444 secrets/*
```

3. Cseréld le a `.env` és a `secrets/` alatti új fájlok összes placeholder értékét. A JWT secret legalább 32 bájt, az admin jelszó legalább 12 karakter legyen. A lokális Compose file secretjeit a nem root konténerfolyamatoknak is olvasniuk kell:

   ```sh
   chmod 0444 secrets/mongo_root_username secrets/mongo_root_password \
     secrets/mongo_app_password secrets/jwt_secret \
     secrets/smtp_password secrets/admin_password
   ```

   A fájlok read-only secretként kerülnek a konténerekbe. 


4. Ellenőrizd, majd indítsd el a stacket:

   ```sh
   docker compose config --quiet
   docker compose up --build --detach --wait
   ```

   Az API alapértelmezetten a `http://localhost:3000` címen érhető el. Az alkalmazás csak az autentikált Mongo healthcheck sikeressége után indul el.

5. Hozd létre a szerepköröket és az első admint:

   ```sh
   docker compose exec app npm run seed:admin
   ```

6. Leállítás:

   ```sh
   docker compose down
   ```

## Endpointok

| Metódus | Útvonal | Védelem | Leírás |
|---|---|---|---|
| `GET` | `/health` | nyilvános | Alkalmazás- és adatbázis-healthcheck |
| `POST` | `/auth/signin` | nyilvános, rate limit | Bejelentkezés és access token kiadása |
| `POST` | `/auth/signup` | admin | Felhasználó létrehozása |
| `DELETE` | `/auth/delete` | admin | Felhasználó törlése email alapján |
| `POST` | `/` | nyilvános, rate limit | Kapcsolatfelvétel mentése és email értesítés |
| `GET` | `/` | admin | A legutóbbi legfeljebb 100 kapcsolatfelvétel |

Healthcheck:

```sh
curl --fail http://localhost:3000/health
```

Bejelentkezés:

```sh
curl --request POST http://localhost:3000/auth/signin \
  --header 'Content-Type: application/json' \
  --data '{"email":"admin@example.invalid","password":"replace-with-admin-password"}'
```

Az admin endpointokhoz másold a válasz `accessToken` értékét egy shell-változóba:

```sh
TOKEN='replace-with-access-token'
curl http://localhost:3000/ \
  --header "Authorization: Bearer $TOKEN"
```

Felhasználó létrehozása és törlése:

```sh
curl --request POST http://localhost:3000/auth/signup \
  --header "Authorization: Bearer $TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{"first_name":"Demo","family_name":"User","email":"demo@example.invalid","tel":"+3612345678","password":"StrongDemo123!","roles":["user"]}'

curl --request DELETE http://localhost:3000/auth/delete \
  --header "Authorization: Bearer $TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{"email":"demo@example.invalid"}'
```

Kapcsolatfelvétel:

```sh
curl --request POST http://localhost:3000/ \
  --header 'Content-Type: application/json' \
  --data '{"name":"Demo User","email":"demo@example.invalid","tel":"+3612345678","message":"Tesztüzenet","url":"https://example.invalid/contact"}'
```

## Integrációs tesztek

A tesztstack külön `test_integration` adatbázist, Nodemailer JSON transportot és eldobható Compose-volume-ot használ. Valódi SMTP-kapcsolatot nem nyit.

Hozd létre az ignorált lokális tesztsecreteket anélkül, hogy az értékük a terminálra kerülne:

```sh
mkdir -p secrets/test
openssl rand -hex 24 > secrets/test/mongo_root_username
openssl rand -hex 32 > secrets/test/mongo_root_password
openssl rand -hex 32 > secrets/test/mongo_app_password
openssl rand -hex 64 > secrets/test/jwt_secret
openssl rand -hex 32 > secrets/test/smtp_password
openssl rand -hex 32 > secrets/test/admin_password
chmod 0444 secrets/test/*
```

Ezután futtasd ugyanazt a folyamatot, mint a CI:

```sh
docker compose -p node-rest-demo-integration -f compose.test.yaml config --quiet
docker compose -p node-rest-demo-integration -f compose.test.yaml build app
docker compose -p node-rest-demo-integration -f compose.test.yaml up --detach --wait --no-build
docker compose -p node-rest-demo-integration -f compose.test.yaml exec -T app npm run seed:admin
docker compose -p node-rest-demo-integration -f compose.test.yaml exec -T app npm run test:integration
docker compose -p node-rest-demo-integration -f compose.test.yaml exec -T app npm audit --omit=dev
docker compose -p node-rest-demo-integration -f compose.test.yaml down --volumes --remove-orphans
```

Az utolsó parancs kizárólag a megadott tesztprojekt erőforrásait és eldobható Mongo-volume-ját takarítja el.

## Biztonsági megoldások

- Docker file secretek a Mongo-, JWT-, SMTP- és admin-jelszavakhoz
- külön, csak az alkalmazás adatbázisán `readWrite` jogosultságú Mongo-user
- autentikált Mongo healthcheck és nem root Node-konténer
- JWT algoritmus-, issuer- és audience-korlátozás
- async bcrypt, 12-es work factor és unique email index
- generikus sikertelen-login válasz
- Helmet, explicit CORS allowlist és korlátozott request body
- login- és contact-rate limit
- bemenetvalidáció és központi JSON hibakezelés
- DB-kapcsolat utáni HTTP-indítás, SIGTERM/SIGINT graceful shutdown

## Projektstruktúra

```text
app.js                     Express konfiguráció és hibakezelés
bin/www                    DB-hez kötött indulás és graceful shutdown
config/                    environment-, adatbázis-, JWT- és email-konfiguráció
controllers/               auth- és contact-kérések kezelése
middlewares/               JWT, jogosultság, validáció és rate limit
models/                    Mongoose modellek és kapcsolatkezelés
routes/                    publikus és védett route-ok
scripts/seed-admin.js      idempotens admin seeder
docker/                    Mongo init- és healthcheck-scriptek
tests/integration.test.js  node:test + fetch integrációs tesztek
compose.yaml               normál stack
compose.test.yaml          izolált tesztstack
secrets/                   kizárólag verziózott példák és ignorált valódi fájlok
```

## Ismert korlátok

- A rate limit memóriában él, ezért több app-példány között nem megosztott és újraindításkor nullázódik.
- A MongoDB standalone módban fut; nincs replica set vagy magas rendelkezésre állás.
- Nincs refresh token vagy token-visszavonási tároló.
- A contact rekord az email küldése előtt mentésre kerül; SMTP-hiba esetén a kliens 502-t kap, de a rekord megmarad.
- A tesztek szekvenciálisak, egyetlen app- és Mongo-példányt ellenőriznek.
- Egyes új Linux kerneleken a rögzített Mongo image indításához a Compose-ban szereplő `GLIBC_TUNABLES` workaround szükséges; éles hoston a MongoDB által jelzett THP- és `vm.max_map_count` ajánlásokat külön kell beállítani.
