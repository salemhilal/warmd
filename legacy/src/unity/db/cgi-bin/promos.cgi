#!/usr/bin/perl

# Displays show promos for browsing and printing

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
require "program.pl";
my $tbl = &TblInit;
$$params{sortby} = $$tbl{sortby} unless $$params{sortby};

&printHead($tbl, $cgi, $user);

my ($rows, $count) =
    sqlSelectMany($tbl, ['ProgramID', 'StartTime', 'Promo', 'PromoCode'],
		  undef, 'StartTime', {nolookup=>1});

$$tbl{shortorder} = [qw(StartTime Promo PromoCode)];
printTitles($tbl, $cgi, {debug=>$$params{debug}});
for (0..$#$rows) {
    &printRow($tbl, $cgi, $user, $$rows[$_], { edit=>0, row=>$row,
					trunc=>
	      (defined $$params{cutoff} ? undef: $CUTOFF),
	      long=> ($count == 1 ? 1 : undef) });
    $row = !$row; #alternating color for browsers that support CSS
}
