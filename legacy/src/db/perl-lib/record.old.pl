require "sql.pl";
require "interface.pl";
require "login.pl";
require 'misc.pl';

# Functions dealing with the display of records

sub allFields {
  my ($tbl, $short, $id) = @_;

  my @ret;
  if ($short and defined $$tbl{shortorder}) {
    @ret = @{$$tbl{shortorder}};
  } else {
    @ret = @{$$tbl{order}};
  }
#  print "Order: ", join (', ', @ret), "<br />\n";
  if ($$tbl{ID}) {
    return ["$$tbl{name}ID", @ret];
  } else {
    return \@ret;
  }
}

###################################
# DESCRIPTION:   prints a row of a table
# ARGUMENTS:     $tbl - the table description
#                $cgi - the cgi query
#                $fields - hashref of field/value pairs
#                $opt - hashref of options:
#                  - edit: print editing links
#		   - nodefaults: don't print the default editing links (only if edit)
#                  - row: the row "class"
#                  - trunc: # of chars at which to truncate long values
#                  - long: long display mode (overrides all others)
#		   - url: custom url for $$tbl{name} field
# RETURN value:
# PRECONDITIONS:
###################################
sub printRow {
  my ($tbl, $cgi, $user, $fields, $opt) = @_;
  my $params = $cgi->Vars;
  my $session = $$params{session};
  $$opt{edit} = ($$user{UserID} and $$user{UserID} == $$fields{UserID}) unless $$opt{edit};
  print "printRow: editing ",
    ($$opt{edit} ? 'ON' : 'OFF'),"<br />\n" if $$params{debug};

  $$opt{url} =~ s/\*fields\.(\w+)/$$fields{$1}/;
  $$opt{url} .= "&amp;session=".$cgi->param('session') if $$opt{url};
  print "Printing custom URL: $$opt{url}, $1 = $$fields{$1}<br />\n" if $cgi->param('debug') and $$opt{url};

  if ($$opt{long}) { # "long" display is more spread out

    print "<h2>$$tbl{name} Information</h2>\n";
    print '<table border="0" cellpadding="10" cellspacing="0" width="$WIDTH">', "\n";

    foreach my $key (@{$$tbl{order}}) {
      # skip if the field is marked to be hidden and the user isn't logged in
      next if ($$tbl{fields}->{$key}->{hide} or $$tbl{fields}->{"${key}ID"}->{hide})
	    and not &AuthGTE($$user{AuthLevel}, $$tbl{authlevel} || 'User');

      my $url = (($key eq $$tbl{name} and $$opt{url}) ?
		 $$opt{url} :
		 "display.cgi?session=$session&amp;tbl=$key\&amp;${key}ID=". $$fields{"${key}ID"});
      print "link to $url<br />\n" if $$params{debug};

      my $value = $cgi->escapeHTML($$fields{$key});
      $value =~ s/^\s*$/[no value]/;
      #don't show passwords
      $value = "[password hidden]" if $$tbl{fields}->{$key}->{type} eq 'passwd';
      #wrap url types with A tags
      $value = "<a href=\"$value\" target=\"_blank\">$value</a>" if $$tbl{fields}->{$key}->{type} eq 'url';
      # format day/time fields
      if ($$tbl{fields}->{$key}->{type} eq 'dow_time') {
	print "Parsing date: $value<br />\n" if $cgi->param('debug');
	$value =~ /(\d{4})-(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d)/;
	$value = (qw(Sunday Monday Tuesday Wednesday Thursday Friday Saturday))[&DOW($1, $2, $3)]
	  . (int($4/12)? " ".($4%12 ? $4%12 : 12).":$5 PM" : " ".($4%12 ? $4%12 : 12).":$5 AM");
      }
      # add a link if field is linked to another table
      # ...also check for authlevel when providing user links
      $value = ("<a href=\"$url\">$value</a>")
	  if exists $$fields{"${key}ID"} and $key ne $$tbl{name};

      print '  <tr valign="top">
    <td><b>', $key, "</b></td>\n    <td align=\"left\"><i>$value</i></td>\n  </tr>\n";
    }
    &printLists($tbl, $cgi, $$fields{"$$tbl{name}ID"}, $user, {short=>1, edit=>$$opt{edit}});

    print "</table>\n";

    &printEditingLinks($tbl, $cgi, $user, $fields,
		       { long=>1, nodefaults=>$$opt{nodefaults},
			 edit=>$$opt{edit}, debug=>$$opt{debug} });

  } else { # default display mode is compact

    print '  <tr class="', $$opt{row}, '">
';

    foreach my $key (@{$$tbl{shortorder} or $$tbl{order}}) {
      my $value = $cgi->escapeHTML($$fields{$key});

      my $url = (($key eq $$tbl{name} and $$opt{url} ne '') ?
		 $$opt{url} :
		 "display.cgi?session=$session&amp;tbl=$key\&amp;${key}ID=". $$fields{"${key}ID"});

      #preprocess the value:

      #wrap url types with A tags
      $value = "<a href=\"$value\">$value</a>" if $value and $$tbl{fields}->{$key}->{type} eq 'url';
      #account for zero-length strings
      $value =~ s/^\s*$/[no value]/;
      #don't show passwords
      $value = "[password hidden]" if $$tbl{fields}->{$key}->{type} eq 'passwd';
      # truncate long values
      $value = (substr($value, 0, $$opt{trunc})
		. '<a href = "'.$cgi->self_url.'&amp;cutoff=1">...</a>')
	if $$opt{trunc} and length $value > $$opt{trunc};
      # add a link if field is linked to another table
      # or if it is the table name
      $value = ("<a href=\"$url\">$value</a>")
	if (exists $$fields{"${key}ID"}
	    and ($key ne 'User' or &AuthGTE($$user{AuthLevel}, $$tbl{authlevel} || 'User')));

      print "    <td>", $value, "</td>\n";
    }
    # editing links
    print "editlinks: ON", (!$$opt{nodefaults} ? " (w/defaults)" : ''), "<br />\n" if $$opt{edit} and $$params{debug};
    &printEditingLinks($tbl, $cgi, $user, $fields,
		       {nodefaults=>$$opt{nodefaults}, edit=>$$opt{edit}});

    print "  </tr>\n";
  }
}

sub RecordExists {
  my ($tbl, $where, $debug) = @_;
  print "Checking if Record Exists:<br />\n" if $debug;
  return (defined &sqlSelectRow($tbl, undef, $where, undef, $debug));
}

###################################
# DESCRIPTION:	Prints records in $tbl based on params in $cgi.
#		If only one record is returned, it will display in extended mode.
#		(An ID field is a good way to achieve this)
# ARGUMENTS:	$tbl - the table description
#		$cgi - the CGI object, with params:
#			- init: print records starting with this initial
#			- any params matching $$tbl{fields} will limit the lookup
#			  to records satisfying the value given
# RETURN value: none
# PRECONDITIONS:HTML headers should already be printed out
###################################
sub printRecords {
  my ($tbl, $cgi, $user) = @_;
  my $params = $cgi->Vars;
  my $session = $$params{session};
  my $edit = &AuthGTE($$user{AuthLevel}, $$tbl{authlevel} || 'Exec');

  my $where;
  my %fields; # isolate the field params in the CGI object

  if ($$params{init}) { # only show records starting with $$params{init}

    my $alpha = $$tbl{alpha} or $$tbl{name};
    $where = { string=>"$alpha LIKE '$$params{init}%'" };

  } elsif ($$params{search}) { # limit records by search field

    my $string = (($$params{pos} eq 'begin' or $$params{pos} eq 'exact') ? '' : '%')
      . $$params{search} .
	(($$params{pos} eq 'end' or $$params{pos} eq 'exact') ? '' : '%');
    # the funky map call just duplicates the search string
    $where = { string=>join(' OR ', map { "$_ LIKE ?" } @{$$tbl{search}}),
	       values=>[ (map {$string} @{$$tbl{search}}) ] };

  } else { # show all records (limited by fields in the cgi query)

    for (keys %$params) {
      $fields{$_} = $$params{$_}
	if (defined $tbl->{fields}->{$_}
	    or ($$tbl{ID} and $_ eq "$$tbl{name}ID"));
    }

    if (scalar keys %fields) {
      # use the fields in the CGI to build the where statement
      $where = { string=>(join ' AND ', map { "$_ = ?" } keys %fields),
		 values=>[values %fields] };
    } else {
      $where = undef;
    }
  }

  my  $extent = ($$params{extent} or $RECPERPAGE);
  print "Showing records $$params{base} to ", ($$params{base} + $extent), "<br />\n" if $$params{debug};
  my ($rows, $count) =
    &sqlSelectMany($tbl, undef, $where,
		   $$params{sortby},
		   { nolookup=>$$params{nolookup},
		     base=>(int $$params{base}),
		     extent=>$extent,
		     count=>1,
		     debug=>$$params{debug} });

  if ($count > 1) { # more than 1 record -- display in a table
    print ("<h1>$$tbl{table}",
	   ($$params{init}? " starting with $$params{init}":'')
	   ,"</h1>\n");
    &printTitles($tbl, $cgi, {edit=>$edit});
  }

  for (0..$#$rows) {
    &printRow($tbl, $cgi, $user, $$rows[$_], { edit=>$edit, row=>$row,
					trunc=>
	      (defined $$params{cutoff} ? undef: $CUTOFF),
	      long=> ($count == 1 ? 1 : undef) });
    $row = !$row; #alternating color for browsers that support CSS
  }

  if ($count > 1) { # more than 1 record -- show how many there are
    print "</table>\n";
    &printRecordNav($cgi, $#$rows + 1, $count);
  }

  print ("<p>\n<a href=\"", ($$tbl{name} eq 'Album' ? 'album' : 'entry'), # dirty hack
	 ".cgi?session=$session&amp;tbl=$$tbl{name}",
	 join('', map { "\&amp;$_=$fields{$_}" } keys %fields),
	 "\">Add a new $$tbl{name} like this</a></p>\n") if $edit;

  print "Fetching lists for one-to-many tables with $$tbl{name}ID = ",
    $rows->[0]->{"$$tbl{name}ID"}, "<br />\n" if $$params{debug};
  &printLists($tbl, $cgi, $rows->[0]->{"$$tbl{name}ID"}, $user, {edit=>$edit}) if $count == 1;

}

#####################################
# Helper functions for printRecords #
#####################################

# prints Next and Previous links when unable to display all records
sub printRecordNav {
  my ($cgi, $count, $total) = @_;
  my $params = $cgi->Vars;

  print "Records ",($$params{base}+1),"-",($$params{base}+$count)," out of $total total shown.<br />\n" if $total;
  print "No records found<br />\n" unless $total;

  if ($$params{base}) { #forward link
    $$params{base} -= $RECPERPAGE;
    print '<a href="', $cgi->self_url, "\">Previous $RECPERPAGE records</a><br />\n";
    $$params{base} += $RECPERPAGE;
  }
  my $remain = $total - ($$params{base} + $count);
#  print "$remain records remaining<br />\n";
  if ($remain) { # back link
    $$params{base} += $RECPERPAGE;
    print '<a href="', $cgi->self_url, '">Next ',
      ($RECPERPAGE >= $remain ? $remain : $RECPERPAGE) ," records</a><br />\n";
    $$params{base} -= $RECPERPAGE;
  }

}

# prints a row of TH's with the name of each column
# $opt: nosort, edit
sub printTitles {
  my ($tbl, $cgi, $opt) = @_;
  my $params = $cgi->Vars;
  my $session = $$params{session};
  my $sortby = $$params{sortby};
  my $url = $cgi->url(-local=>1, -query=>1);
  $url =~ s/&/&amp;/g;

  print ("Showing titles for table $$tbl{name}: ", 
	 join(", ", @{&allFields($tbl, 1)}),
	 "<br />\n") if $$opt{debug};

  print '<table border="1" cellspacing="0" cellpadding="2">', "\n  <tr>\n";

  foreach my $field (@{$$tbl{shortorder} or $$tbl{order}}) {
      print "$field == $$tbl{name}ID<br />\n" if $$opt{debug} and $field eq "$$tbl{name}ID";
    $field =~ s/(\w+)ID/\1s.\1/ unless $field eq "$$tbl{name}ID";
    if ($field ne $$params{sortby} and !$$opt{nosort}) {
      $$params{sortby} = $field;
      print '<th><a href="', $url, "\">$field</a></th>\n";
    } else {
      print "<th>$field</th>\n";
    }
  }
$$params{sortby} = $sortby;

  print '    <th nowrap="nowrap">Tools</th>', "\n" if $$opt{edit};
  print "  </tr>\n";

}

# prints tables for which there is a one-to-many relationship
# from the current table
sub printLists {
  my ($tbl, $cgi, $id, $user, $opt) = @_;
  #my $edit = &AuthGTE($$user{AuthLevel}, $$tbl{authlevel} || 'Exec');
  my $params = $cgi->Vars;
  my $session = $$params{session};

  print "printLists: Editing ON<br />\n" if $$params{debug} and $$opt{edit};

  foreach my $list (keys %{$$tbl{lists}}) {
      print "Auth required for $list: ", $$tbl{lists}->{$list}->{auth}, "<br />\n" if $$params{debug};
      next if (($$tbl{lists}->{$list}->{auth} and not &AuthGTE($$user{AuthLevel}, $$tbl{lists}->{$list}->{auth} || 'Exec'))
	       or $$opt{short} and $$tbl{lists}->{$list}->{type} ne 'short')
	  or ((not $$opt{short}) and $$tbl{lists}->{$list}->{type} eq 'short');

    require lc "$list.pl";
    my $subtbl = &TblInit;

    my @fields;
    # create a version of the order list without the current table's ID field
    map { push @fields, $_ unless $_ eq "$$tbl{name}ID" }
      ($$subtbl{shortorder} ? @{$$subtbl{shortorder}} : @{$$subtbl{order}});
    ($$subtbl{shortorder} ? $$subtbl{shortorder} : $$subtbl{order}) = \@fields;

    my $fields = &allFields($subtbl, 1,1);

    my ($rows, $count) =
      &sqlSelectMany($subtbl, $fields,
		     { string=>"$$subtbl{table}.$$tbl{name}ID = ?",
		       values=>[ $id ] },
		     $$subtbl{sortby},
		     { base=>0, extent=>$RECPERPAGE, nolookup=>$$params{nolookup},
		       count=>1, debug=>$$params{debug} }
		    );
    $$subtbl{ID} = 0;

    if ($count) {
      $list =~ s/^$$tbl{name}//;

      if ($$opt{short}) { # "short" view looks like a regular field row in long view
	  my @list;
	  foreach my $row (@$rows) {
	      for (@fields) {
		  push @list, ($$opt{edit} ?
			       "$$row{$_} <a href=\"delete.cgi?session=$$params{session}&amp;debug=$$params{debug}&amp;tbl=$$subtbl{name}&amp;$$subtbl{name}ID=".$$row{"$$subtbl{name}ID"}.'">'.&img('trash')."</a>" :
			       $$row{$_}) if $$row{$_};
	      }
	  }

	  print ("  <tr>\n    <td><b>${list}s</b></td>\n    <td align=\"left\">",
		 join(', ', @list), "</td>\n  </tr>\n");

      } else { # default view displays in a table

	  my $prep = ($$tbl{lists}->{$list}->{prep} or 'of');
	  print "<h2>${list}s $prep this $$tbl{name}</h2>\n";
	  &printTitles($subtbl, $cgi, { nosort=>1, short=>1} );

	  my $row;

	  for (0..$#$rows) {
	      &printRow($subtbl, $cgi, $user, $$rows[$_],
			{ row=>$row, trunc=>0, edit=>$$opt{edit},
			  url=>$$tbl{lists}->{$list}->{url} });
	      $row = !$row;
	  }
	  print "</table>\n<br />\n";
	  print "($RECPERPAGE of $count records shown. <a href=\"display.cgi?session=$session&amp;tbl=$$subtbl{name}&amp;$$tbl{name}ID=$id\">[See Full List]</a>)\n" if $RECPERPAGE < $count;

      }
    }
  }
}

1;
