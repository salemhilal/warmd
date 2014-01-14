require 'sql.pl';
require 'form.pl';

sub TblInit {

  my $tblDescription =
{
 name   => 'ProgramGenre',
 table  => 'ProgramGenres',
 fields => { ProgramGenre => { longname=>'Custom Genre List' },
	     SubGenreID	=> { longname=>'SubGenre ID', type=>'choose' },
	     ProgramID	=> { longname=>'Program Name', type=>'search' },
	   },
 ID     => 1,
 sortby => 'SubGenreID,ProgramGenre',
 order  => [ qw( ProgramGenre SubGenreID ProgramID ) ],
};
  return $tblDescription;
}

1;
