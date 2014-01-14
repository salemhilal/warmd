#!/usr/bin/perl

# A general entry form for tables.
# This should be sufficient for just about any data entry you want.

use lib "$ENV{WWW_SITE}/perl-lib";
use lib "$ENV{WWW_SITE}/perl-lib/tables";
require "sql.pl";
require "interface.pl";
require "record.pl";
require "form.pl";
require 'login.pl';
require 'search.pl';

use CGI;

my($cgi) = new CGI;
my $params = $cgi->Vars;

# initialize based on 'tbl' param
$params->{tbl} = "Artist" unless $params->{tbl};
require lc($params->{tbl}).".pl";
my $tbl = &TblInit;

$user = &loginSession($$params{session});
&printHead($tbl, $cgi, $user);

if ($$params{submit} eq 'record') { # trying to submit a new record or changes to existing

    my $alert = &verifyInput($tbl, $cgi);
    if ($$alert{search}) {
      # User entered one or more search fields, so we need to
      # lookup each one and ask user to make a choice/try again.

	print '<form action="entry.cgi" method="', $METHOD, "\">\n";
	print '<input type="hidden" name="escape" value="1" \>', "\n";
	foreach my $field (@{$$tbl{order}}) {
	    if ($$alert{fields}->{$field}) {
		&printSearchResults($tbl, $cgi, $user, $field);
	    } else {
		print '<input type="hidden" name="', $field, '" value="',
		($$params{escape} ? $$params{$field} : $cgi->escape($$params{$field})),
		"\" />\n";
	    }
	}
	print <<DONE;
<input type="hidden" name="session" value="$$params{session}" />
<input type="hidden" name="debug" value="$$params{debug}" />
<input type="hidden" name="tbl" value="$$params{tbl}" />
<input type="hidden" name="id" value="$$params{id}" />
<input type="hidden" name="submit" value="record" />
<input type="submit" value="Confirm" />
</form>
DONE
	&printFoot($tbl, $cgi, $user);
	exit(0);
    }
} elsif ($$params{debug}) {
    print "Not verifying input.<br />\n";
}

if ($$params{id}) { # edit an existing record

  print "<h1>Edit $$tbl{name}</h1>\n";
  if ($params->{submit} and not $$alert{null}) { # update the record
    my %fields;
    map { $fields{$_} = ($$params{escape} ? $cgi->unescape($$params{$_}) : $$params{$_}) } @{$$tbl{order}};

    &sqlUpdate($tbl,
	       \%fields,
	       { string=>"$$tbl{name}ID = ?",
		 values=> [ $$params{id} ] },
	       $$params{debug},
	      );
    print "<p>$$tbl{name} with ID <tt>$$params{id}</tt> updated. (<a href=\"display.cgi?session=$$params{session}&amp;tbl=$$tbl{name}\&amp;$$tbl{name}ID=$$params{id}\">View it</a>)\n";
  }
  # then fetch all the fields
  $old = &sqlSelectRow($tbl, undef,
		       { string=>"$$tbl{name}ID = ?",
		         values=> [ $$params{id} ] },
		       $$params{debug});

  # check to see if they're allowed to edit
  print "Checking for editing privileges<br />\n" if $$params{debug};
  if ($$old{UserID}) {
      &error("You need an Exec account to edit records")
	  unless &AuthGTE($$user{AuthLevel}, 'Exec')
	      or ($$old{UserID} == $$user{UserID});
  } else {
      print "Checking sub-tables for editing privileges<br />\n" if $$params{debug};
      my $edit = 0;
      foreach $field (keys %$old) {
	  if ($field =~ /(\w+)ID/) {
	      require lc($1).'.pl';
	      my $sub = &sqlSelectRow(&TblInit, undef,
				      {string=>"${1}ID = ?", values=>[$$old{"${1}ID"}]},
				      $$params{debug});
	      $edit = 1 if $$sub{UserID} == $$user{UserID};
	  }
      }
      &error("You need an Exec account to edit records")
	  unless &AuthGTE($$user{AuthLevel}, 'Exec') or $edit;
  }

} else { # enter a new record

    print "Checking editing privileges<br />\n" if $$params{debug};
    my $edit = 0;
    unless (&AuthGTE($$user{AuthLevel}, ($$tbl{authlevel} or 'Exec'))) {
	foreach $field (@{$$tbl{order}}) {
	    if ($field =~ /(\w+)ID/ and $$params{$field}) {
		require lc($1).'.pl';
		my $sub = &sqlSelectRow(&TblInit, undef,
				  {string=>"$field = ?", values=>[$$params{$field}]},
				  $$params{debug});
		$edit = 1 if $$sub{UserID} == $$user{UserID};
	    }
	}
	&error("You don't have permission to edit this record.") unless $edit;
    }

  if ($params->{submit} and not $$alert{null}) { # insert the record
    my %fields;
    map { $fields{$_} = ($$params{escape} ? $cgi->unescape($$params{$_}) : $$params{$_}) if $$params{$_} ne ''} 
      @{$$tbl{order}};
    my $id = &sqlInsert($tbl, $$params{debug}, \%fields, $$tbl{order});

    # check to see if 'search' type fields were filled in
    for(@{$$tbl{order}}) {
	if ($$tbl{fields}->{$_}->{type} eq 'search' and not $fields{$_}) {
	    print "<p class=\"error\">Error: search fields not submitted properly! Please send the url of this page to ism\@wrct.org for debugging.</p>\n";
	    last; # only need one error message
	}
    }

    # clear values now that we've submitted them.
    for (keys %fields) {
      $cgi->Delete($_) unless $$tbl{fields}->{$_}->{type} eq 'date';
      $cgi->Delete($1) if /(\w+)ID/;
    }

    print "<p>$$tbl{name} with ID <tt>$id</tt> created. (<a href=\"display.cgi?session=$$params{session}&amp;tbl=$$tbl{name}\&amp;$$tbl{name}ID=$id\">View it</a>)\n";
  }

  print "<h1>Enter a new $$tbl{name}</h1>\n";
}

# check for field params in the query string
for (keys %$params) {
  $new->{$_} = ($$params{escape} ? $cgi->unescape($$params{$_}) : $$params{$_})
    if (defined $$tbl{fields}->{$_}
	or ($$tbl{ID} and $_ eq "$$tbl{name}ID"));
}

&printInputForm($tbl, $cgi, $old, $new, $$params{debug});
&printFoot($tbl, $cgi, $user);
