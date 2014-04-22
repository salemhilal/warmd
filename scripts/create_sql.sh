#!/bin/bash

# Generates an empty db with appropriate schema for warmd
# Schema is read from schema.sql

MYSQL=`which mysql`
SCHEMA='schema.sql'

Q1="CREATE DATABASE IF NOT EXISTS warmd;"
Q2="GRANT USAGE ON *.* TO warmd@localhost IDENTIFIED BY 'test-password';"
Q3="GRANT ALL PRIVILEGES ON warmd.* TO warmd@localhost;"
Q4="FLUSH PRIVILEGES;"

SQL="${Q1}${Q2}${Q3}${Q4}"

$MYSQL -uroot -e "$SQL"

$MYSQL -u warmd -ptest-password warmd < $SCHEMA > output.tab

