require 'sql.pl';
require 'form.pl';

sub TblInit {

  my $tblDescription =
{
 name   => 'GuestEpisode',
 table  => 'GuestEpisodes',
 fields => { GuestID	 => { longname=>'Guest ID' },
	     ProgramID	 => { longname=>"Program ID" },
	     PAEpisodeID => { longname=>'PA Episode ID'},
	   },
 ID     => 1,
 sortby => 'ProgramID,GuestID,PAEpisodeID',
 order  => [ qw( ProgramID GuestID PAEpisodeID ) ],
 shortorder => [ qw( ProgramID GuestID PAEpisodeID ) ],
 edit   => [ { img=>'folderwrite',
	       url=>'entry.cgi?tbl=ProgramGenre&amp;ProgramID=*fields.ProgramID',
	       caption=>"Add a Genre to this Program",
	     },
	   ],
 search	=> [ 'GuestEpisode' ],
 dependents => [ ],
};
return $tblDescription;
}

1;
