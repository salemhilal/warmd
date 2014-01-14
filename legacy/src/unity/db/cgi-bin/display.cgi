#!/usr/bin/perl

# A general display form for tables.
# There's no data postprocessing on this form,
# but it makes a good starting point for other tables.

use lib "$ENV{WWW_SITE}/perl-lib";
require "sql.pl";
require "record.pl";
require "interface.pl";
require "search.pl";

use CGI;

my($cgi) = new CGI;
my $params = $cgi->Vars;

$user = &loginSession($$params{session});

# initialize based on 'tbl' param
use lib "$ENV{WWW_SITE}/perl-lib/tables";
$params->{tbl} = "Artist" unless $params->{tbl};
require lc($$params{tbl}).".pl";
my $tbl = &TblInit;
$$params{sortby} = $$tbl{sortby} unless $$params{sortby};

&printHead($tbl, $cgi, $user);

#if ($$tbl{alpha}) { # print alphabet links

#  print ("<h1>Find $$tbl{name}s starting with:</h1>\n",
#	 join (' | ',
#	       map { '<a href="'.$cgi->url.'?tbl='.$$tbl{name}.'&amp;init='.$_.'">'.$_."</a>\n" }
#	       (A..Z,0..9)),
#	"<br />\n<a href=\"",$cgi->url.'?tbl='.$$tbl{name}."\">All records</a>\n");

#}

&printRecords($tbl, $cgi, $user);
&printFoot($tbl, $cgi, $user);

