#!/usr/bin/perl

# A general display form for tables.
# There's no data postprocessing on this form,
# but it makes a good starting point for other tables.

use lib "$ENV{WWW_SITE}/perl-lib";
require "sql.pl";
require "record.pl";
require "interface.pl";
require "search.pl";
require "login.pl";
require "misc.pl";

use CGI;

$cgi = new CGI;
$params = $cgi->Vars;

use lib "$ENV{WWW_SITE}/perl-lib/tables";
require "play.pl";
my $tbl = &TblInit;

#print $cgi->header, "session = $$params{session}, userid = ",&decrypt($$params{session}),"<br />\n" if $$params{debug};
print $cgi->header if $$params{debug};
$user = &loginSession($$params{session});
$edit = &AuthGTE($$user{AuthLevel}, 'User', $$params{debug});

print "edit is $edit <br>\n" if $$params{debug};

$$params{mode} = 'rows' unless ($edit or $$params{mode} eq 'rowstext');

if ($$params{mode} eq 'rows') {

  my @time = ($$params{Time} =~ /(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)/);
  my $timewhere = {string=>'YEAR(Time) = ? AND MONTH(Time) = ? AND DAYOFMONTH(Time) = ? AND HOUR(Time) = ? AND MINUTE(Time) = ? AND SECOND(Time) = ?', values=>[@time]};

  &printHead({name=>'PlayList'}, $cgi, $user, 1);
  if ($$params{action} eq 'Add Play') { # add a play (from search frame)

    for (@{$$tbl{order}}) { $fields{$_} = $$params{$_} if $$params{$_}; }

    if ($fields{AlbumID}) { # adding an album from the database
	my $album = &sqlSelectRow({table=>'Albums'}, ['Status'], 
				  {string=>'AlbumID = ?', values=>[$fields{AlbumID}]},
				  undef, $$params{debug});

	# check if this is a bin cut (only one cut per album per show)
	$fields{B} = 'Yes' if $$album{Status} eq 'Bin'
	    and not RecordExists($tbl, {string=>'PlaylistID = ? AND AlbumID = ?',
					values=>[$$params{PlayListID}, $$params{AlbumID}]},
				 $$params{debug});
    }
    else{
      $fields{AlbumID} = $NAN_ID if $fields{AltAlbum};
    }

    $fields{AlbumID} = $NAN_ID unless $fields{AlbumID};
    &sqlInsert($tbl, $$params{debug}, \%fields);

  } elsif ($$params{action} eq 'Add Compilation') { # add the comp name and play

    &sqlInsert($tbl, $$params{debug},
	       { PlayListID=>$$params{PlayListID},
		 ArtistID=>$VA_ID,
		 AlbumID=>$NAN_ID,
		 AltAlbum=>$$params{Compilation},
		 TrackName=>$$params{TrackName} });

  } elsif ($$params{action} eq 'reverse') { # change the value of a switch

    # use $$params{Time} to find the record, and reverse
    # the boolean value of $$params{field}
    my $row = &sqlSelectRow($tbl, [ $$params{field} ],
			    $timewhere,
			    $$params{debug});
    &sqlUpdate($tbl, {$$params{field}=>&revBool($$row{$$params{field}})},
	       $timewhere, $$params{debug});

  } elsif ($$params{action} eq 'delete') { # delete a play

    &sqlDelete($tbl, $timewhere,
	       $$params{debug});

  } elsif ($$params{action} eq 'times') { # change the times of the playlist

    $$params{StartDate} =~ /(\d\d)-(\d\d)-(\d{4})/;
    $$params{StartTime} = "$3-$1-$2 $$params{StartTime}:00";
    $$params{EndDate} =~ /(\d\d)-(\d\d)-(\d{4})/;
    $$params{EndTime} = "$3-$1-$2 $$params{EndTime}:00";

    require "playlist.pl";
    my $tblPlaylist = &TblInit;
    my %fields;
    for (@{$$tblPlaylist{order}}) {
      $fields{$_} = $$params{$_};
    }

    &sqlUpdate($tblPlaylist, \%fields,
	       {string=>'PlayListID = ?', values=>[$$params{id}]},
	       $$params{debug});

}
    
    $$params{sortby} = $$tbl{sortby} unless $$params{sortby};

    &printPlays($edit);

} elsif ($$params{mode} eq 'rowstext') {

    &printHead({name=>'PlayList'}, $cgi, $user, 1);
  if ($$params{action} eq 'Add Play') { # add a play (from search frame)

    for (@{$$tbl{order}}) { $fields{$_} = $$params{$_} if $$params{$_}; }

    if ($fields{AlbumID}) { # adding an album from the database
	my $album = &sqlSelectRow({table=>'Albums'}, ['Status'], 
				  {string=>'AlbumID = ?', values=>[$fields{AlbumID}]},
				  undef, $$params{debug});

	# check if this is a bin cut (only one cut per album per show)
	$fields{B} = 'Yes' if $$album{Status} eq 'Bin'
	    and not RecordExists($tbl, {string=>'PlaylistID = ? AND AlbumID = ?',
					values=>[$$params{PlayListID}, $$params{AlbumID}]},
				 $$params{debug});
    }
    
    $fields{AlbumID} = $NAN_ID if $fields{AltAlbum};
    $fields{AlbumID} = $NAN_ID unless $fields{AlbumID};
    &sqlInsert($tbl, $$params{debug}, \%fields);

  } elsif ($$params{action} eq 'Add Compilation') { # add the comp name and play

    &sqlInsert($tbl, $$params{debug},
	       { PlayListID=>$$params{PlayListID},
		 ArtistID=>$VA_ID,
		 AlbumID=>$NAN_ID,
		 AltAlbum=>$$params{Compilation},
		 TrackName=>$$params{TrackName} });

  } elsif ($$params{action} eq 'reverse') { # change the value of a switch

    # use $$params{Time} to find the record, and reverse
    # the boolean value of $$params{field}
    my $row = &sqlSelectRow($tbl, [ $$params{field} ],
			    $timewhere,
			    $$params{debug});
    &sqlUpdate($tbl, {$$params{field}=>&revBool($$row{$$params{field}})},
	       $timewhere, $$params{debug});

  } elsif ($$params{action} eq 'delete') { # delete a play

    &sqlDelete($tbl, $timewhere,
	       $$params{debug});

  } elsif ($$params{action} eq 'times') { # change the times of the playlist

    $$params{StartDate} =~ /(\d\d)-(\d\d)-(\d{4})/;
    $$params{StartTime} = "$3-$1-$2 $$params{StartTime}:00";
    $$params{EndDate} =~ /(\d\d)-(\d\d)-(\d{4})/;
    $$params{EndTime} = "$3-$1-$2 $$params{EndTime}:00";

    require "playlist.pl";
    my $tblPlaylist = &TblInit;
    my %fields;
    for (@{$$tblPlaylist{order}}) {
      $fields{$_} = $$params{$_};
    }
    
    &sqlUpdate($tblPlaylist, \%fields,
	       {string=>'PlayListID = ?', values=>[$$params{id}]},
	       $$params{debug});

}
    
    $$params{sortby} = $$tbl{sortby} unless $$params{sortby};
    
    &printPlaysText($edit);
    
} elsif ($$params{mode} eq 'search') {

  if ($$params{action} eq 'Search') { # the user executed a search for an artist

    &printHead({name=>'PlayList'}, $cgi, $user, 1) if $$params{debug};
    print "Action is 'Search'<br />\n" if $$params{debug};

    if ($$params{tbl} eq 'Artist') {
      require "artist.pl";
    } elsif ($$params{tbl} eq 'Compilation') {
      require "album.pl";
    }
    $tblSearch = &TblInit;

    $matches = &searchSimple($tblSearch, $cgi,
			     ($$params {tbl} eq 'Compilation' ?
			      " AND ArtistID = $VA_ID" : undef));

    if ($#$matches == 0) { # there was only one match

      #redirect to the album select page
      my $matchid = $$matches[0]->{"$$tblSearch{name}ID"};
      print ("Location: playlist.cgi?session=$$params{session}&amp;mode=search&amp;id=$$params{id}&amp;tbl=$$params{tbl}&amp;$$tblSearch{name}ID=$matchid&amp;action=Select+$$params{tbl}",
	     ($$params{debug} ? '&amp;debug=1' : ''), "\n\n");
      exit(0);

    } elsif ($#$matches == -1) { # no matches: prompt for new artist

      &printArtistEntry;

    } else { # more than one match

      &printArtistSelect($matches);

    }

  } elsif ($$params{action} eq 'Select Artist') { # found an artist

    &printAlbumSelect;

  } elsif ($$params{action} eq 'Select Compilation') { # found a compilation

    &printCompPlay;

  } elsif ($$params{action} eq 'Add Artist') { # add a new artist to the db

    $$params{ShortName} = substr(lc $$params{Artist}, 0, 6) unless $$params{ShortName};
    require 'artist.pl';
    $$params{ArtistID} = &sqlInsert(&TblInit, $$params{debug},
				    {Artist=>$$params{Artist},
				     ShortName=>$$params{ShortName}});
    &printAlbumSelect;

  } else { # no action information: just print header

    &printHead({name=>'PlayList'}, $cgi, $user, 1);
    print "<p>To add a new play, search for an artist.\n</p>\n";
    print "<p>Action = $$params{action}<br />\n" if $$params{debug};
    print "No search executed: printing search field</p>\n" if $$params{debug};
  }

  &printSearchForm(['Artist','Compilation'], $cgi, { mode=>'search', id=>$$params{id}, debug=>$$params{debug}, session=>$$params{session} }, "playlist.cgi");
  &printFoot($tbl, $cgi);

} else { # print frameset

#  print $cgi->header if $$params{debug};
  my $debug = '&amp;debug=1' if $$params{debug};

  &error("Invalid login") unless $user;

  if ($$params{action} eq 'New Playlist') {
    require "program.pl";
    my $program = &sqlSelectRow(&TblInit, undef,
				{ string=>'ProgramID = ?', values=>[$$params{id}] },
				undef, $$params{debug});
    require "playlist.pl";
    my $tblPlayList = &TblInit;
    if ($program) {
      $$params{id} =
	&sqlInsert($tblPlayList, $$params{debug},
		   { ProgramID=>$$program{ProgramID}, UserID=>$$user{UserID},
		     StartTime=>&findDateDOW($$program{StartTime}),
		     EndTime=>&findDateDOW($$program{EndTime}) });
    } else {
      my $date = `date +'%Y-%m-%d %H:%m:%S'`;
      $$params{id} = &sqlInsert($tblPlayList, $$params{debug},
				{ ProgramID=>$RANDOM_ID, UserID=>$$user{UserID},
				  StartTime=>$date, EndTime=>$date });
    }

    print "Location: playlist.cgi?session=$$params{session}&amp;id=$$params{id}$debug\n\n";
  }

  print $cgi->header;

  print <<DONE;
<!DOCTYPE html 
     PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN"
     "DTD/xhtml1-frameset.dtd">
<html>

<head>
   <meta name="Author" content="Joel Young" />
   <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
   <title>Playlist entry</title>
</head>

<frameset cols="30%,*">
  <frame name="search" src="playlist.cgi?session=$$params{session}&amp;mode=search&amp;id=$$params{id}$debug" />
  <frame name="rows" src="playlist.cgi?session=$$params{session}&amp;mode=rows&amp;id=$$params{id}$debug" />
</frameset>

</html>
DONE

}


######################################################################
# Helper functions
######################################################################

#prints Compilation select box instead if $$params{tbl} is Compilation
sub printArtistSelect {
  my ($matches) = @_;

  &printHead({name=>'PlayList'}, $cgi, $user, 1);
  print <<DONE;
More than one match: select one.

<form action="playlist.cgi" method="$METHOD">
<select name="$$tblSearch{name}ID" size="5">
DONE
  ;
  for (0..$#$matches) {
    print "  <option value=\"",$$matches[$_]->{"$$tblSearch{name}ID"},"\">",substr($$matches[$_]->{$$tblSearch{name}},0,30),"</option>\n";
  }
  print <<DONE
</select>
<input type="hidden" name="mode" value="search" />
<input type="hidden" name="session" value="$$params{session}" />
<input type="hidden" name="id" value="$$params{id}" />
<input type="hidden" name="tbl" value="$$params{tbl}" />
<input type="hidden" name="debug" value="$$params{debug}" />
<br>
<input type="submit" value="Select $$params{tbl}" />
<input type="hidden" name="action" value="Select $$params{tbl}" />
</form>

<h2>OR...</h2>
Execute a new search:<br />
DONE
  ;

}

sub printArtistEntry {

  &printHead({name=>'PlayList'}, $cgi, $user, 1);

  my $shortname = substr(lc $$params{search}, 0, 6);
  print "<h2>$$params{tbl} not found</h2>

<form action=\"playlist.cgi\" method=\"$METHOD\"";
  print ' target="rows"' if $$params{tbl} eq 'Compilation';
  print <<DONE;
>
Enter a new $$params{tbl}:<br />
<input type="text" name="$$params{tbl}" value="$$params{search}">
<p>
DONE
  if ($$params{tbl} eq 'Artist') {
    print '...and a 6-character alphabetization index:<br />
<input type="text" name="ShortName" value="',$shortname,'" /><br />
<input type="hidden" name="mode" value="search" />', "\n";
  } else {
    print '...and the track that was played on the Comp:<br />
<input type="text" name="TrackName" />
<input type="hidden" name="mode" value="rows" />
</p>
';
  }
  print <<DONE;
<input type="hidden" name="action" value="Add $$params{tbl}" />
<input type="hidden" name="session" value="$$params{session}" />
<input type="hidden" name="id" value="$$params{id}" />
<input type="hidden" name="PlayListID" value="$$params{id}" />
<input type="hidden" name="debug" value="$$params{debug}" />

<input type="submit" value="Add $$params{tbl}" />
</form>

DONE

}

sub printAlbumSelect {

  &printHead({name=>'PlayList'}, $cgi, $user, 1);
  my $artist = &sqlSelectRow({table=>'Artists'}, ['Artist'],
			     {string=>'ArtistID = ?', values=>[$$params{ArtistID}]},
			     undef, $$params{debug});
  print <<DONE;
Artist: <b>$$artist{Artist}</b>
<form action="playlist.cgi" method="post" target="rows">
<input type="hidden" name="ArtistID" value="$$params{ArtistID}">
DONE

  require "album.pl";
  my $tblAlbum = &TblInit;

  my($albums) =
    &sqlSelectMany($tblAlbum, [ 'AlbumID', 'Album', 'Year' ],
		   { string=>'ArtistID = ?', values=>[$$params{ArtistID}] },
		   'Year DESC, DateAdded DESC, Album',
		   { nolookup=>1, debug=>$$params{debug} });

  print <<DONE;
<p>
Either choose an album from the library:
</p>
<select name="AlbumID" size="5">
DONE
  ;
  for (0..$#$albums) {
    print "  <option value=\"$$albums[$_]->{AlbumID}\">$$albums[$_]->{Album}</option>\n";
  }
  print <<DONE
</select>
<p>
Or enter an album not listed above:<br />
<input type="text" name="AltAlbum"><br />
...or just skip the album.
</p><p>
Finally, enter a TrackName:<br />
<input type="text" name="TrackName"><br />
<br />
<input type="hidden" name="mode" value="rows" />
<input type="hidden" name="session" value="$$params{session}" />
<input type="hidden" name="PlayListID" value="$$params{id}" />
<input type="hidden" name="id" value="$$params{id}" />
<input type="hidden" name="debug" value="$$params{debug}" />
<input type="submit" value="Add Play" />
<input type="hidden" name="action" value="Add Play" />
</form>

<h2>OR...</h2>
Execute a new search:<br />
DONE
  ;
  $$params{ArtistID} = undef;

}

sub printCompPlay {

  &printHead({name=>'PlayList'}, $cgi, $user, 1);
  my $comp = &sqlSelectRow({table=>'Albums'}, ['Album'],
			   {string=>'AlbumID = ?', values=>[$$params{AlbumID}]},
			   undef, $$params{debug});
  print <<DONE;
Compilation: <b>$$comp{Album}</b>
<form action="playlist.cgi" method="get" target="rows">
<input type="hidden" name="ArtistID" value="$VA_ID" />
<input type="hidden" name="AlbumID" value="$$params{AlbumID}" />
<p>
Enter a TrackName:<br />
<input type="text" name="TrackName" />
</p>
<input type="hidden" name="session" value="$$params{session}" />
<input type="hidden" name="mode" value="rows" />
<input type="hidden" name="PlayListID" value="$$params{id}" />
<input type="hidden" name="id" value="$$params{id}" />
<input type="hidden" name="debug" value="$$params{debug}" />
<input type="submit" value="Add Play" />
<input type="hidden" name="action" value="Add Play" />
</form>

<h2>OR...</h2>
Execute a new search:<br />
DONE
  ;
  $$params{ArtistID} = undef;

}

sub printPlaysText {
  my ($edit) = @_;

  require "playlist.pl";
  my($playlist) = &sqlSelectMany(&TblInit, undef,
			      {string=>'PlayListID = ?', values=>[$$params{id}]},
			      undef, {debug=>$$params{debug}});
  $$playlist[0]->{StartTime} =~ /(\d{4})-(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d)/;
  my ($startdate, $starttime) = ("$2-$3-$1", "$4:$5");
  $$playlist[0]->{EndTime} =~ /(\d{4})-(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d)/;
  my ($enddate, $endtime) = ("$2-$3-$1", "$4:$5");
  my $comment = $$playlist[0]->{Comment};

  print "<textarea name=\"Plays\" rows=\"20\" cols=\"80\">";
  print "Program: ".$$playlist[0]->{Program}."\n";
  print "Date: ".$startdate." , ".$starttime." to ".$enddate." , ".$endtime."\n";
  print $comment."\n\n";

  print "Editing mode ON<br />\n" if $edit and $$params{debug};
  # We're going to concatenate AltAlbum into Album_
  $$tbl{shortorder} = [ 'Artist', 'Album', 'TrackName' ];

  # The following select finds all records that have the right PlayListID
  # and are from yesterday onward (to account for overnight shows).
  # That nasty hackish item in the list of fields concatenates the 2 fields
  # so we can display them in one field later.

  my ($rows) =
#    &sqlSelectMany($tbl, [@{$$tbl{order}}, 'concat(Albums.Album, "") as Album'],
#    &sqlSelectMany($tbl, [@{$$tbl{order}}, 'IF (STRCMP(Plays.AltAlbum,""), Albums.Album, Plays.AltAlbum) as Album'],
 
&sqlSelectMany($tbl, [@{$$tbl{order}}, 'IF (STRCMP(Plays.AltAlbum,""), Plays.AltAlbum, Albums.Album) as Album'],
#concat(Albums.Album, Plays.AltAlbum) as Album'],
		   {string=>'PlayListID = ?',
		    values=>[ $$params{id} ]},
		   $$params{sortby}, {debug=>$$params{debug}});

  foreach my $row (@$rows) {
      print $row->{Artist}." -- ".$row->{Album}." -- ".$row->{TrackName}."\n";
  }
  print "</textarea>";

}

sub printPlays {
  my ($edit) = @_;

  print "Mode = rows<br />\n" if $$params{debug};
  require "playlist.pl";
  my($playlist) = &sqlSelectMany(&TblInit, undef,
			      {string=>'PlayListID = ?', values=>[$$params{id}]},
			      undef, {debug=>$$params{debug}});
  $$playlist[0]->{StartTime} =~ /(\d{4})-(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d)/;
  my ($startdate, $starttime) = ("$2-$3-$1", "$4:$5");
  $$playlist[0]->{EndTime} =~ /(\d{4})-(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d)/;
  my ($enddate, $endtime) = ("$2-$3-$1", "$4:$5");
  my $comment = $$playlist[0]->{Comment};

  if ($edit) {
      print <<DONE;

<base target="_new" />

<form action="playlist.cgi" method="$METHOD" target="_self">
<input type="hidden" name="action" value="times" />
<input type="hidden" name="mode" value="rows" />
<input type="hidden" name="id" value="$$params{id}" />
<input type="hidden" name="session" value="$$params{session}" />
<input type="hidden" name="debug" value="$$params{debug}" />
<input type="hidden" name="UserID" value="$$playlist[0]->{UserID}" />
<input type="hidden" name="ProgramID" value="$$playlist[0]->{ProgramID}" />

<table border="0" cellpadding="0">
  <tr>
    <td align="right">Name:</td>
    <td align="left" colspan="2"><a href="display.cgi?tbl=User&amp;UserID=$$playlist[0]->{UserID}" target="_blank">$$playlist[0]->{User}</a></td>
    <!--td rowspan="3" valign="center"><h2>Music Log</h2></td-->
  </tr>
  <tr>
    <td align="left"><b>Start:</b></td>
    <td align="right">Time <input type="text" name="StartTime" value="$starttime" /></td>
    <td align="right">Date <input type="text" name="StartDate" value="$startdate" /></td>
  </tr>
  <tr>
    <td align="left"><b>End:</b></td>
    <td align="right">Time <input type="text" name="EndTime" value="$endtime" /></td>
    <td align="right">Date <input type="text" name="EndDate" value="$enddate" /></td>
  </tr>
  <tr>
    <td colspan="3" align="right">
      Comment: <input type="text" name="Comment" value="$comment" size="50" /><br />
      <input type="submit" value="Change information" />
    </td>
  </tr>
</table>
</form>

DONE
    ;
  } else {
      print <<DONE;
<table border="0" cellpadding="0">
  <tr>
    <th align="right">Program:</th>
    <td align="left" colspan="2">$$playlist[0]->{Program}</td>
    <!--td rowspan="3" valign="center"><h2>Music Log</h2></td-->
  <tr>
    <th align="left">Start:</th>
    <td align="right">Time: $starttime</td>
    <td align="right">Date: $startdate</td>
  </tr>
  <tr>
    <th align="left"><b>End:</th>
    <td align="right">Time: $endtime</td>
    <td align="right">Date: $enddate</td>
  </tr>
  <tr>
    <td colspan="3">$comment</td>
  </tr>
</table>
</form>

DONE
    ;
  }

  print "Editing mode ON<br />\n" if $edit and $$params{debug};
  # We're going to concatenate AltAlbum into Album_
  $$tbl{shortorder} = [ 'Artist', 'Album', 'TrackName' ];
  &printTitles($tbl, $cgi, {edit=>$edit});
#  $$tbl{shortorder} = [ 'Artist', '_Album', 'TrackName' ];

  # This is a setup so that we can put little edit links by the
  # AltAlbum tracks--they would pop up a window to add the album
  # when clicked.
  my $editlinks = $$tbl{edit};
  my @altlinks = @{$editlinks};
  # the folliwng line does NOT change $$tbl{edit} or $editlinks!
  push @altlinks,
    { img=>'pencil',
      url=>'playlist.cgi?mode=rows&amp;id=*fields.PlayListID" target="_self" onclick="window.open('."'".'playentry.cgi?Time=*fields.Time&amp;id=*fields.PlayListID&amp;Album=*fields.AltAlbum&amp;ArtistID=*fields.ArtistID&amp;Status=Library'."');",
      caption=>"Add this Album to the Database",
    };

  # The following select finds all records that have the right PlayListID
  # and are from yesterday onward (to account for overnight shows).
  # That nasty hackish item in the list of fields concatenates the 2 fields
  # so we can display them in one field later.

  my ($rows) =
 
&sqlSelectMany($tbl, [@{$$tbl{order}}, 'IF (STRCMP(Plays.AltAlbum,""), Plays.AltAlbum, Albums.Album) as Album'],
		   {string=>'PlayListID = ?',
		    values=>[ $$params{id} ]},
		   $$params{sortby}, {debug=>$$params{debug}});

  for (0..$#$rows) {
      $$tbl{edit} = $editlinks;
      $$tbl{edit} = \@altlinks if $$rows[$_]->{AltAlbum};
      
      &printRow($tbl, $cgi, $user, $$rows[$_],
		{row=>$row, edit=>$edit, nodefaults=>1, debug=>$$params{debug}});
      $row = not $row;
  }
  
  print "</table>\n\n";
  
  print '
<p>
<a href="playlist.cgi?mode=rows&amp;id=',$$params{id},'" target="_blank" name="bottom">No editing controls</a> | 
<a href="playlist.cgi?mode=rowstext&amp;id=',$$params{id},'" target="_blank" name="bottom">Text version</a>
</p>
' if $edit;
  #print "<p><a name=\"bottom\">foo</a></p>\n\n";
  &printFoot($tbl, $cgi);
  
}




