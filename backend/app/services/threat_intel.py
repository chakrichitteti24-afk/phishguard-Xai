"""
Threat Intelligence — Production-grade WHOIS & SSL analysis.
Performs real WHOIS lookups and SSL certificate inspection.
Generates WHOIS indicators and SSL Trust Score.
"""
import socket
import ssl
import re
import asyncio
import json
from datetime import datetime, timezone
from urllib.parse import urlparse


# ─── WHOIS Analysis ───────────────────────────────────────────────────────────

def check_whois(url: str) -> dict:
    """
    Performs WHOIS analysis via python-whois library.
    Returns rich domain metadata and indicator scores.
    """
    default_res = {
        "available": False,
        "domain": "",
        "registrar": "Data unavailable",
        "creation_date": "Data unavailable",
        "expiration_date": "Data unavailable",
        "updated_date": "Data unavailable",
        "domain_age_days": 0,
        "is_recent_domain": False,
        "name_servers": [],
        "dnssec": "Data unavailable",
        "status": [],
        "whois_score": 0,
        "indicators": [],
        "message": "WHOIS lookup failed or timed out.",
    }

    try:
        parsed = urlparse(url if "://" in url else "http://" + url)
        domain = (parsed.netloc or parsed.path.split("/")[0]).split(":")[0].lower()

        # Remove www. prefix
        if domain.startswith("www."):
            domain = domain[4:]

        default_res["domain"] = domain

        import whois as whois_lib
        w = whois_lib.whois(domain)

        if not w or not w.domain_name:
            default_res["message"] = "Domain not found in WHOIS registry."
            return default_res

        # Creation date
        creation_date = w.creation_date
        if isinstance(creation_date, list):
            creation_date = creation_date[0]

        # Expiration date
        expiration_date = w.expiration_date
        if isinstance(expiration_date, list):
            expiration_date = expiration_date[0]

        # Updated date
        updated_date = w.updated_date
        if isinstance(updated_date, list):
            updated_date = updated_date[0]

        # Compute domain age
        domain_age_days = 0
        is_recent = False
        creation_str = "Data unavailable"
        expiration_str = "Data unavailable"
        updated_str = "Data unavailable"

        if creation_date and isinstance(creation_date, datetime):
            if creation_date.tzinfo is None:
                creation_date = creation_date.replace(tzinfo=timezone.utc)
            domain_age_days = (datetime.now(timezone.utc) - creation_date).days
            creation_str = creation_date.strftime("%Y-%m-%d")
            is_recent = domain_age_days < 30

        if expiration_date and isinstance(expiration_date, datetime):
            expiration_str = expiration_date.strftime("%Y-%m-%d")

        if updated_date and isinstance(updated_date, datetime):
            updated_str = updated_date.strftime("%Y-%m-%d")

        # Name servers
        ns_list = w.name_servers or []
        if isinstance(ns_list, str):
            ns_list = [ns_list]
        ns_list = [str(ns).lower() for ns in ns_list][:4]

        # DNSSEC
        dnssec = getattr(w, "dnssec", "unsigned")
        if isinstance(dnssec, list):
            dnssec = dnssec[0] if dnssec else "unsigned"
        dnssec = str(dnssec).lower()

        # Domain status
        status = w.status or []
        if isinstance(status, str):
            status = [status]
        status = [str(s).split(" ")[0] for s in status][:5]

        # ── WHOIS Scoring ──────────────────────────────────────────────────
        whois_score = 0
        indicators = []

        if is_recent:
            whois_score += 40
            indicators.append({
                "type": "CRITICAL",
                "name": "Newly Registered Domain",
                "detail": f"Domain registered only {domain_age_days} days ago — high phishing risk."
            })
        elif domain_age_days < 180:
            whois_score += 20
            indicators.append({
                "type": "WARNING",
                "name": "Young Domain",
                "detail": f"Domain is only {domain_age_days} days old — moderate risk."
            })
        elif domain_age_days > 730:
            indicators.append({
                "type": "INFO",
                "name": "Established Domain",
                "detail": f"Domain is {domain_age_days} days old — generally trusted."
            })

        if dnssec in ("unsigned", "false", "no", "0", "none", ""):
            whois_score += 10
            indicators.append({
                "type": "WARNING",
                "name": "DNSSEC Not Enabled",
                "detail": "Domain lacks DNSSEC protection — vulnerable to DNS spoofing."
            })

        registrar = str(w.registrar or "Unknown")
        free_registrars = ["freenom", "dot.tk", "dot.ml", "dot.ga", "dot.cf"]
        if any(fr in registrar.lower() for fr in free_registrars):
            whois_score += 20
            indicators.append({
                "type": "WARNING",
                "name": "Free Registrar Detected",
                "detail": f"Registrar '{registrar}' provides free domains — high phishing abuse rate."
            })

        whois_score = min(100, whois_score)

        return {
            "available": True,
            "domain": domain,
            "registrar": registrar,
            "creation_date": creation_str,
            "expiration_date": expiration_str,
            "updated_date": updated_str,
            "domain_age_days": domain_age_days,
            "is_recent_domain": is_recent,
            "name_servers": ns_list,
            "dnssec": dnssec,
            "status": status,
            "whois_score": whois_score,
            "indicators": indicators,
            "message": "WHOIS lookup successful.",
        }

    except Exception as e:
        default_res["message"] = f"WHOIS lookup failed: {type(e).__name__}"
        return default_res


# ─── SSL Analysis ─────────────────────────────────────────────────────────────

def check_ssl(url: str) -> dict:
    """
    Performs real SSL certificate analysis.
    Returns cert metadata, validity, TLS version, and trust score.
    """
    default_res = {
        "has_ssl": False,
        "is_https": False,
        "issuer": "Data unavailable",
        "issuer_org": "Data unavailable",
        "subject": "Data unavailable",
        "valid_from": "Data unavailable",
        "valid_to": "Data unavailable",
        "days_to_expiry": 0,
        "is_expired": True,
        "is_self_signed": True,
        "tls_version": "Data unavailable",
        "ssl_score": 0,
        "indicators": [],
        "message": "SSL inspection failed.",
    }

    try:
        parsed = urlparse(url if "://" in url else "http://" + url)
        hostname = (parsed.netloc or parsed.path.split("/")[0]).split(":")[0]
        is_https = parsed.scheme == "https"

        default_res["is_https"] = is_https

        if not is_https:
            default_res["message"] = "URL does not use HTTPS."
            default_res["indicators"].append({
                "type": "CRITICAL",
                "name": "No HTTPS",
                "detail": "Site uses plain HTTP — all traffic is unencrypted and can be intercepted."
            })
            default_res["ssl_score"] = 40  # Penalize for no HTTPS
            return default_res

        # Connect and retrieve certificate
        ctx = ssl.create_default_context()
        # We want to inspect cert even if invalid
        ctx_permissive = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
        ctx_permissive.check_hostname = False
        ctx_permissive.verify_mode = ssl.CERT_NONE

        tls_version = "Unknown"
        cert_dict = {}
        self_signed = True

        with socket.create_connection((hostname, 443), timeout=5.0) as sock:
            with ctx_permissive.wrap_socket(sock, server_hostname=hostname) as ssock:
                tls_version = ssock.version() or "Unknown"
                cert_bin = ssock.getpeercert(binary_form=True)
                # Also try to get the decoded cert dict
                try:
                    # Re-connect with validation to get full dict
                    with socket.create_connection((hostname, 443), timeout=5.0) as sock2:
                        with ctx.wrap_socket(sock2, server_hostname=hostname) as ssock2:
                            cert_dict = ssock2.getpeercert()
                            self_signed = False
                except Exception:
                    # Cert validation failed → likely self-signed
                    self_signed = True

        # Parse cert dict (from validated connection)
        if cert_dict:
            # Issuer
            issuer_raw = dict(x[0] for x in cert_dict.get("issuer", []))
            issuer_org = issuer_raw.get("organizationName", "Unknown")
            issuer_cn = issuer_raw.get("commonName", issuer_org)

            # Subject
            subject_raw = dict(x[0] for x in cert_dict.get("subject", []))
            subject_cn = subject_raw.get("commonName", "Unknown")

            # Validity dates
            valid_from_str = cert_dict.get("notBefore", "")
            valid_to_str = cert_dict.get("notAfter", "")

            valid_from_dt = None
            valid_to_dt = None
            is_expired = True
            days_to_expiry = 0

            try:
                valid_from_dt = datetime.strptime(valid_from_str, "%b %d %H:%M:%S %Y %Z")
                valid_to_dt = datetime.strptime(valid_to_str, "%b %d %H:%M:%S %Y %Z")
                now = datetime.utcnow()
                is_expired = now > valid_to_dt
                days_to_expiry = max(0, (valid_to_dt - now).days)
            except Exception:
                pass

            valid_from = valid_from_dt.strftime("%Y-%m-%d") if valid_from_dt else "Data unavailable"
            valid_to = valid_to_dt.strftime("%Y-%m-%d") if valid_to_dt else "Data unavailable"

        else:
            # Self-signed or validation failed — minimal info
            issuer_org = "Self-Signed / Unverified"
            issuer_cn = "Unknown"
            subject_cn = hostname
            valid_from = "Data unavailable"
            valid_to = "Data unavailable"
            is_expired = True
            days_to_expiry = 0

        # ── SSL Scoring ────────────────────────────────────────────────────
        ssl_score = 0
        indicators = []

        if self_signed:
            ssl_score += 40
            indicators.append({
                "type": "CRITICAL",
                "name": "Self-Signed Certificate",
                "detail": "Certificate not issued by a trusted Certificate Authority. High phishing risk."
            })

        if is_expired:
            ssl_score += 30
            indicators.append({
                "type": "CRITICAL",
                "name": "Expired SSL Certificate",
                "detail": "SSL certificate has expired. Site may not be legitimate."
            })
        elif days_to_expiry < 7:
            ssl_score += 15
            indicators.append({
                "type": "WARNING",
                "name": f"SSL Expiring Soon ({days_to_expiry} days)",
                "detail": "Certificate expires very soon — site may have been abandoned."
            })

        if tls_version in ("SSLv2", "SSLv3", "TLSv1", "TLSv1.1"):
            ssl_score += 20
            indicators.append({
                "type": "WARNING",
                "name": f"Outdated TLS Version ({tls_version})",
                "detail": f"Using deprecated {tls_version} — known vulnerabilities exist."
            })

        ssl_score = min(100, ssl_score)

        # If cert is valid and modern → give positive signals
        if not self_signed and not is_expired:
            indicators.append({
                "type": "INFO",
                "name": "Valid SSL Certificate",
                "detail": f"Certificate issued by '{issuer_org}'. Expires in {days_to_expiry} days."
            })

        return {
            "has_ssl": True,
            "is_https": True,
            "issuer": issuer_cn,
            "issuer_org": issuer_org,
            "subject": subject_cn,
            "valid_from": valid_from,
            "valid_to": valid_to,
            "days_to_expiry": days_to_expiry,
            "is_expired": is_expired,
            "is_self_signed": self_signed,
            "tls_version": tls_version,
            "ssl_score": ssl_score,
            "indicators": indicators,
            "message": "SSL analysis complete.",
        }

    except socket.timeout:
        default_res["message"] = "SSL connection timed out."
        return default_res
    except ConnectionRefusedError:
        default_res["message"] = "SSL port 443 connection refused — site may not support HTTPS."
        return default_res
    except Exception as e:
        default_res["message"] = f"SSL analysis error: {type(e).__name__}: {str(e)[:80]}"
        return default_res


# ─── Async Orchestrator ────────────────────────────────────────────────────────

async def gather_threat_intel(url: str) -> dict:
    """Concurrently gathers WHOIS and SSL intelligence."""
    loop = asyncio.get_event_loop()

    whois_task = loop.run_in_executor(None, check_whois, url)
    ssl_task = loop.run_in_executor(None, check_ssl, url)

    whois_res, ssl_res = await asyncio.gather(whois_task, ssl_task)

    return {
        "whois": whois_res,
        "ssl": ssl_res,
    }
