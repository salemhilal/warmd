#!/usr/bin/perl

# Bin maintenance page -- for OOBing albums and getting counts.

use lib "$ENV{WWW_SITE}/perl-lib";
use lib "$ENV{WWW_SITE}/perl-lib/tables";
require "sql.pl";
require "interface.pl";
require "record.pl";
require 'login.pl';
require 'search.pl';
require 'misc.pl';
require 'task.pl';

require 'album.pl';
$tbl = &TblInit;

use CGI;
my($cgi) = new CGI;
my $params = $cgi->Vars;
my $sortby = ($$params{sortby} or 'GenreID,Artists.ShortName');

$user = &loginSession($$params{session});
&printHead({name=>'Bin'}, $cgi, $user);

#&printTaskSelect($cgi, $user, 'bin');

########################################################################
# show the out of bin-ing page
########################################################################
if ($$params{action} eq 'oob') {

  &error("You need an Exec account to use this page")
    unless &AuthGTE($$user{AuthLevel}, 'Exec');

  $$params{sec} = 'Bin' unless $$params{sec};
  my %oob = (Bin	=> 'OOB',
	     'N&WC'	=> 'NIB',
	     TBR	=> 'NIB');

  print "<h2>Remove these albums from the $$params{sec} section and click the OOB button to file them as $oob{$$params{sec}} in the database.</h2>\n\n";

  my $date = `date "+%Y-%m-%d"`; chop $date;
  $date = &DateAdd($date.' 00:00:00', {day=>-70});
  $date =~ s/ 00:00:00//;
  print "Searching for Albums added before $date<br />\n" if $$params{debug};
  my $extent = ($$params{extent} or $RECPERPAGE);
  my ($rows, $count) = &sqlSelectMany($tbl, undef,
				      {string=>'Status = ? AND DateAdded <= ?',
				       values=>[$$params{sec}, $date]},
				      $sortby,
				      {#base=>(int $$params{base}), extent=>$extent,
				       count=>1, debug=>$$params{debug}});

  &printTitles($tbl, $cgi);
  for (@$rows) {
    &printRow($tbl, $cgi, $user, $_, { cutoff=>($$params{cutoff}?undef:$CUTOFF), row=>$row });
    $row = not $row;
  }
  print "</table>\n\n";
#  &printRecordNav($cgi, scalar @$rows, $count);

  print <<DONE;
<p>
<form action="bin.cgi" method="$method">
<input type="hidden" name="session" value="$$params{session}" />
<input type="hidden" name="debug" value="$$params{debug}" />
<input type="hidden" name="action" value="OOB" />
<input type="hidden" name="sec" value="$$params{sec}" />
<input type="submit" value="OOB" />
</form>

DONE

########################################################################
# set albums to be out-of-bin in DB
########################################################################
} elsif ($$params{action} eq 'OOB') { 

  $$params{sec} = 'Bin' unless $$params{sec};
  my %oob = (Bin	=> 'OOB',
	     'N&WC'	=> 'NIB',
	     TBR	=> 'NIB');

  &error("You need an Exec account to use this page")
    unless &AuthGTE($$user{AuthLevel}, 'Exec');

  my $date = `date "+%Y-%m-%d"`; chop $date;
  my $removedate = &DateAdd($date.' 00:00:00', {day=>-70});
  $removedate =~ s/ 00:00:00//;

  &sqlUpdate($tbl, {DateRemoved=>$date, Status=>$oob{$$params{sec}}},
	     {string=>'Status = ? AND DateAdded <= ?',
	      values=>[$$params{sec}, $removedate]},
	     $$params{debug});
  print "<h2>All $$params{sec} albums added on or before $removedate have been changed to $oob{$$params{sec}}</h2>\n\n";

########################################################################
# show the current counts of bin cuts
########################################################################
}  elsif ($$params{action} eq 'count'
	  || $$params{action} eq 'count_email'
	  || $$params{action} eq 'count_cmj') {

    &error("You need an Exec account to use this page")
	unless &AuthGTE($$user{AuthLevel}, 'Exec');

    $$tbl{shortorder} =  [ qw( DateAdded ArtistID Album LabelID GenreID FormatID Status ) ];

  print '<form action="bin.cgi" method="', $method, '">';
  print <<DONE;
  <select name="action">
  <option value="count_email">Email-able version</option>
  <option value="count_cmj">CMJ-able version</option>
  <option value="count">Database version</option>
  </select>
  <input type="hidden" name="session" value="$$params{session}">
  <input type="hidden" name="debug" value="$$params{debug}">
  <input type="hidden" name="genre" value="$$params{genre}">
  <input type="hidden" name="status" value="$$params{status}">
  <input type="hidden" name="StartDate" value="$$params{StartDate}">
  <input type="hidden" name="EndDate" value="$$params{EndDate}">
  <input type="submit" value="Submit">
</form>

DONE
    ;
  my $enddate = `date "+%Y-%m-%d"`; chop $enddate;
  # We want to go from saturday to sunday
  $enddate = DateAdd($enddate.' 00:00:00', {day => -(localtime(time))[6]});
  $enddate =~ s/ 00:00:00//;

  $enddate = $$params{EndDate} if $$params{EndDate};
  my $startdate = &DateAdd($enddate.' 00:00:00', {day=>-6});
  $startdate =~ s/ 00:00:00//;
  $startdate = $$params{StartDate} if $$params{StartDate};

  my ($genre,$status) = ($$params{genre},$$params{status});

  # Select all the albums that were in the bin during the given interval
  # (we need to catch albums that got zero plays, too).

  if ($genre ne 'all' && $status ne 'all') {
      $qstring = "DateAdded <= ? AND (DateRemoved >= ? OR DateRemoved IS NULL) AND Status = ? AND Genre = ? ";
      $qval = [$enddate, $startdate, $status,$genre];
  }
  elsif ($genre eq 'all' && $status eq 'all') {
      $qstring = "DateAdded <= ? AND (DateRemoved >= ? OR DateRemoved IS NULL) ";
      $qval = [$enddate, $startdate];
  }
  elsif ($genre eq 'all' ) {
      $qstring = "DateAdded <= ? AND (DateRemoved >= ? OR DateRemoved IS NULL) AND Status = ? ";
      $qval = [$enddate, $startdate, $status];
  }
  elsif ($status eq 'all') {
      $qstring = "DateAdded <= ? AND (DateRemoved >= ? OR DateRemoved IS NULL) AND Genre = ? ";
      $qval = [$enddate, $startdate, $genre];
  }

  my ($rows, $count) =
    &sqlSelectMany($tbl, [@{$$tbl{shortorder}}, "AlbumID", "Artists.ShortName" ],
		   {string=> $qstring,
		    values=> $qval},
		   $sortby,
		   {#base=>(int $$params{base}), extent=>$RECPERPAGE,
		    count=>1, debug=>$$params{debug}});
  # The next query is a little too complicated for any of the sql wrappers.
  # We're fetching all the bin cuts of albums that are no longer in the bin
  my $sql = ("select DISTINCT Albums.*,Artists.ShortName,"
	     . "Artists.Artist,Labels.Label,Formats.Format,Genres.Genre\n"
	     . "  FROM Albums,Plays,Artists,Labels,Formats,Genres\n"
	     . " WHERE Plays.B = ? AND Albums.Status != ?\n"
	     . "   AND Plays.Date >= ? AND Plays.Date <= ?\n   AND "
	     . join(' AND ', map {"${_}s.${_}ID = Albums.${_}ID"} qw(Artist Label Format Genre))
	     . "   AND Albums.AlbumID = Plays.AlbumID\n");
  print "$sql<br />\n" if $$params{debug};
  my $values = ['Yes', 'Bin', $startdate, $enddate];
  print "Values: ", join(', ', @$values), "<br />\n" if $$params{debug};
  my $sth = $dbh->prepare($sql);
  $sth->execute(@$values);
  my @rows2;
  while ($_ = $sth->fetchrow_hashref) { push @rows2, $_ }
  print scalar(@rows2), " bin cuts found that are not currently in bin<br />\n" if $$params{debug};
  print "fields: ", join(', ', keys %{$rows[0]}), "<br />\n" if $$params{debug};

  my @rows;

  foreach my $row (@$rows, @rows2) {
    my $plays = &sqlSelectRow({table=>'Plays'}, ['COUNT(*)'],
			      {string=>'Time >= ? AND Time <= ? AND AlbumID = ?',
			       values=>["$startdate 00:00:00", "$enddate 23:59:59", $$row{AlbumID}]},
			      undef, $$params{debug});
    $$row{Plays} = $$plays{'COUNT(*)'};
    push @rows, $row;
  }

  my @sorted = sort { 2*($$b{Plays} <=> $$a{Plays}) +
			($$b{ShortName} cmp $$a{ShortName}) } @rows;
  if ($$params{action} eq 'count_email') {
      print "<textarea name=\"Review\" rows=\"20\" cols=\"80\">";
      my $i=1;
      for my $r (@sorted) {
	  print $i.". ".$r->{Artist}." -- ".$r->{Album}." -- ".$r->{Label}."\n";
	  $i++;
      }

      print "</textarea>\n";
  }
  elsif ($$params{action} eq 'count_cmj') {
      print "<textarea name=\"Review\" rows=\"20\" cols=\"80\">";
      foreach $r (@sorted) {
	  print $r->{Artist}."@@".$r->{Album}."@@".$r->{Label}."\n";
      }
      print "</textarea>\n";
  }
  else {
      push @{$$tbl{shortorder}}, 'Plays';
      &printTitles($tbl, $cgi);
      for (@sorted) {
	  &printRow($tbl, $cgi, $user, $_, { cutoff=>($$params{cutoff}?undef:$CUTOFF), row=>$row });
	  $row = not $row;
      }
      print "</table>\n\n";
#  &printRecordNav($cgi, scalar @$rows, $count);
  }
########################################################################
# show recent bin adds
########################################################################
} elsif ($$params{action} eq 'adds'
	 || $$params{action} eq 'adds_email')  {

    print '<form action="bin.cgi" method="', $method, '">';
    print <<DONE;
    <select name="action">
<option value="adds_email">Email-able version</option>
<option value="adds">Database version</option>
    </select>
<input type="hidden" name="session" value="$$params{session}">
 <input type="hidden" name="debug" value="$$params{debug}">
 <input type="hidden" name="genre" value="$$params{genre}">
 <input type="hidden" name="status" value="$$params{status}">
 <input type="hidden" name="StartDate" value="$$params{StartDate}">
 <input type="hidden" name="EndDate" value="$$params{EndDate}">
 <input type="submit" value="Submit">
 </form>
DONE
;    
    if ($$params{StartDate}) {
	$startdate = $$params{StartDate};
    } else {
	$startdate = `date +%Y-%m-%d`;
	chop $startdate;
    }
    
    $enddate = ($$params{EndDate} or $startdate);
    my ($status,$genre);
    $status = $$params{status};
    $genre = $$params{genre};
    
    print "<h2>$status adds ",
    ($enddate eq $startdate ? $startdate : "$startdate to $enddate"),
      "</h2>\n\n";

    my $sth;
    if ($status ne 'all' && $genre ne 'all') {
	$sql1 = '
select Albums.Album, Albums.AlbumID, Albums.Comp,
       Artists.Artist, Artists.ShortName, Artists.ArtistID,
       Genres.Genre, Genres.GenreID,
       Formats.Format, Formats.FormatID
  FROM Albums LEFT JOIN Artists ON Albums.ArtistID = Artists.ArtistID
              LEFT JOIN Genres ON Albums.GenreID = Genres.GenreID
              LEFT JOIN Formats ON Albums.FormatID = Formats.FormatID
WHERE DateAdded >= ? AND DateAdded <= ?  AND Status = ? AND Genre = ?
 ORDER BY Genres.Genre, Albums.Comp, Artists.ShortName';
	
	$sth = $dbh->prepare($sql1);
	$sth->execute($startdate, $enddate,$status,$genre);
    }
     elsif ($status eq 'all' && $genre eq 'all') {
	 $sql1 = '
select Albums.Album, Albums.AlbumID, Albums.Comp,
       Artists.Artist, Artists.ShortName, Artists.ArtistID,
       Genres.Genre, Genres.GenreID,
       Formats.Format, Formats.FormatID
  FROM Albums LEFT JOIN Artists ON Albums.ArtistID = Artists.ArtistID
              LEFT JOIN Genres ON Albums.GenreID = Genres.GenreID
              LEFT JOIN Formats ON Albums.FormatID = Formats.FormatID
WHERE DateAdded >= ? AND DateAdded <= ? 
 ORDER BY Genres.Genre, Albums.Comp, Artists.ShortName';
	 
	 $sth = $dbh->prepare($sql1);
	 $sth->execute($startdate, $enddate);
     }
    elsif ($status eq 'all') {
	$sql1 = '
select Albums.Album, Albums.AlbumID, Albums.Comp,
       Artists.Artist, Artists.ShortName, Artists.ArtistID,
       Genres.Genre, Genres.GenreID,
       Formats.Format, Formats.FormatID
  FROM Albums LEFT JOIN Artists ON Albums.ArtistID = Artists.ArtistID
              LEFT JOIN Genres ON Albums.GenreID = Genres.GenreID
              LEFT JOIN Formats ON Albums.FormatID = Formats.FormatID
WHERE DateAdded >= ? AND DateAdded <= ?  AND Genre = ?
 ORDER BY Genres.Genre, Albums.Comp, Artists.ShortName';
	
	$sth = $dbh->prepare($sql1);
	$sth->execute($startdate, $enddate,$genre);
    }
    elsif ($genre eq 'all') {
	$sql1 = '
select Albums.Album, Albums.AlbumID, Albums.Comp,
       Artists.Artist, Artists.ShortName, Artists.ArtistID,
       Genres.Genre, Genres.GenreID,
       Formats.Format, Formats.FormatID
  FROM Albums LEFT JOIN Artists ON Albums.ArtistID = Artists.ArtistID
              LEFT JOIN Genres ON Albums.GenreID = Genres.GenreID
              LEFT JOIN Formats ON Albums.FormatID = Formats.FormatID
WHERE DateAdded >= ? AND DateAdded <= ?  AND Status = ?
 ORDER BY Genres.Genre, Albums.Comp, Artists.ShortName';
	
	$sth = $dbh->prepare($sql1);
	$sth->execute($startdate, $enddate,$status);
    }
    
    print "<pre>$sql1</pre><br />\n" if $$params{debug}; 
    print "Values: $startdate, $enddate, $status, $genre <br />\n" if $$params{debug}; 

    print <<DONE;
    <table border="1">
    <tr>
    <th>Artist</th>
    <th>Album</th>
    <th>Genre</th>
    <th>Format</th>
    <th>Review</th>
  </tr>
DONE
    ;
    if ($$params{action} eq 'adds') {
    
    while (my $row = $sth->fetchrow_hashref) {
	print "  <tr>\n";
	
	for (qw( Artist Album Genre Format )) {
	    print "    <td>\n<a href=\"display.cgi?session=$$params{session}&amp;tbl=$_&amp;${_}ID=",
	    $$row{"${_}ID"},"\">$$row{$_}</a>\n    </td>\n";
	}
	
	$sql = '
select Reviews.Review, Users.FName, Users.LName, Users.UserID
  FROM Reviews LEFT JOIN Users USING (UserID)
 WHERE Reviews.AlbumID = ?';
	
	my $sth2 = $dbh->prepare($sql);
	$sth2->execute($$row{AlbumID});
	my $review = $sth2->fetchrow_hashref;
	print "    <td>\n$$review{Review} (<a href=\"display.cgi?session=$$params{session}&amp;tbl=User&amp;UserID=$$review{UserID}\">$$review{FName} $$review{LName}</a>)\n    </td>\n";
	
	print "  </tr>\n";
    }
    
    print "</table>\n";
} elsif ($$params{action} eq 'adds_email') {
    print "<textarea name=\"Adds\" rows=\"20\" cols=\"80\">";
    while (my $row = $sth->fetchrow_hashref) {
	print $row->{Artist}." -- ".$row->{Album}." -- ".$row->{Genre}." -- ".$row->{Format}."\n";
    }
    
    print "</textarea>\n";
}   
    
    
########################################################################
# display the bin
########################################################################
} else {

  print "No action: displaying the bin<br />\n" if $$params{debug};

  &error("You need a User account to use this page")
    unless &AuthGTE($$user{AuthLevel}, 'User');

  print '<form action="bin.cgi" method="', $method, '">
View only <select name="GenreID">
';
  my ($genres) = &sqlSelectMany({table=>'Genres'}, ['Genre', 'GenreID'], undef,
				'GenreID', {nolookup=>1, debug=>$$params{debug}});
  for (@$genres) {
    print ("  <option value=\"$$_{GenreID}\"",
	   ($$_{GenreID} == $$params{GenreID} ? ' selectED' : ''),
	   ">$$_{Genre}</option>\n");
  }
  print <<DONE;
</select>
<input type="hidden" name="session" value="$$params{session}">
<input type="hidden" name="debug" value="$$params{debug}">

<input type="submit" value="Submit">
</form>

DONE

  my $where;
  $where = {string=>'Status = ?'. ($$params{GenreID}?' AND GenreID = ?':''),
	    values=>['Bin']};
  push @{$$where{values}}, $$params{GenreID} if $$params{GenreID};

  my $extent = ($$params{extent} or $RECPERPAGE);
  my ($rows, $count) = &sqlSelectMany($tbl, undef, $where, $sortby,
				      {base=>(int $$params{base}), extent=>$extent,
				       count=>1, debug=>$$params{debug}});

  &printTitles($tbl, $cgi);
  for (@$rows) {
    &printRow($tbl, $cgi, $user, $_, { cutoff=>($$params{cutoff}?undef:$CUTOFF), row=>$row });
    $row = not $row;
  }
  print "</table>\n\n";
  &printRecordNav($cgi, scalar @$rows, $count);

}

&printFoot({name=>'Bin'}, $cgi, $user);

