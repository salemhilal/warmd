#!/bin/bash

# Generate, and self-sign certs for testing.

openssl genrsa -out ../config/server-key.pem

openssl req -new -key ../config/server-key.pem -out ../config/server-csr.pem

openssl x509 -req -in ../config/server-csr.pem -signkey ../config/server-key.pem -out ../config/server-cert.pem

# We could
# rm ../config/server-csr.pem
# but we don't really need to.
