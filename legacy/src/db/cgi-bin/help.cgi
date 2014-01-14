#!/usr/bin/perl

# Contextual help page. Just a big switch that prints out appropriate
# help for the current page.

use lib "$ENV{WWW_SITE}/perl-lib";
use lib "$ENV{WWW_SITE}/perl-lib/tables";
require 'interface.pl';
require 'login.pl';

use CGI;

my($cgi) = new CGI;
my $params = $cgi->Vars;

$user = &loginSession($$params{session});
&printHead($tbl, $cgi, $user);
print '<table border="0" width="500"><tr><td>',"\n\n";

if ($$params{pg} eq 'PlayList') {

print <<DONE;

<h1>Playlist Help</h1>

<p><b>To start a playlist</b>, click on "Home" (above) and then "Start a new
playlist". This will start a playlist for the show on the closest
date to today. If a playlist for that day already exists, then select
it from the popup menu next to the "Show Old Playlist" Button. At this
time, only the DJ who's designated as the main DJ for the show can
start a playlist for it (we're working on this). If you're doing random
schedule or some other unscheduled show, you can click "Start a Playlist
for a Random Show" instead, and you'll get a blank playlist where you're
required to enter the dates and times.</p>

<p><b>To add a play</b>, you must start by searching for the artist that 
recorded the play, or the comp name, if the play was from a compilation.
The search field is in the left frame. With an artist search, you'll 
either see a list of artists that match, or if there's only one matching
artist, a list of albums. If the album isn't on the list, enter your album
in the field below the list--the album will entered into your playlist,
but not into the database at this time. Finally enter the track name,
and click "Add Play". The play will be shown in the frame on the right,
and you can then start a new search at the bottom of the left frame.</p>

<p><b>In the right frame</b>, you can change the starting and ending dates
and times if your show is not at the normal time.</p>

<p><b>To the right of the playlist</b> display are several icons. Click the
trash can to delete a track (you won't be asked for confirmation, so be
careful). The "B" icon indicates whether the track is counted as a
bin cut--remember that 3 of these are required per hour. The "R" icon
indicates that a track was a request--click it to toggle the status.
The last icon is simply a mark--use it, for example, to indicate when
you last read the tracks you played. The request and mark icons are
simply for your benefit. None of the icons show up on the playlists
that are available to the public.</p>

<p><b>When you are finished</b> entering a playlist, just close the window or
click on a navigation link at the top to go somewhere else. You can
always get back to a playlist to edit it from the welcome page.</p>

DONE

}

print <<DONE;

<h1>General Help</h1>

<p>At the top of each page are several navigation links, and usually
a search field.</p>

<p>"Home" will take you to your welcome page, where you
can access all the functions you need as a DJ. If there are other things
that you need to do in the database (such as bin entry and program
scheduling), email <a href="mailto:ism\@wrct.org">ism\@wrct.org</a>
to get those functions activated.</p>

<p>"Log Out" will log you out of the database and return you to the
login page. (Currently, clicking the Back button on your browser will
return you to where you were.)</p>

<p>"Schedule" will take you to the Program Guide web page. This is
the same page that is available to the public, except that you will
be logged in under your account, with the associated privileges
(such as editing your own program and user account).</p>

<p>"Help" will give you this information, as well as information
specific to whatever page you are on.</p>

<p>The search field allows you to search various tables in the database.
For more information on how to use the search results, make a search
and then click "Help".</p>

</td></tr></table>

DONE

&printFoot($tbl, $cgi, $user);
