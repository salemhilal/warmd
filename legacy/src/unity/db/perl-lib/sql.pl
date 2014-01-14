require 'db.pl';
require 'record.pl';

######################################################################
# sql.pl -- written by Joel Young <reverie@cmu.edu>, June 2001
#
# Wrapper functions for SQL queries.
######################################################################


###################################
# DESCRIPTION:  Inserts a single record into a table.
# ARGUMENTS:    $tbl - the table specification
#               $values - hashref of values to insert (sans ID)
# RETURN value: The ID of the record created | 1 on success | -1 on failure
###################################
sub sqlInsert {
  my($tbl, $debug, $values, $order) = @_;

  #DEBUG
  # build insert statement
  my $sql = "INSERT into $$tbl{table} ("
      . join(', ', keys %$values)
      . ($$tbl{ID} ? ", $$tbl{name}ID" : '')
      . ") values ("
      . join(', ', ('?') x values %$values)
      . ($$tbl{ID} ? ", NULL" : '')
      . ")";
  #DEBUG
  print "$sql<br />\n" if $debug;
  print "Values: '", join("', '", values %$values), "'<br />\n" if $debug;

  # execute it
  my $sth = $dbh->prepare($sql);
  $sth->execute(values %$values);
  $sth->finish();

  if ($$tbl{ID}) {
    # get the ID of the new record
    my $row = &sqlSelectRow($tbl,
			  [ "MAX($$tbl{name}ID)" ]);
    #DEBUG
    print "sqlInsert: ", join(', ',map { $_.' = '.$$row{$_}} keys %$row ), "<br />\n" if $row and $debug;
    return ($row ? $row->{"MAX($$tbl{name}ID)"} : -1);
  } else {
    return 0;
  }
}

###################################
# DESCRIPTION:  Updates records in a table.
# ARGUMENTS:    $tbl - the table specification
#               $values - hashref of values to insert (sans ID)
#               $where - a hashref of $where->{string} (with placeholders)
#                        and an array ref $where->{values}
#		$debug - switch to print debug output
#		$noexec - switch to prevent execution
# RETURN value: none
###################################
sub sqlUpdate {
  my($tbl, $values, $where, $debug, $noexec) = @_;

  # build update statement
  # if there is a timestamp, it shouldn't be modified
  my $sql = "UPDATE $$tbl{table} SET "
      . join(', ', map { if ($$values{$_}) {"$_ = ?"} else {$$values{$_} = undef; "$_ =  NULL"} } keys %$values)
      . ($$tbl{timestamp} ? ", $$tbl{timestamp} = $$tbl{timestamp}" : '')
      . ($where ? " WHERE $$where{string}" : '');
  #DEBUG
  print "$sql<br />\n" if $debug;
  print "Values: '", join("', '", values %$values, @{$$where{values}}), "'<br />\n" if $debug;

  # execute it
  my $sth = $dbh->prepare($sql);
  my @values;
  map { push @values, $_ if $_ } values %$values;
  $sth->execute(@values, @{$$where{values}}) unless $noexec;
  $sth->finish() unless $noexec;

}

###################################
# DESCRIPTION:  Deletes records in a table.
# ARGUMENTS:    $tbl - the table specification
#               $where - a hashref of $where->{string} (with placeholders)
#                        and an array ref $where->{values}
# RETURN value: none
###################################
sub sqlDelete {
  my($tbl, $where, $debug) = @_;

  # build update statement
  my $sql = "DELETE FROM $$tbl{table}"
      . ($where ? " WHERE $$where{string}" : '');
  #DEBUG
  print "$sql<br />\n" if $debug;
  print "Values: '", join("', '", @{$$where{values}}), "'<br />\n" if $debug;

  # execute it
  my $sth = $dbh->prepare($sql);
  $sth->execute(@{$$where{values}});
  $sth->finish();

}

###################################
# DESCRIPTION:  Selects a single row from a table.
# ARGUMENTS:    $tbl - the table specification
#               $fields - an arrayref of the fields (optional)
#               $where - a hashref of $where->{string} (with placeholders)
#                        and an array ref $where->{values}
#               $order - string of the fields to order on
# RETURN value: a hashref of the row returned
###################################
sub sqlSelectRow {
  my($tbl, $fields, $where, $order, $debug) = @_;
  $fields = &allFields($tbl) unless $fields;

  my $sql = "SELECT "
     . join(',', @$fields)
     . " FROM $$tbl{table}"
     .($where ? " WHERE $$where{string}" : '')
     .($order ? " ORDER BY $order" : '');
  #DEBUG
  print "$sql<br />\n" if $debug;
#  print STDERR "$sql\t(Values: '", join("', '", @{$$where{values}}), "')\n";
  print "Values: '", join("', '", @{$$where{values}}), "'<br />\n" if $debug;

  my $sth = $dbh->prepare($sql);
  $sth->execute(@{$$where{values}}) or return undef;
  my $row = $sth->fetchrow_hashref;
}

###################################
# DESCRIPTION:  Selects multiple rows from a table
# ARGUMENTS:    $tbl - the table specification
#               $fields - an arrayref of the fields (optional)
#               $where - a hashref of $where->{string} (with placeholders)
#                        and an array ref $where->{values}
#               $order - string of the fields to order on
#               $opt - hashref of options:
#                  -nolookup: indicates whether to join on all of the
#                              tables ref'd by ID fields for nicer output
#                  -base and extent: what records should be returned?
#                               (intended for limiting display of records)
#                  -count: execute a SELECT COUNT(*)
#                            (and return a $count variable)
#                  -debug: print debug output
# RETURN value: an array ref of hashrefs of the rows returned
###################################
sub sqlSelectMany {
  my($tbl, $fields, $where, $order, $opt) = @_;
#     $nolookup, $base, $extent, $debug) = @_;

  $fields = &allFields($tbl) unless defined $fields;
  my @ret;
  my $table = $$tbl{table};
  #DEBUG
#  print "Fields: ", join(',', @{$fields}), "<br />\n" if $$opt{debug};

  unless ($$opt{nolookup}) {
    # add table name to fields in $where
#    print "WHERE: $$where{string}<br />\n" if defined $where and $$opt{debug};
    foreach my $i (0..$#$fields) {
      $$where{string} =~ s/(\W+)$$fields[$i]([^.Is])/\1$$tbl{table}.$$fields[$i]\2/g if defined $where;
      $$where{string} =~ s/^$$fields[$i]([^.Is])/$$tbl{table}.$$fields[$i]\1/ if defined $where;
#      print "WHERE: $$where{string}<br />\n" if defined $where and $$opt{debug};
    }

    print "Fields: ", join(', ', @$fields), "<br />\n" if $$opt{debug};
    foreach my $i (0..$#$fields) {
#      print "$$fields[$i]!!!<br />\n" if $$opt{debug} and $$tbl{ID};
      if ($$fields[$i] =~ /(.+)ID$/ and $1 ne $$tbl{name}) {
	# if it's an ID field...
	my $tb = $1;

	# fix the ordering list
	for (0..$#{$$tbl{order}}) {
	  $$tbl{order}->[$_] = $tb
	    if ($$tbl{order}->[$_] eq $$fields[$i]);
	}
	if ($$tbl{shortorder}) {
	  for (0..$#{$$tbl{shortorder}}) {
	    $$tbl{shortorder}->[$_] = $tb
	      if ($$tbl{shortorder}->[$_] eq $$fields[$i]);
	  }
	}

	# add the join condition to the where string
#	$$where{string} .= ($$where{string} ? "\n AND " : '')
#	  . "$$tbl{table}.$$fields[$i] = ${tb}s.$$fields[$i]";

	# add the ID field to the *end* of the list
	push @$fields, "${tb}s.$$fields[$i]";
	# and replace with its corresponding "display" field
	$$fields[$i] = "${tb}s.$tb";

	# add the table to the list
	$table .= "\n LEFT JOIN ${tb}s ON ($$tbl{table}.${tb}ID = ${tb}s.${tb}ID)";

      } elsif ($$tbl{fields}->{$$fields[$i]}
	       or ($$tbl{ID} and ($$fields[$i] eq "$$tbl{name}ID"))) { # otherwise...
	# add the table name to the ID
	$$fields[$i] = "$$tbl{table}.$$fields[$i]";
      }
    }
  }
#  print "WHERE is defined!<br />\n" if defined $where and $$opt{debug};

  my $sql = ("SELECT "
	     . join(', ', @$fields)
	     . "\n FROM $table"
	     .(defined $where ? "\n WHERE $$where{string}" : '')
	     .(defined $order ? "\n ORDER BY $order" : '')
	     .((defined $$opt{base} and $$opt{extent}) ? "\n LIMIT $$opt{base}, $$opt{extent}" : ''));
  #DEBUG
  print "$sql<br />\n" if $$opt{debug};
  print "Values: '", join("', '", @{$$where{values}}), "'<br />\n" if $$opt{debug} and defined $$where{values};

  my $sth = $dbh->prepare($sql);
  return ([],0) unless $sth->execute(@{$$where{values}});

  while (my $row = $sth->fetchrow_arrayref) {
    my %hashref;
    for (0..$#$fields) {
      $$fields[$_] =~ /\.*([^\.\s]+)$/;
      $hashref{$1} = $$row[$_];
    }
    push @ret, \%hashref;
  }
  print "Returning fields: ", join(', ', keys %{$ret[0]}), "<br />\n" if $$opt{debug} and @ret > 0;

  #DEBUG
  print "Returned ", $#ret+1, " records<br />\n" if $$opt{debug};

  my $count;
  if ($$opt{count}) {# get the total record count
    $sql = "SELECT COUNT(*)\n FROM $table"
      .(defined $$where{string} ? "\n WHERE $$where{string}" : '');
    print "$sql<br />\n" if $$opt{debug};
    $sth = $dbh->prepare($sql);
    $sth->execute(@{$$where{values}});
    ($count) = $sth->fetchrow_array;
    print "Total count: $count records<br />\n" if $$opt{debug};
  }

  return (\@ret, $count);
}

1;
