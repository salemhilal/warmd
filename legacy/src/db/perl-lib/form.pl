require 'const.pl';
require 'search.pl';
require 'sql.pl';

sub printInputForm {
  my ($tbl, $cgi, $old, $new, $debug) = @_;
  my $params = $cgi->Vars;

#  &printInputSearches($tbl, $cgi, $old, $new, $debug);

  print '<form action="'.$cgi->url.'" method="get">
<table border="0" cellspacing="10" cellpadding="0">
';

  map { &printInputField($cgi, $tbl->{fields}->{$_}, $_,
			 $$old{$_}, $$new{$_}, {debug=>$debug}) }
    @{$tbl->{order}};

  print '  <tr>
    <td colspan="2" align="right"><input type="submit" value="',
      ($$params{id} ? 'Confirm Changes' : 'Add '.$$tbl{name}), '" />
      <input type="hidden" name="submit" value="record" />
';
  $cgi->Delete('submit'); # this sucker was causing a nasty little bug

  # save state -- print out hidden fields for every cgi param
  # not already accounted for.
  my $params = $cgi->Vars;
  foreach my $key (keys %{$params}) {
    print ('      <input type="hidden" name="', $key,
	   '" value="', $cgi->escape($$params{$key}), '" />', "\n")
      unless exists $tbl->{fields}->{$key};
  }

  print '    </td>
  </tr>
</table>
</form>
<br />
';
}

###################################
# DESCRIPTION:  Prints out the appropriate input widget for a field
# ARGUMENTS:    $field - the field object (from the fields hash of
#                        a tblDescription object)
#               $fieldname - the name of the field
#               $value - the old value (optional)
# RETURN value: none
###################################
sub printInputField {
  my ($cgi, $field, $fieldname, $old, $new, $opt) = @_;
  $new = $old unless $new;
  $new = $cgi->escapeHTML($new);
  $old = $cgi->escapeHTML($old);

#  print STDERR "printInputField: type is '$$field{type}' for field '$fieldname'\n";

  if ($field->{type} eq 'text') { # textarea field

    print ('  <tr>
    <td>', $$field{longname}, '</td>
    <td><textarea name="',$fieldname,'" rows="5" cols="50"',
	   ($field->{accesskey} ? ' accesskey="'.$field->{accesskey}.'"' : ''),
	   '>',$new,'</textarea></td>
  </tr>
');

  } elsif ($$field{type} eq 'passwd') { # Hide the password entry

    print '  <tr>
    <td>', $$field{longname}, '</td>
    <td><input type="hidden" name="', $fieldname, '" value="', $new, '" />
      <i>Login as this user and click the Change Password link.</i></td>
  </tr>
';

  } elsif ($field->{type} eq 'choose') { # choose box

    # get the table description for the field
    my $tblName = $fieldname;
    #$tblName =~ s///;
    $tblName =~ s/ID// or &error("Can't build choose box for non-ID field '$fieldname'");
    require lc "$tblName.pl";
    my $tblJoin = &TblInit;
    my $dispname = ($$tblJoin{searchfield} or $tblName);
    my $caption = $tblJoin->{fields}->{$tblName}->{longname};

    # get the values to display from our $tblJoin
#    print "Displaying $dispname field (with longname '$caption')<br />\n";
#    print STDERR "printInputField: calling sqlSelectMany(<'$$tblJoin{name}' table>, ['$fieldname', '$dispname'], undef, '$$tblJoin{sortby}', ...)\n";
    my ($rows) = &sqlSelectMany($tblJoin,
				[ $fieldname, $dispname ],
				undef, $$tblJoin{sortby},
				{nolookup=>1, debug=>$$opt{debug}});
    $dispname = $tblName;
    print "Fields: ", join(', ', keys %{$$rows[0]}), "<br />\n" if $$opt{debug};
    my $oldname, $newname;
    for (@$rows) {
      $oldname = $cgi->escapeHTML($$_{$dispname}) if $$_{$fieldname} eq $old;
      $newname = $cgi->escapeHTML($$_{$dispname}) if $$_{$fieldname} eq $new;
    }

    print '  <tr>
    <td>', $caption, '</td>
    <td>
      <select name="', $fieldname, '"',
	   ($field->{accesskey} ? ' accesskey="'.$field->{accesskey}.'"' : ''),
	   '>
        <option value="">[no value]</option>
';

    foreach my $row (@$rows) {
      print ('        <option value="',$$row{$fieldname},
	     '"',($$row{$fieldname} eq $new ? ' selected="selected"' : ''),
	     '>', $$row{$dispname}, "</option>\n");
    }

    print <<DONE;
      </select>
    </td>
  </tr>
DONE

  } elsif ($$field{type} eq 'enum') { # like a choose, but uses predefined vals

    print '  <tr>
    <td>',$$field{longname}, '</td>
    <td>
      <select name="', $fieldname, '"',
	   ($field->{accesskey} ? ' accesskey="'.$field->{accesskey}.'"' : ''),
	   '>
';
    for (@{$$field{values}}) {
      print ('        <option',
	     ($new eq $_ ? ' selected="selected"' : ''),
	     '>',$cgi->escapeHTML($_),"</option>\n");
    }
    print <<DONE;
      </select>
    </td>
  </tr>
DONE

  } elsif ($$field{type} eq 'search') { # when choose becomes unwieldy, use a search

    $fieldname =~ /(\w+)ID/;
    my $name = $1;
    my $oldname = $cgi->escapeHTML(&sqlSelectRow({table=>"${name}s"}, [$name],
				{string=>"$fieldname = ?", values=>[$old]},
				undef, $$opt{debug}) ->{$name}) if $old;
    my $newname = $cgi->escapeHTML(&sqlSelectRow({table=>"${name}s"}, [$name],
				{string=>"$fieldname = ?", values=>[$new]},
				undef, $$opt{debug}) ->{$name}) if $new;

    print '  <tr>
    <td>', $$field{longname}, '</td>
    <td><input type="hidden" name="', $fieldname, '" value="', $new, '" size="6" />
      <input type="text" name="', $name, '" value="' , $newname, '"',
	   ($field->{accesskey} ? ' accesskey="'.$field->{accesskey}.'"' : ''),
	   ' />
    </td>
  </tr>
';

  } elsif ($$field{type} eq 'date') { # date type uses plain text

    #unless ($new) { $new = `date +\%Y-\%m-\%d`; chop $new; }
    print '  <tr>
    <td>',$$field{longname}, ' (YYYY-MM-DD)</td>
    <td><input type="text" name="',$fieldname, '" size="11" maxlength="10" value="', $new, '"',
	   ($field->{accesskey} ? ' accesskey="'.$field->{accesskey}.'"' : ''),
	   ' /></td>
  </tr>
';

  } elsif ($$field{type} eq 'time') { # similar to date type

    unless ($new) {$new = `date "+%Y-%m-%d %H:%M:%S"`; chop $new }
    print '  <tr>
    <td>', $$field{longname}, '<br />(YYYY-MM-DD HH:MM:SS)</td>
    <td><input type="text" name="', $fieldname, '" size="20" maxlength="19" value="', $new, '"',
	   ($field->{accesskey} ? ' accesskey="'.$field->{accesskey}.'"' : ''),
	   ' /></td>
  </tr>
';

  } elsif ($$field{type} eq 'dow_time') { # day of week and time

    unless ($new) {$new = `date "+%Y-%m-%d %H:%M:%S"`; chop $new }
    $new =~ /(\d\d\d\d)-(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d)/;
    my $dow = &DOW($1, $2, $3);
    my $time = "$4:$5";
    print '  <tr>
    <td>', $$field{longname}, '</td>
    <td>
';
    &printDOWSelect($dow, $fieldname);
    print '<input type="text" name="',$fieldname,'_time" size="6" maxlength="5" value="', $time, '"',
	   ($field->{accesskey} ? ' accesskey="'.$field->{accesskey}.'"' : ''),
	   ' />
    </td>
  </tr>
';

  } else { # default type is a plain text field

    my $length = ' size="'.($field->{max}+2).'" maxlength="'.$field->{max}.'"'
      if $field->{max};

    print '  <tr>
    <td>', $field->{longname}, '</td>
    <td><input type="text" name="', $fieldname, '"', $length, ' value="',$new,'"',
	   ($field->{accesskey} ? ' accesskey="'.$field->{accesskey}.'"' : ''),
	   ' /></td>
  </tr>
';

  }
}

sub printInputSearches {
  my ($tbl, $cgi, $old, $new, $debug) = @_;

  my $header = 0;
  for (@{$$tbl{order}}) {
    if ($$tbl{fields}->{$_}->{type} eq 'search') {
      print "<h3>Use searches before editing other fields:</h3>\n" unless $header;
      $header = 1;
      $_ =~ /(\w+)ID/;
      &printSearchForm([$1], $cgi,
			{state=>($cgi->url(-relative=>1, -query=>1))},
			$cgi->url(-relative=>1));
#      print "<br />\n";
    }
  }
  print "<p>\n\n";
}

sub verifyInput {
  my ($tbl, $cgi, $skip) = @_;
  my $params = $cgi->Vars;
  my $alert = undef;
  print "<p>Verifying input for table $$tbl{name}<br />\n" if $$params{debug};

  print "Fields: ", join(', ', @{$$tbl{order}}), "<br />\n" if $$params{debug};
  print "(Skipping field '$skip')<br />\n" if $$params{debug} and $skip;
  # check for search fields
  for my $field (@{$$tbl{order}}) {
#    print "Field: $field<br />\n" if $$params{debug};
    # Three conditions must be met to require asking for confirmation:
    # 1. field type is 'search'
    # 2. search value is present
    # 3. field lookup doesn't produce the same value as search value

    next if $field eq $skip;

    print "Search field: $field<br />\n" if $$params{debug} and ($$tbl{fields}->{$field}->{type} eq 'search') and $field =~ /(\w+)ID/ and $$params{$1};
    if (($$tbl{fields}->{$field}->{type} eq 'search')
	and $field =~ /^(\w+)ID$/ and $$params{$1}) {
      my $name = $1;
      my $row = &sqlSelectRow({table=>"${name}s"}, [$name],
			      {string=>"$field = ?", values=>[$$params{$field}]},
			      undef, $$params{debug});
      if ($$row{$name} ne $$params{$name}) {
	$$alert{fields}->{$field} = 1;
	$$alert{search} = 1;
      }

    } elsif ($$tbl{fields}->{$field}->{type} eq 'dow_time') { # special case for dow_time

	$$params{$field} = &DOW2date($$params{"${field}_dow"}) . " ".$$params{"${field}_time"}.":00"
	    unless $$params{$field}; # there are some cases in which existing values are passed

    }
  }
  print "search fields need to be confirmed<br />\n" if $$alert{search} and $$params{debug};
  return $alert if ($$alert{search});

  # check for null values
  for (@{$$tbl{order}}) {
    if ($$tbl{fields}->{$_}->{notnull} and not $$params{$_}) {
      $$alert{null} = 1;
      $$alert{fields}->{$_} = 1;
      print "<em>$_ can't be null.</em>\n";
    }
  }
  print "null value error!<br />\n" if $$alert{null} and $$params{debug};

  return $alert;
}

###################################
# DESCRIPTION:	Looks up a search field and asks user to choose from the results
# ARGUMENTS:	$tbl - the table in which to do the lookup
#		$cgi - the cgi object
#		$user - user info
#		$field - the ID field to lookup
#		$opt - misc options hashref
#			- multi uses checkboxes instead of radio buttons
#			  in the case of multiple matches
#			- key, keyid are the cgi names for the search field
#			  (defaults to $field and $field sans ID)
# RETURN value:
# PRECONDITIONS: the cgi object should store the search string with a key
#		 of $field sans ID
###################################
sub printSearchResults {
    my ($tbl, $cgi, $user, $field, $opt, $tbls) = @_;
    my $params = $cgi->Vars;
    my $session = &encrypt($$user{UserID});

    # Why was this variable accumulating values?
    $$params{escape} = 1 if $$params{escape};

    $field =~ /(\w+)ID/;
    my $name = $1;
    $$opt{keyid} = $field unless $$opt{keyid};
    $$opt{key} = $name unless $$opt{key};

    $urlname = $cgi->escape($$params{$$opt{key}});

    unless ($$tbls{lc $name}) {
      require lc "$name.pl";
      $$tbls{lc $name} = TblInit();
    }
    $$params{search} = $$params{$$opt{key}};
    print "Printing confirmation for ".$$tbls{lc $name}->{name}."s matching params{$$opt{key}}='$$params{$$opt{key}}'<br />\n" if $$params{debug};
    $$params{pos} = 'include';
    my $matches = &searchSimple($$tbls{lc $name}, $cgi);

    if ($#$matches == -1) { # no matches

	print <<DONE;
$name starting with '$$params{$$opt{key}}' not found.<br />
If you spelled the name wrong, use the back button on your browser and enter it correctly.<br />
Otherwise, you should <a href="entry.cgi?session=$session&amp;tbl=$name&amp;$name=$urlname" target="_blank">create the record in a new window</a>, then close the window and reload this page.
<input type="hidden" name="$$opt{key}" value="$$params{$$opt{key}}" />
<input type="hidden" name="$$opt{keyid}" value="$$params{$$opt{keyid}}" />
<p>

DONE

    } elsif ($#$matches == 0) { # single match

	my $session = &encrypt($$user{UserID});
	my $match = $$matches[0];
	print <<DONE;
$name '<a href="display.cgi?session=$session&amp;tbl=$name&amp;$field=$$match{$field}">$$match{$name}</a>' found. If this is correct, just Confirm below.<br />
If not, you should <a href="entry.cgi?session=$session&amp;tbl=$name&amp;$name=$urlname" target="_blank">create the correct record in a new window</a>, then close the window and reload this page.
<input type="hidden" name="$$opt{keyid}" value="$$match{$field}" />
<input type="hidden" name="escape" value="$$params{escape}" />
<p>

DONE

    } else { # multiple matches

	print <<DONE;
Which $name did you mean?<br />
<input type="hidden" name="escape" value="$$params{escape}" />
DONE
    ;
	my $type = $$opt{multi} ? 'checkbox' : 'radio';
	for (@$matches) {
	    print <<DONE;
  <input type="$type" name="$$opt{keyid}" value="$$_{$field}" />
    <a href="display.cgi?session=$session&amp;tbl=$name&amp;$field=$$_{$field}">$$_{$name}</a><br />
DONE
    ;
	}
	print <<DONE;
<br />
If none of these are what you\'re looking for,
<a href="entry.cgi?session=$session&amp;tbl=$name&amp;$name=$urlname" target="_blank">create the correct record in a new window</a>,
then close the window and click on the Confirm button below.
<p>

DONE

    }

}

sub printSubEntries {
    my($tbl, $cgi, $debug) = @_;

    foreach my $sub (keys %{$$tbl{entrylists}}) {

	require lc "$sub.pl";
	my $subtbl = &TblInit;

	print "<h2>", $$tbl{entrylists}->{$sub}->{caption}, "</h2>\n";
	for (@{$$subtbl{order}}) {
	    &printInputField($cgi, $$subtbl{fields}->$_, $_, undef, undef,
			     {debug=>$debug, prefix=>$sub})
		unless $_ eq "$$tbl{name}ID";
	}

    }
}

1;
