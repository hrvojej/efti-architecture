# eFTI REFERENTNA ARHITEKTURA — OBVEZUJUĆI DOKUMENT ZA IMPLEMENTACIJU

> **⚠️ OVAJ DOKUMENT JE JEDINI MJERODAVNI IZVOR ZA eFTI ARHITEKTURU NA PROJEKTU.**
>
> Svi projektni dokumenti (eADR, NSCP, Procjena kapaciteta, implementacijski zahtjevi, analitika)
> **MORAJU biti usklađeni** s ovim dokumentom. U slučaju bilo kakvog neslaganja između ovog
> dokumenta i drugog projektnog dokumenta, **vrijedi ovaj dokument**.
>
> Ovo se primjenjuje na: dizajn, razvoj, integraciju, testiranje i produkcijsku implementaciju.
>
> **Izvor:** Provedbena uredba Komisije (EU) 2024/1942, Uredba (EU) 2020/1056, Delegirana uredba (EU) 2024/2024.

---

## Sadržaj

1. [Pravna osnova](#1-pravna-osnova)
   - 1.1. Smjernice za razvoj — EU referentni resursi
2. [Pet obveznih ICT komponenti](#2-pet-obveznih-ict-komponenti)
   - 2.1. Authority Access Point — AAP
     - 2.1.1. Smjernice za razvoj — tehnološke opcije i EU primjeri
   - 2.2. Authorisation Registry — Registar ovlaštenja
     - 2.2.1. Smjernice za razvoj — RBAC model i NIAS integracija
   - 2.3. eFTI Gate
     - 2.3.1. Smjernice za razvoj — Domibus referentna implementacija
   - 2.4. Search Mechanism + Registry of Identifiers — RoI
     - 2.4.1. Smjernice za razvoj — SQL shema i algoritam pretrage
   - 2.5. User Application — Korisnička aplikacija
     - 2.5.1. Smjernice za razvoj — UI komponente i mobilna aplikacija
3. [KRITIČNO PRAVILO: Platforma → JEDAN Gate](#3-kritično-pravilo-platforma--jedan-gate-matični-gate)
   - 3.1. Smjernice za razvoj — Gate registar i health check
4. [Dvije procedure pristupa eFTI podacima](#4-dvije-procedure-pristupa-efti-podacima-čl-21)
   - 4.1. Smjernice za razvoj — OpenAPI specifikacija i XML primjeri
5. [Komunikacijski protokoli](#5-komunikacijski-protokoli-čl-9)
   - 5.1. Statičko otkrivanje — Gate-to-Gate
   - 5.2. Dinamičko otkrivanje — Gate-to-Platform (SML/SMP)
     - 5.2.1. Smjernice za razvoj — SML/SMP konfiguracija
6. [Sigurnost](#6-sigurnost-čl-10)
   - 6.1. Smjernice za razvoj — certifikati, HSM, mTLS, NIAS OAuth2
7. [Struktura zahtjeva](#7-struktura-zahtjeva-čl-3)
   - 7.1. Smjernice za razvoj — validacijski pipeline
8. [UIL struktura](#8-uil-struktura-čl-112)
   - 8.1. Smjernice za razvoj — UIL format, UUID generacija, QR kod
9. [RoI identifikatori i eFTI1451](#9-roi-identifikatori-i-efti1451-čl-113)
   - 9.1. Smjernice za razvoj — DG query i identifier mapping
10. [Revizijski trag i retencija](#10-revizijski-trag-i-retencija)
    - 10.1. Smjernice za razvoj — audit log opcije, immutability pristupi
11. [Timeout i error handling](#11-timeout-i-error-handling)
    - 11.1. Smjernice za razvoj — timeout strategija, circuit breaker, error kodovi
12. [Naknadna komunikacija (Follow-up)](#12-naknadna-komunikacija-follow-up)
    - 12.1. Smjernice za razvoj — AS4 follow-up XML i Kafka pipeline
13. [Terminološka referenca — ŠTO NE POSTOJI u uredbi](#13-terminološka-referenca--što-ne-postoji-u-uredbi)
14. [Implikacije za NSCP/eADR projekt u Hrvatskoj](#14-implikacije-za-nscpeadr-projekt-u-hrvatskoj)
15. [Analitička obrada eFTI podataka (AFFINIS) — pravni okvir](#15-analitička-obrada-efti-podataka-affinis--pravni-okvir)
    - 15.1. Ograničenje svrhe pristupa
    - 15.2. AAP arhiva — legitimni izvor punih eFTI podataka
    - 15.3. Legitimni izvori za analitički sustav (AFFINIS)
    - 15.4. Prekogranična analitika — pojašnjenje
    - 15.5. Implementacijski model za AFFINIS
    - 15.6. Obvezni uvjeti za analitičku obradu
    - 15.7. Smjernice za razvoj — AFFINIS Medallion arhitektura, tehnološke opcije
16. [eADR komponente — detaljan opis i komunikacijska arhitektura](#16-eadr-komponente--detaljan-opis-i-komunikacijska-arhitektura)
    - 16.1. Tri funkcionalna područja eADR sustava
    - 16.2. Komunikacijska arhitektura
    - 16.3. Komunikacije — pregled svih integracija
    - 16.4. Tok podataka pri cestovnom nadzoru
    - 16.5. Razgraničenje odgovornosti eADR vs. NSCP
    - 16.6. Smjernice za razvoj — mogući tehnološki stog i deployment opcije
17. [Proces kreiranja DG dataseta na eFTI platformi](#17-proces-kreiranja-dg-dataseta-na-efti-platformi)
    - 17.1. Pravni okvir — ADR obveze sudionika
    - 17.2. Tko i kako kreira DG dataset
    - 17.3. DG podskup podataka (Dangerous Goods subset)
      - 17.3.1. Smjernice za razvoj — DG dataset validacija i XSD
    - 17.4. Kako eADR dohvaća DG dataset — selective pull
18. [Primjenjivost i verzioniranje](#18-primjenjivost-i-verzioniranje)
    - 18.1. Smjernice za razvoj — API verzioniranje i strategija migracije

---

## 1. Pravna osnova

| Uredba | Predmet | Ključni članci za implementaciju |
|--------|---------|----------------------------------|
| **Uredba (EU) 2020/1056** | Bazna eFTI uredba — uspostavlja pravni okvir za elektroničke informacije o prijevozu tereta | Čl. 4(3) — UIL, Čl. 9(1)(e) — jedinstvena identifikacijska poveznica |
| **Provedbena uredba (EU) 2024/1942** | Tehničke specifikacije ICT komponenti eFTI okruženja | Čl. 1–11, Prilog I |
| **Delegirana uredba (EU) 2024/2024** | Zajednički skup podataka, podskupovi, kodne liste | eFTI1451 (DG indikator), kodne liste |

### 1.1. Smjernice za razvoj — EU referentni resursi

| Resurs | URL / referenca | Namjena za developera |
|--------|-----------------|----------------------|
| **EUR-Lex — Uredba 2024/1942** | `https://eur-lex.europa.eu/eli/reg_impl/2024/1942/oj` | Izvorni tekst tehničkih specifikacija ICT komponenti — XML sheme u Prilogu I |
| **EUR-Lex — Delegirana 2024/2024** | `https://eur-lex.europa.eu/eli/reg_del/2024/2024/oj` | Zajednički skup podataka — definicija svih eFTI elemenata i kodnih lista |
| **EC Digital Building Blocks** | `https://ec.europa.eu/digital-building-blocks/sites/display/DIGITAL/eDelivery` | eDelivery specifikacije, Domibus AP, SML/SMP softver |
| **Domibus source code** | `https://ec.europa.eu/digital-building-blocks/code/projects/EDELIVERY/repos/domibus/` | Referentna implementacija AS4 Access Pointa (EUPL licencija) |
| **eDelivery AS4 specifikacije** | `https://ec.europa.eu/digital-building-blocks/sites/spaces/DIGITAL/pages/887379945/eDelivery+Specifications` | OASIS ebMS3/AS4 profil, PMode sheme, envelope sheme |
| **PEPPOL SML/SMP** | `https://peppol.org/documentation/` | Referentna implementacija SML/SMP mehanizma (isti princip koristi eFTI) |
| **CEF eDelivery testno okruženje** | `sml.acc.edelivery.tech.ec.europa.eu` | Acceptance SML za testiranje dinamičkog otkrivanja |
| **eFTI DTLF radna grupa** | `https://transport.ec.europa.eu/transport-themes/digitalisation/electronic-freight-transport-information_en` | DTLF (Digital Transport and Logistics Forum) materijali i pilot projekti |

**Preporuka za razvojni tim:**
- Preuzeti Prilog I iz Uredbe 2024/1942 — sadrži **XML Schema Definition (XSD)** za eFTI poruke
- Preuzeti kodne liste iz Delegirane uredbe 2024/2024 — potrebne za validaciju (`ADR razredi`, `UN brojevi`, `tunnel restriction`, `transport kategorije`)
- Pratiti DTLF radnu grupu za pilot implementacije i pojašnjenja

---

## 2. Pet obveznih ICT komponenti

Prema **Čl. 2(3) Uredbe 2024/1942**, svaka država članica mora uspostaviti sljedećih pet ICT komponenti:

```
┌─────────────────────────────────────────────────────────┐
│                   DRŽAVA ČLANICA (HR)                   │
│                                                         │
│  ┌─────────────────┐   ┌──────────────────────────┐    │
│  │ (e) User        │   │ (b) Authorisation         │    │
│  │    Application  │   │     Registry              │    │
│  │    (Čl. 7)      │   │     (Čl. 5)               │    │
│  └───────┬─────────┘   └────────────┬───────────────┘   │
│          │                          │                    │
│  ┌───────▼──────────────────────────▼───────────────┐   │
│  │ (a) Authority Access Point — AAP (Čl. 4)         │   │
│  └───────────────────────┬──────────────────────────┘   │
│                          │                               │
│  ┌───────────────────────▼──────────────────────────┐   │
│  │ (c) eFTI Gate (Čl. 6)                            │   │
│  │     ┌────────────────────────────────────┐       │   │
│  │     │ (d) Search Mechanism (Čl. 8)       │       │   │
│  │     │     + Registry of Identifiers RoI  │       │   │
│  │     │       (Čl. 11)                     │       │   │
│  │     └────────────────────────────────────┘       │   │
│  └──────────┬───────────────────────┬───────────────┘   │
│             │                       │                    │
└─────────────┼───────────────────────┼────────────────────┘
              │                       │
     Gate-to-Gate              Gate-to-Platform
     (Čl. 9(2))               (Čl. 9(3)/(4))
     eDelivery AS4             eDelivery AS4
     Static discovery          Dynamic discovery
              │                       │
      ┌───────▼────────┐     ┌───────▼────────┐
      │ Drugi eFTI      │     │ eFTI platforma │
      │ Gate (EU MS)    │     │ (certificirana)│
      └─────────────────┘     └────────────────┘
```

### 2.1. (a) Authority Access Point — AAP (Čl. 4)

**Definicija (Čl. 1(1)):** Točka pristupa koju uspostavlja svaka država članica za ovlaštena nadležna tijela.

**Funkcije (Čl. 4(2)):**
- Autentificira ovlaštene službenike
- Autorizira zahtjeve (provjerava prava pristupa u Authorisation Registry)
- Evidentira zahtjeve i odgovore
- Prenosi zahtjeve na eFTI Gate **iste države članice** (Čl. 4(3))
- Prima odgovore od Gatea i prosljeđuje službeniku
- Vodi revizijski trag — **minimalno 2 godine čuvanja** (Čl. 4(2)(f))
- Podržava naknadnu komunikaciju (follow-up)

#### 2.1.1. Smjernice za razvoj — AAP komponenta

**EU referentna arhitektura:**
AAP nema gotovu EU referentnu implementaciju — svaka država članica razvija vlastiti prema funkcionalnim zahtjevima iz Uredbe 2024/1942. Obrasci su poznati iz sličnih EU sustava (eIDAS, PEPPOL Authority).

**Primjeri implementacija u državama članicama:**

| Država | Pristup | Tehnologija | Napomena |
|--------|---------|------------|----------|
| **Belgija** (FPS Mobility) | Java/Spring ekosustav | Spring Boot + Keycloak + PostgreSQL | Pilot partner u FEDeRATED projektu, koristi eDelivery AS4 |
| **Nizozemska** (Logius/RDW) | .NET ekosustav | .NET 6+ / Azure stack | Koristi nacionalni eIDAS čvor za autentikaciju, centralizirani RDW registar |
| **Finska** (Traficom) | Hybrid | Java backend + React frontend | Aktivni sudionik u eFTI specifikaciji, koristi Suomi.fi eIDAS Identity Provider |
| **Njemačka** (BAG / BALM) | Java/Microservices | Spring Boot + Keycloak + Kafka | BAG (sada BALM) razvija vlastiti sustav za kontrolu cestovnog prijevoza |
| **Italija** (MIT) | Java | Custom Java stack | Sudjeluje u FENIX/FEDeRATED pilot projektima |

**Moguće tehnologije za implementaciju (savjet — nije projektna odluka):**

```
AAP Service Stack — opcije:
├── Runtime (odabrati jedno):
│   ├── Opcija A: Java 17+ / Spring Boot 3.x  ← najveća kompatibilnost s Domibusom (također Java)
│   └── Opcija B: .NET 8+                     ← praksa NL, manja eFTI zajednica ali solidna platforma
├── Autentikacija:
│   ├── NIAS (HR nacionalni eIDAS) → SAML 2.0 / OAuth 2.0 OIDC — obavezno za HR
│   └── IdP broker: Keycloak (open-source, široko korišten u EU javnom sektoru)
│       ili: WSO2 Identity Server, Shibboleth (SAML-fokusiran)
├── Autorizacija:
│   └── RBAC lookup prema Authorisation Registry (obavezno per Uredba)
├── API:  RESTful (OpenAPI 3.0) + SOAP/WS za AS4 integraciju
├── Audit storage (obavezni zahtjev: append-only, min. 2 godine retencija):
│   ├── Opcija A: PostgreSQL 15+ s nativnim particioniranjem po mjesecu
│   ├── Opcija B: PostgreSQL + TimescaleDB ekstenzija (hypertable, ugrađena retencija)
│   └── Opcija C: Oracle 19c+ s particioniranjem (ako postojeća licenca)
├── Cache:
│   ├── Redis (najčešće u EU pilot projektima)
│   └── ili Hazelcast / Infinispan (ako se preferira JVM-nativno)
├── Message broker (za asinkrone audit evente):
│   ├── Apache Kafka (široko korišten: DE ATLAS carinski sustav, FI Traficom)
│   └── RabbitMQ (jednostavniji, dovoljan za HR obujam ~20 RPS)
└── Monitoring:
    └── Prometheus + Grafana (de facto standard u EU javnom sektoru)
```

> **Obrazloženje za Java/Spring Boot kao primarnu preporuku:** Domibus (EU referentna
> AS4 implementacija) je napisana u Javi na Tomcat/Spring osnovi. Korištenje istog
> ekosustava minimizira integracijsku složenost (zajedničke biblioteke, WS plugin,
> isti deployment model). Većina EU pilota (BE, FI, DE, IT) koristi Java ekosustav.

**Ključni API endpointi za implementaciju:**

```
POST   /api/v1/aap/requests              — Kreiranje novog zahtjeva za eFTI podatke
GET    /api/v1/aap/requests/{id}          — Status zahtjeva
GET    /api/v1/aap/requests/{id}/response — Dohvat odgovora (eFTI podaci)
POST   /api/v1/aap/follow-up/{id}         — Naknadna komunikacija
GET    /api/v1/aap/audit-log              — Pregled revizijskog traga (ROLE_AUDITOR)
GET    /api/v1/aap/archive/{dateRange}    — Pristup arhivu odgovora (min. 2 god.)
```

> **⚠️ EU zahtjev vs. tehnološki odabir:** Uredba 2024/1942 (Čl. 6(2)(e)) propisuje
> **funkcionalni zahtjev** — imutabilni revizijski trag s retencijom min. 2 godine. EU **NE
> propisuje** konkretnu tehnologiju baze podataka. U nastavku su prikazane opcije
> s primjerima implementacije.

**Opcije za audit storage:**

| Opcija | Tehnologija | Prednosti | Nedostaci | Tko koristi |
|--------|------------|-----------|-----------|-------------|
| A | **PostgreSQL 15+** native partitioning | Nema dodatnih ekstenzija, široka ekspertiza | Ručno upravljanje particijama, nema ugrađene retencije | Većina EU javnog sektora |
| B | **PostgreSQL + TimescaleDB** | Automatska retencija (`add_retention_policy`), kompresija, hypertable | Dodatna ekstenzija, manja zajednica | IoT/time-series projekti u EU (EEA, Copernicus) |
| C | **Oracle 19c+** partitioning | Enterprise podrška, zrele partition politike | Skupa licenca, vendor lock-in | Talijanski carinski sustav (AIDA), stariji EU sustavi |
| D | **MS SQL Server** | Windows ekosustav, particioniranje | Manja zastupljenost u EU open-source projektima | Pojedini NL/UK sustavi |

**Primjer audit log sheme (PostgreSQL + TimescaleDB opcija):**

> Napomena: Donji primjer koristi TimescaleDB sintaksu. Za čisti PostgreSQL, zamijeniti
> `create_hypertable()` s `PARTITION BY RANGE (timestamp)` i ručno kreirati mjesečne particije.

```sql
CREATE TABLE aap_audit_log (
    id              BIGSERIAL,
    timestamp       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    request_id      UUID          NOT NULL,
    officer_id      VARCHAR(64)   NOT NULL,  -- pseudonimizirani ID službenika
    authority_code  VARCHAR(16)   NOT NULL,  -- MUP, DI, CARINA, MUP_RCZ, CVH
    action          VARCHAR(32)   NOT NULL,  -- REQUEST, RESPONSE, FOLLOW_UP, ERROR
    uil             VARCHAR(256),
    identifiers     JSONB,                   -- reg. oznaka, UN broj, itd.
    data_subsets    VARCHAR(128)[],          -- traženi podskupovi podataka
    result_code     VARCHAR(16)   NOT NULL,  -- SUCCESS, NO_DATA, TIMEOUT, ERROR
    response_time_ms INTEGER,
    source_gate     VARCHAR(64),             -- gate koji je odgovorio
    payload_hash    VARCHAR(128),            -- SHA-256 hash odgovora (integritet)
    PRIMARY KEY (id, timestamp)
);
SELECT create_hypertable('aap_audit_log', 'timestamp', chunk_time_interval => INTERVAL '1 month');
CREATE INDEX idx_aap_audit_officer ON aap_audit_log (officer_id, timestamp DESC);
CREATE INDEX idx_aap_audit_request ON aap_audit_log (request_id);
```

**Retencijska politika [EU ZAHTJEV]:** Minimalno `2 godine` (Čl. 4(2)(f) Uredbe 2024/1942).

**Moguće implementacije retencije:**

| Pristup | Implementacija | Kompleksnost |
|---------|---------------|--------------|
| TimescaleDB | `SELECT add_retention_policy('aap_audit_log', INTERVAL '3 years');` | Niska — jedna naredba |
| PostgreSQL native | `PARTITION BY RANGE (timestamp)` + `pg_cron` job za DROP starih particija | Srednja — potreban cron |
| Application-level | Scheduled Spring `@Scheduled` job koji briše zapise starije od 2 god. | Visoka — riskantniji pristup |

**Performanse:**
- p50 latencija AAP → Gate: ≤20ms (lokalni poziv)
- Concurrent sessions: ~20 (projekcija za HR)
- Burst: 20 RPS / 15 min

### 2.2. (b) Authorisation Registry — Registar ovlaštenja (Čl. 5)

**Funkcije:**
- Definira prava pristupa po službeniku (koji podskupovi podataka, za koje vrste prijevoza)
- Definira prava obrade za svaki zahtjev
- AAP konzultira registar pri svakoj autorizaciji

#### 2.2.1. Smjernice za razvoj — Authorisation Registry

**Implementacijski pristup:**
Authorisation Registry implementira se kao **RBAC (Role-Based Access Control)** modul s granularnim ovlastima po podskupu podataka. EU uredba propisuje da svaka država mora imati registar ovlaštenja, ali ne specificira tehnologiju.

**Primjeri iz EU država članica:**
- **Belgija (FPS):** Koristi centralizirani RBAC unutar FPS IT sustava, mapiran na belgijski eID
- **Nizozemska (Logius):** Integracija s nacionalnim Machtigingenregister (Registar ovlaštenja), koristi .NET + Azure AD
- **Finska:** Koristi Suomi.fi mandatnu uslugu (Valtuudet) za delegiranje ovlaštenja
- **Njemačka (BALM):** Vlastiti RBAC modul, Keycloak kao IdP broker prema BundID

**Moguće tehnologije za IdP broker:**
- **Keycloak** (open-source, CNCF ekosustav) — koristi DE (BALM), BE za pilote; široka zajednica
- **WSO2 Identity Server** (open-source) — koristi se u nekim EU agencijama
- **Shibboleth** (SAML-fokusiran) — akademski sektor, GEANT federacije
- **Azure AD B2C** — ako je cloud dopustiv (NL pristup)

**Podatkovni model (primjer — prilagoditi prema odabranoj tehnologiji):**

```sql
-- Nadležna tijela
CREATE TABLE authority (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(16) UNIQUE NOT NULL,  -- MUP, DI, CARINA, MUP_RCZ, CVH, MMPI
    name        VARCHAR(256) NOT NULL,
    active      BOOLEAN DEFAULT TRUE
);

-- Službenici (referenca na NIAS)
CREATE TABLE officer (
    id              SERIAL PRIMARY KEY,
    nias_subject_id VARCHAR(128) UNIQUE NOT NULL,  -- NIAS korisničko ime / subject
    authority_id    INTEGER REFERENCES authority(id),
    role            VARCHAR(64) NOT NULL,  -- ROLE_INSPECTOR, ROLE_SUPERVISOR, ROLE_ADMIN...
    active          BOOLEAN DEFAULT TRUE,
    valid_from      DATE NOT NULL,
    valid_until     DATE
);

-- Prava pristupa po ulozi
CREATE TABLE access_right (
    id              SERIAL PRIMARY KEY,
    role            VARCHAR(64)   NOT NULL,
    data_subset     VARCHAR(128)  NOT NULL,  -- DG_FULL, DG_SUMMARY, TRANSPORT, CONSIGNMENT...
    transport_mode  VARCHAR(32),             -- ROAD, RAIL, INLAND_WATERWAY, ALL
    operations      VARCHAR(32)[] NOT NULL,  -- {READ, SEARCH, FOLLOW_UP}
    max_concurrent  INTEGER DEFAULT 10,
    rate_limit_rpm  INTEGER DEFAULT 60        -- requests per minute
);

-- Autorizacijski cache pattern
-- Redis key: auth:{officer_nias_id} → TTL 5min
-- Value: JSON {role, authority, access_rights[], valid_until}
```

**Integracija s NIAS (HR-specifično):**
- NIAS vraća SAML Assertion / OIDC token s `claims` (ime, OIB, institucija)
- IdP broker (npr. Keycloak) mapira NIAS claims na eADR RBAC uloge
- Authorisation Registry provjerava granularne ovlasti za svaki zahtjev

> **Napomena:** Svaka EU država ima vlastiti eIDAS čvor (BE: CSAM, NL: DigiD/eHerkenning,
> FI: Suomi.fi, DE: BundID). HR koristi NIAS. Arhitektura RBAC modula trebala bi biti
> apstrahirana od konkretnog IdP-a tako da mapiranje claims → uloge bude konfigurabilan sloj.

**Prikaz RBAC uloga:**

| Uloga | Podskupovi | Operacije |
|-------|-----------|----------|
| `ROLE_INSPECTOR` | DG_FULL, TRANSPORT, CONSIGNMENT | READ, SEARCH, FOLLOW_UP |
| `ROLE_SUPERVISOR` | Sve od INSPECTOR + AUDIT_LOG | READ, SEARCH, FOLLOW_UP, APPROVE |
| `ROLE_ADMIN` | Sve | Sve uključujući USER_MGMT |
| `ROLE_SYSTEM` | Sve (servisni) | Sve (M2M) |
| `ROLE_AUDITOR` | AUDIT_LOG | READ |

### 2.3. (c) eFTI Gate (Čl. 6)

**Definicija (Čl. 1(2)):** Informatička komponenta koja omogućuje razmjenu eFTI informacija između ICT sustava nadležnih tijela i eFTI platformi.

**Funkcije (Čl. 6(2)):**
- Validira dolazne zahtjeve
- Obrađuje zahtjeve putem Search Mechanisma
- Usmjerava zahtjeve prema:
  - **lokalnoj platformi** (ako je platforma spojena na taj Gate), ili
  - **drugom eFTI Gateu** (Čl. 6(4)) — ako je platforma spojena na Gate druge države
- Vodi revizijski trag — **minimalno 2 godine** (Čl. 6(2)(e))
- Podržava naknadnu komunikaciju

**KLJUČNO PRAVILO (Uvodna izjava 8):**
> eFTI Gate **NE SMIJE pohranjivati eFTI podatke**. Gate pohranjuje samo metapodatke,
> identifikatore i logove. Podaci ostaju isključivo na eFTI platformi.

#### 2.3.1. Smjernice za razvoj — eFTI Gate (Domibus referentna implementacija)

**EU referentna implementacija: Domibus**

Europska komisija razvija i održava **Domibus** — open-source implementaciju eDelivery AS4 Access Pointa. Ovo je **preporučena osnova** za izgradnju HR eFTI Gate-a.

| Parametar | Vrijednost |
|-----------|------------|
| **Softver** | Domibus v5.1.x (aktualna stabilna verzija, ožujak 2023+) |
| **Licencija** | EUPL (European Union Public Licence) — slobodna za korištenje |
| **Runtime** | Java 8+ (OpenJDK 11 preporučen) |
| **App server** | Apache Tomcat 9.x (**preporučen**), WildFly 26.x, WebLogic 12.2.x |
| **Baza podataka** | MySQL 8 ili Oracle 19c |
| **Message broker** | Apache ActiveMQ (embedded ili external) |
| **Izvorni kod** | `https://ec.europa.eu/digital-building-blocks/code/projects/EDELIVERY/repos/domibus/` |
| **Dokumentacija** | Admin Guide, Quick Start, Testing Guide, Plugin Cookbook, SAD |
| **Download** | `https://ec.europa.eu/digital-building-blocks/artifact/repository/eDelivery/eu/domibus/domibus-msh-distribution/5.1/` |

**Domibus arhitektura — ključne komponente:**

```
┌──────────────────────────────────────────────────────────────────┐
│                    DOMIBUS ACCESS POINT                          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐    │
│  │ WS Plugin    │  │ JMS Plugin   │  │ FS Plugin           │    │
│  │ (SOAP/REST)  │  │ (ActiveMQ)   │  │ (File System)       │    │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬──────────┘    │
│         └─────────────────┼─────────────────────┘               │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │              Domibus MSH (Message Service Handler)       │    │
│  │                                                          │    │
│  │  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌───────────────┐  │    │
│  │  │ PMode   │ │ Security │ │ Retry  │ │ Reliability   │  │    │
│  │  │ Manager │ │ (mTLS,   │ │ Engine │ │ (receipts,    │  │    │
│  │  │         │ │  WS-Sec) │ │        │ │  dedup)       │  │    │
│  │  └─────────┘ └──────────┘ └────────┘ └───────────────┘  │    │
│  │  ┌────────────┐ ┌────────────┐ ┌──────────────────────┐ │    │
│  │  │ Routing    │ │ eArchiving │ │ Connection Monitor   │ │    │
│  │  │ (PMode     │ │ (audit,    │ │ (health check,      │ │    │
│  │  │  based)    │ │  retention)│ │  smart retry)        │ │    │
│  │  └────────────┘ └────────────┘ └──────────────────────┘ │    │
│  └──────────────────────────────────────────────────────────┘    │
│                           │                                      │
│  ┌────────────────────────▼────────────────────────────────┐     │
│  │         AS4 / ebMS3 Transport Layer                      │    │
│  │         (OASIS ebMS3 + AS4 profil)                       │    │
│  └──────────────────────────────────────────────────────────┘    │
│                           │                                      │
│  ┌────────────────────────▼────────────────────────────────┐     │
│  │         HTTP/TLS (mTLS)                                 │     │
│  └─────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

**PMode konfiguracija — eFTI specifična:**

PMode (Processing Mode) definira pravila razmjene poruka. Za eFTI Gate-to-Gate:

```xml
<!-- Primjer PMode konfiguracije za eFTI Gate-to-Gate -->
<configuration xmlns="http://domibus.eu/configuration" party="HR_EFTI_GATE">
  <businessProcesses>
    <parties>
      <partyIdTypes>
        <partyIdType name="eFTIGateId" value="urn:oasis:names:tc:ebcore:partyid-type:efti:gateid"/>
      </partyIdTypes>
      <party name="HR_GATE" endpoint="https://efti-gate.hr/domibus/services/msh">
        <identifier partyId="HR-GATE-01" partyIdType="eFTIGateId"/>
      </party>
      <party name="DE_GATE" endpoint="https://efti-gate.bund.de/domibus/services/msh">
        <identifier partyId="DE-GATE-01" partyIdType="eFTIGateId"/>
      </party>
      <!-- ... ostale države ...  -->
    </parties>
    <meps>
      <mep name="oneway" value="http://docs.oasis-open.org/ebxml-msg/ebms/v3.0/ns/core/200704/oneWay"/>
      <mep name="twoway" value="http://docs.oasis-open.org/ebxml-msg/ebms/v3.0/ns/core/200704/twoWay"/>
      <binding name="push" value="http://docs.oasis-open.org/ebxml-msg/ebms/v3.0/ns/core/200704/push"/>
    </meps>
    <properties>
      <property name="originalSender" key="originalSender" datatype="string" required="true"/>
      <property name="finalRecipient" key="finalRecipient" datatype="string" required="true"/>
    </properties>
    <process name="eFTI-DataAccess"
             mep="twoway" binding="push"
             initiatorRole="urn:efti:role:requesting-gate"
             responderRole="urn:efti:role:responding-gate">
      <initiatorParties><initiatorParty name="HR_GATE"/></initiatorParties>
      <responderParties><responderParty name="DE_GATE"/></responderParties>
      <legs>
        <leg name="eFTI-DataRequest"
             service="urn:efti:services:data-access" action="DataRequest"
             defaultMpc="http://docs.oasis-open.org/ebxml-msg/ebms/v3.0/ns/core/200704/defaultMPC"
             reliability="AS4Reliability" security="eFTISignAndEncrypt"/>
      </legs>
    </process>
  </businessProcesses>
</configuration>
```

**Domibus deployment za produkciju:**

```
Produkcijski setup (preporuka za HR eFTI Gate):
├── 2× Tomcat instance (cluster, active-active za HA)
├── Apache ActiveMQ (master-slave za message persistence)
├── MySQL 8 (InnoDB, partitioning po datumu za retenciju)
├── Nginx reverse proxy (TLS termination + load balancing)
├── HSM CC EAL4+ (privatni ključevi za mTLS i WS-Security)
└── Monitoring: Domibus Admin Console + Prometheus/Grafana

Minimalni HW zahtjevi (produkcija):
├── CPU:    4 vCPU (8 preporučeno)
├── RAM:    8 GB (16 GB preporučeno)
├── Disk:   100 GB SSD (za logove, aktivne poruke, ActiveMQ journal)
└── Mreža:  1 Gbps, statička IP, otvoreni portovi 443 (mTLS)
```

**Ključne Domibus konfiguracije za eFTI:**

```properties
# domibus.properties — eFTI specifične postavke

# MSH konfiguracija
domibus.msh.retry.cron=0/30 * * * * ?       # Retry svakih 30s
domibus.msh.retry.timeout=60000              # eFTI timeout 60s (Čl. 8(5))
domibus.dynamicdiscovery.useDynamicDiscovery=true  # Za Gate-to-Platform

# SML/SMP za dinamičko otkrivanje
domibus.smlzone=efti.sml.europa.eu           # eFTI SML zona (kad bude dostupna)
domibus.dynamicdiscovery.oasisclient.regexCertificateSubjectValidation=.*

# Retencija (min. 2 godine za eFTI audit)
domibus.retentionWorker.message.retention.downloaded.max.delete=50000
domibus.retentionWorker.message.retention.not_downloaded.max.delete=50000
domibus.message.retention.downloaded=730      # 730 dana = 2 godine
domibus.message.retention.undownloaded=730
domibus.message.retention.metadata.offset=0   # Zadrži metadata trajno

# Sigurnost
domibus.security.keystore.type=PKCS12
domibus.security.keystore.location=${domibus.config.location}/keystores/hr-gate-keystore.p12
domibus.security.truststore.type=PKCS12
domibus.security.truststore.location=${domibus.config.location}/keystores/hr-gate-truststore.p12
```

### 2.4. (d) Search Mechanism + Registry of Identifiers — RoI (Čl. 8, 11)

**Search Mechanism (Čl. 8):**
- Integriran u svaki eFTI Gate (Čl. 8(1))
- Prima obrađene zahtjeve od Gatea
- Upravlja **Registrom identifikatora (RoI)**
- Određuje je li UIL u lokalnom RoI ili ga treba proslijediti:
  - **Lokalni RoI** (Čl. 8(3)) → identificira platformu → usmjerava zahtjev
  - **Nije u lokalnom RoI** (Čl. 8(4)) → prosljeđuje na **sve ostale Gateove**
- **Timeout: 60 sekundi** — ako nema odgovora, vraća "no information available" (Čl. 8(5))
- Ako je zahtjev temeljen na identifikatorima (a ne UIL-u) → pretražuje vlastiti RoI, zatim RoI drugih Gateova (Čl. 8(6))

**Registry of Identifiers — RoI (Čl. 11):**
- RoI je integriran u svaki eFTI Gate (Čl. 11(1))
- **eFTI platforma uploadira** u RoI svog matičnog Gatea:
  - **UIL** (Čl. 11(2)): `gate_identifier + platform_identifier + UUID`
  - **Identifikatori** (Čl. 11(3)): pridruženi UIL-u, uključujući **eFTI1451** — indikator opasnih tvari (iz Delegirane uredbe 2024/2024)
- **Životni ciklus UIL-a (Čl. 11(4)–(6)):**
  1. **Upload** — platforma uploadira UIL i identifikatore
  2. **Aktivacija** — platforma aktivira UIL kad su podaci dostupni
  3. **Deaktivacija** — platforma deaktivira UIL (podaci više nisu dostupni za nove upite)
  4. **Brisanje** — platforma briše UIL iz RoI
- Gate validira sve uploadove (Čl. 11(5))

#### 2.4.1. Smjernice za razvoj — Search Mechanism i RoI

**Podatkovni model RoI (PostgreSQL):**

```sql
-- Registry of Identifiers — središnja tablica za UIL i identifikatore
CREATE TABLE roi_entry (
    id                  BIGSERIAL PRIMARY KEY,
    uil                 VARCHAR(512) UNIQUE NOT NULL,
    gate_identifier     VARCHAR(64)  NOT NULL,     -- npr. HR-GATE-01
    platform_identifier VARCHAR(64)  NOT NULL,     -- npr. HR-PLAT-0001
    uuid                UUID         NOT NULL,
    status              VARCHAR(16)  NOT NULL DEFAULT 'UPLOADED',  -- UPLOADED, ACTIVE, DEACTIVATED, DELETED
    efti1451_dg         BOOLEAN      NOT NULL DEFAULT FALSE,       -- DG indikator!
    uploaded_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    activated_at        TIMESTAMPTZ,
    deactivated_at      TIMESTAMPTZ,
    deleted_at          TIMESTAMPTZ,
    platform_version    INTEGER      DEFAULT 1,
    CONSTRAINT chk_status CHECK (status IN ('UPLOADED','ACTIVE','DEACTIVATED','DELETED'))
);

-- Identifikatori pridruženi UIL-u (1:N)
CREATE TABLE roi_identifier (
    id              BIGSERIAL PRIMARY KEY,
    roi_entry_id    BIGINT REFERENCES roi_entry(id) ON DELETE CASCADE,
    identifier_type VARCHAR(64)  NOT NULL,  -- VEHICLE_REG, CARRIER_ID, CONSIGNMENT_ID, UN_NUMBER...
    identifier_value VARCHAR(256) NOT NULL,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Indeksi za brzu pretragu (Search Mechanism)
CREATE INDEX idx_roi_uil         ON roi_entry (uil) WHERE status = 'ACTIVE';
CREATE INDEX idx_roi_gate        ON roi_entry (gate_identifier);
CREATE INDEX idx_roi_platform    ON roi_entry (platform_identifier);
CREATE INDEX idx_roi_dg          ON roi_entry (efti1451_dg) WHERE efti1451_dg = TRUE AND status = 'ACTIVE';
CREATE INDEX idx_roi_status      ON roi_entry (status, activated_at DESC);
CREATE INDEX idx_roi_ident_type  ON roi_identifier (identifier_type, identifier_value);
CREATE INDEX idx_roi_ident_value ON roi_identifier (identifier_value);  -- za pretragu po reg. oznaci
```

**Search Mechanism — algoritam pretrage:**

```python
# Pseudokod za Search Mechanism (Čl. 8)

def search_by_uil(uil: str, timeout_sec: int = 60) -> SearchResult:
    """Procedura A — pretraga po UIL-u"""
    # 1. Provjeri lokalni RoI
    local = roi_db.query("SELECT * FROM roi_entry WHERE uil = %s AND status = 'ACTIVE'", uil)
    if local:
        platform = resolve_platform(local.platform_identifier)
        return forward_to_platform(platform, uil)
    
    # 2. UIL nije lokalni → proslijedi na SVE ostale Gateove (Čl. 8(4))
    futures = []
    for gate in get_all_remote_gates():
        futures.append(async_send_gate_to_gate(gate, uil))
    
    # 3. Čekaj odgovore s timeoutom 60s (Čl. 8(5))
    results = await_all(futures, timeout=timeout_sec)
    
    if any(r.found for r in results):
        return merge_results(results)
    else:
        return SearchResult(status='NO_INFORMATION_AVAILABLE')


def search_by_identifiers(identifiers: dict, timeout_sec: int = 60) -> SearchResult:
    """Procedura B — pretraga po identifikatorima (Čl. 8(6))"""
    # 1. Pretraži lokalni RoI po identifikatorima
    local_uils = roi_db.query("""
        SELECT DISTINCT re.uil FROM roi_entry re
        JOIN roi_identifier ri ON ri.roi_entry_id = re.id
        WHERE ri.identifier_type = %s AND ri.identifier_value = %s
        AND re.status = 'ACTIVE'
    """, identifiers['type'], identifiers['value'])
    
    # 2. Proslijedi na ostale Gateove
    remote_results = broadcast_search_to_gates(identifiers, timeout_sec)
    
    # 3. Spoji rezultate
    all_uils = local_uils + remote_results
    return fetch_data_for_uils(all_uils)
```

**Performansni zahtjevi za RoI:**

| Metrika | Zahtjev |
|---------|--------|
| RoI lookup (lokalni, po UIL-u) | ≤10ms p99 |
| RoI lookup (lokalni, po identifikatoru) | ≤50ms p99 |
| Gate-to-Gate broadcast + response | ≤60s (hard limit, Čl. 8(5)) |
| RoI insert (UIL upload) | ≤20ms p99 |
| RoI kapacitet (projekcija 5 god.) | ~5M zapisa (za HR platforme) |

### 2.5. (e) User Application — Korisnička aplikacija (Čl. 7)

**Funkcije:**
- Grafičko sučelje za ovlaštene službenike
- Generira zahtjeve prema AAP-u
- Prikazuje rezultate provjera

#### 2.5.1. Smjernice za razvoj — User Application

**Tehnološke opcije (savjet — nije projektna odluka):**

```
User Application Stack — opcije:
├── Web frontend (odabrati jedno):
│   ├── React 18+ (TypeScript)   ← široka zajednica, koristi BE FPS, FI Traficom pilote
│   ├── Angular 17+ (TypeScript) ← koristi DE (BALM), strukturiraniji za enterprise
│   └── Vue 3+                   ← koriste neki FR/ES javni servisi, manja eFTI zajednica
├── Mobile (odabrati jedno):
│   ├── React Native             ← dijeli znanje s React webom
│   ├── Flutter                  ← bolje performanse, koristi IT za neke mobilne gov. app
│   └── PWA (Progressive Web App) ← najjednostavniji, radi na svim platformama bez app storea
├── Dizajn sustav:  GOV.HR usmjerenja (WCAG 2.1 AA pristupačnost) — obavezno per HR propisi
├── Autentikacija:  NIAS SSO (redirect na NIAS login → OAuth2 token) — obavezno za HR
├── Komunikacija:   REST API prema AAP backendu (JSON)
├── QR/Barcode:     Kamera skeniranje UIL kodova (Procedura A)
└── Offline mode:   Service Worker + IndexedDB za bazni rad bez mreže
```

**Primjeri iz EU država:**
- **Belgijska FPS** aplikacija za inspektore: React + REST prema nacionalnom AAP-u
- **Finska Traficom** mobilna inspektorska aplikacija: PWA pristup (preglednički baziran)
- **Njemački BAG/BALM** kontrolni sustav: Angular enterprise SPA s offline mogućnostima
- **Nizozemski ILT** inspektorski alat: .NET frontend, integriranm s RDW registrima

**Ključne UI komponente za implementaciju:**

| Komponenta | Opis | Prioritet |
|-----------|------|-----------|
| **Dashboard inspektora** | Pregled aktivnih nadzora, upozorenja, statistika | P1 |
| **Pretraga vozila/vozača** | Input za reg. oznaku/OIB → instant pretraga registara | P1 |
| **UIL skener** | Kamera-based QR/barcode skener za Proceduru A | P2 |
| **eFTI pregled** | Prikaz DG dataseta s cross-validacijom | P2 |
| **Nadzorni zapisnik** | Formular za unošenje ishoda nadzora i mjera | P1 |
| **Registar ADR potvrda** | CRUD + životni ciklus potvrda osposobljenosti | P1 |
| **Registar dopuštenja** | CRUD + cross-validacija s potvrdama/vozilima | P1 |
| **Audit pregled** | Read-only tablo revizijskog traga (ROLE_AUDITOR) | P2 |
| **Admin panel** | Upravljanje korisnicima, ulogama, konfiguracijom | P1 |

**Mobilna aplikacija — dodatni zahtjevi:**

```
Mobilni zahtjevi za terenske inspektore:
├── OS:             Android 10+ / iOS 15+
├── Kamera:         Za QR/barcode skeniranje UIL-a
├── GPS/PostGIS:    Automatsko bilježenje lokacije nadzora
├── Offline sync:   Kesiraj registre lokalno (SQLite), sync kad postoji veza
├── Biometrics:     Fingerprint/FaceID za brzi re-login
└── Push notif.:    Upozorenja o isteku ADR potvrda, dopuštenja
```

---

## 3. KRITIČNO PRAVILO: Platforma → JEDAN Gate (matični Gate)

> **Uvodna izjava 9, Uredba 2024/1942:**
> "Each eFTI platform should connect to ONE eFTI gate only."
>
> **Uvodna izjava 10:**
> Platforma se spaja na Gate **države članice u kojoj joj je izdana certifikacija**.

### Što to znači za implementaciju:

```
ISPRAVNO:
  DE platforma → certificirana u DE → spaja se na DE Gate
  DE platforma uploadira UIL u RoI → DE Gate RoI
  HR tijelo želi pristup → HR Gate → Gate-to-Gate → DE Gate → DE platforma

NEISPRAVNO (❌):
  DE platforma pushuje metapodatke u AT Gate, SI Gate, HR Gate
  (platforma NE komunicira s Gateovima drugih država!)
```

**Prekogranični pristup ostvaruje se isključivo kroz Gate-to-Gate mrežu:**
1. HR službenik → HR AAP → HR Gate
2. HR Gate Search Mechanism: UIL nije u HR RoI → prosljeđuje zahtjev na sve Gateove
3. DE Gate ima UIL u svom RoI → usmjerava zahtjev na DE platformu
4. DE platforma vraća podatke → DE Gate → HR Gate → HR AAP → službenik

### 3.1. Smjernice za razvoj — Gate routing konfiguracija

**Routing tablica (statička, za Gate-to-Gate):**

U Domibus-u ovo se konfigurira kroz PMode XML. Za operativne potrebe, održavati i internu tablicu:

```sql
CREATE TABLE gate_registry (
    id              SERIAL PRIMARY KEY,
    gate_code       VARCHAR(16) UNIQUE NOT NULL,   -- HR-GATE-01, DE-GATE-01...
    country_iso     CHAR(2)     NOT NULL,           -- HR, DE, AT, SI...
    endpoint_url    VARCHAR(512) NOT NULL,           -- https://efti-gate.bund.de/domibus/services/msh
    cert_alias      VARCHAR(128) NOT NULL,           -- Alias u truststore-u
    cert_expiry     DATE         NOT NULL,           -- Datum isteka certifikata
    status          VARCHAR(16)  DEFAULT 'ACTIVE',   -- ACTIVE, SUSPENDED, DECOMMISSIONED
    last_health_check TIMESTAMPTZ,
    avg_response_ms   INTEGER,                       -- Prosječno vrijeme odgovora
    updated_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- Inicijalni seed (značajni EU partneri za HR)
INSERT INTO gate_registry (gate_code, country_iso, endpoint_url, cert_alias) VALUES
('DE-GATE-01', 'DE', 'https://efti-gate.bund.de/domibus/services/msh', 'de-gate-cert'),
('AT-GATE-01', 'AT', 'https://efti-gate.bmk.gv.at/domibus/services/msh', 'at-gate-cert'),
('SI-GATE-01', 'SI', 'https://efti-gate.gov.si/domibus/services/msh', 'si-gate-cert'),
('IT-GATE-01', 'IT', 'https://efti-gate.mit.gov.it/domibus/services/msh', 'it-gate-cert'),
('HU-GATE-01', 'HU', 'https://efti-gate.nkh.gov.hu/domibus/services/msh', 'hu-gate-cert'),
('FR-GATE-01', 'FR', 'https://efti-gate.douane.gouv.fr/domibus/services/msh', 'fr-gate-cert');
-- ... ostale EU države (27 ukupno)
```

**Implementacija health check-a za Gate-to-Gate konekcije:**

```
Cron: svakih 5 minuta
Za svaki gate u gate_registry WHERE status = 'ACTIVE':
  1. Pošalji Domibus test message (Connection Monitor)
  2. Zabilježi response time i status
  3. Ako 3 consecutive failure → alert (email/Slack/PagerDuty)
  4. Ako cert_expiry < NOW() + 30 dana → upozorenje o isteku certifikata
```

---

## 4. Dvije procedure pristupa eFTI podacima (Čl. 2(1))

### Procedura A — Direktna UIL komunikacija (Čl. 2(1)(a))

Gospodarski subjekt **fizički predočuje UIL** nadležnom tijelu (QR kod, barkod, digitalni display):
```
Vozač predočuje QR → Službenik skenira → AAP → Gate → Platform → podaci
```

### Procedura B — Pretraga po identifikatorima (Čl. 2(1)(b))

Nadležno tijelo koristi Search Mechanism za pretragu po identifikatorima (npr. registarska oznaka, UN broj):
```
Službenik unosi identifikatore → AAP → Gate → Search Mechanism
  → pretražuje lokalni RoI
  → pretražuje RoI drugih Gateova
  → pronalazi UIL → dohvaća podatke s platforme
```

### 4.1. Smjernice za razvoj — API zahtjeva i odgovora

**OpenAPI specifikacija (primjer za Proceduru A i B):**

```yaml
# openapi: 3.0.3 — eFTI Data Access API
paths:
  /api/v1/efti/access/uil:
    post:
      summary: "Procedura A — dohvat po UIL-u"
      description: "Službenik skenira UIL (QR/barcode) i šalje zahtjev"
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [uil, accessRights, requestId]
              properties:
                uil:
                  type: string
                  example: "DE-GATE-01.DE-PLAT-0042.a7b3c9d1-e2f4-4a5b-8c7d-9e0f1a2b3c4d"
                accessRights:
                  type: array
                  items:
                    type: string
                    enum: [DG_FULL, DG_SUMMARY, TRANSPORT, CONSIGNMENT, VEHICLE, DRIVER]
                  example: ["DG_FULL", "TRANSPORT"]
                requestId:
                  type: string
                  format: uuid
      responses:
        200:
          description: "eFTI podaci uspješno dohvaćeni"
        204:
          description: "UIL nije pronađen (no information available)"
        408:
          description: "Timeout (>60s) — Čl. 8(5)"
  /api/v1/efti/access/search:
    post:
      summary: "Procedura B — pretraga po identifikatorima"
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [identifiers, accessRights, requestId]
              properties:
                identifiers:
                  type: object
                  properties:
                    vehicleRegistration:
                      type: string
                      example: "DE-MH-4521"
                    unNumber:
                      type: string
                      example: "1203"
                    carrierId:
                      type: string
                accessRights:
                  type: array
                  items:
                    type: string
                requestId:
                  type: string
                  format: uuid
```

**Primjer XML zahtjeva (AS4 payload za Gate-to-Gate):**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<eFTIDataRequest xmlns="urn:eu:efti:v1:data-access">
  <RequestId>550e8400-e29b-41d4-a716-446655440000</RequestId>
  <RequestingGate>HR-GATE-01</RequestingGate>
  <RequestTimestamp>2026-03-04T10:30:00Z</RequestTimestamp>
  <SearchCriteria>
    <UIL>DE-GATE-01.DE-PLAT-0042.a7b3c9d1-e2f4-4a5b-8c7d-9e0f1a2b3c4d</UIL>
  </SearchCriteria>
  <AccessRights>
    <DataSubset>DG_FULL</DataSubset>
    <DataSubset>TRANSPORT</DataSubset>
  </AccessRights>
  <RequestingAuthority>
    <AuthorityCode>HR-MUP</AuthorityCode>
    <OfficerRef>HR-OFF-2026-00123</OfficerRef>
  </RequestingAuthority>
</eFTIDataRequest>
```

**Primjer XML odgovora:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<eFTIDataResponse xmlns="urn:eu:efti:v1:data-access">
  <RequestId>550e8400-e29b-41d4-a716-446655440000</RequestId>
  <RespondingGate>DE-GATE-01</RespondingGate>
  <ResponseTimestamp>2026-03-04T10:30:02Z</ResponseTimestamp>
  <Status>SUCCESS</Status>
  <Consignment>
    <ConsignmentId>CONSIGNMENT-DE-2026-8834</ConsignmentId>
    <Consignor><Name>ChemieTrans GmbH</Name><City>Hamburg</City><Country>DE</Country></Consignor>
    <Consignee><Name>Petrokemija d.d.</Name><City>Kutina</City><Country>HR</Country></Consignee>
    <Route>
      <Leg sequence="1"><From country="DE">Hamburg</From><To country="AT">Salzburg</To></Leg>
      <Leg sequence="2"><From country="AT">Salzburg</From><To country="SI">Ljubljana</To></Leg>
      <Leg sequence="3"><From country="SI">Ljubljana</From><To country="HR">Kutina</To></Leg>
    </Route>
    <DangerousGoods efti1451="true">
      <DGItem>
        <UNNumber>1203</UNNumber>
        <ProperShippingName>PETROL</ProperShippingName>
        <Class>3</Class>
        <ClassificationCode>F1</ClassificationCode>
        <PackingGroup>II</PackingGroup>
        <PackagingType>TANK</PackagingType>
        <Quantity unit="L">24000</Quantity>
        <TunnelRestriction>D/E</TunnelRestriction>
        <TransportCategory>2</TransportCategory>
      </DGItem>
    </DangerousGoods>
    <Vehicle><Registration>DE-MH-4521</Registration><Type>TANK_VEHICLE</Type></Vehicle>
    <Driver><Name>Max Müller</Name><ADRCertificateRef>DE-ADR-2024-1234</ADRCertificateRef></Driver>
    <Carrier><Name>SpedTrans DE GmbH</Name><Id>DE-CARRIER-0042</Id></Carrier>
  </Consignment>
</eFTIDataResponse>
```

---

## 5. Komunikacijski protokoli (Čl. 9)

| Veza | Protokol | Discovery | Format | Referenca |
|------|----------|-----------|--------|-----------|
| **Gate ↔ Gate** | eDelivery AS4 | **Statički** (fiksne adrese) | XML | Čl. 9(2) |
| **Gate ↔ Platforma** | eDelivery AS4 | **Dinamički** (SML/SMP) | XML | Čl. 9(3) |
| **Gate ↔ Platforma (ista država)** | Nacionalni ekvivalent | Po nacionalnoj implementaciji | Po dogovoru | Čl. 9(4) |

**Napomene:**
- XML format za sve poruke (Čl. 9(1))
- Gate-to-Gate koristi **statičko otkrivanje** (fiksne krajnje točke za svaku državu članicu)
- Gate-to-Platform koristi **dinamičko otkrivanje** putem SML/SMP mehanizma — vidi **Sekciju 5.1.**
- Država članica **može koristiti nacionalno rješenje** za komunikaciju Gate-Platforma unutar iste države (Čl. 9(4))

### 5.1. Statičko otkrivanje — Gate-to-Gate (Čl. 9(2))

Gate-to-Gate komunikacija koristi **fiksne, unaprijed konfigurirane adrese**:

```
HR Gate ima konfiguracijsku tablicu:
  DE Gate → https://efti-gate.bund.de/as4         (certifikat: DE-GATE-CERT)
  AT Gate → https://efti-gate.bmk.gv.at/as4       (certifikat: AT-GATE-CERT)
  SI Gate → https://efti-gate.gov.si/as4           (certifikat: SI-GATE-CERT)
  FR Gate → https://efti-gate.douane.gouv.fr/as4   (certifikat: FR-GATE-CERT)
  ...itd. za svih ~27 država
```

**Zašto statički:** Samo ~27 Gateova (jedan po državi), rijetke promjene, ručna konfiguracija je održiva.

Prema **Čl. 6(3)(e)**, svaki Gate mora:
> *"establish and maintain a secure connection to **all the other eFTI Gates**, as well as an up-to-date
> registry containing the unique identification numbers and the security certificates of those eFTI Gates"*

### 5.2. Dinamičko otkrivanje — Gate-to-Platform (Čl. 9(3)) — SML/SMP mehanizam

Gate-to-Platform koristi **automatsko otkrivanje** jer će postojati **stotine/tisuće** eFTI platformi
u cijeloj EU. Ručna konfiguracija nije održiva → koristi se **SML/SMP** mehanizam iz eDelivery standarda.

#### Što su SML i SMP?

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  SML — Service Metadata Locator                              │
│  ════════════════════════════════                             │
│  Centralni registar na EU razini (jedan za cijeli eFTI)      │
│  Funkcionira poput DNS-a:                                    │
│                                                              │
│  Pitanje: "Koji SMP servis zna za platformu X?"              │
│  Odgovor: "Pitaj SMP na adresi smp.primjer.de"               │
│                                                              │
│  Tehnički: DNS lookup                                        │
│  Primjer: DE-PLAT-0042.efti.sml.europa.eu → smp.efti-de.de  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  SMP — Service Metadata Publisher                            │
│  ═════════════════════════════════                            │
│  Decentralizirani registar (obično po državi ili domeni)     │
│  Sadrži konkretne tehničke detalje za svaku platformu:       │
│                                                              │
│  Pitanje: "Kako kontaktirati platformu X?"                   │
│  Odgovor:                                                    │
│    → URL endpointa:  https://platform42.logistics.de/as4     │
│    → Certifikat:     X.509 javni ključ platforme             │
│    → Procesi:        eFTI-DataAccess-v1, eFTI-UILUpload-v1   │
│    → Transport:      eDelivery AS4                           │
│                                                              │
│  Tehnički: REST/HTTP upit, odgovor u XML                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Tok dinamičkog otkrivanja — korak po korak

```
Primjer: DE Gate treba kontaktirati platformu "DE-PLAT-0042"
         (nakon što je primio zahtjev od HR Gate putem Gate-to-Gate)

═══════════════════════════════════════════════════════════════

KORAK 1: SML lookup (DNS)
─────────────────────────
  DE Gate → DNS upit:
  "DE-PLAT-0042.efti.sml.europa.eu"
                    │
                    ▼
  Odgovor: CNAME → smp.efti-de.example.de
  (= "za tu platformu pitaj ovaj SMP")

KORAK 2: SMP upit (HTTPS)
──────────────────────────
  DE Gate → GET https://smp.efti-de.example.de/DE-PLAT-0042
                    │
                    ▼
  Odgovor (XML dokument):
  ┌─────────────────────────────────────────────┐
  │ ServiceMetadata za DE-PLAT-0042:            │
  │   Endpoint:     https://plat42.log.de/as4   │
  │   Certificate:  [X.509 javni ključ]         │
  │   Processes:    eFTI-DataAccess-v1           │
  │                 eFTI-UILUpload-v1            │
  │                 eFTI-FollowUp-v1             │
  │   Transport:    eDelivery AS4 (OASIS ebMS3)  │
  └─────────────────────────────────────────────┘

KORAK 3: AS4 poruka prema platformi
────────────────────────────────────
  DE Gate → eDelivery AS4 poruka
  URL:  https://plat42.log.de/as4
  Auth: mTLS (certifikat iz koraka 2)
  Body: XML zahtjev za eFTI podatke (UIL, access rights, request ID)
                    │
                    ▼
  Platforma vraća eFTI podatke → DE Gate → HR Gate → inspektor
```

#### Zašto dinamičko za platforme, a ne statičko?

| Aspekt | Gate-to-Gate (statičko) | Gate-to-Platform (dinamičko) |
|--------|------------------------|------------------------------|
| Broj sudionika | ~27 (države članice) | **Stotine/tisuće** platformi |
| Učestalost promjena | Rijetko (nova država = godinama) | **Često** (nove platforme, gašenja, migracije) |
| Konfiguracija | Ručna, fiksna tablica | **Automatska** — SML/SMP lookup |
| Skalabilnost | Nije problem (27 zapisa) | **Kritično** — SML/SMP rješava |
| Certifikati | Bilateralna razmjena | **SMP ih objavljuje** automatski |

#### Nacionalna alternativa (Čl. 9(4))

Za komunikaciju **unutar iste države** (HR Gate ↔ HR platforma), uredba dopušta korištenje
nacionalnog rješenja umjesto SML/SMP:

> **Čl. 9(4):** *"Where a Member State has already set in place **equivalent, nationally defined,
> secure message exchange specifications** for digital public services, it may decide to enable
> that communication between the eFTI platforms and the eFTI Gate established by that Member
> State may take place also based on such equivalent message exchange specifications."*

Država mora **javno objaviti** te specifikacije kako bi ih platforme mogle implementirati.

#### 5.2.1. Smjernice za razvoj — SML/SMP konfiguracija

**SML — DNS konfiguracija:**

SML koristi DNS NAPTR/CNAME zapise. Za testiranje u razvoju, koristiti CEF eDelivery acceptance SML:

```
# Test SML zona (CEF acceptance)
sml.acc.edelivery.tech.ec.europa.eu

# Buduća eFTI produkcijska SML zona (u pripremi)
sml.efti.europa.eu   # ili efti.acc.edelivery.tech.ec.europa.eu (acceptance)
```

**SMP — konfiguracija za HR:**

Svaka država članica (ili skupina) pokrenut će vlastiti SMP. EU nudi referentnu implementaciju:

| Parametar | Vrijednost |
|-----------|------------|
| **SMP softver** | EC DynamicDiscovery SMP (open-source) |
| **Download** | `https://ec.europa.eu/digital-building-blocks/sites/spaces/DIGITAL/pages/467117759/SMP+software` |
| **Runtime** | Java 11+, Tomcat 9.x |
| **Baza** | MySQL 8 ili PostgreSQL |
| **API** | OASIS SMP 2.0 REST API |
| **Registracija** | Svaka HR platforma se registrira u HR SMP |

**SMP ServiceMetadata XML (primjer za eFTI platformu):**

```xml
<ServiceMetadata xmlns="http://docs.oasis-open.org/bdxr/ns/SMP/2016/05">
  <ServiceInformation>
    <ParticipantIdentifier scheme="urn:efti:participant">
      HR-PLAT-0001
    </ParticipantIdentifier>
    <DocumentIdentifier scheme="urn:efti:doctype">
      urn:efti:services:data-access::eFTI-DataAccess-v1
    </DocumentIdentifier>
    <ProcessList>
      <Process>
        <ProcessIdentifier scheme="urn:efti:process">
          urn:efti:process:data-access
        </ProcessIdentifier>
        <ServiceEndpointList>
          <Endpoint transportProfile="bdxr-transport-ebms3-as4-v1p0">
            <EndpointURI>https://platform001.hr-logistics.hr/as4</EndpointURI>
            <Certificate>MIIE...base64...==</Certificate>
            <ServiceActivationDate>2026-01-01T00:00:00Z</ServiceActivationDate>
            <ServiceDescription>HR eFTI platforma — cestovni prijevoz</ServiceDescription>
          </Endpoint>
        </ServiceEndpointList>
      </Process>
    </ProcessList>
  </ServiceInformation>
</ServiceMetadata>
```

**Domibus dinamičko otkrivanje — konfiguracija:**

```properties
# domibus.properties za Gate-to-Platform (dinamičko otkrivanje)
domibus.dynamicdiscovery.useDynamicDiscovery=true
domibus.dynamicdiscovery.client.specification=OASIS

# SML konfiguracija
domibus.smlzone=efti.sml.europa.eu

# SMP certifikat za provjeru autentičnosti SMP odgovora
domibus.dynamicdiscovery.client.certificate.policy.oid=
domibus.dynamicdiscovery.oasisclient.regexCertificateSubjectValidation=.*CN=efti.*

# Transport profil
domibus.dynamicdiscovery.transportprofileas4=bdxr-transport-ebms3-as4-v1p0
```

#### Postojeći EU sustavi koji koriste SML/SMP

Isti mehanizam je već u produkciji u:

| Sustav | SML adresa | Namjena |
|--------|-----------|---------|
| **PEPPOL** | `sml.peppol.eu` | e-Računi, e-Nabava |
| **eIDAS** | eIDAS node registry | Prekogranična identifikacija |
| **EHDSI** | zdravstveni SMP | Prekogranično zdravstvo (e-recepti) |
| **CEF eDelivery** | `sml.acc.edelivery.tech.ec.europa.eu` (test) | Svi EU building block projekti |

eFTI će koristiti vlastiti SML (vjerojatno `sml.efti.europa.eu` ili slično — uspostava u tijeku
paralelno s implementacijom Gateova u državama članicama).

---

## 6. Sigurnost (Čl. 10)

- TLS certifikati za sve komunikacijske kanale
- Kvalificirani elektronički pečati
- Autentikacija gate-to-gate i gate-to-platform putem mTLS

### 6.1. Smjernice za razvoj — Sigurnosna implementacija

**Certifikati — pregled svih tipova:**

| Certifikat | Namjena | Izdavatelj | Format | Valjanost |
|-----------|---------|-----------|--------|----------|
| **mTLS Gate-to-Gate** | Uzajamna autentikacija između Gateova | EU CA ili nacionalni PKI | X.509 v3, PKCS#12 | 2 god. |
| **mTLS Gate-to-Platform** | Uzajamna autentikacija Gate ↔ platforma | Nacionalni PKI | X.509 v3, PKCS#12 | 2 god. |
| **WS-Security (XML Signature)** | Potpisivanje AS4 poruka | EU CA | X.509 v3 | 2 god. |
| **TLS (javni — frontend)** | HTTPS za User Application | Komercijalni CA (DigiCert, Let's Encrypt) | X.509 v3 | 1 god. |
| **NIAS SAML/OIDC** | Potpisivanje SAML Assertion ili JWT | CARNET NIAS CA | X.509 v3 | 3 god. |
| **Kvalificirani e-pečat** | Pravna valjanost eFTI transakcija | Kvalificirani TSP (eIDAS) | QSealC | 2 god. |

**HSM (Hardware Security Module) konfiguracija:**

```
HSM zahtjevi za eFTI Gate:
├── Standard:       CC EAL4+ ili FIPS 140-2 Level 3
├── Algoritmi:      RSA-2048/4096, ECDSA P-256/P-384, AES-256
├── PKCS#11:        Obavezno (Domibus koristi PKCS#11 za pristup HSM-u)
├── Kapacitet:      Min. 50 ključeva (za cert rotation + backup ključeve)
├── HA:             Dual HSM u active-active ili active-standby modu
└── Primjeri:       Thales Luna Network HSM 7, Utimaco Se Gen2, AWS CloudHSM
```

**Domibus PKCS#11 konfiguracija za HSM:**

```properties
# domibus.properties — HSM integracija
domibus.security.keystore.type=PKCS11
domibus.security.keystore.provider=SunPKCS11-HSM
domibus.security.keystore.password=****
domibus.security.key.private.alias=hr-gate-signing-key

# Java PKCS#11 provider konfiguracija (java.security ili -D flag)
# security.provider.N=sun.security.pkcs11.SunPKCS11 /path/to/pkcs11.cfg
```

**mTLS konfiguracija (Nginx reverse proxy primjer):**

```nginx
# Nginx konfiguracija za mTLS na eFTI Gate endpointu
server {
    listen 443 ssl;
    server_name efti-gate.hr;

    # Server certifikat
    ssl_certificate         /etc/ssl/efti/hr-gate.crt;
    ssl_certificate_key     /etc/ssl/efti/hr-gate.key;
    
    # mTLS — zahtijevaj klijentski certifikat
    ssl_client_certificate  /etc/ssl/efti/eu-gate-ca-bundle.crt;  # CA bundle svih EU Gateova
    ssl_verify_client       on;
    ssl_verify_depth        3;
    
    # Minimalni TLS
    ssl_protocols           TLSv1.2 TLSv1.3;
    ssl_ciphers             ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers on;
    
    # Proslijedi Domibus-u
    location /domibus/ {
        proxy_pass https://localhost:8443/domibus/;
        proxy_set_header X-SSL-Client-Cert $ssl_client_cert;
        proxy_set_header X-SSL-Client-S-DN  $ssl_client_s_dn;
    }
}
```

**NIAS integracija — OAuth 2.0 / OIDC (preporuka):**

```
NIAS ↔ eADR autentikacijski tok (OAuth 2.0 Authorization Code + PKCE):

1. Korisnik otvara eADR UI → redirect na NIAS login stranicu
2. NIAS autenticira korisnika (AAI@EduHr, FINA certifikat, mToken...)
3. NIAS vraća authorization_code na eADR callback URL
4. eADR backend zamijeni code za access_token + id_token
5. id_token sadrži claims: {sub, name, oib, institution, role_hint}
6. IdP broker (npr. Keycloak, WSO2 IS) mapira NIAS claims na eADR RBAC uloge
7. eADR frontend prima JWT token za daljnje API pozive

IdP broker konfiguracija (primjer s Keycloak-om — prilagoditi ako se koristi drugi IdP):
├── Realm:          eADR
├── IdP broker:     NIAS (SAML 2.0 ili OIDC)
├── Client:         eadr-web, eadr-mobile, eadr-api
├── Mappers:        institution → authority_code, role_hint → realm_role
├── Token TTL:      access=15min, refresh=8h, session=12h
└── MFA:            Obavezno za ROLE_ADMIN (NIAS security level 3)
```

**Sigurnosni testni scenariji:**

| Test | Opis | Očekivani ishod |
|------|------|------------------|
| SEC-01 | Zahtjev bez mTLS certifikata | 403 Forbidden |
| SEC-02 | Zahtjev s isteklim certifikatom | 403 + alert |
| SEC-03 | Zahtjev s neovlaštenom ulogom (AUDITOR traži WRITE) | 403 |
| SEC-04 | NIAS token expired | 401 + redirect na re-auth |
| SEC-05 | SQL injection u identifier search | Sanitized, no result |
| SEC-06 | Rate limit exceeded (>60 RPM) | 429 Too Many Requests |
| SEC-07 | Replay attack (isti requestId) | Odbijen (idempotent check) |

---

## 7. Struktura zahtjeva (Čl. 3)

Zahtjev prema platformi sadrži:
1. **UIL** ili **identifikatore** za pretragu
2. **Prava pristupa** — koji podskupovi podataka se traže
3. **Jedinstveni ID zahtjeva** — za revizijski trag i korelaciju

### 7.1. Smjernice za razvoj — Validacija zahtjeva

**Request validation pipeline:**

```java
// Java/Spring primjer — validacija eFTI zahtjeva
@Service
public class EftiRequestValidator {

    public ValidationResult validate(EftiDataRequest request) {
        var errors = new ArrayList<String>();
        
        // 1. UIL format validacija (ako je Procedura A)
        if (request.getUil() != null) {
            if (!UIL_PATTERN.matcher(request.getUil()).matches()) {
                errors.add("Invalid UIL format. Expected: gate_id.platform_id.uuid");
            }
        }
        
        // 2. Identifikatori (ako je Procedura B)
        if (request.getIdentifiers() != null) {
            validateIdentifiers(request.getIdentifiers(), errors);
        }
        
        // 3. Access rights — mora postojati barem jedan podskup
        if (request.getAccessRights() == null || request.getAccessRights().isEmpty()) {
            errors.add("At least one data subset must be requested");
        }
        
        // 4. Request ID — UUID format, jedinstvenost
        if (request.getRequestId() == null || !isValidUUID(request.getRequestId())) {
            errors.add("Valid UUID required for requestId");
        }
        if (requestRepo.existsByRequestId(request.getRequestId())) {
            errors.add("Duplicate requestId — idempotency violation");
        }
        
        // 5. Autorizacija — provjera prava za tražene podskupove
        var officer = SecurityContextHolder.getContext().getOfficer();
        for (String subset : request.getAccessRights()) {
            if (!authRegistry.hasAccess(officer, subset)) {
                errors.add("Officer not authorized for subset: " + subset);
            }
        }
        
        return new ValidationResult(errors.isEmpty(), errors);
    }
    
    // UIL regex: gate_identifier.platform_identifier.UUID
    private static final Pattern UIL_PATTERN = Pattern.compile(
        "^[A-Z]{2}-GATE-\\d{2}\\.[A-Z]{2}-PLAT-\\d{4}\\.[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
        Pattern.CASE_INSENSITIVE
    );
}
```

---

## 8. UIL struktura (Čl. 11(2))

```
UIL = gate_identifier + platform_identifier + UUID
       ─────────────   ───────────────────   ────
       ID Gatea na     ID platforme na       Univerzalni
       koji je         koji je pošiljka      jedinstveni
       platforma       registrirana          identifikator
       spojena
```

**VAŽNO:** UIL se NE sastoji od "portal_id + platform_id + UUID" — pojam "portal" ne postoji u uredbi. Ispravan termin je **gate_identifier**.

### 8.1. Smjernice za razvoj — UIL generiranje i validacija

**UIL format specifikacija:**

```
UIL ::= <gate_identifier> "." <platform_identifier> "." <uuid>

gate_identifier     ::= [A-Z]{2} "-GATE-" [0-9]{2}       # npr. HR-GATE-01
platform_identifier ::= [A-Z]{2} "-PLAT-" [0-9]{4}       # npr. HR-PLAT-0001
uuid                ::= UUID v4 (RFC 4122)                # npr. a7b3c9d1-e2f4-4a5b-8c7d-9e0f1a2b3c4d

Primjer kompletnog UIL-a:
  HR-GATE-01.HR-PLAT-0001.a7b3c9d1-e2f4-4a5b-8c7d-9e0f1a2b3c4d
  DE-GATE-01.DE-PLAT-0042.550e8400-e29b-41d4-a716-446655440000

Maksimalna duljina: 512 znakova (dovoljno za buduće proširenje formata)
```

**Validacijski regex (za integraciju u backend i frontend):**

```regex
^[A-Z]{2}-GATE-\d{2}\.[A-Z]{2}-PLAT-\d{4}\.[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$
```

**UUID generiranje na platformi:**

```java
// UUID v4 (random) — preporučeno za eFTI
import java.util.UUID;
String uuid = UUID.randomUUID().toString();  // a7b3c9d1-e2f4-4a5b-8c7d-9e0f1a2b3c4d

// Kompletni UIL
String uil = String.format("%s.%s.%s", gateId, platformId, uuid);
// "HR-GATE-01.HR-PLAT-0001.a7b3c9d1-e2f4-4a5b-8c7d-9e0f1a2b3c4d"
```

**QR kod generiranje za Proceduru A:**

```
QR sadržaj: UIL string (plain text u QR-u)
QR verzija: minimalno v5 (37×37 modula) za UIL do 100 znakova
Error correction: Level M (15%) — kompromis čitljivosti i veličine
Format: PNG 300×300px za print, SVG za digitalni prikaz

Biblioteke:
  Java:       com.google.zxing (ZXing)
  .NET:       QRCoder ili ZXing.Net
  JavaScript: qrcode.js ili jsQR (za čitanje)
  Mobile:     ML Kit Barcode Scanning (Google) ili Vision (Apple)
```

---

## 9. RoI identifikatori i eFTI1451 (Čl. 11(3))

Platforma uz UIL uploadira i identifikatore:

| Identifikator | Opis | Izvor |
|---------------|------|-------|
| Identifikatori prijevoza | Registarske oznake, brojevi dokumenata, LOCODE-ovi | eFTI common data set |
| **eFTI1451** | **Indikator opasnih tvari (DG on board)** | Delegirana uredba 2024/2024 |

eFTI1451 je **ključan za eADR projekt** — omogućuje da HR Gate putem Search Mechanisma automatski
identificira pošiljke s opasnim tvarima bez potrebe za full pull podataka.

### 9.1. Smjernice za razvoj — eFTI1451 i RoI identifikatori

**eFTI1451 kao filtarski mehanizam za eADR:**

```sql
-- Upit za sve aktivne DG pošiljke u HR RoI (za eADR monitoring)
SELECT re.uil, re.gate_identifier, re.platform_identifier, re.activated_at,
       ri_veh.identifier_value AS vehicle_reg,
       ri_un.identifier_value AS un_number
FROM roi_entry re
LEFT JOIN roi_identifier ri_veh ON ri_veh.roi_entry_id = re.id AND ri_veh.identifier_type = 'VEHICLE_REG'
LEFT JOIN roi_identifier ri_un  ON ri_un.roi_entry_id = re.id  AND ri_un.identifier_type = 'UN_NUMBER'
WHERE re.efti1451_dg = TRUE
  AND re.status = 'ACTIVE'
ORDER BY re.activated_at DESC;

-- Indeks optimiziran za DG filter
CREATE INDEX idx_roi_dg_active ON roi_entry (activated_at DESC)
  WHERE efti1451_dg = TRUE AND status = 'ACTIVE';
```

**Identifikator mapping tablica:**

| identifier_type | Opis | Format/primjer | Izvor |
|----------------|------|---------------|-------|
| `VEHICLE_REG` | Registarska oznaka vozila | `DE-MH-4521`, `ZG-7823-KD` | Transportni podaci |
| `CARRIER_ID` | ID prijevoznika | `DE-CARRIER-0042` | Transportni podaci |
| `CONSIGNMENT_ID` | ID pošiljke | `CONSIGNMENT-DE-2026-8834` | Consignment podaci |
| `UN_NUMBER` | UN broj opasne tvari | `1203`, `2794` | DG podaci |
| `ADR_CLASS` | ADR razred | `3`, `4.1`, `7` | DG podaci |
| `DRIVER_REF` | Referenca vozača | `DE-ADR-2024-1234` | Transportni podaci |
| `ROUTE_COUNTRY` | Država na ruti | `HR`, `DE`, `AT` | Ruta podaci |

---

## 10. Revizijski trag i retencija

| Komponenta | Minimalna retencija | Referenca |
|------------|---------------------|-----------|
| AAP | 2 godine | Čl. 4(2)(f) |
| eFTI Gate | 2 godine | Čl. 6(2)(e) |

Revizijski trag uključuje: tko je pristupio, kada, koji podaci, rezultat zahtjeva.

### 10.1. Smjernice za razvoj — Implementacija revizijskog traga

**Audit log dizajn — append-only, imutabilni:**

> **EU zahtjev:** Imutabilni revizijski trag s retencijom min. 2 godine (Čl. 6(2)(e)).
> EU **ne propisuje** konkretnu tehnologiju baze — u nastavku je primjer s TimescaleDB
> sintaksom. Za alternative vidjeti tablicu u poglavlju 2.1.1.
>
> **Kako to rade druge države članice:**
> - **BE (FPS):** PostgreSQL s nativnim particioniranjem, REVOKE pristup
> - **FI (Traficom):** PostgreSQL + pg_partman ekstenzija za automatske mjesečne particije
> - **NL (Logius):** SQL Server s temporal tables (system-versioned)
> - **DE (BALM):** PostgreSQL + row-level security + hash chain za integritet

```sql
-- Gate audit log — primjer s TimescaleDB sintaksom
-- Za čisti PostgreSQL: zamijeniti create_hypertable() s PARTITION BY RANGE
-- Za SQL Server: koristiti system-versioned temporal table
CREATE TABLE gate_audit_log (
    id                  BIGSERIAL,
    timestamp           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    message_id          UUID          NOT NULL,   -- AS4 messageId
    correlation_id      UUID,                      -- za korelaciju request/response
    direction           VARCHAR(8)    NOT NULL,    -- INBOUND, OUTBOUND
    source_gate         VARCHAR(64),               -- tko šalje (HR-GATE-01, DE-GATE-01...)
    target_gate         VARCHAR(64),               -- kome se šalje
    source_platform     VARCHAR(64),               -- platforma (ako Gate-to-Platform)
    uil                 VARCHAR(512),
    efti1451_dg         BOOLEAN,
    action              VARCHAR(32)   NOT NULL,    -- DATA_REQUEST, DATA_RESPONSE, UIL_UPLOAD, SEARCH, FOLLOW_UP
    status              VARCHAR(16)   NOT NULL,    -- SUCCESS, TIMEOUT, ERROR, NO_DATA
    response_time_ms    INTEGER,
    error_code          VARCHAR(32),
    error_detail        TEXT,
    payload_size_bytes  BIGINT,
    PRIMARY KEY (id, timestamp)
);

SELECT create_hypertable('gate_audit_log', 'timestamp', chunk_time_interval => INTERVAL '1 month');

-- Retencija: min. 2 godine (Čl. 6(2)(e)), preporučeno 3 za sigurnost
SELECT add_retention_policy('gate_audit_log', INTERVAL '3 years');

-- Indeksi za analitiku i pretragu
CREATE INDEX idx_gate_audit_msg    ON gate_audit_log (message_id);
CREATE INDEX idx_gate_audit_corr   ON gate_audit_log (correlation_id) WHERE correlation_id IS NOT NULL;
CREATE INDEX idx_gate_audit_uil    ON gate_audit_log (uil) WHERE uil IS NOT NULL;
CREATE INDEX idx_gate_audit_dg     ON gate_audit_log (efti1451_dg, timestamp DESC) WHERE efti1451_dg = TRUE;
CREATE INDEX idx_gate_audit_src    ON gate_audit_log (source_gate, timestamp DESC);
```

**Imutabilnost — implementacijski pristupi:**

```
Opcija 1: PostgreSQL — REVOKE DELETE, UPDATE na audit tablicama
  REVOKE DELETE, UPDATE ON gate_audit_log FROM eadr_app_user;
  GRANT INSERT, SELECT ON gate_audit_log TO eadr_app_user;

Opcija 2: TimescaleDB continuous aggregate + compression
  SELECT add_compression_policy('gate_audit_log', INTERVAL '7 days');
  -- Komprimirani chunkovi su read-only

Opcija 3: Blockchain-style hash chain (za najvišu razinu integriteta)
  Svaki audit zapis sadrži hash prethodnog zapisa:
    prev_hash = SHA-256(previous_record)
    Manipulacija jednog zapisa invalidira cijeli lanac
```

---

## 11. Timeout i error handling

- **Timeout za zahtjev prema platformi: 60 sekundi** (Čl. 8(5))
- Ako platforma ne odgovori u roku → Gate vraća "no information available"
- Error handling prema Čl. 9(5) — standardizirani error odgovori

### 11.1. Smjernice za razvoj — Timeout, Retry i Error handling

**Timeout strategija (po komponenti):**

| Veza | Timeout | Retry politika | Circuit breaker |
|------|---------|----------------|----------------|
| AAP → Gate (lokalni) | 5s | 2 retryja, 1s delay | Da (5 failures/min) |
| Gate → Gate (cross-border) | 60s (Čl. 8(5)) | 0 retryja (hard limit) | Da (3 failures/gate) |
| Gate → Platform (lokalna) | 30s | 1 retry, 2s delay | Da (5 failures/platform) |
| Gate → Platform (SML/SMP lookup) | 10s | 2 retryja, 1s delay | Da |
| AAP → AuthZ Registry | 2s | 3 retryja, 0.5s delay | Da |
| eADR → AFFINIS (batch) | 120s | 3 retryja, 30s delay | Ne (batch) |

**Domibus retry konfiguracija:**

```properties
# Domibus retry (za AS4 poruke)
# Format: Initial_delay;Multiplier;Max_attempts ili Constant (default)
domibus.msh.retry.policy=PROGRESSIVE
domibus.msh.retry.timeout=60000                     # 60s eFTI timeout
domibus.msh.retry.delay=0,2000,5000,15000,30000     # Progressive: 0s, 2s, 5s, 15s, 30s
domibus.msh.retry.maxAttempts=5
```

**Standardizirani error kodovi (za implementaciju):**

```xml
<!-- eFTI Error Response — XML shema -->
<eFTIErrorResponse xmlns="urn:eu:efti:v1:error">
  <RequestId>550e8400-e29b-41d4-a716-446655440000</RequestId>
  <ErrorCode>EFTI-ERR-TIMEOUT</ErrorCode>
  <ErrorMessage>Platform did not respond within 60 seconds</ErrorMessage>
  <Timestamp>2026-03-04T10:31:00Z</Timestamp>
</eFTIErrorResponse>
```

| Error kod | HTTP ekvivalent | Opis | Akcija developera |
|-----------|----------------|------|-------------------|
| `EFTI-ERR-TIMEOUT` | 408/504 | Platforma nije odgovorila u 60s | Vrati "no information available", logiraj |
| `EFTI-ERR-UIL-NOT-FOUND` | 404 | UIL ne postoji u nijednom RoI | Vrati prazan odgovor, logiraj |
| `EFTI-ERR-UNAUTHORIZED` | 403 | Traženi podskup nije autoriziran | Odbij zahtjev, logiraj pokušaj |
| `EFTI-ERR-INVALID-REQUEST` | 400 | Neispravan format zahtjeva | Vrati detalje greške |
| `EFTI-ERR-PLATFORM-ERROR` | 502 | Platforma javila grešku | Logiraj, retry prema politici |
| `EFTI-ERR-GATE-UNAVAILABLE` | 503 | Strani Gate nije dostupan | Logiraj, circuit breaker |
| `EFTI-ERR-DEACTIVATED` | 410 | UIL je deaktiviran (podaci više nisu dostupni) | Vrati status, logiraj |

**Circuit breaker implementacija — primjer s Resilience4j (ako se koristi Java/Spring Boot):**

> Napomena: Prikazan je primjer za Java/Spring Boot jer je to ekosustav Domibusa.
> Za .NET ekvivalent koristiti Polly biblioteku (`AddPolicyHandler<CircuitBreakerPolicy>`).
> Za Go: gobreaker. Princip je isti neovisno o platformi.

```java
@CircuitBreaker(name = "gateToGate", fallbackMethod = "gateFallback")
@Retry(name = "gateToGate")
@TimeLimiter(name = "gateToGate")
public CompletableFuture<EftiResponse> forwardToGate(String gateCode, EftiRequest request) {
    return gateClient.sendAsync(gateCode, request);
}

public CompletableFuture<EftiResponse> gateFallback(String gateCode, EftiRequest req, Throwable t) {
    auditLog.warn("Gate {} unavailable: {}", gateCode, t.getMessage());
    return CompletableFuture.completedFuture(
        EftiResponse.noInformationAvailable(req.getRequestId())
    );
}

// application.yml — Resilience4j konfiguracija
// resilience4j.circuitbreaker.instances.gateToGate:
//   slidingWindowSize: 10
//   failureRateThreshold: 50
//   waitDurationInOpenState: 30s
//   permittedNumberOfCallsInHalfOpenState: 3
// resilience4j.timelimiter.instances.gateToGate:
//   timeoutDuration: 60s
```

---

## 12. Naknadna komunikacija (Follow-up)

Gate podržava naknadnu komunikaciju prema platformi (Čl. 6(2)(f)):
- Zahtjev za ažuriranje
- Obavijest o nadzornom pregledu
- Daljnji upit temeljem već dobivenih podataka

### 12.1. Smjernice za razvoj — Follow-up komunikacija

**Asinkroni message pattern za follow-up:**

Follow-up zahtjevi koriste AS4 korelaciju (`ConversationId`) za povezivanje s originalnim zahtjevom:

```xml
<!-- Follow-up zahtjev — AS4 eb:Messaging header -->
<eb:Messaging xmlns:eb="http://docs.oasis-open.org/ebxml-msg/ebms/v3.0/ns/core/200704/">
  <eb:UserMessage>
    <eb:MessageInfo>
      <eb:Timestamp>2026-03-04T11:00:00Z</eb:Timestamp>
      <eb:MessageId>follow-up-msg-001@hr-gate.efti.hr</eb:MessageId>
      <eb:RefToMessageId>original-request-001@hr-gate.efti.hr</eb:RefToMessageId>
    </eb:MessageInfo>
    <eb:CollaborationInfo>
      <eb:ConversationId>CONV-2026-0304-ZG7823KD</eb:ConversationId>
      <eb:Action>FollowUpRequest</eb:Action>
      <eb:Service type="urn:efti:services">urn:efti:services:follow-up</eb:Service>
    </eb:CollaborationInfo>
  </eb:UserMessage>
</eb:Messaging>
```

**Follow-up tipovi za implementaciju:**

| Tip | Action | Opis | Use case |
|-----|--------|------|----------|
| `FollowUpDataUpdate` | Ažuriranje podskupa | Traži se ažurirani DG dataset | Pošiljka promijenjena za vrijeme nadzora |
| `FollowUpInspectionNotif` | Obavijest o nadzoru | Informira platformu da je nadzor u tijeku | Evidencija na platformi |
| `FollowUpAdditionalData` | Dodatni podskup | Traži se širi set podataka (npr. full umjesto selective) | Inspektor treba više informacija |
| `FollowUpCorrectionReq` | Zahtjev za korekciju | Prijava pogrešnih podataka na platformi | Uočena nesukladnost u podacima |

**Implementacija (Kafka async pipeline):**

```
Follow-up tok:
  1. Inspektor šalje follow-up iz UI → eADR REST API
  2. eADR producira Kafka event na topic `efti.followup.requests`
  3. Gate Consumer čita event → gradi AS4 poruku s RefToMessageId
  4. Domibus šalje AS4 follow-up prema odgovarajućem Gate-u/platformi
  5. Odgovor se prima async → Kafka topic `efti.followup.responses`
  6. UI se ažurira putem WebSocket/SSE push notifikacije
```

---

## 13. Terminološka referenca — ŠTO NE POSTOJI u uredbi

| ❌ Pogrešan termin | ✅ Ispravan termin | Napomena |
|--------------------|--------------------|----------|
| "eFTI Portal" | **eFTI Gate** | "Portal" se ne koristi nigdje u uredbi 2024/1942 |
| "Metadata push" | **UIL + identifikator upload u RoI** | Platforma ne "pusha metapodatke" — ona uploadira UIL i identifikatore u RoI svog matičnog Gatea (Čl. 11) |
| "portal_id" (u UIL-u) | **gate_identifier** | UIL = gate_identifier + platform_identifier + UUID (Čl. 11(2)) |
| "Platforma pushuje u više Gateova" | **Platforma uploadira samo u matični Gate** | Uvodna izjava 9 — ONE gate only |
| "eADR ↔ strane eFTI platforme" | **eADR ↔ HR Gate ↔ Gate-to-Gate ↔ strana platforma** | Direktna komunikacija s platformama drugih država ne postoji; sve ide kroz Gate mrežu |

---

## 14. Implikacije za NSCP/eADR projekt u Hrvatskoj

### 14.1. Što Hrvatska mora izgraditi:
1. **HR eFTI Gate** — s integriranim Search Mechanismom i RoI
2. **HR AAP** — za pristup ovlaštenih tijela (policija, carina, inspekcije)
3. **Authorisation Registry** — prava pristupa po službeniku
4. **User Application** — sučelje za službenike
5. **eDelivery AS4** — za Gate-to-Gate i Gate-to-Platform komunikaciju
6. **RoI** — za UIL registraciju hrvatskih platformi + pretragu

### 14.2. Kako funkcionira prekogranični scenarij (DE→AT→SI→HR):
1. DE platforma kreira eFTI skup podataka i uploadira UIL + identifikatore (uklj. eFTI1451) u **DE Gate RoI** (matični Gate)
2. Podaci ostaju na DE platformi — nigdje se ne kopiraju
3. HR inspektor zaustavlja kamion → skenira UIL (Procedura A) ili traži po identifikatorima (Procedura B)
4. HR AAP → HR Gate → Search Mechanism pretražuje HR RoI → nema → prosljeđuje na DE Gate
5. DE Gate pronalazi UIL u svom RoI → usmjerava na DE platformu
6. DE platforma vraća tražene podskupove → DE Gate → HR Gate → HR AAP → inspektor
7. Ako eFTI1451 = true → eADR sloj pokreće AVR provjere (vozač, vozilo, dozvole)

### 14.3. Gate NE pohranjuje eFTI podatke
Gate pohranjuje samo:
- RoI zapise (UIL + identifikatori)
- Revizijske tragove (tko, kada, što — min. 2 god.)
- Log poruka

Stvarni eFTI podaci (CMR, packing list, DG deklaracije) ostaju **isključivo na platformi**.

---

## 15. Analitička obrada eFTI podataka (AFFINIS) — pravni okvir

### 15.1. Ograničenje svrhe pristupa (Čl. 2(5))

> *"Member States remain responsible for ensuring that the access and processing
> by competent authorities of eFTI data is done **only for the purposes of checking
> compliance** with the applicable EU and national legal provisions."*

**Što to znači:** Svaki dohvat eFTI podataka s platforme mora biti vezan uz konkretan nadzor
konkretnog službenika. **Spekulativni bulk pull** podataka s platformi isključivo u analitičke
svrhe **NIJE DOPUŠTEN**.

### 15.2. AAP arhiva — legitimni izvor punih eFTI podataka (Čl. 4(2)(f–g))

AAP je obvezan arhivirati:
- **Svaki zahtjev** i **svaki primljeni odgovor** (uklj. pune eFTI podatke) — **minimalno 2 godine**
- Revizijski trag: tko je pristupio, kada, koji podaci, rezultat

Jednom legitimno dohvaćeni podaci putem nadzora postaju dio AAP arhive i smiju se
dalje obrađivati za statističke svrhe (GDPR Čl. 5(1)(b), Čl. 89).

### 15.3. Legitimni izvori za analitički sustav (AFFINIS)

| Izvor | Sadržaj | Pravna osnova | Legalno za analitiku? |
|-------|---------|---------------|----------------------|
| **AAP arhiva** | Puni eFTI odgovori iz provedenih nadzora | Čl. 4(2)(g) — obvezna 2-god. arhiva | **DA** ✅ |
| **AAP arhiva (strani podaci)** | Puni eFTI podaci dohvaćeni s platformi drugih država (DE, AT, SI...) putem legitimnog nadzora | Čl. 4(2)(g) + GDPR Čl. 89 | **DA** ✅ |
| **RoI metapodaci** | UIL zapisi, eFTI1451, identifikatori prijevoza | Uvodna izjava 8 — "monitoring or statistical purposes" | **DA** ✅ |
| **Audit logovi (AAP)** | Tko, kada, koji podaci, rezultat | Čl. 4(2)(f) — obvezni 2 god. | **DA** ✅ |
| **Audit logovi (Gate) — odlazni** | HR upiti prema stranim Gateovima (routing, timing, error) | Čl. 6(2)(c,g,h) — obvezni 2 god. | **DA** ✅ |
| **Audit logovi (Gate) — dolazni** | Upiti stranih tijela prema HR Gate-u (tko nas pita, za što) | Čl. 6(2)(c,g,h) + Uv. izj. 8 | **DA** ✅ |
| **Bulk pull s platformi** (bez nadzora) | eFTI podaci dohvaćeni čisto za analitiku | — | **NE** ❌ (Čl. 2(5)) |

### 15.4. Prekogranična analitika — pojašnjenje

#### A) Upiti stranih tijela prema HR Gate-u

Kada strano tijelo (npr. DE inspektor) traži podatke s platforme certificirane u HR:
```
DE službenik → DE AAP → DE Gate → HR Gate → HR platforma → odgovor natrag
```

HR Gate pri tome **obvezno logira** (Čl. 6(2)(c,g)):
- ID zahtjeva, ID Gatea koji pita (DE), UIL, timestamp, rezultat, trajanje

**Uvodna izjava 8** eksplicitno dopušta korištenje tih metapodataka za statistiku:
> *"...except for metadata connected to eFTI data processing such as identifiers
> or operation logs, and only for legitimate purposes such as routing, format
> validation or adaptation and **for monitoring or statistical purposes**."*

**Primjeri legitimne analitike na dolaznim upitima:**

| KPI | Izvor | Primjer |
|-----|-------|---------|
| Broj upita po državi | Gate audit log | "DE nas pita 500×/mj, AT 300×/mj" |
| DG udio u upitima | Gate audit log + eFTI1451 | "35% dolaznih upita tiče se DG pošiljki" |
| Prosječno vrijeme odgovora | Gate audit log | "HR platforma avg response: 1.8s" |
| Peak sati / sezone | Gate audit log timestamp | "Najviše upita Q2, radni dani 08-12h" |
| Timeout rate | Gate audit log | "2.1% upita završava timeoutom (>60s)" |

#### B) Podaci dohvaćeni s platformi drugih članica

Kada HR inspektor legitimno provjeri kamion i dohvati eFTI podatke s DE platforme:
```
HR inspektor → HR AAP → HR Gate → DE Gate → DE platforma
                                                ↓ (puni eFTI podaci)
HR inspektor ← HR AAP ← HR Gate ← DE Gate ← DE platforma
```

HR AAP **obvezno arhivira cijeli odgovor** (Čl. 4(2)(g)) — uključujući pune eFTI podatke
koje je DE platforma vratila (CMR, DG deklaracije, mase, UN brojeve, podatke o prijevozniku).

**Ti podaci smiju ići u AFFINIS za analitiku** temeljem:
1. **Čl. 4(2)(g)** — podaci su legitimno u HR AAP arhivi (dohvaćeni za nadzor)
2. **GDPR Čl. 5(1)(b)** — daljnja statistička obrada nije nekompatibilna s izvornom svrhom
3. **GDPR Čl. 89(1)** — statistička obrada dopuštena uz pseudonimizaciju

**Primjeri legitimne analitike na stranim podacima:**

| KPI | Izvor | Primjer |
|-----|-------|---------|
| Top UN tvari u tranzitu | AAP arhiva (strani eFTI) | "UN 1203 (benzin) = 28% DG tranzita" |
| DG tranzitni koridor trend | AAP arhiva (strani eFTI) | "DE→HR DG promet +12% YoY" |
| Udio nesukladnosti po državi | AAP arhiva + nadzor rezultat | "SI pošiljke: 4.2% nesukladno" |
| Prijevoznici s ponavljajućim prekršajima | AAP arhiva (pseudonimizirano) | "3 prijevoznika s >5 prekršaja/god" |

#### C) Bitno ograničenje

> **Čl. 2(5):** Pristup eFTI podacima smije se ostvariti **isključivo u svrhu provjere
> usklađenosti** s primjenjivim propisima. HR Gate **NE SMIJE** slati automatske bulk upite
> prema stranim platformama čisto da bi napunio AFFINIS analitiku.
>
> Ali: **svaki legitimni nadzor = legalni podaci za AFFINIS.**

> **GDPR Čl. 5(1)(b):** *"further processing for... **statistical purposes** shall...
> **not be considered to be incompatible** with the initial purposes"*

> **GDPR Čl. 89(1):** Obrada u statističke svrhe dopuštena uz odgovarajuće
> zaštitne mjere, uključujući **pseudonimizaciju**.

### 15.5. Implementacijski model za AFFINIS

```
LEGITIMNI TOK PODATAKA ZA ANALITIKU:

  ┌──────────────────────────┐
  │ HR AAP arhiva (Čl. 4(2)) │
  │  → Puni eFTI odgovori    │
  │  → Rezultati nadzora     │
  │  → Min. 2 god. retencija │
  └────────────┬─────────────┘
               │ Batch T+1 (CDC/REST)
               ▼
  ┌──────────────────────────┐    ┌───────────────────────┐
  │      AFFINIS DWH         │◄───│ RoI metapodaci        │
  │  (pseudonimizirano)      │    │ (eFTI1451, UIL stat.) │
  │                          │◄───│ Audit logovi          │
  │  → Statistika nadzora    │    │ (AAP + Gate)          │
  │  → DG analitika          │    └───────────────────────┘
  │  → Trend analize         │
  │  → KPI dashboards        │
  └──────────────────────────┘

ZABRANJENI TOK (❌):
  AFFINIS → HR Gate → strane platforme → bulk pull za analitiku
  (Čl. 2(5) — pristup samo za compliance check)
```

### 15.6. Obvezni uvjeti za analitičku obradu

1. **Pseudonimizacija** osobnih podataka (vozač, pošiljatelj, primatelj) — GDPR Čl. 89
2. **Pravna osnova** — dokumentirati da su podaci izvorno dohvaćeni za legitimni nadzor
3. **Retencija** — poštivati minimalne i maksimalne rokove čuvanja
4. **Pristup** — analitičar nema pristup nepseudonimiziranim podacima

### 15.7. Smjernice za razvoj — AFFINIS analitički sustav

> **Napomena:** EU uredbe ne propisuju tehnologiju za analitičku obradu eFTI podataka.
> U nastavku su prikazane moguće tehnologije s obrazloženjem i primjerima iz EU država.
> Konačnu tehnološku odluku donosi projektni tim.

**Mogući tehnološki stog za DWH/analitiku — opcije:**

| Komponenta | Opcija A (open-source) | Opcija B (enterprise) | Opcija C (cloud) | Primjeri iz EU |
|-----------|----------------------|---------------------|-----------------|----------------|
| **OLAP Engine** | StarRocks / ClickHouse | Oracle OLAP / Vertica | Snowflake / BigQuery | NL koristi Snowflake u nekim gov. analitikama; DE DWH često PostgreSQL OLAP |
| **Object Storage** | MinIO (S3-kompatibilno) | NetApp StorageGRID | AWS S3 / Azure Blob | FI koristi S3 za Copernicus podatke |
| **ETL/ELT** | Apache Spark 3.x | Informatica / Talend | Azure Data Factory / AWS Glue | IT carinski AIDA koristi Informatica; Eurostat koristi Spark |
| **Orkestracija** | Dagster / Apache Airflow | Control-M | Azure Data Factory | Airflow široko korišten u EU javnom sektoru (EEA, EMA) |
| **Vizualizacija** | Apache Superset / Metabase | Power BI / Tableau | Looker / QuickSight | DE koristi Power BI u nekim gov. app; Superset u EU agencijama |
| **CDC** | Debezium → Kafka | Oracle GoldenGate | AWS DMS | Debezium + Kafka široko korišten u EU open-source zajednici |
| **Table Format** | Apache Iceberg / Delta Lake | Oracle Partitioning | Delta Lake (Databricks) | Iceberg u usponu za EU Lakehouse arhitekture |

> **Zašto Medallion arhitektura (Raw → Silver → Gold)?** Ovaj obrazac je de facto standard za
> moderne DWH sustave jer omogućuje: (1) audit trail nad transformacijama, (2) laku ponovljivost
> pipeline-a, (3) jasno razdvajanje sirovih i pseudonimiziranih podataka (GDPR Čl. 89).
> Koriste ga: Eurostat (za statističke pipeline-e), EEA, Copernicus data hub.

**Primjer Medallion arhitekture (Raw → Silver → Gold) — neovisno o odabranom stogu:**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ RAW LAYER (Bronze)                                                          │
│ ──────────────────                                                          │
│ Object storage (MinIO / S3 / Azure Blob / HDFS):                            │
│   ├── nadzori/  (JSON, dnevni batch T+1)                                     │
│   ├── registri/ (JSON, CDC stream)                                           │
│   ├── efti/     (XML → JSON, selektivni pull odgovori)                       │
│   ├── taho/     (JSON, T+1 batch iz SOTAH via Affinis)                       │
│   └── audit/    (JSON, audit logovi AAP + Gate)                               │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │ ETL (Spark / Informatica / ADF)
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ SILVER LAYER (očišćeni, validirani, pseudonimizirani)                       │
│ ────────────────────                                                        │
│ Transformacije:                                                             │
│   • Pseudonimizacija: OIB/ime → SHA-256 hash + salt                         │
│   • Normalizacija: ADR kodovi → standardne kodne liste                      │
│   • Deduplication: idempotentnost na requestId                               │
│   • Data quality: NULL handling, type casting, range validation              │
│   • Enrichment: geolokacija (PostGIS → H3 hex), UN → proper shipping name   │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │ Load u OLAP engine (StarRocks / ClickHouse / PG OLAP / Snowflake)
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ GOLD LAYER (business-ready, Snowflake shema)                                │
│ ────────────────                                                              │
│ FACT tablice (9):                                                           │
│   FACT_NADZOR, FACT_POSILJKA, FACT_DG_STAVKA, FACT_LEG,                      │
│   FACT_INCIDENT, FACT_POTVRDA, FACT_DOPUSTENJE, FACT_TAHO, FACT_EFTI_DOHVAT  │
│                                                                              │
│ DIM tablice (22+):                                                           │
│   DIM_VRIJEME, DIM_LOKACIJA, DIM_VOZILO, DIM_VOZAC, DIM_PRIJEVOZNIK,        │
│   DIM_UN_TVAR, DIM_ADR_RAZRED, DIM_NADLEZNO_TIJELO, DIM_SLUZBENIK_PSEUDO,   │
│   DIM_UCILISTE, DIM_ISPITNI_CENTAR, DIM_PROGRAM, DIM_RUTA, ...              │
│                                                                              │
│ MV (materijalizirani pogledi, 7):                                            │
│   MV_DG_MONTHLY_SUMMARY, MV_CARRIER_RISK_SCORE, MV_ADR_CERT_EXPIRY,         │
│   MV_INSPECTION_KPI, MV_ROUTE_ANALYSIS, MV_CROSS_DOMAIN, MV_NPOO_REPORT     │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Primjer ETL pipeline-a (prikazan s Dagster-om — alternativa: Airflow, ADF, Control-M):**

> Napomena: Dagster je prikazan kao primjer orkestratora. Za Airflow sintaksa bi koristila
> `@dag` / `@task` dekoratore; za Azure Data Factory konfiguriralo bi se putem JSON pipeline-a.

```python
# Dagster DAG primjer za eADR ETL pipeline
from dagster import job, op, schedule, AssetIn

@op
def extract_eadr_nadzori(context):
    """Dnevni batch extract iz eADR PostgreSQL (T+1)"""
    # CDC via Debezium → Kafka → MinIO raw
    # ili REST API export za initial/full load
    pass

@op 
def transform_silver(context, raw_data):
    """Spark job: Raw → Silver (pseudonimizacija, validacija, normalizacija)"""
    # Pseudonimizacija: OIB → SHA-256(OIB + SALT)
    # Normalizacija ADR kodova prema kodnim listama
    pass

@op
def load_gold_starrocks(context, silver_data):
    """Load u OLAP engine Gold tablice (Snowflake shema)"""
    # StarRocks Stream Load, ClickHouse INSERT, ili Snowflake COPY INTO
    pass

@job
def eadr_daily_etl():
    raw = extract_eadr_nadzori()
    silver = transform_silver(raw)
    load_gold_starrocks(silver)

@schedule(cron_schedule="0 3 * * *", job=eadr_daily_etl)  # Svaki dan u 03:00 CET
def daily_eadr_schedule():
    return {}
```

**Pseudonimizacija (GDPR Čl. 89 implementacija):**

```python
import hashlib

def pseudonymize(personal_id: str, salt: str) -> str:
    """
    GDPR Čl. 89 pseudonimizacija osobnih podataka.
    Salt se čuva u HSM-u ili Vault-u, NIKAD u kodu.
    """
    return hashlib.sha256(f"{personal_id}:{salt}".encode()).hexdigest()[:32]

# Primjer:
# pseudonymize("12345678901", "eadr-2026-salt") → "a3b4c5d6e7f8..."
# Analitičar vidi hash, ne OIB.
# Isti OIB uvijek daje isti hash → moguća korelacija bez re-identifikacije.
```

---

## 16. eADR komponente — detaljan opis i komunikacijska arhitektura

### 16.1. Tri funkcionalna područja eADR sustava

eADR sustav (NPOO C1.4. R1-I5) obuhvaća **tri funkcionalna područja** koja zajedno čine cjeloviti
nacionalni sustav za praćenje prijevoza opasnih tvari u cestovnom prometu:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        eADR SUSTAV (AKD d.o.o.)                        │
│                                                                         │
│  ┌───────────────────┐  ┌───────────────────┐  ┌─────────────────────┐ │
│  │ (A) OSPOSOBLJAVA- │  │ (B) ELEKTRONIČKA  │  │ (C) eFTI            │ │
│  │     NJE            │  │     DOPUŠTENJA    │  │     INTEGRACIJA     │ │
│  │     (Training)     │  │     (Permits)     │  │     (Nadzor)        │ │
│  │                    │  │                    │  │                     │ │
│  │  7 ADR programa    │  │  4 vrste dopušt.  │  │  Cestovna kontrola  │ │
│  │  Tečajevi/ispiti   │  │  MUP/MUP-RCZ/MMPI   │  │  eFTI dohvat DG     │ │
│  │  ADR potvrde       │  │  Cross-validacija │  │  Affinis tahografi  │ │
│  │  5-god. ciklus     │  │  Životni ciklus   │  │  Incidenti/mjere    │ │
│  └───────────┬────────┘  └────────┬──────────┘  └──────────┬──────────┘ │
│              │                     │                         │            │
│              └─────────────────────┼─────────────────────────┘            │
│                                    │                                      │
│                    ┌───────────────▼────────────────┐                    │
│                    │    8 NACIONALNIH REGISTARA      │                    │
│                    │                                  │                    │
│                    │  1. ADR vozila (~3.000)          │                    │
│                    │  2. ADR vozači (ADR potvrde)     │                    │
│                    │  3. Sigurnosni savjetnici        │                    │
│                    │  4. Učilišta (ovlaštena)         │                    │
│                    │  5. Ispitni centri (HAK)         │                    │
│                    │  6. Dopuštenja (klasa 1/7/posp.) │                    │
│                    │  7. Prijevoznici (dij. Taho/NSCP)│                    │
│                    │  8. Nadzori (pregledi/mjere)     │                    │
│                    └────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────────────────┘
```

#### (A) Upravljanje osposobljavanjem (Training Module)

Digitalizirani sustav za cjelokupni životni ciklus ADR osposobljavanja — od prijave na tečaj
do izdavanja i obnove ADR potvrde (certifikata).

**7 programa osposobljavanja:**
- Osnovno ADR (sve klase osim 1 i 7)
- Specijalizacija — klasa 1 (eksplozivne tvari)
- Specijalizacija — klasa 7 (radioaktivni materijali)
- Cisterne (dodatno osposobljavanje)
- Obnova osposobljavanja (svaka 5 godina)
- Sigurnosni savjetnik — osnovno
- Sigurnosni savjetnik — obnova

**Životni ciklus ADR potvrde:**
```
Prijava → Tečaj (učilište) → Ispit (ispitni centar) → Rezultat →
  Potvrda izdana (HR-ADR-YYYY-XXXXX) → Aktivna (5 god.) →
    Upozorenje istek (3/6/12 mj.) → Obnova ili Istekla/Suspendirana/Opozvana
```

#### (B) Elektronička dopuštenja (Permits Module)

Digitalno izdavanje, praćenje i upravljanje ADR dopuštenjima za prijevoz specifičnih klasa
opasnih tvari.

**4 vrste ADR dopuštenja:**

| Vrsta | Tijelo izdavatelj | Predmet |
|-------|-------------------|---------|
| Prijevoz eksploziva (klasa 1) | **MUP** | Eksplozivne tvari |
| Prijevoz radioaktivnog materijala (klasa 7) | **MUP-RCZ** | Radioaktivni materijali |
| Posebne rute/uvjeti | **MMPI** | Ograničene rute |
| Izvanredni prijevoz opasnih tvari | **MMPI/MUP** | Posebni uvjeti |

**Ključna funkcionalnost — cross-validacija:**
```
Dopuštenje izdano za klasu 3 →
  Provjera: ima li vozač ADR potvrdu za klasu 3? ✓/✗
  Provjera: ima li vozilo ADR odobrenje za klasu 3? ✓/✗
  Provjera: je li potvrda vozača istekla? ✓/✗
  Provjera: je li ADR certifikat vozila istekao? ✓/✗
```

#### (C) eFTI integracija (Nadzor i enforcement)

Operativni nadzorni modul — primarni use case za inspektore tijekom cestovnih kontrola.
Integrira se s eFTI Gate mrežom (Uredba 2024/1942) i Affinis DWH-om za tahografske podatke (T+1 batch; eADR ne koristi SOTAH direktno).

### 16.2. Komunikacijska arhitektura — eADR i ostale komponente sustava

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌──────────────────┐                                                      │
│  │     NIAS          │ ◄── SAML 2.0 / OAuth 2.0                            │
│  │ (Autentikacija)   │     X.509 certifikat                                │
│  └────────┬─────────┘                                                      │
│           │ Login službenika                                                │
│           ▼                                                                 │
│  ┌────────────────────────────────────────────────────┐                    │
│  │              eADR SUSTAV                            │                    │
│  │                                                      │                    │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │                    │
│  │  │ Training   │  │ Permits    │  │ eFTI Nadzor  │  │                    │
│  │  │ Module     │  │ Module     │  │ Module       │  │                    │
│  │  └──────┬─────┘  └──────┬─────┘  └──────┬───────┘  │                    │
│  │         └───────────────┼───────────────┘           │                    │
│  │                         │                            │                    │
│  │              ┌──────────▼────────────┐              │                    │
│  │              │  8 Nacionalnih        │              │                    │
│  │              │  registara            │              │                    │
│  │              └──────────┬────────────┘              │                    │
│  └─────────────────────────┼──────────────────────────┘                    │
│                             │                                               │
│        ┌────────────────────┼────────────────────┐                         │
│        │                    │                    │                          │
│        ▼                    ▼                    ▼                          │
│  ┌────────────────┐     ┌──────────────┐                                   │
│  │ AFFINIS DWH    │     │ NSCP/HR eFTI │                                   │
│  │ (analitika +   │     │ Gate         │                                   │
│  │  taho T+1)     │     │ eDelivery    │                                   │
│  │ REST/CDC       │     │ AS4 / mTLS   │                                   │
│  └────────────────┘     └──────┬───────┘                                   │
│                          │                                                  │
│              ┌───────────┼───────────┐                                     │
│              │           │           │                                      │
│              ▼           ▼           ▼                                      │
│        ┌──────────┐ ┌──────────┐ ┌──────────┐                              │
│        │ DE Gate  │ │ AT Gate  │ │ SI Gate  │  ... (27 EU Gateova)         │
│        └────┬─────┘ └────┬─────┘ └────┬─────┘                              │
│             │            │            │                                      │
│             ▼            ▼            ▼                                      │
│        ┌──────────┐ ┌──────────┐ ┌──────────┐                              │
│        │ DE       │ │ AT       │ │ SI       │  ... (eFTI platforme)        │
│        │ platforma│ │ platforma│ │ platforma│                              │
│        └──────────┘ └──────────┘ └──────────┘                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 16.3. Komunikacije — detaljan pregled svih integracija

| # | Veza | Smjer | Protokol | Autentikacija | Svrha |
|---|------|-------|----------|---------------|-------|
| 1 | eADR ↔ **NIAS** | Dvosmjerna | SAML 2.0 / OAuth 2.0 | X.509 certifikat | Autentikacija službenika (MUP, DI, Carina, MUP-RCZ, CVH) |
| 2 | eADR ↔ **AFFINIS DWH** | Dvosmjerna | REST API + CDC | SSH Key / API | Tahografski podaci (T+1 batch iz SOTAH-a), analitički export (nadzori, registri, pošiljke), agregirani KPI |
| 3 | eADR ↔ **HR eFTI Gate** (NSCP) | Dvosmjerna | eDelivery AS4 | mTLS | UIL upload u RoI + selective/full pull DG podataka |
| 4 | HR Gate ↔ **EU Gate mreža** | Gate-to-Gate | eDelivery AS4 | mTLS | Prekogranična razmjena — pristup stranim platformama |
| 5 | eADR ← **CVH** | Ingest | REST/SFTP | Certifikat | ADR pregledi vozila, status odobrenja |
| 6 | eADR ← **MMPI** | Ingest | REST/SFTP | Certifikat | Registar prijevoznika, licenci, učilišta, ispitnih centara |
| 7 | eADR ← **Učilišta/HAK** | Unos | Web UI / API | NIAS SSO | Rezultati tečajeva i ispita |

### 16.4. Tok podataka pri cestovnom nadzoru — integrirani dijagram

Primarni operativni scenarij koji demonstrira komunikaciju **svih komponenti**:

```
KORAK 1: Autentikacija                     KORAK 6: eFTI dohvat
─────────────────────                       ──────────────────────
Inspektor → NIAS →                          eADR → HR Gate →
  eADR (ROLE_INSPECTOR)                       [Search Mechanism]
                                               ├─ HR RoI: nema UIL
KORAK 2: Identifikacija                       ├─ DE Gate RoI: UIL pronađen
──────────────────────────                     └─ DE Gate → DE platforma
Inspektor unosi reg.oznaku                       → DG podaci vraćeni
  ZG-7823-KD                                     → DE Gate → HR Gate → eADR

KORAK 3: Provjera registara               KORAK 7: Prikaz i cross-validacija
──────────────────────────────             ─────────────────────────────────────
eADR pretražuje 8 registara:               eADR uspoređuje:
  vozilo: ADR odobr. ✓ (do 2027)            eFTI kaže: klasa 3, UN 1203
  vozač:  ADR potvrda ✓ (do 2028)            eADR registar kaže:
  dopuštenje: aktivno ✓                        vozač ima potvrdu za klasu 3 ✓
  prijevoznik: licencija ✓                     vozilo odobreno za klasu 3 ✓
                                                dopuštenje pokriva UN 1203 ✓
KORAK 4: Affinis dohvat (taho T+1)
───────────────────────────────────    KORAK 8: Ishod i mjere
eADR → Affinis DWH REST API →          ──────────────────────────
  tahografski sažetak (T+1):            Inspektor bilježi ishod →
  vožnja danas: 7h30min*                 sukladno / nesukladno →
  odmor: 1h                                mjere (ako nesukladno) →
  prekoračenje: NE                           audit zapis (imutabilan)
  *Napomena: T+1 latencija —
   jučerašnji podaci, ne real-time

KORAK 5: Fizički pregled                  KORAK 9: AFFINIS (T+1)
────────────────────────                  ──────────────────────────
Inspektor fizički provjerava:              Batch export →
  ADR oznake na vozilu ✓                     AFFINIS DWH:
  ADR oprema (vatrogasni ap.) ✓              → statistika nadzora
  Pakiranje/označavanje ✓                    → DG analitika
  Dokumenti fizički ✓                        → trend korelacije
```

### 16.5. Razgraničenje odgovornosti eADR vs. NSCP

| Aspekt | **eADR** | **NSCP** |
|--------|----------|----------|
| Fokus | Opasne tvari (DG) — ADR | Sav cestovni teret (uklj. ne-DG) |
| Registri | ADR vozila, vozači, potvrde, dopuštenja | Prijevoznici, vozila, licencije (šire) |
| eFTI pretraga | eFTI1451=true (samo DG pošiljke) | Sav teret |
| Nadzor | ADR cestovne kontrole, ADR oprema, klase | Opći cestovni nadzor |
| Gate | Dijeli HR eFTI Gate s NSCP-om | Dijeli HR eFTI Gate s eADR-om |
| Tahografski podaci | Da — preko Affinis DWH (T+1 batch) | Da — preko Affinis DWH (T+1 batch) |
| SOTAH direktno | **NE** — eADR ne koristi SOTAH izravno | **NE** — NSCP ne koristi SOTAH izravno |
| AFFINIS | Da — DG analitika, ADR KPI | Da — opća analitika, eFTI KPI |

> **Ključno:** eADR i NSCP **dijele isti HR eFTI Gate** — nisu dva zasebna Gatea.
> eADR je specijalizirani modul koji se fokusira na DG pošiljke (eFTI1451=true)
> unutar istog eFTI okruženja.

### 16.6. Smjernice za razvoj — Mogući tehnološki stog i deployment opcije

> **Napomena:** Ovo poglavlje navodi moguće tehnologije i obrazlaže zašto bi bile prikladne.
> Ovo **nisu projektne odluke** — to su preporuke temeljene na dosadašnjim EU pilotima
> (FEDeRATED, FENIX), referentnim implementacijama (Domibus), i praksama EU država članica.
> Konačnu tehnološku odluku donosi projektni tim.

**Mogući produkcijski deployment stack (primjer):**

```
eADR Mogući Stack (primjer — savjetodavno):
═════════════════════════════════════════

┌─ FRONTEND TIER ───────────────────────────────────────────────┐
│  Reverse proxy: Nginx / HAProxy / Traefik                          │
│  Web SPA: React / Angular / Vue (TypeScript)                       │
│  Mobilna: React Native / Flutter / PWA                             │
└──────────────────────────────────────────────────────────────┘
                                    │
┌─ APPLICATION TIER ────────────────────────────────────────────┐
│  Java 17+ / Spring Boot 3.x  ILI  .NET 8+                         │
│    ├── eADR Core Service (registri, nadzori, dopuštenja)            │
│    ├── AAP Service (auth, audit, request forwarding)               │
│    ├── eFTI Integration Service (AS4 client, RoI, Search)         │
│    └── Batch/Export Service (analitika CDC, REST export)           │
│  IdP broker: Keycloak / WSO2 IS / Azure AD B2C                    │
│  Cache: Redis / Hazelcast / Infinispan                            │
│  Message broker: Kafka / RabbitMQ                                 │
│  Search: Elasticsearch / OpenSearch                               │
└──────────────────────────────────────────────────────────────┘
                                    │
┌─ eFTI GATEWAY TIER ───────────────────────────────────────────┐
│  Domibus 5.1.x (EU referentna AS4 impl.) — jedina preporuka EU    │
│    ├── Tomcat 9.x + ActiveMQ                                      │
│    ├── PMode konfiguracija (Gate-to-Gate, Gate-to-Platform)        │
│    ├── WS Plugin (SOAP/REST integracija)                          │
│    └── HSM integracija (PKCS#11) — EU zahtjev                      │
└──────────────────────────────────────────────────────────────┘
                                    │
┌─ DATA TIER ───────────────────────────────────────────────────┐
│  Operativna baza: PostgreSQL / Oracle / SQL Server                 │
│  Audit log: PG partitioning / PG+TimescaleDB / Oracle partitioning│
│  Domibus baza: MySQL 8 (Domibus default) / Oracle                 │
│  Object storage (za analitiku, opcionalno): MinIO / S3 / Azure BL │
└──────────────────────────────────────────────────────────────┘
```

**Usporedba mogućih implementacijskih pristupa prema iskustvima EU država:**

| Komponenta | Opcija A | Opcija B | Opcija C | Tko koristi što |
|-----------|---------|---------|---------|----------------|
| **Backend** | Java 17+/Spring Boot | .NET 8+ | Go/Python | BE,FI,DE,IT=Java; NL=.NET; nema poznatih Go eFTI impl. |
| **Frontend** | React | Angular | Vue | BE,FI=React; DE=Angular; FR/ES=Vue u nekim gov. app |
| **IdP** | Keycloak | WSO2 IS | Azure AD | DE,BE pilot=Keycloak; pojedini=WSO2; NL=Azure |
| **Operativna baza** | PostgreSQL | Oracle | SQL Server | BE,FI,DE=PG; IT=Oracle; NL=SQL Server |
| **Audit log** | PG partitioning | PG+TimescaleDB | Oracle part. | Ovisi o odabiru op. baze |
| **Cache** | Redis | Hazelcast | Memcached | Većina=Redis; JBoss ekosustav=Infinispan |
| **Messaging** | Kafka | RabbitMQ | ActiveMQ | DE(ATLAS)=Kafka; manje impl.=RabbitMQ |
| **Search** | Elasticsearch | OpenSearch | Solr | Većina=ES; AWS okruženja=OpenSearch |
| **AS4 Gateway** | Domibus | Holodeck B2B | Custom | **Domibus je EU preporuka i referentna impl.** |
                                    │
┌─ eFTI GATEWAY TIER ───────────────────────────────────────────┐
│  Domibus 5.1.x (eDelivery AS4 Access Point)                       │
│    ├── Tomcat 9.x (preferred) + ActiveMQ                          │
│    ├── PMode konfiguracija (Gate-to-Gate, Gate-to-Platform)        │
│    ├── WS Plugin (SOAP/REST integracija s eADR backendom)          │
│    └── HSM integracija (PKCS#11 za mTLS ključeve)                  │
└──────────────────────────────────────────────────────────────┘
                                    │
┌─ DATA TIER ───────────────────────────────────────────────────┐
│  Operativna baza: PostgreSQL 15+ / PostGIS (ili Oracle, SQL Server)│
│  Audit: PG partitioning ili PG+TimescaleDB (ili Oracle partitioning)│
│  MySQL 8 (Domibus interna baza — Domibus default)                 │
│  Object storage za analitiku: MinIO / AWS S3 / Azure Blob         │
└──────────────────────────────────────────────────────────────┘
                                    │
┌─ OBSERVABILITY TIER ──────────────────────────────────────────┐
│  Prometheus + Grafana (metrikes, alerting)                         │
│  ELK Stack (Elasticsearch + Logstash + Kibana) (logovi)           │
│  SIEM integracija (NIS2 compliance)                               │
│  HashiCorp Vault (tajne, certifikati, HSM salt)                   │
└──────────────────────────────────────────────────────────────┘
                                    │
┌─ INFRASTRUCTURE ──────────────────────────────────────────────┐
│  OS: RHEL 9 / Rocky Linux 9                                       │
│  Kontejnerizacija: Docker + Podman                                │
│  CI/CD: GitLab CI (build → test → staging → prod)                │
│  IaC: Ansible (server provisioning, deployment)                   │
│  Backup: 3-2-1-1-0 strategija (3 kopije, 2 medija, 1 off-site)   │
│  DC1: Zagreb (AKD, Savska 31) — primarni                          │
│  DC2: Kerestinec (Sv. Nedelja) — DR, standby/failover             │
│  RPO: 0 (sync) → 1h (async DR) | RTO: ~0 → 4h (site failover)   │
└──────────────────────────────────────────────────────────────┘
```

**Docker Compose za razvojno okruženje (primjer s Java/Spring Boot stackom):**

> Napomena: Ovaj primjer koristi Java/Spring Boot + PostgreSQL + TimescaleDB + Keycloak + Redis + Kafka.
> Prilagoditi prema odabranom tehnološkom stogu (npr. .NET = drugi base image, Oracle = druga baza itd.).

```yaml
# docker-compose.dev.yml — eADR razvojno okruženje
version: '3.8'
services:
  eadr-api:
    build: ./eadr-backend
    ports: ["8080:8080"]
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/eadr
      SPRING_REDIS_HOST: redis
      KAFKA_BOOTSTRAP_SERVERS: kafka:9092
      KEYCLOAK_AUTH_SERVER_URL: http://keycloak:8180
    depends_on: [postgres, redis, kafka, keycloak]

  eadr-frontend:
    build: ./eadr-frontend
    ports: ["3000:3000"]
    environment:
      REACT_APP_API_URL: http://localhost:8080/api

  domibus:
    image: domibus/domibus-tomcat-mysql:5.1
    ports: ["8443:8443"]
    volumes:
      - ./domibus-config:/opt/domibus/conf
    depends_on: [domibus-db]

  domibus-db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: domibus-dev
      MYSQL_DATABASE: domibus
    volumes:
      - domibus-data:/var/lib/mysql

  postgres:
    image: postgis/postgis:15-3.4
    environment:
      POSTGRES_DB: eadr
      POSTGRES_USER: eadr_app
      POSTGRES_PASSWORD: dev-password
    ports: ["5432:5432"]
    volumes:
      - pg-data:/var/lib/postgresql/data

  timescaledb:  # Opcija za audit log — alternativa: koristiti PG s nativnim particioniranjem
    image: timescale/timescaledb:latest-pg15
    environment:
      POSTGRES_DB: eadr_audit
      POSTGRES_USER: eadr_audit
      POSTGRES_PASSWORD: dev-password
    ports: ["5433:5432"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    ports: ["9092:9092"]
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
    depends_on: [zookeeper]

  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    ports: ["2181:2181"]
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181

  keycloak:
    image: quay.io/keycloak/keycloak:23.0
    ports: ["8180:8080"]
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
    command: start-dev

  elasticsearch:
    image: elasticsearch:8.11.0
    ports: ["9200:9200"]
    environment:
      discovery.type: single-node
      xpack.security.enabled: false

volumes:
  pg-data:
  domibus-data:
```

**Mrežna segmentacija (produkcija — primjer, prilagoditi prema odabranom stacku):**

```
┌────────────────────────────────────────────────────────────┐
│ DMZ ZONA                                                          │
│   Reverse proxy (443) — WAF — Rate limiter                        │
│   Domibus AS4 endpoint (8443/mTLS) — samo za EU Gateove           │
└────────────────────────────┬───────────────────────────────┘
                                        │ (fw: 8080, 8443)
┌────────────────────────────▼───────────────────────────────┐
│ APP ZONA                                                          │
│   Application Server (8080) — Spring Boot / .NET / drugi          │
│   Domibus Tomcat (8443, internal)                                  │
│   IdP broker (8180) — Keycloak / WSO2 / drugi                     │
│   Cache (6379) — Redis / Hazelcast                                │
│   Message broker (9092) — Kafka / RabbitMQ                        │
└────────────────────────────┬───────────────────────────────┘
                                        │ (fw: 5432, 3306)
┌────────────────────────────▼───────────────────────────────┐
│ DATA ZONA                                                         │
│   PostgreSQL / Oracle / SQL Server (5432)                          │
│   MySQL 8 / Domibus DB (3306)                                      │
│   Object storage (9000) — MinIO / S3 / Azure Blob (za analitiku)  │
└────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────┐
│ MGMT ZONA                                                         │
│   Monitoring: Prometheus+Grafana / Zabbix / Datadog                │
│   Logging: ELK Stack / Loki / Splunk                              │
│   Secrets: Vault / AWS Secrets Manager / Azure Key Vault           │
│   Deployment: Ansible / Terraform / Puppet                         │
│   CI/CD Runner: GitLab / Jenkins / Azure DevOps                    │
└────────────────────────────────────────────────────────────┘
```

**CI/CD pipeline (primjer s GitLab CI — prilagoditi prema odabranom CI/CD alatu):**

> Napomena: GitLab CI je jedan od mogućih alata. Alternative: Jenkins, Azure DevOps Pipelines,
> GitHub Actions, Bamboo. Struktura pipeline-a (build → test → security → staging → prod)
> vrijedi neovisno o alatu.

```yaml
# .gitlab-ci.yml — eADR pipeline
stages:
  - build
  - test
  - security
  - staging
  - production

build:
  stage: build
  script:
    - ./gradlew clean build -x test  # ili mvn clean package
    - docker build -t eadr-api:$CI_COMMIT_SHA .
  artifacts:
    paths: [build/libs/*.jar]

unit-tests:
  stage: test
  script:
    - ./gradlew test
    - ./gradlew jacocoTestReport  # Code coverage min. 80%
  coverage: '/Total.*?([0-9]{1,3})%/'

integration-tests:
  stage: test
  services: [postgres:15, redis:7, kafka:latest]
  script:
    - ./gradlew integrationTest

sast-scan:
  stage: security
  script:
    - trivy image eadr-api:$CI_COMMIT_SHA    # Container scanning
    - ./gradlew dependencyCheck               # OWASP dependency check
    # CVSS 7.0+ = blocking (ne ide u produkciju)

staging:
  stage: staging
  environment: staging
  script:
    - ansible-playbook deploy.yml -i inventory/staging
  only: [develop]

production:
  stage: production
  environment: production
  script:
    - ansible-playbook deploy.yml -i inventory/production
  when: manual  # Manual approval za produkciju
  only: [main]
```

**Procjena hardverskih resursa (orijentacijski — ovisi o odabranom stacku):**

| Komponenta | DEV | TEST/STAGING | PRODUKCIJA (DC1+DC2) |
|-----------|-----|-------------|---------------------|
| **App Server** | 2 vCPU, 4 GB RAM | 4 vCPU, 8 GB RAM | 2× 8 vCPU, 16 GB RAM (HA) |
| **Domibus (Gate)** | 2 vCPU, 4 GB RAM | 4 vCPU, 8 GB RAM | 2× 8 vCPU, 16 GB RAM (cluster) |
| **Operativna baza** | 2 vCPU, 4 GB RAM | 4 vCPU, 16 GB RAM | 2× 8 vCPU, 32 GB RAM (replication) |
| **Audit baza** | Dijeljeno s op. bazom | 4 vCPU, 8 GB RAM | 4 vCPU, 16 GB RAM |
| **Cache (Redis/drugi)** | 1 vCPU, 2 GB | 2 vCPU, 4 GB | 2× 2 vCPU, 4 GB (HA) |
| **Messaging (Kafka/RMQ)** | 1 inst. | 1 inst. | 3 inst. (cluster) |
| **Search (ES/OpenSearch)** | 1 node | 1 node | 3 node cluster |
| **IdP (Keycloak/drugi)** | 1 inst. | 1 inst. | 2 inst. (HA) |
| **Disk (SSD NVMe)** | 100 GB | 500 GB | 2 TB (per DC) |

> Napomena: Ove specifikacije su orijentacijske za HR obujam (~20 istovremenih inspektora).
> Stvarne potrebe odrediti temeljem load testova.

---

## 17. Proces kreiranja DG dataseta na eFTI platformi

### 17.1. Pravni okvir — ADR obveze sudionika u lancu prijevoza

Prema **ADR sporazumu (UNECE), poglavlje 1.4**, obveze pri prijevozu opasnih tvari
raspoređene su među sudionicima u lancu. **Ovo je ključno za razumijevanje zašto eFTI
platforma nije sustav za ADR compliance, već repozitorij regulatornih podataka.**

```
ADR LANAC ODGOVORNOSTI (poglavlje 1.4):

┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  POŠILJATELJ (Consignor) — ADR 1.4.2.1                              │
│  ═══════════════════════════════════════                              │
│  • Klasificira opasnu tvar (ADR Dio 2)                               │
│  • Osigurava ispravno pakiranje (ADR Dio 4)                          │
│  • Osigurava označavanje i etiketiranje (ADR Dio 5)                  │
│  • Priprema transportni dokument / DG deklaraciju (ADR 5.4.1)       │
│  • Odabire samo ODOBRENA vozila i CERTIFICIRANE vozače               │
│  • Predaje dokumentaciju vozaču PRIJE utovara                        │
│                                                                      │
│  PRIJEVOZNIK (Carrier) — ADR 1.4.2.2                                │
│  ════════════════════════════════════                                 │
│  • Provjerava da vozilo ima VALJANO ADR odobrenje                    │
│  • Provjerava da vozač ima VALJANU ADR potvrdu za klasu tereta       │
│  • Provjerava da vozilo ima svu propisanu ADR opremu                 │
│  • Provjerava potpunost prijevoznih dokumenata                       │
│  • NE prevozi ako uvjeti NISU ispunjeni                              │
│                                                                      │
│  VOZAČ (Driver) — ADR 8.2                                           │
│  ════════════════════════                                            │
│  • Posjeduje valjanu ADR potvrdu osposobljenosti                     │
│  • Nosi je pri sebi tijekom prijevoza                                │
│  • Poštuje pravila utovara/istovara/rukovanja                        │
│  • Poznaje postupke u hitnim situacijama                             │
│                                                                      │
│  UTOVARIVAČ (Loader) — ADR 1.4.3.1                                  │
│  ═════════════════════════════════                                    │
│  • Provjerava integritet pakiranja prije utovara                     │
│  • Provjerava ADR plakatiranje i oznake na vozilu                    │
│  • Provjerava kompatibilnost tereta (mixed loading rules)            │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

> **KLJUČNI ZAKLJUČAK:** ADR compliance je **operativna odgovornost sudionika u lancu**
> (pošiljatelj, prijevoznik, vozač, utovarivač) — NE eFTI platforme. eFTI platforma
> **evidentira** regulatorne informacije, a **ne provjerava** ih operativno.

### 17.2. Tko i kako kreira DG dataset na eFTI platformi

Gospodarski subjekt (pošiljatelj ili prijevoznik, ovisno o ugovornom odnosu) unosi
podatke o prijevozu opasnih tvari u **certificiranu eFTI platformu** (Uredba 2020/1056, Čl. 4).

**Proces korak po korak:**

```
═══════════════════════════════════════════════════════════════════════
FAZA 1: KLASIFIKACIJA I PRIPREMA (pošiljatelj, PRIJE eFTI unosa)
═══════════════════════════════════════════════════════════════════════

1. Pošiljatelj klasificira tvar prema ADR Dio 2:
   → UN broj (npr. UN 1203 — Benzin)
   → ADR razred (npr. 3 — Zapaljive tekućine)
   → Klasifikacijski kod (npr. F1)
   → Ambalaža skupina (npr. II — srednja opasnost)
   → Proper Shipping Name (npr. "PETROL" / "BENZIN")

2. Pošiljatelj određuje pakiranje prema ADR Dio 4:
   → Tip pakovanja (IBC, bačva, cisterna...)
   → Količina i mjerna jedinica
   → Bruto/neto masa

3. Pošiljatelj priprema transportni dokument prema ADR 5.4.1:
   → DG deklaracija (opasne tvari) — obvezan sadržaj:
     • UN broj + proper shipping name + ADR razred
     • Ambalaža skupina (I/II/III)
     • Tunnel restriction code (A/B/C/D/E)
     • Broj i opis pakiranja
     • Ukupna količina po redu
     • Ime i adresa pošiljatelja/primatelja
     • Izjava pošiljatelja o sukladnosti

═══════════════════════════════════════════════════════════════════════
FAZA 2: UNOS NA eFTI PLATFORMU (gospodarski subjekt)
═══════════════════════════════════════════════════════════════════════

4. Gospodarski subjekt (logistički operater/prijevoznik) se prijavljuje
   na certificiranu eFTI platformu

5. Unosi podatke o pošiljci (consignment):
   → Pošiljatelj (ime, adresa, ID)
   → Primatelj (ime, adresa, ID)
   → Carrier (prijevoznik + ID)
   → Ruta (polazište, odredište, tranzitne zemlje)

6. Unosi stavke robe s DG podacima:
   → UN broj: 1203
   → Proper shipping name: PETROL
   → ADR razred: 3
   → Klasifikacijski kod: F1
   → Ambalaža skupina: II
   → Pakiranje: IBC, 24.000 litara
   → Tunnel restriction: D/E
   → Transport category: 2

7. Unosi podatke o prijevozu:
   → Vozilo: reg. oznaka, VIN
   → Vozač: ime, ADR potvrda broj (referenca)
   → ADR oprema na vozilu (popis)
   → Planirani legovi (dionice)

═══════════════════════════════════════════════════════════════════════
FAZA 3: VALIDACIJA I UIL REGISTRACIJA (eFTI platforma, automatski)
═══════════════════════════════════════════════════════════════════════

8. Platforma validira podatke:
   → Format UN broja (4 znamenke, u rasponu 0001-3600)
   → ADR razred postoji (1, 2.1, 2.2, 2.3, 3, 4.1...9)
   → Ambalaža skupina (I/II/III) odgovara UN broju
   → Tunnel restriction code (A/B/C/D/E)
   → Obvezna polja popunjena (Čl. 9(1) Uredbe 2020/1056)
   → eFTI1451 = true (jer postoji barem jedna DG stavka)

   ⚠️ PLATFORMA NE VALIDIRA:
   → Ima li vozač stvarno valjanu ADR potvrdu (nema pristup HR/DE/AT registrima)
   → Ima li vozilo stvarno valjano ADR odobrenje (nema pristup CVH registru)
   → Ima li prijevoznik dopuštenje za tu klasu (nema pristup eADR registru)
   → Te provjere radi POŠILJATELJ/PRIJEVOZNIK operativno + eADR pri nadzoru

9. Platforma generira UIL:
   → UIL = gate_identifier + platform_identifier + UUID
   → Primjer: "DE-GATE-01.DE-PLAT-0042.a7b3c9d1-..."

10. Platforma uploadira u RoI svog matičnog Gatea (Čl. 11):
    → UIL
    → Identifikatori: reg. oznaka vozila, ID prijevoznika
    → eFTI1451 = true (DG indikator)
    → Status: ACTIVE

11. Podaci su sada dostupni za dohvat kroz eFTI Gate mrežu
```

### 17.3. DG podskup podataka (Dangerous Goods subset) — eFTI common data set

Prema **Delegiranoj uredbi (EU) 2024/2024**, zajednički eFTI skup podataka definira
elemente specifične za opasne tvari. Ovi elementi čine **DG podskup** koji eADR
dohvaća putem selective pull mehanizma (Čl. 8, Uredba 2024/1942):

| eFTI element | ADR referenca | Opis | Primjer |
|-------------|---------------|------|---------|
| **eFTI1451** | ADR 3.5.6, 5.4.1, 5.5.2 | Indikator opasnih tvari na vozilu | `true` |
| UN broj | ADR 5.4.1.1.1(a) | Četveroznamenkasti identifikator tvari | `1203` |
| Proper Shipping Name | ADR 5.4.1.1.1(b) | Službeni naziv tvari | `PETROL` |
| ADR razred | ADR 5.4.1.1.1(c) | Klasa opasnosti | `3` |
| Klasifikacijski kod | ADR 5.4.1.1.1(d) | Podkategorija unutar klase | `F1` |
| Ambalaža skupina | ADR 5.4.1.1.1(e) | I (visoka), II (srednja), III (niska) | `II` |
| Tip pakovanja | ADR 5.4.1.1.1(f) | Način pakiranja | `IBC` |
| Količina | ADR 5.4.1.1.1(f) | Masa/volumen po stavci | `24.000 L` |
| Tunnel restriction | ADR 8.6.4 | Kod ograničenja za tunele | `D/E` |
| Transport kategorija | ADR 1.1.3.6 | Kategorija za količinska izuzeća | `2` |
| Posebne odredbe | ADR 3.3 | Kodovi posebnih odredbi | `640D` |
| Broj/opis pakiranja | ADR 5.4.1.1.1(f) | Broj koleta i opis | `12 × IBC` |
| Plakatiranje | ADR 5.3 | Oznake na vozilu/kontejneru | `naranč. ploča 33/1203` |
| Ukupna masa/volumen | ADR 5.4.1.1.1(f) | Zbirno po pošiljci | `18.400 kg` |

#### 17.3.1. Smjernice za razvoj — DG dataset validacija i XSD

**XML Schema (XSD) za DG podskup — primjer za implementaciju:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
           xmlns:dg="urn:eu:efti:v1:dangerous-goods"
           targetNamespace="urn:eu:efti:v1:dangerous-goods">

  <xs:complexType name="DangerousGoodsType">
    <xs:sequence>
      <xs:element name="eFTI1451" type="xs:boolean" fixed="true"/>
      <xs:element name="DGItem" type="dg:DGItemType" maxOccurs="unbounded"/>
    </xs:sequence>
  </xs:complexType>

  <xs:complexType name="DGItemType">
    <xs:sequence>
      <xs:element name="UNNumber">
        <xs:simpleType>
          <xs:restriction base="xs:string">
            <xs:pattern value="[0-9]{4}"/>  <!-- 4 znamenke: 0001-3600 -->
          </xs:restriction>
        </xs:simpleType>
      </xs:element>
      <xs:element name="ProperShippingName" type="xs:string"/>
      <xs:element name="Class">
        <xs:simpleType>
          <xs:restriction base="xs:string">
            <xs:enumeration value="1"/>
            <xs:enumeration value="2.1"/>
            <xs:enumeration value="2.2"/>
            <xs:enumeration value="2.3"/>
            <xs:enumeration value="3"/>
            <xs:enumeration value="4.1"/>
            <xs:enumeration value="4.2"/>
            <xs:enumeration value="4.3"/>
            <xs:enumeration value="5.1"/>
            <xs:enumeration value="5.2"/>
            <xs:enumeration value="6.1"/>
            <xs:enumeration value="6.2"/>
            <xs:enumeration value="7"/>
            <xs:enumeration value="8"/>
            <xs:enumeration value="9"/>
          </xs:restriction>
        </xs:simpleType>
      </xs:element>
      <xs:element name="ClassificationCode" type="xs:string" minOccurs="0"/>
      <xs:element name="PackingGroup" minOccurs="0">
        <xs:simpleType>
          <xs:restriction base="xs:string">
            <xs:enumeration value="I"/>   <!-- Visoka opasnost -->
            <xs:enumeration value="II"/>  <!-- Srednja -->
            <xs:enumeration value="III"/> <!-- Niska -->
          </xs:restriction>
        </xs:simpleType>
      </xs:element>
      <xs:element name="PackagingType" type="xs:string" minOccurs="0"/>
      <xs:element name="Quantity" type="dg:QuantityType"/>
      <xs:element name="TunnelRestriction" minOccurs="0">
        <xs:simpleType>
          <xs:restriction base="xs:string">
            <xs:enumeration value="A"/>
            <xs:enumeration value="B"/>
            <xs:enumeration value="C"/>
            <xs:enumeration value="D"/>
            <xs:enumeration value="D/E"/>
            <xs:enumeration value="E"/>
            <xs:enumeration value="-"/>  <!-- Bez ograničenja -->
          </xs:restriction>
        </xs:simpleType>
      </xs:element>
      <xs:element name="TransportCategory" minOccurs="0">
        <xs:simpleType>
          <xs:restriction base="xs:integer">
            <xs:minInclusive value="0"/>
            <xs:maxInclusive value="4"/>
          </xs:restriction>
        </xs:simpleType>
      </xs:element>
      <xs:element name="SpecialProvisions" type="xs:string" minOccurs="0"/>
    </xs:sequence>
  </xs:complexType>

  <xs:complexType name="QuantityType">
    <xs:simpleContent>
      <xs:extension base="xs:decimal">
        <xs:attribute name="unit" type="xs:string" use="required"/>  <!-- kg, L, m3 -->
      </xs:extension>
    </xs:simpleContent>
  </xs:complexType>
</xs:schema>
```

**Validacijska logika u backendu (Java/Spring):**

```java
@Service
public class DGDatasetValidator {
    
    // UN brojevi: 4 znamenke, 0001-3600 (aktualni raspon)
    private static final Pattern UN_PATTERN = Pattern.compile("^\\d{4}$");
    
    // ADR razredi
    private static final Set<String> VALID_CLASSES = Set.of(
        "1", "2.1", "2.2", "2.3", "3", "4.1", "4.2", "4.3",
        "5.1", "5.2", "6.1", "6.2", "7", "8", "9"
    );
    
    // Packing groups
    private static final Set<String> VALID_PG = Set.of("I", "II", "III");
    
    // Tunnel restriction codes
    private static final Set<String> VALID_TUNNEL = Set.of(
        "A", "B", "C", "D", "D/E", "E", "-"
    );
    
    public List<String> validate(DGDataset dataset) {
        var errors = new ArrayList<String>();
        
        if (dataset.getItems() == null || dataset.getItems().isEmpty()) {
            errors.add("DG dataset must contain at least one DG item");
            return errors;
        }
        
        for (int i = 0; i < dataset.getItems().size(); i++) {
            var item = dataset.getItems().get(i);
            String prefix = "DGItem[" + i + "]: ";
            
            // UN broj validacija
            if (!UN_PATTERN.matcher(item.getUnNumber()).matches()) {
                errors.add(prefix + "Invalid UN number format: " + item.getUnNumber());
            } else {
                int un = Integer.parseInt(item.getUnNumber());
                if (un < 1 || un > 3600) {
                    errors.add(prefix + "UN number out of range (0001-3600): " + item.getUnNumber());
                }
            }
            
            // ADR razred
            if (!VALID_CLASSES.contains(item.getAdrClass())) {
                errors.add(prefix + "Invalid ADR class: " + item.getAdrClass());
            }
            
            // Packing group (opcionalan za neke klase)
            if (item.getPackingGroup() != null && !VALID_PG.contains(item.getPackingGroup())) {
                errors.add(prefix + "Invalid packing group: " + item.getPackingGroup());
            }
            
            // Tunnel restriction
            if (item.getTunnelRestriction() != null && !VALID_TUNNEL.contains(item.getTunnelRestriction())) {
                errors.add(prefix + "Invalid tunnel restriction: " + item.getTunnelRestriction());
            }
            
            // Transport kategorija (0-4)
            if (item.getTransportCategory() != null) {
                if (item.getTransportCategory() < 0 || item.getTransportCategory() > 4) {
                    errors.add(prefix + "Transport category must be 0-4");
                }
            }
            
            // Proper Shipping Name obavezno
            if (item.getProperShippingName() == null || item.getProperShippingName().isBlank()) {
                errors.add(prefix + "Proper Shipping Name is required");
            }
        }
        
        return errors;
    }
}
```

**SQL tablica za lokalno cachiranje DG dataseta:**

```sql
-- eADR lokalni cache DG dataseta dohvaćenih putem eFTI
CREATE TABLE dg_dataset_cache (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uil             VARCHAR(200) NOT NULL,
    source_gate     VARCHAR(50)  NOT NULL,    -- e.g. 'DE-GATE-01'
    fetched_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW() + INTERVAL '24 hours',
    raw_xml         TEXT         NOT NULL,    -- Izvorni AS4 payload
    parsed_json     JSONB        NOT NULL,    -- Parsirani DG podaci
    inspection_id   UUID         REFERENCES inspections(id),
    
    -- Indeksi za brze pretrage
    CONSTRAINT uil_unique_per_fetch UNIQUE (uil, fetched_at)
);

CREATE INDEX idx_dg_cache_uil ON dg_dataset_cache(uil);
CREATE INDEX idx_dg_cache_expires ON dg_dataset_cache(expires_at);
CREATE INDEX idx_dg_cache_inspection ON dg_dataset_cache(inspection_id);

-- GIN indeks za JSONB pretragu po UN broju, klasi itd.
CREATE INDEX idx_dg_cache_json ON dg_dataset_cache USING GIN (parsed_json);

-- Primjer upita: Sve pošiljke s klasa 3 (zapaljive tekućine)
SELECT uil, source_gate, 
       parsed_json->'items' AS dg_items,
       fetched_at
FROM dg_dataset_cache
WHERE parsed_json @> '{"items": [{"adrClass": "3"}]}'
  AND expires_at > NOW();

-- Automatski cleanup isteklih zapisa
CREATE OR REPLACE FUNCTION cleanup_expired_dg_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM dg_dataset_cache WHERE expires_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;
```

**Test scenariji za DG dataset:**

| # | Scenarij | Input | Očekivani rezultat |
|---|---------|-------|--------------------|
| 1 | Validan UN broj | `1203` | PASS |
| 2 | Nevalidan UN format | `12A3` | FAIL: "Invalid UN number format" |
| 3 | UN izvan raspona | `9999` | FAIL: "UN number out of range" |
| 4 | Nepoznata ADR klasa | `3.5` | FAIL: "Invalid ADR class" |
| 5 | Prazan dataset | `[]` | FAIL: "must contain at least one DG item" |
| 6 | Ispravan tunnel code | `D/E` | PASS |
| 7 | Nevalidan PG | `IV` | FAIL: "Invalid packing group" |
| 8 | Svi polja ispravna | Kompletan DG item | PASS — JSON parsiran i cachiran |
| 9 | Cross-border fetch | UIL iz DE | AS4 req → DE Gate → response → cache |
| 10 | Cache expiry | `expires_at` < NOW() | Stari zapis ne vraća se u rezultatu |

### 17.4. Kako eADR dohvaća DG dataset — selective pull mehanizam

```
═══════════════════════════════════════════════════════════════════
SCENARIJ: HR inspektor zaustavlja cisternsko vozilo s DE reg. oznakama
═══════════════════════════════════════════════════════════════════

1. IDENTIFIKACIJA
   Inspektor unosi reg. oznaku: DE-MH-4521
   eADR pretražuje HR registre → vozilo NIJE u HR registru
   → radi se o stranom ADR prijevozniku

2. eFTI PRETRAGA (Procedura B — po identifikatorima)
   eADR → HR AAP → HR Gate → Search Mechanism
     → HR RoI: pretražuje po reg. oznaci "DE-MH-4521"
     → HR RoI: nema rezultata
     → Prosljeđuje na SVE ostale Gateove (Čl. 8(4))

3. PRONALAŽENJE NA DE GATE
   DE Gate pretražuje DE RoI → PRONAĐENO:
     UIL: DE-GATE-01.DE-PLAT-0042.a7b3c9d1-...
     eFTI1451: true (opasne tvari)
     Reg. oznaka: DE-MH-4521

4. SELECTIVE PULL — DG PODSKUP
   HR Gate → DE Gate → DE platforma
   Zahtjev: "Daj mi DG podskup za UIL a7b3c9d1-..."
   (Čl. 3 — zahtjev sadrži prava pristupa: DG subset)

5. ODGOVOR — DG DATASET
   DE platforma vraća XML s DG podskupom:
   ┌──────────────────────────────────────────────────┐
   │  Pošiljka: CONSIGNMENT-DE-2026-8834              │
   │  Pošiljatelj: ChemieTrans GmbH, Hamburg           │
   │  Primatelj: Petrokemija d.d., Kutina              │
   │  Ruta: DE (Hamburg) → AT → SI → HR (Kutina)       │
   │                                                    │
   │  DG stavka 1:                                      │
   │    UN: 1203 | Naziv: PETROL | Razred: 3           │
   │    Klasif.kod: F1 | PG: II | Pakiranje: CISTERNA  │
   │    Količina: 24.000 L | Tunnel: D/E               │
   │    Transport kat.: 2                               │
   │                                                    │
   │  Vozilo: DE-MH-4521 (cisterna)                     │
   │  Vozač: Max Müller | ADR potvrda: DE-ADR-2024-1234 │
   │  Prijevoznik: SpedTrans DE GmbH                    │
   └──────────────────────────────────────────────────┘

6. eADR CROSS-VALIDACIJA

   ⚠️ ZAŠTO FIZIČKE PROVJERE AKO eFTI VEĆ VRAĆA PODATKE O VOZAČU/VOZILU?
   ────────────────────────────────────────────────────────────────────
   Podaci u koraku 5 (vozač, ADR potvrda, vozilo) su SELF-DECLARED —
   to je ono što je pošiljatelj/prijevoznik SAM upisao na eFTI platformu
   prilikom kreiranja pošiljke. eFTI platforma validira FORMAT podataka
   (UN broj = 4 znamenke, klasa postoji, polja popunjena), ali NE
   PROVJERAVA valjanost ADR potvrda ni certifikata vozila jer NEMA
   pristup nacionalnim registrima država članica (vidi korak 8, sekcija 17.2).

   Broj "DE-ADR-2024-1234" u XML-u = TVRDNJA prijevoznika, NE potvrda
   iz njemačkog registra. Može biti netočan, istekao ili izmišljen.

   HR inspektor NEMA pristup DE nacionalnom registru ADR potvrda —
   ne postoji cross-border sustav za provjeru certifikata vozača.
   ────────────────────────────────────────────────────────────────────

   Za stranog prijevoznika (nema pristup stranim registrima):
     eFTI dataset služi inspektoru kao REFERENCA — govori mu ŠTO
     treba tražiti (klasa 3, UN 1203, cisterna), a inspektor FIZIČKI
     verificira podudaraju li se tvrdnje sa stvarnošću:
       → Fizička ADR potvrda vozača: pokriva klasu 3? vrijedi?
         (plastična kartica — jedini pravno valjani dokaz za strano vozilo)
       → Fizički ADR certifikat vozila: cisterna odobrena za klasu 3?
         (metalna pločica/certifikat na vozilu)
       → Oznake na vozilu: naranč. ploča prikazuje 33/1203?
       → ADR oprema prisutna: vatrogasni aparat, zaštitna odjeća?

   Za hrvatskog prijevoznika (OIB → pristup HR registrima):
     eADR ELEKTRONIČKI provjerava u realnom vremenu:
       → Registar ADR vozača: potvrda valjana za klasu? ✓/✗
       → Registar ADR vozila: odobrenje valjano za klasu? ✓/✗
       → Registar dopuštenja: aktivno za UN 1203? ✓/✗
```

---

## 18. Primjenjivost i verzioniranje

| Stavka | Vrijednost |
|--------|-----------|
| Datum kreiranja | 2025-01-27 |
| Temelj | Provedbena uredba (EU) 2024/1942 od **5. srpnja 2024.** (objava u OJ: 20. 12. 2024., stupanje na snagu: 9. 1. 2025.) |
| Bazna uredba | Uredba (EU) 2020/1056 od 15. srpnja 2020. |
| Delegirana uredba | Delegirana uredba (EU) 2024/2024 od 26. srpnja 2024. (objava u OJ: 20. 12. 2024.) |
| Status | **OBVEZUJUĆE ZA SVE PROJEKTNE DOKUMENTE** |
| Ažurira | Svaka promjena u EU regulativi zahtijeva reviziju ovog dokumenta |

### 18.1. Smjernice za razvoj — API verzioniranje i strategija migracije

**API Versioning strategija:**

Svi REST endpointi koriste **URL path versioning** (`/api/v1/...`), a AS4 poruke
koriste **namespace versioning** (`urn:eu:efti:v1:...` → `urn:eu:efti:v2:...`).

```
Verzioniranje endpointova:
═════════════════════════

  /api/v1/search     ← Trenutna verzija (2024/1942)
  /api/v2/search     ← Buduća verzija (kad EU ažurira Uredbu)
  
  Pravila:
  • Stara verzija (v1) mora biti podržana MIN. 12 mjeseci nakon izdavanja v2
  • Deprecation header: Sunset: Sat, 01 Jan 2028 00:00:00 GMT
  • Klijent dobiva: Deprecation: true + Link: </api/v2/search>; rel="successor-version"
```

**Konfiguracija verzija u Spring Boot:**

```java
@Configuration
public class ApiVersionConfig {
    
    // Trenutna verzija API-ja
    public static final String CURRENT_API_VERSION = "v1";
    
    // Verzija eFTI specifikacije na temelju koje je implementirano
    public static final String EFTI_SPEC_VERSION = "2024/1942";
    
    // Verzija DG dataseta (Delegirana uredba)
    public static final String DG_SPEC_VERSION = "2024/2024";
    
    // Semantic versioning za interne buildove
    public static final String APP_VERSION = "1.0.0";
    
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("eADR API")
                .version(APP_VERSION)
                .description("eADR sustav — HR eFTI implementacija za DG prijevoz")
                .contact(new Contact()
                    .name("MMPI / Affinis")
                    .url("https://mmpi.gov.hr"))
                .license(new License()
                    .name("Državna licenca HR")
                    .url("https://mmpi.gov.hr/licence")));
    }
}
```

**Database migration strategija (Flyway):**

```sql
-- Flyway konvencija naziva: V{verzija}__{opis}.sql
-- V1.0.0__initial_schema.sql        ← Početna shema
-- V1.1.0__add_dg_cache.sql          ← DG cache tablica
-- V1.2.0__add_audit_hypertable.sql  ← TimescaleDB audit
-- V2.0.0__efti_v2_migration.sql     ← Kad EU izda novu Uredbu

-- Flyway konfiguracija (application.yml):
-- spring:
--   flyway:
--     enabled: true
--     locations: classpath:db/migration
--     baseline-on-migrate: true
--     validate-on-migrate: true

-- Rollback strategija: UVIJEK imati U{verzija}__{opis}.sql
-- U1.1.0__rollback_dg_cache.sql
```

**Praćenje EU regulativnih promjena:**

| Izvor | URL | Provjera |
|-------|-----|----------|
| EUR-Lex (bazna uredba) | `eur-lex.europa.eu/legal-content/HR/TXT/?uri=CELEX:32020R1056` | Kvartalno |
| EUR-Lex (provedbena) | `eur-lex.europa.eu/legal-content/HR/TXT/?uri=CELEX:32024R1942` | Kvartalno |
| EUR-Lex (delegirana) | `eur-lex.europa.eu/legal-content/HR/TXT/?uri=CELEX:32024R2024` | Kvartalno |
| EC Digital Transport | `transport.ec.europa.eu/transport-themes/logistics/efti_en` | Mjesečno |
| Domibus releases | `ec.europa.eu/digital-building-blocks/sites/display/DIGITAL/Domibus` | Mjesečno |
| eDelivery updates | `ec.europa.eu/digital-building-blocks/sites/display/DIGITAL/eDelivery` | Mjesečno |

> **Pravilo:** Svaka nova EU uredba ili izmjena postojeće zahtijeva:
> 1. Reviziju ovog dokumenta (nova verzija)
> 2. Analizu utjecaja na XSD sheme i API-je
> 3. Migracijsku skriptu (Flyway) za promjene u bazi
> 4. Ažuriranje PMode konfiguracije na Domibusu
> 5. Regression test suite na staging okruženju

---

*Napomena: Ovaj dokument je kompiliran iz izvornog teksta Uredbi objavljenih u Službenom listu*
*Europske unije (EUR-Lex). Svaki članak i uvodna izjava su provjereni prema izvornom tekstu.*
