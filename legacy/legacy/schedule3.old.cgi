#!/usr/bin/perl

# Scheduling page -- displays a week calendar schedule of programs
# modified april 2009 by ams1@wrct.org just by chopping stuff out schedule.cgi

use lib "$ENV{WWW_SITE}/perl-lib";
use lib "$ENV{WWW_SITE}/perl-lib/tables";
require "sql.pl";
require "interface.pl";
require "record.pl";
require 'login.pl';
require 'search.pl';
require 'misc.pl';
require 'task.pl';
require 'calendar3.pl';

require 'program.pl';
$tbl = &TblInit;
push @{$$tbl{order}};

use CGI;
my($cgi) = new CGI;
my $params = $cgi->Vars;
my $sortby = ($$params{sortby} or 'GenreID,Artists.ShortName');

$user = &loginSession($$params{session});
#&printHead({name=>'Schedule'}, $cgi, $user);

#&printTaskSelect($cgi, $user, 'bin');

# can the user edit the schedule?
$edit = &AuthGTE($$user{AuthLevel}, 'Exec');

my $schedule = &calendarGen($tbl, $$params{debug});

# simple version, just displays info in each cell

print <<DONE;

<table id="schedule" border="1"> 
  <tr>
    <th></th>
    <th>Sunday</th>
    <th>Monday</th>
    <th>Tuesday</th>
    <th>Wednesday</th>
    <th>Thursday</th>
    <th>Friday</th>
    <th>Saturday</th>
    <th></th>
  </tr>
DONE

foreach $hour (0..23) {
foreach $min (0,30) {
  # make a pretty-print hour
  my $dispHour = ($hour%12 ? $hour%12 : 12) . ':' . ($min ? '30' : '00') . ($hour < 12 ? 'AM' : 'PM');
  print "  <tr>\n    <th class=\"hour\">$dispHour</th>\n";

  foreach $day (0..6) {
    my $slot = $schedule->[$day]->[$hour]->[$min];

    # in order to use rowspans, we can't print 2nd, 3rd, etc. instances of a slot
    if ($hour == 0 or #$$slot{Type} eq 'dead' or
	$$slot{ProgramID} ne $schedule->[$day]->[$hour-1]->[$min]->{ProgramID}) {

      my $duration, $durationH, $durationM, $dow, $icon, $title;
      if ($$slot{StartTime}) { # slot comes from database (show or pa)

	$$slot{StartTime} =~ /^(\d{4})-(\d\d)-(\d\d) (\d\d)/;
	$dow = &DOW($1, $2, $3); # get the day of week that the show starts
	$durationH = $$slot{DurationH} # the total duration
	    # account for day wrapovers by subtracting the start hour from the current hour:
	    - ($day*24+$hour - ($dow*24+$4))
	    # and account for week wrapovers by using the modulo:
	    % (7*24);
        $durationM = $$slot{DurationM} ? 1 : 0;

	# this is the duration of the first half of a show that spans days
	$durationH = 24-$hour if $durationH > 24-$hour;

        $duration = $durationH + $durationM;

	$icon = "<a href=\"delete.cgi?session=$$params{session}&amp;tbl=Program&amp;ProgramID=$$slot{ProgramID}\">". &img('trash'). '</a>' if $edit;
	$title = "<a class=\"showname\" href=\"http://db.wrct.org/display.cgi?session=$$params{session}&amp;tbl=Program&amp;ProgramID=$$slot{ProgramID}\">$$slot{Program}</a>";
      # we need to insert genre lists here once they get entered into the db
	my ($genres, $gcount) = &sqlSelectMany({table=>'ProgramGenres'}, ['SubGenreID', 'ProgramGenre'],
				    {string=>'ProgramID = ?', values=>[$$slot{ProgramID}]},
				    'ProgramGenreID', {debug=>$$params{debug}, count=>1});
	$genrelist = join(', ', map{$$_{SubGenre} or $$_{ProgramGenre}} @$genres);
      } else { # dead air

	$duration = $$slot{DurationH} + ($$slot{DurationM} ? 1 : 0);

	# fill in a bunch of defaults for dead slots
	$$slot{StartTime} = $$slot{EndTime} = &DOW2date($day);
	$$slot{StartTime} .= '+'.sprintf('%2.2d', $hour).':00:00';
	$$slot{EndTime} .= '+'.sprintf('%2.2d', $hour+1).':00:00';

	$icon = "<a href=\"entry.cgi?session=$$params{session}&amp;tbl=Program&amp;StartTime=$$slot{StartTime}&amp;EndTime=$$slot{EndTime}\">". &img('pencil') . '</a>' if $edit;
	$title = $$slot{Program}; # dead air is not a show (despite the joke), so no link
	$genrelist = '';
      }

      print "    <td rowspan=\"$duration\" class=\"$$slot{Type}\">\n";
      print "$duration $day $hour\n" if $$params{debug};
      print "      $title<br />\n";
      print "      <span class=\"showhost\">$$slot{DJName}</span><br />\n" if $$slot{DJName};
#      print "      <span class=\"showgenres\">$genrelist</span>\n" if $genrelist;
      print "    </td>\n";



      # for some reason my() isn't scoping the way I want, so just undefine them:
      ($duration, $dow, $icon, $title, $genrelist) = (undef, undef, undef);
    }
  }

#  print "    <th>$dispHour</th>\n";
  print "  </tr>\n";
}
}
#print <<DONE;
#  <tr>
#    <th></th>
#    <th>Sunday</th>
#    <th>Monday</th>
#    <th>Tuesday</th>
#    <th>Wednesday</th>
#    <th>Thursday</th>
#    <th>Friday</th>
#    <th>Saturday</th>
#    <th></th>
#  </tr>
#DONE

print "</table>\n";

#&printFoot({name=>'Schedule'}, $cgi, $user);