require 'sql.pl';

sub printSearchForm {
  my ($tbls, $cgi, $hidden, $action) = @_;
  my $params = $cgi->Vars;
  $action = "display.cgi" unless $action;

  print "<form action=\"$action\" method=\"$METHOD\">\nFind ";

  if ($tbls and $#$tbls == 0) { # only one
    print " $$tbls[0]s\n<input type=\"hidden\" name=\"tbl\" value=\"$$tbls[0]\" />\n";
  } else {
    $tbls = [@DEFAULTLIST] unless $tbls;

    print "\n<select name=\"tbl\">\n";
    for (0..$#$tbls) {
      print ("  <option value=\"$$tbls[$_]\"",
	     ($$tbls[$_] eq $$params{tbl} ? ' selected="selected"' : ''),
	     ">$$tbls[$_]s</option>\n");
    }
    print "</select>\n";
  }

  print <<DONE;
that
<select name="pos">
DONE

  for ({n=>'include',	v=>'include'},
       {n=>'begin',	v=>'start with'},
       {n=>'end',	v=>'end with'},
       {n=>'exact',	v=>'match exactly'}) {
    print ('<option value="', $$_{n}, '"',
	   ($$_{n} eq $$params{pos} ? ' SELECTED' : ''),
	   ">$$_{v}</option>\n");
  }
  print <<DONE;
</select>
<input type="text" name="search" value="$$params{search}" accesskey="4" />
DONE

  for (keys %$hidden) {
    print '<input type="hidden" name="', $_, '" value="', $$hidden{$_}, "\" />\n";
  }

  print <<DONE;
<input type="submit" value="Search" />
<input type="hidden" name="action" value="Search" />
</form>
DONE

}

sub searchSimple {
  my ($tbl, $cgi, $extra) = @_;
  my $params = $cgi->Vars;
  my $string = $$params{search};
  my @matches;

  print "Searching ", join(', ', @{$$tbl{search}})," for '$string'<br />\n"
    if $$params{debug};
  $string = (($$params{pos} eq 'begin' or $$params{pos} eq 'exact') ? '' : '%')
    . $string .
      (($$params{pos} eq 'end' or $$params{pos} eq 'exact') ? '' : '%');

  # first look for exact matches of $string
  my ($matches, $num) =
    &sqlSelectMany($tbl,
		   [ "$$tbl{name}ID", ($$tbl{searchfield} or $$tbl{name}) ],
		   { string=>'('.join(' OR ', map { "$_ LIKE ?" } @{$$tbl{search}}).")$extra",
		     values=>[ (map {$string} @{$$tbl{search}}) ] },
		   join(', ', @{$$tbl{search}}),
		   { debug=>$$params{debug}, nolookup=>1 }
		  );
#  if ($num > 0) {
#    for (0..$#$matches) {
#      push @matches, $$matches[$_];
#    }
#  }

  return $matches; #\@matches;
}

1;
