#!/usr/bin/perl

# This file is deprecated. Why is it even here? -jdy

# Prints a link to the current playlist.
# Use the debug param if you want to see this as a standalone script.

use lib "/DBInterface/wrct/perl-lib";
use lib "/DBInterface/wrct/perl-lib/tables";
require 'sql.pl';

require 'playlist.pl';
$tbl = &TblInit;

# Get the current time, put it into a form for the DB to use
my ($min, $hour, $day, $mon, $year) = ((localtime time)[1..5]);
my $time = 1900+$year.'-'
  . sprintf('%2.2d', $mon+1).'-'
  . sprintf('%2.2d', $day).' '
  . sprintf('%2.2d', $hour).':'
  . sprintf('%2.2d', $min). ':00';

# We just want a playlist that's happening now.
my $row = sqlSelectRow($tbl, ['PlayListID'],
		       {string=>'StartTime <= ? AND EndTime > ?',
			values=>[$time, $time]},
		       undef, $$params{debug});

print "Content-Type: text/html\n\n";

print "<a href=\"/cgi-bin/wrct/playlist.cgi?id=$$row{PlayListID}\&mode=rows\" target=\"_parent\">View the current playlist</a>" if $row;
