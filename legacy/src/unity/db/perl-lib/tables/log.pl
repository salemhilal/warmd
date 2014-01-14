require 'sql.pl';
require 'form.pl';

sub TblInit {

  my $tblDescription =
{
 name   => 'Log',
 table  => 'Logs',
 fields => { StartTime	=> { longname=>'Start Time of Log Entry', type=>'time' },
	     EndTime	=> { longname=>'End Time of Log Entry', type=>'time' },
	     PlayListID	=> { longname=>'Program ID', type=>'choose' },
	     Source	=> { longname=>'Source',
			     type=>'enum',
			     values=> [ 'L', 'REC', 'REM', 'AP' ] },
	     Type	=> { longname=>'Type',
			     type=>'enum',
			     values=> [ 'PRO', 'PSA', 'E', 'PA', 'N' ] },
	     Log	=> { longname=>'Text of Log Entry' },
	   },
 ID     => 1,
 sortby => 'StartTime, EndTime',
 order  => [ qw( StartTime EndTime PlayListID Source Type Log ) ],
};
  return $tblDescription;
}

1;
