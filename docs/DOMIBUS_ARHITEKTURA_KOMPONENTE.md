# Domibus Access Point — Arhitektura i ključne komponente

## 1. Pregled arhitekture

Domibus je open-source softverski pristupni punkt (Access Point) koji implementira **eDelivery AS4** profil za sigurnu razmjenu poruka između organizacija. Razvijen je pod okriljem Europske komisije (CEF — Connecting Europe Facility) i služi kao referentna implementacija za **ebMS3/AS4** protokol.

Arhitektura Domibusa organizirana je u **četiri sloja** (od vrha prema dnu):

| Sloj | Uloga |
|------|-------|
| **Backend plugini** | Sučelje prema lokalnim aplikacijama (backoffice) |
| **MSH jezgra** | Obrada poruka, sigurnost, pouzdanost, usmjeravanje |
| **AS4/ebMS3 transport** | Standardizirani protokol razmjene |
| **HTTP/TLS (mTLS)** | Mrežni transport s obostranom autentikacijom |

---

## 2. Backend plugini — sučelje prema poslovnim aplikacijama

Plugini su **jedina točka kontakta** između Domibusa i lokalnog backend sustava (npr. ERP, DMS, carinski sustav…). Svaki plugin pretvara poruke iz internog Domibus formata u format koji backend sustav razumije i obratno.

### 2.1 WS Plugin (Web Services — SOAP/REST)

- **Što radi:** Izlaže SOAP i/ili REST krajnje točke (endpoints) putem kojih backend šalje i prima poruke.
- **Kada koristiti:** Kada backend sustav može aktivno pozivati web servise ili se registrirati za callback.
- **Tok:**
  - **Slanje:** Backend poziva `submitMessage()` SOAP/REST operaciju → plugin prosljeđuje poruku MSH jezgri.
  - **Primanje:** MSH jezgra zaprimi poruku → plugin je pohranjuje → backend poziva `downloadMessage()` ili prima callback obavijest.
- **Prednosti:** Standardni protokol, laka integracija s modernim sustavima, podržava sinkroni i asinkroni rad.

### 2.2 JMS Plugin (Java Message Service — ActiveMQ)

- **Što radi:** Koristi **ActiveMQ** message broker kao posrednika između backend sustava i Domibusa.
- **Kada koristiti:** Kada backend koristi message-driven arhitekturu ili treba asinkronu, decouplanu komunikaciju.
- **Tok:**
  - **Slanje:** Backend stavlja poruku u JMS red (queue) → plugin čita red → prosljeđuje MSH jezgri.
  - **Primanje:** MSH jezgra zaprimi poruku → plugin je stavlja u izlazni JMS red → backend čita red.
- **Prednosti:** Potpuna asinkronost, otpornost na ispade (poruke čekaju u redu), prirodno load-balancing ponašanje.

### 2.3 FS Plugin (File System)

- **Što radi:** Koristi direktorije na datotečnom sustavu kao sučelje — backend stavlja datoteke u `OUT` direktorij za slanje, a prima ih iz `IN` direktorija.
- **Kada koristiti:** Kada backend nema mogućnost WS ili JMS integracije, ili za jednostavne batch scenarije.
- **Tok:**
  - **Slanje:** Backend kopira datoteku u dogovoreni `OUT` folder → plugin je detektira (polling) → prosljeđuje MSH jezgri.
  - **Primanje:** MSH jezgra zaprimi poruku → plugin zapisuje datoteku u `IN` folder → backend je pokupi.
- **Prednosti:** Najjednostavnija integracija, ne zahtijeva nikakav API od backend sustava.

### Interakcija plugina s MSH jezgrom

```
Backend sustav
      │
      ▼
┌──────────────────────────────────────────┐
│   Plugin (WS / JMS / FS)                 │
│   • Pretvara backend format → Domibus    │
│   • Pretvara Domibus format → backend    │
│   • Prijavljivanje statusa isporuke      │
└──────────────┬───────────────────────────┘
               │  Interni Domibus API
               ▼
        MSH jezgra (obrada poruke)
```

> **Napomena:** Istovremeno može biti aktivan **samo jedan plugin** po Domibus instanci (ili više uz posebnu konfiguraciju). Odabir plugina ovisi o mogućnostima backend sustava.

---

## 3. MSH jezgra (Message Service Handler)

MSH je **srce Domibusa** — prima poruke od plugina, obrađuje ih prema konfiguraciji i prosljeđuje na transport sloj (ili obratno za dolazne poruke). Sadrži šest ključnih potkomponenti:

### 3.1 PMode Manager (Processing Mode Manager)

- **Što radi:** Upravlja **PMode** konfiguracijama koje definiraju *kako* se poruke razmjenjuju između dva pristupna punkta.
- **Što PMode definira:**
  - Tko su pošiljatelj i primatelj (PartyId)
  - Koji se servis i akcija koriste (Service, Action)
  - Koja sigurnosna politika vrijedi (potpisivanje, enkripcija)
  - Koji je transport protokol (AS4)
  - Parametri pouzdanosti (retry, receipt)
  - URL udaljene strane
- **Zašto je kritičan:** Bez ispravnog PMode-a poruka se **ne može poslati ni primiti**. PMode je ekvivalent "ugovoru" između dviju strana o pravilima razmjene.
- **Interakcija:** Svaka dolazna i odlazna poruka se *matchira* s odgovarajućim PMode-om → na temelju toga se primjenjuju svi ostali moduli (Security, Routing, Retry...).

### 3.2 Security modul (mTLS + WS-Security)

Osigurava **dva sloja zaštite**:

| Sloj | Mehanizam | Što štiti |
|------|-----------|-----------|
| **Transportni** | mTLS (mutual TLS) | Autentikacija oba pristupna punkta na mrežnoj razini — svaka strana mora predočiti valjani X.509 certifikat |
| **Aplikacijski** | WS-Security (XML Signature + XML Encryption) | Potpisivanje i enkripcija samog sadržaja (payload) poruke neovisno o transportu |

- **Digitalni potpis** osigurava integritet i neporecivost (non-repudiation) — primatelj može dokazati tko je poslao poruku.
- **Enkripcija** štiti povjerljivost — samo primatelj može dešifrirati sadržaj.
- **Certifikati** se pohranjuju u Java KeyStore (JKS) ili PKCS#12 format i referencirani su iz PMode-a.

**Interakcija s PMode-om:** Security modul čita sigurnosnu politiku iz PMode-a i prema njoj primjenjuje potpis/enkripciju na odlazne poruke te verificira potpis/dekriptira dolazne.

### 3.3 Retry Engine (Mehanizam ponovnog pokušaja)

- **Što radi:** Ako slanje poruke ne uspije (mreža nedostupna, timeout, greška na udaljenoj strani), automatski pokušava ponovno prema definiranim pravilima.
- **Konfiguracijski parametri (iz PMode-a):**
  - `retryTimeout` — ukupno vremensko okno za ponovne pokušaje (npr. 24 sata)
  - `retryCount` — maksimalan broj pokušaja
  - `retryInterval` — interval između pokušaja (npr. svakih 60 sekundi)
  - `retryStrategy` — CONSTANT (fiksni intervali) ili SEND_ONCE
- **Tok:**
  1. Poruka ne uspije → Retry Engine je stavlja u red za ponovni pokušaj
  2. Nakon definiranog intervala → ponovni pokušaj slanja
  3. Ako uspije → poruka se označava kao `ACKNOWLEDGED`
  4. Ako istekne timeout → poruka ide u status `SEND_FAILURE`
- **Interakcija s Connection Monitorom:** Connection Monitor može detektirati da je udaljeni AP offline i **pauzirati** retry ciklus dok se veza ne uspostavi, čime se štede resursi.

### 3.4 Reliability modul (Pouzdanost — receipts i deduplikacija)

Osigurava da poruka **sigurno stigne** i da **nema duplikata**:

- **Receipt (potvrda primitka):**
  - Kad primatelj uspješno zaprimi poruku, šalje natrag **AS4 Receipt** signal.
  - Pošiljatelj čeka receipt → ako ga ne dobije, aktivira se Retry Engine.
  - Receipt može biti *synchronous* (u istom HTTP odgovoru) ili *asynchronous* (zasebnim pozivom).

- **Deduplikacija:**
  - Svaka poruka ima jedinstveni `MessageId`.
  - Primatelj pohranjuje ID-eve primljenih poruka.
  - Ako stigne poruka s već viđenim ID-em → odbacuje se kao duplikat.
  - Ovo je kritično jer retry mehanizam može uzrokovati da ista poruka stigne više puta.

**Interakcija:** Receipt iz Reliability modula je signal koji Retry Engine koristi da zaustavi ponovne pokušaje. Deduplikacija štiti backend od višestrukog procesiranja iste poruke.

### 3.5 Routing (PMode-based usmjeravanje)

- **Što radi:** Određuje **kamo** poruka ide na temelju PMode konfiguracije.
- **Mehanizam:**
  - Iz poruke se izvuku ključni atributi (Service, Action, PartyId pošiljatelja i primatelja)
  - PMode Manager pronađe odgovarajući PMode prema tim atributima
  - Iz PMode-a se čita **endpoint URL** udaljenog pristupnog punkta
  - Poruka se usmjerava na taj endpoint
- **Multitenancy:** U višekorisničkom (multitenant) okruženju, routing dodatno uzima u obzir domenu korisnika.
- **Interakcija s PMode Managerom:** Routing je u potpunosti ovisan o PMode-u — nema hardkodiranih ruta. Svaka promjena u PMode-u automatski mijenja routing ponašanje.

### 3.6 eArchiving (Arhiviranje i revizijski trag)

- **Što radi:** Osigurava **dugoročno čuvanje** i revizijski trag svih razmijenjenih poruka.
- **Funkcionalnosti:**
  - **Audit log:** Bilježi sve akcije — slanje, primanje, retry, greške, promjene PMode-a itd.
  - **Retention (zadržavanje):** Definira koliko dugo se poruke čuvaju prije brisanja/arhiviranja.
  - **Export:** Podržava izvoz u standardne formate za dugoročnu pohranu (npr. SIPA kompatibilno).
  - **Nepromjenjivost:** Jednom arhivirana poruka ne može se mijenjati.
- **Interakcija:** eArchiving prati **cijeli životni ciklus poruke** — od primitka u plugin do konačne isporuke backendu ili isporuke udaljenoj strani. Koristi podatke iz svih ostalih modula (Security za potpise, Reliability za statuse, Retry za pokušaje).

### 3.7 Connection Monitor (Nadzor veze)

- **Što radi:** Aktivno prati stanje veze prema udaljenim pristupnim punktovima.
- **Funkcionalnosti:**
  - **Health check:** Periodično šalje "test poruke" (AS4 UserMessage ili SignalMessage) prema partnerima da provjeri dostupnost.
  - **Smart retry:** Na temelju rezultata health checka, **inteligentno upravlja** retry ciklusima:
    - Ako je partner offline → pauzira retry (ne troši resurse bespotrebno)
    - Kad partner postane dostupan → odmah pokreće odgođene retry-eve
  - **Dashboard:** Status svih veza vidljiv je u administracijskoj konzoli.
- **Interakcija s Retry Engineom:** Connection Monitor i Retry Engine rade u **tandemu** — Monitor detektira stanje, a Engine upravlja pokušajima slanja. Monitor može "zamrznuti" Engine za nedostupnog partnera.

---

## 4. AS4/ebMS3 Transport Layer

### Što je AS4?

**AS4** (Applicability Statement 4) je profil **OASIS ebMS3** standarda, dizajniran za pouzdanu, sigurnu B2B/B2G razmjenu poruka.

### Ključne karakteristike:

| Svojstvo | Opis |
|----------|------|
| **SOAP 1.2** | Poruke se omotavaju u SOAP omotnicu |
| **MIME pakiranje** | Attachment-i se prenose kao MIME dijelovi |
| **Pull i Push** | Podržava oba modela isporuke |
| **Kompresija** | Opcijska gzip kompresija payload-a |
| **Chunking** | Podrška za prijenos velikih datoteka |

### Push vs. Pull model:

```
PUSH model:                          PULL model:
Pošiljatelj → Primatelj              Primatelj → Pošiljatelj
(pošiljatelj inicira konekciju)      (primatelj sam dolazi po poruke)

Koristi se kad oba AP-a imaju        Koristi se kad primatelj nema
javno dostupan endpoint.             javno dostupan endpoint (npr.
                                     iza firewalla bez port-forwarding-a).
```

### Interakcija s MSH jezgrom:

- MSH jezgra **konstruira** AS4 poruku prema PMode specifikaciji: dodaje SOAP zaglavlja, security tokene, pakira payload.
- AS4 sloj **ne donosi odluke** — samo enkapsulira i dekapsulira prema standardu.
- Za dolazne poruke: AS4 sloj parsira SOAP omotnicu i MIME dijelove → prosljeđuje MSH jezgri na obradu.

---

## 5. HTTP/TLS (mTLS) — mrežni transport

Najniži sloj — osigurava **siguran mrežni kanal** između dva Domibus pristupna punkta.

### Mutual TLS (mTLS):

Za razliku od standardnog TLS-a (gdje samo server predočuje certifikat), **mTLS zahtijeva certifikate od obje strane**:

```
┌───────────┐                          ┌───────────┐
│  AP "A"   │  ◄── TLS Handshake ──►  │  AP "B"   │
│           │                          │           │
│ Predočuje │                          │ Predočuje │
│ svoj cert │                          │ svoj cert │
│           │                          │           │
│ Verificira│                          │ Verificira│
│ cert od B │                          │ cert od A │
└───────────┘                          └───────────┘
```

- **Certifikati** su tipično izdani od nacionalnog CA ili eDelivery PKI infrastrukture.
- **Port:** Standardno HTTPS (443 ili custom).
- **mTLS je obvezan** za eDelivery mrežu — osigurava da samo autorizirani pristupni punkti mogu komunicirati.

### Interakcija s gornjim slojevima:

- HTTP/TLS sloj je **transparentan** za MSH jezgru i AS4 sloj — oni rade s porukama, a TLS osigurava kanal.
- **Dva odvojena sloja zaštite:** Čak i ako netko kompromitira TLS (npr. man-in-the-middle), WS-Security sloj (potpis + enkripcija na razini poruke) štiti sadržaj.

---

## 6. Cjeloviti tok poruke (end-to-end)

### Slanje poruke:

```
1. Backend sustav  ──────────►  Plugin (WS/JMS/FS)
   (priprema payload)            (pretvara u Domibus format)
                                        │
2.                                      ▼
                                 PMode Manager
                                 (pronalazi odgovarajući PMode)
                                        │
3.                                      ▼
                                 Security modul
                                 (potpisuje, enkriptira prema PMode-u)
                                        │
4.                                      ▼
                                 Routing
                                 (određuje endpoint URL iz PMode-a)
                                        │
5.                                      ▼
                                 AS4/ebMS3 sloj
                                 (konstruira SOAP + MIME poruku)
                                        │
6.                                      ▼
                                 HTTP/mTLS
                                 (šalje kroz siguran kanal)
                                        │
7.                                      ▼
                           ═══ INTERNET / MREŽA ═══
                                        │
8.                                      ▼
                                 Udaljeni AP (prima)
```

### Primanje poruke:

```
1. HTTP/mTLS prima dolaznu konekciju
   (verificira certifikat pošiljatelja)
            │
2.          ▼
   AS4/ebMS3 sloj parsira SOAP/MIME
            │
3.          ▼
   PMode Manager matchira poruku s PMode-om
            │
4.          ▼
   Security modul verificira potpis, dekriptira
            │
5.          ▼
   Reliability → provjerava duplikate, generira Receipt
            │
6.          ▼
   eArchiving → bilježi u audit log
            │
7.          ▼
   Plugin (WS/JMS/FS) → dostavlja backendu
            │
8.          ▼
   Backend sustav prima poruku
```

---

## 7. Matrica interakcija između komponenti

| Komponenta | Ovisi o | Koristi | Ovisne komponente |
|------------|---------|---------|-------------------|
| **WS/JMS/FS Plugin** | MSH interni API | PMode (za Party info) | Backend sustav |
| **PMode Manager** | XML konfiguracija | — | Security, Routing, Retry, Reliability |
| **Security** | PMode, KeyStore | Certifikati (X.509) | AS4 sloj |
| **Retry Engine** | PMode (retry config) | Connection Monitor | MSH → AS4 → HTTP |
| **Reliability** | PMode (receipt config) | MessageId registar | Retry Engine (receipt kao signal za stop) |
| **Routing** | PMode (endpoint URL) | PMode Manager | AS4 sloj |
| **eArchiving** | Baza podataka | Svi ostali moduli (audit) | Eksterni arhivski sustav |
| **Conn. Monitor** | PMode (party endpoints) | Health check poruke | Retry Engine |
| **AS4/ebMS3** | SOAP/MIME standardi | Security tokeni | HTTP/TLS |
| **HTTP/mTLS** | Certifikati | Mrežna infrastruktura | — |

---

## 8. Tipična deployment topologija za eADR/eFTI

```
┌─────────────────────────────────────────────────────────────────┐
│                      MUP / Carinski sustav                      │
│                                                                 │
│  ┌─────────────┐     ┌──────────────────┐     ┌─────────────┐  │
│  │ eADR        │◄───►│  Domibus AP      │◄───►│ eDelivery   │  │
│  │ Backend     │ WS  │  (MSH + Plugin)  │mTLS │ mreža       │  │
│  │ Aplikacija  │ ili │                  │     │ (EU AP-ovi) │  │
│  │             │ JMS │  PMode configs   │     │             │  │
│  └─────────────┘     │  Certifikati     │     └─────────────┘  │
│                      │  Audit log       │                       │
│                      └──────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

U kontekstu **eADR/eFTI** sustava:
- **Domibus AP** je gateway koji povezuje nacionalni eADR sustav s europskom eDelivery mrežom.
- **PMode** definira sve partnere (druge države članice, platforme) i pravila razmjene eFTI podataka.
- **FS Plugin** može biti dovoljan za batch razmjenu dokumenata, ali **WS Plugin** je preporučen za real-time integraciju s eADR backendom.
- **eArchiving** je posebno važan jer eFTI regulativa zahtijeva čuvanje revizijskog traga razmjena.

---

## 9. Sažetak — zašto je svaka komponenta bitna

| Komponenta | Bez nje… |
|------------|----------|
| **Plugin** | Backend ne može komunicirati s Domibusom |
| **PMode Manager** | Nema pravila razmjene — ništa ne radi |
| **Security** | Poruke nisu potpisane ni enkriptirane — neprihvatljivo za eDelivery |
| **Retry Engine** | Svaki mrežni ispad = trajno izgubljena poruka |
| **Reliability** | Nema potvrde isporuke; mogući duplikati |
| **Routing** | Poruke ne znaju kamo ići |
| **eArchiving** | Nema revizijskog traga — regulatorno neprihvatljivo |
| **Conn. Monitor** | Retry troši resurse na nedostupne partnere |
| **AS4/ebMS3** | Nema interoperabilnosti s drugim EU AP-ovima |
| **mTLS** | Neautorizirani sustavi mogu slati/primati poruke |
