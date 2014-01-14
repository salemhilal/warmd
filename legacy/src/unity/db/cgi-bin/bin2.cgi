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
  $date = &DateAdd($date.' 00:00:00', {mon=>-3});
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
  my $removedate = &DateAdd($date.' 00:00:00', {mon=>-3});
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
    
    $enddate = $$params{EndDate} if $$params{EndDate};
    my $startdate = &DateAdd($enddate.' 00:00:00', {day=>-6});
    $startdate =~ s/ 00:00:00//;
    $startdate = $$params{StartDate} if $$params{StartDate};
    
    my @genres = $cgi->param('GenreID');
    my $ngenres=scalar(@genres);
    my @formats = $cgi->param('FormatID');
    my $nformats=scalar(@formats);
    my @statuses = $cgi->param('status');
    my $nstatuses=scalar(@statuses);
    my @subgenres = $cgi->param('SubGenreID');
    my $nsubgenres=scalar(@subgenres);

    
    print '<form action="bin2.cgi" method="', $method, '">';
    print <<DONE;
  <select name="action">
      <option value="count_email">Email-able version</option>
	  <option value="count_cmj">CMJ-able version</option>
	      <option value="count">Database version</option>
  </select>
  <input type="hidden" name="session" value="$$params{session}">
  <input type="hidden" name="debug" value="$$params{debug}">
  <input type="hidden" name="StartDate" value="$$params{StartDate}">
  <input type="hidden" name="EndDate" value="$$params{EndDate}">
DONE
    ;
  my $enddate = `date "+%Y-%m-%d"`; chop $enddate;
  # We want to go from saturday to sunday
  $enddate = DateAdd($enddate.' 00:00:00', {day => -(localtime(time))[6]});
  $enddate =~ s/ 00:00:00//;

    # Select all the albums that were in the bin during the given interval
    # (we need to catch albums that got zero plays, too).

    my $qstring = "DateAdded <= ? AND (DateRemoved >= ? OR DateRemoved IS NULL) ";
    my $qval = [$enddate, $startdate]; 

# genre
    if ( $ngenres == 0 ) {	# do nothing   
    }
    else { 
	$qstring=$qstring." AND ( GenreID = ? ";
	push @$qval , @genres[0];
	print "<input type=\"hidden\" name=\"GenreID\" value=\"".@genres[0]."\">\n";
	foreach $i (1..$ngenres-1) {
	    $qstring=$qstring." OR GenreID = ? ";
	    push @$qval , @genres[$i];
	    print "<input type=\"hidden\" name=\"GenreID\" value=\"".@genres[$i]."\">\n";
	}
	$qstring=$qstring." ) ";
    }
# status
    if ( $nstatuses == 0 ) {	# do nothing   
    }
    else { 
	$qstring=$qstring." AND ( Status = ? ";
	push @$qval , @statuses[0];
	print "<input type=\"hidden\" name=\"status\" value=\"".@statuses[0]."\">\n";
	foreach $i (1..$nstatuses-1) {
	    $qstring=$qstring." OR Status = ? ";
	    push @$qval , @statuses[$i];
	    print "<input type=\"hidden\" name=\"status\" value=\"".@statuses[$i]."\">\n";
	}
	$qstring=$qstring." ) ";
    }
# format
    if ( $nformats == 0 ) {	# do nothing   
    }
    else { 
	$qstring=$qstring." AND ( FormatID = ? ";
	push @$qval , @formats[0];
	print "<input type=\"hidden\" name=\"FormatID\" value=\"".@formats[0]."\">\n";
	foreach $i (1..$nformats-1) {
	    $qstring=$qstring." OR FormatID = ? ";
	    push @$qval , @formats[$i];
	    print "<input type=\"hidden\" name=\"FormatID\" value=\"".@formats[$i]."\">\n";
	}
	$qstring=$qstring." ) ";
    }
# print out subgenres for the select menu
    if ($nsubgenres>0) {
	
	foreach $i (0..$nsubgenres-1) {
	    print "<input type=\"hidden\" name=\"SubGenreID\" value=\"".@subgenres[$i]."\">\n";
	}
    }
    
    print <<DONE;
  <input type="submit" value="Submit">
</form>

DONE
    ;

    my ($rows, $count) =
	&sqlSelectMany($tbl, [@{$$tbl{shortorder}}, "AlbumID", "Artists.ShortName","AlbumID" ],
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
    
    my @sgrows;
    if ($nsubgenres==0) { foreach my $row (@$rows, @rows2) { push @sgrows, $row; }   }
    else {
	my $wherestring='AlbumID = ? AND ( ';
	my $sgvals=[];
	$wherestring=$wherestring." SubGenreID = ? ";
	push @$sgvals , @subgenres[0];
	foreach my $i (1..$nsubgenres-1) {
	    push @$sgvals , @subgenres[$i];
	    $wherestring=$wherestring." OR SubGenreID = ? ";
	}
	$wherestring=$wherestring." ) ";
	
	foreach my $row (@$rows, @rows2) {
	    unshift @$sgvals , $$row{AlbumID} ;
	    
	    my $ag = &sqlSelectRow({table=>'AlbumGenres'},['SubGenreID','AlbumID',],
				   {string=>$wherestring,
				    values=>$sgvals,},
				   undef, $$params{debug});
	    if (defined $ag) { push @sgrows , $row; }
	    shift @$sgvals;
	}
    }
    foreach my $row (@sgrows) {
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
      foreach my $r (@sorted) {
	  $_=$r->{Label};
	  s/Records$//;           s/records$//;
	  s/Entertainment$//;     s/entertainment$//;
	  s/Inc$//;      s/Inc.$//;   s/inc$//;    s/inc.//;
	  s/Music$//;     s/music$//;
	  my $label=$_;
	  print $i.". ".$r->{Artist}." - ".$r->{Album}." - ".$label."\n";
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

    my @genres = $cgi->param('GenreID');
    my $ngenres=scalar(@genres);
    my @formats = $cgi->param('FormatID');
    my $nformats=scalar(@formats);
    my @statuses = $cgi->param('status');
    my $nstatuses=scalar(@statuses);
    my @subgenres = $cgi->param('SubGenreID');
    my $nsubgenres=scalar(@subgenres);
    
    print '<form action="bin2.cgi" method="', $method, '">';
    print <<DONE;
  <select name="action">
      <option value="adds_email">Email-able version</option>
	      <option value="adds">Database version</option>
  </select>
  <input type="hidden" name="session" value="$$params{session}">
  <input type="hidden" name="debug" value="$$params{debug}">
  <input type="hidden" name="StartDate" value="$$params{StartDate}">
  <input type="hidden" name="EndDate" value="$$params{EndDate}">
DONE
    ;
    if ($$params{StartDate}) {
	$startdate = $$params{StartDate};
    } else {
	$startdate = `date +%Y-%m-%d`;
	chop $startdate;
    }
    
    $enddate = ($$params{EndDate} or $startdate);
    my $qstring = "DateAdded >= ? AND DateAdded <= ? ";
    my $qval = [$startdate,$enddate,]; 
# genre
    if ( $ngenres == 0 ) {	# do nothing   
    }
    else { 
	$qstring=$qstring." AND ( GenreID = ? ";
	push @$qval , @genres[0];
	print "<input type=\"hidden\" name=\"GenreID\" value=\"".@genres[0]."\">\n";
	foreach $i (1..$ngenres-1) {
	    $qstring=$qstring." OR GenreID = ? ";
	    push @$qval , @genres[$i];
	    print "<input type=\"hidden\" name=\"GenreID\" value=\"".@genres[$i]."\">\n";
	}
	$qstring=$qstring." ) ";
    }
# status
    if ( $nstatuses == 0 ) {	# do nothing   
    }
    else { 
	$qstring=$qstring." AND ( Status = ? ";
	push @$qval , @statuses[0];
	print "<input type=\"hidden\" name=\"status\" value=\"".@statuses[0]."\">\n";
	foreach $i (1..$nstatuses-1) {
	    $qstring=$qstring." OR Status = ? ";
	    push @$qval , @statuses[$i];
	    print "<input type=\"hidden\" name=\"status\" value=\"".@statuses[$i]."\">\n";
	}
	$qstring=$qstring." ) ";
    }
# format
    if ( $nformats == 0 ) {	# do nothing   
    }
    else { 
	$qstring=$qstring." AND ( FormatID = ? ";
	push @$qval , @formats[0];
	print "<input type=\"hidden\" name=\"FormatID\" value=\"".@formats[0]."\">\n";
	foreach $i (1..$nformats-1) {
	    $qstring=$qstring." OR FormatID = ? ";
	    push @$qval , @formats[$i];
	    print "<input type=\"hidden\" name=\"FormatID\" value=\"".@formats[$i]."\">\n";
	}
	$qstring=$qstring." ) ";
    }
# print out subgenres for the select menu
    if ($nsubgenres>0) {
	
	foreach $i (0..$nsubgenres-1) {
	    print "<input type=\"hidden\" name=\"SubGenreID\" value=\"".@subgenres[$i]."\">\n";
	}
    }
    
    print <<DONE;
  <input type="submit" value="Submit">
</form>

DONE
    ;

    my ($rows, $count) =
	&sqlSelectMany($tbl, [@{$$tbl{shortorder}}, "AlbumID", "Artists.ShortName","AlbumID" ],
		       {string=> $qstring,
			values=> $qval},
		       $sortby,
		       {#base=>(int $$params{base}), extent=>$RECPERPAGE,
			   debug=>$$params{debug}});
    
#    $sql1=$sql1.'  ORDER BY Genres.Genre, Albums.Comp, Artists.ShortName';
#    my $sth = $dbh->prepare($sql1); 
#    $sth->execute(@args);

    print "<h2>Adds ",
    ($enddate eq $startdate ? $startdate : "$startdate to $enddate"),
    "</h2>\n\n";
    
#    print "<pre>$sql1</pre><br />\n" if $$params{debug}; 
#    print "Values: $startdate, $enddate, $status, $genre <br />\n" if $$params{debug}; 
    
    if ($$params{action} eq 'adds') {
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
	foreach my $row (@$rows) {
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
    }
 elsif ($$params{action} eq 'adds_email') {
    print "<textarea name=\"Adds\" rows=\"20\" cols=\"80\">";
	foreach my $row (@$rows) {
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

sub split_arglist {
    my ($arg)=@_;
    
    $_=$arg;
    split("\" \"",$_);
    my $larg = $#_;

    @_[0] =~ s/^\"//;
    @_[$larg] =~ s/\"$//;
    
    my $retarg;
    foreach $i (@_) { push @$retarg, $i; }
    return $retarg;
}    
