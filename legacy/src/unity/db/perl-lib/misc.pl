# Miscellaneous functions that didn't fit anywhere else
use Time::Local;
use POSIX;

# This would be a #define in C. Just switches 'No' to 'Yes' and 'Yes' to 'No'.
# (NO MEANS YES! NO MEANS YES!)
sub revBool {
  my ($b) = @_;
  return ($b eq 'Yes' ? 'No' : 'Yes');
}

# Finds the nearest date that's on the same day of week as given date
# takes and returns yyyy-mm-dd hh:mm:ss
sub findDateDOW {
  my ($date) = @_;
  $date =~ /(\d{4})-(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d)/ or return undef;
  my ($y, $mon, $d, $h, $min, $s) = ($1, $2-1, $3, $4, $5, $6);

  my $secs = timelocal($s, $min, $h, $d, $mon, $y);
  my $secsinwk = 60 * 60 * 24 * 7;

  # $weeks is the integer number of weeks since $date
  my $weeks = int( (time + $secsinwk/2 - $secs) / $secsinwk );

  # fucking daylight savings time
  my $isolddst = (localtime($secs))[8];
  my $isnewdst = (localtime())[8];
  my $dst = ($isolddst - $isnewdst) * 60*60;

  ($s, $min, $h, $d, $mon, $y) = localtime($secs + $weeks*$secsinwk + $dst);

  return (($y+1900).'-'
	  .sprintf("%2.2d",$mon+1).'-'
	  .sprintf("%2.2d",$d).' '
	  .sprintf("%2.2d",$h).':'
	  .sprintf("%2.2d",$min).':'
	  .sprintf("%2.2d",$s));
}

#returns numeric day of week, with Sunday = 0, Wednesday = 3, etc
sub DOW {
  my ($y, $m, $d) = @_;
  $m = 1 unless $m>0;
  $d = 1 unless $d>0;

  my $secs = timelocal(0, 0, 0, $d, $m-1, $y);
  return (localtime $secs)[6];
}
# returns nearest date as yyyy-mm-dd from numeric day of week
sub DOW2date {
  my ($dow) = @_;

  my $today = (localtime)[6];
  my $secs = time - ($today - $dow)%7*60*60*24;
  my ($d, $m, $y) = (localtime $secs)[3,4,5];
  return (1900+$y) . '-' . sprintf('%2.2i',$m+1) . '-' . sprintf('%2.2i',$d);
}

sub printDOWSelect {
  my ($dow, $fieldname) = @_;
  my @days = qw(Sunday Monday Tuesday Wednesday Thursday Friday Saturday);

  print '<select name="',$fieldname
,'_dow">',"\n";
  for (0..$#days) {
    print ("<option value=$_",
	   ($_ == $dow ? ' SELECTED' : ''),
	   ">$days[$_]</option>\n");
  }
  print "</select>\n";

}

###################################
# DESCRIPTION:	Date arithmetic. Adds some number of days, hours, minutes, and seconds
#		to a supplied date.
# ARGUMENTS:	$date - the date as a yyyy-mm-dd hh:mm:ss string
#		$delta - hashref represents change in date
#		       - hash keys: year, month, day, hr, min, sec
# RETURN value:	the calculated date as a yyyy-mm-dd hh:mm:ss string
###################################
sub DateAdd {
  my ($date, $delta) = @_;
  $date =~ /(\d{4})-(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d)/ or return undef;
  my ($y, $mon, $d, $h, $min, $s) = ($1, $2-1, $3, $4, $5, $6);

  my $secs = timelocal($s, $min, $h, $d, $mon, $y);
  $y += floor(($mon + $$delta{mon})/12);
  $mon = ($mon + $$delta{mon}) % 12;
  my $newsecs = timelocal($s, $min, $h, $d, $mon, $y);

  $newsecs += $$delta{sec} + 60*($$delta{min} + 60*($$delta{hr} + 24*$$delta{day}));

  # fucking daylight savings time
  my $isolddst = (localtime($secs))[8];
  my $isnewdst = (localtime($newsecs))[8];
  my $dst = ($isolddst - $isnewdst) * 60*60;

  ($s, $min, $h, $d, $mon, $y) = localtime($newsecs + $dst);

  return (($y+1900).'-'
	  .sprintf("%2.2d",$mon+1).'-'
	  .sprintf("%2.2d",$d).' '
	  .sprintf("%2.2d",$h).':'
	  .sprintf("%2.2d",$min).':'
	  .sprintf("%2.2d",$s));
}

1;
