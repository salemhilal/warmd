#!/usr/bin/perl

# A general entry form for tables.
# There's no data preprocessing on this form,
# but it makes a good starting point for other tables.

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

# initialize based on 'tbl' param
$params->{tbl} = "Artist" unless $params->{tbl};
require lc($params->{tbl}).".pl";
my $tbl = &TblInit;

$user = &loginSession($$params{session});
&printHead($tbl, $cgi, $user);

my %fields; # isolate the field params
for (keys %$params) {
  $fields{$_} = $$params{$_}
    if (defined $tbl->{fields}->{$_}
	or ($$tbl{ID} and $_ eq "$$tbl{name}ID"));
}

#...and use them to build the where statement
my $where = join ' AND ', map { "$_ = ?" } keys %fields;

#DEBUG
print "Fields: ", join(', ', map { "$_ = $fields{$_}" } keys %fields), "<br />\n" if $$params{debug};
# sanity check to see if any fields are defined in the cgi params
&error("You must supply some fields and values to delete a record")
  unless scalar keys %fields > 0;

# fetch all the qualifying fields
($rows) = &sqlSelectMany($tbl, undef,
			 { string=>$where,
			   values=>[ values %fields ] },
			 undef, { nolookup=>$$params{nolookup},
				  debug=>$$params{debug},
			      });

# check to see if they're allowed to edit
print "Checking for editing privileges<br />\n" if $$params{debug};
foreach $row (@$rows) {
    if ($$row{UserID}) {
	&error("You need an Exec account to edit records")
	    unless &AuthGTE($$user{AuthLevel}, 'Exec')
		or ($$row{UserID} == $$user{UserID});
    } else {
	print "Checking sub-tables for editing privileges<br />\n" if $$params{debug};
	my $edit = 0;
	foreach $field (keys %$row) {
	    if ($field =~ /(\w+)ID/) {
		require lc($1).'.pl';
		my $sub = &sqlSelectRow(&TblInit, undef,
					{string=>"${1}ID = ?", values=>[$$row{"${1}ID"}]},
					$$params{debug});
		$edit = 1 if $$sub{UserID} == $$user{UserID};
	    }
	}
	&error("You need an Exec account to edit records")
	    unless &AuthGTE($$user{AuthLevel}, 'Exec') or $edit;
    }
} 


if ($$params{submit} eq 'confirm') { # delete the record

  if ($$params{dependents} eq 'delete') {
    my ($rows) = &sqlSelectMany($tbl, ["$$tbl{name}ID"],
			       { string=>$where, values=>[values %fields] },
			       undef, { nolookup=>1, debug=>$$params{debug} });

    foreach my $dep (@{$$tbl{dependents}}) {
      &sqlDelete({table=>"${dep}s"},
		 { string=> join(' OR ', map {"$$tbl{name}ID = ?"} @$rows),
		   values=> [ map {$$_{"$$tbl{name}ID"} } @$rows ] },
		 $$params{debug});
    }
  }

  &sqlDelete($tbl,
	     { string=>$where,
	       values=>[ values %fields ] },
	     $$params{debug},
	    );
  print "<p>Records deleted.\n";
} else {
  print "<h1>Really delete the following records?</h1>\n";

  # fetch all the qualifying fields
#  ($rows) = &sqlSelectMany($tbl, undef,
#		       { string=>$where,
#			 values=>[ values %fields ] },
#		       undef, { nolookup=>$$params{nolookup},
#				debug=>$$params{debug},
#			      });

  print <<DONE;
<table border="1" cellspacing="1" cellpadding="1">
  <tr>
    <th>
DONE
  print join("</th>\n    <th>", @{&allFields($tbl)}), "</th>\n  </tr>\n";
  for (@$rows){
    &printRow($tbl, $cgi, $user, $_, { cutoff=>(defined $$params{cutoff} ? undef: $CUTOFF) });
  }
  print "</table>\n";

  print ('<form action="', $cgi->url, '" method=',$METHOD,'>
', ($$tbl{dependents} ? '  <input type="checkbox" name="dependents" value="delete" checked="checked" />
   Delete every '.join(', ', @{$$tbl{dependents}}).' that links to the above records also?
  <br />' : ''), '
  <input type="submit" value="', "That's right, nuke 'em", '">
  <input type="hidden" name="submit" value="confirm">
', (map { '  <input type="hidden" name="'.$_.'" value="'.$$params{$_}."\">\n" } keys %$params),
'</form>
');
}

&printFoot($tbl, $cgi);
