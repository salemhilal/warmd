#!/bin/bash

# Generates a self-signed certificate.
# Edit openssl.cnf before running this.

OPENSSL=`which openssl`
SSLDIR=`pwd`/../config # ../config for testing, in real deployment use
#SSLDIR=/etc/ssl
OPENSSLCONFIG='openssl.cnf'

CERTDIR=$SSLDIR
KEYDIR=$SSLDIR
#Again, for actual deployment, we want these certs to be used by any web
# service.
#CERTDIR=$SSLDIR/certs
#KEYDIR=$SSLDIR/private


CERTFILE=$CERTDIR/server-cert.pem
KEYFILE=$KEYDIR/server-key.pem

if [ ! -d $CERTDIR ]; then
  echo "$SSLDIR/certs directory doesn't exist"
  exit 1
fi

if [ ! -d $KEYDIR ]; then
  echo "$SSLDIR/private directory doesn't exist"
  exit 1
fi

if [ -f $CERTFILE ]; then
  echo "$CERTFILE already exists, won't overwrite"
  exit 1
fi

if [ -f $KEYFILE ]; then
  echo "$KEYFILE already exists, won't overwrite"
  exit 1
fi

$OPENSSL req -new -x509 -nodes -config $OPENSSLCONFIG -out $CERTFILE -keyout $KEYFILE -days 365 || exit 2
chmod 0600 $KEYFILE
echo
$OPENSSL x509 -subject -fingerprint -noout -in $CERTFILE || exit 2

