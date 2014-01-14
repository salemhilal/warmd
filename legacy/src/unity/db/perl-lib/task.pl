require 'sql.pl';
require 'interface.pl';
 
sub printUserInfo {
  my ($cgi, $user) = @_;
  my $params = $cgi->Vars;

  my $sth = $dbh->prepare("SELECT count(*) AS reviewcount FROM Reviews,Users where Reviews.UserID=Users.UserID and Users.User=? and Reviews.Time > ?");
  $sth->execute($$user{User}, $REVIEWS_YEAR.$REVIEWS_MONTH.$REVIEWS_DAY.'000000');
 # $sth->execute();
  my $row = $sth->fetchrow_hashref;
  print "<h2>Welcome, <a href=\"display.cgi?tbl=User&amp;UserID=$$user{UserID}\">$$user{WRCTUser}</a></h2>\n";
  &printStartData;
  print <<DONE;
<TABLE BORDER=0 WIDTH=100%><TR><TD ALIGN=CENTER>Name: <b>$$user{FName} $$user{LName}</b><br />
DJ Name: <b>$$user{DJName}</b><br /></TD>
<TD ALIGN=CENTER><SMALL>Reviews this Semester</SMALL><BR>
<B>$$row{reviewcount}</B> <SMALL>(since $REVIEWS_MONTH/$REVIEWS_DAY/$REVIEWS_YEAR)</SMALL></TD></TR></TABLE>
<p>
<a href="http://kpasswd.wrct.org/">Change Password</a> | <A HREF="/logout/">Log out</A>
</p>

DONE
  &printEndData;
}

sub printPlaylists {
  my ($cgi, $user) = @_;

  my $params = $cgi->Vars;
  my $debug = '&amp;debug=1' if $$params{debug};

  require "program.pl";
  my $tblProgram = &TblInit;
  require "playlist.pl";
  my $tblPlaylist = &TblInit;

  my ($programs) = &sqlSelectMany($tblProgram, undef,
				  { string=>'UserID = ?', values=>[$$user{UserID}] },
				  $$tblProgram{sortby},
				  { nolookup=>1, debug=>$$params{debug} });

  print "<h2>--Programs--</h2>\n\n";
  print "Index of last row is $#$programs<br />\n" if $$params{debug};
  for (@$programs) { # print a list of tasks for each of the user's programs

    my $current; # show a link to the current playlist if there's one for today
    &printStartData;
    print "<h3><a href=\"display.cgi?session=$$params{session}&amp;tbl=Program&amp;ProgramID=$$_{ProgramID}\">$$_{Program}</a></h3>\n";
    print "<a href=\"playlist.cgi?session=$$params{session}&amp;action=New+Playlist&amp;id=$$_{ProgramID}$debug\">Start a new playlist</a><br />\n";

    my ($lists) = &sqlSelectMany($tblPlaylist, ['StartTime','PlayListID'],
				 { string=>'StartTime > ? AND ProgramID = ?',
				   values=>[`date +%Y`."-01-01", $$_{ProgramID}] },
				 'StartTime DESC',
				 { nolookup=>1, debug=>$$params{debug} });

    if ($#$lists >= 0) { # if there are existing playlists, print a popup selector
      print <<DONE;
<!--p-->
<form action="playlist.cgi" method="$METHOD">
<input type="hidden" name="debug" value="$$params{debug}" />
<input type="hidden" name="session" value="$$params{session}" />
<select name="id">
DONE
      for (@$lists) { # print the popup item, and check to see if the playlist is current
	my $startdate = substr($$_{StartTime}, 0, 10);
	my $enddate = substr($$_{EndTime}, 0, 10);
	print "<option value=\"$$_{PlayListID}\">$startdate</option>\n";

	my $curdate = `date +%Y-%m-%d`; chop $curdate;
	$current = <<DONE if ($curdate eq $startdate or $curdate eq $enddate);
<a href="playlist.cgi?session=$$params{session}&amp;debug=$$params{debug}&amp;id=$$_{PlayListID}">Edit Current Playlist</a>
<p>
DONE
      }
      print <<DONE
</select>
<input type="submit" value="Show Old Playlist" />
</form>

$current
DONE
    ;
    }
    &printEndData;

  }


  # Random show foo
  &printStartData;

  print "<h3>Random Playlists</h3>";
 my ($lists) = &sqlSelectMany($tblPlaylist, ['StartTime','PlayListID'],
				 { string=>'StartTime > ? AND ProgramID = 137 AND UserID= ?',
				   values=>[`date +%Y`."-01-01",$$user{UserID}] },
				 'StartTime DESC',
				 { nolookup=>1, debug=>$$params{debug} });

    if ($#$lists >= 0) { # if there are existing playlists, print a popup selector
      print <<DONE;
<!--p-->
<form action="playlist.cgi" method="$METHOD">
<input type="hidden" name="debug" value="$$params{debug}" />
<input type="hidden" name="session" value="$$params{session}" />
<select name="id">
DONE
      for (@$lists) { # print the popup item, and check to see if the playlist is current
	my $startdate = substr($$_{StartTime}, 0, 10);
	my $enddate = substr($$_{EndTime}, 0, 10);
	print "<option value=\"$$_{PlayListID}\">$startdate</option>\n";

      }
      print <<DONE
</select>
<input type="submit" value="Show Old Playlist" />
</form>

$current
DONE
    ;
    }



  print "<a href=\"playlist.cgi?session=$$params{session}&amp;action=New+Playlist$debug\">Start a Playlist for a Random Show</a><br />\n\n";
  &printEndData;


}

sub printTaskSelect {
  my ($cgi, $user, $task, $mode) = @_;
  my $params = $cgi->Vars;

  if ($task eq 'bin') {

    if ($mode eq 'short') {

    } else {

      my $enddate = `date +%Y-%m-%d`;
      chop $enddate;

      # We want a full week ending on Saturday at midnight.
      # So find the most recent Sunday (which could be today) using
      # the fact that the index of sunday is 0, and subtract one.
      $enddate = DateAdd($enddate.' 00:00:00', {day=>-(localtime(time))[6] - 1});
      $enddate =~ s/ 00:00:00//;

      # Now subtract 6 so that we have a full 7 days.
      my $startdate = &DateAdd($enddate.' 00:00:00', {day=>-6});
      $startdate =~ s/ 00:00:00//;

      print "<h2>--The Bin--</h2>\n\n";
      &printStartData;
      print <<DONE;
<a href="bin.cgi?session=$$params{session}">Show the Bin</a>
<br />

<form action="bin.cgi" method="$METHOD">
Show the OOB list for
<input type="hidden" name="session" value="$$params{session}" />
<input type="hidden" name="debug" value="$$params{debug}" />
<input type="hidden" name="action" value="oob" />
<select name="sec">
  <option value="Bin">The Bin</option>
  <option value="TBR">To Be Reviewed</option>
  <option value="N&WC">New &amp; Way Cool</option>
</select>
<input type="submit" value="Display" />
</form>

<a href="entry.cgi?session=$$params{session}&amp;tbl=Album&amp;Status=Bin&amp;DateRemoved=">Enter Albums into Bin</a>

<form action="bin.cgi" method="$METHOD">
<input type="hidden" name="session" value="$$params{session}" />
<input type="hidden" name="debug" value="$$params{debug}" />
Show
<select name="action">
  <option value="count">Counts</option>
  <option value="adds">Adds</option>
</select>
for
 <select name="genre">
DONE
    ;
      print "  <option value=\"all\"> All </option>\n";
      require "genre.pl";
      &TblInit;
      my ($genres) = &sqlSelectMany(&TblInit, undef, undef,'GenreID', undef);
      for (@$genres) {
          print ("  <option value=\"$$_{Genre}\"",
                 ($$_{GenreID} == $$params{GenreID} ? ' selectED' : ''),
                 ">$$_{Genre}</option>\n");
      }
      print <<DONE;
</select>
 albums whose status is
<select name="status">
DONE
;
      print "  <option value=\"all\"> All Statuses </option>\n";   
      require "album.pl";
      my $tbl=&TblInit;
      my $statuses=$tbl->{fields}->{Status}->{values};
      foreach my $status (@$statuses) {
	  print "  <option value=\"".$status."\">".$status."</option>\n";
      }
print <<DONE;
</select>
between
<input type="text" name="StartDate" value="$startdate" size="11" />
and
<input type="text" name="EndDate" value="$enddate" size="11" />
<input type="submit" value="Display" />
</form>

DONE
  ;
      &printEndData;
    }

  } elsif ($task eq 'program') {

    if ($mode eq 'short') {
      print "| <a href=\"schedule.cgi?session=$$params{session}\">Schedule</a>\n";
    } else {
      print "<h2>--Scheduling--</h2>\n\n";
      &printStartData;
      print "<a href=\"schedule.cgi?session=$$params{session}\">Edit the Schedule</a>\n";
      &printEndData;
    }

  } elsif ($task eq 'democracynow') {
    print qq~<H2>--Democracy Now!--</H2>~;
    &printStartData;
    print qq~
    <B>Warning: this might be bj0rken for a while -apw2</B><BR>
    <UL>
      <LI><A HREF="dn.cgi?session=$$params{session}&op=airing">Guidelines for airing DN!</A>
      <LI><A HREF="dn.cgi?session=$$params{session}&op=signup">Sign-Up Sheet</A>
    </UL>~;
    &printEndData;
  }

}

sub printShortTasks {
  my ($cgi, $user) = @_;
  my $params = $cgi->Vars;

  my ($tasks) = &sqlSelectMany({table=>'UserTasks'}, ['Task'],
			       {string=>'UserID = ?', values=>[$$user{UserID}]},
			       undef, {nolookup=>1, debug=>$$params{debug}});
  for (@$tasks) {
    &printTaskSelect($cgi, $user, $$_{Task}, 'short');
  }

}

1;
