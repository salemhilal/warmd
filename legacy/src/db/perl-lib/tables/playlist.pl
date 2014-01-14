require 'sql.pl';
require 'form.pl';

sub TblInit {

  my $tblDescription =
{
 name   => 'PlayList',
 table  => 'PlayLists',
 fields => { ProgramID	=> { longname=>'Program ID', type=>'choose' },
	     UserID	=> { longname=>'User', type=>'search' },
	     StartTime	=> { longname=>'Start Time/Date of Show', type=>'time' },
	     EndTime	=> { longname=>'End Time/Date of Show', type=>'time' },
	     Comment	=> { longname=>'Comment' },
	   },
 ID     => 1,
 sortby => 'StartTime DESC',
 order  => [ qw( ProgramID UserID StartTime EndTime Comment ) ],
 shortorder  => [ qw( PlayList StartTime EndTime ) ],
 lists  => {
     Play	=> {},
 },
 dependents => [ 'Log', 'Play' ],
};
  return $tblDescription;
}

1;
