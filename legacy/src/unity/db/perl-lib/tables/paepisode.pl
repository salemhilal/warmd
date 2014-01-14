require 'sql.pl';
require 'form.pl';

sub TblInit {

  my $tblDescription =
{
 name   => 'PAEpisode',
 table  => 'PAEpisodes',
 fields => { ProgramID	=> { longname=>'Program ID' },
	     Name       => { longname=>'Name Of The Episode' },
	     StartTime	=> { longname=>'Start Time/Date of Show', type=>'dow_time' },
	     EndTime	=> { longname=>'End Time/Date of Show', type=>'dow_time' },
	     RecordingLocation => { longname=>'Where This Episode Was Recorded' },
	     Subject	=> { longname=>'Subject Of This Episode', },
	     Notes      => { longname=>'Notes For The Show Host', },
	     Photo      => { longname=>'Photo Associated With This Episode' },
	   },
 ID     => 1,
 sortby => 'Date, StartTime, EndTime',
 order  => [ qw( ProgramID Name Date StartTime EndTime RecordingLocation Subject Notes Photo ) ],
 shortorder => [ qw( ProgramID Name StartTime EndTime ) ],
 edit   => [ ],
 lists => { },
 search	=> [ ],
 dependents => [ ],
};
  return $tblDescription;
}

1;
