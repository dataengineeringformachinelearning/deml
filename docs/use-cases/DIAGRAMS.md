# Use-case diagrams (minimal)

Anchors referenced from [`CANONICAL.md`](CANONICAL.md). Keep sketches tiny.

## auth
```
Browser → Firebase → Django session bind → Postgres browser_sessions
```

## status
```
Explore/Settings → BFF status adapters → FORJD status pages/probes
```

## settings
```
Settings → auth + owned status CRUD → FORJD (product fjsvc_)
```

## ingest
```
Partner/widget → BFF sealed ingest → FORJD (tenant-bound fjsvc_)
```

## billing
```
Stripe webhook / sync → Django billing → profile tier
```

## consent
```
Cookie/newsletter → Django telemetry endpoints
```

## health
```
/api/v1/health · /api/v1/ready → Django + FORJD probe
```

## widget
```
Embed → widget-telemetry → sealed FORJD ingest
```

## cors
```
Origin → Postgres registered domains (no hardcoded tenant hosts)
```

## analytics
Retired on DEML BFF (501). Partners call FORJD directly.

## integrations
Retired on DEML BFF (501). Partners call FORJD directly.

## retired
```
DEML BFF retired facade → 501  ·  Partner → FORJD with fjsvc_
```
