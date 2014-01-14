#!/usr/bin/perl

# Check the past 24 hours for people who haven't been playing
# their bin cuts. Also, check that dj-type shows *have* playlists.

my $foo = '/Users/reverie/bincuts';

# Space-delimited list of emails to send the report to
my $EMAIL = 'ism@wrct.org intmusic@wrct.org, wy09@wrct.org';
my $CUTSPERHOUR = 3;
my $PLAYLIST = 'http://reverie.vi.ri.cmu.edu/cgi-bin/wrct/playlist.cgi';
my $PROGRAM = 'http://reverie.vi.ri.cmu.edu/cgi-bin/wrct/display.cgi?tbl=Program';
my $MAIL = "|mail -s 'Bin Cuts Report' $EMAIL";

use lib "/DBInterface/wrct/perl-lib";
use lib "/DBInterface/wrct/perl-lib/tables";
use Time::Local;

require 'sql.pl';
require 'misc.pl';

require 'program.pl';
our $program = &TblInit;
require 'playlist.pl';
our $playlist = &TblInit;
require 'play.pl';
our $play = &TblInit;

# We're going to assume for this script that no shows are longer than 24 hours.
# If there are, I'm sure that exceptions will be made for them, anyway.

my $now = `date +'%Y-%m-%d 00:00:00'`; chop $now;	# The current day
my $start = DateAdd($now, {day=>-1});
my $end = $now;
my $dow = (localtime(time - 24*60*60))[6] + 1; # get and index between 1 and 7

# Select start and end times
my ($rows) = &sqlSelectMany($playlist, [qw(StartTime EndTime ProgramID PlayListID)],
			    {string=>'StartTime BETWEEN ? AND ?',
			     values=>[$start, $end] },
			    undef,
			    {nolookup=>1, debug=>1});

# Use this to keep track of what shows have playlists for the week
my %playlists;

my $text;

# Loop over all playlists checking counts.
foreach my $row (@$rows) {

  $playlists{$$row{ProgramID}} = 1;

  $$row{StartTime} =~ /\d\d\d\d-\d\d-\d\d (\d\d):(\d\d):\d\d/;
  my $start = $1;
  my $startmin = $2;
  $$row{EndTime} =~ /\d\d\d\d-\d\d-\d\d (\d\d):(\d\d):\d\d/;
  my $end = $1;
  my $hours = ($end-$start) % 24;
  $hours++ if $2 and $2 > $startmin;	# round up the hours
  my $cuts = $hours * $CUTSPERHOUR;

  my $cnt = &sqlSelectRow($play, ['COUNT(*) AS BinCuts'],
			     { string=>"PlayListID = ? and B = 'Yes'",
			       values=>[$$row{PlayListID}] },
			  undef, undef);
  if ($$cnt{BinCuts} < $cuts) {
    my $prog = ProgramName($$row{ProgramID});
    $text .= <<DONE;
There were only $$cnt{BinCuts} bin cuts for the show '$prog',
and $cuts were expected between $$row{StartTime} and $$row{EndTime}.
$PLAYLIST?id=$$row{PlayListID}

DONE
  }

}

# Check which shows had no playlists
# by seeing if each programid is defined in %playlists
($rows) = sqlSelectMany($program, ['ProgramID', 'Program'],
			{string=>'DAYOFWEEK(StartTime) = ? AND Type = ?',
			 values=>[$dow, 'show']},
			undef, {nolookup=>1, debug=>0});
foreach my $row (@$rows) {
  $text .= <<DONE unless $playlists{$$row{ProgramID}};
The show '$$row{Program}' had no playlist.
$PROGRAM\&ProgramID=$$row{ProgramID}

DONE
}

$text = "Everyone did fine!\n" unless $text;
$text = "For the period from $start to $end:\n\n" . $text;

`touch $foo`;

# Now send the mail
open MAIL, $MAIL;
print MAIL $text;
close MAIL;

########################################################################
# Helper functions
########################################################################

sub ProgramName {
  my ($id) = @_;

  my $row = &sqlSelectRow($program, ['Program'],
			  {string=>'ProgramID = ?',values=>[$id]});
  return $$row{Program};
}
