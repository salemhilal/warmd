#!/usr/bin/perl

# Takes: Time and PlayListID of the Play, plus all info necessary for the Album entry
# Generates a frame containing the Album entry
# Instructs user to click button that will close window and update playlist

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
my $debug;
$debug = '&amp;debug=1' if $$params{debug};

require "play.pl";
my $play = TblInit();
require "album.pl";
my $album = TblInit();

$user = loginSession($$params{session});

if (not AuthGTE($$user{AuthLevel}, 'User')) {
  printHead($album, $cgi, $user);
  error('You are not authorized to add an album. Please email <a href="mailto:ism@wrct.org">the ISM</a> if you think this is a mistake');
}

if ($$params{action} eq 'directions') {	# Print directions for album entry

  printHead({name=>'PlayList'}, $cgi);
  print <<DONE;
<p>
Enter an album using the form below. ONLY ENTER ALBUMS THAT ARE PHYSICALLY
IN THE LIBRARY. Ignore the "Date Added" and "Date Removed" fields. When you
finish, click the "Done" button to close this window and update your playlist.
</p>
<form action="playentry.cgi" method="$METHOD" target="_top">
<input type="hidden" name="session" value="$$params{session}" />
<input type="hidden" name="id" value="$$params{id}" />
<input type="hidden" name="Time" value="$$params{Time}" />
<input type="hidden" name="PlayListID" value="$$params{PlayListID}" />
<input type="hidden" name="action" value="done" />
<input type="submit" value="Done" />
</form>
DONE
  printFoot({name=>'PlayList'}, $cgi);

} elsif ($$params{action} eq 'done') {	# Finished with the album entry

  printHead($album, $cgi);

  my $row = &sqlSelectRow($album, [ "MAX(AlbumID) AS AlbumID" ], undef, undef, 1);
  sqlUpdate($play,
	    { AlbumID=>$$row{AlbumID}, AltAlbum=>'' },
	    { string=>"PlayListID = ? AND Time = ?",
	      values=>[ $$params{id}, $$params{Time} ] },
	    1);

  print <<DONE;

<p>Album with id <tt>$$row{AlbumID}</tt> created.</p>
<script language="Javascript">
window.opener.location = 'playlist.cgi?session=$$params{session}&mode=rows&id=$$params{id}';
window.close();
</script>

DONE
  printFoot($album, $cgi);

} else {				# Print the frameset

  print $cgi->header;
  print <<DONE;
<!DOCTYPE html
     PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN"
     "DTD/xhtml1-frameset.dtd">

<html>

<head>
   <meta name="Author" content="Joel Young" />
   <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
   <title>Album entry (from Playlist)</title>
</head>

<frameset rows="30%,*">
  <frame name="search" src="playentry.cgi?session=$$params{session}&amp;id=$$params{id}&amp;action=directions&amp;Time=$$params{Time}&amp;PlayListID=$$params{PlayListID}$debug" />
  <frame name="rows" src="entry.cgi?session=$$params{session}&amp;tbl=Album&amp;ArtistID=$$params{ArtistID}&amp;Album=$$params{Album}$debug" />
</frameset>

</html>
DONE

}
