#!/usr/bin/perl

use lib "$ENV{WWW_SITE}/perl-lib";
use lib "$ENV{WWW_SITE}/perl-lib/tables";
use Time::Local;

require "sql.pl";
require 'misc.pl';

require 'album.pl';
$tbl = &TblInit;

my ($rows) = &sqlSelectMany($tbl, ['DateAdded', 'DateRemoved', 'AlbumID'],
			    {string=>'DateRemoved IS NOT NULL'}, undef,
			    {nolookup=>1, debug=>1});

foreach my $row (@$rows) {

  $startdate = $$row{DateAdded};
  $startdate =~ /(\d{4})-(\d\d)-(\d\d)/;
  $startsecs = timelocal(0,0,0, $3, $2-1, $1);
  $enddate = $$row{DateRemoved};
  $enddate =~ /(\d{4})-(\d\d)-(\d\d)/;
  $endsecs = timelocal(0,0,0, $3, $2, $1);

  #			      100 days
  if ($endsecs - $startsecs > 100 * 24 * 60 * 60) {
    $endsecs = $startsecs + 100 * 24 * 60 * 60;
    (undef, undef, undef, $d, $m, $y) = localtime($endsecs);
    $enddate = ($y+1900) .'-'. sprintf('%2.2d', $m + 1) .'-'. sprintf('%2.2d', $d);
    &sqlUpdate($tbl, {DateRemoved=>$enddate},
	       {string=>'AlbumID = ?', values=>[$$row{AlbumID}]}, 1);
  }
}
