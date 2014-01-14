#!/usr/bin/perl

use lib "$ENV{WWW_SITE}/perl-lib";
use lib "$ENV{WWW_SITE}/perl-lib/tables";
require "sql.pl";
require "interface.pl";
require "record.pl";
require "form.pl";
require "const.pl";
require 'login.pl';

use CGI;

my($cgi) = new CGI;
my $params = $cgi->Vars;

$user = &loginSession($$params{session});
&printHead(undef, $cgi, $user);

&error("You need an Exec account to merge records")
  unless &AuthGTE($$user{AuthLevel}, 'Exec');

if ($$params{tbl}) { # initialize based on 'tbl' param

  require lc($$params{tbl}).".pl";
  $tbl = &TblInit;

}

if ($tbl and $$params{idfrom} and $$params{idto}) { # merge them!!

  &mergeRecords($tbl, [$cgi->param('idfrom')], $$params{idto});
  $cgi->Delete('idfrom');
  $cgi->Delete('idto');

}

# start merge form
print <<DONE;
<form action="merge.cgi" method="$METHOD">
<input type="hidden" name="session" value="$$params{session}">
DONE

# now print table select
print 'Merge records in table: <select name="tbl">',"\n";
for (@DEFAULTLIST) {
    print ("  <option value=\"$_\"",
	     ($_ eq $$params{tbl} ? ' selectED' : ''),
	     ">${_}s</option>\n");
}
print "</select>\n<p>\n\n";

# Process records to be merged
if (not ($tbl and $$params{idfrom})) { # 'from' hasn't been confirmed

  if ($tbl and $$params{searchfrom}) { # do a lookup of search field

    print "<b>Confirm the record(s) to merge from:</b>\n<p>\n";
    $$params{$$tbl{name}} =  $$params{searchfrom};
    &printSearchResults($tbl, $cgi, $user, "$$tbl{name}ID",
			{multi=>1, key=>'searchfrom', keyid=>'idfrom'});
    $$params{$$tbl{name}} = undef;

  } else { # ask user to search for 'from' record

    print ('<b>Merge records matching</b> <input type="text" name="searchfrom" value="',
	       $$params{searchfrom},'"><br />', "\n");

  }
} else { # print chosen 'from' records

  my @idfrom = ($cgi->param('idfrom'));
  print "Showing records with IDs ", join(', ',@idfrom), "<br />\n" if $$params{debug};
  my ($rows, $count) = &sqlSelectMany($tbl, &allFields($tbl, 1),
       {string=>"$$tbl{name}ID in (".join(', ', map {'?'} @idfrom).')',
	values=>[@idfrom]},
       undef, {debug=>$$params{debug}, count=>1});

  if ($count) {

    print "<b>Merge these records:</b>\n";
    &printTitles($tbl, $cgi, { nosort=>1, short=>1} );

    my $row;

    for (0..$#$rows) {
      &printRow($tbl, $cgi, $user, $$rows[$_],
		{ row=>$row, trunc=>0 });
      $row = !$row;
    }
    print "</table>\n<br />\n";
  }
  for (@idfrom) {
    print '<p class="error">Warning: you are trying to merge a record into itself. Bad Things&#8482; will happen!</p>', "\n" if $_ == $$params{idto};
    print '<input type="hidden" name="idfrom" value="', $_, "\">\n";
  }

}

# Process record to merge into
if (not ($tbl and $$params{idto})) { # 'to' hasn't been confirmed

  if ($tbl and $$params{searchto}) { # do lookup on search field

    print "<b>Confirm the record to merge into:</b>\n<p>\n";
    $$params{$$tbl{name}} =  $$params{searchto};
    &printSearchResults($tbl, $cgi, $user, "$$tbl{name}ID",
			{key=>'searchto', keyid=>'idto'});
    $$params{$$tbl{name}} = undef;

  } else { # ask user to search for 'to' record

    print ('<b>Merge the above into a record matching</b> <input type="text" name="searchto" value="',
	   $$params{searchto},'"><br />', "\n");

  }
} else { # print 'to' record

  my $row = &sqlSelectRow($tbl, &allFields($tbl, 1),
       {string=>"$$tbl{name}ID = ?",
	values=>[$$params{idto}]},
       undef, $$params{debug});

  if ($row) {
      print "<b>Merge the above records into:</b>\n";
      &printTitles($tbl, $cgi, { nosort=>1, short=>1} );
      &printRow($tbl, $cgi, $user, $row,
		    { trunc=>0 });
      print "</table>\n<br />\n";
  }
  print '<input type="hidden" name="idto" value="', $$params{idto}, "\">\n";
}


print "<p>\n<input type=\"submit\" value=\"Confirm\">\n</form>\n";
&printFoot(undef, $cgi, $user);

# this function breaks on tables with timestamps!
sub mergeRecords {
  my ($tbl, $idfrom, $idto) = @_;
  my @idfrom;
  for (@$idfrom) { push @idfrom, $_ unless $_ == $$params{idto}; }

  foreach my $dependent (@{$$tbl{dependents}}) {
    &sqlUpdate({table=>"${dependent}s"}, {"$$tbl{name}ID"=>$idto},
	       { string=>$$tbl{name}.'ID in ('.join(', ',map{'?'} @idfrom).')',
		 values=>[@idfrom] },
	       $$params{debug});
  }
  for (@idfrom) {
    &sqlDelete($tbl, { string=>$$tbl{name}.'ID in ('.join(', ',map{'?'} @idfrom).')',
		       values=>[@idfrom] }, $$params{debug});
  }

  print "Records merged!\n<p>\n";
}
